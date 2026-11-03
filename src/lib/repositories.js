import metadata from '../data/repository-metadata.json' with { type: 'json' }

export const repositoryMetadata = metadata
export const repositoryByResource = new Map(
  (metadata.entries ?? []).map((entry) => [entry.resourceId, entry]),
)

export function repositoryFor(resourceId) {
  return repositoryByResource.get(resourceId) ?? null
}

export function formatRepositoryCount(value) {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('zh-CN', { notation: value >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value)
}

export function repositoryFreshness(entry) {
  if (!entry?.checkedAt) return '暂无快照'
  return entry.checkedAt.slice(0, 10)
}
