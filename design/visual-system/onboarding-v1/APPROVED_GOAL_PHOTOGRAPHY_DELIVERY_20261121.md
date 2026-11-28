# Bloom onboarding — six approved photorealistic goal-card visuals

**Date:** 2026-11-21  
**Owner decision:** All six original goal-card photographs/illustrations accepted; ONB-A06 is specifically the **revised green-and-athlete-blue runner**, not the original muscle-fiber image.

**Release:** Images owner-approved; production integration, responsive crop checks, scientific/rights review, and actual live app rendering still pending.

## Downloads and source

Shared Library: `Bloom gut health / Agent Handoffs /`.

- `Bloom_ONB_Six_Goals_Approved_2026-11-21.zip`: original 1536×1024 PNGs + optimized 384, 768, 1536px WebP per asset.
- `Bloom_ONB_Six_Goals_Manifest_2026-11-21.json`: file paths, byte lengths and SHA-256.
- `Bloom_ONB_Six_Goals_README_2026-11-21.md`: usage notes.

| Goal | ID | Original filename inside archive | WebP variants |
| --- | --- | --- | --- |
| Gut health | ONB-A01 | `original/ONB-A01-gut-health.png` | `webp/ONB-A01-gut-health-{384,768,1536}.webp` |
| Longevity | ONB-A02 | `original/ONB-A02-longevity.png` | `webp/ONB-A02-longevity-{384,768,1536}.webp` |
| General health | ONB-A03 | `original/ONB-A03-general-health.png` | `webp/ONB-A03-general-health-{384,768,1536}.webp` |
| Metabolic health | ONB-A04 | `original/ONB-A04-metabolic-health.png` | `webp/ONB-A04-metabolic-health-{384,768,1536}.webp` |
| Weight management | ONB-A05 | `original/ONB-A05-weight-management.png` | `webp/ONB-A05-weight-management-{384,768,1536}.webp` |
| Athletic performance | ONB-A06 | `original/ONB-A06-athletic-performance.png` | `webp/ONB-A06-athletic-performance-{384,768,1536}.webp` |

## Architectural contract

1. These are **editorial card media**, not SVG goal glyphs and not interactive form artwork. Keep pending SVG requests ONB-A01–A06 distinct until icons are independently approved or reuse is signed off.
2. Source images must be imported by Codex into an Architect-approved image directory after verifying the SHA-256 manifest, with optimized WebP and appropriate responsive `srcset` / `sizes`. Do not fetch them from a chat link at runtime.
3. Preserve the **approved six titles**: Gut health; Longevity; General health; Metabolic health; Weight management; Athletic performance. The exploratory mockup's alternate goal taxonomy is **not** approved.
4. Keep DOM labels, semantic radiogroup, one required primary selection, checkmark, keyboard focus, contrast and an effective minimum 44px touch target. Continue remains disabled until a primary goal is selected. No text, numbers or button functionality are encoded in photographs.
5. Ensure subject survives a cover crop on desktop card (~3:2/landscape) and mobile row. Test width 320/390/768/1440 and Everyday/Athlete, Light/Dark, 200% text zoom. Avoid hiding subjects behind dynamic titles. Offer a plain color/image-free fallback.
6. Images are conceptual CG biological and athletic artwork, **not** microscopy, clinical measurements, user-specific health status or proof of outcomes. The adipose graphic is non-diagnostic and must not stigmatize body composition.
7. Architect reconciles the original onboarding handoff `docs/agent-handoffs/Bloom_User_Review_Onboarding_Handoff_2026-11-21.md`, the UX review and the current implementation model. Runtime and user testing are separate pending acceptance gates.

## Registration

`design/visual-system/ASSET_REQUEST_REGISTRY.md` contains the owner approval note and crosswalk. Media are **delivered as raster artwork**; no original pending icon request is implicitly completed. Image source archive is in Shared Library, not yet committed as image binaries to GitHub.

**Next:** Architect/Codex import and placement; mobile/desktop actual-render QA; design approval of assembled interactive screen; mark integrated/verified only after completion.
