/*
 * Server-side prefill for the wiki body.
 *
 * WikiPage normally fetches `public/wiki/<slug>.md` in an effect, which means
 * the HTML a crawler (or a no-JS reader) receives is an empty shell until the
 * bundle has run. `scripts/prerender.mjs` renders every wiki page at build
 * time, and to do that the markdown has to be present *during* the render
 * rather than fetched after it.
 *
 * So the build reads the .md files off disk and drops them in this Map, keyed
 * by resource id; WikiPage seeds its initial state from it. In the browser the
 * Map is never written by hand — instead the prerendered document carries the
 * same payload in a JSON block (`readPrerenderPayload`), which main.jsx reads
 * before it decides between `hydrateRoot` and `createRoot`.
 */

/** Build-time seed for WikiPage's first render. */
const prefilled = new Map()

/** Seed the body for `id`. Only ever called from the build. */
export function setWikiPrefill(id, payload) {
  prefilled.set(id, payload)
}

export function clearWikiPrefill() {
  prefilled.clear()
}

/** `{ id, data, content }` when this render was seeded, else null. */
export function readWikiPrefill(id) {
  return prefilled.get(id) ?? null
}

/* ------------------------------------------------------------------ *
 * The document-embedded side
 * ------------------------------------------------------------------ */

export const WIKI_PAYLOAD_ID = 'wiki-payload'

/**
 * Read the JSON block a prerendered page left in the document, seed the Map
 * from it, and return the payload — or null when the document has none, which
 * is the signal that `#root` is an empty shell and should be built from
 * scratch rather than hydrated.
 *
 * The `path` comparison is a guard, not a feature: a prerendered file is
 * always fetched from the URL it was rendered for, but the SPA fallbacks
 * (`404.html` on GitHub Pages, Pages' own fallback on Cloudflare) can hand a
 * reader a document whose payload belongs to another route. Seeding from that
 * would show one tool's Wiki under another tool's URL.
 */
export function readPrerenderPayload() {
  if (typeof document === 'undefined') return null
  const node = document.getElementById(WIKI_PAYLOAD_ID)
  if (!node) return null

  let payload
  try {
    payload = JSON.parse(node.textContent ?? '')
  } catch {
    return null
  }
  if (!payload || typeof payload.id !== 'string' || typeof payload.path !== 'string') return null

  const here = stripTrailingSlash(window.location.pathname)
  if (stripTrailingSlash(payload.path) !== here) return null

  setWikiPrefill(payload.id, { id: payload.id, data: payload.data, content: payload.content })
  return payload
}

/** Router basenames complicate this, so the comparison happens below the basename. */
export function stripTrailingSlash(pathname) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const relative = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  return relative.replace(/\/+$/, '') || '/'
}
