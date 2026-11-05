import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  readExpandedDeployGroups,
  readFavorites,
  readLastDeployedInstance,
  readLastGraphUrl,
  readLastWikiReading,
  readRecentResources,
  rememberDeployedInstance,
  rememberExpandedDeployGroups,
  rememberGraphContext,
  rememberGraphNode,
  rememberResourceRead,
  rememberWikiReading,
  toggleFavorite,
} from '../../src/lib/userJourney.js'

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed))
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

const resourceIds = new Set(['ollama', 'open-webui', 'litellm'])

test('favorites are validated, deduplicated, and toggled through one shared local store', () => {
  const storage = memoryStorage({ 'foss-atlas:favorites': JSON.stringify(['ollama', 'unknown', 'ollama']) })
  assert.deepEqual(readFavorites(resourceIds, storage), ['ollama'])
  assert.deepEqual(toggleFavorite('open-webui', resourceIds, storage), ['open-webui', 'ollama'])
  assert.deepEqual(toggleFavorite('ollama', resourceIds, storage), ['open-webui'])
  assert.deepEqual(toggleFavorite('unknown', resourceIds, storage), ['open-webui'])
})

test('recent reading is most-recent-first, unique, and capped', () => {
  const storage = memoryStorage()
  rememberResourceRead('ollama', resourceIds, 2, storage)
  rememberResourceRead('open-webui', resourceIds, 2, storage)
  rememberResourceRead('ollama', resourceIds, 2, storage)
  rememberResourceRead('litellm', resourceIds, 2, storage)
  assert.deepEqual(readRecentResources(resourceIds, 2, storage), ['litellm', 'ollama'])
  rememberResourceRead('unknown', resourceIds, 2, storage)
  assert.deepEqual(readRecentResources(resourceIds, 2, storage), ['litellm', 'ollama'])
})

test('last Wiki location retains its chapter for the same resource and resets for another', () => {
  const storage = memoryStorage()
  rememberWikiReading('ollama', 'install', resourceIds, storage)
  rememberWikiReading('ollama', '', resourceIds, storage)
  assert.deepEqual(readLastWikiReading(resourceIds, storage), { id: 'ollama', heading: 'install' })
  rememberWikiReading('open-webui', '', resourceIds, storage)
  assert.deepEqual(readLastWikiReading(resourceIds, storage), { id: 'open-webui', heading: '' })
  assert.equal(readLastWikiReading(new Set(['ollama']), storage), null)
})

test('graph resume retains only shareable view state and lets a newer node focus win', () => {
  const storage = memoryStorage()
  rememberGraphContext(new URLSearchParams('view=list&focus=ollama&node_q=llm&campaign=private'), storage)
  rememberGraphNode('open-webui', resourceIds, storage)
  assert.equal(readLastGraphUrl(storage), '/graph/?focus=open-webui&view=list&node_q=llm')
  rememberGraphContext(new URLSearchParams('local=ollama&depth=2&node_type=tool'), storage)
  rememberGraphNode('open-webui', resourceIds, storage)
  assert.equal(readLastGraphUrl(storage), '/graph/?local=ollama&depth=2&node_type=tool')
})

test('deployed instance and expanded group memories reject ids no longer in the catalogue', () => {
  const storage = memoryStorage()
  const instances = new Set(['atlas-tools', 'atlas-chat'])
  const groups = new Set(['home', 'cloudflare'])
  rememberDeployedInstance('atlas-tools', instances, storage)
  assert.equal(readLastDeployedInstance(instances, storage), 'atlas-tools')
  assert.equal(readLastDeployedInstance(new Set(['atlas-chat']), storage), null)
  rememberExpandedDeployGroups(['home', 'invalid', 'home'], groups, storage)
  assert.deepEqual([...readExpandedDeployGroups(groups, storage)], ['home'])
})

test('Home and Wiki share favorites; global navigation exposes resume points from every workspace', () => {
  const home = readFileSync(new URL('../../src/pages/Home.jsx', import.meta.url), 'utf8')
  const wiki = readFileSync(new URL('../../src/pages/WikiPage.jsx', import.meta.url), 'utf8')
  const layout = readFileSync(new URL('../../src/components/Layout.jsx', import.meta.url), 'utf8')
  const graph = readFileSync(new URL('../../src/pages/GraphPage.jsx', import.meta.url), 'utf8')
  const deployed = readFileSync(new URL('../../src/pages/Deployed.jsx', import.meta.url), 'utf8')
  const palette = readFileSync(new URL('../../src/components/CommandPalette.jsx', import.meta.url), 'utf8')
  assert.match(home, /useUserJourney\(RESOURCE_IDS\)/)
  assert.match(wiki, /toggleFavorite\(id\)/)
  assert.match(wiki, /rememberWikiReading\(id, currentHeading/)
  assert.match(wiki, /const hash = location\.hash \|\| window\.location\.hash/)
  assert.match(wiki, /const disclosure = target\.closest\('details'\)[\s\S]*?disclosure\.open = true/)
  assert.match(wiki, /settleFrame = window\.requestAnimationFrame[\s\S]*?revealTarget\(target\)/)
  assert.match(wiki, /const revealTarget = \(target\) => \{[\s\S]*?target\.scrollIntoView[\s\S]*?target\.focus/)
  assert.match(layout, /rememberResourceRead\(match\[1\]/)
  assert.match(graph, /rememberGraphContext\(/)
  assert.match(graph, /const GRAPH_FOCUS_IDS = new Set\(graph\.nodes[\s\S]*?node\.type === 'tool' \|\| node\.type === 'own'/)
  assert.match(graph, /rememberGraphNode\(node\.id, GRAPH_FOCUS_IDS\)/)
  assert.match(deployed, /readExpandedDeployGroups\(/)
  assert.match(deployed, /rememberDeployedInstance\(id/)
  assert.match(deployed, /location\.hash/)
  assert.match(deployed, /handledFragmentRef\.current === location\.hash/, 'a deep link is applied once so later user filters are not cleared')
  assert.match(deployed, /pathname: location\.pathname, search: nextSearch[\s\S]*hash: location\.hash/, 'clearing stale filters must preserve the instance deep-link hash')
  assert.match(palette, /继续上次/)
  assert.match(palette, /我的收藏/)
  assert.match(palette, /favorites\.slice\(0, 8\)/)
  assert.ok(palette.includes("to: '/?saved=1'"))
})
