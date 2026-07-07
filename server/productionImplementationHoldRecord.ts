import type {
  ProductionCabDecisionRecord,
  ProductionImplementationHoldRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionImplementationHoldRecordRequest } from "./types";

export class ProductionImplementationHoldRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionImplementationHoldRecord(
  state: ApiState,
  request: CreateProductionImplementationHoldRecordRequest,
  actor: string
): ProductionImplementationHoldRecord {
  const decisionRecord = findDecisionRecord(state, request);
  const providerSlug = decisionRecord.provider.toLowerCase();
  const implementationOwner = request.implementationOwner?.trim() ?? "Production Implementation Owner";
  const holdWindowReference =
    request.holdWindowReference?.trim() ?? `production-implementation-hold-window-${providerSlug}.md`;
  const conditionAcceptanceReference =
    request.conditionAcceptanceReference?.trim() ?? `cab-condition-acceptance-${providerSlug}.md`;
  const rollbackImplementationOwner =
    request.rollbackImplementationOwner?.trim() ?? "Rollback Implementation Owner";
  const releaseFreezeAcknowledgmentReference =
    request.releaseFreezeAcknowledgmentReference?.trim() ?? `release-freeze-acknowledgment-${providerSlug}.md`;

  const checks = [
    {
      name: "CAB decision ready",
      passed: decisionRecord.status === "Ready for production CAB decision review",
      detail: `${decisionRecord.id} is ${decisionRecord.status}.`,
    },
    {
      name: "Implementation owner assigned",
      passed: Boolean(implementationOwner),
      detail: implementationOwner || "Implementation owner is required.",
    },
    {
      name: "Hold window linked",
      passed: Boolean(holdWindowReference),
      detail: holdWindowReference || "Hold window reference is required.",
    },
    {
      name: "Condition acceptance linked",
      passed: Boolean(conditionAcceptanceReference),
      detail: conditionAcceptanceReference || "Condition acceptance reference is required.",
    },
    {
      name: "Rollback implementation owner assigned",
      passed: Boolean(rollbackImplementationOwner),
      detail: rollbackImplementationOwner || "Rollback implementation owner is required.",
    },
    {
      name: "Release freeze acknowledgment linked",
      passed: Boolean(releaseFreezeAcknowledgmentReference),
      detail: releaseFreezeAcknowledgmentReference || "Release freeze acknowledgment is required.",
    },
    {
      name: "Prototype does not promote adapter",
      passed: decisionRecord.provisioningEnabled === false && decisionRecord.killSwitch.enabled === false,
      detail: `${decisionRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-implementation-hold-record-${providerSlug}-${Date.now()}`,
    provider: decisionRecord.provider,
    cabDecisionRecordId: decisionRecord.id,
    cabHandoffPacketId: decisionRecord.cabHandoffPacketId,
    freezeRecordId: decisionRecord.freezeRecordId,
    authorizationPacketId: decisionRecord.authorizationPacketId,
    promotionDossierId: decisionRecord.promotionDossierId,
    closurePackageId: decisionRecord.closurePackageId,
    outcomeRecordId: decisionRecord.outcomeRecordId,
    handoffPackageId: decisionRecord.handoffPackageId,
    controlledSwitchRequestId: decisionRecord.controlledSwitchRequestId,
    auditPackageId: decisionRecord.auditPackageId,
    switchReviewId: decisionRecord.switchReviewId,
    activationId: decisionRecord.activationId,
    idempotencyKey: decisionRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production implementation hold review"
      : "Blocked",
    requestedBy: actor,
    implementationOwner,
    holdWindowReference,
    conditionAcceptanceReference,
    rollbackImplementationOwner,
    releaseFreezeAcknowledgmentReference,
    checks,
    evidence: [
      `CAB decision record: ${decisionRecord.id}.`,
      `CAB handoff packet: ${decisionRecord.cabHandoffPacketId}.`,
      `Implementation owner: ${implementationOwner || "missing"}.`,
      `Hold window: ${holdWindowReference || "missing"}.`,
      `Condition acceptance: ${conditionAcceptanceReference || "missing"}.`,
      `Rollback implementation owner: ${rollbackImplementationOwner || "missing"}.`,
      `Release freeze acknowledgment: ${releaseFreezeAcknowledgmentReference || "missing"}.`,
      `Kill switch: ${decisionRecord.killSwitch.name}=${decisionRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: decisionRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findDecisionRecord(
  state: ApiState,
  request: CreateProductionImplementationHoldRecordRequest
): ProductionCabDecisionRecord {
  const decisionRecord =
    (request.cabDecisionRecordId
      ? state.productionCabDecisionRecords.find((item) => item.id === request.cabDecisionRecordId)
      : undefined) ??
    (request.provider
      ? state.productionCabDecisionRecords.find((item) => item.provider === request.provider)
      : state.productionCabDecisionRecords[0]);

  if (!decisionRecord) {
    throw new ProductionImplementationHoldRecordError(
      "production_cab_decision_record_required",
      "A production CAB decision record is required."
    );
  }

  return decisionRecord;
}
