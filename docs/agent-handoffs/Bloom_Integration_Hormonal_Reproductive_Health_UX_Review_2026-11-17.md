# Bloom — Hormonal & Reproductive Health: Integrations & Recording UX Review

**Document ID:** INT-RH-20261117-R1  
**Recipient:** Chief Architect & Integration Lead  
**Date:** November 17, 2026  
**Disposition:** APPROVE WITH TARGETED REVISIONS; not implementation or activation authorization.

## Exact reviewed sources
- `Bloom_Reproductive_Life_Stages_and_Libido_Science_Handoff_2026-11-17.md` (RH-01–RH-10).
- `Bloom_Hormonal_Reproductive_Health_UX_Integration_Review_2026-11-17.md` (UT-RH-5801–5828; R2 competitor synthesis).
- Read-only GitHub branch `enhance/bloom-experience` at `fd06e868cae61275ec9a8d1145446b7d1a5fb687`, including `shared/checkin-entry-source.ts`, `server/wellness-checkin-observations.ts`, `docs/operations/CHECKIN_ENTRY_SOURCE.md`.

## Executive product decision
Use **Biology → Hormonal & Reproductive Health** as the voluntary, discreet hub. **Profile → Privacy & health topics** contains topic consents, preferences, reminders, visibility, export and deletion. **Progress** shows opted-in filters/history; **Bloodwork** remains the sole canonical source of hormone lab results; **Athlete** may display explicitly selected context; **Today** never shows a sexual/reproductive card by default. No permanent global tab, fertility forecast, hormone score, medical diagnosis or separate medication/lab ledger.

The science handoff treats life stage, actual bleeding events, symptom reports, libido relative to personal baseline, bother/distress, treatment exposure and measured hormones as separate distinct sources. Preserve that contract. The UX R2 handoff adds optional favourites, short multi-event check-in, accessible list/calendar, and deliberately previewed practitioner PDF. The competitor review describes advertised features, not Bloom clinical validation.

## Recommended recording sequence
1. User voluntarily enables topic(s): symptoms, cycle/bleeding, life-stage context, adult sexual wellbeing with distinct consent, treatment context, or source-linked hormone tests. No sex/gender assumptions, no required extensive intake, decline honored indefinitely unless user revisits setup.
2. `Record observation`: selected favourite or category → one qualitative impact choice (`none/a little/moderately/a lot/not sure`) if applicable → save with editable date; optional notes and multiple symptoms in a batch. `Repeat last` copies only category template, not symptom occurrence, desire or impact.
3. Cycle event states `started`, `ended`, `spotting`, `uncertain` are separate from associated symptoms. No period inferred from pain/spotting. Unlogged day is unknown; explicit symptom-free day is a different event.
4. Use a chronological list as a universal accessible default with optional calendar. Meaningful numerator **and denominator** refer to actual days logged, not all calendar days.
5. Inline `What these records show` explanation follows chart/list; source-linked lab, medication, sleep and training markers appear only with specific user selection and permission; never infer mechanism, personal hormone levels or causality.
6. A deliberate `Prepare for appointment` report previews all selected dates and categories; sexual data and raw lab content OFF by default; no automatic sharing, private temp-file retention bounded.

## Read-only repository findings
- `shared/checkin-entry-source.ts` supports original manual unit tokens for weight, waist, body-fat, bloating, energy and adherence; it is not a reproductive/sexual observation capture contract.
- `server/wellness-checkin-observations.ts` provides account-scoped weekly and dated source presence, revisions and recorded dates; it is not daily symptom absence or RH-specific consent.
- Existing lab source records must be linked rather than recopied. Existing medication context, where actually recorded, must never be interpreted as confirmed taken from prescription alone.
- No completed RH-specific hub, sensitive consent lifecycle, practitioner export or hosted RH tests established by this limited source inspection.

## Targeted implementation refinements, mapped to RH / UT-RH rather than a new workstream

| ID | Priority | Minimal code requirement | Acceptance |
|---|---|---|---|
| INT-RH-01 | P0 on activation | Purpose- and topic-scoped consent, adult eligibility for sexual wellbeing, server-enforced access and discreet default exclusions | Declining topic shows no future prompt, query, Today/notification/coach preview; no implicit authorization from general Profile data |
| INT-RH-02 | P0 | Extend canonical account observation sources with typed event kind, original user choice, severity/impact, time precision, occurredAt vs enteredAt, source revision, timezone and missingness | No log ≠ symptom-free; symptom ≠ period start; backdate/correction/retry idempotent |
| INT-RH-03 | P0 | Read-only, permission-scoped references to canonical hormone labs and treatment/medication events, not copies | Exact assay/unit/date/method preserved; prescription ≠ consumption; coincident changes not asserted causal |
| INT-RH-04 | P0 | Correction, deletion, revocation and account-switch invalidation through UI, server, cache and pending jobs | Two-account deny, stale job cannot republish revoked observation, unrelated history stays intact |
| INT-RH-05 | P0 | Preview-before-export appointment summary with individually chosen sections, date range, no default sexual/raw lab inclusion | Test final report bytes, temporary objects, URLs and logged metadata; no automatic sharing |
| INT-RH-06 | P1 | True-coverage event summaries and accessible date list/calendar, reason-coded sparse history | Four logged dates of 30 never becomes 26 symptom-free days or a predicted ovulation/menopause status |
| INT-RH-07 | P1 | User-configured favourite quick-log and discreet Today link, not persistent sensitive card | Consent-denial and notification screenshot cases have no exposed category or record content |
| INT-RH-08 | P1/later | Manual-first resilient capture and optional native-only provider connector when verified | No fabricated wearable availability; offline/provider outage preserves owned records and safe fallback |

## Data contract recommendation
Map to existing account source/consent revisions, not parallel databases: `ownedEventId`, authenticated owner, `purposeId`, `topic`, `eventType`, `originalUserChoice`, optional `impact`, `occurredAt`, `recordedAt`, time precision, timezone, source/provenance type (`self_report` / `clinician_reported`), source revision, consent revision, optional canonical lab/exposure refs, deletion/invalidation state. Preserve private free text separately; avoid sensitive values in analytics, logs, URLs, background notification titles or model calls.

## Delivery order
**Slice 1:** optional opt-in, quick log, edit, source version, safe list/calendar/coverage. **Slice 2:** previewed appointment report and canonical lab/treatment links. **Slice 3:** reviewed educational help, optional Athlete contextual view. **Later:** native-provider readings, observational modelling only with source quality and purpose consent. Avoid delay to Food #12 and report-wide Response #15.

## Gate ownership
Architect consolidates within existing RH/UT-RH, consent and source contracts; Codex is sole implementer. Biology validates scientific statements and warning conditions; Integrations signs source fidelity/consent propagation; Security/Legal approve sensitive data and export policies; UX/User Testing evaluate actual devices and comprehension. Code/test/hosted/science/privacy/public authorization statuses must stay distinct.

**No application code, infrastructure, provider connection or permissions changed in this review.**