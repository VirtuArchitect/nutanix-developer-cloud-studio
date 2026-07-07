import type {
  SwitchExecutionHandoffPackage,
  SwitchExecutionOutcomeRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateSwitchExecutionOutcomeRecordRequest } from "./types";

export class SwitchExecutionOutcomeRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createSwitchExecutionOutcomeRecord(
  state: ApiState,
  request: CreateSwitchExecutionOutcomeRecordRequest,
  actor: string
): SwitchExecutionOutcomeRecord {
  const handoffPackage = findHandoffPackage(state, request);
  const operatorResultReference =
    request.operatorResultReference?.trim() ?? `operator-result-${handoffPackage.provider.toLowerCase()}.md`;
  const postSwitchValidationReference =
    request.postSwitchValidationReference?.trim() ?? `post-switch-validation-${handoffPackage.provider.toLowerCase()}.json`;
  const rollbackDecisionReference =
    request.rollbackDecisionReference?.trim() ?? `rollback-decision-${handoffPackage.provider.toLowerCase()}.md`;
  const incidentBridgeLogReference =
    request.incidentBridgeLogReference?.trim() ?? `incident-bridge-log-${handoffPackage.provider.toLowerCase()}.md`;
  const auditSignOffReference =
    request.auditSignOffReference?.trim() ?? `audit-signoff-${handoffPackage.provider.toLowerCase()}.md`;

  const checks = [
    {
      name: "Handoff package ready",
      passed: handoffPackage.status === "Ready for switch execution handoff review",
      detail: `${handoffPackage.id} is ${handoffPackage.status}.`,
    },
    {
      name: "Operator result linked",
      passed: Boolean(operatorResultReference),
      detail: operatorResultReference || "Operator result reference is required.",
    },
    {
      name: "Post-switch validation linked",
      passed: Boolean(postSwitchValidationReference),
      detail: postSwitchValidationReference || "Post-switch validation reference is required.",
    },
    {
      name: "Rollback decision linked",
      passed: Boolean(rollbackDecisionReference),
      detail: rollbackDecisionReference || "Rollback decision reference is required.",
    },
    {
      name: "Incident bridge log linked",
      passed: Boolean(incidentBridgeLogReference),
      detail: incidentBridgeLogReference || "Incident bridge log reference is required.",
    },
    {
      name: "Audit sign-off linked",
      passed: Boolean(auditSignOffReference),
      detail: auditSignOffReference || "Audit sign-off reference is required.",
    },
    {
      name: "Prototype records outcome only",
      passed: handoffPackage.provisioningEnabled === false && handoffPackage.killSwitch.enabled === false,
      detail: `${handoffPackage.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `switch-execution-outcome-record-${handoffPackage.provider.toLowerCase()}-${Date.now()}`,
    provider: handoffPackage.provider,
    handoffPackageId: handoffPackage.id,
    controlledSwitchRequestId: handoffPackage.controlledSwitchRequestId,
    auditPackageId: handoffPackage.auditPackageId,
    switchReviewId: handoffPackage.switchReviewId,
    activationId: handoffPackage.activationId,
    idempotencyKey: handoffPackage.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for switch outcome review" : "Blocked",
    requestedBy: actor,
    operatorResultReference,
    postSwitchValidationReference,
    rollbackDecisionReference,
    incidentBridgeLogReference,
    auditSignOffReference,
    checks,
    evidence: [
      `Handoff package: ${handoffPackage.id}.`,
      `Controlled switch request: ${handoffPackage.controlledSwitchRequestId}.`,
      `Operator result: ${operatorResultReference || "missing"}.`,
      `Post-switch validation: ${postSwitchValidationReference || "missing"}.`,
      `Rollback decision: ${rollbackDecisionReference || "missing"}.`,
      `Incident bridge log: ${incidentBridgeLogReference || "missing"}.`,
      `Audit sign-off: ${auditSignOffReference || "missing"}.`,
      `Kill switch: ${handoffPackage.killSwitch.name}=${handoffPackage.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: handoffPackage.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findHandoffPackage(
  state: ApiState,
  request: CreateSwitchExecutionOutcomeRecordRequest
): SwitchExecutionHandoffPackage {
  const handoffPackage =
    (request.handoffPackageId
      ? state.switchExecutionHandoffPackages.find((item) => item.id === request.handoffPackageId)
      : undefined) ??
    (request.provider
      ? state.switchExecutionHandoffPackages.find((item) => item.provider === request.provider)
      : state.switchExecutionHandoffPackages[0]);

  if (!handoffPackage) {
    throw new SwitchExecutionOutcomeRecordError(
      "switch_handoff_package_required",
      "A switch execution handoff package is required."
    );
  }

  return handoffPackage;
}
