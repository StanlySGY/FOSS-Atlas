/** URL-backed catalogue filters shared by search links and the homepage. */
export function queryFromSearchParams(searchParams) {
  return searchParams.get('q') ?? ''
}

export function resetCatalogFiltersParams(searchParams) {
  const params = new URLSearchParams(searchParams)
  for (const key of ['q', 'cat', 'sub', 'deployed']) params.delete(key)
  return params
}
