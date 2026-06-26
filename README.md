# Nutanix Developer Cloud Studio

A clickable MVP prototype for a Nutanix-powered internal developer platform.

Nutanix Developer Cloud Studio shows how developers could request, launch, and govern application environments across Nutanix infrastructure, Kubernetes, databases, storage, and AI services from one self-service portal.

## MVP Scope

- Developer portal dashboard
- App catalog and golden-path templates
- Create-environment workflow
- Target choices for VM, Kubernetes, database, storage, and AI endpoint
- Policy, cost, and compliance checks
- Environment status page with simulated provisioning
- Mock integrations for NCI, NKP, NDB, NUS, NCM, and NAI
- Admin view for platform teams
- Optional mock API layer for prototype provisioning jobs

## Run The Prototype

Use this local checkout as the source of truth:

`C:\Users\john\OneDrive\09 Profile\Documents\GitHub\nutanix-developer-cloud-studio`

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

## Documentation

Project documentation lives in `docs/` and can be mirrored into the external Obsidian vault:

`C:\Users\john\OneDrive\09 Profile\Documents\OBSIDIAN VAULT GITS\Nutanix Developer Cloud Studio`

Run:

```powershell
.\scripts\sync-obsidian.ps1
```

This repo also uses a tracked Git hook in `.githooks/post-commit` so the Obsidian vault is refreshed after each local commit.

## Development Documentation Rule

As the prototype develops, update `docs/` alongside the code. The key living notes are:

- `docs/project-log.md` for milestones and decisions
- `docs/build-plan.md` for implementation sequencing
- `docs/architecture.md` for product and technical structure
- `docs/roadmap.md` for phase planning
- `docs/project-brief.md` for positioning and scope

## Repository Standards

This repository also includes project governance and delivery guidance:

- `AGENTS.md`: Codex project instructions and definition of done
- `TESTING_GUIDE.md`: testing strategy and smoke-test requirements
- `SECURITY_REVIEW.md`: defensive security review checklist
- `CODE_REVIEW.md`: review checklist and output format
- `PENTEST_SCOPE_TEMPLATE.md`: authorization template for security testing
- `CONTRIBUTING.md`: contribution workflow
- `SECURITY.md`: vulnerability reporting policy

Changes are complete only when implementation, tests, smoke testing, and any required security review are finished or explicitly documented as blocked.
