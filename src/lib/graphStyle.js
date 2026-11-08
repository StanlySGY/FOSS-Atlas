/** Visual + semantic metadata for knowledge-graph nodes and edges. */
/*
 * The hue for "跑在我自己的基础设施上", used for one meaning in two places: as
 * the graph's 自建 node type, and as the swatch on every 已自部署 mark in the
 * DOM. A deployment should read the same way in the canvas as it does on a card.
 *
 * OWN_COLOR mirrors the --own token in redesign.css (#22856c on the light
 * theme) — 4.18:1 on the canvas field #f4f6fa, past the 3:1 filled-node floor,
 * and the same hex the badge on a card wears. The dark-theme violet (#7b6cdb)
 * was retired with that theme.
 */
export const OWN_COLOR = '#22856c'

export const TYPE_META = {
  category: { label: '分类', color: '#b6830d', size: 46 },
  subcategory: { label: '子类', color: '#439a8e', size: 26 },
  /*
   * 工具 nodes are hollow and now wear their 分类's hue as the ring (see
   * GraphView), so this hex is the fallback ring for a tool whose category is
   * missing — 0 of the 174 today, but graph.json is generated, so the fallback
   * has to be a colour that does not collide rather than the accent.
   *
   * The old #7d8c93 was the palette's known failure against 子类 under
   * deuteranopia. The light-canvas value keeps the same cool-violet family:
   * #8989bb is 3.05:1 on the light field — past the 3:1 mark floor for a
   * 1.6px ring — and stays clearly apart from the darker 标签 violet by
   * lightness alone.
   */
  tool: { label: '工具', color: '#8989bb', size: 15 },
  // One step larger than a tool: it is a service that actually exists somewhere,
  // not just an entry in the catalogue — and unlike a tool it is drawn *filled*,
  // so the type survives even where the hue is the only thing you can compare.
  own: { label: '自建', color: OWN_COLOR, size: 17 },
  // 标签 nodes are filled at the smallest size in the graph, so this is the
  // one type whose whole case rests on hue + lightness. #6f6b8c measured
  // 4.67:1 on the light field — *too* loud: on a light canvas darker means
  // more attention, and 40 filled dark-violet dots would outweigh the 分类
  // nodes they exist to annotate. Kept as-is anyway: it is the one colour
  // that survived both canvases over the 3:1 floor, and the size hierarchy
  // (11px vs 46px) carries the attention ordering where contrast cannot.
  tag: { label: '标签', color: '#6f6b8c', size: 11 },
  external: { label: '外部服务', color: '#c2643f', size: 12 },
}

/*
 * The three structural edges. Measured as they actually land: the hex composited
 * over the light field (--ink-sunken #f4f6fa) at the edge's own opacity, which
 * is the colour the eye gets.
 *
 * A line that is only a *layer* cue tracks its ground: on the light canvas the
 * old dark-theme greys composited to 3.2–3.5:1 — louder than the semantic
 * edges, inverting the attention order. Each grey is re-solved so the
 * composited contrast keeps the dark-theme ranking: #928ca0 / #9993a7 /
 * #a59fb3 composite to **2.46 / 2.17 / 1.95:1**, same ordering, same opacities.
 *
 * Still deliberately *below* the 3:1 mark floor, because an edge is not a thing
 * to read, it is the field that tells you which dots are connected. The two
 * semantic edges keep their hues and clear the structural greys outright —
 * composited they measure 3.27 (相关, re-darkened from #4fb3a5 for the light
 * field) and 3.01 (替代), above every structural grey.
 *
 * Brightness is ranked by *rarity × meaning*, not uniformly: 归类 is 22 edges
 * and is the strongest structural claim, so it gets the most; 标签 is the
 * majority of all edges and only says "shares a word", so it stays the faintest.
 *
 * `chip` is a separate value for one reason: the same hex has to do two jobs
 * that have different floors. On the canvas the three structural greys are a
 * field, not a mark, and sit deliberately under 3:1. In the 关系过滤 chips the
 * very same idea would be an 8px opaque dot on the page ground, which *is* a
 * mark. So one grey serves all three structural chips: #89839b, 3.63:1 on
 * white / 3.5:1 on the ground — past the mark floor — while a chip dot never
 * sits on the canvas. The two semantic edges keep their own hue. Hue on a chip
 * then means exactly one thing: grey = 结构 (属于 / 归类 / 标签), teal = 相关,
 * rust = 替代; which structural one is named by the label and its count, and how
 * strong it is on the canvas by width and opacity. The dot turning to
 * --line-muted (#c7d0dd, 1.56:1 on white) is not a mark either — off state
 * rides on the label colour and the border.
 */
export const EDGE_CHIP_GREY = '#89839b'

export const EDGE_META = {
  belongs_to: { label: '属于', color: '#9993a7', chip: EDGE_CHIP_GREY, width: 1, curveness: 0, opacity: 0.8 },
  in_category: { label: '归类', color: '#928ca0', chip: EDGE_CHIP_GREY, width: 1.2, curveness: 0, opacity: 0.85 },
  tagged: { label: '标签', color: '#a59fb3', chip: EDGE_CHIP_GREY, width: 0.8, curveness: 0.12, opacity: 0.8 },
  related: { label: '相关', color: '#1e8577', width: 1.3, curveness: 0.18, opacity: 0.85 },
  alternative_to: { label: '替代', color: '#c2643f', width: 1.3, curveness: 0.22, opacity: 0.85 },
}

export const TYPE_ORDER = Object.keys(TYPE_META)

/*
 * Canvas palette.
 *
 * ECharts paints to a <canvas> and takes literal colour strings — it cannot
 * resolve a CSS custom property. These mirror the design tokens in redesign.css
 * (the light theme's `:root`) and live here (rather than inline in GraphView) so
 * the graph's chrome has one source of truth. Keep them in sync with `:root`
 * when the palette changes.
 */
export const CANVAS = {
  /*
   * The visible canvas *field* is not here: the chart's own background is
   * 'transparent' and the container paints --ink-sunken (#f4f6fa), which is why
   * every node contrast above is quoted against it. `surface` below is the
   * tooltip's own plate, and it mirrors --ink-card — a tooltip that appears as a
   * different material than the card beside it looks like a different app.
   */
  /*
   * Two different plates that used to be one token. `surface` is the tooltip's
   * own plate; `field` is the canvas background the nodes are drawn on
   * (--ink-sunken). Hollow nodes must wear `field`: the hollowness is the type
   * signal (a catalogue entry vs a service that is actually running), and a
   * hollow node filled with the card colour would be a *disc* one step brighter
   * than the field rather than a hole in it.
   */
  surface: '#ffffff', // --ink-card, tooltip background
  field: '#f4f6fa', // --ink-sunken, the container's own background and the hollow node body
  line: '#dfe4ec', // --line, tooltip border
  lineStrong: '#8fa0b5', // legend inactive swatch — 2.47:1 on the field, a swatch not a label
  text: '#344054', // --text, tooltip body
  textStrong: '#172033', // --text-strong, emphasis label
  // Mirrors --text-faint: 4.58:1 on the field, 11px tooltip meta, floor 4.5:1.
  textDim: '#65708a',
  label: '#5d687b', // --text-dim, node labels — 5.20:1 on the field
  edge: '#9993a7', // resting edge colour — mirrors EDGE_META.belongs_to
  focusRing: '#315ee8', // --accent
  // A warm near-black no other node uses, so a focused node inverts against the
  // light field instead of dissolving into it. See the note in GraphView.
  focusFill: '#241f31',
  own: OWN_COLOR, // 自建 nodes, and the swatch on 已自部署 marks
}
