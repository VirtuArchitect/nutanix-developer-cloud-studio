# Nutanix Developer Cloud Studio - API Starter

## Purpose

The API starter moves the project toward a hosted and on-premises architecture while keeping all provisioning behavior mocked. It creates a real HTTP boundary that can later be backed by Nutanix adapters, identity, database storage, and audit controls.

## Runtime

Run the API locally:

```powershell
npm run api:dev
```

Default URL:

`http://localhost:8080`

Useful environment variables:

- `HOST`: bind address. Default: `0.0.0.0`
- `PORT`: listen port. Default: `8080`
- `NDC_STATIC_DIR`: optional static frontend directory to serve from the same process
- `NDC_DATA_FILE`: optional JSON file for persisted mock API state
- `VITE_API_BASE_URL`: optional frontend build-time override for API calls. Leave empty for same-origin `/api`.

## Frontend API Mode

The React frontend now checks `/healthz` on load:

- If the API responds, the app enters hosted/on-prem API mode and loads environments from `/api/environments`.
- If the API is unavailable, the app stays in browser mock mode for GitHub Pages and local Vite demos.
- Environment launches call `POST /api/environments` in API mode and fall back to browser mock behavior if the request fails.

## Endpoints

### Health

- `GET /healthz`: process health
- `GET /readyz`: storage readiness

### Catalog And Runtime Data

- `GET /api/templates`
- `GET /api/environments`
- `GET /api/integrations`
- `GET /api/provisioning-jobs`
- `GET /api/audit-events`

### Environment Requests

`POST /api/environments`

Example request:

```json
{
  "name": "checkout-api-dev",
  "templateId": "spring-postgres",
  "owner": "demo.user",
  "region": "Berlin Lab",
  "targets": ["Kubernetes", "Database", "Storage"]
}
```

The API returns a mock environment, mock provisioning jobs, and an audit event.

## Current Limits

- No real Nutanix API calls.
- No authentication or authorization yet.
- No production database yet.
- No secret storage yet.
- GitHub Pages uses browser mock mode because no backend is deployed with the static site.
