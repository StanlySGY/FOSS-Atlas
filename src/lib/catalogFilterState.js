/** URL-backed catalogue filters shared by search links and the homepage. */
export function queryFromSearchParams(searchParams) {
  return searchParams.get('q') ?? ''
}

const CATALOG_SORTS = new Set(['recommended', 'name', 'deployed'])
const CATALOG_VIEWS = new Set(['grid', 'list'])

export function savedOnlyFromSearchParams(searchParams) {
  return searchParams.get('saved') === '1'
}

export function catalogSortFromSearchParams(searchParams) {
  const value = searchParams.get('sort')
  return CATALOG_SORTS.has(value) ? value : 'recommended'
}

export function catalogViewFromSearchParams(searchParams, fallback = 'grid') {
  const value = searchParams.get('view')
  if (CATALOG_VIEWS.has(value)) return value
  return CATALOG_VIEWS.has(fallback) ? fallback : 'grid'
}

export function setSavedOnlyParams(searchParams, enabled) {
  const params = new URLSearchParams(searchParams)
  if (enabled) {
    params.set('saved', '1')
    params.delete('deployed')
  } else {
    params.delete('saved')
  }
  return params
}

export function setCatalogSortParams(searchParams, sort) {
  const params = new URLSearchParams(searchParams)
  if (sort === 'recommended' || !CATALOG_SORTS.has(sort)) params.delete('sort')
  else params.set('sort', sort)
  return params
}

export function setCatalogViewParams(searchParams, view) {
  const params = new URLSearchParams(searchParams)
  params.set('view', CATALOG_VIEWS.has(view) ? view : 'grid')
  return params
}

export function setDeployedOnlyParams(searchParams, enabled) {
  const params = new URLSearchParams(searchParams)
  if (enabled) {
    params.set('deployed', '1')
    params.delete('saved')
  } else {
    params.delete('deployed')
  }
  return params
}

const DEPLOYMENT_STATUSES = new Set(['all', 'down', 'restricted', 'ok', 'redirect', 'unknown'])

export function deployedFiltersFromSearchParams(searchParams, groupIds = []) {
  const status = searchParams.get('status')
  const group = searchParams.get('group')
  return {
    query: searchParams.get('q') ?? '',
    statusFilter: DEPLOYMENT_STATUSES.has(status) ? status : 'all',
    groupFilter: groupIds.includes(group) ? group : 'all',
  }
}

export function setDeployedFilterParam(searchParams, key, value) {
  const params = new URLSearchParams(searchParams)
  if (key === 'q') {
    const query = String(value ?? '')
    if (query) params.set('q', query)
    else params.delete('q')
  } else if (key === 'status') {
    if (DEPLOYMENT_STATUSES.has(value) && value !== 'all') params.set('status', value)
    else params.delete('status')
  } else if (key === 'group') {
    if (value && value !== 'all') params.set('group', value)
    else params.delete('group')
  }
  return params
}

export function resetDeployedFiltersParams(searchParams) {
  const params = new URLSearchParams(searchParams)
  for (const key of ['q', 'status', 'group']) params.delete(key)
  return params
}

export function resetCatalogFiltersParams(searchParams) {
  const params = new URLSearchParams(searchParams)
  for (const key of ['q', 'cat', 'sub', 'deployed', 'saved', 'offer', 'link']) params.delete(key)
  return params
}
