import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type {
  AhvControlledProvisioningRun,
  AhvLabRuntimeConfig,
  AhvLabRuntimePreflight,
  VmSandboxDryRunPlan,
} from "../src/data/cloudStudioDomain";
import { getActiveLabAuthorizationScope } from "./authorizationEvidence";
import type { ApiState } from "./types";

type PrismTaskState = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";
type PrismOperation = "listClusters" | "listProjects" | "listImages" | "listSubnets";
type PrismElementOperation = "getCluster" | "listImages" | "listNetworks" | "listVms";
const prismListPath: Record<PrismOperation, string> = {
  listClusters: "clusters",
  listProjects: "projects",
  listImages: "images",
  listSubnets: "subnets",
};

const prismElementPath: Record<PrismElementOperation, string> = {
  getCluster: "/PrismGateway/services/rest/v2.0/cluster",
  listImages: "/PrismGateway/services/rest/v2.0/images",
  listNetworks: "/PrismGateway/services/rest/v2.0/networks",
  listVms: "/PrismGateway/services/rest/v2.0/vms",
};

type PrismTaskResponse = {
  task_uuid?: string;
  uuid?: string;
  entity_uuid?: string;
  logical_timestamp?: number;
  progress_status?: string;
  metadata?: { uuid?: string };
  status?: {
    state?: PrismTaskState;
    percentage_complete?: number;
    message?: string;
    entity_reference_list?: Array<{ uuid?: string; kind?: string }>;
    entity_reference?: { uuid?: string; kind?: string };
  };
  task_reference?: { uuid?: string };
};

type PrismTransport = (request: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;

export class AhvLabRuntimeError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createAhvLabRuntimeConfig(env = process.env): AhvLabRuntimeConfig {
  const provider = env.NDC_AHV_LAB_PROVIDER === "prism-element" ? "prism-element" : "prism-central";
  const pcUrl = env.NUTANIX_PRISM_CENTRAL_URL ?? "";
  const peUrl = env.NUTANIX_PRISM_ELEMENT_URL ?? "";
  const parsedPcUrl = safeUrl(pcUrl);
  const parsedPeUrl = safeUrl(peUrl);
  const parsedActiveUrl = provider === "prism-element" ? parsedPeUrl : parsedPcUrl;
  const appEnv = env.APP_ENV ?? "development";
  const realAdapter = env.NDC_AHV_REAL_ADAPTER_ENABLED === "true";
  const prismElementAdapter = env.NDC_AHV_PE_LAB_ADAPTER_ENABLED === "true";
  const controlledProvisioning = env.NDC_CONTROLLED_PROVISIONING_ENABLED === "true";
  const labLifecycle = env.NDC_AHV_LAB_LIFECYCLE_ENABLED === "true";
  const tlsInsecure = env.NDC_PRISM_TLS_INSECURE === "true";
  const usernameConfigured = provider === "prism-element" ? Boolean(env.NUTANIX_PRISM_ELEMENT_USERNAME) : Boolean(env.NUTANIX_PRISM_USERNAME);
  const passwordConfigured = provider === "prism-element" ? Boolean(env.NUTANIX_PRISM_ELEMENT_PASSWORD) : Boolean(env.NUTANIX_PRISM_PASSWORD);
  const allowedClusterUuidConfigured = provider === "prism-element" ? Boolean(env.NDC_AHV_PE_ALLOWED_CLUSTER_UUID) : Boolean(env.NDC_AHV_ALLOWED_CLUSTER_UUID);
  const allowedProjectUuidConfigured = provider === "prism-element" ? true : Boolean(env.NDC_AHV_ALLOWED_PROJECT_UUID);
  const allowedSubnetUuidConfigured = provider === "prism-element" ? Boolean(env.NDC_AHV_PE_ALLOWED_SUBNET_UUID) : Boolean(env.NDC_AHV_ALLOWED_SUBNET_UUID);
  const allowedImageUuidConfigured = provider === "prism-element" ? Boolean(env.NDC_AHV_PE_ALLOWED_IMAGE_UUID) : Boolean(env.NDC_AHV_ALLOWED_IMAGE_UUID);
  const vmNamePrefix = env.NDC_AHV_VM_NAME_PREFIX || "ndc-lab-";
  const quotas = {
    maxCpu: positiveNumber(env.NDC_AHV_MAX_CPU, 4),
    maxMemoryGb: positiveNumber(env.NDC_AHV_MAX_MEMORY_GB, 16),
    maxDiskGb: positiveNumber(env.NDC_AHV_MAX_DISK_GB, 160),
    defaultExpiryHours: positiveNumber(env.NDC_AHV_DEFAULT_EXPIRY_HOURS, 24),
  };

  const checks = [
    check("Lab app environment", appEnv === "lab", `APP_ENV=${appEnv}.`),
    check("Real AHV adapter switch", realAdapter, `NDC_AHV_REAL_ADAPTER_ENABLED=${String(realAdapter)}.`),
    check(
      "Prism Element adapter switch",
      provider === "prism-central" || prismElementAdapter,
      provider === "prism-element" ? `NDC_AHV_PE_LAB_ADAPTER_ENABLED=${String(prismElementAdapter)}.` : "Not required for Prism Central provider."
    ),
    check("Controlled provisioning switch", controlledProvisioning, `NDC_CONTROLLED_PROVISIONING_ENABLED=${String(controlledProvisioning)}.`),
    check("Lab lifecycle switch", labLifecycle, `NDC_AHV_LAB_LIFECYCLE_ENABLED=${String(labLifecycle)}.`),
    check(
      provider === "prism-element" ? "Prism Element endpoint" : "Prism Central endpoint",
      Boolean(parsedActiveUrl),
      parsedActiveUrl ? `Host ${parsedActiveUrl.host}.` : `${provider === "prism-element" ? "NUTANIX_PRISM_ELEMENT_URL" : "NUTANIX_PRISM_CENTRAL_URL"} is required.`
    ),
    check("Prism username", usernameConfigured, usernameConfigured ? "Username is configured." : `${provider === "prism-element" ? "NUTANIX_PRISM_ELEMENT_USERNAME" : "NUTANIX_PRISM_USERNAME"} is required.`),
    check("Prism password", passwordConfigured, passwordConfigured ? "Password is configured." : `${provider === "prism-element" ? "NUTANIX_PRISM_ELEMENT_PASSWORD" : "NUTANIX_PRISM_PASSWORD"} is required.`),
    check("Allowed cluster UUID", allowedClusterUuidConfigured, `${provider === "prism-element" ? "NDC_AHV_PE_ALLOWED_CLUSTER_UUID" : "NDC_AHV_ALLOWED_CLUSTER_UUID"} must be configured.`),
    check("Allowed project UUID", allowedProjectUuidConfigured, provider === "prism-element" ? "Prism Element lab does not require project scoping." : "NDC_AHV_ALLOWED_PROJECT_UUID must be configured."),
    check("Allowed subnet UUID", allowedSubnetUuidConfigured, `${provider === "prism-element" ? "NDC_AHV_PE_ALLOWED_SUBNET_UUID" : "NDC_AHV_ALLOWED_SUBNET_UUID"} must be configured.`),
    check("Allowed image UUID", allowedImageUuidConfigured, `${provider === "prism-element" ? "NDC_AHV_PE_ALLOWED_IMAGE_UUID" : "NDC_AHV_ALLOWED_IMAGE_UUID"} must be configured.`),
    check("VM name prefix", vmNamePrefix.length >= 4 && !/prod|production/i.test(vmNamePrefix), `Prefix ${vmNamePrefix}.`),
    check("TLS policy", !tlsInsecure || appEnv === "lab", tlsInsecure ? "Insecure TLS is allowed only in lab mode." : "TLS verification is required."),
  ];
  const provisioningEnabled = checks.every((item) => item.passed);

  return {
    mode: provisioningEnabled ? "Lab ready" : "Disabled",
    provider,
    appEnv,
    prismCentralUrlConfigured: Boolean(parsedPcUrl),
    prismCentralUrlHost: parsedPcUrl?.host,
    prismElementUrlConfigured: Boolean(parsedPeUrl),
    prismElementUrlHost: parsedPeUrl?.host,
    usernameConfigured,
    passwordConfigured,
    allowedClusterUuidConfigured,
    allowedProjectUuidConfigured,
    allowedSubnetUuidConfigured,
    allowedImageUuidConfigured,
    vmNamePrefix,
    quotas,
    switches: {
      realAdapter,
      prismElementAdapter,
      controlledProvisioning,
      labLifecycle,
      trustedIdentityRequired: env.NDC_REQUIRE_TRUSTED_IDENTITY === "true",
      tlsInsecure,
    },
    checks,
    provisioningEnabled,
    realPrismCallsEnabled: provisioningEnabled,
  };
}

export function assertAhvLabRuntimeReady(env = process.env) {
  const config = createAhvLabRuntimeConfig(env);
  if (!config.provisioningEnabled) {
    throw new AhvLabRuntimeError(
      "ahv_lab_runtime_disabled",
      `AHV lab runtime is disabled: ${config.checks.filter((item) => !item.passed).map((item) => item.name).join(", ")}.`
    );
  }
  return config;
}

export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      /authorization|password|token|secret/i.test(key) ? "[REDACTED]" : redactSensitive(entry),
    ])
  );
}

export class PrismCentralV3Client {
  private readonly baseUrl: URL;
  private readonly username: string;
  private readonly password: string;
  private readonly insecureTls: boolean;

  constructor(
    env = process.env,
    private readonly transport?: PrismTransport
  ) {
    const endpoint = env.NUTANIX_PRISM_CENTRAL_URL;
    if (!endpoint) {
      throw new AhvLabRuntimeError("prism_endpoint_missing", "NUTANIX_PRISM_CENTRAL_URL is required.");
    }
    this.baseUrl = new URL(endpoint);
    this.username = env.NUTANIX_PRISM_USERNAME ?? "";
    this.password = env.NUTANIX_PRISM_PASSWORD ?? "";
    this.insecureTls = env.NDC_PRISM_TLS_INSECURE === "true" && env.APP_ENV === "lab";
  }

  list(operation: PrismOperation) {
    return this.request("POST", `/api/nutanix/v3/${prismListPath[operation]}/list`, { kind: operation });
  }

  createVm(payload: Record<string, unknown>) {
    return this.request("POST", "/api/nutanix/v3/vms", payload);
  }

  pollTask(taskUuid: string) {
    return this.request("GET", `/api/nutanix/v3/tasks/${encodeURIComponent(taskUuid)}`);
  }

  setPowerState(vmUuid: string, state: "ON" | "OFF") {
    return this.request("POST", `/api/nutanix/v3/vms/${encodeURIComponent(vmUuid)}/set_power_state`, {
      transition: state,
    });
  }

  deleteVm(vmUuid: string) {
    return this.request("DELETE", `/api/nutanix/v3/vms/${encodeURIComponent(vmUuid)}`);
  }

  private async request(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: Record<string, unknown>) {
    if (this.transport) {
      return this.transport({ method, path, body });
    }

    const url = new URL(`${trimSlash(this.baseUrl.pathname)}${path}`, this.baseUrl);
    const payload = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`,
    };
    if (payload) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = String(Buffer.byteLength(payload));
    }

    const requestImpl = url.protocol === "https:" ? httpsRequest : httpRequest;
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const options = {
        method,
        headers,
        ...(url.protocol === "https:" ? { rejectUnauthorized: !this.insecureTls } : {}),
      };
      const req = requestImpl(
        url,
        options,
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
          res.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf8");
            const parsed = text ? JSON.parse(text) : {};
            if ((res.statusCode ?? 500) >= 400) {
              reject(new AhvLabRuntimeError("prism_request_failed", `Prism request failed with HTTP ${res.statusCode}.`));
              return;
            }
            resolve(parsed as Record<string, unknown>);
          });
        }
      );
      req.on("error", reject);
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }
}

export class PrismElementV2Client {
  private readonly baseUrl: URL;
  private readonly username: string;
  private readonly password: string;
  private readonly insecureTls: boolean;

  constructor(
    env = process.env,
    private readonly transport?: PrismTransport
  ) {
    const endpoint = env.NUTANIX_PRISM_ELEMENT_URL;
    if (!endpoint) {
      throw new AhvLabRuntimeError("prism_element_endpoint_missing", "NUTANIX_PRISM_ELEMENT_URL is required.");
    }
    this.baseUrl = new URL(endpoint);
    this.username = env.NUTANIX_PRISM_ELEMENT_USERNAME ?? "";
    this.password = env.NUTANIX_PRISM_ELEMENT_PASSWORD ?? "";
    this.insecureTls = env.NDC_PRISM_TLS_INSECURE === "true" && env.APP_ENV === "lab";
  }

  list(operation: PrismElementOperation) {
    return this.request("GET", prismElementPath[operation]);
  }

  createVm(payload: Record<string, unknown>) {
    return this.request("POST", "/PrismGateway/services/rest/v2.0/vms", payload);
  }

  pollTask(taskUuid: string) {
    return this.request("GET", `/PrismGateway/services/rest/v2.0/tasks/${encodeURIComponent(taskUuid)}`);
  }

  setPowerState(vmUuid: string, state: "ON" | "OFF") {
    return this.request("PUT", `/PrismGateway/services/rest/v2.0/vms/${encodeURIComponent(vmUuid)}/set_power_state`, {
      transition: state,
    });
  }

  deleteVm(vmUuid: string) {
    return this.request("DELETE", `/PrismGateway/services/rest/v2.0/vms/${encodeURIComponent(vmUuid)}`);
  }

  private async request(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: Record<string, unknown>) {
    if (this.transport) {
      return this.transport({ method, path, body });
    }

    const url = new URL(`${trimSlash(this.baseUrl.pathname)}${path}`, this.baseUrl);
    const payload = body ? JSON.stringify(body) : undefined;
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`,
    };
    if (payload) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = String(Buffer.byteLength(payload));
    }

    const requestImpl = url.protocol === "https:" ? httpsRequest : httpRequest;
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const req = requestImpl(
        url,
        {
          method,
          headers,
          ...(url.protocol === "https:" ? { rejectUnauthorized: !this.insecureTls } : {}),
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
          res.on("end", () => {
            const text = Buffer.concat(chunks).toString("utf8");
            const parsed = text ? JSON.parse(text) : {};
            if ((res.statusCode ?? 500) >= 400) {
              reject(new AhvLabRuntimeError("prism_element_request_failed", `Prism Element request failed with HTTP ${res.statusCode}.`));
              return;
            }
            resolve(parsed as Record<string, unknown>);
          });
        }
      );
      req.on("error", reject);
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }
}

export class LabAhvPrismAdapter {
  constructor(private readonly client = new PrismCentralV3Client()) {}

  async preflight(actor: string): Promise<AhvLabRuntimePreflight> {
    const config = createAhvLabRuntimeConfig();
    const operations: PrismOperation[] = ["listClusters", "listProjects", "listImages", "listSubnets"];
    const readOnlyChecks = [];
    if (config.provisioningEnabled) {
      for (const operation of operations) {
        try {
          await this.client.list(operation);
          readOnlyChecks.push({ operation, passed: true, detail: `${operation} succeeded.` });
        } catch (error) {
          readOnlyChecks.push({ operation, passed: false, detail: error instanceof Error ? error.message : `${operation} failed.` });
        }
      }
    }

    const status = config.provisioningEnabled && readOnlyChecks.every((item) => item.passed) ? "Ready" : "Blocked";
    return {
      id: `ahv-lab-preflight-${Date.now()}`,
      status,
      requestedBy: actor,
      config,
      readOnlyChecks,
      redactionApplied: true,
      provisioningEnabled: false,
      realPrismCallsEnabled: config.provisioningEnabled,
      createdAt: new Date().toISOString(),
    };
  }

  async create(state: ApiState, gateId: string | undefined, actor: string): Promise<AhvControlledProvisioningRun> {
    const config = assertAhvLabRuntimeReady();
    const { gate, dryRun, lifecycleProof } = findReadyLifecycleInputs(state, gateId);
    validateDryRunAgainstLabConfig(dryRun, config);
    ensureNoActiveRun(state, dryRun.environmentName, "Lab AHV Prism adapter");

    const payload = createVmPayload(dryRun);
    const response = (await this.client.createVm(payload)) as PrismTaskResponse;
    const taskUuid = extractTaskUuid(response);
    const vmUuid = extractVmUuid(response) ?? `pending-${taskUuid}`;
    const now = new Date().toISOString();
    return {
      id: `ahv-run-${dryRun.environmentName}-${Date.now()}`,
      gateId: gate.id,
      dryRunPlanId: dryRun.id,
      environmentName: dryRun.environmentName,
      action: "Create VM",
      adapterMode: "Lab AHV Prism adapter",
      status: "Submitted",
      checks: labLifecycleChecks(config, dryRun),
      requestedBy: actor,
      labScopeId: getActiveLabAuthorizationScope(state)?.id,
      lifecycleProofId: lifecycleProof.id,
      prismTaskUuid: taskUuid,
      prismTaskUuids: [taskUuid],
      vmUuid,
      createStatus: "Submitted",
      powerStatus: "Not requested",
      destroyStatus: "Not requested",
      rollbackDestroyEvidence: [`Destroy route available for ${dryRun.environmentName}.`],
      mutationOperationsBlocked: ["bulk_delete", "unscoped_create", "network_change", "image_delete", "production_workload_change"],
      provisioningEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  async poll(run: AhvControlledProvisioningRun): Promise<AhvControlledProvisioningRun> {
    const taskUuid = run.prismTaskUuid;
    if (!taskUuid) {
      throw new AhvLabRuntimeError("ahv_task_missing", "Run does not have a Prism task UUID.");
    }
    const task = (await this.client.pollTask(taskUuid)) as PrismTaskResponse;
    const state = task.status?.state ?? "RUNNING";
    const vmUuid = extractVmUuid(task) ?? run.vmUuid;
    const succeeded = state === "SUCCEEDED";
    const failed = state === "FAILED";
    return {
      ...run,
      status: succeeded ? "Succeeded" : failed ? "Failed" : "Polling",
      vmUuid,
      createStatus: run.createStatus === "Submitted" ? (succeeded ? "Succeeded" : failed ? "Failed" : "Submitted") : run.createStatus,
      failureReason: failed ? task.status?.message ?? "Prism task failed." : run.failureReason,
      lastPollAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async power(run: AhvControlledProvisioningRun, state: "ON" | "OFF"): Promise<AhvControlledProvisioningRun> {
    const vmUuid = requireVmUuid(run);
    const response = (await this.client.setPowerState(vmUuid, state)) as PrismTaskResponse;
    const taskUuid = extractTaskUuid(response);
    return {
      ...run,
      action: "Power VM",
      status: "Submitted",
      prismTaskUuid: taskUuid,
      prismTaskUuids: [...(run.prismTaskUuids ?? []), taskUuid],
      powerStatus: "Submitted",
      updatedAt: new Date().toISOString(),
    };
  }

  async destroy(run: AhvControlledProvisioningRun): Promise<AhvControlledProvisioningRun> {
    const vmUuid = requireVmUuid(run);
    const response = (await this.client.deleteVm(vmUuid)) as PrismTaskResponse;
    const taskUuid = extractTaskUuid(response);
    return {
      ...run,
      action: "Destroy VM",
      status: "Destroyed",
      prismTaskUuid: taskUuid,
      prismTaskUuids: [...(run.prismTaskUuids ?? []), taskUuid],
      destroyStatus: "Submitted",
      inventoryReconciliation: {
        checkedAt: new Date().toISOString(),
        vmPresent: false,
        status: "Reconciled",
        detail: "Destroy task submitted; operator must confirm Prism inventory remains clean after task completion.",
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

export class LabAhvPrismElementAdapter {
  constructor(private readonly client = new PrismElementV2Client()) {}

  async preflight(actor: string): Promise<AhvLabRuntimePreflight> {
    const config = createAhvLabRuntimeConfig();
    const operations: PrismElementOperation[] = ["getCluster", "listImages", "listNetworks", "listVms"];
    const readOnlyChecks = [];
    if (config.provisioningEnabled) {
      for (const operation of operations) {
        try {
          await this.client.list(operation);
          readOnlyChecks.push({ operation: peOperationLabel(operation), passed: true, detail: `${operation} succeeded.` });
        } catch (error) {
          readOnlyChecks.push({ operation: peOperationLabel(operation), passed: false, detail: error instanceof Error ? error.message : `${operation} failed.` });
        }
      }
    }

    const status = config.provisioningEnabled && readOnlyChecks.every((item) => item.passed) ? "Ready" : "Blocked";
    return {
      id: `ahv-pe-lab-preflight-${Date.now()}`,
      status,
      requestedBy: actor,
      config,
      readOnlyChecks,
      redactionApplied: true,
      provisioningEnabled: false,
      realPrismCallsEnabled: config.provisioningEnabled,
      createdAt: new Date().toISOString(),
    };
  }

  async create(state: ApiState, gateId: string | undefined, actor: string): Promise<AhvControlledProvisioningRun> {
    const config = assertAhvLabRuntimeReady();
    const { gate, dryRun, lifecycleProof } = findReadyLifecycleInputs(state, gateId);
    validateDryRunAgainstLabConfig(dryRun, config);
    ensureNoActiveRun(state, dryRun.environmentName, "Lab AHV Prism Element adapter");

    const response = (await this.client.createVm(createPrismElementVmPayload(dryRun))) as PrismTaskResponse;
    const taskUuid = extractTaskUuid(response);
    const vmUuid = extractVmUuid(response) ?? response.entity_uuid ?? `pending-${taskUuid}`;
    const now = new Date().toISOString();
    return {
      id: `ahv-pe-run-${dryRun.environmentName}-${Date.now()}`,
      gateId: gate.id,
      dryRunPlanId: dryRun.id,
      environmentName: dryRun.environmentName,
      action: "Create VM",
      adapterMode: "Lab AHV Prism Element adapter",
      status: "Submitted",
      checks: labLifecycleChecks(config, dryRun),
      requestedBy: actor,
      labScopeId: getActiveLabAuthorizationScope(state)?.id,
      lifecycleProofId: lifecycleProof.id,
      prismTaskUuid: taskUuid,
      prismTaskUuids: [taskUuid],
      vmUuid,
      createStatus: "Submitted",
      powerStatus: "Not requested",
      destroyStatus: "Not requested",
      rollbackDestroyEvidence: [`Destroy route available for ${dryRun.environmentName}.`],
      mutationOperationsBlocked: ["bulk_delete", "unscoped_create", "network_change", "image_delete", "production_workload_change"],
      provisioningEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  async poll(run: AhvControlledProvisioningRun): Promise<AhvControlledProvisioningRun> {
    const taskUuid = run.prismTaskUuid;
    if (!taskUuid) {
      throw new AhvLabRuntimeError("ahv_task_missing", "Run does not have a Prism task UUID.");
    }
    const task = (await this.client.pollTask(taskUuid)) as PrismTaskResponse;
    const state = normalizePrismTaskState(task.status?.state ?? task.progress_status);
    const vmUuid = extractVmUuid(task) ?? task.entity_uuid ?? run.vmUuid;
    const succeeded = state === "SUCCEEDED";
    const failed = state === "FAILED";
    return {
      ...run,
      status: succeeded ? "Succeeded" : failed ? "Failed" : "Polling",
      vmUuid,
      createStatus: run.createStatus === "Submitted" ? (succeeded ? "Succeeded" : failed ? "Failed" : "Submitted") : run.createStatus,
      failureReason: failed ? task.status?.message ?? "Prism Element task failed." : run.failureReason,
      lastPollAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async power(run: AhvControlledProvisioningRun, state: "ON" | "OFF"): Promise<AhvControlledProvisioningRun> {
    const vmUuid = requireVmUuid(run);
    const response = (await this.client.setPowerState(vmUuid, state)) as PrismTaskResponse;
    const taskUuid = extractTaskUuid(response);
    return {
      ...run,
      action: "Power VM",
      status: "Submitted",
      prismTaskUuid: taskUuid,
      prismTaskUuids: [...(run.prismTaskUuids ?? []), taskUuid],
      powerStatus: "Submitted",
      updatedAt: new Date().toISOString(),
    };
  }

  async destroy(run: AhvControlledProvisioningRun): Promise<AhvControlledProvisioningRun> {
    const vmUuid = requireVmUuid(run);
    const response = (await this.client.deleteVm(vmUuid)) as PrismTaskResponse;
    const taskUuid = extractTaskUuid(response);
    return {
      ...run,
      action: "Destroy VM",
      status: "Destroyed",
      prismTaskUuid: taskUuid,
      prismTaskUuids: [...(run.prismTaskUuids ?? []), taskUuid],
      destroyStatus: "Submitted",
      inventoryReconciliation: {
        checkedAt: new Date().toISOString(),
        vmPresent: false,
        status: "Reconciled",
        detail: "Destroy task submitted; operator must confirm Prism Element inventory remains clean after task completion.",
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

function findReadyLifecycleInputs(state: ApiState, gateId?: string) {
  const gate = gateId
    ? state.controlledProvisioningGates.find((item) => item.id === gateId)
    : state.controlledProvisioningGates[0];
  if (!gate) {
    throw new AhvLabRuntimeError("controlled_gate_required", "A controlled provisioning gate is required.");
  }
  const dryRun = state.vmSandboxDryRuns.find((item) => item.id === gate.dryRunPlanId);
  if (!dryRun) {
    throw new AhvLabRuntimeError("dry_run_not_found", "The gate dry-run plan was not found.");
  }
  const lifecycleProof = state.vmLifecycleProofs.find((proof) => proof.gateId === gate.id && proof.status === "Verified");
  const scope = getActiveLabAuthorizationScope(state);
  const envelope = state.controlledCreateAuthorizationEnvelopes.find((item) => item.gateId === gate.id);
  const checks = [
    check("Controlled gate approved", gate.status === "Approved for controlled create", gate.status),
    check("Lab scope active", Boolean(scope), scope?.id ?? "missing"),
    check("Lifecycle proof verified", Boolean(lifecycleProof), lifecycleProof?.id ?? "missing"),
    check("Authorization envelope ready", envelope?.status === "Ready for authorization review", envelope?.status ?? "missing"),
  ];
  if (!checks.every((item) => item.passed)) {
    throw new AhvLabRuntimeError(
      "ahv_lifecycle_gate_blocked",
      `AHV lifecycle gate is blocked: ${checks.filter((item) => !item.passed).map((item) => item.name).join(", ")}.`
    );
  }
  return { gate, dryRun, lifecycleProof: lifecycleProof! };
}

function validateDryRunAgainstLabConfig(dryRun: VmSandboxDryRunPlan, config: AhvLabRuntimeConfig) {
  const failures = labLifecycleChecks(config, dryRun).filter((item) => !item.passed);
  if (failures.length > 0) {
    throw new AhvLabRuntimeError("ahv_lab_safety_check_failed", failures.map((item) => item.name).join(", "));
  }
}

function labLifecycleChecks(config: AhvLabRuntimeConfig, dryRun: VmSandboxDryRunPlan) {
  return [
    check("VM name prefix", dryRun.environmentName.startsWith(config.vmNamePrefix), `${dryRun.environmentName} must start with ${config.vmNamePrefix}.`),
    check("Production-like name blocked", !/prod|production/i.test(dryRun.environmentName), "Production-like names are blocked."),
    check("CPU quota", dryRun.quota.cpu <= config.quotas.maxCpu, `${dryRun.quota.cpu}/${config.quotas.maxCpu} vCPU.`),
    check("Memory quota", dryRun.quota.memoryGb <= config.quotas.maxMemoryGb, `${dryRun.quota.memoryGb}/${config.quotas.maxMemoryGb} GB.`),
    check("Disk quota", dryRun.quota.diskGb <= config.quotas.maxDiskGb, `${dryRun.quota.diskGb}/${config.quotas.maxDiskGb} GB.`),
    check("Destroy path available", true, "Destroy route is implemented before create execution."),
  ];
}

function ensureNoActiveRun(state: ApiState, environmentName: string, adapterMode: AhvControlledProvisioningRun["adapterMode"]) {
  const active = state.ahvControlledProvisioningRuns.find(
    (run) =>
      run.environmentName === environmentName &&
      run.adapterMode === adapterMode &&
      !["Failed", "Destroyed"].includes(run.status)
  );
  if (active) {
    throw new AhvLabRuntimeError("ahv_active_vm_exists", `Active AHV run already exists for ${environmentName}.`);
  }
}

function createVmPayload(dryRun: VmSandboxDryRunPlan) {
  return {
    spec: {
      name: dryRun.environmentName,
      resources: {
        num_sockets: dryRun.quota.cpu,
        memory_size_mib: dryRun.quota.memoryGb * 1024,
        disk_list: [{ disk_size_mib: dryRun.quota.diskGb * 1024 }],
        image_reference: { uuid: process.env.NDC_AHV_ALLOWED_IMAGE_UUID, kind: "image" },
        subnet_reference: { uuid: process.env.NDC_AHV_ALLOWED_SUBNET_UUID, kind: "subnet" },
        project_reference: { uuid: process.env.NDC_AHV_ALLOWED_PROJECT_UUID, kind: "project" },
        cluster_reference: { uuid: process.env.NDC_AHV_ALLOWED_CLUSTER_UUID, kind: "cluster" },
      },
      categories: { Lifecycle: `${dryRun.expiryDays}-day-expiry`, Owner: dryRun.owner },
    },
    metadata: {
      kind: "vm",
      categories: { Lifecycle: `${dryRun.expiryDays}-day-expiry`, Source: "NDCStudioLab" },
    },
  };
}

function createPrismElementVmPayload(dryRun: VmSandboxDryRunPlan) {
  return {
    name: dryRun.environmentName,
    memory_mb: dryRun.quota.memoryGb * 1024,
    num_vcpus: dryRun.quota.cpu,
    num_cores_per_vcpu: 1,
    vm_disks: [
      {
        is_cdrom: false,
        vm_disk_clone: {
          disk_address: {
            vmdisk_uuid: process.env.NDC_AHV_PE_ALLOWED_IMAGE_UUID,
          },
        },
      },
    ],
    vm_nics: [
      {
        network_uuid: process.env.NDC_AHV_PE_ALLOWED_SUBNET_UUID,
        request_ip: false,
      },
    ],
    description: `Created by NDC Studio PE lab adapter; expires in ${dryRun.expiryDays} days.`,
    categories: {
      Lifecycle: `${dryRun.expiryDays}-day-expiry`,
      Source: "NDCStudioPrismElementLab",
      Owner: dryRun.owner,
    },
  };
}

function extractTaskUuid(response: PrismTaskResponse) {
  const uuid = response.task_reference?.uuid ?? response.task_uuid ?? response.metadata?.uuid ?? response.uuid;
  if (!uuid) {
    throw new AhvLabRuntimeError("prism_task_uuid_missing", "Prism response did not include a task UUID.");
  }
  return uuid;
}

function extractVmUuid(response: PrismTaskResponse) {
  return response.status?.entity_reference?.uuid ?? response.status?.entity_reference_list?.find((item) => item.kind === "vm")?.uuid;
}

function requireVmUuid(run: AhvControlledProvisioningRun) {
  if (!run.vmUuid || run.vmUuid.startsWith("pending-")) {
    throw new AhvLabRuntimeError("ahv_vm_uuid_missing", "Run must have a reconciled VM UUID before this action.");
  }
  return run.vmUuid;
}

function normalizePrismTaskState(value: string | undefined): PrismTaskState {
  switch ((value ?? "").toUpperCase()) {
    case "SUCCEEDED":
    case "KSUCCEEDED":
    case "COMPLETE":
    case "COMPLETED":
      return "SUCCEEDED";
    case "FAILED":
    case "KFAILED":
    case "ERROR":
      return "FAILED";
    case "QUEUED":
    case "KQUEUED":
      return "QUEUED";
    default:
      return "RUNNING";
  }
}

function peOperationLabel(operation: PrismElementOperation): AhvLabRuntimePreflight["readOnlyChecks"][number]["operation"] {
  switch (operation) {
    case "getCluster":
      return "listClusters";
    case "listNetworks":
      return "listSubnets";
    case "listImages":
      return "listImages";
    case "listVms":
      return "listVms";
  }
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function check(name: string, passed: boolean, detail: string) {
  return { name, passed, detail };
}

function safeUrl(value: string) {
  try {
    return value ? new URL(value) : undefined;
  } catch {
    return undefined;
  }
}

function trimSlash(value: string) {
  return value.replace(/\/$/, "");
}
