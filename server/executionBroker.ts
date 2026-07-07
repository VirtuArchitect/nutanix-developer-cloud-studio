import type {
  ControlledLabExecutionReadinessAttestation,
  ExecutionBrokerQueueRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateExecutionBrokerQueueRecordRequest } from "./types";

export class ExecutionBrokerError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createExecutionBrokerQueueRecord(
  state: ApiState,
  request: CreateExecutionBrokerQueueRecordRequest,
  actor: string
): ExecutionBrokerQueueRecord {
  const attestation = findReadinessAttestation(state, request);
  const idempotencyKey =
    request.idempotencyKey?.trim() || `broker-${attestation.provider.toLowerCase()}-${attestation.id}`;
  const approvalEvidenceLinks = request.approvalEvidenceLinks ?? [
    attestation.id,
    attestation.evidenceLedgerId,
    attestation.dryRunChecklistId,
  ];
  const duplicateKey = state.executionBrokerQueueRecords.some((record) => record.idempotencyKey === idempotencyKey);
  const checks = [
    {
      name: "Readiness attestation complete",
      passed: attestation.status === "Ready for execution review",
      detail: `${attestation.id} is ${attestation.status}.`,
    },
    {
      name: "Idempotency key unique",
      passed: !duplicateKey,
      detail: duplicateKey ? `${idempotencyKey} already exists.` : `${idempotencyKey} is available.`,
    },
    {
      name: "Approval evidence linked",
      passed: approvalEvidenceLinks.length >= 3,
      detail: `${approvalEvidenceLinks.length} approval evidence link(s).`,
    },
    {
      name: "Kill switch disabled",
      passed: attestation.killSwitch.enabled === false,
      detail: `${attestation.killSwitch.name} remains disabled.`,
    },
    {
      name: "Queued for operator review only",
      passed: attestation.provisioningEnabled === false,
      detail: "Broker queue does not execute provider adapters.",
    },
  ];

  return {
    id: `execution-broker-${attestation.provider.toLowerCase()}-${Date.now()}`,
    provider: attestation.provider,
    readinessAttestationId: attestation.id,
    evidenceLedgerId: attestation.evidenceLedgerId,
    idempotencyKey,
    operation: "Controlled Lab Adapter Execution",
    status: checks.every((check) => check.passed) ? "Queued for operator review" : "Blocked",
    requestedBy: actor,
    approvalEvidenceLinks,
    checks,
    evidence: [
      `Readiness attestation: ${attestation.id}.`,
      `Evidence ledger: ${attestation.evidenceLedgerId}.`,
      `Dry-run checklist: ${attestation.dryRunChecklistId}.`,
      `Idempotency key: ${idempotencyKey}.`,
      `Approval evidence links: ${approvalEvidenceLinks.length}.`,
      `Kill switch: ${attestation.killSwitch.name}=${attestation.killSwitch.enabled ? "enabled" : "disabled"}.`,
      "Execution mode: operator review only.",
    ],
    killSwitch: attestation.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findReadinessAttestation(
  state: ApiState,
  request: CreateExecutionBrokerQueueRecordRequest
): ControlledLabExecutionReadinessAttestation {
  const attestation =
    (request.readinessAttestationId
      ? state.controlledLabExecutionReadinessAttestations.find((item) => item.id === request.readinessAttestationId)
      : undefined) ??
    (request.provider
      ? state.controlledLabExecutionReadinessAttestations.find((item) => item.provider === request.provider)
      : state.controlledLabExecutionReadinessAttestations[0]);

  if (!attestation) {
    throw new ExecutionBrokerError(
      "controlled_lab_readiness_attestation_required",
      "A controlled lab execution readiness attestation is required."
    );
  }

  return attestation;
}
