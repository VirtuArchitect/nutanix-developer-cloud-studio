# Changelog

All notable changes to Nutanix Developer Cloud Studio will be documented in this file.

This project uses release tags for public milestones. The current release is `v0.2.0-hosted-starter`.

## [Unreleased]

### Planned

- Add OIDC-ready auth boundaries and role modeling.
- Add a database-ready repository interface to replace JSON-file persistence.
- Add template versioning states: draft, published, deprecated, and owner approval.
- Add first real lab adapter spike once Prism Central/NKP/NDB/NUS/NCM/NAI access details are available.

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
- Veridian mark app logo and browser favicon.
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
