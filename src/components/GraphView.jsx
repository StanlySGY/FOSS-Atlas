import { GraphChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EDGE_META, TYPE_META, TYPE_ORDER } from '../lib/graphStyle.js'

echarts.use([GraphChart, TooltipComponent, LegendComponent, CanvasRenderer])

const FOCUS_ZOOM = 2.2
/*
 * The focus ring is the app accent, but the *fill* is deliberately a colour the
 * rest of the graph never uses — category nodes are already solid #f0b429, so an
 * accent-only highlight would be indistinguishable from them.
 */
const FOCUS_RING = '#f0b429'
const FOCUS_FILL = '#f5f0e6'

export default function GraphView({ graph, enabledEdges, onSelect, selectedId, focusId }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
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

  // The series is fed `graph.nodes` in order, so a node's `dataIndex` is simply
  // its position in that array — no name lookup needed.
  const focusIndex = useMemo(() => {
    if (!focusId) return -1
    return graph.nodes.findIndex((n) => n.id === focusId)
  }, [graph, focusId])

  // Where the simulation put the focused node, once it has been captured. Until
  // then the node is only marked, not framed, since its position is unknown.
  const focusPos = focusIndex >= 0 ? frozenLayout?.[focusIndex] : null

  const option = useMemo(() => {
    const nodes = graph.nodes.map((n, i) => {
      const meta = TYPE_META[n.type] ?? TYPE_META.tool
      const isSelected = n.id === selectedId
      const isFocused = n.id === focusId
      const pos = frozenLayout?.[i]
      return {
        id: n.id,
        name: n.name,
        // Present only once the simulation has been captured; `layout: 'none'`
        // then places the node here instead of running the force model.
        x: pos?.[0],
        y: pos?.[1],
        category: TYPE_ORDER.indexOf(n.type),
        symbolSize: isFocused ? meta.size * 2 : isSelected ? meta.size * 1.5 : meta.size,
        itemStyle: {
          color: isFocused
            ? FOCUS_FILL
            : n.type === 'tool' || n.type === 'external'
              ? '#101314'
              : meta.color,
          borderColor: isFocused ? FOCUS_RING : meta.color,
          borderWidth: isFocused ? 3.5 : isSelected ? 3 : 1.6,
          // A halo so the focused node reads as "you are here" even at a glance.
          shadowBlur: isFocused ? 18 : 0,
          shadowColor: 'rgba(240, 180, 41, 0.8)',
        },
        label: isFocused
          ? { show: true, color: FOCUS_RING, fontSize: 12, fontWeight: 600 }
          : { show: n.type === 'category' || n.type === 'subcategory' || n.type === 'tag' },
        _raw: n,
      }
    })

    const edges = graph.edges
      .filter((e) => enabledEdges.includes(e.type))
      .map((e) => {
        const meta = EDGE_META[e.type] ?? EDGE_META.belongs_to
        return {
          source: e.source,
          target: e.target,
          lineStyle: {
            color: meta.color,
            width: meta.width,
            curveness: meta.curveness,
            opacity: e.type === 'related' || e.type === 'alternative_to' ? 0.85 : 0.5,
          },
        }
      })

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: '#101314',
        borderColor: '#23282a',
        borderWidth: 1,
        textStyle: { color: '#cfd4d6', fontSize: 12 },
        formatter: (p) => {
          if (p.dataType === 'edge') return ''
          const raw = p.data._raw
          const kind = TYPE_META[raw.type]?.label ?? raw.type
          const extra = raw.url ? `<br/><span style="color:#7d8c93">${raw.url}</span>` : ''
          return `<b>${raw.name}</b><br/><span style="color:#7d8c93">${kind}</span>${extra}`
        },
      },
      legend: [
        {
          data: TYPE_ORDER.map((t) => TYPE_META[t].label),
          textStyle: { color: '#7d8c93', fontSize: 11 },
          icon: 'circle',
          itemWidth: 9,
          itemHeight: 9,
          bottom: 8,
          left: 'center',
          inactiveColor: '#3a4245',
        },
      ],
      series: [
        {
          type: 'graph',
          layout: frozenLayout ? 'none' : 'force',
          // Framing for the `?focus=` deep link. Declared rather than dispatched:
          // `notMerge` re-creates the view on every `setOption`, so anything
          // written imperatively is lost (and re-applied on top of itself).
          ...(focusPos ? { center: [focusPos[0], focusPos[1]], zoom: FOCUS_ZOOM } : {}),
          roam: true,
          draggable: true,
          focusNodeAdjacency: false,
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 3 },
            label: { show: true, color: '#f2f4f5' },
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
            color: '#9aa2a5',
            fontSize: 10,
            formatter: '{b}',
          },
          labelLayout: { hideOverlap: true },
          lineStyle: { color: '#2f3639', opacity: 0.6 },
          categories: TYPE_ORDER.map((t) => ({ name: TYPE_META[t].label })),
          data: nodes,
          edges,
          scaleLimit: { min: 0.25, max: 6 },
          animationDuration: 600,
          animationEasingUpdate: 'quinticInOut',
        },
      ],
    }
  }, [graph, enabledEdges, selectedId, focusId, focusPos, frozenLayout])

  useEffect(() => {
    if (!containerRef.current) return undefined
    const chart = echarts.init(containerRef.current, null, { renderer: 'canvas' })
    chartRef.current = chart

    const handleClick = (params) => {
      if (params.dataType !== 'node') return
      onSelect?.(params.data._raw)
    }
    chart.on('click', handleClick)

    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.off('click', handleClick)
      chart.dispose()
      chartRef.current = null
    }
  }, [onSelect])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return undefined
    chart.setOption(option, { notMerge: true })

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

  return <div ref={containerRef} className="h-full w-full" />
}
