# Nutanix Developer Cloud Studio - Operator Runbook And Rollback Pack

## Purpose

This runbook supports the on-prem starter and controlled read-only Prism preparation phases. It is operational evidence for running, upgrading, backing up, restoring, validating, and rolling back the prototype while real Prism calls and real provisioning remain disabled.

## Preconditions

- `NDC_PRISM_REAL_ADAPTER=disabled`
- `NDC_REPOSITORY=json` unless an approved future database phase changes this
- `NDC_DATA_FILE` points to a writable state file or mounted volume
- `NDC_STATIC_DIR` points to the built `dist` directory
- No Nutanix credentials, tokens, passwords, or client secrets are stored in the repository or JSON state file

## Install

```powershell
npm install
npm run build
npm run build:api
npm run validate:runtime
npm run validate:onprem
npm run validate:backup
```

For container evaluation:

```powershell
docker compose up --build
```

Validate:

```powershell
Invoke-WebRequest http://localhost:8080/healthz
Invoke-WebRequest http://localhost:8080/readyz
.\scripts\validate-hosted-starter.ps1
```

## Upgrade

1. Confirm the target release notes and changelog entry.
2. Confirm all GitHub Actions checks are green.
3. Stop the running service.
4. Back up the JSON state file and manifest.
5. Deploy the new build or container image.
6. Run health, readiness, runtime package, on-prem config, and backup validation.
7. Open Admin > Providers and verify read-only Prism diagnostics still show network calls disabled.

## Backup

```powershell
.\scripts\backup-state.ps1 -DataFile .data\ndc-studio.json
```

Keep both files:

- `ndc-studio-YYYYMMDD-HHMMSS.json`
- `ndc-studio-YYYYMMDD-HHMMSS.json.manifest.json`

The manifest records schema version, source file, timestamp, file size, SHA-256 checksum, and the provisioning-disabled guardrail.

## Restore

```powershell
.\scripts\restore-state.ps1 -BackupFile .data\backups\ndc-studio-YYYYMMDD-HHMMSS.json -DataFile .data\ndc-studio.json
```

Restore verifies the manifest when present. If validation fails, do not start the service from that backup.

## Rollback

1. Stop the current service.
2. Restore the last known-good state backup.
3. Re-deploy the last known-good release tag or container image.
4. Run `npm run validate:runtime`, `npm run validate:onprem`, and `npm run validate:backup`.
5. Start the service and verify `/healthz`, `/readyz`, and `/api/system/status`.
6. Record rollback evidence in the project log or change ticket.

## Emergency Stop

Use emergency stop when a release shows unexpected behavior, state corruption, authentication boundary issues, or accidental configuration drift toward live infrastructure.

Immediate actions:

- Stop the service or scale the container to zero.
- Keep `NDC_PRISM_REAL_ADAPTER=disabled`.
- Remove any accidental live endpoint secrets from runtime environment variables.
- Preserve logs and the current state file for review.
- Restore from the last known-good backup only after manifest verification.

## Release Validation

Run before promoting an on-prem bundle:

```powershell
npm run test
npm run build:api
npm run build
npm run validate:runtime
npm run validate:onprem
npm run validate:backup
.\scripts\validate-hosted-starter.ps1
```

Expected guardrails:

- `provisioningEnabled=false`
- `networkCallEnabled=false` for read-only Prism scaffold diagnostics
- Read-only lab gates may be recorded, but real Prism calls remain disabled
- Mock Prism simulator evidence is clearly marked simulated
- Backup manifests validate before restore

## Evidence Capture

Capture these references for each release:

- Git commit SHA
- GitHub Release URL
- CI, Security, and Deploy workflow results
- Backup file and manifest checksum
- Runtime package validation output
- Hosted starter validation output
- Screenshot or note confirming Admin Providers read-only Prism boundary

## Production Boundary

This runbook does not authorize real Prism connectivity or provisioning. A future live read-only adapter phase must define lab authorization, credential storage, allowed operations, network controls, security review, and rollback evidence before any real API call is enabled.
