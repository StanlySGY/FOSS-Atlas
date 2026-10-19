import graph from '../data/graph.json'
import resources from '../data/resources.json'

export { graph, resources }

export const categories = graph.categories
export const subCategories = graph.sub_categories

export const resourceById = new Map(resources.map((r) => [r.id, r]))

export const subCategoriesByCategory = subCategories.reduce((acc, sub) => {
  ;(acc[sub.category] ||= []).push(sub)
  return acc
}, {})

export const countByCategory = resources.reduce((acc, r) => {
  acc[r.category] = (acc[r.category] || 0) + 1
  return acc
}, {})

export const countBySubCategory = resources.reduce((acc, r) => {
  acc[r.sub_category] = (acc[r.sub_category] || 0) + 1
  return acc
}, {})

/**
 * Category → sub-category → tools tree backing the wiki sidebar accordion.
 * Derived once at module load so render never re-walks the catalogue.
 */
export const navTree = categories.map((cat) => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
  count: countByCategory[cat.id] ?? 0,
  subs: (subCategoriesByCategory[cat.id] ?? []).map((sub) => ({
    id: sub.id,
    name: sub.name,
    count: countBySubCategory[sub.id] ?? 0,
    tools: resources
      .filter((r) => r.sub_category === sub.id)
      .map((r) => ({ id: r.id, name: r.name })),
  })),
}))

/* ------------------------------------------------------------------ *
 * Name -> resource id resolution, used by [[wikilinks]] and by the
 * "related" panel.
 * ------------------------------------------------------------------ */
const ALIASES = {
  'lm studio': 'lm-studio',
  'text generation webui': 'text-generation-webui',
  'clash meta': 'mihomo',
  'mihomo / clash meta': 'mihomo',
  'xray + reality': 'xray-reality',
  'xray': 'xray-reality',
  'matrix / synapse': 'matrix-synapse',
  'synapse': 'matrix-synapse',
  'glm-4': 'bigmodel-glm',
  'glm-4 api': 'bigmodel-glm',
  'cloudflare workers': 'cloudflare',
  'prompts.chat': 'awesome-chatgpt-prompts',
  'cloudflare-imgbed': 'cloudflare-imgbed',
  'nginx proxy manager': 'nginx-proxy-manager',
  'uptime kuma': 'uptime-kuma',
  'stirling-pdf': 'stirling-pdf',
  'it-tools': 'it-tools',
  'huggingface spaces': 'huggingface-spaces',
  'free-programming-books': 'free-programming-books',
  'docker': null,
  'caddy': null,
  'collabora': null,
}

const nameIndex = new Map()
for (const r of resources) {
  nameIndex.set(r.name.toLowerCase(), r.id)
  nameIndex.set(r.id.toLowerCase(), r.id)
}

/** Resolve a wikilink target (display name or id) to a resource id. */
export function resolveTarget(raw) {
  if (!raw) return null
  const key = raw.trim().toLowerCase()
  // `key in ALIASES` would walk the prototype chain and resolve names like
  // "constructor" / "toString" to Object members. Only own keys count.
  if (Object.prototype.hasOwnProperty.call(ALIASES, key)) return ALIASES[key]
  return nameIndex.get(key) ?? null
}

/** Wiki file slug for a resource, if the resource ships a wiki page. */
export function wikiSlugFor(resourceId) {
  return resourceById.get(resourceId)?.wiki ?? null
}

/* ------------------------------------------------------------------ *
 * Graph helpers
 * ------------------------------------------------------------------ */
const graphNodeById = new Map(graph.nodes.map((n) => [n.id, n]))

const relatedMap = new Map()
const alternativeMap = new Map()

for (const edge of graph.edges) {
  if (edge.type === 'related') {
    if (!relatedMap.has(edge.source)) relatedMap.set(edge.source, new Set())
    if (!relatedMap.has(edge.target)) relatedMap.set(edge.target, new Set())
    relatedMap.get(edge.source).add(edge.target)
    relatedMap.get(edge.target).add(edge.source)
  }
  if (edge.type === 'alternative_to') {
    if (!alternativeMap.has(edge.source)) alternativeMap.set(edge.source, new Set())
    alternativeMap.get(edge.source).add(edge.target)
  }
}

/** Tools related to `id`, resolved to resource records. */
export function relatedResources(id) {
  const ids = relatedMap.get(id)
  if (!ids) return []
  return [...ids].map((x) => resourceById.get(x)).filter(Boolean)
}

/**
 * What `id` is an alternative to. Targets may be catalogue resources (rendered
 * as internal wiki links) or external commercial services (rendered as outbound
 * links using the URL carried by the graph node).
 */
export function alternativesFor(id) {
  const ids = alternativeMap.get(id)
  if (!ids) return []
  return [...ids].map((x) => {
    const res = resourceById.get(x)
    if (res) return { id: x, name: res.name, url: res.url, linkId: x }
    const node = graphNodeById.get(x)
    return {
      id: x,
      name: node?.name ?? x.replace(/^ext:/, ''),
      url: node?.url ?? null,
      linkId: null,
    }
  })
}

export const graphStats = graph.stats
