import type {
  ProductionExecutionArchiveRecoveryOperationalContinuityRecord,
  ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord,
} from "../src/data/cloudStudioDomain";
import type {
  ApiState,
  CreateProductionExecutionArchiveRecoveryServiceManagementHandoffRecordRequest,
} from "./types";

export class ProductionExecutionArchiveRecoveryServiceManagementHandoffRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryServiceManagementHandoffRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryServiceManagementHandoffRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord {
  const operationalContinuityRecord = findOperationalContinuityRecord(state, request);
  const providerSlug = operationalContinuityRecord.provider.toLowerCase();
  const serviceOwner = request.serviceOwner?.trim() ?? "Production Archive Recovery Service Owner";
  const supportQueueMappingReference =
    request.supportQueueMappingReference?.trim() ??
    `production-archive-recovery-service-management-support-queue-${providerSlug}.json`;
  const knowledgeArticleReference =
    request.knowledgeArticleReference?.trim() ??
    `production-archive-recovery-service-management-knowledge-article-${providerSlug}.md`;
  const escalationMatrixReference =
    request.escalationMatrixReference?.trim() ??
    `production-archive-recovery-service-management-escalation-matrix-${providerSlug}.md`;
  const serviceManagementHandoffSignOffReference =
    request.serviceManagementHandoffSignOffReference?.trim() ??
    `production-archive-recovery-service-management-handoff-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Operational continuity ready",
      passed:
        operationalContinuityRecord.status ===
        "Ready for production execution archive recovery operational continuity review",
      detail: `${operationalContinuityRecord.id} is ${operationalContinuityRecord.status}.`,
    },
    {
      name: "Service owner assigned",
      passed: Boolean(serviceOwner),
      detail: serviceOwner || "Service owner is required.",
    },
    {
      name: "Support queue mapping linked",
      passed: Boolean(supportQueueMappingReference),
      detail: supportQueueMappingReference || "Support queue mapping reference is required.",
    },
    {
      name: "Knowledge article linked",
      passed: Boolean(knowledgeArticleReference),
      detail: knowledgeArticleReference || "Knowledge article reference is required.",
    },
    {
      name: "Escalation matrix linked",
      passed: Boolean(escalationMatrixReference),
      detail: escalationMatrixReference || "Escalation matrix reference is required.",
    },
    {
      name: "Service management handoff sign-off linked",
      passed: Boolean(serviceManagementHandoffSignOffReference),
      detail:
        serviceManagementHandoffSignOffReference ||
        "Service management handoff sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        operationalContinuityRecord.provisioningEnabled === false &&
        operationalContinuityRecord.killSwitch.enabled === false,
      detail: `${operationalContinuityRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-service-management-handoff-record-${providerSlug}-${Date.now()}`,
    provider: operationalContinuityRecord.provider,
    operationalContinuityRecordId: operationalContinuityRecord.id,
    evidenceCustodyClosureRecordId: operationalContinuityRecord.evidenceCustodyClosureRecordId,
    finalComplianceArchiveRecordId: operationalContinuityRecord.finalComplianceArchiveRecordId,
    archiveRecoveryAuditCertificationRecordId:
      operationalContinuityRecord.archiveRecoveryAuditCertificationRecordId,
    archiveRecoveryClosureRecordId: operationalContinuityRecord.archiveRecoveryClosureRecordId,
    archiveRecoveryAcceptanceRecordId: operationalContinuityRecord.archiveRecoveryAcceptanceRecordId,
    archiveRecoveryDrillRecordId: operationalContinuityRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: operationalContinuityRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: operationalContinuityRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: operationalContinuityRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: operationalContinuityRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: operationalContinuityRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: operationalContinuityRecord.operationalClosureRecordId,
    finalTurnoverRecordId: operationalContinuityRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: operationalContinuityRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: operationalContinuityRecord.supportReadinessRecordId,
    operationsHandoverRecordId: operationalContinuityRecord.operationsHandoverRecordId,
    completionDossierRecordId: operationalContinuityRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: operationalContinuityRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: operationalContinuityRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: operationalContinuityRecord.archivalHandoffRecordId,
    closurePacketRecordId: operationalContinuityRecord.closurePacketRecordId,
    closureAuthorizationRecordId: operationalContinuityRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: operationalContinuityRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: operationalContinuityRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: operationalContinuityRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: operationalContinuityRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: operationalContinuityRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: operationalContinuityRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: operationalContinuityRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: operationalContinuityRecord.implementationHoldRecordId,
    cabDecisionRecordId: operationalContinuityRecord.cabDecisionRecordId,
    cabHandoffPacketId: operationalContinuityRecord.cabHandoffPacketId,
    freezeRecordId: operationalContinuityRecord.freezeRecordId,
    authorizationPacketId: operationalContinuityRecord.authorizationPacketId,
    promotionDossierId: operationalContinuityRecord.promotionDossierId,
    closurePackageId: operationalContinuityRecord.closurePackageId,
    outcomeRecordId: operationalContinuityRecord.outcomeRecordId,
    handoffPackageId: operationalContinuityRecord.handoffPackageId,
    controlledSwitchRequestId: operationalContinuityRecord.controlledSwitchRequestId,
    auditPackageId: operationalContinuityRecord.auditPackageId,
    switchReviewId: operationalContinuityRecord.switchReviewId,
    activationId: operationalContinuityRecord.activationId,
    idempotencyKey: operationalContinuityRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery service management handoff review"
      : "Blocked",
    requestedBy: actor,
    serviceOwner,
    supportQueueMappingReference,
    knowledgeArticleReference,
    escalationMatrixReference,
    serviceManagementHandoffSignOffReference,
    checks,
    evidence: [
      `Operational continuity record: ${operationalContinuityRecord.id}.`,
      `Evidence custody closure record: ${operationalContinuityRecord.evidenceCustodyClosureRecordId}.`,
      `Service owner: ${serviceOwner || "missing"}.`,
      `Support queue mapping: ${supportQueueMappingReference || "missing"}.`,
      `Knowledge article: ${knowledgeArticleReference || "missing"}.`,
      `Escalation matrix: ${escalationMatrixReference || "missing"}.`,
      `Service management handoff sign-off: ${serviceManagementHandoffSignOffReference || "missing"}.`,
      `Kill switch: ${operationalContinuityRecord.killSwitch.name}=${
        operationalContinuityRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: operationalContinuityRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findOperationalContinuityRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryServiceManagementHandoffRecordRequest
): ProductionExecutionArchiveRecoveryOperationalContinuityRecord {
  const operationalContinuityRecord =
    (request.operationalContinuityRecordId
      ? state.productionExecutionArchiveRecoveryOperationalContinuityRecords.find(
          (item) => item.id === request.operationalContinuityRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryOperationalContinuityRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionArchiveRecoveryOperationalContinuityRecords[0]);

  if (!operationalContinuityRecord) {
    throw new ProductionExecutionArchiveRecoveryServiceManagementHandoffRecordError(
      "production_execution_archive_recovery_operational_continuity_record_required",
      "A production execution archive recovery operational continuity record is required."
    );
  }

  return operationalContinuityRecord;
}
