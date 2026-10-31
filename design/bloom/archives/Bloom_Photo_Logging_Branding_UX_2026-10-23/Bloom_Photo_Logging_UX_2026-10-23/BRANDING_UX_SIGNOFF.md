# Bloom v0.6 — Branding & UX Review: Photo-Assisted Meal Logging
**Date:** 2026-10-23 (America/Regina)  
**Reviewer:** Branding & UX Agent  
**Status:** **CONDITIONALLY APPROVED for Chief Architect consolidation; not implemented, usability tested, scientifically validated or release approved.**  
**Scope:** v0.6 research only; do not interrupt v0.5. Codex alone owns app code, tests and GitHub.  
**Reviewed source handoffs:** `Bloom_ML_Photo_Meal_Logging_Handoff_2026-10-23.md` (ML-PHOTO-01–08); `Bloom_Integration_Food_Photo_Review_Handoff_2026-10-23.md` (INT-PHOTO-2026-01–02); `Bloom_User_Testing_Photo_Logging_Consolidated_Review_2026-10-23.md` (UT-PHOTO-601–606). Earlier branded-food incident UT-FOOD-501–505 cross-referenced. No deployed-browser test conducted.

## Design judgment
**Approve the shared Photo → AI-suggested candidate foods → Review/edit → Confirm → Save journey**, provided that the photo UI feeds the existing canonical meal editor and deterministic nutrient evaluator. Do not create a photo-only meal tracker, imply that a photograph weighs a meal, assign zero to unknown micronutrients, or suggest that unobserved oils/allergens are absent. Free-first does not automatically mean a commercially approved or inexpensive model. Design emphasizes **corrected successful entries**, not flashy AI certainty.

## Component and acceptance handoff

### MKT-PHOTO-701 — Capture/consent entry | P0 privacy/P1 functionality
One approachable “Take or upload photo” route alongside barcode, type, recent and saved meals. Explain camera permission separately from any photo transfer/model processing; only name actual processing/retention semantics approved by Security/Legal. Display permission denied, privacy refusal, unsupported browser and offline alternatives without breaking manual food logging. **Acceptance:** photo capture is optional; permission/transfer denial still permits logging; source status is truthful, accessible and non-coercive. Maps ML-PHOTO-03/07, UT-PHOTO-605.

### MKT-PHOTO-702 — One reviewable draft, not automatic logging | P0 correctness
Editable ingredient rows in a single screen: candidate identity, visible vs uncertain, match/source, preparation, served amount vs actually consumed, quantity and units, remove/add/group. Use text labels “AI suggested,” “Confirmed by you,” “Database nutrition,” “Portion estimate,” “Not known”; text/icons not colour alone. Users can save **only after** deliberate review, while retaining explicit unknowns. A confirmed draft flows into the existing canonical editor/calculator. **Acceptance:** no nutrient totals before confirmed identity/amount/source; changing capture modality retains one draft; save is idempotent and gives confirmation. Maps ML-PHOTO-01–04, INT-PHOTO-01, UT-PHOTO-601/603.

### MKT-PHOTO-703 — Missing and hidden ingredients | P0 scientific integrity
Use only relevant optional questions, e.g. “Was there dressing or cooking oil?” “Was this shared?” “Did you eat the full serving?” Avoid default guessing or forced ingredient assertions. Offer “Not sure” and edit recipe/choose general dish. For blurry/scale-unknown photos, explicitly abstain and offer manual mode. **Acceptance:** a soup, salad, shared pizza and unfinished plate can be recorded without invented components, gram precision or allergen-free assertions. Maps ML-PHOTO-02/04/08; Biology signoff required.

### MKT-PHOTO-704 — Packaged-product recovery | P0 usability
When photo depicts KitKat or Michelina's packaging, move to **barcode/exact product variant/label transcription and serving confirmation**, not visual macro guessing. If an approved branded catalogue has no record, keep the photo/draft and offer a manual label entry or a visibly marked generic alternative with incomplete nutrients. **Acceptance:** preserve original typed description and brand; Canadian variants, labels, barcode-failure, rate limits and missing source get clear recovery. Maps UT-FOOD-501–505, UT-PHOTO-602.

### MKT-PHOTO-705 — Draft/error/retention states | P0 privacy and recovery
Designed states: awaiting photo, uploading, analyzing, draft ready, unable to identify, low-confidence component, no nutrient match, slow/offline, rejected consent, provider unavailable, saved, and photo deletion. Status messages give a next action. Never imply image deletion or provider non-retention unless implementation verifies it. Preserve draft only according to approved retention policy. **Acceptance:** user can leave/reopen where permitted, retry without duplicate meal and use manual logging on every recoverable error. Maps ML-PHOTO-06/07, UT-PHOTO-605, INT-PHOTO-01.

### MKT-PHOTO-706 — Reuse and accessibility | P1 / P0 accessibility
Reusable confirmed-meal suggestion with explicit per-account consent and a prominent edit path. Do not reuse other users' photos or infer sensitive personal traits. WCAG 2.2 AA; 320px reflow; keyboard, screen reader/VoiceOver, 200% zoom; camera controls have accessible names; editable rows have clear semantic labels. Capture+correct+save measured versus barcode, text and saved-meal flows. **Acceptance:** tested completion, errors, time to accurately save, correction burden and misunderstanding by novice, busy-parent and Athlete personas. Maps ML-PHOTO-05/08, UT-PHOTO-604/606.

## Proposed component set / reusable design tokens
- `PhotoCaptureChoice` — neutral entry point and consent/permissions explanation.
- `PhotoMealDraft` — single editor surface reusing canonical food row patterns and status badges.
- `FoodCandidateRow` — name, source, portion, status, Edit/Remove, uncertainty details.
- `UnseenIngredientsPrompt` — optional, nonleading material clarification.
- `BrandedPackageFallback` — barcode/label/manual/generic branches.
- `PhotoAnalysisState` — accessible progress, abstention, provider failures and recovery.
- `PhotoProvenanceDetails` — reveal candidate model/source version and user changes; no false numerical confidence.

Same Bloom component library. Everyday green primary actions, Athlete blue primary actions, Coach indigo only if access scope permits; uncertainty and evidence labels retain identical meaning across all modes. Core review uses 16px body text, 44px preferred control targets, generous mobile vertical spacing, one visible primary action. Do not show uncalibrated probability percentages or fake calorie analysis.

## Required tests / example tasks
1. Chicken/rice/vegetables — identify, adjust each amount, explicit save, parity with manual FDC.
2. Salad with hidden dressing — do not assign zero oil; user may choose unknown.
3. Curry/soup — vague picture triggers editable recipe or general-meal route.
4. Shared pizza/leftovers — distinguish served and eaten fraction.
5. KitKat/Michelina's Canadian labels — exact package confirmation or honest fallback.
6. Blurry/offline/provider outage — retain draft when permitted and fall back safely.
7. Camera permitted but external processing declined — no upload; manual still works.
8. Malicious words and bystanders in a photo — no instruction-following; show only approved data.
9. Previously saved meal — per-user suggestion, user correction takes priority.
10. Mixed units, old food database version, source change — no silent nutrient change or duplicate save.

## Cross-team approval gates
- **Biology:** food identity, hidden ingredients, portion claims, calories/nutrients, allergen wording, measured-vs-estimated semantics.
- **ML:** candidate schema, honest uncertainty, failure/abstention, benchmark datasets.
- **Integrations:** approved food sources, canonical food ID versioning, provider portability, licence/cost, latency.
- **Security/Legal:** camera/upload consent, image metadata, retention/deletion, account isolation, vendor privacy, cross-user learning, in-image prompt injection.
- **User Testing:** real mobile/VoiceOver tasks, benchmark against manual/barcode/recent meal; source-only review is not proof.
- **Chief Architect:** map 701–706 to ML-PHOTO/INT-PHOTO/UT-PHOTO requirements without creating separate ingestion stack; approve implementation scope.
- **Codex:** sole implementation/deployment owner; record branch SHA, test evidence, and review-ready screenshots.

## Feasibility / costs / status
Visual patterns/icons and editable mockups have no external API fee. Basic editor UX is moderate design/engineering work, while image inference reliability and hosting may be high ongoing cost. The candidate AI model, licensing, benchmark thresholds, deployed photo analysis and real-world accuracy are **not verified**. **Branding & UX sign-off is conditional for architectural intake only.**

## Artifact inventory
`PHOTO_REVIEW_WIREFRAME.svg`, `PHOTO_FALLBACK_WIREFRAME.svg`, `photo-status-icon.svg`, and this Markdown handoff are standalone editable design references. Codex should adapt existing components rather than import a competing data or component model.
