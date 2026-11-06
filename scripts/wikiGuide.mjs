/** Optional authored steps; keep legacy usage rendering unchanged. */
export function renderWikiGuide(entry, resourceId) {
  if (entry.guide != null && !Array.isArray(entry.guide)) {
    throw new Error(`invalid guide for "${resourceId}": expected an array`)
  }
  if (!entry.guide?.length) {
    return entry.usage?.length
      ? '## 快速上手\n\n' + entry.usage.map((item) => `- ${item}`).join('\n')
      : ''
  }

  const hasEvidence = /^\d{4}-\d{2}-\d{2}$/.test(entry.verifiedAt ?? '')
    && Array.isArray(entry.sources) && entry.sources.length > 0
    && entry.sources.every((source) => source?.title?.trim() && source?.scope?.trim() && /^https:\/\//.test(source.url ?? ''))
  if (!hasEvidence) throw new Error(`guide requires dated official evidence for "${resourceId}"`)

  const sections = ['## 快速上手']
  for (const step of entry.guide) {
    if (typeof step?.title !== 'string' || !step.title.trim() || /[\r\n]/.test(step.title)
      || typeof step.body !== 'string' || !step.body.trim()) {
      throw new Error(`invalid guide step for "${resourceId}"`)
    }
    sections.push(`### ${step.title.trim()}`, step.body.trim())
  }
  return sections.join('\n\n')
}
