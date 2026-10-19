import { resources, resolveTarget } from './data.js'
import { extractWikilinks, fetchWiki, parseFrontmatter } from './wiki.js'

/**
 * True backlinks: which other wiki pages link *to* a given resource.
 *
 * Every wiki file is tiny (a few KB) and there are only a handful, so we fetch
 * them once, extract their [[wikilinks]] and invert the mapping. The resulting
 * promise is cached for the lifetime of the page.
 */
let indexPromise = null

export function loadBacklinkIndex() {
  if (indexPromise) return indexPromise

  const pages = resources.filter((r) => r.wiki)

  indexPromise = Promise.all(
    pages.map(async (page) => {
      const raw = await fetchWiki(page.wiki)
      if (!raw) return { source: page.id, targets: [] }
      const { content } = parseFrontmatter(raw)
      const targets = extractWikilinks(content)
        .map((name) => resolveTarget(name))
        .filter((target) => target && target !== page.id)
      return { source: page.id, targets }
    }),
  ).then((entries) => {
    const map = new Map()
    for (const { source, targets } of entries) {
      for (const target of targets) {
        if (!map.has(target)) map.set(target, new Set())
        map.get(target).add(source)
      }
    }
    return map
  })

  return indexPromise
}

/** Resource ids that link to `id`. */
export async function backlinksFor(id) {
  const index = await loadBacklinkIndex()
  const sources = index.get(id)
  return sources ? [...sources] : []
}
