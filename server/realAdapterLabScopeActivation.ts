import type {
  ExecutionBrokerDispatchApproval,
  RealAdapterLabScopeActivation,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateRealAdapterLabScopeActivationRequest } from "./types";

export class RealAdapterLabScopeActivationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createRealAdapterLabScopeActivation(
  state: ApiState,
  request: CreateRealAdapterLabScopeActivationRequest,
  actor: string
): RealAdapterLabScopeActivation {
  const dispatchApproval = findDispatchApproval(state, request);
  const authorizedScopeReference =
    request.authorizedScopeReference?.trim() ?? `authorized-lab-scope-${dispatchApproval.provider.toLowerCase()}.md`;
  const pentestCompletionEvidence =
    request.pentestCompletionEvidence?.trim() ?? `pentest-complete-${dispatchApproval.provider.toLowerCase()}.md`;
  const rollbackOwner = request.rollbackOwner?.trim() ?? "Cloud Operations";
  const boundedProviderTargets = request.boundedProviderTargets ?? [
    `${dispatchApproval.provider.toLowerCase()}-lab-cluster-01`,
    `${dispatchApproval.provider.toLowerCase()}-lab-project-dev`,
  ];
  const manualOperatorControls = request.manualOperatorControls ?? [
    "manual-change-window-approved",
    "two-person-operator-confirmation",
    "post-change-destroy-plan-ready",
  ];
  const checks = [
    {
      name: "Dispatch approval ready",
      passed: dispatchApproval.status === "Ready for authorized lab dispatch review",
      detail: `${dispatchApproval.id} is ${dispatchApproval.status}.`,
    },
    {
      name: "Authorized scope linked",
      passed: Boolean(authorizedScopeReference),
      detail: authorizedScopeReference || "Authorized lab scope reference is required.",
    },
    {
      name: "Pentest completion linked",
      passed: Boolean(pentestCompletionEvidence),
      detail: pentestCompletionEvidence || "Pentest completion evidence is required.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner || "Rollback owner is required.",
    },
    {
      name: "Bounded provider targets",
      passed: boundedProviderTargets.length > 0,
      detail: `${boundedProviderTargets.length} bounded provider target(s).`,
    },
    {
      name: "Manual operator controls complete",
      passed: manualOperatorControls.length >= 3,
      detail: `${manualOperatorControls.length}/3 manual operator control(s).`,
    },
    {
      name: "Real adapter switch remains disabled",
      passed: dispatchApproval.provisioningEnabled === false && dispatchApproval.killSwitch.enabled === false,
      detail: `${dispatchApproval.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `real-adapter-lab-scope-activation-${dispatchApproval.provider.toLowerCase()}-${Date.now()}`,
    provider: dispatchApproval.provider,
    dispatchApprovalId: dispatchApproval.id,
    brokerRecordId: dispatchApproval.brokerRecordId,
    idempotencyKey: dispatchApproval.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for manual real-adapter switch review" : "Blocked",
    requestedBy: actor,
    authorizedScopeReference,
    pentestCompletionEvidence,
    rollbackOwner,
    boundedProviderTargets,
    manualOperatorControls,
    checks,
    evidence: [
      `Dispatch approval: ${dispatchApproval.id}.`,
      `Broker record: ${dispatchApproval.brokerRecordId}.`,
      `Authorized scope: ${authorizedScopeReference || "missing"}.`,
      `Pentest completion: ${pentestCompletionEvidence || "missing"}.`,
      `Rollback owner: ${rollbackOwner || "missing"}.`,
      `Bounded targets: ${boundedProviderTargets.length}.`,
      `Manual controls: ${manualOperatorControls.length}.`,
      `Kill switch: ${dispatchApproval.killSwitch.name}=${dispatchApproval.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: dispatchApproval.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findDispatchApproval(
  state: ApiState,
  request: CreateRealAdapterLabScopeActivationRequest
): ExecutionBrokerDispatchApproval {
  const dispatchApproval =
    (request.dispatchApprovalId
      ? state.executionBrokerDispatchApprovals.find((item) => item.id === request.dispatchApprovalId)
      : undefined) ??
    (request.provider
      ? state.executionBrokerDispatchApprovals.find((item) => item.provider === request.provider)
      : state.executionBrokerDispatchApprovals[0]);

  if (!dispatchApproval) {
    throw new RealAdapterLabScopeActivationError(
      "execution_broker_dispatch_approval_required",
      "An execution broker dispatch approval is required."
    );
  }

  return dispatchApproval;
}
