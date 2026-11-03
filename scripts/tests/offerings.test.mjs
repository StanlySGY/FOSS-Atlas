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
  assert.equal(countOfferFilter(resources, 'paid-usage'), 2)
  assert.equal(offerings.length, 20)
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
