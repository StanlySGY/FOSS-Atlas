import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ResourceCard from '../components/ResourceCard.jsx'
import { PageHeader, SectionHeading } from '../components/PageHeader.jsx'
import FeaturedBuilds from '../components/FeaturedBuilds.jsx'
import { OFFER_FILTERS, getOffering, matchesOfferFilter } from '../lib/offerings.js'
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
import { categories, countByCategory, countBySubCategory, deployedStats, pickRandomResource, resources, subCategoriesByCategory } from '../lib/data.js'

const FAVORITES_KEY = 'foss-atlas:favorites'
const VIEW_KEY = 'foss-atlas:catalog-view'
const readFavorites = () => {
  try { const value=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]'); return Array.isArray(value)?value.filter((id)=>typeof id==='string'):[] } catch { return [] }
}
const readView = () => { try { return localStorage.getItem(VIEW_KEY)==='list'?'list':'grid' } catch { return 'grid' } }
const matchesSearch = (resource,query) => {
  if (!query) return true
  const offer=getOffering(resource.id)
  return [resource.name,resource.description,resource.url,resource.category_name,resource.sub_category_name,...(resource.tags||[]),offer?.label,offer?.summary,...(offer?.conditions||[])].filter(Boolean).join(' ').toLowerCase().includes(query)
}

export default function Home() {
  const navigate = useNavigate()
  const [searchParams,setSearchParams]=useSearchParams()
  const searchRef=useRef(null)
  const compareTriggerRef=useRef(null)
  const compareDialogRef=useRef(null)
  const compareCloseRef=useRef(null)
  const [query,setQuery]=useState(()=>queryFromSearchParams(searchParams))
  const [visibleCount,setVisibleCount]=useState(24)
  const [filtersOpen,setFiltersOpen]=useState(false)
  const [favorites,setFavorites]=useState(readFavorites)
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
  useEffect(()=>{try{localStorage.setItem(FAVORITES_KEY,JSON.stringify(favorites))}catch{/* optional */}},[favorites])
  useEffect(()=>{try{localStorage.setItem(VIEW_KEY,view)}catch{/* optional */}},[view])
  useEffect(()=>{setVisibleCount(matchMedia('(max-width: 639px)').matches?8:24)},[query,activeCategory,activeSub,deployedOnly,activeOffer,favoritesOnly])
  useEffect(()=>{if(!toast)return undefined;const timer=setTimeout(()=>setToast(''),1800);return()=>clearTimeout(timer)},[toast])
  useEffect(()=>{
    const shortcut=(event)=>{
      if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable){event.preventDefault();searchRef.current?.focus()}
      if(event.key==='Escape'&&compareOpen)setCompareOpen(false)
    }
    window.addEventListener('keydown',shortcut)
    return()=>window.removeEventListener('keydown',shortcut)
  },[compareOpen])

  useEffect(()=>{
    if(!compareOpen)return undefined
    const previousFocus=document.activeElement
    const returnFocusTarget=compareTriggerRef.current??previousFocus
    compareCloseRef.current?.focus()
    const onKeyDown=(event)=>{
      if(event.key==='Escape'){
        event.preventDefault()
        setCompareOpen(false)
        return
      }
      if(event.key!=='Tab')return
      const focusable=compareDialogRef.current?.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')
      if(!focusable?.length){event.preventDefault();compareDialogRef.current?.focus();return}
      const first=focusable[0]
      const last=focusable[focusable.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    document.addEventListener('keydown',onKeyDown)
    return()=>{
      document.removeEventListener('keydown',onKeyDown)
      requestAnimationFrame(()=>{
        if(returnFocusTarget instanceof HTMLElement&&returnFocusTarget.isConnected)returnFocusTarget.focus()
      })
    }
  },[compareOpen])

  const patchParams=(mutate)=>setSearchParams((previous)=>{const next=new URLSearchParams(previous);mutate(next);return next},{replace:true})
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
    const picked=pickRandomResource(favorites)
    if(picked)navigate(`/wiki/${picked.id}/`)
  }

  const filtered=useMemo(()=>{
    const normalized=query.trim().toLowerCase()
    const result=resources.filter((resource)=>{
      if(deployedOnly&&!resource.deployed)return false
      if(favoritesOnly&&!favorites.includes(resource.id))return false
      if(activeCategory!=='all'&&resource.category!==activeCategory)return false
      if(activeSub!=='all'&&resource.sub_category!==activeSub)return false
      return matchesOfferFilter(resource.id,activeOffer)&&matchesSearch(resource,normalized)
    })
    if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))
    if(sort==='deployed')result.sort((a,b)=>Number(Boolean(b.deployed))-Number(Boolean(a.deployed)))
    return result
  },[query,deployedOnly,favoritesOnly,favorites,activeCategory,activeSub,activeOffer,sort])

  const toggleFavorite=(id)=>{
    const saved=favorites.includes(id)
    setFavorites((previous)=>saved?previous.filter((value)=>value!==id):[...previous,id])
    setToast(saved?'已从收藏中移除':'已加入收藏')
  }
  const toggleCompare=(id)=>setCompareIds((previous)=>{
    if(previous.includes(id))return previous.filter((value)=>value!==id)
    if(previous.length>=3){setToast('最多同时比较 3 个资源');return previous}
    return [...previous,id]
  })
  const comparisons=compareIds.map((id)=>resources.find((resource)=>resource.id===id)).filter(Boolean)
  const hasActiveFilters=Boolean(query.trim()||activeCategory!=='all'||activeSub!=='all'||deployedOnly||activeOffer!=='all'||favoritesOnly)
  const filterCount=Number(activeCategory!=='all')+Number(activeSub!=='all')+Number(activeOffer!=='all')+Number(deployedOnly)+Number(favoritesOnly)
  const showFeaturedBuilds=!query.trim()&&activeCategory==='all'&&activeSub==='all'&&!deployedOnly&&activeOffer==='all'&&!favoritesOnly

  return (
    <div className="fa-page-stack fa-discovery-page">
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
        <button type="button" className="fa-clear-all" onClick={resetFilters}>清除全部</button>
      </div>:null}

      <section className="fa-discovery-results">
        <SectionHeading eyebrow={activeCategoryName??(favoritesOnly?'SAVED RESOURCES':deployedOnly?'RUNNING SERVICES':'RESOURCE LIBRARY')} title={query.trim()?'搜索结果':activeCategoryName??(favoritesOnly?'我的收藏':deployedOnly?'已部署资源':'探索资源')} meta={filtered.length+' 项'} description={hasActiveFilters?'当前条件下的匹配结果。可以继续组合筛选，或打开 Wiki 查看详细信息。':'每张卡片都可以进入 Wiki 深入了解，也可以直接访问原始项目。'}/>
        {filtered.length?<>
          <div className={view==='grid'?'fa-resource-grid fa-discovery-grid':'fa-resource-grid fa-discovery-grid is-list'}>
            {filtered.slice(0,visibleCount).map((resource,index)=><ResourceCard key={resource.id} resource={resource} index={index} isFavorite={favorites.includes(resource.id)} isCompared={compareIds.includes(resource.id)} onFavorite={()=>toggleFavorite(resource.id)} onCompare={()=>toggleCompare(resource.id)} view={view}/>)}
          </div>
          <div className="fa-discovery-load-more"><span>已显示 {Math.min(visibleCount,filtered.length)} / {filtered.length}</span>{filtered.length>visibleCount?<button type="button" onClick={()=>setVisibleCount((count)=>count+(matchMedia('(max-width: 639px)').matches?8:24))}>加载更多资源 <span>+{Math.min(24,filtered.length-visibleCount)}</span></button>:<span>已显示全部</span>}</div>
        </>:<div className="fa-discovery-empty"><strong>{favoritesOnly?'还没有收藏资源':'没有匹配的资源'}</strong><p>{favoritesOnly?'点击卡片上的星标，把常用工具留在这里。':'换个关键词，或者清除部分筛选条件再试试。'}</p><button type="button" onClick={resetFilters}>清除筛选</button></div>}
      </section>

      {showFeaturedBuilds?<section className="fa-discovery-featured"><FeaturedBuilds/></section>:null}
      <p className="fa-discovery-footer">想探索工具之间的联系？<Link to="/graph/">打开知识图谱 →</Link></p>
      {toast?<div className="fa-discovery-toast" role="status">{toast}</div>:null}
      {compareIds.length?<div className="fa-compare-tray"><span><strong>{compareIds.length}</strong> / 3 个资源已选</span><div><button type="button" onClick={()=>setCompareIds([])}>清空</button><button ref={compareTriggerRef} type="button" className="fa-compare-primary" disabled={compareIds.length<2} onClick={()=>setCompareOpen(true)}>比较所选 →</button></div></div>:null}
      {compareOpen?<div className="fa-compare-overlay">
        <button type="button" tabIndex={-1} aria-hidden="true" className="fa-compare-backdrop" onClick={()=>setCompareOpen(false)}/>
        <section ref={compareDialogRef} tabIndex={-1} className="fa-compare-dialog" role="dialog" aria-modal="true" aria-labelledby="fa-compare-title" aria-describedby="fa-compare-description">
          <header><div><p>RESOURCE COMPARISON</p><h2 id="fa-compare-title">资源比较</h2><p id="fa-compare-description" className="sr-only">比较所选资源的分类、免费方案、自部署状态和官网地址。按 Escape 关闭。</p></div><button ref={compareCloseRef} type="button" aria-label="关闭资源比较" onClick={()=>setCompareOpen(false)}>×</button></header>
          <div className="fa-compare-table-wrap"><table className="fa-compare-table"><tbody>
            <tr><th>对比项目</th>{comparisons.map((resource)=><th key={resource.id}><Link to={'/wiki/'+resource.id+'/'} onClick={()=>setCompareOpen(false)}>{resource.name}</Link></th>)}</tr>
            <tr><td>分类</td>{comparisons.map((resource)=><td key={resource.id}>{resource.category_name}</td>)}</tr>
            <tr><td>免费方案</td>{comparisons.map((resource)=><td key={resource.id}>{getOffering(resource.id)?.label??'未标注'}</td>)}</tr>
            <tr><td>方案说明</td>{comparisons.map((resource)=><td key={resource.id}>{getOffering(resource.id)?.summary??'查看服务商说明'}</td>)}</tr>
            <tr><td>自部署</td>{comparisons.map((resource)=><td key={resource.id}>{resource.deployed?'已部署':'未部署'}</td>)}</tr>
            <tr><td>官网</td>{comparisons.map((resource)=><td key={resource.id}><a href={resource.url} target="_blank" rel="noreferrer">访问 ↗</a></td>)}</tr>
          </tbody></table></div>
          <footer><span>免费额度与可用条件以服务商当前政策为准。</span><button type="button" onClick={()=>setCompareOpen(false)}>完成</button></footer>
        </section>
      </div>:null}
    </div>
  )
}
