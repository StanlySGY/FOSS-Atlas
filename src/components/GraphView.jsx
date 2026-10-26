import { GraphChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { categoryColor } from '../lib/categoryColor.js'
import { CANVAS, EDGE_META, TYPE_META, TYPE_ORDER } from '../lib/graphStyle.js'
import { visibleNodeIds } from '../lib/graphFilter.js'

echarts.use([GraphChart, TooltipComponent, LegendComponent, CanvasRenderer])

const FOCUS_ZOOM = 2.2
// A focused subgraph is scaled to fill this fraction of the full-graph frame,
// leaving a margin so edge nodes are not flush against the viewport.
const CATEGORY_FIT = 0.72
/*
 * The focus ring is the app accent, but the *fill* is deliberately a colour the
 * rest of the graph never uses — category nodes are already solid #f0b429, so an
 * accent-only highlight would be indistinguishable from them.
 */
const FOCUS_RING = CANVAS.focusRing
const FOCUS_FILL = CANVAS.focusFill

// Everything that is not adjacent to the hovered node fades to this.
const BLUR_OPACITY = 0.2

/*
 * ECharts paints text onto a canvas, so it never inherits the page font stack —
 * without this, Chinese node labels fall back to whatever the canvas default
 * has and turn into tofu. Mirrors the body stack in index.css.
 */
const GRAPH_FONT = [
  '"Noto Sans SC"',
  '"Noto Sans CJK SC"',
  '"Source Han Sans SC"',
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  '"WenQuanYi Micro Hei"',
  'ui-sans-serif',
  'system-ui',
  '"Segoe UI"',
  'Roboto',
  'sans-serif',
].join(', ')

export default function GraphView({
  graph,
  enabledEdges,
  selectedId,
  focusId,
  focusedCategory,
  deployedOnly,
  onNodeClick,
  onNodeDoubleClick,
  onDismiss,
  children,
}) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  /*
   * Reduced-motion readers get no entry/update animation. The force layout is
   * already settled up front (`layoutAnimation: false`), so this only drops the
   * fade-in and the pan/zoom tween. Guarded on `typeof window` because
   * `scripts/prerender.mjs` renders this component in Node.
   */
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )
  /*
   * A `graph` series with `layout: 'force'` re-seeds the simulation on every
   * `setOption`, so toggling a relation filter would scatter the graph — and
   * because `notMerge` rebuilds the view, the roam transform goes with it, which
   * is what made an immediate re-centring *compound* its zoom. The simulation is
   * therefore run exactly once; its result is captured and every later
   * `setOption` re-places the nodes from those fixed coordinates. With the layout
   * deterministic, the focus framing can simply be declared in the option
   * (`center` + `zoom`) and is re-applied identically on every render.
   */
  const frozenRef = useRef(null)
  const [frozenLayout, setFrozenLayout] = useState(null)

  /*
   * Node id -> index into `graph.nodes`. The frozen layout is an array indexed by
   * that position, so positions must be looked up by id rather than by the
   * *display* array index — category focus filters the display array, which would
   * otherwise shift every position.
   */
  const nodeIndex = useMemo(() => {
    const m = new Map()
    graph.nodes.forEach((n, i) => m.set(n.id, i))
    return m
  }, [graph])

  const posOf = useCallback(
    (id) => {
      const i = nodeIndex.get(id)
      return i == null ? undefined : frozenLayout?.[i]
    },
    [nodeIndex, frozenLayout],
  )

  // Where the simulation put the focused node, once it has been captured. Until
  // then the node is only marked, not framed, since its position is unknown.
  const focusPos = focusId ? posOf(focusId) : null

  /*
   * Identity of the current framing. Changing it rebuilds the ECharts instance
   * so the series is created with `center`/`zoom` already in place — the only
   * path ECharts honours them on (see the init effect). Relation-filter toggles
   * are deliberately *not* part of this key: they must keep the current roam.
   */
  const viewKey = `${focusId ?? ''}|${focusedCategory ?? ''}|${deployedOnly ? 1 : 0}`

  /*
   * What stays on the canvas — a 一级分类 subgraph, the running-services
   * subgraph, or everything. The rules live in src/lib/graphFilter.js because
   * the page needs the same answer for its legend counts and its tool list; the
   * hidden nodes are mapped to opacity 0 rather than removed, so the coordinate
   * space the framing is expressed in never changes. See the note in `option`.
   */
  const visibleIds = useMemo(
    () => visibleNodeIds(graph, { focusedCategory, deployedOnly }),
    [graph, focusedCategory, deployedOnly],
  )

  /*
   * Framing transform for category focus. ECharts renders a graph series so that
   * the *full* node cloud fits the viewport at zoom 1, so a subgraph that spans
   * `s` of the full extent's `S` needs `zoom ≈ S / s` to fill the same viewport.
   * Both extents come from the frozen layout, so the transform is stable across
   * re-renders (and identical on every relation-filter toggle). Null until the
   * simulation has been captured, at which point the graph simply shows unframed
   * rather than jumping.
   */
  const categoryFrame = useMemo(() => {
    if (!frozenLayout) return null

    const extent = (predicate) => {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      let n = 0
      for (const node of graph.nodes) {
        if (predicate && !predicate(node)) continue
        const p = posOf(node.id)
        if (!p) continue
        n++
        if (p[0] < minX) minX = p[0]
        if (p[1] < minY) minY = p[1]
        if (p[0] > maxX) maxX = p[0]
        if (p[1] > maxY) maxY = p[1]
      }
      return n ? { minX, minY, maxX, maxY, span: Math.max(maxX - minX, maxY - minY) } : null
    }

    const full = extent(null)
    if (!full) return null
    if (!visibleIds) return null
    const sub = extent((node) => visibleIds.has(node.id))
    if (!sub) return null

    return {
      center: [(sub.minX + sub.maxX) / 2, (sub.minY + sub.maxY) / 2],
      // At zoom 1 ECharts fits the full graph extent to the canvas, so the zoom
      // that fits just the subgraph is full/sub — scaled by CATEGORY_FIT to
      // leave a margin, and never below 1 (a subgraph that already spans the
      // whole graph should not shrink).
      zoom: Math.max(1, (CATEGORY_FIT * full.span) / sub.span),
    }
  }, [graph, visibleIds, frozenLayout, posOf])

  const option = useMemo(() => {
    /*
     * Category focus keeps the *full* node array and collapses the non-matching
     * nodes to zero rather than filtering them out. ECharts derives a graph
     * series' coordinate extent from the data it is given, so removing nodes
     * would silently re-scale the space the `center`/`zoom` framing is expressed
     * in — the subgraph would land off-frame. Zero-sized nodes keep the extent
     * (and therefore the framing) stable, and they draw nothing and take no
     * pointer events.
     */
    const nodes = graph.nodes.map((n) => {
      const meta = TYPE_META[n.type] ?? TYPE_META.tool
      const hidden = visibleIds ? !visibleIds.has(n.id) : false
      const isSelected = n.id === selectedId
      const isFocused = n.id === focusId
      const pos = posOf(n.id)
      return {
        id: n.id,
        name: n.name,
        // Present only once the simulation has been captured; `layout: 'none'`
        // then places the node here instead of running the force model.
        x: pos?.[0],
        y: pos?.[1],
        category: TYPE_ORDER.indexOf(n.type),
        symbolSize: hidden ? 0 : isFocused ? meta.size * 2 : isSelected ? meta.size * 1.5 : meta.size,
        itemStyle: {
          /*
           * Tools and external services are hollow — they are entries in a
           * catalogue. A 自建 node is a service that is actually running, so it
           * carries its colour as a solid fill: the type then reads from the
           * shape as well as the hue.
           *
           * A hollow 工具 ring wears its 分类's hue, which is the only thing in
           * the canvas that says which 分类 a tool belongs to without hovering it
           * — and 174 of 174 tool nodes carry a category, so the ring always has
           * an answer. It is the ring and not the fill on purpose: a category hue
           * diluted to a fill is 1.3–1.5:1 against the field, invisible; at full
           * strength a ring measures 6.95–10.94:1 on --ink-sunken. The ring is
           * 1.6px, i.e. a mark, and every category hue clears the 3:1 mark floor
           * on its own.
           *
           * 外部服务 keeps its own #c2643f instead: 0 of 24 external nodes has a
           * category (they are services outside the catalogue, so there is no
           * category to name), and its hue is the palette's only warm-red.
           *
           * The rings do overlap the solid type hues — gear ↔ 子类 7.0, vps ↔ 子类
           * 10.2, ai ↔ 分类 5.7 ΔE76 under deuteranopia — and that is accepted
           * rather than solved, because a tool ring and a category/subcategory
           * node never have to be told apart by hue alone: they are 46 / 26 / 15px
           * and the larger node is the one that is filled. 类型 stays legible from
           * shape and size; the ring adds 分类 on top of it.
           */
          color: isFocused
            ? FOCUS_FILL
            : n.type === 'tool' || n.type === 'external'
              ? CANVAS.surface
              : meta.color,
          borderColor: isFocused
            ? FOCUS_RING
            : n.type === 'tool' && n.category
              ? categoryColor(n.category)
              : meta.color,
          borderWidth: isFocused ? 3.5 : isSelected ? 3 : 1.6,
          // A halo so the focused node reads as "you are here" even at a glance.
          shadowBlur: isFocused ? 18 : 0,
          shadowColor: 'rgba(240, 180, 41, 0.8)',
          // Category focus: ECharts clamps symbolSize to a minimum, so a
          // zero-sized node still draws a dot — opacity 0 is what actually
          // removes it, while keeping the series' coordinate extent intact.
          opacity: hidden ? 0 : 1,
        },
        label: hidden
          ? { show: false }
          : isFocused
            ? { show: true, color: FOCUS_RING, fontSize: 12, fontWeight: 600, fontFamily: GRAPH_FONT }
            : { show: n.type === 'category' || n.type === 'subcategory' || n.type === 'tag' },
        _raw: n,
      }
    })

    const edges = graph.edges
      .filter((e) => enabledEdges.includes(e.type))
      .filter((e) => !visibleIds || (visibleIds.has(e.source) && visibleIds.has(e.target)))
      .map((e) => {
        const meta = EDGE_META[e.type] ?? EDGE_META.belongs_to
        return {
          source: e.source,
          target: e.target,
          lineStyle: {
            color: meta.color,
            width: meta.width,
            curveness: meta.curveness,
            opacity: meta.opacity,
          },
        }
      })

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: CANVAS.surface,
        borderColor: CANVAS.line,
        borderWidth: 1,
        textStyle: { color: CANVAS.text, fontSize: 12, fontFamily: GRAPH_FONT },
        formatter: (p) => {
          if (p.dataType === 'edge') return ''
          const raw = p.data._raw
          const kind = TYPE_META[raw.type]?.label ?? raw.type
          const extra = raw.url ? `<br/><span style="color:${CANVAS.textDim}">${raw.url}</span>` : ''
          return `<b>${raw.name}</b><br/><span style="color:${CANVAS.textDim}">${kind}</span>${extra}`
        },
      },
      legend: [
        {
          data: TYPE_ORDER.map((t) => TYPE_META[t].label),
          textStyle: { color: CANVAS.textDim, fontSize: 11, fontFamily: GRAPH_FONT },
          icon: 'circle',
          itemWidth: 9,
          itemHeight: 9,
          bottom: 8,
          left: 'center',
          inactiveColor: CANVAS.lineStrong,
        },
      ],
      series: [
        {
          type: 'graph',
          layout: frozenLayout ? 'none' : 'force',
          // Framing for the `?focus=` deep link. Declared rather than dispatched:
          // `notMerge` re-creates the view on every `setOption`, so anything
          // written imperatively is lost (and re-applied on top of itself).
          // Category focus frames the whole subgraph to fit the viewport; the
          // ?focus= deep link centres a single node. Both are *declared* (never
          // dispatched) so they survive the notMerge rebuild. Until the canvas
          // has been measured the framing is omitted rather than guessed.
          ...(categoryFrame
            ? { center: categoryFrame.center, zoom: categoryFrame.zoom }
            : focusPos
              ? { center: [focusPos[0], focusPos[1]], zoom: FOCUS_ZOOM }
              : {}),
          roam: true,
          draggable: true,
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 3 },
            label: { show: true, color: CANVAS.textStrong },
          },
          /*
           * Hover dimming for the non-adjacent surroundings. This is a *state*
           * style, never an imperative call: any `setOption` with `notMerge`
           * rebuilds the view and discards the reader's pan/zoom, so hover must
           * not touch the option at all. With `emphasis.focus: 'adjacency'`
           * ECharts applies this `blur` state to every node and edge that is not
           * directly connected to the hovered node.
           */
          blur: {
            itemStyle: { opacity: BLUR_OPACITY },
            label: { opacity: BLUR_OPACITY },
            lineStyle: { opacity: BLUR_OPACITY },
          },
          force: {
            repulsion: 190,
            edgeLength: [30, 130],
            gravity: 0.08,
            friction: 0.6,
            // ECharts' force layout needs a few hundred steps to converge. With
            // `layoutAnimation` on it spreads them over ~8s of visible drift,
            // which makes the graph unusable in the meantime — and any `setOption`
            // issued while it runs (e.g. the `?focus=` centring) is applied to
            // coordinates that move straight afterwards. Running the steps back to
            // back settles the layout once, up front, so positions are final.
            layoutAnimation: false,
          },
          label: {
            position: 'right',
            color: CANVAS.label,
            fontSize: 10,
            fontFamily: GRAPH_FONT,
            formatter: '{b}',
          },
          labelLayout: { hideOverlap: true },
          lineStyle: { color: CANVAS.edge, opacity: 0.8 },
          categories: TYPE_ORDER.map((t) => ({ name: TYPE_META[t].label })),
          data: nodes,
          edges,
          scaleLimit: { min: 0.25, max: 6 },
          animation: !reduceMotion,
          animationDuration: 600,
          animationEasingUpdate: 'quinticInOut',
        },
      ],
    }
  }, [graph, enabledEdges, selectedId, focusId, focusPos, frozenLayout, visibleIds, categoryFrame, posOf, reduceMotion])

  /*
   * The handlers are read through a ref so that the chart is initialised exactly
   * once. Passing them through the effect's dependency list would tear the chart
   * down and rebuild it (losing pan/zoom) every time the parent re-renders with
   * a fresh closure — which is now every time a popover opens.
   */
  const handlersRef = useRef({ onNodeClick, onNodeDoubleClick, onDismiss })
  useEffect(() => {
    handlersRef.current = { onNodeClick, onNodeDoubleClick, onDismiss }
  })

  useEffect(() => {
    if (!containerRef.current) return undefined
    const chart = echarts.init(containerRef.current, null, { renderer: 'canvas' })
    chartRef.current = chart

    // A single click only opens the popover; navigation is an explicit action
    // inside it. Mis-clicks in a 500-edge hairball are far more common than
    // deliberate ones, so the destructive action must not be the default.
    const handleClick = (params) => {
      const raw = params?.data?._raw
      /*
       * This fires for edges and legend swatches too, and that click is not a
       * reason to keep the bubble from the previously tapped node on screen.
       * `dataType` is undefined for legend items, hence the inverted check.
       */
      if (params?.dataType !== 'node' || !raw) {
        handlersRef.current.onDismiss?.()
        return
      }
      const box = containerRef.current.getBoundingClientRect()
      handlersRef.current.onNodeClick?.(raw, {
        // zrender always fills `offsetX/offsetY`; the centre is only a guard for
        // the unlikely case of a click delivered without a native event.
        x: params.event?.offsetX ?? box.width / 2,
        y: params.event?.offsetY ?? box.height / 2,
        width: box.width,
        height: box.height,
      })
    }

    // Double click keeps the old one-gesture shortcut.
    const handleDblClick = (params) => {
      const raw = params?.data?._raw
      if (params?.dataType !== 'node' || !raw) return
      handlersRef.current.onNodeDoubleClick?.(raw)
    }

    /*
     * A click that lands on empty canvas never reaches `chart.on('click')` — and
     * that is exactly the gesture that should dismiss the popover, so the
     * zrender-level event is the only place to hear it. Clicks on a shape (node,
     * edge, legend swatch) do reach the chart handler above, which already tells
     * them apart; here they are filtered out by `e.target`.
     */
    const handleZrClick = (e) => {
      if (e.target) return
      handlersRef.current.onDismiss?.()
    }

    // Panning or zooming moves the node the popover is anchored to, so the
    // bubble would point at empty space. Dismissing is the honest option.
    const handleRoam = () => handlersRef.current.onDismiss?.()

    chart.on('click', handleClick)
    chart.on('dblclick', handleDblClick)
    chart.getZr().on('click', handleZrClick)
    chart.on('graphroam', handleRoam)

    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.off('click', handleClick)
      chart.off('dblclick', handleDblClick)
      chart.getZr().off('click', handleZrClick)
      chart.off('graphroam', handleRoam)
      chart.dispose()
      chartRef.current = null
    }
    // The chart is torn down and rebuilt when the framing *identity* changes
    // (a category focus or a ?focus= deep link), because a graph series only
    // honours `center`/`zoom` when it is created — a later notMerge render
    // ignores them. Rebuilding is cheap here and keeps framing declarative.
  }, [viewKey])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return undefined
    chart.setOption(option, { notMerge: true })
    /*
     * `notMerge` re-creates the series, which resets the roam transform and
     * ignores a `center`/`zoom` that arrives with it on a *later* render (only
     * the series' first creation honours them — which is why the ?focus= deep
     * link, present on first mount, works). Re-apply the framing with a
     * follow-up merge once the data is in, so picking a category after load also
     * frames correctly.
     */

    // The first pass runs the force simulation. Capture where it settled and
    // re-apply the same coordinates so later `setOption` calls (relation-filter
    // toggles) are laid out deterministically instead of re-seeding the graph.
    if (frozenRef.current) return undefined
    let timer = 0
    let tries = 0
    const capture = () => {
      const data = chart.getModel()?.getSeriesByIndex(0)?.getData()
      const positions = []
      let ready = Boolean(data)
      for (let i = 0; ready && i < graph.nodes.length; i++) {
        const l = data.getItemLayout(i)
        // The layout writes coordinates asynchronously, node by node.
        if (!l || !Number.isFinite(l[0]) || !Number.isFinite(l[1])) ready = false
        else positions.push([l[0], l[1]])
      }
      if (ready) {
        frozenRef.current = positions
        setFrozenLayout(positions)
      } else if (tries++ < 100) {
        timer = setTimeout(capture, 30)
      }
    }
    capture()
    return () => clearTimeout(timer)
  }, [option, graph.nodes.length])

  /*
   * The canvas fills this box exactly, so a node's `offsetX/offsetY` is also its
   * position inside the wrapper — which is why the popover can be a plain
   * absolutely-positioned sibling rather than being drawn on the canvas.
   */
  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {children}
    </div>
  )
}
