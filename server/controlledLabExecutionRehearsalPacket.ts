import type {
  ControlledLabExecutionApprovalGate,
  ControlledLabExecutionRehearsalPacket,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateControlledLabExecutionRehearsalPacketRequest } from "./types";

export class ControlledLabExecutionRehearsalPacketError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledLabExecutionRehearsalPacket(
  state: ApiState,
  request: CreateControlledLabExecutionRehearsalPacketRequest,
  actor: string
): ControlledLabExecutionRehearsalPacket {
  const approvalGate = findApprovalGate(state, request);
  const proposalExport = state.labExecutionProposalExports.find((item) => item.id === approvalGate.proposalExportId);
  const envelope = state.labExecutionProposalEnvelopes.find((item) => item.id === approvalGate.envelopeId);
  const window = envelope
    ? state.controlledLabDryRunWindows.find((item) => item.id === envelope.windowId)
    : undefined;
  const runbook = window?.linkedRunbookId
    ? state.controlledLabReleaseRunbooks.find((item) => item.id === window.linkedRunbookId)
    : undefined;
  const auditExportIds = state.auditExports.map((item) => item.id);
  const approvalEvidence = approvalGate.decisions.map((decision) => `${decision.role}: ${decision.evidence}`);
  const frozenReferences: ControlledLabExecutionRehearsalPacket["frozenReferences"] = {
    runbookId: runbook?.id ?? window?.linkedRunbookId,
    rollbackOwner: window?.rollbackOwner ?? proposalExport?.manifest.rollbackOwner ?? "",
    emergencyStopContacts: window?.emergencyStopContacts ?? proposalExport?.manifest.emergencyStopContacts ?? [],
    stopConditions: runbook?.stopConditions ?? [],
    proposalExportId: approvalGate.proposalExportId,
    auditExportIds,
    approvalEvidence,
  };
  const checks = [
    {
      name: "Execution approval gate approved",
      passed: approvalGate.status === "Approved for controlled lab execution review",
      detail: `${approvalGate.id} is ${approvalGate.status}.`,
    },
    {
      name: "Proposal export frozen",
      passed: Boolean(proposalExport),
      detail: proposalExport ? `${proposalExport.id} is frozen.` : "Proposal export is required.",
    },
    {
      name: "Execution envelope frozen",
      passed: Boolean(envelope),
      detail: envelope ? `${envelope.id} is frozen.` : "Execution proposal envelope is required.",
    },
    {
      name: "Runbook frozen",
      passed: Boolean(frozenReferences.runbookId && runbook),
      detail: runbook ? `${runbook.id} stop conditions frozen.` : "Controlled lab release runbook is required.",
    },
    {
      name: "Rollback owner frozen",
      passed: Boolean(frozenReferences.rollbackOwner),
      detail: frozenReferences.rollbackOwner || "Rollback owner is required.",
    },
    {
      name: "Emergency contacts frozen",
      passed: frozenReferences.emergencyStopContacts.length >= 2,
      detail: `${frozenReferences.emergencyStopContacts.length} emergency stop contact(s) frozen.`,
    },
    {
      name: "Stop conditions frozen",
      passed: frozenReferences.stopConditions.length >= 3,
      detail: `${frozenReferences.stopConditions.length} stop condition(s) frozen.`,
    },
    {
      name: "Audit export frozen",
      passed: frozenReferences.auditExportIds.length > 0,
      detail:
        frozenReferences.auditExportIds.length > 0
          ? `${frozenReferences.auditExportIds.length} audit export(s) frozen.`
          : "Audit export evidence is required.",
    },
    {
      name: "Approval evidence frozen",
      passed:
        approvalGate.decisions.length >= 5 &&
        approvalGate.decisions.every((decision) => decision.decision === "Accepted" && !/required/i.test(decision.evidence)),
      detail: `${approvalGate.decisions.filter((decision) => decision.decision === "Accepted").length}/${approvalGate.decisions.length} accepted decisions frozen.`,
    },
    {
      name: "Real adapter execution disabled",
      passed: approvalGate.provisioningEnabled === false && approvalGate.killSwitch.enabled === false,
      detail: `${approvalGate.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-rehearsal-packet-${approvalGate.provider.toLowerCase()}-${Date.now()}`,
    provider: approvalGate.provider,
    approvalGateId: approvalGate.id,
    proposalExportId: approvalGate.proposalExportId,
    envelopeId: approvalGate.envelopeId,
    status: checks.every((check) => check.passed) ? "Ready for rehearsal review" : "Blocked",
    requestedBy: actor,
    frozenReferences,
    checks,
    evidence: [
      `Approval gate: ${approvalGate.id}.`,
      `Proposal export: ${approvalGate.proposalExportId}.`,
      `Proposal envelope: ${approvalGate.envelopeId}.`,
      `Runbook: ${frozenReferences.runbookId ?? "missing"}.`,
      `Audit exports: ${frozenReferences.auditExportIds.length}.`,
      `Kill switch: ${approvalGate.killSwitch.name}=${approvalGate.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: approvalGate.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findApprovalGate(
  state: ApiState,
  request: CreateControlledLabExecutionRehearsalPacketRequest
): ControlledLabExecutionApprovalGate {
  const approvalGate =
    (request.approvalGateId
      ? state.controlledLabExecutionApprovals.find((item) => item.id === request.approvalGateId)
      : undefined) ??
    (request.provider
      ? state.controlledLabExecutionApprovals.find((item) => item.provider === request.provider)
      : state.controlledLabExecutionApprovals[0]);

  if (!approvalGate) {
    throw new ControlledLabExecutionRehearsalPacketError(
      "controlled_lab_execution_approval_required",
      "A controlled lab execution approval gate is required."
    );
  }

  return approvalGate;
}
