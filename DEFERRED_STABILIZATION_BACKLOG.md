# Deferred stabilization

Owner core-functionality directive (3d2c6f8/b04b9b2) governs task selection. Deliver core A–E journeys first. Existing safety/source/permission invariants remain required; deferral is not release acceptance.

| ID | Classification | Repro / impact | Workaround | Revisit |
| --- | --- | --- | --- | --- |
| STAB-FOOD-12-DURABLE | P2 enhancement | Closing/reloading the page discards visit-only offline draft/request memory. UI explicitly requires keeping it open; existing saved server records remain canonical. Across-restart recovery is not implemented. | Keep the open draft; reconnect/review/retry, or inspect the journal after an uncertain confirmation. | After normal food, Everyday, import and Athlete journeys work; define scoped protected device retention/expiry before adding persistence. |

Do not expand rare date, unsupported schema, concurrency or stress matrices absent an observed defect or plausible material harm. Record a concrete issue once with affected normal path, severity and next milestone when discovered.
