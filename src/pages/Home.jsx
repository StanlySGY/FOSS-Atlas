import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard.jsx'
import {
  categories,
  countByCategory,
  countBySubCategory,
  graphStats,
  resources,
  subCategoriesByCategory,
} from '../lib/data.js'

/**
 * Top-of-page counters. Each tile is a live reflection of the catalogue so the
 * numbers can never drift from the data.
 */
const STATS = [
  { key: 'tools', label: '资源条目', value: graphStats.tools },
  { key: 'categories', label: '一级分类', value: graphStats.categories },
  { key: 'tags', label: '标签', value: graphStats.tags },
  { key: 'edges', label: '关系边', value: graphStats.edges },
]

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeSub, setActiveSub] = useState('all')

  // Keep the input in sync when arriving via a /?q=... link.
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null && q !== query) setQuery(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleQuery = (value) => {
    setQuery(value)
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const subs = activeCategory === 'all' ? [] : subCategoriesByCategory[activeCategory] ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return resources.filter((r) => {
      if (activeCategory !== 'all' && r.category !== activeCategory) return false
      if (activeSub !== 'all' && r.sub_category !== activeSub) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [query, activeCategory, activeSub])

  const pickCategory = (id) => {
    setActiveCategory(id)
    setActiveSub('all')
  }

  const activeCategoryName =
    activeCategory === 'all'
      ? null
      : categories.find((c) => c.id === activeCategory)?.name ?? null

  return (
    <div className="space-y-8">
      {/* Hero: title + one-line pitch + hard numbers. */}
      <section className="space-y-5 pt-2">
        <div className="max-w-3xl space-y-3">
          <span className="mono inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ink-raised)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Navigation · Wiki · Knowledge Graph
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-[2rem]">
            开源白嫖资源图鉴
          </h1>
          <p className="text-sm leading-relaxed text-[var(--text-dim)]">
            把散落在收藏夹里的免费额度、开源自部署方案和公开 API，收进一张
            <span className="text-[var(--text-strong)]"> 可搜索、可漫游、可追溯</span>
            的图里。点卡片看 Wiki，点「知识图谱」看全局。
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.key}
              className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] px-4 py-3"
            >
              <dd className="mono text-xl font-semibold text-[var(--text-strong)]">{s.value}</dd>
              <dt className="mt-0.5 text-[11px] text-[var(--text-faint)]">{s.label}</dt>
            </div>
          ))}
        </dl>
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
          <span className="mono shrink-0 text-xs text-[var(--text-faint)] sm:min-w-[7rem] sm:text-right">
            <span className="text-[var(--text-strong)]">{filtered.length}</span> / {resources.length} 条
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
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
            />
          ))}
        </div>

        {subs.length > 1 ? (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--line-soft)] pt-3">
            <span className="mono mr-1 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
              {activeCategoryName} · 子类
            </span>
            <SubChip
              active={activeSub === 'all'}
              onClick={() => setActiveSub('all')}
              label="全部"
            />
            {subs.map((sub) => (
              <SubChip
                key={sub.id}
                active={activeSub === sub.id}
                onClick={() => setActiveSub(sub.id)}
                label={`${sub.name} (${countBySubCategory[sub.id] ?? 0})`}
              />
            ))}
          </div>
        ) : null}
      </section>

      {filtered.length ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </section>
      ) : (
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-10 text-center">
          <p className="text-sm text-[var(--text-dim)]">没有匹配的资源，换个关键词试试。</p>
          <button
            type="button"
            onClick={() => {
              handleQuery('')
              pickCategory('all')
            }}
            className="mt-3 text-xs text-[var(--accent)] hover:underline"
          >
            重置筛选
          </button>
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--text-faint)]">
        想要更立体地浏览？试试{' '}
        <Link to="/graph" className="text-[var(--accent)] hover:underline">
          知识图谱 →
        </Link>
      </p>
    </div>
  )
}

function CategoryTab({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-[var(--radius-sm)] border px-2.5 py-1.5 text-xs transition-colors',
        active
          ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]'
          : 'border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]',
      ].join(' ')}
    >
      {label}
      <span className="mono ml-1.5 text-[10px] opacity-60">{count}</span>
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
        'mono rounded-[3px] px-2 py-1 text-[11px] transition-colors',
        active
          ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
          : 'text-[var(--text-faint)] hover:text-[var(--text-strong)]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
