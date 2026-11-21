# BLOOM — Proactive Scientific Discovery, Personalized Relevance & Medical-Condition Selector
## Owner / Chief Architect implementation handoff to Codex

**Date:** 2026-11-21  
**Status:** OWNER-APPROVED DIRECTION AND IMPLEMENTATION SPECIFICATION; NOT CODED / NOT CONSUMER-ACTIVATED / NOT CLINICALLY VERIFIED.  
**Execution:** Codex sole engineer, one `NEXT_ACTIONS.md` queue on `enhance/bloom-experience`. No new independent services, separate AI graph, research feed vendor, provider consent, second condition database, or extra designer role. Existing science-first P0→P1→P2→P3→P4; implement bounded safe condition-capture UX as high-value data-source quality work when appropriate; proactive research insight surface is a P3 consumer-value milestone **after** independently verified P1 hypotheses, P2 reviewed science and authorization. Preserve working modules; stop relevant unsafe claims immediately. Current operator pause on Render/Mac integration, deployments/live DB changes and external health-data transfer stays binding.

### Product question

Bloom must eventually **notice new credible research, determine if it is relevant to an authorized user's recorded health context, and proactively show a single useful, evidence-grounded finding, investigation question or safe next step without requiring users to find papers themselves**. The user must also have a quick, **checkbox-based, searchable, grouped list of relevant medical conditions/issues** (e.g. **MASLD / previously NAFLD**, **low testosterone / hypogonadism**) available in a natural, easy-to-find **Health Profile → Medical conditions & health concerns** section. Users should never have to type common conditions to select them. The catalogue is **extensible rather than falsely comprehensive**: include wide cross-system coverage, searchable synonyms/old terminology, `Not listed? Add a condition or concern`, and an accessible user-defined option. The user may select multiple conditions and decline to answer. These choices **inform** relevant UI, food advice, lab interpretation and research *only when applicable and authorized*; they are not clinical diagnoses or blanket consent for data transfer.

### Inspected current code — verify again at HEAD

- `shared/precision-nutrition.ts`: `contextSchema.conditions: z.array(shortText).max(30).default([])` around line 771, with separate medications, current supplements, allergies, intolerances, pregnancy, safetyReviewed. Existing schema/semantics must not be broken.
- `client/src/pages/PrecisionNutrition.tsx`: `ContextEditor`, lines ~102–208, currently maps `conditions` to comma-separated input alongside other strings, marshals `contextSchema.parse({...})` on save. Replace the **conditions** UX with a checkbox selection + free-entry fallback, **not** medicine, allergy, supplement fields. Preserve geneticsSelection/microbiomeFood's separate protected controls.
- `server/precision-routes.ts`: `PUT /api/precision/context` near ~534–545 validates `contextSchema`, rejects editing protected dataset selection. Account authentication and `store.putPrecisionContext` are existing owners.
- `shared/schema.ts`: some precision and experience source data are encrypted; inspect actual `getPrecisionContext`/`putPrecisionContext` backing crypto and source revisions before modifying. Do not claim all health data is E2EE. Never add public SQL condition tables with plaintext patient condition strings.
- `server/biological-investigation-snapshot.ts`: existing authorized snapshot/consent/source epoch; condition selections should join this **only as user-report facts** with their review/verification state and source revision, without leaking to external scientific provider.
- `server/scientific-question-boundary.ts`: nonpersonal vetted `taskId` boundary; an individualized condition description must never turn into a Gemini public research question. Public research is pre-approved independently of the person's profile.
- `server/investigation-candidate-admission.ts` and `server/scientific-evidence-retrieval.ts`: reuse fact/source/claim/action admission; disease-specific actionable claims retain clinician/science rights gate.
- `NEXT_ACTIONS.md`: blind INV-HELDOUT-01/INV-AI-DEDUCE-01 and multi-provider strict routing/verification precede consumer scientific activation. Statuses are claim-scoped PROVEN / IN FLIGHT / EXPLORATORY with exact receipts.
  
## 1. User-facing interaction and information architecture

**Entry:** Add a clearly named **Medical conditions & health concerns** section accessible from **Profile → Health** (or existing Precision Nutrition → Your goals & health context with a discoverable Profile link; prefer reusing current context owner and no duplicate persisted source). Put a short helpful explanation: “Select any diagnosed conditions or health concerns you want Bloom to take into account. This helps tailor what it reviews, but doesn't establish a diagnosis.” On a typical mobile viewport, keep the selection lightweight, not a page of 200 permanently expanded checkboxes.

**Selector:**
1. **Quick picks** of relevant common conditions (a small stable set, not inferred from an individual or from lab results without user permission).
2. **Search** by common name, clinical term, legacy name, acronym, popular spelling and synonyms. Search should immediately reveal selectable matching results; allow category expansion or show all. Don't require opening a text input to add common choices.
3. **Grouped sections** for metabolic/liver, endocrine/hormonal, cardiovascular, gastrointestinal, immune/allergy, respiratory, kidney/urinary, neurologic, mental health/sleep, musculoskeletal/pain, reproductive/sexual, hematologic, nutritional, infectious, dermatologic and other. Use accessible checkbox semantics with associated labels, counts and keyboard focus; duplicate search results don't create duplicate selections. Use concise single-line labels and optional popover term clarification only where essential.
4. **Selected chips / summary** visible before save and on later review, with individually removable checks. A checked option means “I report this,” **not** “my doctor verified this.” Optional per-choice status `clinician_diagnosed | suspected_or_under_evaluation | past_or_resolved | unknown`, date/known approximate date, and last-confirmed timestamp may be edited in a second-step detail drawer, not demanded at initial checkbox click. Never silently mark `clinician_diagnosed`. For symptoms/markers that aren't diagnoses, use `health_concern` classification with copy explaining the distinction.
5. **Other / Not on list** allows a custom name with trimmed length bounds, sanitization, no markup and private owner scope. Do not auto-map ambiguous custom text to an unrelated canonical clinical code; keep unresolved until explicitly confirmed. `None selected` means **not provided**, not “no medical conditions.” Provide explicit “I have none to report” if wanted, with a stored reviewed/dated declaration distinct from empty. `Prefer not to say` leaves record unselected and disables condition-driven inferences.
6. Allow **edit, remove, deactivate, correct, export and account erasure**. Selected state persists through reload, settings/personal source edits, account switch, export/import and authorized change. No saved condition may be silently generated from elevated AST/ALT, low testosterone lab value, microbiome pathways or genotype alone.
7. **No condition-based food exclusion unless warranted** by verified allergy, medically required restriction or separately reviewed eligibility. Medical conditions/concerns guide relevance, safety/uncertainty and questions, not automatic diagnosis, medication advice or blanket food prohibition.

### Minimum non-exhaustive catalogue seed (expand from curated clinical terminology data)

Implement a **versioned clinical concept list** using a suitable properly licensed terminology source **only after rights review**; stable opaque IDs, display name, group, type `condition|health_concern`, synonyms/legacy labels, code-system mappings when supported and reviewed, retired/replacement/merge record, applicability, language and catalogue version. Do not download and publish an unlicensed SNOMED/ICD/LOINC value set or claim official medical coding. Start with a modest independently reviewed local seed and a rights-reviewed expansion path; keep user custom entries and original names unchanged through catalogue upgrades. The following categories/examples are acceptance coverage anchors, **not an exhaustive list or a patient diagnosis claim**:

- **Metabolic, liver:** metabolic dysfunction–associated steatotic liver disease **MASLD (formerly NAFLD)**, MASH (formerly NASH), liver fibrosis/cirrhosis, obesity, visceral adiposity concern, metabolic syndrome, insulin resistance concern, prediabetes, type 1 diabetes, type 2 diabetes, gestational diabetes, dyslipidemia/high LDL/high ApoB, high triglycerides, low HDL, hypertension, gout/hyperuricemia.
- **Endocrine/hormonal:** low testosterone / male hypogonadism (diagnosis vs low lab concern), thyroid underactivity/Hashimoto, hyperthyroidism/Graves, PCOS, menopause/perimenopause concerns, adrenal disorders (not unverified “adrenal fatigue”), hyperprolactinemia, pituitary conditions, osteoporosis/low bone density, vitamin D insufficiency concern.
- **Gastrointestinal:** reflux/GERD, esophageal stricture, dysphagia, celiac disease, inflammatory bowel disease/Crohn/ulcerative colitis, IBS, constipation, chronic diarrhea, lactose intolerance, fructose malabsorption, gastroparesis, gallstones/gallbladder disease, pancreatitis/pancreatic insufficiency, chronic gastritis, microbiome-related concern (not a standalone diagnosis).
- **Heart/vascular:** coronary artery disease, heart failure, atrial fibrillation, other arrhythmia, stroke/TIA history, peripheral artery disease, venous thromboembolism history, familial hypercholesterolemia, sleep-associated cardiovascular risk concern.
- **Immune/allergic/respiratory:** asthma, allergic rhinitis, environmental allergy, food allergy (separate canonical allergy restriction workflow), eczema/atopic dermatitis, chronic sinusitis, COPD, obstructive sleep apnea, autoimmune disease, rheumatoid arthritis, psoriasis/psoriatic arthritis, ankylosing spondylitis, lupus, immune deficiency, chronic urticaria.
- **Renal/urologic:** chronic kidney disease, kidney stones, recurrent UTI, prostate enlargement/BPH, urinary symptoms, interstitial cystitis.
- **Musculoskeletal/chronic pain:** osteoarthritis, chronic low-back pain, inflammatory joint symptoms, fibromyalgia, tendon injury, osteoporosis/osteopenia, joint stiffness (concern, not a diagnosis).
- **Neurologic/sleep/mental health:** migraine, epilepsy, peripheral neuropathy, ADHD, depression, anxiety disorder, insomnia, restless legs syndrome, sleep apnea, chronic fatigue symptoms, cognitive symptoms. Treat sensitive psychiatric/neurological categories with privacy care and no stigmatizing default.
- **Hematologic/nutrition:** iron deficiency or anemia, B12 deficiency or low B12 concern, folate deficiency, nutrient malabsorption, high hematocrit, bleeding/clotting disorders, food insecurity/nutrition adequacy concern; don't equate a lower-end normal biomarker with confirmed deficiency.
- **Reproductive/sexual:** erectile dysfunction, infertility, endometriosis, PCOS, menstrual concerns, low libido concern, pregnancy-related conditions. Sex/age/pregnancy applicability influences advice, not which selectable issues a user is allowed to report.
- **Other:** cancer history/active cancer under specialist care, infectious disease history, dermatologic conditions, tinnitus/hearing loss, ocular disorders, chronic pain, medication-related adverse effect, “other health concern.”

Terms such as elevated liver enzymes, low testosterone value, low HDL, joint stiffness, or reflux symptoms can be **concerns** instead of clinician-confirmed diagnoses. Make no claims of completeness. Allow searching all relevant clinician-reviewed terms and the user's original custom terms; offer “add a missing condition” feedback separately from the user's private record without sending their sensitive selection.

## 2. Data and contract design (prefer backwards-compatible extension)

**Existing `conditions:string[]` must continue to parse exactly as before** for persisted records and old clients. Don't blindly replace it with a new required shape, remove manual entries, silently interpret old free-text as coded diagnoses or expand it into a duplicate medical-profile store. Add optional `conditionSelections` with versioned records or a versioned parallel **encrypted precision-context field** if backwards compatibility requires it. Preserve `conditions` as legacy projection until all reads/export/invalidation have migrated; never write two competing sources of truth.

Recommended fields:
```ts
type ConditionSelection = {
  selectionId: string; // stable per account / source record, not global PII
  conceptId: string | null; // curated versioned catalogue ID, null for custom
  enteredLabel: string; // actual displayed/original name, account-private
  category: 'condition' | 'health_concern';
  reportStatus: 'self_reported' | 'clinician_diagnosed' | 'suspected' | 'past_resolved' | 'unknown';
  activeStatus: 'active' | 'inactive' | 'unknown';
  firstKnownOn?: string | null; // optional coarse date
  confirmedAt?: string | null; // user reviewed, NOT clinician verification
  createdAt: string;
  updatedAt: string;
  catalogueVersion: string | null;
  sourceRevision: string;
  reviewState: 'user_selected' | 'imported_unverified' | 'clinically_reviewed';
};
type ConditionContextProjection = {
  version: 'condition-selection-v1';
  selections: ConditionSelection[];
  noConditionsReported: boolean | null; // null=unknown; do not conflate empty
  revision: string; // optimistic concurrency
};
```
Use strict Zod schemas, caps (e.g. 100 selections, bounded labels, dedupe canonical IDs), canonical change semantics, strong per-account authorization, encrypted storage/projections, ETag/If-Match or current revision-scope compare-and-swap, idempotent updates, and append-only change/revocation audit if existing source services support it. Avoid allowing the untrusted client to set a privileged `clinically_reviewed` value. User-chosen “clinician diagnosed” is still **unverified self-report of diagnosis** unless separately verified source evidence exists. Unrecognized coded condition does not give diagnostic authority. No DOB/genetic/medical notes in concept catalogue or client analytics.

**Source-of-truth integration:** use `getPrecisionContext`/`putPrecisionContext` or existing source/version control, not per-user dynamic SQL and not new global plaintext tables. If the existing context PUT rewrites non-condition controls, preserve entire current object including `geneticsSelection`, `microbiomeFood` and their separate access restrictions. Prefer a scoped condition PATCH service with fresh context revision and safe merge to avoid current PUT's wholesale resets; inspect actual storage implementation before choosing. On condition edit remove stale private inferences and related caches; unrelated observations/record history remain. Only scoped account-private reasoning sees selected condition entries; external public science receives independent approved taskIds only.

## 3. Proactive scientific discovery → meaningful personal insight

**Separate two lifecycles:**
1. **Nonpersonal scientific discovery:** approved source ingestion / literature discovery → original DOI/PMID full study and data-rights check → supportive, contradictory, null and harm evidence → eligibility/review/uncertainty → immutable reviewed shared science release and withdrawn/rights overlay. This is P2 science, not an LLM-generated “new study alert.” No automatic promotion from news/social source/abstract/model answers.
2. **Private relevance matching:** when a **new/changed reviewed science release**, **new source-qualified user lab/food/activity/condition report**, **correction**, or **user-requested refresh** occurs, evaluate relevant reviewed claims against the person's *current authorized private facts*, goals, conditions/concerns and evidence applicability. Personal history/condition combinations **must never be included in provider task selection/payload** except the already permitted internal `taskId` nomination.

**Relevance is not diagnosis:** distinguish measured vs user-reported vs suspected, study species (mouse/in vitro/human), study design, causal strength, magnitude and outcomes, treatment novelty and availability, individual missing gene/organism/assay evidence, contraindication/competing clinical issues and prior actions. Merely having a condition, a gene or microbe does not prove pathway activity or personal benefit. For new bacteria such as *Clostridium immunis*, a mouse mechanism and human associations may justify a **research-only curiosity insight**, not a proven treatment, an attempt to culture it, or specific prebiotic to increase it.

**Staged suggestion levels:**
- `research_interest`: educational new study relevant to a reported interest, clearly preclinical/observational, no individual claim.
- `investigate_further`: evidence-linked, safe question about missing data or testing validity; avoid recommending expensive tests solely on interesting animal data.
- `reviewed_wellness_option`: an eligible low-risk, evidence-supported lifestyle option with applicable review and explicit user choice, no certainty or diagnosis.
- `clinician_discussion`: when medically significant, contextualized question to discuss; **no** medication dose change, diagnosis, treatment order or urgent triage unless independently reviewed policies specifically allow.
- `not_eligible`: no consumer notification; still record transparent internal rejection reason.
  
**Trigger + noise control:** User-selectable `researchInsightPreferences` with `enabled` default OFF until eligible consumer feature approval and explicit opt-in, preferred topics, cadence `manual|weekly_digest` (daily high-volume alerts not default), relevance threshold, mute/snooze, and preference for preclinical insights OFF by default. Avoid lock-screen notifications containing sensitive disease names; in-app feed first, optional generic push only with permission and transport/privacy review. No open-ended recurring LLM crawling or unbounded background per-user personalization; use changes to already approved versioned science as triggers, dedupe and batch. Don't infer user-consent for provider processing from opting into an insight digest.

**Explainability and exact attribution:** Each candidate insight must capture `claimIds`, DOI/PMID and excerpt locator (independently verified), scienceReleaseDigest, withdrawalEpoch, source applicability class, private relevant fact *references only*, data/consent/policy epoch, missingness, why-it-matters, user-facing `what_we_know`, `what_we_dont_know`, `what_you_can_consider`, contraindication/safety check, review tier, rank/score basis, cost if any and recorded suppression reasons. Exact copy generated only from eligible facts; AI text is untrusted and checked. A cache hit requires current source, permission, consent, rights and withdrawal checks. Never persist a personal relevance score in shared public research or claim graph.

**UX minimal:** Place a quiet “Research relevant to you” area in existing Explore/Insights/Today at the point of utility (one recommended entry, expandable details, no redundant insight cards). Show label e.g. `Early research · mice`, `Human observational`, `Reviewed human evidence`, `Insufficient evidence for a personal action`; make this a clear stage not just a colorful badge. Offer **Why this matters / What evidence says / What is uncertain / What's next** and actions `Save`, `Not relevant`, `Dismiss`, `Mute topic`, `Review my health context`. Do not claim “your bacterium is missing”, “increase this species”, “you have a condition” without validated original-user evidence. Push alerts and proactive activation remain behind reviewed feature approval.

### Source / condition usage through Bloom's interfaces

- **Bloodwork:** user-reported condition may prioritize which *measured* source markers are reviewed; does not alter measured values, reference ranges or diagnose from them.
- **Food:** condition constrains reviewed eligible nutrition suggestions and contraindication checks; a generic condition checkbox does **not** silently create food allergy exclusions or rewrite consumed intake.
- **Microbiome/genetics:** study relevance may prompt a question; low-confidence taxonomy/strain calls or consumer gene variants cannot become diagnosis, enzyme flux or proven probiotic action.
- **Activity:** suggestions use actual recorded workload/time and known confounders rather than making treatment claims.
- **Response & investigation:** selected condition acts as a **reported hypothesis/clinical context** that may inform applicability/confounders; competing explanations remain necessary. An omitted/unselected condition is **unknown**, not negative.
- **Privacy/data export:** account scope, opt-out, deletion/correction and separate external provider consent apply to every action; never use these conditions to automatically alter scientific shared knowledge.

## 4. Phased engineering implementation

**H0 (current P0/P1 compatible, build first when source-context gap actionable):** Source/consumer inventory `FOUND/PARTIAL/ABSENT/UNVERIFIED`: profile and PrecisionContext UI, encrypted storage, source epochs, current condition-related downstream filters, investigation snapshot, Explore feed paths and rights/versioning, existing notification/prefs, tests. Produce compact file:line matrix and no redundant designs.

**H1 (small user-value slice, can run before P2 if source/privacy tests pass):** Add curated initial broad concept catalogue with stable IDs/search/synonyms and responsive accessible checkbox selector in existing health profile/context; retain custom “other”, legacy `conditions:string[]` read/migration and unique-account persist. Add source status (user-reported vs clinician diagnosed etc.) and safe existing context save/read without wiping protected preferences. UI shows manageable grouped choices and reviews. No AI-dependent changes and no production release without auth/schema tests.

**H2 (private cross-domain integration, align P1):** Bind condition selections to authorized private investigation snapshot and current eligibility rules as *reported* context, preserve source digest/consent revision. Measure attribution and conflict handling; establish exact negative cases for unreported/withdrawn conditions, conflicting labs and imported-only labels. Do not create static condition→treatment mapping rules.

**H3 (after P2 original-source reviewed durable science):** Implement `reviewed-science-updated → account-private relevance candidate → current claim/action verification → optional in-app suggestion` contract and optional user-triggered “Check new research” with opt-in semantics. Use source-specific relevance/applicability, deduplication and review tier; do not activate outside synthetic experiment.

**H4 (P3 owner-facing demonstration):** On sealed synthetic profiles: (a) MASLD reported + longitudinal lab/weight/food changes; (b) low testosterone concern but no confirmatory diagnosis and confounded activity/medication; (c) new *C. immunis* mouse + human association paper; (d) conflicting/null human study; (e) irrelevant article; (f) retracted/rights withdrawn study; (g) changed medical condition; (h) multiple account isolates/opt-out; compare old deterministic experience to verified relevance. Show one useful eligible insight only when evidence and permissions permit, otherwise research education or abstention. Independent science/security/consumer review before public activation. Preserve `INV-AI-DEDUCE-01` and `INV-HELDOUT-01` separately; proactive alerts are additional capability, not a replacement for dynamic AI deduction.

## 5. Security, clinical and acceptance tests (must implement, not merely list)

`COND-01` initial render: grouped searchable checkbox choices, clear reported vs diagnosed wording, no typing for MASLD/NAFLD or low testosterone; accessible screenreader, tab/Space, 320/390px/200%, 30+ visible group names not all expanded; don't assume untested physical iOS.
`COND-02` synonyms: NAFLD→MASLD, fatty liver, NASH→MASH, low T→low testosterone, testosterone deficiency/hypogonadism; search has canonical stable ID and explicit distinctions (low lab concern vs diagnosed hypogonadism).
`COND-03` multiple selections, no duplicates across synonyms/search; remove/re-add, unsaved changes, reload/export/import, private custom label and text rejection.
`COND-04` legacy comma text imports unchanged, custom unknowns retained; ambiguous label not auto-diagnosed; unknown/none/no response distinct; old client compatibility.
`COND-05` selected `clinician_diagnosed` user status is unverified self-report; cannot set internal `clinically_reviewed` without proper source and authority.
`COND-06` account A can't read or mutate account B, encrypted at rest, no plaintext health names in shared metrics, notifications, logs, unrelated gateway, public task/cache.
`COND-07` patch race/stale ETag and retry: no lost user conditions, no lost geneticsSelection/microbiomeFood/medications, no post-revocation stale UI.
`COND-08` select/deactivate/correct a condition: dependent private insights invalidate and review reevaluates; unrelated known labs/food/claims remain.
`COND-09` selection does not auto-diagnose, exclude foods, edit meds, change lab units, override contraindications or train public AI.
`COND-10` no-condition selected and “none reported” are different source states; missing/underreported not assumed healthy.
`INSIGHT-01` only independently reviewed source release can trigger personal relevance; arbitrary news, blog or generated citation insufficient.
`INSIGHT-02` mouse-mechanism *C. immunis* vs human association stays `research_interest`, not proven effective probiotic, supplement or personalized treatment; unknown organism/gene/activity explicitly disclosed.
`INSIGHT-03` relevance from *both* actual authorized records + reported conditions appropriately; false/irrelevant headline blocked; missing source facts abstain.
`INSIGHT-04` supporting/contrary/null studies, effect population and evidence grade independently validated; unsupported claim rejected.
`INSIGHT-05` correct source/consent/catalogue/retraction update invalidates only dependent personal insight and prevents old release rollback resurrecting it.
`INSIGHT-06` duplicate article/claim and frequent user data writes produce at most one relevant in-app item per content/revision/cadence, with mute/dismiss/snooze tested.
`INSIGHT-07` no auto background external model calls, unbounded search, surprise billing, sensitive lock-screen disease notifications or private data leaving permitted boundary.
`INSIGHT-08` provider timeout/OFF, absent clinical review or unlicensed paper still leaves useful standard food/bloodwork functions.
`INSIGHT-09` user controls research-topic preferences, preclinical opt-in, account erasure/export and explicit notification opt-in; after opt-out no new personalized insight.
`INSIGHT-10` blind new-study benchmark: independent reviewer verifies new *useful*, not repeated, defensible one-card relevance with original papers and negative cases; exact model/prompt/source/policy SHA, cost and independent science reviewer status. Mark `ENGINEERING_PASS` separately from `INDEPENDENT_SCIENCE_PASS`, `HOSTED_PASS` and `CONSUMER_APPROVED`.

## 6. Reporting + production boundaries

At each slice Codex reports code SHA, touched files/current source owners, exact tests run and **actual** outcome, `PROVEN / IN FLIGHT / EXPLORATORY` scoped claim, unresolved source/clinical/legal/provider rights, outbound personal/nonpersonal separation, invalidated cache behavior, rights/withdrawal behavior, benchmark comparison and next smallest task in existing development log breadcrumb.

**Not automatically authorized:** public disease-state inference, diagnosis, condition-specific medication advice, broad unverified source subscription, push notifications, medical data to Gemini, live arbitrary article crawling, consuming any data without consent, P3 consumer activation, medical device promises, reconfiguration of paused Render/Mac services, new paid provider, unreviewed clinical taxonomy licence or using a user's condition selection to infer sensitive data for advertising. Handoff and test commits are not feature completion.
