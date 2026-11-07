# Architect: Viome post-save companion linking
Date: 2026-11-05. Approved v0.5 user-experience correction; not implemented or tested.

## Confirmed implementation gap
- `ViomeImportChoices.tsx` supports same-specimen linking only during new report import, behind collapsed `Existing reports & specimen > Link a companion report (optional)`.
- `ViomeSavedContext.tsx` shows read-only Source relationship and Open companion report, but no post-save Link or Unlink control.
- `Microbiome.tsx` presents Report history and selected report details. This should own a discoverable management action.
- `viome-report-context.ts` provides compatibility checks for complementary `active-gut-microbes` and `health-scores-foods` documents with matching known collection dates and compatible specimen/method. There is no verified after-save mutation endpoint yet.

## Approved implementation
Add a visible `Link companion report` next to the selected saved report's header/Manage report actions in My Biology > Gut reports > Report history. For linked reports show `View companion` and `Unlink reports`. Do not bury linking in Source relationship details or require user to reupload the reports.

When linking, list compatible saved complementary document types owned by the same authenticated account; show report types and biological collection dates and explain why no matches exist. The user explicitly confirms both are from the same stool specimen; matching dates alone are never enough. Verify both reports, current source versions, document kinds, date/specimen/method compatibility and link occupancy server-side inside an atomic idempotent operation. The current import-time link model should be reused; do not create a second relationship store. Refresh both report details, lists and dependent caches after success.

Unlink removes only the relationship, not either report's findings; delete-one-companion also preserves the other. Never merge source organisms, assessments, foods or quantitative data; never imply that shared stool implies measured biological pathways. No patient names, DOB or original provider sample/test/client identifiers in persisted link metadata or matching. Legacy records without required safe compatibility should show a clear reason rather than pretending to be linked. Always retain the independent Delete report action for all saved reports.

## Validation
Save two compatible synthetic reports separately, link them after both exist, reload and verify the relationship in both directions without merging findings; unlink, reload, relink, delete one, verify surviving independent data. Negative tests: mismatched or absent biological collection dates, incompatible document kinds/methods, already-linked pair, stale revision, foreign account, concurrent link/delete, retry after lost response. Check 320px/zoom/keyboard/accessible confirm and exact hosted SHA. No real-user sources altered by tests.

## Sequencing
Integrate with current P0 universal report management's selected-report header **after** the source-independent Delete report route works; then implement Link/Unlink as a bounded follow-on before broader multi-select/category-wide redesign. Continue independent P0 Viome PDF layout acceptance. No new owner decision or external provider integration needed.
