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
  if (key in ALIASES) return ALIASES[key]
  return nameIndex.get(key) ?? null
}

/** Wiki file slug for a resource, if the resource ships a wiki page. */
export function wikiSlugFor(resourceId) {
  return resourceById.get(resourceId)?.wiki ?? null
}

/* ------------------------------------------------------------------ *
 * Graph helpers
 * ------------------------------------------------------------------ */
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

/** What `id` is an alternative to (may include external, non-catalogue names). */
export function alternativesFor(id) {
  const ids = alternativeMap.get(id)
  if (!ids) return []
  return [...ids].map((x) => {
    const res = resourceById.get(x)
    return res ? { id: x, name: res.name, url: res.url } : { id: x, name: x.replace(/^ext:/, ''), url: null }
  })
}

export const graphStats = graph.stats
