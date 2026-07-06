# Scripts

Place local developer scripts here. Scripts should be safe to run, documented,
and referenced from `AGENTS.md` or the project README when they are required for
testing, linting, security scanning, or smoke testing.

## Available Scripts

- `sync-obsidian.ps1`: mirrors `docs/*.md` into a local Obsidian vault when `NDC_STUDIO_OBSIDIAN_VAULT` is set.
- `validate-hosted-starter.ps1`: starts the hosted starter locally and verifies health, readiness, session, integration config, lab adapter state, and provisioning guardrails.
- `validate-onprem-config.ps1`: validates on-prem starter settings for state path, audit retention, rate limits, repository mode, and disabled real adapter guardrails.
- `backup-state.ps1`: copies a JSON state file into a timestamped backup location.
- `restore-state.ps1`: validates and restores a JSON state backup.
- `test-state-backup-restore.ps1`: runs a local backup/restore smoke test against sample state.
- `run-phase-gate.ps1`: runs the local phase promotion gate for tests, build, smoke, dependency audit, secret scan, and optional authorized pentest scope validation.
