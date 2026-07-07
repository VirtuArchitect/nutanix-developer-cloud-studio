import type {
  ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord,
  ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordRequest } from "./types";

export class ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord {
  const finalComplianceArchiveRecord = findFinalComplianceArchiveRecord(state, request);
  const providerSlug = finalComplianceArchiveRecord.provider.toLowerCase();
  const custodyOwner = request.custodyOwner?.trim() ?? "Production Archive Recovery Evidence Custody Owner";
  const finalCustodyLedgerReference =
    request.finalCustodyLedgerReference?.trim() ??
    `production-archive-recovery-final-custody-ledger-${providerSlug}.json`;
  const evidenceTransferReceiptReference =
    request.evidenceTransferReceiptReference?.trim() ??
    `production-archive-recovery-evidence-transfer-receipt-${providerSlug}.md`;
  const retentionLockConfirmationReference =
    request.retentionLockConfirmationReference?.trim() ??
    `production-archive-recovery-retention-lock-confirmation-${providerSlug}.md`;
  const custodyClosureSignOffReference =
    request.custodyClosureSignOffReference?.trim() ??
    `production-archive-recovery-custody-closure-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Final compliance archive ready",
      passed:
        finalComplianceArchiveRecord.status ===
        "Ready for production execution archive recovery final compliance archive review",
      detail: `${finalComplianceArchiveRecord.id} is ${finalComplianceArchiveRecord.status}.`,
    },
    {
      name: "Custody owner assigned",
      passed: Boolean(custodyOwner),
      detail: custodyOwner || "Custody owner is required.",
    },
    {
      name: "Final custody ledger linked",
      passed: Boolean(finalCustodyLedgerReference),
      detail: finalCustodyLedgerReference || "Final custody ledger reference is required.",
    },
    {
      name: "Evidence transfer receipt linked",
      passed: Boolean(evidenceTransferReceiptReference),
      detail: evidenceTransferReceiptReference || "Evidence transfer receipt reference is required.",
    },
    {
      name: "Retention lock confirmation linked",
      passed: Boolean(retentionLockConfirmationReference),
      detail: retentionLockConfirmationReference || "Retention lock confirmation reference is required.",
    },
    {
      name: "Custody closure sign-off linked",
      passed: Boolean(custodyClosureSignOffReference),
      detail: custodyClosureSignOffReference || "Custody closure sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        finalComplianceArchiveRecord.provisioningEnabled === false &&
        finalComplianceArchiveRecord.killSwitch.enabled === false,
      detail: `${finalComplianceArchiveRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-evidence-custody-closure-record-${providerSlug}-${Date.now()}`,
    provider: finalComplianceArchiveRecord.provider,
    finalComplianceArchiveRecordId: finalComplianceArchiveRecord.id,
    archiveRecoveryAuditCertificationRecordId:
      finalComplianceArchiveRecord.archiveRecoveryAuditCertificationRecordId,
    archiveRecoveryClosureRecordId: finalComplianceArchiveRecord.archiveRecoveryClosureRecordId,
    archiveRecoveryAcceptanceRecordId: finalComplianceArchiveRecord.archiveRecoveryAcceptanceRecordId,
    archiveRecoveryDrillRecordId: finalComplianceArchiveRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: finalComplianceArchiveRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: finalComplianceArchiveRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: finalComplianceArchiveRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: finalComplianceArchiveRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: finalComplianceArchiveRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: finalComplianceArchiveRecord.operationalClosureRecordId,
    finalTurnoverRecordId: finalComplianceArchiveRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: finalComplianceArchiveRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: finalComplianceArchiveRecord.supportReadinessRecordId,
    operationsHandoverRecordId: finalComplianceArchiveRecord.operationsHandoverRecordId,
    completionDossierRecordId: finalComplianceArchiveRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: finalComplianceArchiveRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: finalComplianceArchiveRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: finalComplianceArchiveRecord.archivalHandoffRecordId,
    closurePacketRecordId: finalComplianceArchiveRecord.closurePacketRecordId,
    closureAuthorizationRecordId: finalComplianceArchiveRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: finalComplianceArchiveRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: finalComplianceArchiveRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: finalComplianceArchiveRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: finalComplianceArchiveRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: finalComplianceArchiveRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: finalComplianceArchiveRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: finalComplianceArchiveRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: finalComplianceArchiveRecord.implementationHoldRecordId,
    cabDecisionRecordId: finalComplianceArchiveRecord.cabDecisionRecordId,
    cabHandoffPacketId: finalComplianceArchiveRecord.cabHandoffPacketId,
    freezeRecordId: finalComplianceArchiveRecord.freezeRecordId,
    authorizationPacketId: finalComplianceArchiveRecord.authorizationPacketId,
    promotionDossierId: finalComplianceArchiveRecord.promotionDossierId,
    closurePackageId: finalComplianceArchiveRecord.closurePackageId,
    outcomeRecordId: finalComplianceArchiveRecord.outcomeRecordId,
    handoffPackageId: finalComplianceArchiveRecord.handoffPackageId,
    controlledSwitchRequestId: finalComplianceArchiveRecord.controlledSwitchRequestId,
    auditPackageId: finalComplianceArchiveRecord.auditPackageId,
    switchReviewId: finalComplianceArchiveRecord.switchReviewId,
    activationId: finalComplianceArchiveRecord.activationId,
    idempotencyKey: finalComplianceArchiveRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery evidence custody closure review"
      : "Blocked",
    requestedBy: actor,
    custodyOwner,
    finalCustodyLedgerReference,
    evidenceTransferReceiptReference,
    retentionLockConfirmationReference,
    custodyClosureSignOffReference,
    checks,
    evidence: [
      `Final compliance archive record: ${finalComplianceArchiveRecord.id}.`,
      `Archive recovery audit certification record: ${finalComplianceArchiveRecord.archiveRecoveryAuditCertificationRecordId}.`,
      `Custody owner: ${custodyOwner || "missing"}.`,
      `Final custody ledger: ${finalCustodyLedgerReference || "missing"}.`,
      `Evidence transfer receipt: ${evidenceTransferReceiptReference || "missing"}.`,
      `Retention lock confirmation: ${retentionLockConfirmationReference || "missing"}.`,
      `Custody closure sign-off: ${custodyClosureSignOffReference || "missing"}.`,
      `Kill switch: ${finalComplianceArchiveRecord.killSwitch.name}=${
        finalComplianceArchiveRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: finalComplianceArchiveRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findFinalComplianceArchiveRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordRequest
): ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord {
  const finalComplianceArchiveRecord =
    (request.finalComplianceArchiveRecordId
      ? state.productionExecutionArchiveRecoveryFinalComplianceArchiveRecords.find(
          (item) => item.id === request.finalComplianceArchiveRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryFinalComplianceArchiveRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionArchiveRecoveryFinalComplianceArchiveRecords[0]);

  if (!finalComplianceArchiveRecord) {
    throw new ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordError(
      "production_execution_archive_recovery_final_compliance_archive_record_required",
      "A production execution archive recovery final compliance archive record is required."
    );
  }

  return finalComplianceArchiveRecord;
}
