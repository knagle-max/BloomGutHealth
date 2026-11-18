# BloomGutHealth — Development Strategy and Consumer Experience Directive

**To:** Chief Architect & Integration Lead, Codex  
**From:** Product Owner · **Effective:** immediately, November 17, 2026  
**Status:** **STANDING OWNER DIRECTIVE — binding for new work and materially modified screens**  
**Codex branch:** `enhance/bloom-experience` · **Execution priority:** existing `NEXT_ACTIONS.md`, unchanged.

## 1. Executive decision and precedence

**Bloom must be scientifically sophisticated behind the scenes and exceptionally simple to use.** Prior comprehensive redesign coordination has not consistently produced simplicity, quality or faithful asset integration. Do not respond by adding a Consumer Experience Architect, another specialist/approval layer, a new design handoff queue or another application-wide UI redesign.

The **existing Chief Architect and Codex share accountability for consumer-experience quality**. Chief Architect decides usefulness, hierarchy, scientific/product scope, essential vs optional content and evidence-preserving simplification; **Codex is the sole implementer and may independently make routine product-design decisions** while implementing the science. Existing Science, UX, Design, Branding, Legal, Security and other specialists may be consulted for targeted issues only. Their content does not automatically gain default-screen prominence.

**Directional effort allocation next phase:** approximately **80%** scientific foundation, personalization, evidence, data architecture and functionality; approximately **20%** essential usability, coherent presentation, asset integration and significant visual defects. This is a judgment guide, **not** a rigid timesheet or waiver of safe, usable interfaces. No new app-wide redesign now; future dedicated visual improvement phase follows sufficient scientific progress. Existing significant UI defects remain in scope. No deferral of accessible, source-correct usable new screens.

**Precedence reconciliation:** This later owner directive governs *effort allocation, interface density and nonessential redesign timing*, while existing targeted approved visuals/assets still establish *quality and visual grammar* when a page is touched. Preserve canonical Bloodwork landing image-backed header standard, LDL premium visual DNA, approved art, existing function and mode colour profiles; **do not use a large hero at the expense of immediate value**. If the reference's size would push meaningful content too far down, preserve structure/material/typography/art while adaptively reducing its height and removing redundant description/actions for the specific page. Individual reference images remain real pixel fixtures for relevant scoped work; do not turn those into a new application-wide redesign campaign. This is a more recent general priority directive, not blanket revocation of specifically approved page requirements or source-integrity fixes.

## 2. Owner responsibilities and decision boundaries

**Chief Architect:**
- Own science/technical decisions, meaningful personalization, user value per screen, and essential/optional/unnecessary classification.
- For every feature challenge whether information supports understanding, a decision or a useful action; reject speculative or repetitive default UI even if domain specialists want it exposed.
- Establish falsifiable UX and user-journey acceptance; ensure safety/evidence/source/provenance persists underneath concise UI.
- Protect typed scientific UI interfaces from visual coupling, allowing future redesign without changes to medical/data rules. Preserve existing module boundaries and scientific authority.

**Codex:**
- Sole engineering/UI implementer; reuse existing approved imagery, tokens, navigation, layouts and source logic.
- Independently decide ordinary screen hierarchy, disclosure, responsive behavior and integration; remove low-value default cards/labels/disclaimers; avoid excessive handoff/approval loops.
- Render and personally inspect real screens on mobile/tablet/desktop, complete actual workflows, accessibility, data operations and scientific depth paths; correct material confusion/clutter rather than only rearranging cards.
- Never simplify by deleting scientific observations, changing validated outputs, hiding material abnormal findings/contraindications/uncertainties, adding unreviewed health claims or breaking consent/source access.
- Only report a screen as visually verified after rendered screenshots and actual user-flow evidence, not code compilation alone.

**Specialists:** Targeted assistance on actual science, design, rights, security or UX problems; no separate Consumer Experience Architect or compulsory serial per-page handoff.

## 3. Mandatory five-question screen brief (internal, lightweight)

Before implementing or materially altering a consumer-facing screen, decide:
1. Why is the user here?
2. What single most important thing should they know?
3. Is there a useful next action (if not, don't force one)?
4. Which facts and safety qualifications are required to decide?
5. Which detail should remain available *on demand*, rather than competing on the first screen?

Use this as a brief engineering note/acceptance rationale, not a new planning artifact per screen. Screen component count is driven by user need, **not the number of backend fields, scientific relationships or metrics**.

**Three levels of progressive disclosure:**
- **Level 1 — Immediate value:** clear purpose, the most relevant personalized and source-supported information, a real action only when useful, and material safety/uncertainty in plain language. Favor a few valuable points, not many equal-priority cards.
- **Level 2 — Supporting context:** why it matters, relevant measurements/trends, key biological relationships, practical guidance and succinct uncertainty, accessible by user interaction.
- **Level 3 — Scientific depth:** original records, variants, taxa, molecular/pathway relationships, evidence, methods, source version, provenance, conflicts and scientific limitations. This depth **must be preserved and accessible**, not erased.

No collapse may hide a significant abnormal finding, clinically material uncertainty, contraindication, or decision-critical safety caution.

## 4. Interface anti-patterns and explicit design rules

**Avoid:** showing every measure because it exists; equal-weight multi-card dashboards; repetitive summaries; overly long narrative and repeated disclaimers; jargon that can be expressed accurately in plain language; empty/tall heroes that delay value; badge/metadata overload; multiple competing primaries; generic emoji/clipart/trivial SVG substituting for high-quality approved images; prolonged scrolling before the core insight; dashboards artificially added to every feature.

**Don't call it simplification if content merely became smaller or more tightly spaced.** Remove lower-value *default* content and move scientific detail to appropriate drill-downs. A chart belongs when it clarifies change better than a short sentence/value; don't add visualizations just to show available telemetry.

Each page normally has one dominant purpose; one primary action **when warranted**. Avoid repeating facts already one easy tap away. Use warm, premium Bloom editorial design assets where appropriate; preserve the actual design investment.

**Two independent acceptance dimensions:** (1) scientifically correct, safe, accessible details when needed; (2) fast comprehension and focused default experience. Both must pass.

## 5. Scientific priorities unchanged and explicit

- **Canonical data foundations:** trustworthy genetics, microbiome, bloodwork, phenotype/lifestyle, diet and longitudinal imports with units, methods, timestamps, originals, revisions, account isolation, consent.
- **Biological relationship engine:** genetics → gene/function → microorganisms → molecules/metabolites → pathways → foods/nutrients/dietary patterns → physiological outcomes, with experimentally causal vs observational vs hypothesis vs prediction distinct.
- **Evidence governance:** reviewed authoritative guidance separated from emerging research; source/citation/strength/population/applicability/limitation/version/rights reviewed; qualified consequential outputs require validation and proper safety/approval.
- **Personalized recommendations:** useful next actions from eligible evidence and actual personal facts, not invented deficiencies, beneficial microbes, treatment responses or mechanistic guesses. Reuse existing action/contraindication/protected goal/Response/CDPI authority.
- **Scientific AI model registry:** model questions/targets, inputs, versions, licensing/cost, rights, measured validation and limits, required professional approval; research genomic/metabolic/structural models without implying clinical validity.
- **Longitudinal intelligence:** compare real dated and method-compatible observations, show relevant changes/potential associations with uncertainty; never infer individual causal effects merely from temporal sequence.

**Keep a modular monolith and independently maintainable typed domain adapters**, not a monolith of UI logic or numerous microservices. Scientific contracts must remain independent of UI state; no second evidence graph, source ledger, permission engine, profile, AI orchestration or action-ranking engine.

## 6. Prior design investment and future visual phase

Preserve approved branding, typography, palettes (Everyday forest, Athlete blue, Coach purple when implemented), tokens, imagery, navigation, screen concepts, scientific illustrations and prior high-quality components. A concise **in-context inventory** on affected work only should identify usable assets/components, missing integration, and significant UX defects—no new months-long design audit.

Codex may generate/integrate missing high-quality imagery where authorized tools exist; do not offload serial image creation to Product Owner or substitute low-quality icons. If no authorized image tool/capability exists, state exactly what is unavailable; register honest requested asset/placeholder according to canonical `docs/visual-assets/visual-asset-registry.json`, keeping all delivered asset bytes and rights intact. The same applies to reference screenshots: actual user-provided image file must be Codex-accessible, not only described.

**Future dedicated visual-improvement phase** (not now, not automatically a wholesale redesign): representative page by page—identify actual user task/value hierarchy → reconcile approved design/reference → choose Level 1 vs 2 vs 3 → integrate actual assets → render functional experience using real or representative lawful test data → inspect mobile and desktop → assess readability, density, usability, accessibility and polish → fix before reusing its pattern elsewhere. No subjective numerical design score substituting for actual inspection.

## 7. Feature and screen acceptance gates

For every new or substantially changed interface, verify:
1. **Clarity:** ordinary user quickly knows screen purpose and meaningful result.
2. **Relevance:** primary content is useful and personalized when justified; lower-value metrics are not prominent.
3. **Actionability:** one obvious real useful next step where relevant; no fake action or unnecessary CTA.
4. **Scientific integrity:** evidence, actual observations, uncertainty, safety/contraindication, original source and consent are preserved; no overstated personal conclusions.
5. **Progressive disclosure:** substantial scientific details accessible through functional secondary levels, not lost.
6. **Visual craft:** cohesive premium typography/material/spacing and approved imagery; appropriate mode and page-header grammar without wasteful tall hero; no generic replacements.
7. **Functional integrity:** existing source acquisition, entry/edit/save/reload/correct/undo, account privacy, detailed source and consent management survive.
8. **Accessibility:** intended mobile/tablet/desktop layout, keyboard, text zoom, contrast, screen readers, actual supported devices.
9. **Rendered evidence:** real screens at relevant 320/390/768/1024/1440 widths, actionable user journeys, clear regression/NOT_TESTED status. Code tests and a beautiful static mockup are insufficient by themselves.

Useful spot checks: Can a new user identify the most meaningful item without scrolling through three irrelevant sections? Can they open source details without losing context? Is safety visible when it changes a decision? Does removing extra UI leave the same core science available? Do empty/unknown data states remain honest?

## 8. Work allocation and execution/reporting

**Do not change `NEXT_ACTIONS.md` to insert a new visual initiative.** Continue its current v0.6 confirmed supplement taken/intake work, Food #12, Response #15, source corrections and existing approved problems. Integrate consumer-first rules on each touched feature. No new specialist, standing committee, design dependency, mandatory per-screen owner sign-off, new paid vendor, production merge or science/privacy/legal relaxation.

Progress updates must separately distinguish:
- Scientific functionality completed.
- User-facing functionality completed.
- Material usability/visual improvements.
- Remaining implementation gaps.
- Actual third-party dependencies/blockers.

Prioritize working software and validated source-to-action journeys, rather than expanding docs. **Success is not quantity of data displayed; it is reliable biological knowledge made understandable, useful, and appropriately personalized.**

## 9. Alignment and explicit override scope

Referenced existing controls remain in force with the updated default-screen priority:
- [Modular-monolith health-domain design](BLOOM_COMPREHENSIVE_HEALTH_LIFE_STAGE_MODULAR_ARCHITECT_DECISION_20261117.md)
- [Application-wide visual DNA](BLOOM_APPLICATION_WIDE_VISUAL_DNA_AND_SELECTIVE_PRESERVATION_20261117.md)
- [Shared editorial page-header contract](BLOOM_CANONICAL_PAGE_HERO_HEADER_STANDARD_20261117.md)
- [Selective asset preservation](BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md)
- [Adaptive mobile/desktop](BLOOM_ADAPTIVE_MOBILE_DESKTOP_EXPERIENCE_ARCHITECT_DECISION_20261116.md)
- [Minimal input and personal learning](BLOOM_MINIMAL_INPUT_PERSONAL_LEARNING_ARCHITECT_DECISION_20261116.md)
- [Scientific computing/source dependencies](BLOOM_SCIENTIFIC_COMPUTING_INFRASTRUCTURE_ARCHITECT_DECISION_20261116.md)

**All visual design acceptance remains real and functional, but a broad new visual redesign program is deferred.** Any scoped earlier owner direction about Bloodwork chart readability, precise source corrections, a specific page design fixture, or missing approved imagery remains valid when that screen is touched. This is the owner's **implementation strategy**, not a request to abandon already-approved assets or destroy feature scope.

**Final product standard:** Bloom feels like an exceptionally intelligent, approachable health companion. Comprehensive scientific engines; selective, practical and human-facing presentation.
