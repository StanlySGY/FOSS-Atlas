/** URL state for the graph's alternate canvas/list presentation. */
export function graphViewModeFromParams(searchParams) {
  return searchParams.get('view') === 'list' ? 'list' : 'graph'
}

export function setGraphViewModeParams(searchParams, mode) {
  const params = new URLSearchParams(searchParams)
  if (mode === 'list') params.set('view', 'list')
  else params.delete('view')
  return params
}
