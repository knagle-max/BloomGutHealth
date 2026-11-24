# Bloom — Mandatory placeholder-to-BVA tracking and targeted missing-asset audit

**Date:** 2026-11-23 · **Disposition:** Standing engineering rule **published**, targeted repository/source audit complete; **not** full repo-tree or hosted-app exhaustive validation. No new artwork requested, asset rendered, app changed or active Codex task activated.

## 1. The mandatory rule

`AGENTS.md` now mandates that each persistent **new commissioned-artwork placeholder added in an eligible authorized implementation** be registered in the existing `docs/visual-assets/visual-asset-registry.json` **within the same source change**, with appropriate code site, exact existing-asset reuse check, reserved BVA ID, unique brief, responsive/themes/crop, accessible meaningful fallback and honest statuses. See also `docs/architecture/BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md` §3 (2026-11-23 addendum).

Decision before adding:
1. **Existing approved art available:** reuse same BVA and verify source; never regenerate/duplicate IDs.
2. **Existing approved source unavailable in checkout:** same BVA, `BLOCKED_BINARY_TRANSFER`; neutral text/layout fallback.
3. **New variant of registered art:** existing BVA entry + variant requirement (example future REL-A05 4:5), no new permanent ID.
4. **Genuinely new independent editorial, anatomy, educational, data-free conceptual or specialized icon art:** next sequential permanent numeric BVA with `Identified` or `Briefed`, `PLACEHOLDER_ONLY_NOT_ARTWORK`, exact component/route and no fabricated hash/path/approval. Maintain source-accurate content and existing functionality.
5. **Ordinary loading skeleton, `input placeholder`, CSS ornament, ordinary Lucide/icon-library use, chart primitives or inline text fallback:** not a new registered art requirement.

The current main-work queue remains `NEXT_ACTIONS.md` GI-01..GI-10 read-only baseline **then STOP**; this is prospective governance, not authorization for a blanket visual rework.

## 2. Evidence-backed gaps and apparent omissions

| Candidate | Evidence checked | Current disposition | New BVA? |
| --- | --- | --- | --- |
| Six original onboarding goal glyphs | `docs/architecture/BLOOM_ONBOARDING_A07_A12_ASSET_INTAKE_AND_INTEGRATION_AUDIT_20261121.md` §§ opening/approval notes; designer worklist | Outstanding six requested distinct icons already covered by **BVA-0081**. Four existing ONB-A09 icons are different approved source and must be reused as appropriate. | **No** |
| LDL marker education/artery/hero `reserved` slots | `client/src/content/editorial-media.ts`; current BVA registry records `BVA-0048`, `BVA-0049`, `BVA-0050` | Three corresponding entries already exist; verify intended real code paths and original source delivery when eligible. No false production claim for reserved media. | **No** |
| Microbiome overview editorial `reserved` slot | `client/src/content/editorial-media.ts`; BVA-0051 current asset family | Existing BVA-0051 is the source/visual requirement; transfer/render QA remains a task-state issue. | **No** |
| Future Hydrogen 4:5 format | `docs/visual-assets/BLOOM_REL_A01_A06_RELEASE_IDENTITY_ASSET_REVIEW_20261121.md`, REL-A05 | One **missing rendition of a registered release-identity family** (BVA-0082), *not* a new conceptual visual. Future-only; do not manufacture launch/current release. | **No** |
| BVA-0078/0079 Athlete anatomy; 0087–0089 symptoms; 0090 nutrition coverage | Current 101-asset canonical registry plus Nov 22 source/approved anatomy and symptom/nutrition reviews | Assets/requirements already registered; art exists in owner attachments to varying degrees. Canonical mapping, reviewed geometry and source checkout still pending. | **No** |
| New bacterial morphology C06/F03/A01/P01–P03 and extra C07–C11 | 2026-11-23 source-verified two-ZIP handoff, current registry and 190-seed catalog | All now indexed as BVA-0091..0101. Optional C07–C11 have zero taxon mappings; do not remap unverified species simply to use art. | **No** |
| Historical scientific molecule source illustrations | `docs/operations/MOLECULAR_ILLUSTRATIONS.md`; `client/src/pages/Explore.tsx` | 14 molecular structure drawings already exist in source-specific scientific visual inventory; four are mapped, ten remain as source assets with **no approved scientific entity/UI requirement**. An independent BVA per unused drawing would duplicate source inventory and invent product scope. | **No** |
| Earlier missing `brand-concept-reference.png` | `docs/operations/ASSET_RUNTIME_AUDIT.md` and `ASSET_RUNTIME_AUDIT.json`: archive source path `design/bloom/archives/bloom_brand_delivery_v1/bloom_brand_delivery/previews/brand-concept-reference.png` has `MISSING` status | **Archived review-image exception, not a verified running-app image requirement.** Revalidate source archive only if that reference is needed; do not treat it as a missing new public hero. | **No** |
| Original exercise technique art BVA-0022 and lab empty BVA-0026 | Existing 101-entry registry and designer worklist | Incomplete/rejected design candidates already have permanent IDs. Do not create new IDs for replacement revisions. | **No** |
| Existing `journal-empty` brand SVG, decorative sprig and generic fallback imagery | `client/src/content/editorial-media.ts` | Existing committed media primitives; no evidence of a new commissioned independent image slot solely by their presence. | **No** |

**Targeted audit conclusion:** **0 independently confirmed unregistered, newly required standalone art families** from the reviewed current policy, media slots, relevant handoffs, morphology receipts and prior runtime report. This is **not proof of exhaustive 0** across all app routes, every archived source, or Codex's unpublished working tree. In particular the current branch's interactive source registry/placeholder linkage has not been exhaustively enumerated or tested, the GitHub code-search index may reflect a different default-branch checkpoint, and no current authenticated browser/device crawl was run. Keep these verification types distinct.

## 3. Real gaps are mostly status and source traceability

- **Delivery ≠ integration:** many registered owner-approved/received ZIPs lack actual GitHub checkout binary transfer; do not hide this behind placeholder code or create a duplicate BVA. Source hashes are documented in their own handoffs.
- **Original art versus placeholder:** map code-local `reserved`/fallback uses to registered BVA IDs explicitly in future selected task receipts; currently the media-slot reservation can be inspected without seeing a BVA ID next to each object.
- **Generated ID reference consistency:** `client/src/content/visual-asset-ids.ts` is generated from the BVA registry; don't edit generated output as registry source or assume the generated file is fresh after a registry-only edit.
- **Nontrivial on-disk unregistered art:** when future Codex work discovers actual ad hoc `.svg/.png/.webp` files not associated with a source-specific inventory or a canonical BVA, inspect their provenance/route and decide whether to map them to an existing family, leave as standard design-system primitives, or reserve a new independent BVA. **Do not auto-register every image file**—archive examples, original science drawings and generated derivatives are commonly legitimate without one BVA per file.

## 4. Suggested low-cost verification when Codex is actually eligible for UI work

1. At actual HEAD identify changes in `client/src`, `client/public` and design references that introduce intentional `reserved` media slots, bespoke illustration imports, `PLACEHOLDER_ONLY` asset markers or commented missing source paths.
2. For each, classify the five cases above; link one existing or new permanent BVA and preserve source status, placeholder purpose and intended replacement.
3. Reconcile the 101-ID registry, designer worklist and generated `visual-asset-ids.ts`; check for duplicate IDs, orphaned slots, broken public URLs, unreviewed external image use, missing accessible fallback and false claims that a `reserved` media slot is real asset.
4. Include a compact **newly discovered asset delta** in the current selected Codex task receipt: `Existing BVA reused / New BVA / No artwork requirement / blocked exact source`; newly registered BVA count may legitimately be zero.
5. Validate real page when it is built: responsive/layout fallback, light/dark, user-visible alt/labels, reviewed science/rights, real source byte/hash and no missing source forcing fake data; record engineering versus independent acceptance separately.

This audit creates **no separate task queue**, does not initiate a mass new-image request, and does not change any approved existing visual.
