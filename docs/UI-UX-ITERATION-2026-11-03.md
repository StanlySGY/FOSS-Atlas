# FOSS-Atlas UI/UX 迭代记录 — 2026-11-03

## 目标与设计原则

本轮目标不是重做视觉主题，而是降低三个核心场景的操作摩擦：图谱查找后的上下文连续性、Wiki 长内容的导航效率、超宽屏资源发现的空间利用率。

保留现有紫色底色、琥珀色主强调色、资源数据结构、Wiki Markdown 格式及轻量前端依赖。参考项目只提炼交互模式，不复制整体皮肤：

- Excalidraw（https://github.com/excalidraw/excalidraw）：画布与离散对象的浏览、聚焦和直接操作。
- Logseq（https://github.com/logseq/logseq）：图谱关联、页面间跳转和上下文连续性。
- AFFiNE（https://github.com/toeverything/AFFiNE）：文档阅读与结构化导航并存。
- AppFlowy（https://github.com/AppFlowy-IO/AppFlowy）：层级化工作区与可定位的信息组织。

## 设计方案与实现

### 1. 图谱列表：搜索条件成为可分享、可恢复的页面状态

- 节点搜索词使用 URL 参数 node_q，类型筛选使用 node_type。
- 修改筛选时只更新这两个参数，不破坏 view、cat、focus 及其他查询参数。
- 未知类型回退为「全部」；清空搜索或选「全部」会删除对应参数。
- 列表组件从路由接收受控状态。点击节点进入 Wiki 后，浏览器返回会恢复原来的搜索词和类型筛选。

### 2. Wiki：让目录在长文里持续可用

- 左侧 Wiki 树新增即时搜索，支持工具名称 / ID、子分类名称 / ID、分类名称 / ID。
- 搜索结果保留分类和子分类祖先节点；命中分类或子分类时展开完整分支，命中具体工具时只保留匹配项。
- 桌面侧栏和手机目录抽屉共用同一搜索能力，并显示匹配条目数和清空 / 无结果状态。
- 本页目录改为站点导航栏下方的吸顶横向导航，长目录在自身区域内滑动，不挤压整页宽度。
- Markdown 正文最大宽度限制为 78ch，避免宽屏下长段落横跨整个阅读列；标题锚点滚动偏移同步避让站点栏和吸顶目录。

### 3. 资源目录：让大屏显示更多有效信息

- 资源卡片列数调整为：手机 1 列、小屏 2 列、桌面 3 列、超宽屏（xl）4 列。
- 卡片信息、分类配色和跳转关系不变；不添加装饰图片或额外运行依赖。

## 验收结果

- 自动化：npm test 22/22 通过；npm run lint 0 警告 / 0 错误；npm run views:check 通过（全图 283 节点、部署视图 106 节点、11 个分类视图）；git diff --check 通过。
- 构建：GitHub Pages base（/FOSS-Atlas/）和 Cloudflare base（/ + SKIP_SPA_FALLBACK=1）均构建成功；189 个页面预渲染，4 张 OG 卡片与当前数据一致。
- 浏览器：Chrome/CDP 实际操作图谱列表搜索 ollama、类型筛选、打开 Wiki、浏览器返回；返回后 node_q 与 node_type 均保留。Wiki 左侧搜索在桌面树和移动抽屉均命中唯一 Ollama 条目；Wiki TOC 的 position 为 sticky，滚动时 top 与站点头部底部对齐（56px）。1440px 首页实测 4 列 / 186 卡片；390px 和 320px 页面文档宽度分别等于视口宽度，无横向溢出。
- 浏览器验收由 WSL 本地 Headless Chrome/CDP 执行；没有把未成功启动的 Browser Use MCP 会话计为验收。

## 影响范围与边界

不更改资源清单、资源事实、部署记录、图谱节点 / 边数据或 Wiki 内容；不增加 npm 运行依赖。根目录未跟踪的私人 HANDOVER.md 继续保留在本地，不属于公开仓库内容。
