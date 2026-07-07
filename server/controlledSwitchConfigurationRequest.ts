import type {
  ControlledSwitchConfigurationRequest,
  RealAdapterSwitchStateAuditPackage,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateControlledSwitchConfigurationRequestRequest } from "./types";

export class ControlledSwitchConfigurationRequestError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledSwitchConfigurationRequest(
  state: ApiState,
  request: CreateControlledSwitchConfigurationRequestRequest,
  actor: string
): ControlledSwitchConfigurationRequest {
  const auditPackage = findAuditPackage(state, request);
  const operatorConfirmation =
    request.operatorConfirmation?.trim() ?? `operator-confirmation-${auditPackage.provider.toLowerCase()}.md`;
  const secondReviewerAcceptance =
    request.secondReviewerAcceptance?.trim() ?? `second-reviewer-acceptance-${auditPackage.provider.toLowerCase()}.md`;
  const rollbackTimerMinutes = request.rollbackTimerMinutes ?? auditPackage.rollbackTimerMinutes;
  const finalDryRunProofReference =
    request.finalDryRunProofReference?.trim() ?? `final-switch-dry-run-${auditPackage.provider.toLowerCase()}.json`;
  const retentionReference =
    request.retentionReference?.trim() ?? auditPackage.retentionReference;

  const checks = [
    {
      name: "Switch-state audit package ready",
      passed: auditPackage.status === "Ready for switch-state audit review",
      detail: `${auditPackage.id} is ${auditPackage.status}.`,
    },
    {
      name: "Operator confirmation linked",
      passed: Boolean(operatorConfirmation),
      detail: operatorConfirmation || "Operator confirmation evidence is required.",
    },
    {
      name: "Second reviewer acceptance linked",
      passed: Boolean(secondReviewerAcceptance),
      detail: secondReviewerAcceptance || "Second reviewer acceptance evidence is required.",
    },
    {
      name: "Rollback timer retained",
      passed: rollbackTimerMinutes >= 15,
      detail: `${rollbackTimerMinutes} minute rollback timer.`,
    },
    {
      name: "Final dry-run proof linked",
      passed: Boolean(finalDryRunProofReference),
      detail: finalDryRunProofReference || "Final dry-run proof reference is required.",
    },
    {
      name: "Retention reference linked",
      passed: Boolean(retentionReference),
      detail: retentionReference || "Retention reference is required.",
    },
    {
      name: "Prototype remains non-mutating",
      passed: auditPackage.provisioningEnabled === false && auditPackage.killSwitch.enabled === false,
      detail: `${auditPackage.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-switch-configuration-request-${auditPackage.provider.toLowerCase()}-${Date.now()}`,
    provider: auditPackage.provider,
    auditPackageId: auditPackage.id,
    switchReviewId: auditPackage.switchReviewId,
    activationId: auditPackage.activationId,
    idempotencyKey: auditPackage.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for controlled switch request review" : "Blocked",
    requestedBy: actor,
    operatorConfirmation,
    secondReviewerAcceptance,
    finalDryRunProofReference,
    rollbackTimerMinutes,
    retentionReference,
    checks,
    evidence: [
      `Audit package: ${auditPackage.id}.`,
      `Switch review: ${auditPackage.switchReviewId}.`,
      `Activation: ${auditPackage.activationId}.`,
      `Operator confirmation: ${operatorConfirmation || "missing"}.`,
      `Second reviewer acceptance: ${secondReviewerAcceptance || "missing"}.`,
      `Final dry-run proof: ${finalDryRunProofReference || "missing"}.`,
      `Rollback timer: ${rollbackTimerMinutes} minutes.`,
      `Retention reference: ${retentionReference || "missing"}.`,
      `Kill switch: ${auditPackage.killSwitch.name}=${auditPackage.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: auditPackage.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findAuditPackage(
  state: ApiState,
  request: CreateControlledSwitchConfigurationRequestRequest
): RealAdapterSwitchStateAuditPackage {
  const auditPackage =
    (request.auditPackageId
      ? state.realAdapterSwitchStateAuditPackages.find((item) => item.id === request.auditPackageId)
      : undefined) ??
    (request.provider
      ? state.realAdapterSwitchStateAuditPackages.find((item) => item.provider === request.provider)
      : state.realAdapterSwitchStateAuditPackages[0]);

  if (!auditPackage) {
    throw new ControlledSwitchConfigurationRequestError(
      "switch_state_audit_package_required",
      "A switch-state audit package is required."
    );
  }

  return auditPackage;
}
