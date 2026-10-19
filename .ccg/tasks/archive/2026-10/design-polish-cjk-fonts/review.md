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
