# Durable Today choices — reader-first contract

Goal: a user can choose Try, Save for later or Not relevant on one existing Today action and recover that exact intention after refresh. Choosing an action is not evidence of a completed workout, eaten meal, adherence or a health effect.

## Reader checkpoint

`wellnessChoiceSchema` in the existing `shared/experience.ts` reads a versioned `wellness-choice` record in the existing encrypted experience store. It carries the action/version, current context/evidence/decision source versions, separate command revision and intent UUID, local day/offset, source lifecycle ID and actual choice time. It has no meal nutrients, exercise minutes, completion or medical fields; unknown future action identifiers can be retained as historical source text without becoming eligible actions. Existing private readers/export can round-trip it, while current activity/check-in summaries ignore it.

The existing settings reader accepts an optional server-owned `lifecycleId`; existing sources without it stay readable. It is a generation marker, not permission, a clinical approval, a measurement or a new user preference. The strict public settings patch cannot supply it. This checkpoint does not generate a lifecycle, activate a dedicated writer or expose new choice controls. Generic record POST/PUT and direct generic storage creation/update explicitly reject this kind, preventing a client from forging a reviewed decision snapshot.

## Writer and UI exit — still open

1. One source-locked command re-evaluates the known action, account, date, evidence and relevant constraints; no arbitrary free-text action becomes approved through a request body.
2. Capture and preserve one immutable intent ID/body for lost-response retry. Completed retries return the original receipt and do not move old intentions ahead of newer choices.
3. A settings/record lifecycle generation and actual source versions prevent old queued writes after clear/delete/recreate. Individual history erasure and broad experience/account erasure must not resurrect a prior choice or erase future arrivals. Source change retracts current projections; past choice history is not a current recommendation.
4. Keep choice history and quotas from displacing canonical workout/activity/check-in reads or preventing ordinary logging; export the real owned choice history and retain unknown/time semantics.
5. Existing Today remains one primary task, with source/Why and low-risk, feasible action eligibility. Add Try/Save for later/Not relevant only when the real command path is tested. A choice never automatically logs food/workout, computes adherence, changes goals or starts a model.
6. Actual App→HTTP→encrypted SQL selection/edit/reload, source/evidence correction, two accounts, stale/queued/lost responses, local-midnight and deletion/erasure;320/390 light/dark/keyboard. Relevant shared-store consumers and mandatory CI stay checked.

Progressive disclosure map: reader-only schema/storage changes add no metric or screen (surface/deep/fallback UI not applicable at this checkpoint). The writer's existing-Today surface will show a plain action/actual choice; Why exposes source/evidence and missing context; unknown/unsupported/stale states retain Add food/manual activity and actual original records. No one-second telemetry, clinical readiness or completion state is invented.
