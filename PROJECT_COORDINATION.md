# Bloom coordination — 18 October 2026

The product owner added a **Chief Architect & Integration Lead** during this implementation pass.

## Effective workflow for subsequent work

1. Marketing & Design, Security, and Nutrition & Biology maintain dated specialist findings with stable IDs, rationale, acceptance criteria and reviewed branch/SHA.
2. Chief Architect & Integration Lead reviews and consolidates all specialist recommendations, resolves cross-domain conflicts and supplies comprehensive integrated requirements.
3. Developer implements the architect-approved requirements, owns code, integration, tests, GitHub changes and release verification. Specialist proposals alone are not direct implementation instructions.
4. Developer reports each high-level implementation and status in bullets on every implementation handoff. Retain recommendation IDs and distinguish partial work, tests, deployment and independent review.
5. Specialists perform acceptance review within their specialties; implementation tests do not replace their sign-off or external assessments.

The current pass, begun before this change, is explicitly authorized by the owner to finish. Its fixed scope is recorded in SPECIALIST_IMPLEMENTATION_STATUS.md. Newly arriving specialist direction waits for architect review. This supersedes earlier documents assigning direct specialist-to-developer intake and sole cross-domain architecture authority to the Developer.

Separate chat threads do not have a direct live message channel. This repository and dated shared handoffs provide the review record; this document does not claim that another thread was notified.

Pipeline: Received → Reviewed (architect-integrated for future work) → Implemented → Tested → Specialist review. Deployment is tracked separately and never implies clinical, security or product sign-off.

## Revision 6 implementation return

Future intake now uses Chief Architect v0.5 revision 6 and its Amended/B/C additions. Original brand assets are mandatory alongside consolidated guidance. `docs/architect-r6/IMPLEMENTATION_STATUS.md` maps this increment, original source/backlog copies and acceptance limits. Review the candidate branch and paired synthetic screenshot package before giving exact-build specialist acceptance. This is a review branch; no release approval is implied.


## Product-owner delivery directive — 18 October 2026 (supersedes incremental handoff behavior)

The product owner explicitly requests **complete, integrated v0.5 implementation**, not isolated small commits followed by a request to continue. Treat Revision 6, amended review, Amendments B/C, the original brand assets, and architect-approved specialist requirements as a **release backlog**, not as permission to stop after the originally reviewed increment.

1. **Continue through the approved release scope during each available execution session.** Do not stop merely because a file was committed, tests passed, or a status update was written. Work remaining under the existing authorization does not require renewed owner approval.
2. **Integrate and verify functionality end-to-end** across client, server, storage, consent, data protection, migrations, device interfaces and regression tests. Avoid duplicate systems and preserve existing behavior.
3. **Interpret 'not represented as delivered', 'conditional on shipping', 'deferred in this increment', and 'review pending' as status descriptions, not blanket prohibitions.** Where an architect-approved v0.5 feature requires a native runtime (HealthKit/Health Connect), identify and implement the necessary native integration rather than substituting browser-only mock connectivity. The browser application alone cannot directly access these platforms.
4. **Do not falsely claim completion.** External credentials, actual physical-device checks, signed legal/clinical approvals, vendor licensing and independent assessments remain real release gates where applicable. Missing external access is recorded as a precise blocker with an implementable code/testing portion pursued where safe. Never fabricate device connection or clinical evidence.
5. **Keep main untouched.** Implement on `enhance/bloom-experience`, maintain its PR and Render review deployment; validate the published SHA and real journeys. Routine branch commits/deployments were authorized.
6. **Report by release workstream**, distinguishing implemented, tested, deployed, reviewed and blocked. A progress report is not a deliverable substitute. Existing P0 requirements cannot be waived by this directive.
7. **Avoid wait-on-architect deadlock.** Use already approved R6 scope; send genuinely new conflicting/unapproved specialist proposals to Architect, but do not suspend unrelated approved engineering while awaiting that review.
8. **No asynchronous promise.** Development only proceeds when an execution session is active. Within each session, make substantive progress and leave the repository in a reproducible state.

This directive modifies execution and sequencing, not scientific evidence thresholds, privacy controls, clinical restrictions, legal approval or platform constraints. If the full release cannot be finished within one execution session, explicitly list remaining items while proceeding as far as possible; do not portray the increment as v0.5 completion.
