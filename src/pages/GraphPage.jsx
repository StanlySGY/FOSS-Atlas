import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import GraphNodePopover from '../components/GraphNodePopover.jsx'
import GraphView from '../components/GraphView.jsx'
import { categories, graph, graphStats, resourceById } from '../lib/data.js'
import { EDGE_META, TYPE_META, TYPE_ORDER } from '../lib/graphStyle.js'

const ALL_EDGES = Object.keys(EDGE_META)

/** Node counts per type, for the legend. Derived once from the bundled graph. */
const NODE_COUNT = graph.nodes.reduce((acc, n) => {
  acc[n.type] = (acc[n.type] ?? 0) + 1
  return acc
}, {})

/** Edge counts per type, for the relation-filter chips. */
const EDGE_COUNT = graph.edges.reduce((acc, e) => {
  acc[e.type] = (acc[e.type] ?? 0) + 1
  return acc
}, {})

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
  // 一级分类聚焦：null = 全览；否则只显示该分类的子图。
  const [focusedCategory, setFocusedCategory] = useState(null)
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

  // Escape also clears a category focus — but that listener lives for as long as
  // a focus is active, independent of any popover.
  useEffect(() => {
    if (!focusedCategory) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setFocusedCategory(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedCategory])

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
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-strong)]">知识图谱</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-dim)]">
          <span className="mono text-[var(--text-strong)]">{graphStats.tools}</span> 个工具 ·
          <span className="mono text-[var(--text-strong)]"> {graphStats.categories} </span> 个分类 ·
          <span className="mono text-[var(--text-strong)]"> {graphStats.tags} </span> 个标签 ·
          <span className="mono text-[var(--text-strong)]"> {graphStats.externals} </span> 个外部服务，
          共 <span className="mono text-[var(--text-strong)]">{graphStats.edges}</span> 条关系。
          可拖拽节点、滚轮缩放、拖动空白平移。
        </p>
      </header>

      {/* 一级分类聚焦：选一个分类，只留下它的子图（分类节点 + 子类 + 工具），
          其余节点整体收起，并自动框选居中。 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[var(--text-faint)]">聚焦分类</span>
        <button
          type="button"
          onClick={() => setFocusedCategory(null)}
          aria-pressed={focusedCategory === null}
          className={[
            'rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] transition-colors',
            focusedCategory === null
              ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]',
          ].join(' ')}
        >
          全部 <span className="mono text-[10px] opacity-60">{NODE_COUNT.category}</span>
        </button>
        {categories.map((cat) => {
          const on = focusedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFocusedCategory(on ? null : cat.id)}
              aria-pressed={on}
              className={[
                'rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] transition-colors',
                on
                  ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]',
              ].join(' ')}
            >
              {cat.icon} {cat.name}
              <span className="mono ml-1.5 text-[10px] opacity-60">
                {graph.nodes.filter((n) => n.category === cat.id && n.type === 'tool').length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[var(--text-faint)]">关系过滤</span>
        {ALL_EDGES.map((type) => {
          const on = enabledEdges.includes(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleEdge(type)}
              aria-pressed={on}
              className={[
                'flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] transition-colors',
                on
                  ? 'border-[var(--line-strong)] text-[var(--text-strong)]'
                  : 'border-[var(--line-soft)] text-[var(--text-mute)]',
              ].join(' ')}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: on ? EDGE_META[type].color : 'var(--line-muted)' }}
              />
              {EDGE_META[type].label}
              <span className="mono text-[10px] opacity-60">{EDGE_COUNT[type] ?? 0}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="h-[62vh] min-h-[420px] overflow-hidden rounded-[6px] border border-[var(--line)] bg-[var(--ink-sunken)]">
          <GraphView
            graph={graph}
            enabledEdges={enabledEdges}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onDismiss={closePopover}
            selectedId={selected?.id ?? null}
            focusId={focusId}
            focusedCategory={focusedCategory}
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

        <aside className="space-y-4 lg:sticky lg:top-[4.5rem] lg:self-start">
          <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5">
            <h2 className="mono mb-2.5 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
              图例 · 节点
            </h2>
            <ul className="space-y-1.5 text-xs">
              {TYPE_ORDER.map((type) => {
                const meta = TYPE_META[type]
                return (
                  <li key={type} className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full border"
                      style={{ borderColor: meta.color, background: 'var(--ink-card)' }}
                    />
                    <span className="text-[var(--text-dim)]">{meta.label}</span>
                    <span className="mono ml-auto text-[10px] text-[var(--text-faint)]">
                      {NODE_COUNT[type] ?? 0}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          {selected ? (
            <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5">
              <h2 className="text-sm font-semibold text-[var(--text-strong)]">{selected.name}</h2>
              <p className="mono mt-1 text-[11px] text-[var(--text-faint)]">
                {TYPE_META[selected.type]?.label} · {contained.length} 个工具
              </p>
              <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                {contained.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/wiki/${r.id}`}
                      className="block truncate rounded-[3px] px-1.5 py-1 text-xs text-[var(--text-dim)] hover:bg-[var(--ink-tint)] hover:text-[var(--accent)]"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5">
              <h2 className="mono mb-2.5 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
                怎么逛
              </h2>
              <ul className="space-y-2 text-xs leading-relaxed text-[var(--text-dim)]">
                <li>
                  <b className="text-[var(--text-strong)]">单击</b>节点看速览，气泡里再决定去向
                </li>
                <li>
                  <b className="text-[var(--text-strong)]">双击</b>工具节点直接进 Wiki
                </li>
                <li>
                  点<b className="text-[var(--text-strong)]">分类 / 子类</b>节点的「查看包含的工具」
                  会在这里列出它包含的工具
                </li>
                <li>
                  顶部<b className="text-[var(--text-strong)]">关系过滤</b>可按关系类型收窄连线
                </li>
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
