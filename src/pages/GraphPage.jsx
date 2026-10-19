import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GraphView from '../components/GraphView.jsx'
import { graph, graphStats, resourceById } from '../lib/data.js'
import { EDGE_META, TYPE_META } from '../lib/graphStyle.js'

const ALL_EDGES = Object.keys(EDGE_META)

export default function GraphPage() {
  const navigate = useNavigate()
  const [enabledEdges, setEnabledEdges] = useState(ALL_EDGES)
  const [selected, setSelected] = useState(null)

  const toggleEdge = (type) => {
    setEnabledEdges((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  const handleSelect = useCallback(
    (node) => {
      if (!node) return
      if (node.type === 'tool') {
        navigate(`/wiki/${node.id}`)
        return
      }
      if (node.type === 'tag') {
        navigate(`/?q=${encodeURIComponent(node.name)}`)
        return
      }
      if (node.type === 'external') {
        // Commercial services the catalogue tools replace — open their site.
        if (node.url) window.open(node.url, '_blank', 'noopener,noreferrer')
        return
      }
      setSelected(node)
    },
    [navigate],
  )

  const contained = useMemo(() => {
    if (!selected) return []
    if (selected.type === 'category') {
      return graph.nodes
        .filter((n) => n.type === 'tool' && n.category === selected.id.replace('cat:', ''))
        .map((n) => resourceById.get(n.id))
        .filter(Boolean)
    }
    if (selected.type === 'subcategory') {
      const subId = selected.id.replace('sub:', '')
      return graph.nodes
        .filter((n) => n.type === 'tool' && n.sub_category === subId)
        .map((n) => resourceById.get(n.id))
        .filter(Boolean)
    }
    return []
  }, [selected])

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-100">知识图谱</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-neutral-400">
          {graphStats.tools} 个工具、{graphStats.categories} 个分类、{graphStats.tags} 个标签、
          {graphStats.externals} 个外部服务，共 {graphStats.edges} 条关系。
          可拖拽节点、滚轮缩放、拖动空白平移。点击工具节点跳转 Wiki，点击标签跳转搜索，点击外部服务节点打开其官网。
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mono text-[11px] text-neutral-500">关系过滤</span>
        {ALL_EDGES.map((type) => {
          const on = enabledEdges.includes(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleEdge(type)}
              className={[
                'flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-[11px] transition-colors',
                on ? 'border-[#3a4245] text-neutral-200' : 'border-[#1c2123] text-neutral-600',
              ].join(' ')}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: on ? EDGE_META[type].color : '#2a3033' }}
              />
              {EDGE_META[type].label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="h-[62vh] min-h-[420px] overflow-hidden rounded-[6px] border border-[#23282a] bg-[#0d1112]">
          <GraphView
            graph={graph}
            enabledEdges={enabledEdges}
            onSelect={handleSelect}
            selectedId={selected?.id ?? null}
          />
        </div>

        <aside className="space-y-4">
          <section className="rounded-[6px] border border-[#23282a] bg-[#101314] p-3.5">
            <h2 className="mono mb-2.5 text-[10px] uppercase tracking-wider text-neutral-500">
              图例
            </h2>
            <ul className="space-y-1.5 text-xs">
              {Object.entries(TYPE_META).map(([type, meta]) => (
                <li key={type} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border"
                    style={{ borderColor: meta.color, background: '#101314' }}
                  />
                  <span className="text-neutral-400">{meta.label}</span>
                </li>
              ))}
            </ul>
          </section>

          {selected ? (
            <section className="rounded-[6px] border border-[#23282a] bg-[#101314] p-3.5">
              <h2 className="text-sm font-semibold text-neutral-100">{selected.name}</h2>
              <p className="mono mt-1 text-[11px] text-neutral-500">
                {TYPE_META[selected.type]?.label} · {contained.length} 个工具
              </p>
              <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                {contained.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/wiki/${r.id}`}
                      className="block truncate rounded-[3px] px-1.5 py-1 text-xs text-neutral-400 hover:bg-[#171b1c] hover:text-[#f0b429]"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="rounded-[6px] border border-[#23282a] bg-[#101314] p-3.5 text-xs leading-relaxed text-neutral-500">
              点击<b className="text-neutral-300">分类</b>或
              <b className="text-neutral-300">子类</b>
              节点，这里会列出它包含的工具。
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
