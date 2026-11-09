# Genetic dataset selection and deletion

An explicit active source or no-source selection lives in the existing encrypted precision profile. Saving a newly reviewed dataset selects it. Historical datasets remain independently viewable, selectable and deletable. Removing an active dataset records **No active genetics dataset**; an older source never silently replaces it. Legacy accounts initially retain the existing newest-source selection, including an unavailable state for an unreadable newest source.

The Genetics tab exposes source history independently of clinical interpretation availability. Source view shows saved original calls without activating a dataset; sensitive APOE calls remain withheld. Scoped confirmation describes drafts, derived outputs and retained sources. Cancel preserves the current draft. Call counts and dates remain unknown when absent.

## Contract

- `GET /api/precision/genetics/sources` returns owned source summaries, opaque source revisions and selection revision.
- `GET /api/precision/genetics/sources/:id` returns owned source facts, without interpretation or activation.
- `POST /api/precision/genetics/active` explicitly selects an owned readable source or no source.
- `DELETE /api/precision/genetics/sources/:id` removes only that source and known exclusively dependent saved plans.

Writes require the authenticated actor, `X-Bloom-Genetics-Actor`, `X-Bloom-Confirm: manage-genetic-dataset`, a strict confirmed command and current source/selection revisions. Account-lock transactions serialize changes. Missing/foreign deletion targets have the same owned absence response; stale changes conflict. Exact retries of an already achieved state do not mutate it. An older activation cannot undo a later no-source choice. Generic record deletion and context updates cannot bypass source controls.

Unrelated lab records, meal journals, other datasets and plans without known exclusive source lineage remain. Current projections and mutation receipts are cleared after successful writes, including same-account navigation away while a request finishes. Account epoch guards prevent a response from restoring prior-account source metadata. Clinical interpretation gates remain independent.

No SQL migration or new storage subsystem. Rollback must retain a selection-aware backend: stripping the explicit no-source pointer could reintroduce automatic historical activation. Original uploads, logs and backups are not claimed physically erased by this operation.

## Verification, 2026-11-06

587/587 full tests passed. Focused encrypted SQL/API tests cover source selection, historical deletion, invalid legacy source, context protection, account isolation, stale/concurrent operations, planner lineage and safe retries. Browser verification uses the actual App, HTTP routes and isolated encrypted PGlite: consent/draft Cancel, lost-response exact deletion retry, no fallback on reload, historical facts, deliberate activation, navigation during deactivation, mobile/dark/zoom and keyboard focus. Existing manual/file import and Microbiome source-control regressions are checked separately. Type check and production build are required before publication.

Independent Design review, physical VoiceOver/device testing and hosted runtime verification are separate; none is inferred from browser automation.
