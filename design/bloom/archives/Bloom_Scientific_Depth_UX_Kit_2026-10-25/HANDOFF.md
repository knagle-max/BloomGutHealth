# Bloom — Scientific Depth: Branding & UX Cross-Specialist Review
**Date:** 2026-10-25 (America/Regina)  
**Owner:** Branding & UX Specialist  
**Status:** CONDITIONAL APPROVAL for Chief Architect consolidation; editable design references delivered, not implemented, tested with users or legally/clinically authorized.

## Sources explicitly reviewed
- `Bloom_Biology_Scientific_Depth_Handoff_2026-10-25.md` — BIO-DEPTH-701–708.
- `Bloom_ML_Scientific_Depth_Partial_Data_Review_2026-10-25.md` — ML-DEPTH-801–807.
- `Bloom_Integration_Scientific_Depth_Review_2026-10-25.md` — INT-DEPTH-2026-01–05.
- `Bloom_Legal_Scientific_Depth_Review_2026-10-25.md` — LEG-DEPTH-901–906.
- `Bloom_User_Testing_Scientific_Depth_Cross_Specialist_Review_2026-10-25.md` — UT-DEPTH-1501–1508.
- Existing Bloom Scientific Insights UI Kit, concise-content UX, three-destination experience, restricted graphite preview convention.

## Overall decision
APPROVE WITH CONDITIONS. Default UI follows **Action → Why this? → Explore science**. Four scientific evidence modes are **provenance/claim classifications, not four top-level destination tabs**. No extra nav section or standalone molecular dashboard in the default user path. User can return to their original food/training decision without losing draft state. Clinical warnings and material limitations must remain visible, rather than hidden in disclosures. A no-omics account must still receive useful guideline-based actions and general science exploration.

## Design crosswalk
| Sources | UX disposition and asset |
|---|---|
| BIO-DEPTH-701/707, ML-DEPTH-802/807, UT-DEPTH-1501/1502, LEG-DEPTH-905 | Action-first evidence ladder, clear general vs personally measured labels; new SVG `action_evidence_ladder.svg` |
| BIO-DEPTH-702/703, ML-DEPTH-801/805, INT-DEPTH-01/02, UT-DEPTH-1503/1504 | Generic pathway with distinct personal observation overlays; new SVG `pathway_explorer.svg` |
| BIO-DEPTH-704, ML-DEPTH-803/804, INT-DEPTH-03, LEG-DEPTH-902, UT-DEPTH-1505 | Research-only simulator boundary with no fake numeric results and no public clinical feed; new SVG `research_boundary.svg` |
| BIO-DEPTH-705/706, INT-DEPTH-04, UT-DEPTH-1506 | Use existing Progress and Plan-change review components; explicit dated before/after without causal inference or silent history replacement |
| BIO-DEPTH-708, ML-DEPTH-807, UT-DEPTH-1507/1508, LEG-DEPTH-901/903/904/906 | User teach-back/negative fixtures; server enforcement, source licence and claims parity are hard release gates, NOT satisfied by label design |

## Incremental design requirements for Architect
**MKT-DEPTH-1801 · P0 — Decision-first compact evidence ladder.** User sees one approved action, short relevance statement, source class, and one CTA. `Why this?` reveals actual relevant inputs, limits and human outcome evidence. `Explore science` opens optional mechanistic details. Acceptance: basic action completed without traversing molecular graph; accessible Back retains context; one primary CTA; no parallel evidence dashboard. Crosswalk UT-DEPTH-1501; MKT-SIMPLE-1003; UT-COPY-1102.

**MKT-DEPTH-1802 · P0 — Verifiable source and evidence vocabulary.** Distinguish lab measured, provider reported, user entered, general mechanism, research association, explicit hypothetical assumption, simulated and unknown by *text plus icon*, date and source; never imply personal bacteria from reference populations. Acceptance: users correctly identify what's measured in them; incompatible 16S/shotgun/lab types don't share asserted quantitative status. Crosswalk BIO-DEPTH-701/703/707; ML-DEPTH-802; INT-DEPTH-01; UT-DEPTH-1502.

**MKT-DEPTH-1803 · P0 — No-test/partial-data resilience.** Useful conventional guidance remains when no genomic or microbiome report exists; generic pathways remain explorable. Missing, declined, stale, failed, undetected and incompatible differ. Acceptance: novice no-data task finishes; partial Viome-like import exposes correction without losing valid information; no fabricated personal taxa or zero for missing. Crosswalk ML-DEPTH-801/805/806; UT-DEPTH-1503.

**MKT-DEPTH-1804 · P1 — Decision-linked inspectable pathway.** Diagram stages food/substrate → organism or functional gene → enzyme/reaction → metabolite → potential host connection, with each edge showing established mechanism vs association vs hypothesis and a link to evidence; representative entities visually separate from personally reported ones. Acceptance: keyboard and screen-reader traversal reads node/edge meaning; tap opens studied population/source/limitations; user returns to the original choice. Do not suggest treatment based merely on path traversal. Crosswalk BIO-DEPTH-702; ML-DEPTH-804; UT-DEPTH-1504.

**MKT-DEPTH-1805 · P0 boundary/P2 feature — Research simulation abstention.** Experimental numerical flux belongs only to server-authorized research context under LEG-GATE, not daily planning, AI coaching or clinical exports. No solver/licence/validated inputs => no numeric output; show an unavailable/research explanation and a safe general-science return path. Graphite in-context preview only for authorized development testers; incident-disabled never visible. Crosswalk INT-DEPTH-03, LEG-DEPTH-902, MKT-REG-1207–1213, UT-DEPTH-1505.

**MKT-DEPTH-1806 · P0/P1 — Change transparency.** Approved evidence or corrected inputs may change suggested action; show *What changed / Why / What next*, dated old/new status, actual source and uncertainty. Preserve historical plan and measurement snapshots. Acceptance: correction/retraction fixture preserves old record and avoids causal claim. Crosswalk BIO-DEPTH-706; UT-DEPTH-1506; MKT-TWIN-1104.

**MKT-DEPTH-1807 · P0 visual/accessibility and release gate.** 320/375/390px, desktop, 200% text zoom, VoiceOver/keyboard, light/dark, Everyday/Athlete/Coach as authorized. No overflow/overlap; no nested wall-of-text panels; semantic safety messages always shown. Provider reference redistribution and legal consent/release status are externally gated. Crosswalk UT-DEPTH-1507/1508; MKT-LAYOUT-1301–1306; LEG-DEPTH-901–906.

## Suggested copy (not approved medical copy)
- Default: **“Try a fibre-rich side.”** “May help your nutrition goal based on general evidence.” `Why this?`.
- General pathway: **“How fibre can be fermented.”** “General biology — not a measurement of your microbiome.”
- No omics: **“No microbiome report added.”** “You can still explore the science and follow general guidance.”
- Personal result: **“Reported in your sample”**, not “produced by your microbes”; show assay/date/limitation.
- Research boundary: **“Simulation unavailable.”** “No approved model output is available. This does not mean the value is zero.”
- Caveat: **“Gene detection does not establish enzyme activity or metabolite concentration.”**

## Practical negative fixtures
No test; declined consent; genus-only 16S; shotgun gene potential; metabolomics lab with specified specimen; partial JSON and ambiguous units; stale result; reference-population assumption; hypothetical model offline; model online but permission denied; research result trying to appear in recommendation or export; retracted reference; plan update after correction; screen reader/zoom. For each assert claim status, correct permitted action, no false value, authorized detail access and text budget.

## Ownership and review state
Chief Architect deduplicates and stages within `docs/architecture/V06_HANDOFF.md`; Codex alone implements/tests/commits/deploys. Biology and ML approve mechanism/claim semantics; Integrations verify provenance and source rights; Security/Legal assess scope/consent and server controls; User Testing validates comprehension and burden. Existing Scientific Insights components should be **extended rather than forked**. The attached SVGs are editable concept/source assets, not deployed screens or proof of model efficacy. No independent scientific literature audit was undertaken here.
