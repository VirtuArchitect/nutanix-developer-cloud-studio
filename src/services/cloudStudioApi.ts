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
  ResourceProfile,
  TemplateRegistryEntry,
  SystemStatus,
  Target,
  VmSandboxDryRunPlan,
  VmSandboxDryRunRequest,
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

export async function fetchSystemStatusFromApi() {
  return fetchJson<SystemStatus>("/api/system/status");
}

export async function fetchIntegrationsFromApi() {
  return fetchJson<Integration[]>("/api/integrations");
}

export async function fetchIntegrationConfigsFromApi() {
  return fetchJson<IntegrationConfig[]>("/api/integration-config");
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

export async function fetchControlPlaneJobsFromApi() {
  return fetchJson<ControlPlaneJob[]>("/api/control-plane/jobs");
}

export async function fetchVmSandboxDryRunsFromApi() {
  return fetchJson<VmSandboxDryRunPlan[]>("/api/vm-sandbox/dry-runs");
}

export async function createVmSandboxDryRunViaApi(payload: Partial<VmSandboxDryRunRequest>) {
  return fetchJson<VmSandboxDryRunPlan>("/api/vm-sandbox/dry-runs", {
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
