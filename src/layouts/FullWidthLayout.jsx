import { Outlet } from 'react-router-dom'

/**
 * Full-width shell for the navigation grid and the knowledge graph — no
 * sidebar, single centred column.
 */
export default function FullWidthLayout() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Outlet />
    </main>
  )
}
