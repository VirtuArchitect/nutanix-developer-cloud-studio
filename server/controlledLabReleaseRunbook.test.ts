import { describe, expect, it } from "vitest";
import { createDefaultState } from "./storage";
import { createControlledLabReleaseRunbookRecord } from "./controlledLabReleaseRunbook";

describe("controlled lab release runbook", () => {
  it("blocks completion when required sign-offs are missing", () => {
    const state = createDefaultState();
    state.providerReleaseGateRecords = [
      {
        id: "provider-release-ndb-1",
        provider: "NDB",
        product: "Nutanix Database Service",
        status: "Ready for release review",
        requestedBy: "platform.admin",
        releaseApprover: "platform.owner",
        checks: [{ name: "Release approver assigned", passed: true, detail: "platform.owner" }],
        evidence: ["release-gate-evidence.md"],
        blockedOperations: ["create_database", "delete_database"],
        killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];

    const runbook = createControlledLabReleaseRunbookRecord(state, { provider: "NDB" }, "platform.admin");

    expect(runbook).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      linkedReleaseGateId: "provider-release-ndb-1",
      provisioningEnabled: false,
    });
    expect(runbook.signOffs).toHaveLength(4);
    expect(runbook.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "All required sign-offs recorded", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(runbook.stopConditions.length).toBeGreaterThanOrEqual(3);
  });

  it("marks runbook ready only when readiness and sign-off evidence are complete", () => {
    const state = createDefaultState();
    state.providerReleaseGateRecords = [
      {
        id: "provider-release-ndb-1",
        provider: "NDB",
        product: "Nutanix Database Service",
        status: "Ready for release review",
        requestedBy: "platform.admin",
        releaseApprover: "platform.owner",
        checks: [
          { name: "Approved lab scope", passed: true, detail: "scope-1" },
          { name: "Credential reference approved", passed: true, detail: "approved" },
        ],
        evidence: ["release-gate-evidence.md"],
        blockedOperations: ["create_database", "delete_database"],
        killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];

    const runbook = createControlledLabReleaseRunbookRecord(
      state,
      {
        provider: "NDB",
        platformOwnerEvidence: "approval/platform-owner.md",
        securityReviewerEvidence: "approval/security-review.md",
        rollbackOwnerEvidence: "approval/rollback-owner.md",
        labOwnerEvidence: "approval/lab-owner.md",
      },
      "platform.admin"
    );

    expect(runbook.status).toBe("Ready for controlled lab release review");
    expect(runbook.signOffs.every((signOff) => signOff.signed)).toBe(true);
    expect(runbook.provisioningEnabled).toBe(false);
  });
});
