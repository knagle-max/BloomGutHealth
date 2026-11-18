# Bloom — Hormonal & Reproductive Health: Consolidated Chief Architect Decision

**Date:** November 17, 2026  
**Status:** APPROVED as a staged, privacy-gated architecture specification; not implemented/clinically validated/activated by this document  
**Owner clarification:** **Female reproductive functions appear as available ONLY when the user's saved Profile sex selection is exactly `female`.** A female selection alone does **not** consent to tracking.  
**Implementation owner:** Codex on `enhance/bloom-experience`, under `AGENTS.md` and the single `NEXT_ACTIONS.md` active queue.

**Primary handoffs reconciled and preserved (full originals under `docs/agent-handoffs/`):**
- `Bloom_Reproductive_Life_Stages_and_Libido_Science_Handoff_2026-11-17.md` — Science/Biology, RH-01–RH-10, 18 tests.
- `Bloom_Hormonal_Reproductive_Health_UX_Integration_Review_2026-11-17.md` — User Testing R2, UT-RH-5801–5828 and original/R2 user journeys.
- `Bloom_ML_Hormonal_Reproductive_Health_Cross_Agent_Review_2026-11-17.md` — ML-RH-2501–2509.
- `Bloom_Integration_Hormonal_Reproductive_Health_UX_Review_2026-11-17.md` — INT-RH-01–08 (inspect original exact enumerations before implementation).

## 1. Binding owner decision — female reproductive availability

The original specialist documents correctly proposed that sensitive reproductive tracking is optional, anatomy/context-specific and should not be confused with gender stereotypes. **The later owner's concrete visibility requirement now governs the product's female reproductive module availability**:

```ts
type ProfileSexSelection = "male" | "female" | null; // actual saved Bloom Profile enum
const femaleReproductiveAvailable =
  authenticatedCurrentProfile.sex === "female";
```

This is **a feature discovery/use eligibility condition based on the user's selected Profile value**, not a clinical statement about anatomy, fertility, chromosomal traits, hormone levels, reproductive capacity or gender identity. Do not use inferred sex from names, hormone panels, pregnancy records, genetics, imported lab reference intervals or AI. Use the existing saved Profile `sex` data: `shared/schema.ts` defines `sex: z.enum(["male","female"]).nullable().optional()`, and `client/src/pages/Profile.tsx` persists it through the canonical profile update and cache invalidation. **Do not invent a second sex/gender field or ask again inside the RH flow.**

### Feature eligibility matrix (distinct capabilities)

| Module or link | Profile female | Profile male | Unset / unknown |
|---|---|---|---|
| Female reproductive module: cycle/bleeding, pre/peri/postmenopause context, pregnancy/postpartum/lactation context, female reproductive symptom presets, corresponding female-specific Athlete cycle context | **Available to opt into** | **Not shown as available; server denies entry/recording/use** | **Not shown as available; server denies entry/recording/use** |
| Menstrual/reproductive hub teaser and onboarding | **Eligible, discreet voluntary entry** | **No female module teaser, shortcut or onboarding** | **No female module teaser, shortcut or onboarding** |
| General hormone laboratory results (testosterone, estradiol, FSH, LH, prolactin, SHBG, etc.) | Existing Bloodwork | Existing Bloodwork | Existing Bloodwork |
| General medically neutral hormonal health education and source/context links | Allowed in existing Biology/Explore when scientifically eligible; no automatic reproductive inference | Same | Same |
| Sexual wellbeing/libido relative to usual and bother (adult-only separately consented) | Separate opt-in | Separate opt-in | Separate opt-in |
| General fatigue, sleep, mood and ordinary symptoms in existing Wellness/Progress | Same canonical workflows | Same | Same |
| Previously recorded private female RH source data after sex selection changes | Owner-controlled historical retention/recovery policy, not silently deleted | **Concealed and excluded from new active use** | **Concealed and excluded from new active use** |

**Availability is not a diagnosis and not a comprehensive anatomy model.** This explicit owner gate may exclude people with relevant anatomy who did not select female; do not silently bypass it based on clinical data. A future anatomy-specific opt-in/access path would need a separate owner product decision and safety/privacy review. Generic sexual-wellbeing features are deliberately not mislabeled as female-only; if owner later wants them female-only, update this table explicitly.

**Sensitive historical state transition:** Profile update `female → male/null`: withdraw active eligibility for female RH UI and server reads/writes/insight jobs (including deep link, search, Progress/Athlete, caches, notifications, queued jobs and reports), immediately invalidate active dependent projections and conceal sensitive history. **Do not automatically delete original records or assume consent withdrawal equals erasure**; keep a secure owner-controlled deletion/export and future female re-enablement path subject to purpose consent. Switch back to female does not automatically restore opted-out purposes: revalidate explicit topic grants. Preserve source history and revisions; no cross-user exposure. Ensure profile updates and eligibility snapshots are revision-safe and server-authoritative.

**Distinct permissions:** A user selecting female is only *eligible* to see the voluntary offer; separately consent for recording, private-insight reuse, optional reminders, external AI, and research/training. Sexual wellbeing needs its own adult age/eligibility and purpose grant. Never infer these from profile sex.

## 1A. Owner refinement — context-aware availability and relevance (2026-11-17)

**Binding product requirement:** After the mandatory **saved Profile `sex === "female"` availability gate** is satisfied, Bloom should **prioritize or de-emphasize** female reproductive features according to voluntary, reliable individual context. **Never use age alone as a prohibition, diagnosis, recorded life stage, or consent substitute.** Reuse existing Profile age/birth year, topic-specific user goals and context, explicitly recorded cycle history, source-qualified life-stage reports, pregnancy/postpartum/lactation context, relevant treatment/surgery and explicitly chosen topic preferences. Do not infer pregnancy, fertility intent, ovulation, sexual activity, menopause or a diagnosis from demographics, laboratory values, medication lists, or missing periods.

### Two distinct decisions, implemented in existing capability/navigation service

1. **Eligible/available:** The female reproductive module appears available only when current authenticated saved Profile `sex === "female"` (and released feature/current authorization requirements pass). Other selections do not receive female reproductive UI, deep-link access or active data/insight processing. General hormone Bloodwork and separately adult-consented sexual wellbeing remain independent.
2. **Recommended/display prominence:** Among *already eligible* topics, select what appears initially, which shortcuts lead, which educational modules are highlighted and whether an optional related topic teaser is shown. Use explicit selected topic, user-reported stage and active context first; age is a **soft low-confidence prior** for initial menu order only. Preserve `All topics` / `Explore other topics` in the private hub and user-chosen pinned/favorite topics. Never erase history, withdraw consent, delete a category or block a relevant action solely due to age or stage.

| User context (illustrative) | Higher prominence | Still discoverable / not auto-disabled |
|---|---|---|
| 18–25 with no other source context | Cycle events and symptom tracking, general reproductive education | Menopause/transition content if selected or medically relevant |
| 30–40 with explicit “trying to conceive” goal | Cycle observation, personal context, fertility education without conception probability | Menopause or hormone discussions; no pregnancy diagnosis |
| 40–50 with **self-reported** perimenopause or hot flashes | Transition symptoms, sleep, changing cycle history, bounded guidance | Conception/contraception context still reachable; no claim of infertility |
| Self-/clinician-reported postmenopause | Menopause symptoms, bone and cardiovascular health education, general sexual wellbeing if separately consented | Cycle records/history, chosen fertility-related questions and assisted-reproduction education as appropriate |
| Explicit postpartum or lactation context | User-selected recovery and symptoms, sleep, dated pregnancy/lactation context | Other topics accessible; do not infer natural menstrual stage from absent periods |

**Medical caution:** Early menopause/POI are possible under 40, and perimenopause may coexist with pregnancy potential. Never hide symptoms or clinician-discussion pathways for young users merely because the topic is uncommon. Age 45 or any age alone does not diagnose stage; use only explicitly reported/clinician-confirmed stage source with proper qualifiers. No algorithmic fertility status or contraception clearance. References: [NICE NG23](https://www.nice.org.uk/guidance/ng23/chapter/recommendations), [ASRM/ESHRE POI](https://www.asrm.org/practice-guidance/practice-committee-documents/evidence-based-guideline-premature-ovarian-insufficiency--2024/), [WHO Menopause](https://www.who.int/news-room/fact-sheets/detail/menopause/).

### Relevance logic and UX contract

- First experience: selected female + no RH consent receives a short **optional** topic chooser; present a few most plausibly useful topics based on age **without asking users to declare stage or fertility intent**, with `Explore all topics` and `Skip`. Decline stays declined. No intrusive reminders.
- Once opted in, **explicit goals and user-pinned preferences outrank demographic defaults**. Current, source-qualified self-/clinician-reported stage and context guide ordering but do not lock or diagnose. Preference corrections should improve ordering, not infer anatomy or clinical status.
- A user can select `Not relevant`, `Pin this topic`, `Explore other topics` or `Change my focus`. Do not quietly re-enable declined categories, silently create observations, presume absence of symptoms on unlogged days or equate a self-reported stage to a medically verified stage.
- Treat *stage*, *pregnancy*, *postpartum*, *lactation*, *surgery*, *contraception*, *topic preference* and *goal* as independent time-varying dimensions; do not compress them into a single mutually exclusive age-category enum. A former stage record remains historically accurate when the user's current emphasis changes.
- Keep age-based organization discreet and transparent (“Suggested topics for you” / “See all topics”), never “You are too young for menopause” or “You cannot become pregnant.” Relevance should not become a prediction of fertility, diagnosis or treatment.
- All topic/data access, private source overlays, server-side consent and sex gate **remain enforceable independently of ranking**. An invitation to explore a topic is not consent to collect or process new sensitive facts.
- Integrate with existing low-input / personal learning selector only at presentation/preference level, not another AI orchestration engine; deterministic versioned method + user correction first, with no LLM needed. Avoid using sexual/reproductive history in generic Home/Today personalization or analytics without distinct purpose permission.

### Conceptual shared relevance contract (illustrative, not a new parallel engine)

```ts
type FemaleReproductiveTopic = "cycle" | "symptoms" | "life-stage"
  | "pregnancy-context" | "postpartum-lactation" | "menopause"
  | "fertility-education";
type ReproductiveTopicPlacement = "featured" | "ordinary" | "explore";
type TopicRelevance = {
  topic: FemaleReproductiveTopic;
  placement: ReproductiveTopicPlacement;
  basis: Array<"user-selected" | "user-reported-context"
    | "clinician-reported-context" | "age-soft-prior">;
  reasonText: string | null;
};
function projectEligibleReproductiveTopics(
  currentSavedProfile: {sex: "female" | "male" | null; revision: string},
  enabledPurposes: PurposeScopedGrantSet,
  explicitlyChosenFocus: string[],
  qualifiedTimeVaryingContext: unknown
): TopicRelevance[] {
  // First reuse authoritative server eligibility and consent.
  // If Profile sex !== female, return no female reproductive topics.
  // Explicit user focus outranks age-soft-prior. Unknown context stays unknown.
  // Return all permitted topics with varying presentation prominence;
  // exclude only by lack of release, authorization or user-chosen opt-out.
  return existingCanonicalTopicProjection(/* ... */);
}
```

**Additional acceptance IDs:**
- `RH-CONTEXT-01`: Female age 22, no context -> cycle/symptoms featured, menopause available in Explore; user can deliberately choose menopause without clinical inference.
- `RH-CONTEXT-02`: Female under 40 with relevant self-reported symptoms or diagnosed POI -> menopause-related education visible when chosen; no “too young” hard blocker or automated clinical label.
- `RH-CONTEXT-03`: Female 48, self-reported perimenopause -> transition symptom tools featured; conception-related topics remain reachable and no infertility statement.
- `RH-CONTEXT-04`: Female postmenopause -> menopause-related topics featured, routine cycle/conception prompts de-emphasized, past cycle observations intact.
- `RH-CONTEXT-05`: Female postpartum plus lactation -> correct independent context, appropriate relevant topic prominence; never auto-mark menopause because bleeding absent.
- `RH-CONTEXT-06`: Explicit user-selected trying-to-conceive / menopause focus takes precedence over age-soft-prior; “Not relevant” and pinned topics persist.
- `RH-CONTEXT-07`: Male/null Profile still yields **no female reproductive topics** regardless of age, hormone assays, previously saved stage, direct URL or preference rankings.
- `RH-CONTEXT-08`: Age/birth year missing/changed, goal corrected, stage corrected, pregnancy context ended, consent revoked, account switched -> scoped recomposition, no stale disclosure or silent loss of original data.
- `RH-CONTEXT-09`: Declined RH user sees no new age-triggered opt-in nag, reminders, generic Today preview or hidden collection.
- `RH-CONTEXT-10`: Adult sexual wellbeing remains separately opted-in and general hormone Bloodwork unaffected by reproductive topics' sorting.
- `RH-CONTEXT-11`: Multiple independent overlapping contexts do not collapse into a single fake inferred reproductive stage, and sparse reports don't yield ovulation or hormone-level predictions.

**Phasing:** Bind to the future initial RH topic picker/hub when that feature is scheduled; do not create an upfront AI model, a new background task system or a new v0.6 Core dependency. Existing `NEXT_ACTIONS.md`, Food #12 and Response #15 priorities remain authoritative. Record visual and functional actual-device tests under `PASS/FAIL/NOT_TESTED`.

## 2. Scope and canonical architecture

**Approve the Biology/Science goal**: optional private self-reported life stage, bleeding/cycle, symptoms, adult desire/libido and distress, compatible medical/hormone context, descriptive histories and cautious education—**not** a fertility app, hormone scoring engine or clinical therapy manager.

**Reuse canonical systems:** `shared/schema.ts` Profile sex, canonical dated observations, source revisions and correction, existing check-in/experience records, consent/rights controls, `client/src/pages/Profile.tsx`, Biology navigation, `client/src/pages/Progress.tsx`, Athlete source/goal infrastructure, Bloodwork lab import/history and lab-comparability, medication/exposure records where truly present, account export/delete and approved source invalidation/job mechanisms. Do not duplicate lab records, symptom databases, hormone-testing ingestion, recommendation selection, user identity or AI orchestration. Full medication manager, endocrine disease diagnosis, hormone regimen optimization and contraception guidance remain outside this handoff.

**Repository assessment:** Profile sex selection exists and persists with its own source/revision safeguards; Progress already consumes ordinary dated check-ins. This source audit does **not** demonstrate an RH hub, verified RH-specific consent, current private RH journal storage or appointment report implementation. Codex must inspect HEAD before implementation and report implementation/hosted/release separately.

## 3. UI placement and intentional experience

**Primary navigation:** Biology → **Hormonal & Reproductive Health** optional private hub, **female reproductive subtopics visible as available only for saved `sex=female`**. For nonfemale/unknown, do not show a female health tile as enabled, selectable, or a setup wizard; an optional general hormone/sexual wellbeing entry may be independently offered, clearly separate from female reproductive content. Do not add permanent top-level tab.

**Profile → Privacy & health topics** owns explicit topic enable/disable, separate consent purposes, hide/conceal, export, deletion and optional preferences (where the profile choice is not female, female RH topic toggle is not offered as enabled). **Progress** shows opted-in confidential history only; **Bloodwork** remains canonical testosterone/estradiol/etc. measured labs for anyone regardless of sex; **Athlete** may show user-requested relevant context only if eligible/consented and no automatic phase-based training prescription. **Today** no sexual/reproductive card, shortcut, widget, notification or preview by default, even if user previously enabled RH; any sensitive shortcut opt-in needs discreet neutral presentation.

**UX R2 quick capture (retain):** First visit: brief voluntary setup, select specific topic(s), skip/decline respected; preferred 4–6 symptom choices and “Choose more”; **one-screen fast logger**, event/date and optional impact/note, favourite categories, repeat template **without copying a previous day's symptom/desire as new fact**. Editable historical calendar/list, accurate dates/unknowns and coverage, source-linked canonical lab and exposure views, simple history followed by optional **What this means** and deeper reviewed evidence. No 20-field medical questionnaire, compulsive daily reminders or forced bleeding calendar. Sexual wellbeing adult-only: relative desire `lower / usual / higher / not sure`, optional bother/distress, no universal performance score and no mandatory sexual activity details.

**Appointment summary (ML-RH-2508, UX R2):** user-chosen date interval and individually selected topics, preview exact generated content before share/print; sexual details **OFF by default even if separately tracked**, raw lab content and other sensitive categories opt-in to include. Distinguish self-report/clinician report, coverage/missingness, original source date, method and user-supplied questions. No auto-email; private temp/PDF/share-sheet/access/cache/retention reviewed for two-account and revocation races. Account export and practitioner share are distinct purposes; truthful inclusion/omission and deliberate user-directed portability must be preserved.

**Design:** Bloom editorial palette, shared page-header grammar with discreet sensitive presentation (never embed private sexual info in decorative hero/media), responsive 320/390/768/1024/1440, Everyday forest/Athlete blue, accessible zoom/focus, neutral content and concealed notification titles. Preserve original approved assets and avoid new intimate imagery. The approved LDL mockup defines material/type quality not an exact page template.

## 4. Critical scientific/data corrections from specialist review

**ML-RH-2501 independent time-varying dimensions:** The initial Biology sketch conflates `stage` with `pregnant/postpartum`. **Do not implement a single mutually-exclusive enum containing all of them.** Instead:
```ts
type ReproductiveState = {
  stage: { value: "reproductive" | "perimenopause_possible" | "perimenopause_reported" | "postmenopause_reported" | "unknown" | "prefer_not_to_say"; source: "self_report" | "clinician_reported" | "not_inferred"; effectiveStart: string | null; effectiveEnd: string | null; revision: string } | null;
  pregnancyContext: DatedOptionalState; // separately dated; never infer none
  postpartumContext: DatedOptionalState;
  lactationContext: DatedOptionalState;
  contraceptionOrHormoneTherapyContext: DatedOptionalState;
  surgeryContext: DatedOptionalState;
};
// Adapt to existing canonical observation/source types; do not create parallel records.
```
The `DatedOptionalState` type is a conceptual placeholder resolved into existing source contracts, not a demand for a new duplicate schema. Hysterectomy/ovarian surgery, hormonal contraception and lactation alter suitability of calendar-stage explanations. Never assume natural menopause from missing periods in these contexts.

**ML-RH-2502/UT R2 coverage denominator:** Count actual `logged` days and explicit symptom-free reports; missing calendar days mean unknown, not no symptoms. Multiple events same date do not represent multiple independent symptom-days. Use `6 of 12 days logged`, not `6 of 30 days` unless all 30 observed. Distinguish `occurredAt`, `recordedAt`, approximate interval, source revision, timezone and retrospective recall.

**ML-RH-2503/05/06 scientific firewall:** no stage/ovulation/fertility/contraception predictions from sparse or altered periods; no serum hormone levels inferred from symptoms, temperature or LLM; no HSDD diagnosis from reported libido; no hormone-balancing food, supplement or medication change recommendation; no AI personal causal mechanism from sleep/exercise/symptom co-occurrence. Qualify assay/time/date/method/therapy when linking labs; self-reported stage ≠ clinician diagnosis. P0 clinical red flags including reported postmenopausal bleeding require qualified, Biology-reviewed professional-follow-up wording; not AI triage. Conception prevention claims require separate authorized method not approved here.

**ML-RH-2504/07/09 privacy and training truth:** user record/correction is not medical ground truth; accepted AI label isn't diagnosis. User-specific preference adaptation may reorder explicitly selected topics but may not infer pregnancy/sexual activity/fertility intent. No third-party model transfer by default; any LLM explanation typed source+reviewed evidence IDs and permission-gated. All shared learning/training OFF. Restricted feature controls do not block normal Food/Activity/Progress/other Biology.

**INT-RH source controls:** account/purpose scoped event ID and server-derived owner, original user choice, appropriate impact, source and revision, consent epoch, optional canonical hormone-lab/exposure IDs; correction/retraction and stale async result fencing. Sensitive fields excluded from generic caches, logs, analytics, previews, coach and default public-facing exports. Consent revocation cannot be undone by an old worker.

## 5. Universal feature gating and controls (binding implementation contract)

**Single server-authoritative eligibility service, shared by client view projection and all mutation/read/derived paths**:
```ts
type RHCapability = "female-reproductive" | "general-hormone-labs" | "adult-sexual-wellbeing";
type RHEligibility = {
  available: boolean; // Profile selection and feature release gates
  enabled: boolean;   // separate explicit topic consent
  reason?: "profile-female-required" | "topic-off" | "age-unverified" | "permission-revoked" | "not-released";
};
function mayUseRHTopic(
  currentAuthenticatedProfile: { sex: "male" | "female" | null; revision: string },
  topic: RHCapability,
  grants: PurposeScopedGrantSet,
  adultEligibility: AdultEligibility
): RHEligibility {
  // Pseudocode for existing canonical authorization/consent services.
  if (topic === "female-reproductive" && currentAuthenticatedProfile.sex !== "female")
    return { available:false, enabled:false, reason:"profile-female-required" };
  if (topic === "adult-sexual-wellbeing" && !adultEligibility.verified)
    return { available:false, enabled:false, reason:"age-unverified" };
  // Then check topic-specific release, current owner/purpose consent and source revisions.
  return existingCanonicalRHGrantProjection(/* ... */);
}
```
**Do not implement a standalone rights table if current permission/consent service suffices.** This is an illustrative ownership boundary; `adultEligibility.verified` stands for currently authorized age-eligibility policy, not fabricated KYC. Failed/unknown age gate = adult sexual-wellbeing unavailable, while general health data remain usable.

**The gating must cover:** Biology discovery/hero/teaser, quick log/topic list, saved favourites/templates, API create/read/update/delete, record export and practitioner-report selection, Today/Progress/Athlete widgets, external provider context, evidence/insight generation, background jobs, notifications, search, cache. Critically a deep link cannot bypass the gate; direct API must not trust client-side hidden controls. A gender/sex selection change immediately invalidates server read projections and in-flight derived work through canonical source revision. Handle already-owned archived records with secure user-directed deletion/export and reactivation; restrictions on normal read need a lawful account-data-access route where appropriate, rather than data loss.

**Tests for the explicit owner female-only rule:**
- `RH-SEX-01` Profile `female` + no topic consent: **female module available for private opt-in only**, no records automatically collected.
- `RH-SEX-02` Profile `male`: no female reproductive enabled option, cards, history, quick logs, Athlete contextual view, deep links or API access; **general hormone Bloodwork remains**.
- `RH-SEX-03` Profile `null`: no female feature visibility or inference from labs, age, name or historical data; optional clear route to Profile sex selection only from deliberate settings, not intrusive notification.
- `RH-SEX-04` `female → male/null`: block female feature immediately after profile revision, invalidate caches/queued jobs, protect old private data from leaks and don't silently delete; medical/bloodwork observations and unrelated sexual topic grants not modified without user direction.
- `RH-SEX-05` `male/null → female`: availability updates after confirmed Profile save; tracking stays off until voluntary explicit consent; restored older topic grants must be revalidated.
- `RH-SEX-06` nonfemale adult opting into **general sexual wellbeing** may use separately consented desire/bother logging without female reproductive cycle/stage fields; adult eligibility and privacy enforced.
- `RH-SEX-07` a male user has estradiol/FSH/testosterone in Bloodwork: lab history/chart remains visible with source/assay and truthful reference comparability, not falsely classified as a female reproductive tracker.
- `RH-SEX-08` two accounts (female and male) switching without logout, delayed searches, REST calls, cache, exports and background completion never cross-leak RH history or allow former session's female module to render.
- `RH-SEX-09` permitted privacy-focused export/deletion of archived records remains available after selection changes without re-enabling female reproductive recommendations; no backend guessing of selected sex from content.
- `RH-SEX-10` source-profile update plus consent revoke during async eligibility checks never republish a stale RH recommendation or expose a private practitioner report.

## 6. Reconciled original acceptance and phasing

**Preserve all original handoff IDs**: RH-01–10 and BIO acceptance 1–18; UT-RH-5801–5828 and R2 journeys A–I; ML-RH-2501–2509; INT-RH-01–08. The original science handoff uses terminology allowing other anatomies; apply **new owner female availability rule as a narrower product-scope override only**. Do not silently delete the science caveats or reduce original research/UX acceptance coverage.

| Phase | Approved scope | Implementation/release boundary |
|---|---|---|
| **Phase A — after Core priorities** | Profile female eligibility + independently opted-in topic selection, one-screen quick symptom/cycle log, dated source corrections, calendar/list and coverage honesty, soft reviewed education | Female reproductive topic not shown if Profile `sex!==female`; no need for AI. Sensitive consent/data security mandatory before live collection |
| **Phase B** | Separate adult sexual-wellbeing reporting (any Profile sex), explicit consent; source-linked hormone labs and existing medication context; practitioner preview/export with careful inclusion | Consent, age, Legal/Security and source-lab guards. No clinical model |
| **Phase C** | Optional private Athlete context, limited professionally reviewed self-care and observational co-occurrence, no automatic cycle-linked training changes | Science gate for red flag and reviewed claim language; no false causality |
| **Research/Advanced** | Sophisticated temporal inference only if independently justified; future authorized separate cross-user study | Not activated by this decision, no fertility/ovulation certainty, prescription change or global training |

**Scheduling:** Protect current `NEXT_ACTIONS.md` active meal/source repair, v0.6 Food #12, Response #15, existing Bloodwork correctness and visual QA. Do not build another hormonal AI stack, medical triage engine, competing backlog or global top-level navigation. Implement bounded stage work when active queue permits. Native SwiftUI eventually consumes same account-scoped backend eligibility/consent and does not invent alternate mobile gender gates.

**Acceptance evidence:** Source-level mapping and tests of saved Profile selection changes, server controls, correct original/derived permissions, source/consent race, browser 320/390/768/1024/1440 light/dark, Athlete blue, accessibility, discreet screenshots, rendered page-header consistency, complete appointment report byte inspection (where enabled), source-linked hormone bloodwork, no forbidden claims. Report `SPECIFIED`, `CODE_PRESENT`, `ENGINEERING_TESTED`, `HOSTED_VERIFIED`, `SCIENCE_REVIEWED`, `PRIVACY_LEGAL_APPROVED`, `RELEASE_ENABLED` separately; code alone does not activate sensitive feature.

**Definition of done:** People whose saved Profile selection is **female** may voluntarily and privately enable appropriate female reproductive health topics and receive grounded, non-diagnostic insights. Other selections do **not** see those topics as available, but remain able to use generic hormone Bloodwork and appropriately separate adult sexual wellbeing. All sensitive data are purpose-scoped, correctable, user-controlled, and never silently inferred or shared.
