import type { IncomingMessage, ServerResponse } from "node:http";
import type { PlatformRole, PlatformSession } from "../src/data/cloudStudioDomain";

export type RequestContext = {
  requestId: string;
  session: PlatformSession;
  startedAt: number;
};

const defaultRoles: PlatformRole[] = ["Developer", "Approver", "Platform Admin"];

export function createRequestContext(request: IncomingMessage): RequestContext {
  const requestId = headerValue(request, "x-request-id") || `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const user = headerValue(request, "x-ndc-user") || "platform.admin";
  const displayName = headerValue(request, "x-ndc-display-name") || titleizeUser(user);
  const roles = parseRoles(headerValue(request, "x-ndc-roles"));
  const issuer = headerValue(request, "x-ndc-issuer") || process.env.OIDC_ISSUER_URL || "NDC Studio local identity stub";

  return {
    requestId,
    startedAt: Date.now(),
    session: {
      user,
      displayName,
      roles,
      authMode: issuer === "NDC Studio local identity stub" ? "Mock OIDC" : "OIDC",
      identityProvider: issuer,
    },
  };
}

export function requireRole(context: RequestContext, allowedRoles: PlatformRole[]) {
  if (!allowedRoles.some((role) => context.session.roles.includes(role))) {
    throw new AuthorizationError("forbidden", "The current session does not have permission for this action.");
  }
}

export class AuthorizationError extends Error {
  constructor(
    readonly code: "forbidden",
    message: string
  ) {
    super(message);
  }
}

export class RateLimitError extends Error {
  constructor(
    readonly retryAfterSeconds: number,
    message = "Too many requests. Please retry shortly."
  ) {
    super(message);
  }
}

export class MemoryRateLimiter {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit = Number(process.env.NDC_RATE_LIMIT_PER_MINUTE ?? 120),
    private readonly windowMs = 60_000
  ) {}

  check(request: IncomingMessage, context: RequestContext) {
    const key = `${request.socket.remoteAddress ?? "local"}:${context.session.user}`;
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }

    bucket.count += 1;
    if (bucket.count > this.limit) {
      throw new RateLimitError(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
    }
  }
}

export function securityHeaders(extraHeaders: Record<string, string> = {}) {
  return {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    ...extraHeaders,
  };
}

export function logRequest(request: IncomingMessage, response: ServerResponse, context: RequestContext) {
  const durationMs = Date.now() - context.startedAt;
  console.log(
    JSON.stringify({
      type: "request",
      requestId: context.requestId,
      method: request.method,
      path: request.url?.split("?")[0] ?? "/",
      status: response.statusCode,
      durationMs,
      actor: context.session.user,
    })
  );
}

function headerValue(request: IncomingMessage, name: string) {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function parseRoles(value: string | undefined): PlatformRole[] {
  if (!value) {
    return defaultRoles;
  }

  const roles = value
    .split(",")
    .map((role) => role.trim())
    .filter((role): role is PlatformRole => role === "Developer" || role === "Approver" || role === "Platform Admin");
  return roles.length > 0 ? roles : ["Developer"];
}

function titleizeUser(user: string) {
  return user
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
