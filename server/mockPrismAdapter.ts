import type { Environment, MockPrismExecution, Target, Template } from "../src/data/cloudStudioDomain";
import {
  createMockPrismSimulatorStatus,
  createMockPrismTask,
  getMockPrismEntity,
} from "./mockPrismCentral";
import type { ApiState } from "./types";

export function recordMockPrismVmExecution(
  state: ApiState,
  environment: Environment,
  template: Template,
  targets: Target[]
): MockPrismExecution | undefined {
  if (!targets.includes("VM")) {
    return undefined;
  }

  const status = createMockPrismSimulatorStatus();
  const project = getMockPrismEntity("projects");
  const cluster = getMockPrismEntity("clusters");
  const image = selectMockImage(template);
  const subnet = getMockPrismEntity("subnets");
  const categories = ["Lifecycle:30-day-expiry", "CostCenter:Sandbox"];
  const task = createMockPrismTask(`Mock Prism Central accepted VM create for ${environment.name}. No real VM was created.`);
  const execution = {
    id: `mock-prism-${environment.name}-${Date.now()}`,
    environmentName: environment.name,
    provider: "NCI",
    adapterMode: "Mock Prism Central",
    endpoint: status.endpoint,
    request: {
      project: project.metadata.name ?? project.metadata.uuid,
      cluster: cluster.metadata.name ?? cluster.metadata.uuid,
      image: image.metadata.name ?? image.metadata.uuid,
      subnet: subnet.metadata.name ?? subnet.metadata.uuid,
      categories,
      targets,
    },
    task: {
      uuid: task.metadata.uuid,
      state: task.status.state,
      percentageComplete: task.status.percentage_complete,
      message: task.status.message,
    },
    evidence: [
      "Mock Prism Central VM create contract exercised through the NCI simulator.",
      `Selected ${image.metadata.name ?? image.metadata.uuid} on ${cluster.metadata.name ?? cluster.metadata.uuid}.`,
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

function selectMockImage(template: Template) {
  if (template.runtime.toLowerCase().includes("ubuntu")) {
    return getMockPrismEntity("images", 1);
  }

  return getMockPrismEntity("images");
}
