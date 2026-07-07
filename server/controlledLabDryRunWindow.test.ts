import { describe, expect, it } from "vitest";
import { createControlledLabDryRunWindowRecord } from "./controlledLabDryRunWindow";
import { createDefaultState } from "./storage";

describe("controlled lab dry-run window", () => {
  it("blocks scheduling when required evidence links are missing", () => {
    const state = createDefaultState();

    const window = createControlledLabDryRunWindowRecord(state, { provider: "NDB" }, "platform.admin");

    expect(window).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(window.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Controlled runbook ready", passed: false }),
        expect.objectContaining({ name: "Release evidence export linked", passed: false }),
        expect.objectContaining({ name: "Active lab scope linked", passed: false }),
        expect.objectContaining({ name: "Audit export ready", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks scheduling ready only when runbook, export, scope, rollback, and audit evidence exist", () => {
    const state = createDefaultState();
    state.controlledLabReleaseRunbooks = [
      {
        id: "controlled-lab-runbook-ndb-1",
        provider: "NDB",
        readinessGeneratedAt: "2026-07-07T00:00:00.000Z",
        status: "Ready for controlled lab release review",
        requestedBy: "platform.admin",
        signOffs: [
          { role: "Platform owner", owner: "platform.owner", signed: true, evidence: "platform-owner.md" },
          { role: "Security reviewer", owner: "security.reviewer", signed: true, evidence: "security-review.md" },
          { role: "Rollback owner", owner: "cloud.ops", signed: true, evidence: "rollback-owner.md" },
          { role: "Lab owner", owner: "lab.owner", signed: true, evidence: "lab-owner.md" },
        ],
        checks: [{ name: "All required sign-offs recorded", passed: true, detail: "4/4" }],
        stopConditions: ["stop 1", "stop 2", "stop 3"],
        escalationContacts: ["platform.owner", "security.reviewer", "lab.owner"],
        linkedReleaseGateId: "provider-release-ndb-1",
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];
    state.releaseEvidenceExports = [
      {
        id: "release-evidence-export-ndb-1",
        provider: "NDB",
        gateId: "provider-release-ndb-1",
        status: "Prepared",
        requestedBy: "platform.admin",
        format: "JSON",
        checksumAlgorithm: "sha256",
        checksum: "a".repeat(64),
        manifest: {
          exportId: "release-evidence-export-ndb-1",
          gateId: "provider-release-ndb-1",
          provider: "NDB",
          gateStatus: "Ready for release review",
          generatedAt: "2026-07-07T00:00:00.000Z",
          releaseApprover: "platform.owner",
          checkCount: 1,
          passedChecks: 1,
          blockedOperations: ["create_database"],
          killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
          evidenceReferences: ["release-evidence.md"],
        },
        redactionBoundary: "metadata only",
        storageBoundary: "external storage required",
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];
    state.labAuthorizationScopes = [
      {
        id: "lab-scope-1",
        version: "1",
        name: "Lab scope",
        targetEnvironment: "Berlin Lab",
        owner: "cloud.ops",
        approver: "security.reviewer",
        approvedAt: "2026-07-07T00:00:00.000Z",
        expiresAt: "2999-01-01T00:00:00.000Z",
        project: "developer-cloud-lab",
        cluster: "berlin-ahv-lab",
        network: "dev-segment",
        providerCoverage: ["NDB"],
        targetEndpoints: ["ndb.lab.local"],
        allowedActions: ["dry-run"],
        excludedActions: ["create_database"],
        pentestScopeReference: "pentest-scope.md",
        pentestScopeStructurallyValid: true,
        evidenceReferences: ["lab-scope.md"],
        rollbackOwner: "cloud.ops",
        status: "Approved",
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
        checksum: "b".repeat(64),
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

    const window = createControlledLabDryRunWindowRecord(
      state,
      {
        provider: "NDB",
        runbookId: "controlled-lab-runbook-ndb-1",
        releaseEvidenceExportId: "release-evidence-export-ndb-1",
        labScopeId: "lab-scope-1",
        rollbackOwner: "cloud.ops",
        emergencyStopContacts: ["platform.owner", "security.reviewer"],
      },
      "platform.admin"
    );

    expect(window.status).toBe("Ready for scheduling review");
    expect(window.provisioningEnabled).toBe(false);
  });
});
