import type {
  ApprovalRequest,
  AdapterEnablementRecord,
  AhvControlledProvisioningRun,
  AhvCreateAdapterContractReview,
  ControlledProvisioningDecision,
  ControlledLabReleaseRunbookRecord,
  ControlledLabExecutionApprovalGate,
  ControlledLabDryRunExecutionChecklist,
  ControlledLabExecutionEvidenceLedger,
  ControlledLabExecutionReadinessAttestation,
  ControlledLabExecutionRehearsalPacket,
  ControlledLabDryRunWindowRecord,
  ControlledCreateAuthorizationEnvelope,
  ControlledProvisioningGate,
  ControlPlaneJob,
  ExecutionBrokerDispatchApproval,
  ExecutionBrokerQueueRecord,
  Environment,
  Integration,
  IntegrationConfig,
  AuditExportRecord,
  LabWindowEvidenceExportRecord,
  LabEvidenceReviewRecord,
  LabExecutionProposalEnvelope,
  LabExecutionProposalExportRecord,
  LabAdapterSnapshot,
  LabAuthorizationScope,
  LifecycleOperationKind,
  LifecycleOperationRecord,
  ManualRealAdapterSwitchReview,
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
