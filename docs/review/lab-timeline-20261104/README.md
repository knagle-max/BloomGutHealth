# Timeline Reveal and selected result comparison

Requirement: MKT-ENGAGE-3105. Source-linked, on-demand UI in the existing canonical Bloodwork explorer; no clinical interpretation or new record engine.

Before pins only LabTrend.tsx at 894b9fd. App, Progress, shared report fixture, API responses and styles are current in both captures. Synthetic ALT records: selected 2 U/L, first 2 U/L, second 5 U/L. The after view adds “What was recorded then” and “Compare two recorded results”; the latter reports second minus first, +3 U/L, separately from whole-history direction. No measurement values enter URL parameters.

Visible change callouts:

1. The selected original observation now opens “What was recorded then” below the existing result selector.
2. The optional comparison expands into two independently labelled result selectors, both original observations and a calculated difference with interpretation limits.

Actual app theme asserted. 320/390 CSS-pixel widths. Tall viewport sized to the card for unclipped capture, not a physical phone or ordinary viewport-height simulation. Separate 900px-height functional reflow checks cover five widths. Native selector text may clip; original selected values/timestamps remain fully visible immediately below. No VoiceOver, Safari, hosted or independent Design acceptance claimed.

Browser journey additionally covers reload/Back, same-record/reversed selections, source withdrawal, an actual canonical immutable date-revision projection retaining the old selected IDs, deleted result unavailability, unknown/zero and owner switching. Source revisions resolve only explicit owned same-marker ancestry, never value/date matching.

Reproduce: BLOOM_LAB_TIMELINE_REF=894b9fd (before) or BLOOM_LAB_TIMELINE_CAPTURE=1 (after), BLOOM_REVIEW_OUTPUT=/tmp/<output>, and standard Playwright/Chromium env, then node --import tsx scripts/qa/lab-explorer-journey.mjs.

|File|SHA-256|
|---|---|
|after-320-dark.png|2c5e962dff0fc7a54428440b2d041d4997dcf5023da1cd51f6094583fa10033a|
|after-320-light.png|ead22fcf819c12069182601a9ab1b1a3a53bb1b9a0475975fed04f3bed4bb60f|
|after-390-dark.png|6fc744dc5f593344d02e030c24a016739af9d92a26a184ce92a6e827968515f0|
|after-390-light.png|320b489478858f36f22625bbe486f4a36986559f8e220598c670a5415445d30c|
|before-320-dark.png|10c860ac5b46a624f2b5f9e74e140eff86dddc123b2ed096d55dd1d645b2d7d9|
|before-320-light.png|0707d5816d4af13a14e54475542d9f6536a00c5899b50ba90b609bfcb2f97141|
|before-390-dark.png|f612121d8f3bcdfe2d9213859008775156cf3fb8197bd06c3a886e51803e2403|
|before-390-light.png|c06888c7990fb5a32ecb04d4f646acaa415473fff26482163d15e7ace5ec3351|
