# Bloom — Hormonal & Reproductive Health: Independent UX, Recording and Navigation Handoff

**Document:** UT-RH-20261117-R2  
**Date:** 2026-11-17  
**From:** Independent User Testing & Product Research  
**To:** Chief Architect & Integration Lead; Structural UX; Branding & Visual Design; Nutrition/Biology; Security/Privacy; Legal; Integrations; AI/ML; Codex  
**Revision:** R2 — evidence-checked competitor UX synthesis, 2026-11-17.  
**Disposition:** **APPROVE SCIENTIFIC DIRECTION WITH TARGETED PRODUCT/UX REVISIONS.** This is a design/acceptance handoff, **not** implementation, medical approval or consent to activate.  
**Primary source reviewed:** `Bloom_Reproductive_Life_Stages_and_Libido_Science_Handoff_2026-11-17.md`, section 1–13, provided in shared Bloom Library. It proposes RH-01–RH-10. The source title is **Reproductive Life Stages & Sexual Wellbeing**; this review uses **Hormonal & Reproductive Health** as the *proposed umbrella UI label* and explicitly separates the source scope from additional UX proposals.

## Executive decision

The underlying source is sensible: private opt-in; voluntary stage context; menstrual/cycle symptoms; adult-only desire/distress observations; cautious Athlete context; no diagnosis, hormone predictions, fertility confidence, sexual performance scores, compulsory tracking or pooled learning. Its largest missing piece is an actual app information architecture, a beginner-friendly step-by-step recording experience and interaction details. **Do not implement it as another page full of fields and dense disclaimers.**

**Recommended placement**:
- **Biology → Hormonal & Reproductive Health** is the *primary hub*, accessible through a discoverable Biology section/list; no permanent top-level navigation destination by default. The hub is gated behind voluntary setup and may be absent or presented as a neutral opt-in teaser depending on user preference. After decline, it must not resurface unsolicited.
- **Profile → Privacy & health topics → Hormonal & Reproductive Health** houses opt-in/out, separate purposes, data visibility, reminders, exports, deletion and related context preferences; Profile is not where routine entries happen.
- **Biology → Bloodwork** remains the canonical location for testosterone, estradiol, FSH, LH, progesterone, prolactin, SHBG and other measured hormone observations where supported. The hub can display *source-linked* relevant results but must never duplicate or reinterpret assay records. An unsupported marker remains source-only.
- **Progress → Health topics → Hormonal & Reproductive Health** (only after opt-in) is a contextual route/filtered view of the same private history; no public/global summary or score.
- **Today**: no sensitive card by default, even after opt-in. Only a user-chosen, suitably discreet quick-log shortcut or check-in entry, without revealing sexual/reproductive content in titles, reminders, widgets, previews or shared screenshots.
- **Athlete → Recovery/context**: optional read-only user-controlled contextual observations and a deep link to the same canonical record entry; no parallel cycle log or automatic phase-specific training prescriptions.
- **Food**: no extra standalone reproductive diary or implied hormone-balancing advice; at most respectful contextual guidance under existing food-safety/eligibility rules and explicit purpose permission.

## Proposed primary user flow — minimal setup (not a medical questionnaire)

1. The user deliberately visits Biology's optional health topics or Profile's privacy topics and sees: **“Track hormonal and reproductive wellbeing”** with two sentences explaining private records and optionality. Primary actions **Set up privately** and **Not now**. No gender, marital-status or sexuality assumption. No automatic enrollment using Profile sex/age/lab values.
2. If chosen, show **what would you like to track?** with independent options (multi-select, all optional): **Cycle & bleeding**, **Life stage & symptoms**, **Sexual wellbeing**, **Hormone treatment context**, **Hormone lab results (view existing Bloodwork)**. The final two are *proposed extensions/links* and require Architect/Science reconciliation; the science handoff only specifies related medication source links, not a full medication manager.
3. Explain separate consents in understandable language: recording; optional use to personalize *specific* private insights; reminders (off); any external AI transfer (off, separate); research/sharing (off, separately authorized and not in phase 1). The account should remain useful with only recording permission.
4. Provide **Skip this**, **Unknown**, **Not applicable**, **Prefer not to say** wherever relevant. Do not force stage, period status or libido entry. Disclose that phase/fertility/hormone levels will not be predicted from sparse symptoms.
5. Land on a useful, calm private hub with **Log an observation** and **See history**, not an onboarding carousel or a score.

## Hub composition (mobile-first, premium editorial rather than SaaS card stack)

**First view when opted in:**
- Discreet page title **Hormonal & Reproductive Health** with a small **Private** indicator and a visible **Hide / Privacy settings** action. No large illustrative body/sexual imagery. Use Bloom's warm editorial tokens and ample breathing room.
- A clear **Record an observation** action. For repeat users, offer a **Repeat last check-in** shortcut only if they intentionally use that observation type; never prepopulate yesterday's desire or symptoms as today's truth.
- One concise *meaningful* history statement based on recorded data, e.g. “3 symptom check-ins recorded this month” — never a health rating, hormonally balanced score or phase prediction. If empty, say “Nothing recorded yet” without judgement.
- A quiet timeline of the user's recorded categories/date, with icons/labels chosen to be discreet and clearly editable. Sensitive details are visible **only in the private hub**, and consideration should be given to a one-tap conceal mode on shared devices; do not claim this replaces device-level privacy.
- **Understand the topic** follows the record/history, with approachable *What is it / why does it matter / what remains uncertain?* language. Links to exact references, medication/lab source and detailed science on demand.
- A separate **Your hormone blood tests** link shows current eligible Bloodwork records and their original units/dates/limits; absence is not “normal”. Do not combine a lab value with a symptom to imply cause.

**Responsive behavior:** 320px and 390px maintain an early visible log action and a browsable history without scroll traps; 768px and 1440px may use a composed two-column history + education layout. No decorative full-height hero pushing the action below the fold. Support dark/light Everyday/Athlete, 200% zoom, larger text, keyboard/screen readers and reduced motion.

## Recording flows: one canonical quick-log entry, dynamic fields

Entry launcher shows the categories the user selected; all sensitive categories remain hidden outside the private hub unless they explicitly enable a discreet shortcut. No multipage 20-field form.

### Cycle and bleeding (optional)
**Tap Record → Cycle/bleeding →** select: **Period started**, **Period ended**, **Bleeding/spotting**, **Symptom only**, **Not sure**. Ask for date (defaults to today, changeable) and optional flow/impact/pain notes. Allow unknown or irregular history, contraception, pregnancy/lactation/surgical context and uncertain dates. Never infer ovulation, fertile days, conception probability or menopause diagnosis. Entries may be backdated and corrected.

### Life stage & symptoms
**Tap Record → Symptoms** → choose one or more user-selected symptoms (e.g., hot flashes, sleep disruptions, mood, fatigue, pelvic discomfort), with a simple impact option (none/mild/moderate/significant/unknown) and optional notes. Stage is **slow-changing background context**, edited only when appropriate in **My context**, not requested at every check-in. Differentiate self-report, clinician-reported and unknown; never label a life stage automatically.

### Sexual wellbeing (distinct adult-only opt-in)
**Tap Record → Sexual wellbeing** → one *relative-to-usual* desire choice: **Lower / About usual / Higher / Not sure**, followed by optional **Does this change concern or bother you? Yes / No / Prefer not to say**, and optional comfort/satisfaction note. Do not require a universal 0–10 score, sexual activity logs, partner details, frequency, orientation or a clinician label. **Low desire without distress must not trigger an alert.** A user must be able to opt into reproductive tracking without enabling sexual wellbeing.

### Treatments, medicines and hormone context (proposed UX extension; reconcile source contract)
A user should be able to reference **existing medication/supplement exposure entries** rather than re-entering them inside this feature. If missing, link to the canonical medication/exposure entry flow rather than creating a new tracker. Provide relevant start/stop or dose-change context only from explicitly recorded events, never an automatically implied ongoing regimen. For therapies where lab timing matters, collect **known** dose/application time, lab collection time and formulation/route *only where medically/technically supported and user-chosen*; unknown is a valid state. No dose recommendations or “ideal” targets. Source explicitly proposes medication source IDs; a full dedicated therapy experience is a new proposed scope and must be separately reconciled with existing medication tracking.

### Hormone blood tests
Do not build new hormone-lab input forms in the hub. The **Add/view hormone blood test** link uses **Bloodwork's canonical reviewed import/editor and trend components**. Display measured result → history → beginner explanation (what measured, why it matters) → deeper method/cycle/treatment/source details. No lab result should be classified “healthy” from an unverified age/stage/sex/assay context. Hormone lab collection timing, assay identity and treatment context are important when supplied, but absence must not prompt a fabricated interpretation.

## Interaction and privacy contract

- **Opt-in is granular:** reproductive life-stage/cycle tracking separate from sexual-wellbeing consent; private insights separate from raw recording; external model processing, external sharing and research/training each separate. Never infer consent from demographic fields or another consent (including photo model contribution).
- **Privacy by default:** no sensitive values on Today, public/profile headers, universal search autocomplete, notifications, lock screen, app-switcher thumbnails, analytics event labels, error logs, shared coaching surfaces, default account exports or general recommendations. Default export exclusion must be consistent with legal access/portability requirements and a discoverable, deliberate include/export mechanism.
- **Withdrawal:** immediate UI removal and cessation of downstream processing; versioned deletion/correction and derived-insight invalidation; accurate retention/backups claims reviewed by Security/Legal. Distinguish “hidden”, “disabled”, “withdrawn” and “deleted” explicitly.
- **Age:** restrict sexual-wellbeing recording to adults with a reliable age/eligibility gate; never assume age solely from a free-text Profile value, and avoid claiming technical verification where absent. Preserve access to safe general education where appropriate.
- **Dates and provenance:** occurredAt vs recordedAt, confidence/approximate range, source and revisions; no blank-as-zero or absent-as-no-symptoms. Account isolation and concurrent corrections must follow canonical existing write contracts. Sensitive retention opt-outs must cover backups under approved policy.
- **Education & safety:** short appropriate context + proportionate help-seeking where warranted; visible red-flag notices for postmenopausal bleeding etc. Avoid blanket alerts, algorithmic diagnosis, prescription changes or contraception/fertility advice. Any clinical red-flag detection/personalized treatment guidance requires separate qualified medical/safety review.
- **Shared device:** app-level conceal/hide option and neutral exit link are desirable but not substitutes for authenticated session controls. Do not promise perfect device secrecy or omit content from accessibility tree when the user intentionally opens it.
- **AI:** LLM must not infer stage, hormone status or private sexual activity from sleep/wearables. No automatic cross-user learning or training. This module should function deterministically without an AI provider.

## Important boundary: do not collapse ‘hormonal health’ into ‘reproductive/sexual’

The science source is about **reproductive life stages and sexual wellbeing**, not an exhaustive endocrine-disease or hormone-replacement-management platform. The proposed umbrella label may be helpful for navigation, but broader hormone disorders, endocrine treatment adjustment, dose optimization, infertility treatment, clinical interpretation of sex hormone tests and all-gender hormonal medicine require **separate scope, evidence and safety review**. Conversely, users with hormone bloodwork should not be obliged to consent to reproductive or sexual-health tracking.

## Requirements and acceptance IDs for Architect

| ID | Priority | Decision / acceptance |
|---|---|---|
| UT-RH-5801 | P1 | Biology is discoverable primary hub; Profile is privacy/context controls; Progress is opted-in history; no compulsory main tab |
| UT-RH-5802 | P0 privacy | Separate adult sexual-wellbeing opt-in from cycle/life-stage and from insights/external AI/training |
| UT-RH-5803 | P1 | Category-first quick log; only relevant fields; 3-step path to saving typical observation |
| UT-RH-5804 | P1 | Stage entered/edited as dated uncertain context, not daily prompt or auto-diagnosis |
| UT-RH-5805 | P1 | Optional cycle events and symptoms; no calendar-as-ovulation/contraception inference |
| UT-RH-5806 | P0 safety | Low desire without bother yields no warning; bother remains optional and private |
| UT-RH-5807 | P1 | Plain-language education after recorded history, sources behind disclosure; no status score |
| UT-RH-5808 | P0 data | Reuse canonical Bloodwork for hormones and canonical exposure/medication records; no duplication |
| UT-RH-5809 | P0 privacy | No default Today/notifications/widgets/coach/exports/logs leakage; user-controlled history visibility and deletion semantics |
| UT-RH-5810 | P1 | Contextual Athlete read-only annotations, only with user purpose consent; no period-phase training prescriptions |
| UT-RH-5811 | P0 data | Account-scoped occurred/recorded date, approximate ranges, correction revisions, consent receipts and unknown states |
| UT-RH-5812 | P1 | No default symptom questions every day; skip/decline respected; opt-in cadence with reminders off |
| UT-RH-5813 | P1 UX | Composed premium warm design across 320/390/768/1440, 200% zoom, keyboard and screen reader; actionable mobile top fold |
| UT-RH-5814 | P0 science | Safety red flags, medication abstentions, life-stage uncertainty, and correct clinical source boundaries reviewed by Biology |
| UT-RH-5815 | P1 | Existing Body/Progress and hormone lab views contextual-link into hub only by explicit user navigation/consent |
| UT-RH-5816 | P0 governance | Science source RH-01–RH-10 crosswalk, versioned purpose policy, Security/Legal review before activation, no nonconsensual ML |

## Minimum user journeys / developer test fixtures

1. Adult declines setup: no tracking fields, repeated prompt, Today card, background job, notification or analytics exposure.
2. Cycle tracking only: can log start/end/backdated symptom without activating sexual wellbeing.
3. Sexual wellbeing only: no menstruation or identity questions; low desire with no bother triggers no disorder alert.
4. Perimenopause self-report: labelled as *self-reported*, never medically confirmed; editing changes future framing without falsifying history.
5. Hormonal contraception, lactation or hysterectomy: period absence does not automatically become menopause, phase or infertility claim.
6. Period event correction/removal: exact dated history and dependent readout refresh; no double counting on save retry.
7. Repeated libido check-in: most recent data are not automatically copied as today's measurement; skip remains unknown.
8. Medication/hormone lab links: open exact canonical source and return; method/date/source preserved; no duplicated medical records.
9. Opted-out Today and Athlete: sensitive data do not appear in generic recommendations; user-controlled Athlete context has no phase prescriptions.
10. Symptom concern/red flag: appropriate gentle guidance without diagnosing or prescribing; clinician-reviewed triggers.
11. Withdraw consent or switch accounts: sensitive page/search/UI cache/derived text/export/AI context promptly cleared; no cross-user leak.
12. On 320/390/768/1440 light/dark Everyday/Athlete, complete entry, read chart/timeline, edit/correct, focus return and privacy controls using keyboard/touch/screen reader.
13. Sharing/export: default excludes private sexual details; user can deliberately export within lawful applicable portability expectations and see the exact included categories.
14. Missing/unknown dates and sparse entries: no false negatives, fabricated stage, phase prediction, causal claim or meaningless trend.
15. Underage or age-unverified account: no adult-only sexual tracking; safe educational route possible without collecting private events.
16. Absent AI provider: private recording/history and controls continue functioning; all automated claims abstain.

## Implementation sequencing and ownership

**Phase A (first usable slice):** Architect confirms nav and existing canonical records; Security/Privacy approves separated opt-in contract; Codex adds private hub, minimal choices and edit/delete history (cycle/symptom OR chosen category). No model requirement. Branding/UX reviews actual mobile screens.

**Phase B:** Adult-only sexual wellbeing as separately permissioned module; contextual Biology history and opt-in Progress views; linked existing Bloodwork/medication sources; appropriate education and clinician-reviewed safety text.

**Phase C:** Optional Athlete context, bounded cross-domain observed associations, prospective user-selected trends and properly reviewed explanations; no causal scores or fertility predictions. Research/pooled learning requires a wholly separate future approval.

**Architect:** own source crosswalk (RH-01–10), re-use existing sources, navigation, privacy and gate decisions. **UX/Branding:** own detailed task flows, clear language and 4-width/4-mode visual acceptance. **Biology:** stage/symptom terminology and safety/claims. **Security/Legal:** age verification, consent, leakage, data lifecycle and export rules. **Codex:** branch implementation, current-head reconciliation, same-SHA types/tests, user-journey tests, screenshots and deploy evidence. **User Testing:** validate observable tasks and absence of unwanted disclosures, without asserting clinical certification.

## Source / verification boundary

- Reviewed exact November 17 Biology handoff and inspected selected repository files at PR #1 `enhance/bloom-experience` head `0e41e457c1c920202b23b330e02bf2bec95073ac` (Profile, Progress, AthleteWorkspace, shared experience contracts). This is **not a complete repo audit**, and no new code, browser screenshots or release tests were run.
- Source-specific mandates: separate life-stage/cycle/sexual desire/distress; voluntary private tracking; no automatic diagnosis/fertility prediction; no pooled learning. This handoff's proposed app navigation, category launcher, specific entry UI, and hormone treatment/lab linking are **UX extensions** requiring Architect reconciliation, not existing approved scientific requirements.
- **Final position:** Approve science direction, **revise UX before implementation**. Keep unrelated v0.6 features moving and do not create an isolated fertility/sexual-performance product.


---

# R2 ADDENDUM — Competitive Product Research and Best-of-Bloom Experience Contract
**Prepared:** 2026-11-17. **Scope:** explicit owner request to review Balance, Health & Her, Clue, Flo, Caria, Midday, Natural Cycles and the Menopause Foundation of Canada tracker, and incorporate the best experience. This addendum **extends, and does not replace, RH-01–RH-10 and UT-RH-5801–5816**. Sources linked below are live product/help listings, rather than independent hands-on usability evaluations. Promotional claims are not independently demonstrated clinical outcomes. No app account was used and no competitor app was instrumented.

## R2 decision
**Adopt the combined patterns, not any single app.** Bloom should be as fast to log as a dedicated period/symptom app, as useful for a clinician visit as Balance/the Canadian symptom tracker, as educationally clear as Clue, as supportive as Health & Her/Caria, and more capable of linking *actual, source-aware records* through canonical Biology, Bloodwork, activity and exposure timelines. **Do not** inherit performance scores, algorithmic menopause-stage/ovulation forecasts, busy community feeds, default notifications, supplement marketing, AI-sounding causal interpretations or unvalidated wearable inferences.

## Competitor evidence and decisions
| Product | Source-supported interaction worth learning from | Bloom decision | Do not copy |
|---|---|---|---|
| **Balance** | Journal/symptom and period logging, patterns, practitioner-ready Health Report, expert educational content and community (`App Store`, source below). | **P0 borrow:** quick personalized favourites, a legible timeline, editable trend summaries, one-click **Prepare for appointment** PDF; structured but explicitly self-reported history. | Community, treatment rating claims, score-led or paywall-first experiences; avoid presenting stories as evidence. |
| **Health & Her** | Hormonal life-stage selection; calendar + symptom/trigger tracking; guided CBT, sleep and relaxation, breathing, pelvic floor exercises; opt-in reminders (`App Store`, source below). | **P1 borrow:** stage-relevant topic menu and small optional **Feel better now** evidence-reviewed self-care tools. Present self-care separately from tracking, without efficacy guarantees. | Large mandatory daily task list, unverified hormone-balancing claims, automatic trigger-causation labels, ads/commerce. |
| **Clue** | Dedicated perimenopause mode, customizable tracking categories, explanation of why something is tracked and when to seek advice; doctor report availability noted as **testing/limited availability** in 2026 support update. | **P0 borrow:** chosen category set, familiar date/calendar navigation, short **What this means** directly following result/history, optional appointment report. | Forecasting stage/ovulation from unreliable sparse histories; an imposing cycle calendar for non-cycling users. Respect privacy by architecture, not branding claims. |
| **Flo** | Stage-related tracking, perimenopause educational features, a distinct anonymous-account product mode (`official Flo privacy`, source below). | **P0 borrow as principle:** explicit mode boundaries, no surprise disclosure, clear control over sensitive records; educational content. | Do **not** call Bloom anonymous, protected by GDPR, or comparable to Flo's OHTTP design without implementation/verification; do not add AI prediction/community as prerequisites. |
| **Caria** | Short, situational CBT/mindfulness/audio support and symptom tracking; Siri shortcuts are advertised. | **P1 borrow:** optional immediate support attached to a user-chosen concern, accessible non-audio alternative, bookmark/revisit. | Single “daily symptom score”, engagement pressure, unsupported efficacy, chatbot dependence, lengthy mandatory courses. |
| **Midday** | Product listing describes wearable-enabled symptom context and virtual care/coaching. | **P2 research:** optional consented measurement imports when native provider contracts are **actually available**, link out to real care resources. | Black-box inference of hormone biomarkers, fabricated integrations or claim of live virtual care. Product detail is mainly vendor/platform description; validate before deeper adoption. |
| **Natural Cycles NC° Perimenopause** | Distinct perimenopause mode, symptom/cycle insights, integrations with supported temperature wearables. | **P2 conditional borrow:** temperature/sleep trend context as **measured device data**, plus transparent source and limitations when native connection exists. | Its algorithms, FDA clearance or contraception claims are **not transferable** to Bloom. No fertility certainty, hormonal-state prediction, or post-hoc extrapolation from temperature. |
| **Menopause Foundation of Canada MenoPause Symptom Tracker** | Free printable structured symptom tracker, updated and endorsed by the **Canadian Menopause Society**, designed to make symptom discussions with clinicians easier. | **P0 borrow:** Canadian-relevant, understandable symptom taxonomy and printable sharing layout; allow users to choose common symptoms rather than confront all at once. | Do not imply Bloom itself is medically endorsed or copy licensed wording/graphics without permission. Differentiate official tool from Bloom's own symptom log. |

## The one-screen product architecture
**Navigation remains:** Biology → Hormonal & Reproductive Health (optional hub); Profile → Privacy & health topics (consent and conceal); Progress → privately filtered history only after opt-in; Bloodwork remains canonical for hormone lab results; Athlete can deep-link with explicit permission. No permanent new global tab, no unsolicited sexual-wellbeing Today card.

**After opt-in, the hub is deliberately organized as five contiguous regions—not stacked dashboards:**
1. **Record**: prominent quiet `+ Log observation`, optional favourites (**Hot flash**, **Sleep disruption**, **Mood**, **Period start**, **Other**) derived only from categories the user enabled. A discreet sensitive category isn't surfaced outside private hub.
2. **Your recent pattern**: day/week/month switch; last 7–30 days of *actually recorded* symptoms/bleeding and a simple historical calendar/list. No green “healthy cycle” score, missing days never auto-classified symptom-free, no forced period-centric starting screen.
3. **Understand your records**: first-line explanation right beneath the relevant pattern (“These are the symptoms you logged; an association does not identify a hormone cause”). Short **What is this? / Why might it matter? / What could change it?** education stays visible when relevant; technical provenance/scientific detail is optional. This preserves the owner's prior beginner-education hierarchy.
4. **Optional support**: `Explore ways to manage this` offering reviewed, appropriately scoped breathing, relaxation/sleep routine, pelvic-floor education where relevant; user-initiated and no false treatment outcome claim.
5. **Prepare for an appointment**: deliberate export of a date-bounded report with **exact preview before generation**, user-selected categories and source completeness; a separate quiet `Privacy and sharing` affordance.

**Small-screen fold rule:** at 320/390, title, privacy affordance and primary `Log observation` are readily discoverable, not buried under decorative images; recent entry list begins promptly. 768/1440 may use editorial two-column chart + explanation, preserving identical semantics and privacy. Use existing token system, photographs/organic surfaces sparingly; no medical-dashboard wall of panels.

## The fastest realistic recording experience
**First visit (target: no medical questionnaire):** user manually chooses a single topic to enable (e.g. symptoms, cycle, sexual wellbeing as *separately consented*). Show 4–6 suggested common symptoms with `Choose more` or none, allow favourites, date defaults to today. All fields optional except an event/category and date when needed; allow approximate dates. Stage is background **My context**, not an eligibility prerequisite.

**Routine log (target: three interactions after opening the quick-log, not measured or guaranteed):**
- Tap favourite or `Log observation` → select symptom/bleeding/type → select **impact** (`None`, `A little`, `Moderately`, `A lot`, `Not sure`) and optionally date/time, trigger/context note → Save.
- Multiple symptoms may be entered in one batch for the same day without reopening the form. Each retains its own type, impact, and optional time; distinguish a day's summary from the underlying individual occurrences.
- Add once, edit in place, undo/correct and backdate without re-entering everything. `Repeat last` copies the **template/categories**, never presumes today's symptom/desire intensity or occurrence.
- Skip is not zero; `No symptoms today` is a **conscious explicit entry** if offered, different from no log.
- For bleeding, keep `started / ended / spotting / uncertain` and optional flow, pain and context. A symptom entry never automatically starts a period.
- Sexual wellbeing opens only inside its own adult-only consented category, with relative-to-personal-usual desire and optional bother; no questions about sex acts/partners by default.
- Treatment triggers and lifestyle factors are *observations*, not confirmed causes. Offer `Something else changed?` in an optional details drawer and use canonical medication/exposure IDs, no duplicate medication log.

## Calendar and insights contract
**Two synchronized views:** calendar for recorded event dates and a more accessible chronological list; selected month/week and filters persist on navigation return. Do **not** show a projected fertile window or menopause date. A chart of days with logs is **logging frequency**, not symptom frequency unless exposure/denominator rules are explicit. With sparse history show `You've logged on 4 days` rather than `You had 4 days of symptoms` unless records establish the latter. Respect retrospective correction and timezone.

**Trend examples:** `Hot flashes were recorded on 6 of 12 days you logged this month`, not `Hot flashes occurred on 6 of 30 days`; `Sleep disruption and hot flashes were logged on the same three dates`, not `Hot flashes caused poor sleep`. If periods are irregular or hormonally affected, do not infer cycle phase. Lab/test/drug events show as **optional source-linked markers**, after consent, not auto-attributed causes. Offer `What else could explain this?` with plain-language uncertainty.

**Clinician report contract (strong competitive priority):**
- Preview + optional date range (30/90 days/custom), symptom frequencies and impact based on *logged coverage*, user-entered stage qualifiers (self-reported/clinician-reported), dated cycle events, relevant medication/hormone context if explicitly selected, a concise user-authored concerns/questions field and documented missingness.
- The default PDF excludes sexual-wellbeing content and any additional highly sensitive category unless individually toggled on with an immediately visible, clear confirmation. Preview every included section; no automatic email/share; generate locally/under authorized server handling with retention policy reviewed, remove temp files; disable sensitive notification/preview leakage.
- Link to original Bloodwork report when the user chooses to include it, but do not attach private raw labs by default or repeat records in a shadow dataset.
- Label reports `User-recorded health observations; not a diagnosis or verified laboratory assessment`; never display **endorsed by the Canadian Menopause Society** on Bloom output.

**Self-care contract:** opt-in small education/exercise library grouped by user concern, with qualified author/clinical-source attribution, contraindication/accessibility alternatives; no personalised therapeutic claim unless separately evidence-reviewed. CBT exercises are not a substitute for professional mental-health care. Do not embed proprietary content from competing apps.

## Revised delivery order (designed to maximize usefulness)
**Slice 1 — P0 product utility:** consent and discreet Biology entry; configurable symptom favourites; fast one-screen recording; edit/revise; familiar calendar/list; observed-pattern counts with missingness, novice-friendly education directly below trend; source integrity and empty/unknown states. No AI, wearable or fertility prediction.

**Slice 2 — P0 differentiation:** user-previewed clinician PDF, simple appointment summary and optionally related canonical hormone lab/medication context; full privacy/export tests. This is a **higher-priority addition than an advanced AI classifier or community**.

**Slice 3 — P1 targeted support:** reviewed educational micro-tools, optional 1-question check-ins, contextual tips, stage-specific but non-diagnostic navigation, optionally private Athlete overlays; no mandatory daily engagement.

**Slice 4 — P2 after native data/validation:** consented wearable correlations, prospective before/after change tracking, clinical partner links where real, research and prediction only under a separately approved scientific/regulatory and privacy scope.

## Additional R2 requirements for Architect crosswalk
| ID | Priority | Acceptance |
|---|---|---|
| UT-RH-5817 | P0 UX | First visit enables a selected topic without stage, fertility or sexual-history questionnaire; skip/decline remains respected. |
| UT-RH-5818 | P0 UX | Favourite-based quick log, optional batch entry, date correction; no implicit symptoms or preselected today's severity. |
| UT-RH-5819 | P0 UX | Calendar + list both readable; explicit coverage denominator and missing days; no false negative/ovulation predictions. |
| UT-RH-5820 | P0 UX | Novice explanation below history/pattern and before deep scientific sources; readable meaning without four duplicate disclaimer blocks. |
| UT-RH-5821 | P0 UX | Appointment report with category selection, exact preview, user concerns and clear `self-reported` framing; sexual details excluded by default. |
| UT-RH-5822 | P0 privacy | Separate consent for sexual info and external model processing; no hidden sensitive previews, shared services, telemetry, coach or notifications. |
| UT-RH-5823 | P1 | Evidence-reviewed optional symptom support without automatic CBT treatment claim, engagement-pressure or wellness scoring. |
| UT-RH-5824 | P1 | Category-specific stage context not imposed by gender; no forced calendar/ovulation view for non-cycling users. |
| UT-RH-5825 | P1 | User-selected existing medication/hormone bloodwork link remains source canonical; overlay displays dates but no causal attribution. |
| UT-RH-5826 | P2 | Wearable measurement context only after real native/source consent; no temperature-derived hormone/menopause/contraception inference. |
| UT-RH-5827 | P0 QA | 320/390/768/1440, 200% zoom, voiceover, touch, keyboard, dark/light Everyday/Athlete, repeated saves, edit/delete/withdraw, account switch and report preview leakage tests. |
| UT-RH-5828 | P0 scope | No fake endorsement, no copied competitor content, and no AI/community/performance scores as MVP requirements. |

## Mandatory test journeys to add
A. New user enables symptom tracking only, creates `Hot flash: A little`, edits its date and sees it on calendar/list without enabling sexual wellbeing or reproductive stage.
B. User with four days logged during 30 days sees the correct recorded coverage and no false “26 symptom-free days”.
C. User tracks spotting while using hormonal contraception; no automatic period start, ovulation date, menopause state or pregnancy risk assertion.
D. Adult enables sexual wellbeing but exports a clinic PDF; default PDF and preview contain **no** sexual wellbeing data until explicitly included.
E. User uses favourite and batch saves several distinct symptoms; duplicate click/retry does not duplicate observation; edit one retains others.
F. User revokes consent, switches account or deletes source; active charts, cached reports, shared preview and exported-temp files respect required privacy and retention policy.
G. After a related hormone lab is added, the hub shows source-linked measurement only by deliberate user selection; no false causal wording from coincident symptom trends.
H. Optional self-care module is useful in no-data, offline or AI-provider-unavailable states; never claims to resolve clinically concerning symptoms.
I. Visual comparison confirms no table/card wall at 320/390, clear quick log above fold, education just below results, no truncated popover/dialog, report preview legible at 768/1440; dark/Athlete distinction remains.

## External source register, reviewed 2026-11-17
- Balance Canada App Store — symptom tracking, journal, health report: https://apps.apple.com/ca/app/balance-hormones-menopause/id1503345959
- Health & Her App Store — stage modes, trigger/symptom tracking, CBT and other tools: https://apps.apple.com/us/app/health-her-app/id1519199698
- Clue help — perimenopause mode: https://support.helloclue.com/hc/en-us/articles/13059487439261-What-s-Clue-Perimenopause-mode
- Clue 2026 product update — doctor report is in testing and may not be globally available: https://support.helloclue.com/hc/en-us/articles/18141097264413-What-s-new-in-the-Clue-app
- Flo privacy portal — Anonymous Mode design: https://flo.health/product-tour/anonymous-mode
- Caria Canada App Store — tracking, quick relief audio and CBT-style courses: https://apps.apple.com/ca/app/caria-menopause-midlife/id1477621356
- Midday third-party listing — wearable context, coaching, virtual care as marketing: https://marketplace.aviahealth.com/product/66432
- Natural Cycles Canada — perimenopause mode and optional compatible wearable temperature: https://www.naturalcycles.com/ca/perimenopause
- MenoPause Symptom Tracker, Menopause Foundation of Canada — Canadian Menopause Society endorsement and printable tracker: https://menopausefoundationcanada.ca/introducing-updated-menopause-symptom-tracker/

**Evidence boundary:** Sources substantiate advertised product capabilities and official endorsement of the **Canadian Foundation tool**, not independent quality of the apps, medical endorsement of Bloom, a successful Bloom integration, or actual user-tested superiority. Nothing above changes the scientific handoff's no-diagnosis, no-fertility prediction, no-autonomous-medication or no-unconsented-learning rules. The Architect owns final scope and science/privacy approval; Codex owns implementation, tests and screenshot evidence. **Proceed with the useful bounded UX build; no blanket stop-work gate for other v0.6 work.**