import type {
  ProductionExecutionArchiveRecoveryAcceptanceRecord,
  ProductionExecutionArchiveRecoveryClosureRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRecoveryClosureRecordRequest } from "./types";

export class ProductionExecutionArchiveRecoveryClosureRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryClosureRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryClosureRecord {
  const archiveRecoveryAcceptanceRecord = findArchiveRecoveryAcceptanceRecord(state, request);
  const providerSlug = archiveRecoveryAcceptanceRecord.provider.toLowerCase();
  const closureOwner = request.closureOwner?.trim() ?? "Production Archive Recovery Closure Owner";
  const recoveryClosurePacketReference =
    request.recoveryClosurePacketReference?.trim() ?? `production-archive-recovery-closure-packet-${providerSlug}.md`;
  const followUpActionRegisterReference =
    request.followUpActionRegisterReference?.trim() ?? `production-archive-recovery-follow-up-actions-${providerSlug}.md`;
  const stakeholderClosureNoticeReference =
    request.stakeholderClosureNoticeReference?.trim() ?? `production-archive-recovery-stakeholder-closure-notice-${providerSlug}.md`;
  const archiveRecoveryClosureSignOffReference =
    request.archiveRecoveryClosureSignOffReference?.trim() ?? `production-archive-recovery-closure-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Archive recovery acceptance ready",
      passed:
        archiveRecoveryAcceptanceRecord.status ===
        "Ready for production execution archive recovery acceptance review",
      detail: `${archiveRecoveryAcceptanceRecord.id} is ${archiveRecoveryAcceptanceRecord.status}.`,
    },
    {
      name: "Closure owner assigned",
      passed: Boolean(closureOwner),
      detail: closureOwner || "Closure owner is required.",
    },
    {
      name: "Recovery closure packet linked",
      passed: Boolean(recoveryClosurePacketReference),
      detail: recoveryClosurePacketReference || "Recovery closure packet reference is required.",
    },
    {
      name: "Follow-up action register linked",
      passed: Boolean(followUpActionRegisterReference),
      detail: followUpActionRegisterReference || "Follow-up action register reference is required.",
    },
    {
      name: "Stakeholder closure notice linked",
      passed: Boolean(stakeholderClosureNoticeReference),
      detail: stakeholderClosureNoticeReference || "Stakeholder closure notice reference is required.",
    },
    {
      name: "Archive recovery closure sign-off linked",
      passed: Boolean(archiveRecoveryClosureSignOffReference),
      detail: archiveRecoveryClosureSignOffReference || "Archive recovery closure sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        archiveRecoveryAcceptanceRecord.provisioningEnabled === false &&
        archiveRecoveryAcceptanceRecord.killSwitch.enabled === false,
      detail: `${archiveRecoveryAcceptanceRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-closure-record-${providerSlug}-${Date.now()}`,
    provider: archiveRecoveryAcceptanceRecord.provider,
    archiveRecoveryAcceptanceRecordId: archiveRecoveryAcceptanceRecord.id,
    archiveRecoveryDrillRecordId: archiveRecoveryAcceptanceRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: archiveRecoveryAcceptanceRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: archiveRecoveryAcceptanceRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: archiveRecoveryAcceptanceRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: archiveRecoveryAcceptanceRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: archiveRecoveryAcceptanceRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: archiveRecoveryAcceptanceRecord.operationalClosureRecordId,
    finalTurnoverRecordId: archiveRecoveryAcceptanceRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: archiveRecoveryAcceptanceRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: archiveRecoveryAcceptanceRecord.supportReadinessRecordId,
    operationsHandoverRecordId: archiveRecoveryAcceptanceRecord.operationsHandoverRecordId,
    completionDossierRecordId: archiveRecoveryAcceptanceRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: archiveRecoveryAcceptanceRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: archiveRecoveryAcceptanceRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: archiveRecoveryAcceptanceRecord.archivalHandoffRecordId,
    closurePacketRecordId: archiveRecoveryAcceptanceRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archiveRecoveryAcceptanceRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archiveRecoveryAcceptanceRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archiveRecoveryAcceptanceRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archiveRecoveryAcceptanceRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archiveRecoveryAcceptanceRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archiveRecoveryAcceptanceRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archiveRecoveryAcceptanceRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archiveRecoveryAcceptanceRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archiveRecoveryAcceptanceRecord.implementationHoldRecordId,
    cabDecisionRecordId: archiveRecoveryAcceptanceRecord.cabDecisionRecordId,
    cabHandoffPacketId: archiveRecoveryAcceptanceRecord.cabHandoffPacketId,
    freezeRecordId: archiveRecoveryAcceptanceRecord.freezeRecordId,
    authorizationPacketId: archiveRecoveryAcceptanceRecord.authorizationPacketId,
    promotionDossierId: archiveRecoveryAcceptanceRecord.promotionDossierId,
    closurePackageId: archiveRecoveryAcceptanceRecord.closurePackageId,
    outcomeRecordId: archiveRecoveryAcceptanceRecord.outcomeRecordId,
    handoffPackageId: archiveRecoveryAcceptanceRecord.handoffPackageId,
    controlledSwitchRequestId: archiveRecoveryAcceptanceRecord.controlledSwitchRequestId,
    auditPackageId: archiveRecoveryAcceptanceRecord.auditPackageId,
    switchReviewId: archiveRecoveryAcceptanceRecord.switchReviewId,
    activationId: archiveRecoveryAcceptanceRecord.activationId,
    idempotencyKey: archiveRecoveryAcceptanceRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery closure review"
      : "Blocked",
    requestedBy: actor,
    closureOwner,
    recoveryClosurePacketReference,
    followUpActionRegisterReference,
    stakeholderClosureNoticeReference,
    archiveRecoveryClosureSignOffReference,
    checks,
    evidence: [
      `Archive recovery acceptance record: ${archiveRecoveryAcceptanceRecord.id}.`,
      `Archive recovery drill record: ${archiveRecoveryAcceptanceRecord.archiveRecoveryDrillRecordId}.`,
      `Closure owner: ${closureOwner || "missing"}.`,
      `Recovery closure packet: ${recoveryClosurePacketReference || "missing"}.`,
      `Follow-up action register: ${followUpActionRegisterReference || "missing"}.`,
      `Stakeholder closure notice: ${stakeholderClosureNoticeReference || "missing"}.`,
      `Archive recovery closure sign-off: ${archiveRecoveryClosureSignOffReference || "missing"}.`,
      `Kill switch: ${archiveRecoveryAcceptanceRecord.killSwitch.name}=${
        archiveRecoveryAcceptanceRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archiveRecoveryAcceptanceRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findArchiveRecoveryAcceptanceRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryClosureRecordRequest
): ProductionExecutionArchiveRecoveryAcceptanceRecord {
  const archiveRecoveryAcceptanceRecord =
    (request.archiveRecoveryAcceptanceRecordId
      ? state.productionExecutionArchiveRecoveryAcceptanceRecords.find(
          (item) => item.id === request.archiveRecoveryAcceptanceRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryAcceptanceRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionArchiveRecoveryAcceptanceRecords[0]);

  if (!archiveRecoveryAcceptanceRecord) {
    throw new ProductionExecutionArchiveRecoveryClosureRecordError(
      "production_execution_archive_recovery_acceptance_record_required",
      "A production execution archive recovery acceptance record is required."
    );
  }

  return archiveRecoveryAcceptanceRecord;
}
