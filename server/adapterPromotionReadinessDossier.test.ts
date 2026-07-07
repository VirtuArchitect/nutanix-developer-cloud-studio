import { describe, expect, it } from "vitest";
import type { SwitchClosureRetentionPackage } from "../src/data/cloudStudioDomain";
import {
  createAdapterPromotionReadinessDossier,
  AdapterPromotionReadinessDossierError,
} from "./adapterPromotionReadinessDossier";
import { createDefaultState } from "./storage";

describe("adapter promotion readiness dossier", () => {
  it("requires a switch closure retention package", () => {
    const state = createDefaultState();

    expect(() => createAdapterPromotionReadinessDossier(state, {}, "platform.admin")).toThrow(
      AdapterPromotionReadinessDossierError
    );
  });

  it("blocks dossier readiness when closure or evidence is incomplete", () => {
    const state = createDefaultState();
    state.switchClosureRetentionPackages = [sampleClosurePackage("Blocked")];

    const dossier = createAdapterPromotionReadinessDossier(
      state,
      {
        closurePackageId: "switch-closure-retention-package-ndb-1",
        promotionOwner: "",
        retainedSwitchEvidenceReference: "",
        monitoringPlanReference: "",
        rollbackDrillConfirmation: "",
        securityAcceptanceReference: "",
      },
      "platform.admin"
    );

    expect(dossier).toMatchObject({
      provider: "NDB",
      closurePackageId: "switch-closure-retention-package-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(dossier.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Closure package ready", passed: false }),
        expect.objectContaining({ name: "Promotion owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
  });

  it("marks dossier ready when closure and promotion evidence are complete", () => {
    const state = createDefaultState();
    state.switchClosureRetentionPackages = [sampleClosurePackage("Ready for switch closure review")];

    const dossier = createAdapterPromotionReadinessDossier(
      state,
      { closurePackageId: "switch-closure-retention-package-ndb-1" },
      "platform.admin"
    );

    expect(dossier.status).toBe("Ready for adapter promotion review");
    expect(dossier.promotionOwner).toBe("Cloud Platform Owner");
    expect(dossier.retainedSwitchEvidenceReference).toBe("retained-evidence-manifest-ndb.json");
    expect(dossier.monitoringPlanReference).toBe("adapter-promotion-monitoring-ndb.md");
    expect(dossier.rollbackDrillConfirmation).toBe("rollback-drill-confirmation-ndb.md");
    expect(dossier.securityAcceptanceReference).toBe("security-acceptance-ndb.md");
    expect(dossier.provisioningEnabled).toBe(false);
  });
});

function sampleClosurePackage(status: "Blocked" | "Ready for switch closure review"): SwitchClosureRetentionPackage {
  return {
    id: "switch-closure-retention-package-ndb-1",
    provider: "NDB",
    outcomeRecordId: "switch-execution-outcome-record-ndb-1",
    handoffPackageId: "switch-execution-handoff-package-ndb-1",
    controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
    auditPackageId: "real-adapter-switch-state-audit-ndb-1",
    switchReviewId: "manual-real-adapter-switch-review-ndb-1",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    closureOwner: "Cloud Operations",
    retainedEvidenceManifestReference: "retained-evidence-manifest-ndb.json",
    lessonsLearnedReference: "lessons-learned-ndb.md",
    rollbackTimerClosureReference: "rollback-timer-closure-ndb.md",
    finalAuditRetentionConfirmation: "final-audit-retention-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
