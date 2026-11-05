import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard.jsx'
import useUserJourney from '../hooks/useUserJourney.js'
import { PageHeader, SectionHeading } from '../components/PageHeader.jsx'
import FeaturedBuilds from '../components/FeaturedBuilds.jsx'
import { OFFER_FILTERS, getOffering, matchesOfferFilter } from '../lib/offerings.js'
import { repositoryByResource } from '../lib/repositories.js'
import {
  catalogSortFromSearchParams,
  catalogViewFromSearchParams,
  queryFromSearchParams,
  resetCatalogFiltersParams,
  savedOnlyFromSearchParams,
  setCatalogSortParams,
  setCatalogViewParams,
  setDeployedOnlyParams,
  setSavedOnlyParams,
} from '../lib/catalogFilterState.js'
import { categories, countByCategory, countBySubCategory, deployedStats, pickRandomResource, resources, resourceSearchTextFor, searchAliasesFor, subCategoriesByCategory } from '../lib/data.js'
import { matchesFuzzySearchTerm, matchesSearchTerm } from '../lib/resourceSearch.js'
import useResourceLinkSnapshot from '../hooks/useResourceLinkSnapshot.js'
import { formatSnapshotAge, resourceLinkFreshness, resourceLinkPresentation, resourceLinkRowsByTarget, resourceLinksNeedReview, summarizeResourceLinks } from '../lib/resourceLinkStatus.js'

const RESOURCE_IDS = new Set(resources.map((resource) => resource.id))
const VIEW_KEY = 'foss-atlas:catalog-view'
const readView = () => { try { return localStorage.getItem(VIEW_KEY)==='list'?'list':'grid' } catch { return 'grid' } }
const searchFieldsFor = (resource) => {
  const offer=getOffering(resource.id)
  return [resource.name,resource.description,resource.url,resource.category_name,resource.sub_category_name,...(resource.tags||[]),...searchAliasesFor(resource.id),resourceSearchTextFor(resource.id),offer?.label,offer?.summary,...(offer?.conditions||[])].filter(Boolean).map((value)=>String(value).toLowerCase())
}
const matchesSearch = (resource,query) => {
  if (!query) return true
  const fields=searchFieldsFor(resource)
  return query.split(/\s+/).filter(Boolean).every((term)=>matchesSearchTerm(term,fields,[resource.name,...searchAliasesFor(resource.id)]))
}
const scoreSearch = (resource,query) => {
  const name=resource.name.toLowerCase()
  const aliases=searchAliasesFor(resource.id).map((value)=>value.toLowerCase())
  const fields=searchFieldsFor(resource)
  if(name===query)return 120
  if(aliases.includes(query))return 112
  if(name.startsWith(query))return 105
  if((resource.tags??[]).some((tag)=>tag.toLowerCase()===query))return 90
  if(name.includes(query))return 86
  if(aliases.some((alias)=>alias.includes(query)))return 82
  if(resourceSearchTextFor(resource.id).toLowerCase().includes(query))return 64
  if(matchesFuzzySearchTerm(query,[resource.name,...aliases]))return 24
  return fields.some((field)=>field.includes(query))?45:0
}

export default function Home() {
  const navigate = useNavigate()
  const [searchParams,setSearchParams]=useSearchParams()
  const searchRef=useRef(null)
  const catalogRef=useRef(null)
  const compareTriggerRef=useRef(null)
  const compareDialogRef=useRef(null)
  const compareCloseRef=useRef(null)
  const comparePreviousOverflowRef=useRef(null)
  const [query,setQuery]=useState(()=>queryFromSearchParams(searchParams))
  const [visibleCount,setVisibleCount]=useState(24)
  const [filtersOpen,setFiltersOpen]=useState(false)
  const { favorites, recentIds, toggleFavorite } = useUserJourney(RESOURCE_IDS)
  const linkSnapshot = useResourceLinkSnapshot()
  const linkFreshness = resourceLinkFreshness(linkSnapshot)
  const linkRows = useMemo(() => resourceLinkRowsByTarget(linkSnapshot), [linkSnapshot])
  const linkSummary = useMemo(() => summarizeResourceLinks(linkSnapshot?.rows ?? []), [linkSnapshot])
  const linkOnly = searchParams.get('link') === 'review'
  const [viewFallback,setViewFallback]=useState(readView)
  const view=catalogViewFromSearchParams(searchParams,viewFallback)
  const sort=catalogSortFromSearchParams(searchParams)
  const [compareIds,setCompareIds]=useState([])
  const [compareOpen,setCompareOpen]=useState(false)
  const [toast,setToast]=useState('')

  const deployedOnly=searchParams.get('deployed')==='1'
  const favoritesOnly=savedOnlyFromSearchParams(searchParams)
  const offerParam=searchParams.get('offer')
  const activeOffer=OFFER_FILTERS.some((item)=>item.id===offerParam)?offerParam:'all'
  const catParam=searchParams.get('cat')
  const activeCategory=categories.some((item)=>item.id===catParam)?catParam:'all'
  const subs=activeCategory==='all'?[]:subCategoriesByCategory[activeCategory]??[]
  const subParam=searchParams.get('sub')
  const activeSub=subs.some((sub)=>sub.id===subParam)?subParam:'all'
  const activeCategoryName=categories.find((item)=>item.id===activeCategory)?.name

  useEffect(()=>{const next=queryFromSearchParams(searchParams);if(next!==query)setQuery(next);/* eslint-disable-next-line react-hooks/exhaustive-deps */},[searchParams])
  useEffect(()=>{try{localStorage.setItem(VIEW_KEY,view)}catch{/* optional */}},[view])
  useEffect(()=>{setVisibleCount(matchMedia('(max-width: 639px)').matches?8:24)},[query,activeCategory,activeSub,deployedOnly,activeOffer,favoritesOnly,linkOnly])
  useEffect(()=>{if(!toast)return undefined;const timer=setTimeout(()=>setToast(''),1800);return()=>clearTimeout(timer)},[toast])
  useEffect(()=>{
    const shortcut=(event)=>{
      if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable){event.preventDefault();searchRef.current?.focus()}
    }
    window.addEventListener('keydown',shortcut)
    return()=>window.removeEventListener('keydown',shortcut)
  },[])

  useEffect(()=>{
    if(!compareOpen)return undefined
    const previousFocus=document.activeElement
    const returnFocusTarget=compareTriggerRef.current??previousFocus
    const catalogElement=catalogRef.current
    compareCloseRef.current?.focus()
    const onKeyDown=(event)=>{
      if(event.key==='Escape'){
        event.preventDefault()
        setCompareOpen(false)
        return
      }
      if(event.key!=='Tab')return
      const focusable=Array.from(compareDialogRef.current?.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')??[]).filter((element)=>
        element instanceof HTMLElement &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-hidden')!=='true' &&
        element.getClientRects().length>0 &&
        getComputedStyle(element).visibility!=='hidden'
      )
      if(!focusable.length){event.preventDefault();compareDialogRef.current?.focus();return}
      const activeIndex=focusable.indexOf(document.activeElement)
      if(activeIndex===-1 || (event.shiftKey&&activeIndex===0) || (!event.shiftKey&&activeIndex===focusable.length-1)){
        event.preventDefault()
        const edge=event.shiftKey?focusable[focusable.length-1]:focusable[0]
        edge.focus()
      }
    }
    document.addEventListener('keydown',onKeyDown)
    return()=>{
      document.removeEventListener('keydown',onKeyDown)
      document.body.style.overflow=comparePreviousOverflowRef.current??''
      comparePreviousOverflowRef.current=null
      catalogElement?.removeAttribute('inert')
      catalogElement?.removeAttribute('aria-hidden')
      if(returnFocusTarget instanceof HTMLElement&&returnFocusTarget.isConnected){
        try { returnFocusTarget.focus({preventScroll:true}) } catch { returnFocusTarget.focus() }
      }
    }
  },[compareOpen])

  const openComparison=()=>{
    comparePreviousOverflowRef.current=document.body.style.overflow
    document.body.style.overflow='hidden'
    catalogRef.current?.setAttribute('inert','')
    catalogRef.current?.setAttribute('aria-hidden','true')
    setCompareOpen(true)
  }

  const patchParams=(mutate)=>setSearchParams((previous)=>{const next=new URLSearchParams(previous);mutate(next);return next},{replace:true})
  const setLinkReviewOnly=(enabled)=>patchParams((params)=>{if(enabled)params.set('link','review');else params.delete('link')})
  const handleQuery=(value)=>{setQuery(value);patchParams((params)=>{if(value)params.set('q',value);else params.delete('q')})}
  const pickCategory=(id)=>patchParams((params)=>{if(id==='all')params.delete('cat');else params.set('cat',id);params.delete('sub')})
  const setOffer=(id)=>patchParams((params)=>{if(id==='all')params.delete('offer');else params.set('offer',id)})
  const pickSub=(id)=>patchParams((params)=>{if(id==='all')params.delete('sub');else params.set('sub',id)})
  const setDeployed=(enabled)=>setSearchParams((previous)=>setDeployedOnlyParams(previous,enabled),{replace:true})
  const setSavedOnly=(enabled)=>setSearchParams((previous)=>setSavedOnlyParams(previous,enabled),{replace:true})
  const changeSort=(value)=>setSearchParams((previous)=>setCatalogSortParams(previous,value),{replace:true})
  const changeView=(value)=>{setViewFallback(value);setSearchParams((previous)=>setCatalogViewParams(previous,value),{replace:true})}
  const resetFilters=()=>{setQuery('');setSearchParams((previous)=>resetCatalogFiltersParams(previous),{replace:true})}
  const exploreRandom=()=>{
    const picked=pickRandomResource([...favorites,...recentIds])
    if(picked)navigate(`/wiki/${picked.id}/`)
  }

  const filtered=useMemo(()=>{
    const normalized=query.trim().toLowerCase()
    const result=resources.filter((resource)=>{
      if(deployedOnly&&!resource.deployed)return false
      if(favoritesOnly&&!favorites.includes(resource.id))return false
      if(linkOnly&&!resourceLinksNeedReview(resource.id,linkRows))return false
      if(activeCategory!=='all'&&resource.category!==activeCategory)return false
      if(activeSub!=='all'&&resource.sub_category!==activeSub)return false
      return matchesOfferFilter(resource.id,activeOffer)&&matchesSearch(resource,normalized)
    })
    if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))
    if(sort==='deployed')result.sort((a,b)=>Number(Boolean(b.deployed))-Number(Boolean(a.deployed)))
    if(sort==='recommended'&&normalized)result.sort((a,b)=>scoreSearch(b,normalized)-scoreSearch(a,normalized)||a.name.localeCompare(b.name,'zh-CN'))
    return result
  },[query,deployedOnly,favoritesOnly,favorites,linkOnly,linkRows,activeCategory,activeSub,activeOffer,sort])

  const handleFavoriteToggle=(id)=>{
    const saved=favorites.includes(id)
    toggleFavorite(id)
    setToast(saved?'已从收藏中移除':'已加入收藏')
  }
  const toggleCompare=(id)=>setCompareIds((previous)=>{
    if(previous.includes(id))return previous.filter((value)=>value!==id)
    if(previous.length>=3){setToast('最多同时比较 3 个资源');return previous}
    return [...previous,id]
  })
  const comparisons=compareIds.map((id)=>resources.find((resource)=>resource.id===id)).filter(Boolean)
  const hasActiveFilters=Boolean(query.trim()||activeCategory!=='all'||activeSub!=='all'||deployedOnly||activeOffer!=='all'||favoritesOnly||linkOnly)
  const filterCount=Number(activeCategory!=='all')+Number(activeSub!=='all')+Number(activeOffer!=='all')+Number(deployedOnly)+Number(favoritesOnly)+Number(linkOnly)
  const showFeaturedBuilds=!query.trim()&&activeCategory==='all'&&activeSub==='all'&&!deployedOnly&&activeOffer==='all'&&!favoritesOnly&&!linkOnly

  return (
    <div className="fa-discovery-shell">
    <div ref={catalogRef} className="fa-page-stack fa-discovery-page" inert={compareOpen} aria-hidden={compareOpen||undefined}>
      <section className="fa-discovery-hero">
        <PageHeader className="fa-discovery-heading" eyebrow="FOSS ATLAS / DISCOVER" title={<>找到真正值得用的<br/><span>开源工具与免费服务。</span></>} description="免费额度、公开 API、自部署软件。先找到合适的工具，再沿着 Wiki 和知识图谱深入了解。"/>
        <div className="fa-discovery-search-area">
          <label className="fa-discovery-search" htmlFor="catalog-search">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7.2"/><path d="m16.4 16.4 4.1 4.1" strokeLinecap="round"/></svg>
            <input id="catalog-search" ref={searchRef} aria-label="搜索资源" value={query} onChange={(event)=>handleQuery(event.target.value)} placeholder="搜索工具、用途、技术栈或域名…"/>
            {query?<button type="button" onClick={()=>handleQuery('')} aria-label="清空搜索">×</button>:<kbd>/</kbd>}
          </label>
          <p className="fa-search-caption"><span>搜索名称、描述、标签与免费方案 · 按 <kbd>/</kbd> 快速定位</span><button type="button" onClick={exploreRandom}>随便逛逛 <span aria-hidden="true">✦</span></button></p>
          <div className="fa-discovery-summary"><span><strong>{resources.length}</strong> 个资源</span><i/><span><strong>{deployedStats.resources}</strong> 个已自部署</span><i/><span><strong>{favorites.length}</strong> 个已收藏</span></div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[var(--text-faint)]" aria-live="polite">
            <span>官网 / 仓库巡检 · {linkFreshness.label} {linkSnapshot ? formatSnapshotAge(linkFreshness) : ''}</span>
            {linkSnapshot ? <span>需复核 {linkSummary.review} / {linkSummary.total} 条链接</span> : <span>尚无巡检快照</span>}
            <button type="button" aria-pressed={linkOnly} onClick={()=>setLinkReviewOnly(!linkOnly)} className={linkOnly?'text-[var(--accent-text)] underline underline-offset-2':'text-[var(--text-dim)] hover:text-[var(--accent-text)]'}>
              {linkOnly?'显示全部资源':'查看需复核链接 →'}
            </button>
            {linkFreshness.state==='stale' || linkFreshness.state==='aging' ? <span>数据仅代表上次巡检，不是实时状态</span> : null}
          </div>
        </div>
      </section>

      <section className="fa-discovery-toolbar" aria-label="目录工具栏">
        <div className="fa-quick-views">
          <button type="button" aria-pressed={!hasActiveFilters} className={!hasActiveFilters?'is-active':''} onClick={resetFilters}>全部资源 <span>{resources.length}</span></button>
          <button type="button" aria-pressed={deployedOnly} className={deployedOnly?'is-active':''} onClick={()=>setDeployed(!deployedOnly)}>已部署 <span>{deployedStats.resources}</span></button>
          <button type="button" aria-pressed={favoritesOnly} className={favoritesOnly?'is-active':''} onClick={()=>setSavedOnly(!favoritesOnly)}>我的收藏 <span>{favorites.length}</span></button>
        </div>
        <div className="fa-discovery-controls">
          <button type="button" className={filtersOpen||filterCount?'fa-filter-trigger is-active':'fa-filter-trigger'} aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={()=>setFiltersOpen(!filtersOpen)}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 5h14M5.5 10h9M8 15h4" strokeLinecap="round"/></svg>
            筛选{filterCount?<span>{filterCount}</span>:''}
          </button>
          <label className="fa-sort-control"><span>排序</span><select value={sort} onChange={(event)=>changeSort(event.target.value)}><option value="recommended">推荐</option><option value="name">名称 A–Z</option><option value="deployed">已部署优先</option></select></label>
          <div className="fa-view-switch" role="group" aria-label="显示方式">
            <button type="button" aria-label="卡片视图" title="卡片视图" aria-pressed={view==='grid'} className={view==='grid'?'is-active':''} onClick={()=>changeView('grid')}>▦</button>
            <button type="button" aria-label="列表视图" title="列表视图" aria-pressed={view==='list'} className={view==='list'?'is-active':''} onClick={()=>changeView('list')}>☷</button>
          </div>
          <Link to="/graph/" className="fa-discovery-graph-link">关系图 ↗</Link>
        </div>
      </section>

      {filtersOpen?<section id="catalog-filters" className="fa-discovery-filter-panel" aria-label="筛选资源">
        <label><span>资源分类</span><select value={activeCategory} onChange={(event)=>pickCategory(event.target.value)}><option value="all">全部分类</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}（{countByCategory[category.id]??0}）</option>)}</select></label>
        <label><span>免费方案</span><select value={activeOffer} onChange={(event)=>setOffer(event.target.value)}>{OFFER_FILTERS.map((filter)=><option key={filter.id} value={filter.id}>{filter.label}</option>)}</select></label>
        {subs.length?<label><span>细分领域</span><select value={activeSub} onChange={(event)=>pickSub(event.target.value)}><option value="all">全部子类</option>{subs.map((sub)=><option key={sub.id} value={sub.id}>{sub.name}（{countBySubCategory[sub.id]??0}）</option>)}</select></label>:null}
        <button type="button" className="fa-reset-filters" onClick={resetFilters}>清除条件</button>
      </section>:null}

      {hasActiveFilters?<div className="fa-active-filters"><span>当前条件</span>
        {query.trim()?<button type="button" onClick={()=>handleQuery('')}>搜索：{query.trim()} ×</button>:null}
        {activeCategory!=='all'?<button type="button" onClick={()=>pickCategory('all')}>{activeCategoryName} ×</button>:null}
        {activeSub!=='all'?<button type="button" onClick={()=>pickSub('all')}>{subs.find((item)=>item.id===activeSub)?.name??activeSub} ×</button>:null}
        {deployedOnly?<button type="button" onClick={()=>setDeployed(false)}>只看已部署 ×</button>:null}
        {activeOffer!=='all'?<button type="button" onClick={()=>setOffer('all')}>{OFFER_FILTERS.find((item)=>item.id===activeOffer)?.label} ×</button>:null}
        {favoritesOnly?<button type="button" onClick={()=>setSavedOnly(false)}>我的收藏 ×</button>:null}
        {linkOnly?<button type="button" onClick={()=>setLinkReviewOnly(false)}>官网需复核 ×</button>:null}
        <button type="button" className="fa-clear-all" onClick={resetFilters}>清除全部</button>
      </div>:null}

      <section className="fa-discovery-results">
        <SectionHeading eyebrow={activeCategoryName??(favoritesOnly?'SAVED RESOURCES':deployedOnly?'RUNNING SERVICES':'RESOURCE LIBRARY')} title={query.trim()?'搜索结果':activeCategoryName??(favoritesOnly?'我的收藏':deployedOnly?'已部署资源':'探索资源')} meta={filtered.length+' 项'} description={hasActiveFilters?'当前条件下的匹配结果。可以继续组合筛选，或打开 Wiki 查看详细信息。':'每张卡片都可以进入 Wiki 深入了解，也可以直接访问原始项目。'}/>
        {filtered.length?<>
          <div className={view==='grid'?'fa-resource-grid fa-discovery-grid':'fa-resource-grid fa-discovery-grid is-list'}>
            {filtered.slice(0,visibleCount).map((resource,index)=><ResourceCard key={resource.id} resource={resource} index={index} isFavorite={favorites.includes(resource.id)} isCompared={compareIds.includes(resource.id)} linkResult={linkRows.get(resource.id+':homepage')} repositoryLinkResult={linkRows.get(resource.id+':repository')} linkFreshness={linkFreshness} onFavorite={()=>handleFavoriteToggle(resource.id)} onCompare={()=>toggleCompare(resource.id)} view={view}/>)}
          </div>
          <div className="fa-discovery-load-more"><span>已显示 {Math.min(visibleCount,filtered.length)} / {filtered.length}</span>{filtered.length>visibleCount?<button type="button" onClick={()=>setVisibleCount((count)=>count+(matchMedia('(max-width: 639px)').matches?8:24))}>加载更多资源 <span>+{Math.min(24,filtered.length-visibleCount)}</span></button>:<span>已显示全部</span>}</div>
        </>:<div className="fa-discovery-empty"><strong>{favoritesOnly?'还没有收藏资源':'没有匹配的资源'}</strong><p>{favoritesOnly?'点击卡片上的星标，把常用工具留在这里。':'换个关键词，或者清除部分筛选条件再试试。'}</p><button type="button" onClick={resetFilters}>清除筛选</button></div>}
      </section>

      {showFeaturedBuilds?<section className="fa-discovery-featured"><FeaturedBuilds/></section>:null}
      <p className="fa-discovery-footer">想探索工具之间的联系？<Link to="/graph/">打开知识图谱 →</Link></p>
      {toast?<div className="fa-discovery-toast" role="status">{toast}</div>:null}
    </div>
      {compareIds.length?<div className="fa-compare-tray"><span><strong>{compareIds.length}</strong> / 3 个资源已选</span><div><button type="button" onClick={()=>setCompareIds([])}>清空</button><button ref={compareTriggerRef} type="button" className="fa-compare-primary" disabled={compareIds.length<2} onClick={openComparison}>比较所选 →</button></div></div>:null}
      {compareOpen?<div className="fa-compare-overlay">
        <button type="button" tabIndex={-1} aria-hidden="true" className="fa-compare-backdrop" onClick={()=>setCompareOpen(false)}/>
        <section ref={compareDialogRef} tabIndex={-1} className="fa-compare-dialog" role="dialog" aria-modal="true" aria-labelledby="fa-compare-title" aria-describedby="fa-compare-description">
          <header><div><p>RESOURCE COMPARISON</p><h2 id="fa-compare-title">资源比较</h2><p id="fa-compare-description" className="sr-only">比较所选资源的分类、免费方案、自部署状态和官网地址。按 Escape 关闭。</p></div><button ref={compareCloseRef} type="button" aria-label="关闭资源比较" onClick={()=>setCompareOpen(false)}>×</button></header>
          <div className="fa-compare-table-wrap"><table className="fa-compare-table"><tbody>
            <tr><th>对比项目</th>{comparisons.map((resource)=><th key={resource.id}><Link to={'/wiki/'+resource.id+'/'} onClick={()=>setCompareOpen(false)}>{resource.name}</Link></th>)}</tr>
            <tr><td>分类</td>{comparisons.map((resource)=><td key={resource.id}>{resource.category_name}</td>)}</tr>
            <tr><td>许可</td>{comparisons.map((resource)=>{const repo=repositoryByResource.get(resource.id);return <td key={resource.id}>{repo?(repo.license??'仓库未声明许可'):'暂无仓库数据'}</td>})}</tr>
            <tr><td>GitHub 社区</td>{comparisons.map((resource)=>{const repo=repositoryByResource.get(resource.id);return <td key={resource.id}>{repo?repo.stars.toLocaleString()+' Stars · '+repo.forks.toLocaleString()+' Forks':'暂无仓库数据'}</td>})}</tr>
            <tr><td>仓库状态</td>{comparisons.map((resource)=>{const repo=repositoryByResource.get(resource.id);return <td key={resource.id}>{repo?(repo.archived?'已归档':repo.disabled?'已停用':'未归档'):'暂无仓库数据'}</td>})}</tr>
            <tr><td>方案信息</td>{comparisons.map((resource)=>{const offering=getOffering(resource.id);return <td key={resource.id}>{offering?offering.shortLabel+' · 核验 '+(offering.verifiedAt??'日期未记录'):'暂无方案记录'}</td>})}</tr>
            <tr><td>自部署</td>{comparisons.map((resource)=><td key={resource.id}>{resource.deployed?'我的环境已有实例':'我的环境未记录实例'}</td>)}</tr>
            <tr><td>官网巡检</td>{comparisons.map((resource)=>{const row=linkRows.get(resource.id+':homepage');const status=resourceLinkPresentation(row);return <td key={resource.id}>{row?status.label+' · '+(row.code??'无 HTTP 码'):'暂无巡检数据'}{linkFreshness.state==='stale'?'（旧快照）':''}</td>})}</tr>
            <tr><td>仓库巡检</td>{comparisons.map((resource)=>{const row=linkRows.get(resource.id+':repository');const status=resourceLinkPresentation(row);return <td key={resource.id}>{row?status.label+' · '+(row.code??'无 HTTP 码'):'无已收录仓库 / 暂无数据'}{linkFreshness.state==='stale'?'（旧快照）':''}</td>})}</tr>
            <tr><td>官网</td>{comparisons.map((resource)=><td key={resource.id}><a href={resource.url} target="_blank" rel="noreferrer">访问 ↗</a></td>)}</tr>
          </tbody></table></div>
          <footer><span>免费额度与可用条件以服务商当前政策为准。</span><button type="button" onClick={()=>setCompareOpen(false)}>完成</button></footer>
        </section>
      </div>:null}
    </div>
  )
}
