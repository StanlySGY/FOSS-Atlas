# 资源目录覆盖审计（2026-11-05）

## 目标与方法

本轮审计从真实开发任务是否能找到可用资源出发，不以增加条目数量为目标。上一轮搜索质量回归中，`向量数据库` 与 `邮件发送` 均无结果；复核发现这不是索引遗漏，而是目录确实没有对应资源。

收录前逐项核验官方项目定位、许可证或产品边界、部署/接入方式、关键约束及维护证据。开源自部署软件优先查看上游仓库与官方部署文档；云端服务查看当前定价、API 和域名验证文档。免费额度只在官方页面明确列出的情况下进入方案证据表。未能把产品的实际功能、成本或维护状态讲清楚时，暂不收录。

## 向量数据库与检索

| 资源 | 定位 | 适合什么场景 | 重要边界 |
| --- | --- | --- | --- |
| [Qdrant](https://github.com/qdrant/qdrant) | 专用向量数据库与搜索引擎 | RAG、语义搜索、带 payload 条件过滤的向量检索；Docker 可快速起步 | 仍需自行选择 Embedding 模型；生产环境需配置鉴权、持久化和备份 |
| [Milvus](https://github.com/milvus-io/milvus) | 云原生、可扩展的向量数据库 | 向量规模较大，或需要从单机部署向分布式集群扩展 | 资源占用明显高于轻量服务；官方 v2.6.x Standalone 文档列出 8 GB RAM 最低、16 GB 推荐，并建议 4 核，集群要求更高；部署前按目标版本复核 |
| [pgvector](https://github.com/pgvector/pgvector) | PostgreSQL 向量扩展 | 已有 PostgreSQL，希望把向量和业务数据放在一起，并通过 SQL / JOIN 完成检索 | 不是独立向量服务；数据库容量、连接、备份和故障恢复由 PostgreSQL 承担 |

三者不是同一种产品的简单替代关系：Qdrant 是专用向量检索服务，Milvus 更适合考虑大规模和分布式部署的场景，pgvector 适合复用已有 PostgreSQL 的系统。目录将它们放在同一“向量数据库 / 检索”子类，具体选型边界在各自 Wiki 中展开。

pgvector 特别标注 0.8.7：PostgreSQL 官方于 2026-10-05 发布说明指出，该版本修复 IVFFlat 索引构建中的缓冲区溢出（CVE-2026-103484），受影响旧版本应评估升级。

## 邮件投递与事务邮件

| 资源 | 定位 | 适合什么场景 | 重要边界 |
| --- | --- | --- | --- |
| [Postal](https://github.com/postalserver/postal) | MIT 许可的自托管邮件投递平台 | 需要自己管理应用发信服务器、SMTP/API 凭据和投递链路 | 运维方负责 DNS、服务器维护、升级、IP 信誉和退信；不等同于完整 Gmail / Exchange 邮箱套件 |
| [Resend](https://resend.com) | 云端事务邮件 API / SMTP relay | 快速接入注册验证、密码重置、业务通知等应用邮件 | Free：3,000 封/月、100 封/日、3 个域名；必须验证自有域名 |
| [Brevo](https://www.brevo.com) | 带事务邮件 API 的云端邮件平台 | 需要事务邮件 API，并可能同时使用联系人管理或营销邮件能力 | Free：300 封/日，最多 100,000 个联系人；未使用的每日邮件额度不结转，联系人容量不是发送额度 |

必须区分四类不同任务：邮件地址校验（验证地址格式/风险）、临时邮箱（提供短期收件箱）、事务邮件（由业务事件触发的发件 API）、自托管邮件投递（自己维护 MTA / 投递平台）。本轮只在后两类补充资源，没有把 Disify 等邮箱校验工具映射为邮件发送服务。

Postal 的官方安装指南明确指出，自建方需要准备域名和 DNS，并承担平台维护与升级；发信域名需要验证，SPF / DKIM 是核心检查项，MX 仅在计划通过 Postal 接收邮件时需要。启动容器不代表公网投递已具备可靠送达能力。

## 暂缓与排除的候选

- **Chroma**：本轮官方 Releases 页面显示，最新稳定标签仍为 1.5.9（2026-05-05），同时能看到 1.5.10.dev 预发布构建（2026-10-02）。不能据此判断项目停止维护，因此不是“判定废弃”；只是首批目录优先收录稳定版本和运行边界更容易核验的方案，后续可在稳定版发布后复核。
- **Weaviate**：官方许可证文件说明仓库中 `wl/` 目录及子目录采用单独的企业许可证，其余代码为 BSD-3-Clause。它是 open-core 项目，不适合在未逐项区分商业功能边界的情况下简单标成完全 BSD 开源，本轮暂缓。
- **营销邮件群发平台**：本轮没有另建营销自动化类别。Brevo 虽然包含营销能力，目录只把它放入事务邮件 API 子类，并单独说明两种业务场景的边界。

## 变更范围与回归目标

本次只新增 6 个条目、3 个子分类：

- AI：Qdrant、Milvus、pgvector。
- SaaS：Resend、Brevo（各自免费发送额度提供官方证据）。
- 自部署：Postal。

搜索回归至少覆盖 `向量数据库`、`PostgreSQL 向量检索`、`大规模向量检索`、`邮件发送`、`SMTP 自建` 和 `事务邮件 API`，并验证 Postal 不会被误认为完整邮箱服务。资源条目、Wiki、搜索索引、图谱和方案证据必须由项目现有生成器保持一致。

## 官方核验来源

- Qdrant：[GitHub / Apache-2.0 与项目定位](https://github.com/qdrant/qdrant)、[Docker 安装与持久化](https://qdrant.tech/documentation/installation/)、[Releases](https://github.com/qdrant/qdrant/releases)。
- Milvus：[GitHub / Apache-2.0 与 LF AI & Data Foundation](https://github.com/milvus-io/milvus)、[功能和数据模型概览](https://milvus.io/docs/overview.md)、[v2.6.x Standalone 硬件要求](https://milvus.io/docs/v2.6.x/prerequisite-docker.md)、[Releases](https://github.com/milvus-io/milvus/releases)。
- pgvector：[README 与安装 / 索引](https://github.com/pgvector/pgvector/blob/master/README.md)、[扩展许可证元数据](https://github.com/pgvector/pgvector/blob/master/META.json)、[PostgreSQL 关于 0.8.7 的公告](https://www.postgresql.org/about/news/pgvector-087-released-3392/)。
- Postal：[GitHub / MIT](https://github.com/postalserver/postal)、[安装指南](https://docs.postalserver.io/getting-started/installation/)、[发信域名与 DNS 验证](https://docs.postalserver.io/features/sending-domains/)、[自建运维责任说明](https://docs.postalserver.io/getting-started/)。
- Resend：[官方定价](https://resend.com/pricing)、[验证域名](https://resend.com/docs/dashboard/domains/introduction)。
- Brevo：[Free 计划说明](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans)、[事务邮件 API](https://developers.brevo.com/docs/send-a-transactional-email)、[发件人和域名验证](https://developers.brevo.com/docs/getting-started-with-senders-and-domains)。
- 暂缓候选：[Chroma Releases](https://github.com/chroma-core/chroma/releases)、[Weaviate LICENSE](https://github.com/weaviate/weaviate/blob/main/LICENSE)。
