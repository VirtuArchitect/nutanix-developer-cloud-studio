import { describe, expect, it } from "vitest";
import type { ProductionAdapterAuthorizationPacket } from "../src/data/cloudStudioDomain";
import {
  createProductionChangeFreezeRecord,
  ProductionChangeFreezeRecordError,
} from "./productionChangeFreezeRecord";
import { createDefaultState } from "./storage";

describe("production change freeze record", () => {
  it("requires a production adapter authorization packet", () => {
    const state = createDefaultState();

    expect(() => createProductionChangeFreezeRecord(state, {}, "platform.admin")).toThrow(
      ProductionChangeFreezeRecordError
    );
  });

  it("blocks freeze readiness when authorization or freeze evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionAdapterAuthorizationPackets = [sampleAuthorizationPacket("Blocked")];

    const record = createProductionChangeFreezeRecord(
      state,
      {
        authorizationPacketId: "production-adapter-authorization-packet-ndb-1",
        freezeOwner: "",
        freezeWindowReference: "",
        stakeholderNotificationReference: "",
        rollbackStandbyReference: "",
        noChangeExceptionPlanReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      authorizationPacketId: "production-adapter-authorization-packet-ndb-1",
      promotionDossierId: "adapter-promotion-readiness-dossier-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Authorization packet ready", passed: false }),
        expect.objectContaining({ name: "Freeze owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
  });

  it("marks freeze ready when production freeze evidence is complete", () => {
    const state = createDefaultState();
    state.productionAdapterAuthorizationPackets = [
      sampleAuthorizationPacket("Ready for production adapter authorization review"),
    ];

    const record = createProductionChangeFreezeRecord(
      state,
      { authorizationPacketId: "production-adapter-authorization-packet-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production change freeze review");
    expect(record.freezeOwner).toBe("Production Change Manager");
    expect(record.freezeWindowReference).toBe("production-change-freeze-window-ndb.md");
    expect(record.stakeholderNotificationReference).toBe("stakeholder-notification-ndb.md");
    expect(record.rollbackStandbyReference).toBe("rollback-standby-roster-ndb.md");
    expect(record.noChangeExceptionPlanReference).toBe("no-change-exception-plan-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleAuthorizationPacket(
  status: "Blocked" | "Ready for production adapter authorization review"
): ProductionAdapterAuthorizationPacket {
  return {
    id: "production-adapter-authorization-packet-ndb-1",
    provider: "NDB",
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
    productionApprover: "Production Change Authority",
    changeTicketReference: "change-ticket-ndb.md",
    releaseWindowReference: "production-release-window-ndb.md",
    emergencyRollbackAuthorization: "emergency-rollback-authorization-ndb.md",
    complianceAcceptanceReference: "compliance-acceptance-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
