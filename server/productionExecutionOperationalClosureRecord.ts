import type {
  ProductionExecutionFinalTurnoverRecord,
  ProductionExecutionOperationalClosureRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionOperationalClosureRecordRequest } from "./types";

export class ProductionExecutionOperationalClosureRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionOperationalClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionOperationalClosureRecordRequest,
  actor: string
): ProductionExecutionOperationalClosureRecord {
  const finalTurnoverRecord = findFinalTurnoverRecord(state, request);
  const providerSlug = finalTurnoverRecord.provider.toLowerCase();
  const closureOwner = request.closureOwner?.trim() ?? "Production Closure Owner";
  const steadyStateOperatingModelReference =
    request.steadyStateOperatingModelReference?.trim() ??
    `production-steady-state-operating-model-${providerSlug}.md`;
  const sloReviewProofReference =
    request.sloReviewProofReference?.trim() ?? `production-slo-review-proof-${providerSlug}.md`;
  const supportBacklogHandoffReference =
    request.supportBacklogHandoffReference?.trim() ??
    `production-support-backlog-handoff-${providerSlug}.md`;
  const residualRiskAcceptanceReference =
    request.residualRiskAcceptanceReference?.trim() ??
    `production-residual-risk-acceptance-${providerSlug}.md`;

  const checks = [
    {
      name: "Final turnover ready",
      passed:
        finalTurnoverRecord.status ===
        "Ready for production execution final turnover review",
      detail: `${finalTurnoverRecord.id} is ${finalTurnoverRecord.status}.`,
    },
    {
      name: "Closure owner assigned",
      passed: Boolean(closureOwner),
      detail: closureOwner || "Closure owner is required.",
    },
    {
      name: "Steady-state operating model linked",
      passed: Boolean(steadyStateOperatingModelReference),
      detail:
        steadyStateOperatingModelReference ||
        "Steady-state operating model reference is required.",
    },
    {
      name: "SLO review proof linked",
      passed: Boolean(sloReviewProofReference),
      detail: sloReviewProofReference || "SLO review proof reference is required.",
    },
    {
      name: "Support backlog handoff linked",
      passed: Boolean(supportBacklogHandoffReference),
      detail: supportBacklogHandoffReference || "Support backlog handoff reference is required.",
    },
    {
      name: "Residual-risk acceptance linked",
      passed: Boolean(residualRiskAcceptanceReference),
      detail: residualRiskAcceptanceReference || "Residual-risk acceptance reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        finalTurnoverRecord.provisioningEnabled === false &&
        finalTurnoverRecord.killSwitch.enabled === false,
      detail: `${finalTurnoverRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-operational-closure-record-${providerSlug}-${Date.now()}`,
    provider: finalTurnoverRecord.provider,
    finalTurnoverRecordId: finalTurnoverRecord.id,
    serviceAcceptanceRecordId: finalTurnoverRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: finalTurnoverRecord.supportReadinessRecordId,
    operationsHandoverRecordId: finalTurnoverRecord.operationsHandoverRecordId,
    completionDossierRecordId: finalTurnoverRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: finalTurnoverRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: finalTurnoverRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: finalTurnoverRecord.archivalHandoffRecordId,
    closurePacketRecordId: finalTurnoverRecord.closurePacketRecordId,
    closureAuthorizationRecordId: finalTurnoverRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: finalTurnoverRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: finalTurnoverRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: finalTurnoverRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: finalTurnoverRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: finalTurnoverRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: finalTurnoverRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: finalTurnoverRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: finalTurnoverRecord.implementationHoldRecordId,
    cabDecisionRecordId: finalTurnoverRecord.cabDecisionRecordId,
    cabHandoffPacketId: finalTurnoverRecord.cabHandoffPacketId,
    freezeRecordId: finalTurnoverRecord.freezeRecordId,
    authorizationPacketId: finalTurnoverRecord.authorizationPacketId,
    promotionDossierId: finalTurnoverRecord.promotionDossierId,
    closurePackageId: finalTurnoverRecord.closurePackageId,
    outcomeRecordId: finalTurnoverRecord.outcomeRecordId,
    handoffPackageId: finalTurnoverRecord.handoffPackageId,
    controlledSwitchRequestId: finalTurnoverRecord.controlledSwitchRequestId,
    auditPackageId: finalTurnoverRecord.auditPackageId,
    switchReviewId: finalTurnoverRecord.switchReviewId,
    activationId: finalTurnoverRecord.activationId,
    idempotencyKey: finalTurnoverRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution operational closure review"
      : "Blocked",
    requestedBy: actor,
    closureOwner,
    steadyStateOperatingModelReference,
    sloReviewProofReference,
    supportBacklogHandoffReference,
    residualRiskAcceptanceReference,
    checks,
    evidence: [
      `Final turnover record: ${finalTurnoverRecord.id}.`,
      `Service acceptance record: ${finalTurnoverRecord.serviceAcceptanceRecordId}.`,
      `Closure owner: ${closureOwner || "missing"}.`,
      `Steady-state operating model: ${steadyStateOperatingModelReference || "missing"}.`,
      `SLO review proof: ${sloReviewProofReference || "missing"}.`,
      `Support backlog handoff: ${supportBacklogHandoffReference || "missing"}.`,
      `Residual-risk acceptance: ${residualRiskAcceptanceReference || "missing"}.`,
      `Kill switch: ${finalTurnoverRecord.killSwitch.name}=${
        finalTurnoverRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: finalTurnoverRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findFinalTurnoverRecord(
  state: ApiState,
  request: CreateProductionExecutionOperationalClosureRecordRequest
): ProductionExecutionFinalTurnoverRecord {
  const finalTurnoverRecord =
    (request.finalTurnoverRecordId
      ? state.productionExecutionFinalTurnoverRecords.find(
          (item) => item.id === request.finalTurnoverRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionFinalTurnoverRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionFinalTurnoverRecords[0]);

  if (!finalTurnoverRecord) {
    throw new ProductionExecutionOperationalClosureRecordError(
      "production_execution_final_turnover_record_required",
      "A production execution final turnover record is required."
    );
  }

  return finalTurnoverRecord;
}
