import type { ControlledLabDryRunWindowRecord, ProviderReleaseGateRecord } from "../src/data/cloudStudioDomain";
import { getActiveLabAuthorizationScope } from "./authorizationEvidence";
import { createAuditRetentionDiagnostics } from "./privateCloudOperations";
import { createProviderReleaseReadinessSummary } from "./providerReleaseGate";
import type { ApiState, CreateControlledLabDryRunWindowRequest } from "./types";

export class ControlledLabDryRunWindowError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const releaseProviders: ProviderReleaseGateRecord["provider"][] = ["NCI", "NKP", "NDB", "NUS", "NAI"];

export function createControlledLabDryRunWindowRecord(
  state: ApiState,
  request: CreateControlledLabDryRunWindowRequest,
  actor: string
): ControlledLabDryRunWindowRecord {
  const provider = request.provider ?? createProviderReleaseReadinessSummary(state).nearestToReady ?? "NCI";
  if (!releaseProviders.includes(provider)) {
    throw new ControlledLabDryRunWindowError(
      "controlled_lab_dry_run_window_provider_invalid",
      `Unsupported controlled lab dry-run provider: ${provider}`
    );
  }

  const runbook = findRunbook(state, request.runbookId, provider);
  const releaseExport = findReleaseEvidenceExport(state, request.releaseEvidenceExportId, provider);
  const activeScope = request.labScopeId
    ? state.labAuthorizationScopes.find((scope) => scope.id === request.labScopeId)
    : getActiveLabAuthorizationScope(state);
  const auditRetention = createAuditRetentionDiagnostics(state);
  const scheduledStart = request.scheduledStart ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const scheduledEnd = request.scheduledEnd ?? new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
  const rollbackOwner = request.rollbackOwner?.trim() || runbook?.signOffs.find((item) => item.role === "Rollback owner")?.owner || "";
  const emergencyStopContacts = request.emergencyStopContacts?.filter(Boolean) ?? runbook?.escalationContacts ?? [];
  const windowTimingValid = Date.parse(scheduledStart) < Date.parse(scheduledEnd);
  const checks = [
    {
      name: "Controlled runbook ready",
      passed: runbook?.status === "Ready for controlled lab release review",
      detail: runbook ? `${runbook.id} is ${runbook.status}.` : `${provider} controlled lab release runbook is required.`,
    },
    {
      name: "Release evidence export linked",
      passed: Boolean(releaseExport),
      detail: releaseExport ? `${releaseExport.id} is linked.` : `${provider} release evidence export is required.`,
    },
    {
      name: "Active lab scope linked",
      passed: Boolean(activeScope && activeScope.status === "Approved" && activeScope.providerCoverage.includes(provider)),
      detail: activeScope ? `${activeScope.id} is ${activeScope.status}.` : "Approved active lab scope is required.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner || "Rollback owner is required during the window.",
    },
    {
      name: "Audit export ready",
      passed: state.auditExports.length > 0 && auditRetention.exportDestination.valid,
      detail:
        state.auditExports.length > 0 && auditRetention.exportDestination.valid
          ? "Audit export manifest exists and destination reference is valid."
          : "Audit export evidence is required.",
    },
    {
      name: "Emergency stop contacts assigned",
      passed: emergencyStopContacts.length >= 2,
      detail: `${emergencyStopContacts.length} emergency stop contact(s) assigned.`,
    },
    {
      name: "Window timing valid",
      passed: windowTimingValid,
      detail: windowTimingValid ? `${scheduledStart} to ${scheduledEnd}.` : "Scheduled end must be after start.",
    },
    {
      name: "Real adapter execution disabled",
      passed: true,
      detail: `${provider} window scheduling remains evidence-only.`,
    },
  ];

  return {
    id: `controlled-lab-window-${provider.toLowerCase()}-${Date.now()}`,
    provider,
    status: checks.every((check) => check.passed) ? "Ready for scheduling review" : "Blocked",
    requestedBy: actor,
    scheduledStart,
    scheduledEnd,
    linkedRunbookId: runbook?.id,
    linkedReleaseEvidenceExportId: releaseExport?.id,
    linkedLabScopeId: activeScope?.id,
    rollbackOwner,
    emergencyStopContacts,
    checks,
    readinessChecklist: [
      "Confirm release runbook and release evidence export are approved for the same provider.",
      "Confirm lab scope, rollback owner, audit export, and emergency contacts are available for the full window.",
      "Stop the window immediately if any out-of-scope action, provider drift, or audit capture failure is observed.",
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findRunbook(state: ApiState, runbookId: string | undefined, provider: ProviderReleaseGateRecord["provider"]) {
  return runbookId
    ? state.controlledLabReleaseRunbooks.find((item) => item.id === runbookId)
    : state.controlledLabReleaseRunbooks.find((item) => item.provider === provider);
}

function findReleaseEvidenceExport(
  state: ApiState,
  exportId: string | undefined,
  provider: ProviderReleaseGateRecord["provider"]
) {
  return exportId
    ? state.releaseEvidenceExports.find((item) => item.id === exportId)
    : state.releaseEvidenceExports.find((item) => item.provider === provider);
}
