import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import deployed from '../data/deployed.json'
import { resourceById } from '../lib/data.js'

/*
 * A row's catalogue entry, resolved through the `resource` field the generator
 * insists on (see scripts/build-data.mjs). It is not always the row's own id: 13
 * GitHub docs mirrors carry a `-docs` id and point back at the tool they mirror,
 * five rows are second deployments under their own names (`shlink-web`,
 * `hacktricks-gh`, …), and the Atlas-owned rows carry no `resource` at all because
 * the minted record uses their id. Going through this instead of `item.id` is what
 * keeps the Wiki link and the graph focus from being dead ends on those 18 rows.
 */
const resourceIdFor = (item) => item.resource ?? item.id
const graphUrlFor = (item) => `/graph/?deployed=1&focus=${encodeURIComponent(resourceIdFor(item))}`

const STATUS_LABEL = {
  live: '已上线',
  pending: '部署中',
}

/*
 * What the probe's own classification means for a row. 3xx and 4xx are not
 * failures: the tunnel carried the request and something answered it (Access, a
 * redirect to its own app, a 404 page). Only the edge-side and origin-side
 * connect failures name a link that did not carry.
 */
const unreachable = (cls) =>
  cls === '530/1033' || cls === '502' || cls === '504' || cls === 'transport' || String(cls).startsWith('5xx')

/** The snapshot `npm run probe -- --out dist/probe.json` shipped with this build. */
function useProbe() {
  const [probe, setProbe] = useState(null)
  useEffect(() => {
    let alive = true
    fetch(`${import.meta.env.BASE_URL}probe.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setProbe(d ?? null)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return probe
}

const utcStamp = (iso) => String(iso ?? '').slice(0, 16).replace('T', ' ')

function StatusChip({ status, result }) {
  const pending = status === 'pending'
  const down = !pending && result ? unreachable(result.cls) : false
  const neutral = pending || (!result && status !== 'live')
  return (
    <span
      className={[
        'mono shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10px]',
        down
          ? 'bg-[var(--down-soft)] text-[var(--down-text)]'
          : neutral
            ? 'bg-[var(--ink-tint)] text-[var(--text-faint)]'
            : 'bg-[var(--accent)]/15 text-[var(--accent)]',
      ].join(' ')}
      title={result ? `${result.cls}: ${result.note}` : undefined}
    >
      {down ? `不可达 ${result.code ?? result.cls}` : (STATUS_LABEL[status] ?? status)}
    </span>
  )
}

function ServiceRow({ item, result }) {
  const resourceId = resourceIdFor(item)
  const resource = resourceById.get(resourceId)
  return (
    /*
     * The row's own anchor: /deployed/#<id> is handed out by the graph bubble's
     * 自部署页 link and the card badges, and scroll-mt keeps it clear of the
     * sticky header when the browser jumps here.
     */
    <li
      id={item.id}
      className="group flex scroll-mt-20 flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5 transition-colors duration-150 hover:border-[var(--line-strong)] hover:bg-[var(--ink-card-hover)] sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-semibold text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent)]"
          >
            {item.name}
          </a>
          <StatusChip status={item.status} result={result} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">{item.desc}</p>
        <div className="mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-faint)]">
          <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
          <span>{item.stack}</span>
        </div>
      </div>

      {/* Two ways out of a row: the catalogue entry it belongs to, and the graph
          opened on that entry with the running-services subgraph already on.
          Both exist even for the 自建 rows, which the generator minted into the
          catalogue precisely so they would have a Wiki page and a node. */}
      <div className="flex shrink-0 items-center gap-3">
        {resource ? (
          <Link
            to={`/wiki/${resourceId}/`}
            className="text-[11px] text-[var(--text-faint)] transition-colors hover:text-[var(--text-strong)]"
          >
            Wiki
          </Link>
        ) : null}
        <Link
          to={graphUrlFor(item)}
          className="text-[11px] text-[var(--own-text)] transition-colors hover:text-[var(--text-strong)]"
        >
          在图谱中查看
        </Link>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[var(--accent)] hover:underline"
        >
          访问 ↗
        </a>
      </div>
    </li>
  )
}

export default function Deployed() {
  const probe = useProbe()
  const probeRows = probe?.rows ?? []
  const probeDown = probeRows.filter((r) => unreachable(r.cls))
  /*
   * The GitHub Pages mirror count, computed from the data instead of written
   * down. Scoped to the github group on purpose: the 运维 note below describes
   * the per-repo Actions schedules, and the two mirrors on the edge group
   * (hacktricks-cf, patt-cf) are Cloudflare Workers, so they are not part of
   * that story. A global mirror count would be 36.
   *
   * A deployed.json row has no `group` field of its own — the group is the section it
   * sits under, and `build-data.mjs` is what stamps it onto the catalogue instance.
   * So the count is taken per section, not by filtering a flat list on a field that
   * is not there (which yields 0, and 0 is the kind of wrong number that reads fine).
   */
  /*
   * Per-group reach, from the same snapshot the row chips use. Grouped because
   * a flat "50/81" hides the only diagnostic fact a reader can act on: which
   * kind of deployment is the one that is down. `worst` names the dominant
   * failure class once, instead of repeating it on every row.
   */
  const probeGroups = probeRows.length
    ? deployed.groups.map((g) => {
        const rows = probeRows.filter((r) => r.group === g.id)
        const down = rows.filter((r) => unreachable(r.cls))
        const counts = {}
        for (const r of down) counts[r.cls] = (counts[r.cls] ?? 0) + 1
        const worst = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
        return {
          id: g.id,
          name: g.name,
          total: rows.length,
          ok: rows.length - down.length,
          down: down.length > 0,
          worst: worst ? `${worst[0]} ×${worst[1]}` : null,
        }
      })
    : []

  const githubMirrors = deployed.groups
    .filter((g) => g.id === 'github')
    .reduce((n, g) => n + g.items.filter((i) => i.kind === 'mirror').length, 0)

  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-3 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-[2rem]">
          自部署服务
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-dim)]">
          把图鉴里那些「能自己跑起来」的资源,真的部署成可访问的服务:知识库与静态站点放在
          <span className="text-[var(--text-strong)]"> Cloudflare 边缘</span>,
          上游仓库镜像交给 <span className="text-[var(--text-strong)]">GitHub Pages</span>,
          其余经 <span className="text-[var(--text-strong)]">cloudflared 隧道</span> 从本机 Docker
          暴露成 HTTPS 域名。Cloudflare 与 Docker 服务在{' '}
          <span className="mono">{deployed.host}</span> 之下,GitHub Pages 镜像在各自的{' '}
          <span className="mono">tanlysgy.github.io/仓库名/</span> 路径下,更新于 {deployed.updated}。
        </p>
        {/*
         * 已上线 is a claim about the deployment list, not an observation. The
         * build-time probe is the observation: the same {total} URLs fetched from
         * the public internet when this build was published, one row per result
         * below. No snapshot, no line — a dev server has nothing to show.
         */}
        {probe ? (
          /*
           * The snapshot used to be one mono line at the bottom of the intro,
           * under a pill that said 81/81 live. When 31 of the 81 are not
           * reachable, that line is the most important thing on the page and it
           * was the smallest text on it. Now it is a block of its own, grouped
           * the way the sections below are grouped, because the failure has a
           * shape: it is the Docker tunnel, not "some services".
           */
          <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-sunken)] p-3.5">
            <p className="text-[13px] leading-relaxed text-[var(--text-dim)]">
              发布时从公网探测（{utcStamp(probe.ranAt)} UTC）：
              <span className="font-semibold text-[var(--text-strong)]">{probeRows.length - probeDown.length}</span>
              <span className="text-[var(--text-faint)]"> / {probeRows.length} 可达</span>
              {probeDown.length ? (
                <span className="font-semibold text-[var(--down-text)]"> · {probeDown.length} 不可达</span>
              ) : null}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
              {probeGroups.map((g) => (
                <li key={g.id} className="flex items-baseline gap-1.5">
                  <span className={g.down ? 'text-[var(--down-text)]' : 'text-[var(--text-dim)]'}>
                    {g.name}
                  </span>
                  <span className="mono text-[var(--text-faint)]">
                    {g.ok}/{g.total}
                    {g.worst ? ` · ${g.worst}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/*
       * A 部署分组 header wears no hue, and that is a measurement rather than an
       * omission. Everywhere else on the site a colour answers "which 分类", and
       * these three sections are not 分类 divisions — they are *where it runs*.
       * Counted from the shipped data: 16 rows on Cloudflare 边缘 spread over 4
       * categories (atlas 12, security 2, gear 1, selfhost 1), 34 on GitHub Pages
       * mirrors over 5 (selfhost 22, security 5, ai 4, gear 2, ebook 1), 33 on the
       * Docker tunnel over 3 (selfhost 24, gear 6, ai 3). No group has a majority
       * category — 75% at best — so any single hue on a header would be a 分类
       * claim the rows under it contradict a quarter of the time, and the site has
       * no colour that means "edge" or "docker". The group is stated by its name
       * and its note in type, and 自建 stays the page's one hue (the row links,
       * the badges) because that is the claim every row on this page actually makes.
       */}
      {deployed.groups.map((group) => (
        <section key={group.id} className="space-y-3">
          <div className="flex flex-col gap-1 border-b border-[var(--line-soft)] pb-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-base font-semibold tracking-tight text-[var(--text-strong)]">
              {group.name}
              <span className="mono ml-2 text-[11px] font-normal text-[var(--text-faint)]">
                {group.items.length}
              </span>
            </h2>
            <p className="text-[11px] text-[var(--text-faint)]">{group.note}</p>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {group.items.map((item) => (
              <ServiceRow
                key={item.id}
                item={item}
                result={probeRows.find((r) => r.group === group.id && r.id === item.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-sunken)] p-4">
        <h2 className="text-[13px] font-semibold text-[var(--text-strong)]">运维说明</h2>
        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-[var(--text-dim)]">
          <li>· Docker 编排文件与隧道配置存放在本机 <span className="mono">~/workspace/selfhost</span>,全部 <span className="mono">restart: unless-stopped</span>。</li>
          <li>· 隧道由用户级 systemd 服务 <span className="mono">foss-labs-tunnel.service</span> 常驻,开机自启;新增域名用 <span className="mono">cloudflared tunnel route dns</span> 注册。</li>
          <li>· Cloudflare 侧的静态站与知识库镜像用 <span className="mono">wrangler</span> 部署到 Workers/Pages,自定义域直接绑在同一个 zone 上。</li>
          <li>· 本页数据源 <span className="mono">src/data/deployed.json</span>;改完推送到 main,GitHub Pages 与 Cloudflare Pages 会各自自动重新发布。</li>
          <li>· 每条的状态 chip 来自发布时跑的只读探测(<span className="mono">npm run probe -- --out dist/probe.json</span>),它说的是上一次发布那一刻从公网看到的结果,<b className="text-[var(--text-strong)]">不是实时监控</b>;530/1033 指隧道没接上云,502 指云接上了但源站没应答。</li>
          <li>· GitHub Pages 的 <span className="mono">{githubMirrors}</span> 个镜像仓库各自带自己的 <span className="mono">Atlas · …</span> workflow 和 <span className="mono">schedule</span>,不存在集中的调度仓库:<span className="mono">Atlas · sync upstream</span> 每天 03:23 UTC 拉上游,<span className="mono">Atlas · sync mirror</span> 每天 04:17 UTC 重建镜像内容,<span className="mono">Atlas · docs site</span> 每周一 04:37 UTC 重建文档站。</li>
          <li>· 网页终端 <span className="mono">term</span> 走 HTTP Basic 密码保护;如需更强鉴权可挂 Cloudflare Access。</li>
          <li>· 边缘小工具 <span className="mono">short</span> / <span className="mono">paste</span> 是同一个 Worker(<span className="mono">atlas-edge-kit</span>)的两个自定义域,数据存 Cloudflare KV。</li>
          <li>· <span className="mono">vault</span> / <span className="mono">book</span> / <span className="mono">sgyyyds</span> / <span className="mono">hub</span> / <span className="mono">chat</span> 五项由另一条隧道 <span className="mono">cloudflared.service</span>(<span className="mono">/etc/cloudflared/config.yml</span>)承载,与 foss-labs 相互独立,改动互不影响。</li>
          <li>· 端口统一避开本机已占用的 3000/3001/3002/8222/9090 等,新增服务前先查占用。</li>
        </ul>
      </section>
    </div>
  )
}
