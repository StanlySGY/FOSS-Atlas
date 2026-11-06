# 实施计划

复杂度 L，风险中等。基线112 tests通过，四视图可运行。Antigravity inline分析已完成；Claude CLI及MCP都authentication_failed，不能声称双模型通过。

1. 主代理：Home.jsx 的检索层级、公开分类、用途搜索入口、收藏空态与分批数量；巡检维护移到下部折叠入口；整合比较组件并补浏览器验收。
2. 并行 worker comparison：仅 src/lib/resourceComparison.js、src/hooks/useResourceComparison.js、src/components/ResourceComparison.jsx、src/comparison.css、scripts/tests/resource-comparison.test.mjs。实现 URL+本地比较列表、原生dialog、具名托盘、详实的已有内容、分享失败降级；导出明确接口供主代理接入。
3. 并行 worker presentation：仅 src/redesign.css、src/components/ResourceCard.jsx。保留浅色品牌并改善首页字阶、控件与手机触控；列表与网格无溢出；新增首页入口class按约定支持。
4. 主代理：WikiPage复制反馈/手动链接；更新受重构影响的既有契约测试，增加有意义的回归，检验错误恢复。
5. 集成后 npm test/lint/build/views:check；刷新字体与OG（若字体/文案守卫要求）；真实浏览器320/390/768/1440视口、比较分享/导航/刷新/焦点/键盘/失败、收藏与搜索、Wiki、图谱与部署回归。
6. 双模型审查尝试：Antigravity与Claude并行；Claude仍不可用时记录原始认证失败与独立Codex复审结果。修复真实问题。
7. 记录证据/必要spec经验，任务归档。按用户AGENTS归档提交；不push或部署。HANDOVER.md为原有未跟踪私人文件，不纳入。

比较API：useResourceComparison(searchParams,setSearchParams,validIds) => { ids,toggle,remove,clear }，最多3条。组件 ResourceComparison({resources,onRemove,onClear,linkRows,linkFreshness})，内部控制开关和分享（query compare=id1,id2 + comparing=1；分享仅包含比较参数，避免个人收藏/搜索状态泄露）。原生dialog键盘、close锁滚动恢复，移动table内部横滚，标签可达。

首页class：fa-category-browser(常驻分类label/select与细分select)，fa-discovery-intents(按用途找短链接)，fa-catalog-maintenance(底部details)。所有新中文文本沿用字体构建流程。

浏览器新增发现：main.jsx剥离BASE_URL尾斜杠使首页筛选地址变为/FOSS-Atlas?cat=…，Vite静态预览404。范围增加main.jsx与prerender/entry.jsx统一保留目录basename末尾斜杠，SSR/客户端链接一致。浏览器必须验刷新。
