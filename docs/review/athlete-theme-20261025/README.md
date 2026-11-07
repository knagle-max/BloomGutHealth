# Athlete appearance correction

Baseline8e01b635ed48241504afe32bc295f9701becf423. The prior light choice still rendered the legacy dark Athlete palette. Light now uses the delivered app-wide `athlete_home.svg` colors: neutral background#F7F9F8, white cards, text#1D3029, support#52635C, blue#2563A6, borders#DBE5E0. Original archived/public JSON assets remain byte-preserved. The generator documents the source; dark retains the v1 palette.

1. Light surfaces and source text now respond to the selected appearance.
2. The existing ink/reversed wordmark switches with appearance rather than Athlete mode.
3. Header appearance control explicitly uses current foreground color.

| Appearance | Before | After |
| --- | --- | --- |
| Light375 | [Original](before/planned-375.png) | [Original](after/planned-375.png) |
| Dark375 | [Original](before/planned-dark-375.png) | [Original](after/planned-dark-375.png) |

[Annotated change locations](after/planned-375-annotated.png) retain the existing numbered home regions; palette changes apply across those regions. No new navigation/state or medical functionality. Browser checks assert light/dark background separation, correct logo visibility and >=4.5:1 foreground/background, support/card and primary-button text contrast. This is not an exhaustive accessibility or independent Design review. Full responsive Athlete source workflow regression is recorded in the development log; native/device/human acceptance remains open.
