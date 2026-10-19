# Frontend conventions — FOSS-Atlas

## ECharts `graph` with `setOption(..., { notMerge: true })`

Measured on the built bundle, not inferred. Three separate behaviours, all of
which bite when you try to drive the view imperatively:

1. **The view is rebuilt.** The roam transform (pan + zoom) is discarded on
   every `notMerge` call, even if the option does not mention `center`/`zoom`.
   Anything written with a `graphRoam` dispatch is gone after the next
   `setOption`.
2. **The simulation re-seeds.** `layout: 'force'` re-runs from a fresh random
   seed, so every node moves. Filtering edges therefore scatters the graph
   unless the coordinates are pinned.
3. **Read-backs are unreliable immediately after.** `getRoamTransform().scaleX`
   can report `1` while the transform is being rebuilt.

Consequences:

- To frame a node, **declare** `series.center` + `series.zoom` in the option.
  Do not dispatch `graphRoam` and do not do relative zoom arithmetic — a
  relative zoom applied from a stale read compounds on every re-render.
- For a stable graph, run the simulation once, capture
  `getData().getItemLayout(i)` for every node, then re-apply with
  `layout: 'none'` and per-node `x`/`y`. Dragging still works in `'none'`.
- `getItemLayout` is written asynchronously, node by node. Poll it (~30ms) and
  require every node to be finite before capturing, rather than waiting a
  fixed delay.

## Colour-based verification of a canvas chart

`GraphView` marks the focused node with `#f5f0e6`, a warm white no other node
uses (`#f0b429` is the category colour, so an accent-only highlight on an
orange node would be invisible). This makes the framing testable without a
snapshot library: read the canvas back with `getImageData`, keep pixels where
`r-b >= 15` — that excludes the neutral `#fff` labels and the `#f2f4f5`
emphasis label — and compare their centroid against the canvas centre, and the
pixel count across renders.

## Generated files

- `public/wiki/*.md` and `src/data/*.json` come from `scripts/`, and
  `npm run build` refreshes the wikis before bundling so CI cannot ship stale
  pages. Never hand-edit a generated page; either add prose to
  `scripts/wiki-content/*.mjs` or register the id in `CURATED`.
- `[[Tool Name]]` must match a `name` in `resources.json` exactly, or the link
  degrades to a site search.

## Hover dimming (`emphasis.focus: 'adjacency'`)

Measured on the built bundle (ECharts 6.1.0, 262 nodes / 578 edges).

- Put the dimming in the series-level **`blur` state** — `blur.itemStyle.opacity`,
  `blur.lineStyle.opacity`, `blur.label.opacity`. One series-level block covers
  **nodes, edges and labels**; per-datum `blur` is redundant because every item
  falls back to the series model. With `opacity: 0.2` the measured element states
  after a real hover are 570/578 edges, 253/267 nodes and 72/72 labels carrying
  `currentStates === ['blur']` and `style.opacity === 0.2`; only the hovered node,
  its adjacent nodes and their incident edges stay at their normal style.
- Leave `emphasis.focus: 'adjacency'` alone and do **not** call `setOption` to
  dim: see the constraint above — a hover that re-applies the option would reset
  the reader's pan/zoom on every mouse move.
- `emphasis.lineStyle.width` only widens the hovered element itself, not the
  adjacent edges.

### Verifying state styling

Read the zrender tree, not pixels:
`chart.getZr().storage.getDisplayList()` then `el.currentStates` / `el.style.opacity`.
Pixel-luminance metrics mislead here: most nodes are filled `#101314` on a
`#0d1112` canvas, so dimming them barely moves the mean, and labels dimmed to
`0.2` land at luminance ~45 — above any loose "bright pixel" threshold. A flat
pixel metric can report "no dimming" while every element is correctly blurred.

## Interaction events on a `graph` series

- `chart.on('click')` fires **only** when the pointer hits an element. A click on
  empty canvas reaches `chart.getZr().on('click')` with `e.target === null` — the
  only place to hear "click outside", e.g. to dismiss a popover.
- `chart.on('dblclick')` fires with the node payload. ECharts emits `click` before
  `dblclick`, so a double click opens (and then navigates away from) a popover;
  there is no built-in gesture arbitration.
- The roam event is **`graphroam`** (also emitted by a programmatic
  `dispatchAction({ type: 'graphRoam' })`). It fires for wheel zoom and drag pan.
- zrender suppresses `click` after a drag, so dragging a node does not fire a
  spurious click — no manual mousedown→mouseup distance threshold is needed.
- `params.event.offsetX/offsetY` are canvas-relative, so a DOM overlay rendered as
  a sibling inside a `relative` wrapper is positioned exactly with them.

## Coordinate and view read-backs

- `chart.convertToPixel({ seriesIndex: 0 }, [node.x, node.y])` reliably maps the
  frozen `layout: 'none'` coordinates to canvas pixels. Unlike
  `getRoamTransform()` it survives an option re-apply.
- `getOption().series[0].zoom` / `.center` are updated by roam, so they are the
  right way to assert "the view did not reset" in a test.
- The force simulation re-seeds from `Math.random` on every page load, so node
  positions differ between reloads. Tests must locate nodes with
  `convertToPixel` (and optionally `getZr().handler.findHover`) instead of
  hard-coded coordinates.

## Known pre-existing issue (not introduced by the popover work)

Navigating **away** from a page that owns a chart throws
`Cannot read properties of null (reading '0')` from ECharts'
`createViewCoordSysSimply` → `viewCoordSysSetViewRect` → `legacyCopyOverallTrans`.
Reproduced on the commit before the interaction refactor, in the production
bundle. The container collapses during unmount while the `ResizeObserver` still
issues `chart.resize()`, which re-creates the view coord system against a null
rect. Guarding the observer callback on a non-zero container size is the
suspected fix; it is deliberately left out of scope.

## Click-to-peek popover (`GraphNodePopover`)

The bubble is a React DOM overlay, not an ECharts tooltip, so its button is a real
focusable/tappable element and no click can leak to the canvas underneath. Three
details are load-bearing:

- **Measure the bubble, never estimate it.** Placement flips above the node when
  `height + nodeY + GAP > canvasHeight`. With the constant estimate (172px) the
  bubble flips ~8px too early for a 164px bubble with a short description, and —
  worse — flips too *late* for a long one (45 CJK chars reach ~200px), which
  would push the CTA outside the card's `overflow-hidden` clip. `useLayoutEffect`
  + `getBoundingClientRect()` corrects the value before paint, so there is no
  visible jump. Verified by holding the viewport steady and finding five nodes
  where `estimateFlip !== measuredFlip` (`casaos`, `google-ai-api`, `litellm`,
  `woodpecker`, `drone`): every one followed the measured formula.
- **Dismiss on any non-node click.** `chart.on('click')` also fires for edges
  (`dataType: 'edge'`) and for the legend (`componentType: 'legend'`,
  `dataType: null`), so the handler dismisses unless `dataType === 'node'`.
  `chart.getZr().on('click')` handles only the empty-canvas case (`e.target === null`).
- **A `role="dialog"` needs focus.** Focus the bubble on open (`tabIndex={-1}` +
  `outline-none`) and restore `document.activeElement` on unmount, otherwise
  Escape-to-close is the only keyboard affordance and screen readers never
  announce the bubble. Note the canvas is not focusable, so "restore" normally
  means `<body>`.

Touch parity was confirmed in a `hasTouch` context at 390x844: `touchscreen.tap`
on a node opens the bubble, tapping the CTA navigates, tapping blank canvas
dismisses.

### Testing note: mouse coordinates must be on-screen

`page.mouse.wheel` silently does nothing when the requested point falls outside
the viewport — the wheel handler never fires and the roam event never appears,
which reads exactly like "roam is broken". Assert on a native `wheel` listener
before concluding anything about `graphroam`, and derive the point from the
canvas `getBoundingClientRect()` rather than assuming a viewport size.
