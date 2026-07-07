import { describe, expect, it } from "vitest";
import type { ProductionImplementationHoldRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionOperatorAssignmentRecord,
  ProductionOperatorAssignmentRecordError,
} from "./productionOperatorAssignmentRecord";
import { createDefaultState } from "./storage";

describe("production operator assignment record", () => {
  it("requires a production implementation hold record", () => {
    const state = createDefaultState();

    expect(() => createProductionOperatorAssignmentRecord(state, {}, "platform.admin")).toThrow(
      ProductionOperatorAssignmentRecordError
    );
  });

  it("blocks assignment readiness when hold or operator evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionImplementationHoldRecords = [sampleHoldRecord("Blocked")];

    const record = createProductionOperatorAssignmentRecord(
      state,
      {
        implementationHoldRecordId: "production-implementation-hold-record-ndb-1",
        primaryOperator: "",
        secondaryOperator: "",
        executionChannelReference: "",
        rollbackOperator: "",
        privilegedAccessConfirmationReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      implementationHoldRecordId: "production-implementation-hold-record-ndb-1",
      cabDecisionRecordId: "production-cab-decision-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Implementation hold ready", passed: false }),
        expect.objectContaining({ name: "Primary operator assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
  });

  it("marks assignment ready when hold and operator evidence are complete", () => {
    const state = createDefaultState();
    state.productionImplementationHoldRecords = [
      sampleHoldRecord("Ready for production implementation hold review"),
    ];

    const record = createProductionOperatorAssignmentRecord(
      state,
      { implementationHoldRecordId: "production-implementation-hold-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production operator assignment review");
    expect(record.primaryOperator).toBe("Primary Production Operator");
    expect(record.secondaryOperator).toBe("Secondary Production Operator");
    expect(record.executionChannelReference).toBe("production-execution-channel-ndb.md");
    expect(record.rollbackOperator).toBe("Rollback Production Operator");
    expect(record.privilegedAccessConfirmationReference).toBe("privileged-access-confirmation-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleHoldRecord(
  status: "Blocked" | "Ready for production implementation hold review"
): ProductionImplementationHoldRecord {
  return {
    id: "production-implementation-hold-record-ndb-1",
    provider: "NDB",
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
    implementationOwner: "Production Implementation Owner",
    holdWindowReference: "production-implementation-hold-window-ndb.md",
    conditionAcceptanceReference: "cab-condition-acceptance-ndb.md",
    rollbackImplementationOwner: "Rollback Implementation Owner",
    releaseFreezeAcknowledgmentReference: "release-freeze-acknowledgment-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
