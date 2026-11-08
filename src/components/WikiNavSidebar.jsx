import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoryColor, categoryDeep, categoryTextColor } from '../lib/categoryColor.js'
import { navTree, resourceById } from '../lib/data.js'
import { countWikiNavTools, filterWikiNavTree } from '../lib/wikiNavFilter.js'

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

/**
 * Accordion tree of every catalogue tool, grouped category → sub-category.
 * Shared by the desktop rail and the mobile drawer inside SidebarLayout.
 *
 * Open state is derived: a branch is open when it holds the tool being viewed,
 * unless the reader has explicitly toggled it. When `activeId` changes we drop
 * the overrides for the *new* active branch so navigation from anywhere — a
 * wikilink, the related cards, the graph — always reveals the tool it lands on.
 *
 * Scrolling the active row into view is delegated to the caller's scroll
 * container (`scrollRef`), because this component's own root is not scrollable.
 */
export default function WikiNavSidebar({ activeId, onNavigate, scrollRef }) {
  const containerRef = useRef(null)
  const activeRef = useRef(null)

  const current = activeId ? resourceById.get(activeId) : null
  const activeCat = current?.category ?? null
  const activeSub = current?.sub_category ?? null

  const [catOverrides, setCatOverrides] = useState({})
  const [subOverrides, setSubOverrides] = useState({})
  const [seenId, setSeenId] = useState(activeId)
  const [query, setQuery] = useState('')
  const filteredTree = useMemo(() => filterWikiNavTree(navTree, query), [query])
  const matchedTools = useMemo(() => countWikiNavTools(filteredTree), [filteredTree])
  const searching = Boolean(query.trim())

  // Adjusting state during render (React's documented alternative to an effect)
  // when the tool being viewed changes.
  if (seenId !== activeId) {
    setSeenId(activeId)
    if (activeCat && has(catOverrides, activeCat)) {
      setCatOverrides((prev) => {
        const next = { ...prev }
        delete next[activeCat]
        return next
      })
    }
    if (activeSub && has(subOverrides, activeSub)) {
      setSubOverrides((prev) => {
        const next = { ...prev }
        delete next[activeSub]
        return next
      })
    }
  }

  const isCatOpen = (id) => searching || (catOverrides[id] ?? id === activeCat)
  const isSubOpen = (id) => searching || (subOverrides[id] ?? id === activeSub)

  const toggleCat = (id) =>
    setCatOverrides((prev) => ({ ...prev, [id]: !(prev[id] ?? id === activeCat) }))
  const toggleSub = (id) =>
    setSubOverrides((prev) => ({ ...prev, [id]: !(prev[id] ?? id === activeSub) }))

  // Keep the highlighted row visible once the tree has expanded.
  useEffect(() => {
    const box = scrollRef?.current ?? containerRef.current
    const el = activeRef.current
    if (!box || !el) return
    const boxRect = box.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.top < boxRect.top || elRect.bottom > boxRect.bottom) {
      box.scrollBy({ top: elRect.top - boxRect.top - (boxRect.height - elRect.height) / 2 })
    }
  }, [activeId, catOverrides, subOverrides, scrollRef])

  return (
    <nav ref={containerRef} aria-label="工具目录" className="space-y-0.5">
      <div className="sticky top-0 z-10 -mx-1 space-y-1.5 bg-[var(--ink-raised)] px-1 pb-2 pt-1">
        <label className="relative block">
          <span className="sr-only">搜索 Wiki 目录</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-faint)]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索工具 / 分类…"
            aria-label="搜索 Wiki 目录"
            className="w-full rounded-[4px] border border-[var(--line)] bg-[var(--ink-sunken)] py-2 pl-8 pr-8 text-base text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/70 focus:outline-none sm:text-[11px]"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label="清除目录搜索" className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-[10px] text-[var(--text-faint)] hover:text-[var(--text-strong)]">×</button>
          ) : null}
        </label>
        <p className="px-1 text-[10px] text-[var(--text-faint)]">
          {searching ? `匹配 ${matchedTools} 个条目` : `${resourceById.size} 个工具 · 输入名称快速定位`}
        </p>
      </div>
      {filteredTree.map((cat) => {
        const catOpen = isCatOpen(cat.id)
        const catPanelId = `nav-cat-${cat.id}`
        /*
         * The rail used to carry exactly one colour — --accent on the active
         * tool — so 11 categories were 11 identical grey rows and the only
         * thing colour said was "this one". The hue now marks the *category*:
         * the chevron, the count and the open branch's indent line. Names stay
         * in the --text tiers (they are text; colouring 11 nav labels is the
         * slop version of the same idea), and everything nested inherits the
         * identity through the indent line instead of repeating the hue.
         */
        const hue = categoryColor(cat.id)
        return (
          <div key={cat.id}>
            <button
              type="button"
              onClick={() => toggleCat(cat.id)}
              aria-expanded={catOpen}
              aria-controls={catPanelId}
              className={[
                'flex w-full items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-left text-xs transition-colors',
                catOpen ? 'text-[var(--text-strong)]' : 'text-[var(--text-dim)] hover:text-[var(--text-strong)]',
              ].join(' ')}
            >
              <Chevron open={catOpen} color={hue} />
              <span className="min-w-0 flex-1 truncate font-semibold">
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </span>
              <span className="mono text-[10px] text-[var(--text-mute)]">{cat.count}</span>
            </button>

            {/* The branch line wears its category at 28% — 1.750–2.053:1 against
                the rail (--ink-sunken), 1.707–2.010 in the drawer (--ink). A
                container line is not a mark you read, it is what tells you which
                rows belong together, so it sits deliberately under the 3:1 mark
                floor, the same way the graph's structural edges do. The hue still
                does its job where it is read: as the count label on the rail it
                measures 7.27–10.57:1, in the drawer (--ink) 6.20–9.02:1. */}
            {catOpen ? (
              <div
                id={catPanelId}
                className="ml-[13px] border-l pl-1.5"
                style={{
                  borderColor: `color-mix(in srgb, ${hue} 28%, transparent)`,
                }}
              >
                {cat.subs.map((sub) => {
                  const subOpen = isSubOpen(sub.id)
                  const subActive = sub.id === activeSub
                  const subPanelId = `nav-sub-${sub.id}`
                  return (
                    <div key={sub.id}>
                      <button
                        type="button"
                        onClick={() => toggleSub(sub.id)}
                        aria-expanded={subOpen}
                        aria-controls={subPanelId}
                        className={[
                          'flex w-full items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-left text-[11px] transition-colors',
                          subActive
                            ? 'text-[var(--text-strong)]'
                            : subOpen
                              ? 'text-[var(--text)]'
                              : 'text-[var(--text-faint)] hover:text-[var(--text)]',
                        ].join(' ')}
                      >
                        <Chevron open={subOpen} />
                        <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                        <span className="mono text-[10px] text-[var(--text-mute)]">{sub.count}</span>
                      </button>

                      {subOpen ? (
                        <ul id={subPanelId} className="space-y-0.5 py-0.5 pl-[13px]">
                          {sub.tools.map((tool) => {
                            const isActive = tool.id === activeId
                            return (
                              /* The active tool's own row is the one place in the nav
                                 * where the category hue is a mark you read, so on the
                                 * light theme the label wears the category's text
                                 * variant (categoryTextColor — 4.97:1 on the white rail,
                                 * 4.63 in the drawer on the ground — AA on both) and the
                                 * 2px left border wears the deep variant flat
                                 * (categoryDeep, ≈3.2–3.5:1 — a mark, past the 3:1 floor;
                                 * the base pastel hue at any mix lands under it on light
                                 * surfaces). The 10% wash stays a layer cue. */
                              <li key={tool.id}>
                                <Link
                                  to={`/wiki/${tool.id}/`}
                                  ref={isActive ? activeRef : null}
                                  onClick={onNavigate}
                                  aria-current={isActive ? 'page' : undefined}
                                  style={
                                    isActive
                                      ? {
                                          color: categoryTextColor(cat.id),
                                          borderColor: categoryDeep(cat.id),
                                          background: `color-mix(in srgb, ${hue} 10%, transparent)`,
                                        }
                                      : undefined
                                  }
                                  className={[
                                    'block truncate rounded-[4px] border-l-2 px-2 py-1 text-[11px] transition-colors',
                                    isActive
                                      ? 'text-[var(--text-strong)]'
                                      : 'border-transparent text-[var(--text-dim)] hover:bg-[var(--ink-tint)] hover:text-[var(--text-strong)]',
                                  ].join(' ')}
                                >
                                  {tool.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )
      })}
      {searching && matchedTools === 0 ? (
        <div className="px-2 py-6 text-center">
          <p className="text-xs text-[var(--text-dim)]">没有匹配的工具</p>
          <button type="button" onClick={() => setQuery('')} className="mt-2 text-[11px] text-[var(--accent-text)] hover:underline">清除搜索</button>
        </div>
      ) : null}
    </nav>
  )
}

function Chevron({ open, color }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={[
        'h-2.5 w-2.5 shrink-0 transition-transform duration-150',
        open ? 'rotate-90' : '',
      ].join(' ')}
      style={{ color: color ?? 'var(--text-mute)' }}
    >
      <path
        d="M4 2.5 L8 6 L4 9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
