import { describe, expect, it } from "vitest";
import type { ProductionExecutionPostImplementationReviewRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionImprovementClosureRecord,
  ProductionExecutionImprovementClosureRecordError,
} from "./productionExecutionImprovementClosureRecord";
import { createDefaultState } from "./storage";

describe("production execution improvement closure record", () => {
  it("requires a production execution post-implementation review record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionImprovementClosureRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionImprovementClosureRecordError);
  });

  it("blocks improvement closure when post-implementation review or improvement evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionPostImplementationReviewRecords = [samplePostImplementationReviewRecord("Blocked")];

    const record = createProductionExecutionImprovementClosureRecord(
      state,
      {
        postImplementationReviewRecordId: "production-execution-post-implementation-review-record-ndb-1",
        improvementOwner: "",
        actionRegisterReference: "",
        acceptedDeferralsReference: "",
        lessonsLearnedPublicationReference: "",
        nextCycleOwner: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      postImplementationReviewRecordId: "production-execution-post-implementation-review-record-ndb-1",
      operationalClosureRecordId: "production-execution-operational-closure-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Post-implementation review ready", passed: false }),
        expect.objectContaining({ name: "Improvement owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks improvement closure ready when post-implementation review and improvement evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionPostImplementationReviewRecords = [
      samplePostImplementationReviewRecord("Ready for production execution post-implementation review"),
    ];

    const record = createProductionExecutionImprovementClosureRecord(
      state,
      { postImplementationReviewRecordId: "production-execution-post-implementation-review-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution improvement closure review");
    expect(record.improvementOwner).toBe("Production Improvement Owner");
    expect(record.actionRegisterReference).toBe("production-improvement-action-register-ndb.md");
    expect(record.acceptedDeferralsReference).toBe("production-accepted-deferrals-ndb.md");
    expect(record.lessonsLearnedPublicationReference).toBe(
      "production-lessons-learned-publication-ndb.md"
    );
    expect(record.nextCycleOwner).toBe("Production Next-Cycle Owner");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function samplePostImplementationReviewRecord(
  status: "Blocked" | "Ready for production execution post-implementation review"
): ProductionExecutionPostImplementationReviewRecord {
  return {
    id: "production-execution-post-implementation-review-record-ndb-1",
    provider: "NDB",
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
    reviewOwner: "Production PIR Owner",
    pirMinutesReference: "production-pir-minutes-ndb.md",
    incidentReviewProofReference: "production-incident-review-proof-ndb.md",
    costVarianceReviewReference: "production-cost-variance-review-ndb.md",
    improvementBacklogReference: "production-improvement-backlog-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
