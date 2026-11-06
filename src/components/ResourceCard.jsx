import { useState } from 'react'
import { Link } from 'react-router-dom'
import DeployedBadge from './DeployedBadge.jsx'
import { categoryColor, categoryRing, categorySoft } from '../lib/categoryColor.js'
import { iconFor, initialFor } from '../lib/data.js'
import { getOffering } from '../lib/offerings.js'
import { resourceLinkPresentation } from '../lib/resourceLinkStatus.js'

function SiteIcon({ resource }) {
  const [failed, setFailed] = useState(false)
  const src = iconFor(resource)
  return (
    <span className="fa-resource-icon" style={{ background: categorySoft(resource.category), borderColor: categoryRing(resource.category), '--resource-hue': categoryColor(resource.category) }}>
      <span aria-hidden="true">{initialFor(resource)}</span>
      {src && !failed ? <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : null}
    </span>
  )
}

export default function ResourceCard({
  resource, index = 0, isFavorite = false, isCompared = false,
  onFavorite = () => {}, onCompare = () => {}, view = 'grid', linkResult = null, repositoryLinkResult = null, linkFreshness = null,
}) {
  const { id, name, url, description, category, sub_category, sub_category_name } = resource
  const offering = getOffering(id)
  const linkPresentation = resourceLinkPresentation(linkResult)
  const repositoryLinkPresentation = resourceLinkPresentation(repositoryLinkResult)
  const oldSnapshot = linkFreshness?.state === 'aging' || linkFreshness?.state === 'stale'
  let host = url
  try { host = new URL(url).hostname.replace(/^www\./, '') } catch { /* preserve original URL */ }

  return (
    <article className={view === 'list' ? 'fa-resource-card fa-discovery-card is-list' : 'fa-resource-card fa-discovery-card'} style={{ animationDelay: Math.min(index * 16, 160) + 'ms' }}>
      <div className="fa-discovery-card-top">
        <SiteIcon resource={resource} />
        <div className="fa-discovery-card-heading">
          <Link to={'/wiki/' + id + '/'} className="fa-resource-title">{name}</Link>
          <span className="fa-resource-host">{host}</span>
        </div>
        <button type="button" className={isFavorite ? 'fa-favorite-button is-saved' : 'fa-favorite-button'} onClick={onFavorite} aria-label={isFavorite ? '取消收藏 ' + name : '收藏 ' + name} aria-pressed={isFavorite} title={isFavorite ? '取消收藏' : '加入收藏'}>{isFavorite ? '★' : '☆'}</button>
      </div>
      <p className="fa-resource-description">{description}</p>
      <div className="fa-discovery-card-bottom">
        <div className="fa-discovery-card-meta">
          <Link to={'/?cat=' + encodeURIComponent(category) + '&sub=' + encodeURIComponent(sub_category || '')} className="fa-resource-category">{sub_category_name || resource.category_name}</Link>
          {offering?.shortLabel ? <span className="fa-resource-plan">{offering.shortLabel}</span> : null}
          {linkResult && linkPresentation.kind !== 'ok' ? <span className="fa-resource-plan" title={linkPresentation.note + (oldSnapshot?' · 巡检快照偏旧':'')}>官网 · {linkPresentation.label}{oldSnapshot?' · 旧快照':''}</span> : null}
          {repositoryLinkResult && repositoryLinkPresentation.kind !== 'ok' ? <span className="fa-resource-plan" title={repositoryLinkPresentation.note + (oldSnapshot?' · 巡检快照偏旧':'')}>仓库 · {repositoryLinkPresentation.label}{oldSnapshot?' · 旧快照':''}</span> : null}
          <DeployedBadge resource={resource} to={'/deployed/#' + (resource.instances?.[0]?.id || '')} />
        </div>
        <div className="fa-resource-actions">
          <Link className="fa-detail-action" to={'/wiki/' + id + '/'} aria-label={'查看 ' + name + ' 的 Wiki 详情'}>Wiki 详情</Link>
          <button type="button" className={isCompared ? 'fa-compare-action is-selected' : 'fa-compare-action'} onClick={onCompare} aria-label={isCompared ? '将 ' + name + ' 移出比较' : '将 ' + name + ' 加入比较'} aria-pressed={isCompared}>{isCompared ? '已加入' : '比较 +'}</button>
          <a className="fa-visit-action" href={url} target="_blank" rel="noreferrer" aria-label={'访问 ' + name + ' 官网（新标签页）'}>访问 ↗</a>
        </div>
      </div>
    </article>
  )
}
