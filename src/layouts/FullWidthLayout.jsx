import { Outlet, useLocation } from 'react-router-dom'

/**
 * Full-bleed shell for the navigation grid and the knowledge graph.
 *
 * Deliberately has no `max-w`/`mx-auto`: the site is an app-like fluid layout,
 * so content spans the whole viewport and only padding keeps it off the edges.
 *
 * The content wrapper is keyed on the pathname so a route change remounts it
 * with the shared `.fa-page` rise — the one place a page switch gets motion,
 * without touching the sticky rails.
 */
export default function FullWidthLayout() {
  const location = useLocation()
  return (
    <main id="main" className="w-full flex-1 px-4 py-8 sm:px-6">
      <div key={location.pathname} className="fa-page">
        <Outlet />
      </div>
    </main>
  )
}
