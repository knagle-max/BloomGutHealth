# Resume Bloom development

Branch enhance/bloom-experience, PR1. No main merge or replacement Render service.

1. Latest published53e511b adds identifier-only CI dependency diagnostics.266a9c3 is live on Render dep-dbf12r34qb4c73a3e080; CI40202194519 failed schema stage2BP01 before PostgreSQL proof smoke. Verify53e511b run40202645321 and its safe dependency identifier; fix actual cause without disabling audit/constraints, truncating data or touching Render DB.7fb37a1 earlier CI40200766780 succeeded, but this new failure is unresolved.
2. Published47defaa/266a9c3 implement step-up signed120s exact-session/action-bound single-use receipts.306 local tests pass, real PG protocol smoke pending successful CI. Default adapters deny; no HTTP/runtime activation or live grant. SQL0014 only prepared on isolated PR DB.
3. Unpublished feature-controller-auth.ts + tests and source-map update: trusted actual bcrypt/account/config adapter,308 full tests/types/build/admin browser pass. Publish after schema issue resolved. No actual grants installed. Source trace52/99 all review REQUIRED.
4. Next: integrate proof + credential adapter with independently sourced current review/scope/material/quorum/consent/rollout policy, guarded control service and runtime checks. Read-only role never implies write; immutable incident/research restrictions remain. Keep routes403 until real protections exist.
5. External questions in BLOCKED_USER_INPUT.md remain scoped. Never print credentials, recover/mint real sessions or change USDA key. Tester1 binding/additive0008 already verified; actual authenticated acceptance is external. Native/source rights/independent signoff still pending. Continue other unblocked v0.5 tasks; release is incomplete.

Tests: /tmp/controller-full.log (308), /tmp/controller-auth.log (2), /tmp/controller-browser.log PASS, /tmp/controller-types.log and /tmp/controller-build.log pass. Browser environment and commands in DEVELOPMENT_LOG. No new gallery for backend work.
