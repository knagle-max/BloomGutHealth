# Bloom — Progressive Disclosure & Precision Map (Screen Specification Section 6)
**Date:** 2026-11-06 | **Status:** Approved cross-application UX acceptance template, with measurement and medical-claim safety constraints. Applies when a screen displays metrics, research insights, lab/fitness telemetry or incomplete signals; does not mandate a metric card on every screen.

## 6. Progressive Disclosure & Precision Map

For every material data-rich user-facing feature, document and implement the following three layers in the **same existing screen hierarchy**, rather than creating another dashboard.

### A. Surface Layer — Three-Second Glance
- **Primary Visual Anchor:** The most useful **actual** source-aware metric, result, status or next action on that screen; include understandable label, unit if numeric, collection/observation period, and appropriate confidence/coverage where necessary.
- **Primary Actionable Microcopy:** One simple truthful explanation of what is recorded, what it may mean within available evidence, and what the user can do. User needn't read a technical table first.
- **Color:** Reuse approved Bloom visual tokens; color can reinforce a valid state but **never solely convey** normal/abnormal, safe/unsafe, known/missing, and never imply a clinical score or diagnostic certainty.
- **Permission and release:** A medically consequential readiness/diagnosis/personal treatment interpretation cannot appear simply because underlying wearable data exist. Use appropriately nonmedical descriptive language or a separately gated research-only view.

### B. Deep Layer — Biological & Data Depth
- **Trigger Mechanism:** One obvious discoverable interaction (e.g., tap card → sheet, drawer or detail view), accessible through keyboard and screen reader and with correct focus return.
- **Exposed Raw Data:** Actual reported/measured input fields where authorized, source/assay/device, units, timestamp and time zone, observation window, sample interval/resolution, coverage and meaningful QC/missingness; appropriate source versions, calculation formula, model/claim status and research references.
- **Measurement Precision:** Show **native observed granularity and honest significant digits**, never manufacture sampling frequency through interpolation or a prettier line. A hypothetical `1-second time series` is justified only when actual validated source timestamps and data truly provide that granularity; otherwise chart the real interval or show a time-window summary with limitations. For HRV show rMSSD/SDNN only when actually provided or computed from compatible validated intervals, with valid units and acquisition context. Distinguish imported summary HRV values from raw beat-to-beat RR intervals, and time-domain statistics from a plotted 1 Hz waveform.
- **Interpretation Boundaries:** Distinguish `measured`, `user reported`, `calculated`, `provider category`, `research inference`, `simulation` and `unavailable`. No undocumented personalized medical recommendations from metrics; an experimental shadow model cannot feed public summaries.
- **Navigation:** Keep technical context normally accessible in 1–2 deliberate interactions and original-source access without exposing private report identifiers or unconsented data.

### C. Zero-Friction Fallback
- No sample / permission missing / baseline insufficient / poor signal / incomplete day / out-of-date source / offline provider / revoked consent / unsupported device must each produce an **honest, useful state**, not fabricated averages, a presumed zero or a medical-sounding readiness decision.
- Show **what was received**, what is absent or unverified, and one feasible next action (e.g. review measurement dates, connect permitted source, enter manually, continue ordinary workout). Do not require telemetry/ML to use core Food, Move, Athlete, Biology or Progress.
- Preserve any reliable known subtotal while marking unknown/partial coverage; missing days not plotted as zero, partial samples not imputed into exact minute or second series, stale sources not marked current.
- Fallback is deliberate, accessible and testable (keyboard, screen reader, 320px/200% zoom, no-colour-only and no UI dead-end).

## Nonbinding example and medically sensitive wording
**User-provided example:** `Recovery Status: Optimal — Ready for High-Intensity Training`; deep sheet with rMSSD, SDNN, resting HR and 1-second time series.

**Architect correction:** This example is a *hypothetical design illustration*, **not an approved Bloom clinical/performance algorithm or one-second data availability claim**. A generic HRV metric, especially absent baseline quality, cannot prove `optimal` physiological recovery or personal safety for high intensity. Approved default first-view alternatives when supported: `Resting heart rate recorded: 58 bpm · measured this morning` or `Recovery data incomplete · continue with your usual training plan or review your recent measurements`. No arbitrary example value (including 58 bpm) appears as actual user data. An experimental model may compute in properly authorized shadow mode, displayed only to server-privileged opted-in researchers, **not public advice** until independently validated and authorized.

## Scope, architecture and test contract
- Use the **spirit** of approved Branding & UX handoffs: meaning-first, source-preserving scientific depth, same Bloom tokens and existing Today / Food / Athlete / Biology / Progress navigation. Avoid new abstract component frameworks; reuse actual components. This template is an authoring/acceptance pattern, not another mandatory precommit form or specialist approval gate.
- Each data-rich new/modified feature includes **three short entries in its adjacent executable acceptance/spec**: `surfaceAnchor + actionCopy`, `deepTrigger + exactAvailableSources/units/resolution`, `fallbackStates + usefulNextAction`. A non-data screen may simply mark these as not applicable with reason.
- Tests: actual measured vs inferred/unknown separation; source/units/precision, incomplete/sparse and stale; revoked permissions and missing model; correct accessibility and source disclosure; save/reload and recalculation if relevant. Use risk-based change-scoped test policy and independent device/final specialist acceptance where applicable. No invented one-second HRV samples or inferred personalized readiness.
- Codex selects sensible UI mechanics and moves forward autonomously; Branding, Biology, UX/UT and relevant safety reviewers review at the final integrated release candidate, not every component.

**Pass definition:** A user can understand the headline in about three seconds, reach original accurate source and uncertainties in no more than two deliberate interactions, and still complete the core task with no data or incomplete telemetry—without a misleading inferred state.
