import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import deployed from '../data/deployed.json'
import { resourceById } from '../lib/data.js'

/*
 * A row's catalogue entry, resolved through the `resource` field the generator
 * insists on (see scripts/build-data.mjs). It is not always the row's own id: 13
 * GitHub docs mirrors carry a `-docs` id and point back at the tool they mirror,
 * 16 rows are another deployment of the same tool under their own name
 * (`shlink-web`, `hacktricks-gh`, `home`, `kb`, `ai`, `graph`, …) — 29 rows in all,
 * and the 12 Atlas-owned rows carry no `resource` at all because the minted record
 * uses their id. Going through this instead of `item.id` is what keeps the Wiki link
 * and the graph focus from being dead ends on those 29 rows.
 */
const resourceIdFor = (item) => item.resource ?? item.id
const graphUrlFor = (item) => `/graph/?deployed=1&focus=${encodeURIComponent(resourceIdFor(item))}`

const STATUS_LABEL = {
  live: '已上线',
  pending: '部署中',
}

/*
 * What the probe's own classification means for a row. 3xx and 4xx are not
 * failures: the tunnel carried the request and something answered it (Access, a
 * redirect to its own app, a 404 page). Only the edge-side and origin-side
 * connect failures name a link that did not carry.
 */
const unreachable = (cls) =>
  cls === '530/1033' || cls === '502' || cls === '504' || cls === 'transport' || String(cls).startsWith('5xx')

/** The snapshot `npm run probe -- --out dist/probe.json` shipped with this build. */
function useProbe() {
  const [probe, setProbe] = useState(null)
  useEffect(() => {
    let alive = true
    fetch(`${import.meta.env.BASE_URL}probe.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setProbe(d ?? null)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return probe
}

const utcStamp = (iso) => String(iso ?? '').slice(0, 16).replace('T', ' ')

/*
 * Three states, three plates, and each one's floor is measured rather than
 * assumed. 不可达 is the state a reader has to act on, so it gets its own well
 * (--down-well, 1.181:1 and ΔE76 20.6 from the card — the largest colour jump on
 * the page, which is the point) with --down-text words at 6.47:1 and a 70%
 * --down-text border at 4.01:1, a mark-grade line. 已上线 wears the accent: the
 * 70% border is 3.74:1 on the card and --accent-text on the 10% wash is 6.10:1.
 * 部署中 / no-snapshot is deliberately the plainest: --ink-tint is only 1.125:1
 * above the card (ΔE76 4.1) and --line on it 1.212, because an unknown state
 * must not compete for attention with a known failure; its --text-faint words
 * are 6.17:1, so it is quiet, not unreadable.
 */
function StatusChip({ status, result }) {
  const pending = status === 'pending'
  const down = !pending && result ? unreachable(result.cls) : false
  const neutral = pending || (!result && status !== 'live')
  return (
    <span
      className={[
        'mono shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10px]',
        down
          ? 'border border-[color-mix(in_srgb,var(--down-text)_70%,transparent)] bg-[var(--down-well)] text-[var(--down-text)]'
          : neutral
            ? 'border border-[var(--line)] bg-[var(--ink-tint)] text-[var(--text-faint)]'
            : 'border border-[var(--accent)]/70 bg-[var(--accent)]/10 text-[var(--accent-text)]',
      ].join(' ')}
      title={result ? `${result.cls}: ${result.note}` : undefined}
    >
      {down ? `不可达 ${result.code ?? result.cls}` : (STATUS_LABEL[status] ?? status)}
    </span>
  )
}

function ServiceRow({ item, result }) {
  const resourceId = resourceIdFor(item)
  const resource = resourceById.get(resourceId)
  return (
    /*
     * The row's own anchor: /deployed/#<id> is handed out by the graph bubble's
     * 自部署页 link and the card badges, and scroll-mt keeps it clear of the
     * sticky header when the browser jumps here.
     */
    <li
      id={item.id}
      className="group flex scroll-mt-20 flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5 transition-colors duration-150 hover:border-[var(--line-strong)] hover:bg-[var(--ink-card-hover)] sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-semibold text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent-text)]"
          >
            {item.name}
          </a>
          <StatusChip status={item.status} result={result} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">{item.desc}</p>
        <div className="mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-faint)]">
          <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
          <span>{item.stack}</span>
        </div>
      </div>

      {/* Two ways out of a row: the catalogue entry it belongs to, and the graph
          opened on that entry with the running-services subgraph already on.
          Both exist even for the 自建 rows, which the generator minted into the
          catalogue precisely so they would have a Wiki page and a node. */}
      <div className="flex shrink-0 items-center gap-3">
        {resource ? (
          <Link
            to={`/wiki/${resourceId}/`}
            className="text-[11px] text-[var(--text-faint)] transition-colors hover:text-[var(--text-strong)]"
          >
            Wiki
          </Link>
        ) : null}
        <Link
          to={graphUrlFor(item)}
          className="text-[11px] text-[var(--own-text)] transition-colors hover:text-[var(--text-strong)]"
        >
          在图谱中查看
        </Link>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[var(--accent-text)] hover:underline"
        >
          访问 ↗
        </a>
      </div>
    </li>
  )
}

export default function Deployed() {
  const probe = useProbe()
  const probeRows = probe?.rows ?? []
  const probeDown = probeRows.filter((r) => unreachable(r.cls))
  /*
   * The GitHub Pages mirror count, computed from the data instead of written
   * down. Scoped to the github group on purpose: the 运维 note below describes
   * the per-repo Actions schedules, and the two mirrors on the edge group
   * (hacktricks-cf, patt-cf) are Cloudflare Workers, so they are not part of
   * that story. A global mirror count would be 36.
   *
   * A deployed.json row has no `group` field of its own — the group is the section it
   * sits under, and `build-data.mjs` is what stamps it onto the catalogue instance.
   * So the count is taken per section, not by filtering a flat list on a field that
   * is not there (which yields 0, and 0 is the kind of wrong number that reads fine).
   */
  /*
   * Per-group reach, from the same snapshot the row chips use. Grouped because
   * a flat "50/81" hides the only diagnostic fact a reader can act on: which
   * kind of deployment is the one that is down. `worst` names the dominant
   * failure class once, instead of repeating it on every row.
   */
  const probeGroups = probeRows.length
    ? deployed.groups.map((g) => {
        const rows = probeRows.filter((r) => r.group === g.id)
        const down = rows.filter((r) => unreachable(r.cls))
        const counts = {}
        for (const r of down) counts[r.cls] = (counts[r.cls] ?? 0) + 1
        const worst = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
        return {
          id: g.id,
          name: g.name,
          total: rows.length,
          ok: rows.length - down.length,
          down: down.length > 0,
          worst: worst ? `${worst[0]} ×${worst[1]}` : null,
        }
      })
    : []

  const githubMirrors = deployed.groups
    .filter((g) => g.id === 'github')
    .reduce((n, g) => n + g.items.filter((i) => i.kind === 'mirror').length, 0)

  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-3 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-[2rem]">
          自部署服务
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-dim)]">
          把图鉴里那些「能自己跑起来」的资源,真的部署成可访问的服务:知识库与静态站点放在
          <span className="text-[var(--text-strong)]"> Cloudflare 边缘</span>,
          上游仓库镜像交给 <span className="text-[var(--text-strong)]">GitHub Pages</span>,
          其余经 <span className="text-[var(--text-strong)]">cloudflared 隧道</span> 从本机 Docker
          暴露成 HTTPS 域名。Cloudflare 与 Docker 服务在{' '}
          <span className="mono">{deployed.host}</span> 之下,GitHub Pages 镜像在各自的{' '}
          <span className="mono">tanlysgy.github.io/仓库名/</span> 路径下,更新于 {deployed.updated}。
        </p>
        {/*
         * 已上线 is a claim about the deployment list, not an observation. The
         * build-time probe is the observation: the same {total} URLs fetched from
         * the public internet when this build was published, one row per result
         * below. No snapshot, no line — a dev server has nothing to show.
         */}
        {probe ? (
          /*
           * The snapshot used to be one mono line at the bottom of the intro,
           * under a pill that said 81/81 live. When 31 of the 81 are not
           * reachable, that line is the most important thing on the page and it
           * was the smallest text on it. Now it is a block of its own, grouped
           * the way the sections below are grouped, because the failure has a
           * shape: it is the Docker tunnel, not "some services".
           */
          <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-sunken)] p-3.5">
            <p className="text-[13px] leading-relaxed text-[var(--text-dim)]">
              发布时从公网探测（{utcStamp(probe.ranAt)} UTC）：
              <span className="font-semibold text-[var(--text-strong)]">{probeRows.length - probeDown.length}</span>
              <span className="text-[var(--text-faint)]"> / {probeRows.length} 可达</span>
              {probeDown.length ? (
                <span className="font-semibold text-[var(--down-text)]"> · {probeDown.length} 不可达</span>
              ) : null}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
              {probeGroups.map((g) => (
                <li key={g.id} className="flex items-baseline gap-1.5">
                  <span className={g.down ? 'text-[var(--down-text)]' : 'text-[var(--text-dim)]'}>
                    {g.name}
                  </span>
                  <span className="mono text-[var(--text-faint)]">
                    {g.ok}/{g.total}
                    {g.worst ? ` · ${g.worst}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/*
       * A 部署分组 header wears no hue, and that is a measurement rather than an
       * omission. Everywhere else on the site a colour answers "which 分类", and
       * these three sections are not 分类 divisions — they are *where it runs*.
       * Counted from the shipped data: 16 rows on Cloudflare 边缘 spread over 4
       * categories (atlas 12, security 2, gear 1, selfhost 1), 34 on GitHub Pages
       * mirrors over 5 (selfhost 22, security 5, ai 4, gear 2, ebook 1), 40 on the
       * Docker tunnel over 3 (selfhost 31, gear 6, ai 3). The largest category is
       * 78% of the Docker group, so a single hue there would match most rows — and
       * that is exactly the trap: the header would read as a 分类 claim while six
       * gear rows and three ai rows sit underneath it, and the site has no colour
       * that means "edge" or "docker" in the first place. The group is stated by
       * its name and its note in type, and 自建 stays the page's one hue (the row
       * links, the badges) because that is the claim every row on this page
       * actually makes.
       */}
      {deployed.groups.map((group) => (
        <section key={group.id} className="space-y-3">
          <div className="flex flex-col gap-1 border-b border-[var(--line-soft)] pb-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-base font-semibold tracking-tight text-[var(--text-strong)]">
              {group.name}
              <span className="mono ml-2 text-[11px] font-normal text-[var(--text-faint)]">
                {group.items.length}
              </span>
            </h2>
            <p className="text-[11px] text-[var(--text-faint)]">{group.note}</p>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {group.items.map((item) => (
              <ServiceRow
                key={item.id}
                item={item}
                result={probeRows.find((r) => r.group === group.id && r.id === item.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-sunken)] p-4">
        <h2 className="text-[13px] font-semibold text-[var(--text-strong)]">运维说明</h2>
        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-[var(--text-dim)]">
          <li>· Docker 编排文件与隧道配置存放在本机 <span className="mono">~/workspace/selfhost</span>,全部 <span className="mono">restart: unless-stopped</span>。</li>
          <li>· 隧道由用户级 systemd 服务 <span className="mono">foss-labs-tunnel.service</span> 常驻,开机自启;新增域名用 <span className="mono">cloudflared tunnel route dns</span> 注册。</li>
          <li>· Cloudflare 侧的静态站与知识库镜像用 <span className="mono">wrangler</span> 部署到 Workers/Pages,自定义域直接绑在同一个 zone 上。</li>
          <li>· 本页数据源 <span className="mono">src/data/deployed.json</span>;改完推送到 main,GitHub Pages 与 Cloudflare Pages 会各自自动重新发布。</li>
          <li>· 每条的状态 chip 来自发布时跑的只读探测(<span className="mono">npm run probe -- --out dist/probe.json</span>),它说的是上一次发布那一刻从公网看到的结果,<b className="text-[var(--text-strong)]">不是实时监控</b>;530/1033 指隧道没接上云,502 指云接上了但源站没应答。</li>
          <li>· GitHub Pages 的 <span className="mono">{githubMirrors}</span> 个镜像仓库各自带自己的 <span className="mono">Atlas · …</span> workflow 和 <span className="mono">schedule</span>,不存在集中的调度仓库:<span className="mono">Atlas · sync upstream</span> 每天 03:23 UTC 拉上游,<span className="mono">Atlas · sync mirror</span> 每天 04:17 UTC 重建镜像内容,<span className="mono">Atlas · docs site</span> 每周一 04:37 UTC 重建文档站。</li>
          <li>· 网页终端 <span className="mono">term</span> 走 HTTP Basic 密码保护;如需更强鉴权可挂 Cloudflare Access。</li>
          <li>· 边缘小工具 <span className="mono">short</span> / <span className="mono">paste</span> 是同一个 Worker(<span className="mono">atlas-edge-kit</span>)的两个自定义域,数据存 Cloudflare KV。</li>
          <li>· <span className="mono">vault</span> / <span className="mono">book</span> / <span className="mono">sgyyyds</span> / <span className="mono">hub</span> / <span className="mono">chat</span> 五项由另一条隧道 <span className="mono">cloudflared.service</span>(<span className="mono">/etc/cloudflared/config.yml</span>)承载,与 foss-labs 相互独立,改动互不影响。</li>
          <li>· 端口统一避开本机已占用的 3000/3001/3002/8222/9090 等,新增服务前先查占用。</li>
          <li>· 后加的六项(<span className="mono">home</span> / <span className="mono">cloud</span> / <span className="mono">kb</span> / <span className="mono">matrix</span> / <span className="mono">auth</span> / <span className="mono">photos</span>)的域名在 <span className="mono">cloudflared-config.yml</span> 里排在 catch-all <span className="mono">http_status:404</span> 之前 —— 排在它之后的 hostname 永远匹配不到。</li>
          <li>· <span className="mono">kb</span> 的登录交给 <span className="mono">auth</span>:OIDC 的 scope 不是勾选项而是关联表,authentik 新建的 provider 默认一个 scope 都不带,<span className="mono">/application/o/userinfo/</span> 会回 403(Scope mismatch);已在 authentik 的库里给 Outline 挂上 <span className="mono">openid</span> / <span className="mono">profile</span> / <span className="mono">email</span> / <span className="mono">offline_access</span> 四个 managed scope mapping。</li>
          <li>· <span className="mono">kb</span> 的登录链路<strong>完成过、但单次不稳</strong>:脚本化的端到端(auth 侧成对 <span className="mono">login</span> + <span className="mono">authorize_application</span> 事件、kb 侧 <span className="mono">users.signin</span> 带 <span className="mono">service:"oidc"</span> 并 302 进 collection)跑通过多次,可同一批尝试里既有 6/6 全成也有 8/8 全败。失败分两种:Cloudflare 自己发的 <span className="mono">502</span>(隧道日志 <span className="mono">EOF originService=http://localhost:8104</span>,同窗口 <span className="mono">8106</span> 零次)与 kb 侧 <span className="mono">/?notice=auth-error</span>(容器内 <span className="mono">read ECONNRESET</span> / 取 <span className="mono">/application/o/userinfo/</span> 失败)。可疑的是 kb 出站到 <span className="mono">auth</span> 这一腿要 hairpin 绕回同一条隧道;试过把 cloudflared 的 <span className="mono">originRequest.keepAliveTimeout</span> 压到 kb 里 Node 的 <span className="mono">keepAliveTimeout</span> 之下,A/B 看不出收益,已回退。<strong>遇到 502 或 auth-error 先重试一次</strong>,别当成服务挂了。</li>
          <li>· <span className="mono">auth</span> 的 worker 原本按上游 compose 以 <span className="mono">user: root</span> 直挂 <span className="mono">/var/run/docker.sock</span>(等价于宿主 root);上游文档 <span className="mono">docs.goauthentik.io</span> 自己把这个挂载写成「comes with some inherent security risks」并建议换 Docker Socket Proxy。<span className="mono">2026-10-28</span> 已换:compose 里多了一个 <span className="mono">authentik-socket-proxy</span>,worker 的 socket 挂载删掉(容器内 <span className="mono">/var/run/docker.sock</span> 已确认不存在),只靠 <span className="mono">DOCKER_HOST=tcp://authentik-socket-proxy:2375</span> 到达 daemon。代理只放行 <span className="mono">CONTAINERS</span> / <span className="mono">IMAGES</span> / <span className="mono">INFO</span> 三族的 GET,<span className="mono">POST</span> 保持关。<b>代价:</b>以后要在 authentik 里建真 Outpost(独立 proxy / LDAP / RADIUS / RAC)会失败,因为那要 POST;当前库里唯一的 outpost 是 <span className="mono">outposts/embedded</span> 且没有 service connection,所以现在没有在跑的功能依赖它。细节与实测记在 compose 注释里。</li>
          <li>· 管理员凭据只写在仓库内被 gitignore 的 <span className="mono">data/credentials.md</span>(mode 600),不进 compose、不进本页。Matrix 的注册已关,新账号只能在容器内用 <span className="mono">register_new_matrix_user</span> 开,而那需要 <span className="mono">registration_shared_secret</span> —— 部署完已从 <span className="mono">homeserver.yaml</span> 移除。</li>
          <li>· <span className="mono">photos</span> 的模型下载改写 <span className="mono">HF_ENDPOINT=https://hf-mirror.com</span>(直连 huggingface.co 不通);server 显式指向自己的 redis 与机器学习容器,不靠默认名。</li>
          <li>· <span className="mono">im</span>(Element 网页客户端)在跑,但图鉴没有 <span className="mono">element</span> 这个资源,而 deployed.json 的非 <span className="mono">own</span> 行必须挂在一个已有资源上,所以它只有容器、没有行。</li>
          <li>· <span className="mono">team</span>(Mattermost Team Edition)的登录接口读的是 <span className="mono">props["login_id"]</span> 而不是 <span className="mono">login</span> —— 上游 <span className="mono">api4/user.go</span> 与 <span className="mono">app/login.go</span> 的 <span className="mono">AuthenticateUserForLogin(id, loginId, …)</span> 就是按这两个字段取的,脚本里写成 <span className="mono">login</span> 会得到 401 和一条 <span className="mono">login_id=</span> 为空的审计记录。管理账号是用 <span className="mono">mmctl --local</span> 在容器内建的: <span className="mono">MM_SERVICESETTINGS_ENABLELOCALMODE=true</span> 让本机管理接口常开, 代价是 <span className="mono">/var/tmp/mattermost_local.socket</span> 这个套字只在容器内可访问、且谁能在容器里执行 <span className="mono">mmctl</span> 谁就是管理员;容器没有 shell, 所以脚本只能 <span className="mono">docker exec sh-mattermost /mattermost/bin/mmctl --config /mattermost/config/config.json …</span>。注册与开放注册都用 <span className="mono">ENABLEUSERCREATION=false</span> / <span className="mono">ENABLEOPENSERVER=false</span> 关掉了。</li>
          <li>· <span className="mono">graph</span> 的多用户代码执行风险是上游自己在启动日志里报的:多用户模式(<span className="mono">AUTO_LOGIN=false</span>)下 custom component 的代码是在服务进程里 exec 的,任何非管理员用户都能在这台机器上跑任意代码(<span className="mono">docs.langflow.org/deployment-block-custom-components#multi-user-code-execution</span>)。这里两把锁都上:<span className="mono">ALLOW_CUSTOM_COMPONENTS=false</span> 只让内置组件跑、<span className="mono">CUSTOM_COMPONENT_ADMIN_ONLY=true</span> 只让管理员写组件代码,并且 <span className="mono">ALLOW_COMPONENTS_PATHS_OVERRIDE=false</span> —— 上游文档写明 <span className="mono">LANGFLOW_COMPONENTS_PATH</span> 本身就是绕过前一把锁的口子。<span className="mono">SANDBOX_BACKEND</span> 保持 <span className="mono">none</span>:上游说它只隔离 Python Interpreter 与旧 REPL 组件,不隔离 custom component 代码,不能当这两把锁的替代。另外 <span className="mono">CORS</span> 默认是 <span className="mono">*</span> 加 credentials(上游自己会降级并警告),这里显式只允许自己的域名;遥测默认往 <span className="mono">api.segment.io</span> 发,<span className="mono">LANGFLOW_DO_NOT_TRACK=true</span> 关掉。sqlite 库默认落在镜像的 <span className="mono">site-packages</span> 里、换镜像即丢,已用 <span className="mono">SAVE_DB_IN_CONFIG_DIR=true</span> 连同自动生成的 <span className="mono">secret_key</span> 一起挪进 bind 卷。</li>
          <li>· 这轮补上的 <span className="mono">ai</span>(Dify)与 <span className="mono">graph</span>(Langflow)各有一条内存实测,记在这里免得下次又靠猜:<span className="mono">dify</span> 那 14 个容器合计常驻 290 MiB(单个最大 49 MiB),上游 compose 那 13 个不带 profile 的服务并不贵,<span className="mono">langflow</span> 是真贵 —— 单容器常驻 1.25 GiB、cgroup 峰值顶到 1.5 GiB,<span className="mono">--memory 768m</span> 时它绑不住 7860 端口(RSS 钉在 767.9 MiB 还在跑 alembic),所以 <span className="mono">mem_limit</span> 与 <span className="mono">memswap_limit</span> 都写 1536m 且取相同值:本机交换已用 15/16 GiB,不给它靠交换分区躲过去。</li>
          <li>· 图鉴里还有 <b className="text-[var(--text-strong)]">19 个条目只有镜像、没有实例行</b>,其中 7 个是纯文档与清单(见本段末尾),另外 12 个是这轮决定不上的:<span className="mono">cowrie</span> / <span className="mono">dionaea</span> / <span className="mono">hfish</span> / <span className="mono">T-Pot</span> 要对外开几十个 TCP 加 UDP 端口, <span className="mono">rustdesk</span> 要 21115-21119 TCP 加 21116 UDP —— 这台机器的 IPv4 出口在运营商 NAT 之后 (<span className="mono">--noproxy</span> 直连探测给 <span className="mono">115.60.183.119</span>,ipinfo 落到 <span className="mono">AS4837</span> 联通骨干;本机 LAN 地址是 DHCP 给的,不写死),回探这个地址上已经绑到 <span className="mono">0.0.0.0</span> 的 8101/8103 一律不应答,IPv6 侧只有 tailscale 的 <span className="mono">fd7a:115c:a1e0::/64</span> 私有段、没有可路由的公网前缀;这条隧道又只有 HTTPS 入口,本地 <span className="mono">cloudflared access</span> 的子命令是 <span className="mono">tcp</span> / <span className="mono">rdp</span> / <span className="mono">ssh</span> / <span className="mono">smb</span>,没有 UDP。蜜罐的镜像其实能拉(<span className="mono">cowrie/cowrie</span> 已在本地), 拒绝它只剩端口这一条;只有 <span className="mono">HFish</span> 连镜像都没有(Hub 上 <span className="mono">hacklcx/hfish</span> 404)。<span className="mono">1panel</span> 在 Hub 上没有镜像(<span className="mono">1panel/1panel</span> 404),它本来以宿主二进制发行(<span className="mono">resource.1panel.pro/v2/quick_start.sh</span> 已下载核对),且与 <span className="mono">heimdall</span> / <span className="mono">homarr</span> 重叠;<span className="mono">wetty</span> 的 <span className="mono">wettyoss/terminal</span> 也不存在(404),真实镜像 <span className="mono">butlerx/wetty</span> 能拉,但它自己的 <span className="mono">--help</span> 要求 <span className="mono">--sshuser</span> / <span className="mono">--sshpass</span> —— 等于把宿主账号交给一个 web 终端,而 <span className="mono">term</span> 已经在跑同一件事。<span className="mono">nginx-proxy-manager</span> 的镜像能拉,建管理员也<strong>能</strong>无人值守(这轮实测过,原先记在这里的理由是错的):2.16.0 的 <span className="mono">setup.js</span> 在 <span className="mono">isSetup()</span> 为假时放行一个不带凭据的 <span className="mono">POST /api/users</span> 并强制授予 <span className="mono">admin</span>(实测 201,第二次 403),另一条路是 <span className="mono">INITIAL_ADMIN_EMAIL</span> / <span className="mono">INITIAL_ADMIN_PASSWORD</span> 种子(默认值不会被创建,实测 400)。真正不上它的原因是:它没有任何 cloudflared 已经给不到的能力,却要长期在 81 端口挂一个管理面板,而且建号之前的那段窗口本身就是这台机器上一个未认证的入口;附带一条坑 —— 它启动时先抓 AWS IP 段,没有出口就一直卡住,要 <span className="mono">IP_RANGES_FETCH_ENABLED=false</span> 才起得来。<span className="mono">sing-box</span> / <span className="mono">trojan-go</span> 是出口代理,把这台机器变成中继不是这次要建的东西。剩下两项是 <span className="mono">ai</span>:<span className="mono">promptfoo</span> 走 npm/CLI(没有官方镜像,Hub 404 ×2),没有服务可部署;<span className="mono">llamaindex</span> 是框架,Hub 上 <span className="mono">llamaindex</span> 名下只有 LlamaCloud 的托管组件。另有七项(<span className="mono">gtfobins</span> / <span className="mono">lolbas</span> / <span className="mono">free-programming-books</span> / <span className="mono">awesome-selfhosted</span> / <span className="mono">awesome-hacking</span> / <span className="mono">hacktricks</span> / <span className="mono">payloadsallthethings</span>)是纯文档与清单,它们的「部署」就是已经在那里的静态镜像,给它们编一个实例行就是造假。</li>
        </ul>
      </section>
    </div>
  )
}
