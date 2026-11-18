# Bloom — AI Visual Progress, Assisted Anthropometry & Privacy-Governed Body Measurement Intelligence

**Chief Architect & Integration Lead — Consolidated implementation decision**  
**Date:** 2026-11-17  
**Disposition:** **APPROVE STAGED PRODUCT/DEVELOPMENT DESIGN WITH BINDING PRIVACY, SOURCE, VALIDATION AND ACTIVATION GATES.** This document is not production authorization, model approval, proof of private photo storage, or permission to train a shared model.  
**Implementation:** Codex on `enhance/bloom-experience` under `AGENTS.md` and `NEXT_ACTIONS.md` (no parallel task queue).  
**Original source handoffs reviewed directly:**
- Biology/Science: `Bloom_Visual_Progress_Anthropometry_Science_Implementation_Handoff_2026-11-17.md`, **BIO-VPA-20261117-R1**, 317 lines, 17 sections, VPA-01–08 and **28 adversarial acceptance cases**.
- AI/ML: `Bloom_ML_Visual_Progress_Body_Measurement_Review_2026-11-17.md`, **ML-VPA-20261117-R1**, 67 lines, **ML-VPA-2401–2408**.
- Integrations/Data: `Bloom_Integration_Visual_Progress_Body_Measurement_Review_2026-11-17.md`, **INT-VPA-20261117-R1**, 89 lines, **INT-VPA-01–08**.
Preserve full specialist source documents as governing, cross-linked requirements; this reconciliation is an implementable decision and does not replace their detailed tests, study references, original definitions or complete measurement taxonomy. Source body is accessible in Bloom shared project Library; Codex must be provided exact readable copies if its environment cannot read that Library. Do not infer access from this file alone.

## 1. Executive architecture decision

The desirable experience is **a voluntary, private visual progress journal with honest body measurements**, with feature-specific richness across modes:

**Everyday:** Optional photo journal; quick front/side images (or one personal photo); clear dates; unwarped side-by-side/slider visual comparisons; optional manual weight/tape inputs. No daily/photo burden, judgment of appearance or mandatory AI.

**Athlete:** Optional front/side/back series, standardized view/capture instructions, region selection (shoulders, upper arms, torso/waist, hips, thighs, calves), side-specific tape protocols, source-linked strength/training, nutrition and scale context. AI may guide **capture consistency**, not declare individual tissue changes. Do not enforce symmetry judgments.

**Learning:** Account-private user defaults and correctly typed tape-calibrated methods only when supported. User acceptance of a suggestion, edits or unmeasured visual guesses do **not** create objective ground truth. Future global training remains **OFF** absent distinct owner, independent Security/Legal and validated scientific governance approval.

**Not in early public scope:** numerical image-derived circumference in cm, absolute body fat, regional muscle gain, disease/edema/skin diagnosis, recovery/calorie/diet recommendations inferred from photos, public/social sharing, facial identification, attractiveness scoring, pressure for frequent images.

A photo is a *visual record*. A measured tape circumference is a *user-reported physical observation* (or a legitimate qualified reference if independently documented). Pixel/silhouette changes are only **conditional image-space comparisons**. A generated numerical estimate is a **model output**, not measured physiology. The app must always distinguish these.

## 2. Source audit and canonical reuse — current branch evidence

Read-only repository inspection (moving branch, not a frozen runtime audit) confirmed:
- `shared/measurement-entry.ts`: source-preserving height/mass/circumference unit entry/conversion; **do not reimplement conversions**.
- `shared/profile-measurement-source.ts`, `server/profile-measurement-source.ts`, `docs/operations/PROFILE_MEASUREMENT_SOURCE.md`: encrypted Profile current height/weight source tokens and revisions. **Current Profile values are not an historical body measurement ledger.**
- `client/src/pages/Progress.tsx`: dated check-in `waistCm`, `bodyFatPercent` with null/unknown handling, separate activity/training history, existing source-bound navigation. **These do not validate body composition or photo-derived circumference.**
- `docs/operations/BODY_TRAINING_GOALS.md`: body/training goal links to canonical dated measurement and activity workflows; no body-fat/muscle inference.
- `server/account-export.ts`, `server/account-erasure.ts`: current account-owned structured JSON export/erasure; current export cap and erasure handling do not demonstrate a secure **binary** photo archive, complete media export, derivative cleanup or backup-retention closure.
- `client/src/components/DevelopmentPhotoPreview.tsx` is a local synthetic **food** photo preview. `docs/operations/LAB_IMAGE_FILE_CONTRACT.md` is a distinct lab-image workflow. **Neither is a consented persistent body-photo service.**
- Existing authenticated observations, account ownership, source revisions and the [approved private-vs-population learning boundary](PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md) are the correct authority.
- `BLOOM_SCIENTIFIC_COMPUTING_INFRASTRUCTURE_ARCHITECT_DECISION_20261116.md` applies to any future background photo/derived analysis with retries, leases, version fencing, scoped dependencies and recheck-before-publish.

**Not proven:** Persistent private photo object storage, binary media export/erasure, end-to-end hosted photo lifecycle, objective body-circumference AI validation, approved shared-user training or deployed VPA UI. Integrations' source audit was at `6a0eb527f63688879cced48462598b1792338084`; inspect latest HEAD and actual exact-sha tests before implementation. Do not replace existing Progress/measurement records or count old code as new feature completion.

## 3. Clinical/scientific capability classes

| Scientific output | Stage | Required interpretation / prohibition |
|---|---|---|
| Timestamped original content-preserving sanitized photo, user notes, manual tape and weight | Stage A | Canonical record, origin, unit, anatomical site, protocol, side, date/revision |
| Side-by-side/slider original-image comparison | Stage A | Neutral visual inspection; no body warping, trimming body shape or invented change |
| Local capture guidance, pose landmarks, segmentation and quality flags | Stage B | Acquisition QA only, not measurement accuracy |
| Comparable-view silhouette or pixel-ratio observation | Stage B protected pilot | Only quality-conditional relative image-space conclusion; no cm/tissue inference |
| Circumference estimate (waist/hip/arm/thigh) | Stage C offline research; public activation only after site-specific validation | Multi-view/protocol/hardware/population/longitudinal validation, empirical uncertainty and abstention required |
| Body fat %, lean muscle, localized hypertrophy, exercise/nutrition cause, medical diagnosis | Excluded from currently authorized VPA release | Must have separate intended-use research, independent clinical/fitness outcome validation, legal/regulatory permission and owner decision |
| Shared cross-user models from private pictures/corrections | Stage D research plan only | Default OFF; distinct explicit purpose, data-class consent, rights, Security/Legal/owner release |

**Scientific limitations retained from BIO handoff:** Landmark model 'world' points are *not* validated circumference measurements. Height or camera distance alone does not guarantee metric scale from uncontrolled 2D images. Clothing, lighting, zoom, pose, lens, occlusion, hydration, viewpoint and anatomical tape-site definitions affect comparability. Published study correlations/MAE (including reported waist error ~3.4 cm in a specific protocol) cannot be adopted as Bloom's error guarantee. Body appearance does not isolate fat from muscle/water and cannot demonstrate exercise-induced growth. A user manually changing a number isn't proof they used a tape.

## 4. Canonical measurement and correction semantics — INT-VPA-01 / ML-VPA-2404

**No second body-data ledger.** Extend existing dated body observation/source and revision services only with absent site/source/protocol attributes. Keep current Profile height/weight separate from repeated dated observations.

Conceptual contract (adapt to existing shared schemas):
```ts
type BodyMeasurementProvenance =
  | "manual_tape_user_reported"
  | "manual_professional_reference" // only when actually documented
  | "smart_scale_or_bia_source_estimate"
  | "dxa_source_observation"        // appropriate region and validation
  | "ai_estimate_research_only"
  | "ai_estimate_user_confirmed"    // acceptance ≠ independent measure
  | "ai_estimate_user_corrected"    // edited ≠ measured with tape
  | "pixel_or_ratio_change_derived"
  | "unknown" | "not_comparable";
type BodySiteProtocol = {
  site: "waist" | "hip" | "upper_arm" | "thigh" | "calf" | string;
  side: "left" | "right" | "midline" | "not_applicable";
  landmarkMethodId: string;         // e.g. waist-at-navel vs narrowest-waist
  postureAndTensionProtocol: string | null;
  protocolVersion: string;
};
type ReviewedBodyMeasure = {
  sourceObservationId: string | null; // separate source vs candidate identity
  sourceRevision: string | null;
  observedAt: string;
  origin: BodyMeasurementProvenance;
  siteProtocol: BodySiteProtocol | null;
  value: number | null; unit: string | null;
  originalEntry: string | null;     // source unit/lexical precision
  linkedPhotoSetId: string | null;
  modelId: string | null;
  methodVersion: string | null;
  assumptions: string[];
  eligibility: "source" | "research-only" | "not-comparable" | "unknown";
};
```

**More precise learning labels** `model_suggestion`, `accepted_without_measurement`, `user_visual_adjustment`, `user_reported_tape_with_site_protocol`, `independently_observed_reference`; preserve displayed estimate, edit order/time, correction purpose and model/source revisions separately. Never relabel accepted or corrected predictions as measured. A tape reading measured at navel is not intrinsically comparable to narrowest-waist measurements; flexed arm is not relaxed arm. Where no comparable site protocol is available, show discrete observations/unknown rather than a joined trend. Unit example: an actual 34-inch tape entry converts to 86.36 cm while retaining source `34 in`, not a newly generated measured record.

## 5. Private photo capture/storage — INT-VPA-02/03/04; ML-VPA-2401/2406

**First executable prerequisite is a private object lifecycle, not a computer vision model.** Verify whether existing approved Neon/Render media storage can safely provide private per-user encrypted binary objects. If none, design **one** narrow private-media adapter and only the minimal necessary paid/storage resources subject to ordinary cost/privacy gates; do not place health photos in `public/`, Github, generic web image path, food preview/OCR components, generic CDN, unencrypted URLs, analytics, log output, provider prompt histories, or PostgreSQL JSON blobs.

**Corrected source-photo decision (ML amendment supersedes BIO wording):** Strip location/device-sensitive EXIF **before persistent storage/external transfer**. Store sanitized orientation-corrected **unwarped** photo as canonical private image. Preserve *visual content and source provenance*, not a GPS-bearing camera-original file. No unsanitized original by default. If future opt-in raw EXIF originals are ever considered, they need distinct disclosure/purpose/scope/retention protections. EXIF-free/face-mask does **not** imply anonymity.

**Minimum data and object lifecycle:**
- Authenticated owner-scoped photo session/set, canonical asset and derivative records with source revisions, purpose and capture protocol. Use server-selected opaque IDs/paths; no caller-derived owner or public bucket.
- Upload reservation with idempotency key, size/type/dimension/magic-byte validation, decompression limits, malware/content safety, state `pending → ready | failed | deleting` and bounded retries/reconciliation of orphan objects, upload crash or account erasure race.
- Store private canonical sanitized source; derive only per-purpose thumbnail/crop/mask/segmentation and expire/revoke these when source invalid. No warped/cosmetically altered source content.
- Every viewing/downloading/export is authenticated/owner-permitted and scope-rechecked. Short-lived signed URLs or server streaming, proper `Cache-Control: private, no-store` and no cross-account caching. Reject foreign-account object/thumbnail/estimate/URL including via logout and identity switch.
- Separate encrypted/private binary export with accurate manifest (photo sets, source files, linked measured observations, revisions, data classes, missing objects) rather than silently discarding media from current capped JSON account export.
- Erasure/withdrawal: revoke access immediately, invalidate dependent comparison/estimate and queued work, reconcile asynchronous owned object/derivative deletion, document backups and vendor retention accurately. Revoking *analysis* alone need not delete personal photos if the user retains photo-storage permission.
- Consent purposes remain distinct: photo storage, local quality analysis, any server/cloud inference, per-account calibration, and **future pooled training** (off). No raw photos to a remote model without specific consent and licensed processing terms.

**Enablement gate:** Secure media storage must be reviewed and tested in an authorized isolated environment; writing a UI plus placeholder object URLs is not functional acceptance or permission to store real personal images. No private sensitive image processing outside existing lawful intended use and approved hosting.

## 6. Capture and comparison — INT-VPA-06 / ML-VPA-2402

Optional choices: `Skip`, `Manual measures only`, `Private photos (no AI)`, `Capture with local guidance`. Adults-only **numeric model experiments** pending safeguarded minors review; never request nudity, minors or incidental nonconsenting persons. Recommend ordinary fitted sportswear or comfortable non-revealing clothing. Optional reminder only, never pressure/compulsive daily body checks.

For each photo, record actual time and view (front/side/back), orientation/zoom/lens where available, pose/landmarks quality, lighting, clothing/occlusion flags, user-selected comparison baseline, and source revision. Local-first capture guidance on phone screen (head/shoulder/foot framing, neutral arms, posture, phone height/distance) should make photos **more repeatable**, not make ordinary journaling require rigorous lab-standard photos.

**Comparability decision** checks view, pose, perspective, framing, clothing, occlusion and segmentation confidence. Quality problems can disable automatic numeric comparison while retaining ordinary manual side-by-side. Never alter person's geometry by resizing body outline or creating artificial improvement; alignment/cropping only where not misleading, and users can inspect originals. Identical duplicate photos at different dates must not generate progress. One-time or two-photo comparisons are not proven physiological tissue changes.

Suggested neutral labels:
- `Photo added` — source captured.
- `Photos are comparable enough for visual inspection` — quality assessment, not measured circumference.
- `Outline looks different; perspective may contribute` — qualified visual observation.
- `Waist 86 cm — entered by you (tape)` — user report of tape measurement.
- `Waist 86 cm — AI experimental estimate` — research-only, not general UI until validated.
- **Never:** `Your arms gained 1.8 cm of muscle` from photos alone.

**AI models for capture QA:** benchmark locally licensed pose/segmentation (e.g. MediaPipe) against simple manual guides on real supported iPhone Safari/Android/desktop. Evaluate size/network download, cold/warm latency, memory/battery, platform/WASM/GPU failures and accessibility. A specific model choice is not mandated by these handoffs; don't build paid cloud CV to get photo journaling working.

## Owner-requested live camera framing assistance — explicit UX requirement (2026-11-17)

**Approved as Stage A capture assistance with Stage B optional local AI quality improvement.** On supported devices the Progress photo capture flow should open the camera with explicit user action and show a **live, non-destructive overlay** on the preview: head/feet safe boundaries, approximate body outline, shoulder/hip centreline, horizon/camera tilt, appropriate front/side/back stance indicator and a visible photo countdown/manual shutter. Optionally overlay a faint pose/framing guide derived from the user's own selected prior photo, **not an actual body-transformed image**. This feature is about repeatable capture, not quantified clinical/body composition inference.

- **Camera API:** First attempt secure-context browser camera capture (permission prompted by browser, relevant `getUserMedia` facing-mode support, video orientation and `playsInline` for mobile Safari); check current supported devices and permission denial behavior. Browser camera may require HTTPS, device support and explicit permissions. Provide reliable **Take photo / Upload existing photo / Manual measurements only / Cancel** alternatives. Do not claim the camera is active before permission. Never auto-open or auto-capture without a user gesture.
- **Overlay technique:** Draw overlay using accessible HTML/SVG or canvas above the live `<video>`, mapped through correct aspect, rotation, mirroring and CSS crop transformations. **Save the original sanitized camera frame without overlay strokes or face/body retouching**; derive metadata/thumbnail and guide-only pixels separately. Never physically warp a photographed person's silhouette to match the earlier baseline. Display simple neutral cues, not attractiveness or body-shape judgements.
- **Local optional AI:** Licensed, versioned on-device pose landmarks/segmentation may drive non-medical, real-time framing guidance: all body in frame, approximate neutral stance, relative subject position and proportion, hands/feet visibility, blur/lighting, camera roll, overlay deviation from previous capture. Guard with support detection, latency/memory/thermal and age/privacy policy. Processing should default to on-device while live preview stays local. No video/image stream is sent to third-party LLM/CV or model vendor by default. Model's pose confidence is not circumference confidence; abstain when occluded or unsupported.
- **Reference matching:** If the user opts in, load a private previously captured *own-account* reference after authorization; use opacity-based **guides/landmarks** (rather than exposing earlier photo by default). Respect screen snapshots, permissions, privacy mode and preference to hide image content. No future photo assumed comparable merely because overlays align; capture lens, distance, viewpoint, clothing, posture and lighting qualify the resulting comparison. A person can skip matching and still save a private photo.
- **Touch-free options:** Optional 3–5 second countdown and cues using available sound/haptics or on-screen text, with permission/user preference. No dependence on haptics (web support varies) or continuous listening. Distinct accessible start/cancel/retake controls, large touch targets, speaker-free alternative and VoiceOver guidance.
- **Capture protocol:** Everyday quick front/side as optional, Athlete more structured front/side/back, selectable manual and without pose AI. Don't insist on strict lighting/background to *save* a private photo; comparability warnings affect advanced output, not journaling.
- **Security:** Camera tracks stopped on dismiss, capture, route/unmount/account change; no images or frames in log/analytics or generic browser caches; clean up GPU/video objects and refs; sanitized canonical photo only after explicitly confirming Save. Separate local-guide permission from image-storage and any optional server-inference permission. No background video or hidden training contribution.
- **Acceptance:** Real iOS Safari/mobile browser and supported desktop browser camera tests at 320/390/768/1024 CSS px; permission granted/denied/revoked; camera absent; rotate/portrait/landscape; front/rear camera switch; mirrored preview vs correctly oriented saved frame; weak light/one limb obscured; outline stays mapped to actual pixels; stop track on cancel; no overlay baked into saved original; optional prior-photo guide never exposes other account; slow/no local model gives manual guides and native camera/upload fallback; disabled motion/haptics, zoom, keyboard, screen reader; no photo upload before user consent and save; no numeric cm or fat/muscle claim triggered by matching silhouette.

**Release sequencing:** Deterministic static body-outline and capture UI can be part of Stage A **once private photo storage/consent is authorized**, without waiting for pose model research. Dynamic AI landmark hints are Stage B after device and license checks. If photo storage isn't ready, a safe local proof-of-concept can use synthetic fixtures, but must not falsely present a persisted capture. Do not interrupt Food #12 / Response #15 current priority for a speculative always-on computer-vision service.

## 7. Model/correction learning and validation — ML-VPA-2403/04/05/07

**Private learning only** from method-eligible comparable observations and truly typed user-reported tape or independent references. Keep observation ancestry and prevent self-training from own predictions, image-space ratios or confirmation clicks. User can separately reset personal calibration and derived output without erasing source photo; correction of tape label invalidates dependent personal parameters and results.

**Public numeric measurement gate is site-specific** (waist, hip, arm, thigh individually), capture-protocol-specific, device/population/longitudinal-specific, with independently blinded tape/3D reference. Pre-register thresholds **before** holdout. Test subject-disjoint, device and time split where feasible; site-specific MAE, 95th error, Bland–Altman bias/limits, test–retest repeatability/least detectable change, **delta error**, false-change alarm, coverage/abstention and fairness subgroups. Compare to manual measurement and an appropriate simple method. A cross-sectional model with high correlation does **not** demonstrate valid within-person change detection.

User interface must explicitly present proposals (where permitted), one-tap `Use/Edit/Measured with tape/Not accurate/Skip`, and record correction origin. Do not nudge acceptance of estimates or use edited values as verified labels. With absent scientific validation, AI may suggest **where/how to measure with a tape**, not numerical centimetres or fat percentage.

**Model registry and release:** reuse existing scientific AI model registry, licensing and method eligibility; Python stays an optional isolated numerical/research adapter with bounded jobs and prepublication consent/revision check. No second AI orchestration system, model registry, clinical scoring engine or synthetic anatomical inference pipeline authorized.

## 8. Integration with Progress / Athlete / Today and editorial standards

**Everyday Progress:** optional `Photos` entry; secure photo timeline; choose two private dates for nonwarped side-by-side/slider; manual waist/hip/site measures and weight with proper source and original units; user can hide the section and avoid any photos in Today cards or shared screenshot. Optional UI must work without models or cloud provider.

**Athlete Body Progress:** richer optional front/side/back series, manual region-specific measurements (including left/right), quality-informed regions, source-bound charts alongside existing completed workout and nutrition records *as separate context*. No training volume/protein correlation asserted to cause observed shape change. Never expose Athlete-only experimental numeric outputs in Everyday just because they share records.

**Privacy and wellbeing UX:** No appearance/attractiveness grades, 'problem areas', compulsory tracking, weight-loss gamification, unsolicited calories advice or sexualized photography. Maintain explicit deletion, reset, control of image visibility, non-gendered copy, 320/390 mobile, desktop layout, 200% zoom, keyboard and assistive technology.

**Visual identity:** Apply existing [Bloom application-wide visual DNA](BLOOM_APPLICATION_WIDE_VISUAL_DNA_AND_SELECTIVE_PRESERVATION_20261117.md), [shared page hero header](BLOOM_CANONICAL_PAGE_HERO_HEADER_STANDARD_20261117.md), [selective asset preservation](BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md) and [adaptive mobile/desktop](BLOOM_ADAPTIVE_MOBILE_DESKTOP_EXPERIENCE_ARCHITECT_DECISION_20261116.md). Preserve approved art/mode colours: Everyday botanical and Athlete blue. Never use private body photo as a page background/hero, marketing media, illustrative asset or design-reference fixture. If a new decorative hero is needed, create requested canonical asset registry placeholder; no actual photo used as brand decoration. Real user photos only in explicitly private, authenticated content surfaces. The feature's presentation may be elegant and editorial without duplicating Bloodwork or exposing sensitive media.

## 9. Alignment with existing architecture and release phasing

| Phase | Approved scope | Gate and schedule |
|---|---|---|
| **Stage A — v0.6 Advanced optional** | Private photo journal, secure owner-bound object lifecycle, manual site-specific measurements, original images, accessible side-by-side, full media export/delete and consent. Optional capture guide without fabricated science | **Not a Core dependency**; implement only when Food #12, Response #15 and current integrity/security task queue permit. Storage architecture, owner/EXIF, erasure and Privacy/Security validation required **before live photo storage** |
| **Stage B — v0.7 pilot** | Local pose/segmentation/quality and, if defensible, qualitative image-space observations, private pattern/correction workflow | Benchmarked real devices, compatible captures, adequate consent, abstention; no photo-derived cm |
| **Stage C — Advanced restricted** | Per-site photo circumference models, independently validated long-term change detection and honest model estimates | Science/ML per-protocol and Security/Legal sign-off **before** any public numeric inference |
| **Stage D — separately authorized future research** | Distinct consented contribution of minimized features, potentially raw images only under separate higher-risk permission | **OFF**; explicit owner + independent privacy/security/legal + science approval, valid rights, population bias and leakage checks; no implicit ordinary-account sharing |

Do **not** treat a rendered photo slider as fulfillment of AI anthropometry, or technical model availability as validation. No new paid vendor/service or persistent storage activation without approved infrastructure/privacy decision. No publication to main or use of production personal images authorized by architecture alone.

## 10. Consolidated backlog ID crosswalk and verification

**All original science tasks remain:** `VPA-01` storage/source/privacy threat model → `VPA-02` Everyday private photos/manual → `VPA-03` Athlete multipose/region UI → `VPA-04` on-device QA → `VPA-05` typed AI correction/private calibration → `VPA-06` limited research circumference per-site → `VPA-07` deferred pooled-learning design → `VPA-08` independent multidisciplinary review and actual implementation receipts.

**AI/ML amendments retained:** `ML-VPA-2401` metadata stripping before storage; `2402` honest comparisons; `2403` longitudinal per-site validation; `2404` feedback-label truth; `2405` local cost/capability; `2406` separate purposes/recheck and revoke; `2407` no appearance→biology inference; `2408` staged release and distinct evidence states.

**Integrations amendments retained:** `INT-VPA-01` canonical body measurement source; `02` private blob choice; `03` two-phase upload lifecycle; `04` scoped media access and binary export; `05` purpose/source-revision deletion; `06` capture/protocol identity; `07` calibration labels/transport; `08` Progress integration/erasure resilience.

**Preserve exact BIO acceptance fixtures 1–28**, grouped below for implementation reports; do not silently collapse or drop individual test IDs:

| Fixture IDs | Mandatory test cases |
|---|---|
| BIO-VPA-T01–T05 | Photo + actual tape record, offline/permission failures, revisions/deletion, concurrent upload idempotency, absent ≠ zero or user edit ≠ tape |
| BIO-VPA-T06–T10 | Clothing/lens/pose mismatch, posture/lighting fake change, body diversity and low-coverage abstention, duplicate image at new date, mode feature eligibility |
| BIO-VPA-T11–T17 | No-scale ≠ cm, site mismatch, AI vs tape preserved, accepted suggestion ≠ training truth, real repeated tape, subject-held-out longitudinal metrics, prohibition of body-fat/regional muscle numbers |
| BIO-VPA-T18–T24 | Foreign user image/URL/cache denial, EXIF/log leak, global training OFF, revoke/delete while job active, membership inference if a future model is ever trained, poisoned labels and provider outage |
| BIO-VPA-T25–T28 | Real accessible mobile & device capture, retain-photo/remove-analysis vs delete-all, native separate validation, no medical/treatment conclusions |

**Extra staged integration/ML tests:**
- Storage bytes really EXIF-stripped; thumbnail/object cache and export pathways consistent.
- Abort/crash at each reservation/upload/finalize/deletion stage; no orphan/foreign object visible; bounded cleanup.
- Account A vs B signed URL, cache, retries, logout/account switch, thumbnail generation and export.
- User tape actual protocol/site/time correction triggers exact downstream invalidation but unrelated training/logs unaffected.
- Late computation cannot republish a deleted photo/comparison or revive a withdrawn grant; source/consent/lease checks at publication.
- Real iOS Safari/Android camera capture, orientation and resource budget; no cloud data transfer without distinct consent.
- Separate source-original photo, image-space feature, user tape, AI proposal and correction models remain distinct in UI and source exports.
- Stage C holdouts: real *change-detection* error and subgroup error; freeze acceptance thresholds before holdouts; published study accuracy is not Bloom model validation.

**Release evidence required separately:** `SPECIFIED`, `CODE_PRESENT`, `ENGINEERING_TESTED`, `PRIVATE_STORAGE_HOSTED_AND_ISOLATED`, `USER_DEVICE_TESTED`, `SCIENTIFICALLY_VALIDATED_BY_SITE`, `SECURITY_PRIVACY_ACCEPTED`, `LEGAL_RIGHTS_CLEARED`, `OWNER_RELEASE_AUTHORIZED`, `PUBLICLY_ENABLED`. An untested stage must be `NOT_TESTED` or `BLOCKED`, never PASS. Record exact app/commit SHA, synthetic/reference fixtures, test output, provider and storage configuration excluding secrets, actual device and reviewer.

## 11. Engineering dependency decision and required team roles

**Architect:** minimal canonical source/consent/media integration and versioned phase authorization; maintain `NEXT_ACTIONS.md` priority.  
**Codex:** sole developer; inspect actual current branch plus migration/Render/Neon private blob capability before designing Stage A; implement bounded path and real tests, publish exact SHA/review branch/host receipts.  
**Integrations:** original units, site identity, source revision, orphan asset lifecycle, export/erasure and account isolation.  
**Security/Privacy:** sensitive photo purpose disclosure, retention, privacy threat model/DPIA, signed URL and cache leakage, child/bystander safeguards.  
**Legal/Regulatory:** rights/licence/jurisdiction/intended use and training consent before eligible releases.  
**Science/Biology:** tape/anatomical site comparability, human-reference validity, errors and prohibited inference.  
**ML:** device compatibility, pose output truth, longitudinal model quality and abstention.  
**UX/Brand & User Testing:** non-judgmental optional feature, rich compliant Everyday/Athlete visual language, real screenshot/device accessibility and user comprehension.

**Implementation map (only if existing equivalents absent):** `shared/body-measurement-provenance.ts`, `shared/progress-photo-contract.ts`, `server/progress-photo-routes.ts`, `server/progress-photo-storage.ts`, `client/src/components/ProgressPhotoCapture.tsx`, `ProgressPhotoComparison.tsx`, and narrowly extended `server/account-export.ts`/`server/account-erasure.ts`. These names are suggestions, **not** authorization to duplicate existing modules or stand up another source ledger. Add Postgres metadata schema only when truly needed, never raw images to JSON DB.

**Final governing standard:** People should be able to privately see their recorded progress and enter real body measurements without an AI model. Computer vision may help them capture and compare reliably. Reliable quantitative image estimates require a much stronger, site-specific longitudinal evidence and privacy standard than a visually impressive preview. Future shared learning is not approved by default.
