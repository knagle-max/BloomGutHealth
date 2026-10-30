# Canonical activity components v1 — Exercise UX v1.2

Owner architect9a481c2/ceac54e, b2a6e8c/82d1fa5 and imported original v1.2 Amendments A/B. Existing `kind:activity`, account-owned encrypted experience_records, create receipt route and owned PUT/export/delete remain authoritative. One root event, not one database row per recognized activity/set. No automatic session/calendar duplication.

## Data

Existing numeric minutes remain supported; null is explicitly unknown. Optional distanceM is reported canonical metres, not inferred. Optional components v1 contains1–20 stable-UUID activity parents with title, app menu identity, reported/suggested/unclassified match status, nullable minutes/distance, and optional actualSets. Across a record: at most100 child sets and unique parent/set IDs. Children reuse actualSets v1, with stable UUID, reps/loadKg nullable, explicit completed, optional kg/lb display/source unit, side and described/planned/cancelled state. Planned/cancelled cannot also be completed. Unknown is not zero; no set completion is inferred from text.

Root title/minutes/distance/flat actualSets are compatibility projections **computed by the server from canonical children**, not a second independent truth. Partially known duration is labelled as known contributions with missing activity duration(s); source views expose names and child rows. No energy/food credit or physiological score. Legacy omission is not a measurement or completion.

Capture v1 preserves exact first typed description and capture method under all updates. A separate optional reviewedDescription allows visible text edits without losing original source; reviewed rows do not silently reparse. Root source remains manual. Common labels/word rules are app-authored, not a licensed/reviewed MET or medical taxonomy. Parser only proposes explicit bounded minutes/km/metres and reported strength patterns, including the exact compound v1.2 example; missing/ambiguous quantities stay unknown. All routes converge to the same editable review and explicit save. Repeat uses fresh root receipt/child IDs/date and resets effort/completion; separate deliberate workouts stay separate.

## Persistence and safety

Existing create receipts and account advisory locks apply. New record writes and all children are one encrypted transaction. Updates preserve omitted optional observations and original capture. Unaware editors may change compatible metadata; attempts to change legacy scalar type/duration/observations of a component record without component review return409 instead of overwriting children. Component-aware updates recompute projections; ordinary owned PUT behavior remains. Cross-user references do not confer access; only an owned root record is read/written/exported/deleted. No raw description in logs or external parser call.

No migration/table/provider introduced. **After extended records exist, rollback must retain compatible decoders/projections/preservation.** Disable new capture UI or use component-aware manual fallback; never deploy old decoders or fill absent duration with zero. Original asset imports alone do not activate runtime.

## Verification / open gates

Parser/schema/API/encrypted storage tests cover compound data, set2-only edit, parent preservation, stable IDs, duplicate/planned-completed rejection, partial fields, root projection, old editor conflict, owner/export/delete and safe create retries. Actual browser exercises actual mode settings, review/Back/source, save/reload/mode, per-set units/status/side/remove/add/duplicate and Today/Progress. Physical-device/VoiceOver/200%zoom, hosted authenticated and independent Branding/User Testing acceptance remain separate. MET/muscle/voice/device and advanced physiology remain gated; no claim that all crosswalk IDs are accepted.
