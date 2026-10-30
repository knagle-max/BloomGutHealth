# Bloom — Clickable Microbial Composition: Architect/Developer Handoff
Version 1.0 | 2026-10-30 | Owner Branding & UX | MKT-TAXON-3001–3007
**Status:** Proposal. No implementation, scientific claim approval or accessibility validation.
**Sources:** Bloom_User_Testing_Clickable_Bacteria_Scientific_Profiles_2026-10-30.md (UT-TAXON-2801–2808); Bloom_Biology_Organism_Profile_Review_2026-10-30.md (BIO-TAXON-2901–2905).
**Design assets:** This repository delivery branch contains UX_CONTRACT.md and microbial-profile-sheet.svg. The SVG is an editable structural reference, not scientific approval.

MKT-TAXON-3001 P1: All taxon rows open a single accessible research sheet while keeping sort, date, sample and scroll.
MKT-TAXON-3002 P0: Clearly separate exact source observation from general research; never imply relative abundance measures function/metabolites.
MKT-TAXON-3003 P0: Evidence badges classify *claims*, not universal species goodness or badness. Include archaea under "Microbial composition & change".
MKT-TAXON-3004 P1: Binding progressive scientific content hierarchy, copy states, actions, and mobile/desktop behaviors as UX_CONTRACT.md.
MKT-TAXON-3005 P1/P0 truthfulness: All 20 fixture organisms map by identity and source observation; unknown reviewed content uses honest fallback.
MKT-TAXON-3006 P0: Assay resolution/strain limits, claim-source withdrawal, source provenance, synthetic status, privacy, accessibility.
MKT-TAXON-3007 P0 delivery: Dev transfers source files from design/microbial-profiles-2026-10-30 into enhance/bloom-experience, updates design manifest, implements only after Architect reconciliation, returns SHA and rendered evidence for UX signoff.

**Architect:** Resolve backlog duplication and technical/safety dependencies; do not arbitrarily redesign the approved UX hierarchy. The Biology reviewer authorizes scientific copy, not visual design; Developer owns production code, tests and deployment.
**Codex pickup:** git fetch origin design/microbial-profiles-2026-10-30; access design/bloom/microbial-profiles/2026-10-30/. Import these exact files to development branch; check GitHub readback and commit SHA. ZIP in Library is optional backup only.
**Acceptance:** 20-taxon fixture; same original percent/date; supported vs unsupported assay claims; unknown profile; keyboard, VoiceOver, dark/light, reduced motion, 320px/200%; focus return; no account leakage; meaningful scientific comprehension. Nothing accepted until exact-build visual review and Biology signoff.