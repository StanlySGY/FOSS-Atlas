import { useEffect, useState } from 'react'

const EMPTY = null

/**
 * The link-probe snapshot shipped with this build. Returns
 * `{ status, snapshot }` — the old single `null` could not tell "loading" from
 * "this build ships no snapshot", so the maintenance summary flashed
 * 「暂无巡检快照」 for a beat and then swapped to the real numbers.
 */
export default function useResourceLinkSnapshot() {
  const [state, setState] = useState({ status: 'loading', snapshot: EMPTY })
  useEffect(() => {
    let alive = true
    fetch(import.meta.env.BASE_URL + 'resource-links.json', { cache: 'no-cache' })
      .then((response) => response.ok
        ? response.json()
        : Promise.reject(Object.assign(new Error('snapshot missing'), { missing: response.status === 404 })))
      .then((value) => { if (alive) setState({ status: 'ready', snapshot: value && Array.isArray(value.rows) ? value : null }) })
      .catch((err) => { if (alive) setState({ status: err?.missing ? 'missing' : 'error', snapshot: null }) })
    return () => { alive = false }
  }, [])
  return state
}
