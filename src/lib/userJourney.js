/** Local-only continuity state shared by Home, Wiki, Graph and Deployed. */
export const FAVORITES_KEY = 'foss-atlas:favorites'
export const RECENT_RESOURCES_KEY = 'foss-atlas:recent-resources'
export const LAST_WIKI_READING_KEY = 'foss-atlas:last-wiki-reading'
export const LAST_GRAPH_CONTEXT_KEY = 'foss-atlas:last-graph-context'
export const LAST_GRAPH_NODE_KEY = 'foss-atlas:last-graph-node'
export const LAST_DEPLOYED_INSTANCE_KEY = 'foss-atlas:last-deployed-instance'
export const EXPANDED_DEPLOY_GROUPS_KEY = 'foss-atlas:expanded-deploy-groups'
export const USER_JOURNEY_EVENT = 'foss-atlas:user-journey-change'

const GRAPH_CONTEXT_KEYS = ['focus', 'cat', 'deployed', 'local', 'depth', 'view', 'node_q', 'node_type', 'labels']

function storageOrNull() {
  try { return typeof window === 'undefined' ? null : window.localStorage } catch { return null }
}

function notifyChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new window.Event(USER_JOURNEY_EVENT))
}

function validString(value, validIds) {
  return typeof value === 'string' && value.length > 0 && (!validIds || validIds.has(value))
}

function readJson(key, fallback = null, storage = storageOrNull()) {
  try { return storage ? JSON.parse(storage.getItem(key) || 'null') : fallback } catch { return fallback }
}

function writeJson(key, value, storage = storageOrNull()) {
  try { storage?.setItem(key, JSON.stringify(value)) } catch { /* optional convenience state */ }
  notifyChange()
  return value
}

export function normalizeIds(value, validIds = null, limit = 100) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id) => validString(id, validIds)))].slice(0, limit)
}

export function readIds(key, validIds = null, limit = 100, storage = storageOrNull()) {
  return normalizeIds(readJson(key, [], storage), validIds, limit)
}

export function writeIds(key, ids, validIds = null, limit = 100, storage = storageOrNull()) {
  return writeJson(key, normalizeIds(ids, validIds, limit), storage)
}

export function readFavorites(validResourceIds = null, storage = storageOrNull()) {
  return readIds(FAVORITES_KEY, validResourceIds, 500, storage)
}

export function toggleFavorite(id, validResourceIds = null, storage = storageOrNull()) {
  if (!validString(id, validResourceIds)) return readFavorites(validResourceIds, storage)
  const current = readFavorites(validResourceIds, storage)
  return writeIds(FAVORITES_KEY, current.includes(id) ? current.filter((item) => item !== id) : [id, ...current], validResourceIds, 500, storage)
}

export function readRecentResources(validResourceIds = null, limit = 8, storage = storageOrNull()) {
  return readIds(RECENT_RESOURCES_KEY, validResourceIds, limit, storage)
}

export function rememberResourceRead(id, validResourceIds = null, limit = 8, storage = storageOrNull()) {
  if (!validString(id, validResourceIds)) return readRecentResources(validResourceIds, limit, storage)
  const current = readRecentResources(validResourceIds, limit, storage)
  return writeIds(RECENT_RESOURCES_KEY, [id, ...current.filter((item) => item !== id)], validResourceIds, limit, storage)
}

export function rememberWikiReading(id, heading = '', validResourceIds = null, storage = storageOrNull()) {
  if (!validString(id, validResourceIds)) return null
  const previous = readJson(LAST_WIKI_READING_KEY, null, storage)
  const next = { id, heading: typeof heading === 'string' && heading ? heading : (previous?.id === id ? previous.heading || '' : '') }
  if (previous?.id === next.id && previous?.heading === next.heading) return previous
  return writeJson(LAST_WIKI_READING_KEY, next, storage)
}

export function readLastWikiReading(validResourceIds = null, storage = storageOrNull()) {
  const value = readJson(LAST_WIKI_READING_KEY, null, storage)
  return value && validString(value.id, validResourceIds) && typeof value.heading === 'string'
    ? { id: value.id, heading: value.heading }
    : null
}

export function subscribeUserJourney(callback) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (event) => {
    if (!event.key || event.key.startsWith('foss-atlas:')) callback()
  }
  window.addEventListener(USER_JOURNEY_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(USER_JOURNEY_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

export function graphContextFromSearchParams(searchParams) {
  const params = new URLSearchParams()
  for (const key of GRAPH_CONTEXT_KEYS) {
    const value = searchParams.get(key)
    if (value) params.set(key, value)
  }
  return params
}

export function rememberGraphContext(searchParams, storage = storageOrNull()) {
  const serialized = graphContextFromSearchParams(searchParams).toString()
  try { storage?.setItem(LAST_GRAPH_CONTEXT_KEY, serialized) } catch { /* optional convenience state */ }
  notifyChange()
  return serialized
}

export function readLastGraphUrl(storage = storageOrNull()) {
  try {
    const serialized = storage?.getItem(LAST_GRAPH_CONTEXT_KEY)
    const params = graphContextFromSearchParams(new URLSearchParams(serialized || ''))
    const node = storage?.getItem(LAST_GRAPH_NODE_KEY)
    if (node && !params.has('local')) params.set('focus', node)
    return params.size ? '/graph/?' + params.toString() : '/graph/'
  } catch { return null }
}

export function rememberGraphNode(nodeId, validNodeIds = null, storage = storageOrNull()) {
  if (!validString(nodeId, validNodeIds)) return null
  try { storage?.setItem(LAST_GRAPH_NODE_KEY, nodeId) } catch { /* optional convenience state */ }
  notifyChange()
  return nodeId
}

export function readLastDeployedInstance(validInstanceIds = null, storage = storageOrNull()) {
  try {
    const id = storage?.getItem(LAST_DEPLOYED_INSTANCE_KEY) ?? null
    return validString(id, validInstanceIds) ? id : null
  } catch { return null }
}

export function rememberDeployedInstance(id, validInstanceIds = null, storage = storageOrNull()) {
  if (!validString(id, validInstanceIds)) return null
  try { storage?.setItem(LAST_DEPLOYED_INSTANCE_KEY, id) } catch { /* optional convenience state */ }
  notifyChange()
  return id
}

export function readExpandedDeployGroups(validGroupIds = null, storage = storageOrNull()) {
  return new Set(readIds(EXPANDED_DEPLOY_GROUPS_KEY, validGroupIds, 20, storage))
}

export function rememberExpandedDeployGroups(groupIds, validGroupIds = null, storage = storageOrNull()) {
  return writeIds(EXPANDED_DEPLOY_GROUPS_KEY, [...groupIds], validGroupIds, 20, storage)
}
