# Bloom — REL-A01–A06 release identity artwork: source review and Codex integration handoff

**Review date: 2026-11-21. Branch: `enhance/bloom-experience`. Owner-provided exact upload:** `Bloom_REL_A01-A06_Approved_Upload_Bundle_2026-11-21(1).zip` (**1,201,428 bytes**, SHA-256 `5df17963210668254aa1b42d4c26adca61f79c6ea7609fcbe368193e400c6a13`). ZIP CRC checked; all six internal ZIP hashes match outer `UPLOAD_MANIFEST.json`; nested package manifests checked against their files (A01 4, A02 8, A03 8, A04 7, A05 9 assets via an `assets` manifest, A06 8; no observed SHA mismatches). **Physical ZIP is a conversation attachment, NOT a source binary committed to GitHub.** Codex must receive this file through authorized attached input and check SHA before using assets. Do not report source as installed without actual byte access.

## 1. Naming policy vs conflicting design prose — resolved for execution, not silently changed

The previously owner-approved and already coded product naming is [Genesis → periodic table by **1.x minor release**](../architecture/BLOOM_PRODUCT_RELEASE_NAMING_20261121.md), implemented in `shared/product-release.ts` with `tests/product-release.test.ts` and visible in Profile:

| Product version | Current binding | Release status |
| --- | --- | --- |
| 0.x, including 0.6.0 / 0.7.0 / 0.9.0 | **Project Genesis**, no atomic tile | pre-release only |
| 1.0.0-rc.1 and other prerelease suffixes | **Project Genesis**, no atomic tile | release candidate; NOT public |
| 1.0.x **after explicit public authorization** | **Hydrogen (H, 1)** | first public release / patches |
| 1.1.x **after explicit public authorization** | **Helium (He, 2)** | next feature release / patches |
| 1.2.x **after explicit public authorization** | **Lithium (Li, 3)** | following feature release / patches |

**Latest owner confirmation — major-version continuity:** Bloom's periodic element sequence continues **through major-version changes**, and is tied to **explicitly named actual release lines**, not a minor/major number formula. Patches inherit their assigned element. `1.0.x = Hydrogen`, `1.1.x = Helium`, and `1.2.x = Lithium` remain assigned. **No element is yet assigned to 2.0.0**: when its time comes, it gets the *next unused* element after the last actual named release (e.g., Sodium after releases through 1.9; Beryllium if 1.2 was the last). Never skip or recycle elements, silently preassign 2.0, or replace the REL art. The owner-confirmed permanent rule is in the canonical [release naming policy](../architecture/BLOOM_PRODUCT_RELEASE_NAMING_20261121.md).

**Conflict:** REL-A01/A04/A06 designer notes include a **different proposed major-only cadence** (`all 1.x Hydrogen; 2.x Helium`). That is a *proposal embedded in asset-delivery guidance*, not an explicit owner instruction to supersede the already approved and implemented minor-based policy. **Do NOT rewrite `shared/product-release.ts` to major-only just because a visual mockup says so.** The approved tile source is **data-driven**, supporting either cadence and requiring **no** duplicate visual asset per element. If the owner expressly approves major-only, update the one authoritative product-release policy, implementation and focused tests together; no unapproved silent switching.

Current `package.json`/`package-lock.json` `rest-express` technical version `1.0.0` is not a released Bloom version. A release flag/authorization must not be inferred from a version string, mockup, PNG, npm metadata, or CI. Do not invent a public release date or release-note link.

## 2. Package-specific source/approval reconciliation

| Package | Package SHA-256 | Actual content and implementation value | Approval/QA interpretation |
| --- | --- | --- | --- |
| **REL-A01**, periodic tile **v3** | `4b7cb1eae5bf455aaf9d106706e25e0401fc4535f57c23989eb4ee84244d9593` | Owner-approved 1254×1254 **JPG visual gold standard**, reconstructed editable SVG and data-driven `REL-A01-tile-component.js`; large H and tighter design. | **Owner-approved artwork**; SVG is a recreation, **not** pixel-identical original. Font/rasterization, accessibility and runtime still require verification. |
| **REL-A02**, full **Concept A** | `37a649d0814990770436b56d45052ab5197cdffdd16e2f8e50fb1062fa2b9ecb` | Desktop and mobile illustrative JPGs; HTML/CSS/JS showing compact typographic tile + title; same A01 tile component. | **Outer bundle calls approved; inner `manifest.json` and README say REVIEW CANDIDATE NOT APPROVED.** Resolve owner-level approval precedence before asserting final design approval. Preserve candidate, no forced product change. |
| **REL-A03**, compact About/dialog | `f09f9310f621993862986d871c39c66de558b8cf51dca22bee4a2990ec8ae23b` | 122px About/Settings variant and 68px update-dialog reference with adjacent accessible text. | Outer approved label vs internal **DESIGN_CANDIDATE_NOT_APPROVED**; JPEGs are Pillow representative images **not browser screenshots**. No live browser proof. |
| **REL-A04**, **Project Genesis** | `7a3267d2e837d0e5926737a79f67ea2e66e191c2e2a383246990947e6ceaae93` | Editable SVG/HTML pre-release typography, full and compact layouts, no atomic element tile, actual current label `Bloom 0.6.0 · Project Genesis`. | Outer approved label conflicts with inner **DESIGN_CANDIDATE_NOT_APPROVED** and README ‘approval pending’; treat as provided concept/design source pending explicit approval precedence, not as failed code. Demo B monogram is **not official Bloom mark**. |
| **REL-A05**, future Hydrogen launch | `991971cad62bd964eb32e529e8f611bef39d8d2d2db5c425ab8c78890995fbf9` | Editable SVG, representative JPG and WebP promotional templates in **16:9, 1:1, 9:16**. | **Owner-approved release announcement artwork, NOT launch authorization.** Separately requested **4:5 not supplied**; never claim complete formats. Typographic Bloom substitute must be replaced by approved brand wordmark if used. |
| **REL-A06**, four theme + subtle reveal | `8b7b20699cb5707bf0f0d8fa797cabc0093f921e0387f98c03038eb918108fec` | Everyday light/dark and Athlete light/dark; consistent A01 tile, 180ms one-time optional fade-up, reduced-motion/no-JS static. | **Owner-approved design direction**, no app/browser/contrast/assistive technology verification. No continuous/magical animation; replay control only a specimen. |

### Shared design rules

- A01 approved reference JPG is the **visual standard**, but the editable vector is a reconstructed source; use **one data-bound tile component** for authorized element names/numbers, not a hard-coded Hydrogen JPG in a Genesis build.
- Design family uses Newsreader + Plus Jakarta Sans preferred stacks; **no font binaries shipped**, licensing/availability and actual fallbacks must be checked before runtime claims. Do not replace all app typography to fit a release graphic.
- A02 is a full composition and A03 a compact rendition; reuse the same code/style primitives if integrated, **not two tile engines**. A04 is **typographic Genesis**, explicitly **without** an atomic tile.
- A05 is **promotional, future-facing** material; do not add it to current About/Profile or product navigation, show an invented release date/notes, or deploy launch announcement. Preserve all three actual formats and record 4:5 as missing requested derivative.
- A06 four-theme colors are design anchors, **not directives to overwrite Bloom's existing theme tokens**. Static default or one-time 180ms easing only; `prefers-reduced-motion: reduce`, no-JS/reduced visibility, screen-reader duplication and 200% zoom must be checked in actual UI.
- Responsive/accessibility for 320/390/768/1440px, light/dark, Everyday/Athlete, 200% zoom, keyboard and forced colors remain **NOT TESTED** by supplied illustrative JPGs.
- The bundle includes standalone demo HTML/CSS/JS. **Inspect as references, do not install their independent app, font provider, CSS global override, or preview replay controls.** Only narrow integration into existing Profile/About/brand components is allowed.

## 3. Integration priority within the existing owner asset + Genesis pass

1. Keep the current **Genesis** mapping and Profile text as factual product identity; test it under the **existing single combined approved artwork + naming checkpoint** in `NEXT_ACTIONS.md`.
2. In that same checkpoint, once the exact uploaded ZIP is physically accessible to Codex, source-verify and optionally integrate **A04 Genesis typography** only where it genuinely improves the existing Profile/About presentation, respecting uncertain inner approval metadata and the official wordmark. **Do not replace an already clear functional label solely to ship extra decoration**.
3. A01/A02/A03/A06 supply the **future reusable authorized periodic tile and visual language**; preserve exact sources and test primitives only if a narrow existing UI change warrants them. Do not show Hydrogen in 0.x or build a separate About page, release gallery, or update dialog to use delivered art.
4. A05 **future release announcement** stays source-preserved and unactivated until public 1.0 launch is separately authorized and the missing 4:5 request is resolved if still needed.
5. Actual status categories: `SOURCE_VERIFIED`, `DESIGN_APPROVED` (for items with consistent approval evidence), `APPROVAL_METADATA_CONFLICT`, `INTEGRATED_AT_HEAD`, `BROWSER_VERIFIED`, `HOSTED_VERIFIED`, `PUBLIC_RELEASE_AUTHORIZED` — never collapse these into one ‘done’.
6. On completion return one source/commit SHA, per-REL-ID source/approval/actual file + component status, named focused test results, real UI checks (or `NOT TESTED`) and specific outstanding gaps. Keep current Render/Mac/network pause; prioritize real urgent P0 integrity/safety faults and resume P1/P2 after bounded owner asset pass.

**Source authority:** This file records the source bundles' contents and conflicts. It does not itself grant design approval to items internally marked candidates; it also does not invalidate the owner's outer “approved” label without clarification. It does **not** add another queue, release gate or product capability.
