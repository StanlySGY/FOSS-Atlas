/** Immutable URL updates for the graph's mutually exclusive view filters. */
export function setCategoryFocusParams(searchParams, category) {
  const params = new URLSearchParams(searchParams)
  params.delete('deployed')
  params.delete('local')
  params.delete('depth')
  if (category) params.set('cat', category)
  else params.delete('cat')
  return params
}

export function setDeployedOnlyParams(searchParams, enabled) {
  const params = new URLSearchParams(searchParams)
  if (enabled) {
    params.set('deployed', '1')
    params.delete('cat')
    params.delete('local')
    params.delete('depth')
  } else {
    params.delete('deployed')
  }
  return params
}

/** Start or clear an Obsidian-style local graph, keeping unrelated URL state intact. */
export function setLocalGraphParams(searchParams, nodeId, depth = 1) {
  const params = new URLSearchParams(searchParams)
  params.delete('cat')
  params.delete('deployed')
  params.delete('focus')
  params.delete('view')
  params.delete('node_q')
  params.delete('node_type')

  if (nodeId) {
    params.set('local', nodeId)
    params.set('depth', Number(depth) >= 2 ? '2' : '1')
  } else {
    params.delete('local')
    params.delete('depth')
  }
  return params
}

export function setLocalGraphDepthParams(searchParams, depth) {
  const params = new URLSearchParams(searchParams)
  if (params.has('local')) params.set('depth', Number(depth) >= 2 ? '2' : '1')
  return params
}
