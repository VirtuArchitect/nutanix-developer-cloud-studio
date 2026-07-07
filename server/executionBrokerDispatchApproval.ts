import type {
  ExecutionBrokerDispatchApproval,
  ExecutionBrokerQueueRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateExecutionBrokerDispatchApprovalRequest } from "./types";

export class ExecutionBrokerDispatchApprovalError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createExecutionBrokerDispatchApproval(
  state: ApiState,
  request: CreateExecutionBrokerDispatchApprovalRequest,
  actor: string
): ExecutionBrokerDispatchApproval {
  const brokerRecord = findBrokerRecord(state, request);
  const operatorApprover = request.operatorApprover?.trim() ?? "cloud.operations.approver";
  const rollbackProofReference = request.rollbackProofReference?.trim() ?? `rollback-proof-${brokerRecord.provider.toLowerCase()}.md`;
  const pentestEvidenceReference = request.pentestEvidenceReference?.trim() ?? `pentest-scope-${brokerRecord.provider.toLowerCase()}.md`;
  const dispatchWindowReference = request.dispatchWindowReference?.trim() ?? `dispatch-window-${brokerRecord.provider.toLowerCase()}.md`;
  const checks = [
    {
      name: "Broker record queued",
      passed: brokerRecord.status === "Queued for operator review",
      detail: `${brokerRecord.id} is ${brokerRecord.status}.`,
    },
    {
      name: "Operator approver assigned",
      passed: Boolean(operatorApprover),
      detail: operatorApprover || "Operator approver is required.",
    },
    {
      name: "Rollback proof linked",
      passed: Boolean(rollbackProofReference),
      detail: rollbackProofReference || "Rollback proof reference is required.",
    },
    {
      name: "Pentest evidence linked",
      passed: Boolean(pentestEvidenceReference),
      detail: pentestEvidenceReference || "Authorized pentest evidence reference is required.",
    },
    {
      name: "Dispatch window linked",
      passed: Boolean(dispatchWindowReference),
      detail: dispatchWindowReference || "Dispatch window reference is required.",
    },
    {
      name: "Real adapter execution disabled",
      passed: brokerRecord.provisioningEnabled === false && brokerRecord.killSwitch.enabled === false,
      detail: `${brokerRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `execution-broker-dispatch-approval-${brokerRecord.provider.toLowerCase()}-${Date.now()}`,
    provider: brokerRecord.provider,
    brokerRecordId: brokerRecord.id,
    readinessAttestationId: brokerRecord.readinessAttestationId,
    idempotencyKey: brokerRecord.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for authorized lab dispatch review" : "Blocked",
    requestedBy: actor,
    operatorApprover,
    rollbackProofReference,
    pentestEvidenceReference,
    dispatchWindowReference,
    checks,
    evidence: [
      `Broker record: ${brokerRecord.id}.`,
      `Readiness attestation: ${brokerRecord.readinessAttestationId}.`,
      `Idempotency key: ${brokerRecord.idempotencyKey}.`,
      `Operator approver: ${operatorApprover || "missing"}.`,
      `Rollback proof: ${rollbackProofReference || "missing"}.`,
      `Pentest evidence: ${pentestEvidenceReference || "missing"}.`,
      `Dispatch window: ${dispatchWindowReference || "missing"}.`,
      `Kill switch: ${brokerRecord.killSwitch.name}=${brokerRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: brokerRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findBrokerRecord(
  state: ApiState,
  request: CreateExecutionBrokerDispatchApprovalRequest
): ExecutionBrokerQueueRecord {
  const brokerRecord =
    (request.brokerRecordId
      ? state.executionBrokerQueueRecords.find((item) => item.id === request.brokerRecordId)
      : undefined) ??
    (request.provider
      ? state.executionBrokerQueueRecords.find((item) => item.provider === request.provider)
      : state.executionBrokerQueueRecords[0]);

  if (!brokerRecord) {
    throw new ExecutionBrokerDispatchApprovalError(
      "execution_broker_record_required",
      "An execution broker queue record is required."
    );
  }

  return brokerRecord;
}
