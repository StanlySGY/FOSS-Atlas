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

function valuesOf(value) {
  return (Array.isArray(value) ? value : [value])
    .map(normalize)
    .filter(Boolean)
}

/**
 * Tolerate a small number of Latin-character typos in names and aliases only.
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

/**
 * Shared relevance scoring for the catalogue and the global command palette.
 * A query token may match any authored field, but matches in names, aliases,
 * tags and curated keywords outrank incidental mentions in long-form prose.
 * Multi-token queries receive a coherence bonus when their terms occur together
 * in one field, preventing unrelated cross-field matches from dominating.
 */
export function scoreResourceSearch(query, record = {}) {
  const q = normalize(query)
  if (!q) return 0

  const name = normalize(record.name)
  const aliases = valuesOf(record.aliases)
  const tags = valuesOf(record.tags)
  const keywords = valuesOf(record.keywords)
  const description = valuesOf(record.description)
  const summary = valuesOf(record.summary)
  const features = valuesOf(record.features)
  const scenarios = valuesOf(record.scenarios)
  const usage = valuesOf(record.usage)
  const category = valuesOf(record.category)
  const subCategory = valuesOf(record.subCategory)
  const hostname = valuesOf([record.hostname, record.url])
  const extra = valuesOf(record.extra)

  if (name && name === q) return 150
  if (aliases.some((value) => value === q)) return 144
  if (name && name.startsWith(q)) return 136
  if (aliases.some((value) => value.startsWith(q))) return 130
  if (name && name.includes(q)) return 122
  if (aliases.some((value) => value.includes(q))) return 116

  const fields = [
    { values: name ? [name] : [], weight: 52 },
    { values: aliases, weight: 50 },
    { values: tags, weight: 44 },
    { values: keywords, weight: 42 },
    { values: description, weight: 34 },
    { values: summary, weight: 32 },
    { values: features, weight: 29 },
    { values: scenarios, weight: 27 },
    { values: usage, weight: 24 },
    { values: extra, weight: 22 },
    { values: category, weight: 17 },
    { values: subCategory, weight: 15 },
    { values: hostname, weight: 10 },
  ]

  const terms = q.split(/\s+/).filter(Boolean)
  const termScores = terms.map((term) => {
    let best = 0
    for (const field of fields) {
      if (field.values.some((value) => value.includes(term))) best = Math.max(best, field.weight)
    }
    if (!best && matchesFuzzySearchTerm(term, [name, ...aliases])) best = 14
    return best
  })

  if (termScores.some((score) => score === 0)) return 0
  if (terms.length === 1) {
    const score = termScores[0]
    // A long Chinese compound should not match a weak incidental prose mention.
    if (/^[\u3400-\u9FFF]+$/u.test(q) && q.length >= 4 && score < 32) return 0
    return score
  }

  const score = termScores.reduce((total, value) => total + value, 0)
  const coherentCoverage = Math.max(
    0,
    ...fields.map((field) => terms.filter((term) => field.values.some((value) => value.includes(term))).length / terms.length),
  )
  const phraseMatch = fields.some((field) => field.values.some((value) => value.includes(q)))

  const relevance = score + Math.round(coherentCoverage * 18) + (phraseMatch ? 22 : 0)
  return relevance >= 80 ? relevance : 0
}
