import type {
  ProductionExecutionServiceAcceptanceRecord,
  ProductionExecutionSupportReadinessRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionServiceAcceptanceRecordRequest } from "./types";

export class ProductionExecutionServiceAcceptanceRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionServiceAcceptanceRecord(
  state: ApiState,
  request: CreateProductionExecutionServiceAcceptanceRecordRequest,
  actor: string
): ProductionExecutionServiceAcceptanceRecord {
  const supportReadinessRecord = findSupportReadinessRecord(state, request);
  const providerSlug = supportReadinessRecord.provider.toLowerCase();
  const serviceOwner = request.serviceOwner?.trim() ?? "Production Service Owner";
  const acceptanceCriteriaReference =
    request.acceptanceCriteriaReference?.trim() ?? `production-acceptance-criteria-${providerSlug}.md`;
  const operationalSloReference =
    request.operationalSloReference?.trim() ?? `production-operational-slo-${providerSlug}.md`;
  const supportSignOffReference =
    request.supportSignOffReference?.trim() ?? `production-support-signoff-${providerSlug}.md`;
  const finalCustomerNotificationReference =
    request.finalCustomerNotificationReference?.trim() ?? `production-final-customer-notification-${providerSlug}.md`;

  const checks = [
    {
      name: "Support readiness ready",
      passed:
        supportReadinessRecord.status ===
        "Ready for production execution support readiness review",
      detail: `${supportReadinessRecord.id} is ${supportReadinessRecord.status}.`,
    },
    {
      name: "Service owner assigned",
      passed: Boolean(serviceOwner),
      detail: serviceOwner || "Service owner is required.",
    },
    {
      name: "Acceptance criteria linked",
      passed: Boolean(acceptanceCriteriaReference),
      detail: acceptanceCriteriaReference || "Acceptance criteria reference is required.",
    },
    {
      name: "Operational SLO linked",
      passed: Boolean(operationalSloReference),
      detail: operationalSloReference || "Operational SLO reference is required.",
    },
    {
      name: "Support sign-off linked",
      passed: Boolean(supportSignOffReference),
      detail: supportSignOffReference || "Support sign-off reference is required.",
    },
    {
      name: "Customer notification linked",
      passed: Boolean(finalCustomerNotificationReference),
      detail: finalCustomerNotificationReference || "Final customer notification reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        supportReadinessRecord.provisioningEnabled === false &&
        supportReadinessRecord.killSwitch.enabled === false,
      detail: `${supportReadinessRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-service-acceptance-record-${providerSlug}-${Date.now()}`,
    provider: supportReadinessRecord.provider,
    supportReadinessRecordId: supportReadinessRecord.id,
    operationsHandoverRecordId: supportReadinessRecord.operationsHandoverRecordId,
    completionDossierRecordId: supportReadinessRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: supportReadinessRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: supportReadinessRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: supportReadinessRecord.archivalHandoffRecordId,
    closurePacketRecordId: supportReadinessRecord.closurePacketRecordId,
    closureAuthorizationRecordId: supportReadinessRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: supportReadinessRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: supportReadinessRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: supportReadinessRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: supportReadinessRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: supportReadinessRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: supportReadinessRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: supportReadinessRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: supportReadinessRecord.implementationHoldRecordId,
    cabDecisionRecordId: supportReadinessRecord.cabDecisionRecordId,
    cabHandoffPacketId: supportReadinessRecord.cabHandoffPacketId,
    freezeRecordId: supportReadinessRecord.freezeRecordId,
    authorizationPacketId: supportReadinessRecord.authorizationPacketId,
    promotionDossierId: supportReadinessRecord.promotionDossierId,
    closurePackageId: supportReadinessRecord.closurePackageId,
    outcomeRecordId: supportReadinessRecord.outcomeRecordId,
    handoffPackageId: supportReadinessRecord.handoffPackageId,
    controlledSwitchRequestId: supportReadinessRecord.controlledSwitchRequestId,
    auditPackageId: supportReadinessRecord.auditPackageId,
    switchReviewId: supportReadinessRecord.switchReviewId,
    activationId: supportReadinessRecord.activationId,
    idempotencyKey: supportReadinessRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution service acceptance review"
      : "Blocked",
    requestedBy: actor,
    serviceOwner,
    acceptanceCriteriaReference,
    operationalSloReference,
    supportSignOffReference,
    finalCustomerNotificationReference,
    checks,
    evidence: [
      `Support readiness record: ${supportReadinessRecord.id}.`,
      `Operations handover record: ${supportReadinessRecord.operationsHandoverRecordId}.`,
      `Service owner: ${serviceOwner || "missing"}.`,
      `Acceptance criteria: ${acceptanceCriteriaReference || "missing"}.`,
      `Operational SLO: ${operationalSloReference || "missing"}.`,
      `Support sign-off: ${supportSignOffReference || "missing"}.`,
      `Final customer notification: ${finalCustomerNotificationReference || "missing"}.`,
      `Kill switch: ${supportReadinessRecord.killSwitch.name}=${
        supportReadinessRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: supportReadinessRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findSupportReadinessRecord(
  state: ApiState,
  request: CreateProductionExecutionServiceAcceptanceRecordRequest
): ProductionExecutionSupportReadinessRecord {
  const supportReadinessRecord =
    (request.supportReadinessRecordId
      ? state.productionExecutionSupportReadinessRecords.find(
          (item) => item.id === request.supportReadinessRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionSupportReadinessRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionSupportReadinessRecords[0]);

  if (!supportReadinessRecord) {
    throw new ProductionExecutionServiceAcceptanceRecordError(
      "production_execution_support_readiness_record_required",
      "A production execution support readiness record is required."
    );
  }

  return supportReadinessRecord;
}
