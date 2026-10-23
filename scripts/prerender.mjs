#!/usr/bin/env node
/**
 * Static prerender + crawler-facing metadata.
 * ------------------------------------------------------------------
 * `public/wiki/*.md` is fetched by the client in an effect, so the bytes a
 * crawler receives for `/wiki/syncthing` are the empty SPA shell: the tool's
 * name appears nowhere in the document. Googlebot does run scripts, but only
 * after the bundle and only on a budget; the second-order engines and AI
 * crawlers that read HTML directly see a blank page for 186 of the site's 189
 * URLs. This script renders every route at build time and writes it as a real
 * file:
 *
 *   dist/index.html             →  /            (Vite's file, head swapped)
 *   dist/graph/index.html       →  /graph/
 *   dist/deployed/index.html    →  /deployed/
 *   dist/wiki/<id>/index.html   →  /wiki/<id>/
 *   dist/sitemap.xml            →  189 urls on the primary origin
 *   dist/robots.txt
 *
 * Why the directory-index shape, and why every URL carries a trailing slash:
 * both answers come from measurement, not from either host's docs.
 *
 *   Cloudflare Pages, `wrangler pages dev` on a fixture matching this output:
 *     /wiki/syncthing/            200  the file, served directly
 *     /wiki/syncthing             308  → /wiki/syncthing/
 *     /wiki/syncthing/index.html  308  → /wiki/syncthing/
 *     /wiki/syncthing.md          200  the markdown (the client's own fetch path)
 *     /nope                       200  root index.html, because the fixture has
 *                                      no 404.html — Pages falls back itself
 *   GitHub Pages, live probes on this account's existing mirrors:
 *     a directory index at a trailing slash is served
 *       …/GTFOBins.github.io      301  → …/GTFOBins.github.io/ → 200
 *       …/hacktricks/linux-hardening → …/  → 200
 *     extensionless resolution of *nested* HTML is not:
 *       …/FOSS-Atlas/wiki/syncthing → 404, …/FOSS-Atlas/favicon → 404
 *
 * The directory index is therefore the only shape both hosts serve, and the
 * trailing slash the only form neither redirects — which is what makes
 * `rel=canonical` name the URL the reader lands on, rather than the
 * "redirected canonical" state Search Console flags.
 *
 * The render goes through Vite's SSR pipeline (`ssrLoadModule`) rather than
 * plain Node, because the app imports JSON without an `assert` and reads
 * `import.meta.env.BASE_URL`; `src/prerender/entry.jsx` holds the JSX side for
 * the same reason. Runs *after* `vite build`: each page is Vite's own
 * `index.html` with its head swapped, so the asset tags keep their
 * content-hashed filenames and this script never duplicates the document head.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

import { documentParts, escapeInlineJson, jsonLdTag, linkTag, metaTag, shellMetadata, stripHeadMeta } from '../src/prerender/shell.js'
import {
  PRIMARY_ORIGIN,
  STATIC_ROUTES,
  primaryUrl,
  socialTags,
  twitterTags,
  wikiDescription,
  wikiTitle,
} from '../src/prerender/site.js'
import { CARD_ALT, SOCIAL_IMAGE_FILES } from '../src/prerender/cards.js'
import { checkOgCards } from './ogManifest.mjs'
import { articleNode, breadcrumbNode, sitePageNode, websiteNode } from '../src/prerender/schema.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const WIKI_SRC = resolve(ROOT, 'public/wiki')

/*
 * `og:image` is absolute, and absolute on the *primary* origin.
 *
 * A root-relative og:image would resolve against whatever host the card was
 * read from, so the same share on the GitHub mirror would fetch
 * `stanlysgy.github.io/FOSS-Atlas/og/…` — a second copy of identical bytes under
 * a second URL, which is the duplicate-content situation `rel=canonical` exists
 * to avoid.
 *
 * The paths come from `cards.js`, which is the same table `scripts/build-og.mjs`
 * renders from, so the tag and the PNG cannot name different files. The cards
 * are one per page *kind*, not per entry — see `cards.js`.
 */
const SOCIAL_IMAGE = Object.fromEntries(
  Object.entries(SOCIAL_IMAGE_FILES).map(([kind, file]) => [kind, primaryUrl(file)]),
)

const BASE = process.env.VITE_BASE ?? '/FOSS-Atlas/'

const server = await createServer({
  configFile: false,
  logLevel: 'warn',
  appType: 'custom',
  // The same base the bundle was built with, so BASE_URL-dependent helpers
  // (`iconFor`, `wiki.js`) emit the URLs the client would emit for this deploy.
  base: BASE,
  server: { middlewareMode: true },
})

try {
  await run()
} finally {
  await server.close()
}

async function run() {
  const shell = readIfExists(join(DIST, 'index.html'))
  if (!shell) {
    console.error('dist/index.html not found — run `vite build` before `node scripts/prerender.mjs`.')
    process.exit(1)
  }

  const basename = BASE.replace(/\/$/, '')
  const { renderRoute } = await server.ssrLoadModule('/src/prerender/entry.jsx')
  const data = await server.ssrLoadModule('/src/lib/data.js')
  const { parseFrontmatter } = await server.ssrLoadModule('/src/lib/wiki.js')
  const prefill = await server.ssrLoadModule('/src/lib/wikiPrefill.js')

  const parts = documentParts(shell)
  const shellHead = stripHeadMeta(parts.headInner)
  const icon = linkTag('icon', rootRelative(faviconHref(shell)), { type: 'image/svg+xml' })
  checkSourceHeadMatchesSiteFile(shell)
  await checkShippedOgCards()

  const sitemapUrls = []
  let wikiPages = 0
  let missingMarkdown = 0

  /* --- top-level routes -------------------------------------------- */
  for (const route of STATIC_ROUTES) {
    const canonical = primaryUrl(route.path)
    const head = [
      shellHead,
      headTags({
        title: route.title,
        description: route.description,
        canonical,
        image: SOCIAL_IMAGE[route.path],
        ogType: route.kind === 'WebSite' ? 'website' : 'article',
        icon,
      }),
      jsonLdTag({ '@context': 'https://schema.org', '@graph': [websiteNode(), sitePageNode(route)] }),
    ].join('\n    ')

    writePage(distPathFor(route.path), renderDocument(parts, head, render(renderRoute, basename, route.path)))
    sitemapUrls.push({ loc: canonical, priority: route.path === '/' ? '1.0' : '0.7' })
  }

  /* --- wiki entries ------------------------------------------------- */
  for (const resource of data.resources) {
    const slug = data.wikiSlugFor(resource.id)
    const raw = slug ? readIfExists(join(WIKI_SRC, `${slug}.md`)) : null
    const parsed = raw ? parseFrontmatter(raw) : { data: {}, content: null }
    if (!parsed.content) missingMarkdown++

    const route = `/wiki/${resource.id}/`
    const canonical = primaryUrl(route)
    const instances = data.instancesFor(resource.id)
    const title = wikiTitle(resource)
    const description = wikiDescription(resource, instances)

    /*
     * The payload WikiPage would have fetched, seeded before the render so the
     * first render is the final one. `path` is echoed into the document so the
     * client can confirm the markup it is hydrating belongs to *this* URL —
     * `readPrerenderPayload` in src/lib/wikiPrefill.js.
     */
    const payload = { id: resource.id, path: route, data: parsed.data, content: parsed.content }
    prefill.setWikiPrefill(resource.id, payload)

    const head = [
      shellHead,
      headTags({ title, description, canonical, image: SOCIAL_IMAGE.wiki, ogType: 'article', icon }),
      jsonLdTag(
        articleNode({
          resource,
          instances,
          url: canonical,
          description,
          dateModified: parsed.data?.updated ?? null,
        }),
      ),
      jsonLdTag(breadcrumbNode({ resource })),
    ].join('\n    ')

    writePage(distPathFor(route), renderDocument(parts, head, render(renderRoute, basename, route), payload))
    prefill.clearWikiPrefill()

    sitemapUrls.push({
      loc: canonical,
      lastmod: parsed.data?.updated ?? null,
      priority: resource.deployed ? '0.8' : '0.6',
    })
    wikiPages++
  }

  /* --- sitemap + robots --------------------------------------------- */
  writeFileSync(join(DIST, 'sitemap.xml'), buildSitemap(sitemapUrls))
  writeFileSync(join(DIST, 'robots.txt'), buildRobotsTxt())

  console.log(
    `prerendered ${wikiPages + STATIC_ROUTES.length} pages ` +
      `(${wikiPages} wiki, ${missingMarkdown} with no markdown → in-app fallback body); ` +
      `sitemap.xml ${sitemapUrls.length} urls; robots.txt written`,
  )
}

/* ------------------------------------------------------------------ *
 * Render + document assembly
 * ------------------------------------------------------------------ */

/**
 * `StaticRouter` refuses to match a location that does not start with its
 * basename — passing `/wiki/syncthing` with basename `/FOSS-Atlas` renders
 * nothing and logs a match warning. So the basename is re-attached here rather
 * than stripped: the location is the URL the browser will actually have.
 */
function render(renderRoute, basename, route) {
  const body = renderRoute({ basename, location: `${basename}${route}` })
  if (!body) {
    console.error(`route ${route} rendered nothing — check the basename (${basename || '/'}) and the route list in App.jsx.`)
    process.exit(1)
  }
  return body
}

function headTags({ title, description, canonical, image, alt = CARD_ALT, ogType, icon }) {
  return [
    `<title>${escapeHtml(title)}</title>`,
    metaTag({ name: 'description', content: description }),
    icon,
    linkTag('canonical', canonical),
    ...socialTags({ title, description, url: canonical, image, alt, type: ogType }).map(metaTag),
    ...twitterTags({ title, description, image }).map(metaTag),
  ].join('\n    ')
}

/** `/wiki/syncthing/` → `dist/wiki/syncthing/index.html`; `/` → `dist/index.html`. */
function distPathFor(route) {
  if (route === '/') return join(DIST, 'index.html')
  return join(DIST, route.replace(/^\/|\/$/g, ''), 'index.html')
}

function writePage(path, html) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, html)
}

/**
 * Reassemble the page from the built document's pieces.
 *
 * Vite's doctype, `<html>`, `<head>` opening, `<body>` tag and closing tags are
 * reused verbatim (`documentParts`), so the only thing this script controls is
 * the head's metadata and what goes inside `#root`.
 *
 * No `<base>` tag: every URL in the rendered markup is already root-relative
 * with the deployed base (`/FOSS-Atlas/wiki/other`), and a browser resolves a
 * root-relative URL against the origin rather than the document's own directory
 * — so a file living at `/FOSS-Atlas/wiki/syncthing/index.html` needs no help.
 * Verified by enumerating every href/src out of a rendered wiki page.
 */
function renderDocument(parts, head, body, payload = null) {
  /*
   * `wiki-payload` is the signal main.jsx uses to choose `hydrateRoot` over
   * `createRoot` — see the comment there. Only wiki pages get one: the
   * top-level routes are prerendered for crawlers and replace-rendered on the
   * client, because `/` renders differently under a query string (`?q=…`) and
   * `/graph` mounts echarts inside an effect on a div React would not recreate —
   * hydrating either would buy mismatch noise for no benefit.
   */
  const payloadTag = payload
    ? `\n    <script id="wiki-payload" type="application/json">${escapeInlineJson(payload)}</script>`
    : ''
  return `${parts.headOpen}\n    ${head}\n  ${parts.beforeRoot}${body}${parts.afterRoot.replace(
    '</div>',
    `</div>${payloadTag}`,
  )}`
}

/** The favicon href as authored in `index.html` (`./favicon.svg`). */
function faviconHref(html) {
  const href = html.match(/<link[^>]*\brel="icon"[^>]*\bhref="([^"]+)"/)?.[1]
  if (!href) throw new Error('prerender: no <link rel="icon" href> in dist/index.html')
  return href
}

/**
 * Make a document-relative href root-relative.
 *
 * `./favicon.svg` resolves against the *document*, and these documents are no
 * longer all at the root: from `/wiki/syncthing/` it would become
 * `/wiki/syncthing/favicon.svg`. Vite leaves `./`-prefixed links alone in the
 * head, so the build rewrites them itself against the deploy base.
 */
function rootRelative(href) {
  if (href.startsWith('/')) return href
  if (/^https?:\/\//.test(href)) return href
  return `${BASE}${href.replace(/^\.\//, '')}`
}

/**
 * `index.html` and `STATIC_ROUTES[0]` describe the same page from two places
 * (the source document, and the build's metadata source). Check them against
 * each other so the copy that ships cannot disagree with the copy the sitemap
 * and og tags were built from.
 */
function checkSourceHeadMatchesSiteFile(shell) {
  const route = STATIC_ROUTES[0]
  const inDocument = shellMetadata(shell)
  const drift = []
  if (inDocument.title !== route.title) {
    drift.push(`title: index.html ${JSON.stringify(inDocument.title)} vs site.js ${JSON.stringify(route.title)}`)
  }
  if (inDocument.description !== route.description) {
    drift.push(`description: index.html ${JSON.stringify(inDocument.description)} vs site.js ${JSON.stringify(route.description)}`)
  }
  if (drift.length) {
    console.error(
      'prerender: the source document and src/prerender/site.js describe the home page differently.\n' +
        `  ${drift.join('\n  ')}\n` +
        '  Keep the copy in src/prerender/site.js authoritative and edit index.html to match.',
    )
    process.exit(1)
  }
}

/**
 * Refuse to advertise a card whose numbers no longer describe this catalogue.
 *
 * Every other claim in the build is text, so a stale one shows up in a diff.
 * `og:image` is the exception: "186 条目" is painted into a PNG, and a commit
 * that adds an entry changes the head tags while leaving the picture behind —
 * the share card then states a count the page contradicts. `scripts/build-og.mjs`
 * records the counts the shipped PNGs were drawn from, so this compares them
 * before any tag is emitted.
 *
 * Here rather than in the build chain because this is the script that *uses* the
 * images, and because the check needs no Chrome: CI can enforce it on a runner
 * without a browser, while the cards themselves stay locally-drawn binaries
 * (`npm run og`) committed to the repo.
 */
async function checkShippedOgCards() {
  const problems = await checkOgCards()
  if (!problems.length) return
  console.error(
    'prerender: the social cards in public/og/ do not match the data this build is publishing.\n' +
      `  ${problems.join('\n  ')}\n` +
      '  The cards are built locally: run `npm run og` (needs Chrome) and commit public/og/*.png with src/data/og.json.',
  )
  process.exit(1)
}

/* ------------------------------------------------------------------ *
 * sitemap.xml / robots.txt
 * ------------------------------------------------------------------ */

/**
 * One sitemap, on the primary origin, listing the primary origin.
 *
 * The GitHub Pages mirror publishes identical bytes and gets no sitemap of its
 * own: a second sitemap full of another host's URLs is a second set of duplicate
 * submissions. The mirror contributes through `rel=canonical` on every document
 * instead, which is the mechanism search engines use to pick one of two copies.
 *
 * `lastmod` is the Wiki frontmatter's `updated:` — `build-wikis.mjs` stamps it
 * from a fixed `CONTENT_REVISION`, so it moves only when the prose moves. A
 * build-time date would claim every page changed on every push, which is the
 * fastest way to stop a crawler trusting `lastmod`.
 */
function buildSitemap(urls) {
  const body = urls
    .map((u) =>
      [
        '  <url>',
        `    <loc>${escapeXml(u.loc)}</loc>`,
        u.lastmod ? `    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : null,
        `    <changefreq>${u.loc.includes('/wiki/') ? 'monthly' : 'weekly'}</changefreq>`,
        `    <priority>${u.priority}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n')
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', body, '</urlset>', ''].join('\n')
}

function buildRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# The markdown the Wiki renders from is shipped as plain files, and for a',
    '# crawler that does not run JS it is the most readable form of this content.',
    '# (Measured: Pages serves /wiki/syncthing.md as itself, 200.)',
    'Allow: /wiki/',
    '',
    `Sitemap: ${PRIMARY_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n')
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeHtml(value) {
  return escapeXml(value)
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}
