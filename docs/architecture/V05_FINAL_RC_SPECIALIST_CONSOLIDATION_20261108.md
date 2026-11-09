# Bloom full v0.5 final RC — Chief Architect consolidated specialist disposition
**Date:** 2026-11-08 | **Repository:** `knagle-max/BloomGutHealth` | **Branch:** `enhance/bloom-experience` | **PR:** #1

## Authority and evidence boundary
This is a source-grounded reconciliation of four **original specialist handoffs**, all copied verbatim into `docs/verification/specialist-final-rc/`. It is not a fresh independent user/hardware test or clinical signoff. Treat the final full-v0.5 owner RC review as the **only user approval checkpoint**. Routine scoped correction, source verification, engineering tests and preview commits do **not** require owner/specialist interim signoff.

**Specialist originals:**
- `Bloom_v05_Final_Independent_User_Testing_RC_Review_2026-11-08.md`
- `Bloom_v05_Final_Biology_RC_Review_2026-11-08.md`
- `Bloom_V05_Final_RC_Designer_Review_2026-11-08.md`
- `Bloom_Integration_Full_v05_RC_Final_Review_2026-11-08.md`

**Reviewed engineering app:** `d20e384b9223bef553f6a0def273f0d697028846`. GitHub Actions `42533189930` reported `672/672` passing, later head `f077da1aade3da240180c5bdccc5981702603205` contains evidence/QA publication changes and passed exact-head CI `42536362821`. Render review `https://bloomguthealth.onrender.com/` reportedly matched that head at final UAT inspection. Developer's authenticated hosted synthetic tests and isolated `review/bloom-v05` Neon binding are **engineering evidence**, not independently repeated human tests. No public release or main merge has been authorized.

## Decision: ONE specifically verified P0 code repair before final RC, no blanket reopen
### RC-SCI-01 — vitamin D assay identity (reproduced in source)
At current inspected HEAD, `client/src/components/LabMarkerEducation.tsx` has:
```ts
const assayUncertain=profile.assayIdentityRequired&&!/25[\s-]*(?:oh|hydroxy)|1\s*,\s*25|dihydroxy/i.test(point?.method||'');
```
It incorrectly allows `1,25-dihydroxy` and unspecified `dihydroxy` as enough to confirm **25-hydroxy vitamin D** status context. Correct the display-path check with explicit positive identity for supported `25(OH)D` / `25-hydroxy` and explicit rejection of `1,25`, `1,25-(OH)2`, `calcitriol`, unqualified `dihydroxy` and absent identity. Prefer a shared authoritative analyte/assay identity resolver over broad regex if existing source metadata supports it. A source value, unit, interval or original report must never be rewritten or discarded. If ingestion can mis-map 1,25 to supported `vitamin_d`, add a compatible upstream guard. Add adversarial tests at result and importer level:
1. Explicit supported 25-OH assay with compatible source interval and units enables contextual interval wording.
2. Explicit `1,25-dihydroxyvitamin D`, `1,25-(OH)2`, `calcitriol` abstain.
3. Generic `dihydroxy`, missing/blank method, or ambiguous source label abstain.
4. Out-of-bounds source ranges/invalid unit or uncertain observation remain unknown; provenance untouched.
This is a P0 **for the affected interpretation only**, not a reason to block Food, account, activity, unrelated labs or v0.5 progress. Fix/verify/commit on the existing branch, then freeze a **new exact application SHA** and rerun affected type/unit/lab/security checks plus required CI/Render release verification. Do not claim the older 672 pass validated the corrected code.

## Other specialist findings: risk and targeted closure, not unproven P0
### User Testing
**Disposition:** engineering positive; no new independently reproduced P0. Twelve essential journeys have engineering evidence, **not** independent uncoached human/iPhone/VoiceOver execution. Specific P1 acceptance questions are: first meal-to-edit ease; direct access to Bloodwork category explorer from My Biology; obvious organism-list profile entry; optical premium design quality; physical screenreader/mobile usability. Confirm on actual preview where accessible, or disclose `NOT TESTED`; do not invent a “Bland/SaaS” defect or restart UX due only to absence of screenshots.

### Design
**Disposition:** final visual PASS **not granted** because final rendered product was not independently inspected. Compact bloodwork inline SVG icon system and scoped 76–92px rows are present, but newer owner-supplied ten high-detail PNG/WebP preferred category illustrations were **not visible in the expected public path** at Designer's source inspection. Exact archive is in shared Library `Bloom_Lab_Icons_FIXED_All_10_2026-11-07.zip`. Codex should resolve whether those originals are imported, and use legible raster on truly appropriate 64–96px slots and 24px SVG in compact rows where 40px raster is muddy; avoid restoring giant 130–150px cards. Inspect 390 and 1440 across Everyday/Athlete light/dark with 320/768/200% critical states; test art crops, text contrasts, disclaimers and CTA clearance. Owner explicitly removed **screenshot deliverables and interim specialist visual signoff**, NOT actual visual QA. Summarize actual browser results and uncertainties in the final packet.

### Integration & Data
**Disposition:** engineering checkpoint conditionally acceptable; no newly reproduced current critical integration defect. Its earlier production-named Neon preview issue was superseded by an isolated schema-qualified `review/bloom-v05` preview binding per developer evidence. Don't reopen it as a historical global blocker without fresh contradiction. Pin **application SHA, evidence SHA, deployed Render SHA, preview DB binding/retention, and exact CI** separately. Report independently verified vs developer-reported evidence separately. Real, unredacted arbitrary PDF semantic PII/clinical interpretation, all Canadian external providers, native wearable sync, backup/vendor retention, and physical accessibility weren't independently certified. Preserve disabled external features, source metadata, account isolation, no cross-owner reads, no unverified diagnosis. Add independent two-account synthetic hosted smoke and specialized PDF/privacy cases if an authorized safe test environment is available; treat missing independent witness as `NOT RUN` rather than proven bug. Do not force unsafe production-DB writes, paid-provider activation or sensitive uploads to close a paperwork checkbox.

## Codex finite actions
1. **Fix vitamin D assay identity + tests** (the one source-proven release-critical issue), preserve the source evidence.
2. **Freeze new app SHA** and run focused tests, full CI/build and Render/preview fingerprint; compare application/evidence/QA SHAs explicitly. No stale pass transplant.
3. **Audit final visible navigation/graphics** on a working preview: Food composer→save→edit; My Biology→bloodwork marker and organism profile; Today/Progress/Athlete/Profiles desktop and mobile, all four theme combinations. Record actual pass/NOT RUN. Preferred detailed bloodwork icons optional in compact navigation if optical legibility is worse, but original owner request remains a bounded P1 design fidelity followup.
4. Confirm safe isolated review database and synthetic account behavior without touching prior production-named records, and record provider/PII/backup/rights/physical-test residuals accurately.
5. Deliver **one final complete v0.5 RC packet** with immutable app/deployed/CI hashes, concise pass/limited/not-run matrix and owner smoke journey. Only then ask owner to review and authorize `main`. No interim prompts, separate specialist gates, screenshots as deliverables or v0.6 expansion.

## Disposition
**APPROVE** engineering trajectory and consolidated owner review approach.
**CHANGES REQUIRED** for narrow vitamin D analyte-identity bug before representing the RC as scientifically safe.
**NO NEW GLOBAL STOP** from the three other specialist documents; they require truthful evidence classification and scoped follow-up.
**FINAL OWNER RC REVIEW PENDING** after corrected application passes its exact release checks.
