# Optional food browsing region

ID04 uses existing restaurant-region vocabulary: Canada, United States, Other / unspecified. Optional practical.region is an encrypted account preference, not residence, legal territory, product formulation or a guarantee of food/provider availability. Absence leaves old defaults unchanged; null explicitly clears a saved choice. No migration, geolocation, IP lookup, credential or feature-activation change.

The existing owner lock/source revision protects writes. Unaware practical forms retain a stored region; explicit null clears it. Cross-account settings remain separate. Export and erasure use the existing owned settings record.

Settings clients request the optional field using X-Bloom-Settings-Fields: practical-region-v1 on GET/PATCH. Unaware strict clients receive their previous JSON shape. The no-store resource revision still covers the complete owned settings state, so stale writes conflict even through a legacy projection. Vary identifies field negotiation; the header grants no permission and never chooses an owner. The canonical web settings provider requests this supported projection.

Deploy and verify the reader before enabling the ordinary region editor. Reversing the UI must retain this reader: older binaries with strict schemas cannot safely decode an explicitly stored new field. Do not erase preferences to roll back. Measurement suggestions can use an explicit saved browsing-region hint while preserving every independently saved unit; no automatic unit write or region inference occurs.

Reader evidence:9 focused PostgreSQL/settings/unit checks cover optional defaults, real encrypted preservation, explicit clear, stale source rejection, owner isolation, invalid enum, strict legacy DTO compatibility, full revision binding and unprivileged/unauthenticated reads. Types/build/source checks pass. Ordinary UI producer follows only after exact reader CI/Render verification.

## Ordinary editor and defaults

Profile has one canonical automatic-save region selector, using existing settings source/CAS controls. It shows the last checked saved choice and offers source retry. Independent units and even unfinished numeric Profile drafts are retained. Unit suggestions may use a checked saved region, never automatically applying suggested units.

The saved region initializes restaurant browsing once per Add Food visit. An explicit per-entry choice, a late settings read, a refreshed source or frozen review cannot silently replace the current command. Existing restaurant context remains user-entered and unverified. Source failures withhold preference controls; an uncertain committed response requires the existing latest-source review. No duplicate region editor or additional persistent draft.

Actual App/API/encrypted PostgreSQL save/lost-response/read-back/reload, mixed-unit unfinished drafts, per-meal override, late source, source retry and second-owner checks pass at320px. Existing full unit-editor regression passes; only its renamed preference-error locator changed. Types/build and smoke syntax pass. Existing isolated Neon concurrent-settings smoke requests now include region and verify preservation through unaware forms, without increasing request count; managed outcome awaits exact CI after publication. Reader95cbdc5 Actions40565338981 SUCCESS/liveNeon and RenderLIVEdep-dbgfa23ncjis73c3t9pg before enabling writes.
