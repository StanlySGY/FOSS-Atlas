/*
 * The one place that knows what this site *is* to a crawler.
 *
 * The catalogue ships to two hosts: Cloudflare Pages on
 * `atlas.sgyyyds.qzz.io` and GitHub Pages on `stanlysgy.github.io/FOSS-Atlas/`.
 * Identical bytes, two origins. Search engines read that as duplicate content
 * unless one origin is named, so every document this build emits — both
 * variants of it, including the one deployed to GitHub — declares the same
 * canonical origin. A GitHub Pages visit therefore tells Google "the copy you
 * are looking at lives at the custom domain", which is the whole point of
 * `rel=canonical`: the mirror keeps working for readers, the primary keeps the
 * ranking.
 *
 * Everything here is build-time only and takes the app's data as arguments, so
 * it can be imported by plain Node — no Vite, no `import.meta.env`. The one
 * exception is `../lib/deployGroups.js`, which imports nothing itself and is
 * therefore importable from either side: it is where the three deployment groups
 * get their names.
 */
import { deployGroupPhrase } from '../lib/deployGroups.js'

/** The origin every canonical, og:url and sitemap entry uses. */
export const PRIMARY_ORIGIN = 'https://atlas.sgyyyds.qzz.io'

/**
 * The home page's meta description, in one place.
 *
 * `index.html` and `STATIC_ROUTES[0]` both describe this page — the source
 * document for a plain `vite build` without prerendering, and the copy the
 * sitemap, og tags and JSON-LD are built from — so the string is defined here
 * and `index.html` is checked against it (`checkSourceHeadMatchesSiteFile` in
 * scripts/prerender.mjs).
 *
 * Length is a pixel question rather than a character question: the desktop
 * snippet is cut near 920px, and a CJK glyph is about 16px at the size Google
 * renders it (measured on this catalogue's own titles: median 382px at 33
 * characters). At 15 CJK + Latin mix this sits at ~900px; the previous wording
 * measured 1032px and would have been cut mid-sentence.
 */
export const HOME_DESCRIPTION =
  '免费额度、自部署方案、公开 API 收进一张可搜索、可漫游的图：186 个开源条目，导航、Wiki、知识图谱三合一。'

export const SITE_NAME = 'FOSS-Atlas'
export const SITE_TAGLINE = '开源白嫖资源图鉴'

/**
 * Routes that are not wiki entries.
 *
 * `path` is the router path — and the URL shape — at the same time: the wiki
 * helper builds `/wiki/<id>/`, and these carry the trailing slash too, because
 * both hosts serve a directory index at a trailing-slash URL and redirect the
 * slash-less form to it. Emitting links with the slash means the canonical URL
 * is the one the browser actually lands on, with no redirect hop and no
 * "redirected canonical" report in Search Console.
 *
 * No `image` field here on purpose: the card for a route is keyed off `path` in
 * `SOCIAL_IMAGE_FILES` (`cards.js`), the same table the renderer draws from, so
 * repeating the filename here would be a second place for it to drift.
 */
export const STATIC_ROUTES = [
  {
    path: '/',
    title: 'FOSS-Atlas · 开源白嫖资源图鉴',
    description: HOME_DESCRIPTION,
    kind: 'WebSite',
  },
  {
    path: '/graph/',
    title: '知识图谱 · FOSS-Atlas',
    description:
      '186 个条目、643 条关系边的可拖拽图谱：同类、替代、分类、自建实例一目了然，可只看已自部署的部分。',
    kind: 'WebPage',
  },
  {
    path: '/deployed/',
    title: '自部署服务 · FOSS-Atlas',
    description:
      '图鉴里真正跑起来的服务：Cloudflare 边缘、本地 Docker 隧道、GitHub Pages 镜像三组，附访问地址与部署说明。',
    kind: 'WebPage',
  },
]

/** Absolute URL on the primary origin. */
export function primaryUrl(path) {
  return `${PRIMARY_ORIGIN}${path}`
}

/**
 * `<title>` for a wiki page.
 *
 * Truncation is a pixel question, not a character question: Google cuts titles
 * at roughly 600px on desktop, and a CJK glyph is about twice as wide as a
 * Latin one (measured on this catalogue: median pattern below is 382px at
 * 33 characters, 90th percentile 480px). `name · 子分类 | 站名` therefore stays
 * inside the cut for all but two of the 186 entries, while the same pattern
 * against the *top-level* category name would be cut for eleven of them.
 */
export function wikiTitle(resource) {
  return `${resource.name} · ${resource.sub_category_name} | ${SITE_NAME}`
}

/**
 * Meta description for a wiki page.
 *
 * The catalogue's own `description` is the only prose guaranteed to agree with
 * the data, so it is the base rather than a generated sentence — a description
 * that drifted from the Wiki body would be the kind of mismatch that makes a
 * snippet stop showing. Appending the deployment state only where it is true.
 */
export function wikiDescription(resource, instances) {
  const base = resource.description
  if (!base) return `${resource.name} · ${resource.sub_category_name} —— ${SITE_NAME} 条目 Wiki`
  if (!instances?.length) return base
  const where = deployGroupPhrase([...new Set(instances.map((i) => i.group))])
  return `${base}（已自部署：${where}）`
}

/* ------------------------------------------------------------------ *
 * Social cards
 * ------------------------------------------------------------------ */

/**
 * `og:*` + `twitter:*`.
 *
 * `og:image` is a fixed PNG per page *kind*, not per entry, and the copy on it
 * is CJK. Both choices are about who rasterises the picture: **we** do, with
 * this site's own subsetted font (`scripts/build-og.mjs`, `src/prerender/ogCard.js`),
 * so a crawler's font set never touches the card and the usual "CJK in an og
 * image renders as tofu on some networks" objection does not apply — the glyphs
 * are already pixels. That is also what makes 186 per-entry cards the wrong
 * trade rather than an impossible one: 186 committed binaries for a picture
 * whose only extra content is a name the crawler already gets as text from
 * `og:title`.
 *
 * The freshness argument is the one that has teeth here, and it is handled in
 * `scripts/ogManifest.mjs`: a count painted into a PNG is a claim no diff can
 * show going stale.
 */
/**
 * `alt` is an argument rather than something computed here, for two reasons that
 * point the same way: it must be the line the card *prints* (`CARD_ALT` in
 * `cards.js`, which `scripts/build-og.mjs` rasterises into the footer), and
 * `cards.js` already imports `SITE_NAME`/`SITE_TAGLINE` from this file, so
 * importing back would make the two a cycle whose constants fail to initialise.
 * The caller that composes a page's head is the one place that has both sides.
 */
export function socialTags({ title, description, url, image, alt, type = 'article' }) {
  return [
    ['og:type', type],
    ['og:site_name', SITE_NAME],
    ['og:locale', 'zh_CN'],
    ['og:title', title],
    ['og:description', description],
    ['og:url', url],
    ['og:image', image],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', alt],
  ].map(([property, content]) => ({ property, content }))
}

/**
 * `summary_large_image` is the only card worth declaring: `summary` asks the
 * crawler to crop a 1200×630 into a square, which cuts the footer line — the one
 * part of the card that says which site the picture came from.
 */
export function twitterTags({ title, description, image }) {
  return [
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', title],
    ['twitter:description', description],
    ['twitter:image', image],
  ].map(([name, content]) => ({ name, content }))
}
