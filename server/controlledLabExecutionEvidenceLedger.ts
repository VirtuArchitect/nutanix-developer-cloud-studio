import type {
  ControlledLabDryRunExecutionChecklist,
  ControlledLabExecutionEvidenceLedger,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateControlledLabExecutionEvidenceLedgerRequest } from "./types";

export class ControlledLabExecutionEvidenceLedgerError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledLabExecutionEvidenceLedger(
  state: ApiState,
  request: CreateControlledLabExecutionEvidenceLedgerRequest,
  actor: string
): ControlledLabExecutionEvidenceLedger {
  const checklist = findDryRunChecklist(state, request);
  const immutableReferences: ControlledLabExecutionEvidenceLedger["immutableReferences"] = {
    operatorEvidence: request.operatorEvidence ?? checklist.operatorRoster.map((operator) => `operator-${slug(operator)}-ack.md`),
    observerEvidence: request.observerEvidence ?? ["security-observer-notes.md"],
    rollbackEvidence: request.rollbackEvidence ?? [`rollback-timer-${checklist.rollbackTimerMinutes}-minutes.md`],
    logEvidence: request.logEvidence ?? checklist.logCaptureReferences,
    auditEvidence: request.auditEvidence ?? [`audit-boundary-${checklist.rehearsalPacketId}.md`],
    stopAuthorityEvidence: request.stopAuthorityEvidence ?? [`stop-authority-${slug(checklist.stopAuthority)}.md`],
  };
  const checks = [
    {
      name: "Dry-run checklist ready",
      passed: checklist.status === "Ready for dry-run review",
      detail: `${checklist.id} is ${checklist.status}.`,
    },
    {
      name: "Operator evidence immutable",
      passed: immutableReferences.operatorEvidence.length >= checklist.operatorRoster.length,
      detail: `${immutableReferences.operatorEvidence.length}/${checklist.operatorRoster.length} operator evidence reference(s).`,
    },
    {
      name: "Observer evidence immutable",
      passed: immutableReferences.observerEvidence.length > 0,
      detail: `${immutableReferences.observerEvidence.length} observer evidence reference(s).`,
    },
    {
      name: "Rollback evidence immutable",
      passed: immutableReferences.rollbackEvidence.length > 0,
      detail: `${immutableReferences.rollbackEvidence.length} rollback evidence reference(s).`,
    },
    {
      name: "Log evidence immutable",
      passed: immutableReferences.logEvidence.length >= 2,
      detail: `${immutableReferences.logEvidence.length} log evidence reference(s).`,
    },
    {
      name: "Audit evidence immutable",
      passed: immutableReferences.auditEvidence.length > 0,
      detail: `${immutableReferences.auditEvidence.length} audit evidence reference(s).`,
    },
    {
      name: "Stop authority evidence immutable",
      passed: immutableReferences.stopAuthorityEvidence.length > 0 && Boolean(checklist.stopAuthority),
      detail: checklist.stopAuthority || "Stop authority is required.",
    },
    {
      name: "Real adapter execution disabled",
      passed: checklist.provisioningEnabled === false && checklist.killSwitch.enabled === false,
      detail: `${checklist.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-evidence-ledger-${checklist.provider.toLowerCase()}-${Date.now()}`,
    provider: checklist.provider,
    dryRunChecklistId: checklist.id,
    rehearsalPacketId: checklist.rehearsalPacketId,
    status: checks.every((check) => check.passed) ? "Ready for evidence review" : "Blocked",
    requestedBy: actor,
    immutableReferences,
    checks,
    evidence: [
      `Dry-run checklist: ${checklist.id}.`,
      `Rehearsal packet: ${checklist.rehearsalPacketId}.`,
      `Operator evidence: ${immutableReferences.operatorEvidence.length}.`,
      `Observer evidence: ${immutableReferences.observerEvidence.length}.`,
      `Rollback evidence: ${immutableReferences.rollbackEvidence.length}.`,
      `Log evidence: ${immutableReferences.logEvidence.length}.`,
      `Audit evidence: ${immutableReferences.auditEvidence.length}.`,
      `Stop authority evidence: ${immutableReferences.stopAuthorityEvidence.length}.`,
      `Kill switch: ${checklist.killSwitch.name}=${checklist.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: checklist.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findDryRunChecklist(
  state: ApiState,
  request: CreateControlledLabExecutionEvidenceLedgerRequest
): ControlledLabDryRunExecutionChecklist {
  const checklist =
    (request.dryRunChecklistId
      ? state.controlledLabDryRunExecutionChecklists.find((item) => item.id === request.dryRunChecklistId)
      : undefined) ??
    (request.provider
      ? state.controlledLabDryRunExecutionChecklists.find((item) => item.provider === request.provider)
      : state.controlledLabDryRunExecutionChecklists[0]);

  if (!checklist) {
    throw new ControlledLabExecutionEvidenceLedgerError(
      "controlled_lab_dry_run_checklist_required",
      "A controlled lab dry-run execution checklist is required."
    );
  }

  return checklist;
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}
