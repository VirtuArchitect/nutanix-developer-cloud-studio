import type {
  ApprovalRequest,
  AdapterEnablementRecord,
  AhvControlledProvisioningRun,
  AhvCreateAdapterContractReview,
  AuditExportRecord,
  AuditRetentionDiagnostics,
  ControlledLabExecutionApprovalGate,
  ControlledLabDryRunExecutionChecklist,
  ControlledLabExecutionEvidenceLedger,
  ControlledLabExecutionReadinessAttestation,
  ControlledLabExecutionRehearsalPacket,
  ControlledLabDryRunWindowRecord,
  ControlledLabReleaseRunbookRecord,
  CredentialReferenceDiagnostic,
  ControlledProvisioningGate,
  ControlPlaneJob,
  ControlledCreateAuthorizationEnvelope,
  ExecutionBrokerDispatchApproval,
  ExecutionBrokerQueueRecord,
  Environment,
  Integration,
  IntegrationConfig,
  LabEvidenceReviewRecord,
  LabExecutionProposalEnvelope,
  LabExecutionProposalExportRecord,
  LabWindowEvidenceExportRecord,
  LabAdapterSnapshot,
  LabAuthorizationScope,
  LabScopeDiagnostics,
  LifecycleOperationKind,
  LifecycleOperationRecord,
  PlatformConfig,
  PlatformServiceAdapterContractReview,
  PlatformServiceKind,
  PlatformServicePreflightRun,
  PlatformServiceRequest,
  PlatformSession,
  PolicyBundle,
  PrismInventoryImportResult,
  PrismInventoryRecord,
  ProvisioningAdapterReadiness,
  ProductionReadinessReview,
  ProviderReleaseGateRecord,
  ProviderReleaseReadinessSummary,
  RealAdapterLabScopeActivation,
  ReleaseEvidenceExportRecord,
  ResourceProfile,
  RollbackDestroyProofRecord,
  SessionDiagnostics,
  TemplateRegistryEntry,
  SystemStatus,
  Target,
  VmSandboxDryRunPlan,
  VmSandboxDryRunRequest,
  VmLifecycleProof,
} from "../data/cloudStudioDomain";

export type ApiMode = "api" | "mock";

export type ApiHealth = {
  mode: ApiMode;
  label: string;
};

export type CreateEnvironmentPayload = {
  name: string;
  templateId: string;
  owner: string;
  region: string;
  targets: Target[];
};

export type CreateEnvironmentResult = {
  environment: Environment;
  jobs: Array<{
    id: string;
    environmentName: string;
    state: string;
    message: string;
    createdAt: string;
  }>;
  approval?: ApprovalRequest;
};

export type EnvironmentDetail = {
  environment: Environment;
  jobs: CreateEnvironmentResult["jobs"];
  controlPlaneJobs?: ControlPlaneJob[];
  approvals: ApprovalRequest[];
  auditEvents: Array<{
    id: string;
    action: string;
    actor: string;
    target: string;
    createdAt: string;
  }>;
};

export type PrismInventoryEnvelope = {
  records: PrismInventoryRecord[];
  lastImport?: PrismInventoryImportResult;
};

type ApiEnvelope<T> = {
  data: T;
};

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export function getApiBaseUrl() {
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  return "";
}

export async function checkApiHealth(): Promise<ApiHealth> {
  try {
    const health = await fetchJson<{ ok: boolean }>("/healthz");
    if (health.ok) {
      return {
        mode: "api",
        label: "On-prem API connected",
      };
    }
  } catch {
    // Fall through to mock mode. This is expected on GitHub Pages and plain Vite dev.
  }

  return {
    mode: "mock",
    label: "Browser mock mode",
  };
}

export async function fetchEnvironmentsFromApi() {
  return fetchJson<Environment[]>("/api/environments");
}

export async function fetchSessionFromApi() {
  return fetchJson<PlatformSession>("/api/session");
}

export async function fetchSessionDiagnosticsFromApi() {
  return fetchJson<SessionDiagnostics>("/api/session/diagnostics");
}

export async function fetchSystemStatusFromApi() {
  return fetchJson<SystemStatus>("/api/system/status");
}

export async function fetchIntegrationsFromApi() {
  return fetchJson<Integration[]>("/api/integrations");
}

export async function fetchIntegrationConfigsFromApi() {
  return fetchJson<IntegrationConfig[]>("/api/integration-config");
}

export async function fetchCredentialReferenceDiagnosticsFromApi() {
  return fetchJson<CredentialReferenceDiagnostic[]>("/api/provider-credentials/diagnostics");
}

export async function saveIntegrationConfigViaApi(
  integrationName: string,
  payload: Partial<Pick<IntegrationConfig, "endpoint" | "credentialProfile" | "status">>
) {
  return fetchJson<IntegrationConfig>(`/api/integration-config/${encodeURIComponent(integrationName)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function runIntegrationCheckViaApi(integrationName: string) {
  return fetchJson<IntegrationConfig>(`/api/integrations/${encodeURIComponent(integrationName)}/check`, {
    method: "POST",
  });
}

export async function fetchLabAdaptersFromApi() {
  return fetchJson<LabAdapterSnapshot[]>("/api/lab-adapters");
}

export async function fetchPrismInventoryFromApi() {
  return fetchJson<PrismInventoryEnvelope>("/api/prism/inventory");
}

export async function importPrismInventoryViaApi() {
  return fetchJson<PrismInventoryImportResult>("/api/prism/inventory/import", {
    method: "POST",
  });
}

export async function fetchResourceProfilesFromApi() {
  return fetchJson<ResourceProfile[]>("/api/resource-profiles");
}

export async function fetchPolicyBundlesFromApi() {
  return fetchJson<PolicyBundle[]>("/api/policy-bundles");
}

export async function fetchTemplateRegistryFromApi() {
  return fetchJson<TemplateRegistryEntry[]>("/api/registry/templates");
}

export async function runTemplateRegistryActionViaApi(
  templateId: string,
  action: "submit" | "approve" | "deprecate" | "restore"
) {
  return fetchJson<TemplateRegistryEntry>(
    `/api/registry/templates/${encodeURIComponent(templateId)}/${action}`,
    { method: "POST" }
  );
}

export async function runResourceProfileActionViaApi(
  profileId: string,
  action: "submit" | "approve" | "deprecate" | "restore"
) {
  return fetchJson<ResourceProfile>(`/api/resource-profiles/${encodeURIComponent(profileId)}/${action}`, {
    method: "POST",
  });
}

export async function fetchPlatformConfigFromApi() {
  return fetchJson<PlatformConfig>("/api/platform/config");
}

export async function fetchProvisioningAdaptersFromApi() {
  return fetchJson<ProvisioningAdapterReadiness[]>("/api/provisioning/adapters");
}

export async function fetchAdapterEnablementRecordsFromApi() {
  return fetchJson<AdapterEnablementRecord[]>("/api/adapter-enablement/records");
}

export async function fetchControlPlaneJobsFromApi() {
  return fetchJson<ControlPlaneJob[]>("/api/control-plane/jobs");
}

export async function fetchVmSandboxDryRunsFromApi() {
  return fetchJson<VmSandboxDryRunPlan[]>("/api/vm-sandbox/dry-runs");
}

export async function fetchControlledProvisioningGatesFromApi() {
  return fetchJson<ControlledProvisioningGate[]>("/api/vm-sandbox/controlled-provisioning");
}

export async function fetchLabAuthorizationScopesFromApi() {
  return fetchJson<LabAuthorizationScope[]>("/api/lab-authorization/scopes");
}

export async function fetchLabScopeDiagnosticsFromApi() {
  return fetchJson<LabScopeDiagnostics>("/api/lab-authorization/diagnostics");
}

export async function fetchVmLifecycleProofsFromApi() {
  return fetchJson<VmLifecycleProof[]>("/api/vm-lifecycle/proofs");
}

export async function fetchRollbackDestroyProofsFromApi() {
  return fetchJson<RollbackDestroyProofRecord[]>("/api/vm-sandbox/rollback-destroy-proofs");
}

export async function fetchControlledCreateAuthorizationEnvelopesFromApi() {
  return fetchJson<ControlledCreateAuthorizationEnvelope[]>("/api/vm-sandbox/controlled-create-authorization");
}

export async function fetchAhvCreateAdapterContractReviewsFromApi() {
  return fetchJson<AhvCreateAdapterContractReview[]>("/api/ahv/create-adapter-contracts");
}

export async function fetchAhvControlledProvisioningRunsFromApi() {
  return fetchJson<AhvControlledProvisioningRun[]>("/api/ahv/controlled-provisioning/runs");
}

export async function fetchPlatformServiceRequestsFromApi() {
  return fetchJson<PlatformServiceRequest[]>("/api/platform-services/requests");
}

export async function fetchPlatformServicePreflightRunsFromApi() {
  return fetchJson<PlatformServicePreflightRun[]>("/api/platform-services/preflight-runs");
}

export async function fetchPlatformServiceAdapterContractReviewsFromApi() {
  return fetchJson<PlatformServiceAdapterContractReview[]>("/api/platform-services/adapter-contracts");
}

export async function fetchProviderReleaseGateRecordsFromApi() {
  return fetchJson<ProviderReleaseGateRecord[]>("/api/provider-release-gates");
}

export async function fetchProviderReleaseReadinessSummaryFromApi() {
  return fetchJson<ProviderReleaseReadinessSummary>("/api/provider-release-readiness");
}

export async function fetchReleaseEvidenceExportsFromApi() {
  return fetchJson<ReleaseEvidenceExportRecord[]>("/api/release-evidence-exports");
}

export async function fetchControlledLabReleaseRunbooksFromApi() {
  return fetchJson<ControlledLabReleaseRunbookRecord[]>("/api/controlled-lab-release/runbooks");
}

export async function fetchControlledLabDryRunWindowsFromApi() {
  return fetchJson<ControlledLabDryRunWindowRecord[]>("/api/controlled-lab-release/windows");
}

export async function fetchLabWindowEvidenceExportsFromApi() {
  return fetchJson<LabWindowEvidenceExportRecord[]>("/api/controlled-lab-release/window-exports");
}

export async function fetchLabEvidenceReviewsFromApi() {
  return fetchJson<LabEvidenceReviewRecord[]>("/api/controlled-lab-release/evidence-reviews");
}

export async function fetchLabExecutionProposalEnvelopesFromApi() {
  return fetchJson<LabExecutionProposalEnvelope[]>("/api/controlled-lab-release/proposal-envelopes");
}

export async function fetchLabExecutionProposalExportsFromApi() {
  return fetchJson<LabExecutionProposalExportRecord[]>("/api/controlled-lab-release/proposal-exports");
}

export async function fetchControlledLabExecutionApprovalsFromApi() {
  return fetchJson<ControlledLabExecutionApprovalGate[]>("/api/controlled-lab-release/execution-approvals");
}

export async function fetchControlledLabExecutionRehearsalPacketsFromApi() {
  return fetchJson<ControlledLabExecutionRehearsalPacket[]>("/api/controlled-lab-release/rehearsal-packets");
}

export async function fetchControlledLabDryRunExecutionChecklistsFromApi() {
  return fetchJson<ControlledLabDryRunExecutionChecklist[]>("/api/controlled-lab-release/dry-run-checklists");
}

export async function fetchControlledLabExecutionEvidenceLedgersFromApi() {
  return fetchJson<ControlledLabExecutionEvidenceLedger[]>("/api/controlled-lab-release/evidence-ledgers");
}

export async function fetchControlledLabExecutionReadinessAttestationsFromApi() {
  return fetchJson<ControlledLabExecutionReadinessAttestation[]>("/api/controlled-lab-release/readiness-attestations");
}

export async function fetchExecutionBrokerQueueRecordsFromApi() {
  return fetchJson<ExecutionBrokerQueueRecord[]>("/api/execution-broker/queue");
}

export async function fetchExecutionBrokerDispatchApprovalsFromApi() {
  return fetchJson<ExecutionBrokerDispatchApproval[]>("/api/execution-broker/dispatch-approvals");
}

export async function fetchRealAdapterLabScopeActivationsFromApi() {
  return fetchJson<RealAdapterLabScopeActivation[]>("/api/real-adapter/lab-scope-activations");
}

export async function fetchProductionReadinessReviewsFromApi() {
  return fetchJson<ProductionReadinessReview[]>("/api/production-readiness/reviews");
}

export async function fetchLifecycleOperationsFromApi() {
  return fetchJson<LifecycleOperationRecord[]>("/api/private-cloud/lifecycle-operations");
}

export async function fetchAuditExportsFromApi() {
  return fetchJson<AuditExportRecord[]>("/api/audit-exports");
}

export async function fetchAuditRetentionDiagnosticsFromApi() {
  return fetchJson<AuditRetentionDiagnostics>("/api/audit/retention");
}

export async function createLabAuthorizationScopeViaApi(payload: {
  pentestScopeReference?: string;
  pentestScopeStructurallyValid?: boolean;
  targetEnvironment?: string;
  providerCoverage?: LabAuthorizationScope["providerCoverage"];
  targetEndpoints?: string[];
  evidenceReferences?: string[];
  rollbackOwner?: string;
}) {
  return fetchJson<LabAuthorizationScope>("/api/lab-authorization/scopes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createVmSandboxDryRunViaApi(payload: Partial<VmSandboxDryRunRequest>) {
  return fetchJson<VmSandboxDryRunPlan>("/api/vm-sandbox/dry-runs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledProvisioningGateViaApi(payload: {
  dryRunPlanId?: string;
  environmentName?: string;
  pentestScopeReference?: string;
  pentestScopeStructurallyValid?: boolean;
}) {
  return fetchJson<ControlledProvisioningGate>("/api/vm-sandbox/controlled-provisioning", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function decideControlledProvisioningGateViaApi(
  gateId: string,
  decision: "approve" | "reject",
  evidence?: string
) {
  return fetchJson<ControlledProvisioningGate>(
    `/api/vm-sandbox/controlled-provisioning/${encodeURIComponent(gateId)}/${decision}`,
    {
      method: "POST",
      body: JSON.stringify(evidence ? { decision, evidence } : { decision }),
    }
  );
}

export async function createPlatformServiceRequestViaApi(payload: {
  kind: PlatformServiceKind;
  serviceName?: string;
  environmentName?: string;
  owner?: string;
  profileId?: string;
}) {
  return fetchJson<PlatformServiceRequest>("/api/platform-services/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createPlatformServicePreflightRunViaApi(payload: {
  requestId?: string;
  kind?: PlatformServiceKind;
}) {
  return fetchJson<PlatformServicePreflightRun>("/api/platform-services/preflight-runs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createPlatformServiceAdapterContractReviewViaApi(payload: {
  requestId?: string;
  kind?: PlatformServiceKind;
}) {
  return fetchJson<PlatformServiceAdapterContractReview>("/api/platform-services/adapter-contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProviderReleaseGateRecordViaApi(payload: {
  provider?: ProviderReleaseGateRecord["provider"];
  releaseApprover?: string;
}) {
  return fetchJson<ProviderReleaseGateRecord>("/api/provider-release-gates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createReleaseEvidenceExportViaApi(payload: {
  gateId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ReleaseEvidenceExportRecord>("/api/release-evidence-exports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledLabReleaseRunbookViaApi(payload: {
  provider?: ProviderReleaseGateRecord["provider"];
  platformOwnerEvidence?: string;
  securityReviewerEvidence?: string;
  rollbackOwnerEvidence?: string;
  labOwnerEvidence?: string;
}) {
  return fetchJson<ControlledLabReleaseRunbookRecord>("/api/controlled-lab-release/runbooks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledLabDryRunWindowViaApi(payload: {
  provider?: ProviderReleaseGateRecord["provider"];
  runbookId?: string;
  releaseEvidenceExportId?: string;
  labScopeId?: string;
  rollbackOwner?: string;
}) {
  return fetchJson<ControlledLabDryRunWindowRecord>("/api/controlled-lab-release/windows", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createLabWindowEvidenceExportViaApi(payload: {
  windowId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<LabWindowEvidenceExportRecord>("/api/controlled-lab-release/window-exports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createLabEvidenceReviewViaApi(payload: {
  exportId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  platformOwnerDecision?: "Accepted" | "Rejected";
  securityReviewerDecision?: "Accepted" | "Rejected";
  operationsReviewerDecision?: "Accepted" | "Rejected";
}) {
  return fetchJson<LabEvidenceReviewRecord>("/api/controlled-lab-release/evidence-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createLabExecutionProposalEnvelopeViaApi(payload: {
  reviewId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<LabExecutionProposalEnvelope>("/api/controlled-lab-release/proposal-envelopes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createLabExecutionProposalExportViaApi(payload: {
  envelopeId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<LabExecutionProposalExportRecord>("/api/controlled-lab-release/proposal-exports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledLabExecutionApprovalViaApi(payload: {
  proposalExportId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  platformOwnerDecision?: "Accepted" | "Rejected";
  securityReviewerDecision?: "Accepted" | "Rejected";
  labOwnerDecision?: "Accepted" | "Rejected";
  rollbackOwnerDecision?: "Accepted" | "Rejected";
  executiveSponsorDecision?: "Accepted" | "Rejected";
}) {
  return fetchJson<ControlledLabExecutionApprovalGate>("/api/controlled-lab-release/execution-approvals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledLabExecutionRehearsalPacketViaApi(payload: {
  approvalGateId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ControlledLabExecutionRehearsalPacket>("/api/controlled-lab-release/rehearsal-packets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledLabDryRunExecutionChecklistViaApi(payload: {
  rehearsalPacketId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ControlledLabDryRunExecutionChecklist>("/api/controlled-lab-release/dry-run-checklists", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledLabExecutionEvidenceLedgerViaApi(payload: {
  dryRunChecklistId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ControlledLabExecutionEvidenceLedger>("/api/controlled-lab-release/evidence-ledgers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledLabExecutionReadinessAttestationViaApi(payload: {
  evidenceLedgerId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ControlledLabExecutionReadinessAttestation>("/api/controlled-lab-release/readiness-attestations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createExecutionBrokerQueueRecordViaApi(payload: {
  readinessAttestationId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  idempotencyKey?: string;
}) {
  return fetchJson<ExecutionBrokerQueueRecord>("/api/execution-broker/queue", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createExecutionBrokerDispatchApprovalViaApi(payload: {
  brokerRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ExecutionBrokerDispatchApproval>("/api/execution-broker/dispatch-approvals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createRealAdapterLabScopeActivationViaApi(payload: {
  dispatchApprovalId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<RealAdapterLabScopeActivation>("/api/real-adapter/lab-scope-activations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionReadinessReviewViaApi() {
  return fetchJson<ProductionReadinessReview>("/api/production-readiness/reviews", {
    method: "POST",
  });
}

export async function createLifecycleOperationViaApi(payload: {
  environmentName?: string;
  operation?: LifecycleOperationKind;
}) {
  return fetchJson<LifecycleOperationRecord>("/api/private-cloud/lifecycle-operations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createAuditExportViaApi() {
  return fetchJson<AuditExportRecord>("/api/audit-exports", {
    method: "POST",
  });
}

export async function createAdapterEnablementRecordViaApi(payload: {
  provider?: AdapterEnablementRecord["provider"];
  rollbackOwner?: string;
}) {
  return fetchJson<AdapterEnablementRecord>("/api/adapter-enablement/records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createVmLifecycleProofViaApi(payload: {
  gateId?: string;
  rollbackVerified?: boolean;
  destroyVerified?: boolean;
  evidence?: string[];
}) {
  return fetchJson<VmLifecycleProof>("/api/vm-lifecycle/proofs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createRollbackDestroyProofViaApi(payload: {
  dryRunPlanId?: string;
  backupEvidenceReference?: string;
  ownerNotificationReference?: string;
  inventoryReconciliationReference?: string;
  rollbackOwner?: string;
  teardownOrder?: string[];
  stopConditions?: string[];
  evidenceReferences?: string[];
}) {
  return fetchJson<RollbackDestroyProofRecord>("/api/vm-sandbox/rollback-destroy-proofs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledCreateAuthorizationEnvelopeViaApi() {
  return fetchJson<ControlledCreateAuthorizationEnvelope>("/api/vm-sandbox/controlled-create-authorization", {
    method: "POST",
  });
}

export async function createAhvCreateAdapterContractReviewViaApi() {
  return fetchJson<AhvCreateAdapterContractReview>("/api/ahv/create-adapter-contracts", {
    method: "POST",
  });
}

export async function createAhvControlledProvisioningRunViaApi(payload: {
  gateId?: string;
  action?: AhvControlledProvisioningRun["action"];
}) {
  return fetchJson<AhvControlledProvisioningRun>("/api/ahv/controlled-provisioning/runs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runControlPlaneJobActionViaApi(
  jobId: string,
  action: "advance" | "retry" | "fail",
  reason?: string
) {
  return fetchJson<ControlPlaneJob>(`/api/control-plane/jobs/${encodeURIComponent(jobId)}/${action}`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export async function runLabDiscoveryViaApi(adapterName: string) {
  return fetchJson<LabAdapterSnapshot>(`/api/lab-adapters/${encodeURIComponent(adapterName)}/discover`, {
    method: "POST",
  });
}

export async function fetchApprovalsFromApi() {
  return fetchJson<ApprovalRequest[]>("/api/approvals");
}

export async function fetchEnvironmentDetailFromApi(environmentName: string) {
  return fetchJson<EnvironmentDetail>(`/api/environments/${encodeURIComponent(environmentName)}`);
}

export async function requestEnvironmentDestroyViaApi(environmentName: string) {
  return fetchJson<Environment>(`/api/environments/${encodeURIComponent(environmentName)}/destroy`, {
    method: "POST",
  });
}

export async function decideApprovalViaApi(approvalId: string, decision: "approve" | "reject") {
  return fetchJson<ApprovalRequest>(`/api/approvals/${encodeURIComponent(approvalId)}/${decision}`, {
    method: "POST",
  });
}

export async function createEnvironmentViaApi(payload: CreateEnvironmentPayload) {
  return fetchJson<CreateEnvironmentResult>("/api/environments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}
