import type {
  AdapterPromotionReadinessDossier,
  ProductionAdapterAuthorizationPacket,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionAdapterAuthorizationPacketRequest } from "./types";

export class ProductionAdapterAuthorizationPacketError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionAdapterAuthorizationPacket(
  state: ApiState,
  request: CreateProductionAdapterAuthorizationPacketRequest,
  actor: string
): ProductionAdapterAuthorizationPacket {
  const promotionDossier = findPromotionDossier(state, request);
  const providerSlug = promotionDossier.provider.toLowerCase();
  const productionApprover = request.productionApprover?.trim() ?? "Production Change Authority";
  const changeTicketReference = request.changeTicketReference?.trim() ?? `change-ticket-${providerSlug}.md`;
  const releaseWindowReference =
    request.releaseWindowReference?.trim() ?? `production-release-window-${providerSlug}.md`;
  const emergencyRollbackAuthorization =
    request.emergencyRollbackAuthorization?.trim() ?? `emergency-rollback-authorization-${providerSlug}.md`;
  const complianceAcceptanceReference =
    request.complianceAcceptanceReference?.trim() ?? `compliance-acceptance-${providerSlug}.md`;

  const checks = [
    {
      name: "Promotion dossier ready",
      passed: promotionDossier.status === "Ready for adapter promotion review",
      detail: `${promotionDossier.id} is ${promotionDossier.status}.`,
    },
    {
      name: "Production approver assigned",
      passed: Boolean(productionApprover),
      detail: productionApprover || "Production approver is required.",
    },
    {
      name: "Change ticket linked",
      passed: Boolean(changeTicketReference),
      detail: changeTicketReference || "Change ticket reference is required.",
    },
    {
      name: "Release window linked",
      passed: Boolean(releaseWindowReference),
      detail: releaseWindowReference || "Release window reference is required.",
    },
    {
      name: "Emergency rollback authorized",
      passed: Boolean(emergencyRollbackAuthorization),
      detail: emergencyRollbackAuthorization || "Emergency rollback authorization is required.",
    },
    {
      name: "Compliance acceptance linked",
      passed: Boolean(complianceAcceptanceReference),
      detail: complianceAcceptanceReference || "Compliance acceptance reference is required.",
    },
    {
      name: "Prototype does not authorize promotion",
      passed: promotionDossier.provisioningEnabled === false && promotionDossier.killSwitch.enabled === false,
      detail: `${promotionDossier.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-adapter-authorization-packet-${providerSlug}-${Date.now()}`,
    provider: promotionDossier.provider,
    promotionDossierId: promotionDossier.id,
    closurePackageId: promotionDossier.closurePackageId,
    outcomeRecordId: promotionDossier.outcomeRecordId,
    handoffPackageId: promotionDossier.handoffPackageId,
    controlledSwitchRequestId: promotionDossier.controlledSwitchRequestId,
    auditPackageId: promotionDossier.auditPackageId,
    switchReviewId: promotionDossier.switchReviewId,
    activationId: promotionDossier.activationId,
    idempotencyKey: promotionDossier.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production adapter authorization review"
      : "Blocked",
    requestedBy: actor,
    productionApprover,
    changeTicketReference,
    releaseWindowReference,
    emergencyRollbackAuthorization,
    complianceAcceptanceReference,
    checks,
    evidence: [
      `Promotion dossier: ${promotionDossier.id}.`,
      `Closure package: ${promotionDossier.closurePackageId}.`,
      `Production approver: ${productionApprover || "missing"}.`,
      `Change ticket: ${changeTicketReference || "missing"}.`,
      `Release window: ${releaseWindowReference || "missing"}.`,
      `Emergency rollback authorization: ${emergencyRollbackAuthorization || "missing"}.`,
      `Compliance acceptance: ${complianceAcceptanceReference || "missing"}.`,
      `Kill switch: ${promotionDossier.killSwitch.name}=${promotionDossier.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: promotionDossier.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findPromotionDossier(
  state: ApiState,
  request: CreateProductionAdapterAuthorizationPacketRequest
): AdapterPromotionReadinessDossier {
  const promotionDossier =
    (request.promotionDossierId
      ? state.adapterPromotionReadinessDossiers.find((item) => item.id === request.promotionDossierId)
      : undefined) ??
    (request.provider
      ? state.adapterPromotionReadinessDossiers.find((item) => item.provider === request.provider)
      : state.adapterPromotionReadinessDossiers[0]);

  if (!promotionDossier) {
    throw new ProductionAdapterAuthorizationPacketError(
      "adapter_promotion_dossier_required",
      "An adapter promotion readiness dossier is required."
    );
  }

  return promotionDossier;
}
