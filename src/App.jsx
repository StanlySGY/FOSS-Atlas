import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import GraphPage from './pages/GraphPage.jsx'
import Home from './pages/Home.jsx'
import WikiPage from './pages/WikiPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/wiki/:id" element={<WikiPage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
