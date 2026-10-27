# Subjective daily-focus response — reader stage

BIO-09 names explicit liked/disliked/intolerant/not-applicable/helped/no-benefit feedback. This increment defines a subjective response to the owner's stated daily focus. It is not a verified food identity, allergy diagnosis, treatment effect, clinical evidence or automatic ranking/personalization input.

An optional strict `focusFeedback` snapshot lives in the existing encrypted check-in payload. It records version1, response (or explicit cleared null), original stated focus/date/mode, server recording time and opaque receipt/previous-revision metadata. Legacy absence stays unknown. No new record kind, table, migration, guessed historical response or new capture provider is introduced.

`GET /api/experience/checkins/:id/feedback` requires the authenticated owner and a check-in kind. It returns minimal current source context, public subjective context and an opaque source revision. Foreign/missing/wrong-kind targets are404; missing adapter503 without fallback. Receipt internals are omitted from this projection. Revision binds owner/record/current focus-date-mode/current feedback, not unrelated numeric ratings: a later response action must patch feedback without replacing those ratings.

Generic record POST/PUT rejects supplied feedback metadata, and storage rejects equivalent direct generic mutation. Unaware updates preserve any existing complete snapshot, including its original context if the outer focus/date/mode changes. Read/preserve/update share the owner transaction lock. Unclassifiable stored feedback fails closed rather than being silently erased. Existing private export and record/account deletion include this data under their existing ownership boundaries.

The reader stage has no response producer or ordinary UI control. Before writing, deploy/verify this reader. The dedicated action must require current source revision and an idempotency key, patch only the response under the same owner lock, replay a matching receipt before CAS, reject stale/conflicting requests, and never overwrite unrelated ratings. A stale retry after a newer response must not replace it. Explicit clear retains a receipt/context; whole-record erasure remains separate.

Existing numerical weekly/Athlete calculations and external-provider prompts do not use the new response. Future automatic personalization remains subject to its independent approved rules/review. No new medical/provider right or grant is implied.

Evidence: strict enum/unknown/clear/context/revision tests; actual encrypted Express/PGlite owner/wrong-kind/legacy-preservation/forgery/export/deletion/corrupt-metadata tests; existing experience API/storage regressions; complete391-test run/types/build/inventories. Isolated Neon smoke reads an unknown legacy response from a real synthetic check-in before the existing shared-quota/export check. No real user data is used.
