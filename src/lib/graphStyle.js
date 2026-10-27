/** Visual + semantic metadata for knowledge-graph nodes and edges. */
/*
 * The hue for "跑在我自己的基础设施上", used for one meaning in two places: as
 * the graph's 自建 node type, and as the swatch on every 已自部署 mark in the
 * DOM. A deployment should read the same way in the canvas as it does on a card.
 *
 * Measured in the CVD-simulated Lab space (sRGB → LMS → deuteranomaly matrix →
 * Lab, identity round-trip 0.0), so the separation numbers below are what
 * deuteranopic readers actually get, not what a normal-tricolour viewer gets.
 * Against the node palette: 自建 vs 子类 ΔE76 55.2, vs 标签 40.2, vs 工具 34.1,
 * vs 外部 113.7 — the tightest pair is 工具 and 34 is far past where two marks
 * stop being tellable at a glance. On the canvas (--ink-sunken, L* 12.8) it
 * measures 3.84:1; a filled node is a mark, floor 3:1.
 *
 * It is the second-darkest filled node, and that ordering is the point:
 * 分类 8.63 > 子类 6.38 > 工具 5.05 > 外部 3.98 > 自建 3.84 > 标签 3.19 is how
 * much attention each type deserves. Brightening 自建 further would put it in
 * 工具's band, and every brighter violet in that band collapses to ΔE76 12–22
 * against the proxy category hue — so the fix for the DOM marks is the plate
 * they sit on (--own-well, see index.css), not this hue. Words wear --own-text.
 */
export const OWN_COLOR = '#7b6cdb'

export const TYPE_META = {
  category: { label: '分类', color: '#f0b429', size: 46 },
  subcategory: { label: '子类', color: '#4fb3a5', size: 26 },
  /*
   * 工具 nodes are hollow and now wear their 分类's hue as the ring (see
   * GraphView), so this hex is the fallback ring for a tool whose category is
   * missing — 0 of the 174 today, but graph.json is generated, so the fallback
   * has to be a colour that does not collide rather than the accent.
   *
   * The old #7d8c93 was the palette's known failure: 8.2 ΔE76 from 子类
   * #4fb3a5 under deuteranopia (a *hard* fail — two marks that small read as
   * the same dot), and only 13.9 from the gear category hue. #8c8cbc moves the
   * grey into the same cool-violet family the neutrals now sit in, and every
   * pair improves: 30.7 from 子类, 34.1 from 自建, 16.5 from 标签, 94.0 from
   * 外部, and 12.8 worst-case against any of the 11 category hues (atlas
   * #b6a8da, which is the only category hue in this grey's neighbourhood).
   * 5.05:1 on --ink-sunken, L* 59.9 — 13 L* above 标签, so the two greys stay
   * separate on lightness alone even where hue is doing nothing.
   */
  tool: { label: '工具', color: '#8c8cbc', size: 15 },
  // One step larger than a tool: it is a service that actually exists somewhere,
  // not just an entry in the catalogue — and unlike a tool it is drawn *filled*,
  // so the type survives even where the hue is the only thing you can compare.
  own: { label: '自建', color: OWN_COLOR, size: 17 },
  // 标签 nodes are filled at the smallest size in the graph, so this is the
  // one type whose whole case rests on hue + lightness. #6f6b8c: 3.19:1 on
  // --ink-sunken (mark floor 3:1), L* 46.7, and ΔE76 27.6 / 16.5 / 40.2 / 84.0
  // from 子类 / 工具 / 自建 / 外部 under deuteranopia. Unchanged by this pass:
  // the canvas moved 3.7 L* up underneath it and it still clears 3:1.
  tag: { label: '标签', color: '#6f6b8c', size: 11 },
  external: { label: '外部服务', color: '#c2643f', size: 12 },
}

/*
 * The three structural edges. Measured as they actually land: the hex composited
 * over --ink-sunken (L* 12.8) at the edge's own opacity, which is the colour the
 * eye gets.
 *
 * Before this palette they were #514c6b / #5b5677 / #4a4560 over a canvas at
 * L* 3.1: 1.96 / 2.37 / 1.78:1. The canvas moved to L* 12.8, and a line that is
 * only a *layer* cue has to move with its ground or it vanishes — at the old
 * hexes over the new canvas they measure 1.44 / 1.65 / 1.31:1, i.e. the
 * connective field would have got fainter while everything around it got
 * brighter. Each one is lifted to hold the gap: #645f74 / #6c667c / #5c576b
 * composited to **2.15 / 2.48 / 1.95:1**, same ranking, same opacities.
 *
 * Still deliberately *below* the 3:1 mark floor, because an edge is not a thing
 * to read, it is the field that tells you which dots are connected. The two
 * semantic edges keep their hues and clear the structural greys outright —
 * composited they measure 5.00 (相关) and 3.25 (替代), and against the
 * structural greys they separate by ΔE76 27.8–33.9 (相关) and 75.5–77.0 (替代)
 * even under deuteranopia. The order of attention on screen is the order of
 * interest in the data: 替代 > 相关 > 归类 > 属于 > 标签.
 *
 * Brightness is ranked by *rarity × meaning*, not uniformly: 归类 is 22 edges
 * and is the strongest structural claim, so it gets the most; 标签 is 338 of the
 * 643 edges and only says "shares a word", so it stays the faintest.
 *
 * `chip` is a separate value for one reason: the same hex has to do two jobs
 * that have different floors. On the canvas the three structural greys are a
 * field, not a mark, and sit deliberately under 3:1. In the 关系过滤 chips the
 * very same hexes would be an 8px opaque dot on the page ground, which *is* a
 * mark — drawn flat there they measure 2.34 / 2.62 / 2.09:1 (2.05 / 2.29 / 1.85
 * on --ink-card), all three under the 3:1 floor, and they are only 2.7–6.6 ΔE76
 * apart from each other under deuteranopia, one violet family, so three swatches
 * that close would advertise a distinction the canvas itself does not make.
 * So one grey serves all three structural chips: #89839b, 3.78:1 on the page
 * ground, 3.06 on --ink-card, 4.43 on the canvas, L* 56.0, and ΔE76 19.9 / 16.1
 * / 22.6 (deutan) from the three composited edge greys. Its tightest pair with
 * any node colour is 标签 at 13.5 deutan — normal 11.0 — and the two are told
 * apart by size (an 11px node vs an 8px swatch) and by the fact that a chip dot
 * never sits on the canvas. The two semantic edges keep their own hue. Hue on a
 * chip then means exactly one thing: grey = 结构 (属于 / 归类 / 标签), teal = 相关,
 * rust = 替代; which structural one is named by the label and its count, and how
 * strong it is on the canvas by width and opacity. The dot turning to
 * --line-muted (2.11:1 on a card, 2.55 on the ground) is not a mark either — off
 * state rides on the label colour and the border — and the on/off pair measures
 * ΔE76 19.0 normal / 19.5 deutan.
 */
export const EDGE_CHIP_GREY = '#89839b'

export const EDGE_META = {
  belongs_to: { label: '属于', color: '#645f74', chip: EDGE_CHIP_GREY, width: 1, curveness: 0, opacity: 0.8 },
  in_category: { label: '归类', color: '#6c667c', chip: EDGE_CHIP_GREY, width: 1.2, curveness: 0, opacity: 0.85 },
  tagged: { label: '标签', color: '#5c576b', chip: EDGE_CHIP_GREY, width: 0.8, curveness: 0.12, opacity: 0.8 },
  related: { label: '相关', color: '#4fb3a5', width: 1.3, curveness: 0.18, opacity: 0.85 },
  alternative_to: { label: '替代', color: '#c2643f', width: 1.3, curveness: 0.22, opacity: 0.85 },
}

export const TYPE_ORDER = Object.keys(TYPE_META)

/*
 * Canvas palette.
 *
 * ECharts paints to a <canvas> and takes literal colour strings — it cannot
 * resolve a CSS custom property. These mirror the design tokens in index.css
 * and live here (rather than inline in GraphView) so the graph's chrome has one
 * source of truth. Keep them in sync with `:root` when the palette changes.
 */
export const CANVAS = {
  /*
   * The visible canvas *field* is not here: the chart's own background is
   * 'transparent' and the container paints --ink-sunken (#221f2f, L* 12.8), which
   * is why every node contrast above is quoted against it. `surface` below is the
   * tooltip's own plate, and it mirrors --ink-card — a tooltip that appears as a
   * different material than the card beside it looks like a different app.
   */
  /*
   * Two different plates that used to be one token. `surface` is the tooltip's
   * own plate; `field` is the canvas background the nodes are drawn on
   * (--ink-sunken). Hollow nodes must wear `field`: the hollowness is the type
   * signal (a catalogue entry vs a service that is actually running), and a
   * hollow node filled with the card colour would be a *disc* 1.449:1 brighter
   * than the field rather than a hole in it.
   */
  surface: '#3d394d', // --ink-card, tooltip background
  field: '#221f2f', // --ink-sunken, the container's own background and the hollow node body
  line: '#524b6b', // --line, tooltip border
  lineStrong: '#6a6281', // --line-strong, legend inactive swatch — 2.82:1 on the field, a swatch not a label
  text: '#dcd8e8', // --text, tooltip body — 7.95:1 on the tooltip plate
  textStrong: '#e5e0f1', // --text-strong, emphasis label — 8.60 on the plate
  // Was the old tool grey, which meant the tooltip's meta line and a 工具 node
  // were the same colour for two different jobs. Now it mirrors --text-faint:
  // 6.94:1 on the tooltip plate, 11px text, floor 4.5:1.
  textDim: '#cfcadb',
  label: '#d5d0e1', // --text-dim, node labels — 10.68:1 on the field, 7.37 on the card
  edge: '#645f74', // resting edge colour — mirrors EDGE_META.belongs_to
  focusRing: '#f0b429', // --accent
  // A warm white no other node uses, so a focused category node (solid accent)
  // stays legible. See the note in GraphView.
  focusFill: '#f7f0e5',
  own: OWN_COLOR, // 自建 nodes, and the swatch on 已自部署 marks
}
