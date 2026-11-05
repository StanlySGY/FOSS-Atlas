import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  graphLabelModeFromParams,
  setGraphLabelModeParams,
  shouldShowGraphLabel,
} from '../../src/lib/graphLabel.js'

const read = (path) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8')
const css = read('src/index.css')
const header = read('src/components/PageHeader.jsx')

test('all four routed views use the shared page header component', () => {
  for (const path of [
    'src/pages/Home.jsx',
    'src/pages/GraphPage.jsx',
    'src/pages/Deployed.jsx',
    'src/pages/WikiPage.jsx',
  ]) {
    const source = read(path)
    assert.match(source, /<PageHeader/, path + ' must use PageHeader')
    assert.match(source, /PageHeader\.jsx/, path + ' must import the shared component')
  }
})

test('skip navigation moves keyboard focus to the main content in both route shells', () => {
  const layout = read('src/components/Layout.jsx')
  const fullWidth = read('src/layouts/FullWidthLayout.jsx')
  const wiki = read('src/layouts/SidebarLayout.jsx')

  assert.match(layout, /href="#main" className="fa-skip"/)
  assert.match(fullWidth, /<main id="main" tabIndex=\{-1\}/)
  assert.match(wiki, /<main id="main" tabIndex=\{-1\}/)
})

test('the shared frame defines common title, section, surface and control tokens', () => {
  const redesign = read('src/redesign.css')
  for (const token of [
    '--page-gutter:',
    '--page-gap:',
    '.fa-page-header {',
    '.fa-page-title {',
    '.fa-section-heading {',
    '.fa-surface {',
    '.fa-surface-muted {',
    '.fa-control {',
    '.fa-stat-tile {',
  ]) assert.ok(css.includes(token), 'missing design-system token: ' + token)
  assert.match(redesign, /--page-max:100%/, 'the app frame must use the available browser width')
  assert.match(header, /className=\{\['fa-page-header'/)
  assert.match(header, /className=\{\['fa-section-heading'/)
})

test('full-width and Wiki workspaces align to the shared max-width frame', () => {
  assert.match(read('src/layouts/FullWidthLayout.jsx'), /fa-page-frame/)
  assert.match(read('src/layouts/SidebarLayout.jsx'), /fa-wiki-layout/)
  assert.match(css, /\.fa-wiki-layout[\s\S]*?width: min\(100%, var\(--page-max\)\)/)
  assert.match(css, /\.fa-wiki-rail[\s\S]*?width: 252px/)
})

test('large displays expand the workspace without widening long-form reading measure', () => {
  const redesign = read('src/redesign.css')
  const layout = read('src/components/Layout.jsx')
  const graph = read('src/pages/GraphPage.jsx')
  const deployed = read('src/pages/Deployed.jsx')
  const markdown = read('src/components/Markdown.jsx')

  assert.match(redesign, /--page-max:100%;--page-gutter:clamp\(18px,1\.6vw,36px\)/)
  assert.match(redesign, /\.fa-discovery-page\{width:100%;max-width:none/)
  assert.match(redesign, /\.fa-wiki-layout\{width:100%;max-width:none/)
  assert.match(layout, /w-full max-w-none/)
  assert.match(redesign, /min-width:1440px\).*fa-discovery-grid/)
  assert.match(redesign, /min-width:1920px\).*fa-discovery-grid/)
  assert.match(redesign, /min-width:2560px\).*fa-discovery-grid/)
  assert.match(graph, /2xl:h-\[min\(80vh,1280px\)\]/)
  assert.match(graph, /2xl:grid-cols-\[minmax\(0,1fr\)_320px\]/)
  assert.match(deployed, /lg:grid-cols-2 2xl:grid-cols-3/)
  assert.match(markdown, /max-w-\[78ch\]/, 'long-form Wiki text must retain a readable line length')
})

test('catalogue prioritizes search, discloses filters on demand, and progressively reveals results', () => {
  const home = read('src/pages/Home.jsx')
  const card = read('src/components/ResourceCard.jsx')
  const redesign = read('src/redesign.css')
  assert.match(home, /fa-discovery-search/)
  assert.match(home, /fa-discovery-toolbar/)
  assert.match(home, /aria-expanded=\{filtersOpen\}/)
  assert.match(home, /id="catalog-filters"/)
  assert.match(home, /useState\(24\)/)
  assert.ok(home.includes("matchMedia('(max-width: 639px)').matches"))
  assert.match(home, /filtered\.slice\(0,visibleCount\)/)
  assert.match(home, /加载更多资源/)
  assert.ok(home.lastIndexOf('{showFeaturedBuilds?') > home.indexOf('filtered.slice(0,visibleCount)'), 'featured builds should follow resource results')
  assert.match(redesign, /\.fa-discovery-hero/)
  assert.match(redesign, /\.fa-discovery-grid/)
  assert.match(card, /onFavorite/)
  assert.match(card, /onCompare/)
  assert.match(card, /DeployedBadge/)
  assert.match(home, /savedOnlyFromSearchParams/)
  assert.match(home, /setCatalogViewParams/)
  assert.match(home, /setCatalogSortParams/)
  assert.match(home, /aria-pressed=\{favoritesOnly\}/)
  assert.match(home, /onClick=\{\(\)=>setSavedOnly\(false\)\}>我的收藏/)
  assert.doesNotMatch(home, /setFavoritesOnly/)
  assert.match(home, /随便逛逛/)
  assert.match(home, /pickRandomResource\(\[\.\.\.favorites,\.\.\.recentIds\]\)/)
})

test('resource comparison dialog moves focus inside, traps Tab, and restores focus on close', () => {
  const home = read('src/pages/Home.jsx')
  assert.match(home, /compareTriggerRef=useRef\(null\)/)
  assert.match(home, /compareDialogRef=useRef\(null\)/)
  assert.match(home, /compareCloseRef=useRef\(null\)/)
  assert.match(home, /compareCloseRef\.current\?\.focus\(\)/)
  assert.match(home, /const openComparison=\(\)=>\{[\s\S]*document\.body\.style\.overflow='hidden'[\s\S]*catalogRef\.current\?\.setAttribute\('inert',''\)[\s\S]*catalogRef\.current\?\.setAttribute\('aria-hidden','true'\)[\s\S]*setCompareOpen\(true\)/, 'background isolation and scroll lock must be applied synchronously with the opening action')
  assert.match(home, /event\.key==='Escape'[\s\S]*?setCompareOpen\(false\)/)
  assert.match(home, /event\.key!=='Tab'/)
  assert.match(home, /Array\.from\(compareDialogRef\.current\?\.querySelectorAll[\s\S]*?getClientRects\(\)\.length>0/, 'only visible focus targets should participate in the focus loop')
  assert.match(home, /const activeIndex=focusable\.indexOf\(document\.activeElement\)/)
  assert.match(home, /activeIndex===-1 \|\| \(event\.shiftKey&&activeIndex===0\) \|\| \(!event\.shiftKey&&activeIndex===focusable\.length-1\)/)
  assert.match(home, /const edge=event\.shiftKey\?focusable\[focusable\.length-1\]:focusable\[0\]/)
  assert.match(home, /document\.body\.style\.overflow='hidden'/, 'the page must not scroll behind the open modal')
  assert.match(home, /document\.body\.style\.overflow=comparePreviousOverflowRef\.current\?\?''/, 'the prior scroll setting must be restored on close')
  assert.match(home, /returnFocusTarget\.isConnected\)[\s\S]*returnFocusTarget\.focus\(\{preventScroll:true\}\)/)
  assert.match(home, /className="fa-page-stack fa-discovery-page" inert=\{compareOpen\} aria-hidden=\{compareOpen\|\|undefined\}/, 'background content must be inert and hidden from assistive technology while the modal is open')
  assert.match(home, /<\/div>\s*\{compareIds\.length\?<div className="fa-compare-tray"/, 'the return-focus trigger must remain outside the inert background')
  assert.match(home, /role="dialog" aria-modal="true" aria-labelledby="fa-compare-title" aria-describedby="fa-compare-description"/)
  assert.match(home, /tabIndex=\{-1\} aria-hidden="true" className="fa-compare-backdrop"/)
  assert.match(home, /id="fa-compare-description" className="sr-only"/)
})

test('global switcher keeps recent Wiki visits locally and supports random discovery and keyboard focus management', () => {
  const layout = read('src/components/Layout.jsx')
  const palette = read('src/components/CommandPalette.jsx')
  const journey = read('src/lib/userJourney.js')
  const data = read('src/lib/data.js')
  assert.match(journey, /RECENT_RESOURCES_KEY = 'foss-atlas:recent-resources'/)
  assert.match(layout, /rememberResourceRead\(match\[1\]/)
  assert.match(palette, /readLastWikiReading/)
  assert.match(palette, /继续上次/)
  assert.match(layout, /location\.pathname !== '\/'/)
  assert.match(palette, /最近阅读/)
  assert.match(palette, /快速操作/)
  assert.match(palette, /action: 'random'/)
  assert.match(palette, /aria-activedescendant=/)
  assert.match(palette, /event\.key === 'Tab'/)
  assert.match(palette, /onFocus=\{\(\) => setActive\(i\)\}/)
  assert.match(palette, /terms\.every/)
  assert.match(data, /export function pickRandomResource/)
})

test('Wiki code fences expose copy feedback without changing Markdown content', () => {
  const markdown = read('src/components/Markdown.jsx')
  assert.match(markdown, /tabIndex=\{-1\}/, 'Wiki heading anchors must receive programmatic focus after TOC navigation')
  assert.match(markdown, /headingSlug\(textOf\(props\.children\), seen\)/)
  assert.match(markdown, /navigator\.clipboard\.writeText\(source\)/)
  assert.match(markdown, /fa-code-copy/)
  assert.match(markdown, /复制失败/)
  assert.match(markdown, /代码复制失败/)
  assert.match(css, /\.fa-markdown-code pre/)
  assert.match(css, /\.fa-code-copy:focus-visible/)
  assert.match(css, /\.fa-command-panel/)
  assert.match(css, /\.fa-favorite-button\.is-saved/)
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?\.fa-command-palette/)
})
test('graph filters are collapsed by default at every viewport while remaining explicit and accessible', () => {
  const graph = read('src/pages/GraphPage.jsx')
  const graphView = read('src/components/GraphView.jsx')
  const redesign = read('src/redesign.css')
  assert.match(graph, /const \[filtersOpen, setFiltersOpen\] = useState\(false\)/)
  assert.match(graph, /aria-controls="graph-filter-panel"/)
  assert.match(graph, /id="graph-filter-panel" className=\{`\$\{filtersOpen \? 'flex' : 'hidden'\}/)
  assert.doesNotMatch(graph, /filtersOpen \? 'flex' : 'hidden'\}\s+flex-col gap-2 md:flex/)
  assert.match(graph, /单击节点看速览 · 拖动画布平移 · 滚轮缩放/)
  assert.match(graph, /<details className="fa-disclosure fa-surface p-3\.5">/)
  assert.match(graph, /操作说明/)
  assert.match(graph, /局部关系图深度/)
  assert.match(graph, /返回全局图/)
  assert.match(graph, /localNodeId: localNode\?\.id/)
  assert.match(graph, /fa-graph-filter-groups/)
  assert.match(graph, /fa-graph-filter-group--categories/)
  assert.match(graph, /fa-graph-filter-group--deployed/)
  assert.match(graph, /fa-graph-filter-group--relations/)
  assert.match(graph, /fa-graph-filter-group--labels/)
  assert.match(graph, /GRAPH_LABEL_MODES/)
  assert.match(graph, /graphLabelModeFromParams/)
  assert.match(graph, /emphasizeTagEdges/)
  assert.match(graphView, /mode: labelMode/)
  assert.match(graphView, /emphasizeTagEdges \? 0\.65 : meta\.width/)
  assert.match(redesign, /\.fa-graph-filter-group--labels\{grid-column:1\/-1/)
  assert.match(graph, /fa-graph-workspace/)
  assert.match(graph, /fa-graph-aside/)
  assert.match(redesign, /min-width:1920px\)[\s\S]*?\.fa-graph-filter-groups\{grid-template-columns/)
  assert.match(redesign, /min-width:2560px\)[\s\S]*?\.fa-graph-workspace\{grid-template-columns:minmax\(0,1fr\) 360px\}/)
  assert.match(redesign, /@media\(min-width:1920px\)[\s\S]*?\.fa-graph-toolbar,\.fa-graph-workspace\{margin-top:-12px\}/)
  assert.match(redesign, /\.fa-graph-canvas\{height:min\(calc\(100vh - 350px\),1600px\)\}/)
  assert.match(read('src/components/GraphNodePopover.jsx'), /查看此节点的局部关系图/)
  assert.match(read('src/components/GraphNodeList.jsx'), /以此节点为中心查看局部关系图/)
})

test('deployed services are searchable, filterable, and grouped behind progressive disclosure', () => {
  const deployed = read('src/pages/Deployed.jsx')
  assert.match(deployed, /aria-label="搜索自部署服务"/)
  assert.match(deployed, /aria-label="按连通性筛选"/)
  assert.match(deployed, /aria-label="按部署位置筛选"/)
  assert.match(deployed, /matchesDeploymentStatus\(result, statusFilter\)/)
  assert.match(deployed, /aria-expanded=\{isExpanded\}/)
  assert.match(deployed, /disabled=\{hasActiveFilters\}/)
  assert.match(deployed, /<div id=\{panelId\} hidden=\{!isExpanded\}/)
  assert.match(deployed, /展开全部分组/)
  assert.match(deployed, /运行与运维说明/)
  assert.match(deployed, /setFragmentTarget\(id\)/)
  assert.match(deployed, /useSearchParams/)
  assert.match(deployed, /deployedFiltersFromSearchParams/)
  assert.match(deployed, /setDeployedFilterParam/)
})

test('ultra-wide deployed filters use a three-column workspace while narrower screens retain the stacked layout', () => {
  const deployed = read('src/pages/Deployed.jsx')
  const redesign = read('src/redesign.css')

  for (const className of [
    'fa-deployed-filter-content',
    'fa-deployed-filter-header',
    'fa-deployed-search',
    'fa-deployed-filter-group--status',
    'fa-deployed-filter-group--location',
    'fa-deployed-filter-footer',
  ]) assert.ok(deployed.includes(className), 'missing deployed filter layout hook: ' + className)

  assert.match(redesign, /@media\(min-width:1920px\)[\s\S]*?\.fa-deployed-filter-content\{display:grid;grid-template-columns:minmax\(320px,.85fr\) minmax\(500px,1.15fr\) minmax\(420px,1fr\)/)
  assert.match(redesign, /\.fa-deployed-filter-group\{min-width:0;align-self:start\}/)
  assert.match(redesign, /\.fa-deployed-filter-header,\.fa-deployed-filter-footer\{grid-column:1\/-1\}/)
  assert.match(redesign, /@media\(min-width:2560px\)[\s\S]*?\.fa-deployed-filter-content\{grid-template-columns:minmax\(360px,.85fr\) minmax\(600px,1.15fr\) minmax\(480px,1fr\)/)
})

test('Wiki reading layout gives medium-width screens a full article before metadata', () => {
  const wiki = read('src/pages/WikiPage.jsx')
  assert.match(wiki, /className="fa-wiki-content-grid"/)
  assert.match(wiki, /className="fa-wiki-meta pb-8 pt-2"/)
  assert.match(css, /@media \(min-width: 1280px\)[\s\S]*?\.fa-wiki-content-grid[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 280px/)
  assert.match(css, /@media \(min-width: 768px\) and \(max-width: 1279px\)[\s\S]*?\.fa-wiki-rail[\s\S]*?flex-basis: 220px/)
  assert.match(wiki, /更多信息与关联/)
  assert.match(wiki, /在知识图谱中查看/)
  assert.match(wiki, /fa-wiki-reading-progress/)
  assert.match(wiki, /fa-wiki-toc-compact/)
  assert.match(wiki, /aria-label="继续阅读"/)
  assert.match(wiki, /上一篇/)
  assert.match(wiki, /下一篇/)
  assert.match(css, /\.fa-wiki-page-toc-panel/)
  assert.match(css, /\.fa-wiki-page-nav-links/)
  assert.match(wiki, /desktopTocRef/)
  assert.match(wiki, /fa-wiki-toc-position/)
  assert.match(wiki, /container\.scrollTop/)
  assert.match(wiki, /window\.requestAnimationFrame/)
  assert.match(wiki, /addEventListener\('scroll', scheduleUpdate/)
  assert.match(wiki, /targets\.filter\(\(target\) => target\.getBoundingClientRect\(\)\.top <= 112\)/)
  assert.match(wiki, /container\.scrollHeight - container\.clientHeight/)
  assert.match(css, /\.fa-wiki-toc-position/)
  assert.match(css, /\.fa-wiki-meta[\s\S]*?max-height: calc\(100vh - var\(--header-h\) - 32px\)/)
  assert.match(css, /\.fa-wiki-meta[\s\S]*?overflow-y: auto/)
  const redesign = read('src/redesign.css')
  assert.match(redesign, /min-width:1920px\)[\s\S]*?\.fa-wiki-rail\{width:280px;flex-basis:280px\}/)
  assert.match(redesign, /min-width:2560px\)[\s\S]*?\.fa-wiki-content-grid\{grid-template-columns:minmax\(0,1fr\) 360px/)
})

test('graph label density modes are deterministic and URL-backed', () => {
  assert.equal(shouldShowGraphLabel({ type: 'category' }), true)
  assert.equal(shouldShowGraphLabel({ type: 'tool' }), false)
  assert.equal(shouldShowGraphLabel({ type: 'tool' }, { focused: true }), true)
  assert.equal(shouldShowGraphLabel({ type: 'tool' }, { hidden: true, focused: true }), false)

  for (const type of ['category', 'subcategory', 'own', 'external']) {
    assert.equal(shouldShowGraphLabel({ type }, { mode: 'key' }), true)
  }
  for (const type of ['tool', 'tag']) {
    assert.equal(shouldShowGraphLabel({ type }, { mode: 'key' }), false)
    assert.equal(shouldShowGraphLabel({ type }, { mode: 'all' }), true)
  }

  const original = new URLSearchParams()
  original.set('cat', 'ai')
  original.set('focus', 'resource-1')
  const key = setGraphLabelModeParams(original, 'key')
  assert.equal(graphLabelModeFromParams(key), 'key')
  assert.equal(key.get('cat'), 'ai')
  assert.equal(key.get('focus'), 'resource-1')
  assert.equal(graphLabelModeFromParams(new URLSearchParams('labels=unknown')), 'category')

  const reset = setGraphLabelModeParams(key, 'category')
  assert.equal(reset.has('labels'), false)
  assert.equal(reset.get('cat'), 'ai')
  assert.equal(original.has('labels'), false)
})
