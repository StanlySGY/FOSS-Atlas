import { GraphChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useEffect, useMemo, useRef } from 'react'
import { EDGE_META, TYPE_META, TYPE_ORDER } from '../lib/graphStyle.js'

echarts.use([GraphChart, TooltipComponent, LegendComponent, CanvasRenderer])

export default function GraphView({ graph, enabledEdges, onSelect, selectedId }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)

  const option = useMemo(() => {
    const nodes = graph.nodes.map((n) => {
      const meta = TYPE_META[n.type] ?? TYPE_META.tool
      const isSelected = n.id === selectedId
      return {
        id: n.id,
        name: n.name,
        category: TYPE_ORDER.indexOf(n.type),
        symbolSize: isSelected ? meta.size * 1.5 : meta.size,
        itemStyle: {
          color: n.type === 'tool' || n.type === 'external' ? '#101314' : meta.color,
          borderColor: meta.color,
          borderWidth: isSelected ? 3 : 1.6,
        },
        label: { show: n.type === 'category' || n.type === 'subcategory' || n.type === 'tag' },
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
            layoutAnimation: true,
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
  }, [graph, enabledEdges, selectedId])

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

  return <div ref={containerRef} className="h-full w-full" />
}
