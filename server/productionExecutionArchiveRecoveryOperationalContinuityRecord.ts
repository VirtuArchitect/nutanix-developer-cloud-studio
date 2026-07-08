import type {
  ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord,
  ProductionExecutionArchiveRecoveryOperationalContinuityRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionArchiveRecoveryOperationalContinuityRecordRequest } from "./types";

export class ProductionExecutionArchiveRecoveryOperationalContinuityRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryOperationalContinuityRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryOperationalContinuityRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryOperationalContinuityRecord {
  const evidenceCustodyClosureRecord = findEvidenceCustodyClosureRecord(state, request);
  const providerSlug = evidenceCustodyClosureRecord.provider.toLowerCase();
  const continuityOwner = request.continuityOwner?.trim() ?? "Production Archive Recovery Continuity Owner";
  const runbookUpdateReference =
    request.runbookUpdateReference?.trim() ??
    `production-archive-recovery-operational-continuity-runbook-${providerSlug}.md`;
  const kpiBaselineReference =
    request.kpiBaselineReference?.trim() ??
    `production-archive-recovery-operational-continuity-kpi-baseline-${providerSlug}.json`;
  const supportHandoffReference =
    request.supportHandoffReference?.trim() ??
    `production-archive-recovery-operational-continuity-support-handoff-${providerSlug}.md`;
  const continuitySignOffReference =
    request.continuitySignOffReference?.trim() ??
    `production-archive-recovery-operational-continuity-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Evidence custody closure ready",
      passed:
        evidenceCustodyClosureRecord.status ===
        "Ready for production execution archive recovery evidence custody closure review",
      detail: `${evidenceCustodyClosureRecord.id} is ${evidenceCustodyClosureRecord.status}.`,
    },
    {
      name: "Continuity owner assigned",
      passed: Boolean(continuityOwner),
      detail: continuityOwner || "Continuity owner is required.",
    },
    {
      name: "Runbook update linked",
      passed: Boolean(runbookUpdateReference),
      detail: runbookUpdateReference || "Runbook update reference is required.",
    },
    {
      name: "KPI baseline linked",
      passed: Boolean(kpiBaselineReference),
      detail: kpiBaselineReference || "KPI baseline reference is required.",
    },
    {
      name: "Support handoff linked",
      passed: Boolean(supportHandoffReference),
      detail: supportHandoffReference || "Support handoff reference is required.",
    },
    {
      name: "Continuity sign-off linked",
      passed: Boolean(continuitySignOffReference),
      detail: continuitySignOffReference || "Continuity sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        evidenceCustodyClosureRecord.provisioningEnabled === false &&
        evidenceCustodyClosureRecord.killSwitch.enabled === false,
      detail: `${evidenceCustodyClosureRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-operational-continuity-record-${providerSlug}-${Date.now()}`,
    provider: evidenceCustodyClosureRecord.provider,
    evidenceCustodyClosureRecordId: evidenceCustodyClosureRecord.id,
    finalComplianceArchiveRecordId: evidenceCustodyClosureRecord.finalComplianceArchiveRecordId,
    archiveRecoveryAuditCertificationRecordId:
      evidenceCustodyClosureRecord.archiveRecoveryAuditCertificationRecordId,
    archiveRecoveryClosureRecordId: evidenceCustodyClosureRecord.archiveRecoveryClosureRecordId,
    archiveRecoveryAcceptanceRecordId: evidenceCustodyClosureRecord.archiveRecoveryAcceptanceRecordId,
    archiveRecoveryDrillRecordId: evidenceCustodyClosureRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: evidenceCustodyClosureRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: evidenceCustodyClosureRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: evidenceCustodyClosureRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: evidenceCustodyClosureRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: evidenceCustodyClosureRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: evidenceCustodyClosureRecord.operationalClosureRecordId,
    finalTurnoverRecordId: evidenceCustodyClosureRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: evidenceCustodyClosureRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: evidenceCustodyClosureRecord.supportReadinessRecordId,
    operationsHandoverRecordId: evidenceCustodyClosureRecord.operationsHandoverRecordId,
    completionDossierRecordId: evidenceCustodyClosureRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: evidenceCustodyClosureRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: evidenceCustodyClosureRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: evidenceCustodyClosureRecord.archivalHandoffRecordId,
    closurePacketRecordId: evidenceCustodyClosureRecord.closurePacketRecordId,
    closureAuthorizationRecordId: evidenceCustodyClosureRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: evidenceCustodyClosureRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: evidenceCustodyClosureRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: evidenceCustodyClosureRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: evidenceCustodyClosureRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: evidenceCustodyClosureRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: evidenceCustodyClosureRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: evidenceCustodyClosureRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: evidenceCustodyClosureRecord.implementationHoldRecordId,
    cabDecisionRecordId: evidenceCustodyClosureRecord.cabDecisionRecordId,
    cabHandoffPacketId: evidenceCustodyClosureRecord.cabHandoffPacketId,
    freezeRecordId: evidenceCustodyClosureRecord.freezeRecordId,
    authorizationPacketId: evidenceCustodyClosureRecord.authorizationPacketId,
    promotionDossierId: evidenceCustodyClosureRecord.promotionDossierId,
    closurePackageId: evidenceCustodyClosureRecord.closurePackageId,
    outcomeRecordId: evidenceCustodyClosureRecord.outcomeRecordId,
    handoffPackageId: evidenceCustodyClosureRecord.handoffPackageId,
    controlledSwitchRequestId: evidenceCustodyClosureRecord.controlledSwitchRequestId,
    auditPackageId: evidenceCustodyClosureRecord.auditPackageId,
    switchReviewId: evidenceCustodyClosureRecord.switchReviewId,
    activationId: evidenceCustodyClosureRecord.activationId,
    idempotencyKey: evidenceCustodyClosureRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery operational continuity review"
      : "Blocked",
    requestedBy: actor,
    continuityOwner,
    runbookUpdateReference,
    kpiBaselineReference,
    supportHandoffReference,
    continuitySignOffReference,
    checks,
    evidence: [
      `Evidence custody closure record: ${evidenceCustodyClosureRecord.id}.`,
      `Final compliance archive record: ${evidenceCustodyClosureRecord.finalComplianceArchiveRecordId}.`,
      `Continuity owner: ${continuityOwner || "missing"}.`,
      `Runbook update: ${runbookUpdateReference || "missing"}.`,
      `KPI baseline: ${kpiBaselineReference || "missing"}.`,
      `Support handoff: ${supportHandoffReference || "missing"}.`,
      `Continuity sign-off: ${continuitySignOffReference || "missing"}.`,
      `Kill switch: ${evidenceCustodyClosureRecord.killSwitch.name}=${
        evidenceCustodyClosureRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: evidenceCustodyClosureRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findEvidenceCustodyClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryOperationalContinuityRecordRequest
): ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord {
  const evidenceCustodyClosureRecord =
    (request.evidenceCustodyClosureRecordId
      ? state.productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords.find(
          (item) => item.id === request.evidenceCustodyClosureRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords[0]);

  if (!evidenceCustodyClosureRecord) {
    throw new ProductionExecutionArchiveRecoveryOperationalContinuityRecordError(
      "production_execution_archive_recovery_evidence_custody_closure_record_required",
      "A production execution archive recovery evidence custody closure record is required."
    );
  }

  return evidenceCustodyClosureRecord;
}
