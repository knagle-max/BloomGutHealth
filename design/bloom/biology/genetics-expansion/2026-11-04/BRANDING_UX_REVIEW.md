# Branding & UX review — Bloom Genetics Expansion
Date: 2026-11-04 | Status: CONDITIONAL DESIGN APPROVAL — not production approval.

## Documents read
1. Bloom_Biology_Genetics_Catalogue_Audit_and_v06_Expansion_2026-11-04.md (revised v0.5 scope)
2. Bloom_User_Testing_Genetics_Expansion_Cross_Handoff_Review_2026-11-04.md (UT-GEN-4201–4212)

## Direction and priority
Approve a **single, domain-indexed Genetics Explorer inside My Biology**, not another dashboard, and make it optional with consent. Biology's revised direction explicitly places: the existing 29-row audit and false `outside studied pair` fix, single registry architecture, 17 domains, and a 150–250 evidence-curated **v0.5 target** (not a completed count). Do not silently push initial catalogue to v0.6. Preserve Eat–Move–Recover P0 safeguards; Architect must reconcile actual capacity and shortfalls.

## Top-level hierarchy
- Original result / confidence in resolving the call → research explanation → personal relevance only when valid → methods, provenance, source and uncertainty.
- Navigation: My Biology → Genetics → domain → pathway → gene → variant → evidence/source. Global search by gene and rsID; backlinks across multi-domain membership.
- One canonical variant page regardless of where linked; no per-gene dashboard or 17 permanently open panels.
- Distinguish catalogue candidates, source-measured calls, interpretable matches, approved education and approved personal rules. Unverified scope metrics are shown only as *planning figures*, never as real user coverage.
- Consent-sensitive APOE / PGx content is optional and hidden until independently approved permission/assay gates.
- `not_measured`, `no_call`, `ambiguous_orientation`, `unsupported_variant_type`, `conflicting_source_calls`, `measured_but_not_interpretable`, `research_only`, `measured_and_matched` remain distinct behind concise, accessible labels and 'Why?' explanations.

## Critical missing elements and UX risks
1. The actual 29 existing entries and reported false `outside studied pair` warning are **not independently inspected or reproduced** in these source handoffs. Developer must enumerate/reproduce before claims of fix.
2. 150–250 is a curated target, **not** 150–250 approved findings, measured markers, or available personal insights.
3. Basic SNP files do not infer HLA typing, repeat lengths, CNVs, insertions or star-allele haplotypes. An absent allele must not be shown as a normal result.
4. Genotype may be measured while a reviewed phenotype conclusion or diet intervention is absent; preserve this distinction on the first view.
5. Do not call a genotype `outside studied pair` just because the person does not carry a studied effect allele; only validated incompatible calls merit a reason.
6. Preserve ancestry-specific evidence, population, study design, build, allele orientation, indel representation, source rows and correction history in progressive disclosure.
7. Overlay of research content cannot require uploading DNA, and withdrawal of consent prevents personal interpretation across linked screens.
8. No fitness/strength prophecy from ACTN3, supplement prescription from BCMO1/FADS or PGx medication dosing from incomplete allele/haplotype input.

## Branding acceptance
Existing Bloom evergreen, sage, ivory, Georgia editorial headings; neutral state colour; no red/green DNA health grades. Full keyboard focus, 320px and 200% zoom and screen-reader rationale need *real runtime testing*. Gene-only exploratory nodes must never inflate count of variants personally measured.

## Delivered
- `prototype.html` self-contained responsive interactive UX with all 17 domains, search, state switching, source fallback and sensitive-content disclosure.
- `COMPONENT_CONTRACTS.json` typed presentation boundaries for developers.
- `ACCEPTANCE.md` runnable user-script plan (not results).
- `ARCHITECT_PICKUP.md` v0.5 scope and release gate reconciliation.

## Signoff
Branding direction conditional only. No actual import, complete 29-row catalogue audit, source matcher validation, evidence approval, clinical/legal sensitivity approval, data security sign-off, real participant usability or deployed integration was performed here.
