import { describe, expect, it } from "vitest";
import type { ProductionExecutionClosurePacketRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionArchivalHandoffRecord,
  ProductionExecutionArchivalHandoffRecordError,
} from "./productionExecutionArchivalHandoffRecord";
import { createDefaultState } from "./storage";

describe("production execution archival handoff record", () => {
  it("requires a production execution closure packet record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionArchivalHandoffRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionArchivalHandoffRecordError
    );
  });

  it("blocks archival handoff readiness when closure packet or archive evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionClosurePacketRecords = [sampleClosurePacketRecord("Blocked")];

    const record = createProductionExecutionArchivalHandoffRecord(
      state,
      {
        closurePacketRecordId: "production-execution-closure-packet-record-ndb-1",
        archiveOwner: "",
        retentionPolicyReference: "",
        immutableStorageProofReference: "",
        auditIndexReference: "",
        retrievalTestReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      closurePacketRecordId: "production-execution-closure-packet-record-ndb-1",
      closureAuthorizationRecordId: "production-execution-closure-authorization-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Closure packet ready", passed: false }),
        expect.objectContaining({ name: "Archive owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks archival handoff ready when closure packet and archive evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionClosurePacketRecords = [
      sampleClosurePacketRecord("Ready for production execution closure packet review"),
    ];

    const record = createProductionExecutionArchivalHandoffRecord(
      state,
      { closurePacketRecordId: "production-execution-closure-packet-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution archival handoff review");
    expect(record.archiveOwner).toBe("Production Archive Owner");
    expect(record.retentionPolicyReference).toBe("production-retention-policy-ndb.md");
    expect(record.immutableStorageProofReference).toBe("production-immutable-storage-proof-ndb.md");
    expect(record.auditIndexReference).toBe("production-audit-index-ndb.json");
    expect(record.retrievalTestReference).toBe("production-retrieval-test-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleClosurePacketRecord(
  status: "Blocked" | "Ready for production execution closure packet review"
): ProductionExecutionClosurePacketRecord {
  return {
    id: "production-execution-closure-packet-record-ndb-1",
    provider: "NDB",
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
    closurePacketManifestReference: "production-closure-packet-manifest-ndb.md",
    evidenceBundleReference: "production-evidence-bundle-ndb.zip",
    auditExportReference: "production-audit-export-ndb.jsonl",
    stakeholderNotificationProofReference: "production-stakeholder-notification-proof-ndb.md",
    retentionHandoffConfirmationReference: "production-retention-handoff-confirmation-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
