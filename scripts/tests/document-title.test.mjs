import test from 'node:test'
import assert from 'node:assert/strict'
import { documentTitleForLocation } from '../../src/lib/documentTitle.js'
import { wikiTitle, STATIC_ROUTES } from '../../src/prerender/site.js'

test('client-side static route titles stay aligned with prerender metadata', () => {
  for (const route of STATIC_ROUTES) {
    assert.equal(documentTitleForLocation(route.path), route.title, route.path)
    assert.equal(documentTitleForLocation(route.path.replace(/\/$/, '')), route.title, `${route.path} without trailing slash`)
  }
})

test('client-side wiki navigation computes the same title as prerender', () => {
  const ollama = { id: 'ollama', name: 'Ollama', sub_category_name: '本地跑大模型' }
  const resources = new Map([['ollama', ollama]])
  assert.equal(documentTitleForLocation('/wiki/ollama/', resources), wikiTitle(ollama))
  assert.equal(documentTitleForLocation('/wiki/ollama', resources), wikiTitle(ollama))
})

test('unknown or malformed routes fall back to the home title', () => {
  const homeTitle = STATIC_ROUTES.find((route) => route.path === '/').title
  assert.equal(documentTitleForLocation('/missing/page/'), homeTitle)
  assert.equal(documentTitleForLocation('/wiki/%E0%A4%A/', new Map()), homeTitle)
})
