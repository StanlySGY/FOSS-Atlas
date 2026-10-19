#!/usr/bin/env node
/**
 * FOSS-Atlas wiki pipeline
 * ------------------------------------------------------------------
 * Turns the catalogue in src/data/resources.json into one base Wiki page per
 * resource, and a backlink index the app can read without fetching anything.
 *
 * Produces:
 *   - public/wiki/<id>.md          (generated base page, one per resource)
 *   - src/data/backlinks.json      ({ sourceId: [wikilink target names] })
 *
 * The five pages that predate this script are hand-written and referenced by
 * CURATED below; they keep their own file names and are never rewritten, but
 * they still take part in the backlink index.
 *
 * Prose lives in scripts/wiki-content/*.mjs (one module per group). The
 * generator only adds the parts that must stay in sync with the catalogue:
 * frontmatter, the page skeleton, and the [[wikilinks]].
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(ROOT, 'src/data')
const WIKI_DIR = resolve(ROOT, 'public/wiki')
const CONTENT_DIR = resolve(__dirname, 'wiki-content')

/**
 * Hand-written pages, id -> existing slug. These are skipped by the generator.
 */
const CURATED = {
  ollama: 'ollama',
  cloudflare: 'cloudflare-workers',
  vaultwarden: 'vaultwarden',
  immich: 'immich',
  nextcloud: 'nextcloud',
}

/**
 * Date shown as `updated:` in generated frontmatter. Fixed rather than derived
 * from the clock so regenerating after an unrelated data change does not create
 * a 160-file diff; bump it when the prose itself is revised.
 */
const CONTENT_REVISION = '2026-10-19'

/** How many [[wikilinks]] to place under 「同类推荐」. */
const RELATED_COUNT = 4

const slugFor = (id) => CURATED[id] ?? id

/* ------------------------------------------------------------------ *
 * Prose
 * ------------------------------------------------------------------ */
const content = new Map()

if (existsSync(CONTENT_DIR)) {
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mjs')).sort()
  for (const file of files) {
    const mod = await import(pathToFileURL(resolve(CONTENT_DIR, file)).href)
    const entries = mod.default ?? {}
    for (const [id, entry] of Object.entries(entries)) {
      if (content.has(id)) throw new Error(`duplicate prose for "${id}" (${file})`)
      content.set(id, entry)
    }
  }
}

/**
 * A curated page is `continue`d before its prose is ever read, so an entry for
 * one of those ids would load and then be silently ignored — an edit that goes
 * nowhere. Collect them so the report can say so.
 */
const shadowedProse = [...content.keys()].filter((id) => CURATED[id])

/* ------------------------------------------------------------------ *
 * Catalogue
 * ------------------------------------------------------------------ */
const resources = JSON.parse(readFileSync(resolve(DATA_DIR, 'resources.json'), 'utf8'))
const graph = JSON.parse(readFileSync(resolve(DATA_DIR, 'graph.json'), 'utf8'))
const byId = new Map(resources.map((r) => [r.id, r]))

const bySubCategory = new Map()
const byCategory = new Map()
for (const r of resources) {
  if (!bySubCategory.has(r.sub_category)) bySubCategory.set(r.sub_category, [])
  bySubCategory.get(r.sub_category).push(r.id)
  if (!byCategory.has(r.category)) byCategory.set(r.category, [])
  byCategory.get(r.category).push(r.id)
}

/** Tools to link under 「同类推荐」: nearest neighbours first. */
function relatedFor(id) {
  const r = byId.get(id)
  const near = (bySubCategory.get(r.sub_category) ?? []).filter((x) => x !== id)
  const far = (byCategory.get(r.category) ?? []).filter(
    (x) => x !== id && !near.includes(x),
  )
  return [...near, ...far].slice(0, RELATED_COUNT)
}

/** External/catalogue services this tool is an alternative to, by display name. */
const alternativeNames = new Map()
for (const edge of graph.edges) {
  if (edge.type !== 'alternative_to') continue
  const node = graph.nodes.find((n) => n.id === edge.target)
  if (!node) continue
  if (!alternativeNames.has(edge.source)) alternativeNames.set(edge.source, [])
  alternativeNames.get(edge.source).push(node.name)
}

/* ------------------------------------------------------------------ *
 * Page rendering
 * ------------------------------------------------------------------ */
const bullets = (items) => items.map((x) => `- ${x}`).join('\n')

function renderPage(resource, entry) {
  const related = relatedFor(resource.id)
  const alternatives = alternativeNames.get(resource.id) ?? []

  const frontmatter = [
    '---',
    `title: ${resource.name}`,
    `slug: ${resource.id}`,
    `category: ${resource.category}`,
    `sub_category: ${resource.sub_category}`,
    `tags: [${resource.tags.join(', ')}]`,
    `url: ${resource.url}`,
    alternatives.length ? `alternatives: [${alternatives.join(', ')}]` : null,
    related.length ? `related: [${related.join(', ')}]` : null,
    `updated: ${CONTENT_REVISION}`,
    '---',
  ]
    .filter(Boolean)
    .join('\n')

  const links = related
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((r) => `- [[${r.name}]] —— ${r.description}`)

  // A resource with no neighbours at all has nothing to recommend; drop the
  // section rather than printing an empty heading.
  const sections = [
    `# ${resource.name}`,
    '',
    `> ${entry.summary}`,
    '',
    '## 一句话总结',
    '',
    entry.summary,
    '',
    '## 核心功能 / 特点',
    '',
    bullets(entry.features),
    '',
    '## 适用场景',
    '',
    bullets(entry.scenarios),
  ]

  if (links.length) {
    sections.push('', '## 同类推荐', '', links.join('\n'))
  }

  sections.push('')

  const body = sections.join('\n')

  return `${frontmatter}\n\n${body}`
}

/* ------------------------------------------------------------------ *
 * Write pages
 * ------------------------------------------------------------------ */
mkdirSync(WIKI_DIR, { recursive: true })

const written = []
const skipped = []
const missingProse = []

for (const resource of resources) {
  if (CURATED[resource.id]) {
    skipped.push(resource.id)
    continue
  }
  const entry = content.get(resource.id)
  if (!entry) {
    missingProse.push(resource.id)
    continue
  }
  if (!entry.summary || !entry.features?.length || !entry.scenarios?.length) {
    throw new Error(`incomplete prose for "${resource.id}"`)
  }
  writeFileSync(resolve(WIKI_DIR, `${slugFor(resource.id)}.md`), renderPage(resource, entry))
  written.push(resource.id)
}

/* ------------------------------------------------------------------ *
 * Backlink index
 *
 * Stored as raw [[...]] target names rather than resolved ids so the app can
 * run them through the very same `resolveTarget()` it uses for the links
 * themselves — the index can never disagree with what the pages say.
 * ------------------------------------------------------------------ */
const backlinks = {}
let synced = 0

for (const resource of resources) {
  const file = resolve(WIKI_DIR, `${slugFor(resource.id)}.md`)
  if (!existsSync(file)) continue
  synced++
  const raw = readFileSync(file, 'utf8')
  const targets = [...raw.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map((m) => m[1].trim())
  if (targets.length) backlinks[resource.id] = [...new Set(targets.filter((t) => t !== resource.name))]
}

writeFileSync(resolve(DATA_DIR, 'backlinks.json'), JSON.stringify(backlinks, null, 2) + '\n')

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */
console.log(`wiki pages written: ${written.length}`)
console.log(`curated (left as-is): ${skipped.join(', ')}`)
console.log(`backlink index: ${synced} pages, ${Object.keys(backlinks).length} with outgoing links`)

if (missingProse.length) {
  console.log(`\nno prose yet for ${missingProse.length} resource(s):`)
  console.log(`  ${missingProse.join(' ')}`)
  console.log('  these render the generic fallback page until scripts/wiki-content covers them')
}

if (shadowedProse.length) {
  console.log(`\nprose that will never be emitted — these ids have hand-written pages (${shadowedProse.length}):`)
  console.log(`  ${shadowedProse.join(' ')}`)
  console.log('  edit public/wiki/<slug>.md directly instead, or drop them from CURATED')
}

const names = new Set(resources.map((r) => r.name.toLowerCase()))
const unresolved = new Set()
for (const targets of Object.values(backlinks)) {
  for (const t of targets) if (!names.has(t.toLowerCase())) unresolved.add(t)
}
if (unresolved.size) {
  console.log(`\nwikilinks that will not resolve to a catalogue entry (${unresolved.size}):`)
  console.log(`  ${[...unresolved].join(', ')}`)
}
