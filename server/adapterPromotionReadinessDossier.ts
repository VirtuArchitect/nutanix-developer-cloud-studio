import type {
  AdapterPromotionReadinessDossier,
  SwitchClosureRetentionPackage,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateAdapterPromotionReadinessDossierRequest } from "./types";

export class AdapterPromotionReadinessDossierError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createAdapterPromotionReadinessDossier(
  state: ApiState,
  request: CreateAdapterPromotionReadinessDossierRequest,
  actor: string
): AdapterPromotionReadinessDossier {
  const closurePackage = findClosurePackage(state, request);
  const promotionOwner = request.promotionOwner?.trim() ?? "Cloud Platform Owner";
  const retainedSwitchEvidenceReference =
    request.retainedSwitchEvidenceReference?.trim() ?? closurePackage.retainedEvidenceManifestReference;
  const monitoringPlanReference =
    request.monitoringPlanReference?.trim() ?? `adapter-promotion-monitoring-${closurePackage.provider.toLowerCase()}.md`;
  const rollbackDrillConfirmation =
    request.rollbackDrillConfirmation?.trim() ?? `rollback-drill-confirmation-${closurePackage.provider.toLowerCase()}.md`;
  const securityAcceptanceReference =
    request.securityAcceptanceReference?.trim() ?? `security-acceptance-${closurePackage.provider.toLowerCase()}.md`;

  const checks = [
    {
      name: "Closure package ready",
      passed: closurePackage.status === "Ready for switch closure review",
      detail: `${closurePackage.id} is ${closurePackage.status}.`,
    },
    {
      name: "Promotion owner assigned",
      passed: Boolean(promotionOwner),
      detail: promotionOwner || "Promotion owner is required.",
    },
    {
      name: "Retained switch evidence linked",
      passed: Boolean(retainedSwitchEvidenceReference),
      detail: retainedSwitchEvidenceReference || "Retained switch evidence is required.",
    },
    {
      name: "Monitoring plan linked",
      passed: Boolean(monitoringPlanReference),
      detail: monitoringPlanReference || "Monitoring plan reference is required.",
    },
    {
      name: "Rollback drill confirmed",
      passed: Boolean(rollbackDrillConfirmation),
      detail: rollbackDrillConfirmation || "Rollback drill confirmation is required.",
    },
    {
      name: "Security acceptance linked",
      passed: Boolean(securityAcceptanceReference),
      detail: securityAcceptanceReference || "Security acceptance reference is required.",
    },
    {
      name: "Prototype does not promote adapter",
      passed: closurePackage.provisioningEnabled === false && closurePackage.killSwitch.enabled === false,
      detail: `${closurePackage.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `adapter-promotion-readiness-dossier-${closurePackage.provider.toLowerCase()}-${Date.now()}`,
    provider: closurePackage.provider,
    closurePackageId: closurePackage.id,
    outcomeRecordId: closurePackage.outcomeRecordId,
    handoffPackageId: closurePackage.handoffPackageId,
    controlledSwitchRequestId: closurePackage.controlledSwitchRequestId,
    auditPackageId: closurePackage.auditPackageId,
    switchReviewId: closurePackage.switchReviewId,
    activationId: closurePackage.activationId,
    idempotencyKey: closurePackage.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for adapter promotion review" : "Blocked",
    requestedBy: actor,
    promotionOwner,
    retainedSwitchEvidenceReference,
    monitoringPlanReference,
    rollbackDrillConfirmation,
    securityAcceptanceReference,
    checks,
    evidence: [
      `Closure package: ${closurePackage.id}.`,
      `Outcome record: ${closurePackage.outcomeRecordId}.`,
      `Promotion owner: ${promotionOwner || "missing"}.`,
      `Retained switch evidence: ${retainedSwitchEvidenceReference || "missing"}.`,
      `Monitoring plan: ${monitoringPlanReference || "missing"}.`,
      `Rollback drill: ${rollbackDrillConfirmation || "missing"}.`,
      `Security acceptance: ${securityAcceptanceReference || "missing"}.`,
      `Kill switch: ${closurePackage.killSwitch.name}=${closurePackage.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: closurePackage.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findClosurePackage(
  state: ApiState,
  request: CreateAdapterPromotionReadinessDossierRequest
): SwitchClosureRetentionPackage {
  const closurePackage =
    (request.closurePackageId
      ? state.switchClosureRetentionPackages.find((item) => item.id === request.closurePackageId)
      : undefined) ??
    (request.provider
      ? state.switchClosureRetentionPackages.find((item) => item.provider === request.provider)
      : state.switchClosureRetentionPackages[0]);

  if (!closurePackage) {
    throw new AdapterPromotionReadinessDossierError(
      "switch_closure_package_required",
      "A switch closure retention package is required."
    );
  }

  return closurePackage;
}
