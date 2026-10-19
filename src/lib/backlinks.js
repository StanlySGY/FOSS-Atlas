import rawBacklinks from '../data/backlinks.json'
import { resolveTarget } from './data.js'

/**
 * True backlinks: which other wiki pages link *to* a given resource.
 *
 * The index is built at build time by `scripts/build-wikis.mjs`, which scans
 * every page in `public/wiki/` for `[[wikilinks]]` and records the target names
 * as written. Resolving those names is left to `resolveTarget()` here — the same
 * function the links themselves go through — so the index cannot drift from the
 * pages, and no page has to be fetched to render one.
 *
 * Shape: { [sourceResourceId]: [wikilink target name, ...] }
 */
const backlinks = rawBacklinks

/** Resource ids whose wiki links to `id`. Synchronous by design. */
export function backlinksFor(id) {
  const sources = []
  for (const [source, targets] of Object.entries(backlinks)) {
    if (source === id) continue
    if (targets.some((name) => resolveTarget(name) === id)) sources.push(source)
  }
  return sources
}
