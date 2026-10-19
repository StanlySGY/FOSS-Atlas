import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard.jsx'
import {
  categories,
  countByCategory,
  countBySubCategory,
  graphStats,
  resources,
  subCategoriesByCategory,
} from '../lib/data.js'

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

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100 sm:text-2xl">
            开源白嫖资源图鉴
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
            把散落在收藏夹里的免费额度、开源自部署方案和公开 API 收进一张图里：
            <span className="mono text-neutral-300"> {graphStats.tools} </span>
            个条目、
            <span className="mono text-neutral-300"> {graphStats.categories} </span>
            个分类、
            <span className="mono text-neutral-300"> {graphStats.edges} </span>
            条关系边。点卡片看 Wiki，点「知识图谱」看全局。
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="搜索名称 / 描述 / 标签 / 域名，例如 ollama、密码、免费"
              className="mono w-full rounded-[6px] border border-[#23282a] bg-[#101314] px-3 py-2.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:border-[#f0b429]/60 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => handleQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[3px] px-1.5 py-0.5 text-xs text-neutral-500 hover:text-neutral-200"
              >
                清空
              </button>
            ) : null}
          </div>
          <span className="mono shrink-0 text-xs text-neutral-500">
            {filtered.length} / {resources.length} 条
          </span>
        </div>
      </section>

      <section className="space-y-3">
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
          <div className="flex flex-wrap gap-1.5 border-t border-[#1c2123] pt-3">
            <SubChip
              active={activeSub === 'all'}
              onClick={() => setActiveSub('all')}
              label="全部子类"
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
        <p className="rounded-[6px] border border-[#23282a] bg-[#101314] p-8 text-center text-sm text-neutral-500">
          没有匹配的资源，换个关键词试试。
        </p>
      )}
    </div>
  )
}

function CategoryTab({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[4px] border px-2.5 py-1.5 text-xs transition-colors',
        active
          ? 'border-[#f0b429]/60 bg-[#f0b429]/10 text-[#f0b429]'
          : 'border-[#23282a] text-neutral-400 hover:border-[#3a4245] hover:text-neutral-200',
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
      className={[
        'mono rounded-[3px] px-2 py-1 text-[11px] transition-colors',
        active ? 'bg-[#1b2021] text-neutral-100' : 'text-neutral-500 hover:text-neutral-300',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
