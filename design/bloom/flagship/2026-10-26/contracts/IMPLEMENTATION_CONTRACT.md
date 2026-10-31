# BLOOM FLAGSHIP VISUAL DIRECTION — DESIGN AUTHORITY & IMPLEMENTATION CONTRACT
Version 1.0 | 2026-10-26 | Branding & UX Specialist | Status: DESIGN CANDIDATE, architect integration pending.

## Order of authority
1. Existing approved product flow, real source-of-truth and binding safety/privacy/scientific/legal gates.
2. This package's **explicit UI implementation contract** and editable HTML/CSS prototype for layout, aesthetic and component hierarchy.
3. Existing v1 brand asset inventory and role palette (Everyday #246B50, Athlete #2563A6, Coach #62558D).
4. Concept images, which are **non-literal art-direction references** only, never exact text/data/interaction requirements.

## Mandatory Product/Architect directive
Branding & UX owns visual composition, typography rhythm, density, interaction presentation, illustration and motion; Architect reconciles dependency/approved scope and can request changes, not silently substitute a new appearance; Developer implements approved visual and interaction contracts. All design deviations require a documented reason, screenshot, impact, and Branding UX review. A safety or feasibility blocker must not be hidden: preserve safe behavior and request targeted design revision. Product Owner retains final product authority.

## Exact design decisions (not suggestions)
### Brand and navigation
- Everyday is evergreen #246B50 with warm mineral/paper backgrounds; Athlete uses blue #2563A6, ink/navy surfaces and precise contrast; Biology uses restrained evergreen plus clinical white, not a new purple top-level mode. Coach remains #62558D and separate approved role workspace.
- Preserve Today / My Biology / Progress as everyday destinations. Athlete and Coach remain optional role modes. Do NOT turn the concept-image tabs into new route architecture.
- Use expressive serif only for short editorial titles or large measured values and readable UI sans for labels/forms/results. Prefer installed/system fonts and approved existing brand fonts; do not redistribute font files.
- Elevated tonal surfaces and editorial whitespace, not endless undifferentiated rounded boxes. One dominant meaningful graphic/metric per view; max one primary filled CTA within each immediate action context.

### Food
- User's current approved method entry and canonical draft/review/save remain authoritative. Do not auto-start barcode scanner from Today. Quick-access favourites/recent can coexist with method chooser, never override it.
- Saved meal P/C/F must come from identical revision / canonical nutritional summary as ingredient detail; known 0, absent null and partial estimated aggregate are distinguished. Never hardcode concept image values or display inferred nutrient certainty.
- Preserve source provenance, selected candidate and confirmation state. Food photos are optional approved assets only if licensed, privacy-safe and do not imply recognized food matches when no provider/model exists.
- One-tap repeat servings, add-to-tray, and easily reversible ingredient changes. Never duplicate contributions when switching input method.

### Athlete
- Show previous actual training value only with verified date/unit/source; input fields ≥44px touch target, explicit set save/completion, optional timer, accessible auto-focus that does not unexpectedly summon a keyboard or steal navigation.
- No black-box readiness score, claims that workout makes user clinically recovered, or predicted muscle gain. No inferred 2,400 calorie target or +/- 6–9% performance prediction from concept image. Plan changes show Before / Proposed / Why / Accept / Edit / Keep / Undo only if approved evidence/eligibility exists.

### Biology
- Dated sample/test results remain under their original source section such as Lipids & Cardiovascular, Liver & Biliary, Endocrine; store Bloom standard category independently, never overwrite imported grouping.
- Lab marker detail order: name + measured value/unit/date -> actual dated chart -> observed change and applicability caveat -> What does this measure? -> What does your result mean? -> possible evidence-supported actions -> Explore science/source details.
- Never assert 'optimal', 'in range' or targets without valid original lab reference or clinically reviewed eligible comparator; neither fictional range nor smooth data invention. Unknown assay/method stays unknown.
- Sparse longitudinal measured values show points with straight connecting segments, not splined/interpolated trajectories. No universal composite biological wellness grade.

### Visual system
- Surfaces Everyday: page #F9F8F4, ink #172C26, pale mint #E9F2E9, muted #6C7E77, border #DCE4DF, base accent #246B50. Athlete dark page #091A31, deep header #0A315C, blue action #2563A6; meet WCAG contrast per actual text. Coach use existing #62558D; don't invent an alternate purple.
- Spacing increments 4/8/12/16/24/32; card radius 16–24; mobile viewport 320, 375, 390 and 430px; desktop 1280+; 200% zoom with no lost functionality. Touch hit areas >=44 CSS px where feasible and no overlapping targets.
- Functional status not communicated by color alone. Use text, icon, and information provenance. Decorative nutrition rings must be sourced to valid targets; no fabricated goal circumference or negative food guilt.
- Motion: 120–180ms for local selections; 180–260ms for committed state changes; only animate after actual save acknowledgement, no false success. Reduced-motion disables transform/continuous looping. No gratuitous confetti, no punishment for missed logs.
- Image-generation editorial concepts are NOT exportable production illustration assets, do not crop away rights/metadata and claim as icons; production photography/illustrations need approved source/license, asset owner and alt strategy.

## Fidelity acceptance
1. Screenshot baseline and branch preview 320/390 mobile, desktop 1280, light/dark, input/editor and loading/error/partial/success; provide precise SHA and route.
2. Design reviewer checks each implementation vs `prototype/index.html`, `prototype/styles.css` and `reference/` direction: correct visual composition, density, hierarchy, hue, role, typography, surfaces, information integrity and responsive states.
3. Independent user testing validates meaningful first action, repeat food entry, numeric exercise input, value/source/chart comprehension, screen reader and keyboard navigation; instrumentation privacy review before enabling usage analytics.
4. No novel data engine, source provider, medical prediction, routing dependency or duplicative canonical store to realize the visuals.

## Specific required replacements from image generation
- Eliminate invented personalized names and personal health projections.
- Replace concept panel LDL 'optimal' and unverified lab reference classification with grounded sourced state or uncertainty.
- Eliminate unsourced recovery score, HRV-driven nutrition/fitness targets, body-composition effects.
- Correct example meal nutrient consistency; no ingredient kcal totals that disagree with overall sum.
- Avoid five tab destinations copied from generated art; approved modes and three main destinations prevail.

## Assets furnished
- `reference/`: two original editorial image-generated concepts, usable only as design direction.
- `prototype/index.html`, `prototype/styles.css`: editable, responsive static HTML/CSS art-direction proof; not connected to app data and not production-ready React.
- `existing-editable/`: five prior editable SVG wireframe components retained for workflow/structure; these do NOT override new flagship art direction.
- `contracts/`: implementation contract and this package's accompanying agent handoff.

## Status and acceptance ownership
Proposed visual direction and static proof created; integration, actual reusable React components, licensed media, screenshot fidelity, real-device accessibility, independent usability and production scientific approval are NOT complete. No claim that Developer already has this in GitHub.
