# Bloom — Today Experience Redesign, Amendment to P0 Visual Polish
Date: 2026-10-25 (America/Regina)
Owner: Branding & UX Specialist
Status: P0 DESIGN DIRECTION proposed for Architect consolidation; editable prototype delivered; no source change, app runtime test, user study or release signoff.
Supersedes narrow interpretation of MKT-TODAY-1901–1907 as CSS/layout-only polish. Preserves their safety, provenance, accessibility and screenshot acceptance criteria.
Sources: User Testing Today P0 Visual Polish UT-TODAY-VIS-1601–1608; content-density UT-COPY-1101–1107; simplicity UT-SIMPLE-901–910; visual motivation UT-VIS-1201–1208 and UT-VIS-1301–1308; coherent experience UT-EXPERIENCE-1401–1408. Product owner feedback explicitly says existing application is bland; redesign intent is experience quality, not superficial styling.

## Decision
Treat Today as a usable, visually compelling *daily companion*: clarity, warmth, distinctive Bloom identity and tangible feedback, while retaining a compact first screen. No new dashboard or fictional health scoring. Visual progress must replace redundant text and map to real records. Upgrade the actual in-app experience; do not merely paste reference pictures into existing cards.

## New requirements and acceptance
| ID | Priority | Requirement / observable acceptance |
|---|---|---|
| MKT-EXPD-2001 | P0 | **Expressive Today hero:** one visually dominant next step, contextual time/status, one unmistakable main CTA plus quiet Adjust/Skip. Visible within first viewport on 320–390px; actionable without reading explanatory prose. Empty-account state remains useful. |
| MKT-EXPD-2002 | P0 | **Distinctive visual hierarchy:** designed surfaces, intentional whitespace, stronger type scale, Bloom-owned lightweight illustration/icon motif, meaningful section contrast, coherent radius/shadow, Everyday green and Athlete blue identity. No generic stack of indistinguishable bordered panels; no oversaturated rainbow or random accents. |
| MKT-EXPD-2003 | P0 | **Real feedback rather than decorative gamification:** compact Eat/Move/Recover signals, grounded dated events, truthful incomplete/unknown/rest state. Tapping opens relevant record/Why?; no fabricated percentages, microbiome scores or readiness. Remove text displaced by visuals. |
| MKT-EXPD-2004 | P0 | **Flow continuity:** Add Food launches the five-method selector and returns to Today with confirmed entry shown once; Adjust/Skip persist according to existing approved plan contract. No duplicate journal editor, empty page or forced setup. |
| MKT-EXPD-2005 | P0 | **Mobile-first composition and transitions:** responsive safe-area/nav clearance, single-column 320px, readable 14–16px+ copy, min 44px target, no heading/action overlap, no horizontal scroll or hidden content. Subtle optional state-change motion (150–250ms), reduced-motion and static equivalents. No motion solely for decoration. |
| MKT-EXPD-2006 | P0 | **Before/after actual-build UX gate:** Codex provides routes, fixtures, commit SHA, mobile screenshots (320,375,390) + desktop, theme/workspace states, keyboard/screen reader coverage. User Testing measures first action, task completion, time, meaningfulness, confusion/pressure and ability to inspect data compared with old Today. Neither static SVG nor generated illustrations count as runtime verification. |
| MKT-EXPD-2007 | P1 | **Opt-in moments of delight:** personalized nonjudgmental micro-feedback for confirmed user actions; Quiet/Balanced/Celebratory preferences from prior roadmap; no push through injury or calorie restriction; Biology controls eligibility and claims. Do not block P0 experience on this phase. |

## Design concept shipped
`today_companion_mobile.svg`: editable mobile visual direction showing integrated header, warm purposeful gradient hero, one CTA, concise source-aware day indicators, recent record and space for fixed nav.
`today_companion_desktop.svg`: desktop spatial direction preserving the same clear hierarchy with balanced whitespace.
`prototype.html`: offline interactive static experience preview with three synthetic example states (new account, meals recorded, rest day) and expandable detail. It is not connected to real records, permissions or navigation.

## Difference from prior polish
Old acceptance was largely 'reduce copy, pad cards, no overlap.' New gate additionally asks whether users understand what to do **and whether Bloom feels engaging, coherent and distinct**. The target is a redesigned interaction hierarchy, not adding icons to old blocks. Resolve excessive copy and overlap concurrently.

## Delivery to Codex (Architect approval required)
1. Translate this information architecture into existing TodayFocus/Dashboard and shared journal components; don't create duplicate state stores or alternate Today routes.
2. Match approved brand tokens and assets where already present; provide before/after screenshots of *actual* build rather than only source diff.
3. Implement three data fixtures (empty, confirmed meal + partial nutrients, planned rest) and error/offline state; interactive cards link to canonical detail screens.
4. Verify accessibility, low-end phones, dark mode and Athlete workspace. No restricted feature may bypass server authorization; graphite development states remain an overlay within natural layout.

## Governance / nonclaims
All shown data in design concepts are synthetic and non-medical. Architect decides backlog acceptance; Codex alone edits code, runs tests, commits and deploys. Biology/ML approves rules and motivation eligibility, Security/Legal approves private data and high-risk claims, User Testing performs observed acceptance, Branding reviews actual screenshots. Not implemented or runtime-validated.
