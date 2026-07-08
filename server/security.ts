import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  AuthBoundaryDiagnostics,
  AuthorizationMatrixEntry,
  PlatformRole,
  PlatformSession,
  SessionDiagnostics,
} from "../src/data/cloudStudioDomain";

export type RequestContext = {
  requestId: string;
  session: PlatformSession;
  startedAt: number;
};

const defaultRoles: PlatformRole[] = ["Developer", "Approver", "Platform Admin"];
const trustedIdentityHeaders = ["x-ndc-user", "x-ndc-roles", "x-ndc-issuer"];

export const authorizationMatrix: AuthorizationMatrixEntry[] = [
  {
    action: "Create developer environment",
    roles: ["Developer", "Platform Admin"],
    boundary: "Creates a simulated request and queues control-plane evidence.",
  },
  {
    action: "Approve requests and controlled gates",
    roles: ["Approver", "Platform Admin"],
    boundary: "Records approval evidence; does not enable real infrastructure mutation.",
  },
  {
    action: "Manage providers, registry, preflight, lifecycle, and audit export",
    roles: ["Platform Admin"],
    boundary: "Administrative control-plane records only; real adapters remain disabled.",
  },
];

export function createRequestContext(request: IncomingMessage): RequestContext {
  const missingRequiredHeaders = missingTrustedHeaders(request);
  if (trustedHeaderModeRequired() && !isPublicHealthPath(request) && missingRequiredHeaders.length > 0) {
    throw new AuthorizationError(
      "unauthenticated",
      `Trusted identity headers are required: ${missingRequiredHeaders.join(", ")}.`
    );
  }

  const requestId = headerValue(request, "x-request-id") || `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const user = headerValue(request, "x-ndc-user") || "platform.admin";
  const displayName = headerValue(request, "x-ndc-display-name") || titleizeUser(user);
  validateTrustedIdentityHeaders(request);
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

export function createSessionDiagnostics(context: RequestContext, request: IncomingMessage): SessionDiagnostics {
  return {
    authMode: context.session.authMode,
    identityProvider: context.session.identityProvider,
    user: context.session.user,
    roles: context.session.roles,
    trustedHeaderMode: trustedHeaderModeRequired() ? "Required" : "Optional",
    missingRequiredHeaders: missingTrustedHeaders(request),
    authorizationMatrix,
  };
}

export function createAuthBoundaryDiagnostics(context: RequestContext, request: IncomingMessage): AuthBoundaryDiagnostics {
  const missing = missingTrustedHeaders(request);
  const rawRoles = headerValue(request, "x-ndc-roles");
  const rawUser = headerValue(request, "x-ndc-user");
  const rawIssuer = headerValue(request, "x-ndc-issuer");
  const malformed = Boolean(
    (rawRoles && parseInvalidRoles(rawRoles).length > 0) ||
      (rawUser && !isSafeIdentityValue(rawUser)) ||
      (rawIssuer && !isSafeIdentityValue(rawIssuer, true))
  );

  return {
    mode: trustedHeaderModeRequired() ? "Required" : "Optional",
    user: context.session.user,
    issuer: context.session.identityProvider,
    roles: context.session.roles,
    rejectedMalformedHeaders: trustedHeaderModeRequired() && malformed,
    auditEventRecorded: true,
    headerChecks: [
      {
        name: "Required headers present",
        passed: missing.length === 0,
        detail: missing.length === 0 ? "Trusted identity headers are present." : `Missing: ${missing.join(", ")}.`,
      },
      {
        name: "Roles valid",
        passed: !rawRoles || parseInvalidRoles(rawRoles).length === 0,
        detail:
          !rawRoles || parseInvalidRoles(rawRoles).length === 0
            ? "Role header maps to known platform roles."
            : `Invalid roles: ${parseInvalidRoles(rawRoles).join(", ")}.`,
      },
      {
        name: "User header safe",
        passed: !rawUser || isSafeIdentityValue(rawUser),
        detail: "User header must be a short identifier without control characters.",
      },
      {
        name: "Issuer header safe",
        passed: !rawIssuer || isSafeIdentityValue(rawIssuer, true),
        detail: "Issuer header must be a bounded URL or issuer reference without control characters.",
      },
    ],
  };
}

export function requireRole(context: RequestContext, allowedRoles: PlatformRole[]) {
  if (!allowedRoles.some((role) => context.session.roles.includes(role))) {
    throw new AuthorizationError("forbidden", "The current session does not have permission for this action.");
  }
}

export class AuthorizationError extends Error {
  constructor(
    readonly code: "forbidden" | "unauthenticated" | "invalid_identity_header",
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

function trustedHeaderModeRequired() {
  return process.env.NDC_REQUIRE_TRUSTED_IDENTITY === "true";
}

function isPublicHealthPath(request: IncomingMessage) {
  const pathname = (request.url ?? "/").split("?")[0];
  return pathname === "/healthz" || pathname === "/readyz";
}

function missingTrustedHeaders(request: IncomingMessage) {
  return trustedIdentityHeaders.filter((name) => !headerValue(request, name));
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

function validateTrustedIdentityHeaders(request: IncomingMessage) {
  if (!trustedHeaderModeRequired() || isPublicHealthPath(request)) {
    return;
  }

  const user = headerValue(request, "x-ndc-user");
  const issuer = headerValue(request, "x-ndc-issuer");
  const roles = headerValue(request, "x-ndc-roles");

  if (user && !isSafeIdentityValue(user)) {
    throw new AuthorizationError("invalid_identity_header", "Trusted user header is malformed.");
  }

  if (issuer && !isSafeIdentityValue(issuer, true)) {
    throw new AuthorizationError("invalid_identity_header", "Trusted issuer header is malformed.");
  }

  const invalidRoles = parseInvalidRoles(roles);
  if (invalidRoles.length > 0) {
    throw new AuthorizationError(
      "invalid_identity_header",
      `Trusted role header contains unsupported roles: ${invalidRoles.join(", ")}.`
    );
  }
}

function parseInvalidRoles(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean)
    .filter((role) => role !== "Developer" && role !== "Approver" && role !== "Platform Admin");
}

function isSafeIdentityValue(value: string, allowUrl = false) {
  if (value.length < 1 || value.length > 200 || /[\r\n\t]/.test(value)) {
    return false;
  }

  return allowUrl ? /^[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+$/.test(value) : /^[A-Za-z0-9._@-]+$/.test(value);
}

function titleizeUser(user: string) {
  return user
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
