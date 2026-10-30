export const FEATURED_BUILD_IDS = Object.freeze(['edgessh', 'short', 'paste', 'atlas-tools'])

/** Resolve the curated showcase against the catalogue without inventing records. */
export function featuredBuildsFrom(resources) {
  const byId = new Map(resources.map((resource) => [resource.id, resource]))
  return FEATURED_BUILD_IDS.map((id) => byId.get(id)).filter((resource) => resource?.own && resource.deployed)
}
