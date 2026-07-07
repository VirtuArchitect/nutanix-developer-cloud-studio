import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  initialEnvironments,
  integrations,
  platformConfig,
  policyBundles,
  resourceProfiles,
  templateRegistry,
  templates,
  type ApprovalRequest,
  type IntegrationConfig,
  type LabAdapterSnapshot,
  type ProvisioningAdapterReadiness,
  type PlatformSession,
  type TemplateGovernance,
} from "../src/data/cloudStudioDomain";
import type { ApiState } from "./types";

const auditRetentionEvents = Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500);

export type ApiRepository = {
  load(): Promise<ApiState>;
  save(state: ApiState): Promise<void>;
};

export type ApiStore = ApiRepository;

function defaultGovernance(): TemplateGovernance {
  return Object.fromEntries(
    templates.map((template) => [template.id, { owner: template.owner, tier: template.tier }])
  );
}

function defaultApprovals(): ApprovalRequest[] {
  return initialEnvironments
    .filter((environment) => environment.status === "Needs approval")
    .map((environment) => ({
      id: `approval-${environment.name}`,
      environmentName: environment.name,
      template: environment.template,
      owner: environment.owner,
      reason: environment.template.includes("AI")
        ? "AI endpoint requests require platform approval."
        : "Regulated templates require platform approval.",
      status: "Pending",
      requestedAt: environment.createdAt,
    }));
}

function defaultSession(): PlatformSession {
  return {
    user: "platform.admin",
    displayName: "Platform Admin",
    roles: ["Developer", "Approver", "Platform Admin"],
    authMode: "Mock OIDC",
    identityProvider: "NDC Studio local identity stub",
  };
}

function defaultIntegrationConfigs(): IntegrationConfig[] {
  return integrations.map((integration) => ({
    name: integration.name,
    endpoint: "",
    credentialProfile: "",
    status: integration.state === "Healthy" ? "Configured" : "Not configured",
    message:
      integration.state === "Healthy"
        ? "Mock adapter is configured for prototype readiness."
        : integration.nextStep,
  }));
}

function defaultLabAdapters(): LabAdapterSnapshot[] {
  return integrations.map((integration) => ({
    name: integration.name,
    product: integration.product,
    mode: integration.name === "NCI" ? "Configured" : "Mock",
    readOnly: true,
    provisioningEnabled: false,
    inventoryCount: 0,
    scope:
      integration.name === "NCI"
        ? "Prism Central inventory discovery only. No VM, network, image, project, or policy changes."
        : "Mock adapter scope only until lab endpoint and authorization are documented.",
    message:
      integration.name === "NCI"
        ? "Ready for a read-only Prism Central inventory pilot after lab authorization."
        : "Waiting for lab scope before read-only discovery.",
    nextStep:
      integration.name === "NCI"
        ? "Document Prism Central URL, project scope, and read-only credential profile."
        : integration.nextStep,
  }));
}

function defaultProvisioningAdapters(): ProvisioningAdapterReadiness[] {
  return integrations.map((integration) => ({
    name: integration.name as ProvisioningAdapterReadiness["name"],
    product: integration.product,
    mode: "Mock",
    capabilities: ["validateRequest", "plan", "provision", "pollStatus", "destroy"],
    configured: integration.state === "Healthy",
    provisioningEnabled: false,
    nextGate:
      integration.name === "NCI"
        ? "Map Prism Central image, project, subnet, category, and credential references."
        : integration.nextStep,
  }));
}

export function createDefaultState(): ApiState {
  return {
    templates,
    environments: initialEnvironments,
    integrations,
    integrationConfigs: defaultIntegrationConfigs(),
    labAdapters: defaultLabAdapters(),
    labAuthorizationScopes: [],
    resourceProfiles,
    policyBundles,
    templateRegistry,
    prismInventory: [],
    platformConfig,
    provisioningAdapters: defaultProvisioningAdapters(),
    adapterEnablementRecords: [],
    session: defaultSession(),
    governance: defaultGovernance(),
    jobs: [],
    approvals: defaultApprovals(),
    controlPlaneJobs: [],
    vmSandboxDryRuns: [],
    controlledProvisioningGates: [],
    platformServiceRequests: [],
    vmLifecycleProofs: [],
    rollbackDestroyProofs: [],
    controlledCreateAuthorizationEnvelopes: [],
    ahvCreateAdapterContractReviews: [],
    ahvControlledProvisioningRuns: [],
    platformServicePreflightRuns: [],
    platformServiceAdapterContractReviews: [],
    providerReleaseGateRecords: [],
    releaseEvidenceExports: [],
    controlledLabReleaseRunbooks: [],
    controlledLabDryRunWindows: [],
    labWindowEvidenceExports: [],
    labEvidenceReviews: [],
    labExecutionProposalEnvelopes: [],
    labExecutionProposalExports: [],
    controlledLabExecutionApprovals: [],
    controlledLabExecutionRehearsalPackets: [],
    controlledLabDryRunExecutionChecklists: [],
    controlledLabExecutionEvidenceLedgers: [],
    controlledLabExecutionReadinessAttestations: [],
    executionBrokerQueueRecords: [],
    executionBrokerDispatchApprovals: [],
    realAdapterLabScopeActivations: [],
    manualRealAdapterSwitchReviews: [],
    realAdapterSwitchStateAuditPackages: [],
    controlledSwitchConfigurationRequests: [],
    switchExecutionHandoffPackages: [],
    switchExecutionOutcomeRecords: [],
    switchClosureRetentionPackages: [],
    adapterPromotionReadinessDossiers: [],
    productionAdapterAuthorizationPackets: [],
    productionChangeFreezeRecords: [],
    productionCabHandoffPackets: [],
    productionCabDecisionRecords: [],
    productionImplementationHoldRecords: [],
    productionOperatorAssignmentRecords: [],
    productionExecutionReadinessRecords: [],
    productionExecutionAuthorizationRecords: [],
    productionChangeTicketLockRecords: [],
    productionFinalExecutionPacketRecords: [],
    productionExecutionHoldPointRecords: [],
    productionExecutionOutcomeAuthorizationRecords: [],
    productionExecutionClosureAuthorizationRecords: [],
    productionExecutionClosurePacketRecords: [],
    productionExecutionArchivalHandoffRecords: [],
    productionExecutionRetentionAttestationRecords: [],
    productionExecutionFinalArchiveCertificationRecords: [],
    productionExecutionCompletionDossierRecords: [],
    productionExecutionOperationsHandoverRecords: [],
    productionExecutionSupportReadinessRecords: [],
    productionExecutionServiceAcceptanceRecords: [],
    productionExecutionFinalTurnoverRecords: [],
    productionExecutionOperationalClosureRecords: [],
    productionExecutionPostImplementationReviewRecords: [],
    productionExecutionImprovementClosureRecords: [],
    productionExecutionFinalAcceptanceArchiveRecords: [],
    productionReadinessReviews: [],
    lifecycleOperations: [],
    auditExports: [],
    auditEvents: [],
  };
}

export class MemoryStore implements ApiStore {
  private state: ApiState;

  constructor(initialState: ApiState = createDefaultState()) {
    this.state = structuredClone(initialState);
  }

  async load() {
    return structuredClone(this.state);
  }

  async save(state: ApiState) {
    this.state = structuredClone(applyRetention(state));
  }
}

export class JsonFileStore implements ApiStore {
  constructor(private readonly filePath: string) {}

  async load() {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return {
        ...createDefaultState(),
        ...(JSON.parse(raw) as Partial<ApiState>),
      };
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        const state = createDefaultState();
        await this.save(state);
        return state;
      }

      throw error;
    }
  }

  async save(state: ApiState) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(applyRetention(state), null, 2)}\n`, "utf8");
  }
}

export function applyRetention(state: ApiState): ApiState {
  return {
    ...state,
    auditEvents: state.auditEvents.slice(0, auditRetentionEvents),
  };
}
