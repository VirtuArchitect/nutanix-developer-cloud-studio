import { describe, expect, it } from "vitest";
import { createDefaultState } from "./storage";
import { createDisabledReadOnlyPrismAdapter } from "./readOnlyPrismAdapter";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";
import { createPrismReadOnlyScope, createMockPrismInventoryAdapter } from "./prismInventoryAdapter";

describe("disabled read-only Prism adapter scaffold", () => {
  it("constructs fixture-only request plans for all supported read-only operations", () => {
    const state = createDefaultState();
    const config = state.integrationConfigs.find((item) => item.name === "NCI");
    if (!config) {
      throw new Error("NCI config not found");
    }
    const adapter = createDisabledReadOnlyPrismAdapter();
    const diagnostics = adapter.diagnostics({ ...config, endpoint: "https://prism.ref", credentialProfile: "nci-readonly" }, state.platformConfig);

    expect(diagnostics).toMatchObject({
      adapter: "DisabledReadOnlyPrismAdapter",
      mode: "Fixture-only request scaffold",
      networkCallEnabled: false,
      provisioningEnabled: false,
      endpointConfigured: true,
      credentialReferenceConfigured: true,
    });
    expect(diagnostics.supportedOperations).toEqual([
      "listClusters",
      "listProjects",
      "listImages",
      "listSubnets",
      "listCategories",
      "listVms",
    ]);
    expect(diagnostics.requestPlans).toHaveLength(6);
    expect(diagnostics.requestPlans).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "listVms",
          method: "POST",
          path: "/api/nutanix/v3/vms/list",
          networkCallEnabled: false,
          mutationOperationsBlocked: expect.arrayContaining(["create_vm", "delete_vm"]),
        }),
      ])
    );
  });

  it("keeps read-only inventory fixture import deterministic and mutation-blocked", async () => {
    const state = createDefaultState();
    const config = state.integrationConfigs.find((item) => item.name === "NCI");
    if (!config) {
      throw new Error("NCI config not found");
    }
    const scope = createPrismReadOnlyScope(
      { ...config, endpoint: "https://prism.ref", credentialProfile: "nci-readonly" },
      state.platformConfig
    );
    const result = await createMockPrismInventoryAdapter().discover(scope);

    expect(result).toMatchObject({
      mode: "Mock read-only",
      readOnly: true,
      provisioningEnabled: false,
      recordsImported: 8,
      profileCandidates: 2,
    });
    expect(result.records.map((record) => record.kind)).toEqual([
      "Cluster",
      "Project",
      "Image",
      "Image",
      "Network",
      "Category",
      "VM",
      "VM",
    ]);
    expect(result.mutationOperationsBlocked).toEqual(expect.arrayContaining(readOnlyMutationOperationsBlocked));
  });
});
