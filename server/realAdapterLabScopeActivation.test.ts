import { describe, expect, it } from "vitest";
import type { ExecutionBrokerDispatchApproval } from "../src/data/cloudStudioDomain";
import {
  createRealAdapterLabScopeActivation,
  RealAdapterLabScopeActivationError,
} from "./realAdapterLabScopeActivation";
import { createDefaultState } from "./storage";

describe("real adapter lab scope activation", () => {
  it("requires a dispatch approval", () => {
    const state = createDefaultState();

    expect(() => createRealAdapterLabScopeActivation(state, {}, "platform.admin")).toThrow(
      RealAdapterLabScopeActivationError
    );
  });

  it("blocks activation when dispatch approval or evidence is incomplete", () => {
    const state = createDefaultState();
    state.executionBrokerDispatchApprovals = [sampleDispatchApproval("Blocked")];

    const activation = createRealAdapterLabScopeActivation(
      state,
      {
        dispatchApprovalId: "execution-broker-dispatch-approval-ndb-1",
        authorizedScopeReference: "",
        pentestCompletionEvidence: "",
        rollbackOwner: "",
        boundedProviderTargets: [],
        manualOperatorControls: [],
      },
      "platform.admin"
    );

    expect(activation).toMatchObject({
      provider: "NDB",
      dispatchApprovalId: "execution-broker-dispatch-approval-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(activation.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dispatch approval ready", passed: false }),
        expect.objectContaining({ name: "Authorized scope linked", passed: false }),
        expect.objectContaining({ name: "Real adapter switch remains disabled", passed: true }),
      ])
    );
  });

  it("marks activation ready for manual switch review when evidence is complete", () => {
    const state = createDefaultState();
    state.executionBrokerDispatchApprovals = [sampleDispatchApproval("Ready for authorized lab dispatch review")];

    const activation = createRealAdapterLabScopeActivation(
      state,
      { dispatchApprovalId: "execution-broker-dispatch-approval-ndb-1" },
      "platform.admin"
    );

    expect(activation.status).toBe("Ready for manual real-adapter switch review");
    expect(activation.authorizedScopeReference).toBe("authorized-lab-scope-ndb.md");
    expect(activation.pentestCompletionEvidence).toBe("pentest-complete-ndb.md");
    expect(activation.boundedProviderTargets).toHaveLength(2);
    expect(activation.manualOperatorControls).toHaveLength(3);
    expect(activation.killSwitch.enabled).toBe(false);
    expect(activation.provisioningEnabled).toBe(false);
  });
});

function sampleDispatchApproval(
  status: "Blocked" | "Ready for authorized lab dispatch review"
): ExecutionBrokerDispatchApproval {
  return {
    id: "execution-broker-dispatch-approval-ndb-1",
    provider: "NDB",
    brokerRecordId: "execution-broker-ndb-1",
    readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    operatorApprover: "cloud.operations.approver",
    rollbackProofReference: "rollback-proof-ndb.md",
    pentestEvidenceReference: "pentest-scope-ndb.md",
    dispatchWindowReference: "dispatch-window-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
