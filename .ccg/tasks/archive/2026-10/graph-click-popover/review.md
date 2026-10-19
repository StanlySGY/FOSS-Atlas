# Review — graph-click-popover

## 评审来源与替代方案（重要）

AGENTS.md 要求 M 复杂度用 **antigravity + Claude 双模型**交叉评审。本次两个 backend 都不可用：

| Backend | 状态 | 替代 |
| --- | --- | --- |
| `codeagent-wrapper --backend antigravity` | 需要交互式 Google OAuth，无法在非交互环境跑 | `ccg-research` 子代理（独立检索/验证 ECharts blur 语义） |
| `codeagent-wrapper --backend claude` | 封装脚本有 bug：向 CLI 传了空值的 `--setting-sources`，把后面的 `--output-format` 吃掉，进程不产出结果 | `ccg-review` 子代理 + 直连 `claude -p --dangerously-skip-permissions --output-format stream-json` |

直连的 `claude -p` 评审进程跑了约 6 分钟后输出停在一串 `thinking_tokens` 上、未产出最终文本，随后进程与临时文件一并消失。
**因此本文件的结论来自：`ccg-review` 子代理的 1 Critical / 2 Warning / 6 Info，加上本次会话自己的实测复核。**
不接受"只跑了一个模型"的结论——所有被标记为已修复的项，都在生产构建上重新实测过（见下）。

## 需求

1. 单击节点不再跳转，改为弹出 Popover（工具名 / 一句话简介 / 标签 / 「查看详情 →」）。
2. 只有点气泡里的按钮才 `navigate('/wiki/:id')`。
3. 双击节点直接跳转（保留老用户快捷路径）。
4. Hover 节点时，直接相连的节点与边保持高亮，其余降到 `opacity 0.2`。
5. 气泡与暗色 UI 一致；移动端触屏单击可用。

## 硬约束（`.ccg/spec/frontend/index.md`）

`setOption(option, { notMerge: true })` 会**重建视图**（丢弃 roam 平移/缩放）并重跑 force 模拟。
项目因此把 force 布局冻结（`frozenLayout` + `layout: 'none'`），取景用 `series.center` / `series.zoom` **声明**。
推论：**任何 hover / 单击交互都绝不能触发 `setOption`**。

---

## Critical

### C1 — 分类/子类气泡的 CTA 会重置图谱视图（**既有行为，非本次回归**）

`GraphPage.primaryAction()` 对 `category` / `subcategory` 节点返回 `run: () => setSelected(node)`；
`selectedId` 是 `GraphView` 中 `option` 的 `useMemo` 依赖，于是写 `setOption(notMerge)` → 视图重置。

**核查结论：这是既有行为。** `git show 5247209:src/components/GraphView.jsx` 中 `selectedId` 已经在 option
依赖里（用于 `isSelected` 样式），旧的 `GraphPage` 也已经在调 `setSelected(node)`。
本次改动没有把 `selectedId` 加进依赖，也没有改变这条路径。

而且它只在用户**主动按下**「查看包含的工具 →」时发生，不会在 hover / 单击时发生，因此不违反上面的硬约束。

复核时确认（`git show 5247209:src/pages/GraphPage.jsx`）：改动前**任意节点单击**都会走 `setSelected(node)`，
也就是说旧版是"点任何节点都重置视图"。本次改动把这条路径收窄成"只有分类气泡的 CTA 才重置"，
触发面比改动前更小，属于改善而非回归。

**处置：记录为后续项，本次不修。** 评审建议的修法（`series.selectedMode: 'single'` +
`select.itemStyle` + `dispatchAction({type:'select'})`）会把选中态从 option 里挪走，
需要重新验证冻结布局，超出本次范围且会动到 C1 之外的东西。

## Warning

### W1 — `ESTIMATED_HEIGHT` 是估计值，长简介的气泡可能被卡片裁掉 → **已修复**

原实现用固定 `ESTIMATED_HEIGHT = 172` 判断气泡是否需要翻到节点上方。实测气泡高度在 164px（短简介）
到 ~200px（45 个中文字符，如 `AWS`）之间浮动，两个方向都会出错：短简介提前约 8px 翻转，
长简介则**翻转太晚**，按钮会被卡片的 `overflow-hidden` 裁掉。

修法：`useLayoutEffect` + `getBoundingClientRect()` 量真实高度（paint 前修正，无可见跳动），
`ESTIMATED_HEIGHT` 只作为首帧兜底。

**验证（生产构建）**：固定视口高度后扫出 5 个「估计值翻转 ≠ 实测值翻转」的节点
（`casaos` / `google-ai-api` / `litellm` / `woodpecker` / `drone`），实际全部跟随**实测**公式：

| node | localY | cardH | h | actualFlip | estFlip(172) | measFlip(h) | clipped |
| --- | --- | --- | --- | --- | --- | --- | --- |
| casaos | 238 | 418 | 164 | false | **true** | false | false |
| google-ai-api | 251 | 432 | 164 | false | **true** | false | false |
| litellm | 287 | 469 | 164 | false | **true** | false | false |
| woodpecker | 327 | 506 | 164 | false | **true** | false | false |
| drone | 325 | 506 | 164 | false | **true** | false | false |

另外底边节点（`Pi`, localY=523）确实翻到上方且未被裁剪（bubble bottom 741 < card bottom 786）。

### W2 — `role="dialog"` 没有焦点管理 → **已修复**

修法：`tabIndex={-1}` + `outline-none`，挂载时 `focus({ preventScroll: true })`，
卸载时把焦点还给 `document.activeElement`。
**验证**：单击节点后 `document.activeElement` 的 `role` 为 `dialog`。

## Info（已采纳）

- **I1** — `handleZrClick` 在 `e.target` 非空时直接 return，导致点击**边**或**图例**不会关闭气泡。已修：
  改成在 `chart.on('click')` 里按 `dataType !== 'node'` 关闭（图例的 `dataType` 是 `undefined`）。
  **验证**：真实 zrender 派发的边点击产生 `{ dataType: 'edge', componentType: 'series' }`，
  气泡关闭、URL 不变；图例点击同样关闭；节点点击仍正常打开气泡（回归护栏）。
- **I2** — `params.offX / params.offY` 不是 ECharts 的字段（死代码兜底）。已删，保留 `box.width / 2` 并加注释说明。
- **I3** — `focusNodeAdjacency: false` 是 `emphasis.focus` 的过时写法。已删。
- **I4** — 气泡描边 `#2c3336` 偏离项目规范 `#23282a`；箭头用 `border-0` + arbitrary `[border-bottom:...]` 很脆。
  已改为 `border-b border-l border-[#23282a]`。

## Info（记录，不修改）

- **I5** — dblclick = 两次 click + dblclick，气泡会闪一下。`handleNodeDoubleClick` 里的 `setPopover(null)` 已经压掉了大部分观感；不做手势仲裁。
- **I6** — 触屏的双击→`dblclick` 依赖浏览器（iOS Safari 通常当成缩放）。GraphPage 的说明文案已改成「双击节点（桌面端）直接跳转」。

## 既有缺陷（非本次引入，不修）

离开持有 chart 的页面时 ECharts 抛 `Cannot read properties of null (reading '0')`
（`createViewCoordSysSimply` → `viewCoordSysSetViewRect` → `legacyCopyOverallTrans`）。
已在本次改动前的生产构建上复现过。怀疑是卸载时容器塌缩而 `ResizeObserver` 仍在 `chart.resize()`。
已写入 spec 的 "Known pre-existing issue"。

---

## 复核（本次会话在生产构建上的实测）

构建：`npm run build`（`dist/assets/index-CifSZAiJ.js`），`vite preview` 于 `:4175`，base `/FOSS-Atlas/`。

| 场景 | 结果 |
| --- | --- |
| 单击工具节点 → 气泡（Poe：名称/类型/简介/标签/CTA），URL 不变 | ✅ |
| 点「查看详情 →」→ `/wiki/poe`；气泡关闭 | ✅ |
| 双击工具节点 → `/wiki/duckduckgo-ai-chat`；气泡清空 | ✅ |
| 双击分类节点 → 走 `setSelected`（既有 C1 路径），不跳转 | ✅ 符合设计 |
| 空白画布单击 → 关闭 | ✅ |
| Escape → 关闭 | ✅ |
| 滚轮缩放（`graphroam`，zoom 1 → 1.1）→ 关闭 | ✅ |
| 点击**边**（`dataType: 'edge'`）→ 关闭，URL 不变 | ✅ |
| 点击**图例** → 关闭 | ✅ |
| 拖拽节点 → 不弹气泡 | ✅ |
| Hover：画布不透明像素 80210 → 77368 → 离开后回到 80210；期间 `series.center` 原样未变（未触发 setOption） | ✅ |
| 气泡贴底自动上翻、贴边被 clamp，均未被卡片裁剪 | ✅ |
| 移动端（真实 `hasTouch` context，390×844）：tap 节点 → 气泡；tap CTA → `/wiki/duckduckgo-ai-chat`；tap 空白 → 关闭 | ✅ |
| `npx oxlint src/` 干净；`npm run build` 干净 | ✅ |

**结论**：Critical C1 为既有行为、已记录为后续项；W1/W2 与 I1–I4 已修复并在生产构建上实测通过。
