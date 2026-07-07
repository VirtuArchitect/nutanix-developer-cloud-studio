import { describe, expect, it } from "vitest";
import { createLabEvidenceReviewRecord } from "./labEvidenceReview";
import { createDefaultState } from "./storage";

describe("lab evidence review", () => {
  it("blocks completion when reviewer decisions are missing", () => {
    const state = createDefaultState();
    state.labWindowEvidenceExports = [sampleExport()];

    const review = createLabEvidenceReviewRecord(state, { exportId: "lab-window-evidence-export-ndb-1" }, "platform.admin");

    expect(review).toMatchObject({
      provider: "NDB",
      exportId: "lab-window-evidence-export-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(review.decisions).toHaveLength(3);
    expect(review.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Reviewer decisions complete", passed: false }),
        expect.objectContaining({ name: "Execution remains disabled", passed: true }),
      ])
    );
  });

  it("accepts review only when all reviewer decisions and evidence are accepted", () => {
    const state = createDefaultState();
    state.labWindowEvidenceExports = [sampleExport()];

    const review = createLabEvidenceReviewRecord(
      state,
      {
        exportId: "lab-window-evidence-export-ndb-1",
        platformOwnerDecision: "Accepted",
        securityReviewerDecision: "Accepted",
        operationsReviewerDecision: "Accepted",
        platformOwnerEvidence: "reviews/platform-owner.md",
        securityReviewerEvidence: "reviews/security.md",
        operationsReviewerEvidence: "reviews/operations.md",
      },
      "platform.admin"
    );

    expect(review.status).toBe("Accepted");
    expect(review.provisioningEnabled).toBe(false);
  });
});

function sampleExport() {
  return {
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
      windowStatus: "Blocked",
      generatedAt: "2026-07-07T00:00:00.000Z",
      scheduledStart: "2026-07-08T10:00:00.000Z",
      scheduledEnd: "2026-07-08T12:00:00.000Z",
      linkedRunbookId: "controlled-lab-runbook-ndb-1",
      linkedReleaseEvidenceExportId: "release-evidence-export-ndb-1",
      linkedLabScopeId: "lab-scope-1",
      rollbackOwner: "cloud.ops",
      emergencyStopContacts: ["platform.owner", "security.reviewer"],
      checkCount: 2,
      passedChecks: 1,
      readinessChecklist: ["Confirm evidence."],
      provisioningEnabled: false,
    },
    redactionBoundary: "metadata only",
    storageBoundary: "external storage required",
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  } as const;
}
