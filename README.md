# Nutanix Developer Cloud Studio

A clickable MVP prototype for a Nutanix-powered internal developer platform.

Nutanix Developer Cloud Studio shows how developers could request, launch, and govern application environments across Nutanix infrastructure, Kubernetes, databases, storage, and AI services from one self-service portal.

Current release: `v1.6.0-production-readiness-review`

Live demo: https://virtuarchitect.github.io/nutanix-developer-cloud-studio/

## Disclaimer

This repository is an independent clickable MVP prototype. All Nutanix integrations, provisioning jobs, policy checks, costs, environments, and admin workflows are simulated for demonstration purposes only. This project does not currently provision real Nutanix infrastructure and is not affiliated with, sponsored by, or endorsed by Nutanix unless explicitly stated otherwise.

## MVP Scope

- Developer portal dashboard
- App catalog and golden-path templates
- Create-environment workflow
- Target choices for VM, Kubernetes, database, storage, and AI endpoint
- Policy, cost, and compliance checks
- Environment status page with simulated provisioning
- Mock integrations for NCI, NKP, NDB, NUS, NCM, and NAI
- Admin view for platform teams
- Hosted/on-prem starter API for prototype provisioning jobs, control-plane queue orchestration, lifecycle destroy simulation, approvals, environment details, OIDC-shaped role context, RBAC guardrails, integration configuration, provider readiness, image/profile catalog, template registry governance, policy bundles, Prism read-only inventory import, AHV VM sandbox dry-run planning, controlled provisioning gate reviews, lab authorization scope evidence, VM lifecycle proof records, fail-closed AHV controlled-provisioning preflight, platform-service request planning and preflight for NKP, NDB, NUS, and NAI, production readiness reviews, system status, request logging, rate limits, security headers, and read-only lab adapter pilots

<img width="1720" height="1260" alt="image" src="https://github.com/user-attachments/assets/355abe1b-c5d0-40b5-814f-89d051332836" />


## Run The Prototype

Install dependencies:

```powershell
npm install
```

Start the app:

```powershell
npm run dev -- --host localhost --port 4180
```

Open:

`http://localhost:4180`

Build check:

```powershell
npm run build
```

Run unit tests:

```powershell
npm run test
```

Run end-to-end smoke tests:

```powershell
npm run test:e2e
```

Run the full local verification suite:

```powershell
npm run test:all
```

## Run The Hosted/On-Prem Starter

Run the mock API locally:

```powershell
npm run api:dev
```

Build the frontend and type-check the API:

```powershell
npm run build:all
```

Run the containerized starter:

```powershell
docker compose up --build
```

Open:

`http://localhost:8080`

In the hosted/on-prem starter, the frontend auto-detects the same-origin API through `/healthz`, loads environments from `/api/environments`, and submits requests to `POST /api/environments`. If no API is available, it falls back to browser mock mode for the public GitHub Pages demo.

Validate the hosted starter locally:

```powershell
.\scripts\validate-hosted-starter.ps1
```

## Documentation

Project documentation lives in `docs/`.

To mirror the Markdown notes into a personal Obsidian vault, set `NDC_STUDIO_OBSIDIAN_VAULT` to your local vault path and run:

```powershell
$env:NDC_STUDIO_OBSIDIAN_VAULT="C:\path\to\your\Obsidian Vault"
.\scripts\sync-obsidian.ps1
```

This repo also includes a tracked Git hook in `.githooks/post-commit`. When `NDC_STUDIO_OBSIDIAN_VAULT` is set locally, the hook refreshes the vault after each local commit.

## Development Documentation Rule

As the prototype develops, update `docs/` alongside the code. The key living notes are:

- `docs/project-log.md` for milestones and decisions
- `docs/build-plan.md` for implementation sequencing
- `docs/architecture.md` for product and technical structure
- `docs/roadmap.md` for phase planning
- `docs/project-brief.md` for positioning and scope
- `docs/demo-script.md` for stakeholder walkthroughs
- `docs/hosting.md` for prototype and on-premises hosting direction
- `docs/api.md` for the backend API starter
- `docs/on-prem-deployment.md` for the containerized deployment starter
- `docs/release-notes/` for GitHub Release copy
- `docs/upgrade-path.md` for gated phase sequencing and promotion rules

## Repository Standards

This repository also includes project governance and delivery guidance:

- `AGENTS.md`: Codex project instructions and definition of done
- `TESTING_GUIDE.md`: testing strategy and smoke-test requirements
- `SECURITY_REVIEW.md`: defensive security review checklist
- `CODE_REVIEW.md`: review checklist and output format
- `PENTEST_SCOPE_TEMPLATE.md`: authorization template for security testing
- `CONTRIBUTING.md`: contribution workflow
- `SECURITY.md`: vulnerability reporting policy
- `CHANGELOG.md`: release history and planned next changes

## Automation

- `.github/workflows/ci.yml`: runs unit tests, build, and Playwright smoke tests.
- `.github/workflows/security.yml`: runs CodeQL and dependency review checks.
- `.github/workflows/phase-gate.yml`: manually validates a target phase before promotion.
- `.github/workflows/pages.yml`: builds and deploys the static prototype to GitHub Pages when Pages is enabled for the repository.

Changes are complete only when implementation, tests, smoke testing, and any required security review are finished or explicitly documented as blocked.
