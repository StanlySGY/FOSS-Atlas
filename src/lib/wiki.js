const BASE = import.meta.env.BASE_URL

/**
 * Minimal YAML frontmatter parser.
 * Supports flat scalars, inline arrays (`key: [a, b]`) and block lists
 * (`key:` followed by `- item` lines).
 */
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, content: raw, hasFrontmatter: false }

  const data = {}
  const lines = match[1].split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const sep = line.indexOf(':')
    if (sep === -1) continue

    const key = line.slice(0, sep).trim()
    let value = line.slice(sep + 1).trim()

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
      continue
    }

    if (value === '') {
      // Possible block list: collect following "- item" lines.
      const items = []
      let j = i + 1
      while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
        items.push(lines[j].replace(/^\s*-\s+/, '').trim().replace(/^["']|["']$/g, ''))
        j++
      }
      if (items.length) {
        data[key] = items
        i = j - 1
        continue
      }
      data[key] = ''
      continue
    }

    data[key] = value.replace(/^["']|["']$/g, '')
  }

  return { data, content: raw.slice(match[0].length), hasFrontmatter: true }
}

/** Fetch a wiki markdown file from /public/wiki. Resolves to null when absent. */
export async function fetchWiki(slug) {
  if (!slug) return null
  try {
    const res = await fetch(`${BASE}wiki/${slug}.md`, { cache: 'no-cache' })
    if (!res.ok) return null
    const text = await res.text()
    return text.trim() ? text : null
  } catch {
    // Network failure: treat as "no wiki" rather than hanging the view.
    return null
  }
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
