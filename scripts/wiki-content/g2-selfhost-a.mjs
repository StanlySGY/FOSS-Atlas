export default {
  seafile: {
    summary: '高性能的开源网盘系统，主打大文件同步与团队资料库。',
    features: [
      '分块同步，大文件和海量照片也能快速上传',
      '支持资料库共享、群组权限与在线预览',
      '保留文件历史版本与回收站，误删可恢复',
    ],
    scenarios: [
      '个人或团队搭建私有的同步网盘',
      '在多台设备之间保持文件与照片一致',
    ],
  },
  joplin: {
    summary: '开源笔记应用，笔记保存在本机，并支持端到端加密同步。',
    features: [
      'Markdown 编辑，支持待办、附件与图片',
      '端到端加密，可同步到自建 WebDAV 或网盘',
      '提供网页剪藏和多端客户端，电脑手机通用',
    ],
    scenarios: [
      '已自建同步服务端：sh-joplin + Postgres 经 foss-labs 隧道跑在 joplin.sgyyyds.qzz.io',
      '官方客户端把同步目标指向自己的服务端，笔记库只落在自家机器',
      '注册关闭、仅管理员建号，公网只暴露登录一个入口',
    ],
  },
  trilium: {
    summary: '层级化的个人知识库笔记工具，用树状结构组织长文档与素材。',
    features: [
      '树状笔记结构，可无限层级嵌套整理内容',
      '支持关系图、属性与模板，适合编织知识网',
      '可自建服务器同步，也能单机离线使用',
    ],
    scenarios: [
      '整理长期积累的资料、笔记与项目文档',
      '需要比普通笔记更强的层级与关联管理',
    ],
  },
  memos: {
    summary: '轻量的碎片化笔记服务，像发动态一样随手记录日常想法。',
    features: [
      '纯文本快速记录，输入即存，没有多余结构',
      '支持标签归类、图片与 Markdown 片段',
      '可自建服务器，记录存在自己手里',
    ],
    scenarios: [
      '随手记录灵感、待办和临时想法',
      '小团队内部共享简单的公告与记录',
    ],
  },
  freshrss: {
    summary: '自建 RSS 阅读器，把多个站点的更新聚合到一个时间线。',
    features: [
      '支持多用户与订阅分组，可导入导出 OPML',
      '提供网页版与手机客户端接口',
      '可装扩展，支持全文抓取与过滤规则',
    ],
    scenarios: [
      '集中阅读多个博客和资讯站的更新',
      '想摆脱第三方阅读器的数量和隐私限制',
    ],
  },
  miniflux: {
    summary: '极简风格的自建 RSS 阅读器，专注快速阅读本身。',
    features: [
      '界面极简，加载快，支持键盘快捷键操作',
      '支持全文抓取、过滤规则与多用户',
      '提供 API，可搭配第三方客户端使用',
    ],
    scenarios: [
      '只需要纯粹的订阅阅读，不要花哨功能',
      '在低配服务器上长期运行 RSS 服务',
    ],
  },
  jellyfin: {
    summary: '开源自建的媒体服务器，统一管理自己的电影、剧集和音乐。',
    features: [
      '自动刮削影片信息，生成海报与简介',
      '多端播放，支持手机、电视和浏览器',
      '支持硬件转码与多用户独立观看记录',
    ],
    scenarios: [
      '把本地影音库整理成随处可点播的站点',
      '家庭多人各自观看，互不打扰',
    ],
  },
  'matrix-synapse': {
    summary: 'Matrix 协议的参考服务端，用来搭建去中心化即时通讯。',
    features: [
      '支持端到端加密的私聊与群聊',
      '可与其它 Matrix 服务器互通消息',
      '提供桥接，接入 IRC、Telegram 等平台',
    ],
    scenarios: [
      '自建聊天服务器，替代 Discord 等平台',
      '需要跨组织、跨服务器互通消息的团队',
    ],
  },
  'uptime-kuma': {
    summary: '自建的站点监控与告警面板，持续检查各项服务是否在线。',
    features: [
      '支持 HTTP、TCP、Ping 等多种监控类型',
      '状态页可对外公开，展示服务运行情况',
      '告警可推送到 Telegram、邮件或 Webhook',
    ],
    scenarios: [
      '监控自己搭建的网站和服务是否掉线',
      '给用户提供一个公开的运行状态页面',
    ],
    keywords: ["服务器监控","网站监控","服务可用性","HTTP 监控","TCP 监控","Ping 监控"],
  },
  shlink: {
    summary: '自建短链接服务，用来生成属于自己域名的短网址并统计点击。',
    features: [
      '生成自定义后缀的短链，可设置有效期',
      '记录点击次数、来源与地理位置统计',
      '提供 API 接口，支持绑定多个域名',
    ],
    scenarios: [
      '把长链接缩短后分享到社交平台',
      '统计自己发布链接的点击情况',
    ],
    keywords: ["短链接","短网址","URL 缩短","点击统计","访问来源统计","自建短链"],
  },
  qbittorrent: {
    summary: '开源 BT 下载客户端，界面接近常见的桌面下载工具。',
    features: [
      '支持种子与磁力链接，可订阅 RSS 自动下载',
      '内置搜索插件与 IP 过滤功能',
      '提供 Web 界面，适合装在服务器远程管理',
    ],
    scenarios: [
      '在下载机上挂 BT 任务并远程查看进度',
      '需要一个没有广告的桌面 BT 客户端',
    ],
  },
  aria2: {
    summary: '轻量命令行下载工具，支持 HTTP、BT 和磁力等多种协议。',
    features: [
      '命令行运行，占用低，支持多线程分段下载',
      '可同时处理 HTTP、FTP、BT 与磁力链接',
      '提供 RPC 接口，方便脚本或前端调用',
    ],
    scenarios: [
      '在服务器上批量下载大文件或做离线下载',
      '配合网页前端搭建远程下载工具',
    ],
  },
  rustdesk: {
    summary: '开源的远程桌面工具，支持自建中继服务器，连接不依赖第三方。',
    features: [
      '支持 Windows、macOS、Linux 与移动端',
      '可自建中继服务器，连接不经过第三方',
      '支持文件传输、剪贴板同步与多屏切换',
    ],
    scenarios: [
      '远程操作家里或公司的电脑',
      '替代 TeamViewer 等商业远程桌面软件',
    ],
  },
  gitea: {
    summary: '轻量自建 Git 代码托管服务，占用低、部署简单。',
    features: [
      '提供仓库、Issue、Pull Request 等完整功能',
      '支持组织、团队与细粒度的权限管理',
      '内置 Actions 与包管理，便于协作扩展',
    ],
    scenarios: [
      '团队搭建私有代码仓库，代码不外流',
      '在低配服务器或内网环境托管 Git 仓库',
    ],
    keywords: ["自建 Git 仓库","私有 Git 仓库","代码托管","GitHub 替代"],
  },
  forgejo: {
    summary: '社区驱动的 Gitea 分支，强调开放治理与自托管。',
    features: [
      '提供与 Gitea 类似的仓库、Issue 与 PR 功能',
      '由社区治理，开发路线公开透明',
      '支持 Actions 和包管理，可持续自托管',
    ],
    scenarios: [
      '看重社区治理而非公司主导的自托管团队',
      '从 Gitea 迁移过来的私有代码托管需求',
    ],
    keywords: ["自建 Git 仓库","私有 Git 仓库","代码托管","GitHub 替代"],
  },
  woodpecker: {
    summary: '轻量级 CI/CD 工具，用容器流水线自动构建与部署。',
    features: [
      '用 YAML 定义流水线，在容器中执行各步骤',
      '可与 Gitea、Forgejo、GitHub 等代码库集成',
      '支持插件扩展与多条流水线并行运行',
    ],
    scenarios: [
      '给自建 Git 服务上的项目接入自动构建',
      '代码提交后自动跑测试并部署到服务器',
    ],
  },
  postal: {
    summary: '自托管邮件投递平台，为网站和应用管理邮件服务器、SMTP/API 凭据以及出站邮件投递。',
    features: ['为不同应用或业务建立独立 mail server 与 SMTP / API 凭据', '支持发信域名验证、SPF / DKIM 检查、退信路径及投递状态管理', '提供 Docker 安装流程、Web 管理界面和 API'],
    scenarios: ['希望自管应用通知、注册验证、订单通知等事务邮件投递链路', '有域名 DNS 和服务器运维能力，希望减少对第三方邮件投递平台的依赖'],
    usage: ['按官方安装指南准备主机、Docker、数据库和 Postal 主机名，再运行 bootstrap 与初始化流程。', '创建组织和 mail server，添加发信域名，按管理界面生成的记录配置 SPF、DKIM 与 Return-Path。', '创建 SMTP 或 API 凭据，先向自己的测试邮箱发送测试邮件并检查退信与投递状态。'],
    cautions: ['Postal 不是开箱即用的 Gmail / Exchange 替代品；它主要解决应用邮件投递，完整邮箱收发和 IMAP/群组协作应另行选型。', '自托管方需要负责 DNS、服务器维护和升级；邮件域名必须验证，SPF 与 DKIM 是可靠投递的基础，MX 仅在需要由 Postal 接收邮件时配置。', '公网发信还要关注出口 IP 信誉、反向 DNS、运营商端口策略、退信处理和滥用防护；不能把服务启动等同于邮件可达。'],
    keywords: ['邮件服务', '邮件发送', '自建邮件投递', 'SMTP 服务器', '事务邮件自托管', '邮件投递平台', '应用邮件通知'],
    updated: '2026-11-05',
    verifiedAt: '2026-11-05',
    sources: [
      { title: 'Postal 官方仓库与 MIT 许可证', url: 'https://github.com/postalserver/postal', scope: '开源邮件投递平台定位与 MIT 许可证' },
      { title: 'Postal Installation', url: 'https://docs.postalserver.io/getting-started/installation/', scope: 'Docker 部署前置步骤、初始化、运行和 SMTP/API 凭据' },
      { title: 'Postal Sending Domains', url: 'https://docs.postalserver.io/features/sending-domains/', scope: '发信域名验证、SPF、DKIM、MX 与 Return-Path 的用途和检查方式' },
      { title: 'Postal Getting Started', url: 'https://docs.postalserver.io/getting-started/', scope: '自建方负责 DNS、维护和升级的运维责任说明' },
    ],
  },
}
