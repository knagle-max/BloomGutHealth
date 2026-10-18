# Bloom design contract — 18 October 2026

This replaces the earlier score-centered design guide. Future brand/UI changes arrive as architect-integrated requirements, using specialist assets and review. This pass implements the already-authorized MKT-001–007 foundation; it does not approve a new logo or complete the brand platform.

## Experience

Everyday uses Today / Explore / Progress, with food capture directly available from Today and the header. Athlete remains a distinct performance workspace with blue identity, an explicit mode label and independent fueling/health gates. The mode toggle is a preference, not a paid entitlement. Everyday is the planned free core; Athlete is a planned subscription addition, with no paywall or billing in this release.

Today presents one contextual primary action: log a first meal when there are no entries, or choose the next meal when entries exist. Supporting history and report panels are expandable. Missing data and failed loading must not imply zero intake or a successful save.

Explore leads with useful food context and distinguishes saved observations, research and unknowns. General mechanisms never masquerade as personal measurements or validated outcomes. A recommendation badge cannot certify clinical suitability. Evidence sources, study design/population, limitations, competing findings and unresolved review remain discoverable.

No general gut-health grade, diet-inferred SCFA meter, numerical improvement score, bacterial deficiency label or arbitrary green/red health ranking is an approved design pattern. Unsupported GutHealthScore prototype/example components are removed. Quantified reported results need source, date/method, units and limitations; vendor scores retain their own semantics.

## Authoritative tokens

`client/src/workspace.css` owns workspace theme overrides and component tokens. `index.css` supplies base/Radix/Tailwind defaults. New component colors use semantic CSS variables, never a competing palette.

| Token | Everyday light | Everyday dark | Athlete light | Athlete dark |
| --- | --- | --- | --- | --- |
| primary | 158 43% 29% | 150 34% 62% | 218 65% 37% | 211 80% 72% |
| primary-foreground | 0 0% 100% | 155 24% 12% | 0 0% 100% | 220 45% 13% |
| foreground | 155 18% 17% | 145 13% 91% | 218 30% 17% | 215 32% 93% |
| background | 150 15% 97% | 155 15% 10% | 215 35% 97% | 219 28% 10% |

All values are HSL components. Primary is identity/action, never evidence confidence. Text/status meaning always includes words. Error/destructive colors indicate interface operations, not an unsupported clinical severity grade.

`--space-unit:4px`, `--control-size:44px`, `--surface-radius:14px`, `--body-size:16px`, `--note-size:14px` define shared measurements. Use 4/8/12/16/24/32px spacing, restrained borders, no score-themed gradients. The existing sans-serif stack remains; font and logo replacement waits for the architect-reviewed brand asset package.

## Accessibility and states

Mobile body and form text normally use 16px; supplementary notes use 14px, labels never rely on 10px microtext. Common interactive controls have 44px minimum height, visible keyboard focus and text labels. Inline links must retain separation and readable wrapping. Checkbox/radio targets, complex charts, every route at 200% browser zoom and screen-reader behavior still require a complete independent accessibility audit.

Honor reduced motion, reflow at 320–1440px, and preserve visible focus on file selection as well as normal controls. Charts have textual values/descriptions. Avoid guilt, guaranteed health outcomes, forced testing, anxiety-based upsells and privacy dark patterns.

Capture states distinguish selected product, serving, source record, estimated/label values and missing nutrients. Camera denial keeps photo/manual routes. JSON/CSV imports admit only supported structure and 2 MiB files; raw-sequence processing is unavailable. Errors offer a supported next step rather than suggesting success.

## Outstanding specialist acceptance

Representative-user comprehension, formal WCAG AA audit, full 200% zoom/assistive-technology coverage, brand assets, onboarding variants and substantiated go-to-market copy remain open. Passing responsive browser checks is not completion of these requirements.
