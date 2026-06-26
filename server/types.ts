import type { Environment, Integration, Template, TemplateGovernance } from "../src/data/cloudStudioDomain";
import type { ProvisioningJob } from "../src/services/nutanixAdapters";

export type ApiState = {
  templates: Template[];
  environments: Environment[];
  integrations: Integration[];
  governance: TemplateGovernance;
  jobs: ProvisioningJob[];
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

export type ApiResponse<T> = {
  data: T;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
