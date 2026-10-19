const BASE = import.meta.env.BASE_URL

/** Minimal YAML frontmatter parser (flat scalars + inline arrays). */
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, content: raw }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const sep = line.indexOf(':')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    let value = line.slice(sep + 1).trim()
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      value = value.replace(/^["']|["']$/g, '')
    }
    data[key] = value
  }
  return { data, content: raw.slice(match[0].length) }
}

/** Fetch a wiki markdown file from /public/wiki. Returns null when absent. */
export async function fetchWiki(slug) {
  if (!slug) return null
  const res = await fetch(`${BASE}wiki/${slug}.md`, { cache: 'no-cache' })
  if (!res.ok) return null
  return res.text()
}

/**
 * Rewrite [[Wikilink]] syntax into standard markdown links.
 * `resolve(name)` returns a resource id, or null when unknown.
 * Code fences and inline code are left untouched.
 */
export function transformWikilinks(markdown, resolve) {
  const parts = markdown.split(/(```[\s\S]*?```|`[^`\n]*`)/g)
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part
      return part.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target, label) => {
        const text = (label || target).trim()
        const id = resolve(target)
        if (id) return `[${text}](/wiki/${id})`
        return `[${text}](/?q=${encodeURIComponent(text.trim())})`
      })
    })
    .join('')
}

/** Extract the [[...]] targets referenced by a markdown body. */
export function extractWikilinks(markdown) {
  const out = new Set()
  for (const m of markdown.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    out.add(m[1].trim())
  }
  return [...out]
}
