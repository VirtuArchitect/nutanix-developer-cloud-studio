import { describe, expect, it } from "vitest";
import type { RealAdapterLabScopeActivation } from "../src/data/cloudStudioDomain";
import {
  createManualRealAdapterSwitchReview,
  ManualRealAdapterSwitchReviewError,
} from "./manualRealAdapterSwitchReview";
import { createDefaultState } from "./storage";

describe("manual real adapter switch review", () => {
  it("requires a lab scope activation", () => {
    const state = createDefaultState();

    expect(() => createManualRealAdapterSwitchReview(state, {}, "platform.admin")).toThrow(
      ManualRealAdapterSwitchReviewError
    );
  });

  it("blocks review when activation or evidence is incomplete", () => {
    const state = createDefaultState();
    state.realAdapterLabScopeActivations = [sampleActivation("Blocked")];

    const review = createManualRealAdapterSwitchReview(
      state,
      {
        activationId: "real-adapter-lab-scope-activation-ndb-1",
        switchOperator: "",
        secondReviewer: "",
        maintenanceWindowReference: "",
        switchStateAuditReferences: [],
        rollbackContact: "",
      },
      "platform.admin"
    );

    expect(review).toMatchObject({
      provider: "NDB",
      activationId: "real-adapter-lab-scope-activation-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(review.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Lab scope activation ready", passed: false }),
        expect.objectContaining({ name: "Switch operator assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not change switch state", passed: true }),
      ])
    );
  });

  it("marks review ready when activation and review evidence are complete", () => {
    const state = createDefaultState();
    state.realAdapterLabScopeActivations = [sampleActivation("Ready for manual real-adapter switch review")];

    const review = createManualRealAdapterSwitchReview(
      state,
      { activationId: "real-adapter-lab-scope-activation-ndb-1" },
      "platform.admin"
    );

    expect(review.status).toBe("Ready for manual switch change review");
    expect(review.switchOperator).toBe("cloud.switch.operator");
    expect(review.secondReviewer).toBe("security.change.reviewer");
    expect(review.switchStateAuditReferences).toHaveLength(2);
    expect(review.killSwitch.enabled).toBe(false);
    expect(review.provisioningEnabled).toBe(false);
  });
});

function sampleActivation(
  status: "Blocked" | "Ready for manual real-adapter switch review"
): RealAdapterLabScopeActivation {
  return {
    id: "real-adapter-lab-scope-activation-ndb-1",
    provider: "NDB",
    dispatchApprovalId: "execution-broker-dispatch-approval-ndb-1",
    brokerRecordId: "execution-broker-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    authorizedScopeReference: "authorized-lab-scope-ndb.md",
    pentestCompletionEvidence: "pentest-complete-ndb.md",
    rollbackOwner: "Cloud Operations",
    boundedProviderTargets: ["ndb-lab-cluster-01", "ndb-lab-project-dev"],
    manualOperatorControls: [
      "manual-change-window-approved",
      "two-person-operator-confirmation",
      "post-change-destroy-plan-ready",
    ],
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
