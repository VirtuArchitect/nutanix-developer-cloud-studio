# Changelog

All notable changes to Nutanix Developer Cloud Studio will be documented in this file.

This project uses release tags for public milestones. The current release is `v2.73.0-adapter-contract-split`.

## [Unreleased]

### Planned

- Add a real AHV create adapter only after authorized lab scope, completed gate review, rollback/destroy validation, and pentest gate.
- Add production execution archive recovery service restoration acceptance records after final operations handoff records are complete.
- Promote platform-service plans to real adapters only after VM lifecycle proof and service-specific authorization.
- Prevent deprecated profiles from being selected in new request flows after profile selection becomes user-facing.

## [v2.73.0-adapter-contract-split] - 2026-07-08

### Added

- Typed Prism adapter contract with `health`, `listInventory`, `createVmPlan`, `submitVmCreate`, and `pollTask` operations.
- `MockPrismAdapter` implementation behind the environment create flow.
- `DisabledRealPrismAdapter` stub that documents blocked real-adapter operations.
- API-backed Prism adapter diagnostics endpoint for active mode, supported operations, blocked reasons, and latest mock task.
- Admin Providers panel showing the adapter contract boundary and real-adapter blocked reasons.

### Notes

- Real Prism execution remains disabled.
- The mock adapter continues to record simulator evidence only.

## [v2.72.0-mock-prism-adapter-flow] - 2026-07-08

### Added

- Mock Prism Central simulator endpoints under `/mock-prism` for local adapter contract testing without a Nutanix lab.
- Prism-shaped cluster, project, image, subnet, category, VM, simulated VM-create, and task-poll responses.
- API-backed mock Prism simulator status and execution evidence endpoints under `/api/mock-prism`.
- Environment creation now records mock Prism VM task evidence for VM-targeted requests.
- Environment detail and Admin Providers panels surface mock Prism task UUIDs, selected image, cluster, subnet, and no-mutation boundary.

### Notes

- Mock Prism execution records are simulator evidence only.
- Real Nutanix provisioning remains disabled.

## [v2.71.0-production-execution-archive-recovery-final-operations-handoff-record] - 2026-07-08

### Added

- Production execution archive recovery final operations handoff records linked to production execution archive recovery monitoring ownership closure records.
- API endpoints for listing and recording production execution archive recovery final operations handoff records.
- Admin Operations production archive recovery final operations handoff panel.
- Final operations owner, runbook publication, on-call schedule handoff, monitoring closure acceptance, and operations handoff sign-off checks.
- Tests proving missing monitoring ownership closure records or incomplete final operations handoff evidence block readiness.

### Notes

- Production execution archive recovery final operations handoff records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.70.0-production-execution-archive-recovery-monitoring-ownership-closure-record] - 2026-07-08

### Added

- Production execution archive recovery monitoring ownership closure records linked to production execution archive recovery support ownership acceptance records.
- API endpoints for listing and recording production execution archive recovery monitoring ownership closure records.
- Admin Operations production archive recovery monitoring ownership closure panel.
- Monitoring owner, alert ownership transfer, dashboard acceptance, escalation monitoring validation, and monitoring ownership closure sign-off checks.
- Tests proving missing support ownership acceptance records or incomplete monitoring ownership closure evidence block readiness.

### Notes

- Production execution archive recovery monitoring ownership closure records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.69.0-production-execution-archive-recovery-support-ownership-acceptance-record] - 2026-07-08

### Added

- Production execution archive recovery support ownership acceptance records linked to production execution archive recovery service management handoff records.
- API endpoints for listing and recording production execution archive recovery support ownership acceptance records.
- Admin Operations production archive recovery support ownership acceptance panel.
- Support owner, service desk acceptance, escalation test proof, monitoring ownership proof, and support ownership sign-off checks.
- Tests proving missing service management handoff records or incomplete support ownership acceptance evidence block readiness.

### Notes

- Production execution archive recovery support ownership acceptance records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.68.0-production-execution-archive-recovery-service-management-handoff-record] - 2026-07-08

### Added

- Production execution archive recovery service management handoff records linked to production execution archive recovery operational continuity records.
- API endpoints for listing and recording production execution archive recovery service management handoff records.
- Admin Operations production archive recovery service management handoff panel.
- Service owner, support queue mapping, knowledge article, escalation matrix, and service management handoff sign-off checks.
- Tests proving missing operational continuity records or incomplete service management handoff evidence block readiness.

### Notes

- Production execution archive recovery service management handoff records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.67.0-production-execution-archive-recovery-operational-continuity-record] - 2026-07-07

### Added

- Production execution archive recovery operational continuity records linked to production execution archive recovery evidence custody closure records.
- API endpoints for listing and recording production execution archive recovery operational continuity records.
- Admin Operations production archive recovery operational continuity panel.
- Continuity owner, runbook update, KPI baseline, support handoff, and continuity sign-off checks.
- Tests proving missing evidence custody closure records or incomplete operational continuity evidence block readiness.

### Notes

- Production execution archive recovery operational continuity records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.66.0-production-execution-archive-recovery-evidence-custody-closure-record] - 2026-07-07

### Added

- Production execution archive recovery evidence custody closure records linked to production execution archive recovery final compliance archive records.
- API endpoints for listing and recording production execution archive recovery evidence custody closure records.
- Admin Operations production archive recovery evidence custody closure panel.
- Custody owner, final custody ledger, evidence transfer receipt, retention lock confirmation, and custody closure sign-off checks.
- Tests proving missing final compliance archive records or incomplete evidence custody closure evidence block readiness.

### Notes

- Production execution archive recovery evidence custody closure records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.65.0-production-execution-archive-recovery-final-compliance-archive-record] - 2026-07-07

### Added

- Production execution archive recovery final compliance archive records linked to production execution archive recovery audit certification records.
- API endpoints for listing and recording production execution archive recovery final compliance archive records.
- Admin Operations production archive recovery final compliance archive panel.
- Compliance archive owner, final compliance archive index, evidence retention proof, audit witness receipt, and final compliance archive sign-off checks.
- Tests proving missing archive recovery audit certification records or incomplete final compliance archive evidence block readiness.

### Notes

- Production execution archive recovery final compliance archive records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.64.0-production-execution-archive-recovery-audit-certification-record] - 2026-07-07

### Added

- Production execution archive recovery audit certification records linked to production execution archive recovery closure records.
- API endpoints for listing and recording production execution archive recovery audit certification records.
- Admin Operations production archive recovery audit certification panel.
- Certification owner, audit evidence manifest, control-mapping review, exception disposition, and audit certification sign-off checks.
- Tests proving missing archive recovery closure records or incomplete audit certification evidence block archive recovery audit certification readiness.

### Notes

- Production execution archive recovery audit certification records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.63.0-production-execution-archive-recovery-closure-record] - 2026-07-07

### Added

- Production execution archive recovery closure records linked to production execution archive recovery acceptance records.
- API endpoints for listing and recording production execution archive recovery closure records.
- Admin Operations production archive recovery closure panel.
- Closure owner, recovery closure packet, follow-up action register, stakeholder closure notice, and archive recovery closure sign-off checks.
- Tests proving missing archive recovery acceptance records or incomplete closure evidence block archive recovery closure readiness.

### Notes

- Production execution archive recovery closure records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.62.0-production-execution-archive-recovery-acceptance-record] - 2026-07-07

### Added

- Production execution archive recovery acceptance records linked to production execution archive recovery drill records.
- API endpoints for listing and recording production execution archive recovery acceptance records.
- Admin Operations production archive recovery acceptance panel.
- Acceptance owner, recovery evidence packet, RTO/RPO variance review, residual recovery risk register, and acceptance sign-off checks.
- Tests proving missing archive recovery drill records or incomplete acceptance evidence block archive recovery acceptance readiness.

### Notes

- Production execution archive recovery acceptance records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.61.0-production-execution-archive-recovery-drill-record] - 2026-07-07

### Added

- Production execution archive recovery drill records linked to production execution archive retrieval validation records.
- API endpoints for listing and recording production execution archive recovery drill records.
- Admin Operations production archive recovery drill panel.
- Drill owner, recovery scenario, elapsed recovery proof, restored artifact review, and drill sign-off checks.
- Tests proving missing archive retrieval validation records or incomplete drill evidence block archive recovery drill readiness.

### Notes

- Production execution archive recovery drill records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.60.0-production-execution-archive-retrieval-validation-record] - 2026-07-07

### Added

- Production execution archive retrieval validation records linked to production execution readiness archive handoff records.
- API endpoints for listing and recording production execution archive retrieval validation records.
- Admin Operations production archive retrieval validation panel.
- Retrieval operator, sample retrieval proof, checksum verification, access audit, and recovery SLA witness checks.
- Tests proving missing readiness archive handoff records or incomplete retrieval evidence block archive retrieval validation.

### Notes

- Production execution archive retrieval validation records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.59.0-production-execution-readiness-archive-handoff-record] - 2026-07-07

### Added

- Production execution readiness archive handoff records linked to production execution final acceptance archive records.
- API endpoints for listing and recording production execution readiness archive handoff records.
- Admin Operations production readiness archive handoff panel.
- Handoff owner, archive repository, retrieval runbook, archive access review, and archive custody receipt checks.
- Tests proving missing final acceptance archive records or incomplete archive handoff evidence block readiness archive handoff.

### Notes

- Production execution readiness archive handoff records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.58.0-production-execution-final-acceptance-archive-record] - 2026-07-07

### Added

- Production execution final acceptance archive records linked to production execution improvement closure records.
- API endpoints for listing and recording production execution final acceptance archive records.
- Admin Operations production final acceptance archive panel.
- Archive owner, acceptance archive index, final evidence checksum, stakeholder receipt proof, and retrieval owner checks.
- Tests proving missing improvement closure records or incomplete archive evidence block final acceptance archive readiness.

### Notes

- Production execution final acceptance archive records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.57.0-production-execution-improvement-closure-record] - 2026-07-07

### Added

- Production execution improvement closure records linked to production execution post-implementation review records.
- API endpoints for listing and recording production execution improvement closure records.
- Admin Operations production improvement closure panel.
- Improvement owner, action register, accepted deferrals, lessons-learned publication, and next-cycle owner checks.
- Tests proving missing post-implementation review records or incomplete improvement closure evidence block improvement closure readiness.

### Notes

- Production execution improvement closure records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.56.0-production-execution-post-implementation-review-record] - 2026-07-07

### Added

- Production execution post-implementation review records linked to production execution operational closure records.
- API endpoints for listing and recording production execution post-implementation review records.
- Admin Operations production post-implementation review panel.
- Review owner, PIR minutes reference, incident review proof, cost variance review, and improvement backlog reference checks.
- Tests proving missing operational closure records or incomplete post-implementation review evidence block PIR readiness.

### Notes

- Production execution post-implementation review records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.55.0-production-execution-operational-closure-record] - 2026-07-07

### Added

- Production execution operational closure records linked to production execution final turnover records.
- API endpoints for listing and recording production execution operational closure records.
- Admin Operations production operational closure panel.
- Closure owner, steady-state operating model reference, SLO review proof, support backlog handoff, and residual-risk acceptance checks.
- Tests proving missing final turnover records or incomplete operational closure evidence block operational closure readiness.

### Notes

- Production execution operational closure records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.54.0-production-execution-final-turnover-record] - 2026-07-07

### Added

- Production execution final turnover records linked to production execution service acceptance records.
- API endpoints for listing and recording production execution final turnover records.
- Admin Operations production final turnover panel.
- Turnover owner, final service catalog reference, ownership transfer proof, executive closure note, and post-implementation review schedule checks.
- Tests proving missing service acceptance records or incomplete final turnover evidence block final turnover readiness.

### Notes

- Production execution final turnover records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.53.0-production-execution-service-acceptance-record] - 2026-07-07

### Added

- Production execution service acceptance records linked to production execution support readiness records.
- API endpoints for listing and recording production execution service acceptance records.
- Admin Operations production service acceptance panel.
- Service owner, acceptance criteria reference, operational SLO reference, support sign-off, and final customer notification checks.
- Tests proving missing support readiness records or incomplete service acceptance evidence block service acceptance.

### Notes

- Production execution service acceptance records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.52.0-production-execution-support-readiness-record] - 2026-07-07

### Added

- Production execution support readiness records linked to production execution operations handover records.
- API endpoints for listing and recording production execution support readiness records.
- Admin Operations production support readiness panel.
- Support owner, runbook acceptance, alert routing proof, incident process reference, and knowledge base publication checks.
- Tests proving missing operations handover records or incomplete support readiness evidence block support readiness.

### Notes

- Production execution support readiness records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.51.0-production-execution-operations-handover-record] - 2026-07-07

### Added

- Production execution operations handover records linked to production execution completion dossier records.
- API endpoints for listing and recording production execution operations handover records.
- Admin Operations production operations handover panel.
- Operations owner, support model reference, monitoring handover proof, escalation route, and service desk acceptance checks.
- Tests proving missing completion dossier records or incomplete operations handover evidence block operations handover readiness.

### Notes

- Production execution operations handover records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.50.0-production-execution-completion-dossier-record] - 2026-07-07

### Added

- Production execution completion dossier records linked to production execution final archive certification records.
- API endpoints for listing and recording production execution completion dossier records.
- Admin Operations production completion dossier panel.
- Dossier owner, final evidence index, audit export reference, operations acceptance, and compliance closure proof checks.
- Tests proving missing final archive certification records or incomplete completion dossier evidence block completion dossier readiness.

### Notes

- Production execution completion dossier records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.49.0-production-execution-final-archive-certification-record] - 2026-07-07

### Added

- Production execution final archive certification records linked to production execution retention attestation records.
- API endpoints for listing and recording production execution final archive certification records.
- Admin Operations production final archive certification panel.
- Certification owner, final archive manifest, retention lock proof, compliance sign-off, and retrieval witness proof checks.
- Tests proving missing retention attestation records or incomplete final archive certification evidence block final archive certification readiness.

### Notes

- Production execution final archive certification records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.48.0-production-execution-retention-attestation-record] - 2026-07-07

### Added

- Production execution retention attestation records linked to production execution archival handoff records.
- API endpoints for listing and recording production execution retention attestation records.
- Admin Operations production retention attestation panel.
- Retention owner, retention schedule proof, legal hold check, deletion exception register, and retrieval SLA proof checks.
- Tests proving missing archival handoff records or incomplete retention attestation evidence block retention attestation readiness.

### Notes

- Production execution retention attestation records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.47.0-production-execution-archival-handoff-record] - 2026-07-07

### Added

- Production execution archival handoff records linked to production execution closure packet records.
- API endpoints for listing and recording production execution archival handoff records.
- Admin Operations production archival handoff panel.
- Archive owner, retention policy, immutable storage proof, audit index, and retrieval test checks.
- Tests proving missing closure packet records or incomplete archival handoff evidence block archival handoff readiness.

### Notes

- Production execution archival handoff records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.46.0-production-execution-closure-packet-record] - 2026-07-07

### Added

- Production execution closure packet records linked to production execution closure authorization records.
- API endpoints for listing and recording production execution closure packet records.
- Admin Operations production closure packet panel.
- Closure packet manifest, evidence bundle, audit export, stakeholder notification proof, and retention handoff confirmation checks.
- Tests proving missing closure authorization records or incomplete closure packet evidence block closure packet readiness.

### Notes

- Production execution closure packet records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.45.0-production-execution-closure-authorization-record] - 2026-07-07

### Added

- Production execution closure authorization records linked to production execution outcome authorization records.
- API endpoints for listing and recording production execution closure authorization records.
- Admin Operations production closure authorization panel.
- Closure authority, success criteria, rollback closure criteria, incident closure criteria, and audit capture confirmation checks.
- Tests proving missing outcome authorization records or incomplete closure authorization evidence block closure authorization readiness.

### Notes

- Production execution closure authorization records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.44.0-production-execution-outcome-authorization-record] - 2026-07-07

### Added

- Production execution outcome authorization records linked to production execution hold-point records.
- API endpoints for listing and recording production execution outcome authorization records.
- Admin Operations production outcome authorization panel.
- Outcome authority, expected result envelope, rollback decision rule, incident declaration rule, and evidence capture rule checks.
- Tests proving missing execution hold-point records or incomplete outcome authorization evidence block outcome authorization readiness.

### Notes

- Production execution outcome authorization records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.43.0-production-execution-hold-point-record] - 2026-07-07

### Added

- Production execution hold-point records linked to production final execution packet records.
- API endpoints for listing and recording production execution hold-point records.
- Admin Operations production execution hold-point panel.
- Hold-point owner, final stop/go checkpoint, rollback timer checkpoint, monitoring readiness checkpoint, and incident bridge checkpoint checks.
- Tests proving missing final execution packet records or incomplete hold-point evidence block execution hold-point readiness.

### Notes

- Production execution hold-point records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.42.0-production-final-execution-packet-record] - 2026-07-07

### Added

- Production final execution packet records linked to production change ticket lock records.
- API endpoints for listing and recording production final execution packet records.
- Admin Operations production final execution packet panel.
- Final packet manifest, operator run sheet, communications proof, observation window, and final rollback standby confirmation checks.
- Tests proving missing change ticket lock records or incomplete final packet evidence block final execution packet readiness.

### Notes

- Production final execution packet records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.41.0-production-change-ticket-lock-record] - 2026-07-07

### Added

- Production change ticket lock records linked to production execution authorization records.
- API endpoints for listing and recording production change ticket lock records.
- Admin Operations production change ticket lock panel.
- Change ticket lock, release window lock, approver roster lock, rollback bridge lock, and monitoring bridge lock checks.
- Tests proving missing execution authorization records or incomplete lock evidence block change ticket lock readiness.

### Notes

- Production change ticket lock records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.40.0-production-execution-authorization-record] - 2026-07-07

### Added

- Production execution authorization records linked to production execution readiness records.
- API endpoints for listing and recording production execution authorization records.
- Admin Operations production execution authorization panel.
- Authorization authority, final go/no-go decision, rollback bridge confirmation, monitoring bridge confirmation, and emergency stop authority checks.
- Tests proving missing execution readiness records or incomplete authorization evidence block authorization readiness.

### Notes

- Production execution authorization records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.39.0-production-execution-readiness-record] - 2026-07-07

### Added

- Production execution readiness records linked to production operator assignment records.
- API endpoints for listing and recording production execution readiness records.
- Admin Operations production execution readiness panel.
- Execution owner, pre-execution checklist, rollback bridge, monitoring observer, and implementation timer checks.
- Tests proving missing operator assignment records or incomplete execution readiness evidence block readiness.

### Notes

- Production execution readiness records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.38.0-production-operator-assignment-record] - 2026-07-07

### Added

- Production operator assignment records linked to production implementation hold records.
- API endpoints for listing and recording production operator assignment records.
- Admin Operations production operator assignment panel.
- Primary operator, secondary operator, execution channel, rollback operator, and privileged access confirmation checks.
- Tests proving missing implementation hold records or incomplete operator evidence block assignment readiness.

### Notes

- Production operator assignment records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.37.0-production-implementation-hold-record] - 2026-07-07

### Added

- Production implementation hold records linked to production CAB decision records.
- API endpoints for listing and recording production implementation hold records.
- Admin Operations production implementation hold panel.
- Implementation owner, hold window, condition acceptance, rollback implementation owner, and release freeze acknowledgment checks.
- Tests proving missing CAB decision records or incomplete hold evidence block implementation hold readiness.

### Notes

- Production implementation hold records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.36.0-production-cab-decision-record] - 2026-07-07

### Added

- Production CAB decision records linked to production CAB handoff packets.
- API endpoints for listing and recording production CAB decision records.
- Admin Operations production CAB decision panel.
- CAB decision, decision authority, condition list, rollback approval, and decision minutes checks.
- Tests proving missing CAB handoff packets or incomplete decision evidence block decision readiness.

### Notes

- Production CAB decision records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.35.0-production-cab-handoff-packet] - 2026-07-07

### Added

- Production CAB handoff packets linked to production change freeze records.
- API endpoints for listing and recording production CAB handoff packets.
- Admin Operations production CAB handoff panel.
- CAB owner, agenda reference, risk acceptance, rollback representation, and final go/no-go agenda checks.
- Tests proving missing freeze records or incomplete CAB evidence block handoff readiness.

### Notes

- Production CAB handoff packets are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.34.0-production-change-freeze-record] - 2026-07-07

### Added

- Production change freeze records linked to production adapter authorization packets.
- API endpoints for listing and recording production change freeze records.
- Admin Operations production change freeze panel.
- Freeze owner, freeze window, stakeholder notification, rollback standby, and no-change exception plan checks.
- Tests proving missing authorization packets or incomplete freeze evidence block freeze readiness.

### Notes

- Production change freeze records are evidence-only.
- The prototype does not promote, enable, or execute real adapters.

## [v2.33.0-production-adapter-authorization-packet] - 2026-07-07

### Added

- Production adapter authorization packet records linked to adapter promotion readiness dossiers.
- API endpoints for listing and recording production authorization packets.
- Admin Operations production adapter authorization panel.
- Production approver, change ticket, release window, emergency rollback authorization, and compliance acceptance checks.
- Tests proving missing promotion dossiers or incomplete production authorization evidence block packet readiness.

### Notes

- Production authorization packets are evidence-only.
- The prototype does not authorize, promote, or enable real adapters.

## [v2.32.0-adapter-promotion-readiness-dossier] - 2026-07-07

### Added

- Adapter promotion readiness dossier records linked to switch closure packages.
- API endpoints for listing and recording adapter promotion dossiers.
- Admin Operations adapter promotion dossier panel.
- Promotion owner, retained switch evidence, monitoring plan, rollback drill confirmation, and security acceptance checks.
- Tests proving missing closure packages or incomplete promotion evidence block readiness.

### Notes

- Adapter promotion dossiers are evidence-only.
- The prototype does not promote or enable real adapters.

## [v2.31.0-switch-closure-retention-package] - 2026-07-07

### Added

- Switch closure retention package records linked to outcome records.
- API endpoints for listing and recording switch closure packages.
- Admin Operations switch closure retention panel.
- Closure owner, retained evidence manifest, lessons learned, rollback timer closure, and final audit retention checks.
- Tests proving missing outcome records or incomplete closure evidence block readiness.

### Notes

- Switch closure packages are evidence-only.
- The prototype closes retained records only and does not execute switch changes.

## [v2.30.0-switch-execution-outcome-record] - 2026-07-07

### Added

- Switch execution outcome records linked to handoff packages.
- API endpoints for listing and recording switch outcome records.
- Admin Operations switch execution outcome panel.
- Operator result, post-switch validation, rollback decision, incident bridge log, and audit sign-off checks.
- Tests proving missing handoff packages or incomplete outcome evidence block readiness.

### Notes

- Switch outcome records are evidence-only.
- The prototype records out-of-band execution outcomes only and does not execute switch changes.

## [v2.29.0-switch-execution-handoff-package] - 2026-07-07

### Added

- Switch execution handoff package records linked to controlled switch requests.
- API endpoints for listing and recording switch handoff packages.
- Admin Operations switch execution handoff panel.
- Operator run sheet, communications plan, observation window, rollback-owner acceptance, and execution freeze proof checks.
- Tests proving missing switch requests or incomplete handoff evidence block readiness.

### Notes

- Switch handoff packages are evidence-only.
- The prototype does not execute real-adapter switch changes.

## [v2.28.0-controlled-switch-configuration-request] - 2026-07-07

### Added

- Controlled switch configuration request records linked to switch-state audit packages.
- API endpoints for listing and recording controlled switch requests.
- Admin Operations controlled switch request panel.
- Operator confirmation, second reviewer acceptance, rollback timer, final dry-run proof, and retention reference checks.
- Tests proving missing audit packages or incomplete controlled switch evidence block readiness.

### Notes

- Controlled switch requests are evidence-only.
- The prototype does not change real-adapter switch state.

## [v2.27.0-real-adapter-switch-state-audit-package] - 2026-07-07

### Added

- Real-adapter switch-state audit package records linked to manual switch reviews.
- API endpoints for listing and recording switch-state audit packages.
- Admin Operations switch-state audit panel.
- Pre-change snapshot, post-change snapshot, reviewer evidence, rollback timer, and retention reference checks.
- Tests proving missing switch reviews or incomplete audit evidence block readiness.

### Notes

- Switch-state audit packages are evidence-only.
- The prototype does not change real-adapter switch state.

## [v2.26.0-manual-real-adapter-switch-review] - 2026-07-07

### Added

- Manual real-adapter switch review records linked to lab scope activations.
- API endpoints for listing and recording switch reviews.
- Admin Operations switch review panel.
- Named switch operator, second reviewer, maintenance window, switch-state audit, and rollback contact checks.
- Tests proving missing activations or incomplete switch review evidence block readiness.

### Notes

- Switch reviews are evidence-only.
- The prototype does not change real-adapter switch state.

## [v2.25.0-real-adapter-lab-scope-activation] - 2026-07-07

### Added

- Real-adapter lab scope activation records linked to dispatch approvals.
- API endpoints for listing and recording lab scope activations.
- Admin Operations lab scope activation panel.
- Authorized lab scope, pentest completion, rollback owner, bounded provider target, and manual operator control checks.
- Tests proving missing dispatch approvals or incomplete activation evidence block readiness.

### Notes

- Lab scope activations prepare evidence for manual real-adapter switch review only.
- Real Nutanix adapter execution remains disabled.

## [v2.24.0-execution-broker-dispatch-approval] - 2026-07-07

### Added

- Execution broker dispatch approval records linked to broker queue records.
- API endpoints for listing and recording dispatch approvals.
- Admin Operations dispatch approval panel.
- Rollback proof, operator approver, pentest evidence, and dispatch window checks.
- Tests proving missing broker records or incomplete dispatch evidence block readiness.

### Notes

- Dispatch approvals are non-executing evidence records.
- Real Nutanix adapter execution remains disabled.

## [v2.23.0-execution-broker-hardening] - 2026-07-07

### Added

- Execution broker queue records linked to controlled lab readiness attestations.
- API endpoints for listing and recording broker queue records.
- Admin Operations execution broker panel.
- Idempotency key, approval evidence, kill-switch, and operator-review-only checks.
- Tests proving missing attestations, duplicate idempotency keys, or incomplete evidence block broker readiness.

### Notes

- Broker records are queued for operator review only.
- Real Nutanix adapter execution remains disabled.

## [v2.22.0-controlled-lab-execution-readiness-attestation] - 2026-07-07

### Added

- Controlled lab execution readiness attestation records linked to evidence ledgers.
- API endpoints for listing and recording readiness attestations.
- Admin Operations readiness attestation panel.
- Platform, security, operations, rollback, and executive sponsor attestation evidence.
- Tests proving missing evidence ledgers or incomplete attestations block readiness.

### Notes

- Readiness attestations are evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.21.0-controlled-lab-execution-evidence-ledger] - 2026-07-07

### Added

- Controlled lab execution evidence ledger records linked to dry-run checklists.
- API endpoints for listing and recording evidence ledgers.
- Admin Operations evidence ledger panel.
- Immutable operator, observer, rollback, log, audit, and stop authority evidence references.
- Tests proving missing dry-run checklists or incomplete evidence block ledger readiness.

### Notes

- Evidence ledgers are evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.20.0-controlled-lab-dry-run-execution-checklist] - 2026-07-07

### Added

- Controlled lab dry-run execution checklist records linked to rehearsal packets.
- API endpoints for listing and recording dry-run execution checklists.
- Admin Operations dry-run checklist panel.
- Operator roster, observation window, log capture, rollback timer, stop authority, and disabled execution checks.
- Tests proving missing rehearsal packets or checklist evidence block readiness.

### Notes

- Dry-run execution checklists are evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.19.0-controlled-lab-execution-rehearsal-packet] - 2026-07-07

### Added

- Controlled lab execution rehearsal packet records linked to approval gates.
- API endpoints for listing and preparing rehearsal packets.
- Admin Operations rehearsal packet panel.
- Frozen runbook, rollback owner, stop condition, emergency contact, proposal export, audit export, and approval evidence references.
- Tests proving missing approval gates or incomplete frozen evidence block packet readiness.

### Notes

- Rehearsal packets are evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.18.0-controlled-lab-execution-approval-gate] - 2026-07-07

### Added

- Controlled lab execution approval records linked to proposal exports.
- API endpoints for listing and recording execution approval gates.
- Admin Operations approval gate panel.
- Platform owner, security reviewer, lab owner, rollback owner, and executive sponsor decisions.
- Tests proving missing approvals block advancement and real adapter execution remains disabled.

### Notes

- Approval gates are evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.17.0-lab-execution-proposal-export] - 2026-07-07

### Added

- Lab execution proposal export records linked to proposal envelopes.
- API endpoints for listing and preparing proposal export manifests.
- Admin Operations proposal export history panel.
- Redacted metadata manifests for proposal checks, evidence references, rollback owner, emergency contacts, kill switch state, and disabled execution state.
- Tests proving proposal exports contain references and metadata only.

### Notes

- Proposal exports are metadata-only.
- Real Nutanix adapter execution remains disabled.

## [v2.16.0-lab-execution-proposal-envelope] - 2026-07-07

### Added

- Lab execution proposal envelope records linked to lab evidence reviews.
- API endpoints for listing and recording proposal envelopes.
- Admin Operations proposal readiness panel.
- Checks for lab scope, runbook, dry-run window, window evidence export, review acceptance, rollback owner, audit export, emergency contacts, and disabled execution.
- Tests proving missing or rejected review evidence blocks proposal readiness.

### Notes

- Proposal envelopes are evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.15.0-lab-evidence-review-queue] - 2026-07-07

### Added

- Lab evidence review records linked to lab window evidence exports.
- Reviewer decisions for platform owner, security reviewer, and operations reviewer.
- API endpoints for listing and recording lab evidence reviews.
- Admin Operations review queue for accepted, rejected, and blocked evidence packages.
- Tests proving missing reviewer decisions block review completion.

### Notes

- Review records are evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.14.0-lab-window-evidence-export] - 2026-07-07

### Added

- Lab window evidence export records linked to controlled lab dry-run windows.
- Redacted JSON manifest metadata for runbook, release export, lab scope, rollback owner, emergency contacts, readiness checks, and disabled execution state.
- API endpoints for listing and preparing lab window evidence exports.
- Admin Operations export history for lab window evidence.
- Tests proving exports contain references and metadata only.

### Notes

- Lab window exports are metadata-only.
- Real Nutanix adapter execution remains disabled.

## [v2.13.0-controlled-lab-dry-run-window] - 2026-07-07

### Added

- Controlled lab dry-run window records with scheduled start and end times.
- API endpoints for listing and preparing dry-run windows.
- Admin Operations panel for linked runbook, release evidence export, lab scope, rollback owner, emergency stop contacts, and window readiness checks.
- Tests proving missing runbook, lab scope, rollback owner, or audit evidence blocks window readiness.

### Notes

- Window scheduling remains evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.12.0-controlled-lab-release-runbook] - 2026-07-07

### Added

- Controlled lab release runbook records linked to provider release readiness.
- API endpoints for listing and preparing controlled lab release runbooks.
- Admin Operations panel for required sign-offs, stop conditions, escalation contacts, and disabled execution evidence.
- Tests proving missing sign-offs block runbook completion.

### Notes

- Runbook completion remains evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.11.0-provider-release-dashboard-hardening] - 2026-07-07

### Added

- Provider release readiness summary for NCI, NKP, NDB, NUS, and NAI.
- API endpoint for release readiness comparison across providers.
- Admin Control Plane panel for nearest-to-ready, most-blocked, per-provider gap counts, and disabled execution status.
- Tests proving summary counts match provider release gate records.

### Notes

- Release readiness remains evidence-only.
- Real Nutanix adapter execution remains disabled.

## [v2.10.0-release-evidence-export-hardening] - 2026-07-07

### Added

- Release evidence export records linked to provider release gates.
- API endpoints for listing and preparing release evidence exports.
- Admin Operations panel for release evidence export manifests.
- Tests proving release evidence exports are redacted metadata-only manifests with checksums.

### Notes

- Release evidence exports contain references and metadata only.
- Inline auth material is redacted before manifest persistence.
- Real Nutanix adapter execution remains disabled.

## [v2.9.0-provider-release-gate-evidence] - 2026-07-07

### Added

- Provider release gate records for NCI, NKP, NDB, NUS, and NAI.
- API endpoints for listing and recording provider release gate reviews.
- Admin Control Plane panel summarizing release evidence, missing gates, blocked operations, and real-adapter kill switch state.
- Tests proving missing evidence blocks release review and real adapter switches remain disabled.

### Notes

- This phase is evidence-only and does not enable provider execution.
- Provider release remains blocked unless lab scope, credentials, lifecycle proof, preflight, adapter contract, audit export, rollback ownership, and release approver evidence are present.
- Real Nutanix adapter execution remains disabled.

## [v2.8.0-platform-service-adapter-contracts] - 2026-07-07

### Added

- Disabled platform-service adapter contracts for NKP, NDB, NUS, and NAI request payloads.
- API endpoints for listing and recording service adapter contract reviews.
- Admin Control Plane panel for service payload preview, contract checks, blocked operations, and per-provider kill switch state.
- Tests proving service payload fields stay allowlisted and execute/poll/rollback remain disabled.

### Notes

- This phase defines service adapter contract boundaries only.
- NKP, NDB, NUS, and NAI execute, poll, and rollback calls remain disabled.
- Future live service adapters still require authorized scope, VM lifecycle proof, service preflight, and explicit adapter release.

## [v2.7.0-controlled-create-adapter-contract] - 2026-07-07

### Added

- Disabled AHV create adapter contract with validate, payload mapping, execute, poll, and rollback methods.
- API endpoints for listing and recording AHV create adapter contract reviews.
- Admin Control Plane panel for payload preview, contract checks, blocked mutation operations, and adapter kill switch state.
- Tests proving the contract review maps approved dry-run fields and execute/poll/rollback remain disabled.

### Notes

- This phase defines the adapter contract boundary only.
- Prism Central create, poll, and rollback calls remain disabled.
- A future live adapter still requires authorized lab scope, pentest evidence, and explicit adapter release.

## [v2.6.0-controlled-create-adapter-authorization-envelope] - 2026-07-07

### Added

- Controlled-create authorization envelope records that roll up lab scope, rollback/destroy proof, gate approval, lifecycle proof, adapter enablement, audit export, pentest gate status, and mutation guardrails.
- API endpoints for listing and recording authorization envelope reviews.
- Admin Control Plane panel showing exactly which evidence blocks future live AHV create authorization.
- Tests proving missing active pentest scope blocks live adapter authorization.

### Notes

- This phase does not enable live AHV mutation.
- Active pentest scope remains required for future real adapter work.
- Real Nutanix mutation operations remain disabled.

## [v2.5.0-preflight-destroy-rollback-hardening] - 2026-07-07

### Added

- Rollback/destroy proof records tied to VM sandbox dry-run plans.
- API endpoints for listing and recording rollback/destroy proof evidence.
- Controlled provisioning gate now requires ready rollback/destroy proof before manual approval can promote to mutation-disabled readiness.
- Admin Control Plane panel for backup/export evidence, owner notification, teardown order, inventory reconciliation, and stop conditions.
- Tests and smoke coverage for the rollback/destroy proof gate.

### Notes

- Missing rollback or destroy evidence blocks controlled create promotion.
- Rollback/destroy proof records are evidence-only and do not mutate AHV resources.
- Real Nutanix mutation operations remain disabled.

## [v2.4.0-lab-scope-pentest-evidence-hardening] - 2026-07-07

### Added

- Versioned lab authorization scope records with target environment, provider coverage, endpoint references, evidence references, and rollback owner.
- Lab scope diagnostics API for readiness checks, provider coverage, expiry, and adapter-review readiness.
- Admin Control Plane diagnostics for provider coverage, target endpoints, evidence references, and rollback ownership.
- Tests proving expired or incomplete lab scope evidence blocks adapter enablement.

### Notes

- Pentest evidence is metadata-only and must not contain secrets.
- Production readiness and adapter enablement now share the stricter active lab-scope predicate.
- Real Nutanix mutation operations remain disabled.

## [v2.3.0-adapter-enable-contract-hardening] - 2026-07-06

### Added

- Adapter enablement contract records for NCI, NKP, NDB, NUS, NCM, and NAI readiness review.
- API endpoints for listing and recording adapter enablement evidence.
- Admin Providers panel for adapter enablement checks, rollback ownership, evidence summary, and blocked mutation operations.
- Tests and smoke coverage for fail-closed adapter enablement review behavior.

### Notes

- Missing evidence keeps adapter enablement blocked.
- A real-adapter environment switch is treated as a contract failure in this phase.
- Real Nutanix mutation operations remain disabled.

## [v2.2.0-provider-credential-reference-hardening] - 2026-07-06

### Added

- Provider credential reference diagnostics for NCI, NKP, NDB, NUS, NCM, and NAI.
- Credential reference validator that accepts profile references and rejects inline access material.
- API endpoint for credential reference diagnostics.
- Admin Providers panel for missing, invalid, and approved credential references.
- Phase gate validation for provider credential reference strings.
- Tests for validator, API rejection, diagnostics, client helper, and smoke coverage.

### Notes

- Integration configuration stores reference names only.
- Audit events record whether a reference is configured, not the value itself.
- Real provisioning remains disabled.

## [v2.1.0-audit-export-retention-hardening] - 2026-07-06

### Added

- Audit export manifests with event count, retention window, generated timestamp, destination reference, and SHA-256 checksum.
- Audit retention diagnostics API for retained event count, bounds, oldest/newest events, and destination status.
- Admin Operations retention diagnostics and manifest evidence.
- Audit export destination-reference validation that rejects embedded auth material.
- Phase gate validation for audit export configuration.
- Tests for manifest creation, checksum format, destination validation, retention diagnostics, and API/client coverage.

### Notes

- Export destination references are metadata only and do not store access material.
- Audit export remains a prepared record until external storage is configured.
- Real provisioning remains disabled.

## [v2.0.0-postgres-repository-hardening] - 2026-07-06

### Added

- Postgres repository configuration validator with fail-closed connection string and schema checks.
- Postgres readiness metadata that confirms the database driver remains intentionally absent.
- Startup validation before binding the API when `NDC_REPOSITORY=postgres`.
- Migration scaffold validation script.
- Phase gate coverage for migration and Postgres configuration validation.
- Tests for Postgres configuration, schema validation, readiness metadata, and scaffold fail-closed behavior.

### Notes

- No PostgreSQL runtime dependency was added.
- `NDC_REPOSITORY=postgres` remains a hardened scaffold until an approved database driver phase.
- Real provisioning remains disabled.

## [v1.9.0-oidc-rbac-hardening] - 2026-07-06

### Added

- Optional strict trusted-header mode through `NDC_REQUIRE_TRUSTED_IDENTITY=true`.
- Fail-closed `401` behavior for API routes when required trusted identity headers are missing.
- Public health/readiness probe exemption for strict identity deployments.
- Session diagnostics API with trusted-header mode, missing header list, and role/action matrix.
- Admin Overview identity boundary and authorization matrix panel.
- Tests for diagnostics, strict trusted-header denial, and client coverage.

### Notes

- Trusted-header mode expects a reverse proxy or ingress to validate OIDC before forwarding identity headers.
- Real provisioning remains disabled.
- `provisioningEnabled` remains `false`.

## [v1.8.0-on-prem-packaging-hardening] - 2026-07-06

### Added

- On-prem configuration validation script for state path, audit retention, rate limit, repository mode, and real-adapter guardrails.
- JSON state backup, restore, and backup/restore smoke scripts.
- Phase gate checks for on-prem configuration validation and backup/restore smoke.
- Compose environment hardening for repository mode, audit retention, rate limiting, and disabled Prism real adapter guardrail.
- Expanded on-prem deployment runbook with validation, backup/restore, deployment matrix, and security checklist.

### Notes

- Backup/restore tooling is for the JSON starter state file and does not replace a production database backup design.
- Real Nutanix mutation adapters remain disabled.
- `provisioningEnabled` remains `false`.

## [v1.7.0-private-cloud-developer-platform] - 2026-07-06

### Added

- API-backed private-cloud lifecycle operation records for extend, suspend, destroy, and rebuild requests.
- API-backed audit export readiness records with retention and redaction boundaries.
- Admin Operations tab for lifecycle requests and audit export preparation.
- Tests and smoke coverage for operations and audit export workflows.

### Notes

- Lifecycle operations are gated operator records only; they do not call Nutanix APIs.
- Real provider mutation remains disabled until a separate authorized adapter release.
- `provisioningEnabled` remains `false`.

## [v1.6.0-production-readiness-review] - 2026-07-06

### Added

- Production readiness review records.
- API endpoints for listing and creating production readiness reviews.
- Admin Overview panel for running readiness review checks.
- Readiness checks for OIDC boundary, durable state, audit retention, lab authorization, VM lifecycle proof, AHV preflight, platform-service preflight coverage, and provisioning guardrail.
- Audit evidence and automated coverage for production readiness behavior.

### Notes

- Reviews are gate evidence only and do not enable live provisioning.
- Current reviews remain blocked until real OIDC ingress, durable state, lab authorization, lifecycle proof, and full preflight evidence are present.
- `provisioningEnabled` remains `false`.

## [v1.5.0-platform-service-preflight] - 2026-07-06

### Added

- Fail-closed platform-service preflight adapter interface for NKP, NDB, NUS, and NAI.
- API endpoints for listing and recording platform-service preflight runs.
- Admin Control Plane panel for service preflight checks.
- Checks for request validation, VM lifecycle proof, provider readiness, adapter configuration, and real-adapter switch state.
- Provider-specific blocked operation evidence for namespace, database, storage, and AI endpoint flows.
- Audit evidence and automated coverage for platform-service preflight behavior.

### Notes

- No NKP, NDB, NUS, or NAI API calls are made.
- Platform service preflight remains a disabled-adapter boundary.
- `provisioningEnabled` remains `false`.

## [v1.4.0-ahv-preflight-boundary] - 2026-07-06

### Added

- Fail-closed AHV controlled-provisioning adapter interface.
- Disabled real-adapter preflight run records for controlled VM create/destroy preparation.
- API endpoints for listing and recording AHV controlled-provisioning preflight runs.
- Admin Control Plane panel for running AHV preflight checks.
- Preflight checks for controlled gate approval, active lab scope, verified lifecycle proof, controlled create switch, and AHV adapter enablement.
- Audit evidence and automated coverage for AHV preflight behavior.

### Notes

- The adapter boundary does not call Prism Central.
- All AHV mutation operations remain blocked and recorded as blocked operations.
- `provisioningEnabled` remains `false`.

## [v1.3.0-lifecycle-evidence] - 2026-07-06

### Added

- Lab authorization scope records with project, cluster, network, allowed actions, excluded actions, approval window, and pentest scope evidence.
- VM lifecycle proof records for controlled gate, rollback, and destroy evidence.
- API endpoints for listing and recording lab authorization scopes and lifecycle proofs.
- Admin Control Plane evidence panel for scope and lifecycle-proof records.
- Controlled provisioning gates now consume active lab authorization scope evidence.
- Platform-service flows now depend on recorded VM lifecycle proof rather than an environment flag.
- Unit/API/client/E2E coverage for authorization and lifecycle evidence.

### Notes

- Lifecycle proof records do not perform real AHV operations.
- Real provisioning remains disabled; `provisioningEnabled=false` is preserved.
- A proof is blocked unless the controlled gate reaches `Approved for controlled create`.

## [v1.2.0-platform-services] - 2026-07-06

### Added

- Platform-service request model for NKP namespace, NDB PostgreSQL, NUS storage, and NAI endpoint flows.
- API endpoints for listing and planning platform-service requests.
- Validation for published service profiles, provider match, service naming, environment mapping, and VM lifecycle proof.
- Admin Control Plane panel for planning NKP, NDB, NUS, and NAI platform-service flows.
- Cost estimates, approval evidence, rollback notes, cleanup plans, and audit events for platform-service requests.
- Unit/API/client/E2E coverage for platform-service planning behavior.

### Notes

- Platform-service requests are planning records only. They do not call NKP, NDB, NUS, or NAI APIs.
- Requests remain blocked until controlled VM create, verify, rollback, and destroy proof exists.
- `provisioningEnabled` remains `false`.

## [v1.1.0-controlled-provisioning] - 2026-07-06

### Added

- Controlled provisioning gate model for AHV VM sandbox dry-run plans.
- API endpoints for listing, requesting, approving, and rejecting controlled provisioning gate reviews.
- Gate checks for dry-run validation, rollback readiness, destroy readiness, manual approval, authorized scope evidence, and disabled-by-default mutation kill switch.
- Admin Control Plane panel for requesting and deciding controlled provisioning gate reviews.
- Audit events for controlled provisioning gate request and approval decisions.
- Unit/API/client/E2E coverage for controlled provisioning gate behavior.

### Notes

- This release still does not create, clone, power on, resize, tag, or delete AHV VMs.
- Approval records gate intent only. `provisioningEnabled` remains `false` until a future authorized real adapter phase.

## [v1.0.0-vm-sandbox-dry-run] - 2026-07-06

### Added

- AHV VM sandbox dry-run planning model.
- API endpoints for listing and creating VM sandbox dry-run plans.
- Validation for published VM template, approved AHV image, project, cluster, network, lifecycle category, quota, expiry, and approval evidence.
- Cost estimate, rollback plan, and explicit `provisioningEnabled=false` evidence in each dry-run plan.
- Admin Control Plane panel for generating and reviewing VM sandbox dry-run plans.
- Unit/API/client/E2E coverage for VM sandbox dry-run behavior.

### Notes

- This release does not create, clone, power on, resize, or delete AHV VMs.
- Failed validations are reported in the dry-run plan instead of triggering provisioning.

## [v0.9.0-production-foundation] - 2026-07-06

### Added

- OIDC-shaped request context using trusted prototype headers for user, display name, roles, and issuer.
- RBAC guardrails for admin, approval, registry, integration, control-plane, destroy, and inventory import actions.
- Security headers for API and static responses.
- In-memory rate limiting for the hosted starter API.
- Structured JSON request logging with request IDs, actor, status, and duration.
- Request body size guardrail for JSON API requests.
- Audit retention enforcement for memory and JSON-file stores.
- Postgres repository scaffold and initial SQL migration for state and audit-event storage.
- GitHub Security workflow with CodeQL and dependency review.

### Notes

- The Postgres repository is intentionally scaffolded without a runtime database driver. Adding a PostgreSQL dependency requires explicit approval.
- Auth and RBAC remain starter controls for the hosted prototype. Production deployment still needs a real OIDC validation layer in front of trusted headers.

## [v0.8.0-prism-readonly-inventory] - 2026-07-06

### Added

- Prism Central read-only inventory adapter contract with mock and disabled-real implementations.
- API-backed Prism inventory import endpoint guarded by reachable NCI integration configuration.
- Prism inventory records for clusters, projects, images, networks, categories, and VMs.
- Import summary evidence showing read-only mode, blocked mutation operations, scope, and provisioning disabled.
- Draft AHV image resource profile candidates generated from imported Prism image inventory.
- Admin Providers panel for Prism read-only inventory import and imported record review.
- Unit/API/client/E2E coverage for Prism inventory import and profile candidate mapping.

### Notes

- No live Prism Central API call is made in this release. The real adapter path remains disabled by code.
- Imported inventory is read-only planning evidence and does not enable create, update, delete, power, clone, or resize operations.

## [v0.7.0-registry-governance] - 2026-07-02

### Added

- API-backed template registry with draft, pending approval, published, and deprecated states.
- API-backed policy bundle catalog for standard sandbox, data protection, AI safety, and regulated audit controls.
- Registry lifecycle actions for template versions: submit, approve, deprecate, and restore.
- Resource profile governance actions for image, Kubernetes, database, storage, and AI profile records.
- Audit evidence for template and resource profile governance transitions.
- Admin Templates tab sections for image/profile catalog, template registry, policy bundles, and template governance.
- Unit/API/client/E2E coverage for registry governance and policy bundle behavior.

### Changed

- Changed the Admin view from a long stacked panel list to tabbed sections for overview, providers, control plane, governance, and templates.
- Replaced the app badge, sidebar logo, and favicon with the primary Nutanix Developer Cloud Studio SVG logo.

### Notes

- Registry governance remains simulated. Publishing a template or resource profile does not enable real provisioning.

## [v0.6.0-provisioning-adapters] - 2026-06-28

### Added

- Provisioning adapter contract with validate, plan, provision, poll, and destroy capabilities.
- API-backed provider readiness endpoint for NCI, NKP, NDB, NUS, NCM, and NAI adapter placeholders.
- API-backed image and profile catalog for AHV images, NKP versions, NDB engines, NUS storage classes, and NAI profiles.
- Platform configuration model for project, cluster, network, and credential-reference planning without storing real secrets.
- Simulated environment destroy lifecycle that queues a control-plane teardown job and audit evidence.
- Admin Image and Template Catalog panel and Provider Readiness panel.
- Environment detail control-plane lifecycle panel.
- Unit/API/client/E2E coverage for provider inventory and destroy lifecycle behavior.

### Notes

- Adapter contracts are mock-only. Real provisioning and real teardown remain disabled.

## [v0.5.0-control-plane] - 2026-06-28

### Added

- Provisioning control-plane job domain with queued, validating, awaiting approval, provisioning, ready, failed, and expired states.
- Mock orchestrator worker actions for advancing, retrying, and failing jobs.
- API endpoints for `/api/control-plane/jobs` and job actions.
- Control-plane audit events for queueing, transitions, retries, failures, and approval release.
- Admin Provisioning Control Plane panel with worker controls.
- Dashboard Control Plane Queue panel and active job status tile.
- Browser mock control-plane state machine for static GitHub Pages mode.
- Unit/API/client/E2E coverage for control-plane queue behavior.

### Notes

- The control plane is structurally ready for future adapters, but real infrastructure provisioning remains disabled.

## [v0.4.0-lab-adapter] - 2026-06-27

### Added

- Read-only lab adapter snapshot model with explicit `provisioningEnabled: false` guardrail.
- API endpoints for `/api/system/status`, `/api/lab-adapters`, and read-only discovery simulation.
- Admin Lab Adapter Pilot panel showing adapter scope, inventory count, discovery timestamp, and safe discovery action.
- Dashboard provisioning status tile showing provisioning disabled and read-only candidate count.
- Backup/restore unit coverage for JSON-file prototype state.
- Hosted starter validation now checks system status, lab adapter availability, and provisioning guardrail.

### Changed

- Playwright smoke now covers integration configuration, readiness check, lab discovery, and provisioning-disabled guardrail.

### Notes

- The lab adapter pilot is deliberately read-only and simulated. It does not call Prism Central or any real Nutanix API yet.

## [v0.3.0-integration-readiness] - 2026-06-26

### Added

- Mock OIDC session endpoint and role model for developer, approver, and platform admin workflows.
- API-backed integration configuration endpoint for lab endpoint and credential profile placeholders.
- API-backed integration readiness check endpoint with configured, reachable, failed, and not configured states.
- Database-ready `ApiRepository` persistence contract while keeping memory and JSON-file implementations.
- Admin access model panel showing current mock identity and roles.
- Admin integration configuration panel with editable endpoint/profile fields and readiness checks.
- Dashboard refresh that prioritizes environment operations and reduces the visual hero into a compact command-center panel.
- Hosted starter validation script for health, readiness, session, and integration configuration checks.
- Expanded `.env.example` for OIDC and Nutanix lab integration placeholders.

### Changed

- README, API docs, architecture notes, roadmap, and build plan now describe the integration-readiness phase.

### Notes

- Auth, roles, and integration checks remain simulated. No real SSO, Nutanix credentials, or infrastructure calls are used.

## [v0.2.0-hosted-starter] - 2026-06-26

### Added

- Frontend API auto-detection through `/healthz` for hosted/on-prem mode.
- API-backed environment loading and environment request submission.
- API-backed approval queue with approve/reject decisions.
- API-backed environment detail endpoint with environment, jobs, approvals, and audit events.
- Dashboard layout refresh toward an ops/on-prem console with runtime, approval, environment, and readiness status.
- Admin integration readiness panel connected to API data.
- Browser mock fallback when the hosted API is unavailable.
- Node HTTP API starter with health, readiness, catalog, environment, integration, job, approval, and audit endpoints.
- Memory and JSON-file persistence abstractions for hosted/on-prem mock API state.
- Dockerfile and Docker Compose starter for private-network evaluation.
- API and on-prem deployment documentation.
- Server-side API tests.
- GitHub Actions CI workflow for unit tests, production build, and Playwright smoke tests.
- GitHub Pages deployment workflow for the static prototype.
- Playwright end-to-end smoke test for the core prototype workflow.
- Backend-shaped mock Nutanix adapter contracts and tests.
- Repository-owned dashboard screenshot asset for the README.

### Changed

- Playwright can target an API-hosted built app with `PLAYWRIGHT_BASE_URL`.
- Playwright smoke now covers the approval queue and environment detail view.
- Vite now emits relative asset paths for repository-path static hosting.
- README now references the repo-owned dashboard screenshot instead of a GitHub attachment URL.

### Notes

- This release is still a prototype milestone. Hosted/on-prem mode uses simulated integrations and mock persistence only.

## [v0.1.0-mvp] - 2026-06-26

### Added

- Clickable developer portal dashboard.
- Golden-path app catalog.
- Template details view with outcomes and integration readiness notes.
- Create-environment workflow with target choices for VM, Kubernetes, database, storage, and AI endpoint.
- Simulated policy, cost, compliance, and integration checks.
- Environment status page with timed mock provisioning transitions.
- Approval pause behavior for AI endpoint requests.
- Platform admin view with integration health, governance queue, platform controls, template governance editing, and integration readiness notes.
- Mock Nutanix integration concepts for NCI, NKP, NDB, NUS, NCM, and NAI.
- Browser local storage persistence for requested environments and template governance edits.
- Mock provisioning service for cost estimates, persistence, request upserts, status updates, and job transitions.
- Vitest unit coverage for provisioning service behavior.
- Primary SVG app logo and browser favicon.
- Dashboard visual and public README screenshot.
- Project documentation for architecture, build plan, roadmap, product brief, demo script, hosting notes, testing, security, contribution, and code review.
- Configurable Obsidian documentation sync using `NDC_STUDIO_OBSIDIAN_VAULT`.
- GitHub issue templates for bug reports, feature requests, and documentation updates.
- GitHub pull request template aligned to the project definition of done.

### Changed

- Moved prototype mock data from the main app component into dedicated domain data files.
- Clarified public README disclaimer that the project is currently a simulated MVP prototype and does not currently provision real Nutanix infrastructure.
- Removed personal local filesystem paths from public documentation.

### Security

- Confirmed no real `.env` files are committed; only `.env.example` is tracked.
- Confirmed no credentials, API keys, tokens, or private keys are present in docs or code scans.
- Added public contribution and PR guidance to avoid secrets, customer data, private infrastructure details, and private local paths.

### Notes

- This release is a prototype milestone. It does not currently call real Nutanix APIs or provision real infrastructure.
