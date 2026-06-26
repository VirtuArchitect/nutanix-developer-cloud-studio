# Nutanix Developer Cloud Studio - Hosting Notes

## Prototype Hosting

For stakeholder demos, the app can be hosted as a static frontend because the current MVP has no live backend or Nutanix credentials.

Good prototype targets:

- GitHub Pages
- Netlify
- Azure Static Web Apps
- An internal static web server

## On-Premises Enterprise Hosting

For a real enterprise implementation, host the portal inside the customer network or private cloud where it can reach approved Nutanix management endpoints.

Recommended on-premises pattern:

- Static frontend served from an internal web tier
- Backend API inside the trusted network
- SSO/OIDC for user identity
- Secret storage in an approved vault
- Nutanix API adapters for Prism Central, NCM, NKP, NDB, NUS, and NAI
- Audit logging for requests, approvals, and provisioning events

## On-Premises Starter Deployment

The repository now includes a containerized starter that serves the built frontend and mock API from one process.

Run locally:

```powershell
docker compose up --build
```

Open:

`http://localhost:8080`

The starter exposes:

- `GET /healthz`
- `GET /readyz`
- `GET /api/templates`
- `GET /api/environments`
- `POST /api/environments`
- `GET /api/integrations`
- `GET /api/provisioning-jobs`
- `GET /api/audit-events`

Mock API state can be persisted with `NDC_DATA_FILE`.

## Integration Boundary

Keep Nutanix credentials and provisioning logic out of the browser. The frontend should call a backend API, and the backend should own policy checks, approvals, audit logging, and Nutanix API calls.

## First Deployment Recommendation

Use static hosting for the clickable MVP first. Move to on-premises or private-cloud hosting when real Nutanix APIs, SSO, credentials, and audit requirements are introduced.

## Current Prototype Deployment

The current static prototype is published with GitHub Pages:

`https://virtuarchitect.github.io/nutanix-developer-cloud-studio/`
