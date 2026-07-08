import { describe, expect, it } from "vitest";
import type {
  ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord,
  ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord,
} from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord,
} from "./productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord";
import {
  createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord,
  ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordError,
} from "./productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord";
import { createDefaultState } from "./storage";

describe("production execution archive recovery monitoring ownership closure record", () => {
  it("requires a production execution archive recovery support ownership acceptance record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordError);
  });

  it("blocks monitoring ownership closure when acceptance or monitoring evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords = [sampleSupportOwnershipAcceptanceRecord("Blocked")];

    const record = createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord(state, {
      supportOwnershipAcceptanceRecordId:
        "production-execution-archive-recovery-support-ownership-acceptance-record-ndb-1",
      monitoringOwner: "",
      alertOwnershipTransferReference: "",
      dashboardAcceptanceReference: "",
      escalationMonitoringValidationReference: "",
      monitoringOwnershipClosureSignOffReference: "",
    }, "platform.admin");

    expect(record).toMatchObject({
      provider: "NDB",
      supportOwnershipAcceptanceRecordId:
        "production-execution-archive-recovery-support-ownership-acceptance-record-ndb-1",
      serviceManagementHandoffRecordId:
        "production-execution-archive-recovery-service-management-handoff-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Support ownership acceptance ready", passed: false }),
        expect.objectContaining({ name: "Monitoring owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks monitoring ownership closure ready when acceptance and monitoring evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRecoveryServiceManagementHandoffRecords = [
      sampleServiceManagementHandoffRecord(
        "Ready for production execution archive recovery service management handoff review"
      ),
    ];
    const supportRecord = createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord(
      state,
      {
        serviceManagementHandoffRecordId:
          "production-execution-archive-recovery-service-management-handoff-record-ndb-1",
      },
      "platform.admin"
    );
    state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords = [supportRecord];

    const record = createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord(
      state,
      { supportOwnershipAcceptanceRecordId: supportRecord.id },
      "platform.admin"
    );

    expect(record.status).toBe(
      "Ready for production execution archive recovery monitoring ownership closure review"
    );
    expect(record.monitoringOwner).toBe("Production Archive Recovery Monitoring Owner");
    expect(record.alertOwnershipTransferReference).toBe(
      "production-archive-recovery-monitoring-ownership-alert-transfer-ndb.md"
    );
    expect(record.dashboardAcceptanceReference).toBe(
      "production-archive-recovery-monitoring-ownership-dashboard-acceptance-ndb.md"
    );
    expect(record.escalationMonitoringValidationReference).toBe(
      "production-archive-recovery-monitoring-ownership-escalation-validation-ndb.md"
    );
    expect(record.monitoringOwnershipClosureSignOffReference).toBe(
      "production-archive-recovery-monitoring-ownership-closure-signoff-ndb.md"
    );
    expect(record.supportOwnershipAcceptanceRecordId).toBe(supportRecord.id);
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleSupportOwnershipAcceptanceRecord(
  status: "Blocked" | "Ready for production execution archive recovery support ownership acceptance review"
): ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord {
  const serviceManagementHandoffRecord = sampleServiceManagementHandoffRecord(
    "Ready for production execution archive recovery service management handoff review"
  );

  return {
    ...serviceManagementHandoffRecord,
    id: "production-execution-archive-recovery-support-ownership-acceptance-record-ndb-1",
    serviceManagementHandoffRecordId: serviceManagementHandoffRecord.id,
    status,
    supportOwner: "Production Archive Recovery Support Owner",
    serviceDeskAcceptanceReference:
      "production-archive-recovery-support-ownership-service-desk-acceptance-ndb.md",
    escalationTestProofReference: "production-archive-recovery-support-ownership-escalation-test-ndb.md",
    monitoringOwnershipProofReference: "production-archive-recovery-support-ownership-monitoring-proof-ndb.md",
    supportOwnershipSignOffReference: "production-archive-recovery-support-ownership-signoff-ndb.md",
  };
}

function sampleServiceManagementHandoffRecord(
  status: "Blocked" | "Ready for production execution archive recovery service management handoff review"
): ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord {
  return {
    id: "production-execution-archive-recovery-service-management-handoff-record-ndb-1",
    provider: "NDB",
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
    serviceOwner: "Production Archive Recovery Service Owner",
    supportQueueMappingReference: "production-archive-recovery-service-management-support-queue-ndb.json",
    knowledgeArticleReference: "production-archive-recovery-service-management-knowledge-article-ndb.md",
    escalationMatrixReference: "production-archive-recovery-service-management-escalation-matrix-ndb.md",
    serviceManagementHandoffSignOffReference:
      "production-archive-recovery-service-management-handoff-signoff-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-08T00:00:00.000Z",
  };
}
