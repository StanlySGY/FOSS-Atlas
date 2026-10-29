import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard.jsx'
import { categoryColor } from '../lib/categoryColor.js'
import { queryFromSearchParams, resetCatalogFiltersParams } from '../lib/catalogFilterState.js'
import {
  categories,
  countByCategory,
  countBySubCategory,
  deployedStats,
  graphStats,
  resources,
  subCategoriesByCategory,
} from '../lib/data.js'

/**
 * Top-of-page counters. Each tile is a live reflection of the catalogue so the
 * numbers can never drift from the data.
 */
/*
 * Two numbers get a tile: how much is here, and how much of it I run. The other
 * three (一级分类 / 标签 / 关系边) describe the *shape* of the same dataset
 * rather than its size, and as tiles of identical weight they competed with the
 * two that a reader actually acts on — five boxes reading as one flat row said
 * "these are all equally worth knowing", which is not true of 11.
 *
 * They stay on the page as a mono line under the pitch, the way the graph page
 * already states its counts, so the two views agree.
 */
const SHAPE = [
  { key: 'categories', label: '一级分类', value: graphStats.categories },
  { key: 'tags', label: '标签', value: graphStats.tags },
  { key: 'edges', label: '关系边', value: graphStats.edges },
]

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => queryFromSearchParams(searchParams))
  /*
   * 分类与子类跟 q / deployed 一样住在 URL 里：面包屑（Wiki 页的分类 /
   * 子类）、卡片上的子类标签和标签链回这里时，地址要能直接说出「哪个分类、
   * 哪个子类」。未知分类回退到 all；子类必须属于当前分类，否则一并回退。
   */
  /*
   * 只看我部署了的 — in the URL, for the same reason the graph keeps it there:
   * the 自部署服务 page and a deployed row need to be able to hand the reader a
   * link that says "the catalogue, narrowed to what runs". `deployed=1` is the
   * same parameter name on /graph and here, so the two views agree on the address.
   */
  const deployedOnly = searchParams.get('deployed') === '1'

  const catParam = searchParams.get('cat')
  const activeCategory = categories.some((c) => c.id === catParam) ? catParam : 'all'
  const subParam = searchParams.get('sub')
  const subs = activeCategory === 'all' ? [] : subCategoriesByCategory[activeCategory] ?? []
  const activeSub = subs.some((s) => s.id === subParam) ? subParam : 'all'

  const patchParams = (mutate) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        mutate(p)
        return p
      },
      { replace: true },
    )
  }
  const setDeployedOnly = (next) =>
    patchParams((p) => {
      if (next) p.set('deployed', '1')
      else p.delete('deployed')
    })

  // Keep the input in sync when arriving via a /?q=... link.
  useEffect(() => {
    const q = queryFromSearchParams(searchParams)
    if (q !== query) setQuery(q)
    // A missing `q` is meaningful too: tag/category links must not leave a stale query in the input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleQuery = (value) => {
    setQuery(value)
    patchParams((p) => {
      if (value) p.set('q', value)
      else p.delete('q')
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return resources.filter((r) => {
      if (deployedOnly && !r.deployed) return false
      if (activeCategory !== 'all' && r.category !== activeCategory) return false
      if (activeSub !== 'all' && r.sub_category !== activeSub) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        (r.category_name ?? '').toLowerCase().includes(q) ||
        (r.sub_category_name ?? '').toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [query, activeCategory, activeSub, deployedOnly])

  const pickCategory = (id) =>
    patchParams((p) => {
      if (id === 'all') p.delete('cat')
      else p.set('cat', id)
      p.delete('sub')
    })

  const pickSub = (id) =>
    patchParams((p) => {
      if (id === 'all') p.delete('sub')
      else p.set('sub', id)
    })

  const activeCategoryName =
    activeCategory === 'all'
      ? null
      : categories.find((c) => c.id === activeCategory)?.name ?? null

  const resetFilters = () => {
    setQuery('')
    setSearchParams((prev) => resetCatalogFiltersParams(prev), { replace: true })
  }
  const hasActiveFilters = Boolean(query.trim() || activeCategory !== 'all' || activeSub !== 'all' || deployedOnly)

  return (
    <div className="space-y-8">
      {/* Hero: title + one-line pitch + hard numbers. */}
      <section className="space-y-5 pt-2">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight text-[var(--text-strong)] sm:text-[2.4rem]">
            开源<span className="text-[var(--accent)]">白嫖</span>资源图鉴
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-dim)]">
            把散落在收藏夹里的免费额度、开源自部署方案和公开 API，收进一张可搜索、可漫游、可追溯的图里。点卡片看
            Wiki，点「知识图谱」看全局。
          </p>
        </div>

        <div className="max-w-xl space-y-2">
          <div className="mono flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[11px] text-[var(--text-faint)]">
            {SHAPE.map((s) => (
              <span key={s.key}>
                <span className="text-[var(--text-dim)]">{s.value}</span> {s.label}
              </span>
            ))}
          </div>

          {/*
           * A <div> grid rather than a <dl>: the second cell is a button, and a
           * button is not a permitted child of <dl>. The label sits under its
           * number the same way either would have.
           */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] px-4 py-3">
              <span className="mono block text-2xl font-semibold text-[var(--text-strong)]">
                {graphStats.tools}
              </span>
              <span className="mt-0.5 block text-[11px] text-[var(--text-faint)]">资源条目</span>
            </div>

          {/*
           * The second tile is not a catalogue fact — it is how much of the
           * catalogue I actually run, and it is a control: pressing it narrows the
           * card grid below to those entries. It wears the 自建 hue rather than
           * the accent so it reads as "mine", not as another count of the same
           * kind as the one beside it.
           */}
          <button
            type="button"
            onClick={() => setDeployedOnly(!deployedOnly)}
            aria-pressed={deployedOnly}
            title={`${deployedStats.instances} 个实例 · ${deployedStats.own} 个 Atlas 自建`}
            className={[
              'rounded-[var(--radius)] border px-4 py-3 text-left transition-colors',
              deployedOnly
                ? 'border-[var(--own-text)]/65 bg-[var(--own-well)]'
                : 'border-[var(--line)] bg-[var(--ink-card)] hover:border-[var(--own-text)]/65',
            ].join(' ')}
          >
            <span className="mono block text-2xl font-semibold text-[var(--text-strong)]">
              {deployedStats.resources}
            </span>
            <span className="mt-0.5 block text-[11px] text-[var(--own-text)]">
              已自部署{deployedOnly ? ' · 只看这些' : ''}
            </span>
          </button>
          </div>
        </div>

        {deployedOnly ? (
          <p className="text-[11px] text-[var(--text-faint)]">
            卡片已收窄到我在跑的条目（<span className="mono text-[var(--own-text)]">{filtered.length}</span> 条）。
            再点一次上面那格退回全部，或者
            <Link to="/graph/?deployed=1" className="ml-1 text-[var(--own-text)] hover:underline">
              在图谱里看这一部分 →
            </Link>
          </p>
        ) : null}

      </section>

      {/* Toolbar: search + live result count, then the category rail. */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="搜索名称 / 描述 / 标签 / 域名，例如 ollama、密码、免费"
              className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] py-2.5 pl-9 pr-16 text-xs text-[var(--text)] placeholder:text-[var(--text-faint)] transition-colors focus:border-[var(--accent)]/60 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => handleQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[3px] px-1.5 py-0.5 text-xs text-[var(--text-faint)] transition-colors hover:text-[var(--text-strong)]"
              >
                清空
              </button>
            ) : null}
          </div>
          <span
            className="mono shrink-0 text-xs text-[var(--text-faint)] sm:min-w-[7rem] sm:text-right"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-[var(--text-strong)]">{filtered.length}</span> / {resources.length} 条
          </span>
        </div>

        {/*
         * The rail scrolls sideways on a phone instead of wrapping into a wall
         * of pills; from `sm:` up there is room to wrap again.
         */}
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <CategoryTab
            active={activeCategory === 'all'}
            onClick={() => pickCategory('all')}
            label="全部"
            count={resources.length}
          />
          {categories.map((cat) => (
            <CategoryTab
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => pickCategory(cat.id)}
              label={`${cat.icon} ${cat.name}`}
              count={countByCategory[cat.id] ?? 0}
              color={categoryColor(cat.id)}
            />
          ))}
        </div>

        {subs.length > 1 ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[var(--line-soft)] pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] text-[var(--text-faint)]">
                {activeCategoryName} · 子类
              </span>
              <SubChip
                active={activeSub === 'all'}
                onClick={() => pickSub('all')}
                label="全部"
              />
              {subs.map((sub) => (
                <SubChip
                  key={sub.id}
                  active={activeSub === sub.id}
                  onClick={() => pickSub(sub.id)}
                  label={`${sub.name} (${countBySubCategory[sub.id] ?? 0})`}
                />
              ))}
            </div>
            {/*
             * One hop from a filtered catalogue to the same slice of the graph:
             * `?cat=` is the graph's category-focus deep link, so the address
             * that says "these tools" keeps saying it on the other page.
             */}
            <Link
              to={`/graph/?cat=${encodeURIComponent(activeCategory)}`}
              className="text-[11px] text-[var(--text-dim)] transition-colors hover:text-[var(--accent-text)]"
            >
              在知识图谱中聚焦 {activeCategoryName} →
            </Link>
          </div>
        ) : null}
      </section>

      {hasActiveFilters ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line-soft)] bg-[var(--ink-card)] px-3 py-2.5">
          <span className="mr-1 text-[10px] text-[var(--text-faint)]">当前筛选</span>
          {query.trim() ? <button type="button" onClick={() => handleQuery('')} className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]">搜索：{query.trim()} ×</button> : null}
          {activeCategoryName ? <button type="button" onClick={() => pickCategory('all')} className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]">分类：{activeCategoryName} ×</button> : null}
          {activeSub !== 'all' ? <button type="button" onClick={() => pickSub('all')} className="rounded-full border border-[var(--line)] px-2 py-1 text-[10px] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]">子类：{subs.find((sub) => sub.id === activeSub)?.name ?? activeSub} ×</button> : null}
          {deployedOnly ? <button type="button" onClick={() => setDeployedOnly(false)} className="rounded-full border border-[var(--own-text)]/50 bg-[var(--own-well)] px-2 py-1 text-[10px] text-[var(--own-text)]">只看已部署 ×</button> : null}
          <button type="button" onClick={resetFilters} className="ml-auto text-[10px] text-[var(--accent-text)] hover:underline">清除全部</button>
        </div>
      ) : null}

      {filtered.length ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} />
          ))}
        </section>
      ) : (
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-10 text-center">
          <p className="text-sm text-[var(--text-dim)]">没有匹配的资源，换个关键词试试。</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-xs text-[var(--text-dim)] transition-colors hover:text-[var(--text-strong)] hover:underline"
          >
            重置筛选
          </button>
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--text-faint)]">
        想要更立体地浏览？试试{' '}
        <Link to="/graph/" className="text-[var(--text-dim)] transition-colors hover:text-[var(--text-strong)] hover:underline">
          知识图谱 →
        </Link>
      </p>
    </div>
  )
}

/*
 * The rail is where the 11 category hues are supposed to do their work, and
 * until now only the *active* one had a hue — the other ten were grey pills,
 * so the rail read as one undifferentiated row plus a highlighted one. Every
 * chip now carries its own category at rest (8% fill, 35% border, the hue as
 * its own label) so the row says "these are eleven different things" before
 * anything is clicked.
 *
 * Rest vs active is a change of *concentration*, not of hue: fill 8% → 10%,
 * border 35% → 70%. Measured at the worst place a chip can sit — over the
 * body's warm halo, where the ground is brightest (#3b333a, L* 22.3) — every
 * label clears AA on its own wash: 4.78:1 worst (cn-ai) to 6.35 best at rest,
 * 4.60–6.78 active. The border is 1.83–2.09:1 at rest and **3.07–3.65:1**
 * active: at rest it is a container line, when active it is a mark, which is
 * the point of the 35% → 70% step. The two concentrations were solved for
 * those two floors, not chosen — 12% fill would have put the active label at
 * 4.42:1, under AA, and 65% border at 2.79:1, under the mark floor. The wash
 * itself stays 1.107–1.190:1 against the ground: tinted, not painted.
 */
function CategoryTab({ active, onClick, label, count, color }) {
  const tint = color
    ? {
        color,
        borderColor: `color-mix(in srgb, ${color} ${active ? 70 : 35}%, transparent)`,
        background: `color-mix(in srgb, ${color} ${active ? 10 : 8}%, transparent)`,
      }
    : undefined
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={tint}
      className={[
        'shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors',
        color
          ? ''
          : 'border-[var(--line)] bg-[var(--ink-card)] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]',
      ].join(' ')}
    >
      {label}
      <span className="mono ml-1.5 text-[10px] text-[var(--text-mute)]">{count}</span>
    </button>
  )
}

function SubChip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'mono rounded-full px-2.5 py-1 text-[11px] transition-colors',
        active
          ? 'bg-[var(--accent)]/15 text-[var(--accent-text)]'
          : 'text-[var(--text-faint)] hover:text-[var(--text-strong)]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
