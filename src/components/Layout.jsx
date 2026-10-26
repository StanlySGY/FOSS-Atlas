import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import BackToTop from './BackToTop.jsx'
import CommandPalette from './CommandPalette.jsx'
import { graphStats } from '../lib/data.js'

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

export default function Layout() {
  const location = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)

  /*
   * Route changes reset the scroll — but a hash link (/deployed/#joplin, handed
   * out by the graph bubble and the wiki's 我的实例 panel) must land on its
   * anchor instead, below the sticky header. react-router does neither on its
   * own for a nested-<Outlet> app like this one.
   */
  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [location.pathname, location.hash])

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
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
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
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="fa-skip">
        跳到主内容
      </a>

      {/* Glass, not opaque: the fixed washes behind scroll under it, and an
          86% ink + blur reads as depth instead of the old smear — the washes
          are static (background-attachment: fixed), so there is nothing moving
          to smear. */}
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(10,12,13,0.86)] backdrop-blur-md">
        {/* `shrink-0` + `whitespace-nowrap` on both text blocks, and the GitHub
            link parked until sm: at 390px those three nav labels and the logo are
            the whole row, and without them the labels wrap onto two lines and the
            row overflows the viewport sideways. */}
        <div className="flex h-[var(--header-h)] w-full items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link to="/" className="group flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">
              FA
            </span>
            {/* The wordmark parks below 370px: at 320 the tile + three nav labels
                are 268px, with the wordmark 354px — a sideways scroll on the
                narrowest phones for a word nobody reads there. */}
            <span className="hidden text-sm font-semibold tracking-tight text-[var(--text-strong)] min-[370px]:inline">
              FOSS<span className="text-[var(--accent)]">-</span>Atlas
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
              className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line)] px-2 py-1.5 text-[var(--text-dim)] transition-colors hover:border-[var(--accent)]/60 hover:text-[var(--accent)]"
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
              className="hidden rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1.5 text-[var(--text-dim)] transition-colors hover:border-[var(--line-hover)] hover:text-[var(--text-strong)] sm:inline-block"            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Child layouts own their own content area: FullWidthLayout spans the
          full viewport, SidebarLayout adds the flush-left wiki navigation rail. */}
      <Outlet />

      <footer className="border-t border-[var(--line)]">
        <div className="flex w-full flex-col gap-3 px-4 py-6 text-xs text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
          </nav>        </div>
      </footer>

      {/*
       * Mobile bottom nav: the three pages stay one thumb-tap away without
       * reaching the top bar; `sm:hidden` hands the job back to the header and
       * footer on desktop. The palette button rides along as the fourth tab.
       */}
      <nav
        aria-label="页面导航"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--line)] bg-[rgba(10,12,13,0.9)] backdrop-blur-md sm:hidden"
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
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]',
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