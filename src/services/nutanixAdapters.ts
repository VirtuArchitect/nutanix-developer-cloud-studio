import type {
  Environment,
  Integration,
  ProvisioningAdapterCapability,
  ProvisioningAdapterName,
  ResourceProfile,
  Target,
  Template,
} from "../data/cloudStudioDomain";

export type ProvisioningRequest = {
  environmentName: string;
  template: Template;
  targets: Target[];
  owner: string;
  region: string;
  estimatedCost: number;
};

export type ProvisioningJob = {
  id: string;
  environmentName: string;
  state: "Queued" | "Running" | "ApprovalRequired" | "Complete" | "Failed";
  message: string;
  createdAt: string;
};

export type ProvisioningPlan = {
  adapter: ProvisioningAdapterName;
  environmentName: string;
  operation: "Provision" | "Destroy";
  resources: string[];
  approvalsRequired: string[];
  provisioningEnabled: false;
};

export type IntegrationReadinessReport = {
  integration: string;
  ready: boolean;
  summary: string;
  missing: string[];
};

export type NutanixAdapter = {
  readonly name: ProvisioningAdapterName;
  readonly product: string;
  readonly capabilities: ProvisioningAdapterCapability[];
  checkReadiness(): IntegrationReadinessReport;
  validateRequest(request: ProvisioningRequest): IntegrationReadinessReport;
  plan(request: ProvisioningRequest, profiles: ResourceProfile[]): ProvisioningPlan;
  createProvisioningJob(request: ProvisioningRequest): ProvisioningJob;
  pollStatus(job: ProvisioningJob): ProvisioningJob;
  destroy(environment: Environment): ProvisioningPlan;
  describeResources(environment: Environment): string[];
};

export function createMockNutanixAdapters(integrations: Integration[]): NutanixAdapter[] {
  return integrations.map((integration) => ({
    name: integration.name as ProvisioningAdapterName,
    product: integration.product,
    capabilities: ["validateRequest", "plan", "provision", "pollStatus", "destroy"],
    checkReadiness() {
      return {
        integration: integration.name,
        ready: integration.state === "Healthy",
        summary: integration.readiness,
        missing: integration.state === "Healthy" ? [] : [integration.nextStep],
      };
    },
    validateRequest(request) {
      const missing = [
        request.environmentName ? "" : "environmentName",
        request.owner ? "" : "owner",
        request.region ? "" : "region",
      ].filter(Boolean);

      return {
        integration: integration.name,
        ready: missing.length === 0,
        summary:
          missing.length === 0
            ? `${integration.name} request shape is valid for mock planning.`
            : `${integration.name} request is missing required fields.`,
        missing,
      };
    },
    plan(request, profiles) {
      const matchingProfiles = profiles.filter((profile) => profile.provider === integration.name);
      return {
        adapter: integration.name as ProvisioningAdapterName,
        environmentName: request.environmentName,
        operation: "Provision",
        resources: matchingProfiles.map((profile) => `${profile.kind}: ${profile.name} (${profile.status})`),
        approvalsRequired:
          request.targets.includes("AI Endpoint") || request.template.tier === "Regulated"
            ? ["Platform approval required before provisioning."]
            : [],
        provisioningEnabled: false,
      };
    },
    createProvisioningJob(request) {
      const approvalRequired = request.targets.includes("AI Endpoint") || request.template.tier === "Regulated";

      return {
        id: `${integration.name.toLowerCase()}-${request.environmentName}`,
        environmentName: request.environmentName,
        state: approvalRequired ? "ApprovalRequired" : "Queued",
        message: approvalRequired
          ? `${integration.name} mock adapter requires approval before provisioning.`
          : `${integration.name} mock adapter accepted the provisioning request.`,
        createdAt: new Date().toISOString(),
      };
    },
    pollStatus(job) {
      return {
        ...job,
        message: `${integration.name} mock adapter status polled. Real provisioning remains disabled.`,
      };
    },
    destroy(environment) {
      return {
        adapter: integration.name as ProvisioningAdapterName,
        environmentName: environment.name,
        operation: "Destroy",
        resources: [`${integration.name} teardown plan for ${environment.name}`],
        approvalsRequired: environment.status === "Ready" ? [] : ["Confirm non-ready environment teardown."],
        provisioningEnabled: false,
      };
    },
    describeResources(environment) {
      return [
        `${integration.name} ownership metadata for ${environment.owner}`,
        `${integration.name} cost attribution for $${environment.cost.toLocaleString()}/mo`,
        `${integration.name} regional placement in ${environment.region}`,
      ];
    },
  }));
}
