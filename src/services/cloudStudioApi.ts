import type {
  ApprovalRequest,
  Environment,
  Integration,
  IntegrationConfig,
  LabAdapterSnapshot,
  PlatformSession,
  SystemStatus,
  Target,
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
  approvals: ApprovalRequest[];
  auditEvents: Array<{
    id: string;
    action: string;
    actor: string;
    target: string;
    createdAt: string;
  }>;
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
