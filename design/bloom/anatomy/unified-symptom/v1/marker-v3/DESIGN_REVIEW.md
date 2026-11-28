# BVA-0089 V3 — deterministic badge collision review

**Design study only. No production integration or canonical taxonomy changes.**

- Preserve severity radii: [14] / [10,17] / [8,15,22] and unrated hollow marker.
- Sort markers in immutable region-manifest order, independent of observation creation order.
- Prioritize all active severity/selection/focus footprints (22 / 27.5 / 31 SVG units).
- Place 29×16 count badge for count >1 using corners UR, UL, LR, LL and fixed 7-unit outward steps to 21 units.
- Require >=3 units canvas margin and >=4 units clearance from circles and prior badges; place only zero-collision candidates.
- Hide counts without a valid slot. They remain announced by the accessible region label and selection status.
- One-, six-, and ten-region sample presets; No marker for zero observations; hollow marker for unrated recorded observations.
- No medical inference and no time-window aggregation rule implied.
- Actual screenshots and automated browser QA are in this folder. Screen reader and real-device review remain pending.
