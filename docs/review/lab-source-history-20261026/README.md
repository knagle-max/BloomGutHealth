# Report and specimen source history

Matched390×1000 light theme, synthetic data, America/Regina and fixed October26 noon. Baseline history surface from9be6265; same canonical report builder and fixture after. Eight imports × two confirmed source rows, one pending-unit row and one legacy unlinked row. Originals retained beside annotated PNGs. No real health data, laboratory connection or clinical acceptance.

1. **Before:** a flat list contains17 confirmed rows. **After:** source history includes all18 active source rows, with the provisional-unit row explicitly distinguished inside its source group.
2. **Before:** dates and marker/value pairs give no report or specimen grouping. **After:** eight recorded source groups expose their user-entered report and specimen identifiers; expanding a group preserves original source section labels and row order.
3. **After:** unlinked legacy records remain separate. The visible explanation distinguishes these user-entered records from verified panels and states that reimports are not detected.

The regression journey exercises0/1/2/6/8 source groups, arbitrary headings, exact timestamps, zero, pending units, keyboard entry,320/390/1280 reflow, light/dark and canonical single-row deletion. Pure source-view tests also cover12 imports, inconsistent identifiers and no mutation. Source groups derive from existing labHistory and pendingLabs; they add no panel store or interpretation model.

Reproduce with scripts/qa/lab-source-history-journey.mjs; optional BLOOM_LAB_HISTORY_BASELINE=9be6265 and BLOOM_LAB_HISTORY_EVIDENCE=/tmp/lab-source-history. Newly referenced editable Bloodwork packs are unavailable here; this is functional evidence using existing Bloom components, not a fidelity or independent medical/design acceptance claim.
