# Bloom — Your Microbiome × Explore Microorganisms: Consolidated Catalogue Architecture

**Owner directive:** November 17, 2026  
**Chief Architect disposition:** APPROVED WITH SCIENTIFIC/RIGHTS AND SOURCE-INTEGRITY GATES; no catalogue public activation or invented biological effects.  
**Owner art amendment:** Every **bacterial catalogue entry** without an adequate match in the existing approved illustration classes receives an **individual requested item in the canonical asset registry** so an original image can be created after identity/morphology review. Avoid duplicate artwork when a shared reviewed form genuinely fits.  
**Source handoff:** [Complete Nutrition & Biology specialist handoff](../agent-handoffs/Bloom_Microorganism_Catalogue_Integration_Handoff_2026-11-17.md), v1.0, Nov 17, 2026, 242 lines; authoritative content and QA gates remain in force.  
**Actual seed:** [Complete 190-entry JSON](../scientific-seeds/Bloom_Microorganism_Catalogue_Seed_v1.json) (reference only, provisional editorial, no personal abundance).  
**Execution authority:** `AGENTS.md` and `NEXT_ACTIONS.md`; Codex implements under `enhance/bloom-experience`. No competing roadmap, production migration, hidden personal-account data requests or new science engine.

## 1. Product decision — two linked but scientifically distinct experiences

**Your Microbiome** is private account-scoped original report data: source spelling, rank, sample and collection time, assay/method/version, source abundance and units if actually provided, report revisions, corrections and source links. `Not reported`, `unmeasured`, `not detected` and `unknown amount` are separate. Missing abundance is **not zero**.

**Explore → Microorganisms** is a shared scientific catalogue of *potentially studied organisms*, including those not reported in any user's tests. An optional owner-authorized overlay joins the current user's actual compatible source observations without storing personal data in public catalogue records. A catalogue entry is not a detection result: use “No matching observation in your uploaded reports”, not “Absent from your gut”.

Maintain bidirectional navigation: personal result → reviewed scientific article; article → actual owner source/report/sample **only if a validated mapping exists**. Exact source name and historical revisions survive taxonomy changes.

**Reuse**, rather than duplicate, `client/src/pages/Microbiome.tsx`, `client/src/components/MicrobialProfile.tsx`, `OrganismPortrait.tsx`, `shared/scientific-visuals.ts`, `shared/data/biology-content-r4m1-v2.json`, canonical sourced observations, scientific claim/action approval and consent. No independent user-report ledger, evidence graph, machine learning system or organism image library.

## 2. Specialist deliverables and measured inventory

The specialist's deliverable describes six artifacts: SQLite relational/search seed, portable JSON, organism CSV, claims CSV, validation JSON, and the original handoff. The **full original handoff and JSON seed are now published in the repository**; SQLite and separate CSV/validation artifacts were **not located as readable separately named source files** in the shared Library during this review. Do not claim they were delivered to Codex or run their unavailable validation suite. The JSON has been independently reconstructed from its complete 5,230 source lines and parsed; the 190 records are real seed *rows*, **not independently authoritative taxonomy approvals**.

- **190 reference organisms**, including **94** source-registry entries and **96** additional Explore candidates.
- Domains per source handoff: **163 bacteria, 4 archaea, 12 eukaryotes, 11 viruses**. The original 94 reference reported names comprise **82 bacteria, 5 eukaryotes and 7 viruses**, *not* 94 bacteria.
- Source registry's 94 original strings and ordinals must remain exact. The 94-item sample mapping is a **nonprivate fixture**, not proof of a currently authenticated personal-account query.
- All 94 seed source abundance kinds explicitly `not_supplied`; original report values must be queried from actual authorized report records, not fabricated from seed.
- **13 cited provisional research relationship rows** are content-review candidates, not authorized specific individual effects. The extra 96 identities, five proposed historical/synonym relationships and provisional morphology need independent reconciliation.

**Seed image mapping audit:**
```text
C01 14  cocci chains/pairs       C02 11  cocci rounded/oval
C03 51  short/oval rods         C04 51  long rods
C05 11  branched/irregular     F01  5  yeast-like
F02  4  filamentous fungi      V01  4  plant/rod viruses
V02  6  phages                 V03  1  enveloped viruses
U00 32  neutral morphology unknown (25 bacteria, 7 other-domain entries)
```
The existing 94-item `microbe-morphology-crosswalk-v1.json` assigns original category IDs and their original assets BVA-0037 through BVA-0047. Those image bytes and verified source hashes **must stay unchanged**. The new 190-item provisional seed should not automatically overwrite the reviewed 94-item mapping. The 25 new art requests below have **not been assigned verified species anatomy**.

## 3. Owner artwork requirement — registered and bounded

**Canonical original art/requirements registry:** `docs/visual-assets/visual-asset-registry.json`. Existing special-purpose morphology delivery registry: `shared/data/scientific-visual-assets.json`; existing crosswalk: `shared/data/microbe-morphology-crosswalk-v1.json`. Runtime uses `shared/scientific-visuals.ts` and `OrganismPortrait.tsx`. Do **not** create a second competing asset registry, hand-edit generated IDs, replace old art or substitute an unauthorized stock/generated image.

**Current finding:** Exactly **25 of the 163 bacterial seed organisms map to neutral `U00`**, indicating no specific bacterial class has been verified in this provisional seed. **A `U00` assignment is not proof that a new biological morphological form exists**, so review each first for reliable morphology and whether existing C01–C05 or an original approved organism art genuinely fits.

**Action completed in architecture/asset documentation:** **25 permanent, individual conditional requested registry entries `BVA-0053…BVA-0077`** were added, one per such bacterial seed entry, with exact organism ID/name, source identity state, reason for review, approval needs, brief, reusable thumbnail/portrait intent, and **truthful** `filePaths=[]`, `sha256=null`, `license=null`. These are requested art production candidates, **not claimed generated images, verified morphologies, or permissions**. If review confirms the existing class is correct, mark that request “resolved by existing asset ID”; do not unnecessarily generate another depiction. If verified anatomy falls genuinely outside all existing approved families, deliver new original art under that organism's reserved ID, review it for taxonomic/morphological truth and rights, register real source/thumbnail/portrait paths and hashes **only after bytes exist**, and wire it to the existing `OrganismPortrait` source method.

**Mandatory expansion rule for every future catalogue addition:**
1. Check exact organism identity, rank, synonyms and published morphology with valid source and proper experimental scope.
2. Check existing original individual art, C01–C05 and any later reviewed families. **If one truly fits, reuse it** without a new art file; keep representative disclosure.
3. If existing classes cannot honestly depict the distinct bacterium, **create a dedicated permanent per-organism `requested` registry entry immediately**, with canonical taxon ID/name, scientific review status, reason for mismatch, a precise art brief, appropriate crop, alt text, placeholders, rights and planned review—not just a developer TODO.
4. Until reviewed/delivered, show existing **U00 neutral morphology-unverified** depiction and explicit disclosure, never a broken URL or fake specific micrograph. A neutral fallback is a functioning UI, **not** fulfillment of the new image request.
5. Asset creation is incremental and truthful. **Do not require one unique image per species** if several can accurately share an approved family. Conversely, do not force unique organisms into a wrong existing class just to avoid creating an asset.
6. Do not duplicate public taxonomy reference and the user's named organism/sources to make an “asset-backed personal” claim. Morphology art is scientifically *representative* and not proof of the patient's species or active organism.

**Initial 25 conditional requests (source catalogue names):**

| Registry ID | Organism |
|---|---|
| BVA-0053 | Amedibacterium intestinale |
| BVA-0054 | Adlercreutzia sp. 8CFCBH1 |
| BVA-0055 | Dysosmobacter welbionis |
| BVA-0056 | Longibaculum sp. KGMB06250 |
| BVA-0057 | Massilistercora timonensis |
| BVA-0058 | Oscillibacter sp. PEA192 |
| BVA-0059 | Gordonibacter urolithinfaciens |
| BVA-0060 | Mogibacterium diversum |
| BVA-0061 | Ruthenibacterium lactatiformans |
| BVA-0062 | Agathobacter rectalis |
| BVA-0063 | Eubacterium rectale |
| BVA-0064 | Mediterraneibacter gnavus |
| BVA-0065 | Butyricicoccus pullicaecorum |
| BVA-0066 | Subdoligranulum variabile |
| BVA-0067 | Dorea longicatena |
| BVA-0068 | Dorea formicigenerans |
| BVA-0069 | Oscillibacter valericigenes |
| BVA-0070 | Phascolarctobacterium succinatutens |
| BVA-0071 | Phascolarctobacterium faecium |
| BVA-0072 | Dialister invisus |
| BVA-0073 | Dialister succinatiphilus |
| BVA-0074 | Sutterella stercoricanis |
| BVA-0075 | Bilophila wadsworthia |
| BVA-0076 | Gordonibacter pamelaeae |
| BVA-0077 | Christensenella massiliensis |

**Note:** Existing source-registry organisms among the 94 have already-approved category links; they are not to be replaced or duplicated. Archaea, nonbacterial eukaryotes and viruses use their own correct taxonomy/representative mapping; this owner instruction particularly requires separate requests for *bacteria* that cannot fit current families. Additional nonbacterial distinct morphology may be requested under ordinary standing art policy following appropriate review.

## 4. Identity resolution and shared source/public separation

- Identity preference: authoritative exact NCBI TaxID with compatible release/domain/rank → exact scientific name plus compatible taxon scope → independently curated synonym/crosswalk → tentative or source-only. Do not auto-promote proposed synonyms, mix species/genus/strain, strip `sp.`, conflate distinct NCBI/GTDB releases or map fuzzy text as proven identity.
- Keep `reported_name`, source sample metadata/units, original source record, assay and revision unchanged in canonical private storage.
- Scientific reference tables contain public names/ecology/evidence only; **never owner ID/abundance/photos**. Personal overlay is calculated from authorized source projections and recomputed on correction, deletion or consent withdrawal; no third-party private data in public FTS/search results, public caches, image key inference or logs.
- Catalogue taxon not reported by a particular source must not be labelled “not detected” without actual assay negative/coverage proof. Use literal “No matching observation in your uploaded reports” in the public article with authenticated overlay or no owner data when logged out.
- Do not join abundance across distinct methods or denominators without verified equivalence. Reference seed's 94 no-abundance fixture never becomes 0%.
- Source-only unknown organism still has a readable personal report view and neutral portrait while identity is under review.

**Integration model** should share one reference organism ID only after validated identity, while personal result keys and source revisions stay account- and report-specific. There must not be an alternate personal presence/absence truth table generated from the catalogue.

## 5. Science content and evidence release eligibility

Profile: verified identity and morphology; concise “What it is”; appropriate ecology; optional sources/limits; links to reviewed pathways, enzymes, substrates, metabolites, food research and individual source observations only within their actual evidence and authorized scopes.

Differentiate evidence: genus context, species, strain, genomic potential, culture observation, animal study, human association and intervention. `potential_product`, `observed_in_culture`, `metabolomic_association`, `measured_in_sample` and `measured_in_host` must not be collapsed. Microbial abundance does **not** imply active metabolite rate, systemic exposure, host outcome or disease diagnosis. Never give a personalized food/supplement suggestion solely because a taxon is present or missing. Food/action recommendations require the preexisting evidence, goal, safety, allergy, consent, source and release gates.

Seed's 13 cited biology relations are provisional; source URLs and free-to-read status do not authorize commercial dataset copying. Integrations/Legal must review exact rights for NCBI, GTDB, LPSN, UHGG/GMrepo, MiMeDB, gutMGene, KEGG and other third-party resources before bulk ingestion or redistribution. The handoff's authoritative scientific source register remains in the original specialist source.

## 6. Codex incremental plan (reuse specialist CAT-01–08)

1. **CAT-01** Audit current source mappings, all 94 original names/order and 190 candidates against current HEAD, repository, actual private-source fixtures where authorized. Do not query personal accounts without authorization.
2. **CAT-02** Use complete JSON as versioned/reference-only seed through existing PostgreSQL/Neon conventions; row-level source-revision, idempotent rollback/diff and no production user-record rewrite. SQLite and CSV sidecars need not be manufactured to start, but if required then source them, verify them, or accurately call them unavailable.
3. **CAT-03** Strict source-aware taxonomy reconciliation, NCBI/GTDB release and ambiguous synonym review, source-only fallback.
4. **CAT-04** Existing `OrganismPortrait` and 11 approved class images reused. Resolve `BVA-0053…0077` through authoritative review, reuse existing if valid, otherwise generate original requested artwork with appropriate science/rights review, preserve U00 until approved. A requested registry item **is not** an actually available image.
5. **CAT-05** Bidirectional private/public links, search, authorized overlay, independent cache, source deletion/revoke retraction.
6. **CAT-06** Reviewed educational content only; provisional claims not elevated to personal effects.
7. **CAT-07** Repeatable staged taxonomy and evidence import/refresh using licensed sources, provenance, scientific abstention and observable coverage metrics.
8. **CAT-08** Real database/search, complex source rank/crosswalk, two-account and revision race, image fallback and real responsive UX acceptance. No main merge or production migration without existing gates.

**Scheduling:** P0 for reuse/source safety, **not** new forced v0.6 Core release blocker. Food #12, Response #15 and current source corrections remain ahead in `NEXT_ACTIONS.md`. Expand the catalogue and request art progressively as existing Explore/Microbiome work is touched; do not launch a speculative full microbiology publishing platform.

## 7. Mandatory QA cases

- 94 original fixture records remain exact (82 bacteria, 5 eukaryote, 7 viruses); 96 additional candidates cannot be silently mislabeled as personal observations.
- 190 seed entries parse/version deterministically; original counts (163 bacterial, 4 archaeal, 12 eukaryotic, 11 viral) and U00 count are reproduced without fabricated TaxIDs.
- Source observation qualitative only → display original qualitative state, unknown numeric abundance. A different valid assay/negative test is never misread as absence from gut.
- Taxonomy strain/species/genus ambiguity retains original source; synonym hypothesis unapproved → tentative, not merged.
- Correctly identify bacteriophage vs plant-like virus vs fungus/eukaryote vs archaeon vs bacterium in filtering and visuals.
- Properly comparable dated observed abundances may graph; incompatible 16S/shotgun values must not be represented as validated longitudinal change.
- Public catalogue search has no private account content; two-account overlay, source correction/deletion, consent withdrawal, account switching and stale in-flight jobs cannot leak or republish data.
- Research strain phenotype/metabolite cannot be attributed to all species/genus and not used to generate personal diet or clinical advice.
- **Image coverage:** every original 94 maps to its existing class or safe U00; all **25 bacterial U00 candidates** appear **once each** in permanent asset registry `BVA-0053..0077`; each is `requested`, with no fake file/rights/hash; independent morphology review either resolves correct existing C01–05 family or creates new scientifically reviewed original asset. Test missing/404/unapproved art → truthful U00 and disclosure, not guessed strain-specific micrograph.
- Future truly out-of-category bacteria automatically flagged/registered in the catalogue ingest+art audit before accepted as visually complete; stable organism identity dedup prevents duplicate requests for name aliases.
- Mobile 320/390 and tablet 768 and desktop 1024/1440, Everyday/Athlete visual modes, keyboard, screen reader, 200% zoom, original art hashes and page-header quality. Existing approved mobile Biology/Microbiome imagery remains; page composition can improve within shared Bloom visual DNA and source fidelity.
- Accurate release accounting distinguishes `SEED_PRESENT`, `TAXON_IDENTITY_REVIEWED`, `CLAIM_REVIEWED`, `ASSET_REQUESTED`, `ASSET_BYTES_DELIVERED`, `SCIENCE_APPROVED`, `ENGINEERING_TESTED`, `HOSTED_VERIFIED`, `PRODUCTION_RELEASED`. “Registry requested” never equals delivered art.

## 8. Acceptance and authority

The owner-requested asset item creation is completed as a **registry-only step**. No new morphology assets were rendered or installed. The source handoff and 190-item JSON have been published as readable original artifacts. This architecture authorizes *bounded development and research curation*, not automated active disease diagnosis, clinical claims, unknown-level data fabrication, rights-unreviewed bulk copying or personal action recommendation.

**Definition of done:** Your Microbiome shows faithful private source evidence, Explore contains broader reviewed scientific organisms and correctly scoped published information, cross-links are source-/taxonomy-validated and privacy-safe, representative art is visually appropriate and truthful, and **every organism whose morphology genuinely lies outside the current approved categories has a tracked requested asset entry** until reviewed artwork is provided.
