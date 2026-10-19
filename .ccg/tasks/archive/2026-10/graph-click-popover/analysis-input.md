# 分析输入 — graph-click-popover

## 任务
重构 FOSS-Atlas 知识图谱页（ECharts graph）的交互，降低误触：
1. 单击节点**不再**直接跳转，改为在节点旁弹出 Popover（工具名 / 一句话简介 / 标签 / 「查看详情 →」按钮）；只有点按钮才 `navigate('/wiki/:id')`。
2. 双击节点直接跳转（保留老用户快捷路径）。
3. Hover 节点时，**直接相连**的节点与边保持高亮，其余降到 `opacity 0.2`。
4. Popover 暗色风格（深底/圆角/细边框），兼容移动端触屏单击。

## 现有代码（src/components/GraphView.jsx，227 行）
- props: `{ graph, enabledEdges, onSelect, selectedId, focusId }`；返回 `<div ref={containerRef} className="h-full w-full" />`（纯 canvas，无外层 DOM wrapper）。
- 按需注册：`GraphChart, TooltipComponent, LegendComponent, CanvasRenderer`（echarts/core）。
- **硬约束**：每次 `setOption(option, {notMerge:true})` 都会重建视图（丢 roam transform）并重新跑 force 模拟。因此：force 模拟只跑一次，把 `getData().getItemLayout(i)` 抓进 `frozenRef/frozenLayout`；之后 series 用 `layout:'none'` + 每节点 `x/y`；`?focus=` 取景改为在 option 里**声明** `series.center`/`series.zoom`（`FOCUS_ZOOM=2.2`）+ 节点高亮样式（`FOCUS_FILL='#f5f0e6'`, `FOCUS_RING='#f0b429'`）。
- `option = useMemo(..., [graph, enabledEdges, selectedId, focusId, focusPos, frozenLayout])`。
- 目前仅一个 `chart.on('click')` → `onSelect(params.data._raw)`。
- 相关配置：`roam:true`, `draggable:true`, `emphasis:{focus:'adjacency', lineStyle:{width:3}, label:{show:true,color:'#f2f4f5'}}`, `lineStyle:{color:'#2f3639',opacity:0.6}`, 每节点 `itemStyle`, `labelLayout:{hideOverlap:true}`, `categories: TYPE_ORDER.map(...)`, `scaleLimit:{min:0.25,max:6}`。
- 节点类型：category(46px) / subcategory(26) / tool(15) / tag(11) / external(12)。图规模 262 节点 / 578 边。

## 已实测结论（勿重复推导）
- `click` 回调 `params`：`{dataType:'node', name:'Ollama', hasEvent:true, offX:787, offY:334}`；`params.event.offsetX/offsetY` 为 canvas 相对坐标，可用于定位 DOM popover。
- `chart.on('dblclick')` 可用且带节点 payload。
- 空白点击：`chart.getZr().on('click', e)` 触发且 `e.target === null`；`chart.on('click')` **不**触发 —— 可用来关闭气泡。
- 现状 hover 变暗很弱：`emphasis.focus='adjacency'` 下平均亮度仅 19.42 → 17.45（dispatch highlight），远未达 0.2。

## 父页面（src/pages/GraphPage.jsx）
`handleSelect(node)`：`tool` → `navigate('/wiki/'+id)`；`tag` → `navigate('/?q='+name)`；`external` → `window.open(node.url)`；`category|subcategory` → `setSelected(node)` 填充右侧列表。

## 需要回答（只做设计/风险分析，不要写文件，≤600 字）
1. 在「setOption 重建视图 + 布局已冻结」约束下，hover 邻居高亮 0.2 如何实现才**不会**触发 setOption？（考虑 `blur` 状态样式 + `emphasis.focus='adjacency'` 原生行为，以及 `blur.itemStyle/lineStyle/label` 应配在 series 还是 data 上；graph 系列的 `blur` 是否同时作用于边？有哪些坑？）
2. React 绝对定位 DOM popover 的定位与生命周期要点：容器 `position:relative`、canvas 尺寸变化 / roam 后气泡位置失效、`draggable:true` 造成的拖拽误触（mousedown→mouseup 距离判定）、移动端触屏（ECharts 在触屏上 `click` 是否可靠？是否需要 zr 的 `tap`？）。
3. 双击与单击冲突：ECharts 原生 `dblclick` 与 `click` 会先后触发，如何避免双击时「先弹气泡又跳转」的闪烁？
4. 是否有比上述方案更稳妥/更简单的替代实现（例如用 ECharts 自定义 tooltip 承载交互按钮）？说明取舍。
