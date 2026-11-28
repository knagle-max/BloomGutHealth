# Branding & UX review — Calculated Biomarkers & Biological Ratios
**Date:** 2026-11-04 | **Decision:** CONDITIONALLY APPROVE design direction, not clinical copy or software release.

## Sources read
- `Bloom_Biology_Calculated_Biomarkers_Specification_2026-11-04.md` (BIO proposed catalogue, eligibility, formulas, clinical boundaries).
- `Bloom_User_Testing_Calculated_Biomarkers_Ratios_Review_2026-11-04.md` (UT-CALC-4101–4112, CALC-T01–T16). No other named feature handoff located in Library search.

## Design disposition
Reuse **My Biology → Bloodwork → Calculated Insights**, not another dashboard. Present **3–5 eligible, nonredundant** metrics (UX target, not a universal scientific ranking). Keep original abnormal parent lab results prominently accessible. Mark every result `Calculated, not measured`. Show exact source and formula one action from card. Distinguish numeric eligibility from eligibility for guideline interpretation: a number may compute without supporting a personalized category.

### Interpretation
Guideline context → only with validated age/condition/population and exact source edition; lab reference → only lab's applicable interval; descriptive → numeric result/trend without traffic-light cutoff; research → optional advanced, no health verdict; specialist → unavailable/general explanation until approved professional logic.

### Reviewed fixture examples incorporated in editable prototype
- NLR 3.4 / 1.6 = 2.125 → 2.13, descriptive.
- Non-HDL 5.5 − 1.0 = 4.5 mmol/L, context-dependent.
- FIB-4 age 45, AST 40, ALT 40, platelets 200 = approximately 1.42, eligibility-conditional guideline illustration.
- HOMA1 missing verified fasting insulin; no calculation.
- Multiple CBC draws incompatible; no ratio.
- Corrected input pending; old derivative not current.
- No labs, loading, offline, source error.
All values **synthetic** and not the user's own lab results. The UI prototype does **not** execute or verify canonical arithmetic; Developer must own computation and tests.

### UX risk controls and necessary engineering
- No independent diagnosis or treatment from NLR, HOMA1, FIB-4, ACR or TSAT.
- Do not assign a universal good/bad NLR range. Do not imply FIB-4 = observed liver stiffness.
- Unit-specific TG/HDL and TyG conventions must be visible when implemented.
- Source original units, specimen ID, draw occurrence, original report and corrections always available.
- 320px, 200% zoom, keyboard/screen reader, dark mode, offline and export still need *actual app* tests; prototype has responsive CSS only.
- Missing value is not zero, and unknown fasting status cannot be assumed.
- Privacy-reviewed share/export must identify ratio as calculated and include formula version.
- Never auto nudge users to purchase testing to complete missing metrics.

## Delivery
- `prototype.html`: editable standalone responsive UI with functioning scenario and state selectors, result detail drawer, synthetic trend and illustrative FIB-4 guideline band.
- `COMPONENT_CONTRACTS.json`: component/state and data-binding interface.
- `ACCEPTANCE.md`: mapped UX and safety fixtures for Developer and User Testing.
- `ARCHITECT_PICKUP.md`: P0/P1 release gates and remaining review ownership.

## Sign-off
Branding direction conditional; no Biology/clinical threshold signoff, Legal review, independent uncoached participants, verified source-code calculation tests or deployment. Architect must reconcile with existing immutable lab observation and clinical rule services. Codex alone implements canonical computation and integration.
