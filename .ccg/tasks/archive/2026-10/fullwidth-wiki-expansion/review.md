# Review — full-width layout, 165 wikis, graph focus deep link

Scope: the five tasks (full-width layout, article de-duplication, empty
backlink panel, `?focus=` graph deep link, wiki generation) plus the follow-up
round after the first review.

## Process deviation (worth recording)

`AGENTS.md` asks M+ work to be analysed and reviewed by **two external models**
through `codeagent-wrapper`. That wrapper is not usable in this session, so the
analysis/review pairs were run as **Codex subagents** instead:

| Role | Wrapper role that would have been used | What actually ran |
| --- | --- | --- |
| Data-integrity review | `claude/reviewer` | subagent **Hooke** |
| Code review | `antigravity/reviewer` | subagent **Arendt** |

Both were launched with `fork_turns="none"` and a self-contained brief. The
substitution preserves the two-independent-readers property (different
reviewers, different focus) but loses the *cross-model* part — the same model
family reviewed its own work. Treat the findings as one viewpoint, not two.

## What the reviewers found

**Data integrity (Hooke)** — structural assertions A–F all held. Warnings:
`generated_at` in `graph.json` churns on every run; five prose entries were
being loaded and then skipped because those ids are curated; `writeFileSync`
left no "generated, do not edit" marker. Info: orphan pages are not indexed,
two slug tables must stay in sync, the fallback copy was imprecise.

**Code (Arendt)** — one Critical: the `?focus=` effect depended on `option`, so
every relation-filter toggle re-ran the framing and **compounded the zoom
(×2.2 per toggle) until `scaleLimit.max`, while discarding the reader's pan**.
Warnings: the leading-blockquote strip only handled single-line quotes; the
mobile drawer did not react to crossing the `md` breakpoint (leaving `body`
scroll-locked and the Tab trap pointing at a `display:none` node); README
numbers disagreed with the code.

## The Critical, and what it actually was

The first fix was the obvious one: guard the effect so it applies once per
`focusId`. That guard held (`applies: 1` across toggles, zoom read back as
2.2 every time, never compounding) — but the behaviour was still wrong, and
the reason turned out to be different from the reported one.

Measured on the built bundle, with the guard in place:

```
initial      focus pixels 1456, centroid 1px from canvas centre
after toggle focus pixels    0                      <- node left the viewport
```

`setOption(option, { notMerge: true })` rebuilds the graph **view**, so the
roam transform is discarded on every filter toggle; the force simulation is
re-seeded from a fresh random seed at the same time, so the graph also scatters.
The guard was correct and pointless at once: it prevented the compounding, and
nothing re-framed the node that the rebuild had just thrown away.

Confirmed by experiment rather than inference: zooming the canvas by hand and
then toggling a filter returned the view to exactly the pre-zoom state
(`1456/52x52/centre` → `643/28x29/off-centre` → back to the identical
`643/28x29` bitmap), which is only consistent with the view being rebuilt.

### Fix

Stop dispatching roam actions and declare the framing instead:

- the force simulation runs **once**; the settled coordinates are captured into
  the data as `x`/`y` and the series switches to `layout: 'none'`
- `series.center` + `series.zoom` carry the focus framing, so every
  `setOption` re-applies the same view — no relative zoom, so nothing can
  compound
- the imperative effect, `appliedFocusRef` and the retry loop are gone

### Evidence after the fix (1920x1080, `/graph?focus=ollama`, built bundle)

| | initial | toggle 1 | toggle 2 | toggle 3 |
| --- | --- | --- | --- | --- |
| focus pixels | 1488 | 1488 | 1488 | 1488 |
| centroid | (786, 333) | (786, 333) | (786, 333) | (786, 333) |
| distance to centre | **1px** | 1px | 1px | 1px |

Identical bitmaps across every toggle — the node stays framed and the zoom
cannot drift. `/graph?focus=vaultwarden` at 1440x900: 1px, stable. No focus and
`?focus=__nope__`: 0 focus pixels (nothing is falsely framed).

Interaction checks on the same build: clicking the framed node navigates to
`/wiki/ollama`; dragging it 120×32px moves it exactly 121×32px, so dragging
still works under `layout: 'none'`; `list_console_messages` is empty after two
filter toggles.

## Other fixes in this round

- **Wrapped blockquotes** — `stripLeadingChrome` only removed a following
  reference block when the first `# H1` was actually matched, and the drawer
  now closes when the viewport crosses `md`.
- **Dead prose** — removed the five `wiki-content` entries that were shadowed by
  `CURATED`, and added a `shadowedProse` report so a future one is not silent.
  Re-running the generator now prints no such report and writes 160 pages.
- **Stale wikis in CI** — `npm run build` now runs `build-wikis.mjs` first. The
  generator is idempotent (re-running over the committed tree produces no diff),
  so this cannot churn the repo.
- **README** — metadata rail corrected to 300px; noted that the layout is
  computed once.

## Deliberately not fixed

- `generated_at` churn in `graph.json` (`build-data.mjs`) — never read by the
  app; a data-pipeline change outside this round. The working tree copy was
  reverted rather than committed.
- `stripLeadingChrome` still only matches the *adjacent* blockquote, so a
  quote separated from the `# H1` by a blank line survives. No shipped page
  triggers it, and widening the match would start eating prose that is not
  reference text.
- `vaultwarden` has no inbound `[[links]]` from any other page, so its
  反向链接 panel is hidden. That is the panel behaving correctly on thin data;
  the generator's "same sub-category" sibling picker is what does not select it.

## Verification

`npm run lint` (oxlint) clean; `npm run build` clean; generator idempotent;
165 wiki pages present with all four sections; no unresolved `[[links]]`.
