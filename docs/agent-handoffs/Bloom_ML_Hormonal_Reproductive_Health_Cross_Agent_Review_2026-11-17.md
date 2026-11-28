# Bloom — Hormonal & Reproductive Health: AI/ML Cross-Agent Review and Architecture Amendments

**Document ID:** ML-RH-20261117-R1  
**Date:** 2026-11-17 (America/Regina)  
**To:** Chief Architect & Integration Lead; cc Biology, Integrations & Data, Security & Privacy, Legal & Regulatory, UX/Branding, User Testing, Developer/Codex  
**Decision:** **APPROVE WITH TARGETED AMENDMENTS.** This is an AI/ML scientific/technical design review, **not** an implementation claim, independent clinical approval, provider activation, or additional owner checkpoint.

## 1. Source basis and preservation

The original source documents remain authoritative in full, including their proposals and limits:

1. **BIO science original:** `Bloom_Reproductive_Life_Stages_and_Libido_Science_Handoff_2026-11-17.md` (RH-01–RH-10, 18 tests, scope and scientific references).
2. **UT/UX R2:** `Bloom_Hormonal_Reproductive_Health_UX_Integration_Review_2026-11-17.md` (UT-RH-5801–5816 original UX requirements and UT-RH-5817–5828 R2 additions, UX journeys A–I, competitor synthesis with source caveats).
3. **Repository authority cross-check:** `docs/architecture/V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`, `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md`, `docs/architecture/AI_SCIENTIFIC_GOVERNANCE_MODEL_REGISTRY_ARCHITECT_DECISION_20261114.md`, and current `NEXT_ACTIONS.md`, branch `enhance/bloom-experience` checked Nov 17. The current queue keeps v0.6 Core and bounded bug repairs first; these documents do not authorize a second ledger, research database, clinical coach, new global tab or pooled training.

**Preservation rule:** This addendum supplements but does **not replace, reduce or renumber** RH-01–10, UT-RH-5801–5828, the Biology 18 test cases, the UX nine scenarios, or their original literature/competitor source registers. The Architect should crosswalk each proposed change into existing claims, source, preference, consent, and capability records. No duplicate app architecture or roadmap. Scientific and competitor assertions remain attributed to their respective source handoffs; external verification below is deliberately limited.

## 2. Main assessment

**Approve the feature vision:** opt-in reproductive-life-stage and symptom tracking, separate adult-only sexual wellbeing/desire/distress reporting, descriptive calendar and list, optional source-linked hormone laboratory/treatment context, nonintrusive Everyday/Athlete links, and a preview-before-sharing appointment summary. The **most useful first implementation does not require AI**. Ordinary records remain valuable with no cycle, laboratory tests, or wearable.

**Do not equate** self-reported stage with clinician-confirmed diagnosis; bleeding observations with ovulation or fertility; self-reported symptom score with hormone concentration; low desire with disorder; medication timing with causation; or symptom frequency among logged days with true frequency on unlogged days. A language model may clarify or summarize *typed, user-authorized* observations, not infer diagnosis, reproductive status, hormonal concentrations, safe contraception or prescription changes.

The R2 competitor comparison provides interaction inspiration, not verified superiority or permission to copy proprietary material. The official Menopause Foundation of Canada tracker can inform a distinct, source-attributed **Bloom-authored** reporting flow; Bloom must not imply its own endorsement.

## 3. Critical data-model correction — independent, time-varying dimensions

**ML-RH-2501 (P0 for this feature's implementation):** The Biology §6 illustrative `reproductive_context.stage` enum combines `pregnant` and `postpartum` with `reproductive`, `perimenopause_possible`, and `postmenopause_reported`, while §2 correctly says pregnancy, postpartum and lactation are *separately timestamped*. **Implement independent dimensions** rather than treating one as a replacement stage:

- `reproductiveStage`: optional self-/clinician-reported stage with explicit evidence/provenance and effective interval; `unknown` or `prefer_not_to_say` are valid.
- `pregnancyContext`, `postpartumContext`, `lactationContext`: separate optional, dated user-reported/clinician-reported states with start/end uncertainty and context, not automatically inferred from missing cycles. Do not infer a negative pregnancy status from no entry.
- `bleedingContext` and `contraception/therapyContext`: independent treatment/cycle interpretation modifiers; surgery/amenorrhea/missing organs only when explicitly disclosed and relevant. Use no assumptions based on gender or implied anatomy.
- Sexual wellbeing consent and measurements live in a separately permissioned topic, not automatically unlocked by reproductive-stage tracking.

**Acceptance:** a person may report postpartum + lactation while their earlier stage remains historically recorded; therapy can modify interpretation without inventing a new stage; overlapping or uncertain dates do not silently overwrite; source corrections invalidate only dependent summaries. Extend existing canonical observations, don't add a parallel stage ledger.

## 4. Additional AI/ML and privacy acceptance refinements

**ML-RH-2502 — Method-specific temporal and denominator honesty (P0).** Distinguish occurred/recorded timestamps, event intensity, duration, symptom diary coverage, and explicitly recorded symptom-free days. Multiple entries in a day are not multiple symptom-days; unlogged days are unknown. Calendar and report give `6 of 12 logged days` where applicable, never `6 of 30 days` without genuine complete coverage. Retrospective recall is marked as such. No menstrual-phase prediction from irregular/hormonally altered records; no conception/contraception estimates.

**ML-RH-2503 — Observational intelligence without fabricated personal hormone mechanisms (P0).** Source-linked concurrent sleep, exercise, symptoms, body, hormone lab and medicine observations may support qualified *co-occurrence descriptions*, with relevant timing/assay/cycle/therapy context and explicit confounders. Sparse sequences and self-selected symptom logging are insufficient for individualized causal claims, calibrated hormone state, HSDD diagnosis, or action effectiveness. Restrict statistical correlations to pre-registered, adequately sampled, purpose-consented observational methods with abstention, negative controls and held-out evaluation. A user's submitted symptoms can always be displayed descriptively. An unreviewed research hypothesis must never authorize an intervention.

**ML-RH-2504 — Sensitive inference minimization and purpose-bound AI (P0).** Separate permission for reproductive symptoms/cycle, sexual wellbeing, user-selected lab/exposure overlays, external AI processing, and future research contribution. Existing consent for general diet/activity, AI meal interpretation, photo learning or development features conveys **no** permission to use reproductive/sexual content. No model should infer sexual activity, pregnancy, orientation, anatomy, partner relationships or fertility intent from passive data. Sensitive content is not automatically put into Today cards, notifications, shared summaries, generic coach context, telemetry or LLM payloads. Prefer deterministic summaries, local processing and private source projections. Test server-side checks and async invalidation against account switch and revocation, not merely UI hiding.

**ML-RH-2505 — Model text and evidence firewall (P0).** Any optional generative explanation may only describe a validated, scoped structured snapshot and cite reviewed claims; enforce typed output, source/claim IDs and output screening. No invented hormone numbers, stage/ovulation estimates, libido deficiency, medication-adjustment advice, supplement treatment, universal libido target or clinical escalation severity from free-form language. Preserve manual/offline and provider-down flows. Model status labels must say `not run`, `insufficient data`, `user reported`, `clinician reported`, or `general research` where applicable, never implicit diagnostic certainty.

**ML-RH-2506 — Independent safety-oriented information, not a medical triage engine (P0).** Keep limited science-reviewed, appropriate professional-discussion prompts for known concerning observations, including postmenopausal bleeding, without asking the AI to diagnose or replace care. Pregnancy possibility or uncertainty, contraception, hysterectomy, lactation and medication changes alter what can be explained. Any clinically consequential automated urgency logic needs a separate reviewed rule and Legal/Biology authorization. Do not block ordinary tracking, historical charts, general education and user-controlled report export just because clinical algorithms are restricted.

**ML-RH-2507 — Training-label quality and future research separation (research gate).** Accepting an AI interpretation, choosing a suggested category or correcting a date is **not** medical ground truth. Keep explicit self-report versus qualified external reference and corrections. Per-account preference learning can adjust which voluntary categories appear, but not generate hormonal diagnoses or claim biological treatment response. Cross-account training/aggregation of reproductive or sexual data remains **OFF** pending a separate owner decision, purpose-specific consent, Security/Legal and validated model/rights evaluation. Synthetic/public-reference research can proceed under existing permissions and without sensitive individual transfer.

**ML-RH-2508 — Appointment export as an independent privacy surface (P0).** The R2 appointment-report feature is useful and should not depend on a paid AI model. Generate from selected scoped source records with a frozen preview, explicitly chosen date range/categories, coverage/missingness and user-report attribution. Sexual wellbeing is excluded by default even when tracked; require an explicit separate inclusion choice. Account export vs appointment report are distinct purposes: account export must faithfully disclose inclusion/exclusion; no hidden loss of user data. Verify PDF/temp file, OS share sheet, print preview, browser caches and server expiration against tenant and consent revocation; never auto-email. No copying licensed symptom-tracker text or implying foundation endorsement.

**ML-RH-2509 — Optional consumer experience is not longitudinal surveillance (P1).** No compulsory menstrual calendar, constant reminders, engagement-pressure scores, 'normal' libido values or unsolicited sexual topic prompts. A person who declined can continue ordinary Bloom uninterrupted. One helpful low-burden optional question beats a data-completeness questionnaire. Accessibility and neutral inclusive language are necessary for the enabled surfaces, not justification to stop unrelated Core development.

## 5. Suggested existing-service flow (no new AI platform)

`user opts into specific topic → canonical scoped observation source → revision-aware calendar and history → (optional) consented existing lab/therapy source joins → deterministic summary with coverage → reviewed educational claim and nonclinical eligible action → explicit user choice → source-versioned report/receipt`.

For future longitudinal exploratory methods: `eligible sourced series → method/data-cadence preflight → provisional association/hypothesis → scientific claim/evidence gating → approved safe action *if independently eligible* → private research-labelled display or abstention`; never bypass reviewed action ID or privacy scope. Do **not** implement a generic “hormone health score” or separate recommendation ranker.

## 6. Tests that must supplement—not replace—the original tests

- **T1 independent context:** pregnancy + postpartum + lactation dates, surgery/therapy context and unknown stage; correct historical chronology and no automatic stage mutation.
- **T2 denominator:** 4 diary days in 30, six symptom entries across three recorded days, one explicit symptom-free log; accurate events vs days, unknown days not treated as zero.
- **T3 retrospective:** user recalls a symptom month later; both occurred and recorded dates retained; retrospective entry cannot masquerade as contemporaneous predictive evidence.
- **T4 sexual scope:** cycle-only user gets no libido question, external AI context or sexual data in export default; adult opted-in user gets discreet private entry, not a normal Today teaser.
- **T5 contextual lab:** user attaches dated estradiol or testosterone measurement with assay/specimen/time and therapy qualifier; no diagnosis, fixed phase or inferred tissue effect from value alone; actual values remain in canonical Bloodwork.
- **T6 sparse and confounded:** two symptom logs + two blood draws + medication change; no fitted personal effect, unverified cause or percentage attribution; only qualified observation and possible discussion.
- **T7 restricted clinical:** user-reported bleeding after menopause offers appropriate professionally reviewed follow-up, no automatic diagnosis, treatment or lab order; no AI clinical urgency improvisation.
- **T8 third-party AI failure:** provider absent/denied/timeouts do not interrupt symptom entry, calendar, report preview and source-safe general education.
- **T9 export/privacy:** default appointment report excludes sexual observations, explicit opt-in includes chosen records only, print/OS share/temp/cache cleared per policy; two accounts, consent revocation during async generation and source deletion are denied/retracted correctly.
- **T10 research:** photo model/global-training consent doesn't grant RH labels; an internal-tester toggle doesn't grant research consent; synthetic reference-only model research remains possible without personal-data movement.
- **T11 accessibility:** 320/390, 200% zoom, keyboard, screen reader, dark/light and Athlete/Everyday context; no sensitive notification leak.
- **T12 evidence truth:** corrected symptom/bleeding/contraception record invalidates summary/education-dependent display, but unrelated Food/Activity/Today are unaffected.

All tests need expected actual recorded outputs, source/method revision and exact candidate SHA where integration is tested. Do not relabel code-specified, engineering-tested, independently accepted and public-authorized as the same status.

## 7. Cross-agent assignments

- **Chief Architect:** Crosswalk RH-01–10, UT-RH-5801–5828 and ML-RH-2501–2509 to existing v0.6/Advanced and v0.7 scopes, the single canonical capability ledger, model and privacy lifecycle; no redundant backlog or owner checkpoint. Separate active research implementation from public release.
- **Codex:** Inventory reusable Profile/Biology/Progress/Athlete/source/consent/report components; build reviewed low-friction optional feature on the active branch after current Core priorities; produce source/API/DB/UI/privacy test receipts and exact SHA; do not independently flip provider or clinical flags or merge main.
- **Biology:** Approve stage/context separation, menopausal/bleeding terminology, red flag professional-discussion rules and claim-level evidence for self-care; no diagnosis inferred from tracker.
- **AI/ML:** Own coverage denominator, statistical eligibility/abstention, model text gating, prototype method/metric evaluations, baseline comparison and no accidental target-label promotion.
- **Integrations:** Map real assay lab source, treatment history and correction chronology, account-scoped report generation, no duplicate hormone panel or exposure ledger.
- **Security & Privacy:** Sensitive category controls, server checks, access logging, backups/deletion/export semantics, inference attacks, notification/export/temp-file exposure and consent invalidation.
- **Legal & Regulatory:** Intended use, clinical claim restrictions, Canadian reproductive/sexual privacy, relevant data rights and report-sharing terms.
- **UX/User Testing:** Preserve optional hub, favourites, one-screen logging, calendar+list, novice explanation, previewed appointment summary, confidence in privacy, actual mobile/assistive tasks and no pressure.

## 8. Focused external verification (not wholesale review)

- NICE NG23, updated 15 April 2026, explicitly cautions against using FSH to identify menopause in people on certain hormonal contraception and supports clinical identification without routine laboratory tests for otherwise healthy symptomatic people aged 45+ in the specified population: https://www.nice.org.uk/guidance/ng23/chapter/recommendations
- ACOG published updated postmenopausal bleeding evaluation guidance in 2026, reinforcing that this symptom needs assessment rather than reassurance-only text: https://www.acog.org/news/news-releases/2026/04/acog-publishes-updated-guidance-evaluation-postmenopausal-bleeding
- ISSWSH clinical practice guidance addresses multifactorial biopsychosocial context for low desire and its treatment in clinical settings; it does **not** validate an app diagnosis from a libido score: https://journals.sagepub.com/doi/full/10.1089/jwh.2021.29037

These are external scientific confirmations relevant to the boundaries above, not evidence of Bloom implementation or a complete independent audit of every cited source/product.

## 9. Decision and implementation boundary

**APPROVE WITH TARGETED AMENDMENTS**: preserve the 2026-11-17 Biology RH-01–10 and UX UT-RH-5801–5828 source handoffs, including the R2 competitor synthesis. Add ML-RH-2501–2509 as existing-roadmap acceptance refinements. Implement a useful private opt-in recording/reporting experience before optional model-based discovery. Missing research data, restricted hormone/clinical advice, external provider access or cross-user training permission are **feature-specific gates**, never a blanket halt to normal Food, Activity, Biology, Progress or the private RH journal. No code changes, provider activation, clinical permission or pooled training authorized by this review.