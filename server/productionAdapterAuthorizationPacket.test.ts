import { describe, expect, it } from "vitest";
import type { AdapterPromotionReadinessDossier } from "../src/data/cloudStudioDomain";
import {
  createProductionAdapterAuthorizationPacket,
  ProductionAdapterAuthorizationPacketError,
} from "./productionAdapterAuthorizationPacket";
import { createDefaultState } from "./storage";

describe("production adapter authorization packet", () => {
  it("requires an adapter promotion readiness dossier", () => {
    const state = createDefaultState();

    expect(() => createProductionAdapterAuthorizationPacket(state, {}, "platform.admin")).toThrow(
      ProductionAdapterAuthorizationPacketError
    );
  });

  it("blocks packet readiness when promotion or production evidence is incomplete", () => {
    const state = createDefaultState();
    state.adapterPromotionReadinessDossiers = [samplePromotionDossier("Blocked")];

    const packet = createProductionAdapterAuthorizationPacket(
      state,
      {
        promotionDossierId: "adapter-promotion-readiness-dossier-ndb-1",
        productionApprover: "",
        changeTicketReference: "",
        releaseWindowReference: "",
        emergencyRollbackAuthorization: "",
        complianceAcceptanceReference: "",
      },
      "platform.admin"
    );

    expect(packet).toMatchObject({
      provider: "NDB",
      promotionDossierId: "adapter-promotion-readiness-dossier-ndb-1",
      closurePackageId: "switch-closure-retention-package-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(packet.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Promotion dossier ready", passed: false }),
        expect.objectContaining({ name: "Production approver assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not authorize promotion", passed: true }),
      ])
    );
  });

  it("marks packet ready when production authorization evidence is complete", () => {
    const state = createDefaultState();
    state.adapterPromotionReadinessDossiers = [samplePromotionDossier("Ready for adapter promotion review")];

    const packet = createProductionAdapterAuthorizationPacket(
      state,
      { promotionDossierId: "adapter-promotion-readiness-dossier-ndb-1" },
      "platform.admin"
    );

    expect(packet.status).toBe("Ready for production adapter authorization review");
    expect(packet.productionApprover).toBe("Production Change Authority");
    expect(packet.changeTicketReference).toBe("change-ticket-ndb.md");
    expect(packet.releaseWindowReference).toBe("production-release-window-ndb.md");
    expect(packet.emergencyRollbackAuthorization).toBe("emergency-rollback-authorization-ndb.md");
    expect(packet.complianceAcceptanceReference).toBe("compliance-acceptance-ndb.md");
    expect(packet.provisioningEnabled).toBe(false);
    expect(packet.killSwitch.enabled).toBe(false);
  });
});

function samplePromotionDossier(
  status: "Blocked" | "Ready for adapter promotion review"
): AdapterPromotionReadinessDossier {
  return {
    id: "adapter-promotion-readiness-dossier-ndb-1",
    provider: "NDB",
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
    promotionOwner: "Cloud Platform Owner",
    retainedSwitchEvidenceReference: "retained-evidence-manifest-ndb.json",
    monitoringPlanReference: "adapter-promotion-monitoring-ndb.md",
    rollbackDrillConfirmation: "rollback-drill-confirmation-ndb.md",
    securityAcceptanceReference: "security-acceptance-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
