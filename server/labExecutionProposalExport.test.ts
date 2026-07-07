import { describe, expect, it } from "vitest";
import { createLabExecutionProposalExportRecord, LabExecutionProposalExportError } from "./labExecutionProposalExport";
import { createDefaultState } from "./storage";

describe("lab execution proposal export", () => {
  it("requires a lab execution proposal envelope", () => {
    const state = createDefaultState();

    expect(() => createLabExecutionProposalExportRecord(state, {}, "platform.admin")).toThrow(
      LabExecutionProposalExportError
    );
  });

  it("exports proposal envelopes as redacted metadata only", () => {
    const state = createDefaultState();
    state.labExecutionProposalEnvelopes = [
      {
        id: "lab-execution-proposal-ndb-1",
        provider: "NDB",
        reviewId: "lab-evidence-review-ndb-1",
        exportId: "lab-window-evidence-export-ndb-1",
        windowId: "controlled-lab-window-ndb-1",
        status: "Ready for proposal review",
        requestedBy: "platform.admin",
        checks: [
          { name: "Lab evidence review accepted", passed: true, detail: "Accepted." },
          { name: "Real adapter execution disabled", passed: true, detail: "Disabled." },
        ],
        evidence: [
          "Review: lab-evidence-review-ndb-1.",
          "Window export: https://user:sample@evidence.example/reports/window.json?key=hidden",
        ],
        rollbackOwner: "cloud.ops",
        emergencyStopContacts: ["https://user:sample@pager.example/stop?sig=hidden", "security.reviewer"],
        killSwitch: {
          name: "NDC_NDB_REAL_ADAPTER_ENABLED",
          enabled: false,
        },
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];

    const exportRecord = createLabExecutionProposalExportRecord(
      state,
      { envelopeId: "lab-execution-proposal-ndb-1" },
      "platform.admin"
    );

    expect(exportRecord).toMatchObject({
      provider: "NDB",
      envelopeId: "lab-execution-proposal-ndb-1",
      status: "Prepared",
      checksumAlgorithm: "sha256",
      provisioningEnabled: false,
    });
    expect(exportRecord.checksum).toHaveLength(64);
    expect(exportRecord.manifest).toMatchObject({
      envelopeStatus: "Ready for proposal review",
      checkCount: 2,
      passedChecks: 2,
      provisioningEnabled: false,
      killSwitch: {
        name: "NDC_NDB_REAL_ADAPTER_ENABLED",
        enabled: false,
      },
    });
    expect(exportRecord.manifest.evidenceReferences.join(" ")).toContain("https://redacted@evidence.example");
    expect(exportRecord.manifest.evidenceReferences.join(" ")).toContain("key=redacted");
    expect(exportRecord.manifest.emergencyStopContacts.join(" ")).toContain("https://redacted@pager.example");
    expect(exportRecord.manifest.emergencyStopContacts.join(" ")).toContain("sig=redacted");
    expect(JSON.stringify(exportRecord)).not.toContain("sample");
    expect(JSON.stringify(exportRecord)).not.toContain("hidden");
  });
});
