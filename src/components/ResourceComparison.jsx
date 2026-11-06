import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resourceById, resourceSearchEntryFor } from '../lib/data.js'
import { getOffering } from '../lib/offerings.js'
import { repositoryFor } from '../lib/repositories.js'
import { resourceLinkPresentation } from '../lib/resourceLinkStatus.js'
import {
  COMPARISON_LIMIT,
  buildComparisonShareUrl,
  copyComparisonShareUrl,
  setComparisonOpenParams,
} from '../lib/resourceComparison.js'
import '../comparison.css'

function TextList({ items, empty }) {
  return items?.length
    ? <ul className="fa-comparison-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    : empty
}

function OfferingLimits({ offering }) {
  if (!offering?.limits?.length) return '暂无额度记录'
  return <dl className="fa-comparison-limits">{offering.limits.map(([label, value, ...notes], index) => (
    <div key={index}>
      <dt>{label || '额度项目未记录'}</dt>
      <dd>{value || '额度未记录'}</dd>
      {notes.filter(Boolean).map((note, noteIndex) => <dd className="fa-comparison-note" key={noteIndex}>{note}</dd>)}
    </div>
  ))}</dl>
}

function OfferingSources({ offering }) {
  if (!offering?.sources?.length) return '暂无来源记录'
  return <ul className="fa-comparison-list">{offering.sources.map(([label, url, claim], index) => (
    <li key={index}>
      {url ? <a href={url} target="_blank" rel="noopener noreferrer">{label || '官方来源'} ↗</a> : '来源地址未记录'}
      {claim ? <p className="fa-comparison-note">{claim}</p> : null}
    </li>
  ))}</ul>
}

function RepositoryStatus({ repository }) {
  if (!repository) return '暂无仓库数据'
  const status = repository.disabled === true ? '已停用'
    : repository.archived === true ? '已归档'
      : repository.archived === false && repository.disabled === false ? '未归档、未停用'
        : '仓库状态未知'
  const refresh = { stale: '历史快照，更新失败', 'not-found': '最近查询：上游 API 404', unavailable: '暂无可用快照' }[repository.refreshStatus]
  return <>
    <p>{status}</p>
    {refresh ? <p className="fa-comparison-note">{refresh}</p> : null}
    <p className="fa-comparison-note">快照日期：{repository.checkedAt?.slice(0, 10) || '未记录'}</p>
  </>
}

function LinkStatus({ row, freshness }) {
  if (!row) return '暂无巡检数据'
  const status = resourceLinkPresentation(row)
  return <>
    <p>{status.label} · {row.code == null ? '无 HTTP 码' : `HTTP ${row.code}`}</p>
    <p className="fa-comparison-note">{freshness?.label || '快照时间未记录'}</p>
  </>
}

const comparisonRows = [
  ['简介', ({ resource }) => resource.description || '暂无简介'],
  ['适用场景', ({ scenarios }) => <TextList items={scenarios} empty="暂无场景记录" />],
  ['分类', ({ resource }) => [resource.category_name, resource.sub_category_name].filter(Boolean).join(' / ') || '分类未记录'],
  ['方案概况', ({ offering }) => offering ? <><p><strong>{offering.label || offering.shortLabel || '方案类型未记录'}</strong></p><p>{offering.summary || '暂无方案摘要'}</p></> : '暂无方案记录'],
  ['全部额度与限制', ({ offering }) => <OfferingLimits offering={offering} />],
  ['使用条件', ({ offering }) => <TextList items={offering?.conditions} empty="暂无条件记录，请查官方说明" />],
  ['方案核验日期', ({ offering }) => offering?.verifiedAt ? <time dateTime={offering.verifiedAt}>{offering.verifiedAt}</time> : '核验日期未记录'],
  ['方案来源', ({ offering }) => <OfferingSources offering={offering} />],
  ['仓库许可', ({ repository }) => repository ? repository.license || '未声明 / 未识别，请查仓库 LICENSE' : '暂无仓库数据'],
  ['GitHub 社区', ({ repository }) => repository ? <><p>{Number.isFinite(repository.stars) ? repository.stars.toLocaleString('zh-CN') + ' Stars' : 'Stars 未记录'}</p><p>{Number.isFinite(repository.forks) ? repository.forks.toLocaleString('zh-CN') + ' Forks' : 'Forks 未记录'}</p></> : '暂无仓库数据'],
  ['仓库状态', ({ repository }) => <RepositoryStatus repository={repository} />],
  ['本站部署记录', ({ resource }) => <><p>{resource.deployed === true ? '站长环境已有实例' : '站长环境未记录实例'}</p><p className="fa-comparison-note">仅为本站部署记录；上游是否支持自部署，请查官方文档。</p></>],
  ['官网巡检', ({ resource }, linkRows, linkFreshness) => <LinkStatus row={linkRows?.get(resource.id + ':homepage')} freshness={linkFreshness} />],
  ['仓库巡检', ({ resource }, linkRows, linkFreshness) => <LinkStatus row={linkRows?.get(resource.id + ':repository')} freshness={linkFreshness} />],
  ['官网与仓库', ({ resource, repository }) => <>{resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.name} 官网 ↗</a> : <p>官网地址未记录</p>}{repository?.url ? <a href={repository.url} target="_blank" rel="noopener noreferrer">{repository.repository || '项目仓库'} ↗</a> : <p>仓库地址未记录</p>}</>],
]

export default function ResourceComparison({ resources = [], onRemove, onClear, linkRows, linkFreshness }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const triggerRef = useRef(null)
  const trayRef = useRef(null)
  const uid = useId()
  const [share, setShare] = useState(null)
  const ids = resources.map((resource) => resource.id)
  const selectionKey = ids.join(',')
  const hasSelection = resources.length > 0
  const canCompare = resources.length >= 2
  const requestedOpen = searchParams.get('comparing') === '1'
  const open = requestedOpen && canCompare
  const currentShare = share?.selectionKey === selectionKey ? share : null
  const columns = useMemo(() => resources.map((resource) => ({
    resource,
    offering: getOffering(resource.id),
    repository: repositoryFor(resource.id),
    scenarios: resourceSearchEntryFor(resource.id).scenarios,
  })), [resources])

  useEffect(() => {
    const tray = trayRef.current
    if (!tray) return undefined
    const host = tray.closest('.fa-discovery-shell') ?? tray.parentElement
    const property = '--fa-comparison-tray-height'
    const previous = host.style.getPropertyValue(property)
    const previousPriority = host.style.getPropertyPriority(property)
    const measure = () => host.style.setProperty(property, `${Math.ceil(tray.getBoundingClientRect().height)}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(tray)
    return () => {
      observer.disconnect()
      if (previous) host.style.setProperty(property, previous, previousPriority)
      else host.style.removeProperty(property)
    }
  }, [hasSelection])

  useEffect(() => {
    if (requestedOpen && !canCompare) {
      setSearchParams((previous) => setComparisonOpenParams(previous, false), { replace: true })
    }
  }, [requestedOpen, canCompare, setSearchParams])

  useEffect(() => {
    if (!open) return undefined
    const dialog = dialogRef.current
    const body = document.body
    const previousFocus = document.activeElement === body ? triggerRef.current : document.activeElement
    const tray = trayRef.current
    const previousOverflow = body.style.getPropertyValue('overflow')
    const previousPriority = body.style.getPropertyPriority('overflow')
    dialog.showModal()
    body.style.setProperty('overflow', 'hidden')
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      if (dialog.open) dialog.close()
      if (previousOverflow) body.style.setProperty('overflow', previousOverflow, previousPriority)
      else body.style.removeProperty('overflow')
      const target = previousFocus?.isConnected && !previousFocus.disabled
        ? previousFocus
        : tray?.isConnected ? tray.querySelector('button:not(:disabled)') : null
      target?.focus({ preventScroll: true })
    }
  }, [open])

  const openComparison = () => {
    setSearchParams((previous) => setComparisonOpenParams(previous, true, ids, resourceById), { replace: true })
  }
  const closeComparison = () => {
    setSearchParams((previous) => setComparisonOpenParams(previous, false), { replace: true })
  }
  const keepDialogFocus = (event) => {
    if (event.key !== 'Tab') return
    const dialog = dialogRef.current
    const targets = [...dialog.querySelectorAll('a[href],button:not(:disabled),textarea,[tabindex="0"]')]
      .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden')
    const first = targets[0]
    const last = targets[targets.length - 1]
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault()
      ;(event.shiftKey ? last : first)?.focus({ preventScroll: true })
    }
  }
  const shareComparison = async () => {
    const url = buildComparisonShareUrl({ origin: window.location.origin, basePath: import.meta.env.BASE_URL, ids, validIds: resourceById })
    setShare({ selectionKey, url, status: 'pending' })
    const copied = await copyComparisonShareUrl(url)
    setShare({ selectionKey, url, status: copied ? 'copied' : 'manual' })
  }

  if (!resources.length) return null

  return <div className="fa-comparison">
    <aside ref={trayRef} className="fa-comparison-tray" aria-label="已选比较资源">
      <div className="fa-comparison-selection">
        <p className="fa-comparison-count" aria-live="polite">已选 {resources.length} / {COMPARISON_LIMIT} 个资源</p>
        <ul className="fa-comparison-chips" aria-label="已选资源，可左右滚动">
          {resources.map((resource) => <li key={resource.id}>
            <button type="button" aria-label={`从比较中移除 ${resource.name}`} onClick={() => onRemove(resource.id)}>
              <span>{resource.name}</span><span aria-hidden="true">×</span>
            </button>
          </li>)}
        </ul>
        <p id={`${uid}-hint`} className="fa-comparison-hint">{resources.length === 1 ? '再选 1 个资源即可比较。' : resources.length === COMPARISON_LIMIT ? '已选满；移除一个后可更换资源。' : '最多可同时比较 3 个资源。'}</p>
      </div>
      <div className="fa-comparison-actions">
        <button type="button" onClick={onClear} aria-label="清空比较列表">清空</button>
        <button ref={triggerRef} type="button" className="fa-comparison-primary" disabled={!canCompare} aria-describedby={`${uid}-hint`} onClick={openComparison}>比较所选</button>
      </div>
    </aside>

    <dialog ref={dialogRef} className="fa-comparison-dialog" onKeyDown={keepDialogFocus} aria-labelledby={`${uid}-title`} aria-describedby={`${uid}-description`} onCancel={(event) => { event.preventDefault(); closeComparison() }}>
      <header className="fa-comparison-header">
        <div><h2 id={`${uid}-title`}>资源比较</h2><p id={`${uid}-description`}>按项目查看所选资源的用途、额度和仓库信息。按 Escape 关闭。</p></div>
        <button ref={closeRef} type="button" className="fa-comparison-close" aria-label="关闭资源比较" onClick={closeComparison}>×</button>
      </header>
      <p id={`${uid}-scroll`} className="fa-comparison-scroll-hint">左右滑动表格查看全部资源；键盘可聚焦表格后使用方向键滚动。</p>
      <div className="fa-comparison-table-scroll" role="region" aria-label="资源比较表格" aria-describedby={`${uid}-scroll`} tabIndex={0}>
        <table className="fa-comparison-table" style={{ '--comparison-count': resources.length }}>
          <caption className="sr-only">{resources.map((resource) => resource.name).join('、')}的逐项比较；每列为一个资源，每行为一个比较项目。</caption>
          <thead><tr><th scope="col">比较项目</th>{columns.map(({ resource }) => <th scope="col" key={resource.id}>
            <Link to={`/wiki/${resource.id}/`} aria-label={`查看 ${resource.name} Wiki`}>{resource.name}</Link>
            <button type="button" className="fa-comparison-remove" aria-label={`从比较中移除 ${resource.name}`} onClick={() => { closeRef.current?.focus({ preventScroll: true }); onRemove(resource.id) }}>移除</button>
          </th>)}</tr></thead>
          <tbody>{comparisonRows.map(([label, render]) => <tr key={label}>
            <th scope="row">{label}</th>{columns.map((column) => <td key={column.resource.id}>{render(column, linkRows, linkFreshness)}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <footer className="fa-comparison-footer">
        <p className="fa-comparison-note">额度与条件以官方当前政策为准；仓库数据为所示日期的快照。</p>
        <div className="fa-comparison-actions">
          <button type="button" onClick={shareComparison} disabled={currentShare?.status === 'pending'}>{currentShare?.status === 'pending' ? '正在复制…' : '复制比较链接'}</button>
          <button type="button" className="fa-comparison-primary" onClick={closeComparison}>完成</button>
        </div>
        <p className="fa-comparison-share-status" role="status">{currentShare?.status === 'copied' ? '比较链接已复制。链接仅包含所选资源。' : currentShare?.status === 'manual' ? '自动复制未成功，请选择下方链接手动复制。' : ''}</p>
        {currentShare?.status === 'manual' ? <label className="fa-comparison-share-url">手动复制比较链接
          <textarea readOnly value={currentShare.url} rows={2} onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} />
        </label> : null}
      </footer>
    </dialog>
  </div>
}
