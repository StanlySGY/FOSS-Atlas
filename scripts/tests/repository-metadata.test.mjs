import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeRepository,
  repositoryFromUrl,
  syncRepositoryMetadata,
} from '../sync-repository-metadata.mjs'

test('GitHub repository URL parser rejects non-repository paths and non-GitHub hosts', () => {
  assert.equal(repositoryFromUrl('https://github.com/ollama/ollama'), 'ollama/ollama')
  assert.equal(repositoryFromUrl('https://github.com/ollama/ollama.git'), 'ollama/ollama')
  assert.equal(repositoryFromUrl('https://github.com/ollama/ollama/issues/1'), null)
  assert.equal(repositoryFromUrl('https://gitlab.com/ollama/ollama'), null)
  assert.equal(repositoryFromUrl('not a URL'), null)
})

test('GitHub repository facts are normalized without inventing a license', () => {
  const result = normalizeRepository('ollama', 'ollama/ollama', {
    full_name: 'ollama/ollama',
    html_url: 'https://github.com/ollama/ollama',
    stargazers_count: 100,
    forks_count: 10,
    license: { spdx_id: 'MIT' },
    archived: false,
    disabled: false,
    pushed_at: '2026-11-01T12:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    default_branch: 'main',
  }, '2026-11-03T00:00:00.000Z')
  assert.equal(result.stars, 100)
  assert.equal(result.forks, 10)
  assert.equal(result.license, 'MIT')
  assert.equal(result.archived, false)
  assert.equal(result.pushedAt, '2026-11-01T12:00:00Z')
  assert.equal(result.checkedAt, '2026-11-03T00:00:00.000Z')

  const unknownLicense = normalizeRepository('x', 'owner/x', { license: { spdx_id: 'NOASSERTION' } }, '2026-11-03T00:00:00.000Z')
  assert.equal(unknownLicense.license, null)
})

test('repository metadata sync uses read-only public fields and stores a fresh snapshot', async () => {
  let requestedUrl = ''
  let authorization = ''
  const result = await syncRepositoryMetadata({
    token: 'test-read-only-token',
    resources: [{ id: 'demo', url: 'https://github.com/example/demo' }],
    previous: { schemaVersion: 1, fetchedAt: null, entries: [] },
    now: new Date('2026-11-03T00:00:00Z'),
    fetchImpl: async (url, options) => {
      requestedUrl = url
      authorization = options.headers.Authorization
      return new Response(JSON.stringify({
        full_name: 'example/demo',
        html_url: 'https://github.com/example/demo',
        stargazers_count: 12,
        forks_count: 3,
        archived: false,
        pushed_at: '2026-11-02T00:00:00Z',
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    },
  })
  assert.equal(requestedUrl, 'https://api.github.com/repos/example/demo')
  assert.equal(authorization, 'Bearer test-read-only-token')
  assert.equal(result.fetched, 1)
  assert.equal(result.snapshot.entries[0].stars, 12)
  assert.equal(result.snapshot.entries[0].resourceId, 'demo')
  assert.equal(result.snapshot.entries[0].refreshStatus, 'available')
})

test('rate-limit and inaccessible repository failures preserve the last good entry', async () => {
  const previousEntry = {
    resourceId: 'demo',
    repository: 'example/demo',
    url: 'https://github.com/example/demo',
    stars: 8,
    forks: 2,
    license: null,
    archived: false,
    disabled: false,
    pushedAt: '2026-10-01T00:00:00Z',
    createdAt: null,
    defaultBranch: 'main',
    checkedAt: '2026-10-02T00:00:00Z',
  }
  const result = await syncRepositoryMetadata({
    token: 'test-token',
    resources: [{ id: 'demo', url: 'https://github.com/example/demo' }],
    previous: { schemaVersion: 1, fetchedAt: '2026-10-02T00:00:00Z', entries: [previousEntry] },
    fetchImpl: async () => new Response('{}', {
      status: 403,
      headers: { 'x-ratelimit-remaining': '0' },
    }),
  })
  assert.equal(result.fetched, 0)
  assert.equal(result.reused, 1)
  assert.equal(result.failed, 1)
  assert.equal(result.snapshot.entries[0].stars, 8)
  assert.equal(result.snapshot.entries[0].checkedAt, '2026-10-02T00:00:00Z')
  assert.equal(result.snapshot.entries[0].refreshStatus, 'stale')
  assert.equal(result.snapshot.entries[0].refreshErrorCode, 403)
})

test('missing GitHub token skips network calls and preserves the committed snapshot', async () => {
  const previous = { schemaVersion: 1, fetchedAt: '2026-10-01T00:00:00Z', entries: [{ resourceId: 'demo' }] }
  const result = await syncRepositoryMetadata({
    token: '',
    resources: [{ id: 'demo', url: 'https://github.com/example/demo' }],
    previous,
    fetchImpl: async () => { throw new Error('must not call network') },
  })
  assert.equal(result.skipped, true)
  assert.equal(result.snapshot, previous)
})


test('HTTP 404 creates an explicit unavailable entry instead of silently dropping the repository', async () => {
  const result = await syncRepositoryMetadata({
    token: 'test-token',
    resources: [{ id: 'former-repo', url: 'https://github.com/example/former-repo' }],
    previous: { schemaVersion: 1, fetchedAt: null, entries: [] },
    now: new Date('2026-11-03T09:00:00Z'),
    fetchImpl: async () => new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 }),
  })
  const entry = result.snapshot.entries[0]
  assert.equal(result.fetched, 0)
  assert.equal(result.failed, 1)
  assert.equal(entry.resourceId, 'former-repo')
  assert.equal(entry.refreshStatus, 'not-found')
  assert.equal(entry.refreshErrorCode, 404)
  assert.equal(entry.stars, null)
  assert.equal(entry.attemptedAt, '2026-11-03T09:00:00.000Z')
})

test('HTTP 404 preserves historical facts while marking the upstream as not found', async () => {
  const previousEntry = {
    resourceId: 'demo', repository: 'example/demo', url: 'https://github.com/example/demo',
    stars: 8, forks: 2, license: 'MIT', archived: false, disabled: false,
    pushedAt: '2026-10-01T00:00:00Z', createdAt: null, defaultBranch: 'main',
    checkedAt: '2026-10-02T00:00:00Z', refreshStatus: 'available',
  }
  const result = await syncRepositoryMetadata({
    token: 'test-token',
    resources: [{ id: 'demo', url: 'https://github.com/example/demo' }],
    previous: { schemaVersion: 1, fetchedAt: '2026-10-02T00:00:00Z', entries: [previousEntry] },
    now: new Date('2026-11-03T09:00:00Z'),
    fetchImpl: async () => new Response('{}', { status: 404 }),
  })
  const entry = result.snapshot.entries[0]
  assert.equal(entry.stars, 8)
  assert.equal(entry.license, 'MIT')
  assert.equal(entry.checkedAt, '2026-10-02T00:00:00Z')
  assert.equal(entry.attemptedAt, '2026-11-03T09:00:00.000Z')
  assert.equal(entry.refreshStatus, 'not-found')
  assert.equal(entry.refreshErrorCode, 404)
})
