# Review — wiki-sidebar-layout

Wiki 阅读体验重构：路由/布局分离 + 左侧导航树 + 元数据吸顶 + 移动端抽屉。

## 变更范围

新增：

- `src/layouts/FullWidthLayout.jsx` — 单列全宽容器（`max-w-6xl`），承载 `/` 与 `/graph`
- `src/layouts/SidebarLayout.jsx` — Wiki 三栏外壳（左 260px 导航树 / 正文 / 右元数据），含移动端抽屉
- `src/components/WikiNavSidebar.jsx` — `category → sub_category → tool` 折叠树，桌面侧栏与抽屉共用

修改：

- `src/App.jsx` — 嵌套路由：`Layout` 之下再分 `FullWidthLayout`（`/`、`/graph`）与 `SidebarLayout`（`/wiki/:id`，其下 `index` 为 `WikiPage`）
- `src/components/Layout.jsx` — 去掉自带 `<main>`，改为裸 `<Outlet/>`，容器交由子布局决定
- `src/lib/data.js` — 导出 `navTree`（分类 → 子类 → 工具 + 计数），模块加载时构建一次
- `src/lib/wiki.js` — 新增 `stripLeadingH1()`；同时归一化 CRLF
- `src/pages/WikiPage.jsx` — 渲染前 `stripLeadingH1`，右栏改 `xl:sticky xl:top-[4.5rem]`，三栏断点由 `lg` 提到 `xl`
- `src/index.css` — 抽屉入场动画 + `prefers-reduced-motion` 兜底
- `README.md` — 三栏布局 / 抽屉 / 目录结构，以及贡献指南中「正文首个 H1 会被去掉且仅识别 ATX 形式」的说明

## 验证方式

无自动化测试套件（纯静态 SPA），因此用真实浏览器行为验证，而非只读代码：

- `npm run lint`（oxlint）0 warning；`npm run build` 通过（878 modules，1038 KB / 320 KB gzip）
- `vite preview` 于 4173，校验 `dist/index.html` 与线上产物 hash 一致后再测，避免测到旧 bundle
- `codex-browser` 驱动 Chromium（1280×900 / 1280×560 / 390×844）
- `stripLeadingH1` 另有独立属性测试（提取真实函数源码执行，见下）

### 证据

桌面 1280×900 `/wiki/ollama`：

- 左侧 `aside` 宽 260，右侧元数据 `position: sticky` / `top: 72px`
- 全页 `<h1>` 恰好 1 个（"Ollama"），`.md h1` 计数 0，`.md h2` 计数 4（正文结构完整）
- 侧栏 `aria-current="page"` → "Ollama"
- 左侧栏左边缘 88px == 头部品牌 "FA" 左边缘 88px（完美对齐）
- `main` 计数 1（正文列确为 `<main>`）
- 抽屉触发按钮 `display: none`（桌面不显示）

折叠树：

- `aria-expanded` true → false → true 循环正常；折叠时子面板与子类不出现在 DOM
- 从**已折叠**的 `ai` 分支出发，点正文 `[[Dify]]` 内链跳转后，`ai` 分支自动重新展开、`Dify` 高亮、`ai-framework` 子类展开 —— 渲染期 override 重置逻辑（`seenId`）有效

当前行滚动入视：

- 1280×560 时侧栏溢出（scrollHeight 614 > clientHeight 462）：挂载即 `scrollTop = 152`，非 0 → 生效
- 展开全部 9 个分类 + 20 个子类（196 行，scrollHeight 5358）后 `scrollTop = 4896`，活动行 "Homarr" 仍在可视区内 —— 长树场景同样生效

Home / Graph 未受影响：

- `/`：`aside` 0 个、无导航树、`main` 宽 1152 == 头部容器宽 1152
- `/graph`：`aside` 1 个（图谱自身的图例面板，非 wiki 侧栏）、无导航树、canvas 1 个

兜底页 `/wiki/aria2`（无独立 Wiki）：单 `<h1>` "Aria2"、`.md h1` 0 —— 兜底 Markdown 的首个 H1 同样被正确去掉。

移动端 390×844：

- 左侧栏 `display: none`，「目录」按钮 `inline-flex` 可见
- 抽屉宽 280、`role="dialog"` + `aria-modal="true"`、`body` overflow `hidden`
- **真实键盘**（Playwright `keyboard.press`）连续 Tab 30 次、Shift+Tab 12 次，焦点 30/30 与 12/12 全部停留在抽屉内
- 抽屉刚打开（焦点在容器上）时按 Shift+Tab 也落回面板内 —— 逃逸口已封死
- Esc 关闭：抽屉移除、overflow 复原、焦点回到「目录」按钮
- 点抽屉内 `LM Studio` → 跳转 `/wiki/lm-studio`、抽屉自动收起、overflow 复原、侧栏高亮更新为 "LM Studio"、焦点回到触发按钮
- 点遮罩关闭：同样复原 overflow 并把焦点交还触发按钮

`stripLeadingH1` 属性测试（`/tmp/fa-h1-test.mjs`，从 `src/lib/wiki.js` 提取真实函数源码执行）：

- 23/23 合成用例通过，含必须**不**删除的场景：4 空格缩进代码块、围栏代码块内的 `# 注释`、开头的 `##`/`###`、`#NoSpace`、散文开头后文出现 H1、Setext 标题、空文档
- 5 篇真实 Wiki 全部：只丢掉 1 行非空行且该行是 H1，正文去空行后与「原文仅删首个 H1」逐字符相同；`ollama.md` 3 个 `^# ` 行 → 2、`immich.md` 2 → 1，围栏内的 `# 注释` 均保留

## 本轮修复的问题

| 级别 | 问题 | 处理 |
| --- | --- | --- |
| Critical | 正文列不是 `<main>`，全站多个 `<main>`/无主区域 | 三栏中列改为 `<main>` |
| Critical | 活动行滚动入视逻辑作用于组件自身根节点（不可滚动），从未生效 | 改由调用方传入真实滚动容器 `scrollRef`；560px 高视口下已复测生效 |
| Critical | 切换工具时折叠 override 不重置，从折叠分支跳转后目标工具不可见 | 渲染期按 `activeId` 变化重置新活动分支的 override，已复测 |
| Major | 左栏与右栏断点不一致（`lg` vs `xl`），1280px 附近错位 | 统一为 `xl` |
| Major | 抽屉无焦点陷阱，Tab 可跑到遮罩与背景内容 | 实现陷阱（首尾环绕 + 容器/外部兜底），真实键盘复测 42/42 未逃逸 |
| Major | 抽屉触发按钮缺 `aria-expanded`、面板缺 `aria-controls` | 补齐 |
| Major | **遮罩（全屏关闭按钮）可聚焦** —— 打开抽屉后按 Shift+Tab 会落到这个隐形元素，再按一次即逃出对话框 | 遮罩加 `tabIndex={-1}`（仍可点击、仍有可访问名称），并在陷阱中处理「焦点在容器/容器外」两种情况 |
| Minor | `stripLeadingH1` 未处理 CRLF，也未限制缩进 | 归一化 CRLF + 缩进上限 3 空格 |
| Minor | 两处 lint warning（`box.scrollTop` 属性写入被 oxlint 判为变异；effect cleanup 直接读 `ref.current`） | 改用 `scrollBy()`；cleanup 内先取常量局部变量 |
| Minor | `SidebarLayout` 用 `max-w-[1400px]`，与头部/底部/首页的 `max-w-6xl` 不一致，左侧栏比品牌标识左移约 100px | 统一为 `max-w-6xl`；复测左侧栏与品牌左边缘均为 88px，正文列宽 520px（阅读行宽更佳） |

## 本轮接受的取舍

- **Setext 标题（`标题` + `===`）不识别** —— 已在 `stripLeadingH1` 注释与 README 贡献指南中写明，请统一使用 `#`。理由：识别 Setext 需要引入真正的 Markdown 解析器，而本仓库的 Frontmatter 解析刻意保持零依赖。
- **`stripLeadingH1` 会去掉「正文开头的任意 H1」**，包括极少数情况下正文真的以某个小节标题开头的情形。这是既定约定（Wiki 正文以标题 H1 开头），已写入 README。
- 抽屉抽屉态仅由 `location.pathname` 派生（不额外存布尔量），因此同页面内的 hash 变化不会关闭抽屉 —— 当前路由无 hash 语义，可接受。
- 抽屉入场动画未单独做 `prefers-reduced-motion` 之外的逐个降级。

## 流程说明（与 AGENTS.md 的偏差）

AGENTS.md 要求 L 级任务用 `codeagent-wrapper` 双模型（antigravity + claude）并行分析与审查。本次该 wrapper 不可用：

- `--backend antigravity` 卡在 Google OAuth 超时
- `--backend claude` 直接 exit 1
- 退一步直接调 `claude -p --dangerously-skip-permissions` 重跑一轮独立审查，进程结束但输出为空（`/tmp/fa-review2.txt` 0 字节），即本轮也拿不到独立审查意见

因此本文档的审查结论由两部分构成：

1. **上一轮 claude 独立审查**（wrapper 尚可用的那次）提出的 Critical/Major/Minor，逐条在「本轮修复的问题」表中列出并已修复；本轮又在其基础上自查出 3 处新问题（遮罩可聚焦导致的 Shift+Tab 逃逸、两处 lint warning、容器宽度与头部不一致）。
2. **可执行证据**：真实浏览器行为验证（含 Playwright 真实键盘事件 42 次按键）+ `stripLeadingH1` 属性测试（23 个合成用例 + 5 篇真实 Wiki 的逐字符比对）。

风险与缓解：本轮缺少**第二个模型的独立视角**，这是真实缺口，不粉饰。缓解是上述证据都可复现、可复核，且精确覆盖了审查原本要看的每一处（状态重置、焦点管理、正则是否会误删正文、断点行为）。若需要补上交叉验证，可在 wrapper 恢复后重跑一次针对 `/tmp/fa-task.diff` 的审查。

