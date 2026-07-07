import { describe, expect, it } from "vitest";
import type { RealAdapterSwitchStateAuditPackage } from "../src/data/cloudStudioDomain";
import {
  createControlledSwitchConfigurationRequest,
  ControlledSwitchConfigurationRequestError,
} from "./controlledSwitchConfigurationRequest";
import { createDefaultState } from "./storage";

describe("controlled switch configuration request", () => {
  it("requires a switch-state audit package", () => {
    const state = createDefaultState();

    expect(() => createControlledSwitchConfigurationRequest(state, {}, "platform.admin")).toThrow(
      ControlledSwitchConfigurationRequestError
    );
  });

  it("blocks request readiness when audit package or evidence is incomplete", () => {
    const state = createDefaultState();
    state.realAdapterSwitchStateAuditPackages = [sampleAuditPackage("Blocked")];

    const request = createControlledSwitchConfigurationRequest(
      state,
      {
        auditPackageId: "real-adapter-switch-state-audit-ndb-1",
        operatorConfirmation: "",
        secondReviewerAcceptance: "",
        rollbackTimerMinutes: 5,
        finalDryRunProofReference: "",
        retentionReference: "",
      },
      "platform.admin"
    );

    expect(request).toMatchObject({
      provider: "NDB",
      auditPackageId: "real-adapter-switch-state-audit-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(request.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Switch-state audit package ready", passed: false }),
        expect.objectContaining({ name: "Operator confirmation linked", passed: false }),
        expect.objectContaining({ name: "Prototype remains non-mutating", passed: true }),
      ])
    );
  });

  it("marks request ready when audit package and switch evidence are complete", () => {
    const state = createDefaultState();
    state.realAdapterSwitchStateAuditPackages = [sampleAuditPackage("Ready for switch-state audit review")];

    const request = createControlledSwitchConfigurationRequest(
      state,
      { auditPackageId: "real-adapter-switch-state-audit-ndb-1" },
      "platform.admin"
    );

    expect(request.status).toBe("Ready for controlled switch request review");
    expect(request.operatorConfirmation).toBe("operator-confirmation-ndb.md");
    expect(request.secondReviewerAcceptance).toBe("second-reviewer-acceptance-ndb.md");
    expect(request.finalDryRunProofReference).toBe("final-switch-dry-run-ndb.json");
    expect(request.rollbackTimerMinutes).toBe(30);
    expect(request.killSwitch.enabled).toBe(false);
    expect(request.provisioningEnabled).toBe(false);
  });
});

function sampleAuditPackage(
  status: "Blocked" | "Ready for switch-state audit review"
): RealAdapterSwitchStateAuditPackage {
  return {
    id: "real-adapter-switch-state-audit-ndb-1",
    provider: "NDB",
    switchReviewId: "manual-real-adapter-switch-review-ndb-1",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    preChangeSnapshotReference: "pre-switch-state-ndb.json",
    postChangeSnapshotReference: "post-switch-state-ndb.json",
    reviewerEvidenceReference: "switch-reviewer-evidence-ndb.md",
    rollbackTimerMinutes: 30,
    retentionReference: "audit-retention-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
