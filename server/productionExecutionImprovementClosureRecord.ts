import type {
  ProductionExecutionImprovementClosureRecord,
  ProductionExecutionPostImplementationReviewRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateProductionExecutionImprovementClosureRecordRequest } from "./types";

export class ProductionExecutionImprovementClosureRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionImprovementClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionImprovementClosureRecordRequest,
  actor: string
): ProductionExecutionImprovementClosureRecord {
  const postImplementationReviewRecord = findPostImplementationReviewRecord(state, request);
  const providerSlug = postImplementationReviewRecord.provider.toLowerCase();
  const improvementOwner = request.improvementOwner?.trim() ?? "Production Improvement Owner";
  const actionRegisterReference =
    request.actionRegisterReference?.trim() ?? `production-improvement-action-register-${providerSlug}.md`;
  const acceptedDeferralsReference =
    request.acceptedDeferralsReference?.trim() ?? `production-accepted-deferrals-${providerSlug}.md`;
  const lessonsLearnedPublicationReference =
    request.lessonsLearnedPublicationReference?.trim() ??
    `production-lessons-learned-publication-${providerSlug}.md`;
  const nextCycleOwner = request.nextCycleOwner?.trim() ?? "Production Next-Cycle Owner";

  const checks = [
    {
      name: "Post-implementation review ready",
      passed:
        postImplementationReviewRecord.status ===
        "Ready for production execution post-implementation review",
      detail: `${postImplementationReviewRecord.id} is ${postImplementationReviewRecord.status}.`,
    },
    {
      name: "Improvement owner assigned",
      passed: Boolean(improvementOwner),
      detail: improvementOwner || "Improvement owner is required.",
    },
    {
      name: "Action register linked",
      passed: Boolean(actionRegisterReference),
      detail: actionRegisterReference || "Action register reference is required.",
    },
    {
      name: "Accepted deferrals linked",
      passed: Boolean(acceptedDeferralsReference),
      detail: acceptedDeferralsReference || "Accepted deferrals reference is required.",
    },
    {
      name: "Lessons learned published",
      passed: Boolean(lessonsLearnedPublicationReference),
      detail:
        lessonsLearnedPublicationReference ||
        "Lessons-learned publication reference is required.",
    },
    {
      name: "Next-cycle owner assigned",
      passed: Boolean(nextCycleOwner),
      detail: nextCycleOwner || "Next-cycle owner is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        postImplementationReviewRecord.provisioningEnabled === false &&
        postImplementationReviewRecord.killSwitch.enabled === false,
      detail: `${postImplementationReviewRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-improvement-closure-record-${providerSlug}-${Date.now()}`,
    provider: postImplementationReviewRecord.provider,
    postImplementationReviewRecordId: postImplementationReviewRecord.id,
    operationalClosureRecordId: postImplementationReviewRecord.operationalClosureRecordId,
    finalTurnoverRecordId: postImplementationReviewRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: postImplementationReviewRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: postImplementationReviewRecord.supportReadinessRecordId,
    operationsHandoverRecordId: postImplementationReviewRecord.operationsHandoverRecordId,
    completionDossierRecordId: postImplementationReviewRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: postImplementationReviewRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: postImplementationReviewRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: postImplementationReviewRecord.archivalHandoffRecordId,
    closurePacketRecordId: postImplementationReviewRecord.closurePacketRecordId,
    closureAuthorizationRecordId: postImplementationReviewRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: postImplementationReviewRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: postImplementationReviewRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: postImplementationReviewRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: postImplementationReviewRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: postImplementationReviewRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: postImplementationReviewRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: postImplementationReviewRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: postImplementationReviewRecord.implementationHoldRecordId,
    cabDecisionRecordId: postImplementationReviewRecord.cabDecisionRecordId,
    cabHandoffPacketId: postImplementationReviewRecord.cabHandoffPacketId,
    freezeRecordId: postImplementationReviewRecord.freezeRecordId,
    authorizationPacketId: postImplementationReviewRecord.authorizationPacketId,
    promotionDossierId: postImplementationReviewRecord.promotionDossierId,
    closurePackageId: postImplementationReviewRecord.closurePackageId,
    outcomeRecordId: postImplementationReviewRecord.outcomeRecordId,
    handoffPackageId: postImplementationReviewRecord.handoffPackageId,
    controlledSwitchRequestId: postImplementationReviewRecord.controlledSwitchRequestId,
    auditPackageId: postImplementationReviewRecord.auditPackageId,
    switchReviewId: postImplementationReviewRecord.switchReviewId,
    activationId: postImplementationReviewRecord.activationId,
    idempotencyKey: postImplementationReviewRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution improvement closure review"
      : "Blocked",
    requestedBy: actor,
    improvementOwner,
    actionRegisterReference,
    acceptedDeferralsReference,
    lessonsLearnedPublicationReference,
    nextCycleOwner,
    checks,
    evidence: [
      `Post-implementation review record: ${postImplementationReviewRecord.id}.`,
      `Operational closure record: ${postImplementationReviewRecord.operationalClosureRecordId}.`,
      `Improvement owner: ${improvementOwner || "missing"}.`,
      `Action register: ${actionRegisterReference || "missing"}.`,
      `Accepted deferrals: ${acceptedDeferralsReference || "missing"}.`,
      `Lessons learned: ${lessonsLearnedPublicationReference || "missing"}.`,
      `Next-cycle owner: ${nextCycleOwner || "missing"}.`,
      `Kill switch: ${postImplementationReviewRecord.killSwitch.name}=${
        postImplementationReviewRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: postImplementationReviewRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findPostImplementationReviewRecord(
  state: ApiState,
  request: CreateProductionExecutionImprovementClosureRecordRequest
): ProductionExecutionPostImplementationReviewRecord {
  const postImplementationReviewRecord =
    (request.postImplementationReviewRecordId
      ? state.productionExecutionPostImplementationReviewRecords.find(
          (item) => item.id === request.postImplementationReviewRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionPostImplementationReviewRecords.find((item) => item.provider === request.provider)
      : state.productionExecutionPostImplementationReviewRecords[0]);

  if (!postImplementationReviewRecord) {
    throw new ProductionExecutionImprovementClosureRecordError(
      "production_execution_post_implementation_review_record_required",
      "A production execution post-implementation review record is required."
    );
  }

  return postImplementationReviewRecord;
}
