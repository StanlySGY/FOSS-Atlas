import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import {
  COMPARISON_STORAGE_KEY,
  comparisonIdsFromSearchParams,
  readComparisonIds,
  removeComparisonId,
  setComparisonParams,
  toggleComparisonId,
  writeComparisonIds,
} from '../lib/resourceComparison.js'

const CHANGE_EVENT = 'foss-atlas:resource-comparison-change'
const serverSnapshot = () => ''

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (event) => {
    if (event.key === null || event.key === COMPARISON_STORAGE_KEY) callback()
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

function notifyChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new window.Event(CHANGE_EVENT))
}

export default function useResourceComparison(searchParams, setSearchParams, validIds) {
  // Primitive snapshots stay referentially stable across storage reads.
  const getSnapshot = useCallback(() => readComparisonIds(validIds).join(','), [validIds])
  const localKey = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot)
  const ids = useMemo(
    () => comparisonIdsFromSearchParams(searchParams, localKey ? localKey.split(',') : [], validIds),
    [searchParams, localKey, validIds],
  )
  const selectionKey = ids.join(',')
  const hasUrlSelection = searchParams.has('compare')

  // An absent URL selection is read-only, including the empty server snapshot
  // during hydration. Only an explicit incoming selection replaces local state.
  useEffect(() => {
    if (!hasUrlSelection) return
    writeComparisonIds(selectionKey ? selectionKey.split(',') : [], validIds)
    notifyChange()
  }, [hasUrlSelection, selectionKey, validIds])

  const commit = useCallback((next) => {
    // User actions also save immediately, before a possible route unmount.
    const selection = writeComparisonIds(next, validIds)
    setSearchParams((previous) => setComparisonParams(previous, selection, validIds), { replace: true })
    notifyChange()
    return selection
  }, [setSearchParams, validIds])

  const toggle = useCallback((id) => {
    const next = toggleComparisonId(ids, id, validIds)
    return next.join(',') === selectionKey ? ids : commit(next)
  }, [ids, selectionKey, validIds, commit])

  const remove = useCallback((id) => {
    const next = removeComparisonId(ids, id, validIds)
    return next.join(',') === selectionKey ? ids : commit(next)
  }, [ids, selectionKey, validIds, commit])

  const clear = useCallback(() => commit([]), [commit])

  return { ids, toggle, remove, clear }
}
