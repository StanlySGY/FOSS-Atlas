/** Keep the graph's default canvas legible while preserving hover/click discovery. */
export function shouldShowGraphLabel(node, { hidden = false, focused = false, selected = false } = {}) {
  if (hidden) return false
  if (focused || selected) return true
  return node?.type === 'category'
}
