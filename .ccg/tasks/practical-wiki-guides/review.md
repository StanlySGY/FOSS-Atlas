# Review and verification

## Findings resolved

- Browser reproduced focused quickstart heading being unmounted when TOC scroll state updated. Memoized unchanged Markdown keeps its DOM and focus stable. Verified jump, hash reload and H3 navigation on all four pages at 320/390/1440px.
- A long inline Qdrant curl command overflowed 320px width by 15px. Inline code now wraps; fenced blocks retain horizontal scroll.
- Vaultwarden v1.37.5's web client rejected localhost HTTP API with `Insecure URL not allowed`. Replaced the guide with loopback Caddy HTTPS, explicit root certificate export/trust and API verification. Actual HTTPS registration/login/test item creation succeeded. The isolated browser bypassed certificate errors, while a separate curl --cacert check verified the certificate chain; this does not claim OS certificate installation was tested.
- Literal dollar replacement patterns in Markdown corrupted the embedded prerender payload and triggered hydration errors. renderDocument now uses a callback replacement. Roundtrip regression covers $$, dollar-backtick, $&, $', $1 and script-like text; browser confirms zero runtime errors.
- Replaced unrelated Qdrant/Resend recommendations with validated source overrides. Only these two generated pages and two curated pages changed.
- Clarified root-owned Vaultwarden backup archive permissions and separate Caddy CA preservation.

## External review

Antigravity and Claude were called in parallel for analysis and review. Antigravity final review APPROVE, no Critical findings. Its title-leading-# warning does not reproduce a hierarchy change: generated `### # title` is still H3; authored titles are trusted source and newlines are rejected. Localization and forgiving whitespace suggestions are outside current requirements. Earlier claims that gemma4:e2b/docs.ollama.com or /vaultwarden backup do not exist were rejected against current official documentation and actual backup execution. Earlier static-idempotency and hidden-tab warnings were not applicable; the guide explicitly explains key reuse/body changes and the UI has no such tab.

Claude repeatedly exited status 1 without a usable review, including final attempt. This is an availability limitation, not a completed review. Independent Codex read-only review checked guide behavior and actual changes twice, with no verified remaining findings. Antigravity additionally reviewed the final prerender fix.

## Validation

- 130/130 node tests; oxlint; offers check; graph views check; data regeneration consistent except generated timestamp (restored).
- Root and /FOSS-Atlas/ production builds passed, including OG/font consistency and 196 prerendered routes.
- Each base passed 14 guide browser checks and 18 existing product journey checks. No browser runtime errors. Screenshots manually inspected.
- 18 code fences checked (Bash parse, JSON parse, Compose config); no Resend email sent; Ollama model not downloaded or executed.
- Qdrant v1.20.0 actual create/upsert/query returned expected IDs and scores 1/0 in a disposable loopback container.
- Release evidence is recorded separately after deployment.
