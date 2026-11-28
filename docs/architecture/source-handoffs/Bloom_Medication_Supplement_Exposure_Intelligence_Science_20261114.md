# Bloom — Medication & Supplement Exposure Intelligence
## Science & Biology Specialist Cross-Agent Handoff | Response Intelligence Addendum

**Date:** 2026-11-14  
**Version:** 1.0 — proposed P1 foundational extension  
**Owner:** Nutrition & Biology Specialist  
**Recipients:** Chief Architect & Integration Lead (decision owner); Developer (post-approval); Design/UX; Security & Privacy; Legal/Regulatory; ML/Intelligence; independent User Testing  
**Related proposal:** `Bloom_Response_Intelligence_Science_Handoff_2026-11-14.md` (BIO-2026-109–115)  
**Repository:** `knagle-max/BloomGutHealth`  
**Status:** Proposal for architect reconciliation, not developer authorization, current repository verification, clinical validation, or implementation confirmation.

## 1. Decision requested

**Accept a longitudinal Medication & Supplement Exposure Intelligence capability as a P1 dependency of Bloom Response Intelligence.** A list of currently scheduled medications or supplements does not establish which compounds a person actually took during the relevant window before blood testing. This is a critical source of exposure misclassification, missing confounding variables, misleading biological explanations, and safety risk.

**North star:** At quarterly bloodwork time, Bloom can reliably answer: *What prescription drugs, over-the-counter medicines, supplements, and relevant active compounds were prescribed/planned, plausibly consumed, confirmed consumed, skipped, paused, changed, or unknown during the preceding biomarker-specific response windows?* It must do this with as little user effort as practical.

**Guiding principle:** Capture detailed actual use when it is convenient, preserve uncertainty when it is not; **never represent the intended regimen as confirmed adherence.** Do not treat missing logs as missed doses, and do not treat lack of a missed-dose report as adherence.

## 2. Minimum viable user experience

### 2.1 Onboarding once, not daily paperwork

- Let users **add a product in seconds** via barcode, bottle/label photo plus user verification, product catalogue search, imported medication list, or manual plain-language entry. AI/image recognition is a *draft* only; user must confirm product identity, strength, ingredient composition, route and dosage. If confidence is low, preserve unknown and request focused correction rather than invent.
- Separate **medication**, **OTC**, **supplement**, **combination supplement**, and **other exposures**; make the taxonomy expandable without forcing clinical jargon on users.
- Capture product/ingredient, strength per unit, actual per-dose quantity and units, route (oral/injection/topical etc.), schedule and indication/purpose if voluntarily provided; start date (exact or approximate), prescriber when relevant, as-needed status, and source/confidence.
- Make compound schedules easy: daily morning/evening; specific days; every N days; weekly injections; with meals; alternating days; cycles (e.g., five days on/two off); temporary courses; PRN/as-needed. Store **timezone-aware intended occurrence**, recurrence version and flexible time windows, not only a textual string.
- Store branded products *and* normalized **active ingredient identities and amounts** separately. Overlapping ingredients from multis, zinc+copper formulations, vitamin D blends, protein powders, fortified food and other supplement sources should be checkable while preserving unknown assay/bioavailability/label ambiguity.
- Optional shared routine groups ('morning vitamins', 'bedtime', 'weekly injection') support a single action for multiple items while remaining separable for per-item exceptions.

### 2.2 Default capture: lightweight and nonpunitive

- Default should NOT require confirming every scheduled pill every day. Let users choose **off / changes-only / weekly recall / daily grouped checkoff / each dose**. Accessibility and preferences should not disable the integrity of unknown states.
- **One-tap grouped confirmation** ('I took my usual morning routine') explicitly records the grouped medications as *user-confirmed* for that occurrence. Provide a quick edit ('except magnesium') before saving and reversal afterward.
- **One-tap exceptions:** 'skipped', 'taken late', 'different amount', 'paused', 'ran out', 'stopped', 'started', 'not sure'; don't demand a reason, but offer optional reason categories (forgot, intentionally paused, side effect, supply, clinician change, travel).
- For **weekly recall**, offer a compact question per relevant routine, with natural estimates ('all days', 'most days', 'about half', 'a few days', 'none', 'not sure'), timeframe shown, and optional numeric refinement. This stores a **period-level self-report with uncertainty**, never manufactured individual administration timestamps.
- **PRN medications** should not appear as 'missed' when no dose was needed; record exposure only when taken or retrospectively reported. Avoid inappropriate adherence denominators for PRN and flexible schedules.
- Let users backfill approximate dates ('I started this sometime in June') and state they were recalled later. Distinguish occurrence time from recording time.
- Smart prompts should concentrate on **new starts, discontinuations, dose changes, intermittent high-interest medications, lab-test preparation**, and unanswered uncertainty that changes interpretation. Never nag users to reach 100% 'compliance'.
- Reminders are **opt in** and should support snooze, discreet wording, quiet hours, adjustable grouping and easy disablement. An unanswered reminder remains **unknown**; no 'auto-confirm'. Do not tell people to take an extra/late dose without product-specific clinician-approved guidance.

### 2.3 Before labs, ask for a rapid reconciliation

At approximately 7–14 days before a planned lab draw or when a new draw is scheduled, show current regimen and ask: 'Which of these are you still using? Anything started, stopped, changed or taken less often since your last test?' Include an **easy 'nothing changed' confirmation that only confirms the user's reported regimen, not every historical dose**. Ask a small number of targeted questions about relevant high-impact exposures and test preparation. After a lab result, retrospective edits remain flagged as retrospective and do not overwrite the earlier snapshot.

## 3. Scientific distinctions and core data contracts

### 3.1 Never conflate these statuses

1. **Ordered/prescribed:** clinician or imported prescription instructions; not evidence of ingestion.
2. **Planned/scheduled:** user's intended regimen; not evidence of ingestion.
3. **Dispensed/obtained:** access to product; not evidence of ingestion.
4. **Confirmed taken:** user, caregiver or verified administrator explicitly logged actual use and quantity, with source and time confidence.
5. **Reported use over a period:** qualitative or numeric retrospective estimate with interval and uncertainty, not event-level confirmation.
6. **Confirmed not taken/skipped:** explicit omission for a scheduled occurrence. Separate from PRN not needed.
7. **Not recorded/unknown:** no reliable inference.
8. **Paused/discontinued/restarted:** versioned regimen change; record effective date and reason if known, distinguish prescribed stop versus self-directed report.

FHIR R5 MedicationStatement is a useful interoperability reference for patient-reported use and period adherence; MedicationRequest, MedicationDispense and MedicationAdministration have distinct semantics. Bloom should use a normalized internal model compatible with the supported FHIR version of connected systems rather than blindly equate all sources.

### 3.2 Candidate normalized entities (architect to finalize)

- `substance` / `ingredient` (standard terminology IDs where available, normalized names, form, units)
- `product` and `product_ingredient` (brand, strength, verified label version, effective date, active compounds, unknown quantities)
- `regimen` and `regimen_version` (prescribed vs user-intended, effective range, recurrence, route, dose, PRN status, timezone, provenance)
- `scheduled_occurrence` (derived schedule; immutable schedule revision link, not necessarily persisted for every day)
- `dose_event` (taken/skipped/partial/late, quantity, actual timestamp or time window, entered_at, correction history, source)
- `period_adherence_report` (time interval; exact count or ordinal frequency; denominator eligibility and uncertainty; entered_at)
- `regimen_reconciliation` (snapshot as-of date, report date, stated unchanged/changed/unknown)
- `exposure_summary` (ingredient and product, precise window, confirmed dose count, known omitted, reported estimated frequency, unknown days, source and coverage, *not falsely precise absorbed concentration*)
- `interaction_or_safety_review` (versioned rules, severity, context, human-review boundary, acknowledgement)
- `observation_link` / `analysis_provenance` (which historical records supported a lab-response hypothesis)

All records require appropriate user ownership, source, quality, occurrence/effective timestamps versus `recorded_at`, versions and privacy controls. Corrections must invalidate or version downstream explanations. Where imported prescription history conflicts with user report, keep both and show the discrepancy instead of silently resolving it.

## 4. Response Intelligence integration

For each biomarker comparison, compute **time-aligned, ingredient-level exposure summaries** over one or more scientifically justified windows, e.g. immediate presampling context and longer 2–12-week windows where relevant. Windows are biomarker/intervention-specific, not a global 90-day assumption. Store the intended, explicitly confirmed, estimated and unknown exposure components **separately**.

Example output (illustrative):

> Omega-3 was part of the planned daily routine throughout the interval. You confirmed doses on 9 days and retrospectively reported using it 'most days' over the final 4 weeks. Actual dose frequency during the remaining period is unknown. Omega-3 formulations and dose can affect triglycerides in population evidence, but your individual contribution cannot be isolated from changed diet, activity, bodyweight, alcohol, medications, and fasting status.

Important qualifiers:
- Supplement labels indicate ingredients and stated dose, not measured absorption, systemic levels, biochemical flux or realized treatment effect.
- Prescription status and pharmacy refills do not prove taking; notifications being delivered or dismissed do not prove taking.
- A changed product brand can change ingredient amounts/quality; do not infer equivalent exposure solely from display name.
- Unknown adherence cannot legitimately be turned into an exact numeric percentage. With documented scheduled denominators, explicit confirmations and omissions, report **confirmed coverage** or an informative lower/upper bound rather than an invented true adherence estimate. Period recall should be shown separately, not combined as though it were ground truth.
- Intake from foods and fortified products may overlap with supplemental ingredients; distinguish **supplement doses** from total daily nutrient intake and avoid double-counting nutrient totals already in Food.
- Different formulations, routes and dosing patterns may require different modelling and clinical interpretation (e.g., weekly injection versus oral daily tablet; PRN symptom medication).
- Do not attribute improvements/worsening to a medication/supplement change purely because its start/stop preceded the draw.

## 5. Safety and clinical governance

- Identify high-priority **medication–medication, supplement–medication, duplicate active ingredient, cumulative nutrient upper-limit and lab-interference** issues through a reviewed, versioned, clinically scoped rulebase. Include severity, affected population, confidence, explicit limitations and relevant monitoring; prioritize critical actionable risks over alert fatigue.
- Never tell a user to discontinue prescribed therapy, double a missed dose, alter an anticoagulant, inject outside prescription schedule or otherwise change clinical therapy without clinician input and suitable safeguards. No generic 'catch-up' advice for late/missed doses.
- Product labelling data can be incomplete or inaccurate; unknown ingredient concentrations are retained as unknown. Nutrient **tolerable upper intake limits depend on age, physiological status, source and formulation**; risk flags require clinically reviewed limits and distinction between food, supplemental and pharmacologic exposures.
- Supplement–medication interaction checks are especially important for complex regimens and need a clear 'check with pharmacist/clinician' path rather than hallucinated determinations.
- Safety-sensitive user groups (pregnancy, children, renal/hepatic impairment, perioperative care, polypharmacy, anticoagulants and other high-risk therapies) require restricted claims and, where appropriate, explicit clinician review.
- Adherence data is sensitive and must not be used for judgement, punitive scores, or unconsented sharing; low engagement is not proof of nonadherence.
- The assistant may offer **logging and information**, not diagnosis, treatment management, prescribing or automatic medication stop recommendations.

## 6. Formal requirement extension (pending architect duplicate reconciliation)

| ID | Priority | Requirement | Scientific acceptance |
|---|---|---|---|
| BIO-2026-116 | P1 | Canonical medication/supplement inventory | Product identity, formulation, ingredients, strength, route, dose, user confirmation and evidence quality; unknowns preserved |
| BIO-2026-117 | P1 | Flexible regimen & effective-dated changes | Daily/weekly/every-N-days/cyclic/PRN/temporary; timezone-aware history; planned vs prescribed separate; corrections versioned |
| BIO-2026-118 | P1 | Low-friction, truthful adherence capture | Group checkoff, exceptions, recall and tracking-mode preferences; missed vs unknown vs PRN not-needed distinct; no forced daily logging |
| BIO-2026-119 | P1 | Ingredient-level exposure summaries | Time-aligned windows; exact confirmations separate from recall; no fabricated dosing or absorption; provenance and completeness |
| BIO-2026-120 | P1 | Pre-lab and result-triggered reconciliation | Brief versioned snapshots and targeted questions; retrospective entry provenance; minimal interaction burden |
| BIO-2026-121 | P1 safety gate | Reviewable interaction and cumulative-exposure safeguards | Clinically reviewed rules, duplicate nutrients, context-appropriate limits, no unsupervised dose/change advice; negative cases |
| BIO-2026-122 | P2 | Interoperable imports and high-value automations | Consent, source-specific semantics, reconciled duplicates, safe notifications, imports never taken as proof of use |
| BIO-2026-123 | P2 validation | Prospective adherence-data quality evaluation | Completion and engagement, reporting bias, false certainty, calibration vs suitable validation, usability and accessibility |

The IDs extend BIO-2026-109…115 and previous 101/102/104/108. Architect must map overlaps with newer Bloom v0.6, Biological Optimization Intelligence, medication-related work and existing app features before any build. **This is a scientific recommendation, not a requirement to replace existing architecture.**

## 7. Acceptance tests and adversarial cases

1. Seven daily scheduled doses; 2 taken confirmations, 1 explicit skip, 4 silent: show **2 confirmed, 1 reported missed, 4 unknown**, not 2/7 actual adherence and not 6 missed.
2. Weekly injection on Saturdays, 2 weeks taken, 1 week skipped, 1 unknown: correct weekly denominator and dose timing, no daily adherence metric.
3. PRN drug unused because not needed: no missed-dose penalty.
4. 'Took morning bundle' with one item excluded: remaining product-level events correct.
5. User says 'most days last month': preserve ordinal interval-level recall; don't manufacture precise daily events or dose timestamps.
6. Bottle scan identifies two strengths: require user verification; do not silently choose.
7. Two supplements contain zinc: identify possible aggregate dose while avoiding false assertions when ingredient strength unknown.
8. Prescription imported and dispensed but user reports stopped: display conflicting source records; no assumed consumption.
9. Dose changed November 1, lab collected October 25, entry recorded November 5: **no future leakage**.
10. Retrospective report revised after blood result: use appropriate time and provenance labels, preserve analysis revision history.
11. Brand replacement has different active amount: ingredient-exposure history changes even with same colloquial product name.
12. Reminder sent but not answered: dose unknown, not confirmed taken.
13. Injection taken late: record actual dose timing without suggesting compensatory dosing.
14. Group schedule crosses daylight-saving changes or travel timezones: no duplicate/shifted false events.
15. User deletes medication history: derived exposure and biomarker attribution must update or be removed according to deletion policy.
16. Alert rule finds a high-risk interaction: vetted, context-appropriate wording and clinician/pharmacist referral; no unauthorized dose changes.
17. User explicitly opts out of detailed tracking: inventory and changes-only mode still work; interpretation acknowledges reduced observability.
18. Food log and multivitamin both contain vitamin D: nutrient totals retain known sources and avoid false double counts; incomplete food composition stays unknown.

## 8. UX specification for Design and User Testing

**Surface:** A discreet 'My routine' feature in Biology/Today, not a clinical medication administration dashboard. **Setup:** capture from label/search, user confirms; schedule in plain language. **Default:** changes-only or weekly recall, with optional daily group checkoff; do not force notifications. **Microinteractions:** large one-tap 'taken as usual', exceptions, undo and edit, with separate explicit 'not sure'. **Quarterly labs:** compact reconciliation sheet with highlighted changes since last test. **Insights:** 'Recorded use' vs 'Expected schedule' vs 'Unknown' shown distinctly; explain scientific relevance only when properly supported.

**Usability acceptance:** Benchmark flows on mobile using realistic 5–15-item mixed regimens with weekly injections and PRN drugs; report median setup time, weekly interaction burden, completion and correction accuracy; test accessibility and low-literacy language. Establish thresholds with independent UX testing rather than inventing arbitrary numerical guarantees. Ensure no moralizing 'streak loss' or shame prompts. User may freely disable reminders and tracking.

## 9. Cross-team review routing

**Chief Architect:** Verify current repository state and source-of-truth (Medication / Supplements / Biology / Progress / Food), reconcile with v0.6, select entity and interoperability strategy, accept/reject new BIO IDs, define stage gates and avoid duplicative models. Resolve legal intended-use classification before feature scope approval.

**Developer (after approval):** Preserve canonical temporal semantics, implement versioned schema/events and idempotent imports, test edge cases, audit downstream changes, add safe opt-in notification settings; provide commit SHA and migration/test evidence for specialist review.

**Design/UX & independent User Testing:** Validate setup with bottle label, routine bundles, PRN and weekly cases; prove actual weekly effort is acceptable and unknowns are understandable; respect Bloom warm editorial aesthetic.

**ML/Intelligence:** Propose extraction only as confirmed drafts; evaluate OCR/barcode identity error rates; no ingestion inference from reminders, pharmacy refills or intended routine; prohibit hallucinated attribution and false adherence percentages.

**Security & Privacy:** Medication and adherence histories are sensitive personal health information; review consent, source access, retention, encryption, export/deletion, notification privacy and third-party model disclosure.

**Legal/Regulatory:** Review intended-use claims, medication advice boundaries, risk alerts, software medical device implications and Canadian jurisdiction as needed.

**Science:** Maintain evidence-linked biomarker–drug/supplement association matrix including null/harms, validate clinical safety rules, test uncertainty language, review user-visible outputs after implementation.

## 10. Evidence and standards referenced

- HL7 FHIR R5 **MedicationStatement** (patient-reported use and period adherence distinction): https://hl7.org/fhir/medicationstatement.html
- HL7 FHIR R5 **MedicationRequest** (orders/prescriptions, not proof of ingestion): https://hl7.org/fhir/medicationrequest.html
- HL7 FHIR R5 **MedicationDispense** (dispensing, not proof of ingestion): https://hl7.org/fhir/R5/medicationdispense.html
- HL7 FHIR R5 **MedicationAdministration** (actual administration data semantics): https://hl7.org/fhir/medicationadministration.html
- NIH NCCIH **How Medications and Supplements Can Interact**: https://www.nccih.nih.gov/health/know-science/how-medications-and-supplements-can-interact/talk-with-your-health-care-providers
- Original Bloom Response Intelligence Specialist Handoff, 2026-11-14 (cross-agent Library).

These references support data and safety principles, **not validated Bloom adherence inference or individual causal effects**. Implementation must be checked against live code and locally applicable regulations, formularies and clinical evidence.

## 11. Delivery status and release recommendation

**Science handoff: prepared for review.** **Build status: not verified/not authorized by this handoff.** Stage 1 should deliver product inventory, versioned regimens, a usable low-friction tracking choice, explicit unknown states and pre-lab reconciliation. Stage 2 adds ingredient-level exposure linking to biomarkers and vetted safety checks. Stage 3 adds more integrations, proactive prompting and validated response learning. Do not launch causal attribution or automatic treatment changes from adherence estimates.

**Requested architect decision:** adopt as a P1 foundational BRI dependency, route to design/security/legal/ML review, and assign implementation only after live backlog reconciliation.