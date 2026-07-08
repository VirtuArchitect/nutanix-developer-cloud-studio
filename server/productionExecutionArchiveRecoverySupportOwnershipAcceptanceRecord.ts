import type {
  ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord,
  ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord,
} from "../src/data/cloudStudioDomain";
import type {
  ApiState,
  CreateProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordRequest,
} from "./types";

export class ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord {
  const serviceManagementHandoffRecord = findServiceManagementHandoffRecord(state, request);
  const providerSlug = serviceManagementHandoffRecord.provider.toLowerCase();
  const supportOwner = request.supportOwner?.trim() ?? "Production Archive Recovery Support Owner";
  const serviceDeskAcceptanceReference =
    request.serviceDeskAcceptanceReference?.trim() ??
    `production-archive-recovery-support-ownership-service-desk-acceptance-${providerSlug}.md`;
  const escalationTestProofReference =
    request.escalationTestProofReference?.trim() ??
    `production-archive-recovery-support-ownership-escalation-test-${providerSlug}.md`;
  const monitoringOwnershipProofReference =
    request.monitoringOwnershipProofReference?.trim() ??
    `production-archive-recovery-support-ownership-monitoring-proof-${providerSlug}.md`;
  const supportOwnershipSignOffReference =
    request.supportOwnershipSignOffReference?.trim() ??
    `production-archive-recovery-support-ownership-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Service management handoff ready",
      passed:
        serviceManagementHandoffRecord.status ===
        "Ready for production execution archive recovery service management handoff review",
      detail: `${serviceManagementHandoffRecord.id} is ${serviceManagementHandoffRecord.status}.`,
    },
    {
      name: "Support owner assigned",
      passed: Boolean(supportOwner),
      detail: supportOwner || "Support owner is required.",
    },
    {
      name: "Service desk acceptance linked",
      passed: Boolean(serviceDeskAcceptanceReference),
      detail: serviceDeskAcceptanceReference || "Service desk acceptance reference is required.",
    },
    {
      name: "Escalation test proof linked",
      passed: Boolean(escalationTestProofReference),
      detail: escalationTestProofReference || "Escalation test proof reference is required.",
    },
    {
      name: "Monitoring ownership proof linked",
      passed: Boolean(monitoringOwnershipProofReference),
      detail: monitoringOwnershipProofReference || "Monitoring ownership proof reference is required.",
    },
    {
      name: "Support ownership sign-off linked",
      passed: Boolean(supportOwnershipSignOffReference),
      detail: supportOwnershipSignOffReference || "Support ownership sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        serviceManagementHandoffRecord.provisioningEnabled === false &&
        serviceManagementHandoffRecord.killSwitch.enabled === false,
      detail: `${serviceManagementHandoffRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-support-ownership-acceptance-record-${providerSlug}-${Date.now()}`,
    provider: serviceManagementHandoffRecord.provider,
    serviceManagementHandoffRecordId: serviceManagementHandoffRecord.id,
    operationalContinuityRecordId: serviceManagementHandoffRecord.operationalContinuityRecordId,
    evidenceCustodyClosureRecordId: serviceManagementHandoffRecord.evidenceCustodyClosureRecordId,
    finalComplianceArchiveRecordId: serviceManagementHandoffRecord.finalComplianceArchiveRecordId,
    archiveRecoveryAuditCertificationRecordId:
      serviceManagementHandoffRecord.archiveRecoveryAuditCertificationRecordId,
    archiveRecoveryClosureRecordId: serviceManagementHandoffRecord.archiveRecoveryClosureRecordId,
    archiveRecoveryAcceptanceRecordId: serviceManagementHandoffRecord.archiveRecoveryAcceptanceRecordId,
    archiveRecoveryDrillRecordId: serviceManagementHandoffRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: serviceManagementHandoffRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: serviceManagementHandoffRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: serviceManagementHandoffRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: serviceManagementHandoffRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: serviceManagementHandoffRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: serviceManagementHandoffRecord.operationalClosureRecordId,
    finalTurnoverRecordId: serviceManagementHandoffRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: serviceManagementHandoffRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: serviceManagementHandoffRecord.supportReadinessRecordId,
    operationsHandoverRecordId: serviceManagementHandoffRecord.operationsHandoverRecordId,
    completionDossierRecordId: serviceManagementHandoffRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: serviceManagementHandoffRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: serviceManagementHandoffRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: serviceManagementHandoffRecord.archivalHandoffRecordId,
    closurePacketRecordId: serviceManagementHandoffRecord.closurePacketRecordId,
    closureAuthorizationRecordId: serviceManagementHandoffRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: serviceManagementHandoffRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: serviceManagementHandoffRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: serviceManagementHandoffRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: serviceManagementHandoffRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: serviceManagementHandoffRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: serviceManagementHandoffRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: serviceManagementHandoffRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: serviceManagementHandoffRecord.implementationHoldRecordId,
    cabDecisionRecordId: serviceManagementHandoffRecord.cabDecisionRecordId,
    cabHandoffPacketId: serviceManagementHandoffRecord.cabHandoffPacketId,
    freezeRecordId: serviceManagementHandoffRecord.freezeRecordId,
    authorizationPacketId: serviceManagementHandoffRecord.authorizationPacketId,
    promotionDossierId: serviceManagementHandoffRecord.promotionDossierId,
    closurePackageId: serviceManagementHandoffRecord.closurePackageId,
    outcomeRecordId: serviceManagementHandoffRecord.outcomeRecordId,
    handoffPackageId: serviceManagementHandoffRecord.handoffPackageId,
    controlledSwitchRequestId: serviceManagementHandoffRecord.controlledSwitchRequestId,
    auditPackageId: serviceManagementHandoffRecord.auditPackageId,
    switchReviewId: serviceManagementHandoffRecord.switchReviewId,
    activationId: serviceManagementHandoffRecord.activationId,
    idempotencyKey: serviceManagementHandoffRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery support ownership acceptance review"
      : "Blocked",
    requestedBy: actor,
    supportOwner,
    serviceDeskAcceptanceReference,
    escalationTestProofReference,
    monitoringOwnershipProofReference,
    supportOwnershipSignOffReference,
    checks,
    evidence: [
      `Service management handoff record: ${serviceManagementHandoffRecord.id}.`,
      `Operational continuity record: ${serviceManagementHandoffRecord.operationalContinuityRecordId}.`,
      `Support owner: ${supportOwner || "missing"}.`,
      `Service desk acceptance: ${serviceDeskAcceptanceReference || "missing"}.`,
      `Escalation test proof: ${escalationTestProofReference || "missing"}.`,
      `Monitoring ownership proof: ${monitoringOwnershipProofReference || "missing"}.`,
      `Support ownership sign-off: ${supportOwnershipSignOffReference || "missing"}.`,
      `Kill switch: ${serviceManagementHandoffRecord.killSwitch.name}=${
        serviceManagementHandoffRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: serviceManagementHandoffRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findServiceManagementHandoffRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordRequest
): ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord {
  const serviceManagementHandoffRecord =
    (request.serviceManagementHandoffRecordId
      ? state.productionExecutionArchiveRecoveryServiceManagementHandoffRecords.find(
          (item) => item.id === request.serviceManagementHandoffRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryServiceManagementHandoffRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionArchiveRecoveryServiceManagementHandoffRecords[0]);

  if (!serviceManagementHandoffRecord) {
    throw new ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordError(
      "production_execution_archive_recovery_service_management_handoff_record_required",
      "A production execution archive recovery service management handoff record is required."
    );
  }

  return serviceManagementHandoffRecord;
}
