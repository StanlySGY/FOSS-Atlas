import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resources } from '../lib/data.js'
import { resourceLinkPresentation } from '../lib/resourceLinkStatus.js'
import {
  createResourceLinkReview,
  RESOURCE_LINK_REVIEW_DECISIONS,
  resourceLinkReviewState,
} from '../lib/resourceLinkReviews.js'

const TARGETS = [
  { kind: 'homepage', label: '官网入口' },
  { kind: 'repository', label: 'GitHub 仓库' },
]

function timeLabel(value) {
  const time = Date.parse(value ?? '')
  return Number.isFinite(time) ? new Date(time).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }) : '时间未记录'
}

function ReviewItem({ resource, row, snapshot, reviews, onSave }) {
  const [decision, setDecision] = useState('')
  const [replacementUrl, setReplacementUrl] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const target = TARGETS.find((item) => item.kind === row.targetKind) ?? TARGETS[0]
  const presentation = resourceLinkPresentation(row)
  const state = resourceLinkReviewState(row, snapshot, reviews)
  const isRepository = row.targetKind === 'repository'

  const submit = (event) => {
    event.preventDefault()
    setError('')
    try {
      const record = createResourceLinkReview({ row, decision, note, replacementUrl, snapshot })
      if (onSave(record)) {
        setSaved(true)
        setDecision('')
        setReplacementUrl('')
        setNote('')
      } else {
        setError('浏览器没有保存这条记录，请检查本地存储权限后重试。')
      }
    } catch (cause) {
      setError(cause.message || '复核记录无效，请检查填写内容。')
    }
  }

  return (
    <article className="fa-link-review-item">
      <div className="fa-link-review-item-head">
        <div className="fa-link-review-resource">
          <Link to={'/wiki/' + resource.id + '/'}>{resource.name}</Link>
          <span>{target.label}</span>
        </div>
        <span className={'fa-link-review-status is-' + presentation.kind}>{presentation.label}{row.code ? ' · ' + row.code : ''}</span>
      </div>
      <p className="fa-link-review-context">{state.label} · {presentation.note}</p>
      <div className="fa-link-review-urls">
        <div><span>当前收录地址</span><a href={row.url} target="_blank" rel="noreferrer">{row.url}</a></div>
        {row.finalUrl && row.finalUrl !== row.url ? <div><span>最终响应地址</span><a href={row.finalUrl} target="_blank" rel="noreferrer">{row.finalUrl}</a></div> : null}
        {row.redirects?.length ? <details><summary>查看 {row.redirects.length} 次跳转</summary><ol>{row.redirects.map((redirect, index) => <li key={redirect.url + ':' + index}><span>{redirect.code}</span><a href={redirect.url} target="_blank" rel="noreferrer">{redirect.url}</a><span>→</span><a href={redirect.to} target="_blank" rel="noreferrer">{redirect.to}</a></li>)}</ol></details> : null}
      </div>
      <div className="fa-link-review-meta"><span>巡检于 {timeLabel(row.checkedAt ?? snapshot?.ranAt)}</span><span>尝试 {row.attempts ?? 1} 次</span><span>{isRepository ? '仓库入口问题' : '官网入口问题'}</span></div>
      <form className="fa-link-review-form" onSubmit={submit}>
        <label><span>复核结论</span>
          <select required value={decision} onChange={(event) => { setDecision(event.target.value); setSaved(false) }}>
            <option value="">选择如何处理</option>
            {Object.entries(RESOURCE_LINK_REVIEW_DECISIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        {decision === 'migrated' ? <label className="fa-link-review-replacement"><span>新的 HTTPS 地址</span><input type="url" inputMode="url" placeholder="https://example.com/new-location" required value={replacementUrl} onChange={(event) => { setReplacementUrl(event.target.value); setSaved(false) }}/></label> : null}
        <label className="fa-link-review-note"><span>复核说明（选填）</span><textarea rows="2" maxLength="800" placeholder="例如：官方公告已迁移到新域名；当前 403 是登录墙，不代表资源失效。" value={note} onChange={(event) => { setNote(event.target.value); setSaved(false) }}/></label>
        <div className="fa-link-review-submit"><button type="submit" disabled={!decision}>保存复核记录</button><Link to={'/wiki/' + resource.id + '/'}>查看 Wiki ↗</Link>{saved ? <span role="status">已保存</span> : null}</div>
        {error ? <p className="fa-link-review-error" role="alert">{error}</p> : null}
      </form>
    </article>
  )
}

export default function ResourceLinkReviewDesk({ resources: visibleResources, snapshot, rowsByTarget, reviews, onSave }) {
  const [showHistory, setShowHistory] = useState(false)
  const resourcesById = new Map(resources.map((resource) => [resource.id, resource]))
  const items = visibleResources.flatMap((resource) => TARGETS.map((target) => ({
    resource,
    row: rowsByTarget.get(resource.id + ':' + target.kind),
  })).filter((item) => item.row && resourceLinkReviewState(item.row, snapshot, reviews).open))
  const history = [...reviews].sort((a, b) => Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt)).slice(0, 20)

  return (
    <div className="fa-link-review-desk">
      <header className="fa-link-review-intro">
        <div><p className="fa-link-review-eyebrow">LINK QUALITY / REVIEW QUEUE</p><h2>逐条确认异常原因，再决定是否修复</h2><p>官网与 GitHub 仓库分别记录。认证限制不等于失效；临时异常会在下一轮巡检自动重新打开。</p></div>
        <div className="fa-link-review-count"><strong>{items.length}</strong><span>条待处理目标</span></div>
      </header>

      {items.length ? <div className="fa-link-review-list">{items.map(({ resource, row }) => <ReviewItem key={resource.id + ':' + row.targetKind} resource={resource} row={row} snapshot={snapshot} reviews={reviews} onSave={onSave}/>)}</div> : <div className="fa-link-review-empty"><strong>当前没有待处理链接</strong><p>已记录的误报会被压下；临时异常会等下一轮巡检复查。新的异常仍会重新进入队列。</p></div>}

      <details className="fa-link-review-history" open={showHistory} onToggle={(event) => setShowHistory(event.currentTarget.open)}>
        <summary>本机复核记录（{reviews.length}）</summary>
        {history.length ? <ol>{history.map((entry, index) => {
          const resource = resourcesById.get(entry.resourceId)
          const target = TARGETS.find((item) => item.kind === entry.targetKind)?.label ?? entry.targetKind
          return <li key={entry.resourceId + ':' + entry.targetKind + ':' + entry.reviewedAt + ':' + index}><div><strong>{resource?.name ?? entry.resourceId}</strong><span>{target} · {RESOURCE_LINK_REVIEW_DECISIONS[entry.decision] ?? '复核记录'}</span></div><time>{timeLabel(entry.reviewedAt)}</time>{entry.note ? <p>{entry.note}</p> : null}{entry.replacementUrl ? <a href={entry.replacementUrl} target="_blank" rel="noreferrer">建议新地址 ↗</a> : null}</li>
        })}</ol> : <p className="fa-link-review-history-empty">还没有复核记录。保存结论后，这里会保留最近 20 条。</p>}
      </details>
      <p className="fa-link-review-local-note">记录仅保存在当前浏览器，不会上传或同步到其他设备。下一轮部署巡检会用最新快照判断临时异常是否恢复。</p>
    </div>
  )
}

