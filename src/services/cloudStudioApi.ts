import type {
  ApprovalRequest,
  AdapterContractTestHarnessRecord,
  AuthBoundaryDiagnostics,
  AuthorizedLabConnectionDryRunRecord,
  AdapterPromotionReadinessDossier,
  AdapterEnablementRecord,
  AhvControlledProvisioningRun,
  AhvCreateAdapterContractReview,
  AdminUpgradeHealthConsole,
  ApiContractBaseline,
  AuditEvent,
  AuditExportRecord,
  AuditIntegrityManifest,
  AuditRetentionDiagnostics,
  ControlledLabExecutionApprovalGate,
  ControlledLabDryRunExecutionChecklist,
  ControlledLabExecutionEvidenceLedger,
  ControlledLabExecutionReadinessAttestation,
  ControlledLabExecutionRehearsalPacket,
  ControlledLabDryRunWindowRecord,
  ControlledLabReleaseRunbookRecord,
  ControlledSwitchConfigurationRequest,
  ContainerConfigValidationManifest,
  CredentialResolverAdapterStubRecord,
  CredentialReferenceDiagnostic,
  CredentialProviderContractRecord,
  ControlledProvisioningGate,
  ControlPlaneJob,
  ControlledCreateAuthorizationEnvelope,
  ExecutionBrokerDispatchApproval,
  ExecutionBrokerQueueRecord,
  Environment,
  DeploymentProfileValidation,
  DurablePersistenceStatus,
  DisabledPrismReadOnlyHttpClientRecord,
  DisabledRealReadOnlyAdapterInterfaceRecord,
  HardenedLabConnectionProfileReview,
  Integration,
  IntegrationConfig,
  LabEvidenceReviewRecord,
  LabConnectivityPreflightRecord,
  LabExecutionProposalEnvelope,
  LabExecutionProposalExportRecord,
  LabWindowEvidenceExportRecord,
  LabAdapterSnapshot,
  LabAuthorizationScope,
  LabPilotRunbookWorkflow,
  LabPilotOperatorConsole,
  LabScopeDiagnostics,
  LifecycleOperationKind,
  LifecycleOperationRecord,
  LabConnectionDryRunConsoleRecord,
  LabReadinessWorkspaceRecord,
  LiveReadOnlyCallEnvelopeRecord,
  LiveReadOnlyInventoryPilotRecord,
  LiveReadOnlyPrismCallDesign,
  ManualRealAdapterSwitchReview,
  MockPrismExecution,
  MockPrismEndpointExpansionRecord,
  MockPrismHarnessConsole,
  MockPrismSimulatorStatus,
  OfflineContractReplaySuiteRecord,
  EvidenceExportPackV2Record,
  OperationsRunbookConsole,
  OnPremInstallProfilePack,
  PilotEvidenceReviewRecord,
  PersistenceBoundaryStatus,
  JwtVerificationBoundary,
  PrismAdapterDiagnostics,
  PrismSimulatorFailureScenario,
  PrismSimulatorFailureScenarioId,
  PrismSimulatorProfile,
  PlatformConfig,
  PlatformSettingsConfig,
  PlatformSettingsConnectionTest,
  PlatformSettingsExport,
  PlatformSettingsSummary,
  PlatformServiceAdapterContractReview,
  PlatformServiceKind,
  PlatformServicePreflightRun,
  PlatformServiceRequest,
  PlatformSession,
  PolicyBundle,
  OperatorEvidenceExportPack,
  PrismInventoryImportResult,
  PrismInventoryRecord,
  PrismFixtureReplayRecord,
  PrismReadOnlyAdapterDiagnostics,
  ReadOnlyAdapterObservabilityRecord,
  ReadOnlyAdapterRuntimeMode,
  ReadOnlyAdapterRuntimeModeRecord,
  ProvisioningAdapterReadiness,
  ProductionAdapterAuthorizationPacket,
  ProductionChangeFreezeRecord,
  ProductionCabHandoffPacket,
  ProductionCabDecisionRecord,
  ProductionImplementationHoldRecord,
  ProductionOperatorAssignmentRecord,
  ProductionExecutionReadinessRecord,
  ProductionExecutionAuthorizationRecord,
  ProductionChangeTicketLockRecord,
  ProductionFinalExecutionPacketRecord,
  ProductionExecutionHoldPointRecord,
  ProductionExecutionOutcomeAuthorizationRecord,
  ProductionExecutionClosureAuthorizationRecord,
  ProductionExecutionClosurePacketRecord,
  ProductionExecutionArchivalHandoffRecord,
  ProductionExecutionRetentionAttestationRecord,
  ProductionExecutionFinalArchiveCertificationRecord,
  ProductionExecutionCompletionDossierRecord,
  ProductionExecutionOperationsHandoverRecord,
  ProductionExecutionSupportReadinessRecord,
  ProductionExecutionServiceAcceptanceRecord,
  ProductionExecutionFinalTurnoverRecord,
  ProductionExecutionOperationalClosureRecord,
  ProductionExecutionPostImplementationReviewRecord,
  ProductionExecutionImprovementClosureRecord,
  ProductionExecutionFinalAcceptanceArchiveRecord,
  ProductionExecutionReadinessArchiveHandoffRecord,
  ProductionExecutionArchiveRetrievalValidationRecord,
  ProductionExecutionArchiveRecoveryDrillRecord,
  ProductionExecutionArchiveRecoveryAcceptanceRecord,
  ProductionExecutionArchiveRecoveryClosureRecord,
  ProductionExecutionArchiveRecoveryAuditCertificationRecord,
  ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord,
  ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord,
  ProductionExecutionArchiveRecoveryOperationalContinuityRecord,
  ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord,
  ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord,
  ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord,
  ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord,
  ProductionReadinessReview,
  ProductionReadinessDecisionGate,
  ProductionReadinessScorecard,
  AuthorizedReadOnlyLabPilotGateRecord,
  ProviderReleaseGateRecord,
  ProviderReleaseReadinessSummary,
  RealAdapterLabScopeActivation,
  RealReadOnlyAdapterConfigBoundary,
  ReadOnlyPrismLabGate,
  ReadOnlyLabConnectionProfile,
  ReadOnlyPilotSessionRecord,
  ReadOnlyRuntimeEnablementPolicyRecord,
  ReadOnlyAdapterAuthorizationGate,
  RealPrismPreflightRun,
  RealAdapterSwitchStateAuditPackage,
  EmergencyStopRollbackDrillRecord,
  RealLabAuthorizationPacketRecord,
  ReleaseEvidenceExportRecord,
  ResourceProfile,
  RollbackDestroyProofRecord,
  RbacEnforcementMatrix,
  RuntimeObservabilitySnapshot,
  MigrationBaselineManifest,
  SessionDiagnostics,
  SignedAuditExportManifest,
  TemplateRegistryEntry,
  SystemStatus,
  SwitchClosureRetentionPackage,
  SwitchExecutionHandoffPackage,
  SwitchExecutionOutcomeRecord,
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
  mockPrismExecution?: MockPrismExecution;
  approval?: ApprovalRequest;
};

export type EnvironmentDetail = {
  environment: Environment;
  jobs: CreateEnvironmentResult["jobs"];
  controlPlaneJobs?: ControlPlaneJob[];
  mockPrismExecutions?: MockPrismExecution[];
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

export async function fetchPlatformSettingsFromApi() {
  return fetchJson<PlatformSettingsSummary>("/api/admin/settings");
}

export async function savePlatformSettingsViaApi(payload: Partial<PlatformSettingsConfig>) {
  return fetchJson<PlatformSettingsSummary>("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function testPlatformSettingsConnectionViaApi(target: PlatformSettingsConnectionTest["target"]) {
  return fetchJson<PlatformSettingsConnectionTest>("/api/admin/settings/test", {
    method: "POST",
    body: JSON.stringify({ target }),
  });
}

export async function exportPlatformSettingsViaApi() {
  return fetchJson<PlatformSettingsExport>("/api/admin/settings/export");
}

export async function fetchAuthBoundaryDiagnosticsFromApi() {
  return fetchJson<AuthBoundaryDiagnostics>("/api/auth/boundary-diagnostics");
}

export async function fetchSystemStatusFromApi() {
  return fetchJson<SystemStatus>("/api/system/status");
}

export async function fetchRuntimeObservabilityFromApi() {
  return fetchJson<RuntimeObservabilitySnapshot>("/api/observability/runtime");
}

export async function fetchApiContractBaselineFromApi() {
  return fetchJson<ApiContractBaseline>("/api/contracts/openapi");
}

export async function fetchRbacEnforcementMatrixFromApi() {
  return fetchJson<RbacEnforcementMatrix>("/api/security/rbac-matrix");
}

export async function fetchPersistenceBoundaryStatusFromApi() {
  return fetchJson<PersistenceBoundaryStatus>("/api/storage/persistence-boundary");
}

export async function fetchAuditIntegrityManifestFromApi() {
  return fetchJson<AuditIntegrityManifest>("/api/audit/integrity-manifest");
}

export async function fetchAuditEventsFromApi(limit = 50) {
  return fetchJson<AuditEvent[]>(`/api/audit/events?limit=${encodeURIComponent(String(limit))}`);
}

export async function fetchDeploymentProfileValidationFromApi() {
  return fetchJson<DeploymentProfileValidation>("/api/deployment/profiles");
}

export async function fetchOperationsRunbookConsoleFromApi() {
  return fetchJson<OperationsRunbookConsole>("/api/operations/runbook-console");
}

export async function fetchDurablePersistenceStatusFromApi() {
  return fetchJson<DurablePersistenceStatus>("/api/onprem/durable-persistence");
}

export async function fetchMigrationBaselineManifestFromApi() {
  return fetchJson<MigrationBaselineManifest>("/api/onprem/migration-baseline");
}

export async function fetchJwtVerificationBoundaryFromApi() {
  return fetchJson<JwtVerificationBoundary>("/api/auth/jwt-boundary");
}

export async function fetchSignedAuditExportManifestFromApi() {
  return fetchJson<SignedAuditExportManifest>("/api/audit/signed-export-manifest");
}

export async function fetchAdminUpgradeHealthConsoleFromApi() {
  return fetchJson<AdminUpgradeHealthConsole>("/api/admin/upgrade-health");
}

export async function fetchOnPremInstallProfilePackFromApi() {
  return fetchJson<OnPremInstallProfilePack>("/api/onprem/install-profile-pack");
}

export async function fetchProductionReadinessScorecardFromApi() {
  return fetchJson<ProductionReadinessScorecard>("/api/production/readiness-scorecard");
}

export async function fetchContainerConfigValidationManifestFromApi() {
  return fetchJson<ContainerConfigValidationManifest>("/api/deployment/config-validation");
}

export async function fetchLiveReadOnlyPrismCallDesignFromApi() {
  return fetchJson<LiveReadOnlyPrismCallDesign>("/api/prism/live-read-only-design");
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

export async function fetchPrismReadOnlyAdapterDiagnosticsFromApi() {
  return fetchJson<PrismReadOnlyAdapterDiagnostics>("/api/prism/read-only-adapter/diagnostics");
}

export async function fetchReadOnlyPrismLabGatesFromApi() {
  return fetchJson<ReadOnlyPrismLabGate[]>("/api/prism/read-only-lab-gates");
}

export async function createReadOnlyPrismLabGateViaApi() {
  return fetchJson<ReadOnlyPrismLabGate>("/api/prism/read-only-lab-gates", {
    method: "POST",
  });
}

export async function fetchReadOnlyLabConnectionProfilesFromApi() {
  return fetchJson<ReadOnlyLabConnectionProfile[]>("/api/prism/read-only-lab-profiles");
}

export async function createReadOnlyLabConnectionProfileViaApi(payload: Partial<ReadOnlyLabConnectionProfile> = {}) {
  return fetchJson<ReadOnlyLabConnectionProfile>("/api/prism/read-only-lab-profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchPrismFixtureReplaysFromApi() {
  return fetchJson<PrismFixtureReplayRecord[]>("/api/prism/fixture-replays");
}

export async function createPrismFixtureReplayViaApi(payload: Partial<PrismFixtureReplayRecord> = {}) {
  return fetchJson<PrismFixtureReplayRecord>("/api/prism/fixture-replays", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchReadOnlyAdapterAuthorizationGatesFromApi() {
  return fetchJson<ReadOnlyAdapterAuthorizationGate[]>("/api/prism/read-only-authorization-gates");
}

export async function createReadOnlyAdapterAuthorizationGateViaApi(payload: {
  profileId?: string;
  fixtureReplayId?: string;
  labGateId?: string;
} = {}) {
  return fetchJson<ReadOnlyAdapterAuthorizationGate>("/api/prism/read-only-authorization-gates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchOperatorEvidenceExportPacksFromApi() {
  return fetchJson<OperatorEvidenceExportPack[]>("/api/operator/evidence-exports");
}

export async function createOperatorEvidenceExportPackViaApi() {
  return fetchJson<OperatorEvidenceExportPack>("/api/operator/evidence-exports", {
    method: "POST",
  });
}

export async function fetchLabPilotRunbookWorkflowsFromApi() {
  return fetchJson<LabPilotRunbookWorkflow[]>("/api/lab-pilot/runbook-workflows");
}

export async function createLabPilotRunbookWorkflowViaApi(payload: {
  profileId?: string;
  authorizationGateId?: string;
  evidenceExportId?: string;
} = {}) {
  return fetchJson<LabPilotRunbookWorkflow>("/api/lab-pilot/runbook-workflows", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runLabPilotRunbookWorkflowActionViaApi(
  workflowId: string,
  action: "approve" | "execute-dry-run" | "review-evidence" | "close"
) {
  return fetchJson<LabPilotRunbookWorkflow>(
    `/api/lab-pilot/runbook-workflows/${encodeURIComponent(workflowId)}/${action}`,
    { method: "POST" }
  );
}

export async function fetchReadOnlyAdapterRuntimeModesFromApi() {
  return fetchJson<ReadOnlyAdapterRuntimeModeRecord[]>("/api/prism/read-only-runtime-modes");
}

export async function setReadOnlyAdapterRuntimeModeViaApi(payload: {
  mode?: ReadOnlyAdapterRuntimeMode;
  authorizationGateId?: string;
  runbookWorkflowId?: string;
  evidenceExportId?: string;
} = {}) {
  return fetchJson<ReadOnlyAdapterRuntimeModeRecord>("/api/prism/read-only-runtime-modes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLiveReadOnlyInventoryPilotsFromApi() {
  return fetchJson<LiveReadOnlyInventoryPilotRecord[]>("/api/prism/live-read-only-inventory-pilots");
}

export async function createLiveReadOnlyInventoryPilotViaApi(payload: {
  runtimeModeRecordId?: string;
  authorizationGateId?: string;
  runbookWorkflowId?: string;
} = {}) {
  return fetchJson<LiveReadOnlyInventoryPilotRecord>("/api/prism/live-read-only-inventory-pilots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchReadOnlyAdapterObservabilityFromApi() {
  return fetchJson<ReadOnlyAdapterObservabilityRecord[]>("/api/prism/read-only-observability");
}

export async function createReadOnlyAdapterObservabilityViaApi(payload: {
  runtimeModeRecordId?: string;
  inventoryPilotId?: string;
} = {}) {
  return fetchJson<ReadOnlyAdapterObservabilityRecord>("/api/prism/read-only-observability", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLabPilotOperatorConsoleFromApi() {
  return fetchJson<LabPilotOperatorConsole>("/api/lab-pilot/operator-console");
}

export async function fetchProductionReadinessDecisionGatesFromApi() {
  return fetchJson<ProductionReadinessDecisionGate[]>("/api/production/readiness-decision-gates");
}

export async function createProductionReadinessDecisionGateViaApi(payload: Partial<ProductionReadinessDecisionGate> = {}) {
  return fetchJson<ProductionReadinessDecisionGate>("/api/production/readiness-decision-gates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRealReadOnlyAdapterConfigBoundariesFromApi() {
  return fetchJson<RealReadOnlyAdapterConfigBoundary[]>("/api/prism/real-read-only/config-boundaries");
}

export async function createRealReadOnlyAdapterConfigBoundaryViaApi(payload: Partial<RealReadOnlyAdapterConfigBoundary> = {}) {
  return fetchJson<RealReadOnlyAdapterConfigBoundary>("/api/prism/real-read-only/config-boundaries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCredentialProviderContractsFromApi() {
  return fetchJson<CredentialProviderContractRecord[]>("/api/credentials/provider-contracts");
}

export async function createCredentialProviderContractViaApi(payload: Partial<CredentialProviderContractRecord> = {}) {
  return fetchJson<CredentialProviderContractRecord>("/api/credentials/provider-contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchDisabledRealReadOnlyAdapterInterfacesFromApi() {
  return fetchJson<DisabledRealReadOnlyAdapterInterfaceRecord[]>("/api/prism/real-read-only/adapter-interfaces");
}

export async function createDisabledRealReadOnlyAdapterInterfaceViaApi(payload: {
  configBoundaryId?: string;
  credentialContractId?: string;
} = {}) {
  return fetchJson<DisabledRealReadOnlyAdapterInterfaceRecord>("/api/prism/real-read-only/adapter-interfaces", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchOfflineContractReplaySuitesFromApi() {
  return fetchJson<OfflineContractReplaySuiteRecord[]>("/api/prism/offline-contract-replays");
}

export async function createOfflineContractReplaySuiteViaApi(payload: {
  adapterInterfaceId?: string;
  fixtureReplayId?: string;
} = {}) {
  return fetchJson<OfflineContractReplaySuiteRecord>("/api/prism/offline-contract-replays", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAuthorizedLabConnectionDryRunsFromApi() {
  return fetchJson<AuthorizedLabConnectionDryRunRecord[]>("/api/prism/authorized-lab-dry-runs");
}

export async function createAuthorizedLabConnectionDryRunViaApi(payload: {
  configBoundaryId?: string;
  credentialContractId?: string;
  adapterInterfaceId?: string;
  offlineReplaySuiteId?: string;
  productionDecisionGateId?: string;
} = {}) {
  return fetchJson<AuthorizedLabConnectionDryRunRecord>("/api/prism/authorized-lab-dry-runs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchHardenedLabConnectionProfileReviewsFromApi() {
  return fetchJson<HardenedLabConnectionProfileReview[]>("/api/prism/read-only-lab-profile-hardening");
}

export async function createHardenedLabConnectionProfileReviewViaApi(payload: {
  profileId?: string;
  caCertificateRef?: string;
} = {}) {
  return fetchJson<HardenedLabConnectionProfileReview>("/api/prism/read-only-lab-profile-hardening", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCredentialResolverAdapterStubsFromApi() {
  return fetchJson<CredentialResolverAdapterStubRecord[]>("/api/credentials/resolver-stubs");
}

export async function createCredentialResolverAdapterStubViaApi(payload: {
  credentialContractId?: string;
  provider?: CredentialResolverAdapterStubRecord["provider"];
} = {}) {
  return fetchJson<CredentialResolverAdapterStubRecord>("/api/credentials/resolver-stubs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchDisabledPrismReadOnlyHttpClientsFromApi() {
  return fetchJson<DisabledPrismReadOnlyHttpClientRecord[]>("/api/prism/read-only-http-clients");
}

export async function createDisabledPrismReadOnlyHttpClientViaApi(payload: {
  adapterInterfaceId?: string;
  configBoundaryId?: string;
  credentialResolverStubId?: string;
} = {}) {
  return fetchJson<DisabledPrismReadOnlyHttpClientRecord>("/api/prism/read-only-http-clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLabConnectivityPreflightsFromApi() {
  return fetchJson<LabConnectivityPreflightRecord[]>("/api/prism/lab-connectivity-preflights");
}

export async function createLabConnectivityPreflightViaApi(payload: {
  hardenedProfileReviewId?: string;
  configBoundaryId?: string;
  credentialResolverStubId?: string;
  httpClientRecordId?: string;
} = {}) {
  return fetchJson<LabConnectivityPreflightRecord>("/api/prism/lab-connectivity-preflights", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAuthorizedReadOnlyLabPilotGatesFromApi() {
  return fetchJson<AuthorizedReadOnlyLabPilotGateRecord[]>("/api/prism/authorized-read-only-pilot-gates");
}

export async function createAuthorizedReadOnlyLabPilotGateViaApi(payload: {
  preflightId?: string;
  dryRunId?: string;
  productionDecisionGateId?: string;
  requiredApprovers?: string[];
  operatorAcknowledgements?: string[];
} = {}) {
  return fetchJson<AuthorizedReadOnlyLabPilotGateRecord>("/api/prism/authorized-read-only-pilot-gates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchReadOnlyRuntimeEnablementPoliciesFromApi() {
  return fetchJson<ReadOnlyRuntimeEnablementPolicyRecord[]>("/api/prism/read-only-runtime-policies");
}

export async function createReadOnlyRuntimeEnablementPolicyViaApi(payload: {
  pilotGateId?: string;
  requiredApprovals?: string[];
  allowedEnvironments?: string[];
  expiresAt?: string;
  emergencyStopOwner?: string;
  emergencyStopContact?: string;
  emergencyStopProcedureRef?: string;
  emergencyStopTested?: boolean;
} = {}) {
  return fetchJson<ReadOnlyRuntimeEnablementPolicyRecord>("/api/prism/read-only-runtime-policies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchReadOnlyPilotSessionsFromApi() {
  return fetchJson<ReadOnlyPilotSessionRecord[]>("/api/prism/read-only-pilot-sessions");
}

export async function createReadOnlyPilotSessionViaApi(payload: {
  policyId?: string;
  approvedGateId?: string;
  operator?: string;
  startedAt?: string;
  endsAt?: string;
  runtimeMode?: ReadOnlyPilotSessionRecord["runtimeMode"];
  evidenceLinks?: string[];
} = {}) {
  return fetchJson<ReadOnlyPilotSessionRecord>("/api/prism/read-only-pilot-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLiveReadOnlyCallEnvelopesFromApi() {
  return fetchJson<LiveReadOnlyCallEnvelopeRecord[]>("/api/prism/live-read-only-call-envelopes");
}

export async function createLiveReadOnlyCallEnvelopeViaApi(payload: {
  pilotSessionId?: string;
  httpClientRecordId?: string;
} = {}) {
  return fetchJson<LiveReadOnlyCallEnvelopeRecord>("/api/prism/live-read-only-call-envelopes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchPilotEvidenceReviewsFromApi() {
  return fetchJson<PilotEvidenceReviewRecord[]>("/api/prism/pilot-evidence-reviews");
}

export async function createPilotEvidenceReviewViaApi(payload: {
  callEnvelopeId?: string;
  pilotSessionId?: string;
  reviewer?: string;
  decision?: PilotEvidenceReviewRecord["decision"];
  findings?: string[];
} = {}) {
  return fetchJson<PilotEvidenceReviewRecord>("/api/prism/pilot-evidence-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEmergencyStopRollbackDrillsFromApi() {
  return fetchJson<EmergencyStopRollbackDrillRecord[]>("/api/prism/emergency-stop-rollback-drills");
}

export async function createEmergencyStopRollbackDrillViaApi(payload: {
  pilotEvidenceReviewId?: string;
  policyId?: string;
  simulatedModeRestored?: boolean;
  evidencePreserved?: boolean;
  emergencyStopOwner?: string;
} = {}) {
  return fetchJson<EmergencyStopRollbackDrillRecord>("/api/prism/emergency-stop-rollback-drills", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLabReadinessWorkspacesFromApi() {
  return fetchJson<LabReadinessWorkspaceRecord[]>("/api/lab-transition/readiness-workspaces");
}

export async function createLabReadinessWorkspaceViaApi(payload: {
  emergencyStopRollbackDrillId?: string;
  evidenceReviewId?: string;
  pilotSessionId?: string;
  runtimePolicyId?: string;
} = {}) {
  return fetchJson<LabReadinessWorkspaceRecord>("/api/lab-transition/readiness-workspaces", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMockPrismEndpointExpansionsFromApi() {
  return fetchJson<MockPrismEndpointExpansionRecord[]>("/api/lab-transition/mock-prism-endpoint-expansions");
}

export async function createMockPrismEndpointExpansionViaApi(payload: {
  workspaceId?: string;
  latencySimulationMs?: number;
  requestsPerMinute?: number;
  failureModes?: string[];
} = {}) {
  return fetchJson<MockPrismEndpointExpansionRecord>("/api/lab-transition/mock-prism-endpoint-expansions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdapterContractTestHarnessesFromApi() {
  return fetchJson<AdapterContractTestHarnessRecord[]>("/api/lab-transition/adapter-contract-harnesses");
}

export async function createAdapterContractTestHarnessViaApi(payload: {
  mockExpansionId?: string;
} = {}) {
  return fetchJson<AdapterContractTestHarnessRecord>("/api/lab-transition/adapter-contract-harnesses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchLabConnectionDryRunConsolesFromApi() {
  return fetchJson<LabConnectionDryRunConsoleRecord[]>("/api/lab-transition/dry-run-consoles");
}

export async function createLabConnectionDryRunConsoleViaApi(payload: {
  contractHarnessId?: string;
  selectedEndpointRef?: string;
  credentialProviderRef?: string;
} = {}) {
  return fetchJson<LabConnectionDryRunConsoleRecord>("/api/lab-transition/dry-run-consoles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEvidenceExportPacksV2FromApi() {
  return fetchJson<EvidenceExportPackV2Record[]>("/api/lab-transition/evidence-export-packs-v2");
}

export async function createEvidenceExportPackV2ViaApi(payload: {
  dryRunConsoleId?: string;
} = {}) {
  return fetchJson<EvidenceExportPackV2Record>("/api/lab-transition/evidence-export-packs-v2", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRealLabAuthorizationPacketsFromApi() {
  return fetchJson<RealLabAuthorizationPacketRecord[]>("/api/lab-transition/real-lab-authorization-packets");
}

export async function createRealLabAuthorizationPacketViaApi(payload: {
  evidenceExportPackId?: string;
  approvalOwners?: string[];
  rollbackOwner?: string;
  pentestScopeEvidence?: string[];
} = {}) {
  return fetchJson<RealLabAuthorizationPacketRecord>("/api/lab-transition/real-lab-authorization-packets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMockPrismStatusFromApi() {
  return fetchJson<MockPrismSimulatorStatus>("/api/mock-prism/status");
}

export async function fetchMockPrismExecutionsFromApi() {
  return fetchJson<MockPrismExecution[]>("/api/mock-prism/executions");
}

export async function fetchMockPrismHarnessConsoleFromApi() {
  return fetchJson<MockPrismHarnessConsole>("/api/mock-prism/harness-console");
}

export async function fetchPrismAdapterDiagnosticsFromApi() {
  return fetchJson<PrismAdapterDiagnostics>("/api/prism/adapter-diagnostics");
}

export async function fetchPrismSimulatorProfilesFromApi() {
  return fetchJson<PrismSimulatorProfile[]>("/api/prism/simulator-profiles");
}

export async function selectPrismSimulatorProfileViaApi(profileId: string) {
  return fetchJson<PrismSimulatorProfile>(`/api/prism/simulator-profiles/${encodeURIComponent(profileId)}/select`, {
    method: "POST",
  });
}

export async function fetchPrismFailureScenariosFromApi() {
  return fetchJson<PrismSimulatorFailureScenario[]>("/api/prism/failure-scenarios");
}

export async function activatePrismFailureScenarioViaApi(scenarioId: PrismSimulatorFailureScenarioId) {
  return fetchJson<PrismSimulatorFailureScenario>(
    `/api/prism/failure-scenarios/${encodeURIComponent(scenarioId)}/activate`,
    { method: "POST" }
  );
}

export async function fetchRealPrismPreflightRunsFromApi() {
  return fetchJson<RealPrismPreflightRun[]>("/api/prism/real-preflight-runs");
}

export async function createRealPrismPreflightRunViaApi() {
  return fetchJson<RealPrismPreflightRun>("/api/prism/real-preflight-runs", {
    method: "POST",
  });
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

export async function fetchManualRealAdapterSwitchReviewsFromApi() {
  return fetchJson<ManualRealAdapterSwitchReview[]>("/api/real-adapter/switch-reviews");
}

export async function fetchRealAdapterSwitchStateAuditPackagesFromApi() {
  return fetchJson<RealAdapterSwitchStateAuditPackage[]>("/api/real-adapter/switch-state-audit-packages");
}

export async function fetchControlledSwitchConfigurationRequestsFromApi() {
  return fetchJson<ControlledSwitchConfigurationRequest[]>("/api/real-adapter/controlled-switch-requests");
}

export async function fetchSwitchExecutionHandoffPackagesFromApi() {
  return fetchJson<SwitchExecutionHandoffPackage[]>("/api/real-adapter/switch-handoff-packages");
}

export async function fetchSwitchExecutionOutcomeRecordsFromApi() {
  return fetchJson<SwitchExecutionOutcomeRecord[]>("/api/real-adapter/switch-outcome-records");
}

export async function fetchSwitchClosureRetentionPackagesFromApi() {
  return fetchJson<SwitchClosureRetentionPackage[]>("/api/real-adapter/switch-closure-packages");
}

export async function fetchAdapterPromotionReadinessDossiersFromApi() {
  return fetchJson<AdapterPromotionReadinessDossier[]>("/api/real-adapter/adapter-promotion-dossiers");
}

export async function fetchProductionAdapterAuthorizationPacketsFromApi() {
  return fetchJson<ProductionAdapterAuthorizationPacket[]>("/api/real-adapter/production-authorization-packets");
}

export async function fetchProductionChangeFreezeRecordsFromApi() {
  return fetchJson<ProductionChangeFreezeRecord[]>("/api/real-adapter/production-change-freeze-records");
}

export async function fetchProductionCabHandoffPacketsFromApi() {
  return fetchJson<ProductionCabHandoffPacket[]>("/api/real-adapter/production-cab-handoff-packets");
}

export async function fetchProductionCabDecisionRecordsFromApi() {
  return fetchJson<ProductionCabDecisionRecord[]>("/api/real-adapter/production-cab-decision-records");
}

export async function fetchProductionImplementationHoldRecordsFromApi() {
  return fetchJson<ProductionImplementationHoldRecord[]>("/api/real-adapter/production-implementation-hold-records");
}

export async function fetchProductionOperatorAssignmentRecordsFromApi() {
  return fetchJson<ProductionOperatorAssignmentRecord[]>("/api/real-adapter/production-operator-assignment-records");
}

export async function fetchProductionExecutionReadinessRecordsFromApi() {
  return fetchJson<ProductionExecutionReadinessRecord[]>("/api/real-adapter/production-execution-readiness-records");
}

export async function fetchProductionExecutionAuthorizationRecordsFromApi() {
  return fetchJson<ProductionExecutionAuthorizationRecord[]>("/api/real-adapter/production-execution-authorization-records");
}

export async function fetchProductionChangeTicketLockRecordsFromApi() {
  return fetchJson<ProductionChangeTicketLockRecord[]>("/api/real-adapter/production-change-ticket-lock-records");
}

export async function fetchProductionFinalExecutionPacketRecordsFromApi() {
  return fetchJson<ProductionFinalExecutionPacketRecord[]>("/api/real-adapter/production-final-execution-packet-records");
}

export async function fetchProductionExecutionHoldPointRecordsFromApi() {
  return fetchJson<ProductionExecutionHoldPointRecord[]>("/api/real-adapter/production-execution-hold-point-records");
}

export async function fetchProductionExecutionOutcomeAuthorizationRecordsFromApi() {
  return fetchJson<ProductionExecutionOutcomeAuthorizationRecord[]>(
    "/api/real-adapter/production-execution-outcome-authorization-records"
  );
}

export async function fetchProductionExecutionClosureAuthorizationRecordsFromApi() {
  return fetchJson<ProductionExecutionClosureAuthorizationRecord[]>(
    "/api/real-adapter/production-execution-closure-authorization-records"
  );
}

export async function fetchProductionExecutionClosurePacketRecordsFromApi() {
  return fetchJson<ProductionExecutionClosurePacketRecord[]>(
    "/api/real-adapter/production-execution-closure-packet-records"
  );
}

export async function fetchProductionExecutionArchivalHandoffRecordsFromApi() {
  return fetchJson<ProductionExecutionArchivalHandoffRecord[]>(
    "/api/real-adapter/production-execution-archival-handoff-records"
  );
}

export async function fetchProductionExecutionRetentionAttestationRecordsFromApi() {
  return fetchJson<ProductionExecutionRetentionAttestationRecord[]>(
    "/api/real-adapter/production-execution-retention-attestation-records"
  );
}

export async function fetchProductionExecutionFinalArchiveCertificationRecordsFromApi() {
  return fetchJson<ProductionExecutionFinalArchiveCertificationRecord[]>(
    "/api/real-adapter/production-execution-final-archive-certification-records"
  );
}

export async function fetchProductionExecutionCompletionDossierRecordsFromApi() {
  return fetchJson<ProductionExecutionCompletionDossierRecord[]>(
    "/api/real-adapter/production-execution-completion-dossier-records"
  );
}

export async function fetchProductionExecutionOperationsHandoverRecordsFromApi() {
  return fetchJson<ProductionExecutionOperationsHandoverRecord[]>(
    "/api/real-adapter/production-execution-operations-handover-records"
  );
}

export async function fetchProductionExecutionSupportReadinessRecordsFromApi() {
  return fetchJson<ProductionExecutionSupportReadinessRecord[]>(
    "/api/real-adapter/production-execution-support-readiness-records"
  );
}

export async function fetchProductionExecutionServiceAcceptanceRecordsFromApi() {
  return fetchJson<ProductionExecutionServiceAcceptanceRecord[]>(
    "/api/real-adapter/production-execution-service-acceptance-records"
  );
}

export async function fetchProductionExecutionFinalTurnoverRecordsFromApi() {
  return fetchJson<ProductionExecutionFinalTurnoverRecord[]>(
    "/api/real-adapter/production-execution-final-turnover-records"
  );
}

export async function fetchProductionExecutionOperationalClosureRecordsFromApi() {
  return fetchJson<ProductionExecutionOperationalClosureRecord[]>(
    "/api/real-adapter/production-execution-operational-closure-records"
  );
}

export async function fetchProductionExecutionPostImplementationReviewRecordsFromApi() {
  return fetchJson<ProductionExecutionPostImplementationReviewRecord[]>(
    "/api/real-adapter/production-execution-post-implementation-review-records"
  );
}

export async function fetchProductionExecutionImprovementClosureRecordsFromApi() {
  return fetchJson<ProductionExecutionImprovementClosureRecord[]>(
    "/api/real-adapter/production-execution-improvement-closure-records"
  );
}

export async function fetchProductionExecutionFinalAcceptanceArchiveRecordsFromApi() {
  return fetchJson<ProductionExecutionFinalAcceptanceArchiveRecord[]>(
    "/api/real-adapter/production-execution-final-acceptance-archive-records"
  );
}

export async function fetchProductionExecutionReadinessArchiveHandoffRecordsFromApi() {
  return fetchJson<ProductionExecutionReadinessArchiveHandoffRecord[]>(
    "/api/real-adapter/production-execution-readiness-archive-handoff-records"
  );
}

export async function fetchProductionExecutionArchiveRetrievalValidationRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRetrievalValidationRecord[]>(
    "/api/real-adapter/production-execution-archive-retrieval-validation-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryDrillRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryDrillRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-drill-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryAcceptanceRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryAcceptanceRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-acceptance-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryClosureRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryClosureRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-closure-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryAuditCertificationRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryAuditCertificationRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-audit-certification-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryOperationalContinuityRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryOperationalContinuityRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryServiceManagementHandoffRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records"
  );
}

export async function fetchProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records"
  );
}

export async function fetchProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordsFromApi() {
  return fetchJson<ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord[]>(
    "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records"
  );
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

export async function createManualRealAdapterSwitchReviewViaApi(payload: {
  activationId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ManualRealAdapterSwitchReview>("/api/real-adapter/switch-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createRealAdapterSwitchStateAuditPackageViaApi(payload: {
  switchReviewId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<RealAdapterSwitchStateAuditPackage>("/api/real-adapter/switch-state-audit-packages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createControlledSwitchConfigurationRequestViaApi(payload: {
  auditPackageId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ControlledSwitchConfigurationRequest>("/api/real-adapter/controlled-switch-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createSwitchExecutionHandoffPackageViaApi(payload: {
  controlledSwitchRequestId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<SwitchExecutionHandoffPackage>("/api/real-adapter/switch-handoff-packages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createSwitchExecutionOutcomeRecordViaApi(payload: {
  handoffPackageId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<SwitchExecutionOutcomeRecord>("/api/real-adapter/switch-outcome-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createSwitchClosureRetentionPackageViaApi(payload: {
  outcomeRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<SwitchClosureRetentionPackage>("/api/real-adapter/switch-closure-packages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createAdapterPromotionReadinessDossierViaApi(payload: {
  closurePackageId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<AdapterPromotionReadinessDossier>("/api/real-adapter/adapter-promotion-dossiers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionAdapterAuthorizationPacketViaApi(payload: {
  promotionDossierId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionAdapterAuthorizationPacket>("/api/real-adapter/production-authorization-packets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionChangeFreezeRecordViaApi(payload: {
  authorizationPacketId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionChangeFreezeRecord>("/api/real-adapter/production-change-freeze-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionCabHandoffPacketViaApi(payload: {
  freezeRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionCabHandoffPacket>("/api/real-adapter/production-cab-handoff-packets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionCabDecisionRecordViaApi(payload: {
  cabHandoffPacketId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionCabDecisionRecord>("/api/real-adapter/production-cab-decision-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionImplementationHoldRecordViaApi(payload: {
  cabDecisionRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionImplementationHoldRecord>("/api/real-adapter/production-implementation-hold-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionOperatorAssignmentRecordViaApi(payload: {
  implementationHoldRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionOperatorAssignmentRecord>("/api/real-adapter/production-operator-assignment-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionExecutionReadinessRecordViaApi(payload: {
  operatorAssignmentRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionReadinessRecord>("/api/real-adapter/production-execution-readiness-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionExecutionAuthorizationRecordViaApi(payload: {
  executionReadinessRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionAuthorizationRecord>("/api/real-adapter/production-execution-authorization-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionChangeTicketLockRecordViaApi(payload: {
  executionAuthorizationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionChangeTicketLockRecord>("/api/real-adapter/production-change-ticket-lock-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionFinalExecutionPacketRecordViaApi(payload: {
  changeTicketLockRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionFinalExecutionPacketRecord>("/api/real-adapter/production-final-execution-packet-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionExecutionHoldPointRecordViaApi(payload: {
  finalExecutionPacketRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionHoldPointRecord>("/api/real-adapter/production-execution-hold-point-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProductionExecutionOutcomeAuthorizationRecordViaApi(payload: {
  executionHoldPointRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionOutcomeAuthorizationRecord>(
    "/api/real-adapter/production-execution-outcome-authorization-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionClosureAuthorizationRecordViaApi(payload: {
  outcomeAuthorizationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionClosureAuthorizationRecord>(
    "/api/real-adapter/production-execution-closure-authorization-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionClosurePacketRecordViaApi(payload: {
  closureAuthorizationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionClosurePacketRecord>(
    "/api/real-adapter/production-execution-closure-packet-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchivalHandoffRecordViaApi(payload: {
  closurePacketRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchivalHandoffRecord>(
    "/api/real-adapter/production-execution-archival-handoff-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionRetentionAttestationRecordViaApi(payload: {
  archivalHandoffRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionRetentionAttestationRecord>(
    "/api/real-adapter/production-execution-retention-attestation-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionFinalArchiveCertificationRecordViaApi(payload: {
  retentionAttestationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionFinalArchiveCertificationRecord>(
    "/api/real-adapter/production-execution-final-archive-certification-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionCompletionDossierRecordViaApi(payload: {
  finalArchiveCertificationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionCompletionDossierRecord>(
    "/api/real-adapter/production-execution-completion-dossier-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionOperationsHandoverRecordViaApi(payload: {
  completionDossierRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionOperationsHandoverRecord>(
    "/api/real-adapter/production-execution-operations-handover-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionSupportReadinessRecordViaApi(payload: {
  operationsHandoverRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionSupportReadinessRecord>(
    "/api/real-adapter/production-execution-support-readiness-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionServiceAcceptanceRecordViaApi(payload: {
  supportReadinessRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionServiceAcceptanceRecord>(
    "/api/real-adapter/production-execution-service-acceptance-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionFinalTurnoverRecordViaApi(payload: {
  serviceAcceptanceRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionFinalTurnoverRecord>(
    "/api/real-adapter/production-execution-final-turnover-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionOperationalClosureRecordViaApi(payload: {
  finalTurnoverRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionOperationalClosureRecord>(
    "/api/real-adapter/production-execution-operational-closure-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionPostImplementationReviewRecordViaApi(payload: {
  operationalClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionPostImplementationReviewRecord>(
    "/api/real-adapter/production-execution-post-implementation-review-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionImprovementClosureRecordViaApi(payload: {
  postImplementationReviewRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionImprovementClosureRecord>(
    "/api/real-adapter/production-execution-improvement-closure-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionFinalAcceptanceArchiveRecordViaApi(payload: {
  improvementClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionFinalAcceptanceArchiveRecord>(
    "/api/real-adapter/production-execution-final-acceptance-archive-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionReadinessArchiveHandoffRecordViaApi(payload: {
  finalAcceptanceArchiveRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionReadinessArchiveHandoffRecord>(
    "/api/real-adapter/production-execution-readiness-archive-handoff-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRetrievalValidationRecordViaApi(payload: {
  readinessArchiveHandoffRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRetrievalValidationRecord>(
    "/api/real-adapter/production-execution-archive-retrieval-validation-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryDrillRecordViaApi(payload: {
  archiveRetrievalValidationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryDrillRecord>(
    "/api/real-adapter/production-execution-archive-recovery-drill-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryAcceptanceRecordViaApi(payload: {
  archiveRecoveryDrillRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryAcceptanceRecord>(
    "/api/real-adapter/production-execution-archive-recovery-acceptance-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryClosureRecordViaApi(payload: {
  archiveRecoveryAcceptanceRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryClosureRecord>(
    "/api/real-adapter/production-execution-archive-recovery-closure-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryAuditCertificationRecordViaApi(payload: {
  archiveRecoveryClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryAuditCertificationRecord>(
    "/api/real-adapter/production-execution-archive-recovery-audit-certification-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordViaApi(payload: {
  archiveRecoveryAuditCertificationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord>(
    "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordViaApi(payload: {
  finalComplianceArchiveRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord>(
    "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryOperationalContinuityRecordViaApi(payload: {
  evidenceCustodyClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryOperationalContinuityRecord>(
    "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryServiceManagementHandoffRecordViaApi(payload: {
  operationalContinuityRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord>(
    "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordViaApi(payload: {
  serviceManagementHandoffRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord>(
    "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordViaApi(payload: {
  supportOwnershipAcceptanceRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord>(
    "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordViaApi(payload: {
  monitoringOwnershipClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
}) {
  return fetchJson<ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord>(
    "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
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
