import { describe, expect, it } from "vitest";
import type { ManualRealAdapterSwitchReview } from "../src/data/cloudStudioDomain";
import {
  createRealAdapterSwitchStateAuditPackage,
  RealAdapterSwitchStateAuditPackageError,
} from "./realAdapterSwitchStateAuditPackage";
import { createDefaultState } from "./storage";

describe("real adapter switch-state audit package", () => {
  it("requires a manual switch review", () => {
    const state = createDefaultState();

    expect(() => createRealAdapterSwitchStateAuditPackage(state, {}, "platform.admin")).toThrow(
      RealAdapterSwitchStateAuditPackageError
    );
  });

  it("blocks audit package readiness when switch review or evidence is incomplete", () => {
    const state = createDefaultState();
    state.manualRealAdapterSwitchReviews = [sampleSwitchReview("Blocked")];

    const auditPackage = createRealAdapterSwitchStateAuditPackage(
      state,
      {
        switchReviewId: "manual-real-adapter-switch-review-ndb-1",
        preChangeSnapshotReference: "",
        postChangeSnapshotReference: "",
        reviewerEvidenceReference: "",
        rollbackTimerMinutes: 5,
        retentionReference: "",
      },
      "platform.admin"
    );

    expect(auditPackage).toMatchObject({
      provider: "NDB",
      switchReviewId: "manual-real-adapter-switch-review-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(auditPackage.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Switch review ready", passed: false }),
        expect.objectContaining({ name: "Pre-change snapshot linked", passed: false }),
        expect.objectContaining({ name: "Prototype leaves switch state unchanged", passed: true }),
      ])
    );
  });

  it("marks audit package ready when switch review and evidence are complete", () => {
    const state = createDefaultState();
    state.manualRealAdapterSwitchReviews = [sampleSwitchReview("Ready for manual switch change review")];

    const auditPackage = createRealAdapterSwitchStateAuditPackage(
      state,
      { switchReviewId: "manual-real-adapter-switch-review-ndb-1" },
      "platform.admin"
    );

    expect(auditPackage.status).toBe("Ready for switch-state audit review");
    expect(auditPackage.preChangeSnapshotReference).toBe("pre-switch-state-ndb.json");
    expect(auditPackage.postChangeSnapshotReference).toBe("post-switch-state-ndb.json");
    expect(auditPackage.rollbackTimerMinutes).toBe(30);
    expect(auditPackage.killSwitch.enabled).toBe(false);
    expect(auditPackage.provisioningEnabled).toBe(false);
  });
});

function sampleSwitchReview(status: "Blocked" | "Ready for manual switch change review"): ManualRealAdapterSwitchReview {
  return {
    id: "manual-real-adapter-switch-review-ndb-1",
    provider: "NDB",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    dispatchApprovalId: "execution-broker-dispatch-approval-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    switchOperator: "cloud.switch.operator",
    secondReviewer: "security.change.reviewer",
    maintenanceWindowReference: "maintenance-window-ndb.md",
    switchStateAuditReferences: ["pre-switch-state-ndb.json", "post-switch-state-ndb.json"],
    rollbackContact: "Cloud Operations",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
