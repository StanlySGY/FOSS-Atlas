export default {
  'google-cloud': {
    summary: 'Google Cloud 的永久免费层，含 1 台美区 e2-micro 虚拟机、5GB 存储与每月 1GB 出网流量。',
    features: [
      '美区 e2-micro 虚拟机实例永久免费',
      '附带 5GB 云存储与每月 1GB 出网额度',
      '新用户还可另申请试用赠金体验付费产品',
    ],
    scenarios: [
      '挂一个小型常驻服务或测试用虚拟机',
      '存放少量静态资源与备份文件',
    ],
  },
  'aws': {
    summary: 'Amazon 的免费层，提供注册后 12 个月的 t2.micro 额度，以及 Lambda 等长期免费服务。',
    features: [
      't2.micro 每月 750 小时，限注册后 12 个月',
      'Lambda 每月 100 万次调用长期免费',
      'DynamoDB 等组件也带独立的免费额度',
    ],
    scenarios: [
      '学习云服务与跑个人练手项目',
      '托管低流量的 API 或定时任务',
    ],
  },
  'azure': {
    summary: '微软 Azure 的免费账户，提供几十项永久免费服务，外加 12 个月的热门服务额度。',
    features: [
      '包含 55 项以上永久免费服务',
      'App Service F1 层可跑小型 Web 应用',
      '新用户另有可支配的入门试用额度',
    ],
    scenarios: [
      '托管小型 Web 应用或 API',
      '顺着微软技术栈做企业方向练手',
    ],
  },
  'oracle-cloud': {
    summary: 'Oracle Cloud 的永久免费层，提供 2 台 AMD 与 4 台 ARM 虚拟机，规格在一众云厂商里相当慷慨。',
    features: [
      '2 台 AMD 实例与 4 台 ARM 实例永久免费',
      'Always Free 资源不设到期时间',
      '另含对象存储与自治数据库免费额度',
    ],
    scenarios: [
      '自建服务、博客或轻量生产环境',
      '跑需要长期在线的常驻进程',
    ],
  },
  'render': {
    summary: 'Render 是一站式托管平台，可以免费部署 Web 服务、静态站点与后台任务。',
    features: [
      '每月 750 小时免费实例额度',
      '支持 Git 推送后自动部署',
      '内置静态站点与托管数据库选项',
    ],
    scenarios: [
      '部署个人博客或副业小项目',
      '替代需要常驻的 Web 服务',
    ],
    keywords: ["云端部署","应用托管","Web 服务托管","持续部署"],
  },
  'railway': {
    summary: 'Railway 通过连接代码仓库自动构建部署应用，新账号每月会获得一定的试用额度。',
    features: [
      '连接仓库后自动构建并部署',
      '按资源用量计费，注册送月度试用额度',
      '内置数据库与项目变量管理',
    ],
    scenarios: [
      '快速上线需要后端的小项目',
      '托管机器人等需要常驻的应用',
    ],
    keywords: ["云端部署","应用托管","后端托管","持续部署"],
  },
  'fly-io': {
    summary: 'Fly.io 把应用跑在靠近用户的边缘节点上，免费层可以开 3 台小型共享 CPU 实例。',
    features: [
      '3 台 shared-cpu-1x 实例永久免费',
      '支持用 Docker 镜像直接部署',
      '可选多个区域就近部署',
    ],
    scenarios: [
      '部署低流量的 API 或小服务',
      '体验边缘部署与多区域容灾',
    ],
    keywords: ["云端部署","应用托管","边缘部署","多区域部署"],
  },
  'koyeb': {
    summary: 'Koyeb 是面向开发者的无服务器 PaaS，提供入门级 nano 实例用于跑常驻服务。',
    features: [
      '提供 nano 规格的免费实例额度',
      '支持 Git 或 Docker 镜像部署',
      '按需伸缩，闲置时可缩容到零',
    ],
    scenarios: [
      '托管小型 API 与后台常驻服务',
      '个人项目的持续部署与迭代',
    ],
    keywords: ["云端部署","应用托管","无服务器部署","持续部署"],
  },
  'supabase': {
    summary: 'Supabase 是开源的 Firebase 替代方案，免费层提供托管 Postgres 与认证、存储等后端能力。',
    features: [
      '托管 Postgres 数据库，自带管理面板',
      '内置认证、对象存储与实时订阅',
      '自动生成 REST 与实时数据接口',
    ],
    scenarios: [
      '给前后端分离的项目配后端服务',
      '快速搭一个带登录的 MVP 原型',
    ],
  },
  'neon': {
    summary: 'Neon 提供 Serverless Postgres，把计算与存储分离，免费层含 0.5GB 存储空间。',
    features: [
      '数据库分支，可像代码一样开预览环境',
      '计算与存储分离，闲置时自动休眠',
      '兼容标准 Postgres 的连接方式',
    ],
    scenarios: [
      '给 Serverless 应用配一个数据库',
      '让每个预览分支用独立数据库',
    ],
  },
  'vercel': {
    summary: 'Vercel 是前端托管平台，Hobby 计划对个人项目永久免费，对 Next.js 的支持尤其顺滑。',
    features: [
      'Hobby 计划个人使用永久免费',
      'Git 推送触发预览与生产部署',
      '内置 Serverless 函数与边缘网络',
    ],
    scenarios: [
      '部署个人作品集与技术博客',
      '给前端项目做预览与联调环境',
    ],
  },
  'netlify': {
    summary: 'Netlify 面向静态站点与前端项目，免费层提供流量额度与每月构建时长。',
    features: [
      '每月 100GB 带宽与 300 分钟构建',
      'Git 推送自动部署并生成预览链接',
      '内置表单收集、重定向与函数能力',
    ],
    scenarios: [
      '托管文档站与静态博客站点',
      '给开源项目做在线演示站点',
    ],
  },
  'is-a-dev': {
    summary: 'is-a.dev 向开发者免费发放 .is-a.dev 子域名，通过 GitHub 提交申请即可获得。',
    features: [
      '面向开发者免费提供子域名',
      '通过 GitHub 提交 PR 申请域名',
      '支持配置 CNAME 等常见记录',
    ],
    scenarios: [
      '给个人项目配一个好记的域名',
      '为作品集或演示站绑定自定义域名',
    ],
  },
  'js-org': {
    summary: 'js.org 为 JavaScript 相关项目免费提供 .js.org 子域名，需要在 GitHub 上提交申请。',
    features: [
      '仅面向 JS 项目免费发放子域名',
      '在 GitHub 仓库提交申请与配置',
      '可指向 GitHub Pages 或自有站点',
    ],
    scenarios: [
      '给开源 JS 库配一个专属域名',
      '让项目文档站点的地址更好记',
    ],
  },
  'eu-org': {
    summary: 'eu.org 提供长期免费的 .eu.org 域名，申请需要人工审核，周期偏长。',
    features: [
      '免费注册 .eu.org 二级域名',
      '申请需人工审核，等待周期较长',
      '支持自建 DNS 或使用第三方解析',
    ],
    scenarios: [
      '想要免费独立域名做个人站点',
      '给测试服务绑定一个固定域名',
    ],
  },
  'pp-ua': {
    summary: 'pp.ua 是 nic.ua 提供的免费域名后缀，注册账号后即可申请 .pp.ua 域名。',
    features: [
      '需注册 nic.ua 账号后申请',
      '免费注册 .pp.ua 域名',
      '支持配置自定义 DNS 服务器',
    ],
    scenarios: [
      '需要一个零成本的独立域名',
      '给实验性服务配一个固定地址',
    ],
  },
  'cloudflare-dns': {
    summary: 'Cloudflare 的免费权威 DNS 解析服务，同时附带 CDN 缓存与基础的安全防护。',
    features: [
      '免费权威 DNS 解析，基于全球 Anycast',
      '附带 CDN 缓存与 HTTPS 支持',
      '面板可管理解析记录与代理开关',
    ],
    scenarios: [
      '把域名解析交给稳定的公共 DNS',
      '给站点加上免费的 CDN 与防护',
    ],
  },
  'hurricane-electric': {
    summary: 'Hurricane Electric 提供的免费 DNS 托管服务，老牌且长期稳定运行。',
    features: [
      '免费的主机名与 DNS 托管',
      '支持常见记录类型与动态更新',
      '同站还提供免费的 IPv6 隧道服务',
    ],
    scenarios: [
      '给多个域名做免费 DNS 托管',
      '学习并实践 IPv6 与隧道配置',
    ],
  },
  'nextdns': {
    summary: 'NextDNS 是带过滤能力的加密 DNS 服务，免费额度为每月 30 万次查询。',
    features: [
      '每月 30 万次查询免费',
      '支持过滤广告与追踪类域名',
      '提供加密 DNS 与多设备配置',
    ],
    scenarios: [
      '给家庭网络做广告与追踪过滤',
      '在各设备上统一隐私 DNS 策略',
    ],
  },
  'bunnydns': {
    summary: 'Bunny DNS 是 Bunny.net 的 DNS 托管服务，第一个域名免费，走全球 Anycast 网络解析。',
    features: [
      '允许第一个域名免费托管解析',
      '基于全球 Anycast 网络解析',
      '面板可配置记录并查看统计',
    ],
    scenarios: [
      '给个人域名找便宜的 DNS 托管',
      '给站点配置低延迟的解析服务',
    ],
  },
  'lets-encrypt': {
    summary: 'Let\'s Encrypt 是免费且自动化的证书颁发机构，是给网站启用 HTTPS 最常用的选择。',
    features: [
      '免费签发 DV 证书，不限数量',
      '证书有效期 90 天，配合 ACME 自动续期',
      '被主流 Web 服务器与运维工具广泛支持',
    ],
    scenarios: [
      '给自建站点开启 HTTPS',
      '配合 certbot 等工具做自动续期',
    ],
    keywords: ["域名证书","免费 HTTPS 证书","SSL 证书","ACME 证书"],
  },
  'zerossl': {
    summary: 'ZeroSSL 提供免费的 DV 证书，可以走 ACME 协议自动签发，也能在网页面板上申请。',
    features: [
      '免费签发 90 天有效期的 DV 证书',
      '支持 ACME 协议自动签发',
      '提供网页面板与在线签发工具',
    ],
    scenarios: [
      '给个人站点申请一张免费证书',
      '在支持 ACME 的平台上自动续期',
    ],
    keywords: ["域名证书","免费 HTTPS 证书","SSL 证书","ACME 证书"],
  },
  'cloudflare-origin-ca': {
    summary: 'Cloudflare 的源站证书，专门用来加密 Cloudflare 与源服务器之间的那段连接。',
    features: [
      '免费签发，有效期最长可达 15 年',
      '仅在经过 Cloudflare 代理时生效',
      '可生成通配符或单域名证书',
    ],
    scenarios: [
      '为接入 Cloudflare 的源站配 HTTPS',
      '免去源站证书频繁续期的麻烦',
    ],
    keywords: ["域名证书","源站证书","Cloudflare 源站 HTTPS","SSL 证书"],
  },
  'buypass-go': {
    summary: 'Buypass Go SSL 是基于 ACME 协议的免费证书服务，签发证书的有效期比常见方案更长。',
    features: [
      '通过 ACME 协议免费签发证书',
      '签发的证书有效期为 180 天',
      '被主流 ACME 客户端支持',
    ],
    scenarios: [
      '作为主流免费 ACME 服务的备选',
      '需要更长有效期以减少续期频率',
    ],
    keywords: ["域名证书","免费 HTTPS 证书","SSL 证书","ACME 证书"],
  },
  'uptimerobot': {
    summary: 'UptimeRobot 提供网站可用性监控，免费账户可建多个监控项，服务宕机时发出告警。',
    features: [
      '免费账户可创建 50 个监控项',
      '支持 HTTP、Ping、端口等多种监控类型',
      '宕机时通过邮件等渠道发送告警',
    ],
    scenarios: [
      '监控个人站点是否在线可访问',
      '在服务异常时及时收到通知',
    ],
    keywords: ["网站监控","站点可用性","HTTP 监控","宕机告警"],
  },
  'better-stack': {
    summary: 'Better Stack 把可用性监控、日志与事件管理合在一处，免费层提供基础的监控额度。',
    features: [
      '免费层至少提供 1 个监控项',
      '内置日志管理与事件调度功能',
      '附带公开状态页与告警通知',
    ],
    scenarios: [
      '给小项目做简单的可用性监控',
      '统一查看应用的日志与事件记录',
    ],
  },
  'logtail': {
    summary: 'Logtail 是 Better Stack 旗下的日志管理服务，负责日志的采集、查询与告警。',
    features: [
      '按量计费的日志采集与存储',
      '支持结构化查询与实时过滤',
      '可配置基于日志内容的告警规则',
    ],
    scenarios: [
      '集中收集多台服务器产生的日志',
      '排查线上问题并做日志留存审计',
    ],
  },
  'sentry': {
    summary: 'Sentry 是应用错误追踪平台，免费层每月可以上报一定数量的错误事件。',
    features: [
      '自动收集异常并附带完整堆栈信息',
      '提供多语言 SDK 与版本发布跟踪',
      '按项目聚合错误并支持告警通知',
    ],
    scenarios: [
      '定位线上应用抛出的具体报错',
      '上线后监控新版本引入的问题',
    ],
  },
  'free-programming-books': {
    summary: 'Free Ebook Foundation 维护的免费编程书清单，按语言与主题分类收录大量电子书链接。',
    features: [
      '覆盖多语言与多主题的免费书单',
      '按分类整理，方便按需查找',
      '开源协作，通过 PR 持续补充',
    ],
    scenarios: [
      '自学编程时查找合适的免费教材',
      '给团队或新人整理学习资料',
    ],
  },
  resend: {
    related: ['brevo', 'postal'],
    summary: '面向开发者的事务邮件服务，提供 REST API、SMTP relay 和 SDK，用于从应用发送验证、通知和业务触发邮件。',
    features: ['通过 REST API 或 SMTP relay 发送应用邮件，并提供官方 SDK', '支持独立验证发信域名，可用子域名隔离不同业务的发信信誉', '提供投递事件与域名管理能力，适合接入应用后端'],
    scenarios: ['为 SaaS / Web 应用发送注册验证、密码重置和订单通知', '希望用 API 或 SMTP 快速接入发信，不自行维护 SMTP 投递服务器'],
    usage: ['创建账户，把发送用 API Key 放入后端环境变量，先用官方测试地址验证请求。', '通过 POST /emails 发送测试邮件；同一逻辑邮件的重试复用 Idempotency-Key，并在 Dashboard 核对事件。', '向真实用户发信前验证自有域名，配置投递事件处理、发送队列和限流重试。'],
    guide: [
      {
        title: '选择测试入口并准备凭据',
        body: `适合从应用后端发送注册验证、密码重置或订单通知。先准备 Resend 账户、有发送权限的 API Key、Bash 和支持 \`--fail-with-body\` 的 curl。

本例使用官方发件人 \`onboarding@resend.dev\`，只发往官方测试收件人 \`delivered@resend.dev\`，不需要先配置自己的发信域名。这会模拟投递事件，不会把邮件送到你的真实收件箱，但仍然消耗账户发送额度。

密钥只保存在服务端环境或密钥管理中，不要放进前端代码、公开仓库或截图。可在本机 Bash 用隐藏输入设置本次会话的变量，输入过程不会把密钥写进命令文本：

\`\`\`bash
read -rsp 'Resend API Key: ' RESEND_API_KEY
printf '\\n'
export RESEND_API_KEY
\`\`\`

执行成功不会显示密钥；不要使用 \`echo\` 输出它或开启 shell 调试跟踪。部署后端时，通过托管平台的秘密变量配置同名变量。`,
      },
      {
        title: '发送一封可安全重试的测试邮件',
        body: `在同一个 Bash 会话执行以下请求。幂等键 \`atlas-demo/first-message-v1\` 标识这封逻辑邮件；先保持发件人、收件人、主题和正文不变。

\`\`\`bash
curl --fail-with-body -sS -X POST \\
  https://api.resend.com/emails \\
  -H "Authorization: Bearer $RESEND_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'Idempotency-Key: atlas-demo/first-message-v1' \\
  --data '{
    "from":"onboarding@resend.dev",
    "to":["delivered@resend.dev"],
    "subject":"FOSS Atlas API test",
    "text":"This is a simulated delivery test."
  }'
\`\`\`

预期返回一个带 \`id\` 的 JSON 对象。该 ID 表示发送请求已被接受，可用于查找记录；它本身不证明邮件已经投递。如果 curl 报 HTTP 错误，保留响应中的错误类型和描述，按后面的排错步骤处理，避免立即换幂等键重复发送。`,
      },
      {
        title: '在 Dashboard 核对模拟投递',
        body: `打开 Resend Dashboard 的 Emails 列表，按返回的邮件 ID 找到测试记录，核对收件人为 \`delivered@resend.dev\`，并查看详情中的模拟 Delivered 事件。刚接受请求时事件可能尚未出现，稍后刷新再检查；不要去真实邮箱等待这封测试邮件。

返回 ID 与出现 Delivered 是两个检查点：前者验证接口接受了请求，后者验证平台产生了预期的模拟事件。这个测试不证明真实收件方一定会接收邮件或把它放入收件箱。接入 Webhook 后，还可用官方 \`bounced@resend.dev\`、\`complained@resend.dev\` 地址测试退信和投诉处理；每个新测试场景使用新的幂等键。`,
      },
      {
        title: '按错误类型重试或修正配置',
        body: `同一逻辑邮件因超时或网络中断重试时，保留相同请求体和 \`Idempotency-Key\`；官方去重窗口为 24 小时，窗口内重复请求会得到相同响应且不会重复发送。不同邮件要用新键。不要每次重试都随机换键，也不要把本例固定键用于所有业务邮件。超过 24 小时先核对发送记录和业务状态，不能再依赖这个窗口去重。

- 401：确认变量已设置，\`Authorization: Bearer\` 格式正确，Key 未失效且具备所需权限；密钥格式错误也可能返回 400，应同时读取错误正文。
- 403：先核对错误类型。常见原因是发件域名未验证、\`from\` 不匹配已验证域名，或使用测试发件域名向不允许的真实地址发送；Key 被停用或权限不足也会触发 403。
- 409：\`invalid_idempotent_request\` 表示同一键的请求体变了；若是原邮件重试，恢复原请求体，若确实要发另一封，换新键。\`concurrent_idempotent_requests\` 表示同键请求仍在处理中，稍后用原键重试。
- 429：限流时让任务进入队列，降低并发并按响应头提示退避；若错误是日/月额度耗尽，等待额度恢复或调整方案，持续重试不会解决。`,
      },
      {
        title: '验证自有域名后再面向真实用户',
        body: `面向真实用户发信前，在 Dashboard 的 Domains 添加自己拥有且能管理 DNS 的域名或子域名。逐项使用当前域名页面生成的 DNS 记录完成验证；不要照抄别人的记录名、值或截图，也不要随意覆盖已有邮件服务的记录。

等状态变为 Verified 后，将 \`from\` 改为该已验证域名下的地址，并以新的逻辑邮件键向你有权测试的真实收件人发送。保留返回 ID，结合投递事件、退信和投诉处理核对结果；正式接入时把请求放到后端队列，并按业务事件持久保存幂等键。

事务邮件与营销邮件可使用不同子域名管理发信信誉。本指南只核验测试与接口流程，套餐额度见本站独立额度面板及账户当前显示；测试邮件也计入发送额度。结束本机试验后可执行 \`unset RESEND_API_KEY\` 清除当前 shell 的变量。`,
      },
    ],
    cautions: ['官方测试地址只模拟投递，不会进入你的真实收件箱，但仍计入发送额度；具体套餐限制以独立额度面板和账户显示为准。', 'API Key 只放在服务端；正式向用户发信前验证自有域名，API 返回 id 不等于已送达。', '事务邮件和营销邮件的发信域名宜分开管理，避免营销退信影响账号验证和密码重置等关键邮件。'],
    keywords: ['邮件服务', '邮件发送', '邮件发送 API', '事务邮件', '应用邮件', '注册验证邮件', '密码重置邮件', '邮件 API', 'SMTP relay'],
    updated: '2026-11-06',
    verifiedAt: '2026-11-06',
    sources: [
      { title: 'Resend Send Email', url: 'https://resend.com/docs/api-reference/emails/send-email', scope: 'POST /emails、Bearer 鉴权、from/to/subject/text 请求字段和返回 id' },
      { title: 'Resend Send Test Emails', url: 'https://resend.com/docs/dashboard/emails/send-test-emails', scope: '官方模拟投递、退信与投诉地址；测试邮件计入发送额度' },
      { title: 'Resend Idempotency Keys', url: 'https://resend.com/docs/dashboard/emails/idempotency-keys', scope: 'Idempotency-Key 请求头、同请求重试去重及 24 小时保留窗口' },
      { title: 'Resend API Errors', url: 'https://resend.com/docs/api-reference/errors', scope: '401/403 凭据和域名问题、409 幂等冲突、429 限流及额度错误' },
      { title: 'Resend Verified Domains', url: 'https://resend.com/docs/dashboard/domains/introduction', scope: '真实业务发信的自有域名验证，以及子域名隔离发信信誉；不用于限制官方模拟测试地址' },
    ],
  },
  brevo: {
    summary: '云端邮件与客户沟通平台，提供独立的事务邮件 API，可通过接口或 SDK 发送由应用事件触发的邮件。',
    features: ['通过 POST /v3/smtp/email 发送 HTML、纯文本或模板事务邮件', '提供发送结果 messageId 和事务邮件事件 Webhook', '除事务邮件外还包含营销邮件、联系人管理等产品能力'],
    scenarios: ['为网站发送注册确认、订单通知、账单提醒等非营销邮件', '希望在一个服务中管理应用邮件，并按需使用其联系人和营销工具'],
    usage: ['创建 Brevo 账户和 API Key，登记发件人并验证发信域名。', '调用 POST /v3/smtp/email，传入 sender、to、subject 与 htmlContent、textContent 或 templateId。', '根据返回的 messageId 和 Webhook 事件记录投递状态，并监测退信、投诉和错误。'],
    cautions: ['Free 方案每天最多发送 300 封，未使用的当日额度不会结转；最多 100,000 个联系人不代表每天能发送 100,000 封。', '发件人必须登记并验证，域名还需完成认证；调用 API 前先核对账户额度、发信身份和收件人限制。', 'Brevo 同时包含营销邮件能力，本目录将其放在事务邮件 API 分类只表示开发者接口用途，不代表营销群发规则与事务邮件相同。'],
    keywords: ['邮件服务', '邮件发送', '邮件发送 API', '事务邮件', '应用邮件', '邮件通知', 'SMTP API', '邮件 API', 'Brevo API'],
    updated: '2026-11-05',
    verifiedAt: '2026-11-05',
    sources: [
      { title: 'Brevo Pricing Plans', url: 'https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans', scope: 'Free 方案每日 300 封与最多 100,000 个联系人；未用发送额度不结转' },
      { title: 'Brevo Send a Transactional Email', url: 'https://developers.brevo.com/docs/send-a-transactional-email', scope: '事务邮件 API、POST /v3/smtp/email、HTML/文本/模板与 Webhook 事件' },
      { title: 'Brevo Senders and Domains', url: 'https://developers.brevo.com/docs/getting-started-with-senders-and-domains', scope: '发件人验证和域名认证前置要求' },
    ],
  },
};
