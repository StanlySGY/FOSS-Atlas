import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryColor } from '../lib/categoryColor.js'
import { categories, hostFor, resourceById } from '../lib/data.js'
import { TYPE_META, TYPE_ORDER } from '../lib/graphStyle.js'

const TYPE_FILTERS = [{ id: 'all', label: '全部' }, ...TYPE_ORDER.map((id) => ({
  id,
  label: TYPE_META[id]?.label ?? id,
}))]

function categoryForNode(node) {
  const id = node.type === 'category' ? node.id.replace(/^cat:/, '') : node.category
  return categories.find((category) => category.id === id) ?? null
}

function nodeDescription(node, resource) {
  if (resource?.description) return resource.description
  if (node.type === 'category') return '一级分类 · 聚焦后查看所属工具'
  if (node.type === 'subcategory') return '二级分类 · 聚焦后查看所属工具'
  if (node.type === 'tag') return '跨分类标签 · 查看使用此标签的工具'
  if (node.type === 'external') return node.url ?? '外部服务'
  return TYPE_META[node.type]?.label ?? node.type
}

function NodeAction({ node, focusedCategory, onFocusCategory }) {
  if (node.type === 'tool' || node.type === 'own') {
    return resourceById.has(node.id) ? (
      <Link to={'/wiki/' + node.id + '/'} className="whitespace-nowrap text-[11px] text-[var(--accent-text)] hover:underline">
        打开 Wiki →
      </Link>
    ) : null
  }
  if (node.type === 'tag') {
    return <Link to={'/?q=' + encodeURIComponent(node.name)} className="whitespace-nowrap text-[11px] text-[var(--text-dim)] hover:text-[var(--accent-text)]">查找工具 →</Link>
  }
  if (node.type === 'external' && node.url) {
    return <a href={node.url} target="_blank" rel="noreferrer" className="whitespace-nowrap text-[11px] text-[var(--text-dim)] hover:text-[var(--accent-text)]">访问官网 ↗</a>
  }
  const categoryId = node.type === 'category'
    ? node.id.replace(/^cat:/, '')
    : node.type === 'subcategory'
      ? node.category
      : null
  if (!categoryId) return <span className="text-[11px] text-[var(--text-faint)]">—</span>
  const active = focusedCategory === categoryId
  return <button type="button" onClick={() => onFocusCategory(active ? null : categoryId)} className="whitespace-nowrap text-[11px] text-[var(--text-dim)] hover:text-[var(--accent-text)]">{active ? '取消聚焦' : '聚焦分类'} →</button>
}

/** A searchable companion to the canvas for exact lookup, keyboard use and small screens. */
export default function GraphNodeList({ graph, visibleIds, enabledEdges, focusId, focusedCategory, onFocusCategory }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const candidates = useMemo(
    () => graph.nodes.filter((node) => !visibleIds || visibleIds.has(node.id)),
    [graph.nodes, visibleIds],
  )

  const relationCounts = useMemo(() => {
    const counts = new Map()
    for (const edge of graph.edges) {
      if (!enabledEdges.includes(edge.type)) continue
      if (visibleIds && (!visibleIds.has(edge.source) || !visibleIds.has(edge.target))) continue
      counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1)
      counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1)
    }
    return counts
  }, [graph.edges, enabledEdges, visibleIds])

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    return candidates
      .filter((node) => typeFilter === 'all' || node.type === typeFilter)
      .filter((node) => {
        if (!q) return true
        const resource = resourceById.get(node.id)
        const category = categoryForNode(node)
        const text = [
          node.name, node.id, node.url, TYPE_META[node.type]?.label, category?.name,
          resource?.description, resource?.sub_category_name, ...(resource?.tags ?? []),
        ].filter(Boolean).join(' ').toLocaleLowerCase()
        return text.includes(q)
      })
      .sort((a, b) => {
        const typeDelta = TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
        return typeDelta || a.name.localeCompare(b.name, 'zh-CN')
      })
  }, [candidates, query, typeFilter])

  return (
    <section className="min-w-0 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)]">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-strong)]">节点列表</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-faint)]">与图谱共享当前筛选；搜索名称、分类、描述或标签，直接进入 Wiki 或聚焦分类。</p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">搜索图谱节点</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索节点…" aria-label="搜索图谱节点" className="w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--ink-sunken)] py-2 pl-9 pr-16 text-xs text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15" />
          {query ? <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[10px] text-[var(--text-faint)] hover:text-[var(--text-strong)]">清空</button> : null}
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-[var(--line-soft)] px-3 py-2.5 sm:px-4">
        {TYPE_FILTERS.map((type) => {
          const active = typeFilter === type.id
          const count = type.id === 'all' ? candidates.length : candidates.filter((node) => node.type === type.id).length
          return (
            <button key={type.id} type="button" aria-pressed={active} onClick={() => setTypeFilter(type.id)} className={[
              'rounded-full border px-2.5 py-1 text-[11px] transition-colors',
              active ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent-text)]' : 'border-[var(--line)] text-[var(--text-faint)] hover:border-[var(--line-strong)] hover:text-[var(--text-dim)]',
            ].join(' ')}>
              {type.label}<span className="mono ml-1.5 text-[10px] opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-2 text-[11px] text-[var(--text-faint)] sm:px-4">
        <span role="status" aria-live="polite">显示 <span className="mono text-[var(--text-strong)]">{results.length}</span> / {candidates.length} 个节点</span>
        <span>关系数随上方关系过滤同步</span>
      </div>

      {results.length ? (
        <div className="max-h-[min(72vh,820px)] overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[var(--ink-raised)] text-[10px] text-[var(--text-faint)]">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">节点</th>
                <th scope="col" className="hidden px-3 py-2.5 font-medium md:table-cell">类型 / 分类</th>
                <th scope="col" className="hidden whitespace-nowrap px-3 py-2.5 text-right font-medium sm:table-cell">关系数</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium sm:px-4">跳转</th>
              </tr>
            </thead>
            <tbody>
              {results.map((node) => {
                const resource = resourceById.get(node.id)
                const type = TYPE_META[node.type]
                const category = categoryForNode(node)
                const color = node.type === 'tool' && node.category ? categoryColor(node.category) : type?.color ?? 'var(--text-faint)'
                const focused = node.id === focusId
                return (
                  <tr key={node.id} className={['border-t border-[var(--line-soft)] align-top transition-colors hover:bg-[var(--ink-tint)]', focused ? 'bg-[var(--accent)]/8' : ''].join(' ')}>
                    <td className="min-w-0 px-3 py-3 sm:px-4">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border" style={{ borderColor: color, background: node.type === 'tool' || node.type === 'external' ? 'transparent' : color }} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="break-words text-xs font-semibold text-[var(--text-strong)]">{node.name}</span>
                            {focused ? <span className="rounded-full bg-[var(--accent)]/12 px-1.5 py-0.5 text-[9px] text-[var(--accent-text)]">当前焦点</span> : null}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-faint)]">{nodeDescription(node, resource)}</p>
                          {resource?.url ? <span className="mono mt-1 block truncate text-[10px] text-[var(--text-mute)]">{hostFor(resource)}</span> : null}
                          <span className="mt-1 block text-[10px] text-[var(--text-faint)] md:hidden">{type?.label ?? node.type}{category ? ' · ' + category.name : ''} · {relationCounts.get(node.id) ?? 0} 条关系</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 md:table-cell">
                      <span className="block text-[11px] text-[var(--text-dim)]">{type?.label ?? node.type}</span>
                      <span className="mt-1 block max-w-44 truncate text-[10px] text-[var(--text-faint)]">{category?.name ?? '—'}</span>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-right sm:table-cell"><span className="mono text-xs text-[var(--text-dim)]">{relationCounts.get(node.id) ?? 0}</span></td>
                    <td className="whitespace-nowrap px-3 py-3 text-right sm:px-4"><NodeAction node={node} focusedCategory={focusedCategory} onFocusCategory={onFocusCategory} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-[var(--text-dim)]">没有匹配的节点</p>
          <p className="mt-1 text-xs text-[var(--text-faint)]">试试更短的关键词，或切换上方类型筛选。</p>
          <button type="button" onClick={() => { setQuery(''); setTypeFilter('all') }} className="mt-3 text-xs text-[var(--accent-text)] hover:underline">清除搜索与类型筛选</button>
        </div>
      )}
    </section>
  )
}
