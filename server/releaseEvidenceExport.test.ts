import { describe, expect, it } from "vitest";
import { createReleaseEvidenceExportRecord } from "./releaseEvidenceExport";
import { createDefaultState } from "./storage";

describe("release evidence export", () => {
  it("creates redacted metadata-only release evidence manifests", () => {
    const state = createDefaultState();
    state.providerReleaseGateRecords = [
      {
        id: "provider-release-ndb-1",
        provider: "NDB",
        product: "Nutanix Database Service",
        status: "Blocked",
        requestedBy: "platform.admin",
        releaseApprover: "platform.owner",
        checks: [
          { name: "Release approver assigned", passed: true, detail: "platform.owner" },
          { name: "Real adapter disabled", passed: true, detail: "NDB real adapter switch remains disabled." },
        ],
        evidence: [
          "Credential diagnostic: Approved reference.",
          "Evidence ref: object://user@example.invalid/release?sig=opaque-value",
        ],
        blockedOperations: ["create_database", "delete_database"],
        killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
        provisioningEnabled: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const exportRecord = createReleaseEvidenceExportRecord(
      state,
      { gateId: "provider-release-ndb-1" },
      "platform.admin"
    );

    expect(exportRecord).toMatchObject({
      provider: "NDB",
      gateId: "provider-release-ndb-1",
      status: "Prepared",
      format: "JSON",
      checksumAlgorithm: "sha256",
      provisioningEnabled: false,
    });
    expect(exportRecord.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(exportRecord.manifest).toMatchObject({
      checkCount: 2,
      passedChecks: 2,
      blockedOperations: expect.arrayContaining(["create_database"]),
      killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    });
    expect(exportRecord.manifest.evidenceReferences.join(" ")).toContain("sig=redacted");
    expect(exportRecord.manifest.evidenceReferences.join(" ")).toContain("object://redacted@");
    expect(exportRecord.manifest.evidenceReferences.join(" ")).not.toContain("opaque-value");
    expect(exportRecord.redactionBoundary).toContain("metadata only");
  });
});
