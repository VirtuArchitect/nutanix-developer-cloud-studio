import { describe, expect, it } from "vitest";
import type { SwitchExecutionOutcomeRecord } from "../src/data/cloudStudioDomain";
import {
  createSwitchClosureRetentionPackage,
  SwitchClosureRetentionPackageError,
} from "./switchClosureRetentionPackage";
import { createDefaultState } from "./storage";

describe("switch closure retention package", () => {
  it("requires a switch execution outcome record", () => {
    const state = createDefaultState();

    expect(() => createSwitchClosureRetentionPackage(state, {}, "platform.admin")).toThrow(
      SwitchClosureRetentionPackageError
    );
  });

  it("blocks closure readiness when outcome or evidence is incomplete", () => {
    const state = createDefaultState();
    state.switchExecutionOutcomeRecords = [sampleOutcomeRecord("Blocked")];

    const closure = createSwitchClosureRetentionPackage(
      state,
      {
        outcomeRecordId: "switch-execution-outcome-record-ndb-1",
        closureOwner: "",
        retainedEvidenceManifestReference: "",
        lessonsLearnedReference: "",
        rollbackTimerClosureReference: "",
        finalAuditRetentionConfirmation: "",
      },
      "platform.admin"
    );

    expect(closure).toMatchObject({
      provider: "NDB",
      outcomeRecordId: "switch-execution-outcome-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(closure.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Outcome record ready", passed: false }),
        expect.objectContaining({ name: "Closure owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype closes evidence only", passed: true }),
      ])
    );
  });

  it("marks closure ready when outcome and retention evidence are complete", () => {
    const state = createDefaultState();
    state.switchExecutionOutcomeRecords = [sampleOutcomeRecord("Ready for switch outcome review")];

    const closure = createSwitchClosureRetentionPackage(
      state,
      { outcomeRecordId: "switch-execution-outcome-record-ndb-1" },
      "platform.admin"
    );

    expect(closure.status).toBe("Ready for switch closure review");
    expect(closure.closureOwner).toBe("Cloud Operations");
    expect(closure.retainedEvidenceManifestReference).toBe("retained-evidence-manifest-ndb.json");
    expect(closure.lessonsLearnedReference).toBe("lessons-learned-ndb.md");
    expect(closure.rollbackTimerClosureReference).toBe("rollback-timer-closure-ndb.md");
    expect(closure.finalAuditRetentionConfirmation).toBe("final-audit-retention-ndb.md");
    expect(closure.provisioningEnabled).toBe(false);
  });
});

function sampleOutcomeRecord(status: "Blocked" | "Ready for switch outcome review"): SwitchExecutionOutcomeRecord {
  return {
    id: "switch-execution-outcome-record-ndb-1",
    provider: "NDB",
    handoffPackageId: "switch-execution-handoff-package-ndb-1",
    controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
    auditPackageId: "real-adapter-switch-state-audit-ndb-1",
    switchReviewId: "manual-real-adapter-switch-review-ndb-1",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    operatorResultReference: "operator-result-ndb.md",
    postSwitchValidationReference: "post-switch-validation-ndb.json",
    rollbackDecisionReference: "rollback-decision-ndb.md",
    incidentBridgeLogReference: "incident-bridge-log-ndb.md",
    auditSignOffReference: "audit-signoff-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
