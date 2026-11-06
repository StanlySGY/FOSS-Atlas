# UI/UX review — 2026-11-06

## Outcome

No confirmed Critical or Warning findings remain. Antigravity analysis and review completed using source supplied inline because its headless command permission was denied. Claude analysis/review were both attempted through the configured wrapper; Claude CLI and MCP returned authentication_failed / Not logged in. Consequently the required Claude half of dual-model review could not complete. This limitation is explicit; independent Codex review supplements it, without being counted as Claude.

## Confirmed changes

1. Catalog discovery: visible classification, four existing-data task shortcuts, less maintenance noise, clear Wiki action, larger text and mobile targets.
2. Comparison: validated max-three selection, URL precedence, persisted browser fallback, named removable tray, share URL excluding catalog filters, native dialog, exact overflow/focus restoration, scenario/limit/condition/source content, copy failure fallback.
3. Empty-state and pagination fixes: distinguish empty favorites from no matches; clear filters while retaining saved view; mobile loads exactly the displayed eight resources and moves focus to new results.
4. Wiki copy rejection exposes a selected manual URL; stale async completions are ignored after route change.
5. Real-browser regression found basename slash removal caused reload 404 under /FOSS-Atlas. Client and prerender basename now agree on the directory slash.

## Review findings

- Antigravity: no Critical or Warning; Info: closed filter trigger referenced missing catalog-filters. Fixed by exposing aria-controls only when the panel is mounted.
- Independent Codex: no verified actionable findings; independently checked comparison/storage precedence including empty and invalid values, Wiki/back transitions, body restoration, mobile portrait and landscape scroll, and basename consistency.
- UI worker hit provider 429 after producing CSS/card changes; lead reviewed and integrated those files, then further simplified mobile toolbar and hero based on browser screenshots.

## Validation

- 125 unit tests passed, including 13 new comparison behavioral tests; lint clean.
- Root and /FOSS-Atlas/ production builds pass; 196 prerendered pages and OG/font checks pass.
- Root and subpath production browser suites: 18 checks each, no runtime errors. Covers 320/390/768/1440 grid and list widths, 44px mobile main actions, 14px resource descriptions, 16px search input, task search counts, saved-empty recovery, batch/focus behavior, reload, selection cap, Wiki roundtrip, modal Tab/Escape/global shortcut isolation, denied clipboard, clean share links, denied storage, Wiki fallback, graph/deployment smoke.
- Independent graph search → local graph → Wiki and deployment search/reload additionally checked.
- Browser screenshots and full result artifacts: /tmp/foss-atlas-ux-final; browser-check.py retained with this task for reproduction.

## Reference research

Read Karakeep upstream README through GitHub and Fumadocs Docs Layout documentation. Applied search/list organization and progressive navigation ideas only; no upstream code, CSS, assets or dependencies copied. URLs: https://github.com/karakeep-app/karakeep ; https://fumadocs.dev/docs/ui/layouts/docs . Broad web tool returned no content and Exa lacked a configured key, so original upstream pages were fetched directly.

## Content follow-up

Resource count remains 193. This iteration exposes existing authored scenarios and the 34 evidence-backed offerings in comparison; it does not claim all resource facts have been freshly verified. Next useful content work is concrete walkthroughs for high-use resources and periodic source/maintenance verification. GitHub build metadata sync retained its committed snapshot because GITHUB_TOKEN was unavailable.
