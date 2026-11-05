import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigationType } from 'react-router-dom'
import BackToTop from './BackToTop.jsx'
import CommandPalette from './CommandPalette.jsx'
import { graphStats, resourceById } from '../lib/data.js'
import { rememberResourceRead } from '../lib/userJourney.js'
import { documentTitleForLocation } from '../lib/documentTitle.js'
import {
  historyEntryMatchesLocation,
  savedScrollYFromHistoryState,
  scrollRestorationAction,
  withSavedScrollY,
} from '../lib/scrollRestoration.js'

const navItems = [
  { to: '/', label: '导航', end: true },
  { to: '/graph/', label: '知识图谱' },
  { to: '/deployed/', label: '自部署服务' },
]

/*
 * 移动端底部导航的图标（桌面端顶部导航没有它们，用不到）。
 */
function NavIcon({ name }) {
  const paths = {
    home: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5z" />
      </>
    ),
    graph: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="8" r="2.5" />
        <circle cx="10" cy="18" r="2.5" />
        <path d="M8.2 7 15.7 8M7 8.2l2.2 7.4M16.4 10l-5 6.4" />
      </>
    ),
    server: (
      <>
        <rect x="3" y="4" width="18" height="7" rx="1.5" />
        <rect x="3" y="13" width="18" height="7" rx="1.5" />
        <path d="M7 7.5h.01M7 16.5h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" strokeLinecap="round" />
      </>
    ),
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

const MOBILE_ICONS = { '/': 'home', '/graph/': 'graph', '/deployed/': 'server' }
const RESOURCE_IDS = new Set(resourceById.keys())

export default function Layout() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const scrollPositions = useRef(new Map())
  const pendingScrollSnapshot = useRef(null)
  const previousLocation = useRef({ pathname: location.pathname, hash: location.hash })
  const initialNavigation = useRef(true)

  const snapshotBeforeInternalNavigation = useCallback((event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!(event.target instanceof Element)) return
    const anchor = event.target.closest('a[href]')
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
    const destination = new URL(anchor.href, window.location.href)
    const current = new URL(window.location.href)
    if (destination.origin !== current.origin || destination.href === current.href) return

    // Capture before React commits the destination route. Replacing a long
    // page can trigger scroll anchoring during the commit, before passive cleanup.
    scrollPositions.current.set(location.key, window.scrollY)
    const historyState = window.history.state
    if (historyEntryMatchesLocation(historyState, location.key)) {
      window.history.replaceState(withSavedScrollY(historyState, location.key, window.scrollY), '')
    }
    pendingScrollSnapshot.current = location.key
  }, [location.key])

  // POP navigation can let the browser adjust the outgoing entry before React
  // commits the new route. Capture during the event's capture phase so cleanup
  // cannot replace that entry's position with the browser-adjusted offset.
  useEffect(() => {
    const snapshotBeforePop = () => {
      pendingScrollSnapshot.current = location.key
    }
    window.addEventListener('popstate', snapshotBeforePop, true)
    return () => window.removeEventListener('popstate', snapshotBeforePop, true)
  }, [location.key])

  // Static HTML ships the right title on direct loads; SPA route changes must
  // update it too, or the tab and assistive technology keep announcing the old page.
  useEffect(() => {
    document.title = documentTitleForLocation(location.pathname, resourceById)
  }, [location.pathname])

  useEffect(() => {
    const match = location.pathname.match(/^\/wiki\/([^/]+)\/?$/)
    if (match && resourceById.has(match[1])) rememberResourceRead(match[1], RESOURCE_IDS)
  }, [location.pathname])

  // Keep scroll restoration under the router rather than letting the browser
  // and page-level effects compete. A POP restores the exact history entry;
  // in-place filter changes preserve the viewport; new pages start at the top.
  useLayoutEffect(() => {
    const savedPositions = scrollPositions.current
    const previous = previousLocation.current
    const historyState = window.history.state
    const savedY = savedPositions.get(location.key)
      ?? savedScrollYFromHistoryState(historyState, location.key)
    const action = scrollRestorationAction({
      isInitial: initialNavigation.current,
      navigationType,
      previousPathname: previous.pathname,
      previousHash: previous.hash,
      pathname: location.pathname,
      hash: location.hash,
      savedY,
    })
    let restorationPending = action.type === 'anchor' || action.type === 'restore' || action.type === 'top'
    const rememberScrollPosition = () => {
      const currentHistoryState = window.history.state
      // A PUSH/POP can switch the active history entry before React cleans up
      // the outgoing route. Never write its browser-adjusted offset into the
      // new entry or under the old route's key.
      if (restorationPending) return
      if (!historyEntryMatchesLocation(currentHistoryState, location.key)) return
      savedPositions.set(location.key, window.scrollY)
      window.history.replaceState(withSavedScrollY(currentHistoryState, location.key, window.scrollY), '')
    }
    window.addEventListener('scroll', rememberScrollPosition, { passive: true })
    let frame = 0
    const finishRestoration = (top) => {
      window.scrollTo({ top })
      restorationPending = false
      rememberScrollPosition()
    }
    if (action.type === 'anchor') {
      frame = window.requestAnimationFrame(() => {
        let id = location.hash.slice(1)
        try { id = decodeURIComponent(id) } catch { /* keep the raw fragment */ }
        const target = document.getElementById(id)
        if (target) target.scrollIntoView({ block: 'start' })
        else window.scrollTo({ top: 0 })
        restorationPending = false
        rememberScrollPosition()
      })
    } else if (action.type === 'restore') {
      let attempts = 0
      const restoreWhenReachable = () => {
        const scrollHeight = document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight
        const maxScrollY = Math.max(0, scrollHeight - window.innerHeight)
        if (action.top <= maxScrollY + 1 || attempts >= 180) {
          finishRestoration(Math.min(action.top, maxScrollY))
          return
        }
        attempts += 1
        frame = window.requestAnimationFrame(restoreWhenReachable)
      }
      frame = window.requestAnimationFrame(restoreWhenReachable)
    } else if (action.type === 'top') {
      frame = window.requestAnimationFrame(() => {
        finishRestoration(0)
      })
    }

    previousLocation.current = { pathname: location.pathname, hash: location.hash }
    initialNavigation.current = false

    return () => {
      window.removeEventListener('scroll', rememberScrollPosition)
      // The cleanup runs before the next location is applied, so this captures
      // the outgoing entry's actual position (including long Wiki reading).
      if (pendingScrollSnapshot.current === location.key) {
        pendingScrollSnapshot.current = null
      } else if (!restorationPending) {
        const currentHistoryState = window.history.state
        if (historyEntryMatchesLocation(currentHistoryState, location.key)) {
          savedPositions.set(location.key, window.scrollY)
          window.history.replaceState(withSavedScrollY(currentHistoryState, location.key, window.scrollY), '')
        }
      }
      if (savedPositions.size > 100) {
        const oldest = savedPositions.keys().next().value
        savedPositions.delete(oldest)
      }
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [location.key, location.pathname, location.hash, navigationType])

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => { window.history.scrollRestoration = previous }
  }, [])

  /*
   * A hash link (for example /deployed/#atlas-tools) takes precedence over a
   * saved position. Deployed expands its matching group first when necessary,
   * then performs the final scroll once that row exists in the DOM.
   */
  /*
   * 全局热键：⌘K / Ctrl+K 任何时刻可开（输入框里也一样——那是它存在的意义）；
   * 裸 `/` 只在非输入场景开，避免和首页搜索框抢按键。Esc 交给面板自己处理。
   */
  const openPalette = useCallback(() => setPaletteOpen(true), [])
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((v) => !v)
        return
      }
      // Home owns `/` and focuses its catalogue field. Other pages use it as a
      // quick switcher shortcut; don't open two competing search surfaces.
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && location.pathname !== '/') {
        const target = event.target
        const typing =
          target instanceof HTMLElement &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        if (!typing) {
          event.preventDefault()
          setPaletteOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col" onClickCapture={snapshotBeforeInternalNavigation}>
      <a href="#main" className="fa-skip">
        跳到主内容
      </a>

      {/* Translucent light navigation shell; the content frame and mobile bar share the same white surface and border tokens. */}
      <header className="fa-app-header sticky top-0 z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur-md">
        {/* `shrink-0` + `whitespace-nowrap` on both text blocks, and the GitHub
            link parked until sm: at 390px those three nav labels and the logo are
            the whole row, and without them the labels wrap onto two lines and the
            row overflows the viewport sideways. */}
        <div className="mx-auto flex h-[var(--header-h)] w-full max-w-none items-center gap-3 px-4 sm:gap-6 sm:px-6 xl:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent-text)]">
              FA
            </span>
            {/* The wordmark parks below 370px: at 320 the tile + three nav labels
                are 268px, with the wordmark 354px — a sideways scroll on the
                narrowest phones for a word nobody reads there. */}
            <span className="hidden text-sm font-semibold tracking-tight text-[var(--text-strong)] min-[370px]:inline">
              FOSS<span className="text-[var(--accent-text)]">-</span>Atlas
            </span>
          </Link>

          <nav className="hidden shrink-0 items-center gap-1 whitespace-nowrap text-sm sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'relative rounded-[var(--radius-sm)] px-2.5 py-1.5 transition-colors',
                    isActive
                      ? 'bg-[var(--ink-tab)] text-[var(--text-strong)]'
                      : 'text-[var(--text-dim)] hover:bg-[var(--ink-tint)] hover:text-[var(--text-strong)]',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {/* The active page's underbar: a two-pixel accent tick pinned
                        to the header's bottom border, so which page you are on
                        survives even when the pill washes into the background. */}
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-[var(--accent)] transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      ].join(' ')}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 text-xs text-[var(--text-faint)]">
            <span className="mono hidden sm:inline">
              {graphStats.tools} tools / {graphStats.edges} links
            </span>
            {/*
             * The palette's visible door: a search-looking button that also
             * teaches the shortcut. Below sm it shrinks to the icon alone, where
             * it is the only site-wide affordance until the bottom nav appears.
             */}
            <button
              type="button"
              onClick={openPalette}
              aria-label="搜索与跳转（Ctrl+K）"
              title="搜索 / 跳转（Ctrl K）"
              className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line)] px-2 py-1.5 text-[var(--text-dim)] transition-colors hover:border-[var(--accent)]/70 hover:text-[var(--accent-text)]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" strokeLinecap="round" />
              </svg>
              <span className="hidden text-[11px] md:inline">搜索…</span>
              <kbd className="mono hidden rounded-[3px] border border-[var(--line)] px-1 py-0.5 text-[9px] md:inline">
                Ctrl K
              </kbd>
            </button>
            <a
              href="https://github.com/StanlySGY/FOSS-Atlas"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1.5 text-[var(--text-dim)] transition-colors hover:border-[var(--line-hover)] hover:text-[var(--text-strong)] sm:inline-block"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Child layouts own their own content area: FullWidthLayout spans the
          full viewport, SidebarLayout adds the flush-left wiki navigation rail. */}
      <Outlet />

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex w-full max-w-none flex-col gap-3 px-4 py-6 text-xs text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:px-8">
          <p>
            FOSS-Atlas · 收录 {graphStats.tools} 个免费 / 开源资源，数据源自社区整理的
            「GitHub 精选白P资源清单」。
          </p>
          <nav aria-label="页脚" className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="transition-colors hover:text-[var(--text-strong)]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/StanlySGY/FOSS-Atlas"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-[var(--text-strong)]"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </footer>

      {/*
       * Mobile bottom nav: the three pages stay one thumb-tap away without
       * reaching the top bar; `sm:hidden` hands the job back to the header and
       * footer on desktop. The palette button rides along as the fourth tab.
       */}
      <nav
        aria-label="页面导航"
        className="fa-mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--line)] bg-white/95 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
                isActive ? 'text-[var(--accent-text)]' : 'text-[var(--text-faint)]',
              ].join(' ')
            }
          >
            <NavIcon name={MOBILE_ICONS[item.to]} />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={openPalette}
          className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-[var(--text-faint)]"
        >
          <NavIcon name="search" />
          搜索
        </button>
      </nav>
      {/* The bottom nav overlays the last ~56px on phones; the shell breathes
          out so the footer (desktop) and last card are never under it. */}
      <div aria-hidden="true" className="h-14 sm:hidden" />

      <BackToTop />
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
    </div>
  )
}
