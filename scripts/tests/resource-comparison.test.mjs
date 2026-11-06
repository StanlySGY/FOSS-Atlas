import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COMPARISON_LIMIT,
  COMPARISON_STORAGE_KEY,
  buildComparisonShareUrl,
  comparisonIdsFromSearchParams,
  copyComparisonShareUrl,
  normalizeComparisonIds,
  readComparisonIds,
  removeComparisonId,
  setComparisonOpenParams,
  setComparisonParams,
  toggleComparisonId,
  writeComparisonIds,
} from '../../src/lib/resourceComparison.js'

const validIds = new Set(['ollama', 'open-webui', 'litellm', 'dify'])

function memoryStorage(initial = null) {
  const values = new Map(initial === null ? [] : [[COMPARISON_STORAGE_KEY, initial]])
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  }
}

test('selection removes invalid and duplicate IDs before applying the three-resource cap', () => {
  const input = ['missing', null, ' ollama ', 'ollama', '', 42, 'open-webui', 'litellm', 'dify']
  const before = [...input]
  assert.deepEqual(normalizeComparisonIds(input, validIds), ['ollama', 'open-webui', 'litellm'])
  assert.equal(COMPARISON_LIMIT, 3)
  assert.deepEqual(input, before, 'normalization must not mutate the caller’s selection')
  assert.deepEqual(normalizeComparisonIds('ollama', validIds), [])
  assert.deepEqual(normalizeComparisonIds({ id: 'ollama' }, validIds), [])
  assert.deepEqual(normalizeComparisonIds(['ollama,open-webui']), [], 'one stored item cannot inject another ID')
})

test('URL comparison overrides saved selection, including explicit empty and invalid URLs', () => {
  const saved = ['dify', 'litellm']
  assert.deepEqual(comparisonIdsFromSearchParams(new URLSearchParams('compare=ollama,missing,ollama,open-webui'), saved, validIds), ['ollama', 'open-webui'])
  assert.deepEqual(comparisonIdsFromSearchParams(new URLSearchParams('compare='), saved, validIds), [])
  assert.deepEqual(comparisonIdsFromSearchParams(new URLSearchParams('compare=missing'), saved, validIds), [])
  assert.deepEqual(comparisonIdsFromSearchParams(new URLSearchParams('q=local&saved=1'), [...saved, 'missing'], validIds), saved)
})

test('selection persists across independent reads and a shared link replaces the saved fallback', () => {
  const storage = memoryStorage()
  writeComparisonIds(['dify', 'ollama', 'ollama', 'missing'], validIds, storage)
  assert.deepEqual(readComparisonIds(validIds, storage), ['dify', 'ollama'])
  const incoming = comparisonIdsFromSearchParams(new URLSearchParams('compare=litellm,open-webui'), readComparisonIds(validIds, storage), validIds)
  writeComparisonIds(incoming, validIds, storage)
  const remounted = comparisonIdsFromSearchParams(new URLSearchParams('cat=ai'), readComparisonIds(validIds, storage), validIds)
  assert.deepEqual(remounted, ['litellm', 'open-webui'])
  writeComparisonIds([], validIds, storage)
  assert.deepEqual(readComparisonIds(validIds, storage), [])
})

test('storage reads reject malformed JSON, obsolete IDs, and wrong JSON shapes', () => {
  for (const input of ['{broken', 'null', '42', '"ollama"', '{"ids":["ollama"]}', '[{}]']) {
    assert.deepEqual(readComparisonIds(validIds, memoryStorage(input)), [])
  }
  assert.deepEqual(readComparisonIds(validIds, memoryStorage('["missing","ollama","ollama","open-webui"]')), ['ollama', 'open-webui'])
  assert.deepEqual(readComparisonIds(new Set(['open-webui']), memoryStorage('["ollama","open-webui"]')), ['open-webui'])
})

test('denied storage reads and writes do not prevent selection or explicit clearing', () => {
  const denied = {
    getItem() { throw new Error('access denied') },
    setItem() { throw new Error('quota exceeded') },
  }
  assert.deepEqual(readComparisonIds(validIds, denied), [])
  assert.deepEqual(writeComparisonIds(['ollama', 'missing'], validIds, denied), ['ollama'])
  assert.deepEqual(writeComparisonIds([], validIds, denied), [])
  assert.deepEqual(readComparisonIds(validIds, null), [])
  assert.deepEqual(writeComparisonIds(['open-webui'], validIds, null), ['open-webui'])
  const cleared = setComparisonParams(new URLSearchParams('saved=1&compare=ollama'), [], validIds)
  assert.equal(cleared.has('compare'), true)
  assert.deepEqual(comparisonIdsFromSearchParams(cleared, ['dify'], validIds), [])
})

test('a browser that throws when obtaining localStorage is also supported', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { get localStorage() { throw new Error('SecurityError') } },
  })
  try {
    assert.deepEqual(readComparisonIds(validIds), [])
    assert.deepEqual(writeComparisonIds(['ollama'], validIds), ['ollama'])
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else delete globalThis.window
  }
})

test('toggling rejects a fourth resource until an existing selection is removed', () => {
  const selected = ['ollama', 'open-webui', 'litellm']
  assert.deepEqual(toggleComparisonId(selected, 'dify', validIds), selected)
  assert.deepEqual(toggleComparisonId(selected, 'missing', validIds), selected)
  const removed = toggleComparisonId(selected, 'open-webui', validIds)
  assert.deepEqual(removed, ['ollama', 'litellm'])
  assert.deepEqual(toggleComparisonId(removed, 'dify', validIds), ['ollama', 'litellm', 'dify'])
  assert.deepEqual(removeComparisonId(selected, 'ollama', validIds), ['open-webui', 'litellm'])
  assert.deepEqual(removeComparisonId(selected, 'missing', validIds), selected)
  assert.deepEqual(selected, ['ollama', 'open-webui', 'litellm'])
})

test('selection URL updates preserve every unrelated filter, including repeated keys', () => {
  const filters = new URLSearchParams('q=local+chat&saved=1&cat=ai&sub=llm&sort=name&view=list&offer=trial&deployed=1&link=review&tag=a&tag=b')
  const previous = new URLSearchParams(filters)
  previous.append('compare', 'missing')
  previous.append('compare', 'dify')
  previous.set('comparing', '1')
  const before = previous.toString()
  const next = setComparisonParams(previous, ['ollama', 'open-webui', 'ollama', 'missing'], validIds)
  assert.equal(previous.toString(), before, 'router-owned params must not be mutated')
  assert.deepEqual(next.getAll('compare'), ['ollama,open-webui'])
  assert.equal(next.get('comparing'), '1')
  next.delete('compare')
  next.delete('comparing')
  assert.deepEqual([...next], [...filters])
})

test('removing down to one or clearing closes a comparison without erasing filters', () => {
  const previous = new URLSearchParams('q=chat&saved=1&compare=ollama,open-webui&comparing=1')
  for (const selection of [['ollama'], []]) {
    const next = setComparisonParams(previous, selection, validIds)
    assert.equal(next.has('comparing'), false)
    assert.equal(next.get('compare'), selection.join(','))
    assert.equal(next.get('q'), 'chat')
    assert.equal(next.get('saved'), '1')
  }
})

test('open and close change only comparison state; fewer than two valid IDs cannot open', () => {
  const previous = new URLSearchParams('q=chat&saved=1&view=list')
  const opened = setComparisonOpenParams(previous, true, ['ollama', 'open-webui', 'ollama'], validIds)
  assert.equal(opened.get('compare'), 'ollama,open-webui')
  assert.equal(opened.get('comparing'), '1')
  const closed = setComparisonOpenParams(opened, false)
  assert.equal(closed.has('comparing'), false)
  assert.equal(closed.get('compare'), 'ollama,open-webui')
  closed.delete('compare')
  assert.deepEqual([...closed], [...previous])
  assert.equal(setComparisonOpenParams(previous, true, ['ollama', 'missing'], validIds).has('comparing'), false)
})

test('share URLs use the current origin and configured root, excluding searches and personal state', () => {
  const url = new URL(buildComparisonShareUrl({
    origin: 'https://user:secret@example.test:8443/FOSS-Atlas/wiki/ollama/?saved=1&q=private#history',
    basePath: '/FOSS-Atlas/',
    ids: ['ollama', 'missing', 'open-webui', 'ollama', 'litellm', 'dify'],
    validIds,
  }))
  assert.equal(url.origin, 'https://example.test:8443')
  assert.equal(url.pathname, '/FOSS-Atlas/')
  assert.equal(url.username, '')
  assert.equal(url.password, '')
  assert.equal(url.hash, '')
  assert.deepEqual([...url.searchParams], [['compare', 'ollama,open-webui,litellm'], ['comparing', '1']])
  assert.deepEqual(comparisonIdsFromSearchParams(url.searchParams, ['dify'], validIds), ['ollama', 'open-webui', 'litellm'])
})

test('share URLs also support custom-domain roots and reject unusable comparisons', () => {
  const options = { origin: 'https://catalogue.test/?q=secret', ids: ['ollama', 'open-webui'], validIds }
  assert.equal(new URL(buildComparisonShareUrl(options)).pathname, '/')
  assert.equal(new URL(buildComparisonShareUrl({ ...options, basePath: '/atlas' })).pathname, '/atlas/')
  const baseWithExtras = new URL(buildComparisonShareUrl({ ...options, basePath: '/atlas/?saved=1#private' }))
  assert.equal(baseWithExtras.pathname, '/atlas/')
  assert.equal(baseWithExtras.hash, '')
  assert.equal(baseWithExtras.searchParams.has('saved'), false)
  assert.equal(buildComparisonShareUrl({ ...options, ids: ['ollama', 'missing'] }), '')
  assert.equal(buildComparisonShareUrl({ ...options, ids: ['ollama', 'ollama'] }), '')
  assert.equal(buildComparisonShareUrl({ ...options, origin: 'not a url' }), '')
  assert.equal(buildComparisonShareUrl({ ...options, origin: 'file:///tmp/page.html' }), '')
})

test('clipboard success is reported only after writing; rejection or unavailability requests manual copying', async () => {
  const url = buildComparisonShareUrl({ origin: 'https://catalogue.test', ids: ['ollama', 'dify'], validIds })
  const writes = []
  assert.equal(await copyComparisonShareUrl(url, { async writeText(value) { writes.push(value) } }), true)
  assert.deepEqual(writes, [url])
  assert.equal(await copyComparisonShareUrl(url, null), false)
  assert.equal(await copyComparisonShareUrl(url, {}), false)
  assert.equal(await copyComparisonShareUrl(url, { async writeText() { throw new Error('NotAllowedError') } }), false)
  assert.equal(await copyComparisonShareUrl(url, { writeText() { throw new Error('SecurityError') } }), false)
  assert.equal(await copyComparisonShareUrl('', { writeText() { assert.fail('an empty URL must not be copied') } }), false)
})
