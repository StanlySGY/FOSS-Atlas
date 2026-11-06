# Implementation plan

## Analysis

Antigravity analyzed inline source after headless file-reading permission failed. Main findings: curated/generated pages need separate ownership; preserve the `快速上手` H2 for visible guide detection and natural H3 outline. Its proposed full-body search indexing is rejected: the existing generator intentionally uses concise authored search fields to avoid incidental matches. Claude analysis was attempted in parallel but the configured backend exited without a response; prior session had authentication failure. This is recorded as unavailable, not completed review.

## Ownership

1. Worker `ollama-guide`: only public/wiki/ollama.md. Rewrite local-model quickstart, reproducible API check, hardware/runtime diagnosis, official evidence.
2. Worker `service-guides`: only scripts/wiki-content/g1-ai.mjs (qdrant entry) and scripts/wiki-content/g4-saas.mjs (resend entry). Add guide array of {title, body} with Markdown bodies, retain concise usage, update evidence. No generated files.
3. Lead: scripts/wikiGuide.mjs, scripts/build-wikis.mjs, scripts/tests/wiki-guide.test.mjs; optional guide renderer with legacy fallback and evidence validation. public/wiki/vaultwarden.md curated bootstrap/backup guide. src/pages/WikiPage.jsx quickstart anchor, only if actual quickstart exists. Lead owns all generated outputs, fonts, task/spec records and release.

## Sequence

- Parallel workers author their disjoint guides while lead writes generator behavior tests/implementation and Vaultwarden guide.
- Regenerate Markdown/search/backlinks and font subsets; inspect changes so unrelated pages remain identical.
- Run tests, lint, content consistency/build gates; inspect shell/JSON examples. Run local-only disposable Qdrant example if Docker available; do not send email or create production accounts. Distinguish source-checked guidance from executed examples.
- Browser checks: four guide routes, mobile widths, desktop TOC, code copy, fast jump, hash reload, Wiki navigation; production root and GitHub subpath.
- Parallel Antigravity + Claude review attempts using inline diffs; independently verify findings. Fix verified defects and repeat relevant checks.
- Commit/push, verify both workflows and live guides; archive task and push final evidence commit, monitor final deployment without recursive evidence commits.

## Acceptance

Four practical source-backed guides; old generated usage pages unchanged; no example-body search pollution; safe local service binding and clear results/failure instructions; no test failures, broken generated routes, or mobile overflow; final commit deployed on both hosts.

## Validated review follow-ups

Browser reproduction showed TOC state updates remounting Markdown headings and losing focused anchors. Lead also owns src/components/Markdown.jsx for memoization that keeps reading DOM stable. Renderer supports validated entry.related overrides only for Qdrant/Resend to remove unrelated broad-category recommendations. Existing wiki-frontmatter test now checks necessary evidence endpoints and consistent dates instead of an obsolete hardcoded date/source count. Vaultwarden restore text clarifies root-owned archives and UID/GID.

Narrow viewport testing found a long inline curl URL overflowing by 15px; src/index.css gets inline-code wrapping, preserving preformatted block scrolling. Vaultwarden v1.37.5 web client rejects HTTP API even on localhost; replace bootstrap with loopback Caddy HTTPS, explicit local root certificate trust, and verify in a disposable environment.

Hydration test caught literal dollar expansion in renderDocument String.replace replacement payload. Extract renderDocument into src/prerender/shell.js and use a callback replacement, with scripts/tests/wiki-payload.test.mjs round-trip coverage for $$/$`/$&/script-like text.
