import { describe, expect, it } from "vitest";
import {
  LabAhvPrismAdapter,
  PrismCentralV3Client,
  createAhvLabRuntimeConfig,
  redactSensitive,
} from "./ahvLabRuntime";

describe("AHV lab runtime", () => {
  it("blocks lab runtime when required configuration is missing", () => {
    const config = createAhvLabRuntimeConfig({});

    expect(config).toMatchObject({
      mode: "Disabled",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
      passwordConfigured: false,
    });
    expect(config.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Prism Central endpoint", passed: false }),
        expect.objectContaining({ name: "Prism password", passed: false }),
      ])
    );
  });

  it("marks lab runtime ready only when all switches and allowed UUIDs are configured", () => {
    const config = createAhvLabRuntimeConfig(labEnv());

    expect(config).toMatchObject({
      mode: "Lab ready",
      provisioningEnabled: true,
      realPrismCallsEnabled: true,
      prismCentralUrlHost: "prism.example.invalid:9440",
    });
    expect(config.checks.every((check) => check.passed)).toBe(true);
  });

  it("redacts authorization and secret-shaped fields", () => {
    expect(
      redactSensitive({
        Authorization: "Basic abc",
        password: "secret",
        nested: { token: "abc", safe: "value" },
      })
    ).toEqual({
      Authorization: "[REDACTED]",
      password: "[REDACTED]",
      nested: { token: "[REDACTED]", safe: "value" },
    });
  });

  it("builds Prism v3 requests through an injectable transport", async () => {
    const requests: Array<{ method: string; path: string; body?: Record<string, unknown> }> = [];
    const client = new PrismCentralV3Client(labEnv(), async (request) => {
      requests.push(request);
      return { task_reference: { uuid: "task-1" } };
    });

    await client.list("listClusters");
    await client.createVm({ spec: { name: "ndc-lab-api-01" } });

    expect(requests).toEqual([
      expect.objectContaining({ method: "POST", path: "/api/nutanix/v3/clusters/list" }),
      expect.objectContaining({ method: "POST", path: "/api/nutanix/v3/vms" }),
    ]);
  });

  it("preflights read-only Prism operations without submitting VM lifecycle tasks", async () => {
    const adapter = new LabAhvPrismAdapter(
      new PrismCentralV3Client(labEnv(), async () => ({ metadata: { total_matches: 1 }, entities: [] }))
    );
    const previousEnv = snapshotEnv();
    Object.assign(process.env, labEnv());
    try {
      const preflight = await adapter.preflight("platform.admin");
      expect(preflight).toMatchObject({
        status: "Ready",
        provisioningEnabled: false,
        realPrismCallsEnabled: true,
        redactionApplied: true,
      });
      expect(preflight.readOnlyChecks).toHaveLength(4);
    } finally {
      restoreEnv(previousEnv);
    }
  });
});

function labEnv() {
  return {
    APP_ENV: "lab",
    NDC_AHV_REAL_ADAPTER_ENABLED: "true",
    NDC_CONTROLLED_PROVISIONING_ENABLED: "true",
    NDC_AHV_LAB_LIFECYCLE_ENABLED: "true",
    NUTANIX_PRISM_CENTRAL_URL: "https://prism.example.invalid:9440",
    NUTANIX_PRISM_USERNAME: "lab-user",
    NUTANIX_PRISM_PASSWORD: "placeholder-not-a-secret",
    NDC_AHV_ALLOWED_CLUSTER_UUID: "cluster-uuid",
    NDC_AHV_ALLOWED_PROJECT_UUID: "project-uuid",
    NDC_AHV_ALLOWED_SUBNET_UUID: "subnet-uuid",
    NDC_AHV_ALLOWED_IMAGE_UUID: "image-uuid",
    NDC_AHV_VM_NAME_PREFIX: "ndc-lab-",
  };
}

function snapshotEnv() {
  return { ...process.env };
}

function restoreEnv(snapshot: NodeJS.ProcessEnv) {
  for (const key of Object.keys(process.env)) {
    delete process.env[key];
  }
  Object.assign(process.env, snapshot);
}
