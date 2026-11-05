# Bloom — Chief Architect Genetics Personal Relevance decision
**Date:** 2026-11-05
**Status:** APPROVED architectural requirements for v0.5; implementation and independent biological, privacy and usability acceptance are unverified.
**Reviewed specialist handoffs:** `Bloom_User_Testing_Genetics_Personal_Relevance_Ranking_Addendum_2026-11-05.md` (UT-GEN-4213–4220) and `Bloom_Biology_Genetics_Personal_Relevance_Scientific_Review_2026-11-05.md` (BIO-GENREL-01–08). Crosswalk with existing `GENETICS_EXPANSION_ARCHITECT_DECISION_2026-11-04.md`, UT-GEN-4201–4212 and currently reported 17-domain catalogue. Biology conditionally approves with scientific amendments; User Testing proposes acceptance, not performed human testing.

## 1. Binding owner-value and release-scope reconciliation

The Product Owner prefers **55 well-researched genuinely useful interpretations to 150 superficial descriptions**. **55 is an illustrative comparison, not a fixed scientific threshold, v0.5 acceptance minimum or new quota.** Likewise **3–5 top findings is a testable UX design default, not an exact number mandated by the owner**; allow zero, one, two or three if those alone qualify.

Architect decision under delegated scope authority:
- **KEEP in v0.5:** All specifically named Biology §5A candidate entities/types, 17 domains, original-source/29-item import and allele correctness, researched candidate catalogue, full source and educational browsing, source/version/consent controls. Do not silently omit the agreed named inventory or lose source observations.
- **RECLASSIFY the former 150–250 minimum:** aspirational **progressive research-catalogue coverage**, **NOT a v0.5 release-blocking requirement and NOT 150–250 user-specific interpretations**. Record the current count and shortfall transparently and extend with new credible reviewable evidence after higher-value completeness. This expressly supersedes prior lines that say 'no v0.5 closure while the 150–250 target is unmet'. A smaller thoroughly reviewed catalogue is acceptable **only with all explicitly named agreed candidate items retained**, safe empty/review-pending semantics and no false completeness claim.
- **NO interpretation-count quota.** Separate valid observed calls, scientifically reviewed genotype–phenotype educational statements, personally eligible highlights and clinical interventions. Promote an interpretation only after per-claim review and verified compatible genotype. No filler for catalogue targets or headline density.
- A lack of 55 reviewed claims does not fail v0.5 by itself. What matters is accurate source handling, core eligibility, useful exploration and honest reviewed content. This scope shift is an explicit Architect decision, not deletion of the owner's 17-domain/named-variant commitments.

## 2. Architect-approved contracts and mapping

| IDs | Decision and mandatory acceptance | Priority |
|---|---|---|
| BIO-GENREL-01; UT-GEN-4216; GEN-SAFE-01 | **Eligibility BEFORE ranking.** Highlighted personal finding requires real source genotype, compatible variant class and assay, reference build/strand/effect-allele normalization, compatible interpretation, consent, exact reviewed **variant–phenotype** claim, population fit and allowed educational/wellness scope. Missing any => abstain, explain status; no unreviewed personalized highlight. Clinical risk, PGx and sensitive APOE remain separately gated. | P0 |
| BIO-GENREL-02; UT-GEN-4213/4219 | Per-claim evidence state: phenotype/outcome, effect direction, credible size/CI if published, study design/replication, population/ancestry and transportability, LD/independence, contradicted/null studies, date/version and citation. **UNKNOWN not invented**. Count `catalogued`, `measured`, `interpretable`, `reviewed_explanations` and `personal_eligible` separately; education not equivalent to a medical or actionable personal rule. | P0 |
| BIO-GENREL-03; UT-GEN-4214/4215 | Deterministic eligibility filter then **explainable, versioned ordinal relevance ordering** based on effect/evidence credibility, goals and **actual** available lab/food/activity context, incremental interpretive value and user interest. No universal numeric risk/health score, no artificial rarity bonus, and no mandatory lab integration. Default top **0–5** reviewed varied eligible results, usually target 3–5 if enough; no padding. Show `Why this is shown` for each. | P0 prominence; P1 UX |
| BIO-GENREL-04; UT-GEN-4218 | Collapse duplicate/correlated claims into one highlight when independently justified, preserving all raw calls. FADS1 rs174547/rs174550 and FADS2 rs174576 related pathways do **not** imply independent additive risk/effect. APOE isoform requires both defining markers plus consent and validated haplotype method. | P0 scientific truth |
| BIO-GENREL-05/06; UT-GEN-4217 | Link labs and diet for **relevance, not causality**. Measured vitamin D/Lp(a)/ferritin and genotype associations remain distinct; no inferred nutrient deficiency, supplement dose, medical decision or genotype-only diet rule. ACTN3 and related sports markers can educate, not predict personal athletic rank/training style. FOXO3/longevity, MTHFR/COMT/detox not automatic aging/methylation/toxin conclusions. Complete searchable 17-domain explorer and source detail stays accessible without DNA upload. | P0 truth; P1 discoverability |
| BIO-GENREL-07; UT-GEN-4213/4217 | One canonical entity can appear in several domains but counts once. Unmeasured/non-called/unsupported variants are never recorded as reference/normal or personal protection. Show `Measured result`, `Not measured`, `Cannot interpret`, `Research only`, `Review pending` accurately. Do not erase the existing 29 explanations. | P0 |
| BIO-GENREL-08; UT-GEN-4220 | Immediate withdrawal/reorder of cached personalized highlights following source deletion, consent revocation, normalization correction or Biology claim downgrade; preserve versioned controlled audit. No raw genetic data/health outcomes in generic analytics; user controls, optional sort/filter/pin/hide only within consent/safety limits. Real device/participant acceptance separate from unit tests. | P0 privacy; P1 usability |

**Science amendment to UT-GEN-4215:** Approve the *objective* (auditable relevance) but **REVISE the mechanism**: no unsupported additive numeric relevance/risk score. A staged deterministic eligibility gate followed by documented evidence-informed comparison, grouped claims and explained ordering is sufficient. An engineered ordinal comparator must be tested for stability, bias and missingness before claiming validated personal ranking.

## 3. UI target without feature loss

Genetics home: `Relevant findings for you` (0–5 verified claim highlights), each with plain-language evidence/meaning, **Why this is shown**, source/consent confidence and clearly distinct education versus approved action. User has **See all findings**, **Explore genes**, 17 categories, search, source genotype and citations accessible immediately. Default sort `Relevant to me`; alternative evidence/category/gene sorts and explicit pin/hide optional after core. A user with zero source results receives useful general education, not fabricated 'your genes' output. No 17-card wall or scary/composite traffic light.

## 4. Deterministic acceptance (combine Biology 14 fixtures with User Testing 14; no duplicate test infrastructure)

- Dataset 200 catalogue / 70 measured / 55 reviewed explanatory claims / only 3 individually eligible and relevant => highlight **3**, not 5; all counts accurate and independently explainable.
- One common well-supported context-relevant variant above speculative rare candidate; not simply frequency-driven.
- Genotype with no compared study effect allele remains source **measured**, not `outside studied pair`, protected or normal risk.
- Three correlated FADS records at most one default claim absent independently approved effects, all original calls still reviewable.
- APOE one rsID or missing consent => no isoform/highlight; PGx/rare high-risk clinical candidate without assay/clinical approval => not ordinary wellness highlight.
- LPA SNP tag unavailable but actual Lp(a) lab elevated => retain measurement, no reassuring genetic inference. GC variant with missing 25(OH)D => never invent deficiency.
- ACTN3 education only, no sprinter/dosing/recovery prescription; changed goal reorders eligible cards but doesn't alter science or source.
- Retracted/withdrawn Biology claim immediately drops from top; source and audit history survive, public result never stale.
- No genotype upload => no personalized highlights, accessible research explorer remains.
- 320 CSS px/200% zoom/light-dark/keyboard/screen reader => explain top vs complete measured set, navigation/source and focus correct; uncoached users understand 'selected reviewed highlights' != all genome findings. Human User Testing is **NOT RUN** until conducted.
- Cross-account, delete/revoke consent, response cache/analytics => no stale personal insight or genotype leakage.

## 5. Dependency/order and developer handoff

Codex should first inspect latest branch for existing 29-source audit and 17-domain/55-candidate catalogue before new work (a previous developer checkpoint reports 55 **registered candidate records**, **not 55 reviewed interpretations**). Do not rebuild source-normalization or catalogue architecture. Implement/reuse a versioned **claim-level eligibility gate** as the essential P0 missing capability before showing top personal findings. Then implement compact top 0–5 cards and transparent ranking, sourcing only reviewed eligible variant–phenotype claims; unreviewed registered candidates stay in Explore. Add clear counting and source links, LD grouping, consent revocation/caching tests, accessibility and independent reviewer packet.

Existing v0.5 P0 source integrity, privacy and user-facing workflows remain first. The full 17-domain **named** candidate coverage and source correctness remain v0.5 approved; additional low-value catalogue records can accumulate without blocking progress. The research review queue is Biology's authority; Architect approves prioritization and UX release scope; Codex implements tests and logs exact source, CI and hosted SHA; User Testing signs independently. v0.6 may add living evidence updates and richer personalization but **must not create a parallel genetics engine**.

**No false status:** Specialist handoffs do not demonstrate current implementation, scientific validation of individual claims, clinical clearance or tested UX.
