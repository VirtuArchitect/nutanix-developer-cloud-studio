import { describe, expect, it } from "vitest";
import type { ProductionOperatorAssignmentRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionReadinessRecord,
  ProductionExecutionReadinessRecordError,
} from "./productionExecutionReadinessRecord";
import { createDefaultState } from "./storage";

describe("production execution readiness record", () => {
  it("requires a production operator assignment record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionReadinessRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionReadinessRecordError
    );
  });

  it("blocks execution readiness when assignment or execution evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionOperatorAssignmentRecords = [sampleAssignmentRecord("Blocked")];

    const record = createProductionExecutionReadinessRecord(
      state,
      {
        operatorAssignmentRecordId: "production-operator-assignment-record-ndb-1",
        executionOwner: "",
        preExecutionChecklistReference: "",
        rollbackBridgeReference: "",
        monitoringObserver: "",
        implementationTimerReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      operatorAssignmentRecordId: "production-operator-assignment-record-ndb-1",
      implementationHoldRecordId: "production-implementation-hold-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Operator assignment ready", passed: false }),
        expect.objectContaining({ name: "Execution owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks execution readiness ready when assignment and readiness evidence are complete", () => {
    const state = createDefaultState();
    state.productionOperatorAssignmentRecords = [
      sampleAssignmentRecord("Ready for production operator assignment review"),
    ];

    const record = createProductionExecutionReadinessRecord(
      state,
      { operatorAssignmentRecordId: "production-operator-assignment-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution readiness review");
    expect(record.executionOwner).toBe("Production Execution Owner");
    expect(record.preExecutionChecklistReference).toBe("production-pre-execution-checklist-ndb.md");
    expect(record.rollbackBridgeReference).toBe("production-rollback-bridge-ndb.md");
    expect(record.monitoringObserver).toBe("Production Monitoring Observer");
    expect(record.implementationTimerReference).toBe("production-implementation-timer-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleAssignmentRecord(
  status: "Blocked" | "Ready for production operator assignment review"
): ProductionOperatorAssignmentRecord {
  return {
    id: "production-operator-assignment-record-ndb-1",
    provider: "NDB",
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
    primaryOperator: "Primary Production Operator",
    secondaryOperator: "Secondary Production Operator",
    executionChannelReference: "production-execution-channel-ndb.md",
    rollbackOperator: "Rollback Production Operator",
    privilegedAccessConfirmationReference: "privileged-access-confirmation-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
