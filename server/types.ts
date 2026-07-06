import type {
  ApprovalRequest,
  ControlPlaneJob,
  Environment,
  Integration,
  IntegrationConfig,
  LabAdapterSnapshot,
  PlatformConfig,
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
} from "../src/data/cloudStudioDomain";
import type { ProvisioningJob } from "../src/services/nutanixAdapters";

export type ApiState = {
  templates: Template[];
  environments: Environment[];
  integrations: Integration[];
  integrationConfigs: IntegrationConfig[];
  labAdapters: LabAdapterSnapshot[];
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
