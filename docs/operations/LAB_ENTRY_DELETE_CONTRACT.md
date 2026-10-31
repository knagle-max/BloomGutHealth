# Explicit laboratory entry deletion

`DELETE /api/precision/labs/:id/entry` is authenticated, account-scoped and no-store. The client must send `X-Bloom-Confirm: delete-lab-entry-and-revisions` after explaining the scope to the owner. The application does not fall back to the legacy record deletion route.

The transaction takes the existing account advisory lock shared by laboratory insertion and unit confirmation. It reads only owned laboratory IDs and encrypted laboratory payloads. Supported and strict source-only payloads are classified before any mutation; unclassifiable lineage aborts without partial deletion. The requested supported observation must be active. A superseded pending target returns409 so a concurrent unit confirmation cannot be silently erased under stale confirmation.

A connected component of validated unit-supersession links represents the result's source/unit revisions. It is unrelated to an import/report/specimen grouping: other results in the same report remain intact. Deleting the active confirmed child removes its pending parent too, preventing pending-source resurrection. The owner and laboratory-kind conditions also apply to the final delete.

Deleting a component containing an active supported clinical result conservatively clears the owner's precision plans. A strict source-only or pending-only component was not a clinical planning input and does not clear those plans. No other account, meal journal or microbiome report is touched.

A missing or foreign target returns204, including an exact retry after a committed response was lost. No foreign existence is disclosed. Missing confirmation returns400, stale sources409, and unavailable storage503. None triggers a row-only fallback. The dialog retains the exact target after an uncertain response so it can retry safely; cancellation and source review are available after a conflict.

The existing `/api/precision/records/:id` endpoint retains its historical row-only semantics for compatibility. New laboratory UI calls use the explicit entry route. This contract currently covers unit revisions; future date-correction lineage must be included in the same active-source/deletion logic before a correction writer ships.

Evidence: `tests/lab-entry-delete.test.ts` uses encrypted isolated PGlite and actual Express routes, demonstrates the old resurrection, and verifies authorization, confirmation, stale targets, linked deletion, retries, other-result/account preservation, plan safety and unclassifiable-source rollback. `scripts/qa/source-only-lab-journey.mjs` exercises the actual React/API/encrypted storage chain, cancellation and a committed deletion with a lost response. No real user data is deleted by those checks.
