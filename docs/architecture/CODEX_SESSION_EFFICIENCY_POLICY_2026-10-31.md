# Bloom — Codex session-efficiency policy
Date: 2026-10-31 | Status: Chief Architect approved | Owner directive: optimize useful development per available Codex allowance while retaining autonomy, source truth, security and milestone review.

## Purpose
Keep Codex building complete working features. Preserve the original autonomous goal's intent: resume from durable state, no unnecessary approval after commits, no forgotten tasks, no regression-prone shortcuts, and stop only for genuine blockers, explicit user boundaries or usage/platform limitations. **Do not use 'efficiency' to skip material privacy, clinical-safety, account isolation, source-integrity, or core-journey correctness tests.**

## Division of labor
**Chief Architect and specialists:** research, consolidate conflicting handoffs, decide sequencing, approve scope and precise acceptance. Store one binding concise execution contract per workstream; link bulky reference documents, avoid copying long prose into multiple task indexes. Architect's documentation-only commits do not constitute Developer implementation.
**Codex:** inspect the exact codepaths needed for the **next ready task**, make the smallest viable real change, run targeted tests, inspect the real user workflow, commit and continue. Do not repeatedly research broad product requirements already reconciled or draft governance essays. Escalate only true conflicting requirements, spend/permission decisions or live blocker.

## Bounded vertical-slice task card
Each ready task should fit a compact card:
- stable ID, priority and intended user outcome;
- current failing/absent behavior, exact example and affected surface;
- 2–8 likely entry files and link to one authoritative contract;
- smallest end-to-end acceptance proof: input→review/correction→save→retrieval;
- focused tests including at least one negative/missing-data case when relevant;
- exact stop/escalate condition and permitted branch/deployment.
No default whole-project rediscovery. Verify current HEAD and already-implemented work briefly; no speculative substitute implementation.

## Session procedure
1. Read **only** `docs/architecture/ACTIVE_EXECUTION_QUEUE.md` short next-action section, one task card from `PERSISTENT_TASK_INDEX.md`, and its linked binding contract; open further sources only if a real discrepancy arises.
2. Verify branch/HEAD and current behavior, then implement the next highest eligible vertical slice. Timebox broad diagnosis by switching to exact error reproduction and targeted file inspection, not generic research.
3. During development run directly affected unit/integration tests and typecheck where touched code warrants it. For security/permission/data-integrity changes, mandatory relevant negative tests; no deferral of material safety to milestone.
4. Verify actual user-facing journey on preview when tool access permits. At significant slice/milestone boundaries run broader integration/CI suites. Broader suites always run before final milestone exit and relevant release decisions, not after every copy or CSS edit.
5. Commit code+tests with a **short checkpoint**: task ID, implementation SHA, targeted test and preview status, remaining blocker, precise next action. Update an existing ledger section rather than adding repeated prose files. Next ready task proceeds without waiting for owner approval.
6. Report only completed functional outcomes and blockers. Distinguish implemented, tested, deployed and independently accepted; do not declare independent acceptance through automated self-tests. If capacity expires, ensure committed work and a usable one-line next task.

## Model usage advice (not enforced by repo)
Use the lighter available Codex model/reasoning setting for bounded UI copy, simple component fixes, straightforward tests and targeted documentation. Use stronger model/high effort for multi-domain data migrations, deep state bugs, privacy/security authorization, and complex scientific logic. Don't switch models so aggressively that lost context or error retries outweigh savings. Current account model availability and allowances vary; user chooses manually from actual Codex model selector/settings. This policy does not represent an automated model switch.

## Explicit anti-overhead safeguards
- Do not consume a full session rewriting architecture documents, reconstructing the entire historical backlog, repeatedly debating reviewed claims, or enlarging edge-case matrices without a reproduced failure/material risk.
- Prefer one visible finished journey to 20 partial improvements.
- If the requested feature already works, capture a minimal proof and move forward; avoid rebuilding.
- Leave minor non-user-affecting lint/type organization and harmless coupling as documented P2 work; no wholesale modular refactor, microservices, or speculative expansion.
- Continue original approved v0.5 and v0.6 roadmap, and preserve all working advanced functions despite simpler default UX.
- Relevant architectural and regulatory release checks are **gates**, not recurring research assignments.

## Audit and acceptance cadence
- **Per change:** focused regression; P0 security/data checks where relevant.
- **Per completed functional slice:** real journey, targeted integration, exact commit + preview evidence if available.
- **Before v0.5/v0.6 exit:** broader suites and `MILESTONE_MODULARITY_AUDIT_GATES_2026-10-31.md` exact-SHA modularity audit. These audits should run once for each actual final milestone state (and repeat after meaningful corrective changes), not in every ordinary Codex session.
- **Independent beta/public launch:** Part G usability and legal/privacy gates remain separate from code completion and must not be falsely self-certified.
- Work on other unblocked approved tasks may proceed while external independent review is pending.

## Session-level value signal
Track completed user journeys (input→stored→retrieved), number of material defects fixed, and remaining ready tasks. Session resource estimate: **~75% implementation, ~20% relevant verification, ~5% concise checkpoint administration**, a management target rather than instrumentation or a reason to evade tests. Review actual allowance in Codex settings, but don't ask Codex to build a token accounting service.

**Final:** Autonomous development continues; process overhead shrinks; correctness and honest status reporting remain mandatory.
