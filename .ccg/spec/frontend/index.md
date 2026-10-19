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
