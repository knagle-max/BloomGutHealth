# Bloom — Repeatable Progress Photography, Standard Pose Protocols & Prior-Photo Ghost Overlay

**Chief Architect approved additive implementation handoff**  
**Owner directive:** November 17, 2026  
**Priority:** P1 within the already approved Visual Progress / Body Measurement Intelligence feature; phase-specific under existing `NEXT_ACTIONS.md`, not a new Core prerequisite  
**Codex implementation branch:** `enhance/bloom-experience`  
**Parent decision:** [Visual Progress and Body Measurement Intelligence](BLOOM_VISUAL_PROGRESS_BODY_MEASUREMENT_INTELLIGENCE_ARCHITECT_DECISION_20261117.md)  
**Preserved full specialist sources:** `docs/agent-handoffs/Bloom_Visual_Progress_Anthropometry_Science_Implementation_Handoff_2026-11-17.md` (BIO-VPA-20261117-R1), `docs/agent-handoffs/Bloom_ML_Visual_Progress_Body_Measurement_Review_2026-11-17.md` (ML-VPA-20261117-R1), `docs/agent-handoffs/Bloom_Integration_Visual_Progress_Body_Measurement_Review_2026-11-17.md` (INT-VPA-20261117-R1).  
**Approval scope:** Implementation UX/capture contract only. This does not approve personal image storage before independent security/hosting verification, numeric anthropometry from photos, private photo upload to third-party AI, body-fat/muscle claims, or any pooled training.

## 1. Binding owner expectation

The user wants **a standard library of repeatable body poses** that makes progress pictures more comparable, and an **optional translucent overlay of their own previously saved matching-pose photo while taking the next one**. These are core user-facing features of assisted photo capture, not merely eventual model research.

Provide a high-quality, low-effort, **self-guided camera experience** on a phone. Opening the camera, placing body alignment guides, matching an earlier view, counting down and reviewing/saving the unaltered result should feel natural. The app must remain usable with no pose model and if a user wishes to record only manual measurements or private photos. Build with the approved Bloom editorial language and preserve Athlete blue/Everyday forest mode differences; existing shared backend/canonical artwork/Progress data must not be forked.

## 2. Stable, versioned pose library — deliberate defaults

The *pose identity and protocol version* are part of photo source metadata and later comparison criteria. Store canonical stable IDs independent of display labels. Initial minimal set:

| Stable pose ID | Everyday default | Athlete default | Capture instruction |
|---|---|---|---|
| `front-relaxed-v1` | Recommended | Required for selected standard series | Camera facing front; comfortable neutral stance; look forward; arms relaxed slightly off torso; shoulders not flexed; feet on floor markers |
| `side-relaxed-v1` | Recommended | Required for selected standard series | Consistent left OR right-facing side, explicitly recorded, hands naturally down, avoid twisting torso; match same side on later visits |
| `back-relaxed-v1` | Optional | Recommended for complete series | Facing away; relaxed shoulders/arms, naturally neutral stance; full head-to-foot framing |
| `custom-user-pose-v1` | Optional | Optional | User-defined explicit instruction and view, tracked as distinct protocol; do not silently join it to standard poses |

"Required" for an **Athlete complete standard photo series** means necessary for that *chosen series type*, **not mandatory to save an individual photo or use Bloom**. Users may take one photo, skip individual poses, disable capture guides, select manual-only or store without automated analysis. Do not impose gender-coded physique poses, flexing, symmetry assessments, aesthetic standards or normative body comparisons. Add posed/flexed views later only as separate opt-in, versioned protocols with clear comparability constraints; never compare relaxed and flexed views as identical.

**Per-pose reference template** includes `poseId`, `protocolVersion`, `view`, `side`, user-visible 1–2-step directions, front-camera mirroring policy, head/foot/shoulder guide placements, natural limb clearance, optional stance markers, comparable prior-photo selection criteria and accessibility text instructions. No hard-coded anthropometric measurements or "ideal posture" score.

## 3. Prior-photo ghost overlay — supported at initial guided-capture launch

**Core functionality:** Within a chosen pose, allow `Match previous`. Load only an explicitly owned, previously authorized image **of the same pose/version/view/side where applicable**, choose a specific previous session or most recent compatible reference, and display a transparent prior-photo overlay above live camera preview, with an opacity control and an immediate `Hide overlay`. This is optional and OFF by default for first use; remember the user's safe local preference without automatically revealing sensitive past images in a future session.

Prefer **two user-selectable display styles** using one source photo:
1. **Ghost photo:** faint prior photo at adjustable opacity, explicitly marked "Previous photo — guide only".
2. **Silhouette/landmark guide:** privacy-conservative outline or head/shoulder/hip/foot markers if a reviewed local source exists; a non-AI manually positioned guide remains available even without local segmentation.

**Never warp, stretch, narrow, enlarge, reshape or generatively edit the person's body** to make photos appear aligned. If only global preview registration (translation/rotation) is supported, clearly identify it as a *visual alignment aid* and do not imply medical/metric comparability. Full image content and ghost pixels are **not baked into saved photo**; save current clean sanitized camera frame as canonical source with distinct overlay/source IDs and capture flags. User can reveal the original prior photo separately through existing authenticated private media permissions, or disable prior-photo display.

**Camera alignment detail:** Preview and overlay must map to the same visible video coordinate system, accounting for `object-fit` crop, device-pixel ratio, orientation, portrait rotation, selected camera, lens zoom, and front-camera mirroring. The saved output should not be inadvertently mirrored or cropped without user confirmation. A guide that visually aligns while mapping to wrong saved pixels is a defect. Do not depend on image pixel position alone for circumference or causal interpretation.

**Privacy:** Prior-image bytes fetched only via owner-scoped authenticated private media flow, not cached in public URL/CDN, log, screenshots shared automatically, analytics, crash reporting or generative provider. Opacity and overlay interactions never cause uploads. Clear overlay state on logout/account switch/navigation, avoid leaking a prior person's photo when switching users, and stop live camera tracks on close/unmount/capture interruption.

## 4. Additional owner-value improvements — architect recommendations

### 4.1 Guided capture sequence (high priority, small effort)
- **Repeat the last session**: detect user's preferred standard pose set, start the same pose sequence and choose compatible last capture references. Not automatically repeat photographic content or create a measurement.
- **3–5-second timer** with visible countdown, cancel, retake, and accessible optional voice/audio/haptic cues where platform supports them. Sound and haptic must not be mandatory; avoid unprompted audio recording.
- **Simple equipment/setup coaching**: recommend fixed support/tripod/shelf and consistent camera height/distance, full body and same rear lens/zoom where possible; display a quick setup reminder rather than demanding a measured camera distance.
- **Pose checklist**: feet visible, relaxed arms, shoulders/hips relatively level, same front/side/back view, similar camera tilt and light. Offer neutral short cues; no body-type judgements.
- **Review before saving**: compare photo with selected reference in a reversible preview, choose Save, Retake or Discard; never silently post body photos to storage on capture.
- **Resume an incomplete set** only after authorized local/session state; show which views are saved, unsaved or skipped. An incomplete set is still a valid private photo journal.

### 4.2 Helpful capture quality, not false measurement (Stage B as justified)
- Add **local-only optional pose landmarks/segmentation**, blur/low-light/limb-crop warning and framing consistency checks, with method version and device fallback. Low-end and camera-denied states show static guides, import and manual measurement, not an error dead end.
- **Comparison quality status** can be `similar view`, `some differences`, `not suitable for automatic comparison`, with explainable reasons like lens/angle/coverage/pose. This is a *capture quality* assessment, **not a confidence score for measured fat, muscle, circumference or health**.
- **Session conditions note** is optional and brief: camera/lens type if safely available, lighting type, footwear, clothing category and pose deviations. Avoid intrusive or mandatory body/sex characteristics; these are comparability context, not biological observations.
- **Prior session reference control**: allow picking an approved *baseline date* rather than always comparing to yesterday, with retained reference revision; indicate when photo was deleted or no longer permitted. User can choose same-day repeat for setup rehearsal, but it must not be presented as elapsed biological change.
- **Manual tape measurement quick link** for waist/hip/arm/thigh using existing source unit and site-protocol controls. Can be completed without ever uploading/taking a photo. A manually measured tape value and a silhouette feature are distinct.

### 4.3 Optional, lower priority
- A neutral, user-opted reminder such as "Capture again in a few weeks" (no obsessive daily prompts, no appearance judgments); reminders should be opt-in, cancelable and mode-appropriate.
- Offline/local preview while camera is open, no implied persisted save or sync until private server upload confirmation.
- Comparable-pair selection suggestion based on **capture protocol** and genuine source compatibility, not automatically selecting the most flattering or improved appearance.
- A concise **what changed / what didn't** comparison containing only source-grounded measured tape values or observational text; never infer muscle gain, fat percentage, calorie deficit, exercise response or medical outcome from imagery alone.

## 5. Minimal code/API contract (illustrative; adapt to existing schema)

**Do not create duplicate camera services, progress measurement ledgers, asset registries, model registry or scientific claim engines.** Reuse current Progress/Athlete photo work and existing canonical source revisions, ownership, media permissions, original measurement handling and existing visual design tokens. Suggested types below are integration concepts only:

```ts
type CapturePoseSpec = {
  id: "front-relaxed-v1" | "side-relaxed-v1" | "back-relaxed-v1" | "custom-user-pose-v1";
  protocolVersion: number; // preserves revisable instructions
  view: "front" | "left-side" | "right-side" | "back" | "custom";
  instructions: string[];
  landmarkTemplateId: string | null; // static guide need not invoke AI
  accessibleDescription: string;
};
type GhostReference = {
  ownPhotoId: string;       // never resolved by another account's authorization
  sourceRevision: string;  // recheck on retrieval and before any derived save
  capturePoseId: CapturePoseSpec["id"];
  view: CapturePoseSpec["view"];
  capturedAt: string;
};
type CaptureAssistanceState = {
  pose: CapturePoseSpec;
  cameraStatus: "idle" | "permission-needed" | "live" | "denied" | "unsupported" | "stopped";
  guide: "static" | "ghost-photo" | "prior-outline" | "local-pose";
  overlayOpacity: number;   // display preference only; never image-source modification
  optionalPriorPhoto: GhostReference | null;
  feedback: Array<{ code: string; message: string; source: "static" | "on-device-quality" }>;
  photoSaveStatus: "not-captured" | "preview" | "saving" | "saved" | "error";
};
```

**Important precision:** `side-relaxed-v1` **must also store actual side orientation**; side pose identity by itself is not enough to compare left with right. Source session metadata stores original camera session, actual acquisition source/time, orientation, crop/rotation metadata, protocol, user consent purpose, version, reference source identity (where authorized), and ephemeral quality cues. There is **no** automatic anthropometric scale inferred from overlay alignment. Explicitly handle interrupted capture and camera permission changes without losing saved source history.

**Browser implementation:** `getUserMedia` requires secure origin and actual user grant; on iOS/mobile test real camera orientation, video `playsInline`, auto-lock, rotation, and unsupported APIs. Respect actual permissions/lifecycle rather than assuming camera access. Manual photo selection fallback and manual-only workflow are required. Future SwiftUI uses Apple-native camera UI but shares canonical pose IDs, photo source/consent contracts and comparison eligibility through backend.

## 6. Phase mapping and original acceptance preservation

| Existing VPA phase/task | Additive requirement | No-go |
|---|---|---|
| Stage A / VPA-01/02/03 | Minimal standard pose library, static overlay/framing cues, live camera viewer, optional same-pose private ghost photo, countdown/retake/save, source-versioned photo-set metadata | No live sensitive photo storage prior to verified private blob/consent lifecycle; no numerical image estimate |
| Stage B / VPA-04/05 | Optional on-device pose/segmentation guide, automatic quality warnings, reproducible comparable-view labels, account-private learning from actual independent measures | Pose coordinates are not true centimetres; visual feedback not physiological response |
| Stage C / VPA-06 | Separate research validation of numerical circumference models, per-site/protocol/device longitudinal tests and abstention | No unsupported visible cm/body-fat/muscle results |
| Stage D / VPA-07 | Only future separately authorized population research on eligible data classes | No default-on cross-user photo/model training |
| VPA-08 | Preserve all 28 source BIO tests plus ML-VPA-2401–08 / INT-VPA-01–08; add focused capture/overlay cases below | No "pass" from visual mockups or compilation alone |

**Mandatory new acceptance IDs:**
- `VPA-POSE-01` Standard front/side/back poses are repeatable and versioned, readable neutral instructions, Everyday simple and Athlete optional expanded.
- `VPA-POSE-02` A front capture cannot silently become a side reference; left/right orientation and relaxed vs custom protocol are differentiated.
- `VPA-POSE-03` The user can skip a pose, save a single photo, use manual measurement only, and disable AI without lost work.
- `VPA-GHOST-01` Choose correct own-account same-view prior source and adjust opacity/hide; no ghost image embedded in saved source.
- `VPA-GHOST-02` Camera mirror/orientation/zoom/cover crop changes never misalign overlay to saved frame; capture retains original subject geometry.
- `VPA-GHOST-03` Prior image deletion/consent withdrawal/account switch clears ghost immediately and blocks delayed loading/cache resurrection.
- `VPA-CAM-01` Real iPhone Safari and appropriate Android/desktop capture permission, cancel, camera missing, orientation, timer, retake, browser backgrounding and track shutdown tested.
- `VPA-CAM-02` Saved source photo is unwarped, sanitized of location EXIF, excludes overlay and no unsaved preview is represented as stored.
- `VPA-CAM-03` Save/retry idempotence, partial upload, private authenticated reopen, export, delete and derivative expiry tested after private-media activation.
- `VPA-QUAL-01` Pose/crop/lighting mismatch shows neutral intelligible feedback or abstention; no fake change, cm or biological outcome.
- `VPA-QUAL-02` Dynamic local model unavailable/slow or declined → static guide + normal manual save/import still work; no default third-party frames.
- `VPA-UX-01` Single-handed setup and countdown with accessible manual alternatives; 320/390/768/1024/1440, 200% zoom, keyboard, VoiceOver, reduced motion and dark/light mode.
- `VPA-UX-02` Before/after comparison always identifies actual capture dates/view/protocol and flags compatibility; no apparent change created by warped alignment.

These cases complement, rather than replace, the original 28 BIO VPA cases and eight each ML/Integration amendments. Verify actual app capture/screenshots, user interaction, server permission checks and source hash/metadata under exact commit SHA. Report independently `CODE_PRESENT`, `TESTED`, `PRIVATE_STORAGE_AUTHORIZED`, `LIVE_DEVICE_VERIFIED`, `SCIENTIFICALLY_VALIDATED`, `OWNER_RELEASE_AUTHORIZED`.

## 7. Visual asset and reference application

Use Bloom's established premium editorial style from `BLOOM_APPLICATION_WIDE_VISUAL_DNA_AND_SELECTIVE_PRESERVATION_20261117.md`, the shared page-header standard and mode-aware accents. A **capture screen is camera-first**, not a large hero that interferes with live preview. Reuse existing icons, guides and design tokens; tasteful small original line/SVG pose silhouettes may be made by Codex when semantically correct. If a major illustrative pose-guide image is needed, register an additive **requested** asset in `docs/visual-assets/visual-asset-registry.json`, with truthful fallback rather than fabricated file hashes/rights. No need for photo-realistic model imagery to start: accessible vectors/manual guidance are preferred. Never add real private user progress photographs to the canonical decorative artwork registry or use them in screenshots provided as public design references. Owner-provided layout reference screenshots, if later supplied, must be committed as actual pixels to a Codex-readable `docs/design-references/` path.

**Definition of done:** A user can select a consistent standard pose, open Bloom's live camera with clear guides, optionally overlay their own matching prior photograph at adjustable opacity, take a timed photo, review/retake, save the unchanged sanitized image privately, and later compare dated same-view photos—with visible comparability limits, no appearance scoring and no invented physiological measurements. This must remain a pleasant, reliable experience when local AI is unavailable.
