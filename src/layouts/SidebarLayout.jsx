import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import WikiNavSidebar from '../components/WikiNavSidebar.jsx'

const FOCUSABLE = 'a[href], button:not([disabled])'

/* Height of the sticky top bar (`h-14` in Layout). The rail hangs below it so
 * the bar never covers the first rows of the tree. */
const HEADER = '3.5rem'

/**
 * App-like reading shell for wiki pages:
 *
 *   [ navigation rail 280px ] [ article ] [ metadata rail ]
 *
 * The rail is flush against the left viewport edge, pinned with `sticky`, and
 * scrolls on its own. Below `md` it collapses into a drawer opened from a
 * "目录" button. The metadata rail is rendered by WikiPage itself so it can
 * stay `sticky` next to the article.
 */
export default function SidebarLayout() {
  const { id } = useParams()
  const location = useLocation()

  // The drawer records the route it was opened on, so navigating anywhere (a
  // sidebar link, a wikilink in the article) dismisses it without an effect.
  const [drawerPath, setDrawerPath] = useState(null)
  const drawerOpen = drawerPath === location.pathname
  const openDrawer = () => setDrawerPath(location.pathname)
  const closeDrawer = () => setDrawerPath(null)

  const railRef = useRef(null)
  const drawerScrollRef = useRef(null)
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  // While open the drawer behaves as a modal: trap Tab inside it, close on
  // Escape, lock background scrolling, and hand focus back on dismissal.
  useEffect(() => {
    if (!drawerOpen) return undefined
    const panel = panelRef.current
    const trigger = triggerRef.current
    panel?.focus()

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setDrawerPath(null)
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = panel.querySelectorAll(FOCUSABLE)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // The panel itself (and anything outside it) has no natural neighbour to
      // move to — never a neighbour outside the drawer, which is what a bare
      // Shift+Tab from the freshly focused container would reach.
      if (active === panel || !panel.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [drawerOpen])

  return (
    <div className="flex w-full flex-1 items-start">
      {/* Flush against the viewport edge: no container margin, no rounded card.
          `sticky` + own overflow keeps the tree pinned while the page scrolls. */}
      <aside
        ref={railRef}
        style={{ top: HEADER, height: `calc(100vh - ${HEADER})` }}
        className="sticky hidden w-[280px] shrink-0 overflow-y-auto overscroll-contain border-r border-[#23282a] bg-[#0d1112] px-3 py-4 md:block"
      >
        <p className="mono mb-2 px-2 text-[10px] uppercase tracking-wider text-neutral-600">
          工具目录
        </p>
        <WikiNavSidebar activeId={id} scrollRef={railRef} />
      </aside>

      <main className="min-w-0 flex-1">
        <button
          ref={triggerRef}
          type="button"
          onClick={openDrawer}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
          className="mono ml-4 mt-4 inline-flex items-center gap-2 rounded-[6px] border border-[#23282a] bg-[#101314] px-3 py-2 text-xs text-neutral-300 transition-colors hover:border-[#f0b429]/50 hover:text-[#f0b429] sm:ml-6 md:hidden"
        >
          <DrawerIcon />
          目录
        </button>

        <Outlet />
      </main>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="工具目录">
          <button
            type="button"
            tabIndex={-1}
            aria-label="关闭目录"
            onClick={closeDrawer}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="fa-drawer absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-[#23282a] bg-[#0a0c0d] outline-none"
          >
            <div className="flex items-center justify-between border-b border-[#23282a] px-3 py-3">
              <span className="mono text-[10px] uppercase tracking-wider text-neutral-500">
                工具目录
              </span>
              <button
                type="button"
                aria-label="关闭目录"
                onClick={closeDrawer}
                className="rounded-[4px] px-2 py-0.5 text-sm text-neutral-500 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>
            <div ref={drawerScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5">
              <WikiNavSidebar
                activeId={id}
                onNavigate={closeDrawer}
                scrollRef={drawerScrollRef}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DrawerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5">
      <path
        d="M2 4h12M2 8h12M2 12h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
