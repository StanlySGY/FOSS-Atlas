import { Link } from 'react-router-dom'

export default function ResourceCard({ resource }) {
  const { id, name, url, description, tags, sub_category_name, wiki } = resource
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  })()

  return (
    <article className="group relative flex flex-col gap-3 rounded-[6px] border border-[#23282a] bg-[#101314] p-4 transition-colors hover:border-[#3a4245]">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/wiki/${id}`} className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-neutral-100 group-hover:text-[#f0b429]">
            {name}
          </h3>
        </Link>
        {wiki ? (
          <span
            title="有 Wiki 页面"
            className="mono shrink-0 rounded-[3px] border border-[#f0b429]/40 px-1.5 py-0.5 text-[10px] text-[#f0b429]"
          >
            wiki
          </span>
        ) : null}
      </div>

      <p className="line-clamp-2 text-xs leading-relaxed text-neutral-400">{description}</p>

      {tags?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-[3px] bg-[#171b1c] px-1.5 py-0.5 text-[10px] text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#1c2123] pt-3">
        <span className="mono truncate text-[11px] text-neutral-500">{host}</span>
        <div className="flex shrink-0 items-center gap-2 text-[11px]">
          <Link to={`/wiki/${id}`} className="text-neutral-400 hover:text-neutral-100">
            详情
          </Link>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[#f0b429] hover:underline"
          >
            访问 ↗
          </a>
        </div>
      </div>

      <span className="pointer-events-none absolute right-3 top-3 hidden text-[10px] text-neutral-600 group-hover:block">
        {sub_category_name}
      </span>
    </article>
  )
}
