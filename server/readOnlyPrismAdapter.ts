import type {
  IntegrationConfig,
  PlatformConfig,
  PrismReadOnlyAdapterDiagnostics,
  PrismReadOnlyOperation,
  PrismReadOnlyRequestPlan,
  PrismReadOnlyScope,
} from "../src/data/cloudStudioDomain";
import { createPrismReadOnlyScope } from "./prismInventoryAdapter";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";

const supportedOperations: PrismReadOnlyOperation[] = [
  "listClusters",
  "listProjects",
  "listImages",
  "listSubnets",
  "listCategories",
  "listVms",
];

const operationPath: Record<PrismReadOnlyOperation, string> = {
  listClusters: "/api/nutanix/v3/clusters/list",
  listProjects: "/api/nutanix/v3/projects/list",
  listImages: "/api/nutanix/v3/images/list",
  listSubnets: "/api/nutanix/v3/subnets/list",
  listCategories: "/api/nutanix/v3/categories/list",
  listVms: "/api/nutanix/v3/vms/list",
};

export class DisabledReadOnlyPrismAdapter {
  readonly adapter = "DisabledReadOnlyPrismAdapter" as const;
  readonly mode = "Fixture-only request scaffold" as const;
  readonly networkCallEnabled = false as const;
  readonly provisioningEnabled = false as const;
  readonly supportedOperations = supportedOperations;

  createRequestPlan(scope: PrismReadOnlyScope, operation: PrismReadOnlyOperation): PrismReadOnlyRequestPlan {
    return {
      operation,
      method: "POST",
      path: operationPath[operation],
      body: {
        kind: operation,
        length: 100,
        offset: 0,
        filter: operation === "listVms" ? `project_name==${scope.project}` : undefined,
      },
      scope,
      networkCallEnabled: false,
      mutationOperationsBlocked: readOnlyMutationOperationsBlocked,
    };
  }

  diagnostics(integrationConfig: IntegrationConfig | undefined, platformConfig: PlatformConfig): PrismReadOnlyAdapterDiagnostics {
    const fallbackConfig: IntegrationConfig = {
      name: "NCI",
      endpoint: integrationConfig?.endpoint ?? "",
      credentialProfile: integrationConfig?.credentialProfile ?? platformConfig.credentialReference,
      status: integrationConfig?.status ?? "Not configured",
      message: integrationConfig?.message ?? "NCI integration configuration is not available.",
    };
    const scope = createPrismReadOnlyScope(fallbackConfig, platformConfig);
    const endpointConfigured = Boolean(scope.endpoint);
    const credentialReferenceConfigured = Boolean(scope.credentialProfile);
    return {
      adapter: this.adapter,
      mode: this.mode,
      endpointConfigured,
      credentialReferenceConfigured,
      supportedOperations,
      networkCallEnabled: false,
      provisioningEnabled: false,
      mutationOperationsBlocked: readOnlyMutationOperationsBlocked,
      requestPlans: supportedOperations.map((operation) => this.createRequestPlan(scope, operation)),
      checks: [
        {
          name: "Endpoint reference",
          passed: endpointConfigured,
          detail: endpointConfigured ? "Prism endpoint reference is present." : "Prism endpoint reference is required.",
        },
        {
          name: "Credential reference",
          passed: credentialReferenceConfigured,
          detail: credentialReferenceConfigured
            ? "Credential profile reference is present; no secret value is stored."
            : "Credential profile reference is required.",
        },
        {
          name: "Network execution",
          passed: true,
          detail: "Network calls are disabled in this scaffold. Request plans are fixture-only.",
        },
        {
          name: "Mutation boundary",
          passed: true,
          detail: `${readOnlyMutationOperationsBlocked.length} mutation operations are explicitly blocked.`,
        },
      ],
    };
  }
}

export function createDisabledReadOnlyPrismAdapter() {
  return new DisabledReadOnlyPrismAdapter();
}
