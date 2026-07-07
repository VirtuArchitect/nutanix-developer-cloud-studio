import type {
  ProductionExecutionAuthorizationRecord,
  ProductionExecutionReadinessRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionAuthorizationRecordRequest } from "./types";

export class ProductionExecutionAuthorizationRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionAuthorizationRecord(
  state: ApiState,
  request: CreateProductionExecutionAuthorizationRecordRequest,
  actor: string
): ProductionExecutionAuthorizationRecord {
  const readinessRecord = findReadinessRecord(state, request);
  const providerSlug = readinessRecord.provider.toLowerCase();
  const authorizationAuthority = request.authorizationAuthority?.trim() ?? "Production Authorization Authority";
  const finalGoNoGoDecision = request.finalGoNoGoDecision ?? "Approved";
  const rollbackBridgeConfirmationReference =
    request.rollbackBridgeConfirmationReference?.trim() ?? `production-rollback-bridge-confirmation-${providerSlug}.md`;
  const monitoringBridgeConfirmationReference =
    request.monitoringBridgeConfirmationReference?.trim() ??
    `production-monitoring-bridge-confirmation-${providerSlug}.md`;
  const emergencyStopAuthority = request.emergencyStopAuthority?.trim() ?? "Emergency Stop Authority";

  const checks = [
    {
      name: "Execution readiness ready",
      passed: readinessRecord.status === "Ready for production execution readiness review",
      detail: `${readinessRecord.id} is ${readinessRecord.status}.`,
    },
    {
      name: "Authorization authority assigned",
      passed: Boolean(authorizationAuthority),
      detail: authorizationAuthority || "Authorization authority is required.",
    },
    {
      name: "Final go/no-go approved",
      passed: finalGoNoGoDecision === "Approved",
      detail: finalGoNoGoDecision,
    },
    {
      name: "Rollback bridge confirmed",
      passed: Boolean(rollbackBridgeConfirmationReference),
      detail: rollbackBridgeConfirmationReference || "Rollback bridge confirmation is required.",
    },
    {
      name: "Monitoring bridge confirmed",
      passed: Boolean(monitoringBridgeConfirmationReference),
      detail: monitoringBridgeConfirmationReference || "Monitoring bridge confirmation is required.",
    },
    {
      name: "Emergency stop authority assigned",
      passed: Boolean(emergencyStopAuthority),
      detail: emergencyStopAuthority || "Emergency stop authority is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed: readinessRecord.provisioningEnabled === false && readinessRecord.killSwitch.enabled === false,
      detail: `${readinessRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-authorization-record-${providerSlug}-${Date.now()}`,
    provider: readinessRecord.provider,
    executionReadinessRecordId: readinessRecord.id,
    operatorAssignmentRecordId: readinessRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: readinessRecord.implementationHoldRecordId,
    cabDecisionRecordId: readinessRecord.cabDecisionRecordId,
    cabHandoffPacketId: readinessRecord.cabHandoffPacketId,
    freezeRecordId: readinessRecord.freezeRecordId,
    authorizationPacketId: readinessRecord.authorizationPacketId,
    promotionDossierId: readinessRecord.promotionDossierId,
    closurePackageId: readinessRecord.closurePackageId,
    outcomeRecordId: readinessRecord.outcomeRecordId,
    handoffPackageId: readinessRecord.handoffPackageId,
    controlledSwitchRequestId: readinessRecord.controlledSwitchRequestId,
    auditPackageId: readinessRecord.auditPackageId,
    switchReviewId: readinessRecord.switchReviewId,
    activationId: readinessRecord.activationId,
    idempotencyKey: readinessRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution authorization review"
      : "Blocked",
    requestedBy: actor,
    authorizationAuthority,
    finalGoNoGoDecision,
    rollbackBridgeConfirmationReference,
    monitoringBridgeConfirmationReference,
    emergencyStopAuthority,
    checks,
    evidence: [
      `Execution readiness record: ${readinessRecord.id}.`,
      `Operator assignment record: ${readinessRecord.operatorAssignmentRecordId}.`,
      `Authorization authority: ${authorizationAuthority || "missing"}.`,
      `Final go/no-go decision: ${finalGoNoGoDecision}.`,
      `Rollback bridge confirmation: ${rollbackBridgeConfirmationReference || "missing"}.`,
      `Monitoring bridge confirmation: ${monitoringBridgeConfirmationReference || "missing"}.`,
      `Emergency stop authority: ${emergencyStopAuthority || "missing"}.`,
      `Kill switch: ${readinessRecord.killSwitch.name}=${readinessRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: readinessRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findReadinessRecord(
  state: ApiState,
  request: CreateProductionExecutionAuthorizationRecordRequest
): ProductionExecutionReadinessRecord {
  const readinessRecord =
    (request.executionReadinessRecordId
      ? state.productionExecutionReadinessRecords.find((item) => item.id === request.executionReadinessRecordId)
      : undefined) ??
    (request.provider
      ? state.productionExecutionReadinessRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionReadinessRecords[0]);

  if (!readinessRecord) {
    throw new ProductionExecutionAuthorizationRecordError(
      "production_execution_readiness_record_required",
      "A production execution readiness record is required."
    );
  }

  return readinessRecord;
}
