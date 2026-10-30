import { STATIC_ROUTES, wikiTitle } from '../prerender/site.js'

const HOME_TITLE = STATIC_ROUTES.find((route) => route.path === '/')?.title ?? 'FOSS-Atlas'

/** Keep client-side route titles aligned with the titles emitted by prerender. */
export function documentTitleForLocation(pathname, resources = new Map()) {
  const pathPart = String(pathname ?? '/').split(/[?#]/, 1)[0]
  const segments = pathPart.split('/').filter(Boolean)
  const normalizedPath = segments.length ? `/${segments.join('/')}/` : '/'
  const wikiMatch = normalizedPath.match(/^\/wiki\/([^/]+)\/$/)

  if (wikiMatch) {
    try {
      const resource = resources.get(decodeURIComponent(wikiMatch[1]))
      if (resource) return wikiTitle(resource)
    } catch {
      // A malformed percent-escape is an unknown path, not a reason to break navigation.
    }
  }

  return STATIC_ROUTES.find((route) => route.path === normalizedPath)?.title ?? HOME_TITLE
}
