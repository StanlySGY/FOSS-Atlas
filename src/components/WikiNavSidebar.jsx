import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { navTree, resourceById } from '../lib/data.js'

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

  const isCatOpen = (id) => catOverrides[id] ?? id === activeCat
  const isSubOpen = (id) => subOverrides[id] ?? id === activeSub

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
      {navTree.map((cat) => {
        const catOpen = isCatOpen(cat.id)
        const catPanelId = `nav-cat-${cat.id}`
        return (
          <div key={cat.id}>
            <button
              type="button"
              onClick={() => toggleCat(cat.id)}
              aria-expanded={catOpen}
              aria-controls={catPanelId}
              className={[
                'flex w-full items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-left text-xs transition-colors',
                catOpen ? 'text-neutral-200' : 'text-neutral-400 hover:text-neutral-200',
              ].join(' ')}
            >
              <Chevron open={catOpen} />
              <span className="min-w-0 flex-1 truncate font-semibold">
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </span>
              <span className="mono text-[10px] text-neutral-600">{cat.count}</span>
            </button>

            {catOpen ? (
              <div id={catPanelId} className="ml-[13px] border-l border-[var(--line-soft)] pl-1.5">
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
                            ? 'text-neutral-200'
                            : subOpen
                              ? 'text-neutral-300'
                              : 'text-neutral-500 hover:text-neutral-300',
                        ].join(' ')}
                      >
                        <Chevron open={subOpen} />
                        <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                        <span className="mono text-[10px] text-neutral-600">{sub.count}</span>
                      </button>

                      {subOpen ? (
                        <ul id={subPanelId} className="space-y-0.5 py-0.5 pl-[13px]">
                          {sub.tools.map((tool) => {
                            const isActive = tool.id === activeId
                            return (
                              <li key={tool.id}>
                                <Link
                                  to={`/wiki/${tool.id}/`}
                                  ref={isActive ? activeRef : null}
                                  onClick={onNavigate}
                                  aria-current={isActive ? 'page' : undefined}
                                  className={[
                                    'block truncate rounded-[4px] border-l-2 px-2 py-1 text-[11px] transition-colors',
                                    isActive
                                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                                      : 'border-transparent text-neutral-400 hover:bg-[var(--ink-tint)] hover:text-neutral-200',
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
    </nav>
  )
}

function Chevron({ open }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={[
        'h-2.5 w-2.5 shrink-0 text-neutral-600 transition-transform duration-150',
        open ? 'rotate-90' : '',
      ].join(' ')}
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
