import { describe, expect, it } from "vitest";
import type { ProductionCabHandoffPacket } from "../src/data/cloudStudioDomain";
import {
  createProductionCabDecisionRecord,
  ProductionCabDecisionRecordError,
} from "./productionCabDecisionRecord";
import { createDefaultState } from "./storage";

describe("production CAB decision record", () => {
  it("requires a production CAB handoff packet", () => {
    const state = createDefaultState();

    expect(() => createProductionCabDecisionRecord(state, {}, "platform.admin")).toThrow(
      ProductionCabDecisionRecordError
    );
  });

  it("blocks CAB decision readiness when handoff or decision evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionCabHandoffPackets = [sampleHandoffPacket("Blocked")];

    const record = createProductionCabDecisionRecord(
      state,
      {
        cabHandoffPacketId: "production-cab-handoff-packet-ndb-1",
        cabDecision: "Deferred",
        decisionAuthority: "",
        conditionListReference: "",
        rollbackApprovalReference: "",
        decisionMinutesReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      cabHandoffPacketId: "production-cab-handoff-packet-ndb-1",
      freezeRecordId: "production-change-freeze-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "CAB handoff ready", passed: false }),
        expect.objectContaining({ name: "CAB decision recorded", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
  });

  it("marks CAB decision ready when handoff and decision evidence are complete", () => {
    const state = createDefaultState();
    state.productionCabHandoffPackets = [sampleHandoffPacket("Ready for production CAB handoff review")];

    const record = createProductionCabDecisionRecord(
      state,
      { cabHandoffPacketId: "production-cab-handoff-packet-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production CAB decision review");
    expect(record.cabDecision).toBe("Approved with conditions");
    expect(record.decisionAuthority).toBe("Production CAB");
    expect(record.conditionListReference).toBe("cab-condition-list-ndb.md");
    expect(record.rollbackApprovalReference).toBe("cab-rollback-approval-ndb.md");
    expect(record.decisionMinutesReference).toBe("cab-decision-minutes-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleHandoffPacket(
  status: "Blocked" | "Ready for production CAB handoff review"
): ProductionCabHandoffPacket {
  return {
    id: "production-cab-handoff-packet-ndb-1",
    provider: "NDB",
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
    cabOwner: "Production CAB Chair",
    cabAgendaReference: "cab-agenda-ndb.md",
    riskAcceptanceReference: "risk-acceptance-ndb.md",
    rollbackRepresentationReference: "rollback-representation-ndb.md",
    finalGoNoGoAgendaReference: "final-go-no-go-agenda-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
