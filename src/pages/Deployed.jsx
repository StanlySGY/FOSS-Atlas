import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader.jsx'
import deployed from '../data/deployed.json'
import { resourceById } from '../lib/data.js'
import { deploymentStatusKind, isUnreachable, matchesDeploymentStatus, probeStatusPresentation, summarizeProbeRows } from '../lib/probeStatus.js'
import { deployedFiltersFromSearchParams, resetDeployedFiltersParams, setDeployedFilterParam } from '../lib/catalogFilterState.js'
import { readExpandedDeployGroups, rememberDeployedInstance, rememberExpandedDeployGroups } from '../lib/userJourney.js'
import { formatSnapshotAge, resourceLinkFreshness } from '../lib/resourceLinkStatus.js'

/*
 * A row's catalogue entry, resolved through the `resource` field the generator
 * insists on (see scripts/build-data.mjs). It is not always the row's own id: 13
 * GitHub docs mirrors carry a `-docs` id and point back at the tool they mirror,
 * 16 rows are another deployment of the same tool under their own name
 * (`shlink-web`, `hacktricks-gh`, `home`, `kb`, `ai`, `graph`, …) — 29 rows in all,
 * and the 12 Atlas-owned rows carry no `resource` at all because the minted record
 * uses their id. Going through this instead of `item.id` is what keeps the Wiki link
 * and the graph focus from being dead ends on those 29 rows.
 */
const resourceIdFor = (item) => item.resource ?? item.id
const graphUrlFor = (item) => `/graph/?deployed=1&focus=${encodeURIComponent(resourceIdFor(item))}`
const EMPTY_PROBE_ROWS = []
const DEPLOYED_GROUP_IDS = new Set(deployed.groups.map((group) => group.id))
const DEPLOYED_INSTANCE_IDS = new Set(deployed.groups.flatMap((group) => group.items.map((item) => item.id)))

/**
 * The snapshot `npm run probe -- --out dist/probe.json` shipped with this build.
 *
 * Four states, because "loading" and "this build has no snapshot" are different
 * facts and the old single `null` conflated them: while the fetch was in flight
 * the page flashed 「暂无快照」 and counted all 93 rows as 未探测, then the
 * counts jumped to the real distribution once the response landed. `error` is
 * a transient network failure and gets a retry; `missing` (HTTP 404) is a
 * property of the build itself and a retry will not change it.
 */
function useProbe() {
  const [probeState, setProbeState] = useState({ status: 'loading', probe: null })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    setProbeState({ status: 'loading', probe: null })
    fetch(`${import.meta.env.BASE_URL}probe.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(Object.assign(new Error('probe snapshot missing'), { missing: r.status === 404 }))))
      .then((d) => {
        if (alive) setProbeState({ status: 'ready', probe: d ?? null })
      })
      .catch((err) => {
        if (alive) setProbeState({ status: err?.missing ? 'missing' : 'error', probe: null })
      })
    return () => {
      alive = false
    }
  }, [attempt])
  return { ...probeState, retry: () => setAttempt((n) => n + 1) }
}

const utcStamp = (iso) => String(iso ?? '').slice(0, 16).replace('T', ' ')

/*
 * Three states, three plates, and each one's floor is measured rather than
 * assumed. 不可达 is the state a reader has to act on, so it gets its own well
 * (--down-well, 1.181:1 and ΔE76 20.6 from the card — the largest colour jump on
 * the page, which is the point) with --down-text words at 6.47:1 and a 70%
 * --down-text border at 4.01:1, a mark-grade line. 已上线 wears the accent: the
 * 70% border is 3.74:1 on the card and --accent-text on the 10% wash is 6.10:1.
 * 部署中 / no-snapshot is deliberately the plainest: --ink-tint is only 1.125:1
 * above the card (ΔE76 4.1) and --line on it 1.212, because an unknown state
 * must not compete for attention with a known failure; its --text-faint words
 * are 6.17:1, so it is quiet, not unreadable.
 */
function StatusChip({ status, result, loading = false }) {
  const presentation = loading
    ? { label: '加载中', kind: 'neutral', title: '探测快照正在加载' }
    : probeStatusPresentation(status, result)
  return (
    <span
      className={[
        'mono shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10px]',
        presentation.kind === 'down'
          ? 'border border-[color-mix(in_srgb,var(--down-text)_70%,transparent)] bg-[var(--down-well)] text-[var(--down-text)]'
          : presentation.kind === 'ok'
            ? 'border border-[var(--accent)]/70 bg-[var(--accent)]/10 text-[var(--accent-text)]'
            : presentation.kind === 'restricted'
              ? 'border border-[color-mix(in_srgb,var(--accent-text)_65%,transparent)] bg-[var(--accent)]/10 text-[var(--accent-text)]'
              : 'border border-[var(--line)] bg-[var(--ink-tint)] text-[var(--text-faint)]',
      ].join(' ')}
      title={presentation.title}
    >
      {presentation.label}
    </span>
  )
}

function ServiceRow({ item, result, probeLoading = false }) {
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
      className="fa-surface fa-lift group flex scroll-mt-20 flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-semibold text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent-text)]"
          >
            {item.name}
          </a>
          <StatusChip status={item.status} result={result} loading={probeLoading} />
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
          className="text-[11px] text-[var(--accent-text)] hover:underline"
        >
          访问 ↗
        </a>
      </div>
    </li>
  )
}

export default function Deployed() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { status: probeState, probe, retry: retryProbe } = useProbe()
  const probeFreshness = resourceLinkFreshness(probe)
  const probeRows = probe?.rows ?? EMPTY_PROBE_ROWS
  const probeSummary = summarizeProbeRows(probeRows)
  const probeByKey = useMemo(
    () => new Map(probeRows.map((row) => [`${row.group}:${row.id}`, row])),
    [probeRows],
  )
  const instanceTotal = deployed.groups.reduce((sum, group) => sum + group.items.length, 0)
  const { query, statusFilter, groupFilter } = deployedFiltersFromSearchParams(searchParams, deployed.groups.map((group) => group.id))
  const [expandedGroups, setExpandedGroups] = useState(() => readExpandedDeployGroups(DEPLOYED_GROUP_IDS))
  const [fragmentTarget, setFragmentTarget] = useState(null)
  const handledFragmentRef = useRef(null)

  // Deep links work on first load and on in-app hash changes. A target takes
  // precedence over old filters, then its group is expanded before scrolling.
  useEffect(() => {
    const fragment = location.hash
    if (!fragment) {
      handledFragmentRef.current = null
      const frame = window.requestAnimationFrame(() => setFragmentTarget(null))
      return () => window.cancelAnimationFrame(frame)
    }
    let id = fragment.slice(1)
    try { id = decodeURIComponent(id) } catch { /* keep the raw fragment */ }
    if (handledFragmentRef.current === fragment) return undefined
    const matching = deployed.groups.find((group) => group.items.some((item) => item.id === id))
    if (!matching) return undefined
    const nextSearch = resetDeployedFiltersParams(searchParams).toString()
    if (nextSearch !== searchParams.toString()) {
      navigate({ pathname: location.pathname, search: nextSearch ? '?' + nextSearch : '', hash: fragment }, { replace: true })
    }
    const frame = window.requestAnimationFrame(() => {
      // StrictMode replays effects and cancels the first frame. Mark this hash
      // handled only after the surviving frame runs, or the replay will skip
      // expanding the group and the target row will never mount.
      handledFragmentRef.current = fragment
      rememberDeployedInstance(id, DEPLOYED_INSTANCE_IDS)
      setFragmentTarget(id)
      setExpandedGroups((current) => new Set([...current, matching.id]))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, location.pathname, navigate, searchParams])

  useEffect(() => {
    rememberExpandedDeployGroups(expandedGroups, DEPLOYED_GROUP_IDS)
  }, [expandedGroups])

  useEffect(() => {
    if (!fragmentTarget) return undefined
    const matching = deployed.groups.find((group) => group.items.some((item) => item.id === fragmentTarget))
    if (!matching || !expandedGroups.has(matching.id)) return undefined
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(fragmentTarget)?.scrollIntoView({ block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [expandedGroups, fragmentTarget])

  const statusCounts = useMemo(() => {
    const counts = { all: 0, down: 0, ok: 0, redirect: 0, restricted: 0, unknown: 0 }
    for (const group of deployed.groups) {
      for (const item of group.items) {
        counts.all += 1
        counts[deploymentStatusKind(probeByKey.get(`${group.id}:${item.id}`))] += 1
      }
    }
    return counts
  }, [probeByKey])

  const filteredGroups = useMemo(() => deployed.groups
    .filter((group) => groupFilter === 'all' || group.id === groupFilter)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const result = probeByKey.get(`${group.id}:${item.id}`)
        if (!matchesDeploymentStatus(result, statusFilter)) return false
        const resource = resourceById.get(resourceIdFor(item))
        const haystack = [
          item.id, item.name, item.desc, item.url, item.stack, item.kind,
          resource?.name, resource?.category_name, resource?.sub_category_name,
          ...(item.tags ?? []),
        ].join(' ').toLocaleLowerCase()
        return !query.trim() || haystack.includes(query.trim().toLocaleLowerCase())
      }),
    }))
    .filter((group) => group.items.length > 0), [groupFilter, probeByKey, query, statusFilter])

  const filteredCount = filteredGroups.reduce((sum, group) => sum + group.items.length, 0)
  const hasActiveFilters = Boolean(query.trim()) || statusFilter !== 'all' || groupFilter !== 'all'
  const allExpanded = filteredGroups.length > 0 && filteredGroups.every((group) => expandedGroups.has(group.id))

  const toggleGroup = (id) => setExpandedGroups((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const setFilter = (key, value) => setSearchParams((previous) => setDeployedFilterParam(previous, key, value), { replace: true })
  const clearFilters = () => setSearchParams((previous) => resetDeployedFiltersParams(previous), { replace: true })
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
        const counts = summarizeProbeRows(rows)
        const downRows = rows.filter((r) => isUnreachable(r.cls))
        const failureCounts = {}
        for (const r of downRows) failureCounts[r.cls] = (failureCounts[r.cls] ?? 0) + 1
        const worst = Object.entries(failureCounts).sort((a, b) => b[1] - a[1])[0]
        return {
          id: g.id,
          name: g.name,
          total: rows.length,
          counts,
          down: downRows.length > 0,
          worst: worst ? worst[0] + ' ×' + worst[1] : null,
        }
      })
    : []

  const githubMirrors = deployed.groups
    .filter((g) => g.id === 'github')
    .reduce((n, g) => n + g.items.filter((i) => i.kind === 'mirror').length, 0)

  return (
    <div className="fa-page-stack">
      <PageHeader
        eyebrow="运行实例 / DEPLOYED"
        title="自部署服务"
        description={`管理 ${instanceTotal} 个公开服务与镜像，按名称、域名、技术栈或可达状态快速定位。清单更新于 ${deployed.updated}；探测快照 ${probeState === 'ready' ? utcStamp(probe.ranAt) + ' UTC' : probeState === 'loading' ? '加载中' : probeState === 'error' ? '加载失败' : '暂无' }。`}
      />

      {probeState === 'ready' ? (
        <details className="fa-disclosure fa-surface-muted px-4 py-3">
          <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-dim)]">
            <span className="font-semibold text-[var(--text-strong)]">发布连通性快照</span>
            <span>最近探测 {utcStamp(probe.ranAt)} UTC · {formatSnapshotAge(probeFreshness)}</span>
            {probeFreshness.state === 'stale' || probeFreshness.state === 'aging' ? (
              <span className="text-[var(--down-text)]">{probeFreshness.label}，状态可能已变化</span>
            ) : null}
            <span className={probeSummary.unreachable ? 'text-[var(--down-text)]' : 'text-[var(--text-faint)]'}>
              {probeSummary.unreachable} 个不可达
            </span>
            <span className="ml-auto text-[10px] text-[var(--text-faint)]">展开详情</span>
          </summary>
          <div className="mt-3 space-y-2.5 border-t border-[var(--line-soft)] pt-3">
            <p className="text-[11px] leading-relaxed text-[var(--text-faint)]">
              清单更新时间：{deployed.updated}。探测时间：{utcStamp(probe.ranAt)} UTC。共探测 {probeSummary.total} 个实例。这是最近一次发布时的公网快照，不是实时监控，也不代表已完成登录或完整用户流程；即使快照显示异常，也应结合时间和访问限制复核。
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
              <li className="text-[var(--accent-text)]">2xx 正常响应 <span className="mono">{probeSummary.ok}</span></li>
              <li className="text-[var(--text-dim)]">3xx 重定向 <span className="mono">{probeSummary.redirect}</span></li>
              <li className="text-[var(--accent-text)]">4xx 访问受限/客户端错误 <span className="mono">{probeSummary.restricted}</span></li>
              <li className={probeSummary.unreachable ? 'text-[var(--down-text)]' : 'text-[var(--text-dim)]'}>
                不可达/连接失败 <span className="mono">{probeSummary.unreachable}</span>
              </li>
              {probeSummary.other ? <li className="text-[var(--text-dim)]">其他 <span className="mono">{probeSummary.other}</span></li> : null}
            </ul>
            <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 border-t border-[var(--line-soft)] pt-2 sm:grid-cols-3">
              {probeGroups.map((g) => (
                <div key={g.id} className="flex flex-wrap items-baseline gap-1.5 text-[11px]">
                  <span className={g.down ? 'text-[var(--down-text)]' : 'text-[var(--text-dim)]'}>{g.name}</span>
                  <span className="mono text-[var(--text-faint)]">
                    2xx {g.counts.ok} · 3xx {g.counts.redirect} · 4xx {g.counts.restricted} · 不可达 {g.counts.unreachable}
                    {g.worst ? ' · ' + g.worst : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
      ) : probeState === 'loading' ? (
        <p className="fa-surface-muted px-4 py-3 text-xs text-[var(--text-faint)]" aria-busy="true">探测快照加载中…</p>
      ) : probeState === 'error' ? (
        <p className="fa-surface-muted flex flex-wrap items-center gap-2 px-4 py-3 text-xs text-[var(--text-faint)]">
          <span>探测快照加载失败；部署清单仍可浏览，但当前可达性未知。</span>
          <button type="button" onClick={retryProbe} className="text-[var(--accent-text)] underline underline-offset-2">重试</button>
        </p>
      ) : (
        <p className="fa-surface-muted px-4 py-3 text-xs text-[var(--text-faint)]">暂无发布时的公网探测快照；部署清单仍可浏览，但当前可达性未知。</p>
      )}

      {/* Deployment groups describe hosting location, not resource category.
          Keep their headers neutral so a group colour cannot imply every item
          inside it belongs to one catalogue category. */}
      <section className="fa-surface p-4">
        <div className="fa-deployed-filter-content flex flex-col gap-3">
          <div className="fa-deployed-filter-header flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-strong)]">查找服务</h2>
              <p className="mt-1 text-[11px] text-[var(--text-faint)]">支持名称、域名、技术栈和分类关键词</p>
            </div>
            <span role="status" className="mono text-[11px] text-[var(--text-faint)]">{filteredCount} / {instanceTotal}</span>
          </div>
          <label className="fa-deployed-search relative block">
            <span className="sr-only">搜索自部署服务</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setFilter('q', event.target.value)}
              placeholder="搜索服务、域名、技术栈…"
              aria-label="搜索自部署服务"
              className="fa-catalog-search w-full rounded-[6px] border bg-[var(--ink-sunken)] py-3 pl-10 pr-3 text-base text-[var(--text-strong)] placeholder:text-[var(--text-faint)] sm:text-sm"
            />
          </label>

          <div className="fa-deployed-filter-group fa-deployed-filter-group--status space-y-2">
            <span className="text-[10px] font-semibold tracking-wide text-[var(--text-faint)]">按状态</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="按连通性筛选">
              {[
                ['all', '全部'], ['down', '不可达'], ['restricted', '需认证 / 受限'],
                ['ok', '正常响应'], ['redirect', '重定向'], ['unknown', '未探测'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={statusFilter === value}
                  onClick={() => setFilter('status', value)}
                  className={statusFilter === value ? 'fa-filter-chip rounded-full border border-[var(--accent)]/55 bg-[var(--accent)]/10 px-3 py-1.5 text-[11px] text-[var(--accent-text)]' : 'fa-filter-chip rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]'}
                >
                  {label} <span className="mono ml-1 text-[10px] opacity-70">{probeState === 'loading' ? '…' : statusCounts[value]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="fa-deployed-filter-group fa-deployed-filter-group--location space-y-2">
            <span className="text-[10px] font-semibold tracking-wide text-[var(--text-faint)]">按部署位置</span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="按部署位置筛选">
              <button type="button" aria-pressed={groupFilter === 'all'} onClick={() => setFilter('group', 'all')} className={groupFilter === 'all' ? 'fa-filter-chip rounded-full border border-[var(--accent)]/55 bg-[var(--accent)]/10 px-3 py-1.5 text-[11px] text-[var(--accent-text)]' : 'fa-filter-chip rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] text-[var(--text-dim)]'}>
                全部位置
              </button>
              {deployed.groups.map((group) => (
                <button key={group.id} type="button" aria-pressed={groupFilter === group.id} onClick={() => setFilter('group', group.id)} className={groupFilter === group.id ? 'fa-filter-chip rounded-full border border-[var(--accent)]/55 bg-[var(--accent)]/10 px-3 py-1.5 text-[11px] text-[var(--accent-text)]' : 'fa-filter-chip rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] text-[var(--text-dim)]'}>
                  {group.name} <span className="mono ml-1 text-[10px] opacity-70">{group.items.length}</span>
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="fa-deployed-filter-footer flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line-soft)] pt-2">
              <p className="text-[11px] text-[var(--text-dim)]">当前匹配 <strong className="mono text-[var(--text-strong)]">{filteredCount}</strong> 个实例</p>
              <button type="button" onClick={clearFilters} className="text-[11px] text-[var(--accent-text)] hover:underline">清除筛选</button>
            </div>
          ) : null}
        </div>
      </section>

      {!hasActiveFilters && filteredGroups.length > 1 ? (
        <div className="flex justify-end">
          <button type="button" onClick={() => setExpandedGroups(allExpanded ? new Set() : new Set(filteredGroups.map((group) => group.id)))} className="text-[11px] text-[var(--text-faint)] hover:text-[var(--text-strong)]">
            {allExpanded ? '收起全部分组' : '展开全部分组'}
          </button>
        </div>
      ) : null}

      {filteredGroups.length ? filteredGroups.map((group) => {
        const isExpanded = hasActiveFilters || expandedGroups.has(group.id)
        const groupCounts = group.items.reduce((counts, item) => {
          const kind = deploymentStatusKind(probeByKey.get(`${group.id}:${item.id}`))
          counts[kind] += 1
          return counts
        }, { down: 0, ok: 0, redirect: 0, restricted: 0, unknown: 0 })
        const panelId = `deployed-group-${group.id}`
        return (
          <section key={group.id} className="fa-surface overflow-hidden">
            <button
              type="button"
              disabled={hasActiveFilters}
              title={hasActiveFilters ? '筛选结果会自动展开；清除筛选后可折叠分组' : '展开或收起该分组'}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              onClick={() => toggleGroup(group.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--ink-tint)]"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-[var(--text-strong)]">{group.name}</span>
                  <span className="mono text-[10px] text-[var(--text-faint)]">{group.items.length} 个实例</span>
                </span>
                <span className="mt-1 block truncate text-[11px] text-[var(--text-faint)]">{group.note}</span>
                <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                  {probeState === 'loading' ? (
                    <span className="text-[var(--text-faint)]" aria-busy="true">探测快照加载中…</span>
                  ) : (
                    <>
                      {groupCounts.down ? <span className="text-[var(--down-text)]">不可达 {groupCounts.down}</span> : null}
                      {groupCounts.ok ? <span className="text-[var(--accent-text)]">正常 {groupCounts.ok}</span> : null}
                      {groupCounts.restricted ? <span className="text-[var(--text-dim)]">受限 {groupCounts.restricted}</span> : null}
                      {groupCounts.redirect ? <span className="text-[var(--text-faint)]">重定向 {groupCounts.redirect}</span> : null}
                      {groupCounts.unknown ? <span className="text-[var(--text-faint)]">未探测 {groupCounts.unknown}</span> : null}
                    </>
                  )}
                </span>
              </span>
              <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-4 w-4 shrink-0 text-[var(--text-faint)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="m6 3 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div id={panelId} hidden={!isExpanded} className="border-t border-[var(--line-soft)] p-3.5">
              {isExpanded ? (
                <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 2xl:grid-cols-3">
                  {group.items.map((item) => (
                    <ServiceRow key={item.id} item={item} result={probeByKey.get(`${group.id}:${item.id}`)} probeLoading={probeState === 'loading'} />
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        )
      }) : (
        <section className="fa-surface-muted px-5 py-10 text-center">
          <p className="text-sm font-semibold text-[var(--text-strong)]">没有找到匹配的服务</p>
          <p className="mt-1 text-xs text-[var(--text-faint)]">换个关键词，或清除当前筛选条件。</p>
          <button type="button" onClick={clearFilters} className="mt-3 text-xs text-[var(--accent-text)] hover:underline">清除筛选</button>
        </section>
      )}

      <details className="fa-disclosure fa-surface-muted p-4">
        <summary className="cursor-pointer text-[13px] font-semibold text-[var(--text-strong)]">运行与运维说明 <span className="ml-2 text-[10px] font-normal text-[var(--text-faint)]">部署拓扑、安全边界与维护记录</span></summary>
        <ul className="fa-wrap-anywhere mt-3 space-y-1 border-t border-[var(--line-soft)] pt-3 text-[11px] leading-relaxed text-[var(--text-dim)]">
          <li>· Docker 编排文件与隧道配置存放在本机 <span className="mono">~/workspace/selfhost</span>,全部 <span className="mono">restart: unless-stopped</span>。</li>
          <li>· 隧道由用户级 systemd 服务 <span className="mono">foss-labs-tunnel.service</span> 常驻,开机自启;新增域名用 <span className="mono">cloudflared tunnel route dns</span> 注册。</li>
          <li>· Cloudflare 侧的静态站与知识库镜像用 <span className="mono">wrangler</span> 部署到 Workers/Pages,自定义域直接绑在同一个 zone 上。</li>
          <li>· 本页数据源 <span className="mono">src/data/deployed.json</span>;改完推送到 main,GitHub Pages 与 Cloudflare Pages 会各自自动重新发布。</li>
          <li>· 每条状态 chip 来自发布时的只读探测(<span className="mono">npm run probe -- --out dist/probe.json</span>),是上一次发布时从公网看到的结果,<b className="text-[var(--text-strong)]">不是实时监控,也不等于完整用户流程已验证</b>。2xx 表示收到成功响应,3xx 表示重定向,401/403 通常表示需认证或访问受限;530/1033 表示隧道没有健康连接器,502/504/其他 5xx 表示网关或源站响应异常。</li>
          <li>· GitHub Pages 的 <span className="mono">{githubMirrors}</span> 个镜像仓库各自带自己的 <span className="mono">Atlas · …</span> workflow 和 <span className="mono">schedule</span>,不存在集中的调度仓库:<span className="mono">Atlas · sync upstream</span> 每天 03:23 UTC 拉上游,<span className="mono">Atlas · sync mirror</span> 每天 04:17 UTC 重建镜像内容,<span className="mono">Atlas · docs site</span> 每周一 04:37 UTC 重建文档站。</li>
          <li>· 网页终端 <span className="mono">term</span> 走 HTTP Basic 密码保护;如需更强鉴权可挂 Cloudflare Access。</li>
          <li>· 边缘小工具 <span className="mono">short</span> / <span className="mono">paste</span> 是同一个 Worker(<span className="mono">atlas-edge-kit</span>)的两个自定义域,数据存 Cloudflare KV。</li>
          <li>· <span className="mono">vault</span> / <span className="mono">book</span> / <span className="mono">sgyyyds</span> / <span className="mono">hub</span> / <span className="mono">chat</span> 五项由另一条隧道 <span className="mono">cloudflared.service</span>(<span className="mono">/etc/cloudflared/config.yml</span>)承载,与 foss-labs 相互独立,改动互不影响。</li>
          <li>· 端口统一避开本机已占用的 3000/3001/3002/8222/9090 等,新增服务前先查占用。<strong>2026-10-29 起 compose 的 38 条端口绑定只绑 <span className="mono">127.0.0.1</span></strong>(commit <span className="mono">9d444fd</span>):cloudflared 的 origin 写的就是 <span className="mono">http://localhost:PORT</span>,所以收紧以后 38 个隧道域名逐个复测与基线<strong>逐项相同</strong>(0 项变化),代价是 LAN 与 tailscale 上按端口直连不再可用(<span className="mono">192.168.0.197:8101/8103/8106 → 000</span>、<span className="mono">100.86.191.116:8101 → 000</span>),那两条链路要改走域名。故意没动的两处是 <span className="mono">2222</span>(Gitea SSH)与 <span className="mono">6881/tcp+udp</span>(qBittorrent)—— 它们要的是对外可达,收紧就等于废掉,用在哪还没定。宿主 <span className="mono">22</span> 仍开在 <span className="mono">0.0.0.0</span>,那不由 compose 管。</li>
          <li>· 后加的六项(<span className="mono">home</span> / <span className="mono">cloud</span> / <span className="mono">kb</span> / <span className="mono">matrix</span> / <span className="mono">auth</span> / <span className="mono">photos</span>)的域名在 <span className="mono">cloudflared-config.yml</span> 里排在 catch-all <span className="mono">http_status:404</span> 之前 —— 排在它之后的 hostname 永远匹配不到。</li>
          <li>· <span className="mono">kb</span> 的登录交给 <span className="mono">auth</span>:OIDC 的 scope 不是勾选项而是关联表,authentik 新建的 provider 默认一个 scope 都不带,<span className="mono">/application/o/userinfo/</span> 会回 403(Scope mismatch);已在 authentik 的库里给 Outline 挂上 <span className="mono">openid</span> / <span className="mono">profile</span> / <span className="mono">email</span> / <span className="mono">offline_access</span> 四个 managed scope mapping。</li>
          <li>· <span className="mono">kb</span> 的登录链路:<strong>已通,而且不再依赖本机 Clash</strong>。根因在 kb 容器出站到 <span className="mono">auth</span> 这个公网域名这一腿 —— 本机 IPv4 与 IPv6 直连自家 zone 的 Cloudflare 边缘 <span className="mono">:443</span> 不通,所以容器里裸取 <span className="mono">.well-known/openid-configuration</span> 实测 <strong>0/6</strong> 成功,错因全是 <span className="mono">UND_ERR_CONNECT_TIMEOUT</span>。<strong>2026-10-29 换了改法</strong>(commit <span className="mono">9d444fd</span>):issuer 改成带端口的 <span className="mono">https://auth…:8443/application/o/outline/</span> —— 同一批边缘 IP 上 <span className="mono">8443</span> / <span className="mono">2053</span> / <span className="mono">2096</span> / <span className="mono">2083</span> / <span className="mono">2087</span> 这些 Cloudflare 备用 TLS 端口是通的,于是容器里 <strong>不带任何代理</strong>就能 discovery 成功(实测 issuer 与 authorize/token/userinfo 四个端点全回在 <span className="mono">8443</span>,同一请求 <span className="mono">:443</span> 仍 <span className="mono">UND_ERR_CONNECT_TIMEOUT</span>)。<span className="mono">NODE_USE_ENV_PROXY</span> / <span className="mono">HTTPS_PROXY</span> / <span className="mono">extra_hosts</span> 三行已删,登录流量的出口不再经过 Clash 节点。浏览器侧入口仍然是无端口号的 <span className="mono">kb</span> / <span className="mono">auth</span>:authentik 注册的 redirect_uri 无端口号且 strict 匹配,kb 也不校验 id_token 的 <span className="mono">iss</span>,所以 8443 与 443 两条入口可混用。<strong>仍然遗留</strong>:Cloudflare 自己发的 <span className="mono">502</span> 偶发,归因未定 —— 遇到 <span className="mono">502</span> 先重试一次,别当成服务挂了。另外一条本机才看得见的实情:GNOME 系统代理是 <span className="mono">manual → 127.0.0.1:7897</span>,<span className="mono">ignore-hosts</span> 里只有环回与私网段,所以<strong>浏览器去自家域名的每一跳其实仍走 Clash</strong> —— 服务侧解耦了,浏览器侧没有;Clash 的 <span className="mono">enable_auto_launch</span> 已置 <span className="mono">true</span> 并补了 autostart 项,但它一停浏览器仍然打不开这些域名。</li>
          <li>· <span className="mono">auth</span> 的 worker 原本按上游 compose 以 <span className="mono">user: root</span> 直挂 <span className="mono">/var/run/docker.sock</span>(等价于宿主 root);上游文档 <span className="mono">docs.goauthentik.io</span> 自己把这个挂载写成「comes with some inherent security risks」并建议换 Docker Socket Proxy。<span className="mono">2026-10-28</span> 已换:compose 里多了一个 <span className="mono">authentik-socket-proxy</span>,worker 的 socket 挂载删掉(容器内 <span className="mono">/var/run/docker.sock</span> 已确认不存在),只靠 <span className="mono">DOCKER_HOST=tcp://authentik-socket-proxy:2375</span> 到达 daemon。代理只放行 <span className="mono">CONTAINERS</span> / <span className="mono">IMAGES</span> / <span className="mono">INFO</span> 三族的 GET,<span className="mono">POST</span> 保持关。<b>代价:</b>以后要在 authentik 里建真 Outpost(独立 proxy / LDAP / RADIUS / RAC)会失败,因为那要 POST;当前库里唯一的 outpost 是 <span className="mono">outposts/embedded</span> 且没有 service connection,所以现在没有在跑的功能依赖它。细节与实测记在 compose 注释里。</li>
          <li>· 管理员凭据只写在仓库内被 gitignore 的 <span className="mono">data/credentials.md</span>(mode 600),不进 compose、不进本页。Matrix 的注册已关,新账号只能在容器内用 <span className="mono">register_new_matrix_user</span> 开,而那需要 <span className="mono">registration_shared_secret</span> —— 部署完已从 <span className="mono">homeserver.yaml</span> 移除。</li>
          <li>· <span className="mono">photos</span> 的模型下载改写 <span className="mono">HF_ENDPOINT=https://hf-mirror.com</span>(直连 huggingface.co 不通);server 显式指向自己的 redis 与机器学习容器,不靠默认名。</li>
          <li>· <span className="mono">im</span>(Element 网页客户端)在跑,但图鉴没有 <span className="mono">element</span> 这个资源,而 deployed.json 的非 <span className="mono">own</span> 行必须挂在一个已有资源上,所以它只有容器、没有行。</li>
          <li>· <span className="mono">team</span>(Mattermost Team Edition)的登录接口读的是 <span className="mono">props["login_id"]</span> 而不是 <span className="mono">login</span> —— 上游 <span className="mono">api4/user.go</span> 与 <span className="mono">app/login.go</span> 的 <span className="mono">AuthenticateUserForLogin(id, loginId, …)</span> 就是按这两个字段取的,脚本里写成 <span className="mono">login</span> 会得到 401 和一条 <span className="mono">login_id=</span> 为空的审计记录。管理账号是用 <span className="mono">mmctl --local</span> 在容器内建的: <span className="mono">MM_SERVICESETTINGS_ENABLELOCALMODE=true</span> 让本机管理接口常开, 代价是 <span className="mono">/var/tmp/mattermost_local.socket</span> 这个套字只在容器内可访问、且谁能在容器里执行 <span className="mono">mmctl</span> 谁就是管理员;容器没有 shell, 所以脚本只能 <span className="mono">docker exec sh-mattermost /mattermost/bin/mmctl --config /mattermost/config/config.json …</span>。注册与开放注册都用 <span className="mono">ENABLEUSERCREATION=false</span> / <span className="mono">ENABLEOPENSERVER=false</span> 关掉了。</li>
          <li>· <span className="mono">graph</span> 的多用户代码执行风险是上游自己在启动日志里报的:多用户模式(<span className="mono">AUTO_LOGIN=false</span>)下 custom component 的代码是在服务进程里 exec 的,任何非管理员用户都能在这台机器上跑任意代码(<span className="mono">docs.langflow.org/deployment-block-custom-components#multi-user-code-execution</span>)。这里两把锁都上:<span className="mono">ALLOW_CUSTOM_COMPONENTS=false</span> 只让内置组件跑、<span className="mono">CUSTOM_COMPONENT_ADMIN_ONLY=true</span> 只让管理员写组件代码,并且 <span className="mono">ALLOW_COMPONENTS_PATHS_OVERRIDE=false</span> —— 上游文档写明 <span className="mono">LANGFLOW_COMPONENTS_PATH</span> 本身就是绕过前一把锁的口子。<span className="mono">SANDBOX_BACKEND</span> 保持 <span className="mono">none</span>:上游说它只隔离 Python Interpreter 与旧 REPL 组件,不隔离 custom component 代码,不能当这两把锁的替代。另外 <span className="mono">CORS</span> 默认是 <span className="mono">*</span> 加 credentials(上游自己会降级并警告),这里显式只允许自己的域名;遥测默认往 <span className="mono">api.segment.io</span> 发,<span className="mono">LANGFLOW_DO_NOT_TRACK=true</span> 关掉。sqlite 库默认落在镜像的 <span className="mono">site-packages</span> 里、换镜像即丢,已用 <span className="mono">SAVE_DB_IN_CONFIG_DIR=true</span> 连同自动生成的 <span className="mono">secret_key</span> 一起挪进 bind 卷。</li>
          <li>· 这轮补上的 <span className="mono">ai</span>(Dify)与 <span className="mono">graph</span>(Langflow)各有一条内存实测,记在这里免得下次又靠猜:<span className="mono">dify</span> 那 14 个容器合计常驻 290 MiB(单个最大 49 MiB),上游 compose 那 13 个不带 profile 的服务并不贵,<span className="mono">langflow</span> 是真贵 —— 单容器常驻 1.25 GiB、cgroup 峰值顶到 1.5 GiB,<span className="mono">--memory 768m</span> 时它绑不住 7860 端口(RSS 钉在 767.9 MiB 还在跑 alembic),所以 <span className="mono">mem_limit</span> 与 <span className="mono">memswap_limit</span> 都写 1536m 且取相同值:本机交换已用 15/16 GiB,不给它靠交换分区躲过去。</li>
          <li>· 图鉴里还有 <b className="text-[var(--text-strong)]">19 个条目只有镜像、没有实例行</b>,其中 7 个是纯文档与清单(见本段末尾),另外 12 个是这轮决定不上的:<span className="mono">cowrie</span> / <span className="mono">dionaea</span> / <span className="mono">hfish</span> / <span className="mono">T-Pot</span> 要对外开几十个 TCP 加 UDP 端口, <span className="mono">rustdesk</span> 要 21115-21119 TCP 加 21116 UDP —— 这台机器的 IPv4 出口在运营商 NAT 之后 (<span className="mono">--noproxy</span> 直连探测给 <span className="mono">36.113.117.115</span>,ipinfo 落到 <span className="mono">AS137689</span> 中国电信杭州;本机 LAN 地址是 DHCP 给的,不写死),回探这个 v4 地址上的端口一律不应答 —— 不过这条测法从 <span className="mono">9d444fd</span> 起不再能证明什么:8101/8106 现在只绑 <span className="mono">127.0.0.1</span>,从外面探必然不通,分不清是 CGNAT 挡的还是自己没开放;要重测得改用仍然对外开放的 <span className="mono">2222</span> 或 <span className="mono">6881</span> 当探针。但「IPv6 侧只有 tailscale 的私有段、没有可路由的公网前缀」这句到 2026-10-29 已经不对:<span className="mono">wlp1s0</span> 拿到了可路由的公网前缀(中国电信 <span className="mono">240e:</span> 段,SLAAC 临时地址约 2 小时轮换),tailscale 的 <span className="mono">fd7a:115c:a1e0::/64</span> 不再是唯一的 v6。有公网前缀不等于端口对外开放 —— 入站能不能从外部打穿,我没从境外 v6 源验证过;这条隧道又只有 HTTPS 入口,本地 <span className="mono">cloudflared access</span> 的子命令是 <span className="mono">tcp</span> / <span className="mono">rdp</span> / <span className="mono">ssh</span> / <span className="mono">smb</span>,没有 UDP。蜜罐的镜像其实能拉(<span className="mono">cowrie/cowrie</span> 已在本地),拒绝它的理由现在只剩两条:v4 仍在 NAT 后,加上上面那句「入站没验证」—— 公网 v6 前缀把原先「v6 也没有」这半边削掉了,所以这条判定要重测才算数;只有 <span className="mono">HFish</span> 连镜像都没有(Hub 上 <span className="mono">hacklcx/hfish</span> 404)。<span className="mono">1panel</span> 在 Hub 上没有镜像(<span className="mono">1panel/1panel</span> 404),它本来以宿主二进制发行(<span className="mono">resource.1panel.pro/v2/quick_start.sh</span> 已下载核对),且与 <span className="mono">heimdall</span> / <span className="mono">homarr</span> 重叠;<span className="mono">wetty</span> 的 <span className="mono">wettyoss/terminal</span> 也不存在(404),真实镜像 <span className="mono">butlerx/wetty</span> 能拉,但它自己的 <span className="mono">--help</span> 要求 <span className="mono">--sshuser</span> / <span className="mono">--sshpass</span> —— 等于把宿主账号交给一个 web 终端,而 <span className="mono">term</span> 已经在跑同一件事。<span className="mono">nginx-proxy-manager</span> 的镜像能拉,建管理员也<strong>能</strong>无人值守(这轮实测过,原先记在这里的理由是错的):2.16.0 的 <span className="mono">setup.js</span> 在 <span className="mono">isSetup()</span> 为假时放行一个不带凭据的 <span className="mono">POST /api/users</span> 并强制授予 <span className="mono">admin</span>(实测 201,第二次 403),另一条路是 <span className="mono">INITIAL_ADMIN_EMAIL</span> / <span className="mono">INITIAL_ADMIN_PASSWORD</span> 种子(默认值不会被创建,实测 400)。真正不上它的原因是:它没有任何 cloudflared 已经给不到的能力,却要长期在 81 端口挂一个管理面板,而且建号之前的那段窗口本身就是这台机器上一个未认证的入口;附带一条坑 —— 它启动时先抓 AWS IP 段,没有出口就一直卡住,要 <span className="mono">IP_RANGES_FETCH_ENABLED=false</span> 才起得来。<span className="mono">sing-box</span> / <span className="mono">trojan-go</span> 是出口代理,把这台机器变成中继不是这次要建的东西。剩下两项是 <span className="mono">ai</span>:<span className="mono">promptfoo</span> 走 npm/CLI(没有官方镜像,Hub 404 ×2),没有服务可部署;<span className="mono">llamaindex</span> 是框架,Hub 上 <span className="mono">llamaindex</span> 名下只有 LlamaCloud 的托管组件。另有七项(<span className="mono">gtfobins</span> / <span className="mono">lolbas</span> / <span className="mono">free-programming-books</span> / <span className="mono">awesome-selfhosted</span> / <span className="mono">awesome-hacking</span> / <span className="mono">hacktricks</span> / <span className="mono">payloadsallthethings</span>)是纯文档与清单,它们的「部署」就是已经在那里的静态镜像,给它们编一个实例行就是造假。</li>
        </ul>
      </details>
    </div>
  )
}
