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

- Add OIDC session validation
- Add role-based access control around admin and provisioning actions
- Add Postgres repository implementation and migrations
- Add audit retention controls
- Add request logging, correlation IDs, rate limits, and security headers
- Add branch/release security gates for production deployment

## Gated Promotion

Each phase must pass the local or GitHub phase gate before promotion. See `docs/upgrade-path.md`.
