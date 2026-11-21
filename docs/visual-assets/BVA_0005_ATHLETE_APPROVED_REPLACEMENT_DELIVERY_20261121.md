# BVA-0005 — Athlete approved hero asset (2026-11-21)

**Owner decision:** Approved a premium, photorealistic rear three-quarter trail runner on a rugged mountain-forest trail, with cool navy-blue left text space, natural sunrise and distant misty alpine scenery. This is an **editorial concept**, not a recorded training session or a claim about a user's fitness.

**Delivered archive:** Shared Library `/Bloom gut health/Agent Handoffs/Bloom_BVA_0005_Athlete_Approved_2026-11-21.zip`. It contains original `BVA-0005-athlete-source.png` (1672×941), desktop WebP at widths 1672/1200/800, two mobile portrait WebP crops (768×1024, 576×1024), README, SHA-256 manifest. ZIP CRC/integrity verified.

**Runtime implementation contract:** Keep existing `client/src/content/editorial-media.ts` slot `athlete` and original `/images/editorial/heroes/bloom-athlete-mountains.webp` bound until new assets are imported and validated. Reuse existing registry ID `BVA-0005`, do not create duplicate. Import new first-party optimized files, verify sha and rights, retain original asset as rollback, integrate via shared hero, preserve precise Athlete blue tokens (light and dark) and live DOM controls. This is design approval/delivery only, not integration or production approval.

**Mobile:** The portrait crops preserve the runner's subject, but do **not** preserve the dark blue left-third text-safe area from desktop. Use a separate text region or a tested overlay gradient; verify heading/actions readable at 320,390px and do not place critical controls over the runner. Check tablet 768 and desktop 1440, 200% zoom, keyboard, screen reader, performance, reduced motion, fallback and balanced crop.

**Review gates:** No fabricated workout metrics or implied user activity. Athlete posture and outdoor scene are decorative; verify visual/scientific appropriateness, rights/provenance and rendered accessibility as separate gates. Record exact app SHA/screenshots before marking INTEGRATED/VERIFIED.

**Next registry inspection:** BVA-0006 is the **Progress botanical accent** (not a full hero); the existing three-leaf sprig should be reused if fit-for-purpose rather than creating a duplicate. A dedicated Progress page hero already exists under `BVA-0021` as generated art and is a different review item.
