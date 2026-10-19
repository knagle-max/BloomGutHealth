# Bloom developer execution policy

See [PROJECT_COORDINATION.md](PROJECT_COORDINATION.md) for the product-owner directive and [docs/architect-r6/IMPLEMENTATION_STATUS.md](docs/architect-r6/IMPLEMENTATION_STATUS.md) for historical implementation evidence.

## Authorized objective
Deliver the complete architect-approved Bloom v0.5 release (Revision 6, amended review, Amendments B and C, original brand assets, and approved specialist handoffs). Do not mistake historical partial returns, per-increment deferrals, CI success or documentation commits for a release finish line.

## Implementation conduct
- Developer owns integration, code, database/migrations, tests, PR and deployment. Keep `main` unchanged, use `enhance/bloom-experience` and its existing review PR.
- Perform substantial end-to-end engineering per execution session, not one tiny change followed by a request to continue. Routine authorized work needs no repeat confirmation.
- Review current branch and consolidated requirements; preserve functioning behavior, avoid duplicates, and carry unfinished architect-approved scope forward.
- Treat native HealthKit and Health Connect as actual platform integrations, not web mocks. Implement real platform boundaries and permission lifecycle when in scope; accurately flag hardware/credential limitations.
- Validate types, unit/integration/security tests, production build, rendered user journeys, migration compatibility and deployed commit before marking corresponding status as verified.
- Never invent provider credentials, device access, study evidence, clinical effect sizes, legal clearance, test results, deployed status or independent review.
- P0 consent, security, clinical evidence, tenant isolation and licensing safeguards are not overridden by delivery urgency.
- Summarize feature-level statuses, SHA, test/deployment evidence and actual blockers. Status reporting is not a substitute for development.

## Session boundary
Agents do not work asynchronously after a response ends. Use available sessions to implement as much of the approved backlog as possible; explicitly distinguish open items without treating them as permission to abandon the release.
