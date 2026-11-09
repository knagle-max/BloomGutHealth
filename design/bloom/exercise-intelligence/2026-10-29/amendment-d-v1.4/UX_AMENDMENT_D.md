# Bloom Exercise Intelligence — Amendment D: Compact set completion presentation
**Version 1.4 · 2026-10-29 · Owner Branding & UX · Proposed visual design; not implemented**

## Binding visual decision
This amendment supplements v1.3 structured per-set parsing and supersedes any earlier visual treatment repeating `bench press` and `Marked completed` on every child row. Use the accompanying editable SVG as exact hierarchy reference. Preserve existing Bloom flagship typography/tokens in production; SVG uses platform-safe typography for portability.

### Parent/child presentation
- One exercise parent labelled `Bench press`; subtitle `5 sets · 10 reps each · 50–55 lb` is derived from *actual reviewed child records*, not invented.
- Under parent, a compact table-like five-row editor: `completion icon | set number | reps | weight | disclosure/edit`. No redundant exercise name per row, no repeated visible `Marked completed` strings.
- 44×44 CSS px minimum touch target per completed/pending status and Edit affordance; the whole row can open details but the status toggle and edit action must not conflict. Keyboard focus and visible focus indicators mandatory.
- Visual status states: **completed** solid evergreen circle with white check; **pending/not confirmed** neutral outlined circle; **not performed/skipped** muted minus circle only where explicitly confirmed; **needs review** amber outlined indicator, separate from completion. For the *illustrated description*, use **pending/not confirmed** by default—an NLP description alone does not verify completion state. Do not use green checks unless user explicitly marked completion or the canonical record is confirmed performed.
- All states have accessible names: `Set 1, 10 repetitions, 50 pounds, completion not confirmed, edit set`. Never depend on color or glyph alone.
- Tap/change on set 2 edits only set 2, not all 5; support reps/load and unit, completion state, and supported added/removed sets. Preserve per-set stable IDs and source-provenance.
- Absent metrics stay unknown, not zero; running with no duration stays its own activity. Editing or deleting a set updates summaries and all Everyday/Athlete/Progress projections once.

### Exact acceptance input
`Ran then did 5 sets of 10 reps of bench press for 50,50,50,55,55 lbs` must yield two parents, Running (duration unknown) and Bench press, with children `(1,10,50,lb),(2,10,50,lb),(3,10,50,lb),(4,10,55,lb),(5,10,55,lb)` and completion **not confirmed** unless a legitimate separate source asserts completion. If user marks 1 and 2 completed, only their controls become checked, and summary reads `2 of 5 completed` instead of claiming `5 of 5 completed`. Save/reload and mode switching must preserve state and values.

### Implementation instructions
**Architect:** Attach Amendment D as the latest binding visual/content decision to MKT-EXAI-2813–2815 and v1.3; keep existing scientific and source gates. No silent layout substitution. **Developer:** inspect current canonical set completion semantics, implement compact row component with clear status/edit targets; supply source commit, before/after 320/390px and dark screenshots, VoiceOver results, unit tests on child-set edits and visual parity review. **Design:** independently approves final visual fidelity. This ZIP is a design artifact; transferring into repo and running app are still outstanding.
