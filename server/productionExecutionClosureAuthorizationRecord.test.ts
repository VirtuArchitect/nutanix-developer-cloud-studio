import { describe, expect, it } from "vitest";
import type { ProductionExecutionOutcomeAuthorizationRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionClosureAuthorizationRecord,
  ProductionExecutionClosureAuthorizationRecordError,
} from "./productionExecutionClosureAuthorizationRecord";
import { createDefaultState } from "./storage";

describe("production execution closure authorization record", () => {
  it("requires a production execution outcome authorization record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionClosureAuthorizationRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionClosureAuthorizationRecordError
    );
  });

  it("blocks closure authorization when outcome authorization or closure evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionOutcomeAuthorizationRecords = [sampleOutcomeAuthorizationRecord("Blocked")];

    const record = createProductionExecutionClosureAuthorizationRecord(
      state,
      {
        outcomeAuthorizationRecordId: "production-execution-outcome-authorization-record-ndb-1",
        closureAuthority: "",
        successCriteriaReference: "",
        rollbackClosureCriteriaReference: "",
        incidentClosureCriteriaReference: "",
        auditCaptureConfirmationReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      outcomeAuthorizationRecordId: "production-execution-outcome-authorization-record-ndb-1",
      executionHoldPointRecordId: "production-execution-hold-point-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Outcome authorization ready", passed: false }),
        expect.objectContaining({ name: "Closure authority assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks closure authorization ready when outcome authorization and closure evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionOutcomeAuthorizationRecords = [
      sampleOutcomeAuthorizationRecord("Ready for production execution outcome authorization review"),
    ];

    const record = createProductionExecutionClosureAuthorizationRecord(
      state,
      { outcomeAuthorizationRecordId: "production-execution-outcome-authorization-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution closure authorization review");
    expect(record.closureAuthority).toBe("Production Closure Authority");
    expect(record.successCriteriaReference).toBe("production-success-criteria-ndb.md");
    expect(record.rollbackClosureCriteriaReference).toBe("production-rollback-closure-criteria-ndb.md");
    expect(record.incidentClosureCriteriaReference).toBe("production-incident-closure-criteria-ndb.md");
    expect(record.auditCaptureConfirmationReference).toBe(
      "production-audit-capture-confirmation-ndb.md"
    );
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleOutcomeAuthorizationRecord(
  status: "Blocked" | "Ready for production execution outcome authorization review"
): ProductionExecutionOutcomeAuthorizationRecord {
  return {
    id: "production-execution-outcome-authorization-record-ndb-1",
    provider: "NDB",
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
    outcomeAuthority: "Production Outcome Authority",
    expectedResultEnvelopeReference: "production-expected-result-envelope-ndb.md",
    rollbackDecisionRuleReference: "production-rollback-decision-rule-ndb.md",
    incidentDeclarationRuleReference: "production-incident-declaration-rule-ndb.md",
    evidenceCaptureRuleReference: "production-evidence-capture-rule-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
