import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import {
  advanceControlPlaneJob,
  ControlPlaneError,
  failControlPlaneJob,
  retryControlPlaneJob,
} from "./controlPlane";
import {
  createEnvironmentRequest,
  decideApproval,
  requestEnvironmentDestroy,
  RequestValidationError,
} from "./mockPlatform";
import type { ApiStore } from "./storage";
import type { IntegrationConfig, LabAdapterSnapshot, SystemStatus } from "../src/data/cloudStudioDomain";
import type { ApiError, ApiResponse, CreateEnvironmentRequest, UpdateIntegrationConfigRequest } from "./types";

export type ApiServerOptions = {
  store: ApiStore;
  staticDir?: string;
};

export function createApiServer({ store, staticDir }: ApiServerOptions) {
  return createServer(async (request, response) => {
    try {
      await routeRequest(request, response, store, staticDir);
    } catch (error) {
      console.error(error);
      sendJson(response, 500, {
        error: {
          code: "internal_error",
          message: "Unexpected server error.",
        },
      });
    }
  });
}

async function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  store: ApiStore,
  staticDir?: string
) {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "GET" && url.pathname === "/healthz") {
    sendJson(response, 200, { data: { ok: true } });
    return;
  }

  if (request.method === "GET" && url.pathname === "/readyz") {
    await store.load();
    sendJson(response, 200, { data: { ready: true } });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    await routeApi(request, response, store, url);
    return;
  }

  if (request.method === "GET" && staticDir) {
    await serveStatic(response, staticDir, url.pathname);
    return;
  }

  sendJson(response, 404, {
    error: {
      code: "not_found",
      message: "Route not found.",
    },
  });
}

async function routeApi(
  request: IncomingMessage,
  response: ServerResponse,
  store: ApiStore,
  url: URL
) {
  const state = await store.load();

  if (request.method === "GET" && url.pathname === "/api/templates") {
    sendJson(response, 200, { data: state.templates });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/session") {
    sendJson(response, 200, { data: state.session });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/system/status") {
    sendJson(response, 200, { data: createSystemStatus(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/environments") {
    sendJson(response, 200, { data: state.environments });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/integrations") {
    sendJson(response, 200, { data: state.integrations });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/integration-config") {
    sendJson(response, 200, { data: state.integrationConfigs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-adapters") {
    sendJson(response, 200, { data: state.labAdapters });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/resource-profiles") {
    sendJson(response, 200, { data: state.resourceProfiles });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/platform/config") {
    sendJson(response, 200, { data: state.platformConfig });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provisioning/adapters") {
    sendJson(response, 200, { data: state.provisioningAdapters });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provisioning-jobs") {
    sendJson(response, 200, { data: state.jobs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/control-plane/jobs") {
    sendJson(response, 200, { data: state.controlPlaneJobs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/approvals") {
    sendJson(response, 200, { data: state.approvals });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit-events") {
    sendJson(response, 200, { data: state.auditEvents });
    return;
  }

  const environmentMatch = url.pathname.match(/^\/api\/environments\/([^/]+)$/);
  if (request.method === "GET" && environmentMatch) {
    const environmentName = decodeURIComponent(environmentMatch[1]);
    const environment = state.environments.find((item) => item.name === environmentName);
    if (!environment) {
      sendJson(response, 404, {
        error: {
          code: "environment_not_found",
          message: `Environment not found: ${environmentName}`,
        },
      });
      return;
    }

    sendJson(response, 200, {
      data: {
        environment,
        jobs: state.jobs.filter((job) => job.environmentName === environmentName),
        controlPlaneJobs: state.controlPlaneJobs.filter((job) => job.environmentName === environmentName),
        approvals: state.approvals.filter((approval) => approval.environmentName === environmentName),
        auditEvents: state.auditEvents.filter((event) => event.target === environmentName),
      },
    });
    return;
  }

  const environmentDestroyMatch = url.pathname.match(/^\/api\/environments\/([^/]+)\/destroy$/);
  if (request.method === "POST" && environmentDestroyMatch) {
    try {
      const environment = requestEnvironmentDestroy(state, decodeURIComponent(environmentDestroyMatch[1]));
      await store.save(state);
      sendJson(response, 200, { data: environment });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/environments") {
    try {
      const body = await readJson<CreateEnvironmentRequest>(request);
      const result = createEnvironmentRequest(state, body);
      await store.save(state);
      sendJson(response, 201, { data: result });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  const integrationConfigMatch = url.pathname.match(/^\/api\/integration-config\/([^/]+)$/);
  if (request.method === "PUT" && integrationConfigMatch) {
    const integrationName = decodeURIComponent(integrationConfigMatch[1]).toUpperCase();
    const integration = state.integrations.find((item) => item.name === integrationName);
    if (!integration) {
      sendJson(response, 404, {
        error: {
          code: "integration_not_found",
          message: `Integration not found: ${integrationName}`,
        },
      });
      return;
    }

    const body = await readJson<UpdateIntegrationConfigRequest>(request);
    const existing =
      state.integrationConfigs.find((item) => item.name === integrationName) ??
      {
        name: integrationName,
        endpoint: "",
        credentialProfile: "",
        status: "Not configured" as const,
        message: integration.nextStep,
      };
    const updated: IntegrationConfig = {
      ...existing,
      endpoint: body.endpoint ?? existing.endpoint,
      credentialProfile: body.credentialProfile ?? existing.credentialProfile,
      status: body.status ?? (body.endpoint || body.credentialProfile ? "Configured" : existing.status),
      message:
        body.endpoint || body.credentialProfile
          ? "Configuration saved. Run readiness check before enabling provisioning."
          : existing.message,
    };
    state.integrationConfigs = [
      updated,
      ...state.integrationConfigs.filter((item) => item.name !== integrationName),
    ].sort((a, b) => a.name.localeCompare(b.name));
    state.auditEvents = [
      {
        id: `audit-integration-config-${integrationName}-${Date.now()}`,
        action: "integration.config.updated",
        actor: state.session.user,
        target: integrationName,
        createdAt: new Date().toISOString(),
      },
      ...state.auditEvents,
    ];
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  const integrationCheckMatch = url.pathname.match(/^\/api\/integrations\/([^/]+)\/check$/);
  if (request.method === "POST" && integrationCheckMatch) {
    const integrationName = decodeURIComponent(integrationCheckMatch[1]).toUpperCase();
    const integration = state.integrations.find((item) => item.name === integrationName);
    const existing = state.integrationConfigs.find((item) => item.name === integrationName);
    if (!integration || !existing) {
      sendJson(response, 404, {
        error: {
          code: "integration_not_found",
          message: `Integration not found: ${integrationName}`,
        },
      });
      return;
    }

    const reachable = Boolean(existing.endpoint && existing.credentialProfile && integration.state !== "Preview");
    const updated: IntegrationConfig = {
      ...existing,
      status: reachable ? "Reachable" : existing.endpoint || existing.credentialProfile ? "Failed" : "Not configured",
      lastCheckedAt: new Date().toISOString(),
      message: reachable
        ? `${integration.name} mock readiness check passed.`
        : existing.endpoint || existing.credentialProfile
          ? `${integration.name} needs a complete endpoint and credential profile before lab validation.`
          : `${integration.name} is not configured yet.`,
    };
    state.integrationConfigs = state.integrationConfigs.map((item) =>
      item.name === integrationName ? updated : item
    );
    state.auditEvents = [
      {
        id: `audit-integration-check-${integrationName}-${Date.now()}`,
        action: "integration.readiness.checked",
        actor: state.session.user,
        target: integrationName,
        createdAt: new Date().toISOString(),
      },
      ...state.auditEvents,
    ];
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  const labDiscoveryMatch = url.pathname.match(/^\/api\/lab-adapters\/([^/]+)\/discover$/);
  if (request.method === "POST" && labDiscoveryMatch) {
    const adapterName = decodeURIComponent(labDiscoveryMatch[1]).toUpperCase();
    const adapter = state.labAdapters.find((item) => item.name === adapterName);
    const config = state.integrationConfigs.find((item) => item.name === adapterName);
    if (!adapter || !config) {
      sendJson(response, 404, {
        error: {
          code: "lab_adapter_not_found",
          message: `Lab adapter not found: ${adapterName}`,
        },
      });
      return;
    }

    const readOnlyCandidate = adapterName === "NCI" && config.status === "Reachable";
    const updated: LabAdapterSnapshot = {
      ...adapter,
      mode: readOnlyCandidate ? "Read-only candidate" : config.status === "Failed" ? "Failed" : "Configured",
      inventoryCount: readOnlyCandidate ? 12 : 0,
      lastDiscoveryAt: new Date().toISOString(),
      message: readOnlyCandidate
        ? "Read-only Prism Central discovery simulated successfully. Provisioning remains disabled."
        : "Discovery requires a reachable integration config and documented lab scope.",
      nextStep: readOnlyCandidate
        ? "Review discovered inventory model and confirm adapter authorization before any real API call."
        : adapter.nextStep,
    };
    state.labAdapters = state.labAdapters.map((item) => (item.name === adapterName ? updated : item));
    state.auditEvents = [
      {
        id: `audit-lab-discovery-${adapterName}-${Date.now()}`,
        action: "lab.discovery.simulated",
        actor: state.session.user,
        target: adapterName,
        createdAt: new Date().toISOString(),
        metadata: {
          readOnly: true,
          provisioningEnabled: false,
        },
      },
      ...state.auditEvents,
    ];
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  const controlPlaneJobMatch = url.pathname.match(/^\/api\/control-plane\/jobs\/([^/]+)\/(advance|retry|fail)$/);
  if (request.method === "POST" && controlPlaneJobMatch) {
    try {
      const jobId = decodeURIComponent(controlPlaneJobMatch[1]);
      const action = controlPlaneJobMatch[2];
      const body = await readJson<{ reason?: string }>(request);
      const job =
        action === "advance"
          ? advanceControlPlaneJob(state, jobId)
          : action === "retry"
            ? retryControlPlaneJob(state, jobId)
            : failControlPlaneJob(state, jobId, body.reason);
      await store.save(state);
      sendJson(response, 200, { data: job });
    } catch (error) {
      if (error instanceof ControlPlaneError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  const approvalMatch = url.pathname.match(/^\/api\/approvals\/([^/]+)\/(approve|reject)$/);
  if (request.method === "POST" && approvalMatch) {
    try {
      const approval = decideApproval(
        state,
        decodeURIComponent(approvalMatch[1]),
        approvalMatch[2] === "approve" ? "Approved" : "Rejected"
      );
      await store.save(state);
      sendJson(response, 200, { data: approval });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  sendJson(response, 404, {
    error: {
      code: "api_route_not_found",
      message: "API route not found.",
    },
  });
}

function createSystemStatus(state: Awaited<ReturnType<ApiStore["load"]>>): SystemStatus {
  return {
    api: "Healthy",
    storage: "Ready",
    session: state.session,
    integrations: {
      total: state.integrationConfigs.length,
      configured: state.integrationConfigs.filter((item) => item.status === "Configured").length,
      reachable: state.integrationConfigs.filter((item) => item.status === "Reachable").length,
      readOnlyCandidates: state.labAdapters.filter((item) => item.mode === "Read-only candidate").length,
    },
    provisioningEnabled: false,
  };
}

function sendJson<T>(response: ServerResponse, status: number, body: ApiResponse<T> | ApiError) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function readJson<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
}

async function serveStatic(response: ServerResponse, staticDir: string, pathname: string) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestedPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  const filePath = join(staticDir, safePath);
  const fallbackPath = join(staticDir, "index.html");
  if (relative(staticDir, filePath).startsWith("..")) {
    sendJson(response, 403, {
      error: {
        code: "forbidden",
        message: "Static path is outside the configured directory.",
      },
    });
    return;
  }
  const targetPath = (await fileExists(filePath)) ? filePath : fallbackPath;

  response.writeHead(200, {
    "Content-Type": contentType(targetPath),
  });
  createReadStream(targetPath).pipe(response);
}

async function fileExists(filePath: string) {
  try {
    const details = await stat(filePath);
    return details.isFile();
  } catch {
    return false;
  }
}

function contentType(filePath: string) {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
