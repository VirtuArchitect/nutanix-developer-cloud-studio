import type {
  ProductionExecutionReadinessRecord,
  ProductionOperatorAssignmentRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionReadinessRecordRequest } from "./types";

export class ProductionExecutionReadinessRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionReadinessRecord(
  state: ApiState,
  request: CreateProductionExecutionReadinessRecordRequest,
  actor: string
): ProductionExecutionReadinessRecord {
  const assignmentRecord = findAssignmentRecord(state, request);
  const providerSlug = assignmentRecord.provider.toLowerCase();
  const executionOwner = request.executionOwner?.trim() ?? "Production Execution Owner";
  const preExecutionChecklistReference =
    request.preExecutionChecklistReference?.trim() ?? `production-pre-execution-checklist-${providerSlug}.md`;
  const rollbackBridgeReference =
    request.rollbackBridgeReference?.trim() ?? `production-rollback-bridge-${providerSlug}.md`;
  const monitoringObserver = request.monitoringObserver?.trim() ?? "Production Monitoring Observer";
  const implementationTimerReference =
    request.implementationTimerReference?.trim() ?? `production-implementation-timer-${providerSlug}.md`;

  const checks = [
    {
      name: "Operator assignment ready",
      passed: assignmentRecord.status === "Ready for production operator assignment review",
      detail: `${assignmentRecord.id} is ${assignmentRecord.status}.`,
    },
    {
      name: "Execution owner assigned",
      passed: Boolean(executionOwner),
      detail: executionOwner || "Execution owner is required.",
    },
    {
      name: "Pre-execution checklist linked",
      passed: Boolean(preExecutionChecklistReference),
      detail: preExecutionChecklistReference || "Pre-execution checklist reference is required.",
    },
    {
      name: "Rollback bridge linked",
      passed: Boolean(rollbackBridgeReference),
      detail: rollbackBridgeReference || "Rollback bridge reference is required.",
    },
    {
      name: "Monitoring observer assigned",
      passed: Boolean(monitoringObserver),
      detail: monitoringObserver || "Monitoring observer is required.",
    },
    {
      name: "Implementation timer linked",
      passed: Boolean(implementationTimerReference),
      detail: implementationTimerReference || "Implementation timer reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed: assignmentRecord.provisioningEnabled === false && assignmentRecord.killSwitch.enabled === false,
      detail: `${assignmentRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-readiness-record-${providerSlug}-${Date.now()}`,
    provider: assignmentRecord.provider,
    operatorAssignmentRecordId: assignmentRecord.id,
    implementationHoldRecordId: assignmentRecord.implementationHoldRecordId,
    cabDecisionRecordId: assignmentRecord.cabDecisionRecordId,
    cabHandoffPacketId: assignmentRecord.cabHandoffPacketId,
    freezeRecordId: assignmentRecord.freezeRecordId,
    authorizationPacketId: assignmentRecord.authorizationPacketId,
    promotionDossierId: assignmentRecord.promotionDossierId,
    closurePackageId: assignmentRecord.closurePackageId,
    outcomeRecordId: assignmentRecord.outcomeRecordId,
    handoffPackageId: assignmentRecord.handoffPackageId,
    controlledSwitchRequestId: assignmentRecord.controlledSwitchRequestId,
    auditPackageId: assignmentRecord.auditPackageId,
    switchReviewId: assignmentRecord.switchReviewId,
    activationId: assignmentRecord.activationId,
    idempotencyKey: assignmentRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution readiness review"
      : "Blocked",
    requestedBy: actor,
    executionOwner,
    preExecutionChecklistReference,
    rollbackBridgeReference,
    monitoringObserver,
    implementationTimerReference,
    checks,
    evidence: [
      `Operator assignment record: ${assignmentRecord.id}.`,
      `Implementation hold record: ${assignmentRecord.implementationHoldRecordId}.`,
      `Execution owner: ${executionOwner || "missing"}.`,
      `Pre-execution checklist: ${preExecutionChecklistReference || "missing"}.`,
      `Rollback bridge: ${rollbackBridgeReference || "missing"}.`,
      `Monitoring observer: ${monitoringObserver || "missing"}.`,
      `Implementation timer: ${implementationTimerReference || "missing"}.`,
      `Kill switch: ${assignmentRecord.killSwitch.name}=${assignmentRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: assignmentRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findAssignmentRecord(
  state: ApiState,
  request: CreateProductionExecutionReadinessRecordRequest
): ProductionOperatorAssignmentRecord {
  const assignmentRecord =
    (request.operatorAssignmentRecordId
      ? state.productionOperatorAssignmentRecords.find((item) => item.id === request.operatorAssignmentRecordId)
      : undefined) ??
    (request.provider
      ? state.productionOperatorAssignmentRecords.find((item) => item.provider === request.provider)
      : state.productionOperatorAssignmentRecords[0]);

  if (!assignmentRecord) {
    throw new ProductionExecutionReadinessRecordError(
      "production_operator_assignment_record_required",
      "A production operator assignment record is required."
    );
  }

  return assignmentRecord;
}
