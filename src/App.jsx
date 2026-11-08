import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import FullWidthLayout from './layouts/FullWidthLayout.jsx'
import SidebarLayout from './layouts/SidebarLayout.jsx'
import Deployed from './pages/Deployed.jsx'
import GraphPage from './pages/GraphPage.jsx'
import Home from './pages/Home.jsx'
import WikiPage from './pages/WikiPage.jsx'

/*
 * In-app 404. The static 404.html covers direct links (the server / GH Pages
 * serves it before the SPA boots); this covers client-side navigation to a
 * path that matches no route, which used to be a silent redirect to `/` — the
 * URL changed and nothing told the reader why.
 */
function NotFound() {
  const location = useLocation()
  return (
    <div className="fa-page-stack">
      <div className="fa-surface-muted px-5 py-10 text-center">
        <p className="mono text-[11px] tracking-wide text-[var(--accent-text)]">404 · PAGE NOT FOUND</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--text-strong)]">这个地址不存在</h1>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[var(--text-dim)]">
          <span className="mono break-all">{location.pathname}</span>
          {' '}不在目录里。可能是条目被重命名或链接写错了——可以从下面的入口重新出发。
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link to="/" className="fa-control fa-control--primary">回导航页</Link>
          <Link to="/graph/" className="fa-control">打开知识图谱</Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Root shell: header + footer. Layouts below supply the content area. */}
      <Route element={<Layout />}>
        <Route element={<FullWidthLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/deployed" element={<Deployed />} />
        </Route>

        {/* `:id` sits on the layout route so the sidebar can highlight the
            active tool; WikiPage reads it as an index child. */}
        <Route path="/wiki/:id" element={<SidebarLayout />}>
          <Route index element={<WikiPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
