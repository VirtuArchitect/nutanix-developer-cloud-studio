import type { LabEvidenceReviewRecord, LabExecutionProposalEnvelope } from "../src/data/cloudStudioDomain";
import { createAuditRetentionDiagnostics } from "./privateCloudOperations";
import type { ApiState, CreateLabExecutionProposalEnvelopeRequest } from "./types";

export class LabExecutionProposalEnvelopeError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createLabExecutionProposalEnvelope(
  state: ApiState,
  request: CreateLabExecutionProposalEnvelopeRequest,
  actor: string
): LabExecutionProposalEnvelope {
  const review = findReview(state, request);
  const exportRecord = state.labWindowEvidenceExports.find((item) => item.id === review.exportId);
  const window = state.controlledLabDryRunWindows.find((item) => item.id === review.windowId);
  const runbook = window?.linkedRunbookId
    ? state.controlledLabReleaseRunbooks.find((item) => item.id === window.linkedRunbookId)
    : undefined;
  const labScope = window?.linkedLabScopeId
    ? state.labAuthorizationScopes.find((item) => item.id === window.linkedLabScopeId)
    : undefined;
  const auditRetention = createAuditRetentionDiagnostics(state);
  const auditExportReady = state.auditExports.length > 0 && auditRetention.exportDestination.valid;
  const rollbackOwner = window?.rollbackOwner ?? exportRecord?.manifest.rollbackOwner ?? "";
  const emergencyStopContacts = window?.emergencyStopContacts ?? exportRecord?.manifest.emergencyStopContacts ?? [];
  const killSwitch = {
    name: `NDC_${review.provider}_REAL_ADAPTER_ENABLED`,
    enabled: process.env[`NDC_${review.provider}_REAL_ADAPTER_ENABLED`] === "true",
  };
  const checks = [
    {
      name: "Lab evidence review accepted",
      passed: review.status === "Accepted",
      detail: `${review.id} is ${review.status}.`,
    },
    {
      name: "Window evidence export linked",
      passed: Boolean(exportRecord),
      detail: exportRecord ? `${exportRecord.id} is linked.` : "Lab window evidence export is required.",
    },
    {
      name: "Controlled lab window linked",
      passed: Boolean(window),
      detail: window ? `${window.id} is ${window.status}.` : "Controlled lab dry-run window is required.",
    },
    {
      name: "Controlled release runbook linked",
      passed: Boolean(runbook),
      detail: runbook ? `${runbook.id} is ${runbook.status}.` : "Controlled lab release runbook is required.",
    },
    {
      name: "Approved lab scope linked",
      passed: labScope?.status === "Approved" && labScope.providerCoverage.includes(review.provider),
      detail: labScope ? `${labScope.id} is ${labScope.status}.` : "Approved lab authorization scope is required.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner || "Rollback owner is required.",
    },
    {
      name: "Audit export ready",
      passed: auditExportReady,
      detail: auditExportReady ? "Audit export manifest exists and destination reference is valid." : "Audit export evidence is required.",
    },
    {
      name: "Emergency stop contacts assigned",
      passed: emergencyStopContacts.length >= 2,
      detail: `${emergencyStopContacts.length} emergency stop contact(s) assigned.`,
    },
    {
      name: "Real adapter execution disabled",
      passed: !killSwitch.enabled,
      detail: killSwitch.enabled ? `${killSwitch.name} is enabled.` : `${killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `lab-execution-proposal-${review.provider.toLowerCase()}-${Date.now()}`,
    provider: review.provider,
    reviewId: review.id,
    exportId: review.exportId,
    windowId: review.windowId,
    status: checks.every((check) => check.passed) ? "Ready for proposal review" : "Blocked",
    requestedBy: actor,
    checks,
    evidence: [
      `Review: ${review.id}.`,
      `Window export: ${exportRecord?.id ?? "missing"}.`,
      `Dry-run window: ${window?.id ?? "missing"}.`,
      `Runbook: ${runbook?.id ?? "missing"}.`,
      `Lab scope: ${labScope?.id ?? "missing"}.`,
      `Audit exports prepared: ${state.auditExports.length}.`,
    ],
    rollbackOwner,
    emergencyStopContacts,
    killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findReview(state: ApiState, request: CreateLabExecutionProposalEnvelopeRequest): LabEvidenceReviewRecord {
  const review =
    (request.reviewId ? state.labEvidenceReviews.find((item) => item.id === request.reviewId) : undefined) ??
    (request.provider
      ? state.labEvidenceReviews.find((item) => item.provider === request.provider)
      : state.labEvidenceReviews[0]);

  if (!review) {
    throw new LabExecutionProposalEnvelopeError("lab_evidence_review_required", "An accepted lab evidence review is required.");
  }

  return review;
}
