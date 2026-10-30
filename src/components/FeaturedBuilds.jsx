import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deployedStats, hostFor, iconFor, initialFor, resources } from '../lib/data.js'
import { featuredBuildsFrom } from '../lib/featuredBuilds.js'

const featured = featuredBuildsFrom(resources)

function BuildIcon({ resource }) {
  const [failed, setFailed] = useState(false)
  const src = iconFor(resource)

  return (
    <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[9px] border border-[var(--own-text)]/35 bg-[var(--own-well)] text-sm font-semibold text-[var(--own-text)]">
      <span aria-hidden="true">{initialFor(resource)}</span>
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full rounded-[8px] object-contain p-1.5"
        />
      ) : null}
    </span>
  )
}

export default function FeaturedBuilds() {
  if (!featured.length) return null

  return (
    <section aria-labelledby="featured-builds-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono rounded-[3px] border border-[var(--own-text)]/35 bg-[var(--own-well)] px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-[var(--own-text)]">
              BUILT HERE
            </span>
            <h2 id="featured-builds-title" className="text-sm font-semibold tracking-tight text-[var(--text-strong)]">
              Atlas 自建 · 精选服务
            </h2>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--text-faint)]">
            不只是收录开源工具，也把其中一部分做成自己部署、持续维护的在线服务。
          </p>
        </div>
        <Link
          to="/?cat=atlas"
          className="shrink-0 text-[11px] text-[var(--own-text)] transition-colors hover:text-[var(--text-strong)] hover:underline"
        >
          查看全部 {deployedStats.own} 项自建服务 →
        </Link>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
        {featured.map((resource) => (
          <article
            key={resource.id}
            className="flex w-[min(82vw,310px)] shrink-0 snap-start flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-3.5 transition-colors hover:border-[var(--own-text)]/45 hover:bg-[var(--ink-card-hover)] sm:w-auto"
          >
            <div className="flex min-w-0 items-center gap-3">
              <BuildIcon resource={resource} />
              <div className="min-w-0 flex-1">
                <Link to={`/wiki/${resource.id}/`} className="block truncate text-sm font-semibold text-[var(--text-strong)] transition-colors hover:text-[var(--own-text)]">
                  {resource.name}
                </Link>
                <p className="mono mt-0.5 truncate text-[10px] text-[var(--text-faint)]">{hostFor(resource)}</p>
              </div>
              <span className="mono shrink-0 rounded-[3px] border border-[var(--own-text)]/45 bg-[var(--own-well)] px-1.5 py-0.5 text-[9px] text-[var(--own-text)]">
                已部署
              </span>
            </div>

            <p className="min-h-[2.5rem] line-clamp-2 text-xs leading-relaxed text-[var(--text-dim)]">
              {resource.description}
            </p>

            <div className="flex min-h-5 flex-wrap items-center gap-1.5">
              <span className="rounded-[3px] bg-[var(--ink-tint)] px-1.5 py-1 text-[9px] text-[var(--text-faint)]">
                {resource.stack}
              </span>
              {resource.tags.filter((tag) => tag !== '自建').slice(0, 2).map((tag) => (
                <Link
                  key={tag}
                  to={`/?q=${encodeURIComponent(tag)}`}
                  className="rounded-[3px] bg-[var(--ink-tint)] px-1.5 py-1 text-[9px] text-[var(--text-faint)] transition-colors hover:text-[var(--accent-text)]"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line-soft)] pt-3">
              <Link to={`/wiki/${resource.id}/`} className="text-[10px] text-[var(--text-faint)] transition-colors hover:text-[var(--text-strong)]">
                技术说明 →
              </Link>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[4px] border border-[var(--own-text)]/45 bg-[var(--own-well)] px-2 py-1.5 text-[10px] font-medium text-[var(--own-text)] transition-colors hover:border-[var(--own-text)] hover:text-[var(--text-strong)]"
              >
                打开服务 ↗
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="text-right text-[10px] text-[var(--text-mute)] sm:hidden">横向滑动，浏览精选服务</p>
    </section>
  )
}
