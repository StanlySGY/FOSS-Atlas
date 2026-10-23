/*
 * JSON-LD for the prerendered pages.
 *
 * Structured data here is limited to what the catalogue actually states. That
 * rules out the two most commonly pasted blocks:
 *
 *   - `FAQPage` — not one of the 186 Wiki pages contains a question-and-answer
 *     section, so marking one up would be a claim about content that is not on
 *     the page. Google's rich-result eligibility is also revocation-prone: an
 *     FAQ markup with no visible FAQ is exactly the mismatch it penalises.
 *   - `Person` author / aggregate ratings — no author byline or rating exists
 *     to point at.
 *
 * What is left is the part the data does support: the entry as an Article with
 * the date the Wiki text was last regenerated, and a two-level breadcrumb that
 * matches the only two addresses the site really has for it.
 */
import { PRIMARY_ORIGIN, SITE_NAME, SITE_TAGLINE, wikiDescription } from './site.js'

/** One WebSite node, referenced by every Article so they are one property graph. */
export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${PRIMARY_ORIGIN}/#website`,
    url: `${PRIMARY_ORIGIN}/`,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    inLanguage: 'zh-CN',
    publisher: organizationNode(),
  }
}

function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${PRIMARY_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: PRIMARY_ORIGIN,
  }
}

/**
 * `Article` for a catalogue entry's Wiki page.
 *
 * `dateModified` comes from the Wiki frontmatter, which `build-wikis.mjs`
 * stamps from `CONTENT_REVISION` — so the date a crawler sees is the date the
 * prose was revised, not the date this file was built. A build-date stamp would
 * claim the content changed on every push.
 */
export function articleNode({ resource, instances, url, description, dateModified }) {
  const node = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    name: resource.name,
    headline: resource.name,
    description,
    inLanguage: 'zh-CN',
    isPartOf: websiteNode(),
    mainEntityOfPage: { '@id': url },
    about: (resource.tags ?? []).map((tag) => ({ '@type': 'Thing', name: tag })),
    keywords: [resource.category_name, resource.sub_category_name, ...(resource.tags ?? [])].join(', '),
  }
  if (dateModified) node.dateModified = dateModified
  if (resource.url) node.sameAs = resource.url
  // Only a deployed entry can claim a working instance, and only with its own URL.
  const live = (instances ?? [])
    .map((i) => i.url ?? i.domain ?? null)
    .filter((u) => typeof u === 'string' && u.startsWith('http'))
  if (live.length) node.subjectOf = live.map((u) => ({ '@type': 'WebPage', url: u }))
  return node
}

/**
 * Breadcrumb: the primary origin's home, then the entry.
 *
 * A third level would have to be a category page, and this site has no
 * category *URL* — 分类 is a filter inside `/`, not an address — so inventing
 * `/category/selfhost/` would put a dead link in structured data. The last
 * item carries no `item` either: it *is* the page being read, and Google's
 * BreadcrumbList spec says the last item may omit it.
 */
export function breadcrumbNode({ resource }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${PRIMARY_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: resource.name },
    ],
  }
}

/** `WebSite` + `WebPage` for a top-level route. */
export function sitePageNode({ path, title, description }) {
  const url = `${PRIMARY_ORIGIN}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'zh-CN',
    isPartOf: websiteNode(),
  }
}

export { wikiDescription }
