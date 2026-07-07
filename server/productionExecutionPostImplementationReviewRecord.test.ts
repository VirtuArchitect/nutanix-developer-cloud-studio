import { describe, expect, it } from "vitest";
import type { ProductionExecutionOperationalClosureRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionPostImplementationReviewRecord,
  ProductionExecutionPostImplementationReviewRecordError,
} from "./productionExecutionPostImplementationReviewRecord";
import { createDefaultState } from "./storage";

describe("production execution post-implementation review record", () => {
  it("requires a production execution operational closure record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionPostImplementationReviewRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionPostImplementationReviewRecordError);
  });

  it("blocks post-implementation review when operational closure or review evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionOperationalClosureRecords = [sampleOperationalClosureRecord("Blocked")];

    const record = createProductionExecutionPostImplementationReviewRecord(
      state,
      {
        operationalClosureRecordId: "production-execution-operational-closure-record-ndb-1",
        reviewOwner: "",
        pirMinutesReference: "",
        incidentReviewProofReference: "",
        costVarianceReviewReference: "",
        improvementBacklogReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      operationalClosureRecordId: "production-execution-operational-closure-record-ndb-1",
      finalTurnoverRecordId: "production-execution-final-turnover-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Operational closure ready", passed: false }),
        expect.objectContaining({ name: "Review owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks post-implementation review ready when operational closure and review evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionOperationalClosureRecords = [
      sampleOperationalClosureRecord("Ready for production execution operational closure review"),
    ];

    const record = createProductionExecutionPostImplementationReviewRecord(
      state,
      { operationalClosureRecordId: "production-execution-operational-closure-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution post-implementation review");
    expect(record.reviewOwner).toBe("Production PIR Owner");
    expect(record.pirMinutesReference).toBe("production-pir-minutes-ndb.md");
    expect(record.incidentReviewProofReference).toBe("production-incident-review-proof-ndb.md");
    expect(record.costVarianceReviewReference).toBe("production-cost-variance-review-ndb.md");
    expect(record.improvementBacklogReference).toBe("production-improvement-backlog-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleOperationalClosureRecord(
  status: "Blocked" | "Ready for production execution operational closure review"
): ProductionExecutionOperationalClosureRecord {
  return {
    id: "production-execution-operational-closure-record-ndb-1",
    provider: "NDB",
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
    closureOwner: "Production Closure Owner",
    steadyStateOperatingModelReference: "production-steady-state-operating-model-ndb.md",
    sloReviewProofReference: "production-slo-review-proof-ndb.md",
    supportBacklogHandoffReference: "production-support-backlog-handoff-ndb.md",
    residualRiskAcceptanceReference: "production-residual-risk-acceptance-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
