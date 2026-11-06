import test from 'node:test'
import assert from 'node:assert/strict'
import { documentParts, renderDocument } from '../../src/prerender/shell.js'

test('prerendered Wiki payload preserves literal shell dollars and script-like content', () => {
  const template = '<!doctype html><html><head></head><body><div id="root"></div></body></html>'
  const content = 'Compose $$TOKEN, `$` and $& and $\' and $1; </script><script>untrusted</script>'
  const payload = { id: 'example', content, data: { title: 'Example' } }
  const html = renderDocument(documentParts(template), '<title>Example</title>', '<h1>Example</h1>', payload)
  const match = html.match(/<script id="wiki-payload" type="application\/json">(.*?)<\/script>/)
  assert.ok(match)
  assert.deepEqual(JSON.parse(match[1]), payload)
  assert.equal((html.match(/<script/g) ?? []).length, 1)
  assert.ok(html.includes('<div id="root"><h1>Example</h1></div>'))
  assert.ok(html.endsWith('</body></html>'))
})
