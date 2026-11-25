# Visual registry build metadata repair

Source predecessor: `448e2f822e3c216ba1d68995e971210dd12ffc96` on `enhance/bloom-experience`.

The strict build check rejected design-intake metadata before compilation. Seven ZIP/document references had been stored as public image paths; nine unverified integration records used strings instead of objects; later source relations omitted explicit nullable runtime bindings. The repair changes the registry representation, not artwork or acceptance:

- Preserve original ZIP/document locations in `sourceReferencePaths`; `filePaths` contains only the already-declared first-party public artwork paths. No replacement path or image is invented.
- Preserve exact `NOT_INTEGRATED` / `NOT_VERIFIED` text in `integration.state` and explicitly retain `verified:false`.
- Record absent `existingRegistry` / `existingSlot` bindings as null. Preserve all other source-relation fields and do not infer a new runtime component binding.
- Regenerate the existing visual-ID type from all 101 already-registered permanent IDs. Existing editorial slot mappings are unchanged; adding an existing ID to the generated union does not deliver or integrate its art.
- Preserve every permanent ID, lifecycle, owner approval, current-rendition disposition, retired ID and original source reference. This includes BVA-0091–0095. No artwork bytes or component layout are modified. Missing approved-original source transfer remains separate from the functioning existing media.

`shared/visual-asset-registry.ts` and all build/media validators remain unchanged. There is no skip, permissive path fallback or weakened existence check. Two existing registry assertions were stale after the owner-approved hero/signup handoffs; they now assert the exact approved statuses while retaining no-false-integration, rejected-rendition, path traversal, nonlocal path and source-byte checks. No new fixtures are committed.

Focused checks: seven registry/naming/preservation tests pass (the new full-metadata preservation fixture and detailed receipts remain isolated locally); TypeScript passes; full `npm run build` passes, including original-media hashes, dimensions, passive scientific artwork and source/build parity. Chunk-size notices are build warnings, not failures. Source-safe build is not deployment, rendered approval, rights/scientific validation, independent security or public-release authorization.

The earlier GI/wellness receipts' build blocker is historical at their pinned commits. This patch resolves that specific blocker without promoting their scientific or consumer status. The broad integrated run finished with 1,030 passes and one pre-fix legacy-deletion failure (1,031 total, no skips). The failed run is retained unchanged. Ten focused deletion/GI checks pass after the repair; a fresh full-suite result on frozen final source is still pending and is not inferred from their union. No Render/Mac/Tailscale/network/deployment or main-merge action occurs.

Integrated regression also exposed a real GI change regression: generic deletion had required opaque legacy check-ins to parse against the current capture schema. The storage branch now identifies explicit GI fields for replay-safe scrubbing while allowing owned legacy check-ins through ordinary deletion. Canonical ingestion validation, ownership predicates and exact dependent-plan pruning remain unchanged. Five existing deletion/storage tests and five local GI tests pass after repair, including opaque legacy and malformed GI source removal. The initial integrated-run failure is preserved in its local log; these focused passes do not relabel that run as wholly green.
