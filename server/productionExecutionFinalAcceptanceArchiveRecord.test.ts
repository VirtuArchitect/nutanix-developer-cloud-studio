import { describe, expect, it } from "vitest";
import type { ProductionExecutionImprovementClosureRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionFinalAcceptanceArchiveRecord,
  ProductionExecutionFinalAcceptanceArchiveRecordError,
} from "./productionExecutionFinalAcceptanceArchiveRecord";
import { createDefaultState } from "./storage";

describe("production execution final acceptance archive record", () => {
  it("requires a production execution improvement closure record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionFinalAcceptanceArchiveRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionFinalAcceptanceArchiveRecordError);
  });

  it("blocks final acceptance archive when improvement closure or archive evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionImprovementClosureRecords = [sampleImprovementClosureRecord("Blocked")];

    const record = createProductionExecutionFinalAcceptanceArchiveRecord(
      state,
      {
        improvementClosureRecordId: "production-execution-improvement-closure-record-ndb-1",
        archiveOwner: "",
        acceptanceArchiveIndexReference: "",
        finalEvidenceChecksumReference: "",
        stakeholderReceiptProofReference: "",
        retrievalOwner: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      improvementClosureRecordId: "production-execution-improvement-closure-record-ndb-1",
      postImplementationReviewRecordId: "production-execution-post-implementation-review-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Improvement closure ready", passed: false }),
        expect.objectContaining({ name: "Archive owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks final acceptance archive ready when improvement closure and archive evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionImprovementClosureRecords = [
      sampleImprovementClosureRecord("Ready for production execution improvement closure review"),
    ];

    const record = createProductionExecutionFinalAcceptanceArchiveRecord(
      state,
      { improvementClosureRecordId: "production-execution-improvement-closure-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution final acceptance archive review");
    expect(record.archiveOwner).toBe("Production Archive Owner");
    expect(record.acceptanceArchiveIndexReference).toBe("production-acceptance-archive-index-ndb.md");
    expect(record.finalEvidenceChecksumReference).toBe("production-final-evidence-checksum-ndb.sha256");
    expect(record.stakeholderReceiptProofReference).toBe("production-stakeholder-receipt-proof-ndb.md");
    expect(record.retrievalOwner).toBe("Production Retrieval Owner");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleImprovementClosureRecord(
  status: "Blocked" | "Ready for production execution improvement closure review"
): ProductionExecutionImprovementClosureRecord {
  return {
    id: "production-execution-improvement-closure-record-ndb-1",
    provider: "NDB",
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
    improvementOwner: "Production Improvement Owner",
    actionRegisterReference: "production-improvement-action-register-ndb.md",
    acceptedDeferralsReference: "production-accepted-deferrals-ndb.md",
    lessonsLearnedPublicationReference: "production-lessons-learned-publication-ndb.md",
    nextCycleOwner: "Production Next-Cycle Owner",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
