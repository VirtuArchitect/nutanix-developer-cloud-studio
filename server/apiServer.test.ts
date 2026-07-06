import type { Server } from "node:http";
import { request as httpRequest } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApiServer } from "./apiServer";
import { MemoryStore } from "./storage";

describe("api server", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    server = createApiServer({ store: new MemoryStore() });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address.");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("reports health and readiness", async () => {
    await expectJson("/healthz", 200, { data: { ok: true } });
    await expectJson("/readyz", 200, { data: { ready: true } });
  });

  it("lists templates and integrations", async () => {
    const templates = await requestJson("/api/templates");
    const integrations = await requestJson("/api/integrations");
    const session = await requestJson("/api/session");

    expect(templates.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: "spring-postgres" })]));
    expect(integrations.data).toEqual(expect.arrayContaining([expect.objectContaining({ name: "NCI" })]));
    expect(session.data).toMatchObject({ authMode: "Mock OIDC", roles: expect.arrayContaining(["Platform Admin"]) });
  });

  it("updates integration config and runs readiness checks", async () => {
    const saved = await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    const checked = await requestJson("/api/integrations/NCI/check", { method: "POST" });
    const configs = await requestJson("/api/integration-config");

    expect(saved.data).toMatchObject({
      name: "NCI",
      endpoint: "https://prism.lab.example",
      credentialProfile: "nci-readonly",
      status: "Configured",
    });
    expect(checked.data).toMatchObject({ name: "NCI", status: "Reachable" });
    expect(configs.data).toEqual(expect.arrayContaining([expect.objectContaining({ name: "NCI", status: "Reachable" })]));
  });

  it("reports system status and simulates read-only lab discovery", async () => {
    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });

    const discovered = await requestJson("/api/lab-adapters/NCI/discover", { method: "POST" });
    const status = await requestJson("/api/system/status");

    expect(discovered.data).toMatchObject({
      name: "NCI",
      mode: "Read-only candidate",
      provisioningEnabled: false,
      inventoryCount: 12,
    });
    expect(status.data).toMatchObject({
      api: "Healthy",
      storage: "Ready",
      provisioningEnabled: false,
      integrations: expect.objectContaining({ readOnlyCandidates: 1 }),
    });
  });

  it("imports Prism read-only inventory and maps image profile candidates", async () => {
    await expectJson(
      "/api/prism/inventory/import",
      409,
      {
        error: {
          code: "prism_inventory_not_ready",
          message: "Prism inventory import requires a reachable NCI integration configuration.",
        },
      },
      { method: "POST" }
    );

    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });

    const imported = await requestJson("/api/prism/inventory/import", { method: "POST" });
    const inventory = await requestJson("/api/prism/inventory");
    const profiles = await requestJson("/api/resource-profiles");
    const auditEvents = await requestJson("/api/audit-events");

    expect(imported.data).toMatchObject({
      adapter: "NCI",
      mode: "Mock read-only",
      readOnly: true,
      provisioningEnabled: false,
      recordsImported: 8,
      profileCandidates: 2,
    });
    expect(imported.data.mutationOperationsBlocked).toEqual(expect.arrayContaining(["create_vm", "delete_vm"]));
    expect(inventory.data.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "Image", name: "Rocky Linux 9 Hardened", profileCandidate: true }),
      ])
    );
    expect(profiles.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "prism-pc-image-ubuntu-2404-lts",
          kind: "AHV Image",
          status: "Draft",
        }),
      ])
    );
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "prism.inventory.imported", target: "NCI" })])
    );
  });

  it("lists provider inventory, platform config, and provisioning adapters", async () => {
    const profiles = await requestJson("/api/resource-profiles");
    const config = await requestJson("/api/platform/config");
    const adapters = await requestJson("/api/provisioning/adapters");

    expect(profiles.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "ahv-rocky-9-hardened", kind: "AHV Image", provider: "NCI" }),
      ])
    );
    expect(config.data).toMatchObject({
      defaultProject: "developer-cloud-lab",
      provisioningEnabled: false,
    });
    expect(adapters.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "NCI",
          capabilities: expect.arrayContaining(["validateRequest", "plan", "destroy"]),
          provisioningEnabled: false,
        }),
      ])
    );
  });

  it("governs template registry and resource profile lifecycle", async () => {
    const registry = await requestJson("/api/registry/templates");
    const bundles = await requestJson("/api/policy-bundles");
    const submittedTemplate = await requestJson("/api/registry/templates/regulated-db/submit", { method: "POST" });
    const approvedTemplate = await requestJson("/api/registry/templates/regulated-db/approve", { method: "POST" });
    const submittedProfile = await requestJson("/api/resource-profiles/nus-object-dev/submit", { method: "POST" });
    const approvedProfile = await requestJson("/api/resource-profiles/nus-object-dev/approve", { method: "POST" });
    const auditEvents = await requestJson("/api/audit-events");

    expect(registry.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ templateId: "regulated-db", status: "Draft" }),
      ])
    );
    expect(bundles.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "regulated-audit", controls: expect.arrayContaining(["Audit export"]) }),
      ])
    );
    expect(submittedTemplate.data).toMatchObject({ templateId: "regulated-db", status: "Pending approval" });
    expect(approvedTemplate.data).toMatchObject({ templateId: "regulated-db", status: "Published" });
    expect(submittedProfile.data).toMatchObject({ id: "nus-object-dev", status: "Pending approval" });
    expect(approvedProfile.data).toMatchObject({ id: "nus-object-dev", status: "Published" });
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "registry.profile.approve", target: "nus-object-dev" }),
        expect.objectContaining({ action: "registry.template.approve", target: "regulated-db" }),
      ])
    );
  });

  it("creates an environment request and records jobs and audit events", async () => {
    const created = await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "api-created-dev",
        templateId: "spring-postgres",
        owner: "demo.user",
        region: "Berlin Lab",
      }),
    });

    expect(created.data.environment).toMatchObject({
      name: "api-created-dev",
      status: "Provisioning",
    });
    expect(created.data.jobs.length).toBeGreaterThan(0);

    const environments = await requestJson("/api/environments");
    const auditEvents = await requestJson("/api/audit-events");
    const controlPlaneJobs = await requestJson("/api/control-plane/jobs");

    expect(environments.data[0]).toMatchObject({ name: "api-created-dev" });
    expect(auditEvents.data[0]).toMatchObject({ action: "environment.requested" });
    expect(controlPlaneJobs.data[0]).toMatchObject({
      environmentName: "api-created-dev",
      state: "Queued",
      provisioningEnabled: false,
    });
  });

  it("advances, fails, and retries control-plane jobs", async () => {
    await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "queue-dev",
        templateId: "spring-postgres",
        owner: "demo.user",
        region: "Berlin Lab",
      }),
    });
    const jobs = await requestJson("/api/control-plane/jobs");
    const jobId = jobs.data[0].id;

    const validating = await requestJson(`/api/control-plane/jobs/${jobId}/advance`, { method: "POST" });
    const provisioning = await requestJson(`/api/control-plane/jobs/${jobId}/advance`, { method: "POST" });
    const failed = await requestJson(`/api/control-plane/jobs/${jobId}/fail`, {
      method: "POST",
      body: JSON.stringify({ reason: "simulated failure" }),
    });
    const retried = await requestJson(`/api/control-plane/jobs/${jobId}/retry`, { method: "POST" });

    expect(validating.data).toMatchObject({ state: "Validating" });
    expect(provisioning.data).toMatchObject({ state: "Provisioning", attempts: 1 });
    expect(failed.data).toMatchObject({ state: "Failed", lastError: "simulated failure" });
    expect(retried.data).toMatchObject({ state: "Queued" });
  });

  it("queues simulated destroy lifecycle jobs", async () => {
    await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "destroy-dev",
        templateId: "vm-app",
        owner: "demo.user",
        region: "Berlin Lab",
      }),
    });

    const destroyed = await requestJson("/api/environments/destroy-dev/destroy", { method: "POST" });
    const jobs = await requestJson("/api/control-plane/jobs");
    const destroyJob = jobs.data.find((job: { id: string }) => job.id === "cp-destroy-destroy-dev");

    expect(destroyed.data).toMatchObject({ name: "destroy-dev", status: "Destroying" });
    expect(destroyJob).toMatchObject({
      operation: "Destroy",
      state: "Destroying",
      provisioningEnabled: false,
    });
  });

  it("creates and decides approval requests", async () => {
    const created = await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "ai-api-dev",
        templateId: "ai-endpoint",
        owner: "demo.user",
        region: "Berlin Lab",
        targets: ["AI Endpoint", "Storage"],
      }),
    });

    expect(created.data.environment).toMatchObject({
      name: "ai-api-dev",
      status: "Needs approval",
    });
    expect(created.data.approval).toMatchObject({
      environmentName: "ai-api-dev",
      status: "Pending",
    });

    const approvals = await requestJson("/api/approvals");
    const approvalId = approvals.data[0].id;
    const approved = await requestJson(`/api/approvals/${approvalId}/approve`, { method: "POST" });
    const detail = await requestJson("/api/environments/ai-api-dev");

    expect(approved.data).toMatchObject({ status: "Approved" });
    expect(detail.data.environment).toMatchObject({ status: "Provisioning" });
    expect(detail.data.approvals[0]).toMatchObject({ status: "Approved" });
  });

  it("rejects unknown templates", async () => {
    await expectJson(
      "/api/environments",
      400,
      {
        error: {
          code: "template_not_found",
          message: "Template not found: missing",
        },
      },
      {
        method: "POST",
        body: JSON.stringify({
          name: "bad-dev",
          templateId: "missing",
          owner: "demo.user",
          region: "Berlin Lab",
        }),
      }
    );
  });

  async function requestJson(path: string, init?: RequestInit) {
    const response = await nodeRequest(path, init);
    return JSON.parse(response.body);
  }

  async function expectJson(path: string, status: number, body: unknown, init?: RequestInit) {
    const response = await nodeRequest(path, init);
    expect(response.status).toBe(status);
    expect(JSON.parse(response.body)).toEqual(body);
  }

  async function nodeRequest(path: string, init?: RequestInit): Promise<{ status: number; body: string }> {
    const url = new URL(`${baseUrl}${path}`);
    const body = typeof init?.body === "string" ? init.body : undefined;

    return new Promise((resolve, reject) => {
      const request = httpRequest(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: init?.method ?? "GET",
          headers: {
            "Content-Type": "application/json",
            ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
          },
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          response.on("end", () =>
            resolve({
              status: response.statusCode ?? 0,
              body: Buffer.concat(chunks).toString("utf8"),
            })
          );
        }
      );

      request.on("error", reject);
      if (body) {
        request.write(body);
      }
      request.end();
    });
  }
});
