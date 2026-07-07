import type {
  ProductionExecutionFinalTurnoverRecord,
  ProductionExecutionServiceAcceptanceRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionFinalTurnoverRecordRequest } from "./types";

export class ProductionExecutionFinalTurnoverRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionFinalTurnoverRecord(
  state: ApiState,
  request: CreateProductionExecutionFinalTurnoverRecordRequest,
  actor: string
): ProductionExecutionFinalTurnoverRecord {
  const serviceAcceptanceRecord = findServiceAcceptanceRecord(state, request);
  const providerSlug = serviceAcceptanceRecord.provider.toLowerCase();
  const turnoverOwner = request.turnoverOwner?.trim() ?? "Production Turnover Owner";
  const finalServiceCatalogReference =
    request.finalServiceCatalogReference?.trim() ?? `production-final-service-catalog-${providerSlug}.md`;
  const ownershipTransferProofReference =
    request.ownershipTransferProofReference?.trim() ?? `production-ownership-transfer-proof-${providerSlug}.md`;
  const executiveClosureNoteReference =
    request.executiveClosureNoteReference?.trim() ?? `production-executive-closure-note-${providerSlug}.md`;
  const postImplementationReviewScheduleReference =
    request.postImplementationReviewScheduleReference?.trim() ??
    `production-post-implementation-review-schedule-${providerSlug}.md`;

  const checks = [
    {
      name: "Service acceptance ready",
      passed:
        serviceAcceptanceRecord.status ===
        "Ready for production execution service acceptance review",
      detail: `${serviceAcceptanceRecord.id} is ${serviceAcceptanceRecord.status}.`,
    },
    {
      name: "Turnover owner assigned",
      passed: Boolean(turnoverOwner),
      detail: turnoverOwner || "Turnover owner is required.",
    },
    {
      name: "Final service catalog linked",
      passed: Boolean(finalServiceCatalogReference),
      detail: finalServiceCatalogReference || "Final service catalog reference is required.",
    },
    {
      name: "Ownership transfer proof linked",
      passed: Boolean(ownershipTransferProofReference),
      detail: ownershipTransferProofReference || "Ownership transfer proof reference is required.",
    },
    {
      name: "Executive closure note linked",
      passed: Boolean(executiveClosureNoteReference),
      detail: executiveClosureNoteReference || "Executive closure note reference is required.",
    },
    {
      name: "Post-implementation review scheduled",
      passed: Boolean(postImplementationReviewScheduleReference),
      detail:
        postImplementationReviewScheduleReference ||
        "Post-implementation review schedule reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        serviceAcceptanceRecord.provisioningEnabled === false &&
        serviceAcceptanceRecord.killSwitch.enabled === false,
      detail: `${serviceAcceptanceRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-final-turnover-record-${providerSlug}-${Date.now()}`,
    provider: serviceAcceptanceRecord.provider,
    serviceAcceptanceRecordId: serviceAcceptanceRecord.id,
    supportReadinessRecordId: serviceAcceptanceRecord.supportReadinessRecordId,
    operationsHandoverRecordId: serviceAcceptanceRecord.operationsHandoverRecordId,
    completionDossierRecordId: serviceAcceptanceRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: serviceAcceptanceRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: serviceAcceptanceRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: serviceAcceptanceRecord.archivalHandoffRecordId,
    closurePacketRecordId: serviceAcceptanceRecord.closurePacketRecordId,
    closureAuthorizationRecordId: serviceAcceptanceRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: serviceAcceptanceRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: serviceAcceptanceRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: serviceAcceptanceRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: serviceAcceptanceRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: serviceAcceptanceRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: serviceAcceptanceRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: serviceAcceptanceRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: serviceAcceptanceRecord.implementationHoldRecordId,
    cabDecisionRecordId: serviceAcceptanceRecord.cabDecisionRecordId,
    cabHandoffPacketId: serviceAcceptanceRecord.cabHandoffPacketId,
    freezeRecordId: serviceAcceptanceRecord.freezeRecordId,
    authorizationPacketId: serviceAcceptanceRecord.authorizationPacketId,
    promotionDossierId: serviceAcceptanceRecord.promotionDossierId,
    closurePackageId: serviceAcceptanceRecord.closurePackageId,
    outcomeRecordId: serviceAcceptanceRecord.outcomeRecordId,
    handoffPackageId: serviceAcceptanceRecord.handoffPackageId,
    controlledSwitchRequestId: serviceAcceptanceRecord.controlledSwitchRequestId,
    auditPackageId: serviceAcceptanceRecord.auditPackageId,
    switchReviewId: serviceAcceptanceRecord.switchReviewId,
    activationId: serviceAcceptanceRecord.activationId,
    idempotencyKey: serviceAcceptanceRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution final turnover review"
      : "Blocked",
    requestedBy: actor,
    turnoverOwner,
    finalServiceCatalogReference,
    ownershipTransferProofReference,
    executiveClosureNoteReference,
    postImplementationReviewScheduleReference,
    checks,
    evidence: [
      `Service acceptance record: ${serviceAcceptanceRecord.id}.`,
      `Support readiness record: ${serviceAcceptanceRecord.supportReadinessRecordId}.`,
      `Turnover owner: ${turnoverOwner || "missing"}.`,
      `Final service catalog: ${finalServiceCatalogReference || "missing"}.`,
      `Ownership transfer proof: ${ownershipTransferProofReference || "missing"}.`,
      `Executive closure note: ${executiveClosureNoteReference || "missing"}.`,
      `Post-implementation review schedule: ${
        postImplementationReviewScheduleReference || "missing"
      }.`,
      `Kill switch: ${serviceAcceptanceRecord.killSwitch.name}=${
        serviceAcceptanceRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: serviceAcceptanceRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findServiceAcceptanceRecord(
  state: ApiState,
  request: CreateProductionExecutionFinalTurnoverRecordRequest
): ProductionExecutionServiceAcceptanceRecord {
  const serviceAcceptanceRecord =
    (request.serviceAcceptanceRecordId
      ? state.productionExecutionServiceAcceptanceRecords.find(
          (item) => item.id === request.serviceAcceptanceRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionServiceAcceptanceRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionServiceAcceptanceRecords[0]);

  if (!serviceAcceptanceRecord) {
    throw new ProductionExecutionFinalTurnoverRecordError(
      "production_execution_service_acceptance_record_required",
      "A production execution service acceptance record is required."
    );
  }

  return serviceAcceptanceRecord;
}
