import test from 'node:test'
import assert from 'node:assert/strict'
import {
  appendResourceLinkReview,
  createResourceLinkReview,
  readResourceLinkReviews,
  resourceLinkReviewState,
  summarizeResourceLinkReviews,
  RESOURCE_LINK_REVIEW_STORAGE_KEY,
} from '../../src/lib/resourceLinkReviews.js'

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed))
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
  }
}

const snapshotAt = (date, rows) => ({ ranAt: date, rows })
const row = (overrides = {}) => ({
  resourceId: 'example', targetKind: 'homepage', url: 'https://example.com',
  status: 'not_found', code: 404, finalUrl: 'https://example.com', checkedAt: '2026-11-05T10:00:00.000Z',
  ...overrides,
})
const firstSnapshot = snapshotAt('2026-11-05T10:00:00.000Z', [row()])

test('review records are stored as a bounded versioned local ledger and malformed data is ignored', () => {
  const storage = memoryStorage()
  const record = createResourceLinkReview({ row: row(), decision: 'accepted', snapshot: firstSnapshot }, '2026-11-05T10:05:00.000Z')
  const next = appendResourceLinkReview(record, [], storage)
  assert.equal(next.length, 1)
  assert.deepEqual(readResourceLinkReviews(storage), next)
  assert.equal(JSON.parse(storage.getItem(RESOURCE_LINK_REVIEW_STORAGE_KEY)).schemaVersion, 1)
  storage.setItem(RESOURCE_LINK_REVIEW_STORAGE_KEY, '{broken json')
  assert.deepEqual(readResourceLinkReviews(storage), [])
})

test('an accepted false positive suppresses only the same observation and reopens when the result changes', () => {
  const record = createResourceLinkReview({ row: row(), decision: 'accepted', snapshot: firstSnapshot }, '2026-11-05T10:05:00.000Z')
  assert.equal(resourceLinkReviewState(row(), firstSnapshot, [record]).state, 'acknowledged')
  const laterBadSnapshot = snapshotAt('2026-11-05T11:00:00.000Z', [row({ code: 403, status: 'restricted' })])
  assert.equal(resourceLinkReviewState(laterBadSnapshot.rows[0], laterBadSnapshot, [record]).state, 'reopened')
  assert.equal(resourceLinkReviewState(laterBadSnapshot.rows[0], laterBadSnapshot, [record]).open, true)
})

test('a temporary issue waits for the next scan, then either resolves or reopens', () => {
  const record = createResourceLinkReview({ row: row(), decision: 'temporary', snapshot: firstSnapshot }, '2026-11-05T10:05:00.000Z')
  assert.equal(resourceLinkReviewState(row(), firstSnapshot, [record]).state, 'awaiting-recheck')
  const recovered = snapshotAt('2026-11-05T11:00:00.000Z', [row({ status: 'ok', code: 200 })])
  assert.equal(resourceLinkReviewState(recovered.rows[0], recovered, [record]).state, 'resolved')
  const stillBroken = snapshotAt('2026-11-05T11:00:00.000Z', [row({ code: 404 })])
  assert.equal(resourceLinkReviewState(stillBroken.rows[0], stillBroken, [record]).state, 'reopened')
})

test('a migrated URL stays actionable until the replacement catalogue URL passes a newer probe', () => {
  const record = createResourceLinkReview({
    row: row(), decision: 'migrated', replacementUrl: 'https://new.example.com/docs', snapshot: firstSnapshot,
  }, '2026-11-05T10:05:00.000Z')
  assert.equal(resourceLinkReviewState(row(), firstSnapshot, [record]).state, 'action')
  const oldUrlHealthy = snapshotAt('2026-11-05T10:30:00.000Z', [row({ status: 'ok', code: 200 })])
  assert.equal(resourceLinkReviewState(oldUrlHealthy.rows[0], oldUrlHealthy, [record]).state, 'action')
  const updated = snapshotAt('2026-11-05T11:00:00.000Z', [row({ url: 'https://new.example.com/docs', status: 'ok', code: 200 })])
  assert.equal(resourceLinkReviewState(updated.rows[0], updated, [record]).state, 'resolved')
})

test('a fix-in-progress remains visible until a later healthy snapshot verifies the correction', () => {
  const record = createResourceLinkReview({ row: row(), decision: 'action', note: '需要更新官方入口', snapshot: firstSnapshot }, '2026-11-05T10:05:00.000Z')
  assert.equal(resourceLinkReviewState(row(), firstSnapshot, [record]).open, true)
  const recovered = snapshotAt('2026-11-05T11:00:00.000Z', [row({ status: 'redirect', code: 301 })])
  assert.equal(resourceLinkReviewState(recovered.rows[0], recovered, [record]).state, 'resolved')
})

test('migration decisions require an HTTPS replacement URL', () => {
  assert.throws(() => createResourceLinkReview({ row: row(), decision: 'migrated', replacementUrl: 'http://new.example.com' }), /HTTPS/)
})

test('summary counts pending, awaiting and acknowledged targets separately', () => {
  const rows = [row(), row({ resourceId: 'temporary', targetKind: 'repository' }), row({ resourceId: 'clean', status: 'ok', code: 200 })]
  const snapshot = snapshotAt('2026-11-05T10:00:00.000Z', rows)
  const accepted = createResourceLinkReview({ row: rows[0], decision: 'accepted', snapshot }, '2026-11-05T10:05:00.000Z')
  const temporary = createResourceLinkReview({ row: rows[1], decision: 'temporary', snapshot }, '2026-11-05T10:05:00.000Z')
  assert.deepEqual(summarizeResourceLinkReviews(snapshot, [accepted, temporary]), {
    total: 3, review: 2, pending: 0, awaiting: 1, acknowledged: 1, recorded: 2,
  })
})


test('a deprecated target stays acknowledged only while its observed failure signature is unchanged', () => {
  const record = createResourceLinkReview({ row: row(), decision: 'deprecated', snapshot: firstSnapshot }, '2026-11-05T10:05:00.000Z')
  assert.equal(resourceLinkReviewState(row(), firstSnapshot, [record]).state, 'deprecated')
  const changed = snapshotAt('2026-11-05T11:00:00.000Z', [row({ status: 'server_error', code: 503 })])
  assert.equal(resourceLinkReviewState(changed.rows[0], changed, [record]).state, 'reopened')
})

test('a healthy old address does not close a migration task or disappear from the pending count', () => {
  const record = createResourceLinkReview({
    row: row(), decision: 'migrated', replacementUrl: 'https://new.example.com/docs', snapshot: firstSnapshot,
  }, '2026-11-05T10:05:00.000Z')
  const oldAddressRecovered = snapshotAt('2026-11-05T11:00:00.000Z', [row({ status: 'ok', code: 200 })])
  assert.deepEqual(summarizeResourceLinkReviews(oldAddressRecovered, [record]), {
    total: 1, review: 0, pending: 1, awaiting: 0, acknowledged: 0, recorded: 1,
  })
})

test('review history stays bounded and evicts the oldest entry first', () => {
  const storage = memoryStorage()
  const seed = createResourceLinkReview({ row: row(), decision: 'accepted', snapshot: firstSnapshot }, '2026-11-05T10:05:00.000Z')
  const existing = Array.from({ length: 500 }, (_, index) => ({ ...seed, resourceId: 'resource-' + index }))
  const next = appendResourceLinkReview(seed, existing, storage)
  assert.equal(next.length, 500)
  assert.equal(next[0].resourceId, 'resource-1')
  assert.equal(next.at(-1).resourceId, 'example')
  assert.equal(readResourceLinkReviews(storage).length, 500)
})
