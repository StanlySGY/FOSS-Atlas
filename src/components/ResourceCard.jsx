import { useState } from 'react'
import { Link } from 'react-router-dom'
import DeployedBadge from './DeployedBadge.jsx'
import { categoryColor, categorySoft } from '../lib/categoryColor.js'
import { hostFor, iconFor, initialFor } from '../lib/data.js'

/**
 * Site icon. Renders a lettered tile underneath and layers the favicon on top,
 * so a slow or 404 favicon degrades to something intentional instead of a
 * broken-image glyph. The tile carries its category's hue — the same colour the
 * category chip wears when active — so the grid reads by colour before text.
 */
function SiteIcon({ resource }) {
  const [failed, setFailed] = useState(false)
  const src = iconFor(resource)
  const tint = categorySoft(resource.category)
  const ring = `color-mix(in srgb, ${categoryColor(resource.category)} 38%, transparent)`
  return (
    <span
      style={{ background: tint, borderColor: ring }}
      className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[8px] border text-[13px] font-semibold transition-transform duration-150 group-hover:scale-105"
    >
      <span aria-hidden="true" style={{ color: categoryColor(resource.category) }}>
        {initialFor(resource)}
      </span>
      {!src || failed ? null : (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full rounded-[7px] object-contain p-1"
        />
      )}
    </span>
  )
}

export default function ResourceCard({ resource, index = 0 }) {
  const { id, name, url, description, tags, category, sub_category, sub_category_name } = resource
  const host = hostFor(resource)

  return (
    <article
      style={{ animationDelay: `${Math.min(index * 22, 260)}ms` }}
      className="fa-card-in fa-lift group relative flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--ink-card)] p-4 hover:bg-[var(--ink-card-hover)]"
    >
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
            <Link
              key={tag}
              to={`/?q=${encodeURIComponent(tag)}`}
              className="rounded-full bg-[var(--ink-tint)] px-2 py-0.5 text-[10px] text-[var(--text-dim)] transition-colors hover:bg-[var(--ink-tint-hover)] hover:text-[var(--accent)]"
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line-soft)] pt-3">
        <span className="flex min-w-0 items-center gap-2">
          {/*
           * The sub-category is a wayfinding link, not a caption: it opens the
           * catalogue narrowed to the same 分类 → 子类 slice, with the URL that
           * a breadcrumb on the wiki side can hand back.
           */}
          <Link
            to={`/?cat=${encodeURIComponent(category)}&sub=${encodeURIComponent(sub_category)}`}
            className="truncate text-[10px] text-[var(--text-faint)] transition-colors hover:text-[var(--accent)]"
          >
            {sub_category_name}
          </Link>
          <DeployedBadge resource={resource} to={`/deployed/#${(resource.instances?.[0]?.id) ?? ''}`} />
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
