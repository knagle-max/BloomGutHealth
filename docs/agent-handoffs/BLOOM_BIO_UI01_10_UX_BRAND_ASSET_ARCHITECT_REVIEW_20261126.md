# Bloom — Bloodwork & Microbiome BIO-UI01–10 selective design: Architect reconciliation and Codex asset transfer

**Owner intake:** 2026-11-26. **Disposition:** ACCEPT approved selective visual directions as **mandatory UX/Brand inputs when corresponding UI is selected**; not wholesale redesign, runtime integration, clinical acceptance or release authorization. Use one task selector: root `AGENTS.md` and `NEXT_ACTIONS.md`. This file is a **persistent source index and design reconciliation**, not a parallel backlog or a claim that source binaries have been published.

## Integrity and original-source delivery

Exact uploaded owner archive: `Bloom_BIO_UI01-10_Selective_Approved_Design_Handoff_2026-11-26(1).zip`, **3,907,096 bytes**, **SHA-256 `886e222f97fe1f9a6bd4901fec9d6a5fb13d59b55b0d1c5273ec4173c96925f5`**. ZIP CRC test passed; 15 entries total, including its checksum manifest. All **14/14 SHA256_MANIFEST.json entries** independently matched original byte count and SHA-256; source package status says **approved directions, not implementation-ready**.

ZIP contains:
- `source_reference/Bloom_Brand_Bloodwork_Microbiome_UX_Handoff_2026-11-26.md`: 45,074-byte full UX specialist handoff, `UX-BIO-BRAND-20261126-R1`, with **BIOUX-T01–T16** acceptance tests. Its November 9 `main` source baseline is **older than current integration branch**, not live implementation proof.
- `source_reference/Bloom_Bloodwork_Microbiome_Brand_UI_Asset_Handoff_2026-11-26.md`: 8,767-byte Brand companion, `BRAND-BIO-20261126-R1`; full live-maintained Brand [GitHub handoff](BLOOM_BLOODWORK_MICROBIOME_BRAND_UI_TOKEN_ASSET_HANDOFF_20261126.md) exists.
- `source_reference/BLOOM_DESIGNER_STANDING_PROCESS_AND_SUCCESSOR_HANDOFF.md`: future designer process (7,413 bytes).
- `handoff/ARCHITECT_CODEX_HANDOFF.md`, `handoff/README.md`, `handoff/BIO_DESIGN_DELIVERY_REGISTER.csv`: detailed design status and routing.
- `specifications/BIO_UI10_SHARED_TOKEN_STATE_RESPONSIVE_SPEC.md`: 3,440-byte proposed token/state/responsive matrix, **not new global palette**.
- **Six** approved-direction PNG review boards: BIO-UI01, BIO-UI02, BIO-UI03, BIO-UI06, BIO-UI07, BIO-UI09. Plus **one** BIO-UI07 editable **review reference SVG**, **not** production organism art.

| Review file in ZIP | SHA-256 |
|---|---|
| `review_boards/BIO-UI01_Bloodwork_Overview_APPROVED_DIRECTION.png` | `57252f4a475b20fb007517d91676863b76f6fbc2e7c6427e583735aa4917b5b1` |
| `review_boards/BIO-UI02_Marker_Search_Categories_APPROVED_DIRECTION.png` | `c82f2ea96444dbdf3980540e25197ba7dc54f1c30799dd5669501fcaa75fc179` |
| `review_boards/BIO-UI03_Marker_Detail_Trend_APPROVED_DIRECTION.png` | `94789db790798ac2dd8297643e5171c8f4bb269627cbf59d5efa4793b06180b7` |
| `review_boards/BIO-UI06_Organism_Catalogue_APPROVED_DIRECTION.png` | `3a4cc92d729b7da97ba68dacfed7b6a6c8aeb60ab66fba7ccd519dc14a7b29b5` |
| `review_boards/BIO-UI07_Organism_Profile_APPROVED_DIRECTION.png` | `825df9c26d787309b045def2984aca0e6aa8b2c2cad9c1999ec7e24bd8ed7166` |
| `review_boards/BIO-UI09_Microbiome_Reports_APPROVED_DIRECTION.png` | `277f43c2e5ce2b079d5f63543286c294e7dc892672840af59a62d5438a405923` |
| `review_boards/BIO-UI07_Review_Reference_Editable_SVG.svg` | `de410e6a06e99725fb497b733bfdcccc03e3edee978fc6e402f0087599bf55bc` |

**Codex binary-access truth:** This text review and existing GitHub Brand contract are available now; the **ZIP, six PNG boards, editable SVG and exact packaged UX document have not been imported into the Codex Git checkout by this handoff**. To make *all original assets* available, attach the exact ZIP once in the Codex conversation/worktree or arrange a separate authorized **nonshipping binary repository source transfer**, verify top-level and per-member hashes and preserve source paths. Do not claim pixels transferred from a file manifest or recreate them from screenshots. Text-only source-safe implementation can continue while transferred originals are absent, with precise per-asset `SOURCE_TRANSFER_BLOCKED` only where needed.

## Both specialists reviewed and source precedence

**UX authority:** the **full** uploaded `UX-BIO-BRAND-20261126-R1` governs flow, content order, primary/secondary actions, source and data disclosure, page structure, mobile/desktop wireframes and BIOUX-T01–T16. **Brand authority:** the uploaded Brand companion, live GitHub [Brand BIO handoff](BLOOM_BLOODWORK_MICROBIOME_BRAND_UI_TOKEN_ASSET_HANDOFF_20261126.md), and [standing visual/token specification](../../design/visual-system/STANDING_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md) govern type, four themes, spacing, elevation, component states and artwork reuse. The six boards demonstrate **presentation only**; their fabricated lab values, trends, status colors, sample dates, classifications and organism findings are not authoritative. Scientific/source/legal rules supersede design examples; latest specific owner requirements supersede older visual drafts.

**Critical R3 conflict:** The BIO-UI03 *review board* shows mobile disclosure-style educational blocks, while the source UX (owner **R3**) and Brand binding copy both require **latest actual measurement + units/date → comparable historical chart → default-visible “What is it?” → default-visible “Why does it matter?”** immediately under chart. Never hide either essential explanation in an accordion or place it ahead of the primary chart. Deeper research/source/method details may remain disclosed. Example ALT 24 or 38 and any displayed “normal” status are **synthetic**, not user data or a medically validated classification.

**Current-branch reconciliation:** Existing `LabExplorer`, `LabTrend`, `LabMarkerEducation`, `BloodworkSourceOverview`, `Microbiome`, `MicrobialProfile`, `OrganismPortrait`, canonical report managers and `client/src/brand.css` exist and must be reused. UX review inspected older `main`; current `enhance/bloom-experience` already has extensive lab source identity, chart comparability, original report corrections and organism attribution. Reverify actual HEAD and reproduce a specific UI deficiency before changes; do not wipe/duplicate current workflows or treat the review boards as deployed screenshots. No independent actual rendered 390×844/1440×900 acceptance, physical device testing, contrast, AT or performance was delivered in this ZIP.

## Screen-specific dispositions for eligible UI work

| ID | Accepted direction | Implementation/reuse decision |
|---|---|---|
| **BIO-UI01** | **Approved board**, Bloodwork overview | Improve compact category discovery and at most 0–2 **genuine eligible comparable** recent changes, with real empty/partial/single/alert states; **no overall biomarker score**. Reuse BloodworkAtlas, BVA-0009/0010–14 and existing source system. |
| **BIO-UI02** | **Approved board**, marker search/categories | Reuse `LabExplorer`, authentic category icons, source-only/unclassified values, query and long label states; category/report source labels are not diagnoses. No made-up category totals or mandatory clinical status chips. |
| **BIO-UI03** | **Approved board** subject to binding R3 correction | Exact latest result/unit/date → honest chart → **two default-visible essential educational paragraphs**; source interval/assay comparability, single point, no history, source switches, corrections and accessible table all preserved. Review `LabTrend` + `LabMarkerEducation` existing placement before editing. |
| **BIO-UI04** | **REUSE_EXISTING** | Keep existing authenticated reports and source management, collected vs uploaded date, import/review/edit/delete and original report detail; **no new artwork**. |
| **BIO-UI05** | **REUSE_EXISTING** | Preserve `MicrobiomeEditorial`, approved BVA-0051, report-specific sample identity, report picker and direct organism discovery; no fabricated abundance, diversity or activity. |
| **BIO-UI06** | **Approved board**, organism catalogue | Searchable portrait rows 36–56px, real bacteria/archaea distinction, italic scientific names, wrap long labels, numeric vs qualitative vs unreported, neutral image fallback and honest no-results/unknown states. |
| **BIO-UI07** | **Approved PNG + editable SVG reference** | Existing `MicrobialProfile`/OrganismPrimer and approved `OrganismPortrait`; show personal **report observation** separately from **general reviewed research**, source restrictions and conceptual-art label; preserve dialog focus restoration. SVG is a visual reference only, not an independently anatomy/science-reviewed organism image. |
| **BIO-UI08** | **REUSE_EXISTING** | Existing functional research lens, reviewed science and CHART-C; never convert studies of an organism into observed personal biochemical activity. No new asset. |
| **BIO-UI09** | **Approved board**, microbiome reports | Distinct real report identity/provider/sample date, quantitative vs qualitative results, provider-authored food/assessment labels with source-specific caveats; no “Bloom score” or diagnosis inferred from assessments. |
| **BIO-UI10** | **CONTRACT_SPECIFICATION** | Reconcile current CSS/Brand roles, four theme/mode combinations, state matrix, 320/390/768/1440, 200% zoom, focus/contrast/accessible chart table. Proposed 30/34px and 48px targets are **not new site-wide CSS permissions**. |

**Asset restrictions from Brand:** BVA-0026/0048/0049 remain **conditional**, BVA-0050 **deferred**, BVA-0053–77 no bulk order, BVA-0091–96 source/scientific rights gates still separate; existing organism portraits, editorial art and scientific chart families must not be replaced by review boards or newly generated stock. Only permitted art substitutions after existing asset registry/rights check.

## Codex implementation and proof

For an actually selected Biology/Bloodwork/Microbiome UI slice, use:
`AGENTS.md` → `NEXT_ACTIONS.md` → this reconciliation → **exact original UX and Brand source** → relevant BIO-UI design board/contract → actual current React/Brand CSS and source models. No ten-screen blanket rebuild. UX gets structure, Brand gets paint-layer decisions; prioritize fixing reproduced hierarchy/flow defects with existing components. Do not expose telemetry, medical inference, fabricated classifications or raw source-audit walls in main flow; keep meaningful science and correction reachable through progressive disclosure.

**Mandatory owner visual gate for substantive UI changes:** capture and inspect actual app at **390×844** and **1440×900**, initial, selected/open, and secondary states, compare with relevant board and actual UX/Brand rules; include 320/768, four theme combinations, 200% reflow, keyboard/focus, source identity/correction/permission tests. Correct squashing, lost CTA, chart clipping, false source labels, undisclosed essential R3 education. Record rendered checks with actual branch SHA and `NOT_TESTED` for true remaining physical AT/release checks. A screenshot alone does not certify any science or protected release.

**Governance:** [standing Architect/Codex UI rules](BLOOM_STANDING_ARCHITECT_TO_CODEX_UI_UX_BRAND_GOVERNANCE_20261126.md) survive successor agents. **No Render attempt until December, no production/main merge, paid-provider activation, private external transfer or unauthorized regulated medical outputs.** Source/asset publication and implementation are independent from release.

**Recommended next actions:** Codex does not require the original ZIP merely to read **this summary or the live Brand handoff**, but **does need the exact ZIP** for original full UX, six review-board pixels, editable BIO-UI07 reference, and design register unless a verified nonshipping repository binary transfer is completed. Ask the owner to attach it **once** to Codex; do not request nine separate packages.
