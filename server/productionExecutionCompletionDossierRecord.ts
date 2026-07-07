import type {
  ProductionExecutionCompletionDossierRecord,
  ProductionExecutionFinalArchiveCertificationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionCompletionDossierRecordRequest } from "./types";

export class ProductionExecutionCompletionDossierRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionCompletionDossierRecord(
  state: ApiState,
  request: CreateProductionExecutionCompletionDossierRecordRequest,
  actor: string
): ProductionExecutionCompletionDossierRecord {
  const finalArchiveCertificationRecord = findFinalArchiveCertificationRecord(state, request);
  const providerSlug = finalArchiveCertificationRecord.provider.toLowerCase();
  const dossierOwner = request.dossierOwner?.trim() ?? "Production Completion Dossier Owner";
  const finalEvidenceIndexReference =
    request.finalEvidenceIndexReference?.trim() ?? `production-final-evidence-index-${providerSlug}.md`;
  const auditExportReference =
    request.auditExportReference?.trim() ?? `production-completion-audit-export-${providerSlug}.jsonl`;
  const operationsAcceptanceReference =
    request.operationsAcceptanceReference?.trim() ?? `production-operations-acceptance-${providerSlug}.md`;
  const complianceClosureProofReference =
    request.complianceClosureProofReference?.trim() ?? `production-compliance-closure-proof-${providerSlug}.md`;

  const checks = [
    {
      name: "Final archive certification ready",
      passed:
        finalArchiveCertificationRecord.status ===
        "Ready for production execution final archive certification review",
      detail: `${finalArchiveCertificationRecord.id} is ${finalArchiveCertificationRecord.status}.`,
    },
    {
      name: "Dossier owner assigned",
      passed: Boolean(dossierOwner),
      detail: dossierOwner || "Dossier owner is required.",
    },
    {
      name: "Final evidence index linked",
      passed: Boolean(finalEvidenceIndexReference),
      detail: finalEvidenceIndexReference || "Final evidence index reference is required.",
    },
    {
      name: "Audit export linked",
      passed: Boolean(auditExportReference),
      detail: auditExportReference || "Audit export reference is required.",
    },
    {
      name: "Operations acceptance linked",
      passed: Boolean(operationsAcceptanceReference),
      detail: operationsAcceptanceReference || "Operations acceptance reference is required.",
    },
    {
      name: "Compliance closure proof linked",
      passed: Boolean(complianceClosureProofReference),
      detail: complianceClosureProofReference || "Compliance closure proof reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        finalArchiveCertificationRecord.provisioningEnabled === false &&
        finalArchiveCertificationRecord.killSwitch.enabled === false,
      detail: `${finalArchiveCertificationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-completion-dossier-record-${providerSlug}-${Date.now()}`,
    provider: finalArchiveCertificationRecord.provider,
    finalArchiveCertificationRecordId: finalArchiveCertificationRecord.id,
    retentionAttestationRecordId: finalArchiveCertificationRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: finalArchiveCertificationRecord.archivalHandoffRecordId,
    closurePacketRecordId: finalArchiveCertificationRecord.closurePacketRecordId,
    closureAuthorizationRecordId: finalArchiveCertificationRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: finalArchiveCertificationRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: finalArchiveCertificationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: finalArchiveCertificationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: finalArchiveCertificationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: finalArchiveCertificationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: finalArchiveCertificationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: finalArchiveCertificationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: finalArchiveCertificationRecord.implementationHoldRecordId,
    cabDecisionRecordId: finalArchiveCertificationRecord.cabDecisionRecordId,
    cabHandoffPacketId: finalArchiveCertificationRecord.cabHandoffPacketId,
    freezeRecordId: finalArchiveCertificationRecord.freezeRecordId,
    authorizationPacketId: finalArchiveCertificationRecord.authorizationPacketId,
    promotionDossierId: finalArchiveCertificationRecord.promotionDossierId,
    closurePackageId: finalArchiveCertificationRecord.closurePackageId,
    outcomeRecordId: finalArchiveCertificationRecord.outcomeRecordId,
    handoffPackageId: finalArchiveCertificationRecord.handoffPackageId,
    controlledSwitchRequestId: finalArchiveCertificationRecord.controlledSwitchRequestId,
    auditPackageId: finalArchiveCertificationRecord.auditPackageId,
    switchReviewId: finalArchiveCertificationRecord.switchReviewId,
    activationId: finalArchiveCertificationRecord.activationId,
    idempotencyKey: finalArchiveCertificationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution completion dossier review"
      : "Blocked",
    requestedBy: actor,
    dossierOwner,
    finalEvidenceIndexReference,
    auditExportReference,
    operationsAcceptanceReference,
    complianceClosureProofReference,
    checks,
    evidence: [
      `Final archive certification record: ${finalArchiveCertificationRecord.id}.`,
      `Retention attestation record: ${finalArchiveCertificationRecord.retentionAttestationRecordId}.`,
      `Dossier owner: ${dossierOwner || "missing"}.`,
      `Final evidence index: ${finalEvidenceIndexReference || "missing"}.`,
      `Audit export: ${auditExportReference || "missing"}.`,
      `Operations acceptance: ${operationsAcceptanceReference || "missing"}.`,
      `Compliance closure proof: ${complianceClosureProofReference || "missing"}.`,
      `Kill switch: ${finalArchiveCertificationRecord.killSwitch.name}=${
        finalArchiveCertificationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: finalArchiveCertificationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findFinalArchiveCertificationRecord(
  state: ApiState,
  request: CreateProductionExecutionCompletionDossierRecordRequest
): ProductionExecutionFinalArchiveCertificationRecord {
  const finalArchiveCertificationRecord =
    (request.finalArchiveCertificationRecordId
      ? state.productionExecutionFinalArchiveCertificationRecords.find(
          (item) => item.id === request.finalArchiveCertificationRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionFinalArchiveCertificationRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionFinalArchiveCertificationRecords[0]);

  if (!finalArchiveCertificationRecord) {
    throw new ProductionExecutionCompletionDossierRecordError(
      "production_execution_final_archive_certification_record_required",
      "A production execution final archive certification record is required."
    );
  }

  return finalArchiveCertificationRecord;
}
