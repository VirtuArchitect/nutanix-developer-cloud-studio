import { allTargets, type ApprovalRequest, type Environment, type Target, type Template } from "../src/data/cloudStudioDomain";
import { createMockNutanixAdapters, type ProvisioningJob } from "../src/services/nutanixAdapters";
import { estimateMonthlyCost, upsertRequestedEnvironment } from "../src/services/provisioningService";
import { enqueueControlPlaneJob, releaseApprovalPausedJobs } from "./controlPlane";
import type { ApiState, AuditEvent, CreateEnvironmentRequest } from "./types";

export type CreateEnvironmentResult = {
  environment: Environment;
  jobs: ProvisioningJob[];
  approval?: ApprovalRequest;
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

  const approvalRequired = environment.status === "Needs approval";
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

  const approval = approvalRequired
    ? {
        id: `approval-${environment.name}`,
        environmentName: environment.name,
        template: template.name,
        owner: environment.owner,
        reason: targets.includes("AI Endpoint")
          ? "AI endpoint requests require platform approval."
          : "Regulated templates require platform approval.",
        status: "Pending",
        requestedAt: new Date().toISOString(),
      } satisfies ApprovalRequest
    : undefined;

  state.environments = upsertRequestedEnvironment(state.environments, environment, environment.createdAt).map((item) =>
    item.name === environment.name ? environment : item
  );
  state.jobs = [...jobs, ...state.jobs.filter((job) => job.environmentName !== environment.name)];
  enqueueControlPlaneJob(state, {
    environment,
    template,
    targets,
    approvalRequired,
  });
  if (approval) {
    state.approvals = [approval, ...state.approvals.filter((item) => item.environmentName !== environment.name)];
  }
  state.auditEvents = [auditEvent, ...state.auditEvents];

  return {
    environment,
    jobs,
    approval,
    auditEvent,
  };
}

export function decideApproval(
  state: ApiState,
  approvalId: string,
  decision: "Approved" | "Rejected",
  actor = "platform.admin"
): ApprovalRequest {
  const approval = state.approvals.find((item) => item.id === approvalId);
  if (!approval) {
    throw new RequestValidationError("approval_not_found", `Approval not found: ${approvalId}`);
  }

  const updatedApproval = {
    ...approval,
    status: decision,
    decidedAt: new Date().toISOString(),
    decidedBy: actor,
  } satisfies ApprovalRequest;

  state.approvals = state.approvals.map((item) => (item.id === approvalId ? updatedApproval : item));
  state.environments = state.environments.map((environment) => {
    if (environment.name !== approval.environmentName) {
      return environment;
    }

    return {
      ...environment,
      status: decision === "Approved" ? "Provisioning" : "Failed",
    };
  });
  state.auditEvents = [
    {
      id: `audit-${Date.now()}`,
      action: decision === "Approved" ? "approval.approved" : "approval.rejected",
      actor,
      target: approval.environmentName,
      createdAt: new Date().toISOString(),
      metadata: {
        approvalId,
      },
    },
    ...state.auditEvents,
  ];

  if (decision === "Approved") {
    releaseApprovalPausedJobs(state, approval.environmentName, actor);
  }

  return updatedApproval;
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
