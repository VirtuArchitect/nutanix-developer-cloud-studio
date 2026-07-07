import type {
  ProductionChangeTicketLockRecord,
  ProductionFinalExecutionPacketRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionFinalExecutionPacketRecordRequest } from "./types";

export class ProductionFinalExecutionPacketRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionFinalExecutionPacketRecord(
  state: ApiState,
  request: CreateProductionFinalExecutionPacketRecordRequest,
  actor: string
): ProductionFinalExecutionPacketRecord {
  const lockRecord = findLockRecord(state, request);
  const providerSlug = lockRecord.provider.toLowerCase();
  const finalPacketManifestReference =
    request.finalPacketManifestReference?.trim() ?? `production-final-packet-manifest-${providerSlug}.md`;
  const operatorRunSheetReference =
    request.operatorRunSheetReference?.trim() ?? `production-operator-run-sheet-${providerSlug}.md`;
  const communicationsProofReference =
    request.communicationsProofReference?.trim() ?? `production-communications-proof-${providerSlug}.md`;
  const observationWindowReference =
    request.observationWindowReference?.trim() ?? `production-observation-window-${providerSlug}.md`;
  const finalRollbackStandbyConfirmation =
    request.finalRollbackStandbyConfirmation?.trim() ?? `production-final-rollback-standby-${providerSlug}.md`;

  const checks = [
    {
      name: "Change ticket lock ready",
      passed: lockRecord.status === "Ready for production change ticket lock review",
      detail: `${lockRecord.id} is ${lockRecord.status}.`,
    },
    {
      name: "Final packet manifest linked",
      passed: Boolean(finalPacketManifestReference),
      detail: finalPacketManifestReference || "Final packet manifest reference is required.",
    },
    {
      name: "Operator run sheet linked",
      passed: Boolean(operatorRunSheetReference),
      detail: operatorRunSheetReference || "Operator run sheet reference is required.",
    },
    {
      name: "Communications proof linked",
      passed: Boolean(communicationsProofReference),
      detail: communicationsProofReference || "Communications proof reference is required.",
    },
    {
      name: "Observation window linked",
      passed: Boolean(observationWindowReference),
      detail: observationWindowReference || "Observation window reference is required.",
    },
    {
      name: "Final rollback standby confirmed",
      passed: Boolean(finalRollbackStandbyConfirmation),
      detail: finalRollbackStandbyConfirmation || "Final rollback standby confirmation is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed: lockRecord.provisioningEnabled === false && lockRecord.killSwitch.enabled === false,
      detail: `${lockRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-final-execution-packet-record-${providerSlug}-${Date.now()}`,
    provider: lockRecord.provider,
    changeTicketLockRecordId: lockRecord.id,
    executionAuthorizationRecordId: lockRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: lockRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: lockRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: lockRecord.implementationHoldRecordId,
    cabDecisionRecordId: lockRecord.cabDecisionRecordId,
    cabHandoffPacketId: lockRecord.cabHandoffPacketId,
    freezeRecordId: lockRecord.freezeRecordId,
    authorizationPacketId: lockRecord.authorizationPacketId,
    promotionDossierId: lockRecord.promotionDossierId,
    closurePackageId: lockRecord.closurePackageId,
    outcomeRecordId: lockRecord.outcomeRecordId,
    handoffPackageId: lockRecord.handoffPackageId,
    controlledSwitchRequestId: lockRecord.controlledSwitchRequestId,
    auditPackageId: lockRecord.auditPackageId,
    switchReviewId: lockRecord.switchReviewId,
    activationId: lockRecord.activationId,
    idempotencyKey: lockRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production final execution packet review"
      : "Blocked",
    requestedBy: actor,
    finalPacketManifestReference,
    operatorRunSheetReference,
    communicationsProofReference,
    observationWindowReference,
    finalRollbackStandbyConfirmation,
    checks,
    evidence: [
      `Change ticket lock record: ${lockRecord.id}.`,
      `Execution authorization record: ${lockRecord.executionAuthorizationRecordId}.`,
      `Final packet manifest: ${finalPacketManifestReference || "missing"}.`,
      `Operator run sheet: ${operatorRunSheetReference || "missing"}.`,
      `Communications proof: ${communicationsProofReference || "missing"}.`,
      `Observation window: ${observationWindowReference || "missing"}.`,
      `Final rollback standby: ${finalRollbackStandbyConfirmation || "missing"}.`,
      `Kill switch: ${lockRecord.killSwitch.name}=${lockRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: lockRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findLockRecord(
  state: ApiState,
  request: CreateProductionFinalExecutionPacketRecordRequest
): ProductionChangeTicketLockRecord {
  const lockRecord =
    (request.changeTicketLockRecordId
      ? state.productionChangeTicketLockRecords.find((item) => item.id === request.changeTicketLockRecordId)
      : undefined) ??
    (request.provider
      ? state.productionChangeTicketLockRecords.find((item) => item.provider === request.provider)
      : state.productionChangeTicketLockRecords[0]);

  if (!lockRecord) {
    throw new ProductionFinalExecutionPacketRecordError(
      "production_change_ticket_lock_record_required",
      "A production change ticket lock record is required."
    );
  }

  return lockRecord;
}
