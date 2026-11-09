# Tester1 takeover audit

Owner priority: PERSISTENT_TASK_INDEX takeover directive 6cd2b4c. Existing login is exactly `Tester1`; earlier lowercase lookup on an unverified branch established no absence. No account creation, rename, credential reset, live grant edit or schema mutation is part of this corrective code batch.

Concurrent commits preserved: 90fd188 (supplemental administrator metadata-read grant), 8f3ac54 (supplemental display grant), cdc3258 / 1f17103 (tests), 6cd2b4c (owner handoff). All use the same Git author identity; this does not identify an agent. No unrelated rollback or replacement service.

Observed on existing service: capability reads200 through02:46, then repeated503 at02:50 and03:04 after deployment. This distinguishes a failing request from a proven missing login; it does not identify the actor or prove the cause. Latest remote CI40156588274 failed because API source inventory drifted; source artifacts are regenerated, the gate remains enabled.

Corrective implementation:

- A malformed optional grant no longer revokes unrelated valid base grants. Invalid new grants cannot authorize; identifiable same-account conflicting intent and valid duplicate identities still deny. Base configuration, expiry, service/environment/scope and independent execution checks remain enforced.
- Startup emits `internal-review-readiness` once through existing private operator logging, after DB initialization. It uses one read-only catalog query and reports configured sanitized Neon endpoint, actual database-name hash, expected preference-column presence and configuration-key presence. It never queries accounts or reads/prints credentials, full URLs, grant contents, database names or health records. No public diagnostic endpoint was added.
- `missing-table`, `missing-columns`, `columns-present` and `unavailable` are distinct observations. Presence is not a migration, backup, isolation, account or Legal approval certificate. No automatic migration/provisioning or fallback permission.

Next: inspect the actual startup observation after this batch deploys, match its endpoint and database-name hash to approved connected database metadata, then make only the exact case-correct minimal account lookup on that verified target. Establish the reviewed synthetic dataset/migration boundary before provisioning. Never infer a real grant or signed-in acceptance from local fixtures. If connection/review remains unavailable, retain the single actionable GATE-701 decision and continue independent approved work.

Local integrated evidence: 287 full + 16 focused tests, types/build/source checks; actual PostgreSQL catalog absent/incomplete/migrated cases, malformed/duplicate/independent scope tests, actual-handler photo ON/OFF/deployment revocation/cache cleanup and canonical manual save. Own age-source safety work was preserved separately as ab1540a and included in this milestone. Isolated production startup smoke added; real CI/deployment/binding acceptance pending publication.

## Live follow-up — 2026-10-25 ~05:30 UTC

5952d09 passed CI40165310356 and reached Render live. Startup verified the actual connected Neon endpoint/database-name hash and missing preference table. Exact capital-T Tester1 lookup on that verified target returned one immutable ID, kept private. The approved existing migration0008 then created only the empty preferences table in one bounded transaction; four columns, OFF default and deletion cascade verified, zero rows. Existing accounts/health data, credentials, env and grants unchanged. This was scoped additive schema work on the existing review-service runtime branch (named production), not a new feature grant or claim of globally synthetic data. Managed retention21600s observed; full backup/restore acceptance is not claimed. No snapshot/paid service or data copy created.

The storage blocker is removed. Actual owner-session ON/OFF/module and reviewed scope/expiry remain unverified; no session was fabricated or credentials requested. Profile URL https://bloomguthealth.onrender.com/profile, control beside theme mode; permitted in-situ module is Add Food local photo review. Restricted model/API execution remains denied. Follow-up startup permission booleans verify actual app-role table access without reading user rows or granting privileges. Rollback suppresses scoped UI access and preserves records, rather than dropping the table.

451e7fc passed CI40166319272 and reached Render dep-dbepc1mq1p3s73eg1hfg live. Actual startup05:40:27 confirms expected columns and app-role read/write privileges true. This resolves the schema/access blocker without altering existing grants; real authenticated Tester1/synthetic scope and expiry acceptance remain separate.
