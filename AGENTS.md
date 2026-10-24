# Bloom developer execution policy

See [PROJECT_COORDINATION.md](PROJECT_COORDINATION.md) for the product-owner directive and [docs/architect-r6/IMPLEMENTATION_STATUS.md](docs/architect-r6/IMPLEMENTATION_STATUS.md) for historical implementation evidence.

## Authorized objective
Deliver the complete architect-approved Bloom v0.5 release (Revision 6, Amendments B, C, D and E, original brand assets, and approved specialist handoffs). Do not mistake historical partial returns, per-increment deferrals, CI success or documentation commits for a release finish line.

## Implementation conduct
- Developer owns integration, code, database/migrations, tests, PR and deployment. Keep `main` unchanged, use `enhance/bloom-experience` and its existing review PR.
- Perform substantial end-to-end engineering per execution session, not one tiny change followed by a request to continue. Routine authorized work needs no repeat confirmation.
- Review current branch and consolidated requirements; preserve functioning behavior, avoid duplicates, and carry unfinished architect-approved scope forward.
- Treat native HealthKit and Health Connect as actual platform integrations, not web mocks. Implement real platform boundaries and permission lifecycle when in scope; accurately flag hardware/credential limitations.
- Validate types, unit/integration/security tests, production build, rendered user journeys, migration compatibility and deployed commit before marking corresponding status as verified.
- Never invent provider credentials, device access, study evidence, clinical effect sizes, legal clearance, test results, deployed status or independent review.
- P0 consent, security, clinical evidence, tenant isolation and licensing safeguards are not overridden by delivery urgency.
- Summarize feature-level statuses, SHA, test/deployment evidence and actual blockers. Status reporting is not a substitute for development.

## Session boundary
Agents do not work asynchronously after a response ends. Use available sessions to implement as much of the approved backlog as possible; explicitly distinguish open items without treating them as permission to abandon the release.

## Amendment E precedence (2026-10-18)
Amendment E is the latest architect execution directive and supersedes conflicting stop-and-wait approval/phase instructions. Execute approved work continuously within the available active session; parallelize specialist review, keep externally gated risky features disabled, and never claim public release approval from a safe preview. Amendment D adds independent, account-scoped display units (including mixed systems) with canonical values and provenance preserved. This directive does not waive tests, consent, safety or truthful blocker disclosure.


---

## Codex takeover policy — effective 2026-10-23 (supersedes conflicting role/approval language above)

# Bloom — Codex implementation instructions

## Ownership (effective October 23, 2026)
Codex replaces the former Developer Agent as the **sole engineering implementer** for BloomGutHealth. Codex owns architecture implementation, code, tests, commits, PR updates and Render development deployments. Chief Architect & Integration Lead owns consolidated handoffs and resolves cross-specialist requirements; specialists advise and review only. Product Owner reviews working changes after they are pushed. No former Developer Agent approval is necessary.

## Source of truth and precedence
1. `docs/architecture/CURRENT_V05_REQUIREMENTS.md`: current v0.5 Revision 6 + Amendment F, including earlier amendments and P0 brand asset integration, selectively required annotated before/after evidence for substantial visible changes, unit customization, continuous development and push authorization.
2. `docs/architecture/POST_V05_ROADMAP.md`: **future planning**; do not switch from incomplete v0.5 work to this roadmap prematurely.
3. Current repository code, migrations, CI, `SPECIALIST_IMPLEMENTATION_STATUS.md`, existing backlog and specialist source handoffs as evidence of actual state. A requirement in a document is not proof of implementation; verify current code, tests and Render before deciding what remains.

Latest PR baseline at handoff preparation: `knagle-max/BloomGutHealth`, PR #1, `enhance/bloom-experience`, head `5b607cfe8316567ff77f66b1ebefed01d8671e7c` on October 23, 2026. Verify live head; never reset/overwrite another contributor's work.

## Autonomous development
- Proceed without asking the Product Owner to authorize **each routine commit, push, PR update or safe, access-controlled Render preview deployment** on the existing enhancement branch.
- Plan briefly, then implement, run relevant tests, commit, push, deploy preview where configured, report the exact SHA and visible changes, **and continue** with the next unblocked task in the authorized scope.
- Never treat pending branding, user-testing, legal or science review as a general stop-work gate. Implement independent safe work in parallel, record review pending separately. Preserve blocking safety gates for actually unsafe or regulated functionalities.
- Do not merge to production/main, publish publicly beyond the existing authorized preview, incur charges, acquire vendor agreements, expose real sensitive user data, weaken security, or perform destructive Git operations without appropriate separate authorization.
- Where a provider credential, native client decision, API licence or specialist clinical validation is unresolved: gate or defer that feature truthfully; keep shipping other approved improvements.

## Nonnegotiable acceptance
- Branding package is a P0 **implementation**, not a keep-existing-CSS instruction. Inventory and adopt approved logos, icons, tokens, visual system and screen specifications. Request Branding review on the *running result*.
- **Selective visual evidence only:** create before/after images only when a milestone materially changes what the user can see or interact with (e.g., substantial branding rollout, navigation redesign, new screen, major layout/workflow). Do not generate them for backend changes, invisible refactors, copy-only edits, minor styling, or near-identical screens. Compare only genuinely changed screens, using matched viewport/theme/fixture/state. Include 2–5 concise callouts or unobtrusive numbered annotations identifying the actual visible differences, plus a plain-text change summary; retain unannotated originals. If the difference is not readily visible, omit the gallery and provide test/code evidence instead. This is not a per-commit requirement or a blocker to other development.
- Unit preferences: locale suggestions only; independent choices for cm vs ft/in, kg vs lb, etc. No mixed-unit restriction; retain canonical measurements and exact conversion behavior.
- Protect account boundaries, secrets, consent, lab-unit confirmation, clinical abstentions and source/evidence integrity. Do not present unreviewed medical claims, fictitious integrations or fabricated data.
- Keep the existing Render preview usable for Product Owner review with synthetic fixtures and clearly identified deployed SHA.

## Immediate first task
1. Check PR #1 HEAD, CI, current app, current Render preview and relevant branding assets.
2. Reconcile `CURRENT_V05_REQUIREMENTS.md` with implementation status and identify next incomplete P0/P1 work. Prefer concrete code delivery over new process documents.
3. Implement/test/commit/push/deploy the next meaningful increment without waiting for routine per-commit approval.
4. Supply concise release notes/status; provide annotated before/after artifacts only when the milestone produces substantial visible differences.
5. Only after v0.5 completion, use `POST_V05_ROADMAP.md` to select the next phase, starting with living evidence governance and free-first discovery, without direct article-to-live recommendation publishing.

## Limits of this file
These are Product Owner standing instructions conveyed by the Chief Architect, not proof that Codex is already connected to this repo or has started work. AGENTS.md takes effect when made available in the Codex working checkout.


> **Product Owner visual-evidence clarification (2026-10-23):** Before/after images are selective, not routine. Create them only for clearly visible, substantial UI/brand/workflow transformations. Mark the actual changes with small numbered callouts/highlights and supply unmarked originals. Never present near-identical screens as a meaningful comparison. For minor or invisible work, report code/tests and preview behavior instead. This rule supersedes broader comparison wording elsewhere in this document.

## Execution order clarification — 2026-10-23
The consolidated dependency-led sequence is in `docs/architecture/DEVELOPER_EXECUTION_ORDER.md`. **Finish v0.5 before beginning v0.6 implementation**. For future v0.6, use `V06_HANDOFF.md` for requirements and the execution-order document for sequencing; the older post-v0.5 roadmap is supporting context, not competing priority order. This guidance does not add new v0.5 work or require approvals for routine commits.


## Standing robust engineering mandate — product owner (2026-10-23)

**Applies to ALL ongoing and future Codex development, including remaining v0.5 fixes, v0.6, integrations and subsequent releases.** The owner expects security, maintainability, correctness, modularity and safe interchangeability by default, not as optional cleanup. This policy supplements existing release scope and standing authority to commit/push; it is not permission to expand active v0.5 scope into v0.6 or to rewrite the application indiscriminately.

1. **Secure by design:** use least-privilege account/purpose authorization on the server for every sensitive route and derived field, input validation, output encoding, encrypted sensitive data where appropriate, scoped secret management, safe errors/logs, dependency vulnerability/licence checks, and explicit approval gates for external user-data transfers. Never trust client-side flags as permissions.
2. **Strong domain boundaries:** use cohesive modules and clear typed/versioned interfaces. External providers (food databases, lab imports, wearables, literature, AI models) must be adapters behind domain contracts; provider-specific response shapes must not leak throughout the app. Changing one connector should not require modifying unrelated domains.
3. **Change safely:** write or update regression, boundary, contract, authorization and critical journey tests with substantive changes. Preserve historical values, original units/provenance, and versioned interpretations. Migrate databases with backwards-compatible expand/migrate/contract steps; provide rollback/restoration strategy for consequential changes.
4. **Limit blast radius:** use scoped feature flags/kill switches, explicit fallback for unavailable integrations, sensible timeouts and retries, idempotent ingestion, and privacy-safe observability. Never silently fabricate data or infer permissions.
5. **Design for longevity, without gold-plating:** prefer understandable modular-monolith architecture and existing infrastructure until measured reasons justify extraction. Avoid duplicated parallel models, god modules, circular imports, speculative abstractions, or widespread refactors unrelated to current work. Make focused improvements to existing boundaries when touched.
6. **Demonstrate, don't just assert:** for each material PR slice provide affected modules, accepted domain/API contracts, automated test results and any new boundary violations, applicable security/science review, deployment/feature-switch state and practical reversal steps. A provider-swap/failure test and code-derived dependency audit are v0.6 foundation milestones, not evidence already completed.
7. **Preserve delivery priorities:** fix verified current user-facing defects first within v0.5, protect existing working features, and do not interrupt routine approved GitHub commits/pushes or Render preview updates. Do not claim a feature or protection has been tested unless it was actually tested.

**Canonical elaboration:** `docs/architecture/V06_HANDOFF.md` §§22–23 (`MOD-ARCH-01–05`, `ENG-EVOL-01–10`) and `docs/architecture/DEVELOPER_EXECUTION_ORDER.md`. This AGENTS policy is intentionally cross-release and authoritative for Codex implementation conduct, while the respective version's scope documents define which features to build now.
