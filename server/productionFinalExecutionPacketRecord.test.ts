import { describe, expect, it } from "vitest";
import type { ProductionChangeTicketLockRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionFinalExecutionPacketRecord,
  ProductionFinalExecutionPacketRecordError,
} from "./productionFinalExecutionPacketRecord";
import { createDefaultState } from "./storage";

describe("production final execution packet record", () => {
  it("requires a production change ticket lock record", () => {
    const state = createDefaultState();

    expect(() => createProductionFinalExecutionPacketRecord(state, {}, "platform.admin")).toThrow(
      ProductionFinalExecutionPacketRecordError
    );
  });

  it("blocks final packet readiness when lock or packet evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionChangeTicketLockRecords = [sampleLockRecord("Blocked")];

    const record = createProductionFinalExecutionPacketRecord(
      state,
      {
        changeTicketLockRecordId: "production-change-ticket-lock-record-ndb-1",
        finalPacketManifestReference: "",
        operatorRunSheetReference: "",
        communicationsProofReference: "",
        observationWindowReference: "",
        finalRollbackStandbyConfirmation: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      changeTicketLockRecordId: "production-change-ticket-lock-record-ndb-1",
      executionAuthorizationRecordId: "production-execution-authorization-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Change ticket lock ready", passed: false }),
        expect.objectContaining({ name: "Final packet manifest linked", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks final packet ready when lock and packet evidence are complete", () => {
    const state = createDefaultState();
    state.productionChangeTicketLockRecords = [
      sampleLockRecord("Ready for production change ticket lock review"),
    ];

    const record = createProductionFinalExecutionPacketRecord(
      state,
      { changeTicketLockRecordId: "production-change-ticket-lock-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production final execution packet review");
    expect(record.finalPacketManifestReference).toBe("production-final-packet-manifest-ndb.md");
    expect(record.operatorRunSheetReference).toBe("production-operator-run-sheet-ndb.md");
    expect(record.communicationsProofReference).toBe("production-communications-proof-ndb.md");
    expect(record.observationWindowReference).toBe("production-observation-window-ndb.md");
    expect(record.finalRollbackStandbyConfirmation).toBe("production-final-rollback-standby-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleLockRecord(
  status: "Blocked" | "Ready for production change ticket lock review"
): ProductionChangeTicketLockRecord {
  return {
    id: "production-change-ticket-lock-record-ndb-1",
    provider: "NDB",
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
    changeTicketLockReference: "production-change-ticket-lock-ndb.md",
    releaseWindowLockReference: "production-release-window-lock-ndb.md",
    approverRosterLockReference: "production-approver-roster-lock-ndb.md",
    rollbackBridgeLockReference: "production-rollback-bridge-lock-ndb.md",
    monitoringBridgeLockReference: "production-monitoring-bridge-lock-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
