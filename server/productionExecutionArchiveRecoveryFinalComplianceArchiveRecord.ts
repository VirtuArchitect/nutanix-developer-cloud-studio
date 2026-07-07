import type {
  ProductionExecutionArchiveRecoveryAuditCertificationRecord,
  ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordRequest } from "./types";

export class ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord {
  const auditCertificationRecord = findArchiveRecoveryAuditCertificationRecord(state, request);
  const providerSlug = auditCertificationRecord.provider.toLowerCase();
  const complianceArchiveOwner =
    request.complianceArchiveOwner?.trim() ?? "Production Archive Recovery Final Compliance Archive Owner";
  const finalComplianceArchiveIndexReference =
    request.finalComplianceArchiveIndexReference?.trim() ??
    `production-archive-recovery-final-compliance-archive-index-${providerSlug}.json`;
  const evidenceRetentionProofReference =
    request.evidenceRetentionProofReference?.trim() ??
    `production-archive-recovery-final-compliance-retention-proof-${providerSlug}.md`;
  const auditWitnessReceiptReference =
    request.auditWitnessReceiptReference?.trim() ??
    `production-archive-recovery-audit-witness-receipt-${providerSlug}.md`;
  const finalComplianceArchiveSignOffReference =
    request.finalComplianceArchiveSignOffReference?.trim() ??
    `production-archive-recovery-final-compliance-archive-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Archive recovery audit certification ready",
      passed:
        auditCertificationRecord.status ===
        "Ready for production execution archive recovery audit certification review",
      detail: `${auditCertificationRecord.id} is ${auditCertificationRecord.status}.`,
    },
    {
      name: "Compliance archive owner assigned",
      passed: Boolean(complianceArchiveOwner),
      detail: complianceArchiveOwner || "Compliance archive owner is required.",
    },
    {
      name: "Final compliance archive index linked",
      passed: Boolean(finalComplianceArchiveIndexReference),
      detail: finalComplianceArchiveIndexReference || "Final compliance archive index reference is required.",
    },
    {
      name: "Evidence retention proof linked",
      passed: Boolean(evidenceRetentionProofReference),
      detail: evidenceRetentionProofReference || "Evidence retention proof reference is required.",
    },
    {
      name: "Audit witness receipt linked",
      passed: Boolean(auditWitnessReceiptReference),
      detail: auditWitnessReceiptReference || "Audit witness receipt reference is required.",
    },
    {
      name: "Final compliance archive sign-off linked",
      passed: Boolean(finalComplianceArchiveSignOffReference),
      detail: finalComplianceArchiveSignOffReference || "Final compliance archive sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        auditCertificationRecord.provisioningEnabled === false &&
        auditCertificationRecord.killSwitch.enabled === false,
      detail: `${auditCertificationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-final-compliance-archive-record-${providerSlug}-${Date.now()}`,
    provider: auditCertificationRecord.provider,
    archiveRecoveryAuditCertificationRecordId: auditCertificationRecord.id,
    archiveRecoveryClosureRecordId: auditCertificationRecord.archiveRecoveryClosureRecordId,
    archiveRecoveryAcceptanceRecordId: auditCertificationRecord.archiveRecoveryAcceptanceRecordId,
    archiveRecoveryDrillRecordId: auditCertificationRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: auditCertificationRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: auditCertificationRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: auditCertificationRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: auditCertificationRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: auditCertificationRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: auditCertificationRecord.operationalClosureRecordId,
    finalTurnoverRecordId: auditCertificationRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: auditCertificationRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: auditCertificationRecord.supportReadinessRecordId,
    operationsHandoverRecordId: auditCertificationRecord.operationsHandoverRecordId,
    completionDossierRecordId: auditCertificationRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: auditCertificationRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: auditCertificationRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: auditCertificationRecord.archivalHandoffRecordId,
    closurePacketRecordId: auditCertificationRecord.closurePacketRecordId,
    closureAuthorizationRecordId: auditCertificationRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: auditCertificationRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: auditCertificationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: auditCertificationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: auditCertificationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: auditCertificationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: auditCertificationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: auditCertificationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: auditCertificationRecord.implementationHoldRecordId,
    cabDecisionRecordId: auditCertificationRecord.cabDecisionRecordId,
    cabHandoffPacketId: auditCertificationRecord.cabHandoffPacketId,
    freezeRecordId: auditCertificationRecord.freezeRecordId,
    authorizationPacketId: auditCertificationRecord.authorizationPacketId,
    promotionDossierId: auditCertificationRecord.promotionDossierId,
    closurePackageId: auditCertificationRecord.closurePackageId,
    outcomeRecordId: auditCertificationRecord.outcomeRecordId,
    handoffPackageId: auditCertificationRecord.handoffPackageId,
    controlledSwitchRequestId: auditCertificationRecord.controlledSwitchRequestId,
    auditPackageId: auditCertificationRecord.auditPackageId,
    switchReviewId: auditCertificationRecord.switchReviewId,
    activationId: auditCertificationRecord.activationId,
    idempotencyKey: auditCertificationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery final compliance archive review"
      : "Blocked",
    requestedBy: actor,
    complianceArchiveOwner,
    finalComplianceArchiveIndexReference,
    evidenceRetentionProofReference,
    auditWitnessReceiptReference,
    finalComplianceArchiveSignOffReference,
    checks,
    evidence: [
      `Archive recovery audit certification record: ${auditCertificationRecord.id}.`,
      `Archive recovery closure record: ${auditCertificationRecord.archiveRecoveryClosureRecordId}.`,
      `Compliance archive owner: ${complianceArchiveOwner || "missing"}.`,
      `Final compliance archive index: ${finalComplianceArchiveIndexReference || "missing"}.`,
      `Evidence retention proof: ${evidenceRetentionProofReference || "missing"}.`,
      `Audit witness receipt: ${auditWitnessReceiptReference || "missing"}.`,
      `Final compliance archive sign-off: ${finalComplianceArchiveSignOffReference || "missing"}.`,
      `Kill switch: ${auditCertificationRecord.killSwitch.name}=${
        auditCertificationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: auditCertificationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findArchiveRecoveryAuditCertificationRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordRequest
): ProductionExecutionArchiveRecoveryAuditCertificationRecord {
  const auditCertificationRecord =
    (request.archiveRecoveryAuditCertificationRecordId
      ? state.productionExecutionArchiveRecoveryAuditCertificationRecords.find(
          (item) => item.id === request.archiveRecoveryAuditCertificationRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryAuditCertificationRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionArchiveRecoveryAuditCertificationRecords[0]);

  if (!auditCertificationRecord) {
    throw new ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordError(
      "production_execution_archive_recovery_audit_certification_record_required",
      "A production execution archive recovery audit certification record is required."
    );
  }

  return auditCertificationRecord;
}
