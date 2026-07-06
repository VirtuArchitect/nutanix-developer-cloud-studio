# Nutanix Developer Cloud Studio - Upgrade Path

## Operating Principle

NDC Studio should advance through gated phases. Each phase must prove that the previous phase still works before the next phase is started or promoted.

The gate is deliberately conservative:

- Build and type checks must pass.
- Unit and API tests must pass.
- End-to-end smoke tests must pass.
- Hosted/on-prem starter validation must pass.
- Dependency audit must pass.
- Secret scanning must pass.
- Penetration or vulnerability testing must only run after authorization and scope are documented.

## Phase Promotion Flow

```mermaid
flowchart LR
    Plan["Phase plan"] --> Build["Implement phase"]
    Build --> Unit["Unit/API tests"]
    Unit --> Smoke["UI + hosted smoke"]
    Smoke --> Security["Security gate"]
    Security --> Scope{"Pentest scope required?"}
    Scope -->|No| Promote["Tag/release candidate"]
    Scope -->|Yes| Auth["Approved scope file"]
    Auth --> Pentest["Authorized test window"]
    Pentest --> Promote
    Promote --> Next["Start next phase"]
```

## Automated Gate

Run locally:

```powershell
.\scripts\run-phase-gate.ps1 -TargetPhase v1.0.0-vm-sandbox-dry-run
```

With an explicitly authorized security scope:

```powershell
.\scripts\run-phase-gate.ps1 `
  -TargetPhase v1.0.0-vm-sandbox-dry-run `
  -PentestScopePath .\PENTEST_SCOPE_TEMPLATE.md `
  -IncludeAuthorizedPentest
```

The script does not perform unsafe or out-of-scope testing. It runs defensive checks and verifies that a scope file exists before any active security testing is treated as a release gate.

## Phase Sequence

### v0.5.0-control-plane

Goal: add the provisioning control-plane skeleton without real infrastructure mutation.

Build:

- Provisioning job queue domain.
- Worker/orchestrator abstraction.
- Job state machine: queued, validating, awaiting approval, provisioning, ready, failed, expired.
- Retry and failure model.
- Audit evidence for every state transition.
- UI for queued/running/failed jobs.
- Provisioning remains disabled unless an adapter explicitly supports a safe action.

Exit gate:

- Existing smoke tests pass.
- Hosted validation passes.
- Job queue tests cover success, failure, retry, and approval pause.
- Security review confirms no untrusted shell execution or unsafe path handling.

### v0.6.0-provisioning-adapters

Goal: define adapter contracts and what the platform is allowed to create.

Build:

- Provisioning adapter contract for validate, plan, provision, poll, and destroy.
- AHV image registry records.
- NKP namespace/profile registry records.
- NDB profile registry records.
- NUS storage class registry records.
- NAI/GPU endpoint profile records.
- Platform configuration references.
- Simulated destroy lifecycle with teardown queue evidence.

Exit gate:

- Adapter and provider inventory endpoints are covered by tests.
- Destroy lifecycle queues a simulated teardown job.
- Smoke test covers provider readiness and destroy lifecycle.
- Security review covers configuration and sensitive endpoint handling.

### v0.7.0-registry-governance

Goal: govern template and profile publication before real integration.

Build:

- Template version states: draft, published, deprecated.
- Resource profile states and deprecation controls.
- Owner approval before publishing.
- Policy bundle selection per version.

Exit gate:

- Registry governance APIs are covered by unit/API/client tests.
- Admin smoke test covers registry and profile status transitions.
- Audit evidence is written for governance actions.
- Published status remains a planning record and does not enable real provisioning.

### v0.8.0-prism-readonly-inventory

Goal: move from simulated discovery toward real read-only Prism Central inventory.

Build:

- Adapter interface for Prism Central inventory.
- Read-only endpoint configuration.
- Inventory import model for clusters, projects, images, networks, categories, and VMs.
- Discovery evidence and last-sync metadata.
- No create/update/delete API calls.

Exit gate:

- Mock adapter tests pass.
- Real adapter remains disabled unless lab scope is approved.
- Authorized scope file exists before any live endpoint testing.
- Smoke test proves imported inventory appears in registry/admin views.

### v0.9.0-production-foundation

Goal: turn the starter into a production-shaped control plane before enabling real provisioning.

Build:

- OIDC session validation.
- Role-based access control for admin, approval, registry, integration, and provisioning actions.
- Postgres repository implementation and migrations.
- Audit retention model and export boundary.
- Request logging, correlation IDs, rate limits, and security headers.
- CI gates for dependency review, CodeQL, SBOM, and container image scanning.

Exit gate:

- Auth and authorization tests cover permitted and denied access.
- Migration and repository tests pass against a disposable database.
- Security review confirms request logging redacts sensitive values.
- Production deployment remains provisioning-disabled by default.

### v1.0.0-vm-sandbox-dry-run

Goal: design the first VM sandbox path as dry-run only.

Build:

- Linux VM App Sandbox dry-run planning adapter.
- Fixed image/profile/subnet choices from approved registry.
- Owner, cost, expiry, and environment tags.
- Quota, category, image, subnet, project, and expiry validation.
- Approval evidence and rollback/destroy plan preview.

Exit gate:

- Penetration/security scope is approved.
- Test lab is explicitly in scope.
- Dry-run mode passes.
- Manual approval gate is required before real provisioning is enabled.

### v1.1.0-controlled-provisioning

Goal: enable one narrowly scoped VM provisioning path after dry-run and authorization gates pass.

Build:

- One approved AHV VM sandbox create path.
- Manual approval required for every real create request.
- Rollback and destroy workflow with operator confirmation.
- Runtime kill switch that disables all mutation calls.
- Audit evidence for request, approval, create, rollback, and destroy operations.

Exit gate:

- Authorized lab scope and test window are documented.
- Pentest gate is complete for the scoped lab target.
- Real provisioning is limited to approved image, project, subnet, category, and quota.
- Cleanup/destroy is tested before broader use.

### v1.2.0-platform-services

Goal: add platform services after VM sandbox proves the control plane.

Build:

- NKP namespace provisioning.
- Resource quota and network policy.
- NDB profile-backed PostgreSQL request.
- NUS storage allocation request.
- Backup and retention metadata.

Exit gate:

- Each service has rollback/cleanup documentation.
- Stateful services require approval.
- Smoke tests cover failure and approval paths.

### v1.3.0-private-cloud-developer-platform

Goal: release as an operational internal developer platform candidate.

Build:

- OIDC/SSO integration.
- Role-based access control.
- Production database.
- Audit export.
- Lifecycle operations: extend, suspend, destroy, rebuild.
- Operational runbooks.

Exit gate:

- Auth and authorization tests pass.
- Audit and data-retention review passes.
- Production readiness review is complete.
- Real provisioning is enabled only for approved targets and approved golden paths.

## Automatic Implementation Rule

After each phase is implemented, run the phase gate. If it passes:

1. Update `CHANGELOG.md`.
2. Update `docs/project-log.md`.
3. Add release notes under `docs/release-notes/`.
4. Tag the release.
5. Start the next phase from the upgrade path.

If the gate fails, stop phase promotion and fix the failing gate before adding new scope.
