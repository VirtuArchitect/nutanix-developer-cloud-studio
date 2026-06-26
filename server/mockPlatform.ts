import { allTargets, type Environment, type Target, type Template } from "../src/data/cloudStudioDomain";
import { createMockNutanixAdapters, type ProvisioningJob } from "../src/services/nutanixAdapters";
import { estimateMonthlyCost, upsertRequestedEnvironment } from "../src/services/provisioningService";
import type { ApiState, AuditEvent, CreateEnvironmentRequest } from "./types";

export type CreateEnvironmentResult = {
  environment: Environment;
  jobs: ProvisioningJob[];
  auditEvent: AuditEvent;
};

export function createEnvironmentRequest(state: ApiState, request: CreateEnvironmentRequest): CreateEnvironmentResult {
  const template = state.templates.find((item) => item.id === request.templateId);
  if (!template) {
    throw new RequestValidationError("template_not_found", `Template not found: ${request.templateId}`);
  }

  const targets = normalizeTargets(request.targets, template);
  const cost = estimateMonthlyCost(template, targets);
  const environment = {
    name: request.name.trim(),
    template: template.name,
    owner: request.owner.trim(),
    region: request.region.trim(),
    status: targets.includes("AI Endpoint") || template.tier === "Regulated" ? "Needs approval" : "Provisioning",
    cost,
    createdAt: new Date().toISOString().slice(0, 10),
  } satisfies Environment;

  if (!environment.name) {
    throw new RequestValidationError("environment_name_required", "Environment name is required.");
  }

  if (!environment.owner) {
    throw new RequestValidationError("owner_required", "Owner is required.");
  }

  if (!environment.region) {
    throw new RequestValidationError("region_required", "Region is required.");
  }

  const adapters = createMockNutanixAdapters(state.integrations);
  const jobs = adapters.map((adapter) =>
    adapter.createProvisioningJob({
      environmentName: environment.name,
      template,
      targets,
      owner: environment.owner,
      region: environment.region,
      estimatedCost: cost,
    })
  );

  const auditEvent: AuditEvent = {
    id: `audit-${Date.now()}`,
    action: "environment.requested",
    actor: environment.owner,
    target: environment.name,
    createdAt: new Date().toISOString(),
    metadata: {
      templateId: template.id,
      targets,
      estimatedCost: cost,
    },
  };

  state.environments = upsertRequestedEnvironment(state.environments, environment, environment.createdAt).map((item) =>
    item.name === environment.name ? environment : item
  );
  state.jobs = [...jobs, ...state.jobs.filter((job) => job.environmentName !== environment.name)];
  state.auditEvents = [auditEvent, ...state.auditEvents];

  return {
    environment,
    jobs,
    auditEvent,
  };
}

export class RequestValidationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

function normalizeTargets(targets: string[] | undefined, template: Template): Target[] {
  if (!targets || targets.length === 0) {
    return template.targets;
  }

  const invalidTarget = targets.find((target) => !allTargets.includes(target as Target));
  if (invalidTarget) {
    throw new RequestValidationError("invalid_target", `Unsupported target: ${invalidTarget}`);
  }

  return [...new Set(targets as Target[])];
}
