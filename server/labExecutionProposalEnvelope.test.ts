import { describe, expect, it } from "vitest";
import { createLabExecutionProposalEnvelope } from "./labExecutionProposalEnvelope";
import { createDefaultState } from "./storage";

describe("lab execution proposal envelope", () => {
  it("blocks proposal readiness when review evidence is not accepted", () => {
    const state = createDefaultState();
    state.labEvidenceReviews = [
      {
        id: "lab-evidence-review-ndb-1",
        provider: "NDB",
        exportId: "lab-window-evidence-export-ndb-1",
        windowId: "controlled-lab-window-ndb-1",
        status: "Blocked",
        requestedBy: "platform.admin",
        decisions: [],
        checks: [],
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];

    const envelope = createLabExecutionProposalEnvelope(state, { reviewId: "lab-evidence-review-ndb-1" }, "platform.admin");

    expect(envelope).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      reviewId: "lab-evidence-review-ndb-1",
      provisioningEnabled: false,
    });
    expect(envelope.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Lab evidence review accepted", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks proposal ready only when accepted review and linked evidence are complete", () => {
    const state = createDefaultState();
    state.labEvidenceReviews = [
      {
        id: "lab-evidence-review-ndb-1",
        provider: "NDB",
        exportId: "lab-window-evidence-export-ndb-1",
        windowId: "controlled-lab-window-ndb-1",
        status: "Accepted",
        requestedBy: "platform.admin",
        decisions: [],
        checks: [],
        provisioningEnabled: false,
        createdAt: "2026-07-07T00:00:00.000Z",
      },
    ];
    state.labWindowEvidenceExports = [
      {
        id: "lab-window-evidence-export-ndb-1",
        provider: "NDB",
        windowId: "controlled-lab-window-ndb-1",
        status: "Prepared",
        requestedBy: "platform.admin",
        format: "JSON",
        checksumAlgorithm: "sha256",
        checksum: "a".repeat(64),
        manifest: {
          exportId: "lab-window-evidence-export-ndb-1",
          windowId: "controlled-lab-window-ndb-1",
          provider: "NDB",
          windowStatus: "Ready for scheduling review",
          generatedAt: "2026-07-07T00:00:00.000Z",
          scheduledStart: "2026-07-08T10:00:00.000Z",
          scheduledEnd: "2026-07-08T12:00:00.000Z",
          linkedRunbookId: "controlled-lab-runbook-ndb-1",
          linkedReleaseEvidenceExportId: "release-evidence-export-ndb-1",
          linkedLabScopeId: "lab-scope-1",
          rollbackOwner: "cloud.ops",
          emergencyStopContacts: ["platform.owner", "security.reviewer"],
          checkCount: 8,
          passedChecks: 8,
          readinessChecklist: ["Confirm evidence."],
          provisioningEnabled: false,
        },
        redactionBoundary: "metadata only",
        storageBoundary: "external storage required",
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

    const envelope = createLabExecutionProposalEnvelope(state, { reviewId: "lab-evidence-review-ndb-1" }, "platform.admin");

    expect(envelope.status).toBe("Ready for proposal review");
    expect(envelope.provisioningEnabled).toBe(false);
  });
});
