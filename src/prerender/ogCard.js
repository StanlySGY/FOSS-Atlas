/*
 * The card layout, as markup Chrome can rasterise.
 *
 * Kept next to `cards.js` (the copy) and read by `scripts/build-og.mjs` (the
 * renderer). Two rules make the split safe:
 *
 *   - **No copy lives here.** Every visible string is substituted from
 *     `cardSet()`, which lives in `cards.js` — a file `scripts/glyphSet.mjs`
 *     walks, and therefore a file the font subset is rebuilt from. Copy typed
 *     into this template would be invisible to that walk and could rasterise as
 *     tofu with nothing in the diff to say so.
 *   - **The colours are read, not retyped.** `themeTokens()` pulls the hex
 *     values out of `src/index.css`, so a card can't drift into a palette the
 *     site no longer uses: the PNG bottom-left is the same `--ink` the page has.
 *
 * The measurements at the bottom are not decoration. A 1200×630 card has 1032px
 * of content width (1200 − 96 − 72), and `build-og.mjs` reads these numbers back
 * out of the same page it screenshotted, so "the copy still fits" is checked on
 * every rebuild instead of eyeballed once.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630

/** Content width available to title and description. */
export const CONTENT_WIDTH = 1032

/**
 * Tokens the card borrows from the site's own theme, in the order the CSS wants
 * them. `--radius` is included because the chip reuses the site's corner radius.
 */
const TOKENS = ['--ink', '--line', '--accent', '--text', '--text-strong', '--text-dim', '--text-faint', '--radius']

/**
 * The `:root` block of `src/index.css`, read as the source of truth.
 *
 * Fails when a token is missing rather than falling back to a hex of its own: a
 * silent default here would look exactly like the site's colour, only wrong.
 */
export function themeTokens() {
  const css = readFileSync(resolve(ROOT, 'src/index.css'), 'utf8')
  const block = /:root\s*\{([\s\S]*?)\n\}/.exec(css)
  if (!block) throw new Error('ogCard: no :root block in src/index.css — where is the theme defined?')
  const out = {}
  const missing = []
  for (const token of TOKENS) {
    const value = new RegExp(`(^|\\s)${token}:\\s*(#[0-9a-fA-F]{3,8}|[^;\\s]+)\\s*;`).exec(block[1])
    if (!value) missing.push(token)
    else out[token] = value[2]
  }
  if (missing.length) {
    throw new Error(`ogCard: src/index.css :root has no ${missing.join(', ')} — the card reads its palette from there.`)
  }
  return out
}

/**
 * The four-slot card: brand line + count chip, title, accent rule, description,
 * footer (tagline left, host right).
 *
 * `title` and `desc` are `display:inline-block` so their measured rect is the
 * *text* box rather than the block's container width — `getClientRects().length`
 * then counts line boxes, and `width` is how much of the 1032px the text takes.
 */
export function cardDocument({ card, fontFaces, tokens }) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<style>
${fontFaces}
:root{${Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(';')}}
*{box-sizing:border-box;margin:0}
html,body{width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;overflow:hidden}
body{background:var(--ink);color:var(--text);font-family:"Noto Sans SC","Noto Sans CJK SC",sans-serif}
.card{position:relative;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;padding:56px 72px 48px 96px}
.card::before{content:"";position:absolute;left:72px;top:0;bottom:0;width:1px;background:var(--line)}
.top{display:flex;align-items:baseline;gap:16px}
.brand{font-size:30px;font-weight:700;color:var(--accent);letter-spacing:.01em}
.kind{font-size:24px;color:var(--text-dim)}
.chip{margin-left:auto;font-size:22px;color:var(--text-dim);border:1px solid var(--line);border-radius:var(--radius);padding:6px 14px;white-space:nowrap}
.title{display:inline-block;margin-top:52px;max-width:${CONTENT_WIDTH}px;font-size:76px;line-height:1.12;font-weight:700;color:var(--text-strong);letter-spacing:-.01em}
.rule{margin-top:16px;width:120px;height:4px;background:var(--accent)}
.desc{display:inline-block;margin-top:30px;max-width:1010px;font-size:34px;line-height:1.5;color:var(--text)}
.footer{position:absolute;left:96px;right:72px;bottom:48px;padding-top:18px;border-top:1px solid var(--line);display:flex;align-items:baseline}
.tagline{font-size:22px;color:var(--text-faint)}
.host{margin-left:auto;font-size:24px;color:var(--text-dim)}
</style>
</head>
<body>
<div class="card">
  <div class="top"><span class="brand">${card.kicker}</span><span class="chip">${card.chip}</span></div>
  <h1 class="title">${card.title}</h1>
  <div class="rule"></div>
  <p class="desc">${card.description}</p>
  <div class="footer"><span class="tagline">${card.footer}</span><span class="host">${card.originHost}</span></div>
</div>
<script>
(async () => {
  await document.fonts.ready;
  /*
   * Line count comes from a Range over the element's contents: an element's own
   * getClientRects is one rect per box, so a wrapped <p> reports 1 and the
   * overflow goes unmeasured. A Range reports one rect per line box.
   */
  const box = (sel) => {
    const el = document.querySelector(sel);
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = range.getClientRects();
    const lines = [...rects].reduce((n, r) => (r.width > 0 ? n + 1 : n), 0);
    const last = [...rects].filter((r) => r.width > 0).reduce((a, r) => (r.bottom > a.bottom ? r : a), rects[0]);
    return { lines, w: Math.round(last.width), bottom: Math.round(last.bottom), maxW: Math.round(el.getBoundingClientRect().width) };
  };
  const width = (sel) => Math.round(document.querySelector(sel).getBoundingClientRect().width);
  const footer = document.querySelector('.footer').getBoundingClientRect();
  const desc = box('.desc');
  const metrics = {
    faces: [...document.fonts].map((f) => ({ weight: f.weight, status: f.status })),
    // .chip carries margin-left:auto, so the .top rect is always the container
    // width; the row only overflows when the two text runs sum past it.
    kicker: width('.brand'),
    chip: width('.chip'),
    title: box('.title'),
    desc,
    // Negative when the description runs into the absolutely-positioned footer.
    gap: Math.round(footer.top - desc.bottom),
    contentWidth: ${CONTENT_WIDTH},
  };
  document.getElementById('metrics').textContent = JSON.stringify(metrics);
})();
</script>
<pre id="metrics">pending</pre>
</body></html>
`
}
