# Nutanix Developer Cloud Studio - Rollback Pack

## Rollback Trigger Conditions

- Failed health or readiness checks after upgrade.
- Failed CI, Security, runtime package, on-prem config, backup, or hosted starter validation.
- Unexpected state write failures.
- Evidence that a runtime setting drifted toward real Prism calls or real provisioning.
- Operator concern that audit, backup, or identity evidence is incomplete.

## Required Files

- Last known-good release tag.
- Last known-good JSON state backup.
- Matching `.manifest.json` file.
- Current failed release logs.
- Runtime environment settings with secrets redacted.

## Rollback Procedure

```powershell
docker compose stop
.\scripts\restore-state.ps1 -BackupFile .data\backups\LAST-KNOWN-GOOD.json -DataFile .data\ndc-studio.json
git checkout LAST-KNOWN-GOOD-TAG
npm install
npm run build
npm run build:api
npm run validate:runtime
npm run validate:onprem
npm run validate:backup
docker compose up --build
```

## Acceptance Criteria

- `/healthz` returns healthy.
- `/readyz` returns ready.
- `/api/system/status` reports `provisioningEnabled=false`.
- Admin Providers shows read-only Prism network calls disabled.
- Backup manifest verification passes.
- Operator records rollback evidence and release impact.

## Do Not Proceed If

- Backup manifest checksum fails.
- Runtime configuration enables `NDC_PRISM_REAL_ADAPTER`.
- Any real credential value is found in repo, docs, logs, or JSON state.
- The service cannot prove `provisioningEnabled=false`.
