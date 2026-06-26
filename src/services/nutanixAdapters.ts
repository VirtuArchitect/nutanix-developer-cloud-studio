import type { Environment, Integration, Target, Template } from "../data/cloudStudioData";

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

export type IntegrationReadinessReport = {
  integration: string;
  ready: boolean;
  summary: string;
  missing: string[];
};

export type NutanixAdapter = {
  readonly name: string;
  readonly product: string;
  checkReadiness(): IntegrationReadinessReport;
  createProvisioningJob(request: ProvisioningRequest): ProvisioningJob;
  describeResources(environment: Environment): string[];
};

export function createMockNutanixAdapters(integrations: Integration[]): NutanixAdapter[] {
  return integrations.map((integration) => ({
    name: integration.name,
    product: integration.product,
    checkReadiness() {
      return {
        integration: integration.name,
        ready: integration.state === "Healthy",
        summary: integration.readiness,
        missing: integration.state === "Healthy" ? [] : [integration.nextStep],
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
    describeResources(environment) {
      return [
        `${integration.name} ownership metadata for ${environment.owner}`,
        `${integration.name} cost attribution for $${environment.cost.toLocaleString()}/mo`,
        `${integration.name} regional placement in ${environment.region}`,
      ];
    },
  }));
}
