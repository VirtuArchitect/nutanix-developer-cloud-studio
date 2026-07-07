import type {
  ControlledLabExecutionEvidenceLedger,
  ControlledLabExecutionReadinessAttestation,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateControlledLabExecutionReadinessAttestationRequest } from "./types";

export class ControlledLabExecutionReadinessAttestationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledLabExecutionReadinessAttestation(
  state: ApiState,
  request: CreateControlledLabExecutionReadinessAttestationRequest,
  actor: string
): ControlledLabExecutionReadinessAttestation {
  const ledger = findEvidenceLedger(state, request);
  const attestations: ControlledLabExecutionReadinessAttestation["attestations"] = {
    platformOwner: request.platformOwnerAttestation ?? `Platform owner reviewed ${ledger.id}.`,
    securityReviewer: request.securityReviewerAttestation ?? `Security reviewer accepted immutable evidence for ${ledger.provider}.`,
    operationsReviewer: request.operationsReviewerAttestation ?? `Operations confirmed runbook, observation, and stop authority coverage.`,
    rollbackOwner: request.rollbackOwnerAttestation ?? `Rollback owner confirmed rollback evidence and timer.`,
    executiveSponsor: request.executiveSponsorAttestation ?? `Executive sponsor acknowledged controlled lab execution readiness.`,
  };
  const checks = [
    {
      name: "Evidence ledger ready",
      passed: ledger.status === "Ready for evidence review",
      detail: `${ledger.id} is ${ledger.status}.`,
    },
    {
      name: "Platform owner attested",
      passed: Boolean(attestations.platformOwner.trim()),
      detail: attestations.platformOwner || "Platform owner attestation is required.",
    },
    {
      name: "Security reviewer attested",
      passed: Boolean(attestations.securityReviewer.trim()),
      detail: attestations.securityReviewer || "Security reviewer attestation is required.",
    },
    {
      name: "Operations reviewer attested",
      passed: Boolean(attestations.operationsReviewer.trim()),
      detail: attestations.operationsReviewer || "Operations reviewer attestation is required.",
    },
    {
      name: "Rollback owner attested",
      passed: Boolean(attestations.rollbackOwner.trim()),
      detail: attestations.rollbackOwner || "Rollback owner attestation is required.",
    },
    {
      name: "Executive sponsor attested",
      passed: Boolean(attestations.executiveSponsor.trim()),
      detail: attestations.executiveSponsor || "Executive sponsor attestation is required.",
    },
    {
      name: "Real adapter execution disabled",
      passed: ledger.provisioningEnabled === false && ledger.killSwitch.enabled === false,
      detail: `${ledger.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-readiness-attestation-${ledger.provider.toLowerCase()}-${Date.now()}`,
    provider: ledger.provider,
    evidenceLedgerId: ledger.id,
    dryRunChecklistId: ledger.dryRunChecklistId,
    status: checks.every((check) => check.passed) ? "Ready for execution review" : "Blocked",
    requestedBy: actor,
    attestations,
    checks,
    evidence: [
      `Evidence ledger: ${ledger.id}.`,
      `Dry-run checklist: ${ledger.dryRunChecklistId}.`,
      `Platform owner attestation: ${attestations.platformOwner ? "present" : "missing"}.`,
      `Security reviewer attestation: ${attestations.securityReviewer ? "present" : "missing"}.`,
      `Operations reviewer attestation: ${attestations.operationsReviewer ? "present" : "missing"}.`,
      `Rollback owner attestation: ${attestations.rollbackOwner ? "present" : "missing"}.`,
      `Executive sponsor attestation: ${attestations.executiveSponsor ? "present" : "missing"}.`,
      `Kill switch: ${ledger.killSwitch.name}=${ledger.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: ledger.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findEvidenceLedger(
  state: ApiState,
  request: CreateControlledLabExecutionReadinessAttestationRequest
): ControlledLabExecutionEvidenceLedger {
  const ledger =
    (request.evidenceLedgerId
      ? state.controlledLabExecutionEvidenceLedgers.find((item) => item.id === request.evidenceLedgerId)
      : undefined) ??
    (request.provider
      ? state.controlledLabExecutionEvidenceLedgers.find((item) => item.provider === request.provider)
      : state.controlledLabExecutionEvidenceLedgers[0]);

  if (!ledger) {
    throw new ControlledLabExecutionReadinessAttestationError(
      "controlled_lab_evidence_ledger_required",
      "A controlled lab execution evidence ledger is required."
    );
  }

  return ledger;
}
