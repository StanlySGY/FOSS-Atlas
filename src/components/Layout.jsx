import { NavLink, Outlet, Link } from 'react-router-dom'
import { graphStats } from '../lib/data.js'

const navItems = [
  { to: '/', label: '导航', end: true },
  { to: '/graph/', label: '知识图谱' },
  { to: '/deployed/', label: '自部署服务' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="fa-skip">
        跳到主内容
      </a>

      {/* Opaque, not blurred: content scrolls under a sticky header and a
          translucent one only makes it look smeared. */}
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--ink)]">
        {/* `shrink-0` + `whitespace-nowrap` on both text blocks, and the GitHub
            link parked until sm: at 390px those three nav labels and the logo are
            the whole row, and without them the labels wrap onto two lines and the
            row overflows the viewport sideways. */}
        <div className="flex h-[var(--header-h)] w-full items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link to="/" className="group flex shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)]/50 text-[11px] font-bold text-[var(--accent)]">
              FA
            </span>
            {/* The wordmark parks below 370px: at 320 the tile + three nav labels
                are 268px, with the wordmark 354px — a sideways scroll on the
                narrowest phones for a word nobody reads there. */}
            <span className="hidden text-sm font-semibold tracking-tight text-[var(--text-strong)] min-[370px]:inline">
              FOSS<span className="text-[var(--accent)]">-</span>Atlas
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-[var(--radius-sm)] px-2.5 py-1.5 transition-colors',
                    isActive
                      ? 'bg-[var(--ink-tab)] text-[var(--text-strong)]'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-strong)]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-xs text-[var(--text-faint)]">
            <span className="mono hidden sm:inline">
              {graphStats.tools} tools / {graphStats.edges} links
            </span>
            <a
              href="https://github.com/StanlySGY/FOSS-Atlas"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-[var(--text-dim)] transition-colors hover:border-[var(--accent)]/60 hover:text-[var(--accent)] sm:inline-block"
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
        <div className="flex w-full flex-col gap-2 px-4 py-6 text-xs text-[var(--text-faint)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            FOSS-Atlas · 收录 {graphStats.tools} 个免费 / 开源资源，数据源自社区整理的
            「GitHub 精选白P资源清单」。
          </p>
          <p className="mono">built with vite · react · echarts</p>
        </div>
      </footer>
    </div>
  )
}
