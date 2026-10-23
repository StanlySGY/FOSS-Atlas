#!/usr/bin/env node
/**
 * FOSS-Atlas social cards (og:image / twitter:image)
 * ------------------------------------------------------------------
 * Draws the four cards under public/og/ with headless Chrome, from the copy in
 * `src/prerender/cards.js` and the layout in `src/prerender/ogCard.js`, then
 * records what it used in `src/data/og.json` (see scripts/ogManifest.mjs for
 * why the record lives outside `public/` and what each field is for).
 *
 * Why a headless browser and not a canvas library: the thing being rasterised
 * is *this site's own subsetted webfont*, and the only renderer that already
 * knows how to load a woff2, shape CJK through HarfBuzz and apply the CSS the
 * site uses is the browser the site runs in. A canvas rasteriser would be a
 * second text-layout implementation to keep in sync with the first.
 *
 * Four cards, not 186: see the header of `cards.js`. A card is per page *kind*
 * (home / graph / deployed / wiki); the entry's name reaches the crawler through
 * `og:title`, which is text.
 *
 * Three guards, all of them about *staleness* rather than taste:
 *
 *   1. copy → glyph coverage. Every glyph drawn is checked against the cmap of
 *      the shipped woff2 files (scripts/fontCoverage.mjs). Copy added without
 *      re-running `npm run fonts` would paint tofu into a binary nobody diffs.
 *   2. copy → layout. Title/description line counts, widths and the gap to the
 *      footer are measured out of the page Chrome rendered, against the card's
 *      real content width. Overflow on a PNG is invisible to a crawler.
 *   3. shipped card → current data. The manifest records the `graph.stats` the
 *      cards were drawn from; `scripts/prerender.mjs` refuses to emit og tags
 *      whose numbers disagree with the catalogue's current numbers.
 *
 * `--check` runs guard 3's inputs without Chrome, so CI can fail at the point of
 * the mistake (a data edit that left the cards behind) instead of mid-build.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { cardSet } from '../src/prerender/cards.js'
import { CARD_HEIGHT, CARD_WIDTH, CONTENT_WIDTH, cardDocument, themeTokens } from '../src/prerender/ogCard.js'
import { checkOgCards, currentStats, fontFileFor, repoPathFor, sha256, writeManifest } from './ogManifest.mjs'
import { shippedCoverage } from './fontCoverage.mjs'
import { collectGlyphs, uncoveredChars } from './glyphSet.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public/og')
/*
 * The page Chrome screenshots, and the PNG it writes, go under `.cache/` rather
 * than beside the cards: `public/` is copied verbatim into `dist/`, so scratch
 * here would publish four HTML files carrying 33 KB of base64 font each. The
 * committed artifacts are the cards in public/og/ and the record in src/data/og.json.
 */
const SCRATCH_DIR = resolve(ROOT, '.cache/og-render')

const CHECK_ONLY = process.argv.includes('--check')

const stats = currentStats()
const cards = cardSet(stats)
const kinds = Object.keys(cards)

/* ------------------------------------------------------------------ *
 * 1. Copy → coverage. What the card would draw vs. what the font has.
 * ------------------------------------------------------------------ */
const drawnText = (card) => [card.kicker, card.chip, card.title, card.description, card.footer, card.originHost].join('')

async function coverageReport() {
  const { perWeight, common } = await shippedCoverage()
  const covered = new Set([...common].map((cp) => String.fromCodePoint(cp)))

  /*
   * First question is not "does the font have it" but "did the font pipeline see
   * this copy at all": cards are drawn from src/prerender/cards.js, which the
   * glyph walk reads, so copy the walk missed means copy that was never meant to
   * be subsetted in the first place.
   */
  const siteGlyphs = new Set(collectGlyphs())
  const outsideWalk = kinds.map((kind) => ({ kind, chars: uncoveredChars(drawnText(cards[kind]), siteGlyphs) })).filter((r) => r.chars)

  const missing = []
  for (const kind of kinds) {
    const chars = uncoveredChars(drawnText(cards[kind]), covered)
    if (chars) missing.push({ kind, file: cards[kind].file, chars })
  }
  return { perWeight, missing, outsideWalk }
}

/* ------------------------------------------------------------------ *
 * 2. Chrome. Locate it, then use it once per card.
 * ------------------------------------------------------------------ */
const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  // macOS / WSL-hosted Chrome, so a card can be redrawn from a laptop too.
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      const version = execFileSync(candidate, ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
      if (version) return { bin: candidate, version }
    } catch {
      /* not here / not executable — try the next candidate */
    }
  }
  return null
}

/**
 * The fonts, inlined as data: URLs.
 *
 * `file://` @font-face rules from a `file://` page work locally, but every
 * browser build treats that permission differently (and some CI images refuse
 * it). The face bytes are already the shipped artifacts, ~370 KB each: inlining
 * makes the render depend on nothing but the arguments to this one command,
 * which is the property worth paying 33 KB of base64 for.
 */
function fontFaces() {
  /* 400 and 700 only: 500 is in the shipped set for the site's own body copy,
   * and the card does not use it. */
  return [400, 700]
    .map((weight) => {
      const b64 = readFileSync(fontFileFor(weight)).toString('base64')
      return `@font-face{font-family:"Noto Sans SC";font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format("woff2")}`
    })
    .join('\n')
}

/** Read the PNG's IHDR: [width, height]. Guards against a 0×0 or off-size capture. */
function pngSize(file) {
  const head = readFileSync(file).subarray(0, 33)
  if (head.subarray(0, 8).toString('latin1') !== '\x89PNG\r\n\x1a\n') return null
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) }
}

function renderCard(chrome, kind, card, scratchDir) {
  const html = cardDocument({ card, fontFaces: fontFaces(), tokens: themeTokens() })
  const htmlPath = join(scratchDir, `${kind.replace(/[^a-z]/gi, '_')}.html`)
  const shotPath = join(scratchDir, `${kind.replace(/[^a-z]/gi, '_')}.png`)
  writeFileSync(htmlPath, html)

  /*
   * `--dump-dom` and `--screenshot` in one invocation: the metrics script writes
   * into the same document that gets painted, so the numbers describe the exact
   * pixels the PNG contains rather than a second render of the same markup.
   */
  const dom = execFileSync(
    chrome.bin,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--window-size=${CARD_WIDTH},${CARD_HEIGHT}`,
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
      '--virtual-time-budget=6000',
      '--dump-dom',
      `--screenshot=${shotPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 16 * 1024 * 1024 },
  ).toString()


  const raw = /<pre id="metrics">([\s\S]*?)<\/pre>/.exec(dom)?.[1] ?? ''
  if (!raw || raw === 'pending') {
    throw new Error(`${kind}: the card rendered no metrics — the fonts or the layout script did not run in headless Chrome`)
  }
  const metrics = JSON.parse(raw)
  const size = pngSize(shotPath)
  if (!size) throw new Error(`${kind}: ${shotPath} is not a PNG`)
  return { metrics, size, shotPath }
}

/** Guard 2, evaluated on the numbers Chrome reported. */
function layoutProblems(kind, { metrics, size }) {
  const problems = []
  if (size.width !== CARD_WIDTH || size.height !== CARD_HEIGHT) {
    problems.push(`PNG is ${size.width}×${size.height}, expected ${CARD_WIDTH}×${CARD_HEIGHT}`)
  }
  for (const face of metrics.faces) {
    if (face.status !== 'loaded') problems.push(`font weight ${face.weight} has status "${face.status}" — the card was drawn in a fallback font`)
  }
  /*
   * Line count is the real test: both text boxes carry a max-width, so copy that
   * is too long does not spill off the card, it wraps — and a second 76px title
   * line pushes the description into the footer. `maxW` is reported only so the
   * failure message can name the cap the copy hit.
   */
  if (metrics.title.lines > 1) {
    problems.push(`title wraps to ${metrics.title.lines} lines (1 allowed at 76px; box is capped at ${metrics.title.maxW}px of ${CONTENT_WIDTH}px)`)
  }
  if (metrics.desc.lines > 2) problems.push(`description wraps to ${metrics.desc.lines} lines (2 allowed at 34px; box is capped at ${metrics.desc.maxW}px)`)
  if (metrics.kicker + metrics.chip > metrics.contentWidth) {
    problems.push(`brand + chip measure ${metrics.kicker}+${metrics.chip} = ${metrics.kicker + metrics.chip}px, over the ${metrics.contentWidth}px row`)
  }
  if (metrics.gap < 24) problems.push(`only ${metrics.gap}px between the description and the footer rule (needs ≥24px)`)
  return problems
}

/* ------------------------------------------------------------------ *
 * 3. Check mode: the shipped cards against the current catalogue, no Chrome.
 * ------------------------------------------------------------------ */
const describe = (chars) => [...chars].map((c) => `${c} U+${c.codePointAt(0).toString(16)}`).join(' ')

if (CHECK_ONLY) {
  const problems = await checkOgCards()
  if (problems.length) {
    console.error('build-og --check:\n  ' + problems.join('\n  '))
    process.exit(1)
  }
  console.log(
    `build-og --check: ${kinds.length} cards match the current data ` +
      `(${stats.tools} tools, ${stats.edges} edges, ${stats.deployed} deployed, ${stats.instances} instances)`,
  )
  process.exit(0)
}

/* ------------------------------------------------------------------ *
 * Render.
 * ------------------------------------------------------------------ */
const chrome = findChrome()
if (!chrome) {
  console.error(
    'build-og: no Chrome/Chromium found.\n' +
      '  Looked for: ' +
      CHROME_CANDIDATES.join(', ') +
      '\n' +
      '  Set CHROME_BIN to the binary, or install Chrome. The cards are not rebuilt without a renderer;\n' +
      '  the build will still ship the cards currently in public/og/ if they match the data (`npm run og --check`).',
  )
  process.exit(1)
}

const coverage = await coverageReport()
if (coverage.outsideWalk.length) {
  console.error(
    'build-og: card copy that scripts/glyphSet.mjs does not read:\n' +
      coverage.outsideWalk.map((r) => `  ${cards[r.kind].file}: ${describe(r.chars)}`).join('\n') +
      '  Copy drawn onto a card has to live where the font pipeline looks (src/**/*.{js,jsx,css}), or the subset will never contain it.',
  )
  process.exit(1)
}
if (coverage.missing.length) {
  console.error(
    'build-og: the shipped font subsets do not contain every glyph the cards would draw:\n' +
      coverage.missing.map((m) => `  ${m.file}: ${describe(m.chars)}`).join('\n') +
      `\n  Run \`npm run fonts\` (the walk covers src/prerender/cards.js) and re-run this build.\n  Weights checked: ${coverage.perWeight.map((f) => `${f.weight}=${f.codePoints.size}`).join(', ')}`,
  )
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(SCRATCH_DIR, { recursive: true })

const records = {}
const failures = []
for (const kind of kinds) {
  const card = cards[kind]
  const { metrics, size, shotPath } = renderCard(chrome, kind, card, SCRATCH_DIR)
  const problems = layoutProblems(kind, { metrics, size })
  if (problems.length) failures.push({ kind, problems })

  const bytes = readFileSync(shotPath)
  const out = repoPathFor(card.file)
  mkdirSync(dirname(out), { recursive: true })
  const previous = existsSync(out) ? sha256(readFileSync(out)) : null
  writeFileSync(out, bytes)
  records[kind] = {
    file: card.file,
    sha256: sha256(bytes),
    changed: previous !== null && previous !== sha256(bytes),
    bytes: bytes.length,
    metrics,
  }
  console.log(
    `  ${card.file}  ${metrics.title.lines}-line title (${metrics.title.w}px), ${metrics.desc.lines}-line desc (last line ${metrics.desc.w}px / ${metrics.desc.maxW}px box), gap ${metrics.gap}px` +
      `${previous === null ? ' (new)' : previous === sha256(bytes) ? ' (unchanged)' : ' (redrawn)'}`,
  )
}

if (failures.length) {
  console.error(
    'build-og: the copy no longer fits the card:\n' +
      failures.map((f) => `  ${cards[f.kind].file}\n    ` + f.problems.join('\n    ')).join('\n') +
      '\n  Edit the copy in src/prerender/cards.js, or the type scale in src/prerender/ogCard.js.',
  )
  process.exit(1)
}

await writeManifest({ chrome: { version: chrome.version } })

console.log(
  `og cards: ${kinds.length} drawn by ${chrome.version}; coverage ${coverage.perWeight[0].codePoints.size} glyphs (${coverage.perWeight[0].subtable})`,
)
