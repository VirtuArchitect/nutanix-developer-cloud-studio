import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import { createEnvironmentRequest, RequestValidationError } from "./mockPlatform";
import type { ApiStore } from "./storage";
import type { ApiError, ApiResponse, CreateEnvironmentRequest } from "./types";

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

  if (request.method === "GET" && url.pathname === "/api/environments") {
    sendJson(response, 200, { data: state.environments });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/integrations") {
    sendJson(response, 200, { data: state.integrations });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provisioning-jobs") {
    sendJson(response, 200, { data: state.jobs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit-events") {
    sendJson(response, 200, { data: state.auditEvents });
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

  sendJson(response, 404, {
    error: {
      code: "api_route_not_found",
      message: "API route not found.",
    },
  });
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
