#!/usr/bin/env node
/**
 * "Is this glyph actually in the shipped font?" — answered from the font tables.
 *
 * Used by `scripts/build-og.mjs`: text painted into a PNG is not reflowable, so
 * a glyph the subset dropped comes out as a tofu box in a file nobody diffs.
 * Checking that copy against the *shipped* woff2 (not against the glyph set the
 * subset was built from) is what catches the ordering mistake — copy added to
 * `src/prerender/cards.js` without re-running `npm run fonts`.
 *
 * Why a woff2 reader at all, when a browser is right there: measured on this
 * repo's own subsets, headless Chrome cannot report missing coverage.
 * `document.fonts.check()` returned false for every glyph, covered or not, and
 * `measureText` returned identical widths for a covered glyph, an uncovered one
 * and a glyph the family has never contained — because the fallback chain
 * resolves to a platform CJK font that happily draws all three. A browser that
 * substitutes silently is the wrong instrument for this question.
 *
 * So: decompress the woff2 (`wawoff2`, the same package `subset-font` ships, so
 * this needs no python and no fontTools on CI) and read its `cmap` table.
 * Validated against fontTools on all three faces: 1156 code points each, with an
 * empty set difference in both directions.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import wawoff2 from 'wawoff2'

import { SHIPPED_WEIGHTS } from './shippedFonts.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FONT_DIR = resolve(ROOT, 'public/fonts')

/** The shipped faces — the same list scripts/build-fonts.mjs writes. */
export const SHIPPED_FACES = SHIPPED_WEIGHTS.map((weight) => ({
  weight,
  file: resolve(FONT_DIR, `noto-sans-sc-${weight}.woff2`),
}))

/* Unicode subtables in order of usefulness: a 32-bit table first, then the
 * BMP-only ones. Which one this subset actually emits is 0.3 (BMP, format 4). */
const PREFERRED_SUBTABLES = ['3.10', '0.6', '0.4', '3.4', '0.3', '3.1', '0.1', '3.0', '0.0']

/**
 * The code points a font file has a glyph for, according to its own cmap.
 * Returns `{ codePoints, subtable }` — `subtable` is reported by build-og so a
 * wrong answer here is at least diagnosable.
 */
export async function coveredCodePoints(file) {
  const buf = Buffer.from(await wawoff2.decompress(readFileSync(file)))
  if (buf.slice(0, 4).toString('latin1') !== 'OTTO') {
    throw new Error(`${file}: decompressed to ${buf.slice(0, 4).toString('latin1')}, not an OpenType font`)
  }

  const tables = buf.readUInt16BE(4)
  let cmap = null
  for (let i = 0; i < tables; i++) {
    const entry = 12 + i * 16
    if (buf.slice(entry, entry + 4).toString('latin1') === 'cmap') {
      cmap = { offset: buf.readUInt32BE(entry + 8) }
    }
  }
  if (!cmap) throw new Error(`${file}: no cmap table`)

  const base = cmap.offset
  const subtables = []
  for (let i = 0; i < buf.readUInt16BE(base + 2); i++) {
    const record = base + 4 + i * 8
    subtables.push({
      key: `${buf.readUInt16BE(record)}.${buf.readUInt16BE(record + 2)}`,
      offset: base + buf.readUInt32BE(record + 4),
    })
  }
  subtables.sort((a, b) => rank(a.key) - rank(b.key))

  const { key, offset } = subtables[0]
  const format = buf.readUInt16BE(offset)
  const codePoints = new Set()

  if (format === 4) {
    const segmentsX2 = buf.readUInt16BE(offset + 6)
    const segments = segmentsX2 / 2
    const endsAt = offset + 14
    const startsAt = endsAt + segmentsX2 + 2
    const deltasAt = startsAt + segmentsX2
    const rangeOffsetAt = deltasAt + segmentsX2
    for (let s = 0; s < segments; s++) {
      const end = buf.readUInt16BE(endsAt + s * 2)
      const start = buf.readUInt16BE(startsAt + s * 2)
      const delta = buf.readInt16BE(deltasAt + s * 2)
      const rangeBase = rangeOffsetAt + s * 2
      const range = buf.readUInt16BE(rangeBase)
      if (end === 0xffff) continue // the sentinel segment
      for (let cp = start; cp <= end; cp++) {
        const glyph =
          range === 0 ? (cp + delta) & 0xffff : (buf.readUInt16BE(rangeBase + range + 2 * (cp - start)) + delta) & 0xffff
        if (glyph !== 0) codePoints.add(cp)
      }
    }
  } else if (format === 12) {
    const groups = buf.readUInt32BE(offset + 12)
    for (let g = 0; g < groups; g++) {
      const record = offset + 16 + g * 12
      const start = buf.readUInt32BE(record)
      const end = buf.readUInt32BE(record + 4)
      for (let cp = start; cp <= end; cp++) codePoints.add(cp)
    }
  } else {
    throw new Error(`${file}: cmap format ${format} (subtable ${key}) is not handled`)
  }

  return { codePoints, subtable: `${key} format ${format}`, allSubtables: subtables.map((s) => s.key) }
}

const rank = (key) => {
  const at = PREFERRED_SUBTABLES.indexOf(key)
  return at === -1 ? PREFERRED_SUBTABLES.length : at
}

/**
 * Every shipped face's coverage, as one intersection: the safe answer for copy
 * that will be set in more than one weight (the cards mix 400 body and 700
 * title). Reports the weight that is *missing* each glyph, so the fix message
 * says which face to rebuild.
 */
export async function shippedCoverage() {
  const perWeight = []
  for (const face of SHIPPED_FACES) perWeight.push({ ...face, ...(await coveredCodePoints(face.file)) })

  const common = new Set(perWeight[0].codePoints)
  for (const face of perWeight.slice(1)) {
    for (const cp of common) if (!face.codePoints.has(cp)) common.delete(cp)
  }
  return { perWeight, common }
}
