import { describe, expect, it } from "vitest";
import {
  ControlledLabExecutionRehearsalPacketError,
  createControlledLabExecutionRehearsalPacket,
} from "./controlledLabExecutionRehearsalPacket";
import { createDefaultState } from "./storage";

describe("controlled lab execution rehearsal packet", () => {
  it("requires an execution approval gate", () => {
    const state = createDefaultState();

    expect(() => createControlledLabExecutionRehearsalPacket(state, {}, "platform.admin")).toThrow(
      ControlledLabExecutionRehearsalPacketError
    );
  });

  it("blocks packet readiness when approval or frozen evidence is incomplete", () => {
    const state = createDefaultState();
    state.controlledLabExecutionApprovals = [sampleApproval("Blocked")];

    const packet = createControlledLabExecutionRehearsalPacket(
      state,
      { approvalGateId: "controlled-lab-execution-approval-ndb-1" },
      "platform.admin"
    );

    expect(packet).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      approvalGateId: "controlled-lab-execution-approval-ndb-1",
      provisioningEnabled: false,
    });
    expect(packet.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution approval gate approved", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks rehearsal packet ready only when approval and frozen evidence are complete", () => {
    const state = createDefaultState();
    state.controlledLabExecutionApprovals = [sampleApproval("Approved for controlled lab execution review")];
    state.labExecutionProposalExports = [sampleProposalExport()];
    state.labExecutionProposalEnvelopes = [
      {
        id: "lab-execution-proposal-ndb-1",
        provider: "NDB",
        reviewId: "lab-evidence-review-ndb-1",
        exportId: "lab-window-evidence-export-ndb-1",
        windowId: "controlled-lab-window-ndb-1",
        status: "Ready for proposal review",
        requestedBy: "platform.admin",
        checks: [],
        evidence: [],
        rollbackOwner: "cloud.ops",
        emergencyStopContacts: ["platform.owner", "security.reviewer"],
        killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];
    state.controlledLabDryRunWindows = [
      {
        id: "controlled-lab-window-ndb-1",
        provider: "NDB",
        status: "Ready for scheduling review",
        requestedBy: "platform.admin",
        scheduledStart: "2026-07-08T10:00:00.000Z",
        scheduledEnd: "2026-07-08T12:00:00.000Z",
        linkedRunbookId: "controlled-lab-runbook-ndb-1",
        linkedReleaseEvidenceExportId: "release-evidence-export-ndb-1",
        linkedLabScopeId: "lab-scope-1",
        rollbackOwner: "cloud.ops",
        emergencyStopContacts: ["platform.owner", "security.reviewer"],
        checks: [],
        readinessChecklist: [],
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];
    state.controlledLabReleaseRunbooks = [
      {
        id: "controlled-lab-runbook-ndb-1",
        provider: "NDB",
        readinessGeneratedAt: "2026-07-07T00:00:00.000Z",
        status: "Ready for controlled lab release review",
        requestedBy: "platform.admin",
        signOffs: [],
        checks: [],
        stopConditions: ["stop 1", "stop 2", "stop 3"],
        escalationContacts: ["platform.owner", "security.reviewer"],
        linkedReleaseGateId: "provider-release-ndb-1",
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];
    state.auditExports = [
      {
        id: "audit-export-1",
        status: "Prepared",
        requestedBy: "platform.admin",
        format: "JSONL",
        eventCount: 1,
        retentionEvents: 500,
        checksumAlgorithm: "sha256",
        checksum: "d".repeat(64),
        manifest: {
          exportId: "audit-export-1",
          eventCount: 1,
          retentionWindowEvents: 500,
          generatedAt: "2026-07-07T00:00:00.000Z",
          destinationRef: "not-configured",
        },
        redactionBoundary: "metadata only",
        storageBoundary: "external storage required",
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];

    const packet = createControlledLabExecutionRehearsalPacket(
      state,
      { approvalGateId: "controlled-lab-execution-approval-ndb-1" },
      "platform.admin"
    );

    expect(packet.status).toBe("Ready for rehearsal review");
    expect(packet.frozenReferences).toMatchObject({
      runbookId: "controlled-lab-runbook-ndb-1",
      rollbackOwner: "cloud.ops",
      proposalExportId: "lab-execution-proposal-export-ndb-1",
      auditExportIds: ["audit-export-1"],
    });
    expect(packet.provisioningEnabled).toBe(false);
  });
});

function sampleApproval(status: "Blocked" | "Approved for controlled lab execution review") {
  const accepted = status === "Approved for controlled lab execution review";
  return {
    id: "controlled-lab-execution-approval-ndb-1",
    provider: "NDB" as const,
    proposalExportId: "lab-execution-proposal-export-ndb-1",
    envelopeId: "lab-execution-proposal-ndb-1",
    status,
    requestedBy: "platform.admin",
    decisions: [
      "Platform owner",
      "Security reviewer",
      "Lab owner",
      "Rollback owner",
      "Executive sponsor",
    ].map((role) => ({
      role: role as "Platform owner" | "Security reviewer" | "Lab owner" | "Rollback owner" | "Executive sponsor",
      reviewer: role,
      decision: accepted ? ("Accepted" as const) : ("Pending" as const),
      evidence: accepted ? `${role.toLowerCase().replaceAll(" ", "-")}.md` : `${role} evidence required.`,
    })),
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false as const,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}

function sampleProposalExport() {
  return {
    id: "lab-execution-proposal-export-ndb-1",
    provider: "NDB" as const,
    envelopeId: "lab-execution-proposal-ndb-1",
    status: "Prepared" as const,
    requestedBy: "platform.admin",
    format: "JSON" as const,
    checksumAlgorithm: "sha256" as const,
    checksum: "c".repeat(64),
    manifest: {
      exportId: "lab-execution-proposal-export-ndb-1",
      envelopeId: "lab-execution-proposal-ndb-1",
      provider: "NDB" as const,
      envelopeStatus: "Ready for proposal review" as const,
      generatedAt: "2026-07-07T00:00:00.000Z",
      reviewId: "lab-evidence-review-ndb-1",
      windowId: "controlled-lab-window-ndb-1",
      windowEvidenceExportId: "lab-window-evidence-export-ndb-1",
      checkCount: 9,
      passedChecks: 9,
      evidenceReferences: ["proposal-evidence.md"],
      rollbackOwner: "cloud.ops",
      emergencyStopContacts: ["platform.owner", "security.reviewer"],
      killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
      provisioningEnabled: false as const,
    },
    redactionBoundary: "metadata only",
    storageBoundary: "external storage required",
    provisioningEnabled: false as const,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
