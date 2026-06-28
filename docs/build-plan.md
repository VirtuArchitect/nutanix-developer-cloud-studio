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

- `docs/upgrade-path.md` defines the gated phase sequence from `v0.5.0-control-plane` through `v1.0.0-private-cloud-developer-platform`.
- `scripts/run-phase-gate.ps1` runs local phase promotion checks.
- `.github/workflows/phase-gate.yml` provides a manual GitHub Actions phase gate.
- Active penetration testing remains blocked unless authorization and scope are documented first.

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
