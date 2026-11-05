import test from 'node:test'
import assert from 'node:assert/strict'
import { matchesFuzzySearchTerm, matchesSearchTerm } from '../../src/lib/resourceSearch.js'

test('resource discovery accepts a small number of Latin typos in names and aliases', () => {
  assert.equal(matchesFuzzySearchTerm('ollamma', ['Ollama']), true)
  assert.equal(matchesFuzzySearchTerm('cloudflre', ['Cloudflare Workers']), true)
  assert.equal(matchesSearchTerm('ollamma', ['a local LLM runner'], ['Ollama']), true)
})

test('fuzzy matching stays narrow for short words, Chinese terms and unrelated candidates', () => {
  assert.equal(matchesFuzzySearchTerm('oll', ['Ollama']), false)
  assert.equal(matchesFuzzySearchTerm('开源', ['开源项目']), false)
  assert.equal(matchesFuzzySearchTerm('ollamma', ['Open WebUI']), false)
  assert.equal(matchesSearchTerm('开源', ['开源工具'], ['Ollama']), true)
})
