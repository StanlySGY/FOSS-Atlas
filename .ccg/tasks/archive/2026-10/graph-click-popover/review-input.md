# 代码审查请求 — graph-click-popover (FOSS-Atlas, ECharts 6.1.0 + React 19)

## 需求
知识图谱交互重构，降低误触：
1. 单击节点**不再直接跳转**，改为弹出 Popover（工具名 / 一句话简介 / 标签 / 「查看详情 →」按钮）；只有点按钮才 `navigate('/wiki/:id')`。
2. 双击节点**直接跳转**（保留老用户快捷路径）。
3. Hover 节点时，与它**直接相连**的节点和边保持高亮，其余降到 `opacity 0.2`。
4. Popover 与暗色 UI 一致（深底/圆角/细边框），移动端触屏单击可用。

## 关键硬约束（来自 `.ccg/spec/frontend/index.md`，已实测）
`setOption(option, {notMerge:true})` 会**重建视图**（丢弃 roam 平移/缩放）并重新跑 force 模拟。项目因此把 force 布局冻结（`frozenLayout` + `layout:'none'`），并把取景**声明**在 option 里。推论：**任何 hover/点击交互都绝不能触发 setOption**，否则每次交互都会重置用户的平移缩放。

## 变更范围
- 改：`src/components/GraphView.jsx`、`src/pages/GraphPage.jsx`
- 新增：`src/components/GraphNodePopover.jsx`
- 未改：数据、路由、其它页面

## 已完成的实测验证（生产构建，1440×900 与 390×844 触屏）
- 单击节点 → 气泡出现，URL 不变；点「查看详情 →」→ `/wiki/ollama` ✅
- 双击节点 → `/wiki/ollama` ✅
- 空白点击 / Escape / 滚轮缩放（`graphroam`）→ 气泡关闭 ✅
- 拖拽节点 → 不弹气泡（zrender 自行抑制拖拽后的 click）✅
- Hover 后 zrender 元素状态：570/578 条边、253/267 个节点、72/72 个标签 `currentStates=['blur']` 且 `style.opacity===0.2`；仅被 hover 节点 + 其 12 个邻接节点 + 关联边保持常态 ✅
- 平移后 hover，`getOption().series[0].center` 完全不变（未重置视图）✅
- 气泡贴边：底边节点自动翻到上方；右边节点被 clamp 进容器内 ✅
- 移动端（390px，真实 touch tap）→ 气泡出现；点 CTA → `/wiki/ollama` ✅
- 非工具节点 CTA：分类「查看包含的工具 →」/ 外部服务「访问官网 →」/ 标签「查看相关工具 →」✅
- `npx oxlint` 通过；`npm run build` 通过（idempotent）

## 请审查 `review-diff.txt`
重点：
1. **正确性**：`handlersRef` + 空依赖 `useEffect` 的闭包处理是否会导致陈旧闭包？`echarts.init` 只跑一次是否与 React 19 StrictMode 双调用兼容？卸载时 `off/dispose` 是否会漏掉 zrender 上的监听（`getZr().on('click')`）？
2. **是否意外触发 setOption**：确认新代码路径（`setPopover`、`setSelected`）不会让 `option` 的 `useMemo` 依赖变化，从而破坏 roam。
3. **Popover 定位**：`offsetX/offsetY` 与固定宽高 clamp/翻转的边界情况（容器极小、节点在四角、`ESTIMATED_HEIGHT` 估计值与实际高度不符时是否会溢出）。
4. **可访问性/交互**：`onPointerDown/Up` stopPropagation 是否足够？键盘用户能否操作（Esc 已支持，按钮是原生 button）？
5. **样式一致性**：颜色/圆角/边框是否与项目暗色规范一致（`#101314` / `#23282a` / `#f0b429` / `6px`）。
6. 任何逻辑漏洞、内存泄漏、或与上述硬约束冲突的写法。

输出：Critical / Warning / Info 分级，每条给出文件:行号与具体修法。中文。
