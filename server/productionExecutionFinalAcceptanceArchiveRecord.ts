import type {
  ProductionExecutionFinalAcceptanceArchiveRecord,
  ProductionExecutionImprovementClosureRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionFinalAcceptanceArchiveRecordRequest } from "./types";

export class ProductionExecutionFinalAcceptanceArchiveRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionFinalAcceptanceArchiveRecord(
  state: ApiState,
  request: CreateProductionExecutionFinalAcceptanceArchiveRecordRequest,
  actor: string
): ProductionExecutionFinalAcceptanceArchiveRecord {
  const improvementClosureRecord = findImprovementClosureRecord(state, request);
  const providerSlug = improvementClosureRecord.provider.toLowerCase();
  const archiveOwner = request.archiveOwner?.trim() ?? "Production Archive Owner";
  const acceptanceArchiveIndexReference =
    request.acceptanceArchiveIndexReference?.trim() ??
    `production-acceptance-archive-index-${providerSlug}.md`;
  const finalEvidenceChecksumReference =
    request.finalEvidenceChecksumReference?.trim() ??
    `production-final-evidence-checksum-${providerSlug}.sha256`;
  const stakeholderReceiptProofReference =
    request.stakeholderReceiptProofReference?.trim() ??
    `production-stakeholder-receipt-proof-${providerSlug}.md`;
  const retrievalOwner = request.retrievalOwner?.trim() ?? "Production Retrieval Owner";

  const checks = [
    {
      name: "Improvement closure ready",
      passed:
        improvementClosureRecord.status ===
        "Ready for production execution improvement closure review",
      detail: `${improvementClosureRecord.id} is ${improvementClosureRecord.status}.`,
    },
    {
      name: "Archive owner assigned",
      passed: Boolean(archiveOwner),
      detail: archiveOwner || "Archive owner is required.",
    },
    {
      name: "Acceptance archive index linked",
      passed: Boolean(acceptanceArchiveIndexReference),
      detail: acceptanceArchiveIndexReference || "Acceptance archive index reference is required.",
    },
    {
      name: "Final evidence checksum linked",
      passed: Boolean(finalEvidenceChecksumReference),
      detail: finalEvidenceChecksumReference || "Final evidence checksum reference is required.",
    },
    {
      name: "Stakeholder receipt proof linked",
      passed: Boolean(stakeholderReceiptProofReference),
      detail: stakeholderReceiptProofReference || "Stakeholder receipt proof reference is required.",
    },
    {
      name: "Retrieval owner assigned",
      passed: Boolean(retrievalOwner),
      detail: retrievalOwner || "Retrieval owner is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        improvementClosureRecord.provisioningEnabled === false &&
        improvementClosureRecord.killSwitch.enabled === false,
      detail: `${improvementClosureRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-final-acceptance-archive-record-${providerSlug}-${Date.now()}`,
    provider: improvementClosureRecord.provider,
    improvementClosureRecordId: improvementClosureRecord.id,
    postImplementationReviewRecordId: improvementClosureRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: improvementClosureRecord.operationalClosureRecordId,
    finalTurnoverRecordId: improvementClosureRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: improvementClosureRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: improvementClosureRecord.supportReadinessRecordId,
    operationsHandoverRecordId: improvementClosureRecord.operationsHandoverRecordId,
    completionDossierRecordId: improvementClosureRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: improvementClosureRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: improvementClosureRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: improvementClosureRecord.archivalHandoffRecordId,
    closurePacketRecordId: improvementClosureRecord.closurePacketRecordId,
    closureAuthorizationRecordId: improvementClosureRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: improvementClosureRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: improvementClosureRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: improvementClosureRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: improvementClosureRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: improvementClosureRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: improvementClosureRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: improvementClosureRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: improvementClosureRecord.implementationHoldRecordId,
    cabDecisionRecordId: improvementClosureRecord.cabDecisionRecordId,
    cabHandoffPacketId: improvementClosureRecord.cabHandoffPacketId,
    freezeRecordId: improvementClosureRecord.freezeRecordId,
    authorizationPacketId: improvementClosureRecord.authorizationPacketId,
    promotionDossierId: improvementClosureRecord.promotionDossierId,
    closurePackageId: improvementClosureRecord.closurePackageId,
    outcomeRecordId: improvementClosureRecord.outcomeRecordId,
    handoffPackageId: improvementClosureRecord.handoffPackageId,
    controlledSwitchRequestId: improvementClosureRecord.controlledSwitchRequestId,
    auditPackageId: improvementClosureRecord.auditPackageId,
    switchReviewId: improvementClosureRecord.switchReviewId,
    activationId: improvementClosureRecord.activationId,
    idempotencyKey: improvementClosureRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution final acceptance archive review"
      : "Blocked",
    requestedBy: actor,
    archiveOwner,
    acceptanceArchiveIndexReference,
    finalEvidenceChecksumReference,
    stakeholderReceiptProofReference,
    retrievalOwner,
    checks,
    evidence: [
      `Improvement closure record: ${improvementClosureRecord.id}.`,
      `Post-implementation review record: ${improvementClosureRecord.postImplementationReviewRecordId}.`,
      `Archive owner: ${archiveOwner || "missing"}.`,
      `Acceptance archive index: ${acceptanceArchiveIndexReference || "missing"}.`,
      `Final evidence checksum: ${finalEvidenceChecksumReference || "missing"}.`,
      `Stakeholder receipt proof: ${stakeholderReceiptProofReference || "missing"}.`,
      `Retrieval owner: ${retrievalOwner || "missing"}.`,
      `Kill switch: ${improvementClosureRecord.killSwitch.name}=${
        improvementClosureRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: improvementClosureRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findImprovementClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionFinalAcceptanceArchiveRecordRequest
): ProductionExecutionImprovementClosureRecord {
  const improvementClosureRecord =
    (request.improvementClosureRecordId
      ? state.productionExecutionImprovementClosureRecords.find(
          (item) => item.id === request.improvementClosureRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionImprovementClosureRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionImprovementClosureRecords[0]);

  if (!improvementClosureRecord) {
    throw new ProductionExecutionFinalAcceptanceArchiveRecordError(
      "production_execution_improvement_closure_record_required",
      "A production execution improvement closure record is required."
    );
  }

  return improvementClosureRecord;
}
