import { useEffect, useState } from 'react'

const EMPTY = null

export default function useResourceLinkSnapshot() {
  const [snapshot, setSnapshot] = useState(EMPTY)
  useEffect(() => {
    let alive = true
    fetch(import.meta.env.BASE_URL + 'resource-links.json', { cache: 'no-cache' })
      .then((response) => response.ok ? response.json() : null)
      .then((value) => { if (alive) setSnapshot(value && Array.isArray(value.rows) ? value : null) })
      .catch(() => { if (alive) setSnapshot(null) })
    return () => { alive = false }
  }, [])
  return snapshot
}
