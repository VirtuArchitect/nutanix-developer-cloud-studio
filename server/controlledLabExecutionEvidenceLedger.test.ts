import { describe, expect, it } from "vitest";
import {
  ControlledLabExecutionEvidenceLedgerError,
  createControlledLabExecutionEvidenceLedger,
} from "./controlledLabExecutionEvidenceLedger";
import { createDefaultState } from "./storage";

describe("controlled lab execution evidence ledger", () => {
  it("requires a dry-run checklist", () => {
    const state = createDefaultState();

    expect(() => createControlledLabExecutionEvidenceLedger(state, {}, "platform.admin")).toThrow(
      ControlledLabExecutionEvidenceLedgerError
    );
  });

  it("blocks ledger readiness when checklist or evidence is incomplete", () => {
    const state = createDefaultState();
    state.controlledLabDryRunExecutionChecklists = [sampleChecklist("Blocked")];

    const ledger = createControlledLabExecutionEvidenceLedger(
      state,
      {
        dryRunChecklistId: "controlled-lab-dry-run-checklist-ndb-1",
        operatorEvidence: [],
        observerEvidence: [],
        rollbackEvidence: [],
        logEvidence: [],
        auditEvidence: [],
        stopAuthorityEvidence: [],
      },
      "platform.admin"
    );

    expect(ledger).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      dryRunChecklistId: "controlled-lab-dry-run-checklist-ndb-1",
      provisioningEnabled: false,
    });
    expect(ledger.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dry-run checklist ready", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks ledger ready when checklist and immutable evidence are complete", () => {
    const state = createDefaultState();
    state.controlledLabDryRunExecutionChecklists = [sampleChecklist("Ready for dry-run review")];

    const ledger = createControlledLabExecutionEvidenceLedger(
      state,
      { dryRunChecklistId: "controlled-lab-dry-run-checklist-ndb-1" },
      "platform.admin"
    );

    expect(ledger.status).toBe("Ready for evidence review");
    expect(ledger.immutableReferences.operatorEvidence).toHaveLength(3);
    expect(ledger.immutableReferences.logEvidence).toHaveLength(2);
    expect(ledger.immutableReferences.auditEvidence).toHaveLength(1);
    expect(ledger.killSwitch.enabled).toBe(false);
    expect(ledger.provisioningEnabled).toBe(false);
  });
});

function sampleChecklist(status: "Blocked" | "Ready for dry-run review") {
  return {
    id: "controlled-lab-dry-run-checklist-ndb-1",
    provider: "NDB" as const,
    rehearsalPacketId: "controlled-lab-rehearsal-packet-ndb-1",
    approvalGateId: "controlled-lab-execution-approval-ndb-1",
    status,
    requestedBy: "platform.admin",
    operatorRoster: ["Cloud Operator", "Security Observer", "Rollback Owner"],
    observationWindow: {
      scheduledStart: "2026-07-08T10:00:00.000Z",
      scheduledEnd: "2026-07-08T11:00:00.000Z",
    },
    logCaptureReferences: ["audit-log-capture-plan.md", "provider-response-capture.md"],
    rollbackTimerMinutes: 30,
    stopAuthority: "cloud.ops",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false as const,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
