/** Visual + semantic metadata for knowledge-graph nodes and edges. */
/*
 * The hue for "跑在我自己的基础设施上", used for one meaning in two places: as
 * the graph's 自建 node type, and as the swatch on every 已自部署 mark in the
 * DOM. A deployment should read the same way in the canvas as it does on a card.
 *
 * Measured in the CVD-simulated Lab space (sRGB → LMS → deuteranomaly matrix →
 * Lab, identity round-trip 0.0), so the separation numbers below are what
 * deuteranopic readers actually get, not what a normal-tricolour viewer gets.
 * Against the node palette it joins: 自建 vs 子类 ΔE76 35.4, vs 工具 20.1, vs
 * 标签 27.5, vs 外部 67.8 — its tightest pair is 工具, and 20 is roughly where
 * two marks stop being tellable at a glance. Contrast 4.29:1 on --ink-sunken
 * (a filled node is a mark: floor 3:1).
 */
export const OWN_COLOR = '#7f63cf'

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
   * pair improves: 15.3 from 子类, 20.1 from 自建, 15.6 from 标签, 49.8 from
   * 外部, and 11.8 worst-case against any of the 11 category hues. 6.17:1 on
   * --ink-sunken, L* 59.9 — a full 13 L* above 标签, so the two greys stay
   * separate on lightness alone even where hue is doing nothing.
   */
  tool: { label: '工具', color: '#8c8cbc', size: 15 },
  // One step larger than a tool: it is a service that actually exists somewhere,
  // not just an entry in the catalogue — and unlike a tool it is drawn *filled*,
  // so the type survives even where the hue is the only thing you can compare.
  own: { label: '自建', color: OWN_COLOR, size: 17 },
  // 标签 nodes are filled at the smallest size in the graph, so this is the
  // one type whose whole case rests on hue + lightness. #6f6b8c: 3.89:1 on
  // --ink-sunken (mark floor 3:1), L* 46.7, and ΔE76 18.7 / 15.6 / 27.5 / 41.5
  // from 子类 / 工具 / 自建 / 外部 under deuteranopia. The old #5a6b74 cleared
  // the pairs too, but at 3.55:1 it sat on the canvas rather than in it.
  tag: { label: '标签', color: '#6f6b8c', size: 11 },
  external: { label: '外部服务', color: '#c2643f', size: 12 },
}

/*
 * The three structural edges. Measured as they actually land: the hex composited
 * over --ink-sunken at the edge's own opacity, which is the colour the eye gets.
 *
 * Before this palette they were #454e51 / #4d575a / #3f484b over a near-black
 * teal-leaning canvas (#0d1112): 1.85 / 2.16 / 1.71:1. The neutrals moved to a
 * violet base, so the edges move with them — a teal-grey line on a violet ground
 * reads as dirt rather than as structure. Same opacities, same ranking: 1.96 /
 * 2.37 / 1.78:1 against the new --ink-sunken.
 *
 * Still deliberately *below* the 3:1 mark floor, because an edge is not a thing
 * to read, it is the field that tells you which dots are connected. The two
 * semantic edges keep their hues and clear the structural greys outright —
 * composited they measure 5.86 (相关) and 3.80 (替代), and against the
 * structural greys they separate by ΔE76 23–37 even under deuteranopia. The
 * order of attention on screen is the order of interest in the data:
 * 替代 > 相关 > 归类 > 属于 > 标签.
 *
 * Brightness is ranked by *rarity × meaning*, not uniformly: 归类 is 22 edges
 * and is the strongest structural claim, so it gets the most; 标签 is 338 of the
 * 643 edges and only says "shares a word", so it stays the faintest.
 *
 * `chip` is a separate value for one reason: the same hex has to do two jobs
 * that have different floors. On the canvas the three structural greys are a
 * field, not a mark, and sit deliberately under 3:1 (1.96 / 2.37 / 1.78
 * composited). In the 关系过滤 chips the very same hexes are an 8px opaque dot
 * on --ink, which *is* a mark — measured there they were 2.20 / 2.47 / 2.90:1,
 * under the floor, and no brighter version of the same three hues fixes it
 * honestly: they are 3.3–8.6 ΔE76 apart, so three swatches the eye cannot
 * separate would advertise a distinction the canvas itself does not make. So
 * one grey serves all three structural chips (#645e80 — 3.29:1 on --ink,
 * 3.04:1 on --ink-card, L* 41.6; 24.2 ΔE76 from the off dot --line-muted,
 * 23.1 from 相关, 41.9 from 替代, deutan-limited) and the two semantic edges
 * keep their own hue. Hue on a chip then means exactly one thing: grey = 结构
 * (属于 / 归类 / 标签), teal = 相关, rust = 替代; which structural one is named
 * by the label and its count, and how strong it is on the canvas by width and
 * opacity. The dot turning to --line-muted (1.44:1) is not a mark either — off
 * state rides on the label colour and the border, and the on/off pair measures
 * 24.2 ΔE76.
 */
export const EDGE_CHIP_GREY = '#645e80'

export const EDGE_META = {
  belongs_to: { label: '属于', color: '#514c6b', chip: EDGE_CHIP_GREY, width: 1, curveness: 0, opacity: 0.8 },
  in_category: { label: '归类', color: '#5b5677', chip: EDGE_CHIP_GREY, width: 1.2, curveness: 0, opacity: 0.85 },
  tagged: { label: '标签', color: '#4a4560', chip: EDGE_CHIP_GREY, width: 0.8, curveness: 0.12, opacity: 0.8 },
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
   * 'transparent' and the container paints --ink-sunken (#0b0b0f), which is why
   * every node contrast above is quoted against #0b0b0f. `surface` below is the
   * tooltip's own plate, and it mirrors --ink-card — a tooltip that appears as a
   * different material than the card beside it looks like a different app.
   */
  surface: '#15121c', // --ink-card, tooltip background
  line: '#262033', // --line, tooltip border
  lineStrong: '#48415a', // --line-strong, legend inactive swatch
  text: '#cfd4d6', // --text, tooltip body — 12.37:1 on the tooltip plate
  textStrong: '#f2f4f5', // --text-strong, emphasis label
  // Was the old tool grey, which meant the tooltip's meta line and a 工具 node
  // were the same colour for two different jobs. Now it mirrors --text-faint:
  // 6.20:1 on the tooltip plate, 11px text, floor 4.5:1.
  textDim: '#8e979a',
  label: '#9aa2a5', // --text-dim, node labels — 7.56:1 on the field
  edge: '#514c6b', // resting edge colour — mirrors EDGE_META.belongs_to
  focusRing: '#f0b429', // --accent
  // A warm white no other node uses, so a focused category node (solid accent)
  // stays legible. See the note in GraphView.
  focusFill: '#f5f0e6',
  own: OWN_COLOR, // 自建 nodes, and the swatch on 已自部署 marks
}
