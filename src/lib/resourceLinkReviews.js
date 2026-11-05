import { needsResourceLinkReview } from './resourceLinkStatus.js'

export const RESOURCE_LINK_REVIEW_STORAGE_KEY = 'foss-atlas:resource-link-reviews:v1'

export const RESOURCE_LINK_REVIEW_DECISIONS = Object.freeze({
  accepted: '确认无需修复',
  migrated: '入口已迁移',
  deprecated: '确认已下架 / 停止维护',
  temporary: '临时异常，等待复查',
  action: '需要修复，持续跟进',
})

const MAX_REVIEW_RECORDS = 500
const TARGET_KINDS = new Set(['homepage', 'repository'])

function browserStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isReviewRecord(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof value.resourceId === 'string' &&
    TARGET_KINDS.has(value.targetKind) &&
    typeof value.sourceUrl === 'string' &&
    typeof value.signature === 'string' &&
    Object.hasOwn(RESOURCE_LINK_REVIEW_DECISIONS, value.decision) &&
    typeof value.reviewedAt === 'string',
  )
}

function rowSignature(row) {
  return JSON.stringify([row.status ?? null, row.code ?? null, row.finalUrl ?? null])
}

function normalizedUrl(value) {
  try {
    const url = new URL(value)
    return url.origin + (url.pathname === '/' ? '' : url.pathname) + url.search + url.hash
  } catch {
    return String(value ?? '')
  }
}

function latestReviewFor(row, reviews) {
  return reviews
    .filter((entry) => entry.resourceId === row.resourceId && entry.targetKind === (row.targetKind ?? 'homepage'))
    .sort((a, b) => Date.parse(a.reviewedAt) - Date.parse(b.reviewedAt))
    .at(-1) ?? null
}

export function readResourceLinkReviews(storage = browserStorage()) {
  if (!storage) return []
  try {
    const raw = storage.getItem(RESOURCE_LINK_REVIEW_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const entries = Array.isArray(parsed) ? parsed : parsed?.entries
    return Array.isArray(entries) ? entries.filter(isReviewRecord).slice(-MAX_REVIEW_RECORDS) : []
  } catch {
    return []
  }
}

export function writeResourceLinkReviews(reviews, storage = browserStorage()) {
  if (!storage) return false
  try {
    storage.setItem(RESOURCE_LINK_REVIEW_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, entries: reviews.slice(-MAX_REVIEW_RECORDS) }))
    return true
  } catch {
    return false
  }
}

export function appendResourceLinkReview(record, current = [], storage = browserStorage()) {
  if (!isReviewRecord(record)) return null
  const next = [...current, record].slice(-MAX_REVIEW_RECORDS)
  return writeResourceLinkReviews(next, storage) ? next : null
}

export function createResourceLinkReview({ row, decision, note = '', replacementUrl = '', snapshot = null }, reviewedAt = new Date().toISOString()) {
  if (!row?.resourceId || !row.url || !TARGET_KINDS.has(row.targetKind ?? 'homepage')) {
    throw new Error('缺少有效的资源与链接目标')
  }
  if (!Object.hasOwn(RESOURCE_LINK_REVIEW_DECISIONS, decision)) {
    throw new Error('请选择本次复核结论')
  }

  let normalizedReplacementUrl = replacementUrl.trim()
  if (decision === 'migrated') {
    try {
      const parsed = new URL(normalizedReplacementUrl)
      if (parsed.protocol !== 'https:') throw new Error('')
      normalizedReplacementUrl = parsed.href
    } catch {
      throw new Error('入口迁移需要填写有效的 HTTPS 新地址')
    }
  } else {
    normalizedReplacementUrl = ''
  }

  return {
    resourceId: row.resourceId,
    targetKind: row.targetKind ?? 'homepage',
    sourceUrl: row.url,
    signature: rowSignature(row),
    decision,
    note: String(note).trim().slice(0, 800),
    replacementUrl: normalizedReplacementUrl,
    reviewedAt,
    snapshotRanAt: snapshot?.ranAt ?? null,
  }
}

/** Determine whether a recorded decision still applies to the latest snapshot. */
export function resourceLinkReviewState(row, snapshot, reviews = []) {
  if (!row) return { state: 'clear', open: false, label: '没有巡检记录', review: null }

  const needsReview = needsResourceLinkReview(row)
  const review = latestReviewFor(row, reviews)
  if (!review) {
    return needsReview
      ? { state: 'pending', open: true, label: '待人工复核', review: null }
      : { state: 'clear', open: false, label: '当前快照正常', review: null }
  }

  const snapshotTime = Date.parse(snapshot?.ranAt ?? '')
  const reviewedSnapshotTime = Date.parse(review.snapshotRanAt ?? '')
  const hasNewerSnapshot = Number.isFinite(snapshotTime) &&
    (!Number.isFinite(reviewedSnapshotTime) || snapshotTime > reviewedSnapshotTime)

  if (!needsReview) {
    if (review.decision === 'migrated' && normalizedUrl(row.url) !== normalizedUrl(review.replacementUrl)) {
      return { state: 'action', open: true, label: '待更新并验证迁移后的入口', review }
    }
    return hasNewerSnapshot
      ? { state: 'resolved', open: false, label: '新一轮巡检已恢复', review }
      : { state: 'awaiting-recheck', open: false, label: '等待下一轮巡检确认', review }
  }

  if (row.url !== review.sourceUrl) {
    return { state: 'pending', open: true, label: '入口地址已变化，需重新核验', review }
  }

  const sameObservation = rowSignature(row) === review.signature
  if (!sameObservation && hasNewerSnapshot) {
    return { state: 'reopened', open: true, label: '新一轮巡检再次异常', review }
  }

  if (review.decision === 'accepted' && sameObservation) {
    return { state: 'acknowledged', open: false, label: '已确认：当前结果可接受', review }
  }
  if (review.decision === 'deprecated' && sameObservation) {
    return { state: 'deprecated', open: false, label: '已确认下架 / 停止维护', review }
  }
  if (review.decision === 'temporary') {
    return hasNewerSnapshot
      ? { state: 'reopened', open: true, label: '复查后仍未恢复', review }
      : { state: 'awaiting-recheck', open: false, label: '已记录，等待下一轮巡检', review }
  }
  if (review.decision === 'migrated') {
    return { state: 'action', open: true, label: '待更新目录中的入口地址', review }
  }
  if (review.decision === 'action') {
    return { state: 'action', open: true, label: '待修复，持续跟进', review }
  }
  return { state: 'pending', open: true, label: '需要重新复核', review }
}

export function resourceLinksNeedReview(resourceId, rowsByTarget, snapshot, reviews = []) {
  return ['homepage', 'repository'].some((targetKind) => {
    const row = rowsByTarget.get(resourceId + ':' + targetKind)
    return Boolean(row && resourceLinkReviewState(row, snapshot, reviews).open)
  })
}

export function summarizeResourceLinkReviews(snapshot, reviews = []) {
  const rows = snapshot?.rows ?? []
  const reviewRows = rows.filter(needsResourceLinkReview)
  const states = rows.map((row) => resourceLinkReviewState(row, snapshot, reviews))
  return {
    total: rows.length,
    review: reviewRows.length,
    pending: states.filter((state) => state.open).length,
    awaiting: states.filter((state) => state.state === 'awaiting-recheck').length,
    acknowledged: states.filter((state) => ['acknowledged', 'deprecated'].includes(state.state)).length,
    recorded: reviews.length,
  }
}

