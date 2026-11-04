# FOSS-Atlas 资源可信度扩展批次二 — 2026-11-04

## 本批范围
在首批 20 条基础上新增 12 条，累计 32 条。 目录另新增一个独立的腾讯云 TokenHub 开发者入口（共 187 个资源条目），把消费者聊天产品与 API 体验包分开。重点区分持续免费计划、API 请求限制、一次性体验包与预付费 API；不能把速率限制、试用赠金或产品首页可访问误读为无限免费调用。

## 新增核验条目
| 资源 | 方案类型 | 本次核验结论 | 关键边界 |
|---|---|---|---|
| NextDNS | free-tier | Free 每月 300,000 次查询 | 超额后退化为传统 non-blocking DNS |
| Hugging Face Spaces | free-tier | Static Spaces 免费；官方列出 CPU Basic 规格 | Gradio / Docker compute 创建资格受计划限制，不是通用免费 VPS |
| Pexels API | free-tier + api-demo | 默认 200 次/小时、20,000 次/月 | 署名及用途限制；官方称提额申请暂停 |
| QRServer | api-demo | 未公布固定请求数上限 | 保留拒绝滥用权利；规律性超过 10,000 次/日应联系 |
| Textbelt | api-demo | 共享演示 Key 每日 1 条免费短信 | 更多托管短信需付费 Key；开源版本是不同的自建网关 |
| Nominatim | api-demo | OSMF 公共实例最多每秒 1 次，按整个应用合计 | 必须署名和设置 UA / Referer；禁止自动补全及系统性查询 |
| OpenAI API | credit + paid-usage | API 与 ChatGPT 独立计费；新 API 账户采用预付 credits | 只有账户实际持有的 free / promotional credits 可抵扣 |
| Anthropic API | credit + paid-usage | API / Workbench 采用预付 usage credits | 赠金金额依账户而异；购买 credits 一年后过期 |
| DeepSeek API | paid-usage | 按模型 Token 计费，余额接口区分 granted_balance / topped_up_balance | 赠金按账号实际发放，不是统一免费套餐 |
| 腾讯混元 API | trial + credit | 首次开通旧混元服务可获一次性资源包；指定文本模型组列出 100 万 tokens | 模型范围与一年有效期；旧平台逐步迁移 TokenHub |
| MiniMax API | api-demo | 指定免费 T2T 场景为 6 RPM | RPM 是请求速率，不是月度 Token 赠额 |
| Cursor | free-tier | Free 为 USD 0 / 月，Agent 与 Chat 请求受限 | 无固定公开请求数承诺；第三方模型费用可能另计 |

## 同步修正的目录描述
- IPinfo：区分需 Token 的 Lite country-level Geo / basic ASN 免费计划，与无账号 Legacy 公共 API 每日 1,000 次共享出口 IP 限流；移除旧“5 万次/月”。
- Replit：移除“免费 5 个 Repl 项目”的过时数字；不描述成固定免费配额或免费 VPS。
- SiliconFlow：不再声称平台统一含免费额度；模型价格、限速及活动应逐模型核对。
- 智谱 GLM：不承诺常驻免费 Token 额度，活动按账户权益和具体条款判断。
- 阿里通义：当前链接指向消费者聊天产品，不把阿里云百炼开发者 API 的模型赠额附着到该 URL。
- 腾讯混元：消费者聊天入口继续保留为独立目录项；开发者 API 的一次性资源包改为绑定新增的腾讯云 TokenHub 资源项，避免跨产品映射。
- 同步更新 Cursor、NextDNS、Pexels、QRServer、Textbelt、Nominatim、Hugging Face Spaces、OpenAI / Anthropic / DeepSeek / MiniMax / 腾讯混元的目录描述。

## 官方来源
1. NextDNS Pricing：<https://nextdns.io/pricing>
2. Hugging Face Spaces Overview：<https://huggingface.co/docs/hub/spaces-overview>
3. Pexels API 默认请求限制：<https://help.pexels.com/hc/en-us/articles/47677890260761-Is-the-Pexels-API-free-to-use>
4. Pexels API 提额资格与暂停状态：<https://help.pexels.com/hc/en-us/articles/900005852323-How-do-I-get-unlimited-requests>
5. QRServer API：<https://goqr.me/api/doc/create-qr-code/>
6. Textbelt 免费演示 Key：<https://textbelt.com/sms-charts/>；开源自建实现：<https://github.com/typpo/textbelt>
7. Nominatim 使用政策：<https://operations.osmfoundation.org/policies/nominatim/>
8. OpenAI ChatGPT / API 计费分离：<https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform>
9. OpenAI API 预付费：<https://help.openai.com/en/articles/8264644-setting-up-and-managing-prepaid-api-billing>
10. Anthropic API credits：<https://support.anthropic.com/en/articles/8977456-how-do-i-pay-for-my-api-usage>
11. Anthropic Console API setup：<https://support.anthropic.com/en/articles/8114531-i-have-created-an-account-in-console-and-i-want-to-start-using-the-api-what-should-i-do>
12. DeepSeek 余额接口：<https://api-docs.deepseek.com/zh-cn/api/get-user-balance/>
13. DeepSeek API 价格：<https://api-docs.deepseek.com/quick_start/pricing>
14. 腾讯混元免费资源包及迁移说明：<https://cloud.tencent.com/document/product/1729/106126>
15. 腾讯混元文本模型免费 Token 包：<https://cloud.tencent.com/document/product/1729/97731>
16. 腾讯 TokenHub：<https://cloud.tencent.com/product/tokenhub>
17. MiniMax 官方 Rate Limits：<https://platform.minimaxi.com/document/Rate%20limits?key=66b19417290299a26b234572>
18. Cursor Pricing：<https://cursor.com/pricing>

## 未纳入固定额度的候选项
- Replit：无法确认稳定、统一、公开的固定 Free 项目数；Agent、部署与运行规则以账户计划为准。
- SiliconFlow：不同模型 / 活动价格和速率不同，未确认全平台通用的长期免费 Token 池。
- 智谱 GLM：账户活动与资格动态变化，未把推广活动写成常驻免费层。
- 阿里云百炼：开发者 API 新用户额度与消费者聊天入口不是同一产品，未跨产品映射。
- MiniMax：只记录特定免费用户接口 RPM，不推断免费月度 Token 赠额。

## 验收口径
npm run offers:check 应验证 32 条记录具有唯一且存在的资源 ID、HTTPS 来源、有效日期与完整额度结构。测试还需覆盖 NextDNS 超额行为、Pexels 默认限额、Nominatim 单应用限速、OpenAI / Anthropic 独立预付费、DeepSeek 账户赠金字段、腾讯一次性资源包与 MiniMax RPM 非月额度。
