import { Outlet } from 'react-router-dom'

/**
 * Full-bleed shell for the navigation grid and the knowledge graph.
 *
 * Deliberately has no `max-w`/`mx-auto`: the site is an app-like fluid layout,
 * so content spans the whole viewport and only padding keeps it off the edges.
 */
export default function FullWidthLayout() {
  return (
    <main className="w-full flex-1 px-4 py-8 sm:px-6">
      <Outlet />
    </main>
  )
}
