# Scripts

Place local developer scripts here. Scripts should be safe to run, documented,
and referenced from `AGENTS.md` or the project README when they are required for
testing, linting, security scanning, or smoke testing.

## Available Scripts

- `sync-obsidian.ps1`: mirrors `docs/*.md` into a local Obsidian vault when `NDC_STUDIO_OBSIDIAN_VAULT` is set.
- `validate-hosted-starter.ps1`: starts the hosted starter locally and verifies health, readiness, session, integration config, lab adapter state, and provisioning guardrails.
- `validate-onprem-config.ps1`: validates on-prem starter settings for state path, audit retention, rate limits, repository mode, and disabled real adapter guardrails.
- `validate-runtime-package.ps1`: validates Dockerfile, Compose, `.env.example`, static/API serving, healthcheck, and disabled adapter guardrails.
- `validate-postgres-repository.ps1`: validates migration files, schema naming, and fail-closed Postgres repository configuration without opening a database connection.
- `validate-onprem-profile-pack.ps1`: validates on-prem profile templates for disabled real-adapter guardrails and missing secret material.
- `validate-audit-export-config.ps1`: validates audit retention and export destination references without connecting to external storage.
- `validate-provider-credential-references.ps1`: validates provider credential profile references and rejects inline access material.
- `backup-state.ps1`: copies a JSON state file into a timestamped backup location and writes a SHA-256 manifest.
- `restore-state.ps1`: validates state shape, verifies the manifest when present, and restores a JSON state backup.
- `test-state-backup-restore.ps1`: runs a local backup/restore smoke test against sample state and validates the manifest checksum.
- `run-phase-gate.ps1`: runs the local phase promotion gate for tests, build, smoke, dependency audit, secret scan, and optional authorized pentest scope validation.
