/** Interpret a deployment probe without confusing HTTP reachability with usability. */
export function isUnreachable(cls) {
  return (
    cls === '530/1033' ||
    cls === '502' ||
    cls === '504' ||
    cls === 'transport' ||
    String(cls ?? '').startsWith('5xx')
  )
}

export function probeStatusPresentation(status, result) {
  if (!result) {
    if (status === 'pending') return { label: '部署中', kind: 'neutral', title: '部署清单标记为部署中' }
    return {
      label: '未探测',
      kind: 'neutral',
      title: '没有随本次发布提供该实例的探测结果；部署清单中的状态不代表当前可用性',
    }
  }

  const code = result.code == null ? result.cls : result.code
  const title = result.cls + ': ' + (result.note ?? '发布时探测结果')
  if (isUnreachable(result.cls)) {
    return {
      label: result.cls === 'transport' ? '连接失败' : '不可达 ' + code,
      kind: 'down',
      title,
    }
  }
  if (result.cls === '2xx') return { label: '响应正常 ' + code, kind: 'ok', title }
  if (result.cls === '3xx') {
    const protectedRedirect = String(result.note ?? '').includes('Access login redirect')
    return { label: (protectedRedirect ? '需认证' : '重定向') + ' ' + code, kind: protectedRedirect ? 'restricted' : 'redirect', title }
  }
  if (result.cls === '4xx') {
    const label = result.code === 401 ? '需认证 401' : result.code === 403 ? '访问受限 403' : 'HTTP 错误 ' + code
    return { label, kind: 'restricted', title }
  }
  return { label: '待确认 ' + code, kind: 'neutral', title }
}

/** Summary of the last published snapshot; this is not live monitoring. */
export function summarizeProbeRows(rows = []) {
  const summary = { total: rows.length, ok: 0, redirect: 0, restricted: 0, unreachable: 0, other: 0 }
  for (const row of rows) {
    if (row.cls === '2xx') summary.ok++
    else if (row.cls === '3xx') summary.redirect++
    else if (row.cls === '4xx') summary.restricted++
    else if (isUnreachable(row.cls)) summary.unreachable++
    else summary.other++
  }
  return summary
}
