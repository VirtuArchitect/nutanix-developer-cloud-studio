# Nutanix Developer Cloud Studio

A clickable MVP prototype for a Nutanix-powered internal developer platform.

Nutanix Developer Cloud Studio is intended to show how developers could request, launch, and govern application environments across Nutanix infrastructure, Kubernetes, databases, storage, and AI services from one self-service portal.

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

The Obsidian vault is intentionally outside the GitHub repo so notes, stakeholder context, and working product thinking remain easy to browse in Obsidian without depending on GitHub.

## Development Documentation Rule

As the prototype develops, update `docs/` alongside the code. The key living notes are:

- `docs/project-log.md` for milestones and decisions
- `docs/build-plan.md` for implementation sequencing
- `docs/architecture.md` for product and technical structure
- `docs/roadmap.md` for phase planning
- `docs/project-brief.md` for positioning and scope
