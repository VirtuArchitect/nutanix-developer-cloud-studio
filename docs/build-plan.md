# Nutanix Developer Cloud Studio - Build Plan

## Recommended Next Step

Build the first clickable prototype as a polished web app with simulated data and mock provisioning workflows.

The goal is to make the product thesis visible quickly: developers can request governed environments, and platform teams can control templates, integrations, policies, and cost.

## First Implementation Slice

- Created a modern frontend app shell
- Added developer dashboard
- Added app catalog with golden-path templates
- Added create-environment workflow
- Added simulated policy, cost, and compliance checks
- Added environment status page with provisioning timeline
- Added admin view for platform teams
- Kept all data mocked locally first

## Next Implementation Slice

- Extract mock data into dedicated domain files - done
- Add persisted local state for requested environments - done
- Add a richer job simulation with timed status transitions - done
- Add template detail pages - done
- Add admin template editing states - done
- Add integration readiness notes for Prism Central, NKP, NDB, NUS, NCM, and NAI - done

## Current Implementation Slice

- Mock product data now lives in `src/data/cloudStudioData.ts`
- Mock provisioning behavior now lives in `src/services/provisioningService.ts`
- Requested environments persist in browser local storage
- Admin template governance edits persist in browser local storage
- The environment status screen advances through timed mock job states
- AI endpoint requests pause at an approval state
- Catalog templates have a details view with outcomes and integration readiness
- Admins can edit prototype template owner and tier state
- Admin integration readiness notes describe the first real API questions for NCI, NKP, NDB, NUS, NCM, and NAI
- Unit tests cover cost estimates, persistence, environment upsert/status behavior, and job transitions
- `docs/demo-script.md` provides the stakeholder walkthrough
- `docs/hosting.md` captures prototype and on-premises hosting direction

## Next Recommended Slice

- Add an end-to-end smoke test for catalog to create to status - done
- Add a backend-shaped mock API adapter interface for future Nutanix integrations - done
- Add CI checks for build and unit tests - done
- Add GitHub Pages or another static hosting workflow for prototype sharing - done
- Add a repo-owned dashboard screenshot asset - done
- Add a lightweight approval queue interaction for AI endpoint and regulated data requests

## Current Upgrade Slice

- Playwright smoke coverage now verifies dashboard, catalog, template detail, create environment, environment status, and admin readiness.
- GitHub Actions CI runs unit tests, production build, and the Playwright smoke test.
- GitHub Pages deployment workflow builds the static prototype from `main`.
- Vite uses relative asset paths for repository-path static hosting.
- README uses `docs/assets/dashboard-screenshot.png` instead of a GitHub attachment URL.
- Mock Nutanix adapter contracts define readiness checks, provisioning jobs, and resource descriptions for future real integrations.

## Next Upgrade Slice

- Create the GitHub Release from tag `v0.1.0-mvp` if it has not already been created in GitHub.
- Enable GitHub Pages in repository settings and confirm the deployed URL.
- Add a backend API starter with mock providers - done
- Add a containerized on-prem deployment starter - done
- Add a lightweight approval queue interaction for AI endpoint and regulated data requests.
- Add environment detail pages with owner, cost, resources, timeline, mock logs, and expiry state.
- Add template versioning states: draft, published, deprecated, and owner approval.

## Hosted / On-Prem Starter Slice

- Added a Node HTTP API in `server/`.
- Added health and readiness endpoints.
- Added API routes for templates, environments, integrations, provisioning jobs, and audit events.
- Added a POST environment request endpoint with validation, mock jobs, and audit events.
- Added memory and JSON-file persistence abstractions.
- Added Dockerfile and Docker Compose starter deployment.
- Added API and on-prem deployment documentation.
- Added server-side tests for API behavior.

## Next Hosted / On-Prem Slice

- Wire the frontend to the API when `VITE_API_BASE_URL` or same-origin `/api` is available - done.
- Keep local mock mode as a fallback for GitHub Pages - done.
- Add real approval queue views backed by the API.
- Add OIDC-ready auth boundaries and role modeling.
- Replace JSON-file persistence with a database-ready repository interface.

## Current Hosted / On-Prem Slice

- Frontend checks `/healthz` at startup to detect hosted/on-prem API mode.
- API mode loads environments from `/api/environments`.
- API mode launches environment requests through `POST /api/environments`.
- Browser mock mode remains the fallback for GitHub Pages, plain Vite dev, and API failures.
- Playwright can target either Vite dev or an API-hosted built app through `PLAYWRIGHT_BASE_URL`.
- API-backed approval queue supports approve/reject decisions for hosted/on-prem starter demos.
- API-backed environment detail view shows environment metadata, provisioning jobs, approvals, and audit events.
- Dashboard layout now leans toward an operations/on-prem console with runtime, readiness, approvals, and environment drill-downs.
- Admin integration readiness reads API data in hosted/on-prem mode.
- Playwright smoke coverage exercises approval queue and environment detail.

## Next Hosted / On-Prem Slice

- Add OIDC-ready auth boundaries and role modeling - done.
- Add a database-ready repository interface to replace JSON-file persistence - done.
- Add integration configuration and readiness checks for lab planning - done.
- Add hosted starter validation script - done.
- Add template versioning states: draft, published, deprecated, and owner approval.
- Add a read-only lab adapter spike - done.
- Add a real Prism Central read-only API call once authorization and scope are approved.

## Current Integration Readiness Slice

- API exposes a mock OIDC session through `/api/session`.
- Role context models developer, approver, and platform admin access for future authorization.
- API exposes integration configuration records through `/api/integration-config`.
- API exposes mock readiness checks through `/api/integrations/:name/check`.
- Admin view includes access model and integration configuration panels.
- Dashboard first screen prioritizes environment operations and compact status rather than a large hero.
- `scripts/validate-hosted-starter.ps1` validates health, readiness, session, and integration configuration endpoints.

## Current Lab Adapter Slice

- API exposes `/api/system/status` with provisioning explicitly disabled.
- API exposes `/api/lab-adapters` for read-only adapter pilot state.
- API exposes `/api/lab-adapters/:name/discover` to simulate read-only discovery.
- Admin view includes a Lab Adapter Pilot panel with discovery action and guardrail messaging.
- JSON-file prototype state backup/restore has unit coverage.

## Phase Automation Slice

- `docs/upgrade-path.md` defines the gated phase sequence from `v0.5.0-control-plane` through `v1.3.0-private-cloud-developer-platform`.
- `scripts/run-phase-gate.ps1` runs local phase promotion checks.
- `.github/workflows/phase-gate.yml` provides a manual GitHub Actions phase gate.
- Active penetration testing remains blocked unless authorization and scope are documented first.

## Current Control Plane Slice

- Control-plane jobs are created for environment requests.
- Approval-required jobs pause in `AwaitingApproval` and return to `Queued` after approval.
- Mock worker actions advance, retry, or fail jobs.
- Audit events record queueing, transitions, failures, retries, and approval release.
- Dashboard and admin views expose control-plane queue health.

## Current Provisioning Adapter Slice

- Provisioning adapters now expose validate, plan, provision, poll, and destroy capabilities.
- API exposes provider readiness records for NCI, NKP, NDB, NUS, NCM, and NAI.
- API exposes image/profile inventory for AHV images, Kubernetes versions, database engines, storage classes, and AI profiles.
- API exposes platform configuration references for project, cluster, network, and credential profile.
- Admin view includes Image and Template Catalog and Provider Readiness panels.
- Environment destroy requests queue simulated teardown jobs and audit evidence.
- Real provisioning and teardown remain disabled.

## Current Registry Governance Slice

- API exposes policy bundles and template registry versions.
- Template registry versions can move through draft, pending approval, published, deprecated, and restored states.
- Resource profiles can be submitted, approved, deprecated, and restored through API-backed governance actions.
- Admin Templates tab groups image/profile catalog, template registry, policy bundles, and editable template governance.
- Audit events capture template and resource profile governance transitions.
- Real provisioning remains disabled even when a template or profile is marked published.

## Current Prism Read-Only Inventory Slice

- Added a Prism inventory adapter contract with mock and disabled-real implementations.
- API imports read-only Prism inventory only after NCI configuration is reachable.
- Imported records cover cluster, project, image, network, category, and VM metadata.
- Imported image records become draft AHV image profile candidates for registry review.
- Admin Providers tab includes Prism inventory import evidence and blocked mutation operations.
- Real Prism Central calls and all mutation operations remain disabled.

## Current Production Foundation Slice

- API request context models OIDC-style user, issuer, display name, and roles.
- RBAC guardrails protect mutating admin, approval, registry, integration, control-plane, destroy, and inventory import actions.
- API and static responses include security headers.
- Hosted starter includes in-memory rate limiting and structured request logging.
- Memory and JSON-file stores enforce audit retention.
- Postgres repository and migration files are scaffolded without adding a runtime database dependency.
- GitHub Security workflow adds CodeQL and dependency review checks.

## Current VM Sandbox Dry-Run Slice

- API creates and lists AHV VM sandbox dry-run plans.
- Dry-run validation checks published VM template, approved AHV image, project, cluster, network, lifecycle category, quota, expiry, and approval evidence.
- Plans include cost estimate, rollback-plan notes, and `provisioningEnabled=false`.
- Admin Control Plane tab can generate and review dry-run plans.
- No Prism Central mutation calls are made.

## Current Controlled Provisioning Gate Slice

- API creates and lists controlled provisioning gate reviews attached to VM sandbox dry-run plans.
- Gate checks cover dry-run validation, rollback readiness, destroy readiness, manual approval, authorized lab scope evidence, and mutation kill switch state.
- Admin Control Plane tab can request, approve, and reject gate reviews.
- Gate approval records operator intent only; `provisioningEnabled=false` remains enforced.

## Current Lifecycle Evidence Slice

- API records lab authorization scopes with project, cluster, network, test window, allowed actions, excluded actions, and pentest scope evidence.
- API records VM lifecycle proof with controlled gate, rollback, and destroy checks.
- Controlled provisioning gates can consume active lab authorization scope evidence.
- Platform-service planning depends on recorded VM lifecycle proof.
- No AHV create, rollback, or destroy calls are made.

## Current AHV Preflight Boundary Slice

- API records AHV controlled-provisioning preflight runs.
- Preflight checks controlled gate approval, active lab scope, verified lifecycle proof, controlled create switch, and AHV adapter enablement.
- Disabled real-adapter boundary records blocked mutation operations.
- Admin Control Plane tab can run the preflight.
- No Prism Central mutation calls are made.

## Current Platform Services Slice

- API creates and lists NKP namespace, NDB PostgreSQL, NUS storage, and NAI endpoint request plans.
- Request validation checks published profile, provider mapping, service name, environment reference, and VM lifecycle proof.
- Plans include cost estimates, approval evidence, rollback notes, cleanup plans, and `provisioningEnabled=false`.
- Admin Control Plane tab can plan the four platform-service flows.
- No NKP, NDB, NUS, or NAI API calls are made.

## Current Platform Service Preflight Slice

- API records platform-service preflight runs for NKP, NDB, NUS, and NAI.
- Preflight checks request validation, VM lifecycle proof, provider readiness, adapter configuration, and real-adapter switch state.
- Disabled real-adapter boundary records provider-specific blocked operations.
- Admin Control Plane tab can run service preflight checks.
- No NKP, NDB, NUS, or NAI mutation calls are made.

## Current Production Readiness Review Slice

- API records production readiness reviews.
- Reviews check OIDC boundary, durable state, audit retention, lab authorization, VM lifecycle proof, AHV preflight, platform-service preflight coverage, and provisioning guardrail.
- Admin Overview tab can run readiness reviews.
- Reviews remain evidence records and do not enable real provisioning.

## Current Private Cloud Developer Platform Slice

- API records private-cloud lifecycle operations for extend, suspend, destroy, and rebuild.
- Lifecycle checks cover production readiness review, controlled gate approval, VM lifecycle proof, and audit export availability.
- API records audit export readiness metadata with event count, retention, redaction boundary, and storage boundary.
- Admin Operations tab exposes lifecycle requests and audit export preparation.
- Lifecycle operations and exports remain evidence records and do not call Nutanix APIs.

## Current On-Prem Packaging Hardening Slice

- Compose environment now carries explicit repository, audit retention, rate limit, and disabled adapter settings.
- On-prem configuration validation checks state path, retention, rate limit, repository mode, and real-adapter guardrails.
- JSON state backup and restore scripts support local starter operations.
- Backup/restore smoke is part of the phase gate.
- On-prem runbook includes deployment matrix, backup/restore commands, and security checklist.

## Current OIDC RBAC Hardening Slice

- API supports optional strict trusted-header mode with `NDC_REQUIRE_TRUSTED_IDENTITY=true`.
- Strict mode returns `401 unauthenticated` for API routes missing required ingress identity headers.
- Health and readiness probes remain public for load balancers and orchestrators.
- Session diagnostics expose trusted-header mode, missing headers, and role/action matrix.
- Admin Overview surfaces identity boundary and RBAC matrix for operators.

## Current Postgres Repository Hardening Slice

- Postgres mode validates required connection string and schema naming before startup.
- Repository readiness metadata confirms the runtime driver is not installed yet.
- Migration scaffold validation checks SQL files during the phase gate.
- Database connection values are not logged by validators.
- `NDC_REPOSITORY=postgres` remains fail-closed until an approved runtime driver phase.

## Current Audit Export Retention Hardening Slice

- Audit exports include manifest metadata and SHA-256 checksums.
- Retention diagnostics expose current event count, retention window, bounded status, oldest/newest event timestamps, and destination status.
- Admin Operations surfaces retention diagnostics and manifest evidence.
- Destination-reference validation rejects embedded auth material.
- Export delivery remains metadata-only until external storage is configured.

## Current Provider Credential Reference Hardening Slice

- Provider integration configs validate credential profile references.
- Inline access material is rejected before configuration is saved.
- Admin Providers tab surfaces missing, invalid, and approved credential references.
- Phase gate validates provider credential reference shape.
- Audit events record that a reference is configured, not the reference value.

## Suggested Tech Stack

- React or Next.js for the prototype UI
- TypeScript for safer product modeling
- Tailwind CSS or a small local design system for fast UI polish
- Mock data files for templates, environments, policies, integrations, and jobs
- Optional API later once the workflow is validated

## Success Criteria

- A stakeholder can understand the product in under five minutes
- A developer can complete a create-environment flow without explanation
- The prototype feels realistic enough to discuss real Nutanix integration priorities
- The admin view explains platform-team value, not just developer convenience
