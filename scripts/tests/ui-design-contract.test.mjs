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

test('catalogue prioritizes search, normalizes filters, and progressively reveals results', () => {
  const home = read('src/pages/Home.jsx')
  assert.match(home, /className="fa-catalog-tools"/)
  assert.match(home, /className="fa-catalog-search/)
  assert.match(home, /useState\(24\)/)
  assert.match(home, /window\.matchMedia\('\(max-width: 639px\)'\)\.matches \? 8 : 24/)
  assert.match(home, /filtered\.slice\(0, visibleCount\)/)
  assert.match(home, /加载更多资源/)
  assert.ok(home.lastIndexOf('{showFeaturedBuilds ?') > home.indexOf('filtered.slice(0, visibleCount)'), 'featured builds should follow the resource results')
  assert.match(css, /\.fa-category-chip,[\s\S]*?\.fa-filter-chip[\s\S]*?min-height: 36px/)
})

test('graph filters are collapsed by default at every viewport while remaining explicit and accessible', () => {
  const graph = read('src/pages/GraphPage.jsx')
  assert.match(graph, /const \[filtersOpen, setFiltersOpen\] = useState\(false\)/)
  assert.match(graph, /aria-controls="graph-filter-panel"/)
  assert.match(graph, /id="graph-filter-panel" className=\{`\$\{filtersOpen \? 'flex' : 'hidden'\}/)
  assert.doesNotMatch(graph, /filtersOpen \? 'flex' : 'hidden'\}\s+flex-col gap-2 md:flex/)
  assert.match(graph, /单击节点看速览 · 拖动画布平移 · 滚轮缩放/)
})

test('Wiki reading layout gives medium-width screens a full article before metadata', () => {
  const wiki = read('src/pages/WikiPage.jsx')
  assert.match(wiki, /className="fa-wiki-content-grid"/)
  assert.match(wiki, /className="fa-wiki-meta pb-8 pt-2"/)
  assert.match(css, /@media \(min-width: 1280px\)[\s\S]*?\.fa-wiki-content-grid[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 280px/)
  assert.match(css, /@media \(min-width: 768px\) and \(max-width: 1279px\)[\s\S]*?\.fa-wiki-rail[\s\S]*?flex-basis: 220px/)
})
