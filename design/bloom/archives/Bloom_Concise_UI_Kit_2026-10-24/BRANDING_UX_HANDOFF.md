# Bloom — Branding & UX Review: App-Wide Content Density and Copy Simplification
**Date:** 2026-10-24 (America/Regina)  
**Owner:** Branding & UX Specialist  
**Disposition:** APPROVED WITH CONDITIONS for Chief Architect consolidation, **not** application implementation/release sign-off.  
**Reviewed:** `Bloom_User_Testing_App_Wide_Content_Density_Review_2026-10-24.md` (UT-COPY-1101–1107); `Bloom_User_Testing_Roadmap_Simplicity_Audit_2026-10-23.md` (UT-SIMPLE-901–910), and earlier Bloom Scientific Insights, Add Food, Athlete, restricted-feature design handoffs.  
**Branch / commit reviewed:** No current code branch or rendered runtime independently reviewed for this content audit. Prior User Testing source review documents are the basis; do not interpret this package as an app screenshot audit.  
**Ownership:** Architect consolidates; Codex alone implements, tests and deploys. Branding produces reusable design/copy specifications, User Testing validates, Biology/Security/Legal approve safety-critical meaning.

## Executive position
The user's direct feedback that Bloom's writing is overwhelming makes **copy density a P0 cross-workspace usability constraint**. Author only one action-oriented summary on the default card; progressively disclose context, evidence and technical detail as needed. Eliminate duplicate explanations, settings and paragraph-style onboarding where controls are self-evident. **Never hide important limitations, contraindications, safety warnings or consent conditions to meet a word target.** Keep one shared design system for Everyday (green), Athlete (blue) and Coach (indigo); no second app or component library.

## Requirement crosswalk and design decisions
| User Testing ID | Decision | Brand/UX implementation reference |
|---|---|---|
| UT-COPY-1101 | APPROVE P0 | MKT-COPY-1301: concise card contracts and content-budget audits |
| UT-COPY-1102 | APPROVE P0 | MKT-COPY-1302: disclosure tiers and meaningful source labels |
| UT-COPY-1103 | APPROVE P0 | MKT-COPY-1303: actionable errors and empty states; no essay preambles |
| UT-COPY-1104 | APPROVE P0 | MKT-COPY-1304: surface-specific single primary question/action |
| UT-COPY-1105 | APPROVE P0 safety | MKT-COPY-1305: risk/consent exception and complete review path |
| UT-COPY-1106 | APPROVE P1 tests/P0 safety | MKT-COPY-1306: independent before/after measurement |
| UT-COPY-1107 | APPROVE P1 process | MKT-COPY-1307: canonical copy inventory and governance |

### MKT-COPY-1301 — Shared concise-card contract (P0)
**Recommendation:** Default display has 3–7-word heading, one supporting sentence *only when useful*, one primary CTA and a compact evidence/status label when meaningful. These are heuristics, not hard legal/clinical truncation rules. Eliminate decorative explanatory paragraphs. **Acceptance:** default surface is understandable at 320px and 200% zoom; first CTA not displaced below several long paragraphs; no ambiguous icon-only actions. **Assets:** `concise_components.html`, `styles.css`, SVG comparison.

### MKT-COPY-1302 — Three-level explanation ladder (P0)
**Recommendation:** Level 1 Action + 1-line reason + visible source/uncertainty; Level 2 “Why this?” actual inputs, limitations and alternatives; Level 3 “Explore the science” sources, model details and mechanisms. **Acceptance:** expanded content remains reachable by keyboard/screen reader; only medically consequential warnings always remain visible. Avoid duplicating a global boilerplate disclaimer across cards. **Assets:** evidence-card demo.

### MKT-COPY-1303 — Failure and missing-data microcopy (P0)
**Recommendation:** Say what happened and offer one clear recovery; preserve user draft. Avoid lengthy provider explanations in the first viewport. Examples: “No exact food found” → “Try barcode or enter a label”; “Units need review” → “Confirm original unit”; “Sync needs attention” → “Reconnect”; “Not enough data for a personal estimate” → “View general guidance”. Preserve `missing != zero`. **Acceptance:** no dead-end errors, labels remain scientifically accurate and actions correspond to working behavior.

### MKT-COPY-1304 — Screen-level information hierarchy (P0)
**Recommendation:** Today=What next?; Add Food=How do I enter this?; Progress=What changed?; My Biology=What do we know?; Athlete=What's today's session?; Coach=What needs review?; Research=What am I sharing? Settings appear in their canonical home, not repeated on a goal or result page. **Acceptance:** each first viewport presents only one dominant action; screens can have several actions but no competing primaries. **Assets:** `today_compact_mobile.svg`, `insight_compact_mobile.svg`, `before_after_density.svg`.

### MKT-COPY-1305 — Consent, safety, provenance exception (P0)
**Recommendation:** Critical symptoms/clinical escalation, source uncertainties that could mislead, and legally meaningful disclosure MUST remain visible, using concise structured summary plus accessible full terms before choice; no deceptive omissions. Maintain separate purpose-specific AI/photo/Research consent. **Acceptance:** Biology, Security and Legal confirm meaning equivalence and accurate comprehension; User Testing verifies teach-back for high-risk cases.

### MKT-COPY-1306 — Measured readability and task outcomes (P1, P0 critical failures)
**Recommendation:** Run matched task studies of current vs concise UI: first-action discovery, total time, unnecessary scroll, independent task success, evidence-source comprehension, actual warning recognition, abandonments, perceived effort and accessible navigation. **Acceptance:** the user-testing team's initial targets ≥90% critical task success and ≥80% evidence/source comprehension are hypotheses until measured. Any critical privacy/clinical misunderstanding is blocking. Include Everyday, Athlete, Coach, older adult, no-data, and screen reader users; mobile and desktop.

### MKT-COPY-1307 — Canonical microcopy governance (P1)
**Recommendation:** Inventory default copy at route/component level. For each sentence assign one reason: action, decision, risk or consent; otherwise remove or shift to disclosure. Keep a single source-of-truth for status/error language; Biology reviews scientific edits. **Acceptance:** screenshot snapshots at 320/390/desktop, 200% zoom and dark/light; no clipping; no repeated disclaimers; interactions and source explanations preserved.

## Example before/after copy edits
| Existing style to replace (illustrative, not verified Bloom text) | Proposed default |
|---|---|
| “The following recommendations have been generated using several of your personalized information sources...” | **Today's focus** — “Plan a balanced lunch” · **Review options** · `General guidance` |
| “Please note that some laboratory results might not have a confirmed unit...” | **Units need review** · “Confirm the original lab unit” |
| “There were no products matching your query. Our catalogue coverage may...” | **No exact match** · “Scan or enter the label” |
| “The following exercise and workload factors may influence your next training session...” | **Consider modifying** · “Recent training was demanding” · **Why this?** |

## Interaction constraints
- Defaults: summary cards, short named buttons, no truncated safety warnings. Expanders use semantic buttons and `aria-expanded`, show/hide details without losing focus or scroll context.
- No phantom capability: concise copy must never imply licensed restaurant lookup, AI photo recognition or validated digital-twin predictions currently work when unavailable.
- Development-only features appear in their intended layout with graphite shell/status and disappear/reflow when authorized tester turns preview off; safety gating is server-enforced and separate.
- Display status and source provenance even in compact card when omission would mislead; use colour plus label, never colour alone.
- Preserve original data/units and ability to return to full sources via detail, never flatten evidence into unsupported shorthand.

## Dependencies and status
Existing UI kit reuse: v0.5 Scientific Insights, five-route Add Food, restaurant, photo, Athlete guidance, v0.6 unified plan, restricted feature kit. No new biology rules, text model or site-wide rewrite. Architect maps to UT-COPY-1101–1107 and UT-SIMPLE-901–910; Codex owns implementation/test commits. Feasibility: low/medium for shared copy/card adaptation; medium for screen-by-screen refactor and regression; usability-study effort additional. **Proposed / design asset delivered; no live user-testing or runtime acceptance verified.**
