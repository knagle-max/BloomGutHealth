# Exercise Intelligence implementation contract

Crosswalk: ML-ACT-1001–1008, UT-EXAI-2701–2708, ARC-ACT-01–06, V06-TRAIN-01/02 and MKT-ACT-2301–2308. Single canonical activity/session model with mode projections.

P0 contracts: one save across Everyday/Athlete/Progress; source identities and timelines; planned != completed; unknown != zero; no device/manual double counting; calories never credited to food targets; no fabricated HR/RPE/load/duration; source and provenance; no speculative risk/medical outcomes; account isolation and safe retries.

P1 experience: Describe / Select / Repeat previous -> editable review -> one save; robust missing/ambiguous fallbacks; measured-vs-estimated active energy, gross-vs-active distinction in details; muscle map curated; strength sets/volume shown only when recorded; accessible charts and edit flows.

Design token hints (map to canonical Bloom tokens): bg #F6F8F5, surface #FFFFFF, text #182A25, muted #63736D, green #246B50, Athlete blue #2563A6; cards 20–24px radius; content side margins 18px at 390 width. These are proposed screen values and must be checked against existing master tokens, not replace them.

No new standalone workout datastore. No working NLP, energy engine or approved licensed MET dataset is asserted by these assets. Architect must resolve licensing, scientific, legal and source schema before activation. Only Developer changes repo and deploys.

Acceptance demonstration: 'walked 35 min' Everyday -> one reviewed save -> Today/Progress/Athlete same record; '3 x 8 bench at 60 kg' Athlete -> sets kept on mode switch; no weight => energy absent; one watch+manual run => no doubled energy; 2 distinct runs remain separate. Screenshot equivalence plus interactive flows are mandatory; do not claim SVG renders alone are implementation.
