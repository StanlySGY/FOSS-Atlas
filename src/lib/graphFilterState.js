/** Immutable URL updates for the graph's mutually exclusive view filters. */
export function setCategoryFocusParams(searchParams, category) {
  const params = new URLSearchParams(searchParams)
  params.delete('deployed')
  if (category) params.set('cat', category)
  else params.delete('cat')
  return params
}

export function setDeployedOnlyParams(searchParams, enabled) {
  const params = new URLSearchParams(searchParams)
  if (enabled) {
    params.set('deployed', '1')
    params.delete('cat')
  } else {
    params.delete('deployed')
  }
  return params
}
