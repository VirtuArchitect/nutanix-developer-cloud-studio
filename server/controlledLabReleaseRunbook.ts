import type { ControlledLabReleaseRunbookRecord, ProviderReleaseGateRecord } from "../src/data/cloudStudioDomain";
import { createProviderReleaseReadinessSummary } from "./providerReleaseGate";
import type { ApiState, CreateControlledLabReleaseRunbookRequest } from "./types";

export class ControlledLabReleaseRunbookError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const releaseProviders: ProviderReleaseGateRecord["provider"][] = ["NCI", "NKP", "NDB", "NUS", "NAI"];

export function createControlledLabReleaseRunbookRecord(
  state: ApiState,
  request: CreateControlledLabReleaseRunbookRequest,
  actor: string
): ControlledLabReleaseRunbookRecord {
  const provider = request.provider ?? createProviderReleaseReadinessSummary(state).nearestToReady ?? "NCI";
  if (!releaseProviders.includes(provider)) {
    throw new ControlledLabReleaseRunbookError(
      "controlled_lab_release_runbook_provider_invalid",
      `Unsupported controlled lab release provider: ${provider}`
    );
  }

  const readiness = createProviderReleaseReadinessSummary(state);
  const providerReadiness = readiness.providers.find((item) => item.provider === provider);
  const linkedGate = providerReadiness?.latestGateId
    ? state.providerReleaseGateRecords.find((item) => item.id === providerReadiness.latestGateId)
    : undefined;
  const signOffs: ControlledLabReleaseRunbookRecord["signOffs"] = [
    {
      role: "Platform owner",
      owner: request.platformOwner?.trim() || "Cloud Platform Owner",
      signed: Boolean(request.platformOwnerEvidence?.trim()),
      evidence: request.platformOwnerEvidence?.trim() || "Platform owner sign-off evidence required.",
    },
    {
      role: "Security reviewer",
      owner: request.securityReviewer?.trim() || "Security Reviewer",
      signed: Boolean(request.securityReviewerEvidence?.trim()),
      evidence: request.securityReviewerEvidence?.trim() || "Security review sign-off evidence required.",
    },
    {
      role: "Rollback owner",
      owner: request.rollbackOwner?.trim() || "Cloud Operations",
      signed: Boolean(request.rollbackOwnerEvidence?.trim()),
      evidence: request.rollbackOwnerEvidence?.trim() || "Rollback owner sign-off evidence required.",
    },
    {
      role: "Lab owner",
      owner: request.labOwner?.trim() || "Lab Owner",
      signed: Boolean(request.labOwnerEvidence?.trim()),
      evidence: request.labOwnerEvidence?.trim() || "Lab owner sign-off evidence required.",
    },
  ];
  const stopConditions = request.stopConditions?.filter(Boolean) ?? defaultStopConditions(provider);
  const escalationContacts = request.escalationContacts?.filter(Boolean) ?? [
    "cloud-platform-owner",
    "security-reviewer",
    "lab-owner",
  ];
  const runbookChecklist = [
    {
      name: "Provider release gate ready",
      passed: linkedGate?.status === "Ready for release review",
      detail: linkedGate ? `${linkedGate.id} is ${linkedGate.status}.` : `${provider} provider release gate is required.`,
    },
    {
      name: "Provider readiness gaps closed",
      passed: providerReadiness?.gapCount === 0 && Boolean(providerReadiness.latestGateId),
      detail:
        providerReadiness && providerReadiness.gapCount === 0
          ? `${provider} has no readiness gaps.`
          : `${providerReadiness?.gapCount ?? 1} readiness gap(s) remain.`,
    },
    {
      name: "All required sign-offs recorded",
      passed: signOffs.every((signOff) => signOff.signed),
      detail: `${signOffs.filter((signOff) => signOff.signed).length}/${signOffs.length} sign-offs recorded.`,
    },
    {
      name: "Stop conditions documented",
      passed: stopConditions.length >= 3,
      detail: `${stopConditions.length} stop condition(s) documented.`,
    },
    {
      name: "Escalation contacts documented",
      passed: escalationContacts.length >= 2,
      detail: `${escalationContacts.length} escalation contact(s) documented.`,
    },
    {
      name: "Real adapter execution disabled",
      passed: linkedGate?.provisioningEnabled === false && providerReadiness?.killSwitch.enabled === false,
      detail:
        linkedGate?.provisioningEnabled === false && providerReadiness?.killSwitch.enabled === false
          ? `${provider} remains evidence-only with real adapter disabled.`
          : `${provider} execution boundary must remain disabled.`,
    },
  ];

  return {
    id: `controlled-lab-runbook-${provider.toLowerCase()}-${Date.now()}`,
    provider,
    readinessGeneratedAt: readiness.generatedAt,
    status: runbookChecklist.every((check) => check.passed)
      ? "Ready for controlled lab release review"
      : "Blocked",
    requestedBy: actor,
    signOffs,
    checks: runbookChecklist,
    stopConditions,
    escalationContacts,
    linkedReleaseGateId: linkedGate?.id,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function defaultStopConditions(provider: ProviderReleaseGateRecord["provider"]) {
  return [
    `${provider} inventory, task, or provider health response differs from approved release evidence.`,
    "Any unauthorized mutation, credential prompt, or sensitive value appears in logs or manifests.",
    "Rollback owner, lab owner, or security reviewer is unavailable during the test window.",
    "Audit export, backup, rollback, or destroy evidence cannot be captured before handoff.",
  ];
}
