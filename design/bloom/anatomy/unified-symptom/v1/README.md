# Bloom unified symptom body map — BVA-0087 / BVA-0088 / BVA-0089

**Design package / visual handoff, not production implementation.**

## Component relationship
- **BVA-0087 — Anterior map**: approved visual direction, 23 **provisional** front locations.
- **BVA-0088 — Posterior map**: visually approved and locked, 26 **provisional** back locations.
- **BVA-0089 — Shared markers**: approved and locked concentric-ring grammar, unrated marker, deterministic badge fallback.

Both maps use the exact existing Bloom 320×820 sculpted body PNG assets and transparent per-region hit paths in one common prototype. Region keys remain namespaced by front/back in runtime state.

## Marker contract
- Severity explicitly supplied 1–3/10: ring r=14; 4–6: rings 10,17; 7–10: rings 8,15,22. One center dot. Reported but unrated: hollow locus. No observation: no marker.
- Count >1 gets a ×N badge; count not inferred from severity. Candidate positions: UR, UL, LR, LL with outward steps 0, 7, 14, 21; stable manifest ordering; 320×820 bounds; no intersection with marker protected radii (22/27.5 selected/31 focused), or existing badges. If none fits, hide badge but keep count in accessible selected-location readout.
- Keyboard focus and pointer selection have separate visuals.
- These are design-only example severities and counts. No health, tissue, diagnosis, activation, trends, or aggregation claims.

## Review workflow
Open `interactive-demo.html` in a browser. Switch Single / Six+six / Dense ten+ten / None and Everyday/Athlete. View preview PNGs in `previews/`—captured from the actual HTML.

## Integration gate
- Codex read-only GI-01–GI-10 baseline, owner approval, canonical symptom regions and laterality rules, backend permission and missing-data semantics, clinically reviewed language, complete VoiceOver/TalkBack testing, responsive QA all remain outstanding.
- Do not infer live findings or create a parallel symptoms data model.
- Frozen approved body images and marker visual grammar remain unchanged. This combined demo is a review composition, not a replacement for existing approved app code.
