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
