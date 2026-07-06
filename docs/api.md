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
- Approval queue, environment detail, and admin integration readiness views read from API endpoints in hosted/on-prem API mode.
- Session, role context, integration configuration, and integration readiness checks are API-backed mock records.
- System status and lab adapter pilot state are API-backed so hosted/on-prem demos can show provisioning guardrails.
- Control-plane job state is API-backed so the hosted starter can model queue, worker, retry, and failure behavior.
- Provider readiness, platform configuration references, and image/profile inventory are API-backed for adapter planning.
- Environment destroy requests queue simulated teardown lifecycle jobs; no real infrastructure is deleted.
- Template registry, resource profile governance, and policy bundles are API-backed so platform teams can model publication controls before real provisioning is enabled.
- Prism Central read-only inventory import is API-backed and remains mock-only until lab authorization enables live discovery.

## Endpoints

### Health

- `GET /healthz`: process health
- `GET /readyz`: storage readiness

### Catalog And Runtime Data

- `GET /api/templates`
- `GET /api/session`
- `GET /api/system/status`
- `GET /api/environments`
- `GET /api/integrations`
- `GET /api/integration-config`
- `GET /api/lab-adapters`
- `GET /api/prism/inventory`
- `GET /api/resource-profiles`
- `GET /api/policy-bundles`
- `GET /api/registry/templates`
- `GET /api/platform/config`
- `GET /api/provisioning/adapters`
- `GET /api/provisioning-jobs`
- `GET /api/control-plane/jobs`
- `GET /api/approvals`
- `GET /api/audit-events`
- `GET /api/environments/:name`

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

The API returns a mock environment, mock provisioning jobs, an audit event, and an approval request when the target/template requires platform review.

### Environment Lifecycle

- `POST /api/environments/:name/destroy`

The destroy endpoint marks the mock environment as `Destroying`, queues a control-plane teardown job, and writes audit evidence. It does not call real Nutanix APIs and does not delete infrastructure.

### Provider Inventory And Adapter Readiness

- `GET /api/resource-profiles`
- `POST /api/resource-profiles/:id/submit`
- `POST /api/resource-profiles/:id/approve`
- `POST /api/resource-profiles/:id/deprecate`
- `POST /api/resource-profiles/:id/restore`
- `GET /api/platform/config`
- `GET /api/provisioning/adapters`

These endpoints expose the starter inventory and adapter-planning model:

- AHV image candidates
- NKP Kubernetes version profiles
- NDB database engine profiles
- NUS storage class profiles
- NAI AI endpoint profiles
- Project, cluster, network, and credential-reference placeholders
- Adapter capabilities for validate, plan, provision, poll, and destroy

Secrets are not stored in the API state. Credential fields are references only.

### Registry Governance

- `GET /api/policy-bundles`
- `GET /api/registry/templates`
- `POST /api/registry/templates/:id/submit`
- `POST /api/registry/templates/:id/approve`
- `POST /api/registry/templates/:id/deprecate`
- `POST /api/registry/templates/:id/restore`

Template registry actions update mock publication state and audit evidence. Resource profile actions use the same lifecycle so platform teams can model approval and deprecation of AHV, NKP, NDB, NUS, and NAI catalog records. These actions do not enable real provisioning.

### Approval Decisions

- `POST /api/approvals/:id/approve`
- `POST /api/approvals/:id/reject`

Approval decisions update the stored approval request, write an audit event, and move the associated mock environment to `Provisioning` or `Failed`.

### Integration Configuration

- `PUT /api/integration-config/:name`
- `POST /api/integrations/:name/check`

Example request:

```json
{
  "endpoint": "https://prism.lab.example",
  "credentialProfile": "nci-readonly"
}
```

The readiness check updates the mock integration configuration to `Reachable`, `Failed`, or `Not configured`. It does not call real Nutanix services.

### Lab Adapter Pilot

- `GET /api/system/status`
- `GET /api/lab-adapters`
- `POST /api/lab-adapters/:name/discover`
- `GET /api/prism/inventory`
- `POST /api/prism/inventory/import`

The discovery endpoint simulates read-only adapter readiness. The Prism inventory import endpoint imports mock read-only cluster, project, image, network, category, and VM records after NCI integration config is reachable. Imported image records are mapped into draft AHV image profile candidates for registry review. Provisioning remains disabled in the API response and UI.

### Control Plane Jobs

- `GET /api/control-plane/jobs`
- `POST /api/control-plane/jobs/:id/advance`
- `POST /api/control-plane/jobs/:id/retry`
- `POST /api/control-plane/jobs/:id/fail`

Control-plane jobs model queue and worker execution states. Worker actions update transition history and audit events. They do not call real infrastructure APIs.

## Current Limits

- No real Nutanix API calls.
- No authentication or authorization yet.
- Session and role context are mocked for OIDC readiness only.
- No production database yet.
- No secret storage yet.
- GitHub Pages uses browser mock mode because no backend is deployed with the static site.
- Approval decisions are mock governance records only; they do not authorize real infrastructure changes.
- Prism inventory import is simulated and read-only; no real Prism Central calls are made yet.
- Control-plane worker actions are simulated; provisioning remains disabled.
- Destroy lifecycle actions are simulated; teardown remains disabled.
- Resource profiles and adapter readiness are planning records only.
- Template registry and policy bundles are governance planning records only.
