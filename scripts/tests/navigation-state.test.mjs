import test from 'node:test'
import assert from 'node:assert/strict'
import { graphNodeListStateFromParams, setGraphNodeListStateParams } from '../../src/lib/graphNodeListState.js'
import { countWikiNavTools, filterWikiNavTree } from '../../src/lib/wikiNavFilter.js'

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
