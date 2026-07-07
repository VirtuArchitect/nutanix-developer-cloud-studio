import type {
  ManualRealAdapterSwitchReview,
  RealAdapterLabScopeActivation,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateManualRealAdapterSwitchReviewRequest } from "./types";

export class ManualRealAdapterSwitchReviewError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createManualRealAdapterSwitchReview(
  state: ApiState,
  request: CreateManualRealAdapterSwitchReviewRequest,
  actor: string
): ManualRealAdapterSwitchReview {
  const activation = findActivation(state, request);
  const switchOperator = request.switchOperator?.trim() ?? "cloud.switch.operator";
  const secondReviewer = request.secondReviewer?.trim() ?? "security.change.reviewer";
  const maintenanceWindowReference =
    request.maintenanceWindowReference?.trim() ?? `maintenance-window-${activation.provider.toLowerCase()}.md`;
  const switchStateAuditReferences = request.switchStateAuditReferences ?? [
    `pre-switch-state-${activation.provider.toLowerCase()}.json`,
    `post-switch-state-${activation.provider.toLowerCase()}.json`,
  ];
  const rollbackContact = request.rollbackContact?.trim() ?? activation.rollbackOwner;
  const checks = [
    {
      name: "Lab scope activation ready",
      passed: activation.status === "Ready for manual real-adapter switch review",
      detail: `${activation.id} is ${activation.status}.`,
    },
    {
      name: "Switch operator assigned",
      passed: Boolean(switchOperator),
      detail: switchOperator || "Switch operator is required.",
    },
    {
      name: "Second reviewer assigned",
      passed: Boolean(secondReviewer),
      detail: secondReviewer || "Second reviewer is required.",
    },
    {
      name: "Maintenance window linked",
      passed: Boolean(maintenanceWindowReference),
      detail: maintenanceWindowReference || "Maintenance window reference is required.",
    },
    {
      name: "Switch-state audit references linked",
      passed: switchStateAuditReferences.length >= 2,
      detail: `${switchStateAuditReferences.length}/2 switch-state audit reference(s).`,
    },
    {
      name: "Rollback contact assigned",
      passed: Boolean(rollbackContact),
      detail: rollbackContact || "Rollback contact is required.",
    },
    {
      name: "Prototype does not change switch state",
      passed: activation.provisioningEnabled === false && activation.killSwitch.enabled === false,
      detail: `${activation.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `manual-real-adapter-switch-review-${activation.provider.toLowerCase()}-${Date.now()}`,
    provider: activation.provider,
    activationId: activation.id,
    dispatchApprovalId: activation.dispatchApprovalId,
    idempotencyKey: activation.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for manual switch change review" : "Blocked",
    requestedBy: actor,
    switchOperator,
    secondReviewer,
    maintenanceWindowReference,
    switchStateAuditReferences,
    rollbackContact,
    checks,
    evidence: [
      `Activation: ${activation.id}.`,
      `Dispatch approval: ${activation.dispatchApprovalId}.`,
      `Switch operator: ${switchOperator || "missing"}.`,
      `Second reviewer: ${secondReviewer || "missing"}.`,
      `Maintenance window: ${maintenanceWindowReference || "missing"}.`,
      `Switch-state audit references: ${switchStateAuditReferences.length}.`,
      `Rollback contact: ${rollbackContact || "missing"}.`,
      `Kill switch: ${activation.killSwitch.name}=${activation.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: activation.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findActivation(
  state: ApiState,
  request: CreateManualRealAdapterSwitchReviewRequest
): RealAdapterLabScopeActivation {
  const activation =
    (request.activationId
      ? state.realAdapterLabScopeActivations.find((item) => item.id === request.activationId)
      : undefined) ??
    (request.provider
      ? state.realAdapterLabScopeActivations.find((item) => item.provider === request.provider)
      : state.realAdapterLabScopeActivations[0]);

  if (!activation) {
    throw new ManualRealAdapterSwitchReviewError(
      "real_adapter_lab_scope_activation_required",
      "A real-adapter lab scope activation is required."
    );
  }

  return activation;
}
