import { describe, expect, it } from "vitest";
import type { ProductionExecutionServiceAcceptanceRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionFinalTurnoverRecord,
  ProductionExecutionFinalTurnoverRecordError,
} from "./productionExecutionFinalTurnoverRecord";
import { createDefaultState } from "./storage";

describe("production execution final turnover record", () => {
  it("requires a production execution service acceptance record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionFinalTurnoverRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionFinalTurnoverRecordError
    );
  });

  it("blocks final turnover when service acceptance or turnover evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionServiceAcceptanceRecords = [sampleServiceAcceptanceRecord("Blocked")];

    const record = createProductionExecutionFinalTurnoverRecord(
      state,
      {
        serviceAcceptanceRecordId: "production-execution-service-acceptance-record-ndb-1",
        turnoverOwner: "",
        finalServiceCatalogReference: "",
        ownershipTransferProofReference: "",
        executiveClosureNoteReference: "",
        postImplementationReviewScheduleReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      serviceAcceptanceRecordId: "production-execution-service-acceptance-record-ndb-1",
      supportReadinessRecordId: "production-execution-support-readiness-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Service acceptance ready", passed: false }),
        expect.objectContaining({ name: "Turnover owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks final turnover ready when service acceptance and turnover evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionServiceAcceptanceRecords = [
      sampleServiceAcceptanceRecord("Ready for production execution service acceptance review"),
    ];

    const record = createProductionExecutionFinalTurnoverRecord(
      state,
      { serviceAcceptanceRecordId: "production-execution-service-acceptance-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution final turnover review");
    expect(record.turnoverOwner).toBe("Production Turnover Owner");
    expect(record.finalServiceCatalogReference).toBe("production-final-service-catalog-ndb.md");
    expect(record.ownershipTransferProofReference).toBe("production-ownership-transfer-proof-ndb.md");
    expect(record.executiveClosureNoteReference).toBe("production-executive-closure-note-ndb.md");
    expect(record.postImplementationReviewScheduleReference).toBe(
      "production-post-implementation-review-schedule-ndb.md"
    );
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleServiceAcceptanceRecord(
  status: "Blocked" | "Ready for production execution service acceptance review"
): ProductionExecutionServiceAcceptanceRecord {
  return {
    id: "production-execution-service-acceptance-record-ndb-1",
    provider: "NDB",
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
    serviceOwner: "Production Service Owner",
    acceptanceCriteriaReference: "production-acceptance-criteria-ndb.md",
    operationalSloReference: "production-operational-slo-ndb.md",
    supportSignOffReference: "production-support-signoff-ndb.md",
    finalCustomerNotificationReference: "production-final-customer-notification-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
