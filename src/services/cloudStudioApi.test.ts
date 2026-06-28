import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkApiHealth,
  createEnvironmentViaApi,
  fetchControlPlaneJobsFromApi,
  fetchEnvironmentsFromApi,
  fetchLabAdaptersFromApi,
  fetchSessionFromApi,
  fetchSystemStatusFromApi,
  runLabDiscoveryViaApi,
  runControlPlaneJobActionViaApi,
  runIntegrationCheckViaApi,
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
});

function okResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  };
}
