import type {
  ProductionExecutionFinalAcceptanceArchiveRecord,
  ProductionExecutionReadinessArchiveHandoffRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionReadinessArchiveHandoffRecordRequest } from "./types";

export class ProductionExecutionReadinessArchiveHandoffRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionReadinessArchiveHandoffRecord(
  state: ApiState,
  request: CreateProductionExecutionReadinessArchiveHandoffRecordRequest,
  actor: string
): ProductionExecutionReadinessArchiveHandoffRecord {
  const finalAcceptanceArchiveRecord = findFinalAcceptanceArchiveRecord(state, request);
  const providerSlug = finalAcceptanceArchiveRecord.provider.toLowerCase();
  const handoffOwner = request.handoffOwner?.trim() ?? "Production Archive Handoff Owner";
  const archiveRepositoryReference =
    request.archiveRepositoryReference?.trim() ?? `production-readiness-archive-repository-${providerSlug}.md`;
  const retrievalRunbookReference =
    request.retrievalRunbookReference?.trim() ?? `production-readiness-retrieval-runbook-${providerSlug}.md`;
  const archiveAccessReviewReference =
    request.archiveAccessReviewReference?.trim() ?? `production-readiness-archive-access-review-${providerSlug}.md`;
  const archiveCustodyReceiptReference =
    request.archiveCustodyReceiptReference?.trim() ?? `production-readiness-archive-custody-receipt-${providerSlug}.md`;

  const checks = [
    {
      name: "Final acceptance archive ready",
      passed:
        finalAcceptanceArchiveRecord.status ===
        "Ready for production execution final acceptance archive review",
      detail: `${finalAcceptanceArchiveRecord.id} is ${finalAcceptanceArchiveRecord.status}.`,
    },
    {
      name: "Handoff owner assigned",
      passed: Boolean(handoffOwner),
      detail: handoffOwner || "Handoff owner is required.",
    },
    {
      name: "Archive repository linked",
      passed: Boolean(archiveRepositoryReference),
      detail: archiveRepositoryReference || "Archive repository reference is required.",
    },
    {
      name: "Retrieval runbook linked",
      passed: Boolean(retrievalRunbookReference),
      detail: retrievalRunbookReference || "Retrieval runbook reference is required.",
    },
    {
      name: "Archive access review linked",
      passed: Boolean(archiveAccessReviewReference),
      detail: archiveAccessReviewReference || "Archive access review reference is required.",
    },
    {
      name: "Archive custody receipt linked",
      passed: Boolean(archiveCustodyReceiptReference),
      detail: archiveCustodyReceiptReference || "Archive custody receipt reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        finalAcceptanceArchiveRecord.provisioningEnabled === false &&
        finalAcceptanceArchiveRecord.killSwitch.enabled === false,
      detail: `${finalAcceptanceArchiveRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-readiness-archive-handoff-record-${providerSlug}-${Date.now()}`,
    provider: finalAcceptanceArchiveRecord.provider,
    finalAcceptanceArchiveRecordId: finalAcceptanceArchiveRecord.id,
    improvementClosureRecordId: finalAcceptanceArchiveRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: finalAcceptanceArchiveRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: finalAcceptanceArchiveRecord.operationalClosureRecordId,
    finalTurnoverRecordId: finalAcceptanceArchiveRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: finalAcceptanceArchiveRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: finalAcceptanceArchiveRecord.supportReadinessRecordId,
    operationsHandoverRecordId: finalAcceptanceArchiveRecord.operationsHandoverRecordId,
    completionDossierRecordId: finalAcceptanceArchiveRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: finalAcceptanceArchiveRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: finalAcceptanceArchiveRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: finalAcceptanceArchiveRecord.archivalHandoffRecordId,
    closurePacketRecordId: finalAcceptanceArchiveRecord.closurePacketRecordId,
    closureAuthorizationRecordId: finalAcceptanceArchiveRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: finalAcceptanceArchiveRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: finalAcceptanceArchiveRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: finalAcceptanceArchiveRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: finalAcceptanceArchiveRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: finalAcceptanceArchiveRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: finalAcceptanceArchiveRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: finalAcceptanceArchiveRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: finalAcceptanceArchiveRecord.implementationHoldRecordId,
    cabDecisionRecordId: finalAcceptanceArchiveRecord.cabDecisionRecordId,
    cabHandoffPacketId: finalAcceptanceArchiveRecord.cabHandoffPacketId,
    freezeRecordId: finalAcceptanceArchiveRecord.freezeRecordId,
    authorizationPacketId: finalAcceptanceArchiveRecord.authorizationPacketId,
    promotionDossierId: finalAcceptanceArchiveRecord.promotionDossierId,
    closurePackageId: finalAcceptanceArchiveRecord.closurePackageId,
    outcomeRecordId: finalAcceptanceArchiveRecord.outcomeRecordId,
    handoffPackageId: finalAcceptanceArchiveRecord.handoffPackageId,
    controlledSwitchRequestId: finalAcceptanceArchiveRecord.controlledSwitchRequestId,
    auditPackageId: finalAcceptanceArchiveRecord.auditPackageId,
    switchReviewId: finalAcceptanceArchiveRecord.switchReviewId,
    activationId: finalAcceptanceArchiveRecord.activationId,
    idempotencyKey: finalAcceptanceArchiveRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution readiness archive handoff review"
      : "Blocked",
    requestedBy: actor,
    handoffOwner,
    archiveRepositoryReference,
    retrievalRunbookReference,
    archiveAccessReviewReference,
    archiveCustodyReceiptReference,
    checks,
    evidence: [
      `Final acceptance archive record: ${finalAcceptanceArchiveRecord.id}.`,
      `Improvement closure record: ${finalAcceptanceArchiveRecord.improvementClosureRecordId}.`,
      `Handoff owner: ${handoffOwner || "missing"}.`,
      `Archive repository: ${archiveRepositoryReference || "missing"}.`,
      `Retrieval runbook: ${retrievalRunbookReference || "missing"}.`,
      `Archive access review: ${archiveAccessReviewReference || "missing"}.`,
      `Archive custody receipt: ${archiveCustodyReceiptReference || "missing"}.`,
      `Kill switch: ${finalAcceptanceArchiveRecord.killSwitch.name}=${
        finalAcceptanceArchiveRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: finalAcceptanceArchiveRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findFinalAcceptanceArchiveRecord(
  state: ApiState,
  request: CreateProductionExecutionReadinessArchiveHandoffRecordRequest
): ProductionExecutionFinalAcceptanceArchiveRecord {
  const finalAcceptanceArchiveRecord =
    (request.finalAcceptanceArchiveRecordId
      ? state.productionExecutionFinalAcceptanceArchiveRecords.find(
          (item) => item.id === request.finalAcceptanceArchiveRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionFinalAcceptanceArchiveRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionFinalAcceptanceArchiveRecords[0]);

  if (!finalAcceptanceArchiveRecord) {
    throw new ProductionExecutionReadinessArchiveHandoffRecordError(
      "production_execution_final_acceptance_archive_record_required",
      "A production execution final acceptance archive record is required."
    );
  }

  return finalAcceptanceArchiveRecord;
}
