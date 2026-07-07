import type {
  ProductionCabHandoffPacket,
  ProductionChangeFreezeRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionCabHandoffPacketRequest } from "./types";

export class ProductionCabHandoffPacketError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionCabHandoffPacket(
  state: ApiState,
  request: CreateProductionCabHandoffPacketRequest,
  actor: string
): ProductionCabHandoffPacket {
  const freezeRecord = findFreezeRecord(state, request);
  const providerSlug = freezeRecord.provider.toLowerCase();
  const cabOwner = request.cabOwner?.trim() ?? "Production CAB Chair";
  const cabAgendaReference = request.cabAgendaReference?.trim() ?? `cab-agenda-${providerSlug}.md`;
  const riskAcceptanceReference =
    request.riskAcceptanceReference?.trim() ?? `risk-acceptance-${providerSlug}.md`;
  const rollbackRepresentationReference =
    request.rollbackRepresentationReference?.trim() ?? `rollback-representation-${providerSlug}.md`;
  const finalGoNoGoAgendaReference =
    request.finalGoNoGoAgendaReference?.trim() ?? `final-go-no-go-agenda-${providerSlug}.md`;

  const checks = [
    {
      name: "Change freeze ready",
      passed: freezeRecord.status === "Ready for production change freeze review",
      detail: `${freezeRecord.id} is ${freezeRecord.status}.`,
    },
    {
      name: "CAB owner assigned",
      passed: Boolean(cabOwner),
      detail: cabOwner || "CAB owner is required.",
    },
    {
      name: "CAB agenda linked",
      passed: Boolean(cabAgendaReference),
      detail: cabAgendaReference || "CAB agenda reference is required.",
    },
    {
      name: "Risk acceptance linked",
      passed: Boolean(riskAcceptanceReference),
      detail: riskAcceptanceReference || "Risk acceptance reference is required.",
    },
    {
      name: "Rollback represented",
      passed: Boolean(rollbackRepresentationReference),
      detail: rollbackRepresentationReference || "Rollback representation reference is required.",
    },
    {
      name: "Final go/no-go agenda linked",
      passed: Boolean(finalGoNoGoAgendaReference),
      detail: finalGoNoGoAgendaReference || "Final go/no-go agenda reference is required.",
    },
    {
      name: "Prototype does not promote adapter",
      passed: freezeRecord.provisioningEnabled === false && freezeRecord.killSwitch.enabled === false,
      detail: `${freezeRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-cab-handoff-packet-${providerSlug}-${Date.now()}`,
    provider: freezeRecord.provider,
    freezeRecordId: freezeRecord.id,
    authorizationPacketId: freezeRecord.authorizationPacketId,
    promotionDossierId: freezeRecord.promotionDossierId,
    closurePackageId: freezeRecord.closurePackageId,
    outcomeRecordId: freezeRecord.outcomeRecordId,
    handoffPackageId: freezeRecord.handoffPackageId,
    controlledSwitchRequestId: freezeRecord.controlledSwitchRequestId,
    auditPackageId: freezeRecord.auditPackageId,
    switchReviewId: freezeRecord.switchReviewId,
    activationId: freezeRecord.activationId,
    idempotencyKey: freezeRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production CAB handoff review"
      : "Blocked",
    requestedBy: actor,
    cabOwner,
    cabAgendaReference,
    riskAcceptanceReference,
    rollbackRepresentationReference,
    finalGoNoGoAgendaReference,
    checks,
    evidence: [
      `Freeze record: ${freezeRecord.id}.`,
      `Authorization packet: ${freezeRecord.authorizationPacketId}.`,
      `CAB owner: ${cabOwner || "missing"}.`,
      `CAB agenda: ${cabAgendaReference || "missing"}.`,
      `Risk acceptance: ${riskAcceptanceReference || "missing"}.`,
      `Rollback representation: ${rollbackRepresentationReference || "missing"}.`,
      `Final go/no-go agenda: ${finalGoNoGoAgendaReference || "missing"}.`,
      `Kill switch: ${freezeRecord.killSwitch.name}=${freezeRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: freezeRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findFreezeRecord(
  state: ApiState,
  request: CreateProductionCabHandoffPacketRequest
): ProductionChangeFreezeRecord {
  const freezeRecord =
    (request.freezeRecordId
      ? state.productionChangeFreezeRecords.find((item) => item.id === request.freezeRecordId)
      : undefined) ??
    (request.provider
      ? state.productionChangeFreezeRecords.find((item) => item.provider === request.provider)
      : state.productionChangeFreezeRecords[0]);

  if (!freezeRecord) {
    throw new ProductionCabHandoffPacketError(
      "production_change_freeze_record_required",
      "A production change freeze record is required."
    );
  }

  return freezeRecord;
}
