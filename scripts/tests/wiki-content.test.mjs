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

test('Atlas Paste documents seven-day expiry for new shares and legacy retention limits', () => {
  const entry = deployedWiki.paste
  assert.ok(entry.summary.includes('保留 7 天'))
  assert.ok(entry.features.some((item) => item.includes('7 天') && item.includes('TTL')))
  assert.ok(entry.usage.some((item) => item.includes('expires_at')))
  assert.ok(entry.cautions.some((item) => item.includes('旧分享') && item.includes('未追溯')))
  const markdown = readFileSync(new URL('../../public/wiki/paste.md', import.meta.url), 'utf8')
  assert.match(markdown, /新建分享保留 7 天/)
  assert.match(markdown, /expires_at/)
  assert.match(markdown, /旧分享未追溯设置 TTL/)
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

test('Wiki documents deployed QR, Geo and Meta service behavior with current policy and safety boundaries', () => {
  const geo = deployedWiki['atlas-geo']
  assert.deepEqual(geo.apiExamples.map((example) => example.path), [
    '/search?q=Seoul',
    '/reverse?lat=37.5665&lon=126.9780',
  ])
  assert.ok(geo.features.some((item) => item.includes('Durable Object')))
  assert.ok(geo.cautions.some((item) => item.includes('每秒最多 1 次')))
  assert.ok(geo.cautions.some((item) => item.includes('自动补全') && item.includes('系统性查询')))
  assert.ok(geo.usage.some((item) => item.includes('config:atlas-geo-upstream')))
  assert.ok(geo.apiExamples.every((example) => example.response.attribution === '© OpenStreetMap contributors'))

  const qr = deployedWiki.qr
  assert.ok(qr.features.some((item) => item.includes('/qr.png') && item.includes('image/png')))
  assert.ok(qr.usage.some((item) => item.includes('/qr.png?data=') && item.includes('.png')))
  assert.equal(qr.cautions.some((item) => item.includes('image/svg+xml') && item.includes('/qr.png')), false)

  const meta = deployedWiki['atlas-meta']
  assert.ok(meta.features.some((item) => item.includes('400 KiB') && item.includes('10 秒')))
  assert.ok(meta.features.some((item) => item.includes('陈旧结果回退')))
  assert.ok(meta.cautions.some((item) => item.includes('DNS rebinding')))
  assert.ok(meta.cautions.some((item) => item.includes('不构成') && item.includes('完整防护')))
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
