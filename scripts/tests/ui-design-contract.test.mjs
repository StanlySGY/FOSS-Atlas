import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

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

test('the shared frame defines common title, section, surface and control tokens', () => {
  for (const token of [
    '--page-max: 1840px',
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
  assert.match(header, /className=\{\['fa-page-header'/)
  assert.match(header, /className=\{\['fa-section-heading'/)
})

test('full-width and Wiki workspaces align to the shared max-width frame', () => {
  assert.match(read('src/layouts/FullWidthLayout.jsx'), /fa-page-frame/)
  assert.match(read('src/layouts/SidebarLayout.jsx'), /fa-wiki-layout/)
  assert.match(css, /\.fa-wiki-layout[\s\S]*?width: min\(100%, var\(--page-max\)\)/)
  assert.match(css, /\.fa-wiki-rail[\s\S]*?width: 252px/)
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
  assert.match(home, /pickRandomResource\(favorites\)/)
})

test('resource comparison dialog moves focus inside, traps Tab, and restores focus on close', () => {
  const home = read('src/pages/Home.jsx')
  assert.match(home, /compareTriggerRef=useRef\(null\)/)
  assert.match(home, /compareDialogRef=useRef\(null\)/)
  assert.match(home, /compareCloseRef=useRef\(null\)/)
  assert.match(home, /compareCloseRef\.current\?\.focus\(\)/)
  assert.match(home, /event\.key==='Escape'[\s\S]*?setCompareOpen\(false\)/)
  assert.match(home, /event\.key!=='Tab'/)
  assert.match(home, /event\.shiftKey&&document\.activeElement===first/)
  assert.match(home, /!event\.shiftKey&&document\.activeElement===last/)
  assert.match(home, /returnFocusTarget\.isConnected\)returnFocusTarget\.focus\(\)/)
  assert.match(home, /role="dialog" aria-modal="true" aria-labelledby="fa-compare-title" aria-describedby="fa-compare-description"/)
  assert.match(home, /tabIndex=\{-1\} aria-hidden="true" className="fa-compare-backdrop"/)
  assert.match(home, /id="fa-compare-description" className="sr-only"/)
})

test('global switcher keeps recent Wiki visits locally and supports random discovery and keyboard focus management', () => {
  const layout = read('src/components/Layout.jsx')
  const palette = read('src/components/CommandPalette.jsx')
  const data = read('src/lib/data.js')
  assert.match(data, /RECENT_RESOURCES_KEY = 'foss-atlas:recent-resources'/)
  assert.match(layout, /RECENT_RESOURCES_KEY/)
  assert.match(palette, /RECENT_RESOURCES_KEY/)
  assert.match(layout, /rememberWikiVisit\(match\[1\]\)/)
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
})
