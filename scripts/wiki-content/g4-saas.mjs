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
};
