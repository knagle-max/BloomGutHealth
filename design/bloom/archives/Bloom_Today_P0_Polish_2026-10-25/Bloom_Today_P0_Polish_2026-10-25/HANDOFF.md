# Bloom — Branding & UX: P0 Today Visual Polish Review
Date: 2026-10-25 (America/Regina)
Owner: Branding & UX Specialist
Source: Bloom_User_Testing_Today_P0_Visual_Polish_Review_2026-10-25.md, UT-TODAY-VIS-1601–1608. Cross-checked Bloom_Visual_Quality_Content_Density_UX_Handoff_2026-10-24.md (MKT-POLISH-1301–1306) and earlier mobile screenshot defect handoff MKT-MOB-1401–1405.
Decision: APPROVE WITH CONDITIONS for Chief Architect consolidation. Design asset delivery only; no Codex implementation, live Render QA, actual participant testing or production acceptance is attested. Source documents were reviewed; current runtime/commit NOT verified in this review.

## Decision and scope
The Today visual-polish subset is P0 subject to Architect intake. The wider 5-phase Visual Intelligence/Motivation roadmap stays P1 or research-gated. This work is a *replacement and consolidation* of existing overly verbose Today surfaces, not a new dashboard, feature section or visual score. Do not pre-empt privacy, nutritional correctness or safety fixes. Standard Everyday green and Athlete blue themes apply; graphite only for authorized gated development content.

## Source crosswalk and acceptance
| New ID | Source | Priority | Acceptance |
|---|---|---|---|
| MKT-TODAY-1901 | UT-TODAY-VIS-1601, UT-EXPERIENCE-1401 | P0 | One dominant actionable next step; clear adjust/dismiss; no competing equal-weight panel; no-data account still useful |
| MKT-TODAY-1902 | UT-TODAY-VIS-1602, UT-COPY-1101–1107 | P0 | Each added indicator removes redundant prose; copy inventory tracks removed and retained material warnings; concise one-line context |
| MKT-TODAY-1903 | UT-TODAY-VIS-1603, UT-VIS-1201–1203 | P0 | Indicator opens dated source, actual numerator/denominator, data gaps and edit route; delayed sync not mistaken for no activity; missing meal nutrients not zero |
| MKT-TODAY-1904 | UT-TODAY-VIS-1604, MKT-POLISH-1301–1304 | P0 | Use approved Bloom icons, semantic labels, spacing tokens and existing components; no placeholder medical imagery in deployment |
| MKT-TODAY-1905 | UT-TODAY-VIS-1605, MKT-MOB-1401–1405 | P0 | Verified actual-build 320,375,390px + desktop screenshot set, dark/light, Everyday/Athlete, 200% text, keyboard/VoiceOver, reduced motion, safe-area bottom nav, no overlap or clipped content |
| MKT-TODAY-1906 | UT-TODAY-VIS-1606 | P0 | Rest day is not failure, data incomplete remains incomplete, no unsafe near-goal prompt under illness/injury/underfueling; dismiss celebration and no guilt language |
| MKT-TODAY-1907 | UT-TODAY-VIS-1607–1608 | P0 | Before/after task test measures first-action discovery, correct source interpretation, task completion, added-food success, and error/abandonment; exact build SHA and reviewer recorded |

## Design tokens / spatial contract
Phone content gutter >=16px at 320px, ordinarily 20px at 375/390px; peer card gap 12–16px; card inset 16–20px; mobile body >=14px secondary and ~16px primary; button tap targets aim >=44×44px; no nested panel borders for a single logical empty state. These are design defaults, not a blind global CSS patch. Ensure container `min-width:0`, wrapping labels, full-width/stacked action at narrow widths, and sufficient scrolling clearance above fixed bottom nav including safe-area inset. Do not use text truncation to hide source or safety meaning.

## Three SVG reference states (synthetic data only)
1. `today_default_mobile.svg` — one next action, compact Eat/Move/Recover; short labels and disclosure affordance.
2. `today_partial_mobile.svg` — incomplete food log and delayed device sync; not 100%, zero or inactive.
3. `today_rest_mobile.svg` — planned rest, no coercive streak; logging action still available.
These assets illustrate composition and wording, NOT implemented functionality or claims of real observations.

## QA screenshots requested from Codex
Provide route, date, reviewer, commit/build SHA, browser/device, viewport, zoom, data fixture and corresponding before/after images. Capture empty Today, realistic filled Today, partial nutrient data, offline/delayed sync, planned rest, two goals in tension, unreadable long labels, modal/drawer open, visible keyboard focus and expanded Why?. Verify actual App Safari/WebView where relevant, plus desktop. Automated DOM checks should identify horizontal scroll, overlapping bounds of headings/actions, clipped focus controls and fixed-nav occlusion; human inspect screenshots.

## Non-negotiable safety / provenance
The designer cannot choose user-specific recommendations, approved exercise readiness or thresholds. Biology/ML approve action, data sufficiency and context; Integrations provenance; Security/Legal disclosure/access; User Testing evaluates comprehension. No predicted readiness score or clinical effect introduced. Render deployment/availability and actual defects require Codex verification.

## Status chain
Received -> Reviewed -> **Design assets delivered** -> Architect intake pending -> Implementation unverified -> Screenshot QA pending -> Specialist review pending.
