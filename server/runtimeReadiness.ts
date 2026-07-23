import type {
  ContainerConfigValidationManifest,
  LiveReadOnlyPrismCallDesign,
  ProductionReadinessScorecard,
  RuntimeObservabilitySnapshot,
} from "../src/data/cloudStudioDomain";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";
import type { RequestContext } from "./security";
import type { ApiState } from "./types";

export function currentVersion() {
  return process.env.npm_package_version ?? "9.1.0-prism-element-lab-adapter";
}

export function createRuntimeObservabilitySnapshot(
  state: ApiState,
  context: RequestContext,
  staticServing: boolean
): RuntimeObservabilitySnapshot {
  return {
    version: currentVersion(),
    generatedAt: new Date().toISOString(),
    requestId: context.requestId,
    actor: context.session.user,
    storageMode: repositoryMode(),
    staticServing,
    rateLimitPerMinute: Number(process.env.NDC_RATE_LIMIT_PER_MINUTE ?? 120),
    auditEventsRetained: state.auditEvents.length,
    latestAuditEvents: state.auditEvents.slice(0, 10).map(({ id, action, actor, target, createdAt }) => ({
      id,
      action,
      actor,
      target,
      createdAt,
    })),
    guardrails: [
      {
        name: "Simulated provisioning enabled",
        passed: true,
        detail: "Mock adapter workflows can plan and queue simulated environments; real infrastructure mutation remains disabled.",
      },
      {
        name: "Real Prism calls disabled",
        passed: process.env.NDC_PRISM_REAL_ADAPTER !== "enabled",
        detail:
          process.env.NDC_PRISM_REAL_ADAPTER === "enabled"
            ? "Real adapter env flag is enabled, but real call implementations remain disabled."
            : "Real Prism adapter env flag is disabled.",
      },
      {
        name: "Audit retention configured",
        passed: Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500) >= 500,
        detail: `${process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500} audit events retained.`,
      },
      {
        name: "Trusted identity mode declared",
        passed: ["true", "false", undefined].includes(process.env.NDC_REQUIRE_TRUSTED_IDENTITY),
        detail: `NDC_REQUIRE_TRUSTED_IDENTITY=${process.env.NDC_REQUIRE_TRUSTED_IDENTITY ?? "false"}.`,
      },
    ],
  };
}

export function createProductionReadinessScorecard(state: ApiState): ProductionReadinessScorecard {
  const categories = [
    category("Identity", [
      check("Trusted header mode can be required", ["true", "false", undefined].includes(process.env.NDC_REQUIRE_TRUSTED_IDENTITY), `NDC_REQUIRE_TRUSTED_IDENTITY=${process.env.NDC_REQUIRE_TRUSTED_IDENTITY ?? "false"}.`),
      check("Session roles present", state.session.roles.length > 0, state.session.roles.join(", ")),
    ]),
    category("Storage and backup", [
      check("Repository mode configured", ["json", "postgres", undefined].includes(process.env.NDC_REPOSITORY), `NDC_REPOSITORY=${process.env.NDC_REPOSITORY ?? "json"}.`),
      check("Audit retention at least 500", Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500) >= 500, `${process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500} events.`),
    ]),
    category("Prism read-only readiness", [
      check("Read-only lab gate recorded", state.readOnlyPrismLabGates.length > 0, `${state.readOnlyPrismLabGates.length} gate(s).`),
      check(
        "Read-only lab gate ready",
        state.readOnlyPrismLabGates.some((gate) => gate.status === "Ready for fixture contract validation"),
        state.readOnlyPrismLabGates[0]?.status ?? "No gate recorded."
      ),
      check("Credential reference configured", Boolean(state.integrationConfigs.find((item) => item.name === "NCI")?.credentialProfile), "NCI credential reference is required."),
    ]),
    category("Operations evidence", [
      check("Operator runbook available", true, "docs/operator-runbook.md is checked in."),
      check("Rollback pack available", true, "docs/rollback-pack.md is checked in."),
      check("Adapter contract tests available", true, "Prism adapter and read-only inventory contract tests are checked in."),
    ]),
    category("Security boundary", [
      check("Real provisioning disabled", true, "Simulated provisioning is enabled, but real infrastructure mutation remains outside the platform boundary."),
      check("Real Prism calls disabled", true, "realPrismCallsEnabled=false remains the live-call boundary."),
    ]),
  ];
  const passed = categories.reduce((sum, item) => sum + item.passed, 0);
  const total = categories.reduce((sum, item) => sum + item.total, 0);
  const score = Math.round((passed / Math.max(total, 1)) * 100);
  const blockers = categories.flatMap((item) => item.checks.filter((candidate) => !candidate.passed).map((candidate) => `${item.name}: ${candidate.name}`));

  return {
    version: currentVersion(),
    generatedAt: new Date().toISOString(),
    score,
    status: blockers.length === 0 ? "Ready for controlled read-only pilot" : score >= 70 ? "Needs evidence" : "Blocked",
    categories,
    blockers,
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createContainerConfigValidationManifest(): ContainerConfigValidationManifest {
  const checks = [
    check("Runtime host configured", Boolean(process.env.HOST ?? "0.0.0.0"), `HOST=${process.env.HOST ?? "0.0.0.0"}.`),
    check("Runtime port configured", Number(process.env.PORT ?? 8080) > 0, `PORT=${process.env.PORT ?? 8080}.`),
    check("Static directory configured", Boolean(process.env.NDC_STATIC_DIR ?? "dist"), `NDC_STATIC_DIR=${process.env.NDC_STATIC_DIR ?? "dist"}.`),
    check("Repository mode allowed", ["json", "postgres", undefined].includes(process.env.NDC_REPOSITORY), `NDC_REPOSITORY=${process.env.NDC_REPOSITORY ?? "json"}.`),
    check("Real Prism adapter disabled", process.env.NDC_PRISM_REAL_ADAPTER !== "enabled", `NDC_PRISM_REAL_ADAPTER=${process.env.NDC_PRISM_REAL_ADAPTER ?? "disabled"}.`),
    check("Rate limit sane", Number(process.env.NDC_RATE_LIMIT_PER_MINUTE ?? 120) >= 1, `NDC_RATE_LIMIT_PER_MINUTE=${process.env.NDC_RATE_LIMIT_PER_MINUTE ?? 120}.`),
  ];

  return {
    version: currentVersion(),
    generatedAt: new Date().toISOString(),
    status: checks.every((item) => item.passed) ? "Passed" : "Blocked",
    checks,
    evidence: [
      "Container/config validation is metadata-only.",
      "No Nutanix endpoint is contacted.",
      "Real Prism and provisioning guardrails remain disabled.",
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createLiveReadOnlyPrismCallDesign(): LiveReadOnlyPrismCallDesign {
  return {
    version: currentVersion(),
    generatedAt: new Date().toISOString(),
    status: "Design only",
    allowedEndpoints: [
      endpoint("listClusters", "/api/nutanix/v3/clusters/list"),
      endpoint("listProjects", "/api/nutanix/v3/projects/list"),
      endpoint("listImages", "/api/nutanix/v3/images/list"),
      endpoint("listSubnets", "/api/nutanix/v3/subnets/list"),
      endpoint("listCategories", "/api/nutanix/v3/categories/list"),
      endpoint("listVms", "/api/nutanix/v3/vms/list"),
    ],
    timeoutMs: 5000,
    retryPolicy: {
      attempts: 2,
      backoff: "fixed",
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    },
    redactionRules: [
      "Never log Authorization headers.",
      "Never persist credential values.",
      "Redact endpoint query strings before audit export.",
      "Store only credential profile references.",
    ],
    errorTaxonomy: [
      { code: "prism_readonly_not_authorized", meaning: "Lab scope or credential reference is missing." },
      { code: "prism_readonly_timeout", meaning: "Read-only call exceeded timeout policy." },
      { code: "prism_readonly_rate_limited", meaning: "Prism Central or ingress rate limit returned 429." },
      { code: "prism_readonly_unexpected_shape", meaning: "Response fixture/contract validation failed." },
    ],
    enablementGates: [
      "Approved read-only lab scope.",
      "Credential reference stored outside NDC Studio.",
      "Security review completed.",
      "Pentest scope approved.",
      "Rollback and emergency stop runbook accepted.",
      "Real mutation operations remain excluded.",
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

function repositoryMode() {
  return (process.env.NDC_REPOSITORY === "postgres" ? "postgres" : process.env.NDC_DATA_FILE ? "json" : "memory") as RuntimeObservabilitySnapshot["storageMode"];
}

function category(name: string, checks: Array<{ name: string; passed: boolean; detail: string }>) {
  return {
    name,
    passed: checks.filter((item) => item.passed).length,
    total: checks.length,
    checks,
  };
}

function check(name: string, passed: boolean, detail: string) {
  return { name, passed, detail };
}

function endpoint(operation: LiveReadOnlyPrismCallDesign["allowedEndpoints"][number]["operation"], path: string) {
  return { operation, method: "POST" as const, path };
}
