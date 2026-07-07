import { describe, expect, it } from "vitest";
import type { ProductionExecutionClosureAuthorizationRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionClosurePacketRecord,
  ProductionExecutionClosurePacketRecordError,
} from "./productionExecutionClosurePacketRecord";
import { createDefaultState } from "./storage";

describe("production execution closure packet record", () => {
  it("requires a production execution closure authorization record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionClosurePacketRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionClosurePacketRecordError
    );
  });

  it("blocks closure packet readiness when closure authorization or packet evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionClosureAuthorizationRecords = [sampleClosureAuthorizationRecord("Blocked")];

    const record = createProductionExecutionClosurePacketRecord(
      state,
      {
        closureAuthorizationRecordId: "production-execution-closure-authorization-record-ndb-1",
        closurePacketManifestReference: "",
        evidenceBundleReference: "",
        auditExportReference: "",
        stakeholderNotificationProofReference: "",
        retentionHandoffConfirmationReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      closureAuthorizationRecordId: "production-execution-closure-authorization-record-ndb-1",
      outcomeAuthorizationRecordId: "production-execution-outcome-authorization-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Closure authorization ready", passed: false }),
        expect.objectContaining({ name: "Closure packet manifest linked", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks closure packet ready when closure authorization and packet evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionClosureAuthorizationRecords = [
      sampleClosureAuthorizationRecord("Ready for production execution closure authorization review"),
    ];

    const record = createProductionExecutionClosurePacketRecord(
      state,
      { closureAuthorizationRecordId: "production-execution-closure-authorization-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution closure packet review");
    expect(record.closurePacketManifestReference).toBe("production-closure-packet-manifest-ndb.md");
    expect(record.evidenceBundleReference).toBe("production-evidence-bundle-ndb.zip");
    expect(record.auditExportReference).toBe("production-audit-export-ndb.jsonl");
    expect(record.stakeholderNotificationProofReference).toBe(
      "production-stakeholder-notification-proof-ndb.md"
    );
    expect(record.retentionHandoffConfirmationReference).toBe(
      "production-retention-handoff-confirmation-ndb.md"
    );
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleClosureAuthorizationRecord(
  status: "Blocked" | "Ready for production execution closure authorization review"
): ProductionExecutionClosureAuthorizationRecord {
  return {
    id: "production-execution-closure-authorization-record-ndb-1",
    provider: "NDB",
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
    closureAuthority: "Production Closure Authority",
    successCriteriaReference: "production-success-criteria-ndb.md",
    rollbackClosureCriteriaReference: "production-rollback-closure-criteria-ndb.md",
    incidentClosureCriteriaReference: "production-incident-closure-criteria-ndb.md",
    auditCaptureConfirmationReference: "production-audit-capture-confirmation-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
