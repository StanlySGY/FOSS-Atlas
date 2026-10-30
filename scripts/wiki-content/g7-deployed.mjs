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
    summary: '免费节点聚合订阅：合并多个公开上游并去重，提供 Base64 订阅、明文列表和来源状态。',
    features: [
      '/sub 输出客户端可用的 Base64 订阅，/txt 输出明文节点列表',
      '/api/sources 返回上游来源、抓取状态和各源节点数量',
      '缓存按周期自动刷新，聚合结果会随上游可用性变化',
    ],
    scenarios: [
      '客户端需要一份集中管理的节点订阅，避免手动逐个导入多个来源',
      '想先查看各上游来源状态，再决定是否使用聚合结果',
    ],
    updated: '2026-10-30',
    usage: [
      '打开 Atlas Nodes 首页，查看当前去重节点数、缓存更新时间和各上游来源状态。',
      '将 /sub 地址作为 Base64 订阅导入兼容客户端；需要可读文本时使用 /txt。',
      '脚本或监控可调用 /api/sources，读取 total、cached 和 sources 中每个来源的 ok、count。',
    ],
    apiExamples: [
      {
        title: '查看聚合与上游来源状态',
        path: '/api/sources',
        response: {
          total: 9058,
          cached: true,
          sources: [
            { name: 'mahdibland/V2RayAggregator', ok: true, count: 200 },
            { name: 'peasoft/NoMoreWalls', ok: true, count: 436 },
            { name: 'Epodonios/v2ray-configs · vless', ok: false, count: 0 },
          ],
        },
        note: '数量与 ok 状态为 2026-10-30 的线上快照；上游可用性、节点数量和缓存状态会持续变化。',
      },
    ],
    cautions: [
      '这些是公开抓取的免费节点，来源和质量不一，不保证可用性、匿名性或安全性；不要用于银行、工作账号、生产系统或其他敏感流量。',
      '使用前应自行核验节点来源与出口行为；不要把私人订阅地址、账号凭据或其他秘密混入公开订阅。',
    ],
  },

  qr: {
    summary: '二维码生成 API：将文本或链接转换为 SVG 二维码，适合网页嵌入和矢量打印。',
    features: [
      '/api/qr?data= 和 /qr.svg?data= 均可生成 SVG 二维码',
      '首页提供内容输入框与可选边长像素设置',
      '二维码在自建边缘服务生成，不必把内容交给第三方二维码 API',
    ],
    scenarios: [
      '页面里要放二维码，但不想调用外部二维码生成服务',
      '需要 SVG 矢量图以便缩放、嵌入网页或打印',
    ],
    updated: '2026-10-30',
    usage: [
      '在 Atlas QR 首页输入要编码的文本或完整 URL；需要调整图像尺寸时，可使用页面提供的可选边长像素设置。',
      '程序调用可使用 /api/qr?data=... 或 /qr.svg?data=...，请先对 data 参数进行 URL 编码。',
      '接口返回 SVG 图像，可保存为 .svg 文件或直接作为网页图片资源使用。',
    ],
    apiExamples: [
      {
        title: '生成 SVG 二维码',
        path: '/api/qr?data=FOSS-Atlas',
        note: '线上响应为 image/svg+xml；本轮同时验证 /qr.svg?data=FOSS-Atlas 可用。',
      },
    ],
    cautions: [
      '本轮检查发现 /qr.png?data=FOSS-Atlas 虽返回 HTTP 200，响应 MIME 仍为 image/svg+xml；不要把该路径当作已验证的 PNG 输出。',
      '二维码只是把内容编码成图像，不会替链接背书；扫描陌生二维码前应先核对解码出的域名和目标地址。',
    ],
  },

  px: {
    summary: '公开代理聚合 API：聚合 HTTP、SOCKS4 和 SOCKS5 代理列表，提供明文与结构化输出。',
    features: [
      '/http、/socks4、/socks5 分别输出对应协议的明文列表',
      '/json 返回结构化代理数据，包含国家与 ASN 等字段',
      '/api/sources 返回上游抓取状态和各来源数量',
    ],
    scenarios: [
      '进行隔离的网络连通性实验，需要按协议读取公开代理样本',
      '研究公开代理来源与数据结构，而不是逐个上游站点抓取',
    ],
    updated: '2026-10-30',
    usage: [
      '打开 Atlas Proxy 首页，先查看 HTTP、SOCKS4、SOCKS5 当前数量和页面顶部的安全提示。',
      '按需要读取 /http、/socks4 或 /socks5 明文列表；需要国家和 ASN 字段时再请求 /json。',
      '监控数据来源时使用 /api/sources；本次实测 JSON 汇总接口响应约 913 KB，避免在高频轮询中无必要地重复下载完整列表。',
    ],
    apiExamples: [
      {
        title: '查看代理上游来源',
        path: '/api/sources',
        response: {
          total: 9533,
          cached: true,
          sources: [
            { name: 'TheSpeedX/PROXY-List · http', ok: true, count: 2757 },
            { name: 'monosans/proxy-list · http', ok: true, count: 721 },
            { name: 'monosans/proxy-list · json(带国家/ASN)', ok: true, count: 1752 },
          ],
        },
        note: '这是 2026-10-30 的来源快照；各类型数量随上游更新和缓存刷新而变化。',
      },
    ],
    cautions: [
      '首页明确将数据限定为研究和连通性测试用途；代理来自公开抓取，不保证可用性或安全性，严禁承载密码、Cookie、支付信息和其他敏感流量。',
      '公开代理可能记录、篡改或中转请求；不要把代理列表的存在理解为可信代理服务或隐私保护承诺。',
    ],
  },

  ip: {
    summary: '客户端 IP 查询 API：返回请求来源 IP、粗略地理位置、ASN 和 Cloudflare 边缘节点信息。',
    features: [
      '/json 和 /api/ip 均返回请求来源的结构化信息',
      '字段包括国家、城市、区域、经纬度、时区、ASN、运营商组织和 colo',
      '适合验证当前请求的出口网络与边缘接入位置',
    ],
    scenarios: [
      '脚本需要读取当前出口 IP 和 ASN，检查代理或路由策略是否生效',
      '应用需要展示访客的大致网络归属，而不是精确住址',
    ],
    updated: '2026-10-30',
    usage: [
      '浏览器打开 Atlas IP 首页，可直接看到当前请求来源的 IP、地理位置、ASN 和边缘 colo。',
      '脚本调用 GET /api/ip 或 /json 获取 JSON；返回信息描述的是发起这次请求的客户端网络。',
      '需要自动处理时，可按 ip、country、city、timezone、asn、as_organization 和 colo 等字段读取。',
    ],
    apiExamples: [
      {
        title: '查询当前请求来源信息',
        path: '/api/ip',
        response: {
          ip: '<request-ip>',
          country: '<country-code>',
          country_name: '<country-name>',
          city: '<city>',
          timezone: '<iana-timezone>',
          asn: 0,
          as_organization: '<network-organization>',
          colo: '<cloudflare-colo>',
        },
        note: '尖括号字段和 ASN=0 是文档占位符；真实结果取决于发起请求的网络出口。',
      },
    ],
    cautions: [
      '城市、区域和经纬度来自 IP 归属信息，只能用于粗略定位，不能推断街道、楼栋或真实住址。',
      '接口返回的是调用者本次请求的公网出口信息；通过代理、VPN 或云端执行环境调用时，看到的会是代理或执行环境的出口。',
    ],
  },

  check: {
    summary: '邮箱与域名校验 API：检查邮箱格式、一次性邮箱域名黑名单和 MX 记录。',
    features: [
      '/api/email 校验邮箱地址，并返回域名、格式、一次性邮箱和 MX 字段',
      '/api/domain 直接查询域名的黑名单状态与 MX 记录',
      '响应包含 blocklist_size，便于了解当前本地黑名单规模',
    ],
    scenarios: [
      '注册流程需要初步拦截格式错误或常见一次性邮箱域名',
      '发信前先检查域名是否配置了 MX 记录',
    ],
    updated: '2026-10-30',
    usage: [
      '要检查完整邮箱时，请求 /api/email?email= 并对邮箱地址进行 URL 编码。',
      '只检查域名时，请求 /api/domain?domain=；例如 gmail.com 可用于查看 MX 记录结构。',
      '读取 format_valid、disposable、has_mx、mx 和 blocklist_size 等字段，按业务策略自行决定是否继续注册或发信。',
    ],
    apiExamples: [
      {
        title: '检查邮箱地址',
        path: '/api/email?email=test%40gmail.com',
        response: {
          email: 'test@gmail.com',
          domain: 'gmail.com',
          format_valid: true,
          disposable: false,
          has_mx: true,
          mx: ['5 gmail-smtp-in.l.google.com.'],
          blocklist_size: 9963,
        },
        note: 'MX 列表会有多条记录；blocklist_size 是本轮核验的快照值。',
      },
      {
        title: '检查域名 MX 与黑名单状态',
        path: '/api/domain?domain=gmail.com',
        response: {
          domain: 'gmail.com',
          disposable: false,
          has_mx: true,
          format_valid: true,
          mx: ['5 gmail-smtp-in.l.google.com.'],
          blocklist_size: 9963,
        },
      },
    ],
    cautions: [
      'MX 记录存在不代表具体邮箱地址一定存在，也不代表邮件最终一定送达；该接口不是 SMTP 投递测试。',
      '一次性邮箱黑名单存在覆盖和更新滞后，disposable=false 不等于地址可信；不要仅凭此结果作为唯一反欺诈或账户安全依据。',
    ],
  },

  'atlas-geo': {
    summary: '地理编码与逆地理编码 API：通过地名查找坐标，或通过坐标反查附近地点与地址。',
    features: [
      '/search?q= 将地名转换为坐标和匹配结果',
      '/reverse?lat=...&lon=... 根据坐标返回地址、地点类型和地址组成',
      '查询结果使用自建 KV 缓存，重复请求可直接命中缓存',
    ],
    scenarios: [
      '应用需要把城市、地标或地址转换为经纬度',
      '地图交互已经拿到坐标，需要反查可读的地址或地点信息',
    ],
    updated: '2026-10-30',
    usage: [
      '地名正向查询使用 /search?q=，对中文或包含空格的地名应先做 URL 编码。',
      '坐标逆向查询使用 /reverse?lat=纬度&lon=经度；纬度范围为 -90 至 90，经度范围为 -180 至 180。',
      '响应中的 display_name、lat、lon、type 和 category 可用于展示或进一步处理；结果来自 OpenStreetMap Nominatim。',
    ],
    apiExamples: [
      {
        title: '地名转坐标（首尔）',
        path: '/search?q=Seoul',
        response: {
          source: 'OpenStreetMap Nominatim',
          count: 1,
          results: [
            {
              display_name: '首尔特别市, 韩国 / 南韓',
              lat: '37.5666791',
              lon: '126.9782914',
              type: 'administrative',
              category: 'boundary',
            },
          ],
        },
      },
      {
        title: '坐标反查地址',
        path: '/reverse?lat=37.5665&lon=126.9780',
        response: {
          source: 'OpenStreetMap Nominatim',
          result: {
            display_name: 'Happy Plus Cafe, 110, 世宗大路, 太平路1街, 明洞, 中區, 首尔特别市, 04520, 韩国 / 南韓',
            lat: '37.5665253',
            lon: '126.9787754',
            type: 'cafe',
            category: 'amenity',
          },
        },
        note: '地理结果会随 OpenStreetMap 数据和上游状态变化。',
      },
    ],
    cautions: [
      '地理编码结果是地图数据匹配，不代表地址已经过权威核验；同名地点可能返回多个候选项。',
      '本轮 /json 统一入口的带参数请求遇到上游暂不可用响应，因此只把已成功核验的 /search 与 /reverse 列为推荐调用示例。',
    ],
  },

  'atlas-meta': {
    summary: '链接元数据 / OpenGraph 解析 API：尝试抓取公开网页标题、描述、预览图和站点信息。',
    features: [
      '/json?url= 接收目标页面地址，返回标题、描述、预览图和 favicon 等字段',
      '由服务端抓取目标 HTML 并解析元数据，客户端不必自行处理网页源码',
      '成功响应提供目标状态码、内容类型、字节数和缓存标记；抓取失败会返回 error',
    ],
    scenarios: [
      '分享链接时希望自动生成标题、摘要和缩略图卡片',
      '自建应用需要尝试读取公开网页元数据，并能处理上游抓取失败',
    ],
    updated: '2026-10-30',
    usage: [
      '在首页「页面 URL」输入一个可公开访问的网页地址，或者直接调用 /json?url=。',
      '将目标 URL 作为 url 查询参数并进行 URL 编码；请先用普通公开网页做小规模测试。',
      '成功时读取 status、content_type、title、description、image、site_name 和 favicon；失败时检查 error 字段并准备回退内容。',
    ],
    apiExamples: [
      {
        title: '请求公开网页元数据（当前错误响应示例）',
        path: '/json?url=https%3A%2F%2Fexample.org',
        response: { error: '抓取失败' },
        note: '本轮早期请求曾成功返回 Example Domain 的标题和 status=200，随后对相同公开目标重复探测又返回此错误；此示例记录当前复测到的失败响应，不代表唯一可能的结果。',
      },
    ],
    cautions: [
      '本轮服务表现为间歇性抓取失败：公开页面有过成功响应，但重复探测随后返回「抓取失败」；稳定性尚未确认，调用方必须处理 error 并准备降级展示。',
      '这是服务端抓取目标网页的功能；只提交你有权抓取且可以公开访问的 URL，不要传入内网管理地址、云服务凭据端点或含访问令牌、签名参数、会话标识的 URL。',
      'URL 查询字符串可能进入浏览器历史、代理或服务访问日志，不要放入个人隐私或其他秘密。',
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
