# QA receipt — standalone design prototype (2026-11-21)

Automated Chromium/Playwright local DOM-render testing completed through `page.set_content` with the bundled CSS and JavaScript inlined. The browser sandbox disallowed both local `file://` and localhost navigation; standalone file loading was therefore not tested directly.

**PASSED (Chromium local DOM):** 118 rendered element cells; initial 0 published; opt-in fictional demonstration illuminates four releases (1.0.0, 1.1.0, 1.2.0, 1.3.0); selecting Helium shows 1.1.0; accessible Explore button; mouse horizontal drag opens; vertical drag does not; Escape closes; keyboard-focus returns to opener; all four theme data options; 390px horizontal overflow; reduced-motion and normal-motion open/close; keyboard Enter opens; no uncaught page errors. 390px mobile screenshot visually inspected.

**NOT VERIFIED:** physical touch-device gesture sampling, voiceover/screen readers, real 200% zoom, contrast auditing, full 320/768/1440 screenshot matrix, integration with actual Bloom React About screen, production release metadata, hosted execution or public release suitability. All demo content is fictional and opt-in.

**Additional metadata check:** 118 unique atomic numbers, 118 unique display positions; periods 1–7 and two f-block rows. The separate periodic-elements.json is a static chemistry reference only, not a Bloom release database. Future elements have explicit non-published screen-reader descriptions.
