#!/usr/bin/env node
/**
 * FOSS-Atlas data pipeline
 * ------------------------------------------------------------------
 * Cleans the source list (GitHub 精选白P资源清单) into:
 *   - src/data/resources.json  (flat resource catalogue)
 *   - src/data/graph.json      (knowledge graph: nodes + edges)
 *
 * Rules enforced here:
 *   1. Every `url` is an absolute https:// URL.
 *   2. Entries are de-duplicated by normalized URL.
 *   3. Every entry gets a stable, ascii `id`.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../src/data')

/* ------------------------------------------------------------------ *
 * Source data. Format: [id, name, url, description, tags]
 * ------------------------------------------------------------------ */
const CATEGORIES = [
  {
    id: 'ai',
    name: 'AI / LLM 白嫖',
    icon: '🤖',
    subs: [
      {
        id: 'ai-chat',
        name: '免费 AI 对话站点',
        items: [
          ['poe', 'Poe', 'https://poe.com', '多模型聚合对话站点，提供有限免费额度', ['对话', '聚合', '多模型']],
          ['huggingchat', 'HuggingChat', 'https://huggingface.co/chat', 'Hugging Face 开源模型免费聊天', ['对话', '开源模型']],
          ['duckduckgo-ai-chat', 'DuckDuckGo AI Chat', 'https://duck.ai', '匿名 AI 聊天，不记录对话', ['对话', '匿名', '隐私']],
          ['lmsys-chat', 'LMSYS Chatbot Arena', 'https://chat.lmsys.org', '多模型直接对比与竞技场排名', ['对话', '评测', '对比']],
          ['microsoft-copilot', 'Microsoft Copilot', 'https://copilot.microsoft.com', '微软 Copilot，GPT 系列免费版', ['对话', '微软', 'GPT']],
          ['meta-ai', 'Meta AI', 'https://www.meta.ai', 'Meta 出品的对话助手', ['对话', 'Meta']],
          ['google-gemini', 'Google Gemini', 'https://gemini.google.com', 'Google Gemini 免费对话', ['对话', 'Google', '多模态']],
          ['anthropic-claude', 'Anthropic Claude', 'https://claude.ai', 'Claude 官方站点，含免费层', ['对话', 'Anthropic', '长文本']],
          ['baidu-yiyan', '百度文心一言', 'https://yiyan.baidu.com', '百度文心大模型对话，国内免费', ['对话', '国内', '百度']],
          ['aliyun-tongyi', '阿里通义千问', 'https://tongyi.aliyun.com', '阿里通义大模型对话与绘画', ['对话', '国内', '阿里']],
          ['xfyun-xinghuo', '讯飞星火', 'https://xinghuo.xfyun.cn', '科大讯飞星火认知大模型', ['对话', '国内', '讯飞']],
          ['doubao', '豆包', 'https://www.doubao.com', '字节跳动豆包，多模态对话', ['对话', '国内', '字节']],
          ['chatglm', '智谱清言', 'https://chatglm.cn', '智谱 GLM 系列对话助手', ['对话', '国内', 'GLM']],
          ['deepseek-chat', 'DeepSeek', 'https://www.deepseek.com', '深度求索对话与编码助手', ['对话', '国内', '编码']],
          ['tiangong', '天工 AI', 'https://www.tiangong.cn', '昆仑万维天工大模型', ['对话', '国内', '昆仑万维']],
          ['pi', 'Pi', 'https://pi.ai', 'Inflection 出品的个人 AI 助手', ['对话', '助手', '情感']],
        ],
      },
      {
        id: 'ai-coding',
        name: 'AI 编程工具',
        items: [
          ['cursor', 'Cursor', 'https://cursor.com', 'AI 优先的代码编辑器，含免费额度', ['编程', 'IDE', '编辑器']],
          ['cline', 'Cline', 'https://cline.bot', 'VSCode 开源 AI 编程 Agent', ['编程', 'VSCode', '开源', 'Agent']],
          ['continue', 'Continue', 'https://continue.dev', '开源 AI 编程助手，可接任意模型', ['编程', '开源', '插件']],
          ['cody', 'Cody', 'https://sourcegraph.com/cody', 'Sourcegraph 出品的 AI 编程助手', ['编程', '代码检索', 'Sourcegraph']],
          ['tabby', 'Tabby', 'https://tabby.tabbyml.com', '可自部署的 AI 代码补全服务', ['编程', '自部署', '补全']],
          ['codeium', 'Codeium', 'https://codeium.com', '免费 AI 代码补全（现 Windsurf）', ['编程', '补全', '免费']],
          ['aider', 'Aider', 'https://github.com/Aider-AI/aider', '命令行 AI 结对编程工具（仓库已迁移至 Aider-AI/aider）', ['编程', 'CLI', '开源', '结对编程']],
        ],
      },
      {
        id: 'ai-local',
        name: '本地跑大模型',
        items: [
          ['ollama', 'Ollama', 'https://ollama.com', '一键在本地运行 Llama / Qwen / DeepSeek 等模型', ['本地推理', 'LLM', 'CLI']],
          ['lm-studio', 'LM Studio', 'https://lmstudio.ai', '图形化本地模型运行与下载', ['本地推理', 'GUI', '桌面端']],
          ['text-generation-webui', 'Text Generation WebUI', 'https://github.com/oobabooga/textgen', '功能齐全的本地模型 WebUI', ['本地推理', 'WebUI', '开源']],
          ['jan', 'Jan', 'https://jan.ai', '开源本地模型桌面客户端', ['本地推理', '桌面端', '开源']],
          ['gpt4all', 'GPT4All', 'https://gpt4all.io', '可离线运行的本地 LLM 套件', ['本地推理', '离线', '开源']],
        ],
      },
      {
        id: 'ai-framework',
        name: 'LLM 开发框架',
        items: [
          ['langchain', 'LangChain', 'https://github.com/langchain-ai/langchain', '构建 LLM 应用的主流框架', ['框架', '开源', 'Agent']],
          ['llamaindex', 'LlamaIndex', 'https://github.com/run-llama/llama_index', '面向 RAG 的数据框架', ['框架', 'RAG', '开源']],
          ['langfuse', 'Langfuse', 'https://github.com/langfuse/langfuse', 'LLM 可观测性与追踪平台', ['可观测性', '追踪', '开源']],
          ['litellm', 'LiteLLM', 'https://github.com/BerriAI/litellm', '统一 100+ 模型 API 的代理层', ['代理', 'API', '开源']],
          ['promptfoo', 'promptfoo', 'https://github.com/promptfoo/promptfoo', '提示词与模型输出测试工具', ['测试', '提示词', '开源']],
          ['dify', 'Dify', 'https://github.com/langgenius/dify', '开源 LLM 应用开发平台', ['平台', '低代码', '开源']],
          ['flowise', 'Flowise', 'https://github.com/FlowiseAI/Flowise', '可视化拖拽编排 LLM 工作流', ['工作流', '可视化', '开源']],
          ['fastgpt', 'FastGPT', 'https://github.com/labring/FastGPT', '知识库 + RAG 问答平台', ['RAG', '知识库', '开源']],
        ],
      },
      {
        id: 'ai-prompt',
        name: 'AI 提示词资源',
        items: [
          ['awesome-chatgpt-prompts', 'awesome-chatgpt-prompts (prompts.chat)', 'https://github.com/f/prompts.chat', '最全的 ChatGPT 提示词合集', ['提示词', '合集', '开源']],
          ['openai-prompt-guide', 'Prompt 工程指南（OpenAI）', 'https://platform.openai.com/docs/guides/prompt-engineering', 'OpenAI 官方提示词工程最佳实践', ['提示词', '官方文档', 'OpenAI']],
          ['deeplearning-ai-prompts', 'DeepLearning.AI 提示词课', 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', '吴恩达团队的提示词工程短课', ['提示词', '课程', '免费']],
        ],
      },
    ],
  },
  {
    id: 'saas',
    name: '免费 SaaS 开发资源',
    icon: '☁️',
    subs: [
      {
        id: 'saas-cloud',
        name: '云厂商永久免费层',
        items: [
          ['google-cloud', 'Google Cloud', 'https://cloud.google.com/free', '1 台 e2-micro VM（美区）、5GB 存储、1GB 出网/月', ['云厂商', '免费层', 'Google']],
          ['aws', 'AWS', 'https://aws.amazon.com/free', '750 小时 t2.micro/月（12 个月）+ Lambda 100 万次/月永久免费', ['云厂商', '免费层', 'AWS']],
          ['azure', 'Microsoft Azure', 'https://azure.microsoft.com/free', '55+ 永久免费服务，含 App Service F1', ['云厂商', '免费层', 'Azure']],
          ['oracle-cloud', 'Oracle Cloud', 'https://www.oracle.com/cloud/free/', '2 台 AMD VM + 4 台 ARM VM 永久免费，性价比最高', ['云厂商', '免费层', 'Oracle', 'ARM']],
          ['cloudflare', 'Cloudflare', 'https://www.cloudflare.com/plans/free/', 'Workers 10 万次/天、Pages、R2 10GB、免费 DNS', ['云厂商', '免费层', 'CDN', '边缘计算']],
        ],
      },
      {
        id: 'saas-paas',
        name: '免费 PaaS / IaaS',
        items: [
          ['render', 'Render', 'https://render.com', '750 小时免费实例/月', ['PaaS', '部署', '免费层']],
          ['railway', 'Railway', 'https://railway.com', '每月 5 美元试用额度（需绑卡）', ['PaaS', '部署', '免费层']],
          ['fly-io', 'Fly.io', 'https://fly.io', '3 台 shared-cpu-1x VM 永久免费', ['PaaS', '部署', '免费层']],
          ['koyeb', 'Koyeb', 'https://www.koyeb.com', '1 个 nano 实例免费', ['PaaS', '部署', '免费层']],
          ['supabase', 'Supabase', 'https://supabase.com', '500MB 数据库 + 5 万 MAU', ['BaaS', '数据库', 'Postgres']],
          ['neon', 'Neon Postgres', 'https://neon.tech', '0.5GB Serverless Postgres 免费', ['数据库', 'Postgres', 'Serverless']],
          ['vercel', 'Vercel', 'https://vercel.com', 'Hobby 计划永久免费，含 100GB 带宽', ['PaaS', '前端托管', '免费层']],
          ['netlify', 'Netlify', 'https://www.netlify.com', '100GB 带宽/月 + 300 分钟构建', ['PaaS', '前端托管', '免费层']],
        ],
      },
      {
        id: 'saas-domain',
        name: '免费域名',
        items: [
          ['is-a-dev', 'is-a.dev', 'https://www.is-a.dev', '免费 .is-a.dev 子域名，面向开发者', ['域名', '子域名', '免费']],
          ['js-org', 'js.org', 'https://js.org', '免费 .js.org 子域名，面向 JS 项目', ['域名', '子域名', '免费']],
          ['eu-org', 'eu.org', 'https://nic.eu.org', '永久免费的 .eu.org 域名', ['域名', '免费']],
          ['pp-ua', 'pp.ua', 'https://nic.ua/en/domains/.pp.ua', '免费 .pp.ua 子域名（需 nic.ua 账号）', ['域名', '子域名', '免费']],
        ],
      },
      {
        id: 'saas-dns',
        name: '免费 DNS / CDN',
        items: [
          ['cloudflare-dns', 'Cloudflare DNS', 'https://www.cloudflare.com/dns/', '免费 DNS 解析 + CDN 加速', ['DNS', 'CDN', '免费']],
          ['hurricane-electric', 'Hurricane Electric', 'https://dns.he.net', '老牌免费 DNS 托管（HE.net）', ['DNS', '免费']],
          ['nextdns', 'NextDNS', 'https://nextdns.io', '30 万次查询/月免费，带过滤与隐私保护', ['DNS', '隐私', '过滤']],
          ['bunnydns', 'Bunny DNS', 'https://bunny.net/dns/', '第一个域名免费，全球 Anycast 解析', ['DNS', 'CDN', '免费']],
        ],
      },
      {
        id: 'saas-ssl',
        name: '免费 SSL 证书',
        items: [
          ['lets-encrypt', "Let's Encrypt", 'https://letsencrypt.org', '无限免费证书，90 天有效期，自动续期', ['SSL', '证书', '免费']],
          ['zerossl', 'ZeroSSL', 'https://zerossl.com', '3 个 90 天免费证书', ['SSL', '证书', '免费']],
          ['cloudflare-origin-ca', 'Cloudflare Origin CA', 'https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/', '15 年有效期的免费源站证书', ['SSL', '证书', 'Cloudflare']],
          ['buypass-go', 'Buypass Go SSL', 'https://www.buypass.com/ssl/products/acme', '180 天免费 ACME 证书', ['SSL', '证书', 'ACME']],
        ],
      },
      {
        id: 'saas-monitor',
        name: '免费监控 / 日志',
        items: [
          ['uptimerobot', 'UptimeRobot', 'https://uptimerobot.com', '50 个监控免费，站点可用性告警', ['监控', '告警', '免费']],
          ['better-stack', 'Better Stack', 'https://betterstack.com', '1 个监控免费 + 日志/事件管理', ['监控', '日志', '免费']],
          ['logtail', 'Logtail', 'https://betterstack.com/logs', '1GB 日志/月免费（已并入 Better Stack）', ['日志', '可观测性', '免费']],
          ['sentry', 'Sentry', 'https://sentry.io', '5000 错误事件/月免费，异常追踪', ['错误追踪', '可观测性', '免费']],
        ],
      },
    ],
  },
  {
    id: 'selfhost',
    name: '自部署开源神器',
    icon: '🏠',
    subs: [
      {
        id: 'selfhost-core',
        name: '佬友首选自部署',
        items: [
          ['nextcloud', 'Nextcloud', 'https://nextcloud.com', '自建网盘与协作套件，替代 Google Drive', ['网盘', '协作', '开源']],
          ['seafile', 'Seafile', 'https://www.seafile.com', '高性能自建网盘，替代 Google Drive', ['网盘', '同步', '开源']],
          ['joplin', 'Joplin', 'https://joplinapp.org', '端到端加密笔记，替代 Notion / Evernote', ['笔记', '加密', '开源']],
          ['trilium', 'Trilium', 'https://github.com/TriliumNext/Trilium', '层级化知识库笔记，替代 Notion', ['笔记', '知识库', '开源']],
          ['memos', 'Memos', 'https://github.com/usememos/memos', '轻量碎片化笔记，替代 flomo', ['笔记', '碎片记录', '开源']],
          ['freshrss', 'FreshRSS', 'https://freshrss.org', '自建 RSS 阅读器，替代 Feedly', ['RSS', '阅读器', '开源']],
          ['miniflux', 'Miniflux', 'https://miniflux.app', '极简自建 RSS 阅读器，替代 Feedly', ['RSS', '阅读器', '开源']],
          ['vaultwarden', 'Vaultwarden', 'https://github.com/dani-garcia/vaultwarden', '轻量 Bitwarden 服务端实现，密码管理首选', ['密码管理', 'Bitwarden', '开源']],
          ['jellyfin', 'Jellyfin', 'https://jellyfin.org', '自建媒体服务器，替代 Plex', ['影音', '媒体库', '开源']],
          ['immich', 'Immich', 'https://github.com/immich-app/immich', '自建相册，替代 Google Photos', ['相册', '备份', '开源']],
          ['matrix-synapse', 'Matrix / Synapse', 'https://matrix.org', '去中心化即时通讯协议与服务端，替代 Discord', ['IM', '去中心化', '开源']],
          ['uptime-kuma', 'Uptime Kuma', 'https://github.com/louislam/uptime-kuma', '自建监控告警，替代 UptimeRobot', ['监控', '告警', '开源']],
          ['shlink', 'Shlink', 'https://shlink.io', '自建短链接服务', ['短链', '开源']],
          ['qbittorrent', 'qBittorrent', 'https://www.qbittorrent.org', '开源 BT 下载客户端', ['下载', 'BT', '开源']],
          ['aria2', 'Aria2', 'https://aria2.github.io', '轻量多协议命令行下载器', ['下载', 'CLI', '开源']],
          ['rustdesk', 'RustDesk', 'https://github.com/rustdesk/rustdesk', '开源远程桌面，替代 TeamViewer', ['远程桌面', '开源']],
          ['gitea', 'Gitea', 'https://about.gitea.com', '轻量自建 Git 服务，替代 GitHub', ['Git', '代码托管', '开源']],
          ['forgejo', 'Forgejo', 'https://forgejo.org', '社区驱动的 Gitea 分支，替代 GitHub', ['Git', '代码托管', '开源']],
          ['woodpecker', 'Woodpecker CI', 'https://woodpecker-ci.org', '轻量 CI/CD，替代 GitLab CI', ['CI/CD', '开源']],
          ['drone', 'Drone CI', 'https://www.drone.io', '容器原生 CI/CD，替代 GitLab CI', ['CI/CD', '开源']],
          ['nginx-proxy-manager', 'Nginx Proxy Manager', 'https://github.com/NginxProxyManager/nginx-proxy-manager', '可视化反向代理与证书管理', ['反向代理', 'Nginx', '开源']],
          ['1panel', '1Panel', 'https://github.com/1Panel-dev/1Panel', '现代化 Linux 服务器运维面板', ['面板', '运维', '开源']],
          ['casaos', 'CasaOS', 'https://casaos.io', '面向家庭服务器的轻量面板', ['面板', 'NAS', '开源']],
          ['ddns-go', 'ddns-go', 'https://github.com/jeessy2/ddns-go', '自动更新动态域名解析', ['DDNS', '网络', '开源']],
          ['navidrome', 'Navidrome', 'https://www.navidrome.org', '自建音乐流媒体服务', ['音乐', '流媒体', '开源']],
          ['outline', 'Outline', 'https://www.getoutline.com', '团队知识库与文档协作', ['文档', '知识库', '开源']],
          ['mattermost', 'Mattermost', 'https://mattermost.com', '团队聊天协作，替代 Slack', ['IM', '团队协作', '开源']],
          ['kanboard', 'Kanboard', 'https://kanboard.org', '极简看板式任务管理', ['看板', '任务管理', '开源']],
          ['focalboard', 'Focalboard', 'https://github.com/mattermost-community/focalboard', '开源看板与项目管理', ['看板', '任务管理', '开源']],
          ['passbolt', 'Passbolt', 'https://www.passbolt.com', '团队密码管理，替代 1Password', ['密码管理', '团队', '开源']],
          ['radicale', 'Radicale', 'https://radicale.org', '轻量 CalDAV / CardDAV 服务端', ['通讯录', '日历', '开源']],
          ['ohmyform', 'OhMyForm', 'https://ohmyform.com', '开源表单收集，替代 Google Forms', ['表单', '开源']],
          ['linkding', 'Linkding', 'https://github.com/sissbruecker/linkding', '轻量自建书签管理', ['书签', '开源']],
          ['searxng', 'SearXNG', 'https://github.com/searxng/searxng', '自建元搜索引擎，聚合多引擎结果', ['搜索', '隐私', '开源']],
          ['filebrowser', 'Filebrowser', 'https://github.com/filebrowser/filebrowser', '轻量网页文件管理器', ['文件管理', '开源']],
          ['wetty', 'Wetty', 'https://github.com/butlerx/wetty', '浏览器里的终端（基于 xterm.js）', ['终端', 'WebSSH', '开源']],
          ['ttyd', 'ttyd', 'https://github.com/tsl0922/ttyd', '把命令行共享到浏览器', ['终端', 'WebSSH', '开源']],
          ['excalidraw', 'Excalidraw', 'https://excalidraw.com', '手绘风格白板与流程图', ['白板', '绘图', '开源']],
        ],
      },
      {
        id: 'selfhost-proxy',
        name: '网络代理自部署',
        items: [
          ['xray-reality', 'Xray + Reality', 'https://github.com/XTLS/Xray-core', '当前主流方案，Reality 伪装 SNI', ['代理', 'Xray', 'Reality']],
          ['sing-box', 'sing-box', 'https://github.com/SagerNet/sing-box', '一体化通用代理内核，多协议支持', ['代理', '内核', '开源']],
          ['mihomo', 'mihomo / Clash Meta', 'https://github.com/MetaCubeX/mihomo', 'Clash Meta 内核，客户端与服务端通用', ['代理', 'Clash', '开源']],
          ['hysteria2', 'Hysteria2', 'https://github.com/HyNetworks/hysteria', '基于 QUIC 的高速代理协议', ['代理', 'QUIC', '开源']],
          ['trojan-go', 'Trojan-Go', 'https://github.com/p4gefau1t/trojan-go', 'TLS 伪装的 Trojan 实现', ['代理', 'TLS', '开源']],
          ['snell', 'Snell', 'https://manual.nssurge.com/policies/snell.html', 'Surge 自研的加密代理协议', ['代理', 'Surge']],
          ['tuic', 'TUIC', 'https://github.com/tuic-protocol/tuic', '基于 QUIC 的轻量代理协议', ['代理', 'QUIC', '开源']],
        ],
      },
      {
        id: 'selfhost-honeypot',
        name: '蜜罐 / 安全演练',
        items: [
          ['tpot', 'T-Pot', 'https://github.com/telekom-security/tpotce', '多蜜罐一体化平台（Deutsche Telekom）', ['蜜罐', '安全', '开源']],
          ['cowrie', 'Cowrie', 'https://github.com/cowrie/cowrie', 'SSH / Telnet 交互式蜜罐', ['蜜罐', 'SSH', '开源']],
          ['dionaea', 'Dionaea', 'https://github.com/DinoTools/dionaea', '捕获恶意软件的低交互蜜罐', ['蜜罐', '恶意软件', '开源']],
          ['hfish', 'HFish', 'https://github.com/hacklcx/HFish', '国产跨平台蜜罐平台', ['蜜罐', '安全', '开源']],
        ],
      },
    ],
  },
  {
    id: 'api',
    name: '公开 API 大全',
    icon: '🔌',
    subs: [
      {
        id: 'api-free',
        name: '免费 API 服务',
        items: [
          ['openai-api', 'OpenAI API', 'https://platform.openai.com', 'GPT 系列官方 API', ['API', 'LLM', 'OpenAI']],
          ['anthropic-api', 'Anthropic API', 'https://docs.anthropic.com', 'Claude 系列官方 API', ['API', 'LLM', 'Anthropic']],
          ['google-ai-api', 'Google AI (Gemini) API', 'https://ai.google.dev', 'Gemini 官方开发者 API', ['API', 'LLM', 'Google']],
          ['hf-inference-api', 'Hugging Face Inference API', 'https://huggingface.co/docs/api-inference', '开源模型推理 API', ['API', '推理', '开源模型']],
          ['replicate', 'Replicate', 'https://replicate.com', '托管开源模型，部分模型免费试用', ['API', '模型托管']],
          ['openweathermap', 'OpenWeatherMap', 'https://openweathermap.org/api', '天气数据 API，1000 次/天免费', ['API', '天气', '免费']],
          ['ipinfo', 'IPinfo', 'https://ipinfo.io', 'IP 归属地查询，5 万次/月免费', ['API', 'IP', '地理']],
          ['mymemory', 'MyMemory', 'https://mymemory.translated.net', '翻译 API，5000 字/天免费', ['API', '翻译', '免费']],
          ['unsplash', 'Unsplash', 'https://unsplash.com/developers', '免费高清图片 API', ['API', '图片', '免费']],
          ['pexels', 'Pexels', 'https://www.pexels.com/api/', '免费图片与视频 API', ['API', '图片', '视频']],
          ['qrserver', 'QRServer', 'https://goqr.me/api/', '二维码生成 API，无限免费', ['API', '二维码', '免费']],
          ['disify', 'Disify', 'https://www.disify.com', '临时邮箱与邮箱校验 API', ['API', '邮箱', '临时']],
          ['textbelt', 'Textbelt', 'https://textbelt.com', '短信发送 API，1 条/天免费', ['API', '短信', '免费']],
          ['proxyscrape', 'ProxyScrape', 'https://proxyscrape.com', '免费代理列表 API', ['API', '代理', '免费']],
          ['is-gd', 'is.gd', 'https://is.gd', '免费短链接服务', ['短链', '免费']],
          ['tinyurl', 'TinyURL', 'https://tinyurl.com', '免费短链接服务', ['短链', '免费']],
          ['hcaptcha', 'hCaptcha', 'https://www.hcaptcha.com', '非商业免费的人机验证服务', ['验证码', '安全', '免费']],
          ['nominatim', 'OpenStreetMap Nominatim', 'https://nominatim.org', '免费地理编码与逆地理编码', ['API', '地图', '地理编码']],
        ],
      },
    ],
  },
  {
    id: 'security',
    name: '黑客 / 安全工具书',
    icon: '🛡️',
    subs: [
      {
        id: 'security-pentest',
        name: '渗透测试工具集',
        items: [
          ['awesome-hacking', 'Awesome Hacking', 'https://github.com/Hack-with-Github/Awesome-Hacking', '黑客与安全资源大全', ['安全', '合集', '开源']],
          ['payloadsallthethings', 'PayloadsAllTheThings', 'https://github.com/swisskyrepo/PayloadsAllTheThings', '各类漏洞利用 Payload 合集', ['安全', 'Payload', '开源']],
          ['hacktricks', 'HackTricks', 'https://github.com/HackTricks-wiki/hacktricks', '渗透测试技巧百科全书', ['安全', '渗透测试', '开源']],
          ['seclists', 'SecLists', 'https://github.com/danielmiessler/SecLists', '安全测试字典合集', ['安全', '字典', '开源']],
          ['nuclei-templates', 'nuclei-templates', 'https://github.com/projectdiscovery/nuclei-templates', 'Nuclei 漏洞检测模板库', ['安全', '漏洞扫描', '开源']],
          ['gtfobins', 'GTFOBins', 'https://gtfobins.github.io', 'Unix 提权二进制利用手册', ['安全', '提权', '手册']],
          ['lolbas', 'LOLBAS', 'https://lolbas-project.github.io', 'Windows 原生二进制滥用手册', ['安全', 'Windows', '手册']],
        ],
      },
    ],
  },
  {
    id: 'ebook',
    name: '免费电子书',
    icon: '📚',
    subs: [
      {
        id: 'ebook-free',
        name: '免费编程书',
        items: [
          ['free-programming-books', 'free-programming-books', 'https://github.com/EbookFoundation/free-programming-books', 'Free Ebook Foundation 维护的免费编程书清单', ['电子书', '编程', '合集']],
        ],
      },
    ],
  },
  {
    id: 'proxy',
    name: '免费节点 / 代理订阅',
    icon: '🌐',
    subs: [
      {
        id: 'proxy-sub',
        name: '活跃订阅仓库',
        items: [
          ['mfuu-freeproxies', 'mfuu/FreeProxies', 'https://github.com/mfuu/FreeProxies', '每日更新的免费节点订阅仓库', ['订阅', '节点', '开源']],
          ['aiboboxx-v2rayfree', 'aiboboxx/v2rayfree', 'https://github.com/free-nodes/v2rayfree', '免费 v2ray 节点订阅', ['订阅', 'v2ray', '开源']],
          ['barry-far-v2ray-configs', 'barry-far/V2ray-Configs', 'https://github.com/barry-far/V2ray-Config', '聚合式免费节点配置', ['订阅', 'v2ray', '开源']],
          ['epodonators-v2ray-configs', 'Epodonators/v2ray-configs', 'https://github.com/Epodonios/v2ray-configs', '高频更新的免费节点订阅', ['订阅', 'v2ray', '开源']],
        ],
      },
    ],
  },
  {
    id: 'vps',
    name: '免费 VPS / 服务器',
    icon: '🖥️',
    subs: [
      {
        id: 'vps-free',
        name: '免费服务器资源',
        items: [
          ['huggingface-spaces', 'HuggingFace Spaces', 'https://huggingface.co/spaces', '免费 CPU 实例，支持 Docker 部署', ['VPS', '容器', 'AI 托管']],
          ['replit', 'Replit', 'https://replit.com', '免费 5 个 Repl 项目，在线 IDE', ['VPS', '在线 IDE', '免费']],
        ],
      },
    ],
  },
  {
    id: 'cn-ai',
    name: '国内免费 AI 工具',
    icon: '🇨🇳',
    subs: [
      {
        id: 'cn-ai-dev',
        name: '国内 AI 开发者 API',
        items: [
          ['kimi', 'Kimi', 'https://www.kimi.com', '月之暗面 Kimi，长文本对话助手', ['对话', '国内', '长文本']],
          ['tencent-hunyuan', '腾讯混元', 'https://hunyuan.tencent.com', '腾讯混元大模型对话与 API', ['对话', '国内', '腾讯']],
          ['bigmodel-glm', '智谱 GLM-4 API', 'https://open.bigmodel.cn', '智谱开放平台开发者 API', ['API', '国内', 'GLM']],
          ['deepseek-api', 'DeepSeek API', 'https://platform.deepseek.com', 'DeepSeek 开放平台 API', ['API', '国内', 'DeepSeek']],
          ['siliconflow', '硅基流动', 'https://siliconflow.cn', '模型聚合 API 平台，含免费额度', ['API', '聚合', '国内']],
          ['lingyiwanwu', '零一万物', 'https://platform.lingyiwanwu.com', 'Yi 系列模型开放平台', ['API', '国内', 'Yi']],
          ['minimax', 'MiniMax', 'https://www.minimax.io', 'MiniMax 海螺 AI 与开放平台', ['API', '国内', '多模态']],
        ],
      },
    ],
  },
  {
    id: 'gear',
    name: '佬友神器',
    icon: '⭐',
    subs: [
      {
        id: 'gear-tools',
        name: '高频实用工具',
        items: [
          ['cloudflare-imgbed', 'CloudFlare-ImgBed', 'https://github.com/MarSeventh/CloudFlare-ImgBed', '基于 Cloudflare 的免费图床', ['图床', 'Cloudflare', '开源']],
          ['cloudflare-tunnel', 'Cloudflare Tunnel', 'https://developers.cloudflare.com/cloudflare-one/', '无需公网 IP 的内网穿透隧道', ['内网穿透', 'Cloudflare', '免费']],
          ['subconverter', 'subconverter', 'https://github.com/tindy2013/subconverter', '订阅格式转换工具', ['订阅', '转换', '开源']],
          ['localsend', 'LocalSend', 'https://github.com/localsend/localsend', '跨平台局域网文件互传，替代 AirDrop', ['文件传输', '局域网', '开源']],
          ['stirling-pdf', 'Stirling-PDF', 'https://github.com/Stirling-Tools/Stirling-PDF', '自建 PDF 工具箱', ['PDF', '工具集', '开源']],
          ['it-tools', 'IT-Tools', 'https://github.com/CorentinTh/it-tools', '开发者在线工具箱合集', ['工具集', '开发', '开源']],
          ['n8n', 'n8n', 'https://github.com/n8n-io/n8n', '开源工作流自动化，替代 Zapier', ['自动化', '工作流', '开源']],
          ['activepieces', 'Activepieces', 'https://github.com/activepieces/activepieces', '开源自动化平台，替代 Zapier', ['自动化', '工作流', '开源']],
          ['homarr', 'Homarr', 'https://github.com/ajnart/homarr', '自建服务导航首页面板', ['导航', '面板', '开源']],
        ],
      },
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Wiki pages shipped in /public/wiki
 * ------------------------------------------------------------------ */
const WIKI = {
  ollama: 'ollama',
  'cloudflare': 'cloudflare-workers',
  vaultwarden: 'vaultwarden',
  immich: 'immich',
  nextcloud: 'nextcloud',
}

/* ------------------------------------------------------------------ *
 * Curated relationships
 * ------------------------------------------------------------------ */
// tool -> thing it replaces (external target becomes a graph node)
const ALTERNATIVES = [
  ['nextcloud', 'Google Drive'],
  ['seafile', 'Google Drive'],
  ['filebrowser', 'Google Drive'],
  ['joplin', 'Notion'],
  ['trilium', 'Notion'],
  ['memos', 'flomo'],
  ['freshrss', 'Feedly'],
  ['miniflux', 'Feedly'],
  ['vaultwarden', 'Bitwarden'],
  ['passbolt', '1Password'],
  ['jellyfin', 'Plex'],
  ['navidrome', 'Spotify'],
  ['immich', 'Google Photos'],
  ['matrix-synapse', 'Discord'],
  ['mattermost', 'Slack'],
  ['uptime-kuma', 'UptimeRobot'],
  ['rustdesk', 'TeamViewer'],
  ['gitea', 'GitHub'],
  ['forgejo', 'GitHub'],
  ['woodpecker', 'GitLab CI'],
  ['drone', 'GitLab CI'],
  ['ohmyform', 'Google Forms'],
  ['searxng', 'Google Search'],
  ['outline', 'Confluence'],
  ['kanboard', 'Trello'],
  ['focalboard', 'Trello'],
  ['linkding', 'Pocket'],
  ['localsend', 'AirDrop'],
  ['excalidraw', 'Miro'],
  ['n8n', 'Zapier'],
  ['activepieces', 'Zapier'],
  ['stirling-pdf', 'Adobe Acrobat'],
  ['homarr', 'Heimdall'],
  ['dify', 'LangFlow'],
]

// curated "related" pairs (undirected, stored once)
const RELATED = [
  ['ollama', 'lm-studio'], ['ollama', 'jan'], ['ollama', 'gpt4all'], ['ollama', 'text-generation-webui'],
  ['lm-studio', 'jan'], ['gpt4all', 'jan'],
  ['cline', 'continue'], ['cline', 'cursor'], ['cline', 'aider'], ['cline', 'cody'],
  ['cursor', 'aider'], ['continue', 'cody'],
  ['langchain', 'llamaindex'], ['dify', 'flowise'], ['dify', 'fastgpt'], ['flowise', 'fastgpt'],
  ['langfuse', 'litellm'], ['promptfoo', 'langfuse'],
  ['nextcloud', 'seafile'], ['nextcloud', 'immich'], ['joplin', 'trilium'], ['joplin', 'memos'], ['trilium', 'memos'],
  ['freshrss', 'miniflux'], ['vaultwarden', 'passbolt'],
  ['jellyfin', 'navidrome'], ['gitea', 'forgejo'], ['woodpecker', 'drone'],
  ['nginx-proxy-manager', 'cloudflare-tunnel'], ['1panel', 'casaos'],
  ['xray-reality', 'sing-box'], ['xray-reality', 'hysteria2'], ['xray-reality', 'mihomo'],
  ['sing-box', 'mihomo'], ['hysteria2', 'tuic'], ['trojan-go', 'snell'],
  ['excalidraw', 'it-tools'], ['n8n', 'activepieces'], ['it-tools', 'stirling-pdf'],
  ['uptime-kuma', 'uptimerobot'], ['cloudflare', 'cloudflare-tunnel'], ['cloudflare', 'cloudflare-dns'],
  ['lets-encrypt', 'zerossl'], ['cloudflare-dns', 'nextdns'], ['supabase', 'neon'],
  ['vercel', 'netlify'], ['render', 'koyeb'], ['fly-io', 'render'], ['railway', 'fly-io'],
  ['searxng', 'linkding'], ['tpot', 'cowrie'], ['cowrie', 'dionaea'], ['hacktricks', 'payloadsallthethings'],
  ['gitea', 'woodpecker'], ['forgejo', 'woodpecker'], ['immich', 'filebrowser'],
]

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */
const resources = []
const seenUrls = new Map()
const categories = []
const subCategories = []
const duplicateLog = []

const normalizeUrl = (u) => {
  if (!/^https?:\/\//i.test(u)) throw new Error(`Non-absolute URL: ${u}`)
  if (!u.startsWith('https://')) throw new Error(`Non-https URL: ${u}`)
  const parsed = new URL(u)
  const host = parsed.hostname.replace(/^www\./, '')
  const path = parsed.pathname.replace(/\/+$/, '')
  return `${host}${path}${parsed.search}`.toLowerCase()
}

for (const cat of CATEGORIES) {
  categories.push({ id: cat.id, name: cat.name, icon: cat.icon })
  for (const sub of cat.subs) {
    subCategories.push({ id: sub.id, name: sub.name, category: cat.id })
    for (const [id, name, url, description, tags] of sub.items) {
      const key = normalizeUrl(url)
      if (seenUrls.has(key)) {
        duplicateLog.push({ skipped: id, kept: seenUrls.get(key), url })
        continue
      }
      seenUrls.set(key, id)
      resources.push({
        id,
        name,
        url,
        category: cat.id,
        category_name: cat.name,
        sub_category: sub.id,
        sub_category_name: sub.name,
        description,
        tags,
        ...(WIKI[id] ? { wiki: WIKI[id] } : {}),
      })
    }
  }
}

const byId = new Map(resources.map((r) => [r.id, r]))

/* --- graph --- */
const nodes = []
const edges = []
const nodeIds = new Set()

const addNode = (node) => {
  if (nodeIds.has(node.id)) return
  nodeIds.add(node.id)
  nodes.push(node)
}
const addEdge = (source, target, type) => {
  if (!nodeIds.has(source) || !nodeIds.has(target)) return
  edges.push({ source, target, type })
}

for (const cat of categories) {
  addNode({ id: `cat:${cat.id}`, name: cat.name, type: 'category', icon: cat.icon })
}
for (const sub of subCategories) {
  addNode({ id: `sub:${sub.id}`, name: sub.name, type: 'subcategory', category: sub.category })
  addEdge(`sub:${sub.id}`, `cat:${sub.category}`, 'in_category')
}
for (const r of resources) {
  addNode({
    id: r.id,
    name: r.name,
    type: 'tool',
    category: r.category,
    url: r.url,
    ...(r.wiki ? { wiki: r.wiki } : {}),
  })
  addEdge(r.id, `sub:${r.sub_category}`, 'belongs_to')
}

const tagCount = new Map()
for (const r of resources) {
  for (const t of r.tags) tagCount.set(t, (tagCount.get(t) || 0) + 1)
}
const TAGS = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([t]) => t)
for (const t of TAGS) addNode({ id: `tag:${t}`, name: t, type: 'tag' })
for (const r of resources) {
  for (const t of r.tags) {
    if (TAGS.includes(t)) addEdge(r.id, `tag:${t}`, 'tagged')
  }
}

for (const [from, to] of ALTERNATIVES) {
  if (!byId.has(from)) continue
  const targetId = byId.has(to) ? to : `ext:${to}`
  if (!byId.has(to)) addNode({ id: targetId, name: to, type: 'external' })
  addEdge(from, targetId, 'alternative_to')
}

for (const [a, b] of RELATED) {
  if (!byId.has(a) || !byId.has(b)) continue
  addEdge(a, b, 'related')
}

const graph = {
  generated_at: new Date().toISOString(),
  stats: {
    tools: resources.length,
    categories: categories.length,
    sub_categories: subCategories.length,
    tags: TAGS.length,
    externals: nodes.filter((n) => n.type === 'external').length,
    edges: edges.length,
  },
  categories,
  sub_categories: subCategories,
  nodes,
  edges,
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(resolve(OUT_DIR, 'resources.json'), JSON.stringify(resources, null, 2) + '\n')
writeFileSync(resolve(OUT_DIR, 'graph.json'), JSON.stringify(graph, null, 2) + '\n')

console.log(`resources: ${resources.length}`)
console.log(`categories: ${categories.length}, sub_categories: ${subCategories.length}`)
console.log(`graph nodes: ${nodes.length}, edges: ${edges.length}`)
if (duplicateLog.length) {
  console.log(`\ndeduplicated ${duplicateLog.length} duplicate URL(s):`)
  for (const d of duplicateLog) console.log(`  - ${d.skipped} (kept ${d.kept}) ${d.url}`)
}
