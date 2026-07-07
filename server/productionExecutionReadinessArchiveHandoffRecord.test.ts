import { describe, expect, it } from "vitest";
import type { ProductionExecutionFinalAcceptanceArchiveRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionReadinessArchiveHandoffRecord,
  ProductionExecutionReadinessArchiveHandoffRecordError,
} from "./productionExecutionReadinessArchiveHandoffRecord";
import { createDefaultState } from "./storage";

describe("production execution readiness archive handoff record", () => {
  it("requires a production execution final acceptance archive record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionReadinessArchiveHandoffRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionReadinessArchiveHandoffRecordError);
  });

  it("blocks readiness archive handoff when final acceptance archive or handoff evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionFinalAcceptanceArchiveRecords = [sampleFinalAcceptanceArchiveRecord("Blocked")];

    const record = createProductionExecutionReadinessArchiveHandoffRecord(
      state,
      {
        finalAcceptanceArchiveRecordId: "production-execution-final-acceptance-archive-record-ndb-1",
        handoffOwner: "",
        archiveRepositoryReference: "",
        retrievalRunbookReference: "",
        archiveAccessReviewReference: "",
        archiveCustodyReceiptReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      finalAcceptanceArchiveRecordId: "production-execution-final-acceptance-archive-record-ndb-1",
      improvementClosureRecordId: "production-execution-improvement-closure-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final acceptance archive ready", passed: false }),
        expect.objectContaining({ name: "Handoff owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks readiness archive handoff ready when final acceptance archive and handoff evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionFinalAcceptanceArchiveRecords = [
      sampleFinalAcceptanceArchiveRecord("Ready for production execution final acceptance archive review"),
    ];

    const record = createProductionExecutionReadinessArchiveHandoffRecord(
      state,
      { finalAcceptanceArchiveRecordId: "production-execution-final-acceptance-archive-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution readiness archive handoff review");
    expect(record.handoffOwner).toBe("Production Archive Handoff Owner");
    expect(record.archiveRepositoryReference).toBe("production-readiness-archive-repository-ndb.md");
    expect(record.retrievalRunbookReference).toBe("production-readiness-retrieval-runbook-ndb.md");
    expect(record.archiveAccessReviewReference).toBe("production-readiness-archive-access-review-ndb.md");
    expect(record.archiveCustodyReceiptReference).toBe("production-readiness-archive-custody-receipt-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleFinalAcceptanceArchiveRecord(
  status: "Blocked" | "Ready for production execution final acceptance archive review"
): ProductionExecutionFinalAcceptanceArchiveRecord {
  return {
    id: "production-execution-final-acceptance-archive-record-ndb-1",
    provider: "NDB",
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
    archiveOwner: "Production Archive Owner",
    acceptanceArchiveIndexReference: "production-acceptance-archive-index-ndb.md",
    finalEvidenceChecksumReference: "production-final-evidence-checksum-ndb.sha256",
    stakeholderReceiptProofReference: "production-stakeholder-receipt-proof-ndb.md",
    retrievalOwner: "Production Retrieval Owner",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
