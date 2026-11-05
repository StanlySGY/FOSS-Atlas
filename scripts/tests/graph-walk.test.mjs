import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createGraphWalk, graphWalkEdgeKey, graphWalkStepLabel } from '../../src/lib/graphWalk.js'

const graph = {
  nodes: [
    { id: 'a', name: 'Alpha', type: 'tool' },
    { id: 'b', name: 'Shared tag', type: 'tag' },
    { id: 'c', name: 'Charlie', type: 'tool' },
    { id: 'd', name: 'Delta', type: 'external' },
    { id: 'cat:ignored', name: 'Category', type: 'category' },
  ],
  edges: [
    { source: 'a', target: 'b', type: 'tagged' },
    { source: 'c', target: 'b', type: 'tagged' },
    { source: 'c', target: 'd', type: 'alternative_to' },
    { source: 'a', target: 'cat:ignored', type: 'belongs_to' },
  ],
}

test('a graph walk follows real semantic edges and never invents a relationship', () => {
  const walk = createGraphWalk(graph, 'a', 'fixed-seed', 5)
  assert.deepEqual(walk.nodes.map((node) => node.id), ['a', 'b', 'c', 'd'])
  assert.equal(walk.edges.length, walk.nodes.length - 1)
  walk.edges.forEach((edge, index) => {
    assert.ok(graph.edges.some((candidate) => candidate.source === edge.source && candidate.target === edge.target && candidate.type === edge.type))
    assert.ok([walk.nodes[index].id, walk.nodes[index + 1].id].includes(edge.source))
    assert.ok([walk.nodes[index].id, walk.nodes[index + 1].id].includes(edge.target))
  })
  assert.equal(graphWalkStepLabel(walk.edges[0]), '标签')
  assert.equal(graphWalkEdgeKey(walk.edges[0]), 'a>b:tagged')
})

test('a shared seed reproduces the same route and invalid starting nodes are rejected', () => {
  const first = createGraphWalk(graph, 'a', 'same')
  const second = createGraphWalk(graph, 'a', 'same')
  assert.deepEqual(first.nodes.map((node) => node.id), second.nodes.map((node) => node.id))
  assert.equal(createGraphWalk(graph, 'cat:ignored'), null)
  assert.equal(createGraphWalk(graph, 'missing'), null)
})

test('the production graph route consists only of existing related, alternative or tag edges', () => {
  const realGraph = JSON.parse(readFileSync(new URL('../../src/data/graph.json', import.meta.url), 'utf8'))
  const walk = createGraphWalk(realGraph, 'ollama', 'stable-route', 5)
  assert.ok(walk)
  assert.ok(walk.nodes.length > 1)
  assert.equal(walk.edges.length, walk.nodes.length - 1)
  for (const edge of walk.edges) {
    assert.ok(['related', 'alternative_to', 'tagged'].includes(edge.type))
    assert.ok(realGraph.edges.some((candidate) => candidate.source === edge.source && candidate.target === edge.target && candidate.type === edge.type))
  }
})
