#!/usr/bin/env node
/**
 * Refresh public GitHub repository facts for catalogue resources.
 * Uses the Actions-provided read-only token when present; keeps the last good
 * snapshot when a request fails. No write endpoints are called.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const RESOURCE_FILE = resolve(ROOT, 'src/data/resources.json')
const SNAPSHOT_FILE = resolve(ROOT, 'src/data/repository-metadata.json')
const USER_AGENT = 'FOSS-Atlas repository metadata refresh'
const API_VERSION = '2022-11-28'
const CONCURRENCY = 6

export function repositoryFromUrl(raw) {
  try {
    const url = new URL(raw)
    if (url.hostname.toLowerCase() !== 'github.com') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length !== 2) return null
    const owner = parts[0]
    const repo = parts[1].replace(/\.git$/i, '')
    if (!owner || !repo || repo === '.') return null
    return owner + '/' + repo
  } catch {
    return null
  }
}

function repositorySources(resources) {
  const byRepository = new Map()
  const byWiki = new Map(resources.map((resource) => [resource.wiki ?? resource.id, resource]))
  for (const resource of resources) {
    const repository = repositoryFromUrl(resource.url)
    if (repository) byRepository.set(repository.toLowerCase(), { resourceId: resource.id, repository })
  }

  const wikiDir = resolve(ROOT, 'public/wiki')
  for (const slug of byWiki.keys()) {
    try {
      const raw = readFileSync(resolve(wikiDir, slug + '.md'), 'utf8')
      const match = /^repo:\s*['"]?(https:\/\/github\.com\/[^\s'"#]+)['"]?\s*$/m.exec(raw)
      const repository = match ? repositoryFromUrl(match[1]) : null
      const resource = byWiki.get(slug)
      if (repository && resource) {
        byRepository.set(repository.toLowerCase(), { resourceId: resource.id, repository })
      }
    } catch {
      // A Wiki file is optional. The direct resource URL remains the fallback.
    }
  }
  return [...byRepository.values()].sort((a, b) => a.resourceId.localeCompare(b.resourceId))
}

function safeDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null
}

export function normalizeRepository(resourceId, repository, payload, fetchedAt) {
  return {
    resourceId,
    repository: payload.full_name ?? repository,
    url: payload.html_url ?? 'https://github.com/' + repository,
    description: typeof payload.description === 'string' ? payload.description : null,
    stars: Number.isInteger(payload.stargazers_count) ? payload.stargazers_count : null,
    forks: Number.isInteger(payload.forks_count) ? payload.forks_count : null,
    license: payload.license?.spdx_id && payload.license.spdx_id !== 'NOASSERTION'
      ? payload.license.spdx_id
      : null,
    archived: Boolean(payload.archived),
    disabled: Boolean(payload.disabled),
    pushedAt: safeDate(payload.pushed_at),
    createdAt: safeDate(payload.created_at),
    defaultBranch: typeof payload.default_branch === 'string' ? payload.default_branch : null,
    checkedAt: fetchedAt,
    attemptedAt: fetchedAt,
    refreshStatus: 'available',
    refreshErrorCode: null,
  }
}

async function fetchOne(source, token, fetchedAt, fetchImpl = fetch) {
  const response = await fetchImpl('https://api.github.com/repos/' + source.repository, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    throw new Error('HTTP ' + response.status + (remaining === '0' ? ' (rate limit exhausted)' : ''))
  }
  const payload = await response.json()
  return normalizeRepository(source.resourceId, source.repository, payload, fetchedAt)
}

export async function syncRepositoryMetadata({ token, resources, previous, now = new Date(), fetchImpl = fetch }) {
  const sources = repositorySources(resources)
  const priorEntries = new Map((previous?.entries ?? []).map((entry) => [entry.resourceId, entry]))
  if (!token) {
    return {
      snapshot: previous ?? { schemaVersion: 1, fetchedAt: null, entries: [] },
      skipped: true,
      fetched: 0,
      reused: (previous?.entries ?? []).length,
      failed: 0,
      total: sources.length,
    }
  }

  const fetchedAt = now.toISOString()
  const results = []
  const errors = []
  let cursor = 0
  async function worker() {
    while (cursor < sources.length) {
      const source = sources[cursor++]
      try {
        results.push(await fetchOne(source, token, fetchedAt, fetchImpl))
      } catch (error) {
        errors.push({ resourceId: source.resourceId, message: error.message })
        const prior = priorEntries.get(source.resourceId)
        const statusCode = Number(/HTTP (\d{3})/.exec(error.message)?.[1] ?? 0) || null
        const refreshStatus = statusCode === 404 ? 'not-found' : prior ? 'stale' : 'unavailable'
        if (prior) {
          results.push({ ...prior, attemptedAt: fetchedAt, refreshStatus, refreshErrorCode: statusCode })
        } else {
          results.push({
            resourceId: source.resourceId,
            repository: source.repository,
            url: 'https://github.com/' + source.repository,
            description: null, stars: null, forks: null, license: null,
            archived: null, disabled: null, pushedAt: null, createdAt: null,
            defaultBranch: null, checkedAt: null, attemptedAt: fetchedAt,
            refreshStatus, refreshErrorCode: statusCode,
          })
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, sources.length) }, worker))
  results.sort((a, b) => a.resourceId.localeCompare(b.resourceId))
  const snapshot = {
    schemaVersion: 1,
    fetchedAt,
    entries: results,
  }
  return {
    snapshot,
    skipped: false,
    fetched: sources.length - errors.length,
    reused: errors.filter((error) => priorEntries.has(error.resourceId)).length,
    failed: errors.length,
    total: sources.length,
    errors,
  }
}

async function main() {
  const resources = JSON.parse(readFileSync(RESOURCE_FILE, 'utf8'))
  let previous = { schemaVersion: 1, fetchedAt: null, entries: [] }
  try {
    previous = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'))
  } catch {
    // First run starts with an empty snapshot.
  }

  const result = await syncRepositoryMetadata({
    token: process.env.GITHUB_TOKEN,
    resources,
    previous,
  })
  if (!result.skipped) {
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(result.snapshot, null, 2) + '\n')
    console.log('GitHub metadata: refreshed ' + result.fetched + '/' + result.total +
      ', reused stale snapshots ' + result.reused + ', unavailable ' + result.failed + '.')
    for (const error of result.errors ?? []) {
      console.warn('  ' + error.resourceId + ': ' + error.message)
    }
  } else {
    console.log('GitHub metadata: skipped (GITHUB_TOKEN is not set); retaining the committed snapshot.')
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main()
}
