# Entered lab date/time provenance — reader rollout

Reproduced in the actual App/API/encrypted database journey: a Pacific/Kiritimati user enters2026-10-15 without a time; canonical local-noon ordering stores2026-10-14T22:00Z. A history label using timestamp.slice(0,10) incorrectly called October14 the reported day.

Optional sourceReport.enteredDate (valid ISO calendar text) and enteredTime (HH:mm) retain the user's explicit entry separately from measuredAt. Time requires its date. A shared guard accepts explicit clocks within14 hours of the canonical timestamp; date-only metadata validates the whole calendar-day window across that offset range, without inventing a collection time or laboratory timezone. Known and source-only payloads share this validation. Existing payloads without metadata are unchanged; no inferred backfill or date migration.

Readonly source details preserve entered precision and explicitly qualify absent time. Date labels prefer explicit entry text; legacy fallback is labelled Recorded rather than Reported. Original canonical timestamps, offsets, units, values, chronological positions and clinical comparability calculations remain unchanged. Explicit entered values are user context, not verified laboratory facts.

Publish/verify this aware reader before normal writer emission. Future QuickLabEntry should capture its actual date/time input fields, preserving them across preview/receipt retries/correction-only, without rewriting old timestamps. Backout after writing must retain reader/strict-schema support. Isolated Neon smoke adds metadata to its existing synthetic report and checks storage/export. Local tests cover global offset extremes, DST-compatible clocks, invalid/leap dates, contradictory clocks, encryption/confirmation/source-only/export and legacy unknown precision. No independent clinical/native/source-pack acceptance inferred.

## Ordinary capture

After the aware reader is verified, QuickLabEntry writes the literal selected date and only an actually supplied time. An empty time emits no enteredTime; existing canonical local-noon ordering is retained. Preview, uncertain receipt retry, correction-only and explicit source-only rows use the same immutable captured context. No timestamps or old source facts are rewritten.

Actual App/API/encrypted database vectors cover UTC+14 and UTC−12 date-only entries, explicit00:00, and America/New_York spring DST03:30. Each asserts the literal entered day/time alongside a fixed expected canonical instant. Ordinary manual/paste/unit-confirmation, grouped history, legacy and source context paths remain verified. Broader date-correction workflow remains separate.
