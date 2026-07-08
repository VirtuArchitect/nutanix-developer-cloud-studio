import { describe, expect, it } from "vitest";
import type { ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord,
  ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordError,
} from "./productionExecutionArchiveRecoveryFinalOperationsHandoffRecord";
import { createDefaultState } from "./storage";

describe("production execution archive recovery final operations handoff record", () => {
  it("requires a production execution archive recovery monitoring ownership closure record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordError);
  });

  it("blocks final operations handoff when monitoring closure or handoff evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords = [
      sampleMonitoringOwnershipClosureRecord("Blocked"),
    ];

    const record = createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord(
      state,
      {
        monitoringOwnershipClosureRecordId:
          "production-execution-archive-recovery-monitoring-ownership-closure-record-ndb-1",
        finalOperationsOwner: "",
        runbookPublicationReference: "",
        onCallScheduleHandoffReference: "",
        monitoringClosureAcceptanceReference: "",
        operationsHandoffSignOffReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      monitoringOwnershipClosureRecordId:
        "production-execution-archive-recovery-monitoring-ownership-closure-record-ndb-1",
      supportOwnershipAcceptanceRecordId:
        "production-execution-archive-recovery-support-ownership-acceptance-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Monitoring ownership closure ready", passed: false }),
        expect.objectContaining({ name: "Final operations owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks final operations handoff ready when monitoring closure and handoff evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords = [
      sampleMonitoringOwnershipClosureRecord(
        "Ready for production execution archive recovery monitoring ownership closure review"
      ),
    ];

    const record = createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord(
      state,
      {
        monitoringOwnershipClosureRecordId:
          "production-execution-archive-recovery-monitoring-ownership-closure-record-ndb-1",
      },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution archive recovery final operations handoff review");
    expect(record.finalOperationsOwner).toBe("Production Archive Recovery Final Operations Owner");
    expect(record.runbookPublicationReference).toBe(
      "production-archive-recovery-final-operations-runbook-publication-ndb.md"
    );
    expect(record.onCallScheduleHandoffReference).toBe(
      "production-archive-recovery-final-operations-on-call-handoff-ndb.md"
    );
    expect(record.monitoringClosureAcceptanceReference).toBe(
      "production-archive-recovery-final-operations-monitoring-closure-acceptance-ndb.md"
    );
    expect(record.operationsHandoffSignOffReference).toBe(
      "production-archive-recovery-final-operations-handoff-signoff-ndb.md"
    );
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleMonitoringOwnershipClosureRecord(
  status: "Blocked" | "Ready for production execution archive recovery monitoring ownership closure review"
): ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord {
  return {
    id: "production-execution-archive-recovery-monitoring-ownership-closure-record-ndb-1",
    provider: "NDB",
    monitoringOwnershipClosureRecordId: "unused-parent",
    supportOwnershipAcceptanceRecordId:
      "production-execution-archive-recovery-support-ownership-acceptance-record-ndb-1",
    serviceManagementHandoffRecordId:
      "production-execution-archive-recovery-service-management-handoff-record-ndb-1",
    operationalContinuityRecordId:
      "production-execution-archive-recovery-operational-continuity-record-ndb-1",
    evidenceCustodyClosureRecordId:
      "production-execution-archive-recovery-evidence-custody-closure-record-ndb-1",
    finalComplianceArchiveRecordId:
      "production-execution-archive-recovery-final-compliance-archive-record-ndb-1",
    archiveRecoveryAuditCertificationRecordId:
      "production-execution-archive-recovery-audit-certification-record-ndb-1",
    archiveRecoveryClosureRecordId: "production-execution-archive-recovery-closure-record-ndb-1",
    archiveRecoveryAcceptanceRecordId: "production-execution-archive-recovery-acceptance-record-ndb-1",
    archiveRecoveryDrillRecordId: "production-execution-archive-recovery-drill-record-ndb-1",
    archiveRetrievalValidationRecordId: "production-execution-archive-retrieval-validation-record-ndb-1",
    readinessArchiveHandoffRecordId: "production-execution-readiness-archive-handoff-record-ndb-1",
    finalAcceptanceArchiveRecordId: "production-execution-final-acceptance-archive-record-ndb-1",
    improvementClosureRecordId: "production-execution-improvement-closure-record-ndb-1",
    postImplementationReviewRecordId: "production-execution-post-implementation-review-record-ndb-1",
    operationalClosureRecordId: "production-execution-operational-closure-record-ndb-1",
    finalTurnoverRecordId: "production-execution-final-turnover-record-ndb-1",
    serviceAcceptanceRecordId: "production-execution-service-acceptance-record-ndb-1",
    supportReadinessRecordId: "production-execution-support-readiness-record-ndb-1",
    operationsHandoverRecordId: "production-execution-operations-handover-record-ndb-1",
    completionDossierRecordId: "production-execution-completion-dossier-record-ndb-1",
    finalArchiveCertificationRecordId:
      "production-execution-final-archive-certification-record-ndb-1",
    retentionAttestationRecordId: "production-execution-retention-attestation-record-ndb-1",
    archivalHandoffRecordId: "production-execution-archival-handoff-record-ndb-1",
    closurePacketRecordId: "production-execution-closure-packet-record-ndb-1",
    closureAuthorizationRecordId: "production-execution-closure-authorization-record-ndb-1",
    outcomeAuthorizationRecordId: "production-execution-outcome-authorization-record-ndb-1",
    executionHoldPointRecordId: "production-execution-hold-point-record-ndb-1",
    finalExecutionPacketRecordId: "production-final-execution-packet-record-ndb-1",
    changeTicketLockRecordId: "production-change-ticket-lock-record-ndb-1",
    executionAuthorizationRecordId: "production-execution-authorization-record-ndb-1",
    executionReadinessRecordId: "production-execution-readiness-record-ndb-1",
    operatorAssignmentRecordId: "production-operator-assignment-record-ndb-1",
    implementationHoldRecordId: "production-implementation-hold-record-ndb-1",
    cabDecisionRecordId: "production-cab-decision-record-ndb-1",
    cabHandoffPacketId: "production-cab-handoff-packet-ndb-1",
    freezeRecordId: "production-change-freeze-record-ndb-1",
    authorizationPacketId: "production-adapter-authorization-packet-ndb-1",
    promotionDossierId: "adapter-promotion-readiness-dossier-ndb-1",
    closurePackageId: "switch-closure-retention-package-ndb-1",
    outcomeRecordId: "switch-execution-outcome-record-ndb-1",
    handoffPackageId: "switch-execution-handoff-package-ndb-1",
    controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
    auditPackageId: "real-adapter-switch-state-audit-ndb-1",
    switchReviewId: "manual-real-adapter-switch-review-ndb-1",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    supportOwner: "Production Archive Recovery Support Owner",
    serviceDeskAcceptanceReference:
      "production-archive-recovery-support-ownership-service-desk-acceptance-ndb.md",
    escalationTestProofReference: "production-archive-recovery-support-ownership-escalation-test-ndb.md",
    monitoringOwnershipProofReference: "production-archive-recovery-support-ownership-monitoring-proof-ndb.md",
    supportOwnershipSignOffReference: "production-archive-recovery-support-ownership-signoff-ndb.md",
    monitoringOwner: "Production Archive Recovery Monitoring Owner",
    alertOwnershipTransferReference:
      "production-archive-recovery-monitoring-ownership-alert-transfer-ndb.md",
    dashboardAcceptanceReference:
      "production-archive-recovery-monitoring-ownership-dashboard-acceptance-ndb.md",
    escalationMonitoringValidationReference:
      "production-archive-recovery-monitoring-ownership-escalation-validation-ndb.md",
    monitoringOwnershipClosureSignOffReference:
      "production-archive-recovery-monitoring-ownership-closure-signoff-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-08T00:00:00.000Z",
  };
}
