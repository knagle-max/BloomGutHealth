# REL-A01 — Approved periodic tile, v3

**Owner approved 2026-11-21:** Version 3 reference artwork, with substantially increased H scale and tighter layout. Approved graphic reference is `assets/REL-A01-approved-representative-v3.jpg` (1254×1254). Original reference is a rendered image, not an editable vector.

`assets/REL-A01-hydrogen-approved-editable.svg` is a carefully reconstructed **editable vector implementation** based on the approved reference, not a pixel-exact original vector source. The JPG is the visual gold standard, and minor font-rasterization differences are expected. The SVG's words remain editable and are intended to be data-bound at runtime. `assets/REL-A01-tile-component.js` shows one component for all periodic elements and four theme modes. Do not export a raster-only tile into the app and hardcode Hydrogen; bind to the existing release registry after Architect resolves the naming cadence.

Proposed headings use Newsreader; detail type Plus Jakarta Sans. Both require verification of app licensing/availability; Georgia/Inter/system fonts are fallback examples, **font binaries are not included**.

Release identity is visual only; currently 0.x Genesis and 1.0 public Hydrogen is future-facing. **The new major-only element cadence conflicts with current older major=1/minor-based `shared/product-release.ts` mapping. Do not alter that logic in this asset delivery.**

Status: REL-A01 design reference owner-approved, delivered. SVG/JS are implementation guidance pending pixel/font QA, contrast/accessibility checks, and code integration. Not shipped.
