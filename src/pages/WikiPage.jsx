import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import {
  alternativesFor,
  resourceById,
  relatedResources,
  resolveTarget,
  wikiSlugFor,
} from '../lib/data.js'
import { extractWikilinks, fetchWiki, parseFrontmatter, transformWikilinks } from '../lib/wiki.js'

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

export default function WikiPage() {
  const { id } = useParams()
  const resource = resourceById.get(id)

  const slug = wikiSlugFor(id)
  const [fetched, setFetched] = useState(null)

  useEffect(() => {
    if (!slug) return undefined
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
  const data = !loading && fetched?.id === id ? fetched.data : {}
  const content = loading
    ? ''
    : (slug && fetched?.content) || (resource ? fallbackMarkdown(resource) : '')
  const isFallback = !loading && !(slug && fetched?.content)

  const rendered = useMemo(() => transformWikilinks(content, resolveTarget), [content])

  const related = useMemo(() => {
    const fromGraph = relatedResources(id)
    const seen = new Set(fromGraph.map((r) => r.id))
    const fromFrontmatter = (data.related ?? [])
      .map((x) => resourceById.get(x))
      .filter((r) => r && !seen.has(r.id))
    return [...fromGraph, ...fromFrontmatter]
  }, [id, data.related])

  const alternatives = useMemo(() => alternativesFor(id), [id])
  const backlinks = useMemo(
    () => extractWikilinks(content).map((n) => ({ name: n, id: resolveTarget(n) })),
    [content],
  )

  if (!resource) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-400">
          没有找到 id 为 <code className="mono text-[#f0b429]">{id}</code> 的资源。
        </p>
        <Link to="/" className="text-sm text-[#f0b429] hover:underline">
          ← 返回导航
        </Link>
      </div>
    )
  }

  const tags = data.tags ?? resource.tags

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <article className="min-w-0 space-y-6">
        <nav className="mono flex items-center gap-2 text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-300">
            导航
          </Link>
          <span>/</span>
          <span className="text-neutral-400">{resource.category_name}</span>
          <span>/</span>
          <span className="text-neutral-300">{resource.name}</span>
        </nav>

        <header className="space-y-3 border-b border-[#23282a] pb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
            {data.title ?? resource.name}
          </h1>
          <p className="text-sm leading-relaxed text-neutral-400">{resource.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-[4px] border border-[#f0b429]/50 px-2.5 py-1 text-xs text-[#f0b429] transition-colors hover:bg-[#f0b429]/10"
            >
              访问官网 ↗
            </a>
            {data.repo ? (
              <a
                href={data.repo}
                target="_blank"
                rel="noreferrer"
                className="mono rounded-[4px] border border-[#23282a] px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:border-[#3a4245]"
              >
                源码仓库
              </a>
            ) : null}
            {data.license ? (
              <span className="mono rounded-[4px] border border-[#23282a] px-2.5 py-1 text-xs text-neutral-500">
                {data.license}
              </span>
            ) : null}
            {isFallback ? (
              <span className="mono rounded-[4px] border border-[#23282a] px-2.5 py-1 text-xs text-neutral-500">
                暂无独立 Wiki
              </span>
            ) : null}
          </div>
        </header>

        {loading ? (
          <p className="mono text-xs text-neutral-500">loading…</p>
        ) : (
          <Markdown>{rendered}</Markdown>
        )}

        {related.length ? (
          <section className="space-y-3 border-t border-[#23282a] pt-6">
            <h2 className="text-sm font-semibold text-neutral-200">相关工具</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/wiki/${r.id}`}
                  className="flex items-center justify-between gap-3 rounded-[6px] border border-[#23282a] bg-[#101314] px-3 py-2.5 transition-colors hover:border-[#3a4245]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-neutral-200">
                      {r.name}
                    </span>
                    <span className="block truncate text-[11px] text-neutral-500">
                      {r.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-neutral-600">→</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <Panel title="元数据">
          <dl className="space-y-2 text-xs">
            <Row label="分类" value={resource.category_name} />
            <Row label="子类" value={resource.sub_category_name} />
            {data.updated ? <Row label="更新" value={data.updated} /> : null}
            {data.license ? <Row label="许可" value={data.license} /> : null}
          </dl>
        </Panel>

        <Panel title="标签">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Link
                key={t}
                to={`/?q=${encodeURIComponent(t)}`}
                className="rounded-[3px] bg-[#171b1c] px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-[#f0b429]"
              >
                {t}
              </Link>
            ))}
          </div>
        </Panel>

        {alternatives.length ? (
          <Panel title="可替代">
            <ul className="space-y-1.5 text-xs">
              {alternatives.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <span className="text-neutral-500">替代</span>
                  {a.url ? (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-300 hover:text-[#f0b429]"
                    >
                      {a.name} ↗
                    </a>
                  ) : (
                    <span className="text-neutral-400">{a.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {backlinks.length ? (
          <Panel title="链接到">
            <div className="flex flex-wrap gap-1.5">
              {backlinks.map((b) =>
                b.id ? (
                  <Link
                    key={b.name}
                    to={`/wiki/${b.id}`}
                    className="rounded-[3px] border border-[#23282a] px-1.5 py-0.5 text-[10px] text-neutral-400 hover:border-[#f0b429]/50 hover:text-[#f0b429]"
                  >
                    {b.name}
                  </Link>
                ) : (
                  <span
                    key={b.name}
                    className="rounded-[3px] border border-[#1c2123] px-1.5 py-0.5 text-[10px] text-neutral-600"
                    title="本站暂无该条目"
                  >
                    {b.name}
                  </span>
                ),
              )}
            </div>
          </Panel>
        ) : null}

        <Link
          to="/graph"
          className="block rounded-[6px] border border-[#23282a] bg-[#101314] px-3 py-2.5 text-center text-xs text-neutral-400 transition-colors hover:border-[#f0b429]/50 hover:text-[#f0b429]"
        >
          在知识图谱中查看 →
        </Link>
      </aside>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <section className="rounded-[6px] border border-[#23282a] bg-[#101314] p-3.5">
      <h3 className="mono mb-2.5 text-[10px] uppercase tracking-wider text-neutral-500">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="truncate text-right text-neutral-300">{value}</dd>
    </div>
  )
}
