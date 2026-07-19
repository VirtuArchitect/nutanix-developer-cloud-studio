import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkApiHealth,
  createAdapterContractTestHarnessViaApi,
  createAdapterEnablementRecordViaApi,
  createAdapterPromotionReadinessDossierViaApi,
  createAuthorizedLabConnectionDryRunViaApi,
  createAuthorizedReadOnlyLabPilotGateViaApi,
  createEmergencyStopRollbackDrillViaApi,
  createAhvControlledProvisioningRunViaApi,
  createAhvCreateAdapterContractReviewViaApi,
  createAuditExportViaApi,
  createControlledLabExecutionApprovalViaApi,
  createControlledLabDryRunExecutionChecklistViaApi,
  createControlledLabExecutionEvidenceLedgerViaApi,
  createControlledLabExecutionReadinessAttestationViaApi,
  createControlledLabExecutionRehearsalPacketViaApi,
  createControlledLabDryRunWindowViaApi,
  createControlledLabReleaseRunbookViaApi,
  createControlledSwitchConfigurationRequestViaApi,
  createCredentialResolverAdapterStubViaApi,
  createCredentialProviderContractViaApi,
  createDisabledPrismReadOnlyHttpClientViaApi,
  createSwitchExecutionHandoffPackageViaApi,
  createSwitchExecutionOutcomeRecordViaApi,
  createSwitchClosureRetentionPackageViaApi,
  createExecutionBrokerDispatchApprovalViaApi,
  createExecutionBrokerQueueRecordViaApi,
  createLabEvidenceReviewViaApi,
  createLabExecutionProposalEnvelopeViaApi,
  createLabExecutionProposalExportViaApi,
  createLabWindowEvidenceExportViaApi,
  createLiveReadOnlyCallEnvelopeViaApi,
  createManualRealAdapterSwitchReviewViaApi,
  createControlledProvisioningGateViaApi,
  createControlledCreateAuthorizationEnvelopeViaApi,
  createEnvironmentViaApi,
  createEvidenceExportPackV2ViaApi,
  createLabAuthorizationScopeViaApi,
  createLabConnectionDryRunConsoleViaApi,
  createLabConnectivityPreflightViaApi,
  createLabReadinessWorkspaceViaApi,
  createLifecycleOperationViaApi,
  createMockPrismEndpointExpansionViaApi,
  createPlatformServiceRequestViaApi,
  createPlatformServiceAdapterContractReviewViaApi,
  createPlatformServicePreflightRunViaApi,
  createProviderReleaseGateRecordViaApi,
  createProductionAdapterAuthorizationPacketViaApi,
  createProductionChangeFreezeRecordViaApi,
  createProductionCabHandoffPacketViaApi,
  createProductionCabDecisionRecordViaApi,
  createProductionImplementationHoldRecordViaApi,
  createProductionOperatorAssignmentRecordViaApi,
  createProductionExecutionReadinessRecordViaApi,
  createProductionExecutionAuthorizationRecordViaApi,
  createProductionChangeTicketLockRecordViaApi,
  createProductionFinalExecutionPacketRecordViaApi,
  createProductionExecutionHoldPointRecordViaApi,
  createProductionExecutionOutcomeAuthorizationRecordViaApi,
  createProductionExecutionClosureAuthorizationRecordViaApi,
  createProductionExecutionClosurePacketRecordViaApi,
  createProductionExecutionArchivalHandoffRecordViaApi,
  createProductionExecutionRetentionAttestationRecordViaApi,
  createProductionExecutionFinalArchiveCertificationRecordViaApi,
  createProductionExecutionCompletionDossierRecordViaApi,
  createProductionExecutionOperationsHandoverRecordViaApi,
  createProductionExecutionSupportReadinessRecordViaApi,
  createProductionExecutionServiceAcceptanceRecordViaApi,
  createProductionExecutionFinalTurnoverRecordViaApi,
  createProductionExecutionOperationalClosureRecordViaApi,
  createProductionExecutionPostImplementationReviewRecordViaApi,
  createProductionExecutionImprovementClosureRecordViaApi,
  createProductionExecutionFinalAcceptanceArchiveRecordViaApi,
  createProductionExecutionReadinessArchiveHandoffRecordViaApi,
  createProductionExecutionArchiveRetrievalValidationRecordViaApi,
  createProductionExecutionArchiveRecoveryDrillRecordViaApi,
  createProductionExecutionArchiveRecoveryAcceptanceRecordViaApi,
  createProductionExecutionArchiveRecoveryClosureRecordViaApi,
  createProductionExecutionArchiveRecoveryAuditCertificationRecordViaApi,
  createProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordViaApi,
  createProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordViaApi,
  createProductionExecutionArchiveRecoveryOperationalContinuityRecordViaApi,
  createProductionExecutionArchiveRecoveryServiceManagementHandoffRecordViaApi,
  createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordViaApi,
  createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordViaApi,
  createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordViaApi,
  createProductionReadinessReviewViaApi,
  createHardenedLabConnectionProfileReviewViaApi,
  createLabPilotRunbookWorkflowViaApi,
  createLiveReadOnlyInventoryPilotViaApi,
  createDisabledRealReadOnlyAdapterInterfaceViaApi,
  createOfflineContractReplaySuiteViaApi,
  createOperatorEvidenceExportPackViaApi,
  createProductionReadinessDecisionGateViaApi,
  createPrismFixtureReplayViaApi,
  createRealReadOnlyAdapterConfigBoundaryViaApi,
  createReadOnlyAdapterObservabilityViaApi,
  createReadOnlyAdapterAuthorizationGateViaApi,
  createReadOnlyLabConnectionProfileViaApi,
  createReadOnlyPilotSessionViaApi,
  createReadOnlyRuntimeEnablementPolicyViaApi,
  createPilotEvidenceReviewViaApi,
  createReleaseEvidenceExportViaApi,
  createRealLabAuthorizationPacketViaApi,
  createRealAdapterLabScopeActivationViaApi,
  createRealAdapterSwitchStateAuditPackageViaApi,
  createRollbackDestroyProofViaApi,
  createVmLifecycleProofViaApi,
  createVmSandboxDryRunViaApi,
  decideControlledProvisioningGateViaApi,
  fetchAuthBoundaryDiagnosticsFromApi,
  fetchAhvControlledProvisioningRunsFromApi,
  fetchAhvCreateAdapterContractReviewsFromApi,
  fetchAdminUpgradeHealthConsoleFromApi,
  fetchAdapterContractTestHarnessesFromApi,
  fetchAdapterPromotionReadinessDossiersFromApi,
  fetchAdapterEnablementRecordsFromApi,
  fetchApiContractBaselineFromApi,
  fetchAuthorizedLabConnectionDryRunsFromApi,
  fetchAuthorizedReadOnlyLabPilotGatesFromApi,
  fetchAuditIntegrityManifestFromApi,
  fetchAuditExportsFromApi,
  fetchAuditRetentionDiagnosticsFromApi,
  fetchCredentialReferenceDiagnosticsFromApi,
  fetchCredentialResolverAdapterStubsFromApi,
  fetchCredentialProviderContractsFromApi,
  fetchControlledLabExecutionApprovalsFromApi,
  fetchControlledLabDryRunExecutionChecklistsFromApi,
  fetchControlledLabExecutionEvidenceLedgersFromApi,
  fetchControlledLabExecutionReadinessAttestationsFromApi,
  fetchControlledLabExecutionRehearsalPacketsFromApi,
  fetchControlledProvisioningGatesFromApi,
  fetchControlledCreateAuthorizationEnvelopesFromApi,
  fetchControlledLabDryRunWindowsFromApi,
  fetchControlledLabReleaseRunbooksFromApi,
  fetchControlledSwitchConfigurationRequestsFromApi,
  fetchContainerConfigValidationManifestFromApi,
  fetchDeploymentProfileValidationFromApi,
  fetchDurablePersistenceStatusFromApi,
  fetchSwitchExecutionHandoffPackagesFromApi,
  fetchSwitchExecutionOutcomeRecordsFromApi,
  fetchSwitchClosureRetentionPackagesFromApi,
  fetchControlPlaneJobsFromApi,
  fetchEnvironmentsFromApi,
  fetchExecutionBrokerDispatchApprovalsFromApi,
  fetchExecutionBrokerQueueRecordsFromApi,
  fetchEvidenceExportPacksV2FromApi,
  fetchDisabledPrismReadOnlyHttpClientsFromApi,
  fetchDisabledRealReadOnlyAdapterInterfacesFromApi,
  fetchEmergencyStopRollbackDrillsFromApi,
  fetchLabAdaptersFromApi,
  fetchLabAuthorizationScopesFromApi,
  fetchLabConnectionDryRunConsolesFromApi,
  fetchLabConnectivityPreflightsFromApi,
  fetchLabReadinessWorkspacesFromApi,
  fetchLabPilotOperatorConsoleFromApi,
  fetchLabPilotRunbookWorkflowsFromApi,
  fetchLabEvidenceReviewsFromApi,
  fetchLabExecutionProposalEnvelopesFromApi,
  fetchLabExecutionProposalExportsFromApi,
  fetchLabWindowEvidenceExportsFromApi,
  fetchLabScopeDiagnosticsFromApi,
  fetchJwtVerificationBoundaryFromApi,
  fetchLiveReadOnlyCallEnvelopesFromApi,
  fetchLiveReadOnlyPrismCallDesignFromApi,
  fetchLiveReadOnlyInventoryPilotsFromApi,
  fetchHardenedLabConnectionProfileReviewsFromApi,
  fetchManualRealAdapterSwitchReviewsFromApi,
  fetchMockPrismExecutionsFromApi,
  fetchMockPrismEndpointExpansionsFromApi,
  fetchMockPrismHarnessConsoleFromApi,
  fetchMockPrismStatusFromApi,
  fetchMigrationBaselineManifestFromApi,
  fetchPrismAdapterDiagnosticsFromApi,
  fetchPrismFixtureReplaysFromApi,
  fetchPilotEvidenceReviewsFromApi,
  fetchPersistenceBoundaryStatusFromApi,
  fetchPrismReadOnlyAdapterDiagnosticsFromApi,
  fetchReadOnlyAdapterObservabilityFromApi,
  fetchReadOnlyAdapterAuthorizationGatesFromApi,
  fetchReadOnlyAdapterRuntimeModesFromApi,
  fetchReadOnlyLabConnectionProfilesFromApi,
  fetchReadOnlyPilotSessionsFromApi,
  fetchReadOnlyRuntimeEnablementPoliciesFromApi,
  fetchReadOnlyPrismLabGatesFromApi,
  fetchRealLabAuthorizationPacketsFromApi,
  fetchPrismFailureScenariosFromApi,
  fetchPrismSimulatorProfilesFromApi,
  fetchPolicyBundlesFromApi,
  fetchOperatorEvidenceExportPacksFromApi,
  fetchOnPremInstallProfilePackFromApi,
  fetchOperationsRunbookConsoleFromApi,
  fetchOfflineContractReplaySuitesFromApi,
  fetchLifecycleOperationsFromApi,
  fetchPlatformConfigFromApi,
  fetchPlatformServiceAdapterContractReviewsFromApi,
  fetchPlatformServiceRequestsFromApi,
  fetchPlatformServicePreflightRunsFromApi,
  fetchProviderReleaseGateRecordsFromApi,
  fetchProviderReleaseReadinessSummaryFromApi,
  fetchPrismInventoryFromApi,
  fetchProvisioningAdaptersFromApi,
  fetchProductionAdapterAuthorizationPacketsFromApi,
  fetchProductionChangeFreezeRecordsFromApi,
  fetchProductionCabHandoffPacketsFromApi,
  fetchProductionCabDecisionRecordsFromApi,
  fetchProductionImplementationHoldRecordsFromApi,
  fetchProductionOperatorAssignmentRecordsFromApi,
  fetchProductionExecutionReadinessRecordsFromApi,
  fetchProductionExecutionAuthorizationRecordsFromApi,
  fetchProductionChangeTicketLockRecordsFromApi,
  fetchProductionFinalExecutionPacketRecordsFromApi,
  fetchProductionExecutionHoldPointRecordsFromApi,
  fetchProductionExecutionOutcomeAuthorizationRecordsFromApi,
  fetchProductionExecutionClosureAuthorizationRecordsFromApi,
  fetchProductionExecutionClosurePacketRecordsFromApi,
  fetchProductionExecutionArchivalHandoffRecordsFromApi,
  fetchProductionExecutionRetentionAttestationRecordsFromApi,
  fetchProductionExecutionFinalArchiveCertificationRecordsFromApi,
  fetchProductionExecutionCompletionDossierRecordsFromApi,
  fetchProductionExecutionOperationsHandoverRecordsFromApi,
  fetchProductionExecutionSupportReadinessRecordsFromApi,
  fetchProductionExecutionServiceAcceptanceRecordsFromApi,
  fetchProductionExecutionFinalTurnoverRecordsFromApi,
  fetchProductionExecutionOperationalClosureRecordsFromApi,
  fetchProductionExecutionPostImplementationReviewRecordsFromApi,
  fetchProductionExecutionImprovementClosureRecordsFromApi,
  fetchProductionExecutionFinalAcceptanceArchiveRecordsFromApi,
  fetchProductionExecutionReadinessArchiveHandoffRecordsFromApi,
  fetchProductionExecutionArchiveRetrievalValidationRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryDrillRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryAcceptanceRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryClosureRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryAuditCertificationRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryOperationalContinuityRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryServiceManagementHandoffRecordsFromApi,
  fetchProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordsFromApi,
  fetchProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordsFromApi,
  fetchProductionReadinessReviewsFromApi,
  fetchProductionReadinessDecisionGatesFromApi,
  fetchProductionReadinessScorecardFromApi,
  fetchRealReadOnlyAdapterConfigBoundariesFromApi,
  fetchReleaseEvidenceExportsFromApi,
  fetchRealAdapterLabScopeActivationsFromApi,
  fetchRealPrismPreflightRunsFromApi,
  fetchRealAdapterSwitchStateAuditPackagesFromApi,
  fetchRbacEnforcementMatrixFromApi,
  fetchRollbackDestroyProofsFromApi,
  fetchResourceProfilesFromApi,
  fetchRuntimeObservabilityFromApi,
  fetchSessionFromApi,
  fetchSessionDiagnosticsFromApi,
  fetchSignedAuditExportManifestFromApi,
  fetchSystemStatusFromApi,
  fetchProvisioningModeStatusFromApi,
  fetchTemplateRegistryFromApi,
  fetchVmSandboxDryRunsFromApi,
  fetchVmLifecycleProofsFromApi,
  requestEnvironmentDestroyViaApi,
  activatePrismFailureScenarioViaApi,
  createRealPrismPreflightRunViaApi,
  createReadOnlyPrismLabGateViaApi,
  importPrismInventoryViaApi,
  runResourceProfileActionViaApi,
  runLabPilotRunbookWorkflowActionViaApi,
  setReadOnlyAdapterRuntimeModeViaApi,
  runLabDiscoveryViaApi,
  runControlPlaneJobActionViaApi,
  runIntegrationCheckViaApi,
  runTemplateRegistryActionViaApi,
  saveIntegrationConfigViaApi,
  selectPrismSimulatorProfileViaApi,
} from "./cloudStudioApi";

describe("cloudStudioApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports API mode when health endpoint responds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: { ok: true } })));

    await expect(checkApiHealth()).resolves.toEqual({
      mode: "api",
      label: "On-prem API connected",
    });
  });

  it("falls back to mock mode when health endpoint is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(checkApiHealth()).resolves.toEqual({
      mode: "mock",
      label: "Browser mock mode",
    });
  });

  it("fetches environments from the API envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: [{ name: "api-dev" }] })));

    await expect(fetchEnvironmentsFromApi()).resolves.toEqual([{ name: "api-dev" }]);
  });

  it("posts environment requests to the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { environment: { name: "api-dev" }, jobs: [] } }));
    vi.stubGlobal("fetch", fetchMock);

    await createEnvironmentViaApi({
      name: "api-dev",
      templateId: "spring-postgres",
      owner: "demo.user",
      region: "Berlin Lab",
      targets: ["Kubernetes"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/environments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("api-dev"),
      })
    );
  });

  it("fetches the API session envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: { user: "platform.admin" } })));

    await expect(fetchSessionFromApi()).resolves.toEqual({ user: "platform.admin" });
  });

  it("fetches session diagnostics", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okResponse({
          data: {
            trustedHeaderMode: "Required",
            authorizationMatrix: [{ action: "Manage providers", roles: ["Platform Admin"] }],
          },
        })
      )
    );

    await expect(fetchSessionDiagnosticsFromApi()).resolves.toMatchObject({
      trustedHeaderMode: "Required",
      authorizationMatrix: expect.arrayContaining([expect.objectContaining({ action: "Manage providers" })]),
    });
  });

  it("fetches production-readiness diagnostics endpoints", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { provisioningEnabled: false, realPrismCallsEnabled: false } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAuthBoundaryDiagnosticsFromApi();
    await fetchRuntimeObservabilityFromApi();
    await fetchApiContractBaselineFromApi();
    await fetchRbacEnforcementMatrixFromApi();
    await fetchPersistenceBoundaryStatusFromApi();
    await fetchAuditIntegrityManifestFromApi();
    await fetchDeploymentProfileValidationFromApi();
    await fetchOperationsRunbookConsoleFromApi();
    await fetchDurablePersistenceStatusFromApi();
    await fetchMigrationBaselineManifestFromApi();
    await fetchJwtVerificationBoundaryFromApi();
    await fetchSignedAuditExportManifestFromApi();
    await fetchAdminUpgradeHealthConsoleFromApi();
    await fetchOnPremInstallProfilePackFromApi();
    await fetchProductionReadinessScorecardFromApi();
    await fetchContainerConfigValidationManifestFromApi();
    await fetchLiveReadOnlyPrismCallDesignFromApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/auth/boundary-diagnostics", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/observability/runtime", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/contracts/openapi", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/security/rbac-matrix", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/storage/persistence-boundary", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(6, "/api/audit/integrity-manifest", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/deployment/profiles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(8, "/api/operations/runbook-console", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(9, "/api/onprem/durable-persistence", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(10, "/api/onprem/migration-baseline", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(11, "/api/auth/jwt-boundary", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(12, "/api/audit/signed-export-manifest", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(13, "/api/admin/upgrade-health", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(14, "/api/onprem/install-profile-pack", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(15, "/api/production/readiness-scorecard", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(16, "/api/deployment/config-validation", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(17, "/api/prism/live-read-only-design", expect.any(Object));
  });

  it("saves and checks integration configuration", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { name: "NCI", status: "Configured" } }));
    vi.stubGlobal("fetch", fetchMock);

    await saveIntegrationConfigViaApi("NCI", {
      endpoint: "https://prism.lab.example",
      credentialProfile: "nci-readonly",
    });
    await fetchCredentialReferenceDiagnosticsFromApi();
    await runIntegrationCheckViaApi("NCI");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/integration-config/NCI",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("prism.lab.example"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/provider-credentials/diagnostics",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/integrations/NCI/check",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches system status and runs lab discovery", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { provisioningEnabled: false } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchSystemStatusFromApi();
    await fetchProvisioningModeStatusFromApi();
    await fetchLabAdaptersFromApi();
    await runLabDiscoveryViaApi("NCI");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/system/status", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/provisioning/mode", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/lab-adapters", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/lab-adapters/NCI/discover",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and imports Prism read-only inventory", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { records: [], recordsImported: 0 } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPrismInventoryFromApi();
    await importPrismInventoryViaApi();
    await fetchMockPrismStatusFromApi();
    await fetchMockPrismExecutionsFromApi();
    await fetchMockPrismHarnessConsoleFromApi();
    await fetchPrismAdapterDiagnosticsFromApi();
    await fetchPrismReadOnlyAdapterDiagnosticsFromApi();
    await fetchReadOnlyPrismLabGatesFromApi();
    await createReadOnlyPrismLabGateViaApi();
    await fetchPrismSimulatorProfilesFromApi();
    await selectPrismSimulatorProfileViaApi("sim-image-ubuntu-2404");
    await fetchPrismFailureScenariosFromApi();
    await activatePrismFailureScenarioViaApi("task-failed");
    await fetchRealPrismPreflightRunsFromApi();
    await createRealPrismPreflightRunViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/prism/inventory", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/prism/inventory/import",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/mock-prism/status", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/mock-prism/executions", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/mock-prism/harness-console", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(6, "/api/prism/adapter-diagnostics", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/prism/read-only-adapter/diagnostics", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(8, "/api/prism/read-only-lab-gates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      9,
      "/api/prism/read-only-lab-gates",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(10, "/api/prism/simulator-profiles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      11,
      "/api/prism/simulator-profiles/sim-image-ubuntu-2404/select",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(12, "/api/prism/failure-scenarios", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      13,
      "/api/prism/failure-scenarios/task-failed/activate",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(14, "/api/prism/real-preflight-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      15,
      "/api/prism/real-preflight-runs",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and records controlled read-only lab pilot foundation evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchReadOnlyLabConnectionProfilesFromApi();
    await createReadOnlyLabConnectionProfileViaApi({ name: "Berlin read-only profile" });
    await fetchPrismFixtureReplaysFromApi();
    await createPrismFixtureReplayViaApi({ fixtureName: "sanitized-fixture" });
    await fetchReadOnlyAdapterAuthorizationGatesFromApi();
    await createReadOnlyAdapterAuthorizationGateViaApi({ profileId: "profile-1" });
    await fetchOperatorEvidenceExportPacksFromApi();
    await createOperatorEvidenceExportPackViaApi();
    await fetchLabPilotRunbookWorkflowsFromApi();
    await createLabPilotRunbookWorkflowViaApi({ profileId: "profile-1" });
    await runLabPilotRunbookWorkflowActionViaApi("workflow-1", "approve");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/prism/read-only-lab-profiles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/prism/read-only-lab-profiles",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("Berlin read-only profile") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/prism/fixture-replays", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/prism/fixture-replays",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("sanitized-fixture") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/prism/read-only-authorization-gates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "/api/prism/read-only-authorization-gates",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("profile-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/operator/evidence-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      8,
      "/api/operator/evidence-exports",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(9, "/api/lab-pilot/runbook-workflows", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      10,
      "/api/lab-pilot/runbook-workflows",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("profile-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      11,
      "/api/lab-pilot/runbook-workflows/workflow-1/approve",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and records controlled read-only adapter pilot evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchReadOnlyAdapterRuntimeModesFromApi();
    await setReadOnlyAdapterRuntimeModeViaApi({ mode: "authorized-read-only-lab", authorizationGateId: "auth-1" });
    await fetchLiveReadOnlyInventoryPilotsFromApi();
    await createLiveReadOnlyInventoryPilotViaApi({ runtimeModeRecordId: "mode-1" });
    await fetchReadOnlyAdapterObservabilityFromApi();
    await createReadOnlyAdapterObservabilityViaApi({ runtimeModeRecordId: "mode-1", inventoryPilotId: "pilot-1" });
    await fetchLabPilotOperatorConsoleFromApi();
    await fetchProductionReadinessDecisionGatesFromApi();
    await createProductionReadinessDecisionGateViaApi({ decision: "Go" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/prism/read-only-runtime-modes", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/prism/read-only-runtime-modes",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("authorized-read-only-lab") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/prism/live-read-only-inventory-pilots", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/prism/live-read-only-inventory-pilots",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("mode-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/prism/read-only-observability", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "/api/prism/read-only-observability",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("pilot-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/lab-pilot/operator-console", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(8, "/api/production/readiness-decision-gates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      9,
      "/api/production/readiness-decision-gates",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("Go") })
    );
  });

  it("fetches and records real read-only adapter preparation evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchRealReadOnlyAdapterConfigBoundariesFromApi();
    await createRealReadOnlyAdapterConfigBoundaryViaApi({ endpointRef: "prism-central-ref" });
    await fetchCredentialProviderContractsFromApi();
    await createCredentialProviderContractViaApi({ credentialProviderRef: "vault-ref-nci-readonly" });
    await fetchDisabledRealReadOnlyAdapterInterfacesFromApi();
    await createDisabledRealReadOnlyAdapterInterfaceViaApi({ configBoundaryId: "config-1" });
    await fetchOfflineContractReplaySuitesFromApi();
    await createOfflineContractReplaySuiteViaApi({ adapterInterfaceId: "adapter-1" });
    await fetchAuthorizedLabConnectionDryRunsFromApi();
    await createAuthorizedLabConnectionDryRunViaApi({ offlineReplaySuiteId: "replay-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/prism/real-read-only/config-boundaries", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/prism/real-read-only/config-boundaries",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("prism-central-ref") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/credentials/provider-contracts", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/credentials/provider-contracts",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vault-ref-nci-readonly") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/prism/real-read-only/adapter-interfaces", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "/api/prism/real-read-only/adapter-interfaces",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("config-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/prism/offline-contract-replays", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      8,
      "/api/prism/offline-contract-replays",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("adapter-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(9, "/api/prism/authorized-lab-dry-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      10,
      "/api/prism/authorized-lab-dry-runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("replay-1") })
    );
  });

  it("fetches and records controlled read-only lab enablement gates and production pilot controls", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchHardenedLabConnectionProfileReviewsFromApi();
    await createHardenedLabConnectionProfileReviewViaApi({ profileId: "profile-1" });
    await fetchCredentialResolverAdapterStubsFromApi();
    await createCredentialResolverAdapterStubViaApi({ credentialContractId: "credential-1" });
    await fetchDisabledPrismReadOnlyHttpClientsFromApi();
    await createDisabledPrismReadOnlyHttpClientViaApi({ adapterInterfaceId: "adapter-1" });
    await fetchLabConnectivityPreflightsFromApi();
    await createLabConnectivityPreflightViaApi({ httpClientRecordId: "client-1" });
    await fetchAuthorizedReadOnlyLabPilotGatesFromApi();
    await createAuthorizedReadOnlyLabPilotGateViaApi({ preflightId: "preflight-1" });
    await fetchReadOnlyRuntimeEnablementPoliciesFromApi();
    await createReadOnlyRuntimeEnablementPolicyViaApi({ pilotGateId: "pilot-gate-1" });
    await fetchReadOnlyPilotSessionsFromApi();
    await createReadOnlyPilotSessionViaApi({ policyId: "policy-1" });
    await fetchLiveReadOnlyCallEnvelopesFromApi();
    await createLiveReadOnlyCallEnvelopeViaApi({ pilotSessionId: "session-1" });
    await fetchPilotEvidenceReviewsFromApi();
    await createPilotEvidenceReviewViaApi({ callEnvelopeId: "envelope-1", decision: "Approve" });
    await fetchEmergencyStopRollbackDrillsFromApi();
    await createEmergencyStopRollbackDrillViaApi({ pilotEvidenceReviewId: "review-1" });
    await fetchLabReadinessWorkspacesFromApi();
    await createLabReadinessWorkspaceViaApi({ emergencyStopRollbackDrillId: "drill-1" });
    await fetchMockPrismEndpointExpansionsFromApi();
    await createMockPrismEndpointExpansionViaApi({ workspaceId: "workspace-1" });
    await fetchAdapterContractTestHarnessesFromApi();
    await createAdapterContractTestHarnessViaApi({ mockExpansionId: "expansion-1" });
    await fetchLabConnectionDryRunConsolesFromApi();
    await createLabConnectionDryRunConsoleViaApi({ contractHarnessId: "harness-1" });
    await fetchEvidenceExportPacksV2FromApi();
    await createEvidenceExportPackV2ViaApi({ dryRunConsoleId: "console-1" });
    await fetchRealLabAuthorizationPacketsFromApi();
    await createRealLabAuthorizationPacketViaApi({ evidenceExportPackId: "export-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/prism/read-only-lab-profile-hardening", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/prism/read-only-lab-profile-hardening",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("profile-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/credentials/resolver-stubs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/credentials/resolver-stubs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("credential-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/prism/read-only-http-clients", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "/api/prism/read-only-http-clients",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("adapter-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/prism/lab-connectivity-preflights", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      8,
      "/api/prism/lab-connectivity-preflights",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("client-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(9, "/api/prism/authorized-read-only-pilot-gates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      10,
      "/api/prism/authorized-read-only-pilot-gates",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("preflight-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(11, "/api/prism/read-only-runtime-policies", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      12,
      "/api/prism/read-only-runtime-policies",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("pilot-gate-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(13, "/api/prism/read-only-pilot-sessions", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      14,
      "/api/prism/read-only-pilot-sessions",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("policy-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(15, "/api/prism/live-read-only-call-envelopes", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      16,
      "/api/prism/live-read-only-call-envelopes",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("session-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(17, "/api/prism/pilot-evidence-reviews", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      18,
      "/api/prism/pilot-evidence-reviews",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("envelope-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(19, "/api/prism/emergency-stop-rollback-drills", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      20,
      "/api/prism/emergency-stop-rollback-drills",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("review-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(21, "/api/lab-transition/readiness-workspaces", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      22,
      "/api/lab-transition/readiness-workspaces",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("drill-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(23, "/api/lab-transition/mock-prism-endpoint-expansions", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      24,
      "/api/lab-transition/mock-prism-endpoint-expansions",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("workspace-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(25, "/api/lab-transition/adapter-contract-harnesses", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      26,
      "/api/lab-transition/adapter-contract-harnesses",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("expansion-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(27, "/api/lab-transition/dry-run-consoles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      28,
      "/api/lab-transition/dry-run-consoles",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("harness-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(29, "/api/lab-transition/evidence-export-packs-v2", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      30,
      "/api/lab-transition/evidence-export-packs-v2",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("console-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(31, "/api/lab-transition/real-lab-authorization-packets", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      32,
      "/api/lab-transition/real-lab-authorization-packets",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("export-1") })
    );
  });

  it("fetches and advances control-plane jobs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [{ id: "cp-api-dev" }] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlPlaneJobsFromApi();
    await runControlPlaneJobActionViaApi("cp-api-dev", "advance");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/control-plane/jobs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/control-plane/jobs/cp-api-dev/advance",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates VM sandbox dry-run plans", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchVmSandboxDryRunsFromApi();
    await createVmSandboxDryRunViaApi({ environmentName: "vm-plan-dev", imageProfileId: "ahv-rocky-9-hardened" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/dry-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/dry-runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-plan-dev") })
    );
  });

  it("fetches, creates, and decides controlled provisioning gates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlledProvisioningGatesFromApi();
    await createControlledProvisioningGateViaApi({ dryRunPlanId: "vm-dryrun-1" });
    await decideControlledProvisioningGateViaApi("vm-controlled-1", "approve", "Operator approval recorded.");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/controlled-provisioning", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/controlled-provisioning",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-dryrun-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/vm-sandbox/controlled-provisioning/vm-controlled-1/approve",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("Operator approval recorded.") })
    );
  });

  it("fetches and creates controlled create authorization envelopes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlledCreateAuthorizationEnvelopesFromApi();
    await createControlledCreateAuthorizationEnvelopeViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/controlled-create-authorization", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/controlled-create-authorization",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates AHV create adapter contract reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAhvCreateAdapterContractReviewsFromApi();
    await createAhvCreateAdapterContractReviewViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/ahv/create-adapter-contracts", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/ahv/create-adapter-contracts",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and records lab authorization and VM lifecycle proof", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchLabAuthorizationScopesFromApi();
    await fetchLabScopeDiagnosticsFromApi();
    await createLabAuthorizationScopeViaApi({ pentestScopeStructurallyValid: true });
    await fetchVmLifecycleProofsFromApi();
    await createVmLifecycleProofViaApi({ gateId: "vm-controlled-1", rollbackVerified: true, destroyVerified: true });
    await fetchRollbackDestroyProofsFromApi();
    await createRollbackDestroyProofViaApi({ dryRunPlanId: "vm-dryrun-1", backupEvidenceReference: "backup-ref" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/lab-authorization/scopes", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/lab-authorization/diagnostics", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/lab-authorization/scopes",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("pentestScopeStructurallyValid") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/vm-lifecycle/proofs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "/api/vm-lifecycle/proofs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-controlled-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(6, "/api/vm-sandbox/rollback-destroy-proofs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      7,
      "/api/vm-sandbox/rollback-destroy-proofs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("backup-ref") })
    );
  });

  it("fetches and creates AHV controlled provisioning preflight runs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAhvControlledProvisioningRunsFromApi();
    await createAhvControlledProvisioningRunViaApi({ gateId: "vm-controlled-1", action: "Create VM" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/ahv/controlled-provisioning/runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/ahv/controlled-provisioning/runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-controlled-1") })
    );
  });

  it("fetches and creates platform service requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServiceRequestsFromApi();
    await createPlatformServiceRequestViaApi({ kind: "NDB PostgreSQL", environmentName: "payments-dev" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/requests", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/requests",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("NDB PostgreSQL") })
    );
  });

  it("fetches and creates platform service preflight runs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServicePreflightRunsFromApi();
    await createPlatformServicePreflightRunViaApi({ requestId: "platform-service-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/preflight-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/preflight-runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("platform-service-1") })
    );
  });

  it("fetches and creates platform service adapter contract reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServiceAdapterContractReviewsFromApi();
    await createPlatformServiceAdapterContractReviewViaApi({ requestId: "platform-service-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/adapter-contracts", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/adapter-contracts",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("platform-service-1") })
    );
  });

  it("fetches and creates provider release gate reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchProviderReleaseGateRecordsFromApi();
    await fetchProviderReleaseReadinessSummaryFromApi();
    await createProviderReleaseGateRecordViaApi({ provider: "NDB", releaseApprover: "platform.owner" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/provider-release-gates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/provider-release-readiness",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/provider-release-gates",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("platform.owner") })
    );
  });

  it("fetches and creates release evidence exports", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchReleaseEvidenceExportsFromApi();
    await createReleaseEvidenceExportViaApi({ gateId: "provider-release-ndb-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/release-evidence-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/release-evidence-exports",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("provider-release-ndb-1") })
    );
  });

  it("fetches and creates controlled lab release runbooks", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlledLabReleaseRunbooksFromApi();
    await createControlledLabReleaseRunbookViaApi({ provider: "NDB" });
    await fetchControlledLabDryRunWindowsFromApi();
    await createControlledLabDryRunWindowViaApi({ provider: "NDB", runbookId: "controlled-lab-runbook-ndb-1" });
    await fetchLabWindowEvidenceExportsFromApi();
    await createLabWindowEvidenceExportViaApi({ windowId: "controlled-lab-window-ndb-1" });
    await fetchLabEvidenceReviewsFromApi();
    await createLabEvidenceReviewViaApi({ exportId: "lab-window-evidence-export-ndb-1" });
    await fetchLabExecutionProposalEnvelopesFromApi();
    await createLabExecutionProposalEnvelopeViaApi({ reviewId: "lab-evidence-review-ndb-1" });
    await fetchLabExecutionProposalExportsFromApi();
    await createLabExecutionProposalExportViaApi({ envelopeId: "lab-execution-proposal-ndb-1" });
    await fetchControlledLabExecutionApprovalsFromApi();
    await createControlledLabExecutionApprovalViaApi({ proposalExportId: "lab-execution-proposal-export-ndb-1" });
    await fetchControlledLabExecutionRehearsalPacketsFromApi();
    await createControlledLabExecutionRehearsalPacketViaApi({ approvalGateId: "controlled-lab-execution-approval-ndb-1" });
    await fetchControlledLabDryRunExecutionChecklistsFromApi();
    await createControlledLabDryRunExecutionChecklistViaApi({ rehearsalPacketId: "controlled-lab-rehearsal-packet-ndb-1" });
    await fetchControlledLabExecutionEvidenceLedgersFromApi();
    await createControlledLabExecutionEvidenceLedgerViaApi({ dryRunChecklistId: "controlled-lab-dry-run-checklist-ndb-1" });
    await fetchControlledLabExecutionReadinessAttestationsFromApi();
    await createControlledLabExecutionReadinessAttestationViaApi({ evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-1" });
    await fetchExecutionBrokerQueueRecordsFromApi();
    await createExecutionBrokerQueueRecordViaApi({
      readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
      idempotencyKey: "ndb-controlled-lab-001",
    });
    await fetchExecutionBrokerDispatchApprovalsFromApi();
    await createExecutionBrokerDispatchApprovalViaApi({ brokerRecordId: "execution-broker-ndb-1" });
    await fetchRealAdapterLabScopeActivationsFromApi();
    await createRealAdapterLabScopeActivationViaApi({ dispatchApprovalId: "execution-broker-dispatch-approval-ndb-1" });
    await fetchManualRealAdapterSwitchReviewsFromApi();
    await createManualRealAdapterSwitchReviewViaApi({ activationId: "real-adapter-lab-scope-activation-ndb-1" });
    await fetchRealAdapterSwitchStateAuditPackagesFromApi();
    await createRealAdapterSwitchStateAuditPackageViaApi({ switchReviewId: "manual-real-adapter-switch-review-ndb-1" });
    await fetchControlledSwitchConfigurationRequestsFromApi();
    await createControlledSwitchConfigurationRequestViaApi({ auditPackageId: "real-adapter-switch-state-audit-ndb-1" });
    await fetchSwitchExecutionHandoffPackagesFromApi();
    await createSwitchExecutionHandoffPackageViaApi({
      controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
    });
    await fetchSwitchExecutionOutcomeRecordsFromApi();
    await createSwitchExecutionOutcomeRecordViaApi({ handoffPackageId: "switch-execution-handoff-package-ndb-1" });
    await fetchSwitchClosureRetentionPackagesFromApi();
    await createSwitchClosureRetentionPackageViaApi({ outcomeRecordId: "switch-execution-outcome-record-ndb-1" });
    await fetchAdapterPromotionReadinessDossiersFromApi();
    await createAdapterPromotionReadinessDossierViaApi({ closurePackageId: "switch-closure-retention-package-ndb-1" });
    await fetchProductionAdapterAuthorizationPacketsFromApi();
    await createProductionAdapterAuthorizationPacketViaApi({
      promotionDossierId: "adapter-promotion-readiness-dossier-ndb-1",
    });
    await fetchProductionChangeFreezeRecordsFromApi();
    await createProductionChangeFreezeRecordViaApi({
      authorizationPacketId: "production-adapter-authorization-packet-ndb-1",
    });
    await fetchProductionCabHandoffPacketsFromApi();
    await createProductionCabHandoffPacketViaApi({
      freezeRecordId: "production-change-freeze-record-ndb-1",
    });
    await fetchProductionCabDecisionRecordsFromApi();
    await createProductionCabDecisionRecordViaApi({
      cabHandoffPacketId: "production-cab-handoff-packet-ndb-1",
    });
    await fetchProductionImplementationHoldRecordsFromApi();
    await createProductionImplementationHoldRecordViaApi({
      cabDecisionRecordId: "production-cab-decision-record-ndb-1",
    });
    await fetchProductionOperatorAssignmentRecordsFromApi();
    await createProductionOperatorAssignmentRecordViaApi({
      implementationHoldRecordId: "production-implementation-hold-record-ndb-1",
    });
    await fetchProductionExecutionReadinessRecordsFromApi();
    await createProductionExecutionReadinessRecordViaApi({
      operatorAssignmentRecordId: "production-operator-assignment-record-ndb-1",
    });
    await fetchProductionExecutionAuthorizationRecordsFromApi();
    await createProductionExecutionAuthorizationRecordViaApi({
      executionReadinessRecordId: "production-execution-readiness-record-ndb-1",
    });
    await fetchProductionChangeTicketLockRecordsFromApi();
    await createProductionChangeTicketLockRecordViaApi({
      executionAuthorizationRecordId: "production-execution-authorization-record-ndb-1",
    });
    await fetchProductionFinalExecutionPacketRecordsFromApi();
    await createProductionFinalExecutionPacketRecordViaApi({
      changeTicketLockRecordId: "production-change-ticket-lock-record-ndb-1",
    });
    await fetchProductionExecutionHoldPointRecordsFromApi();
    await createProductionExecutionHoldPointRecordViaApi({
      finalExecutionPacketRecordId: "production-final-execution-packet-record-ndb-1",
    });
    await fetchProductionExecutionOutcomeAuthorizationRecordsFromApi();
    await createProductionExecutionOutcomeAuthorizationRecordViaApi({
      executionHoldPointRecordId: "production-execution-hold-point-record-ndb-1",
    });
    await fetchProductionExecutionClosureAuthorizationRecordsFromApi();
    await createProductionExecutionClosureAuthorizationRecordViaApi({
      outcomeAuthorizationRecordId: "production-execution-outcome-authorization-record-ndb-1",
    });
    await fetchProductionExecutionClosurePacketRecordsFromApi();
    await createProductionExecutionClosurePacketRecordViaApi({
      closureAuthorizationRecordId: "production-execution-closure-authorization-record-ndb-1",
    });
    await fetchProductionExecutionArchivalHandoffRecordsFromApi();
    await createProductionExecutionArchivalHandoffRecordViaApi({
      closurePacketRecordId: "production-execution-closure-packet-record-ndb-1",
    });
    await fetchProductionExecutionRetentionAttestationRecordsFromApi();
    await createProductionExecutionRetentionAttestationRecordViaApi({
      archivalHandoffRecordId: "production-execution-archival-handoff-record-ndb-1",
    });
    await fetchProductionExecutionFinalArchiveCertificationRecordsFromApi();
    await createProductionExecutionFinalArchiveCertificationRecordViaApi({
      retentionAttestationRecordId: "production-execution-retention-attestation-record-ndb-1",
    });
    await fetchProductionExecutionCompletionDossierRecordsFromApi();
    await createProductionExecutionCompletionDossierRecordViaApi({
      finalArchiveCertificationRecordId: "production-execution-final-archive-certification-record-ndb-1",
    });
    await fetchProductionExecutionOperationsHandoverRecordsFromApi();
    await createProductionExecutionOperationsHandoverRecordViaApi({
      completionDossierRecordId: "production-execution-completion-dossier-record-ndb-1",
    });
    await fetchProductionExecutionSupportReadinessRecordsFromApi();
    await createProductionExecutionSupportReadinessRecordViaApi({
      operationsHandoverRecordId: "production-execution-operations-handover-record-ndb-1",
    });
    await fetchProductionExecutionServiceAcceptanceRecordsFromApi();
    await createProductionExecutionServiceAcceptanceRecordViaApi({
      supportReadinessRecordId: "production-execution-support-readiness-record-ndb-1",
    });
    await fetchProductionExecutionFinalTurnoverRecordsFromApi();
    await createProductionExecutionFinalTurnoverRecordViaApi({
      serviceAcceptanceRecordId: "production-execution-service-acceptance-record-ndb-1",
    });
    await fetchProductionExecutionOperationalClosureRecordsFromApi();
    await createProductionExecutionOperationalClosureRecordViaApi({
      finalTurnoverRecordId: "production-execution-final-turnover-record-ndb-1",
    });
    await fetchProductionExecutionPostImplementationReviewRecordsFromApi();
    await createProductionExecutionPostImplementationReviewRecordViaApi({
      operationalClosureRecordId: "production-execution-operational-closure-record-ndb-1",
    });
    await fetchProductionExecutionImprovementClosureRecordsFromApi();
    await createProductionExecutionImprovementClosureRecordViaApi({
      postImplementationReviewRecordId: "production-execution-post-implementation-review-record-ndb-1",
    });
    await fetchProductionExecutionFinalAcceptanceArchiveRecordsFromApi();
    await createProductionExecutionFinalAcceptanceArchiveRecordViaApi({
      improvementClosureRecordId: "production-execution-improvement-closure-record-ndb-1",
    });
    await fetchProductionExecutionReadinessArchiveHandoffRecordsFromApi();
    await createProductionExecutionReadinessArchiveHandoffRecordViaApi({
      finalAcceptanceArchiveRecordId: "production-execution-final-acceptance-archive-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRetrievalValidationRecordsFromApi();
    await createProductionExecutionArchiveRetrievalValidationRecordViaApi({
      readinessArchiveHandoffRecordId: "production-execution-readiness-archive-handoff-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryDrillRecordsFromApi();
    await createProductionExecutionArchiveRecoveryDrillRecordViaApi({
      archiveRetrievalValidationRecordId: "production-execution-archive-retrieval-validation-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryAcceptanceRecordsFromApi();
    await createProductionExecutionArchiveRecoveryAcceptanceRecordViaApi({
      archiveRecoveryDrillRecordId: "production-execution-archive-recovery-drill-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryClosureRecordsFromApi();
    await createProductionExecutionArchiveRecoveryClosureRecordViaApi({
      archiveRecoveryAcceptanceRecordId: "production-execution-archive-recovery-acceptance-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryAuditCertificationRecordsFromApi();
    await createProductionExecutionArchiveRecoveryAuditCertificationRecordViaApi({
      archiveRecoveryClosureRecordId: "production-execution-archive-recovery-closure-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordsFromApi();
    await createProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordViaApi({
      archiveRecoveryAuditCertificationRecordId:
        "production-execution-archive-recovery-audit-certification-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordsFromApi();
    await createProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordViaApi({
      finalComplianceArchiveRecordId: "production-execution-archive-recovery-final-compliance-archive-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryOperationalContinuityRecordsFromApi();
    await createProductionExecutionArchiveRecoveryOperationalContinuityRecordViaApi({
      evidenceCustodyClosureRecordId:
        "production-execution-archive-recovery-evidence-custody-closure-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryServiceManagementHandoffRecordsFromApi();
    await createProductionExecutionArchiveRecoveryServiceManagementHandoffRecordViaApi({
      operationalContinuityRecordId:
        "production-execution-archive-recovery-operational-continuity-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordsFromApi();
    await createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordViaApi({
      serviceManagementHandoffRecordId:
        "production-execution-archive-recovery-service-management-handoff-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordsFromApi();
    await createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordViaApi({
      supportOwnershipAcceptanceRecordId:
        "production-execution-archive-recovery-support-ownership-acceptance-record-ndb-1",
    });
    await fetchProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordsFromApi();
    await createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordViaApi({
      monitoringOwnershipClosureRecordId:
        "production-execution-archive-recovery-monitoring-ownership-closure-record-ndb-1",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/controlled-lab-release/runbooks", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/controlled-lab-release/runbooks",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("NDB") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/controlled-lab-release/windows", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/controlled-lab-release/windows",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-runbook-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/controlled-lab-release/window-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "/api/controlled-lab-release/window-exports",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-window-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/controlled-lab-release/evidence-reviews", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      8,
      "/api/controlled-lab-release/evidence-reviews",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-window-evidence-export-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(9, "/api/controlled-lab-release/proposal-envelopes", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      10,
      "/api/controlled-lab-release/proposal-envelopes",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-evidence-review-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(11, "/api/controlled-lab-release/proposal-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      12,
      "/api/controlled-lab-release/proposal-exports",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-execution-proposal-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(13, "/api/controlled-lab-release/execution-approvals", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      14,
      "/api/controlled-lab-release/execution-approvals",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-execution-proposal-export-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(15, "/api/controlled-lab-release/rehearsal-packets", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      16,
      "/api/controlled-lab-release/rehearsal-packets",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-execution-approval-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(17, "/api/controlled-lab-release/dry-run-checklists", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      18,
      "/api/controlled-lab-release/dry-run-checklists",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-rehearsal-packet-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(19, "/api/controlled-lab-release/evidence-ledgers", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      20,
      "/api/controlled-lab-release/evidence-ledgers",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-dry-run-checklist-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(21, "/api/controlled-lab-release/readiness-attestations", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      22,
      "/api/controlled-lab-release/readiness-attestations",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-evidence-ledger-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(23, "/api/execution-broker/queue", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      24,
      "/api/execution-broker/queue",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("ndb-controlled-lab-001") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(25, "/api/execution-broker/dispatch-approvals", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      26,
      "/api/execution-broker/dispatch-approvals",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("execution-broker-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(27, "/api/real-adapter/lab-scope-activations", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      28,
      "/api/real-adapter/lab-scope-activations",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("execution-broker-dispatch-approval-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(29, "/api/real-adapter/switch-reviews", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      30,
      "/api/real-adapter/switch-reviews",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("real-adapter-lab-scope-activation-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(31, "/api/real-adapter/switch-state-audit-packages", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      32,
      "/api/real-adapter/switch-state-audit-packages",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("manual-real-adapter-switch-review-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(33, "/api/real-adapter/controlled-switch-requests", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      34,
      "/api/real-adapter/controlled-switch-requests",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("real-adapter-switch-state-audit-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(35, "/api/real-adapter/switch-handoff-packages", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      36,
      "/api/real-adapter/switch-handoff-packages",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-switch-configuration-request-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(37, "/api/real-adapter/switch-outcome-records", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      38,
      "/api/real-adapter/switch-outcome-records",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("switch-execution-handoff-package-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(39, "/api/real-adapter/switch-closure-packages", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      40,
      "/api/real-adapter/switch-closure-packages",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("switch-execution-outcome-record-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(41, "/api/real-adapter/adapter-promotion-dossiers", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      42,
      "/api/real-adapter/adapter-promotion-dossiers",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("switch-closure-retention-package-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(43, "/api/real-adapter/production-authorization-packets", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      44,
      "/api/real-adapter/production-authorization-packets",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("adapter-promotion-readiness-dossier-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(45, "/api/real-adapter/production-change-freeze-records", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      46,
      "/api/real-adapter/production-change-freeze-records",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("production-adapter-authorization-packet-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(47, "/api/real-adapter/production-cab-handoff-packets", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      48,
      "/api/real-adapter/production-cab-handoff-packets",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("production-change-freeze-record-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(49, "/api/real-adapter/production-cab-decision-records", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      50,
      "/api/real-adapter/production-cab-decision-records",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("production-cab-handoff-packet-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      51,
      "/api/real-adapter/production-implementation-hold-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      52,
      "/api/real-adapter/production-implementation-hold-records",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("production-cab-decision-record-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      53,
      "/api/real-adapter/production-operator-assignment-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      54,
      "/api/real-adapter/production-operator-assignment-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-implementation-hold-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      55,
      "/api/real-adapter/production-execution-readiness-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      56,
      "/api/real-adapter/production-execution-readiness-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-operator-assignment-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      57,
      "/api/real-adapter/production-execution-authorization-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      58,
      "/api/real-adapter/production-execution-authorization-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-readiness-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      59,
      "/api/real-adapter/production-change-ticket-lock-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      60,
      "/api/real-adapter/production-change-ticket-lock-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-authorization-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      61,
      "/api/real-adapter/production-final-execution-packet-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      62,
      "/api/real-adapter/production-final-execution-packet-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-change-ticket-lock-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      63,
      "/api/real-adapter/production-execution-hold-point-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      64,
      "/api/real-adapter/production-execution-hold-point-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-final-execution-packet-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      65,
      "/api/real-adapter/production-execution-outcome-authorization-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      66,
      "/api/real-adapter/production-execution-outcome-authorization-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-hold-point-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      67,
      "/api/real-adapter/production-execution-closure-authorization-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      68,
      "/api/real-adapter/production-execution-closure-authorization-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-outcome-authorization-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      69,
      "/api/real-adapter/production-execution-closure-packet-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      70,
      "/api/real-adapter/production-execution-closure-packet-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-closure-authorization-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      71,
      "/api/real-adapter/production-execution-archival-handoff-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      72,
      "/api/real-adapter/production-execution-archival-handoff-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-closure-packet-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      73,
      "/api/real-adapter/production-execution-retention-attestation-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      74,
      "/api/real-adapter/production-execution-retention-attestation-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-archival-handoff-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      75,
      "/api/real-adapter/production-execution-final-archive-certification-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      76,
      "/api/real-adapter/production-execution-final-archive-certification-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-retention-attestation-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      77,
      "/api/real-adapter/production-execution-completion-dossier-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      78,
      "/api/real-adapter/production-execution-completion-dossier-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-final-archive-certification-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      79,
      "/api/real-adapter/production-execution-operations-handover-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      80,
      "/api/real-adapter/production-execution-operations-handover-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-completion-dossier-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      81,
      "/api/real-adapter/production-execution-support-readiness-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      82,
      "/api/real-adapter/production-execution-support-readiness-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-operations-handover-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      83,
      "/api/real-adapter/production-execution-service-acceptance-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      84,
      "/api/real-adapter/production-execution-service-acceptance-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-support-readiness-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      85,
      "/api/real-adapter/production-execution-final-turnover-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      86,
      "/api/real-adapter/production-execution-final-turnover-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-service-acceptance-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      87,
      "/api/real-adapter/production-execution-operational-closure-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      88,
      "/api/real-adapter/production-execution-operational-closure-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-final-turnover-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      89,
      "/api/real-adapter/production-execution-post-implementation-review-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      90,
      "/api/real-adapter/production-execution-post-implementation-review-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-operational-closure-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      91,
      "/api/real-adapter/production-execution-improvement-closure-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      92,
      "/api/real-adapter/production-execution-improvement-closure-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-post-implementation-review-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      93,
      "/api/real-adapter/production-execution-final-acceptance-archive-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      94,
      "/api/real-adapter/production-execution-final-acceptance-archive-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-improvement-closure-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      95,
      "/api/real-adapter/production-execution-readiness-archive-handoff-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      96,
      "/api/real-adapter/production-execution-readiness-archive-handoff-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-final-acceptance-archive-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      97,
      "/api/real-adapter/production-execution-archive-retrieval-validation-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      98,
      "/api/real-adapter/production-execution-archive-retrieval-validation-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-readiness-archive-handoff-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      99,
      "/api/real-adapter/production-execution-archive-recovery-drill-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      100,
      "/api/real-adapter/production-execution-archive-recovery-drill-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-archive-retrieval-validation-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      101,
      "/api/real-adapter/production-execution-archive-recovery-acceptance-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      102,
      "/api/real-adapter/production-execution-archive-recovery-acceptance-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-archive-recovery-drill-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      103,
      "/api/real-adapter/production-execution-archive-recovery-closure-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      104,
      "/api/real-adapter/production-execution-archive-recovery-closure-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-archive-recovery-acceptance-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      105,
      "/api/real-adapter/production-execution-archive-recovery-audit-certification-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      106,
      "/api/real-adapter/production-execution-archive-recovery-audit-certification-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-archive-recovery-closure-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      107,
      "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      108,
      "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-archive-recovery-audit-certification-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      109,
      "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      110,
      "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("production-execution-archive-recovery-final-compliance-archive-record-ndb-1"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      111,
      "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      112,
      "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          "production-execution-archive-recovery-evidence-custody-closure-record-ndb-1"
        ),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      113,
      "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      114,
      "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          "production-execution-archive-recovery-operational-continuity-record-ndb-1"
        ),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      115,
      "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      116,
      "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          "production-execution-archive-recovery-service-management-handoff-record-ndb-1"
        ),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      117,
      "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      118,
      "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          "production-execution-archive-recovery-support-ownership-acceptance-record-ndb-1"
        ),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      119,
      "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      120,
      "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          "production-execution-archive-recovery-monitoring-ownership-closure-record-ndb-1"
        ),
      })
    );
  });

  it("fetches and creates production readiness reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchProductionReadinessReviewsFromApi();
    await createProductionReadinessReviewViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/production-readiness/reviews", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/production-readiness/reviews",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates private-cloud operations and audit exports", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchLifecycleOperationsFromApi();
    await createLifecycleOperationViaApi({ environmentName: "payments-dev", operation: "Extend" });
    await fetchAuditExportsFromApi();
    await fetchAuditRetentionDiagnosticsFromApi();
    await createAuditExportViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/private-cloud/lifecycle-operations", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/private-cloud/lifecycle-operations",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("payments-dev") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/audit-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/audit/retention", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "/api/audit-exports",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches provider inventory and requests environment destroy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchResourceProfilesFromApi();
    await fetchPlatformConfigFromApi();
    await fetchProvisioningAdaptersFromApi();
    await requestEnvironmentDestroyViaApi("api-dev");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/resource-profiles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/platform/config", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/provisioning/adapters", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/environments/api-dev/destroy",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates adapter enablement records", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAdapterEnablementRecordsFromApi();
    await createAdapterEnablementRecordViaApi({ provider: "NCI", rollbackOwner: "Cloud Operations" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/adapter-enablement/records", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/adapter-enablement/records",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("Cloud Operations") })
    );
  });

  it("fetches and updates registry governance records", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPolicyBundlesFromApi();
    await fetchTemplateRegistryFromApi();
    await runTemplateRegistryActionViaApi("regulated-db", "submit");
    await runResourceProfileActionViaApi("nus-object-dev", "approve");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/policy-bundles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/registry/templates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/registry/templates/regulated-db/submit",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/resource-profiles/nus-object-dev/approve",
      expect.objectContaining({ method: "POST" })
    );
  });
});

function okResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  };
}
