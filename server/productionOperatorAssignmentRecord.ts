import type {
  ProductionImplementationHoldRecord,
  ProductionOperatorAssignmentRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionOperatorAssignmentRecordRequest } from "./types";

export class ProductionOperatorAssignmentRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionOperatorAssignmentRecord(
  state: ApiState,
  request: CreateProductionOperatorAssignmentRecordRequest,
  actor: string
): ProductionOperatorAssignmentRecord {
  const holdRecord = findHoldRecord(state, request);
  const providerSlug = holdRecord.provider.toLowerCase();
  const primaryOperator = request.primaryOperator?.trim() ?? "Primary Production Operator";
  const secondaryOperator = request.secondaryOperator?.trim() ?? "Secondary Production Operator";
  const executionChannelReference =
    request.executionChannelReference?.trim() ?? `production-execution-channel-${providerSlug}.md`;
  const rollbackOperator = request.rollbackOperator?.trim() ?? "Rollback Production Operator";
  const privilegedAccessConfirmationReference =
    request.privilegedAccessConfirmationReference?.trim() ?? `privileged-access-confirmation-${providerSlug}.md`;

  const checks = [
    {
      name: "Implementation hold ready",
      passed: holdRecord.status === "Ready for production implementation hold review",
      detail: `${holdRecord.id} is ${holdRecord.status}.`,
    },
    {
      name: "Primary operator assigned",
      passed: Boolean(primaryOperator),
      detail: primaryOperator || "Primary operator is required.",
    },
    {
      name: "Secondary operator assigned",
      passed: Boolean(secondaryOperator),
      detail: secondaryOperator || "Secondary operator is required.",
    },
    {
      name: "Execution channel linked",
      passed: Boolean(executionChannelReference),
      detail: executionChannelReference || "Execution channel reference is required.",
    },
    {
      name: "Rollback operator assigned",
      passed: Boolean(rollbackOperator),
      detail: rollbackOperator || "Rollback operator is required.",
    },
    {
      name: "Privileged access confirmation linked",
      passed: Boolean(privilegedAccessConfirmationReference),
      detail: privilegedAccessConfirmationReference || "Privileged access confirmation is required.",
    },
    {
      name: "Prototype does not promote adapter",
      passed: holdRecord.provisioningEnabled === false && holdRecord.killSwitch.enabled === false,
      detail: `${holdRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-operator-assignment-record-${providerSlug}-${Date.now()}`,
    provider: holdRecord.provider,
    implementationHoldRecordId: holdRecord.id,
    cabDecisionRecordId: holdRecord.cabDecisionRecordId,
    cabHandoffPacketId: holdRecord.cabHandoffPacketId,
    freezeRecordId: holdRecord.freezeRecordId,
    authorizationPacketId: holdRecord.authorizationPacketId,
    promotionDossierId: holdRecord.promotionDossierId,
    closurePackageId: holdRecord.closurePackageId,
    outcomeRecordId: holdRecord.outcomeRecordId,
    handoffPackageId: holdRecord.handoffPackageId,
    controlledSwitchRequestId: holdRecord.controlledSwitchRequestId,
    auditPackageId: holdRecord.auditPackageId,
    switchReviewId: holdRecord.switchReviewId,
    activationId: holdRecord.activationId,
    idempotencyKey: holdRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production operator assignment review"
      : "Blocked",
    requestedBy: actor,
    primaryOperator,
    secondaryOperator,
    executionChannelReference,
    rollbackOperator,
    privilegedAccessConfirmationReference,
    checks,
    evidence: [
      `Implementation hold record: ${holdRecord.id}.`,
      `CAB decision record: ${holdRecord.cabDecisionRecordId}.`,
      `Primary operator: ${primaryOperator || "missing"}.`,
      `Secondary operator: ${secondaryOperator || "missing"}.`,
      `Execution channel: ${executionChannelReference || "missing"}.`,
      `Rollback operator: ${rollbackOperator || "missing"}.`,
      `Privileged access confirmation: ${privilegedAccessConfirmationReference || "missing"}.`,
      `Kill switch: ${holdRecord.killSwitch.name}=${holdRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: holdRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findHoldRecord(
  state: ApiState,
  request: CreateProductionOperatorAssignmentRecordRequest
): ProductionImplementationHoldRecord {
  const holdRecord =
    (request.implementationHoldRecordId
      ? state.productionImplementationHoldRecords.find((item) => item.id === request.implementationHoldRecordId)
      : undefined) ??
    (request.provider
      ? state.productionImplementationHoldRecords.find((item) => item.provider === request.provider)
      : state.productionImplementationHoldRecords[0]);

  if (!holdRecord) {
    throw new ProductionOperatorAssignmentRecordError(
      "production_implementation_hold_record_required",
      "A production implementation hold record is required."
    );
  }

  return holdRecord;
}
