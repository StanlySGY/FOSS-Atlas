# FOSS-Atlas：资源可信度、链接巡检与图谱漫游

日期：2026-11-05

## Wiki 内容日期与事实核验

Wiki 的 updated 只表示内容整理/编辑日期，不代表官方事实在这一天被重新核验。页面另用 verifiedAt 表示事实核验日期，sources 记录核验来源与覆盖范围。

生成式 Wiki 的内容数据位于 scripts/wiki-content/*.mjs。条目可按以下形式声明：

    {
      updated: '2026-11-05',
      verifiedAt: '2026-11-05',
      sources: [
        {
          title: 'Official API documentation',
          url: 'https://example.org/docs/api',
          type: 'official',
          scope: '核验 API 鉴权方式与请求参数，不覆盖额度、可用性或账户资格',
        },
      ],
      summary: '...',
      features: ['...'],
      scenarios: ['...'],
    }

verifiedAt 必须与至少一个明确的 HTTPS 来源同时存在；每条来源需要标题、链接和可读的核验范围。没有证据时不要补日期，页面会如实显示“待核验”。手写深度 Wiki 保留自己的 frontmatter，遵循相同字段约定。

成本与免费方案是另一条证据链：src/data/offerings.json 维护自己的 verifiedAt 和来源。页面会把“方案信息核验日”单独标出，不将单个方案条款核验扩大成整篇 Wiki 的事实核验。

运行 node scripts/build-wikis.mjs 会生成 Wiki Markdown、反向链接索引和 src/data/resource-search-index.json。搜索索引只投影作者维护的摘要、功能、场景、上手步骤、别名和关键词，不把整个 Markdown 正文塞进资源卡片。

## 官网链接巡检

npm run probe:links 检查 src/data/resources.json 中的 193 个官网 URL，以及 src/data/repository-metadata.json 中为目录资源收录的 GitHub 仓库 URL（当前 62 个仓库目标），并输出 JSON 快照。部署流程写到 dist/resource-links.json，每次部署都会重新采集；单个目标的异常不会阻断发布。目标数随目录和仓库元数据变化，不写死在应用逻辑中。

可选参数：

    npm run probe:links -- --out .scratch/resource-links.json
    npm run probe:links -- --out .scratch/resource-links.json --timeout 5000 --concurrency 8

快照保留原始 URL、最终 URL、重定向链、HTTP 状态、耗时、尝试次数和采集时间。并发与超时有上限；对 5xx/超时/传输异常最多重试一次。状态语义：

- ok：收到了 2xx 响应。
- redirect：最终仍有 3xx 响应；若正常完成跳转，跳转链与最终 URL 会保留在快照中并视为可继续访问。
- restricted：401、403、429 或识别到访问认证跳转。不能据此判定网站失效。
- not_found：404/410，需要人工确认是页面迁移、资源下架还是 URL 错误。
- client_error / server_error：其他 HTTP 4xx/5xx。
- timeout / dns_error / tls_error / network_error：请求没有得到可解释的 HTTP 结果，属于不确定信号。

巡检只观察官网入口与已收录仓库入口，不验证登录、API 可用性、账户资格或核心业务流程；不自动修改 resources.json 的 URL。首页的 ?link=review 是可分享的待处理队列，分别列出官网与仓库目标。复核结论可标记为无需修复、入口迁移、确认下架、临时异常或持续跟进；迁移不会自动改写数据源，维护者仍需更新对应目录地址。36 小时内视为新鲜，36–72 小时为偏旧，超过 72 小时为过期；旧快照仍显示原始观测，但不应解读为当前状态。

复核历史保存在当前浏览器的 localStorage，不会上传、跨设备同步或替代 Git 中的目录维护。相同异常签名的误报/预期受限结果会被压下；临时异常只等待一轮新快照，若仍异常会重新打开；待修复/迁移记录会持续显示，直到后续快照验证入口恢复。不要把“已人工记录”误认为源数据已经修改。

## 自部署状态快照

dist/probe.json 是发布时对自部署实例的只读探测。清单更新时间 deployed.updated 与探测时间 probe.ranAt 独立呈现。快照也按 36/72 小时划分新鲜度；旧结果加上“状态可能已变化”提示。401/403/Access 登录跳转属于受限或需认证，不会被计入宕机。

## 搜索与资源比较

首页与全局命令面板共享同一套字段相关性评分，搜索名称、别名、分类/子类、标签、官网域名、免费方案，以及作者维护的任务关键词、功能、适用场景和快速上手文本。优先级按精确名称/别名、名称前缀、标签与任务关键词、摘要/功能/场景逐层降低；多词查询要求每个词都命中，并对同一字段内的组合命中加权，减少“GitHub 替代”这类跨字段偶然命中。拉丁字符资源名/别名支持有限拼写容错（短词不启用，8 个字符以内最多容忍 1 次编辑，9 个及以上最多 2 次）；中文不做编辑距离模糊匹配，较长单词的弱正文命中会被抑制。

搜索索引由 scripts/wiki-content/*.mjs 的 summary、features、scenarios、usage、aliases、keywords 生成。五篇手写 Wiki 可在 frontmatter 中维护 searchAliases 与 searchKeywords，生成索引时一并读取；不把整篇 Markdown 正文直接加入索引，避免“某篇提到 TLS”就被误认为证书服务。别名只收录真实旧名/产品名；任务关键词按资源页面明确记载的能力维护。2026-11-05 完成目录覆盖审计后，向量数据库由 Qdrant、Milvus、pgvector 覆盖，邮件投递由自托管 Postal 与云端 Resend、Brevo 覆盖；邮件校验、临时邮箱、邮件投递和事务邮件 API 仍按不同任务分别归类，不能互相替代。审计方法、入选理由和暂缓候选见 `docs/CATALOGUE-COVERAGE-AUDIT-2026-11-05.md`。

资源比较使用已有的仓库元数据和方案证据：许可证、Stars/Forks、归档状态、免费方案类型及核验日期、个人部署记录、最近官网链接巡检结果。没有数据时显示“暂无数据”；仓库存在但未声明许可证时显示“仓库未声明许可”，不猜测许可证。仓库与官网快照均有采集时间，不能当作实时信息。

## 知识图谱“灵感漫游”

## 2026-11-06 资源健康度复核

本轮将仓库归档、维护活跃度、官方迁移公告和 HTTP 巡检分开判断。GitHub archived 代表仓库只读；未归档不代表仍有安全维护；最近推送时间只是维护活跃度信号，不单独作为删除依据。403、认证跳转、DNS/TLS/网络错误均不能直接判定资源下架。

| 资源 | 证据与结论 | 目录处理 |
|---|---|---|
| Flowise | 官方宣布 2026-07-29 code freeze、2026-08-13 仓库归档、2026-08-31 EOL；npm/Docker 镜像弃用，官方停止接收安全漏洞报告 | 保留历史条目；Wiki 明确 EOL、无安全支持，不建议新项目采用。[官方 EOL](https://flowiseai.com/sunset)、[GitHub 公告](https://github.com/FlowiseAI/Flowise/discussions/6727) |
| File Browser | 官方称 2.63.22 为最后计划版本，2026-09-01 归档，后续不再提供 bug/security fixes | 保留旧条目以支持既有部署；新部署提示评估 [FileBrowser Quantum](https://github.com/gtsteffaniak/filebrowser) 社区 fork，明确其为独立演进项目。[发布说明](https://github.com/filebrowser/filebrowser/releases) |
| Homarr | 原仓库已归档，v1+ 迁移至 homarr-labs/homarr；v1 为重写版本，旧数据/挂载不能直接复用 | 保留旧条目和已有实例；新部署指向[新仓库](https://github.com/homarr-labs/homarr)，按[迁移指南](https://homarr.dev/blog/2025/01/19/migration-guide-1.0/)重建配置 |
| Trojan-Go | 仓库仍可访问且未标记 archived，但最近推送时间为 2024-07-14 | 不宣称项目已停止；标注低维护观察，不建议新生产环境优先采用 |
| Dionaea | 仓库仍可访问且未标记 archived，但最近推送时间为 2024-08-01 | 不宣称项目已停止；标注低维护研究工具，部署前审查依赖与隔离策略 |
| TUIC | 最近推送时间为 2025-05-15，不能据此认定停更 | 本轮不改目录，继续观察 |
| Epodonios/v2ray-configs | 上轮官网/仓库目标均返回 404；同名社区 fork 未证明与原项目同源 | 保留“来源待核验”提示，不自动替换为 fork |

上轮部署巡检检查 259 个目标入口。唯一确认的 404 是 Epodonios/v2ray-configs；其余异常主要为受限访问或 DNS/TLS/网络错误。重定向按可访问入口处理，不能当作失效。该快照是上轮部署时的观测，不代表 2026-11-06 实时状态。

处理原则：不因仓库归档抹去历史价值或既有部署记录；不因仓库未归档就默认活跃维护；不把“已记录处理”当作上游修复；不以同名 fork 替换原项目而不说明来源关系。后续随部署巡检持续复核官网与仓库入口，并按季度复核低维护观察条目。

图谱页面的“灵感漫游”从具有真实 related / alternative_to / tagged 边的工具开始，沿已有关系逐站探索。每站展示关系类型，路线节点和边在画布上高亮，其它元素降低视觉权重。节点速览气泡可把当前节点设为起点；Wiki 页面也可直接启动漫游。

路线仅使用现有图数据，不创建推测关系。URL 参数 walk、walk_seed、walk_step 记录起点、固定种子和当前位置，可复制分享、返回任一站、退出或重新抽取路线。可手动逐站浏览，也可在明确点击后以每站 1.8 秒的节奏自动播放并随时暂停；播放结束自动停止，不会进入循环。当前站点会驱动画布居中高亮，键盘按钮均可操作。自动播放是用户主动启动的发现功能，不会页面加载即播放。

## 回归验证

- npm test：资源状态语义、快照新鲜度、Wiki 来源元数据和真实图边漫游路径。
- npm run lint：静态检查。
- npm run views:check、npm run offers:check：图谱视图和免费方案证据一致性。
- npm run build：Wiki 生成、应用构建和静态预渲染。
