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
import { getActivePrismFailureScenario, getSelectedPrismSimulatorProfile } from "./prismSimulatorControls";
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
      readinessChecks: createPrismReadinessChecks(state),
      operatorActions: createPrismOperatorActions(state),
      realAdapterBoundary:
        "MockPrismAdapter can plan and simulate VM create tasks only. DisabledRealPrismAdapter keeps real Prism calls and all mutation operations blocked.",
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

  createVmPlan(state: ApiState, _environment: Environment, template: Template, targets: Target[]): PrismVmCreatePlan {
    const project = getSelectedPrismSimulatorProfile(state, "Project")?.name ?? getMockPrismEntity("projects").metadata.name;
    const cluster = getSelectedPrismSimulatorProfile(state, "Cluster")?.name ?? getMockPrismEntity("clusters").metadata.name;
    const image =
      selectSimulatorImage(state, template)?.name ?? selectMockImage(template).metadata.name ?? selectMockImage(template).metadata.uuid;
    const subnet = getSelectedPrismSimulatorProfile(state, "Subnet")?.name ?? getMockPrismEntity("subnets").metadata.name;
    const categories = state.prismSimulatorProfiles
      .filter((profile) => profile.kind === "Category" && profile.selected && profile.status === "Active")
      .map((profile) => profile.name);
    return {
      project: project ?? "NDC-Sandbox",
      cluster: cluster ?? "PHX-Berlin-A",
      image,
      subnet: subnet ?? "dev-overlay-10.42.0.0",
      categories: categories.length ? categories : ["Lifecycle:30-day-expiry", "CostCenter:Sandbox"],
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
    const activeScenario = getActivePrismFailureScenario(state);
    const task = createMockPrismTask(
      activeScenario.id === "none"
        ? `Mock Prism Central accepted VM create for ${environment.name}. No real VM was created.`
        : `${activeScenario.label}: ${activeScenario.effect} No real VM was created.`
    );
    const execution = {
      id: `mock-prism-${environment.name}-${Date.now()}`,
      environmentName: environment.name,
      provider: "NCI",
      adapterMode: "Mock Prism Central",
      endpoint: status.endpoint,
      request: plan,
      task: {
        uuid: task.metadata.uuid,
        state: activeScenario.taskState,
        percentageComplete: activeScenario.percentageComplete,
        message:
          activeScenario.id === "none"
            ? task.status.message
            : `${activeScenario.label}: ${activeScenario.effect} Provisioning remains simulated and disabled.`,
      },
      evidence: [
        "Mock Prism Central VM create contract exercised through MockPrismAdapter.",
        `Selected ${plan.image} on ${plan.cluster}.`,
        `Simulator scenario: ${activeScenario.label}.`,
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
      readinessChecks: createPrismReadinessChecks(state),
      operatorActions: createPrismOperatorActions(state),
      realAdapterBoundary:
        "DisabledRealPrismAdapter exposes the contract shape only. It must not open real Prism connections or execute mutation paths.",
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

export function createRealPrismBlockedReasons(state: ApiState): PrismAdapterBlockedReason[] {
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

function selectSimulatorImage(state: ApiState, template: Template) {
  const images = state.prismSimulatorProfiles.filter((profile) => profile.kind === "Image" && profile.status === "Active");
  const preferredOs = template.runtime.toLowerCase().includes("ubuntu") ? "ubuntu" : "rhel";
  return images.find((profile) => profile.selected && profile.name.toLowerCase().includes(preferredOs)) ?? images.find((profile) => profile.selected);
}

function createPrismReadinessChecks(state: ApiState) {
  const nciConfig = state.integrationConfigs.find((config) => config.name === "NCI");
  const activeScenario = getActivePrismFailureScenario(state);
  return [
    {
      name: "Simulator profiles",
      passed: ["Project", "Cluster", "Image", "Subnet"].every((kind) =>
        Boolean(getSelectedPrismSimulatorProfile(state, kind as Parameters<typeof getSelectedPrismSimulatorProfile>[1]))
      ),
      detail: "Project, cluster, image, and subnet selections are required for deterministic simulator planning.",
    },
    {
      name: "Failure scenario",
      passed: activeScenario.id === "none",
      detail:
        activeScenario.id === "none"
          ? "Normal simulator success path is active."
          : `${activeScenario.label} is active for negative-path testing.`,
    },
    {
      name: "Real endpoint reference",
      passed: Boolean(process.env.NUTANIX_PRISM_CENTRAL_URL),
      detail: "Endpoint references are checked for readiness only; no real Prism connection is opened.",
    },
    {
      name: "NCI credential reference",
      passed: Boolean(nciConfig?.credentialProfile),
      detail: "Credential profile must be an external reference. Secret values must not be stored in this repository or API state.",
    },
  ];
}

function createPrismOperatorActions(state: ApiState) {
  const blockedReasons = createRealPrismBlockedReasons(state);
  const activeScenario = getActivePrismFailureScenario(state);
  return [
    {
      label: "Validate mock success path",
      status: activeScenario.id === "none" ? "Ready" : "Required",
      detail: activeScenario.id === "none" ? "Create a VM environment to record a successful simulator task." : "Reset failure scenario to normal success path before release evidence.",
    },
    {
      label: "Exercise negative-path scenarios",
      status: state.mockPrismExecutions.some((execution) => execution.task.state !== "SUCCEEDED") ? "Ready" : "Required",
      detail: "Activate a simulator failure scenario and create a VM request to capture failed-task evidence.",
    },
    {
      label: "Run real Prism preflight",
      status: blockedReasons.length ? "Blocked" : "Ready",
      detail: "Preflight records readiness evidence only; real Prism calls and mutations remain disabled.",
    },
  ] satisfies PrismAdapterDiagnostics["operatorActions"];
}
