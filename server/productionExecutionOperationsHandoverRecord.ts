import type {
  ProductionExecutionCompletionDossierRecord,
  ProductionExecutionOperationsHandoverRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionOperationsHandoverRecordRequest } from "./types";

export class ProductionExecutionOperationsHandoverRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionOperationsHandoverRecord(
  state: ApiState,
  request: CreateProductionExecutionOperationsHandoverRecordRequest,
  actor: string
): ProductionExecutionOperationsHandoverRecord {
  const completionDossierRecord = findCompletionDossierRecord(state, request);
  const providerSlug = completionDossierRecord.provider.toLowerCase();
  const operationsOwner = request.operationsOwner?.trim() ?? "Production Operations Owner";
  const supportModelReference =
    request.supportModelReference?.trim() ?? `production-support-model-${providerSlug}.md`;
  const monitoringHandoverProofReference =
    request.monitoringHandoverProofReference?.trim() ?? `production-monitoring-handover-${providerSlug}.md`;
  const escalationRouteReference =
    request.escalationRouteReference?.trim() ?? `production-escalation-route-${providerSlug}.md`;
  const serviceDeskAcceptanceReference =
    request.serviceDeskAcceptanceReference?.trim() ?? `production-service-desk-acceptance-${providerSlug}.md`;

  const checks = [
    {
      name: "Completion dossier ready",
      passed:
        completionDossierRecord.status ===
        "Ready for production execution completion dossier review",
      detail: `${completionDossierRecord.id} is ${completionDossierRecord.status}.`,
    },
    {
      name: "Operations owner assigned",
      passed: Boolean(operationsOwner),
      detail: operationsOwner || "Operations owner is required.",
    },
    {
      name: "Support model linked",
      passed: Boolean(supportModelReference),
      detail: supportModelReference || "Support model reference is required.",
    },
    {
      name: "Monitoring handover proof linked",
      passed: Boolean(monitoringHandoverProofReference),
      detail: monitoringHandoverProofReference || "Monitoring handover proof reference is required.",
    },
    {
      name: "Escalation route linked",
      passed: Boolean(escalationRouteReference),
      detail: escalationRouteReference || "Escalation route reference is required.",
    },
    {
      name: "Service desk acceptance linked",
      passed: Boolean(serviceDeskAcceptanceReference),
      detail: serviceDeskAcceptanceReference || "Service desk acceptance reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        completionDossierRecord.provisioningEnabled === false &&
        completionDossierRecord.killSwitch.enabled === false,
      detail: `${completionDossierRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-operations-handover-record-${providerSlug}-${Date.now()}`,
    provider: completionDossierRecord.provider,
    completionDossierRecordId: completionDossierRecord.id,
    finalArchiveCertificationRecordId: completionDossierRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: completionDossierRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: completionDossierRecord.archivalHandoffRecordId,
    closurePacketRecordId: completionDossierRecord.closurePacketRecordId,
    closureAuthorizationRecordId: completionDossierRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: completionDossierRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: completionDossierRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: completionDossierRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: completionDossierRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: completionDossierRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: completionDossierRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: completionDossierRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: completionDossierRecord.implementationHoldRecordId,
    cabDecisionRecordId: completionDossierRecord.cabDecisionRecordId,
    cabHandoffPacketId: completionDossierRecord.cabHandoffPacketId,
    freezeRecordId: completionDossierRecord.freezeRecordId,
    authorizationPacketId: completionDossierRecord.authorizationPacketId,
    promotionDossierId: completionDossierRecord.promotionDossierId,
    closurePackageId: completionDossierRecord.closurePackageId,
    outcomeRecordId: completionDossierRecord.outcomeRecordId,
    handoffPackageId: completionDossierRecord.handoffPackageId,
    controlledSwitchRequestId: completionDossierRecord.controlledSwitchRequestId,
    auditPackageId: completionDossierRecord.auditPackageId,
    switchReviewId: completionDossierRecord.switchReviewId,
    activationId: completionDossierRecord.activationId,
    idempotencyKey: completionDossierRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution operations handover review"
      : "Blocked",
    requestedBy: actor,
    operationsOwner,
    supportModelReference,
    monitoringHandoverProofReference,
    escalationRouteReference,
    serviceDeskAcceptanceReference,
    checks,
    evidence: [
      `Completion dossier record: ${completionDossierRecord.id}.`,
      `Final archive certification record: ${completionDossierRecord.finalArchiveCertificationRecordId}.`,
      `Operations owner: ${operationsOwner || "missing"}.`,
      `Support model: ${supportModelReference || "missing"}.`,
      `Monitoring handover proof: ${monitoringHandoverProofReference || "missing"}.`,
      `Escalation route: ${escalationRouteReference || "missing"}.`,
      `Service desk acceptance: ${serviceDeskAcceptanceReference || "missing"}.`,
      `Kill switch: ${completionDossierRecord.killSwitch.name}=${
        completionDossierRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: completionDossierRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findCompletionDossierRecord(
  state: ApiState,
  request: CreateProductionExecutionOperationsHandoverRecordRequest
): ProductionExecutionCompletionDossierRecord {
  const completionDossierRecord =
    (request.completionDossierRecordId
      ? state.productionExecutionCompletionDossierRecords.find(
          (item) => item.id === request.completionDossierRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionCompletionDossierRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionCompletionDossierRecords[0]);

  if (!completionDossierRecord) {
    throw new ProductionExecutionOperationsHandoverRecordError(
      "production_execution_completion_dossier_record_required",
      "A production execution completion dossier record is required."
    );
  }

  return completionDossierRecord;
}
