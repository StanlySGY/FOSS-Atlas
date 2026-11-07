// Base Wiki prose for FOSS-Atlas group g1 (AI / LLM 白嫖).
// One entry per tool id; consumed by the wiki build script which adds name/url/tags.
export default {
  'poe': {
    summary: 'Quora 推出的多模型聚合站点，可在 GPT、Claude、Gemini 之间切换对话。',
    features: ['在同一个界面切换多家厂商的对话模型', '支持创建 Bot，把提示词固化成可复用角色', '每天提供有限免费额度，超出后可订阅'],
    scenarios: ['横向比较不同模型对同一问题的回答质量', '日常问答与写作润色等低频使用需求'],
  },
  'huggingchat': {
    summary: 'Hugging Face 推出的免费聊天站点，可直接体验社区里的各种开源大模型。',
    features: ['无需自建环境即可与多种开源模型对话', '模型由社区从 Hugging Face 模型库中挑选', '可自定义系统提示词调整回答风格'],
    scenarios: ['低成本体验各类开源模型的对话效果', '想避开闭源服务、偏好开源模型的用户'],
  },
  'duckduckgo-ai-chat': {
    summary: 'DuckDuckGo 提供的匿名 AI 聊天，对话不与账号关联，也不用于训练模型。',
    features: ['无需注册登录即可直接使用', '官方称对话不会用于训练模型', '可切换多家厂商的模型作答'],
    scenarios: ['想匿名提问、不愿留下账号痕迹', '作为搜索结果之外的信息补充'],
  },
  'lmsys-chat': {
    summary: 'LMSYS 的 Chatbot Arena，用盲测投票给各家大模型排名的评测平台。',
    features: ['同一提问由两个匿名模型同时作答', '投票后才揭晓两个模型的真实身份', '汇总用户投票形成公开的模型排行榜'],
    scenarios: ['想评测和比较不同大模型的真实水平', '为本人的任务挑选合适的模型作参考'],
  },
  'microsoft-copilot': {
    summary: '微软的 AI 助手，把 GPT 系列模型接进对话、搜索与系统层面。',
    features: ['免费使用 GPT 系列模型的对话能力', '回答中可附上来源链接便于核查', '与 Windows、Edge 和必应等入口打通'],
    scenarios: ['联网查资料同时让 AI 归纳要点', '在系统和浏览器里随手唤起 AI 助手'],
  },
  'meta-ai': {
    summary: 'Meta 推出的对话助手，基于自家的 Llama 系列模型提供问答与生成。',
    features: ['底层使用 Meta 的 Llama 系列大模型', '已集成进 WhatsApp、Instagram 等应用', '支持图文理解等多模态输入'],
    scenarios: ['在常用的社交应用里直接向 AI 提问', '想了解 Llama 系列模型的对话表现'],
  },
  'google-gemini': {
    summary: 'Google 的 Gemini 助手，支持长上下文以及图文、音视频的多模态理解。',
    features: ['原生多模态，可理解图像、音频与视频', '与 Google 搜索及 Workspace 生态联动', '免费层即可用上较新的 Gemini 模型'],
    scenarios: ['处理图片、文档等混合内容的问答', '需要联网检索与多模态分析的日常任务'],
  },
  'anthropic-claude': {
    summary: 'Anthropic 的 Claude 官方站点，以长文本处理和写作改写能力见长。',
    features: ['可上传文档并在长上下文中做分析', '提供免费层供日常对话使用', '回答风格偏严谨，适合写作与改写'],
    scenarios: ['长文档摘要以及合同、论文的阅读', '写作、翻译与代码讲解等文字工作'],
  },
  'baidu-yiyan': {
    summary: '百度的文心一言，基于文心大模型的对话助手，国内网络可直接访问。',
    features: ['基于百度自家的文心系列大模型', '国内可直接访问，无需额外网络工具', '支持联网检索获取较新的信息'],
    scenarios: ['国内用户的中文日常问答与写作', '需要中文语境理解与内容生成的场景'],
  },
  'aliyun-tongyi': {
    summary: '阿里的通义千问，提供对话、文档解析与文生图等能力的国产大模型。',
    features: ['基于阿里通义千问系列大模型', '支持上传文档并在长文本里问答', '内置文生图等多种创作能力'],
    scenarios: ['中文办公场景的写作与资料整理', '需要图文生成的中文创作任务'],
  },
  'xfyun-xinghuo': {
    summary: '科大讯飞的星火认知大模型，主打中文对话并延续讯飞的语音技术优势。',
    features: ['基于科大讯飞的星火认知大模型', '与讯飞的语音识别、合成能力结合', '国内可直接访问，并提供免费额度'],
    scenarios: ['中文语音相关的问答与内容生成', '国内用户的中文对话与写作需求'],
  },
  'doubao': {
    summary: '字节跳动的豆包，可对话写作，并支持图片理解与生成的国产助手。',
    features: ['基于字节自研的豆包大模型', '支持图片理解与 AI 绘图等多模态能力', '提供网页、App 与浏览器插件入口'],
    scenarios: ['国内用户的日常问答与内容创作', '涉及图像理解或生成的多模态任务'],
  },
  'chatglm': {
    summary: '智谱 AI 的清言，基于 GLM 系列模型的对话助手，支持联网与文档问答。',
    features: ['基于智谱 GLM 系列大模型', '支持上传文档进行问答与分析', '提供联网检索与智能体等能力'],
    scenarios: ['中文问答、写作与代码辅助', '上传资料后做要点提炼与追问'],
  },
  'deepseek-chat': {
    summary: '深度求索的 DeepSeek，以推理与编程见长，并长期提供免费对话。',
    features: ['基于 DeepSeek 系列自研大模型', '在推理与代码任务上表现突出', '网页与 App 均可免费使用'],
    scenarios: ['数学、逻辑推理类问题的求解', '编程答疑、调试与重构建议'],
  },
  'tiangong': {
    summary: '昆仑万维的天工 AI，把对话、搜索与多媒体生成集中在同一助手。',
    features: ['基于昆仑万维的天工大模型', '集合对话、AI 搜索与文档问答', '提供音乐、图像等生成式功能'],
    scenarios: ['需要联网检索的资料查询与综述', '中文创作与多媒体内容生成'],
  },
  'pi': {
    summary: 'Inflection 推出的个人 AI 助手 Pi，主打有同理心的日常对话体验。',
    features: ['对话风格温和，擅长陪伴式交流', '强调个性化与情绪上的支持', '网页与 App 均可免费使用'],
    scenarios: ['闲聊、情绪倾诉与生活建议', '进行轻松的日常聊天与对话练习'],
  },
  'cursor': {
    summary: 'AI 优先的代码编辑器，把对话、补全与多文件编辑整合进写码流程。',
    features: ['基于 VSCode 改造，可沿用其扩展生态', '支持用对话对多个文件做批量修改', '内置代码补全与仓库级上下文理解'],
    scenarios: ['让 AI 读懂整个仓库后完成重构', '边写代码边用对话解释与生成片段'],
    keywords: ["AI 代码补全","代码补全","AI 编程助手","AI code completion"],
  },
  'cline': {
    summary: '开源的 VSCode AI 编程 Agent，能读文件、跑命令并直接改动代码。',
    features: ['以 VSCode 插件的形态运行', '可读写文件并执行终端命令完成任务', '能接入多家厂商的模型 API'],
    scenarios: ['把一句话需求交给 Agent 自动落地成改动', '在编辑器内完成多步骤的调试与修复'],
  },
  'continue': {
    summary: '开源的 AI 编程助手，可为编辑器接入任意模型，云端与本地皆可。',
    features: ['支持接入 OpenAI、Claude 及本地模型', '提供对话、补全与代码编辑等能力', '可配置自定义上下文与提示词'],
    scenarios: ['想统一管理多家模型 API 的开发者', '希望用本地模型完成代码补全的团队'],
    keywords: ["AI 代码补全","IDE 代码补全","代码补全","AI 编程助手","本地推理后端","Ollama 后端"],
  },
  'cody': {
    summary: 'Sourcegraph 出品的 AI 编程助手，擅长基于代码检索来回答问题。',
    features: ['依托 Sourcegraph 的代码检索能力', '可跨仓库理解并引用代码上下文', '提供补全、对话与常用命令'],
    scenarios: ['在大型或跨仓库项目中定位代码', '理解陌生代码库并快速上手'],
  },
  'tabby': {
    summary: '可自行部署的 AI 代码补全服务，模型与代码都留在自己的服务器上。',
    features: ['支持以 Docker 等方式私有化部署', '提供 IDE 插件对接自建服务', '代码不离开内网，便于满足合规要求'],
    scenarios: ['企业内网环境下的代码补全需求', '对代码外泄有严格限制的团队'],
  },
  'codeium': {
    summary: '提供免费代码补全的编程助手，相关产品现已归入 Windsurf 品牌。',
    features: ['面向个人开发者提供免费额度', '支持主流编辑器的插件接入', '覆盖补全、对话与代码搜索等功能'],
    scenarios: ['个人开发者零成本获得补全体验', '团队先免费试用再决定是否采购'],
    aliases: ["Windsurf"],
    keywords: ["AI 代码补全","代码助手","代码自动补全","IDE 补全"],
  },
  'aider': {
    summary: '命令行里的 AI 结对编程工具，直接读写本地仓库并自动生成提交。',
    features: ['在终端中与模型结对修改代码', '改动会写入文件并生成 Git 提交', '可按文件或整个仓库提供上下文'],
    scenarios: ['偏好命令行的终端工作流开发者', '让 AI 按需求批量修改既有代码'],
  },
  'lm-studio': {
    summary: '图形化的本地大模型客户端，方便下载、运行并调试开源模型。',
    features: ['图形界面里搜索并下载量化模型', '本地提供兼容 OpenAI 的接口', '可调节上下文与采样等推理参数'],
    scenarios: ['不想碰命令行就想用上本地模型', '在本机对比不同模型的实际表现'],
  },
  'text-generation-webui': {
    summary: 'oobabooga 维护的本地模型 WebUI，功能齐全且可扩展的推理前端。',
    features: ['在浏览器里加载多种格式的本地模型', '内置对话、角色扮演等交互模式', '支持扩展插件与对外接口调用'],
    scenarios: ['喜欢自建、可深度定制的推理界面', '需要同时试验多种模型格式的用户'],
    aliases: ["oobabooga","TextGen WebUI"],
    keywords: ["本地模型 WebUI","本地模型前端","模型推理界面","角色扮演"],
  },
  'jan': {
    summary: '开源的本地 AI 桌面客户端，把模型下载与对话整合进一个应用。',
    features: ['开源且可完全离线使用的桌面端', '内置模型库，下载后本地运行', '支持接入兼容 OpenAI 的远程接口'],
    scenarios: ['希望数据不出本机的日常对话', '在笔记本上离线使用大模型'],
  },
  'gpt4all': {
    summary: 'Nomic 出品的本地 LLM 套件，模型可以完全离线地跑在个人电脑上。',
    features: ['提供桌面客户端与 Python 绑定', '内置可下载的多种量化模型', '支持离线推理与本地文档问答'],
    scenarios: ['断网或隐私要求高的场景使用 LLM', '作为本地模型推理的入门工具'],
    keywords: ["本地模型","本地大模型","离线模型运行","本地 LLM"],
  },
  'langchain': {
    summary: '构建 LLM 应用的主流开源框架，把模型、工具与数据串成完整流程。',
    features: ['统一封装多家模型与向量库的接口', '提供链、Agent 与工具调用等抽象', '生态庞大，集成与文档都很丰富'],
    scenarios: ['搭建 RAG 与多步 Agent 类应用', '把大模型能力接入现有业务系统'],
  },
  'llamaindex': {
    summary: '面向 RAG 的数据框架，擅长把私有文档索引成可检索的知识。',
    features: ['内置文档加载、切分与索引流程', '提供多种检索与重排序策略', '与主流向量库和模型接口对接'],
    scenarios: ['为私有文档搭建问答与检索系统', '把企业知识库接入大模型应用'],
  },
  'langfuse': {
    summary: '开源的 LLM 可观测性平台，用追踪、评估与监控记录应用表现。',
    features: ['记录每次调用的完整链路与提示词', '支持数据集评估与人工标注', '可自行部署，数据留在自己环境'],
    scenarios: ['排查线上 LLM 应用的异常输出', '持续评估提示词改动带来的效果变化'],
  },
  'litellm': {
    summary: '统一多家大模型 API 的代理层，用一套 OpenAI 风格接口调用各家模型。',
    features: ['用统一格式调用上百种模型接口', '可作为网关管理密钥与额度', '支持回退、重试与花费统计'],
    scenarios: ['在多模型之间切换而不改业务代码', '集中管理团队的多家模型密钥'],
  },
  'promptfoo': {
    summary: '面向提示词与模型的测试工具，用批量用例对比不同模型和提示词。',
    features: ['用声明式配置定义测试用例', '支持多模型横向对比与打分', '可接入 CI 做回归检测'],
    scenarios: ['上线前验证提示词改动的效果', '比较不同模型在同一任务上的表现'],
  },
  'dify': {
    summary: '开源的 LLM 应用开发平台，可视化编排应用、Agent 与知识库。',
    features: ['可视化编排对话流程与工作流', '内置知识库与 RAG 检索能力', '提供 API 与嵌入方式对外发布'],
    scenarios: ['快速搭建企业内部的 AI 应用', '把知识库问答发布成可用的服务'],
    keywords: ["AI 应用编排","智能体工作流","Agent 工作流","RAG 应用"],
  },
  'flowise': {
    updated: '2026-11-06',
    verifiedAt: '2026-11-06',
    sources: [
      { title: 'The Future of Flowise（官方 EOL 公告）', url: 'https://flowiseai.com/sunset', type: 'official', scope: '核验官方停止开发、归档、EOL 时间线及 npm/Docker 镜像弃用说明' },
      { title: 'Flowise GitHub 公告', url: 'https://github.com/FlowiseAI/Flowise/discussions/6727', type: 'official', scope: '核验官方团队退出、仓库只读及安全支持终止公告' },
    ],
    summary: '曾经流行的可视化 LLM 工作流编排工具。官方已宣布 EOL，适合查阅旧流程或维护既有部署，不建议新项目采用。',
    features: ['以节点连线的方式编排 LLM 流程', '历史版本内置模型、工具与向量库节点', 'Apache-2.0 源码仍可查看与自行 fork'],
    scenarios: ['维护既有 Flowise 工作流', '评估历史方案并规划迁移，而非启动新生产部署'],
    keywords: ["AI 应用编排","智能体工作流","Agent 工作流","可视化编排","已停止维护","EOL"],
  },
  'fastgpt': {
    summary: '开源的知识库问答平台，围绕 RAG 提供数据导入与流程编排能力。',
    features: ['支持导入多种文档构建知识库', '提供向量检索与对话流程编排', '可对接多家大模型 API'],
    scenarios: ['企业知识库的问答与智能客服', '为内部文档搭一个检索问答入口'],
  },
  'awesome-chatgpt-prompts': {
    summary: '社区维护的提示词合集，把各种角色和用途的提示词整理成清单。',
    features: ['按角色与用途分门别类整理提示词', '内容开源，可自由复制与改写', '可在网页上检索后一键复制使用'],
    scenarios: ['快速找到特定角色的现成提示词', '学习提示词写法的参考素材'],
  },
  'openai-prompt-guide': {
    summary: 'OpenAI 官方的提示词工程指南，讲清编写与优化提示词的原则。',
    features: ['给出六条可操作的提示词编写策略', '用大量正反例对比演示改进思路', '随模型能力更新而调整内容'],
    scenarios: ['系统学习提示词编写的入门方法', '对照指南改写自己效果不好的提示词'],
  },
  'deeplearning-ai-prompts': {
    summary: '吴恩达团队与 OpenAI 合作的提示词工程短课，面向开发者系统讲解。',
    features: ['以短课形式讲解提示词工程要点', '覆盖总结、推理、翻译等典型任务', '结合代码示例演示调用方式'],
    scenarios: ['开发者入门提示词与接口使用', '把提示词技巧用到实际产品开发中'],
  },
  qdrant: {
    related: ['milvus', 'pgvector'],
    summary: '专用的开源向量数据库与向量搜索引擎，用于保存 Embedding 并按相似度检索，同时可按 payload 元数据过滤。',
    features: ['支持向量相似度检索、payload 元数据过滤与组合查询', '提供 Docker 部署、HTTP API 和多语言客户端', '可用于 RAG 检索、语义搜索、推荐与多模态相似度查询'],
    scenarios: ['给 RAG 应用单独部署向量检索服务，不把向量索引塞进业务表结构', '需要按用户、文档版本或业务字段过滤相似度检索结果'],
    usage: ['用固定版本 Docker 镜像启动本机服务，仅绑定 127.0.0.1:6333，并用命名卷保存数据。', '创建四维 Cosine 演示集合，写入两条向量，再用 REST Query API 核对排序与 payload。', '接入真实 Embedding 时统一模型与维度；上线前补齐鉴权、TLS、权限过滤和备份。'],
    guide: [
      {
        title: '准备本机环境并启动服务',
        body: `适合需要独立向量检索服务、愿意维护容器和数据备份的项目。已有 PostgreSQL 且希望少维护一个服务时，也可先比较 pgvector。准备已运行的 Docker、Bash 和支持 \`--fail-with-body\` 的 curl；本例不需要 GPU、模型账号或 Embedding API。

以下固定使用已核验发布的 \`v1.20.0\`，只在自己的开发电脑上试跑。自托管 Qdrant 默认没有鉴权，因此只把 REST 端口映射到本机回环地址。先确认容器名、卷名和 6333 端口没有被其他项目占用；不要借用存放业务数据的卷。

\`\`\`bash
docker run -d --name atlas-qdrant \\
  -p 127.0.0.1:6333:6333 \\
  -v atlas_qdrant_storage:/qdrant/storage \\
  qdrant/qdrant:v1.20.0

curl --fail-with-body -sS http://127.0.0.1:6333/
\`\`\`

启动命令返回容器 ID；服务就绪后，curl 应返回包含 Qdrant 版本的 JSON。刚启动尚未就绪时，查看 \`docker logs atlas-qdrant\` 后再试。命名卷保存数据，重启容器不会清空集合；已有本例容器时，用 \`docker start atlas-qdrant\` 恢复，无需再执行创建容器命令。`,
      },
      {
        title: '创建专用的四维演示集合',
        body: `集合决定向量的维度和相似度算法。本例使用人工构造的四维向量与 \`Cosine\`，只验证接口和排序，不代表任何文本的语义。

仅在第一次运行且 \`atlas_demo\` 尚不存在时执行：

\`\`\`bash
curl --fail-with-body -sS -X PUT \\
  http://127.0.0.1:6333/collections/atlas_demo \\
  -H 'Content-Type: application/json' \\
  --data '{"vectors":{"size":4,"distance":"Cosine"}}'
\`\`\`

预期响应含 \`"result":true\` 和 \`"status":"ok"\`。重跑本例时跳过创建；可用 \`curl --fail-with-body -sS http://127.0.0.1:6333/collections/atlas_demo\` 查看配置，确认 \`result.config.params.vectors\` 是四维 Cosine。若同名集合来自其他用途或配置不同，换一个未使用的集合名，并同步修改后续 URL，保留原有数据。`,
      },
      {
        title: '写入两条带元数据的向量',
        body: `在刚建立的专用演示集合写入两条记录。\`payload.label\` 只是方便辨认结果的标签，不会被这次请求自动转换成 Embedding。\`wait=true\` 要求服务等待写入完成再返回。

\`\`\`bash
curl --fail-with-body -sS -X PUT \\
  'http://127.0.0.1:6333/collections/atlas_demo/points?wait=true' \\
  -H 'Content-Type: application/json' \\
  --data '{"points":[
    {"id":1,"vector":[1,0,0,0],"payload":{"label":"demo-a"}},
    {"id":2,"vector":[0,1,0,0],"payload":{"label":"demo-b"}}
  ]}'
\`\`\`

预期顶层 \`status\` 为 \`ok\`，且 \`result.status\` 为 \`completed\`。相同 ID 的 upsert 会覆盖该记录，因此只在本例专用集合重跑；它不会追加重复的 ID 1、2。每条向量都必须有四个数，查询向量也一样。`,
      },
      {
        title: '查询并核对确定的排序',
        body: `用与第一条记录相同的向量查询，并显式要求返回 payload：

\`\`\`bash
curl --fail-with-body -sS -X POST \\
  http://127.0.0.1:6333/collections/atlas_demo/points/query \\
  -H 'Content-Type: application/json' \\
  --data '{"query":[1,0,0,0],"with_payload":true,"limit":2}'
\`\`\`

在只有这两条演示记录的集合中，\`result.points\` 应先返回 ID 1、标签 \`demo-a\`，得分约为 1；再返回 ID 2、标签 \`demo-b\`，得分约为 0。这说明创建、写入和相似度查询已经连通。响应还有版本、耗时等字段，不必逐字匹配；如果看不到标签，先检查请求中的 \`with_payload\`。`,
      },
      {
        title: '排查错误，再接入真实检索',
        body: `- 连不上服务：查看 \`docker ps -a\` 与 \`docker logs atlas-qdrant\`，确认容器已启动、6333 端口未被占用。容器名冲突时先确认是不是上次的演示容器。
- 集合不存在或维度报错：核对 URL、集合配置和向量长度。实际 Embedding 模型若输出其他维度，应为它另建匹配的集合，不要直接把输出塞进四维演示集合。
- 返回顺序不符：确认仍是 Cosine、查询仍为 \`[1,0,0,0]\`，且集合没有混入其他数据。人工向量的标签与文本相似度无关。

接入文本检索时，由应用选择同一个 Embedding 模型处理文档和查询，保存来源等 payload，并在检索时落实业务权限过滤。生产部署要固定经过测试的镜像版本或 digest，配置 API Key、私网访问、TLS 与备份恢复；不要把本例无鉴权服务直接暴露到公网。`,
      },
    ],
    cautions: ['本例只传入人工向量，不调用 Embedding 服务；文本语义检索还需要选择模型、切分文档并统一向量维度。', '自托管实例默认没有鉴权；本机回环端口映射用于开发试跑，生产环境仍需认证、TLS、网络边界和备份。'],
    keywords: ['向量数据库', '向量检索', 'RAG 向量库', 'Embedding 检索', '语义搜索', '相似度搜索'],
    updated: '2026-11-06',
    verifiedAt: '2026-11-06',
    sources: [
      { title: 'Qdrant Local Quickstart', url: 'https://qdrant.tech/documentation/quickstart/', scope: '本地容器、持久化存储路径、REST 端口、四维示例与 payload 查询' },
      { title: 'Qdrant Security', url: 'https://qdrant.tech/documentation/security/', scope: '自托管默认无鉴权；本机回环绑定、API Key、私网和 TLS 要求' },
      { title: 'Qdrant Create a collection', url: 'https://api.qdrant.tech/api-reference/collections/create-collection', scope: 'PUT 集合接口、vectors.size、Cosine 距离与成功响应结构' },
      { title: 'Qdrant Upsert points', url: 'https://api.qdrant.tech/api-reference/points/upsert-points', scope: 'PUT points、wait=true、相同 ID 覆盖及 completed 状态' },
      { title: 'Qdrant Query points', url: 'https://api.qdrant.tech/api-reference/search/query-points', scope: 'POST points/query、query、with_payload、limit 与 result.points 字段' },
      { title: 'Qdrant v1.20.0 Release', url: 'https://github.com/qdrant/qdrant/releases/tag/v1.20.0', scope: '2026-11-06 核验 v1.20.0 为 2026-10-22 发布的非预发布版本；用于本例固定标签，不表示永远最新' },
    ],
  },
  milvus: {
    summary: 'LF AI & Data Foundation 下的开源云原生向量数据库，面向高规模 ANN 检索、RAG 和混合检索场景。',
    features: ['保存 Embedding 与结构化元数据，支持向量相似度和混合搜索', '可从 Milvus Lite / Standalone 起步，再按规模扩展到分布式集群', '支持 Docker Compose 和 Kubernetes 部署路径'],
    scenarios: ['向量数据量较大，需要专用检索引擎和后续横向扩展能力', '需要把稠密向量、稀疏向量和关键词检索组合用于 RAG'],
    usage: ['对照目标 Milvus 版本的安装文档选择 Lite、Standalone 或 Distributed。', 'PoC 可从官方 Quick Start 开始；Standalone 按官方硬件要求预留 CPU、内存和 SSD。', '上线前压测导入、索引构建、过滤和并发查询，并明确数据备份与升级策略。'],
    cautions: ['Milvus 不是低配 VPS 上随手启动的轻量单容器工具：官方 v2.6.x 文档对 Standalone 列出 8 GB 内存最低要求、16 GB 推荐，并建议 4 核；集群要求更高。请以实际部署版本的硬件文档为准。', 'Milvus 只提供向量数据检索层，Embedding 模型、文档处理、业务权限和 RAG 生成链路仍由应用承担。'],
    keywords: ['向量数据库', '大规模向量检索', 'ANN 检索', 'RAG 向量库', '混合检索', 'Embedding 数据库'],
    updated: '2026-11-05',
    verifiedAt: '2026-11-05',
    sources: [
      { title: 'Milvus 官方仓库', url: 'https://github.com/milvus-io/milvus', scope: '项目定位、LF AI & Data Foundation 治理和 Apache-2.0 许可证' },
      { title: 'Milvus Overview', url: 'https://milvus.io/docs/overview.md', scope: '向量与结构化元数据检索、RAG 和语义搜索用途' },
      { title: 'Milvus Standalone 硬件要求', url: 'https://milvus.io/docs/v2.6.x/prerequisite-docker.md', scope: 'v2.6.x Standalone 与 Cluster 的 CPU、内存最低要求和推荐值' },
      { title: 'Milvus Releases', url: 'https://github.com/milvus-io/milvus/releases', scope: '核验稳定版本发布和维护状态' },
    ],
  },
  pgvector: {
    summary: 'PostgreSQL 的开源向量扩展，可把 Embedding 和业务数据放在同一数据库中，并用 SQL 做精确或近似近邻检索。',
    features: ['支持精确最近邻查询及 HNSW、IVFFlat 近似索引', '支持多种向量类型与距离度量，可直接使用 SQL、JOIN 和事务', '以 PostgreSQL 扩展形式安装，不需要额外维护一套独立向量数据库'],
    scenarios: ['业务已经使用 PostgreSQL，只需要为现有数据增加向量相似度检索', '中小规模 RAG 项目希望减少独立服务和数据同步链路'],
    usage: ['确认 PostgreSQL 版本与扩展安装方式；官方 README 当前示例支持 PostgreSQL 13+。', '安装 pgvector 后启用 CREATE EXTENSION vector，再按查询需求选择 HNSW 或 IVFFlat。', '为 IVFFlat 和 HNSW 分别评估召回率、索引构建耗时、内存和查询计划。'],
    cautions: ['pgvector 是 PostgreSQL 扩展，不是独立向量服务；数据库实例的容量、备份、连接数和故障恢复仍由 PostgreSQL 承担。', '2026-10 发布的 0.8.7 修复了 IVFFlat 索引构建缓冲区溢出（CVE-2026-103484）；使用受影响旧版本的环境应升级并按安全公告评估。'],
    keywords: ['向量数据库', 'PostgreSQL 向量扩展', 'Postgres 向量检索', 'SQL 向量检索', 'RAG 向量存储', 'Embedding 检索'],
    updated: '2026-11-05',
    verifiedAt: '2026-11-05',
    sources: [
      { title: 'pgvector 官方 README', url: 'https://github.com/pgvector/pgvector/blob/master/README.md', scope: 'PostgreSQL 扩展能力、支持的向量类型、索引和 PostgreSQL 版本' },
      { title: 'pgvector META.json', url: 'https://github.com/pgvector/pgvector/blob/master/META.json', scope: '扩展版本 0.8.7 与 PostgreSQL 许可证标识' },
      { title: 'PostgreSQL: pgvector 0.8.7 Released', url: 'https://www.postgresql.org/about/news/pgvector-087-released-3392/', scope: '0.8.7 修复 IVFFlat 索引构建缓冲区溢出及建议升级' },
    ],
  },
  'best-paper-writing-skill': {
    updated: '2026-11-07',
    verifiedAt: '2026-11-07',
    sources: [
      { title: 'Best-Paper-Writing-Skill 项目站点', url: 'https://gulucaptain.github.io/Best-Paper-Writing-Skill/', type: 'official', scope: '核对 skill 用途：输入摘要或研究信息后生成 Title、Abstract、Introduction、Method 与 Experiments 草稿，及来源论文集（60 篇 CVPR/ICCV/NeurIPS 获奖论文）' },
      { title: 'gulucaptain/Best-Paper-Writing-Skill（GitHub）', url: 'https://github.com/gulucaptain/Best-Paper-Writing-Skill', type: 'official', scope: '核对仓库活跃度（2026-10 有提交）与 Claude/Codex Skill 形态；不覆盖生成内容在实际论文中的质量' },
      { title: 'L 站 2026.11 精选帖（发现来源）', url: 'https://linux.do/t/topic/3106502', type: 'third-party', scope: '收录线索来源：timerring 的月度精选帖「帖子/项目/工具类」条目，附一句点评' },
    ],
    summary: '从 60 篇顶会获奖论文提炼论证结构与文风的论文写作 Skill，按章节生成学术草稿。',
    features: [
      '输入摘要或研究信息即可起草 Title、Abstract 与 Introduction',
      '覆盖 Method 与 Experiments 章节的写作范式',
      '以 Skill 形态挂载到 Claude Code / Codex 等 coding agent',
    ],
    scenarios: [
      '论文初稿没头绪，先按顶会范式搭出章节骨架',
      '给组里新生一份可复用、可改写的写作脚手架',
    ],
    keywords: ['论文写作', '学术写作', 'paper writing', '顶会', 'CVPR', 'Claude skill', 'Codex skill'],
  },
};

