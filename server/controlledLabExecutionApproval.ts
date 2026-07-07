import type { ControlledLabExecutionApprovalGate, LabExecutionProposalExportRecord } from "../src/data/cloudStudioDomain";
import type { ApiState, CreateControlledLabExecutionApprovalGateRequest } from "./types";

export class ControlledLabExecutionApprovalError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledLabExecutionApprovalGate(
  state: ApiState,
  request: CreateControlledLabExecutionApprovalGateRequest,
  actor: string
): ControlledLabExecutionApprovalGate {
  const proposalExport = findProposalExport(state, request);
  const decisions: ControlledLabExecutionApprovalGate["decisions"] = [
    {
      role: "Platform owner",
      reviewer: "Cloud Platform Owner",
      decision: request.platformOwnerDecision ?? "Pending",
      evidence: request.platformOwnerEvidence ?? "Platform owner execution approval evidence required.",
    },
    {
      role: "Security reviewer",
      reviewer: "Security Reviewer",
      decision: request.securityReviewerDecision ?? "Pending",
      evidence: request.securityReviewerEvidence ?? "Security execution approval evidence required.",
    },
    {
      role: "Lab owner",
      reviewer: "Lab Owner",
      decision: request.labOwnerDecision ?? "Pending",
      evidence: request.labOwnerEvidence ?? "Lab owner execution approval evidence required.",
    },
    {
      role: "Rollback owner",
      reviewer: proposalExport.manifest.rollbackOwner || "Rollback Owner",
      decision: request.rollbackOwnerDecision ?? "Pending",
      evidence: request.rollbackOwnerEvidence ?? "Rollback owner standby evidence required.",
    },
    {
      role: "Executive sponsor",
      reviewer: "Executive Sponsor",
      decision: request.executiveSponsorDecision ?? "Pending",
      evidence: request.executiveSponsorEvidence ?? "Executive sponsor approval evidence required.",
    },
  ];
  const acceptedDecisions = decisions.filter((decision) => decision.decision === "Accepted").length;
  const rejectedDecisions = decisions.filter((decision) => decision.decision === "Rejected").length;
  const evidenceComplete = decisions.filter((decision) => isEvidenceComplete(decision.evidence)).length;
  const checks = [
    {
      name: "Proposal export linked",
      passed: true,
      detail: `${proposalExport.id} is linked.`,
    },
    {
      name: "Proposal envelope ready",
      passed: proposalExport.manifest.envelopeStatus === "Ready for proposal review",
      detail: `${proposalExport.manifest.envelopeId} is ${proposalExport.manifest.envelopeStatus}.`,
    },
    {
      name: "All approvers accepted",
      passed: acceptedDecisions === decisions.length && rejectedDecisions === 0,
      detail: `${acceptedDecisions}/${decisions.length} approvals accepted; ${rejectedDecisions} rejected.`,
    },
    {
      name: "Approval evidence complete",
      passed: evidenceComplete === decisions.length,
      detail: `${evidenceComplete}/${decisions.length} evidence references recorded.`,
    },
    {
      name: "Emergency contacts exported",
      passed: proposalExport.manifest.emergencyStopContacts.length >= 2,
      detail: `${proposalExport.manifest.emergencyStopContacts.length} emergency stop contact(s) exported.`,
    },
    {
      name: "Real adapter execution disabled",
      passed: proposalExport.provisioningEnabled === false && proposalExport.manifest.killSwitch.enabled === false,
      detail: `${proposalExport.manifest.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-execution-approval-${proposalExport.provider.toLowerCase()}-${Date.now()}`,
    provider: proposalExport.provider,
    proposalExportId: proposalExport.id,
    envelopeId: proposalExport.envelopeId,
    status: checks.every((check) => check.passed) ? "Approved for controlled lab execution review" : "Blocked",
    requestedBy: actor,
    decisions,
    checks,
    evidence: [
      `Proposal export: ${proposalExport.id}.`,
      `Proposal envelope: ${proposalExport.envelopeId}.`,
      `Review: ${proposalExport.manifest.reviewId}.`,
      `Window: ${proposalExport.manifest.windowId}.`,
      `Rollback owner: ${proposalExport.manifest.rollbackOwner || "missing"}.`,
      `Kill switch: ${proposalExport.manifest.killSwitch.name}=${proposalExport.manifest.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: proposalExport.manifest.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findProposalExport(
  state: ApiState,
  request: CreateControlledLabExecutionApprovalGateRequest
): LabExecutionProposalExportRecord {
  const proposalExport =
    (request.proposalExportId
      ? state.labExecutionProposalExports.find((item) => item.id === request.proposalExportId)
      : undefined) ??
    (request.provider
      ? state.labExecutionProposalExports.find((item) => item.provider === request.provider)
      : state.labExecutionProposalExports[0]);

  if (!proposalExport) {
    throw new ControlledLabExecutionApprovalError(
      "lab_execution_proposal_export_required",
      "A lab execution proposal export is required."
    );
  }

  return proposalExport;
}

function isEvidenceComplete(evidence: string) {
  return !/required/i.test(evidence) && evidence.trim().length > 0;
}
