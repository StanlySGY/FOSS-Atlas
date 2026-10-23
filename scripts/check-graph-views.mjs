#!/usr/bin/env node
/**
 * The graph views, checked against the numbers their own comments promise.
 *
 * src/lib/graphFilter.js is the single place that decides what a view shows, and
 * a mistake in it is invisible from the site: the canvas still draws, just with
 * the wrong nodes. The 只看我部署了的 view used to keep every multi-tagged tool —
 * the 83 that do not run here included — because the weight loop counted edge
 * ends instead of running tools, and it survived every build for exactly this
 * reason. These are the assertions that would have caught it, kept as a handful
 * of numbers rather than a harness.
 *
 * The expected values are the ones documented above the filter itself: 103 nodes,
 * 15 of 40 tags, 116 of 338 标签 edges. If the catalogue moves them, change the
 * comment and this file together — the comment is the claim, this is the check.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { countByType, toolsInCategory, visibleNodeIds } from '../src/lib/graphFilter.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const graph = JSON.parse(readFileSync(resolve(ROOT, 'src/data/graph.json'), 'utf8'))

const problems = []
const check = (ok, claim) => {
  if (!ok) problems.push(claim)
}

check(visibleNodeIds(graph, {}) === null, 'no filter must mean the whole graph (null), not an empty set')

const running = graph.nodes.filter((n) => n.deployed)
const deployedView = visibleNodeIds(graph, { deployedOnly: true })
const deployedCounts = countByType(graph, deployedView)
const taggedEdges = graph.edges.filter((e) => e.type === 'tagged')
const visibleTagged = taggedEdges.filter((e) => deployedView.has(e.source) && deployedView.has(e.target)).length

check(
  deployedCounts.tool + deployedCounts.own === running.length,
  `deployed view must keep exactly the ${running.length} running services, kept ${deployedCounts.tool + deployedCounts.own}`,
)
check(deployedView.size === 103, `deployed view: expected 103 visible nodes, got ${deployedView.size}`)
check(deployedCounts.tag === 15, `deployed view: expected 15 of 40 tags, got ${deployedCounts.tag}`)
check(visibleTagged === 116, `deployed view: expected 116 of ${taggedEdges.length} 标签 edges, got ${visibleTagged}`)
check(
  graph.nodes.some((n) => n.id === 'tag:开源' && deployedView.has(n.id)),
  '标签:开源 must survive the deployed view (see the comment in src/lib/graphFilter.js)',
)

for (const cat of graph.categories) {
  const view = visibleNodeIds(graph, { focusedCategory: cat.id })
  const tools = toolsInCategory(graph, cat.id)
  check(view.has(`cat:${cat.id}`), `category ${cat.id}: its own node must be kept (node ids are cat:<id>)`)
  check(
    view.size >= tools.length,
    `category ${cat.id}: view shows ${view.size} nodes but the aside lists ${tools.length} tools`,
  )
  check(
    tools.length > 0,
    `category ${cat.id}: lists no tools — a node-type predicate that misses "own" reads 0 for Atlas 自建`,
  )
}

if (problems.length) {
  console.error('graph views do not match what the code claims:\n' + problems.map((p) => `  - ${p}`).join('\n'))
  process.exit(1)
}

console.log(
  `graph views: full ${graph.nodes.length} nodes · deployed ${deployedView.size} nodes (${deployedCounts.tag}/${graph.nodes.filter((n) => n.type === 'tag').length} tags, ${visibleTagged}/${taggedEdges.length} 标签 edges) · ${graph.categories.length} category views`,
)
