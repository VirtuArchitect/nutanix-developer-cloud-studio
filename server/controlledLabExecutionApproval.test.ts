import { describe, expect, it } from "vitest";
import {
  ControlledLabExecutionApprovalError,
  createControlledLabExecutionApprovalGate,
} from "./controlledLabExecutionApproval";
import { createDefaultState } from "./storage";

describe("controlled lab execution approval gate", () => {
  it("requires a proposal export", () => {
    const state = createDefaultState();

    expect(() => createControlledLabExecutionApprovalGate(state, {}, "platform.admin")).toThrow(
      ControlledLabExecutionApprovalError
    );
  });

  it("blocks advancement when final approvals are missing", () => {
    const state = createDefaultState();
    state.labExecutionProposalExports = [sampleProposalExport()];

    const approval = createControlledLabExecutionApprovalGate(
      state,
      { proposalExportId: "lab-execution-proposal-export-ndb-1" },
      "platform.admin"
    );

    expect(approval).toMatchObject({
      provider: "NDB",
      proposalExportId: "lab-execution-proposal-export-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(approval.decisions).toHaveLength(5);
    expect(approval.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "All approvers accepted", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks approval ready only when every required reviewer accepts with evidence", () => {
    const state = createDefaultState();
    state.labExecutionProposalExports = [sampleProposalExport()];

    const approval = createControlledLabExecutionApprovalGate(
      state,
      {
        proposalExportId: "lab-execution-proposal-export-ndb-1",
        platformOwnerDecision: "Accepted",
        securityReviewerDecision: "Accepted",
        labOwnerDecision: "Accepted",
        rollbackOwnerDecision: "Accepted",
        executiveSponsorDecision: "Accepted",
        platformOwnerEvidence: "platform-owner-approval.md",
        securityReviewerEvidence: "security-approval.md",
        labOwnerEvidence: "lab-owner-approval.md",
        rollbackOwnerEvidence: "rollback-owner-standby.md",
        executiveSponsorEvidence: "sponsor-approval.md",
      },
      "platform.admin"
    );

    expect(approval.status).toBe("Approved for controlled lab execution review");
    expect(approval.provisioningEnabled).toBe(false);
    expect(approval.killSwitch.enabled).toBe(false);
  });
});

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
      killSwitch: {
        name: "NDC_NDB_REAL_ADAPTER_ENABLED",
        enabled: false,
      },
      provisioningEnabled: false as const,
    },
    redactionBoundary: "metadata only",
    storageBoundary: "external storage required",
    provisioningEnabled: false as const,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
