<div align="center">

# 🧭 FOSS-Atlas

**导航 × Wiki × 知识图谱 —— 一个可以「逛」的免费 / 开源资源库**

把散落在收藏夹、群聊和截图里的免费额度、开源自部署方案与公开 API，
收进一张**可搜索、可漫游、可追溯**的图里。

[![GitHub Pages](https://github.com/StanlySGY/FOSS-Atlas/actions/workflows/deploy.yml/badge.svg)](https://github.com/StanlySGY/FOSS-Atlas/actions/workflows/deploy.yml)
[![Cloudflare Pages](https://github.com/StanlySGY/FOSS-Atlas/actions/workflows/cloudflare-pages.yml/badge.svg)](https://github.com/StanlySGY/FOSS-Atlas/actions/workflows/cloudflare-pages.yml)
[![Vite](https://img.shields.io/badge/vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![ECharts](https://img.shields.io/badge/echarts-6-AA344D)](https://echarts.apache.org)
[![License](https://img.shields.io/badge/license-MIT-3DA639)](LICENSE)

[在线访问](https://stanlysgy.github.io/FOSS-Atlas/) · [Cloudflare 镜像](https://atlas.sgyyyds.qzz.io/) · [提交资源](https://github.com/StanlySGY/FOSS-Atlas/issues) · [贡献 Wiki](https://github.com/StanlySGY/FOSS-Atlas/pulls)

</div>

---

## 📊 收录概况

| 维度 | 数量 |
| --- | --- |
| 资源条目 | **186** |
| 一级分类 | **11** |
| 子分类 | **22** |
| 图谱节点 | **283**（工具 / 自建 / 分类 / 子类 / 标签 / 外部服务） |
| 图谱关系边 | **643**（属于 / 归类 / 标签 / 相关 / 替代） |
| 自部署实例 | **81**（73 个资源条目在跑，其中 12 个为 Atlas 自建） |
| Wiki 页面 | **186**（每个条目一篇，全部可读） |

分类覆盖：AI / LLM 白嫖 · 免费 SaaS 开发资源 · 自部署开源神器 · 公开 API 大全 ·
黑客 / 安全工具书 · 免费电子书 · 免费节点订阅 · 免费 VPS · 国内免费 AI · 佬友神器 ·
Atlas 自建。

**「已自部署」是把这三页缝起来的那根线**：`src/data/deployed.json` 里每一条都带一个
`resource` 字段指向图鉴条目，`npm run data` 校验这个 join —— 对不上就构建失败。
于是同一件事在三个地方都成立：卡片上有 <span class="mono">已自部署 N</span> 标记，
Wiki 右侧栏有「我的实例」列出具名实例，图谱里它是有坐标、可点开的节点
（`/graph?deployed=1` 只留下真正在跑的这部分子图）。Atlas 自建的 12 个边缘服务
由生成器 mint 成真正的图鉴条目，所以它们和第三方工具一样有卡片、Wiki 与节点。

## ✨ 四个页面

### 1. 导航页（`/`）
卡片式布局，支持**关键词搜索**（名称 / 描述 / 标签 / 域名）与**一级 + 二级分类双重筛选**。
搜索词会同步到 URL（`/?q=密码`），因此任何筛选结果都可以直接分享。

顶部五格统计里最后一格 **已自部署** 是个开关：按下后卡片收窄到我真正在跑的条目，
状态写进 URL（`/?deployed=1`）——和图谱用的是**同一个参数名**，所以「收窄到在跑的部分」
这个视图在两个页面上是同一个地址，从任意一侧都能把链接递出去。卡片上带
<span class="mono">已自部署 N</span> 标记，N 是这个条目有几个实例。

### 2. Wiki 页（`/wiki/:id`）
读取 `public/wiki/*.md`，支持 YAML Frontmatter 与 `[[双向链接]]` 语法。
`[[Vaultwarden]]` 会被自动解析成站内跳转；解析不到的链接会退化为全站搜索。
**186 个条目每个都有一篇独立 Wiki**：5 篇为手写深度页，其余 181 篇由
`scripts/build-wikis.mjs` 依据 `scripts/wiki-content/*.mjs` 里的散文自动生成
（含「一句话总结 / 核心功能 / 适用场景 / 同类推荐」，推荐项用 `[[工具名]]` 互链）。
右侧栏自动聚合**相关工具**与**反向链接（backlinks）**；没有反向链接时该面板整体隐藏。

Wiki 页使用**三栏 App-like 全宽布局**（无居中容器，撑满视口）：

| 栏位 | 内容 |
| --- | --- |
| 左（280px） | **导航树**：贴屏幕最左侧、`sticky` 吸顶、独立滚动；按 `分类 → 子分类` 折叠，列出全部 186 个条目；当前浏览的工具自动展开并高亮；点击即跳转 |
| 中 | 正文，`flex-1` 自适应铺开。正文开头的 `# H1` 与其后的首个 `> 引用块` 会被自动去掉，标题与副标题统一由页面头部的原生 UI 呈现，避免重复 |
| 右（300px） | **元数据**：分类、子类、更新日期、标签、**我的实例**（只在我部署了它时出现）、可替代、反向链接；PC 端 `sticky` 吸顶跟随，贴靠视口最右侧 |

窄屏（`< 768px`）时左栏收起，页面顶部出现**「目录」按钮**，点击以抽屉（Drawer）形式弹出同一棵导航树，
支持 `Esc` 关闭；选择任一工具后抽屉自动收起。

> 首页、图谱页与自部署服务页使用全宽布局（`FullWidthLayout`，无侧边栏），仅 Wiki 页走三栏布局
> （`SidebarLayout`）——二者在 `src/App.jsx` 中作为嵌套路由区分。

### 3. 知识图谱（`/graph`）
ECharts 力导向图，可**拖拽节点、滚轮缩放、拖拽画布平移**：

- 单击节点看速览气泡，气泡里再决定去向；**双击**工具节点直接进 Wiki
- 点击**工具**节点 → 跳转对应 Wiki；**自建**节点同理——Atlas 自建的 12 个服务也是
  图鉴条目，所以它们有自己的 Wiki 页，不是图上孤立的点
- 点击**标签**节点 → 跳转全站搜索
- 点击**分类 / 子类**节点 → 右侧列出其包含的全部工具
- 顶部可按关系类型（属于 / 归类 / 标签 / 相关 / 替代）逐层过滤
- **按一级分类聚焦**：顶部「聚焦分类」一行选一个分类，只保留它的子图
  （分类节点 + 子类 + 工具），标签、外部服务与其他分类整体收起，并自动框选居中；
  再点一次该分类或按 `Esc` 回到全览
- **只看我部署了的**（「我的基础设施」那一行）：把整张图收成我真正在跑的那部分
  ——73 个在跑的工具、它们的子类 / 分类，以及把它们串起来的标签。这个视图写在 URL 里
  （`/graph?deployed=1`），首页的**已自部署**格子与「自部署服务」页每一行的
  「在图谱中查看」都指向它；它与分类聚焦互斥（开一个会自动清掉另一个），按 `Esc` 退回全图
- 支持 `?focus=<工具 id>` 深链：从 Wiki 页点「在知识图谱中查看 →」后会带参跳转，
  图谱渲染完成后自动把该节点**平移居中、放大并高亮**——在 600+ 条边的图里一眼定位。
  可与分类聚焦共存，也可与 `deployed=1` 同时出现（自部署页的行就是这样递链接的）。
  未知 id 会被忽略（正常全览）。
- 力导向布局**只计算一次**并把坐标固定下来：切换关系过滤只改变连线，不会重新抖散全图，
  因此深链聚焦的节点不会在过滤后跑偏。被收起的节点只是转成透明，不会从数据里删掉，
  所以退回全览时每个点都还在原来的坐标上。

### 4. 自部署服务（`/deployed`）
按部署位置分组列出我实际在跑的 81 个服务：**Cloudflare 无服务器**（16）、
**GitHub Pages 静态镜像**（34）、**本机 Docker + Cloudflare Tunnel**（31），
每行写清它跑在什么栈上（Workers · KV、Pages、Docker…）。这一页不是另一份清单：
每一行都通过自己的 `resource` 字段挂回图鉴条目，所以行上有两个出口——
**Wiki**（进那个条目的页面）和**在图谱中查看**（`/graph?deployed=1&focus=<id>`，
带着「只看已部署」的子图直接聚焦到它）。

同一件事也可以跑两次：`searxng` 有本机容器、也有 GitHub Pages 文档镜像，`shlink` 有 Docker 后端、
也有边缘上的官方前端 —— 这些不合并成一条，`instances` 按组累加，81 行落在 73 个条目上。

行的 `id` 全局唯一（不只是同一组内唯一）：页面拿 `id` 给每行做 key，Wiki 右栏、图谱气泡与
节点速览也都拿 `id` 给实例做 key，所以 Docker 的 `ttyd` 和它的 GitHub 文档镜像如果同名，会在
这三个视图里一起撞开。`npm run data` 现在直接拒绝跨组重用的行 id。18 行因此不叫工具本名：
13 个 GitHub 文档镜像带 `-docs`（`ttyd-docs`、`heimdall-docs`、`synapse-docs`…），5 行是同一
工具的第二个部署（`shlink-web`、`hacktricks-gh`、`patt-cf`…）。
页面一律经由 `resource` 而不是行的 `id` 解析：这 18 行的 id 不是图鉴 id，直接拿 `id` 找条目
会让它们的 Wiki 链接和图谱聚焦一起落空。

## 🛠 技术栈

| 层 | 选型 |
| --- | --- |
| 构建 | Vite 8 |
| UI | React 19 + Tailwind CSS 4 |
| 路由 | React Router 7（`basename` 适配 Pages 子路径） |
| 图谱 | ECharts 6（`echarts/core` 按需引入） |
| Markdown | react-markdown + remark-gfm |
| 部署 | GitHub Actions → GitHub Pages + Cloudflare Pages(双平台自动同步) |

## 🚀 本地开发

```bash
npm install

npm run dev        # 启动开发服务器
npm run data       # 数据源 → src/data/*.json：join 校验 deployed.json，改完数据源后执行
npm run icons      # 抓取每个 host 的站点图标 → public/icons/ + src/data/icons.json
npm run fonts      # 抽取站点用到的字形 → public/fonts/*.woff2（中文子集，自托管）
node scripts/build-wikis.mjs   # 生成 181 篇 Wiki + src/data/backlinks.json
npm run build      # 先刷新 Wiki 与 backlinks.json，再打包到 dist/ 并生成 SPA 兜底 404.html
npm run preview    # 本地预览构建产物
npm run lint       # oxlint
```

> `npm run build` 会在 `dist/` 下额外生成 `404.html`。
> GitHub Pages 对未知路径返回 404，把 `index.html` 复制过去才能让
> `/wiki/ollama` 这类深链接正确交给前端路由。

> Cloudflare Pages 自带同类兜底,打包时用
> `SKIP_SPA_FALLBACK=1 npm run build` 跳过这一步(见下方「深链接(SPA 兜底)」)。

## 📁 项目结构

```
FOSS-Atlas/
├─ scripts/
│  ├─ build-data.mjs        # 数据源 → resources.json + graph.json
│  ├─ build-icons.mjs       # 每个 host → public/icons/* + src/data/icons.json
│  ├─ build-fonts.mjs       # 站点用到的字形 → public/fonts/*.woff2（中文子集自托管）
│  ├─ build-wikis.mjs       # wiki-content + 目录 → public/wiki/*.md + backlinks.json
│  ├─ wiki-content/         # 每篇 Wiki 的散文（一句话总结 / 功能 / 场景），分组存放
│  └─ spa-fallback.mjs      # dist/index.html → dist/404.html(SKIP_SPA_FALLBACK=1 跳过)
├─ public/
│  ├─ .nojekyll             # 让 Pages 原样发布（不跑 Jekyll）
│  ├─ icons/                # 121 个 host 的站点图标（构建期抓取，随包发布）
│  ├─ fonts/                # Noto Sans SC 中文字体子集（构建期生成，随包发布）
│  └─ wiki/                 # 186 篇 Wiki（Markdown + Frontmatter）
│     ├─ ollama.md          # 5 篇手写深度页……
│     ├─ cloudflare-workers.md
│     ├─ vaultwarden.md
│     ├─ immich.md
│     ├─ nextcloud.md
│     └─ …                  # 其余 181 篇由 build-wikis.mjs 生成
├─ src/
│  ├─ data/
│  │  ├─ resources.json     # 186 条资源（生成物，勿手改）
│  │  ├─ graph.json         # 知识图谱 nodes + edges（生成物）
│  │  ├─ deployed.json      # 我在跑的服务：唯一需要手维护的部署清单
│  │  └─ backlinks.json     # 反向链接索引（生成物）
│  ├─ lib/
│  │  ├─ data.js            # 索引、别名解析、图谱查询、侧边栏导航树
│  │  ├─ wiki.js            # Frontmatter 解析 + [[双链]] 转换 + 头部去重
│  │  ├─ backlinks.js       # 读 backlinks.json，同步查询反向链接
│  │  └─ graphStyle.js      # 节点/边样式与语义常量
│  ├─ layouts/
│  │  ├─ FullWidthLayout.jsx # 首页 / 图谱：全宽单列
│  │  └─ SidebarLayout.jsx   # Wiki：左导航树 + 内容 + 移动端抽屉
│  ├─ components/           # Layout / WikiNavSidebar / ResourceCard / DeployedBadge / Markdown / GraphView / GraphNodePopover
│  └─ pages/                # Home / WikiPage / GraphPage / Deployed
└─ .github/workflows/deploy.yml
```

## 🗂 数据流

```
清单文本 ──► scripts/build-data.mjs ──► src/data/resources.json   ┐
                  │                         src/data/graph.json    │
                  ├── 校验：所有 url 必须为 https:// 绝对地址       │
                  └── 校验：deployed.json 的 resource 必须能 join 上│
src/data/deployed.json ──┘   （对不上就构建失败，见「自部署服务」）
                                                                    ▼
wiki-content/*.mjs ──► scripts/build-wikis.mjs ──► public/wiki/*.md
                             └────────────────────► src/data/backlinks.json

resources.json ──► scripts/build-icons.mjs ──► public/icons/* + src/data/icons.json
                    └── 每个 host 抓一张图标；幂等，已存在的不重复下载

站点文案+代码 ──► scripts/build-fonts.mjs ──► public/fonts/*.woff2 + fonts.css
                    └── 抽取全部字形 → 下载完整 Noto Sans SC → 子集化为 woff2
```

> 图标在**构建期**抓取并随包发布，而不是在浏览器里请求 favicon 服务：
> `google.com` / `icons.duckduckgo.com` 在中国大陆不可达，运行时请求会让
> 全部卡片图标退化成字母占位。`iconFor()` 仅在该 host 没有本地图标时才回落到远端。
> 字体同理在**构建期**子集化并自托管：站点只渲染约 1100 个汉字，却要从
> `fonts.googleapis.com` 拉取完整 CJK 字库（数 MB），且该域名在中国大陆不可达。
> `build-fonts.mjs` 收集 `resources.json`、`public/wiki/*.md`、`src/**` 与 `index.html`
> 里出现的全部字符，用 `subset-font`（harfbuzzjs）裁剪成三个权重各约 360KB 的
> woff2（合计约 1MB）。改完站点文案后重跑 `npm run fonts` 即可。
>
> **维护提醒**：新增文案若用了子集之外的生僻字，会回落到 `index.css` 里声明的
> 平台中文字体；要覆盖它们，重跑一次 `npm run fonts` 把新字形并进子集。

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
| `deployed` | 我有在跑的实现；由生成器从 `deployed.json` join 出来，不是手写的 |
| `deployed_kinds` | 这些实现的种类：`instance`（跑工具本身）/ `companion`（官方前端）/ `mirror`（文档或仓库镜像）/ `own`（Atlas 自己的服务） |
| `instances` | 具名实例数组 `{id, url, stack, group, kind}`，`group` 是 `edge` / `github` / `docker`；卡片上的「已自部署 N」就是这个数组的长度 |
| `own` | 仅 Atlas 自建的 12 个条目为 `true`：它们由生成器从 `deployed.json` mint 成真正的图鉴条目（分类 `atlas` / Atlas 自建），另带 `stack` / `group` / `replaces` |

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

### 新增 / 改动一个自部署服务
部署清单在 `src/data/deployed.json`——这是整个仓库里唯一需要**手工维护**的 `src/data/` 文件
（其余三个都是生成物）。它按 `edge` / `github` / `docker` 三组分组，每一项：

```json
{
  "id": "searxng-docs",
  "name": "SearXNG 文档",
  "url": "https://tanlysgy.github.io/searxng/",
  "desc": "元搜索引擎 SearXNG 的文档镜像(自建实例已在本机运行)。",
  "stack": "GH Pages(fork)",
  "kind": "mirror",
  "status": "live",
  "resource": "searxng"
}
```

- `kind` 决定它和图鉴的关系：`instance` / `companion` / `mirror` 都要写 `resource`
  指向已有的工具 id；`own` 表示 Atlas 自己的服务，**不写** `resource`，生成器会把它
  mint 成 `atlas` 分类下的真条目（有卡片、有 Wiki、有图谱节点），可选写 `replaces`
  列出它替代的第三方工具（生成 `alternative_to` 边）。
- 改完跑 `npm run data`：join 校验会列出具体的对不上项（缺 `resource`、指向已改名或
  已删除的工具、行 id 重复——同一组内或跨组都算、`kind` 非法、url 非 https、owned 服务
  url 重复…）并**让构建失败**——漂移不会变成一个悄悄消失的 Wiki 链接。
- 行的 `id` 就是这一行自己的名字，不是图鉴 id；`Deployed.jsx` 一律用 `resource ?? id` 解析。
  加一行之前先查它有没有撞别的行的名字（跨组也算，构建会拦下来），撞了就在 `id` 上区分
  （文档镜像用 `-docs`，第二个部署用 `-cf` / `-gh` / `-web`）。
- 新条目的 Wiki 散文照旧写在 `scripts/wiki-content/`（Atlas 自建那 12 个在 `g7-deployed.mjs`），
  适用场景写「它实际跑在哪、我怎么用」，而不是假设性的安装说明。
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

推送到 `main` 会同时触发两个工作流,两个站点内容一致、互不影响:

| 平台 | 地址 | 工作流 | 站点根路径 |
| --- | --- | --- | --- |
| GitHub Pages | <https://stanlysgy.github.io/FOSS-Atlas/> | `.github/workflows/deploy.yml` | `/<repo>/` |
| Cloudflare Pages | <https://atlas.sgyyyds.qzz.io/> | `.github/workflows/cloudflare-pages.yml` | `/` |

两个站点都在**构建期**通过 `VITE_BASE` 决定基路径,源码无需改动:

```bash
VITE_BASE=/ npm run build             # Cloudflare Pages(根域名)
VITE_BASE=/FOSS-Atlas/ npm run build  # GitHub Pages(项目子路径)
```

GitHub Pages 首次部署前需要在仓库 **Settings → Pages** 把 Source 设为 **GitHub Actions**。

Cloudflare Pages 侧需要两个仓库 Secret(`Settings → Secrets and variables → Actions`):

| Secret | 值 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token,权限含 **Account → Cloudflare Pages → Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | `c177a8c5e2795e2d227ca07078ddedb6` |

缺少 `CLOUDFLARE_API_TOKEN` 时,该工作流会跳过部署并输出告警,GitHub Pages 不受影响。

Cloudflare Pages 项目名固定为 `foss-atlas`;自定义域名 `atlas.sgyyyds.qzz.io`
已在 Cloudflare Pages 项目的 *Custom domains* 中绑定,DNS 由 Cloudflare 托管。

### 深链接(SPA 兜底)

两个平台处理未知路径的方式相反,所以构建时按目标切换:

| 目标 | 未知路径行为 | 做法 |
| --- | --- | --- |
| GitHub Pages | 返回 404 | 构建生成 `dist/404.html`(`scripts/spa-fallback.mjs`) |
| Cloudflare Pages | 自带兜底,返回 200 | 用 `SKIP_SPA_FALLBACK=1` 跳过 404.html |

> ⚠️ Cloudflare Pages 只有在**没有** `404.html` 时才把未知路径交给 `index.html`
> 并返回 200;一旦上传里带 `404.html`,它就用 404 状态码返回这个文件
> (页面照样能渲染,但爬虫与链接检查器会当成 404)。所以两个目标不能共用同一份产物。

## 📄 License

本仓库代码以 MIT 发布；收录资源的版权归各自项目所有。
数据整理自社区流传的「GitHub 精选白P资源清单」，链接可用性持续校验。
