import { describe, expect, it } from "vitest";
import type { SwitchExecutionHandoffPackage } from "../src/data/cloudStudioDomain";
import {
  createSwitchExecutionOutcomeRecord,
  SwitchExecutionOutcomeRecordError,
} from "./switchExecutionOutcomeRecord";
import { createDefaultState } from "./storage";

describe("switch execution outcome record", () => {
  it("requires a switch execution handoff package", () => {
    const state = createDefaultState();

    expect(() => createSwitchExecutionOutcomeRecord(state, {}, "platform.admin")).toThrow(
      SwitchExecutionOutcomeRecordError
    );
  });

  it("blocks outcome readiness when handoff or evidence is incomplete", () => {
    const state = createDefaultState();
    state.switchExecutionHandoffPackages = [sampleHandoffPackage("Blocked")];

    const outcome = createSwitchExecutionOutcomeRecord(
      state,
      {
        handoffPackageId: "switch-execution-handoff-package-ndb-1",
        operatorResultReference: "",
        postSwitchValidationReference: "",
        rollbackDecisionReference: "",
        incidentBridgeLogReference: "",
        auditSignOffReference: "",
      },
      "platform.admin"
    );

    expect(outcome).toMatchObject({
      provider: "NDB",
      handoffPackageId: "switch-execution-handoff-package-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(outcome.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Handoff package ready", passed: false }),
        expect.objectContaining({ name: "Operator result linked", passed: false }),
        expect.objectContaining({ name: "Prototype records outcome only", passed: true }),
      ])
    );
  });

  it("marks outcome ready when handoff and outcome evidence are complete", () => {
    const state = createDefaultState();
    state.switchExecutionHandoffPackages = [
      sampleHandoffPackage("Ready for switch execution handoff review"),
    ];

    const outcome = createSwitchExecutionOutcomeRecord(
      state,
      { handoffPackageId: "switch-execution-handoff-package-ndb-1" },
      "platform.admin"
    );

    expect(outcome.status).toBe("Ready for switch outcome review");
    expect(outcome.operatorResultReference).toBe("operator-result-ndb.md");
    expect(outcome.postSwitchValidationReference).toBe("post-switch-validation-ndb.json");
    expect(outcome.rollbackDecisionReference).toBe("rollback-decision-ndb.md");
    expect(outcome.incidentBridgeLogReference).toBe("incident-bridge-log-ndb.md");
    expect(outcome.auditSignOffReference).toBe("audit-signoff-ndb.md");
    expect(outcome.provisioningEnabled).toBe(false);
  });
});

function sampleHandoffPackage(
  status: "Blocked" | "Ready for switch execution handoff review"
): SwitchExecutionHandoffPackage {
  return {
    id: "switch-execution-handoff-package-ndb-1",
    provider: "NDB",
    controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
    auditPackageId: "real-adapter-switch-state-audit-ndb-1",
    switchReviewId: "manual-real-adapter-switch-review-ndb-1",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    operatorRunSheetReference: "operator-run-sheet-ndb.md",
    communicationsPlanReference: "communications-plan-ndb.md",
    observationWindowReference: "observation-window-ndb.md",
    rollbackOwnerAcceptance: "rollback-owner-acceptance-ndb.md",
    executionFreezeProofReference: "execution-freeze-proof-ndb.json",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
