# Nutanix Developer Cloud Studio - Project Log

## 2026-06-26

- Confirmed the project as a viable MVP and clickable product prototype.
- Selected the recommended repository name: `nutanix-developer-cloud-studio`.
- Created the initial repo documentation structure.
- Created the external Obsidian vault mirror at `C:\Users\john\OneDrive\09 Profile\Documents\OBSIDIAN VAULT GITS\Nutanix Developer Cloud Studio`.
- Added an Obsidian sync script.
- Configured a tracked Git post-commit hook to refresh the Obsidian vault after local commits.
- Added build plan and architecture notes as living project documentation.
- Built the first clickable React prototype.
- Added dashboard, catalog, create-environment workflow, environment status, and admin views.
- Added mock Nutanix integrations for NCI, NKP, NDB, NUS, NCM, and NAI.
- Added a generated project visual asset for the dashboard.
- Verified production build with `npm run build`.
- Started local dev server at `http://localhost:4180`.
- Verified desktop render, create-environment flow, and mobile layout.
- Replaced the app shell logo and browser favicon with the Veridian teal mark.

## Documentation Rule

When the product changes, update the relevant Markdown files in `docs/` during the same work session. The Obsidian vault is a mirror of those notes.

Recommended updates:

- Update `project-log.md` after meaningful milestones
- Update `roadmap.md` when scope changes
- Update `architecture.md` when implementation structure changes
- Update `project-brief.md` when product positioning changes
- Run `.\scripts\sync-obsidian.ps1` after documentation changes, or commit locally to trigger the post-commit sync
