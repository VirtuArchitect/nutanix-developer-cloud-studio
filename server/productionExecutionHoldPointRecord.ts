import type {
  ProductionExecutionHoldPointRecord,
  ProductionFinalExecutionPacketRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionHoldPointRecordRequest } from "./types";

export class ProductionExecutionHoldPointRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionHoldPointRecord(
  state: ApiState,
  request: CreateProductionExecutionHoldPointRecordRequest,
  actor: string
): ProductionExecutionHoldPointRecord {
  const packetRecord = findPacketRecord(state, request);
  const providerSlug = packetRecord.provider.toLowerCase();
  const holdPointOwner = request.holdPointOwner?.trim() ?? "Production Hold-Point Owner";
  const finalStopGoCheckpointReference =
    request.finalStopGoCheckpointReference?.trim() ?? `production-final-stop-go-checkpoint-${providerSlug}.md`;
  const rollbackTimerCheckpointReference =
    request.rollbackTimerCheckpointReference?.trim() ?? `production-rollback-timer-checkpoint-${providerSlug}.md`;
  const monitoringReadinessCheckpointReference =
    request.monitoringReadinessCheckpointReference?.trim() ??
    `production-monitoring-readiness-checkpoint-${providerSlug}.md`;
  const incidentBridgeCheckpointReference =
    request.incidentBridgeCheckpointReference?.trim() ?? `production-incident-bridge-checkpoint-${providerSlug}.md`;

  const checks = [
    {
      name: "Final execution packet ready",
      passed: packetRecord.status === "Ready for production final execution packet review",
      detail: `${packetRecord.id} is ${packetRecord.status}.`,
    },
    {
      name: "Hold-point owner assigned",
      passed: Boolean(holdPointOwner),
      detail: holdPointOwner || "Hold-point owner is required.",
    },
    {
      name: "Final stop/go checkpoint linked",
      passed: Boolean(finalStopGoCheckpointReference),
      detail: finalStopGoCheckpointReference || "Final stop/go checkpoint reference is required.",
    },
    {
      name: "Rollback timer checkpoint linked",
      passed: Boolean(rollbackTimerCheckpointReference),
      detail: rollbackTimerCheckpointReference || "Rollback timer checkpoint reference is required.",
    },
    {
      name: "Monitoring readiness checkpoint linked",
      passed: Boolean(monitoringReadinessCheckpointReference),
      detail: monitoringReadinessCheckpointReference || "Monitoring readiness checkpoint reference is required.",
    },
    {
      name: "Incident bridge checkpoint linked",
      passed: Boolean(incidentBridgeCheckpointReference),
      detail: incidentBridgeCheckpointReference || "Incident bridge checkpoint reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed: packetRecord.provisioningEnabled === false && packetRecord.killSwitch.enabled === false,
      detail: `${packetRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-hold-point-record-${providerSlug}-${Date.now()}`,
    provider: packetRecord.provider,
    finalExecutionPacketRecordId: packetRecord.id,
    changeTicketLockRecordId: packetRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: packetRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: packetRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: packetRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: packetRecord.implementationHoldRecordId,
    cabDecisionRecordId: packetRecord.cabDecisionRecordId,
    cabHandoffPacketId: packetRecord.cabHandoffPacketId,
    freezeRecordId: packetRecord.freezeRecordId,
    authorizationPacketId: packetRecord.authorizationPacketId,
    promotionDossierId: packetRecord.promotionDossierId,
    closurePackageId: packetRecord.closurePackageId,
    outcomeRecordId: packetRecord.outcomeRecordId,
    handoffPackageId: packetRecord.handoffPackageId,
    controlledSwitchRequestId: packetRecord.controlledSwitchRequestId,
    auditPackageId: packetRecord.auditPackageId,
    switchReviewId: packetRecord.switchReviewId,
    activationId: packetRecord.activationId,
    idempotencyKey: packetRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution hold-point review"
      : "Blocked",
    requestedBy: actor,
    holdPointOwner,
    finalStopGoCheckpointReference,
    rollbackTimerCheckpointReference,
    monitoringReadinessCheckpointReference,
    incidentBridgeCheckpointReference,
    checks,
    evidence: [
      `Final execution packet record: ${packetRecord.id}.`,
      `Change ticket lock record: ${packetRecord.changeTicketLockRecordId}.`,
      `Hold-point owner: ${holdPointOwner || "missing"}.`,
      `Final stop/go checkpoint: ${finalStopGoCheckpointReference || "missing"}.`,
      `Rollback timer checkpoint: ${rollbackTimerCheckpointReference || "missing"}.`,
      `Monitoring readiness checkpoint: ${monitoringReadinessCheckpointReference || "missing"}.`,
      `Incident bridge checkpoint: ${incidentBridgeCheckpointReference || "missing"}.`,
      `Kill switch: ${packetRecord.killSwitch.name}=${packetRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: packetRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findPacketRecord(
  state: ApiState,
  request: CreateProductionExecutionHoldPointRecordRequest
): ProductionFinalExecutionPacketRecord {
  const packetRecord =
    (request.finalExecutionPacketRecordId
      ? state.productionFinalExecutionPacketRecords.find((item) => item.id === request.finalExecutionPacketRecordId)
      : undefined) ??
    (request.provider
      ? state.productionFinalExecutionPacketRecords.find((item) => item.provider === request.provider)
      : state.productionFinalExecutionPacketRecords[0]);

  if (!packetRecord) {
    throw new ProductionExecutionHoldPointRecordError(
      "production_final_execution_packet_record_required",
      "A production final execution packet record is required."
    );
  }

  return packetRecord;
}
