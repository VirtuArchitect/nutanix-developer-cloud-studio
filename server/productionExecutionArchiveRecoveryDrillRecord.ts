import type {
  ProductionExecutionArchiveRecoveryDrillRecord,
  ProductionExecutionArchiveRetrievalValidationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRecoveryDrillRecordRequest } from "./types";

export class ProductionExecutionArchiveRecoveryDrillRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryDrillRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryDrillRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryDrillRecord {
  const archiveRetrievalValidationRecord = findArchiveRetrievalValidationRecord(state, request);
  const providerSlug = archiveRetrievalValidationRecord.provider.toLowerCase();
  const drillOwner = request.drillOwner?.trim() ?? "Production Archive Recovery Drill Owner";
  const recoveryScenarioReference =
    request.recoveryScenarioReference?.trim() ?? `production-archive-recovery-scenario-${providerSlug}.md`;
  const elapsedRecoveryProofReference =
    request.elapsedRecoveryProofReference?.trim() ?? `production-archive-elapsed-recovery-proof-${providerSlug}.md`;
  const restoredArtifactReviewReference =
    request.restoredArtifactReviewReference?.trim() ?? `production-archive-restored-artifact-review-${providerSlug}.md`;
  const drillSignOffReference =
    request.drillSignOffReference?.trim() ?? `production-archive-recovery-drill-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Archive retrieval validation ready",
      passed:
        archiveRetrievalValidationRecord.status ===
        "Ready for production execution archive retrieval validation review",
      detail: `${archiveRetrievalValidationRecord.id} is ${archiveRetrievalValidationRecord.status}.`,
    },
    {
      name: "Drill owner assigned",
      passed: Boolean(drillOwner),
      detail: drillOwner || "Drill owner is required.",
    },
    {
      name: "Recovery scenario linked",
      passed: Boolean(recoveryScenarioReference),
      detail: recoveryScenarioReference || "Recovery scenario reference is required.",
    },
    {
      name: "Elapsed recovery proof linked",
      passed: Boolean(elapsedRecoveryProofReference),
      detail: elapsedRecoveryProofReference || "Elapsed recovery proof reference is required.",
    },
    {
      name: "Restored artifact review linked",
      passed: Boolean(restoredArtifactReviewReference),
      detail: restoredArtifactReviewReference || "Restored artifact review reference is required.",
    },
    {
      name: "Drill sign-off linked",
      passed: Boolean(drillSignOffReference),
      detail: drillSignOffReference || "Drill sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        archiveRetrievalValidationRecord.provisioningEnabled === false &&
        archiveRetrievalValidationRecord.killSwitch.enabled === false,
      detail: `${archiveRetrievalValidationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-drill-record-${providerSlug}-${Date.now()}`,
    provider: archiveRetrievalValidationRecord.provider,
    archiveRetrievalValidationRecordId: archiveRetrievalValidationRecord.id,
    readinessArchiveHandoffRecordId: archiveRetrievalValidationRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: archiveRetrievalValidationRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: archiveRetrievalValidationRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: archiveRetrievalValidationRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: archiveRetrievalValidationRecord.operationalClosureRecordId,
    finalTurnoverRecordId: archiveRetrievalValidationRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: archiveRetrievalValidationRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: archiveRetrievalValidationRecord.supportReadinessRecordId,
    operationsHandoverRecordId: archiveRetrievalValidationRecord.operationsHandoverRecordId,
    completionDossierRecordId: archiveRetrievalValidationRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: archiveRetrievalValidationRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: archiveRetrievalValidationRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: archiveRetrievalValidationRecord.archivalHandoffRecordId,
    closurePacketRecordId: archiveRetrievalValidationRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archiveRetrievalValidationRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archiveRetrievalValidationRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archiveRetrievalValidationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archiveRetrievalValidationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archiveRetrievalValidationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archiveRetrievalValidationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archiveRetrievalValidationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archiveRetrievalValidationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archiveRetrievalValidationRecord.implementationHoldRecordId,
    cabDecisionRecordId: archiveRetrievalValidationRecord.cabDecisionRecordId,
    cabHandoffPacketId: archiveRetrievalValidationRecord.cabHandoffPacketId,
    freezeRecordId: archiveRetrievalValidationRecord.freezeRecordId,
    authorizationPacketId: archiveRetrievalValidationRecord.authorizationPacketId,
    promotionDossierId: archiveRetrievalValidationRecord.promotionDossierId,
    closurePackageId: archiveRetrievalValidationRecord.closurePackageId,
    outcomeRecordId: archiveRetrievalValidationRecord.outcomeRecordId,
    handoffPackageId: archiveRetrievalValidationRecord.handoffPackageId,
    controlledSwitchRequestId: archiveRetrievalValidationRecord.controlledSwitchRequestId,
    auditPackageId: archiveRetrievalValidationRecord.auditPackageId,
    switchReviewId: archiveRetrievalValidationRecord.switchReviewId,
    activationId: archiveRetrievalValidationRecord.activationId,
    idempotencyKey: archiveRetrievalValidationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery drill review"
      : "Blocked",
    requestedBy: actor,
    drillOwner,
    recoveryScenarioReference,
    elapsedRecoveryProofReference,
    restoredArtifactReviewReference,
    drillSignOffReference,
    checks,
    evidence: [
      `Archive retrieval validation record: ${archiveRetrievalValidationRecord.id}.`,
      `Readiness archive handoff record: ${archiveRetrievalValidationRecord.readinessArchiveHandoffRecordId}.`,
      `Drill owner: ${drillOwner || "missing"}.`,
      `Recovery scenario: ${recoveryScenarioReference || "missing"}.`,
      `Elapsed recovery proof: ${elapsedRecoveryProofReference || "missing"}.`,
      `Restored artifact review: ${restoredArtifactReviewReference || "missing"}.`,
      `Drill sign-off: ${drillSignOffReference || "missing"}.`,
      `Kill switch: ${archiveRetrievalValidationRecord.killSwitch.name}=${
        archiveRetrievalValidationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archiveRetrievalValidationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findArchiveRetrievalValidationRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryDrillRecordRequest
): ProductionExecutionArchiveRetrievalValidationRecord {
  const archiveRetrievalValidationRecord =
    (request.archiveRetrievalValidationRecordId
      ? state.productionExecutionArchiveRetrievalValidationRecords.find(
          (item) => item.id === request.archiveRetrievalValidationRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRetrievalValidationRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionArchiveRetrievalValidationRecords[0]);

  if (!archiveRetrievalValidationRecord) {
    throw new ProductionExecutionArchiveRecoveryDrillRecordError(
      "production_execution_archive_retrieval_validation_record_required",
      "A production execution archive retrieval validation record is required."
    );
  }

  return archiveRetrievalValidationRecord;
}
