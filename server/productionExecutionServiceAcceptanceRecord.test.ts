import { describe, expect, it } from "vitest";
import type { ProductionExecutionSupportReadinessRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionServiceAcceptanceRecord,
  ProductionExecutionServiceAcceptanceRecordError,
} from "./productionExecutionServiceAcceptanceRecord";
import { createDefaultState } from "./storage";

describe("production execution service acceptance record", () => {
  it("requires a production execution support readiness record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionServiceAcceptanceRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionServiceAcceptanceRecordError
    );
  });

  it("blocks service acceptance when support readiness or acceptance evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionSupportReadinessRecords = [sampleSupportReadinessRecord("Blocked")];

    const record = createProductionExecutionServiceAcceptanceRecord(
      state,
      {
        supportReadinessRecordId: "production-execution-support-readiness-record-ndb-1",
        serviceOwner: "",
        acceptanceCriteriaReference: "",
        operationalSloReference: "",
        supportSignOffReference: "",
        finalCustomerNotificationReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      supportReadinessRecordId: "production-execution-support-readiness-record-ndb-1",
      operationsHandoverRecordId: "production-execution-operations-handover-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Support readiness ready", passed: false }),
        expect.objectContaining({ name: "Service owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks service acceptance ready when support readiness and evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionSupportReadinessRecords = [
      sampleSupportReadinessRecord("Ready for production execution support readiness review"),
    ];

    const record = createProductionExecutionServiceAcceptanceRecord(
      state,
      { supportReadinessRecordId: "production-execution-support-readiness-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution service acceptance review");
    expect(record.serviceOwner).toBe("Production Service Owner");
    expect(record.acceptanceCriteriaReference).toBe("production-acceptance-criteria-ndb.md");
    expect(record.operationalSloReference).toBe("production-operational-slo-ndb.md");
    expect(record.supportSignOffReference).toBe("production-support-signoff-ndb.md");
    expect(record.finalCustomerNotificationReference).toBe("production-final-customer-notification-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleSupportReadinessRecord(
  status: "Blocked" | "Ready for production execution support readiness review"
): ProductionExecutionSupportReadinessRecord {
  return {
    id: "production-execution-support-readiness-record-ndb-1",
    provider: "NDB",
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
    supportOwner: "Production Support Owner",
    runbookAcceptanceReference: "production-runbook-acceptance-ndb.md",
    alertRoutingProofReference: "production-alert-routing-proof-ndb.md",
    incidentProcessReference: "production-incident-process-ndb.md",
    knowledgeBasePublicationReference: "production-knowledge-base-publication-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
