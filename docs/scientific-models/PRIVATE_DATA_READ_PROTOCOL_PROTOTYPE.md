# PRIV-S1 first slice — synthetic read contract

Authority: the existing Private Data/MyFoodData implementation decision and its
R1/R2 originals. This is a **partial, read-only protocol prototype**, not a private
vault, gateway, authentication system, customer enrollment or independent security
review. No app route, navigation setting, provider, database connection or service
is installed. Normal application composition is unchanged.

The versioned codec reuses the canonical supported-lab schema; no second nutrient
or evidence system. A source binds opaque owner/ID/revision, original lab fields,
nullable source time zone and explicit synthetic provenance. Requests bind actor,
purpose, consent/source epochs and policy revision. Unknown fields, URL/credential/
code arguments, unsupported operations and oversized inputs fail closed.

The local in-memory adapter holds at most20 immutable fixture sources and64KiB
of fixture input. Requests are capped at16KiB and responses at64KiB. It supports only read-source and
only synthetic-reference purpose. The trusted composition supplies a captured
fixture authority context and a separate current-authority callback. That callback
is a test seam, **not login, device authentication or source-truth verification**.
Do not connect it to live accounts or treat a client-provided actor as authority.

Before and after building a response, the adapter checks current owner, policy,
consent and source epochs against the captured fixture snapshot. Observed changes
or revocation close that instance; replaying an old authority cannot reopen it.
A pending read also checks the revocation latch before releasing output. This is
in-memory protection only: restart durability and an independently current source/
withdrawal authority are not provided by this adapter. It cannot claw back returned
copies or protect against a compromised trusted operator.

Default transport selection returns the supplied Cloud adapter unchanged. Local
selection needs an explicit prototype gate and injected adapter. Customer gateway
selection is unavailable. A disabled fixture adapter does not parse fixtures or
call authority. Actual production server/worker dependency graphs exclude the
prototype module. No global database/environment routing is changed.

Eight focused tests pass, including actual dependency-graph isolation. A deliberate
concurrent revocation/old-authority regression failed on the draft, then passed
with the final response-latch guard. TypeScript passes. The existing1002-test
full application baseline passed before this isolated, uninstalled slice. The
full suite has not been rerun with the new prototype tests.

## Explicitly remaining

- S1 write/correction/retraction, idempotency, bounded paging and compatible Cloud
  storage adapter composition, broader canonical source kinds and full parity.
- S2 real encrypted local persistence, authenticated exports/imports and recovery;
  raw fixture memory is not encryption or a backup.
- S3 authenticated gateway/device pairing/least-privilege runtime; no infrastructure
  setup or network activation is part of this slice.
- S4 TUF verifier/key custody and independently current revocation/freeze protection.
- Independent security/privacy review, physical iOS and real-data enrollment.

Follow P1/P2 priority and the one backlog. Do not let the optional prototype
become a separate AI/storage platform or a prerequisite for ordinary Bloom use.
