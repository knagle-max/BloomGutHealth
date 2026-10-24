# Synthetic local photo UI review

Actual capability handlers with in-memory preference store and explicit synthetic grant; no real reviewer provisioned, no image upload/provider call. Run scripts/qa/development-photo-journey.mjs.

Matched mobile OFF/ON chooser captures: internal-off-mobile.png and internal-on-mobile.png.
1. The existing Settings control adds the photo option in Add Food only for an explicitly scoped internal reviewer.
2. The graphite development label describes pending approval; public methods remain available.
3. Local-preview-mobile.png shows the shared canonical meal review; OFF/role revocation removes the image and preserves the meal draft.

Unmarked originals retained. results.json lists actual handler/draft/cache/reflow assertions. The local preview capture is scrolled to the shared meal editor; it is not evidence of food recognition. Physical device, VoiceOver and real hosted reviewer acceptance remain unverified.
