# REL-A06 — Four-theme, subtle motion & accessibility design candidate (2026-11-21)

**Status:** `OWNER_DESIGN_APPROVED / AGENT_DELIVERED / NOT_IMPLEMENTED / RUNTIME_QA_PENDING`. Owner approval: 2026-11-21.

This is the single behavior/appearance spec applied to REL-A01–REL-A05, using the owner-approved **REL-A01 v3 canonical tile**; not a second emblem, independent code architecture or release registry. REL-A05 is approved separately.

**Historical review package (superseded):** `/Bloom gut health/Agent Handoffs/Bloom_REL_A06_Four_Theme_Motion_Review_2026-11-21.zip` in Shared Library (uploaded, exact archive SHA-256 `25eb2fc5ce5fa311ae4f5175b0894ca27fa667972cb04aad5b5dbbba006e860c`, ZIP CRC and manifest hashes verified).

**Authoritative approved package:** `/Bloom gut health/Agent Handoffs/Bloom_REL_A06_Four_Theme_Motion_Approved_2026-11-21.zip` (upload verified). ZIP SHA-256: `8b7b20699cb5707bf0f0d8fa797cabc0093f921e0387f98c03038eb918108fec`. ZIP CRC and per-file hashes in `manifest.json` verified. Original HTML, JS, CSS, representative JPG and REL-A01 tile component bytes are unchanged; approval-state metadata in README, specification, checklist and manifest was revised. This approval applies to the four variant treatments and restrained 180ms motion, NOT to any public 1.0 launch, app code integration, or unperformed accessibility/browser tests.

Contains editable local `index.html`, `styles.css`, `preview.js`, reused `assets/REL-A01-tile-component.js`, four-theme static representative JPG (not a browser screenshot), `MOTION_AND_ACCESSIBILITY_SPEC.md`, `VERIFICATION_MATRIX.md`, README and SHA-256 manifest. Serve locally for interactive preview; ES module imports may fail using `file://`.

## Four candidate appearance treatments

| Variant | Page background | Ink | Secondary ink | Tile | Tile border | Tile ink |
|---|---|---|---|---|---|---|
| Everyday Light | `#F8FAF6` | `#173E32` | `#52685C` | `#052F21` | `#A7BE94` | `#FAF3E5` |
| Everyday Dark | `#0C211B` | `#F5F3EB` | `#B7CFC0` | `#123D2E` | `#A7BE94` | `#FAF3E5` |
| Athlete Light | `#EEF4FB` | `#182B45` | `#516B85` | `#182B45` | `#89ACCE` | `#F1F6FF` |
| Athlete Dark | `#0F1B2E` | `#F1F6FF` | `#C3D4E9` | `#12263D` | `#89ACCE` | `#F1F6FF` |

These are reviewed **design candidate anchors**, not a mandate to override existing production theme CSS. Preserve identical element geometry across modes; change only appearance. Typography is Newsreader for major title and Plus Jakarta Sans for metadata when licensed/available through existing app fonts.

## Restrained optional motion

Static by default; optional one-time 180ms ease-out opacity 0→1 plus vertical translateY(4px)→0 when tile first appears. Entire title, version/date and release-note text remains visible independent of animation. Never animate release values, loop, rotate, pulse, glow, draw electrons, replay on routine rerenders or imply biological activity. When `prefers-reduced-motion: reduce`, render immediately in final static position with no translation or animation. Reviewer-only replay button must never ship.

## Accessibility & version semantics

WCAG 2.2 AA target: normal text ≥4.5:1, large text ≥3:1, essential non-text/focus ≥3:1. Keyboard/focus outline and genuine 44px tap targets for linked release notes; 320/390/768/1440 viewport, 200% zoom, high-contrast/forced-colors, screen readers and no-JS. Tile is `aria-hidden` when live text already describes the release, otherwise use meaningful accessible label. Text fallback is authoritative. 0.x Genesis **never** draws an element tile; 1.x Hydrogen only when canonical version metadata verifies it; unknown majors fall back to plain version text. Date and notes URL only when genuinely available. Need Architect reconciliation with any older minor-release mapping before integration.

All device/contrast/focus/render checks are **pending**. The representative JPG is a design illustration, not runtime testing. Current app is not thereby authorized for 1.0 release or deployment.

## Approved decision and outstanding gates

Owner approved four looks and optional 180ms motion on 2026-11-21. Codex may consume the exact SHA-verified approved package when eligible under the existing single execution queue. Remaining: runtime token reconciliation, actual contrast and accessibility tests, responsive browser screenshots, signed-off asset rights and independent hosted verification. No separate redesign or parallel release registry.
