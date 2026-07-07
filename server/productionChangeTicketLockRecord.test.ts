import { describe, expect, it } from "vitest";
import type { ProductionExecutionAuthorizationRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionChangeTicketLockRecord,
  ProductionChangeTicketLockRecordError,
} from "./productionChangeTicketLockRecord";
import { createDefaultState } from "./storage";

describe("production change ticket lock record", () => {
  it("requires a production execution authorization record", () => {
    const state = createDefaultState();

    expect(() => createProductionChangeTicketLockRecord(state, {}, "platform.admin")).toThrow(
      ProductionChangeTicketLockRecordError
    );
  });

  it("blocks change ticket lock readiness when authorization or lock evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionAuthorizationRecords = [sampleAuthorizationRecord("Blocked")];

    const record = createProductionChangeTicketLockRecord(
      state,
      {
        executionAuthorizationRecordId: "production-execution-authorization-record-ndb-1",
        changeTicketLockReference: "",
        releaseWindowLockReference: "",
        approverRosterLockReference: "",
        rollbackBridgeLockReference: "",
        monitoringBridgeLockReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      executionAuthorizationRecordId: "production-execution-authorization-record-ndb-1",
      executionReadinessRecordId: "production-execution-readiness-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution authorization ready", passed: false }),
        expect.objectContaining({ name: "Change ticket locked", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks change ticket lock ready when authorization and lock evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionAuthorizationRecords = [
      sampleAuthorizationRecord("Ready for production execution authorization review"),
    ];

    const record = createProductionChangeTicketLockRecord(
      state,
      { executionAuthorizationRecordId: "production-execution-authorization-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production change ticket lock review");
    expect(record.changeTicketLockReference).toBe("production-change-ticket-lock-ndb.md");
    expect(record.releaseWindowLockReference).toBe("production-release-window-lock-ndb.md");
    expect(record.approverRosterLockReference).toBe("production-approver-roster-lock-ndb.md");
    expect(record.rollbackBridgeLockReference).toBe("production-rollback-bridge-lock-ndb.md");
    expect(record.monitoringBridgeLockReference).toBe("production-monitoring-bridge-lock-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleAuthorizationRecord(
  status: "Blocked" | "Ready for production execution authorization review"
): ProductionExecutionAuthorizationRecord {
  return {
    id: "production-execution-authorization-record-ndb-1",
    provider: "NDB",
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
    authorizationAuthority: "Production Authorization Authority",
    finalGoNoGoDecision: "Approved",
    rollbackBridgeConfirmationReference: "production-rollback-bridge-confirmation-ndb.md",
    monitoringBridgeConfirmationReference: "production-monitoring-bridge-confirmation-ndb.md",
    emergencyStopAuthority: "Emergency Stop Authority",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
