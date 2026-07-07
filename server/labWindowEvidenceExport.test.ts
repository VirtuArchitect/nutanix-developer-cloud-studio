import { describe, expect, it } from "vitest";
import { createDefaultState } from "./storage";
import { createLabWindowEvidenceExportRecord } from "./labWindowEvidenceExport";

describe("lab window evidence export", () => {
  it("creates a metadata-only manifest for a controlled lab dry-run window", () => {
    const state = createDefaultState();
    state.controlledLabDryRunWindows = [
      {
        id: "controlled-lab-window-ndb-1",
        provider: "NDB",
        status: "Blocked",
        requestedBy: "platform.admin",
        scheduledStart: "2026-07-08T10:00:00.000Z",
        scheduledEnd: "2026-07-08T12:00:00.000Z",
        linkedRunbookId: "controlled-lab-runbook-ndb-1",
        linkedReleaseEvidenceExportId: "release-evidence-export-ndb-1",
        linkedLabScopeId: "lab-scope-1",
        rollbackOwner: "cloud.ops",
        emergencyStopContacts: ["platform.owner", "https://redacted@example.invalid/contact?cred=redacted"],
        checks: [
          { name: "Controlled runbook ready", passed: false, detail: "blocked" },
          { name: "Real adapter execution disabled", passed: true, detail: "disabled" },
        ],
        readinessChecklist: ["Confirm evidence.", "Stop on drift."],
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];

    const exportRecord = createLabWindowEvidenceExportRecord(
      state,
      { windowId: "controlled-lab-window-ndb-1" },
      "platform.admin"
    );

    expect(exportRecord).toMatchObject({
      provider: "NDB",
      windowId: "controlled-lab-window-ndb-1",
      status: "Prepared",
      format: "JSON",
      checksumAlgorithm: "sha256",
      provisioningEnabled: false,
    });
    expect(exportRecord.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(exportRecord.manifest).toMatchObject({
      linkedRunbookId: "controlled-lab-runbook-ndb-1",
      linkedReleaseEvidenceExportId: "release-evidence-export-ndb-1",
      linkedLabScopeId: "lab-scope-1",
      checkCount: 2,
      passedChecks: 1,
      provisioningEnabled: false,
    });
    expect(exportRecord.manifest.emergencyStopContacts).toContain("https://redacted@example.invalid/contact?cred=redacted");
  });
});
