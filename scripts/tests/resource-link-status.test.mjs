import test from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyResourceLinkResponse,
  formatSnapshotAge,
  needsResourceLinkReview,
  resourceLinkFreshness,
  resourceLinkPresentation,
  resourceLinkRowsByTarget,
  resourceLinksNeedReview,
  summarizeResourceLinks,
} from '../../src/lib/resourceLinkStatus.js'

const NOW = Date.parse('2026-11-05T12:00:00.000Z')

test('link snapshot freshness distinguishes missing, fresh, aging and stale data', () => {
  assert.equal(resourceLinkFreshness(null, NOW).state, 'missing')
  assert.equal(resourceLinkFreshness({ ranAt: new Date(NOW - 12 * 3600000).toISOString() }, NOW).state, 'fresh')
  assert.equal(resourceLinkFreshness({ ranAt: new Date(NOW - 48 * 3600000).toISOString() }, NOW).state, 'aging')
  const stale = resourceLinkFreshness({ ranAt: new Date(NOW - 96 * 3600000).toISOString() }, NOW)
  assert.equal(stale.state, 'stale')
  assert.equal(formatSnapshotAge(stale), '4 天前')
})

test('restricted and transport outcomes remain inconclusive rather than site-down claims', () => {
  assert.equal(resourceLinkPresentation({ status: 'restricted', code: 403 }).kind, 'restricted')
  assert.equal(resourceLinkPresentation({ status: 'timeout' }).kind, 'inconclusive')
  assert.equal(resourceLinkPresentation({ status: 'dns_error' }).kind, 'inconclusive')
  assert.equal(resourceLinkPresentation({ status: 'not_found' }).kind, 'review')
  assert.equal(needsResourceLinkReview({ status: 'restricted' }), true)
  assert.equal(needsResourceLinkReview({ status: 'timeout' }), true)
  assert.equal(needsResourceLinkReview({ status: 'not_found' }), true)
  assert.equal(needsResourceLinkReview({ status: 'ok' }), false)
  assert.equal(needsResourceLinkReview({ status: 'redirect' }), false)
})

test('link audit summaries account for rows without conflating redirects, client and server errors', () => {
  const summary = summarizeResourceLinks([
    { status: 'ok' }, { status: 'redirect' }, { status: 'restricted' },
    { status: 'not_found' }, { status: 'client_error' }, { status: 'server_error' }, { status: 'timeout' },
  ])
  assert.deepEqual(summary, {
    total: 7, ok: 1, redirect: 1, restricted: 1, notFound: 1,
    clientError: 1, serverError: 1, inconclusive: 1, review: 5,
  })
})

test('an Access login redirect remains restricted even when its final page returns HTTP 200', () => {
  assert.equal(classifyResourceLinkResponse(200, { accessRedirect: true }).status, 'restricted')
  assert.equal(classifyResourceLinkResponse(200).status, 'ok')
  assert.equal(classifyResourceLinkResponse(403).status, 'restricted')
  assert.equal(classifyResourceLinkResponse(404).status, 'not_found')
})

test('review filtering includes either a homepage or a known repository needing review', () => {
  const rowsByTarget = resourceLinkRowsByTarget({
    rows: [
      { resourceId: 'example', targetKind: 'homepage', status: 'ok' },
      { resourceId: 'example', targetKind: 'repository', status: 'not_found' },
      { resourceId: 'another', targetKind: 'homepage', status: 'ok' },
    ],
  })
  assert.equal(resourceLinksNeedReview('example', rowsByTarget), true)
  assert.equal(resourceLinksNeedReview('another', rowsByTarget), false)
})
