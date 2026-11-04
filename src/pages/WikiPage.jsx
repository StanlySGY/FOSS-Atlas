import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DeployedBadge from '../components/DeployedBadge.jsx'
import Markdown from '../components/Markdown.jsx'
import OfferingPanel from '../components/OfferingPanel.jsx'
import RepositoryPanel from '../components/RepositoryPanel.jsx'
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
  resources,
  wikiSlugFor,
} from '../lib/data.js'
import { fetchWiki, headingsFromMarkdown, parseFrontmatter, stripLeadingChrome, transformWikilinks } from '../lib/wiki.js'
import { readWikiPrefill } from '../lib/wikiPrefill.js'
import { presentWikiMarkdown } from '../lib/wikiPresentation.js'
import { PageHeader } from '../components/PageHeader.jsx'

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

  // Keep the actionable steps / API examples / cautions visible while moving
  // generic feature and scenario lists into a progressive-disclosure section.
  const { overviewMarkdown, practicalMarkdown, hasActionableGuide } = useMemo(
    () => presentWikiMarkdown(rendered, !isFallback && data.generated === 'true'),
    [rendered, isFallback, data.generated],
  )

  // Only headings in the visible reading flow are indexed; collapsed background
  // sections never create dead TOC jumps.
  const toc = useMemo(
    () => (isFallback ? [] : headingsFromMarkdown(practicalMarkdown)),
    [practicalMarkdown, isFallback],
  )

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

  // Keep reading order inside the same subcategory. A next/previous link is a
  // useful continuation; jumping across unrelated categories is not.
  const readingSequence = useMemo(
    () => resources.filter((item) => item.category === resource?.category && item.sub_category === resource?.sub_category),
    [resource?.category, resource?.sub_category],
  )
  const readingIndex = readingSequence.findIndex((item) => item.id === id)
  const previousResource = readingIndex > 0 ? readingSequence[readingIndex - 1] : null
  const nextResource = readingIndex >= 0 ? readingSequence[readingIndex + 1] ?? null : null

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
        // -112px accounts for the sticky site header plus the compact sticky TOC.
        rootMargin: '-112px 0px -60% 0px',
      },
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [toc])

  const articleRef = useRef(null)
  const [readingProgress, setReadingProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const article = articleRef.current
      if (!article) return
      const rect = article.getBoundingClientRect()
      const articleTop = window.scrollY + rect.top
      const distance = Math.max(1, rect.height - window.innerHeight)
      const next = Math.round(Math.min(100, Math.max(0, (window.scrollY - articleTop) / distance * 100)))
      setReadingProgress((current) => current === next ? current : next)
    }
    let frame = 0
    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }
    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [id, practicalMarkdown, overviewMarkdown])

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
          没有找到 id 为 <code className="mono text-[var(--accent-text)]">{id}</code> 的资源。
        </p>
        <Link to="/" className="text-sm text-[var(--accent-text)] hover:underline">
          ← 返回导航
        </Link>
      </div>
    )
  }

  return (
    <div className="fa-wiki-content-grid">
      <article ref={articleRef} className="min-w-0 space-y-6 py-2">
        <div
          className="fa-wiki-reading-progress"
          role="progressbar"
          aria-label="阅读进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readingProgress}
          aria-valuetext={`已阅读 ${readingProgress}%`}
        >
          <span style={{ width: `${readingProgress}%` }} />
        </div>
        {/*
         * Every crumb above the current page is a link into the catalogue,
         * pre-filtered to that slice — 分类 lands on its chips, 子类 on the
         * narrowed grid. The trail is a way back, not a caption.
         */}
        <nav className="fa-breadcrumb flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-faint)]">
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

        <PageHeader
          className="fa-page-header--wiki"
          title={(
            <>
              <WikiIcon resource={resource} />
              <span>{data.title ?? resource.name}</span>
            </>
          )}
          description={resource.description}
          actions={(
            <>
              <a href={resource.url} target="_blank" rel="noreferrer" className="fa-control fa-control--primary">
                访问官网 ↗
              </a>
              {data.repo ? (
                <a href={data.repo} target="_blank" rel="noreferrer" className="fa-control mono">
                  源码仓库
                </a>
              ) : null}
              {data.license ? <span className="fa-control mono">{data.license}</span> : null}
              {instances.length ? <DeployedBadge resource={resource} showGroups to={'/deployed/#' + instances[0].id} /> : null}
              <button type="button" onClick={copyLink} className="fa-control mono">
                {copied ? '已复制 ✓' : '复制链接'}
              </button>
              {isFallback ? <span className="fa-control mono">暂无独立 Wiki</span> : null}
            </>
          )}
        />

        <OfferingPanel resourceId={id} />

        {data.generated === 'true' && !hasActionableGuide ? (
          <p className="rounded-[6px] border border-[var(--line-soft)] bg-[var(--ink-card)] px-3.5 py-3 text-xs leading-relaxed text-[var(--text-faint)]">
            <span className="font-semibold text-[var(--text-dim)]">上手提示：</span>
            目前整理的是功能与适用场景概览，尚无经过整理的逐步操作或 API 示例。可先打开官方入口，核对注册资格、权限、价格和使用条款。
          </p>
        ) : null}

        {overviewMarkdown ? (
          <details className="fa-disclosure fa-surface px-3.5 py-3 sm:px-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--text-strong)]">展开功能特点与适用场景</summary>
            <div className="mt-3 border-t border-[var(--line-soft)] pt-2">
              <Markdown>{overviewMarkdown}</Markdown>
            </div>
          </details>
        ) : null}

        <RepositoryPanel resourceId={id} />

        {toc.length >= 3 ? (
          <details className="fa-wiki-toc-compact">
            <summary>本页目录 <span>{toc.length} 个章节</span></summary>
            <nav aria-label="本页目录（移动与窄屏）" className="mt-2">
              <ol className="space-y-1.5">
                {toc.map((h) => (
                  <li key={h.slug} className={h.level === 3 ? 'pl-3' : ''}>
                    <a href={`#${h.slug}`} aria-current={activeHeading === h.slug ? 'location' : undefined} className={activeHeading === h.slug ? 'is-active' : ''}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        ) : null}

        {loading ? (
          <WikiSkeleton />
        ) : practicalMarkdown ? (
          <Markdown>{practicalMarkdown}</Markdown>
        ) : null}

        {related.length ? (
          <details className="fa-disclosure border-t border-[var(--line)] pt-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--text-strong)]">图谱关联与相近资源（{related.length}）</summary>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={'/wiki/' + r.id + '/'}
                  className="flex items-center justify-between gap-3 rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] px-3 py-2.5 transition-colors hover:border-[var(--line-strong)]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-[var(--text-strong)]">{r.name}</span>
                    <span className="block truncate text-[11px] text-[var(--text-faint)]">{r.description}</span>
                  </span>
                  <span className="shrink-0 text-[var(--text-mute)]">→</span>
                </Link>
              ))}
            </div>
          </details>
        ) : null}

        {previousResource || nextResource ? (
          <nav className="fa-wiki-page-nav" aria-label="继续阅读">
            <span className="fa-wiki-page-nav-heading">继续阅读 <span>同一细分领域</span></span>
            <div className="fa-wiki-page-nav-links">
              {previousResource ? (
                <Link to={`/wiki/${previousResource.id}/`} className="fa-wiki-page-nav-link">
                  <span>← 上一篇</span>
                  <strong>{previousResource.name}</strong>
                </Link>
              ) : <span className="fa-wiki-page-nav-placeholder">已是本组第一篇</span>}
              {nextResource ? (
                <Link to={`/wiki/${nextResource.id}/`} className="fa-wiki-page-nav-link is-next">
                  <span>下一篇 →</span>
                  <strong>{nextResource.name}</strong>
                </Link>
              ) : <span className="fa-wiki-page-nav-placeholder is-next">已是本组最后一篇</span>}
            </div>
          </nav>
        ) : null}
      </article>

      {/* Hugs the right viewport edge: no right gutter beyond a modest pad. */}
      <aside className="fa-wiki-meta pb-8 pt-2">
        {toc.length >= 3 ? (
          <Panel title="本页目录" className="fa-wiki-page-toc-panel">
            <nav aria-label="本页目录（桌面）" className="fa-wiki-toc-list">
              <ol className="space-y-1">
                {toc.map((h) => (
                  <li key={h.slug} className={h.level === 3 ? 'pl-3' : ''}>
                    <a href={`#${h.slug}`} aria-current={activeHeading === h.slug ? 'location' : undefined} className={activeHeading === h.slug ? 'is-active' : ''}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Panel>
        ) : null}
        <Panel title="元数据">
          <dl className="space-y-2 text-xs">
            <Row label="分类" value={resource.category_name} />
            <Row label="子类" value={resource.sub_category_name} />
            {data.updated ? <Row label="更新" value={data.updated} /> : null}
            {data.license ? <Row label="许可" value={data.license} /> : null}
          </dl>
        </Panel>

        {(tags.length || instances.length || alternatives.length || backlinks.length || hasWiki) ? (
          <details className="fa-disclosure fa-surface p-3.5">
            <summary className="cursor-pointer text-[13px] font-semibold text-[var(--text-strong)]">
              更多信息与关联
              <span className="ml-2 text-[10px] font-normal text-[var(--text-faint)]">
                {[tags.length ? `${tags.length} 个标签` : null, instances.length ? `${instances.length} 个实例` : null, alternatives.length ? `${alternatives.length} 个替代项` : null, backlinks.length ? `${backlinks.length} 个反向链接` : null].filter(Boolean).join(' · ') || '编辑此页'}
              </span>
            </summary>
            <div className="mt-3 space-y-4 border-t border-[var(--line-soft)] pt-3">
              {tags.length ? (
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold text-[var(--text-dim)]">标签</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Link key={t} to={`/?q=${encodeURIComponent(t)}`} className="rounded-[3px] bg-[var(--ink-tint)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)] hover:text-[var(--accent-text)]">
                        {t}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {instances.length ? (
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold text-[var(--text-dim)]">我的实例</h3>
                  <ul className="space-y-2 text-xs">
                    {instances.map((i) => (
                      <li key={i.id} className="min-w-0">
                        <a href={i.url} target="_blank" rel="noreferrer" className="block truncate text-[var(--text-strong)] underline decoration-[var(--line-strong)] underline-offset-2 transition-colors hover:text-[var(--accent-text)]">
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
                    <Link to="/deployed/" className="text-[var(--own-text)] hover:underline">全部自部署服务 →</Link>
                  </p>
                </section>
              ) : null}

              {alternatives.length ? (
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold text-[var(--text-dim)]">可替代</h3>
                  <ul className="space-y-1.5 text-xs">
                    {alternatives.map((a) => (
                      <li key={a.id} className="flex items-center gap-2">
                        <span className="text-[var(--text-faint)]">替代</span>
                        {a.linkId ? <Link to={`/wiki/${a.linkId}/`} className="text-[var(--text)] hover:text-[var(--accent-text)]">{a.name}</Link>
                          : a.url ? <a href={a.url} target="_blank" rel="noreferrer" className="text-[var(--text)] hover:text-[var(--accent-text)]">{a.name} ↗</a>
                            : <span className="text-[var(--text-dim)]">{a.name}</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {backlinks.length ? (
                <section>
                  <h3 className="mb-2 text-[11px] font-semibold text-[var(--text-dim)]">反向链接</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {backlinks.map((r) => (
                      <Link key={r.id} to={`/wiki/${r.id}/`} className="rounded-[3px] border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)] hover:border-[var(--accent)]/50 hover:text-[var(--accent-text)]">
                        {r.name}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {hasWiki ? (
                <a href={`https://github.com/StanlySGY/FOSS-Atlas/edit/main/public/wiki/${slug}.md`} target="_blank" rel="noreferrer" className="block border-t border-[var(--line-soft)] pt-3 text-xs text-[var(--text-faint)] transition-colors hover:text-[var(--text-dim)]">
                  在 GitHub 上编辑此页 ↗
                </a>
              ) : null}
            </div>
          </details>
        ) : null}

        <Link
          to={`/graph/?focus=${encodeURIComponent(id)}`}
          className="block rounded-[6px] border border-[var(--line)] bg-[var(--ink-card)] px-3 py-2.5 text-center text-xs text-[var(--text-dim)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent-text)]"
        >
          在知识图谱中查看 →
        </Link>

        {/*
         * This page is a file in the repo; the link goes straight to editing
         * it on GitHub, which is how the 手写深度页 ask for corrections.
         */}
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

function Panel({ title, children, className = '' }) {
  return (
    <section className={['fa-surface p-3.5', className].filter(Boolean).join(' ')}>
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
