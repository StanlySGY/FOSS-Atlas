# 审查记录 · foss-atlas-init

## 审查方式

- **CCG 双模型并行（antigravity + Claude）未能执行**：
  - `--backend antigravity` 需要交互式 Google OAuth，非交互环境无法完成登录（`authentication timed out`）。
  - `codeagent-wrapper --backend claude` 退出码 1（`claude exited with status 1`），未产出内容。
  - 参考：`claude -p --dangerously-skip-permissions` 直连 CLI 可用，本次审查即用它完成。
- **主验证手段是真实浏览器自动化**（codex-browser）：加载本地与线上构建产物，
  通过 DOM 断言 + canvas 像素扫描 + 合成点击验证交互链路。

## 已修问题（6 项，均由审查发现并验证修复）

| # | 级别 | 位置 | 问题 | 修复 |
| --- | --- | --- | --- | --- |
| 1 | Critical | `src/lib/data.js` `resolveTarget` | `key in ALIASES` 走原型链，`resolveTarget('constructor')` 返回 `Object` 构造函数（真值），会生成 `/wiki/function Object()…` 死链 | 改用 `Object.prototype.hasOwnProperty.call(ALIASES, key)` |
| 2 | Warning | `src/pages/WikiPage.jsx` `related` memo | frontmatter 的 `related` 未过滤自身；`cloudflare-workers.md` 的 `related` 含 `cloudflare` → 「相关工具」出现指向当前页的自链 | `.filter((x) => x !== id)` |
| 3 | Warning | `src/lib/wiki.js` `fetchWiki` | `fetch` 无 `catch`，网络失败 → unhandled rejection 且视图永久卡在 `loading…` | 加 `try/catch`，失败返回 `null` |
| 4 | Warning | `WikiPage.jsx` `alternatives` | frontmatter 的 `alternatives:` 字段全代码库无人读取，作者写的替代清单被静默丢弃 | 新增 `mergeAlternatives()`，与图谱边合并去重 |
| 5 | Warning | `WikiPage.jsx` backlinks | 面板标题「链接到」实际展示的是**本页出站**链接，语义相反 | 新增 `src/lib/backlinks.js`：抓取全部 wiki → 提取 `[[…]]` → 反转入边索引，展示真实反向链接 |
| 6 | Info | `WikiPage.jsx` `isFallback` | 404 / 空正文 / 仅有 frontmatter 三种状态被混为一谈 | 由 `fetchWiki` 返回 `null` 与否决定；`tags` 空数组时回退到资源标签 |

附带：`parseFrontmatter` 原先只支持内联数组，已补充 YAML 块列表（`key:` + `- item`）解析。

## 额外发现并修复（浏览器验证阶段）

| 位置 | 问题 | 修复 |
| --- | --- | --- |
| `src/components/Markdown.jsx` | react-markdown v10 向每个组件覆写注入 `node` prop，`{...props}` 展开后给全部 10 个 `<a>` 渲染出非法 `node="[object Object]"` 属性并触发 React DOM 警告 | 解构剔除 `node` |

## 验证证据（真实浏览器）

- 首页：165 张卡片、分类 Tab（自部署 → 49 条）、搜索「密码」→ 2 条（Vaultwarden / Passbolt）、`/?q=` 参数回填输入框
- URL 合规：165 条资源全部 `https://`，`nonHttps: 0`（本地与线上一致）
- Wiki：`/wiki/ollama` 10 条 `[[双链]]` 全部解析为站内路由；`/wiki/aria2`（无 wiki 文件）正确渲染兜底页
- 图谱：canvas 初始化正常；合成点击工具节点 → 跳转 `/wiki/codeium`；点击分类节点 → 侧栏列出 39 个工具
- 反向链接：`/wiki/dify`（无独立 wiki）显示反向链接 `Ollama`
- 原型链修复：`resolveTarget` 对 `constructor` / `toString` / `__proto__` / `valueOf` / `hasOwnProperty` 均返回 `null`，真实名称/别名/id 仍正确解析
- 线上站点：`/` 200、`/wiki/immich.md` 200、深链接经 `404.html` 正确交给前端路由渲染

## 已知限制

- GitHub Pages 对 SPA 深链接返回 HTTP 404 状态码（内容为应用本身，浏览器渲染正常）——
  这是 Pages 对 SPA 的固有限制，通过 `dist/404.html` 兜底解决可用性。
- 无头浏览器内置字体仅覆盖部分 CJK 字形，截图会显示少量缺字；这是截图工具的限制，
  线上在真实浏览器（PingFang SC / Microsoft YaHei）下渲染正常。

## 复验：外部服务节点可点击（commit d4c37bd）

- 部署：`gh run list` 显示 `d4c37bd` "fix(graph): make external service nodes clickable" → success（29s）
- 线上首页：165 张卡片（`codex-browser eval` 实测）
- 线上 `/wiki/nextcloud`：`h1=Nextcloud`，外链含 `https://drive.google.com`（替代品条目）
- 线上 `/graph`：canvas 渲染正常，图例含「26 个外部服务」「点击外部服务节点打开其官网」
- 部署产物核验：`assets/index-XA2xlv-a.js`（1,031,845 B）内含 `window.open(t.url`、`drive.google.com`、`ollama.com`
- 源码核验：`src/pages/GraphPage.jsx:31-33` 对 `node.type === 'external'` 走 `window.open(node.url, '_blank', 'noopener,noreferrer')`

结论：图谱外部节点点击跳转官网的修复已上线并通过线上复验。
