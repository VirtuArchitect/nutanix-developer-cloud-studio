import type {
  ControlledSwitchConfigurationRequest,
  SwitchExecutionHandoffPackage,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateSwitchExecutionHandoffPackageRequest } from "./types";

export class SwitchExecutionHandoffPackageError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createSwitchExecutionHandoffPackage(
  state: ApiState,
  request: CreateSwitchExecutionHandoffPackageRequest,
  actor: string
): SwitchExecutionHandoffPackage {
  const switchRequest = findControlledSwitchRequest(state, request);
  const operatorRunSheetReference =
    request.operatorRunSheetReference?.trim() ?? `operator-run-sheet-${switchRequest.provider.toLowerCase()}.md`;
  const communicationsPlanReference =
    request.communicationsPlanReference?.trim() ?? `communications-plan-${switchRequest.provider.toLowerCase()}.md`;
  const observationWindowReference =
    request.observationWindowReference?.trim() ?? `observation-window-${switchRequest.provider.toLowerCase()}.md`;
  const rollbackOwnerAcceptance =
    request.rollbackOwnerAcceptance?.trim() ?? `rollback-owner-acceptance-${switchRequest.provider.toLowerCase()}.md`;
  const executionFreezeProofReference =
    request.executionFreezeProofReference?.trim() ?? `execution-freeze-proof-${switchRequest.provider.toLowerCase()}.json`;

  const checks = [
    {
      name: "Controlled switch request ready",
      passed: switchRequest.status === "Ready for controlled switch request review",
      detail: `${switchRequest.id} is ${switchRequest.status}.`,
    },
    {
      name: "Operator run sheet linked",
      passed: Boolean(operatorRunSheetReference),
      detail: operatorRunSheetReference || "Operator run sheet reference is required.",
    },
    {
      name: "Communications plan linked",
      passed: Boolean(communicationsPlanReference),
      detail: communicationsPlanReference || "Communications plan reference is required.",
    },
    {
      name: "Observation window linked",
      passed: Boolean(observationWindowReference),
      detail: observationWindowReference || "Observation window reference is required.",
    },
    {
      name: "Rollback owner acceptance linked",
      passed: Boolean(rollbackOwnerAcceptance),
      detail: rollbackOwnerAcceptance || "Rollback owner acceptance is required.",
    },
    {
      name: "Execution freeze proof linked",
      passed: Boolean(executionFreezeProofReference),
      detail: executionFreezeProofReference || "Execution freeze proof reference is required.",
    },
    {
      name: "Prototype does not execute switch",
      passed: switchRequest.provisioningEnabled === false && switchRequest.killSwitch.enabled === false,
      detail: `${switchRequest.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `switch-execution-handoff-package-${switchRequest.provider.toLowerCase()}-${Date.now()}`,
    provider: switchRequest.provider,
    controlledSwitchRequestId: switchRequest.id,
    auditPackageId: switchRequest.auditPackageId,
    switchReviewId: switchRequest.switchReviewId,
    activationId: switchRequest.activationId,
    idempotencyKey: switchRequest.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for switch execution handoff review" : "Blocked",
    requestedBy: actor,
    operatorRunSheetReference,
    communicationsPlanReference,
    observationWindowReference,
    rollbackOwnerAcceptance,
    executionFreezeProofReference,
    checks,
    evidence: [
      `Controlled switch request: ${switchRequest.id}.`,
      `Audit package: ${switchRequest.auditPackageId}.`,
      `Operator run sheet: ${operatorRunSheetReference || "missing"}.`,
      `Communications plan: ${communicationsPlanReference || "missing"}.`,
      `Observation window: ${observationWindowReference || "missing"}.`,
      `Rollback owner acceptance: ${rollbackOwnerAcceptance || "missing"}.`,
      `Execution freeze proof: ${executionFreezeProofReference || "missing"}.`,
      `Kill switch: ${switchRequest.killSwitch.name}=${switchRequest.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: switchRequest.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findControlledSwitchRequest(
  state: ApiState,
  request: CreateSwitchExecutionHandoffPackageRequest
): ControlledSwitchConfigurationRequest {
  const switchRequest =
    (request.controlledSwitchRequestId
      ? state.controlledSwitchConfigurationRequests.find((item) => item.id === request.controlledSwitchRequestId)
      : undefined) ??
    (request.provider
      ? state.controlledSwitchConfigurationRequests.find((item) => item.provider === request.provider)
      : state.controlledSwitchConfigurationRequests[0]);

  if (!switchRequest) {
    throw new SwitchExecutionHandoffPackageError(
      "controlled_switch_request_required",
      "A controlled switch configuration request is required."
    );
  }

  return switchRequest;
}
