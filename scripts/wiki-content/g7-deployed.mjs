// Wiki prose for the entries this site's 自部署服务 page links to: nine
// catalogue tools I run or mirror, plus the twelve Atlas-owned edge services
// that scripts/build-data.mjs mints out of src/data/deployed.json.
//
// The shape is the same as every other group module — the generator adds name,
// url, tags and the 同类推荐 links. What is different here is the point of view:
// these are things running on my own infrastructure, so 适用场景 names the place
// they actually run rather than a hypothetical install.
export default {
  /* ---------------------------------------------------------------- *
   * Catalogue tools that have a deployment of mine behind them
   * ---------------------------------------------------------------- */
  'neo-chat': {
    summary: '本地优先的 AI 对话工作台，把各家模型、RAG 知识库和插件收进一个界面，数据留在本机。',
    features: [
      '支持 Ollama、OpenAI 兼容接口与本地模型等多种后端',
      '内置 RAG：上传文档后即可在对话中引用',
      '插件与工作流机制，可接搜索、图像等外部能力',
    ],
    scenarios: [
      '想要 ChatGPT 式对话但不想把聊天记录交给第三方',
      '在局域网里给一批文档做问答，同时保留换模型的余地',
    ],
  },

  langflow: {
    summary: '可视化拖拽构建 LLM 工作流与 Agent 的低代码平台，节点连线即流程。',
    features: [
      '拖拽节点搭建检索、生成、分支等流程，无需写胶水代码',
      '组件覆盖模型、向量库、工具调用与记忆',
      '流程可导出为 API 端点，直接给外部应用调用',
    ],
    scenarios: [
      '快速验证一个 RAG 或 Agent 流程，再决定要不要写成代码',
      '把已有的 LLM 调用链交给不太写代码的人维护和调整',
    ],
  },

  'new-api': {
    summary: '多模型 API 网关：把各家 LLM 接口聚合成一套 OpenAI 兼容端点，再分发给自己的应用。',
    features: [
      '统一入口对接多家模型供应商，客户端只认一个地址',
      '带令牌、额度、计费与渠道权重管理',
      '支持渠道故障转移，某家接口挂了自动切到另一家',
    ],
    scenarios: [
      '手上有多个平台的免费额度，想让各个客户端共用',
      '自建网关统一分发 Key，避免每个应用各存一份凭证',
    ],
  },

  axonhub: {
    summary: '开源 AI 网关，重点是渠道故障转移与成本控制，把模型调用集中在一个可观测的入口。',
    features: [
      '多渠道路由与自动故障转移，失败请求可回落到备用渠道',
      '按模型与渠道统计用量和花费',
      '兼容 OpenAI 接口格式，接入现有客户端改动很小',
    ],
    scenarios: [
      '模型渠道不稳定，需要在超时或限流时自动换一条路',
      '想看清每个模型实际花了多少，而不是只有一张账单',
    ],
  },

  syncthing: {
    summary: 'P2P 文件同步工具，设备之间直接互传，不经过任何第三方云。',
    features: [
      '端到端加密，设备间直连同步，无中心服务器',
      '双向同步与冲突检测，多台设备可对等同一个目录',
      'Web 管理界面与 REST API，适合塞进现有自建环境',
    ],
    scenarios: [
      '笔记本、服务器和 NAS 之间同步配置与资料，不想过第三方云',
      '在没有公网固定 IP 的设备之间做增量备份',
    ],
  },

  vikunja: {
    summary: '自建看板与待办任务管理，提供 Web、桌面与移动端，数据完全自持。',
    features: [
      '看板、列表、甘特与标签多种视图，任务可分解为子任务',
      '支持 Kanban 看板与标签、优先级、截止日期',
      '自带 REST API 与 WebDAV，可接日历或其他工具',
    ],
    scenarios: [
      '用自建工具替代 Todoist / Trello，且不想把任务数据交出去',
      '需要在多个设备上看同一份任务清单，包括手机',
    ],
  },

  authentik: {
    summary: '自建身份认证与单点登录（IdP），给其他自建服务统一提供登录与授权。',
    features: [
      '支持 OAuth2 / OIDC / SAML，可给一批自建服务做统一登录',
      '可视化流式策略编辑器组合多因子、分组与审批',
      '代理提供方（outpost）可挂在反向代理上保护后端',
    ],
    scenarios: [
      '自建服务越来越多，逐个装账号体系已经管不过来',
      '想把内网服务的登录统一成一次认证加多因子',
    ],
  },

  heimdall: {
    summary: '自建服务导航仪表盘，把一堆内网服务和外链收在一页图标入口上。',
    features: [
      '应用卡片式仪表盘，支持自定义图标与标签分组',
      '可嵌入存活检测，服务掉了入口会提示',
      '部署轻，单个容器即可跑起来',
    ],
    scenarios: [
      '自建服务多到记不住域名，需要一个统一入口页',
      '给家人或非技术用户一个只需点图标的服务首页',
    ],
  },

  'awesome-selfhosted': {
    summary: '自托管服务大全：按类目收录开源自建方案的上游清单，是自部署选型的第一份索引。',
    features: [
      '按网盘、笔记、媒体、身份认证等类目整理开源自托管项目',
      '每个条目附带简短说明、许可证与后端语言',
      '站点与 Markdown 两个版本都可直接浏览或抓取',
    ],
    scenarios: [
      '想自部署某个用途，先摸清这个领域有哪些成熟方案',
      '对比同类项目的许可证与技术栈再决定部署哪个',
    ],
  },

  /* ---------------------------------------------------------------- *
   * Atlas 自建：Cloudflare 边缘上的自有服务
   * `适用场景` here names what they exist for on this site — replacing a
   * third-party API I would otherwise have to send traffic to.
   * ---------------------------------------------------------------- */
  'foss-atlas-cf': {
    summary: '本目录站的 Cloudflare Pages 镜像，与 GitHub Pages 上的主站保持同一份内容。',
    features: [
      '同一构建产物发布到 Cloudflare Pages，绑定自定义域',
      '与 GitHub Pages 主站内容一致，任一侧可达',
      '静态资源走 Cloudflare 边缘缓存，访问不依赖本机',
    ],
    scenarios: [
      '主站所在平台访问不稳时，还有一条能打开的路径',
      '希望目录站在边缘网络分发，而不是从本机回源',
    ],
  },

  short: {
    summary: '自建短链服务：Workers 加 KV 做去重存储，带点击统计和可列出的链接清单。',
    features: [
      'POST /api/shorten 生成短链，同一长链接复用同一个短码',
      '/stats/<短码> 看点击次数，/api/list 列出全部链接',
      '短码直达跳转，整个链路不经过第三方短链服务',
    ],
    scenarios: [
      '分享长链接时想要自己的短域名，而不是公共短链的域名',
      '需要知道某条链接被点过多少次，并且数据留在自己的 KV 里',
    ],
    updated: '2026-10-30',
    usage: [
      '在页面的「短链目标 URL」输入完整的 http 或 https 地址。',
      '点击「生成短链」，页面会返回对应的短地址；复制短地址后即可分享。',
      '已登记的接口入口包括 POST /api/shorten、/stats/<短码> 统计页和 /api/list 链接清单。',
    ],
    cautions: [
      '短链是公开跳转入口，不要把带有登录令牌、重置密码参数或其他秘密的 URL 转成可公开传播的短链。',
      '/api/list 是清单入口，不应把它当作私有管理接口；不要在短链目标或短链备注中放入个人敏感信息。',
    ],
  },

  paste: {
    summary: '临时文本分享：粘贴即生成链接，附带纯文本端点，内容上限 60KB。',
    features: [
      'POST /api/paste 返回分享链接，/raw/<id> 直接取纯文本',
      '无需登录，也不需要先开某个编辑器',
      '文本存在自己的 KV，不投递给第三方粘贴站',
    ],
    scenarios: [
      '贴一段配置或报错给别人看，几分钟内有效就够',
      '需要在两个设备之间传一小段文本，但不想经过外部站点',
    ],
    updated: '2026-10-30',
    usage: [
      '在页面的文本框中粘贴要分享的内容，当前单条内容上限为 60 KB。',
      '点击「生成链接」，复制返回的分享地址并发送给接收者。',
      '需要程序读取纯文本时，可使用分享地址对应的 /raw/<id> 端点。',
    ],
    cautions: [
      '持有分享地址的人即可读取内容；不要粘贴密码、访问令牌、私钥、个人身份信息或未脱敏的生产日志。',
      '公开页面没有说明内容保留时长，因此不要把 Atlas Paste 当作有明确自动过期承诺的秘密保险箱。',
    ],
  },

  nodes: {
    summary: '免费节点聚合订阅：合并 11 个上游源并去重，13,000+ 条节点，30 分钟自动刷新。',
    features: [
      '/sub 输出订阅，/txt 输出明文列表，/api/sources 列出上游源',
      '跨源合并去重，避免客户端里出现重复节点',
      '定时刷新，上游变动后订阅自己跟上',
    ],
    scenarios: [
      '客户端里想要一份持续更新的免费节点订阅，而不是手动导入了就过期',
      '多个上游源质量不一，需要先合并去重再喂给客户端',
    ],
  },

  qr: {
    summary: '二维码生成 API：传 data 参数返回 SVG，替代 qrserver 之类第三方接口。',
    features: [
      '/api/qr?data= 生成二维码，另有 /qr.svg 与 /qr.png 两种输出',
      'SVG 输出可直接嵌进网页或打印，不受位图尺寸限制',
      '生成在自己账号下，不依赖第三方服务的可用性与速率',
    ],
    scenarios: [
      '页面里要放二维码，但不想把内容交给外部二维码接口',
      '需要矢量二维码以便缩放或印刷',
    ],
  },

  px: {
    summary: '公开代理聚合 API：HTTP / SOCKS4 / SOCKS5 共 8,000+ 条，可按类型取用并带国家与 ASN 信息。',
    features: [
      '/http、/socks4、/socks5 分别输出对应类型，/all 一次取全部',
      '/json 返回结构化结果，附国家与 ASN 字段',
      '/api/sources 说明上游来源，便于判断数据新鲜度',
    ],
    scenarios: [
      '做网络实验或抓取时需要成批公开代理，不想逐个站点去抓',
      '按国家筛代理列表，需要每条带元数据而不只是地址',
    ],
  },

  ip: {
    summary: '客户端 IP 与地理位置 / ASN 查询 API，替代 ipinfo 之类第三方接口。',
    features: [
      '/json 返回请求方的 IP、地理位置与 ASN',
      '/api/ip 提供同样的结构化查询',
      '边缘就近响应，不需要把请求发给外部查询服务',
    ],
    scenarios: [
      '脚本里要拿到出口 IP 及其归属，用来验证路由或策略是否生效',
      '页面想显示访客的大致位置，但不愿调用第三方 IP 查询服务',
    ],
  },

  check: {
    summary: '邮箱与域名校验 API：9,900+ 一次性邮箱域名黑名单加 MX 记录查询，替代 disify 等第三方。',
    features: [
      '/api/email 判断域名是否属于一次性邮箱',
      '/api/domain 查询 MX 记录，确认可收件域名',
      '黑名单自带在 KV 里，判定不依赖外部服务',
    ],
    scenarios: [
      '注册表单要挡掉临时邮箱，需要一个能自己控制的判定接口',
      '发信前先确认域名的 MX 是否真的存在',
    ],
  },

  'atlas-geo': {
    summary: '地理编码与逆地理编码：地名与坐标互转，带自建 KV 缓存，替代 Nominatim 公共实例。',
    features: [
      '/search 地名转坐标，/reverse 坐标转地名，/json 统一输出',
      '查询结果缓存在 KV，重复请求不再回源',
      '不受公共实例的速率限制与可用性影响',
    ],
    scenarios: [
      '应用里需要把地址转成坐标，但公共 Nominatim 实例限速或不稳',
      '同一批地点反复查询，希望第二次几乎瞬时返回',
    ],
  },

  'atlas-meta': {
    summary: '链接元数据 / OpenGraph 解析：抓标题、摘要与缩略图，请求不转发给第三方解析服务。',
    features: [
      '/json?url= 返回标题、描述与缩略图',
      '解析在服务端完成，客户端不必处理 HTML',
      '自建解析意味着抓取行为与缓存策略由自己定',
    ],
    scenarios: [
      '分享链接时想自动生成卡片，而不依赖第三方元数据 API',
      '在自建站点里做链接预览，需要可控的抓取与缓存',
    ],
  },

  'atlas-tools': {
    summary: '常用编码小工具 API：SHA 系列哈希、UUID v4、Base64 / URL / Hex 编解码。',
    features: [
      '/api/hash 计算哈希，/api/uuid 生成 UUID v4',
      '/api/encode 做 Base64、URL 与 Hex 编解码',
      '一个端点集合覆盖日常零散转换，省掉临时脚本',
    ],
    scenarios: [
      '命令行里临时要算个哈希或做段 Base64，不想装额外工具',
      '在脚本中调用编码转换，希望有个稳定的 HTTP 接口',
    ],
    updated: '2026-10-30',
    usage: [
      '手动计算时，在首页「哈希」文本框输入内容并点击「计算 SHA-256」；页面说明这条交互在浏览器侧处理。',
      '脚本调用可使用只读 GET 接口：/api/hash?data=hello、/api/uuid?count=3，以及 /api/encode?mode=base64&data=hello。',
      '编解码接口还可使用 mode=url；示例输入 hello world 会返回 hello%20world。',
    ],
    apiExamples: [
      {
        title: '计算 SHA-256 哈希',
        path: '/api/hash?data=hello',
        response: { alg: 'sha-256', input_bytes: 5, hex: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', base64: 'LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=' },
        note: '此示例省略 alg 参数，当前实测默认算法为 sha-256。',
      },
      {
        title: '生成 3 个 UUID v4',
        path: '/api/uuid?count=3',
        response: { uuids: ['<uuid-v4>', '<uuid-v4>', '<uuid-v4>'] },
        note: 'UUID 是每次请求动态生成的，响应中的占位值仅用于说明 JSON 结构。',
      },
      {
        title: 'Base64 编码',
        path: '/api/encode?mode=base64&data=hello',
        response: { mode: 'base64', input: 'hello', output: 'aGVsbG8=' },
      },
      {
        title: 'URL 编码',
        path: '/api/encode?mode=url&data=hello%20world',
        response: { mode: 'url', input: 'hello world', output: 'hello%20world' },
      },
    ],
    cautions: [
      '页面手动哈希交互在浏览器侧执行；调用 /api/* 时，参数会发送到自己的 tools.sgyyyds.qzz.io 服务。',
      '这些接口通过 GET 查询参数传入文本，参数可能留在浏览器历史、代理或服务访问日志中，不要传入密码、令牌或其他敏感内容。',
      '普通 SHA-256 摘要不等于密码存储方案；不要直接用它替代带盐、专门设计的密码哈希算法。',
    ],
  },

  edgessh: {
    summary: '浏览器里的 SSH 客户端：Workers 加 Durable Objects 维持会话，D1 存审计记录，由 Cloudflare Access 邮箱验证码保护。',
    features: [
      '无需本机装终端或跳板机，浏览器打开即可连服务器',
      '会话由 Durable Objects 承载，连接状态在边缘侧保持',
      '访问由 Cloudflare Access 的邮箱验证码把关，不依赖密码',
    ],
    scenarios: [
      '在别人电脑或手机上要临时连一台服务器应急',
      '需要一个能审计、能撤销的入口，而不是长期有效的密钥或密码',
    ],
    updated: '2026-10-30',
    usage: [
      '打开 EdgeSSH 服务地址，先通过 Cloudflare Access 的邮箱验证码验证身份。',
      '只有被 Access 策略允许的邮箱才能继续访问；未获授权的访客会停留在认证入口。',
      '通过认证后再按页面提供的连接流程进入终端；不要在 Wiki、工单或聊天中粘贴 SSH 私钥、密码或一次性验证码。',
    ],
    cautions: [
      'EdgeSSH 的终端界面受 Cloudflare Access 保护；本次公开核验只能确认认证门槛，未登录状态无法核实认证后的交互细节。',
      'Access 邮箱验证不等于目标服务器本身的 SSH 权限；服务器账号、主机密钥与网络可达性仍需按实际连接目标配置。',
    ],
  },
};
