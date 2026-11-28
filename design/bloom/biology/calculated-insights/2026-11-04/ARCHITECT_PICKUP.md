# Architect & Codex pickup — Calculated Insights v1
**Source:** Biology and User Testing handoffs November 4, 2026.
**Scope:** design-only v0.6 conditional proposal, no production release.

## Architect reconciliation
Map to existing immutable laboratory observations, date revision history, interpretation registry and grouped Biology browser. Retain BIO's 36 candidates + one excluded thyroid ratio, but permit only context-reviewed eligible P0 items for initial presentation. Each ratio needs approved formula/variant, unit mapping, specimen ID, source revision, collection occurrence, input constraints, source version and appropriate interpretation semantics. Stronger release gates for guideline and specialist classifications.

## Developer integration
Use `prototype.html` for layout and copy pattern; do not reuse its fixture numbers as real data. Build deterministic server-side or canonical calculation engine, not in CSS/template. Recompute atomically on lab corrections and invalidate unsuitable results. Preserve original observed values, never overwrite with derived metrics. Tests follow `ACCEPTANCE.md`. Only verified results from the canonical system may appear in live UI; no second lab datastore. Advanced research indices hidden from initial Today/Bloodwork unless intentionally sought.

## Approval map
- Branding: conditional UX direction, source-verified prototype.
- Biology: source requirements proposed, clinical interpretations not independently approved.
- Legal/Regulatory: intended-use status pending.
- Security: authenticated source/deep link, correction and export audit pending.
- User Testing: acceptance plan supplied, participant/devices not run.
- Architect: reconciliation pending.
- Developer: app integration and test SHA pending.

## UX handoff status
Usable editable HTML/CSS/JS source plus JSON contracts committed to design branch. These are not production screens. Accessibility has not been certified. No clinical threshold should be treated as cleared solely because the prototype displays it.
