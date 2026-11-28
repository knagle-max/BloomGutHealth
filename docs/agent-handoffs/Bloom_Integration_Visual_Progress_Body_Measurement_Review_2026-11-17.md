# Bloom — Visual Progress & Body Measurement Intelligence: Integrations & Data implementation review

**Document ID:** INT-VPA-20261117-R1  
**Date:** 2026-11-17  
**To:** Chief Architect & Integration Lead (cc Developer/Codex, Science/Biology, AI/ML, Security, Legal, UX, User Testing)  
**Disposition:** **APPROVE STAGED DESIGN WITH CONCRETE SOURCE/STORAGE/LIFECYCLE AMENDMENTS. NOT AN IMPLEMENTATION OR RELEASE APPROVAL.**

## 1. Scope, sources and evidence

Reviewed exact Shared Library handoffs `Bloom_ML_Visual_Progress_Body_Measurement_Review_2026-11-17.md` (`ML-VPA-20261117-R1`) and `Bloom_Visual_Progress_Anthropometry_Science_Implementation_Handoff_2026-11-17.md` (`BIO-VPA-20261117-R1`). Existing controlling science scope VPA-01–08, 28 tests and AI amendments ML-VPA-2401–2408 are preserved, not replaced.

Read-only repository inspection: `knagle-max/BloomGutHealth` branch `enhance/bloom-experience` at **`6a0eb527f63688879cced48462598b1792338084`** (moving branch, not frozen release), including `shared/measurement-entry.ts`, `shared/profile-measurement-source.ts`, `server/profile-measurement-source.ts`, `client/src/pages/Progress.tsx`, `server/account-export.ts`, `server/account-erasure.ts`, `shared/schema.ts`, `docs/operations/BODY_TRAINING_GOALS.md`, `docs/operations/PROFILE_MEASUREMENT_SOURCE.md`, `client/src/components/DevelopmentPhotoPreview.tsx` and `docs/operations/LAB_IMAGE_FILE_CONTRACT.md`. No application execution, live blob-store test or model accuracy validation was performed. Do not treat inspection as hosted sign-off.

## 2. Existing capability versus development gaps

| Existing and reusable | Evidence | Missing for VPA |
|---|---|---|
| Canonical profile height/weight with original unit tokens and revision safety | `shared/measurement-entry.ts`, `shared/profile-measurement-source.ts`, `server/profile-measurement-source.ts` | User-recorded site-specific circumference provenance, side, tape protocol, repeated dates and correction ledger; **do not overwrite Profile's current values to represent history** |
| Dated check-in waist/body-fat source values and Progress display | `client/src/pages/Progress.tsx` reads `waistCm`, `bodyFatPercent` with missing values as null; `BODY_TRAINING_GOALS.md` points to existing dated entry | Distinguish manual tape / BIA / DXA / experimental photo estimate and site protocol; reject unsupported cross-method trend comparisons |
| Account-scoped structured export and active database erasure | `server/account-export.ts` and `server/account-erasure.ts` | Sensitive binary image export, private object deletion, derivative/thumbnail deletion, orphan cleanup, URL revocation and backup retention; no image storage path presently shown |
| Local image workflows | `DevelopmentPhotoPreview.tsx` = local-only **synthetic food** image; `LAB_IMAGE_FILE_CONTRACT.md` = lab image OCR with memory-only original | Neither is a body photo uploader or persistence service; new private media lifecycle is needed if photographs are stored |
| General source revisions, authenticated records, account boundaries | Existing Bloom source contracts | Owner-scoped photo/photo-set records, derivative lineage, user consent purpose, invalidation, idempotent uploads and storage identity |

**Status:** No complete body-photo repository, model-backed centimeter estimator, authorized shared-training pipeline, or verified hosted photo lifecycle demonstrated. Existing photo preview must not be marketed as these features.

## 3. Specific integration/code requirements recommended to Architect

### INT-VPA-01 — Source-of-truth mapping, no second body ledger (P0 prerequisite)
**Change:** Reuse dated canonical body measurement observations for independently user-recorded weight/waist/site measurements, preserving original unit and source method. Add only missing attributes to canonical observation/revision schema: `bodySite`, `side`, `siteProtocolVersion`, `sourceKind` (e.g. manual-tape, smart-scale estimate, DXA-source, model-proposal), `observedAt`, `recordedAt`, `sourceRevision`, `measurementUncertainty` and optional `linkedPhotoSetId`. Keep Profile display values separate from historical point measurements. Allow per-site identity *and* procedure variation to forbid false longitudinal joins.  
**Acceptance:** Weight, waist tape, BIA body-fat and photo silhouette do not silently merge or replace one another; manual 34 in ⇄ 86.36 cm preserves original token, correction and unit; same-site differing measurement protocols shown separately/qualified. No numerical model suggestion saved as user tape without explicit actual-measurement assertion.

### INT-VPA-02 — Private blob infrastructure choice and metadata threat model (P0 / Stage A activation gate)
**Change:** Verify whether existing connected Render/Neon object storage or another already-approved private storage facility actually supports encrypted binary blobs and authorized expiring downloads. **Do not put raw body images into public assets, repo, logs, analytics, the Food image path, ordinary CDN or a PostgreSQL JSON field.** If no suitable currently authorized private object storage exists, Architect may assign the minimal private-media adapter and storage resources with a narrowly scoped cost/security decision. Preserve tenant ownership in PostgreSQL object metadata; server resolves storage access, no client-chosen object keys. Default canonical stored image is orientation-corrected, metadata-stripped (GPS/location eliminated) unwarped photo; no persistently stored unredacted EXIF original by default. Strip metadata before any external transfer/storage; document local browser/OS and provider backup exposure.  
**Acceptance:** Inspect actual persisted photo/object bytes and HTTP metadata; signed URLs short-lived, non-indexed and scoped; unauthenticated/foreign user access blocked; resize/derivative files also stripped; EXIF GPS and device identifiers absent from default stored files; object bytes not in logs.

### INT-VPA-03 — Two-phase or saga-consistent upload/asset lifecycle (P0)
**Change:** New minimally scoped `PhotoMediaAsset` metadata and upload/commit/delete routes can use existing Express auth/owner and Neon DB. Storage writes and DB commits are not atomic: reserve upload receipt with idempotency token, bounded size/type/dimensions, owner, purpose and lifecycle (`pending`, `ready`, `failed`, `deleting`); upload privately; validate canonical bytes and object ownership; finalize `ready` via guarded transaction; reconcile stale reservations/orphans. Idempotent retry never duplicates assets. Do not use a cross-account/global photo hash as a visible dedup key or leakage oracle; optional per-account private content comparison only.  
**Acceptance:** Abort at each stage, duplicate retry, wrong MIME/magic, oversized/decompression bomb, storage outage, post-upload crash, concurrent account erasure; no visible broken/foreign asset, no unbounded orphan accumulation, no false success.

### INT-VPA-04 — Authenticated media access, caching and exports (P0)
**Change:** Owned media retrieval via short-lived capability token or server streamed authorization, with no public object URLs. Responses `Cache-Control: private, no-store` where suitable, correct `Vary`/no cross-user CDN cache, limited image format, revoked access after consent/account change. Distinct export manifest lists canonical stored originals, photosets, measurement observations, revision dates, site/method and accessible corresponding binaries. Current JSON export size cap must not silently discard photos; use bounded packaged/streamed export or a documented safe alternate without weakening auth.  
**Acceptance:** A/B two-account lookup, expired signed URL, logout/switch, account deletion, browser back/cache and export without foreign/stray derived files; no missing photo source silently represented as complete export.

### INT-VPA-05 — Consent and source-revision dependent deletion (P0)
**Change:** Reuse existing consent infrastructure but separate purpose-specific grants for **private storage**, **local image analysis**, **optional server inference**, **within-account calibration**, **future shared training** (default denied). No shared-training upload before separate owner, Legal and Security authority. Version link `PhotoSet→OriginalAsset→ComparablePair→Crop/Thumbnail/Segmentation→ModelProposal→CorrectedObservation` and checked revisions. On revoke or delete: deny access immediately, make dependent comparisons/models stale, cancel queued work, asynchronously erase owned objects/derivatives with verifiable reconciliation/retention. Never resurrect deleted results from late jobs; old photos are not automatically deleted when only inference consent is revoked, unless user chooses deletion.  
**Acceptance:** Revoke during upload, derivative generation, account switching and export; independent review of storage, backups and logs; historical manual tape readings remain intact when a comparison photo is withdrawn unless explicitly source-dependent.

### INT-VPA-06 — Capture/protocol identity and image-space scientific boundary (P1 Stage A/B)
**Change:** Store explicit view, capture protocol, camera/orientation, left/right site, clothing/occlusion/pose-quality flags and user override. Match before/after only within documented compatibility; never rescale/stretch body geometry to create apparent change. Optical landmark, silhouette, camera and user-tape measurements remain distinct **different evidence classes**. Wrong lens, zoom, position, pose, clothing and lighting produce conditional comparison/not-comparable, not centimeters.  
**Acceptance:** Incompatible same-person pairs abstain from quantified change, still allow manual side-by-side where appropriate; duplicate identical image at different dates cannot become progress.

### INT-VPA-07 — Calibration label integrity and model job transport (P1 Advanced)
**Change:** Use typed provenance from ML-VPA-2404: proposed estimate, accepted unmeasured suggestion, visual adjustment, actual user tape with site protocol and independently measured reference. No accepted suggestion or rounded correction becomes reference truth. Any local model cache is account scoped; any optional Python/server model receives only minimal specifically consented inputs and uses approved private processing path, job versions, bounded size/CPU/latency, output claim tier and a fail-closed unsupported state. Recheck account consent/source revision before publishing. No automatic photo-to-fat/muscle/circumference or treatment actions.  
**Acceptance:** A user accepting the same estimate repeatedly does not increase measured sample count; erroneous tape correction invalidates calibration; 502/Python down leaves photos and manual readings working; no outbound raw images without explicit permitted purpose.

### INT-VPA-08 — Source-aware Progress and deletion resilience (P1)
**Change:** Hook photo journal and site-based manual measurements into existing Progress/Athlete/Everyday navigation, not another standalone identity/score engine. Comparison details show exact dates, units, capture conditions, method, source revision, reference and `unknown` where unavailable; planned/calculated/proposed never treated as measured. Cache invalidation after source edit only affects dependent visual comparisons.  
**Acceptance:** Manual-only user retains accessible Progress trend; editing photo timestamp updates pair timeline and dependent comparison but not unrelated weight/exercise; deleted photo never appears in Today card or public/share screenshot.

## 4. Suggested code-map / minimum Codex delta (illustrative, Architect selects)

**Reuse** `shared/measurement-entry.ts` (unit parsing), `shared/profile-measurement-source.ts`, canonical `precisionRecords`/experience observation flow as appropriate, source-revision and consent contracts, `client/src/pages/Progress.tsx`, account export/erasure services and existing auth/rate limits. **Do not** use `client/src/components/DevelopmentPhotoPreview.tsx` as body-photo persistence or borrow `LAB_IMAGE_FILE_CONTRACT.md` promise of memory-only processing for persistent photo uploads.

**Potential scoped modules, only if mapping confirms no existing equivalent:**
- `shared/body-measurement-provenance.ts`: site and source method enums, revision-safe view models, conversions and unknown rules; integrate rather than duplicate existing `measurement-entry`.
- `shared/progress-photo-contract.ts`: strict photo-set and private media metadata DTOs, allowed image types/bytes/dimensions, view/session, derivation and separate permission purposes.
- `server/progress-photo-routes.ts` and `server/progress-photo-storage.ts`: owner-bound, rate/size limited reserve/upload/confirm/list/compare/delete, idempotent commit and object storage adapter.
- SQL migration only for genuinely new media/asset/derivative metadata; FK owner, unique(owner,idempotency), referential integrity, deletion queue/receipt; binary media stored in reviewed private object storage.
- `client/src/components/ProgressPhotoCapture.tsx`, `ProgressPhotoComparison.tsx`: accessible optional capture, manual controls, explicit local sanitization and saved-state errors; integrate into existing Progress and Athlete.
- `server/account-export.ts` / `server/account-erasure.ts` augment binary asset export and staged deletion, including correct retention disclosures.
- Existing source/job invalidation and optional Python research adapter extend only after Stage A; do not create new image-AI orchestration service.

## 5. Minimum phase order

1. **Architect inventory and privacy decision:** map current schema and choose an actual authorized private blob solution/retention policy; do not switch on sensitive photo storage by UI toggle alone.
2. **Stage A useful value:** optional private photo + manual measurements + owner-safe export/deletion + accessible side-by-side nonwarped compare. Keep food #12 and report-wide Response #15 higher priority.
3. **Stage B bounded local QA:** standardized framing/posture, optional on-device pose/silhouette feasibility benchmarks, no photo-derived cm.
4. **Stage C reference model research:** per-site blinded measurements, subject/device/time-disjoint longitudinal benchmarks and predeclared thresholds, typed training labels and safe abstention.
5. **Stage D account-spanning training:** remains unauthorized; no inference that ordinary picture consent includes contributing private imagery to collective learning.

## 6. Cross-specialist gates and test matrix

**Integrations:** source/ownership/units/version/export/erasure/provider failure, blob connector and signed-URL audit. **Science:** exact tape protocol and any measurement-derived claims. **AI/ML:** pose inference reproducibility and longitudinal delta accuracy. **Security/Legal:** privacy, sensitive images, hosting and retention, separate training consent, minors and bystanders. **UX/UT:** mobile physical camera, accessibility, wellbeing and user understanding. **Architect:** canonical backlog reconciliation, narrow release audience/mode/territory; **Codex:** code and test, no direct specialist implementation mandate.

Tests mapped to Science 28 + ML-VPA 2401–08 include: 2 users and foreign URL denial; EXIF leak; upload partial failure; historical body trend source preservation; mismatched anatomical tape site; image no-scale refusal; compare changed lens/posture/clothes; metadata and image delete/export; offline/AI provider failure; review of accepted AI suggestions versus actual tape; privacy revocation race; source correction and delayed job publishing; repeat capture/delta error model benchmark; zero automatic fat%, muscle or treatment inference; same-device real iPhone/Android and 320/390/200% accessibility; zero cross-user training. Record exact commit, deployment, fixture, provider/storage configuration (redacted), expected vs actual, outcome and limitation independently.

## 7. Final disposition

**APPROVE Stage A specification and data contracts subject to privacy/hosted-storage activation review.** P0 integration work is choosing and verifying private media storage and end-to-end lifecycle rather than procuring an image model. Stage B/C are conditional advanced work, Stage D requires new explicit owner/Legal/Security approval. Current implementation status: **no verified persistent VPA media pipeline, object-store end-to-end deletion/export or validated anthropometric model**. No code was changed in this review. These are proposed implementation deltas for Architect reconciliation, not developer instructions or public activation rights.