# Recorded laboratory points → exact source — local UI evidence

Implements the existing flagship UX Blueprint §5–6 source-drilldown requirement without new scientific definitions, clinical targets or actions. Actual measured/entered values, unit normalization, dates and comparability rules are unchanged. Unknown/duplicate-time observations remain unconnected; zero is a recorded zero, pending-unit results are not plotted.

Before pins LabTrend.tsx and EvidenceInsight.tsx at92d90b236dadf1710724b9c8163ebd6c930510d6 with current App/canonical Precision report fixture/styles. After is this implementation. Same two synthetic Glucose records (original0 and100mg/dL, same instant with supplied offsets and source calendars), views320/390 light/dark. Images are component crops in a2400px-high capture viewport, with the card scrolled below shared fixed chrome to prevent overlay artefacts; functional reflow also tested at normal500/900px heights. They are not full hosted/device screenshots. Unmarked originals retained.

Visible changes:
1. Readable HTML axis/date/unit labels and44px HTML point buttons replace tiny scaled SVG text/read-only dots. Positions still use canonical dates/values; only compatible observations get straight segments. No decorative interpolation or medical status.
2. A native result selector plus explicit View source action supports overlapping points and avoids moving focus on selection alone. Pointer/Enter activation opens the existing source table and focuses the exact row.
3. Each source row links to its exact existing Biology source and date-correction controls. The query is resolved only against currently owned report rows; unavailable IDs give a neutral error. Same-route links, Back and reload preserve the requested source. Section navigation retains its existing heading focus; exact-result navigation targets the actual row, including a non-first row in a section.

Verification: actual rendered canonical report fixtures cover zero/original units/unknown intervals/offsets/same-instant/unverified comparison/single/empty/corrected/legacy states, pointer+keyboard+native selector, exact source/date link/non-first row/reload/Back/missing-ID and both workspace modes at320/375/390/430/1280 light/dark with no writes/overflow and44px point targets. Existing actual App/HTTP/encrypted five-LDL observation journey, report-source grouping/date/pending/raw/deletion, source-first overview and Progress matrices pass.16 focused domain/source/precision tests/types/build; broader milestone tracked in NEXT_ACTIONS. No clinical or source approval inferred.

Original-source screenshots compare only the documented two-component family, not a clean historical repository. Fonts blocked in local Chromium. Independent Design, actual VoiceOver/phone/200% and authenticated hosted acceptance remain OPEN. Source commit/CI/preview in NEXT_ACTIONS.

Reproduce: set BLOOM_PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright and BLOOM_CHROMIUM_EXECUTABLE=/usr/bin/chromium; node --import tsx scripts/qa/lab-source-context-journey.mjs. Optional BLOOM_LAB_UI_REF=92d90b2 captures the specified source baseline; BLOOM_REVIEW_OUTPUT sets output path.
