import { afterEach, describe, expect, it } from "vitest";
import { templates, type Environment, type Template } from "../src/data/cloudStudioDomain";
import {
  createActivePrismAdapter,
  DisabledRealPrismAdapter,
  MockPrismAdapter,
  PrismAdapterContractError,
  type PrismAdapter,
} from "./prismAdapterContract";
import { activatePrismFailureScenario, selectPrismSimulatorProfile } from "./prismSimulatorControls";
import { createDefaultState } from "./storage";

const previousRealAdapter = process.env.NDC_PRISM_REAL_ADAPTER;

afterEach(() => {
  if (previousRealAdapter === undefined) {
    delete process.env.NDC_PRISM_REAL_ADAPTER;
  } else {
    process.env.NDC_PRISM_REAL_ADAPTER = previousRealAdapter;
  }
});

describe("Prism adapter contract harness", () => {
  it("keeps the active adapter in mock mode by default", () => {
    delete process.env.NDC_PRISM_REAL_ADAPTER;

    expect(createActivePrismAdapter()).toBeInstanceOf(MockPrismAdapter);
  });

  it("plans and submits a VM create through selected simulator profiles", () => {
    const state = createDefaultState();
    const adapter = new MockPrismAdapter();
    const environment = createEnvironment("contract-success-dev");
    const template = getTemplate("vm-app");

    selectPrismSimulatorProfile(state, "sim-image-ubuntu-2404");
    const execution = adapter.submitVmCreate(state, environment, template, ["VM"]);

    expectContractShape(adapter);
    expect(execution).toMatchObject({
      environmentName: "contract-success-dev",
      provider: "NCI",
      adapterMode: "Mock Prism Central",
      provisioningEnabled: false,
      request: expect.objectContaining({
        image: "ubuntu-24.04-lts-golden",
        cluster: "PHX-Berlin-A",
      }),
      task: expect.objectContaining({
        state: "SUCCEEDED",
        percentageComplete: 100,
      }),
    });
    expect(adapter.pollTask(state, execution!.task.uuid)).toMatchObject({ state: "SUCCEEDED" });
  });

  it("records failed simulator task evidence without enabling provisioning", () => {
    const state = createDefaultState();
    const adapter = new MockPrismAdapter();

    activatePrismFailureScenario(state, "quota-exceeded");
    const execution = adapter.submitVmCreate(state, createEnvironment("contract-failure-dev"), getTemplate("vm-app"), ["VM"]);

    expect(execution).toMatchObject({
      task: expect.objectContaining({
        state: "FAILED",
        percentageComplete: 35,
      }),
      evidence: expect.arrayContaining(["Simulator scenario: Quota exceeded."]),
      provisioningEnabled: false,
    });
    expect(adapter.health(state).readinessChecks).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Failure scenario", passed: false })])
    );
  });

  it("records timeout simulator task evidence without enabling provisioning", () => {
    const state = createDefaultState();
    const adapter = new MockPrismAdapter();

    activatePrismFailureScenario(state, "task-timeout");
    const execution = adapter.submitVmCreate(state, createEnvironment("contract-timeout-dev"), getTemplate("vm-app"), ["VM"]);

    expect(execution?.task).toMatchObject({
      state: "TIMEOUT",
      percentageComplete: 80,
    });
    expect(execution?.provisioningEnabled).toBe(false);
  });

  it("does not submit Prism evidence for non-VM targets", () => {
    const state = createDefaultState();
    const adapter = new MockPrismAdapter();

    expect(adapter.submitVmCreate(state, createEnvironment("contract-nonvm-dev"), getTemplate("spring-postgres"), ["Kubernetes"])).toBeUndefined();
    expect(state.mockPrismExecutions).toEqual([]);
  });

  it("keeps the real Prism adapter fail-closed when explicitly selected", () => {
    process.env.NDC_PRISM_REAL_ADAPTER = "enabled";
    const state = createDefaultState();
    const adapter = createActivePrismAdapter();

    expect(adapter).toBeInstanceOf(DisabledRealPrismAdapter);
    expect(adapter.health(state)).toMatchObject({
      activeMode: "real-prism-disabled",
      activeAdapter: "DisabledRealPrismAdapter",
      provisioningEnabled: false,
      realAdapterBoundary: expect.stringContaining("must not open real Prism connections"),
    });
    expect(() => adapter.createVmPlan(state, createEnvironment("contract-real-disabled-dev"), getTemplate("vm-app"), ["VM"])).toThrow(
      PrismAdapterContractError
    );
    expect(() => adapter.submitVmCreate(state, createEnvironment("contract-real-disabled-dev"), getTemplate("vm-app"), ["VM"])).toThrow(
      PrismAdapterContractError
    );
    expect(() => adapter.pollTask(state, "real-task-disabled")).toThrow(PrismAdapterContractError);
  });
});

function expectContractShape(adapter: PrismAdapter) {
  expect(adapter.supportedOperations).toEqual(["health", "listInventory", "createVmPlan", "submitVmCreate", "pollTask"]);
  expect(adapter.listInventory(createDefaultState())).toMatchObject({
    clusters: expect.any(Number),
    projects: expect.any(Number),
    images: expect.any(Number),
    subnets: expect.any(Number),
  });
}

function createEnvironment(name: string): Environment {
  return {
    name,
    template: "Linux VM App Sandbox",
    owner: "platform.admin",
    region: "Berlin Lab",
    status: "Provisioning",
    cost: 920,
    createdAt: new Date().toISOString(),
  };
}

function getTemplate(id: string): Template {
  const template = templates.find((item) => item.id === id);
  if (!template) {
    throw new Error(`Template not found: ${id}`);
  }
  return template;
}
