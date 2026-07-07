import { describe, expect, it } from "vitest";
import type { ProductionCabDecisionRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionImplementationHoldRecord,
  ProductionImplementationHoldRecordError,
} from "./productionImplementationHoldRecord";
import { createDefaultState } from "./storage";

describe("production implementation hold record", () => {
  it("requires a production CAB decision record", () => {
    const state = createDefaultState();

    expect(() => createProductionImplementationHoldRecord(state, {}, "platform.admin")).toThrow(
      ProductionImplementationHoldRecordError
    );
  });

  it("blocks hold readiness when decision or hold evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionCabDecisionRecords = [sampleDecisionRecord("Blocked")];

    const record = createProductionImplementationHoldRecord(
      state,
      {
        cabDecisionRecordId: "production-cab-decision-record-ndb-1",
        implementationOwner: "",
        holdWindowReference: "",
        conditionAcceptanceReference: "",
        rollbackImplementationOwner: "",
        releaseFreezeAcknowledgmentReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      cabDecisionRecordId: "production-cab-decision-record-ndb-1",
      cabHandoffPacketId: "production-cab-handoff-packet-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "CAB decision ready", passed: false }),
        expect.objectContaining({ name: "Implementation owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
  });

  it("marks hold ready when decision and hold evidence are complete", () => {
    const state = createDefaultState();
    state.productionCabDecisionRecords = [sampleDecisionRecord("Ready for production CAB decision review")];

    const record = createProductionImplementationHoldRecord(
      state,
      { cabDecisionRecordId: "production-cab-decision-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production implementation hold review");
    expect(record.implementationOwner).toBe("Production Implementation Owner");
    expect(record.holdWindowReference).toBe("production-implementation-hold-window-ndb.md");
    expect(record.conditionAcceptanceReference).toBe("cab-condition-acceptance-ndb.md");
    expect(record.rollbackImplementationOwner).toBe("Rollback Implementation Owner");
    expect(record.releaseFreezeAcknowledgmentReference).toBe("release-freeze-acknowledgment-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleDecisionRecord(
  status: "Blocked" | "Ready for production CAB decision review"
): ProductionCabDecisionRecord {
  return {
    id: "production-cab-decision-record-ndb-1",
    provider: "NDB",
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
    cabDecision: "Approved with conditions",
    decisionAuthority: "Production CAB",
    conditionListReference: "cab-condition-list-ndb.md",
    rollbackApprovalReference: "cab-rollback-approval-ndb.md",
    decisionMinutesReference: "cab-decision-minutes-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
