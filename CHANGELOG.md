# Changelog

All notable changes to Nutanix Developer Cloud Studio will be documented in this file.

This project uses release tags for public milestones. The current MVP release is `v0.1.0-mvp`.

## [Unreleased]

### Planned

- Add end-to-end smoke coverage for catalog to create to environment status.
- Add a backend-shaped mock API adapter interface for future Nutanix integrations.
- Add CI checks for build and unit tests.
- Add GitHub Pages or another static hosting workflow for prototype sharing.
- Add a lightweight approval queue interaction for AI endpoint and regulated data requests.

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
