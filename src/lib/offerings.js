import catalogue from '../data/offerings.json' with { type: 'json' }

export const offeringCatalogue = catalogue
export const offerings = catalogue.entries
export const offeringByResource = new Map(offerings.map((entry) => [entry.resourceId, entry]))

export const OFFER_FILTERS = [
  { id: 'all', label: '全部资源' },
  { id: 'free-tier', label: '持续免费额度' },
  { id: 'trial', label: '限时试用' },
  { id: 'credit', label: '赠送 credits' },
  { id: 'api-demo', label: 'API 免费配额' },
  { id: 'paid-usage', label: '按量付费' },
]

export function getOffering(resourceId) {
  return offeringByResource.get(resourceId) ?? null
}

export function matchesOfferFilter(resourceId, filter = 'all') {
  if (!filter || filter === 'all') return true
  return getOffering(resourceId)?.types.includes(filter) ?? false
}

export function countOfferFilter(resources, filter) {
  return resources.filter((resource) => matchesOfferFilter(resource.id, filter)).length
}
