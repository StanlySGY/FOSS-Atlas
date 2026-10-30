import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FEATURED_BUILD_IDS, featuredBuildsFrom } from '../../src/lib/featuredBuilds.js'

const resources = JSON.parse(readFileSync(new URL('../../src/data/resources.json', import.meta.url), 'utf8'))

test('the featured gallery resolves only curated Atlas-owned services that are actually deployed', () => {
  const featured = featuredBuildsFrom(resources)
  assert.deepEqual(featured.map((resource) => resource.id), FEATURED_BUILD_IDS)
  assert.equal(featured.length, 4)
  assert.ok(featured.every((resource) => resource.own && resource.deployed && resource.wiki && resource.url.startsWith('https://')))
})

test('missing, third-party, and undeployed catalogue entries never leak into the showcase', () => {
  const featured = featuredBuildsFrom([
    { id: 'edgessh', own: true, deployed: true },
    { id: 'short', own: false, deployed: true },
    { id: 'paste', own: true, deployed: false },
  ])
  assert.deepEqual(featured.map((resource) => resource.id), ['edgessh'])
})
