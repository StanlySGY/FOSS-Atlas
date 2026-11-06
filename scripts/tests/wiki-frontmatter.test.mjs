import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { parseFrontmatter } from '../../src/lib/wiki.js'

test('Wiki frontmatter parses structured source objects without flattening their scope', () => {
  const markdown = [
    '---',
    'title: Example',
    'updated: 2026-11-05',
    'verifiedAt: 2026-11-04',
    'sources:',
    '  - {"title":"Official docs","url":"https://example.com/docs","type":"official","scope":"API authentication requirements"}',
    '---',
    '# Example',
  ].join('\n')
  const parsed = parseFrontmatter(markdown)
  assert.equal(parsed.data.updated, '2026-11-05')
  assert.equal(parsed.data.verifiedAt, '2026-11-04')
  assert.deepEqual(parsed.data.sources, [{
    title: 'Official docs',
    url: 'https://example.com/docs',
    type: 'official',
    scope: 'API authentication requirements',
  }])
})

test('the curated Ollama Wiki has bounded official-source evidence and labels it as partial', () => {
  const markdown = readFileSync(new URL('../../public/wiki/ollama.md', import.meta.url), 'utf8')
  const parsed = parseFrontmatter(markdown)
  assert.match(parsed.data.verifiedAt, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(parsed.data.verifiedAt, parsed.data.updated)
  for (const url of ['https://docs.ollama.com/quickstart', 'https://docs.ollama.com/faq', 'https://docs.ollama.com/api/chat', 'https://docs.ollama.com/cli']) {
    assert.ok(parsed.data.sources.some((source) => source.url === url), 'missing evidence for ' + url)
  }
  assert.ok(parsed.data.sources.every((source) => source.type === 'official' && source.url.startsWith('https://') && source.scope.length > 20))
  assert.match(markdown, /不覆盖硬件适配、性能或所有 SDK 功能/)
  const page = readFileSync(new URL('../../src/pages/WikiPage.jsx', import.meta.url), 'utf8')
  assert.match(page, /部分事实已核验/)
  assert.match(page, /不代表整页所有信息均已核验/)
})

test('all generated Wiki search records are present and no page claims unsupported verification', () => {
  const resources = JSON.parse(readFileSync(new URL('../../src/data/resources.json', import.meta.url), 'utf8'))
  const index = JSON.parse(readFileSync(new URL('../../src/data/resource-search-index.json', import.meta.url), 'utf8'))
  assert.equal(Object.keys(index).length, resources.length)
  for (const resource of resources) {
    const entry = index[resource.id]
    assert.ok(entry, 'missing search entry for ' + resource.id)
    for (const key of ['features', 'scenarios', 'usage', 'aliases', 'keywords']) assert.ok(Array.isArray(entry[key]), resource.id + ' missing ' + key)
  }
  const wikiFiles = readdirSync(new URL('../../public/wiki/', import.meta.url)).filter((file) => file.endsWith('.md'))
  for (const file of wikiFiles) {
    const markdown = readFileSync(new URL('../../public/wiki/' + file, import.meta.url), 'utf8')
    if (/^verifiedAt:/m.test(markdown)) assert.match(markdown, /^sources:\n(?:\s+- \{.*\}\n)+/m, file + ' needs explicit source evidence')
  }
})
