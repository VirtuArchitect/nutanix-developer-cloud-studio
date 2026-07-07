import { describe, expect, it } from "vitest";
import type { ProductionExecutionReadinessRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionAuthorizationRecord,
  ProductionExecutionAuthorizationRecordError,
} from "./productionExecutionAuthorizationRecord";
import { createDefaultState } from "./storage";

describe("production execution authorization record", () => {
  it("requires a production execution readiness record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionAuthorizationRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionAuthorizationRecordError
    );
  });

  it("blocks execution authorization when readiness or authorization evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionReadinessRecords = [sampleReadinessRecord("Blocked")];

    const record = createProductionExecutionAuthorizationRecord(
      state,
      {
        executionReadinessRecordId: "production-execution-readiness-record-ndb-1",
        authorizationAuthority: "",
        finalGoNoGoDecision: "Pending",
        rollbackBridgeConfirmationReference: "",
        monitoringBridgeConfirmationReference: "",
        emergencyStopAuthority: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      executionReadinessRecordId: "production-execution-readiness-record-ndb-1",
      operatorAssignmentRecordId: "production-operator-assignment-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution readiness ready", passed: false }),
        expect.objectContaining({ name: "Authorization authority assigned", passed: false }),
        expect.objectContaining({ name: "Final go/no-go approved", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks execution authorization ready when readiness and authorization evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionReadinessRecords = [
      sampleReadinessRecord("Ready for production execution readiness review"),
    ];

    const record = createProductionExecutionAuthorizationRecord(
      state,
      { executionReadinessRecordId: "production-execution-readiness-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution authorization review");
    expect(record.authorizationAuthority).toBe("Production Authorization Authority");
    expect(record.finalGoNoGoDecision).toBe("Approved");
    expect(record.rollbackBridgeConfirmationReference).toBe("production-rollback-bridge-confirmation-ndb.md");
    expect(record.monitoringBridgeConfirmationReference).toBe("production-monitoring-bridge-confirmation-ndb.md");
    expect(record.emergencyStopAuthority).toBe("Emergency Stop Authority");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleReadinessRecord(
  status: "Blocked" | "Ready for production execution readiness review"
): ProductionExecutionReadinessRecord {
  return {
    id: "production-execution-readiness-record-ndb-1",
    provider: "NDB",
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
    executionOwner: "Production Execution Owner",
    preExecutionChecklistReference: "production-pre-execution-checklist-ndb.md",
    rollbackBridgeReference: "production-rollback-bridge-ndb.md",
    monitoringObserver: "Production Monitoring Observer",
    implementationTimerReference: "production-implementation-timer-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
