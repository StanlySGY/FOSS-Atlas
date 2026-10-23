#!/usr/bin/env node
/**
 * The character set the site can render — one definition, two consumers.
 *
 * `scripts/build-fonts.mjs` subsets Noto Sans CJK down to exactly these code
 * points, and `scripts/build-og.mjs` checks the copy it paints into the social
 * cards against the same set. Sharing it is the point: the hazard is not a
 * missing glyph in the abstract, it is copy that lives where the font pipeline
 * cannot see it. Text drawn into a PNG from a glyph the subset dropped comes out
 * as tofu, and nothing in a diff says so.
 *
 * The rule the two consumers enforce together:
 *   text the site renders  →  must be found by this walk
 *   text a card draws      →  must be a subset of the text found by this walk
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Directories whose text the subset has to cover. */
const SOURCES = {
  data: resolve(ROOT, 'src/data/resources.json'),
  deployed: resolve(ROOT, 'src/data/deployed.json'),
  wiki: resolve(ROOT, 'public/wiki'),
  src: resolve(ROOT, 'src'),
  document: resolve(ROOT, 'index.html'),
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)],
  )
}

/**
 * Every character the site can render.
 *
 * `src` is walked for `js/jsx/mjs/css`, which is what makes the rule above hold
 * for the prerender modules (`src/prerender/site.js` — crawler copy) and the card
 * copy (`src/prerender/cards.js` — drawn copy). A `.mjs` under `src` is covered;
 * copy hard-coded into a script under `scripts/` is not, which is why the card
 * strings live in `src/prerender/cards.js` rather than in the renderer.
 */
export function collectGlyphs() {
  const parts = []

  const resources = JSON.parse(readFileSync(SOURCES.data, 'utf8'))
  for (const r of resources) {
    parts.push(r.name, r.description, r.category_name, r.sub_category_name, ...r.tags)
  }

  /*
   * The deployed-service list: `name`, `desc`, `stack` and the group notes are
   * rendered verbatim on /deployed/, and this file is the one source the app
   * reads that the resources walk does not cover. Hard-coded strings in the
   * generator are the other kind of copy the subset has to keep up with.
   */
  parts.push(stringsIn(JSON.parse(readFileSync(SOURCES.deployed, 'utf8'))))

  for (const f of readdirSync(SOURCES.wiki)) {
    if (f.endsWith('.md')) parts.push(readFileSync(resolve(SOURCES.wiki, f), 'utf8'))
  }

  for (const f of walk(SOURCES.src)) {
    if (/\.(jsx?|mjs|css)$/.test(f)) parts.push(readFileSync(f, 'utf8'))
  }
  parts.push(readFileSync(SOURCES.document, 'utf8'))

  // Always include the printable ASCII range so numbers/latin never tofu.
  for (let c = 0x20; c <= 0x7e; c++) parts.push(String.fromCharCode(c))

  return [...new Set(parts.join(''))].join('')
}

/** Every string leaf of a parsed JSON value, in document order. */
function stringsIn(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(stringsIn).join('')
  if (value && typeof value === 'object') return Object.values(value).map(stringsIn).join('')
  return ''
}

/** `chars` minus the covered set, as a sortable string ('' when nothing is missing). */
export function uncoveredChars(chars, covered) {
  const set = new Set(covered)
  return [...new Set(chars)].filter((c) => !set.has(c)).sort().join('')
}
