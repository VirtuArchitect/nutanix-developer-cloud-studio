# Changelog

All notable changes to Nutanix Developer Cloud Studio will be documented in this file.

This project uses release tags for public milestones. The current release is `v2.1.0-audit-export-retention-hardening`.

## [Unreleased]

### Planned

- Add a real AHV create adapter only after authorized lab scope, completed gate review, rollback/destroy validation, and pentest gate.
- Promote platform-service plans to real adapters only after VM lifecycle proof and service-specific authorization.
- Prevent deprecated profiles from being selected in new request flows after profile selection becomes user-facing.

## [v2.1.0-audit-export-retention-hardening] - 2026-07-06

### Added

- Audit export manifests with event count, retention window, generated timestamp, destination reference, and SHA-256 checksum.
- Audit retention diagnostics API for retained event count, bounds, oldest/newest events, and destination status.
- Admin Operations retention diagnostics and manifest evidence.
- Audit export destination-reference validation that rejects embedded auth material.
- Phase gate validation for audit export configuration.
- Tests for manifest creation, checksum format, destination validation, retention diagnostics, and API/client coverage.

### Notes

- Export destination references are metadata only and do not store access material.
- Audit export remains a prepared record until external storage is configured.
- Real provisioning remains disabled.

## [v2.0.0-postgres-repository-hardening] - 2026-07-06

### Added

- Postgres repository configuration validator with fail-closed connection string and schema checks.
- Postgres readiness metadata that confirms the database driver remains intentionally absent.
- Startup validation before binding the API when `NDC_REPOSITORY=postgres`.
- Migration scaffold validation script.
- Phase gate coverage for migration and Postgres configuration validation.
- Tests for Postgres configuration, schema validation, readiness metadata, and scaffold fail-closed behavior.

### Notes

- No PostgreSQL runtime dependency was added.
- `NDC_REPOSITORY=postgres` remains a hardened scaffold until an approved database driver phase.
- Real provisioning remains disabled.

## [v1.9.0-oidc-rbac-hardening] - 2026-07-06

### Added

- Optional strict trusted-header mode through `NDC_REQUIRE_TRUSTED_IDENTITY=true`.
- Fail-closed `401` behavior for API routes when required trusted identity headers are missing.
- Public health/readiness probe exemption for strict identity deployments.
- Session diagnostics API with trusted-header mode, missing header list, and role/action matrix.
- Admin Overview identity boundary and authorization matrix panel.
- Tests for diagnostics, strict trusted-header denial, and client coverage.

### Notes

- Trusted-header mode expects a reverse proxy or ingress to validate OIDC before forwarding identity headers.
- Real provisioning remains disabled.
- `provisioningEnabled` remains `false`.

## [v1.8.0-on-prem-packaging-hardening] - 2026-07-06

### Added

- On-prem configuration validation script for state path, audit retention, rate limit, repository mode, and real-adapter guardrails.
- JSON state backup, restore, and backup/restore smoke scripts.
- Phase gate checks for on-prem configuration validation and backup/restore smoke.
- Compose environment hardening for repository mode, audit retention, rate limiting, and disabled Prism real adapter guardrail.
- Expanded on-prem deployment runbook with validation, backup/restore, deployment matrix, and security checklist.

### Notes

- Backup/restore tooling is for the JSON starter state file and does not replace a production database backup design.
- Real Nutanix mutation adapters remain disabled.
- `provisioningEnabled` remains `false`.

## [v1.7.0-private-cloud-developer-platform] - 2026-07-06

### Added

- API-backed private-cloud lifecycle operation records for extend, suspend, destroy, and rebuild requests.
- API-backed audit export readiness records with retention and redaction boundaries.
- Admin Operations tab for lifecycle requests and audit export preparation.
- Tests and smoke coverage for operations and audit export workflows.

### Notes

- Lifecycle operations are gated operator records only; they do not call Nutanix APIs.
- Real provider mutation remains disabled until a separate authorized adapter release.
- `provisioningEnabled` remains `false`.

## [v1.6.0-production-readiness-review] - 2026-07-06

### Added

- Production readiness review records.
- API endpoints for listing and creating production readiness reviews.
- Admin Overview panel for running readiness review checks.
- Readiness checks for OIDC boundary, durable state, audit retention, lab authorization, VM lifecycle proof, AHV preflight, platform-service preflight coverage, and provisioning guardrail.
- Audit evidence and automated coverage for production readiness behavior.

### Notes

- Reviews are gate evidence only and do not enable live provisioning.
- Current reviews remain blocked until real OIDC ingress, durable state, lab authorization, lifecycle proof, and full preflight evidence are present.
- `provisioningEnabled` remains `false`.

## [v1.5.0-platform-service-preflight] - 2026-07-06

### Added

- Fail-closed platform-service preflight adapter interface for NKP, NDB, NUS, and NAI.
- API endpoints for listing and recording platform-service preflight runs.
- Admin Control Plane panel for service preflight checks.
- Checks for request validation, VM lifecycle proof, provider readiness, adapter configuration, and real-adapter switch state.
- Provider-specific blocked operation evidence for namespace, database, storage, and AI endpoint flows.
- Audit evidence and automated coverage for platform-service preflight behavior.

### Notes

- No NKP, NDB, NUS, or NAI API calls are made.
- Platform service preflight remains a disabled-adapter boundary.
- `provisioningEnabled` remains `false`.

## [v1.4.0-ahv-preflight-boundary] - 2026-07-06

### Added

- Fail-closed AHV controlled-provisioning adapter interface.
- Disabled real-adapter preflight run records for controlled VM create/destroy preparation.
- API endpoints for listing and recording AHV controlled-provisioning preflight runs.
- Admin Control Plane panel for running AHV preflight checks.
- Preflight checks for controlled gate approval, active lab scope, verified lifecycle proof, controlled create switch, and AHV adapter enablement.
- Audit evidence and automated coverage for AHV preflight behavior.

### Notes

- The adapter boundary does not call Prism Central.
- All AHV mutation operations remain blocked and recorded as blocked operations.
- `provisioningEnabled` remains `false`.

## [v1.3.0-lifecycle-evidence] - 2026-07-06

### Added

- Lab authorization scope records with project, cluster, network, allowed actions, excluded actions, approval window, and pentest scope evidence.
- VM lifecycle proof records for controlled gate, rollback, and destroy evidence.
- API endpoints for listing and recording lab authorization scopes and lifecycle proofs.
- Admin Control Plane evidence panel for scope and lifecycle-proof records.
- Controlled provisioning gates now consume active lab authorization scope evidence.
- Platform-service flows now depend on recorded VM lifecycle proof rather than an environment flag.
- Unit/API/client/E2E coverage for authorization and lifecycle evidence.

### Notes

- Lifecycle proof records do not perform real AHV operations.
- Real provisioning remains disabled; `provisioningEnabled=false` is preserved.
- A proof is blocked unless the controlled gate reaches `Approved for controlled create`.

## [v1.2.0-platform-services] - 2026-07-06

### Added

- Platform-service request model for NKP namespace, NDB PostgreSQL, NUS storage, and NAI endpoint flows.
- API endpoints for listing and planning platform-service requests.
- Validation for published service profiles, provider match, service naming, environment mapping, and VM lifecycle proof.
- Admin Control Plane panel for planning NKP, NDB, NUS, and NAI platform-service flows.
- Cost estimates, approval evidence, rollback notes, cleanup plans, and audit events for platform-service requests.
- Unit/API/client/E2E coverage for platform-service planning behavior.

### Notes

- Platform-service requests are planning records only. They do not call NKP, NDB, NUS, or NAI APIs.
- Requests remain blocked until controlled VM create, verify, rollback, and destroy proof exists.
- `provisioningEnabled` remains `false`.

## [v1.1.0-controlled-provisioning] - 2026-07-06

### Added

- Controlled provisioning gate model for AHV VM sandbox dry-run plans.
- API endpoints for listing, requesting, approving, and rejecting controlled provisioning gate reviews.
- Gate checks for dry-run validation, rollback readiness, destroy readiness, manual approval, authorized scope evidence, and disabled-by-default mutation kill switch.
- Admin Control Plane panel for requesting and deciding controlled provisioning gate reviews.
- Audit events for controlled provisioning gate request and approval decisions.
- Unit/API/client/E2E coverage for controlled provisioning gate behavior.

### Notes

- This release still does not create, clone, power on, resize, tag, or delete AHV VMs.
- Approval records gate intent only. `provisioningEnabled` remains `false` until a future authorized real adapter phase.

## [v1.0.0-vm-sandbox-dry-run] - 2026-07-06

### Added

- AHV VM sandbox dry-run planning model.
- API endpoints for listing and creating VM sandbox dry-run plans.
- Validation for published VM template, approved AHV image, project, cluster, network, lifecycle category, quota, expiry, and approval evidence.
- Cost estimate, rollback plan, and explicit `provisioningEnabled=false` evidence in each dry-run plan.
- Admin Control Plane panel for generating and reviewing VM sandbox dry-run plans.
- Unit/API/client/E2E coverage for VM sandbox dry-run behavior.

### Notes

- This release does not create, clone, power on, resize, or delete AHV VMs.
- Failed validations are reported in the dry-run plan instead of triggering provisioning.

## [v0.9.0-production-foundation] - 2026-07-06

### Added

- OIDC-shaped request context using trusted prototype headers for user, display name, roles, and issuer.
- RBAC guardrails for admin, approval, registry, integration, control-plane, destroy, and inventory import actions.
- Security headers for API and static responses.
- In-memory rate limiting for the hosted starter API.
- Structured JSON request logging with request IDs, actor, status, and duration.
- Request body size guardrail for JSON API requests.
- Audit retention enforcement for memory and JSON-file stores.
- Postgres repository scaffold and initial SQL migration for state and audit-event storage.
- GitHub Security workflow with CodeQL and dependency review.

### Notes

- The Postgres repository is intentionally scaffolded without a runtime database driver. Adding a PostgreSQL dependency requires explicit approval.
- Auth and RBAC remain starter controls for the hosted prototype. Production deployment still needs a real OIDC validation layer in front of trusted headers.

## [v0.8.0-prism-readonly-inventory] - 2026-07-06

### Added

- Prism Central read-only inventory adapter contract with mock and disabled-real implementations.
- API-backed Prism inventory import endpoint guarded by reachable NCI integration configuration.
- Prism inventory records for clusters, projects, images, networks, categories, and VMs.
- Import summary evidence showing read-only mode, blocked mutation operations, scope, and provisioning disabled.
- Draft AHV image resource profile candidates generated from imported Prism image inventory.
- Admin Providers panel for Prism read-only inventory import and imported record review.
- Unit/API/client/E2E coverage for Prism inventory import and profile candidate mapping.

### Notes

- No live Prism Central API call is made in this release. The real adapter path remains disabled by code.
- Imported inventory is read-only planning evidence and does not enable create, update, delete, power, clone, or resize operations.

## [v0.7.0-registry-governance] - 2026-07-02

### Added

- API-backed template registry with draft, pending approval, published, and deprecated states.
- API-backed policy bundle catalog for standard sandbox, data protection, AI safety, and regulated audit controls.
- Registry lifecycle actions for template versions: submit, approve, deprecate, and restore.
- Resource profile governance actions for image, Kubernetes, database, storage, and AI profile records.
- Audit evidence for template and resource profile governance transitions.
- Admin Templates tab sections for image/profile catalog, template registry, policy bundles, and template governance.
- Unit/API/client/E2E coverage for registry governance and policy bundle behavior.

### Changed

- Changed the Admin view from a long stacked panel list to tabbed sections for overview, providers, control plane, governance, and templates.
- Replaced the app badge, sidebar logo, and favicon with the primary Nutanix Developer Cloud Studio SVG logo.

### Notes

- Registry governance remains simulated. Publishing a template or resource profile does not enable real provisioning.

## [v0.6.0-provisioning-adapters] - 2026-06-28

### Added

- Provisioning adapter contract with validate, plan, provision, poll, and destroy capabilities.
- API-backed provider readiness endpoint for NCI, NKP, NDB, NUS, NCM, and NAI adapter placeholders.
- API-backed image and profile catalog for AHV images, NKP versions, NDB engines, NUS storage classes, and NAI profiles.
- Platform configuration model for project, cluster, network, and credential-reference planning without storing real secrets.
- Simulated environment destroy lifecycle that queues a control-plane teardown job and audit evidence.
- Admin Image and Template Catalog panel and Provider Readiness panel.
- Environment detail control-plane lifecycle panel.
- Unit/API/client/E2E coverage for provider inventory and destroy lifecycle behavior.

### Notes

- Adapter contracts are mock-only. Real provisioning and real teardown remain disabled.

## [v0.5.0-control-plane] - 2026-06-28

### Added

- Provisioning control-plane job domain with queued, validating, awaiting approval, provisioning, ready, failed, and expired states.
- Mock orchestrator worker actions for advancing, retrying, and failing jobs.
- API endpoints for `/api/control-plane/jobs` and job actions.
- Control-plane audit events for queueing, transitions, retries, failures, and approval release.
- Admin Provisioning Control Plane panel with worker controls.
- Dashboard Control Plane Queue panel and active job status tile.
- Browser mock control-plane state machine for static GitHub Pages mode.
- Unit/API/client/E2E coverage for control-plane queue behavior.

### Notes

- The control plane is structurally ready for future adapters, but real infrastructure provisioning remains disabled.

## [v0.4.0-lab-adapter] - 2026-06-27

### Added

- Read-only lab adapter snapshot model with explicit `provisioningEnabled: false` guardrail.
- API endpoints for `/api/system/status`, `/api/lab-adapters`, and read-only discovery simulation.
- Admin Lab Adapter Pilot panel showing adapter scope, inventory count, discovery timestamp, and safe discovery action.
- Dashboard provisioning status tile showing provisioning disabled and read-only candidate count.
- Backup/restore unit coverage for JSON-file prototype state.
- Hosted starter validation now checks system status, lab adapter availability, and provisioning guardrail.

### Changed

- Playwright smoke now covers integration configuration, readiness check, lab discovery, and provisioning-disabled guardrail.

### Notes

- The lab adapter pilot is deliberately read-only and simulated. It does not call Prism Central or any real Nutanix API yet.

## [v0.3.0-integration-readiness] - 2026-06-26

### Added

- Mock OIDC session endpoint and role model for developer, approver, and platform admin workflows.
- API-backed integration configuration endpoint for lab endpoint and credential profile placeholders.
- API-backed integration readiness check endpoint with configured, reachable, failed, and not configured states.
- Database-ready `ApiRepository` persistence contract while keeping memory and JSON-file implementations.
- Admin access model panel showing current mock identity and roles.
- Admin integration configuration panel with editable endpoint/profile fields and readiness checks.
- Dashboard refresh that prioritizes environment operations and reduces the visual hero into a compact command-center panel.
- Hosted starter validation script for health, readiness, session, and integration configuration checks.
- Expanded `.env.example` for OIDC and Nutanix lab integration placeholders.

### Changed

- README, API docs, architecture notes, roadmap, and build plan now describe the integration-readiness phase.

### Notes

- Auth, roles, and integration checks remain simulated. No real SSO, Nutanix credentials, or infrastructure calls are used.

## [v0.2.0-hosted-starter] - 2026-06-26

### Added

- Frontend API auto-detection through `/healthz` for hosted/on-prem mode.
- API-backed environment loading and environment request submission.
- API-backed approval queue with approve/reject decisions.
- API-backed environment detail endpoint with environment, jobs, approvals, and audit events.
- Dashboard layout refresh toward an ops/on-prem console with runtime, approval, environment, and readiness status.
- Admin integration readiness panel connected to API data.
- Browser mock fallback when the hosted API is unavailable.
- Node HTTP API starter with health, readiness, catalog, environment, integration, job, approval, and audit endpoints.
- Memory and JSON-file persistence abstractions for hosted/on-prem mock API state.
- Dockerfile and Docker Compose starter for private-network evaluation.
- API and on-prem deployment documentation.
- Server-side API tests.
- GitHub Actions CI workflow for unit tests, production build, and Playwright smoke tests.
- GitHub Pages deployment workflow for the static prototype.
- Playwright end-to-end smoke test for the core prototype workflow.
- Backend-shaped mock Nutanix adapter contracts and tests.
- Repository-owned dashboard screenshot asset for the README.

### Changed

- Playwright can target an API-hosted built app with `PLAYWRIGHT_BASE_URL`.
- Playwright smoke now covers the approval queue and environment detail view.
- Vite now emits relative asset paths for repository-path static hosting.
- README now references the repo-owned dashboard screenshot instead of a GitHub attachment URL.

### Notes

- This release is still a prototype milestone. Hosted/on-prem mode uses simulated integrations and mock persistence only.

## [v0.1.0-mvp] - 2026-06-26

### Added

- Clickable developer portal dashboard.
- Golden-path app catalog.
- Template details view with outcomes and integration readiness notes.
- Create-environment workflow with target choices for VM, Kubernetes, database, storage, and AI endpoint.
- Simulated policy, cost, compliance, and integration checks.
- Environment status page with timed mock provisioning transitions.
- Approval pause behavior for AI endpoint requests.
- Platform admin view with integration health, governance queue, platform controls, template governance editing, and integration readiness notes.
- Mock Nutanix integration concepts for NCI, NKP, NDB, NUS, NCM, and NAI.
- Browser local storage persistence for requested environments and template governance edits.
- Mock provisioning service for cost estimates, persistence, request upserts, status updates, and job transitions.
- Vitest unit coverage for provisioning service behavior.
- Primary SVG app logo and browser favicon.
- Dashboard visual and public README screenshot.
- Project documentation for architecture, build plan, roadmap, product brief, demo script, hosting notes, testing, security, contribution, and code review.
- Configurable Obsidian documentation sync using `NDC_STUDIO_OBSIDIAN_VAULT`.
- GitHub issue templates for bug reports, feature requests, and documentation updates.
- GitHub pull request template aligned to the project definition of done.

### Changed

- Moved prototype mock data from the main app component into dedicated domain data files.
- Clarified public README disclaimer that the project is currently a simulated MVP prototype and does not currently provision real Nutanix infrastructure.
- Removed personal local filesystem paths from public documentation.

### Security

- Confirmed no real `.env` files are committed; only `.env.example` is tracked.
- Confirmed no credentials, API keys, tokens, or private keys are present in docs or code scans.
- Added public contribution and PR guidance to avoid secrets, customer data, private infrastructure details, and private local paths.

### Notes

- This release is a prototype milestone. It does not currently call real Nutanix APIs or provision real infrastructure.
