import type {
  ApprovalRequest,
  AdapterEnablementRecord,
  AhvControlledProvisioningRun,
  AhvCreateAdapterContractReview,
  ControlledProvisioningDecision,
  ControlledCreateAuthorizationEnvelope,
  ControlledProvisioningGate,
  ControlPlaneJob,
  Environment,
  Integration,
  IntegrationConfig,
  AuditExportRecord,
  LabAdapterSnapshot,
  LabAuthorizationScope,
  LifecycleOperationKind,
  LifecycleOperationRecord,
  PlatformConfig,
  PlatformServiceKind,
  PlatformServicePreflightRun,
  PlatformServiceRequest,
  PlatformSession,
  PolicyBundle,
  PrismInventoryImportResult,
  PrismInventoryRecord,
  ProvisioningAdapterReadiness,
  ProductionReadinessReview,
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

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
