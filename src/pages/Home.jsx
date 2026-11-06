import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard.jsx'
import useUserJourney from '../hooks/useUserJourney.js'
import { PageHeader, SectionHeading } from '../components/PageHeader.jsx'
import FeaturedBuilds from '../components/FeaturedBuilds.jsx'
import { OFFER_FILTERS, getOffering, matchesOfferFilter } from '../lib/offerings.js'
import ResourceComparison from '../components/ResourceComparison.jsx'
import useResourceComparison from '../hooks/useResourceComparison.js'
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
import { categories, countByCategory, countBySubCategory, deployedStats, pickRandomResource, resources, resourceSearchEntryFor, searchAliasesFor, subCategoriesByCategory } from '../lib/data.js'
import { scoreResourceSearch } from '../lib/resourceSearch.js'
import useResourceLinkSnapshot from '../hooks/useResourceLinkSnapshot.js'
import { formatSnapshotAge, resourceLinkFreshness, resourceLinkRowsByTarget } from '../lib/resourceLinkStatus.js'
import ResourceLinkReviewDesk from '../components/ResourceLinkReviewDesk.jsx'
import { appendResourceLinkReview, readResourceLinkReviews, resourceLinksNeedReview as resourceLinksNeedActiveReview, summarizeResourceLinkReviews } from '../lib/resourceLinkReviews.js'

const RESOURCE_IDS = new Set(resources.map((resource) => resource.id))
const VIEW_KEY = 'foss-atlas:catalog-view'
const readView = () => { try { return localStorage.getItem(VIEW_KEY)==='list'?'list':'grid' } catch { return 'grid' } }
const searchRecordFor = (resource) => {
  const entry=resourceSearchEntryFor(resource.id)
  const offer=getOffering(resource.id)
  let hostname=resource.url
  try { hostname=new URL(resource.url).hostname } catch {}
  return {
    name:resource.name, aliases:searchAliasesFor(resource.id), tags:resource.tags,
    description:resource.description, url:resource.url, hostname,
    category:resource.category_name, subCategory:resource.sub_category_name,
    summary:entry.summary, features:entry.features, scenarios:entry.scenarios, usage:entry.usage, keywords:entry.keywords,
    extra:[offer?.label,offer?.summary,...(offer?.conditions??[])].filter(Boolean),
  }
}
const scoreSearch = (resource,query) => scoreResourceSearch(query,searchRecordFor(resource))
const matchesSearch = (resource,query) => !query || scoreSearch(resource,query)>0

export default function Home() {
  const navigate = useNavigate()
  const [searchParams,setSearchParams]=useSearchParams()
  const searchRef=useRef(null)
  const [query,setQuery]=useState(()=>queryFromSearchParams(searchParams))
  const [visibleCount,setVisibleCount]=useState(24)
  const [pageSize,setPageSize]=useState(24)
  const resultsRef=useRef(null)
  const [filtersOpen,setFiltersOpen]=useState(false)
  const { favorites, recentIds, toggleFavorite } = useUserJourney(RESOURCE_IDS)
  const linkSnapshot = useResourceLinkSnapshot()
  const linkFreshness = resourceLinkFreshness(linkSnapshot)
  const linkRows = useMemo(() => resourceLinkRowsByTarget(linkSnapshot), [linkSnapshot])
  const [linkReviews, setLinkReviews] = useState(() => readResourceLinkReviews())
  const linkSummary = useMemo(() => summarizeResourceLinkReviews(linkSnapshot, linkReviews), [linkSnapshot, linkReviews])
  const linkOnly = searchParams.get('link') === 'review'
  const [viewFallback,setViewFallback]=useState(readView)
  const view=catalogViewFromSearchParams(searchParams,viewFallback)
  const sort=catalogSortFromSearchParams(searchParams)
  const comparison=useResourceComparison(searchParams,setSearchParams,RESOURCE_IDS)
  const compareIds=comparison.ids
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
  useEffect(()=>{
    const media=matchMedia('(max-width: 639px)')
    const update=()=>setPageSize(media.matches?8:24)
    update()
    media.addEventListener('change',update)
    return()=>media.removeEventListener('change',update)
  },[])
  useEffect(()=>{setVisibleCount(pageSize)},[query,activeCategory,activeSub,deployedOnly,activeOffer,favoritesOnly,linkOnly,pageSize])
  useEffect(()=>{if(!toast)return undefined;const timer=setTimeout(()=>setToast(''),1800);return()=>clearTimeout(timer)},[toast])
  useEffect(()=>{
    const shortcut=(event)=>{
      if(!document.querySelector('dialog[open]')&&event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable){event.preventDefault();searchRef.current?.focus()}
    }
    window.addEventListener('keydown',shortcut)
    return()=>window.removeEventListener('keydown',shortcut)
  },[])

  const patchParams=(mutate)=>setSearchParams((previous)=>{const next=new URLSearchParams(previous);mutate(next);return next},{replace:true})
  const setLinkReviewOnly=(enabled)=>{
    patchParams((params)=>{if(enabled)params.set('link','review');else params.delete('link')})
    if(enabled)requestAnimationFrame(()=>{
      resultsRef.current?.scrollIntoView({block:'start'})
      resultsRef.current?.focus({preventScroll:true})
    })
  }
  const saveLinkReview=(record)=>{const next=appendResourceLinkReview(record,linkReviews);if(!next){setToast('浏览器未能保存复核记录，请检查本地存储权限。');return false}setLinkReviews(next);setToast('复核记录已保存到当前浏览器');return true}
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
      if(linkOnly&&!resourceLinksNeedActiveReview(resource.id,linkRows,linkSnapshot,linkReviews))return false
      if(activeCategory!=='all'&&resource.category!==activeCategory)return false
      if(activeSub!=='all'&&resource.sub_category!==activeSub)return false
      return matchesOfferFilter(resource.id,activeOffer)&&matchesSearch(resource,normalized)
    })
    if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))
    if(sort==='deployed')result.sort((a,b)=>Number(Boolean(b.deployed))-Number(Boolean(a.deployed)))
    if(sort==='recommended'&&normalized)result.sort((a,b)=>scoreSearch(b,normalized)-scoreSearch(a,normalized)||a.name.localeCompare(b.name,'zh-CN'))
    return result
  },[query,deployedOnly,favoritesOnly,favorites,linkOnly,linkRows,linkSnapshot,linkReviews,activeCategory,activeSub,activeOffer,sort])

  const handleFavoriteToggle=(id)=>{
    const saved=favorites.includes(id)
    toggleFavorite(id)
    setToast(saved?'已从收藏中移除':'已加入收藏')
  }
  const toggleCompare=(id)=>{
    if(!compareIds.includes(id)&&compareIds.length>=3){setToast('最多同时比较 3 个资源，可在底部移除已选项');return}
    comparison.toggle(id)
  }
  const showAllFavorites=()=>{
    setQuery('')
    setSearchParams((previous)=>setSavedOnlyParams(resetCatalogFiltersParams(previous),true),{replace:true})
  }
  const searchIntent=(value)=>{
    setQuery(value)
    setSearchParams((previous)=>{
      const next=resetCatalogFiltersParams(previous)
      next.set('q',value)
      return next
    },{replace:true})
  }
  const loadMore=()=>{
    const firstNewIndex=visibleCount
    setVisibleCount((count)=>count+pageSize)
    requestAnimationFrame(()=>resultsRef.current?.querySelectorAll('.fa-resource-title')[firstNewIndex]?.focus({preventScroll:true}))
  }
  const comparisons=compareIds.map((id)=>resources.find((resource)=>resource.id===id)).filter(Boolean)
  const hasActiveFilters=Boolean(query.trim()||activeCategory!=='all'||activeSub!=='all'||deployedOnly||activeOffer!=='all'||favoritesOnly||linkOnly)
  const filterCount=Number(activeCategory!=='all')+Number(activeSub!=='all')+Number(activeOffer!=='all')+Number(deployedOnly)+Number(favoritesOnly)+Number(linkOnly)
  const showFeaturedBuilds=!query.trim()&&activeCategory==='all'&&activeSub==='all'&&!deployedOnly&&activeOffer==='all'&&!favoritesOnly&&!linkOnly

  return (
    <div className={compareIds.length ? "fa-discovery-shell has-comparison" : "fa-discovery-shell"}>
    <div className="fa-page-stack fa-discovery-page">
      <section className="fa-discovery-hero">
        <PageHeader className="fa-discovery-heading" title="开源工具与免费服务" description="按用途找工具，在 Wiki 了解用法与限制。"/>
        <div className="fa-discovery-search-area">
          <label className="fa-discovery-search" htmlFor="catalog-search">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7.2"/><path d="m16.4 16.4 4.1 4.1" strokeLinecap="round"/></svg>
            <input id="catalog-search" ref={searchRef} aria-label="搜索资源" value={query} onChange={(event)=>handleQuery(event.target.value)} type="search" autoComplete="off" placeholder="搜索工具、用途或域名…"/>
            {query?<button type="button" onClick={()=>{handleQuery('');searchRef.current?.focus()}} aria-label="清空搜索">×</button>:<kbd>/</kbd>}
          </label>
          <p className="fa-search-caption"><span>搜索名称、描述、标签与免费方案 · 按 <kbd>/</kbd> 快速定位</span><button type="button" onClick={exploreRandom}>随便逛逛 <span aria-hidden="true">✦</span></button></p>
          <div className="fa-discovery-intents" aria-label="按用途查找">
            <span>按用途找</span>
            {['密码管理','本地大模型','向量数据库','邮件发送'].map((intent)=><button key={intent} type="button" onClick={()=>searchIntent(intent)}>{intent}</button>)}
          </div>
        </div>
      </section>

      <section className={filtersOpen?"fa-discovery-toolbar filters-expanded":"fa-discovery-toolbar"} aria-label="目录工具栏">
        <div className="fa-quick-views">
          <button type="button" aria-pressed={!hasActiveFilters} className={!hasActiveFilters?'is-active':''} onClick={resetFilters}>全部资源 <span>{resources.length}</span></button>
          <button type="button" aria-pressed={deployedOnly} className={deployedOnly?'is-active':''} onClick={()=>setDeployed(!deployedOnly)}>已部署 <span>{deployedStats.resources}</span></button>
          <button type="button" aria-pressed={favoritesOnly} className={favoritesOnly?'is-active':''} onClick={()=>setSavedOnly(!favoritesOnly)}>我的收藏 <span>{favorites.length}</span></button>
        </div>
        <div className="fa-discovery-controls">
          <button type="button" className={filtersOpen||filterCount?'fa-filter-trigger is-active':'fa-filter-trigger'} aria-expanded={filtersOpen} aria-controls={filtersOpen?'catalog-filters':undefined} onClick={()=>setFiltersOpen(!filtersOpen)}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 5h14M5.5 10h9M8 15h4" strokeLinecap="round"/></svg>
            筛选{filterCount?<span>{filterCount}</span>:''}
          </button>
          <label className="fa-sort-control"><span>排序</span><select value={sort} onChange={(event)=>changeSort(event.target.value)}><option value="recommended">{query.trim()?'相关度':'目录顺序'}</option><option value="name">名称 A–Z</option><option value="deployed">已部署优先</option></select></label>
          <div className="fa-view-switch" role="group" aria-label="显示方式">
            <button type="button" aria-label="卡片视图" title="卡片视图" aria-pressed={view==='grid'} className={view==='grid'?'is-active':''} onClick={()=>changeView('grid')}>▦</button>
            <button type="button" aria-label="列表视图" title="列表视图" aria-pressed={view==='list'} className={view==='list'?'is-active':''} onClick={()=>changeView('list')}>☷</button>
          </div>
          <Link to="/graph/" className="fa-discovery-graph-link">关系图 ↗</Link>
        </div>
      </section>

      <section className="fa-category-browser" aria-label="按分类浏览">
        <label><span>资源分类</span><select value={activeCategory} onChange={(event)=>pickCategory(event.target.value)}><option value="all">全部分类</option>{categories.map((category)=><option key={category.id} value={category.id}>{category.name}（{countByCategory[category.id]??0}）</option>)}</select></label>
        {subs.length?<label><span>细分领域</span><select value={activeSub} onChange={(event)=>pickSub(event.target.value)}><option value="all">全部子类</option>{subs.map((sub)=><option key={sub.id} value={sub.id}>{sub.name}（{countBySubCategory[sub.id]??0}）</option>)}</select></label>:null}
      </section>

      {filtersOpen?<section id="catalog-filters" className="fa-discovery-filter-panel" aria-label="筛选资源">
        <label><span>使用方案</span><select value={activeOffer} onChange={(event)=>setOffer(event.target.value)}>{OFFER_FILTERS.map((filter)=><option key={filter.id} value={filter.id}>{filter.label}</option>)}</select></label>
        <button type="button" className="fa-reset-filters" onClick={resetFilters}>清除条件</button>
      </section>:null}

      {hasActiveFilters?<div className="fa-active-filters"><span>当前条件</span>
        {query.trim()?<button type="button" onClick={()=>handleQuery('')}>搜索：{query.trim()} ×</button>:null}
        {activeCategory!=='all'?<button type="button" onClick={()=>pickCategory('all')}>{activeCategoryName} ×</button>:null}
        {activeSub!=='all'?<button type="button" onClick={()=>pickSub('all')}>{subs.find((item)=>item.id===activeSub)?.name??activeSub} ×</button>:null}
        {deployedOnly?<button type="button" onClick={()=>setDeployed(false)}>只看已部署 ×</button>:null}
        {activeOffer!=='all'?<button type="button" onClick={()=>setOffer('all')}>{OFFER_FILTERS.find((item)=>item.id===activeOffer)?.label} ×</button>:null}
        {favoritesOnly?<button type="button" onClick={()=>setSavedOnly(false)}>我的收藏 ×</button>:null}
        {linkOnly?<button type="button" onClick={()=>setLinkReviewOnly(false)}>链接待复核 ×</button>:null}
        <button type="button" className="fa-clear-all" onClick={resetFilters}>清除全部</button>
      </div>:null}

      <section ref={resultsRef} tabIndex={-1} className="fa-discovery-results">
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{filtered.length} 个匹配资源，已显示 {Math.min(visibleCount,filtered.length)} 个。</p>
        <SectionHeading title={linkOnly?'链接复核工作台':query.trim()?'搜索结果':activeCategoryName??(favoritesOnly?'我的收藏':deployedOnly?'已部署资源':'探索资源')} meta={linkOnly?linkSummary.pending+' 条待处理目标':filtered.length+' 项'} description={linkOnly?'按官网与 GitHub 仓库分别处理，记录结论后由下一轮巡检确认是否恢复。':hasActiveFilters?'当前条件下的匹配结果。可以继续组合筛选，或打开 Wiki 查看详细信息。':'每张卡片都可以进入 Wiki 深入了解，也可以直接访问原始项目。'}/>
        {linkOnly?<ResourceLinkReviewDesk resources={filtered} snapshot={linkSnapshot} rowsByTarget={linkRows} reviews={linkReviews} onSave={saveLinkReview}/>:filtered.length?<>
          <div className={view==='grid'?'fa-resource-grid fa-discovery-grid':'fa-resource-grid fa-discovery-grid is-list'}>
            {filtered.slice(0,visibleCount).map((resource,index)=><ResourceCard key={resource.id} resource={resource} index={index} isFavorite={favorites.includes(resource.id)} isCompared={compareIds.includes(resource.id)} linkResult={linkRows.get(resource.id+':homepage')} repositoryLinkResult={linkRows.get(resource.id+':repository')} linkFreshness={linkFreshness} onFavorite={()=>handleFavoriteToggle(resource.id)} onCompare={()=>toggleCompare(resource.id)} view={view}/>)}
          </div>
          <div className="fa-discovery-load-more"><span>已显示 {Math.min(visibleCount,filtered.length)} / {filtered.length}</span>{filtered.length>visibleCount?<button type="button" onClick={loadMore}>加载更多资源 <span>+{Math.min(pageSize,filtered.length-visibleCount)}</span></button>:<span>已显示全部</span>}</div>
        </>:<div className="fa-discovery-empty">
          <strong>{favoritesOnly&&!favorites.length?'还没有收藏资源':favoritesOnly?'收藏中没有匹配的资源':'没有匹配的资源'}</strong>
          <p>{favoritesOnly&&!favorites.length?'点击卡片上的星标，把常用工具留在这里。':favoritesOnly?'你的收藏仍然保留，试着清除搜索和分类条件。':'换个关键词，或者清除部分筛选条件再试试。'}</p>
          <button type="button" onClick={favoritesOnly&&favorites.length?showAllFavorites:resetFilters}>{favoritesOnly?(favorites.length?'查看全部收藏':'去发现资源'):'清除筛选'}</button>
        </div>}
      </section>

      {favoritesOnly?<p className="fa-discovery-footer">收藏保存在当前浏览器，清理浏览器数据会移除收藏。</p>:null}
      {showFeaturedBuilds?<section className="fa-discovery-featured"><FeaturedBuilds/></section>:null}
      <details className="fa-catalog-maintenance">
        <summary>目录维护与链接巡检</summary>
          <div className="fa-catalog-maintenance-content" aria-live="polite">
            <span>官网 / 仓库巡检 · {linkFreshness.label} {linkSnapshot ? formatSnapshotAge(linkFreshness) : ''}</span>
            {linkSnapshot ? <span>待处理 {linkSummary.pending} / {linkSummary.total} 条链接{linkSummary.recorded ? ' · 已记录 ' + linkSummary.recorded + ' 次复核' : ''}</span> : null}
            <button type="button" aria-pressed={linkOnly} onClick={()=>setLinkReviewOnly(!linkOnly)} className={linkOnly?'text-[var(--accent-text)] underline underline-offset-2':'text-[var(--text-dim)] hover:text-[var(--accent-text)]'}>
              {linkOnly?'显示全部资源':'查看待处理链接 →'}
            </button>
            {linkFreshness.state==='stale' || linkFreshness.state==='aging' ? <span>数据仅代表上次巡检，不是实时状态</span> : null}
          </div>
      </details>
      <p className="fa-discovery-footer">想探索工具之间的联系？<Link to="/graph/">打开知识图谱 →</Link></p>
      {toast?<div className="fa-discovery-toast" role="status">{toast}</div>:null}
    </div>
      <ResourceComparison resources={comparisons} onRemove={comparison.remove} onClear={comparison.clear} linkRows={linkRows} linkFreshness={linkFreshness}/>
    </div>
  )
}
