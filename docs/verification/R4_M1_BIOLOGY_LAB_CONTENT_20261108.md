# R4/M1 Biology content — supported lab marker increment

Implements the supported-marker portion of Architect directive `f5e5068` (`BLOOM_BIOLOGY_CONTENT_QUALITY_AUDIT_AND_REMEDIATION.md`). This is an engineering checkpoint, **not** the consolidated RC or independent clinical acceptance. Organism registry, complete public-fixture inventory and developer coverage JSON remain active work.

- One versioned registry supplies the existing 14 marker identities and all legacy education consumers. Each first layer contains 100–170 authored words across function, relevant directional contributors, clinical context and practical discussion. No new supported analyte, clinical threshold, dose or treatment target.
- Expanded profiles replace both hardcoded placeholder disclosures. Evidence links include study design, verified PMID/DOI where supplied and scope limits. ApoB testing differences across guidance, HDL intervention/genetic limits and the Cochrane homocysteine review's differing heart-attack/stroke findings are explicit.
- Source-specific framing uses only finite source-native values/units and supplied valid bounds. Missing units, reversed/nonfinite bounds, unavailable selections and missing vitamin D assay identity abstain. No fallback to a different source after an explicit unavailable selection. Zero remains zero.
- Existing LabTrend tables, original values/units, assay/method, dates, source correction, pending-unit review, unsupported source observations, comparison and owner controls remain intact. Unsupported labels receive no inferred analyte explanation.
- The zoom matrix exposed a nonwrapping Progress action and header actions outside the viewport. Actions now wrap within existing mobile breakpoints; the measured plot has a keyboard-accessible local horizontal scroll region at constrained widths. Original Designer CSS and media bytes are unchanged.

Executed validation:

- TypeScript PASS; production build PASS, including original R4/M1 media, scoped CSS and scientific-asset verification.
- 21 focused tests PASS: new registry/source-interval contracts plus existing marker identity/unit, unsupported assay, explorer, source history and precision/auth/isolation tests.
- Actual App browser journey PASS: 14 profiles with exact registry copy and linked sources; 92 labels × 6 source records; zero, unknown/trace values, aliases/search, selected revisions, source removal, deep links/reload/Back/focus, paused-source withdrawal, other account, offline category icons and no writes.
- Expanded HDL content checked at 320/390/768/1440, Everyday/Athlete light/dark, 100%/200% CSS text zoom (32 combinations); headings and keyboard disclosure retained. Overflow tolerance is one CSS pixel for fractional rounding, scaled with zoom. The broader existing source-only/category matrix covers five widths.

These use synthetic fixtures and intercepted APIs; no private report contents, production writes or screenshot artifacts. Independent scientific/novice/physical-device acceptance NOT RUN. Full final Biology integration regression and consolidated coverage accounting remain outstanding.
