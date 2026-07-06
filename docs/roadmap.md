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

## Gated Promotion

Each phase must pass the local or GitHub phase gate before promotion. See `docs/upgrade-path.md`.
