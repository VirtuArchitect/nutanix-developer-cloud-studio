import { describe, expect, it } from "vitest";
import type { ProductionExecutionHoldPointRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionOutcomeAuthorizationRecord,
  ProductionExecutionOutcomeAuthorizationRecordError,
} from "./productionExecutionOutcomeAuthorizationRecord";
import { createDefaultState } from "./storage";

describe("production execution outcome authorization record", () => {
  it("requires a production execution hold-point record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionOutcomeAuthorizationRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionOutcomeAuthorizationRecordError
    );
  });

  it("blocks outcome authorization when hold-point or rule evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionHoldPointRecords = [sampleHoldPointRecord("Blocked")];

    const record = createProductionExecutionOutcomeAuthorizationRecord(
      state,
      {
        executionHoldPointRecordId: "production-execution-hold-point-record-ndb-1",
        outcomeAuthority: "",
        expectedResultEnvelopeReference: "",
        rollbackDecisionRuleReference: "",
        incidentDeclarationRuleReference: "",
        evidenceCaptureRuleReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      executionHoldPointRecordId: "production-execution-hold-point-record-ndb-1",
      finalExecutionPacketRecordId: "production-final-execution-packet-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution hold-point ready", passed: false }),
        expect.objectContaining({ name: "Outcome authority assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks outcome authorization ready when hold-point and rule evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionHoldPointRecords = [
      sampleHoldPointRecord("Ready for production execution hold-point review"),
    ];

    const record = createProductionExecutionOutcomeAuthorizationRecord(
      state,
      { executionHoldPointRecordId: "production-execution-hold-point-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution outcome authorization review");
    expect(record.outcomeAuthority).toBe("Production Outcome Authority");
    expect(record.expectedResultEnvelopeReference).toBe("production-expected-result-envelope-ndb.md");
    expect(record.rollbackDecisionRuleReference).toBe("production-rollback-decision-rule-ndb.md");
    expect(record.incidentDeclarationRuleReference).toBe("production-incident-declaration-rule-ndb.md");
    expect(record.evidenceCaptureRuleReference).toBe("production-evidence-capture-rule-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleHoldPointRecord(
  status: "Blocked" | "Ready for production execution hold-point review"
): ProductionExecutionHoldPointRecord {
  return {
    id: "production-execution-hold-point-record-ndb-1",
    provider: "NDB",
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
    holdPointOwner: "Production Hold-Point Owner",
    finalStopGoCheckpointReference: "production-final-stop-go-checkpoint-ndb.md",
    rollbackTimerCheckpointReference: "production-rollback-timer-checkpoint-ndb.md",
    monitoringReadinessCheckpointReference: "production-monitoring-readiness-checkpoint-ndb.md",
    incidentBridgeCheckpointReference: "production-incident-bridge-checkpoint-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
