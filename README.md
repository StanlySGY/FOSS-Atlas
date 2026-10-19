<div align="center">

# 🧭 FOSS-Atlas

**导航 × Wiki × 知识图谱 —— 一个可以「逛」的免费 / 开源资源库**

把散落在收藏夹、群聊和截图里的免费额度、开源自部署方案与公开 API，
收进一张**可搜索、可漫游、可追溯**的图里。

[![Deploy](https://github.com/StanlySGY/FOSS-Atlas/actions/workflows/deploy.yml/badge.svg)](https://github.com/StanlySGY/FOSS-Atlas/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![ECharts](https://img.shields.io/badge/echarts-6-AA344D)](https://echarts.apache.org)
[![License](https://img.shields.io/badge/license-MIT-3DA639)](LICENSE)

[在线访问](https://stanlysgy.github.io/FOSS-Atlas/) · [提交资源](https://github.com/StanlySGY/FOSS-Atlas/issues) · [贡献 Wiki](https://github.com/StanlySGY/FOSS-Atlas/pulls)

</div>

---

## 📊 收录概况

| 维度 | 数量 |
| --- | --- |
| 资源条目 | **165** |
| 一级分类 | **10** |
| 子分类 | **21** |
| 图谱节点 | **262**（工具 / 分类 / 子类 / 标签 / 外部服务） |
| 图谱关系边 | **578**（属于 / 归类 / 标签 / 相关 / 替代） |
| Wiki 页面 | **165**（每个工具一篇，全部可读） |

分类覆盖：AI / LLM 白嫖 · 免费 SaaS 开发资源 · 自部署开源神器 · 公开 API 大全 ·
黑客 / 安全工具书 · 免费电子书 · 免费节点订阅 · 免费 VPS · 国内免费 AI · 佬友神器。

## ✨ 三个页面

### 1. 导航页（`/`）
卡片式布局，支持**关键词搜索**（名称 / 描述 / 标签 / 域名）与**一级 + 二级分类双重筛选**。
搜索词会同步到 URL（`/?q=密码`），因此任何筛选结果都可以直接分享。

### 2. Wiki 页（`/wiki/:id`）
读取 `public/wiki/*.md`，支持 YAML Frontmatter 与 `[[双向链接]]` 语法。
`[[Vaultwarden]]` 会被自动解析成站内跳转；解析不到的链接会退化为全站搜索。
**165 个工具每个都有一篇独立 Wiki**：5 篇为手写深度页，其余 160 篇由
`scripts/build-wikis.mjs` 依据 `scripts/wiki-content/*.mjs` 里的散文自动生成
（含「一句话总结 / 核心功能 / 适用场景 / 同类推荐」，推荐项用 `[[工具名]]` 互链）。
右侧栏自动聚合**相关工具**与**反向链接（backlinks）**；没有反向链接时该面板整体隐藏。

Wiki 页使用**三栏 App-like 全宽布局**（无居中容器，撑满视口）：

| 栏位 | 内容 |
| --- | --- |
| 左（280px） | **导航树**：贴屏幕最左侧、`sticky` 吸顶、独立滚动；按 `分类 → 子分类` 折叠，列出全部 165 个工具；当前浏览的工具自动展开并高亮；点击即跳转 |
| 中 | 正文，`flex-1` 自适应铺开。正文开头的 `# H1` 与其后的首个 `> 引用块` 会被自动去掉，标题与副标题统一由页面头部的原生 UI 呈现，避免重复 |
| 右（300px） | **元数据**：分类、子类、更新日期、标签、可替代、反向链接；PC 端 `sticky` 吸顶跟随，贴靠视口最右侧 |

窄屏（`< 768px`）时左栏收起，页面顶部出现**「目录」按钮**，点击以抽屉（Drawer）形式弹出同一棵导航树，
支持 `Esc` 关闭；选择任一工具后抽屉自动收起。

> 首页与图谱页使用全宽布局（`FullWidthLayout`，无侧边栏），仅 Wiki 页走三栏布局（`SidebarLayout`）——
> 二者在 `src/App.jsx` 中作为嵌套路由区分。

### 3. 知识图谱（`/graph`）
ECharts 力导向图，可**拖拽节点、滚轮缩放、拖拽画布平移**：

- 点击**工具**节点 → 跳转对应 Wiki
- 点击**标签**节点 → 跳转全站搜索
- 点击**分类 / 子类**节点 → 右侧列出其包含的全部工具
- 顶部可按关系类型（属于 / 归类 / 标签 / 相关 / 替代）逐层过滤
- 支持 `?focus=<工具 id>` 深链：从 Wiki 页点「在知识图谱中查看 →」后会带参跳转，
  图谱渲染完成后自动把该节点**平移居中、放大并高亮**——在 500+ 条边的图里一眼定位。
  未知 id 会被忽略（正常全览）。
- 力导向布局**只计算一次**并把坐标固定下来：切换关系过滤只改变连线，不会重新抖散全图，
  因此深链聚焦的节点不会在过滤后跑偏。

## 🛠 技术栈

| 层 | 选型 |
| --- | --- |
| 构建 | Vite 8 |
| UI | React 19 + Tailwind CSS 4 |
| 路由 | React Router 7（`basename` 适配 Pages 子路径） |
| 图谱 | ECharts 6（`echarts/core` 按需引入） |
| Markdown | react-markdown + remark-gfm |
| 部署 | GitHub Actions → GitHub Pages |

## 🚀 本地开发

```bash
npm install

npm run dev        # 启动开发服务器
npm run data       # 数据源 → src/data/*.json（改完数据源后执行）
npm run icons      # 抓取每个 host 的站点图标 → public/icons/ + src/data/icons.json
node scripts/build-wikis.mjs   # 生成 160 篇 Wiki + src/data/backlinks.json
npm run build      # 先刷新 Wiki 与 backlinks.json，再打包到 dist/ 并生成 SPA 兜底 404.html
npm run preview    # 本地预览构建产物
npm run lint       # oxlint
```

> `npm run build` 会在 `dist/` 下额外生成 `404.html`。
> GitHub Pages 对未知路径返回 404，把 `index.html` 复制过去才能让
> `/wiki/ollama` 这类深链接正确交给前端路由。

## 📁 项目结构

```
FOSS-Atlas/
├─ scripts/
│  ├─ build-data.mjs        # 数据源 → resources.json + graph.json
│  ├─ build-icons.mjs       # 每个 host → public/icons/* + src/data/icons.json
│  ├─ build-wikis.mjs       # wiki-content + 目录 → public/wiki/*.md + backlinks.json
│  ├─ wiki-content/         # 每篇 Wiki 的散文（一句话总结 / 功能 / 场景），分组存放
│  └─ spa-fallback.mjs      # dist/index.html → dist/404.html
├─ public/
│  ├─ .nojekyll             # 让 Pages 原样发布（不跑 Jekyll）
│  ├─ icons/                # 106 个 host 的站点图标（构建期抓取，随包发布）
│  └─ wiki/                 # 165 篇 Wiki（Markdown + Frontmatter）
│     ├─ ollama.md          # 5 篇手写深度页……
│     ├─ cloudflare-workers.md
│     ├─ vaultwarden.md
│     ├─ immich.md
│     ├─ nextcloud.md
│     └─ …                  # 其余 160 篇由 build-wikis.mjs 生成
├─ src/
│  ├─ data/
│  │  ├─ resources.json     # 165 条资源（生成物，勿手改）
│  │  ├─ graph.json         # 知识图谱 nodes + edges（生成物）
│  │  └─ backlinks.json     # 反向链接索引（生成物）
│  ├─ lib/
│  │  ├─ data.js            # 索引、别名解析、图谱查询、侧边栏导航树
│  │  ├─ wiki.js            # Frontmatter 解析 + [[双链]] 转换 + 头部去重
│  │  ├─ backlinks.js       # 读 backlinks.json，同步查询反向链接
│  │  └─ graphStyle.js      # 节点/边样式与语义常量
│  ├─ layouts/
│  │  ├─ FullWidthLayout.jsx # 首页 / 图谱：全宽单列
│  │  └─ SidebarLayout.jsx   # Wiki：左导航树 + 内容 + 移动端抽屉
│  ├─ components/           # Layout / WikiNavSidebar / ResourceCard / Markdown / GraphView
│  └─ pages/                # Home / WikiPage / GraphPage
└─ .github/workflows/deploy.yml
```

## 🗂 数据流

```
清单文本 ──► scripts/build-data.mjs ──► src/data/resources.json   ┐
                  │                         src/data/graph.json    │
                  └── 校验：所有 url 必须为 https:// 绝对地址       │
                                                                    ▼
wiki-content/*.mjs ──► scripts/build-wikis.mjs ──► public/wiki/*.md
                             └────────────────────► src/data/backlinks.json

resources.json ──► scripts/build-icons.mjs ──► public/icons/* + src/data/icons.json
                    └── 每个 host 抓一张图标；幂等，已存在的不重复下载
```

> 图标在**构建期**抓取并随包发布，而不是在浏览器里请求 favicon 服务：
> `google.com` / `icons.duckduckgo.com` 在中国大陆不可达，运行时请求会让
> 全部卡片图标退化成字母占位。`iconFor()` 仅在该 host 没有本地图标时才回落到远端。

### `resources.json` 字段

| 字段 | 说明 |
| --- | --- |
| `id` | 稳定 ascii 标识（如 `vaultwarden`），同时是 Wiki 路由参数 |
| `name` | 展示名 |
| `url` | **绝对 https 地址**，全部经过可用性校验 |
| `category` / `category_name` | 一级分类 |
| `sub_category` / `sub_category_name` | 二级分类 |
| `description` | 一句话说明 |
| `tags` | 标签数组 |
| `wiki` | Wiki 文件名（不含 `.md`），每个资源都有；极少数与 `id` 不同的见 `WIKI_SLUG_OVERRIDES` |

### `graph.json` 关系类型

| 边类型 | 含义 |
| --- | --- |
| `belongs_to` | 工具 → 子分类 |
| `in_category` | 子分类 → 一级分类 |
| `tagged` | 工具 → 标签（取 Top 40 高频标签） |
| `related` | 工具 ↔ 工具（人工整理的同类关系） |
| `alternative_to` | 工具 → 被替代的商业服务（如 Vaultwarden → Bitwarden） |

## ✍️ 贡献指南

### 新增一个资源
编辑 `scripts/build-data.mjs`，在对应分类的 `items` 里追加一行：

```js
['my-tool', 'My Tool', 'https://example.com', '一句话说明', ['标签1', '标签2']],
```

然后执行 `npm run data` 重新生成 JSON、再执行 `npm run icons` 抓取它的站点图标
（新增 host 尤其要跑，否则该卡片会临时回落到远端 favicon 服务）。
**URL 必须是 `https://` 开头的绝对地址。**

### 给新资源配一篇 Wiki
`public/wiki/*.md` 由 `scripts/build-wikis.mjs` 生成，**不要手改**（除非按下面的方式做成手写页）。
生成页的 frontmatter 里带 `generated: true` 标记；没带这个标记的页面说明是手写的，改它才有意义。

- **普通页**：往 `scripts/wiki-content/` 里任一 `.mjs` 追加一条，key 用资源 `id`：

  ```js
  'my-tool': {
    summary: '一句话总结（25–45 字）。',
    features: ['特点一', '特点二', '特点三'],
    scenarios: ['适用场景一', '适用场景二'],
  },
  ```

  然后执行 `npm run data` 与 `node scripts/build-wikis.mjs`。生成器**幂等**，可反复运行；
  它会自动补上 frontmatter、页面骨架和 `[[同类推荐]]` 双链，并刷新 `backlinks.json`。

- **手写深度页**：在 `build-wikis.mjs` 的 `CURATED` 里登记 `id → slug`，脚本会跳过它、保留你的文件
  （文件放在 `public/wiki/<slug>.md`，即现有 5 篇深度页的做法）。

- **自定义文件名**：在 `build-data.mjs` 的 `WIKI_SLUG_OVERRIDES` 里加映射（如 `cloudflare → cloudflare-workers`）。

- **⚠️ 双链写法**：`[[工具名]]` 里的名字必须是 `resources.json` 中 `name` 的**原文**，
  否则解析不到，链接会退化成全站搜索。

Wiki 模板：

```markdown
---
title: My Tool
slug: my-tool
category: selfhost
sub_category: selfhost-core
tags: [标签1, 标签2]
url: https://example.com
alternatives: [商业替代品]
related: [another-tool-id]
updated: 2026-10-19
generated: true   # 生成器写下的标记：这些页面每次运行都会被整体重写
---

# My Tool

> 一句话总结。

正文……引用其它条目用 [[Another Tool]] 或 [[another-tool]]。
```

> 正文开头的 `# My Tool` **和紧随其后的 `> 引用块`** 都会由前端自动去掉：
> 页面头部已用原生 `<h1>` + 描述渲染了同样的内容，保留会在页面上重复出现。
> 只识别 ATX 形式（`# 标题`）；写成 Setext 形式（标题下面加一行 `===`）不会被去掉——请统一用 `#`。

## 🚢 部署

推送到 `main` 即触发构建与发布（见 `.github/workflows/deploy.yml`）。
首次部署前需要在仓库 **Settings → Pages** 把 Source 设为 **GitHub Actions**。

## 📄 License

本仓库代码以 MIT 发布；收录资源的版权归各自项目所有。
数据整理自社区流传的「GitHub 精选白P资源清单」，链接可用性持续校验。
