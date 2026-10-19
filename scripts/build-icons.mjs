#!/usr/bin/env node
/**
 * FOSS-Atlas icon pipeline
 * ------------------------------------------------------------------
 * Downloads a site icon for every resource host and stores it under
 * public/icons/<host>.<ext>, then writes src/data/icons.json mapping
 * host -> public path (or null when nothing usable was found).
 *
 * Why build-time instead of a runtime favicon service:
 *   The card icons used to come from `https://www.google.com/s2/favicons`.
 *   For a Chinese-audience site that is the wrong trade: google.com (and the
 *   usual DuckDuckGo fallback) are unreachable from mainland China, so every
 *   one of the 165 cards would silently degrade to its letter tile. Fetching
 *   once at build time and shipping the bytes removes the third-party runtime
 *   dependency entirely — icons work offline and behind any firewall.
 *
 * Idempotent: an icon already on disk is not re-downloaded, so re-running is
 * cheap and a failed host can be retried (delete its file, run again).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const RESOURCES = resolve(ROOT, 'src/data/resources.json')
const PUBLIC_ICONS = resolve(ROOT, 'public/icons')
const OUT_JSON = resolve(ROOT, 'src/data/icons.json')

const resources = JSON.parse(readFileSync(RESOURCES, 'utf8'))

const hosts = [...new Set(resources.map((r) => hostOf(r.url)))]

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

mkdirSync(PUBLIC_ICONS, { recursive: true })

/**
 * Download one URL to a Buffer.
 *
 * Uses `curl` rather than the global `fetch`: this machine (and any corporate /
 * GFW-adjacent box) reaches the internet through an `https_proxy`, which curl
 * honours but Node's undici `fetch` silently ignores — through `fetch` every
 * request here times out with ETIMEDOUT while curl succeeds.
 */
function download(url) {
  try {
    const out = execFileSync('curl', ['-sL', '--max-time', '15', url], {
      maxBuffer: 8 * 1024 * 1024,
    })
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

/** Try a list of candidate URLs for one host; return the saved filename. */
async function fetchIcon(host) {
  const candidates = [
    // Google's 128px endpoint returns a clean square PNG for most hosts.
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`,
    `https://${host}/favicon.ico`,
  ]
  for (const url of candidates) {
    const buf = download(url)
    // Skip empty responses and the tiny placeholder "globe" that the favicon
    // services return for an unknown host.
    if (!buf || buf.length < 200) continue
    const ext = sniffExt(buf)
    const file = `${host}.${ext}`
    writeFileSync(resolve(PUBLIC_ICONS, file), buf)
    return file
  }
  return null
}

/** Identify the image type from magic bytes (services rarely set a good one). */
function sniffExt(buf) {
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'png'
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01) return 'ico'
  const head = buf.slice(0, 300).toString('latin1')
  if (head.includes('<svg') || head.includes('<?xml')) return 'svg'
  if (buf[0] === 0x47 && buf[1] === 0x49) return 'gif'
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg'
  return 'ico'
}

const manifest = {}
if (existsSync(OUT_JSON)) {
  // Keep previously recorded hits so a re-run is incremental.
  Object.assign(manifest, JSON.parse(readFileSync(OUT_JSON, 'utf8')))
}

let downloaded = 0
let skipped = 0
let missing = 0

for (const host of hosts) {
  if (!host) continue
  const existing = manifest[host]
  if (existing && existsSync(resolve(ROOT, 'public', existing.replace(/^\//, '')))) {
    skipped++
    continue
  }
  const file = await fetchIcon(host)
  if (file) {
    manifest[host] = `/icons/${file}`
    downloaded++
    process.stdout.write(`  ✓ ${host} -> ${file}\n`)
  } else {
    manifest[host] = null
    missing++
    process.stdout.write(`  ✗ ${host} (no icon)\n`)
  }
}

writeFileSync(OUT_JSON, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(
  `icons: ${hosts.length} hosts — ${downloaded} downloaded, ${skipped} cached, ${missing} missing`,
)
