# FOSS-Atlas UI/UX 交接记录

> 最近更新：2026-10-29（Asia/Seoul）
> 范围：仅记录公开仓库 `StanlySGY/FOSS-Atlas` 的站点体验与交付状态，不替代私有 `selfhost` 运维交接文档。

## 当前状态

- `main` 最新提交：`16cc8ceac653e2b75f54828fd74f676f54483534`（`Polish catalogue filters and add graph list view`）。
- Cloudflare Pages：<https://atlas.sgyyyds.qzz.io/>；部署工作流 [40848258006](https://github.com/StanlySGY/FOSS-Atlas/actions/runs/40848258006) 成功。
- GitHub Pages：<https://stanlysgy.github.io/FOSS-Atlas/>；部署工作流 [40848258188](https://github.com/StanlySGY/FOSS-Atlas/actions/runs/40848258188) 成功。
- 最后一次工作区核对：`main` 与 `origin/main` 同步；根目录 `HANDOVER.md` 是未跟踪的私有 selfhost 交接副本，不属于此公开仓库的提交内容。

## 本轮已交付

1. **图谱双视图**：新增“图谱 / 列表”切换，通过 URL 参数 `view=list` 深链接；列表消费同一份图谱数据、当前可见节点集合和关系过滤，支持按名称、ID、分类、标签、域名及描述搜索。工具可跳转 Wiki，分类/子类可聚焦分类。列表模式铺满内容区并隐藏重复侧栏。
2. **首页筛选一致性**：URL 中 `q` 参数被移除时，搜索框同步清空；搜索覆盖分类名与子分类名；当前搜索、分类、子分类和已部署条件显示为可单独移除的筛选标签；“清除全部”和空结果页的“重置筛选”统一清空这些条件。
3. **生成产物同步**：重新生成中文字体子集与 4 张 OG 分享卡片，避免站点文案更新后分享卡片和字体覆盖旧数据。

## 验证证据

本地最终验证通过：

- `npm test`：7/7 通过。
- `npm run lint`：0 警告、0 错误。
- `npm run views:check`：全图 283 个节点；部署视图 106 个节点；11 个分类视图全部通过。
- `npm run build`：成功生成 189 个页面；OG 检查匹配当前数据（186 tools、643 edges、75 deployed resources、93 instances）。
- `git diff --check`：通过。

线上手动回归：两站均能打开 `?view=list&cat=ai`；列表搜索 `ollama` 后可打开 `/wiki/ollama/`；Cloudflare 上从列表切回图谱后 URL 会移除 `view=list` 并保留 `cat=ai`。两站抽查的 JS、CSS、字体、Wiki 资源请求均为 200，浏览器诊断未发现 console error/warning 或失败请求。首页组合筛选后点击“重置筛选”，已观察到返回干净的 `/` 地址，输入框清空，筛选标签消失。

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
