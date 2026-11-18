# Bloom — Bloodwork Marker Meaning, Trend Clarity and Report-Wide Laboratory Context
**Chief Architect scoped Codex implementation handoff · Owner corrections Nov 17, 2026**
**Status:** Approved targeted defect/consumer-content correction, NOT yet implemented or medically independently reviewed.
**Implementation authority:** Codex on `enhance/bloom-experience`; `AGENTS.md` and active `NEXT_ACTIONS.md` remain task selectors. Do not launch a Bloodwork redesign or unrelated migration. No routine before/after screenshots, per latest owner instructions.

## 1. User-visible failures (binding source feedback)

**Failure A — misleading information hierarchy.** On the lymphocytes absolute result, "Why does it matter?" presently says:
> Absolute and percentage results are separate measurements. A percentage can change when other white-cell populations change, even if this absolute count stays similar.

This describes **how to compare reported metrics**, NOT why lymphocytes matter to human health. The user asks for biological relevance, not report formatting. Equivalent templates appear on multiple cell differential markers and measurement-centric text appears on other markers.

**Failure B — verbose and often unhelpful comparability messaging.** The app says:
> A comparable dated difference is unavailable; review the recorded laboratory, method, units and collection context.
> Measurement comparability is unverified. The laboratory is not recorded for every result. The method is not recorded for every result. The recorded fasting context differs between results. Recorded points do not establish clinical significance. A trend does not establish a dietary cause. No clinical urgency or treatment target is inferred.

This conflates arithmetic difference, analyte validity, assay/clinical interpretability, causal inference and unrelated laboratory administration. It repeats warnings, does not identify a fixable next step and gives no direct action to correct shared laboratory identity.

**Failure C — no discoverable bulk laboratory workflow.** User says the *same laboratory performed all tests*. Bloom already has source-grouped report metadata, but "Saved laboratory sources" management is hidden in a detail disclosure and editing has confusing "laboratory & reference ranges" language. They need **an obvious place to assign the performing laboratory to an entire actual report group and, optionally, select several distinct reports and confirm the same laboratory once for each**; not repetitive marker-by-marker edits, and not fabricating common source groupings.

## 2. Verified current repo integration (read-only audit; Codex recheck HEAD)

- `shared/additional-lab-markers.ts`, **35 editorial profiles** with `firstLayer.whatItDoes`, `whyLowHigh`, `whyItMatters`, `whatToDiscuss`; expanded marker versions are `developer_draft_not_independently_reviewed`. Lymphocytes absolute, neutrophils absolute and monocytes absolute have an **identical** absolute-versus-percentage `whyItMatters` template; corresponding percentage markers also have duplicate metric-identity explanations. **14 of 35** `whyItMatters` snippets contain measurement/technical identity language worth manual review. This is a text-pattern screen, not proof all 14 must be changed or that other 21 are high quality.
- `shared/data/biology-content-r4m1-v2.json` is the original **canonical lab editorial content**; `shared/biology-registry.ts` assembles original entries + `additionalLabProfiles`; `shared/biology-labs.ts` exposes editorial projections. **Review all original and additional marker profiles**, not just the expanded list. Preserve original vetted source bytes where applicable; add an additive versioned reviewed overlay/correction with clear source/review status if original immutable assets must remain unchanged. Don't gratuitously rewrite protected original registry.
- `client/src/components/LabMarkerEducation.tsx` displays `whyItMatters` in the "Why does it matter?" area. Fix the source editorial content/semantics rather than hiding the component or injecting lymphocyte-specific UI hacks.
- `shared/lab-comparability.ts` returns a strict boolean and all applicable reasons, currently demands every point's `laboratory` and `method` nonempty, matching units, and flags **any** changed fasting status for **all markers**. Unknown fasting is separately specifically checked for glucose/triglycerides. This explains long warning lists and unnecessary blocking.
- `client/src/components/LabTrend.tsx` builds the generic "A comparable dated difference is unavailable" text around line 121, evaluates `assessLabComparability` around line 125, displays every reason in a list and appends the repeated `A trend does not establish a dietary cause. No clinical urgency or treatment target is inferred.` to limitations. It also shows a long "About this measurement" block. Adjust projection/UX, not original lab facts. `shared/lab-display-segments.ts` and `shared/lab-history.ts` own time/plot and original observation distinctions.
- `shared/lab-report-metadata.ts` already defines an **encrypted, versioned, account-scoped report metadata annotation** distinct from original lab results, including performing laboratory, province/location and source revision; group `scope: "report" | "result"`. `client/src/components/LabReportManager.tsx` already has `POST /api/precision/labs/sources/:id/metadata`, idempotency, concurrent-change rejection, confirmed user assertion and historical revisions. `client/src/components/LabSourceManagement.tsx` currently buries the entry under `<details><summary>Manage N saved laboratory sources</summary>`. `LabReportOverlayControls.tsx` links to manager from a tertiary section, and a per-point `LabTrend.tsx` link says "Manage report and reference sources". A source-group control exists; there is **no verified easy selection across multiple independent report groups**.
- `shared/lab-provider-ranges.ts` owns external published reference-range eligibility. **Confirming that a report was performed at LifeLabs/Dynacare/other does NOT confirm analytical method, reference range, exact lab site, province or assay conditions**, so don't activate reference overlays or clinical conclusions based solely on a user-selected laboratory name.
- Chart and source histories are currently original-source-first. The user's confirmed report-level performing laboratory should be projected into the **effective comparability context** where its report group/source revision covers the observations, *without overwriting the original imported laboratory string or blindly carrying to a different independent report*.
- No inference of a common report from same date/name alone. Report-level scope is only what the existing source ingestion/identity grouping can prove. Multiple separate reports must require explicit review/selection before any common-user assertion.

## 3. Revised marker semantics — reusable, non-patronizing, actually useful

**Each marker content contract:**
1. **What is it?** In 1–2 sentences: underlying biological analyte/cell/protein and role, followed by what the measurement measures only if needed.
2. **Why does it matter?** In 1–3 concise sentences: **what this biological process contributes to health, what an unusually low/high marker may help reveal or signal (qualified), and why it matters in practical terms**. The description must answer "Why should I care?" without diagnosing a user, suggesting a target or claiming the marker's mere measurement changes health.
3. **How to interpret your measurement** (Level 2): absolute vs percent, sample/assay differences, reference interval, timing/fasting or confounders **only when actually relevant** to this marker and decision.
4. **Scientific details** (Level 3): source, measured identity, pathway/cell subsets, original lab/protocol, evidence, caveats. Preserve all provenance, citations and historically saved raw facts.

**Candidate replacement — LYMPHOCYTES ABSOLUTE** (requires existing Science/clinical content review before production):
- `whatItDoes`: "Lymphocytes are white blood cells that support immune defense. T cells help coordinate responses and act against infected cells, B cells help produce antibodies, and natural killer cells respond to infected or abnormal cells. The absolute test measures their number in a volume of blood."
- `whyItMatters`: "Lymphocytes are important for recognizing infections, building immune memory and responding to abnormal cells. A persistently low or unusually high count can help clinicians investigate immune changes, infections, medicines or blood disorders, but the count alone cannot identify the cause or show how well the immune system functions."
- `measurementNotes` (secondary): "Absolute counts and percentages answer different questions. The percentage can change when another white-cell population changes, even if your absolute lymphocyte count is similar."
- `whatToDiscuss`: "Review the complete blood count, related cell types, medicines, symptoms and whether changes persist across appropriate repeat tests."
**LYMPHOCYTES PERCENT:** Same biological relevance, but explain below the fold that the **absolute count usually gives a more direct cell-number perspective**, and a percentage can change due to shifts in other white-cell groups; do not convert percent into count without matching WBC context.

**Other exact targets for audit**: neutrophils, monocytes, eosinophils, basophils (absolute and %), platelet count and MPV, RDW-CV/SD, total WBC, hemoglobin, hematocrit, ferritin/iron panel, kidney tests, liver enzymes, lipids including total and non-HDL, HbA1c, testosterone and PSA. Some original entries already give meaningful biological context; **don't rewrite acceptable medical text just to create a new deliverable**. Technical identity distinctions are important and remain in the secondary “How this is measured/interpreted” context rather than replacing relevance.
- E.g. **Neutrophils:** first-line defense particularly against bacterial/fungal infections; absolute changes can matter to infection-risk evaluation in context.
- **Monocytes:** immune surveillance, inflammatory response and tissue cleanup; interpret alongside WBC/differential and symptoms, not an inflammatory diagnosis.
- **RDW:** variation in red-cell sizes can help characterize anemia-related or marrow/production patterns alongside other red-cell measures; preserve separate RDW-CV/SD measurement semantics.
- **PSA:** relevant to assessing prostate-related conditions with clinician context and screening tradeoffs; do not present assay-only duplication as why it matters or call it a cancer diagnosis.
- **Total cholesterol:** contributes to cardiovascular risk assessment alongside LDL/non-HDL and other risk factors, but isn't an isolated treatment target.

**Audit deliverable:** Each marker ID should get an outcome `ACCEPT_AS_IS`, `REVISE_MEANING`, `MOVE_METHOD_TO_SECONDARY`, `SOURCE_REVIEW_REQUIRED`; include source/review status and a concise coverage receipt. Implement approved content revisions in canonical versioned source/projections and add tests preventing a `whyItMatters` section consisting only of metric comparisons, a generic "review with clinician", sample logistics or repeated disclaimer. Do not use an LLM to autonomously invent medical implications or fabricate new citations. No need for a new copywriting engine.

## 4. Trend UX — separate observable numeric change from interpretation confidence

**Do not block basic arithmetic comparison simply because a laboratory or method name is missing**, when the *actual marker identity* is sufficiently established, valid dates differ and units are correctly comparable with established conversion. A recorded difference is a mathematical observation, **not an approved clinical interpretation**, and may be shown with a short qualifier where needed:
- **Numerically comparable source values:** e.g. "Your recorded lymphocyte count changed from 1.6 to 1.4 ×10⁹/L between [actual dates]." If method metadata are missing, add one concise context note: "Testing methods weren't recorded, so a clinical interpretation of this change is uncertain." The actual assay identity, source unit conversion and correct value/date remain necessary; **don't create deltas across incompatible assays, analytes, mixed fractions or invalid units**.
- **Difference cannot responsibly be calculated:** "These results can't be compared as the same test because [single most important specific mismatch]." Show direct actionable link to source review. Never fabricate comparability.
- **Source-limited trend:** show dated original points and their values, with the explanatory note accessible and no default wall of warnings.
- **Context-dependent marker:** fasting relevance is per marker and protocol, not a global veto. A different fasting status for CBC lymphocytes is generally not a meaningful barrier to arithmetic comparison; glucose/triglycerides often need fasting or collection context to interpret the biological difference. No uncontrolled broad generalization.
- **Clinical assessment:** separately states "A change does not by itself establish disease progression or improvement" only where necessary to prevent a materially misleading action; avoid universal standalone dietary-causality/urgency warnings on every trend.

**Architectural contract:** Replace one Boolean `comparable` used for everything with distinct downstream projections (not necessarily a new database):
```ts
type TrendEligibility = {
  numericallyComparable: boolean;  // analyte identity, valid distinct dates and compatible units
  interpretationConfidence: "adequate-source-context" | "limited-context" | "not-assessable";
  specificReasons: readonly string[]; // sorted by material effect for this marker
  repairAction?: { label: string; route: string; sourceIds: string[] };
};
```
Illustrative interface only; adapt existing `lab-comparability`, `lab-display-segments`, `LabTrend` and evidence/claim source status. **Retain existing conservative clinical/reference eligibility** in any pathway where source method/assay is truly mandatory. A lighter *observed numeric change* must not become a clinical target, validated trend or causal result.

**Copy acceptance:**
- No default combination of "comparable dated difference unavailable" + laundry list of unknown lab/method/fasting + universal scientific disclaimers.
- One primary useful result, one succinct meaningful caveat if needed, **one actionable fix**.
- Full reason codes and original data remain in a source/measurement details disclosure for those who want them.
- When no action is possible, simply state the limitation once.

## 5. Laboratory identity workflow — easy scope selection and reuse, without falsifying source

**Make a prominent link/action in the Bloodwork results/history context:** **"Set laboratory for these reports"** (or similarly obvious wording). Show current effective performing laboratory and what is missing. Don't bury it under reference-range controls or a collapsed list of saved sources.

**Single report:** "This laboratory report contains N results from [actual report identity/date]. Which laboratory performed these tests?" One selection (LifeLabs / Dynacare / Other / Don't know, plus jurisdiction if genuinely needed) applies as a **user-confirmed source annotation** to that verified report group. Preview "Applies to these N results", with names/count and no overwrite of per-result original text. After save, related marker views reflect the *confirmed report-level laboratory identity* where source grouping and revision are valid; edit/revoke remains available.

**Same lab across multiple distinct reports:** Allow user to **select verified report groups** and choose **"Apply this laboratory to selected reports"** with visible count and dates. Confirm each group explicitly (or one confirmation whose preview names every selected report). Reuse existing report-metadata command and source revision/idempotency safety; if multiple calls, accurately report partial success and allow safe retry. Never blindly assert all historical reports had the same provider, or infer same provider by date, geographic location, a name substring or user Profile address. Exclude sources no longer owned/current, and distinguish individual `scope:result` from verified `scope:report`.
 
**Source safety:** Original imported report laboratory text remains frozen; account-owned annotations have independent current/history revisions, provenance, method and patient data protections. If source correction/reimport changes grouping, existing annotation must be revalidated and stale derived comparisons invalidated. Never set assay method, specimen, fasting status, reference interval, testing province, collection date or sex category to a new value merely because lab/provider was set. Treat regional labs and umbrella brands as real source identity distinctions where clinically material.

**Important existing gap to fix:** `LabReportManager.tsx` already writes a user-confirmed group identity, **but `LabTrend.tsx` and `assessLabComparability` still use per-point `laboratory` fields for strict comparisons**. Ensure a current source-matched group assertion is projected as *effective lab identity for relevant comparison UX*, with original point data available separately and no report-group bleed. **Do not simply rewrite imported `point.laboratory` for every record**. If user confirms different labs for selected reports, confidence reflects that. Do not treat shared lab identity as proof of the same assay method or that fasting is irrelevant.

**Save UX:** Save action clear, no required re-entry of barcode-like identifiers/report timestamps, visible confirmation once, easy undo/change and account-private history; source differences/unknowns truthful. Keep source-managed published-reference selection separate from "Which lab performed my test?" because their scientific claims differ.

## 6. Required acceptance tests and evidence

- `BLOOD-MEAN-01` Lymphocytes absolute `whyItMatters` describes T/B/NK biological role and plausible clinical relevance; absolute-vs-percent note exists under secondary measurement guidance only. Percent view likewise biological first, no inferred immune competence.
- `BLOOD-MEAN-02` Full canonical+extended marker editorial catalogue audited by ID and human review status; identical neutrophil/monocyte/lymphocyte templates corrected contextually, original already-good biology preserved; no technical measurement-only default.
- `BLOOD-MEAN-03` Original citations/provenance/review state retained; no fabricated health claims or automatic blanket "abnormal/diagnosis" language.
- `BLOOD-TREND-01` Same marker, two dated measurements, compatible verified units, unknown laboratory/method → actual numerical change available as a source-limited observation, with one simple caveat; no invented clinical meaning.
- `BLOOD-TREND-02` Different assay fractions, unconvertible units, duplicate timestamps, ambiguous lab identity or actual incompatible assays never promoted into validated clinical comparison; preserve separate visible values.
- `BLOOD-TREND-03` Changed fasting status does **not** veto CBC lymphocyte numerical comparison; glucose/triglyceride relevance assessed by marker-specific assay/context; no blanket fasting warning for everything.
- `BLOOD-TREND-04` Default trend text shows useful numeric facts and at most one material caveat/action; detailed reasons accessible in context, without repeated generic disclaimers.
- `BLOOD-LAB-01` From Bloodwork results see "Set laboratory" without navigating through hidden source management; select actual report group → one save → every relevant marker view reflects source-current lab identity.
- `BLOOD-LAB-02` Select 3 distinct actual report groups sharing LifeLabs, preview group identities/dates, apply one user-confirmed assertion to each, reload and verify persistence/source revisions and edit/revoke.
- `BLOOD-LAB-03` Mixed-source reports, different provider, deleted group, stale reimport or missing grouping → no cross-application/fabricated report merge or stale comparison, clear selective fallback.
- `BLOOD-LAB-04` Confirming one lab never fills unknown methods, fasting, assay identity, reference ranges or unreported collection locations; original lab strings and flags remain intact and can be inspected.
- `BLOOD-LAB-05` Multi-source bulk action retries after partial provider/API failure cannot duplicate annotations or silently mark failed groups as saved; revision/actor account isolation and safe logout work.
- `BLOOD-LAB-06` Two accounts, differing report groups/dates and source corrections cannot leak lab identity or derived trend status into another user; account deletion/consent revoke retract dependent projections.
- `BLOOD-UX-01` Concise ordinary-user first-screen explanation, meaningful next action, report laboratory entry discoverability, keyboard/zoom/mobile/desktop checks. **No mandatory before-and-after screenshots** in accordance with owner instruction.
- `BLOOD-UX-02` Existing latest value/trend/chart, reference interval, source history, lab correction, report manager and relevant scientific depth all still work; no destructive source rewrite.

**Reporting:** `SPECIFIED`, `SOURCE_EDITED`, `ENGINEERING_TESTED`, `USER_FLOW_VERIFIED`, `HOSTED_VERIFIED`, `SCIENCE_REVIEWED` (independently) with concise text, exact SHA and gaps. Owner doesn't require screenshots. Work within the one `NEXT_ACTIONS.md` execution queue, prioritizing this as a meaningful Bloodwork content+UX correctness defect when touched, without displacing active v0.6 supplement intake / Food #12 / Response #15 work.

**Definition of done:** "Why does it matter?" answers the biological/clinical **why** for every marker; trend summaries provide the recorded facts and just the material limitations; a user whose reports share one lab can confirm it for selected report groups once, and Bloom's presentation reflects the confirmation without falsifying original measurements or overclaiming clinical comparability.
