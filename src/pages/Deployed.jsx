import { Link } from 'react-router-dom'
import deployed from '../data/deployed.json'
import { resourceById } from '../lib/data.js'

const STATUS_LABEL = {
  live: '已上线',
  pending: '部署中',
}

function StatusChip({ status }) {
  const live = status === 'live'
  return (
    <span
      className={[
        'mono shrink-0 rounded-[3px] px-1.5 py-0.5 text-[10px]',
        live
          ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
          : 'bg-[var(--ink-tint)] text-[var(--text-faint)]',
      ].join(' ')}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function ServiceRow({ item }) {
  const resource = resourceById.get(item.id)
  return (
    <li className="group flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5 transition-colors duration-150 hover:border-[var(--line-strong)] hover:bg-[var(--ink-card-hover)] sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sm font-semibold text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent)]"
          >
            {item.name}
          </a>
          <StatusChip status={item.status} />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">{item.desc}</p>
        <div className="mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-faint)]">
          <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
          <span>{item.stack}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {resource ? (
          <Link
            to={`/wiki/${item.id}`}
            className="text-[11px] text-[var(--text-faint)] transition-colors hover:text-[var(--text-strong)]"
          >
            Wiki
          </Link>
        ) : null}
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[var(--accent)] hover:underline"
        >
          访问 ↗
        </a>
      </div>
    </li>
  )
}

export default function Deployed() {
  const total = deployed.groups.reduce((n, g) => n + g.items.length, 0)
  const live = deployed.groups.reduce(
    (n, g) => n + g.items.filter((i) => i.status === 'live').length,
    0,
  )

  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-3 pt-2">
        <span className="mono inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--ink-raised)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Self-hosted · {live}/{total} live
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-[2rem]">
          自部署服务
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-dim)]">
          把图鉴里那些「能自己跑起来」的资源,真的部署成可访问的服务:知识库与静态站点放在
          <span className="text-[var(--text-strong)]"> Cloudflare 边缘</span>,
          上游仓库镜像交给 <span className="text-[var(--text-strong)]">GitHub Pages</span>,
          其余经 <span className="text-[var(--text-strong)]">cloudflared 隧道</span> 从本机 Docker
          暴露成 HTTPS 域名。所有地址都在 <span className="mono">{deployed.host}</span> 之下,
          更新于 {deployed.updated}。
        </p>
      </section>

      {deployed.groups.map((group) => (
        <section key={group.id} className="space-y-3">
          <div className="flex flex-col gap-1 border-b border-[var(--line-soft)] pb-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-strong)]">
              {group.name}
              <span className="mono ml-2 text-[11px] font-normal text-[var(--text-faint)]">
                {group.items.length}
              </span>
            </h2>
            <p className="text-[11px] text-[var(--text-faint)]">{group.note}</p>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
            {group.items.map((item) => (
              <ServiceRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ))}

      <section className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-sunken)] p-4">
        <h2 className="text-xs font-semibold text-[var(--text-strong)]">运维说明</h2>
        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-[var(--text-dim)]">
          <li>· Docker 编排文件与隧道配置存放在本机 <span className="mono">~/workspace/selfhost</span>,全部 <span className="mono">restart: unless-stopped</span>。</li>
          <li>· 隧道由用户级 systemd 服务 <span className="mono">foss-labs-tunnel.service</span> 常驻,开机自启;新增域名用 <span className="mono">cloudflared tunnel route dns</span> 注册。</li>
          <li>· Cloudflare 侧的静态站与知识库镜像用 <span className="mono">wrangler</span> 部署到 Workers/Pages,自定义域直接绑在同一个 zone 上。</li>
          <li>· 本页数据源 <span className="mono">src/data/deployed.json</span>;改完推送到 main,GitHub Pages 与 Cloudflare Pages 会各自自动重新发布。</li>
          <li>· 网页终端 <span className="mono">term</span> 走 HTTP Basic 密码保护;如需更强鉴权可挂 Cloudflare Access。</li>
          <li>· 边缘小工具 <span className="mono">short</span> / <span className="mono">paste</span> 是同一个 Worker(<span className="mono">atlas-edge-kit</span>)的两个自定义域,数据存 Cloudflare KV。</li>
          <li>· <span className="mono">vault</span> / <span className="mono">book</span> / <span className="mono">sgyyyds</span> / <span className="mono">hub</span> / <span className="mono">chat</span> 五项由另一条隧道 <span className="mono">cloudflared.service</span>(<span className="mono">/etc/cloudflared/config.yml</span>)承载,与 foss-labs 相互独立,改动互不影响。</li>
          <li>· 端口统一避开本机已占用的 3000/3001/3002/8222/9090 等,新增服务前先查占用。</li>
        </ul>
      </section>
    </div>
  )
}
