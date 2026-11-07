# Manage biological reports

The existing Biology header and Profile → Privacy & export link to `/biology/reports`. Microbiome, Bloodwork and Genetics have one category list, individual and selected actions, plus a separated category-wide action. Existing detailed source/result controls remain available. Original collection/recorded dates and upload/first-saved timestamps are distinct; absent dates/counts stay unknown.

## Storage and HTTP

`GET /api/biology/reports?category=…` adapts existing canonical stores. `DELETE /api/biology/reports` requires the authenticated actor, `X-Bloom-Report-Actor`, `X-Bloom-Confirm: delete-biological-reports`, explicit selected/category scope, exact source IDs/revisions and genetics-selection revision. It uses the existing shared workspace write budget. Responses are private/no-store; there is no new schema, raw-report store or alternate deletion engine.

A single outer transaction holds the user/account and category parent locks, validates the complete intent before mutation, then calls the existing Microbiome, Labs or Genetics deletion service. A later child failure rolls back the entire batch. Category changes/new uploads invalidate the reviewed intent. Exact selected retries with all targets absent acknowledge absence without affecting survivors; category retries acknowledge absence only when the category is empty. A stale delete-all never includes future uploads. Linked Microbiome counterparts preserve findings and unlink; Labs preserve independent same-date imports and remove dependent revision branches; Genetics active removal leaves explicit none. Known source-dependent plans are removed; unrelated plans, journal, Athlete and preferences remain. Current dependent projections and source caches refresh.

Conflicting lab identity graphs remain visible with deletion disabled, rather than silently disappearing or being merged by date. Unsupported legacy payloads retain metadata and honest unknown counts with account-export access. Maximum batch size is 1,000; larger categories use selected batches and fresh review.

## Interaction and evidence

Selection defaults to none. Confirmation lists exact source references and reliable count/unknown status, retention and derived-plan effects. Category deletion requires its exact typed phrase plus scope checkbox. Cancel preserves data and restores trigger focus; deletion restores the heading; no stale owner may write query state. Historical Genetics View opens original source facts without activation.

`tests/biological-report-management.test.ts` covers owned selected/category persistence, companion preservation, full Labs lineage, explicit Genetics none, stale arrivals/versions/selection, duplicate/foreign/partial intent, atomic rollback, HTTP auth/actor/strict body and safe retry. Existing individual-source suites remain canonical. `scripts/qa/biological-report-management-journey.mjs` exercises the actual App → HTTP handlers → encrypted isolated PGlite, including loss after committed deletion, same-command retry/reload, historical deep link, stale category additions, other categories/journal, account switch, keyboard focus, 320/390, dark and 200% zoom. Synthetic screenshots are in `review/report-management-20261106`; no private PDFs/findings are used. Physical VoiceOver, independent Design/UT and real hosted account acceptance remain NOT_RUN.
