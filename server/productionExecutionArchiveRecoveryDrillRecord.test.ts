import { describe, expect, it } from "vitest";
import type { ProductionExecutionArchiveRetrievalValidationRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionArchiveRecoveryDrillRecord,
  ProductionExecutionArchiveRecoveryDrillRecordError,
} from "./productionExecutionArchiveRecoveryDrillRecord";
import { createDefaultState } from "./storage";

describe("production execution archive recovery drill record", () => {
  it("requires a production execution archive retrieval validation record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionArchiveRecoveryDrillRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionArchiveRecoveryDrillRecordError);
  });

  it("blocks archive recovery drill when retrieval validation or drill evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRetrievalValidationRecords = [sampleArchiveRetrievalValidationRecord("Blocked")];

    const record = createProductionExecutionArchiveRecoveryDrillRecord(
      state,
      {
        archiveRetrievalValidationRecordId: "production-execution-archive-retrieval-validation-record-ndb-1",
        drillOwner: "",
        recoveryScenarioReference: "",
        elapsedRecoveryProofReference: "",
        restoredArtifactReviewReference: "",
        drillSignOffReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      archiveRetrievalValidationRecordId: "production-execution-archive-retrieval-validation-record-ndb-1",
      readinessArchiveHandoffRecordId: "production-execution-readiness-archive-handoff-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archive retrieval validation ready", passed: false }),
        expect.objectContaining({ name: "Drill owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks archive recovery drill ready when retrieval validation and drill evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRetrievalValidationRecords = [
      sampleArchiveRetrievalValidationRecord("Ready for production execution archive retrieval validation review"),
    ];

    const record = createProductionExecutionArchiveRecoveryDrillRecord(
      state,
      { archiveRetrievalValidationRecordId: "production-execution-archive-retrieval-validation-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution archive recovery drill review");
    expect(record.drillOwner).toBe("Production Archive Recovery Drill Owner");
    expect(record.recoveryScenarioReference).toBe("production-archive-recovery-scenario-ndb.md");
    expect(record.elapsedRecoveryProofReference).toBe("production-archive-elapsed-recovery-proof-ndb.md");
    expect(record.restoredArtifactReviewReference).toBe("production-archive-restored-artifact-review-ndb.md");
    expect(record.drillSignOffReference).toBe("production-archive-recovery-drill-signoff-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleArchiveRetrievalValidationRecord(
  status: "Blocked" | "Ready for production execution archive retrieval validation review"
): ProductionExecutionArchiveRetrievalValidationRecord {
  return {
    id: "production-execution-archive-retrieval-validation-record-ndb-1",
    provider: "NDB",
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
    retrievalOperator: "Production Archive Retrieval Operator",
    sampleRetrievalProofReference: "production-archive-sample-retrieval-proof-ndb.md",
    checksumVerificationReference: "production-archive-checksum-verification-ndb.sha256",
    accessAuditReference: "production-archive-access-audit-ndb.md",
    recoverySlaWitnessReference: "production-archive-recovery-sla-witness-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
