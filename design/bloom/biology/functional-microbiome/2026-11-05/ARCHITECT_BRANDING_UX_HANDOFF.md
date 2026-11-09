# Bloom — Functional Microbiome Profiles & Ecosystem Intelligence
**Date:** 2026-11-05 | **Specialist:** Branding & UX | **Disposition:** APPROVE WITH CONCRETE COMPOSITION REVISIONS | **Recipient:** Chief Architect
**Crosswalk:** BIO-FUNC-01–07, UT-FUNC-4601–4612, BIO-TAXON-2901–2905, MICRO-06, MKT-TAXON-3001–3007, existing Science Explorer and Viome PDF/import and report-food opt-in contracts.

## A. Items reviewed / actual implementation
- Biology Nov 5 Functional Microbiome Profile & Ecosystem Synthesis handoff and User Testing Nov 5 Functional Microbiome Ecosystem Intelligence review.
- Current development head at inspection: `c305ed09a106cbc151a28bb46177ee864ff609dc`. `client/src/pages/Microbiome.tsx` already loads report samples, reported taxa, search, comparison and a detail sheet. `client/src/components/MicrobialProfile.tsx` has long source-observation data list followed by `What this organism is` and five scientific disclosure sections. `OrganismPortrait.tsx` provides art and neutral fallback. These are **implemented structural elements**, not full ecosystem intelligence or real-device acceptance.
- The profile currently leads with 10+ source/method/ID fields above the organism's basic meaning. This is a specific source-observed **hierarchy defect**. Preserve the data, move to source detail.
- No functional-group membership/ranking or reviewed ecosystem interaction layer has been verified live from this inspection. Do not equate existing organism-profile UI with BIO-FUNC completion.
- Biology source states qualitative Viome 94 taxa, categorical 22 provider assessments, 299 food recommendations. This is source-derived, not a measured abundance/activity profile. Prior conflicting 371-food extraction remains a source-document/version issue; **not relevant to displaying a functional potential group** unless resolved.

## B. UX decision
**Approve functional-group-first discovery** as a subview within existing Gut Reports / Microbiome, NOT a new home dashboard or new top-level navigation. Three levels:
1. Report landing: concise summary `Organisms listed in your report`; small `Explore what researchers know` entry.
2. Functional exploration: 3–5 reviewed groups **only if available**, as compact selectable rows: `Short-chain fatty acids`, `Fibre and complex carbohydrates`, `Mucus-associated biology`, `Bile acid processing`, `Other researched roles`. These are illustrative labels, not required group counts. Offer `See all organisms` and search. Do not invent personal scores or sort by qualitative abundance.
3. Organism detail **reorder existing component**: portrait + plain-language role (1–2 sentences) → small source status `Listed in your report` / `Research only` → 1–3 reviewed research roles → optional substrate/pathway interaction → `What your report shows` → `Studies & methods` / `Original report` in expandable disclosure.
Avoid another hero banner, repeated caution paragraphs, full scientific glossary and technical provenance blocks above the main content.

## C. Exact-screen implementation instructions
### Microbiome.tsx report landing
Keep source sample/date selection, existing organism list, comparison/history and import review. Default report view should start `Your gut report` + summary of *actual data type* and a compact 3-way switch `Overview` / `Organisms` / `Report details` (or reuse existing equivalent tabs, no duplicates). Place optional `Explore functions` within Organisms or Overview once content exists; NOT another always-expanded card. Use actual source info only: `94 organisms listed` if this report really has 94; not `94 active functions`. Show plain `Your report lists organisms; it doesn't tell us how much butyrate they produce.` **once** where relevant, not on every organism row.
### Functional groups
Groups are **research lenses**, not new assay results. Say `Organisms studied for these roles` rather than `Your active pathways`. A group row shows: group name, reported organism count supported by *actual* source join, succinct caveat `Studied in some strains` only if appropriate, and chevron. Without reviewed members, no fabricated count; show `Research being reviewed` and direct to observed organisms. A taxon may appear in multiple groups, source count unique; no good/bad grading.
### MicrobialProfile.tsx
Use existing Dialog sheet and focus return. **First viewport**: name, verified appropriate illustration/neutral symbol, 1–2 sentence reviewed research introduction and compact `Reported in your sample` if actual observation. If research is unreviewed, show identity and `Research explanation not available yet`, **no fabricated capability**. Move `Source-reported amount`, taxonomic resolution, report/sample IDs, QC, source paths, data origin and assay technical terms into a **single** `About your report` disclosure; retain original report date and source directly accessible. Maintain visible short crucial caveat `This report doesn't measure this function` when research content is prominent. Never show `0%` for qualitative unlisted organism.
### Mechanism/interaction view
Only show a specific cross-feeding diagram when each edge has reviewed evidence. For example Bifidobacterium → acetate/lactate → Anaerostipes is a **studied potential**, never proof of interaction in the user's colon. Two distinct source links, appropriate study model and compartment. Ensure diagram has identical text-only sequence for screen readers and works at 320px/200% zoom.
### Diet/food views
Distinguish culture-substrate experiments from human diet interventions and Viome vendor food recommendations. A `Microbiome report match` badge only on an opted-in, actual influential food recommendation. Functional group research alone cannot promote foods in meal suggestions. User diet exclusions always take precedence. No `improves butyrate` user promise based on organism listing.
### Scientific artwork
Retain neutral organism symbol until Biology identity, Legal licensing, Security SVG scan and UX actual device tests pass exact final file gate. Illustrations should read as *representative*, not individual sample microscopy. Do not add complex decorative ecosystem artwork to default landing.

## D. Copy and safety, without disclaimer overload
| Default | On expand |
|---|---|
| `Studied for butyrate production` | Which strains, model, outcomes, contrasting evidence and literature sources |
| `Reported in your sample` | Exact taxon label, assay, specimen, collection/report date and source row |
| `Research shows some strains can use lactate` | Source-linked reaction evidence and whether co-culture directly tested |
| `This report doesn't measure butyrate production` | Missing expression, metabolite and quantitative method details |
| `Not listed in this report` | Source detection limits; not equivalent to biological absence |
| `Research explanation not available` | Reviewed catalogue status, never invented claims |

One short critical distinction on the screen is enough when the same caveat applies to all the card's research roles. Long technical methods belong in the report drawer. **Scientific accuracy is mandatory; repetitive disclaimers are not.**

## E. Acceptance tests (all NOT_RUN)
1. User opens observed *F. prausnitzii*: name and meaning before source metadata, source and report remains reachable in ≤2 deliberate interactions; no personal butyrate output asserted.
2. *Dysosmobacter welbionis*: myo-inositol research separated from measured personal pathway activity and no diet prescription.
3. B. fragilis suffix displayed verbatim; no ETBF/toxin implication.
4. Cross-feeding two edges individually cited; user can explain it was not observed personally.
5. Viome `Attention` category presented as provider rating, not metabolite concentration.
6. Functional groups compact, not an equally prominent carousel of cards; see all and search remain accessible.
7. Plant virus/fungal names not used as a personal diet quality or diagnosis.
8. Report with no reviewed claims displays source organisms and identity without invented functions.
9. Same organism in two groups retains one canonical profile and one actual source observation.
10. Source correction/withdrawal changes research highlights without modifying original organism call.
11. Opt-out food influence does not hide source biology/food history; no food allergy from report Avoid.
12. No scientific portrait passes final asset gate automatically; neutral fallback works.
13. 320px/200%, keyboard, VoiceOver/iPhone Safari, light/dark and image-error screenshots from exact SHA; no misleading personal biological conclusions in uncoached teach-back.
14. No new main navigation route, independent scoring engine or duplicated microbial data store.

## F. Priority, ownership and Architect pickup
**P0 v0.5:** reorder currently source-heavy organism sheet; retain honest type/limitations and source accessibility; source-genotype/category boundaries; protect navigation and factual observations; privacy and evidence gates.
**P1 v0.5:** functional-group discovery and accessible potential-cross-feeding illustrations when per-edge claims have review approval, with no quota; use existing source/registry. No need to delay core food logging for research illustrations.
**v0.6:** reviewed evidence coverage growth and advanced ecosystem hypotheses; quantitative flux/clinical advice remain externally gated.

**Owner decision:** None. **Handoff:** Architect should combine this with BIO-FUNC/UT-FUNC and current Microbiome source routes, authorize a small targeted composition slice first, then evidence-backed groups without a separate app surface. Codex receives the consolidated task via Architect. Branding signoff is for proposed interaction/copy only, not live visual acceptance, science certification, Legal rights or participant testing.
