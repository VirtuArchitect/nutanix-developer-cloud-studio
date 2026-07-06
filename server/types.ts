import type {
  ApprovalRequest,
  ControlledProvisioningDecision,
  ControlledProvisioningGate,
  ControlPlaneJob,
  Environment,
  Integration,
  IntegrationConfig,
  LabAdapterSnapshot,
  LabAuthorizationScope,
  PlatformConfig,
  PlatformServiceKind,
  PlatformServiceRequest,
  PlatformSession,
  PolicyBundle,
  PrismInventoryImportResult,
  PrismInventoryRecord,
  ProvisioningAdapterReadiness,
  RegistryStatus,
  ResourceProfile,
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
  session: PlatformSession;
  governance: TemplateGovernance;
  jobs: ProvisioningJob[];
  approvals: ApprovalRequest[];
  controlPlaneJobs: ControlPlaneJob[];
  vmSandboxDryRuns: VmSandboxDryRunPlan[];
  controlledProvisioningGates: ControlledProvisioningGate[];
  platformServiceRequests: PlatformServiceRequest[];
  vmLifecycleProofs: VmLifecycleProof[];
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
};

export type CreateVmLifecycleProofRequest = {
  gateId?: string;
  rollbackVerified?: boolean;
  destroyVerified?: boolean;
  evidence?: string[];
};

export type CreatePlatformServiceRequest = {
  kind: PlatformServiceKind;
  serviceName?: string;
  environmentName?: string;
  owner?: string;
  profileId?: string;
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
