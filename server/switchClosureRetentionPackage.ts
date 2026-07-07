import type {
  SwitchClosureRetentionPackage,
  SwitchExecutionOutcomeRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateSwitchClosureRetentionPackageRequest } from "./types";

export class SwitchClosureRetentionPackageError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createSwitchClosureRetentionPackage(
  state: ApiState,
  request: CreateSwitchClosureRetentionPackageRequest,
  actor: string
): SwitchClosureRetentionPackage {
  const outcomeRecord = findOutcomeRecord(state, request);
  const closureOwner = request.closureOwner?.trim() ?? "Cloud Operations";
  const retainedEvidenceManifestReference =
    request.retainedEvidenceManifestReference?.trim() ?? `retained-evidence-manifest-${outcomeRecord.provider.toLowerCase()}.json`;
  const lessonsLearnedReference =
    request.lessonsLearnedReference?.trim() ?? `lessons-learned-${outcomeRecord.provider.toLowerCase()}.md`;
  const rollbackTimerClosureReference =
    request.rollbackTimerClosureReference?.trim() ?? `rollback-timer-closure-${outcomeRecord.provider.toLowerCase()}.md`;
  const finalAuditRetentionConfirmation =
    request.finalAuditRetentionConfirmation?.trim() ?? `final-audit-retention-${outcomeRecord.provider.toLowerCase()}.md`;

  const checks = [
    {
      name: "Outcome record ready",
      passed: outcomeRecord.status === "Ready for switch outcome review",
      detail: `${outcomeRecord.id} is ${outcomeRecord.status}.`,
    },
    {
      name: "Closure owner assigned",
      passed: Boolean(closureOwner),
      detail: closureOwner || "Closure owner is required.",
    },
    {
      name: "Retained evidence manifest linked",
      passed: Boolean(retainedEvidenceManifestReference),
      detail: retainedEvidenceManifestReference || "Retained evidence manifest is required.",
    },
    {
      name: "Lessons learned linked",
      passed: Boolean(lessonsLearnedReference),
      detail: lessonsLearnedReference || "Lessons learned reference is required.",
    },
    {
      name: "Rollback timer closure linked",
      passed: Boolean(rollbackTimerClosureReference),
      detail: rollbackTimerClosureReference || "Rollback timer closure reference is required.",
    },
    {
      name: "Final audit retention confirmed",
      passed: Boolean(finalAuditRetentionConfirmation),
      detail: finalAuditRetentionConfirmation || "Final audit retention confirmation is required.",
    },
    {
      name: "Prototype closes evidence only",
      passed: outcomeRecord.provisioningEnabled === false && outcomeRecord.killSwitch.enabled === false,
      detail: `${outcomeRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `switch-closure-retention-package-${outcomeRecord.provider.toLowerCase()}-${Date.now()}`,
    provider: outcomeRecord.provider,
    outcomeRecordId: outcomeRecord.id,
    handoffPackageId: outcomeRecord.handoffPackageId,
    controlledSwitchRequestId: outcomeRecord.controlledSwitchRequestId,
    auditPackageId: outcomeRecord.auditPackageId,
    switchReviewId: outcomeRecord.switchReviewId,
    activationId: outcomeRecord.activationId,
    idempotencyKey: outcomeRecord.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for switch closure review" : "Blocked",
    requestedBy: actor,
    closureOwner,
    retainedEvidenceManifestReference,
    lessonsLearnedReference,
    rollbackTimerClosureReference,
    finalAuditRetentionConfirmation,
    checks,
    evidence: [
      `Outcome record: ${outcomeRecord.id}.`,
      `Handoff package: ${outcomeRecord.handoffPackageId}.`,
      `Closure owner: ${closureOwner || "missing"}.`,
      `Retained evidence manifest: ${retainedEvidenceManifestReference || "missing"}.`,
      `Lessons learned: ${lessonsLearnedReference || "missing"}.`,
      `Rollback timer closure: ${rollbackTimerClosureReference || "missing"}.`,
      `Final audit retention: ${finalAuditRetentionConfirmation || "missing"}.`,
      `Kill switch: ${outcomeRecord.killSwitch.name}=${outcomeRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: outcomeRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findOutcomeRecord(
  state: ApiState,
  request: CreateSwitchClosureRetentionPackageRequest
): SwitchExecutionOutcomeRecord {
  const outcomeRecord =
    (request.outcomeRecordId
      ? state.switchExecutionOutcomeRecords.find((item) => item.id === request.outcomeRecordId)
      : undefined) ??
    (request.provider
      ? state.switchExecutionOutcomeRecords.find((item) => item.provider === request.provider)
      : state.switchExecutionOutcomeRecords[0]);

  if (!outcomeRecord) {
    throw new SwitchClosureRetentionPackageError(
      "switch_outcome_record_required",
      "A switch execution outcome record is required."
    );
  }

  return outcomeRecord;
}
