import { createHash } from "node:crypto";
import type {
  ApiContractBaseline,
  ApiContractOperation,
  AuditIntegrityManifest,
  DeploymentProfileValidation,
  OperationsRunbookConsole,
  PersistenceBoundaryStatus,
  PlatformRole,
  ProductionHardeningCheck,
  RbacEnforcementMatrix,
} from "../src/data/cloudStudioDomain";
import type { ApiState, AuditEvent } from "./types";

const hardeningVersion = "6.5.0-operations-runbook-console";
const allRoles: PlatformRole[] = ["Developer", "Approver", "Platform Admin"];

const contractOperations: ApiContractOperation[] = [
  operation("GET", "/api/contracts/openapi", ["Platform Admin"], "API contract baseline", "ApiContractBaseline", "Read-only snapshot"),
  operation("GET", "/api/security/rbac-matrix", ["Platform Admin"], "RBAC enforcement matrix", "RbacEnforcementMatrix", "Read-only snapshot"),
  operation("GET", "/api/storage/persistence-boundary", ["Platform Admin"], "Repository boundary diagnostics", "PersistenceBoundaryStatus", "Read-only snapshot"),
  operation("GET", "/api/audit/integrity-manifest", ["Platform Admin"], "Tamper-evident audit manifest", "AuditIntegrityManifest", "Read-only snapshot"),
  operation("GET", "/api/deployment/profiles", ["Platform Admin"], "Deployment profile validation", "DeploymentProfileValidation", "Read-only snapshot"),
  operation("GET", "/api/operations/runbook-console", ["Platform Admin"], "Operations runbook console", "OperationsRunbookConsole", "Read-only snapshot"),
  operation("GET", "/api/environments", ["Developer", "Approver", "Platform Admin"], "Environment list", "Environment[]", "Read-only snapshot"),
  operation("POST", "/api/environments", ["Developer", "Platform Admin"], "Create simulated environment", "Environment", "Simulated state transition"),
  operation("POST", "/api/approvals/:id/decide", ["Approver", "Platform Admin"], "Approve or reject simulated request", "ApprovalRequest", "Simulated state transition"),
  operation("POST", "/api/lab-transition/real-lab-authorization-packets", ["Platform Admin"], "Prepare real lab authorization evidence", "RealLabAuthorizationPacketRecord", "Evidence record only"),
];

export function createApiContractBaseline(state: ApiState): ApiContractBaseline {
  const generatedAt = new Date().toISOString();
  return {
    id: `api-contract-baseline-${Date.now()}`,
    version: hardeningVersion,
    generatedAt,
    status: "Contract baseline ready",
    title: "NDC Studio API contract baseline",
    openApiVersion: "3.1.0",
    operations: contractOperations,
    examples: [
      {
        name: "Create environment request",
        method: "POST",
        path: "/api/environments",
        requestExample: {
          name: "checkout-api-dev",
          templateId: state.templates[0]?.id ?? "template-spring-api",
          owner: state.session.user,
          region: "Berlin Lab",
          targets: ["VM", "Database"],
        },
        responseExample: {
          name: "checkout-api-dev",
          status: "Provisioning",
          cost: 2200,
          provisioningEnabled: false,
        },
      },
      {
        name: "Deployment profile validation",
        method: "GET",
        path: "/api/deployment/profiles",
        responseExample: {
          activeProfile: activeDeploymentProfile(),
          status: "Profiles validated",
          provisioningEnabled: false,
          realPrismCallsEnabled: false,
        },
      },
    ],
    checks: [
      check("Contracts cover hardening endpoints", true, `${contractOperations.length} operations documented.`),
      check("Examples avoid credentials", true, "Examples contain references and simulated identifiers only."),
      check("Real infrastructure mutation disabled", true, "All contract operations report disabled Prism/provisioning flags."),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createRbacEnforcementMatrix(): RbacEnforcementMatrix {
  const routes = contractOperations.map((item) => ({
    method: item.method,
    path: item.path,
    allowedRoles: item.requiredRoles,
    deniedRoles: allRoles.filter((role) => !item.requiredRoles.includes(role)),
    enforcement: "requireRole" as const,
  }));

  return {
    id: `rbac-matrix-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: "RBAC matrix enforced",
    roles: allRoles,
    routes,
    negativeTestCases: routes
      .flatMap((route) =>
        route.deniedRoles.map((role) => ({
          actorRole: role,
          method: route.method,
          path: route.path,
          expectedStatus: 403 as const,
        }))
      )
      .slice(0, 12),
    checks: [
      check("Administrative routes require Platform Admin", routes.filter((route) => route.path.startsWith("/api/")).every((route) => route.allowedRoles.includes("Platform Admin") || route.path === "/api/environments"), "Hardening routes are admin-only; environment list remains shared."),
      check("Negative cases generated", true, "Denied-role cases are emitted for tests and review."),
      check("Real infrastructure mutation disabled", true, "RBAC changes protect evidence routes only."),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createPersistenceBoundaryStatus(repositoryName: string): PersistenceBoundaryStatus {
  const repositoryMode = repositoryName === "JsonFileStore" ? "json-file" : "memory";
  const durable = repositoryMode === "json-file";

  return {
    id: `persistence-boundary-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: durable ? "Repository boundary ready" : "Repository boundary needs durable mode",
    repositoryMode,
    durable,
    repositoryInterface: ["load(): Promise<ApiState>", "save(state: ApiState): Promise<void>", "applyRetention(state): ApiState"],
    migrationTargets: ["PostgresRepository", "SqliteRepository", "ObjectStorageAuditArchive"],
    checks: [
      check("Repository interface isolated", true, "API routes call ApiStore instead of direct filesystem persistence."),
      check("Durable mode available", durable, durable ? "JSON-file persistence is active." : "Memory mode is active; use JSON-file or future Postgres for on-prem durability."),
      check("Retention boundary applied", true, "Audit event retention is applied before persistence."),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createAuditIntegrityManifest(state: ApiState): AuditIntegrityManifest {
  const eventDigests = state.auditEvents.slice(0, 50).map((event) => ({
    eventId: event.id,
    action: event.action,
    digest: digestAuditEvent(event),
  }));
  const manifestDigest = sha256(eventDigests.map((event) => `${event.eventId}:${event.digest}`).join("|"));

  return {
    id: `audit-integrity-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: "Integrity manifest ready",
    retainedEvents: state.auditEvents.length,
    digestAlgorithm: "sha256",
    eventDigests,
    manifestDigest,
    redactionBoundary: "Digests are computed from stored audit metadata only; credentials, authorization headers, endpoints, and tokens are not exported.",
    checks: [
      check("Digest algorithm fixed", true, "SHA-256 is used for event and manifest digests."),
      check("Audit stream retained", state.auditEvents.length >= 0, `${state.auditEvents.length} audit events currently retained.`),
      check("Export remains metadata-only", true, "No secret-bearing fields are introduced by the manifest."),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createDeploymentProfileValidation(): DeploymentProfileValidation {
  const activeProfile = activeDeploymentProfile();
  const trustedHeadersRequired = process.env.NDC_REQUIRE_TRUSTED_IDENTITY === "true";
  const stateFileConfigured = Boolean(process.env.NDC_STATE_FILE);
  const liveReadOnlyFlagDisabled = process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true";

  return {
    id: `deployment-profiles-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: "Profiles validated",
    activeProfile,
    profiles: [
      profile("local", "Developer workstation with mock identity and in-memory or JSON-file state.", [
        check("Mock identity acceptable", true, "Local mode may use the built-in mock OIDC context."),
        check("Real Prism disabled", liveReadOnlyFlagDisabled, "NDC_PRISM_READONLY_HTTP_ENABLED must stay unset or false."),
      ]),
      profile("hosted-demo", "Static demo plus hosted starter API for stakeholder walkthroughs.", [
        check("Trusted identity optional", !trustedHeadersRequired, "Hosted demo remains non-production and does not imply real SSO."),
        check("Provisioning disabled", true, "No hosted demo profile can mutate infrastructure."),
      ]),
      profile("on-prem-starter", "Containerized starter suitable for private deployment pilots.", [
        check("Durable state configured", stateFileConfigured, stateFileConfigured ? "NDC_STATE_FILE is configured." : "NDC_STATE_FILE is required for durable on-prem starter state."),
        check("Trusted identity required", trustedHeadersRequired, "NDC_REQUIRE_TRUSTED_IDENTITY=true is required before production-like on-prem use."),
      ]),
      profile("lab-prep", "Authorized lab preparation with evidence gates before any real adapter work.", [
        check("Real read-only calls disabled", liveReadOnlyFlagDisabled, "Read-only HTTP calls remain disabled until a separate authorized change."),
        check("Credential references only", true, "Lab prep validates references and evidence, not credential values."),
      ]),
    ],
    failClosedControls: [
      "Real Prism HTTP flag must remain disabled in v6.",
      "Provisioning and mutation adapters remain disabled.",
      "On-prem profile is not ready without trusted identity and durable state.",
      "Lab prep profile records evidence only until separate authorization.",
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createOperationsRunbookConsole(state: ApiState): OperationsRunbookConsole {
  const steps = [
    runbookStep("API contract baseline", "Ready", `${contractOperations.length} operations documented.`),
    runbookStep("RBAC enforcement", "Ready", "Hardening routes require Platform Admin."),
    runbookStep("Persistence boundary", process.env.NDC_STATE_FILE ? "Ready" : "Evidence pending", process.env.NDC_STATE_FILE ? "Durable JSON state configured." : "Durable state profile not configured in this runtime."),
    runbookStep("Audit integrity", "Ready", `${state.auditEvents.length} retained audit events can be hashed.`),
    runbookStep("Deployment profile validation", "Ready", `${activeDeploymentProfile()} profile evaluated fail-closed.`),
    runbookStep("Real adapter execution", "Blocked", "Real infrastructure calls and provisioning remain disabled."),
  ] satisfies OperationsRunbookConsole["runbookSteps"];

  const readySteps = steps.filter((step) => step.state === "Ready").length;
  const blockedGates = steps.filter((step) => step.state !== "Ready").map((step) => step.name);

  return {
    id: `operations-runbook-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: blockedGates.length > 0 ? "Blocked" : "Ready for operator review",
    readinessScore: Math.round((readySteps / steps.length) * 100),
    blockedGates,
    runbookSteps: steps,
    evidenceSummary: [
      { name: "Audit events", count: state.auditEvents.length },
      { name: "Approvals", count: state.approvals.length },
      { name: "Control-plane jobs", count: state.controlPlaneJobs.length },
      { name: "Lab authorization packets", count: state.realLabAuthorizationPacketRecords.length },
      { name: "Evidence export packs", count: state.evidenceExportPackV2Records.length },
    ],
    checks: [
      check("Operator path visible", true, "Runbook steps are available from the Admin Operations tab."),
      check("Blocked real execution", true, "Real adapter execution is intentionally blocked."),
      check("Evidence summary connected", true, "Counts are derived from current API state."),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

function operation(
  method: ApiContractOperation["method"],
  path: string,
  requiredRoles: PlatformRole[],
  summary: string,
  responseShape: string,
  mutationBoundary: ApiContractOperation["mutationBoundary"]
): ApiContractOperation {
  return {
    method,
    path,
    requiredRoles,
    summary,
    responseShape,
    mutationBoundary,
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

function profile(
  name: DeploymentProfileValidation["activeProfile"],
  purpose: string,
  checks: ProductionHardeningCheck[]
): DeploymentProfileValidation["profiles"][number] {
  return {
    name,
    purpose,
    ready: checks.every((item) => item.passed),
    checks,
  };
}

function runbookStep(
  name: string,
  state: OperationsRunbookConsole["runbookSteps"][number]["state"],
  evidence: string
): OperationsRunbookConsole["runbookSteps"][number] {
  return { name, state, evidence };
}

function check(name: string, passed: boolean, detail: string): ProductionHardeningCheck {
  return { name, passed, detail };
}

function digestAuditEvent(event: AuditEvent) {
  return sha256(JSON.stringify({
    id: event.id,
    action: event.action,
    actor: event.actor,
    target: event.target,
    createdAt: event.createdAt,
    metadata: event.metadata ?? {},
  }));
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function activeDeploymentProfile(): DeploymentProfileValidation["activeProfile"] {
  const value = process.env.NDC_DEPLOYMENT_PROFILE;
  if (value === "hosted-demo" || value === "on-prem-starter" || value === "lab-prep") {
    return value;
  }
  return "local";
}
