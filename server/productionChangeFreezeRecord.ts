import type {
  ProductionAdapterAuthorizationPacket,
  ProductionChangeFreezeRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionChangeFreezeRecordRequest } from "./types";

export class ProductionChangeFreezeRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionChangeFreezeRecord(
  state: ApiState,
  request: CreateProductionChangeFreezeRecordRequest,
  actor: string
): ProductionChangeFreezeRecord {
  const authorizationPacket = findAuthorizationPacket(state, request);
  const providerSlug = authorizationPacket.provider.toLowerCase();
  const freezeOwner = request.freezeOwner?.trim() ?? "Production Change Manager";
  const freezeWindowReference =
    request.freezeWindowReference?.trim() ?? `production-change-freeze-window-${providerSlug}.md`;
  const stakeholderNotificationReference =
    request.stakeholderNotificationReference?.trim() ?? `stakeholder-notification-${providerSlug}.md`;
  const rollbackStandbyReference =
    request.rollbackStandbyReference?.trim() ?? `rollback-standby-roster-${providerSlug}.md`;
  const noChangeExceptionPlanReference =
    request.noChangeExceptionPlanReference?.trim() ?? `no-change-exception-plan-${providerSlug}.md`;

  const checks = [
    {
      name: "Authorization packet ready",
      passed: authorizationPacket.status === "Ready for production adapter authorization review",
      detail: `${authorizationPacket.id} is ${authorizationPacket.status}.`,
    },
    {
      name: "Freeze owner assigned",
      passed: Boolean(freezeOwner),
      detail: freezeOwner || "Freeze owner is required.",
    },
    {
      name: "Freeze window linked",
      passed: Boolean(freezeWindowReference),
      detail: freezeWindowReference || "Freeze window reference is required.",
    },
    {
      name: "Stakeholder notification linked",
      passed: Boolean(stakeholderNotificationReference),
      detail: stakeholderNotificationReference || "Stakeholder notification reference is required.",
    },
    {
      name: "Rollback standby linked",
      passed: Boolean(rollbackStandbyReference),
      detail: rollbackStandbyReference || "Rollback standby reference is required.",
    },
    {
      name: "No-change exception plan linked",
      passed: Boolean(noChangeExceptionPlanReference),
      detail: noChangeExceptionPlanReference || "No-change exception plan reference is required.",
    },
    {
      name: "Prototype does not promote adapter",
      passed: authorizationPacket.provisioningEnabled === false && authorizationPacket.killSwitch.enabled === false,
      detail: `${authorizationPacket.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-change-freeze-record-${providerSlug}-${Date.now()}`,
    provider: authorizationPacket.provider,
    authorizationPacketId: authorizationPacket.id,
    promotionDossierId: authorizationPacket.promotionDossierId,
    closurePackageId: authorizationPacket.closurePackageId,
    outcomeRecordId: authorizationPacket.outcomeRecordId,
    handoffPackageId: authorizationPacket.handoffPackageId,
    controlledSwitchRequestId: authorizationPacket.controlledSwitchRequestId,
    auditPackageId: authorizationPacket.auditPackageId,
    switchReviewId: authorizationPacket.switchReviewId,
    activationId: authorizationPacket.activationId,
    idempotencyKey: authorizationPacket.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production change freeze review"
      : "Blocked",
    requestedBy: actor,
    freezeOwner,
    freezeWindowReference,
    stakeholderNotificationReference,
    rollbackStandbyReference,
    noChangeExceptionPlanReference,
    checks,
    evidence: [
      `Authorization packet: ${authorizationPacket.id}.`,
      `Promotion dossier: ${authorizationPacket.promotionDossierId}.`,
      `Freeze owner: ${freezeOwner || "missing"}.`,
      `Freeze window: ${freezeWindowReference || "missing"}.`,
      `Stakeholder notification: ${stakeholderNotificationReference || "missing"}.`,
      `Rollback standby: ${rollbackStandbyReference || "missing"}.`,
      `No-change exception plan: ${noChangeExceptionPlanReference || "missing"}.`,
      `Kill switch: ${authorizationPacket.killSwitch.name}=${authorizationPacket.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: authorizationPacket.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findAuthorizationPacket(
  state: ApiState,
  request: CreateProductionChangeFreezeRecordRequest
): ProductionAdapterAuthorizationPacket {
  const authorizationPacket =
    (request.authorizationPacketId
      ? state.productionAdapterAuthorizationPackets.find((item) => item.id === request.authorizationPacketId)
      : undefined) ??
    (request.provider
      ? state.productionAdapterAuthorizationPackets.find((item) => item.provider === request.provider)
      : state.productionAdapterAuthorizationPackets[0]);

  if (!authorizationPacket) {
    throw new ProductionChangeFreezeRecordError(
      "production_authorization_packet_required",
      "A production adapter authorization packet is required."
    );
  }

  return authorizationPacket;
}
