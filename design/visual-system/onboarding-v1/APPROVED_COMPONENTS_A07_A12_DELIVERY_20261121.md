# Bloom — Approved Onboarding Components A07–A12: Architect & Codex Handoff

**Approved by owner:** 2026-11-21  
**Branch:** `enhance/bloom-experience`  
**Scope:** Owner-approved design candidates and components for exactly three onboarding steps (Goals → About you → Health context) and the *first regular dashboard*. This handoff is NOT runtime integration, compliance/consent signoff, deployed UX, or proof of actual responsive rendering.

## Verified deliverables

**Canonical source archive:** Shared Library `/Bloom gut health/Agent Handoffs/Bloom_ONB_Approved_Design_Handoff_2026-11-21.zip`. It contains six unmodified source-package ZIPs, a `DELIVERY_INDEX.json` with SHA-256 and a `README.md`.

**Separate index:** `/Bloom gut health/Agent Handoffs/Bloom_ONB_A07_A12_Approved_Delivery_Index_2026-11-21.json`.

| Registry ID | Source-package ZIP within combined archive | Design approval | Code/runtime |
| --- | --- | --- | --- |
| ONB-A01–A06 editorial imagery | `Bloom_ONB_Six_Goals_Approved_2026-11-21.zip` | Six approved photos; revised green/blue runner for Athlete | Not installed |
| ONB-A07 | `Bloom_ONB_A07_Goal_Cards_Review.zip` | Interactive goal card state prototype approved | Not integrated |
| ONB-A08 | `Bloom_ONB_A08_Progress_Navigation_Review.zip` | Three-step progress and navigation prototype approved | Not integrated |
| ONB-A09 | `Bloom_ONB_A09_Four_Approved_Icons_2026-11-21.zip` | All four editable SVG icons approved | Not integrated |
| ONB-A10 | `Bloom_ONB_A10_Expandable_Forms_Review_2026-11-21.zip` | Form states, collapsible context, prototype consent/error approved as design | Not integrated |
| ONB-A12 | `Bloom_ONB_A12_Responsive_Compositions_Review_2026-11-21.zip` | Integrated responsive compositions approved | Not integrated |

A07 and A08 and A10 and A12 contain `index.html` review prototypes. A12 has URL parameter examples `?step=0&theme=everyday-dark`, `?step=1`, `?step=2`, `?step=3` (dashboard destination, NOT fourth mandatory step). These prototypes store no production data.

## Design vs missing assets

- Owner-approved **photos** for six goals do NOT satisfy pending `ONB-A01`–`ONB-A06` *individual SVG icon* requests. Architect should audit existing PremiumIcon/brand glyphs and approve reuse or request final SVG exports. Do not falsely close the icon requests.
- `ONB-A11` is conditional: reuse existing editorial background where workable, not required for onboarding.
- A07/A08/A10 are specifications for working DOM components, not a production-ready imported JavaScript onboarding application.
- Screen 3 uses exactly four optional health context groups: Medical conditions; Medications and supplements; Food allergies and intolerances; Dietary preferences. No required data-upload selection. No forced import.
- Screen 2 obtains birth year/date of birth (rather than treating an age spinner as an authoritative date), with assay-dependent sex-for-reference context and optional height/weight/activity, with units and unknown/skip.

## Required implementation sequence

1. **Architect**: reconcile with `docs/agent-handoffs/Bloom_User_Review_Onboarding_Handoff_2026-11-21.md`, `docs/agent-handoffs/Bloom_Onboarding_UX_Asset_Review_2026-11-21.md`, current `shared/experience.ts`, and one architecture queue. Existing accounts bypass onboarding; no parallel status machine. Establish canonical goals/profile/medical records, source, permissions and versioned resume before merge.
2. **Codex**: retrieve canonical combined ZIP from Shared Library, verify checksums, extract to an agreed `design/visual-system/onboarding-v1/` source directory and copy only approved runtime-safe SVG/WebP assets to approved frontend paths. Do not treat browser prototype as production app. Keep original art metadata, IDs and checksums.
3. Render one-of-six primary goal choice using semantic radio controls; don't require secondary goals or gate biological systems by goal. Preserve Back/Continue, Save & Exit and resumed state with separate skip on optional Step 3. Explicit consent must be independent, granular, revocable, and NOT granted by Finish Setup.
4. Bind optional conditions, medication and supplement records separately, allergy vs intolerance, dietary prefs, unknown/not provided/confirmed none and contextual sex-for-lab-range with correct source provenance. Avoid creating false normal/absent records.
5. Persist after each step; account scoped, idempotent retry, resume, changed profile edits, and existing-account bypass. First regular dashboard zero-data state: prompt one useful action and keep Log food, Import bloodwork, Add health info readily accessible.
6. Test real app and screenshot the **same SHA** at widths **320, 390, 768, 1440** for Everyday Light, Everyday Dark, Athlete Light, Athlete Dark; keyboard, VoiceOver, 200% text zoom, forced colors, focus restoration, 44px touch targets, reduced motion, loading/error, rejected consent, save fail/retry, start/resume, account switch and revoked permissions. Review image crops for every goal and whole dashboard.
7. **Biology/Security/UX** sign off source/clinical context, privacy, consent and real interactive journeys. Mark `INTEGRATED` only on actual source installation; `VERIFIED` only after independent acceptance. Library upload and owner prototype approval alone qualify only as **DELIVERED — design approved**.

## Integrity and availability

The combined package and README/index were uploaded and verified in Shared Library; the index inside the ZIP contains individual SHA-256 hashes. Original binary source lives in Shared Library, **not** embedded into this GitHub markdown or committed as production media. The registry is `design/visual-system/ASSET_REQUEST_REGISTRY.md`.

**Open blockers:** live runtime integration, accessible browser/device testing, canonical consent/science source mapping; six original SVG goal icon requests pending independent reuse/production decision. No missing item is automatically counted as complete.
