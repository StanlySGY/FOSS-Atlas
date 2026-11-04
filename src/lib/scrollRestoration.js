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
