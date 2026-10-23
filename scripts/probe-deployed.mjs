#!/usr/bin/env node
/**
 * Deployment probe — read-only, no verdict.
 * ------------------------------------------------------------------
 * The 31 `docker` rows are only reachable through a `cloudflared` connector
 * running on the machine that hosts the containers. When that machine is
 * offline the domains still resolve and still answer — with a Cloudflare error
 * page — so "the page did not load" says nothing about the service. It says
 * something about *which link in the chain* broke, and that is the only thing
 * this script records.
 *
 * Classification is by Cloudflare's own error codes, which the edge puts in the
 * body of the page it generates (`error code: 1033`, `error code: 502`):
 *
 *   530 / 1033  the tunnel has no healthy cloudflared instance connected to
 *               Cloudflare's network — nothing on the Cloudflare side can hand
 *               the request to anything. (connector side / origin machine)
 *   502         the tunnel *is* connected, but cloudflared cannot reach the
 *               origin service named in its ingress rule. (origin side only)
 *
 *   https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/troubleshoot-tunnels/common-errors/
 *
 * Three things this deliberately is not:
 *
 *   - A monitor. By default nothing is written outside `.scratch/` (gitignored).
 *     The one wired use is `npm run probe -- --out dist/probe.json`: both deploy
 *     workflows run it after the build and ship the snapshot beside the site, so
 *     the 自部署服务 page can state what the last publish observed. The repo is
 *     public and the snapshot is never committed — committed probe snapshots
 *     would archive an uptime history nobody asked to publish.
 *   - An up/down oracle. `ssh` answers 302 into `cdn-cgi/access/login` because
 *     Cloudflare Access is doing its job, and a router answering 307 → `/chat`
 *     is a healthy service asking for a path. Neither is a fault, so 3xx is its
 *     own class rather than a failure.
 *   - A writer. `src/data/deployed.json` is not touched: `status` is a claim
 *     about the deployment, and one 20-second probe from one laptop on one
 *     network is not the evidence to overwrite it with.
 *
 * Transport note, measured rather than assumed. Node's global `fetch` (undici)
 * does not read proxy environment variables at all: with `HTTPS_PROXY` pointed at
 * a port nothing listens on, `fetch('https://example.com')` still returned 200.
 * So every request here leaves this machine directly — which is fine, because
 * every host listed is terminated by Cloudflare's edge, and direct egress reaches
 * it. (`scripts/build-icons.mjs` is the opposite case and shells out to `curl`.)
 *
 * What direct egress costs: `transport` rows. Two runs of this script produced 1
 * and then 14 of them, all `ETIMEDOUT`/`UND_ERR_CONNECT_TIMEOUT` at ~500 ms, on
 * hosts that returned 530 a second later. Those failures appear with the proxy
 * variables set and with them cleared, so they are this machine's connection
 * setup, not a tunnel fact — hence one retry per failed row, and a `transport`
 * label only when both attempts fail.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'src/data/deployed.json')
/*
 * `--out dist/probe.json` writes where a deploy ships it, so the 自部署服务 page
 * can state what was actually observed. Without the flag the report lands under
 * .scratch/ (gitignored): a committed probe snapshot would archive an uptime
 * history in the repo that nobody asked to publish, while the one shipped with a
 * site is overwritten by the next publish.
 */
const argv = process.argv.slice(2)
const OUT_JSON = resolve(ROOT, stringFlag('--out') ?? '.scratch/probe-deployed.json')

/* Markers present on Cloudflare's generated error pages and on none of the
 * origins here: their absence beside a 5xx means the error came from the origin. */
const CF_PAGE_MARKERS = ['cf-error-details', 'cf-wrapper', 'cf-footer']

const TIMEOUT_MS = numberFlag('--timeout', 12000)
const CONCURRENCY = numberFlag('--concurrency', 8)
/* Positional args narrow the run to a group id: `npm run probe -- docker`. A
 * flag's own value is not a group: `--out dist/probe.json` would otherwise read
 * as a request to probe the group named "dist/probe.json". */
const FLAG_ARGS = ['--out', '--timeout', '--concurrency']
const ONLY_GROUPS = argv.filter((arg, i) => {
  if (arg.startsWith('--')) return false
  return !FLAG_ARGS.includes(argv[i - 1])
})

/** `--timeout 20000` or `--timeout=20000`; anything unparsable falls back. */
function numberFlag(name, fallback) {
  const raw = stringFlag(name)
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

/** `--out dist/probe.json` or `--out=dist/probe.json`; null when absent. */
function stringFlag(name) {
  const index = argv.indexOf(name)
  if (index !== -1 && argv[index + 1] !== undefined) return argv[index + 1]
  const inline = argv.find((a) => a.startsWith(`${name}=`))
  return inline ? inline.split('=').slice(1).join('=') || null : null
}

const deployed = JSON.parse(readFileSync(SOURCE, 'utf8'))
const groups = (ONLY_GROUPS.length
  ? deployed.groups.filter((g) => ONLY_GROUPS.includes(g.id))
  : deployed.groups
).map((g) => ({ ...g, items: g.items.map((row) => ({ ...row, group: g.id })) }))

if (!groups.length) {
  console.error(`probe: no group matches ${ONLY_GROUPS.join(', ')} — known groups: ${deployed.groups.map((g) => g.id).join(', ')}`)
  process.exit(1)
}

const rows = groups.flatMap((g) => g.items)
/* Requests finish out of order once they run concurrently, so remember the
 * order the list itself has and print in that order: two runs then line up. */
const listOrder = new Map(rows.map((row, index) => [row.id, index]))
const results = []
let cursor = 0

async function worker() {
  while (cursor < rows.length) {
    const row = rows[cursor++]
    results.push(await probeRow(row))
  }
}

const startedAt = new Date()
/* Wall-clock durations are not usable here: this box's clock is stepped by the
 * hypervisor mid-run, and a run measured with Date.now() reported rows of
 * −1700 ms. `performance.now()` is monotonic since process start. */
const t0Run = performance.now()
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, rows.length) }, worker))
const elapsedMs = Math.round(performance.now() - t0Run)

/* Cloudflare sorts its own generated pages by error code, so read the body:
 * a bare status cannot tell 1033 (no connector) from 502 (no origin). */
async function probeRow(row) {
  const url = new URL(row.url)
  const t0 = performance.now()
  const base = {
    group: row.group,
    id: row.id,
    name: row.name,
    url: row.url,
    host: url.hostname,
    path: url.pathname === '/' ? '/' : url.pathname,
    claimedStatus: row.status ?? null,
  }

  /* No HTTP response at all is a statement about the request, not the service,
   * and on this box it is often the request's own luck: retry once before
   * spending a `transport` row on it, and keep both attempts on the record. */
  const attempts = []
  let res = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    const tAttempt = performance.now()
    try {
      res = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': 'FOSS-Atlas-probe/1.0 (read-only self-check)' },
      })
      break
    } catch (err) {
      attempts.push({ attempt, ms: Math.round(performance.now() - tAttempt), note: causeOf(err) })
      if (attempt === 2) {
        return {
          ...base,
          ms: Math.round(performance.now() - t0),
          cls: 'transport',
          code: null,
          cfCode: null,
          cfHeading: null,
          cfRay: null,
          edgeGenerated: false,
          attempts,
          note: `${causeOf(err)} — failed twice (${attempts.map((a) => a.note).join(', ')})`,
        }
      }
      await new Promise((r) => setTimeout(r, 400))
    }
  }

  const text = await res.text().catch(() => '')
  /*
   * Read the page, not only the status: Cloudflare's generated error pages name
   * their own code, and they name it differently depending on which page it is.
   * The short one is `error code: 502`; the full page carries the code in its
   * `<title>` (`host | 502: Bad gateway`) and in the `<h1>`'s second `<span>`,
   * with the human heading in `<h2>` — for a tunnel with no connector that
   * heading reads "Cloudflare Tunnel error" and the code is 1033.
   */
  const cf = cloudflareError(text)
  const edge = (res.headers.get('server') ?? '').toLowerCase().includes('cloudflare')
  const result = {
    ...base,
    ms: Math.round(performance.now() - t0),
    code: res.status,
    cfCode: cf.code,
    /* Only pages that name their own Cloudflare error code get a heading: on a
     * 200 the first <h2> is the page's own content ("Table of contents"), which
     * would fill the report with text that proves nothing. */
    cfHeading: cf.code === null ? null : cf.heading,
    cfRay: res.headers.get('cf-ray') ?? null,
    edgeGenerated: edge && (cf.code !== null || CF_PAGE_MARKERS.some((m) => text.includes(m))),
  }
  return Object.assign(result, classify(res, cf, edge))
}

/** `{ code, heading }` out of a Cloudflare error page, else `{ null, null }`. */
function cloudflareError(text) {
  const code =
    /\berror code: (\d{3,4})/i.exec(text)?.[1] ??
    /\berrorCode:\s*(\d{3,4})\b/.exec(text)?.[1] ??
    /<title>[^<]*?\|\s*(\d{3,4}):\s*[^|<]*/i.exec(text)?.[1] ??
    /<h1[\s\S]{0,400}?<span>(\d{3,4})<\/span>/.exec(text)?.[1] ??
    null
  const title = stripTags(/<title>([\s\S]*?)<\/title>/i.exec(text)?.[1] ?? '')
  const heading =
    stripTags(/<h2[^>]*>([\s\S]{0,300}?)<\/h2>/i.exec(text)?.[1] ?? '') ||
    /* `sgyyyds.qzz.io | 502: Bad gateway` — the name is the segment that is not
     * the host and not Cloudflare's own signature. */
    title.split('|').map((part) => part.trim()).find((part) => part && part !== 'Cloudflare' && !part.includes('.')) ||
    null
  return { code: code ?? null, heading: heading ? clip(heading, 60) : null }
}

function classify(res, cf, edge) {
  const { status } = res
  const cfCode = cf.code
  if (status >= 200 && status < 300) return { cls: '2xx', note: 'answered with a body' }

  if (status >= 300 && status < 400) {
    const location = res.headers.get('location') ?? ''
    if (location.includes('cdn-cgi/access/login')) {
      return { cls: '3xx', note: 'Cloudflare Access login redirect — Access is answering, not failing' }
    }
    return { cls: '3xx', note: `Location: ${clip(location, 70)}` }
  }

  if (status === 530 || cfCode === '1033') {
    return { cls: '530/1033', note: 'no healthy cloudflared connector on the Cloudflare side' }
  }
  if (status === 502) {
    return {
      cls: '502',
      note: edge ? 'connector up; cloudflared could not reach its origin' : '502 from a server that is not cloudflare',
    }
  }
  if (status === 504) return { cls: '504', note: 'no response from the origin before the edge timeout' }
  if (status >= 520 && status <= 527) return { cls: `5xx-${status}`, note: CLOUDFLARE_5XX[status] ?? 'Cloudflare-side connect failure' }
  if (status >= 500) return { cls: `5xx-${status}`, note: 'server-side error' }
  if (status >= 400) {
    /* 4xx comes from the origin (or from Access/WAF in front of it): the tunnel
     * carried the request and something answered it. */
    return { cls: '4xx', note: `origin (or Access/WAF) answered ${status}` }
  }
  return { cls: `other-${status}`, note: 'unclassified status' }
}

/* Codes as Cloudflare documents them; only the ones a tunnel can realistically
 * produce are listed, everything else falls through to `5xx-<status>`. */
const CLOUDFLARE_5XX = {
  520: 'origin returned an empty or invalid response',
  521: 'origin refused the connection (web server down)',
  522: 'origin did not answer the edge at all (connection timed out)',
  523: 'origin is unreachable from Cloudflare',
  524: 'origin accepted the connection but never responded',
  525: 'TLS handshake between Cloudflare and the origin failed',
  526: 'origin presented an invalid TLS certificate',
}

function causeOf(err) {
  const code = err?.cause?.code ?? err?.code ?? null
  if (err?.name === 'TimeoutError' || err?.name === 'AbortError') return `no response within ${TIMEOUT_MS}ms`
  return code ?? err?.message ?? String(err)
}

/** Drop tags and collapse whitespace: `<h2>`'s text is sometimes wrapped in spans. */
function stripTags(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function clip(value, max) {
  const s = String(value ?? '').replace(/\s+/g, ' ').trim()
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

/* ------------------------------------------------------------------ *
 * Report: terminal table, then the same rows as JSON for diffing runs.
 * ------------------------------------------------------------------ */
const CLASS_ORDER = ['2xx', '3xx', '4xx', '530/1033', '502', '504', 'transport']
const byClass = new Map()
for (const r of results) {
  const key = CLASS_ORDER.includes(r.cls) ? r.cls : r.cls.startsWith('5xx') ? '5xx-other' : r.cls
  byClass.set(key, (byClass.get(key) ?? 0) + 1)
}

console.log(`probe: ${rows.length} urls from src/data/deployed.json (清单 updated: ${deployed.updated}) in ${elapsedMs}ms`)
console.log('       via node:fetch (undici), direct egress — undici reads no proxy env var; a failed row is retried once\n')

for (const group of groups) {
  console.log(`── ${group.id} · ${group.items.length}  (${group.name})`)
  for (const r of results
    .filter((x) => x.group === group.id)
    .sort((a, b) => listOrder.get(a.id) - listOrder.get(b.id))) {
    const head = `${r.cls}${r.code !== null && r.cls !== String(r.code) ? ` (${r.code})` : ''}`
    const where = `${r.host}${r.path === '/' ? '' : r.path}`
    console.log(
      `   ${head.padEnd(16)}${r.id.padEnd(21)}${where.padEnd(40)}${`${r.ms}ms`.padStart(8)}` +
        (r.note ? `  ${clip(r.note, 50)}` : ''),
    )
  }
  console.log('')
}

console.log('counts: ' + [...byClass].map(([k, n]) => `${k}=${n}`).join(' '))

/* The evidence, stated once instead of on every row: each distinct error page
 * Cloudflare generated for these hostnames, with its own code and its own words
 * for it. A run where 1033 is the only line is a different situation from one
 * where 502 joins it. */
const signals = new Map()
for (const r of results) {
  if (r.cfCode === null) continue
  const key = `${r.code} / ${r.cfCode} ${r.cfHeading ? `“${r.cfHeading}”` : ''}`
  signals.set(key, (signals.get(key) ?? 0) + 1)
}
if (signals.size) {
  console.log('pages naming their own code: ' + [...signals].map(([k, n]) => `${k} ×${n}`).join('  '))
}
console.log(
  `\nRead-only: nothing under src/ or public/ was written. ${OUT_JSON} holds this run's snapshot only. ` +
    '530/1033 names the connector side, 502 names the origin side — neither is a claim that a service is "down".',
)

const report = {
  ranAt: startedAt.toISOString(),
  elapsedMs,
  source: 'src/data/deployed.json',
  claimedUpdated: deployed.updated ?? null,
  transport: {
    via: 'node:fetch (undici), direct egress',
    proxyEnv: 'ignored by undici — verified: HTTPS_PROXY pointed at a closed port still returned 200',
    timeoutMs: TIMEOUT_MS,
    concurrency: CONCURRENCY,
    retries: 'one per failed row; transport = both attempts failed',
  },
  counts: Object.fromEntries(byClass),
  signals: Object.fromEntries(signals),
  rows: results.sort((a, b) => a.group.localeCompare(b.group) || a.id.localeCompare(b.id)),
}
mkdirSync(dirname(OUT_JSON), { recursive: true })
writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
console.log(`report: ${OUT_JSON}`)
