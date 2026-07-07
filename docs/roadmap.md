# Nutanix Developer Cloud Studio - Roadmap

## Phase 1 - Prototype Foundation

- Create product brief and documentation structure
- Build initial frontend application shell
- Define navigation for developer and admin views
- Add mock data model for templates, environments, policies, costs, and integrations

## Phase 2 - Developer Workflow

- Build dashboard
- Build app catalog
- Build golden-path template details
- Build create-environment wizard
- Add target choices: VM, Kubernetes, database, storage, AI endpoint
- Add simulated policy, cost, and compliance checks
- Add environment status page

## Phase 3 - Platform Admin Workflow

- Build admin overview
- Show template governance and ownership
- Show integration health for NCI, NKP, NDB, NUS, NCM, and NAI
- Show usage, cost, and compliance summaries

## Phase 4 - Mock API Layer (`v0.2.0-hosted-starter`)

- Add fake provisioning jobs
- Add job status transitions
- Add event timeline and logs
- Add realistic error and approval states
- Add hosted/on-prem API starter
- Add API-backed approval queue
- Add API-backed environment detail
- Refresh dashboard toward an operations/on-prem console

## Phase 5 - Real Integration Readiness (`v0.3.0-integration-readiness`)

- Document API assumptions
- Identify minimum Nutanix lab requirements
- Define authentication and secret handling model
- Evaluate Prism Central, NCM Self-Service, NKP, NDB, NUS, and NAI integration paths
- Add OIDC-ready auth and role model
- Replace JSON-file persistence behind a database-ready repository interface
- Add integration configuration and mock readiness checks
- Add hosted starter validation command

## Phase 6 - Lab Adapter Pilot (`v0.4.0-lab-adapter`)

- Wire one read-only Prism Central inventory adapter
- Add credential profile documentation and secret handling guardrails
- Add adapter health checks and failure states
- Keep provisioning disabled until lab authorization and scope are documented
- Add system status endpoint for API, storage, session, integration, and provisioning guardrails
- Add backup/restore validation for JSON prototype state

## Phase 7 - Control Plane (`v0.5.0-control-plane`)

- Add provisioning job queue domain - done
- Add worker/orchestrator abstraction - done
- Add job state machine and retry/failure model - done
- Add audit evidence for each job transition - done
- Keep real provisioning disabled until adapter-specific gates are approved - done

## Phase 8 - Provisioning Adapters And Image Registry (`v0.6.0-provisioning-adapters`)

- Add provisioning adapter interface - done
- Add AHV image registry - done
- Add NKP, NDB, NUS, and NAI profile registries - done
- Add platform provider configuration references - done
- Add environment destroy/teardown workflow - done
- Add admin provider readiness and image/profile catalog panels - done
- Add draft, published, and deprecated template states - planned
- Add owner approval before publishing golden paths - planned

## Phase 9 - Registry Governance (`v0.7.0-registry-governance`)

- Add template versioning states: draft, published, deprecated - done
- Add owner approval before publishing golden paths - done
- Add resource profile approval and deprecation workflow - done
- Add policy bundle selection per template version - done
- Keep real provisioning disabled until lab authorization and adapter gates are approved - done

## Phase 10 - Prism Read-Only Inventory (`v0.8.0-prism-readonly-inventory`)

- Add Prism Central inventory adapter interface - done
- Add disabled-by-default real adapter configuration - done
- Import read-only cluster, project, image, network, category, and VM metadata - done
- Map imported inventory into registry profile candidates - done
- Require authorized lab scope before any live endpoint testing - done

## Phase 11 - Production Foundation (`v0.9.0-production-foundation`)

- Add OIDC session validation - starter done
- Add role-based access control around admin and provisioning actions - done
- Add Postgres repository implementation and migrations - scaffold done
- Add audit retention controls - done
- Add request logging, correlation IDs, rate limits, and security headers - done
- Add branch/release security gates for production deployment - starter done

## Phase 12 - VM Sandbox Dry-Run (`v1.0.0-vm-sandbox-dry-run`)

- Add Linux VM App Sandbox dry-run planning adapter - done
- Validate fixed image/profile/subnet choices from approved registry - done
- Validate owner, cost, expiry, environment tags, quota, project, cluster, and network - done
- Add approval evidence and rollback/destroy plan preview - done
- Keep real provisioning disabled until controlled provisioning phase - done

## Phase 13 - Controlled Provisioning Gate (`v1.1.0-controlled-provisioning`)

- Add API-backed controlled provisioning gate reviews for VM sandbox dry-run plans - done
- Require manual approval, rollback readiness, destroy readiness, authorized scope evidence, and mutation kill switch evidence - done
- Add Admin Control Plane gate review and approval UI - done
- Keep real AHV provisioning disabled until a future authorized adapter phase - done

## Phase 14 - Platform Services (`v1.2.0-platform-services`)

- Add NKP namespace request planning - done
- Add NDB PostgreSQL request planning - done
- Add NUS storage request planning - done
- Add NAI endpoint request planning - done
- Gate all platform-service flows on VM lifecycle proof - done
- Keep real platform-service provisioning disabled until service-specific adapter phases - done

## Phase 15 - Lifecycle Evidence (`v1.3.0-lifecycle-evidence`)

- Add lab authorization scope records - done
- Add pentest scope evidence checks - done
- Add VM lifecycle proof records for gate, rollback, and destroy validation - done
- Connect controlled provisioning gates to active lab authorization scope evidence - done
- Connect platform-service planning to recorded VM lifecycle proof - done
- Keep all live provisioning disabled until authorized adapter work - done

## Phase 16 - AHV Preflight Boundary (`v1.4.0-ahv-preflight-boundary`)

- Add fail-closed AHV controlled-provisioning adapter interface - done
- Add API-backed AHV preflight run records - done
- Check gate approval, lab scope, lifecycle proof, controlled create switch, and adapter enablement - done
- Add Admin Control Plane AHV preflight UI - done
- Keep Prism Central mutation operations blocked - done

## Phase 17 - Platform Service Preflight (`v1.5.0-platform-service-preflight`)

- Add fail-closed platform-service preflight adapter interface - done
- Add API-backed preflight run records for NKP, NDB, NUS, and NAI - done
- Check request validation, VM lifecycle proof, provider readiness, adapter configuration, and real-adapter switch state - done
- Add Admin Control Plane platform-service preflight UI - done
- Keep NKP, NDB, NUS, and NAI mutation operations blocked - done

## Phase 18 - Production Readiness Review (`v1.6.0-production-readiness-review`)

- Add API-backed production readiness review records - done
- Check identity, durable state, audit retention, lab authorization, VM lifecycle proof, AHV preflight, service preflight coverage, and provisioning guardrail - done
- Add Admin Overview readiness review UI - done
- Keep readiness reviews as evidence-only records - done

## Phase 19 - Private Cloud Developer Platform (`v1.7.0-private-cloud-developer-platform`)

- Add API-backed lifecycle operation records for extend, suspend, destroy, and rebuild - done
- Add API-backed audit export readiness records - done
- Add Admin Operations tab for lifecycle and audit workflows - done
- Keep lifecycle operations as operator evidence only until authorized adapters exist - done

## Phase 20 - On-Prem Packaging Hardening (`v1.8.0-on-prem-packaging-hardening`)

- Add on-prem configuration validation script - done
- Add JSON state backup and restore scripts - done
- Add backup/restore smoke test to the phase gate - done
- Expand Compose guardrails for repository, audit retention, rate limits, and disabled real adapters - done
- Expand on-prem deployment runbook and security checklist - done

## Phase 21 - OIDC RBAC Hardening (`v1.9.0-oidc-rbac-hardening`)

- Add optional strict trusted-header mode - done
- Fail API routes closed when required identity headers are missing - done
- Keep health/readiness probes public for orchestrators - done
- Add session diagnostics API and Admin UI role/action matrix - done
- Add tests for strict identity and diagnostics behavior - done

## Phase 22 - Postgres Repository Hardening (`v2.0.0-postgres-repository-hardening`)

- Add Postgres repository configuration validation - done
- Add startup fail-closed behavior for invalid Postgres mode - done
- Add migration scaffold validation script - done
- Add phase gate coverage for Postgres scaffold validation - done
- Add tests for config, schema, readiness, and fail-closed behavior - done

## Phase 23 - Audit Export Retention Hardening (`v2.1.0-audit-export-retention-hardening`)

- Add audit export manifests with checksums - done
- Add retention diagnostics API and Admin Operations view - done
- Add destination-reference validation without storing access material - done
- Add phase gate coverage for audit export configuration - done
- Add tests for manifest, checksum, destination, retention, and API/client behavior - done

## Phase 24 - Provider Credential Reference Hardening (`v2.2.0-provider-credential-reference-hardening`)

- Add credential reference validation for Nutanix providers - done
- Add provider credential reference diagnostics API - done
- Add Admin Providers diagnostics panel - done
- Add phase gate validation for provider credential references - done
- Add tests for validation, rejection, diagnostics, and smoke behavior - done

## Phase 25 - Adapter Enablement Contract Hardening (`v2.3.0-adapter-enable-contract-hardening`)

- Add adapter enablement records for NCI, NKP, NDB, NUS, NCM, and NAI - done
- Check approved lab scope, credential reference diagnostics, provider readiness, audit export readiness, and rollback owner - done
- Add Admin Providers enablement evidence panel - done
- Keep enabled real-adapter switches blocked in this review-only phase - done
- Add API/client and smoke coverage for enablement review behavior - done

## Phase 26 - Lab Scope Pentest Evidence Hardening (`v2.4.0-lab-scope-pentest-evidence-hardening`)

- Add versioned lab scope records with provider coverage, target endpoints, evidence references, and rollback owner - done
- Add lab scope diagnostics API - done
- Surface expiry, provider coverage, target endpoints, and evidence readiness in Admin Control Plane - done
- Make expired or incomplete scope evidence block adapter enablement review - done
- Keep pentest evidence metadata-only and real mutation disabled - done

## Phase 27 - Rollback Destroy Proof Hardening (`v2.5.0-preflight-destroy-rollback-hardening`)

- Add rollback/destroy proof records tied to VM sandbox dry-runs - done
- Check backup/export evidence, owner notification, rollback owner, teardown order, inventory reconciliation, and audit export readiness - done
- Add Admin Control Plane rollback/destroy proof panel - done
- Block controlled create promotion when rollback/destroy proof is missing - done
- Keep proof records evidence-only and real mutation disabled - done

## Phase 28 - Controlled Create Authorization Envelope (`v2.6.0-controlled-create-adapter-authorization-envelope`)

- Add consolidated authorization envelope for future AHV create adapter - done
- Check lab scope, rollback/destroy proof, controlled gate, lifecycle proof, adapter enablement, audit export, pentest gate, and mutation guardrail - done
- Add Admin Control Plane authorization envelope panel - done
- Prove missing active pentest scope blocks live authorization - done
- Keep real mutation disabled - done

## Phase 29 - Controlled Create Adapter Contract (`v2.7.0-controlled-create-adapter-contract`)

- Add disabled AHV create adapter contract methods for validate, map payload, execute, poll, and rollback - done
- Map VM sandbox dry-run fields into the future Prism Central create payload shape - done
- Add API-backed AHV create contract review records - done
- Add Admin Control Plane payload preview, blocked operations, and kill switch panel - done
- Keep execute, poll, rollback, and real mutation disabled - done

## Phase 30 - Platform Service Adapter Contracts (`v2.8.0-platform-service-adapter-contracts`)

- Define disabled adapter contracts for NKP, NDB, NUS, and NAI - done
- Map service planning records into future provider payload previews - done
- Add per-provider blocked operations and kill switch status - done
- Add API/UI/tests proving service execute paths remain disabled - done

## Phase 31 - Provider Release Gate Evidence (`v2.9.0-provider-release-gate-evidence`)

- Add provider release gate records for NCI, NKP, NDB, NUS, and NAI - done
- Check lab scope, credential references, lifecycle proof, preflight, contract review, audit export, rollback owner, and release approver - done
- Add Admin Control Plane provider release readiness summary - done
- Keep real adapter switches disabled unless a future authorized implementation phase explicitly changes them - done

## Phase 32 - Release Evidence Export Hardening (`v2.10.0-release-evidence-export-hardening`)

- Add release evidence export records linked to provider release gates - done
- Generate redacted JSON manifests for checks, approver, blocked operations, and kill switch state - done
- Add Admin Operations release evidence export history - done
- Prove exports contain references and metadata only - done

## Phase 33 - Provider Release Dashboard Hardening (`v2.11.0-provider-release-dashboard-hardening`)

- Add provider release readiness summary grouped by provider - done
- Add evidence gap counts across release gate categories - done
- Add Admin dashboard cards for nearest-to-ready and most-blocked provider - done
- Keep release readiness evidence-only and real adapter execution disabled - done

## Phase 34 - Controlled Lab Release Runbook (`v2.12.0-controlled-lab-release-runbook`)

- Add operator runbook records linked to provider release readiness - done
- Track platform owner, security reviewer, rollback owner, and lab owner sign-offs - done
- Add Admin Operations runbook checklist for stop conditions and escalation contacts - done
- Keep runbook completion evidence-only and real adapter execution disabled - done

## Phase 35 - Controlled Lab Dry-Run Window (`v2.13.0-controlled-lab-dry-run-window`)

- Add controlled lab dry-run window records with scheduled start/end times - done
- Attach runbooks, release evidence exports, lab scope, and rollback owners to the window - done
- Add Admin Operations window readiness checklist and emergency stop contacts - done
- Keep window scheduling evidence-only and real adapter execution disabled - done

## Phase 36 - Lab Window Evidence Export (`v2.14.0-lab-window-evidence-export`)

- Add redacted window evidence export manifests linked to controlled lab dry-run windows - done
- Include runbook, release export, lab scope, rollback owner, emergency contacts, checks, and disabled execution state - done
- Add Admin Operations export history for lab window evidence - done
- Keep exports metadata-only and real adapter execution disabled - done

## Phase 37 - Lab Evidence Review Queue (`v2.15.0-lab-evidence-review-queue`)

- Add review records for lab window evidence exports - done
- Track platform owner, security reviewer, and operations reviewer decisions - done
- Add Admin Operations review queue for accepted, rejected, and blocked evidence packages - done
- Keep review records evidence-only and real adapter execution disabled - done

## Phase 38 - Lab Execution Proposal Envelope (`v2.16.0-lab-execution-proposal-envelope`)

- Add execution proposal envelopes linked to accepted lab evidence reviews - done
- Check lab scope, runbook, window, export, review, rollback owner, audit export, and emergency contacts - done
- Add Admin Operations proposal readiness panel - done
- Keep proposal envelopes evidence-only and real adapter execution disabled - done

## Phase 39 - Lab Execution Proposal Export (`v2.17.0-lab-execution-proposal-export`)

- Add redacted proposal envelope export manifests - done
- Include proposal checks, evidence references, rollback owner, emergency contacts, and disabled execution state - done
- Add Admin Operations proposal export history - done
- Keep exports metadata-only and real adapter execution disabled - done

## Phase 40 - Controlled Lab Execution Approval Gate (`v2.18.0-controlled-lab-execution-approval-gate`)

- Add approval records linked to proposal exports - done
- Track platform owner, security reviewer, lab owner, rollback owner, and executive sponsor decisions - done
- Add Admin Operations approval gate panel - done
- Keep approvals evidence-only and real adapter execution disabled - done

## Phase 41 - Controlled Lab Execution Rehearsal Packet (`v2.19.0-controlled-lab-execution-rehearsal-packet`)

- Add rehearsal packet records linked to approved execution gates - done
- Freeze runbook, rollback, stop condition, contact, and evidence export references - done
- Add Admin Operations rehearsal packet panel - done
- Keep packets evidence-only and real adapter execution disabled - done

## Phase 42 - Controlled Lab Dry-Run Execution Checklist (`v2.20.0-controlled-lab-dry-run-execution-checklist`)

- Add final dry-run execution checklist records linked to rehearsal packets - done
- Check operator roster, observation window, log capture, rollback timer, stop authority, and disabled execution state - done
- Add Admin Operations dry-run checklist panel - done
- Keep checklists evidence-only and real adapter execution disabled - done

## Phase 43 - Controlled Lab Execution Evidence Ledger (`v2.21.0-controlled-lab-execution-evidence-ledger`)

- Add evidence ledger records linked to dry-run checklists - done
- Capture immutable evidence references for operator, observer, rollback, log, audit, and stop authority records - done
- Add Admin Operations evidence ledger panel - done
- Keep ledger records evidence-only and real adapter execution disabled - done

## Phase 44 - Controlled Lab Execution Readiness Attestation (`v2.22.0-controlled-lab-execution-readiness-attestation`)

- Add readiness attestation records linked to evidence ledgers - done
- Track platform, security, operations, rollback, and sponsor attestations - done
- Add Admin Operations readiness attestation panel - done
- Keep attestations evidence-only and real adapter execution disabled - done

## Phase 45 - Execution Broker Hardening (`v2.23.0-execution-broker-hardening`)

- Add execution broker queue records for future controlled adapter work - done
- Add idempotency keys, kill-switch checks, and approval evidence links - done
- Add Admin Operations execution broker panel - done
- Keep broker records queued for operator review with real adapter execution disabled - done

## Phase 46 - Execution Broker Dispatch Approval (`v2.24.0-execution-broker-dispatch-approval`)

- Add dispatch approval records linked to broker queue records - done
- Require rollback proof, operator approver, and pentest evidence references - done
- Add Admin Operations dispatch approval panel - done
- Keep dispatch approval records non-executing until an authorized real-adapter lab scope exists - done

## Phase 47 - Real Adapter Lab Scope Activation (`v2.25.0-real-adapter-lab-scope-activation`)

- Add explicit real-adapter lab scope activation records linked to dispatch approvals - done
- Require authorized scope, pentest completion evidence, rollback owner, and bounded provider target references - done
- Add Admin Operations lab scope activation panel - done
- Keep real adapter switches disabled until activation evidence and manual operator controls are complete - done

## Phase 48 - Manual Real Adapter Switch Review (`v2.26.0-manual-real-adapter-switch-review`)

- Add manual real-adapter switch review records linked to lab scope activations - done
- Require named switch operator, second reviewer, maintenance window, and switch-state audit references - done
- Add Admin Operations switch review panel - done
- Keep switch reviews evidence-only until an authorized lab operator explicitly changes environment configuration - done

## Phase 49 - Real Adapter Switch State Audit Package (`v2.27.0-real-adapter-switch-state-audit-package`)

- Add switch-state audit package records linked to manual switch reviews - done
- Require pre-change and post-change config snapshots, reviewer evidence, rollback timer, and retention references - done
- Add Admin Operations switch-state audit panel - done
- Keep audit packages evidence-only and leave adapter switch state unchanged from the prototype - done

## Phase 50 - Controlled Switch Configuration Request (`v2.28.0-controlled-switch-configuration-request`)

- Add controlled switch configuration request records linked to switch-state audit packages - done
- Require operator confirmation, second reviewer acceptance, rollback timer, retention, and final dry-run proof - done
- Add Admin Operations controlled switch request panel - done
- Keep requests non-mutating unless explicitly executed by an authorized lab operator outside the prototype - done

## Phase 51 - Switch Execution Handoff Package (`v2.29.0-switch-execution-handoff-package`)

- Add switch execution handoff packages linked to controlled switch requests - done
- Require operator run sheet, communications plan, observation window, rollback owner acceptance, and execution freeze proof - done
- Add Admin Operations switch handoff panel - done
- Keep handoff packages non-mutating and require out-of-band authorized operator execution - done

## Phase 52 - Switch Execution Outcome Record (`v2.30.0-switch-execution-outcome-record`)

- Add switch execution outcome records linked to handoff packages - done
- Require operator result, post-switch validation, rollback decision, incident bridge log, and audit sign-off - done
- Add Admin Operations switch outcome panel - done
- Keep outcome records evidence-only and record out-of-band execution only - done

## Phase 53 - Switch Closure Retention Package (`v2.31.0-switch-closure-retention-package`)

- Add switch closure retention packages linked to outcome records - done
- Require closure owner, retained evidence manifest, lessons learned, rollback timer closure, and final audit retention confirmation - done
- Add Admin Operations switch closure panel - done
- Keep closure packages evidence-only and require retained records before future adapter promotion - done

## Phase 54 - Adapter Promotion Readiness Dossier (`v2.32.0-adapter-promotion-readiness-dossier`)

- Add adapter promotion readiness dossiers linked to switch closure packages - done
- Require promotion owner, retained switch evidence, monitoring plan, rollback drill confirmation, and security acceptance - done
- Add Admin Operations adapter promotion dossier panel - done
- Keep promotion dossiers evidence-only and require separate production authorization before any adapter promotion - done

## Phase 55 - Production Adapter Authorization Packet (`v2.33.0-production-adapter-authorization-packet`)

- Add production adapter authorization packets linked to adapter promotion dossiers - done
- Require production approver, change ticket, release window, emergency rollback authorization, and compliance acceptance - done
- Add Admin Operations production authorization panel - done
- Keep authorization packets evidence-only and require an external production change process before adapter promotion - done

## Phase 56 - Production Change Freeze Record (`v2.34.0-production-change-freeze-record`)

- Add production change freeze records linked to authorization packets - done
- Require freeze owner, freeze window, stakeholder notification, rollback standby, and no-change exception plan - done
- Add Admin Operations production freeze panel - done
- Keep freeze records evidence-only and require external CAB/change process before adapter promotion - done

## Phase 57 - Production CAB Handoff Packet (`v2.35.0-production-cab-handoff-packet`)

- Add production CAB handoff packets linked to change freeze records - done
- Require CAB owner, agenda reference, risk acceptance, rollback representation, and final go/no-go agenda - done
- Add Admin Operations CAB handoff panel - done
- Keep CAB handoff packets evidence-only and require external CAB approval before adapter promotion - done

## Phase 58 - Production CAB Decision Record (`v2.36.0-production-cab-decision-record`)

- Add production CAB decision records linked to CAB handoff packets - planned
- Require CAB decision, decision authority, condition list, rollback approval, and decision minutes - planned
- Add Admin Operations CAB decision panel - planned
- Keep CAB decision records evidence-only and require external implementation controls before adapter promotion - planned

## Gated Promotion

Each phase must pass the local or GitHub phase gate before promotion. See `docs/upgrade-path.md`.
