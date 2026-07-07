import type { LabEvidenceReviewRecord, LabWindowEvidenceExportRecord } from "../src/data/cloudStudioDomain";
import type { ApiState, CreateLabEvidenceReviewRequest } from "./types";

export class LabEvidenceReviewError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createLabEvidenceReviewRecord(
  state: ApiState,
  request: CreateLabEvidenceReviewRequest,
  actor: string
): LabEvidenceReviewRecord {
  const exportRecord = findExport(state, request);
  const decisions: LabEvidenceReviewRecord["decisions"] = [
    {
      role: "Platform owner",
      reviewer: "Cloud Platform Owner",
      decision: request.platformOwnerDecision ?? "Pending",
      evidence: request.platformOwnerEvidence?.trim() || "Platform owner review evidence required.",
    },
    {
      role: "Security reviewer",
      reviewer: "Security Reviewer",
      decision: request.securityReviewerDecision ?? "Pending",
      evidence: request.securityReviewerEvidence?.trim() || "Security review evidence required.",
    },
    {
      role: "Operations reviewer",
      reviewer: "Cloud Operations",
      decision: request.operationsReviewerDecision ?? "Pending",
      evidence: request.operationsReviewerEvidence?.trim() || "Operations review evidence required.",
    },
  ];
  const rejected = decisions.some((decision) => decision.decision === "Rejected");
  const accepted = decisions.every((decision) => decision.decision === "Accepted");
  const checks = [
    {
      name: "Lab window evidence export linked",
      passed: Boolean(exportRecord),
      detail: `${exportRecord.id} is linked.`,
    },
    {
      name: "Reviewer decisions complete",
      passed: decisions.every((decision) => decision.decision !== "Pending"),
      detail: `${decisions.filter((decision) => decision.decision !== "Pending").length}/${decisions.length} decisions recorded.`,
    },
    {
      name: "Reviewer evidence complete",
      passed: decisions.every((decision) => !decision.evidence.endsWith("required.")),
      detail: `${decisions.filter((decision) => !decision.evidence.endsWith("required.")).length}/${decisions.length} evidence references recorded.`,
    },
    {
      name: "Execution remains disabled",
      passed: exportRecord.provisioningEnabled === false && exportRecord.manifest.provisioningEnabled === false,
      detail: "Lab evidence review does not enable provider execution.",
    },
  ];

  return {
    id: `lab-evidence-review-${exportRecord.provider.toLowerCase()}-${Date.now()}`,
    provider: exportRecord.provider,
    exportId: exportRecord.id,
    windowId: exportRecord.windowId,
    status: rejected ? "Rejected" : accepted && checks.every((check) => check.passed) ? "Accepted" : "Blocked",
    requestedBy: actor,
    decisions,
    checks,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findExport(state: ApiState, request: CreateLabEvidenceReviewRequest): LabWindowEvidenceExportRecord {
  const exportRecord =
    (request.exportId ? state.labWindowEvidenceExports.find((item) => item.id === request.exportId) : undefined) ??
    (request.provider
      ? state.labWindowEvidenceExports.find((item) => item.provider === request.provider)
      : state.labWindowEvidenceExports[0]);

  if (!exportRecord) {
    throw new LabEvidenceReviewError("lab_window_evidence_export_required", "A lab window evidence export is required.");
  }

  return exportRecord;
}
