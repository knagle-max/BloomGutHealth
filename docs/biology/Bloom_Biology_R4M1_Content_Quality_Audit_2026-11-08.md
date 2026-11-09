# Bloom R4/M1 — Independent Biology Content Audit and Remediation Package

**Date:** 2026-11-08  
**From:** Nutrition & Biology Specialist  
**To:** Chief Architect & Integration Lead  
**Disposition:** **CHANGES REQUIRED (P0 content quality); authored scientific draft supplied; independent full-release acceptance NOT granted.**  
**Repository source inspected:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience` @ `f5e5068468219e222aa1185578186a8e15f8e471`. Commit message is *Add exhaustive Biology content audit and evidence-linked lab/microbiome profile remediation* but its changed-file list contains **only** `docs/architecture/BLOOM_BIOLOGY_CONTENT_QUALITY_AUDIT_AND_REMEDIATION.md`. This is a requirements commit, **not a content/code repair**. Source inspection is not live-browser acceptance.

## A. Exactly what was audited

| Surface/contract | Verified code finding | Severity | Requirement |
|---|---|---|---|
| `shared/precision-nutrition.ts` `markerDefinitions` | Precisely **14** supported marker IDs (`ldl`, `apob`, `triglycerides`, `hdl`, `alt`, `ast`, `ggt`, `glucose`, `hba1c`, `b12`, `vitamin_d`, `ferritin`, `folate`, `homocysteine`); education predominantly definition/context rather than cause, meaning, discussion | **P0 content deficiency** | BIO-LAB-201–207, LAB-01–06, Architect R4/M1 §2/§6 |
| `client/src/components/LabExplorer.tsx` | Every expanded supported marker shows hardcoded “Interpretation not yet reviewed…” and “Marker-specific reviewed influence evidence is not available here” disclosures | **P0 content dead end** | BIO-LAB-201–207; R4/M1 §1/§6 |
| `shared/functional-microbiome.ts` | Three exact-name research references only: `Ruminococcus bromii`, `Veillonella atypica`, `Odoribacteraceae` | **P0 inadequate registry coverage** | BIO-TAXON-2901–2905, MICRO-06, BIO-FUNC-01–07 |
| `shared/report-explanations.ts` | Existing clinically qualified explanations for multiple taxa, including *Anaerobutyricum hallii*, but not joined to detail | **P0 duplicated/disconnected content** | BIO-TAXON-2901–2905, MICRO-06 |
| `client/src/components/MicrobialProfile.tsx` | Null research match yields “Research explanation not available yet”, generic disclosure wall, and status `reportedTaxonAmount(taxon) · Reported observation` even when the amount is `Not reported`; original source provenance retained | **P0 user-facing misleading/low-value content** | MICRO-06, BIO-FUNC-01–07, R4/M1 §2/§6 |
| `shared/reported-taxa.ts` and `client/src/pages/Microbiome.tsx` | Report/source list and name/method/amount semantics must remain untouched; profile is focus-restoring owned dialog | **Preserve** | MICRO-06 and import/source privacy requirements |

These are confirmed **source-code** deficiencies; full in-browser reproduction, original-report fidelity on the current build, and independent production deployment verification were not performed.

## B. Deliverable: authored content registry and denominator

**Companion artifact:** `bloom_biology_content_coverage_r4m1_2026-11-08.json`.

The registry contains:

1. All **14/14** supported marker IDs with four authored sections: `whatItDoes`, `whyLowHigh`, `whyItMatters`, `whatToDiscuss`. Includes a source URL for each and explicit general-education/clinical boundary. **Scientific copy is a draft, not independently clinically signed off; PubMed/authoritative references have been reviewed at topic level, not all individual sentences at full-study level.**
2. **94** distinct original organism labels from the actual provided seven-page reference-report extraction: **82 provider-labeled bacteria, 7 viruses, 5 eukaryotes**. These are fixture labels, *not* the denominator of all possible runtime organisms or the app's entire taxon fixture corpus.
3. **22** original labels with targeted, differentiated draft organism content (subject to citation/strain audit). **Remaining 72** preserve differentiated genus/organism-group context when available or exactly one precise unresolved-identity explanation. The JSON's `organismsLimitedOrUnresolved` count is **78** because six of the 22 targeted drafts also require material source/identity corrections. Only **16** are tentatively eligible for a more detailed source-review pathway; **zero are declared fully independently approved**.
4. Ranked statuses `reviewed_draft`, `limited`, `unresolved_identity`; original spelling, original position, inferred-for-inventory rank flags, draft matching, source limitations, version and verification notes. The count **must not** be presented as “94 reviewed profiles.”

**Further required inventory:** scan *all* checked-in provider fixtures, sample reports, named research examples, imported-report test fixtures, static pathway aliases and supported source-only laboratory analyte labels at exact RC; deduplicate on original identity + rank + assay/source. The supplied 94-label PDF is a high-value initial fixture but cannot establish the entire application denominator. No real runtime user's reports should be added to public/dev fixture outputs.

## C. Scientific copy policy — authoritative subject-matter recommendation

### Laboratory first layer (14/14 authored draft)

Display roughly **100–170 words**, driven by the actual four-section marker content. The lab result has separate provenance: value + unit + method + source date + original interval + state/flag. Never turn an above/below-report-range flag alone into a disease explanation. For example:

- **HDL-C:** Explain HDL's cholesterol transport; distinguish HDL-C quantity from HDL function; low values correlate with insulin resistance/triglycerides/smoking and do not establish a primary causal target. Very high levels need not be protective. Consider LDL-C/ApoB/non-HDL and overall risk. Do not encourage medication solely to increase HDL.
- **Homocysteine:** Explain methionine/one-carbon metabolism and the roles of B12/folate/B6; kidney function, thyroid, medicines, smoking and other contributors; association with cardiovascular disease is not proof that lowering the number prevents events. No MTHFR-based supplement advice.
- **ALT/AST/GGT:** Specific tissue and interpretation differences, possible hepatobiliary, medicine or muscle/exercise contributions; normal results do not exclude every liver condition. Do not label levels “liver function score.”
- **LDL/ApoB/triglycerides:** Explain distinction between LDL cholesterol, atherogenic particle number and energy-storage lipid; dietary/lifestyle implications are general, not personalized prescriptions.
- **Glucose/HbA1c:** Explain point-in-time vs 2–3 month average and diagnostic limitations under fasting, illness, haemoglobin/red-cell conditions.
- **B12/folate/25-OH vitamin D/ferritin:** Explain status vs intake, assay limitations, iron inflammation confounding and where follow-up biomarkers may help. No deficiency/toxicity diagnosis or automatic dosing.

**Mandatory condition:** Each card's clinical influence/differential wording needs a reviewer mapping of claim to valid human guideline or test reference, plus review of the source's actual specimen type, unit, assay/collection details, age/sex context and jurisdiction. The draft source links are starting references, **not** automatic clinical certification.

### Organism first layer

Use `meetThisOrganism`, `whyResearchersStudyIt`, `foodMetabolicConnections` (roughly **90–160 words** when genuinely supported) and an independent short **Your report** observation. Cite actual experiment/study and explain *in vitro*, animal, human observational or interventional scope. A generic genus explanation may be used only when the rank and taxonomic match are validated; do not transfer genus properties as exact species functions.

**Critical taxonomy correction:** *Anaerobutyricum hallii* is the renamed type species derived from historical *Eubacterium hallii* (type-strain DSM 3353), but the historical *E. hallii* **L2-7** strain was classified separately as *Anaerobutyricum soehngenii*. Some older lactate-cross-feeding studies contain multiple formerly grouped isolates; map findings at the strain actually studied before asserting the result about the present-day species. Key taxonomy: Shetty et al., 2018, PMID **30351260**, DOI **10.1099/ijsem.0.003041**; experimental cross-feeding Duncan et al., 2004, PMID **15466518**, DOI **10.1128/AEM.70.10.5810-5817.2004**. Explicitly *do not* copy metabolic or clinical trial evidence for A. soehngenii to A. hallii without new evidence.

**Other scientific constraints:**
- *Bacteroides fragilis* names/strain tokens do not prove `bft` toxin gene or expression.
- Plant-virus labels do not prove human infection or a specific diet history.
- Food-associated lactobacilli or *Streptococcus thermophilus* can be transient; don't assert colonization or a probiotic benefit.
- Genus/family or `sp.` labels cannot be interpreted as identical to a named species/strain.
- Qualitative reported presence does not establish abundance, microbial activity or metabolite concentration.
- Source taxonomy version, collection date, provider phrase and page/row stay in the detailed report disclosure; don't lead with internals.

## D. Content data contract and UI reconciliation

**One versioned, canonical authored content registry** (no second source-of-truth or duplicated scientific paragraphs):

```
BiologyContentCard {
 contentId, entityKind: 'lab_marker'|'taxon'|'pathway', canonicalIdentity,
 rawNameAliases[], taxonRank?, scientificName?, reviewerState,
 contentVersion, revisedAt,
 firstLayer: { whatItDoes/meetThisOrganism, whyLowHigh/whyResearchersStudyIt,
               whyItMatters/foodMetabolicConnections, whatToDiscuss? },
 evidence[]: { id, title, url, PMID?, DOI?, population, studyDesign,
               claimIds[], contradictoryFindings?, limitation, reviewedAt },
 safety: { noClinicalPrediction, noPersonalMetaboliteInference, prohibitedActions },
 sourceResolution: { matchedRank, aliasVersion, methodConstraints }
}
```

1. Lab Explorer render four substantive sections and real result independently, not hardcoded “not yet reviewed” accordions. Source-only unverified analytes remain raw with concise identity-specific note, no false range or inferred analysis.
2. Microbial profile and list preview derive from same matcher/editorial card. Detail **at least as informative** as list preview. Keep `shared/reported-taxa.ts` data and every original source value immutable.
3. Alias match explicit with taxonomy rank and scope; *E. hallii* alias cannot transfer L2-7 trial findings to *A. hallii*. Unsupported rank/species: limited state, not speculated full profile.
4. Present amount as independent field **only** if amount reported; display exactly one observational sentence when qualitative only, not `Not reported · Reported observation`.
5. One short prominent scientifically meaningful intro; sources, uncertainty, assay metadata, reference/version and conflicting literature in a single deeper disclosure. Avoid repetitive caveats and dead-end PubMed search links as the main “science.”
6. On changes to name/alias/source/review date, invalidate derived cache and fall back to the safe correct rank; preserve dialog focus/owner controls and original source files.

## E. High-priority science QA and tests

**P0 content correctness:** all 14 cards resolve with noncircular `what` + meaningful cause/implication + practical question and human-readable authoritative citations. Each has `reviewerState` with a reviewer name/date/evidence version before production approval. Unsupported marker uses a limited, non-diagnostic source-only view.

**P0 organism coverage:** all known imported fixture labels and checked-in fixture names resolve to a reviewed or limited *differentiated* identity/rank-specific view. A name that genuinely cannot be resolved gets one sentence saying what identity piece is missing; do **not** call it a complete biological profile. No recognized name has a generic placeholder intro.

**P0 consistency:** for *Anaerobutyricum hallii* compare list teaser to detail and historical taxonomy L2-7 counterexample. For `Bacteroides fragilis 638R`, reject inference of toxin production. For `Streptococcus thermophilus LMD-9`, no probiotic-effect assertion. For `Ruminococcus bromii`, studied resistant-starch capacity versus measured individual flux. For plant viruses, correct ecological class.

**P0 measured-data boundaries:** one qualitative organism = reported present with unknown percentage; known numeric percent shown only with source; missing assay/date/unit = unknown; source-only lab not assigned a category. Two accounts/samples must never cross content/data context.

**P0 release tests:** static content lint forbids original generic placeholders on recognized first-layer entities, verifies 14/14 marker cards, verifies original fixture identities, source/alias uniqueness and citation URLs; integration/browser tests cover intro/detail parity, source correction, source date, unit/flag, deep links, focus restoration, keyboard, 320/390/768/1440, 200% zoom and Everyday/Athlete light/dark. All testing must cite exact RC SHA; this specialist did **not** run them.

**P1:** claim-by-claim original-paper review, including null and conflicting results, and genre-specific information quality. Expert reviewer records no citation mismatch, no unsupported high/low clinical generalization, and no species-wide strain extrapolation. Inability to complete review must remain `limited` rather than be represented as `reviewed`.

### Specific citation-verification blockers in supplied drafts

The JSON intentionally marks multiple organism drafts as `limited`, with comments such as **citation mismatch**, **species applicability review**, **species-specific evidence needs review**, **reference only**, or **taxonomy only**. Examples: *Parabacteroides distasonis*, *Odoribacter splanchnicus*, *Bacteroides fragilis*, *Veillonella parvula*. **These are not ready-to-publish evidence cards**, even if their introductory biology is plausible. Codex must not lift their provisional citations as if they substantiate every sentence. Request exact primary papers from Biology before scientific approval.

## F. Owner/Architect implementation sequence and disposition

**APPROVE** replacing generic dead ends with meaningful, correctly sourced scientific content. **REVISE** by introducing one canonical card registry and rank-aware lookup. **REJECT** blanket claim of all taxa individually studied, or 94/94 full biological profiles from this current draft. **DEFER** only unsupported organism- or strain-specific clinical conclusions, not useful lower-rank biological explanations.

1. **Biology (this package):** deliver 14 full lab editorial drafts and fixture identity inventory, plus initial organism evidence cards and explicit incomplete statuses; scientifically review remaining taxonomy/claim edges on a finite registry.
2. **Architect:** consolidate content schema, establish final scoped fixture denominator, require claim-specific reviewer acceptance, assign Codex a bounded P0 implementation based on existing source contracts. Keep v0.5/R4/M1 P0 classification; no speculative v0.6 molecular work.
3. **Codex:** install canonical registry and run entity-aware UI matching; preserve source records and current R4/Brand layout. Remove hardcoded fallback text from supported first layers, add tests/lint and release coverage manifest. Do not automatically promote all drafts to `reviewed`.
4. **Independent testing:** source import/review and profile card consistency on frozen SHA; human novice can identify what it is / why it matters / what this specific record measured; verify counts independently.

**No extra owner decision requested** for authoring/QA. Clinical/legal claims approval and public release remain independent. No repository code was modified by Biology.

## G. Scientific references verified or cross-checked in this review

- MedlinePlus: [HDL](https://medlineplus.gov/hdlthegoodcholesterol.html), [homocysteine](https://medlineplus.gov/lab-tests/homocysteine-test/), [ALT](https://medlineplus.gov/lab-tests/alt-blood-test/), [GGT](https://medlineplus.gov/lab-tests/gamma-glutamyl-transferase-ggt-test/), [vitamin D test](https://medlineplus.gov/lab-tests/vitamin-d-test/).
- NIH ODS: [Vitamin B12 — health professional](https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/).
- Duncan et al., 2004: [Lactate-utilizing bacteria producing butyrate](https://pubmed.ncbi.nlm.nih.gov/15466518/), DOI 10.1128/AEM.70.10.5810-5817.2004.
- Shetty et al., 2018: [Reclassification of *E. hallii* and description of *A. soehngenii*](https://pubmed.ncbi.nlm.nih.gov/30351260/), DOI 10.1099/ijsem.0.003041.
- International consensus on clinical microbiome testing (2025): [PMID 39647502](https://pubmed.ncbi.nlm.nih.gov/39647502/), DOI 10.1016/S2468-1253(24)00311-X.

## H. Conclusion and exact status

**Current observed scientific/editorial defects:** yes — shallow supported lab education, generic LabExplorer disclosures, disconnected microbiome registries and generic MicrobialProfile wall. These are source-established P0 user-facing quality problems, even though no dangerous diagnosis was observed in the specific code paths inspected.

**Content authoring progress in this specialist turn:** 14 lab editorial drafts / 94 original taxon IDs catalogued / 22 targeted organism drafts, with remaining coverage explicitly limited or unresolved; neither final source-to-claim scientific sign-off nor full fixture denominator established. **Coverage status is not a claim that code is fixed.**

**Release recommendation:** **CHANGES REQUIRED** on recognized marker/taxon first-layer experience and exact-RC acceptance. Retain working import/provenance functionality and all existing safety gates; no code change or branch push performed in this review.