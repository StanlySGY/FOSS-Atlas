function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase().trim()
}

function editDistanceWithin(left, right, limit) {
  if (Math.abs(left.length - right.length) > limit) return limit + 1
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i++) {
    const current = [i]
    let rowMinimum = i
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      const value = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost)
      current[j] = value
      rowMinimum = Math.min(rowMinimum, value)
    }
    if (rowMinimum > limit) return limit + 1
    previous = current
  }
  return previous[right.length]
}

/**
 * Tolerate one or two Latin-character typos in names and aliases only.
 * Short words and CJK terms intentionally stay exact to avoid noisy matches.
 */
export function matchesFuzzySearchTerm(term, candidates = []) {
  const query = normalize(term)
  if (!/^[a-z0-9][a-z0-9._+-]*$/.test(query) || query.length < 4) return false
  const limit = query.length >= 9 ? 2 : 1
  return candidates.some((candidate) => {
    const tokens = normalize(candidate).split(/[^a-z0-9._+-]+/).filter(Boolean)
    return tokens.some((token) => token.length >= 4 && editDistanceWithin(query, token, limit) <= limit)
  })
}

export function matchesSearchTerm(term, fields = [], fuzzyCandidates = []) {
  const query = normalize(term)
  if (!query) return true
  if (fields.some((field) => normalize(field).includes(query))) return true
  return matchesFuzzySearchTerm(query, fuzzyCandidates)
}

/** True when at least one query token needed a fuzzy name/alias match. */
export function hasFuzzySearchMatch(query, fields = [], fuzzyCandidates = []) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  return terms.some((term) =>
    !fields.some((field) => normalize(field).includes(term)) &&
    matchesFuzzySearchTerm(term, fuzzyCandidates),
  )
}
