import {
  Activity,
  Archive,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Code2,
  ExternalLink,
  Gauge,
  Layers3,
  LockKeyhole,
  Network,
  Pencil,
  Play,
  RefreshCw,
  ScrollText,
  Settings,
  ShieldCheck,
  TerminalSquare,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import cloudVisual from "./assets/developer-cloud-visual.png";
import primaryLogo from "./assets/logo-primary.svg";
import {
  allTargets,
  integrations,
  provisioningEvents,
  targetIcons,
  templates,
  type AdapterEnablementRecord,
  type AhvControlledProvisioningRun,
  type AhvCreateAdapterContractReview,
  type AuditExportRecord,
  type AuditRetentionDiagnostics,
  type ControlledLabExecutionApprovalGate,
  type ControlledLabDryRunExecutionChecklist,
  type ControlledLabExecutionEvidenceLedger,
  type ControlledLabExecutionReadinessAttestation,
  type ControlledLabExecutionRehearsalPacket,
  type ControlledLabDryRunWindowRecord,
  type ControlledLabReleaseRunbookRecord,
  type CredentialReferenceDiagnostic,
  type Environment,
  type ApprovalRequest,
  type ControlledProvisioningGate,
  type ControlledCreateAuthorizationEnvelope,
  type ControlPlaneJob,
  type ExecutionBrokerDispatchApproval,
  type ExecutionBrokerQueueRecord,
  type Integration,
  type IntegrationConfig,
  type LabEvidenceReviewRecord,
  type LabExecutionProposalEnvelope,
  type LabExecutionProposalExportRecord,
  type LabWindowEvidenceExportRecord,
  type JobState,
  type LabAdapterSnapshot,
  type LabAuthorizationScope,
  type LabScopeDiagnostics,
  type LifecycleOperationKind,
  type LifecycleOperationRecord,
  type ManualRealAdapterSwitchReview,
  platformConfig as defaultPlatformConfig,
  policyBundles as defaultPolicyBundles,
  templateRegistry as defaultTemplateRegistry,
  type PlatformSession,
  type PlatformConfig,
  type PlatformServiceAdapterContractReview,
  type PlatformServiceKind,
  type PlatformServicePreflightRun,
  type PlatformServiceRequest,
  type PolicyBundle,
  type PrismInventoryImportResult,
  type PrismInventoryRecord,
  type ProvisioningAdapterReadiness,
  type ProductionReadinessReview,
  type ProviderReleaseGateRecord,
  type ProviderReleaseReadinessSummary,
  type RealAdapterLabScopeActivation,
  type ReleaseEvidenceExportRecord,
  type RegistryStatus,
  resourceProfiles as defaultResourceProfiles,
  type ResourceProfile,
  type RollbackDestroyProofRecord,
  type SessionDiagnostics,
  type SystemStatus,
  type TemplateRegistryEntry,
  type Target,
  type Template,
  type TemplateGovernance,
  type TemplateTier,
  type VmSandboxDryRunPlan,
  type VmSandboxDryRunRequest,
  type VmLifecycleProof,
  type View,
} from "./data/cloudStudioData";
import {
  estimateMonthlyCost,
  getProvisioningSnapshot,
  loadEnvironments,
  loadTemplateGovernance,
  saveEnvironments,
  saveTemplateGovernance,
  updateEnvironmentStatus,
  upsertRequestedEnvironment,
} from "./services/provisioningService";
import {
  checkApiHealth,
  createAdapterEnablementRecordViaApi,
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
  createExecutionBrokerDispatchApprovalViaApi,
  createExecutionBrokerQueueRecordViaApi,
  createLabEvidenceReviewViaApi,
  createLabExecutionProposalEnvelopeViaApi,
  createLabExecutionProposalExportViaApi,
  createLabWindowEvidenceExportViaApi,
  createManualRealAdapterSwitchReviewViaApi,
  createLabAuthorizationScopeViaApi,
  createLifecycleOperationViaApi,
  createControlledProvisioningGateViaApi,
  createControlledCreateAuthorizationEnvelopeViaApi,
  createEnvironmentViaApi,
  createPlatformServiceRequestViaApi,
  createPlatformServiceAdapterContractReviewViaApi,
  createPlatformServicePreflightRunViaApi,
  createProviderReleaseGateRecordViaApi,
  createProductionReadinessReviewViaApi,
  createRealAdapterLabScopeActivationViaApi,
  createReleaseEvidenceExportViaApi,
  createRollbackDestroyProofViaApi,
  createVmLifecycleProofViaApi,
  createVmSandboxDryRunViaApi,
  decideControlledProvisioningGateViaApi,
  decideApprovalViaApi,
  fetchAhvControlledProvisioningRunsFromApi,
  fetchAhvCreateAdapterContractReviewsFromApi,
  fetchAdapterEnablementRecordsFromApi,
  fetchAuditExportsFromApi,
  fetchAuditRetentionDiagnosticsFromApi,
  fetchCredentialReferenceDiagnosticsFromApi,
  fetchControlPlaneJobsFromApi,
  fetchControlledLabExecutionApprovalsFromApi,
  fetchControlledLabDryRunExecutionChecklistsFromApi,
  fetchControlledLabExecutionEvidenceLedgersFromApi,
  fetchControlledLabExecutionReadinessAttestationsFromApi,
  fetchControlledLabExecutionRehearsalPacketsFromApi,
  fetchControlledProvisioningGatesFromApi,
  fetchControlledCreateAuthorizationEnvelopesFromApi,
  fetchControlledLabDryRunWindowsFromApi,
  fetchControlledLabReleaseRunbooksFromApi,
  fetchEnvironmentsFromApi,
  fetchEnvironmentDetailFromApi,
  fetchExecutionBrokerDispatchApprovalsFromApi,
  fetchExecutionBrokerQueueRecordsFromApi,
  fetchApprovalsFromApi,
  fetchIntegrationConfigsFromApi,
  fetchIntegrationsFromApi,
  fetchLabAuthorizationScopesFromApi,
  fetchLabEvidenceReviewsFromApi,
  fetchLabExecutionProposalEnvelopesFromApi,
  fetchLabExecutionProposalExportsFromApi,
  fetchLabWindowEvidenceExportsFromApi,
  fetchLabScopeDiagnosticsFromApi,
  fetchManualRealAdapterSwitchReviewsFromApi,
  fetchLabAdaptersFromApi,
  fetchLifecycleOperationsFromApi,
  fetchPlatformConfigFromApi,
  fetchPlatformServiceAdapterContractReviewsFromApi,
  fetchPlatformServicePreflightRunsFromApi,
  fetchPlatformServiceRequestsFromApi,
  fetchProviderReleaseGateRecordsFromApi,
  fetchProviderReleaseReadinessSummaryFromApi,
  fetchPolicyBundlesFromApi,
  fetchRealAdapterLabScopeActivationsFromApi,
  fetchPrismInventoryFromApi,
  fetchProvisioningAdaptersFromApi,
  fetchProductionReadinessReviewsFromApi,
  fetchReleaseEvidenceExportsFromApi,
  fetchRollbackDestroyProofsFromApi,
  fetchResourceProfilesFromApi,
  fetchSessionFromApi,
  fetchSessionDiagnosticsFromApi,
  fetchSystemStatusFromApi,
  fetchTemplateRegistryFromApi,
  fetchVmSandboxDryRunsFromApi,
  fetchVmLifecycleProofsFromApi,
  requestEnvironmentDestroyViaApi,
  importPrismInventoryViaApi,
  runResourceProfileActionViaApi,
  runIntegrationCheckViaApi,
  runControlPlaneJobActionViaApi,
  runLabDiscoveryViaApi,
  runTemplateRegistryActionViaApi,
  saveIntegrationConfigViaApi,
  type ApiHealth,
  type EnvironmentDetail,
} from "./services/cloudStudioApi";

type AdminTab = "overview" | "providers" | "control" | "operations" | "governance" | "templates";

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [selectedTargets, setSelectedTargets] = useState<Target[]>(templates[0].targets);
  const [environmentName, setEnvironmentName] = useState("checkout-api-dev");
  const [region, setRegion] = useState("Berlin Lab");
  const [jobState, setJobState] = useState<JobState>("Idle");
  const [jobStep, setJobStep] = useState(0);
  const [environments, setEnvironments] = useState<Environment[]>(() => loadEnvironments());
  const [runtimeIntegrations, setRuntimeIntegrations] = useState<Integration[]>(integrations);
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig[]>(() =>
    deriveMockIntegrationConfigs(integrations)
  );
  const [credentialDiagnostics, setCredentialDiagnostics] = useState<CredentialReferenceDiagnostic[]>(() =>
    createMockCredentialDiagnostics(deriveMockIntegrationConfigs(integrations))
  );
  const [session, setSession] = useState<PlatformSession>(mockSession);
  const [sessionDiagnostics, setSessionDiagnostics] = useState<SessionDiagnostics>(() =>
    createMockSessionDiagnostics(mockSession)
  );
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(() =>
    createMockSystemStatus(mockSession, deriveMockIntegrationConfigs(integrations), deriveMockLabAdapters(integrations))
  );
  const [labAdapters, setLabAdapters] = useState<LabAdapterSnapshot[]>(() => deriveMockLabAdapters(integrations));
  const [labAuthorizationScopes, setLabAuthorizationScopes] = useState<LabAuthorizationScope[]>([]);
  const [labScopeDiagnostics, setLabScopeDiagnostics] = useState<LabScopeDiagnostics>(() =>
    createMockLabScopeDiagnostics([])
  );
  const [prismInventory, setPrismInventory] = useState<PrismInventoryRecord[]>([]);
  const [prismInventoryImport, setPrismInventoryImport] = useState<PrismInventoryImportResult | undefined>();
  const [resourceProfiles, setResourceProfiles] = useState<ResourceProfile[]>(defaultResourceProfiles);
  const [policyBundles, setPolicyBundles] = useState<PolicyBundle[]>(defaultPolicyBundles);
  const [templateRegistry, setTemplateRegistry] = useState<TemplateRegistryEntry[]>(defaultTemplateRegistry);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(defaultPlatformConfig);
  const [provisioningAdapters, setProvisioningAdapters] = useState<ProvisioningAdapterReadiness[]>(() =>
    deriveMockProvisioningAdapters(integrations)
  );
  const [adapterEnablementRecords, setAdapterEnablementRecords] = useState<AdapterEnablementRecord[]>([]);
  const [controlPlaneJobs, setControlPlaneJobs] = useState<ControlPlaneJob[]>([]);
  const [vmSandboxDryRuns, setVmSandboxDryRuns] = useState<VmSandboxDryRunPlan[]>([]);
  const [controlledProvisioningGates, setControlledProvisioningGates] = useState<ControlledProvisioningGate[]>([]);
  const [controlledCreateAuthorizationEnvelopes, setControlledCreateAuthorizationEnvelopes] = useState<ControlledCreateAuthorizationEnvelope[]>([]);
  const [platformServiceRequests, setPlatformServiceRequests] = useState<PlatformServiceRequest[]>([]);
  const [platformServicePreflightRuns, setPlatformServicePreflightRuns] = useState<PlatformServicePreflightRun[]>([]);
  const [platformServiceAdapterContractReviews, setPlatformServiceAdapterContractReviews] = useState<PlatformServiceAdapterContractReview[]>([]);
  const [providerReleaseGateRecords, setProviderReleaseGateRecords] = useState<ProviderReleaseGateRecord[]>([]);
  const [providerReleaseReadinessSummary, setProviderReleaseReadinessSummary] = useState<ProviderReleaseReadinessSummary>(() =>
    createMockProviderReleaseReadinessSummary([])
  );
  const [releaseEvidenceExports, setReleaseEvidenceExports] = useState<ReleaseEvidenceExportRecord[]>([]);
  const [controlledLabReleaseRunbooks, setControlledLabReleaseRunbooks] = useState<ControlledLabReleaseRunbookRecord[]>([]);
  const [controlledLabDryRunWindows, setControlledLabDryRunWindows] = useState<ControlledLabDryRunWindowRecord[]>([]);
  const [labWindowEvidenceExports, setLabWindowEvidenceExports] = useState<LabWindowEvidenceExportRecord[]>([]);
  const [labEvidenceReviews, setLabEvidenceReviews] = useState<LabEvidenceReviewRecord[]>([]);
  const [labExecutionProposalEnvelopes, setLabExecutionProposalEnvelopes] = useState<LabExecutionProposalEnvelope[]>([]);
  const [labExecutionProposalExports, setLabExecutionProposalExports] = useState<LabExecutionProposalExportRecord[]>([]);
  const [controlledLabExecutionApprovals, setControlledLabExecutionApprovals] = useState<ControlledLabExecutionApprovalGate[]>([]);
  const [controlledLabExecutionRehearsalPackets, setControlledLabExecutionRehearsalPackets] = useState<ControlledLabExecutionRehearsalPacket[]>([]);
  const [controlledLabDryRunExecutionChecklists, setControlledLabDryRunExecutionChecklists] = useState<ControlledLabDryRunExecutionChecklist[]>([]);
  const [controlledLabExecutionEvidenceLedgers, setControlledLabExecutionEvidenceLedgers] = useState<ControlledLabExecutionEvidenceLedger[]>([]);
  const [controlledLabExecutionReadinessAttestations, setControlledLabExecutionReadinessAttestations] = useState<ControlledLabExecutionReadinessAttestation[]>([]);
  const [executionBrokerQueueRecords, setExecutionBrokerQueueRecords] = useState<ExecutionBrokerQueueRecord[]>([]);
  const [executionBrokerDispatchApprovals, setExecutionBrokerDispatchApprovals] = useState<ExecutionBrokerDispatchApproval[]>([]);
  const [realAdapterLabScopeActivations, setRealAdapterLabScopeActivations] = useState<RealAdapterLabScopeActivation[]>([]);
  const [manualRealAdapterSwitchReviews, setManualRealAdapterSwitchReviews] = useState<ManualRealAdapterSwitchReview[]>([]);
  const [vmLifecycleProofs, setVmLifecycleProofs] = useState<VmLifecycleProof[]>([]);
  const [rollbackDestroyProofs, setRollbackDestroyProofs] = useState<RollbackDestroyProofRecord[]>([]);
  const [ahvCreateAdapterContractReviews, setAhvCreateAdapterContractReviews] = useState<AhvCreateAdapterContractReview[]>([]);
  const [ahvControlledProvisioningRuns, setAhvControlledProvisioningRuns] = useState<AhvControlledProvisioningRun[]>([]);
  const [productionReadinessReviews, setProductionReadinessReviews] = useState<ProductionReadinessReview[]>([]);
  const [lifecycleOperations, setLifecycleOperations] = useState<LifecycleOperationRecord[]>([]);
  const [auditExports, setAuditExports] = useState<AuditExportRecord[]>([]);
  const [auditRetentionDiagnostics, setAuditRetentionDiagnostics] = useState<AuditRetentionDiagnostics>(() =>
    createMockAuditRetentionDiagnostics()
  );
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => deriveMockApprovals(loadEnvironments()));
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState("payments-dev");
  const [environmentDetail, setEnvironmentDetail] = useState<EnvironmentDetail | null>(null);
  const [templateGovernance, setTemplateGovernance] = useState<TemplateGovernance>(() =>
    loadTemplateGovernance(templates)
  );
  const [apiHealth, setApiHealth] = useState<ApiHealth>({ mode: "mock", label: "Checking API" });
  const [requestError, setRequestError] = useState("");

  const selectedTemplate = enrichTemplate(templates.find((template) => template.id === selectedTemplateId) ?? templates[0], templateGovernance);
  const estimatedCost = useMemo(() => estimateMonthlyCost(selectedTemplate, selectedTargets), [selectedTargets, selectedTemplate]);

  useEffect(() => {
    if (apiHealth.mode === "mock") {
      saveEnvironments(environments);
      setApprovals(deriveMockApprovals(environments));
    }
  }, [apiHealth.mode, environments]);

  useEffect(() => {
    saveTemplateGovernance(templateGovernance);
  }, [templateGovernance]);

  useEffect(() => {
    if (apiHealth.mode === "mock") {
      setSystemStatus(createMockSystemStatus(session, integrationConfigs, labAdapters));
      setCredentialDiagnostics(createMockCredentialDiagnostics(integrationConfigs));
    }
  }, [apiHealth.mode, integrationConfigs, labAdapters, session]);

  useEffect(() => {
    let active = true;

    async function hydrateFromApi() {
      const health = await checkApiHealth();
      if (!active) {
        return;
      }

      setApiHealth(health);

      if (health.mode === "api") {
        try {
          const [
            apiEnvironments,
            apiIntegrations,
            apiApprovals,
            apiIntegrationConfigs,
            apiCredentialDiagnostics,
            apiSession,
            apiSessionDiagnostics,
            apiSystemStatus,
            apiLabAdapters,
            apiLabAuthorizationScopes,
            apiLabScopeDiagnostics,
            apiPrismInventory,
            apiControlPlaneJobs,
            apiResourceProfiles,
            apiPolicyBundles,
            apiTemplateRegistry,
            apiPlatformConfig,
            apiProvisioningAdapters,
            apiAdapterEnablementRecords,
            apiVmSandboxDryRuns,
            apiControlledProvisioningGates,
            apiControlledCreateAuthorizationEnvelopes,
            apiPlatformServiceRequests,
            apiPlatformServicePreflightRuns,
            apiPlatformServiceAdapterContractReviews,
            apiProviderReleaseGateRecords,
            apiProviderReleaseReadinessSummary,
            apiReleaseEvidenceExports,
            apiControlledLabReleaseRunbooks,
            apiControlledLabDryRunWindows,
            apiLabWindowEvidenceExports,
            apiLabEvidenceReviews,
            apiLabExecutionProposalEnvelopes,
            apiLabExecutionProposalExports,
            apiControlledLabExecutionApprovals,
            apiControlledLabExecutionRehearsalPackets,
            apiControlledLabDryRunExecutionChecklists,
            apiControlledLabExecutionEvidenceLedgers,
            apiControlledLabExecutionReadinessAttestations,
            apiExecutionBrokerQueueRecords,
            apiExecutionBrokerDispatchApprovals,
            apiRealAdapterLabScopeActivations,
            apiManualRealAdapterSwitchReviews,
            apiVmLifecycleProofs,
            apiRollbackDestroyProofs,
            apiAhvCreateAdapterContractReviews,
            apiAhvControlledProvisioningRuns,
            apiProductionReadinessReviews,
            apiLifecycleOperations,
            apiAuditExports,
            apiAuditRetentionDiagnostics,
          ] = await Promise.all([
            fetchEnvironmentsFromApi(),
            fetchIntegrationsFromApi(),
            fetchApprovalsFromApi(),
            fetchIntegrationConfigsFromApi(),
            fetchCredentialReferenceDiagnosticsFromApi(),
            fetchSessionFromApi(),
            fetchSessionDiagnosticsFromApi(),
            fetchSystemStatusFromApi(),
            fetchLabAdaptersFromApi(),
            fetchLabAuthorizationScopesFromApi(),
            fetchLabScopeDiagnosticsFromApi(),
            fetchPrismInventoryFromApi(),
            fetchControlPlaneJobsFromApi(),
            fetchResourceProfilesFromApi(),
            fetchPolicyBundlesFromApi(),
            fetchTemplateRegistryFromApi(),
            fetchPlatformConfigFromApi(),
            fetchProvisioningAdaptersFromApi(),
            fetchAdapterEnablementRecordsFromApi(),
            fetchVmSandboxDryRunsFromApi(),
            fetchControlledProvisioningGatesFromApi(),
            fetchControlledCreateAuthorizationEnvelopesFromApi(),
            fetchPlatformServiceRequestsFromApi(),
            fetchPlatformServicePreflightRunsFromApi(),
            fetchPlatformServiceAdapterContractReviewsFromApi(),
            fetchProviderReleaseGateRecordsFromApi(),
            fetchProviderReleaseReadinessSummaryFromApi(),
            fetchReleaseEvidenceExportsFromApi(),
            fetchControlledLabReleaseRunbooksFromApi(),
            fetchControlledLabDryRunWindowsFromApi(),
            fetchLabWindowEvidenceExportsFromApi(),
            fetchLabEvidenceReviewsFromApi(),
            fetchLabExecutionProposalEnvelopesFromApi(),
            fetchLabExecutionProposalExportsFromApi(),
            fetchControlledLabExecutionApprovalsFromApi(),
            fetchControlledLabExecutionRehearsalPacketsFromApi(),
            fetchControlledLabDryRunExecutionChecklistsFromApi(),
            fetchControlledLabExecutionEvidenceLedgersFromApi(),
            fetchControlledLabExecutionReadinessAttestationsFromApi(),
            fetchExecutionBrokerQueueRecordsFromApi(),
            fetchExecutionBrokerDispatchApprovalsFromApi(),
            fetchRealAdapterLabScopeActivationsFromApi(),
            fetchManualRealAdapterSwitchReviewsFromApi(),
            fetchVmLifecycleProofsFromApi(),
            fetchRollbackDestroyProofsFromApi(),
            fetchAhvCreateAdapterContractReviewsFromApi(),
            fetchAhvControlledProvisioningRunsFromApi(),
            fetchProductionReadinessReviewsFromApi(),
            fetchLifecycleOperationsFromApi(),
            fetchAuditExportsFromApi(),
            fetchAuditRetentionDiagnosticsFromApi(),
          ]);
          if (active) {
            setEnvironments(apiEnvironments);
            setRuntimeIntegrations(apiIntegrations);
            setApprovals(apiApprovals);
            setIntegrationConfigs(apiIntegrationConfigs);
            setCredentialDiagnostics(apiCredentialDiagnostics);
            setSession(apiSession);
            setSessionDiagnostics(apiSessionDiagnostics);
            setSystemStatus(apiSystemStatus);
            setLabAdapters(apiLabAdapters);
            setLabAuthorizationScopes(apiLabAuthorizationScopes);
            setLabScopeDiagnostics(apiLabScopeDiagnostics);
            setPrismInventory(apiPrismInventory.records);
            setPrismInventoryImport(apiPrismInventory.lastImport);
            setControlPlaneJobs(apiControlPlaneJobs);
            setResourceProfiles(apiResourceProfiles);
            setPolicyBundles(apiPolicyBundles);
            setTemplateRegistry(apiTemplateRegistry);
            setPlatformConfig(apiPlatformConfig);
            setProvisioningAdapters(apiProvisioningAdapters);
            setAdapterEnablementRecords(apiAdapterEnablementRecords);
            setVmSandboxDryRuns(apiVmSandboxDryRuns);
            setControlledProvisioningGates(apiControlledProvisioningGates);
            setControlledCreateAuthorizationEnvelopes(apiControlledCreateAuthorizationEnvelopes);
            setPlatformServiceRequests(apiPlatformServiceRequests);
            setPlatformServicePreflightRuns(apiPlatformServicePreflightRuns);
            setPlatformServiceAdapterContractReviews(apiPlatformServiceAdapterContractReviews);
            setProviderReleaseGateRecords(apiProviderReleaseGateRecords);
            setProviderReleaseReadinessSummary(apiProviderReleaseReadinessSummary);
            setReleaseEvidenceExports(apiReleaseEvidenceExports);
            setControlledLabReleaseRunbooks(apiControlledLabReleaseRunbooks);
            setControlledLabDryRunWindows(apiControlledLabDryRunWindows);
            setLabWindowEvidenceExports(apiLabWindowEvidenceExports);
            setLabEvidenceReviews(apiLabEvidenceReviews);
            setLabExecutionProposalEnvelopes(apiLabExecutionProposalEnvelopes);
            setLabExecutionProposalExports(apiLabExecutionProposalExports);
            setControlledLabExecutionApprovals(apiControlledLabExecutionApprovals);
            setControlledLabExecutionRehearsalPackets(apiControlledLabExecutionRehearsalPackets);
            setControlledLabDryRunExecutionChecklists(apiControlledLabDryRunExecutionChecklists);
            setControlledLabExecutionEvidenceLedgers(apiControlledLabExecutionEvidenceLedgers);
            setControlledLabExecutionReadinessAttestations(apiControlledLabExecutionReadinessAttestations);
            setExecutionBrokerQueueRecords(apiExecutionBrokerQueueRecords);
            setExecutionBrokerDispatchApprovals(apiExecutionBrokerDispatchApprovals);
            setRealAdapterLabScopeActivations(apiRealAdapterLabScopeActivations);
            setManualRealAdapterSwitchReviews(apiManualRealAdapterSwitchReviews);
            setVmLifecycleProofs(apiVmLifecycleProofs);
            setRollbackDestroyProofs(apiRollbackDestroyProofs);
            setAhvCreateAdapterContractReviews(apiAhvCreateAdapterContractReviews);
            setAhvControlledProvisioningRuns(apiAhvControlledProvisioningRuns);
            setProductionReadinessReviews(apiProductionReadinessReviews);
            setLifecycleOperations(apiLifecycleOperations);
            setAuditExports(apiAuditExports);
            setAuditRetentionDiagnostics(apiAuditRetentionDiagnostics);
            setSelectedEnvironmentName(apiEnvironments[0]?.name ?? "");
          }
        } catch {
          if (active) {
            setApiHealth({ mode: "mock", label: "Browser mock mode" });
            setApprovals(deriveMockApprovals(environments));
          }
        }
      }
    }

    void hydrateFromApi();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (jobState !== "Queued" && jobState !== "Running") {
      return;
    }

    const snapshot = getProvisioningSnapshot(jobStep, selectedTargets);
    if (snapshot.complete) {
      setJobState(snapshot.jobState);
      const nextEnvironmentStatus = snapshot.environmentStatus;
      if (nextEnvironmentStatus) {
        setEnvironments((current) => updateEnvironmentStatus(current, environmentName, nextEnvironmentStatus));
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      setJobStep((current) => current + 1);
      setJobState("Running");
    }, provisioningEvents[jobStep].durationMs);

    return () => window.clearTimeout(timeout);
  }, [environmentName, jobState, jobStep, selectedTargets]);

  function selectTemplate(id: string) {
    const template = templates.find((item) => item.id === id) ?? templates[0];
    setSelectedTemplateId(template.id);
    setSelectedTargets(template.targets);
    setView("create");
  }

  function openTemplate(id: string) {
    setSelectedTemplateId(id);
    setView("template");
  }

  function toggleTarget(target: Target) {
    setSelectedTargets((current) =>
      current.includes(target) ? current.filter((item) => item !== target) : [...current, target]
    );
  }

  async function launchEnvironment() {
    setRequestError("");
    setJobState("Queued");
    setJobStep(0);

    if (apiHealth.mode === "api") {
      try {
        const result = await createEnvironmentViaApi({
          name: environmentName,
          templateId: selectedTemplate.id,
          owner: "demo.user",
          region,
          targets: selectedTargets,
        });
        setEnvironments((current) => [
          result.environment,
          ...current.filter((environment) => environment.name !== result.environment.name),
        ]);
        setSelectedEnvironmentName(result.environment.name);
        setControlPlaneJobs(await fetchControlPlaneJobsFromApi());
        if (result.approval) {
          setApprovals((current) => [result.approval as ApprovalRequest, ...current]);
        }
        if (result.environment.status === "Needs approval") {
          setJobState("Approval");
        }
      } catch {
        setRequestError("API request failed. Falling back to browser mock mode for this request.");
        setApiHealth({ mode: "mock", label: "Browser mock mode" });
        setEnvironments((current) => createMockEnvironment(current));
      }
    } else {
      setEnvironments((current) => {
        const next = createMockEnvironment(current);
        const created = next.find((environment) => environment.name === environmentName);
        if (created) {
          setControlPlaneJobs((jobs) => [
            createMockControlPlaneJob(created, selectedTemplate, selectedTargets),
            ...jobs.filter((job) => job.environmentName !== created.name),
          ]);
        }
        return next;
      });
    }

    setView("environment");
  }

  function createMockEnvironment(current: Environment[]) {
    return upsertRequestedEnvironment(current, {
      name: environmentName,
      template: selectedTemplate.name,
      owner: "demo.user",
      region,
      cost: estimatedCost,
    });
  }

  async function refreshApiState(environmentNameToRefresh = selectedEnvironmentName) {
    if (apiHealth.mode !== "api") {
      return;
    }

    const [
      apiEnvironments,
      apiIntegrations,
      apiApprovals,
      apiIntegrationConfigs,
      apiCredentialDiagnostics,
      apiSession,
      apiSessionDiagnostics,
      apiSystemStatus,
      apiLabAdapters,
      apiLabAuthorizationScopes,
      apiLabScopeDiagnostics,
      apiPrismInventory,
      apiControlPlaneJobs,
      apiResourceProfiles,
      apiPolicyBundles,
      apiTemplateRegistry,
      apiPlatformConfig,
      apiProvisioningAdapters,
      apiAdapterEnablementRecords,
      apiVmSandboxDryRuns,
      apiControlledProvisioningGates,
      apiControlledCreateAuthorizationEnvelopes,
      apiPlatformServiceRequests,
      apiPlatformServicePreflightRuns,
      apiPlatformServiceAdapterContractReviews,
      apiProviderReleaseGateRecords,
      apiProviderReleaseReadinessSummary,
      apiReleaseEvidenceExports,
      apiControlledLabReleaseRunbooks,
      apiControlledLabDryRunWindows,
      apiLabWindowEvidenceExports,
      apiLabEvidenceReviews,
      apiLabExecutionProposalEnvelopes,
      apiLabExecutionProposalExports,
      apiControlledLabExecutionApprovals,
      apiControlledLabExecutionRehearsalPackets,
      apiControlledLabDryRunExecutionChecklists,
      apiControlledLabExecutionEvidenceLedgers,
      apiControlledLabExecutionReadinessAttestations,
      apiExecutionBrokerQueueRecords,
      apiExecutionBrokerDispatchApprovals,
      apiRealAdapterLabScopeActivations,
      apiManualRealAdapterSwitchReviews,
      apiVmLifecycleProofs,
      apiRollbackDestroyProofs,
      apiAhvCreateAdapterContractReviews,
      apiAhvControlledProvisioningRuns,
      apiProductionReadinessReviews,
      apiLifecycleOperations,
      apiAuditExports,
      apiAuditRetentionDiagnostics,
    ] = await Promise.all([
      fetchEnvironmentsFromApi(),
      fetchIntegrationsFromApi(),
      fetchApprovalsFromApi(),
      fetchIntegrationConfigsFromApi(),
      fetchCredentialReferenceDiagnosticsFromApi(),
      fetchSessionFromApi(),
      fetchSessionDiagnosticsFromApi(),
      fetchSystemStatusFromApi(),
      fetchLabAdaptersFromApi(),
      fetchLabAuthorizationScopesFromApi(),
      fetchLabScopeDiagnosticsFromApi(),
      fetchPrismInventoryFromApi(),
      fetchControlPlaneJobsFromApi(),
      fetchResourceProfilesFromApi(),
      fetchPolicyBundlesFromApi(),
      fetchTemplateRegistryFromApi(),
      fetchPlatformConfigFromApi(),
      fetchProvisioningAdaptersFromApi(),
      fetchAdapterEnablementRecordsFromApi(),
      fetchVmSandboxDryRunsFromApi(),
      fetchControlledProvisioningGatesFromApi(),
      fetchControlledCreateAuthorizationEnvelopesFromApi(),
      fetchPlatformServiceRequestsFromApi(),
      fetchPlatformServicePreflightRunsFromApi(),
      fetchPlatformServiceAdapterContractReviewsFromApi(),
      fetchProviderReleaseGateRecordsFromApi(),
      fetchProviderReleaseReadinessSummaryFromApi(),
      fetchReleaseEvidenceExportsFromApi(),
      fetchControlledLabReleaseRunbooksFromApi(),
      fetchControlledLabDryRunWindowsFromApi(),
      fetchLabWindowEvidenceExportsFromApi(),
      fetchLabEvidenceReviewsFromApi(),
      fetchLabExecutionProposalEnvelopesFromApi(),
      fetchLabExecutionProposalExportsFromApi(),
      fetchControlledLabExecutionApprovalsFromApi(),
      fetchControlledLabExecutionRehearsalPacketsFromApi(),
      fetchControlledLabDryRunExecutionChecklistsFromApi(),
      fetchControlledLabExecutionEvidenceLedgersFromApi(),
      fetchControlledLabExecutionReadinessAttestationsFromApi(),
      fetchExecutionBrokerQueueRecordsFromApi(),
      fetchExecutionBrokerDispatchApprovalsFromApi(),
      fetchRealAdapterLabScopeActivationsFromApi(),
      fetchManualRealAdapterSwitchReviewsFromApi(),
      fetchVmLifecycleProofsFromApi(),
      fetchRollbackDestroyProofsFromApi(),
      fetchAhvCreateAdapterContractReviewsFromApi(),
      fetchAhvControlledProvisioningRunsFromApi(),
      fetchProductionReadinessReviewsFromApi(),
      fetchLifecycleOperationsFromApi(),
      fetchAuditExportsFromApi(),
      fetchAuditRetentionDiagnosticsFromApi(),
    ]);
    setEnvironments(apiEnvironments);
    setRuntimeIntegrations(apiIntegrations);
    setApprovals(apiApprovals);
    setIntegrationConfigs(apiIntegrationConfigs);
    setCredentialDiagnostics(apiCredentialDiagnostics);
    setSession(apiSession);
    setSessionDiagnostics(apiSessionDiagnostics);
    setSystemStatus(apiSystemStatus);
    setLabAdapters(apiLabAdapters);
    setLabAuthorizationScopes(apiLabAuthorizationScopes);
    setLabScopeDiagnostics(apiLabScopeDiagnostics);
    setPrismInventory(apiPrismInventory.records);
    setPrismInventoryImport(apiPrismInventory.lastImport);
    setControlPlaneJobs(apiControlPlaneJobs);
    setResourceProfiles(apiResourceProfiles);
    setPolicyBundles(apiPolicyBundles);
    setTemplateRegistry(apiTemplateRegistry);
    setPlatformConfig(apiPlatformConfig);
    setProvisioningAdapters(apiProvisioningAdapters);
    setAdapterEnablementRecords(apiAdapterEnablementRecords);
    setVmSandboxDryRuns(apiVmSandboxDryRuns);
    setControlledProvisioningGates(apiControlledProvisioningGates);
    setControlledCreateAuthorizationEnvelopes(apiControlledCreateAuthorizationEnvelopes);
    setPlatformServiceRequests(apiPlatformServiceRequests);
    setPlatformServicePreflightRuns(apiPlatformServicePreflightRuns);
    setPlatformServiceAdapterContractReviews(apiPlatformServiceAdapterContractReviews);
    setProviderReleaseGateRecords(apiProviderReleaseGateRecords);
    setProviderReleaseReadinessSummary(apiProviderReleaseReadinessSummary);
    setReleaseEvidenceExports(apiReleaseEvidenceExports);
    setControlledLabReleaseRunbooks(apiControlledLabReleaseRunbooks);
    setControlledLabDryRunWindows(apiControlledLabDryRunWindows);
    setLabWindowEvidenceExports(apiLabWindowEvidenceExports);
    setLabEvidenceReviews(apiLabEvidenceReviews);
    setLabExecutionProposalEnvelopes(apiLabExecutionProposalEnvelopes);
    setLabExecutionProposalExports(apiLabExecutionProposalExports);
    setControlledLabExecutionApprovals(apiControlledLabExecutionApprovals);
    setControlledLabExecutionRehearsalPackets(apiControlledLabExecutionRehearsalPackets);
    setControlledLabDryRunExecutionChecklists(apiControlledLabDryRunExecutionChecklists);
    setControlledLabExecutionEvidenceLedgers(apiControlledLabExecutionEvidenceLedgers);
    setControlledLabExecutionReadinessAttestations(apiControlledLabExecutionReadinessAttestations);
    setExecutionBrokerQueueRecords(apiExecutionBrokerQueueRecords);
    setExecutionBrokerDispatchApprovals(apiExecutionBrokerDispatchApprovals);
    setRealAdapterLabScopeActivations(apiRealAdapterLabScopeActivations);
    setManualRealAdapterSwitchReviews(apiManualRealAdapterSwitchReviews);
    setVmLifecycleProofs(apiVmLifecycleProofs);
    setRollbackDestroyProofs(apiRollbackDestroyProofs);
    setAhvCreateAdapterContractReviews(apiAhvCreateAdapterContractReviews);
    setAhvControlledProvisioningRuns(apiAhvControlledProvisioningRuns);
    setProductionReadinessReviews(apiProductionReadinessReviews);
    setLifecycleOperations(apiLifecycleOperations);
    setAuditExports(apiAuditExports);
    setAuditRetentionDiagnostics(apiAuditRetentionDiagnostics);

    if (environmentNameToRefresh) {
      const detail = await fetchEnvironmentDetailFromApi(environmentNameToRefresh);
      setEnvironmentDetail(detail);
    }
  }

  async function openEnvironmentDetail(name: string) {
    setSelectedEnvironmentName(name);
    if (apiHealth.mode === "api") {
      try {
        setEnvironmentDetail(await fetchEnvironmentDetailFromApi(name));
      } catch {
        setEnvironmentDetail(createMockEnvironmentDetail(environments, approvals, name));
      }
    } else {
      setEnvironmentDetail(createMockEnvironmentDetail(environments, approvals, name));
    }
    setView("environmentDetail");
  }

  async function decideApproval(approvalId: string, decision: "approve" | "reject") {
    if (apiHealth.mode === "api") {
      const updated = await decideApprovalViaApi(approvalId, decision);
      await refreshApiState(updated.environmentName);
      return;
    }

    setApprovals((current) =>
      current.map((approval) =>
        approval.id === approvalId
          ? {
              ...approval,
              status: decision === "approve" ? "Approved" : "Rejected",
              decidedAt: new Date().toISOString(),
              decidedBy: "platform.admin",
            }
          : approval
      )
    );
    const approval = approvals.find((item) => item.id === approvalId);
    if (approval) {
      setEnvironments((current) =>
        updateEnvironmentStatus(current, approval.environmentName, decision === "approve" ? "Provisioning" : "Failed")
      );
      setEnvironmentDetail(
        createMockEnvironmentDetail(
          updateEnvironmentStatus(environments, approval.environmentName, decision === "approve" ? "Provisioning" : "Failed"),
          approvals,
          approval.environmentName
        )
      );
    }
  }

  async function saveIntegrationConfig(
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) {
    if (apiHealth.mode === "api") {
      const updated = await saveIntegrationConfigViaApi(integrationName, payload);
      setIntegrationConfigs((current) => replaceIntegrationConfig(current, updated));
      return;
    }

    setIntegrationConfigs((current) =>
      replaceIntegrationConfig(current, {
        ...(current.find((item) => item.name === integrationName) ?? createEmptyIntegrationConfig(integrationName)),
        ...payload,
        status: payload.endpoint || payload.credentialProfile ? "Configured" : "Not configured",
        message: "Configuration saved in browser mock mode.",
      })
    );
  }

  async function runIntegrationCheck(integrationName: string) {
    if (apiHealth.mode === "api") {
      const updated = await runIntegrationCheckViaApi(integrationName);
      setIntegrationConfigs((current) => replaceIntegrationConfig(current, updated));
      setSystemStatus(await fetchSystemStatusFromApi());
      return;
    }

    setIntegrationConfigs((current) => {
      const existing = current.find((item) => item.name === integrationName) ?? createEmptyIntegrationConfig(integrationName);
      const reachable = Boolean(existing.endpoint && existing.credentialProfile);
      return replaceIntegrationConfig(current, {
        ...existing,
        status: reachable ? "Reachable" : "Failed",
        lastCheckedAt: new Date().toISOString(),
        message: reachable
          ? `${integrationName} mock readiness check passed.`
          : `${integrationName} needs endpoint and credential profile values.`,
      });
    });
  }

  async function runLabDiscovery(adapterName: string) {
    if (apiHealth.mode === "api") {
      const updated = await runLabDiscoveryViaApi(adapterName);
      setLabAdapters((current) => replaceLabAdapter(current, updated));
      setSystemStatus(await fetchSystemStatusFromApi());
      return;
    }

    setLabAdapters((current) => {
      const adapter = current.find((item) => item.name === adapterName) ?? createEmptyLabAdapter(adapterName);
      const config = integrationConfigs.find((item) => item.name === adapterName);
      const readOnlyCandidate = adapterName === "NCI" && config?.status === "Reachable";
      const updated: LabAdapterSnapshot = {
        ...adapter,
        mode: readOnlyCandidate ? "Read-only candidate" : "Configured",
        inventoryCount: readOnlyCandidate ? 12 : 0,
        lastDiscoveryAt: new Date().toISOString(),
        message: readOnlyCandidate
          ? "Read-only Prism Central discovery simulated successfully. Provisioning remains disabled."
          : "Discovery requires a reachable integration config and documented lab scope.",
      };
      return replaceLabAdapter(current, updated);
    });
  }

  async function importPrismInventory() {
    if (apiHealth.mode === "api") {
      await importPrismInventoryViaApi();
      await refreshApiState();
      return;
    }

    const importedAt = new Date().toISOString();
    const records = createMockPrismInventoryRecords(platformConfig, importedAt);
    setPrismInventory(records);
    setPrismInventoryImport({
      adapter: "NCI",
      mode: "Mock read-only",
      readOnly: true,
      provisioningEnabled: false,
      importedAt,
      recordsImported: records.length,
      profileCandidates: records.filter((record) => record.profileCandidate).length,
      scope: {
        endpoint: platformConfig.prismCentralUrl || "mock://prism-central",
        credentialProfile: platformConfig.credentialReference,
        project: platformConfig.defaultProject,
        cluster: platformConfig.defaultCluster,
        network: platformConfig.networkProfile,
        authorizedScopeRef: "Browser mock mode / lab authorization pending",
        realAdapterEnabled: false,
      },
      evidence: "Browser mock Prism inventory import completed. No live endpoint was called.",
      mutationOperationsBlocked: ["create_vm", "clone_vm", "delete_vm", "power_on", "power_off", "update_network"],
    });
    setLabAdapters((current) =>
      replaceLabAdapter(current, {
        ...(current.find((item) => item.name === "NCI") ?? createEmptyLabAdapter("NCI")),
        mode: "Read-only candidate",
        inventoryCount: records.length,
        lastDiscoveryAt: importedAt,
        message: "Browser mock Prism inventory imported. Provisioning remains disabled.",
      })
    );
  }

  async function runControlPlaneJobAction(jobId: string, action: "advance" | "retry" | "fail") {
    if (apiHealth.mode === "api") {
      await runControlPlaneJobActionViaApi(jobId, action, "Manual failure simulation from admin console.");
      await refreshApiState();
      return;
    }

    setControlPlaneJobs((current) =>
      current.map((job) => (job.id === jobId ? transitionMockControlPlaneJob(job, action) : job))
    );
  }

  async function createVmSandboxDryRun() {
    const payload = {
      environmentName: "vm-sandbox-dry-run",
      owner: session.user,
      imageProfileId: "ahv-rocky-9-hardened",
      project: platformConfig.defaultProject,
      cluster: platformConfig.defaultCluster,
      network: platformConfig.networkProfile,
      category: "Lifecycle:30-day-expiry",
      cpu: 2,
      memoryGb: 8,
      diskGb: 80,
      expiryDays: 30,
    };

    if (apiHealth.mode === "api") {
      const plan = await createVmSandboxDryRunViaApi(payload);
      await refreshApiState();
      setVmSandboxDryRuns((current) => [plan, ...current.filter((item) => item.id !== plan.id)]);
      return;
    }

    setVmSandboxDryRuns((current) => [createMockVmSandboxDryRun(payload, resourceProfiles, platformConfig, templateRegistry, session.user), ...current]);
  }

  async function requestControlledProvisioningGate() {
    const latest = vmSandboxDryRuns[0];
    if (!latest) {
      await createVmSandboxDryRun();
      return;
    }

    if (apiHealth.mode === "api") {
      const gate = await createControlledProvisioningGateViaApi({ dryRunPlanId: latest.id });
      await refreshApiState();
      setControlledProvisioningGates((current) => [gate, ...current.filter((item) => item.id !== gate.id)]);
      return;
    }

    setControlledProvisioningGates((current) => [
      createMockControlledProvisioningGate(latest, rollbackDestroyProofs, session.user),
      ...current.filter((item) => item.dryRunPlanId !== latest.id),
    ]);
  }

  async function decideControlledProvisioningGate(gateId: string, decision: "approve" | "reject") {
    if (apiHealth.mode === "api") {
      const gate = await decideControlledProvisioningGateViaApi(
        gateId,
        decision,
        decision === "approve" ? "Operator approval recorded from Admin Control Plane." : "Operator rejected controlled create."
      );
      await refreshApiState();
      setControlledProvisioningGates((current) => current.map((item) => (item.id === gate.id ? gate : item)));
      return;
    }

    setControlledProvisioningGates((current) =>
      current.map((gate) =>
        gate.id === gateId
          ? evaluateMockControlledProvisioningGate({
              ...gate,
              approval: {
                status: decision === "approve" ? "Approved" : "Rejected",
                decidedBy: session.user,
                decidedAt: new Date().toISOString(),
                evidence:
                  decision === "approve"
                    ? "Operator approval recorded from Admin Control Plane."
                    : "Operator rejected controlled create.",
              },
              updatedAt: new Date().toISOString(),
            }, rollbackDestroyProofs)
          : gate
      )
    );
  }

  async function recordLabAuthorizationScope() {
    const payload = {
      pentestScopeReference: "Authorized lab scope / controlled provisioning test window",
      pentestScopeStructurallyValid: true,
      targetEnvironment: "controlled-vm-plan",
      providerCoverage: ["NCI" as const],
      targetEndpoints: ["prism-central-ref"],
      evidenceReferences: ["PENTEST_SCOPE_TEMPLATE.md", "operator-approval-record"],
      rollbackOwner: "Cloud Operations",
    };

    if (apiHealth.mode === "api") {
      const scope = await createLabAuthorizationScopeViaApi(payload);
      await refreshApiState();
      setLabAuthorizationScopes((current) => [scope, ...current.filter((item) => item.id !== scope.id)]);
      return;
    }

    setLabAuthorizationScopes((current) => {
      const next = [createMockLabAuthorizationScope(session.user, platformConfig), ...current];
      setLabScopeDiagnostics(createMockLabScopeDiagnostics(next));
      return next;
    });
  }

  async function recordVmLifecycleProof() {
    const gate = controlledProvisioningGates[0];
    if (!gate) {
      return;
    }

    const payload = {
      gateId: gate.id,
      rollbackVerified: true,
      destroyVerified: true,
      evidence: ["Operator observed controlled create, rollback, and destroy workflow evidence."],
    };

    if (apiHealth.mode === "api") {
      const proof = await createVmLifecycleProofViaApi(payload);
      await refreshApiState();
      setVmLifecycleProofs((current) => [proof, ...current.filter((item) => item.id !== proof.id)]);
      return;
    }

    setVmLifecycleProofs((current) => [createMockVmLifecycleProof(gate, session.user), ...current]);
  }

  async function recordRollbackDestroyProof() {
    const latest = vmSandboxDryRuns[0];
    if (!latest) {
      await createVmSandboxDryRun();
      return;
    }

    const payload = {
      dryRunPlanId: latest.id,
      backupEvidenceReference: "audit-export-manifest",
      ownerNotificationReference: "owner-notification-record",
      inventoryReconciliationReference: "prism-inventory-reconciliation",
      rollbackOwner: "Cloud Operations",
      evidenceReferences: ["audit-export-manifest", "owner-notification-record", "prism-inventory-reconciliation"],
    };

    if (apiHealth.mode === "api") {
      const proof = await createRollbackDestroyProofViaApi(payload);
      await refreshApiState();
      setRollbackDestroyProofs((current) => [proof, ...current.filter((item) => item.id !== proof.id)]);
      return;
    }

    setRollbackDestroyProofs((current) => [
      createMockRollbackDestroyProof(latest, auditExports, session.user),
      ...current.filter((item) => item.dryRunPlanId !== latest.id),
    ]);
  }

  async function reviewControlledCreateAuthorization() {
    if (apiHealth.mode === "api") {
      const envelope = await createControlledCreateAuthorizationEnvelopeViaApi();
      await refreshApiState();
      setControlledCreateAuthorizationEnvelopes((current) => [envelope, ...current.filter((item) => item.id !== envelope.id)]);
      return;
    }

    setControlledCreateAuthorizationEnvelopes((current) => [
      createMockControlledCreateAuthorizationEnvelope({
        actor: session.user,
        labAuthorizationScopes,
        vmSandboxDryRuns,
        controlledProvisioningGates,
        rollbackDestroyProofs,
        vmLifecycleProofs,
        adapterEnablementRecords,
        auditExports,
      }),
      ...current,
    ]);
  }

  async function reviewAhvCreateAdapterContract() {
    if (apiHealth.mode === "api") {
      const review = await createAhvCreateAdapterContractReviewViaApi();
      await refreshApiState();
      setAhvCreateAdapterContractReviews((current) => [review, ...current.filter((item) => item.id !== review.id)]);
      return;
    }

    setAhvCreateAdapterContractReviews((current) => [
      createMockAhvCreateAdapterContractReview({
        actor: session.user,
        vmSandboxDryRuns,
        controlledCreateAuthorizationEnvelopes,
      }),
      ...current,
    ]);
  }

  async function runAhvControlledProvisioningPreflight() {
    const gate = controlledProvisioningGates[0];
    if (!gate) {
      return;
    }

    if (apiHealth.mode === "api") {
      const run = await createAhvControlledProvisioningRunViaApi({ gateId: gate.id, action: "Create VM" });
      await refreshApiState();
      setAhvControlledProvisioningRuns((current) => [run, ...current.filter((item) => item.id !== run.id)]);
      return;
    }

    setAhvControlledProvisioningRuns((current) => [
      createMockAhvControlledProvisioningRun(gate, vmSandboxDryRuns, labAuthorizationScopes, vmLifecycleProofs, session.user),
      ...current,
    ]);
  }

  async function createPlatformServiceRequest(kind: PlatformServiceKind) {
    const payload = {
      kind,
      owner: session.user,
      environmentName: selectedEnvironmentName || environments[0]?.name || "platform-services-dev",
    };

    if (apiHealth.mode === "api") {
      const serviceRequest = await createPlatformServiceRequestViaApi(payload);
      await refreshApiState();
      setPlatformServiceRequests((current) => [serviceRequest, ...current.filter((item) => item.id !== serviceRequest.id)]);
      return;
    }

    setPlatformServiceRequests((current) => [
      createMockPlatformServiceRequest(payload, resourceProfiles, vmLifecycleProofs, session.user),
      ...current,
    ]);
  }

  async function runPlatformServicePreflight() {
    const serviceRequest = platformServiceRequests[0];
    if (!serviceRequest) {
      return;
    }

    if (apiHealth.mode === "api") {
      const run = await createPlatformServicePreflightRunViaApi({ requestId: serviceRequest.id });
      await refreshApiState();
      setPlatformServicePreflightRuns((current) => [run, ...current.filter((item) => item.id !== run.id)]);
      return;
    }

    setPlatformServicePreflightRuns((current) => [
      createMockPlatformServicePreflightRun(serviceRequest, integrationConfigs, provisioningAdapters, session.user),
      ...current,
    ]);
  }

  async function reviewPlatformServiceAdapterContract() {
    const serviceRequest = platformServiceRequests[0];
    if (!serviceRequest) {
      return;
    }

    if (apiHealth.mode === "api") {
      const review = await createPlatformServiceAdapterContractReviewViaApi({ requestId: serviceRequest.id });
      await refreshApiState();
      setPlatformServiceAdapterContractReviews((current) => [review, ...current.filter((item) => item.id !== review.id)]);
      return;
    }

    setPlatformServiceAdapterContractReviews((current) => [
      createMockPlatformServiceAdapterContractReview(serviceRequest, platformServicePreflightRuns, session.user),
      ...current,
    ]);
  }

  async function reviewProviderReleaseGate(provider: ProviderReleaseGateRecord["provider"] = "NCI") {
    if (apiHealth.mode === "api") {
      const record = await createProviderReleaseGateRecordViaApi({ provider, releaseApprover: session.user });
      await refreshApiState();
      setProviderReleaseGateRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);
      return;
    }

    const record = createMockProviderReleaseGateRecord({
        provider,
        actor: session.user,
        session,
        labAuthorizationScopes,
        credentialDiagnostics,
        adapterEnablementRecords,
        vmLifecycleProofs,
        ahvCreateAdapterContractReviews,
        ahvControlledProvisioningRuns,
        platformServiceAdapterContractReviews,
        platformServicePreflightRuns,
        auditExports,
    });
    setProviderReleaseGateRecords((current) => {
      const next = [record, ...current];
      setProviderReleaseReadinessSummary(createMockProviderReleaseReadinessSummary(next));
      return next;
    });
  }

  async function createProductionReadinessReview() {
    if (apiHealth.mode === "api") {
      const review = await createProductionReadinessReviewViaApi();
      await refreshApiState();
      setProductionReadinessReviews((current) => [review, ...current.filter((item) => item.id !== review.id)]);
      return;
    }

    setProductionReadinessReviews((current) => [
      createMockProductionReadinessReview({
        session,
        platformConfig,
        labAuthorizationScopes,
        vmLifecycleProofs,
        ahvControlledProvisioningRuns,
        platformServicePreflightRuns,
        auditEventsCount: 0,
      }),
      ...current,
    ]);
  }

  async function requestLifecycleOperation(operation: LifecycleOperationKind) {
    const environmentNameForOperation = selectedEnvironmentName || environments[0]?.name;
    if (!environmentNameForOperation) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createLifecycleOperationViaApi({
        environmentName: environmentNameForOperation,
        operation,
      });
      await refreshApiState(environmentNameForOperation);
      setLifecycleOperations((current) => [record, ...current.filter((item) => item.id !== record.id)]);
      return;
    }

    setLifecycleOperations((current) => [
      createMockLifecycleOperationRecord({
        environmentName: environmentNameForOperation,
        operation,
        actor: session.user,
        readiness: productionReadinessReviews[0],
        gates: controlledProvisioningGates,
        proofs: vmLifecycleProofs,
      }),
      ...current,
    ]);
  }

  async function prepareAuditExport() {
    if (apiHealth.mode === "api") {
      const auditExport = await createAuditExportViaApi();
      await refreshApiState();
      setAuditExports((current) => [auditExport, ...current.filter((item) => item.id !== auditExport.id)]);
      return;
    }

    setAuditExports((current) => [createMockAuditExportRecord(session.user, current.length), ...current]);
  }

  async function prepareReleaseEvidenceExport() {
    const gate = providerReleaseGateRecords[0];
    if (!gate) {
      return;
    }

    if (apiHealth.mode === "api") {
      const exportRecord = await createReleaseEvidenceExportViaApi({ gateId: gate.id });
      await refreshApiState();
      setReleaseEvidenceExports((current) => [exportRecord, ...current.filter((item) => item.id !== exportRecord.id)]);
      return;
    }

    setReleaseEvidenceExports((current) => [
      createMockReleaseEvidenceExportRecord(gate, session.user),
      ...current,
    ]);
  }

  async function prepareControlledLabReleaseRunbook() {
    const provider = providerReleaseReadinessSummary.nearestToReady ?? providerReleaseGateRecords[0]?.provider ?? "NCI";

    if (apiHealth.mode === "api") {
      const runbook = await createControlledLabReleaseRunbookViaApi({ provider });
      await refreshApiState();
      setControlledLabReleaseRunbooks((current) => [runbook, ...current.filter((item) => item.id !== runbook.id)]);
      return;
    }

    setControlledLabReleaseRunbooks((current) => [
      createMockControlledLabReleaseRunbookRecord(provider, providerReleaseReadinessSummary, providerReleaseGateRecords, session.user),
      ...current,
    ]);
  }

  async function scheduleControlledLabDryRunWindow() {
    const provider = controlledLabReleaseRunbooks[0]?.provider ?? providerReleaseReadinessSummary.nearestToReady ?? "NCI";
    const payload = {
      provider,
      runbookId: controlledLabReleaseRunbooks[0]?.id,
      releaseEvidenceExportId: releaseEvidenceExports.find((item) => item.provider === provider)?.id,
      labScopeId: labAuthorizationScopes[0]?.id,
      rollbackOwner: "Cloud Operations",
    };

    if (apiHealth.mode === "api") {
      const window = await createControlledLabDryRunWindowViaApi(payload);
      await refreshApiState();
      setControlledLabDryRunWindows((current) => [window, ...current.filter((item) => item.id !== window.id)]);
      return;
    }

    setControlledLabDryRunWindows((current) => [
      createMockControlledLabDryRunWindowRecord({
        provider,
        actor: session.user,
        runbook: controlledLabReleaseRunbooks[0],
        releaseExport: releaseEvidenceExports.find((item) => item.provider === provider),
        labScope: labAuthorizationScopes[0],
        auditExports,
      }),
      ...current,
    ]);
  }

  async function prepareLabWindowEvidenceExport() {
    const window = controlledLabDryRunWindows[0];
    if (!window) {
      return;
    }

    if (apiHealth.mode === "api") {
      const exportRecord = await createLabWindowEvidenceExportViaApi({ windowId: window.id });
      await refreshApiState();
      setLabWindowEvidenceExports((current) => [exportRecord, ...current.filter((item) => item.id !== exportRecord.id)]);
      return;
    }

    setLabWindowEvidenceExports((current) => [
      createMockLabWindowEvidenceExportRecord(window, session.user),
      ...current,
    ]);
  }

  async function reviewLabEvidencePackage() {
    const exportRecord = labWindowEvidenceExports[0];
    if (!exportRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const review = await createLabEvidenceReviewViaApi({ exportId: exportRecord.id });
      await refreshApiState();
      setLabEvidenceReviews((current) => [review, ...current.filter((item) => item.id !== review.id)]);
      return;
    }

    setLabEvidenceReviews((current) => [
      createMockLabEvidenceReviewRecord(exportRecord, session.user),
      ...current,
    ]);
  }

  async function reviewLabExecutionProposalEnvelope() {
    const review = labEvidenceReviews[0];
    if (!review) {
      return;
    }

    if (apiHealth.mode === "api") {
      const envelope = await createLabExecutionProposalEnvelopeViaApi({ reviewId: review.id });
      await refreshApiState();
      setLabExecutionProposalEnvelopes((current) => [envelope, ...current.filter((item) => item.id !== envelope.id)]);
      return;
    }

    setLabExecutionProposalEnvelopes((current) => [
      createMockLabExecutionProposalEnvelope({
        review,
        exportRecord: labWindowEvidenceExports.find((item) => item.id === review.exportId),
        window: controlledLabDryRunWindows.find((item) => item.id === review.windowId),
        runbook: controlledLabReleaseRunbooks.find((item) => item.id === controlledLabDryRunWindows.find((window) => window.id === review.windowId)?.linkedRunbookId),
        labScope: labAuthorizationScopes.find((scope) => scope.id === controlledLabDryRunWindows.find((window) => window.id === review.windowId)?.linkedLabScopeId),
        auditExports,
        actor: session.user,
      }),
      ...current,
    ]);
  }

  async function prepareLabExecutionProposalExport() {
    const envelope = labExecutionProposalEnvelopes[0];
    if (!envelope) {
      return;
    }

    if (apiHealth.mode === "api") {
      const exportRecord = await createLabExecutionProposalExportViaApi({ envelopeId: envelope.id });
      await refreshApiState();
      setLabExecutionProposalExports((current) => [exportRecord, ...current.filter((item) => item.id !== exportRecord.id)]);
      return;
    }

    setLabExecutionProposalExports((current) => [
      createMockLabExecutionProposalExportRecord(envelope, session.user),
      ...current,
    ]);
  }

  async function recordControlledLabExecutionApproval() {
    const proposalExport = labExecutionProposalExports[0];
    if (!proposalExport) {
      return;
    }

    if (apiHealth.mode === "api") {
      const approval = await createControlledLabExecutionApprovalViaApi({ proposalExportId: proposalExport.id });
      await refreshApiState();
      setControlledLabExecutionApprovals((current) => [approval, ...current.filter((item) => item.id !== approval.id)]);
      return;
    }

    setControlledLabExecutionApprovals((current) => [
      createMockControlledLabExecutionApproval(proposalExport, session.user),
      ...current,
    ]);
  }

  async function prepareControlledLabExecutionRehearsalPacket() {
    const approvalGate = controlledLabExecutionApprovals[0];
    if (!approvalGate) {
      return;
    }

    if (apiHealth.mode === "api") {
      const packet = await createControlledLabExecutionRehearsalPacketViaApi({ approvalGateId: approvalGate.id });
      await refreshApiState();
      setControlledLabExecutionRehearsalPackets((current) => [packet, ...current.filter((item) => item.id !== packet.id)]);
      return;
    }

    setControlledLabExecutionRehearsalPackets((current) => [
      createMockControlledLabExecutionRehearsalPacket({
        approvalGate,
        proposalExport: labExecutionProposalExports.find((item) => item.id === approvalGate.proposalExportId),
        envelope: labExecutionProposalEnvelopes.find((item) => item.id === approvalGate.envelopeId),
        windows: controlledLabDryRunWindows,
        runbooks: controlledLabReleaseRunbooks,
        auditExports,
        actor: session.user,
      }),
      ...current,
    ]);
  }

  async function recordControlledLabDryRunExecutionChecklist() {
    const rehearsalPacket = controlledLabExecutionRehearsalPackets[0];
    if (!rehearsalPacket) {
      return;
    }

    if (apiHealth.mode === "api") {
      const checklist = await createControlledLabDryRunExecutionChecklistViaApi({ rehearsalPacketId: rehearsalPacket.id });
      await refreshApiState();
      setControlledLabDryRunExecutionChecklists((current) => [checklist, ...current.filter((item) => item.id !== checklist.id)]);
      return;
    }

    setControlledLabDryRunExecutionChecklists((current) => [
      createMockControlledLabDryRunExecutionChecklist(rehearsalPacket, session.user),
      ...current,
    ]);
  }

  async function recordControlledLabExecutionEvidenceLedger() {
    const checklist = controlledLabDryRunExecutionChecklists[0];
    if (!checklist) {
      return;
    }

    if (apiHealth.mode === "api") {
      const ledger = await createControlledLabExecutionEvidenceLedgerViaApi({ dryRunChecklistId: checklist.id });
      await refreshApiState();
      setControlledLabExecutionEvidenceLedgers((current) => [ledger, ...current.filter((item) => item.id !== ledger.id)]);
      return;
    }

    setControlledLabExecutionEvidenceLedgers((current) => [
      createMockControlledLabExecutionEvidenceLedger(checklist, session.user),
      ...current,
    ]);
  }

  async function recordControlledLabExecutionReadinessAttestation() {
    const ledger = controlledLabExecutionEvidenceLedgers[0];
    if (!ledger) {
      return;
    }

    if (apiHealth.mode === "api") {
      const attestation = await createControlledLabExecutionReadinessAttestationViaApi({ evidenceLedgerId: ledger.id });
      await refreshApiState();
      setControlledLabExecutionReadinessAttestations((current) => [
        attestation,
        ...current.filter((item) => item.id !== attestation.id),
      ]);
      return;
    }

    setControlledLabExecutionReadinessAttestations((current) => [
      createMockControlledLabExecutionReadinessAttestation(ledger, session.user),
      ...current,
    ]);
  }

  async function queueExecutionBrokerRecord() {
    const attestation = controlledLabExecutionReadinessAttestations[0];
    if (!attestation) {
      return;
    }
    const idempotencyKey = `${attestation.provider.toLowerCase()}-${attestation.id}-operator-review`;

    if (apiHealth.mode === "api") {
      const brokerRecord = await createExecutionBrokerQueueRecordViaApi({
        readinessAttestationId: attestation.id,
        idempotencyKey,
      });
      await refreshApiState();
      setExecutionBrokerQueueRecords((current) => [
        brokerRecord,
        ...current.filter((item) => item.id !== brokerRecord.id),
      ]);
      return;
    }

    setExecutionBrokerQueueRecords((current) => [
      createMockExecutionBrokerQueueRecord(attestation, session.user, idempotencyKey, current),
      ...current,
    ]);
  }

  async function recordExecutionBrokerDispatchApproval() {
    const brokerRecord = executionBrokerQueueRecords[0];
    if (!brokerRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const dispatchApproval = await createExecutionBrokerDispatchApprovalViaApi({ brokerRecordId: brokerRecord.id });
      await refreshApiState();
      setExecutionBrokerDispatchApprovals((current) => [
        dispatchApproval,
        ...current.filter((item) => item.id !== dispatchApproval.id),
      ]);
      return;
    }

    setExecutionBrokerDispatchApprovals((current) => [
      createMockExecutionBrokerDispatchApproval(brokerRecord, session.user),
      ...current,
    ]);
  }

  async function recordRealAdapterLabScopeActivation() {
    const dispatchApproval = executionBrokerDispatchApprovals[0];
    if (!dispatchApproval) {
      return;
    }

    if (apiHealth.mode === "api") {
      const activation = await createRealAdapterLabScopeActivationViaApi({ dispatchApprovalId: dispatchApproval.id });
      await refreshApiState();
      setRealAdapterLabScopeActivations((current) => [
        activation,
        ...current.filter((item) => item.id !== activation.id),
      ]);
      return;
    }

    setRealAdapterLabScopeActivations((current) => [
      createMockRealAdapterLabScopeActivation(dispatchApproval, session.user),
      ...current,
    ]);
  }

  async function recordManualRealAdapterSwitchReview() {
    const activation = realAdapterLabScopeActivations[0];
    if (!activation) {
      return;
    }

    if (apiHealth.mode === "api") {
      const review = await createManualRealAdapterSwitchReviewViaApi({ activationId: activation.id });
      await refreshApiState();
      setManualRealAdapterSwitchReviews((current) => [
        review,
        ...current.filter((item) => item.id !== review.id),
      ]);
      return;
    }

    setManualRealAdapterSwitchReviews((current) => [
      createMockManualRealAdapterSwitchReview(activation, session.user),
      ...current,
    ]);
  }

  async function reviewAdapterEnablement() {
    const payload = {
      provider: "NCI" as const,
      rollbackOwner: "Cloud Operations",
    };

    if (apiHealth.mode === "api") {
      const record = await createAdapterEnablementRecordViaApi(payload);
      await refreshApiState();
      setAdapterEnablementRecords((current) => [record, ...current.filter((item) => item.id !== record.id)]);
      return;
    }

    setAdapterEnablementRecords((current) => [
      createMockAdapterEnablementRecord({
        provider: payload.provider,
        rollbackOwner: payload.rollbackOwner,
        actor: session.user,
        integrationConfigs,
        credentialDiagnostics,
        labAuthorizationScopes,
        provisioningAdapters,
        auditExports,
      }),
      ...current,
    ]);
  }

  async function requestEnvironmentDestroy(name: string) {
    if (apiHealth.mode === "api") {
      await requestEnvironmentDestroyViaApi(name);
      await refreshApiState(name);
      return;
    }

    setEnvironments((current) =>
      current.map((environment) =>
        environment.name === name ? { ...environment, status: "Destroying" as const } : environment
      )
    );
    const environment = environments.find((item) => item.name === name);
    if (environment) {
      setControlPlaneJobs((current) => [createMockDestroyControlPlaneJob(environment), ...current]);
    }
  }

  async function runTemplateRegistryAction(
    templateId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) {
    if (apiHealth.mode === "api") {
      const updated = await runTemplateRegistryActionViaApi(templateId, action);
      setTemplateRegistry((current) =>
        current.map((entry) => (entry.templateId === templateId ? updated : entry))
      );
      return;
    }

    setTemplateRegistry((current) =>
      current.map((entry) =>
        entry.templateId === templateId ? transitionTemplateRegistryEntry(entry, action, session.user) : entry
      )
    );
  }

  async function runResourceProfileAction(
    profileId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) {
    if (apiHealth.mode === "api") {
      const updated = await runResourceProfileActionViaApi(profileId, action);
      setResourceProfiles((current) => current.map((profile) => (profile.id === profileId ? updated : profile)));
      return;
    }

    setResourceProfiles((current) =>
      current.map((profile) =>
        profile.id === profileId ? transitionResourceProfile(profile, action, session.user) : profile
      )
    );
  }

  function updateTemplateGovernance(id: string, field: "owner" | "tier", value: string) {
    setTemplateGovernance((current) => {
      const currentTemplate = current[id] ?? { owner: "", tier: "Standard" };
      return {
        ...current,
        [id]: {
          ...currentTemplate,
          [field]: field === "tier" ? (value as TemplateTier) : value,
        },
      };
    });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img className="brandLogo" src={primaryLogo} alt="Nutanix Developer Cloud Studio" />
        </div>
        <nav className="nav">
          <NavButton icon={Gauge} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavButton icon={Layers3} label="Catalog" active={view === "catalog"} onClick={() => setView("catalog")} />
          <NavButton icon={Play} label="Create" active={view === "create"} onClick={() => setView("create")} />
          <NavButton
            icon={Activity}
            label="Environment"
            active={view === "environment" || view === "environmentDetail"}
            onClick={() => openEnvironmentDetail(selectedEnvironmentName || environments[0]?.name || environmentName)}
          />
          <NavButton icon={ShieldCheck} label="Admin" active={view === "admin"} onClick={() => setView("admin")} />
        </nav>
        <div className="sidebarStatus">
          <span className="dot" />
          {apiHealth.label}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Nutanix Developer Cloud Studio</p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <button className="primaryAction" onClick={() => setView("create")}>
            <Play size={16} />
            New environment
          </button>
        </header>

        {view === "dashboard" && (
          <Dashboard
            environments={environments}
            approvals={approvals}
            integrations={runtimeIntegrations}
            integrationConfigs={integrationConfigs}
            credentialDiagnostics={credentialDiagnostics}
            session={session}
            sessionDiagnostics={sessionDiagnostics}
            systemStatus={systemStatus}
            controlPlaneJobs={controlPlaneJobs}
            apiHealth={apiHealth}
            openTemplate={openTemplate}
            openEnvironmentDetail={openEnvironmentDetail}
            setView={setView}
          />
        )}
        {view === "catalog" && (
          <Catalog selectedId={selectedTemplateId} selectTemplate={selectTemplate} openTemplate={openTemplate} />
        )}
        {view === "template" && <TemplateDetail template={selectedTemplate} selectTemplate={selectTemplate} />}
        {view === "create" && (
          <CreateEnvironment
            template={selectedTemplate}
            selectedTargets={selectedTargets}
            environmentName={environmentName}
            region={region}
            estimatedCost={estimatedCost}
            setEnvironmentName={setEnvironmentName}
            setRegion={setRegion}
            setSelectedTemplateId={setSelectedTemplateId}
            toggleTarget={toggleTarget}
            launchEnvironment={launchEnvironment}
            requestError={requestError}
            apiMode={apiHealth.mode}
          />
        )}
        {view === "environment" && (
          <EnvironmentStatus
            jobState={jobState}
            jobStep={jobStep}
            environmentName={environmentName}
            templateName={selectedTemplate.name}
            selectedTargets={selectedTargets}
            estimatedCost={estimatedCost}
            setView={setView}
          />
        )}
        {view === "environmentDetail" && (
          <EnvironmentDetailView
            detail={environmentDetail ?? createMockEnvironmentDetail(environments, approvals, selectedEnvironmentName)}
            openCreate={() => setView("create")}
          />
        )}
        {view === "admin" && (
          <AdminView
            environments={environments}
            integrations={runtimeIntegrations}
            integrationConfigs={integrationConfigs}
            credentialDiagnostics={credentialDiagnostics}
            session={session}
            sessionDiagnostics={sessionDiagnostics}
            systemStatus={systemStatus}
            labAdapters={labAdapters}
            labAuthorizationScopes={labAuthorizationScopes}
            labScopeDiagnostics={labScopeDiagnostics}
            prismInventory={prismInventory}
            prismInventoryImport={prismInventoryImport}
            resourceProfiles={resourceProfiles}
            policyBundles={policyBundles}
            templateRegistry={templateRegistry}
            platformConfig={platformConfig}
            provisioningAdapters={provisioningAdapters}
            adapterEnablementRecords={adapterEnablementRecords}
            controlPlaneJobs={controlPlaneJobs}
            vmSandboxDryRuns={vmSandboxDryRuns}
            controlledProvisioningGates={controlledProvisioningGates}
            controlledCreateAuthorizationEnvelopes={controlledCreateAuthorizationEnvelopes}
            platformServiceRequests={platformServiceRequests}
            platformServicePreflightRuns={platformServicePreflightRuns}
            platformServiceAdapterContractReviews={platformServiceAdapterContractReviews}
            providerReleaseGateRecords={providerReleaseGateRecords}
            providerReleaseReadinessSummary={providerReleaseReadinessSummary}
            vmLifecycleProofs={vmLifecycleProofs}
            rollbackDestroyProofs={rollbackDestroyProofs}
            ahvCreateAdapterContractReviews={ahvCreateAdapterContractReviews}
            ahvControlledProvisioningRuns={ahvControlledProvisioningRuns}
            productionReadinessReviews={productionReadinessReviews}
            lifecycleOperations={lifecycleOperations}
            auditExports={auditExports}
            releaseEvidenceExports={releaseEvidenceExports}
            controlledLabReleaseRunbooks={controlledLabReleaseRunbooks}
            controlledLabDryRunWindows={controlledLabDryRunWindows}
            labWindowEvidenceExports={labWindowEvidenceExports}
            labEvidenceReviews={labEvidenceReviews}
            labExecutionProposalEnvelopes={labExecutionProposalEnvelopes}
            labExecutionProposalExports={labExecutionProposalExports}
            controlledLabExecutionApprovals={controlledLabExecutionApprovals}
            controlledLabExecutionRehearsalPackets={controlledLabExecutionRehearsalPackets}
            controlledLabDryRunExecutionChecklists={controlledLabDryRunExecutionChecklists}
            controlledLabExecutionEvidenceLedgers={controlledLabExecutionEvidenceLedgers}
            controlledLabExecutionReadinessAttestations={controlledLabExecutionReadinessAttestations}
            executionBrokerQueueRecords={executionBrokerQueueRecords}
            executionBrokerDispatchApprovals={executionBrokerDispatchApprovals}
            realAdapterLabScopeActivations={realAdapterLabScopeActivations}
            manualRealAdapterSwitchReviews={manualRealAdapterSwitchReviews}
            auditRetentionDiagnostics={auditRetentionDiagnostics}
            approvals={approvals}
            templateGovernance={templateGovernance}
            updateTemplateGovernance={updateTemplateGovernance}
            decideApproval={decideApproval}
            saveIntegrationConfig={saveIntegrationConfig}
            runIntegrationCheck={runIntegrationCheck}
            runLabDiscovery={runLabDiscovery}
            importPrismInventory={importPrismInventory}
            runControlPlaneJobAction={runControlPlaneJobAction}
            createVmSandboxDryRun={createVmSandboxDryRun}
            recordLabAuthorizationScope={recordLabAuthorizationScope}
            requestControlledProvisioningGate={requestControlledProvisioningGate}
            decideControlledProvisioningGate={decideControlledProvisioningGate}
            recordVmLifecycleProof={recordVmLifecycleProof}
            recordRollbackDestroyProof={recordRollbackDestroyProof}
            reviewControlledCreateAuthorization={reviewControlledCreateAuthorization}
            reviewAhvCreateAdapterContract={reviewAhvCreateAdapterContract}
            runAhvControlledProvisioningPreflight={runAhvControlledProvisioningPreflight}
            createPlatformServiceRequest={createPlatformServiceRequest}
            runPlatformServicePreflight={runPlatformServicePreflight}
            reviewPlatformServiceAdapterContract={reviewPlatformServiceAdapterContract}
            reviewProviderReleaseGate={reviewProviderReleaseGate}
            createProductionReadinessReview={createProductionReadinessReview}
            requestLifecycleOperation={requestLifecycleOperation}
            prepareAuditExport={prepareAuditExport}
            prepareReleaseEvidenceExport={prepareReleaseEvidenceExport}
            prepareControlledLabReleaseRunbook={prepareControlledLabReleaseRunbook}
            scheduleControlledLabDryRunWindow={scheduleControlledLabDryRunWindow}
            prepareLabWindowEvidenceExport={prepareLabWindowEvidenceExport}
            reviewLabEvidencePackage={reviewLabEvidencePackage}
            reviewLabExecutionProposalEnvelope={reviewLabExecutionProposalEnvelope}
            prepareLabExecutionProposalExport={prepareLabExecutionProposalExport}
            recordControlledLabExecutionApproval={recordControlledLabExecutionApproval}
            prepareControlledLabExecutionRehearsalPacket={prepareControlledLabExecutionRehearsalPacket}
            recordControlledLabDryRunExecutionChecklist={recordControlledLabDryRunExecutionChecklist}
            recordControlledLabExecutionEvidenceLedger={recordControlledLabExecutionEvidenceLedger}
            recordControlledLabExecutionReadinessAttestation={recordControlledLabExecutionReadinessAttestation}
            queueExecutionBrokerRecord={queueExecutionBrokerRecord}
            recordExecutionBrokerDispatchApproval={recordExecutionBrokerDispatchApproval}
            recordRealAdapterLabScopeActivation={recordRealAdapterLabScopeActivation}
            recordManualRealAdapterSwitchReview={recordManualRealAdapterSwitchReview}
            reviewAdapterEnablement={reviewAdapterEnablement}
            requestEnvironmentDestroy={requestEnvironmentDestroy}
            runTemplateRegistryAction={runTemplateRegistryAction}
            runResourceProfileAction={runResourceProfileAction}
            openEnvironmentDetail={openEnvironmentDetail}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({
  environments,
  approvals,
  integrations,
  integrationConfigs,
  credentialDiagnostics,
  session,
  sessionDiagnostics,
  systemStatus,
  controlPlaneJobs,
  apiHealth,
  openTemplate,
  openEnvironmentDetail,
  setView,
}: {
  environments: Environment[];
  approvals: ApprovalRequest[];
  integrations: Integration[];
  integrationConfigs: IntegrationConfig[];
  credentialDiagnostics: CredentialReferenceDiagnostic[];
  session: PlatformSession;
  sessionDiagnostics: SessionDiagnostics;
  systemStatus: SystemStatus;
  controlPlaneJobs: ControlPlaneJob[];
  apiHealth: ApiHealth;
  openTemplate: (id: string) => void;
  openEnvironmentDetail: (name: string) => void;
  setView: (view: View) => void;
}) {
  const readyCount = environments.filter((environment) => environment.status === "Ready").length;
  const openApprovals = approvals.filter((approval) => approval.status === "Pending");
  const readinessAverage = Math.round(
    integrations.reduce((total, integration) => total + integration.score, 0) / Math.max(integrations.length, 1)
  );
  const reachableIntegrations = integrationConfigs.filter((config) => config.status === "Reachable").length;
  const activeControlPlaneJobs = controlPlaneJobs.filter((job) => !["Ready", "Failed", "Expired"].includes(job.state));

  return (
    <section className="screen">
      <div className="opsStatusStrip">
        <div className="statusTile strong">
          <span>Runtime</span>
          <strong>{apiHealth.mode === "api" ? "Hosted API" : "Static demo"}</strong>
          <small>{apiHealth.label}</small>
        </div>
        <div className="statusTile">
          <span>Environments</span>
          <strong>{environments.length}</strong>
          <small>{readyCount} ready across lab targets</small>
        </div>
        <div className="statusTile">
          <span>Approvals</span>
          <strong>{openApprovals.length}</strong>
          <small>Pending platform decisions</small>
        </div>
        <div className="statusTile">
          <span>Integration readiness</span>
          <strong>{readinessAverage}%</strong>
          <small>NCI, NKP, NDB, NUS, NCM, NAI</small>
        </div>
        <div className="statusTile">
          <span>Provisioning</span>
          <strong>{systemStatus.provisioningEnabled ? "Enabled" : "Disabled"}</strong>
          <small>{systemStatus.integrations.readOnlyCandidates} read-only candidates</small>
        </div>
        <div className="statusTile">
          <span>Control plane</span>
          <strong>{activeControlPlaneJobs.length}</strong>
          <small>Active queued or running jobs</small>
        </div>
      </div>

      <div className="opsDashboardGrid">
        <div className="opsMain">
          <Panel title="Environment operations" action="API-backed detail">
            <div className="opsTable">
              <div className="tableHeader">
                <span>Name</span>
                <span>Owner</span>
                <span>Target</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {environments.map((env) => (
                <div className="tableRow" key={env.name}>
                  <strong>{env.name}</strong>
                  <span>{env.owner}</span>
                  <span>{env.region}</span>
                  <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
                  <button className="iconTextButton" onClick={() => openEnvironmentDetail(env.name)}>
                    <ExternalLink size={15} />
                    Details
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="opsSide">
          <Panel title="Access context" action={session.authMode}>
            <div className="identityPanel">
              <div className="statusBadge compact">
                <UserRound size={20} />
              </div>
              <div>
                <strong>{session.displayName}</strong>
                <span>{session.roles.join(" / ")}</span>
                <small>{session.identityProvider}</small>
              </div>
            </div>
          </Panel>
          <Panel title="Approval queue" action={`${openApprovals.length} pending`}>
            <ApprovalQueue approvals={approvals} compact openEnvironmentDetail={openEnvironmentDetail} />
          </Panel>
          <Panel title="Control plane queue" action={`${activeControlPlaneJobs.length} active`}>
            <ControlPlaneQueue jobs={controlPlaneJobs.slice(0, 4)} compact />
          </Panel>
          <Panel title="Integration readiness" action={`${readinessAverage}%`}>
            <div className="miniIntegrationGrid">
              {integrations.map((integration) => (
                <div className="integrationTile" key={integration.name}>
                  <strong>{integration.name}</strong>
                  <span>{integration.state}</span>
                  <meter min="0" max="100" value={integration.score} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="opsCommandGrid">
        <Panel title="Private cloud command center" action="Prototype">
          <div className="commandPanel">
            <div>
              <p className="eyebrow">Private cloud developer operations</p>
              <h2>Operate governed developer environments from one private cloud console.</h2>
              <p>
                Request and govern VMs, Kubernetes namespaces, databases, storage, and AI endpoints
                with hosted API workflows, approval gates, and integration readiness surfaced together.
              </p>
              <div className="buttonRow">
                <button className="primaryAction" onClick={() => setView("create")}>
                  <Play size={16} />
                  Create environment
                </button>
                <button className="secondaryAction" onClick={() => setView("catalog")}>
                  <Layers3 size={16} />
                  Browse catalog
                </button>
              </div>
            </div>
            <img src={cloudVisual} alt="" />
          </div>
        </Panel>
        <div className="dashboardGrid compactMetrics">
          <MetricCard icon={Cloud} label="Active environments" value={String(environments.length)} detail="Across 3 labs" />
          <MetricCard icon={ShieldCheck} label="Pending approvals" value={String(openApprovals.length)} detail="AI and regulated paths" />
          <MetricCard
            icon={CircleDollarSign}
            label="Monthly estimate"
            value={`$${Math.round(environments.reduce((total, environment) => total + environment.cost, 0) / 100) / 10}k`}
            detail="Current prototype state"
          />
          <MetricCard
            icon={Settings}
            label="Reachable integrations"
            value={`${reachableIntegrations}/${integrationConfigs.length}`}
            detail="Mock readiness checks"
          />
        </div>
      </div>

      <div className="twoColumn">
        <Panel title="Recommended golden paths" action="Catalog">
          <div className="templateList">
            {templates.slice(0, 3).map((template) => (
              <button className="templateRow" key={template.id} onClick={() => openTemplate(template.id)}>
                <div>
                  <strong>{template.name}</strong>
                  <span>{template.runtime}</span>
                </div>
                <span className={`pill ${template.tier.toLowerCase()}`}>{template.tier}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Environment activity" action="Live">
          <div className="envTable">
            {environments.map((env) => (
              <div className="envRow" key={env.name}>
                <div>
                  <strong>{env.name}</strong>
                  <span>{env.template}</span>
                </div>
                <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Catalog({
  selectedId,
  selectTemplate,
  openTemplate,
}: {
  selectedId: string;
  selectTemplate: (id: string) => void;
  openTemplate: (id: string) => void;
}) {
  return (
    <section className="screen">
      <div className="catalogGrid">
        {templates.map((template) => (
          <article className={`templateCard ${selectedId === template.id ? "selected" : ""}`} key={template.id}>
            <div className="cardTop">
              <div className="cardIcon">
                <Code2 size={20} />
              </div>
              <span className={`pill ${template.tier.toLowerCase()}`}>{template.tier}</span>
            </div>
            <h2>{template.name}</h2>
            <p>{template.summary}</p>
            <div className="targetStrip">
              {template.targets.map((target) => {
                const Icon = targetIcons[target];
                return (
                  <span key={target}>
                    <Icon size={14} />
                    {target}
                  </span>
                );
              })}
            </div>
            <div className="cardMeta">
              <span>{template.owner}</span>
              <strong>${template.monthlyCost.toLocaleString()}/mo</strong>
            </div>
            <button className="fullButton" onClick={() => selectTemplate(template.id)}>
              Use template
            </button>
            <button className="textButton" onClick={() => openTemplate(template.id)}>
              View details
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TemplateDetail({ template, selectTemplate }: { template: Template; selectTemplate: (id: string) => void }) {
  return (
    <section className="screen detailGrid">
      <Panel title={template.name} action={template.tier}>
        <p className="detailLead">{template.description}</p>
        <div className="targetStrip spacious">
          {template.targets.map((target) => {
            const Icon = targetIcons[target];
            return (
              <span key={target}>
                <Icon size={14} />
                {target}
              </span>
            );
          })}
        </div>
        <div className="cardMeta detailMeta">
          <span>{template.owner}</span>
          <strong>${template.monthlyCost.toLocaleString()}/mo baseline</strong>
        </div>
        <button className="fullButton launch" onClick={() => selectTemplate(template.id)}>
          Use this golden path
        </button>
      </Panel>
      <Panel title="What gets created" action={template.runtime}>
        <div className="bulletList">
          {template.outcomes.map((item) => (
            <CheckLine key={item} icon={CheckCircle2} label={item} value="Included in prototype workflow" passed />
          ))}
        </div>
      </Panel>
      <Panel title="Integration readiness" action="Next">
        <div className="bulletList">
          {template.readiness.map((item) => (
            <CheckLine key={item} icon={Network} label={item} value="Required before real provisioning" passed={false} />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CreateEnvironment({
  template,
  selectedTargets,
  environmentName,
  region,
  estimatedCost,
  setEnvironmentName,
  setRegion,
  setSelectedTemplateId,
  toggleTarget,
  launchEnvironment,
  requestError,
  apiMode,
}: {
  template: Template;
  selectedTargets: Target[];
  environmentName: string;
  region: string;
  estimatedCost: number;
  setEnvironmentName: (value: string) => void;
  setRegion: (value: string) => void;
  setSelectedTemplateId: (value: string) => void;
  toggleTarget: (target: Target) => void;
  launchEnvironment: () => void;
  requestError: string;
  apiMode: "api" | "mock";
}) {
  return (
    <section className="screen createGrid">
      <Panel title="Request details" action="Step 1">
        <label className="field">
          Environment name
          <input value={environmentName} onChange={(event) => setEnvironmentName(event.target.value)} />
        </label>
        <label className="field">
          Golden path
          <select value={template.id} onChange={(event) => setSelectedTemplateId(event.target.value)}>
            {templates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Target location
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option>Berlin Lab</option>
            <option>London Edge</option>
            <option>Paris DR</option>
          </select>
        </label>
      </Panel>

      <Panel title="Target services" action="Step 2">
        <div className="targetGrid">
          {allTargets.map((target) => {
            const Icon = targetIcons[target];
            const active = selectedTargets.includes(target);
            return (
              <button className={`targetButton ${active ? "active" : ""}`} key={target} onClick={() => toggleTarget(target)}>
                <Icon size={18} />
                {target}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Automated checks" action="Step 3">
        <CheckLine icon={ShieldCheck} label="Policy" value="Allowed by developer sandbox policy" passed />
        <CheckLine icon={CircleDollarSign} label="Cost" value={`Estimated $${estimatedCost.toLocaleString()} per month`} passed />
        <CheckLine
          icon={LockKeyhole}
          label="Compliance"
          value={selectedTargets.includes("AI Endpoint") ? "Requires AI platform approval" : "No approval required"}
          passed={!selectedTargets.includes("AI Endpoint")}
        />
        <CheckLine
          icon={Network}
          label="Integrations"
          value={apiMode === "api" ? `${template.runtime} via hosted API` : `${template.runtime} in browser mock mode`}
          passed
        />
        {requestError && <p className="formNotice">{requestError}</p>}
        <button className="fullButton launch" onClick={launchEnvironment}>
          Launch simulated provisioning
        </button>
      </Panel>
    </section>
  );
}

function EnvironmentStatus({
  jobState,
  jobStep,
  environmentName,
  templateName,
  selectedTargets,
  estimatedCost,
  setView,
}: {
  jobState: JobState;
  jobStep: number;
  environmentName: string;
  templateName: string;
  selectedTargets: Target[];
  estimatedCost: number;
  setView: (view: View) => void;
}) {
  const jobStarted = jobState !== "Idle";
  const actionLabel = jobStarted ? jobState : "Ready";

  return (
    <section className="screen statusGrid">
      <Panel title={jobStarted ? environmentName : "No active request"} action={actionLabel}>
        <div className="statusSummary">
          <div className="statusBadge">
            <TerminalSquare size={28} />
          </div>
          <div>
            <h2>{jobStarted ? jobHeadline(jobState) : "Create an environment to see status"}</h2>
            <p>{jobStarted ? templateName : "The status view will show checks, events, and Nutanix integration handoff."}</p>
          </div>
        </div>
        {jobStarted && (
          <div className="timeline">
            {provisioningEvents.map((item, index) => (
              <div className={`timelineItem ${timelineClass(index, jobStep, jobState)}`} key={item.title}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{timelineLabel(index, jobStep, jobState)} - {item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        )}
        {!jobStarted && (
          <button className="fullButton" onClick={() => setView("create")}>
            Create environment
          </button>
        )}
      </Panel>

      <Panel title="Provisioned resources" action={`$${estimatedCost.toLocaleString()}/mo`}>
        <div className="resourceList">
          {selectedTargets.map((target) => {
            const Icon = targetIcons[target];
            return (
              <div className="resourceRow" key={target}>
                <Icon size={18} />
                <div>
                  <strong>{target}</strong>
                  <span>{resourceDescription(target)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

function AdminView({
  environments,
  integrations,
  integrationConfigs,
  credentialDiagnostics,
  session,
  sessionDiagnostics,
  systemStatus,
  labAdapters,
  labAuthorizationScopes,
  labScopeDiagnostics,
  prismInventory,
  prismInventoryImport,
  resourceProfiles,
  policyBundles,
  templateRegistry,
  platformConfig,
  provisioningAdapters,
  adapterEnablementRecords,
  controlPlaneJobs,
  vmSandboxDryRuns,
  controlledProvisioningGates,
  controlledCreateAuthorizationEnvelopes,
  platformServiceRequests,
  platformServicePreflightRuns,
  platformServiceAdapterContractReviews,
  providerReleaseGateRecords,
  providerReleaseReadinessSummary,
  vmLifecycleProofs,
  rollbackDestroyProofs,
  ahvCreateAdapterContractReviews,
  ahvControlledProvisioningRuns,
  productionReadinessReviews,
  lifecycleOperations,
  auditExports,
  releaseEvidenceExports,
  controlledLabReleaseRunbooks,
  controlledLabDryRunWindows,
  labWindowEvidenceExports,
  labEvidenceReviews,
  labExecutionProposalEnvelopes,
  labExecutionProposalExports,
  controlledLabExecutionApprovals,
  controlledLabExecutionRehearsalPackets,
  controlledLabDryRunExecutionChecklists,
  controlledLabExecutionEvidenceLedgers,
  controlledLabExecutionReadinessAttestations,
  executionBrokerQueueRecords,
  executionBrokerDispatchApprovals,
  realAdapterLabScopeActivations,
  manualRealAdapterSwitchReviews,
  auditRetentionDiagnostics,
  approvals,
  templateGovernance,
  updateTemplateGovernance,
  decideApproval,
  saveIntegrationConfig,
  runIntegrationCheck,
  runLabDiscovery,
  importPrismInventory,
  runControlPlaneJobAction,
  createVmSandboxDryRun,
  recordLabAuthorizationScope,
  requestControlledProvisioningGate,
  decideControlledProvisioningGate,
  recordVmLifecycleProof,
  recordRollbackDestroyProof,
  reviewControlledCreateAuthorization,
  reviewAhvCreateAdapterContract,
  runAhvControlledProvisioningPreflight,
  createPlatformServiceRequest,
  runPlatformServicePreflight,
  reviewPlatformServiceAdapterContract,
  reviewProviderReleaseGate,
  createProductionReadinessReview,
  requestLifecycleOperation,
  prepareAuditExport,
  prepareReleaseEvidenceExport,
  prepareControlledLabReleaseRunbook,
  scheduleControlledLabDryRunWindow,
  prepareLabWindowEvidenceExport,
  reviewLabEvidencePackage,
  reviewLabExecutionProposalEnvelope,
  prepareLabExecutionProposalExport,
  recordControlledLabExecutionApproval,
  prepareControlledLabExecutionRehearsalPacket,
  recordControlledLabDryRunExecutionChecklist,
  recordControlledLabExecutionEvidenceLedger,
  recordControlledLabExecutionReadinessAttestation,
  queueExecutionBrokerRecord,
  recordExecutionBrokerDispatchApproval,
  recordRealAdapterLabScopeActivation,
  recordManualRealAdapterSwitchReview,
  reviewAdapterEnablement,
  requestEnvironmentDestroy,
  runTemplateRegistryAction,
  runResourceProfileAction,
  openEnvironmentDetail,
}: {
  environments: Environment[];
  integrations: Integration[];
  integrationConfigs: IntegrationConfig[];
  credentialDiagnostics: CredentialReferenceDiagnostic[];
  session: PlatformSession;
  sessionDiagnostics: SessionDiagnostics;
  systemStatus: SystemStatus;
  labAdapters: LabAdapterSnapshot[];
  labAuthorizationScopes: LabAuthorizationScope[];
  labScopeDiagnostics: LabScopeDiagnostics;
  prismInventory: PrismInventoryRecord[];
  prismInventoryImport?: PrismInventoryImportResult;
  resourceProfiles: ResourceProfile[];
  policyBundles: PolicyBundle[];
  templateRegistry: TemplateRegistryEntry[];
  platformConfig: PlatformConfig;
  provisioningAdapters: ProvisioningAdapterReadiness[];
  adapterEnablementRecords: AdapterEnablementRecord[];
  controlPlaneJobs: ControlPlaneJob[];
  vmSandboxDryRuns: VmSandboxDryRunPlan[];
  controlledProvisioningGates: ControlledProvisioningGate[];
  controlledCreateAuthorizationEnvelopes: ControlledCreateAuthorizationEnvelope[];
  platformServiceRequests: PlatformServiceRequest[];
  platformServicePreflightRuns: PlatformServicePreflightRun[];
  platformServiceAdapterContractReviews: PlatformServiceAdapterContractReview[];
  providerReleaseGateRecords: ProviderReleaseGateRecord[];
  providerReleaseReadinessSummary: ProviderReleaseReadinessSummary;
  vmLifecycleProofs: VmLifecycleProof[];
  rollbackDestroyProofs: RollbackDestroyProofRecord[];
  ahvCreateAdapterContractReviews: AhvCreateAdapterContractReview[];
  ahvControlledProvisioningRuns: AhvControlledProvisioningRun[];
  productionReadinessReviews: ProductionReadinessReview[];
  lifecycleOperations: LifecycleOperationRecord[];
  auditExports: AuditExportRecord[];
  releaseEvidenceExports: ReleaseEvidenceExportRecord[];
  controlledLabReleaseRunbooks: ControlledLabReleaseRunbookRecord[];
  controlledLabDryRunWindows: ControlledLabDryRunWindowRecord[];
  labWindowEvidenceExports: LabWindowEvidenceExportRecord[];
  labEvidenceReviews: LabEvidenceReviewRecord[];
  labExecutionProposalEnvelopes: LabExecutionProposalEnvelope[];
  labExecutionProposalExports: LabExecutionProposalExportRecord[];
  controlledLabExecutionApprovals: ControlledLabExecutionApprovalGate[];
  controlledLabExecutionRehearsalPackets: ControlledLabExecutionRehearsalPacket[];
  controlledLabDryRunExecutionChecklists: ControlledLabDryRunExecutionChecklist[];
  controlledLabExecutionEvidenceLedgers: ControlledLabExecutionEvidenceLedger[];
  controlledLabExecutionReadinessAttestations: ControlledLabExecutionReadinessAttestation[];
  executionBrokerQueueRecords: ExecutionBrokerQueueRecord[];
  executionBrokerDispatchApprovals: ExecutionBrokerDispatchApproval[];
  realAdapterLabScopeActivations: RealAdapterLabScopeActivation[];
  manualRealAdapterSwitchReviews: ManualRealAdapterSwitchReview[];
  auditRetentionDiagnostics: AuditRetentionDiagnostics;
  approvals: ApprovalRequest[];
  templateGovernance: TemplateGovernance;
  updateTemplateGovernance: (id: string, field: "owner" | "tier", value: string) => void;
  decideApproval: (approvalId: string, decision: "approve" | "reject") => void;
  saveIntegrationConfig: (
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) => void;
  runIntegrationCheck: (integrationName: string) => void;
  runLabDiscovery: (adapterName: string) => void;
  importPrismInventory: () => void;
  runControlPlaneJobAction: (jobId: string, action: "advance" | "retry" | "fail") => void;
  createVmSandboxDryRun: () => void;
  recordLabAuthorizationScope: () => void;
  requestControlledProvisioningGate: () => void;
  decideControlledProvisioningGate: (gateId: string, decision: "approve" | "reject") => void;
  recordVmLifecycleProof: () => void;
  recordRollbackDestroyProof: () => void;
  reviewControlledCreateAuthorization: () => void;
  reviewAhvCreateAdapterContract: () => void;
  runAhvControlledProvisioningPreflight: () => void;
  createPlatformServiceRequest: (kind: PlatformServiceKind) => void;
  runPlatformServicePreflight: () => void;
  reviewPlatformServiceAdapterContract: () => void;
  reviewProviderReleaseGate: (provider?: ProviderReleaseGateRecord["provider"]) => void;
  createProductionReadinessReview: () => void;
  requestLifecycleOperation: (operation: LifecycleOperationKind) => void;
  prepareAuditExport: () => void;
  prepareReleaseEvidenceExport: () => void;
  prepareControlledLabReleaseRunbook: () => void;
  scheduleControlledLabDryRunWindow: () => void;
  prepareLabWindowEvidenceExport: () => void;
  reviewLabEvidencePackage: () => void;
  reviewLabExecutionProposalEnvelope: () => void;
  prepareLabExecutionProposalExport: () => void;
  recordControlledLabExecutionApproval: () => void;
  prepareControlledLabExecutionRehearsalPacket: () => void;
  recordControlledLabDryRunExecutionChecklist: () => void;
  recordControlledLabExecutionEvidenceLedger: () => void;
  recordControlledLabExecutionReadinessAttestation: () => void;
  queueExecutionBrokerRecord: () => void;
  recordExecutionBrokerDispatchApproval: () => void;
  recordRealAdapterLabScopeActivation: () => void;
  recordManualRealAdapterSwitchReview: () => void;
  reviewAdapterEnablement: () => void;
  requestEnvironmentDestroy: (name: string) => void;
  runTemplateRegistryAction: (
    templateId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
  runResourceProfileAction: (
    profileId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
  openEnvironmentDetail: (name: string) => void;
}) {
  const pendingApprovals = approvals.filter((approval) => approval.status === "Pending").length;
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const adminTabs: Array<{ id: AdminTab; label: string; detail: string }> = [
    { id: "overview", label: "Overview", detail: "Access and readiness" },
    { id: "providers", label: "Providers", detail: "Config and adapters" },
    { id: "control", label: "Control plane", detail: "Jobs and approvals" },
    { id: "operations", label: "Operations", detail: "Lifecycle and audit" },
    { id: "governance", label: "Governance", detail: "Queues and controls" },
    { id: "templates", label: "Templates", detail: "Catalog and ownership" },
  ];

  return (
    <section className="screen">
      <div className="adminTabs" role="tablist" aria-label="Admin sections">
        {adminTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`adminTab ${activeTab === tab.id ? "active" : ""}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            <strong>{tab.label}</strong>
            <span>{tab.detail}</span>
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="adminTabPanel">
          <Panel title="Access model" action={session.authMode}>
            <div className="controlGrid">
              <CheckLine icon={UserRound} label="Current identity" value={`${session.displayName} (${session.user})`} passed />
              <CheckLine icon={ShieldCheck} label="Roles" value={session.roles.join(", ")} passed />
              <CheckLine icon={LockKeyhole} label="Trusted headers" value={`${sessionDiagnostics.trustedHeaderMode} mode`} passed={sessionDiagnostics.missingRequiredHeaders.length === 0} />
            </div>
            <SessionDiagnosticsPanel diagnostics={sessionDiagnostics} />
          </Panel>
          <Panel title="Integration readiness" action="API connected">
            <div className="integrationList">
              {integrations.map(({ name, label, state, score }) => (
                <div className="integrationRow" key={name}>
                  <div className="integrationLogo">{name}</div>
                  <div>
                    <strong>{label}</strong>
                    <span>{state}</span>
                  </div>
                  <meter min="0" max="100" value={Number(score)} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Platform controls" action="Admin">
            <div className="controlGrid">
              <CheckLine icon={ShieldCheck} label="Policy packs" value="12 active, 3 draft" passed />
              <CheckLine icon={Layers3} label="Templates" value={`${templates.length} published golden paths`} passed />
              <CheckLine icon={CircleDollarSign} label="Budgets" value="$25k monthly sandbox limit" passed />
              <CheckLine icon={LockKeyhole} label="Approvals" value="AI and regulated data require review" passed={false} />
            </div>
          </Panel>
          <Panel title="Production readiness review" action={`${productionReadinessReviews.length} reviews`}>
            <ProductionReadinessPanel
              reviews={productionReadinessReviews}
              createProductionReadinessReview={createProductionReadinessReview}
            />
          </Panel>
        </div>
      )}

      {activeTab === "providers" && (
        <div className="adminTabPanel">
          <Panel title="Integration configuration" action="Lab readiness">
            <IntegrationConfigPanel
              integrations={integrations}
              configs={integrationConfigs}
              saveIntegrationConfig={saveIntegrationConfig}
              runIntegrationCheck={runIntegrationCheck}
            />
          </Panel>
          <Panel title="Credential reference diagnostics" action={`${credentialDiagnostics.filter((item) => item.status === "Approved reference").length}/${credentialDiagnostics.length} approved`}>
            <CredentialReferenceDiagnosticsPanel diagnostics={credentialDiagnostics} />
          </Panel>
          <Panel title="Lab adapter pilot" action="Read-only">
            <LabAdapterPanel
              adapters={labAdapters}
              systemStatus={systemStatus}
              runLabDiscovery={runLabDiscovery}
            />
          </Panel>
          <Panel title="Prism read-only inventory" action={`${prismInventory.length} records`}>
            <PrismInventoryPanel
              records={prismInventory}
              lastImport={prismInventoryImport}
              importPrismInventory={importPrismInventory}
            />
          </Panel>
          <Panel title="Provider readiness" action={`${provisioningAdapters.length} adapters`}>
            <ProvisioningAdapterPanel adapters={provisioningAdapters} platformConfig={platformConfig} />
          </Panel>
          <Panel title="Adapter enablement contract" action={`${adapterEnablementRecords.length} reviews`}>
            <AdapterEnablementPanel
              records={adapterEnablementRecords}
              reviewAdapterEnablement={reviewAdapterEnablement}
            />
          </Panel>
        </div>
      )}

      {activeTab === "control" && (
        <div className="adminTabPanel">
          <Panel title="Provisioning control plane" action={`${controlPlaneJobs.length} jobs`}>
            <ControlPlaneQueue jobs={controlPlaneJobs} runControlPlaneJobAction={runControlPlaneJobAction} />
          </Panel>
          <Panel title="VM sandbox dry-run" action={`${vmSandboxDryRuns.length} plans`}>
            <VmSandboxDryRunPanel plans={vmSandboxDryRuns} createVmSandboxDryRun={createVmSandboxDryRun} />
          </Panel>
          <Panel title="Lab authorization and lifecycle proof" action={`${labAuthorizationScopes.length + vmLifecycleProofs.length} records`}>
            <LifecycleEvidencePanel
              scopes={labAuthorizationScopes}
              diagnostics={labScopeDiagnostics}
              proofs={vmLifecycleProofs}
              recordLabAuthorizationScope={recordLabAuthorizationScope}
              recordVmLifecycleProof={recordVmLifecycleProof}
            />
          </Panel>
          <Panel title="Rollback and destroy proof" action={`${rollbackDestroyProofs.length} records`}>
            <RollbackDestroyProofPanel
              proofs={rollbackDestroyProofs}
              recordRollbackDestroyProof={recordRollbackDestroyProof}
            />
          </Panel>
          <Panel title="Controlled provisioning gate" action={`${controlledProvisioningGates.length} reviews`}>
            <ControlledProvisioningGatePanel
              gates={controlledProvisioningGates}
              requestControlledProvisioningGate={requestControlledProvisioningGate}
              decideControlledProvisioningGate={decideControlledProvisioningGate}
            />
          </Panel>
          <Panel title="Controlled create authorization" action={`${controlledCreateAuthorizationEnvelopes.length} reviews`}>
            <ControlledCreateAuthorizationPanel
              envelopes={controlledCreateAuthorizationEnvelopes}
              reviewControlledCreateAuthorization={reviewControlledCreateAuthorization}
            />
          </Panel>
          <Panel title="AHV create adapter contract" action={`${ahvCreateAdapterContractReviews.length} reviews`}>
            <AhvCreateAdapterContractPanel
              reviews={ahvCreateAdapterContractReviews}
              reviewAhvCreateAdapterContract={reviewAhvCreateAdapterContract}
            />
          </Panel>
          <Panel title="AHV controlled preflight" action={`${ahvControlledProvisioningRuns.length} runs`}>
            <AhvControlledPreflightPanel
              runs={ahvControlledProvisioningRuns}
              runAhvControlledProvisioningPreflight={runAhvControlledProvisioningPreflight}
            />
          </Panel>
          <Panel title="Platform service flows" action={`${platformServiceRequests.length} planned`}>
            <PlatformServiceRequestPanel
              requests={platformServiceRequests}
              createPlatformServiceRequest={createPlatformServiceRequest}
            />
          </Panel>
          <Panel title="Platform service preflight" action={`${platformServicePreflightRuns.length} runs`}>
            <PlatformServicePreflightPanel
              runs={platformServicePreflightRuns}
              runPlatformServicePreflight={runPlatformServicePreflight}
            />
          </Panel>
          <Panel title="Platform service adapter contracts" action={`${platformServiceAdapterContractReviews.length} reviews`}>
            <PlatformServiceAdapterContractPanel
              reviews={platformServiceAdapterContractReviews}
              reviewPlatformServiceAdapterContract={reviewPlatformServiceAdapterContract}
            />
          </Panel>
          <Panel title="Provider release readiness" action={`${providerReleaseReadinessSummary.providers.length} providers`}>
            <ProviderReleaseReadinessPanel summary={providerReleaseReadinessSummary} />
          </Panel>
          <Panel title="Provider release gates" action={`${providerReleaseGateRecords.length} reviews`}>
            <ProviderReleaseGatePanel
              records={providerReleaseGateRecords}
              reviewProviderReleaseGate={reviewProviderReleaseGate}
            />
          </Panel>
          <Panel title="Approval queue" action={`${pendingApprovals} pending`}>
            <ApprovalQueue
              approvals={approvals}
              decideApproval={decideApproval}
              openEnvironmentDetail={openEnvironmentDetail}
            />
          </Panel>
        </div>
      )}

      {activeTab === "operations" && (
        <div className="adminTabPanel">
          <Panel title="Private cloud lifecycle" action={`${lifecycleOperations.length} records`}>
            <PrivateCloudOperationsPanel
              environments={environments}
              operations={lifecycleOperations}
              requestLifecycleOperation={requestLifecycleOperation}
            />
          </Panel>
          <Panel title="Audit export boundary" action={`${auditExports.length} exports`}>
            <AuditExportPanel
              auditExports={auditExports}
              auditRetentionDiagnostics={auditRetentionDiagnostics}
              prepareAuditExport={prepareAuditExport}
            />
          </Panel>
          <Panel title="Release evidence exports" action={`${releaseEvidenceExports.length} exports`}>
            <ReleaseEvidenceExportPanel
              exports={releaseEvidenceExports}
              prepareReleaseEvidenceExport={prepareReleaseEvidenceExport}
            />
          </Panel>
          <Panel title="Controlled lab release runbook" action={`${controlledLabReleaseRunbooks.length} records`}>
            <ControlledLabReleaseRunbookPanel
              runbooks={controlledLabReleaseRunbooks}
              prepareControlledLabReleaseRunbook={prepareControlledLabReleaseRunbook}
            />
          </Panel>
          <Panel title="Controlled lab dry-run window" action={`${controlledLabDryRunWindows.length} windows`}>
            <ControlledLabDryRunWindowPanel
              windows={controlledLabDryRunWindows}
              scheduleControlledLabDryRunWindow={scheduleControlledLabDryRunWindow}
            />
          </Panel>
          <Panel title="Lab window evidence exports" action={`${labWindowEvidenceExports.length} exports`}>
            <LabWindowEvidenceExportPanel
              exports={labWindowEvidenceExports}
              prepareLabWindowEvidenceExport={prepareLabWindowEvidenceExport}
            />
          </Panel>
          <Panel title="Lab evidence review queue" action={`${labEvidenceReviews.length} reviews`}>
            <LabEvidenceReviewPanel
              reviews={labEvidenceReviews}
              reviewLabEvidencePackage={reviewLabEvidencePackage}
            />
          </Panel>
          <Panel title="Lab execution proposal envelope" action={`${labExecutionProposalEnvelopes.length} envelopes`}>
            <LabExecutionProposalEnvelopePanel
              envelopes={labExecutionProposalEnvelopes}
              reviewLabExecutionProposalEnvelope={reviewLabExecutionProposalEnvelope}
            />
          </Panel>
          <Panel title="Lab execution proposal exports" action={`${labExecutionProposalExports.length} exports`}>
            <LabExecutionProposalExportPanel
              exports={labExecutionProposalExports}
              prepareLabExecutionProposalExport={prepareLabExecutionProposalExport}
            />
          </Panel>
          <Panel title="Controlled lab execution approvals" action={`${controlledLabExecutionApprovals.length} approvals`}>
            <ControlledLabExecutionApprovalPanel
              approvals={controlledLabExecutionApprovals}
              recordControlledLabExecutionApproval={recordControlledLabExecutionApproval}
            />
          </Panel>
          <Panel title="Controlled lab rehearsal packets" action={`${controlledLabExecutionRehearsalPackets.length} packets`}>
            <ControlledLabExecutionRehearsalPacketPanel
              packets={controlledLabExecutionRehearsalPackets}
              prepareControlledLabExecutionRehearsalPacket={prepareControlledLabExecutionRehearsalPacket}
            />
          </Panel>
          <Panel title="Controlled lab dry-run checklists" action={`${controlledLabDryRunExecutionChecklists.length} checklists`}>
            <ControlledLabDryRunExecutionChecklistPanel
              checklists={controlledLabDryRunExecutionChecklists}
              recordControlledLabDryRunExecutionChecklist={recordControlledLabDryRunExecutionChecklist}
            />
          </Panel>
          <Panel title="Controlled lab evidence ledger" action={`${controlledLabExecutionEvidenceLedgers.length} ledgers`}>
            <ControlledLabExecutionEvidenceLedgerPanel
              ledgers={controlledLabExecutionEvidenceLedgers}
              recordControlledLabExecutionEvidenceLedger={recordControlledLabExecutionEvidenceLedger}
            />
          </Panel>
          <Panel title="Controlled lab readiness attestations" action={`${controlledLabExecutionReadinessAttestations.length} attestations`}>
            <ControlledLabExecutionReadinessAttestationPanel
              attestations={controlledLabExecutionReadinessAttestations}
              recordControlledLabExecutionReadinessAttestation={recordControlledLabExecutionReadinessAttestation}
            />
          </Panel>
          <Panel title="Execution broker queue" action={`${executionBrokerQueueRecords.length} records`}>
            <ExecutionBrokerQueuePanel
              records={executionBrokerQueueRecords}
              queueExecutionBrokerRecord={queueExecutionBrokerRecord}
            />
          </Panel>
          <Panel title="Execution broker dispatch approvals" action={`${executionBrokerDispatchApprovals.length} approvals`}>
            <ExecutionBrokerDispatchApprovalPanel
              approvals={executionBrokerDispatchApprovals}
              recordExecutionBrokerDispatchApproval={recordExecutionBrokerDispatchApproval}
            />
          </Panel>
          <Panel title="Real adapter lab scope activation" action={`${realAdapterLabScopeActivations.length} records`}>
            <RealAdapterLabScopeActivationPanel
              activations={realAdapterLabScopeActivations}
              recordRealAdapterLabScopeActivation={recordRealAdapterLabScopeActivation}
            />
          </Panel>
          <Panel title="Manual real-adapter switch review" action={`${manualRealAdapterSwitchReviews.length} reviews`}>
            <ManualRealAdapterSwitchReviewPanel
              reviews={manualRealAdapterSwitchReviews}
              recordManualRealAdapterSwitchReview={recordManualRealAdapterSwitchReview}
            />
          </Panel>
        </div>
      )}

      {activeTab === "governance" && (
        <div className="adminTabPanel">
          <Panel title="Governance queue" action={`${environments.filter((env) => env.status !== "Ready").length} open`}>
            <div className="envTable">
              {environments.map((env) => (
                <div className="envRow governanceRow" key={env.name}>
                  <button className="buttonRowLike ghostRowButton" onClick={() => openEnvironmentDetail(env.name)}>
                    <div>
                      <strong>{env.name}</strong>
                      <span>
                        {env.owner} / {env.region}
                      </span>
                    </div>
                    <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
                  </button>
                  <button className="smallButton dangerButton" onClick={() => requestEnvironmentDestroy(env.name)}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Hosted integration path" action="Real API path">
            <div className="readinessList">
              {integrations.map((integration) => (
                <div className="readinessRow" key={integration.name}>
                  <strong>{integration.product}</strong>
                  <span>{integration.readiness}</span>
                  <small>{integration.nextStep}</small>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="adminTabPanel">
          <Panel title="Image and template catalog" action={`${resourceProfiles.length} profiles`}>
            <ResourceProfileCatalog profiles={resourceProfiles} runResourceProfileAction={runResourceProfileAction} />
          </Panel>
          <Panel title="Template registry" action={`${templateRegistry.length} versions`}>
            <TemplateRegistryPanel
              entries={templateRegistry}
              policyBundles={policyBundles}
              runTemplateRegistryAction={runTemplateRegistryAction}
            />
          </Panel>
          <Panel title="Policy bundles" action={`${policyBundles.length} bundles`}>
            <PolicyBundlePanel bundles={policyBundles} />
          </Panel>
          <Panel title="Template governance" action="Editable">
            <div className="templateEditList">
              {templates.map((template) => (
                <div className="templateEditRow" key={template.id}>
                  <div className="editRowHeader">
                    <strong>{template.name}</strong>
                    <Pencil size={15} />
                  </div>
                  <label className="field compact">
                    Owner
                    <input
                      value={templateGovernance[template.id]?.owner ?? template.owner}
                      onChange={(event) => updateTemplateGovernance(template.id, "owner", event.target.value)}
                    />
                  </label>
                  <label className="field compact">
                    Tier
                    <select
                      value={templateGovernance[template.id]?.tier ?? template.tier}
                      onChange={(event) => updateTemplateGovernance(template.id, "tier", event.target.value)}
                    >
                      <option>Standard</option>
                      <option>Regulated</option>
                      <option>Accelerated</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </section>
  );
}

function ApprovalQueue({
  approvals,
  compact = false,
  decideApproval,
  openEnvironmentDetail,
}: {
  approvals: ApprovalRequest[];
  compact?: boolean;
  decideApproval?: (approvalId: string, decision: "approve" | "reject") => void;
  openEnvironmentDetail: (name: string) => void;
}) {
  if (approvals.length === 0) {
    return <p className="emptyState">No approval requests are queued.</p>;
  }

  return (
    <div className="approvalList">
      {approvals.map((approval) => (
        <div className="approvalRow" key={approval.id}>
          <div>
            <strong>{approval.environmentName}</strong>
            <span>{approval.reason}</span>
            {!compact && <small>{approval.owner} / {approval.template}</small>}
          </div>
          <span className={`status ${approval.status === "Pending" ? "approval" : approval.status === "Approved" ? "ready" : "failed"}`}>
            {approval.status}
          </span>
          <div className="inlineActions">
            <button className="iconTextButton" onClick={() => openEnvironmentDetail(approval.environmentName)}>
              <ExternalLink size={15} />
              Detail
            </button>
            {decideApproval && approval.status === "Pending" && (
              <>
                <button className="smallButton successButton" onClick={() => decideApproval(approval.id, "approve")}>
                  Approve
                </button>
                <button className="smallButton dangerButton" onClick={() => decideApproval(approval.id, "reject")}>
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductionReadinessPanel({
  reviews,
  createProductionReadinessReview,
}: {
  reviews: ProductionReadinessReview[];
  createProductionReadinessReview: () => void;
}) {
  const latest = reviews[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Release readiness gate</strong>
          <span>Rolls up identity, persistence, audit, lab scope, lifecycle proof, and preflight evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={createProductionReadinessReview}>
          <Play size={15} />
          Run readiness review
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production readiness reviews have been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.id}</strong>
              <span>{latest.reviewer}</span>
            </div>
            <span className={`status ${latest.status === "Ready for review" ? "approval" : "failed"}`}>{latest.status}</span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Evidence</strong>
            {latest.evidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlPlaneQueue({
  jobs,
  compact = false,
  runControlPlaneJobAction,
}: {
  jobs: ControlPlaneJob[];
  compact?: boolean;
  runControlPlaneJobAction?: (jobId: string, action: "advance" | "retry" | "fail") => void;
}) {
  if (jobs.length === 0) {
    return <p className="emptyState">No control-plane jobs are queued.</p>;
  }

  return (
    <div className="controlPlaneList">
      {jobs.map((job) => (
        <div className="controlPlaneRow" key={job.id}>
          <div className="integrationConfigHeader">
            <div>
              <strong>{job.environmentName}</strong>
              <span>
                {job.operation} / {job.template}
              </span>
            </div>
            <span className={`status ${controlPlaneClass(job.state)}`}>{job.state}</span>
          </div>
          {!compact && (
            <div className="labScope">
              <span>{job.transitions[0]?.message ?? "Waiting for worker."}</span>
              <small>
                {job.worker} / attempts {job.attempts}/{job.maxAttempts} / provisioning disabled
              </small>
            </div>
          )}
          {runControlPlaneJobAction && (
            <div className="inlineActions">
              <button className="iconTextButton" onClick={() => runControlPlaneJobAction(job.id, "advance")}>
                <Play size={15} />
                Advance
              </button>
              <button className="iconTextButton" onClick={() => runControlPlaneJobAction(job.id, "retry")}>
                <RefreshCw size={15} />
                Retry
              </button>
              <button className="smallButton dangerButton" onClick={() => runControlPlaneJobAction(job.id, "fail")}>
                Fail
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VmSandboxDryRunPanel({
  plans,
  createVmSandboxDryRun,
}: {
  plans: VmSandboxDryRunPlan[];
  createVmSandboxDryRun: () => void;
}) {
  const latest = plans[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Dry-run only</strong>
          <span>Validates VM sandbox inputs and rollback evidence without creating AHV resources.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={createVmSandboxDryRun}>
          <Play size={15} />
          Generate dry-run
        </button>
        {latest && <small>Last plan {formatDateTime(latest.createdAt)}</small>}
      </div>
      {!latest ? (
        <p className="emptyState">No VM sandbox dry-run plans have been generated.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>
                {latest.imageName} / {latest.project} / {latest.network}
              </span>
            </div>
            <span className="status ready">Dry-run</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Gauge} label="Quota" value={`${latest.quota.cpu} vCPU / ${latest.quota.memoryGb} GB / ${latest.quota.diskGb} GB`} passed />
            <CheckLine icon={CircleDollarSign} label="Cost" value={`$${latest.estimatedMonthlyCost}/mo estimate`} passed />
            <CheckLine icon={Activity} label="Expiry" value={`${latest.expiryDays} days`} passed={latest.expiryDays <= 30} />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.validations.map((validation) => (
              <div className="dryRunValidationRow" key={validation.name}>
                <span className={`status ${validation.passed ? "ready" : "failed"}`}>
                  {validation.passed ? "Pass" : "Fail"}
                </span>
                <div>
                  <strong>{validation.name}</strong>
                  <small>{validation.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Approval evidence</strong>
            {latest.approvalEvidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Rollback plan</strong>
            {latest.rollbackPlan.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionDiagnosticsPanel({ diagnostics }: { diagnostics: SessionDiagnostics }) {
  return (
    <div className="readinessList">
      <div className="readinessRow">
        <strong>Identity boundary</strong>
        <span>{diagnostics.identityProvider}</span>
        <small>
          {diagnostics.missingRequiredHeaders.length === 0
            ? "Required identity headers are present or optional for this deployment."
            : `Missing required headers: ${diagnostics.missingRequiredHeaders.join(", ")}`}
        </small>
      </div>
      {diagnostics.authorizationMatrix.map((entry) => (
        <div className="readinessRow" key={entry.action}>
          <strong>{entry.action}</strong>
          <span>{entry.roles.join(", ")}</span>
          <small>{entry.boundary}</small>
        </div>
      ))}
    </div>
  );
}

function PrivateCloudOperationsPanel({
  environments,
  operations,
  requestLifecycleOperation,
}: {
  environments: Environment[];
  operations: LifecycleOperationRecord[];
  requestLifecycleOperation: (operation: LifecycleOperationKind) => void;
}) {
  const latest = operations[0];

  return (
    <div className="dryRunPanel">
      <div className="preflightHeader">
        <Archive size={18} />
        <div>
          <strong>Operational lifecycle requests</strong>
          <span>Extend, suspend, destroy, and rebuild are recorded as gated operator actions.</span>
        </div>
      </div>
      <div className="inlineActions">
        {(["Extend", "Suspend", "Destroy", "Rebuild"] as LifecycleOperationKind[]).map((operation) => (
          <button className="iconTextButton" key={operation} onClick={() => requestLifecycleOperation(operation)}>
            <Play size={15} />
            {operation}
          </button>
        ))}
      </div>
      <div className="miniMetrics">
        <div>
          <strong>{environments.length}</strong>
          <span>tracked environments</span>
        </div>
        <div>
          <strong>{operations.filter((operation) => operation.status === "Blocked").length}</strong>
          <span>blocked operations</span>
        </div>
      </div>
      {!latest ? (
        <p className="emptyState">No private-cloud lifecycle operations have been requested.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.operation} / {latest.environmentName}</strong>
              <span>{latest.status}</span>
            </div>
            <span className={`statusPill ${latest.status === "Blocked" ? "warn" : "ready"}`}>{latest.status}</span>
          </div>
          <div className="bulletList">
            {latest.checks.map((check) => (
              <CheckLine key={check.name} icon={ShieldCheck} label={check.name} value={check.detail} passed={check.passed} />
            ))}
          </div>
          <div className="planList">
            <strong>Operator runbook</strong>
            {latest.runbook.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AuditExportPanel({
  auditExports,
  auditRetentionDiagnostics,
  prepareAuditExport,
}: {
  auditExports: AuditExportRecord[];
  auditRetentionDiagnostics: AuditRetentionDiagnostics;
  prepareAuditExport: () => void;
}) {
  const latest = auditExports[0];

  return (
    <div className="dryRunPanel">
      <div className="preflightHeader">
        <ScrollText size={18} />
        <div>
          <strong>Audit export readiness</strong>
          <span>Prepares export metadata and redaction boundaries for on-prem operations.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareAuditExport}>
          <Play size={15} />
          Prepare audit export
        </button>
      </div>
      <div className="miniMetrics">
        <div>
          <strong>{auditRetentionDiagnostics.currentEvents}</strong>
          <span>retained events</span>
        </div>
        <div>
          <strong>{auditRetentionDiagnostics.retentionEvents}</strong>
          <span>retention window</span>
        </div>
        <div>
          <strong>{auditRetentionDiagnostics.exportDestination.valid ? "Valid" : "Blocked"}</strong>
          <span>destination</span>
        </div>
      </div>
      {!latest ? (
        <p className="emptyState">No audit export records have been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.format} export / {latest.eventCount} events</strong>
              <span>Retention window: {latest.retentionEvents} events / checksum {latest.checksum.slice(0, 12)}</span>
            </div>
            <span className="statusPill ready">{latest.status}</span>
          </div>
          <div className="planList">
            <span>{latest.redactionBoundary}</span>
            <span>{latest.storageBoundary}</span>
            <span>Manifest destination: {latest.manifest.destinationRef}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationConfigPanel({
  integrations,
  configs,
  saveIntegrationConfig,
  runIntegrationCheck,
}: {
  integrations: Integration[];
  configs: IntegrationConfig[];
  saveIntegrationConfig: (
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) => void;
  runIntegrationCheck: (integrationName: string) => void;
}) {
  return (
    <div className="integrationConfigList">
      {integrations.map((integration) => (
        <IntegrationConfigRow
          key={integration.name}
          integration={integration}
          config={configs.find((item) => item.name === integration.name) ?? createEmptyIntegrationConfig(integration.name)}
          saveIntegrationConfig={saveIntegrationConfig}
          runIntegrationCheck={runIntegrationCheck}
        />
      ))}
    </div>
  );
}

function CredentialReferenceDiagnosticsPanel({
  diagnostics,
}: {
  diagnostics: CredentialReferenceDiagnostic[];
}) {
  return (
    <div className="readinessList">
      {diagnostics.map((diagnostic) => (
        <div className="readinessRow" key={diagnostic.provider}>
          <strong>{diagnostic.provider} credential reference</strong>
          <span>{diagnostic.status} / {diagnostic.credentialProfile}</span>
          <small>{diagnostic.redactionBoundary}</small>
          <div className="bulletList compactList">
            {diagnostic.checks.map((check) => (
              <CheckLine key={check.name} icon={LockKeyhole} label={check.name} value={check.detail} passed={check.passed} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LabAdapterPanel({
  adapters,
  systemStatus,
  runLabDiscovery,
}: {
  adapters: LabAdapterSnapshot[];
  systemStatus: SystemStatus;
  runLabDiscovery: (adapterName: string) => void;
}) {
  return (
    <div className="labAdapterList">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Provisioning disabled</strong>
          <span>
            Read-only discovery only. {systemStatus.integrations.readOnlyCandidates} adapter candidate
            {systemStatus.integrations.readOnlyCandidates === 1 ? "" : "s"} ready for review.
          </span>
        </div>
      </div>
      {adapters.map((adapter) => (
        <div className="labAdapterRow" key={adapter.name}>
          <div className="integrationConfigHeader">
            <div className="integrationLogo">{adapter.name}</div>
            <div>
              <strong>{adapter.product}</strong>
              <span>{adapter.message}</span>
            </div>
            <span className={`status ${labAdapterClass(adapter.mode)}`}>{adapter.mode}</span>
          </div>
          <div className="labScope">
            <span>{adapter.scope}</span>
            <small>{adapter.inventoryCount} inventory records / provisioning disabled</small>
          </div>
          <div className="inlineActions">
            <button className="iconTextButton" onClick={() => runLabDiscovery(adapter.name)}>
              <RefreshCw size={15} />
              Discover
            </button>
            {adapter.lastDiscoveryAt && <small>Last discovery {formatDateTime(adapter.lastDiscoveryAt)}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrismInventoryPanel({
  records,
  lastImport,
  importPrismInventory,
}: {
  records: PrismInventoryRecord[];
  lastImport?: PrismInventoryImportResult;
  importPrismInventory: () => void;
}) {
  const imageCandidates = records.filter((record) => record.kind === "Image" && record.profileCandidate).length;

  return (
    <div className="prismInventoryPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Read-only Prism Central import</strong>
          <span>
            {lastImport
              ? `${lastImport.mode} imported ${lastImport.recordsImported} records with ${imageCandidates} image candidates.`
              : "Import requires reachable NCI config. Real adapter calls remain disabled."}
          </span>
        </div>
      </div>
      {lastImport && (
        <div className="inventoryEvidence">
          <strong>{lastImport.evidence}</strong>
          <span>
            {lastImport.scope.project} / {lastImport.scope.cluster} / {lastImport.scope.network}
          </span>
          <small>{lastImport.mutationOperationsBlocked.join(", ")} blocked</small>
        </div>
      )}
      <div className="inlineActions">
        <button className="iconTextButton" onClick={importPrismInventory}>
          <RefreshCw size={15} />
          Import inventory
        </button>
        {lastImport && <small>Last import {formatDateTime(lastImport.importedAt)}</small>}
      </div>
      {records.length === 0 ? (
        <p className="emptyState">No Prism inventory has been imported yet.</p>
      ) : (
        <div className="prismInventoryList">
          {records.map((record) => (
            <div className="prismInventoryRow" key={record.id}>
              <div>
                <strong>{record.name}</strong>
                <span>
                  {record.kind} / {record.cluster ?? "No cluster"} / {record.project ?? "No project"}
                </span>
                <small>{record.rawRef}</small>
              </div>
              <span className={`status ${record.profileCandidate ? "approval" : "ready"}`}>
                {record.profileCandidate ? "Profile candidate" : record.kind}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceProfileCatalog({
  profiles,
  runResourceProfileAction,
}: {
  profiles: ResourceProfile[];
  runResourceProfileAction?: (
    profileId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
}) {
  return (
    <div className="resourceProfileList">
      {profiles.map((profile) => (
        <div className="resourceProfileRow" key={profile.id}>
          <div className="integrationConfigHeader">
            <div className="integrationLogo">{profile.provider}</div>
            <div>
              <strong>{profile.name}</strong>
              <span>
                {profile.kind} / {profile.version} / {profile.region}
              </span>
            </div>
            <span className={`status ${resourceProfileClass(profile.status)}`}>{profile.status}</span>
          </div>
          <div className="labScope">
            <span>{profile.notes}</span>
            <small>
              {profile.owner}
              {profile.approvedBy ? ` / approved by ${profile.approvedBy}` : ""}
            </small>
          </div>
          {runResourceProfileAction && (
            <RegistryActions
              id={profile.id}
              status={profile.status}
              runAction={runResourceProfileAction}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TemplateRegistryPanel({
  entries,
  policyBundles,
  runTemplateRegistryAction,
}: {
  entries: TemplateRegistryEntry[];
  policyBundles: PolicyBundle[];
  runTemplateRegistryAction: (
    templateId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
}) {
  return (
    <div className="templateRegistryList">
      {entries.map((entry) => (
        <div className="templateRegistryRow" key={entry.templateId}>
          <div className="integrationConfigHeader">
            <div>
              <strong>{entry.templateName}</strong>
              <span>
                v{entry.version} / {entry.owner}
              </span>
            </div>
            <span className={`status ${registryStatusClass(entry.status)}`}>{entry.status}</span>
          </div>
          <div className="policyChipRow">
            {entry.policyBundleIds.map((bundleId) => {
              const bundle = policyBundles.find((item) => item.id === bundleId);
              return (
                <span className="policyChip" key={bundleId}>
                  {bundle?.name ?? bundleId}
                </span>
              );
            })}
          </div>
          <div className="labScope">
            <span>{entry.approvalEvidence}</span>
            <small>{entry.notes}</small>
          </div>
          <RegistryActions id={entry.templateId} status={entry.status} runAction={runTemplateRegistryAction} />
        </div>
      ))}
    </div>
  );
}

function PolicyBundlePanel({ bundles }: { bundles: PolicyBundle[] }) {
  return (
    <div className="policyBundleList">
      {bundles.map((bundle) => (
        <div className="policyBundleRow" key={bundle.id}>
          <div>
            <strong>{bundle.name}</strong>
            <span>{bundle.owner}</span>
          </div>
          <div className="policyChipRow">
            {bundle.controls.map((control) => (
              <span className="policyChip" key={control}>
                {control}
              </span>
            ))}
          </div>
          <small>{bundle.evidence}</small>
        </div>
      ))}
    </div>
  );
}

function RegistryActions({
  id,
  status,
  runAction,
}: {
  id: string;
  status: RegistryStatus;
  runAction: (id: string, action: "submit" | "approve" | "deprecate" | "restore") => void;
}) {
  return (
    <div className="inlineActions">
      {status === "Draft" && (
        <button className="iconTextButton" onClick={() => runAction(id, "submit")}>
          <Play size={15} />
          Submit review
        </button>
      )}
      {status === "Pending approval" && (
        <button className="smallButton successButton" onClick={() => runAction(id, "approve")}>
          Approve publish
        </button>
      )}
      {status === "Published" && (
        <button className="smallButton dangerButton" onClick={() => runAction(id, "deprecate")}>
          Deprecate
        </button>
      )}
      {status === "Deprecated" && (
        <button className="iconTextButton" onClick={() => runAction(id, "restore")}>
          <RefreshCw size={15} />
          Restore draft
        </button>
      )}
    </div>
  );
}

function ReleaseEvidenceExportPanel({
  exports,
  prepareReleaseEvidenceExport,
}: {
  exports: ReleaseEvidenceExportRecord[];
  prepareReleaseEvidenceExport: () => void;
}) {
  const latest = exports[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Archive size={18} />
        <div>
          <strong>Release evidence manifest</strong>
          <span>Exports provider release gate evidence as redacted metadata for operations and security review.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareReleaseEvidenceExport}>
          <Archive size={15} />
          Prepare release evidence
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No release evidence export has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.id}</span>
            </div>
            <span className="status ready">{latest.status}</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Gate" value={latest.manifest.gateStatus} passed={latest.manifest.gateStatus === "Ready for release review"} />
            <CheckLine icon={Gauge} label="Checks" value={`${latest.manifest.passedChecks}/${latest.manifest.checkCount} passed`} passed={latest.manifest.passedChecks === latest.manifest.checkCount} />
            <CheckLine icon={LockKeyhole} label="Kill switch" value={`${latest.manifest.killSwitch.name}: ${latest.manifest.killSwitch.enabled ? "enabled" : "disabled"}`} passed={!latest.manifest.killSwitch.enabled} />
            <CheckLine icon={Archive} label="Checksum" value={latest.checksum.slice(0, 12)} passed />
          </div>
          <div className="inventoryEvidence">
            <strong>Evidence references</strong>
            {latest.manifest.evidenceReferences.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Redaction boundary</strong>
            <span>{latest.redactionBoundary}</span>
            <span>{latest.storageBoundary}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledLabReleaseRunbookPanel({
  runbooks,
  prepareControlledLabReleaseRunbook,
}: {
  runbooks: ControlledLabReleaseRunbookRecord[];
  prepareControlledLabReleaseRunbook: () => void;
}) {
  const latest = runbooks[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ScrollText size={18} />
        <div>
          <strong>Operator release runbook</strong>
          <span>Records human sign-offs, stop conditions, and escalation contacts before any controlled lab adapter release proposal.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareControlledLabReleaseRunbook}>
          <ScrollText size={15} />
          Prepare runbook
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled lab release runbook has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.id}</span>
            </div>
            <span className={`status ${latest.status === "Ready for controlled lab release review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Release gate" value={latest.linkedReleaseGateId ?? "missing"} passed={Boolean(latest.linkedReleaseGateId)} />
            <CheckLine icon={UserRound} label="Sign-offs" value={`${latest.signOffs.filter((item) => item.signed).length}/${latest.signOffs.length} recorded`} passed={latest.signOffs.every((item) => item.signed)} />
            <CheckLine icon={Gauge} label="Stop conditions" value={`${latest.stopConditions.length}`} passed={latest.stopConditions.length >= 3} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed />
          </div>
          <div className="inventoryEvidence">
            <strong>Required sign-offs</strong>
            {latest.signOffs.map((signOff) => (
              <span key={signOff.role}>
                {signOff.role}: {signOff.signed ? signOff.evidence : "missing evidence"} ({signOff.owner})
              </span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Stop conditions</strong>
            {latest.stopConditions.map((condition) => (
              <span key={condition}>{condition}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Escalation contacts</strong>
            {latest.escalationContacts.map((contact) => (
              <span key={contact}>{contact}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledLabDryRunWindowPanel({
  windows,
  scheduleControlledLabDryRunWindow,
}: {
  windows: ControlledLabDryRunWindowRecord[];
  scheduleControlledLabDryRunWindow: () => void;
}) {
  const latest = windows[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Activity size={18} />
        <div>
          <strong>Controlled lab dry-run window</strong>
          <span>Schedules an evidence-only lab window with linked runbook, release export, scope, rollback owner, and emergency stop contacts.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={scheduleControlledLabDryRunWindow}>
          <Activity size={15} />
          Schedule dry-run window
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled lab dry-run window has been scheduled.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.scheduledStart} to {latest.scheduledEnd}</span>
            </div>
            <span className={`status ${latest.status === "Ready for scheduling review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ScrollText} label="Runbook" value={latest.linkedRunbookId ?? "missing"} passed={Boolean(latest.linkedRunbookId)} />
            <CheckLine icon={Archive} label="Release export" value={latest.linkedReleaseEvidenceExportId ?? "missing"} passed={Boolean(latest.linkedReleaseEvidenceExportId)} />
            <CheckLine icon={ShieldCheck} label="Lab scope" value={latest.linkedLabScopeId ?? "missing"} passed={Boolean(latest.linkedLabScopeId)} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed />
          </div>
          <div className="inventoryEvidence">
            <strong>Readiness checklist</strong>
            {latest.readinessChecklist.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Window checks</strong>
            {latest.checks.map((check) => (
              <span key={check.name}>{check.name}: {check.passed ? "passed" : "blocked"} - {check.detail}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Emergency stop contacts</strong>
            <span>Rollback owner: {latest.rollbackOwner || "missing"}</span>
            {latest.emergencyStopContacts.map((contact) => (
              <span key={contact}>{contact}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LabWindowEvidenceExportPanel({
  exports,
  prepareLabWindowEvidenceExport,
}: {
  exports: LabWindowEvidenceExportRecord[];
  prepareLabWindowEvidenceExport: () => void;
}) {
  const latest = exports[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Archive size={18} />
        <div>
          <strong>Lab window evidence manifest</strong>
          <span>Exports controlled lab window evidence as redacted metadata for operations and security review.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareLabWindowEvidenceExport}>
          <Archive size={15} />
          Prepare window evidence
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No lab window evidence export has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.id}</span>
            </div>
            <span className="status ready">{latest.status}</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Activity} label="Window" value={latest.manifest.windowStatus} passed={latest.manifest.windowStatus === "Ready for scheduling review"} />
            <CheckLine icon={Gauge} label="Checks" value={`${latest.manifest.passedChecks}/${latest.manifest.checkCount} passed`} passed={latest.manifest.passedChecks === latest.manifest.checkCount} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed />
            <CheckLine icon={Archive} label="Checksum" value={latest.checksum.slice(0, 12)} passed />
          </div>
          <div className="inventoryEvidence">
            <strong>Linked evidence</strong>
            <span>Runbook: {latest.manifest.linkedRunbookId ?? "missing"}</span>
            <span>Release export: {latest.manifest.linkedReleaseEvidenceExportId ?? "missing"}</span>
            <span>Lab scope: {latest.manifest.linkedLabScopeId ?? "missing"}</span>
            <span>Rollback owner: {latest.manifest.rollbackOwner || "missing"}</span>
          </div>
          <div className="inventoryEvidence">
            <strong>Redaction boundary</strong>
            <span>{latest.redactionBoundary}</span>
            <span>{latest.storageBoundary}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LabEvidenceReviewPanel({
  reviews,
  reviewLabEvidencePackage,
}: {
  reviews: LabEvidenceReviewRecord[];
  reviewLabEvidencePackage: () => void;
}) {
  const latest = reviews[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Lab evidence review queue</strong>
          <span>Records platform, security, and operations review decisions before any future lab execution proposal.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={reviewLabEvidencePackage}>
          <ShieldCheck size={15} />
          Review evidence package
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No lab evidence review has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.exportId}</span>
            </div>
            <span className={`status ${latest.status === "Accepted" ? "ready" : latest.status === "Rejected" ? "failed" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Archive} label="Export" value={latest.exportId} passed />
            <CheckLine icon={Activity} label="Window" value={latest.windowId} passed />
            <CheckLine icon={UserRound} label="Decisions" value={`${latest.decisions.filter((item) => item.decision !== "Pending").length}/${latest.decisions.length} recorded`} passed={latest.decisions.every((item) => item.decision !== "Pending")} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed />
          </div>
          <div className="inventoryEvidence">
            <strong>Reviewer decisions</strong>
            {latest.decisions.map((decision) => (
              <span key={decision.role}>{decision.role}: {decision.decision} ({decision.reviewer})</span>
            ))}
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LabExecutionProposalEnvelopePanel({
  envelopes,
  reviewLabExecutionProposalEnvelope,
}: {
  envelopes: LabExecutionProposalEnvelope[];
  reviewLabExecutionProposalEnvelope: () => void;
}) {
  const latest = envelopes[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <TerminalSquare size={18} />
        <div>
          <strong>Execution proposal envelope</strong>
          <span>Rolls up accepted lab evidence into the final evidence envelope before any future controlled execution proposal.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={reviewLabExecutionProposalEnvelope}>
          <TerminalSquare size={15} />
          Review proposal envelope
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No lab execution proposal envelope has been reviewed.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.reviewId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for proposal review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Review" value={latest.reviewId} passed />
            <CheckLine icon={Archive} label="Export" value={latest.exportId} passed />
            <CheckLine icon={Activity} label="Window" value={latest.windowId} passed />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed={!latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Envelope evidence</strong>
            {latest.evidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LabExecutionProposalExportPanel({
  exports,
  prepareLabExecutionProposalExport,
}: {
  exports: LabExecutionProposalExportRecord[];
  prepareLabExecutionProposalExport: () => void;
}) {
  const latest = exports[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Archive size={18} />
        <div>
          <strong>Proposal export manifest</strong>
          <span>Exports execution proposal envelope evidence as redacted metadata for final operations and security review.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareLabExecutionProposalExport}>
          <Archive size={15} />
          Prepare proposal export
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No lab execution proposal export has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.id}</span>
            </div>
            <span className="status ready">{latest.status}</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={TerminalSquare} label="Envelope" value={latest.manifest.envelopeStatus} passed={latest.manifest.envelopeStatus === "Ready for proposal review"} />
            <CheckLine icon={Gauge} label="Checks" value={`${latest.manifest.passedChecks}/${latest.manifest.checkCount} passed`} passed={latest.manifest.passedChecks === latest.manifest.checkCount} />
            <CheckLine icon={LockKeyhole} label="Kill switch" value={`${latest.manifest.killSwitch.name}: ${latest.manifest.killSwitch.enabled ? "enabled" : "disabled"}`} passed={!latest.manifest.killSwitch.enabled} />
            <CheckLine icon={Archive} label="Checksum" value={latest.checksum.slice(0, 12)} passed />
          </div>
          <div className="inventoryEvidence">
            <strong>Proposal export evidence</strong>
            <span>Review: {latest.manifest.reviewId}</span>
            <span>Window: {latest.manifest.windowId}</span>
            <span>Window export: {latest.manifest.windowEvidenceExportId}</span>
            <span>Rollback owner: {latest.manifest.rollbackOwner || "missing"}</span>
          </div>
          <div className="inventoryEvidence">
            <strong>Evidence references</strong>
            {latest.manifest.evidenceReferences.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Redaction boundary</strong>
            <span>{latest.redactionBoundary}</span>
            <span>{latest.storageBoundary}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledLabExecutionApprovalPanel({
  approvals,
  recordControlledLabExecutionApproval,
}: {
  approvals: ControlledLabExecutionApprovalGate[];
  recordControlledLabExecutionApproval: () => void;
}) {
  const latest = approvals[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Controlled execution approval gate</strong>
          <span>Records final platform, security, lab, rollback, and sponsor approvals before any future controlled lab execution phase.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordControlledLabExecutionApproval}>
          <ShieldCheck size={15} />
          Record approval gate
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled lab execution approval gate has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.proposalExportId}</span>
            </div>
            <span className={`status ${latest.status === "Approved for controlled lab execution review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Archive} label="Proposal export" value={latest.proposalExportId} passed />
            <CheckLine icon={UserRound} label="Approvals" value={`${latest.decisions.filter((item) => item.decision === "Accepted").length}/${latest.decisions.length} accepted`} passed={latest.decisions.every((item) => item.decision === "Accepted")} />
            <CheckLine icon={ShieldCheck} label="Evidence" value={`${latest.decisions.filter((item) => !/required/i.test(item.evidence)).length}/${latest.decisions.length} recorded`} passed={latest.decisions.every((item) => !/required/i.test(item.evidence))} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed={!latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Approval decisions</strong>
            {latest.decisions.map((decision) => (
              <span key={decision.role}>{decision.role}: {decision.decision} ({decision.reviewer})</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Approval evidence</strong>
            {latest.evidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledLabExecutionRehearsalPacketPanel({
  packets,
  prepareControlledLabExecutionRehearsalPacket,
}: {
  packets: ControlledLabExecutionRehearsalPacket[];
  prepareControlledLabExecutionRehearsalPacket: () => void;
}) {
  const latest = packets[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ScrollText size={18} />
        <div>
          <strong>Execution rehearsal packet</strong>
          <span>Freezes runbook, rollback, stop condition, contact, export, and approval evidence before any future live-lab adapter operation.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareControlledLabExecutionRehearsalPacket}>
          <ScrollText size={15} />
          Prepare rehearsal packet
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled lab execution rehearsal packet has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.approvalGateId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for rehearsal review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Approval gate" value={latest.approvalGateId} passed />
            <CheckLine icon={ScrollText} label="Runbook" value={latest.frozenReferences.runbookId ?? "missing"} passed={Boolean(latest.frozenReferences.runbookId)} />
            <CheckLine icon={Archive} label="Audit exports" value={`${latest.frozenReferences.auditExportIds.length} frozen`} passed={latest.frozenReferences.auditExportIds.length > 0} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed={!latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Frozen references</strong>
            <span>Proposal export: {latest.frozenReferences.proposalExportId}</span>
            <span>Rollback owner: {latest.frozenReferences.rollbackOwner || "missing"}</span>
            <span>Emergency contacts: {latest.frozenReferences.emergencyStopContacts.join(", ") || "missing"}</span>
            <span>Audit exports: {latest.frozenReferences.auditExportIds.join(", ") || "missing"}</span>
          </div>
          <div className="inventoryEvidence">
            <strong>Stop conditions</strong>
            {latest.frozenReferences.stopConditions.map((condition) => (
              <span key={condition}>{condition}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Approval evidence</strong>
            {latest.frozenReferences.approvalEvidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledLabDryRunExecutionChecklistPanel({
  checklists,
  recordControlledLabDryRunExecutionChecklist,
}: {
  checklists: ControlledLabDryRunExecutionChecklist[];
  recordControlledLabDryRunExecutionChecklist: () => void;
}) {
  const latest = checklists[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <CheckCircle2 size={18} />
        <div>
          <strong>Dry-run execution checklist</strong>
          <span>Records operator roster, observation window, log capture, rollback timer, and stop authority while execution remains disabled.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordControlledLabDryRunExecutionChecklist}>
          <CheckCircle2 size={15} />
          Record dry-run checklist
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled lab dry-run execution checklist has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.rehearsalPacketId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for dry-run review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Roster" value={`${latest.operatorRoster.length} assigned`} passed={latest.operatorRoster.length >= 3} />
            <CheckLine icon={Activity} label="Observation" value={`${latest.observationWindow.scheduledStart} to ${latest.observationWindow.scheduledEnd}`} passed={Date.parse(latest.observationWindow.scheduledEnd) > Date.parse(latest.observationWindow.scheduledStart)} />
            <CheckLine icon={Archive} label="Log capture" value={`${latest.logCaptureReferences.length} refs`} passed={latest.logCaptureReferences.length >= 2} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed={!latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Dry-run controls</strong>
            <span>Operators: {latest.operatorRoster.join(", ")}</span>
            <span>Rollback timer: {latest.rollbackTimerMinutes} minutes</span>
            <span>Stop authority: {latest.stopAuthority || "missing"}</span>
          </div>
          <div className="inventoryEvidence">
            <strong>Log capture references</strong>
            {latest.logCaptureReferences.map((reference) => (
              <span key={reference}>{reference}</span>
            ))}
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledLabExecutionEvidenceLedgerPanel({
  ledgers,
  recordControlledLabExecutionEvidenceLedger,
}: {
  ledgers: ControlledLabExecutionEvidenceLedger[];
  recordControlledLabExecutionEvidenceLedger: () => void;
}) {
  const latest = ledgers[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Archive size={18} />
        <div>
          <strong>Execution evidence ledger</strong>
          <span>Captures immutable operator, observer, rollback, log, audit, and stop authority evidence while adapters remain disabled.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordControlledLabExecutionEvidenceLedger}>
          <Archive size={15} />
          Record evidence ledger
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled lab execution evidence ledger has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.dryRunChecklistId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for evidence review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={CheckCircle2} label="Checklist" value={latest.dryRunChecklistId} passed />
            <CheckLine icon={UserRound} label="Operator evidence" value={`${latest.immutableReferences.operatorEvidence.length} refs`} passed={latest.immutableReferences.operatorEvidence.length > 0} />
            <CheckLine icon={Archive} label="Log evidence" value={`${latest.immutableReferences.logEvidence.length} refs`} passed={latest.immutableReferences.logEvidence.length >= 2} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed={!latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Immutable evidence references</strong>
            <span>Operators: {latest.immutableReferences.operatorEvidence.join(", ")}</span>
            <span>Observers: {latest.immutableReferences.observerEvidence.join(", ")}</span>
            <span>Rollback: {latest.immutableReferences.rollbackEvidence.join(", ")}</span>
            <span>Logs: {latest.immutableReferences.logEvidence.join(", ")}</span>
            <span>Audit: {latest.immutableReferences.auditEvidence.join(", ")}</span>
            <span>Stop authority: {latest.immutableReferences.stopAuthorityEvidence.join(", ")}</span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledLabExecutionReadinessAttestationPanel({
  attestations,
  recordControlledLabExecutionReadinessAttestation,
}: {
  attestations: ControlledLabExecutionReadinessAttestation[];
  recordControlledLabExecutionReadinessAttestation: () => void;
}) {
  const latest = attestations[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Execution readiness attestation</strong>
          <span>Captures final platform, security, operations, rollback, and sponsor attestations while adapters remain disabled.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordControlledLabExecutionReadinessAttestation}>
          <ShieldCheck size={15} />
          Record readiness attestation
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled lab execution readiness attestation has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.evidenceLedgerId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for execution review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Archive} label="Ledger" value={latest.evidenceLedgerId} passed />
            <CheckLine icon={ShieldCheck} label="Attestations" value={`${Object.values(latest.attestations).filter(Boolean).length}/5`} passed={Object.values(latest.attestations).every(Boolean)} />
            <CheckLine icon={CheckCircle2} label="Checklist" value={latest.dryRunChecklistId} passed />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed={!latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Final attestation evidence</strong>
            <span>Platform: {latest.attestations.platformOwner || "missing"}</span>
            <span>Security: {latest.attestations.securityReviewer || "missing"}</span>
            <span>Operations: {latest.attestations.operationsReviewer || "missing"}</span>
            <span>Rollback: {latest.attestations.rollbackOwner || "missing"}</span>
            <span>Sponsor: {latest.attestations.executiveSponsor || "missing"}</span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionBrokerQueuePanel({
  records,
  queueExecutionBrokerRecord,
}: {
  records: ExecutionBrokerQueueRecord[];
  queueExecutionBrokerRecord: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <TerminalSquare size={18} />
        <div>
          <strong>Execution broker hardening</strong>
          <span>Queues future adapter execution for operator review with idempotency, evidence, and kill-switch checks.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={queueExecutionBrokerRecord}>
          <TerminalSquare size={15} />
          Queue broker review
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No execution broker queue record has been created.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.idempotencyKey}</span>
            </div>
            <span className={`status ${latest.status === "Queued for operator review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Attestation" value={latest.readinessAttestationId} passed />
            <CheckLine icon={Archive} label="Evidence links" value={`${latest.approvalEvidenceLinks.length} refs`} passed={latest.approvalEvidenceLinks.length >= 3} />
            <CheckLine icon={LockKeyhole} label="Kill switch" value="Disabled" passed={!latest.killSwitch.enabled} />
            <CheckLine icon={TerminalSquare} label="Execution" value="Operator review" passed={!latest.provisioningEnabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Broker evidence boundary</strong>
            <span>Operation: {latest.operation}</span>
            <span>Idempotency key: {latest.idempotencyKey}</span>
            <span>Readiness attestation: {latest.readinessAttestationId}</span>
            <span>Evidence ledger: {latest.evidenceLedgerId}</span>
            <span>Approval evidence: {latest.approvalEvidenceLinks.join(", ")}</span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionBrokerDispatchApprovalPanel({
  approvals,
  recordExecutionBrokerDispatchApproval,
}: {
  approvals: ExecutionBrokerDispatchApproval[];
  recordExecutionBrokerDispatchApproval: () => void;
}) {
  const latest = approvals[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Dispatch approval boundary</strong>
          <span>Records rollback, pentest, operator, and dispatch-window evidence before any future lab dispatch review.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordExecutionBrokerDispatchApproval}>
          <ShieldCheck size={15} />
          Record dispatch approval
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No execution broker dispatch approval has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.brokerRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for authorized lab dispatch review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={TerminalSquare} label="Broker" value={latest.brokerRecordId} passed />
            <CheckLine icon={UserRound} label="Approver" value={latest.operatorApprover || "missing"} passed={Boolean(latest.operatorApprover)} />
            <CheckLine icon={ShieldCheck} label="Pentest" value={latest.pentestEvidenceReference || "missing"} passed={Boolean(latest.pentestEvidenceReference)} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Disabled" passed={!latest.provisioningEnabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Dispatch approval evidence</strong>
            <span>Idempotency key: {latest.idempotencyKey}</span>
            <span>Rollback proof: {latest.rollbackProofReference || "missing"}</span>
            <span>Pentest evidence: {latest.pentestEvidenceReference || "missing"}</span>
            <span>Dispatch window: {latest.dispatchWindowReference || "missing"}</span>
            <span>Readiness attestation: {latest.readinessAttestationId}</span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RealAdapterLabScopeActivationPanel({
  activations,
  recordRealAdapterLabScopeActivation,
}: {
  activations: RealAdapterLabScopeActivation[];
  recordRealAdapterLabScopeActivation: () => void;
}) {
  const latest = activations[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Real-adapter lab scope activation</strong>
          <span>Records authorized lab scope, completed pentest evidence, bounded targets, rollback ownership, and manual controls.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordRealAdapterLabScopeActivation}>
          <LockKeyhole size={15} />
          Record lab scope activation
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No real-adapter lab scope activation has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.dispatchApprovalId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for manual real-adapter switch review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Scope" value={latest.authorizedScopeReference || "missing"} passed={Boolean(latest.authorizedScopeReference)} />
            <CheckLine icon={UserRound} label="Rollback owner" value={latest.rollbackOwner || "missing"} passed={Boolean(latest.rollbackOwner)} />
            <CheckLine icon={Network} label="Targets" value={`${latest.boundedProviderTargets.length} bounded`} passed={latest.boundedProviderTargets.length > 0} />
            <CheckLine icon={LockKeyhole} label="Switch" value="Disabled" passed={!latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Activation evidence</strong>
            <span>Pentest completion: {latest.pentestCompletionEvidence || "missing"}</span>
            <span>Manual controls: {latest.manualOperatorControls.join(", ")}</span>
            <span>Bounded targets: {latest.boundedProviderTargets.join(", ")}</span>
            <span>Idempotency key: {latest.idempotencyKey}</span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ManualRealAdapterSwitchReviewPanel({
  reviews,
  recordManualRealAdapterSwitchReview,
}: {
  reviews: ManualRealAdapterSwitchReview[];
  recordManualRealAdapterSwitchReview: () => void;
}) {
  const latest = reviews[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Settings size={18} />
        <div>
          <strong>Manual switch review</strong>
          <span>Records named operator, second reviewer, maintenance window, switch-state audit refs, and rollback contact.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordManualRealAdapterSwitchReview}>
          <Settings size={15} />
          Record switch review
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No manual real-adapter switch review has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.activationId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for manual switch change review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Operator" value={latest.switchOperator || "missing"} passed={Boolean(latest.switchOperator)} />
            <CheckLine icon={ShieldCheck} label="Reviewer" value={latest.secondReviewer || "missing"} passed={Boolean(latest.secondReviewer)} />
            <CheckLine icon={Archive} label="Audit refs" value={`${latest.switchStateAuditReferences.length} refs`} passed={latest.switchStateAuditReferences.length >= 2} />
            <CheckLine icon={LockKeyhole} label="Switch" value="Unchanged" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Switch review evidence</strong>
            <span>Maintenance window: {latest.maintenanceWindowReference || "missing"}</span>
            <span>Switch-state audit: {latest.switchStateAuditReferences.join(", ")}</span>
            <span>Rollback contact: {latest.rollbackContact || "missing"}</span>
            <span>Idempotency key: {latest.idempotencyKey}</span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LifecycleEvidencePanel({
  scopes,
  diagnostics,
  proofs,
  recordLabAuthorizationScope,
  recordVmLifecycleProof,
}: {
  scopes: LabAuthorizationScope[];
  diagnostics: LabScopeDiagnostics;
  proofs: VmLifecycleProof[];
  recordLabAuthorizationScope: () => void;
  recordVmLifecycleProof: () => void;
}) {
  const latestScope = scopes[0];
  const latestProof = proofs[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Evidence before promotion</strong>
          <span>Records authorized lab scope and VM lifecycle proof before platform-service gates can pass.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordLabAuthorizationScope}>
          <Play size={15} />
          Record lab scope
        </button>
        <button className="iconTextButton" onClick={recordVmLifecycleProof}>
          <Play size={15} />
          Record lifecycle proof
        </button>
      </div>
      <div className="platformConfigGrid">
        <CheckLine
          icon={ShieldCheck}
          label="Lab scope"
          value={latestScope ? latestScope.status : "Missing"}
          passed={latestScope?.status === "Approved" && latestScope.pentestScopeStructurallyValid}
        />
        <CheckLine
          icon={LockKeyhole}
          label="Pentest scope"
          value={diagnostics.latest?.readyForAdapterReview ? "Ready" : "Required"}
          passed={Boolean(diagnostics.latest?.readyForAdapterReview)}
        />
        <CheckLine
          icon={Network}
          label="Provider coverage"
          value={`${diagnostics.providerCoverage.filter((item) => item.covered).length}/${diagnostics.providerCoverage.length}`}
          passed={diagnostics.providerCoverage.some((item) => item.provider === "NCI" && item.covered)}
        />
        <CheckLine
          icon={Activity}
          label="VM lifecycle"
          value={latestProof?.status ?? "Missing"}
          passed={latestProof?.status === "Verified"}
        />
        <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
      </div>
      {latestScope && (
        <div className="inventoryEvidence">
          <strong>{latestScope.name}</strong>
          <span>
            {latestScope.project} / {latestScope.cluster} / {latestScope.network}
          </span>
          <span>
            Version {latestScope.version} / target {latestScope.targetEnvironment} / rollback {latestScope.rollbackOwner}
          </span>
          <span>Providers: {latestScope.providerCoverage.join(", ")}</span>
          <span>Endpoints: {latestScope.targetEndpoints.join(", ")}</span>
          <span>{latestScope.pentestScopeReference}</span>
          <span>Evidence: {latestScope.evidenceReferences.join(", ")}</span>
        </div>
      )}
      {diagnostics.latest && (
        <div className="dryRunValidationList">
          {diagnostics.latest.checks.map((check) => (
            <div className="dryRunValidationRow" key={check.name}>
              <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
              <div>
                <strong>{check.name}</strong>
                <small>{check.detail}</small>
              </div>
            </div>
          ))}
        </div>
      )}
      {latestProof && (
        <div className="dryRunValidationList">
          {latestProof.checks.map((check) => (
            <div className="dryRunValidationRow" key={check.name}>
              <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
              <div>
                <strong>{check.name}</strong>
                <small>{check.detail}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ControlledProvisioningGatePanel({
  gates,
  requestControlledProvisioningGate,
  decideControlledProvisioningGate,
}: {
  gates: ControlledProvisioningGate[];
  requestControlledProvisioningGate: () => void;
  decideControlledProvisioningGate: (gateId: string, decision: "approve" | "reject") => void;
}) {
  const latest = gates[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Operator-controlled gate</strong>
          <span>Requires dry-run evidence, manual approval, lab scope, rollback, destroy readiness, and a disabled-by-default kill switch.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={requestControlledProvisioningGate}>
          <Play size={15} />
          Request gate review
        </button>
        {latest && latest.approval.status === "Pending" && (
          <>
            <button className="smallButton successButton" onClick={() => decideControlledProvisioningGate(latest.id, "approve")}>
              Approve gate
            </button>
            <button className="smallButton dangerButton" onClick={() => decideControlledProvisioningGate(latest.id, "reject")}>
              Reject gate
            </button>
          </>
        )}
      </div>
      {!latest ? (
        <p className="emptyState">No controlled provisioning gate reviews have been requested.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>
                Manual approval {latest.approval.status} / {latest.pentestScope.reference}
              </span>
            </div>
            <span className={`status ${latest.status === "Approved for controlled create" ? "approval" : latest.status === "Blocked" ? "failed" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Manual approval" value={latest.approval.status} passed={latest.approval.status === "Approved"} />
            <CheckLine icon={LockKeyhole} label="Authorized scope" value={latest.pentestScope.present ? "Attached" : "Required"} passed={latest.pentestScope.present && latest.pentestScope.structurallyValid} />
            <CheckLine icon={Activity} label="Kill switch" value={latest.mutationKillSwitch ? "Enabled" : "Disabled"} passed={latest.mutationKillSwitch} />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Destroy plan</strong>
            {latest.destroyPlan.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RollbackDestroyProofPanel({
  proofs,
  recordRollbackDestroyProof,
}: {
  proofs: RollbackDestroyProofRecord[];
  recordRollbackDestroyProof: () => void;
}) {
  const latest = proofs[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Archive size={18} />
        <div>
          <strong>Rollback and destroy rehearsal</strong>
          <span>Requires backup/export evidence, owner notice, teardown order, inventory reconciliation, and audit export readiness.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordRollbackDestroyProof}>
          <Play size={15} />
          Record rollback proof
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No rollback and destroy proof has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>Rollback owner {latest.rollbackOwner}</span>
            </div>
            <span className={`status ${latest.status === "Ready for controlled create" ? "approval" : "failed"}`}>
              {latest.status}
            </span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Stop conditions</strong>
            {latest.stopConditions.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlledCreateAuthorizationPanel({
  envelopes,
  reviewControlledCreateAuthorization,
}: {
  envelopes: ControlledCreateAuthorizationEnvelope[];
  reviewControlledCreateAuthorization: () => void;
}) {
  const latest = envelopes[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Live adapter authorization envelope</strong>
          <span>Rolls up final evidence before a future narrowly scoped AHV create adapter can be considered.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={reviewControlledCreateAuthorization}>
          <Play size={15} />
          Review authorization
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled-create authorization envelope has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>{latest.id}</span>
            </div>
            <span className={`status ${latest.status === "Ready for authorization review" ? "approval" : "failed"}`}>
              {latest.status}
            </span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Allowed create fields</strong>
            {latest.allowedCreateFields.map((field) => (
              <span key={field}>{field}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Emergency stop</strong>
            {latest.emergencyStopProcedure.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AhvCreateAdapterContractPanel({
  reviews,
  reviewAhvCreateAdapterContract,
}: {
  reviews: AhvCreateAdapterContractReview[];
  reviewAhvCreateAdapterContract: () => void;
}) {
  const latest = reviews[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <TerminalSquare size={18} />
        <div>
          <strong>Disabled AHV create contract</strong>
          <span>Maps the approved dry-run fields to a future Prism Central create request while execution stays blocked.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={reviewAhvCreateAdapterContract}>
          <Play size={15} />
          Review AHV create contract
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No AHV create adapter contract review has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>{latest.adapterMode}</span>
            </div>
            <span className={`status ${latest.status === "Payload ready but execution disabled" ? "approval" : "failed"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            {Object.entries(latest.payload).map(([field, value]) => (
              <CheckLine
                icon={ShieldCheck}
                key={field}
                label={field}
                value={String(value)}
                passed
              />
            ))}
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Blocked mutation operations</strong>
            {latest.blockedOperations.map((operation) => (
              <span key={operation}>{operation}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Adapter kill switch</strong>
            <span>
              {latest.killSwitch.name}: {latest.killSwitch.enabled ? "enabled" : "disabled"}
            </span>
            <span>Provisioning enabled: {latest.provisioningEnabled ? "yes" : "no"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AhvControlledPreflightPanel({
  runs,
  runAhvControlledProvisioningPreflight,
}: {
  runs: AhvControlledProvisioningRun[];
  runAhvControlledProvisioningPreflight: () => void;
}) {
  const latest = runs[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Fail-closed AHV boundary</strong>
          <span>Evaluates the controlled create chain through a disabled real-adapter preflight without mutating Prism Central.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={runAhvControlledProvisioningPreflight}>
          <Play size={15} />
          Run AHV preflight
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No AHV controlled provisioning preflight runs have been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>
                {latest.action} / {latest.adapterMode}
              </span>
            </div>
            <span className={`status ${latest.status === "Ready but disabled" ? "approval" : "failed"}`}>{latest.status}</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Adapter" value={latest.adapterMode} passed={false} />
            <CheckLine icon={Activity} label="Action" value={latest.action} passed />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
            <CheckLine icon={Gauge} label="Blocked ops" value={`${latest.mutationOperationsBlocked.length}`} passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformServiceRequestPanel({
  requests,
  createPlatformServiceRequest,
}: {
  requests: PlatformServiceRequest[];
  createPlatformServiceRequest: (kind: PlatformServiceKind) => void;
}) {
  const latest = requests[0];
  const kinds: PlatformServiceKind[] = ["NKP Namespace", "NDB PostgreSQL", "NUS Storage", "NAI Endpoint"];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Layers3 size={18} />
        <div>
          <strong>Platform services gated by VM lifecycle</strong>
          <span>Plans Kubernetes, database, storage, and AI service requests after the controlled VM path is proven.</span>
        </div>
      </div>
      <div className="inlineActions">
        {kinds.map((kind) => (
          <button className="iconTextButton" key={kind} onClick={() => createPlatformServiceRequest(kind)}>
            <Play size={15} />
            Plan {kind}
          </button>
        ))}
      </div>
      {!latest ? (
        <p className="emptyState">No platform service flows have been planned.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.serviceName}</strong>
              <span>
                {latest.kind} / {latest.profileName} / {latest.environmentName}
              </span>
            </div>
            <span className={`status ${latest.status === "Blocked" ? "failed" : "approval"}`}>{latest.status}</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Layers3} label="Provider" value={latest.provider} passed />
            <CheckLine icon={ShieldCheck} label="VM lifecycle" value={latest.vmLifecycleProven ? "Proven" : "Required"} passed={latest.vmLifecycleProven} />
            <CheckLine icon={CircleDollarSign} label="Cost" value={`$${latest.estimatedMonthlyCost}/mo estimate`} passed />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.validations.map((validation) => (
              <div className="dryRunValidationRow" key={validation.name}>
                <span className={`status ${validation.passed ? "ready" : "failed"}`}>
                  {validation.passed ? "Pass" : "Gate"}
                </span>
                <div>
                  <strong>{validation.name}</strong>
                  <small>{validation.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Cleanup plan</strong>
            {latest.cleanupPlan.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformServicePreflightPanel({
  runs,
  runPlatformServicePreflight,
}: {
  runs: PlatformServicePreflightRun[];
  runPlatformServicePreflight: () => void;
}) {
  const latest = runs[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Fail-closed service boundary</strong>
          <span>Evaluates NKP, NDB, NUS, and NAI adapter readiness without calling real service APIs.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={runPlatformServicePreflight}>
          <Play size={15} />
          Run service preflight
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No platform service preflight runs have been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.serviceName}</strong>
              <span>
                {latest.kind} / {latest.provider} / {latest.adapterMode}
              </span>
            </div>
            <span className={`status ${latest.status === "Ready but disabled" ? "approval" : "failed"}`}>{latest.status}</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Layers3} label="Provider" value={latest.provider} passed />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
            <CheckLine icon={Gauge} label="Blocked ops" value={`${latest.mutationOperationsBlocked.length}`} passed={false} />
            <CheckLine icon={ShieldCheck} label="Adapter" value={latest.adapterMode} passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformServiceAdapterContractPanel({
  reviews,
  reviewPlatformServiceAdapterContract,
}: {
  reviews: PlatformServiceAdapterContractReview[];
  reviewPlatformServiceAdapterContract: () => void;
}) {
  const latest = reviews[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Code2 size={18} />
        <div>
          <strong>Disabled service adapter contracts</strong>
          <span>Maps NKP, NDB, NUS, and NAI request payloads while execute, poll, and rollback remain blocked.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={reviewPlatformServiceAdapterContract}>
          <Play size={15} />
          Review service contract
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No platform service adapter contract review has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.serviceName}</strong>
              <span>
                {latest.kind} / {latest.provider} / {latest.adapterMode}
              </span>
            </div>
            <span className={`status ${latest.status === "Payload ready but execution disabled" ? "approval" : "failed"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Layers3} label="Provider" value={latest.payload.provider} passed />
            <CheckLine icon={ShieldCheck} label="Profile" value={latest.payload.profileName} passed />
            <CheckLine icon={UserRound} label="Owner" value={latest.payload.owner} passed />
            <CheckLine icon={CircleDollarSign} label="Cost" value={`$${latest.payload.estimatedMonthlyCost}/mo`} passed />
            <CheckLine icon={LockKeyhole} label="Kill switch" value={`${latest.killSwitch.name}: ${latest.killSwitch.enabled ? "enabled" : "disabled"}`} passed={!latest.killSwitch.enabled} />
            <CheckLine icon={Gauge} label="Blocked ops" value={`${latest.blockedOperations.length}`} passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Blocked service operations</strong>
            {latest.blockedOperations.map((operation) => (
              <span key={operation}>{operation}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Payload evidence</strong>
            <span>Environment: {latest.payload.environmentName}</span>
            <span>Profile ID: {latest.payload.profileId}</span>
            <span>Approval required: {latest.payload.approvalRequired ? "yes" : "no"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderReleaseReadinessPanel({ summary }: { summary: ProviderReleaseReadinessSummary }) {
  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Gauge size={18} />
        <div>
          <strong>Provider release readiness summary</strong>
          <span>Compares evidence gaps across NCI, NKP, NDB, NUS, and NAI without enabling provider execution.</span>
        </div>
      </div>
      <div className="platformConfigGrid">
        <CheckLine icon={ShieldCheck} label="Nearest ready" value={summary.nearestToReady ?? "No provider reviewed"} passed={Boolean(summary.nearestToReady)} />
        <CheckLine icon={LockKeyhole} label="Most blocked" value={summary.mostBlocked ?? "No provider reviewed"} passed={false} />
        <CheckLine icon={Activity} label="Providers" value={`${summary.providers.length}`} passed />
        <CheckLine icon={Gauge} label="Execution" value="Disabled" passed={false} />
      </div>
      <div className="releaseReadinessList">
        {summary.providers.map((provider) => (
          <div className="releaseReadinessRow" key={provider.provider}>
            <div>
              <strong>{provider.provider}</strong>
              <span>{provider.status}</span>
            </div>
            <meter min="0" max={Math.max(provider.checkCount, 1)} value={provider.passedChecks} />
            <span className={`status ${provider.gapCount === 0 && provider.checkCount > 0 ? "ready" : "failed"}`}>
              {provider.gapCount} gaps
            </span>
            <small>{provider.gaps.slice(0, 2).join(" / ")}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderReleaseGatePanel({
  records,
  reviewProviderReleaseGate,
}: {
  records: ProviderReleaseGateRecord[];
  reviewProviderReleaseGate: (provider?: ProviderReleaseGateRecord["provider"]) => void;
}) {
  const latest = records[0];
  const providers: ProviderReleaseGateRecord["provider"][] = ["NCI", "NKP", "NDB", "NUS", "NAI"];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Provider release evidence envelope</strong>
          <span>Summarizes the evidence required before any provider adapter can be considered for controlled lab release.</span>
        </div>
      </div>
      <div className="inlineActions">
        {providers.map((provider) => (
          <button className="iconTextButton" key={provider} onClick={() => reviewProviderReleaseGate(provider)}>
            <Play size={15} />
            Review {provider}
          </button>
        ))}
      </div>
      {!latest ? (
        <p className="emptyState">No provider release gate has been reviewed.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.product} / approver {latest.releaseApprover}</span>
            </div>
            <span className={`status ${latest.status === "Ready for release review" ? "approval" : "failed"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Provider" value={latest.provider} passed />
            <CheckLine icon={UserRound} label="Approver" value={latest.releaseApprover} passed />
            <CheckLine icon={LockKeyhole} label="Kill switch" value={`${latest.killSwitch.name}: ${latest.killSwitch.enabled ? "enabled" : "disabled"}`} passed={!latest.killSwitch.enabled} />
            <CheckLine icon={Gauge} label="Blocked ops" value={`${latest.blockedOperations.length}`} passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Blocked provider operations</strong>
            {latest.blockedOperations.map((operation) => (
              <span key={operation}>{operation}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Evidence envelope</strong>
            {latest.evidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProvisioningAdapterPanel({
  adapters,
  platformConfig,
}: {
  adapters: ProvisioningAdapterReadiness[];
  platformConfig: PlatformConfig;
}) {
  return (
    <div className="provisioningAdapterList">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Adapter contract only</strong>
          <span>{platformConfig.message}</span>
        </div>
      </div>
      <div className="platformConfigGrid">
        <CheckLine icon={Network} label="Project" value={platformConfig.defaultProject} passed />
        <CheckLine icon={Layers3} label="Cluster" value={platformConfig.defaultCluster} passed />
        <CheckLine icon={Settings} label="Network profile" value={platformConfig.networkProfile} passed={false} />
        <CheckLine icon={LockKeyhole} label="Credential ref" value={platformConfig.credentialReference} passed={false} />
      </div>
      {adapters.map((adapter) => (
        <div className="provisioningAdapterRow" key={adapter.name}>
          <div className="integrationConfigHeader">
            <div className="integrationLogo">{adapter.name}</div>
            <div>
              <strong>{adapter.product}</strong>
              <span>{adapter.capabilities.join(" / ")}</span>
            </div>
            <span className={`status ${adapter.configured ? "running" : "approval"}`}>
              {adapter.configured ? "Configured" : "Needs config"}
            </span>
          </div>
          <div className="labScope">
            <span>{adapter.nextGate}</span>
            <small>Provisioning disabled until adapter-specific gates are approved.</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdapterEnablementPanel({
  records,
  reviewAdapterEnablement,
}: {
  records: AdapterEnablementRecord[];
  reviewAdapterEnablement: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Real adapter enablement remains gated</strong>
          <span>Reviews required evidence before a future authorized live-adapter phase.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={reviewAdapterEnablement}>
          <Play size={15} />
          Review adapter enablement
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No adapter enablement reviews have been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider} enablement contract</strong>
              <span>
                {latest.product} / rollback owner {latest.rollbackOwner}
              </span>
            </div>
            <span className={`status ${latest.status === "Ready for review" ? "approval" : "failed"}`}>
              {latest.status}
            </span>
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Blocked mutation operations</strong>
            {latest.mutationOperationsBlocked.map((operation) => (
              <span key={operation}>{operation}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Evidence summary</strong>
            {latest.evidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationConfigRow({
  integration,
  config,
  saveIntegrationConfig,
  runIntegrationCheck,
}: {
  integration: Integration;
  config: IntegrationConfig;
  saveIntegrationConfig: (
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) => void;
  runIntegrationCheck: (integrationName: string) => void;
}) {
  const [endpoint, setEndpoint] = useState(config.endpoint);
  const [credentialProfile, setCredentialProfile] = useState(config.credentialProfile);

  useEffect(() => {
    setEndpoint(config.endpoint);
    setCredentialProfile(config.credentialProfile);
  }, [config.credentialProfile, config.endpoint]);

  return (
    <div className="integrationConfigRow">
      <div className="integrationConfigHeader">
        <div className="integrationLogo">{integration.name}</div>
        <div>
          <strong>{integration.product}</strong>
          <span>{config.message}</span>
        </div>
        <span className={`status ${integrationConfigClass(config.status)}`}>{config.status}</span>
      </div>
      <label className="field compact">
        Endpoint
        <input
          value={endpoint}
          placeholder={`https://${integration.name.toLowerCase()}.lab.example`}
          onChange={(event) => setEndpoint(event.target.value)}
        />
      </label>
      <label className="field compact">
        Credential profile
        <input
          value={credentialProfile}
          placeholder={`${integration.name.toLowerCase()}-lab-readonly`}
          onChange={(event) => setCredentialProfile(event.target.value)}
        />
      </label>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={() => saveIntegrationConfig(integration.name, { endpoint, credentialProfile })}>
          <Settings size={15} />
          Save
        </button>
        <button className="iconTextButton" onClick={() => runIntegrationCheck(integration.name)}>
          <RefreshCw size={15} />
          Check
        </button>
        {config.lastCheckedAt && <small>Last check {formatDateTime(config.lastCheckedAt)}</small>}
      </div>
    </div>
  );
}

function EnvironmentDetailView({ detail, openCreate }: { detail: EnvironmentDetail | null; openCreate: () => void }) {
  if (!detail) {
    return (
      <section className="screen">
        <Panel title="No environment selected" action="Detail">
          <p className="emptyState">Create or select an environment to inspect API-backed details.</p>
          <button className="fullButton" onClick={openCreate}>
            Create environment
          </button>
        </Panel>
      </section>
    );
  }

  const { environment } = detail;

  return (
    <section className="screen detailStack">
      <div className="opsStatusStrip">
        <div className="statusTile strong">
          <span>Environment</span>
          <strong>{environment.name}</strong>
          <small>{environment.template}</small>
        </div>
        <div className="statusTile">
          <span>Status</span>
          <strong>{environment.status}</strong>
          <small>{environment.region}</small>
        </div>
        <div className="statusTile">
          <span>Owner</span>
          <strong>{environment.owner}</strong>
          <small>Requested {environment.createdAt}</small>
        </div>
        <div className="statusTile">
          <span>Monthly estimate</span>
          <strong>${environment.cost.toLocaleString()}</strong>
          <small>Prototype estimate</small>
        </div>
      </div>

      <div className="twoColumn">
        <Panel title="Provisioning jobs" action={`${detail.jobs.length} recorded`}>
          <div className="eventList">
            {detail.jobs.map((job) => (
              <div className="eventRow" key={job.id}>
                <strong>{job.state}</strong>
                <span>{job.message}</span>
                <small>{formatDateTime(job.createdAt)}</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Approval history" action={`${detail.approvals.length} request`}>
          <ApprovalQueue approvals={detail.approvals} compact openEnvironmentDetail={() => undefined} />
        </Panel>
      </div>

      <Panel title="Control-plane lifecycle" action={`${detail.controlPlaneJobs?.length ?? 0} jobs`}>
        <ControlPlaneQueue jobs={detail.controlPlaneJobs ?? []} />
      </Panel>

      <Panel title="Audit trail" action={`${detail.auditEvents.length} events`}>
        <div className="eventList">
          {detail.auditEvents.map((event) => (
            <div className="eventRow" key={event.id}>
              <strong>{event.action}</strong>
              <span>{event.actor} / {event.target}</span>
              <small>{formatDateTime(event.createdAt)}</small>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`navButton ${active ? "active" : ""}`} onClick={onClick} title={label}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function Panel({ title, action, children }: { title: string; action: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{title}</h2>
        <span>{action}</span>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function CheckLine({
  icon: Icon,
  label,
  value,
  passed,
}: {
  icon: ElementType;
  label: string;
  value: string;
  passed: boolean;
}) {
  return (
    <div className="checkLine">
      <Icon size={18} />
      <div>
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <CheckCircle2 className={passed ? "pass" : "warn"} size={18} />
    </div>
  );
}

function viewTitle(view: View) {
  switch (view) {
    case "dashboard":
      return "Developer portal";
    case "catalog":
      return "Golden path catalog";
    case "template":
      return "Template details";
    case "create":
      return "Create environment";
    case "environment":
      return "Environment status";
    case "environmentDetail":
      return "Environment details";
    case "admin":
      return "Platform admin";
  }
}

function statusClass(status: Environment["status"]) {
  return status === "Ready" || status === "Destroyed"
    ? "ready"
    : status === "Provisioning" || status === "Destroying"
      ? "running"
      : status === "Failed"
        ? "failed"
        : "approval";
}

function integrationConfigClass(status: IntegrationConfig["status"]) {
  return status === "Reachable"
    ? "ready"
    : status === "Configured"
      ? "running"
      : status === "Failed"
        ? "failed"
        : "approval";
}

function labAdapterClass(mode: LabAdapterSnapshot["mode"]) {
  return mode === "Read-only candidate"
    ? "ready"
    : mode === "Reachable" || mode === "Configured"
      ? "running"
      : mode === "Failed"
        ? "failed"
        : "approval";
}

function controlPlaneClass(state: ControlPlaneJob["state"]) {
  return state === "Ready" || state === "Destroyed"
    ? "ready"
    : state === "Failed" || state === "Expired"
      ? "failed"
      : state === "AwaitingApproval"
        ? "approval"
        : "running";
}

function resourceProfileClass(status: ResourceProfile["status"]) {
  return status === "Published" ? "ready" : status === "Deprecated" ? "failed" : "approval";
}

function registryStatusClass(status: RegistryStatus) {
  return status === "Published" ? "ready" : status === "Deprecated" ? "failed" : "approval";
}

function resourceDescription(target: Target) {
  switch (target) {
    case "VM":
      return "NCI VM with hardened image and lifecycle expiry";
    case "Kubernetes":
      return "NKP namespace, ingress, secrets, and quota";
    case "Database":
      return "NDB managed instance with backup policy";
    case "Storage":
      return "NUS file or object storage allocation";
    case "AI Endpoint":
      return "NAI model endpoint with GPU quota review";
  }
}

function enrichTemplate(template: Template, governance: TemplateGovernance) {
  return {
    ...template,
    owner: governance[template.id]?.owner ?? template.owner,
    tier: governance[template.id]?.tier ?? template.tier,
  };
}

const mockSession: PlatformSession = {
  user: "platform.admin",
  displayName: "Platform Admin",
  roles: ["Developer", "Approver", "Platform Admin"],
  authMode: "Mock OIDC",
  identityProvider: "Browser mock identity stub",
};

function createMockSessionDiagnostics(session: PlatformSession): SessionDiagnostics {
  return {
    authMode: session.authMode,
    identityProvider: session.identityProvider,
    user: session.user,
    roles: session.roles,
    trustedHeaderMode: "Optional",
    missingRequiredHeaders: [],
    authorizationMatrix: [
      {
        action: "Create developer environment",
        roles: ["Developer", "Platform Admin"],
        boundary: "Creates a simulated request and queues control-plane evidence.",
      },
      {
        action: "Approve requests and controlled gates",
        roles: ["Approver", "Platform Admin"],
        boundary: "Records approval evidence; does not enable real infrastructure mutation.",
      },
      {
        action: "Manage providers, registry, preflight, lifecycle, and audit export",
        roles: ["Platform Admin"],
        boundary: "Administrative control-plane records only; real adapters remain disabled.",
      },
    ],
  };
}

function createEmptyIntegrationConfig(name: string): IntegrationConfig {
  return {
    name,
    endpoint: "",
    credentialProfile: "",
    status: "Not configured",
    message: "Add endpoint and credential profile values before lab validation.",
  };
}

function createEmptyLabAdapter(name: string): LabAdapterSnapshot {
  return {
    name,
    product: name,
    mode: "Mock",
    readOnly: true,
    provisioningEnabled: false,
    inventoryCount: 0,
    scope: "Mock adapter scope only until lab endpoint and authorization are documented.",
    message: "Waiting for lab scope before read-only discovery.",
    nextStep: "Document lab scope and read-only credential profile.",
  };
}

function deriveMockIntegrationConfigs(sourceIntegrations: Integration[]): IntegrationConfig[] {
  return sourceIntegrations.map((integration) => ({
    ...createEmptyIntegrationConfig(integration.name),
    status: integration.state === "Healthy" ? "Configured" : "Not configured",
    message: integration.state === "Healthy" ? "Mock adapter is configured for prototype readiness." : integration.nextStep,
  }));
}

function createMockCredentialDiagnostics(configs: IntegrationConfig[]): CredentialReferenceDiagnostic[] {
  return configs.map((config) => {
    const configured = Boolean(config.credentialProfile);
    const referenceShape = !configured || /^[a-z][a-z0-9._:-]{2,63}$/.test(config.credentialProfile);
    const noInlineMaterial =
      !configured ||
      (!config.credentialProfile.includes("://") &&
        !config.credentialProfile.includes("@") &&
        !config.credentialProfile.includes("=") &&
        !config.credentialProfile.includes("$") &&
        config.credentialProfile.length <= 64);
    const checks = [
      {
        name: "Reference configured",
        passed: configured,
        detail: configured ? "A credential profile reference is configured." : "No credential profile reference is configured.",
      },
      {
        name: "Reference shape",
        passed: referenceShape,
        detail: referenceShape
          ? "Reference name uses the approved profile-name shape."
          : "Use lowercase letters, numbers, dot, underscore, colon, or dash, starting with a letter.",
      },
      {
        name: "No inline access material",
        passed: noInlineMaterial,
        detail: noInlineMaterial
          ? "No inline access material was detected in the reference."
          : "Move access material to an external vault or platform credential store.",
      },
    ];
    return {
      provider: config.name as CredentialReferenceDiagnostic["provider"],
      credentialProfile: config.credentialProfile || "not-configured",
      status: !configured ? "Missing" : checks.every((check) => check.passed) ? "Approved reference" : "Invalid",
      checks,
      redactionBoundary: "Only credential profile references are stored. Access material must remain outside NDC Studio.",
    };
  });
}

function deriveMockLabAdapters(sourceIntegrations: Integration[]): LabAdapterSnapshot[] {
  return sourceIntegrations.map((integration) => ({
    ...createEmptyLabAdapter(integration.name),
    product: integration.product,
    mode: integration.name === "NCI" ? "Configured" : "Mock",
    scope:
      integration.name === "NCI"
        ? "Prism Central inventory discovery only. No VM, network, image, project, or policy changes."
        : "Mock adapter scope only until lab endpoint and authorization are documented.",
    message:
      integration.name === "NCI"
        ? "Ready for a read-only Prism Central inventory pilot after lab authorization."
        : "Waiting for lab scope before read-only discovery.",
    nextStep:
      integration.name === "NCI"
        ? "Document Prism Central URL, project scope, and read-only credential profile."
        : integration.nextStep,
  }));
}

function deriveMockProvisioningAdapters(sourceIntegrations: Integration[]): ProvisioningAdapterReadiness[] {
  return sourceIntegrations.map((integration) => ({
    name: integration.name as ProvisioningAdapterReadiness["name"],
    product: integration.product,
    mode: "Mock",
    capabilities: ["validateRequest", "plan", "provision", "pollStatus", "destroy"],
    configured: integration.state === "Healthy",
    provisioningEnabled: false,
    nextGate:
      integration.name === "NCI"
        ? "Map Prism Central image, project, subnet, category, and credential references."
        : integration.nextStep,
  }));
}

function createMockPrismInventoryRecords(
  config: PlatformConfig,
  importedAt: string
): PrismInventoryRecord[] {
  const cluster = config.defaultCluster;
  const project = config.defaultProject;
  const network = config.networkProfile;
  return [
    {
      id: "pc-cluster-berlin-01",
      kind: "Cluster",
      name: cluster,
      source: "Mock Prism Central",
      cluster,
      categories: ["Environment:Lab", "Platform:NCI"],
      importedAt,
      rawRef: "mock://prism/clusters/berlin-01",
    },
    {
      id: "pc-project-devcloud",
      kind: "Project",
      name: project,
      source: "Mock Prism Central",
      cluster,
      project,
      categories: ["Owner:DeveloperCloud", "CostCenter:Sandbox"],
      importedAt,
      rawRef: "mock://prism/projects/developer-cloud-lab",
    },
    {
      id: "pc-image-rocky-9-hardened",
      kind: "Image",
      name: "Rocky Linux 9 Hardened",
      source: "Mock Prism Central",
      cluster,
      project,
      categories: ["OS:Linux", "Baseline:Hardened"],
      importedAt,
      rawRef: "mock://prism/images/rocky-9-hardened",
      profileCandidate: true,
    },
    {
      id: "pc-image-ubuntu-2404-lts",
      kind: "Image",
      name: "Ubuntu 24.04 LTS Developer",
      source: "Mock Prism Central",
      cluster,
      project,
      categories: ["OS:Linux", "Baseline:Developer"],
      importedAt,
      rawRef: "mock://prism/images/ubuntu-2404-lts",
      profileCandidate: true,
    },
    {
      id: "pc-network-dev-segment",
      kind: "Network",
      name: network,
      source: "Mock Prism Central",
      cluster,
      project,
      network,
      categories: ["Network:Developer", "Exposure:Internal"],
      importedAt,
      rawRef: "mock://prism/networks/dev-segment",
    },
    {
      id: "pc-vm-billing-sandbox",
      kind: "VM",
      name: "billing-sandbox",
      source: "Mock Prism Central",
      cluster,
      project,
      network,
      powerState: "Unknown",
      categories: ["Owner:jordan.lee", "Template:VMSandbox"],
      importedAt,
      rawRef: "mock://prism/vms/billing-sandbox",
    },
  ];
}

function createMockVmSandboxDryRun(
  request: VmSandboxDryRunRequest,
  profiles: ResourceProfile[],
  config: PlatformConfig,
  registry: TemplateRegistryEntry[],
  actor: string
): VmSandboxDryRunPlan {
  const image = profiles.find((profile) => profile.id === request.imageProfileId);
  const templateEntry = registry.find((entry) => entry.templateId === "vm-app");
  const createdAt = new Date().toISOString();
  const validations = [
    {
      name: "Template published",
      passed: templateEntry?.status === "Published",
      detail: templateEntry?.status === "Published" ? "Linux VM App Sandbox is published." : "Template must be published.",
    },
    {
      name: "AHV image approved",
      passed: image?.kind === "AHV Image" && image.status === "Published",
      detail: image ? `${image.name} is ${image.status}.` : "Image profile was not found.",
    },
    {
      name: "Project mapped",
      passed: request.project === config.defaultProject,
      detail: `Project ${request.project} mapped to platform config.`,
    },
    {
      name: "Network mapped",
      passed: request.network === config.networkProfile,
      detail: `Network ${request.network} mapped to platform config.`,
    },
    {
      name: "Quota within sandbox limit",
      passed: request.cpu <= 4 && request.memoryGb <= 16 && request.diskGb <= 160,
      detail: `${request.cpu} vCPU, ${request.memoryGb} GB RAM, ${request.diskGb} GB disk requested.`,
    },
    {
      name: "Expiry within policy",
      passed: request.expiryDays > 0 && request.expiryDays <= 30,
      detail: `${request.expiryDays} day expiry requested.`,
    },
    {
      name: "Approval evidence present",
      passed: Boolean(templateEntry?.approvalEvidence && image?.approvedBy),
      detail: "Template and image approval evidence are required before future provisioning.",
    },
  ];

  return {
    id: `vm-dryrun-${request.environmentName}-${Date.now()}`,
    environmentName: request.environmentName,
    owner: request.owner,
    templateId: "vm-app",
    imageProfileId: request.imageProfileId,
    imageName: image?.name ?? "Unknown image profile",
    project: request.project,
    cluster: request.cluster,
    network: request.network,
    category: request.category,
    quota: {
      cpu: request.cpu,
      memoryGb: request.memoryGb,
      diskGb: request.diskGb,
      maxCpu: 4,
      maxMemoryGb: 16,
      maxDiskGb: 160,
    },
    expiryDays: request.expiryDays,
    estimatedMonthlyCost: Math.round(request.cpu * 95 + request.memoryGb * 18 + request.diskGb * 2),
    approvalEvidence: [
      templateEntry?.approvalEvidence ?? "Template approval evidence is missing.",
      image?.approvedBy ? `Image approved by ${image.approvedBy} at ${image.approvedAt ?? "unknown time"}.` : "Image approval is missing.",
      `Dry-run requested by ${actor}; provisioning remains disabled.`,
    ],
    validations,
    rollbackPlan: [
      "No rollback actions required for dry-run because no infrastructure mutation is performed.",
      "Future create path must tag VM with owner, expiry, cost center, and template before power-on.",
      "Future destroy path must remove VM, detach categories, and verify Prism inventory cleanup before closure.",
    ],
    provisioningEnabled: false,
    createdAt,
  };
}

function createMockControlledProvisioningGate(
  dryRun: VmSandboxDryRunPlan,
  rollbackDestroyProofs: RollbackDestroyProofRecord[],
  actor: string
): ControlledProvisioningGate {
  return evaluateMockControlledProvisioningGate({
    id: `vm-controlled-${dryRun.environmentName}-${Date.now()}`,
    dryRunPlanId: dryRun.id,
    environmentName: dryRun.environmentName,
    owner: dryRun.owner,
    requestedBy: actor,
    status: "Blocked",
    approval: {
      status: "Pending",
      evidence: "Manual platform approval required before any controlled create can be considered.",
    },
    pentestScope: {
      required: true,
      present: false,
      reference: "No authorized lab scope file attached.",
      structurallyValid: false,
    },
    checks: [],
    rollbackPlan: dryRun.rollbackPlan,
    destroyPlan: [
      "Confirm target VM name and categories before any future create call.",
      "Queue destroy workflow before power-on so rollback ownership is explicit.",
      "Verify Prism inventory no longer reports the VM before closing the job.",
    ],
    mutationKillSwitch: false,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, rollbackDestroyProofs);
}

function createMockLabAuthorizationScope(actor: string, config: PlatformConfig): LabAuthorizationScope {
  const now = new Date();
  return {
    id: `lab-scope-${Date.now()}`,
    version: "v1",
    name: "Berlin AHV controlled provisioning lab",
    targetEnvironment: "controlled-vm-plan",
    owner: actor,
    approver: actor,
    approvedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    project: config.defaultProject,
    cluster: config.defaultCluster,
    network: config.networkProfile,
    providerCoverage: ["NCI"],
    targetEndpoints: ["prism-central-ref"],
    allowedActions: ["dry_run", "controlled_create_observation", "rollback_validation", "destroy_validation"],
    excludedActions: ["unscoped_create", "bulk_delete", "network_change", "image_delete", "production_workload_change"],
    pentestScopeReference: "Authorized lab scope / controlled provisioning test window",
    pentestScopeStructurallyValid: true,
    evidenceReferences: ["PENTEST_SCOPE_TEMPLATE.md", "operator-approval-record"],
    rollbackOwner: "Cloud Operations",
    status: "Approved",
    createdAt: now.toISOString(),
  };
}

function createMockLabScopeDiagnostics(scopes: LabAuthorizationScope[]): LabScopeDiagnostics {
  const generatedAt = new Date().toISOString();
  const providers: LabScopeDiagnostics["providerCoverage"][number]["provider"][] = ["NCI", "NKP", "NDB", "NUS", "NCM", "NAI"];
  const latest = scopes[0];
  const latestChecks = latest ? createMockLabScopeChecks(latest) : [];
  const readyScopes = scopes.filter((scope) => createMockLabScopeChecks(scope).every((check) => check.passed));

  return {
    generatedAt,
    totalScopes: scopes.length,
    readyScopes: readyScopes.length,
    providerCoverage: providers.map((provider) => {
      const scope = readyScopes.find((item) => item.providerCoverage.includes(provider));
      return {
        provider,
        covered: Boolean(scope),
        scopeId: scope?.id,
      };
    }),
    latest: latest
      ? {
          scopeId: latest.id,
          status: latest.status,
          expiresAt: latest.expiresAt,
          daysUntilExpiry: Math.floor((new Date(latest.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
          checks: latestChecks,
          readyForAdapterReview: latestChecks.every((check) => check.passed),
        }
      : undefined,
  };
}

function createMockLabScopeChecks(scope: LabAuthorizationScope) {
  const now = Date.now();
  return [
    {
      name: "Authorization approved",
      passed: scope.status === "Approved" && new Date(scope.expiresAt).getTime() > now,
      detail: scope.status === "Approved" ? `Approved by ${scope.approver} until ${scope.expiresAt}.` : "Scope is expired.",
    },
    {
      name: "Pentest scope structured",
      passed: scope.pentestScopeStructurallyValid,
      detail: scope.pentestScopeReference,
    },
    {
      name: "Target endpoints documented",
      passed: scope.targetEndpoints.length > 0,
      detail: scope.targetEndpoints.join(", ") || "Target endpoint references are required.",
    },
    {
      name: "Provider coverage documented",
      passed: scope.providerCoverage.length > 0,
      detail: scope.providerCoverage.join(", ") || "Provider coverage is required.",
    },
    {
      name: "Allowed and excluded actions documented",
      passed: scope.allowedActions.length > 0 && scope.excludedActions.length > 0,
      detail: `${scope.allowedActions.length} allowed / ${scope.excludedActions.length} excluded.`,
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(scope.rollbackOwner),
      detail: scope.rollbackOwner || "Rollback owner is required.",
    },
    {
      name: "Evidence references documented",
      passed: scope.evidenceReferences.length > 0,
      detail: scope.evidenceReferences.join(", ") || "Evidence references are required.",
    },
  ];
}

function createMockVmLifecycleProof(gate: ControlledProvisioningGate, actor: string): VmLifecycleProof {
  const checks = [
    {
      name: "Controlled gate approved",
      passed: gate.status === "Approved for controlled create",
      detail:
        gate.status === "Approved for controlled create"
          ? "Controlled create gate is approved."
          : `Gate status is ${gate.status}.`,
    },
    {
      name: "Rollback verified",
      passed: true,
      detail: "Rollback evidence was recorded.",
    },
    {
      name: "Destroy verified",
      passed: true,
      detail: "Destroy evidence was recorded.",
    },
  ];

  return {
    id: `vm-lifecycle-proof-${gate.environmentName}-${Date.now()}`,
    gateId: gate.id,
    environmentName: gate.environmentName,
    status: checks.every((check) => check.passed) ? "Verified" : "Blocked",
    rollbackVerified: true,
    destroyVerified: true,
    checks,
    evidence: [`Lifecycle proof recorded by ${actor}; live provisioning remains disabled in this prototype.`],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockRollbackDestroyProof(
  dryRun: VmSandboxDryRunPlan,
  auditExports: AuditExportRecord[],
  actor: string
): RollbackDestroyProofRecord {
  const auditExportReady = auditExports.length > 0;
  const rollbackOwner = "Cloud Operations";
  const teardownOrder = [
    "Disable owner access and routes before power state changes.",
    "Power off the VM before deletion.",
    "Delete VM and verify inventory reconciliation.",
  ];
  const stopConditions = [
    "Stop if owner notification is missing.",
    "Stop if inventory reconciliation fails.",
    "Stop if audit export evidence is unavailable.",
  ];
  const checks = [
    {
      name: "Backup/export evidence referenced",
      passed: true,
      detail: "audit-export-manifest",
    },
    {
      name: "Owner notification referenced",
      passed: true,
      detail: "owner-notification-record",
    },
    {
      name: "Rollback owner assigned",
      passed: true,
      detail: rollbackOwner,
    },
    {
      name: "Teardown order documented",
      passed: true,
      detail: `${teardownOrder.length} teardown steps documented.`,
    },
    {
      name: "Inventory reconciliation referenced",
      passed: true,
      detail: "prism-inventory-reconciliation",
    },
    {
      name: "Audit export ready",
      passed: auditExportReady,
      detail: auditExportReady ? `${auditExports.length} audit export record exists.` : "Audit export must be prepared.",
    },
  ];

  return {
    id: `rollback-destroy-${dryRun.environmentName}-${Date.now()}`,
    dryRunPlanId: dryRun.id,
    environmentName: dryRun.environmentName,
    status: checks.every((check) => check.passed) ? "Ready for controlled create" : "Blocked",
    requestedBy: actor,
    rollbackOwner,
    checks,
    teardownOrder,
    stopConditions,
    evidenceReferences: ["audit-export-manifest", "owner-notification-record", "prism-inventory-reconciliation"],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockControlledCreateAuthorizationEnvelope({
  actor,
  labAuthorizationScopes,
  vmSandboxDryRuns,
  controlledProvisioningGates,
  rollbackDestroyProofs,
  vmLifecycleProofs,
  adapterEnablementRecords,
  auditExports,
}: {
  actor: string;
  labAuthorizationScopes: LabAuthorizationScope[];
  vmSandboxDryRuns: VmSandboxDryRunPlan[];
  controlledProvisioningGates: ControlledProvisioningGate[];
  rollbackDestroyProofs: RollbackDestroyProofRecord[];
  vmLifecycleProofs: VmLifecycleProof[];
  adapterEnablementRecords: AdapterEnablementRecord[];
  auditExports: AuditExportRecord[];
}): ControlledCreateAuthorizationEnvelope {
  const gate = controlledProvisioningGates[0];
  const dryRun = vmSandboxDryRuns.find((item) => item.id === gate?.dryRunPlanId) ?? vmSandboxDryRuns[0];
  const activeScope = labAuthorizationScopes.find((scope) => createMockLabScopeChecks(scope).every((check) => check.passed));
  const rollbackProof = rollbackDestroyProofs.find((proof) => proof.dryRunPlanId === dryRun?.id && proof.status === "Ready for controlled create");
  const lifecycleProof = vmLifecycleProofs.find((proof) => proof.gateId === gate?.id && proof.status === "Verified");
  const adapterEnablement = adapterEnablementRecords.find((record) => record.provider === "NCI" && record.status === "Ready for review");
  const auditExport = auditExports[0];
  const checks = [
    {
      name: "Lab scope active",
      passed: Boolean(activeScope),
      detail: activeScope ? activeScope.id : "Active lab scope is required.",
    },
    {
      name: "Rollback destroy proof ready",
      passed: Boolean(rollbackProof),
      detail: rollbackProof ? rollbackProof.id : "Rollback/destroy proof must be ready.",
    },
    {
      name: "Controlled gate approved",
      passed: gate?.status === "Approved for controlled create",
      detail: gate ? `Gate status is ${gate.status}.` : "Controlled gate is required.",
    },
    {
      name: "Lifecycle proof verified",
      passed: Boolean(lifecycleProof),
      detail: lifecycleProof ? lifecycleProof.id : "Verified lifecycle proof is required.",
    },
    {
      name: "Adapter enablement ready",
      passed: Boolean(adapterEnablement),
      detail: adapterEnablement ? adapterEnablement.id : "NCI adapter enablement review must be ready.",
    },
    {
      name: "Audit export ready",
      passed: Boolean(auditExport),
      detail: auditExport ? auditExport.id : "Audit export must be prepared.",
    },
    {
      name: "Active pentest scope",
      passed: false,
      detail: "Active authorized pentest scope is required before live adapter authorization.",
    },
    {
      name: "Real mutation remains disabled",
      passed: true,
      detail: "Controlled create switch and AHV real adapter are disabled.",
    },
  ];

  return {
    id: `controlled-create-auth-${dryRun?.environmentName ?? "missing"}-${Date.now()}`,
    status: checks.every((check) => check.passed) ? "Ready for authorization review" : "Blocked",
    requestedBy: actor,
    environmentName: dryRun?.environmentName ?? "missing-dry-run",
    dryRunPlanId: dryRun?.id ?? "missing-dry-run",
    gateId: gate?.id,
    checks,
    evidence: [
      `Lab scope: ${activeScope?.id ?? "missing"}.`,
      `Rollback/destroy proof: ${rollbackProof?.id ?? "missing"}.`,
      `Lifecycle proof: ${lifecycleProof?.id ?? "missing"}.`,
      `Adapter enablement: ${adapterEnablement?.id ?? "missing"}.`,
      `Audit export: ${auditExport?.id ?? "missing"}.`,
      "Pentest scope: missing.",
    ],
    allowedCreateFields: ["name", "project", "cluster", "network", "imageProfileId", "cpu", "memoryGb", "diskGb", "category", "owner"],
    killSwitch: {
      name: "NDC_CONTROLLED_PROVISIONING_ENABLED",
      enabled: false,
    },
    emergencyStopProcedure: [
      "Disable NDC_CONTROLLED_PROVISIONING_ENABLED before any further review.",
      "Keep NDC_AHV_REAL_ADAPTER_ENABLED disabled until approved adapter implementation is present.",
      "Notify rollback owner and preserve audit export evidence.",
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockAhvCreateAdapterContractReview({
  actor,
  vmSandboxDryRuns,
  controlledCreateAuthorizationEnvelopes,
}: {
  actor: string;
  vmSandboxDryRuns: VmSandboxDryRunPlan[];
  controlledCreateAuthorizationEnvelopes: ControlledCreateAuthorizationEnvelope[];
}): AhvCreateAdapterContractReview {
  const envelope = controlledCreateAuthorizationEnvelopes[0];
  const dryRun = vmSandboxDryRuns.find((item) => item.id === envelope?.dryRunPlanId) ?? vmSandboxDryRuns[0];
  const payload = {
    name: dryRun?.environmentName ?? "missing-dry-run",
    project: dryRun?.project ?? defaultPlatformConfig.defaultProject,
    cluster: dryRun?.cluster ?? defaultPlatformConfig.defaultCluster,
    network: dryRun?.network ?? defaultPlatformConfig.networkProfile,
    imageProfileId: dryRun?.imageProfileId ?? "ahv-rocky-9-hardened",
    cpu: dryRun?.quota.cpu ?? 2,
    memoryGb: dryRun?.quota.memoryGb ?? 8,
    diskGb: dryRun?.quota.diskGb ?? 80,
    category: dryRun?.category ?? "Lifecycle:30-day-expiry",
    owner: dryRun?.owner ?? actor,
  };
  const approvedFields = envelope?.allowedCreateFields ?? [];
  const disallowedFields = Object.keys(payload).filter((field) => !approvedFields.includes(field));
  const checks = [
    {
      name: "Authorization envelope approved",
      passed: envelope?.status === "Ready for authorization review",
      detail: envelope ? `Envelope status is ${envelope.status}.` : "Authorization envelope is required.",
    },
    {
      name: "Payload fields approved",
      passed: Boolean(envelope) && disallowedFields.length === 0,
      detail:
        envelope && disallowedFields.length === 0
          ? "Mapped payload only uses approved create fields."
          : `Disallowed fields: ${disallowedFields.join(", ") || "all fields until envelope exists"}.`,
    },
    {
      name: "Dry-run validations passed",
      passed: Boolean(dryRun?.validations.every((validation) => validation.passed)),
      detail: dryRun ? "VM sandbox dry-run validations must pass before payload mapping." : "Dry-run plan is required.",
    },
    {
      name: "Execute path disabled",
      passed: true,
      detail: "Execute, poll, and rollback remain disabled.",
    },
  ];

  return {
    id: `ahv-create-contract-${payload.name}-${Date.now()}`,
    environmentName: payload.name,
    dryRunPlanId: dryRun?.id ?? "missing-dry-run",
    adapterMode: "Disabled real adapter",
    status: checks.every((check) => check.passed) ? "Payload ready but execution disabled" : "Blocked",
    requestedBy: actor,
    payload,
    checks,
    blockedOperations: ["create_vm", "clone_vm", "power_on_vm", "poll_task", "rollback_create", "delete_vm"],
    killSwitch: {
      name: "NDC_AHV_REAL_ADAPTER_ENABLED",
      enabled: false,
    },
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockAhvControlledProvisioningRun(
  gate: ControlledProvisioningGate,
  dryRuns: VmSandboxDryRunPlan[],
  scopes: LabAuthorizationScope[],
  proofs: VmLifecycleProof[],
  actor: string
): AhvControlledProvisioningRun {
  const dryRun = dryRuns.find((item) => item.id === gate.dryRunPlanId) ?? dryRuns[0];
  const activeScope = scopes.find((scope) => scope.status === "Approved" && scope.pentestScopeStructurallyValid);
  const lifecycleProof = proofs.find((proof) => proof.gateId === gate.id && proof.status === "Verified");
  const checks = [
    {
      name: "Controlled gate approved",
      passed: gate.status === "Approved for controlled create",
      detail: gate.status === "Approved for controlled create" ? "Controlled gate is approved." : `Gate status is ${gate.status}.`,
    },
    {
      name: "Lab scope active",
      passed: Boolean(activeScope),
      detail: activeScope
        ? `${activeScope.project} / ${activeScope.cluster} / ${activeScope.network}`
        : "Active lab authorization scope is required.",
    },
    {
      name: "Lifecycle proof verified",
      passed: Boolean(lifecycleProof),
      detail: lifecycleProof ? "Rollback and destroy proof is verified." : "Verified lifecycle proof is required.",
    },
    {
      name: "Create switch enabled",
      passed: false,
      detail: "Controlled create switch is disabled.",
    },
    {
      name: "AHV adapter enabled",
      passed: false,
      detail: "AHV real adapter remains disabled.",
    },
  ];

  return {
    id: `ahv-run-${gate.environmentName}-${Date.now()}`,
    gateId: gate.id,
    dryRunPlanId: dryRun?.id ?? gate.dryRunPlanId,
    environmentName: gate.environmentName,
    action: "Create VM",
    adapterMode: "Disabled real adapter",
    status: checks.every((check) => check.passed) ? "Ready but disabled" : "Preflight blocked",
    checks,
    requestedBy: actor,
    labScopeId: activeScope?.id,
    lifecycleProofId: lifecycleProof?.id,
    mutationOperationsBlocked: ["create_vm", "clone_vm", "power_on", "power_off", "delete_vm", "update_network", "update_category"],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function evaluateMockControlledProvisioningGate(
  gate: ControlledProvisioningGate,
  rollbackDestroyProofs: RollbackDestroyProofRecord[] = []
): ControlledProvisioningGate {
  const rollbackDestroyProof = rollbackDestroyProofs.find(
    (proof) => proof.dryRunPlanId === gate.dryRunPlanId && proof.status === "Ready for controlled create"
  );
  const rollbackReady = gate.rollbackPlan.length > 0 && Boolean(rollbackDestroyProof);
  const destroyReady = gate.destroyPlan.length > 0 && Boolean(rollbackDestroyProof);
  const approvalReady = gate.approval.status === "Approved";
  const scopeReady = gate.pentestScope.present && gate.pentestScope.structurallyValid;
  const checks = [
    {
      name: "Dry-run validations passed",
      passed: true,
      detail: "All VM sandbox dry-run validations passed.",
    },
    {
      name: "Rollback plan ready",
      passed: rollbackReady,
      detail: rollbackReady ? `Rollback/destroy proof ${rollbackDestroyProof?.id} is ready.` : "Rollback/destroy proof is required.",
    },
    {
      name: "Destroy plan ready",
      passed: destroyReady,
      detail: destroyReady ? `Destroy proof ${rollbackDestroyProof?.id} is ready.` : "Destroy proof is required.",
    },
    {
      name: "Manual approval recorded",
      passed: approvalReady,
      detail: approvalReady ? gate.approval.evidence : "A platform approver must approve this gate.",
    },
    {
      name: "Authorized scope attached",
      passed: scopeReady,
      detail: scopeReady ? gate.pentestScope.reference : "Authorized lab scope remains required.",
    },
    {
      name: "Mutation kill switch enabled",
      passed: gate.mutationKillSwitch,
      detail: gate.mutationKillSwitch ? "Kill switch enabled." : "Kill switch is disabled by default.",
    },
  ];

  return {
    ...gate,
    status:
      gate.approval.status === "Rejected"
        ? "Blocked"
        : approvalReady
          ? scopeReady && gate.mutationKillSwitch
            ? "Approved for controlled create"
            : "Mutation disabled"
          : "Manual approval required",
    checks,
    provisioningEnabled: false,
  };
}

function createMockPlatformServiceRequest(
  input: { kind: PlatformServiceKind; owner: string; environmentName: string },
  profiles: ResourceProfile[],
  proofs: VmLifecycleProof[],
  actor: string
): PlatformServiceRequest {
  const defaults: Record<PlatformServiceKind, { provider: ResourceProfile["provider"]; profileId: string; name: string; cost: number; approvalRequired: boolean }> = {
    "NKP Namespace": { provider: "NKP", profileId: "nkp-1-30-standard", name: "app-namespace-dev", cost: 480, approvalRequired: false },
    "NDB PostgreSQL": { provider: "NDB", profileId: "ndb-postgres-16-dev", name: "app-postgres-dev", cost: 720, approvalRequired: true },
    "NUS Storage": { provider: "NUS", profileId: "nus-object-dev", name: "app-object-dev", cost: 260, approvalRequired: false },
    "NAI Endpoint": { provider: "NAI", profileId: "nai-gpu-small", name: "app-ai-endpoint-dev", cost: 1380, approvalRequired: true },
  };
  const config = defaults[input.kind];
  const profile = profiles.find((item) => item.id === config.profileId);
  const vmLifecycleProven = proofs.some((proof) => proof.status === "Verified");
  const validations = [
    {
      name: "Profile published",
      passed: profile?.status === "Published",
      detail: profile ? `${profile.name} is ${profile.status}.` : "Required profile was not found.",
    },
    {
      name: "Provider matched",
      passed: profile?.provider === config.provider,
      detail: `Expected provider ${config.provider}.`,
    },
    {
      name: "Service name valid",
      passed: true,
      detail: `${config.name} will be used as the service identifier.`,
    },
    {
      name: "Environment mapped",
      passed: Boolean(input.environmentName),
      detail: `${input.environmentName} is the owning environment reference.`,
    },
    {
      name: "VM lifecycle proven",
      passed: vmLifecycleProven,
      detail: vmLifecycleProven
        ? "Controlled VM lifecycle proof is present."
        : "Complete controlled VM create, verify, rollback, and destroy proof before platform services are enabled.",
    },
  ];

  return {
    id: `platform-service-${config.provider.toLowerCase()}-${Date.now()}`,
    kind: input.kind,
    serviceName: config.name,
    environmentName: input.environmentName,
    owner: input.owner,
    profileId: config.profileId,
    profileName: profile?.name ?? "Profile not found",
    provider: config.provider,
    status: validations.every((validation) => validation.passed)
      ? config.approvalRequired
        ? "Needs approval"
        : "Ready for approval"
      : "Blocked",
    dependsOnVmLifecycle: true,
    vmLifecycleProven,
    validations,
    estimatedMonthlyCost: config.cost,
    approvalRequired: config.approvalRequired,
    approvalEvidence: [
      profile?.approvedBy ? `${profile.name} approved by ${profile.approvedBy}.` : "Profile approval is missing.",
      vmLifecycleProven ? "VM lifecycle proof is present." : "VM lifecycle proof is required before platform-service provisioning.",
      `Request planned by ${actor}; provisioning remains disabled.`,
    ],
    rollbackPlan: ["Reverse service-specific bindings before releasing the request."],
    cleanupPlan: ["Verify service allocation, access policy, and owner metadata are removed."],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockPlatformServicePreflightRun(
  serviceRequest: PlatformServiceRequest,
  configs: IntegrationConfig[],
  adapters: ProvisioningAdapterReadiness[],
  actor: string
): PlatformServicePreflightRun {
  const providerReady = configs.find((item) => item.name === serviceRequest.provider)?.status === "Reachable";
  const adapterReady = adapters.find((item) => item.name === serviceRequest.provider)?.configured === true;
  const validationsPassed = serviceRequest.validations.every((validation) => validation.passed);
  const checks = [
    {
      name: "Request validations passed",
      passed: validationsPassed,
      detail: validationsPassed ? "Platform-service request validations passed." : "Request validations are still blocked.",
    },
    {
      name: "VM lifecycle proven",
      passed: serviceRequest.vmLifecycleProven,
      detail: serviceRequest.vmLifecycleProven ? "VM lifecycle proof is present." : "VM lifecycle proof is required.",
    },
    {
      name: "Provider readiness checked",
      passed: providerReady,
      detail: providerReady ? `${serviceRequest.provider} integration is reachable.` : `${serviceRequest.provider} integration is not reachable.`,
    },
    {
      name: "Adapter configured",
      passed: adapterReady,
      detail: adapterReady ? `${serviceRequest.provider} adapter is configured.` : `${serviceRequest.provider} adapter is not configured.`,
    },
    {
      name: "Real adapter switch enabled",
      passed: false,
      detail: `${serviceRequest.provider} real adapter switch is disabled.`,
    },
  ];

  return {
    id: `platform-preflight-${serviceRequest.provider.toLowerCase()}-${Date.now()}`,
    requestId: serviceRequest.id,
    kind: serviceRequest.kind,
    serviceName: serviceRequest.serviceName,
    provider: serviceRequest.provider,
    adapterMode: "Disabled real adapter",
    status: checks.every((check) => check.passed) ? "Ready but disabled" : "Preflight blocked",
    checks,
    requestedBy: actor,
    mutationOperationsBlocked: blockedPlatformServiceOperations(serviceRequest.kind),
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockPlatformServiceAdapterContractReview(
  serviceRequest: PlatformServiceRequest,
  preflightRuns: PlatformServicePreflightRun[],
  actor: string
): PlatformServiceAdapterContractReview {
  const preflightRun = preflightRuns.find((run) => run.requestId === serviceRequest.id);
  const payload = {
    kind: serviceRequest.kind,
    provider: serviceRequest.provider,
    serviceName: serviceRequest.serviceName,
    environmentName: serviceRequest.environmentName,
    owner: serviceRequest.owner,
    profileId: serviceRequest.profileId,
    profileName: serviceRequest.profileName,
    estimatedMonthlyCost: serviceRequest.estimatedMonthlyCost,
    approvalRequired: serviceRequest.approvalRequired,
    rollbackPlan: serviceRequest.rollbackPlan,
    cleanupPlan: serviceRequest.cleanupPlan,
  };
  const approvedFields = [
    "kind",
    "provider",
    "serviceName",
    "environmentName",
    "owner",
    "profileId",
    "profileName",
    "estimatedMonthlyCost",
    "approvalRequired",
    "rollbackPlan",
    "cleanupPlan",
  ];
  const disallowedFields = Object.keys(payload).filter((field) => !approvedFields.includes(field));
  const checks = [
    {
      name: "Request validations passed",
      passed: serviceRequest.validations.every((validation) => validation.passed),
      detail: `Request status is ${serviceRequest.status}.`,
    },
    {
      name: "Preflight run recorded",
      passed: Boolean(preflightRun),
      detail: preflightRun ? `Preflight status is ${preflightRun.status}.` : "Service preflight must be recorded.",
    },
    {
      name: "Payload fields approved",
      passed: disallowedFields.length === 0,
      detail:
        disallowedFields.length === 0
          ? "Mapped payload only uses approved service fields."
          : `Disallowed fields: ${disallowedFields.join(", ")}.`,
    },
    {
      name: "Execute path disabled",
      passed: true,
      detail: "Execute, poll, and rollback remain disabled.",
    },
  ];

  return {
    id: `service-contract-${serviceRequest.provider.toLowerCase()}-${serviceRequest.serviceName}-${Date.now()}`,
    requestId: serviceRequest.id,
    preflightRunId: preflightRun?.id,
    kind: serviceRequest.kind,
    serviceName: serviceRequest.serviceName,
    provider: serviceRequest.provider,
    adapterMode: "Disabled real adapter",
    status: checks.every((check) => check.passed) ? "Payload ready but execution disabled" : "Blocked",
    requestedBy: actor,
    payload,
    checks,
    blockedOperations: blockedPlatformServiceOperations(serviceRequest.kind),
    killSwitch: {
      name: `NDC_${serviceRequest.provider}_REAL_ADAPTER_ENABLED`,
      enabled: false,
    },
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProviderReleaseGateRecord({
  provider,
  actor,
  session,
  labAuthorizationScopes,
  credentialDiagnostics,
  adapterEnablementRecords,
  vmLifecycleProofs,
  ahvCreateAdapterContractReviews,
  ahvControlledProvisioningRuns,
  platformServiceAdapterContractReviews,
  platformServicePreflightRuns,
  auditExports,
}: {
  provider: ProviderReleaseGateRecord["provider"];
  actor: string;
  session: PlatformSession;
  labAuthorizationScopes: LabAuthorizationScope[];
  credentialDiagnostics: CredentialReferenceDiagnostic[];
  adapterEnablementRecords: AdapterEnablementRecord[];
  vmLifecycleProofs: VmLifecycleProof[];
  ahvCreateAdapterContractReviews: AhvCreateAdapterContractReview[];
  ahvControlledProvisioningRuns: AhvControlledProvisioningRun[];
  platformServiceAdapterContractReviews: PlatformServiceAdapterContractReview[];
  platformServicePreflightRuns: PlatformServicePreflightRun[];
  auditExports: AuditExportRecord[];
}): ProviderReleaseGateRecord {
  const activeScope = labAuthorizationScopes.find(
    (scope) => scope.status === "Approved" && scope.pentestScopeStructurallyValid && scope.providerCoverage.includes(provider)
  );
  const credentialDiagnostic = credentialDiagnostics.find((item) => item.provider === provider);
  const lifecycleProof = vmLifecycleProofs.find((proof) => proof.status === "Verified");
  const adapterEnablement = adapterEnablementRecords.find(
    (record) => record.provider === provider && record.status === "Ready for review"
  );
  const providerEvidence =
    provider === "NCI"
      ? {
          contractId: ahvCreateAdapterContractReviews.find((review) => review.status === "Payload ready but execution disabled")?.id,
          preflightId: ahvControlledProvisioningRuns.find((run) => run.status === "Ready but disabled")?.id,
        }
      : {
          contractId: platformServiceAdapterContractReviews.find(
            (review) => review.provider === provider && review.status === "Payload ready but execution disabled"
          )?.id,
          preflightId: platformServicePreflightRuns.find(
            (run) => run.provider === provider && run.status === "Ready but disabled"
          )?.id,
        };
  const releaseApprover = session.user || "Cloud Platform Owner";
  const checks = [
    {
      name: "Approved lab scope",
      passed: Boolean(activeScope),
      detail: activeScope ? `${activeScope.id} covers ${provider}.` : "Active lab scope is required.",
    },
    {
      name: "Credential reference approved",
      passed: credentialDiagnostic?.status === "Approved reference",
      detail: `${provider} credential diagnostic is ${credentialDiagnostic?.status ?? "Missing"}.`,
    },
    {
      name: "VM lifecycle proof verified",
      passed: Boolean(lifecycleProof),
      detail: lifecycleProof ? lifecycleProof.id : "Verified VM lifecycle proof is required.",
    },
    {
      name: "Adapter enablement ready",
      passed: Boolean(adapterEnablement),
      detail: adapterEnablement ? adapterEnablement.id : `${provider} adapter enablement review is required.`,
    },
    {
      name: "Provider contract evidence ready",
      passed: Boolean(providerEvidence.contractId),
      detail: providerEvidence.contractId ?? `${provider} contract review is required.`,
    },
    {
      name: "Provider preflight recorded",
      passed: Boolean(providerEvidence.preflightId),
      detail: providerEvidence.preflightId ?? `${provider} preflight evidence is required.`,
    },
    {
      name: "Audit export ready",
      passed: auditExports.length > 0,
      detail: auditExports.length > 0 ? "Audit export manifest exists." : "Audit export evidence is required.",
    },
    {
      name: "Release approver assigned",
      passed: Boolean(releaseApprover),
      detail: releaseApprover,
    },
    {
      name: "Real adapter disabled",
      passed: true,
      detail: `${provider} real adapter switch remains disabled.`,
    },
  ];

  return {
    id: `provider-release-${provider.toLowerCase()}-${Date.now()}`,
    provider,
    product: provider,
    status: checks.every((check) => check.passed) ? "Ready for release review" : "Blocked",
    requestedBy: actor,
    releaseApprover,
    checks,
    evidence: [
      `Lab scope: ${activeScope?.id ?? "missing"}.`,
      `Credential diagnostic: ${credentialDiagnostic?.status ?? "missing"}.`,
      `Lifecycle proof: ${lifecycleProof?.id ?? "missing"}.`,
      `Adapter enablement: ${adapterEnablement?.id ?? "missing"}.`,
      `Provider contract: ${providerEvidence.contractId ?? "missing"}.`,
      `Provider preflight: ${providerEvidence.preflightId ?? "missing"}.`,
      `Audit exports prepared: ${auditExports.length}.`,
      `Release approver: ${releaseApprover}.`,
    ],
    blockedOperations: blockedPlatformProviderOperations(provider),
    killSwitch: {
      name: `NDC_${provider}_REAL_ADAPTER_ENABLED`,
      enabled: false,
    },
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProviderReleaseReadinessSummary(
  records: ProviderReleaseGateRecord[]
): ProviderReleaseReadinessSummary {
  const providers: ProviderReleaseGateRecord["provider"][] = ["NCI", "NKP", "NDB", "NUS", "NAI"];
  const summaries: ProviderReleaseReadinessSummary["providers"] = providers.map((provider) => {
    const latestGate = records.find((record) => record.provider === provider);
    const gaps = latestGate?.checks.filter((check) => !check.passed).map((check) => check.name) ?? [
      "Provider release gate not reviewed",
    ];
    const passedChecks = latestGate?.checks.filter((check) => check.passed).length ?? 0;
    const checkCount = latestGate?.checks.length ?? 0;

    return {
      provider,
      latestGateId: latestGate?.id,
      status: latestGate?.status ?? "No gate",
      checkCount,
      passedChecks,
      gapCount: gaps.length,
      gaps,
      blockedOperations: latestGate?.blockedOperations ?? blockedPlatformProviderOperations(provider),
      killSwitch: latestGate?.killSwitch ?? {
        name: `NDC_${provider}_REAL_ADAPTER_ENABLED`,
        enabled: false,
      },
    };
  });
  const reviewedProviders = summaries.filter((provider) => provider.checkCount > 0);
  const nearestToReady = [...reviewedProviders].sort(
    (a, b) => b.passedChecks - a.passedChecks || a.gapCount - b.gapCount
  )[0]?.provider;
  const mostBlocked = [...summaries].sort((a, b) => b.gapCount - a.gapCount || a.passedChecks - b.passedChecks)[0]
    ?.provider;

  return {
    generatedAt: new Date().toISOString(),
    providers: summaries,
    nearestToReady,
    mostBlocked,
    provisioningEnabled: false,
  };
}

function createMockReleaseEvidenceExportRecord(
  gate: ProviderReleaseGateRecord,
  actor: string
): ReleaseEvidenceExportRecord {
  const createdAt = new Date().toISOString();
  const evidenceReferences = gate.evidence.map((item) =>
    item
      .replace(/:\/\/[^/\s]*@/g, "://redacted@")
      .replace(/([?&](?:key|sig|cred)=)[^&\s]+/gi, "$1redacted")
  );
  const manifest = {
    exportId: `release-evidence-export-${gate.provider.toLowerCase()}-${Date.now()}`,
    gateId: gate.id,
    provider: gate.provider,
    gateStatus: gate.status,
    generatedAt: createdAt,
    releaseApprover: gate.releaseApprover,
    checkCount: gate.checks.length,
    passedChecks: gate.checks.filter((check) => check.passed).length,
    blockedOperations: gate.blockedOperations,
    killSwitch: gate.killSwitch,
    evidenceReferences,
  };

  return {
    id: manifest.exportId,
    provider: gate.provider,
    gateId: gate.id,
    status: "Prepared",
    requestedBy: actor,
    format: "JSON",
    checksumAlgorithm: "sha256",
    checksum: `mock-${gate.provider.toLowerCase()}-${manifest.checkCount}-${manifest.passedChecks}`,
    manifest,
    redactionBoundary: "Release evidence exports contain references and metadata only; no inline auth material.",
    storageBoundary: "Export record is metadata only; configure external evidence storage before production release reviews.",
    provisioningEnabled: false,
    createdAt,
  };
}

function createMockControlledLabReleaseRunbookRecord(
  provider: ProviderReleaseGateRecord["provider"],
  readiness: ProviderReleaseReadinessSummary,
  gates: ProviderReleaseGateRecord[],
  actor: string
): ControlledLabReleaseRunbookRecord {
  const providerReadiness = readiness.providers.find((item) => item.provider === provider);
  const gate = providerReadiness?.latestGateId
    ? gates.find((item) => item.id === providerReadiness.latestGateId)
    : gates.find((item) => item.provider === provider);
  const signOffs: ControlledLabReleaseRunbookRecord["signOffs"] = [
    {
      role: "Platform owner",
      owner: "Cloud Platform Owner",
      signed: false,
      evidence: "Platform owner sign-off evidence required.",
    },
    {
      role: "Security reviewer",
      owner: "Security Reviewer",
      signed: false,
      evidence: "Security review sign-off evidence required.",
    },
    {
      role: "Rollback owner",
      owner: "Cloud Operations",
      signed: false,
      evidence: "Rollback owner sign-off evidence required.",
    },
    {
      role: "Lab owner",
      owner: "Lab Owner",
      signed: false,
      evidence: "Lab owner sign-off evidence required.",
    },
  ];
  const stopConditions = [
    `${provider} endpoint response differs from approved release evidence.`,
    "Any sensitive value, credential prompt, or unauthorized mutation appears during the test window.",
    "Rollback owner, lab owner, or security reviewer is unavailable.",
    "Audit export, backup, rollback, or destroy evidence cannot be captured.",
  ];
  const checks = [
    {
      name: "Provider release gate ready",
      passed: gate?.status === "Ready for release review",
      detail: gate ? `${gate.id} is ${gate.status}.` : `${provider} provider release gate is required.`,
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
      detail: "0/4 sign-offs recorded.",
    },
    {
      name: "Stop conditions documented",
      passed: stopConditions.length >= 3,
      detail: `${stopConditions.length} stop condition(s) documented.`,
    },
    {
      name: "Escalation contacts documented",
      passed: true,
      detail: "3 escalation contact(s) documented.",
    },
    {
      name: "Real adapter execution disabled",
      passed: gate?.provisioningEnabled === false && providerReadiness?.killSwitch.enabled === false,
      detail: `${provider} remains evidence-only with real adapter disabled.`,
    },
  ];

  return {
    id: `controlled-lab-runbook-${provider.toLowerCase()}-${Date.now()}`,
    provider,
    readinessGeneratedAt: readiness.generatedAt,
    status: checks.every((check) => check.passed) ? "Ready for controlled lab release review" : "Blocked",
    requestedBy: actor,
    signOffs,
    checks,
    stopConditions,
    escalationContacts: ["cloud-platform-owner", "security-reviewer", "lab-owner"],
    linkedReleaseGateId: gate?.id,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockControlledLabDryRunWindowRecord({
  provider,
  actor,
  runbook,
  releaseExport,
  labScope,
  auditExports,
}: {
  provider: ProviderReleaseGateRecord["provider"];
  actor: string;
  runbook?: ControlledLabReleaseRunbookRecord;
  releaseExport?: ReleaseEvidenceExportRecord;
  labScope?: LabAuthorizationScope;
  auditExports: AuditExportRecord[];
}): ControlledLabDryRunWindowRecord {
  const scheduledStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const scheduledEnd = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
  const rollbackOwner = runbook?.signOffs.find((item) => item.role === "Rollback owner")?.owner ?? "Cloud Operations";
  const emergencyStopContacts = runbook?.escalationContacts ?? ["cloud-platform-owner", "security-reviewer", "lab-owner"];
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
      passed: Boolean(labScope?.status === "Approved" && labScope.providerCoverage.includes(provider)),
      detail: labScope ? `${labScope.id} is ${labScope.status}.` : "Approved active lab scope is required.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner || "Rollback owner is required during the window.",
    },
    {
      name: "Audit export ready",
      passed: auditExports.length > 0,
      detail: auditExports.length > 0 ? "Audit export manifest exists." : "Audit export evidence is required.",
    },
    {
      name: "Emergency stop contacts assigned",
      passed: emergencyStopContacts.length >= 2,
      detail: `${emergencyStopContacts.length} emergency stop contact(s) assigned.`,
    },
    {
      name: "Window timing valid",
      passed: true,
      detail: `${scheduledStart} to ${scheduledEnd}.`,
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
    linkedLabScopeId: labScope?.id,
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

function createMockLabWindowEvidenceExportRecord(
  window: ControlledLabDryRunWindowRecord,
  actor: string
): LabWindowEvidenceExportRecord {
  const createdAt = new Date().toISOString();
  const manifest: LabWindowEvidenceExportRecord["manifest"] = {
    exportId: `lab-window-evidence-export-${window.provider.toLowerCase()}-${Date.now()}`,
    windowId: window.id,
    provider: window.provider,
    windowStatus: window.status,
    generatedAt: createdAt,
    scheduledStart: window.scheduledStart,
    scheduledEnd: window.scheduledEnd,
    linkedRunbookId: window.linkedRunbookId,
    linkedReleaseEvidenceExportId: window.linkedReleaseEvidenceExportId,
    linkedLabScopeId: window.linkedLabScopeId,
    rollbackOwner: window.rollbackOwner,
    emergencyStopContacts: window.emergencyStopContacts.map((contact) =>
      contact.replace(/:\/\/[^/\s]*@/g, "://redacted@").replace(/([?&](?:key|sig|cred)=)[^&\s]+/gi, "$1redacted")
    ),
    checkCount: window.checks.length,
    passedChecks: window.checks.filter((check) => check.passed).length,
    readinessChecklist: window.readinessChecklist,
    provisioningEnabled: false,
  };

  return {
    id: manifest.exportId,
    provider: window.provider,
    windowId: window.id,
    status: "Prepared",
    requestedBy: actor,
    format: "JSON",
    checksumAlgorithm: "sha256",
    checksum: `mock-${window.provider.toLowerCase()}-${manifest.checkCount}-${manifest.passedChecks}`,
    manifest,
    redactionBoundary: "Lab window evidence exports contain references and metadata only; sensitive material is not persisted.",
    storageBoundary: "Export record is metadata only; configure external evidence storage before controlled lab operations.",
    provisioningEnabled: false,
    createdAt,
  };
}

function createMockLabEvidenceReviewRecord(
  exportRecord: LabWindowEvidenceExportRecord,
  actor: string
): LabEvidenceReviewRecord {
  const decisions: LabEvidenceReviewRecord["decisions"] = [
    {
      role: "Platform owner",
      reviewer: "Cloud Platform Owner",
      decision: "Pending",
      evidence: "Platform owner review evidence required.",
    },
    {
      role: "Security reviewer",
      reviewer: "Security Reviewer",
      decision: "Pending",
      evidence: "Security review evidence required.",
    },
    {
      role: "Operations reviewer",
      reviewer: "Cloud Operations",
      decision: "Pending",
      evidence: "Operations review evidence required.",
    },
  ];
  const checks = [
    {
      name: "Lab window evidence export linked",
      passed: true,
      detail: `${exportRecord.id} is linked.`,
    },
    {
      name: "Reviewer decisions complete",
      passed: false,
      detail: "0/3 decisions recorded.",
    },
    {
      name: "Reviewer evidence complete",
      passed: false,
      detail: "0/3 evidence references recorded.",
    },
    {
      name: "Execution remains disabled",
      passed: true,
      detail: "Lab evidence review does not enable provider execution.",
    },
  ];

  return {
    id: `lab-evidence-review-${exportRecord.provider.toLowerCase()}-${Date.now()}`,
    provider: exportRecord.provider,
    exportId: exportRecord.id,
    windowId: exportRecord.windowId,
    status: "Blocked",
    requestedBy: actor,
    decisions,
    checks,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockLabExecutionProposalEnvelope({
  review,
  exportRecord,
  window,
  runbook,
  labScope,
  auditExports,
  actor,
}: {
  review: LabEvidenceReviewRecord;
  exportRecord?: LabWindowEvidenceExportRecord;
  window?: ControlledLabDryRunWindowRecord;
  runbook?: ControlledLabReleaseRunbookRecord;
  labScope?: LabAuthorizationScope;
  auditExports: AuditExportRecord[];
  actor: string;
}): LabExecutionProposalEnvelope {
  const rollbackOwner = window?.rollbackOwner ?? exportRecord?.manifest.rollbackOwner ?? "";
  const emergencyStopContacts = window?.emergencyStopContacts ?? exportRecord?.manifest.emergencyStopContacts ?? [];
  const killSwitch = {
    name: `NDC_${review.provider}_REAL_ADAPTER_ENABLED`,
    enabled: false,
  };
  const checks = [
    {
      name: "Lab evidence review accepted",
      passed: review.status === "Accepted",
      detail: `${review.id} is ${review.status}.`,
    },
    {
      name: "Window evidence export linked",
      passed: Boolean(exportRecord),
      detail: exportRecord ? `${exportRecord.id} is linked.` : "Lab window evidence export is required.",
    },
    {
      name: "Controlled lab window linked",
      passed: Boolean(window),
      detail: window ? `${window.id} is ${window.status}.` : "Controlled lab dry-run window is required.",
    },
    {
      name: "Controlled release runbook linked",
      passed: Boolean(runbook),
      detail: runbook ? `${runbook.id} is ${runbook.status}.` : "Controlled lab release runbook is required.",
    },
    {
      name: "Approved lab scope linked",
      passed: labScope?.status === "Approved" && labScope.providerCoverage.includes(review.provider),
      detail: labScope ? `${labScope.id} is ${labScope.status}.` : "Approved lab authorization scope is required.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner || "Rollback owner is required.",
    },
    {
      name: "Audit export ready",
      passed: auditExports.length > 0,
      detail: auditExports.length > 0 ? "Audit export manifest exists." : "Audit export evidence is required.",
    },
    {
      name: "Emergency stop contacts assigned",
      passed: emergencyStopContacts.length >= 2,
      detail: `${emergencyStopContacts.length} emergency stop contact(s) assigned.`,
    },
    {
      name: "Real adapter execution disabled",
      passed: !killSwitch.enabled,
      detail: `${killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `lab-execution-proposal-${review.provider.toLowerCase()}-${Date.now()}`,
    provider: review.provider,
    reviewId: review.id,
    exportId: review.exportId,
    windowId: review.windowId,
    status: checks.every((check) => check.passed) ? "Ready for proposal review" : "Blocked",
    requestedBy: actor,
    checks,
    evidence: [
      `Review: ${review.id}.`,
      `Window export: ${exportRecord?.id ?? "missing"}.`,
      `Dry-run window: ${window?.id ?? "missing"}.`,
      `Runbook: ${runbook?.id ?? "missing"}.`,
      `Lab scope: ${labScope?.id ?? "missing"}.`,
      `Audit exports prepared: ${auditExports.length}.`,
    ],
    rollbackOwner,
    emergencyStopContacts,
    killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockLabExecutionProposalExportRecord(
  envelope: LabExecutionProposalEnvelope,
  actor: string
): LabExecutionProposalExportRecord {
  const createdAt = new Date().toISOString();
  const evidenceReferences = envelope.evidence.map((item) =>
    item
      .replace(/:\/\/[^/\s]*@/g, "://redacted@")
      .replace(/([?&](?:key|sig|cred)=)[^&\s]+/gi, "$1redacted")
  );
  const manifest: LabExecutionProposalExportRecord["manifest"] = {
    exportId: `lab-execution-proposal-export-${envelope.provider.toLowerCase()}-${Date.now()}`,
    envelopeId: envelope.id,
    provider: envelope.provider,
    envelopeStatus: envelope.status,
    generatedAt: createdAt,
    reviewId: envelope.reviewId,
    windowId: envelope.windowId,
    windowEvidenceExportId: envelope.exportId,
    checkCount: envelope.checks.length,
    passedChecks: envelope.checks.filter((check) => check.passed).length,
    evidenceReferences,
    rollbackOwner: envelope.rollbackOwner,
    emergencyStopContacts: envelope.emergencyStopContacts.map((contact) =>
      contact.replace(/:\/\/[^/\s]*@/g, "://redacted@").replace(/([?&](?:key|sig|cred)=)[^&\s]+/gi, "$1redacted")
    ),
    killSwitch: envelope.killSwitch,
    provisioningEnabled: false,
  };

  return {
    id: manifest.exportId,
    provider: envelope.provider,
    envelopeId: envelope.id,
    status: "Prepared",
    requestedBy: actor,
    format: "JSON",
    checksumAlgorithm: "sha256",
    checksum: `mock-${envelope.provider.toLowerCase()}-${manifest.checkCount}-${manifest.passedChecks}`,
    manifest,
    redactionBoundary: "Proposal exports contain references and metadata only; no inline auth material is persisted.",
    storageBoundary: "Export record is metadata only; configure external evidence storage before controlled lab execution proposals.",
    provisioningEnabled: false,
    createdAt,
  };
}

function createMockControlledLabExecutionApproval(
  proposalExport: LabExecutionProposalExportRecord,
  actor: string
): ControlledLabExecutionApprovalGate {
  const decisions: ControlledLabExecutionApprovalGate["decisions"] = [
    {
      role: "Platform owner",
      reviewer: "Cloud Platform Owner",
      decision: "Pending",
      evidence: "Platform owner execution approval evidence required.",
    },
    {
      role: "Security reviewer",
      reviewer: "Security Reviewer",
      decision: "Pending",
      evidence: "Security execution approval evidence required.",
    },
    {
      role: "Lab owner",
      reviewer: "Lab Owner",
      decision: "Pending",
      evidence: "Lab owner execution approval evidence required.",
    },
    {
      role: "Rollback owner",
      reviewer: proposalExport.manifest.rollbackOwner || "Rollback Owner",
      decision: "Pending",
      evidence: "Rollback owner standby evidence required.",
    },
    {
      role: "Executive sponsor",
      reviewer: "Executive Sponsor",
      decision: "Pending",
      evidence: "Executive sponsor approval evidence required.",
    },
  ];
  const acceptedDecisions = decisions.filter((decision) => decision.decision === "Accepted").length;
  const evidenceComplete = decisions.filter((decision) => !/required/i.test(decision.evidence)).length;
  const checks = [
    {
      name: "Proposal export linked",
      passed: true,
      detail: `${proposalExport.id} is linked.`,
    },
    {
      name: "Proposal envelope ready",
      passed: proposalExport.manifest.envelopeStatus === "Ready for proposal review",
      detail: `${proposalExport.manifest.envelopeId} is ${proposalExport.manifest.envelopeStatus}.`,
    },
    {
      name: "All approvers accepted",
      passed: acceptedDecisions === decisions.length,
      detail: `${acceptedDecisions}/${decisions.length} approvals accepted.`,
    },
    {
      name: "Approval evidence complete",
      passed: evidenceComplete === decisions.length,
      detail: `${evidenceComplete}/${decisions.length} evidence references recorded.`,
    },
    {
      name: "Emergency contacts exported",
      passed: proposalExport.manifest.emergencyStopContacts.length >= 2,
      detail: `${proposalExport.manifest.emergencyStopContacts.length} emergency stop contact(s) exported.`,
    },
    {
      name: "Real adapter execution disabled",
      passed: !proposalExport.manifest.killSwitch.enabled,
      detail: `${proposalExport.manifest.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-execution-approval-${proposalExport.provider.toLowerCase()}-${Date.now()}`,
    provider: proposalExport.provider,
    proposalExportId: proposalExport.id,
    envelopeId: proposalExport.envelopeId,
    status: checks.every((check) => check.passed) ? "Approved for controlled lab execution review" : "Blocked",
    requestedBy: actor,
    decisions,
    checks,
    evidence: [
      `Proposal export: ${proposalExport.id}.`,
      `Proposal envelope: ${proposalExport.envelopeId}.`,
      `Review: ${proposalExport.manifest.reviewId}.`,
      `Window: ${proposalExport.manifest.windowId}.`,
      `Rollback owner: ${proposalExport.manifest.rollbackOwner || "missing"}.`,
      `Kill switch: ${proposalExport.manifest.killSwitch.name}=${proposalExport.manifest.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: proposalExport.manifest.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockControlledLabExecutionRehearsalPacket({
  approvalGate,
  proposalExport,
  envelope,
  windows,
  runbooks,
  auditExports,
  actor,
}: {
  approvalGate: ControlledLabExecutionApprovalGate;
  proposalExport?: LabExecutionProposalExportRecord;
  envelope?: LabExecutionProposalEnvelope;
  windows: ControlledLabDryRunWindowRecord[];
  runbooks: ControlledLabReleaseRunbookRecord[];
  auditExports: AuditExportRecord[];
  actor: string;
}): ControlledLabExecutionRehearsalPacket {
  const window = envelope ? windows.find((item) => item.id === envelope.windowId) : undefined;
  const runbook = window?.linkedRunbookId ? runbooks.find((item) => item.id === window.linkedRunbookId) : undefined;
  const frozenReferences: ControlledLabExecutionRehearsalPacket["frozenReferences"] = {
    runbookId: runbook?.id ?? window?.linkedRunbookId,
    rollbackOwner: window?.rollbackOwner ?? proposalExport?.manifest.rollbackOwner ?? "",
    emergencyStopContacts: window?.emergencyStopContacts ?? proposalExport?.manifest.emergencyStopContacts ?? [],
    stopConditions: runbook?.stopConditions ?? [],
    proposalExportId: approvalGate.proposalExportId,
    auditExportIds: auditExports.map((item) => item.id),
    approvalEvidence: approvalGate.decisions.map((decision) => `${decision.role}: ${decision.evidence}`),
  };
  const checks = [
    {
      name: "Execution approval gate approved",
      passed: approvalGate.status === "Approved for controlled lab execution review",
      detail: `${approvalGate.id} is ${approvalGate.status}.`,
    },
    {
      name: "Proposal export frozen",
      passed: Boolean(proposalExport),
      detail: proposalExport ? `${proposalExport.id} is frozen.` : "Proposal export is required.",
    },
    {
      name: "Execution envelope frozen",
      passed: Boolean(envelope),
      detail: envelope ? `${envelope.id} is frozen.` : "Execution proposal envelope is required.",
    },
    {
      name: "Runbook frozen",
      passed: Boolean(frozenReferences.runbookId && runbook),
      detail: runbook ? `${runbook.id} stop conditions frozen.` : "Controlled lab release runbook is required.",
    },
    {
      name: "Rollback owner frozen",
      passed: Boolean(frozenReferences.rollbackOwner),
      detail: frozenReferences.rollbackOwner || "Rollback owner is required.",
    },
    {
      name: "Emergency contacts frozen",
      passed: frozenReferences.emergencyStopContacts.length >= 2,
      detail: `${frozenReferences.emergencyStopContacts.length} emergency stop contact(s) frozen.`,
    },
    {
      name: "Stop conditions frozen",
      passed: frozenReferences.stopConditions.length >= 3,
      detail: `${frozenReferences.stopConditions.length} stop condition(s) frozen.`,
    },
    {
      name: "Audit export frozen",
      passed: frozenReferences.auditExportIds.length > 0,
      detail:
        frozenReferences.auditExportIds.length > 0
          ? `${frozenReferences.auditExportIds.length} audit export(s) frozen.`
          : "Audit export evidence is required.",
    },
    {
      name: "Approval evidence frozen",
      passed:
        approvalGate.decisions.length >= 5 &&
        approvalGate.decisions.every((decision) => decision.decision === "Accepted" && !/required/i.test(decision.evidence)),
      detail: `${approvalGate.decisions.filter((decision) => decision.decision === "Accepted").length}/${approvalGate.decisions.length} accepted decisions frozen.`,
    },
    {
      name: "Real adapter execution disabled",
      passed: !approvalGate.killSwitch.enabled,
      detail: `${approvalGate.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-rehearsal-packet-${approvalGate.provider.toLowerCase()}-${Date.now()}`,
    provider: approvalGate.provider,
    approvalGateId: approvalGate.id,
    proposalExportId: approvalGate.proposalExportId,
    envelopeId: approvalGate.envelopeId,
    status: checks.every((check) => check.passed) ? "Ready for rehearsal review" : "Blocked",
    requestedBy: actor,
    frozenReferences,
    checks,
    evidence: [
      `Approval gate: ${approvalGate.id}.`,
      `Proposal export: ${approvalGate.proposalExportId}.`,
      `Proposal envelope: ${approvalGate.envelopeId}.`,
      `Runbook: ${frozenReferences.runbookId ?? "missing"}.`,
      `Audit exports: ${frozenReferences.auditExportIds.length}.`,
      `Kill switch: ${approvalGate.killSwitch.name}=${approvalGate.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: approvalGate.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockControlledLabDryRunExecutionChecklist(
  packet: ControlledLabExecutionRehearsalPacket,
  actor: string
): ControlledLabDryRunExecutionChecklist {
  const scheduledStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const scheduledEnd = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();
  const operatorRoster = ["Cloud Operator", "Security Observer", "Rollback Owner"];
  const logCaptureReferences = ["audit-log-capture-plan.md", "provider-response-capture.md"];
  const rollbackTimerMinutes = 30;
  const stopAuthority = packet.frozenReferences.rollbackOwner;
  const checks = [
    {
      name: "Rehearsal packet ready",
      passed: packet.status === "Ready for rehearsal review",
      detail: `${packet.id} is ${packet.status}.`,
    },
    {
      name: "Operator roster assigned",
      passed: operatorRoster.length >= 3,
      detail: `${operatorRoster.length} operator role(s) assigned.`,
    },
    {
      name: "Observation window scheduled",
      passed: Date.parse(scheduledEnd) > Date.parse(scheduledStart),
      detail: `${scheduledStart} to ${scheduledEnd}.`,
    },
    {
      name: "Log capture references recorded",
      passed: logCaptureReferences.length >= 2,
      detail: `${logCaptureReferences.length} log capture reference(s) recorded.`,
    },
    {
      name: "Rollback timer set",
      passed: rollbackTimerMinutes >= 15,
      detail: `${rollbackTimerMinutes} minute rollback timer.`,
    },
    {
      name: "Stop authority assigned",
      passed: Boolean(stopAuthority),
      detail: stopAuthority || "Stop authority is required.",
    },
    {
      name: "Real adapter execution disabled",
      passed: !packet.killSwitch.enabled,
      detail: `${packet.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-dry-run-checklist-${packet.provider.toLowerCase()}-${Date.now()}`,
    provider: packet.provider,
    rehearsalPacketId: packet.id,
    approvalGateId: packet.approvalGateId,
    status: checks.every((check) => check.passed) ? "Ready for dry-run review" : "Blocked",
    requestedBy: actor,
    operatorRoster,
    observationWindow: {
      scheduledStart,
      scheduledEnd,
    },
    logCaptureReferences,
    rollbackTimerMinutes,
    stopAuthority,
    checks,
    evidence: [
      `Rehearsal packet: ${packet.id}.`,
      `Approval gate: ${packet.approvalGateId}.`,
      `Operator roster: ${operatorRoster.join(", ")}.`,
      `Observation window: ${scheduledStart} to ${scheduledEnd}.`,
      `Rollback timer: ${rollbackTimerMinutes} minutes.`,
      `Stop authority: ${stopAuthority || "missing"}.`,
      `Kill switch: ${packet.killSwitch.name}=${packet.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: packet.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockControlledLabExecutionEvidenceLedger(
  checklist: ControlledLabDryRunExecutionChecklist,
  actor: string
): ControlledLabExecutionEvidenceLedger {
  const immutableReferences: ControlledLabExecutionEvidenceLedger["immutableReferences"] = {
    operatorEvidence: checklist.operatorRoster.map((operator) => `operator-${slugText(operator)}-ack.md`),
    observerEvidence: ["security-observer-notes.md"],
    rollbackEvidence: [`rollback-timer-${checklist.rollbackTimerMinutes}-minutes.md`],
    logEvidence: checklist.logCaptureReferences,
    auditEvidence: [`audit-boundary-${checklist.rehearsalPacketId}.md`],
    stopAuthorityEvidence: [`stop-authority-${slugText(checklist.stopAuthority)}.md`],
  };
  const checks = [
    {
      name: "Dry-run checklist ready",
      passed: checklist.status === "Ready for dry-run review",
      detail: `${checklist.id} is ${checklist.status}.`,
    },
    {
      name: "Operator evidence immutable",
      passed: immutableReferences.operatorEvidence.length >= checklist.operatorRoster.length,
      detail: `${immutableReferences.operatorEvidence.length}/${checklist.operatorRoster.length} operator evidence reference(s).`,
    },
    {
      name: "Observer evidence immutable",
      passed: immutableReferences.observerEvidence.length > 0,
      detail: `${immutableReferences.observerEvidence.length} observer evidence reference(s).`,
    },
    {
      name: "Rollback evidence immutable",
      passed: immutableReferences.rollbackEvidence.length > 0,
      detail: `${immutableReferences.rollbackEvidence.length} rollback evidence reference(s).`,
    },
    {
      name: "Log evidence immutable",
      passed: immutableReferences.logEvidence.length >= 2,
      detail: `${immutableReferences.logEvidence.length} log evidence reference(s).`,
    },
    {
      name: "Audit evidence immutable",
      passed: immutableReferences.auditEvidence.length > 0,
      detail: `${immutableReferences.auditEvidence.length} audit evidence reference(s).`,
    },
    {
      name: "Stop authority evidence immutable",
      passed: immutableReferences.stopAuthorityEvidence.length > 0 && Boolean(checklist.stopAuthority),
      detail: checklist.stopAuthority || "Stop authority is required.",
    },
    {
      name: "Real adapter execution disabled",
      passed: !checklist.killSwitch.enabled,
      detail: `${checklist.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-evidence-ledger-${checklist.provider.toLowerCase()}-${Date.now()}`,
    provider: checklist.provider,
    dryRunChecklistId: checklist.id,
    rehearsalPacketId: checklist.rehearsalPacketId,
    status: checks.every((check) => check.passed) ? "Ready for evidence review" : "Blocked",
    requestedBy: actor,
    immutableReferences,
    checks,
    evidence: [
      `Dry-run checklist: ${checklist.id}.`,
      `Rehearsal packet: ${checklist.rehearsalPacketId}.`,
      `Operator evidence: ${immutableReferences.operatorEvidence.length}.`,
      `Observer evidence: ${immutableReferences.observerEvidence.length}.`,
      `Rollback evidence: ${immutableReferences.rollbackEvidence.length}.`,
      `Log evidence: ${immutableReferences.logEvidence.length}.`,
      `Audit evidence: ${immutableReferences.auditEvidence.length}.`,
      `Stop authority evidence: ${immutableReferences.stopAuthorityEvidence.length}.`,
      `Kill switch: ${checklist.killSwitch.name}=${checklist.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: checklist.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockControlledLabExecutionReadinessAttestation(
  ledger: ControlledLabExecutionEvidenceLedger,
  actor: string
): ControlledLabExecutionReadinessAttestation {
  const attestations: ControlledLabExecutionReadinessAttestation["attestations"] = {
    platformOwner: `Platform owner reviewed ${ledger.id}.`,
    securityReviewer: `Security reviewer accepted immutable evidence for ${ledger.provider}.`,
    operationsReviewer: "Operations confirmed runbook, observation, and stop authority coverage.",
    rollbackOwner: "Rollback owner confirmed rollback evidence and timer.",
    executiveSponsor: "Executive sponsor acknowledged controlled lab execution readiness.",
  };
  const checks = [
    {
      name: "Evidence ledger ready",
      passed: ledger.status === "Ready for evidence review",
      detail: `${ledger.id} is ${ledger.status}.`,
    },
    {
      name: "Platform owner attested",
      passed: Boolean(attestations.platformOwner),
      detail: attestations.platformOwner,
    },
    {
      name: "Security reviewer attested",
      passed: Boolean(attestations.securityReviewer),
      detail: attestations.securityReviewer,
    },
    {
      name: "Operations reviewer attested",
      passed: Boolean(attestations.operationsReviewer),
      detail: attestations.operationsReviewer,
    },
    {
      name: "Rollback owner attested",
      passed: Boolean(attestations.rollbackOwner),
      detail: attestations.rollbackOwner,
    },
    {
      name: "Executive sponsor attested",
      passed: Boolean(attestations.executiveSponsor),
      detail: attestations.executiveSponsor,
    },
    {
      name: "Real adapter execution disabled",
      passed: !ledger.killSwitch.enabled,
      detail: `${ledger.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-readiness-attestation-${ledger.provider.toLowerCase()}-${Date.now()}`,
    provider: ledger.provider,
    evidenceLedgerId: ledger.id,
    dryRunChecklistId: ledger.dryRunChecklistId,
    status: checks.every((check) => check.passed) ? "Ready for execution review" : "Blocked",
    requestedBy: actor,
    attestations,
    checks,
    evidence: [
      `Evidence ledger: ${ledger.id}.`,
      `Dry-run checklist: ${ledger.dryRunChecklistId}.`,
      `Platform owner attestation: present.`,
      `Security reviewer attestation: present.`,
      `Operations reviewer attestation: present.`,
      `Rollback owner attestation: present.`,
      `Executive sponsor attestation: present.`,
      `Kill switch: ${ledger.killSwitch.name}=${ledger.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: ledger.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockExecutionBrokerQueueRecord(
  attestation: ControlledLabExecutionReadinessAttestation,
  actor: string,
  idempotencyKey: string,
  existingRecords: ExecutionBrokerQueueRecord[]
): ExecutionBrokerQueueRecord {
  const duplicateKey = existingRecords.some((record) => record.idempotencyKey === idempotencyKey);
  const approvalEvidenceLinks = [attestation.id, attestation.evidenceLedgerId, attestation.dryRunChecklistId];
  const checks = [
    {
      name: "Readiness attestation complete",
      passed: attestation.status === "Ready for execution review",
      detail: `${attestation.id} is ${attestation.status}.`,
    },
    {
      name: "Idempotency key unique",
      passed: !duplicateKey,
      detail: duplicateKey ? `${idempotencyKey} already exists.` : `${idempotencyKey} is available.`,
    },
    {
      name: "Approval evidence linked",
      passed: approvalEvidenceLinks.length >= 3,
      detail: `${approvalEvidenceLinks.length} approval evidence link(s).`,
    },
    {
      name: "Kill switch disabled",
      passed: !attestation.killSwitch.enabled,
      detail: `${attestation.killSwitch.name} remains disabled.`,
    },
    {
      name: "Queued for operator review only",
      passed: !attestation.provisioningEnabled,
      detail: "Broker queue does not execute provider adapters.",
    },
  ];

  return {
    id: `execution-broker-${attestation.provider.toLowerCase()}-${Date.now()}`,
    provider: attestation.provider,
    readinessAttestationId: attestation.id,
    evidenceLedgerId: attestation.evidenceLedgerId,
    idempotencyKey,
    operation: "Controlled Lab Adapter Execution",
    status: checks.every((check) => check.passed) ? "Queued for operator review" : "Blocked",
    requestedBy: actor,
    approvalEvidenceLinks,
    checks,
    evidence: [
      `Readiness attestation: ${attestation.id}.`,
      `Evidence ledger: ${attestation.evidenceLedgerId}.`,
      `Dry-run checklist: ${attestation.dryRunChecklistId}.`,
      `Idempotency key: ${idempotencyKey}.`,
      `Approval evidence links: ${approvalEvidenceLinks.length}.`,
      `Kill switch: ${attestation.killSwitch.name}=${attestation.killSwitch.enabled ? "enabled" : "disabled"}.`,
      "Execution mode: operator review only.",
    ],
    killSwitch: attestation.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockExecutionBrokerDispatchApproval(
  brokerRecord: ExecutionBrokerQueueRecord,
  actor: string
): ExecutionBrokerDispatchApproval {
  const operatorApprover = "cloud.operations.approver";
  const rollbackProofReference = `rollback-proof-${brokerRecord.provider.toLowerCase()}.md`;
  const pentestEvidenceReference = `pentest-scope-${brokerRecord.provider.toLowerCase()}.md`;
  const dispatchWindowReference = `dispatch-window-${brokerRecord.provider.toLowerCase()}.md`;
  const checks = [
    {
      name: "Broker record queued",
      passed: brokerRecord.status === "Queued for operator review",
      detail: `${brokerRecord.id} is ${brokerRecord.status}.`,
    },
    {
      name: "Operator approver assigned",
      passed: Boolean(operatorApprover),
      detail: operatorApprover,
    },
    {
      name: "Rollback proof linked",
      passed: Boolean(rollbackProofReference),
      detail: rollbackProofReference,
    },
    {
      name: "Pentest evidence linked",
      passed: Boolean(pentestEvidenceReference),
      detail: pentestEvidenceReference,
    },
    {
      name: "Dispatch window linked",
      passed: Boolean(dispatchWindowReference),
      detail: dispatchWindowReference,
    },
    {
      name: "Real adapter execution disabled",
      passed: !brokerRecord.provisioningEnabled && !brokerRecord.killSwitch.enabled,
      detail: `${brokerRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `execution-broker-dispatch-approval-${brokerRecord.provider.toLowerCase()}-${Date.now()}`,
    provider: brokerRecord.provider,
    brokerRecordId: brokerRecord.id,
    readinessAttestationId: brokerRecord.readinessAttestationId,
    idempotencyKey: brokerRecord.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for authorized lab dispatch review" : "Blocked",
    requestedBy: actor,
    operatorApprover,
    rollbackProofReference,
    pentestEvidenceReference,
    dispatchWindowReference,
    checks,
    evidence: [
      `Broker record: ${brokerRecord.id}.`,
      `Readiness attestation: ${brokerRecord.readinessAttestationId}.`,
      `Idempotency key: ${brokerRecord.idempotencyKey}.`,
      `Operator approver: ${operatorApprover}.`,
      `Rollback proof: ${rollbackProofReference}.`,
      `Pentest evidence: ${pentestEvidenceReference}.`,
      `Dispatch window: ${dispatchWindowReference}.`,
      `Kill switch: ${brokerRecord.killSwitch.name}=${brokerRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: brokerRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockRealAdapterLabScopeActivation(
  dispatchApproval: ExecutionBrokerDispatchApproval,
  actor: string
): RealAdapterLabScopeActivation {
  const authorizedScopeReference = `authorized-lab-scope-${dispatchApproval.provider.toLowerCase()}.md`;
  const pentestCompletionEvidence = `pentest-complete-${dispatchApproval.provider.toLowerCase()}.md`;
  const rollbackOwner = "Cloud Operations";
  const boundedProviderTargets = [
    `${dispatchApproval.provider.toLowerCase()}-lab-cluster-01`,
    `${dispatchApproval.provider.toLowerCase()}-lab-project-dev`,
  ];
  const manualOperatorControls = [
    "manual-change-window-approved",
    "two-person-operator-confirmation",
    "post-change-destroy-plan-ready",
  ];
  const checks = [
    {
      name: "Dispatch approval ready",
      passed: dispatchApproval.status === "Ready for authorized lab dispatch review",
      detail: `${dispatchApproval.id} is ${dispatchApproval.status}.`,
    },
    {
      name: "Authorized scope linked",
      passed: Boolean(authorizedScopeReference),
      detail: authorizedScopeReference,
    },
    {
      name: "Pentest completion linked",
      passed: Boolean(pentestCompletionEvidence),
      detail: pentestCompletionEvidence,
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner,
    },
    {
      name: "Bounded provider targets",
      passed: boundedProviderTargets.length > 0,
      detail: `${boundedProviderTargets.length} bounded provider target(s).`,
    },
    {
      name: "Manual operator controls complete",
      passed: manualOperatorControls.length >= 3,
      detail: `${manualOperatorControls.length}/3 manual operator control(s).`,
    },
    {
      name: "Real adapter switch remains disabled",
      passed: !dispatchApproval.provisioningEnabled && !dispatchApproval.killSwitch.enabled,
      detail: `${dispatchApproval.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `real-adapter-lab-scope-activation-${dispatchApproval.provider.toLowerCase()}-${Date.now()}`,
    provider: dispatchApproval.provider,
    dispatchApprovalId: dispatchApproval.id,
    brokerRecordId: dispatchApproval.brokerRecordId,
    idempotencyKey: dispatchApproval.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for manual real-adapter switch review" : "Blocked",
    requestedBy: actor,
    authorizedScopeReference,
    pentestCompletionEvidence,
    rollbackOwner,
    boundedProviderTargets,
    manualOperatorControls,
    checks,
    evidence: [
      `Dispatch approval: ${dispatchApproval.id}.`,
      `Broker record: ${dispatchApproval.brokerRecordId}.`,
      `Authorized scope: ${authorizedScopeReference}.`,
      `Pentest completion: ${pentestCompletionEvidence}.`,
      `Rollback owner: ${rollbackOwner}.`,
      `Bounded targets: ${boundedProviderTargets.length}.`,
      `Manual controls: ${manualOperatorControls.length}.`,
      `Kill switch: ${dispatchApproval.killSwitch.name}=${dispatchApproval.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: dispatchApproval.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockManualRealAdapterSwitchReview(
  activation: RealAdapterLabScopeActivation,
  actor: string
): ManualRealAdapterSwitchReview {
  const switchOperator = "cloud.switch.operator";
  const secondReviewer = "security.change.reviewer";
  const maintenanceWindowReference = `maintenance-window-${activation.provider.toLowerCase()}.md`;
  const switchStateAuditReferences = [
    `pre-switch-state-${activation.provider.toLowerCase()}.json`,
    `post-switch-state-${activation.provider.toLowerCase()}.json`,
  ];
  const rollbackContact = activation.rollbackOwner;
  const checks = [
    {
      name: "Lab scope activation ready",
      passed: activation.status === "Ready for manual real-adapter switch review",
      detail: `${activation.id} is ${activation.status}.`,
    },
    {
      name: "Switch operator assigned",
      passed: Boolean(switchOperator),
      detail: switchOperator,
    },
    {
      name: "Second reviewer assigned",
      passed: Boolean(secondReviewer),
      detail: secondReviewer,
    },
    {
      name: "Maintenance window linked",
      passed: Boolean(maintenanceWindowReference),
      detail: maintenanceWindowReference,
    },
    {
      name: "Switch-state audit references linked",
      passed: switchStateAuditReferences.length >= 2,
      detail: `${switchStateAuditReferences.length}/2 switch-state audit reference(s).`,
    },
    {
      name: "Rollback contact assigned",
      passed: Boolean(rollbackContact),
      detail: rollbackContact,
    },
    {
      name: "Prototype does not change switch state",
      passed: !activation.provisioningEnabled && !activation.killSwitch.enabled,
      detail: `${activation.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `manual-real-adapter-switch-review-${activation.provider.toLowerCase()}-${Date.now()}`,
    provider: activation.provider,
    activationId: activation.id,
    dispatchApprovalId: activation.dispatchApprovalId,
    idempotencyKey: activation.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for manual switch change review" : "Blocked",
    requestedBy: actor,
    switchOperator,
    secondReviewer,
    maintenanceWindowReference,
    switchStateAuditReferences,
    rollbackContact,
    checks,
    evidence: [
      `Activation: ${activation.id}.`,
      `Dispatch approval: ${activation.dispatchApprovalId}.`,
      `Switch operator: ${switchOperator}.`,
      `Second reviewer: ${secondReviewer}.`,
      `Maintenance window: ${maintenanceWindowReference}.`,
      `Switch-state audit references: ${switchStateAuditReferences.length}.`,
      `Rollback contact: ${rollbackContact}.`,
      `Kill switch: ${activation.killSwitch.name}=${activation.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: activation.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function slugText(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function blockedPlatformProviderOperations(provider: ProviderReleaseGateRecord["provider"]) {
  switch (provider) {
    case "NCI":
      return ["create_vm", "clone_vm", "power_on_vm", "power_off_vm", "delete_vm", "update_vm_category"];
    case "NKP":
      return ["create_namespace", "apply_quota", "apply_network_policy", "delete_namespace"];
    case "NDB":
      return ["create_database", "restore_database", "rotate_database_access", "delete_database"];
    case "NUS":
      return ["create_share", "create_bucket", "update_lifecycle_rule", "delete_storage_target"];
    case "NAI":
      return ["create_endpoint", "allocate_gpu", "publish_route", "delete_endpoint"];
  }
}

function blockedPlatformServiceOperations(kind: PlatformServiceKind) {
  switch (kind) {
    case "NKP Namespace":
      return ["create_namespace", "apply_quota", "apply_network_policy", "delete_namespace"];
    case "NDB PostgreSQL":
      return ["create_database", "restore_database", "delete_database", "rotate_database_access"];
    case "NUS Storage":
      return ["create_bucket", "create_share", "update_lifecycle_rule", "delete_storage_target"];
    case "NAI Endpoint":
      return ["create_endpoint", "allocate_gpu", "publish_route", "delete_endpoint"];
  }
}

function createMockProductionReadinessReview({
  session,
  platformConfig,
  labAuthorizationScopes,
  vmLifecycleProofs,
  ahvControlledProvisioningRuns,
  platformServicePreflightRuns,
  auditEventsCount,
}: {
  session: PlatformSession;
  platformConfig: PlatformConfig;
  labAuthorizationScopes: LabAuthorizationScope[];
  vmLifecycleProofs: VmLifecycleProof[];
  ahvControlledProvisioningRuns: AhvControlledProvisioningRun[];
  platformServicePreflightRuns: PlatformServicePreflightRun[];
  auditEventsCount: number;
}): ProductionReadinessReview {
  const providers = ["NKP", "NDB", "NUS", "NAI"];
  const preflightCoverage = providers.every((provider) =>
    platformServicePreflightRuns.some((run) => run.provider === provider)
  );
  const checks = [
    {
      name: "OIDC boundary",
      passed: session.authMode === "OIDC",
      detail:
        session.authMode === "OIDC"
          ? `Identity provider ${session.identityProvider} is active.`
          : "Current session uses mock OIDC headers; production ingress validation is still required.",
    },
    {
      name: "Durable state boundary",
      passed: false,
      detail: "Browser mode has no server-side JSON data file.",
    },
    {
      name: "Audit retention configured",
      passed: true,
      detail: "Audit retention keeps 500 events.",
    },
    {
      name: "Lab authorization active",
      passed: labAuthorizationScopes.some((scope) => scope.status === "Approved" && scope.pentestScopeStructurallyValid),
      detail: "Approved lab authorization is required.",
    },
    {
      name: "VM lifecycle proof verified",
      passed: vmLifecycleProofs.some((proof) => proof.status === "Verified"),
      detail: "Verified lifecycle proof is required.",
    },
    {
      name: "AHV preflight recorded",
      passed: ahvControlledProvisioningRuns.length > 0,
      detail: ahvControlledProvisioningRuns[0]?.status ?? "AHV preflight run is required.",
    },
    {
      name: "Platform service preflight coverage",
      passed: preflightCoverage,
      detail: preflightCoverage ? "NKP, NDB, NUS, and NAI preflight records exist." : "NKP, NDB, NUS, and NAI preflight records are required.",
    },
    {
      name: "Provisioning guardrail",
      passed: platformConfig.provisioningEnabled === false,
      detail: "Global platform config keeps provisioning disabled.",
    },
  ];

  return {
    id: `production-readiness-${Date.now()}`,
    status: checks.every((check) => check.passed) ? "Ready for review" : "Blocked",
    reviewer: session.user,
    checks,
    evidence: [
      `Audit events available: ${auditEventsCount}.`,
      `AHV preflight runs recorded: ${ahvControlledProvisioningRuns.length}.`,
      `Platform-service preflight runs recorded: ${platformServicePreflightRuns.length}.`,
      "Real provisioning remains disabled until a separate authorized adapter release.",
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockAdapterEnablementRecord({
  provider,
  rollbackOwner,
  actor,
  integrationConfigs,
  credentialDiagnostics,
  labAuthorizationScopes,
  provisioningAdapters,
  auditExports,
}: {
  provider: AdapterEnablementRecord["provider"];
  rollbackOwner: string;
  actor: string;
  integrationConfigs: IntegrationConfig[];
  credentialDiagnostics: CredentialReferenceDiagnostic[];
  labAuthorizationScopes: LabAuthorizationScope[];
  provisioningAdapters: ProvisioningAdapterReadiness[];
  auditExports: AuditExportRecord[];
}): AdapterEnablementRecord {
  const adapter = provisioningAdapters.find((item) => item.name === provider);
  const config = integrationConfigs.find((item) => item.name === provider);
  const credentialDiagnostic = credentialDiagnostics.find((item) => item.provider === provider);
  const activeScope = labAuthorizationScopes.find(
    (scope) =>
      scope.providerCoverage.includes(provider) &&
      createMockLabScopeChecks(scope).every((check) => check.passed)
  );
  const checks = [
    {
      name: "Approved lab scope",
      passed: Boolean(activeScope),
      detail: activeScope
        ? `${activeScope.project} / ${activeScope.cluster} / ${activeScope.network}`
        : "Approved, unexpired lab scope with pentest, endpoint, provider coverage, evidence, and rollback owner is required.",
    },
    {
      name: "Credential reference approved",
      passed: credentialDiagnostic?.status === "Approved reference",
      detail:
        credentialDiagnostic?.status === "Approved reference"
          ? `${provider} stores credential profile reference ${credentialDiagnostic.credentialProfile}.`
          : `${provider} credential profile reference is ${credentialDiagnostic?.status ?? "Missing"}.`,
    },
    {
      name: "Provider readiness reachable",
      passed: config?.status === "Reachable",
      detail: config?.status === "Reachable" ? `${provider} integration is reachable.` : `${provider} integration is not reachable.`,
    },
    {
      name: "Adapter readiness configured",
      passed: adapter?.configured === true,
      detail: adapter?.configured ? `${provider} adapter planning record is configured.` : `${provider} adapter readiness is incomplete.`,
    },
    {
      name: "Audit export ready",
      passed: auditExports.length > 0,
      detail: auditExports.length > 0 ? "Audit export manifest exists." : "Prepare audit export evidence before adapter enablement review.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner ? `${rollbackOwner} owns rollback and disablement.` : "Rollback owner is required.",
    },
    {
      name: "Real adapter disabled",
      passed: true,
      detail: `${provider} real adapter switch remains disabled.`,
    },
  ];

  return {
    id: `adapter-enable-${provider.toLowerCase()}-${Date.now()}`,
    provider,
    product: adapter?.product ?? provider,
    status: checks.every((check) => check.passed) ? "Ready for review" : "Blocked",
    reviewer: actor,
    rollbackOwner,
    checks,
    evidence: [
      `Lab scope: ${activeScope?.id ?? "missing"}.`,
      `Lab scope version: ${activeScope?.version ?? "missing"}.`,
      `Credential diagnostic: ${credentialDiagnostic?.status ?? "missing"}.`,
      `Provider readiness: ${config?.status ?? "missing"}.`,
      `Audit exports prepared: ${auditExports.length}.`,
      "Real adapter mutation remains disabled pending separate authorization and pentest scope.",
    ],
    mutationOperationsBlocked: blockedAdapterEnablementOperations(provider),
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function blockedAdapterEnablementOperations(provider: AdapterEnablementRecord["provider"]) {
  switch (provider) {
    case "NCI":
      return ["create_vm", "clone_vm", "power_on_vm", "power_off_vm", "delete_vm", "update_vm_category"];
    case "NKP":
      return ["create_namespace", "apply_quota", "apply_network_policy", "delete_namespace"];
    case "NDB":
      return ["create_database", "restore_database", "rotate_database_access", "delete_database"];
    case "NUS":
      return ["create_share", "create_bucket", "update_lifecycle_rule", "delete_storage_target"];
    case "NCM":
      return ["launch_blueprint", "update_policy", "attach_runbook", "delete_blueprint_instance"];
    case "NAI":
      return ["create_endpoint", "allocate_gpu", "publish_route", "delete_endpoint"];
  }
}

function nextRegistryStatus(action: "submit" | "approve" | "deprecate" | "restore"): RegistryStatus {
  switch (action) {
    case "submit":
      return "Pending approval";
    case "approve":
      return "Published";
    case "deprecate":
      return "Deprecated";
    case "restore":
      return "Draft";
  }
}

function transitionTemplateRegistryEntry(
  entry: TemplateRegistryEntry,
  action: "submit" | "approve" | "deprecate" | "restore",
  actor: string
): TemplateRegistryEntry {
  const status = nextRegistryStatus(action);
  return {
    ...entry,
    status,
    lastChangedAt: new Date().toISOString().slice(0, 10),
    approvalEvidence: registryActionEvidence(action, actor),
  };
}

function transitionResourceProfile(
  profile: ResourceProfile,
  action: "submit" | "approve" | "deprecate" | "restore",
  actor: string
): ResourceProfile {
  const status = nextRegistryStatus(action);
  return {
    ...profile,
    status,
    approvedBy: status === "Published" ? actor : profile.approvedBy,
    approvedAt: status === "Published" ? new Date().toISOString() : profile.approvedAt,
  };
}

function registryActionEvidence(action: "submit" | "approve" | "deprecate" | "restore", actor: string) {
  switch (action) {
    case "submit":
      return `Submitted for owner approval by ${actor}.`;
    case "approve":
      return `Published by ${actor} after simulated owner approval.`;
    case "deprecate":
      return `Deprecated by ${actor}; blocked for future real provisioning selection.`;
    case "restore":
      return `Restored to draft by ${actor} for revision.`;
  }
}

function replaceIntegrationConfig(configs: IntegrationConfig[], updated: IntegrationConfig) {
  return [updated, ...configs.filter((item) => item.name !== updated.name)].sort((a, b) => a.name.localeCompare(b.name));
}

function replaceLabAdapter(adapters: LabAdapterSnapshot[], updated: LabAdapterSnapshot) {
  return [updated, ...adapters.filter((item) => item.name !== updated.name)].sort((a, b) => a.name.localeCompare(b.name));
}

function createMockSystemStatus(
  session: PlatformSession,
  configs: IntegrationConfig[],
  adapters: LabAdapterSnapshot[]
): SystemStatus {
  return {
    api: "Healthy",
    storage: "Ready",
    session,
    integrations: {
      total: configs.length,
      configured: configs.filter((item) => item.status === "Configured").length,
      reachable: configs.filter((item) => item.status === "Reachable").length,
      readOnlyCandidates: adapters.filter((item) => item.mode === "Read-only candidate").length,
    },
    provisioningEnabled: false,
  };
}

function createMockLifecycleOperationRecord({
  environmentName,
  operation,
  actor,
  readiness,
  gates,
  proofs,
}: {
  environmentName: string;
  operation: LifecycleOperationKind;
  actor: string;
  readiness?: ProductionReadinessReview;
  gates: ControlledProvisioningGate[];
  proofs: VmLifecycleProof[];
}): LifecycleOperationRecord {
  const gateApproved = gates.some((gate) => gate.environmentName === environmentName && gate.approval.status === "Approved");
  const proofVerified = proofs.some((proof) => proof.environmentName === environmentName && proof.status === "Verified");
  const checks = [
    {
      name: "Environment exists",
      passed: true,
      detail: `${environmentName} is tracked in browser mock inventory.`,
    },
    {
      name: "Production readiness reviewed",
      passed: readiness?.status === "Ready for review",
      detail: readiness ? `Latest readiness status is ${readiness.status}.` : "Run a production readiness review first.",
    },
    {
      name: "Controlled gate approved",
      passed: gateApproved,
      detail: gateApproved ? "Controlled gate approval is present." : "Controlled gate approval is missing.",
    },
    {
      name: "Lifecycle proof verified",
      passed: proofVerified,
      detail: proofVerified ? "Lifecycle proof is verified." : "Lifecycle proof is not verified.",
    },
  ];

  return {
    id: `mock-lifecycle-${environmentName}-${operation.toLowerCase()}-${Date.now()}`,
    environmentName,
    operation,
    status: checks.every((check) => check.passed) ? "Queued for operator review" : "Blocked",
    requestedBy: actor,
    checks,
    runbook: [
      `Confirm owner approval for ${operation.toLowerCase()} on ${environmentName}.`,
      "Validate backup, rollback, and audit evidence before any real provider action.",
      "Keep real mutation disabled until an authorized adapter release is approved.",
    ],
    auditEvidence: [
      "Browser mock lifecycle request recorded.",
      "Real provider mutation remains disabled.",
    ],
    approvalRequired: true,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockAuditExportRecord(actor: string, existingExports: number): AuditExportRecord {
  const createdAt = new Date().toISOString();
  const exportId = `mock-audit-export-${Date.now()}`;
  return {
    id: exportId,
    status: "Prepared",
    requestedBy: actor,
    format: "JSONL",
    eventCount: existingExports,
    retentionEvents: 500,
    checksumAlgorithm: "sha256",
    checksum: `mock${String(existingExports).padStart(60, "0")}`,
    manifest: {
      exportId,
      eventCount: existingExports,
      retentionWindowEvents: 500,
      generatedAt: createdAt,
      destinationRef: "browser-mock",
    },
    redactionBoundary: "Sensitive credential material is excluded from audit events.",
    storageBoundary: "Browser mock export is metadata only; configure object storage for production exports.",
    createdAt,
  };
}

function createMockAuditRetentionDiagnostics(): AuditRetentionDiagnostics {
  return {
    retentionEvents: 500,
    currentEvents: 0,
    bounded: true,
    exportDestination: {
      configured: false,
      valid: true,
      destinationRef: "browser-mock",
      message: "Browser mock export is metadata only; configure object storage for production exports.",
    },
  };
}

function createMockControlPlaneJob(
  environment: Environment,
  template: Template,
  targets: Target[]
): ControlPlaneJob {
  const now = new Date().toISOString();
  const approvalRequired = environment.status === "Needs approval";
  return {
    id: `cp-${environment.name}`,
    environmentName: environment.name,
    template: template.name,
    owner: environment.owner,
    targets,
    operation: "Provision",
    state: approvalRequired ? "AwaitingApproval" : "Queued",
    attempts: 0,
    maxAttempts: 3,
    worker: "MockOrchestrator",
    provisioningEnabled: false,
    queuedAt: now,
    updatedAt: now,
    transitions: [
      {
        state: approvalRequired ? "AwaitingApproval" : "Queued",
        actor: "browser.mock",
        message: approvalRequired ? "Job paused for approval." : "Job queued for mock validation.",
        createdAt: now,
      },
    ],
  };
}

function createMockDestroyControlPlaneJob(environment: Environment): ControlPlaneJob {
  const now = new Date().toISOString();
  return {
    id: `cp-destroy-${environment.name}`,
    environmentName: environment.name,
    template: environment.template,
    owner: environment.owner,
    targets: ["VM", "Storage"],
    operation: "Destroy",
    state: "Destroying",
    attempts: 0,
    maxAttempts: 3,
    worker: "MockOrchestrator",
    provisioningEnabled: false,
    queuedAt: now,
    updatedAt: now,
    transitions: [
      {
        state: "Destroying",
        actor: "browser.mock",
        message: "Destroy job queued. Teardown is simulated and real infrastructure mutation is disabled.",
        createdAt: now,
      },
    ],
  };
}

function transitionMockControlPlaneJob(
  job: ControlPlaneJob,
  action: "advance" | "retry" | "fail"
): ControlPlaneJob {
  const now = new Date().toISOString();
  const nextState =
    action === "retry"
      ? "Queued"
      : action === "fail"
        ? "Failed"
        : job.state === "Queued"
          ? "Validating"
          : job.state === "Validating"
            ? "Provisioning"
            : job.state === "Provisioning"
              ? "Ready"
              : job.state === "Destroying"
                ? "Destroyed"
              : job.state;
  const message =
    action === "retry"
      ? "Retry requested. Job returned to queue."
      : action === "fail"
        ? "Manual failure simulation from admin console."
        : "Mock worker advanced the job state.";

  return {
    ...job,
    state: nextState,
    attempts: nextState === "Provisioning" ? job.attempts + 1 : job.attempts,
    updatedAt: now,
    lastError: action === "fail" ? message : undefined,
    transitions: [
      {
        state: nextState,
        actor: "browser.mock",
        message,
        createdAt: now,
      },
      ...job.transitions,
    ],
  };
}

function deriveMockApprovals(environments: Environment[]): ApprovalRequest[] {
  return environments
    .filter((environment) => environment.status === "Needs approval")
    .map((environment) => ({
      id: `approval-${environment.name}`,
      environmentName: environment.name,
      template: environment.template,
      owner: environment.owner,
      reason: environment.template.includes("AI")
        ? "AI endpoint requests require platform approval."
        : "Regulated templates require platform approval.",
      status: "Pending",
      requestedAt: environment.createdAt,
    }));
}

function createMockEnvironmentDetail(
  environments: Environment[],
  approvals: ApprovalRequest[],
  environmentName: string
): EnvironmentDetail | null {
  const environment = environments.find((item) => item.name === environmentName) ?? environments[0];
  if (!environment) {
    return null;
  }

  return {
    environment,
    jobs: provisioningEvents.map((event, index) => ({
      id: `${environment.name}-job-${index}`,
      environmentName: environment.name,
      state: index < 3 ? "completed" : environment.status.toLowerCase(),
      message: event.detail,
      createdAt: new Date(Date.now() - (provisioningEvents.length - index) * 60000).toISOString(),
    })),
    approvals: approvals.filter((approval) => approval.environmentName === environment.name),
    auditEvents: [
      {
        id: `${environment.name}-audit-requested`,
        action: "environment.requested",
        actor: environment.owner,
        target: environment.name,
        createdAt: environment.createdAt,
      },
      {
        id: `${environment.name}-audit-status`,
        action: "environment.status.updated",
        actor: "mock.platform",
        target: environment.name,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function jobHeadline(jobState: JobState) {
  switch (jobState) {
    case "Queued":
      return "Provisioning job queued";
    case "Running":
      return "Provisioning workflow running";
    case "Approval":
      return "Approval required before activation";
    case "Complete":
      return "Environment ready";
    case "Failed":
      return "Provisioning needs attention";
    case "Idle":
      return "Create an environment to see status";
  }
}

function timelineClass(index: number, jobStep: number, jobState: JobState) {
  if (jobState === "Approval" && index >= jobStep) {
    return "approvalStep";
  }
  if (index < jobStep || jobState === "Complete") {
    return "completeStep";
  }
  if (index === jobStep) {
    return "activeStep";
  }
  return "";
}

function timelineLabel(index: number, jobStep: number, jobState: JobState) {
  if (jobState === "Approval" && index >= jobStep) {
    return "Approval";
  }
  if (index < jobStep || jobState === "Complete") {
    return "Complete";
  }
  if (index === jobStep) {
    return jobState === "Queued" ? "Queued" : "Running";
  }
  return "Waiting";
}
