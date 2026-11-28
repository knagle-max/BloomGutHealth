# Muscle-map coverage audit and designer additions

Owner-requested audit of the original Stage1–3 BVA-0078/0079 assets, 2026-11-26. This updates those existing requirements; it is not a replacement anatomy system, generated artwork or a new clinical atlas. Preserve the approved body PNGs, masters and44 existing source paths. Current source has15 broad visual keys: nine in front, ten in back. “Not separate” below means **no independently identified selectable overlay**, not proof that the underlying shaded body image lacks the muscle.

## First batch: complete the useful superficial-area map

| Area | Current approved-source state | Designer action |
| --- | --- | --- |
| **Serratus anterior** | No independent key. The prior V3→V4 crosswalk bundles serratus with abdominal/oblique shapes under `core`; the Stage1–3 eight core paths do not identify their individual muscles. | First determine whether any existing lateral-rib paths accurately depict it. Separate/relabel if valid; otherwise supply distinct left/right serratus overlays along the lateral ribs. Do not rename the entire core as serratus. |
| **Anterior, middle/lateral and posterior deltoid portions** | All shoulder shapes share `shoulders`; portions are not distinguished. | Supply anatomically appropriate segmentation across front/back, with a lateral inset if the pose cannot show a portion accurately. Do not claim all portions are visible on one surface. |
| **Rectus abdominis versus external obliques** | Combined `core`, with several unlabeled subpaths. | Identify the existing paths accurately and separate the regions. Do not present deep internal oblique/transversus layers as visible surface muscle. |
| **Gluteus medius / lateral hip abductor area** | Generic `glutes` and `hips` do not identify it separately. | Add a distinct lateral-hip region where the pose supports it; keep separate from the main gluteal/buttock region. Gluteus minimus is deep and belongs in a separate explanatory layer if requested. |
| **Thigh adductor area** | `hips` historically combines adductor/hip-flexor concepts; no dedicated inner-thigh group. | Supply a clear medial-thigh region; do not substitute the lateral hip, quadriceps or gluteal patch. |
| **Anterior shin versus posterior calf** | Both views use `lower-legs`. | Retain any accurate existing paths but label/group front tibialis-anterior area separately from posterior calf. If finer calf detail is needed, distinguish gastrocnemius and the visible/deeper soleus relationship accurately. |
| **Anterior/lateral neck versus upper trapezius** | Historical `traps` vocabulary combines neck and trapezius. | Separate the superficial sternocleidomastoid/neck area from upper trapezius. Do not represent every neck structure as trapezius. |
| **Forearm flexor versus extensor areas** | Both views share `forearms`; no compartment distinction. | Provide appropriately oriented front/back area groups, retaining broad labels when individual muscles cannot be isolated. Brachioradialis is an optional further refinement, not required for a false precision score. |
| **Upper/middle/lower trapezius regions** | `traps` and `upper-back` overlap conceptually without reviewed subdivisions. | Reconcile rather than add overlapping duplicate coverage. Supply useful separate areas where anatomically supportable; do not turn path count into trained-muscle count. |

## Second batch: useful detail, not mandatory surface patches

| Area | Treatment |
| --- | --- |
| **Rotator cuff** — supraspinatus, infraspinatus, teres minor, subscapularis | A shoulder/scapular inset or explicitly identified deeper layer. A front/back skin silhouette cannot honestly show all four as exposed superficial patches. |
| **Rhomboid major/minor** | Separate explanatory/deeper layer beneath trapezius, rather than an overlapping surface patch silently counted twice. |
| **Iliopsoas / hip flexors** | Labelled cutaway/deeper anatomical context. Do not draw iliopsoas as a superficial outer-hip patch. |
| **Erector spinae region** | Review the existing `lower-back` shapes against the longer spinal extensor region before adding paths; do not claim all lumbar structures or a pain generator are identified. |
| **Tensor fasciae latae and fibularis/peroneal area** | Optional lateral hip/lower-leg refinements for a later running/movement-focused view; use a lateral inset when the original pose is insufficient. |

These optional detail suggestions are not additional active consumer subsystems or requests to generate assets automatically. Upper/lower pectoral portions, individual biceps/triceps heads and every hand/foot muscle are not first-batch requirements: their isolated exercise attribution would need more context than a broad body-area map supplies.

## Separate pain-location layer

Pain geography is a location of a reported experience, not identification of the tissue causing it. Review distinct elbow, wrist, ankle and flank targets against BVA-0087/0088 and the existing47-ID design manifest; do not treat a muscle overlay as a replacement. Preserve the existing V1 laterality/refinement findings. Diffuse/unlocalized locations remain text/list-only, never an invented body dot.

## Delivery contract

- Reuse the existing320×820 front/back coordinate system, pose and original body PNGs. Deliver additions as versioned editable transparent SVG overlays, with stable named paths and an explicit old→new path/group crosswalk. Do not overwrite approved original bytes or silently reassign existing IDs.
- Name actual subject-side left/right, view, muscle/group, superficial versus deeper layer, and any unresolved boundary. Verify orientation against the original pose, not merely screen position or suffixes.
- Keep deep layers/insets explicitly distinct from the surface figure; avoid false medical-atlas precision. Do not infer activation, injury, recovery, exercise participation or diagnosis from artwork.
- Preserve the muscle versus symptom interpretation layers and equivalent keyboard/list function. Small anatomical shapes may use adjacent44px list controls rather than enlarged inaccurate anatomy.
- Use original designer geometry and properly usable reference sources; do not copy restricted reference illustrations. Provide source/provenance, per-file SHA-256 and byte counts, viewBox, labels and anatomy-review notes. Engineering verification and independent scientific/design acceptance stay separate.

## Reference basis and scope

The structural audit uses the actual preserved `design/bloom/anatomy/stages-1-3/assets/bloom-neutral-front.svg` and `bloom-neutral-back.svg`, their generated exact-path index and the existing source crosswalk in `docs/agent-handoffs/BLOOM_ANATOMY_V3_AND_MUSCLE_MAP_PROTOTYPE_REVIEW_20261122.md` §8. No missing muscle geometry was guessed or generated.

Anatomical distinctions were checked against [OpenStax upper limb/shoulder](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs), [lower limb/hip](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs), [neck/back](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back), [abdominal wall](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax) and [NCBI Bookshelf sternocleidomastoid](https://www.ncbi.nlm.nih.gov/books/NBK532881/). These are references for factual checks, not imported artwork/text datasets, an independent review signoff or permission to copy those publishers' content. No external personal data or new paid resource is involved.
