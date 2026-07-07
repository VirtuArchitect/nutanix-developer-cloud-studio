import type {
  ProductionExecutionArchiveRetrievalValidationRecord,
  ProductionExecutionReadinessArchiveHandoffRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRetrievalValidationRecordRequest } from "./types";

export class ProductionExecutionArchiveRetrievalValidationRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRetrievalValidationRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRetrievalValidationRecordRequest,
  actor: string
): ProductionExecutionArchiveRetrievalValidationRecord {
  const readinessArchiveHandoffRecord = findReadinessArchiveHandoffRecord(state, request);
  const providerSlug = readinessArchiveHandoffRecord.provider.toLowerCase();
  const retrievalOperator = request.retrievalOperator?.trim() ?? "Production Archive Retrieval Operator";
  const sampleRetrievalProofReference =
    request.sampleRetrievalProofReference?.trim() ?? `production-archive-sample-retrieval-proof-${providerSlug}.md`;
  const checksumVerificationReference =
    request.checksumVerificationReference?.trim() ?? `production-archive-checksum-verification-${providerSlug}.sha256`;
  const accessAuditReference =
    request.accessAuditReference?.trim() ?? `production-archive-access-audit-${providerSlug}.md`;
  const recoverySlaWitnessReference =
    request.recoverySlaWitnessReference?.trim() ?? `production-archive-recovery-sla-witness-${providerSlug}.md`;

  const checks = [
    {
      name: "Readiness archive handoff ready",
      passed:
        readinessArchiveHandoffRecord.status ===
        "Ready for production execution readiness archive handoff review",
      detail: `${readinessArchiveHandoffRecord.id} is ${readinessArchiveHandoffRecord.status}.`,
    },
    {
      name: "Retrieval operator assigned",
      passed: Boolean(retrievalOperator),
      detail: retrievalOperator || "Retrieval operator is required.",
    },
    {
      name: "Sample retrieval proof linked",
      passed: Boolean(sampleRetrievalProofReference),
      detail: sampleRetrievalProofReference || "Sample retrieval proof reference is required.",
    },
    {
      name: "Checksum verification linked",
      passed: Boolean(checksumVerificationReference),
      detail: checksumVerificationReference || "Checksum verification reference is required.",
    },
    {
      name: "Access audit linked",
      passed: Boolean(accessAuditReference),
      detail: accessAuditReference || "Access audit reference is required.",
    },
    {
      name: "Recovery SLA witness linked",
      passed: Boolean(recoverySlaWitnessReference),
      detail: recoverySlaWitnessReference || "Recovery SLA witness reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        readinessArchiveHandoffRecord.provisioningEnabled === false &&
        readinessArchiveHandoffRecord.killSwitch.enabled === false,
      detail: `${readinessArchiveHandoffRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-retrieval-validation-record-${providerSlug}-${Date.now()}`,
    provider: readinessArchiveHandoffRecord.provider,
    readinessArchiveHandoffRecordId: readinessArchiveHandoffRecord.id,
    finalAcceptanceArchiveRecordId: readinessArchiveHandoffRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: readinessArchiveHandoffRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: readinessArchiveHandoffRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: readinessArchiveHandoffRecord.operationalClosureRecordId,
    finalTurnoverRecordId: readinessArchiveHandoffRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: readinessArchiveHandoffRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: readinessArchiveHandoffRecord.supportReadinessRecordId,
    operationsHandoverRecordId: readinessArchiveHandoffRecord.operationsHandoverRecordId,
    completionDossierRecordId: readinessArchiveHandoffRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: readinessArchiveHandoffRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: readinessArchiveHandoffRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: readinessArchiveHandoffRecord.archivalHandoffRecordId,
    closurePacketRecordId: readinessArchiveHandoffRecord.closurePacketRecordId,
    closureAuthorizationRecordId: readinessArchiveHandoffRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: readinessArchiveHandoffRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: readinessArchiveHandoffRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: readinessArchiveHandoffRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: readinessArchiveHandoffRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: readinessArchiveHandoffRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: readinessArchiveHandoffRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: readinessArchiveHandoffRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: readinessArchiveHandoffRecord.implementationHoldRecordId,
    cabDecisionRecordId: readinessArchiveHandoffRecord.cabDecisionRecordId,
    cabHandoffPacketId: readinessArchiveHandoffRecord.cabHandoffPacketId,
    freezeRecordId: readinessArchiveHandoffRecord.freezeRecordId,
    authorizationPacketId: readinessArchiveHandoffRecord.authorizationPacketId,
    promotionDossierId: readinessArchiveHandoffRecord.promotionDossierId,
    closurePackageId: readinessArchiveHandoffRecord.closurePackageId,
    outcomeRecordId: readinessArchiveHandoffRecord.outcomeRecordId,
    handoffPackageId: readinessArchiveHandoffRecord.handoffPackageId,
    controlledSwitchRequestId: readinessArchiveHandoffRecord.controlledSwitchRequestId,
    auditPackageId: readinessArchiveHandoffRecord.auditPackageId,
    switchReviewId: readinessArchiveHandoffRecord.switchReviewId,
    activationId: readinessArchiveHandoffRecord.activationId,
    idempotencyKey: readinessArchiveHandoffRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive retrieval validation review"
      : "Blocked",
    requestedBy: actor,
    retrievalOperator,
    sampleRetrievalProofReference,
    checksumVerificationReference,
    accessAuditReference,
    recoverySlaWitnessReference,
    checks,
    evidence: [
      `Readiness archive handoff record: ${readinessArchiveHandoffRecord.id}.`,
      `Final acceptance archive record: ${readinessArchiveHandoffRecord.finalAcceptanceArchiveRecordId}.`,
      `Retrieval operator: ${retrievalOperator || "missing"}.`,
      `Sample retrieval proof: ${sampleRetrievalProofReference || "missing"}.`,
      `Checksum verification: ${checksumVerificationReference || "missing"}.`,
      `Access audit: ${accessAuditReference || "missing"}.`,
      `Recovery SLA witness: ${recoverySlaWitnessReference || "missing"}.`,
      `Kill switch: ${readinessArchiveHandoffRecord.killSwitch.name}=${
        readinessArchiveHandoffRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: readinessArchiveHandoffRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findReadinessArchiveHandoffRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRetrievalValidationRecordRequest
): ProductionExecutionReadinessArchiveHandoffRecord {
  const readinessArchiveHandoffRecord =
    (request.readinessArchiveHandoffRecordId
      ? state.productionExecutionReadinessArchiveHandoffRecords.find(
          (item) => item.id === request.readinessArchiveHandoffRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionReadinessArchiveHandoffRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionReadinessArchiveHandoffRecords[0]);

  if (!readinessArchiveHandoffRecord) {
    throw new ProductionExecutionArchiveRetrievalValidationRecordError(
      "production_execution_readiness_archive_handoff_record_required",
      "A production execution readiness archive handoff record is required."
    );
  }

  return readinessArchiveHandoffRecord;
}
