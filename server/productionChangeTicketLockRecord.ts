import type {
  ProductionChangeTicketLockRecord,
  ProductionExecutionAuthorizationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionChangeTicketLockRecordRequest } from "./types";

export class ProductionChangeTicketLockRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionChangeTicketLockRecord(
  state: ApiState,
  request: CreateProductionChangeTicketLockRecordRequest,
  actor: string
): ProductionChangeTicketLockRecord {
  const authorizationRecord = findAuthorizationRecord(state, request);
  const providerSlug = authorizationRecord.provider.toLowerCase();
  const changeTicketLockReference =
    request.changeTicketLockReference?.trim() ?? `production-change-ticket-lock-${providerSlug}.md`;
  const releaseWindowLockReference =
    request.releaseWindowLockReference?.trim() ?? `production-release-window-lock-${providerSlug}.md`;
  const approverRosterLockReference =
    request.approverRosterLockReference?.trim() ?? `production-approver-roster-lock-${providerSlug}.md`;
  const rollbackBridgeLockReference =
    request.rollbackBridgeLockReference?.trim() ?? `production-rollback-bridge-lock-${providerSlug}.md`;
  const monitoringBridgeLockReference =
    request.monitoringBridgeLockReference?.trim() ?? `production-monitoring-bridge-lock-${providerSlug}.md`;

  const checks = [
    {
      name: "Execution authorization ready",
      passed: authorizationRecord.status === "Ready for production execution authorization review",
      detail: `${authorizationRecord.id} is ${authorizationRecord.status}.`,
    },
    {
      name: "Change ticket locked",
      passed: Boolean(changeTicketLockReference),
      detail: changeTicketLockReference || "Change ticket lock reference is required.",
    },
    {
      name: "Release window locked",
      passed: Boolean(releaseWindowLockReference),
      detail: releaseWindowLockReference || "Release window lock reference is required.",
    },
    {
      name: "Approver roster locked",
      passed: Boolean(approverRosterLockReference),
      detail: approverRosterLockReference || "Approver roster lock reference is required.",
    },
    {
      name: "Rollback bridge locked",
      passed: Boolean(rollbackBridgeLockReference),
      detail: rollbackBridgeLockReference || "Rollback bridge lock reference is required.",
    },
    {
      name: "Monitoring bridge locked",
      passed: Boolean(monitoringBridgeLockReference),
      detail: monitoringBridgeLockReference || "Monitoring bridge lock reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed: authorizationRecord.provisioningEnabled === false && authorizationRecord.killSwitch.enabled === false,
      detail: `${authorizationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-change-ticket-lock-record-${providerSlug}-${Date.now()}`,
    provider: authorizationRecord.provider,
    executionAuthorizationRecordId: authorizationRecord.id,
    executionReadinessRecordId: authorizationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: authorizationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: authorizationRecord.implementationHoldRecordId,
    cabDecisionRecordId: authorizationRecord.cabDecisionRecordId,
    cabHandoffPacketId: authorizationRecord.cabHandoffPacketId,
    freezeRecordId: authorizationRecord.freezeRecordId,
    authorizationPacketId: authorizationRecord.authorizationPacketId,
    promotionDossierId: authorizationRecord.promotionDossierId,
    closurePackageId: authorizationRecord.closurePackageId,
    outcomeRecordId: authorizationRecord.outcomeRecordId,
    handoffPackageId: authorizationRecord.handoffPackageId,
    controlledSwitchRequestId: authorizationRecord.controlledSwitchRequestId,
    auditPackageId: authorizationRecord.auditPackageId,
    switchReviewId: authorizationRecord.switchReviewId,
    activationId: authorizationRecord.activationId,
    idempotencyKey: authorizationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production change ticket lock review"
      : "Blocked",
    requestedBy: actor,
    changeTicketLockReference,
    releaseWindowLockReference,
    approverRosterLockReference,
    rollbackBridgeLockReference,
    monitoringBridgeLockReference,
    checks,
    evidence: [
      `Execution authorization record: ${authorizationRecord.id}.`,
      `Execution readiness record: ${authorizationRecord.executionReadinessRecordId}.`,
      `Change ticket lock: ${changeTicketLockReference || "missing"}.`,
      `Release window lock: ${releaseWindowLockReference || "missing"}.`,
      `Approver roster lock: ${approverRosterLockReference || "missing"}.`,
      `Rollback bridge lock: ${rollbackBridgeLockReference || "missing"}.`,
      `Monitoring bridge lock: ${monitoringBridgeLockReference || "missing"}.`,
      `Kill switch: ${authorizationRecord.killSwitch.name}=${authorizationRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: authorizationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findAuthorizationRecord(
  state: ApiState,
  request: CreateProductionChangeTicketLockRecordRequest
): ProductionExecutionAuthorizationRecord {
  const authorizationRecord =
    (request.executionAuthorizationRecordId
      ? state.productionExecutionAuthorizationRecords.find(
          (item) => item.id === request.executionAuthorizationRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionAuthorizationRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionAuthorizationRecords[0]);

  if (!authorizationRecord) {
    throw new ProductionChangeTicketLockRecordError(
      "production_execution_authorization_record_required",
      "A production execution authorization record is required."
    );
  }

  return authorizationRecord;
}
