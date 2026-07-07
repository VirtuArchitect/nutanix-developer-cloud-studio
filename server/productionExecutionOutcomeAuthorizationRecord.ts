import type {
  ProductionExecutionHoldPointRecord,
  ProductionExecutionOutcomeAuthorizationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionOutcomeAuthorizationRecordRequest } from "./types";

export class ProductionExecutionOutcomeAuthorizationRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionOutcomeAuthorizationRecord(
  state: ApiState,
  request: CreateProductionExecutionOutcomeAuthorizationRecordRequest,
  actor: string
): ProductionExecutionOutcomeAuthorizationRecord {
  const holdPointRecord = findHoldPointRecord(state, request);
  const providerSlug = holdPointRecord.provider.toLowerCase();
  const outcomeAuthority = request.outcomeAuthority?.trim() ?? "Production Outcome Authority";
  const expectedResultEnvelopeReference =
    request.expectedResultEnvelopeReference?.trim() ?? `production-expected-result-envelope-${providerSlug}.md`;
  const rollbackDecisionRuleReference =
    request.rollbackDecisionRuleReference?.trim() ?? `production-rollback-decision-rule-${providerSlug}.md`;
  const incidentDeclarationRuleReference =
    request.incidentDeclarationRuleReference?.trim() ??
    `production-incident-declaration-rule-${providerSlug}.md`;
  const evidenceCaptureRuleReference =
    request.evidenceCaptureRuleReference?.trim() ?? `production-evidence-capture-rule-${providerSlug}.md`;

  const checks = [
    {
      name: "Execution hold-point ready",
      passed: holdPointRecord.status === "Ready for production execution hold-point review",
      detail: `${holdPointRecord.id} is ${holdPointRecord.status}.`,
    },
    {
      name: "Outcome authority assigned",
      passed: Boolean(outcomeAuthority),
      detail: outcomeAuthority || "Outcome authority is required.",
    },
    {
      name: "Expected result envelope linked",
      passed: Boolean(expectedResultEnvelopeReference),
      detail: expectedResultEnvelopeReference || "Expected result envelope reference is required.",
    },
    {
      name: "Rollback decision rule linked",
      passed: Boolean(rollbackDecisionRuleReference),
      detail: rollbackDecisionRuleReference || "Rollback decision rule reference is required.",
    },
    {
      name: "Incident declaration rule linked",
      passed: Boolean(incidentDeclarationRuleReference),
      detail: incidentDeclarationRuleReference || "Incident declaration rule reference is required.",
    },
    {
      name: "Evidence capture rule linked",
      passed: Boolean(evidenceCaptureRuleReference),
      detail: evidenceCaptureRuleReference || "Evidence capture rule reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed: holdPointRecord.provisioningEnabled === false && holdPointRecord.killSwitch.enabled === false,
      detail: `${holdPointRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-outcome-authorization-record-${providerSlug}-${Date.now()}`,
    provider: holdPointRecord.provider,
    executionHoldPointRecordId: holdPointRecord.id,
    finalExecutionPacketRecordId: holdPointRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: holdPointRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: holdPointRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: holdPointRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: holdPointRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: holdPointRecord.implementationHoldRecordId,
    cabDecisionRecordId: holdPointRecord.cabDecisionRecordId,
    cabHandoffPacketId: holdPointRecord.cabHandoffPacketId,
    freezeRecordId: holdPointRecord.freezeRecordId,
    authorizationPacketId: holdPointRecord.authorizationPacketId,
    promotionDossierId: holdPointRecord.promotionDossierId,
    closurePackageId: holdPointRecord.closurePackageId,
    outcomeRecordId: holdPointRecord.outcomeRecordId,
    handoffPackageId: holdPointRecord.handoffPackageId,
    controlledSwitchRequestId: holdPointRecord.controlledSwitchRequestId,
    auditPackageId: holdPointRecord.auditPackageId,
    switchReviewId: holdPointRecord.switchReviewId,
    activationId: holdPointRecord.activationId,
    idempotencyKey: holdPointRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution outcome authorization review"
      : "Blocked",
    requestedBy: actor,
    outcomeAuthority,
    expectedResultEnvelopeReference,
    rollbackDecisionRuleReference,
    incidentDeclarationRuleReference,
    evidenceCaptureRuleReference,
    checks,
    evidence: [
      `Execution hold-point record: ${holdPointRecord.id}.`,
      `Final execution packet record: ${holdPointRecord.finalExecutionPacketRecordId}.`,
      `Outcome authority: ${outcomeAuthority || "missing"}.`,
      `Expected result envelope: ${expectedResultEnvelopeReference || "missing"}.`,
      `Rollback decision rule: ${rollbackDecisionRuleReference || "missing"}.`,
      `Incident declaration rule: ${incidentDeclarationRuleReference || "missing"}.`,
      `Evidence capture rule: ${evidenceCaptureRuleReference || "missing"}.`,
      `Kill switch: ${holdPointRecord.killSwitch.name}=${
        holdPointRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: holdPointRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findHoldPointRecord(
  state: ApiState,
  request: CreateProductionExecutionOutcomeAuthorizationRecordRequest
): ProductionExecutionHoldPointRecord {
  const holdPointRecord =
    (request.executionHoldPointRecordId
      ? state.productionExecutionHoldPointRecords.find((item) => item.id === request.executionHoldPointRecordId)
      : undefined) ??
    (request.provider
      ? state.productionExecutionHoldPointRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionHoldPointRecords[0]);

  if (!holdPointRecord) {
    throw new ProductionExecutionOutcomeAuthorizationRecordError(
      "production_execution_hold_point_record_required",
      "A production execution hold-point record is required."
    );
  }

  return holdPointRecord;
}
