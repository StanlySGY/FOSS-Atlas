# Review — design-polish-cjk-fonts

对标高星同类项目（selfh.st/apps 等）对 FOSS-Atlas 做了一轮视觉升级，并修掉一个
真实的 CJK 排版缺陷。所有结论均由真实浏览器（codex-browser / Chromium）截图与
DOM 断言得出，不是读代码推断。

## 发现的问题

1. **CJK 无字体策略（真实缺陷）。** 站点是中文优先，但字体栈只有
   `ui-sans-serif, system-ui, …, "PingFang SC", "Microsoft YaHei"`。在任何没装
   PingFang/雅黑、且 `system-ui` 命中一个无 CJK 覆盖字体的环境（最小化 Linux、
   部分 Android/容器）里，中文会渲染成豆腐块 □。
2. **ECharts 画布文字必然丢失 CJK。** 知识图谱节点/图例的文字画在 `<canvas>` 上，
   而 canvas 不继承页面字体栈——`textStyle` 未指定 `fontFamily` 时，中文节点名
   （“国内免费 AI 工具”“监控”“免费域名”…）整片变豆腐。
3. **`.mono` 标签里的中文也变豆腐。** 卡片底部子类名、面包屑、“关系过滤”等用
   `.mono`（等宽栈，无 CJK 覆盖）包裹了中文。
4. 首页信息层级弱：一句长段落代替英雄区，卡片缺图标/域名，筛选区是一堵 chip 墙。

## 变更范围

- `index.html` — 引入 Noto Sans SC / Noto Sans Mono（Google Fonts，unicode-range
  子集 + `display=swap`），`preconnect` 到 fonts.gstatic.com。
- `src/index.css` — 新增 `:root` 设计令牌（surface / line / text 分级 / accent /
  radius / header-h）；正文与 `.mono` 字体栈都补上 Linux CJK 家族
  （Noto Sans CJK SC / Source Han Sans SC / WenQuanYi）；`:focus-visible` 焦点环、
  `.fa-skip` 跳转链接、`prefers-reduced-motion` 兜底。
- `src/components/GraphView.jsx` — 新增 `GRAPH_FONT`（CJK 家族置前），应用到图表
  `textStyle`、`legend.textStyle`、节点 `label`、focus label、tooltip；否则画布文字
  仍是豆腐。
- `src/components/ResourceCard.jsx` — 站点图标（favicon 服务 + 字母占位回退）、域名行、
  收紧的元信息页脚；子类名不再用 `.mono`。
- `src/pages/Home.jsx` — 英雄区（badge + 一句话 + 四张统计卡：条目/一级分类/标签/关系边）、
  带图标的搜索框与实时计数、更清晰的一级+二级筛选，空态加“重置筛选”。
- `src/components/Layout.jsx` / `src/layouts/*` — 采用令牌；加 `#main` 与跳转链接。
- `src/pages/WikiPage.jsx` — H1 旁加站点图标磁贴，与卡片视觉统一；面包屑脱离 `.mono`。
- `src/lib/data.js` — 新增 `hostFor` / `iconFor` / `initialFor`。
- `.gitignore` — 忽略本地 `.codegraph/` 索引。

## 验证方式

无自动化测试套件（纯静态 SPA），用真实浏览器行为验证：

- `npm run build` 通过；`npx oxlint` 0 warning。
- `vite preview` 于 4173；`codex-browser` 驱动 Chromium。

### 证据

- 首页：`document.querySelectorAll('article').length === 165`，
  其中 `img[src*=favicons]` 计数 165（每张卡片都有图标）；跳转链接存在。
- 搜索：`/?q=密码` → 输入框值 `密码`、卡片 2 张、计数 `2 / 165 条`，深链可分享。
- 空态：`/?q=zzzznotfound` → 出现“重置筛选”按钮。
- 图谱画布字体：`ctx.measureText('图鉴')` 在 `"Noto Sans SC"` 下 = 24px（真字形），
  修复前为豆腐宽度；截图确认“国内免费 AI 工具/免费域名/监控/DNS”等标签正常。
- 图谱速览气泡：单击节点弹 `[role=dialog]`，标题“短链”、描述
  “标签节点，用来跨分类串联功能相近的工具。”渲染正常。
- Wiki 三栏：标题旁图标、右侧元数据/标签/可替代/反向链接面板全部中文正常。
- 移动端 390×844：统计卡两列、搜索全宽；“目录”抽屉打开含 38 个链接，当前项高亮。
- 深度链接 `?focus=immich` 正常加载不报错。

## 追加一轮（同任务）

### 图标自托管（真实可用性修复）

首轮卡片图标走 `https://www.google.com/s2/favicons`，对中文受众是错误取舍：
google.com 与常用备选 DuckDuckGo 在中国大陆不可达，165 张卡片图标会全部退化成
字母占位。改为构建期抓取、随包发布：

- 新增 `scripts/build-icons.mjs`：按 host 下载一张图标到 `public/icons/`，
  写 `src/data/icons.json`（host → 公共路径）。幂等：已存在的图标不重复下载。
- **下载器用 `curl` 而非 Node `fetch`**：本机（及多数受限环境）经 `https_proxy`
  出网，curl 认这个代理，undici 的 `fetch` 不认——用 fetch 时每个请求都
  `ETIMEDOUT`，换 curl 后 106/106 host 全部成功。
- `src/lib/data.js` 的 `iconFor()` 优先返回本地资源（带 base path），
  仅当 manifest 里没有该 host 时才回落到 favicon 服务。
- 结果：`public/icons/` 106 个文件、1.2 MB；页面无任何 google.com 运行时请求。

### 图谱页右栏改版

原来「图例 + 提示」只占 ~250px，下方 250px 是空白。现在：

- 关系过滤 chip 带计数（属于 165 / 归类 21 / 标签 302 / 相关 56 / 替代 34）。
- 图例面板按 `TYPE_ORDER` 展示，每类带节点数（分类 10 / 子类 21 / 工具 165 …）。
- 空出的下半栏换成「怎么逛」引导（单击/双击/分类节点/关系过滤四种用法）；
  选中分类或子类时该面板切换为该类包含的工具列表。
- 右栏改 `lg:sticky`；过滤 chip 加 `aria-pressed`；顶部说明收紧为一行。

### 追加验证

- `npx oxlint` 0 warning；`npm run build` 通过（`dist/icons/` 106 个）。
- 词法：`grep google.com/s2 src/` 仅剩 `data.js` 里的回落分支。
- 浏览器：首页 163 张 `<img>` 全部走 `/FOSS-Atlas/icons/...`，0 张 broken、0 张 remote；
  `measureText` 图谱画布证字体有效；资源请求 30 条 0 失败。
- a11y：`missingAlt=0`、无名 button/link = 0、`lang=zh-CN`、h1 唯一。
- 响应式：640→2 列、768→2 列、1024→3 列；无横向溢出。
- 线上：`index-CwAOub-j.js` 与本地构建一致；`/icons/poe.com.png` 返回 200。

## 再追加一轮：字体加载移出关键路径

`fonts.googleapis.com` 在中国大陆不可达（本站主要受众）。原先用
`<link rel="stylesheet">` 同步加载 Google Fonts，是**渲染阻塞**资源——在被墙的
网络上首屏会一直等到该请求超时，这才是真实代价（此前把它当作“优雅降级”忽略了
这一点）。

- 改为 `media="print" onload="this.media='all'"` 异步加载：页面立刻用 `index.css`
  里的系统 CJK 回退栈绘制，webfont 到达后再升级字形；`<noscript>` 兜底。
- **评估过自托管子集，放弃**：Google Fonts 即便对 `text=` 子集也会把 Noto Sans SC
  拆成 ~100 个 unicode-range 文件，提交进静态仓库要给纯装饰性升级增加数 MB，
  不划算。
- 验证：本地与线上 `document.fonts.check('16px "Noto Sans SC"') === true`，
  加载后 `media` 由 `print` 变 `all`；165 张卡片正常渲染。

## 收尾：令牌迁移补全

首轮只把 Home / Layout / Card / Sidebar 迁到令牌，WikiPage、GraphPage、
GraphNodePopover、WikiNavSidebar 里还留着 ~45 处裸 hex，调色板处于半迁移状态。

- `:root` 补齐这些文件用到的色阶：`--ink-tint` / `--ink-tint-hover` / `--ink-chip` /
  `--ink-tab` / `--line-muted` / `--line-hover` / `--text-mute` / `--focus-fill`。
- 所有 Tailwind 任意值 `[#hex]` → `[var(--token)]`。
- ECharts 需要字面色串、无法解析 `var()`，故图表 chrome 的颜色抽出为
  `graphStyle.js` 的 `CANVAS` 常量（每项注释回指对应令牌），`FOCUS_RING/FOCUS_FILL`
  也改为读取它。
- 无视觉变化：`getComputedStyle` 复核卡片边框 `#23282a`、底色 `#101314`、
  标题 `#f2f4f5`、强调 `#f0b429` 均与迁移前一致；无元素落到未设色。

## 追加轮次：中文字体自托管子集

用户明确要求：**自托管字体子集，接受仓库体积增大**。上一轮"评估过自托管、放弃"
的结论被推翻——用户认可体积换稳定可达。

- 新增 `scripts/build-fonts.mjs`：扫描 `resources.json`、`public/wiki/*.md`、
  `src/**/*.{jsx,css}`、`index.html`，收集站点实际渲染的全部码位（**1121 个**），
  用 `curl`（走本地代理）把完整 Noto Sans SC OTF 拉到 `.cache/fonts/`（gitignore），
  再用 `subset-font`（harfbuzzjs，新增 devDependency）裁剪为 woff2。
- 产物 `public/fonts/noto-sans-sc-{400,500,700}.woff2`：约 355–372KB/个，
  合计 **~1.05MB**，随包发布；`fonts.css` 里 700 face 声明 `font-weight: 600 700`，
  500 对应 `font-size: medium`。
- `index.html` 移除 Google Fonts 的 `preconnect` + 异步加载 + `<noscript>`，
  改为 `preload` 400/700 两个 face + `<link rel="stylesheet">` 本地 `fonts.css`。
- `src/index.css` 字体栈保留 "Noto Sans SC" 置首 + 平台 CJK 回退，
  子集外的生僻字与缺省权重仍可降级渲染，不会 tofu。
- 验证（本地 preview + 线上）：`document.fonts.check('400/700 16px "Noto Sans SC"')`
  均 true；`performance.getEntriesByType('resource')` 里对
  `fonts.googleapis.com|fonts.gstatic.com` 的请求数为 **0**，
  三个字体资源全部同源；首页 / Wiki / 图谱中文全部正常。

## 追加轮次：图谱「按一级分类聚焦、收起其他节点」

262 节点的力导向图是一团毛线，想看某一类工具只能靠肉眼挑。

- GraphPage 在头部与关系过滤之间加一行「聚焦分类」chip：全部 + 10 个一级分类，
  每个 `aria-pressed`，chip 上标该类工具数；`focusedCategory` 状态下传 GraphView。
- GraphView 新增 `visibleIds`：保留 `cat:<id>` 节点 + `category === focusedCategory`
  的工具与子类，标签 / 外部服务 / 其他分类整体收起。
  **关键取舍**：不筛 `nodes` 数组（会改变 ECharts 的坐标 extent、破坏取景），
  而是把不匹配节点标为 `symbolSize: 0` + `itemStyle.opacity: 0` + `label.show: false`。
- `categoryFrame` 由 `frozenLayout` 算出全图与子图 extent，给出
  `center` 与 `zoom = max(1, 0.72 * full.span / sub.span)`，把子图框满视口并留边。
- `viewKey = focusId|focusedCategory` 进图表 **init** effect 依赖：ECharts 只在
  series 创建那一刻认 `center`/`zoom`，后续 `notMerge` 重渲染会忽略它，
  故取景身份变化时重建实例；关系过滤开关**刻意不在** key 里，保住用户的平移缩放。
- 交互：再点该 chip 或按 `Esc` 回到全览；与 `?focus=<工具 id>` 深链共存。
- 验证（真实浏览器，本地 + 线上）：免费 SaaS → 约 36 节点、自部署 → 约 53 节点，
  均居中框好；取消聚焦回 262 节点；`Esc` 清空；深链与分类聚焦同时生效；
  `oxlint` 0 warning、`npm run build` 通过。

## 部署

字体与图谱聚焦两次提交推送 `main`，GitHub Actions `Build & Deploy to GitHub Pages`
成功；线上复核 `fonts/noto-sans-sc-400.woff2` 200、`index.html` 引用为
`/FOSS-Atlas/fonts/...`、浏览器中 0 个 Google 请求、分类聚焦可用。

## 附带修复

`codex-browser run` 的 `screenshot` / `pdf` 步骤此前用 JSON 的 `path` 字段，
但处理函数读的是 CLI 的 `out`，直接 `AttributeError` 崩溃。已在
`/home/sgy/Chromix/tools/codex_browser.py#run_steps` 里把 `path` 桥接到 `out`。
