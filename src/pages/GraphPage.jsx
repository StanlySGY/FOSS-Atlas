import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import GraphNodePopover from '../components/GraphNodePopover.jsx'
import GraphNodeList from '../components/GraphNodeList.jsx'
/*
 * The one route-level split in the app: ECharts is about a third of the shipped
 * bundle and is dead weight for a reader who only came to read a Wiki page. Kept
 * here rather than around <GraphPage> in App so the page's own copy — title,
 * counts, chips, legend — is still what `scripts/prerender.mjs` writes into the
 * static HTML for /graph.
 */
const GraphView = lazy(() => import('../components/GraphView.jsx'))
import {
  DEPLOY_GROUP_LABEL,
  categories,
  deployedResources,
  deployedStats,
  graph,
  graphStats,
  instancesFor,
  resourceById,
} from '../lib/data.js'
import { categoryColor } from '../lib/categoryColor.js'
import { countByType, toolsInCategory, visibleNodeIds } from '../lib/graphFilter.js'
import { setCategoryFocusParams, setDeployedOnlyParams } from '../lib/graphFilterState.js'
import { graphViewModeFromParams, setGraphViewModeParams } from '../lib/graphViewState.js'
import { EDGE_META, TYPE_META, TYPE_ORDER } from '../lib/graphStyle.js'

const ALL_EDGES = Object.keys(EDGE_META)

/** Graph node ids → catalogue records, dropping any id with no record. */
const toResources = (ids) => ids.map((id) => resourceById.get(id)).filter(Boolean)

/** Node counts per type for the whole graph — the 全部 chip's number. */
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
  // Atlas-owned services come from src/data/deployed.json and are minted as
  // catalogue records by the generator, so a bubble on one still reads as a
  // real service rather than a graph-only marker.
  own: '我自己部署并运行的服务，不是表里的第三方工具。',
}

export default function GraphPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [enabledEdges, setEnabledEdges] = useState(ALL_EDGES)
  // Below md the three control rows fold behind one button: on a phone they
  // would otherwise eat ~340px of the screen before the canvas even starts.
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  /*
   * 一级分类聚焦：null = 全览；否则只显示该分类的子图. Lives in the URL as
   * `?cat=<id>` so the catalogue can hand a filtered slice over — the home
   * page's 在知识图谱中聚焦 link and a wiki breadcrumb both name the same
   * slice on both pages. Unknown ids fall back to the full view. (It used to
   * be component state only; the param name was reserved in this setter long
   * before the param itself was read.)
   */
  const catParam = searchParams.get('cat')
  const focusedCategory = categories.some((c) => c.id === catParam) ? catParam : null
  /*
   * 只看我部署了的 — in the URL, unlike the category focus. The 自部署服务 page
   * and the 已自部署 badges link here, and a link has to be able to say "show me
   * the running-services subgraph"; a filter that only exists as component state
   * cannot be linked to.
   *
   * Mutually exclusive with a category focus: GraphView's visibleIds gives one
   * filter precedence, so both being on would silently ignore whichever it did
   * not honour — a control that appears to do nothing is worse than one that
   * clears the other. That rule only held in *one* direction: this setter
   * cleared the category focus, while picking a category left `?deployed=1`
   * sitting in the address, where visibleIds never looks at the category at
   * all. The chip lit up as pressed and the canvas stayed byte-for-byte
   * identical — which is what "clicking a 分类 does nothing" looks like from the
   * other side of the screen. Both setters now clear the other side, so neither
   * filter can ride on top of the other.
   */
  const deployedOnly = searchParams.get('deployed') === '1'
  const viewMode = graphViewModeFromParams(searchParams)

  /*
   * The half that was missing. Picking (or clearing) a category drops
   * `?deployed=1` out of the address: the two filters cannot both be honoured,
   * so the choice has to change the canvas rather than only change the chip's
   * own colour. Going back through 全部 clears it too — 全部 means the whole
   * graph, which is not what was on screen while the deployed filter held it
   * down.
   */
  const setCategoryFocus = useCallback(
    (next) => setSearchParams((prev) => setCategoryFocusParams(prev, next), { replace: true }),
    [setSearchParams],
  )

  const setDeployedOnly = useCallback(
    (next) => setSearchParams((prev) => setDeployedOnlyParams(prev, next), { replace: true }),
    [setSearchParams],
  )
  const [popover, setPopover] = useState(null)

  const setViewMode = useCallback(
    (next) => {
      setPopover(null)
      setSelected(null)
      setSearchParams((prev) => setGraphViewModeParams(prev, next), { replace: true })
    },
    [setSearchParams],
  )

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
   * every exit is an explicit press of this button — mis-clicks in a 643-edge
   * hairball are far more common than deliberate ones.
   */
  const primaryAction = useCallback(
    (node) => {
      // An own node is a catalogue record too (the generator mints it from
      // deployed.json), so it has a wiki page just like a third-party tool.
      if (node.type === 'tool' || node.type === 'own') {
        return { label: '查看详情 →', run: () => navigate(`/wiki/${node.id}/`) }
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

  // Escape clears whichever subgraph is narrowed — a category focus or the
  // deployed-only view — and the listener lives as long as either is active.
  useEffect(() => {
    if (!focusedCategory && !deployedOnly) return undefined
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setCategoryFocus(null)
      setDeployedOnly(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedCategory, deployedOnly, setCategoryFocus, setDeployedOnly])

  const popoverModel = useMemo(() => {
    if (!popover) return null
    const { node, point } = popover
    // `own` resolves like `tool`: both are catalogue records, one of them only
    // because the reader runs it.
    const resource = node.type === 'tool' || node.type === 'own' ? resourceById.get(node.id) : null
    const action = primaryAction(node)
    const tags = resource?.tags ?? []
    return {
      node,
      point,
      description: resource?.description || TYPE_BLURB[node.type] || '',
      tags: tags.length > 0 ? tags : [TYPE_META[node.type]?.label ?? node.type],
      // Only a deployment the reader owns gets the instance list; a third-party
      // tool with no deployment of ours stays at three lines.
      instances: instancesFor(node.id).map((i) => ({
        id: i.id,
        group: DEPLOY_GROUP_LABEL[i.group] ?? i.group,
        url: i.url,
      })),
      actionLabel: action.label,
      onAction: () => {
        setPopover(null)
        action.run()
      },
    }
  }, [popover, primaryAction])

  const contained = useMemo(() => {
    if (!selected) return []
    /*
     * Both predicates accept 自建 alongside 工具 (see toolsInCategory): the
     * generator puts Atlas-owned services under their own 分类 (Atlas 自建), and
     * a count that only matched `tool` would read 0 for that category.
     */
    if (selected.type === 'category') {
      return toResources(toolsInCategory(graph, selected.id.replace('cat:', '')))
    }
    if (selected.type === 'subcategory') {
      const subId = selected.id.replace('sub:', '')
      return toResources(
        graph.nodes
          .filter((n) => (n.type === 'tool' || n.type === 'own') && n.sub_category === subId)
          .map((n) => n.id),
      )
    }
    return []
  }, [selected])

  /*
   * The view the canvas is showing, in one place. GraphView filters with the
   * same function, so the legend's counts and the aside's tool list describe
   * the subgraph actually on screen instead of the whole graph behind it.
   */
  const viewIds = useMemo(
    () => visibleNodeIds(graph, { focusedCategory, deployedOnly }),
    [focusedCategory, deployedOnly],
  )
  const viewCount = useMemo(() => countByType(graph, viewIds), [viewIds])
  const viewTotal = Object.values(viewCount).reduce((a, b) => a + b, 0)

  /**
   * What the aside has to say. A keyboard reader can only reach a category's
   * tool list through the chips row — clicking the category *node* in the canvas
   * is the other way in, and it is unreachable without a pointer — so a focused
   * category and the deployed-only view fill the same panel.
   */
  const asideSection = useMemo(() => {
    if (selected) {
      return {
        title: selected.name,
        meta: `${TYPE_META[selected.type]?.label} · ${contained.length} 个工具`,
        items: contained,
      }
    }
    if (focusedCategory) {
      const items = toResources(toolsInCategory(graph, focusedCategory))
      return {
        title: categories.find((c) => c.id === focusedCategory)?.name ?? '当前分类',
        meta: `分类 · ${items.length} 个工具`,
        items,
      }
    }
    if (deployedOnly) {
      return {
        title: '我部署了的',
        meta: `自建 · ${deployedResources.length} 个工具`,
        items: deployedResources,
      }
    }
    return null
  }, [selected, contained, focusedCategory, deployedOnly])

  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-strong)]">知识图谱</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-dim)]">
          <span className="mono text-[var(--text-strong)]">{graphStats.tools}</span> 个工具 ·
          <span className="mono text-[var(--text-strong)]"> {graphStats.categories} </span> 个分类 ·
          <span className="mono text-[var(--text-strong)]"> {graphStats.tags} </span> 个标签 ·
          <span className="mono text-[var(--text-strong)]"> {graphStats.externals} </span> 个外部服务，
          <span className="mono text-[var(--text-strong)]">{graphStats.edges}</span> 条关系。
          其中
          <span className="mono text-[var(--own-text)]"> {deployedStats.resources} </span> 个工具我已经在跑
          （<span className="mono">{deployedStats.instances}</span> 个实例，含
          <span className="mono"> {deployedStats.own} </span> 个 Atlas 自建），下面可以只看这一部分。
          可拖拽节点、滚轮缩放、拖动空白平移。
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--line-soft)] bg-[var(--ink-card)] px-3 py-2.5">
        <div>
          <p className="text-xs font-medium text-[var(--text-strong)]">探索方式</p>
          <p className="mt-0.5 text-[10px] text-[var(--text-faint)]">图谱适合看关系，列表适合搜索、键盘浏览与精确跳转。</p>
        </div>
        <div role="group" aria-label="图谱显示方式" className="flex rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--ink-sunken)] p-0.5">
          <button type="button" aria-pressed={viewMode === 'graph'} onClick={() => setViewMode('graph')} className={[
            'rounded-[3px] px-3 py-1.5 text-[11px] transition-colors',
            viewMode === 'graph' ? 'bg-[var(--ink-tab)] text-[var(--text-strong)]' : 'text-[var(--text-faint)] hover:text-[var(--text-dim)]',
          ].join(' ')}>
            ◉ 图谱
          </button>
          <button type="button" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')} className={[
            'rounded-[3px] px-3 py-1.5 text-[11px] transition-colors',
            viewMode === 'list' ? 'bg-[var(--ink-tab)] text-[var(--text-strong)]' : 'text-[var(--text-faint)] hover:text-[var(--text-dim)]',
          ].join(' ')}>
            ☷ 列表
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
        className="self-start rounded-[var(--radius-sm)] border border-[var(--line)] px-2 py-1 text-[11px] text-[var(--text-dim)] md:hidden"
      >
        筛选与聚焦
        {focusedCategory
          ? ` · ${categories.find((c) => c.id === focusedCategory)?.name ?? ''}`
          : deployedOnly
            ? ' · 只看我部署了的'
            : ''}
      </button>

      <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-col gap-2 md:flex`}>
      {/* 一级分类聚焦：选一个分类，只留下它的子图（分类节点 + 子类 + 工具），
          其余节点整体收起，并自动框选居中。 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[var(--text-faint)]">聚焦分类</span>
        <button
          type="button"
          onClick={() => setCategoryFocus(null)}
          aria-pressed={focusedCategory === null && !deployedOnly}
          className={[
            'rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] transition-colors',
            focusedCategory === null && !deployedOnly
              ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent-text)]'
              : 'border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]',
          ].join(' ')}
        >
          全部 <span className="mono text-[10px] text-[var(--text-mute)]">{NODE_COUNT.category}</span>
        </button>
        {categories.map((cat) => {
          const on = focusedCategory === cat.id
          /*
           * Was: all 11 chips wore --accent, the same colour the *graph itself*
           * uses for every category node and for the focus ring. So the chips
           * could not tell you which category they were about — they only said
           * "a filter" — and the one colour that means "category" in the canvas
           * was spent on the control instead. Now each chip is its category's
           * hue, at rest 8% fill / 35% border and at 10% / 70% when focused —
           * the same ladder the homepage rail uses, and measured the same way,
           * at the brightest ground the bar can sit on (the warm halo peak,
           * #3b333a): labels 4.78–6.35:1 at rest and 4.60–6.78 focused, all AA
           * on their own wash; borders 1.83–2.09 at rest (a container line) and
           * 3.07–3.65 focused (a mark). The hue is also legal as text here
           * because the bar sits on the ground, not on a tinted plate — see the
           * plate list in src/lib/categoryColor.js.
           */
          const hue = categoryColor(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFocus(on ? null : cat.id)}
              aria-pressed={on}
              style={{
                color: hue,
                borderColor: `color-mix(in srgb, ${hue} ${on ? 70 : 35}%, transparent)`,
                background: `color-mix(in srgb, ${hue} ${on ? 10 : 8}%, transparent)`,
              }}
              className="rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] transition-colors"
            >
              {cat.icon} {cat.name}
              <span className="mono ml-1.5 text-[10px] text-[var(--text-mute)]">
                {graph.nodes.filter(
                  (n) => n.category === cat.id && (n.type === 'tool' || n.type === 'own'),
                ).length}
              </span>
            </button>
          )
        })}
        {deployedOnly ? (
          <span className="text-[11px] text-[var(--text-faint)]">
            （选一个分类会先退出「只看我部署了的」）
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-[var(--text-faint)]">我的基础设施</span>
        <button
          type="button"
          onClick={() => setDeployedOnly(!deployedOnly)}
          aria-pressed={deployedOnly}
          className={[
            'flex items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-1 text-[11px] transition-colors',
            deployedOnly
              ? 'border-[var(--own-text)]/65 bg-[var(--own-well)] text-[var(--text-strong)]'
              : 'border-[var(--line)] text-[var(--text-dim)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]',
          ].join(' ')}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: 'var(--own)' }}
            aria-hidden="true"
          />
          只看我部署了的
          <span className="mono text-[10px] text-[var(--text-mute)]">{deployedStats.resources}</span>
        </button>
        {deployedOnly && (
          <span className="text-[11px] text-[var(--text-faint)]">
            只留下跑着的服务，以及它们所属的子类 / 分类和把它们串起来的标签。按 Esc 退回全图。
          </span>
        )}
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
              {/*
               * The dot is a mark (an 8px opaque swatch on the page ground), so
               * it cannot wear the canvas hex: those three structural greys are
               * tuned to be *seen through* a canvas at L* 12.8 and, drawn flat
               * here, measure 2.15 / 2.48 / 1.95:1 — under the 3:1 mark floor —
               * while sitting only 2.7–6.6 ΔE76 apart. Three swatches that close
               * would promise a distinction the canvas itself does not make.
               * `chip` is the DOM value — one grey (#89839b, 3.78:1 here, 3.06 on
               * a card) for 属于 / 归类 / 标签, and the semantic edges keep their
               * hue (相关 6.25:1, 替代 3.90:1). Grey on a chip therefore means
               * "structural", and which one is told by the label and its count.
               * Off state wears --line-muted: 2.11:1 on a card, and off-ness is
               * carried by the label and the border, not by the swatch.
               */}
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background: on ? EDGE_META[type].chip ?? EDGE_META[type].color : 'var(--line-muted)',
                }}
              />
              {EDGE_META[type].label}
              <span className="mono text-[10px] text-[var(--text-mute)]">{EDGE_COUNT[type] ?? 0}</span>
            </button>
          )
        })}
      </div>
      </div>

      <div className={viewMode === 'list' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]'}>
        {viewMode === 'list' ? (
          <GraphNodeList graph={graph} visibleIds={viewIds} enabledEdges={enabledEdges} focusId={focusId} focusedCategory={focusedCategory} onFocusCategory={setCategoryFocus} />
        ) : (
        <div className="h-[62vh] min-h-[420px] overflow-hidden rounded-[6px] border border-[var(--line)] bg-[var(--ink-sunken)] md:h-[min(72vh,820px)]">
          <Suspense
            fallback={
              <div
                role="status"
                className="mono grid h-full place-items-center text-[11px] text-[var(--text-faint)]"
              >
                加载图谱…
              </div>
            }
          >
          <GraphView
            graph={graph}
            enabledEdges={enabledEdges}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onDismiss={closePopover}
            selectedId={selected?.id ?? null}
            focusId={focusId}
            focusedCategory={focusedCategory}
            deployedOnly={deployedOnly}
          >
            {popoverModel && (
              <GraphNodePopover
                node={popoverModel.node}
                point={popoverModel.point}
                description={popoverModel.description}
                tags={popoverModel.tags}
                instances={popoverModel.instances}
                actionLabel={popoverModel.actionLabel}
                onAction={popoverModel.onAction}
                onDismiss={closePopover}
              />
            )}
          </GraphView>
          </Suspense>
        </div>
        )}

        <aside className={viewMode === 'list' ? 'hidden' : 'space-y-4 lg:sticky lg:top-[4.5rem] lg:self-start'}>
          <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5">
            <h2 className="mb-2.5 text-[13px] font-semibold text-[var(--text-strong)]">
              图例
              <span className="mono ml-2 text-[11px] font-normal text-[var(--text-faint)]">
                {viewIds ? `当前视图 ${viewTotal} 个节点` : '节点'}
              </span>
            </h2>
            <ul className="space-y-1.5 text-xs">
              {TYPE_ORDER.map((type) => {
                const meta = TYPE_META[type]
                return (
                  <li key={type} className="flex items-center gap-2">
                    {/*
                      * The swatch copies how the node is actually drawn: tools and
                      * external services are hollow rings, 自建 nodes carry a solid
                      * fill (see GraphView's itemStyle). A legend that encoded it the
                      * other way round would teach the wrong reading.
                      */}
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full border"
                      style={{
                        borderColor: meta.color,
                        background: type === 'tool' || type === 'external' ? 'var(--ink-card)' : meta.color,
                      }}
                    />
                    <span className="text-[var(--text-dim)]">{meta.label}</span>
                    <span className="mono ml-auto text-[10px] text-[var(--text-faint)]">
                      {viewCount[type] ?? 0}
                    </span>
                  </li>
                )
              })}
            </ul>
            {/*
             * The 工具 swatch is one grey; the 工具 nodes on the canvas are not.
             * Each wears its 分类's hue as its ring (GraphView), so the hue on a
             * small node answers *which 分类* and 类型 comes from shape and size —
             * 46 / 26 / 15px, and only the two larger kinds are filled. The swatch
             * stays the fallback grey: eleven categories have no single hue to show.
             */}
            <p className="mt-2.5 border-t border-[var(--line-soft)] pt-2.5 text-[11px] leading-relaxed text-[var(--text-faint)]">
              工具节点的空心圆环取它所属分类的颜色；圆点大小、实心还是空心表示类型。
            </p>
          </section>

          {asideSection ? (
            <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5">
              <h2 className="text-[13px] font-semibold text-[var(--text-strong)]">{asideSection.title}</h2>
              <p className="mono mt-1 text-[11px] text-[var(--text-faint)]">{asideSection.meta}</p>
              <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                {asideSection.items.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/wiki/${r.id}/`}
                      className="block truncate rounded-[3px] px-1.5 py-1 text-xs text-[var(--text-dim)] hover:bg-[var(--ink-tint)] hover:text-[var(--accent-text)]"
                    >
                      {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5">
              <h2 className="mb-2.5 text-[13px] font-semibold text-[var(--text-strong)]">怎么逛</h2>
              <ul className="space-y-2 text-xs leading-relaxed text-[var(--text-dim)]">
                <li>
                  为了让大图更容易读，默认只显示<b className="text-[var(--text-strong)]">一级分类</b>名称；悬停节点会显示具体名称，单击后可查看完整速览。
                </li>
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
                  顶部<b className="text-[var(--text-strong)]">关系过滤</b>收窄连线：三个
                  <b className="text-[var(--text-strong)]">灰色</b>圆点是结构关系（属于 / 归类 /
                  标签），颜色只属于「相关」和「替代」
                </li>
                <li>
                  顶部<b className="text-[var(--text-strong)]">聚焦分类</b>与
                  <b className="text-[var(--own-text)]">只看我部署了的</b>把图收成一部分，这里同时列出那部分的工具
                </li>
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
