import { NavLink, Outlet } from 'react-router-dom'
import { graphStats } from '../lib/data.js'

const navItems = [
  { to: '/', label: '导航', end: true },
  { to: '/graph', label: '知识图谱' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[#23282a] bg-[#0a0c0d]/92 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <NavLink to="/" className="group flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-[4px] border border-[#f0b429]/50 text-[11px] font-bold text-[#f0b429]">
              FA
            </span>
            <span className="text-sm font-semibold tracking-tight text-neutral-100">
              FOSS<span className="text-[#f0b429]">-</span>Atlas
            </span>
          </NavLink>

          <nav className="flex items-center gap-1 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-[4px] px-2.5 py-1.5 transition-colors',
                    isActive
                      ? 'bg-[#1b2021] text-neutral-100'
                      : 'text-neutral-400 hover:text-neutral-100',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-xs text-neutral-500">
            <span className="mono hidden sm:inline">
              {graphStats.tools} tools / {graphStats.edges} links
            </span>
            <a
              href="https://github.com/StanlySGY/FOSS-Atlas"
              target="_blank"
              rel="noreferrer"
              className="rounded-[4px] border border-[#23282a] px-2.5 py-1 text-neutral-300 transition-colors hover:border-[#f0b429]/60 hover:text-[#f0b429]"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Child layouts own their own container: FullWidthLayout centres a
          single column, SidebarLayout adds the wiki navigation rail. */}
      <Outlet />

      <footer className="border-t border-[#23282a]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            FOSS-Atlas · 收录 {graphStats.tools} 个免费 / 开源资源，数据源自社区整理的
            「GitHub 精选白P资源清单」。
          </p>
          <p className="mono">
            built with vite · react · echarts
          </p>
        </div>
      </footer>
    </div>
  )
}
