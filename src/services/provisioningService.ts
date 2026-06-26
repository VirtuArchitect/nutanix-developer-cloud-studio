import {
  initialEnvironments,
  provisioningEvents,
  type Environment,
  type EnvironmentStatus,
  type JobState,
  type Target,
  type Template,
  type TemplateGovernance,
} from "../data/cloudStudioData";

export const ENVIRONMENT_STORAGE_KEY = "ndc-studio-environments";
export const GOVERNANCE_STORAGE_KEY = "ndc-studio-template-governance";

type EnvironmentStorage = Pick<Storage, "getItem" | "setItem">;

export type ProvisioningSnapshot = {
  jobState: JobState;
  environmentStatus?: EnvironmentStatus;
  complete: boolean;
};

export function estimateMonthlyCost(template: Template, targets: Target[]) {
  const targetPremium = targets.includes("AI Endpoint") ? 960 : 0;
  return template.monthlyCost + targetPremium + targets.length * 85;
}

export function loadEnvironments(storage: EnvironmentStorage = localStorage) {
  try {
    const stored = storage.getItem(ENVIRONMENT_STORAGE_KEY);
    if (!stored) {
      return initialEnvironments;
    }

    const parsed = JSON.parse(stored) as Environment[];
    return Array.isArray(parsed) ? parsed : initialEnvironments;
  } catch {
    return initialEnvironments;
  }
}

export function saveEnvironments(environments: Environment[], storage: EnvironmentStorage = localStorage) {
  storage.setItem(ENVIRONMENT_STORAGE_KEY, JSON.stringify(environments));
}

export function defaultTemplateGovernance(templates: Template[]): TemplateGovernance {
  return Object.fromEntries(
    templates.map((template) => [template.id, { owner: template.owner, tier: template.tier }])
  );
}

export function loadTemplateGovernance(
  templates: Template[],
  storage: EnvironmentStorage = localStorage
): TemplateGovernance {
  const fallback = defaultTemplateGovernance(templates);

  try {
    const stored = storage.getItem(GOVERNANCE_STORAGE_KEY);
    if (!stored) {
      return fallback;
    }

    const parsed = JSON.parse(stored) as TemplateGovernance;
    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
}

export function saveTemplateGovernance(governance: TemplateGovernance, storage: EnvironmentStorage = localStorage) {
  storage.setItem(GOVERNANCE_STORAGE_KEY, JSON.stringify(governance));
}

export function upsertRequestedEnvironment(
  current: Environment[],
  request: Omit<Environment, "status" | "createdAt">,
  createdAt = new Date().toISOString().slice(0, 10)
) {
  return [
    {
      ...request,
      status: "Provisioning" as const,
      createdAt,
    },
    ...current.filter((environment) => environment.name !== request.name),
  ];
}

export function updateEnvironmentStatus(
  environments: Environment[],
  name: string,
  status: EnvironmentStatus
) {
  return environments.map((environment) => (environment.name === name ? { ...environment, status } : environment));
}

export function getProvisioningSnapshot(
  jobStep: number,
  targets: Target[],
  eventCount = provisioningEvents.length
): ProvisioningSnapshot {
  if (targets.includes("AI Endpoint") && jobStep >= 2) {
    return {
      jobState: "Approval",
      environmentStatus: "Needs approval",
      complete: true,
    };
  }

  if (jobStep >= eventCount - 1) {
    return {
      jobState: "Complete",
      environmentStatus: "Ready",
      complete: true,
    };
  }

  return {
    jobState: "Running",
    complete: false,
  };
}
