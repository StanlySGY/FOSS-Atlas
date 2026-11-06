export default {
  'drone': {
    summary: '容器原生的自建 CI/CD 平台，用 YAML 定义流水线，可作为 GitLab CI 的开源替代。',
    features: [
      '用 YAML 声明流水线，代码提交后自动构建与测试',
      '基于容器运行每个步骤，环境隔离且可复现',
      '支持 GitHub、Gitea、GitLab 等多种代码托管',
    ],
    scenarios: [
      '自建 CI 平台承担代码构建、测试与部署',
      '中小团队在自有服务器上跑自动化交付流程',
    ],
  },
  'nginx-proxy-manager': {
    summary: '带 Web 界面的反向代理与证书管理工具，用图形化操作替代手写 Nginx 配置。',
    features: [
      '图形界面添加域名、转发规则与 SSL 证书',
      '自动申请并续期免费的 HTTPS 证书',
      '支持访问控制列表、HTTP 重定向与流代理',
    ],
    scenarios: [
      '给内网多个自建服务统一分配域名和 HTTPS',
      '不熟悉 Nginx 配置也想搭建反向代理的用户',
    ],
  },
  '1panel': {
    summary: '现代化的 Linux 服务器运维面板，把网站、Docker 与文件管理集中到一个界面。',
    features: [
      '图形化安装与管理 Docker 应用和容器',
      '内置网站、数据库、文件与终端管理',
      '支持计划任务、备份与安全加固设置',
    ],
    scenarios: [
      '用一台 VPS 部署和管理多个自建服务',
      '希望用面板替代命令行运维的站长',
    ],
    keywords: ["Docker 管理面板","容器管理面板","Linux 服务器面板","VPS 运维面板"],
  },
  'casaos': {
    summary: '面向家庭服务器的轻量级面板，用极简界面管理 Docker 应用与本地存储。',
    features: [
      '一键安装自托管应用，界面类似 NAS 系统',
      '统一管理 Docker 容器与本地磁盘目录',
      '轻量低占用，适合常驻家庭小主机',
    ],
    scenarios: [
      '把闲置小主机或软路由变成家庭云服务',
      '想低门槛搭建家庭影音、网盘与工具站',
    ],
    keywords: ["Docker 管理面板","家庭服务器面板","NAS 面板","自托管应用管理","容器管理面板","家庭云","家庭服务器"],
  },
  'ddns-go': {
    summary: '自动把本机变化的公网 IP 同步到域名解析记录，解决动态 IP 无法固定访问的问题。',
    features: [
      '定时读取本机公网 IP 并更新域名解析记录',
      '支持阿里云、腾讯云、Cloudflare 等多家服务商',
      '提供 Web 界面配置，支持 IPv4 与 IPv6',
    ],
    scenarios: [
      '家宽动态 IP 下用域名稳定访问自建服务',
      '为软路由、NAS 等设备绑定固定域名',
    ],
  },
  'navidrome': {
    summary: '自建音乐流媒体服务，扫描本地曲库后可在浏览器或客户端随时播放。',
    features: [
      '扫描本地音乐文件，自动整理歌手与专辑信息',
      '兼容 Subsonic API，可搭配多种第三方客户端',
      '占用资源低，支持多用户与歌单收藏',
    ],
    scenarios: [
      '把收藏的音乐目录做成随时可听的私人电台',
      '在手机、电脑上远程访问家里的曲库',
    ],
  },
  'outline': {
    summary: '团队知识库与协作文档工具，用 Markdown 快速搭起结构清晰的内部 Wiki。',
    features: [
      '富文本与 Markdown 编辑，多人实时协作',
      '层级化文档目录与全文搜索，便于查找',
      '支持权限管理、评论与 Slack 等集成',
    ],
    scenarios: [
      '团队沉淀规章制度、流程与技术文档',
      '作为公司内部 Wiki 替代零散的在线文档',
    ],
  },
  'mattermost': {
    summary: '可自部署的团队聊天协作平台，功能对标 Slack，消息数据掌握在自己手里。',
    features: [
      '按频道和私聊组织消息，支持线程回复',
      '支持 Webhook、机器人与众多第三方集成',
      '可自托管部署，满足内网与合规要求',
    ],
    scenarios: [
      '团队需要私有化聊天工具且不愿用公有云',
      '替代企业 IM，与自建系统统一登录',
    ],
  },
  'kanboard': {
    summary: '极简的看板式任务管理工具，用拖拽卡片直观安排和推进工作进度。',
    features: [
      '看板列与卡片拖拽，直观呈现任务状态',
      '支持子任务、截止时间、泳道与筛选',
      'PHP 编写，部署轻量，数据库可只用 SQLite',
    ],
    scenarios: [
      '小团队或个人管理项目待办与进度',
      '想用极简看板替代复杂项目管理软件',
    ],
  },
  'focalboard': {
    summary: '开源看板与项目管理工具，支持看板、表格等多种视图来组织任务。',
    features: [
      '同一批任务可在看板、表格等视图间切换',
      '支持属性字段、筛选与卡片自定义',
      '可自托管部署，也有桌面客户端版本',
    ],
    scenarios: [
      '团队管理项目任务与迭代进度',
      '需要比纯看板更灵活视图的个人或小组',
    ],
  },
  'passbolt': {
    summary: '面向团队的密码管理工具，通过浏览器扩展共享凭据，支持自托管部署。',
    features: [
      '基于浏览器扩展存取密码，支持自动填充',
      '端到端加密，凭据以 GPG 密钥保护',
      '按用户或群组精细控制密码共享权限',
    ],
    scenarios: [
      '团队共用一批账号密码需要安全共享',
      '运维、财务等岗位集中管理敏感凭据',
    ],
  },
  'radicale': {
    summary: '轻量的 CalDAV 与 CardDAV 服务端，让日历和通讯录在多设备之间同步。',
    features: [
      '提供 CalDAV 接口，手机日历可双向同步',
      '提供 CardDAV 接口，集中管理联系人',
      '基于 Python，占用小，配置简单',
    ],
    scenarios: [
      '自建日历通讯录，避免依赖公有云账号',
      '在手机、电脑多端同步同一份日程',
    ],
  },
  'ohmyform': {
    summary: '开源的表单收集工具，可自建问卷与报名表并集中查看提交结果。',
    features: [
      '可视化拖拽搭建表单，无需写代码',
      '发布链接收集填写结果并导出数据',
      '可自托管部署，数据保存在自己服务器',
    ],
    scenarios: [
      '收集活动报名、问卷或反馈表单',
      '不希望把表单数据放在第三方平台',
    ],
  },
  'linkding': {
    summary: '轻量的自建书签管理服务，把散落的网址集中收藏并打标签检索。',
    features: [
      '收藏网址并打标签，支持全文搜索',
      '提供浏览器扩展，一键保存当前页面',
      '部署简单，运行占用资源很低',
    ],
    scenarios: [
      '替代浏览器自带书签，跨设备访问收藏',
      '整理学习资料、工具站等技术链接',
    ],
  },
  'searxng': {
    summary: '自建的元搜索引擎，聚合多个引擎的结果并过滤追踪，保护搜索隐私。',
    features: [
      '一次搜索聚合 Google、Bing 等多个引擎结果',
      '不记录用户数据，拦截广告与追踪脚本',
      '支持自选引擎、语言与安全的搜索偏好',
    ],
    scenarios: [
      '重视隐私，不想被搜索引擎记录关键词',
      '自建搜索入口，统一多个引擎的检索结果',
    ],
  },
  'filebrowser': {
    updated: '2026-11-06',
    verifiedAt: '2026-11-06',
    sources: [
      { title: 'File Browser 最终版本与归档公告', url: 'https://github.com/filebrowser/filebrowser/releases', type: 'official', scope: '核验 2.63.22 为最后计划版本、2026-09-01 归档及后续不再提供修复' },
      { title: 'FileBrowser Quantum 官方文档', url: 'https://filebrowserquantum.com/en/docs/help/about/', type: 'official', scope: '核验社区 fork 的功能定位、与原版的关系及当前维护说明' },
      { title: 'FileBrowser Quantum 维护者说明', url: 'https://filebrowserquantum.com/en/docs/help/qa/', type: 'official', scope: '核验当前维护者与项目维护方式' },
    ],
    summary: '原版轻量网页文件管理器已于 2026-09-01 归档。既有部署可继续使用，但新部署应优先评估持续维护的 FileBrowser Quantum 社区 fork。',
    features: [
      '网页界面浏览目录，支持上传与下载文件',
      '在线预览、重命名、编辑文本等常用操作',
      '原版已停止后续 bug 与安全修复；Quantum 是独立演进的社区 fork',
    ],
    scenarios: [
      '维护既有 File Browser 部署并评估迁移',
      '新部署优先评估 https://github.com/gtsteffaniak/filebrowser',
    ],
    aliases: ['File Browser Classic'],
    keywords: ['已归档','停止维护','FileBrowser Quantum','文件管理'],
  },
  'wetty': {
    summary: '把终端搬进浏览器的开源工具，基于 xterm.js 通过网页连接 SSH 会话。',
    features: [
      '网页中打开终端，直接连接 SSH 或本地 shell',
      '基于 xterm.js 与 WebSocket 实现实时交互',
      '部署轻量，可反向代理后成 WebSSH 入口',
    ],
    scenarios: [
      '在浏览器里临时登录服务器执行命令',
      '为不便安装 SSH 客户端的设备提供终端',
    ],
  },
  'ttyd': {
    summary: '把命令行共享到浏览器的轻量工具，用一条命令即可开放 Web 终端。',
    features: [
      '启动即开放网页终端，通过 WebSocket 交互',
      '可指定要运行的命令，做成固定入口',
      'C 语言编写，体积小，部署几乎无依赖',
    ],
    scenarios: [
      '临时分享终端给他人演示或协作',
      '给自建服务提供简单的网页命令行',
    ],
  },
  'excalidraw': {
    summary: '手绘风格的开源白板，用来随手画流程图、示意图和架构草图。',
    features: [
      '手绘观感的图形与箭头，画示意图很直观',
      '支持多人实时协作与本地保存',
      '可导出图片，也能嵌入到其他文档中',
    ],
    scenarios: [
      '快速画系统架构图、流程图做讲解',
      '会议中多人同屏涂鸦沟通想法',
    ],
  },
  'xray-reality': {
    summary: '基于 Xray 内核的 Reality 代理方案，借真实网站 SNI 伪装流量，抗封锁能力较强。',
    features: [
      'Reality 伪装真实网站证书，无需自备域名证书',
      '支持 VLESS、XTLS 等协议，性能表现较好',
      '被探测时难以与正常网站流量区分',
    ],
    scenarios: [
      '自建代理追求稳定与较强抗封锁能力',
      '没有多余域名证书仍想搭建隐蔽节点',
    ],
  },
  'sing-box': {
    summary: '一体化的通用代理内核，单个程序同时支持多种协议，客户端与服务端通用。',
    features: [
      '单一内核兼容多种主流代理协议',
      '规则化分流，可按域名与地区灵活选线路',
      '提供图形客户端与服务端，配置体系统一',
    ],
    scenarios: [
      '希望用一个内核同时应付多种协议节点',
      '统一管理多协议的自建代理环境',
    ],
  },
  'mihomo': {
    summary: 'Clash Meta 内核，规则分流能力强大，客户端与服务端场景都能使用。',
    features: [
      '基于规则的流量分流，支持丰富规则集',
      '支持 TUN 模式接管设备全局流量',
      '兼容多种代理协议与常见订阅格式',
    ],
    scenarios: [
      '需要细致分流规则来精确控制代理走留',
      '作为客户端内核搭配图形界面一起使用',
    ],
  },
  'hysteria2': {
    summary: '基于 QUIC 的代理协议，在网络质量较差、丢包严重时仍能保持较高速度。',
    features: [
      '基于 QUIC 传输，弱网与丢包环境下速度好',
      '可伪装成 HTTP/3 流量，隐蔽性较好',
      '自带拥塞控制，尽量跑满可用带宽',
    ],
    scenarios: [
      '线路质量差、丢包严重时追求传输速度',
      '自建节点希望协议较新且不易被识别',
    ],
  },
  'trojan-go': {
    updated: '2026-11-06',
    verifiedAt: '2026-11-06',
    sources: [
      { title: 'Trojan-Go GitHub 仓库', url: 'https://github.com/p4gefau1t/trojan-go', type: 'official', scope: '核验仓库仍可访问、未标记 archived；仓库元数据显示最近推送于 2024-07-14，不能据此推断仍有安全维护' },
    ],
    summary: 'TLS 伪装的 Trojan 代理实现。仓库未归档，但最近一次仓库推送距今已超过两年，缺少持续维护信号；仅供理解与维护既有部署，不建议新生产环境优先采用。',
    features: [
      '以 TLS 承载流量，外形与普通 HTTPS 相似',
      '支持 WebSocket 与多路复用，便于套 CDN',
      '项目未被 GitHub 标记归档，但维护活跃度偏低',
    ],
    scenarios: [
      '理解既有 Trojan-Go 部署与兼容性',
      '新部署前应优先比较仍在持续维护的替代内核',
    ],
    keywords: ['低维护','维护状态待观察','不建议新部署'],
  },
  'snell': {
    summary: 'Surge 自研的加密代理协议，配合 Surge 客户端使用，配置简洁、延迟较低。',
    features: [
      'Surge 生态自有的加密代理协议',
      '配置项简洁，连接延迟较低',
      '服务端由 Surge 官方提供，与客户端配套',
    ],
    scenarios: [
      '使用 Surge 时需要自建加密节点',
      '在 Surge 生态内追求简单稳定的代理',
    ],
  },
  'tuic': {
    summary: '基于 QUIC 的轻量代理协议，主打低延迟，适合对响应速度敏感的场景。',
    features: [
      '基于 QUIC 传输，延迟低，连接建立快',
      '支持 UDP 转发，适合游戏与实时应用',
      '协议实现轻量，资源占用较少',
    ],
    scenarios: [
      '对延迟敏感的游戏或实时应用代理',
      '希望节点轻量、易维护的自建环境',
    ],
  },
  'tpot': {
    summary: '德国电信开源的多蜜罐一体化平台，集中部署多种蜜罐并可视化攻击数据。',
    features: [
      '集成二十余种蜜罐，用 Docker 一键部署',
      '内置仪表盘，可视化展示攻击来源与手法',
      '集中收集日志，便于安全研究与演练',
    ],
    scenarios: [
      '搭建安全演练环境观察真实攻击行为',
      '研究攻击手法、收集威胁情报样本',
    ],
  },
  'cowrie': {
    summary: '交互式 SSH 与 Telnet 蜜罐，记录暴力破解尝试和攻击者输入的每一条命令。',
    features: [
      '伪装成 SSH/Telnet 服务，记录登录与命令',
      '模拟文件系统与 shell，延长攻击者交互',
      '输出日志便于分析攻击手法与字典',
    ],
    scenarios: [
      '部署在公网记录针对 SSH 的暴力破解',
      '学习攻击者常用命令与入侵思路',
    ],
  },
  'dionaea': {
    updated: '2026-11-06',
    verifiedAt: '2026-11-06',
    sources: [
      { title: 'Dionaea GitHub 仓库', url: 'https://github.com/DinoTools/dionaea', type: 'official', scope: '核验仓库仍可访问、未标记 archived；仓库元数据显示最近推送于 2024-08-01，维护活跃度偏低' },
    ],
    summary: '低交互蜜罐，通过模拟常见服务诱捕恶意软件样本。仓库仍可访问且未归档，但最近推送距今已超过两年，应视为低维护研究工具，部署前需自行评估依赖与安全风险。',
    features: [
      '模拟 SMB、HTTP 等多种服务吸引攻击',
      '捕获恶意软件样本并记录下载来源',
      '项目未被 GitHub 标记归档，但维护活跃度偏低',
    ],
    scenarios: [
      '研究既有 Dionaea 部署与蜜罐数据',
      '部署前先审查依赖、隔离策略和当前漏洞状态',
    ],
    keywords: ['低维护','维护状态待观察','安全审查'],
  },
  'hfish': {
    summary: '国产跨平台蜜罐平台，提供 Web 管理界面集中部署与查看各类蜜罐。',
    features: [
      '内置多种蜜罐模板，Web 界面即可部署',
      '集中展示攻击来源、账号密码等捕获数据',
      '支持多节点集群，可跨平台运行',
    ],
    scenarios: [
      '企业内网布设蜜罐发现横向渗透',
      '用中文界面的平台做简单的安全监测',
    ],
  },
};
