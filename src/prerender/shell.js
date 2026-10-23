/*
 * Head-shaking helpers for the prerender build.
 *
 * The build starts from `dist/index.html` — Vite's own output — and swaps the
 * document metadata per route. Taking Vite's file as the base means the asset
 * tags carry the real content-hashed filenames, the font preloads and the
 * favicon stay in one place (`index.html`), and this script never has to
 * duplicate the document head.
 */

/**
 * The built document, split into the pieces the prerender build reassembles.
 *
 * `headOpen`, `beforeRoot` and `afterRoot` are copied through untouched —
 * Vite's doctype, `<html>` tag, `<head>` opening, `<body>` tag and closing
 * tags. Only `headInner`'s metadata and the contents of the root div are
 * replaced, so a change to `index.html` (a new preload, a new meta) needs no
 * matching change in the build, and the asset tags keep their content hashes.
 *
 * `headInner` is returned *raw*; `stripHeadMeta` removes what the build rewrites.
 * The split matters: the caller must not reuse the shell's doctype and `<head>`
 * opening *and* slice a prefix that already contains them.
 */
export function documentParts(html) {
  const headStart = html.indexOf('<head>')
  const headEnd = html.indexOf('</head>')
  if (headStart === -1 || headEnd === -1) {
    throw new Error('shell: no <head> … </head> in dist/index.html — did `vite build` run?')
  }

  const root = /<div[^>]*\bid="root"[^>]*>/.exec(html)
  if (!root) throw new Error('shell: no <div id="root"> in dist/index.html')
  const rootClose = html.indexOf('</div>', root.index)
  if (rootClose === -1) throw new Error('shell: <div id="root"> is not closed in dist/index.html')

  return {
    headOpen: html.slice(0, headStart + '<head>'.length),
    headInner: html.slice(headStart + '<head>'.length, headEnd),
    beforeRoot: html.slice(headEnd, root.index + root[0].length),
    afterRoot: html.slice(rootClose),
  }
}

/**
 * `headInner` minus the tags this build owns per route.
 *
 * Dropped: `<title>`, the description meta, the favicon link, `rel=canonical`,
 * every `og:*` and `twitter:*`, and the JSON-LD blocks. Re-emitting them per
 * route makes the head swap idempotent — an author who adds them to
 * `index.html` gets them *replaced* on every page rather than duplicated (two
 * canonicals is worse than none).
 *
 * The favicon is dropped and re-emitted because `index.html` writes it as
 * `./favicon.svg`: fine for a document at the site root, wrong for one at
 * `/wiki/<id>/`, where it would resolve to `/wiki/<id>/favicon.svg`. The build
 * emits it root-relative with the deployed base instead.
 *
 * Kept: the charset/viewport/theme-color metas, the font preloads and
 * stylesheet, and the module script + CSS link — all root-relative with the
 * base (`/FOSS-Atlas/assets/index-<hash>.js`), so they stay valid from a
 * document served at `/wiki/<id>/`.
 */
export function stripHeadMeta(headInner) {
  return headInner
    .replace(/[ \t]*<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/[ \t]*<meta\s+name="description"[\s\S]*?\/>\s*/g, '')
    .replace(/[ \t]*<link[^>]*\brel="icon"[^>]*>\s*/g, '')
    .replace(/[ \t]*<link[^>]*\brel="canonical"[^>]*>\s*/g, '')
    .replace(/[ \t]*<meta\s+(property="og:[^"]*"|name="twitter:[^"]*")[\s\S]*?\/>\s*/g, '')
    .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '')
    .trim()
}

/** The `<title>` and description meta Vite shipped, for the drift check. */
export function shellMetadata(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? null
  const description = html.match(/<meta\s+name="description"\s+content="([\s\S]*?)"\s*\/>/)?.[1] ?? null
  return { title: decodeBasic(title), description: decodeBasic(description) }
}

function decodeBasic(value) {
  if (value === null) return null
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

const ATTRIBUTE_ORDER = ['property', 'name', 'rel', 'hreflang', 'href', 'content', 'itemprop']

/**
 * `<meta>` from a plain object.
 *
 * Attribute order is fixed here because the tags are compared byte-for-byte
 * against what a crawler fetches, and a stable order keeps the diff of a
 * rebuild readable.
 */
export function metaTag(attrs) {
  const parts = ATTRIBUTE_ORDER.filter((k) => attrs[k] !== undefined && attrs[k] !== null).map(
    (k) => `${k}="${escapeAttr(attrs[k])}"`,
  )
  // Anything not in the known order goes last, so an unexpected key is still emitted.
  for (const k of Object.keys(attrs)) {
    if (!ATTRIBUTE_ORDER.includes(k) && attrs[k] !== undefined && attrs[k] !== null) {
      parts.push(`${k}="${escapeAttr(attrs[k])}"`)
    }
  }
  return `<meta ${parts.join(' ')} />`
}

export function linkTag(rel, href, extra = {}) {
  const parts = [`rel="${rel}"`, `href="${escapeAttr(href)}"`]
  for (const [k, v] of Object.entries(extra)) parts.push(`${k}="${escapeAttr(v)}"`)
  return `<link ${parts.join(' ')} />`
}

export function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

export function escapeText(value) {
  return escapeAttr(value)
}

/**
 * Inline JSON, escaped so it is safe inside a `<script>` element.
 *
 * Two separate hazards:
 *
 *   - `</script>` inside a JSON string would end the element early. The `<` is
 *     escaped as `\u003c`, which JSON decodes back to `<` but HTML does not
 *     treat as markup.
 *   - U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR are legal *inside* a
 *     JSON string, yet they terminate a JavaScript statement — so a crawler or
 *     tool that evaluates the block rather than parsing it fails on them. They
 *     occur in real prose here: `JSON.stringify` leaves them raw.
 *
 * The two separators are built from code points rather than written as literals,
 * because a raw U+2028 in a source file is invisible in every editor here and
 * has already been mis-transcribed into a real newline more than once.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g')
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g')

export function escapeInlineJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029')
}

export const jsonLdTag = (payload) => `<script type="application/ld+json">${escapeInlineJson(payload)}</script>`
