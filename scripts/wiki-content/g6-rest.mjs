// Wiki prose for a group of FOSS-Atlas tools.
// Shape: { summary, features[3], scenarios[2] } keyed by tool id.

export default {
  'awesome-hacking': {
    summary: '开源的黑客与安全资源清单，按方向汇总渗透测试、逆向、漏洞研究的学习资料入口。',
    features: [
      '按渗透测试、逆向、CTF 等主题分组索引',
      '汇总教程、工具与练习靶场的入口链接',
      '在 GitHub 上以清单形式持续补充',
    ],
    scenarios: [
      '刚开始学安全，需要系统了解各方向入口',
      '快速查找某类安全工具或学习资料',
    ],
  },

  'payloadsallthethings': {
    summary: '按漏洞类型整理的 Web 安全 Payload 合集，覆盖注入、XSS 等常见场景。',
    features: [
      '按 SQLi、XSS 等漏洞分类整理利用 Payload',
      '附带绕过 WAF 与过滤器的常见手法',
      '提供配套的渗透测试方法学清单',
    ],
    scenarios: [
      '做 Web 渗透测试时查找特定漏洞的利用 Payload',
      '备考 OSCP 等认证时整理利用思路',
    ],
  },

  'hacktricks': {
    summary: '渗透测试技巧百科，按平台与场景整理从信息收集到提权的实操方法与命令。',
    features: [
      '覆盖 Linux、Windows 与云环境等大量场景',
      '每篇给出可直接复制的命令与利用步骤',
      '同时提供在线站点与 PDF 电子书版本',
    ],
    scenarios: [
      '打靶机卡在某个环节时查具体手法',
      '系统学习渗透测试各阶段的方法',
    ],
  },

  'seclists': {
    summary: '安全测试用的字典合集，包含用户名、密码、目录、子域等各类清单。',
    features: [
      '按用户名、密码、目录、子域等类别组织',
      '提供大量模糊测试与爆破用词表',
      '常被 Burp、ffuf 等工具直接调用',
    ],
    scenarios: [
      '做目录扫描和子域爆破时挑选字典',
      '构造口令爆破所需的用户名密码表',
    ],
  },

  'nuclei-templates': {
    summary: 'Nuclei 扫描器使用的漏洞检测模板库，用 YAML 描述各类 CVE 的探测逻辑。',
    features: [
      '以 YAML 模板描述请求与匹配规则',
      '覆盖大量 CVE 与配置错误的检测',
      '社区持续提交，可与 Nuclei 直接联动',
    ],
    scenarios: [
      '用 Nuclei 对目标批量扫描漏洞与指纹',
      '编写自定义模板检测特定漏洞',
    ],
  },

  'gtfobins': {
    summary: '整理 Unix 上可被滥用的二进制程序清单，说明如何借此提权或读取文件。',
    features: [
      '按提权、文件读写、反弹 shell 等能力筛选',
      '给出针对每个二进制可直接照抄的命令',
      '同时覆盖 sudo、SUID 与 capability 场景',
    ],
    scenarios: [
      '拿到低权限 shell 后寻找提权路径',
      '审计系统上存在哪些危险的 SUID 程序',
    ],
  },

  'lolbas': {
    summary: 'Windows 原生二进制与脚本的滥用手册，说明哪些系统自带程序可被用来绕过防护。',
    features: [
      '按用途分类 Windows 自带的程序与脚本',
      '列出每个程序可用的参数与用法示例',
      '覆盖 exe、dll、脚本等多种滥用手法',
    ],
    scenarios: [
      'Windows 环境下做权限维持与横向移动',
      '蓝队排查系统里被滥用的原生程序',
    ],
  },

  'cloudflare-imgbed': {
    summary: '搭建在 Cloudflare 上的免费图床，支持多种存储渠道并自带上传与管理界面。',
    features: [
      '支持 Telegram、R2、S3 等存储渠道',
      '提供网页上传、粘贴上传与随机图接口',
      '跑在 Cloudflare 免费额度上，成本极低',
    ],
    scenarios: [
      '给个人博客或 Markdown 文档放外链图片',
      '不想买对象存储又想自建图床',
    ],
  },

  'cloudflare-tunnel': {
    summary: '把本地服务通过 Cloudflare 网络发布到公网，无需公网 IP 也不用开放端口。',
    features: [
      '本地运行 cloudflared 建立出站隧道',
      '绑定自有域名并自动配置 HTTPS',
      '可结合 Zero Trust 做访问控制',
    ],
    scenarios: [
      '家用宽带下想对公网提供 Web 服务',
      '临时把本地开发环境分享给他人调试',
    ],
  },

  'subconverter': {
    summary: '把各种代理订阅链接在 Clash、V2Ray、Surge 等格式之间互相转换与合并。',
    features: [
      '支持多种订阅格式互转与规则生成',
      '可按地区或关键字过滤、重命名节点',
      '可作为后端配合订阅面板使用',
    ],
    scenarios: [
      '客户端只认某种格式而订阅是另一种',
      '把多个订阅合并成一条并做筛选',
    ],
  },

  'localsend': {
    summary: '开源的跨平台局域网文件互传工具，在同一网络下直接发送文件，替代 AirDrop。',
    features: [
      '覆盖 Windows、macOS、Linux 与安卓',
      '同一局域网内无需账号，点对点传输',
      '文字与文件都能发，数据不经服务器',
    ],
    scenarios: [
      '安卓手机往 Mac 或 Windows 传文件',
      '没有网络或不想走网盘时的互传',
    ],
  },

  'stirling-pdf': {
    summary: '可自建的 PDF 工具箱，把合并、拆分、转换与加水印等操作集中在一个网页界面。',
    features: [
      '提供合并、拆分、旋转、压缩等常用操作',
      '支持图片与文档转 PDF 以及 OCR 识别',
      '可用 Docker 本地部署，文件不上传第三方',
    ],
    scenarios: [
      '处理合同资料时不想上传到在线网站',
      '批量做 PDF 合并、加水印等重复工作',
    ],
  },

  'it-tools': {
    summary: '面向开发者的在线小工具合集，把哈希、编码、正则测试等零散需求集中到一处。',
    features: [
      '涵盖编码转换、哈希、UUID、时间戳等工具',
      '支持 Docker 自建，数据在本地处理',
      '按类别检索，界面简洁易用',
    ],
    scenarios: [
      '临时做 Base64、JWT 解析等小操作',
      '内网自建一套开发者常用工具页面',
    ],
  },

  'n8n': {
    summary: '开源的节点式工作流自动化平台，用连线把不同服务的接口串成自动执行的流程。',
    features: [
      '可视化拖拽节点编排自动化流程',
      '内置大量应用集成节点与 HTTP 请求节点',
      '支持自建部署，数据留在自己服务器',
    ],
    scenarios: [
      '把表单、数据库与 IM 通知串成流程',
      '想替代 Zapier 又在意费用与数据',
    ],
  },

  'activepieces': {
    summary: '开源的无代码自动化平台，用现成组件搭建跨应用流程，并支持自建部署。',
    features: [
      '以预置组件拖拽搭建自动化流程',
      '支持自托管与团队协作权限管理',
      '组件用 TypeScript 编写，便于扩展',
    ],
    scenarios: [
      '中小团队低成本搭建内部自动化',
      '需要可自建、可审计的自动化平台',
    ],
  },

  'homarr': {
    summary: '自建服务的导航首页面板，用图标卡片集中管理家里或服务器上的各种服务入口。',
    features: [
      '图标化展示自建服务，支持分组与搜索',
      '可与 Docker 集成显示服务运行状态',
      '提供多种小部件展示系统与媒体信息',
    ],
    scenarios: [
      '家里跑了很多服务，需要一个统一入口',
      '集中查看容器与服务的在线状态',
    ],
  },

  'mfuu-freeproxies': {
    summary: '每日抓取并更新免费代理节点的仓库，把整理后的节点作为订阅提供给客户端导入。',
    features: [
      '每天自动抓取并去重更新节点',
      '按协议或来源分别提供订阅文件',
      '给出可直接粘贴的订阅地址',
    ],
    scenarios: [
      '需要一条随手可用的免费订阅临时上网',
      '手里没有机场，先凑合测试客户端',
    ],
  },

  'aiboboxx-v2rayfree': {
    summary: '持续维护的免费 v2ray 节点订阅仓库，每天更新可用节点供客户端直接导入。',
    features: [
      '定期更新并剔除失效的免费节点',
      '提供 v2ray 与 Clash 格式的订阅地址',
      '以文本形式在仓库公开节点列表',
    ],
    scenarios: [
      '需要一份可长期订阅的免费节点源',
      '临时给手机或电脑配一个可用的代理',
    ],
  },

  'barry-far-v2ray-configs': {
    summary: '聚合多处来源的免费 v2ray 配置仓库，并生成可直接订阅的地址供批量导入。',
    features: [
      '汇总多个公开来源并整理成配置文件',
      '按协议或地区生成多条订阅地址',
      '持续更新并标注节点数量与时间',
    ],
    scenarios: [
      '想要一份聚合了大批节点的订阅',
      '在客户端里批量测试节点延迟',
    ],
  },

  'epodonators-v2ray-configs': {
    summary: '更新频率较高的免费节点订阅仓库，把抓取的 v2ray 配置整理成多条订阅链接。',
    features: [
      '更新频率高，节点变化反映较快',
      '按协议拆分出多个订阅文件',
      '同时提供原始配置与订阅地址',
    ],
    scenarios: [
      '想拿到较新的免费节点临时使用',
      '为代理客户端添加一条备用订阅',
    ],
  },

  'huggingface-spaces': {
    summary: 'Hugging Face 的免费托管空间，支持用 Docker 部署并公开访问。',
    features: [
      '免费提供 CPU 实例运行应用',
      '支持 Docker 部署与一键 Fork 克隆',
      '自带公网域名与 HTTPS 访问',
    ],
    scenarios: [
      '部署 AI 模型演示给他人访问',
      '薅免费实例跑常驻的轻量服务',
    ],
  },

  'replit': {
    summary: '浏览器里的在线 IDE，创建项目即可编写运行多种语言的代码并发布成公网服务。',
    features: [
      '无需本地环境，在浏览器中写代码运行',
      '支持多种编程语言与实时协作编辑',
      '内置部署功能，可发布成公网服务',
    ],
    scenarios: [
      '临时想跑段代码但本机没配环境',
      '快速做一个能对外访问的原型',
    ],
  },
};
