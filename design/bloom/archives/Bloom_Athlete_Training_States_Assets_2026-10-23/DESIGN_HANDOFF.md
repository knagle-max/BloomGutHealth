# Bloom Athlete — Training Guidance Three-State Asset Handoff
2026-10-23 | Marketing & UX | Proposed for Architect/Biology review, not implemented or validated

## States and exact owner-provided language
- **Train as planned:** No meaningful reason identified to adjust your scheduled workout.
- **Consider modifying:** Reduce workload or intensity based on recent training, recovery and symptoms.
- **Recovery or assessment advised:** Recovery may be appropriate, or symptoms may warrant professional evaluation.

## UX and brand rationale
Use Athlete blue as the surrounding workspace, with discreet green, amber, and rose semantic accents on the state cards. These are NOT three separate themes and the palette must not conflate color with scientific confidence. All modes share Bloom typography, radii, interaction, and icon weight. Coach remains a separate indigo workspace that may show shared status only under the athlete's authorization.

## MKT-WORKOUT-301 (P0): decision-support, not clinical clearance
Only a Biology-reviewed eligibility policy can generate a state. 'Train as planned' cannot imply zero injury risk or medical clearance. 'Recovery or assessment advised' must distinguish ordinary rest from symptoms that require professional evaluation. Do not fabricate readiness scores, injury-risk percentages, or analyzed symptoms.

## MKT-WORKOUT-302 (P0): Explainable status
Each card has an optional 'Why this guidance?' disclosure with available dated observations, provenance, actual factors used, missing or stale data, policy version and limitations. Differentiate coach-authored, Biology-approved rules, and AI draft suggestions. In a data-poor case, an explicit 'Not enough information to assess' fallback may be needed rather than misrepresenting it as Train as planned.

## MKT-WORKOUT-303 (P1): User control
Suggested adjustments are presented for review. Never silently overwrite the scheduled session or imply that the status has medically cleared the athlete. 'Train': View workout. 'Modify': Review adjustments. 'Recover': Review recovery guidance / assessment information.

## MKT-WORKOUT-304 (P0): Responsive accessibility
At 320px show one prominent state at a time, icon+written heading+explanation, 44px design-target controls, WCAG 2.2 AA keyboard/reflow/contrast and dark mode. The six cards are scalable SVG visual templates; production text should remain semantic HTML, not embedded in an SVG image.

## MKT-WORKOUT-305 (P0): Testing and privacy
Check normal week, high workload, reported symptoms, contradictory signals, stale/absent sensor, corrected inputs, incomplete history, clinician-warning context, and coach permission withdrawal. Source medical information must not flow to Coach through UI state previews absent Security-approved derived-data access rules.

## Dependencies
BIO-COACH-404/405/406, BIO-OPT-05, LEARN-03/05, UT-OPT-04/07 and MKT-BRAND-301. Biology owns science and thresholds; Security/Legal own permissions; Architect approves; Codex exclusively implements/tests/commits.

## Deliverables
3 icons + 6 sample card SVGs (light/dark). Files are original scalable design assets, not screenshots of an implemented feature. The color choices are proposals. Sign-off: **Design direction approved for architectural consolidation, not runtime or clinical release.**
