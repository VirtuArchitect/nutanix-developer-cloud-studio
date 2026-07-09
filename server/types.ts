import type {
  ApprovalRequest,
  AdapterEnablementRecord,
  AuthorizedReadOnlyLabPilotGateRecord,
  AuthorizedLabConnectionDryRunRecord,
  AhvControlledProvisioningRun,
  AhvCreateAdapterContractReview,
  ControlledProvisioningDecision,
  ControlledLabReleaseRunbookRecord,
  ControlledSwitchConfigurationRequest,
  ControlledLabExecutionApprovalGate,
  ControlledLabDryRunExecutionChecklist,
  ControlledLabExecutionEvidenceLedger,
  ControlledLabExecutionReadinessAttestation,
  ControlledLabExecutionRehearsalPacket,
  ControlledLabDryRunWindowRecord,
  ControlledCreateAuthorizationEnvelope,
  ControlledProvisioningGate,
  ControlPlaneJob,
  CredentialResolverAdapterStubRecord,
  CredentialProviderContractRecord,
  DisabledPrismReadOnlyHttpClientRecord,
  DisabledRealReadOnlyAdapterInterfaceRecord,
  ExecutionBrokerDispatchApproval,
  ExecutionBrokerQueueRecord,
  Environment,
  Integration,
  IntegrationConfig,
  AuditExportRecord,
  HardenedLabConnectionProfileReview,
  LabWindowEvidenceExportRecord,
  LabConnectivityPreflightRecord,
  LabConnectionDryRunConsoleRecord,
  LabReadinessWorkspaceRecord,
  LabEvidenceReviewRecord,
  LabExecutionProposalEnvelope,
  LabExecutionProposalExportRecord,
  LabAdapterSnapshot,
  LabAuthorizationScope,
  LabPilotOperatorConsole,
  LifecycleOperationKind,
  LifecycleOperationRecord,
  LiveReadOnlyInventoryPilotRecord,
  LiveReadOnlyCallEnvelopeRecord,
  ManualRealAdapterSwitchReview,
  MockPrismExecution,
  MockPrismEndpointExpansionRecord,
  OfflineContractReplaySuiteRecord,
  AdapterContractTestHarnessRecord,
  EvidenceExportPackV2Record,
  PilotEvidenceReviewRecord,
  PrismSimulatorFailureScenario,
  PrismSimulatorProfile,
  PlatformConfig,
  PlatformServiceAdapterContractReview,
  PlatformServiceKind,
  PlatformServicePreflightRun,
  PlatformServiceRequest,
  PlatformSession,
  PolicyBundle,
  PrismInventoryImportResult,
  PrismInventoryRecord,
  PrismFixtureReplayRecord,
  ReadOnlyAdapterObservabilityRecord,
  ReadOnlyAdapterRuntimeMode,
  ReadOnlyAdapterRuntimeModeRecord,
  ReadOnlyPrismLabGate,
  ReadOnlyLabConnectionProfile,
  ReadOnlyPilotSessionRecord,
  ReadOnlyRuntimeEnablementPolicyRecord,
  ReadOnlyAdapterAuthorizationGate,
  OperatorEvidenceExportPack,
  LabPilotRunbookWorkflow,
  SanitizedPrismInventoryFixtureRecord,
  MockPrismSimulatorStatus,
  ProvisioningAdapterReadiness,
  ProductionReadinessReview,
  ProviderReleaseGateRecord,
  ProviderReleaseReadinessSummary,
  ProductionReadinessDecisionGate,
  RealReadOnlyAdapterConfigBoundary,
  RealAdapterLabScopeActivation,
  RealPrismPreflightRun,
  RealAdapterSwitchStateAuditPackage,
  EmergencyStopRollbackDrillRecord,
  RealLabAuthorizationPacketRecord,
  ReleaseEvidenceExportRecord,
  SwitchExecutionHandoffPackage,
  SwitchExecutionOutcomeRecord,
  SwitchClosureRetentionPackage,
  AdapterPromotionReadinessDossier,
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
  RegistryStatus,
  ResourceProfile,
  RollbackDestroyProofRecord,
  Template,
  TemplateGovernance,
  TemplateRegistryEntry,
  VmLifecycleProof,
  VmSandboxDryRunPlan,
  VmSandboxDryRunRequest,
} from "../src/data/cloudStudioDomain";
import type { ProvisioningJob } from "../src/services/nutanixAdapters";

export type ApiState = {
  templates: Template[];
  environments: Environment[];
  integrations: Integration[];
  integrationConfigs: IntegrationConfig[];
  labAdapters: LabAdapterSnapshot[];
  labAuthorizationScopes: LabAuthorizationScope[];
  resourceProfiles: ResourceProfile[];
  policyBundles: PolicyBundle[];
  templateRegistry: TemplateRegistryEntry[];
  prismInventory: PrismInventoryRecord[];
  prismInventoryImport?: PrismInventoryImportResult;
  readOnlyPrismLabGates: ReadOnlyPrismLabGate[];
  readOnlyLabConnectionProfiles: ReadOnlyLabConnectionProfile[];
  prismFixtureReplayRecords: PrismFixtureReplayRecord[];
  readOnlyAdapterAuthorizationGates: ReadOnlyAdapterAuthorizationGate[];
  operatorEvidenceExportPacks: OperatorEvidenceExportPack[];
  labPilotRunbookWorkflows: LabPilotRunbookWorkflow[];
  readOnlyAdapterRuntimeModeRecords: ReadOnlyAdapterRuntimeModeRecord[];
  liveReadOnlyInventoryPilots: LiveReadOnlyInventoryPilotRecord[];
  readOnlyAdapterObservabilityRecords: ReadOnlyAdapterObservabilityRecord[];
  productionReadinessDecisionGates: ProductionReadinessDecisionGate[];
  realReadOnlyAdapterConfigBoundaries: RealReadOnlyAdapterConfigBoundary[];
  credentialProviderContractRecords: CredentialProviderContractRecord[];
  disabledRealReadOnlyAdapterInterfaceRecords: DisabledRealReadOnlyAdapterInterfaceRecord[];
  offlineContractReplaySuiteRecords: OfflineContractReplaySuiteRecord[];
  authorizedLabConnectionDryRunRecords: AuthorizedLabConnectionDryRunRecord[];
  hardenedLabConnectionProfileReviews: HardenedLabConnectionProfileReview[];
  credentialResolverAdapterStubRecords: CredentialResolverAdapterStubRecord[];
  disabledPrismReadOnlyHttpClientRecords: DisabledPrismReadOnlyHttpClientRecord[];
  labConnectivityPreflightRecords: LabConnectivityPreflightRecord[];
  authorizedReadOnlyLabPilotGateRecords: AuthorizedReadOnlyLabPilotGateRecord[];
  readOnlyRuntimeEnablementPolicies: ReadOnlyRuntimeEnablementPolicyRecord[];
  readOnlyPilotSessions: ReadOnlyPilotSessionRecord[];
  liveReadOnlyCallEnvelopes: LiveReadOnlyCallEnvelopeRecord[];
  pilotEvidenceReviewRecords: PilotEvidenceReviewRecord[];
  emergencyStopRollbackDrillRecords: EmergencyStopRollbackDrillRecord[];
  labReadinessWorkspaces: LabReadinessWorkspaceRecord[];
  mockPrismEndpointExpansionRecords: MockPrismEndpointExpansionRecord[];
  adapterContractTestHarnessRecords: AdapterContractTestHarnessRecord[];
  labConnectionDryRunConsoleRecords: LabConnectionDryRunConsoleRecord[];
  evidenceExportPackV2Records: EvidenceExportPackV2Record[];
  realLabAuthorizationPacketRecords: RealLabAuthorizationPacketRecord[];
  mockPrismStatus: MockPrismSimulatorStatus;
  mockPrismExecutions: MockPrismExecution[];
  prismSimulatorProfiles: PrismSimulatorProfile[];
  prismFailureScenarios: PrismSimulatorFailureScenario[];
  realPrismPreflightRuns: RealPrismPreflightRun[];
  platformConfig: PlatformConfig;
  provisioningAdapters: ProvisioningAdapterReadiness[];
  adapterEnablementRecords: AdapterEnablementRecord[];
  session: PlatformSession;
  governance: TemplateGovernance;
  jobs: ProvisioningJob[];
  approvals: ApprovalRequest[];
  controlPlaneJobs: ControlPlaneJob[];
  vmSandboxDryRuns: VmSandboxDryRunPlan[];
  controlledProvisioningGates: ControlledProvisioningGate[];
  platformServiceRequests: PlatformServiceRequest[];
  vmLifecycleProofs: VmLifecycleProof[];
  rollbackDestroyProofs: RollbackDestroyProofRecord[];
  controlledCreateAuthorizationEnvelopes: ControlledCreateAuthorizationEnvelope[];
  ahvCreateAdapterContractReviews: AhvCreateAdapterContractReview[];
  ahvControlledProvisioningRuns: AhvControlledProvisioningRun[];
  platformServicePreflightRuns: PlatformServicePreflightRun[];
  platformServiceAdapterContractReviews: PlatformServiceAdapterContractReview[];
  providerReleaseGateRecords: ProviderReleaseGateRecord[];
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
  productionExecutionArchiveRecoveryAuditCertificationRecords: ProductionExecutionArchiveRecoveryAuditCertificationRecord[];
  productionExecutionArchiveRecoveryFinalComplianceArchiveRecords: ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord[];
  productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords: ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord[];
  productionExecutionArchiveRecoveryOperationalContinuityRecords: ProductionExecutionArchiveRecoveryOperationalContinuityRecord[];
  productionExecutionArchiveRecoveryServiceManagementHandoffRecords: ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord[];
  productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords: ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord[];
  productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords: ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord[];
  productionExecutionArchiveRecoveryFinalOperationsHandoffRecords: ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord[];
  productionReadinessReviews: ProductionReadinessReview[];
  lifecycleOperations: LifecycleOperationRecord[];
  auditExports: AuditExportRecord[];
  auditEvents: AuditEvent[];
};

export type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  target: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type CreateEnvironmentRequest = {
  name: string;
  templateId: string;
  owner: string;
  region: string;
  targets?: string[];
};

export type UpdateIntegrationConfigRequest = {
  endpoint?: string;
  credentialProfile?: string;
  status?: IntegrationConfig["status"];
};

export type CreateVmSandboxDryRunRequest = Partial<VmSandboxDryRunRequest>;

export type CreateControlledProvisioningGateRequest = {
  dryRunPlanId?: string;
  environmentName?: string;
  pentestScopeReference?: string;
  pentestScopeStructurallyValid?: boolean;
};

export type ControlledProvisioningDecisionRequest = {
  decision: ControlledProvisioningDecision;
  evidence?: string;
};

export type CreateLabAuthorizationScopeRequest = {
  name?: string;
  owner?: string;
  approver?: string;
  approvedAt?: string;
  expiresAt?: string;
  project?: string;
  cluster?: string;
  network?: string;
  allowedActions?: string[];
  excludedActions?: string[];
  pentestScopeReference?: string;
  pentestScopeStructurallyValid?: boolean;
  version?: string;
  targetEnvironment?: string;
  providerCoverage?: LabAuthorizationScope["providerCoverage"];
  targetEndpoints?: string[];
  evidenceReferences?: string[];
  rollbackOwner?: string;
};

export type CreateReadOnlyLabConnectionProfileRequest = {
  name?: string;
  prismCentralEndpointRef?: string;
  credentialProfileRef?: string;
  owner?: string;
  approvedBy?: string;
  approvalState?: ReadOnlyLabConnectionProfile["approvalState"];
  expiresAt?: string;
  allowedProviderScope?: Partial<ReadOnlyLabConnectionProfile["allowedProviderScope"]>;
  evidence?: string[];
};

export type CreatePrismFixtureReplayRequest = {
  fixtureName?: string;
  source?: PrismFixtureReplayRecord["source"];
  records?: SanitizedPrismInventoryFixtureRecord[];
};

export type CreateReadOnlyAdapterAuthorizationGateRequest = {
  profileId?: string;
  fixtureReplayId?: string;
  labGateId?: string;
};

export type CreateOperatorEvidenceExportPackRequest = {
  includeReadiness?: boolean;
  includeAuthBoundary?: boolean;
  includeConfigValidation?: boolean;
  includeLabGates?: boolean;
  includeLiveDesign?: boolean;
};

export type CreateLabPilotRunbookWorkflowRequest = {
  profileId?: string;
  authorizationGateId?: string;
  evidenceExportId?: string;
  owner?: string;
};

export type LabPilotRunbookWorkflowAction = "approve" | "execute-dry-run" | "review-evidence" | "close";

export type SetReadOnlyAdapterRuntimeModeRequest = {
  mode?: ReadOnlyAdapterRuntimeMode;
  authorizationGateId?: string;
  runbookWorkflowId?: string;
  evidenceExportId?: string;
};

export type CreateLiveReadOnlyInventoryPilotRequest = {
  runtimeModeRecordId?: string;
  authorizationGateId?: string;
  runbookWorkflowId?: string;
};

export type CreateReadOnlyAdapterObservabilityRequest = {
  runtimeModeRecordId?: string;
  inventoryPilotId?: string;
};

export type CreateProductionReadinessDecisionGateRequest = {
  decision?: ProductionReadinessDecisionGate["decision"];
  approvers?: string[];
  rollbackOwner?: string;
  supportContact?: string;
  retentionPolicy?: string;
};

export type CreateRealReadOnlyAdapterConfigBoundaryRequest = {
  endpointRef?: string;
  credentialProviderRef?: string;
  caCertificateRef?: string;
  tlsValidationMode?: RealReadOnlyAdapterConfigBoundary["tlsValidationMode"];
  timeoutSeconds?: number;
  retry?: Partial<RealReadOnlyAdapterConfigBoundary["retry"]>;
  allowedOperations?: RealReadOnlyAdapterConfigBoundary["allowedOperations"];
  killSwitch?: RealReadOnlyAdapterConfigBoundary["killSwitch"];
};

export type CreateCredentialProviderContractRequest = {
  credentialProviderRef?: string;
  provider?: CredentialProviderContractRecord["provider"];
};

export type CreateDisabledRealReadOnlyAdapterInterfaceRequest = {
  configBoundaryId?: string;
  credentialContractId?: string;
};

export type CreateOfflineContractReplaySuiteRequest = {
  adapterInterfaceId?: string;
  fixtureReplayId?: string;
};

export type CreateAuthorizedLabConnectionDryRunRequest = {
  configBoundaryId?: string;
  credentialContractId?: string;
  adapterInterfaceId?: string;
  offlineReplaySuiteId?: string;
  productionDecisionGateId?: string;
};

export type CreateHardenedLabConnectionProfileReviewRequest = {
  profileId?: string;
  caCertificateRef?: string;
};

export type CreateCredentialResolverAdapterStubRequest = {
  credentialContractId?: string;
  provider?: CredentialResolverAdapterStubRecord["provider"];
};

export type CreateDisabledPrismReadOnlyHttpClientRequest = {
  adapterInterfaceId?: string;
  configBoundaryId?: string;
  credentialResolverStubId?: string;
};

export type CreateLabConnectivityPreflightRequest = {
  hardenedProfileReviewId?: string;
  configBoundaryId?: string;
  credentialResolverStubId?: string;
  httpClientRecordId?: string;
};

export type CreateAuthorizedReadOnlyLabPilotGateRequest = {
  preflightId?: string;
  dryRunId?: string;
  productionDecisionGateId?: string;
  requiredApprovers?: string[];
  operatorAcknowledgements?: string[];
};

export type CreateReadOnlyRuntimeEnablementPolicyRequest = {
  pilotGateId?: string;
  requiredApprovals?: string[];
  allowedEnvironments?: string[];
  expiresAt?: string;
  emergencyStopOwner?: string;
  emergencyStopContact?: string;
  emergencyStopProcedureRef?: string;
  emergencyStopTested?: boolean;
};

export type CreateReadOnlyPilotSessionRequest = {
  policyId?: string;
  approvedGateId?: string;
  operator?: string;
  startedAt?: string;
  endsAt?: string;
  runtimeMode?: ReadOnlyPilotSessionRecord["runtimeMode"];
  evidenceLinks?: string[];
};

export type CreateLiveReadOnlyCallEnvelopeRequest = {
  pilotSessionId?: string;
  httpClientRecordId?: string;
};

export type CreatePilotEvidenceReviewRequest = {
  callEnvelopeId?: string;
  pilotSessionId?: string;
  reviewer?: string;
  decision?: PilotEvidenceReviewRecord["decision"];
  findings?: string[];
};

export type CreateEmergencyStopRollbackDrillRequest = {
  pilotEvidenceReviewId?: string;
  policyId?: string;
  simulatedModeRestored?: boolean;
  evidencePreserved?: boolean;
  emergencyStopOwner?: string;
};

export type CreateLabReadinessWorkspaceRequest = {
  emergencyStopRollbackDrillId?: string;
  evidenceReviewId?: string;
  pilotSessionId?: string;
  runtimePolicyId?: string;
};

export type CreateMockPrismEndpointExpansionRequest = {
  workspaceId?: string;
  latencySimulationMs?: number;
  requestsPerMinute?: number;
  failureModes?: string[];
};

export type CreateAdapterContractTestHarnessRequest = {
  mockExpansionId?: string;
};

export type CreateLabConnectionDryRunConsoleRequest = {
  contractHarnessId?: string;
  selectedEndpointRef?: string;
  credentialProviderRef?: string;
};

export type CreateEvidenceExportPackV2Request = {
  dryRunConsoleId?: string;
};

export type CreateRealLabAuthorizationPacketRequest = {
  evidenceExportPackId?: string;
  approvalOwners?: string[];
  rollbackOwner?: string;
  pentestScopeEvidence?: string[];
};

export type CreateVmLifecycleProofRequest = {
  gateId?: string;
  rollbackVerified?: boolean;
  destroyVerified?: boolean;
  evidence?: string[];
};

export type CreateRollbackDestroyProofRequest = {
  dryRunPlanId?: string;
  backupEvidenceReference?: string;
  ownerNotificationReference?: string;
  inventoryReconciliationReference?: string;
  rollbackOwner?: string;
  teardownOrder?: string[];
  stopConditions?: string[];
  evidenceReferences?: string[];
};

export type CreateAhvControlledProvisioningRunRequest = {
  gateId?: string;
  action?: AhvControlledProvisioningRun["action"];
};

export type CreateLifecycleOperationRequest = {
  environmentName?: string;
  operation?: LifecycleOperationKind;
};

export type CreatePlatformServiceRequest = {
  kind: PlatformServiceKind;
  serviceName?: string;
  environmentName?: string;
  owner?: string;
  profileId?: string;
};

export type CreatePlatformServicePreflightRunRequest = {
  requestId?: string;
  kind?: PlatformServiceKind;
};

export type CreatePlatformServiceAdapterContractReviewRequest = {
  requestId?: string;
  kind?: PlatformServiceKind;
};

export type CreateProviderReleaseGateRecordRequest = {
  provider?: ProviderReleaseGateRecord["provider"];
  releaseApprover?: string;
};

export type CreateReleaseEvidenceExportRequest = {
  gateId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
};

export type CreateControlledLabReleaseRunbookRequest = {
  provider?: ProviderReleaseGateRecord["provider"];
  platformOwner?: string;
  securityReviewer?: string;
  rollbackOwner?: string;
  labOwner?: string;
  platformOwnerEvidence?: string;
  securityReviewerEvidence?: string;
  rollbackOwnerEvidence?: string;
  labOwnerEvidence?: string;
  stopConditions?: string[];
  escalationContacts?: string[];
};

export type CreateControlledLabDryRunWindowRequest = {
  provider?: ProviderReleaseGateRecord["provider"];
  runbookId?: string;
  releaseEvidenceExportId?: string;
  labScopeId?: string;
  rollbackOwner?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  emergencyStopContacts?: string[];
};

export type CreateLabWindowEvidenceExportRequest = {
  windowId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
};

export type CreateLabEvidenceReviewRequest = {
  exportId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  platformOwnerDecision?: "Accepted" | "Rejected";
  securityReviewerDecision?: "Accepted" | "Rejected";
  operationsReviewerDecision?: "Accepted" | "Rejected";
  platformOwnerEvidence?: string;
  securityReviewerEvidence?: string;
  operationsReviewerEvidence?: string;
};

export type CreateLabExecutionProposalEnvelopeRequest = {
  reviewId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
};

export type CreateLabExecutionProposalExportRequest = {
  envelopeId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
};

export type CreateControlledLabExecutionApprovalGateRequest = {
  proposalExportId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  platformOwnerDecision?: "Accepted" | "Rejected";
  securityReviewerDecision?: "Accepted" | "Rejected";
  labOwnerDecision?: "Accepted" | "Rejected";
  rollbackOwnerDecision?: "Accepted" | "Rejected";
  executiveSponsorDecision?: "Accepted" | "Rejected";
  platformOwnerEvidence?: string;
  securityReviewerEvidence?: string;
  labOwnerEvidence?: string;
  rollbackOwnerEvidence?: string;
  executiveSponsorEvidence?: string;
};

export type CreateControlledLabExecutionRehearsalPacketRequest = {
  approvalGateId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
};

export type CreateControlledLabDryRunExecutionChecklistRequest = {
  rehearsalPacketId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  operatorRoster?: string[];
  scheduledStart?: string;
  scheduledEnd?: string;
  logCaptureReferences?: string[];
  rollbackTimerMinutes?: number;
  stopAuthority?: string;
};

export type CreateControlledLabExecutionEvidenceLedgerRequest = {
  dryRunChecklistId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  operatorEvidence?: string[];
  observerEvidence?: string[];
  rollbackEvidence?: string[];
  logEvidence?: string[];
  auditEvidence?: string[];
  stopAuthorityEvidence?: string[];
};

export type CreateControlledLabExecutionReadinessAttestationRequest = {
  evidenceLedgerId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  platformOwnerAttestation?: string;
  securityReviewerAttestation?: string;
  operationsReviewerAttestation?: string;
  rollbackOwnerAttestation?: string;
  executiveSponsorAttestation?: string;
};

export type CreateExecutionBrokerQueueRecordRequest = {
  readinessAttestationId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  idempotencyKey?: string;
  approvalEvidenceLinks?: string[];
};

export type CreateExecutionBrokerDispatchApprovalRequest = {
  brokerRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  operatorApprover?: string;
  rollbackProofReference?: string;
  pentestEvidenceReference?: string;
  dispatchWindowReference?: string;
};

export type CreateRealAdapterLabScopeActivationRequest = {
  dispatchApprovalId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  authorizedScopeReference?: string;
  pentestCompletionEvidence?: string;
  rollbackOwner?: string;
  boundedProviderTargets?: string[];
  manualOperatorControls?: string[];
};

export type CreateManualRealAdapterSwitchReviewRequest = {
  activationId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  switchOperator?: string;
  secondReviewer?: string;
  maintenanceWindowReference?: string;
  switchStateAuditReferences?: string[];
  rollbackContact?: string;
};

export type CreateRealAdapterSwitchStateAuditPackageRequest = {
  switchReviewId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  preChangeSnapshotReference?: string;
  postChangeSnapshotReference?: string;
  reviewerEvidenceReference?: string;
  rollbackTimerMinutes?: number;
  retentionReference?: string;
};

export type CreateControlledSwitchConfigurationRequestRequest = {
  auditPackageId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  operatorConfirmation?: string;
  secondReviewerAcceptance?: string;
  rollbackTimerMinutes?: number;
  finalDryRunProofReference?: string;
  retentionReference?: string;
};

export type CreateSwitchExecutionHandoffPackageRequest = {
  controlledSwitchRequestId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  operatorRunSheetReference?: string;
  communicationsPlanReference?: string;
  observationWindowReference?: string;
  rollbackOwnerAcceptance?: string;
  executionFreezeProofReference?: string;
};

export type CreateSwitchExecutionOutcomeRecordRequest = {
  handoffPackageId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  operatorResultReference?: string;
  postSwitchValidationReference?: string;
  rollbackDecisionReference?: string;
  incidentBridgeLogReference?: string;
  auditSignOffReference?: string;
};

export type CreateSwitchClosureRetentionPackageRequest = {
  outcomeRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  closureOwner?: string;
  retainedEvidenceManifestReference?: string;
  lessonsLearnedReference?: string;
  rollbackTimerClosureReference?: string;
  finalAuditRetentionConfirmation?: string;
};

export type CreateAdapterPromotionReadinessDossierRequest = {
  closurePackageId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  promotionOwner?: string;
  retainedSwitchEvidenceReference?: string;
  monitoringPlanReference?: string;
  rollbackDrillConfirmation?: string;
  securityAcceptanceReference?: string;
};

export type CreateProductionAdapterAuthorizationPacketRequest = {
  promotionDossierId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  productionApprover?: string;
  changeTicketReference?: string;
  releaseWindowReference?: string;
  emergencyRollbackAuthorization?: string;
  complianceAcceptanceReference?: string;
};

export type CreateProductionChangeFreezeRecordRequest = {
  authorizationPacketId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  freezeOwner?: string;
  freezeWindowReference?: string;
  stakeholderNotificationReference?: string;
  rollbackStandbyReference?: string;
  noChangeExceptionPlanReference?: string;
};

export type CreateProductionCabHandoffPacketRequest = {
  freezeRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  cabOwner?: string;
  cabAgendaReference?: string;
  riskAcceptanceReference?: string;
  rollbackRepresentationReference?: string;
  finalGoNoGoAgendaReference?: string;
};

export type CreateProductionCabDecisionRecordRequest = {
  cabHandoffPacketId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  cabDecision?: ProductionCabDecisionRecord["cabDecision"];
  decisionAuthority?: string;
  conditionListReference?: string;
  rollbackApprovalReference?: string;
  decisionMinutesReference?: string;
};

export type CreateProductionImplementationHoldRecordRequest = {
  cabDecisionRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  implementationOwner?: string;
  holdWindowReference?: string;
  conditionAcceptanceReference?: string;
  rollbackImplementationOwner?: string;
  releaseFreezeAcknowledgmentReference?: string;
};

export type CreateProductionOperatorAssignmentRecordRequest = {
  implementationHoldRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  primaryOperator?: string;
  secondaryOperator?: string;
  executionChannelReference?: string;
  rollbackOperator?: string;
  privilegedAccessConfirmationReference?: string;
};

export type CreateProductionExecutionReadinessRecordRequest = {
  operatorAssignmentRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  executionOwner?: string;
  preExecutionChecklistReference?: string;
  rollbackBridgeReference?: string;
  monitoringObserver?: string;
  implementationTimerReference?: string;
};

export type CreateProductionExecutionAuthorizationRecordRequest = {
  executionReadinessRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  authorizationAuthority?: string;
  finalGoNoGoDecision?: ProductionExecutionAuthorizationRecord["finalGoNoGoDecision"];
  rollbackBridgeConfirmationReference?: string;
  monitoringBridgeConfirmationReference?: string;
  emergencyStopAuthority?: string;
};

export type CreateProductionChangeTicketLockRecordRequest = {
  executionAuthorizationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  changeTicketLockReference?: string;
  releaseWindowLockReference?: string;
  approverRosterLockReference?: string;
  rollbackBridgeLockReference?: string;
  monitoringBridgeLockReference?: string;
};

export type CreateProductionFinalExecutionPacketRecordRequest = {
  changeTicketLockRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  finalPacketManifestReference?: string;
  operatorRunSheetReference?: string;
  communicationsProofReference?: string;
  observationWindowReference?: string;
  finalRollbackStandbyConfirmation?: string;
};

export type CreateProductionExecutionHoldPointRecordRequest = {
  finalExecutionPacketRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  holdPointOwner?: string;
  finalStopGoCheckpointReference?: string;
  rollbackTimerCheckpointReference?: string;
  monitoringReadinessCheckpointReference?: string;
  incidentBridgeCheckpointReference?: string;
};

export type CreateProductionExecutionOutcomeAuthorizationRecordRequest = {
  executionHoldPointRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  outcomeAuthority?: string;
  expectedResultEnvelopeReference?: string;
  rollbackDecisionRuleReference?: string;
  incidentDeclarationRuleReference?: string;
  evidenceCaptureRuleReference?: string;
};

export type CreateProductionExecutionClosureAuthorizationRecordRequest = {
  outcomeAuthorizationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  closureAuthority?: string;
  successCriteriaReference?: string;
  rollbackClosureCriteriaReference?: string;
  incidentClosureCriteriaReference?: string;
  auditCaptureConfirmationReference?: string;
};

export type CreateProductionExecutionClosurePacketRecordRequest = {
  closureAuthorizationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  closurePacketManifestReference?: string;
  evidenceBundleReference?: string;
  auditExportReference?: string;
  stakeholderNotificationProofReference?: string;
  retentionHandoffConfirmationReference?: string;
};

export type CreateProductionExecutionArchivalHandoffRecordRequest = {
  closurePacketRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  archiveOwner?: string;
  retentionPolicyReference?: string;
  immutableStorageProofReference?: string;
  auditIndexReference?: string;
  retrievalTestReference?: string;
};

export type CreateProductionExecutionRetentionAttestationRecordRequest = {
  archivalHandoffRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  retentionOwner?: string;
  retentionScheduleProofReference?: string;
  legalHoldCheckReference?: string;
  deletionExceptionRegisterReference?: string;
  retrievalSlaProofReference?: string;
};

export type CreateProductionExecutionFinalArchiveCertificationRecordRequest = {
  retentionAttestationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  certificationOwner?: string;
  finalArchiveManifestReference?: string;
  retentionLockProofReference?: string;
  complianceSignOffReference?: string;
  retrievalWitnessProofReference?: string;
};

export type CreateProductionExecutionCompletionDossierRecordRequest = {
  finalArchiveCertificationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  dossierOwner?: string;
  finalEvidenceIndexReference?: string;
  auditExportReference?: string;
  operationsAcceptanceReference?: string;
  complianceClosureProofReference?: string;
};

export type CreateProductionExecutionOperationsHandoverRecordRequest = {
  completionDossierRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  operationsOwner?: string;
  supportModelReference?: string;
  monitoringHandoverProofReference?: string;
  escalationRouteReference?: string;
  serviceDeskAcceptanceReference?: string;
};

export type CreateProductionExecutionSupportReadinessRecordRequest = {
  operationsHandoverRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  supportOwner?: string;
  runbookAcceptanceReference?: string;
  alertRoutingProofReference?: string;
  incidentProcessReference?: string;
  knowledgeBasePublicationReference?: string;
};

export type CreateProductionExecutionServiceAcceptanceRecordRequest = {
  supportReadinessRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  serviceOwner?: string;
  acceptanceCriteriaReference?: string;
  operationalSloReference?: string;
  supportSignOffReference?: string;
  finalCustomerNotificationReference?: string;
};

export type CreateProductionExecutionFinalTurnoverRecordRequest = {
  serviceAcceptanceRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  turnoverOwner?: string;
  finalServiceCatalogReference?: string;
  ownershipTransferProofReference?: string;
  executiveClosureNoteReference?: string;
  postImplementationReviewScheduleReference?: string;
};

export type CreateProductionExecutionOperationalClosureRecordRequest = {
  finalTurnoverRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  closureOwner?: string;
  steadyStateOperatingModelReference?: string;
  sloReviewProofReference?: string;
  supportBacklogHandoffReference?: string;
  residualRiskAcceptanceReference?: string;
};

export type CreateProductionExecutionPostImplementationReviewRecordRequest = {
  operationalClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  reviewOwner?: string;
  pirMinutesReference?: string;
  incidentReviewProofReference?: string;
  costVarianceReviewReference?: string;
  improvementBacklogReference?: string;
};

export type CreateProductionExecutionImprovementClosureRecordRequest = {
  postImplementationReviewRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  improvementOwner?: string;
  actionRegisterReference?: string;
  acceptedDeferralsReference?: string;
  lessonsLearnedPublicationReference?: string;
  nextCycleOwner?: string;
};

export type CreateProductionExecutionFinalAcceptanceArchiveRecordRequest = {
  improvementClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  archiveOwner?: string;
  acceptanceArchiveIndexReference?: string;
  finalEvidenceChecksumReference?: string;
  stakeholderReceiptProofReference?: string;
  retrievalOwner?: string;
};

export type CreateProductionExecutionReadinessArchiveHandoffRecordRequest = {
  finalAcceptanceArchiveRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  handoffOwner?: string;
  archiveRepositoryReference?: string;
  retrievalRunbookReference?: string;
  archiveAccessReviewReference?: string;
  archiveCustodyReceiptReference?: string;
};

export type CreateProductionExecutionArchiveRetrievalValidationRecordRequest = {
  readinessArchiveHandoffRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  retrievalOperator?: string;
  sampleRetrievalProofReference?: string;
  checksumVerificationReference?: string;
  accessAuditReference?: string;
  recoverySlaWitnessReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryDrillRecordRequest = {
  archiveRetrievalValidationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  drillOwner?: string;
  recoveryScenarioReference?: string;
  elapsedRecoveryProofReference?: string;
  restoredArtifactReviewReference?: string;
  drillSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryAcceptanceRecordRequest = {
  archiveRecoveryDrillRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  acceptanceOwner?: string;
  recoveryEvidencePacketReference?: string;
  rtoRpoVarianceReviewReference?: string;
  residualRecoveryRiskRegisterReference?: string;
  acceptanceSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryClosureRecordRequest = {
  archiveRecoveryAcceptanceRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  closureOwner?: string;
  recoveryClosurePacketReference?: string;
  followUpActionRegisterReference?: string;
  stakeholderClosureNoticeReference?: string;
  archiveRecoveryClosureSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryAuditCertificationRecordRequest = {
  archiveRecoveryClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  certificationOwner?: string;
  auditEvidenceManifestReference?: string;
  controlMappingReviewReference?: string;
  exceptionDispositionReference?: string;
  auditCertificationSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordRequest = {
  archiveRecoveryAuditCertificationRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  complianceArchiveOwner?: string;
  finalComplianceArchiveIndexReference?: string;
  evidenceRetentionProofReference?: string;
  auditWitnessReceiptReference?: string;
  finalComplianceArchiveSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordRequest = {
  finalComplianceArchiveRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  custodyOwner?: string;
  finalCustodyLedgerReference?: string;
  evidenceTransferReceiptReference?: string;
  retentionLockConfirmationReference?: string;
  custodyClosureSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryOperationalContinuityRecordRequest = {
  evidenceCustodyClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  continuityOwner?: string;
  runbookUpdateReference?: string;
  kpiBaselineReference?: string;
  supportHandoffReference?: string;
  continuitySignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryServiceManagementHandoffRecordRequest = {
  operationalContinuityRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  serviceOwner?: string;
  supportQueueMappingReference?: string;
  knowledgeArticleReference?: string;
  escalationMatrixReference?: string;
  serviceManagementHandoffSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordRequest = {
  serviceManagementHandoffRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  supportOwner?: string;
  serviceDeskAcceptanceReference?: string;
  escalationTestProofReference?: string;
  monitoringOwnershipProofReference?: string;
  supportOwnershipSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordRequest = {
  supportOwnershipAcceptanceRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  monitoringOwner?: string;
  alertOwnershipTransferReference?: string;
  dashboardAcceptanceReference?: string;
  escalationMonitoringValidationReference?: string;
  monitoringOwnershipClosureSignOffReference?: string;
};

export type CreateProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordRequest = {
  monitoringOwnershipClosureRecordId?: string;
  provider?: ProviderReleaseGateRecord["provider"];
  finalOperationsOwner?: string;
  runbookPublicationReference?: string;
  onCallScheduleHandoffReference?: string;
  monitoringClosureAcceptanceReference?: string;
  operationsHandoffSignOffReference?: string;
};

export type CreateAdapterEnablementRecordRequest = {
  provider?: AdapterEnablementRecord["provider"];
  rollbackOwner?: string;
};

export type RegistryAction = "submit" | "approve" | "deprecate" | "restore";

export type RegistryActionResult = {
  status: RegistryStatus;
  actor: string;
};

export type ApiResponse<T> = {
  data: T;
};

export type ProviderReleaseReadinessResponse = ProviderReleaseReadinessSummary;

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
