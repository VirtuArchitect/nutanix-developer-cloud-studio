import type {
  ProductionExecutionClosureAuthorizationRecord,
  ProductionExecutionClosurePacketRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionClosurePacketRecordRequest } from "./types";

export class ProductionExecutionClosurePacketRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionClosurePacketRecord(
  state: ApiState,
  request: CreateProductionExecutionClosurePacketRecordRequest,
  actor: string
): ProductionExecutionClosurePacketRecord {
  const closureAuthorizationRecord = findClosureAuthorizationRecord(state, request);
  const providerSlug = closureAuthorizationRecord.provider.toLowerCase();
  const closurePacketManifestReference =
    request.closurePacketManifestReference?.trim() ?? `production-closure-packet-manifest-${providerSlug}.md`;
  const evidenceBundleReference =
    request.evidenceBundleReference?.trim() ?? `production-evidence-bundle-${providerSlug}.zip`;
  const auditExportReference =
    request.auditExportReference?.trim() ?? `production-audit-export-${providerSlug}.jsonl`;
  const stakeholderNotificationProofReference =
    request.stakeholderNotificationProofReference?.trim() ??
    `production-stakeholder-notification-proof-${providerSlug}.md`;
  const retentionHandoffConfirmationReference =
    request.retentionHandoffConfirmationReference?.trim() ??
    `production-retention-handoff-confirmation-${providerSlug}.md`;

  const checks = [
    {
      name: "Closure authorization ready",
      passed:
        closureAuthorizationRecord.status ===
        "Ready for production execution closure authorization review",
      detail: `${closureAuthorizationRecord.id} is ${closureAuthorizationRecord.status}.`,
    },
    {
      name: "Closure packet manifest linked",
      passed: Boolean(closurePacketManifestReference),
      detail: closurePacketManifestReference || "Closure packet manifest reference is required.",
    },
    {
      name: "Evidence bundle linked",
      passed: Boolean(evidenceBundleReference),
      detail: evidenceBundleReference || "Evidence bundle reference is required.",
    },
    {
      name: "Audit export linked",
      passed: Boolean(auditExportReference),
      detail: auditExportReference || "Audit export reference is required.",
    },
    {
      name: "Stakeholder notification proof linked",
      passed: Boolean(stakeholderNotificationProofReference),
      detail: stakeholderNotificationProofReference || "Stakeholder notification proof reference is required.",
    },
    {
      name: "Retention handoff confirmation linked",
      passed: Boolean(retentionHandoffConfirmationReference),
      detail: retentionHandoffConfirmationReference || "Retention handoff confirmation reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        closureAuthorizationRecord.provisioningEnabled === false &&
        closureAuthorizationRecord.killSwitch.enabled === false,
      detail: `${closureAuthorizationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-closure-packet-record-${providerSlug}-${Date.now()}`,
    provider: closureAuthorizationRecord.provider,
    closureAuthorizationRecordId: closureAuthorizationRecord.id,
    outcomeAuthorizationRecordId: closureAuthorizationRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: closureAuthorizationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: closureAuthorizationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: closureAuthorizationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: closureAuthorizationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: closureAuthorizationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: closureAuthorizationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: closureAuthorizationRecord.implementationHoldRecordId,
    cabDecisionRecordId: closureAuthorizationRecord.cabDecisionRecordId,
    cabHandoffPacketId: closureAuthorizationRecord.cabHandoffPacketId,
    freezeRecordId: closureAuthorizationRecord.freezeRecordId,
    authorizationPacketId: closureAuthorizationRecord.authorizationPacketId,
    promotionDossierId: closureAuthorizationRecord.promotionDossierId,
    closurePackageId: closureAuthorizationRecord.closurePackageId,
    outcomeRecordId: closureAuthorizationRecord.outcomeRecordId,
    handoffPackageId: closureAuthorizationRecord.handoffPackageId,
    controlledSwitchRequestId: closureAuthorizationRecord.controlledSwitchRequestId,
    auditPackageId: closureAuthorizationRecord.auditPackageId,
    switchReviewId: closureAuthorizationRecord.switchReviewId,
    activationId: closureAuthorizationRecord.activationId,
    idempotencyKey: closureAuthorizationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution closure packet review"
      : "Blocked",
    requestedBy: actor,
    closurePacketManifestReference,
    evidenceBundleReference,
    auditExportReference,
    stakeholderNotificationProofReference,
    retentionHandoffConfirmationReference,
    checks,
    evidence: [
      `Closure authorization record: ${closureAuthorizationRecord.id}.`,
      `Outcome authorization record: ${closureAuthorizationRecord.outcomeAuthorizationRecordId}.`,
      `Closure packet manifest: ${closurePacketManifestReference || "missing"}.`,
      `Evidence bundle: ${evidenceBundleReference || "missing"}.`,
      `Audit export: ${auditExportReference || "missing"}.`,
      `Stakeholder notification proof: ${stakeholderNotificationProofReference || "missing"}.`,
      `Retention handoff confirmation: ${retentionHandoffConfirmationReference || "missing"}.`,
      `Kill switch: ${closureAuthorizationRecord.killSwitch.name}=${
        closureAuthorizationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: closureAuthorizationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findClosureAuthorizationRecord(
  state: ApiState,
  request: CreateProductionExecutionClosurePacketRecordRequest
): ProductionExecutionClosureAuthorizationRecord {
  const closureAuthorizationRecord =
    (request.closureAuthorizationRecordId
      ? state.productionExecutionClosureAuthorizationRecords.find(
          (item) => item.id === request.closureAuthorizationRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionClosureAuthorizationRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionClosureAuthorizationRecords[0]);

  if (!closureAuthorizationRecord) {
    throw new ProductionExecutionClosurePacketRecordError(
      "production_execution_closure_authorization_record_required",
      "A production execution closure authorization record is required."
    );
  }

  return closureAuthorizationRecord;
}
