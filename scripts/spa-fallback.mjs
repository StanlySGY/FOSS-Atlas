#!/usr/bin/env node
/**
 * GitHub Pages serves 404.html for any unknown path. Copying the built
 * index.html there lets client-side routes (/wiki/:id, /graph) deep-link
 * correctly instead of 404ing.
 *
 * Cloudflare Pages needs the opposite: when a 404.html is present it serves it
 * with a 404 status, but with no 404.html it answers unknown paths from
 * index.html with a 200. Set SKIP_SPA_FALLBACK=1 for that target.
 *
 * The copy is then given its own identity, because it is a *fallback* document
 * and not the page its head was copied from:
 *
 *   - `rel=canonical` at the primary origin's home. App.jsx answers every
 *     unknown path with `<Navigate to="/" replace />`, so the fallback is a
 *     detour to one real page, and a crawler is told that in HTML rather than
 *     being asked to run the bundle to find out. (A canonical is inert on a
 *     response with a 404 status, which is what GitHub Pages sends; it is the
 *     Cloudflare-shaped case — no 404.html, root document, 200 — where it is
 *     not, and there it names the page the reader ends up on.)
 *   - `noindex` on top of it. A fallback served with a 200 is the textbook soft
 *     404: unique URL, generic content. `noindex` (with `follow`, so the links
 *     out of the shell still pass value) says "this URL is not a page" without
 *     breaking the crawl.
 *
 * Both are asserted rather than assumed: the guarantee depends on build order
 * (prerender.mjs runs first and puts the canonical into dist/index.html), so
 * the script checks what it copied and inserts the tag itself when it is
 * missing, instead of inheriting it by accident.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PRIMARY_ORIGIN } from '../src/prerender/site.js'

if (process.env.SKIP_SPA_FALLBACK) {
  console.log('SPA fallback skipped: SKIP_SPA_FALLBACK is set (host falls back itself).')
  process.exit(0)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const index = resolve(root, 'dist/index.html')
const fallback = resolve(root, 'dist/404.html')

if (!existsSync(index)) {
  console.error('dist/index.html not found — run `vite build` first.')
  process.exit(1)
}

const HOME_CANONICAL = `${PRIMARY_ORIGIN}/`
const NOINDEX = '<meta name="robots" content="noindex,follow" />'

let html = readFileSync(index, 'utf8')
const headOpen = html.indexOf('<head>')
if (headOpen === -1) {
  console.error('dist/index.html has no <head> — cannot write a fallback document.')
  process.exit(1)
}

const inserted = []
if (!new RegExp(`<link[^>]*rel="canonical"[^>]*href="${HOME_CANONICAL}"`).test(html)) {
  inserted.push('canonical')
}
if (!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html)) {
  inserted.push('noindex')
}

if (inserted.length) {
  const tags = inserted.includes('noindex') ? NOINDEX : ''
  const canonical = inserted.includes('canonical')
    ? `<link rel="canonical" href="${HOME_CANONICAL}" />`
    : ''
  html = html.replace('<head>', `<head>\n    ${[canonical, tags].filter(Boolean).join('\n    ')}`)
}

writeFileSync(fallback, html)
console.log(
  `SPA fallback written: dist/404.html` +
    (inserted.length ? ` (added ${inserted.join(' + ')})` : ' (canonical already inherited from the built document)'),
)
