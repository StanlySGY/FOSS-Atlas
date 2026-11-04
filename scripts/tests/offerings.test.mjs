import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { countOfferFilter, getOffering, matchesOfferFilter, offerings, OFFER_FILTERS } from '../../src/lib/offerings.js'

const resources = JSON.parse(readFileSync(new URL('../../src/data/resources.json', import.meta.url), 'utf8'))
const resourceIds = new Set(resources.map((resource) => resource.id))
const offeringData = JSON.parse(readFileSync(new URL('../../src/data/offerings.json', import.meta.url), 'utf8'))

test('offering records reference unique catalogue resources and include dated HTTPS evidence', () => {
  const seen = new Set()
  assert.equal(offeringData.schemaVersion, 1)
  assert.match(offeringData.verifiedAt, /^\d{4}-\d{2}-\d{2}$/)
  for (const entry of offerings) {
    assert.ok(resourceIds.has(entry.resourceId), 'unknown resource ' + entry.resourceId)
    assert.ok(!seen.has(entry.resourceId), 'duplicate resource ' + entry.resourceId)
    seen.add(entry.resourceId)
    assert.ok(entry.label && entry.shortLabel && entry.summary)
    assert.ok(entry.types.length > 0)
    assert.match(entry.verifiedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(entry.conditions.length > 0)
    assert.ok(entry.sources.length > 0)
    for (const [, url, claim] of entry.sources) {
      assert.equal(new URL(url).protocol, 'https:')
      assert.ok(claim.length > 0)
    }
  }
  assert.equal(seen.size, offerings.length)
})

test('offering filters count and match by explicit type, not by marketing labels', () => {
  assert.equal(OFFER_FILTERS[0].label, '全部资源')
  assert.ok(OFFER_FILTERS.some((filter) => filter.id === 'trial'))
  assert.equal(matchesOfferFilter('aws', 'trial'), true)
  assert.equal(matchesOfferFilter('fly-io', 'paid-usage'), true)
  assert.equal(matchesOfferFilter('fly-io', 'free-tier'), false)
  assert.equal(matchesOfferFilter('unknown-resource', 'free-tier'), false)
  assert.equal(matchesOfferFilter('unknown-resource', 'all'), true)
  assert.equal(countOfferFilter(resources, 'paid-usage'), 5)
  assert.equal(countOfferFilter(resources, 'credit'), 6)
  assert.equal(offerings.length, 32)
})

test('offering record keeps separate free, trial, and legacy caveats', () => {
  const railway = getOffering('railway')
  assert.ok(railway.types.includes('trial'))
  assert.ok(railway.types.includes('free-tier'))
  assert.ok(railway.conditions.some((item) => item.includes('不是持续')))
  const fly = getOffering('fly-io')
  assert.ok(fly.conditions.some((item) => item.includes('旧账户')))

  assert.equal(getOffering('missing'), null)
})

test('second credibility batch distinguishes free limits, promotional credits, and paid API usage', () => {
  assert.equal(getOffering('nextdns').limits[0][1], '300,000 次')
  assert.ok(getOffering('huggingface-spaces').conditions.some((item) => item.includes('Static Spaces')))
  assert.ok(getOffering('pexels').limits.some((item) => item[1] === '200 次'))
  assert.ok(getOffering('qrserver').conditions.some((item) => item.includes('拒绝滥用')))
  assert.ok(getOffering('textbelt').limits.some((item) => item[1] === '1 条短信'))
  assert.ok(getOffering('nominatim').summary.includes('每秒 1 次请求'))
  assert.ok(getOffering('openai-api').conditions.some((item) => item.includes('ChatGPT')))
  assert.ok(getOffering('anthropic-api').summary.includes('usage credits'))
  assert.ok(getOffering('deepseek-api').summary.includes('granted_balance'))
  assert.equal(getOffering('tencent-tokenhub').resourceId, 'tencent-tokenhub')
  assert.ok(getOffering('tencent-tokenhub').conditions.some((item) => item.includes('TokenHub')))
  assert.ok(!getOffering('openai-api').types.includes('credit'))
  assert.ok(!getOffering('anthropic-api').types.includes('credit'))
  assert.ok(getOffering('minimax').summary.includes('6 RPM'))
  assert.ok(getOffering('cursor').summary.includes('受限'))
})
