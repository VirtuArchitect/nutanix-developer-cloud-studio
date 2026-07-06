import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkApiHealth,
  createAhvControlledProvisioningRunViaApi,
  createControlledProvisioningGateViaApi,
  createEnvironmentViaApi,
  createLabAuthorizationScopeViaApi,
  createPlatformServiceRequestViaApi,
  createPlatformServicePreflightRunViaApi,
  createVmLifecycleProofViaApi,
  createVmSandboxDryRunViaApi,
  decideControlledProvisioningGateViaApi,
  fetchAhvControlledProvisioningRunsFromApi,
  fetchControlledProvisioningGatesFromApi,
  fetchControlPlaneJobsFromApi,
  fetchEnvironmentsFromApi,
  fetchLabAdaptersFromApi,
  fetchLabAuthorizationScopesFromApi,
  fetchPolicyBundlesFromApi,
  fetchPlatformConfigFromApi,
  fetchPlatformServiceRequestsFromApi,
  fetchPlatformServicePreflightRunsFromApi,
  fetchPrismInventoryFromApi,
  fetchProvisioningAdaptersFromApi,
  fetchResourceProfilesFromApi,
  fetchSessionFromApi,
  fetchSystemStatusFromApi,
  fetchTemplateRegistryFromApi,
  fetchVmSandboxDryRunsFromApi,
  fetchVmLifecycleProofsFromApi,
  requestEnvironmentDestroyViaApi,
  importPrismInventoryViaApi,
  runResourceProfileActionViaApi,
  runLabDiscoveryViaApi,
  runControlPlaneJobActionViaApi,
  runIntegrationCheckViaApi,
  runTemplateRegistryActionViaApi,
  saveIntegrationConfigViaApi,
} from "./cloudStudioApi";

describe("cloudStudioApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports API mode when health endpoint responds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: { ok: true } })));

    await expect(checkApiHealth()).resolves.toEqual({
      mode: "api",
      label: "On-prem API connected",
    });
  });

  it("falls back to mock mode when health endpoint is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(checkApiHealth()).resolves.toEqual({
      mode: "mock",
      label: "Browser mock mode",
    });
  });

  it("fetches environments from the API envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: [{ name: "api-dev" }] })));

    await expect(fetchEnvironmentsFromApi()).resolves.toEqual([{ name: "api-dev" }]);
  });

  it("posts environment requests to the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { environment: { name: "api-dev" }, jobs: [] } }));
    vi.stubGlobal("fetch", fetchMock);

    await createEnvironmentViaApi({
      name: "api-dev",
      templateId: "spring-postgres",
      owner: "demo.user",
      region: "Berlin Lab",
      targets: ["Kubernetes"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/environments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("api-dev"),
      })
    );
  });

  it("fetches the API session envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: { user: "platform.admin" } })));

    await expect(fetchSessionFromApi()).resolves.toEqual({ user: "platform.admin" });
  });

  it("saves and checks integration configuration", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { name: "NCI", status: "Configured" } }));
    vi.stubGlobal("fetch", fetchMock);

    await saveIntegrationConfigViaApi("NCI", {
      endpoint: "https://prism.lab.example",
      credentialProfile: "nci-readonly",
    });
    await runIntegrationCheckViaApi("NCI");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/integration-config/NCI",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("prism.lab.example"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/integrations/NCI/check",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches system status and runs lab discovery", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { provisioningEnabled: false } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchSystemStatusFromApi();
    await fetchLabAdaptersFromApi();
    await runLabDiscoveryViaApi("NCI");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/system/status", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/lab-adapters", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/lab-adapters/NCI/discover",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and imports Prism read-only inventory", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { records: [], recordsImported: 0 } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPrismInventoryFromApi();
    await importPrismInventoryViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/prism/inventory", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/prism/inventory/import",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and advances control-plane jobs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [{ id: "cp-api-dev" }] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlPlaneJobsFromApi();
    await runControlPlaneJobActionViaApi("cp-api-dev", "advance");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/control-plane/jobs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/control-plane/jobs/cp-api-dev/advance",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates VM sandbox dry-run plans", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchVmSandboxDryRunsFromApi();
    await createVmSandboxDryRunViaApi({ environmentName: "vm-plan-dev", imageProfileId: "ahv-rocky-9-hardened" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/dry-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/dry-runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-plan-dev") })
    );
  });

  it("fetches, creates, and decides controlled provisioning gates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlledProvisioningGatesFromApi();
    await createControlledProvisioningGateViaApi({ dryRunPlanId: "vm-dryrun-1" });
    await decideControlledProvisioningGateViaApi("vm-controlled-1", "approve", "Operator approval recorded.");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/controlled-provisioning", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/controlled-provisioning",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-dryrun-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/vm-sandbox/controlled-provisioning/vm-controlled-1/approve",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("Operator approval recorded.") })
    );
  });

  it("fetches and records lab authorization and VM lifecycle proof", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchLabAuthorizationScopesFromApi();
    await createLabAuthorizationScopeViaApi({ pentestScopeStructurallyValid: true });
    await fetchVmLifecycleProofsFromApi();
    await createVmLifecycleProofViaApi({ gateId: "vm-controlled-1", rollbackVerified: true, destroyVerified: true });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/lab-authorization/scopes", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/lab-authorization/scopes",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("pentestScopeStructurallyValid") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/vm-lifecycle/proofs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/vm-lifecycle/proofs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-controlled-1") })
    );
  });

  it("fetches and creates AHV controlled provisioning preflight runs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAhvControlledProvisioningRunsFromApi();
    await createAhvControlledProvisioningRunViaApi({ gateId: "vm-controlled-1", action: "Create VM" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/ahv/controlled-provisioning/runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/ahv/controlled-provisioning/runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-controlled-1") })
    );
  });

  it("fetches and creates platform service requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServiceRequestsFromApi();
    await createPlatformServiceRequestViaApi({ kind: "NDB PostgreSQL", environmentName: "payments-dev" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/requests", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/requests",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("NDB PostgreSQL") })
    );
  });

  it("fetches and creates platform service preflight runs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServicePreflightRunsFromApi();
    await createPlatformServicePreflightRunViaApi({ requestId: "platform-service-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/preflight-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/preflight-runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("platform-service-1") })
    );
  });

  it("fetches provider inventory and requests environment destroy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchResourceProfilesFromApi();
    await fetchPlatformConfigFromApi();
    await fetchProvisioningAdaptersFromApi();
    await requestEnvironmentDestroyViaApi("api-dev");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/resource-profiles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/platform/config", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/provisioning/adapters", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/environments/api-dev/destroy",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and updates registry governance records", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPolicyBundlesFromApi();
    await fetchTemplateRegistryFromApi();
    await runTemplateRegistryActionViaApi("regulated-db", "submit");
    await runResourceProfileActionViaApi("nus-object-dev", "approve");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/policy-bundles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/registry/templates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/registry/templates/regulated-db/submit",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/resource-profiles/nus-object-dev/approve",
      expect.objectContaining({ method: "POST" })
    );
  });
});

function okResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  };
}
