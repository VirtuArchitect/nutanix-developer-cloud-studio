import { describe, expect, it } from "vitest";
import type { ProductionChangeFreezeRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionCabHandoffPacket,
  ProductionCabHandoffPacketError,
} from "./productionCabHandoffPacket";
import { createDefaultState } from "./storage";

describe("production CAB handoff packet", () => {
  it("requires a production change freeze record", () => {
    const state = createDefaultState();

    expect(() => createProductionCabHandoffPacket(state, {}, "platform.admin")).toThrow(
      ProductionCabHandoffPacketError
    );
  });

  it("blocks CAB handoff readiness when freeze or CAB evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionChangeFreezeRecords = [sampleFreezeRecord("Blocked")];

    const packet = createProductionCabHandoffPacket(
      state,
      {
        freezeRecordId: "production-change-freeze-record-ndb-1",
        cabOwner: "",
        cabAgendaReference: "",
        riskAcceptanceReference: "",
        rollbackRepresentationReference: "",
        finalGoNoGoAgendaReference: "",
      },
      "platform.admin"
    );

    expect(packet).toMatchObject({
      provider: "NDB",
      freezeRecordId: "production-change-freeze-record-ndb-1",
      authorizationPacketId: "production-adapter-authorization-packet-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(packet.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Change freeze ready", passed: false }),
        expect.objectContaining({ name: "CAB owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
  });

  it("marks CAB handoff ready when freeze and CAB evidence are complete", () => {
    const state = createDefaultState();
    state.productionChangeFreezeRecords = [sampleFreezeRecord("Ready for production change freeze review")];

    const packet = createProductionCabHandoffPacket(
      state,
      { freezeRecordId: "production-change-freeze-record-ndb-1" },
      "platform.admin"
    );

    expect(packet.status).toBe("Ready for production CAB handoff review");
    expect(packet.cabOwner).toBe("Production CAB Chair");
    expect(packet.cabAgendaReference).toBe("cab-agenda-ndb.md");
    expect(packet.riskAcceptanceReference).toBe("risk-acceptance-ndb.md");
    expect(packet.rollbackRepresentationReference).toBe("rollback-representation-ndb.md");
    expect(packet.finalGoNoGoAgendaReference).toBe("final-go-no-go-agenda-ndb.md");
    expect(packet.provisioningEnabled).toBe(false);
    expect(packet.killSwitch.enabled).toBe(false);
  });
});

function sampleFreezeRecord(status: "Blocked" | "Ready for production change freeze review"): ProductionChangeFreezeRecord {
  return {
    id: "production-change-freeze-record-ndb-1",
    provider: "NDB",
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
    freezeOwner: "Production Change Manager",
    freezeWindowReference: "production-change-freeze-window-ndb.md",
    stakeholderNotificationReference: "stakeholder-notification-ndb.md",
    rollbackStandbyReference: "rollback-standby-roster-ndb.md",
    noChangeExceptionPlanReference: "no-change-exception-plan-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
