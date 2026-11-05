import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasFuzzySearchMatch, matchesFuzzySearchTerm, matchesSearchTerm } from '../../src/lib/resourceSearch.js'

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


test('multi-word fuzzy queries identify the token rescued by name or alias matching', () => {
  assert.equal(hasFuzzySearchMatch('cloudflre workers', ['Cloudflare Workers'], ['Cloudflare Workers']), true)
  assert.equal(hasFuzzySearchMatch('cloudflare workers', ['Cloudflare Workers'], ['Cloudflare Workers']), false)
  assert.equal(hasFuzzySearchMatch('ollamma local', ['a local LLM runner'], ['Ollama']), true)
  assert.equal(hasFuzzySearchMatch('oll local', ['a local LLM runner'], ['Ollama']), false)
  assert.equal(hasFuzzySearchMatch('cloudflre workers', ['cloudflre workers'], ['Cloudflare Workers']), false)
})

test('home search and command palette use token-level fuzzy ranking for multi-word queries', () => {
  const home = readFileSync(new URL('../../src/pages/Home.jsx', import.meta.url), 'utf8')
  const palette = readFileSync(new URL('../../src/components/CommandPalette.jsx', import.meta.url), 'utf8')
  assert.ok(home.includes('hasFuzzySearchMatch(query,fields,[resource.name,...aliases])'))
  assert.ok(palette.includes('hasFuzzySearchMatch(q,fields,[r.name,...aliases])'))
})
