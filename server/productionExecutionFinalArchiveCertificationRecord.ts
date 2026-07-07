import type {
  ProductionExecutionFinalArchiveCertificationRecord,
  ProductionExecutionRetentionAttestationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionFinalArchiveCertificationRecordRequest } from "./types";

export class ProductionExecutionFinalArchiveCertificationRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionFinalArchiveCertificationRecord(
  state: ApiState,
  request: CreateProductionExecutionFinalArchiveCertificationRecordRequest,
  actor: string
): ProductionExecutionFinalArchiveCertificationRecord {
  const retentionAttestationRecord = findRetentionAttestationRecord(state, request);
  const providerSlug = retentionAttestationRecord.provider.toLowerCase();
  const certificationOwner = request.certificationOwner?.trim() ?? "Production Archive Certifier";
  const finalArchiveManifestReference =
    request.finalArchiveManifestReference?.trim() ?? `production-final-archive-manifest-${providerSlug}.md`;
  const retentionLockProofReference =
    request.retentionLockProofReference?.trim() ?? `production-retention-lock-proof-${providerSlug}.md`;
  const complianceSignOffReference =
    request.complianceSignOffReference?.trim() ?? `production-compliance-signoff-${providerSlug}.md`;
  const retrievalWitnessProofReference =
    request.retrievalWitnessProofReference?.trim() ??
    `production-retrieval-witness-proof-${providerSlug}.md`;

  const checks = [
    {
      name: "Retention attestation ready",
      passed:
        retentionAttestationRecord.status ===
        "Ready for production execution retention attestation review",
      detail: `${retentionAttestationRecord.id} is ${retentionAttestationRecord.status}.`,
    },
    {
      name: "Certification owner assigned",
      passed: Boolean(certificationOwner),
      detail: certificationOwner || "Certification owner is required.",
    },
    {
      name: "Final archive manifest linked",
      passed: Boolean(finalArchiveManifestReference),
      detail: finalArchiveManifestReference || "Final archive manifest reference is required.",
    },
    {
      name: "Retention lock proof linked",
      passed: Boolean(retentionLockProofReference),
      detail: retentionLockProofReference || "Retention lock proof reference is required.",
    },
    {
      name: "Compliance sign-off linked",
      passed: Boolean(complianceSignOffReference),
      detail: complianceSignOffReference || "Compliance sign-off reference is required.",
    },
    {
      name: "Retrieval witness proof linked",
      passed: Boolean(retrievalWitnessProofReference),
      detail: retrievalWitnessProofReference || "Retrieval witness proof reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        retentionAttestationRecord.provisioningEnabled === false &&
        retentionAttestationRecord.killSwitch.enabled === false,
      detail: `${retentionAttestationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-final-archive-certification-record-${providerSlug}-${Date.now()}`,
    provider: retentionAttestationRecord.provider,
    retentionAttestationRecordId: retentionAttestationRecord.id,
    archivalHandoffRecordId: retentionAttestationRecord.archivalHandoffRecordId,
    closurePacketRecordId: retentionAttestationRecord.closurePacketRecordId,
    closureAuthorizationRecordId: retentionAttestationRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: retentionAttestationRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: retentionAttestationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: retentionAttestationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: retentionAttestationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: retentionAttestationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: retentionAttestationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: retentionAttestationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: retentionAttestationRecord.implementationHoldRecordId,
    cabDecisionRecordId: retentionAttestationRecord.cabDecisionRecordId,
    cabHandoffPacketId: retentionAttestationRecord.cabHandoffPacketId,
    freezeRecordId: retentionAttestationRecord.freezeRecordId,
    authorizationPacketId: retentionAttestationRecord.authorizationPacketId,
    promotionDossierId: retentionAttestationRecord.promotionDossierId,
    closurePackageId: retentionAttestationRecord.closurePackageId,
    outcomeRecordId: retentionAttestationRecord.outcomeRecordId,
    handoffPackageId: retentionAttestationRecord.handoffPackageId,
    controlledSwitchRequestId: retentionAttestationRecord.controlledSwitchRequestId,
    auditPackageId: retentionAttestationRecord.auditPackageId,
    switchReviewId: retentionAttestationRecord.switchReviewId,
    activationId: retentionAttestationRecord.activationId,
    idempotencyKey: retentionAttestationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution final archive certification review"
      : "Blocked",
    requestedBy: actor,
    certificationOwner,
    finalArchiveManifestReference,
    retentionLockProofReference,
    complianceSignOffReference,
    retrievalWitnessProofReference,
    checks,
    evidence: [
      `Retention attestation record: ${retentionAttestationRecord.id}.`,
      `Archival handoff record: ${retentionAttestationRecord.archivalHandoffRecordId}.`,
      `Certification owner: ${certificationOwner || "missing"}.`,
      `Final archive manifest: ${finalArchiveManifestReference || "missing"}.`,
      `Retention lock proof: ${retentionLockProofReference || "missing"}.`,
      `Compliance sign-off: ${complianceSignOffReference || "missing"}.`,
      `Retrieval witness proof: ${retrievalWitnessProofReference || "missing"}.`,
      `Kill switch: ${retentionAttestationRecord.killSwitch.name}=${
        retentionAttestationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: retentionAttestationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findRetentionAttestationRecord(
  state: ApiState,
  request: CreateProductionExecutionFinalArchiveCertificationRecordRequest
): ProductionExecutionRetentionAttestationRecord {
  const retentionAttestationRecord =
    (request.retentionAttestationRecordId
      ? state.productionExecutionRetentionAttestationRecords.find(
          (item) => item.id === request.retentionAttestationRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionRetentionAttestationRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionRetentionAttestationRecords[0]);

  if (!retentionAttestationRecord) {
    throw new ProductionExecutionFinalArchiveCertificationRecordError(
      "production_execution_retention_attestation_record_required",
      "A production execution retention attestation record is required."
    );
  }

  return retentionAttestationRecord;
}
