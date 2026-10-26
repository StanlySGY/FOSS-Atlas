import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DeployedBadge from '../components/DeployedBadge.jsx'
import Markdown from '../components/Markdown.jsx'
import { backlinksFor } from '../lib/backlinks.js'
import { categoryColor, categoryRing, categorySoft } from '../lib/categoryColor.js'
import {
  DEPLOY_GROUP_LABEL,
  alternativesFor,
  hostFor,
  iconFor,
  initialFor,
  instancesFor,
  resourceById,
  relatedResources,
  resolveTarget,
  wikiSlugFor,
} from '../lib/data.js'
import { fetchWiki, headingsFromMarkdown, parseFrontmatter, stripLeadingChrome, transformWikilinks } from '../lib/wiki.js'
import { readWikiPrefill } from '../lib/wikiPrefill.js'

function fallbackMarkdown(resource) {
  return [
    `# ${resource.name}`,
    '',
    `> ${resource.description}`,
    '',
    '## 基本信息',
    '',
    `- **官网 / 仓库**：[${resource.url}](${resource.url})`,
    `- **分类**：${resource.category_name} → ${resource.sub_category_name}`,
    `- **标签**：${resource.tags.join(' · ')}`,
    '',
    '## 说明',
    '',
    '这个条目目前还没有独立的 Wiki 页面。上面的链接是官方地址，可以直接访问。',
    '',
    '想补充内容？欢迎到仓库提 PR，在 `public/wiki/` 下新增对应的 Markdown 文件即可。',
  ].join('\n')
}

/** Merge graph-derived alternatives with the wiki frontmatter list. */
function mergeAlternatives(id, fromFrontmatter) {
  const merged = []
  const seen = new Set()

  for (const item of alternativesFor(id)) {
    const key = item.name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }

  for (const name of fromFrontmatter) {
    const resolvedId = resolveTarget(name)
    // Skip anything that resolves back to this very page.
    if (resolvedId === id) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const resource = resolvedId ? resourceById.get(resolvedId) : null
    merged.push({
      id: resolvedId ?? `ext:${name}`,
      name: resource ? resource.name : name,
      url: resource ? resource.url : null,
      linkId: resolvedId ?? null,
    })
  }

  return merged
}

export default function WikiPage() {
  const { id } = useParams()
  const resource = resourceById.get(id)

  const slug = wikiSlugFor(id)
  /*
   * Seeded from the build when this page was prerendered (`readWikiPrefill`),
   * so the first client render reproduces the markup the reader is already
   * looking at instead of flashing `loading…`. Unseeded pages — any render
   * that did not come from a prerendered file — start empty and fetch.
   */
  const [fetched, setFetched] = useState(() => readWikiPrefill(id))

  useEffect(() => {
    if (!slug || readWikiPrefill(id)) return undefined
    let cancelled = false
    fetchWiki(slug).then((raw) => {
      if (cancelled) return
      if (!raw) {
        setFetched({ id, data: {}, content: null })
        return
      }
      const { data, content } = parseFrontmatter(raw)
      setFetched({ id, data, content })
    })
    return () => {
      cancelled = true
    }
  }, [id, slug])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [id])

  const loading = Boolean(slug) && fetched?.id !== id
  const hasWiki = Boolean(slug && fetched?.id === id && fetched.content)
  const data = !loading && fetched?.id === id ? fetched.data : {}
  const content = loading ? '' : hasWiki ? fetched.content : resource ? fallbackMarkdown(resource) : ''
  const isFallback = !loading && !hasWiki

  // The body's own `# Title` and its one-line `> summary` are dropped: the
  // header above already renders the title and the catalogue description, so
  // keeping them would print both twice.
  const rendered = useMemo(
    () => transformWikilinks(stripLeadingChrome(content), resolveTarget),
    [content],
  )

  // The article's own sections. On a phone the drawer lists tools, not sections,
  // so without this the only way to a late heading is one long scroll.
  const toc = useMemo(() => (isFallback ? [] : headingsFromMarkdown(rendered)), [rendered, isFallback])

  const related = useMemo(() => {
    const fromGraph = relatedResources(id)
    const seen = new Set(fromGraph.map((r) => r.id))
    return [...fromGraph, ...(data.related ?? [])
      .filter((x) => x !== id)
      .map((x) => resourceById.get(x))
      .filter((r) => r && !seen.has(r.id))]
  }, [id, data.related])

  const alternatives = useMemo(() => mergeAlternatives(id, data.alternatives ?? []), [id, data.alternatives])

  const tags = data.tags?.length ? data.tags : resource?.tags ?? []

  // Cheap: the index is a build artifact shipped with the bundle, so there is
  // nothing to fetch and no loading state to wait on.
  const backlinks = useMemo(
    () => backlinksFor(id).map((source) => resourceById.get(source)).filter(Boolean),
    [id],
  )

  // Stamped onto the catalogue record by the generator's join, so this never
  // disagrees with the 自部署服务 page or with the graph node.
  const instances = instancesFor(id)

  // 本页目录的当前节：IntersectionObserver 挑出视口顶部附近最近的标题，TOC
  // 给它点亮。只监听当前页的 slug，切页自动重建。
  const [activeHeading, setActiveHeading] = useState(null)
  useEffect(() => {
    if (!toc.length) return undefined
    const targets = toc.map((h) => document.getElementById(h.slug)).filter(Boolean)
    if (!targets.length) return undefined
    const visible = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        if (visible.size) {
          // 页面上最先出现的那一个：按文档顺序而不是 entry 顺序。
          const first = targets.find((t) => visible.has(t.id))
          if (first) setActiveHeading(first.id)
        }
      },
      {
        // rootMargin 只认 px / percent（rem 在这里会直接抛
        // "rootMargin must be specified in pixels or percent"，把整棵树炸掉）：
        // -72px ≈ 3.5rem 吸顶头部，-60% 把"当前节"压在视口上三分之一。
        rootMargin: '-72px 0px -60% 0px',
      },
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [toc])

  // 复制分享链接：落成「已复制 ✓」一秒半，不弹 toast 不打断阅读。
  const [copied, setCopied] = useState(false)
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 剪贴板被拒（非安全上下文等）：静默——按钮回到原样即可。 */
    }
  }

  if (!resource) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-dim)]">
          没有找到 id 为 <code className="mono text-[var(--accent)]">{id}</code> 的资源。
        </p>
        <Link to="/" className="text-sm text-[var(--accent)] hover:underline">
          ← 返回导航
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0 space-y-6 px-4 pb-10 pt-2 sm:px-6">
        {/*
         * Every crumb above the current page is a link into the catalogue,
         * pre-filtered to that slice — 分类 lands on its chips, 子类 on the
         * narrowed grid. The trail is a way back, not a caption.
         */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-faint)]">
          <Link to="/" className="transition-colors hover:text-[var(--text-strong)]">
            导航
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/?cat=${encodeURIComponent(resource.category)}`}
            className="transition-colors hover:text-[var(--text-strong)]"
          >
            {resource.category_name}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/?cat=${encodeURIComponent(resource.category)}&sub=${encodeURIComponent(resource.sub_category)}`}
            className="transition-colors hover:text-[var(--text-strong)]"
          >
            {resource.sub_category_name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--text-dim)]">{resource.name}</span>
        </nav>

        <header className="space-y-3 border-b border-[var(--line)] pb-5">
          <div className="flex items-center gap-3">
            <WikiIcon resource={resource} />
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
              {data.title ?? resource.name}
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-dim)]">{resource.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-[var(--radius-sm)] border border-[var(--accent)]/50 px-2.5 py-1 text-xs text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
            >
              访问官网 ↗
            </a>
            {data.repo ? (
              <a
                href={data.repo}
                target="_blank"
                rel="noreferrer"
                className="mono rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--text-dim)] transition-colors hover:border-[var(--line-strong)]"
              >
                源码仓库
              </a>
            ) : null}
            {data.license ? (
              <span className="mono rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--text-faint)]">
                {data.license}
              </span>
            ) : null}
            {instances.length ? (
              <DeployedBadge resource={resource} showGroups to={`/deployed/#${instances[0].id}`} />
            ) : null}
            <button
              type="button"
              onClick={copyLink}
              className="mono rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--text-faint)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-dim)]"
            >
              {copied ? '已复制 ✓' : '复制链接'}
            </button>
            {isFallback ? (
              <span className="mono rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--text-faint)]">
                暂无独立 Wiki
              </span>
            ) : null}
          </div>
        </header>

        {toc.length >= 3 ? (
          <nav
            aria-label="本页目录"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-[var(--line-soft)] py-2.5"
          >
            <span className="text-[11px] font-semibold text-[var(--text-faint)]">本页目录</span>
            {toc.map((h) => {
              const on = activeHeading === h.slug
              return (
                <button
                  key={h.slug}
                  type="button"
                  aria-current={on ? 'true' : undefined}
                  onClick={() => document.getElementById(h.slug)?.scrollIntoView({ block: 'start' })}
                  className={[
                    'text-[11px] transition-colors',
                    on
                      ? 'text-[var(--accent)]'
                      : h.level === 3
                        ? 'text-[var(--text-faint)] hover:text-[var(--accent)]'
                        : 'text-[var(--text-dim)] hover:text-[var(--accent)]',
                  ].join(' ')}
                >
                  {h.level === 3 ? `› ${h.text}` : h.text}
                </button>
              )
            })}          </nav>
        ) : null}

        {loading ? (
          <WikiSkeleton />        ) : (
          <Markdown>{rendered}</Markdown>
        )}

        {related.length ? (
          <section className="space-y-3 border-t border-[var(--line)] pt-6">
            <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-strong)]">图谱关联</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/wiki/${r.id}/`}
                  className="flex items-center justify-between gap-3 rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] px-3 py-2.5 transition-colors hover:border-[var(--line-strong)]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-[var(--text-strong)]">
                      {r.name}
                    </span>
                    <span className="block truncate text-[11px] text-[var(--text-faint)]">
                      {r.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-[var(--text-mute)]">→</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      {/* Hugs the right viewport edge: no right gutter beyond a modest pad. */}
      <aside className="space-y-5 px-4 pb-10 lg:sticky lg:top-[4.5rem] lg:self-start lg:pl-0 lg:pr-4">
        <Panel title="元数据">
          <dl className="space-y-2 text-xs">
            <Row label="分类" value={resource.category_name} />
            <Row label="子类" value={resource.sub_category_name} />
            {data.updated ? <Row label="更新" value={data.updated} /> : null}
            {data.license ? <Row label="许可" value={data.license} /> : null}
          </dl>
        </Panel>

        {tags.length ? (
          <Panel title="标签">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Link
                  key={t}
                  to={`/?q=${encodeURIComponent(t)}`}
                  className="rounded-[3px] bg-[var(--ink-tint)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)] hover:text-[var(--accent)]"
                >
                  {t}
                </Link>
              ))}
            </div>
          </Panel>
        ) : null}

        {/* "我的实例" mirrors the graph bubble's instance list from the other
            side: a node in the canvas and a page in the wiki are the same
            running service, and both now say so with the same group names.
            Only rendered when there is a deployment — the majority of entries
            are things being catalogued, not run. */}
        {instances.length ? (
          <Panel title="我的实例">
            <ul className="space-y-2 text-xs">
              {instances.map((i) => (
                <li key={i.id} className="min-w-0">
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[var(--text-strong)] underline decoration-[var(--line-strong)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
                  >
                    {i.url.replace(/^https?:\/\//, '')}
                  </a>
                  <p className="mono mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-[var(--text-faint)]">
                    <span className="text-[var(--own-text)]">{DEPLOY_GROUP_LABEL[i.group] ?? i.group}</span>
                    <span>{i.stack}</span>
                    {i.id !== id ? <span className="truncate">{i.id}</span> : null}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 border-t border-[var(--line-soft)] pt-2 text-[10px] text-[var(--text-faint)]">
              <Link to="/deployed/" className="text-[var(--own-text)] hover:underline">
                全部自部署服务 →
              </Link>
            </p>
          </Panel>
        ) : null}

        {alternatives.length ? (
          <Panel title="可替代">
            <ul className="space-y-1.5 text-xs">
              {alternatives.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <span className="text-[var(--text-faint)]">替代</span>
                  {a.linkId ? (
                    <Link to={`/wiki/${a.linkId}/`} className="text-[var(--text)] hover:text-[var(--accent)]">
                      {a.name}
                    </Link>
                  ) : a.url ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--text)] hover:text-[var(--accent)]"
                    >
                      {a.name} ↗
                    </a>
                  ) : (
                    <span className="text-[var(--text-dim)]">{a.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {/* Only rendered when it would carry information — an empty panel is
            pure visual noise on the majority of pages. */}
        {backlinks.length ? (
          <Panel title="反向链接">
            <div className="flex flex-wrap gap-1.5">
              {backlinks.map((r) => (
                <Link
                  key={r.id}
                  to={`/wiki/${r.id}/`}
                  className="rounded-[3px] border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </Panel>
        ) : null}

        <Link
          to={`/graph/?focus=${encodeURIComponent(id)}`}
          className="block rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] px-3 py-2.5 text-center text-xs text-[var(--text-dim)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
        >
          在知识图谱中查看 →
        </Link>

        {/*
         * This page is a file in the repo; the link goes straight to editing
         * it on GitHub, which is how the 手写深度页 ask for corrections.
         */}
        {hasWiki ? (
          <a
            href={`https://github.com/StanlySGY/FOSS-Atlas/edit/main/public/wiki/${slug}.md`}
            target="_blank"
            rel="noreferrer"
            className="block rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] px-3 py-2.5 text-center text-xs text-[var(--text-faint)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-dim)]"
          >
            在 GitHub 上编辑此页 ↗
          </a>
        ) : null}
      </aside>
    </div>
  )
}

/**
 * The resource's site icon, echoing the cards on the home page so a reader
 * recognises the same tool across views — including the category tint the card
 * wears. Falls back to a lettered tile.
 */
function WikiIcon({ resource }) {
  const [failed, setFailed] = useState(false)
  const src = iconFor(resource)
  return (
    <span
      title={hostFor(resource)}
      style={{ background: categorySoft(resource.category), borderColor: categoryRing(resource.category) }}
      className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[9px] border text-sm font-semibold"
    >
      <span aria-hidden="true" style={{ color: categoryColor(resource.category) }}>
        {initialFor(resource)}
      </span>
      {!src || failed ? null : (
        <img
          src={src}
          alt=""
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full rounded-[8px] object-contain p-1.5"
        />
      )}
    </span>
  )
}

function Panel({ title, children }) {
  return (
    <section className="rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] p-3.5">
      <h3 className="mb-2.5 text-[13px] font-semibold text-[var(--text-strong)]">{title}</h3>
      {children}
    </section>
  )
}

/** Body-sized placeholder bars while the markdown fetch lands. */
function WikiSkeleton() {
  const widths = ['w-3/4', 'w-full', 'w-11/12', 'w-5/6', 'w-2/3', 'w-full', 'w-4/5']
  return (
    <div aria-label="加载中" role="status" className="space-y-3.5 py-1">
      {widths.map((w, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 120}ms` }}
          className={`fa-skeleton h-3.5 rounded-[4px] bg-[var(--ink-tint)] ${w}`}
        />
      ))}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--text-faint)]">{label}</dt>
      <dd className="truncate text-right text-[var(--text)]">{value}</dd>
    </div>
  )
}
