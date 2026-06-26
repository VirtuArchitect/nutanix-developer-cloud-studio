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

## Runtime Configuration

The container uses these environment variables:

- `HOST=0.0.0.0`
- `PORT=8080`
- `NDC_STATIC_DIR=/app/dist`
- `NDC_DATA_FILE=/data/ndc-studio.json`

`NDC_DATA_FILE` stores mock API state in the `ndc-studio-data` Docker volume.

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
