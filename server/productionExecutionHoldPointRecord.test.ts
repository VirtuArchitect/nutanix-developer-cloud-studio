import { describe, expect, it } from "vitest";
import type { ProductionFinalExecutionPacketRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionHoldPointRecord,
  ProductionExecutionHoldPointRecordError,
} from "./productionExecutionHoldPointRecord";
import { createDefaultState } from "./storage";

describe("production execution hold-point record", () => {
  it("requires a production final execution packet record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionHoldPointRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionHoldPointRecordError
    );
  });

  it("blocks hold-point readiness when packet or checkpoint evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionFinalExecutionPacketRecords = [samplePacketRecord("Blocked")];

    const record = createProductionExecutionHoldPointRecord(
      state,
      {
        finalExecutionPacketRecordId: "production-final-execution-packet-record-ndb-1",
        holdPointOwner: "",
        finalStopGoCheckpointReference: "",
        rollbackTimerCheckpointReference: "",
        monitoringReadinessCheckpointReference: "",
        incidentBridgeCheckpointReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      finalExecutionPacketRecordId: "production-final-execution-packet-record-ndb-1",
      changeTicketLockRecordId: "production-change-ticket-lock-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final execution packet ready", passed: false }),
        expect.objectContaining({ name: "Hold-point owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks hold-point ready when packet and checkpoint evidence are complete", () => {
    const state = createDefaultState();
    state.productionFinalExecutionPacketRecords = [
      samplePacketRecord("Ready for production final execution packet review"),
    ];

    const record = createProductionExecutionHoldPointRecord(
      state,
      { finalExecutionPacketRecordId: "production-final-execution-packet-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution hold-point review");
    expect(record.holdPointOwner).toBe("Production Hold-Point Owner");
    expect(record.finalStopGoCheckpointReference).toBe("production-final-stop-go-checkpoint-ndb.md");
    expect(record.rollbackTimerCheckpointReference).toBe("production-rollback-timer-checkpoint-ndb.md");
    expect(record.monitoringReadinessCheckpointReference).toBe(
      "production-monitoring-readiness-checkpoint-ndb.md"
    );
    expect(record.incidentBridgeCheckpointReference).toBe("production-incident-bridge-checkpoint-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function samplePacketRecord(
  status: "Blocked" | "Ready for production final execution packet review"
): ProductionFinalExecutionPacketRecord {
  return {
    id: "production-final-execution-packet-record-ndb-1",
    provider: "NDB",
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
    finalPacketManifestReference: "production-final-packet-manifest-ndb.md",
    operatorRunSheetReference: "production-operator-run-sheet-ndb.md",
    communicationsProofReference: "production-communications-proof-ndb.md",
    observationWindowReference: "production-observation-window-ndb.md",
    finalRollbackStandbyConfirmation: "production-final-rollback-standby-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
