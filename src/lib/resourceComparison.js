/** Comparison state is independent of catalogue filters and favorite resources. */
export const COMPARISON_STORAGE_KEY = 'foss-atlas:resource-comparison'
export const COMPARISON_LIMIT = 3

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage } catch { return null }
}

export function normalizeComparisonIds(value, validIds = null) {
  if (!Array.isArray(value)) return []
  const ids = []
  for (const raw of value) {
    if (typeof raw !== 'string') continue
    const id = raw.trim()
    if (!id || id.includes(',') || (validIds && !validIds.has(id)) || ids.includes(id)) continue
    ids.push(id)
    if (ids.length === COMPARISON_LIMIT) break
  }
  return ids
}

export function readComparisonIds(validIds = null, storage = browserStorage()) {
  try {
    return normalizeComparisonIds(JSON.parse(storage?.getItem(COMPARISON_STORAGE_KEY) ?? 'null'), validIds)
  } catch { return [] }
}

export function writeComparisonIds(ids, validIds = null, storage = browserStorage()) {
  const next = normalizeComparisonIds(ids, validIds)
  try { storage?.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(next)) } catch { /* optional local continuity */ }
  return next
}

/** A present but empty/invalid URL selection must never revive a saved list. */
export function comparisonIdsFromSearchParams(searchParams, localIds = [], validIds = null) {
  return normalizeComparisonIds(
    searchParams.has('compare') ? (searchParams.get('compare') ?? '').split(',') : localIds,
    validIds,
  )
}

export function toggleComparisonId(ids, id, validIds = null) {
  const current = normalizeComparisonIds(ids, validIds)
  const [candidate] = normalizeComparisonIds([id], validIds)
  if (!candidate) return current
  if (current.includes(candidate)) return current.filter((value) => value !== candidate)
  return normalizeComparisonIds([...current, candidate], validIds)
}

export function removeComparisonId(ids, id, validIds = null) {
  const [candidate] = normalizeComparisonIds([id], validIds)
  return normalizeComparisonIds(ids, validIds).filter((value) => value !== candidate)
}

/** Keep compare= for a deliberate clear, including when storage is unavailable. */
export function setComparisonParams(searchParams, ids, validIds = null) {
  const next = new URLSearchParams(searchParams)
  const selection = normalizeComparisonIds(ids, validIds)
  next.set('compare', selection.join(','))
  if (selection.length < 2) next.delete('comparing')
  return next
}

export function setComparisonOpenParams(searchParams, open, ids = [], validIds = null) {
  const next = new URLSearchParams(searchParams)
  const selection = normalizeComparisonIds(ids, validIds)
  if (open && selection.length >= 2) {
    next.set('compare', selection.join(','))
    next.set('comparing', '1')
  } else {
    next.delete('comparing')
  }
  return next
}

/** Share only comparison state at the configured site root on the current origin. */
export function buildComparisonShareUrl({ origin, basePath = '/', ids, validIds = null }) {
  const selection = normalizeComparisonIds(ids, validIds)
  if (selection.length < 2) return ''
  try {
    const current = new URL(origin)
    if (!['http:', 'https:'].includes(current.protocol)) return ''
    const url = new URL(current.origin)
    url.pathname = new URL(basePath, url).pathname.replace(/\/?$/, '/')
    url.searchParams.set('compare', selection.join(','))
    url.searchParams.set('comparing', '1')
    return url.href
  } catch { return '' }
}

function browserClipboard() {
  try { return typeof navigator === 'undefined' ? null : navigator.clipboard } catch { return null }
}

/** False tells the view to expose a selectable URL instead of claiming success. */
export async function copyComparisonShareUrl(url, clipboard = browserClipboard()) {
  if (!url || typeof clipboard?.writeText !== 'function') return false
  try {
    await clipboard.writeText(url)
    return true
  } catch { return false }
}
