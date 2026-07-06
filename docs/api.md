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
- `NDC_REPOSITORY`: `json` by default; `postgres` is validated but remains scaffold-only
- `NDC_DATABASE_SCHEMA`: schema name used by the Postgres scaffold validator
- `VITE_API_BASE_URL`: optional frontend build-time override for API calls. Leave empty for same-origin `/api`.

## Frontend API Mode

The React frontend now checks `/healthz` on load:

- If the API responds, the app enters hosted/on-prem API mode and loads environments from `/api/environments`.
- If the API is unavailable, the app stays in browser mock mode for GitHub Pages and local Vite demos.
- The hosted API derives a prototype OIDC session from trusted headers and applies RBAC guardrails to mutating routes.
- Environment launches call `POST /api/environments` in API mode and fall back to browser mock behavior if the request fails.
- Approval queue, environment detail, and admin integration readiness views read from API endpoints in hosted/on-prem API mode.
- Session, role context, integration configuration, and integration readiness checks are API-backed mock records.
- System status and lab adapter pilot state are API-backed so hosted/on-prem demos can show provisioning guardrails.
- Control-plane job state is API-backed so the hosted starter can model queue, worker, retry, and failure behavior.
- Provider readiness, platform configuration references, and image/profile inventory are API-backed for adapter planning.
- Environment destroy requests queue simulated teardown lifecycle jobs; no real infrastructure is deleted.
- Template registry, resource profile governance, and policy bundles are API-backed so platform teams can model publication controls before real provisioning is enabled.
- Prism Central read-only inventory import is API-backed and remains mock-only until lab authorization enables live discovery.
- AHV VM sandbox dry-run planning is API-backed and validates inputs without provisioning.

## Endpoints

### Health

- `GET /healthz`: process health
- `GET /readyz`: storage readiness

Health and readiness endpoints remain public when strict trusted identity mode is enabled so load balancers and orchestrators can probe the service.

### Catalog And Runtime Data

- `GET /api/templates`
- `GET /api/session`
- `GET /api/session/diagnostics`
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
- `GET /api/vm-sandbox/dry-runs`
- `GET /api/approvals`
- `GET /api/audit-events`
- `GET /api/environments/:name`

`GET /api/session/diagnostics` returns trusted-header mode, missing required identity headers, and the role/action matrix surfaced in the Admin Overview.

When `NDC_REQUIRE_TRUSTED_IDENTITY=true`, API routes fail closed with `401 unauthenticated` unless `x-ndc-user`, `x-ndc-roles`, and `x-ndc-issuer` are present. Health endpoints remain public.

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

Required role: `Developer` or `Platform Admin`.

### Environment Lifecycle

- `POST /api/environments/:name/destroy`

The destroy endpoint marks the mock environment as `Destroying`, queues a control-plane teardown job, and writes audit evidence. It does not call real Nutanix APIs and does not delete infrastructure.

Required role: `Platform Admin`.

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

Required role: `Platform Admin`.

### Approval Decisions

- `POST /api/approvals/:id/approve`
- `POST /api/approvals/:id/reject`

Approval decisions update the stored approval request, write an audit event, and move the associated mock environment to `Provisioning` or `Failed`.

Required role: `Approver` or `Platform Admin`.

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

Required role: `Platform Admin`.

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

Required role: `Platform Admin`.

### VM Sandbox Dry-Run

- `GET /api/vm-sandbox/dry-runs`
- `POST /api/vm-sandbox/dry-runs`

The VM sandbox dry-run endpoint validates the Linux VM App Sandbox path against approved AHV image profiles, project, cluster, network, lifecycle category, quota, expiry, cost, and approval evidence. It returns validation results, cost estimate, approval evidence, and rollback-plan notes with `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Controlled Provisioning Gate

- `GET /api/vm-sandbox/controlled-provisioning`
- `POST /api/vm-sandbox/controlled-provisioning`
- `POST /api/vm-sandbox/controlled-provisioning/:id/approve`
- `POST /api/vm-sandbox/controlled-provisioning/:id/reject`

The controlled provisioning gate attaches to a VM sandbox dry-run plan and records operator readiness before any future real create path. It evaluates dry-run validation, rollback readiness, destroy readiness, manual approval, authorized lab scope evidence, and a disabled-by-default mutation kill switch. Decisions write audit events and keep `provisioningEnabled=false`.

Required roles: `Platform Admin` to request a gate review; `Platform Admin` or `Approver` to approve or reject.

### Lab Authorization And Lifecycle Evidence

- `GET /api/lab-authorization/scopes`
- `POST /api/lab-authorization/scopes`
- `GET /api/vm-lifecycle/proofs`
- `POST /api/vm-lifecycle/proofs`

Lab authorization scopes record the approved project, cluster, network, test window, allowed actions, excluded actions, and pentest scope evidence required before controlled create work can be considered. VM lifecycle proofs record gate, rollback, and destroy evidence after an approved controlled gate. These records do not perform real infrastructure actions.

Required role: `Platform Admin` to record evidence.

### AHV Controlled Provisioning Preflight

- `GET /api/ahv/controlled-provisioning/runs`
- `POST /api/ahv/controlled-provisioning/runs`

The AHV controlled provisioning preflight endpoint evaluates the controlled VM create boundary against gate approval, active lab scope, lifecycle proof, controlled create switch, and AHV adapter enablement. It records the checks and blocked mutation operations. It does not call Prism Central and returns `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Platform Service Requests

- `GET /api/platform-services/requests`
- `POST /api/platform-services/requests`

The platform-service request endpoint plans NKP namespace, NDB PostgreSQL, NUS storage, and NAI endpoint flows. It validates the published resource profile, provider mapping, service name, environment reference, and VM lifecycle proof. Requests include cost estimates, approval evidence, rollback notes, cleanup plans, and `provisioningEnabled=false`.

Required role: `Developer` or `Platform Admin`.

### Platform Service Preflight

- `GET /api/platform-services/preflight-runs`
- `POST /api/platform-services/preflight-runs`

The platform-service preflight endpoint evaluates NKP, NDB, NUS, and NAI adapter readiness against request validation, VM lifecycle proof, provider readiness, adapter configuration, and real-adapter switch state. It records provider-specific blocked mutation operations and returns `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Readiness Reviews

- `GET /api/production-readiness/reviews`
- `POST /api/production-readiness/reviews`

The production readiness endpoint records a release-gate review across identity, durable state, audit retention, lab authorization, VM lifecycle proof, AHV preflight, platform-service preflight coverage, and the global provisioning-disabled guardrail. It does not enable real provisioning.

Required role: `Platform Admin`.

### Private Cloud Lifecycle Operations

- `GET /api/private-cloud/lifecycle-operations`
- `POST /api/private-cloud/lifecycle-operations`

Lifecycle operations record extend, suspend, destroy, and rebuild requests against tracked environments. Each record checks production readiness review status, controlled gate approval, lifecycle proof, audit export availability, and keeps `provisioningEnabled=false`. These records are operator workflow evidence only and do not call provider APIs.

Required role: `Platform Admin`.

### Audit Export Records

- `GET /api/audit-exports`
- `POST /api/audit-exports`

Audit export records prepare export metadata, event counts, retention windows, redaction boundaries, and storage boundaries for on-prem operations. The starter records export readiness metadata only; production deployments must configure external storage before real export delivery.

Required role: `Platform Admin`.

## Production Foundation Controls

The hosted starter now adds:

- OIDC-shaped session context from `x-ndc-user`, `x-ndc-display-name`, `x-ndc-roles`, and `x-ndc-issuer` headers.
- RBAC checks for mutating API routes.
- Security headers on API and static responses.
- In-memory rate limiting through `NDC_RATE_LIMIT_PER_MINUTE`.
- JSON request logging with request ID, actor, status, path, and duration.
- Audit retention through `NDC_AUDIT_RETENTION_EVENTS`.
- Postgres repository scaffold and migrations under `server/migrations/`.
- Postgres repository configuration and migration validation through `scripts/validate-postgres-repository.ps1`.

Trusted headers are a starter boundary only. A production deployment should validate OIDC tokens at the API or an ingress/reverse proxy before forwarding identity headers.

## Current Limits

- No real Nutanix API calls.
- No authentication or authorization yet.
- Session and role context are mocked for OIDC readiness only.
- No production database yet.
- Postgres mode validates configuration but remains scaffold-only until an approved runtime driver phase.
- No secret storage yet.
- GitHub Pages uses browser mock mode because no backend is deployed with the static site.
- Approval decisions are mock governance records only; they do not authorize real infrastructure changes.
- Prism inventory import is simulated and read-only; no real Prism Central calls are made yet.
- Control-plane worker actions are simulated; provisioning remains disabled.
- Destroy lifecycle actions are simulated; teardown remains disabled.
- Resource profiles and adapter readiness are planning records only.
- Template registry and policy bundles are governance planning records only.
