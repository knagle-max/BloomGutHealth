# Approved LDL Editorial Reference — required visual acceptance asset

**Owner-approved reference:** November 16–17, 2026, supplied as an uploaded 864×1536 JPEG screenshot (latest duplicate upload November 17). This README is a **source manifest**, not the image. The reference contains the full mockup: atmospheric arterial/LDL hero, branded top bar, “Heart & cholesterol” category, expressive LDL title, oversized latest-result glass card, history chart, reference context, illustrated *What is LDL?* and *Why does it matter?* rows, and an “About this measurement” lower panel.

**Required actual reference binary path:** `docs/design-references/bloodwork/approved-ldl-editorial-reference.png`

**Image identity:** lossless PNG conversion of user-provided 864×1536 JPEG, 864×1536 pixels, SHA-256 `98d2bcbda8a8af7c97663943652f83fa4ab76d749c1edb932bd3fa6967b991fb`. Original JPEG SHA-256 `a832f022dc2153e5756aa1733c12b0ca8155f20e226e1c62c644bed1ac4d51f7`.

**Delivery status:** `REFERENCE_IMAGE_BINARY_NOT_YET_VERIFIED_IN_REPOSITORY` at time this README was written. The image is available as a conversation attachment and a user-downloadable PNG, but **do not claim it is in GitHub until the exact binary file is committed, fetched and byte/dimension/hash verified**. The handoff text and manifest alone do not grant access to image pixels. Codex must treat direct visual comparison as NOT TESTED until the file exists.

**Required Codex resolution:** Transfer the exact owner-provided image bytes from the authorized artifact attachment, if exposed to Codex, to the path above; if source attachment access is unavailable, obtain the copy from the owner-supplied downloadable artifact. Commit on the authorized branch. Check `sha256sum`, size, actual displayed image and repo path; do not substitute a synthetic rendering or guessed asset. This is a *design-reference-only* asset, not app runtime artwork or a license to reproduce depicted imagery verbatim.

**Usage:** Compare actual app Ferritin and LDL expanded-detail rendered screenshots at 320, 390, 768, 1024, 1440 CSS px against the file for **brand coherence** and **page-specific visual fidelity**. The approved LDL screenshot sets design-quality bar and design DNA for other features, **not** their identical compositions or personal lab data. Preserve existing original application chart/media assets, scientific/source behavior and the current backlog.

**Future user-provided layout mockup rule:** For every future owner-provided design screenshot/mockup, place the **actual original or losslessly converted image bytes** in a stable `docs/design-references/<feature>/` repository path; identify timestamp, dimensions and SHA, explicitly link from the relevant implementation handoff and acceptance fixtures, verify Codex can read pixels, and mark image/reference comparison unavailable if transfer failed. Written prose alone is not delivery. Do not force app runtime assets to be copied from reference mockups.
