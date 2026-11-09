# Durable Today choices — implemented command and UI contract

Goal: a user can choose Try, Save for later or Not relevant on one existing Today action and recover that exact intention after refresh. Choosing an action is not evidence of a completed workout, eaten meal, adherence or a health effect.

## Reader checkpoint

`wellnessChoiceSchema` in the existing `shared/experience.ts` reads a versioned `wellness-choice` record in the existing encrypted experience store. It carries the action/version, current context/evidence/decision source versions, separate command revision and intent UUID, local day/offset, source lifecycle ID and actual choice time. It has no meal nutrients, exercise minutes, completion or medical fields; unknown future action identifiers can be retained as historical source text without becoming eligible actions. Existing private readers/export can round-trip it, while current activity/check-in summaries ignore it.

The existing settings reader accepts an optional server-owned `lifecycleId`; existing sources without it stay readable. It is a generation marker, not permission, a clinical approval, a measurement or a new user preference. The strict public settings patch cannot supply it. The reader-first checkpoint5e8334f introduced no writer. The current writer generates the lifecycle server-side only on an explicit settings write and preserves it through unrelated patches. Generic record POST/PUT and direct generic storage creation/update explicitly reject this kind, preventing a client from forging a reviewed decision snapshot.

## Implemented writer and UI

1. One source-locked command re-evaluates the known action, account, date, evidence and relevant constraints; no arbitrary free-text action becomes approved through a request body.
2. Capture and preserve one immutable intent ID/body for lost-response retry. Completed retries return the original receipt and do not move old intentions ahead of newer choices.
3. A settings/record lifecycle generation and actual source versions prevent old queued writes after clear/delete/recreate. Individual history erasure and broad experience/account erasure must not resurrect a prior choice or erase future arrivals. Source change retracts current projections; past choice history is not a current recommendation.
4. Keep choice history and quotas from displacing canonical workout/activity/check-in reads or preventing ordinary logging; export the real owned choice history and retain unknown/time semantics.
5. Existing Today remains one primary task, with source/Why and low-risk, feasible action eligibility. Add Try/Save for later/Not relevant only when the real command path is tested. A choice never automatically logs food/workout, computes adherence, changes goals or starts a model.
6. Actual App→HTTP→encrypted SQL selection/edit/reload, source/evidence correction, two accounts, stale/queued/lost responses, local-midnight and deletion/erasure;320/390 light/dark/keyboard. Relevant shared-store consumers and mandatory CI stay checked.

Progressive disclosure map: reader-only schema/storage changes add no metric or screen (surface/deep/fallback UI not applicable at this checkpoint). The writer's existing-Today surface will show a plain action/actual choice; Why exposes source/evidence and missing context; unknown/unsupported/stale states retain Add food/manual activity and actual original records. No one-second telemetry, clinical readiness or completion state is invented.

## Current implementation and engineering evidence

GET `/api/experience/wellness-actions` reads a consistent owned source snapshot; POST `/api/experience/wellness-choices` re-evaluates eligibility and source proofs under context→experience→user locks. DELETE requires the explicit history confirmation header and captured IDs/revisions; it rotates the lifecycle and preserves later arrivals. No migration, second datastore or permission granted by client metadata. Choice rows have their own quota and are excluded from ordinary tracking feeds; private export includes both.

Three deterministic families reuse the existing tools: record a usual meal, a cited general balanced-meal pattern, and familiar movement. Explicit current choices take precedence over default ordering. Missing/contradictory safety context withholds nonroutine options. A planned or logged activity takes priority over another movement suggestion. Source or local-day changes withdraw current projections. History remains a record of intention and can be deleted even when nutrition needs review. No clinical target, model, readiness score or auto-logged meal/activity.

The client captures one actor-bound command in minimal history state before POST, restores it after reload, resolves exact committed receipts without a duplicate POST and never rebases an unknown-outcome retry. Only an initial confirmed Try navigates to the existing tool; restored retries do not navigate automatically. Recipe library supports its existing screen through `?view=recipes`. Actual food is created only at the ordinary review/save step.

Three-layer UX map: **surface** existing Today card, one primary Try/Add food plus Later/Not relevant and Adjust; **deep** Why exposes cited goal sources/limits, Other options & saved choices exposes actual choice time/local date/offset/action version and targeted erasure; **fallback** missing/paused/stale/failed source keeps manual food access and original history, nutrition review and planned sessions retain priority, unknown save outcomes expose exact retry. There is no sampling-rate or health-effect inference. Known source dates remain unknown where unrecorded.

Evidence: five new SQL/API integration tests, affected shared-store readers/exports/settings tests, actual App→HTTP→encrypted isolated PostgreSQL choice/lost-reply/reload/source-change/account/deletion journey, Recipe library→review→single ingredient edit→explicit meal save/reload, four existing Today/onboarding/source/clock journeys, strict types/build/source guards. Matched320/390 light/dark captures use the same synthetic context and baseline Today component5e8334f; physical VoiceOver and independent Design acceptance NOT_RUN. Full integration receipt is recorded at publication rather than inferred here.


## Minimized canonical movement sources

The existing action read now carries `movementSources`: actual owned day-filtered activity/session source IDs and revisions, original entered start and update times, and explicit source states. Activity components remain separate; no parent total is counted again. Duration absent stays null. Session minutes are always scheduled minutes, including a session marked completed. Only explicitly confirmed valid set states count as completed; cancelled sets stay separate, described/planned states stay unconfirmed, reported bouts are not counted as sets. No original descriptions/notes, physiology, readiness or new totals engine. Source fingerprints are actor/content-bound, not permissions; the existing SQL owner filter and snapshot are still authority.

Today→Why→Movement source details exposes these original timestamps/units/statuses plus existing Activity/Training day links. Empty source means unrecorded movement unknown; unavailable source gives a manual-record fallback. The native disclosure stays mounted across invalidation while prior values withdraw. Deletion removes only the deleted source facts; a remaining session stays visibly scheduled. This is first descriptive Phase1 source projection, not Phase3 response/causality/adherence learning.
