import type {
  ProductionCabDecisionRecord,
  ProductionCabHandoffPacket,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionCabDecisionRecordRequest } from "./types";

export class ProductionCabDecisionRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionCabDecisionRecord(
  state: ApiState,
  request: CreateProductionCabDecisionRecordRequest,
  actor: string
): ProductionCabDecisionRecord {
  const handoffPacket = findHandoffPacket(state, request);
  const providerSlug = handoffPacket.provider.toLowerCase();
  const cabDecision = request.cabDecision ?? "Approved with conditions";
  const decisionAuthority = request.decisionAuthority?.trim() ?? "Production CAB";
  const conditionListReference =
    request.conditionListReference?.trim() ?? `cab-condition-list-${providerSlug}.md`;
  const rollbackApprovalReference =
    request.rollbackApprovalReference?.trim() ?? `cab-rollback-approval-${providerSlug}.md`;
  const decisionMinutesReference =
    request.decisionMinutesReference?.trim() ?? `cab-decision-minutes-${providerSlug}.md`;

  const checks = [
    {
      name: "CAB handoff ready",
      passed: handoffPacket.status === "Ready for production CAB handoff review",
      detail: `${handoffPacket.id} is ${handoffPacket.status}.`,
    },
    {
      name: "CAB decision recorded",
      passed: cabDecision === "Approved with conditions",
      detail: cabDecision,
    },
    {
      name: "Decision authority assigned",
      passed: Boolean(decisionAuthority),
      detail: decisionAuthority || "Decision authority is required.",
    },
    {
      name: "Condition list linked",
      passed: Boolean(conditionListReference),
      detail: conditionListReference || "Condition list reference is required.",
    },
    {
      name: "Rollback approval linked",
      passed: Boolean(rollbackApprovalReference),
      detail: rollbackApprovalReference || "Rollback approval reference is required.",
    },
    {
      name: "Decision minutes linked",
      passed: Boolean(decisionMinutesReference),
      detail: decisionMinutesReference || "Decision minutes reference is required.",
    },
    {
      name: "Prototype does not promote adapter",
      passed: handoffPacket.provisioningEnabled === false && handoffPacket.killSwitch.enabled === false,
      detail: `${handoffPacket.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-cab-decision-record-${providerSlug}-${Date.now()}`,
    provider: handoffPacket.provider,
    cabHandoffPacketId: handoffPacket.id,
    freezeRecordId: handoffPacket.freezeRecordId,
    authorizationPacketId: handoffPacket.authorizationPacketId,
    promotionDossierId: handoffPacket.promotionDossierId,
    closurePackageId: handoffPacket.closurePackageId,
    outcomeRecordId: handoffPacket.outcomeRecordId,
    handoffPackageId: handoffPacket.handoffPackageId,
    controlledSwitchRequestId: handoffPacket.controlledSwitchRequestId,
    auditPackageId: handoffPacket.auditPackageId,
    switchReviewId: handoffPacket.switchReviewId,
    activationId: handoffPacket.activationId,
    idempotencyKey: handoffPacket.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production CAB decision review"
      : "Blocked",
    requestedBy: actor,
    cabDecision,
    decisionAuthority,
    conditionListReference,
    rollbackApprovalReference,
    decisionMinutesReference,
    checks,
    evidence: [
      `CAB handoff packet: ${handoffPacket.id}.`,
      `Freeze record: ${handoffPacket.freezeRecordId}.`,
      `CAB decision: ${cabDecision}.`,
      `Decision authority: ${decisionAuthority || "missing"}.`,
      `Condition list: ${conditionListReference || "missing"}.`,
      `Rollback approval: ${rollbackApprovalReference || "missing"}.`,
      `Decision minutes: ${decisionMinutesReference || "missing"}.`,
      `Kill switch: ${handoffPacket.killSwitch.name}=${handoffPacket.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: handoffPacket.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findHandoffPacket(
  state: ApiState,
  request: CreateProductionCabDecisionRecordRequest
): ProductionCabHandoffPacket {
  const handoffPacket =
    (request.cabHandoffPacketId
      ? state.productionCabHandoffPackets.find((item) => item.id === request.cabHandoffPacketId)
      : undefined) ??
    (request.provider
      ? state.productionCabHandoffPackets.find((item) => item.provider === request.provider)
      : state.productionCabHandoffPackets[0]);

  if (!handoffPacket) {
    throw new ProductionCabDecisionRecordError(
      "production_cab_handoff_packet_required",
      "A production CAB handoff packet is required."
    );
  }

  return handoffPacket;
}
