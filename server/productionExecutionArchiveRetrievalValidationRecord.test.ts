import { describe, expect, it } from "vitest";
import type { ProductionExecutionReadinessArchiveHandoffRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionArchiveRetrievalValidationRecord,
  ProductionExecutionArchiveRetrievalValidationRecordError,
} from "./productionExecutionArchiveRetrievalValidationRecord";
import { createDefaultState } from "./storage";

describe("production execution archive retrieval validation record", () => {
  it("requires a production execution readiness archive handoff record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionArchiveRetrievalValidationRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionArchiveRetrievalValidationRecordError);
  });

  it("blocks archive retrieval validation when handoff or retrieval evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionReadinessArchiveHandoffRecords = [sampleReadinessArchiveHandoffRecord("Blocked")];

    const record = createProductionExecutionArchiveRetrievalValidationRecord(
      state,
      {
        readinessArchiveHandoffRecordId: "production-execution-readiness-archive-handoff-record-ndb-1",
        retrievalOperator: "",
        sampleRetrievalProofReference: "",
        checksumVerificationReference: "",
        accessAuditReference: "",
        recoverySlaWitnessReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      readinessArchiveHandoffRecordId: "production-execution-readiness-archive-handoff-record-ndb-1",
      finalAcceptanceArchiveRecordId: "production-execution-final-acceptance-archive-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Readiness archive handoff ready", passed: false }),
        expect.objectContaining({ name: "Retrieval operator assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks archive retrieval validation ready when handoff and retrieval evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionReadinessArchiveHandoffRecords = [
      sampleReadinessArchiveHandoffRecord("Ready for production execution readiness archive handoff review"),
    ];

    const record = createProductionExecutionArchiveRetrievalValidationRecord(
      state,
      { readinessArchiveHandoffRecordId: "production-execution-readiness-archive-handoff-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution archive retrieval validation review");
    expect(record.retrievalOperator).toBe("Production Archive Retrieval Operator");
    expect(record.sampleRetrievalProofReference).toBe("production-archive-sample-retrieval-proof-ndb.md");
    expect(record.checksumVerificationReference).toBe("production-archive-checksum-verification-ndb.sha256");
    expect(record.accessAuditReference).toBe("production-archive-access-audit-ndb.md");
    expect(record.recoverySlaWitnessReference).toBe("production-archive-recovery-sla-witness-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleReadinessArchiveHandoffRecord(
  status: "Blocked" | "Ready for production execution readiness archive handoff review"
): ProductionExecutionReadinessArchiveHandoffRecord {
  return {
    id: "production-execution-readiness-archive-handoff-record-ndb-1",
    provider: "NDB",
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
    handoffOwner: "Production Archive Handoff Owner",
    archiveRepositoryReference: "production-readiness-archive-repository-ndb.md",
    retrievalRunbookReference: "production-readiness-retrieval-runbook-ndb.md",
    archiveAccessReviewReference: "production-readiness-archive-access-review-ndb.md",
    archiveCustodyReceiptReference: "production-readiness-archive-custody-receipt-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
