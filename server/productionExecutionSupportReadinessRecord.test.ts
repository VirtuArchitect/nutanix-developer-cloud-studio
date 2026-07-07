import { describe, expect, it } from "vitest";
import type { ProductionExecutionOperationsHandoverRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionSupportReadinessRecord,
  ProductionExecutionSupportReadinessRecordError,
} from "./productionExecutionSupportReadinessRecord";
import { createDefaultState } from "./storage";

describe("production execution support readiness record", () => {
  it("requires a production execution operations handover record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionSupportReadinessRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionSupportReadinessRecordError
    );
  });

  it("blocks support readiness when operations handover or support evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionOperationsHandoverRecords = [sampleOperationsHandoverRecord("Blocked")];

    const record = createProductionExecutionSupportReadinessRecord(
      state,
      {
        operationsHandoverRecordId: "production-execution-operations-handover-record-ndb-1",
        supportOwner: "",
        runbookAcceptanceReference: "",
        alertRoutingProofReference: "",
        incidentProcessReference: "",
        knowledgeBasePublicationReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      operationsHandoverRecordId: "production-execution-operations-handover-record-ndb-1",
      completionDossierRecordId: "production-execution-completion-dossier-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Operations handover ready", passed: false }),
        expect.objectContaining({ name: "Support owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks support readiness ready when operations handover and evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionOperationsHandoverRecords = [
      sampleOperationsHandoverRecord("Ready for production execution operations handover review"),
    ];

    const record = createProductionExecutionSupportReadinessRecord(
      state,
      { operationsHandoverRecordId: "production-execution-operations-handover-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution support readiness review");
    expect(record.supportOwner).toBe("Production Support Owner");
    expect(record.runbookAcceptanceReference).toBe("production-runbook-acceptance-ndb.md");
    expect(record.alertRoutingProofReference).toBe("production-alert-routing-proof-ndb.md");
    expect(record.incidentProcessReference).toBe("production-incident-process-ndb.md");
    expect(record.knowledgeBasePublicationReference).toBe("production-knowledge-base-publication-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleOperationsHandoverRecord(
  status: "Blocked" | "Ready for production execution operations handover review"
): ProductionExecutionOperationsHandoverRecord {
  return {
    id: "production-execution-operations-handover-record-ndb-1",
    provider: "NDB",
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
    operationsOwner: "Production Operations Owner",
    supportModelReference: "production-support-model-ndb.md",
    monitoringHandoverProofReference: "production-monitoring-handover-ndb.md",
    escalationRouteReference: "production-escalation-route-ndb.md",
    serviceDeskAcceptanceReference: "production-service-desk-acceptance-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
