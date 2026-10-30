# FOSS-Atlas UI/UX 交接记录

> 最近更新：2026-10-30（Asia/Taipei）
> 范围：仅记录公开仓库 `StanlySGY/FOSS-Atlas` 的站点体验与交付状态，不替代私有 `selfhost` 运维交接文档。

## 当前状态

- `main` 最近一次功能提交：`2cd7b9fc9c46adec227adc9a2b2db1e408161ad2`（`feat: add featured Atlas builds to homepage`）；本轮只增加自建精选展示与首页发现提示，没有改变资源 / Wiki / 图谱数据模型。
- Cloudflare Pages：<https://atlas.sgyyyds.qzz.io/>；本轮部署工作流 [40986819167](https://github.com/StanlySGY/FOSS-Atlas/actions/runs/40986819167) 成功，线上首页已核验出现「Atlas 自建 · 精选服务」与四张精选卡片。
- GitHub Pages：<https://stanlysgy.github.io/FOSS-Atlas/>；本轮部署工作流 [40986819161](https://github.com/StanlySGY/FOSS-Atlas/actions/runs/40986819161) 成功，线上首页已核验出现同一精选区。
- 本轮功能提交推送后，`main` 与 `origin/main` 同步；根目录 `HANDOVER.md` 仍是本地私有 selfhost 交接副本，不属于此公开仓库的提交内容。

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
