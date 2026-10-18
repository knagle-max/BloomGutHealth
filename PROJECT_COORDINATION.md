# Bloom coordination — 18 October 2026

The product owner added a **Chief Architect & Integration Lead** during this implementation pass.

## Effective workflow for subsequent work

1. Marketing & Design, Security, and Nutrition & Biology maintain dated specialist findings with stable IDs, rationale, acceptance criteria and reviewed branch/SHA.
2. Chief Architect & Integration Lead reviews and consolidates all specialist recommendations, resolves cross-domain conflicts and supplies comprehensive integrated requirements.
3. Developer implements the architect-approved requirements, owns code, integration, tests, GitHub changes and release verification. Specialist proposals alone are not direct implementation instructions.
4. Developer reports each high-level implementation and status in bullets on every implementation handoff. Retain recommendation IDs and distinguish partial work, tests, deployment and independent review.
5. Specialists perform acceptance review within their specialties; implementation tests do not replace their sign-off or external assessments.

The current pass, begun before this change, is explicitly authorized by the owner to finish. Its fixed scope is recorded in SPECIALIST_IMPLEMENTATION_STATUS.md. Newly arriving specialist direction waits for architect review. This supersedes earlier documents assigning direct specialist-to-developer intake and sole cross-domain architecture authority to the Developer.

Separate chat threads do not have a direct live message channel. This repository and dated shared handoffs provide the review record; this document does not claim that another thread was notified.

Pipeline: Received → Reviewed (architect-integrated for future work) → Implemented → Tested → Specialist review. Deployment is tracked separately and never implies clinical, security or product sign-off.
