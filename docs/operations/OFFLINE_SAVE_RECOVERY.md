# Visit-scoped meal recovery (FOOD-12)

The existing mutation client retains a user-requested meal review or confirmed save in memory when offline. LogMeal now shows its waiting state. A resumed review checks the mounted page and current actor before sending; existing confirmed-save guards check the same boundary and the server review revision/receipt remains authoritative. A queued analysis cannot insert a journal record without the later explicit confirmation.

After an uncertain save, an optional offline-only checkbox retries the same frozen body/review revision/idempotency key on reconnection. It is bound to the current actor and attempt, consumes one reconnect event, supports opt-out and removes listeners on unmount. There is no automatic review of a new draft, repeated retry loop or 4xx conflict retry. A source conflict requires renewed review. Manual recovery remains available.

Scope is explicitly the open page/visit. No sensitive localStorage/IndexedDB, persistent queue, background job or across-restart recovery is introduced. Keep the page open, or inspect the canonical journal. Durable offline storage is a later scoped enhancement, not claimed by this implementation.

Representative actual React/HTTP/PostgreSQL checks pass: ordinary confirmed receipt retry after lost response (same key/body/revision; one row), opt-out, repeated online event, queued save/resume, source conflict, navigation before queued save or queued review, and review-only resume without journal insertion. Five existing receipt/review API regressions, types/build and source inventories pass. Synthetic network events are not physical-device offline acceptance.
