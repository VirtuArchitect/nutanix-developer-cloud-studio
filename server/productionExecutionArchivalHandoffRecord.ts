import type {
  ProductionExecutionArchivalHandoffRecord,
  ProductionExecutionClosurePacketRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchivalHandoffRecordRequest } from "./types";

export class ProductionExecutionArchivalHandoffRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchivalHandoffRecord(
  state: ApiState,
  request: CreateProductionExecutionArchivalHandoffRecordRequest,
  actor: string
): ProductionExecutionArchivalHandoffRecord {
  const closurePacketRecord = findClosurePacketRecord(state, request);
  const providerSlug = closurePacketRecord.provider.toLowerCase();
  const archiveOwner = request.archiveOwner?.trim() ?? "Production Archive Owner";
  const retentionPolicyReference =
    request.retentionPolicyReference?.trim() ?? `production-retention-policy-${providerSlug}.md`;
  const immutableStorageProofReference =
    request.immutableStorageProofReference?.trim() ?? `production-immutable-storage-proof-${providerSlug}.md`;
  const auditIndexReference =
    request.auditIndexReference?.trim() ?? `production-audit-index-${providerSlug}.json`;
  const retrievalTestReference =
    request.retrievalTestReference?.trim() ?? `production-retrieval-test-${providerSlug}.md`;

  const checks = [
    {
      name: "Closure packet ready",
      passed: closurePacketRecord.status === "Ready for production execution closure packet review",
      detail: `${closurePacketRecord.id} is ${closurePacketRecord.status}.`,
    },
    {
      name: "Archive owner assigned",
      passed: Boolean(archiveOwner),
      detail: archiveOwner || "Archive owner is required.",
    },
    {
      name: "Retention policy linked",
      passed: Boolean(retentionPolicyReference),
      detail: retentionPolicyReference || "Retention policy reference is required.",
    },
    {
      name: "Immutable storage proof linked",
      passed: Boolean(immutableStorageProofReference),
      detail: immutableStorageProofReference || "Immutable storage proof reference is required.",
    },
    {
      name: "Audit index linked",
      passed: Boolean(auditIndexReference),
      detail: auditIndexReference || "Audit index reference is required.",
    },
    {
      name: "Retrieval test linked",
      passed: Boolean(retrievalTestReference),
      detail: retrievalTestReference || "Retrieval test reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed: closurePacketRecord.provisioningEnabled === false && closurePacketRecord.killSwitch.enabled === false,
      detail: `${closurePacketRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archival-handoff-record-${providerSlug}-${Date.now()}`,
    provider: closurePacketRecord.provider,
    closurePacketRecordId: closurePacketRecord.id,
    closureAuthorizationRecordId: closurePacketRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: closurePacketRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: closurePacketRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: closurePacketRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: closurePacketRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: closurePacketRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: closurePacketRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: closurePacketRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: closurePacketRecord.implementationHoldRecordId,
    cabDecisionRecordId: closurePacketRecord.cabDecisionRecordId,
    cabHandoffPacketId: closurePacketRecord.cabHandoffPacketId,
    freezeRecordId: closurePacketRecord.freezeRecordId,
    authorizationPacketId: closurePacketRecord.authorizationPacketId,
    promotionDossierId: closurePacketRecord.promotionDossierId,
    closurePackageId: closurePacketRecord.closurePackageId,
    outcomeRecordId: closurePacketRecord.outcomeRecordId,
    handoffPackageId: closurePacketRecord.handoffPackageId,
    controlledSwitchRequestId: closurePacketRecord.controlledSwitchRequestId,
    auditPackageId: closurePacketRecord.auditPackageId,
    switchReviewId: closurePacketRecord.switchReviewId,
    activationId: closurePacketRecord.activationId,
    idempotencyKey: closurePacketRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archival handoff review"
      : "Blocked",
    requestedBy: actor,
    archiveOwner,
    retentionPolicyReference,
    immutableStorageProofReference,
    auditIndexReference,
    retrievalTestReference,
    checks,
    evidence: [
      `Closure packet record: ${closurePacketRecord.id}.`,
      `Closure authorization record: ${closurePacketRecord.closureAuthorizationRecordId}.`,
      `Archive owner: ${archiveOwner || "missing"}.`,
      `Retention policy: ${retentionPolicyReference || "missing"}.`,
      `Immutable storage proof: ${immutableStorageProofReference || "missing"}.`,
      `Audit index: ${auditIndexReference || "missing"}.`,
      `Retrieval test: ${retrievalTestReference || "missing"}.`,
      `Kill switch: ${closurePacketRecord.killSwitch.name}=${
        closurePacketRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: closurePacketRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findClosurePacketRecord(
  state: ApiState,
  request: CreateProductionExecutionArchivalHandoffRecordRequest
): ProductionExecutionClosurePacketRecord {
  const closurePacketRecord =
    (request.closurePacketRecordId
      ? state.productionExecutionClosurePacketRecords.find((item) => item.id === request.closurePacketRecordId)
      : undefined) ??
    (request.provider
      ? state.productionExecutionClosurePacketRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionClosurePacketRecords[0]);

  if (!closurePacketRecord) {
    throw new ProductionExecutionArchivalHandoffRecordError(
      "production_execution_closure_packet_record_required",
      "A production execution closure packet record is required."
    );
  }

  return closurePacketRecord;
}
