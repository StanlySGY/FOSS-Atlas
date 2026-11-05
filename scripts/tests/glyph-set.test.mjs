import test from 'node:test'
import assert from 'node:assert/strict'
import { wikiTextForGlyphCoverage } from '../glyphSet.mjs'

test('font glyph collection includes visible Wiki frontmatter and body but skips search-only metadata', () => {
  const markdown = [
    '---',
    'title: Ollama',
    'tags: [本地推理, LLM]',
    'sources:',
    '  - {"title":"官方文档","scope":"本地 API"}',
    'searchAliases: [bitwarden_rs]',
    'searchKeywords: [仅用于索引的罕见字词]',
    '---',
    '# Ollama',
    '本地运行模型。',
  ].join('\n')
  const visible = wikiTextForGlyphCoverage(markdown)
  assert.match(visible, /Ollama/)
  assert.match(visible, /本地推理/)
  assert.match(visible, /官方文档/)
  assert.match(visible, /本地运行模型/)
  assert.doesNotMatch(visible, /bitwarden_rs/)
  assert.doesNotMatch(visible, /仅用于索引的罕见字词/)
})
