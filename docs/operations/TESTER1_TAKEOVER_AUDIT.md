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
