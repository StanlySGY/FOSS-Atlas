import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import deployedWiki from '../wiki-content/g7-deployed.mjs'

const featuredIds = ['edgessh', 'short', 'paste', 'atlas-tools']

test('featured Atlas service Wiki entries include practical usage and clear security boundaries', () => {
  for (const id of featuredIds) {
    const entry = deployedWiki[id]
    assert.ok(entry, `missing Wiki prose for ${id}`)
    assert.equal(entry.updated, '2026-10-30', `${id} content revision must be explicit`)
    assert.ok(entry.usage?.length >= 2, `${id} needs actionable usage steps`)
    assert.ok(entry.cautions?.length >= 1, `${id} needs limitations or security notes`)
  }
})

test('Atlas Tools examples are read-only GET routes with documented responses', () => {
  const entry = deployedWiki['atlas-tools']
  assert.equal(entry.apiExamples.length, 4)
  assert.ok(entry.apiExamples.every((example) => example.path.startsWith('/api/') && example.response))
  assert.ok(entry.apiExamples.every((example) => !/token|password|secret/i.test(example.path)))
  assert.deepEqual(entry.apiExamples.map((example) => example.path), [
    '/api/hash?data=hello',
    '/api/uuid?count=3',
    '/api/encode?mode=base64&data=hello',
    '/api/encode?mode=url&data=hello%20world',
  ])
})

test('generated Wiki pages render usage, API examples, and cautions', () => {
  for (const id of featuredIds) {
    const markdown = readFileSync(new URL(`../../public/wiki/${id}.md`, import.meta.url), 'utf8')
    assert.match(markdown, /## 快速上手/, `${id} usage section missing from generated Wiki`)
    assert.match(markdown, /## 使用边界与安全提醒/, `${id} cautions section missing from generated Wiki`)
    assert.match(markdown, /updated: 2026-10-30/, `${id} revision missing from generated Wiki`)
  }
  const tools = readFileSync(new URL('../../public/wiki/atlas-tools.md', import.meta.url), 'utf8')
  assert.ok(tools.includes('/api/uuid?count=3'))
  assert.ok(tools.includes('aGVsbG8='))
  assert.ok(tools.includes('sha-256'))
})
