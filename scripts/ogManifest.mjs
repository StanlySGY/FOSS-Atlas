#!/usr/bin/env node
/**
 * The record that makes `public/og/*.png` a *claim* instead of a file.
 *
 * A card is the only artifact in this repo whose text cannot be diffed: the
 * "186" lives inside a PNG. So the build writes down, next to the images,
 * exactly what they were drawn from — the catalogue counts, the card copy, the
 * glyph walk, the font bytes — and every consumer compares that record against
 * the present state before it is allowed to reference an image.
 *
 * This is why the cards are committed binaries built by hand (`npm run og`) and
 * CI only *checks* them: the alternative is a browser in the pipeline, and the
 * alternative to that is shipping og cards whose numbers nobody verified.
 *
 * The record is build metadata, not site content, so it sits in `src/data/`
 * (beside the other generated manifests) and is never copied into `dist/`:
 * `public/og/manifest.json` would be fetchable at `/og/manifest.json`, which
 * describes the build to nobody.
 *
 * Two consumers:
 *   scripts/build-og.mjs   writes it; `--check` reads it without Chrome
 *   scripts/prerender.mjs  refuses to emit og tags for cards that do not match
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { cardSet, cardStats } from '../src/prerender/cards.js'
import { SHIPPED_WEIGHTS } from './shippedFonts.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const MANIFEST_PATH = resolve(ROOT, 'src/data/og.json')
const GRAPH_JSON = resolve(ROOT, 'src/data/graph.json')

/** The subsetted faces the build reads; the card itself only draws 400 and 700. */
export const CARD_FONT_WEIGHTS = SHIPPED_WEIGHTS

/**
 * Bump when the card *layout* changes, so "these PNGs are from an older design"
 * is a distinguishable failure from "the build is stale".
 */
export const CARD_DESIGN = 1

/** Canonical JSON: sorted keys, so the hash compares content, not insertion order. */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

/** A card's repo location, from its site path (`/og/site.png` is absolute to `resolve`). */
export const repoPathFor = (sitePath) => resolve(ROOT, 'public', sitePath.replace(/^\//, ''))

/** The catalogue counts the cards must reflect — read from the generator's output, not the app module, so plain Node can use this. */
export function currentStats() {
  return JSON.parse(readFileSync(GRAPH_JSON, 'utf8')).stats
}

export const currentCards = () => cardSet(currentStats())

export const fontFileFor = (weight) => resolve(ROOT, 'public/fonts', `noto-sans-sc-${weight}.woff2`)

/**
 * What the record *should* say right now. `extra` carries the per-run facts
 * (the Chrome version) that a check deliberately does not compare.
 */
export async function expectedManifest(extra = {}) {
  const { collectGlyphs } = await import('./glyphSet.mjs')
  const stats = currentStats()
  return {
    design: CARD_DESIGN,
    stats: cardStats(stats),
    copyHash: sha256(canonicalJson(cardSet(stats))),
    /*
     * The glyph walk, hashed. Site copy moving without `npm run fonts` being
     * re-run is a different mistake from the cards going stale, and it needs its
     * own message because the fix is a different command.
     */
    glyphHash: sha256([...new Set(collectGlyphs())].sort().join('')),
    fonts: Object.fromEntries(CARD_FONT_WEIGHTS.map((w) => [`noto-sans-sc-${w}.woff2`, sha256(readFileSync(fontFileFor(w)))])),
    ...extra,
  }
}

export function loadManifest() {
  return existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : null
}

/**
 * Every way the shipped cards can disagree with the current site. An empty
 * array is the licence to cite a card as a fact about this catalogue.
 */
export function manifestProblems(manifest, expected) {
  if (!manifest) return ['src/data/og.json is missing — run `npm run og`.']

  const problems = []
  if (manifest.design !== expected.design) {
    problems.push(`the shipped cards were drawn by design ${manifest.design}, this layout is ${expected.design} — run \`npm run og\`.`)
  }
  if (canonicalJson(manifest.stats ?? null) !== canonicalJson(expected.stats)) {
    problems.push(`the cards state ${canonicalJson(manifest.stats)} while the catalogue says ${canonicalJson(expected.stats)} — run \`npm run og\`.`)
  }
  if (manifest.copyHash !== expected.copyHash) {
    problems.push('the card copy in src/prerender/cards.js changed but the PNGs were not redrawn — run `npm run og`.')
  }
  if (manifest.glyphHash !== expected.glyphHash) {
    problems.push('site copy changed without the font subsets being rebuilt — run `npm run fonts` and then `npm run og`.')
  }
  for (const [file, hash] of Object.entries(expected.fonts)) {
    if (manifest.fonts?.[file] !== hash) {
      problems.push(`${file} changed since the cards were drawn — run \`npm run fonts\` and then \`npm run og\`.`)
    }
  }
  for (const card of Object.values(currentCards())) {
    if (!existsSync(repoPathFor(card.file))) problems.push(`public${card.file} is missing — run \`npm run og\`.`)
  }
  return problems
}

/** The shipped cards against the current site. Returns the problem list, empty when they may be used. */
export async function checkOgCards() {
  return manifestProblems(loadManifest(), await expectedManifest())
}

export async function writeManifest(extra = {}) {
  const manifest = await expectedManifest(extra)
  // A trailing newline keeps the file POSIX-clean and a rebuild's diff readable.
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}
