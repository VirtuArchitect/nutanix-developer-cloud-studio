import type { PlatformServiceKind, PlatformServiceRequest, ResourceProfile, ResourceProfileKind } from "../src/data/cloudStudioDomain";
import type { ApiState, CreatePlatformServiceRequest } from "./types";

export class PlatformServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const serviceDefaults: Record<
  PlatformServiceKind,
  {
    provider: ResourceProfile["provider"];
    profileKind: ResourceProfileKind;
    defaultProfileId: string;
    defaultName: string;
    baseCost: number;
    approvalRequired: boolean;
    rollbackPlan: string[];
    cleanupPlan: string[];
  }
> = {
  "NKP Namespace": {
    provider: "NKP",
    profileKind: "Kubernetes Version",
    defaultProfileId: "nkp-1-30-standard",
    defaultName: "app-namespace-dev",
    baseCost: 480,
    approvalRequired: false,
    rollbackPlan: ["Remove namespace quota and ingress policy.", "Delete namespace after workload drain is confirmed."],
    cleanupPlan: ["Verify no pods, services, ingress rules, or persistent volume claims remain."],
  },
  "NDB PostgreSQL": {
    provider: "NDB",
    profileKind: "Database Engine",
    defaultProfileId: "ndb-postgres-16-dev",
    defaultName: "app-postgres-dev",
    baseCost: 720,
    approvalRequired: true,
    rollbackPlan: ["Restore from latest backup snapshot if creation validation fails.", "Remove database instance after export window is closed."],
    cleanupPlan: ["Confirm backup policy, restore point, and database endpoint are removed."],
  },
  "NUS Storage": {
    provider: "NUS",
    profileKind: "Storage Class",
    defaultProfileId: "nus-object-dev",
    defaultName: "app-object-dev",
    baseCost: 260,
    approvalRequired: false,
    rollbackPlan: ["Remove storage allocation before publishing access bindings."],
    cleanupPlan: ["Verify bucket/share, lifecycle rule, and access binding removal."],
  },
  "NAI Endpoint": {
    provider: "NAI",
    profileKind: "AI Profile",
    defaultProfileId: "nai-gpu-small",
    defaultName: "app-ai-endpoint-dev",
    baseCost: 1380,
    approvalRequired: true,
    rollbackPlan: ["Disable endpoint route and release GPU quota.", "Keep model artifacts in storage until owner confirms cleanup."],
    cleanupPlan: ["Verify endpoint route, GPU allocation, and model-serving deployment are removed."],
  },
};

export function createPlatformServiceRequest(
  state: ApiState,
  input: CreatePlatformServiceRequest,
  actor: string
): PlatformServiceRequest {
  const defaults = serviceDefaults[input.kind];
  if (!defaults) {
    throw new PlatformServiceError("platform_service_unknown", "Platform service kind is not supported.");
  }

  const profile = state.resourceProfiles.find(
    (item) => item.id === (input.profileId ?? defaults.defaultProfileId) && item.provider === defaults.provider
  );
  const vmLifecycleProven = isVmLifecycleProven(state);
  const createdAt = new Date().toISOString();
  const owner = (input.owner ?? actor).trim();
  const serviceName = (input.serviceName ?? defaults.defaultName).trim();
  const environmentName = (input.environmentName ?? `${serviceName}-env`).trim();
  const validations = buildValidations({ profile, defaults, vmLifecycleProven, serviceName, environmentName });
  const validationPassed = validations.every((validation) => validation.passed);

  return {
    id: `platform-service-${defaults.provider.toLowerCase()}-${serviceName}-${Date.now()}`,
    kind: input.kind,
    serviceName,
    environmentName,
    owner,
    profileId: profile?.id ?? defaults.defaultProfileId,
    profileName: profile?.name ?? "Profile not found",
    provider: defaults.provider,
    status: !validationPassed ? "Blocked" : defaults.approvalRequired ? "Needs approval" : "Ready for approval",
    dependsOnVmLifecycle: true,
    vmLifecycleProven,
    validations,
    estimatedMonthlyCost: defaults.baseCost,
    approvalRequired: defaults.approvalRequired,
    approvalEvidence: [
      profile?.approvedBy ? `${profile.name} approved by ${profile.approvedBy} at ${profile.approvedAt ?? "unknown time"}.` : "Profile approval is missing.",
      vmLifecycleProven
        ? "VM lifecycle proof is present for platform-service promotion."
        : "VM lifecycle proof is required before platform-service provisioning.",
      `Request planned by ${actor}; provisioning remains disabled.`,
    ],
    rollbackPlan: defaults.rollbackPlan,
    cleanupPlan: defaults.cleanupPlan,
    provisioningEnabled: false,
    createdAt,
  };
}

function isVmLifecycleProven(state: ApiState) {
  return state.vmLifecycleProofs.some((proof) => proof.status === "Verified");
}

function buildValidations({
  profile,
  defaults,
  vmLifecycleProven,
  serviceName,
  environmentName,
}: {
  profile?: ResourceProfile;
  defaults: (typeof serviceDefaults)[PlatformServiceKind];
  vmLifecycleProven: boolean;
  serviceName: string;
  environmentName: string;
}) {
  return [
    {
      name: "Profile published",
      passed: profile?.kind === defaults.profileKind && profile.status === "Published",
      detail: profile ? `${profile.name} is ${profile.status}.` : "Required profile was not found.",
    },
    {
      name: "Provider matched",
      passed: profile?.provider === defaults.provider,
      detail: `Expected provider ${defaults.provider}.`,
    },
    {
      name: "Service name valid",
      passed: /^[a-z0-9][a-z0-9-]{2,48}$/.test(serviceName),
      detail: `${serviceName} will be used as the service identifier.`,
    },
    {
      name: "Environment mapped",
      passed: Boolean(environmentName),
      detail: `${environmentName} is the owning environment reference.`,
    },
    {
      name: "VM lifecycle proven",
      passed: vmLifecycleProven,
      detail: vmLifecycleProven
        ? "Controlled VM lifecycle proof is present."
        : "Complete controlled VM create, verify, rollback, and destroy proof before platform services are enabled.",
    },
  ];
}
