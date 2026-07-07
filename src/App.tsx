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
  type AdapterPromotionReadinessDossier,
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
  type ControlledSwitchConfigurationRequest,
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
  type ProductionAdapterAuthorizationPacket,
  type ProductionChangeFreezeRecord,
  type ProductionCabHandoffPacket,
  type ProductionCabDecisionRecord,
  type ProductionImplementationHoldRecord,
  type ProductionOperatorAssignmentRecord,
  type ProductionExecutionReadinessRecord,
  type ProductionExecutionAuthorizationRecord,
  type ProductionChangeTicketLockRecord,
  type ProductionFinalExecutionPacketRecord,
  type ProductionExecutionHoldPointRecord,
  type ProductionExecutionOutcomeAuthorizationRecord,
  type ProductionExecutionClosureAuthorizationRecord,
  type ProductionExecutionClosurePacketRecord,
  type ProductionExecutionArchivalHandoffRecord,
  type ProductionExecutionRetentionAttestationRecord,
  type ProductionExecutionFinalArchiveCertificationRecord,
  type ProductionExecutionCompletionDossierRecord,
  type ProductionExecutionOperationsHandoverRecord,
  type ProductionExecutionSupportReadinessRecord,
  type ProductionExecutionServiceAcceptanceRecord,
  type ProductionExecutionFinalTurnoverRecord,
  type ProductionExecutionOperationalClosureRecord,
  type ProductionExecutionPostImplementationReviewRecord,
  type ProductionExecutionImprovementClosureRecord,
  type ProductionExecutionFinalAcceptanceArchiveRecord,
  type ProductionExecutionReadinessArchiveHandoffRecord,
  type ProductionExecutionArchiveRetrievalValidationRecord,
  type ProductionExecutionArchiveRecoveryDrillRecord,
  type ProductionExecutionArchiveRecoveryAcceptanceRecord,
  type ProductionExecutionArchiveRecoveryClosureRecord,
  type ProductionReadinessReview,
  type ProviderReleaseGateRecord,
  type ProviderReleaseReadinessSummary,
  type RealAdapterLabScopeActivation,
  type RealAdapterSwitchStateAuditPackage,
  type ReleaseEvidenceExportRecord,
  type RegistryStatus,
  resourceProfiles as defaultResourceProfiles,
  type ResourceProfile,
  type RollbackDestroyProofRecord,
  type SessionDiagnostics,
  type SystemStatus,
  type SwitchClosureRetentionPackage,
  type SwitchExecutionHandoffPackage,
  type SwitchExecutionOutcomeRecord,
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
  createAdapterPromotionReadinessDossierViaApi,
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
  createControlledSwitchConfigurationRequestViaApi,
  createSwitchExecutionHandoffPackageViaApi,
  createSwitchExecutionOutcomeRecordViaApi,
  createSwitchClosureRetentionPackageViaApi,
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
  createRealAdapterSwitchStateAuditPackageViaApi,
  createReleaseEvidenceExportViaApi,
  createRollbackDestroyProofViaApi,
  createVmLifecycleProofViaApi,
  createVmSandboxDryRunViaApi,
  decideControlledProvisioningGateViaApi,
  decideApprovalViaApi,
  fetchAhvControlledProvisioningRunsFromApi,
  fetchAhvCreateAdapterContractReviewsFromApi,
  fetchAdapterPromotionReadinessDossiersFromApi,
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
  fetchControlledSwitchConfigurationRequestsFromApi,
  fetchSwitchExecutionHandoffPackagesFromApi,
  fetchSwitchExecutionOutcomeRecordsFromApi,
  fetchSwitchClosureRetentionPackagesFromApi,
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
  fetchRealAdapterSwitchStateAuditPackagesFromApi,
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
  const [realAdapterSwitchStateAuditPackages, setRealAdapterSwitchStateAuditPackages] = useState<RealAdapterSwitchStateAuditPackage[]>([]);
  const [controlledSwitchConfigurationRequests, setControlledSwitchConfigurationRequests] = useState<ControlledSwitchConfigurationRequest[]>([]);
  const [switchExecutionHandoffPackages, setSwitchExecutionHandoffPackages] = useState<SwitchExecutionHandoffPackage[]>([]);
  const [switchExecutionOutcomeRecords, setSwitchExecutionOutcomeRecords] = useState<SwitchExecutionOutcomeRecord[]>([]);
  const [switchClosureRetentionPackages, setSwitchClosureRetentionPackages] = useState<SwitchClosureRetentionPackage[]>([]);
  const [adapterPromotionReadinessDossiers, setAdapterPromotionReadinessDossiers] = useState<AdapterPromotionReadinessDossier[]>([]);
  const [productionAdapterAuthorizationPackets, setProductionAdapterAuthorizationPackets] = useState<ProductionAdapterAuthorizationPacket[]>([]);
  const [productionChangeFreezeRecords, setProductionChangeFreezeRecords] = useState<ProductionChangeFreezeRecord[]>([]);
  const [productionCabHandoffPackets, setProductionCabHandoffPackets] = useState<ProductionCabHandoffPacket[]>([]);
  const [productionCabDecisionRecords, setProductionCabDecisionRecords] = useState<ProductionCabDecisionRecord[]>([]);
  const [productionImplementationHoldRecords, setProductionImplementationHoldRecords] = useState<ProductionImplementationHoldRecord[]>([]);
  const [productionOperatorAssignmentRecords, setProductionOperatorAssignmentRecords] = useState<ProductionOperatorAssignmentRecord[]>([]);
  const [productionExecutionReadinessRecords, setProductionExecutionReadinessRecords] = useState<ProductionExecutionReadinessRecord[]>([]);
  const [productionExecutionAuthorizationRecords, setProductionExecutionAuthorizationRecords] = useState<ProductionExecutionAuthorizationRecord[]>([]);
  const [productionChangeTicketLockRecords, setProductionChangeTicketLockRecords] = useState<ProductionChangeTicketLockRecord[]>([]);
  const [productionFinalExecutionPacketRecords, setProductionFinalExecutionPacketRecords] = useState<ProductionFinalExecutionPacketRecord[]>([]);
  const [productionExecutionHoldPointRecords, setProductionExecutionHoldPointRecords] = useState<ProductionExecutionHoldPointRecord[]>([]);
  const [productionExecutionOutcomeAuthorizationRecords, setProductionExecutionOutcomeAuthorizationRecords] = useState<
    ProductionExecutionOutcomeAuthorizationRecord[]
  >([]);
  const [productionExecutionClosureAuthorizationRecords, setProductionExecutionClosureAuthorizationRecords] = useState<
    ProductionExecutionClosureAuthorizationRecord[]
  >([]);
  const [productionExecutionClosurePacketRecords, setProductionExecutionClosurePacketRecords] = useState<
    ProductionExecutionClosurePacketRecord[]
  >([]);
  const [productionExecutionArchivalHandoffRecords, setProductionExecutionArchivalHandoffRecords] = useState<
    ProductionExecutionArchivalHandoffRecord[]
  >([]);
  const [productionExecutionRetentionAttestationRecords, setProductionExecutionRetentionAttestationRecords] = useState<
    ProductionExecutionRetentionAttestationRecord[]
  >([]);
  const [
    productionExecutionFinalArchiveCertificationRecords,
    setProductionExecutionFinalArchiveCertificationRecords,
  ] = useState<ProductionExecutionFinalArchiveCertificationRecord[]>([]);
  const [productionExecutionCompletionDossierRecords, setProductionExecutionCompletionDossierRecords] = useState<
    ProductionExecutionCompletionDossierRecord[]
  >([]);
  const [productionExecutionOperationsHandoverRecords, setProductionExecutionOperationsHandoverRecords] = useState<
    ProductionExecutionOperationsHandoverRecord[]
  >([]);
  const [productionExecutionSupportReadinessRecords, setProductionExecutionSupportReadinessRecords] = useState<
    ProductionExecutionSupportReadinessRecord[]
  >([]);
  const [productionExecutionServiceAcceptanceRecords, setProductionExecutionServiceAcceptanceRecords] = useState<
    ProductionExecutionServiceAcceptanceRecord[]
  >([]);
  const [productionExecutionFinalTurnoverRecords, setProductionExecutionFinalTurnoverRecords] = useState<
    ProductionExecutionFinalTurnoverRecord[]
  >([]);
  const [productionExecutionOperationalClosureRecords, setProductionExecutionOperationalClosureRecords] = useState<
    ProductionExecutionOperationalClosureRecord[]
  >([]);
  const [
    productionExecutionPostImplementationReviewRecords,
    setProductionExecutionPostImplementationReviewRecords,
  ] = useState<ProductionExecutionPostImplementationReviewRecord[]>([]);
  const [productionExecutionImprovementClosureRecords, setProductionExecutionImprovementClosureRecords] = useState<
    ProductionExecutionImprovementClosureRecord[]
  >([]);
  const [
    productionExecutionFinalAcceptanceArchiveRecords,
    setProductionExecutionFinalAcceptanceArchiveRecords,
  ] = useState<ProductionExecutionFinalAcceptanceArchiveRecord[]>([]);
  const [
    productionExecutionReadinessArchiveHandoffRecords,
    setProductionExecutionReadinessArchiveHandoffRecords,
  ] = useState<ProductionExecutionReadinessArchiveHandoffRecord[]>([]);
  const [
    productionExecutionArchiveRetrievalValidationRecords,
    setProductionExecutionArchiveRetrievalValidationRecords,
  ] = useState<ProductionExecutionArchiveRetrievalValidationRecord[]>([]);
  const [
    productionExecutionArchiveRecoveryDrillRecords,
    setProductionExecutionArchiveRecoveryDrillRecords,
  ] = useState<ProductionExecutionArchiveRecoveryDrillRecord[]>([]);
  const [
    productionExecutionArchiveRecoveryAcceptanceRecords,
    setProductionExecutionArchiveRecoveryAcceptanceRecords,
  ] = useState<ProductionExecutionArchiveRecoveryAcceptanceRecord[]>([]);
  const [
    productionExecutionArchiveRecoveryClosureRecords,
    setProductionExecutionArchiveRecoveryClosureRecords,
  ] = useState<ProductionExecutionArchiveRecoveryClosureRecord[]>([]);
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
            apiRealAdapterSwitchStateAuditPackages,
            apiControlledSwitchConfigurationRequests,
            apiSwitchExecutionHandoffPackages,
            apiSwitchExecutionOutcomeRecords,
            apiSwitchClosureRetentionPackages,
            apiAdapterPromotionReadinessDossiers,
            apiProductionAdapterAuthorizationPackets,
            apiProductionChangeFreezeRecords,
            apiProductionCabHandoffPackets,
            apiProductionCabDecisionRecords,
            apiProductionImplementationHoldRecords,
            apiProductionOperatorAssignmentRecords,
            apiProductionExecutionReadinessRecords,
            apiProductionExecutionAuthorizationRecords,
            apiProductionChangeTicketLockRecords,
            apiProductionFinalExecutionPacketRecords,
            apiProductionExecutionHoldPointRecords,
            apiProductionExecutionOutcomeAuthorizationRecords,
            apiProductionExecutionClosureAuthorizationRecords,
            apiProductionExecutionClosurePacketRecords,
            apiProductionExecutionArchivalHandoffRecords,
            apiProductionExecutionRetentionAttestationRecords,
            apiProductionExecutionFinalArchiveCertificationRecords,
            apiProductionExecutionCompletionDossierRecords,
            apiProductionExecutionOperationsHandoverRecords,
            apiProductionExecutionSupportReadinessRecords,
            apiProductionExecutionServiceAcceptanceRecords,
            apiProductionExecutionFinalTurnoverRecords,
            apiProductionExecutionOperationalClosureRecords,
            apiProductionExecutionPostImplementationReviewRecords,
            apiProductionExecutionImprovementClosureRecords,
            apiProductionExecutionFinalAcceptanceArchiveRecords,
            apiProductionExecutionReadinessArchiveHandoffRecords,
            apiProductionExecutionArchiveRetrievalValidationRecords,
            apiProductionExecutionArchiveRecoveryDrillRecords,
            apiProductionExecutionArchiveRecoveryAcceptanceRecords,
            apiProductionExecutionArchiveRecoveryClosureRecords,
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
            fetchRealAdapterSwitchStateAuditPackagesFromApi(),
            fetchControlledSwitchConfigurationRequestsFromApi(),
            fetchSwitchExecutionHandoffPackagesFromApi(),
            fetchSwitchExecutionOutcomeRecordsFromApi(),
            fetchSwitchClosureRetentionPackagesFromApi(),
            fetchAdapterPromotionReadinessDossiersFromApi(),
            fetchProductionAdapterAuthorizationPacketsFromApi(),
            fetchProductionChangeFreezeRecordsFromApi(),
            fetchProductionCabHandoffPacketsFromApi(),
            fetchProductionCabDecisionRecordsFromApi(),
            fetchProductionImplementationHoldRecordsFromApi(),
            fetchProductionOperatorAssignmentRecordsFromApi(),
            fetchProductionExecutionReadinessRecordsFromApi(),
            fetchProductionExecutionAuthorizationRecordsFromApi(),
            fetchProductionChangeTicketLockRecordsFromApi(),
            fetchProductionFinalExecutionPacketRecordsFromApi(),
            fetchProductionExecutionHoldPointRecordsFromApi(),
            fetchProductionExecutionOutcomeAuthorizationRecordsFromApi(),
            fetchProductionExecutionClosureAuthorizationRecordsFromApi(),
            fetchProductionExecutionClosurePacketRecordsFromApi(),
            fetchProductionExecutionArchivalHandoffRecordsFromApi(),
            fetchProductionExecutionRetentionAttestationRecordsFromApi(),
            fetchProductionExecutionFinalArchiveCertificationRecordsFromApi(),
            fetchProductionExecutionCompletionDossierRecordsFromApi(),
            fetchProductionExecutionOperationsHandoverRecordsFromApi(),
            fetchProductionExecutionSupportReadinessRecordsFromApi(),
            fetchProductionExecutionServiceAcceptanceRecordsFromApi(),
            fetchProductionExecutionFinalTurnoverRecordsFromApi(),
            fetchProductionExecutionOperationalClosureRecordsFromApi(),
            fetchProductionExecutionPostImplementationReviewRecordsFromApi(),
            fetchProductionExecutionImprovementClosureRecordsFromApi(),
            fetchProductionExecutionFinalAcceptanceArchiveRecordsFromApi(),
            fetchProductionExecutionReadinessArchiveHandoffRecordsFromApi(),
            fetchProductionExecutionArchiveRetrievalValidationRecordsFromApi(),
            fetchProductionExecutionArchiveRecoveryDrillRecordsFromApi(),
            fetchProductionExecutionArchiveRecoveryAcceptanceRecordsFromApi(),
            fetchProductionExecutionArchiveRecoveryClosureRecordsFromApi(),
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
            setRealAdapterSwitchStateAuditPackages(apiRealAdapterSwitchStateAuditPackages);
            setControlledSwitchConfigurationRequests(apiControlledSwitchConfigurationRequests);
            setSwitchExecutionHandoffPackages(apiSwitchExecutionHandoffPackages);
            setSwitchExecutionOutcomeRecords(apiSwitchExecutionOutcomeRecords);
            setSwitchClosureRetentionPackages(apiSwitchClosureRetentionPackages);
            setAdapterPromotionReadinessDossiers(apiAdapterPromotionReadinessDossiers);
            setProductionAdapterAuthorizationPackets(apiProductionAdapterAuthorizationPackets);
            setProductionChangeFreezeRecords(apiProductionChangeFreezeRecords);
            setProductionCabHandoffPackets(apiProductionCabHandoffPackets);
            setProductionCabDecisionRecords(apiProductionCabDecisionRecords);
            setProductionImplementationHoldRecords(apiProductionImplementationHoldRecords);
            setProductionOperatorAssignmentRecords(apiProductionOperatorAssignmentRecords);
            setProductionExecutionReadinessRecords(apiProductionExecutionReadinessRecords);
            setProductionExecutionAuthorizationRecords(apiProductionExecutionAuthorizationRecords);
            setProductionChangeTicketLockRecords(apiProductionChangeTicketLockRecords);
            setProductionFinalExecutionPacketRecords(apiProductionFinalExecutionPacketRecords);
            setProductionExecutionHoldPointRecords(apiProductionExecutionHoldPointRecords);
            setProductionExecutionOutcomeAuthorizationRecords(apiProductionExecutionOutcomeAuthorizationRecords);
            setProductionExecutionClosureAuthorizationRecords(apiProductionExecutionClosureAuthorizationRecords);
            setProductionExecutionClosurePacketRecords(apiProductionExecutionClosurePacketRecords);
            setProductionExecutionArchivalHandoffRecords(apiProductionExecutionArchivalHandoffRecords);
            setProductionExecutionRetentionAttestationRecords(apiProductionExecutionRetentionAttestationRecords);
            setProductionExecutionFinalArchiveCertificationRecords(
              apiProductionExecutionFinalArchiveCertificationRecords
            );
            setProductionExecutionCompletionDossierRecords(apiProductionExecutionCompletionDossierRecords);
            setProductionExecutionOperationsHandoverRecords(apiProductionExecutionOperationsHandoverRecords);
            setProductionExecutionSupportReadinessRecords(apiProductionExecutionSupportReadinessRecords);
            setProductionExecutionServiceAcceptanceRecords(apiProductionExecutionServiceAcceptanceRecords);
            setProductionExecutionFinalTurnoverRecords(apiProductionExecutionFinalTurnoverRecords);
            setProductionExecutionOperationalClosureRecords(apiProductionExecutionOperationalClosureRecords);
            setProductionExecutionPostImplementationReviewRecords(
              apiProductionExecutionPostImplementationReviewRecords
            );
            setProductionExecutionImprovementClosureRecords(apiProductionExecutionImprovementClosureRecords);
            setProductionExecutionFinalAcceptanceArchiveRecords(
              apiProductionExecutionFinalAcceptanceArchiveRecords
            );
            setProductionExecutionReadinessArchiveHandoffRecords(
              apiProductionExecutionReadinessArchiveHandoffRecords
            );
            setProductionExecutionArchiveRetrievalValidationRecords(
              apiProductionExecutionArchiveRetrievalValidationRecords
            );
            setProductionExecutionArchiveRecoveryDrillRecords(
              apiProductionExecutionArchiveRecoveryDrillRecords
            );
            setProductionExecutionArchiveRecoveryAcceptanceRecords(
              apiProductionExecutionArchiveRecoveryAcceptanceRecords
            );
            setProductionExecutionArchiveRecoveryClosureRecords(
              apiProductionExecutionArchiveRecoveryClosureRecords
            );
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
      apiRealAdapterSwitchStateAuditPackages,
      apiControlledSwitchConfigurationRequests,
      apiSwitchExecutionHandoffPackages,
      apiSwitchExecutionOutcomeRecords,
      apiSwitchClosureRetentionPackages,
      apiAdapterPromotionReadinessDossiers,
      apiProductionAdapterAuthorizationPackets,
      apiProductionChangeFreezeRecords,
      apiProductionCabHandoffPackets,
      apiProductionCabDecisionRecords,
      apiProductionImplementationHoldRecords,
      apiProductionOperatorAssignmentRecords,
      apiProductionExecutionReadinessRecords,
      apiProductionExecutionAuthorizationRecords,
      apiProductionChangeTicketLockRecords,
      apiProductionFinalExecutionPacketRecords,
      apiProductionExecutionHoldPointRecords,
      apiProductionExecutionOutcomeAuthorizationRecords,
      apiProductionExecutionClosureAuthorizationRecords,
      apiProductionExecutionClosurePacketRecords,
      apiProductionExecutionArchivalHandoffRecords,
      apiProductionExecutionRetentionAttestationRecords,
      apiProductionExecutionFinalArchiveCertificationRecords,
      apiProductionExecutionCompletionDossierRecords,
      apiProductionExecutionOperationsHandoverRecords,
      apiProductionExecutionSupportReadinessRecords,
      apiProductionExecutionServiceAcceptanceRecords,
      apiProductionExecutionFinalTurnoverRecords,
      apiProductionExecutionOperationalClosureRecords,
      apiProductionExecutionPostImplementationReviewRecords,
      apiProductionExecutionImprovementClosureRecords,
      apiProductionExecutionFinalAcceptanceArchiveRecords,
      apiProductionExecutionReadinessArchiveHandoffRecords,
      apiProductionExecutionArchiveRetrievalValidationRecords,
      apiProductionExecutionArchiveRecoveryDrillRecords,
      apiProductionExecutionArchiveRecoveryAcceptanceRecords,
      apiProductionExecutionArchiveRecoveryClosureRecords,
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
      fetchRealAdapterSwitchStateAuditPackagesFromApi(),
      fetchControlledSwitchConfigurationRequestsFromApi(),
      fetchSwitchExecutionHandoffPackagesFromApi(),
      fetchSwitchExecutionOutcomeRecordsFromApi(),
      fetchSwitchClosureRetentionPackagesFromApi(),
      fetchAdapterPromotionReadinessDossiersFromApi(),
      fetchProductionAdapterAuthorizationPacketsFromApi(),
      fetchProductionChangeFreezeRecordsFromApi(),
      fetchProductionCabHandoffPacketsFromApi(),
      fetchProductionCabDecisionRecordsFromApi(),
      fetchProductionImplementationHoldRecordsFromApi(),
      fetchProductionOperatorAssignmentRecordsFromApi(),
      fetchProductionExecutionReadinessRecordsFromApi(),
      fetchProductionExecutionAuthorizationRecordsFromApi(),
      fetchProductionChangeTicketLockRecordsFromApi(),
      fetchProductionFinalExecutionPacketRecordsFromApi(),
      fetchProductionExecutionHoldPointRecordsFromApi(),
      fetchProductionExecutionOutcomeAuthorizationRecordsFromApi(),
      fetchProductionExecutionClosureAuthorizationRecordsFromApi(),
      fetchProductionExecutionClosurePacketRecordsFromApi(),
      fetchProductionExecutionArchivalHandoffRecordsFromApi(),
      fetchProductionExecutionRetentionAttestationRecordsFromApi(),
      fetchProductionExecutionFinalArchiveCertificationRecordsFromApi(),
      fetchProductionExecutionCompletionDossierRecordsFromApi(),
      fetchProductionExecutionOperationsHandoverRecordsFromApi(),
      fetchProductionExecutionSupportReadinessRecordsFromApi(),
      fetchProductionExecutionServiceAcceptanceRecordsFromApi(),
      fetchProductionExecutionFinalTurnoverRecordsFromApi(),
      fetchProductionExecutionOperationalClosureRecordsFromApi(),
      fetchProductionExecutionPostImplementationReviewRecordsFromApi(),
      fetchProductionExecutionImprovementClosureRecordsFromApi(),
      fetchProductionExecutionFinalAcceptanceArchiveRecordsFromApi(),
      fetchProductionExecutionReadinessArchiveHandoffRecordsFromApi(),
      fetchProductionExecutionArchiveRetrievalValidationRecordsFromApi(),
      fetchProductionExecutionArchiveRecoveryDrillRecordsFromApi(),
      fetchProductionExecutionArchiveRecoveryAcceptanceRecordsFromApi(),
      fetchProductionExecutionArchiveRecoveryClosureRecordsFromApi(),
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
    setRealAdapterSwitchStateAuditPackages(apiRealAdapterSwitchStateAuditPackages);
    setControlledSwitchConfigurationRequests(apiControlledSwitchConfigurationRequests);
    setSwitchExecutionHandoffPackages(apiSwitchExecutionHandoffPackages);
    setSwitchExecutionOutcomeRecords(apiSwitchExecutionOutcomeRecords);
    setSwitchClosureRetentionPackages(apiSwitchClosureRetentionPackages);
    setAdapterPromotionReadinessDossiers(apiAdapterPromotionReadinessDossiers);
    setProductionAdapterAuthorizationPackets(apiProductionAdapterAuthorizationPackets);
    setProductionChangeFreezeRecords(apiProductionChangeFreezeRecords);
    setProductionCabHandoffPackets(apiProductionCabHandoffPackets);
    setProductionCabDecisionRecords(apiProductionCabDecisionRecords);
    setProductionImplementationHoldRecords(apiProductionImplementationHoldRecords);
    setProductionOperatorAssignmentRecords(apiProductionOperatorAssignmentRecords);
    setProductionExecutionReadinessRecords(apiProductionExecutionReadinessRecords);
    setProductionExecutionAuthorizationRecords(apiProductionExecutionAuthorizationRecords);
    setProductionChangeTicketLockRecords(apiProductionChangeTicketLockRecords);
    setProductionFinalExecutionPacketRecords(apiProductionFinalExecutionPacketRecords);
    setProductionExecutionHoldPointRecords(apiProductionExecutionHoldPointRecords);
    setProductionExecutionOutcomeAuthorizationRecords(apiProductionExecutionOutcomeAuthorizationRecords);
    setProductionExecutionClosureAuthorizationRecords(apiProductionExecutionClosureAuthorizationRecords);
    setProductionExecutionClosurePacketRecords(apiProductionExecutionClosurePacketRecords);
    setProductionExecutionArchivalHandoffRecords(apiProductionExecutionArchivalHandoffRecords);
    setProductionExecutionRetentionAttestationRecords(apiProductionExecutionRetentionAttestationRecords);
    setProductionExecutionFinalArchiveCertificationRecords(apiProductionExecutionFinalArchiveCertificationRecords);
    setProductionExecutionCompletionDossierRecords(apiProductionExecutionCompletionDossierRecords);
    setProductionExecutionOperationsHandoverRecords(apiProductionExecutionOperationsHandoverRecords);
    setProductionExecutionSupportReadinessRecords(apiProductionExecutionSupportReadinessRecords);
    setProductionExecutionServiceAcceptanceRecords(apiProductionExecutionServiceAcceptanceRecords);
    setProductionExecutionFinalTurnoverRecords(apiProductionExecutionFinalTurnoverRecords);
    setProductionExecutionOperationalClosureRecords(apiProductionExecutionOperationalClosureRecords);
    setProductionExecutionPostImplementationReviewRecords(apiProductionExecutionPostImplementationReviewRecords);
    setProductionExecutionImprovementClosureRecords(apiProductionExecutionImprovementClosureRecords);
    setProductionExecutionFinalAcceptanceArchiveRecords(apiProductionExecutionFinalAcceptanceArchiveRecords);
    setProductionExecutionReadinessArchiveHandoffRecords(apiProductionExecutionReadinessArchiveHandoffRecords);
    setProductionExecutionArchiveRetrievalValidationRecords(apiProductionExecutionArchiveRetrievalValidationRecords);
    setProductionExecutionArchiveRecoveryDrillRecords(apiProductionExecutionArchiveRecoveryDrillRecords);
    setProductionExecutionArchiveRecoveryAcceptanceRecords(apiProductionExecutionArchiveRecoveryAcceptanceRecords);
    setProductionExecutionArchiveRecoveryClosureRecords(apiProductionExecutionArchiveRecoveryClosureRecords);
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

  async function prepareRealAdapterSwitchStateAuditPackage() {
    const switchReview = manualRealAdapterSwitchReviews[0];
    if (!switchReview) {
      return;
    }

    if (apiHealth.mode === "api") {
      const auditPackage = await createRealAdapterSwitchStateAuditPackageViaApi({ switchReviewId: switchReview.id });
      await refreshApiState();
      setRealAdapterSwitchStateAuditPackages((current) => [
        auditPackage,
        ...current.filter((item) => item.id !== auditPackage.id),
      ]);
      return;
    }

    setRealAdapterSwitchStateAuditPackages((current) => [
      createMockRealAdapterSwitchStateAuditPackage(switchReview, session.user),
      ...current,
    ]);
  }

  async function requestControlledSwitchConfiguration() {
    const auditPackage = realAdapterSwitchStateAuditPackages[0];
    if (!auditPackage) {
      return;
    }

    if (apiHealth.mode === "api") {
      const switchRequest = await createControlledSwitchConfigurationRequestViaApi({ auditPackageId: auditPackage.id });
      await refreshApiState();
      setControlledSwitchConfigurationRequests((current) => [
        switchRequest,
        ...current.filter((item) => item.id !== switchRequest.id),
      ]);
      return;
    }

    setControlledSwitchConfigurationRequests((current) => [
      createMockControlledSwitchConfigurationRequest(auditPackage, session.user),
      ...current,
    ]);
  }

  async function prepareSwitchExecutionHandoffPackage() {
    const switchRequest = controlledSwitchConfigurationRequests[0];
    if (!switchRequest) {
      return;
    }

    if (apiHealth.mode === "api") {
      const handoffPackage = await createSwitchExecutionHandoffPackageViaApi({
        controlledSwitchRequestId: switchRequest.id,
      });
      await refreshApiState();
      setSwitchExecutionHandoffPackages((current) => [
        handoffPackage,
        ...current.filter((item) => item.id !== handoffPackage.id),
      ]);
      return;
    }

    setSwitchExecutionHandoffPackages((current) => [
      createMockSwitchExecutionHandoffPackage(switchRequest, session.user),
      ...current,
    ]);
  }

  async function recordSwitchExecutionOutcome() {
    const handoffPackage = switchExecutionHandoffPackages[0];
    if (!handoffPackage) {
      return;
    }

    if (apiHealth.mode === "api") {
      const outcomeRecord = await createSwitchExecutionOutcomeRecordViaApi({ handoffPackageId: handoffPackage.id });
      await refreshApiState();
      setSwitchExecutionOutcomeRecords((current) => [
        outcomeRecord,
        ...current.filter((item) => item.id !== outcomeRecord.id),
      ]);
      return;
    }

    setSwitchExecutionOutcomeRecords((current) => [
      createMockSwitchExecutionOutcomeRecord(handoffPackage, session.user),
      ...current,
    ]);
  }

  async function prepareSwitchClosureRetentionPackage() {
    const outcomeRecord = switchExecutionOutcomeRecords[0];
    if (!outcomeRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const closurePackage = await createSwitchClosureRetentionPackageViaApi({ outcomeRecordId: outcomeRecord.id });
      await refreshApiState();
      setSwitchClosureRetentionPackages((current) => [
        closurePackage,
        ...current.filter((item) => item.id !== closurePackage.id),
      ]);
      return;
    }

    setSwitchClosureRetentionPackages((current) => [
      createMockSwitchClosureRetentionPackage(outcomeRecord, session.user),
      ...current,
    ]);
  }

  async function prepareAdapterPromotionReadinessDossier() {
    const closurePackage = switchClosureRetentionPackages[0];
    if (!closurePackage) {
      return;
    }

    if (apiHealth.mode === "api") {
      const dossier = await createAdapterPromotionReadinessDossierViaApi({ closurePackageId: closurePackage.id });
      await refreshApiState();
      setAdapterPromotionReadinessDossiers((current) => [
        dossier,
        ...current.filter((item) => item.id !== dossier.id),
      ]);
      return;
    }

    setAdapterPromotionReadinessDossiers((current) => [
      createMockAdapterPromotionReadinessDossier(closurePackage, session.user),
      ...current,
    ]);
  }

  async function prepareProductionAdapterAuthorizationPacket() {
    const dossier = adapterPromotionReadinessDossiers[0];
    if (!dossier) {
      return;
    }

    if (apiHealth.mode === "api") {
      const packet = await createProductionAdapterAuthorizationPacketViaApi({ promotionDossierId: dossier.id });
      await refreshApiState();
      setProductionAdapterAuthorizationPackets((current) => [
        packet,
        ...current.filter((item) => item.id !== packet.id),
      ]);
      return;
    }

    setProductionAdapterAuthorizationPackets((current) => [
      createMockProductionAdapterAuthorizationPacket(dossier, session.user),
      ...current,
    ]);
  }

  async function recordProductionChangeFreeze() {
    const authorizationPacket = productionAdapterAuthorizationPackets[0];
    if (!authorizationPacket) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionChangeFreezeRecordViaApi({
        authorizationPacketId: authorizationPacket.id,
      });
      await refreshApiState();
      setProductionChangeFreezeRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionChangeFreezeRecords((current) => [
      createMockProductionChangeFreezeRecord(authorizationPacket, session.user),
      ...current,
    ]);
  }

  async function prepareProductionCabHandoffPacket() {
    const freezeRecord = productionChangeFreezeRecords[0];
    if (!freezeRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const packet = await createProductionCabHandoffPacketViaApi({ freezeRecordId: freezeRecord.id });
      await refreshApiState();
      setProductionCabHandoffPackets((current) => [
        packet,
        ...current.filter((item) => item.id !== packet.id),
      ]);
      return;
    }

    setProductionCabHandoffPackets((current) => [
      createMockProductionCabHandoffPacket(freezeRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionCabDecision() {
    const handoffPacket = productionCabHandoffPackets[0];
    if (!handoffPacket) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionCabDecisionRecordViaApi({
        cabHandoffPacketId: handoffPacket.id,
      });
      await refreshApiState();
      setProductionCabDecisionRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionCabDecisionRecords((current) => [
      createMockProductionCabDecisionRecord(handoffPacket, session.user),
      ...current,
    ]);
  }

  async function recordProductionImplementationHold() {
    const decisionRecord = productionCabDecisionRecords[0];
    if (!decisionRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionImplementationHoldRecordViaApi({
        cabDecisionRecordId: decisionRecord.id,
      });
      await refreshApiState();
      setProductionImplementationHoldRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionImplementationHoldRecords((current) => [
      createMockProductionImplementationHoldRecord(decisionRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionOperatorAssignment() {
    const holdRecord = productionImplementationHoldRecords[0];
    if (!holdRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionOperatorAssignmentRecordViaApi({
        implementationHoldRecordId: holdRecord.id,
      });
      await refreshApiState();
      setProductionOperatorAssignmentRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionOperatorAssignmentRecords((current) => [
      createMockProductionOperatorAssignmentRecord(holdRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionReadiness() {
    const assignmentRecord = productionOperatorAssignmentRecords[0];
    if (!assignmentRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionReadinessRecordViaApi({
        operatorAssignmentRecordId: assignmentRecord.id,
      });
      await refreshApiState();
      setProductionExecutionReadinessRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionReadinessRecords((current) => [
      createMockProductionExecutionReadinessRecord(assignmentRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionAuthorization() {
    const readinessRecord = productionExecutionReadinessRecords[0];
    if (!readinessRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionAuthorizationRecordViaApi({
        executionReadinessRecordId: readinessRecord.id,
      });
      await refreshApiState();
      setProductionExecutionAuthorizationRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionAuthorizationRecords((current) => [
      createMockProductionExecutionAuthorizationRecord(readinessRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionChangeTicketLock() {
    const authorizationRecord = productionExecutionAuthorizationRecords[0];
    if (!authorizationRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionChangeTicketLockRecordViaApi({
        executionAuthorizationRecordId: authorizationRecord.id,
      });
      await refreshApiState();
      setProductionChangeTicketLockRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionChangeTicketLockRecords((current) => [
      createMockProductionChangeTicketLockRecord(authorizationRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionFinalExecutionPacket() {
    const lockRecord = productionChangeTicketLockRecords[0];
    if (!lockRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionFinalExecutionPacketRecordViaApi({
        changeTicketLockRecordId: lockRecord.id,
      });
      await refreshApiState();
      setProductionFinalExecutionPacketRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionFinalExecutionPacketRecords((current) => [
      createMockProductionFinalExecutionPacketRecord(lockRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionHoldPoint() {
    const packetRecord = productionFinalExecutionPacketRecords[0];
    if (!packetRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionHoldPointRecordViaApi({
        finalExecutionPacketRecordId: packetRecord.id,
      });
      await refreshApiState();
      setProductionExecutionHoldPointRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionHoldPointRecords((current) => [
      createMockProductionExecutionHoldPointRecord(packetRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionOutcomeAuthorization() {
    const holdPointRecord = productionExecutionHoldPointRecords[0];
    if (!holdPointRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionOutcomeAuthorizationRecordViaApi({
        executionHoldPointRecordId: holdPointRecord.id,
      });
      await refreshApiState();
      setProductionExecutionOutcomeAuthorizationRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionOutcomeAuthorizationRecords((current) => [
      createMockProductionExecutionOutcomeAuthorizationRecord(holdPointRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionClosureAuthorization() {
    const outcomeAuthorizationRecord = productionExecutionOutcomeAuthorizationRecords[0];
    if (!outcomeAuthorizationRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionClosureAuthorizationRecordViaApi({
        outcomeAuthorizationRecordId: outcomeAuthorizationRecord.id,
      });
      await refreshApiState();
      setProductionExecutionClosureAuthorizationRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionClosureAuthorizationRecords((current) => [
      createMockProductionExecutionClosureAuthorizationRecord(outcomeAuthorizationRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionClosurePacket() {
    const closureAuthorizationRecord = productionExecutionClosureAuthorizationRecords[0];
    if (!closureAuthorizationRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionClosurePacketRecordViaApi({
        closureAuthorizationRecordId: closureAuthorizationRecord.id,
      });
      await refreshApiState();
      setProductionExecutionClosurePacketRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionClosurePacketRecords((current) => [
      createMockProductionExecutionClosurePacketRecord(closureAuthorizationRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionArchivalHandoff() {
    const closurePacketRecord = productionExecutionClosurePacketRecords[0];
    if (!closurePacketRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionArchivalHandoffRecordViaApi({
        closurePacketRecordId: closurePacketRecord.id,
      });
      await refreshApiState();
      setProductionExecutionArchivalHandoffRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionArchivalHandoffRecords((current) => [
      createMockProductionExecutionArchivalHandoffRecord(closurePacketRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionRetentionAttestation() {
    const archivalHandoffRecord = productionExecutionArchivalHandoffRecords[0];
    if (!archivalHandoffRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionRetentionAttestationRecordViaApi({
        archivalHandoffRecordId: archivalHandoffRecord.id,
      });
      await refreshApiState();
      setProductionExecutionRetentionAttestationRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionRetentionAttestationRecords((current) => [
      createMockProductionExecutionRetentionAttestationRecord(archivalHandoffRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionFinalArchiveCertification() {
    const retentionAttestationRecord = productionExecutionRetentionAttestationRecords[0];
    if (!retentionAttestationRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionFinalArchiveCertificationRecordViaApi({
        retentionAttestationRecordId: retentionAttestationRecord.id,
      });
      await refreshApiState();
      setProductionExecutionFinalArchiveCertificationRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionFinalArchiveCertificationRecords((current) => [
      createMockProductionExecutionFinalArchiveCertificationRecord(retentionAttestationRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionCompletionDossier() {
    const finalArchiveCertificationRecord = productionExecutionFinalArchiveCertificationRecords[0];
    if (!finalArchiveCertificationRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionCompletionDossierRecordViaApi({
        finalArchiveCertificationRecordId: finalArchiveCertificationRecord.id,
      });
      await refreshApiState();
      setProductionExecutionCompletionDossierRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionCompletionDossierRecords((current) => [
      createMockProductionExecutionCompletionDossierRecord(finalArchiveCertificationRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionOperationsHandover() {
    const completionDossierRecord = productionExecutionCompletionDossierRecords[0];
    if (!completionDossierRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionOperationsHandoverRecordViaApi({
        completionDossierRecordId: completionDossierRecord.id,
      });
      await refreshApiState();
      setProductionExecutionOperationsHandoverRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionOperationsHandoverRecords((current) => [
      createMockProductionExecutionOperationsHandoverRecord(completionDossierRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionSupportReadiness() {
    const operationsHandoverRecord = productionExecutionOperationsHandoverRecords[0];
    if (!operationsHandoverRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionSupportReadinessRecordViaApi({
        operationsHandoverRecordId: operationsHandoverRecord.id,
      });
      await refreshApiState();
      setProductionExecutionSupportReadinessRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionSupportReadinessRecords((current) => [
      createMockProductionExecutionSupportReadinessRecord(operationsHandoverRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionServiceAcceptance() {
    const supportReadinessRecord = productionExecutionSupportReadinessRecords[0];
    if (!supportReadinessRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionServiceAcceptanceRecordViaApi({
        supportReadinessRecordId: supportReadinessRecord.id,
      });
      await refreshApiState();
      setProductionExecutionServiceAcceptanceRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionServiceAcceptanceRecords((current) => [
      createMockProductionExecutionServiceAcceptanceRecord(supportReadinessRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionFinalTurnover() {
    const serviceAcceptanceRecord = productionExecutionServiceAcceptanceRecords[0];
    if (!serviceAcceptanceRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionFinalTurnoverRecordViaApi({
        serviceAcceptanceRecordId: serviceAcceptanceRecord.id,
      });
      await refreshApiState();
      setProductionExecutionFinalTurnoverRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionFinalTurnoverRecords((current) => [
      createMockProductionExecutionFinalTurnoverRecord(serviceAcceptanceRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionOperationalClosure() {
    const finalTurnoverRecord = productionExecutionFinalTurnoverRecords[0];
    if (!finalTurnoverRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionOperationalClosureRecordViaApi({
        finalTurnoverRecordId: finalTurnoverRecord.id,
      });
      await refreshApiState();
      setProductionExecutionOperationalClosureRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionOperationalClosureRecords((current) => [
      createMockProductionExecutionOperationalClosureRecord(finalTurnoverRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionPostImplementationReview() {
    const operationalClosureRecord = productionExecutionOperationalClosureRecords[0];
    if (!operationalClosureRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionPostImplementationReviewRecordViaApi({
        operationalClosureRecordId: operationalClosureRecord.id,
      });
      await refreshApiState();
      setProductionExecutionPostImplementationReviewRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionPostImplementationReviewRecords((current) => [
      createMockProductionExecutionPostImplementationReviewRecord(operationalClosureRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionImprovementClosure() {
    const postImplementationReviewRecord = productionExecutionPostImplementationReviewRecords[0];
    if (!postImplementationReviewRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionImprovementClosureRecordViaApi({
        postImplementationReviewRecordId: postImplementationReviewRecord.id,
      });
      await refreshApiState();
      setProductionExecutionImprovementClosureRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionImprovementClosureRecords((current) => [
      createMockProductionExecutionImprovementClosureRecord(postImplementationReviewRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionFinalAcceptanceArchive() {
    const improvementClosureRecord = productionExecutionImprovementClosureRecords[0];
    if (!improvementClosureRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionFinalAcceptanceArchiveRecordViaApi({
        improvementClosureRecordId: improvementClosureRecord.id,
      });
      await refreshApiState();
      setProductionExecutionFinalAcceptanceArchiveRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionFinalAcceptanceArchiveRecords((current) => [
      createMockProductionExecutionFinalAcceptanceArchiveRecord(improvementClosureRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionReadinessArchiveHandoff() {
    const finalAcceptanceArchiveRecord = productionExecutionFinalAcceptanceArchiveRecords[0];
    if (!finalAcceptanceArchiveRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionReadinessArchiveHandoffRecordViaApi({
        finalAcceptanceArchiveRecordId: finalAcceptanceArchiveRecord.id,
      });
      await refreshApiState();
      setProductionExecutionReadinessArchiveHandoffRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionReadinessArchiveHandoffRecords((current) => [
      createMockProductionExecutionReadinessArchiveHandoffRecord(finalAcceptanceArchiveRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionArchiveRetrievalValidation() {
    const readinessArchiveHandoffRecord = productionExecutionReadinessArchiveHandoffRecords[0];
    if (!readinessArchiveHandoffRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionArchiveRetrievalValidationRecordViaApi({
        readinessArchiveHandoffRecordId: readinessArchiveHandoffRecord.id,
      });
      await refreshApiState();
      setProductionExecutionArchiveRetrievalValidationRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionArchiveRetrievalValidationRecords((current) => [
      createMockProductionExecutionArchiveRetrievalValidationRecord(readinessArchiveHandoffRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionArchiveRecoveryDrill() {
    const archiveRetrievalValidationRecord = productionExecutionArchiveRetrievalValidationRecords[0];
    if (!archiveRetrievalValidationRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionArchiveRecoveryDrillRecordViaApi({
        archiveRetrievalValidationRecordId: archiveRetrievalValidationRecord.id,
      });
      await refreshApiState();
      setProductionExecutionArchiveRecoveryDrillRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionArchiveRecoveryDrillRecords((current) => [
      createMockProductionExecutionArchiveRecoveryDrillRecord(archiveRetrievalValidationRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionArchiveRecoveryAcceptance() {
    const archiveRecoveryDrillRecord = productionExecutionArchiveRecoveryDrillRecords[0];
    if (!archiveRecoveryDrillRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionArchiveRecoveryAcceptanceRecordViaApi({
        archiveRecoveryDrillRecordId: archiveRecoveryDrillRecord.id,
      });
      await refreshApiState();
      setProductionExecutionArchiveRecoveryAcceptanceRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionArchiveRecoveryAcceptanceRecords((current) => [
      createMockProductionExecutionArchiveRecoveryAcceptanceRecord(archiveRecoveryDrillRecord, session.user),
      ...current,
    ]);
  }

  async function recordProductionExecutionArchiveRecoveryClosure() {
    const archiveRecoveryAcceptanceRecord = productionExecutionArchiveRecoveryAcceptanceRecords[0];
    if (!archiveRecoveryAcceptanceRecord) {
      return;
    }

    if (apiHealth.mode === "api") {
      const record = await createProductionExecutionArchiveRecoveryClosureRecordViaApi({
        archiveRecoveryAcceptanceRecordId: archiveRecoveryAcceptanceRecord.id,
      });
      await refreshApiState();
      setProductionExecutionArchiveRecoveryClosureRecords((current) => [
        record,
        ...current.filter((item) => item.id !== record.id),
      ]);
      return;
    }

    setProductionExecutionArchiveRecoveryClosureRecords((current) => [
      createMockProductionExecutionArchiveRecoveryClosureRecord(archiveRecoveryAcceptanceRecord, session.user),
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
            realAdapterSwitchStateAuditPackages={realAdapterSwitchStateAuditPackages}
            controlledSwitchConfigurationRequests={controlledSwitchConfigurationRequests}
            switchExecutionHandoffPackages={switchExecutionHandoffPackages}
            switchExecutionOutcomeRecords={switchExecutionOutcomeRecords}
            switchClosureRetentionPackages={switchClosureRetentionPackages}
            adapterPromotionReadinessDossiers={adapterPromotionReadinessDossiers}
            productionAdapterAuthorizationPackets={productionAdapterAuthorizationPackets}
            productionChangeFreezeRecords={productionChangeFreezeRecords}
            productionCabHandoffPackets={productionCabHandoffPackets}
            productionCabDecisionRecords={productionCabDecisionRecords}
            productionImplementationHoldRecords={productionImplementationHoldRecords}
            productionOperatorAssignmentRecords={productionOperatorAssignmentRecords}
            productionExecutionReadinessRecords={productionExecutionReadinessRecords}
            productionExecutionAuthorizationRecords={productionExecutionAuthorizationRecords}
            productionChangeTicketLockRecords={productionChangeTicketLockRecords}
            productionFinalExecutionPacketRecords={productionFinalExecutionPacketRecords}
            productionExecutionHoldPointRecords={productionExecutionHoldPointRecords}
            productionExecutionOutcomeAuthorizationRecords={productionExecutionOutcomeAuthorizationRecords}
            productionExecutionClosureAuthorizationRecords={productionExecutionClosureAuthorizationRecords}
            productionExecutionClosurePacketRecords={productionExecutionClosurePacketRecords}
            productionExecutionArchivalHandoffRecords={productionExecutionArchivalHandoffRecords}
            productionExecutionRetentionAttestationRecords={productionExecutionRetentionAttestationRecords}
            productionExecutionFinalArchiveCertificationRecords={productionExecutionFinalArchiveCertificationRecords}
            productionExecutionCompletionDossierRecords={productionExecutionCompletionDossierRecords}
            productionExecutionOperationsHandoverRecords={productionExecutionOperationsHandoverRecords}
            productionExecutionSupportReadinessRecords={productionExecutionSupportReadinessRecords}
            productionExecutionServiceAcceptanceRecords={productionExecutionServiceAcceptanceRecords}
            productionExecutionFinalTurnoverRecords={productionExecutionFinalTurnoverRecords}
            productionExecutionOperationalClosureRecords={productionExecutionOperationalClosureRecords}
            productionExecutionPostImplementationReviewRecords={productionExecutionPostImplementationReviewRecords}
            productionExecutionImprovementClosureRecords={productionExecutionImprovementClosureRecords}
            productionExecutionFinalAcceptanceArchiveRecords={productionExecutionFinalAcceptanceArchiveRecords}
            productionExecutionReadinessArchiveHandoffRecords={productionExecutionReadinessArchiveHandoffRecords}
            productionExecutionArchiveRetrievalValidationRecords={productionExecutionArchiveRetrievalValidationRecords}
            productionExecutionArchiveRecoveryDrillRecords={productionExecutionArchiveRecoveryDrillRecords}
            productionExecutionArchiveRecoveryAcceptanceRecords={productionExecutionArchiveRecoveryAcceptanceRecords}
            productionExecutionArchiveRecoveryClosureRecords={productionExecutionArchiveRecoveryClosureRecords}
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
            prepareRealAdapterSwitchStateAuditPackage={prepareRealAdapterSwitchStateAuditPackage}
            requestControlledSwitchConfiguration={requestControlledSwitchConfiguration}
            prepareSwitchExecutionHandoffPackage={prepareSwitchExecutionHandoffPackage}
            recordSwitchExecutionOutcome={recordSwitchExecutionOutcome}
            prepareSwitchClosureRetentionPackage={prepareSwitchClosureRetentionPackage}
            prepareAdapterPromotionReadinessDossier={prepareAdapterPromotionReadinessDossier}
            prepareProductionAdapterAuthorizationPacket={prepareProductionAdapterAuthorizationPacket}
            recordProductionChangeFreeze={recordProductionChangeFreeze}
            prepareProductionCabHandoffPacket={prepareProductionCabHandoffPacket}
            recordProductionCabDecision={recordProductionCabDecision}
            recordProductionImplementationHold={recordProductionImplementationHold}
            recordProductionOperatorAssignment={recordProductionOperatorAssignment}
            recordProductionExecutionReadiness={recordProductionExecutionReadiness}
            recordProductionExecutionAuthorization={recordProductionExecutionAuthorization}
            recordProductionChangeTicketLock={recordProductionChangeTicketLock}
            recordProductionFinalExecutionPacket={recordProductionFinalExecutionPacket}
            recordProductionExecutionHoldPoint={recordProductionExecutionHoldPoint}
            recordProductionExecutionOutcomeAuthorization={recordProductionExecutionOutcomeAuthorization}
            recordProductionExecutionClosureAuthorization={recordProductionExecutionClosureAuthorization}
            recordProductionExecutionClosurePacket={recordProductionExecutionClosurePacket}
            recordProductionExecutionArchivalHandoff={recordProductionExecutionArchivalHandoff}
            recordProductionExecutionRetentionAttestation={recordProductionExecutionRetentionAttestation}
            recordProductionExecutionFinalArchiveCertification={recordProductionExecutionFinalArchiveCertification}
            recordProductionExecutionCompletionDossier={recordProductionExecutionCompletionDossier}
            recordProductionExecutionOperationsHandover={recordProductionExecutionOperationsHandover}
            recordProductionExecutionSupportReadiness={recordProductionExecutionSupportReadiness}
            recordProductionExecutionServiceAcceptance={recordProductionExecutionServiceAcceptance}
            recordProductionExecutionFinalTurnover={recordProductionExecutionFinalTurnover}
            recordProductionExecutionOperationalClosure={recordProductionExecutionOperationalClosure}
            recordProductionExecutionPostImplementationReview={recordProductionExecutionPostImplementationReview}
            recordProductionExecutionImprovementClosure={recordProductionExecutionImprovementClosure}
            recordProductionExecutionFinalAcceptanceArchive={recordProductionExecutionFinalAcceptanceArchive}
            recordProductionExecutionReadinessArchiveHandoff={recordProductionExecutionReadinessArchiveHandoff}
            recordProductionExecutionArchiveRetrievalValidation={recordProductionExecutionArchiveRetrievalValidation}
            recordProductionExecutionArchiveRecoveryDrill={recordProductionExecutionArchiveRecoveryDrill}
            recordProductionExecutionArchiveRecoveryAcceptance={recordProductionExecutionArchiveRecoveryAcceptance}
            recordProductionExecutionArchiveRecoveryClosure={recordProductionExecutionArchiveRecoveryClosure}
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
  realAdapterSwitchStateAuditPackages,
  controlledSwitchConfigurationRequests,
  switchExecutionHandoffPackages,
  switchExecutionOutcomeRecords,
  switchClosureRetentionPackages,
  adapterPromotionReadinessDossiers,
  productionAdapterAuthorizationPackets,
  productionChangeFreezeRecords,
  productionCabHandoffPackets,
  productionCabDecisionRecords,
  productionImplementationHoldRecords,
  productionOperatorAssignmentRecords,
  productionExecutionReadinessRecords,
  productionExecutionAuthorizationRecords,
  productionChangeTicketLockRecords,
  productionFinalExecutionPacketRecords,
  productionExecutionHoldPointRecords,
  productionExecutionOutcomeAuthorizationRecords,
  productionExecutionClosureAuthorizationRecords,
  productionExecutionClosurePacketRecords,
  productionExecutionArchivalHandoffRecords,
  productionExecutionRetentionAttestationRecords,
  productionExecutionFinalArchiveCertificationRecords,
  productionExecutionCompletionDossierRecords,
  productionExecutionOperationsHandoverRecords,
  productionExecutionSupportReadinessRecords,
  productionExecutionServiceAcceptanceRecords,
  productionExecutionFinalTurnoverRecords,
  productionExecutionOperationalClosureRecords,
  productionExecutionPostImplementationReviewRecords,
  productionExecutionImprovementClosureRecords,
  productionExecutionFinalAcceptanceArchiveRecords,
  productionExecutionReadinessArchiveHandoffRecords,
  productionExecutionArchiveRetrievalValidationRecords,
  productionExecutionArchiveRecoveryDrillRecords,
  productionExecutionArchiveRecoveryAcceptanceRecords,
  productionExecutionArchiveRecoveryClosureRecords,
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
  prepareRealAdapterSwitchStateAuditPackage,
  requestControlledSwitchConfiguration,
  prepareSwitchExecutionHandoffPackage,
  recordSwitchExecutionOutcome,
  prepareSwitchClosureRetentionPackage,
  prepareAdapterPromotionReadinessDossier,
  prepareProductionAdapterAuthorizationPacket,
  recordProductionChangeFreeze,
  prepareProductionCabHandoffPacket,
  recordProductionCabDecision,
  recordProductionImplementationHold,
  recordProductionOperatorAssignment,
  recordProductionExecutionReadiness,
  recordProductionExecutionAuthorization,
  recordProductionChangeTicketLock,
  recordProductionFinalExecutionPacket,
  recordProductionExecutionHoldPoint,
  recordProductionExecutionOutcomeAuthorization,
  recordProductionExecutionClosureAuthorization,
  recordProductionExecutionClosurePacket,
  recordProductionExecutionArchivalHandoff,
  recordProductionExecutionRetentionAttestation,
  recordProductionExecutionFinalArchiveCertification,
  recordProductionExecutionCompletionDossier,
  recordProductionExecutionOperationsHandover,
  recordProductionExecutionSupportReadiness,
  recordProductionExecutionServiceAcceptance,
  recordProductionExecutionFinalTurnover,
  recordProductionExecutionOperationalClosure,
  recordProductionExecutionPostImplementationReview,
  recordProductionExecutionImprovementClosure,
  recordProductionExecutionFinalAcceptanceArchive,
  recordProductionExecutionReadinessArchiveHandoff,
  recordProductionExecutionArchiveRetrievalValidation,
  recordProductionExecutionArchiveRecoveryDrill,
  recordProductionExecutionArchiveRecoveryAcceptance,
  recordProductionExecutionArchiveRecoveryClosure,
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
  realAdapterSwitchStateAuditPackages: RealAdapterSwitchStateAuditPackage[];
  controlledSwitchConfigurationRequests: ControlledSwitchConfigurationRequest[];
  switchExecutionHandoffPackages: SwitchExecutionHandoffPackage[];
  switchExecutionOutcomeRecords: SwitchExecutionOutcomeRecord[];
  switchClosureRetentionPackages: SwitchClosureRetentionPackage[];
  adapterPromotionReadinessDossiers: AdapterPromotionReadinessDossier[];
  productionAdapterAuthorizationPackets: ProductionAdapterAuthorizationPacket[];
  productionChangeFreezeRecords: ProductionChangeFreezeRecord[];
  productionCabHandoffPackets: ProductionCabHandoffPacket[];
  productionCabDecisionRecords: ProductionCabDecisionRecord[];
  productionImplementationHoldRecords: ProductionImplementationHoldRecord[];
  productionOperatorAssignmentRecords: ProductionOperatorAssignmentRecord[];
  productionExecutionReadinessRecords: ProductionExecutionReadinessRecord[];
  productionExecutionAuthorizationRecords: ProductionExecutionAuthorizationRecord[];
  productionChangeTicketLockRecords: ProductionChangeTicketLockRecord[];
  productionFinalExecutionPacketRecords: ProductionFinalExecutionPacketRecord[];
  productionExecutionHoldPointRecords: ProductionExecutionHoldPointRecord[];
  productionExecutionOutcomeAuthorizationRecords: ProductionExecutionOutcomeAuthorizationRecord[];
  productionExecutionClosureAuthorizationRecords: ProductionExecutionClosureAuthorizationRecord[];
  productionExecutionClosurePacketRecords: ProductionExecutionClosurePacketRecord[];
  productionExecutionArchivalHandoffRecords: ProductionExecutionArchivalHandoffRecord[];
  productionExecutionRetentionAttestationRecords: ProductionExecutionRetentionAttestationRecord[];
  productionExecutionFinalArchiveCertificationRecords: ProductionExecutionFinalArchiveCertificationRecord[];
  productionExecutionCompletionDossierRecords: ProductionExecutionCompletionDossierRecord[];
  productionExecutionOperationsHandoverRecords: ProductionExecutionOperationsHandoverRecord[];
  productionExecutionSupportReadinessRecords: ProductionExecutionSupportReadinessRecord[];
  productionExecutionServiceAcceptanceRecords: ProductionExecutionServiceAcceptanceRecord[];
  productionExecutionFinalTurnoverRecords: ProductionExecutionFinalTurnoverRecord[];
  productionExecutionOperationalClosureRecords: ProductionExecutionOperationalClosureRecord[];
  productionExecutionPostImplementationReviewRecords: ProductionExecutionPostImplementationReviewRecord[];
  productionExecutionImprovementClosureRecords: ProductionExecutionImprovementClosureRecord[];
  productionExecutionFinalAcceptanceArchiveRecords: ProductionExecutionFinalAcceptanceArchiveRecord[];
  productionExecutionReadinessArchiveHandoffRecords: ProductionExecutionReadinessArchiveHandoffRecord[];
  productionExecutionArchiveRetrievalValidationRecords: ProductionExecutionArchiveRetrievalValidationRecord[];
  productionExecutionArchiveRecoveryDrillRecords: ProductionExecutionArchiveRecoveryDrillRecord[];
  productionExecutionArchiveRecoveryAcceptanceRecords: ProductionExecutionArchiveRecoveryAcceptanceRecord[];
  productionExecutionArchiveRecoveryClosureRecords: ProductionExecutionArchiveRecoveryClosureRecord[];
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
  prepareRealAdapterSwitchStateAuditPackage: () => void;
  requestControlledSwitchConfiguration: () => void;
  prepareSwitchExecutionHandoffPackage: () => void;
  recordSwitchExecutionOutcome: () => void;
  prepareSwitchClosureRetentionPackage: () => void;
  prepareAdapterPromotionReadinessDossier: () => void;
  prepareProductionAdapterAuthorizationPacket: () => void;
  recordProductionChangeFreeze: () => void;
  prepareProductionCabHandoffPacket: () => void;
  recordProductionCabDecision: () => void;
  recordProductionImplementationHold: () => void;
  recordProductionOperatorAssignment: () => void;
  recordProductionExecutionReadiness: () => void;
  recordProductionExecutionAuthorization: () => void;
  recordProductionChangeTicketLock: () => void;
  recordProductionFinalExecutionPacket: () => void;
  recordProductionExecutionHoldPoint: () => void;
  recordProductionExecutionOutcomeAuthorization: () => void;
  recordProductionExecutionClosureAuthorization: () => void;
  recordProductionExecutionClosurePacket: () => void;
  recordProductionExecutionArchivalHandoff: () => void;
  recordProductionExecutionRetentionAttestation: () => void;
  recordProductionExecutionFinalArchiveCertification: () => void;
  recordProductionExecutionCompletionDossier: () => void;
  recordProductionExecutionOperationsHandover: () => void;
  recordProductionExecutionSupportReadiness: () => void;
  recordProductionExecutionServiceAcceptance: () => void;
  recordProductionExecutionFinalTurnover: () => void;
  recordProductionExecutionOperationalClosure: () => void;
  recordProductionExecutionPostImplementationReview: () => void;
  recordProductionExecutionImprovementClosure: () => void;
  recordProductionExecutionFinalAcceptanceArchive: () => void;
  recordProductionExecutionReadinessArchiveHandoff: () => void;
  recordProductionExecutionArchiveRetrievalValidation: () => void;
  recordProductionExecutionArchiveRecoveryDrill: () => void;
  recordProductionExecutionArchiveRecoveryAcceptance: () => void;
  recordProductionExecutionArchiveRecoveryClosure: () => void;
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
          <Panel title="Real adapter switch-state audit" action={`${realAdapterSwitchStateAuditPackages.length} packages`}>
            <RealAdapterSwitchStateAuditPackagePanel
              packages={realAdapterSwitchStateAuditPackages}
              prepareRealAdapterSwitchStateAuditPackage={prepareRealAdapterSwitchStateAuditPackage}
            />
          </Panel>
          <Panel title="Controlled switch requests" action={`${controlledSwitchConfigurationRequests.length} requests`}>
            <ControlledSwitchConfigurationRequestPanel
              requests={controlledSwitchConfigurationRequests}
              requestControlledSwitchConfiguration={requestControlledSwitchConfiguration}
            />
          </Panel>
          <Panel title="Switch execution handoff" action={`${switchExecutionHandoffPackages.length} packages`}>
            <SwitchExecutionHandoffPackagePanel
              packages={switchExecutionHandoffPackages}
              prepareSwitchExecutionHandoffPackage={prepareSwitchExecutionHandoffPackage}
            />
          </Panel>
          <Panel title="Switch execution outcomes" action={`${switchExecutionOutcomeRecords.length} records`}>
            <SwitchExecutionOutcomeRecordPanel
              records={switchExecutionOutcomeRecords}
              recordSwitchExecutionOutcome={recordSwitchExecutionOutcome}
            />
          </Panel>
          <Panel title="Switch closure retention" action={`${switchClosureRetentionPackages.length} packages`}>
            <SwitchClosureRetentionPackagePanel
              packages={switchClosureRetentionPackages}
              prepareSwitchClosureRetentionPackage={prepareSwitchClosureRetentionPackage}
            />
          </Panel>
          <Panel title="Adapter promotion dossiers" action={`${adapterPromotionReadinessDossiers.length} dossiers`}>
            <AdapterPromotionReadinessDossierPanel
              dossiers={adapterPromotionReadinessDossiers}
              prepareAdapterPromotionReadinessDossier={prepareAdapterPromotionReadinessDossier}
            />
          </Panel>
          <Panel title="Production adapter authorization" action={`${productionAdapterAuthorizationPackets.length} packets`}>
            <ProductionAdapterAuthorizationPacketPanel
              packets={productionAdapterAuthorizationPackets}
              prepareProductionAdapterAuthorizationPacket={prepareProductionAdapterAuthorizationPacket}
            />
          </Panel>
          <Panel title="Production change freeze" action={`${productionChangeFreezeRecords.length} records`}>
            <ProductionChangeFreezeRecordPanel
              records={productionChangeFreezeRecords}
              recordProductionChangeFreeze={recordProductionChangeFreeze}
            />
          </Panel>
          <Panel title="Production CAB handoff" action={`${productionCabHandoffPackets.length} packets`}>
            <ProductionCabHandoffPacketPanel
              packets={productionCabHandoffPackets}
              prepareProductionCabHandoffPacket={prepareProductionCabHandoffPacket}
            />
          </Panel>
          <Panel title="Production CAB decision" action={`${productionCabDecisionRecords.length} records`}>
            <ProductionCabDecisionRecordPanel
              records={productionCabDecisionRecords}
              recordProductionCabDecision={recordProductionCabDecision}
            />
          </Panel>
          <Panel title="Production implementation hold" action={`${productionImplementationHoldRecords.length} records`}>
            <ProductionImplementationHoldRecordPanel
              records={productionImplementationHoldRecords}
              recordProductionImplementationHold={recordProductionImplementationHold}
            />
          </Panel>
          <Panel title="Production operator assignment" action={`${productionOperatorAssignmentRecords.length} records`}>
            <ProductionOperatorAssignmentRecordPanel
              records={productionOperatorAssignmentRecords}
              recordProductionOperatorAssignment={recordProductionOperatorAssignment}
            />
          </Panel>
          <Panel title="Production execution readiness" action={`${productionExecutionReadinessRecords.length} records`}>
            <ProductionExecutionReadinessRecordPanel
              records={productionExecutionReadinessRecords}
              recordProductionExecutionReadiness={recordProductionExecutionReadiness}
            />
          </Panel>
          <Panel title="Production execution authorization" action={`${productionExecutionAuthorizationRecords.length} records`}>
            <ProductionExecutionAuthorizationRecordPanel
              records={productionExecutionAuthorizationRecords}
              recordProductionExecutionAuthorization={recordProductionExecutionAuthorization}
            />
          </Panel>
          <Panel title="Production change ticket lock" action={`${productionChangeTicketLockRecords.length} records`}>
            <ProductionChangeTicketLockRecordPanel
              records={productionChangeTicketLockRecords}
              recordProductionChangeTicketLock={recordProductionChangeTicketLock}
            />
          </Panel>
          <Panel title="Production final execution packet" action={`${productionFinalExecutionPacketRecords.length} records`}>
            <ProductionFinalExecutionPacketRecordPanel
              records={productionFinalExecutionPacketRecords}
              recordProductionFinalExecutionPacket={recordProductionFinalExecutionPacket}
            />
          </Panel>
          <Panel title="Production execution hold-point" action={`${productionExecutionHoldPointRecords.length} records`}>
            <ProductionExecutionHoldPointRecordPanel
              records={productionExecutionHoldPointRecords}
              recordProductionExecutionHoldPoint={recordProductionExecutionHoldPoint}
            />
          </Panel>
          <Panel
            title="Production outcome authorization"
            action={`${productionExecutionOutcomeAuthorizationRecords.length} records`}
          >
            <ProductionExecutionOutcomeAuthorizationRecordPanel
              records={productionExecutionOutcomeAuthorizationRecords}
              recordProductionExecutionOutcomeAuthorization={recordProductionExecutionOutcomeAuthorization}
            />
          </Panel>
          <Panel
            title="Production closure authorization"
            action={`${productionExecutionClosureAuthorizationRecords.length} records`}
          >
            <ProductionExecutionClosureAuthorizationRecordPanel
              records={productionExecutionClosureAuthorizationRecords}
              recordProductionExecutionClosureAuthorization={recordProductionExecutionClosureAuthorization}
            />
          </Panel>
          <Panel
            title="Production closure packet"
            action={`${productionExecutionClosurePacketRecords.length} records`}
          >
            <ProductionExecutionClosurePacketRecordPanel
              records={productionExecutionClosurePacketRecords}
              recordProductionExecutionClosurePacket={recordProductionExecutionClosurePacket}
            />
          </Panel>
          <Panel
            title="Production archival handoff"
            action={`${productionExecutionArchivalHandoffRecords.length} records`}
          >
            <ProductionExecutionArchivalHandoffRecordPanel
              records={productionExecutionArchivalHandoffRecords}
              recordProductionExecutionArchivalHandoff={recordProductionExecutionArchivalHandoff}
            />
          </Panel>
          <Panel
            title="Production retention attestation"
            action={`${productionExecutionRetentionAttestationRecords.length} records`}
          >
            <ProductionExecutionRetentionAttestationRecordPanel
              records={productionExecutionRetentionAttestationRecords}
              recordProductionExecutionRetentionAttestation={recordProductionExecutionRetentionAttestation}
            />
          </Panel>
          <Panel
            title="Production final archive certification"
            action={`${productionExecutionFinalArchiveCertificationRecords.length} records`}
          >
            <ProductionExecutionFinalArchiveCertificationRecordPanel
              records={productionExecutionFinalArchiveCertificationRecords}
              recordProductionExecutionFinalArchiveCertification={recordProductionExecutionFinalArchiveCertification}
            />
          </Panel>
          <Panel
            title="Production completion dossier"
            action={`${productionExecutionCompletionDossierRecords.length} records`}
          >
            <ProductionExecutionCompletionDossierRecordPanel
              records={productionExecutionCompletionDossierRecords}
              recordProductionExecutionCompletionDossier={recordProductionExecutionCompletionDossier}
            />
          </Panel>
          <Panel
            title="Production operations handover"
            action={`${productionExecutionOperationsHandoverRecords.length} records`}
          >
            <ProductionExecutionOperationsHandoverRecordPanel
              records={productionExecutionOperationsHandoverRecords}
              recordProductionExecutionOperationsHandover={recordProductionExecutionOperationsHandover}
            />
          </Panel>
          <Panel
            title="Production support readiness"
            action={`${productionExecutionSupportReadinessRecords.length} records`}
          >
            <ProductionExecutionSupportReadinessRecordPanel
              records={productionExecutionSupportReadinessRecords}
              recordProductionExecutionSupportReadiness={recordProductionExecutionSupportReadiness}
            />
          </Panel>
          <Panel
            title="Production service acceptance"
            action={`${productionExecutionServiceAcceptanceRecords.length} records`}
          >
            <ProductionExecutionServiceAcceptanceRecordPanel
              records={productionExecutionServiceAcceptanceRecords}
              recordProductionExecutionServiceAcceptance={recordProductionExecutionServiceAcceptance}
            />
          </Panel>
          <Panel
            title="Production final turnover"
            action={`${productionExecutionFinalTurnoverRecords.length} records`}
          >
            <ProductionExecutionFinalTurnoverRecordPanel
              records={productionExecutionFinalTurnoverRecords}
              recordProductionExecutionFinalTurnover={recordProductionExecutionFinalTurnover}
            />
          </Panel>
          <Panel
            title="Production operational closure"
            action={`${productionExecutionOperationalClosureRecords.length} records`}
          >
            <ProductionExecutionOperationalClosureRecordPanel
              records={productionExecutionOperationalClosureRecords}
              recordProductionExecutionOperationalClosure={recordProductionExecutionOperationalClosure}
            />
          </Panel>
          <Panel
            title="Production post-implementation review"
            action={`${productionExecutionPostImplementationReviewRecords.length} records`}
          >
            <ProductionExecutionPostImplementationReviewRecordPanel
              records={productionExecutionPostImplementationReviewRecords}
              recordProductionExecutionPostImplementationReview={recordProductionExecutionPostImplementationReview}
            />
          </Panel>
          <Panel
            title="Production improvement closure"
            action={`${productionExecutionImprovementClosureRecords.length} records`}
          >
            <ProductionExecutionImprovementClosureRecordPanel
              records={productionExecutionImprovementClosureRecords}
              recordProductionExecutionImprovementClosure={recordProductionExecutionImprovementClosure}
            />
          </Panel>
          <Panel
            title="Production final acceptance archive"
            action={`${productionExecutionFinalAcceptanceArchiveRecords.length} records`}
          >
            <ProductionExecutionFinalAcceptanceArchiveRecordPanel
              records={productionExecutionFinalAcceptanceArchiveRecords}
              recordProductionExecutionFinalAcceptanceArchive={recordProductionExecutionFinalAcceptanceArchive}
            />
          </Panel>
          <Panel
            title="Production readiness archive handoff"
            action={`${productionExecutionReadinessArchiveHandoffRecords.length} records`}
          >
            <ProductionExecutionReadinessArchiveHandoffRecordPanel
              records={productionExecutionReadinessArchiveHandoffRecords}
              recordProductionExecutionReadinessArchiveHandoff={recordProductionExecutionReadinessArchiveHandoff}
            />
          </Panel>
          <Panel
            title="Production archive retrieval validation"
            action={`${productionExecutionArchiveRetrievalValidationRecords.length} records`}
          >
            <ProductionExecutionArchiveRetrievalValidationRecordPanel
              records={productionExecutionArchiveRetrievalValidationRecords}
              recordProductionExecutionArchiveRetrievalValidation={recordProductionExecutionArchiveRetrievalValidation}
            />
          </Panel>
          <Panel
            title="Production archive recovery drill"
            action={`${productionExecutionArchiveRecoveryDrillRecords.length} records`}
          >
            <ProductionExecutionArchiveRecoveryDrillRecordPanel
              records={productionExecutionArchiveRecoveryDrillRecords}
              recordProductionExecutionArchiveRecoveryDrill={recordProductionExecutionArchiveRecoveryDrill}
            />
          </Panel>
          <Panel
            title="Production archive recovery acceptance"
            action={`${productionExecutionArchiveRecoveryAcceptanceRecords.length} records`}
          >
            <ProductionExecutionArchiveRecoveryAcceptanceRecordPanel
              records={productionExecutionArchiveRecoveryAcceptanceRecords}
              recordProductionExecutionArchiveRecoveryAcceptance={recordProductionExecutionArchiveRecoveryAcceptance}
            />
          </Panel>
          <Panel
            title="Production archive recovery closure"
            action={`${productionExecutionArchiveRecoveryClosureRecords.length} records`}
          >
            <ProductionExecutionArchiveRecoveryClosureRecordPanel
              records={productionExecutionArchiveRecoveryClosureRecords}
              recordProductionExecutionArchiveRecoveryClosure={recordProductionExecutionArchiveRecoveryClosure}
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

function RealAdapterSwitchStateAuditPackagePanel({
  packages,
  prepareRealAdapterSwitchStateAuditPackage,
}: {
  packages: RealAdapterSwitchStateAuditPackage[];
  prepareRealAdapterSwitchStateAuditPackage: () => void;
}) {
  const latest = packages[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Archive size={18} />
        <div>
          <strong>Switch-state audit package</strong>
          <span>Collects pre/post switch-state snapshots, reviewer evidence, rollback timer, and retention references.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareRealAdapterSwitchStateAuditPackage}>
          <Archive size={15} />
          Prepare audit package
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No real-adapter switch-state audit package has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.switchReviewId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for switch-state audit review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Archive} label="Pre-change" value={latest.preChangeSnapshotReference || "missing"} passed={Boolean(latest.preChangeSnapshotReference)} />
            <CheckLine icon={Archive} label="Post-change" value={latest.postChangeSnapshotReference || "missing"} passed={Boolean(latest.postChangeSnapshotReference)} />
            <CheckLine icon={ShieldCheck} label="Reviewer" value={latest.reviewerEvidenceReference || "missing"} passed={Boolean(latest.reviewerEvidenceReference)} />
            <CheckLine icon={LockKeyhole} label="Switch" value="Unchanged" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Switch-state audit evidence</strong>
            <span>Rollback timer: {latest.rollbackTimerMinutes} minutes</span>
            <span>Retention: {latest.retentionReference || "missing"}</span>
            <span>Activation: {latest.activationId}</span>
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

function ControlledSwitchConfigurationRequestPanel({
  requests,
  requestControlledSwitchConfiguration,
}: {
  requests: ControlledSwitchConfigurationRequest[];
  requestControlledSwitchConfiguration: () => void;
}) {
  const latest = requests[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Controlled switch request</strong>
          <span>Records operator confirmation, reviewer acceptance, final dry-run proof, rollback timer, and retention evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={requestControlledSwitchConfiguration}>
          <LockKeyhole size={15} />
          Request controlled switch
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No controlled switch configuration request has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.auditPackageId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for controlled switch request review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Operator" value={latest.operatorConfirmation || "missing"} passed={Boolean(latest.operatorConfirmation)} />
            <CheckLine icon={ShieldCheck} label="Reviewer" value={latest.secondReviewerAcceptance || "missing"} passed={Boolean(latest.secondReviewerAcceptance)} />
            <CheckLine icon={Archive} label="Dry-run proof" value={latest.finalDryRunProofReference || "missing"} passed={Boolean(latest.finalDryRunProofReference)} />
            <CheckLine icon={LockKeyhole} label="Switch" value="Unchanged" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Controlled switch evidence</strong>
            <span>Rollback timer: {latest.rollbackTimerMinutes} minutes</span>
            <span>Retention: {latest.retentionReference || "missing"}</span>
            <span>Switch review: {latest.switchReviewId}</span>
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

function SwitchExecutionHandoffPackagePanel({
  packages,
  prepareSwitchExecutionHandoffPackage,
}: {
  packages: SwitchExecutionHandoffPackage[];
  prepareSwitchExecutionHandoffPackage: () => void;
}) {
  const latest = packages[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ScrollText size={18} />
        <div>
          <strong>Switch execution handoff package</strong>
          <span>Prepares operator run sheet, communications, observation, rollback-owner acceptance, and freeze proof.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareSwitchExecutionHandoffPackage}>
          <ScrollText size={15} />
          Prepare handoff package
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No switch execution handoff package has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.controlledSwitchRequestId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for switch execution handoff review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ScrollText} label="Run sheet" value={latest.operatorRunSheetReference || "missing"} passed={Boolean(latest.operatorRunSheetReference)} />
            <CheckLine icon={Network} label="Comms" value={latest.communicationsPlanReference || "missing"} passed={Boolean(latest.communicationsPlanReference)} />
            <CheckLine icon={Archive} label="Observation" value={latest.observationWindowReference || "missing"} passed={Boolean(latest.observationWindowReference)} />
            <CheckLine icon={LockKeyhole} label="Switch" value="Out of band" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Switch handoff evidence</strong>
            <span>Rollback owner: {latest.rollbackOwnerAcceptance || "missing"}</span>
            <span>Freeze proof: {latest.executionFreezeProofReference || "missing"}</span>
            <span>Audit package: {latest.auditPackageId}</span>
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

function SwitchExecutionOutcomeRecordPanel({
  records,
  recordSwitchExecutionOutcome,
}: {
  records: SwitchExecutionOutcomeRecord[];
  recordSwitchExecutionOutcome: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <CheckCircle2 size={18} />
        <div>
          <strong>Switch execution outcome record</strong>
          <span>Records out-of-band operator result, validation, rollback decision, bridge log, and audit sign-off.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordSwitchExecutionOutcome}>
          <CheckCircle2 size={15} />
          Record outcome
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No switch execution outcome record has been recorded.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.handoffPackageId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for switch outcome review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={CheckCircle2} label="Result" value={latest.operatorResultReference || "missing"} passed={Boolean(latest.operatorResultReference)} />
            <CheckLine icon={ShieldCheck} label="Validation" value={latest.postSwitchValidationReference || "missing"} passed={Boolean(latest.postSwitchValidationReference)} />
            <CheckLine icon={RefreshCw} label="Rollback" value={latest.rollbackDecisionReference || "missing"} passed={Boolean(latest.rollbackDecisionReference)} />
            <CheckLine icon={LockKeyhole} label="Switch" value="Outcome only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Switch outcome evidence</strong>
            <span>Incident bridge: {latest.incidentBridgeLogReference || "missing"}</span>
            <span>Audit sign-off: {latest.auditSignOffReference || "missing"}</span>
            <span>Controlled request: {latest.controlledSwitchRequestId}</span>
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

function SwitchClosureRetentionPackagePanel({
  packages,
  prepareSwitchClosureRetentionPackage,
}: {
  packages: SwitchClosureRetentionPackage[];
  prepareSwitchClosureRetentionPackage: () => void;
}) {
  const latest = packages[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Archive size={18} />
        <div>
          <strong>Switch closure retention package</strong>
          <span>Closes out retained evidence, lessons learned, rollback timer closure, and final audit retention.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareSwitchClosureRetentionPackage}>
          <Archive size={15} />
          Prepare closure package
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No switch closure retention package has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.outcomeRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for switch closure review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Owner" value={latest.closureOwner || "missing"} passed={Boolean(latest.closureOwner)} />
            <CheckLine icon={Archive} label="Manifest" value={latest.retainedEvidenceManifestReference || "missing"} passed={Boolean(latest.retainedEvidenceManifestReference)} />
            <CheckLine icon={ScrollText} label="Lessons" value={latest.lessonsLearnedReference || "missing"} passed={Boolean(latest.lessonsLearnedReference)} />
            <CheckLine icon={LockKeyhole} label="Switch" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Switch closure evidence</strong>
            <span>Rollback closure: {latest.rollbackTimerClosureReference || "missing"}</span>
            <span>Final retention: {latest.finalAuditRetentionConfirmation || "missing"}</span>
            <span>Outcome record: {latest.outcomeRecordId}</span>
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

function AdapterPromotionReadinessDossierPanel({
  dossiers,
  prepareAdapterPromotionReadinessDossier,
}: {
  dossiers: AdapterPromotionReadinessDossier[];
  prepareAdapterPromotionReadinessDossier: () => void;
}) {
  const latest = dossiers[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Adapter promotion readiness dossier</strong>
          <span>Assembles retained switch evidence, monitoring, rollback drill, and security acceptance.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareAdapterPromotionReadinessDossier}>
          <ShieldCheck size={15} />
          Prepare promotion dossier
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No adapter promotion readiness dossier has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.closurePackageId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for adapter promotion review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Owner" value={latest.promotionOwner || "missing"} passed={Boolean(latest.promotionOwner)} />
            <CheckLine icon={Archive} label="Evidence" value={latest.retainedSwitchEvidenceReference || "missing"} passed={Boolean(latest.retainedSwitchEvidenceReference)} />
            <CheckLine icon={Gauge} label="Monitoring" value={latest.monitoringPlanReference || "missing"} passed={Boolean(latest.monitoringPlanReference)} />
            <CheckLine icon={LockKeyhole} label="Promotion" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Adapter promotion evidence</strong>
            <span>Rollback drill: {latest.rollbackDrillConfirmation || "missing"}</span>
            <span>Security acceptance: {latest.securityAcceptanceReference || "missing"}</span>
            <span>Closure package: {latest.closurePackageId}</span>
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

function ProductionAdapterAuthorizationPacketPanel({
  packets,
  prepareProductionAdapterAuthorizationPacket,
}: {
  packets: ProductionAdapterAuthorizationPacket[];
  prepareProductionAdapterAuthorizationPacket: () => void;
}) {
  const latest = packets[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production adapter authorization packet</strong>
          <span>Links production approval, change ticket, release window, rollback, and compliance evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareProductionAdapterAuthorizationPacket}>
          <ScrollText size={15} />
          Prepare authorization packet
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production adapter authorization packet has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.promotionDossierId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production adapter authorization review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Approver" value={latest.productionApprover || "missing"} passed={Boolean(latest.productionApprover)} />
            <CheckLine icon={ScrollText} label="Change" value={latest.changeTicketReference || "missing"} passed={Boolean(latest.changeTicketReference)} />
            <CheckLine icon={Archive} label="Window" value={latest.releaseWindowReference || "missing"} passed={Boolean(latest.releaseWindowReference)} />
            <CheckLine icon={LockKeyhole} label="Authorization" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Production authorization evidence</strong>
            <span>Emergency rollback: {latest.emergencyRollbackAuthorization || "missing"}</span>
            <span>Compliance acceptance: {latest.complianceAcceptanceReference || "missing"}</span>
            <span>Closure package: {latest.closurePackageId}</span>
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

function ProductionChangeFreezeRecordPanel({
  records,
  recordProductionChangeFreeze,
}: {
  records: ProductionChangeFreezeRecord[];
  recordProductionChangeFreeze: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production change freeze record</strong>
          <span>Freezes production change evidence before any external CAB or change process can promote adapters.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionChangeFreeze}>
          <Archive size={15} />
          Record change freeze
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production change freeze record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.authorizationPacketId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production change freeze review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Owner" value={latest.freezeOwner || "missing"} passed={Boolean(latest.freezeOwner)} />
            <CheckLine icon={Archive} label="Window" value={latest.freezeWindowReference || "missing"} passed={Boolean(latest.freezeWindowReference)} />
            <CheckLine icon={ScrollText} label="Notify" value={latest.stakeholderNotificationReference || "missing"} passed={Boolean(latest.stakeholderNotificationReference)} />
            <CheckLine icon={LockKeyhole} label="Freeze" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Production freeze evidence</strong>
            <span>Rollback standby: {latest.rollbackStandbyReference || "missing"}</span>
            <span>No-change exception plan: {latest.noChangeExceptionPlanReference || "missing"}</span>
            <span>Authorization packet: {latest.authorizationPacketId}</span>
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

function ProductionCabHandoffPacketPanel({
  packets,
  prepareProductionCabHandoffPacket,
}: {
  packets: ProductionCabHandoffPacket[];
  prepareProductionCabHandoffPacket: () => void;
}) {
  const latest = packets[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production CAB handoff packet</strong>
          <span>Packages CAB agenda, risk acceptance, rollback representation, and final go/no-go evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={prepareProductionCabHandoffPacket}>
          <ScrollText size={15} />
          Prepare CAB handoff
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production CAB handoff packet has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.freezeRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production CAB handoff review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="CAB owner" value={latest.cabOwner || "missing"} passed={Boolean(latest.cabOwner)} />
            <CheckLine icon={ScrollText} label="Agenda" value={latest.cabAgendaReference || "missing"} passed={Boolean(latest.cabAgendaReference)} />
            <CheckLine icon={Archive} label="Risk" value={latest.riskAcceptanceReference || "missing"} passed={Boolean(latest.riskAcceptanceReference)} />
            <CheckLine icon={LockKeyhole} label="Handoff" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>CAB handoff evidence</strong>
            <span>Rollback representation: {latest.rollbackRepresentationReference || "missing"}</span>
            <span>Final go/no-go agenda: {latest.finalGoNoGoAgendaReference || "missing"}</span>
            <span>Freeze record: {latest.freezeRecordId}</span>
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

function ProductionCabDecisionRecordPanel({
  records,
  recordProductionCabDecision,
}: {
  records: ProductionCabDecisionRecord[];
  recordProductionCabDecision: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production CAB decision record</strong>
          <span>Captures the external CAB decision, conditions, rollback approval, and decision minutes.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionCabDecision}>
          <CheckCircle2 size={15} />
          Record CAB decision
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production CAB decision record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.cabHandoffPacketId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production CAB decision review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={CheckCircle2} label="Decision" value={latest.cabDecision} passed={latest.cabDecision === "Approved with conditions"} />
            <CheckLine icon={UserRound} label="Authority" value={latest.decisionAuthority || "missing"} passed={Boolean(latest.decisionAuthority)} />
            <CheckLine icon={ScrollText} label="Conditions" value={latest.conditionListReference || "missing"} passed={Boolean(latest.conditionListReference)} />
            <CheckLine icon={LockKeyhole} label="Decision" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>CAB decision evidence</strong>
            <span>Rollback approval: {latest.rollbackApprovalReference || "missing"}</span>
            <span>Decision minutes: {latest.decisionMinutesReference || "missing"}</span>
            <span>CAB handoff packet: {latest.cabHandoffPacketId}</span>
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

function ProductionImplementationHoldRecordPanel({
  records,
  recordProductionImplementationHold,
}: {
  records: ProductionImplementationHoldRecord[];
  recordProductionImplementationHold: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production implementation hold record</strong>
          <span>Captures implementation ownership, hold window, condition acceptance, rollback owner, and freeze acknowledgment.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionImplementationHold}>
          <Archive size={15} />
          Record implementation hold
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production implementation hold record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.cabDecisionRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production implementation hold review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Owner" value={latest.implementationOwner || "missing"} passed={Boolean(latest.implementationOwner)} />
            <CheckLine icon={Archive} label="Window" value={latest.holdWindowReference || "missing"} passed={Boolean(latest.holdWindowReference)} />
            <CheckLine icon={ScrollText} label="Conditions" value={latest.conditionAcceptanceReference || "missing"} passed={Boolean(latest.conditionAcceptanceReference)} />
            <CheckLine icon={LockKeyhole} label="Hold" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Implementation hold evidence</strong>
            <span>Rollback implementation owner: {latest.rollbackImplementationOwner || "missing"}</span>
            <span>Release freeze acknowledgment: {latest.releaseFreezeAcknowledgmentReference || "missing"}</span>
            <span>CAB decision record: {latest.cabDecisionRecordId}</span>
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

function ProductionOperatorAssignmentRecordPanel({
  records,
  recordProductionOperatorAssignment,
}: {
  records: ProductionOperatorAssignmentRecord[];
  recordProductionOperatorAssignment: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production operator assignment record</strong>
          <span>Captures primary, secondary, rollback, execution channel, and privileged access evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionOperatorAssignment}>
          <UserRound size={15} />
          Record operator assignment
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production operator assignment record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.implementationHoldRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production operator assignment review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Primary" value={latest.primaryOperator || "missing"} passed={Boolean(latest.primaryOperator)} />
            <CheckLine icon={UserRound} label="Secondary" value={latest.secondaryOperator || "missing"} passed={Boolean(latest.secondaryOperator)} />
            <CheckLine icon={ScrollText} label="Channel" value={latest.executionChannelReference || "missing"} passed={Boolean(latest.executionChannelReference)} />
            <CheckLine icon={LockKeyhole} label="Assignment" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Operator assignment evidence</strong>
            <span>Rollback operator: {latest.rollbackOperator || "missing"}</span>
            <span>Privileged access: {latest.privilegedAccessConfirmationReference || "missing"}</span>
            <span>Implementation hold: {latest.implementationHoldRecordId}</span>
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

function ProductionExecutionReadinessRecordPanel({
  records,
  recordProductionExecutionReadiness,
}: {
  records: ProductionExecutionReadinessRecord[];
  recordProductionExecutionReadiness: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution readiness record</strong>
          <span>Captures execution owner, pre-execution checklist, rollback bridge, monitoring observer, and implementation timer evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionReadiness}>
          <Play size={15} />
          Record execution readiness
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution readiness record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.operatorAssignmentRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution readiness review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Execution owner" value={latest.executionOwner || "missing"} passed={Boolean(latest.executionOwner)} />
            <CheckLine icon={ScrollText} label="Checklist" value={latest.preExecutionChecklistReference || "missing"} passed={Boolean(latest.preExecutionChecklistReference)} />
            <CheckLine icon={Network} label="Rollback bridge" value={latest.rollbackBridgeReference || "missing"} passed={Boolean(latest.rollbackBridgeReference)} />
            <CheckLine icon={LockKeyhole} label="Execution" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution readiness evidence</strong>
            <span>Monitoring observer: {latest.monitoringObserver || "missing"}</span>
            <span>Implementation timer: {latest.implementationTimerReference || "missing"}</span>
            <span>Operator assignment: {latest.operatorAssignmentRecordId}</span>
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

function ProductionExecutionAuthorizationRecordPanel({
  records,
  recordProductionExecutionAuthorization,
}: {
  records: ProductionExecutionAuthorizationRecord[];
  recordProductionExecutionAuthorization: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution authorization record</strong>
          <span>Captures final authority, go/no-go decision, rollback bridge, monitoring bridge, and emergency stop evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionAuthorization}>
          <ShieldCheck size={15} />
          Record execution authorization
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution authorization record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.executionReadinessRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution authorization review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Authority" value={latest.authorizationAuthority || "missing"} passed={Boolean(latest.authorizationAuthority)} />
            <CheckLine icon={CheckCircle2} label="Go/no-go" value={latest.finalGoNoGoDecision} passed={latest.finalGoNoGoDecision === "Approved"} />
            <CheckLine icon={Network} label="Rollback bridge" value={latest.rollbackBridgeConfirmationReference || "missing"} passed={Boolean(latest.rollbackBridgeConfirmationReference)} />
            <CheckLine icon={LockKeyhole} label="Authorization" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution authorization evidence</strong>
            <span>Monitoring bridge: {latest.monitoringBridgeConfirmationReference || "missing"}</span>
            <span>Emergency stop authority: {latest.emergencyStopAuthority || "missing"}</span>
            <span>Execution readiness: {latest.executionReadinessRecordId}</span>
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

function ProductionChangeTicketLockRecordPanel({
  records,
  recordProductionChangeTicketLock,
}: {
  records: ProductionChangeTicketLockRecord[];
  recordProductionChangeTicketLock: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production change ticket lock record</strong>
          <span>Captures locked change ticket, release window, approver roster, rollback bridge, and monitoring bridge evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionChangeTicketLock}>
          <LockKeyhole size={15} />
          Record change ticket lock
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production change ticket lock record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.executionAuthorizationRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production change ticket lock review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ScrollText} label="Ticket lock" value={latest.changeTicketLockReference || "missing"} passed={Boolean(latest.changeTicketLockReference)} />
            <CheckLine icon={Archive} label="Window lock" value={latest.releaseWindowLockReference || "missing"} passed={Boolean(latest.releaseWindowLockReference)} />
            <CheckLine icon={UserRound} label="Roster lock" value={latest.approverRosterLockReference || "missing"} passed={Boolean(latest.approverRosterLockReference)} />
            <CheckLine icon={LockKeyhole} label="Lock" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Change ticket lock evidence</strong>
            <span>Rollback bridge lock: {latest.rollbackBridgeLockReference || "missing"}</span>
            <span>Monitoring bridge lock: {latest.monitoringBridgeLockReference || "missing"}</span>
            <span>Execution authorization: {latest.executionAuthorizationRecordId}</span>
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

function ProductionFinalExecutionPacketRecordPanel({
  records,
  recordProductionFinalExecutionPacket,
}: {
  records: ProductionFinalExecutionPacketRecord[];
  recordProductionFinalExecutionPacket: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production final execution packet record</strong>
          <span>Captures final packet manifest, run sheet, communications proof, observation window, and rollback standby evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionFinalExecutionPacket}>
          <Archive size={15} />
          Record final packet
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production final execution packet record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.changeTicketLockRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production final execution packet review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ScrollText} label="Manifest" value={latest.finalPacketManifestReference || "missing"} passed={Boolean(latest.finalPacketManifestReference)} />
            <CheckLine icon={Archive} label="Run sheet" value={latest.operatorRunSheetReference || "missing"} passed={Boolean(latest.operatorRunSheetReference)} />
            <CheckLine icon={Network} label="Comms proof" value={latest.communicationsProofReference || "missing"} passed={Boolean(latest.communicationsProofReference)} />
            <CheckLine icon={LockKeyhole} label="Packet" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Final execution packet evidence</strong>
            <span>Observation window: {latest.observationWindowReference || "missing"}</span>
            <span>Rollback standby: {latest.finalRollbackStandbyConfirmation || "missing"}</span>
            <span>Change ticket lock: {latest.changeTicketLockRecordId}</span>
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

function ProductionExecutionHoldPointRecordPanel({
  records,
  recordProductionExecutionHoldPoint,
}: {
  records: ProductionExecutionHoldPointRecord[];
  recordProductionExecutionHoldPoint: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution hold-point record</strong>
          <span>Captures the final hold-point owner, stop/go checkpoint, rollback timer, monitoring readiness, and incident bridge evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionHoldPoint}>
          <LockKeyhole size={15} />
          Record hold-point
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution hold-point record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.finalExecutionPacketRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution hold-point review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Owner" value={latest.holdPointOwner || "missing"} passed={Boolean(latest.holdPointOwner)} />
            <CheckLine icon={CheckCircle2} label="Stop/go" value={latest.finalStopGoCheckpointReference || "missing"} passed={Boolean(latest.finalStopGoCheckpointReference)} />
            <CheckLine icon={Gauge} label="Rollback timer" value={latest.rollbackTimerCheckpointReference || "missing"} passed={Boolean(latest.rollbackTimerCheckpointReference)} />
            <CheckLine icon={LockKeyhole} label="Hold-point" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution hold-point evidence</strong>
            <span>Monitoring readiness: {latest.monitoringReadinessCheckpointReference || "missing"}</span>
            <span>Incident bridge: {latest.incidentBridgeCheckpointReference || "missing"}</span>
            <span>Final packet: {latest.finalExecutionPacketRecordId}</span>
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

function ProductionExecutionOutcomeAuthorizationRecordPanel({
  records,
  recordProductionExecutionOutcomeAuthorization,
}: {
  records: ProductionExecutionOutcomeAuthorizationRecord[];
  recordProductionExecutionOutcomeAuthorization: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution outcome authorization record</strong>
          <span>Captures the expected result envelope, rollback decision rule, incident declaration rule, and evidence capture rule before outcome handling.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionOutcomeAuthorization}>
          <ScrollText size={15} />
          Record outcome authorization
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution outcome authorization record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.executionHoldPointRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution outcome authorization review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Authority" value={latest.outcomeAuthority || "missing"} passed={Boolean(latest.outcomeAuthority)} />
            <CheckLine icon={Archive} label="Expected result" value={latest.expectedResultEnvelopeReference || "missing"} passed={Boolean(latest.expectedResultEnvelopeReference)} />
            <CheckLine icon={Gauge} label="Rollback rule" value={latest.rollbackDecisionRuleReference || "missing"} passed={Boolean(latest.rollbackDecisionRuleReference)} />
            <CheckLine icon={LockKeyhole} label="Authorization" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution outcome authorization evidence</strong>
            <span>Incident rule: {latest.incidentDeclarationRuleReference || "missing"}</span>
            <span>Evidence capture: {latest.evidenceCaptureRuleReference || "missing"}</span>
            <span>Hold-point: {latest.executionHoldPointRecordId}</span>
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

function ProductionExecutionClosureAuthorizationRecordPanel({
  records,
  recordProductionExecutionClosureAuthorization,
}: {
  records: ProductionExecutionClosureAuthorizationRecord[];
  recordProductionExecutionClosureAuthorization: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution closure authorization record</strong>
          <span>Captures closure authority, success criteria, rollback closure criteria, incident closure criteria, and audit capture confirmation before execution closure.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionClosureAuthorization}>
          <Archive size={15} />
          Record closure authorization
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution closure authorization record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.outcomeAuthorizationRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution closure authorization review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Authority" value={latest.closureAuthority || "missing"} passed={Boolean(latest.closureAuthority)} />
            <CheckLine icon={CheckCircle2} label="Success criteria" value={latest.successCriteriaReference || "missing"} passed={Boolean(latest.successCriteriaReference)} />
            <CheckLine icon={Gauge} label="Rollback closure" value={latest.rollbackClosureCriteriaReference || "missing"} passed={Boolean(latest.rollbackClosureCriteriaReference)} />
            <CheckLine icon={LockKeyhole} label="Closure" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution closure authorization evidence</strong>
            <span>Incident closure: {latest.incidentClosureCriteriaReference || "missing"}</span>
            <span>Audit capture: {latest.auditCaptureConfirmationReference || "missing"}</span>
            <span>Outcome authorization: {latest.outcomeAuthorizationRecordId}</span>
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

function ProductionExecutionClosurePacketRecordPanel({
  records,
  recordProductionExecutionClosurePacket,
}: {
  records: ProductionExecutionClosurePacketRecord[];
  recordProductionExecutionClosurePacket: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution closure packet record</strong>
          <span>Captures the closure packet manifest, evidence bundle, audit export, stakeholder notification, and retention handoff evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionClosurePacket}>
          <Archive size={15} />
          Record closure packet
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution closure packet record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.closureAuthorizationRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution closure packet review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ScrollText} label="Manifest" value={latest.closurePacketManifestReference || "missing"} passed={Boolean(latest.closurePacketManifestReference)} />
            <CheckLine icon={Archive} label="Evidence bundle" value={latest.evidenceBundleReference || "missing"} passed={Boolean(latest.evidenceBundleReference)} />
            <CheckLine icon={CheckCircle2} label="Audit export" value={latest.auditExportReference || "missing"} passed={Boolean(latest.auditExportReference)} />
            <CheckLine icon={LockKeyhole} label="Closure packet" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution closure packet evidence</strong>
            <span>Stakeholder notification: {latest.stakeholderNotificationProofReference || "missing"}</span>
            <span>Retention handoff: {latest.retentionHandoffConfirmationReference || "missing"}</span>
            <span>Closure authorization: {latest.closureAuthorizationRecordId}</span>
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

function ProductionExecutionArchivalHandoffRecordPanel({
  records,
  recordProductionExecutionArchivalHandoff,
}: {
  records: ProductionExecutionArchivalHandoffRecord[];
  recordProductionExecutionArchivalHandoff: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution archival handoff record</strong>
          <span>Captures archive owner, retention policy, immutable storage proof, audit index, and retrieval test evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionArchivalHandoff}>
          <Archive size={15} />
          Record archival handoff
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution archival handoff record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.closurePacketRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution archival handoff review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Archive owner" value={latest.archiveOwner || "missing"} passed={Boolean(latest.archiveOwner)} />
            <CheckLine icon={ScrollText} label="Retention policy" value={latest.retentionPolicyReference || "missing"} passed={Boolean(latest.retentionPolicyReference)} />
            <CheckLine icon={Archive} label="Immutable proof" value={latest.immutableStorageProofReference || "missing"} passed={Boolean(latest.immutableStorageProofReference)} />
            <CheckLine icon={LockKeyhole} label="Archival handoff" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution archival handoff evidence</strong>
            <span>Audit index: {latest.auditIndexReference || "missing"}</span>
            <span>Retrieval test: {latest.retrievalTestReference || "missing"}</span>
            <span>Closure packet: {latest.closurePacketRecordId}</span>
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

function ProductionExecutionRetentionAttestationRecordPanel({
  records,
  recordProductionExecutionRetentionAttestation,
}: {
  records: ProductionExecutionRetentionAttestationRecord[];
  recordProductionExecutionRetentionAttestation: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution retention attestation record</strong>
          <span>Captures retention owner, retention schedule proof, legal hold check, deletion exception register, and retrieval SLA proof.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionRetentionAttestation}>
          <Archive size={15} />
          Record retention attestation
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution retention attestation record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.archivalHandoffRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution retention attestation review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Retention owner" value={latest.retentionOwner || "missing"} passed={Boolean(latest.retentionOwner)} />
            <CheckLine icon={ScrollText} label="Schedule proof" value={latest.retentionScheduleProofReference || "missing"} passed={Boolean(latest.retentionScheduleProofReference)} />
            <CheckLine icon={ShieldCheck} label="Legal hold" value={latest.legalHoldCheckReference || "missing"} passed={Boolean(latest.legalHoldCheckReference)} />
            <CheckLine icon={LockKeyhole} label="Retention" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution retention attestation evidence</strong>
            <span>Deletion exceptions: {latest.deletionExceptionRegisterReference || "missing"}</span>
            <span>Retrieval SLA: {latest.retrievalSlaProofReference || "missing"}</span>
            <span>Archival handoff: {latest.archivalHandoffRecordId}</span>
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

function ProductionExecutionFinalArchiveCertificationRecordPanel({
  records,
  recordProductionExecutionFinalArchiveCertification,
}: {
  records: ProductionExecutionFinalArchiveCertificationRecord[];
  recordProductionExecutionFinalArchiveCertification: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution final archive certification record</strong>
          <span>Captures final archive manifest, retention lock proof, compliance sign-off, and retrieval witness proof.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionFinalArchiveCertification}>
          <Archive size={15} />
          Record final archive certification
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution final archive certification record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.retentionAttestationRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution final archive certification review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Certification owner" value={latest.certificationOwner || "missing"} passed={Boolean(latest.certificationOwner)} />
            <CheckLine icon={ScrollText} label="Final archive manifest" value={latest.finalArchiveManifestReference || "missing"} passed={Boolean(latest.finalArchiveManifestReference)} />
            <CheckLine icon={LockKeyhole} label="Retention lock proof" value={latest.retentionLockProofReference || "missing"} passed={Boolean(latest.retentionLockProofReference)} />
            <CheckLine icon={ShieldCheck} label="Archive certification" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution final archive certification evidence</strong>
            <span>Compliance sign-off: {latest.complianceSignOffReference || "missing"}</span>
            <span>Retrieval witness: {latest.retrievalWitnessProofReference || "missing"}</span>
            <span>Retention attestation: {latest.retentionAttestationRecordId}</span>
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

function ProductionExecutionCompletionDossierRecordPanel({
  records,
  recordProductionExecutionCompletionDossier,
}: {
  records: ProductionExecutionCompletionDossierRecord[];
  recordProductionExecutionCompletionDossier: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution completion dossier record</strong>
          <span>Captures final evidence index, audit export reference, operations acceptance, and compliance closure proof.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionCompletionDossier}>
          <Archive size={15} />
          Record completion dossier
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution completion dossier record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.finalArchiveCertificationRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution completion dossier review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Dossier owner" value={latest.dossierOwner || "missing"} passed={Boolean(latest.dossierOwner)} />
            <CheckLine icon={ScrollText} label="Evidence index" value={latest.finalEvidenceIndexReference || "missing"} passed={Boolean(latest.finalEvidenceIndexReference)} />
            <CheckLine icon={Archive} label="Audit export" value={latest.auditExportReference || "missing"} passed={Boolean(latest.auditExportReference)} />
            <CheckLine icon={ShieldCheck} label="Completion dossier" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution completion dossier evidence</strong>
            <span>Operations acceptance: {latest.operationsAcceptanceReference || "missing"}</span>
            <span>Compliance closure: {latest.complianceClosureProofReference || "missing"}</span>
            <span>Final archive certification: {latest.finalArchiveCertificationRecordId}</span>
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

function ProductionExecutionOperationsHandoverRecordPanel({
  records,
  recordProductionExecutionOperationsHandover,
}: {
  records: ProductionExecutionOperationsHandoverRecord[];
  recordProductionExecutionOperationsHandover: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution operations handover record</strong>
          <span>Captures support model, monitoring handover proof, escalation route, and service desk acceptance.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionOperationsHandover}>
          <Archive size={15} />
          Record operations handover
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution operations handover record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.completionDossierRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution operations handover review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Operations owner" value={latest.operationsOwner || "missing"} passed={Boolean(latest.operationsOwner)} />
            <CheckLine icon={ScrollText} label="Support model" value={latest.supportModelReference || "missing"} passed={Boolean(latest.supportModelReference)} />
            <CheckLine icon={Gauge} label="Monitoring handover" value={latest.monitoringHandoverProofReference || "missing"} passed={Boolean(latest.monitoringHandoverProofReference)} />
            <CheckLine icon={ShieldCheck} label="Operations handover" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution operations handover evidence</strong>
            <span>Escalation route: {latest.escalationRouteReference || "missing"}</span>
            <span>Service desk acceptance: {latest.serviceDeskAcceptanceReference || "missing"}</span>
            <span>Completion dossier: {latest.completionDossierRecordId}</span>
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

function ProductionExecutionSupportReadinessRecordPanel({
  records,
  recordProductionExecutionSupportReadiness,
}: {
  records: ProductionExecutionSupportReadinessRecord[];
  recordProductionExecutionSupportReadiness: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution support readiness record</strong>
          <span>Captures runbook acceptance, alert routing proof, incident process, and knowledge base publication.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionSupportReadiness}>
          <Archive size={15} />
          Record support readiness
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution support readiness record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.operationsHandoverRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution support readiness review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Support owner" value={latest.supportOwner || "missing"} passed={Boolean(latest.supportOwner)} />
            <CheckLine icon={ScrollText} label="Runbook acceptance" value={latest.runbookAcceptanceReference || "missing"} passed={Boolean(latest.runbookAcceptanceReference)} />
            <CheckLine icon={Gauge} label="Alert routing" value={latest.alertRoutingProofReference || "missing"} passed={Boolean(latest.alertRoutingProofReference)} />
            <CheckLine icon={ShieldCheck} label="Support readiness" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution support readiness evidence</strong>
            <span>Incident process: {latest.incidentProcessReference || "missing"}</span>
            <span>Knowledge base: {latest.knowledgeBasePublicationReference || "missing"}</span>
            <span>Operations handover: {latest.operationsHandoverRecordId}</span>
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

function ProductionExecutionServiceAcceptanceRecordPanel({
  records,
  recordProductionExecutionServiceAcceptance,
}: {
  records: ProductionExecutionServiceAcceptanceRecord[];
  recordProductionExecutionServiceAcceptance: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution service acceptance record</strong>
          <span>Captures acceptance criteria, operational SLO, support sign-off, and final customer notification.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionServiceAcceptance}>
          <Archive size={15} />
          Record service acceptance
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution service acceptance record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.supportReadinessRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution service acceptance review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Service owner" value={latest.serviceOwner || "missing"} passed={Boolean(latest.serviceOwner)} />
            <CheckLine icon={ScrollText} label="Acceptance criteria" value={latest.acceptanceCriteriaReference || "missing"} passed={Boolean(latest.acceptanceCriteriaReference)} />
            <CheckLine icon={Gauge} label="Operational SLO" value={latest.operationalSloReference || "missing"} passed={Boolean(latest.operationalSloReference)} />
            <CheckLine icon={ShieldCheck} label="Service acceptance" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution service acceptance evidence</strong>
            <span>Support sign-off: {latest.supportSignOffReference || "missing"}</span>
            <span>Customer notification: {latest.finalCustomerNotificationReference || "missing"}</span>
            <span>Support readiness: {latest.supportReadinessRecordId}</span>
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

function ProductionExecutionFinalTurnoverRecordPanel({
  records,
  recordProductionExecutionFinalTurnover,
}: {
  records: ProductionExecutionFinalTurnoverRecord[];
  recordProductionExecutionFinalTurnover: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution final turnover record</strong>
          <span>Captures final service catalog, ownership transfer, executive closure, and PIR schedule.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionFinalTurnover}>
          <Archive size={15} />
          Record final turnover
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution final turnover record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.serviceAcceptanceRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution final turnover review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Turnover owner" value={latest.turnoverOwner || "missing"} passed={Boolean(latest.turnoverOwner)} />
            <CheckLine icon={ScrollText} label="Service catalog" value={latest.finalServiceCatalogReference || "missing"} passed={Boolean(latest.finalServiceCatalogReference)} />
            <CheckLine icon={ShieldCheck} label="Ownership transfer" value={latest.ownershipTransferProofReference || "missing"} passed={Boolean(latest.ownershipTransferProofReference)} />
            <CheckLine icon={Archive} label="Final turnover" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution final turnover evidence</strong>
            <span>Executive closure: {latest.executiveClosureNoteReference || "missing"}</span>
            <span>PIR schedule: {latest.postImplementationReviewScheduleReference || "missing"}</span>
            <span>Service acceptance: {latest.serviceAcceptanceRecordId}</span>
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

function ProductionExecutionOperationalClosureRecordPanel({
  records,
  recordProductionExecutionOperationalClosure,
}: {
  records: ProductionExecutionOperationalClosureRecord[];
  recordProductionExecutionOperationalClosure: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution operational closure record</strong>
          <span>Captures steady-state operations, SLO review, support backlog, and residual-risk acceptance.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionOperationalClosure}>
          <Archive size={15} />
          Record operational closure
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution operational closure record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.finalTurnoverRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution operational closure review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Closure owner" value={latest.closureOwner || "missing"} passed={Boolean(latest.closureOwner)} />
            <CheckLine icon={ScrollText} label="Operating model" value={latest.steadyStateOperatingModelReference || "missing"} passed={Boolean(latest.steadyStateOperatingModelReference)} />
            <CheckLine icon={Gauge} label="SLO review" value={latest.sloReviewProofReference || "missing"} passed={Boolean(latest.sloReviewProofReference)} />
            <CheckLine icon={Archive} label="Operational closure" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution operational closure evidence</strong>
            <span>Support backlog: {latest.supportBacklogHandoffReference || "missing"}</span>
            <span>Residual risk: {latest.residualRiskAcceptanceReference || "missing"}</span>
            <span>Final turnover: {latest.finalTurnoverRecordId}</span>
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

function ProductionExecutionPostImplementationReviewRecordPanel({
  records,
  recordProductionExecutionPostImplementationReview,
}: {
  records: ProductionExecutionPostImplementationReviewRecord[];
  recordProductionExecutionPostImplementationReview: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution post-implementation review record</strong>
          <span>Captures PIR minutes, incident review, cost variance, and improvement backlog evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionPostImplementationReview}>
          <Archive size={15} />
          Record post-implementation review
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution post-implementation review record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.operationalClosureRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution post-implementation review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Review owner" value={latest.reviewOwner || "missing"} passed={Boolean(latest.reviewOwner)} />
            <CheckLine icon={ScrollText} label="PIR minutes" value={latest.pirMinutesReference || "missing"} passed={Boolean(latest.pirMinutesReference)} />
            <CheckLine icon={ShieldCheck} label="Incident review" value={latest.incidentReviewProofReference || "missing"} passed={Boolean(latest.incidentReviewProofReference)} />
            <CheckLine icon={Archive} label="PIR record" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution post-implementation review evidence</strong>
            <span>Cost variance: {latest.costVarianceReviewReference || "missing"}</span>
            <span>Improvement backlog: {latest.improvementBacklogReference || "missing"}</span>
            <span>Operational closure: {latest.operationalClosureRecordId}</span>
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

function ProductionExecutionImprovementClosureRecordPanel({
  records,
  recordProductionExecutionImprovementClosure,
}: {
  records: ProductionExecutionImprovementClosureRecord[];
  recordProductionExecutionImprovementClosure: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution improvement closure record</strong>
          <span>Captures action register, accepted deferrals, lessons learned, and next-cycle ownership.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionImprovementClosure}>
          <Archive size={15} />
          Record improvement closure
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution improvement closure record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.postImplementationReviewRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution improvement closure review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Improvement owner" value={latest.improvementOwner || "missing"} passed={Boolean(latest.improvementOwner)} />
            <CheckLine icon={ScrollText} label="Action register" value={latest.actionRegisterReference || "missing"} passed={Boolean(latest.actionRegisterReference)} />
            <CheckLine icon={ShieldCheck} label="Accepted deferrals" value={latest.acceptedDeferralsReference || "missing"} passed={Boolean(latest.acceptedDeferralsReference)} />
            <CheckLine icon={Archive} label="Improvement closure" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution improvement closure evidence</strong>
            <span>Lessons learned: {latest.lessonsLearnedPublicationReference || "missing"}</span>
            <span>Next-cycle owner: {latest.nextCycleOwner || "missing"}</span>
            <span>Post-implementation review: {latest.postImplementationReviewRecordId}</span>
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

function ProductionExecutionFinalAcceptanceArchiveRecordPanel({
  records,
  recordProductionExecutionFinalAcceptanceArchive,
}: {
  records: ProductionExecutionFinalAcceptanceArchiveRecord[];
  recordProductionExecutionFinalAcceptanceArchive: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution final acceptance archive record</strong>
          <span>Captures archive index, final evidence checksum, stakeholder receipt, and retrieval ownership.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionFinalAcceptanceArchive}>
          <Archive size={15} />
          Record final acceptance archive
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution final acceptance archive record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.improvementClosureRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution final acceptance archive review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Archive owner" value={latest.archiveOwner || "missing"} passed={Boolean(latest.archiveOwner)} />
            <CheckLine icon={ScrollText} label="Archive index" value={latest.acceptanceArchiveIndexReference || "missing"} passed={Boolean(latest.acceptanceArchiveIndexReference)} />
            <CheckLine icon={ShieldCheck} label="Evidence checksum" value={latest.finalEvidenceChecksumReference || "missing"} passed={Boolean(latest.finalEvidenceChecksumReference)} />
            <CheckLine icon={Archive} label="Acceptance archive" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution final acceptance archive evidence</strong>
            <span>Stakeholder receipt: {latest.stakeholderReceiptProofReference || "missing"}</span>
            <span>Retrieval owner: {latest.retrievalOwner || "missing"}</span>
            <span>Improvement closure: {latest.improvementClosureRecordId}</span>
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

function ProductionExecutionReadinessArchiveHandoffRecordPanel({
  records,
  recordProductionExecutionReadinessArchiveHandoff,
}: {
  records: ProductionExecutionReadinessArchiveHandoffRecord[];
  recordProductionExecutionReadinessArchiveHandoff: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution readiness archive handoff record</strong>
          <span>Captures archive repository, retrieval runbook, access review, and custody receipt handoff evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionReadinessArchiveHandoff}>
          <Archive size={15} />
          Record readiness archive handoff
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution readiness archive handoff record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.finalAcceptanceArchiveRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution readiness archive handoff review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Handoff owner" value={latest.handoffOwner || "missing"} passed={Boolean(latest.handoffOwner)} />
            <CheckLine icon={Archive} label="Archive repository" value={latest.archiveRepositoryReference || "missing"} passed={Boolean(latest.archiveRepositoryReference)} />
            <CheckLine icon={ScrollText} label="Retrieval runbook" value={latest.retrievalRunbookReference || "missing"} passed={Boolean(latest.retrievalRunbookReference)} />
            <CheckLine icon={ShieldCheck} label="Archive handoff" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution readiness archive handoff evidence</strong>
            <span>Archive access review: {latest.archiveAccessReviewReference || "missing"}</span>
            <span>Archive custody receipt: {latest.archiveCustodyReceiptReference || "missing"}</span>
            <span>Final acceptance archive: {latest.finalAcceptanceArchiveRecordId}</span>
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

function ProductionExecutionArchiveRetrievalValidationRecordPanel({
  records,
  recordProductionExecutionArchiveRetrievalValidation,
}: {
  records: ProductionExecutionArchiveRetrievalValidationRecord[];
  recordProductionExecutionArchiveRetrievalValidation: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution archive retrieval validation record</strong>
          <span>Captures sample retrieval, checksum verification, access audit, and recovery SLA witness evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionArchiveRetrievalValidation}>
          <Archive size={15} />
          Record archive retrieval validation
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution archive retrieval validation record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.readinessArchiveHandoffRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution archive retrieval validation review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Retrieval operator" value={latest.retrievalOperator || "missing"} passed={Boolean(latest.retrievalOperator)} />
            <CheckLine icon={Archive} label="Sample retrieval" value={latest.sampleRetrievalProofReference || "missing"} passed={Boolean(latest.sampleRetrievalProofReference)} />
            <CheckLine icon={ShieldCheck} label="Checksum verification" value={latest.checksumVerificationReference || "missing"} passed={Boolean(latest.checksumVerificationReference)} />
            <CheckLine icon={LockKeyhole} label="Retrieval validation" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution archive retrieval validation evidence</strong>
            <span>Access audit: {latest.accessAuditReference || "missing"}</span>
            <span>Recovery SLA witness: {latest.recoverySlaWitnessReference || "missing"}</span>
            <span>Readiness archive handoff: {latest.readinessArchiveHandoffRecordId}</span>
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

function ProductionExecutionArchiveRecoveryDrillRecordPanel({
  records,
  recordProductionExecutionArchiveRecoveryDrill,
}: {
  records: ProductionExecutionArchiveRecoveryDrillRecord[];
  recordProductionExecutionArchiveRecoveryDrill: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution archive recovery drill record</strong>
          <span>Captures recovery scenario, elapsed recovery proof, restored artifact review, and drill sign-off evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionArchiveRecoveryDrill}>
          <Archive size={15} />
          Record archive recovery drill
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution archive recovery drill record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.archiveRetrievalValidationRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution archive recovery drill review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Drill owner" value={latest.drillOwner || "missing"} passed={Boolean(latest.drillOwner)} />
            <CheckLine icon={ScrollText} label="Recovery scenario" value={latest.recoveryScenarioReference || "missing"} passed={Boolean(latest.recoveryScenarioReference)} />
            <CheckLine icon={Archive} label="Elapsed recovery" value={latest.elapsedRecoveryProofReference || "missing"} passed={Boolean(latest.elapsedRecoveryProofReference)} />
            <CheckLine icon={ShieldCheck} label="Recovery drill" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution archive recovery drill evidence</strong>
            <span>Restored artifact review: {latest.restoredArtifactReviewReference || "missing"}</span>
            <span>Drill sign-off: {latest.drillSignOffReference || "missing"}</span>
            <span>Archive retrieval validation: {latest.archiveRetrievalValidationRecordId}</span>
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

function ProductionExecutionArchiveRecoveryAcceptanceRecordPanel({
  records,
  recordProductionExecutionArchiveRecoveryAcceptance,
}: {
  records: ProductionExecutionArchiveRecoveryAcceptanceRecord[];
  recordProductionExecutionArchiveRecoveryAcceptance: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution archive recovery acceptance record</strong>
          <span>Captures recovery evidence packet, RTO/RPO variance, residual risk, and acceptance sign-off evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionArchiveRecoveryAcceptance}>
          <Archive size={15} />
          Record archive recovery acceptance
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution archive recovery acceptance record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.archiveRecoveryDrillRecordId}</span>
            </div>
            <span className={`status ${latest.status === "Ready for production execution archive recovery acceptance review" ? "ready" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Acceptance owner" value={latest.acceptanceOwner || "missing"} passed={Boolean(latest.acceptanceOwner)} />
            <CheckLine icon={Archive} label="Evidence packet" value={latest.recoveryEvidencePacketReference || "missing"} passed={Boolean(latest.recoveryEvidencePacketReference)} />
            <CheckLine icon={ScrollText} label="RTO/RPO variance" value={latest.rtoRpoVarianceReviewReference || "missing"} passed={Boolean(latest.rtoRpoVarianceReviewReference)} />
            <CheckLine icon={ShieldCheck} label="Recovery acceptance" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution archive recovery acceptance evidence</strong>
            <span>Residual recovery risk: {latest.residualRecoveryRiskRegisterReference || "missing"}</span>
            <span>Acceptance sign-off: {latest.acceptanceSignOffReference || "missing"}</span>
            <span>Archive recovery drill: {latest.archiveRecoveryDrillRecordId}</span>
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

function ProductionExecutionArchiveRecoveryClosureRecordPanel({
  records,
  recordProductionExecutionArchiveRecoveryClosure,
}: {
  records: ProductionExecutionArchiveRecoveryClosureRecord[];
  recordProductionExecutionArchiveRecoveryClosure: () => void;
}) {
  const latest = records[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Production execution archive recovery closure record</strong>
          <span>Captures closure packet, follow-up actions, stakeholder notice, and archive recovery closure sign-off evidence.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordProductionExecutionArchiveRecoveryClosure}>
          <Archive size={15} />
          Record archive recovery closure
        </button>
      </div>
      {!latest ? (
        <p className="emptyState">No production execution archive recovery closure record has been prepared.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.provider}</strong>
              <span>{latest.archiveRecoveryAcceptanceRecordId}</span>
            </div>
            <span
              className={`status ${
                latest.status === "Ready for production execution archive recovery closure review" ? "ready" : "approval"
              }`}
            >
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={UserRound} label="Closure owner" value={latest.closureOwner || "missing"} passed={Boolean(latest.closureOwner)} />
            <CheckLine icon={Archive} label="Closure packet" value={latest.recoveryClosurePacketReference || "missing"} passed={Boolean(latest.recoveryClosurePacketReference)} />
            <CheckLine icon={ScrollText} label="Follow-up actions" value={latest.followUpActionRegisterReference || "missing"} passed={Boolean(latest.followUpActionRegisterReference)} />
            <CheckLine icon={ShieldCheck} label="Recovery closure" value="Evidence only" passed={!latest.provisioningEnabled && !latest.killSwitch.enabled} />
          </div>
          <div className="inventoryEvidence">
            <strong>Execution archive recovery closure evidence</strong>
            <span>Stakeholder closure notice: {latest.stakeholderClosureNoticeReference || "missing"}</span>
            <span>Closure sign-off: {latest.archiveRecoveryClosureSignOffReference || "missing"}</span>
            <span>Archive recovery acceptance: {latest.archiveRecoveryAcceptanceRecordId}</span>
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

function createMockRealAdapterSwitchStateAuditPackage(
  switchReview: ManualRealAdapterSwitchReview,
  actor: string
): RealAdapterSwitchStateAuditPackage {
  const preChangeSnapshotReference = `pre-switch-state-${switchReview.provider.toLowerCase()}.json`;
  const postChangeSnapshotReference = `post-switch-state-${switchReview.provider.toLowerCase()}.json`;
  const reviewerEvidenceReference = `switch-reviewer-evidence-${switchReview.provider.toLowerCase()}.md`;
  const rollbackTimerMinutes = 30;
  const retentionReference = `audit-retention-${switchReview.provider.toLowerCase()}.md`;
  const checks = [
    {
      name: "Switch review ready",
      passed: switchReview.status === "Ready for manual switch change review",
      detail: `${switchReview.id} is ${switchReview.status}.`,
    },
    {
      name: "Pre-change snapshot linked",
      passed: Boolean(preChangeSnapshotReference),
      detail: preChangeSnapshotReference,
    },
    {
      name: "Post-change snapshot linked",
      passed: Boolean(postChangeSnapshotReference),
      detail: postChangeSnapshotReference,
    },
    {
      name: "Reviewer evidence linked",
      passed: Boolean(reviewerEvidenceReference),
      detail: reviewerEvidenceReference,
    },
    {
      name: "Rollback timer set",
      passed: rollbackTimerMinutes >= 15,
      detail: `${rollbackTimerMinutes} minute rollback timer.`,
    },
    {
      name: "Retention reference linked",
      passed: Boolean(retentionReference),
      detail: retentionReference,
    },
    {
      name: "Prototype leaves switch state unchanged",
      passed: !switchReview.provisioningEnabled && !switchReview.killSwitch.enabled,
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
      `Pre-change snapshot: ${preChangeSnapshotReference}.`,
      `Post-change snapshot: ${postChangeSnapshotReference}.`,
      `Reviewer evidence: ${reviewerEvidenceReference}.`,
      `Rollback timer: ${rollbackTimerMinutes} minutes.`,
      `Retention reference: ${retentionReference}.`,
      `Kill switch: ${switchReview.killSwitch.name}=${switchReview.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: switchReview.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockControlledSwitchConfigurationRequest(
  auditPackage: RealAdapterSwitchStateAuditPackage,
  actor: string
): ControlledSwitchConfigurationRequest {
  const operatorConfirmation = `operator-confirmation-${auditPackage.provider.toLowerCase()}.md`;
  const secondReviewerAcceptance = `second-reviewer-acceptance-${auditPackage.provider.toLowerCase()}.md`;
  const finalDryRunProofReference = `final-switch-dry-run-${auditPackage.provider.toLowerCase()}.json`;
  const rollbackTimerMinutes = auditPackage.rollbackTimerMinutes;
  const retentionReference = auditPackage.retentionReference;
  const checks = [
    {
      name: "Switch-state audit package ready",
      passed: auditPackage.status === "Ready for switch-state audit review",
      detail: `${auditPackage.id} is ${auditPackage.status}.`,
    },
    {
      name: "Operator confirmation linked",
      passed: Boolean(operatorConfirmation),
      detail: operatorConfirmation,
    },
    {
      name: "Second reviewer acceptance linked",
      passed: Boolean(secondReviewerAcceptance),
      detail: secondReviewerAcceptance,
    },
    {
      name: "Rollback timer retained",
      passed: rollbackTimerMinutes >= 15,
      detail: `${rollbackTimerMinutes} minute rollback timer.`,
    },
    {
      name: "Final dry-run proof linked",
      passed: Boolean(finalDryRunProofReference),
      detail: finalDryRunProofReference,
    },
    {
      name: "Retention reference linked",
      passed: Boolean(retentionReference),
      detail: retentionReference,
    },
    {
      name: "Prototype remains non-mutating",
      passed: !auditPackage.provisioningEnabled && !auditPackage.killSwitch.enabled,
      detail: `${auditPackage.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-switch-configuration-request-${auditPackage.provider.toLowerCase()}-${Date.now()}`,
    provider: auditPackage.provider,
    auditPackageId: auditPackage.id,
    switchReviewId: auditPackage.switchReviewId,
    activationId: auditPackage.activationId,
    idempotencyKey: auditPackage.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for controlled switch request review" : "Blocked",
    requestedBy: actor,
    operatorConfirmation,
    secondReviewerAcceptance,
    finalDryRunProofReference,
    rollbackTimerMinutes,
    retentionReference,
    checks,
    evidence: [
      `Audit package: ${auditPackage.id}.`,
      `Switch review: ${auditPackage.switchReviewId}.`,
      `Activation: ${auditPackage.activationId}.`,
      `Operator confirmation: ${operatorConfirmation}.`,
      `Second reviewer acceptance: ${secondReviewerAcceptance}.`,
      `Final dry-run proof: ${finalDryRunProofReference}.`,
      `Rollback timer: ${rollbackTimerMinutes} minutes.`,
      `Retention reference: ${retentionReference}.`,
      `Kill switch: ${auditPackage.killSwitch.name}=${auditPackage.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: auditPackage.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockSwitchExecutionHandoffPackage(
  switchRequest: ControlledSwitchConfigurationRequest,
  actor: string
): SwitchExecutionHandoffPackage {
  const operatorRunSheetReference = `operator-run-sheet-${switchRequest.provider.toLowerCase()}.md`;
  const communicationsPlanReference = `communications-plan-${switchRequest.provider.toLowerCase()}.md`;
  const observationWindowReference = `observation-window-${switchRequest.provider.toLowerCase()}.md`;
  const rollbackOwnerAcceptance = `rollback-owner-acceptance-${switchRequest.provider.toLowerCase()}.md`;
  const executionFreezeProofReference = `execution-freeze-proof-${switchRequest.provider.toLowerCase()}.json`;
  const checks = [
    {
      name: "Controlled switch request ready",
      passed: switchRequest.status === "Ready for controlled switch request review",
      detail: `${switchRequest.id} is ${switchRequest.status}.`,
    },
    {
      name: "Operator run sheet linked",
      passed: Boolean(operatorRunSheetReference),
      detail: operatorRunSheetReference,
    },
    {
      name: "Communications plan linked",
      passed: Boolean(communicationsPlanReference),
      detail: communicationsPlanReference,
    },
    {
      name: "Observation window linked",
      passed: Boolean(observationWindowReference),
      detail: observationWindowReference,
    },
    {
      name: "Rollback owner acceptance linked",
      passed: Boolean(rollbackOwnerAcceptance),
      detail: rollbackOwnerAcceptance,
    },
    {
      name: "Execution freeze proof linked",
      passed: Boolean(executionFreezeProofReference),
      detail: executionFreezeProofReference,
    },
    {
      name: "Prototype does not execute switch",
      passed: !switchRequest.provisioningEnabled && !switchRequest.killSwitch.enabled,
      detail: `${switchRequest.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `switch-execution-handoff-package-${switchRequest.provider.toLowerCase()}-${Date.now()}`,
    provider: switchRequest.provider,
    controlledSwitchRequestId: switchRequest.id,
    auditPackageId: switchRequest.auditPackageId,
    switchReviewId: switchRequest.switchReviewId,
    activationId: switchRequest.activationId,
    idempotencyKey: switchRequest.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for switch execution handoff review" : "Blocked",
    requestedBy: actor,
    operatorRunSheetReference,
    communicationsPlanReference,
    observationWindowReference,
    rollbackOwnerAcceptance,
    executionFreezeProofReference,
    checks,
    evidence: [
      `Controlled switch request: ${switchRequest.id}.`,
      `Audit package: ${switchRequest.auditPackageId}.`,
      `Operator run sheet: ${operatorRunSheetReference}.`,
      `Communications plan: ${communicationsPlanReference}.`,
      `Observation window: ${observationWindowReference}.`,
      `Rollback owner acceptance: ${rollbackOwnerAcceptance}.`,
      `Execution freeze proof: ${executionFreezeProofReference}.`,
      `Kill switch: ${switchRequest.killSwitch.name}=${switchRequest.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: switchRequest.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockSwitchExecutionOutcomeRecord(
  handoffPackage: SwitchExecutionHandoffPackage,
  actor: string
): SwitchExecutionOutcomeRecord {
  const operatorResultReference = `operator-result-${handoffPackage.provider.toLowerCase()}.md`;
  const postSwitchValidationReference = `post-switch-validation-${handoffPackage.provider.toLowerCase()}.json`;
  const rollbackDecisionReference = `rollback-decision-${handoffPackage.provider.toLowerCase()}.md`;
  const incidentBridgeLogReference = `incident-bridge-log-${handoffPackage.provider.toLowerCase()}.md`;
  const auditSignOffReference = `audit-signoff-${handoffPackage.provider.toLowerCase()}.md`;
  const checks = [
    {
      name: "Handoff package ready",
      passed: handoffPackage.status === "Ready for switch execution handoff review",
      detail: `${handoffPackage.id} is ${handoffPackage.status}.`,
    },
    {
      name: "Operator result linked",
      passed: Boolean(operatorResultReference),
      detail: operatorResultReference,
    },
    {
      name: "Post-switch validation linked",
      passed: Boolean(postSwitchValidationReference),
      detail: postSwitchValidationReference,
    },
    {
      name: "Rollback decision linked",
      passed: Boolean(rollbackDecisionReference),
      detail: rollbackDecisionReference,
    },
    {
      name: "Incident bridge log linked",
      passed: Boolean(incidentBridgeLogReference),
      detail: incidentBridgeLogReference,
    },
    {
      name: "Audit sign-off linked",
      passed: Boolean(auditSignOffReference),
      detail: auditSignOffReference,
    },
    {
      name: "Prototype records outcome only",
      passed: !handoffPackage.provisioningEnabled && !handoffPackage.killSwitch.enabled,
      detail: `${handoffPackage.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `switch-execution-outcome-record-${handoffPackage.provider.toLowerCase()}-${Date.now()}`,
    provider: handoffPackage.provider,
    handoffPackageId: handoffPackage.id,
    controlledSwitchRequestId: handoffPackage.controlledSwitchRequestId,
    auditPackageId: handoffPackage.auditPackageId,
    switchReviewId: handoffPackage.switchReviewId,
    activationId: handoffPackage.activationId,
    idempotencyKey: handoffPackage.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for switch outcome review" : "Blocked",
    requestedBy: actor,
    operatorResultReference,
    postSwitchValidationReference,
    rollbackDecisionReference,
    incidentBridgeLogReference,
    auditSignOffReference,
    checks,
    evidence: [
      `Handoff package: ${handoffPackage.id}.`,
      `Controlled switch request: ${handoffPackage.controlledSwitchRequestId}.`,
      `Operator result: ${operatorResultReference}.`,
      `Post-switch validation: ${postSwitchValidationReference}.`,
      `Rollback decision: ${rollbackDecisionReference}.`,
      `Incident bridge log: ${incidentBridgeLogReference}.`,
      `Audit sign-off: ${auditSignOffReference}.`,
      `Kill switch: ${handoffPackage.killSwitch.name}=${handoffPackage.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: handoffPackage.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockSwitchClosureRetentionPackage(
  outcomeRecord: SwitchExecutionOutcomeRecord,
  actor: string
): SwitchClosureRetentionPackage {
  const closureOwner = "Cloud Operations";
  const retainedEvidenceManifestReference = `retained-evidence-manifest-${outcomeRecord.provider.toLowerCase()}.json`;
  const lessonsLearnedReference = `lessons-learned-${outcomeRecord.provider.toLowerCase()}.md`;
  const rollbackTimerClosureReference = `rollback-timer-closure-${outcomeRecord.provider.toLowerCase()}.md`;
  const finalAuditRetentionConfirmation = `final-audit-retention-${outcomeRecord.provider.toLowerCase()}.md`;
  const checks = [
    {
      name: "Outcome record ready",
      passed: outcomeRecord.status === "Ready for switch outcome review",
      detail: `${outcomeRecord.id} is ${outcomeRecord.status}.`,
    },
    {
      name: "Closure owner assigned",
      passed: Boolean(closureOwner),
      detail: closureOwner,
    },
    {
      name: "Retained evidence manifest linked",
      passed: Boolean(retainedEvidenceManifestReference),
      detail: retainedEvidenceManifestReference,
    },
    {
      name: "Lessons learned linked",
      passed: Boolean(lessonsLearnedReference),
      detail: lessonsLearnedReference,
    },
    {
      name: "Rollback timer closure linked",
      passed: Boolean(rollbackTimerClosureReference),
      detail: rollbackTimerClosureReference,
    },
    {
      name: "Final audit retention confirmed",
      passed: Boolean(finalAuditRetentionConfirmation),
      detail: finalAuditRetentionConfirmation,
    },
    {
      name: "Prototype closes evidence only",
      passed: !outcomeRecord.provisioningEnabled && !outcomeRecord.killSwitch.enabled,
      detail: `${outcomeRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `switch-closure-retention-package-${outcomeRecord.provider.toLowerCase()}-${Date.now()}`,
    provider: outcomeRecord.provider,
    outcomeRecordId: outcomeRecord.id,
    handoffPackageId: outcomeRecord.handoffPackageId,
    controlledSwitchRequestId: outcomeRecord.controlledSwitchRequestId,
    auditPackageId: outcomeRecord.auditPackageId,
    switchReviewId: outcomeRecord.switchReviewId,
    activationId: outcomeRecord.activationId,
    idempotencyKey: outcomeRecord.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for switch closure review" : "Blocked",
    requestedBy: actor,
    closureOwner,
    retainedEvidenceManifestReference,
    lessonsLearnedReference,
    rollbackTimerClosureReference,
    finalAuditRetentionConfirmation,
    checks,
    evidence: [
      `Outcome record: ${outcomeRecord.id}.`,
      `Handoff package: ${outcomeRecord.handoffPackageId}.`,
      `Closure owner: ${closureOwner}.`,
      `Retained evidence manifest: ${retainedEvidenceManifestReference}.`,
      `Lessons learned: ${lessonsLearnedReference}.`,
      `Rollback timer closure: ${rollbackTimerClosureReference}.`,
      `Final audit retention: ${finalAuditRetentionConfirmation}.`,
      `Kill switch: ${outcomeRecord.killSwitch.name}=${outcomeRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: outcomeRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockAdapterPromotionReadinessDossier(
  closurePackage: SwitchClosureRetentionPackage,
  actor: string
): AdapterPromotionReadinessDossier {
  const promotionOwner = "Cloud Platform Owner";
  const retainedSwitchEvidenceReference = closurePackage.retainedEvidenceManifestReference;
  const monitoringPlanReference = `adapter-promotion-monitoring-${closurePackage.provider.toLowerCase()}.md`;
  const rollbackDrillConfirmation = `rollback-drill-confirmation-${closurePackage.provider.toLowerCase()}.md`;
  const securityAcceptanceReference = `security-acceptance-${closurePackage.provider.toLowerCase()}.md`;
  const checks = [
    {
      name: "Closure package ready",
      passed: closurePackage.status === "Ready for switch closure review",
      detail: `${closurePackage.id} is ${closurePackage.status}.`,
    },
    {
      name: "Promotion owner assigned",
      passed: Boolean(promotionOwner),
      detail: promotionOwner,
    },
    {
      name: "Retained switch evidence linked",
      passed: Boolean(retainedSwitchEvidenceReference),
      detail: retainedSwitchEvidenceReference,
    },
    {
      name: "Monitoring plan linked",
      passed: Boolean(monitoringPlanReference),
      detail: monitoringPlanReference,
    },
    {
      name: "Rollback drill confirmed",
      passed: Boolean(rollbackDrillConfirmation),
      detail: rollbackDrillConfirmation,
    },
    {
      name: "Security acceptance linked",
      passed: Boolean(securityAcceptanceReference),
      detail: securityAcceptanceReference,
    },
    {
      name: "Prototype does not promote adapter",
      passed: !closurePackage.provisioningEnabled && !closurePackage.killSwitch.enabled,
      detail: `${closurePackage.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `adapter-promotion-readiness-dossier-${closurePackage.provider.toLowerCase()}-${Date.now()}`,
    provider: closurePackage.provider,
    closurePackageId: closurePackage.id,
    outcomeRecordId: closurePackage.outcomeRecordId,
    handoffPackageId: closurePackage.handoffPackageId,
    controlledSwitchRequestId: closurePackage.controlledSwitchRequestId,
    auditPackageId: closurePackage.auditPackageId,
    switchReviewId: closurePackage.switchReviewId,
    activationId: closurePackage.activationId,
    idempotencyKey: closurePackage.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for adapter promotion review" : "Blocked",
    requestedBy: actor,
    promotionOwner,
    retainedSwitchEvidenceReference,
    monitoringPlanReference,
    rollbackDrillConfirmation,
    securityAcceptanceReference,
    checks,
    evidence: [
      `Closure package: ${closurePackage.id}.`,
      `Outcome record: ${closurePackage.outcomeRecordId}.`,
      `Promotion owner: ${promotionOwner}.`,
      `Retained switch evidence: ${retainedSwitchEvidenceReference}.`,
      `Monitoring plan: ${monitoringPlanReference}.`,
      `Rollback drill: ${rollbackDrillConfirmation}.`,
      `Security acceptance: ${securityAcceptanceReference}.`,
      `Kill switch: ${closurePackage.killSwitch.name}=${closurePackage.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: closurePackage.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionAdapterAuthorizationPacket(
  promotionDossier: AdapterPromotionReadinessDossier,
  actor: string
): ProductionAdapterAuthorizationPacket {
  const providerSlug = promotionDossier.provider.toLowerCase();
  const productionApprover = "Production Change Authority";
  const changeTicketReference = `change-ticket-${providerSlug}.md`;
  const releaseWindowReference = `production-release-window-${providerSlug}.md`;
  const emergencyRollbackAuthorization = `emergency-rollback-authorization-${providerSlug}.md`;
  const complianceAcceptanceReference = `compliance-acceptance-${providerSlug}.md`;
  const checks = [
    {
      name: "Promotion dossier ready",
      passed: promotionDossier.status === "Ready for adapter promotion review",
      detail: `${promotionDossier.id} is ${promotionDossier.status}.`,
    },
    {
      name: "Production approver assigned",
      passed: Boolean(productionApprover),
      detail: productionApprover,
    },
    {
      name: "Change ticket linked",
      passed: Boolean(changeTicketReference),
      detail: changeTicketReference,
    },
    {
      name: "Release window linked",
      passed: Boolean(releaseWindowReference),
      detail: releaseWindowReference,
    },
    {
      name: "Emergency rollback authorized",
      passed: Boolean(emergencyRollbackAuthorization),
      detail: emergencyRollbackAuthorization,
    },
    {
      name: "Compliance acceptance linked",
      passed: Boolean(complianceAcceptanceReference),
      detail: complianceAcceptanceReference,
    },
    {
      name: "Prototype does not authorize promotion",
      passed: !promotionDossier.provisioningEnabled && !promotionDossier.killSwitch.enabled,
      detail: `${promotionDossier.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-adapter-authorization-packet-${providerSlug}-${Date.now()}`,
    provider: promotionDossier.provider,
    promotionDossierId: promotionDossier.id,
    closurePackageId: promotionDossier.closurePackageId,
    outcomeRecordId: promotionDossier.outcomeRecordId,
    handoffPackageId: promotionDossier.handoffPackageId,
    controlledSwitchRequestId: promotionDossier.controlledSwitchRequestId,
    auditPackageId: promotionDossier.auditPackageId,
    switchReviewId: promotionDossier.switchReviewId,
    activationId: promotionDossier.activationId,
    idempotencyKey: promotionDossier.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production adapter authorization review"
      : "Blocked",
    requestedBy: actor,
    productionApprover,
    changeTicketReference,
    releaseWindowReference,
    emergencyRollbackAuthorization,
    complianceAcceptanceReference,
    checks,
    evidence: [
      `Promotion dossier: ${promotionDossier.id}.`,
      `Closure package: ${promotionDossier.closurePackageId}.`,
      `Production approver: ${productionApprover}.`,
      `Change ticket: ${changeTicketReference}.`,
      `Release window: ${releaseWindowReference}.`,
      `Emergency rollback authorization: ${emergencyRollbackAuthorization}.`,
      `Compliance acceptance: ${complianceAcceptanceReference}.`,
      `Kill switch: ${promotionDossier.killSwitch.name}=${promotionDossier.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: promotionDossier.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionChangeFreezeRecord(
  authorizationPacket: ProductionAdapterAuthorizationPacket,
  actor: string
): ProductionChangeFreezeRecord {
  const providerSlug = authorizationPacket.provider.toLowerCase();
  const freezeOwner = "Production Change Manager";
  const freezeWindowReference = `production-change-freeze-window-${providerSlug}.md`;
  const stakeholderNotificationReference = `stakeholder-notification-${providerSlug}.md`;
  const rollbackStandbyReference = `rollback-standby-roster-${providerSlug}.md`;
  const noChangeExceptionPlanReference = `no-change-exception-plan-${providerSlug}.md`;
  const checks = [
    {
      name: "Authorization packet ready",
      passed: authorizationPacket.status === "Ready for production adapter authorization review",
      detail: `${authorizationPacket.id} is ${authorizationPacket.status}.`,
    },
    {
      name: "Freeze owner assigned",
      passed: Boolean(freezeOwner),
      detail: freezeOwner,
    },
    {
      name: "Freeze window linked",
      passed: Boolean(freezeWindowReference),
      detail: freezeWindowReference,
    },
    {
      name: "Stakeholder notification linked",
      passed: Boolean(stakeholderNotificationReference),
      detail: stakeholderNotificationReference,
    },
    {
      name: "Rollback standby linked",
      passed: Boolean(rollbackStandbyReference),
      detail: rollbackStandbyReference,
    },
    {
      name: "No-change exception plan linked",
      passed: Boolean(noChangeExceptionPlanReference),
      detail: noChangeExceptionPlanReference,
    },
    {
      name: "Prototype does not promote adapter",
      passed: !authorizationPacket.provisioningEnabled && !authorizationPacket.killSwitch.enabled,
      detail: `${authorizationPacket.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-change-freeze-record-${providerSlug}-${Date.now()}`,
    provider: authorizationPacket.provider,
    authorizationPacketId: authorizationPacket.id,
    promotionDossierId: authorizationPacket.promotionDossierId,
    closurePackageId: authorizationPacket.closurePackageId,
    outcomeRecordId: authorizationPacket.outcomeRecordId,
    handoffPackageId: authorizationPacket.handoffPackageId,
    controlledSwitchRequestId: authorizationPacket.controlledSwitchRequestId,
    auditPackageId: authorizationPacket.auditPackageId,
    switchReviewId: authorizationPacket.switchReviewId,
    activationId: authorizationPacket.activationId,
    idempotencyKey: authorizationPacket.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production change freeze review"
      : "Blocked",
    requestedBy: actor,
    freezeOwner,
    freezeWindowReference,
    stakeholderNotificationReference,
    rollbackStandbyReference,
    noChangeExceptionPlanReference,
    checks,
    evidence: [
      `Authorization packet: ${authorizationPacket.id}.`,
      `Promotion dossier: ${authorizationPacket.promotionDossierId}.`,
      `Freeze owner: ${freezeOwner}.`,
      `Freeze window: ${freezeWindowReference}.`,
      `Stakeholder notification: ${stakeholderNotificationReference}.`,
      `Rollback standby: ${rollbackStandbyReference}.`,
      `No-change exception plan: ${noChangeExceptionPlanReference}.`,
      `Kill switch: ${authorizationPacket.killSwitch.name}=${authorizationPacket.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: authorizationPacket.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionCabHandoffPacket(
  freezeRecord: ProductionChangeFreezeRecord,
  actor: string
): ProductionCabHandoffPacket {
  const providerSlug = freezeRecord.provider.toLowerCase();
  const cabOwner = "Production CAB Chair";
  const cabAgendaReference = `cab-agenda-${providerSlug}.md`;
  const riskAcceptanceReference = `risk-acceptance-${providerSlug}.md`;
  const rollbackRepresentationReference = `rollback-representation-${providerSlug}.md`;
  const finalGoNoGoAgendaReference = `final-go-no-go-agenda-${providerSlug}.md`;
  const checks = [
    {
      name: "Change freeze ready",
      passed: freezeRecord.status === "Ready for production change freeze review",
      detail: `${freezeRecord.id} is ${freezeRecord.status}.`,
    },
    {
      name: "CAB owner assigned",
      passed: Boolean(cabOwner),
      detail: cabOwner,
    },
    {
      name: "CAB agenda linked",
      passed: Boolean(cabAgendaReference),
      detail: cabAgendaReference,
    },
    {
      name: "Risk acceptance linked",
      passed: Boolean(riskAcceptanceReference),
      detail: riskAcceptanceReference,
    },
    {
      name: "Rollback represented",
      passed: Boolean(rollbackRepresentationReference),
      detail: rollbackRepresentationReference,
    },
    {
      name: "Final go/no-go agenda linked",
      passed: Boolean(finalGoNoGoAgendaReference),
      detail: finalGoNoGoAgendaReference,
    },
    {
      name: "Prototype does not promote adapter",
      passed: !freezeRecord.provisioningEnabled && !freezeRecord.killSwitch.enabled,
      detail: `${freezeRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-cab-handoff-packet-${providerSlug}-${Date.now()}`,
    provider: freezeRecord.provider,
    freezeRecordId: freezeRecord.id,
    authorizationPacketId: freezeRecord.authorizationPacketId,
    promotionDossierId: freezeRecord.promotionDossierId,
    closurePackageId: freezeRecord.closurePackageId,
    outcomeRecordId: freezeRecord.outcomeRecordId,
    handoffPackageId: freezeRecord.handoffPackageId,
    controlledSwitchRequestId: freezeRecord.controlledSwitchRequestId,
    auditPackageId: freezeRecord.auditPackageId,
    switchReviewId: freezeRecord.switchReviewId,
    activationId: freezeRecord.activationId,
    idempotencyKey: freezeRecord.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for production CAB handoff review" : "Blocked",
    requestedBy: actor,
    cabOwner,
    cabAgendaReference,
    riskAcceptanceReference,
    rollbackRepresentationReference,
    finalGoNoGoAgendaReference,
    checks,
    evidence: [
      `Freeze record: ${freezeRecord.id}.`,
      `Authorization packet: ${freezeRecord.authorizationPacketId}.`,
      `CAB owner: ${cabOwner}.`,
      `CAB agenda: ${cabAgendaReference}.`,
      `Risk acceptance: ${riskAcceptanceReference}.`,
      `Rollback representation: ${rollbackRepresentationReference}.`,
      `Final go/no-go agenda: ${finalGoNoGoAgendaReference}.`,
      `Kill switch: ${freezeRecord.killSwitch.name}=${freezeRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: freezeRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionCabDecisionRecord(
  handoffPacket: ProductionCabHandoffPacket,
  actor: string
): ProductionCabDecisionRecord {
  const providerSlug = handoffPacket.provider.toLowerCase();
  const cabDecision = "Approved with conditions";
  const decisionAuthority = "Production CAB";
  const conditionListReference = `cab-condition-list-${providerSlug}.md`;
  const rollbackApprovalReference = `cab-rollback-approval-${providerSlug}.md`;
  const decisionMinutesReference = `cab-decision-minutes-${providerSlug}.md`;
  const checks = [
    {
      name: "CAB handoff ready",
      passed: handoffPacket.status === "Ready for production CAB handoff review",
      detail: `${handoffPacket.id} is ${handoffPacket.status}.`,
    },
    {
      name: "CAB decision recorded",
      passed: cabDecision === "Approved with conditions",
      detail: cabDecision,
    },
    {
      name: "Decision authority assigned",
      passed: Boolean(decisionAuthority),
      detail: decisionAuthority,
    },
    {
      name: "Condition list linked",
      passed: Boolean(conditionListReference),
      detail: conditionListReference,
    },
    {
      name: "Rollback approval linked",
      passed: Boolean(rollbackApprovalReference),
      detail: rollbackApprovalReference,
    },
    {
      name: "Decision minutes linked",
      passed: Boolean(decisionMinutesReference),
      detail: decisionMinutesReference,
    },
    {
      name: "Prototype does not promote adapter",
      passed: !handoffPacket.provisioningEnabled && !handoffPacket.killSwitch.enabled,
      detail: `${handoffPacket.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-cab-decision-record-${providerSlug}-${Date.now()}`,
    provider: handoffPacket.provider,
    cabHandoffPacketId: handoffPacket.id,
    freezeRecordId: handoffPacket.freezeRecordId,
    authorizationPacketId: handoffPacket.authorizationPacketId,
    promotionDossierId: handoffPacket.promotionDossierId,
    closurePackageId: handoffPacket.closurePackageId,
    outcomeRecordId: handoffPacket.outcomeRecordId,
    handoffPackageId: handoffPacket.handoffPackageId,
    controlledSwitchRequestId: handoffPacket.controlledSwitchRequestId,
    auditPackageId: handoffPacket.auditPackageId,
    switchReviewId: handoffPacket.switchReviewId,
    activationId: handoffPacket.activationId,
    idempotencyKey: handoffPacket.idempotencyKey,
    status: checks.every((check) => check.passed) ? "Ready for production CAB decision review" : "Blocked",
    requestedBy: actor,
    cabDecision,
    decisionAuthority,
    conditionListReference,
    rollbackApprovalReference,
    decisionMinutesReference,
    checks,
    evidence: [
      `CAB handoff packet: ${handoffPacket.id}.`,
      `Freeze record: ${handoffPacket.freezeRecordId}.`,
      `CAB decision: ${cabDecision}.`,
      `Decision authority: ${decisionAuthority}.`,
      `Condition list: ${conditionListReference}.`,
      `Rollback approval: ${rollbackApprovalReference}.`,
      `Decision minutes: ${decisionMinutesReference}.`,
      `Kill switch: ${handoffPacket.killSwitch.name}=${handoffPacket.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: handoffPacket.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionImplementationHoldRecord(
  decisionRecord: ProductionCabDecisionRecord,
  actor: string
): ProductionImplementationHoldRecord {
  const providerSlug = decisionRecord.provider.toLowerCase();
  const implementationOwner = "Production Implementation Owner";
  const holdWindowReference = `production-implementation-hold-window-${providerSlug}.md`;
  const conditionAcceptanceReference = `cab-condition-acceptance-${providerSlug}.md`;
  const rollbackImplementationOwner = "Rollback Implementation Owner";
  const releaseFreezeAcknowledgmentReference = `release-freeze-acknowledgment-${providerSlug}.md`;
  const checks = [
    {
      name: "CAB decision ready",
      passed: decisionRecord.status === "Ready for production CAB decision review",
      detail: `${decisionRecord.id} is ${decisionRecord.status}.`,
    },
    {
      name: "Implementation owner assigned",
      passed: Boolean(implementationOwner),
      detail: implementationOwner,
    },
    {
      name: "Hold window linked",
      passed: Boolean(holdWindowReference),
      detail: holdWindowReference,
    },
    {
      name: "Condition acceptance linked",
      passed: Boolean(conditionAcceptanceReference),
      detail: conditionAcceptanceReference,
    },
    {
      name: "Rollback implementation owner assigned",
      passed: Boolean(rollbackImplementationOwner),
      detail: rollbackImplementationOwner,
    },
    {
      name: "Release freeze acknowledgment linked",
      passed: Boolean(releaseFreezeAcknowledgmentReference),
      detail: releaseFreezeAcknowledgmentReference,
    },
    {
      name: "Prototype does not promote adapter",
      passed: !decisionRecord.provisioningEnabled && !decisionRecord.killSwitch.enabled,
      detail: `${decisionRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-implementation-hold-record-${providerSlug}-${Date.now()}`,
    provider: decisionRecord.provider,
    cabDecisionRecordId: decisionRecord.id,
    cabHandoffPacketId: decisionRecord.cabHandoffPacketId,
    freezeRecordId: decisionRecord.freezeRecordId,
    authorizationPacketId: decisionRecord.authorizationPacketId,
    promotionDossierId: decisionRecord.promotionDossierId,
    closurePackageId: decisionRecord.closurePackageId,
    outcomeRecordId: decisionRecord.outcomeRecordId,
    handoffPackageId: decisionRecord.handoffPackageId,
    controlledSwitchRequestId: decisionRecord.controlledSwitchRequestId,
    auditPackageId: decisionRecord.auditPackageId,
    switchReviewId: decisionRecord.switchReviewId,
    activationId: decisionRecord.activationId,
    idempotencyKey: decisionRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production implementation hold review"
      : "Blocked",
    requestedBy: actor,
    implementationOwner,
    holdWindowReference,
    conditionAcceptanceReference,
    rollbackImplementationOwner,
    releaseFreezeAcknowledgmentReference,
    checks,
    evidence: [
      `CAB decision record: ${decisionRecord.id}.`,
      `CAB handoff packet: ${decisionRecord.cabHandoffPacketId}.`,
      `Implementation owner: ${implementationOwner}.`,
      `Hold window: ${holdWindowReference}.`,
      `Condition acceptance: ${conditionAcceptanceReference}.`,
      `Rollback implementation owner: ${rollbackImplementationOwner}.`,
      `Release freeze acknowledgment: ${releaseFreezeAcknowledgmentReference}.`,
      `Kill switch: ${decisionRecord.killSwitch.name}=${decisionRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: decisionRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionOperatorAssignmentRecord(
  holdRecord: ProductionImplementationHoldRecord,
  actor: string
): ProductionOperatorAssignmentRecord {
  const providerSlug = holdRecord.provider.toLowerCase();
  const primaryOperator = "Primary Production Operator";
  const secondaryOperator = "Secondary Production Operator";
  const executionChannelReference = `production-execution-channel-${providerSlug}.md`;
  const rollbackOperator = "Rollback Production Operator";
  const privilegedAccessConfirmationReference = `privileged-access-confirmation-${providerSlug}.md`;
  const checks = [
    {
      name: "Implementation hold ready",
      passed: holdRecord.status === "Ready for production implementation hold review",
      detail: `${holdRecord.id} is ${holdRecord.status}.`,
    },
    {
      name: "Primary operator assigned",
      passed: Boolean(primaryOperator),
      detail: primaryOperator,
    },
    {
      name: "Secondary operator assigned",
      passed: Boolean(secondaryOperator),
      detail: secondaryOperator,
    },
    {
      name: "Execution channel linked",
      passed: Boolean(executionChannelReference),
      detail: executionChannelReference,
    },
    {
      name: "Rollback operator assigned",
      passed: Boolean(rollbackOperator),
      detail: rollbackOperator,
    },
    {
      name: "Privileged access confirmation linked",
      passed: Boolean(privilegedAccessConfirmationReference),
      detail: privilegedAccessConfirmationReference,
    },
    {
      name: "Prototype does not promote adapter",
      passed: !holdRecord.provisioningEnabled && !holdRecord.killSwitch.enabled,
      detail: `${holdRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-operator-assignment-record-${providerSlug}-${Date.now()}`,
    provider: holdRecord.provider,
    implementationHoldRecordId: holdRecord.id,
    cabDecisionRecordId: holdRecord.cabDecisionRecordId,
    cabHandoffPacketId: holdRecord.cabHandoffPacketId,
    freezeRecordId: holdRecord.freezeRecordId,
    authorizationPacketId: holdRecord.authorizationPacketId,
    promotionDossierId: holdRecord.promotionDossierId,
    closurePackageId: holdRecord.closurePackageId,
    outcomeRecordId: holdRecord.outcomeRecordId,
    handoffPackageId: holdRecord.handoffPackageId,
    controlledSwitchRequestId: holdRecord.controlledSwitchRequestId,
    auditPackageId: holdRecord.auditPackageId,
    switchReviewId: holdRecord.switchReviewId,
    activationId: holdRecord.activationId,
    idempotencyKey: holdRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production operator assignment review"
      : "Blocked",
    requestedBy: actor,
    primaryOperator,
    secondaryOperator,
    executionChannelReference,
    rollbackOperator,
    privilegedAccessConfirmationReference,
    checks,
    evidence: [
      `Implementation hold record: ${holdRecord.id}.`,
      `CAB decision record: ${holdRecord.cabDecisionRecordId}.`,
      `Primary operator: ${primaryOperator}.`,
      `Secondary operator: ${secondaryOperator}.`,
      `Execution channel: ${executionChannelReference}.`,
      `Rollback operator: ${rollbackOperator}.`,
      `Privileged access confirmation: ${privilegedAccessConfirmationReference}.`,
      `Kill switch: ${holdRecord.killSwitch.name}=${holdRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: holdRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionReadinessRecord(
  assignmentRecord: ProductionOperatorAssignmentRecord,
  actor: string
): ProductionExecutionReadinessRecord {
  const providerSlug = assignmentRecord.provider.toLowerCase();
  const executionOwner = "Production Execution Owner";
  const preExecutionChecklistReference = `production-pre-execution-checklist-${providerSlug}.md`;
  const rollbackBridgeReference = `production-rollback-bridge-${providerSlug}.md`;
  const monitoringObserver = "Production Monitoring Observer";
  const implementationTimerReference = `production-implementation-timer-${providerSlug}.md`;
  const checks = [
    {
      name: "Operator assignment ready",
      passed: assignmentRecord.status === "Ready for production operator assignment review",
      detail: `${assignmentRecord.id} is ${assignmentRecord.status}.`,
    },
    {
      name: "Execution owner assigned",
      passed: Boolean(executionOwner),
      detail: executionOwner,
    },
    {
      name: "Pre-execution checklist linked",
      passed: Boolean(preExecutionChecklistReference),
      detail: preExecutionChecklistReference,
    },
    {
      name: "Rollback bridge linked",
      passed: Boolean(rollbackBridgeReference),
      detail: rollbackBridgeReference,
    },
    {
      name: "Monitoring observer assigned",
      passed: Boolean(monitoringObserver),
      detail: monitoringObserver,
    },
    {
      name: "Implementation timer linked",
      passed: Boolean(implementationTimerReference),
      detail: implementationTimerReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !assignmentRecord.provisioningEnabled && !assignmentRecord.killSwitch.enabled,
      detail: `${assignmentRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-readiness-record-${providerSlug}-${Date.now()}`,
    provider: assignmentRecord.provider,
    operatorAssignmentRecordId: assignmentRecord.id,
    implementationHoldRecordId: assignmentRecord.implementationHoldRecordId,
    cabDecisionRecordId: assignmentRecord.cabDecisionRecordId,
    cabHandoffPacketId: assignmentRecord.cabHandoffPacketId,
    freezeRecordId: assignmentRecord.freezeRecordId,
    authorizationPacketId: assignmentRecord.authorizationPacketId,
    promotionDossierId: assignmentRecord.promotionDossierId,
    closurePackageId: assignmentRecord.closurePackageId,
    outcomeRecordId: assignmentRecord.outcomeRecordId,
    handoffPackageId: assignmentRecord.handoffPackageId,
    controlledSwitchRequestId: assignmentRecord.controlledSwitchRequestId,
    auditPackageId: assignmentRecord.auditPackageId,
    switchReviewId: assignmentRecord.switchReviewId,
    activationId: assignmentRecord.activationId,
    idempotencyKey: assignmentRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution readiness review"
      : "Blocked",
    requestedBy: actor,
    executionOwner,
    preExecutionChecklistReference,
    rollbackBridgeReference,
    monitoringObserver,
    implementationTimerReference,
    checks,
    evidence: [
      `Operator assignment record: ${assignmentRecord.id}.`,
      `Implementation hold record: ${assignmentRecord.implementationHoldRecordId}.`,
      `Execution owner: ${executionOwner}.`,
      `Pre-execution checklist: ${preExecutionChecklistReference}.`,
      `Rollback bridge: ${rollbackBridgeReference}.`,
      `Monitoring observer: ${monitoringObserver}.`,
      `Implementation timer: ${implementationTimerReference}.`,
      `Kill switch: ${assignmentRecord.killSwitch.name}=${assignmentRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: assignmentRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionAuthorizationRecord(
  readinessRecord: ProductionExecutionReadinessRecord,
  actor: string
): ProductionExecutionAuthorizationRecord {
  const providerSlug = readinessRecord.provider.toLowerCase();
  const authorizationAuthority = "Production Authorization Authority";
  const finalGoNoGoDecision = "Approved" as const;
  const rollbackBridgeConfirmationReference = `production-rollback-bridge-confirmation-${providerSlug}.md`;
  const monitoringBridgeConfirmationReference = `production-monitoring-bridge-confirmation-${providerSlug}.md`;
  const emergencyStopAuthority = "Emergency Stop Authority";
  const checks = [
    {
      name: "Execution readiness ready",
      passed: readinessRecord.status === "Ready for production execution readiness review",
      detail: `${readinessRecord.id} is ${readinessRecord.status}.`,
    },
    {
      name: "Authorization authority assigned",
      passed: Boolean(authorizationAuthority),
      detail: authorizationAuthority,
    },
    {
      name: "Final go/no-go approved",
      passed: finalGoNoGoDecision === "Approved",
      detail: finalGoNoGoDecision,
    },
    {
      name: "Rollback bridge confirmed",
      passed: Boolean(rollbackBridgeConfirmationReference),
      detail: rollbackBridgeConfirmationReference,
    },
    {
      name: "Monitoring bridge confirmed",
      passed: Boolean(monitoringBridgeConfirmationReference),
      detail: monitoringBridgeConfirmationReference,
    },
    {
      name: "Emergency stop authority assigned",
      passed: Boolean(emergencyStopAuthority),
      detail: emergencyStopAuthority,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !readinessRecord.provisioningEnabled && !readinessRecord.killSwitch.enabled,
      detail: `${readinessRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-authorization-record-${providerSlug}-${Date.now()}`,
    provider: readinessRecord.provider,
    executionReadinessRecordId: readinessRecord.id,
    operatorAssignmentRecordId: readinessRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: readinessRecord.implementationHoldRecordId,
    cabDecisionRecordId: readinessRecord.cabDecisionRecordId,
    cabHandoffPacketId: readinessRecord.cabHandoffPacketId,
    freezeRecordId: readinessRecord.freezeRecordId,
    authorizationPacketId: readinessRecord.authorizationPacketId,
    promotionDossierId: readinessRecord.promotionDossierId,
    closurePackageId: readinessRecord.closurePackageId,
    outcomeRecordId: readinessRecord.outcomeRecordId,
    handoffPackageId: readinessRecord.handoffPackageId,
    controlledSwitchRequestId: readinessRecord.controlledSwitchRequestId,
    auditPackageId: readinessRecord.auditPackageId,
    switchReviewId: readinessRecord.switchReviewId,
    activationId: readinessRecord.activationId,
    idempotencyKey: readinessRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution authorization review"
      : "Blocked",
    requestedBy: actor,
    authorizationAuthority,
    finalGoNoGoDecision,
    rollbackBridgeConfirmationReference,
    monitoringBridgeConfirmationReference,
    emergencyStopAuthority,
    checks,
    evidence: [
      `Execution readiness record: ${readinessRecord.id}.`,
      `Operator assignment record: ${readinessRecord.operatorAssignmentRecordId}.`,
      `Authorization authority: ${authorizationAuthority}.`,
      `Final go/no-go decision: ${finalGoNoGoDecision}.`,
      `Rollback bridge confirmation: ${rollbackBridgeConfirmationReference}.`,
      `Monitoring bridge confirmation: ${monitoringBridgeConfirmationReference}.`,
      `Emergency stop authority: ${emergencyStopAuthority}.`,
      `Kill switch: ${readinessRecord.killSwitch.name}=${readinessRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: readinessRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionChangeTicketLockRecord(
  authorizationRecord: ProductionExecutionAuthorizationRecord,
  actor: string
): ProductionChangeTicketLockRecord {
  const providerSlug = authorizationRecord.provider.toLowerCase();
  const changeTicketLockReference = `production-change-ticket-lock-${providerSlug}.md`;
  const releaseWindowLockReference = `production-release-window-lock-${providerSlug}.md`;
  const approverRosterLockReference = `production-approver-roster-lock-${providerSlug}.md`;
  const rollbackBridgeLockReference = `production-rollback-bridge-lock-${providerSlug}.md`;
  const monitoringBridgeLockReference = `production-monitoring-bridge-lock-${providerSlug}.md`;
  const checks = [
    {
      name: "Execution authorization ready",
      passed: authorizationRecord.status === "Ready for production execution authorization review",
      detail: `${authorizationRecord.id} is ${authorizationRecord.status}.`,
    },
    {
      name: "Change ticket locked",
      passed: Boolean(changeTicketLockReference),
      detail: changeTicketLockReference,
    },
    {
      name: "Release window locked",
      passed: Boolean(releaseWindowLockReference),
      detail: releaseWindowLockReference,
    },
    {
      name: "Approver roster locked",
      passed: Boolean(approverRosterLockReference),
      detail: approverRosterLockReference,
    },
    {
      name: "Rollback bridge locked",
      passed: Boolean(rollbackBridgeLockReference),
      detail: rollbackBridgeLockReference,
    },
    {
      name: "Monitoring bridge locked",
      passed: Boolean(monitoringBridgeLockReference),
      detail: monitoringBridgeLockReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !authorizationRecord.provisioningEnabled && !authorizationRecord.killSwitch.enabled,
      detail: `${authorizationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-change-ticket-lock-record-${providerSlug}-${Date.now()}`,
    provider: authorizationRecord.provider,
    executionAuthorizationRecordId: authorizationRecord.id,
    executionReadinessRecordId: authorizationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: authorizationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: authorizationRecord.implementationHoldRecordId,
    cabDecisionRecordId: authorizationRecord.cabDecisionRecordId,
    cabHandoffPacketId: authorizationRecord.cabHandoffPacketId,
    freezeRecordId: authorizationRecord.freezeRecordId,
    authorizationPacketId: authorizationRecord.authorizationPacketId,
    promotionDossierId: authorizationRecord.promotionDossierId,
    closurePackageId: authorizationRecord.closurePackageId,
    outcomeRecordId: authorizationRecord.outcomeRecordId,
    handoffPackageId: authorizationRecord.handoffPackageId,
    controlledSwitchRequestId: authorizationRecord.controlledSwitchRequestId,
    auditPackageId: authorizationRecord.auditPackageId,
    switchReviewId: authorizationRecord.switchReviewId,
    activationId: authorizationRecord.activationId,
    idempotencyKey: authorizationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production change ticket lock review"
      : "Blocked",
    requestedBy: actor,
    changeTicketLockReference,
    releaseWindowLockReference,
    approverRosterLockReference,
    rollbackBridgeLockReference,
    monitoringBridgeLockReference,
    checks,
    evidence: [
      `Execution authorization record: ${authorizationRecord.id}.`,
      `Execution readiness record: ${authorizationRecord.executionReadinessRecordId}.`,
      `Change ticket lock: ${changeTicketLockReference}.`,
      `Release window lock: ${releaseWindowLockReference}.`,
      `Approver roster lock: ${approverRosterLockReference}.`,
      `Rollback bridge lock: ${rollbackBridgeLockReference}.`,
      `Monitoring bridge lock: ${monitoringBridgeLockReference}.`,
      `Kill switch: ${authorizationRecord.killSwitch.name}=${authorizationRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: authorizationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionFinalExecutionPacketRecord(
  lockRecord: ProductionChangeTicketLockRecord,
  actor: string
): ProductionFinalExecutionPacketRecord {
  const providerSlug = lockRecord.provider.toLowerCase();
  const finalPacketManifestReference = `production-final-packet-manifest-${providerSlug}.md`;
  const operatorRunSheetReference = `production-operator-run-sheet-${providerSlug}.md`;
  const communicationsProofReference = `production-communications-proof-${providerSlug}.md`;
  const observationWindowReference = `production-observation-window-${providerSlug}.md`;
  const finalRollbackStandbyConfirmation = `production-final-rollback-standby-${providerSlug}.md`;
  const checks = [
    {
      name: "Change ticket lock ready",
      passed: lockRecord.status === "Ready for production change ticket lock review",
      detail: `${lockRecord.id} is ${lockRecord.status}.`,
    },
    {
      name: "Final packet manifest linked",
      passed: Boolean(finalPacketManifestReference),
      detail: finalPacketManifestReference,
    },
    {
      name: "Operator run sheet linked",
      passed: Boolean(operatorRunSheetReference),
      detail: operatorRunSheetReference,
    },
    {
      name: "Communications proof linked",
      passed: Boolean(communicationsProofReference),
      detail: communicationsProofReference,
    },
    {
      name: "Observation window linked",
      passed: Boolean(observationWindowReference),
      detail: observationWindowReference,
    },
    {
      name: "Final rollback standby confirmed",
      passed: Boolean(finalRollbackStandbyConfirmation),
      detail: finalRollbackStandbyConfirmation,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !lockRecord.provisioningEnabled && !lockRecord.killSwitch.enabled,
      detail: `${lockRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-final-execution-packet-record-${providerSlug}-${Date.now()}`,
    provider: lockRecord.provider,
    changeTicketLockRecordId: lockRecord.id,
    executionAuthorizationRecordId: lockRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: lockRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: lockRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: lockRecord.implementationHoldRecordId,
    cabDecisionRecordId: lockRecord.cabDecisionRecordId,
    cabHandoffPacketId: lockRecord.cabHandoffPacketId,
    freezeRecordId: lockRecord.freezeRecordId,
    authorizationPacketId: lockRecord.authorizationPacketId,
    promotionDossierId: lockRecord.promotionDossierId,
    closurePackageId: lockRecord.closurePackageId,
    outcomeRecordId: lockRecord.outcomeRecordId,
    handoffPackageId: lockRecord.handoffPackageId,
    controlledSwitchRequestId: lockRecord.controlledSwitchRequestId,
    auditPackageId: lockRecord.auditPackageId,
    switchReviewId: lockRecord.switchReviewId,
    activationId: lockRecord.activationId,
    idempotencyKey: lockRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production final execution packet review"
      : "Blocked",
    requestedBy: actor,
    finalPacketManifestReference,
    operatorRunSheetReference,
    communicationsProofReference,
    observationWindowReference,
    finalRollbackStandbyConfirmation,
    checks,
    evidence: [
      `Change ticket lock record: ${lockRecord.id}.`,
      `Execution authorization record: ${lockRecord.executionAuthorizationRecordId}.`,
      `Final packet manifest: ${finalPacketManifestReference}.`,
      `Operator run sheet: ${operatorRunSheetReference}.`,
      `Communications proof: ${communicationsProofReference}.`,
      `Observation window: ${observationWindowReference}.`,
      `Final rollback standby: ${finalRollbackStandbyConfirmation}.`,
      `Kill switch: ${lockRecord.killSwitch.name}=${lockRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: lockRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionHoldPointRecord(
  packetRecord: ProductionFinalExecutionPacketRecord,
  actor: string
): ProductionExecutionHoldPointRecord {
  const providerSlug = packetRecord.provider.toLowerCase();
  const holdPointOwner = "Production Hold-Point Owner";
  const finalStopGoCheckpointReference = `production-final-stop-go-checkpoint-${providerSlug}.md`;
  const rollbackTimerCheckpointReference = `production-rollback-timer-checkpoint-${providerSlug}.md`;
  const monitoringReadinessCheckpointReference = `production-monitoring-readiness-checkpoint-${providerSlug}.md`;
  const incidentBridgeCheckpointReference = `production-incident-bridge-checkpoint-${providerSlug}.md`;
  const checks = [
    {
      name: "Final execution packet ready",
      passed: packetRecord.status === "Ready for production final execution packet review",
      detail: `${packetRecord.id} is ${packetRecord.status}.`,
    },
    {
      name: "Hold-point owner assigned",
      passed: Boolean(holdPointOwner),
      detail: holdPointOwner,
    },
    {
      name: "Final stop/go checkpoint linked",
      passed: Boolean(finalStopGoCheckpointReference),
      detail: finalStopGoCheckpointReference,
    },
    {
      name: "Rollback timer checkpoint linked",
      passed: Boolean(rollbackTimerCheckpointReference),
      detail: rollbackTimerCheckpointReference,
    },
    {
      name: "Monitoring readiness checkpoint linked",
      passed: Boolean(monitoringReadinessCheckpointReference),
      detail: monitoringReadinessCheckpointReference,
    },
    {
      name: "Incident bridge checkpoint linked",
      passed: Boolean(incidentBridgeCheckpointReference),
      detail: incidentBridgeCheckpointReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !packetRecord.provisioningEnabled && !packetRecord.killSwitch.enabled,
      detail: `${packetRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-hold-point-record-${providerSlug}-${Date.now()}`,
    provider: packetRecord.provider,
    finalExecutionPacketRecordId: packetRecord.id,
    changeTicketLockRecordId: packetRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: packetRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: packetRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: packetRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: packetRecord.implementationHoldRecordId,
    cabDecisionRecordId: packetRecord.cabDecisionRecordId,
    cabHandoffPacketId: packetRecord.cabHandoffPacketId,
    freezeRecordId: packetRecord.freezeRecordId,
    authorizationPacketId: packetRecord.authorizationPacketId,
    promotionDossierId: packetRecord.promotionDossierId,
    closurePackageId: packetRecord.closurePackageId,
    outcomeRecordId: packetRecord.outcomeRecordId,
    handoffPackageId: packetRecord.handoffPackageId,
    controlledSwitchRequestId: packetRecord.controlledSwitchRequestId,
    auditPackageId: packetRecord.auditPackageId,
    switchReviewId: packetRecord.switchReviewId,
    activationId: packetRecord.activationId,
    idempotencyKey: packetRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution hold-point review"
      : "Blocked",
    requestedBy: actor,
    holdPointOwner,
    finalStopGoCheckpointReference,
    rollbackTimerCheckpointReference,
    monitoringReadinessCheckpointReference,
    incidentBridgeCheckpointReference,
    checks,
    evidence: [
      `Final execution packet record: ${packetRecord.id}.`,
      `Change ticket lock record: ${packetRecord.changeTicketLockRecordId}.`,
      `Hold-point owner: ${holdPointOwner}.`,
      `Final stop/go checkpoint: ${finalStopGoCheckpointReference}.`,
      `Rollback timer checkpoint: ${rollbackTimerCheckpointReference}.`,
      `Monitoring readiness checkpoint: ${monitoringReadinessCheckpointReference}.`,
      `Incident bridge checkpoint: ${incidentBridgeCheckpointReference}.`,
      `Kill switch: ${packetRecord.killSwitch.name}=${packetRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: packetRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionOutcomeAuthorizationRecord(
  holdPointRecord: ProductionExecutionHoldPointRecord,
  actor: string
): ProductionExecutionOutcomeAuthorizationRecord {
  const providerSlug = holdPointRecord.provider.toLowerCase();
  const outcomeAuthority = "Production Outcome Authority";
  const expectedResultEnvelopeReference = `production-expected-result-envelope-${providerSlug}.md`;
  const rollbackDecisionRuleReference = `production-rollback-decision-rule-${providerSlug}.md`;
  const incidentDeclarationRuleReference = `production-incident-declaration-rule-${providerSlug}.md`;
  const evidenceCaptureRuleReference = `production-evidence-capture-rule-${providerSlug}.md`;
  const checks = [
    {
      name: "Execution hold-point ready",
      passed: holdPointRecord.status === "Ready for production execution hold-point review",
      detail: `${holdPointRecord.id} is ${holdPointRecord.status}.`,
    },
    {
      name: "Outcome authority assigned",
      passed: Boolean(outcomeAuthority),
      detail: outcomeAuthority,
    },
    {
      name: "Expected result envelope linked",
      passed: Boolean(expectedResultEnvelopeReference),
      detail: expectedResultEnvelopeReference,
    },
    {
      name: "Rollback decision rule linked",
      passed: Boolean(rollbackDecisionRuleReference),
      detail: rollbackDecisionRuleReference,
    },
    {
      name: "Incident declaration rule linked",
      passed: Boolean(incidentDeclarationRuleReference),
      detail: incidentDeclarationRuleReference,
    },
    {
      name: "Evidence capture rule linked",
      passed: Boolean(evidenceCaptureRuleReference),
      detail: evidenceCaptureRuleReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !holdPointRecord.provisioningEnabled && !holdPointRecord.killSwitch.enabled,
      detail: `${holdPointRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-outcome-authorization-record-${providerSlug}-${Date.now()}`,
    provider: holdPointRecord.provider,
    executionHoldPointRecordId: holdPointRecord.id,
    finalExecutionPacketRecordId: holdPointRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: holdPointRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: holdPointRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: holdPointRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: holdPointRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: holdPointRecord.implementationHoldRecordId,
    cabDecisionRecordId: holdPointRecord.cabDecisionRecordId,
    cabHandoffPacketId: holdPointRecord.cabHandoffPacketId,
    freezeRecordId: holdPointRecord.freezeRecordId,
    authorizationPacketId: holdPointRecord.authorizationPacketId,
    promotionDossierId: holdPointRecord.promotionDossierId,
    closurePackageId: holdPointRecord.closurePackageId,
    outcomeRecordId: holdPointRecord.outcomeRecordId,
    handoffPackageId: holdPointRecord.handoffPackageId,
    controlledSwitchRequestId: holdPointRecord.controlledSwitchRequestId,
    auditPackageId: holdPointRecord.auditPackageId,
    switchReviewId: holdPointRecord.switchReviewId,
    activationId: holdPointRecord.activationId,
    idempotencyKey: holdPointRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution outcome authorization review"
      : "Blocked",
    requestedBy: actor,
    outcomeAuthority,
    expectedResultEnvelopeReference,
    rollbackDecisionRuleReference,
    incidentDeclarationRuleReference,
    evidenceCaptureRuleReference,
    checks,
    evidence: [
      `Execution hold-point record: ${holdPointRecord.id}.`,
      `Final execution packet record: ${holdPointRecord.finalExecutionPacketRecordId}.`,
      `Outcome authority: ${outcomeAuthority}.`,
      `Expected result envelope: ${expectedResultEnvelopeReference}.`,
      `Rollback decision rule: ${rollbackDecisionRuleReference}.`,
      `Incident declaration rule: ${incidentDeclarationRuleReference}.`,
      `Evidence capture rule: ${evidenceCaptureRuleReference}.`,
      `Kill switch: ${holdPointRecord.killSwitch.name}=${holdPointRecord.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: holdPointRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionClosureAuthorizationRecord(
  outcomeAuthorizationRecord: ProductionExecutionOutcomeAuthorizationRecord,
  actor: string
): ProductionExecutionClosureAuthorizationRecord {
  const providerSlug = outcomeAuthorizationRecord.provider.toLowerCase();
  const closureAuthority = "Production Closure Authority";
  const successCriteriaReference = `production-success-criteria-${providerSlug}.md`;
  const rollbackClosureCriteriaReference = `production-rollback-closure-criteria-${providerSlug}.md`;
  const incidentClosureCriteriaReference = `production-incident-closure-criteria-${providerSlug}.md`;
  const auditCaptureConfirmationReference = `production-audit-capture-confirmation-${providerSlug}.md`;
  const checks = [
    {
      name: "Outcome authorization ready",
      passed:
        outcomeAuthorizationRecord.status ===
        "Ready for production execution outcome authorization review",
      detail: `${outcomeAuthorizationRecord.id} is ${outcomeAuthorizationRecord.status}.`,
    },
    {
      name: "Closure authority assigned",
      passed: Boolean(closureAuthority),
      detail: closureAuthority,
    },
    {
      name: "Success criteria linked",
      passed: Boolean(successCriteriaReference),
      detail: successCriteriaReference,
    },
    {
      name: "Rollback closure criteria linked",
      passed: Boolean(rollbackClosureCriteriaReference),
      detail: rollbackClosureCriteriaReference,
    },
    {
      name: "Incident closure criteria linked",
      passed: Boolean(incidentClosureCriteriaReference),
      detail: incidentClosureCriteriaReference,
    },
    {
      name: "Audit capture confirmation linked",
      passed: Boolean(auditCaptureConfirmationReference),
      detail: auditCaptureConfirmationReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !outcomeAuthorizationRecord.provisioningEnabled && !outcomeAuthorizationRecord.killSwitch.enabled,
      detail: `${outcomeAuthorizationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-closure-authorization-record-${providerSlug}-${Date.now()}`,
    provider: outcomeAuthorizationRecord.provider,
    outcomeAuthorizationRecordId: outcomeAuthorizationRecord.id,
    executionHoldPointRecordId: outcomeAuthorizationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: outcomeAuthorizationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: outcomeAuthorizationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: outcomeAuthorizationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: outcomeAuthorizationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: outcomeAuthorizationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: outcomeAuthorizationRecord.implementationHoldRecordId,
    cabDecisionRecordId: outcomeAuthorizationRecord.cabDecisionRecordId,
    cabHandoffPacketId: outcomeAuthorizationRecord.cabHandoffPacketId,
    freezeRecordId: outcomeAuthorizationRecord.freezeRecordId,
    authorizationPacketId: outcomeAuthorizationRecord.authorizationPacketId,
    promotionDossierId: outcomeAuthorizationRecord.promotionDossierId,
    closurePackageId: outcomeAuthorizationRecord.closurePackageId,
    outcomeRecordId: outcomeAuthorizationRecord.outcomeRecordId,
    handoffPackageId: outcomeAuthorizationRecord.handoffPackageId,
    controlledSwitchRequestId: outcomeAuthorizationRecord.controlledSwitchRequestId,
    auditPackageId: outcomeAuthorizationRecord.auditPackageId,
    switchReviewId: outcomeAuthorizationRecord.switchReviewId,
    activationId: outcomeAuthorizationRecord.activationId,
    idempotencyKey: outcomeAuthorizationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution closure authorization review"
      : "Blocked",
    requestedBy: actor,
    closureAuthority,
    successCriteriaReference,
    rollbackClosureCriteriaReference,
    incidentClosureCriteriaReference,
    auditCaptureConfirmationReference,
    checks,
    evidence: [
      `Outcome authorization record: ${outcomeAuthorizationRecord.id}.`,
      `Execution hold-point record: ${outcomeAuthorizationRecord.executionHoldPointRecordId}.`,
      `Closure authority: ${closureAuthority}.`,
      `Success criteria: ${successCriteriaReference}.`,
      `Rollback closure criteria: ${rollbackClosureCriteriaReference}.`,
      `Incident closure criteria: ${incidentClosureCriteriaReference}.`,
      `Audit capture confirmation: ${auditCaptureConfirmationReference}.`,
      `Kill switch: ${outcomeAuthorizationRecord.killSwitch.name}=${
        outcomeAuthorizationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: outcomeAuthorizationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionClosurePacketRecord(
  closureAuthorizationRecord: ProductionExecutionClosureAuthorizationRecord,
  actor: string
): ProductionExecutionClosurePacketRecord {
  const providerSlug = closureAuthorizationRecord.provider.toLowerCase();
  const closurePacketManifestReference = `production-closure-packet-manifest-${providerSlug}.md`;
  const evidenceBundleReference = `production-evidence-bundle-${providerSlug}.zip`;
  const auditExportReference = `production-audit-export-${providerSlug}.jsonl`;
  const stakeholderNotificationProofReference = `production-stakeholder-notification-proof-${providerSlug}.md`;
  const retentionHandoffConfirmationReference = `production-retention-handoff-confirmation-${providerSlug}.md`;
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
      detail: closurePacketManifestReference,
    },
    {
      name: "Evidence bundle linked",
      passed: Boolean(evidenceBundleReference),
      detail: evidenceBundleReference,
    },
    {
      name: "Audit export linked",
      passed: Boolean(auditExportReference),
      detail: auditExportReference,
    },
    {
      name: "Stakeholder notification proof linked",
      passed: Boolean(stakeholderNotificationProofReference),
      detail: stakeholderNotificationProofReference,
    },
    {
      name: "Retention handoff confirmation linked",
      passed: Boolean(retentionHandoffConfirmationReference),
      detail: retentionHandoffConfirmationReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !closureAuthorizationRecord.provisioningEnabled && !closureAuthorizationRecord.killSwitch.enabled,
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
      `Closure packet manifest: ${closurePacketManifestReference}.`,
      `Evidence bundle: ${evidenceBundleReference}.`,
      `Audit export: ${auditExportReference}.`,
      `Stakeholder notification proof: ${stakeholderNotificationProofReference}.`,
      `Retention handoff confirmation: ${retentionHandoffConfirmationReference}.`,
      `Kill switch: ${closureAuthorizationRecord.killSwitch.name}=${
        closureAuthorizationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: closureAuthorizationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionArchivalHandoffRecord(
  closurePacketRecord: ProductionExecutionClosurePacketRecord,
  actor: string
): ProductionExecutionArchivalHandoffRecord {
  const providerSlug = closurePacketRecord.provider.toLowerCase();
  const archiveOwner = "Production Archive Owner";
  const retentionPolicyReference = `production-retention-policy-${providerSlug}.md`;
  const immutableStorageProofReference = `production-immutable-storage-proof-${providerSlug}.md`;
  const auditIndexReference = `production-audit-index-${providerSlug}.json`;
  const retrievalTestReference = `production-retrieval-test-${providerSlug}.md`;
  const checks = [
    {
      name: "Closure packet ready",
      passed: closurePacketRecord.status === "Ready for production execution closure packet review",
      detail: `${closurePacketRecord.id} is ${closurePacketRecord.status}.`,
    },
    {
      name: "Archive owner assigned",
      passed: Boolean(archiveOwner),
      detail: archiveOwner,
    },
    {
      name: "Retention policy linked",
      passed: Boolean(retentionPolicyReference),
      detail: retentionPolicyReference,
    },
    {
      name: "Immutable storage proof linked",
      passed: Boolean(immutableStorageProofReference),
      detail: immutableStorageProofReference,
    },
    {
      name: "Audit index linked",
      passed: Boolean(auditIndexReference),
      detail: auditIndexReference,
    },
    {
      name: "Retrieval test linked",
      passed: Boolean(retrievalTestReference),
      detail: retrievalTestReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !closurePacketRecord.provisioningEnabled && !closurePacketRecord.killSwitch.enabled,
      detail: `${closurePacketRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archival-handoff-record-${providerSlug}-${Date.now()}`,
    provider: closurePacketRecord.provider,
    closurePacketRecordId: closurePacketRecord.id,
    closureAuthorizationRecordId: closurePacketRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: closurePacketRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: closurePacketRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: closurePacketRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: closurePacketRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: closurePacketRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: closurePacketRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: closurePacketRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: closurePacketRecord.implementationHoldRecordId,
    cabDecisionRecordId: closurePacketRecord.cabDecisionRecordId,
    cabHandoffPacketId: closurePacketRecord.cabHandoffPacketId,
    freezeRecordId: closurePacketRecord.freezeRecordId,
    authorizationPacketId: closurePacketRecord.authorizationPacketId,
    promotionDossierId: closurePacketRecord.promotionDossierId,
    closurePackageId: closurePacketRecord.closurePackageId,
    outcomeRecordId: closurePacketRecord.outcomeRecordId,
    handoffPackageId: closurePacketRecord.handoffPackageId,
    controlledSwitchRequestId: closurePacketRecord.controlledSwitchRequestId,
    auditPackageId: closurePacketRecord.auditPackageId,
    switchReviewId: closurePacketRecord.switchReviewId,
    activationId: closurePacketRecord.activationId,
    idempotencyKey: closurePacketRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archival handoff review"
      : "Blocked",
    requestedBy: actor,
    archiveOwner,
    retentionPolicyReference,
    immutableStorageProofReference,
    auditIndexReference,
    retrievalTestReference,
    checks,
    evidence: [
      `Closure packet record: ${closurePacketRecord.id}.`,
      `Closure authorization record: ${closurePacketRecord.closureAuthorizationRecordId}.`,
      `Archive owner: ${archiveOwner}.`,
      `Retention policy: ${retentionPolicyReference}.`,
      `Immutable storage proof: ${immutableStorageProofReference}.`,
      `Audit index: ${auditIndexReference}.`,
      `Retrieval test: ${retrievalTestReference}.`,
      `Kill switch: ${closurePacketRecord.killSwitch.name}=${
        closurePacketRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: closurePacketRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionRetentionAttestationRecord(
  archivalHandoffRecord: ProductionExecutionArchivalHandoffRecord,
  actor: string
): ProductionExecutionRetentionAttestationRecord {
  const providerSlug = archivalHandoffRecord.provider.toLowerCase();
  const retentionOwner = "Production Retention Owner";
  const retentionScheduleProofReference = `production-retention-schedule-${providerSlug}.md`;
  const legalHoldCheckReference = `production-legal-hold-check-${providerSlug}.md`;
  const deletionExceptionRegisterReference = `production-deletion-exception-register-${providerSlug}.md`;
  const retrievalSlaProofReference = `production-retrieval-sla-proof-${providerSlug}.md`;
  const checks = [
    {
      name: "Archival handoff ready",
      passed: archivalHandoffRecord.status === "Ready for production execution archival handoff review",
      detail: `${archivalHandoffRecord.id} is ${archivalHandoffRecord.status}.`,
    },
    {
      name: "Retention owner assigned",
      passed: Boolean(retentionOwner),
      detail: retentionOwner,
    },
    {
      name: "Retention schedule proof linked",
      passed: Boolean(retentionScheduleProofReference),
      detail: retentionScheduleProofReference,
    },
    {
      name: "Legal hold check linked",
      passed: Boolean(legalHoldCheckReference),
      detail: legalHoldCheckReference,
    },
    {
      name: "Deletion exception register linked",
      passed: Boolean(deletionExceptionRegisterReference),
      detail: deletionExceptionRegisterReference,
    },
    {
      name: "Retrieval SLA proof linked",
      passed: Boolean(retrievalSlaProofReference),
      detail: retrievalSlaProofReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !archivalHandoffRecord.provisioningEnabled && !archivalHandoffRecord.killSwitch.enabled,
      detail: `${archivalHandoffRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-retention-attestation-record-${providerSlug}-${Date.now()}`,
    provider: archivalHandoffRecord.provider,
    archivalHandoffRecordId: archivalHandoffRecord.id,
    closurePacketRecordId: archivalHandoffRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archivalHandoffRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archivalHandoffRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archivalHandoffRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archivalHandoffRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archivalHandoffRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archivalHandoffRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archivalHandoffRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archivalHandoffRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archivalHandoffRecord.implementationHoldRecordId,
    cabDecisionRecordId: archivalHandoffRecord.cabDecisionRecordId,
    cabHandoffPacketId: archivalHandoffRecord.cabHandoffPacketId,
    freezeRecordId: archivalHandoffRecord.freezeRecordId,
    authorizationPacketId: archivalHandoffRecord.authorizationPacketId,
    promotionDossierId: archivalHandoffRecord.promotionDossierId,
    closurePackageId: archivalHandoffRecord.closurePackageId,
    outcomeRecordId: archivalHandoffRecord.outcomeRecordId,
    handoffPackageId: archivalHandoffRecord.handoffPackageId,
    controlledSwitchRequestId: archivalHandoffRecord.controlledSwitchRequestId,
    auditPackageId: archivalHandoffRecord.auditPackageId,
    switchReviewId: archivalHandoffRecord.switchReviewId,
    activationId: archivalHandoffRecord.activationId,
    idempotencyKey: archivalHandoffRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution retention attestation review"
      : "Blocked",
    requestedBy: actor,
    retentionOwner,
    retentionScheduleProofReference,
    legalHoldCheckReference,
    deletionExceptionRegisterReference,
    retrievalSlaProofReference,
    checks,
    evidence: [
      `Archival handoff record: ${archivalHandoffRecord.id}.`,
      `Closure packet record: ${archivalHandoffRecord.closurePacketRecordId}.`,
      `Retention owner: ${retentionOwner}.`,
      `Retention schedule proof: ${retentionScheduleProofReference}.`,
      `Legal hold check: ${legalHoldCheckReference}.`,
      `Deletion exception register: ${deletionExceptionRegisterReference}.`,
      `Retrieval SLA proof: ${retrievalSlaProofReference}.`,
      `Kill switch: ${archivalHandoffRecord.killSwitch.name}=${
        archivalHandoffRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archivalHandoffRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionFinalArchiveCertificationRecord(
  retentionAttestationRecord: ProductionExecutionRetentionAttestationRecord,
  actor: string
): ProductionExecutionFinalArchiveCertificationRecord {
  const providerSlug = retentionAttestationRecord.provider.toLowerCase();
  const certificationOwner = "Production Archive Certifier";
  const finalArchiveManifestReference = `production-final-archive-manifest-${providerSlug}.md`;
  const retentionLockProofReference = `production-retention-lock-proof-${providerSlug}.md`;
  const complianceSignOffReference = `production-compliance-signoff-${providerSlug}.md`;
  const retrievalWitnessProofReference = `production-retrieval-witness-proof-${providerSlug}.md`;
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
      detail: certificationOwner,
    },
    {
      name: "Final archive manifest linked",
      passed: Boolean(finalArchiveManifestReference),
      detail: finalArchiveManifestReference,
    },
    {
      name: "Retention lock proof linked",
      passed: Boolean(retentionLockProofReference),
      detail: retentionLockProofReference,
    },
    {
      name: "Compliance sign-off linked",
      passed: Boolean(complianceSignOffReference),
      detail: complianceSignOffReference,
    },
    {
      name: "Retrieval witness proof linked",
      passed: Boolean(retrievalWitnessProofReference),
      detail: retrievalWitnessProofReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !retentionAttestationRecord.provisioningEnabled && !retentionAttestationRecord.killSwitch.enabled,
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
      `Certification owner: ${certificationOwner}.`,
      `Final archive manifest: ${finalArchiveManifestReference}.`,
      `Retention lock proof: ${retentionLockProofReference}.`,
      `Compliance sign-off: ${complianceSignOffReference}.`,
      `Retrieval witness proof: ${retrievalWitnessProofReference}.`,
      `Kill switch: ${retentionAttestationRecord.killSwitch.name}=${
        retentionAttestationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: retentionAttestationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionCompletionDossierRecord(
  finalArchiveCertificationRecord: ProductionExecutionFinalArchiveCertificationRecord,
  actor: string
): ProductionExecutionCompletionDossierRecord {
  const providerSlug = finalArchiveCertificationRecord.provider.toLowerCase();
  const dossierOwner = "Production Completion Dossier Owner";
  const finalEvidenceIndexReference = `production-final-evidence-index-${providerSlug}.md`;
  const auditExportReference = `production-completion-audit-export-${providerSlug}.jsonl`;
  const operationsAcceptanceReference = `production-operations-acceptance-${providerSlug}.md`;
  const complianceClosureProofReference = `production-compliance-closure-proof-${providerSlug}.md`;
  const checks = [
    {
      name: "Final archive certification ready",
      passed:
        finalArchiveCertificationRecord.status ===
        "Ready for production execution final archive certification review",
      detail: `${finalArchiveCertificationRecord.id} is ${finalArchiveCertificationRecord.status}.`,
    },
    {
      name: "Dossier owner assigned",
      passed: Boolean(dossierOwner),
      detail: dossierOwner,
    },
    {
      name: "Final evidence index linked",
      passed: Boolean(finalEvidenceIndexReference),
      detail: finalEvidenceIndexReference,
    },
    {
      name: "Audit export linked",
      passed: Boolean(auditExportReference),
      detail: auditExportReference,
    },
    {
      name: "Operations acceptance linked",
      passed: Boolean(operationsAcceptanceReference),
      detail: operationsAcceptanceReference,
    },
    {
      name: "Compliance closure proof linked",
      passed: Boolean(complianceClosureProofReference),
      detail: complianceClosureProofReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !finalArchiveCertificationRecord.provisioningEnabled && !finalArchiveCertificationRecord.killSwitch.enabled,
      detail: `${finalArchiveCertificationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-completion-dossier-record-${providerSlug}-${Date.now()}`,
    provider: finalArchiveCertificationRecord.provider,
    finalArchiveCertificationRecordId: finalArchiveCertificationRecord.id,
    retentionAttestationRecordId: finalArchiveCertificationRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: finalArchiveCertificationRecord.archivalHandoffRecordId,
    closurePacketRecordId: finalArchiveCertificationRecord.closurePacketRecordId,
    closureAuthorizationRecordId: finalArchiveCertificationRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: finalArchiveCertificationRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: finalArchiveCertificationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: finalArchiveCertificationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: finalArchiveCertificationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: finalArchiveCertificationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: finalArchiveCertificationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: finalArchiveCertificationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: finalArchiveCertificationRecord.implementationHoldRecordId,
    cabDecisionRecordId: finalArchiveCertificationRecord.cabDecisionRecordId,
    cabHandoffPacketId: finalArchiveCertificationRecord.cabHandoffPacketId,
    freezeRecordId: finalArchiveCertificationRecord.freezeRecordId,
    authorizationPacketId: finalArchiveCertificationRecord.authorizationPacketId,
    promotionDossierId: finalArchiveCertificationRecord.promotionDossierId,
    closurePackageId: finalArchiveCertificationRecord.closurePackageId,
    outcomeRecordId: finalArchiveCertificationRecord.outcomeRecordId,
    handoffPackageId: finalArchiveCertificationRecord.handoffPackageId,
    controlledSwitchRequestId: finalArchiveCertificationRecord.controlledSwitchRequestId,
    auditPackageId: finalArchiveCertificationRecord.auditPackageId,
    switchReviewId: finalArchiveCertificationRecord.switchReviewId,
    activationId: finalArchiveCertificationRecord.activationId,
    idempotencyKey: finalArchiveCertificationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution completion dossier review"
      : "Blocked",
    requestedBy: actor,
    dossierOwner,
    finalEvidenceIndexReference,
    auditExportReference,
    operationsAcceptanceReference,
    complianceClosureProofReference,
    checks,
    evidence: [
      `Final archive certification record: ${finalArchiveCertificationRecord.id}.`,
      `Retention attestation record: ${finalArchiveCertificationRecord.retentionAttestationRecordId}.`,
      `Dossier owner: ${dossierOwner}.`,
      `Final evidence index: ${finalEvidenceIndexReference}.`,
      `Audit export: ${auditExportReference}.`,
      `Operations acceptance: ${operationsAcceptanceReference}.`,
      `Compliance closure proof: ${complianceClosureProofReference}.`,
      `Kill switch: ${finalArchiveCertificationRecord.killSwitch.name}=${
        finalArchiveCertificationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: finalArchiveCertificationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionOperationsHandoverRecord(
  completionDossierRecord: ProductionExecutionCompletionDossierRecord,
  actor: string
): ProductionExecutionOperationsHandoverRecord {
  const providerSlug = completionDossierRecord.provider.toLowerCase();
  const operationsOwner = "Production Operations Owner";
  const supportModelReference = `production-support-model-${providerSlug}.md`;
  const monitoringHandoverProofReference = `production-monitoring-handover-${providerSlug}.md`;
  const escalationRouteReference = `production-escalation-route-${providerSlug}.md`;
  const serviceDeskAcceptanceReference = `production-service-desk-acceptance-${providerSlug}.md`;
  const checks = [
    {
      name: "Completion dossier ready",
      passed:
        completionDossierRecord.status ===
        "Ready for production execution completion dossier review",
      detail: `${completionDossierRecord.id} is ${completionDossierRecord.status}.`,
    },
    {
      name: "Operations owner assigned",
      passed: Boolean(operationsOwner),
      detail: operationsOwner,
    },
    {
      name: "Support model linked",
      passed: Boolean(supportModelReference),
      detail: supportModelReference,
    },
    {
      name: "Monitoring handover proof linked",
      passed: Boolean(monitoringHandoverProofReference),
      detail: monitoringHandoverProofReference,
    },
    {
      name: "Escalation route linked",
      passed: Boolean(escalationRouteReference),
      detail: escalationRouteReference,
    },
    {
      name: "Service desk acceptance linked",
      passed: Boolean(serviceDeskAcceptanceReference),
      detail: serviceDeskAcceptanceReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !completionDossierRecord.provisioningEnabled && !completionDossierRecord.killSwitch.enabled,
      detail: `${completionDossierRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-operations-handover-record-${providerSlug}-${Date.now()}`,
    provider: completionDossierRecord.provider,
    completionDossierRecordId: completionDossierRecord.id,
    finalArchiveCertificationRecordId: completionDossierRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: completionDossierRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: completionDossierRecord.archivalHandoffRecordId,
    closurePacketRecordId: completionDossierRecord.closurePacketRecordId,
    closureAuthorizationRecordId: completionDossierRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: completionDossierRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: completionDossierRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: completionDossierRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: completionDossierRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: completionDossierRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: completionDossierRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: completionDossierRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: completionDossierRecord.implementationHoldRecordId,
    cabDecisionRecordId: completionDossierRecord.cabDecisionRecordId,
    cabHandoffPacketId: completionDossierRecord.cabHandoffPacketId,
    freezeRecordId: completionDossierRecord.freezeRecordId,
    authorizationPacketId: completionDossierRecord.authorizationPacketId,
    promotionDossierId: completionDossierRecord.promotionDossierId,
    closurePackageId: completionDossierRecord.closurePackageId,
    outcomeRecordId: completionDossierRecord.outcomeRecordId,
    handoffPackageId: completionDossierRecord.handoffPackageId,
    controlledSwitchRequestId: completionDossierRecord.controlledSwitchRequestId,
    auditPackageId: completionDossierRecord.auditPackageId,
    switchReviewId: completionDossierRecord.switchReviewId,
    activationId: completionDossierRecord.activationId,
    idempotencyKey: completionDossierRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution operations handover review"
      : "Blocked",
    requestedBy: actor,
    operationsOwner,
    supportModelReference,
    monitoringHandoverProofReference,
    escalationRouteReference,
    serviceDeskAcceptanceReference,
    checks,
    evidence: [
      `Completion dossier record: ${completionDossierRecord.id}.`,
      `Final archive certification record: ${completionDossierRecord.finalArchiveCertificationRecordId}.`,
      `Operations owner: ${operationsOwner}.`,
      `Support model: ${supportModelReference}.`,
      `Monitoring handover proof: ${monitoringHandoverProofReference}.`,
      `Escalation route: ${escalationRouteReference}.`,
      `Service desk acceptance: ${serviceDeskAcceptanceReference}.`,
      `Kill switch: ${completionDossierRecord.killSwitch.name}=${
        completionDossierRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: completionDossierRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionSupportReadinessRecord(
  operationsHandoverRecord: ProductionExecutionOperationsHandoverRecord,
  actor: string
): ProductionExecutionSupportReadinessRecord {
  const providerSlug = operationsHandoverRecord.provider.toLowerCase();
  const supportOwner = "Production Support Owner";
  const runbookAcceptanceReference = `production-runbook-acceptance-${providerSlug}.md`;
  const alertRoutingProofReference = `production-alert-routing-proof-${providerSlug}.md`;
  const incidentProcessReference = `production-incident-process-${providerSlug}.md`;
  const knowledgeBasePublicationReference = `production-knowledge-base-publication-${providerSlug}.md`;
  const checks = [
    {
      name: "Operations handover ready",
      passed:
        operationsHandoverRecord.status ===
        "Ready for production execution operations handover review",
      detail: `${operationsHandoverRecord.id} is ${operationsHandoverRecord.status}.`,
    },
    {
      name: "Support owner assigned",
      passed: Boolean(supportOwner),
      detail: supportOwner,
    },
    {
      name: "Runbook acceptance linked",
      passed: Boolean(runbookAcceptanceReference),
      detail: runbookAcceptanceReference,
    },
    {
      name: "Alert routing proof linked",
      passed: Boolean(alertRoutingProofReference),
      detail: alertRoutingProofReference,
    },
    {
      name: "Incident process linked",
      passed: Boolean(incidentProcessReference),
      detail: incidentProcessReference,
    },
    {
      name: "Knowledge base publication linked",
      passed: Boolean(knowledgeBasePublicationReference),
      detail: knowledgeBasePublicationReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !operationsHandoverRecord.provisioningEnabled && !operationsHandoverRecord.killSwitch.enabled,
      detail: `${operationsHandoverRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-support-readiness-record-${providerSlug}-${Date.now()}`,
    provider: operationsHandoverRecord.provider,
    operationsHandoverRecordId: operationsHandoverRecord.id,
    completionDossierRecordId: operationsHandoverRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: operationsHandoverRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: operationsHandoverRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: operationsHandoverRecord.archivalHandoffRecordId,
    closurePacketRecordId: operationsHandoverRecord.closurePacketRecordId,
    closureAuthorizationRecordId: operationsHandoverRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: operationsHandoverRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: operationsHandoverRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: operationsHandoverRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: operationsHandoverRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: operationsHandoverRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: operationsHandoverRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: operationsHandoverRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: operationsHandoverRecord.implementationHoldRecordId,
    cabDecisionRecordId: operationsHandoverRecord.cabDecisionRecordId,
    cabHandoffPacketId: operationsHandoverRecord.cabHandoffPacketId,
    freezeRecordId: operationsHandoverRecord.freezeRecordId,
    authorizationPacketId: operationsHandoverRecord.authorizationPacketId,
    promotionDossierId: operationsHandoverRecord.promotionDossierId,
    closurePackageId: operationsHandoverRecord.closurePackageId,
    outcomeRecordId: operationsHandoverRecord.outcomeRecordId,
    handoffPackageId: operationsHandoverRecord.handoffPackageId,
    controlledSwitchRequestId: operationsHandoverRecord.controlledSwitchRequestId,
    auditPackageId: operationsHandoverRecord.auditPackageId,
    switchReviewId: operationsHandoverRecord.switchReviewId,
    activationId: operationsHandoverRecord.activationId,
    idempotencyKey: operationsHandoverRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution support readiness review"
      : "Blocked",
    requestedBy: actor,
    supportOwner,
    runbookAcceptanceReference,
    alertRoutingProofReference,
    incidentProcessReference,
    knowledgeBasePublicationReference,
    checks,
    evidence: [
      `Operations handover record: ${operationsHandoverRecord.id}.`,
      `Completion dossier record: ${operationsHandoverRecord.completionDossierRecordId}.`,
      `Support owner: ${supportOwner}.`,
      `Runbook acceptance: ${runbookAcceptanceReference}.`,
      `Alert routing proof: ${alertRoutingProofReference}.`,
      `Incident process: ${incidentProcessReference}.`,
      `Knowledge base publication: ${knowledgeBasePublicationReference}.`,
      `Kill switch: ${operationsHandoverRecord.killSwitch.name}=${
        operationsHandoverRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: operationsHandoverRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionServiceAcceptanceRecord(
  supportReadinessRecord: ProductionExecutionSupportReadinessRecord,
  actor: string
): ProductionExecutionServiceAcceptanceRecord {
  const providerSlug = supportReadinessRecord.provider.toLowerCase();
  const serviceOwner = "Production Service Owner";
  const acceptanceCriteriaReference = `production-acceptance-criteria-${providerSlug}.md`;
  const operationalSloReference = `production-operational-slo-${providerSlug}.md`;
  const supportSignOffReference = `production-support-signoff-${providerSlug}.md`;
  const finalCustomerNotificationReference = `production-final-customer-notification-${providerSlug}.md`;
  const checks = [
    {
      name: "Support readiness ready",
      passed:
        supportReadinessRecord.status ===
        "Ready for production execution support readiness review",
      detail: `${supportReadinessRecord.id} is ${supportReadinessRecord.status}.`,
    },
    {
      name: "Service owner assigned",
      passed: Boolean(serviceOwner),
      detail: serviceOwner,
    },
    {
      name: "Acceptance criteria linked",
      passed: Boolean(acceptanceCriteriaReference),
      detail: acceptanceCriteriaReference,
    },
    {
      name: "Operational SLO linked",
      passed: Boolean(operationalSloReference),
      detail: operationalSloReference,
    },
    {
      name: "Support sign-off linked",
      passed: Boolean(supportSignOffReference),
      detail: supportSignOffReference,
    },
    {
      name: "Customer notification linked",
      passed: Boolean(finalCustomerNotificationReference),
      detail: finalCustomerNotificationReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !supportReadinessRecord.provisioningEnabled && !supportReadinessRecord.killSwitch.enabled,
      detail: `${supportReadinessRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-service-acceptance-record-${providerSlug}-${Date.now()}`,
    provider: supportReadinessRecord.provider,
    supportReadinessRecordId: supportReadinessRecord.id,
    operationsHandoverRecordId: supportReadinessRecord.operationsHandoverRecordId,
    completionDossierRecordId: supportReadinessRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: supportReadinessRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: supportReadinessRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: supportReadinessRecord.archivalHandoffRecordId,
    closurePacketRecordId: supportReadinessRecord.closurePacketRecordId,
    closureAuthorizationRecordId: supportReadinessRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: supportReadinessRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: supportReadinessRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: supportReadinessRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: supportReadinessRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: supportReadinessRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: supportReadinessRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: supportReadinessRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: supportReadinessRecord.implementationHoldRecordId,
    cabDecisionRecordId: supportReadinessRecord.cabDecisionRecordId,
    cabHandoffPacketId: supportReadinessRecord.cabHandoffPacketId,
    freezeRecordId: supportReadinessRecord.freezeRecordId,
    authorizationPacketId: supportReadinessRecord.authorizationPacketId,
    promotionDossierId: supportReadinessRecord.promotionDossierId,
    closurePackageId: supportReadinessRecord.closurePackageId,
    outcomeRecordId: supportReadinessRecord.outcomeRecordId,
    handoffPackageId: supportReadinessRecord.handoffPackageId,
    controlledSwitchRequestId: supportReadinessRecord.controlledSwitchRequestId,
    auditPackageId: supportReadinessRecord.auditPackageId,
    switchReviewId: supportReadinessRecord.switchReviewId,
    activationId: supportReadinessRecord.activationId,
    idempotencyKey: supportReadinessRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution service acceptance review"
      : "Blocked",
    requestedBy: actor,
    serviceOwner,
    acceptanceCriteriaReference,
    operationalSloReference,
    supportSignOffReference,
    finalCustomerNotificationReference,
    checks,
    evidence: [
      `Support readiness record: ${supportReadinessRecord.id}.`,
      `Operations handover record: ${supportReadinessRecord.operationsHandoverRecordId}.`,
      `Service owner: ${serviceOwner}.`,
      `Acceptance criteria: ${acceptanceCriteriaReference}.`,
      `Operational SLO: ${operationalSloReference}.`,
      `Support sign-off: ${supportSignOffReference}.`,
      `Final customer notification: ${finalCustomerNotificationReference}.`,
      `Kill switch: ${supportReadinessRecord.killSwitch.name}=${
        supportReadinessRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: supportReadinessRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionFinalTurnoverRecord(
  serviceAcceptanceRecord: ProductionExecutionServiceAcceptanceRecord,
  actor: string
): ProductionExecutionFinalTurnoverRecord {
  const providerSlug = serviceAcceptanceRecord.provider.toLowerCase();
  const turnoverOwner = "Production Turnover Owner";
  const finalServiceCatalogReference = `production-final-service-catalog-${providerSlug}.md`;
  const ownershipTransferProofReference = `production-ownership-transfer-proof-${providerSlug}.md`;
  const executiveClosureNoteReference = `production-executive-closure-note-${providerSlug}.md`;
  const postImplementationReviewScheduleReference =
    `production-post-implementation-review-schedule-${providerSlug}.md`;
  const checks = [
    {
      name: "Service acceptance ready",
      passed:
        serviceAcceptanceRecord.status ===
        "Ready for production execution service acceptance review",
      detail: `${serviceAcceptanceRecord.id} is ${serviceAcceptanceRecord.status}.`,
    },
    {
      name: "Turnover owner assigned",
      passed: Boolean(turnoverOwner),
      detail: turnoverOwner,
    },
    {
      name: "Final service catalog linked",
      passed: Boolean(finalServiceCatalogReference),
      detail: finalServiceCatalogReference,
    },
    {
      name: "Ownership transfer proof linked",
      passed: Boolean(ownershipTransferProofReference),
      detail: ownershipTransferProofReference,
    },
    {
      name: "Executive closure note linked",
      passed: Boolean(executiveClosureNoteReference),
      detail: executiveClosureNoteReference,
    },
    {
      name: "Post-implementation review scheduled",
      passed: Boolean(postImplementationReviewScheduleReference),
      detail: postImplementationReviewScheduleReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !serviceAcceptanceRecord.provisioningEnabled && !serviceAcceptanceRecord.killSwitch.enabled,
      detail: `${serviceAcceptanceRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-final-turnover-record-${providerSlug}-${Date.now()}`,
    provider: serviceAcceptanceRecord.provider,
    serviceAcceptanceRecordId: serviceAcceptanceRecord.id,
    supportReadinessRecordId: serviceAcceptanceRecord.supportReadinessRecordId,
    operationsHandoverRecordId: serviceAcceptanceRecord.operationsHandoverRecordId,
    completionDossierRecordId: serviceAcceptanceRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: serviceAcceptanceRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: serviceAcceptanceRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: serviceAcceptanceRecord.archivalHandoffRecordId,
    closurePacketRecordId: serviceAcceptanceRecord.closurePacketRecordId,
    closureAuthorizationRecordId: serviceAcceptanceRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: serviceAcceptanceRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: serviceAcceptanceRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: serviceAcceptanceRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: serviceAcceptanceRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: serviceAcceptanceRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: serviceAcceptanceRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: serviceAcceptanceRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: serviceAcceptanceRecord.implementationHoldRecordId,
    cabDecisionRecordId: serviceAcceptanceRecord.cabDecisionRecordId,
    cabHandoffPacketId: serviceAcceptanceRecord.cabHandoffPacketId,
    freezeRecordId: serviceAcceptanceRecord.freezeRecordId,
    authorizationPacketId: serviceAcceptanceRecord.authorizationPacketId,
    promotionDossierId: serviceAcceptanceRecord.promotionDossierId,
    closurePackageId: serviceAcceptanceRecord.closurePackageId,
    outcomeRecordId: serviceAcceptanceRecord.outcomeRecordId,
    handoffPackageId: serviceAcceptanceRecord.handoffPackageId,
    controlledSwitchRequestId: serviceAcceptanceRecord.controlledSwitchRequestId,
    auditPackageId: serviceAcceptanceRecord.auditPackageId,
    switchReviewId: serviceAcceptanceRecord.switchReviewId,
    activationId: serviceAcceptanceRecord.activationId,
    idempotencyKey: serviceAcceptanceRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution final turnover review"
      : "Blocked",
    requestedBy: actor,
    turnoverOwner,
    finalServiceCatalogReference,
    ownershipTransferProofReference,
    executiveClosureNoteReference,
    postImplementationReviewScheduleReference,
    checks,
    evidence: [
      `Service acceptance record: ${serviceAcceptanceRecord.id}.`,
      `Support readiness record: ${serviceAcceptanceRecord.supportReadinessRecordId}.`,
      `Turnover owner: ${turnoverOwner}.`,
      `Final service catalog: ${finalServiceCatalogReference}.`,
      `Ownership transfer proof: ${ownershipTransferProofReference}.`,
      `Executive closure note: ${executiveClosureNoteReference}.`,
      `Post-implementation review schedule: ${postImplementationReviewScheduleReference}.`,
      `Kill switch: ${serviceAcceptanceRecord.killSwitch.name}=${
        serviceAcceptanceRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: serviceAcceptanceRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionOperationalClosureRecord(
  finalTurnoverRecord: ProductionExecutionFinalTurnoverRecord,
  actor: string
): ProductionExecutionOperationalClosureRecord {
  const providerSlug = finalTurnoverRecord.provider.toLowerCase();
  const closureOwner = "Production Closure Owner";
  const steadyStateOperatingModelReference = `production-steady-state-operating-model-${providerSlug}.md`;
  const sloReviewProofReference = `production-slo-review-proof-${providerSlug}.md`;
  const supportBacklogHandoffReference = `production-support-backlog-handoff-${providerSlug}.md`;
  const residualRiskAcceptanceReference = `production-residual-risk-acceptance-${providerSlug}.md`;
  const checks = [
    {
      name: "Final turnover ready",
      passed:
        finalTurnoverRecord.status ===
        "Ready for production execution final turnover review",
      detail: `${finalTurnoverRecord.id} is ${finalTurnoverRecord.status}.`,
    },
    {
      name: "Closure owner assigned",
      passed: Boolean(closureOwner),
      detail: closureOwner,
    },
    {
      name: "Steady-state operating model linked",
      passed: Boolean(steadyStateOperatingModelReference),
      detail: steadyStateOperatingModelReference,
    },
    {
      name: "SLO review proof linked",
      passed: Boolean(sloReviewProofReference),
      detail: sloReviewProofReference,
    },
    {
      name: "Support backlog handoff linked",
      passed: Boolean(supportBacklogHandoffReference),
      detail: supportBacklogHandoffReference,
    },
    {
      name: "Residual-risk acceptance linked",
      passed: Boolean(residualRiskAcceptanceReference),
      detail: residualRiskAcceptanceReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !finalTurnoverRecord.provisioningEnabled && !finalTurnoverRecord.killSwitch.enabled,
      detail: `${finalTurnoverRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-operational-closure-record-${providerSlug}-${Date.now()}`,
    provider: finalTurnoverRecord.provider,
    finalTurnoverRecordId: finalTurnoverRecord.id,
    serviceAcceptanceRecordId: finalTurnoverRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: finalTurnoverRecord.supportReadinessRecordId,
    operationsHandoverRecordId: finalTurnoverRecord.operationsHandoverRecordId,
    completionDossierRecordId: finalTurnoverRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: finalTurnoverRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: finalTurnoverRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: finalTurnoverRecord.archivalHandoffRecordId,
    closurePacketRecordId: finalTurnoverRecord.closurePacketRecordId,
    closureAuthorizationRecordId: finalTurnoverRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: finalTurnoverRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: finalTurnoverRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: finalTurnoverRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: finalTurnoverRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: finalTurnoverRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: finalTurnoverRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: finalTurnoverRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: finalTurnoverRecord.implementationHoldRecordId,
    cabDecisionRecordId: finalTurnoverRecord.cabDecisionRecordId,
    cabHandoffPacketId: finalTurnoverRecord.cabHandoffPacketId,
    freezeRecordId: finalTurnoverRecord.freezeRecordId,
    authorizationPacketId: finalTurnoverRecord.authorizationPacketId,
    promotionDossierId: finalTurnoverRecord.promotionDossierId,
    closurePackageId: finalTurnoverRecord.closurePackageId,
    outcomeRecordId: finalTurnoverRecord.outcomeRecordId,
    handoffPackageId: finalTurnoverRecord.handoffPackageId,
    controlledSwitchRequestId: finalTurnoverRecord.controlledSwitchRequestId,
    auditPackageId: finalTurnoverRecord.auditPackageId,
    switchReviewId: finalTurnoverRecord.switchReviewId,
    activationId: finalTurnoverRecord.activationId,
    idempotencyKey: finalTurnoverRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution operational closure review"
      : "Blocked",
    requestedBy: actor,
    closureOwner,
    steadyStateOperatingModelReference,
    sloReviewProofReference,
    supportBacklogHandoffReference,
    residualRiskAcceptanceReference,
    checks,
    evidence: [
      `Final turnover record: ${finalTurnoverRecord.id}.`,
      `Service acceptance record: ${finalTurnoverRecord.serviceAcceptanceRecordId}.`,
      `Closure owner: ${closureOwner}.`,
      `Steady-state operating model: ${steadyStateOperatingModelReference}.`,
      `SLO review proof: ${sloReviewProofReference}.`,
      `Support backlog handoff: ${supportBacklogHandoffReference}.`,
      `Residual-risk acceptance: ${residualRiskAcceptanceReference}.`,
      `Kill switch: ${finalTurnoverRecord.killSwitch.name}=${
        finalTurnoverRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: finalTurnoverRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionPostImplementationReviewRecord(
  operationalClosureRecord: ProductionExecutionOperationalClosureRecord,
  actor: string
): ProductionExecutionPostImplementationReviewRecord {
  const providerSlug = operationalClosureRecord.provider.toLowerCase();
  const reviewOwner = "Production PIR Owner";
  const pirMinutesReference = `production-pir-minutes-${providerSlug}.md`;
  const incidentReviewProofReference = `production-incident-review-proof-${providerSlug}.md`;
  const costVarianceReviewReference = `production-cost-variance-review-${providerSlug}.md`;
  const improvementBacklogReference = `production-improvement-backlog-${providerSlug}.md`;
  const checks = [
    {
      name: "Operational closure ready",
      passed:
        operationalClosureRecord.status ===
        "Ready for production execution operational closure review",
      detail: `${operationalClosureRecord.id} is ${operationalClosureRecord.status}.`,
    },
    {
      name: "Review owner assigned",
      passed: Boolean(reviewOwner),
      detail: reviewOwner,
    },
    {
      name: "PIR minutes linked",
      passed: Boolean(pirMinutesReference),
      detail: pirMinutesReference,
    },
    {
      name: "Incident review proof linked",
      passed: Boolean(incidentReviewProofReference),
      detail: incidentReviewProofReference,
    },
    {
      name: "Cost variance review linked",
      passed: Boolean(costVarianceReviewReference),
      detail: costVarianceReviewReference,
    },
    {
      name: "Improvement backlog linked",
      passed: Boolean(improvementBacklogReference),
      detail: improvementBacklogReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !operationalClosureRecord.provisioningEnabled && !operationalClosureRecord.killSwitch.enabled,
      detail: `${operationalClosureRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-post-implementation-review-record-${providerSlug}-${Date.now()}`,
    provider: operationalClosureRecord.provider,
    operationalClosureRecordId: operationalClosureRecord.id,
    finalTurnoverRecordId: operationalClosureRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: operationalClosureRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: operationalClosureRecord.supportReadinessRecordId,
    operationsHandoverRecordId: operationalClosureRecord.operationsHandoverRecordId,
    completionDossierRecordId: operationalClosureRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: operationalClosureRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: operationalClosureRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: operationalClosureRecord.archivalHandoffRecordId,
    closurePacketRecordId: operationalClosureRecord.closurePacketRecordId,
    closureAuthorizationRecordId: operationalClosureRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: operationalClosureRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: operationalClosureRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: operationalClosureRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: operationalClosureRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: operationalClosureRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: operationalClosureRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: operationalClosureRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: operationalClosureRecord.implementationHoldRecordId,
    cabDecisionRecordId: operationalClosureRecord.cabDecisionRecordId,
    cabHandoffPacketId: operationalClosureRecord.cabHandoffPacketId,
    freezeRecordId: operationalClosureRecord.freezeRecordId,
    authorizationPacketId: operationalClosureRecord.authorizationPacketId,
    promotionDossierId: operationalClosureRecord.promotionDossierId,
    closurePackageId: operationalClosureRecord.closurePackageId,
    outcomeRecordId: operationalClosureRecord.outcomeRecordId,
    handoffPackageId: operationalClosureRecord.handoffPackageId,
    controlledSwitchRequestId: operationalClosureRecord.controlledSwitchRequestId,
    auditPackageId: operationalClosureRecord.auditPackageId,
    switchReviewId: operationalClosureRecord.switchReviewId,
    activationId: operationalClosureRecord.activationId,
    idempotencyKey: operationalClosureRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution post-implementation review"
      : "Blocked",
    requestedBy: actor,
    reviewOwner,
    pirMinutesReference,
    incidentReviewProofReference,
    costVarianceReviewReference,
    improvementBacklogReference,
    checks,
    evidence: [
      `Operational closure record: ${operationalClosureRecord.id}.`,
      `Final turnover record: ${operationalClosureRecord.finalTurnoverRecordId}.`,
      `Review owner: ${reviewOwner}.`,
      `PIR minutes: ${pirMinutesReference}.`,
      `Incident review proof: ${incidentReviewProofReference}.`,
      `Cost variance review: ${costVarianceReviewReference}.`,
      `Improvement backlog: ${improvementBacklogReference}.`,
      `Kill switch: ${operationalClosureRecord.killSwitch.name}=${
        operationalClosureRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: operationalClosureRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionImprovementClosureRecord(
  postImplementationReviewRecord: ProductionExecutionPostImplementationReviewRecord,
  actor: string
): ProductionExecutionImprovementClosureRecord {
  const providerSlug = postImplementationReviewRecord.provider.toLowerCase();
  const improvementOwner = "Production Improvement Owner";
  const actionRegisterReference = `production-improvement-action-register-${providerSlug}.md`;
  const acceptedDeferralsReference = `production-accepted-deferrals-${providerSlug}.md`;
  const lessonsLearnedPublicationReference = `production-lessons-learned-publication-${providerSlug}.md`;
  const nextCycleOwner = "Production Next-Cycle Owner";
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
      detail: improvementOwner,
    },
    {
      name: "Action register linked",
      passed: Boolean(actionRegisterReference),
      detail: actionRegisterReference,
    },
    {
      name: "Accepted deferrals linked",
      passed: Boolean(acceptedDeferralsReference),
      detail: acceptedDeferralsReference,
    },
    {
      name: "Lessons learned published",
      passed: Boolean(lessonsLearnedPublicationReference),
      detail: lessonsLearnedPublicationReference,
    },
    {
      name: "Next-cycle owner assigned",
      passed: Boolean(nextCycleOwner),
      detail: nextCycleOwner,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !postImplementationReviewRecord.provisioningEnabled && !postImplementationReviewRecord.killSwitch.enabled,
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
      `Improvement owner: ${improvementOwner}.`,
      `Action register: ${actionRegisterReference}.`,
      `Accepted deferrals: ${acceptedDeferralsReference}.`,
      `Lessons learned: ${lessonsLearnedPublicationReference}.`,
      `Next-cycle owner: ${nextCycleOwner}.`,
      `Kill switch: ${postImplementationReviewRecord.killSwitch.name}=${
        postImplementationReviewRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: postImplementationReviewRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionFinalAcceptanceArchiveRecord(
  improvementClosureRecord: ProductionExecutionImprovementClosureRecord,
  actor: string
): ProductionExecutionFinalAcceptanceArchiveRecord {
  const providerSlug = improvementClosureRecord.provider.toLowerCase();
  const archiveOwner = "Production Archive Owner";
  const acceptanceArchiveIndexReference = `production-acceptance-archive-index-${providerSlug}.md`;
  const finalEvidenceChecksumReference = `production-final-evidence-checksum-${providerSlug}.sha256`;
  const stakeholderReceiptProofReference = `production-stakeholder-receipt-proof-${providerSlug}.md`;
  const retrievalOwner = "Production Retrieval Owner";
  const checks = [
    {
      name: "Improvement closure ready",
      passed:
        improvementClosureRecord.status ===
        "Ready for production execution improvement closure review",
      detail: `${improvementClosureRecord.id} is ${improvementClosureRecord.status}.`,
    },
    {
      name: "Archive owner assigned",
      passed: Boolean(archiveOwner),
      detail: archiveOwner,
    },
    {
      name: "Acceptance archive index linked",
      passed: Boolean(acceptanceArchiveIndexReference),
      detail: acceptanceArchiveIndexReference,
    },
    {
      name: "Final evidence checksum linked",
      passed: Boolean(finalEvidenceChecksumReference),
      detail: finalEvidenceChecksumReference,
    },
    {
      name: "Stakeholder receipt proof linked",
      passed: Boolean(stakeholderReceiptProofReference),
      detail: stakeholderReceiptProofReference,
    },
    {
      name: "Retrieval owner assigned",
      passed: Boolean(retrievalOwner),
      detail: retrievalOwner,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !improvementClosureRecord.provisioningEnabled && !improvementClosureRecord.killSwitch.enabled,
      detail: `${improvementClosureRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-final-acceptance-archive-record-${providerSlug}-${Date.now()}`,
    provider: improvementClosureRecord.provider,
    improvementClosureRecordId: improvementClosureRecord.id,
    postImplementationReviewRecordId: improvementClosureRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: improvementClosureRecord.operationalClosureRecordId,
    finalTurnoverRecordId: improvementClosureRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: improvementClosureRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: improvementClosureRecord.supportReadinessRecordId,
    operationsHandoverRecordId: improvementClosureRecord.operationsHandoverRecordId,
    completionDossierRecordId: improvementClosureRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: improvementClosureRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: improvementClosureRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: improvementClosureRecord.archivalHandoffRecordId,
    closurePacketRecordId: improvementClosureRecord.closurePacketRecordId,
    closureAuthorizationRecordId: improvementClosureRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: improvementClosureRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: improvementClosureRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: improvementClosureRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: improvementClosureRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: improvementClosureRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: improvementClosureRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: improvementClosureRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: improvementClosureRecord.implementationHoldRecordId,
    cabDecisionRecordId: improvementClosureRecord.cabDecisionRecordId,
    cabHandoffPacketId: improvementClosureRecord.cabHandoffPacketId,
    freezeRecordId: improvementClosureRecord.freezeRecordId,
    authorizationPacketId: improvementClosureRecord.authorizationPacketId,
    promotionDossierId: improvementClosureRecord.promotionDossierId,
    closurePackageId: improvementClosureRecord.closurePackageId,
    outcomeRecordId: improvementClosureRecord.outcomeRecordId,
    handoffPackageId: improvementClosureRecord.handoffPackageId,
    controlledSwitchRequestId: improvementClosureRecord.controlledSwitchRequestId,
    auditPackageId: improvementClosureRecord.auditPackageId,
    switchReviewId: improvementClosureRecord.switchReviewId,
    activationId: improvementClosureRecord.activationId,
    idempotencyKey: improvementClosureRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution final acceptance archive review"
      : "Blocked",
    requestedBy: actor,
    archiveOwner,
    acceptanceArchiveIndexReference,
    finalEvidenceChecksumReference,
    stakeholderReceiptProofReference,
    retrievalOwner,
    checks,
    evidence: [
      `Improvement closure record: ${improvementClosureRecord.id}.`,
      `Post-implementation review record: ${improvementClosureRecord.postImplementationReviewRecordId}.`,
      `Archive owner: ${archiveOwner}.`,
      `Acceptance archive index: ${acceptanceArchiveIndexReference}.`,
      `Final evidence checksum: ${finalEvidenceChecksumReference}.`,
      `Stakeholder receipt proof: ${stakeholderReceiptProofReference}.`,
      `Retrieval owner: ${retrievalOwner}.`,
      `Kill switch: ${improvementClosureRecord.killSwitch.name}=${
        improvementClosureRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: improvementClosureRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionReadinessArchiveHandoffRecord(
  finalAcceptanceArchiveRecord: ProductionExecutionFinalAcceptanceArchiveRecord,
  actor: string
): ProductionExecutionReadinessArchiveHandoffRecord {
  const providerSlug = finalAcceptanceArchiveRecord.provider.toLowerCase();
  const handoffOwner = "Production Archive Handoff Owner";
  const archiveRepositoryReference = `production-readiness-archive-repository-${providerSlug}.md`;
  const retrievalRunbookReference = `production-readiness-retrieval-runbook-${providerSlug}.md`;
  const archiveAccessReviewReference = `production-readiness-archive-access-review-${providerSlug}.md`;
  const archiveCustodyReceiptReference = `production-readiness-archive-custody-receipt-${providerSlug}.md`;
  const checks = [
    {
      name: "Final acceptance archive ready",
      passed:
        finalAcceptanceArchiveRecord.status ===
        "Ready for production execution final acceptance archive review",
      detail: `${finalAcceptanceArchiveRecord.id} is ${finalAcceptanceArchiveRecord.status}.`,
    },
    {
      name: "Handoff owner assigned",
      passed: Boolean(handoffOwner),
      detail: handoffOwner,
    },
    {
      name: "Archive repository linked",
      passed: Boolean(archiveRepositoryReference),
      detail: archiveRepositoryReference,
    },
    {
      name: "Retrieval runbook linked",
      passed: Boolean(retrievalRunbookReference),
      detail: retrievalRunbookReference,
    },
    {
      name: "Archive access review linked",
      passed: Boolean(archiveAccessReviewReference),
      detail: archiveAccessReviewReference,
    },
    {
      name: "Archive custody receipt linked",
      passed: Boolean(archiveCustodyReceiptReference),
      detail: archiveCustodyReceiptReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !finalAcceptanceArchiveRecord.provisioningEnabled && !finalAcceptanceArchiveRecord.killSwitch.enabled,
      detail: `${finalAcceptanceArchiveRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-readiness-archive-handoff-record-${providerSlug}-${Date.now()}`,
    provider: finalAcceptanceArchiveRecord.provider,
    finalAcceptanceArchiveRecordId: finalAcceptanceArchiveRecord.id,
    improvementClosureRecordId: finalAcceptanceArchiveRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: finalAcceptanceArchiveRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: finalAcceptanceArchiveRecord.operationalClosureRecordId,
    finalTurnoverRecordId: finalAcceptanceArchiveRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: finalAcceptanceArchiveRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: finalAcceptanceArchiveRecord.supportReadinessRecordId,
    operationsHandoverRecordId: finalAcceptanceArchiveRecord.operationsHandoverRecordId,
    completionDossierRecordId: finalAcceptanceArchiveRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: finalAcceptanceArchiveRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: finalAcceptanceArchiveRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: finalAcceptanceArchiveRecord.archivalHandoffRecordId,
    closurePacketRecordId: finalAcceptanceArchiveRecord.closurePacketRecordId,
    closureAuthorizationRecordId: finalAcceptanceArchiveRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: finalAcceptanceArchiveRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: finalAcceptanceArchiveRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: finalAcceptanceArchiveRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: finalAcceptanceArchiveRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: finalAcceptanceArchiveRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: finalAcceptanceArchiveRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: finalAcceptanceArchiveRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: finalAcceptanceArchiveRecord.implementationHoldRecordId,
    cabDecisionRecordId: finalAcceptanceArchiveRecord.cabDecisionRecordId,
    cabHandoffPacketId: finalAcceptanceArchiveRecord.cabHandoffPacketId,
    freezeRecordId: finalAcceptanceArchiveRecord.freezeRecordId,
    authorizationPacketId: finalAcceptanceArchiveRecord.authorizationPacketId,
    promotionDossierId: finalAcceptanceArchiveRecord.promotionDossierId,
    closurePackageId: finalAcceptanceArchiveRecord.closurePackageId,
    outcomeRecordId: finalAcceptanceArchiveRecord.outcomeRecordId,
    handoffPackageId: finalAcceptanceArchiveRecord.handoffPackageId,
    controlledSwitchRequestId: finalAcceptanceArchiveRecord.controlledSwitchRequestId,
    auditPackageId: finalAcceptanceArchiveRecord.auditPackageId,
    switchReviewId: finalAcceptanceArchiveRecord.switchReviewId,
    activationId: finalAcceptanceArchiveRecord.activationId,
    idempotencyKey: finalAcceptanceArchiveRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution readiness archive handoff review"
      : "Blocked",
    requestedBy: actor,
    handoffOwner,
    archiveRepositoryReference,
    retrievalRunbookReference,
    archiveAccessReviewReference,
    archiveCustodyReceiptReference,
    checks,
    evidence: [
      `Final acceptance archive record: ${finalAcceptanceArchiveRecord.id}.`,
      `Improvement closure record: ${finalAcceptanceArchiveRecord.improvementClosureRecordId}.`,
      `Handoff owner: ${handoffOwner}.`,
      `Archive repository: ${archiveRepositoryReference}.`,
      `Retrieval runbook: ${retrievalRunbookReference}.`,
      `Archive access review: ${archiveAccessReviewReference}.`,
      `Archive custody receipt: ${archiveCustodyReceiptReference}.`,
      `Kill switch: ${finalAcceptanceArchiveRecord.killSwitch.name}=${
        finalAcceptanceArchiveRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: finalAcceptanceArchiveRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionArchiveRetrievalValidationRecord(
  readinessArchiveHandoffRecord: ProductionExecutionReadinessArchiveHandoffRecord,
  actor: string
): ProductionExecutionArchiveRetrievalValidationRecord {
  const providerSlug = readinessArchiveHandoffRecord.provider.toLowerCase();
  const retrievalOperator = "Production Archive Retrieval Operator";
  const sampleRetrievalProofReference = `production-archive-sample-retrieval-proof-${providerSlug}.md`;
  const checksumVerificationReference = `production-archive-checksum-verification-${providerSlug}.sha256`;
  const accessAuditReference = `production-archive-access-audit-${providerSlug}.md`;
  const recoverySlaWitnessReference = `production-archive-recovery-sla-witness-${providerSlug}.md`;
  const checks = [
    {
      name: "Readiness archive handoff ready",
      passed:
        readinessArchiveHandoffRecord.status ===
        "Ready for production execution readiness archive handoff review",
      detail: `${readinessArchiveHandoffRecord.id} is ${readinessArchiveHandoffRecord.status}.`,
    },
    {
      name: "Retrieval operator assigned",
      passed: Boolean(retrievalOperator),
      detail: retrievalOperator,
    },
    {
      name: "Sample retrieval proof linked",
      passed: Boolean(sampleRetrievalProofReference),
      detail: sampleRetrievalProofReference,
    },
    {
      name: "Checksum verification linked",
      passed: Boolean(checksumVerificationReference),
      detail: checksumVerificationReference,
    },
    {
      name: "Access audit linked",
      passed: Boolean(accessAuditReference),
      detail: accessAuditReference,
    },
    {
      name: "Recovery SLA witness linked",
      passed: Boolean(recoverySlaWitnessReference),
      detail: recoverySlaWitnessReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !readinessArchiveHandoffRecord.provisioningEnabled && !readinessArchiveHandoffRecord.killSwitch.enabled,
      detail: `${readinessArchiveHandoffRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-retrieval-validation-record-${providerSlug}-${Date.now()}`,
    provider: readinessArchiveHandoffRecord.provider,
    readinessArchiveHandoffRecordId: readinessArchiveHandoffRecord.id,
    finalAcceptanceArchiveRecordId: readinessArchiveHandoffRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: readinessArchiveHandoffRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: readinessArchiveHandoffRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: readinessArchiveHandoffRecord.operationalClosureRecordId,
    finalTurnoverRecordId: readinessArchiveHandoffRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: readinessArchiveHandoffRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: readinessArchiveHandoffRecord.supportReadinessRecordId,
    operationsHandoverRecordId: readinessArchiveHandoffRecord.operationsHandoverRecordId,
    completionDossierRecordId: readinessArchiveHandoffRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: readinessArchiveHandoffRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: readinessArchiveHandoffRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: readinessArchiveHandoffRecord.archivalHandoffRecordId,
    closurePacketRecordId: readinessArchiveHandoffRecord.closurePacketRecordId,
    closureAuthorizationRecordId: readinessArchiveHandoffRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: readinessArchiveHandoffRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: readinessArchiveHandoffRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: readinessArchiveHandoffRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: readinessArchiveHandoffRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: readinessArchiveHandoffRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: readinessArchiveHandoffRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: readinessArchiveHandoffRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: readinessArchiveHandoffRecord.implementationHoldRecordId,
    cabDecisionRecordId: readinessArchiveHandoffRecord.cabDecisionRecordId,
    cabHandoffPacketId: readinessArchiveHandoffRecord.cabHandoffPacketId,
    freezeRecordId: readinessArchiveHandoffRecord.freezeRecordId,
    authorizationPacketId: readinessArchiveHandoffRecord.authorizationPacketId,
    promotionDossierId: readinessArchiveHandoffRecord.promotionDossierId,
    closurePackageId: readinessArchiveHandoffRecord.closurePackageId,
    outcomeRecordId: readinessArchiveHandoffRecord.outcomeRecordId,
    handoffPackageId: readinessArchiveHandoffRecord.handoffPackageId,
    controlledSwitchRequestId: readinessArchiveHandoffRecord.controlledSwitchRequestId,
    auditPackageId: readinessArchiveHandoffRecord.auditPackageId,
    switchReviewId: readinessArchiveHandoffRecord.switchReviewId,
    activationId: readinessArchiveHandoffRecord.activationId,
    idempotencyKey: readinessArchiveHandoffRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive retrieval validation review"
      : "Blocked",
    requestedBy: actor,
    retrievalOperator,
    sampleRetrievalProofReference,
    checksumVerificationReference,
    accessAuditReference,
    recoverySlaWitnessReference,
    checks,
    evidence: [
      `Readiness archive handoff record: ${readinessArchiveHandoffRecord.id}.`,
      `Final acceptance archive record: ${readinessArchiveHandoffRecord.finalAcceptanceArchiveRecordId}.`,
      `Retrieval operator: ${retrievalOperator}.`,
      `Sample retrieval proof: ${sampleRetrievalProofReference}.`,
      `Checksum verification: ${checksumVerificationReference}.`,
      `Access audit: ${accessAuditReference}.`,
      `Recovery SLA witness: ${recoverySlaWitnessReference}.`,
      `Kill switch: ${readinessArchiveHandoffRecord.killSwitch.name}=${
        readinessArchiveHandoffRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: readinessArchiveHandoffRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionArchiveRecoveryDrillRecord(
  archiveRetrievalValidationRecord: ProductionExecutionArchiveRetrievalValidationRecord,
  actor: string
): ProductionExecutionArchiveRecoveryDrillRecord {
  const providerSlug = archiveRetrievalValidationRecord.provider.toLowerCase();
  const drillOwner = "Production Archive Recovery Drill Owner";
  const recoveryScenarioReference = `production-archive-recovery-scenario-${providerSlug}.md`;
  const elapsedRecoveryProofReference = `production-archive-elapsed-recovery-proof-${providerSlug}.md`;
  const restoredArtifactReviewReference = `production-archive-restored-artifact-review-${providerSlug}.md`;
  const drillSignOffReference = `production-archive-recovery-drill-signoff-${providerSlug}.md`;
  const checks = [
    {
      name: "Archive retrieval validation ready",
      passed:
        archiveRetrievalValidationRecord.status ===
        "Ready for production execution archive retrieval validation review",
      detail: `${archiveRetrievalValidationRecord.id} is ${archiveRetrievalValidationRecord.status}.`,
    },
    {
      name: "Drill owner assigned",
      passed: Boolean(drillOwner),
      detail: drillOwner,
    },
    {
      name: "Recovery scenario linked",
      passed: Boolean(recoveryScenarioReference),
      detail: recoveryScenarioReference,
    },
    {
      name: "Elapsed recovery proof linked",
      passed: Boolean(elapsedRecoveryProofReference),
      detail: elapsedRecoveryProofReference,
    },
    {
      name: "Restored artifact review linked",
      passed: Boolean(restoredArtifactReviewReference),
      detail: restoredArtifactReviewReference,
    },
    {
      name: "Drill sign-off linked",
      passed: Boolean(drillSignOffReference),
      detail: drillSignOffReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !archiveRetrievalValidationRecord.provisioningEnabled && !archiveRetrievalValidationRecord.killSwitch.enabled,
      detail: `${archiveRetrievalValidationRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-drill-record-${providerSlug}-${Date.now()}`,
    provider: archiveRetrievalValidationRecord.provider,
    archiveRetrievalValidationRecordId: archiveRetrievalValidationRecord.id,
    readinessArchiveHandoffRecordId: archiveRetrievalValidationRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: archiveRetrievalValidationRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: archiveRetrievalValidationRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: archiveRetrievalValidationRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: archiveRetrievalValidationRecord.operationalClosureRecordId,
    finalTurnoverRecordId: archiveRetrievalValidationRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: archiveRetrievalValidationRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: archiveRetrievalValidationRecord.supportReadinessRecordId,
    operationsHandoverRecordId: archiveRetrievalValidationRecord.operationsHandoverRecordId,
    completionDossierRecordId: archiveRetrievalValidationRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: archiveRetrievalValidationRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: archiveRetrievalValidationRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: archiveRetrievalValidationRecord.archivalHandoffRecordId,
    closurePacketRecordId: archiveRetrievalValidationRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archiveRetrievalValidationRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archiveRetrievalValidationRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archiveRetrievalValidationRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archiveRetrievalValidationRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archiveRetrievalValidationRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archiveRetrievalValidationRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archiveRetrievalValidationRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archiveRetrievalValidationRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archiveRetrievalValidationRecord.implementationHoldRecordId,
    cabDecisionRecordId: archiveRetrievalValidationRecord.cabDecisionRecordId,
    cabHandoffPacketId: archiveRetrievalValidationRecord.cabHandoffPacketId,
    freezeRecordId: archiveRetrievalValidationRecord.freezeRecordId,
    authorizationPacketId: archiveRetrievalValidationRecord.authorizationPacketId,
    promotionDossierId: archiveRetrievalValidationRecord.promotionDossierId,
    closurePackageId: archiveRetrievalValidationRecord.closurePackageId,
    outcomeRecordId: archiveRetrievalValidationRecord.outcomeRecordId,
    handoffPackageId: archiveRetrievalValidationRecord.handoffPackageId,
    controlledSwitchRequestId: archiveRetrievalValidationRecord.controlledSwitchRequestId,
    auditPackageId: archiveRetrievalValidationRecord.auditPackageId,
    switchReviewId: archiveRetrievalValidationRecord.switchReviewId,
    activationId: archiveRetrievalValidationRecord.activationId,
    idempotencyKey: archiveRetrievalValidationRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery drill review"
      : "Blocked",
    requestedBy: actor,
    drillOwner,
    recoveryScenarioReference,
    elapsedRecoveryProofReference,
    restoredArtifactReviewReference,
    drillSignOffReference,
    checks,
    evidence: [
      `Archive retrieval validation record: ${archiveRetrievalValidationRecord.id}.`,
      `Readiness archive handoff record: ${archiveRetrievalValidationRecord.readinessArchiveHandoffRecordId}.`,
      `Drill owner: ${drillOwner}.`,
      `Recovery scenario: ${recoveryScenarioReference}.`,
      `Elapsed recovery proof: ${elapsedRecoveryProofReference}.`,
      `Restored artifact review: ${restoredArtifactReviewReference}.`,
      `Drill sign-off: ${drillSignOffReference}.`,
      `Kill switch: ${archiveRetrievalValidationRecord.killSwitch.name}=${
        archiveRetrievalValidationRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archiveRetrievalValidationRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionArchiveRecoveryAcceptanceRecord(
  archiveRecoveryDrillRecord: ProductionExecutionArchiveRecoveryDrillRecord,
  actor: string
): ProductionExecutionArchiveRecoveryAcceptanceRecord {
  const providerSlug = archiveRecoveryDrillRecord.provider.toLowerCase();
  const acceptanceOwner = "Production Archive Recovery Acceptance Owner";
  const recoveryEvidencePacketReference = `production-archive-recovery-evidence-packet-${providerSlug}.md`;
  const rtoRpoVarianceReviewReference = `production-archive-rto-rpo-variance-review-${providerSlug}.md`;
  const residualRecoveryRiskRegisterReference = `production-archive-residual-recovery-risk-register-${providerSlug}.md`;
  const acceptanceSignOffReference = `production-archive-recovery-acceptance-signoff-${providerSlug}.md`;
  const checks = [
    {
      name: "Archive recovery drill ready",
      passed:
        archiveRecoveryDrillRecord.status ===
        "Ready for production execution archive recovery drill review",
      detail: `${archiveRecoveryDrillRecord.id} is ${archiveRecoveryDrillRecord.status}.`,
    },
    {
      name: "Acceptance owner assigned",
      passed: Boolean(acceptanceOwner),
      detail: acceptanceOwner,
    },
    {
      name: "Recovery evidence packet linked",
      passed: Boolean(recoveryEvidencePacketReference),
      detail: recoveryEvidencePacketReference,
    },
    {
      name: "RTO/RPO variance review linked",
      passed: Boolean(rtoRpoVarianceReviewReference),
      detail: rtoRpoVarianceReviewReference,
    },
    {
      name: "Residual recovery risk register linked",
      passed: Boolean(residualRecoveryRiskRegisterReference),
      detail: residualRecoveryRiskRegisterReference,
    },
    {
      name: "Acceptance sign-off linked",
      passed: Boolean(acceptanceSignOffReference),
      detail: acceptanceSignOffReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed: !archiveRecoveryDrillRecord.provisioningEnabled && !archiveRecoveryDrillRecord.killSwitch.enabled,
      detail: `${archiveRecoveryDrillRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-acceptance-record-${providerSlug}-${Date.now()}`,
    provider: archiveRecoveryDrillRecord.provider,
    archiveRecoveryDrillRecordId: archiveRecoveryDrillRecord.id,
    archiveRetrievalValidationRecordId: archiveRecoveryDrillRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: archiveRecoveryDrillRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: archiveRecoveryDrillRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: archiveRecoveryDrillRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: archiveRecoveryDrillRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: archiveRecoveryDrillRecord.operationalClosureRecordId,
    finalTurnoverRecordId: archiveRecoveryDrillRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: archiveRecoveryDrillRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: archiveRecoveryDrillRecord.supportReadinessRecordId,
    operationsHandoverRecordId: archiveRecoveryDrillRecord.operationsHandoverRecordId,
    completionDossierRecordId: archiveRecoveryDrillRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: archiveRecoveryDrillRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: archiveRecoveryDrillRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: archiveRecoveryDrillRecord.archivalHandoffRecordId,
    closurePacketRecordId: archiveRecoveryDrillRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archiveRecoveryDrillRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archiveRecoveryDrillRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archiveRecoveryDrillRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archiveRecoveryDrillRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archiveRecoveryDrillRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archiveRecoveryDrillRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archiveRecoveryDrillRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archiveRecoveryDrillRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archiveRecoveryDrillRecord.implementationHoldRecordId,
    cabDecisionRecordId: archiveRecoveryDrillRecord.cabDecisionRecordId,
    cabHandoffPacketId: archiveRecoveryDrillRecord.cabHandoffPacketId,
    freezeRecordId: archiveRecoveryDrillRecord.freezeRecordId,
    authorizationPacketId: archiveRecoveryDrillRecord.authorizationPacketId,
    promotionDossierId: archiveRecoveryDrillRecord.promotionDossierId,
    closurePackageId: archiveRecoveryDrillRecord.closurePackageId,
    outcomeRecordId: archiveRecoveryDrillRecord.outcomeRecordId,
    handoffPackageId: archiveRecoveryDrillRecord.handoffPackageId,
    controlledSwitchRequestId: archiveRecoveryDrillRecord.controlledSwitchRequestId,
    auditPackageId: archiveRecoveryDrillRecord.auditPackageId,
    switchReviewId: archiveRecoveryDrillRecord.switchReviewId,
    activationId: archiveRecoveryDrillRecord.activationId,
    idempotencyKey: archiveRecoveryDrillRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery acceptance review"
      : "Blocked",
    requestedBy: actor,
    acceptanceOwner,
    recoveryEvidencePacketReference,
    rtoRpoVarianceReviewReference,
    residualRecoveryRiskRegisterReference,
    acceptanceSignOffReference,
    checks,
    evidence: [
      `Archive recovery drill record: ${archiveRecoveryDrillRecord.id}.`,
      `Archive retrieval validation record: ${archiveRecoveryDrillRecord.archiveRetrievalValidationRecordId}.`,
      `Acceptance owner: ${acceptanceOwner}.`,
      `Recovery evidence packet: ${recoveryEvidencePacketReference}.`,
      `RTO/RPO variance review: ${rtoRpoVarianceReviewReference}.`,
      `Residual recovery risk register: ${residualRecoveryRiskRegisterReference}.`,
      `Acceptance sign-off: ${acceptanceSignOffReference}.`,
      `Kill switch: ${archiveRecoveryDrillRecord.killSwitch.name}=${
        archiveRecoveryDrillRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archiveRecoveryDrillRecord.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function createMockProductionExecutionArchiveRecoveryClosureRecord(
  archiveRecoveryAcceptanceRecord: ProductionExecutionArchiveRecoveryAcceptanceRecord,
  actor: string
): ProductionExecutionArchiveRecoveryClosureRecord {
  const providerSlug = archiveRecoveryAcceptanceRecord.provider.toLowerCase();
  const closureOwner = "Production Archive Recovery Closure Owner";
  const recoveryClosurePacketReference = `production-archive-recovery-closure-packet-${providerSlug}.md`;
  const followUpActionRegisterReference = `production-archive-recovery-follow-up-actions-${providerSlug}.md`;
  const stakeholderClosureNoticeReference = `production-archive-recovery-stakeholder-closure-notice-${providerSlug}.md`;
  const archiveRecoveryClosureSignOffReference = `production-archive-recovery-closure-signoff-${providerSlug}.md`;
  const checks = [
    {
      name: "Archive recovery acceptance ready",
      passed:
        archiveRecoveryAcceptanceRecord.status ===
        "Ready for production execution archive recovery acceptance review",
      detail: `${archiveRecoveryAcceptanceRecord.id} is ${archiveRecoveryAcceptanceRecord.status}.`,
    },
    {
      name: "Closure owner assigned",
      passed: Boolean(closureOwner),
      detail: closureOwner,
    },
    {
      name: "Recovery closure packet linked",
      passed: Boolean(recoveryClosurePacketReference),
      detail: recoveryClosurePacketReference,
    },
    {
      name: "Follow-up action register linked",
      passed: Boolean(followUpActionRegisterReference),
      detail: followUpActionRegisterReference,
    },
    {
      name: "Stakeholder closure notice linked",
      passed: Boolean(stakeholderClosureNoticeReference),
      detail: stakeholderClosureNoticeReference,
    },
    {
      name: "Archive recovery closure sign-off linked",
      passed: Boolean(archiveRecoveryClosureSignOffReference),
      detail: archiveRecoveryClosureSignOffReference,
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        archiveRecoveryAcceptanceRecord.provisioningEnabled === false &&
        archiveRecoveryAcceptanceRecord.killSwitch.enabled === false,
      detail: `${archiveRecoveryAcceptanceRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `production-execution-archive-recovery-closure-record-${providerSlug}-${Date.now()}`,
    provider: archiveRecoveryAcceptanceRecord.provider,
    archiveRecoveryAcceptanceRecordId: archiveRecoveryAcceptanceRecord.id,
    archiveRecoveryDrillRecordId: archiveRecoveryAcceptanceRecord.archiveRecoveryDrillRecordId,
    archiveRetrievalValidationRecordId: archiveRecoveryAcceptanceRecord.archiveRetrievalValidationRecordId,
    readinessArchiveHandoffRecordId: archiveRecoveryAcceptanceRecord.readinessArchiveHandoffRecordId,
    finalAcceptanceArchiveRecordId: archiveRecoveryAcceptanceRecord.finalAcceptanceArchiveRecordId,
    improvementClosureRecordId: archiveRecoveryAcceptanceRecord.improvementClosureRecordId,
    postImplementationReviewRecordId: archiveRecoveryAcceptanceRecord.postImplementationReviewRecordId,
    operationalClosureRecordId: archiveRecoveryAcceptanceRecord.operationalClosureRecordId,
    finalTurnoverRecordId: archiveRecoveryAcceptanceRecord.finalTurnoverRecordId,
    serviceAcceptanceRecordId: archiveRecoveryAcceptanceRecord.serviceAcceptanceRecordId,
    supportReadinessRecordId: archiveRecoveryAcceptanceRecord.supportReadinessRecordId,
    operationsHandoverRecordId: archiveRecoveryAcceptanceRecord.operationsHandoverRecordId,
    completionDossierRecordId: archiveRecoveryAcceptanceRecord.completionDossierRecordId,
    finalArchiveCertificationRecordId: archiveRecoveryAcceptanceRecord.finalArchiveCertificationRecordId,
    retentionAttestationRecordId: archiveRecoveryAcceptanceRecord.retentionAttestationRecordId,
    archivalHandoffRecordId: archiveRecoveryAcceptanceRecord.archivalHandoffRecordId,
    closurePacketRecordId: archiveRecoveryAcceptanceRecord.closurePacketRecordId,
    closureAuthorizationRecordId: archiveRecoveryAcceptanceRecord.closureAuthorizationRecordId,
    outcomeAuthorizationRecordId: archiveRecoveryAcceptanceRecord.outcomeAuthorizationRecordId,
    executionHoldPointRecordId: archiveRecoveryAcceptanceRecord.executionHoldPointRecordId,
    finalExecutionPacketRecordId: archiveRecoveryAcceptanceRecord.finalExecutionPacketRecordId,
    changeTicketLockRecordId: archiveRecoveryAcceptanceRecord.changeTicketLockRecordId,
    executionAuthorizationRecordId: archiveRecoveryAcceptanceRecord.executionAuthorizationRecordId,
    executionReadinessRecordId: archiveRecoveryAcceptanceRecord.executionReadinessRecordId,
    operatorAssignmentRecordId: archiveRecoveryAcceptanceRecord.operatorAssignmentRecordId,
    implementationHoldRecordId: archiveRecoveryAcceptanceRecord.implementationHoldRecordId,
    cabDecisionRecordId: archiveRecoveryAcceptanceRecord.cabDecisionRecordId,
    cabHandoffPacketId: archiveRecoveryAcceptanceRecord.cabHandoffPacketId,
    freezeRecordId: archiveRecoveryAcceptanceRecord.freezeRecordId,
    authorizationPacketId: archiveRecoveryAcceptanceRecord.authorizationPacketId,
    promotionDossierId: archiveRecoveryAcceptanceRecord.promotionDossierId,
    closurePackageId: archiveRecoveryAcceptanceRecord.closurePackageId,
    outcomeRecordId: archiveRecoveryAcceptanceRecord.outcomeRecordId,
    handoffPackageId: archiveRecoveryAcceptanceRecord.handoffPackageId,
    controlledSwitchRequestId: archiveRecoveryAcceptanceRecord.controlledSwitchRequestId,
    auditPackageId: archiveRecoveryAcceptanceRecord.auditPackageId,
    switchReviewId: archiveRecoveryAcceptanceRecord.switchReviewId,
    activationId: archiveRecoveryAcceptanceRecord.activationId,
    idempotencyKey: archiveRecoveryAcceptanceRecord.idempotencyKey,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery closure review"
      : "Blocked",
    requestedBy: actor,
    closureOwner,
    recoveryClosurePacketReference,
    followUpActionRegisterReference,
    stakeholderClosureNoticeReference,
    archiveRecoveryClosureSignOffReference,
    checks,
    evidence: [
      `Archive recovery acceptance record: ${archiveRecoveryAcceptanceRecord.id}.`,
      `Archive recovery drill record: ${archiveRecoveryAcceptanceRecord.archiveRecoveryDrillRecordId}.`,
      `Closure owner: ${closureOwner}.`,
      `Recovery closure packet: ${recoveryClosurePacketReference}.`,
      `Follow-up action register: ${followUpActionRegisterReference}.`,
      `Stakeholder closure notice: ${stakeholderClosureNoticeReference}.`,
      `Archive recovery closure sign-off: ${archiveRecoveryClosureSignOffReference}.`,
      `Kill switch: ${archiveRecoveryAcceptanceRecord.killSwitch.name}=${
        archiveRecoveryAcceptanceRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    killSwitch: archiveRecoveryAcceptanceRecord.killSwitch,
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
