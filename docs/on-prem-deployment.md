# Nutanix Developer Cloud Studio - On-Premises Starter

## Goal

This starter deployment packages the static portal and mock API into one container so the project can be evaluated inside a private network before real Nutanix integrations are introduced.

## Local Container Run

Build and start:

```powershell
docker compose up --build
```

Open:

`http://localhost:8080`

Health checks:

```powershell
Invoke-WebRequest http://localhost:8080/healthz
Invoke-WebRequest http://localhost:8080/readyz
```

Hosted starter validation:

```powershell
.\scripts\validate-hosted-starter.ps1
```

The validation script checks health, readiness, mock session/roles, integration configuration, lab adapter availability, and the `provisioningEnabled=false` guardrail.

On-prem configuration validation:

```powershell
.\scripts\validate-onprem-config.ps1
```

The validation script checks the JSON state path, audit retention minimum, rate-limit range, repository mode, and the disabled real Prism adapter guardrail.

## Runtime Configuration

The container uses these environment variables:

- `HOST=0.0.0.0`
- `PORT=8080`
- `NDC_STATIC_DIR=/app/dist`
- `NDC_DATA_FILE=/data/ndc-studio.json`
- `NDC_REPOSITORY=json`
- `DATABASE_URL=` blank unless a future approved database driver is added
- `NDC_AUDIT_RETENTION_EVENTS=500`
- `NDC_RATE_LIMIT_PER_MINUTE=120`
- `NDC_PRISM_REAL_ADAPTER=disabled`

`NDC_DATA_FILE` stores mock API state in the `ndc-studio-data` Docker volume.

Use `.env.example` as the local template for OIDC and Nutanix lab placeholders. Keep real URLs, client IDs, credential profile names, tokens, and passwords in environment-specific secret management, not in Git.

`NDC_PRISM_REAL_ADAPTER` is documented as a guardrail. The current implementation keeps the real Prism adapter disabled even if the value is changed; the live integration path requires a future authorized phase.

`NDC_REPOSITORY=postgres` is a production-foundation scaffold. The SQL migration files are present under `server/migrations/`, but the repository intentionally fails closed until an approved PostgreSQL runtime dependency is added.

## Deployment Matrix

| Area | Starter setting | Production expectation |
| --- | --- | --- |
| Static UI | `NDC_STATIC_DIR=/app/dist` | Served by the API container or a hardened internal web tier |
| API binding | `HOST=0.0.0.0`, `PORT=8080` | Bound behind TLS ingress or reverse proxy |
| Identity | Trusted OIDC-shaped headers | Validated OIDC tokens before forwarding identity headers |
| State | `NDC_REPOSITORY=json`, `NDC_DATA_FILE=/data/ndc-studio.json` | Durable database with backup and restore tests |
| Audit | `NDC_AUDIT_RETENTION_EVENTS=500` | Retention aligned to policy and export destination |
| Rate limit | `NDC_RATE_LIMIT_PER_MINUTE=120` | Tuned per ingress and expected operator traffic |
| Prism adapter | `NDC_PRISM_REAL_ADAPTER=disabled` | Enabled only in a future authorized adapter release |

## Prototype State Backup

The starter uses a JSON file for mock state. For local evaluation, back up the state file or Docker volume before resetting the container:

```powershell
.\scripts\backup-state.ps1 -DataFile .data\ndc-studio.json
.\scripts\restore-state.ps1 -BackupFile .data\backups\ndc-studio-YYYYMMDD-HHMMSS.json
.\scripts\test-state-backup-restore.ps1
```

For a Docker volume:

```powershell
docker compose stop
docker run --rm -v nutanix-developer-cloud-studio_ndc-studio-data:/data -v ${PWD}:/backup alpine cp /data/ndc-studio.json /backup/ndc-studio.backup.json
```

Restore by copying the backup back into the same volume before starting the service. This is only a prototype workflow; a production deployment should use a real database, backup schedule, restore test, and retention policy.

## Recommended Network Placement

For a future real deployment:

- Place the backend API inside the trusted management network.
- Put a reverse proxy or ingress in front of the app for TLS.
- Keep Nutanix credentials out of the frontend.
- Store secrets in an enterprise vault or platform secret manager.
- Allow outbound access only to approved Nutanix management endpoints.

## Security Checklist

- Terminate TLS before exposing the API to users.
- Validate OIDC tokens at the API or ingress before trusting identity headers.
- Keep credential references separate from credential values.
- Keep `NDC_PRISM_REAL_ADAPTER=disabled` until an authorized adapter release.
- Review logs for sensitive values before production rollout.
- Run the phase gate and backup/restore smoke before promoting an on-prem bundle.

## Lab Adapter Guardrail

`v0.4.0-lab-adapter` is a read-only pilot phase. The app may simulate Prism Central inventory discovery, but it must not create, update, delete, clone, power on, power off, resize, or reconfigure any Nutanix resource.

Before any real API call is added, document:

- Authorized lab systems and endpoints.
- Read-only credential profile owner and storage location.
- Allowed request types.
- Explicitly excluded provisioning or mutation actions.
- Escalation contact for failed discovery.

## Future Production Requirements

- OIDC/SSO identity provider configuration
- Role-based access control
- Real database, backup, and restore process
- Audit log retention
- Nutanix adapter credentials managed by a vault
- TLS certificates and reverse proxy configuration
- Security review before enabling real provisioning
