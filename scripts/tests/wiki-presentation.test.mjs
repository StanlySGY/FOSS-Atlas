import test from 'node:test'
import assert from 'node:assert/strict'
import { presentWikiMarkdown } from '../../src/lib/wikiPresentation.js'

const fence = String.fromCharCode(96).repeat(3)
const generated = [
  '## 一句话总结', '', '重复的资源介绍。', '',
  '## 核心功能 / 特点', '', '- 功能 A', '',
  '## 适用场景', '', '- 场景 A', '',
  '## 快速上手', '', '1. 登录官方控制台。', '',
  '## API 调用示例', '', fence + 'bash',
  'curl https://example.test/api', fence, '',
  '## 使用边界与安全提醒', '', '- 注意速率限制。', '',
  '## 同类推荐', '', '- [[Other Tool]]',
].join('\n')

test('generated Wiki keeps actionable instructions visible and folds generic overview', () => {
  const result = presentWikiMarkdown(generated, true)
  assert.match(result.overviewMarkdown, /核心功能/)
  assert.match(result.overviewMarkdown, /适用场景/)
  assert.doesNotMatch(result.overviewMarkdown, /快速上手|API 调用示例/)
  assert.match(result.practicalMarkdown, /快速上手/)
  assert.ok(result.practicalMarkdown.includes('curl https://example.test/api'))
  assert.match(result.practicalMarkdown, /速率限制/)
  assert.doesNotMatch(result.practicalMarkdown, /一句话总结|同类推荐/)
  assert.equal(result.hasActionableGuide, true)
})

test('generated overview-only Wiki pages disclose that no step-by-step guide is present', () => {
  const result = presentWikiMarkdown('## 核心功能 / 特点\n\n- 功能 A\n\n## 适用场景\n\n- 场景 A', true)
  assert.equal(result.hasActionableGuide, false)
  assert.equal(result.practicalMarkdown, '')
  assert.match(result.overviewMarkdown, /功能 A/)
})

test('hand-written Wiki pages preserve their full markdown without repartitioning', () => {
  const markdown = ['## 概览', '', '内容', '', '## 深度配置', '', fence + 'yaml', 'value: true', fence].join('\n')
  assert.deepEqual(presentWikiMarkdown(markdown, false), {
    overviewMarkdown: '',
    practicalMarkdown: markdown,
    hasActionableGuide: false,
  })
})
