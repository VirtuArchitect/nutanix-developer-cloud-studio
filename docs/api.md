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
- `NDC_AUDIT_EXPORT_DESTINATION_REF`: optional metadata-only export destination reference
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
- `GET /api/provider-credentials/diagnostics`
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
- `GET /api/audit/retention`
- `GET /api/environments/:name`

`GET /api/session/diagnostics` returns trusted-header mode, missing required identity headers, and the role/action matrix surfaced in the Admin Overview.

When `NDC_REQUIRE_TRUSTED_IDENTITY=true`, API routes fail closed with `401 unauthenticated` unless `x-ndc-user`, `x-ndc-roles`, and `x-ndc-issuer` are present. Health endpoints remain public.

`GET /api/provider-credentials/diagnostics` returns provider credential reference status for NCI, NKP, NDB, NUS, NCM, and NAI. Diagnostics validate that integration configuration stores profile references only and rejects inline access material.

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

- `GET /api/provider-credentials/diagnostics`
- `PUT /api/integration-config/:name`
- `POST /api/integrations/:name/check`

Example request:

```json
{
  "endpoint": "https://prism.lab.example",
  "credentialProfile": "nci-readonly"
}
```

The readiness check updates the mock integration configuration to `Reachable`, `Failed`, or `Not configured`. It does not call real Nutanix services. Credential profile values are validated as reference names, and inline access material is rejected before persistence.

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
- `GET /api/lab-authorization/diagnostics`
- `GET /api/vm-lifecycle/proofs`
- `POST /api/vm-lifecycle/proofs`
- `GET /api/vm-sandbox/rollback-destroy-proofs`
- `POST /api/vm-sandbox/rollback-destroy-proofs`
- `GET /api/vm-sandbox/controlled-create-authorization`
- `POST /api/vm-sandbox/controlled-create-authorization`
- `GET /api/ahv/create-adapter-contracts`
- `POST /api/ahv/create-adapter-contracts`

Lab authorization scopes record the approved project, cluster, network, target environment, provider coverage, target endpoint references, test window, allowed actions, excluded actions, evidence references, rollback owner, and pentest scope evidence required before controlled create work can be considered.

`GET /api/lab-authorization/diagnostics` returns scope readiness checks, expiry, provider coverage, and whether the latest scope is ready for adapter review. Diagnostics store references only; do not place credentials, tokens, or pentest report contents in scope records.

VM lifecycle proofs record gate, rollback, and destroy evidence after an approved controlled gate. These records do not perform real infrastructure actions.

Rollback/destroy proof records attach to VM sandbox dry-run plans and check backup/export evidence, owner notification, rollback owner, teardown order, inventory reconciliation, and audit export readiness. Controlled provisioning gate review remains blocked until a ready rollback/destroy proof exists for the dry-run.

Controlled-create authorization envelopes roll up lab scope, rollback/destroy proof, controlled gate approval, lifecycle proof, adapter enablement, audit export, active pentest scope, allowed create fields, kill switch, and emergency stop procedure. Missing active pentest scope keeps the envelope `Blocked`.

AHV create adapter contract reviews map approved VM sandbox dry-run fields to the future Prism Central create request shape and record blocked create, clone, power, poll, rollback, and delete operations. Execute, poll, and rollback methods remain disabled and return `provisioningEnabled=false`.

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
- `GET /api/platform-services/adapter-contracts`
- `POST /api/platform-services/adapter-contracts`
- `GET /api/provider-release-gates`
- `POST /api/provider-release-gates`
- `GET /api/provider-release-readiness`
- `GET /api/release-evidence-exports`
- `POST /api/release-evidence-exports`
- `GET /api/controlled-lab-release/runbooks`
- `POST /api/controlled-lab-release/runbooks`
- `GET /api/controlled-lab-release/windows`
- `POST /api/controlled-lab-release/windows`
- `GET /api/controlled-lab-release/window-exports`
- `POST /api/controlled-lab-release/window-exports`
- `GET /api/controlled-lab-release/evidence-reviews`
- `POST /api/controlled-lab-release/evidence-reviews`
- `GET /api/controlled-lab-release/proposal-envelopes`
- `POST /api/controlled-lab-release/proposal-envelopes`
- `GET /api/controlled-lab-release/proposal-exports`
- `POST /api/controlled-lab-release/proposal-exports`
- `GET /api/controlled-lab-release/execution-approvals`
- `POST /api/controlled-lab-release/execution-approvals`
- `GET /api/controlled-lab-release/rehearsal-packets`
- `POST /api/controlled-lab-release/rehearsal-packets`
- `GET /api/controlled-lab-release/dry-run-checklists`
- `POST /api/controlled-lab-release/dry-run-checklists`
- `GET /api/controlled-lab-release/evidence-ledgers`
- `POST /api/controlled-lab-release/evidence-ledgers`
- `GET /api/controlled-lab-release/readiness-attestations`
- `POST /api/controlled-lab-release/readiness-attestations`

The platform-service preflight endpoint evaluates NKP, NDB, NUS, and NAI adapter readiness against request validation, VM lifecycle proof, provider readiness, adapter configuration, and real-adapter switch state. It records provider-specific blocked mutation operations and returns `provisioningEnabled=false`.

The platform-service adapter contract endpoint maps approved service request fields into disabled future provider payloads for NKP, NDB, NUS, and NAI. Contract reviews include the related preflight run, blocked operations, provider kill switch state, and `provisioningEnabled=false`.

Provider release gate records roll up the evidence required before NCI, NKP, NDB, NUS, or NAI can be considered for a controlled lab release. Gates check active lab scope, credential reference diagnostics, VM lifecycle proof, adapter enablement, provider preflight, provider contract review, audit export, release approver, and disabled real-adapter switch state.

Provider release readiness summarizes latest release gate status, check counts, gap counts, blocked operations, and kill switch state across NCI, NKP, NDB, NUS, and NAI. It also identifies the nearest-to-ready and most-blocked providers.

Release evidence exports prepare redacted JSON manifests linked to provider release gates. Manifests include provider, gate status, check counts, blocked operations, kill switch state, checksum, and evidence references only. Inline auth material is redacted before persistence.

Controlled lab release runbooks record the human evidence required before any future controlled lab adapter release proposal. Runbooks link to provider release readiness, require platform owner, security reviewer, rollback owner, and lab owner sign-off evidence, and include stop conditions plus escalation contacts. Missing sign-offs keep the runbook blocked.

Controlled lab dry-run windows record scheduled start/end times and link runbook, release evidence export, lab scope, rollback owner, audit export readiness, and emergency stop contacts. Missing linked evidence keeps the window blocked.

Lab window evidence exports prepare redacted JSON manifests linked to controlled lab dry-run windows. Manifests include schedule, provider, runbook reference, release evidence export reference, lab scope reference, rollback owner, emergency stop contacts, check counts, readiness checklist, checksum, and disabled execution state only.

Lab evidence reviews record platform owner, security reviewer, and operations reviewer decisions against exported lab window evidence packages. Missing reviewer decisions keep reviews blocked; rejected decisions mark the package rejected.

Lab execution proposal envelopes roll up accepted lab evidence reviews with the underlying dry-run window, runbook, export, lab scope, rollback owner, audit export readiness, emergency contacts, and disabled adapter kill switch state. Missing or rejected evidence keeps envelopes blocked.

Lab execution proposal exports prepare redacted JSON manifest metadata linked to proposal envelopes. They include proposal checks, evidence references, rollback owner, emergency contacts, disabled kill-switch state, and `provisioningEnabled=false`; they do not deliver provider data or enable adapter execution.

Controlled lab execution approvals record final platform owner, security reviewer, lab owner, rollback owner, and executive sponsor decisions against exported proposal manifests. Missing or rejected approvals keep the gate blocked, and the record remains evidence-only with real adapter execution disabled.

Controlled lab execution rehearsal packets freeze approved gate evidence with runbook, rollback owner, emergency contact, stop condition, proposal export, audit export, and approval evidence references. Missing approved gates or incomplete frozen evidence keep packets blocked, and packets do not enable adapter execution.

Controlled lab dry-run execution checklists record final operator roster, observation window, log capture, rollback timer, stop authority, and disabled execution checks against rehearsal packets. Missing rehearsal packets or incomplete checklist evidence keep readiness blocked.

Controlled lab execution evidence ledgers freeze immutable operator, observer, rollback, log, audit, and stop authority evidence references against dry-run checklists. Missing ready checklists or incomplete references keep ledger readiness blocked.

Controlled lab execution readiness attestations record final platform, security, operations, rollback, and executive sponsor attestation evidence against evidence ledgers. Missing ready ledgers or incomplete attestations keep execution readiness blocked, and attestations do not enable adapter execution.

Required role: `Platform Admin`.

### Execution Broker Queue

- `GET /api/execution-broker/queue`
- `POST /api/execution-broker/queue`
- `GET /api/execution-broker/dispatch-approvals`
- `POST /api/execution-broker/dispatch-approvals`

Execution broker queue records create a hardened intake boundary for future controlled adapter work. Records require a ready execution attestation, a unique idempotency key, linked approval evidence, a disabled provider kill switch, and `provisioningEnabled=false`. Passing records are queued for operator review only and do not execute adapters.

Execution broker dispatch approvals record the final non-executing evidence boundary for future lab dispatch review. They require a queued broker record, operator approver, rollback proof, pentest evidence, dispatch window reference, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Real Adapter Lab Scope Activations

- `GET /api/real-adapter/lab-scope-activations`
- `POST /api/real-adapter/lab-scope-activations`

Real-adapter lab scope activations record explicit evidence before any manual real-adapter switch review can be considered. Activations require a ready dispatch approval, authorized lab scope reference, pentest completion evidence, rollback owner, bounded provider targets, manual operator controls, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Manual Real Adapter Switch Reviews

- `GET /api/real-adapter/switch-reviews`
- `POST /api/real-adapter/switch-reviews`

Manual real-adapter switch reviews record evidence before an authorized lab operator can consider changing adapter switch configuration outside the prototype. Reviews require a ready lab scope activation, named switch operator, second reviewer, maintenance window reference, switch-state audit references, rollback contact, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Real Adapter Switch-State Audit Packages

- `GET /api/real-adapter/switch-state-audit-packages`
- `POST /api/real-adapter/switch-state-audit-packages`

Real-adapter switch-state audit packages collect evidence after manual switch review. Packages require a ready switch review, pre-change and post-change configuration snapshot references, reviewer evidence, rollback timer, retention reference, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Controlled Switch Configuration Requests

- `GET /api/real-adapter/controlled-switch-requests`
- `POST /api/real-adapter/controlled-switch-requests`

Controlled switch configuration requests record evidence after switch-state audit package readiness. Requests require a ready switch-state audit package, operator confirmation, second reviewer acceptance, rollback timer, final dry-run proof, retention reference, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Switch Execution Handoff Packages

- `GET /api/real-adapter/switch-handoff-packages`
- `POST /api/real-adapter/switch-handoff-packages`

Switch execution handoff packages prepare an out-of-band operator handoff after controlled switch request readiness. Packages require a ready controlled switch request, operator run sheet, communications plan, observation window, rollback-owner acceptance, execution freeze proof, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Switch Execution Outcome Records

- `GET /api/real-adapter/switch-outcome-records`
- `POST /api/real-adapter/switch-outcome-records`

Switch execution outcome records document the result of an out-of-band operator switch after handoff package readiness. Records require a ready handoff package, operator result, post-switch validation, rollback decision, incident bridge log, audit sign-off, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Switch Closure Retention Packages

- `GET /api/real-adapter/switch-closure-packages`
- `POST /api/real-adapter/switch-closure-packages`

Switch closure retention packages close retained evidence after switch outcome readiness. Packages require a ready outcome record, closure owner, retained evidence manifest, lessons learned, rollback timer closure, final audit retention confirmation, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Adapter Promotion Readiness Dossiers

- `GET /api/real-adapter/adapter-promotion-dossiers`
- `POST /api/real-adapter/adapter-promotion-dossiers`

Adapter promotion readiness dossiers assemble retained switch closure evidence before future adapter promotion. Dossiers require a ready closure package, promotion owner, retained switch evidence, monitoring plan, rollback drill confirmation, security acceptance, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Adapter Authorization Packets

- `GET /api/real-adapter/production-authorization-packets`
- `POST /api/real-adapter/production-authorization-packets`

Production adapter authorization packets assemble evidence after adapter promotion readiness and before any external production change process. Packets require a ready promotion dossier, production approver, change ticket, release window, emergency rollback authorization, compliance acceptance, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Change Freeze Records

- `GET /api/real-adapter/production-change-freeze-records`
- `POST /api/real-adapter/production-change-freeze-records`

Production change freeze records assemble freeze evidence after production adapter authorization and before any external CAB or change process. Records require a ready authorization packet, freeze owner, freeze window, stakeholder notification, rollback standby, no-change exception plan, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production CAB Handoff Packets

- `GET /api/real-adapter/production-cab-handoff-packets`
- `POST /api/real-adapter/production-cab-handoff-packets`

Production CAB handoff packets assemble CAB evidence after production change freeze readiness and before any external CAB decision. Packets require a ready freeze record, CAB owner, agenda reference, risk acceptance, rollback representation, final go/no-go agenda, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production CAB Decision Records

- `GET /api/real-adapter/production-cab-decision-records`
- `POST /api/real-adapter/production-cab-decision-records`

Production CAB decision records capture the external CAB decision after handoff readiness and before any implementation control. Records require a ready CAB handoff packet, approved-with-conditions CAB decision, decision authority, condition list, rollback approval, decision minutes, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Implementation Hold Records

- `GET /api/real-adapter/production-implementation-hold-records`
- `POST /api/real-adapter/production-implementation-hold-records`

Production implementation hold records capture implementation hold evidence after CAB decision readiness and before any external operator execution. Records require a ready CAB decision record, implementation owner, hold window, condition acceptance, rollback implementation owner, release freeze acknowledgment, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Operator Assignment Records

- `GET /api/real-adapter/production-operator-assignment-records`
- `POST /api/real-adapter/production-operator-assignment-records`

Production operator assignment records capture named execution ownership after implementation hold readiness and before any production execution readiness review. Records require a ready implementation hold record, primary operator, secondary operator, execution channel, rollback operator, privileged access confirmation, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Readiness Records

- `GET /api/real-adapter/production-execution-readiness-records`
- `POST /api/real-adapter/production-execution-readiness-records`

Production execution readiness records capture final execution readiness evidence after operator assignment and before any future production execution authorization step. Records require a ready operator assignment record, execution owner, pre-execution checklist, rollback bridge, monitoring observer, implementation timer, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Authorization Records

- `GET /api/real-adapter/production-execution-authorization-records`
- `POST /api/real-adapter/production-execution-authorization-records`

Production execution authorization records capture final execution authorization evidence after execution readiness and before any future change-ticket lock phase. Records require a ready execution readiness record, authorization authority, approved final go/no-go decision, rollback bridge confirmation, monitoring bridge confirmation, emergency stop authority, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Change Ticket Lock Records

- `GET /api/real-adapter/production-change-ticket-lock-records`
- `POST /api/real-adapter/production-change-ticket-lock-records`

Production change ticket lock records capture locked change evidence after execution authorization and before any future final execution packet phase. Records require a ready execution authorization record, change ticket lock, release window lock, approver roster lock, rollback bridge lock, monitoring bridge lock, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Final Execution Packet Records

- `GET /api/real-adapter/production-final-execution-packet-records`
- `POST /api/real-adapter/production-final-execution-packet-records`

Production final execution packet records capture final packet evidence after change ticket lock and before any future execution hold-point phase. Records require a ready change ticket lock record, final packet manifest, operator run sheet, communications proof, observation window, final rollback standby confirmation, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Hold-Point Records

- `GET /api/real-adapter/production-execution-hold-point-records`
- `POST /api/real-adapter/production-execution-hold-point-records`

Production execution hold-point records capture final hold-point evidence after the final execution packet and before any future execution outcome authorization phase. Records require a ready final execution packet record, hold-point owner, final stop/go checkpoint, rollback timer checkpoint, monitoring readiness checkpoint, incident bridge checkpoint, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Outcome Authorization Records

- `GET /api/real-adapter/production-execution-outcome-authorization-records`
- `POST /api/real-adapter/production-execution-outcome-authorization-records`

Production execution outcome authorization records capture outcome handling evidence after the execution hold-point and before any future closure authorization phase. Records require a ready execution hold-point record, outcome authority, expected result envelope, rollback decision rule, incident declaration rule, evidence capture rule, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Closure Authorization Records

- `GET /api/real-adapter/production-execution-closure-authorization-records`
- `POST /api/real-adapter/production-execution-closure-authorization-records`

Production execution closure authorization records capture closure handling evidence after outcome authorization and before any future closure packet phase. Records require a ready outcome authorization record, closure authority, success criteria, rollback closure criteria, incident closure criteria, audit capture confirmation, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Closure Packet Records

- `GET /api/real-adapter/production-execution-closure-packet-records`
- `POST /api/real-adapter/production-execution-closure-packet-records`

Production execution closure packet records capture closure packet evidence after closure authorization and before any future archival handoff phase. Records require a ready closure authorization record, closure packet manifest, evidence bundle reference, audit export reference, stakeholder notification proof, retention handoff confirmation, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Archival Handoff Records

- `GET /api/real-adapter/production-execution-archival-handoff-records`
- `POST /api/real-adapter/production-execution-archival-handoff-records`

Production execution archival handoff records capture archive handoff evidence after closure packet readiness and before any future retention attestation phase. Records require a ready closure packet record, archive owner, retention policy reference, immutable storage proof, audit index reference, retrieval test reference, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Retention Attestation Records

- `GET /api/real-adapter/production-execution-retention-attestation-records`
- `POST /api/real-adapter/production-execution-retention-attestation-records`

Production execution retention attestation records capture retention evidence after archival handoff readiness and before any future final archive certification phase. Records require a ready archival handoff record, retention owner, retention schedule proof, legal hold check, deletion exception register, retrieval SLA proof, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Final Archive Certification Records

- `GET /api/real-adapter/production-execution-final-archive-certification-records`
- `POST /api/real-adapter/production-execution-final-archive-certification-records`

Production execution final archive certification records capture final archive certification evidence after retention attestation readiness and before any future completion dossier phase. Records require a ready retention attestation record, certification owner, final archive manifest, retention lock proof, compliance sign-off, retrieval witness proof, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Completion Dossier Records

- `GET /api/real-adapter/production-execution-completion-dossier-records`
- `POST /api/real-adapter/production-execution-completion-dossier-records`

Production execution completion dossier records capture completion evidence after final archive certification readiness and before any future operations handover phase. Records require a ready final archive certification record, dossier owner, final evidence index, audit export reference, operations acceptance, compliance closure proof, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Operations Handover Records

- `GET /api/real-adapter/production-execution-operations-handover-records`
- `POST /api/real-adapter/production-execution-operations-handover-records`

Production execution operations handover records capture handover evidence after completion dossier readiness and before any future support readiness phase. Records require a ready completion dossier record, operations owner, support model reference, monitoring handover proof, escalation route, service desk acceptance, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Support Readiness Records

- `GET /api/real-adapter/production-execution-support-readiness-records`
- `POST /api/real-adapter/production-execution-support-readiness-records`

Production execution support readiness records capture support readiness evidence after operations handover readiness and before any future service acceptance phase. Records require a ready operations handover record, support owner, runbook acceptance, alert routing proof, incident process reference, knowledge base publication, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Service Acceptance Records

- `GET /api/real-adapter/production-execution-service-acceptance-records`
- `POST /api/real-adapter/production-execution-service-acceptance-records`

Production execution service acceptance records capture service acceptance evidence after support readiness and before any future final turnover phase. Records require a ready support readiness record, service owner, acceptance criteria reference, operational SLO reference, support sign-off, final customer notification, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Final Turnover Records

- `GET /api/real-adapter/production-execution-final-turnover-records`
- `POST /api/real-adapter/production-execution-final-turnover-records`

Production execution final turnover records capture turnover evidence after service acceptance and before any future operational closure phase. Records require a ready service acceptance record, turnover owner, final service catalog reference, ownership transfer proof, executive closure note, post-implementation review schedule, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Operational Closure Records

- `GET /api/real-adapter/production-execution-operational-closure-records`
- `POST /api/real-adapter/production-execution-operational-closure-records`

Production execution operational closure records capture closure evidence after final turnover and before any future post-implementation review phase. Records require a ready final turnover record, closure owner, steady-state operating model, SLO review proof, support backlog handoff, residual-risk acceptance, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Post-Implementation Review Records

- `GET /api/real-adapter/production-execution-post-implementation-review-records`
- `POST /api/real-adapter/production-execution-post-implementation-review-records`

Production execution post-implementation review records capture PIR evidence after operational closure and before any future improvement closure phase. Records require a ready operational closure record, review owner, PIR minutes, incident review proof, cost variance review, improvement backlog reference, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Improvement Closure Records

- `GET /api/real-adapter/production-execution-improvement-closure-records`
- `POST /api/real-adapter/production-execution-improvement-closure-records`

Production execution improvement closure records capture improvement closure evidence after post-implementation review and before any future final acceptance archive phase. Records require a ready post-implementation review record, improvement owner, action register, accepted deferrals, lessons-learned publication, next-cycle owner, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Final Acceptance Archive Records

- `GET /api/real-adapter/production-execution-final-acceptance-archive-records`
- `POST /api/real-adapter/production-execution-final-acceptance-archive-records`

Production execution final acceptance archive records capture final archive evidence after improvement closure and before any future readiness archive handoff phase. Records require a ready improvement closure record, archive owner, acceptance archive index, final evidence checksum, stakeholder receipt proof, retrieval owner, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Readiness Archive Handoff Records

- `GET /api/real-adapter/production-execution-readiness-archive-handoff-records`
- `POST /api/real-adapter/production-execution-readiness-archive-handoff-records`

Production execution readiness archive handoff records capture archive handoff evidence after final acceptance archive and before any future archive retrieval validation phase. Records require a ready final acceptance archive record, handoff owner, archive repository reference, retrieval runbook, archive access review, archive custody receipt, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Archive Retrieval Validation Records

- `GET /api/real-adapter/production-execution-archive-retrieval-validation-records`
- `POST /api/real-adapter/production-execution-archive-retrieval-validation-records`

Production execution archive retrieval validation records capture retrievability evidence after readiness archive handoff and before any future archive recovery drill phase. Records require a ready readiness archive handoff record, retrieval operator, sample retrieval proof, checksum verification, access audit, recovery SLA witness, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Archive Recovery Drill Records

- `GET /api/real-adapter/production-execution-archive-recovery-drill-records`
- `POST /api/real-adapter/production-execution-archive-recovery-drill-records`

Production execution archive recovery drill records capture recovery drill evidence after archive retrieval validation and before any future archive recovery acceptance phase. Records require a ready archive retrieval validation record, drill owner, recovery scenario, elapsed recovery proof, restored artifact review, drill sign-off, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Archive Recovery Acceptance Records

- `GET /api/real-adapter/production-execution-archive-recovery-acceptance-records`
- `POST /api/real-adapter/production-execution-archive-recovery-acceptance-records`

Production execution archive recovery acceptance records capture acceptance evidence after archive recovery drill and before any future archive recovery closure phase. Records require a ready archive recovery drill record, acceptance owner, recovery evidence packet, RTO/RPO variance review, residual recovery risk register, acceptance sign-off, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Archive Recovery Closure Records

- `GET /api/real-adapter/production-execution-archive-recovery-closure-records`
- `POST /api/real-adapter/production-execution-archive-recovery-closure-records`

Production execution archive recovery closure records capture closure evidence after archive recovery acceptance and before any future archive recovery audit certification phase. Records require a ready archive recovery acceptance record, closure owner, recovery closure packet, follow-up action register, stakeholder closure notice, archive recovery closure sign-off, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Archive Recovery Audit Certification Records

- `GET /api/real-adapter/production-execution-archive-recovery-audit-certification-records`
- `POST /api/real-adapter/production-execution-archive-recovery-audit-certification-records`

Production execution archive recovery audit certification records capture audit certification evidence after archive recovery closure and before any future final compliance archive phase. Records require a ready archive recovery closure record, certification owner, audit evidence manifest, control-mapping review, exception disposition, audit certification sign-off, disabled kill switch, and `provisioningEnabled=false`.

Required role: `Platform Admin`.

### Production Execution Archive Recovery Final Compliance Archive Records

- `GET /api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records`
- `POST /api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records`

Production execution archive recovery final compliance archive records capture final compliance archive evidence after archive recovery audit certification and before any future evidence custody closure phase. Records require a ready archive recovery audit certification record, compliance archive owner, final compliance archive index, evidence retention proof, audit witness receipt, final compliance archive sign-off, disabled kill switch, and `provisioningEnabled=false`.

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
- `GET /api/audit/retention`

Audit export records prepare export metadata, event counts, retention windows, redaction boundaries, storage boundaries, a manifest, and a SHA-256 checksum for on-prem operations. The starter records export readiness metadata only; production deployments must configure external storage before real export delivery.

`GET /api/audit/retention` returns retained event count, retention window, oldest/newest event timestamps, bounded status, and destination-reference validation status.

Required role: `Platform Admin`.

### Adapter Enablement Contract

- `GET /api/adapter-enablement/records`
- `POST /api/adapter-enablement/records`

Adapter enablement records capture the evidence required before any future real Nutanix adapter can move beyond disabled preflight. Each record checks approved lab scope, credential reference diagnostics, provider readiness, adapter readiness, audit export readiness, rollback ownership, and real-adapter disabled state. Missing evidence keeps the record `Blocked`, and `provisioningEnabled=false` is always returned.

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
- Authentication is starter trusted-header/OIDC-shaped only and must be enforced by a production ingress or API validation layer before real use.
- Session and role context are prototype readiness scaffolding, not a complete identity platform.
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
