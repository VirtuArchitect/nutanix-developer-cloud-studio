import type { Server } from "node:http";
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

    expect(templates.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: "spring-postgres" })]));
    expect(integrations.data).toEqual(expect.arrayContaining([expect.objectContaining({ name: "NCI" })]));
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

    expect(environments.data[0]).toMatchObject({ name: "api-created-dev" });
    expect(auditEvents.data[0]).toMatchObject({ action: "environment.requested" });
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
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    return response.json();
  }

  async function expectJson(path: string, status: number, body: unknown, init?: RequestInit) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual(body);
  }
});
