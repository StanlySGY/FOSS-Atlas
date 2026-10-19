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
| 深度 Wiki | **5** 篇 |

分类覆盖：AI / LLM 白嫖 · 免费 SaaS 开发资源 · 自部署开源神器 · 公开 API 大全 ·
黑客 / 安全工具书 · 免费电子书 · 免费节点订阅 · 免费 VPS · 国内免费 AI · 佬友神器。

## ✨ 三个页面

### 1. 导航页（`/`）
卡片式布局，支持**关键词搜索**（名称 / 描述 / 标签 / 域名）与**一级 + 二级分类双重筛选**。
搜索词会同步到 URL（`/?q=密码`），因此任何筛选结果都可以直接分享。

### 2. Wiki 页（`/wiki/:id`）
读取 `public/wiki/*.md`，支持 YAML Frontmatter 与 `[[双向链接]]` 语法。
`[[Vaultwarden]]` 会被自动解析成站内跳转；解析不到的链接会退化为全站搜索。
页面底部与右侧栏自动聚合**相关工具**与**反向链接（backlinks）**。
没有独立 Wiki 的条目会自动生成一个包含官网、分类、标签的兜底页面 —— 165 个条目**全部可点**。

### 3. 知识图谱（`/graph`）
ECharts 力导向图，可**拖拽节点、滚轮缩放、拖拽画布平移**：

- 点击**工具**节点 → 跳转对应 Wiki
- 点击**标签**节点 → 跳转全站搜索
- 点击**分类 / 子类**节点 → 右侧列出其包含的全部工具
- 顶部可按关系类型（属于 / 归类 / 标签 / 相关 / 替代）逐层过滤

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
npm run data       # 重新生成 src/data/*.json（改完数据源后执行）
npm run build      # 产物输出到 dist/，并生成 SPA 兜底 404.html
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
│  └─ spa-fallback.mjs      # dist/index.html → dist/404.html
├─ public/
│  ├─ .nojekyll             # 让 Pages 原样发布（不跑 Jekyll）
│  └─ wiki/                 # 5 篇深度 Wiki（Markdown + Frontmatter）
│     ├─ ollama.md
│     ├─ cloudflare-workers.md
│     ├─ vaultwarden.md
│     ├─ immich.md
│     └─ nextcloud.md
├─ src/
│  ├─ data/
│  │  ├─ resources.json     # 165 条资源（生成物，勿手改）
│  │  └─ graph.json         # 知识图谱 nodes + edges（生成物）
│  ├─ lib/
│  │  ├─ data.js            # 索引、别名解析、图谱查询
│  │  ├─ wiki.js            # Frontmatter 解析 + [[双链]] 转换
│  │  └─ graphStyle.js      # 节点/边样式与语义常量
│  ├─ components/           # Layout / ResourceCard / Markdown / GraphView
│  └─ pages/                # Home / WikiPage / GraphPage
└─ .github/workflows/deploy.yml
```

## 🗂 数据流

```
清单文本 ──► scripts/build-data.mjs ──► src/data/resources.json
                  │                         src/data/graph.json
                  └── 校验：所有 url 必须为 https:// 绝对地址
```

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
| `wiki` | 可选，存在独立 Wiki 时的文件名（不含 `.md`） |

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

然后执行 `npm run data` 重新生成 JSON。**URL 必须是 `https://` 开头的绝对地址。**

### 新增一篇 Wiki
在 `public/wiki/` 下新建 `<slug>.md`，并在 `build-data.mjs` 的 `WIKI` 映射里登记：

```js
const WIKI = { 'my-tool': 'my-tool-slug' }
```

Wiki 模板：

```markdown
---
title: My Tool
slug: my-tool
category: selfhost
sub_category: selfhost-core
tags: [标签1, 标签2]
url: https://example.com
repo: https://github.com/owner/repo
license: MIT
alternatives: [商业替代品]
related: [another-tool-id]
updated: 2026-10-19
---

# My Tool

正文……引用其它条目用 [[Another Tool]] 或 [[another-tool]]。
```

## 🚢 部署

推送到 `main` 即触发构建与发布（见 `.github/workflows/deploy.yml`）。
首次部署前需要在仓库 **Settings → Pages** 把 Source 设为 **GitHub Actions**。

## 📄 License

本仓库代码以 MIT 发布；收录资源的版权归各自项目所有。
数据整理自社区流传的「GitHub 精选白P资源清单」，链接可用性持续校验。
