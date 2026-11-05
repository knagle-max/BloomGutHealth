# Genetics personal relevance — Branding & UX exact-source review
November 5, 2026 | **Conditional approval of UX direction, not shipped implementation.**

## Source handoffs
- `Bloom_Biology_Genetics_Personal_Relevance_Scientific_Review_2026-11-05.md` (BIO-GENREL-01–08).
- `Bloom_User_Testing_Genetics_Personal_Relevance_Ranking_Addendum_2026-11-05.md` (UT-GEN-4213–4220).
- Existing `Genetics §5A` / GEN-UX-01 / GEN-DATA-01 / GEN-SAFE-01 / GEN-05 and Nov 4 Genetics Expansion handoffs.

## Decision
**APPROVE WITH CONDITIONS:** The compact overview is useful but it must describe **selected reviewed highlights** and not pretend to represent all genes or disease risk. Initial 3–5 is a **testable presentation hypothesis** (0–5 permitted), not a numeric clinical score, a requirement to fill five slots or a scientifically validated optimum. All remaining calls, research records and 17 domains must stay reachable from See all/Explore genes. Preserve v0.5 named candidate catalogue and the existing 29-marker import/science audit; do not replace them.

## Key UX contracts
1. Present five distinct counts: **catalogued**, **measured**, **interpretable**, **reviewed explanation**, **personal-highlight eligible**. These are not a universal funnel; some reviewed content is educational and not personal.
2. Before relevance ranking, require eligibility from real observed variant, source assay, orientation/REF/ALT, variant class, Biology-reviewed variant–phenotype claim, applicable population, consent and allowed use. No source data ≠ normal.
3. Ranking explains **why shown** and may use reviewed claim quality, applicable genotype effect, *actually available* goals/labs/diet/activity, nonredundancy and expressed interests. Never display universal genetic health score, disease prediction or an arbitrary composite percentage.
4. Deduplicate **finding** presentation for LD-linked variants (e.g. FADS1/FADS2) while preserving every source call. Common/rare allele frequency is not a ranking mandate. No additivity assumption.
5. Clearly label associations and mechanisms and show source, uncertainty, study model and personal data boundaries. A measured LDL/Vit D lab result does not demonstrate genotype causation.
6. Sensitive APOE, disease risk, PGx, unreviewed and ambiguous entries are excluded from unconsented personal highlights; permitted research may still be browsed.
7. Provide See all, Explore genes, sort, search, filters, and optional pinned/hidden items only after user controls are properly source-bound. No opaque dismissal that deletes or hides original source.
8. On evidence downgrade, consent withdrawal, source deletion or account switch: remove stale personal highlights and preserve appropriate source audit.
9. Data should never be sent as raw genotypes to general analytics. User-testing events are aggregated and non-identifying.
10. Runtime must demonstrate 320px wide, 200% zoom, keyboard/screen reader, actionable zero state, and no false-interpretation comprehension events.

## Prototype and release caveat
`prototype.html` is self-contained HTML/CSS/JS using Bloom's approved Everyday token values. It displays **only synthetic** count and claim fixtures (200/70/60/55/3). Example snippets do not assert that real people have eligible calls or that particular variant claims are reviewed. Controls work to preview states and sorting without server persistence. It is **not** a verified app screen or a scientific interpretation engine. Real genetic data, clinical sources and claim review are external owner-gated inputs.

## Blocker ownership
- Biology: BIO-GENREL-01–08 evidence-level review per exact variant–phenotype claim.
- Architect: reconcile 150–250 candidate inventory, 55 illustrative reviewed records, v0.5 numerical scope, eligibility/ranking and release criteria.
- Developer: use existing importer, consent registry and scientific claims service, no second genetics engine; implement only after Architect reconciliation on `enhance/bloom-experience`.
- Legal/Security: sensitive consent, PGx/medical boundaries, source deletion/caching and analytics privacy.
- User Testing: independent uncoached device testing; no results inferred from these handoffs.

No new Product Owner decision required under the current approved UX and quality-first direction.
