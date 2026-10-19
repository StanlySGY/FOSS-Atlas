import { GraphChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useEffect, useMemo, useRef } from 'react'
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

  // The series is fed `graph.nodes` in order, so a node's `dataIndex` is simply
  // its position in that array — no name lookup needed.
  const focusIndex = useMemo(() => {
    if (!focusId) return -1
    return graph.nodes.findIndex((n) => n.id === focusId)
  }, [graph, focusId])

  const option = useMemo(() => {
    const nodes = graph.nodes.map((n) => {
      const meta = TYPE_META[n.type] ?? TYPE_META.tool
      const isSelected = n.id === selectedId
      const isFocused = n.id === focusId
      return {
        id: n.id,
        name: n.name,
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
          layout: 'force',
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
  }, [graph, enabledEdges, selectedId, focusId])

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
    chartRef.current?.setOption(option, { notMerge: true })
  }, [option])

  /**
   * Bring a `?focus=<id>` node into view: pan it under the middle of the chart
   * and zoom in on it.
   *
   * Roaming is driven with the `graphRoam` action rather than by writing
   * `series.center`/`zoom`: those options are only read into the coord system
   * when it is created, so a plain `setOption` leaves the view where it is (and
   * the coord system then writes its *actual* centre back over ours). The action
   * is the same path a mouse wheel or drag takes.
   *
   * Two dispatches, in this order: zoom about the node's own pixel so it does
   * not move, then pan by the remaining offset to land it in the middle.
   *
   * Applied once, only after the layout has produced coordinates. Re-applying
   * would be both redundant and harmful — every `setOption` re-runs the force
   * layout, so a timer that kept "correcting" the view would keep re-seeding the
   * simulation it is trying to follow.
   */
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || focusIndex < 0) return undefined

    let cancelled = false
    let timer = 0
    let tries = 0

    const apply = () => {
      if (cancelled) return

      const series = chart.getModel()?.getSeriesByIndex(0)
      const layout = series?.getData()?.getItemLayout(focusIndex)
      const ready =
        layout && Number.isFinite(layout[0]) && Number.isFinite(layout[1]) && (layout[0] || layout[1])

      if (!ready) {
        // The force layout has not written coordinates yet.
        if (tries++ < 40) timer = setTimeout(apply, 50)
        return
      }

      const coordSys = series.coordinateSystem
      const point = coordSys.dataToPoint(layout)
      const zoom = coordSys.getRoamTransform().scaleX || 1

      chart.dispatchAction({
        type: 'graphRoam',
        seriesIndex: 0,
        zoom: FOCUS_ZOOM / zoom,
        originX: point[0],
        originY: point[1],
      })

      // Read back: the action has already moved the node, and the pan has to be
      // measured against where it ended up rather than where it started.
      const moved = coordSys.dataToPoint(layout)
      chart.dispatchAction({
        type: 'graphRoam',
        seriesIndex: 0,
        dx: chart.getWidth() / 2 - moved[0],
        dy: chart.getHeight() / 2 - moved[1],
      })

      chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: focusIndex })
    }

    timer = setTimeout(apply, 0)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [focusIndex, option])

  return <div ref={containerRef} className="h-full w-full" />
}
