import { TYPE_ORDER } from './graphStyle.js'

export const GRAPH_NODE_TYPE_FILTERS = ['all', ...TYPE_ORDER]

/** Read the searchable node-list state from the graph URL. */
export function graphNodeListStateFromParams(searchParams) {
  const requestedType = searchParams.get('node_type') ?? 'all'
  return {
    query: searchParams.get('node_q') ?? '',
    typeFilter: GRAPH_NODE_TYPE_FILTERS.includes(requestedType) ? requestedType : 'all',
  }
}

/** Patch only the node-list keys, preserving graph focus and other deep links. */
export function setGraphNodeListStateParams(searchParams, patch) {
  const params = new URLSearchParams(searchParams)
  if (Object.prototype.hasOwnProperty.call(patch, 'query')) {
    const query = String(patch.query ?? '')
    if (query) params.set('node_q', query)
    else params.delete('node_q')
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'typeFilter')) {
    const type = patch.typeFilter
    if (type === 'all' || !GRAPH_NODE_TYPE_FILTERS.includes(type)) params.delete('node_type')
    else params.set('node_type', type)
  }
  return params
}
