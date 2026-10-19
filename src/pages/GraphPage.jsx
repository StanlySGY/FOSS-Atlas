import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import GraphNodePopover from '../components/GraphNodePopover.jsx'
import GraphView from '../components/GraphView.jsx'
import { graph, graphStats, resourceById } from '../lib/data.js'
import { EDGE_META, TYPE_META } from '../lib/graphStyle.js'

const ALL_EDGES = Object.keys(EDGE_META)

/*
 * One-line blurbs for nodes that are not tools. A tool borrows the catalogue's
 * own `description` instead, so the bubble never has to invent copy.
 */
const TYPE_BLURB = {
  category: '工具分类，包含一批同类工具。',
  subcategory: '二级分类，挂在某个工具分类之下。',
  tag: '标签节点，用来跨分类串联功能相近的工具。',
  external: '被表中开源工具替代的商业服务，可访问其官网。',
}

export default function GraphPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [enabledEdges, setEnabledEdges] = useState(ALL_EDGES)
  const [selected, setSelected] = useState(null)
  // `{ node, point }` for the single-click peek bubble. Kept out of the ECharts
  // option on purpose: `setOption` with `notMerge` rebuilds the view and would
  // throw away the reader's pan/zoom on every click.
  const [popover, setPopover] = useState(null)

  // `?focus=<id>` is set by the "在知识图谱中查看 →" link on a wiki page, so
  // the graph can centre on the tool the reader just came from. Unknown ids are
  // ignored rather than passed down.
  const focusParam = searchParams.get('focus')
  const focusId = focusParam && resourceById.has(focusParam) ? focusParam : null

  const toggleEdge = (type) => {
    setEnabledEdges((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  /*
   * The only way out of the graph. A single click just opens the bubble, so
   * every exit is an explicit press of this button — mis-clicks in a 578-edge
   * hairball are far more common than deliberate ones.
   */
  const primaryAction = useCallback(
    (node) => {
      if (node.type === 'tool') {
        return { label: '查看详情 →', run: () => navigate(`/wiki/${node.id}`) }
      }
      if (node.type === 'tag') {
        return {
          label: '查看相关工具 →',
          run: () => navigate(`/?q=${encodeURIComponent(node.name)}`),
        }
      }
      if (node.type === 'external') {
        // Commercial services the catalogue tools replace — open their site.
        return {
          label: '访问官网 →',
          run: () => window.open(node.url, '_blank', 'noopener,noreferrer'),
        }
      }
      return { label: '查看包含的工具 →', run: () => setSelected(node) }
    },
    [navigate],
  )

  const handleNodeClick = useCallback((node, point) => setPopover({ node, point }), [])

  // The one-gesture shortcut, kept for people who already know the graph.
  const handleNodeDoubleClick = useCallback(
    (node) => {
      setPopover(null)
      primaryAction(node).run()
    },
    [primaryAction],
  )

  // Panning or zooming moves the node the bubble hangs off, so it would end up
  // pointing at empty space — same for a click on blank canvas.
  const closePopover = useCallback(() => setPopover(null), [])

  useEffect(() => {
    if (!popover) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setPopover(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [popover])

  const popoverModel = useMemo(() => {
    if (!popover) return null
    const { node, point } = popover
    const resource = node.type === 'tool' ? resourceById.get(node.id) : null
    const action = primaryAction(node)
    const tags = resource?.tags ?? []
    return {
      node,
      point,
      description: resource?.description || TYPE_BLURB[node.type] || '',
      tags: tags.length > 0 ? tags : [TYPE_META[node.type]?.label ?? node.type],
      actionLabel: action.label,
      onAction: () => {
        setPopover(null)
        action.run()
      },
    }
  }, [popover, primaryAction])

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
          可拖拽节点、滚轮缩放、拖动空白平移。<b className="text-neutral-300">单击</b>
          节点弹出速览气泡，<b className="text-neutral-300">双击</b>节点（桌面端）直接跳转。
          悬停节点可高亮它的邻居。
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
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onDismiss={closePopover}
            selectedId={selected?.id ?? null}
            focusId={focusId}
          >
            {popoverModel && (
              <GraphNodePopover
                node={popoverModel.node}
                point={popoverModel.point}
                description={popoverModel.description}
                tags={popoverModel.tags}
                actionLabel={popoverModel.actionLabel}
                onAction={popoverModel.onAction}
                onDismiss={closePopover}
              />
            )}
          </GraphView>
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
              单击<b className="text-neutral-300">分类</b>或
              <b className="text-neutral-300">子类</b>
              节点，在气泡里选择「查看包含的工具」，这里会列出它包含的工具。
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
