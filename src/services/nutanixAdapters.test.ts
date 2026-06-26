import { describe, expect, it } from "vitest";
import { initialEnvironments, integrations, templates } from "../data/cloudStudioData";
import { createMockNutanixAdapters } from "./nutanixAdapters";

describe("createMockNutanixAdapters", () => {
  it("creates one adapter per configured integration", () => {
    const adapters = createMockNutanixAdapters(integrations);

    expect(adapters.map((adapter) => adapter.name)).toEqual(integrations.map((integration) => integration.name));
  });

  it("reports warning and preview integrations as not ready", () => {
    const adapters = createMockNutanixAdapters(integrations);
    const ncm = adapters.find((adapter) => adapter.name === "NCM");
    const nai = adapters.find((adapter) => adapter.name === "NAI");

    expect(ncm?.checkReadiness()).toMatchObject({
      integration: "NCM",
      ready: false,
    });
    expect(nai?.checkReadiness()).toMatchObject({
      integration: "NAI",
      ready: false,
    });
  });

  it("requires approval for AI endpoint provisioning requests", () => {
    const [adapter] = createMockNutanixAdapters(integrations);
    const job = adapter.createProvisioningJob({
      environmentName: "ai-smoke-dev",
      template: templates[2],
      targets: ["AI Endpoint", "Storage"],
      owner: "demo.user",
      region: "Berlin Lab",
      estimatedCost: 5330,
    });

    expect(job).toMatchObject({
      environmentName: "ai-smoke-dev",
      state: "ApprovalRequired",
    });
  });

  it("describes mock resources for an environment", () => {
    const [adapter] = createMockNutanixAdapters(integrations);

    expect(adapter.describeResources(initialEnvironments[0])).toEqual(
      expect.arrayContaining([
        expect.stringContaining(initialEnvironments[0].owner),
        expect.stringContaining(initialEnvironments[0].region),
      ])
    );
  });
});
