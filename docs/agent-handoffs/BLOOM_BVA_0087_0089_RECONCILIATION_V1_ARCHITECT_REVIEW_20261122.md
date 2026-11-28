# Bloom BVA-0087–0089 — Architect review of reconciliation handoff V1.0

**Date:** 2026-11-22  
**Source status:** V1.0 inspected in exact original owner Shared Library ZIP, with accompanying standalone README and prior Biology review read.  
**Decision:** **ACCEPT_WITH_AMENDMENTS — as a reviewer-ready candidate reconciliation**, **NOT APPROVED CANONICAL MAPPING**, **NOT ASSET/GEOMETRY SIGNOFF**, **NOT CODEX IMPLEMENTATION AUTHORIZATION**.

## Provenance and exact source receipt

- Original shared ZIP: `Bloom_BVA_0087_0089_Reconciliation_Architect_Codex_Handoff_v1.zip`; **SHA-256** `6d7416ec98f51f77a20fa86ba981e6c42df01d11ab897cad28ae4e52a7bf45fe`; **14,983 bytes**, ZIP CRC valid, six regular files.
- Verified at both shared Library paths:
  - `/Bloom/Agent Handoffs/Bloom_BVA_0087_0089_Reconciliation_Architect_Codex_Handoff_v1.zip`
  - `/Bloom gut health/Agent Handoffs/Bloom_BVA_0087_0089_Reconciliation_Architect_Codex_Handoff_v1.zip`
- Companion standalone `Bloom_BVA_0087_0089_Reconciliation_v1_README.md` (10,079 bytes) and `Bloom_BVA_0087_0089_Biology_Reconciliation_Handoff_2026-11-22.md` also reviewed from the Library. Source README is present inside ZIP, SHA-256 `7d753ef6eeed932d5a16371d906dc233b53d4a6090b0b47c39c52ac9cb520e69`.
- ZIP members and respective SHA-256: `CROSSWALK_REVIEW.json` (75,835 bytes, `345344859500fe1791dd55313448c50fcc16d44a4269f33d40e506998fec4a8b`); `CROSSWALK_CANDIDATES.csv` (34,596 bytes, `570a5929ecf6ec7de9eec06e9e84eae39709042bc6f30fbbb0b540a033c9d62c`); `UNMATCHED_CANONICAL.json` (465 bytes, `2b9ab32f3f909292a8702aac17af5bc8a18faa0f0fe150d0bfd681d7b3ba398c`); `DECISION_REGISTER.csv` (2,319 bytes, `92c371b5bb9636a07f8c4c87cb205485c50a9e59c11073e29905e01550217e6e`); `SOURCE_RECEIPTS.json` (705 bytes, `a166e2b0b00714115a054491dfa0ca461ced7256168f9be37a71796ddeb0b253`); `README.md` (above).
- Original source baseline in handoff: commit `f7a36542b4d0faf6a8da93f6dbd3b521debb9901`, with current canonical architecture at `docs/visual-assets/BLOOM_SYMPTOM_CANONICAL_REGION_AND_GEOMETRY_DESIGN_MANIFEST_20261122.json`; **ZIP is preserved in shared Library, not automatically present in GitHub/Codex checkout**. The source `SOURCE_RECEIPTS.json` still says publication `not yet verified`, which is now superseded for Library-path existence by this architect verification; it is **not** evidence of GitHub binary upload or integration.

## What V1.0 actually establishes

| Dimension | Directly verified in original ZIP | What remains unproved |
| --- | --- | --- |
| Visual path rows | `CROSSWALK_REVIEW.json` has **49** path records, 23 front / 26 back | Original authoring geometry and actual touch/click area accuracy |
| Region identity | **41** unique provisional visual region IDs versus **47** canonical *design-review* region IDs; reported 21 distinct exact-name overlaps; **27 rows** classified `exact_name_match_unverified` because repeated views create extra path rows | Name identity does not establish clinical/anatomical equivalence or approved mapping |
| Candidate edges | `CROSSWALK_CANDIDATES.csv` has **58** proposed candidate rows (expanded from one-to-many) | Independent Biology, anatomy, laterality and Architect approval on each edge |
| Missing canonical proposals | `UNMATCHED_CANONICAL.json` has 10: `chest`, `chest_central`, `diffuse_non_anatomical`, `elbow_left`, `elbow_right`, `head_left`, `head_midline`, `head_right`, `neck_lateral_left`, `neck_lateral_right` | Whether these require text-only, refinement sheet or actual original-source new anchor |
| Decision register | **10** decisions `BMAP-D01..D10` with explicit `PENDING` status, owners and required evidence | No final decision may be silently inferred from a proposal |
| Geometry | Candidate source prototype x/y explicitly labeled unverified; canonical manifest's **77** binding anchors still null | Correct `0 0 320 820` body-source registration and actual device hit targets |

**High-risk cases identified by the review:** six paths are explicitly marked `conflicts_or_refinement_needed` for laterality: `front:pelvis`, `back:upper_back_left`, `back:upper_back_right`, `back:lower_back_left`, `back:lower_back_right`, and `back:sacrum`. These need a human-reviewed selection and canonical handling plan; they must not be auto-aliased to the nearest ID. Posterior laterality is often inferred from source ID/label because original posterior JSON has no explicit `side` field.

## Scientific and clinical acceptance conditions

The prior Biology review's `BIO-BMAP-01..08` and `BIO-BMAP-T01..T10` remain incorporated **as additional tests**, not replacements for the owner's eight acceptance groups. Biology **APPROVE WITH TARGETED SCIENTIFIC AMENDMENTS** does **not** mean approval of the 49 candidate mappings, marker policy or any production implementation.

- Patient anatomical left/right must be independently verified in front **and** rear. Symptom location is self-report geography, not pathology, organ, dermatome, diagnosis or triage.
- Original observation, event time, logged time, approximate/recalled precision, corrections and explicit episode identity, when actually known, remain distinct. Bilateral or both-view presentation must not multiply a single observation. Unknown episode count is **not** observation count.
- Rated, unrated and explicit zero cannot be collapsed. Candidate rings 1–3/4–6/7–10 apply **only** to an actually recorded compatible 0–10 scale. Current severity must not be invented from the historical highest report; `latest rated` with precise date is a policy **proposal**, pending user/Architect/UX/Science signoff.
- Marker count is independently defined source-observation count, never a severity measure or clinical assessment. Collision fallback must preserve accessible numeric truth even if the floating badge cannot fit.
- Account ownership, source revocation, correction/delete invalidation, sensitive symptom display and nonvisual list parity must be assessed on the eventual eligible app route.

## Architect amendments and dispositions

1. **Keep three distinct states per proposed row:** `candidate identity`, `verified anatomy/geometry`, `mapping approved`. `exact_name_match_unverified` remains `PENDING`, not an accepted ID. Preserve untouched 49 source visual identities and original user observations.
2. **Make the canonical 47-ID coverage audit a separate acceptance artifact.** The list of ten missing candidates is not permission to draw unverified new loci. Include text-first `diffuse_non_anatomical` and list/refinement fallback. Consider clear classification of canonical regions: direct candidate, multiple candidates, list/refinement only, not represented, deferred, or unresolved.
3. **For all six laterality-conflict rows, prohibit automatic projection.** Record the reviewer and selected policy or retain ambiguous selection. Explicitly evaluate broad midline categories versus left/right and posterior flank/lumbar overlaps. Do not merge source IDs based on suffix matching.
4. **Do not approve marker aggregation by design alone.** Decide latest-rated versus highest-period, explicit score zero, event-time cutoff, ties, correction/deletion and source-authorized UI after inspecting actual canonical symptom record code. Unknown/partial data cannot be recast as absence or normality.
5. **Preserve a separate milestone for design artwork.** Existing approved body PNGs are reused, while symptom overlay original editable SVG, source-measured anchors, hit paths, screen-reader/physical-device coverage and rights chain remain required. No screenshot-based guessed coordinates and no edits to BVA-0078/0079 Athlete muscle paths.
6. **Prevent broad acceptance-campaign drift.** `SYM-01..10`, owner eight acceptance groups and `BIO-BMAP-T01..10` become readiness-triggered proof obligations when this domain is eligible, not new GI tests or a command to build a second symptom store/engine.

## Publication and Codex boundary

**Architect review published to the existing GitHub branch as this nonpersonal source-review document.** The six original V1.0 machine-readable files remain available at exact Shared Library paths above; this GitHub review indexes and verifies them but does **not** falsely claim those binary/archive contents were copied into the repo. If a future Codex task requires the CSV/JSON bytes, authorize a source transfer into its checkout, compare ZIP SHA and member hashes above, then use these `PENDING` draft records rather than regenerating them.

**Active Codex task remains unchanged:** `NEXT_ACTIONS.md` GI-01..GI-10 actual-HEAD canonical-input/evidence inventory and genuine available synthetic baseline, **then STOP** for owner review. No runtime, migrations, protected deployment, external provider, release, canonical record mutation, score/triage logic or exercise/symptom implementation authorized by this intake.

**Final disposition:** **SOURCE_REVIEWED / ACCEPT_WITH_AMENDMENTS / CANONICAL_MAPPING_UNAPPROVED / GEOMETRY_UNMEASURED / IMPLEMENTATION_NOT_AUTHORIZED**.
