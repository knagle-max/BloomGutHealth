# BLOOM — Visual Progress, Assisted Anthropometry & Privacy-Governed Learning
## Full Science & Biology implementation and cross-agent handoff

**Date:** 2026-11-17 (America/Regina)  
**Document ID:** BIO-VPA-20261117-R1  
**Status:** Science & Biology proposal: **APPROVE staged design with explicit validation and privacy gates**. Not deployed, technically accepted, clinically validated, or authorized for cross-user training.  
**To:** Chief Architect & Integration Lead; Codex/Developer; AI Intelligence & Personalization; Integrations & Data; Security & Privacy; Legal & Regulatory; Product/UX; User Testing; Athlete/Exercise Science (if assigned).  
**Owner intent:** Athlete has a rich optional progress-photo and AI-assisted measurement experience; Everyday has a low-friction private progress-photo and comparison experience. AI proposes measurements; users can correct them. Personal corrections may improve the person's own estimates; future opt-in, appropriately governed collective learning could improve broader model performance. **No harmful experimentation, forced tracking, chatbot, automatic clinical inference, or implicit training consent.**

---

## 1. Executive decision and full desired experience

**Build the practical feature now in stages, but do not claim arbitrary photos give reliable centimetres, regional muscle growth, or exact body-fat %.** Computer vision can help with repeatable capture, landmarks, silhouettes, alignment, and visible shape change. Validated multi-view body modelling may eventually estimate certain body circumferences; ordinary 2D images alone do not provide an absolute physical scale, and pose/silhouette changes are confounded by camera, clothing, lighting, posture, hydration and measurement location. Models must abstain where acquisition or evidence is inadequate.

**Everyday experience:** optional encrypted photo journal; easy guided front/side photos; aligned, private side-by-side or slider comparisons; optional waist/hip tape entry and body weight; date, posture/quality notices, and succinct qualified observations (e.g. *'Your waist outline appears different across these photos; camera alignment is imperfect'*), with no unsolicited body-fat rating or attractiveness judgement. Maximum value with minimal burden, never a compulsory daily task.

**Athlete experience:** optional front/side/back capture series; baseline/reference matching; region-by-region visual comparisons (shoulders, upper arms, torso/waist, hips, thighs, calves) with confidence and view conditions; optional manual tape measurements and weights; ML-assisted *draft circumference estimates* **only if the exact algorithm and protocol pass measurement-specific validation**; one-tap accept/correct/reject; charts alongside actual exercise and nutrition records; no claim of muscle hypertrophy from photographs alone. Include left/right where view and landmarks support it; do not force symmetry judgements.

**Learning:** (A) local account-private calibration/correction reuse; (B) offline research on synthetic, licensed/reference, or separately approved opt-in data; (C) future account-spanning global model improvement **only after a distinct consent, independent security/legal, population model evaluation and owner/Architect release decision**. Neither an adjusted number nor 'accept AI suggestion' is automatically reliable ground truth. Typed training labels must preserve whether measured with a tape by a user, independently measured by a professional, or edited from an AI suggestion.

---

## 2. Scientific feasibility and evidence review (what is and is not measurable)

| Output | Scientific feasibility | Initial public scope | Critical restriction |
|---|---|---|---|
| Timestamped photos, user annotations, manual waist/hip/arm/thigh measurements | High feasibility | Core/private | Source attribution, units, method, edits, secure storage |
| Standardized pose quality, framing, body landmarks, silhouettes | Feasible with on-device pose/segmentation pipelines | Core or staged opt-in | Landmark score ≠ anthropometric accuracy; quality/fallback |
| Aligned before/after visual inspection | Feasible if the user approves cropping/alignment | Core/private | Preserve originals; no physically rescaled body shape to fake improvement |
| Relative visual silhouette/width change within similarly captured photos | Possible, quality-conditional | Athlete pilot only | Prefer qualitative/relative, never assert cm without calibration |
| Estimated waist/hip/arm/thigh circumference in cm | Demonstrated in some validated multi-view systems, but algorithm/protocol specific | Research/internal testing until validated | No simple 'pixels to cm' formula; validate landmark definitions, hardware, clothing, body diversity and test–retest |
| Absolute body-fat %, lean mass, muscle growth by region | Some 2D body-fat research exists; validation and longitudinal sensitivity vary | **Do not release as unvalidated progress-photo measurement** | Body appearance does not isolate muscle from fat, water, posture and lighting |
| Health diagnosis, edema/skin-condition detection, medical risk from photo | Not the requested use | Excluded | Needs distinct clinical/regulatory authorization |

**Empirical findings:** A 2024 comparison of phone photogrammetric methods found strong repeatability in controlled scanning but varying segmental errors (PMID 38454153). A study comparing 3D smartphone-derived circumferences to tape found waist mean absolute error approximately **3.4 cm** under its specific protocol (PMID 39619052): high correlation does not make individual errors trivial. A 2025 systematic review of 13 studies concluded smartphone-based anthropometry is promising but requires standardized acquisition, stronger validation, and accuracy assessment. Image-based body-fat approaches can correlate with DXA, but their error/transportability must be established in the target population and repeated-measurement setting. One controlled environmental agreement study identified much worse performance with a black-background condition, emphasizing acquisition quality. Full source URLs appear in §17.

**Key geometry:** Pose landmark models output relative joint locations; they do not establish true waist circumference, upper-arm girth, muscle fibre area, or a reliable metric 3D mesh from a single unrestricted photo. A camera-to-person distance, focal length, user height, or generic anthropometric prior is not independently sufficient to remove all ambiguities. Any fitted 3D or multi-view approach requires calibration/protocol and empirical error characterization.

**Terminology:** 'Visible size/shape change' = measured appearance under specified acquisition. 'Circumference estimate' = model-derived anthropometric estimate. 'Tape measurement' = user-reported measured outcome. 'Muscle gain' = physiological interpretation needing corroborating evidence; never inferred directly from photos.

---

## 3. Capture workflow and acquisition contract

**Optional onboarding:** explain privacy and purpose succinctly; offer `Skip`, `Manual measurements only`, `Save photos without AI`, or `Capture with AI assistance`. Do not use a broad default-on 'Improve AI for everyone' checkbox. No nudity requested; recommend ordinary fitted sportswear or non-revealing clothing. Product policy: adults only for ML body estimation pending age-appropriate safeguarding review; never invite intimate images, children, or nonconsenting bystanders; reject/locally mask accidental other persons, and offer immediate delete.

**Capture protocol (fast):** front neutral stance; Athlete may add left/right side and back; Everyday can start with two views or a single private photograph. Show real-time simple overlays for shoulders, feet, neutral arm position, phone height and distance consistency. Encourage same camera orientation/zoom, shoes, similar clothing, even lighting, plain background, and consistent time of day *where practical*; do not reject normal photos from private journaling just because they are not comparable for measurements. Optional weekly/monthly reminder opt-in, never daily body-image pressure.

**Before computation:** on-device EXIF stripping (GPS), orientation normalization while preserving raw source and a capture metadata record, multi-person/low-light/cropping/occlusion detection, pose match score, background segmentation, perspective/camera checks, and user confirmation. Prefer *a quality warning and fallback comparison* to synthetic numeric output. Local-only quality models should not upload frames to optional third-party AI without separate explicit provider disclosure and consent.

**Photo operations:** crop/rotate on derived preview only; no beautification, slimming, warping, or generative retouching; before/after sliders use unchanged image content and honest alignment indication. Do not alter the subject's geometry to equalize silhouettes.

---

## 4. Measurement taxonomy and correction hierarchy

Every value must have `measurementKind` and `provenance` (example values):

1. `manual_tape_user_reported` — entered actual tape reading with site-specific instructions; not assumed clinically accurate.
2. `manual_professional_reference` — separately documented qualified trained reference measurement, with method and consent, if legitimately provided.
3. `ai_estimate_research_only` — draft model estimate with model/protocol version, validation range and uncertainty; no default clinical use.
4. `ai_estimate_user_confirmed` — the user accepted the AI proposal; **not** independently verified.
5. `ai_estimate_user_corrected` — the user adjusted it; label is *self-reported correction*, not reference truth.
6. `pixel_or_ratio_change_derived` — comparable-view image-space feature, conditional only.
7. `unknown` / `not_comparable` — no result rather than an invented zero.

Store proposed value and edited value separately, and the editable site definition: e.g. natural waist vs navel vs narrowest waist are **not interchangeable**; flexed upper arm vs relaxed is not comparable; circumference values can be left/right but never assume symmetry. Record unit, body side, measurement posture, date, device, scale reference if any, image IDs, analysis eligibility, and confidence/interval (empirically calibrated only).

**User correction UX:** preview 'Suggested: 91 cm — experimental estimate' only if validated for the intended scope; options `Use`, `Edit`, `Measured with tape`, `Not accurate`, `Skip`; correction prompt asks whether an actual tape measurement was made. If the feature has not passed validation, let AI suggest **which locations to measure** and guide tape placement, not arbitrary numerical centimetres. Save edited data without requiring approval of AI. If AI prediction is unavailable, manual measure and private photo journaling function normally.

**Feedback selection bias:** People correct only some suggestions, may anchor on the prediction, use different sites/tape tension, or enter rounded guesses. This is 'human feedback', not gold-standard ground truth. Machine-learning training must separate raw AI response, typed correction, measured-with-tape evidence, user-reported uncertainty, and professional reference; include no correction as *unlabelled*, never as a confirmed accurate estimate. Use correction distribution primarily for interface debugging/calibration unless independent validation establishes training utility.

---

## 5. Privacy boundaries and account ownership

**Photos are sensitive personal health/body imagery and potentially identifying.** Do not copy them into common analytics, crash reports, CDN logs, training corpora, library files or generic prompt histories. Face cropped/masked by default where it is not necessary; users can retain full personal originals privately if they knowingly choose. EXIF GPS removed; thumbnails cannot leak content from another user. Original photos, crops, masks, pose vectors, 3D estimates and even embeddings/measurement corrections require separate sensitivity classification and purpose limitation.

- Explicit user activation for private photo storage; granular choice to run optional local AI; separate affirmative informed consent for any cloud provider transfer, specifying provider, data and retention.
- Default: **no cross-user training**; data held per account with encryption at rest and transit, scoped opaque object keys, short-lived signed upload/download URLs, MIME/magic-byte validation, file-size caps, malware/content sanitization, auth and owner checks on every API access, no public bucket exposure, no directory listing.
- Revocation, delete and export must address original/derived photos, region masks, model outputs, annotations, pending jobs, thumbnails, backups and cached objects. Define truthful retention and backup-erasure timeline; avoid promising instant cryptographic deletion where impossible. No photos in exported account JSON; provide separate authenticated media export package or manifest when appropriate and tell the user exactly what's included.
- Prevent leaks through image metadata, URL prefetch, browser/OS caches, browser analytics, model telemetry and exception traces; watermark external debug/reference images as *synthetic only*.
- Local first for pose, quality and personal calibration; cloud inference is not essential to usable feature.
- **Do not reuse existing privacy settings, internal-tester experimental toggle or standard app consent as permission to train a shared model.**

**Cross-user privacy decision:** `PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md` approves Track A within-account learning and defers Track B shared training pending independent consent, Security, Legal, owner and governance. This handoff explicitly preserves that decision. Research architecture may be built and run on synthetic/licensed/public-reference material now. If future opt-in approved, protect against memorization, extraction, membership inference and gradient leakage. Federated learning is not automatically anonymous; secure aggregation/differential privacy and their utility costs require real threat modeling and evaluation.

---

## 6. Cross-user learning plan (user-requested expansion, not automatically authorized)

**Level 0: baseline models** — license/validate published/on-device pose segmentation and use independently collected, legitimately usable reference measurements. Record model and dataset licence/rights, intended audience, hardware/measurement applicability and known subgroup gaps in existing AI scientific model registry.

**Level 1: per-user personal improvement** — keep calibrations and corrections inside the account: consistent-camera baseline, repeated landmark placement, individual calibration where the person enters genuine tape data. Update private models/rules cautiously with minimum evidence, reversible model state, test–retest monitoring and provenance. Do not train from self-corrections as if they were ground truth.

**Level 2: opt-in contribution design** — separate UI purpose: *'Help improve measurement accuracy for future Bloom users'*; consent is default OFF, independent of core feature, revocable for future use, not bundled with cloud inference. Allow contributing **verified measurements + minimized derived features** separately from **raw photographs**; raw image contribution is a higher-risk, separate opt-in and may be prohibited by policy. No user-to-user access.

**Level 3: restricted offline model improvement** — auditable consent/versioned cohort eligibility; restrict purposes and jurisdictions; validation-grade labels (tape measurements, site protocol, independently audited references) weighted appropriately; disallow child imagery, incidental third-party images, unknown rights. Separate model training environment, short retention, secure aggregation/privacy-enhancing techniques where justified, anti-memorization/red-team checks and retention review. No public training launch without approved gates.

**Level 4: model promotion** — independently evaluated against prior frozen version, external holdout, diverse body proportions/skin tones/ages where approved, devices, lighting, clothing, mobility, and individual longitudinal performance. Compare calibration, median/95th percentile absolute error, bias, repeatability/least-detectable-change, false-change claim rate, abstention, outlier safety and fairness. Check that edited/accepted predictions have not leaked into test labels; person-level and time-level leakage prevention. Rollback, shadow validation, and post-release error monitoring. **Approved model versions** only may run for real users.

**Consent withdrawal:** remove future contribution access, retract unused queued contributions, enforce declared retraining/unlearning policy where feasible, transparently explain limits for already-aggregated or previously trained model weights; never promise perfect retroactive model unlearning without technical proof.

**Critical product boundary:** user feedback may safely improve feasibility and preferences cross-functionally in privacy-preserving ways only after the relevant purpose and lawful data governance approval; photo corrections cannot automatically update individual nutrition or biological effect models as though an image proves fat or muscle change.

---

## 7. ML/computer vision technical architecture (candidate, not acceptance)

Pipeline: `capture → private encrypted source/metadata → on-device quality/pose/segmentation → source/version-conditioned per-user comparison → optional validated anthropometry estimate → review/edit → private observation → existing Athlete/Everyday/Progress references → future governed training eligibility`.

Candidate components:
- Browser/PWA: MediaPipe Pose Landmarker 33-landmark model for framing, pose and quality, plus suitable person segmentation (verify licence/performance/platform in model registry). MediaPipe 'world' coordinates must not be misrepresented as a validated cm tape measure.
- Future native SwiftUI: Apple Vision human pose 2D/3D and person segmentation where available; model decisions remain shared at API/data-contract layer. Follow existing owner decision that SwiftUI is late v0.6, not a blocker to web/PWA work.
- Fixed-rule geometric comparison within matched views; robust image registration and segmentation outlines; always show **image comparability qualification** and avoid body-warping.
- Numerically calibrated circumference inference: separate research adapter, fixed approved capture protocol (multi-view preferred), calibration input, fit against tape/3D reference datasets, per-site error bounds and quality-dependent abstention; disabled for normal users until passing cohort-relevant validation.
- Foundation/vision-language models may assist neutral description or QA where independently audited; must **not** hallucinate circumference values, fat %, medical findings, or regional muscle changes. Non-image deterministic manual entry must survive model outage.

Methods and exact limitations are versioned per body site and use case; a model approved for waist cannot silently serve biceps or body fat. Avoid making scale-dependent outputs when no physical scale and clinically valid statistical calibration is available.

---

## 8. Data model and immutable source handling

Extend existing canonical body observations, source revisions, ownership and feedback receipts. **No second conflicting body measurement ledger.** Proposed typed entities (field names illustrative; Architect map to existing schema):

`ProgressPhotoSet`: `id, ownerId, mode[everyday|athlete], capturedAt, recordedAt, consentPurposeVersion, encryptedSourceIds[], views[], poseQuality, cameraProtocol, reportSourceVersion, deletedAt`.

`PhotoMediaAsset`: `id, ownerId, privateStorageKey, contentHash, dimensions, orientation, view[front|left_side|right_side|back|other], exifStripped, derivativeOf?, encryptionKeyVersion, retentionClass`.

`AnthropometryObservation`: `id, ownerId, bodySite, side?, siteDefinition, value?, unit, observedAt, sourceKind, aiProposalId?, correctedFrom?, method, posture, confidence? [validated], status[recorded|unknown|unverified|retracted], sourceVersion, provenance, lastUpdatedAt`.

`VisualComparison`: `id, ownerId, earlierPhotoSetVersion, laterPhotoSetVersion, comparable, disqualifiers[], regions[], findingClass[descriptive|uncertain], exactImageAlgorithmVersion, notCausal=true, generatedAt, invalidatedAt?`.

`InferenceReceipt`: `modelName, modelVersion, modelRegistryId, protocolVersion, inputSourceVersionHashes, outputTypedKind, outputValue?, calibrationVersion?, abstentionReason?, uncertaintySource, operationId, computationCost`.

`MeasurementCorrection`: `observationId, modelProposal, userEntry, correctionSource[tape|visual_guess|unspecified], siteProtocol, optionalTapePhoto? [not default], correctionTimestamp, dataUseConsentId?, immutableRevision`. No automatic overwriting of proposed values.

`ModelTrainingConsent`: distinct purpose + future contribution data classes; `consentGivenAt, version, withdrawnAt`, no broad override. `TrainingEligibilityReceipt`: data minimization, lineage, grant, rights and withdrawal state, never stored as if already authorized.

**Do not create tables blindly.** Architect/Integrations first map fields onto `Progress`, canonical body observation storage, uploads/storage strategy, account export/erasure and source revision semantics; add only missing fields and APIs. Existing image paths for Food and Lab are not presumed to be reusable storage permission.

---

## 9. Athlete and Everyday UX / screen specification

**Everyday → Progress → Photos** (entry point optional): simple `Add a photo` CTA; first-time secure disclosure; take/select; private dated timeline; simple two-photo comparison, optional *'Measure waist manually'* and body weight link. Avoid before/after numerical judgement, weight-loss gamification, required photo prompts, and unsolicited images on Today. Let user hide the section entirely.

**Athlete → Body Progress**: multi-view session tiles; capture guide; side-by-side slider; measurements (manual confirmed clearly distinguished from modeled); optional body region progress labels like 'upper-arm circumference: 33.0 → 33.8 cm (user tape, same method)' but no causal declaration of gained muscle; training volume, strength, protein, weight plots shown as independent context only. Front/back/side images and chosen focus regions are accessible, with original unedited view available.

**Explain uncertainty inline:**
- `Photo added` — source observation.
- `Photos are comparable enough for visual inspection` — protocol assessment, not verified anatomy.
- `Outline appears different; perspective may contribute` — image-space inference.
- `Waist 86 cm (entered by you, measured with tape)` — user-reported measurement.
- `Waist 86 cm (AI estimate; experimental; not verified)` — restricted research label only.
- `Your arms grew 1.8 cm of muscle` — **prohibited** without specifically validated outcome evidence; photograph cannot identify tissue.

One-tap corrections, keyboard and screen-reader access, high zoom/mobile, non-gendered respectful wording, left/right labels, re-order photo dates, undo delete, dark/light mode. Users can avoid displaying their body photo in any Today card or shared screenshot. No social network, face recognition or attractiveness/fitness scoring.

**Wellbeing:** do not give unsolicited aesthetic ratings, 'problem areas', eating-disorder reinforcement, exaggerated change claims or compulsive frequency nudges. Provide privacy controls and an option to turn off comparisons/measurements while retaining photos. Never auto-recommend harmful energy deficits or training changes from shape alone.

---

## 10. Connection to nutrition, training, and autonomous biological intelligence

Photo/body observations can enrich an existing longitudinal progress view as **another measurement source**. They must not override or be merged with weight, bioimpedance body-fat, DXA, training performance, calorie/protein data, or laboratory results as if all measure the same thing.

Candidate insight: `User-recorded waist tape measurements trend lower; training logs show strength remains stable; nutrition logs are incomplete.` Eligible phrasing: *'Your recorded waist measurements decreased while these workouts remained stable. Nutrition coverage is incomplete, so Bloom can't say what caused the change.'* Never: *'Your nutrition caused 2 kg fat loss'* or *'Your image proves you've gained muscle'.*

Cross-functional feedback can improve user-prioritized capture schedule, preferred measurements and coaching feasibility **within the account**. Photo analysis cannot bypass wellness action eligibility, allergy protection, medical restrictions or competing goals. No additional experimental response model or duplicative evidence graph.

---

## 11. Release stages and exit criteria

### Stage A — Private photo journal and manual measurements (v0.6 Advanced/nonblocking if feasible; not required to delay frozen Core)
- Store/compare photos securely; support consent, revisions, deletes, export; manual body circumference entries with site/units; optional capture quality aid.
- No numerical AI anthropometry, fat % or tissue composition claims.
- End-to-end two-account isolation and storage threat-model review; on-device-quality baseline, no leakage to AI vendors; actual mobile and desktop test; privacy and security approvals before live sensitive photo storage.

### Stage B — Assisted visual analysis and private personal calibration (v0.7 / internal protected testing first)
- Validated posture/quality, silhouettes/relative comparison; AI suggests measurement **sites**, and, only if separately proven, quantitative draft results.
- Individual corrections/calibration with provenance typed; abstention when incompatible photos.
- Holdout test demonstrating repeatable differences beyond minimal detectable change; no unapproved body-fat or regional muscle estimates.

### Stage C — Verified AI anthropometry (advanced, feature-scoped)
- Exact model/site/protocol validated against independent tape/3D reference and against longitudinal repeated measurements, including relevant subpopulations; calibrate bounds and robust abstention. Separate decisions for waist, hip, arms, thighs.
- Subject-level split + repeated capture, reference data provenance, method-specific bias and limits of agreement, subgroup stratification. Do not declare fixed numerical error thresholds from unrelated publications; scientific team must set use-case-specific maximum error and false-change rate **before** looking at holdout results and independently approve them.

### Stage D — Governed global model learning (future, separately authorized)
- Independent opt-in and consent/withdrawal handling; Security/Legal purpose, rights and jurisdiction acceptance; audited dataset lineage; holdouts; model version approval/rollback; explicit sign-off before any cross-account personal-data use.
- No cross-user data access by regular app queries, super-user grants or experimental feature toggles.

**Priority:** Do not divert Codex from v0.6 Core practical Food #12 and full-panel Response #15; join existing v0.6 roadmap/dependency backlog and keep research work nonblocking.

---

## 12. Required acceptance fixtures and adversarial tests

**Data integrity & workflow:**
1. New user takes two dated photos and manual tape measurements; dates/units/source retained across device/relogin and export.
2. No camera permission, no compatible device, offline or model outage: manual and private photo workflows persist.
3. Source edited/replaced/deleted: all dependent comparisons, model estimates and thumbnails invalidated; unaffected original measurements preserved.
4. Multiple concurrent uploads/retry: idempotent one set, no orphan assets, no accidental cross-linking.
5. Missing photograph ≠ 'no change'; missing tape measurement ≠ zero; user edit ≠ measured with tape.
6. Mismatched clothing, zoom, distance, angle, obstructed waist, cropped limbs or unusual pose: quality assessment withholds numerical change and presents usable visual comparison where appropriate.
7. Two same-day photos with same person but altered posture/lighting: do not claim muscle gain or meaningful waist reduction.
8. Different bodies/sizes/skin tones, mobility devices/limb differences and clothing: out-of-domain detection, documented subgroup errors and safe abstention.
9. Same image uploaded twice under different dates: no fabricated progress; image hash deduplication without revealing any other account's hash.
10. Different photo modes: Everyday controls never expose Athlete-only model-derived experimental numbers without relevant eligibility.

**Measurement scientific validation:**
11. Photos without scale or validation: cannot output validated centimetres. A 33-joint pose model is not a circumference meter.
12. Waist and hip at differing anatomical sites: don't join series; show difference in protocol and abstain from trend.
13. Conflicting photo AI vs tape: retain both, label differently; do not overwrite tape; train only on eligible typed label.
14. AI suggestion accepted without tape: not gold-standard training label.
15. Repeated real tape measurements: estimate user-reported repeatability with proper site/measurement instructions; never assume perfect.
16. Study holdout person-level split; no frame/user/time leakage; compare to naive baseline and tape/3D reference, Bland–Altman bias/limits, MAE, 95th error, test–retest CV, smallest detectable change and false positive trend calls.
17. Region-body-fat output and regional muscle growth output intentionally fail release checks absent specifically validated capability.

**Security and population learning:**
18. User A cannot retrieve B original images, derived silhouette, signed URL, estimate, cache, or export; repeat across logout/switch and expired credentials.
19. Photo EXIF GPS/face leakage denied in provider upload, logs, analytics and backups per approved policy.
20. Training default OFF, active account training permitted only after independent future authorization; ordinary feature usage does not trigger global pipeline.
21. Consent withdrawn or account deleted during job: queued training stops, downstream lineage invalidation as feasible, honest model unlearning documentation.
22. Membership inference/model inversion/gradient attack evaluation against approved trained model; federated update privacy controls tested if used.
23. Robustness: adversarial labels, fabricated tape values, repeated biased corrections do not automatically poison shared models.
24. Cloud service down or disallowed: local and deterministic experiences continue without false cloud-success claim.

**UX and mental wellbeing:**
25. Keyboard/screen-reader/320px high-zoom tests, no forced body photography, no public image display, no aesthetic judgements or aggressive reminders.
26. User can remove only analysis but retain photos, or delete photos and all dependents; both paths behave as described.
27. Actual device capture checks iOS browser/mobile; future SwiftUI path separately tested.
28. No misleading clinical/disease association, prediction of body-fat % or treatment effectiveness from a photo.

**Gate standard:** every test has fixture ID, frozen model/commit SHA, screen/API run receipt, expected outputs, pass/fail/abstain, and reviewer. Distinguish synthetics from genuine held-out validation; no '100% accurate' label. Professional reference standard where appropriate, independent science acceptance and security/legal classifications remain separate.

---

## 13. Codex executable task order and concrete handoffs

**Codex + Architect first:** (i) map existing profile/body observations, AthleteWorkspace, Progress, account export, privacy/consent/versioned source model; (ii) inspect and choose private blob storage (do not claim implemented), on-device-only capture/pose and offline fallback; (iii) record exact current SHA and route/API files; (iv) issue bounded tasks in existing NEXT_ACTIONS and V06 dependency backlog rather than new parallel roadmap.

**Task VPA-01:** source/consent and storage threat model + object lifecycle; source archive with versioned corrections and no accidental metadata leakage. Exit: tests 1–5, 18–20, 26.

**VPA-02:** Everyday photo journal, manual measurements and cross-device access. Exit: tested happy/negative UI, permissions, 320px, cache isolation, photo delete/export; no AI metric claims.

**VPA-03:** Athlete multipose capture and comparisons, manual region measurement workflow; integrate existing training/nutrition contextual charts with separate provenance. Exit: photos comparable/withheld appropriately; no quantified muscle/fat claims.

**VPA-04:** on-device pose/segmentation and acquisition QA in internal testing; record licence/version/device compatibility and quality thresholds. Exit: held-out capture QA errors, safe fallback and privacy.

**VPA-05:** typed AI suggestions/corrections, local personal calibration only where supported, reproducibility dashboard for validation. Exit: typed verified vs corrected vs accepted evidence and all user-edit adversarial tests.

**VPA-06:** isolated research adapter for multi-view circumference estimate per body site, offline reference dataset validation and precommitted thresholds. Exit: independently reviewed metrics; no public activation merely from code delivery.

**VPA-07:** optional opt-in collective-learning research design, data lineage, rights/consent, de-identification/threat modeling, model monitoring and rollback. **No live cross-account training without independent owner/Legal/Security authorization.**

**VPA-08:** full feature-specific scientific/ML/privacy/UX review and integrated actual app verification; Architect controls capability versioned authorization and development preview, production held to existing gates. Save evidence to current delivery ledger, not a duplicate.

---

## 14. Cross-agent decisions requested

- **Chief Architect:** reconcile to v0.6 Core/Advanced and v0.7; preserve owner build-first doctrine, existing source/correction/consent/account, canonical body records, SwiftUI late; settle storage/data route and single capability ledger; ensure photo work does not preempt Food/Response.
- **Science & Biology:** approve measurement site definitions, evidence taxonomy, error tolerances, interpretation templates and longitudinal repeatability; prohibit unsupported body-composition claims. Scientific pass does not license general medical claims.
- **AI/ML:** choose low-cost/locally usable segmentation/pose; evaluate training-label quality, per-account calibration, out-of-domain abstention, held-out external validation, body/dataset fairness, attack resilience and nonleaky model versioning.
- **Security & Privacy:** data-protection impact assessment; sensitive imagery, role/account isolation, encryption, object URLs, cache/privacy/erasure; independent explicit-consent design; cross-user learning threat model.
- **Legal & Regulatory:** intended-use/wellness boundary in Canada/other territories, any medical-device implications, privacy/biometric classifications, image/model licences, sensitive-photo training and opt-in rights; independent review before user-facing estimates and shared training.
- **UX / Branding:** premium nonjudgmental photo experience, efficient optional capture, transparent provenance, accessibility and visible distinction between photo vs actual tape measurement; avoid pressuring body surveillance.
- **Integrations & Data:** schema mapping to canonical body measurement source, exports, source revision and secure object lifecycle; protect data differences across camera vs tape vs BIA vs DXA.
- **User Testing:** ordinary-user usability, photo-comparison comprehension, edits, consent clarity and real-device accessibility, wellbeing and social-pressure testing.
- **Codex:** sole technical implementer, source-anchored code/test receipts, feature-scoped staged rollout, independent approvals before sensitive execution, no new model/consent platform.

---

## 15. Definition of success / truth-in-release

A person chooses to add progress photos. Bloom stores them privately, lets them compare consistent views and enter their own measurements, optionally suggests measurement sites, and never invents anatomical centimetres or body-fat loss. In Athlete mode, a person can observe multiple body regions with their workout and nutrition history. If validated measurement technology is later available, the app presents a draft clearly labelled estimate with its uncertainty; users can correct it or report an actual tape reading. Corrections improve *their own* experience first. Future global improvements require a distinct opt-in and independently authorized, scientifically validated training system. Photo-derived change remains an observation, never proof of nutritional or exercise causation.

**Acceptance must discriminate:** source-recording ≠ visual comparison ≠ measured circumference ≠ estimated circumference ≠ regional muscle gain ≠ clinically meaningful outcome. The product can legitimately ship the first two while the rest remain restricted.

---

## 16. Alignment to existing architecture and authority

Reviewed repository sources on `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience` (working version moving; no frozen SHA specified):
- `ATHLETE_EXPERIENCE.md` — distinct Everyday/Athlete modes; Athlete sessions and fueling.
- `docs/operations/BODY_TRAINING_GOALS.md` — dated canonical body measurement flow; explicitly no inferred body-fat/training recommendation from it.
- `docs/architecture/V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md` — Core useful without special ML, Advanced feature-gated; Food #12 and full-panel Response #15 priority.
- `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md` — account-private Track A permitted, pooled Track B not authorized without independent gates.
- `docs/operations/V06_DEPENDENCY_BACKLOG.md` — November 15 build-first owner override and integrated RC policy; no serial pre-development approval treadmill.

**This is a complete science specification, not an assertion these photo features or storage architecture exist today.** Architect must verify exact current implementation and deployment when converting to Codex tasks.

---

## 17. References (retrieved 2026-11-17)

1. Shitara et al. (2024), *Mobile phone applications for 3-dimensional scanning and digital anthropometry: a precision comparison with traditional scanners*, European Journal of Clinical Nutrition. https://pubmed.ncbi.nlm.nih.gov/38454153/ ; https://www.nature.com/articles/s41430-024-01424-w
2. *Smartphone and tablet-based 3D scanner for anthropometric assessments in adults: systematic review of reliability, validity, and accuracy* (2025), 13 eligible studies. https://pmc.ncbi.nlm.nih.gov/articles/PMC12797699/
3. *Beyond Body Mass Index: Accurate Metabolic Disease-Risk Phenotyping With 3D Smartphone Application* (2024/2025). https://pubmed.ncbi.nlm.nih.gov/39619052/
4. *Development and validation of an accurate smartphone application for measuring waist-to-hip circumference ratio* (2023). https://pubmed.ncbi.nlm.nih.gov/37696899/
5. *Agreement of anthropometric and body composition measures predicted from 2D smartphone images and body impedance scales with criterion methods* (2022). https://pubmed.ncbi.nlm.nih.gov/35094958/
6. *Smartphone camera based assessment of adiposity: a validation study* (2022). https://www.nature.com/articles/s41746-022-00628-3
7. *Advances in the estimation of body fat percentage using an artificial intelligence 2D-photo method* (2024/2025). https://www.nature.com/articles/s41746-024-01380-6
8. *Body composition estimates using a 2D image analysis system across different environmental conditions: an agreement study* (2024). https://pubmed.ncbi.nlm.nih.gov/38282462/
9. Google MediaPipe Pose Landmarker, 33 landmarks and estimated pose/world output. https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
10. Apple Vision, human 3D pose detection. https://developer.apple.com/documentation/vision/identifying-3d-human-body-poses-in-images
11. Office of Privacy Commissioner of Canada, biometric privacy and express consent guidance. https://www.priv.gc.ca/en/privacy-topics/health-information-genetics-biometrics/biometrics/bio-tips_org/ ; https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_consent/
12. Health Canada, Software as a Medical Device definition and classification. https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/guidance-documents/software-medical-device-guidance-document.html
13. FDA, General Wellness Policy for Low Risk Devices (January 2026). https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
14. Biomedical AI privacy review, gradient leakage and other federated learning privacy caveats. https://pmc.ncbi.nlm.nih.gov/articles/PMC13527024/
15. Recent 2026 multi-view validation on photogrammetry (research; no immediate Bloom approval). https://pubmed.ncbi.nlm.nih.gov/42884343/

**Citation note:** Published accuracy depends on the particular algorithm, training population, capture method, and reference standard. It cannot be borrowed to certify a future Bloom model.