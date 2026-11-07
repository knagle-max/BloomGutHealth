# Bloom — Product Owner Directive: Autonomous Codex Execution; Specialist Review at Final Gate
**Date:** 2026-11-06
**Authority:** Product Owner (direct); binding Chief Architect integration
**Applies:** current v0.5 and approved v0.6 engineering, `enhance/bloom-experience`, PR #1, authorized development/Render review environment.
**Status:** Effective immediately. Supersedes prior instructions to pause or hold ordinary implementation for recurring specialist signoff.

## 1. Binding decision

**Codex is empowered to make routine implementation, integration, UX, architecture-within-approved-scope, research interpretation for nonclinical educational copy, testing and prioritization decisions autonomously. Do not halt, request new Architect approval, wait for Biology/Brand/UX/User Testing comments, or mark an independently implementable task blocked solely because a specialist has not signed off yet.**

Specialists (Biology, Branding/UX, User Testing, AI/ML, Integrations, Legal, Security as applicable) review the completed **integrated release candidate at the final gate**, evaluate evidence and request necessary defects/claim changes. Codex then fixes any gate failures. They do not act as per-component or per-commit prepublication bottlenecks for ordinary authorized development. This is a sequencing change, not a claim that final signoff has already happened.

**Codex may decide:** Which approved design variation fits existing React components; how to implement parser row reconstruction; which existing safe service to extend; how to organize source-backed educational copy; how to test deterministic eligibility and fallback; what to build next when dependency is unavailable; whether an existing feature meets engineering exit criteria; when to commit/push to authorized development branch and refresh authorized preview. No new owner question for those routine choices.

## 2. Research and scientific content — remove artificial approval bottlenecks

- **Source fact** (observed genotype/taxon, measured lab, user-entered food) can display after technical validation of source/representation/permissions. **General factual education** can display with correctly identified reliable source and scope/uncertainty. No individual physician/clinical approval is prerequisite merely to show the source and ordinary reviewed literature context.
- For an eligible **general low-risk wellness action**, Codex may select among the preapproved, documented action families with identifiable credible guideline/human evidence, source-fit, safety exclusions and no personal causal/clinical prediction. If an individual study is uncertain, use conservative wording or limit to clearly approved general guidance. Codex's engineering decision is provisional until final specialist review.
- For **new consequential personalized biological claims, diagnostic interpretations, medication/supplement doses, high-risk restrictions, PGx, disease treatment or predictive patient outcomes**, do not independently invent or activate a clinical assertion. Implement safe data representation/educational alternative and a disabled or research-only restricted output. Codex continues unrelated coding and the same user's core features. At the final gate qualified experts/legal regulators must assess whether feature activation is allowed.
- Original assay/source fidelity, evidence citations, contradiction and missingness, consent, account isolation and non-PII storage are **immediate engineering constraints**, not optional final-stage tests. Codex tests these as it builds. Specialist final acceptance does not justify shipping unsafe provisional outputs.

## 3. Practical statuses — no review-induced stop-work

Use separate evidence columns/states:
1. `IMPLEMENTED_AND_ENGINEERING_TESTED` — focused/integration tests + relevant actual browser/isolated SQL + type/build, exact SHA; developer can proceed autonomously.
2. `IN_DEVELOPMENT_PREVIEW` — approved review branch/preview updated; not public clinical endorsement.
3. `FINAL_SPECIALIST_REVIEW_PENDING` — final integrated RC exists; Biology, UX, Testing, Legal, Security, etc. review only material applicable claims and user journeys at final gate.
4. `FINAL_GATE_CHANGES_REQUIRED` — finite actionable feedback; Codex implements and retests, no waiting for procedural approval to make ordinary fixes.
5. `FINAL_GATE_ACCEPTED` — only when relevant reviewers have actually verified (and where legally required authorized).
6. `EXTERNAL_ACTIVATION_DEPENDENCY` — real permission, credential, clinical/legal clearance, paid services, third-party rights, sensitive export/transfer, production destructive operation, human hardware/device tests, or private fixture bytes unavailable. **Feature-specific and never a blanket stop-work**.

**Never use `AWAITING_BIOLOGY_APPROVAL`, `AWAITING_BRANDING_APPROVAL`, `AWAITING_UT_APPROVAL` as a standalone reason to stop implementing safe features or to defer v0.6.** Convert to `ENGINEERING_TESTED / FINAL_SPECIALIST_REVIEW_PENDING`; continue with the next concrete approved feature.

## 4. Exact engineering behavior, time and priority

- On each Codex session: inspect exact branch HEAD and current active `NEXT_ACTIONS.md`; select one highest-value uncompleted independently actionable user journey. Implement, test, commit, push, optionally verify one exact Render SHA, then immediately select the next. No repeated governance-only sessions, speculative waiting, reapproval questions or endless full-suite tests.
- Use specialist handoffs as **design/evidence source material**, not new signing authorities before implementation. Conflicting optional UI approaches: choose the one consistent with current design tokens and user task, record a short rationale and proceed. Scientific uncertainty: narrow/label the output without pausing all implementation. External bytes: use verified surrogate fixtures and keep exact-source acceptance separately pending, not a total blockade.
- Do not require each of 12 wellness action families, 15 research scripts, every candidate gene, every microbial function or every independent human device session completed to build and advance the initial useful slice. Count actual report records dynamically. No handoff count/quota as new stop condition.
- Do not wait for final specialist reviews before moving from **v0.5 engineering-complete** (remaining items independently external) to safe v0.6 development. v0.5 *release acceptance* remains distinct.
- If two materially different attempts fail the same specific technical dependency, document one concrete reproducer and attempts, then move to the next safe independent task. Do not re-investigate it every run without new evidence.
- Keep check-ins terse: task, code SHA, tests (what kind), exact deployment, real technical blocker. No requirement to solicit Architect approval after each commit and no vague `review pending` parking lot.

## 5. Boundaries that remain genuinely authorization-gated

Codex's autonomy **does not authorize**: production database migrations/deletions/backups/restores on unidentified/live targets; merges to protected main/production releases; spending or paid provider activation without established mandate; sending private health/genetics data to unapproved third-party AI; processing or retaining prohibited PDF PII; using externally licensed clinical/product material without rights; exposure of sensitive health content across accounts; bypassing actual consent, critical testing or regulatory intended-use restrictions. Those actions are scoped/disabled and tracked while safe code work continues. Real user-data deletion only by authorized user's explicit request through verified product controls.

**Final release gate:** integrated RC, exact SHA, representative synthetic and authorized genuine-source fixtures, safety/privacy/ownership and negative tests, appropriate accessibility/mobile/physical testing and specialized clinical/brand/legal review. No false `PASS`; external acceptance pending may prevent *launch of an affected gated feature*, not Codex coding, development commits, review preview, or safe independent v0.6.

## 6. Supersession

This Product Owner directive overrides contrary historical text in `V06_HANDOFF.md`, specialist handoffs, `DEVELOPER_EXECUTION_ORDER.md`, task ledgers or prior 'approve first' wording **to the extent they demand a specialist review before routine development**. Existing evidence rules and actual hard activation/launch constraints continue to apply. **The Architect should not become another pre-implementation approval queue**: Codex owns routine implementation decisions. Agents inspect final candidate and issue a consolidated punch list rather than returning every minor screen, claim or source mapping for interim signoff.

**One immediate Codex action:** Continue current v0.5 executable queue at actual HEAD; remove "waiting for specialist review" from engineering block reasons, complete task and keep moving. Then commence the smallest approved v0.6 value slice when v0.5 engineering is exhausted. Do not stop to announce receipt of this policy.
