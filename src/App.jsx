import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import FullWidthLayout from './layouts/FullWidthLayout.jsx'
import SidebarLayout from './layouts/SidebarLayout.jsx'
import Deployed from './pages/Deployed.jsx'
import GraphPage from './pages/GraphPage.jsx'
import Home from './pages/Home.jsx'
import WikiPage from './pages/WikiPage.jsx'

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
