import type {
  IntegrationConfig,
  PlatformConfig,
  PrismInventoryImportResult,
  PrismInventoryRecord,
  PrismReadOnlyScope,
} from "../src/data/cloudStudioDomain";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";

export type PrismInventoryAdapter = {
  readonly mode: PrismInventoryImportResult["mode"];
  readonly readOnly: true;
  readonly provisioningEnabled: false;
  discover(scope: PrismReadOnlyScope): Promise<PrismInventoryImportResult & { records: PrismInventoryRecord[] }>;
};

const blockedMutationOperations = readOnlyMutationOperationsBlocked;

export function createPrismReadOnlyScope(
  integrationConfig: IntegrationConfig,
  platformConfig: PlatformConfig
): PrismReadOnlyScope {
  return {
    endpoint: integrationConfig.endpoint,
    credentialProfile: integrationConfig.credentialProfile || platformConfig.credentialReference,
    project: platformConfig.defaultProject,
    cluster: platformConfig.defaultCluster,
    network: platformConfig.networkProfile,
    authorizedScopeRef: "PENTEST_SCOPE_TEMPLATE.md / lab authorization pending",
    realAdapterEnabled: false,
  };
}

export function createMockPrismInventoryAdapter(): PrismInventoryAdapter {
  return {
    mode: "Mock read-only",
    readOnly: true,
    provisioningEnabled: false,
    async discover(scope) {
      const importedAt = new Date().toISOString();
      const records = createMockPrismInventory(scope, importedAt);
      return {
        adapter: "NCI",
        mode: "Mock read-only",
        readOnly: true,
        provisioningEnabled: false,
        importedAt,
        recordsImported: records.length,
        profileCandidates: records.filter((record) => record.profileCandidate).length,
        scope,
        evidence: "Mock Prism Central read-only inventory import completed. No live endpoint was called.",
        mutationOperationsBlocked: blockedMutationOperations,
        records,
      };
    },
  };
}

export function createDisabledRealPrismInventoryAdapter(): PrismInventoryAdapter {
  return {
    mode: "Real adapter disabled",
    readOnly: true,
    provisioningEnabled: false,
    async discover(scope) {
      const importedAt = new Date().toISOString();
      return {
        adapter: "NCI",
        mode: "Real adapter disabled",
        readOnly: true,
        provisioningEnabled: false,
        importedAt,
        recordsImported: 0,
        profileCandidates: 0,
        scope,
        evidence: "Real Prism Central adapter is disabled until lab scope, credentials, and authorization are approved.",
        mutationOperationsBlocked: blockedMutationOperations,
        records: [],
      };
    },
  };
}

function createMockPrismInventory(scope: PrismReadOnlyScope, importedAt: string): PrismInventoryRecord[] {
  return [
    {
      id: "pc-cluster-berlin-01",
      kind: "Cluster",
      name: scope.cluster,
      source: "Mock Prism Central",
      cluster: scope.cluster,
      categories: ["Environment:Lab", "Platform:NCI"],
      importedAt,
      rawRef: "mock://prism/clusters/berlin-01",
    },
    {
      id: "pc-project-devcloud",
      kind: "Project",
      name: scope.project,
      source: "Mock Prism Central",
      cluster: scope.cluster,
      project: scope.project,
      categories: ["Owner:DeveloperCloud", "CostCenter:Sandbox"],
      importedAt,
      rawRef: "mock://prism/projects/developer-cloud-lab",
    },
    {
      id: "pc-image-rocky-9-hardened",
      kind: "Image",
      name: "Rocky Linux 9 Hardened",
      source: "Mock Prism Central",
      cluster: scope.cluster,
      project: scope.project,
      categories: ["OS:Linux", "Baseline:Hardened", "Patch:Current"],
      importedAt,
      rawRef: "mock://prism/images/rocky-9-hardened",
      profileCandidate: true,
    },
    {
      id: "pc-image-ubuntu-2404-lts",
      kind: "Image",
      name: "Ubuntu 24.04 LTS Developer",
      source: "Mock Prism Central",
      cluster: scope.cluster,
      project: scope.project,
      categories: ["OS:Linux", "Baseline:Developer", "Patch:Current"],
      importedAt,
      rawRef: "mock://prism/images/ubuntu-2404-lts",
      profileCandidate: true,
    },
    {
      id: "pc-network-dev-segment",
      kind: "Network",
      name: scope.network,
      source: "Mock Prism Central",
      cluster: scope.cluster,
      project: scope.project,
      network: scope.network,
      categories: ["Network:Developer", "Exposure:Internal"],
      importedAt,
      rawRef: "mock://prism/networks/dev-segment",
    },
    {
      id: "pc-category-expiry",
      kind: "Category",
      name: "Lifecycle:30-day-expiry",
      source: "Mock Prism Central",
      cluster: scope.cluster,
      categories: ["Lifecycle:Expiry", "Governance:NCM"],
      importedAt,
      rawRef: "mock://prism/categories/lifecycle-expiry",
    },
    {
      id: "pc-vm-payments-dev",
      kind: "VM",
      name: "payments-dev",
      source: "Mock Prism Central",
      cluster: scope.cluster,
      project: scope.project,
      network: scope.network,
      powerState: "On",
      categories: ["Owner:mira.chen", "Template:SpringAPI"],
      importedAt,
      rawRef: "mock://prism/vms/payments-dev",
    },
    {
      id: "pc-vm-billing-sandbox",
      kind: "VM",
      name: "billing-sandbox",
      source: "Mock Prism Central",
      cluster: scope.cluster,
      project: scope.project,
      network: scope.network,
      powerState: "Unknown",
      categories: ["Owner:jordan.lee", "Template:VMSandbox"],
      importedAt,
      rawRef: "mock://prism/vms/billing-sandbox",
    },
  ];
}
