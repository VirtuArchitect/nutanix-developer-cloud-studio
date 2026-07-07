import type {
  ProductionExecutionArchivalHandoffRecord,
  ProductionExecutionRetentionAttestationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionRetentionAttestationRecordRequest } from "./types";

export class ProductionExecutionRetentionAttestationRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionRetentionAttestationRecord(
  state: ApiState,
  request: CreateProductionExecutionRetentionAttestationRecordRequest,
  actor: string
): ProductionExecutionRetentionAttestationRecord {
  const archivalHandoffRecord = findArchivalHandoffRecord(state, request);
  const providerSlug = archivalHandoffRecord.provider.toLowerCase();
  const retentionOwner = request.retentionOwner?.trim() ?? "Production Retention Owner";
  const retentionScheduleProofReference =
    request.retentionScheduleProofReference?.trim() ?? `production-retention-schedule-${providerSlug}.md`;
  const legalHoldCheckReference =
    request.legalHoldCheckReference?.trim() ?? `production-legal-hold-check-${providerSlug}.md`;
  const deletionExceptionRegisterReference =
    request.deletionExceptionRegisterReference?.trim() ??
    `production-deletion-exception-register-${providerSlug}.md`;
  const retrievalSlaProofReference =
    request.retrievalSlaProofReference?.trim() ?? `production-retrieval-sla-proof-${providerSlug}.md`;

  const checks = [
    {
      name: "Archival handoff ready",
      passed: archivalHandoffRecord.status === "Ready for production execution archival handoff review",
      detail: `${archivalHandoffRecord.id} is ${archivalHandoffRecord.status}.`,
    },
    {
      name: "Retention owner assigned",
      passed: Boolean(retentionOwner),
      detail: retentionOwner || "Retention owner is required.",
    },
    {
      name: "Retention schedule proof linked",
      passed: Boolean(retentionScheduleProofReference),
      detail: retentionScheduleProofReference || "Retention schedule proof reference is required.",
    },
    {
      name: "Legal hold check linked",
      passed: Boolean(legalHoldCheckReference),
      detail: legalHoldCheckReference || "Legal hold check reference is required.",
    },
    {
      name: "Deletion exception register linked",
      passed: Boolean(deletionExceptionRegisterReference),
      detail: deletionExceptionRegisterReference || "Deletion exception register reference is required.",
    },
    {
      name: "Retrieval SLA proof linked",
      passed: Boolean(retrievalSlaProofReference),
      detail: retrievalSlaProofReference || "Retrieval SLA proof reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        archivalHandoffRecord.provisioningEnabled === false && archivalHandoffRecord.killSwitch.enabled === false,
      detail: `${archivalHandoffRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-retention-attestation-record-${providerSlug}-${Date.now()}`,
    provider: archivalHandoffRecord.provider,
    archivalHandoffRecordId: archivalHandoffRecord.id,
    closurePacketRecordId: archivalHandoffRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archivalHandoffRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archivalHandoffRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archivalHandoffRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archivalHandoffRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archivalHandoffRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archivalHandoffRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archivalHandoffRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archivalHandoffRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archivalHandoffRecord.implementationHoldRecordId,
    cabDecisionRecordId: archivalHandoffRecord.cabDecisionRecordId,
    cabHandoffPacketId: archivalHandoffRecord.cabHandoffPacketId,
    freezeRecordId: archivalHandoffRecord.freezeRecordId,
    authorizationPacketId: archivalHandoffRecord.authorizationPacketId,
    promotionDossierId: archivalHandoffRecord.promotionDossierId,
    closurePackageId: archivalHandoffRecord.closurePackageId,
    outcomeRecordId: archivalHandoffRecord.outcomeRecordId,
    handoffPackageId: archivalHandoffRecord.handoffPackageId,
    controlledSwitchRequestId: archivalHandoffRecord.controlledSwitchRequestId,
    auditPackageId: archivalHandoffRecord.auditPackageId,
    switchReviewId: archivalHandoffRecord.switchReviewId,
    activationId: archivalHandoffRecord.activationId,
    idempotencyKey: archivalHandoffRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution retention attestation review"
      : "Blocked",
    requestedBy: actor,
    retentionOwner,
    retentionScheduleProofReference,
    legalHoldCheckReference,
    deletionExceptionRegisterReference,
    retrievalSlaProofReference,
    checks,
    evidence: [
      `Archival handoff record: ${archivalHandoffRecord.id}.`,
      `Closure packet record: ${archivalHandoffRecord.closurePacketRecordId}.`,
      `Retention owner: ${retentionOwner || "missing"}.`,
      `Retention schedule proof: ${retentionScheduleProofReference || "missing"}.`,
      `Legal hold check: ${legalHoldCheckReference || "missing"}.`,
      `Deletion exception register: ${deletionExceptionRegisterReference || "missing"}.`,
      `Retrieval SLA proof: ${retrievalSlaProofReference || "missing"}.`,
      `Kill switch: ${archivalHandoffRecord.killSwitch.name}=${
        archivalHandoffRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archivalHandoffRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findArchivalHandoffRecord(
  state: ApiState,
  request: CreateProductionExecutionRetentionAttestationRecordRequest
): ProductionExecutionArchivalHandoffRecord {
  const archivalHandoffRecord =
    (request.archivalHandoffRecordId
      ? state.productionExecutionArchivalHandoffRecords.find((item) => item.id === request.archivalHandoffRecordId)
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchivalHandoffRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionArchivalHandoffRecords[0]);

  if (!archivalHandoffRecord) {
    throw new ProductionExecutionRetentionAttestationRecordError(
      "production_execution_archival_handoff_record_required",
      "A production execution archival handoff record is required."
    );
  }

  return archivalHandoffRecord;
}
