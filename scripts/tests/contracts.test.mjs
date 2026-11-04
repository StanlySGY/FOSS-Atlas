import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { isUnreachable, probeStatusPresentation, summarizeProbeRows } from '../../src/lib/probeStatus.js'
import { shouldShowGraphLabel } from '../../src/lib/graphLabel.js'
import { setCategoryFocusParams, setDeployedOnlyParams, setLocalGraphDepthParams, setLocalGraphParams } from '../../src/lib/graphFilterState.js'
import { visibleNodeIds } from '../../src/lib/graphFilter.js'
import {
  catalogSortFromSearchParams,
  catalogViewFromSearchParams,
  deployedFiltersFromSearchParams,
  queryFromSearchParams,
  resetCatalogFiltersParams,
  resetDeployedFiltersParams,
  savedOnlyFromSearchParams,
  setCatalogSortParams,
  setCatalogViewParams,
  setDeployedFilterParam,
  setDeployedOnlyParams as setCatalogDeployedOnlyParams,
  setSavedOnlyParams,
} from '../../src/lib/catalogFilterState.js'
import { graphViewModeFromParams, setGraphViewModeParams } from '../../src/lib/graphViewState.js'

test('probe chips distinguish responses, redirects, access restrictions, and unreachable endpoints', () => {
  assert.equal(probeStatusPresentation('live', { cls: '2xx', code: 200, note: 'answered with a body' }).label, '响应正常 200')
  assert.equal(probeStatusPresentation('live', { cls: '3xx', code: 302, note: 'Location: /login' }).label, '重定向 302')
  assert.equal(probeStatusPresentation('live', { cls: '3xx', code: 302, note: 'Cloudflare Access login redirect — Access is answering, not failing' }).label, '需认证 302')
  assert.equal(probeStatusPresentation('live', { cls: '4xx', code: 401, note: 'origin (or Access/WAF) answered 401' }).label, '需认证 401')
  assert.equal(probeStatusPresentation('live', { cls: '4xx', code: 403, note: 'forbidden' }).label, '访问受限 403')
  assert.equal(probeStatusPresentation('live', { cls: '502', code: 502, note: 'origin unavailable' }).label, '不可达 502')
  assert.equal(probeStatusPresentation('live', { cls: 'transport', code: null, note: 'timeout' }).label, '连接失败')
  assert.equal(probeStatusPresentation('live', null).label, '未探测')
  assert.equal(probeStatusPresentation('pending', null).label, '部署中')
})

test('unreachable classification is transport/server oriented, not all non-2xx responses', () => {
  assert.equal(isUnreachable('2xx'), false)
  assert.equal(isUnreachable('3xx'), false)
  assert.equal(isUnreachable('4xx'), false)
  assert.equal(isUnreachable('530/1033'), true)
  assert.equal(isUnreachable('5xx-521'), true)
  assert.equal(isUnreachable('transport'), true)
})

test('probe summary accounts for every row without calling 3xx/4xx a successful 2xx', () => {
  const summary = summarizeProbeRows([
    { cls: '2xx' }, { cls: '2xx' }, { cls: '3xx' }, { cls: '4xx' },
    { cls: '502' }, { cls: 'transport' }, { cls: 'unclassified' },
  ])
  assert.deepEqual(summary, { total: 7, ok: 2, redirect: 1, restricted: 1, unreachable: 2, other: 1 })
  assert.equal(summary.ok + summary.redirect + summary.restricted + summary.unreachable + summary.other, summary.total)
})

test('graph defaults keep only category/subcategory labels; selected/focused nodes remain discoverable', () => {
  const shown = { category: true, subcategory: false, tool: false, tag: false, external: false, own: false }
  for (const [type, expected] of Object.entries(shown)) {
    assert.equal(shouldShowGraphLabel({ id: type, type }), expected, 'unexpected default for ' + type)
  }
  assert.equal(shouldShowGraphLabel({ id: 'a-tool', type: 'tool' }, { focused: true }), true)
  assert.equal(shouldShowGraphLabel({ id: 'a-tool', type: 'tool' }, { selected: true }), true)
  assert.equal(shouldShowGraphLabel({ id: 'a-tool', type: 'tool' }, { hidden: true, focused: true }), false)

  const graph = JSON.parse(readFileSync(new URL('../../src/data/graph.json', import.meta.url), 'utf8'))
  const visibleDefaultLabels = graph.nodes.filter((node) => shouldShowGraphLabel(node)).length
  assert.equal(visibleDefaultLabels, graph.stats.categories, 'only the primary category anchors should be labeled by default')
})

test('catalogue query sync treats a missing q as empty and reset clears every active filter', () => {
  assert.equal(queryFromSearchParams(new URLSearchParams('cat=ai&deployed=1')), '')
  assert.equal(queryFromSearchParams(new URLSearchParams('q=ollama')), 'ollama')
  const reset = resetCatalogFiltersParams(new URLSearchParams('q=ollama&cat=ai&sub=ai-local&deployed=1&offer=trial&campaign=test'))
  assert.equal(reset.has('q'), false)
  assert.equal(reset.has('cat'), false)
  assert.equal(reset.has('sub'), false)
  assert.equal(reset.has('deployed'), false)
  assert.equal(reset.has('offer'), false)
  assert.equal(reset.get('campaign'), 'test')
})

test('catalogue quick views, sort, and layout are shareable URL state', () => {
  const original = new URLSearchParams('q=ollama&cat=ai&campaign=keep')
  const list = setCatalogViewParams(original, 'list')
  assert.equal(catalogViewFromSearchParams(list), 'list')
  const named = setCatalogSortParams(list, 'name')
  assert.equal(catalogSortFromSearchParams(named), 'name')
  const saved = setSavedOnlyParams(named, true)
  assert.equal(savedOnlyFromSearchParams(saved), true)
  assert.equal(saved.has('deployed'), false)
  const deployed = setCatalogDeployedOnlyParams(saved, true)
  assert.equal(deployed.get('deployed'), '1')
  assert.equal(savedOnlyFromSearchParams(deployed), false)
  const reset = resetCatalogFiltersParams(deployed)
  for (const key of ['q', 'cat', 'sub', 'deployed', 'saved', 'offer']) assert.equal(reset.has(key), false)
  assert.equal(reset.get('view'), 'list')
  assert.equal(reset.get('sort'), 'name')
  assert.equal(reset.get('campaign'), 'keep')
  assert.equal(catalogSortFromSearchParams(new URLSearchParams('sort=unknown')), 'recommended')
})

test('deployment search, status, and location filters restore from shareable URL state', () => {
  const groups = ['github', 'cloudflare', 'home']
  const original = new URLSearchParams('q=ollama&status=down&group=github&focus=kept')
  assert.deepEqual(deployedFiltersFromSearchParams(original, groups), {
    query: 'ollama', statusFilter: 'down', groupFilter: 'github',
  })
  const restricted = setDeployedFilterParam(original, 'status', 'restricted')
  assert.equal(restricted.get('status'), 'restricted')
  assert.equal(restricted.get('group'), 'github')
  const location = setDeployedFilterParam(restricted, 'group', 'cloudflare')
  assert.equal(location.get('group'), 'cloudflare')
  assert.equal(setDeployedFilterParam(location, 'q', 'ollama ').get('q'), 'ollama ')
  assert.equal(deployedFiltersFromSearchParams(new URLSearchParams('group=unknown&status=bad'), groups).groupFilter, 'all')
  const reset = resetDeployedFiltersParams(location)
  for (const key of ['q', 'status', 'group']) assert.equal(reset.has(key), false)
  assert.equal(reset.get('focus'), 'kept')
})

test('graph view mode is deep-linkable and preserves active filters and focus', () => {
  const list = setGraphViewModeParams(new URLSearchParams('focus=ollama&cat=ai&q=local'), 'list')
  assert.equal(graphViewModeFromParams(list), 'list')
  assert.equal(list.get('focus'), 'ollama')
  assert.equal(list.get('cat'), 'ai')
  assert.equal(list.get('q'), 'local')
  const graphView = setGraphViewModeParams(list, 'graph')
  assert.equal(graphViewModeFromParams(graphView), 'graph')
  assert.equal(graphView.has('view'), false)
  assert.equal(graphView.get('focus'), 'ollama')
})

test('graph all-category chip styling matches its pressed state when deployed-only is active', () => {
  const source = readFileSync(new URL('../../src/pages/GraphPage.jsx', import.meta.url), 'utf8')
  const allCategoryCondition = 'focusedCategory === null && !deployedOnly'
  assert.equal(source.includes(`aria-pressed={${allCategoryCondition}}`), true)
  assert.equal(source.includes(`${allCategoryCondition}\n              ? 'border-[var(--accent)]/60`), true)
})

test('graph category and deployed filters are mutually exclusive and preserve deep-link focus', () => {
  const focused = new URLSearchParams('focus=ollama&deployed=1')
  const category = setCategoryFocusParams(focused, 'ai')
  assert.equal(category.get('cat'), 'ai')
  assert.equal(category.has('deployed'), false)
  assert.equal(category.get('focus'), 'ollama')

  const deployed = setDeployedOnlyParams(new URLSearchParams('focus=cloudflare-imgbed&cat=ai'), true)
  assert.equal(deployed.get('deployed'), '1')
  assert.equal(deployed.has('cat'), false)
  assert.equal(deployed.get('focus'), 'cloudflare-imgbed')

  const all = setDeployedOnlyParams(deployed, false)
  assert.equal(all.has('deployed'), false)
  assert.equal(all.has('cat'), false)
  assert.equal(all.get('focus'), 'cloudflare-imgbed')
})

test('graph Local Graph follows one or two enabled relationship hops from the active node', () => {
  const graph = {
    nodes: [
      { id: 'ollama', type: 'tool' }, { id: 'litellm', type: 'tool' },
      { id: 'open-webui', type: 'tool' }, { id: 'cat:ai', type: 'category' },
      { id: 'sub:llm', type: 'subcategory' }, { id: 'tag:local-llm', type: 'tag' },
      { id: 'external:openai', type: 'external' },
    ],
    edges: [
      { source: 'ollama', target: 'sub:llm', type: 'belongs_to' },
      { source: 'sub:llm', target: 'cat:ai', type: 'categorized_as' },
      { source: 'ollama', target: 'tag:local-llm', type: 'tagged' },
      { source: 'litellm', target: 'tag:local-llm', type: 'tagged' },
      { source: 'open-webui', target: 'tag:local-llm', type: 'tagged' },
      { source: 'ollama', target: 'external:openai', type: 'replaces' },
    ],
  }

  const oneHop = visibleNodeIds(graph, {
    localNodeId: 'ollama', localDepth: 1,
    enabledEdges: ['belongs_to', 'tagged', 'replaces'],
  })
  assert.deepEqual([...oneHop].sort(), ['external:openai', 'ollama', 'sub:llm', 'tag:local-llm'])

  const twoHops = visibleNodeIds(graph, { localNodeId: 'ollama', localDepth: 2 })
  assert.deepEqual([...twoHops].sort(), [
    'cat:ai', 'external:openai', 'litellm', 'ollama', 'open-webui', 'sub:llm', 'tag:local-llm',
  ])

  const structuralOnly = visibleNodeIds(graph, {
    localNodeId: 'ollama', localDepth: 2, enabledEdges: ['belongs_to', 'categorized_as'],
  })
  assert.deepEqual([...structuralOnly].sort(), ['cat:ai', 'ollama', 'sub:llm'])
  assert.equal(visibleNodeIds(graph, { localNodeId: 'ollama', localDepth: 99 }).size, 7)
})

test('graph Local Graph URL state is shareable and mutually exclusive with other subgraph filters', () => {
  const original = new URLSearchParams('q=ollama&cat=ai&view=list&node_q=local&node_type=tag&keep=1')
  const local = setLocalGraphParams(original, 'ollama', 2)
  assert.equal(local.get('local'), 'ollama')
  assert.equal(local.get('depth'), '2')
  assert.equal(local.get('q'), 'ollama')
  assert.equal(local.get('keep'), '1')
  for (const key of ['cat', 'deployed', 'focus', 'view', 'node_q', 'node_type']) assert.equal(local.has(key), false)
  assert.equal(setLocalGraphDepthParams(local, 1).get('depth'), '1')
  const cleared = setLocalGraphParams(local, null)
  assert.equal(cleared.has('local'), false)
  assert.equal(cleared.has('depth'), false)
  assert.equal(setCategoryFocusParams(local, 'ai').has('local'), false)
  assert.equal(setDeployedOnlyParams(local, true).has('local'), false)
})
