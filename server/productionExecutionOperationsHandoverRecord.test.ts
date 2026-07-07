import { describe, expect, it } from "vitest";
import type { ProductionExecutionCompletionDossierRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionOperationsHandoverRecord,
  ProductionExecutionOperationsHandoverRecordError,
} from "./productionExecutionOperationsHandoverRecord";
import { createDefaultState } from "./storage";

describe("production execution operations handover record", () => {
  it("requires a production execution completion dossier record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionOperationsHandoverRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionOperationsHandoverRecordError
    );
  });

  it("blocks operations handover readiness when completion dossier or handover evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionCompletionDossierRecords = [sampleCompletionDossierRecord("Blocked")];

    const record = createProductionExecutionOperationsHandoverRecord(
      state,
      {
        completionDossierRecordId: "production-execution-completion-dossier-record-ndb-1",
        operationsOwner: "",
        supportModelReference: "",
        monitoringHandoverProofReference: "",
        escalationRouteReference: "",
        serviceDeskAcceptanceReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      completionDossierRecordId: "production-execution-completion-dossier-record-ndb-1",
      finalArchiveCertificationRecordId:
        "production-execution-final-archive-certification-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Completion dossier ready", passed: false }),
        expect.objectContaining({ name: "Operations owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks operations handover ready when completion dossier and evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionCompletionDossierRecords = [
      sampleCompletionDossierRecord("Ready for production execution completion dossier review"),
    ];

    const record = createProductionExecutionOperationsHandoverRecord(
      state,
      { completionDossierRecordId: "production-execution-completion-dossier-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution operations handover review");
    expect(record.operationsOwner).toBe("Production Operations Owner");
    expect(record.supportModelReference).toBe("production-support-model-ndb.md");
    expect(record.monitoringHandoverProofReference).toBe("production-monitoring-handover-ndb.md");
    expect(record.escalationRouteReference).toBe("production-escalation-route-ndb.md");
    expect(record.serviceDeskAcceptanceReference).toBe("production-service-desk-acceptance-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleCompletionDossierRecord(
  status: "Blocked" | "Ready for production execution completion dossier review"
): ProductionExecutionCompletionDossierRecord {
  return {
    id: "production-execution-completion-dossier-record-ndb-1",
    provider: "NDB",
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
    dossierOwner: "Production Completion Dossier Owner",
    finalEvidenceIndexReference: "production-final-evidence-index-ndb.md",
    auditExportReference: "production-completion-audit-export-ndb.jsonl",
    operationsAcceptanceReference: "production-operations-acceptance-ndb.md",
    complianceClosureProofReference: "production-compliance-closure-proof-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
