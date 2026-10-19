# Plan — fullwidth-wiki-expansion

## 目标
1. 移除全局居中容器 → App-like 全宽流式（header/footer/内容全部撑满）
2. 详情页去掉「原生描述 ↔ 正文引用块」重复：剥掉首个 H1 + 紧随其后的首个 Blockquote
3. 无反向链接时隐藏「反向链接」面板
4. Wiki → 图谱带 `?focus=<id>`，图谱自动居中/放大/高亮该节点
5. 为 165 个工具补齐基础 Wiki（保留已有 5 篇），含 YAML frontmatter + 4 段 + `[[双链]]`

## 关键约束
- `scripts/build-data.mjs` 的 `WIKI` map 是 `resources.json` 里 `wiki` 字段的唯一来源 → 必须让每个 id 都有 slug
- 165 个 wiki 文件若沿用运行时抓取构建反向链接索引 = 每次进 Wiki 页 165 个请求 → 改为构建期预算 `src/data/backlinks.json`
- 双链必须能通过 `resolveTarget()` 解析：一律使用 resources.json 里的 `name` 原文

## 文件归属（互不重叠）
- A 布局：src/components/Layout.jsx, src/layouts/FullWidthLayout.jsx, src/layouts/SidebarLayout.jsx
- B 渲染：src/lib/wiki.js, src/pages/WikiPage.jsx
- C 图谱：src/pages/GraphPage.jsx, src/components/GraphView.jsx
- D 数据：scripts/wiki-content.mjs(新), scripts/build-wikis.mjs(新), scripts/build-data.mjs, src/lib/backlinks.js, src/lib/data.js
- E 产物：public/wiki/*.md(新 160), src/data/backlinks.json(新), src/data/resources.json, src/data/graph.json

## 风险
- 全宽后超长行可读性下降 → 用户明确要求「自适应铺开」，遵循 spec
- 侧栏 `sticky top-0 h-screen` 会被 sticky header 遮挡 → 用 `top-14 h-[calc(100vh-3.5rem)]`，等效「撑满可视高度」且不被遮挡
- 内容准确性（勿编造）：全部条目基于公开常识撰写，不写版本号/星级/许可证等不确定事实

## 验收
- npm run lint / build 通过
- 本地 preview：首页/图谱无居中留白；Wiki 侧栏贴左、独立滚动；无重复标题/引用块；无反向链接时不显示面板；/graph?focus=x 居中高亮
- 165 个 /wiki/:id 全部有独立 Wiki（非 fallback）
