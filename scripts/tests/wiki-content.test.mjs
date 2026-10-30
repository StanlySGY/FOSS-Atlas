import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import deployedWiki from '../wiki-content/g7-deployed.mjs'

const featuredIds = ['edgessh', 'short', 'paste', 'atlas-tools']
const additionalEdgeIds = ['nodes', 'qr', 'px', 'ip', 'check', 'atlas-geo', 'atlas-meta']
const documentedEdgeIds = [...featuredIds, ...additionalEdgeIds]

test('featured Atlas service Wiki entries include practical usage and clear security boundaries', () => {
  for (const id of featuredIds) {
    const entry = deployedWiki[id]
    assert.ok(entry, `missing Wiki prose for ${id}`)
    assert.equal(entry.updated, '2026-10-30', `${id} content revision must be explicit`)
    assert.ok(entry.usage?.length >= 2, `${id} needs actionable usage steps`)
    assert.ok(entry.cautions?.length >= 1, `${id} needs limitations or security notes`)
  }
})

test('remaining Atlas edge service Wiki entries include practical usage and cautions', () => {
  for (const id of additionalEdgeIds) {
    const entry = deployedWiki[id]
    assert.ok(entry, `missing Wiki prose for ${id}`)
    assert.equal(entry.updated, '2026-10-30', `${id} content revision must be explicit`)
    assert.ok(entry.usage?.length >= 2, `${id} needs actionable usage steps`)
    assert.ok(entry.cautions?.length >= 1, `${id} needs limitations or security notes`)
    assert.ok(entry.apiExamples?.length >= 1, `${id} needs a verified read-only GET example`)
  }
})

test('documented API examples are safe read-only GET URLs', () => {
  for (const id of documentedEdgeIds) {
    const entry = deployedWiki[id]
    for (const example of entry.apiExamples ?? []) {
      assert.ok(example.title, `${id} API example needs a title`)
      assert.ok(example.path.startsWith('/') && !example.path.startsWith('//'), `${id} path must be site-relative`)
      assert.doesNotMatch(example.path, /[\r\n'`\\\s]/, `${id} path must not break the generated curl command`)
    }
  }
})

test('Atlas Tools examples retain the verified read-only endpoints and responses', () => {
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

test('Wiki documents verified Geo paths and does not advertise the failing JSON alias', () => {
  const geo = deployedWiki['atlas-geo']
  assert.deepEqual(geo.apiExamples.map((example) => example.path), [
    '/search?q=Seoul',
    '/reverse?lat=37.5665&lon=126.9780',
  ])
  assert.ok(geo.cautions.some((item) => item.includes('/json') && item.includes('暂不可用')))
  const qr = deployedWiki.qr
  assert.ok(qr.cautions.some((item) => item.includes('/qr.png') && item.includes('image/svg+xml')))
  const meta = deployedWiki['atlas-meta']
  assert.equal(meta.apiExamples[0].response.error, '抓取失败')
  assert.ok(meta.cautions.some((item) => item.includes('间歇性抓取失败')))
})

test('generated Wiki pages render usage, API examples, and cautions', () => {
  for (const id of documentedEdgeIds) {
    const markdown = readFileSync(new URL(`../../public/wiki/${id}.md`, import.meta.url), 'utf8')
    assert.match(markdown, /## 快速上手/, `${id} usage section missing from generated Wiki`)
    if (additionalEdgeIds.includes(id) || id === 'atlas-tools') {
      assert.match(markdown, /## API 调用示例/, `${id} API section missing from generated Wiki`)
    }
    assert.match(markdown, /## 使用边界与安全提醒/, `${id} cautions section missing from generated Wiki`)
    assert.match(markdown, /updated: 2026-10-30/, `${id} revision missing from generated Wiki`)
  }
  const tools = readFileSync(new URL('../../public/wiki/atlas-tools.md', import.meta.url), 'utf8')
  assert.ok(tools.includes('/api/uuid?count=3'))
  assert.ok(tools.includes('aGVsbG8='))
  assert.ok(tools.includes('sha-256'))
  const geo = readFileSync(new URL('../../public/wiki/atlas-geo.md', import.meta.url), 'utf8')
  assert.ok(geo.includes("curl -sS 'https://geo.sgyyyds.qzz.io/search?q=Seoul'"))
})
