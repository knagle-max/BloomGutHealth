# Bloom — Reproductive Life Stages & Sexual Wellbeing
## Complete Science & Biology implementation handoff

**Date:** 2026-11-17  
**From:** Nutrition & Biology Specialist  
**To:** Chief Architect & Integration Lead; Codex; AI/ML; Integrations & Data; Security & Privacy; Legal & Regulatory; UX & User Testing  
**Disposition:** APPROVE WITH BOUNDED SCIENTIFIC REQUIREMENTS for requirements integration and development. **Not** clinical approval or activation authorization.  
**Priority:** P1 optional everyday wellness capabilities; P0 privacy/safety conditions for any implementation involving sexual information.  
**Authority:** Product owner asks to consider premenopausal categories and libido levels. This is the complete initial handoff for this capability, not a delta dependent on another document.

## 1. Product intention
Provide an optional, sensitive and useful reproductive-life-stage context and sexual-wellbeing tracking system, integrated with ordinary Bloom Today, Biology, Progress, Food and Athlete experiences. Avoid an isolated fertility tracker, a sexual performance score, medical diagnosis or assumptions that all women menstruate. Make categories relevant to anatomy/physiology and user-chosen priorities rather than gender labels alone. Offer sexual-wellbeing tracking to adults of any gender where appropriate. No chatbot is required.

## 2. Evidence-grounded conceptual model
Separate **reproductive stage**, **cycle observations**, **sexual desire**, **bother/distress**, **symptoms**, **medication context**, **goals**, and **observed outcomes**. They are not substitutes for one another.

Suggested optional self-reported or clinician-confirmed stage categories:
- Reproductive/premenopausal (including cycle observation only if relevant).
- Perimenopausal / menopausal transition (possible, clinician-reported, or uncertain rather than unqualified inferred diagnosis).
- Postmenopausal (self-reported or confirmed; distinguish natural from surgical where known).
- Pregnancy, postpartum, lactation (each separately timestamped; not merely reproductive staging labels).
- Hormonal contraception or hormonal therapy influencing bleeding and symptom interpretation (context, not a new stage).
- After hysterectomy/ovarian surgery or other history affecting staging (optional).
- Unknown, not applicable, prefer not to say.

STRAW+10 primarily uses changes in menstrual bleeding patterns. A last menstrual period plus 12 consecutive months without periods is a common criterion for natural menopause when not affected by hormonal contraception or other causes; do not apply that rule blindly to amenorrhea during lactation, hormonal contraception, surgery or illness. For many people age 45+ with typical symptoms, routine FSH/estradiol testing is not needed for staging; single tests may mislead due to fluctuation. Premature ovarian insufficiency, unusual bleeding, and atypical age need clinical evaluation, not automated labeling.

## 3. User-facing workflows — two layers
**Everyday:** optional ‘Reproductive health’ in Profile/Wellbeing setup; allow ‘skip’ with no persistent prompts; one quick periodic check-in of cycle/symptom/sexual-wellbeing concerns; overview of user-entered trends; plain-language education. No default sexual-health card in Today, shared screenshots, push notifications, or lock-screen previews.

**Athlete:** optionally add cycle-linked training context, symptom burden, recovery, energy adequacy, and performance notes where data permit. Do not infer menstrual phase from sparse irregular entries or issue phase-dependent exercise/protein prescriptions without robust reviewed evidence. Support menstrual dysfunction/possible low energy availability as a clinician-discussion concern only when data support careful, non-diagnostic wording.

**Sexual wellbeing (adult-only, available across modes):** privacy-first opt-in tracking for *desire/libido relative to own usual*, personal satisfaction, whether a change is bothersome, pain/discomfort, sleep, stress, fatigue, and user-entered medication/hormone context. No mandatory sex-act frequency, partner information, sexual orientation, explicit descriptions, or activity-event logging. Never equate low libido with ill-health or a single target score. Separate desire from arousal, pain, and relationship factors; respect asexual identities and normal individual variation.

## 4. Low-friction interaction
- Ask first whether the user wants to track the topic. No prompting if declined; user can withdraw at any time.
- Weekly or monthly opt-in check-ins; skip easily; recorded omissions remain unknown, not zero.
- Prefer simple qualitative choices: ‘lower than usual / about usual / higher than usual / not sure’; ‘bothers me / does not bother me / prefer not to say’. Optional 0–10 self-rating may aid within-user trend analysis but must not be interpreted against a universal normal range.
- Allow explicit onset/end dates or approximate ranges; distinguish enteredAt from occurredAt.
- Passive context from sleep/activity only with existing consent and data-source permissions, never infer private sexual activity from wearable activity.
- One discreet relevant follow-up question only when useful to the user’s selected goal. No intrusive notifications.

## 5. Clinical and scientific boundaries
- **Never diagnose menopause, perimenopause, HSDD, infertility, hormone deficiency, thyroid disease, depression, sexual dysfunction, or low energy availability from symptom scores alone.**
- Desire-related difficulty becomes a clinical concern particularly when it causes personal distress; no disease label based on desire frequency or score.
- Do not offer autonomous hormone treatment, testosterone, prescription adjustments, contraception changes, libido supplements, or stopping SSRIs/other medications.
- Do not assume estrogen, progesterone or testosterone levels from a calendar or symptom pattern. Hormone lab values require assay/source/date/cycle-stage/treatment qualifiers; serum concentrations alone do not establish tissue effects or a cause of desire changes.
- Recognize medication effects, stress, poor sleep, postpartum/lactation, relationship context, pain, and chronic illness as possible alternatives, not confirmed personal causes.
- Red flags: postmenopausal bleeding warrants clinical assessment; unusual heavy bleeding, persistent pelvic pain, severe distress or other concerning symptoms warrant proportionate professional follow-up. Do not use a generic reassuring algorithm to suppress these prompts.
- For pregnancy risk, do not use approximated cycle stages as contraception or claim fertility certainty.

## 6. Data model and provenance
Use existing account-scoped canonical observations, source history, correction and retention controls. Add typed category fields only where missing:
```
reproductive_context: {
  user_visibility: 'opt_in'|'off',
  stage: 'reproductive'|'perimenopause_possible'|'perimenopause_reported'|'postmenopause_reported'|'pregnant'|'postpartum'|'unknown'|'not_applicable',
  stage_source: 'self_report'|'clinician_reported'|'not_inferred',
  stage_effective_at, stage_recorded_at, stage_revision,
  menstruation_context: 'natural'|'hormonal_contraception'|'lactation'|'surgery'|'other'|'unknown',
  symptoms: [{type, value, occurred_at, recorded_at, source, revision}],
  related_medication_source_ids: []
}
sexual_wellbeing_observation: {
  scope: 'adult_opt_in_private',
  desire_relative_to_personal_usual: 'lower'|'usual'|'higher'|'unknown',
  personal_bother: 'yes'|'no'|'unknown',
  satisfaction: 'optional_user_report',
  pain_or_discomfort: 'optional_user_report',
  occurred_at, recorded_at, source, revision, consent_version
}
```
The schema is illustrative, not a demand for a parallel datastore. ‘Prefer not to say’ and deletion must be supported. Sensitive observations should not become general training labels or global analytics by default.

## 7. Personal insight and cross-domain guidance
Eligible observations may inform user-requested discussions of sleep, fatigue, training tolerance, dietary adequacy, symptoms and sexual wellbeing. Report as ‘you recorded X during Y’ and ‘these commonly co-occur in research’, not ‘your hormones caused X’. Check alternate explanations, missing data, medication/contraception state, and whether apparent patterns replicate. Sparse cycles or sparse libido scores support descriptive histories, not time-series causation or predicted fluctuations.

Cross-domain recommendation policy: existing goal and action eligibility system must apply hard vetoes (pregnancy/lactation, known medical restrictions, allergies, nutritional adequacy, interactions, protected goals); support feasible low-risk steps such as sleep routine, symptom diary, pain-related care discussion, and appropriate clinician follow-up. No pseudo-scientific ‘hormone-balancing foods’ or automatic supplement suggestions for libido.

## 8. Privacy and consent (release-critical)
Sexual-life and reproductive data are sensitive. Distinct explicit opt-in for collection; separate explicit purpose consent for personal insight, any external model processing, and any future cross-user research/training. No cross-user training authorization is granted by this handoff. Respect existing architect privacy decision: private account learning is distinct from pooled learning. Default excludes from Today previews, notifications, general recommendations, operational logs, telemetry, public/demo data and unauthorized exports. Provide deliberate user-controlled inclusion in account export, deletion and history correction; Security/Legal must review retention/backups and the correctness of user-facing deletion claims. Server-side authorization and account isolation, encrypted storage, audit of privileged access, cache invalidation across account switch, and no sensitive strings in error reports. Design against partner coercion or unwanted discovery on a shared device; optional privacy lock/hide sensitive section subject to UX/security review.

## 9. Cross-user learning
The product owner’s broader goal of safe cross-user model improvement does not justify pooling sexual information under generic privacy consent. Stage 1: private, user-correctable histories and preference learning. Stage 2: research-only synthetic/reference testing. Stage 3 (separate authorization): narrowly scoped, genuinely optional explicit opt-in, minimized contributions, consent revocation, independent model evaluation, subgroup fairness, legal/privacy threat model, and clinical governance as appropriate. Do not use sexual-health data in shared photo/anthropometry training merely because the user opts into photo model improvement.

## 10. Build plan and requirement IDs
**RH-01 P1:** Voluntary reproductive-stage context with unknown/uncertain states and contraception/surgery/lactation qualifiers.
**RH-02 P1:** Low-burden optional symptom/cycle entries with dates, corrections and descriptive trends.
**RH-03 P1:** Adult opt-in private sexual-wellbeing/desire tracker, with distress and optional symptom separation.
**RH-04 P0 release gate:** Scientific terminology and non-diagnostic claims; no automatic stage or hormone diagnosis.
**RH-05 P0 release gate:** Safety red flags, pregnancy/lactation constraints and medication/treatment abstention.
**RH-06 P0 release gate:** Purpose-specific consent, sensitive privacy, account isolation, export and deletion.
**RH-07 P1:** Reuse Today/Biology/Progress/Athlete views and existing evidence/action APIs without duplicate tracking infrastructure.
**RH-08 P1:** Abstention and cautious cross-domain explanatory logic under sparse/confounded observations.
**RH-09 research gated:** Cross-user learning only under independent authorization, no automatic pooled training.
**RH-10 P1:** Inclusive accessible language, discreet presentation and stop/skip behaviour.

Codex tasks: (1) inventory current profile, symptom, medication, Today and Athlete source schemas, and map requirements to canonical roadmap; (2) implement private source/version-aware schema; (3) implement opt-in UI and optional check-ins; (4) integrate descriptive timeline and evidence-qualified insight; (5) implement safety and consent/permissions veto; (6) test actual browser/mobile screens and account actions; (7) send exact implementation SHA, tests and demonstration for scope-specific Science/Security/Legal/UX acceptance. Continue existing v0.6 Core work; this capability must not delay Food/Today and Response Intelligence delivery.

## 11. Acceptance tests
1. Decline opt-in: no prompt recurrence, data collection, card or notification.
2. Unknown stage and no cycle: no inferential diagnosis or fabricated cycle phase.
3. Self-reported perimenopause: accurately attributed to user, not clinically confirmed.
4. Hormonal IUD/contraception with absent periods: no automatic menopause label.
5. Lactation/postpartum or hysterectomy: normal cycle rules withheld.
6. Reported libido low but no bother: no disease alert, shame or normalization pressure.
7. Libido lower and bothersome: private empathetic optional clinician-discussion guidance, no diagnosis or drug advice.
8. User has SSRI/hormonal medicine change: contemporaneous history displayed, not asserted cause.
9. Postmenopausal bleeding: appropriate professional follow-up prompt, no reassurance-only output.
10. Sparse noisy cycles: no false precise hormone/ovulation prediction.
11. Two accounts: no leak in data, model context, UI cache, logs, export or background jobs.
12. Consent withdrawal and source correction: dependent insight retracted; account export/deletion tested.
13. Photo model cross-user consent does not authorize use of sexual-wellbeing data.
14. Inaccurate lab assay/cycle timing: no interpretation of precise hormonal effect.
15. Protected training/nutrition goals: no automatic restriction, deficit or unsafe exercise suggestion.
16. Mobile screen, keyboard, screen reader and discreet notifications verified.
17. Optional fields never prevent standard Food/Today/Athlete use.
18. Synthetic data and model outage preserve private deterministic workflows.

## 12. Agent reviews and release scope
Architect: reconcile against existing v0.6 Core/Advanced, privacy and action architecture; own roadmap and acceptance ledger. Codex: implementation and proof, no direct production merge. Biology: stage definitions, evidence, safety scenarios, claim boundaries. ML: observational/association uncertainty and abstention. Integrations: source provenance and corrections. Security/Legal: sensitive processing, consent and intended-use/territory scope. UX: nonintrusive accessible design and privacy defaults. Activation only after separate required release authorization. 

**Permitted initial scope:** opt-in private life-stage context, symptom and desire self-reports, descriptive history and carefully bounded education. **Excluded:** automated diagnosis, fertility or hormone prediction, medication actions, sexual performance scoring and shared-data training.

## 13. Core references (verified November 17, 2026)
- Canadian Menopause Society, reproductive-stage definitions: https://www.canadianmenopausesociety.org/professionals/menopause-hub/definition/
- STRAW+10 / international menopause staging context: https://www.imsociety.org/wp-content/uploads/2023/06/CPG-Management-of-Menopause-2022-e-version-finalised.pdf
- NICE NG23, menopause identification and management: https://www.nice.org.uk/guidance/ng23/chapter/recommendations
- European Society of Endocrinology, menopause guideline: https://academic.oup.com/ejendo/article/193/4/G49/8281862
- ICSM 2024 recommendations, published Sexual Medicine Reviews 2026: https://academic.oup.com/smr/article/14/1/qeaf057/8286982
- ISSWSH HSDD and clinical context: https://academic.oup.com/jsm/article/18/5/849/6956087
- ACOG, perimenopausal and postmenopausal bleeding: https://www.acog.org/womens-health/faqs/perimenopausal-bleeding-and-bleeding-after-menopause
- Office of Privacy Commissioner Canada, meaningful consent: https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/collecting-personal-information-and-consent/consent/gl_omc_201805

**Status:** Scientific requirements handoff prepared. Not proof of implementation, validation, regulatory clearance or activation.