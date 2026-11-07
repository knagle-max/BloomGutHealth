# Preserve unsupported lab source rows explicitly

Same390×1000 light theme, synthetic source report/date/lab/identifiers and pre-save review stage. Baseline03ec914 has a supported ALT and three error rows; after the same Preview action, the new flow additionally requires the explicit **Keep2 source-only rows** action. Neither screenshot state has saved any row. Original PNGs are retained with annotated copies. This is a new reviewed preservation path, not automatic clinical parsing.

1. **Before:** the threshold/unknown-unit and qualitative rows can only remain errors; only ALT is ready to save. **After:** the genuinely malformed row stays correctable while the two explicitly chosen source rows are reviewable.
2. **After:** `<0.50`, the original source unit, `Negative` and missing-unit state retain their original meaning as text. No value is coerced or guessed.
3. **After:** every such row states **Source record only — no interpretation** and retains its exact original row and arbitrary reported heading.

The actual App/planner API/encrypted embedded PostgreSQL journey verifies no write before review, exact import/row/heading/identity persistence, lost-response one-row receipt recovery, correction-only acknowledgment safety, source history, supported clinical outputs unchanged, source-only deletion preserving clinical plans and mobile reflow. The baseline and after use the same canonical schemas and source fixture; the historical UI surface is loaded from Git for comparison. Real clinician/native/user acceptance and newly referenced editable source-pack fidelity remain pending.

Reproduce: scripts/qa/source-only-lab-journey.mjs, optional BLOOM_SOURCE_ONLY_BASELINE=03ec914 and BLOOM_SOURCE_ONLY_EVIDENCE=/tmp/source-only-lab-evidence.
