import { describe, expect, it } from "vitest";
import type { ControlledSwitchConfigurationRequest } from "../src/data/cloudStudioDomain";
import {
  createSwitchExecutionHandoffPackage,
  SwitchExecutionHandoffPackageError,
} from "./switchExecutionHandoffPackage";
import { createDefaultState } from "./storage";

describe("switch execution handoff package", () => {
  it("requires a controlled switch request", () => {
    const state = createDefaultState();

    expect(() => createSwitchExecutionHandoffPackage(state, {}, "platform.admin")).toThrow(
      SwitchExecutionHandoffPackageError
    );
  });

  it("blocks handoff readiness when switch request or evidence is incomplete", () => {
    const state = createDefaultState();
    state.controlledSwitchConfigurationRequests = [sampleSwitchRequest("Blocked")];

    const handoff = createSwitchExecutionHandoffPackage(
      state,
      {
        controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
        operatorRunSheetReference: "",
        communicationsPlanReference: "",
        observationWindowReference: "",
        rollbackOwnerAcceptance: "",
        executionFreezeProofReference: "",
      },
      "platform.admin"
    );

    expect(handoff).toMatchObject({
      provider: "NDB",
      controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(handoff.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Controlled switch request ready", passed: false }),
        expect.objectContaining({ name: "Operator run sheet linked", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute switch", passed: true }),
      ])
    );
  });

  it("marks handoff ready when switch request and handoff evidence are complete", () => {
    const state = createDefaultState();
    state.controlledSwitchConfigurationRequests = [
      sampleSwitchRequest("Ready for controlled switch request review"),
    ];

    const handoff = createSwitchExecutionHandoffPackage(
      state,
      { controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1" },
      "platform.admin"
    );

    expect(handoff.status).toBe("Ready for switch execution handoff review");
    expect(handoff.operatorRunSheetReference).toBe("operator-run-sheet-ndb.md");
    expect(handoff.communicationsPlanReference).toBe("communications-plan-ndb.md");
    expect(handoff.observationWindowReference).toBe("observation-window-ndb.md");
    expect(handoff.rollbackOwnerAcceptance).toBe("rollback-owner-acceptance-ndb.md");
    expect(handoff.executionFreezeProofReference).toBe("execution-freeze-proof-ndb.json");
    expect(handoff.provisioningEnabled).toBe(false);
  });
});

function sampleSwitchRequest(
  status: "Blocked" | "Ready for controlled switch request review"
): ControlledSwitchConfigurationRequest {
  return {
    id: "controlled-switch-configuration-request-ndb-1",
    provider: "NDB",
    auditPackageId: "real-adapter-switch-state-audit-ndb-1",
    switchReviewId: "manual-real-adapter-switch-review-ndb-1",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    operatorConfirmation: "operator-confirmation-ndb.md",
    secondReviewerAcceptance: "second-reviewer-acceptance-ndb.md",
    finalDryRunProofReference: "final-switch-dry-run-ndb.json",
    rollbackTimerMinutes: 30,
    retentionReference: "audit-retention-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
