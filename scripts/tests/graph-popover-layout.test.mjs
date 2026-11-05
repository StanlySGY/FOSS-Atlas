import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { graphPopoverLayout } from '../../src/lib/graphPopoverLayout.js'

const popoverComponent = readFileSync(new URL('../../src/components/GraphNodePopover.jsx', import.meta.url), 'utf8')

function assertInsideCanvas(layout, width, height, contentHeight) {
  assert.ok(layout.left >= 8, 'popover must keep its left margin')
  assert.ok(layout.top >= 8, 'popover must keep its top margin')
  assert.ok(layout.left + layout.width <= width - 8 + 0.001, 'popover must keep its right margin')
  assert.ok(layout.top + Math.min(contentHeight, layout.maxHeight) <= height - 8 + 0.001, 'popover must keep its bottom margin')
  assert.ok(layout.width <= 264, 'popover must not exceed its preferred width')
  assert.ok(layout.maxHeight <= height - 16, 'popover must fit within the canvas height')
}

test('node previews choose the available side near every canvas edge', () => {
  const size = { width: 900, height: 600 }
  const cases = [
    { x: 24, y: 24, width: size.width, height: size.height },
    { x: 870, y: 24, width: size.width, height: size.height },
    { x: 24, y: 570, width: size.width, height: size.height },
    { x: 870, y: 570, width: size.width, height: size.height },
  ]

  for (const point of cases) {
    const layout = graphPopoverLayout(point, 220)
    assertInsideCanvas(layout, size.width, size.height, 220)
  }

  assert.ok(graphPopoverLayout(cases[0], 220).left >= cases[0].x)
  assert.ok(graphPopoverLayout(cases[1], 220).left + 264 <= cases[1].x)
})

test('very tall previews are constrained to the canvas and become independently scrollable', () => {
  const point = { x: 430, y: 280, width: 900, height: 360 }
  const layout = graphPopoverLayout(point, 1200)
  assertInsideCanvas(layout, point.width, point.height, 1200)
  assert.equal(layout.maxHeight, 344)
  assert.ok(layout.flipped)
})

test('small canvases shrink the bubble rather than letting it escape horizontally', () => {
  const point = { x: 150, y: 80, width: 240, height: 180 }
  const layout = graphPopoverLayout(point, 500)
  assertInsideCanvas(layout, point.width, point.height, 500)
  assert.equal(layout.width, 224)
  assert.equal(layout.maxHeight, 164)
})

test('non-finite click coordinates fall back to the canvas centre', () => {
  const layout = graphPopoverLayout({ x: Number.NaN, y: Number.NaN, width: 800, height: 500 }, 180)
  assertInsideCanvas(layout, 800, 500, 180)
  assert.ok(Number.isFinite(layout.caretX))
})

test('the rendered popover applies the geometry cap and dismisses stale canvas coordinates on resize', () => {
  assert.match(popoverComponent, /maxHeight: layout\.maxHeight/)
  assert.match(popoverComponent, /overflowY: 'auto'/)
  assert.match(popoverComponent, /new ResizeObserver/)
  assert.match(popoverComponent, /if \(changed\) onDismiss\?\.\(\)/)
})
