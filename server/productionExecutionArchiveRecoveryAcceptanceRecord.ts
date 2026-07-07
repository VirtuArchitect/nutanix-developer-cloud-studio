import type {
  ProductionExecutionArchiveRecoveryAcceptanceRecord,
  ProductionExecutionArchiveRecoveryDrillRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRecoveryAcceptanceRecordRequest } from "./types";

export class ProductionExecutionArchiveRecoveryAcceptanceRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryAcceptanceRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryAcceptanceRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryAcceptanceRecord {
  const archiveRecoveryDrillRecord = findArchiveRecoveryDrillRecord(state, request);
  const providerSlug = archiveRecoveryDrillRecord.provider.toLowerCase();
  const acceptanceOwner = request.acceptanceOwner?.trim() ?? "Production Archive Recovery Acceptance Owner";
  const recoveryEvidencePacketReference =
    request.recoveryEvidencePacketReference?.trim() ?? `production-archive-recovery-evidence-packet-${providerSlug}.md`;
  const rtoRpoVarianceReviewReference =
    request.rtoRpoVarianceReviewReference?.trim() ?? `production-archive-rto-rpo-variance-review-${providerSlug}.md`;
  const residualRecoveryRiskRegisterReference =
    request.residualRecoveryRiskRegisterReference?.trim() ?? `production-archive-residual-recovery-risk-register-${providerSlug}.md`;
  const acceptanceSignOffReference =
    request.acceptanceSignOffReference?.trim() ?? `production-archive-recovery-acceptance-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Archive recovery drill ready",
      passed:
        archiveRecoveryDrillRecord.status ===
        "Ready for production execution archive recovery drill review",
      detail: `${archiveRecoveryDrillRecord.id} is ${archiveRecoveryDrillRecord.status}.`,
    },
    {
      name: "Acceptance owner assigned",
      passed: Boolean(acceptanceOwner),
      detail: acceptanceOwner || "Acceptance owner is required.",
    },
    {
      name: "Recovery evidence packet linked",
      passed: Boolean(recoveryEvidencePacketReference),
      detail: recoveryEvidencePacketReference || "Recovery evidence packet reference is required.",
    },
    {
      name: "RTO/RPO variance review linked",
      passed: Boolean(rtoRpoVarianceReviewReference),
      detail: rtoRpoVarianceReviewReference || "RTO/RPO variance review reference is required.",
    },
    {
      name: "Residual recovery risk register linked",
      passed: Boolean(residualRecoveryRiskRegisterReference),
      detail: residualRecoveryRiskRegisterReference || "Residual recovery risk register reference is required.",
    },
    {
      name: "Acceptance sign-off linked",
      passed: Boolean(acceptanceSignOffReference),
      detail: acceptanceSignOffReference || "Acceptance sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        archiveRecoveryDrillRecord.provisioningEnabled === false &&
        archiveRecoveryDrillRecord.killSwitch.enabled === false,
      detail: `${archiveRecoveryDrillRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-acceptance-record-${providerSlug}-${Date.now()}`,
    provider: archiveRecoveryDrillRecord.provider,
    archiveRecoveryDrillRecordId: archiveRecoveryDrillRecord.id,
    archiveRetrievalValidationRecordId: archiveRecoveryDrillRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: archiveRecoveryDrillRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: archiveRecoveryDrillRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: archiveRecoveryDrillRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: archiveRecoveryDrillRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: archiveRecoveryDrillRecord.operationalClosureRecordId,
    finalTurnoverRecordId: archiveRecoveryDrillRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: archiveRecoveryDrillRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: archiveRecoveryDrillRecord.supportReadinessRecordId,
    operationsHandoverRecordId: archiveRecoveryDrillRecord.operationsHandoverRecordId,
    completionDossierRecordId: archiveRecoveryDrillRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: archiveRecoveryDrillRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: archiveRecoveryDrillRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: archiveRecoveryDrillRecord.archivalHandoffRecordId,
    closurePacketRecordId: archiveRecoveryDrillRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archiveRecoveryDrillRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archiveRecoveryDrillRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archiveRecoveryDrillRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archiveRecoveryDrillRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archiveRecoveryDrillRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archiveRecoveryDrillRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archiveRecoveryDrillRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archiveRecoveryDrillRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archiveRecoveryDrillRecord.implementationHoldRecordId,
    cabDecisionRecordId: archiveRecoveryDrillRecord.cabDecisionRecordId,
    cabHandoffPacketId: archiveRecoveryDrillRecord.cabHandoffPacketId,
    freezeRecordId: archiveRecoveryDrillRecord.freezeRecordId,
    authorizationPacketId: archiveRecoveryDrillRecord.authorizationPacketId,
    promotionDossierId: archiveRecoveryDrillRecord.promotionDossierId,
    closurePackageId: archiveRecoveryDrillRecord.closurePackageId,
    outcomeRecordId: archiveRecoveryDrillRecord.outcomeRecordId,
    handoffPackageId: archiveRecoveryDrillRecord.handoffPackageId,
    controlledSwitchRequestId: archiveRecoveryDrillRecord.controlledSwitchRequestId,
    auditPackageId: archiveRecoveryDrillRecord.auditPackageId,
    switchReviewId: archiveRecoveryDrillRecord.switchReviewId,
    activationId: archiveRecoveryDrillRecord.activationId,
    idempotencyKey: archiveRecoveryDrillRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery acceptance review"
      : "Blocked",
    requestedBy: actor,
    acceptanceOwner,
    recoveryEvidencePacketReference,
    rtoRpoVarianceReviewReference,
    residualRecoveryRiskRegisterReference,
    acceptanceSignOffReference,
    checks,
    evidence: [
      `Archive recovery drill record: ${archiveRecoveryDrillRecord.id}.`,
      `Archive retrieval validation record: ${archiveRecoveryDrillRecord.archiveRetrievalValidationRecordId}.`,
      `Acceptance owner: ${acceptanceOwner || "missing"}.`,
      `Recovery evidence packet: ${recoveryEvidencePacketReference || "missing"}.`,
      `RTO/RPO variance review: ${rtoRpoVarianceReviewReference || "missing"}.`,
      `Residual recovery risk register: ${residualRecoveryRiskRegisterReference || "missing"}.`,
      `Acceptance sign-off: ${acceptanceSignOffReference || "missing"}.`,
      `Kill switch: ${archiveRecoveryDrillRecord.killSwitch.name}=${
        archiveRecoveryDrillRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archiveRecoveryDrillRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findArchiveRecoveryDrillRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryAcceptanceRecordRequest
): ProductionExecutionArchiveRecoveryDrillRecord {
  const archiveRecoveryDrillRecord =
    (request.archiveRecoveryDrillRecordId
      ? state.productionExecutionArchiveRecoveryDrillRecords.find(
          (item) => item.id === request.archiveRecoveryDrillRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryDrillRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionArchiveRecoveryDrillRecords[0]);

  if (!archiveRecoveryDrillRecord) {
    throw new ProductionExecutionArchiveRecoveryAcceptanceRecordError(
      "production_execution_archive_recovery_drill_record_required",
      "A production execution archive recovery drill record is required."
    );
  }

  return archiveRecoveryDrillRecord;
}
