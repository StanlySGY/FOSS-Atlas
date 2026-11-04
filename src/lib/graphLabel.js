/** Keep the global graph legible while making denser labels available on demand. */
export const GRAPH_LABEL_MODES = [
  { value: 'category', label: '仅分类' },
  { value: 'key', label: '关键节点' },
  { value: 'all', label: '全部节点' },
]

const VALID_LABEL_MODES = new Set(GRAPH_LABEL_MODES.map((mode) => mode.value))
const STRUCTURAL_LABEL_TYPES = new Set(['category', 'subcategory', 'own', 'external'])

export function graphLabelModeFromParams(params) {
  const mode = params?.get('labels')
  return VALID_LABEL_MODES.has(mode) ? mode : 'category'
}

export function setGraphLabelModeParams(searchParams, mode) {
  const params = new URLSearchParams(searchParams)
  if (VALID_LABEL_MODES.has(mode) && mode !== 'category') params.set('labels', mode)
  else params.delete('labels')
  return params
}

export function shouldShowGraphLabel(
  node,
  { hidden = false, focused = false, selected = false, mode = 'category' } = {},
) {
  if (hidden) return false
  if (focused || selected) return true
  if (mode === 'all') return Boolean(node)
  if (mode === 'key') return STRUCTURAL_LABEL_TYPES.has(node?.type)
  return node?.type === 'category'
}
