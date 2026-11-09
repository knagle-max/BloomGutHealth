# Bloom — App-Wide Layout, Spacing & Concise Copy Correction Handoff
Date: 2026-10-24 | Owner: Branding & UX Specialist | Status: Source-reviewed; proposed P0/P1 corrections for Chief Architect. Not implemented or visually tested.
Repository: knagle-max/BloomGutHealth PR #1, branch enhance/bloom-experience, reviewed SHA d0214c06a64c92750727a87f5644173223f5fcba.
Source handoffs: User Testing App-Wide Text Density UT-COPY-1101–1107 (2026-10-24), Roadmap Simplicity UT-SIMPLE-901–910 (2026-10-23), previous Branding Concise UI kit, Scientific Insights kit, 5 Ways Add Food kit. This refines/supersedes only prior layout/copy guidance when inconsistent; it does not supersede scientific, privacy, or legal safeguards.

## Decision
APPROVE User Testing content-density concern as P0. Also designate visual collisions, control clipping, overlapping content, broken mobile reflow and unreadable text as P0 accessibility/usability defects when reproduced. Source inspection reveals high-risk patterns; exact overlap locations require rendered verification. No blanket rewrite of layouts without regression checks.

## Source-level findings (verified code, NOT verified visual defects)
1. `client/src/workspace.css`: base `.app-shell .bloom-panel` padding 26px; mobile <=600px padding 20px. Thus padding exists; any apparent no-padding likely comes from nested rules, distinct components, layout constraints or specific paths. `journal-workspace [data-testid^=card-meal] .bloom-panel { padding:16px 0; border:0; ... }` explicitly removes horizontal padding from nested meal panels. Review visually before replacing because parent may already supply gutters.
2. `.app-shell .panel-note` font-size 12px; `.workspace-shortcut span` 11px; `.stat-note` 11px and `.text-link` 11px on <=600px; `.navigation-group > p` 10px. Such sizes increase readability risk on phones. Propose 14px default secondary body, 12px *only* for short auxiliary metadata, with 16px primary body. Confirm contrasts and zoom.
3. `.workspace-tabs > [role=tablist] > button` uses `flex:1`, at <=600px font-size 12px, padding 8px 5px. Multi-tab labels may crowd; replace with accessible horizontally scrollable tabs or wrapping with comfortable gaps and no clipping. Test actual labels on 320px.
4. `.app-shell .overflow-x-auto table { min-width:400px; }` deliberately creates horizontal scrolling below 400px; ensure visible scroll affordance, focusability and accessible alternate table/detail, never page-level horizontal overflow.
5. `client/src/pages/Progress.tsx`: `<details className="bloom-panel workspace-disclosure">` surrounds a nested `<section className="bloom-panel ...">` containing three display-unit selectors and long explanatory paragraph. This is redundant visual framing and duplicates canonical preference editing. Collapse to one summary row with a link to canonical display-units screen; remove nested bordered panel while preserving error/status messages.
6. `client/src/index.css`: `.report-card-top` uses side-by-side title and `.report-value` right-aligned with `flex-shrink:0` and max-width 96px; risk of crowding long analyte names. At compact sizes stack title/value or allow flexible min-width 0 and safe wrapping.
7. `client/src/pages/Dashboard.tsx`: long inline no-meal explanation and multi-line shortcut descriptions; align with UT-COPY: action-led short headings, one supporting line max; details via progressive disclosure.
8. `client/src/pages/AthleteWorkspace.tsx` contains very long single-line JSX form declarations. This raises maintainability/review risk, but is **not proof** of runtime collisions; Codex should isolate reusable field/row layouts and test rendered widths rather than treating line length as a UX bug.

## Requirements
**MKT-LAYOUT-1301 / P0 — Safe gutters and no collisions.** All main screens have clear horizontal inset, consistent card insets, >=12px between distinct control groups, >=16px within dense cards where possible; interactive controls/labels never overlap or clip. Recommend spacing scale 4/8/12/16/24/32px. 320, 375, 390, 768 and 1280px, 200% zoom, large text; capture screenshots and browser overflow checks. Do not apply global `overflow:hidden` to conceal failures. Critical warnings uncut.
**MKT-LAYOUT-1302 / P0 — One panel per semantic surface.** Avoid nested bordered cards unless they represent distinct actionable modules. Explicit exceptions for grouped measurements. On Progress replace nested Profile/unit editor with concise summary and a canonical settings link. Avoid compensating by arbitrary negative margins. Map UT-SIMPLE-903 and UT-RED-201/207.
**MKT-LAYOUT-1303 / P0 — Accessible text hierarchy.** Primary body 16px, secondary 14px, metadata >=12px only when noncritical; 1.4–1.6 line-height; mobile headings responsive 24–30px; clear line wrapping. No essential facts entirely conveyed in microtext. Preserve WCAG 2.2 AA contrast and reflow.
**MKT-COPY-1304 / P0 — One purpose, one action.** Default card: heading roughly 3–7 words, optional one helpful line, one primary CTA. Long explanations behind `Why?` or `Details`, unless safety/consent is material; clinical warnings remain visible. Map UT-COPY-1101–1105 and previous MKT-SIMPLE-1001–1006. No arbitrary truncation of consent.
**MKT-LAYOUT-1305 / P0 — Resilient cards/tabs/charts.** Tab labels should scroll or wrap without collision; cards `min-width:0`; long data names wrap or stack; tables scroll inside a labelled region with keyboard and accessible table alternative; charts have accessible values. Loading, empty, permission and restricted-feature states reflow with no ghost space. Map MKT-REG-1211.
**MKT-REVIEW-1306 / P1 (P0 reproduced blockers) — Screenshot baseline and regression.** Before/after audit only for substantial visible changes: Today, Add Food, My Biology, Progress, Athlete, Recommendations, Connections, Coach preview. Same synthetic fixtures and viewport; report clipped element bounding boxes, overflow, missing focus, contrast, tap sizes, redundant paragraphs. Independent User Testing signoff after Codex screenshots.

## Copy transformations (examples; not a legal/clinical rewriting authorization)
Today: 'Today' + 'Next: Log your lunch' + 'Add food'. Eliminate generic motivational paragraph.
Progress: 'Your progress' + 'Latest measurements' + 'Add measurement'. Move settings explanatory text to canonical settings.
Biology: 'Bloodwork' + '3 results need unit review' + 'Review' (synthetic illustration, do not show fabricated counts).
Workout: 'Consider modifying' + 'Recovery factors warrant review' + 'View why'. Maintain clinical safety signals.
Food: 'Add Food' + five icon/label rows, no introductory feature description needed.
Unavailable restaurant: 'Menu search unavailable' + 'Describe your meal' + optional source explanation.

## Acceptance & verification plan
Codex creates reproducible playwright/browser screenshots at 320/375/390/768/1280, light/dark, Everyday/Athlete and authorized Coach/dev preview, 200% zoom, keyboard/VoiceOver; checks document horizontal scroll except intentional labelled table regions; verifies bounding boxes do not overlap for controls, headings, labels and badges. Include 150–250% system text and translations/long food names. Compare actual text burden and task completion to previous UI; preserve errors, risk disclosures, status and provenance. Zero P0 clipping/hidden errors and no duplicate settings editor in Progress. UT owns participant validation. Most proposed text budgets are heuristics, not proof of improved usability.

## Deliverables
Editable `before_after_mobile.svg` and `component_spacing_reference.svg` (synthetic representations; NOT screenshots of running app), CSS guidance file `spacing_reference.css`, this dated handoff. Codex should adapt to existing tokens and components, not install a second theme.

## Dependencies/ownership
Architect maps P0 vs P1 into active v0.5 queue and resolves priorities without stopping unrelated work; Codex exclusively edits code, tests and GitHub. User Testing owns observed quality and accessibility study. Biology/Legal/Security approve any changed scientific, risk, consent or restricted-feature copy. No production UI, actual issue frequency, or browser collision has been verified in this review.
