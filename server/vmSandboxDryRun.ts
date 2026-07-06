import type {
  PlatformConfig,
  ResourceProfile,
  TemplateRegistryEntry,
  VmSandboxDryRunPlan,
  VmSandboxDryRunRequest,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateVmSandboxDryRunRequest } from "./types";

const maxQuota = {
  cpu: 4,
  memoryGb: 16,
  diskGb: 160,
};

export function createVmSandboxDryRunPlan(
  state: ApiState,
  input: CreateVmSandboxDryRunRequest,
  actor: string
): VmSandboxDryRunPlan {
  const request = normalizeRequest(state.platformConfig, input, actor);
  const image = state.resourceProfiles.find((profile) => profile.id === request.imageProfileId);
  const registryEntry = state.templateRegistry.find((entry) => entry.templateId === "vm-app");
  const validations = validateRequest(request, image, registryEntry, state.platformConfig);
  const now = new Date().toISOString();

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
      maxCpu: maxQuota.cpu,
      maxMemoryGb: maxQuota.memoryGb,
      maxDiskGb: maxQuota.diskGb,
    },
    expiryDays: request.expiryDays,
    estimatedMonthlyCost: estimateVmSandboxCost(request),
    approvalEvidence: [
      registryEntry?.approvalEvidence ?? "Template approval evidence is missing.",
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
    createdAt: now,
  };
}

function normalizeRequest(
  platformConfig: PlatformConfig,
  input: CreateVmSandboxDryRunRequest,
  actor: string
): VmSandboxDryRunRequest {
  return {
    environmentName: (input.environmentName ?? "vm-sandbox-dry-run").trim(),
    owner: (input.owner ?? actor).trim(),
    imageProfileId: input.imageProfileId ?? "ahv-rocky-9-hardened",
    project: input.project ?? platformConfig.defaultProject,
    cluster: input.cluster ?? platformConfig.defaultCluster,
    network: input.network ?? platformConfig.networkProfile,
    category: input.category ?? "Lifecycle:30-day-expiry",
    cpu: Number(input.cpu ?? 2),
    memoryGb: Number(input.memoryGb ?? 8),
    diskGb: Number(input.diskGb ?? 80),
    expiryDays: Number(input.expiryDays ?? 30),
  };
}

function validateRequest(
  request: VmSandboxDryRunRequest,
  image: ResourceProfile | undefined,
  registryEntry: TemplateRegistryEntry | undefined,
  platformConfig: PlatformConfig
) {
  return [
    {
      name: "Template published",
      passed: registryEntry?.status === "Published",
      detail: registryEntry?.status === "Published" ? "Linux VM App Sandbox is published." : "Template must be published before dry-run.",
    },
    {
      name: "AHV image approved",
      passed: image?.kind === "AHV Image" && image.status === "Published",
      detail: image ? `${image.name} is ${image.status}.` : "Image profile was not found.",
    },
    {
      name: "Project mapped",
      passed: Boolean(request.project && request.project === platformConfig.defaultProject),
      detail: `Project ${request.project} mapped to platform config.`,
    },
    {
      name: "Cluster mapped",
      passed: Boolean(request.cluster && request.cluster === platformConfig.defaultCluster),
      detail: `Cluster ${request.cluster} mapped to platform config.`,
    },
    {
      name: "Network mapped",
      passed: Boolean(request.network && request.network === platformConfig.networkProfile),
      detail: `Network ${request.network} mapped to platform config.`,
    },
    {
      name: "Category mapped",
      passed: request.category.startsWith("Lifecycle:"),
      detail: `${request.category} will drive lifecycle policy in a future create path.`,
    },
    {
      name: "Quota within sandbox limit",
      passed: request.cpu <= maxQuota.cpu && request.memoryGb <= maxQuota.memoryGb && request.diskGb <= maxQuota.diskGb,
      detail: `${request.cpu} vCPU, ${request.memoryGb} GB RAM, ${request.diskGb} GB disk requested.`,
    },
    {
      name: "Expiry within policy",
      passed: request.expiryDays > 0 && request.expiryDays <= 30,
      detail: `${request.expiryDays} day expiry requested.`,
    },
    {
      name: "Approval evidence present",
      passed: Boolean(registryEntry?.approvalEvidence && image?.approvedBy),
      detail: "Template and image approval evidence are required before future provisioning.",
    },
  ];
}

function estimateVmSandboxCost(request: VmSandboxDryRunRequest) {
  const compute = request.cpu * 95 + request.memoryGb * 18 + request.diskGb * 2;
  const lifecycleDiscount = request.expiryDays <= 14 ? 0.85 : 1;
  return Math.round(compute * lifecycleDiscount);
}
