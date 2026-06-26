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

## Runtime Configuration

The container uses these environment variables:

- `HOST=0.0.0.0`
- `PORT=8080`
- `NDC_STATIC_DIR=/app/dist`
- `NDC_DATA_FILE=/data/ndc-studio.json`

`NDC_DATA_FILE` stores mock API state in the `ndc-studio-data` Docker volume.

Use `.env.example` as the local template for OIDC and Nutanix lab placeholders. Keep real URLs, client IDs, credential profile names, tokens, and passwords in environment-specific secret management, not in Git.

## Prototype State Backup

The starter uses a JSON file for mock state. For local evaluation, back up the state file or Docker volume before resetting the container:

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

## Future Production Requirements

- OIDC/SSO identity provider configuration
- Role-based access control
- Real database, backup, and restore process
- Audit log retention
- Nutanix adapter credentials managed by a vault
- TLS certificates and reverse proxy configuration
- Security review before enabling real provisioning
