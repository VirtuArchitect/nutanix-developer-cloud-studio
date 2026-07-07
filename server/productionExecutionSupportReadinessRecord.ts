import type {
  ProductionExecutionOperationsHandoverRecord,
  ProductionExecutionSupportReadinessRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionSupportReadinessRecordRequest } from "./types";

export class ProductionExecutionSupportReadinessRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionSupportReadinessRecord(
  state: ApiState,
  request: CreateProductionExecutionSupportReadinessRecordRequest,
  actor: string
): ProductionExecutionSupportReadinessRecord {
  const operationsHandoverRecord = findOperationsHandoverRecord(state, request);
  const providerSlug = operationsHandoverRecord.provider.toLowerCase();
  const supportOwner = request.supportOwner?.trim() ?? "Production Support Owner";
  const runbookAcceptanceReference =
    request.runbookAcceptanceReference?.trim() ?? `production-runbook-acceptance-${providerSlug}.md`;
  const alertRoutingProofReference =
    request.alertRoutingProofReference?.trim() ?? `production-alert-routing-proof-${providerSlug}.md`;
  const incidentProcessReference =
    request.incidentProcessReference?.trim() ?? `production-incident-process-${providerSlug}.md`;
  const knowledgeBasePublicationReference =
    request.knowledgeBasePublicationReference?.trim() ?? `production-knowledge-base-publication-${providerSlug}.md`;

  const checks = [
    {
      name: "Operations handover ready",
      passed:
        operationsHandoverRecord.status ===
        "Ready for production execution operations handover review",
      detail: `${operationsHandoverRecord.id} is ${operationsHandoverRecord.status}.`,
    },
    {
      name: "Support owner assigned",
      passed: Boolean(supportOwner),
      detail: supportOwner || "Support owner is required.",
    },
    {
      name: "Runbook acceptance linked",
      passed: Boolean(runbookAcceptanceReference),
      detail: runbookAcceptanceReference || "Runbook acceptance reference is required.",
    },
    {
      name: "Alert routing proof linked",
      passed: Boolean(alertRoutingProofReference),
      detail: alertRoutingProofReference || "Alert routing proof reference is required.",
    },
    {
      name: "Incident process linked",
      passed: Boolean(incidentProcessReference),
      detail: incidentProcessReference || "Incident process reference is required.",
    },
    {
      name: "Knowledge base publication linked",
      passed: Boolean(knowledgeBasePublicationReference),
      detail: knowledgeBasePublicationReference || "Knowledge base publication reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        operationsHandoverRecord.provisioningEnabled === false &&
        operationsHandoverRecord.killSwitch.enabled === false,
      detail: `${operationsHandoverRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-support-readiness-record-${providerSlug}-${Date.now()}`,
    provider: operationsHandoverRecord.provider,
    operationsHandoverRecordId: operationsHandoverRecord.id,
    completionDossierRecordId: operationsHandoverRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: operationsHandoverRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: operationsHandoverRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: operationsHandoverRecord.archivalHandoffRecordId,
    closurePacketRecordId: operationsHandoverRecord.closurePacketRecordId,
    closureAuthorizationRecordId: operationsHandoverRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: operationsHandoverRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: operationsHandoverRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: operationsHandoverRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: operationsHandoverRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: operationsHandoverRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: operationsHandoverRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: operationsHandoverRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: operationsHandoverRecord.implementationHoldRecordId,
    cabDecisionRecordId: operationsHandoverRecord.cabDecisionRecordId,
    cabHandoffPacketId: operationsHandoverRecord.cabHandoffPacketId,
    freezeRecordId: operationsHandoverRecord.freezeRecordId,
    authorizationPacketId: operationsHandoverRecord.authorizationPacketId,
    promotionDossierId: operationsHandoverRecord.promotionDossierId,
    closurePackageId: operationsHandoverRecord.closurePackageId,
    outcomeRecordId: operationsHandoverRecord.outcomeRecordId,
    handoffPackageId: operationsHandoverRecord.handoffPackageId,
    controlledSwitchRequestId: operationsHandoverRecord.controlledSwitchRequestId,
    auditPackageId: operationsHandoverRecord.auditPackageId,
    switchReviewId: operationsHandoverRecord.switchReviewId,
    activationId: operationsHandoverRecord.activationId,
    idempotencyKey: operationsHandoverRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution support readiness review"
      : "Blocked",
    requestedBy: actor,
    supportOwner,
    runbookAcceptanceReference,
    alertRoutingProofReference,
    incidentProcessReference,
    knowledgeBasePublicationReference,
    checks,
    evidence: [
      `Operations handover record: ${operationsHandoverRecord.id}.`,
      `Completion dossier record: ${operationsHandoverRecord.completionDossierRecordId}.`,
      `Support owner: ${supportOwner || "missing"}.`,
      `Runbook acceptance: ${runbookAcceptanceReference || "missing"}.`,
      `Alert routing proof: ${alertRoutingProofReference || "missing"}.`,
      `Incident process: ${incidentProcessReference || "missing"}.`,
      `Knowledge base publication: ${knowledgeBasePublicationReference || "missing"}.`,
      `Kill switch: ${operationsHandoverRecord.killSwitch.name}=${
        operationsHandoverRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: operationsHandoverRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findOperationsHandoverRecord(
  state: ApiState,
  request: CreateProductionExecutionSupportReadinessRecordRequest
): ProductionExecutionOperationsHandoverRecord {
  const operationsHandoverRecord =
    (request.operationsHandoverRecordId
      ? state.productionExecutionOperationsHandoverRecords.find(
          (item) => item.id === request.operationsHandoverRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionOperationsHandoverRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionOperationsHandoverRecords[0]);

  if (!operationsHandoverRecord) {
    throw new ProductionExecutionSupportReadinessRecordError(
      "production_execution_operations_handover_record_required",
      "A production execution operations handover record is required."
    );
  }

  return operationsHandoverRecord;
}
