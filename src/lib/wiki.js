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
 * Drop the document's leading ATX H1, if the body opens with one.
 *
 * Wiki sources repeat the title as an H1, but the page chrome already renders
 * it alongside the frontmatter and action buttons — leaving both would show the
 * title twice.
 *
 * The match is deliberately narrow so it can only ever remove a real heading:
 * line endings are normalised first, any number of *blank* lines may precede
 * it, and the indent is capped at 3 spaces because CommonMark treats 4 spaces
 * as an indented code block. A leading code fence can never match, and a mid
 * document H1 is untouched. Setext (`Title` + `=====`) headings are not
 * recognised — see the contribution guide.
 */
export function stripLeadingH1(markdown) {
  return markdown
    .replace(/\r\n?/g, '\n')
    .replace(/^(?:[ \t]*\n)*[ \t]{0,3}#[ \t]+[^\n]*(?:\n+|$)/, '')
}

/**
 * Drop the page chrome that duplicates what the surrounding UI already shows.
 *
 * A wiki body conventionally opens with `# Title` followed by a `> one-line
 * summary`. The page shell renders both the title and the catalogue
 * description, so leaving them in the body prints them twice. This removes the
 * leading H1 and the blockquote that immediately follows it, then stops —
 * everything from the first `##` section onwards is untouched.
 *
 * Both removals are narrow and anchored to the start of the document:
 *
 * - the H1 uses the same strict ATX match as `stripLeadingH1` (blank lines may
 *   precede it, indent capped at 3 spaces, so a code fence or an indented block
 *   never matches);
 * - the blockquote is only taken when it is the *first* block after the H1 —
 *   a quote that appears later, after any prose or heading, is preserved.
 *
 * Blank lines left behind are collapsed, so the renderer starts cleanly on the
 * first real section.
 */
export function stripLeadingChrome(markdown) {
  let out = markdown.replace(/\r\n?/g, '\n')

  const beforeH1 = out
  out = out.replace(/^(?:[ \t]*\n)*[ \t]{0,3}#[ \t]+[^\n]*(?:\n+|$)/, '')

  // Only peel a quote when it sits directly under the H1 we just removed.
  if (out !== beforeH1) {
    out = out.replace(/^(?:[ \t]*\n)*(?:[ \t]{0,3}>[^\n]*(?:\n+|$))+/, '')
  }

  return out.replace(/^(?:[ \t]*\n)+/, '')
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
        if (id) return `[${text}](/wiki/${id}/)`
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

/**
 * Anchors for an article's own sections.
 *
 * `headingsFromMarkdown` is the table of contents; components/Markdown.jsx calls
 * `headingSlug` for every heading it renders. Both walks go over the same body in
 * document order, so the ids the list points at are the ids that exist.
 *
 * The one case they can disagree: a `##` indented inside a list item is a heading
 * to remark but is skipped by the source walk, so a *repeated* heading text later
 * in that article can get the other one's anchor.
 */
function slugBase(text) {
  const t = String(text ?? '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // a link in a heading: keep its label
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return t || 'section'
}

/** Anchor id, made unique by occurrence: `seen` carries the count across a walk. */
export function headingSlug(text, seen = new Map()) {
  const base = slugBase(text)
  const n = (seen.get(base) ?? 0) + 1
  seen.set(base, n)
  return n === 1 ? base : `${base}-${n}`
}

/** `{ level, text, slug }` per `##`/`###` outside a fenced code block. */
export function headingsFromMarkdown(markdown) {
  const out = []
  const seen = new Map()
  let fenced = false
  for (const line of String(markdown ?? '').split('\n')) {
    if (/^ {0,3}(```|~~~)/.test(line)) {
      fenced = !fenced
      continue
    }
    if (fenced) continue
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    const text = m[2].trim()
    out.push({ level: m[1].length, text, slug: headingSlug(text, seen) })
  }
  return out
}
