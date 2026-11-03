# FOSS-Atlas 资源可信度一期 — 2026-11-03

## 目标

把“免费 / 开源 / 可用”从含糊标签改成可追溯的信息。此阶段先处理最容易因政策变化误导用户的云服务、托管平台和公共 API；同步建立可扩展的数据模型、构建门禁、详情页展示和 GitHub 仓库元数据刷新。

不将 HTTP 200 等同于免费资格、API 可调用或完整用户流程成功；不把 Stars、Forks 或最近推送时间合成为质量分。

## 已实现

### 1. 免费方案证据数据

新增 src/data/offerings.json。首批 20 条记录使用独立的方案类型：

- free-tier：持续免费用量或免费计划；
- trial：限时试用；
- credit：赠送 credits；
- api-demo：仅特定 API 产品或 Demo 配额；
- paid-usage：按量付费，不宣称存在普遍免费层。

每条记录有资源 ID、短标签、说明、额度与周期、条件、官方来源（URL + 支持的 claim）、核验日期。scripts/check-offerings.mjs 确保 ID 存在且唯一、日期格式正确、类型有效、来源使用 HTTPS、必填信息完整。npm run build 自动执行该门禁。

### 2. 首批核验条目

| 资源 | 方案判断 | 核心风险 / 说明 |
|---|---|---|
| AWS | 试用 credits + 服务级 Always Free | 新客户最高 USD 200 credits、最长 6 个月；Always Free 按服务分别限额 |
| Azure | 新用户试用 + 服务级免费额度 | USD 200 / 30 天；另有 12 个月服务与 Always Free 额度，资格及服务范围不同 |
| Google Cloud | 持续免费额度 | e2-micro 免费额度只适用于指定美国区域和按月总小时数；磁盘、出网也有限制 |
| Oracle Cloud | Always Free | AMD Micro 和 Ampere A1 有独立额度；Compute 必须部署在 home region，且有容量限制 |
| Cloudflare Workers | 产品级免费计划 | 100,000 请求 / 天、10ms CPU、50 次 subrequests；不能泛化为所有 Cloudflare 产品免费 |
| Render | 免费实例 | 750 小时 / workspace / 月；免费 Postgres 30 天到期；不适合作生产承诺 |
| Railway | 试用 + 每月 USD 1 | 新用户一次性 USD 5 最长 30 天，之后 Free 计划每月 USD 1，不滚存 |
| Fly.io | 按量付费 | 旧账户权益不能当作新用户通用免费计划；资源、存储和出网分别计费 |
| Koyeb | 每组织免费 Web 实例 | 512MB / 0.1 vCPU / 2GB SSD；免费 PostgreSQL 另有活跃时间和容量限制 |
| Supabase | Free 计划 | 2 个活跃项目、每项目数据库 / 出网 / 存储额度；一周不活跃可能暂停 |
| Neon | Free 计划 | 2026-10-02 后每项目存储为 1GB；计算、项目数、分支仍有限额 |
| Vercel | Hobby 免费计划 | 仅个人非商业使用；商业用途不能套用 Hobby 免费额度 |
| Netlify | 每月 300 credits | 多种资源共同消耗，不是部署次数或带宽的直接等价物 |
| Gemini API | 模型受限的免费 API 层 | 仅部分模型免费；速率限制按模型和项目变化；Free 层内容可能用于改进 Google 产品 |
| MyMemory | 按字符计量 | 匿名 5,000 字符 / 天；提供有效邮箱参数可达 50,000 字符 / 天；白名单需审核 |
| Replicate | 按模型用量付费 | CPU / GPU 和模型计价不同；浏览到社区模型不意味着持续免费推理 |
| Hugging Face Inference Providers | 每月 credits | Free 用户每月 USD 0.10 credits，金额与可用模型可能变化 |
| OpenWeather One Call API 4.0 | API 产品级免费额度 | 每日首 1,000 次免费，超出按次计费；不代表所有天气 API 均免费 |
| IPinfo Lite | 需 token 的免费层 | Lite 的 country-level Geo / 基础 ASN 与 legacy 无账户公共 API 是不同产品和限制 |
| Unsplash API | Demo / Production 分级 | Demo 50 次 / 小时；Production 1,000 次 / 小时需申请批准，并遵守图片使用规范 |

实际数据文件只包含与当前资源 ID 对应的 20 个有效条目；不匹配的候选项目不会写入，以免产生悬空数据。官方资料链接和具体 claim 以 src/data/offerings.json 为准。额度只代表 2026-11-03 核验到的公开页面信息，不承诺每个账户、国家或历史客户资格相同。

### 3. UI 与筛选

- 首页增加方案类型筛选：持续免费、限时试用、credits、API 免费配额、按量付费。
- 筛选值写入 URL 参数 offer，保留原有搜索、分类和子类状态；清除筛选会移除它。
- 卡片展示方案短标签。
- Wiki 详情页展示方案说明、额度、周期、适用条件和官方来源，并明确说明额度会变化。
- 搜索覆盖 offering 标题、说明和条件。

### 4. GitHub 元数据刷新

新增 scripts/sync-repository-metadata.mjs 和 src/data/repository-metadata.json。资源 URL 直接指向 GitHub repo，或 Wiki frontmatter 声明了 repo 的条目，会被映射到公开 Repository API。

刷新字段：Stars、Forks、SPDX 许可证、Archived / Disabled、最近推送时间、创建时间、默认分支。仅使用只读 GET 请求。两个发布工作流均提供 github.token，并按每日计划构建，使两个站点都有机会刷新元数据。

某仓库返回错误或遇到限流时，保留该资源上次成功快照并记录最近尝试状态；无旧值也会写入 not-found / unavailable 状态记录，避免 UI 静默隐藏异常。没有 GITHUB_TOKEN 的本地构建不发起请求，也不覆盖快照。本轮使用 Runner 上已登录的 GitHub CLI 只读凭据完成真实同步：62 个仓库映射中 61 个成功、1 个 HTTP 404。

### 5. 仓库异常个案：Epodonios/v2ray-configs

- 资源稳定 ID 仍为 epodonators-v2ray-configs，展示名称修正为 Epodonios/v2ray-configs，原始仓库 URL 保持不变。
- 2026-11-03 通过 GitHub Repository API 和页面访问均得到 HTTP 404。搜索到的同名社区 fork 不代表原作者项目，故不自动替换上游链接。
- Wiki 已改为“原始仓库不可确认当前可用”，不再宣称高频更新；仓库面板显示 404 状态和核验日期。后续若确认了正式迁移仓库，再另行调整来源。

### 6. 自动化与测试

- npm run offers:check：免费方案证据数据完整性门禁。
- npm run repositories:sync：在 GITHUB_TOKEN 存在时刷新公开仓库元数据。
- npm run build 在主构建前先运行 offering 校验和仓库元数据同步。
- 自动化测试覆盖方案类型、资源 ID、HTTPS 来源、免费与付费分类、仓库 URL 解析、许可证缺失、成功更新、API 限流旧快照回退、无 token 跳过、首次 404 记录以及 404 旧快照保留。

## 本轮验收结果（2026-11-03）

- npm test：32/32 通过。
- npm run lint：76 个文件，0 warnings / 0 errors。
- npm run offers:check：20 条记录、20 个唯一资源 ID、所有证据链接为 HTTPS。
- npm run views:check：全图 283 节点；部署视图 106 节点（16/40 标签、120/337 标签边）；11 个分类视图通过。
- npm run og:check：4 张 OG 卡片与当前数据一致（186 tools、642 edges、75 deployed resources、93 instances）。
- GitHub Pages（VITE_BASE=/FOSS-Atlas/）与 Cloudflare Pages（VITE_BASE=/、跳过 SPA fallback）构建均成功；各自预渲染 189 个页面，其中 186 篇 Wiki。
- Headless Chrome 156 实际验收：首页 API 免费配额筛选显示 6 条；切换按量付费后只显示 Fly.io / Replicate，清除筛选移除 URL 参数；AWS 额度来源和条件、Ollama 仓库快照、Epodonios 404 状态、Gemini API 未执行真实调用的提示均可见。390px 首页 / Wiki、320px Wiki 无横向溢出，浏览器未记录运行时错误。
- GitHub 仓库快照在本轮实际刷新 62 条：61 条 available，1 条 not-found（Epodonios/v2ray-configs，HTTP 404）。

以上验收针对本轮实现，不代表 186 条资源已全部完成事实核验、所有 API 已进行密钥调用或所有开源仓库都有已验证的许可证。

## 目前未做、不能误报为已完成

1. 没有对 186 条资源逐一验证全部产品功能、注册流程、免费资格和 API 实际调用；首批只覆盖 20 条证据记录。
2. Gemini 等 API 的免费层说明不等于已使用密钥完成实时调用；不会在 CI 中触发真实付费 API 或耗用免费配额。
3. GitHub 仓库元数据已使用 Runner 上的 GitHub CLI 只读凭据完成真实同步：62 个仓库映射中 61 个成功、1 个 HTTP 404；自动化脚本另有 mock 测试覆盖成功、限流、404 与旧快照回退。推送后的 Actions 将按每日计划继续刷新。
4. GitHub 最近推送时间不是 Release 频率、维护质量或安全等级；当前未拉取 Releases、漏洞公告或贡献者多样性。
5. GitLab / Codeberg 等其他代码托管平台尚未纳入相同自动化元数据管道。
6. 图谱的 related / alternative_to 关系仍以现有人工数据为准，本阶段没有批量推断新关系。
7. 当前不做总分、榜单或安全评分；所有证据展示为独立事实与来源。

## 验证命令

- npm test
- npm run lint
- npm run offers:check
- npm run views:check
- npm run og:check
- npm run build
- VITE_BASE=/ SKIP_SPA_FALLBACK=1 npm run build
- git diff --check

## 后续扩展顺序

1. 扩到其余高风险免费资源，优先免费 VPS、API、国内 AI 服务和需要信用卡的试用计划。
2. 为非 GitHub 资源建立 GitLab / Codeberg / 官方 Release 来源适配器。
3. 将 API 健康状态拆成“文档可访问 / endpoint 可访问 / 真实鉴权调用成功”，只对公开、安全、不会耗用付费额度的只读端点做自动化。
4. 再评估图谱关系：每条相关或替代关系都必须有理由、来源或显式人工确认。
