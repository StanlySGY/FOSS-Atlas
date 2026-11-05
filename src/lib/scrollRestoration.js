/** Decide how a routed page should move the viewport after navigation. */
export function scrollRestorationAction({
  isInitial = false,
  navigationType = 'PUSH',
  previousPathname = '',
  pathname = '',
  previousHash = '',
  hash = '',
  savedY = 0,
}) {
  const routeChanged = previousPathname !== pathname
  const hashChanged = Boolean(hash) && (isInitial || routeChanged || previousHash !== hash)

  if (hashChanged) return { type: 'anchor' }
  if (isInitial) return { type: 'top' }
  if (navigationType === 'POP') {
    const parsed = Number(savedY)
    return { type: 'restore', top: Number.isFinite(parsed) ? Math.max(0, parsed) : 0 }
  }
  if (!routeChanged) return { type: 'preserve' }
  return { type: 'top' }
}

/** Match React Router's initial history entry as well as keyed PUSH/REPLACE entries. */
export function historyEntryMatchesLocation(historyState, locationKey) {
  return historyState?.key === locationKey || (locationKey === 'default' && historyState?.key == null)
}

/** Read a saved position only from the history entry currently being rendered. */
export function savedScrollYFromHistoryState(historyState, locationKey) {
  if (!historyEntryMatchesLocation(historyState, locationKey)) return undefined
  const value = historyState?.__faScrollY
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : undefined
}

/** Preserve React Router's own state while attaching this entry's scroll position. */
export function withSavedScrollY(historyState, locationKey, scrollY) {
  if (!historyEntryMatchesLocation(historyState, locationKey)) return historyState
  const value = Number(scrollY)
  return {
    ...historyState,
    __faScrollY: Number.isFinite(value) ? Math.max(0, value) : 0,
  }
}
