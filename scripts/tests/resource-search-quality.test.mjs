import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { scoreResourceSearch } from '../../src/lib/resourceSearch.js'

const resources = JSON.parse(readFileSync(new URL('../../src/data/resources.json', import.meta.url), 'utf8'))
const index = JSON.parse(readFileSync(new URL('../../src/data/resource-search-index.json', import.meta.url), 'utf8'))

function score(resource, query) {
  const entry = index[resource.id] ?? {}
  let hostname = resource.url
  try { hostname = new URL(resource.url).hostname } catch {}
  return scoreResourceSearch(query, {
    name: resource.name,
    aliases: entry.aliases,
    tags: resource.tags,
    description: resource.description,
    hostname,
    url: resource.url,
    category: resource.category_name,
    subCategory: resource.sub_category_name,
    summary: entry.summary,
    features: entry.features,
    scenarios: entry.scenarios,
    usage: entry.usage,
    keywords: entry.keywords,
  })
}

function search(query) {
  return resources
    .map((resource) => ({ resource, score: score(resource, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.name.localeCompare(b.resource.name))
}

test('authored aliases rescue the current rebrand and upstream project names', () => {
  assert.deepEqual(search('Windsurf').map((item) => item.resource.id), ['codeium'])
  assert.deepEqual(search('oobabooga').map((item) => item.resource.id), ['text-generation-webui'])
})

test('task-oriented Chinese keywords find the actual short-link, PDF and monitoring resources', () => {
  assert.deepEqual(search('短链接 点击统计').map((item) => item.resource.id).sort(), ['shlink', 'short'])
  assert.deepEqual(search('PDF 编辑').map((item) => item.resource.id), ['stirling-pdf'])
  assert.deepEqual(search('服务器监控').map((item) => item.resource.id), ['uptime-kuma'])
})

test('workflow, LAN sync, Git hosting and cloud deployment queries find their authored matches', () => {
  assert.deepEqual(search('智能体工作流').map((item) => item.resource.id).sort(), ['dify', 'flowise', 'langflow'])
  assert.deepEqual(search('局域网文件同步').map((item) => item.resource.id), ['syncthing'])
  assert.deepEqual(search('自建 Git 仓库').map((item) => item.resource.id).sort(), ['forgejo', 'gitea'])
  assert.deepEqual(search('云端部署').map((item) => item.resource.id).sort(), ['fly-io', 'koyeb', 'railway', 'render'])
})

test('multi-token ranking suppresses unrelated cross-field mentions for GitHub alternatives', () => {
  assert.deepEqual(search('GitHub 替代').map((item) => item.resource.id).sort(), ['forgejo', 'gitea'])
  assert.ok(score(resources.find((resource) => resource.id === 'supabase'), 'Supabase Postgres') > 0)
  assert.ok(score(resources.find((resource) => resource.id === 'cloudflare'), 'Cloudflare CDN') > 0)
})

test('curated Wiki pages contribute their real alternatives, old names and task vocabulary', () => {
  assert.ok(search('本地模型').some((item) => item.resource.id === 'ollama'))
  assert.deepEqual(search('Google Photos 替代').map((item) => item.resource.id), ['immich'])
  assert.ok(search('Google Drive 替代').some((item) => item.resource.id === 'nextcloud'))
  assert.deepEqual(search('bitwarden_rs').map((item) => item.resource.id), ['vaultwarden'])
  assert.deepEqual(search('邮件校验').map((item) => item.resource.id).sort(), ['check', 'disify'])
})

test('single-token Chinese matches suppress weak incidental mentions but retain authored intent keywords', () => {
  assert.deepEqual(search('域名证书').map((item) => item.resource.id).sort(), ['buypass-go', 'cloudflare-origin-ca', 'lets-encrypt', 'zerossl'])
  assert.ok(search('家庭云').some((item) => item.resource.id === 'casaos'))
})

test('local-model intent ranks actual model runners, while Continue stays in code-completion search', () => {
  const localModelIds = search('本地模型').map((item) => item.resource.id)
  for (const id of ['gpt4all', 'ollama', 'text-generation-webui', 'jan', 'lm-studio']) assert.ok(localModelIds.includes(id), id + ' should match local-model intent')
  assert.equal(localModelIds.includes('continue'), false, 'an editor integration is not a local model runner')
  assert.ok(search('AI 代码补全').some((item) => item.resource.id === 'continue'))
})

test('catalogue gaps stay empty instead of mapping unrelated resources to unsupported intents', () => {
  assert.deepEqual(search('向量数据库'), [])
  assert.deepEqual(search('邮件服务'), [])
})

test('all generated search entries retain their schema and authored aliases or keywords resolve to catalogue ids', () => {
  assert.equal(Object.keys(index).length, resources.length)
  const ids = new Set(resources.map((resource) => resource.id))
  for (const [id, entry] of Object.entries(index)) {
    assert.ok(ids.has(id), 'orphan search entry: ' + id)
    for (const key of ['features', 'scenarios', 'usage', 'aliases', 'keywords']) {
      assert.ok(Array.isArray(entry[key]), id + ' missing ' + key)
    }
  }
  assert.equal(index.codeium.aliases.includes('Windsurf'), true)
  assert.equal(index['text-generation-webui'].aliases.includes('oobabooga'), true)
  assert.equal(index.vaultwarden.aliases.includes('bitwarden_rs'), true)
  assert.ok(index.ollama.keywords.includes('本地模型'))
  assert.ok(index.immich.keywords.includes('Google Photos 替代'))
})

test('catalogue and global command palette both use the same relevance scorer', () => {
  const home = readFileSync(new URL('../../src/pages/Home.jsx', import.meta.url), 'utf8')
  const palette = readFileSync(new URL('../../src/components/CommandPalette.jsx', import.meta.url), 'utf8')
  assert.match(home, /scoreResourceSearch\(query,searchRecordFor\(resource\)\)/)
  assert.match(palette, /scoreResourceSearch\(q,\{/)
})
