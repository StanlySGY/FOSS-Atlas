const HOURS = 60 * 60 * 1000

export function resourceLinkFreshness(snapshot, now = Date.now()) {
  const parsed = Date.parse(snapshot?.ranAt ?? '')
  if (!Number.isFinite(parsed)) return { state: 'missing', ageHours: null, label: '暂无巡检快照' }
  const ageHours = Math.max(0, (now - parsed) / HOURS)
  if (ageHours <= 36) return { state: 'fresh', ageHours, label: '最近巡检' }
  if (ageHours <= 72) return { state: 'aging', ageHours, label: '巡检数据偏旧' }
  return { state: 'stale', ageHours, label: '巡检数据已过期' }
}

export function resourceLinkPresentation(row) {
  if (!row) return { label: '未巡检', kind: 'unknown', note: '没有该资源的官网巡检记录' }
  switch (row.status) {
    case 'ok': return { label: '响应正常', kind: 'ok', note: row.note || '收到成功 HTTP 响应' }
    case 'redirect': return { label: '有重定向', kind: 'redirect', note: row.note || '最终响应仍为重定向' }
    case 'restricted': return { label: '访问受限', kind: 'restricted', note: row.note || '认证、反爬或速率限制' }
    case 'not_found': return { label: '疑似失效', kind: 'review', note: row.note || 'HTTP 404/410，建议人工复核' }
    case 'client_error': return { label: 'HTTP 客户端错误', kind: 'review', note: row.note || '非认证类 HTTP 4xx' }
    case 'server_error': return { label: '服务端错误', kind: 'review', note: row.note || 'HTTP 5xx' }
    case 'timeout': return { label: '请求超时', kind: 'inconclusive', note: row.note || '请求未在时限内完成' }
    case 'dns_error': return { label: 'DNS 异常', kind: 'inconclusive', note: row.note || 'DNS 查询失败' }
    case 'tls_error': return { label: 'TLS 异常', kind: 'inconclusive', note: row.note || 'TLS 连接未完成' }
    case 'network_error': return { label: '网络异常', kind: 'inconclusive', note: row.note || '网络请求未完成' }
    case 'redirect_loop': return { label: '跳转循环', kind: 'review', note: row.note || '检测到循环跳转' }
    case 'too_many_redirects': return { label: '跳转过多', kind: 'review', note: row.note || '跳转次数超过上限' }
    default: return { label: '待确认', kind: 'unknown', note: row.note || '暂时无法分类' }
  }
}

export function needsResourceLinkReview(row) {
  return Boolean(row && !['ok', 'redirect'].includes(row.status))
}

/** One snapshot can cover both the catalogue homepage and its GitHub repository. */
export function resourceLinkRowsByTarget(snapshot) {
  return new Map((snapshot?.rows ?? []).map((row) => [
    row.resourceId + ':' + (row.targetKind ?? 'homepage'),
    row,
  ]))
}

export function resourceLinksNeedReview(resourceId, rowsByTarget) {
  return ['homepage', 'repository'].some((kind) =>
    needsResourceLinkReview(rowsByTarget.get(resourceId + ':' + kind)),
  )
}

/** Keep HTTP classification shared by the scanner and its regression tests. */
export function classifyResourceLinkResponse(code, { accessRedirect = false } = {}) {
  if (accessRedirect || code === 401 || code === 403 || code === 429) {
    return { status: 'restricted', note: 'authentication, bot protection or rate limit' }
  }
  if (code >= 200 && code < 300) return { status: 'ok', note: 'successful HTTP response' }
  if (code >= 300 && code < 400) return { status: 'redirect', note: 'redirect without a followable location' }
  if (code === 404 || code === 410) return { status: 'not_found', note: 'not found / gone' }
  if (code >= 400 && code < 500) return { status: 'client_error', note: 'HTTP client error' }
  if (code >= 500) return { status: 'server_error', note: 'HTTP server error' }
  return { status: 'other', note: 'unclassified response' }
}

export function summarizeResourceLinks(rows = []) {
  const summary = { total: rows.length, ok: 0, redirect: 0, restricted: 0, notFound: 0, clientError: 0, serverError: 0, inconclusive: 0, review: 0 }
  for (const row of rows) {
    if (row.status === 'ok') summary.ok++
    else if (row.status === 'redirect') summary.redirect++
    else if (row.status === 'restricted') summary.restricted++
    else if (row.status === 'not_found') summary.notFound++
    else if (row.status === 'client_error' || row.status === 'redirect_loop' || row.status === 'too_many_redirects') summary.clientError++
    else if (row.status === 'server_error') summary.serverError++
    else summary.inconclusive++
    if (needsResourceLinkReview(row)) summary.review++
  }
  return summary
}

export function formatSnapshotAge(freshness) {
  if (!freshness || freshness.ageHours == null) return '尚无记录'
  if (freshness.ageHours < 1) return '不到 1 小时前'
  if (freshness.ageHours < 24) return Math.floor(freshness.ageHours) + ' 小时前'
  return Math.floor(freshness.ageHours / 24) + ' 天前'
}
