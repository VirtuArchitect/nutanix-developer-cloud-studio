import { describe, expect, it } from "vitest";
import {
  ControlledLabDryRunExecutionChecklistError,
  createControlledLabDryRunExecutionChecklist,
} from "./controlledLabDryRunExecutionChecklist";
import { createDefaultState } from "./storage";

describe("controlled lab dry-run execution checklist", () => {
  it("requires a rehearsal packet", () => {
    const state = createDefaultState();

    expect(() => createControlledLabDryRunExecutionChecklist(state, {}, "platform.admin")).toThrow(
      ControlledLabDryRunExecutionChecklistError
    );
  });

  it("blocks readiness when rehearsal packet or checklist evidence is incomplete", () => {
    const state = createDefaultState();
    state.controlledLabExecutionRehearsalPackets = [samplePacket("Blocked")];

    const checklist = createControlledLabDryRunExecutionChecklist(
      state,
      {
        rehearsalPacketId: "controlled-lab-rehearsal-packet-ndb-1",
        operatorRoster: ["Cloud Operator"],
        scheduledStart: "2026-07-08T10:00:00.000Z",
        scheduledEnd: "2026-07-08T09:00:00.000Z",
        logCaptureReferences: ["audit-log.md"],
        rollbackTimerMinutes: 5,
        stopAuthority: "",
      },
      "platform.admin"
    );

    expect(checklist).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      rehearsalPacketId: "controlled-lab-rehearsal-packet-ndb-1",
      provisioningEnabled: false,
    });
    expect(checklist.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Rehearsal packet ready", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks dry-run checklist ready when packet and checklist evidence are complete", () => {
    const state = createDefaultState();
    state.controlledLabExecutionRehearsalPackets = [samplePacket("Ready for rehearsal review")];

    const checklist = createControlledLabDryRunExecutionChecklist(
      state,
      { rehearsalPacketId: "controlled-lab-rehearsal-packet-ndb-1" },
      "platform.admin"
    );

    expect(checklist.status).toBe("Ready for dry-run review");
    expect(checklist.operatorRoster).toHaveLength(3);
    expect(checklist.logCaptureReferences).toHaveLength(2);
    expect(checklist.rollbackTimerMinutes).toBe(30);
    expect(checklist.stopAuthority).toBe("cloud.ops");
    expect(checklist.provisioningEnabled).toBe(false);
  });
});

function samplePacket(status: "Blocked" | "Ready for rehearsal review") {
  return {
    id: "controlled-lab-rehearsal-packet-ndb-1",
    provider: "NDB" as const,
    approvalGateId: "controlled-lab-execution-approval-ndb-1",
    proposalExportId: "lab-execution-proposal-export-ndb-1",
    envelopeId: "lab-execution-proposal-ndb-1",
    status,
    requestedBy: "platform.admin",
    frozenReferences: {
      runbookId: "controlled-lab-runbook-ndb-1",
      rollbackOwner: "cloud.ops",
      emergencyStopContacts: ["platform.owner", "security.reviewer"],
      stopConditions: ["stop 1", "stop 2", "stop 3"],
      proposalExportId: "lab-execution-proposal-export-ndb-1",
      auditExportIds: ["audit-export-1"],
      approvalEvidence: ["Platform owner: platform-owner.md"],
    },
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false as const,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
