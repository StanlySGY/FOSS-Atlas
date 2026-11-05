#!/usr/bin/env node
/** Read-only reachability snapshot for public catalogue URLs. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { performance } from 'node:perf_hooks'
import { classifyResourceLinkResponse } from '../src/lib/resourceLinkStatus.js'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(ROOT, 'src/data/resources.json')
const REPOSITORY_SOURCE = resolve(ROOT, 'src/data/repository-metadata.json')
const args = process.argv.slice(2)
const CONCURRENCY = Math.min(16, Math.max(1, Number(flag('--concurrency') || 8)))
const TIMEOUT_MS = Math.min(30000, Math.max(1500, Number(flag('--timeout') || 9000)))
const MAX_REDIRECTS = 7
const OUT = resolve(ROOT, flag('--out') || '.scratch/resource-links.json')
function flag(name) {
  const i = args.indexOf(name)
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1]
  const value = args.find((arg) => arg.startsWith(name + '='))
  return value ? value.slice(name.length + 1) : null
}
function classifyError(error) {
  const code = error?.cause?.code ?? error?.code ?? ''
  const message = String(error?.message ?? error ?? '').toLowerCase()
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError' || /timed? ?out/.test(message)) return { status: 'timeout', note: 'request timeout' }
  if (/^(ENOTFOUND|EAI_AGAIN|ENODATA)$/.test(code)) return { status: 'dns_error', note: code }
  if (/^(CERT_|ERR_TLS|UNABLE_TO_VERIFY_LEAF_SIGNATURE|DEPTH_ZERO_SELF_SIGNED_CERT)/.test(code)) return { status: 'tls_error', note: code }
  return { status: 'network_error', note: code || String(error?.message ?? 'network error').slice(0, 150) }
}
function makeRow(resource, started, detail) {
  return {
    resourceId: resource.resourceId ?? resource.id,
    targetKind: resource.targetKind ?? 'homepage',
    name: resource.name,
    url: resource.url,
    checkedAt: null,
    ms: Math.round(performance.now() - started),
    ...detail,
  }
}
async function requestOnce(resource) {
  let currentUrl = resource.url
  const visited = new Set()
  const redirects = []
  const started = performance.now()
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (visited.has(currentUrl)) return makeRow(resource, started, { status: 'redirect_loop', code: null, finalUrl: currentUrl, redirects, note: 'redirect loop' })
    visited.add(currentUrl)
    const response = await fetch(currentUrl, {
      method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: 'text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5', 'user-agent': 'FOSS-Atlas-Link-Audit/1.0 (+https://github.com/StanlySGY/FOSS-Atlas)', range: 'bytes=0-0' },
    })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel().catch(() => {})
      const nextUrl = new URL(location, currentUrl).href
      redirects.push({ code: response.status, url: currentUrl, to: nextUrl })
      if (hop === MAX_REDIRECTS) return makeRow(resource, started, { status: 'too_many_redirects', code: response.status, finalUrl: currentUrl, redirects, note: 'too many redirects' })
      currentUrl = nextUrl
      continue
    }
    await response.body?.cancel().catch(() => {})
    const code = response.status
    const accessRedirect = redirects.some((entry) => /cdn-cgi\/access\/login|\/login(?:[/?#]|$)/i.test(entry.to))
    const classified = classifyResourceLinkResponse(code, { accessRedirect })
    return makeRow(resource, started, { ...classified, code, finalUrl: response.url || currentUrl, redirects })
  }
  return makeRow(resource, started, { status: 'other', code: null, finalUrl: currentUrl, redirects, note: 'unclassified response' })
}
const catalogue = JSON.parse(readFileSync(SOURCE, 'utf8'))
const repositoryMetadata = JSON.parse(readFileSync(REPOSITORY_SOURCE, 'utf8'))
const catalogueById = new Map(catalogue.map((resource) => [resource.id, resource]))
const resources = [
  ...catalogue.map((resource) => ({ ...resource, resourceId: resource.id, targetKind: 'homepage' })),
  ...(repositoryMetadata.entries ?? [])
    .filter((entry) => catalogueById.has(entry.resourceId) && /^https:\/\//.test(entry.url ?? ''))
    .map((entry) => ({
      id: entry.resourceId + ':repository',
      resourceId: entry.resourceId,
      targetKind: 'repository',
      name: catalogueById.get(entry.resourceId).name + ' · GitHub',
      url: entry.url,
    })),
]
const rows = []
let cursor = 0
async function worker() {
  while (cursor < resources.length) {
    const resource = resources[cursor++]
    let row
    for (let attempt = 1; attempt <= 2; attempt++) {
      const attemptStarted = performance.now()
      try {
        row = await requestOnce(resource)
        if (attempt === 1 && (row.status === 'server_error' || row.status === 'timeout')) continue
        row.attempts = attempt
        break
      } catch (error) {
        row = makeRow(resource, attemptStarted, { ...classifyError(error), code: null, finalUrl: resource.url, redirects: [], attempts: attempt })
        if (attempt === 1) continue
      }
    }
    row.checkedAt = new Date().toISOString()
    rows.push(row)
  }
}
const startedAt = new Date()
const start = performance.now()
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, resources.length) }, worker))
const elapsedMs = Math.round(performance.now() - start)
const statusKeys = ['ok','redirect','restricted','not_found','client_error','server_error','dns_error','tls_error','timeout','network_error','redirect_loop','too_many_redirects','other']
const counts = Object.fromEntries(statusKeys.map((key) => [key, 0]))
for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1
const report = {
  schemaVersion: 2, ranAt: startedAt.toISOString(), elapsedMs,
  source: ['src/data/resources.json', 'src/data/repository-metadata.json'],
  scope: 'catalogue homepages and known GitHub repositories; HTTP response is not a full user-flow check',
  transport: { method: 'GET with Range: bytes=0-0', concurrency: CONCURRENCY, timeoutMs: TIMEOUT_MS, retries: 1, maxRedirects: MAX_REDIRECTS },
  counts, rows: rows.sort((a, b) => a.resourceId.localeCompare(b.resourceId) || a.targetKind.localeCompare(b.targetKind)),
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n')
console.log('resource link audit: ' + rows.length + ' targets (' + catalogue.length + ' homepages + ' + (resources.length - catalogue.length) + ' repositories) in ' + elapsedMs + 'ms')
console.log('ok=' + counts.ok + ' redirect=' + counts.redirect + ' restricted=' + counts.restricted + ' not_found=' + counts.not_found + ' client_error=' + counts.client_error + ' server_error=' + counts.server_error + ' transport=' + (counts.dns_error + counts.tls_error + counts.timeout + counts.network_error))
console.log('snapshot: ' + OUT)
console.log('Read-only snapshot only: 401/403/429 or one transport failure is not proof a site is down.')
