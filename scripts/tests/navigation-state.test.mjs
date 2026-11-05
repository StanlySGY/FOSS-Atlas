import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { graphNodeListStateFromParams, setGraphNodeListStateParams } from '../../src/lib/graphNodeListState.js'
import { countWikiNavTools, filterWikiNavTree } from '../../src/lib/wikiNavFilter.js'
import {
  historyEntryMatchesLocation,
  savedScrollYFromHistoryState,
  scrollRestorationAction,
  withSavedScrollY,
} from '../../src/lib/scrollRestoration.js'

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

test('scroll snapshots are stored per history entry, including the initial default entry', () => {
  const initialState = { idx: 0 }
  assert.equal(historyEntryMatchesLocation(initialState, 'default'), true)
  assert.equal(historyEntryMatchesLocation({ key: 'graph-1', idx: 1 }, 'graph-1'), true)
  assert.equal(historyEntryMatchesLocation({ key: 'graph-1', idx: 1 }, 'default'), false)

  const initialWithScroll = withSavedScrollY(initialState, 'default', 700)
  assert.deepEqual(initialWithScroll, { idx: 0, __faScrollY: 700 })
  assert.equal(savedScrollYFromHistoryState(initialWithScroll, 'default'), 700)

  const graphState = { usr: { source: 'home' }, key: 'graph-1', idx: 1 }
  const graphWithScroll = withSavedScrollY(graphState, 'graph-1', 480)
  assert.deepEqual(graphWithScroll, { ...graphState, __faScrollY: 480 })
  assert.equal(savedScrollYFromHistoryState(graphWithScroll, 'graph-1'), 480)
  assert.equal(savedScrollYFromHistoryState(graphWithScroll, 'another-entry'), undefined)
  assert.equal(savedScrollYFromHistoryState({ key: 'graph-1', __faScrollY: -8 }, 'graph-1'), 0)
  assert.deepEqual(withSavedScrollY(graphState, 'another-entry', 900), graphState)
})

test('history-keyed scroll snapshots preserve router state and reject stale entries', () => {
  const initial = { usr: { from: 'initial' }, key: 'default' }
  assert.equal(historyEntryMatchesLocation(initial, 'default'), true)
  assert.equal(historyEntryMatchesLocation({ key: 'other' }, 'default'), false)
  assert.equal(savedScrollYFromHistoryState({ key: 'route-a', __faScrollY: 930 }, 'route-a'), 930)
  assert.equal(savedScrollYFromHistoryState({ key: 'route-b', __faScrollY: 930 }, 'route-a'), undefined)
  assert.equal(savedScrollYFromHistoryState({ key: 'route-a', __faScrollY: -2 }, 'route-a'), 0)
  assert.equal(savedScrollYFromHistoryState({ key: 'route-a', __faScrollY: '930' }, 'route-a'), undefined)
  assert.deepEqual(withSavedScrollY({ usr: { from: 'wiki' }, key: 'route-a' }, 'route-a', 1250), {
    usr: { from: 'wiki' }, key: 'route-a', __faScrollY: 1250,
  })
  assert.equal(withSavedScrollY({ key: 'route-b' }, 'route-a', 1250).key, 'route-b')
  assert.equal(withSavedScrollY({ key: 'route-a' }, 'route-a', Number.NaN).__faScrollY, 0)
})

test('the shared route shell owns scroll restoration and Wiki pages do not override browser Back', () => {
  const layout = readFileSync(new URL('../../src/components/Layout.jsx', import.meta.url), 'utf8')
  const wiki = readFileSync(new URL('../../src/pages/WikiPage.jsx', import.meta.url), 'utf8')
  assert.match(layout, /useNavigationType\(\)/)
  assert.match(layout, /scrollRestorationAction\(/)
  assert.match(layout, /scrollPositions = useRef\(new Map\(\)\)/)
  assert.match(layout, /savedPositions\.set\(location\.key, window\.scrollY\)/)
  assert.match(layout, /onClickCapture=\{snapshotBeforeInternalNavigation\}/)
  assert.match(layout, /addEventListener\('popstate', snapshotBeforePop, true\)/)
  assert.match(layout, /addEventListener\('scroll', rememberScrollPosition, \{ passive: true \}\)/)
  assert.match(layout, /savedScrollYFromHistoryState\(historyState, location\.key\)/)
  assert.match(layout, /withSavedScrollY\(/)
  assert.doesNotMatch(layout, /__faScrollTrace/)
  assert.match(layout, /window\.history\.scrollRestoration = 'manual'/)
  assert.match(layout, /let restorationPending = action\.type === 'anchor' \|\| action\.type === 'restore' \|\| action\.type === 'top'/)
  assert.match(layout, /if \(restorationPending\) return/)
  assert.match(layout, /document\.scrollingElement\?\.scrollHeight/)
  assert.match(layout, /action\.top <= maxScrollY \+ 1 \|\| attempts >= 180/)
  assert.match(layout, /finishRestoration\(Math\.min\(action\.top, maxScrollY\)\)/)
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
