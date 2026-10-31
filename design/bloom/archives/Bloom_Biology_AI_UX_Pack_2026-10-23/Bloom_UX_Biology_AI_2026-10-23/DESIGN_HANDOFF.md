# Bloom — Branding & UX review: Biology + ML / AI handoffs
**Date:** 2026-10-23 | **Status:** APPROVED WITH DESIGN CONDITIONS for Chief Architect intake; no production/clinical/security signoff.
**Source:** Biology comprehensive research v1.1 (BIO-26-301–318), Biology Coach v1.1 (BIO-COACH-401–417), ML & Biological Intelligence Oct 23 (ML-26-201–206), baseline ML-2026-101–112, User Testing cross-reviews.
**Implementation owner:** Codex; Design only supplies assets, UX specifications and specialist review.

## Design disposition
All three specialist directions align with Bloom's action-first, evidence-aware visual strategy. However, mechanistic networks and AI generated explanations require stronger provenance and status labels than conventional wellness cards. Coach is a distinctly permissioned professional surface, not an extension of ordinary Athlete private data. No model efficacy, simulations, patient outcomes or provider integration is verified by these handoffs.

## Requirements proposed for Architect consolidation

### MKT-AI-201 (P0) — Reusable evidence status taxonomy
**Maps:** ML-26-202/204, BIO-26-310/312, MKT-011/014/019.
- Visible icon AND words for: Your recorded measurement, Provider-reported result, General research, Model estimate, Research simulation, Unknown/unconfirmed.
- An assay showing a taxon is not evidence that an enzyme is active; a biochemical path is not a predicted health result. Show source, date, assay, limitations in expandable details.
- Accept: five novice participants correctly classify observed vs experimental examples without colour, screen reader and 320px views. Biology owns label semantics.

### MKT-AI-202 (P0) — Action-first recommendation anatomy
**Maps:** BIO-26-301/312, ML-26-202/204, UT-XSCI.
- Card reading order: One practical action → why it applies to stated goal → what measurements or restrictions were actually used → simple alternative → limits/contraindications → how to assess outcomes → optional molecular pathway and sources.
- Abstention is a first-class state: 'Not enough reliable information to personalize this further. You can still…' No empty dead-end or optional DNA-test wall.
- Accept: participants can act without opening scientific details and do not mistake research for personal measurements.

### MKT-AI-203 (P1; P0 for safety changes) — Living evidence change notice
**Maps:** BIO-26-313–318, ML-26-206, UT-ML-403.
- Nonurgent notice has concise 'Recommendation updated', what changed, review date, reason, link to original/contradictory studies; preserve prior plan and rationale. High-risk withdrawals use reviewed safety wording and appropriate acknowledgement only when needed. No noisy every-paper notifications.
- Accept: version/history, retracted/withdrawn, offline last-approved state; rollback and disclosure verified with tests.

### MKT-AI-204 (P1 research) — Optional pathway explorer
**Maps:** BIO-26-302/307, ML-26-201/203.
- A simple sequence of labeled entities (food/substrate → proposed microbial function → possible metabolite → host process → evidence for measured outcome). Edge legend: biochemistry established, inferred, associated, simulated, unsupported. No glowing flux scores or numeric risk from taxonomy. Source and context accessible from each edge.
- Accept: renders no personal flux values when unvalidated; supports keyboard and textual alternative.

### MKT-AI-205 (P0 consent gate / P1 feature) — Athlete-owned coach sharing
**Maps:** BIO-COACH-401/406/407/414, MKT-INT-001/005.
- Invite is athlete-initiated/approved. Connection card clearly displays verified vs unverified role, specific purpose, granular categories and duration. Preview 'Coach will see / will not see', review grant, audit history, revoke. Hide raw labs/genetics/microbiome, exact location and clinical information by default.
- Accept: revocation/partial grant/decline understood; coach only views allowed information; underlying per-record server authorization Security-approved. UI must not claim revocation deletes information already viewed.

### MKT-AI-206 (P1) — Separate coach and athlete workspace patterns
**Maps:** BIO-COACH-402–405, 411–417.
- Coach desktop: roster, season calendar, reviewed templates, assigned/completed sessions, objective progress, pending reviews. Mobile: next session and quick notes. Status = awaiting athlete/coach review rather than performance-risk grade.
- AI copilot drafts must carry 'AI draft — coach review required' with before/after diff, rationale, missing inputs, approve/edit/reject; never silently publish or prescribe. A profession label is not proof of credentials.
- Accept: 5-athlete and 50-athlete tests, keyboard + tablet; youth and sensitive notes never leak to unrestricted roster.

### MKT-AI-207 (P1) — Experiment and progress reality checks
**Maps:** BIO-26-308/309, ML-26-206, MKT-018.
- Measurement charts place source, unit, protocol and actual dates above optional interpretations; baseline/follow-up, adherence, confounders, null outcomes visible. No causal 'your gut caused X' phrasing.
- Accept: single point, gaps, inconsistent methods and unchanged results all look intentional and comprehensible.

### MKT-AI-208 (P1) — Privacy-preserving AI interactions
**Maps:** ML-2026-110/111, BIO-26-311, BIO-COACH-416/417.
- Explain when text is generated, what evidence is cited, what personal context was used, limits, and whether user messages/health data are sent to a third-party service using accurate Security-reviewed disclosures. Source links must distinguish individual study from approved clinical guidance.
- Accept: no unapproved vendor-retention promises; user sees correction and human-help pathway.

## Asset pack
`assets/*.svg`: eight original 24x24 stroke icons for measured, research, simulated, unknown, evidence update, coach share, privacy and pathways. These are supplemental UI icons, not replacements for pre-existing Bloom logos. Colours are cues only; every usage needs visible status text. SVG titles are illustrative; Developer should provide localized accessible labels in context.

## Component specs
**EvidenceCard**: heading + status icon/text; observable amount+unit+date; one-sentence meaning; CTA; optional provenance/details. Unknown values never substituted with zero.
**AdviceCard**: 'Try' / 'Why' / 'Used data' / 'Other option' / 'Check progress' / accordion evidence/pathway.
**EvidenceChange**: status, change summary, last reviewed, old/new comparison, citations, user acknowledgement only when needed.
**CoachSharePermission**: recipient & role; visibility checklist grouped by sensitivity; history range; expiry; explicit share button; revoke + audit.
**CoachAIReview**: clearly labeled unapproved AI draft with planned-vs-proposed diff, contraindication and missing data warnings, edit/reject/approve.
**PathwayExplorer**: nodes/edges with typed evidence and explanatory linear text fallback.

## Design guardrails / priority
1. Do not replace existing Today/Explore/Progress navigation, brand SVGs, or reusable evidence cards. Extend them.
2. Do not create universal gut health/biological age/athlete readiness scores; no unsupported causal arrows.
3. Keep Today's action and response data understandable without DNA, microbiome, coaching or AI.
4. Do not turn a coach's access into implicit consent to private clinical data; role is not verified credentials.
5. Keep live evidence surveillance review-gated; no unreviewed paper changes user advice automatically.
6. Test 320px, 200% zoom, WCAG 2.2 AA, screen-reader alternatives, and dark mode.

## Signoff
**Branding/design research direction: APPROVED WITH CONDITIONS.**
**Assets: CREATED**, original SVG source verified locally.
**GitHub implementation, real-user UX, biological evidence, clinical safety, provider permissions, AI/model efficacy, release: NOT VERIFIED / NOT APPROVED.**
Chief Architect deduplicates these IDs with MKT-001–020, MKT-INT, UT and BIO/ML before Codex implementation.

---
## Amendment A — Unified Bloom brand with three distinct workspaces
**Added:** 2026-10-23 | **Status:** P0 design requirement approved by Marketing & Design for Chief Architect consolidation; not implementation verification.

### MKT-BRAND-301 (P0) — One design system, three distinct workspace identities
**Maps:** MKT-005/006, MKT-AI-205/206, BIO-COACH-401–417, UT-2026-102, and existing Everyday/Athlete product direction.

**Principle:** Bloom Everyday, Bloom Athlete and Bloom Coach are three separate *workspaces*, not three unrelated brands. Reuse existing Bloom identity, typography, icon construction, layout grid, spacing, radii, component primitives, chart semantics, accessibility behavior and evidence-status vocabulary. Workspace context changes visual accent, information density, navigation destinations and workflow priorities, but **never** scientific certainty or data permissions.

| Workspace | Accent direction | Intended feeling | Primary journeys |
|---|---|---|---|
| **Everyday** | Botanical green, existing baseline `#246B50` | Calm, approachable, practical | Today, Explore, Progress; food capture; measured health outcomes |
| **Athlete** | Performance blue, proposed example `#2563A6` (confirm against existing tokens) | Energetic, precise, performance-oriented | Training, fueling, recovery, performance trends, competition |
| **Coach** | **Proposed** muted indigo `#62558D`, with pale tint `#F0EDF8` (subject to accessibility testing and Architect approval) | Professional, collaborative, structured | Consented athlete roster, planning calendar, program library, review queue, athlete-authorized progress and communications |

**Acceptance criteria:**
1. **Separate IA and role entry:** Coach appears as a distinct workspace destination in the workspace switcher, not embedded as a subsection of Athlete. A person with multiple roles can change context without mixing navigation, authorization or underlying records. Coach entitlement and role presence must be handled honestly; no placeholder suggesting a feature is available before launch.
2. **Shared components:** Evidence Insight Cards, status badges, charts, food capture controls, forms, dialogs, iconography and AI-draft review patterns share behavior and semantics. They may inherit `workspace` theme tokens but not fork independent visual/interaction implementations without demonstrated need.
3. **Distinct information hierarchy:** Everyday leads with one next practical action; Athlete leads with the user's session and performance context; Coach leads with athlete-authorized roster, schedule and outstanding reviews. Professional density may increase on desktop Coach without sacrificing clarity on small screens.
4. **Colour system:** Use semantic tokens (`--workspace-accent`, `--workspace-accent-soft`, `--workspace-accent-foreground`, etc.) rather than hard-coding colours across individual cards. Everyday green and Athlete blue remain recognizable. Coach indigo is a proposal, not an approved final palette. Provide light and dark equivalents meeting WCAG 2.2 AA; test nontext contrast and state cues.
5. **Meaning independent of colour:** 'Measured', 'Reported', 'Research', 'Simulated', 'Unknown', errors and permission levels retain the **same** icon/text/status meaning in every workspace. Do not reassign green to 'good health', blue to 'scientifically certain', or indigo to elevated authority.
6. **Privacy boundary:** Coach sees only explicitly athlete-authorized data by purpose, role, scope and duration. Switching workspaces, viewing a roster, role label, or shared design component never grants access. Genetics, microbiome, medical results, raw nutrition and precise location remain unshared by default. Security owns server enforcement and actual consent/deletion claims.
7. **Brand assets:** Extend the *existing* Bloom icon/wordmark family with a Coach variant only after palette sign-off; do not replace already integrated Everyday/Athlete assets. A Coach glyph may use the shared logo system and collaboration motif, but must remain clearly within Bloom.
8. **Regression:** Compare the three workspaces side-by-side at 320px, 375px, tablet and desktop, both themes and 200% zoom; verify keyboard/screen reader, active workspace announcement, nav discoverability, empty/loading/error states, permission-sensitive surfaces and role switching.

**Cross-team dependencies:** Chief Architect approves IA, available roles/entitlements and final palette; Security/Legal review sharing, minors and professional verification wording; Biology reviews clinical language; User Testing independently validates role comprehension and task success; Codex alone implements code and commits. Design sign-off here covers direction only, not rendered screens or production release.

**Supersession/clarification:** This amendment makes the visual separation *explicit*. It expands MKT-AI-206, which already called for separate Coach patterns, and does **not** supersede existing Everyday/Athlete identity or core Today/Explore/Progress IA.
