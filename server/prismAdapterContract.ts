import type {
  Environment,
  MockPrismExecution,
  PrismAdapterBlockedReason,
  PrismAdapterDiagnostics,
  PrismAdapterMode,
  Target,
  Template,
} from "../src/data/cloudStudioDomain";
import {
  createMockPrismSimulatorStatus,
  createMockPrismTask,
  getMockPrismEntity,
} from "./mockPrismCentral";
import type { ApiState } from "./types";

export type PrismVmCreatePlan = {
  project: string;
  cluster: string;
  image: string;
  subnet: string;
  categories: string[];
  targets: Target[];
};

export type PrismAdapter = {
  readonly mode: PrismAdapterMode;
  readonly name: PrismAdapterDiagnostics["activeAdapter"];
  readonly supportedOperations: PrismAdapterDiagnostics["supportedOperations"];
  health(state: ApiState): PrismAdapterDiagnostics;
  listInventory(state: ApiState): ReturnType<typeof createMockPrismSimulatorStatus>["availableInventory"];
  createVmPlan(state: ApiState, environment: Environment, template: Template, targets: Target[]): PrismVmCreatePlan;
  submitVmCreate(
    state: ApiState,
    environment: Environment,
    template: Template,
    targets: Target[]
  ): MockPrismExecution | undefined;
  pollTask(state: ApiState, taskUuid: string): MockPrismExecution["task"];
};

export class MockPrismAdapter implements PrismAdapter {
  readonly mode = "mock-prism" as const;
  readonly name = "MockPrismAdapter" as const;
  readonly supportedOperations = ["health", "listInventory", "createVmPlan", "submitVmCreate", "pollTask"] as const;

  health(state: ApiState): PrismAdapterDiagnostics {
    const status = createMockPrismSimulatorStatus();
    const latest = state.mockPrismExecutions[0];
    return {
      activeMode: this.mode,
      activeAdapter: this.name,
      mockEndpoint: status.endpoint,
      realEndpointConfigured: Boolean(process.env.NUTANIX_PRISM_CENTRAL_URL),
      provisioningEnabled: false,
      supportedOperations: [...this.supportedOperations],
      blockedReasons: createRealPrismBlockedReasons(state),
      lastMockTask: latest
        ? {
            environmentName: latest.environmentName,
            taskUuid: latest.task.uuid,
            state: latest.task.state,
            createdAt: latest.createdAt,
          }
        : undefined,
    };
  }

  listInventory() {
    return createMockPrismSimulatorStatus().availableInventory;
  }

  createVmPlan(_state: ApiState, _environment: Environment, template: Template, targets: Target[]): PrismVmCreatePlan {
    const project = getMockPrismEntity("projects");
    const cluster = getMockPrismEntity("clusters");
    const image = selectMockImage(template);
    const subnet = getMockPrismEntity("subnets");
    return {
      project: project.metadata.name ?? project.metadata.uuid,
      cluster: cluster.metadata.name ?? cluster.metadata.uuid,
      image: image.metadata.name ?? image.metadata.uuid,
      subnet: subnet.metadata.name ?? subnet.metadata.uuid,
      categories: ["Lifecycle:30-day-expiry", "CostCenter:Sandbox"],
      targets,
    };
  }

  submitVmCreate(
    state: ApiState,
    environment: Environment,
    template: Template,
    targets: Target[]
  ): MockPrismExecution | undefined {
    if (!targets.includes("VM")) {
      return undefined;
    }

    const status = createMockPrismSimulatorStatus();
    const plan = this.createVmPlan(state, environment, template, targets);
    const task = createMockPrismTask(`Mock Prism Central accepted VM create for ${environment.name}. No real VM was created.`);
    const execution = {
      id: `mock-prism-${environment.name}-${Date.now()}`,
      environmentName: environment.name,
      provider: "NCI",
      adapterMode: "Mock Prism Central",
      endpoint: status.endpoint,
      request: plan,
      task: {
        uuid: task.metadata.uuid,
        state: task.status.state,
        percentageComplete: task.status.percentage_complete,
        message: task.status.message,
      },
      evidence: [
        "Mock Prism Central VM create contract exercised through MockPrismAdapter.",
        `Selected ${plan.image} on ${plan.cluster}.`,
        "Provisioning remains disabled; this record is simulator evidence only.",
      ],
      provisioningEnabled: false,
      createdAt: new Date().toISOString(),
    } satisfies MockPrismExecution;

    state.mockPrismStatus = status;
    state.mockPrismExecutions = [
      execution,
      ...state.mockPrismExecutions.filter((item) => item.environmentName !== environment.name),
    ];

    return execution;
  }

  pollTask(state: ApiState, taskUuid: string) {
    return (
      state.mockPrismExecutions.find((execution) => execution.task.uuid === taskUuid)?.task ?? {
        uuid: taskUuid,
        state: "SUCCEEDED",
        percentageComplete: 100,
        message: `Mock Prism task ${taskUuid} completed. No real infrastructure was changed.`,
      }
    );
  }
}

export class DisabledRealPrismAdapter implements PrismAdapter {
  readonly mode = "real-prism-disabled" as const;
  readonly name = "DisabledRealPrismAdapter" as const;
  readonly supportedOperations = ["health", "listInventory", "createVmPlan", "submitVmCreate", "pollTask"] as const;

  health(state: ApiState): PrismAdapterDiagnostics {
    return {
      activeMode: this.mode,
      activeAdapter: this.name,
      mockEndpoint: createMockPrismSimulatorStatus().endpoint,
      realEndpointConfigured: Boolean(process.env.NUTANIX_PRISM_CENTRAL_URL),
      provisioningEnabled: false,
      supportedOperations: [...this.supportedOperations],
      blockedReasons: createRealPrismBlockedReasons(state),
      lastMockTask: undefined,
    };
  }

  listInventory() {
    return createMockPrismSimulatorStatus().availableInventory;
  }

  createVmPlan(): PrismVmCreatePlan {
    throw new PrismAdapterContractError(
      "real_prism_adapter_disabled",
      "Real Prism VM planning is disabled until lab scope, credentials, authorization, and kill-switch evidence are approved."
    );
  }

  submitVmCreate(): undefined {
    throw new PrismAdapterContractError(
      "real_prism_adapter_disabled",
      "Real Prism VM create is disabled by contract."
    );
  }

  pollTask(): MockPrismExecution["task"] {
    throw new PrismAdapterContractError(
      "real_prism_adapter_disabled",
      "Real Prism task polling is disabled by contract."
    );
  }
}

export class PrismAdapterContractError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createActivePrismAdapter(): PrismAdapter {
  return process.env.NDC_PRISM_REAL_ADAPTER === "enabled" ? new DisabledRealPrismAdapter() : new MockPrismAdapter();
}

export function createPrismAdapterDiagnostics(state: ApiState): PrismAdapterDiagnostics {
  return createActivePrismAdapter().health(state);
}

function createRealPrismBlockedReasons(state: ApiState): PrismAdapterBlockedReason[] {
  const latestLabScope = state.labAuthorizationScopes[0];
  const nciConfig = state.integrationConfigs.find((config) => config.name === "NCI");
  const latestProductionAuthorization = state.productionAdapterAuthorizationPackets[0];
  return [
    !latestLabScope
      ? {
          code: "lab_scope_required",
          message: "No approved lab scope evidence is recorded.",
          evidenceRequired: "Record authorized Prism Central project, cluster, network, allowed actions, and test window.",
        }
      : undefined,
    !nciConfig?.credentialProfile
      ? {
          code: "credential_reference_required",
          message: "No NCI credential reference is configured.",
          evidenceRequired: "Configure a credential profile reference only; do not store secret values in NDC Studio.",
        }
      : undefined,
    !latestProductionAuthorization
      ? {
          code: "authorization_packet_required",
          message: "No production adapter authorization packet is ready.",
          evidenceRequired: "Complete adapter promotion, CAB/change evidence, release window, and rollback approval records.",
        }
      : undefined,
    {
      code: "kill_switch_closed",
      message: "The real adapter kill switch remains closed.",
      evidenceRequired: "Keep closed until an explicit controlled lab or production adapter release is approved.",
    },
    {
      code: "real_adapter_disabled",
      message: "Real Prism adapter implementation is intentionally disabled.",
      evidenceRequired: "Implement real read-only calls first, then separately authorize any mutation path.",
    },
  ].filter(Boolean) as PrismAdapterBlockedReason[];
}

function selectMockImage(template: Template) {
  if (template.runtime.toLowerCase().includes("ubuntu")) {
    return getMockPrismEntity("images", 1);
  }

  return getMockPrismEntity("images");
}
