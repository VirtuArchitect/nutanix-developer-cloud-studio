import type {
  ProductionExecutionArchiveRecoveryAuditCertificationRecord,
  ProductionExecutionArchiveRecoveryClosureRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRecoveryAuditCertificationRecordRequest } from "./types";

export class ProductionExecutionArchiveRecoveryAuditCertificationRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryAuditCertificationRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryAuditCertificationRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryAuditCertificationRecord {
  const archiveRecoveryClosureRecord = findArchiveRecoveryClosureRecord(state, request);
  const providerSlug = archiveRecoveryClosureRecord.provider.toLowerCase();
  const certificationOwner = request.certificationOwner?.trim() ?? "Production Archive Recovery Audit Certification Owner";
  const auditEvidenceManifestReference =
    request.auditEvidenceManifestReference?.trim() ?? `production-archive-recovery-audit-evidence-manifest-${providerSlug}.json`;
  const controlMappingReviewReference =
    request.controlMappingReviewReference?.trim() ?? `production-archive-recovery-control-mapping-review-${providerSlug}.md`;
  const exceptionDispositionReference =
    request.exceptionDispositionReference?.trim() ?? `production-archive-recovery-exception-disposition-${providerSlug}.md`;
  const auditCertificationSignOffReference =
    request.auditCertificationSignOffReference?.trim() ?? `production-archive-recovery-audit-certification-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Archive recovery closure ready",
      passed:
        archiveRecoveryClosureRecord.status ===
        "Ready for production execution archive recovery closure review",
      detail: `${archiveRecoveryClosureRecord.id} is ${archiveRecoveryClosureRecord.status}.`,
    },
    {
      name: "Certification owner assigned",
      passed: Boolean(certificationOwner),
      detail: certificationOwner || "Certification owner is required.",
    },
    {
      name: "Audit evidence manifest linked",
      passed: Boolean(auditEvidenceManifestReference),
      detail: auditEvidenceManifestReference || "Audit evidence manifest reference is required.",
    },
    {
      name: "Control-mapping review linked",
      passed: Boolean(controlMappingReviewReference),
      detail: controlMappingReviewReference || "Control-mapping review reference is required.",
    },
    {
      name: "Exception disposition linked",
      passed: Boolean(exceptionDispositionReference),
      detail: exceptionDispositionReference || "Exception disposition reference is required.",
    },
    {
      name: "Audit certification sign-off linked",
      passed: Boolean(auditCertificationSignOffReference),
      detail: auditCertificationSignOffReference || "Audit certification sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        archiveRecoveryClosureRecord.provisioningEnabled === false &&
        archiveRecoveryClosureRecord.killSwitch.enabled === false,
      detail: `${archiveRecoveryClosureRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-audit-certification-record-${providerSlug}-${Date.now()}`,
    provider: archiveRecoveryClosureRecord.provider,
    archiveRecoveryClosureRecordId: archiveRecoveryClosureRecord.id,
    archiveRecoveryAcceptanceRecordId: archiveRecoveryClosureRecord.archiveRecoveryAcceptanceRecordId,
    archiveRecoveryDrillRecordId: archiveRecoveryClosureRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: archiveRecoveryClosureRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: archiveRecoveryClosureRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: archiveRecoveryClosureRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: archiveRecoveryClosureRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: archiveRecoveryClosureRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: archiveRecoveryClosureRecord.operationalClosureRecordId,
    finalTurnoverRecordId: archiveRecoveryClosureRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: archiveRecoveryClosureRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: archiveRecoveryClosureRecord.supportReadinessRecordId,
    operationsHandoverRecordId: archiveRecoveryClosureRecord.operationsHandoverRecordId,
    completionDossierRecordId: archiveRecoveryClosureRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: archiveRecoveryClosureRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: archiveRecoveryClosureRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: archiveRecoveryClosureRecord.archivalHandoffRecordId,
    closurePacketRecordId: archiveRecoveryClosureRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archiveRecoveryClosureRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archiveRecoveryClosureRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archiveRecoveryClosureRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archiveRecoveryClosureRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archiveRecoveryClosureRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archiveRecoveryClosureRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archiveRecoveryClosureRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archiveRecoveryClosureRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archiveRecoveryClosureRecord.implementationHoldRecordId,
    cabDecisionRecordId: archiveRecoveryClosureRecord.cabDecisionRecordId,
    cabHandoffPacketId: archiveRecoveryClosureRecord.cabHandoffPacketId,
    freezeRecordId: archiveRecoveryClosureRecord.freezeRecordId,
    authorizationPacketId: archiveRecoveryClosureRecord.authorizationPacketId,
    promotionDossierId: archiveRecoveryClosureRecord.promotionDossierId,
    closurePackageId: archiveRecoveryClosureRecord.closurePackageId,
    outcomeRecordId: archiveRecoveryClosureRecord.outcomeRecordId,
    handoffPackageId: archiveRecoveryClosureRecord.handoffPackageId,
    controlledSwitchRequestId: archiveRecoveryClosureRecord.controlledSwitchRequestId,
    auditPackageId: archiveRecoveryClosureRecord.auditPackageId,
    switchReviewId: archiveRecoveryClosureRecord.switchReviewId,
    activationId: archiveRecoveryClosureRecord.activationId,
    idempotencyKey: archiveRecoveryClosureRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery audit certification review"
      : "Blocked",
    requestedBy: actor,
    certificationOwner,
    auditEvidenceManifestReference,
    controlMappingReviewReference,
    exceptionDispositionReference,
    auditCertificationSignOffReference,
    checks,
    evidence: [
      `Archive recovery closure record: ${archiveRecoveryClosureRecord.id}.`,
      `Archive recovery acceptance record: ${archiveRecoveryClosureRecord.archiveRecoveryAcceptanceRecordId}.`,
      `Certification owner: ${certificationOwner || "missing"}.`,
      `Audit evidence manifest: ${auditEvidenceManifestReference || "missing"}.`,
      `Control-mapping review: ${controlMappingReviewReference || "missing"}.`,
      `Exception disposition: ${exceptionDispositionReference || "missing"}.`,
      `Audit certification sign-off: ${auditCertificationSignOffReference || "missing"}.`,
      `Kill switch: ${archiveRecoveryClosureRecord.killSwitch.name}=${
        archiveRecoveryClosureRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archiveRecoveryClosureRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findArchiveRecoveryClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryAuditCertificationRecordRequest
): ProductionExecutionArchiveRecoveryClosureRecord {
  const archiveRecoveryClosureRecord =
    (request.archiveRecoveryClosureRecordId
      ? state.productionExecutionArchiveRecoveryClosureRecords.find(
          (item) => item.id === request.archiveRecoveryClosureRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryClosureRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionArchiveRecoveryClosureRecords[0]);

  if (!archiveRecoveryClosureRecord) {
    throw new ProductionExecutionArchiveRecoveryAuditCertificationRecordError(
      "production_execution_archive_recovery_closure_record_required",
      "A production execution archive recovery closure record is required."
    );
  }

  return archiveRecoveryClosureRecord;
}
