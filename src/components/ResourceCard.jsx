import { useState } from 'react'
import { Link } from 'react-router-dom'
import DeployedBadge from './DeployedBadge.jsx'
import { hostFor, iconFor, initialFor } from '../lib/data.js'

/**
 * Site icon. Renders a lettered tile underneath and layers the favicon on top,
 * so a slow or 404 favicon degrades to something intentional instead of a
 * broken-image glyph.
 */
function SiteIcon({ resource }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[6px] border border-[var(--line)] bg-[var(--ink-raised)] text-[13px] font-semibold text-[var(--text-faint)]">
      <span aria-hidden="true">{initialFor(resource)}</span>
      {failed ? null : (
        <img
          src={iconFor(resource)}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full rounded-[5px] bg-[var(--ink-raised)] object-contain p-1"
        />
      )}
    </span>
  )
}

export default function ResourceCard({ resource }) {
  const { id, name, url, description, tags, sub_category_name } = resource
  const host = hostFor(resource)

  return (
    <article className="group relative flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-4 transition-colors duration-150 hover:border-[var(--line-strong)] hover:bg-[var(--ink-card-hover)]">
      <div className="flex items-start gap-3">
        <SiteIcon resource={resource} />

        <div className="min-w-0 flex-1">
          <Link to={`/wiki/${id}/`} className="block">
            <h3 className="truncate text-sm font-semibold text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent)]">
              {name}
            </h3>
          </Link>
          <p className="mono mt-0.5 truncate text-[11px] text-[var(--text-faint)]">{host}</p>
        </div>
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-dim)]">{description}</p>

      {tags?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-[3px] bg-[var(--ink-tint)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line-soft)] pt-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[10px] text-[var(--text-faint)]">{sub_category_name}</span>
          <DeployedBadge resource={resource} />
        </span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[11px] text-[var(--accent)] hover:underline"
        >
          访问 ↗
        </a>
      </div>
    </article>
  )
}
