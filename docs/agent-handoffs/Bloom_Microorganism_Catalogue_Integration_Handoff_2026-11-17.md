# Bloom — Your Microbiome × Explore Microorganisms
## Complete Science & Biology, Data, Image Mapping and Codex Integration Handoff

**Version:** 1.0 | **Date:** 17 November 2026 | **Priority:** P0 architecture reuse; staged Core catalogue linkage and Advanced biological content | **To:** Chief Architect & Integration Lead; Codex; AI/ML; Integrations; Security; Legal; User Testing & UX; Visual Design

**Disposition:** APPROVE the two-experience architecture and conservative catalogue-seeding approach for development. Seed data has passed structural automated checks but **has not received species-level taxonomy, biological-claim, copyright/licensing, or deployed application acceptance**. No production activation or clinical inference is authorized by this handoff.

## 1. Binding product outcome

Bloom must maintain two **distinct but bi-directionally linked** experiences:

1. **Your microbiome** (private, account-scoped): The original observations recorded in a person's samples, including source spelling, sample time, method, actual source-provided abundance and units if any, the history of repeated samples, original revisions, and provenance. Missing or qualitative abundance remains **unknown—not zero**. A catalogue article can be reached from each resolvable observation.
2. **Explore microorganisms** (shared scientific reference catalogue): Organisms from reviewed scientific catalogues, even when no sample has reported them. Each article has a domain, verified scientific identity and synonyms when available, conservative ecology, morphology illustration class, research evidence and limitations, organism/pathway/metabolite associations at their **proper scientific scope**, and source citations. A signed-in user's private matching observations may be overlaid after authorization, never persisted in the public catalogue.

**Not detected, not reported, and unmeasured are DIFFERENT.** An Explore entry without a matching personal record must display **“No matching observation in your uploaded reports”**, not “You don't have this organism”. An actual laboratory negative can be displayed only if the assay reports and supports that claim, including coverage/sensitivity.

**Do not build a new parallel report ledger, evidence graph, rights registry, recommendation engine or user analytics service.** Integrate through the existing `Microbiome.tsx`, `MicrobialProfile.tsx`, `OrganismPortrait.tsx`, source/revision contracts and scientific claim/action eligibility services. The catalogue is a reference index, not a replacement for those modules.

## 2. The delivered data package — actual files, not just specifications

| File | Description and limitations |
|---|---|
| `Bloom_Microorganism_Catalogue_Seed_v1.sqlite` | Relational SQLite reference seed with organism search FTS5, organism/research/pathway/metabolite tables, illustration categories, exact source registry crosswalk, and unverified synonym hypotheses |
| `Bloom_Microorganism_Catalogue_Seed_v1.json` | Complete portable seed with the same reference entities and links |
| `Bloom_Microorganism_Catalogue_Organisms_v1.csv` | All organism records and artwork keys |
| `Bloom_Microorganism_Catalogue_Claims_v1.csv` | Explicit carefully bounded and cited research relationships, **pending scientific review** |
| `Bloom_Microorganism_Catalogue_Validation_v1.json` | Automated coverage, constraints and negative/abstention test results |
| `Bloom_Microorganism_Catalogue_Integration_Handoff_2026-11-17.md` | This standalone handoff |

**Seed scope:** 190 records = 94 source-registry reported entries + 96 additional research catalogue candidates. Domain breakdown: 163 bacteria, 4 archaea, 12 eukaryotes, 11 viruses. The 94-entry source registry itself contains **82 bacteria, 5 eukaryotes and 7 viruses**, not 94 bacteria. The database includes all 94 original reported names and exact ordinals in a separate source coverage crosswalk. Those names come from the prior approved cross-agent artwork inventory of `shared/data/biology-content-r4m1-v2.json`, blob `ecb54d3aa4622a1c97bef07b34757693e1a29c47`. This is **not proof of a live authenticated query** to Tester1's current saved account.

**Source fidelity:** For all 94, the mapping stores `abundance_kind=not_supplied` and `reported_abundance=NULL`. The reference fixture is qualitative and cannot establish 0%, absolute count, metabolic flux, live colonization, or a clinical effect. Import actual quantitative observations only from their actual original reports, with methods, units and revision history.

**Scope and maturity:** 190 is an initial expandable catalogue, **not** all known gut microorganisms. The additional 96 are discovery candidates requiring authoritative name/identifier reconciliation before final identity approval. Most records deliberately contain a cautious genus-level ecological orientation and NO claims of experimentally proven species-specific functions. Only 13 specific, cited, provisional research relationship records are currently included. Do not automatically fill every species' function, metabolite or pathway columns with genus assumptions.

## 3. Data model and governance

### 3.1 Shared reference tables (no private health data)

- `organisms`: stable Bloom ID; source/display name; domain; genus; taxonomic rank status; verified NCBI TaxID when present (currently NULL pending authoritative lookup); GTDB lineage when verified (currently NULL); ecology note; observed gut relevance; illustration key and its evidence status; origin and review status; personal-effect eligibility OFF.
- `aliases` and `proposed_equivalences`: true approved aliases may be indexed after authoritative identity review. The five current possible historical/reassigned-name pairs are stored as **requires-taxonomic-review** hypotheses, not silently collapsed records.
- `artworks`: category codes `C01`–`C05`, `F01`–`F02`, `V01`–`V03`, `U00`. `asset_uri` is deliberately NULL in the seed—this dataset **maps** existing illustration families but does not contain or certify actual approved artwork bytes. Codex must map asset IDs to independently rights/science-approved assets.
- `references_registry`: versioned provenance, URL, evidence type, rights note and review status.
- `organism_claims`: organism ID, evidence type/scope, metabolite/pathway relation, citation, limitations, claim review status. **All current records are provisional literature education; `personal_action_eligible=0`.**
- `pathways`, `metabolites`: educational reference concepts only, no measured individual synthesis or rate.
- `organism_search`: FTS5 search index for organism name/genus/ecological note; adapt to existing PostgreSQL/Neon search and access policy rather than embedding SQLite per account.
- `source_report_coverage`: nonprivate **test fixture** crosswalk from the 94 known report names to catalogue IDs. **NOT a production personal-observation table.**

### 3.2 Reuse existing private canonical observations

Do NOT persist user ID, personal abundance, clinical history or sample photo in the shared catalogue. The production join must read the account's original report/observation storage through existing authentication and consent, then project only matched authorized records. Required observed fields include `ownerId`, `sampleId`, `sourceVersion`, `sourceReportedTaxon`, `sourceTaxonId` (nullable), `taxonRank`, `collectionDate`, `assayMethod`, `assayVersion`, `abundanceKind`, `abundanceValue` nullable, `abundanceUnit` nullable, method/limit/quality when supplied, and immutable revision pointers. Keep original provider-reported name and number even if the reference taxonomy updates.

### 3.3 Key matching algorithm

1. Prefer exact stable source TaxID plus reference taxonomy/version, **only when validated**.
2. Else exact normalized scientific name AND compatible domain and taxonomic rank, preserving literal source label and matching review status.
3. Else curated, reviewed synonym/crosswalk with its taxonomic scope and provenance.
4. For species-vs-genus mismatch, possible strain ambiguity, historical reclassification, synthetic/uncertain source names or discordant taxon IDs: return `tentative`/`ambiguous`; preserve the personal source name and offer review/link to broader genus education, never silently equate strains/species.
5. No match: keep a **source-only** personal result with a neutral illustration and source disclosure. Request identity curation in the research backlog; do not drop it.

**Not valid:** fuzzy string matching as automatic identity, discarding `sp.` markers, mapping family to species, conflating NCBI and GTDB IDs, deduplicating taxonomic ranks as independent reads, or claiming current absence from a missing observation.

### 3.4 Linking DTO (illustrative, not new competing platform)

```json
{
  "organismId": "org-akkermansia-muciniphila",
  "displayName": "Akkermansia muciniphila",
  "artworkId": "C03",
  "catalogueScientificStatus": "provisional_editorial",
  "personalMatch": {
    "status": "reported_in_source_registry_only",
    "observations": [],
    "message": "An entry with this name appears in the 94-organism reference fixture; personal account data have not been queried."
  },
  "scientificClaims": [
    {"claimId": "claim-001", "claimClass": "provisional_literature_review", "notMeasuredPersonalEffect": true}
  ]
}
```

This sample must NOT be shown as an actual person's populated record. In production, the UI must use `reported_in_my_sample` only after an authorized, source-faithful join, and show the actual sample/date/abundance if supplied.

### 3.5 Query patterns

**Explore page:** Public catalogue reference query; optionally call a separate **owner-authorized overlay** endpoint to return the matching owned observation count and permitted latest source context. By default, a public search must not be able to infer if any person has a given taxon.

**Personal result:** Account-owned observation → validated catalogue match → education details. Invalid/revoked/corrected source or consent must invalidate overlay/cache promptly, with no stale “present” badge. The same named organism across samples can have different taxonomic certainty and incompatible assays; do not graph raw abundances across methods unless unit and measurement comparability pass.

**History:** List original measures by sample time; present each reported unit/denominator and method. Use charts only for properly comparable units/methods. Keep qualitative categories as qualitative; never map provider labels to invented percentages.

## 4. Artwork system (mandatory carry-forward)

Use the prior 94-mapping category library as the canonical illustration approach:

- `C01`: cocci in chains/pairs
- `C02`: round/oval cocci
- `C03`: short/oval bacterial rods
- `C04`: elongated bacterial rods
- `C05`: branched/irregular bacterial rods
- `F01`: dark yeast-like fungi
- `F02`: filamentous fungi
- `V01`: rigid rod-shaped plant viruses
- `V02`: head-and-tail bacteriophages
- `V03`: enveloped spherical virus
- `U00`: neutral morphology-unverified microorganism, also used for archaea/protozoa unless a distinct scientifically verified archetype is later approved

All 94 source entries inherit their **exact prior illustration code**. Extra catalogue organisms have broadly suggested or neutral provisional codes, requiring targeted morphology review. Never reuse the same image as a unique species micrograph, measured live specimen or proof of organism identity. Include a short “Representative illustration” disclosure. Reuse the approved original SVG/PNG asset registry; do not generate a new image for every species.

## 5. Scientific content and claim eligibility

Each organism profile may display:

1. **Name and identity**: reported historical name, verified accepted name/authority, genus, taxonomy release and source of name where established; do not fabricate TaxIDs.
2. **What researchers know**: ecological habitat and primary traits, with level labelled `genus context`, `species research`, `strain experiment`, `genomic potential`, `in vitro`, `animal`, `human association`, or `human intervention`.
3. **Functions / substrates / cofactors / enzymes**: named typed links only if evidence demonstrates the correct taxon/strain scope.
4. **Metabolites**: `potential_product`, `observed_in_culture`, `metabolomic_association`, `measured_in_sample`, and `measured_in_host` are separate claim categories; none can be inferred from name or abundance alone.
5. **Pathways**: a studied/pathway link means **possible capability**, not measured pathway flux or personal effect. Different strains, culture conditions and food substrates can change expression.
6. **Food connections**: general research may describe substrates; no personalized diet intervention based solely on detection/non-detection. Food suggestions must separately pass Bloom's existing nutrition evidence, allergies, drug restrictions, goals, and action permission checks.
7. **Research and limitations**: cited human/animal/culture/genomic evidence, null/conflicting findings, date, external validity, reviewed and unreviewed statuses, rights, confidence class and abstention.
8. **Source observations**: for the signed-in owner only, actual report name, sample date, method, abundance and original unit, status and history.

**No universal good/bad bacteria label, no disease diagnosis, no automatically inferred enzyme activity, concentration or neurotransmitter production, and no cohort reference “healthy range” without assay-compatible validated population data.**

### 5.1 Seed research examples, scoped

- *Bacteroides thetaiotaomicron* genome research documents complex carbohydrate/glycan utilization potential; source `BACT_GLYCAN`. This cannot prove personal fermentation, enzyme activity or clinical benefit.
- *Faecalibacterium prausnitzii* and *Roseburia* have research linking isolates/genus to butyrate synthesis; sources `BUTYRATE_REVIEW`, `ROSEBURIA_REVIEW`. No user's butyrate level follows from a positive report.
- *Eggerthella lenta*: digoxin transformation requires **specific genes/strains**, so species presence cannot predict drug activity. Source `EGG_DIGOXIN`. No medication advice.
- *Methanobrevibacter* archaea are distinguished from bacteria and have methanogenic potential. Sources `ARCHAEA_REVIEW`, `ARCHAEA_GENOMES`. No personal methane estimate.
- *Desulfovibrio piger* sulfate reduction is a studied pathway; no personal sulfide concentration can be inferred. Source `DESULF_REVIEW`.
- A trial of a specified **pasteurized Akkermansia product** does not establish an effect of simply having *A. muciniphila* reported in stool. Source `AKK_RCT_2026`.

**All cited claim rows in this starter are marked `provisional_literature_review` for independent per-scope scientific acceptance.** Citations are identifiable research leads, not preapproval.

## 6. Authoritative expansion pipeline: make this genuinely comprehensive over time

A comprehensive research catalogue is not hand-authoring thousands of cards. Codex should build a repeatable, controlled import pipeline **into the existing registry and evidence graph**:

1. **Identity authority:** NCBI Taxonomy (scientific names, TaxIDs, synonyms and status, accession relationships) + GTDB lineage/release for microbial genome clades; optional LPSN for names/nomenclature subject to rights. Track different taxonomy release/vocabulary systems separately.
2. **Gut focus:** Human gut taxa from qualified surveys/UHGG/GMrepo or equivalent with cohort/method/source qualifiers. Dataset membership = “studied in gut samples”, not “healthy” or universally prevalent.
3. **Biological pathways/metabolites:** Use vetted source discoveries from MiMeDB, gutMGene, UniProt, MetaCyc/BioCyc, VMH, Reactome (if appropriate) and peer-reviewed papers; preserve experiment taxon/strain, type, substrate, direction, tissue/compartment, outcome and source. Research availability does not equal licensing permission to bulk-copy or redistribute. **KEGG requires explicit separate commercial/service use assessment**.
4. **Evidence curation:** Existing Bloom source/claim lifecycle; store both negative/contradictory and null evidence. Version and review each claim before eligibility is updated. `research_only` is visible as qualified science only when permitted; not actionable automatically.
5. **Editorial generation:** Generate short accurate drafts from retrieved evidence; never produce published species-specific claims with an LLM alone. Escalate high-impact clinical/medication claims to qualified human review.
6. **Quality filters:** Exact identifier matching, genus/species/strain disambiguation, cross-source provenance, population and method; rights/territory; negative controls; withheld unknown.
7. **Refresh:** Incremental periodic authority update with source hashes/version IDs; preserve immutable source observations and historical citations; invalidate changed catalogue match/recommendation projections.
8. **Metrics:** Coverage of real reported taxa, taxonomy resolution rate, fraction with reviewed evidence, claim precision, image-key coverage, number safely abstained, latency, revoked-content propagation, and failure isolation. Avoid “number of cards generated” as quality metric.

### Source register (links, specific roles)

- NCBI Taxonomy: https://www.ncbi.nlm.nih.gov/datasets/taxonomy/
- GTDB: https://gtdb.ecogenomic.org/
- MiMeDB 2.0: https://pmc.ncbi.nlm.nih.gov/articles/PMC12807671/
- gutMGene v2.0: https://pmc.ncbi.nlm.nih.gov/articles/PMC11701569/
- The Microbe Directory: https://pmc.ncbi.nlm.nih.gov/articles/PMC12462379/
- GMrepo: https://pubmed.ncbi.nlm.nih.gov/41277537/
- KEGG licensing: https://kegg.net/en/licensing.html

**Rights:** Source URLs, citation availability and “freely accessible” websites do not automatically confer permission to reproduce the complete data, full text, graphics or commercial redistribution. Legal and Integrations must document terms on the exact acquisitions, APIs, editions and territories. Our seed contains originally written short notes and pointers, not copied bulk third-party entries.

## 7. User experience, without a chatbot

### My Biology → Your Microbiome

- Top section: latest *actual* sample date/provider/method and descriptive observation count; user can switch original reports and see past samples.
- Tabs/filters by reported domain (bacteria, archaea if present, fungi/eukaryotes, viruses), search and actual source-preserved evidence.
- Each reported row: organism reported name, correct shared morphology portrait, source observation type (qualitative / percentage / reads / other), optional real value/units, and “Explore science” link.
- Expanded result: personal source details first, then linked Explore organism article; no abundance fabricated where only qualitative detection exists.
- History: dates with comparable values if supported; explicit method discrepancy and data gaps. No “missing in later sample means extinct” conclusion.

### Explore → Microorganisms

- Search across **all catalogue organisms** regardless of personal report. Filters for bacteria/archaea/eukaryotes/viruses, research topic, substrate, pathway, confidence, and taxonomy status.
- List cards show representative morphology images and a compact specific summary with evidence level.
- Signed-in optional source overlay: “Reported in 2 of your uploaded samples” only after owner-scoped query and accurate source matching. “No matching observation in your uploaded reports” when none; never “Absent”.
- Articles: What it is → ecology → studied mechanisms → metabolites/pathways → research quality and limitations → your personal observations if any, with deep link to sample history.
- Entry not in reference index: render source-only profile, contextual general explanation if verified at appropriate rank, and a request for evidence curation; do not crash or invent a species article.

### Example copy

- “Reported in your 17 April 2025 sample. Your report lists this organism but does not provide a numeric abundance.” **Only when actual owned report has confirmed that date/name.**
- “Some studied strains can produce butyrate in laboratory conditions. Bloom has not measured butyrate production in your body.”
- “This organism appears in scientific literature. It has not been reported in your uploaded samples.”

## 8. Bounded Codex execution plan (not competing roadmap)

**Task CAT-01 — Authority & reconciliation:** Check HEAD, existing registry/renderer, exact current Tester1 sample dataset. Compare all 94 names/order/groups; resolve no missing or duplicate registry rows. Existing organism profiles and user source histories remain untouched.

**Task CAT-02 — Seed importer:** Import this SQLite/JSON as **versioned reference seed** via existing Postgres/Neon conventions, mapping to existing taxon/profile tables rather than duplicating them. Add idempotent version, diff, rollback, source hashes, historical amendments and row-level auth tests. No import to protected user accounts.

**Task CAT-03 — Identity resolver:** Implement exact source-aware taxonomy and alias resolution. Keep proposed equivalent pairs pending; add curated TaxID/accepted-name handling only after real NCBI/GTDB verification. Preserve source original. Test unknown, strain and genus ambiguity.

**Task CAT-04 — Artwork wiring:** Reuse 11 category keys and current `OrganismPortrait` across personal and reference screens. Resolve asset paths to existing approved imagery. Use U00 for no verified mapping; never broken images or species-specific image claims.

**Task CAT-05 — Two-way routes and overlay:** `Your Microbiome` and `Explore microorganisms` share reference IDs but not private storage. Owner-only badge, link to source sample; source-only fallback; privacy-safe search. Source correction/deletion/consent revocation retracts overlays.

**Task CAT-06 — Profile content:** Consume only scientifically reviewed claims for user-facing assertive text; use qualified provisional descriptions where appropriate. Display no pathway/food/health recommendation when not approved. Enable citation and limitations disclosures.

**Task CAT-07 — Progressive sourcing:** NCBI Taxonomy reconciliation and rights-reviewed expansion; MiMeDB/gutMGene pathway association ingest through existing registry. Preserve evidence level and release gates; expand beyond 190 incrementally with exact coverage metrics.

**Task CAT-08 — Release evidence:** Real DB-backed search, details, cross-link, multi-sample history, two-account test, incompatible abundance, source-only and out-of-catalogue cases, accessibility, 320–1440px screenshots, legal reuse register, exact code SHA/test receipts, read-only migration rollback; then independent acceptance through existing integrated RC process. No serial preapproval development block.

## 9. Required QA gates — deterministic and adversarial

- Exactly 94 source rows retained including 82 bacterial, 5 eukaryote and 7 viral; original ordinal/name preserved; all artwork IDs valid; no source abundance synthesized.
- Catalogue includes genuinely unreported organisms; searching them works and never labels them “detected”, “missing”, “deficient” or “absent”.
- Same taxon in two samples: two dated observations, no overwritten source, proper method/units, appropriate history display.
- Relative 1.3% from 16S and 1.3% from shotgun: not automatically a validated unchanged abundance.
- Source says “present” but no abundance: show “reported, no numeric value” and never 0%, average, favorable score or guessed count.
- Mixed genus/species or strain/report synonyms: no silent equivalence; source label intact; review or broader taxon information.
- Phage vs plant-associated virus vs eukaryote vs bacterial species: correct domain; no “bacteria” headings for all.
- Clinical species name in nonclinical report: no infection diagnosis/treatment or urgency inference.
- Pathway linked from strain-specific paper: no extrapolation to all genus members or personal metabolite output.
- Nutritional change suggested based only on a taxon: blocked unless independently approved evidence/action eligibility exists.
- Source correction/deletion, account switch, permission revocation: stale personal badge disappears and cached overlays are scoped to account/source revision.
- Private user information never appears in public catalogue query; no cross-account join or leaked cached overlay.
- Adversarial invalid taxon names, huge inputs, malformed source, fabricated TaxIDs, inconsistent lineage, source outage, missing artwork, missing citations, and SQL injection do not produce unsafe assertions.
- Offline or unavailable taxonomy/evidence services leave the existing food/logging and source-only microbiome view functional.
- Accessibility, text-size, keyboard, color contrast, screen readers, and accurate alternative text for conceptual illustrations.

**Automated seed tests are not a substitute for these production database, source-science, deployment, consent and real-user journeys.**

## 10. Specialist responsibilities and authorization

- **Science & Biology:** Review taxonomy claim scope, actual reference literature, metabolisms/limits, correct nature of organism detection, population/strain generalizability and negative tests.
- **Integrations & Data:** Canonical source ingestion; sample chronology, units, source rank, evidence provenance and NCBI/GTDB crosswalk; licence technical terms and exporter.
- **AI/ML:** Evidence extraction and scientific hypothesis status; strict separation of exploratory relationships and actionable validated rules; never infer metabolic flux from presence.
- **Design & UX / User Testing:** Dual experience discoverability, consistency of shared artwork, source versus literature separation, clear language, no anxiety-inducing “bad bacteria” or false absent state.
- **Security & Privacy:** Owned report isolation, source withdrawal, protected overlays, cache segregation, access control and export/deletion.
- **Legal & Regulatory:** Database/figure licence, nonclinical/educational claims, territory and intended use; existing action policy intact.
- **Chief Architect:** Reconcile against existing v0.6 Core/Advanced work and v0.7 discovery plan; no new roadmap; authorize Codex scoped tasks and record acceptance evidence in existing ledger.
- **Codex:** Implement/test on development branch, no production merge or external personal-data sharing without existing authorization.

## 11. Explicit release / quality position

**Scientifically acceptable for immediate bounded development:** factual names as source **labels**, 94 original artwork-category mappings, neutral unverified microbiology notes, source-faithful private observations and public Explore catalogue separation, search and private owned cross-links.

**Not approved as factually final until reviewed:** taxonomic identities of the 96 additions, proposed old/new taxon equivalences, morphology assignments of extra candidates, and each of the 13 specific biological claims. Some 94 source names are strain labels or ambiguous identities. Any sourced article requires specific scientific QC.

**Not approved:** interpretation of unknown taxa as absent, fabricated abundance, inferred personal metabolite levels or microbial flux, treatment or diagnosis, personalized foods/supplements based only on taxon detection, automatic pooled private health-data model training, or clinical decisions.

**Success criterion:** A user can browse an expanding scientific microorganism catalogue, find entries not reported in their tests, see reviewed organism-level literature appropriately distinguished from personal observations, and move seamlessly between actual source records and matching scientific profiles—without mistaking catalogue presence for detection or research capacity for personal biological activity.