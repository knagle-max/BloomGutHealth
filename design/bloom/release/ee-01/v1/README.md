# Bloom · Secret periodic table — Swipe-to-Unfold (prototype)

This standalone HTML/CSS/JS prototype supersedes the earlier **five-tap** version. It is not integrated into Bloom and does not authorize a release or change the application execution queue.

## Running

Unzip, then open `index.html` in a modern browser. There are no network dependencies, build step, framework, analytics or cookies.

- Resting identity: **Bloom 0.x · Genesis**, botanical tile. No public 1.0 Hydrogen is claimed.
- **Swipe horizontally** across the Genesis tile on touch, or **drag horizontally** with a pointer/mouse (48 CSS-pixel threshold). Vertical movement and cancelled gestures do not open the table.
- Keyboard: focus tile and press **Enter/Space**, or activate **Explore Bloom's elements**. Modal has **Escape**, Close, focus trapping and focus return.
- Opening: brief tile tilt/lift + progressive unfolding sheet and column-arriving elements; closing: reverse soft fold. `prefers-reduced-motion` removes animation; content appears directly.
- Small screens: horizontally scrollable 18-column table at readable fixed minimum width. All 118 elements appear; group-3 placeholders for La/Ac series are clearly shown, and actual 15 f-block elements occur in separate rows.
- Published elements illuminate and can open a release detail panel. Future elements are muted and noninteractive. Demo switch enables fictional 1.0/1.1/1.2/1.3 milestones, clearly flagged as demo. Patch releases inherit the same element.
- Four appearance themes: Everyday Light/Dark, Athlete Light/Dark.

## Implementation guidance / contract

**Do not ship this standalone demo directly into the app.** Architect/Codex should reuse current version authority, approved REL-A01 v3 tile and REL-A06 theme primitives, and React state/components. Do not add a release database or milestone inference from package.json. `PUBLISHED_RELEASES` is intentionally empty; only reviewed authentic public milestone manifests can populate production data. Static element names and grid placement are not a verified source of public release status. Demo and illustration wording must never appear as real published announcements.

The release assignment is **chronological by released major/minor milestones**, with patch versions inheriting prior identity. Current handoff supersedes older major-only mapping. Do not derive release assignment by arithmetic if skipped/reordered versions exist.

**Assets and source disposition:** REL-A01 v3 tile: REUSE EXISTING; REL-A06 palette/motion: REUSE EXISTING/ADAPT; ASSET-EE-02 118-element reference: CODE-GENERATED static reference, verify against science reference at integration; ASSET-EE-03 motion: CODE-GENERATED; ASSET-EE-04 states: CODE-GENERATED. EE-02 to EE-05 are out of scope / DEFERRED.

**Verified in this artifact:** JavaScript parse, 118 unique element symbols/names, grid bounds/unique placements, ZIP CRC; browser tests should report separately. Accessibility acceptance (screen readers, forced colors, zoom) and real app responsive integration have not been independently accepted.

## Files for Codex

- `periodic-elements.json`: structured chemistry metadata (atomic number, symbol, name, period, group when applicable, grid position), separate from actual release metadata.
- `desktop_demo_preview.png`: browser-rendered example with **fictional demo** Helium selected; this is not evidence of a shipped 1.1 release.
- `QA_RESULTS.md`: what was actually tested and what remains unverified.
