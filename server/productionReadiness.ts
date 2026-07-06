import type { ProductionReadinessReview } from "../src/data/cloudStudioDomain";
import type { ApiState } from "./types";

export function createProductionReadinessReview(state: ApiState, actor: string): ProductionReadinessReview {
  const activeScope = state.labAuthorizationScopes.find(
    (scope) => scope.status === "Approved" && scope.pentestScopeStructurallyValid && new Date(scope.expiresAt).getTime() > Date.now()
  );
  const lifecycleProof = state.vmLifecycleProofs.find((proof) => proof.status === "Verified");
  const ahvPreflight = state.ahvControlledProvisioningRuns[0];
  const providers = ["NKP", "NDB", "NUS", "NAI"];
  const servicePreflights = providers.map((provider) =>
    state.platformServicePreflightRuns.find((run) => run.provider === provider)
  );
  const providerCoverage = servicePreflights.every(Boolean);
  const checks = [
    {
      name: "OIDC boundary",
      passed: state.session.authMode === "OIDC",
      detail:
        state.session.authMode === "OIDC"
          ? `Identity provider ${state.session.identityProvider} is active.`
          : "Current session uses mock OIDC headers; production ingress validation is still required.",
    },
    {
      name: "Durable state boundary",
      passed: Boolean(process.env.NDC_DATA_FILE),
      detail: process.env.NDC_DATA_FILE
        ? "JSON-file persistence is configured for the starter deployment."
        : "No JSON data file is configured for this process.",
    },
    {
      name: "Audit retention configured",
      passed: Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500) >= 500,
      detail: `Audit retention keeps ${Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500)} events.`,
    },
    {
      name: "Lab authorization active",
      passed: Boolean(activeScope),
      detail: activeScope ? `${activeScope.project} / ${activeScope.cluster} / ${activeScope.network}` : "Active lab authorization is required.",
    },
    {
      name: "VM lifecycle proof verified",
      passed: Boolean(lifecycleProof),
      detail: lifecycleProof ? `Lifecycle proof ${lifecycleProof.id} is verified.` : "Verified lifecycle proof is required.",
    },
    {
      name: "AHV preflight recorded",
      passed: Boolean(ahvPreflight),
      detail: ahvPreflight ? `${ahvPreflight.status} / ${ahvPreflight.adapterMode}` : "AHV preflight run is required.",
    },
    {
      name: "Platform service preflight coverage",
      passed: providerCoverage,
      detail: providerCoverage
        ? "NKP, NDB, NUS, and NAI preflight records exist."
        : "NKP, NDB, NUS, and NAI preflight records are required.",
    },
    {
      name: "Provisioning guardrail",
      passed: state.platformConfig.provisioningEnabled === false,
      detail: "Global platform config keeps provisioning disabled.",
    },
  ];

  return {
    id: `production-readiness-${Date.now()}`,
    status: checks.every((check) => check.passed) ? "Ready for review" : "Blocked",
    reviewer: actor,
    checks,
    evidence: [
      `Audit events available: ${state.auditEvents.length}.`,
      `Control-plane jobs recorded: ${state.controlPlaneJobs.length}.`,
      `AHV preflight runs recorded: ${state.ahvControlledProvisioningRuns.length}.`,
      `Platform-service preflight runs recorded: ${state.platformServicePreflightRuns.length}.`,
      "Real provisioning remains disabled until a separate authorized adapter release.",
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}
