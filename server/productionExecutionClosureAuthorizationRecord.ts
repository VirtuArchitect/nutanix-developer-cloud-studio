import type {
  ProductionExecutionClosureAuthorizationRecord,
  ProductionExecutionOutcomeAuthorizationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionClosureAuthorizationRecordRequest } from "./types";

export class ProductionExecutionClosureAuthorizationRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionClosureAuthorizationRecord(
  state: ApiState,
  request: CreateProductionExecutionClosureAuthorizationRecordRequest,
  actor: string
): ProductionExecutionClosureAuthorizationRecord {
  const outcomeAuthorizationRecord = findOutcomeAuthorizationRecord(state, request);
  const providerSlug = outcomeAuthorizationRecord.provider.toLowerCase();
  const closureAuthority = request.closureAuthority?.trim() ?? "Production Closure Authority";
  const successCriteriaReference =
    request.successCriteriaReference?.trim() ?? `production-success-criteria-${providerSlug}.md`;
  const rollbackClosureCriteriaReference =
    request.rollbackClosureCriteriaReference?.trim() ??
    `production-rollback-closure-criteria-${providerSlug}.md`;
  const incidentClosureCriteriaReference =
    request.incidentClosureCriteriaReference?.trim() ??
    `production-incident-closure-criteria-${providerSlug}.md`;
  const auditCaptureConfirmationReference =
    request.auditCaptureConfirmationReference?.trim() ??
    `production-audit-capture-confirmation-${providerSlug}.md`;

  const checks = [
    {
      name: "Outcome authorization ready",
      passed:
        outcomeAuthorizationRecord.status ===
        "Ready for production execution outcome authorization review",
      detail: `${outcomeAuthorizationRecord.id} is ${outcomeAuthorizationRecord.status}.`,
    },
    {
      name: "Closure authority assigned",
      passed: Boolean(closureAuthority),
      detail: closureAuthority || "Closure authority is required.",
    },
    {
      name: "Success criteria linked",
      passed: Boolean(successCriteriaReference),
      detail: successCriteriaReference || "Success criteria reference is required.",
    },
    {
      name: "Rollback closure criteria linked",
      passed: Boolean(rollbackClosureCriteriaReference),
      detail: rollbackClosureCriteriaReference || "Rollback closure criteria reference is required.",
    },
    {
      name: "Incident closure criteria linked",
      passed: Boolean(incidentClosureCriteriaReference),
      detail: incidentClosureCriteriaReference || "Incident closure criteria reference is required.",
    },
    {
      name: "Audit capture confirmation linked",
      passed: Boolean(auditCaptureConfirmationReference),
      detail: auditCaptureConfirmationReference || "Audit capture confirmation reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        outcomeAuthorizationRecord.provisioningEnabled === false &&
        outcomeAuthorizationRecord.killSwitch.enabled === false,
      detail: `${outcomeAuthorizationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-closure-authorization-record-${providerSlug}-${Date.now()}`,
    provider: outcomeAuthorizationRecord.provider,
    outcomeAuthorizationRecordId: outcomeAuthorizationRecord.id,
    executionHoldPointRecordId: outcomeAuthorizationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: outcomeAuthorizationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: outcomeAuthorizationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: outcomeAuthorizationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: outcomeAuthorizationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: outcomeAuthorizationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: outcomeAuthorizationRecord.implementationHoldRecordId,
    cabDecisionRecordId: outcomeAuthorizationRecord.cabDecisionRecordId,
    cabHandoffPacketId: outcomeAuthorizationRecord.cabHandoffPacketId,
    freezeRecordId: outcomeAuthorizationRecord.freezeRecordId,
    authorizationPacketId: outcomeAuthorizationRecord.authorizationPacketId,
    promotionDossierId: outcomeAuthorizationRecord.promotionDossierId,
    closurePackageId: outcomeAuthorizationRecord.closurePackageId,
    outcomeRecordId: outcomeAuthorizationRecord.outcomeRecordId,
    handoffPackageId: outcomeAuthorizationRecord.handoffPackageId,
    controlledSwitchRequestId: outcomeAuthorizationRecord.controlledSwitchRequestId,
    auditPackageId: outcomeAuthorizationRecord.auditPackageId,
    switchReviewId: outcomeAuthorizationRecord.switchReviewId,
    activationId: outcomeAuthorizationRecord.activationId,
    idempotencyKey: outcomeAuthorizationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution closure authorization review"
      : "Blocked",
    requestedBy: actor,
    closureAuthority,
    successCriteriaReference,
    rollbackClosureCriteriaReference,
    incidentClosureCriteriaReference,
    auditCaptureConfirmationReference,
    checks,
    evidence: [
      `Outcome authorization record: ${outcomeAuthorizationRecord.id}.`,
      `Execution hold-point record: ${outcomeAuthorizationRecord.executionHoldPointRecordId}.`,
      `Closure authority: ${closureAuthority || "missing"}.`,
      `Success criteria: ${successCriteriaReference || "missing"}.`,
      `Rollback closure criteria: ${rollbackClosureCriteriaReference || "missing"}.`,
      `Incident closure criteria: ${incidentClosureCriteriaReference || "missing"}.`,
      `Audit capture confirmation: ${auditCaptureConfirmationReference || "missing"}.`,
      `Kill switch: ${outcomeAuthorizationRecord.killSwitch.name}=${
        outcomeAuthorizationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: outcomeAuthorizationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findOutcomeAuthorizationRecord(
  state: ApiState,
  request: CreateProductionExecutionClosureAuthorizationRecordRequest
): ProductionExecutionOutcomeAuthorizationRecord {
  const outcomeAuthorizationRecord =
    (request.outcomeAuthorizationRecordId
      ? state.productionExecutionOutcomeAuthorizationRecords.find(
          (item) => item.id === request.outcomeAuthorizationRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionOutcomeAuthorizationRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionOutcomeAuthorizationRecords[0]);

  if (!outcomeAuthorizationRecord) {
    throw new ProductionExecutionClosureAuthorizationRecordError(
      "production_execution_outcome_authorization_record_required",
      "A production execution outcome authorization record is required."
    );
  }

  return outcomeAuthorizationRecord;
}
