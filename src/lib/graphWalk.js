import { EDGE_META } from './graphStyle.js'

const WALKABLE_EDGES = new Set(['related', 'alternative_to', 'tagged'])
const MAX_STOPS = 5

function seededRandom(value) {
  let seed = 2166136261
  for (const character of String(value)) {
    seed ^= character.charCodeAt(0)
    seed = Math.imul(seed, 16777619)
  }
  return () => {
    seed += 0x6D2B79F5
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function weightFor(candidate) {
  const typeWeight = candidate.node.type === 'tool' || candidate.node.type === 'own' ? 4 : candidate.node.type === 'tag' ? 1.8 : 0.8
  const edgeWeight = candidate.edge.type === 'related' ? 1.5 : candidate.edge.type === 'alternative_to' ? 1.35 : 0.8
  return typeWeight * edgeWeight
}

/** Build a reproducible route from actual semantic graph edges only. */
export function createGraphWalk(graph, startId, seed = startId, maxStops = MAX_STOPS) {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]))
  const start = byId.get(startId)
  if (!start || !['tool', 'own', 'tag', 'external'].includes(start.type)) return null

  const adjacency = new Map()
  for (const edge of graph.edges) {
    if (!WALKABLE_EDGES.has(edge.type)) continue
    const source = byId.get(edge.source)
    const target = byId.get(edge.target)
    if (!source || !target) continue
    if (!['tool', 'own', 'tag', 'external'].includes(source.type) || !['tool', 'own', 'tag', 'external'].includes(target.type)) continue
    if (!adjacency.has(source.id)) adjacency.set(source.id, [])
    if (!adjacency.has(target.id)) adjacency.set(target.id, [])
    adjacency.get(source.id).push({ node: target, edge })
    adjacency.get(target.id).push({ node: source, edge })
  }

  const random = seededRandom(seed)
  const nodes = [start]
  const edges = []
  const visited = new Set([start.id])
  let current = start

  for (let step = 1; step < maxStops; step++) {
    const candidates = (adjacency.get(current.id) ?? []).filter((candidate) => !visited.has(candidate.node.id))
    if (!candidates.length) break
    const weighted = candidates.map((candidate) => ({ ...candidate, weight: weightFor(candidate) }))
    const total = weighted.reduce((sum, candidate) => sum + candidate.weight, 0)
    let roll = random() * total
    let selected = weighted[weighted.length - 1]
    for (const candidate of weighted) {
      roll -= candidate.weight
      if (roll <= 0) { selected = candidate; break }
    }
    edges.push(selected.edge)
    nodes.push(selected.node)
    visited.add(selected.node.id)
    current = selected.node
  }

  return { startId, seed: String(seed), nodes, edges }
}

export function graphWalkEdgeKey(edge) {
  return edge.source + '>' + edge.target + ':' + edge.type
}

export function graphWalkStepLabel(edge) {
  return EDGE_META[edge?.type]?.label ?? edge?.type ?? '关联'
}
