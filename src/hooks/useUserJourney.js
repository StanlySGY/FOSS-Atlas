import { useCallback, useEffect, useState } from 'react'
import { readFavorites, readRecentResources, subscribeUserJourney, toggleFavorite } from '../lib/userJourney.js'

/** Reactive local preferences shared across routes and browser tabs. */
export default function useUserJourney(validResourceIds = null) {
  const [favorites, setFavorites] = useState(() => readFavorites(validResourceIds))
  const [recentIds, setRecentIds] = useState(() => readRecentResources(validResourceIds))

  useEffect(() => subscribeUserJourney(() => {
    setFavorites(readFavorites(validResourceIds))
    setRecentIds(readRecentResources(validResourceIds))
  }), [validResourceIds])

  const updateFavorite = useCallback((id) => {
    const next = toggleFavorite(id, validResourceIds)
    setFavorites(next)
    return next.includes(id)
  }, [validResourceIds])

  return { favorites, recentIds, toggleFavorite: updateFavorite }
}
