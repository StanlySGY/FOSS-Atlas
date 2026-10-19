/** Visual + semantic metadata for knowledge-graph nodes and edges. */
export const TYPE_META = {
  category: { label: '分类', color: '#f0b429', size: 46 },
  subcategory: { label: '子类', color: '#4fb3a5', size: 26 },
  tool: { label: '工具', color: '#7d8c93', size: 15 },
  tag: { label: '标签', color: '#5a6b74', size: 11 },
  external: { label: '外部服务', color: '#c2643f', size: 12 },
}

export const EDGE_META = {
  belongs_to: { label: '属于', color: '#2f3639', width: 1, curveness: 0 },
  in_category: { label: '归类', color: '#3a4245', width: 1.2, curveness: 0 },
  tagged: { label: '标签', color: '#26302f', width: 0.8, curveness: 0.12 },
  related: { label: '相关', color: '#4fb3a5', width: 1.3, curveness: 0.18 },
  alternative_to: { label: '替代', color: '#c2643f', width: 1.3, curveness: 0.22 },
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
  edge: '#2f3639', // resting edge colour
  focusRing: '#f0b429', // --accent
  // A warm white no other node uses, so a focused category node (solid accent)
  // stays legible. See the note in GraphView.
  focusFill: '#f5f0e6',
}
