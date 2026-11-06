# Release verification — 2026-11-06

- Published UI/UX commit: `292c38bfa94983fcc3acce71d28093fcb6d6f12e`.
- Follow-up font fix: `dbdbf45ea18a33b20ee4cfa4e557c93dbe6f37ed`.
- Production sites: https://atlas.sgyyyds.qzz.io/ and https://stanlysgy.github.io/FOSS-Atlas/.
- Verified the actual deployment steps succeeded on both hosts; Cloudflare was not skipped because of absent credentials. Workflow IDs and full step evidence are in validation.json.
- Ran the archived UI/UX Chromium suite against both production sites: 18 checks each, 36 total, no runtime exceptions. Covered four viewport widths, search shortcuts, favorites recovery, category/list persistence, mobile pagination/focus, comparison persistence/share/cap, keyboard modal isolation, denied clipboard/storage, Wiki and graph/deployed pages.
- All 14 HTTP checks returned 200, including filtered roots, deep links and probe snapshots. New home content was present on both hosts.
- Screenshot inspection found `193 项` rendered its Chinese suffix as a missing glyph without system CJK fonts. The one-line CSS fix places the bundled Chinese font before generic monospace fallback. Verified the corrected glyph in screenshots and confirmed the deployed computed font stack on both hosts; category reload still returns 200.
- Re-ran 125 tests, lint and the production build after the CSS fix. All passed; 196 pages prerendered. No new dependencies or API/data changes.
- Reviewed the one-line production diff and recorded the font-order finding in the frontend spec. No remaining findings in the release change.
- The preceding UI/UX task records its Antigravity/Codex review and the unavailable Claude review (`authentication_failed`); this release does not claim that missing external review completed.
- Only explicitly selected application/spec/task files were committed. The preexisting local HANDOVER.md was excluded.
- The final archive commit contains release evidence only. Its push and two deployment outcomes are verified after committing, without recursively creating another evidence commit.
