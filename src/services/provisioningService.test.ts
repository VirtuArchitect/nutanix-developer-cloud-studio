import { describe, expect, it } from "vitest";
import { initialEnvironments, templates, type Environment } from "../data/cloudStudioData";
import {
  ENVIRONMENT_STORAGE_KEY,
  GOVERNANCE_STORAGE_KEY,
  defaultTemplateGovernance,
  estimateMonthlyCost,
  getProvisioningSnapshot,
  loadEnvironments,
  loadTemplateGovernance,
  saveEnvironments,
  saveTemplateGovernance,
  updateEnvironmentStatus,
  upsertRequestedEnvironment,
} from "./provisioningService";

function memoryStorage(initialValues?: Record<string, string>) {
  const values = new Map<string, string>();
  if (initialValues) {
    Object.entries(initialValues).forEach(([key, value]) => values.set(key, value));
  }

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("provisioningService", () => {
  it("estimates monthly cost with target count and AI premium", () => {
    expect(estimateMonthlyCost(templates[0], ["Kubernetes", "Database"])).toBe(2010);
    expect(estimateMonthlyCost(templates[2], ["AI Endpoint", "Storage"])).toBe(5330);
  });

  it("loads saved environments and falls back to initial data for invalid storage", () => {
    const saved: Environment[] = [
      {
        name: "saved-dev",
        template: "Linux VM App Sandbox",
        owner: "john",
        region: "Berlin Lab",
        status: "Ready",
        cost: 920,
        createdAt: "2026-06-26",
      },
    ];

    expect(loadEnvironments(memoryStorage({ [ENVIRONMENT_STORAGE_KEY]: JSON.stringify(saved) }))).toEqual(saved);
    expect(loadEnvironments(memoryStorage({ [ENVIRONMENT_STORAGE_KEY]: "{bad json" }))).toEqual(initialEnvironments);
  });

  it("saves environments to the expected local storage key", () => {
    const storage = memoryStorage();
    saveEnvironments(initialEnvironments, storage);

    expect(storage.getItem(ENVIRONMENT_STORAGE_KEY)).toBe(JSON.stringify(initialEnvironments));
  });

  it("loads and saves template governance overrides", () => {
    const governance = {
      ...defaultTemplateGovernance(templates),
      [templates[0].id]: { owner: "Platform Guild", tier: "Regulated" as const },
    };
    const storage = memoryStorage({ [GOVERNANCE_STORAGE_KEY]: JSON.stringify(governance) });

    expect(loadTemplateGovernance(templates, storage)[templates[0].id]).toEqual({
      owner: "Platform Guild",
      tier: "Regulated",
    });

    saveTemplateGovernance(governance, storage);
    expect(storage.getItem(GOVERNANCE_STORAGE_KEY)).toBe(JSON.stringify(governance));
  });

  it("upserts requested environments at the top of the list", () => {
    const environments = upsertRequestedEnvironment(
      initialEnvironments,
      {
        name: "payments-dev",
        template: "Spring API with NDB Postgres",
        owner: "john",
        region: "Paris DR",
        cost: 1995,
      },
      "2026-06-26"
    );

    expect(environments).toHaveLength(initialEnvironments.length);
    expect(environments[0]).toMatchObject({
      name: "payments-dev",
      status: "Provisioning",
      region: "Paris DR",
      createdAt: "2026-06-26",
    });
  });

  it("updates only the matching environment status", () => {
    const environments = updateEnvironmentStatus(initialEnvironments, "billing-sandbox", "Ready");

    expect(environments.find((environment) => environment.name === "billing-sandbox")?.status).toBe("Ready");
    expect(environments.find((environment) => environment.name === "ml-reco-lab")?.status).toBe("Needs approval");
  });

  it("moves AI endpoint requests into approval before completion", () => {
    expect(getProvisioningSnapshot(2, ["AI Endpoint"])).toEqual({
      jobState: "Approval",
      environmentStatus: "Needs approval",
      complete: true,
    });
  });

  it("marks non-AI requests ready at the end of the event timeline", () => {
    expect(getProvisioningSnapshot(4, ["Kubernetes"])).toEqual({
      jobState: "Complete",
      environmentStatus: "Ready",
      complete: true,
    });
  });

  it("keeps intermediate provisioning steps running", () => {
    expect(getProvisioningSnapshot(1, ["Kubernetes"])).toEqual({
      jobState: "Running",
      complete: false,
    });
  });
});
