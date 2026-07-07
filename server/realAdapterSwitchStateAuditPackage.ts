import type {
  ManualRealAdapterSwitchReview,
  RealAdapterSwitchStateAuditPackage,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateRealAdapterSwitchStateAuditPackageRequest } from "./types";

export class RealAdapterSwitchStateAuditPackageError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createRealAdapterSwitchStateAuditPackage(
  state: ApiState,
  request: CreateRealAdapterSwitchStateAuditPackageRequest,
  actor: string
): RealAdapterSwitchStateAuditPackage {
  const switchReview = findSwitchReview(state, request);
  const preChangeSnapshotReference =
    request.preChangeSnapshotReference?.trim() ?? `pre-switch-state-${switchReview.provider.toLowerCase()}.json`;
  const postChangeSnapshotReference =
    request.postChangeSnapshotReference?.trim() ?? `post-switch-state-${switchReview.provider.toLowerCase()}.json`;
  const reviewerEvidenceReference =
    request.reviewerEvidenceReference?.trim() ?? `switch-reviewer-evidence-${switchReview.provider.toLowerCase()}.md`;
  const rollbackTimerMinutes = request.rollbackTimerMinutes ?? 30;
  const retentionReference =
    request.retentionReference?.trim() ?? `audit-retention-${switchReview.provider.toLowerCase()}.md`;
  const checks = [
    {
      name: "Switch review ready",
      passed: switchReview.status === "Ready for manual switch change review",
      detail: `${switchReview.id} is ${switchReview.status}.`,
    },
    {
      name: "Pre-change snapshot linked",
      passed: Boolean(preChangeSnapshotReference),
      detail: preChangeSnapshotReference || "Pre-change snapshot reference is required.",
    },
    {
      name: "Post-change snapshot linked",
      passed: Boolean(postChangeSnapshotReference),
      detail: postChangeSnapshotReference || "Post-change snapshot reference is required.",
    },
    {
      name: "Reviewer evidence linked",
      passed: Boolean(reviewerEvidenceReference),
      detail: reviewerEvidenceReference || "Reviewer evidence reference is required.",
    },
    {
      name: "Rollback timer set",
      passed: rollbackTimerMinutes >= 15,
      detail: `${rollbackTimerMinutes} minute rollback timer.`,
    },
    {
      name: "Retention reference linked",
      passed: Boolean(retentionReference),
      detail: retentionReference || "Retention reference is required.",
    },
    {
      name: "Prototype leaves switch state unchanged",
      passed: switchReview.provisioningEnabled === false && switchReview.killSwitch.enabled === false,
      detail: `${switchReview.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `real-adapter-switch-state-audit-${switchReview.provider.toLowerCase()}-${Date.now()}`,
    provider: switchReview.provider,
    switchReviewId: switchReview.id,
    activationId: switchReview.activationId,
    idempotencyKey: switchReview.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for switch-state audit review" : "Blocked",
    requestedBy: actor,
    preChangeSnapshotReference,
    postChangeSnapshotReference,
    reviewerEvidenceReference,
    rollbackTimerMinutes,
    retentionReference,
    checks,
    evidence: [
      `Switch review: ${switchReview.id}.`,
      `Activation: ${switchReview.activationId}.`,
      `Pre-change snapshot: ${preChangeSnapshotReference || "missing"}.`,
      `Post-change snapshot: ${postChangeSnapshotReference || "missing"}.`,
      `Reviewer evidence: ${reviewerEvidenceReference || "missing"}.`,
      `Rollback timer: ${rollbackTimerMinutes} minutes.`,
      `Retention reference: ${retentionReference || "missing"}.`,
      `Kill switch: ${switchReview.killSwitch.name}=${switchReview.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: switchReview.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findSwitchReview(
  state: ApiState,
  request: CreateRealAdapterSwitchStateAuditPackageRequest
): ManualRealAdapterSwitchReview {
  const switchReview =
    (request.switchReviewId
      ? state.manualRealAdapterSwitchReviews.find((item) => item.id === request.switchReviewId)
      : undefined) ??
    (request.provider
      ? state.manualRealAdapterSwitchReviews.find((item) => item.provider === request.provider)
      : state.manualRealAdapterSwitchReviews[0]);

  if (!switchReview) {
    throw new RealAdapterSwitchStateAuditPackageError(
      "manual_real_adapter_switch_review_required",
      "A manual real-adapter switch review is required."
    );
  }

  return switchReview;
}
