import test from 'node:test'
import assert from 'node:assert/strict'
import { renderWikiGuide } from '../wikiGuide.mjs'
import { presentWikiMarkdown } from '../../src/lib/wikiPresentation.js'
import { headingsFromMarkdown } from '../../src/lib/wiki.js'

const evidence = {
  verifiedAt: '2026-11-06',
  sources: [{ title: 'Official guide', url: 'https://example.org/docs', scope: 'Setup and response shape' }],
}

test('legacy usage remains byte-for-byte compatible and absent usage creates no heading', () => {
  assert.equal(renderWikiGuide({ usage: ['First step', 'Second step'] }, 'legacy'), '## 快速上手\n\n- First step\n- Second step')
  assert.equal(renderWikiGuide({ guide: [], usage: ['First step'] }, 'legacy'), '## 快速上手\n\n- First step')
  assert.equal(renderWikiGuide({}, 'overview'), '')
})

test('rich guides preserve executable Markdown and remain visible in the reading outline', () => {
  const body = '```bash\ncurl -sS http://localhost:6333/collections\n```\n\n检查 JSON 中的 collections。'
  const result = renderWikiGuide({ ...evidence, usage: ['Search-only summary'], guide: [{ title: '连接检查', body }, { title: '故障排查', body: '确认容器已经启动。' }] }, 'sample')
  assert.ok(result.includes(body))
  assert.doesNotMatch(result, /Search-only summary/)
  const presentation = presentWikiMarkdown(result, true)
  assert.equal(presentation.hasActionableGuide, true)
  assert.equal(presentation.practicalMarkdown, result)
  assert.equal(presentation.overviewMarkdown, '')
  assert.deepEqual(headingsFromMarkdown(result).map(({ level, text }) => [level, text]), [[2, '快速上手'], [3, '连接检查'], [3, '故障排查']])
})

test('malformed guide entries fail before publishing a broken tutorial', () => {
  for (const guide of ['not an array', {}, [null], [{ title: '', body: 'text' }], [{ title: 'step\n## injected', body: 'text' }], [{ title: 'step', body: '  ' }], [{ title: 'step', body: 42 }]]) {
    assert.throws(() => renderWikiGuide({ ...evidence, guide }, 'broken'), /broken/)
  }
})

test('rich guides require a verification date and scoped HTTPS sources', () => {
  const guide = [{ title: 'Setup', body: 'Run the documented steps.' }]
  for (const metadata of [{}, { verifiedAt: 'today', sources: evidence.sources }, { verifiedAt: evidence.verifiedAt, sources: [] }, { verifiedAt: evidence.verifiedAt, sources: [{ title: 'Docs', url: 'http://example.org', scope: 'Setup' }] }, { verifiedAt: evidence.verifiedAt, sources: [{ title: 'Docs', url: 'https://example.org' }] }]) {
    assert.throws(() => renderWikiGuide({ ...metadata, guide }, 'unverified'), /unverified/)
  }
})
