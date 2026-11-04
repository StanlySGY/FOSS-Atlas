import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { graphNodeListStateFromParams, setGraphNodeListStateParams } from '../../src/lib/graphNodeListState.js'
import { countWikiNavTools, filterWikiNavTree } from '../../src/lib/wikiNavFilter.js'
import { scrollRestorationAction } from '../../src/lib/scrollRestoration.js'

test('cross-page navigation preserves filter scroll, restores POP entries, and prioritizes hash anchors', () => {
  assert.deepEqual(scrollRestorationAction({ isInitial: true, pathname: '/', previousPathname: '/' }), { type: 'top' })
  assert.deepEqual(scrollRestorationAction({ navigationType: 'PUSH', previousPathname: '/', pathname: '/wiki/ollama' }), { type: 'top' })
  assert.deepEqual(scrollRestorationAction({ navigationType: 'REPLACE', previousPathname: '/', pathname: '/' }), { type: 'preserve' })
  assert.deepEqual(scrollRestorationAction({ navigationType: 'PUSH', previousPathname: '/graph', pathname: '/graph' }), { type: 'preserve' })
  assert.deepEqual(scrollRestorationAction({ navigationType: 'POP', previousPathname: '/wiki/ollama', pathname: '/', savedY: 1240 }), { type: 'restore', top: 1240 })
  assert.deepEqual(scrollRestorationAction({ navigationType: 'POP', previousPathname: '/wiki/ollama', pathname: '/', savedY: -8 }), { type: 'restore', top: 0 })
  assert.deepEqual(scrollRestorationAction({ isInitial: true, pathname: '/deployed', previousPathname: '/deployed', hash: '#atlas-tools' }), { type: 'anchor' })
  assert.deepEqual(scrollRestorationAction({ navigationType: 'POP', previousPathname: '/wiki/ollama', pathname: '/deployed', hash: '#atlas-tools', savedY: 880 }), { type: 'anchor' })
  assert.deepEqual(scrollRestorationAction({ navigationType: 'REPLACE', previousPathname: '/deployed', pathname: '/deployed', previousHash: '#atlas-tools', hash: '' }), { type: 'preserve' })
})

test('the shared route shell owns scroll restoration and Wiki pages do not override browser Back', () => {
  const layout = readFileSync(new URL('../../src/components/Layout.jsx', import.meta.url), 'utf8')
  const wiki = readFileSync(new URL('../../src/pages/WikiPage.jsx', import.meta.url), 'utf8')
  assert.match(layout, /useNavigationType\(\)/)
  assert.match(layout, /scrollRestorationAction\(/)
  assert.match(layout, /scrollPositions = useRef\(new Map\(\)\)/)
  assert.match(layout, /savedPositions\.set\(location\.key, window\.scrollY\)/)
  assert.match(layout, /window\.history\.scrollRestoration = 'manual'/)
  assert.match(layout, /action\.type === 'restore' \|\| action\.type === 'top'/)
  assert.doesNotMatch(wiki, /window\.scrollTo\(\{ top: 0 \}\)/)
})

test('graph node-list search and type filters survive navigation and preserve graph context', () => {
  const initial = new URLSearchParams('view=list&cat=ai&focus=ollama&campaign=weekly')
  const searched = setGraphNodeListStateParams(initial, { query: 'ollama' })
  const typed = setGraphNodeListStateParams(searched, { typeFilter: 'tool' })
  assert.deepEqual(graphNodeListStateFromParams(typed), { query: 'ollama', typeFilter: 'tool' })
  assert.equal(typed.get('view'), 'list')
  assert.equal(typed.get('cat'), 'ai')
  assert.equal(typed.get('focus'), 'ollama')
  assert.equal(typed.get('campaign'), 'weekly')
  assert.equal(setGraphNodeListStateParams(typed, { query: '' }).has('node_q'), false)
  assert.equal(setGraphNodeListStateParams(typed, { typeFilter: 'invalid' }).has('node_type'), false)
  assert.deepEqual(graphNodeListStateFromParams(new URLSearchParams('node_type=unknown')), { query: '', typeFilter: 'all' })
})

test('Wiki navigation search keeps matching category ancestry and supports id lookup', () => {
  const tree = [
    { id: 'ai', name: 'AI / LLM', count: 3, subs: [
      { id: 'local', name: '本地模型', count: 2, tools: [{ id: 'ollama', name: 'Ollama' }, { id: 'lm-studio', name: 'LM Studio' }] },
      { id: 'cloud', name: '云端模型', count: 1, tools: [{ id: 'chat', name: 'Chat API' }] },
    ] },
    { id: 'dev', name: '开发工具', count: 1, subs: [
      { id: 'editor', name: '编辑器', count: 1, tools: [{ id: 'cline', name: 'Cline' }] },
    ] },
  ]
  const byTool = filterWikiNavTree(tree, 'ollama')
  assert.equal(countWikiNavTools(byTool), 1)
  assert.deepEqual(byTool.map((cat) => cat.id), ['ai'])
  assert.deepEqual(byTool[0].subs.map((sub) => sub.id), ['local'])
  assert.deepEqual(byTool[0].subs[0].tools.map((tool) => tool.id), ['ollama'])
  const byId = filterWikiNavTree(tree, 'lm-studio')
  assert.deepEqual(byId[0].subs[0].tools.map((tool) => tool.id), ['lm-studio'])
  const byCategory = filterWikiNavTree(tree, '开发工具')
  assert.equal(countWikiNavTools(byCategory), 1)
  assert.deepEqual(byCategory[0].subs[0].tools.map((tool) => tool.id), ['cline'])
  assert.equal(filterWikiNavTree(tree, 'missing').length, 0)
  assert.equal(filterWikiNavTree(tree, '   '), tree)
})
