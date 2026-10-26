/** Visual + semantic metadata for knowledge-graph nodes and edges. */
/*
 * The hue for "跑在我自己的基础设施上", used for one meaning in two places: as
 * the graph's 自建 node type, and as the swatch on every 已自部署 mark in the
 * DOM. A deployment should read the same way in the canvas as it does on a card.
 *
 * Chosen with the dataviz validator against the dark canvas surface: of the
 * candidates tried it is the only one that lands inside the lightness band,
 * clears the chroma floor, and still separates from the tool grey (ΔE 14.9
 * deutan, 16.1 normal vision) — so it adds no new failure to the palette it
 * joins. That palette's worst pair is pre-existing: tool ↔ subcategory at
 * ΔE 11.0 normal vision, which is a hard fail and predates this type.
 */
export const OWN_COLOR = '#7f63cf'

export const TYPE_META = {
  category: { label: '分类', color: '#f0b429', size: 46 },
  subcategory: { label: '子类', color: '#4fb3a5', size: 26 },
  tool: { label: '工具', color: '#7d8c93', size: 15 },
  // One step larger than a tool: it is a service that actually exists somewhere,
  // not just an entry in the catalogue — and unlike a tool it is drawn *filled*,
  // so the type survives even where the hue is the only thing you can compare.
  own: { label: '自建', color: OWN_COLOR, size: 17 },
  tag: { label: '标签', color: '#5a6b74', size: 11 },
  external: { label: '外部服务', color: '#c2643f', size: 12 },
}

/*
 * The three structural edges were #2f3639 / #3a4245 / #26302f: composited over
 * the canvas at their resting opacity that measured 1.21 / 1.30 / 1.15:1 against
 * --ink-sunken, i.e. 643 edges of which you could not see 586. The canvas read
 * as nodes floating on an empty field, which is not what a graph is for.
 *
 * Stepped up to 1.7–2.2:1 composited — deliberately *below* the 3:1 mark floor,
 * because an edge is not a thing to read, it is the field that tells you which
 * dots are connected. The two semantic edges (related / 替代) keep their hues
 * and sit well above the structural grey, so the order of attention on screen is
 * the order of interest in the data: 替代 > 相关 > 归类 > 属于 > 标签.
 *
 * Brightness is ranked by *rarity × meaning*, not uniformly: 归类 is 22 edges
 * and is the strongest structural claim, so it gets the most; 标签 is 338 and
 * only says "shares a word", so it stays the faintest.
 */
export const EDGE_META = {
  belongs_to: { label: '属于', color: '#454e51', width: 1, curveness: 0, opacity: 0.8 },
  in_category: { label: '归类', color: '#4d575a', width: 1.2, curveness: 0, opacity: 0.85 },
  tagged: { label: '标签', color: '#3f484b', width: 0.8, curveness: 0.12, opacity: 0.8 },
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
  surface: '#101314', // --ink-card, tooltip background
  line: '#23282a', // --line, tooltip border
  lineStrong: '#3a4245', // --line-strong, legend inactive swatch
  text: '#cfd4d6', // --text, tooltip body
  textStrong: '#f2f4f5', // --text-strong, emphasis label
  textDim: '#7d8c93', // dimmed legend / tooltip meta
  label: '#9aa2a5', // --text-dim, node labels
  edge: '#454e51', // resting edge colour — mirrors EDGE_META.belongs_to
  focusRing: '#f0b429', // --accent
  // A warm white no other node uses, so a focused category node (solid accent)
  // stays legible. See the note in GraphView.
  focusFill: '#f5f0e6',
  own: OWN_COLOR, // 自建 nodes, and the swatch on 已自部署 marks
}
