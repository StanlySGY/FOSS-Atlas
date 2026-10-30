# FOSS-Atlas UI/UX 交接记录

> 最近更新：2026-10-30（Asia/Seoul）
> 范围：仅记录公开仓库 `StanlySGY/FOSS-Atlas` 的站点体验与交付状态，不替代私有 `selfhost` 运维交接文档。

## 当前状态

- `main` 最新功能提交：`9fd8fff3ee5f581f1571e48a9b5546ddac6867fa`（`docs: align Atlas service guides with hardening release`）；本轮同步 Atlas QR、Geo、Meta 的生产修复说明、使用政策与安全边界。
- Cloudflare Pages：<https://atlas.sgyyyds.qzz.io/>；由 `main` 分支推送自动触发发布。
- GitHub Pages：<https://stanlysgy.github.io/FOSS-Atlas/>；由 `main` 分支推送自动触发发布。
- 根目录 `HANDOVER.md` 仍是本地私有 selfhost 交接副本，不属于此公开仓库的提交内容。

## 上一轮已交付（2026-10-29）

1. **图谱双视图**：新增“图谱 / 列表”切换，通过 URL 参数 `view=list` 深链接；列表消费同一份图谱数据、当前可见节点集合和关系过滤，支持按名称、ID、分类、标签、域名及描述搜索。工具可跳转 Wiki，分类/子类可聚焦分类。列表模式铺满内容区并隐藏重复侧栏。
2. **首页筛选一致性**：URL 中 `q` 参数被移除时，搜索框同步清空；搜索覆盖分类名与子分类名；当前搜索、分类、子分类和已部署条件显示为可单独移除的筛选标签；“清除全部”和空结果页的“重置筛选”统一清空这些条件。
3. **生成产物同步**：重新生成中文字体子集与 4 张 OG 分享卡片，避免站点文案更新后分享卡片和字体覆盖旧数据。

## 上一轮验证证据（2026-10-29）

本地最终验证通过：

- `npm test`：7/7 通过。
- `npm run lint`：0 警告、0 错误。
- `npm run views:check`：全图 283 个节点；部署视图 106 个节点；11 个分类视图全部通过。
- `npm run build`：成功生成 189 个页面；OG 检查匹配当前数据（186 tools、643 edges、75 deployed resources、93 instances）。
- `git diff --check`：通过。

线上手动回归：两站均能打开 `?view=list&cat=ai`；列表搜索 `ollama` 后可打开 `/wiki/ollama/`；Cloudflare 上从列表切回图谱后 URL 会移除 `view=list` 并保留 `cat=ai`。两站抽查的 JS、CSS、字体、Wiki 资源请求均为 200，浏览器诊断未发现 console error/warning 或失败请求。首页组合筛选后点击“重置筛选”，已观察到返回干净的 `/` 地址，输入框清空，筛选标签消失。

## 本轮已交付（2026-10-30）

1. **图谱筛选状态一致性**：修复 Graph 页面“全部”分类筛选按钮在启用“仅看已部署”时，视觉激活状态与 `aria-pressed` 不一致的问题。现在只有未聚焦具体分类且未启用 deployed-only 条件时，“全部”才显示为激活。
2. **SPA 页面标题同步**：修复从其他页面通过客户端路由进入 Wiki 时，浏览器标签标题仍停留在“知识图谱”的问题。新增 `src/lib/documentTitle.js` 中的 `documentTitleForLocation(pathname, resources)`，统一解析静态路由、Wiki 资源标题及未知路径回退；`src/components/Layout.jsx` 在路由路径变化时更新 `document.title`。直接打开与站内导航现在使用一致的标题规则。
3. **回归覆盖**：更新 `scripts/tests/contracts.test.mjs`，覆盖 deployed-only 条件下“全部”筛选按钮的状态样式；新增 `scripts/tests/document-title.test.mjs`，覆盖静态路由及尾斜杠、Wiki 标题与预渲染标题一致性、未知/异常路径回退。
4. **本轮变更文件**：`src/pages/GraphPage.jsx`、`scripts/tests/contracts.test.mjs`、`src/components/Layout.jsx`、`src/lib/documentTitle.js`、`scripts/tests/document-title.test.mjs`。业务代码提交为 `00a70cee0135c4b229f4e3972dce182ec6108931`；本次补写交接文档将另行单独提交。

## 本轮验证证据（2026-10-30）

- `npm test`：11/11 通过。
- `npm run lint`：61 个文件，0 警告、0 错误。
- `npm run views:check`：通过；全图 283 个节点、部署视图 106 个节点、11 个分类视图。
- `npm run build`：通过；转换 898 个模块、预渲染 189 个页面（含 186 个 Wiki 页面），sitemap 189 个 URL；OG 数据检查与当前数据一致（186 tools、643 edges、75 deployed resources、93 instances）。
- `git diff --check`：通过；`/FOSS-Atlas/`（GitHub Pages）与根路径 `/`（Cloudflare 自定义域名）两种 base 均成功构建。
- 本地 Chrome 真实浏览器验收：320px/390px 首页、390px 图谱列表及 Wiki 均无横向溢出；768px Wiki 显示桌面侧栏；列表搜索 `ollama` 返回唯一结果并可进入 Wiki；Wiki 抽屉支持 Escape 关闭且正确恢复页面滚动；浏览器前进/后退时标题正确切换。
- 部署后线上验收：Cloudflare 自定义域名图谱列表 AI 分类筛选可用，搜索 `ollama` 可打开 Wiki，标题为 `Ollama · 本地跑大模型 | FOSS-Atlas`；后退/前进的页面标题随路由恢复。GitHub Pages 镜像与 Cloudflare 主站的首页、Wiki 页面标题及 Wiki 内容元数据均核验正常。
- 推送 `00a70cee0135c4b229f4e3972dce182ec6108931` 后，GitHub Pages 工作流 [40982142380](https://github.com/StanlySGY/FOSS-Atlas/actions/runs/40982142380) 与 Cloudflare Pages 工作流 [40982142384](https://github.com/StanlySGY/FOSS-Atlas/actions/runs/40982142384) 均完成且结论为 `success`。

## 本轮追加交付（2026-10-30）

1. **Atlas 自建精选展示**：首页新增 `BUILT HERE` 项目展示区，精选 EdgeSSH、Atlas Short、Atlas Paste、Atlas Tools 四个真实自建且已部署的服务。每张卡片同时提供在线服务入口与对应 Wiki 技术说明，并展示部署栈和主题标签；所有信息均从现有资源目录读取，不维护第二份项目清单。
2. **响应式浏览**：窄屏使用横向滚动与 snap 定位，桌面端切换为两列 / 四列网格。开始搜索、分类筛选或只看已部署时自动隐藏精选区，避免打断原有资源检索。
3. **首屏发现提示**：首页说明改为明确的「搜索 → Wiki → 知识图谱」浏览路径，并提示已自部署条目的在线入口。没有为 API 类服务伪造产品截图，也没有引入 3D 场景、人物、天气或独立 Portal。
4. **数据约束**：新增 `src/lib/featuredBuilds.js` 和 `scripts/tests/featured-builds.test.mjs`，精选列表只接受目录中标记为自建且已部署的条目；缺失、第三方和未部署记录不会进入展示区。

## 本轮追加验证证据（2026-10-30）

- `npm test`：13/13 通过（含精选列表的数据约束测试）。
- `npm run lint`：64 个文件，0 警告、0 错误。
- `npm run views:check`：通过；全图 283 节点、部署视图 106 节点、11 个分类视图。
- `npm run build`：通过；转换 900 个模块，预渲染 189 个页面（186 篇 Wiki），OG 检查与当前数据一致（186 tools、643 edges、75 deployed resources、93 instances）。
- 本轮验证通过 Ubuntu-24.04 WSL 执行；精选区没有改变资源目录、Wiki、图谱或部署数据模型。

## 本轮追加交付：精选服务 Wiki 深化（2026-10-30）

1. **四篇自建服务 Wiki 增加可操作说明**：EdgeSSH、Atlas Short、Atlas Paste、Atlas Tools 均新增「快速上手」与「使用边界与安全提醒」。Atlas Tools 额外提供 SHA-256、UUID v4、Base64、URL 编码四个只读 GET 调用示例及响应结构。
2. **按真实线上页面校准**：已检查短链、Paste、Tools 的线上表单与按钮；只读验证 Tools 的 `/api/hash`、`/api/uuid`、`/api/encode` 响应。Short/Paste 的写入型创建接口没有做 POST 探测，避免在真实 KV 中留下测试记录。EdgeSSH 的未登录入口由 Cloudflare Access 拦截，因此 Wiki 只描述可确认的邮箱验证码门槛，不声称已验收认证后的终端交互。
3. **Wiki 生成器能力**：`scripts/build-wikis.mjs` 支持按条目覆盖 `updated`，并为可选的 `usage`、`apiExamples`、`cautions` 生成固定章节；API 示例路径限制为 `/api/`，避免把任意链接当命令渲染。改动只影响四个目标 Wiki，没有重写其他条目内容。
4. **字体与分享素材**：新增中文内容后，重新生成字体子集（1257 glyphs）与 4 张 OG 分享卡片，确保新增文案在页面和分享预览中有对应字形。

## 本轮追加验证证据（2026-10-30）

- `npm test`：16/16 通过，新增 Wiki 内容、API 示例与生成输出约束测试。
- `npm run lint`：65 个文件，0 警告、0 错误。
- `npm run views:check`：通过；全图 283 节点、部署视图 106 节点、11 个分类视图。
- `npm run build`：通过；转换 900 个模块、预渲染 189 个页面（186 篇 Wiki），OG 检查匹配当前目录（186 tools、643 edges、75 deployed resources、93 instances）。
- `git diff --check`：通过；Wiki 生成产物仅 4 篇内容页有语义变化。

## 本轮追加交付：剩余七个 Atlas 边缘服务 Wiki 深化（2026-10-30）

1. **覆盖范围**：Atlas Nodes、Atlas QR、Atlas Proxy、Atlas IP、Atlas Check、Atlas Geo、Atlas Meta 七篇 Wiki 均补充快速上手、只读 GET 示例、响应结构和安全/使用边界；已有 EdgeSSH、Atlas Short、Atlas Paste、Atlas Tools 四篇指南保持不变。
2. **生成器约束**：`scripts/build-wikis.mjs` 不再把示例路径局限于 `/api/`，允许已核验的站内只读路径（例如 Geo 的 `/search`、`/reverse`）；同时要求单斜杠相对路径，并拒绝换行、空白、引号和反斜杠，避免生成的 curl 单引号命令被打断。示例使用 curl 默认 GET，不提供写入型请求。
3. **关键线上核验快照**：
   - Nodes：`/api/sources` 返回 9,058 条聚合节点及各上游 `ok/count` 状态；页面数据会随上游和缓存变化。
   - QR：`/api/qr?data=FOSS-Atlas` 与 `/qr.svg?data=FOSS-Atlas` 返回 `image/svg+xml`。`/qr.png` 也返回 HTTP 200，但 MIME 仍是 SVG，不应当作 PNG 输出。
   - Proxy：`/http`、`/socks4`、`/socks5`、`/json` 和 `/api/sources` 均返回 200；本次首页快照为 HTTP 3,346、SOCKS4 2,373、SOCKS5 3,814 条，来源 API 合计 9,533 条。完整 JSON 列表响应约 912,747 字节，文档建议优先用 `/api/sources` 做状态轮询。
   - IP：`/api/ip` 与 `/json` 返回 200；结果表示发起请求的客户端出口及其粗略地理/ASN 信息，不是服务器固定 IP。
   - Check：`/api/email` 和 `/api/domain` 使用 Gmail 样例返回 200，字段包含 `format_valid`、`disposable`、`has_mx`、`mx` 和 `blocklist_size`；黑名单规模 9,963 是本次快照。MX 存在不代表邮箱真实存在或邮件可送达。
   - Geo：`/search?q=Seoul` 与 `/reverse?lat=37.5665&lon=126.9780` 正常返回结构化结果；`/json?q=Seoul` 本轮返回“上游地理编码服务暂不可用”，因此未把它列为推荐调用示例。
   - Meta：`/json?url=` 早期对公开网页曾返回标题/描述/图片等元数据，但重复请求随后出现 `{"error":"抓取失败"}`；目前按间歇性故障记录，调用方需处理错误并准备降级。
4. **风险提示**：Nodes 免费节点与 Proxy 公开代理均不保证可用性和安全性，Wiki 明确禁止承载敏感流量；IP 地理位置只作粗略参考；Meta 只能提交可公开访问且有权抓取的 URL，禁止提交内网地址和含凭据/令牌的链接。
5. **分享素材同步**：重新生成中文字体子集与 4 张 OG 分享卡片，本轮 OG 文本覆盖 1,276 个字形；构建检查与目录数据一致。

## 本轮验证证据（2026-10-30）

- `npm test`：19/19 通过，覆盖七篇新增 Wiki、API 示例安全路径、Geo/QR/Meta 已知异常与生成输出。
- `npm run lint`：65 个文件，0 警告、0 错误。
- `npm run views:check`：通过；全图 283 节点、部署视图 106 节点、11 个分类视图。
- `npm run build`：通过；转换 900 个模块，预渲染 189 个页面（186 篇 Wiki），OG 数据匹配 186 tools、643 edges、75 deployed resources、93 instances。
- `npm run fonts`、`npm run og`：已重建字体子集与 4 张 OG 卡片；`build-og --check` 通过。
- `git diff --check`：通过。

## 本轮追加交付：Atlas Edge Kit 服务质量治理（2026-10-30）

1. **源码恢复与版本治理**：线上十域名共用的 Cloudflare Worker `atlas-edge-kit` 原先只有已部署 bundle，没有可追溯的源码仓库或 source map。本轮从 Cloudflare 导出活动模块并建立恢复基线（不是声称恢复了原始 pre-bundle 源码），新建私有仓库 <https://github.com/StanlySGY/atlas-edge-kit>。当前源码提交：`8f690cc3bd41b46baca789541ce9236bd8ee8267`；Worker 生产版本：`d74ed99e-dab7-4732-8bc1-fa0d81208d71`，部署记录：`76d89869-c087-4ae9-8065-7c491e483737`，Cloudflare API 确认该版本承载 100% 流量。十个自定义域名仍全部 enabled。
2. **Atlas QR**：`/qr.png` 现在输出真实 1-bit 灰度 PNG，响应 MIME 为 `image/png`；`/api/qr` 与 `/qr.svg` 保持 SVG。自动化测试会校验 PNG 签名、IHDR、IDAT 解压与像素尺寸；本地 HTTP 验收确认 320×320 PNG 文件结构有效。生产 bundle 已核对包含独立 PNG 输出逻辑，但本轮通过外部采集器未能稳定取得生产二进制响应，因此生产 PNG 下载仍建议后续再做一次直接浏览器/客户端抽查。
3. **Atlas Geo**：请求经全站共享 Durable Object `GEO_RATE_LIMITER` 串行排队，出站请求至少间隔 1 秒，队列最多等待 8 项；Fresh cache 7 天，成功结果保留 30 天并可在上游故障时以 `stale=true` 回退。上游状态、超时、Retry-After 会以稳定字段输出，不做自动重试。上游地址可用 KV 的 `config:atlas-geo-upstream` 切换为 HTTPS Nominatim-compatible 服务，署名用 `config:atlas-geo-attribution` 配置；设置为 `disabled` 可停止新外部请求。默认仍使用公共 Nominatim，并在页面及响应中标注 `© OpenStreetMap contributors`。该公共服务对整个应用总量限制为每秒最多 1 次，要求用户触发、禁止自动补全或批量/系统性查询；接手者更换上游前必须先核对替代服务的条款、限流和署名要求：<https://operations.osmfoundation.org/policies/nominatim/>。
4. **Atlas Meta**：抓取增加 10 秒超时、400 KiB 流式读取上限、最多 5 次手动重定向并逐跳验证、常见私网主机/IP 字面量/凭据/非标准端口拦截；缓存 24 小时新鲜、最长 7 天陈旧回退，错误响应带稳定 `code`。这不是对 DNS rebinding 等所有 SSRF 变体的完整防护，不能当作任意 URL 代理；仍只允许抓取有权访问的公开 URL。本轮已通过本地自动化测试验证防护、重定向、体积上限和降级；但生产外部目标的最终抓取结果未通过当前网页采集工具独立确认（采集器报 `invalid_redirect_url`，不能据此认定是 Worker 响应或服务端故障）。调用方应继续处理 `error/code`，端到端稳定性保持为待复核项。
5. **Worker 验证**：私有项目 `npm run check`：17/17 通过，包含 PNG 二进制校验、全局 DO 一秒限速、Geo stale/provider 切换/缓存隔离、Meta SSRF 边界、重定向、超时降级和响应体上限。`npx wrangler deploy --dry-run` 成功；打包约 106 KiB（gzip 25.22 KiB），仅保留原 KV namespace `b9a5a660ec1d4a5e9a60335a00255315` 并新增 Durable Object 绑定。`npx wrangler whoami` 通过。
6. **FOSS-Atlas Wiki 同步**：QR、Geo、Meta 三篇 Wiki 更新为当前接口、全局 Nominatim 限流、署名要求、缓存/降级策略和 Meta 安全边界；同步新增回归断言。字体子集覆盖 1,276 glyph，4 张 OG 分享卡已重建。功能提交：`9fd8fff3ee5f581f1571e48a9b5546ddac6867fa`（`docs: align Atlas service guides with hardening release`）。

## 本轮验证证据（2026-10-30）

- FOSS-Atlas：`npm test` 19/19 通过；`npm run lint` 65 个文件、0 警告/错误；`npm run views:check` 通过（全图 283 节点、部署图 106 节点、11 分类）；`npm run fonts`、`npm run og` 通过；`npm run build` 转换 900 个模块并预渲染 189 个页面，OG 检查匹配 186 tools、643 edges、75 deployed resources、93 instances；`git diff --check` 通过。
- Cloudflare 生产 Worker：API 复核 `d74ed99e-dab7-4732-8bc1-fa0d81208d71` 为最新活动版本且流量分配 100%；十个自定义域名均 enabled。线上 Geo `/json?q=Seoul&limit=1` 返回 200，显示 `cached=true`、`stale=false` 与 OSM attribution。十个服务首页均可被采集器读取。
- 生产边界：Geo 本次线上结果命中已有缓存，证明新响应结构和服务路由在线，不代表当次触发了一次新的 Nominatim 出站请求；Meta 外部网页抓取尚未独立确认；QR 生产 PNG 二进制需后续直接客户端抽查。以上边界不得在后续交接中写成已完成端到端验收。

## 后续任务 / 已知限制

- 用户提供的生图参考站点：<https://l0veyou.com/chat> 与 <https://image.mlgb7.com/>。本次浏览器会话没有继承用户原 Chrome 登录态：前者要求登录才能开始对话，后者停在登录页。因此本轮没有验证生图流程，也未生成或接入这两个站点的素材。后续应在用户完成登录后先验证它们的真实生图流程，再决定是否为首页/Wiki/分享卡片引入少量统一视觉素材；不要为了装饰给目录卡片墙无差别添加图片。
- 推荐下一轮优先检查移动端图谱/列表可用性、Wiki 详情页与标签/相关工具的往返路径；先观察真实使用问题，再改动，避免无目标地堆叠视觉效果。

## 下次接手命令

```sh
cd /home/sgy/workspace/FOSS-Atlas
git status --short --branch
npm test
npm run lint
npm run views:check
npm run build
git log -1 --oneline
```

提交时只 stage 明确属于 FOSS-Atlas 的文件。不要把根目录本地 `HANDOVER.md`（旧 selfhost 私有交接副本）添加到公开仓库。


## 本轮追加交付：Atlas Edge Kit 十域名运行治理与生产复验（2026-10-30）

1. **十域名健康接口**：共享 Worker 为 short、paste、nodes、qr、px、ip、check、geo、meta、tools 十个正式域名增加 GET/HEAD /healthz。返回服务标识和时间戳；响应 no-store，带 nosniff、noindex 和 no-referrer；不支持的方法返回 405。该接口只证明 Worker 路由可响应，不代表 KV 或外部上游健康。
2. **Atlas Paste 生命周期修正**：新建 Paste KV 项目设置 7 天 expirationTtl，创建接口返回 expires_at；首页展示保留时长。纯文本和渲染页使用 no-store、nosniff、noindex。仅对本次上线后新建的内容生效，旧 KV 记录没有被批量删除或追溯设置 TTL。FOSS-Atlas paste Wiki 已同步说明新旧记录差异。
3. **Atlas Nodes 上游修复**：aiboboxx/v2rayfree 原日期化地址 /main/v20261020 已失效（404），更换为上游长期订阅路径 /main/sub。增加解析回归测试；部署后直接刷新 /api/sources，当时 cached=false、总量 9,318，其中该来源 ok=true、解析 85 条。
4. **自动化生产巡检**：私有仓库新增 npm run smoke:health、MONITORING.md 和 .github/workflows/atlas-edge-health.yml。每天定时执行并支持手动触发，检查十域名 GET/HEAD、QR PNG 签名和尺寸、Tools SHA-256/UUID/Base64、IP JSON、Check 域名校验、Short/Paste 输入校验及 Meta 公开网页抓取。定时任务刻意不发起 Geo 查询，也不刷新 Nodes/Proxy 聚合源，避免周期性请求公共上游。健康探针和上游依赖状态分别报告。
5. **此前遗留的生产验证缺口已补验**：
   - QR：生产 /qr.png?data=AtlasEdgeKitAudit&size=256 直连返回 200 image/png，PNG 签名与 256×256 IHDR 尺寸均有效；云端 smoke 再次检查 160×160 PNG。
   - Meta：生产抓取 https://www.cloudflare.com/ 返回 HTTP 200、页面标题且 stale=false；云端 smoke 对 https://example.com/ 再次获取新鲜成功结果。网页采集器之前的 invalid_redirect_url 属于采集器解析问题，不是 Worker 返回的 Meta 错误。
   - Geo：以 Old Town Square, Prague, Czechia 做单次未命中缓存的生产查询，返回 cached=false、stale=false、6 条结果并带 © OpenStreetMap contributors。这证明此次 Geo 上游链路成功；后续定时巡检不重复触发上游。
6. **发布与版本**：私有仓库 StanlySGY/atlas-edge-kit 仍为 Private；源码提交 f0f997b6ac678f6164986b9ae299629d3571dd5a，随后仅升级 CI action 的提交 9137a6e0b9ab70ce8d090d4461874df34504489b。Cloudflare Worker Version 13：682429f4-67f4-479b-9872-368254ca7830，部署记录 646d0e11-ecf8-4b57-ae6e-075cc08f463a，API 确认 100% 流量。原 KV namespace 与 GEO_RATE_LIMITER Durable Object 绑定均保留。
7. **测试证据**：Worker npm run check 20/20 通过；npx wrangler deploy --dry-run 成功（107.45 KiB，gzip 25.80 KiB）；git diff --check 通过。云端 GitHub Actions 41019372484 与使用 Node 24 兼容 checkout@v7 / setup-node@v7 后的 41019561011 均成功；最终运行结果 29 项通过、0 项失败。

### 运维边界

- /healthz 只检查 Worker 是否响应；不能把它解释为所有外部源、KV 或 DO 均正常。
- Nodes / Proxy 上游可用性会变化，聚合缓存可在部分上游失败时继续提供可用数据；监控必须显示单源失败，不得把缓存命中等同于所有来源正常。
- Geo 只在用户触发时查询；继续保留全站一秒一请求的 Durable Object 限速、队列上限、缓存和 OpenStreetMap attribution。不得把实时 Geo 请求加到每日 smoke。
- Meta 仍不是任意 URL 代理；现有主机/IP/重定向校验不等于完整抵御 DNS rebinding。
- 根目录本地 HANDOVER.md 保持未跟踪，仅供私人 selfhost 交接，不提交到 FOSS-Atlas。
