import type {
  ProductionExecutionOperationalClosureRecord,
  ProductionExecutionPostImplementationReviewRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionPostImplementationReviewRecordRequest } from "./types";

export class ProductionExecutionPostImplementationReviewRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionPostImplementationReviewRecord(
  state: ApiState,
  request: CreateProductionExecutionPostImplementationReviewRecordRequest,
  actor: string
): ProductionExecutionPostImplementationReviewRecord {
  const operationalClosureRecord = findOperationalClosureRecord(state, request);
  const providerSlug = operationalClosureRecord.provider.toLowerCase();
  const reviewOwner = request.reviewOwner?.trim() ?? "Production PIR Owner";
  const pirMinutesReference =
    request.pirMinutesReference?.trim() ?? `production-pir-minutes-${providerSlug}.md`;
  const incidentReviewProofReference =
    request.incidentReviewProofReference?.trim() ??
    `production-incident-review-proof-${providerSlug}.md`;
  const costVarianceReviewReference =
    request.costVarianceReviewReference?.trim() ??
    `production-cost-variance-review-${providerSlug}.md`;
  const improvementBacklogReference =
    request.improvementBacklogReference?.trim() ??
    `production-improvement-backlog-${providerSlug}.md`;

  const checks = [
    {
      name: "Operational closure ready",
      passed:
        operationalClosureRecord.status ===
        "Ready for production execution operational closure review",
      detail: `${operationalClosureRecord.id} is ${operationalClosureRecord.status}.`,
    },
    {
      name: "Review owner assigned",
      passed: Boolean(reviewOwner),
      detail: reviewOwner || "Review owner is required.",
    },
    {
      name: "PIR minutes linked",
      passed: Boolean(pirMinutesReference),
      detail: pirMinutesReference || "PIR minutes reference is required.",
    },
    {
      name: "Incident review proof linked",
      passed: Boolean(incidentReviewProofReference),
      detail: incidentReviewProofReference || "Incident review proof reference is required.",
    },
    {
      name: "Cost variance review linked",
      passed: Boolean(costVarianceReviewReference),
      detail: costVarianceReviewReference || "Cost variance review reference is required.",
    },
    {
      name: "Improvement backlog linked",
      passed: Boolean(improvementBacklogReference),
      detail: improvementBacklogReference || "Improvement backlog reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        operationalClosureRecord.provisioningEnabled === false &&
        operationalClosureRecord.killSwitch.enabled === false,
      detail: `${operationalClosureRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-post-implementation-review-record-${providerSlug}-${Date.now()}`,
    provider: operationalClosureRecord.provider,
    operationalClosureRecordId: operationalClosureRecord.id,
    finalTurnoverRecordId: operationalClosureRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: operationalClosureRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: operationalClosureRecord.supportReadinessRecordId,
    operationsHandoverRecordId: operationalClosureRecord.operationsHandoverRecordId,
    completionDossierRecordId: operationalClosureRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: operationalClosureRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: operationalClosureRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: operationalClosureRecord.archivalHandoffRecordId,
    closurePacketRecordId: operationalClosureRecord.closurePacketRecordId,
    closureAuthorizationRecordId: operationalClosureRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: operationalClosureRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: operationalClosureRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: operationalClosureRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: operationalClosureRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: operationalClosureRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: operationalClosureRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: operationalClosureRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: operationalClosureRecord.implementationHoldRecordId,
    cabDecisionRecordId: operationalClosureRecord.cabDecisionRecordId,
    cabHandoffPacketId: operationalClosureRecord.cabHandoffPacketId,
    freezeRecordId: operationalClosureRecord.freezeRecordId,
    authorizationPacketId: operationalClosureRecord.authorizationPacketId,
    promotionDossierId: operationalClosureRecord.promotionDossierId,
    closurePackageId: operationalClosureRecord.closurePackageId,
    outcomeRecordId: operationalClosureRecord.outcomeRecordId,
    handoffPackageId: operationalClosureRecord.handoffPackageId,
    controlledSwitchRequestId: operationalClosureRecord.controlledSwitchRequestId,
    auditPackageId: operationalClosureRecord.auditPackageId,
    switchReviewId: operationalClosureRecord.switchReviewId,
    activationId: operationalClosureRecord.activationId,
    idempotencyKey: operationalClosureRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution post-implementation review"
      : "Blocked",
    requestedBy: actor,
    reviewOwner,
    pirMinutesReference,
    incidentReviewProofReference,
    costVarianceReviewReference,
    improvementBacklogReference,
    checks,
    evidence: [
      `Operational closure record: ${operationalClosureRecord.id}.`,
      `Final turnover record: ${operationalClosureRecord.finalTurnoverRecordId}.`,
      `Review owner: ${reviewOwner || "missing"}.`,
      `PIR minutes: ${pirMinutesReference || "missing"}.`,
      `Incident review proof: ${incidentReviewProofReference || "missing"}.`,
      `Cost variance review: ${costVarianceReviewReference || "missing"}.`,
      `Improvement backlog: ${improvementBacklogReference || "missing"}.`,
      `Kill switch: ${operationalClosureRecord.killSwitch.name}=${
        operationalClosureRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: operationalClosureRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findOperationalClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionPostImplementationReviewRecordRequest
): ProductionExecutionOperationalClosureRecord {
  const operationalClosureRecord =
    (request.operationalClosureRecordId
      ? state.productionExecutionOperationalClosureRecords.find(
          (item) => item.id === request.operationalClosureRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionOperationalClosureRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionOperationalClosureRecords[0]);

  if (!operationalClosureRecord) {
    throw new ProductionExecutionPostImplementationReviewRecordError(
      "production_execution_operational_closure_record_required",
      "A production execution operational closure record is required."
    );
  }

  return operationalClosureRecord;
}
