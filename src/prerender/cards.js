/*
 * The copy that gets *drawn* onto the social cards (og:image / twitter:image).
 *
 * Kept apart from the head metadata in `site.js` because the two are written for
 * different readers and fail differently: `og:description` is reflowed by the
 * crawler into a caption of its own choosing, so its length is a snippet-length
 * question, while a card's text is pixels this build rasterises itself, so its
 * length is a layout question — two lines inside 1200px, no ellipsis.
 *
 * Counts are arguments, not literals, for the same reason `site.js` takes the
 * catalogue as arguments: a "186" painted into a PNG is a claim that goes stale
 * on the next commit to the data, and nothing about the diff says so — the
 * number is inside a binary. `scripts/build-og.mjs` fills them from
 * `graph.stats`, writes the values it used next to the PNGs, and
 * `scripts/prerender.mjs` fails the build when the current stats disagree with
 * the ones the shipped cards were drawn from.
 *
 * Why one card per page *kind* rather than one per entry: 186 cards is either
 * 186 committed binaries (≈12 MB against this repo's 58 tracked icons) or a font
 * rasteriser running inside CI on every push. The entry's own name already
 * arrives through `og:title`, which every crawler reads as text.
 *
 * Every CJK string in this file is drawn by the site's own subsetted font, so it
 * must be copy the font pipeline can see: `scripts/glyphSet.mjs` walks
 * `src` 下的 js / jsx / css 文件（含本文件）来决定哪些字形留在子集里
 * subsetting, and `scripts/build-og.mjs` refuses to render a card whose copy is
 * not in that set. Copy written into a script under `scripts/` instead is
 * invisible to the walk and would rasterise as tofu.
 */
import { SITE_NAME, SITE_TAGLINE } from './site.js'

/** Drawn bottom-right: a card saved into a chat should still name where it came from. */
export const ORIGIN_HOST = 'atlas.sgyyyds.qzz.io'

/** Drawn in the footer, and reused as `og:image:alt`. */
export const CARD_ALT = `${SITE_TAGLINE} · 导航 + Wiki + 知识图谱`

export const SOCIAL_IMAGE_FILES = {
  '/': '/og/site.png',
  '/graph/': '/og/graph.png',
  '/deployed/': '/og/deployed.png',
  wiki: '/og/wiki.png',
}

export const CARDS = {
  '/': {
    kicker: `${SITE_NAME} · 开源资源图鉴`,
    title: '开源白嫖资源图鉴',
    description: '导航 + Wiki + 知识图谱三合一的免费/开源资源库：免费额度、自部署方案、公开 API 全收进一张图。',
    chip: (s) => `${s.tools} 条目`,
  },
  '/graph/': {
    kicker: `${SITE_NAME} · 知识图谱`,
    title: '知识图谱',
    description: (s) =>
      `${s.tools} 个条目、${s.edges} 条关系边：同类、替代、分类、自建实例收进一张可拖拽的图。`,
    chip: (s) => `${s.edges} 边`,
  },
  '/deployed/': {
    kicker: `${SITE_NAME} · 自部署服务`,
    title: '自部署服务',
    description: (s) =>
      `${s.deployed} 个条目、${s.instances} 个实例跑在自己的基础设施上：Cloudflare 边缘、Docker 隧道、GitHub Pages 镜像三组。`,
    chip: (s) => `${s.instances} 实例`,
  },
  wiki: {
    kicker: `${SITE_NAME} · 条目 Wiki`,
    title: '工具 Wiki',
    description: (s) =>
      `${s.tools} 篇条目 Wiki：用途、免费额度、替代方案，以及这一站自己的部署说明。`,
    chip: (s) => `${s.tools} 篇`,
  },
}

/**
 * The four cards, as plain data the renderer can drop into a template.
 * `stats` is `graph.stats` from the data generator.
 */
export function cardSet(stats) {
  const fill = (v) => (typeof v === 'function' ? v(stats) : v)
  return Object.fromEntries(
    Object.entries(CARDS).map(([kind, card]) => [
      kind,
      {
        file: SOCIAL_IMAGE_FILES[kind],
        kicker: card.kicker,
        title: fill(card.title),
        description: fill(card.description),
        chip: fill(card.chip),
        footer: CARD_ALT,
        originHost: ORIGIN_HOST,
      },
    ]),
  )
}

/** The stats a card set depends on — the freshness check compares these. */
export function cardStats(stats) {
  return { tools: stats.tools, edges: stats.edges, deployed: stats.deployed, instances: stats.instances }
}
