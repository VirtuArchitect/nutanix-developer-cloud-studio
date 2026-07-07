import { describe, expect, it } from "vitest";
import type { ProductionExecutionFinalTurnoverRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionOperationalClosureRecord,
  ProductionExecutionOperationalClosureRecordError,
} from "./productionExecutionOperationalClosureRecord";
import { createDefaultState } from "./storage";

describe("production execution operational closure record", () => {
  it("requires a production execution final turnover record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionOperationalClosureRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionOperationalClosureRecordError
    );
  });

  it("blocks operational closure when final turnover or closure evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionFinalTurnoverRecords = [sampleFinalTurnoverRecord("Blocked")];

    const record = createProductionExecutionOperationalClosureRecord(
      state,
      {
        finalTurnoverRecordId: "production-execution-final-turnover-record-ndb-1",
        closureOwner: "",
        steadyStateOperatingModelReference: "",
        sloReviewProofReference: "",
        supportBacklogHandoffReference: "",
        residualRiskAcceptanceReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      finalTurnoverRecordId: "production-execution-final-turnover-record-ndb-1",
      serviceAcceptanceRecordId: "production-execution-service-acceptance-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final turnover ready", passed: false }),
        expect.objectContaining({ name: "Closure owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks operational closure ready when final turnover and closure evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionFinalTurnoverRecords = [
      sampleFinalTurnoverRecord("Ready for production execution final turnover review"),
    ];

    const record = createProductionExecutionOperationalClosureRecord(
      state,
      { finalTurnoverRecordId: "production-execution-final-turnover-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution operational closure review");
    expect(record.closureOwner).toBe("Production Closure Owner");
    expect(record.steadyStateOperatingModelReference).toBe(
      "production-steady-state-operating-model-ndb.md"
    );
    expect(record.sloReviewProofReference).toBe("production-slo-review-proof-ndb.md");
    expect(record.supportBacklogHandoffReference).toBe("production-support-backlog-handoff-ndb.md");
    expect(record.residualRiskAcceptanceReference).toBe("production-residual-risk-acceptance-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleFinalTurnoverRecord(
  status: "Blocked" | "Ready for production execution final turnover review"
): ProductionExecutionFinalTurnoverRecord {
  return {
    id: "production-execution-final-turnover-record-ndb-1",
    provider: "NDB",
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
    turnoverOwner: "Production Turnover Owner",
    finalServiceCatalogReference: "production-final-service-catalog-ndb.md",
    ownershipTransferProofReference: "production-ownership-transfer-proof-ndb.md",
    executiveClosureNoteReference: "production-executive-closure-note-ndb.md",
    postImplementationReviewScheduleReference:
      "production-post-implementation-review-schedule-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
