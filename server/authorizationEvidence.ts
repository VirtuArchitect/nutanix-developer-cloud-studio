import type {
  LabAuthorizationScope,
  LabScopeDiagnostics,
  ProvisioningAdapterName,
  VmLifecycleProof,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateLabAuthorizationScopeRequest, CreateVmLifecycleProofRequest } from "./types";

export class AuthorizationEvidenceError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createLabAuthorizationScope(
  state: ApiState,
  input: CreateLabAuthorizationScopeRequest,
  actor: string
): LabAuthorizationScope {
  const now = new Date();
  const approvedAt = input.approvedAt ?? now.toISOString();
  const expiresAt = input.expiresAt ?? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const scope: LabAuthorizationScope = {
    id: `lab-scope-${Date.now()}`,
    version: (input.version ?? "v1").trim(),
    name: (input.name ?? "Berlin AHV controlled provisioning lab").trim(),
    targetEnvironment: (input.targetEnvironment ?? "controlled lab").trim(),
    owner: (input.owner ?? actor).trim(),
    approver: (input.approver ?? actor).trim(),
    approvedAt,
    expiresAt,
    project: (input.project ?? state.platformConfig.defaultProject).trim(),
    cluster: (input.cluster ?? state.platformConfig.defaultCluster).trim(),
    network: (input.network ?? state.platformConfig.networkProfile).trim(),
    providerCoverage: input.providerCoverage ?? ["NCI"],
    targetEndpoints: input.targetEndpoints ?? ["prism-central-ref"],
    allowedActions: input.allowedActions ?? ["dry_run", "controlled_create_observation", "rollback_validation", "destroy_validation"],
    excludedActions: input.excludedActions ?? ["unscoped_create", "bulk_delete", "network_change", "image_delete", "production_workload_change"],
    pentestScopeReference: (input.pentestScopeReference ?? "PENTEST_SCOPE_TEMPLATE.md / approved lab scope pending").trim(),
    pentestScopeStructurallyValid: Boolean(input.pentestScopeStructurallyValid),
    evidenceReferences: input.evidenceReferences ?? ["PENTEST_SCOPE_TEMPLATE.md", "operator-approval-record"],
    rollbackOwner: (input.rollbackOwner ?? actor).trim(),
    status: new Date(expiresAt).getTime() > now.getTime() ? "Approved" : "Expired",
    createdAt: now.toISOString(),
  };

  if (!scope.version || !scope.project || !scope.cluster || !scope.network || !scope.rollbackOwner) {
    throw new AuthorizationEvidenceError(
      "lab_scope_invalid",
      "Version, project, cluster, network, and rollback owner are required."
    );
  }

  if (scope.providerCoverage.length === 0 || scope.targetEndpoints.length === 0) {
    throw new AuthorizationEvidenceError(
      "lab_scope_invalid",
      "Provider coverage and target endpoint references are required."
    );
  }

  return scope;
}

export function createLabScopeDiagnostics(state: ApiState): LabScopeDiagnostics {
  const now = Date.now();
  const scopes = state.labAuthorizationScopes;
  const readyScopes = scopes.filter((scope) => labScopeChecks(scope, now).every((check) => check.passed));
  const latest = scopes[0];
  const providers: ProvisioningAdapterName[] = ["NCI", "NKP", "NDB", "NUS", "NCM", "NAI"];

  return {
    generatedAt: new Date().toISOString(),
    totalScopes: scopes.length,
    readyScopes: readyScopes.length,
    providerCoverage: providers.map((provider) => {
      const coveringScope = readyScopes.find((scope) => scope.providerCoverage.includes(provider));
      return {
        provider,
        covered: Boolean(coveringScope),
        scopeId: coveringScope?.id,
      };
    }),
    latest: latest
      ? {
          scopeId: latest.id,
          status: latest.status,
          expiresAt: latest.expiresAt,
          daysUntilExpiry: Math.floor((new Date(latest.expiresAt).getTime() - now) / (24 * 60 * 60 * 1000)),
          checks: labScopeChecks(latest, now),
          readyForAdapterReview: labScopeChecks(latest, now).every((check) => check.passed),
        }
      : undefined,
  };
}

export function isLabScopeReadyForProvider(scope: LabAuthorizationScope | undefined, provider: ProvisioningAdapterName) {
  if (!scope) {
    return false;
  }

  return scope.providerCoverage.includes(provider) && labScopeChecks(scope, Date.now()).every((check) => check.passed);
}

export function createVmLifecycleProof(
  state: ApiState,
  input: CreateVmLifecycleProofRequest,
  actor: string
): VmLifecycleProof {
  const gate = input.gateId
    ? state.controlledProvisioningGates.find((item) => item.id === input.gateId)
    : state.controlledProvisioningGates[0];

  if (!gate) {
    throw new AuthorizationEvidenceError("controlled_gate_required", "A controlled provisioning gate is required before lifecycle proof.");
  }

  const rollbackVerified = Boolean(input.rollbackVerified);
  const destroyVerified = Boolean(input.destroyVerified);
  const checks = [
    {
      name: "Controlled gate approved",
      passed: gate.status === "Approved for controlled create",
      detail:
        gate.status === "Approved for controlled create"
          ? "Controlled create gate is approved."
          : `Gate status is ${gate.status}.`,
    },
    {
      name: "Rollback verified",
      passed: rollbackVerified,
      detail: rollbackVerified ? "Rollback evidence was recorded." : "Rollback evidence is still required.",
    },
    {
      name: "Destroy verified",
      passed: destroyVerified,
      detail: destroyVerified ? "Destroy evidence was recorded." : "Destroy evidence is still required.",
    },
  ];

  return {
    id: `vm-lifecycle-proof-${gate.environmentName}-${Date.now()}`,
    gateId: gate.id,
    environmentName: gate.environmentName,
    status: checks.every((check) => check.passed) ? "Verified" : "Blocked",
    rollbackVerified,
    destroyVerified,
    checks,
    evidence: [
      ...(input.evidence ?? []),
      `Lifecycle proof recorded by ${actor}; live provisioning remains disabled in this prototype.`,
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function getActiveLabAuthorizationScope(state: ApiState) {
  const now = Date.now();
  return state.labAuthorizationScopes.find(
    (scope) => labScopeChecks(scope, now).every((check) => check.passed)
  );
}

function labScopeChecks(scope: LabAuthorizationScope, now: number) {
  const expiresAt = new Date(scope.expiresAt).getTime();
  return [
    {
      name: "Authorization approved",
      passed: scope.status === "Approved" && expiresAt > now,
      detail:
        scope.status === "Approved" && expiresAt > now
          ? `Approved by ${scope.approver} until ${scope.expiresAt}.`
          : "Scope is expired or not approved.",
    },
    {
      name: "Pentest scope structured",
      passed: scope.pentestScopeStructurallyValid && Boolean(scope.pentestScopeReference),
      detail: scope.pentestScopeStructurallyValid
        ? scope.pentestScopeReference
        : "Pentest authorization reference must be structurally valid.",
    },
    {
      name: "Target endpoints documented",
      passed: scope.targetEndpoints.length > 0,
      detail: scope.targetEndpoints.length > 0 ? scope.targetEndpoints.join(", ") : "At least one target endpoint reference is required.",
    },
    {
      name: "Provider coverage documented",
      passed: scope.providerCoverage.length > 0,
      detail: scope.providerCoverage.length > 0 ? scope.providerCoverage.join(", ") : "At least one provider must be covered.",
    },
    {
      name: "Allowed and excluded actions documented",
      passed: scope.allowedActions.length > 0 && scope.excludedActions.length > 0,
      detail:
        scope.allowedActions.length > 0 && scope.excludedActions.length > 0
          ? `${scope.allowedActions.length} allowed / ${scope.excludedActions.length} excluded.`
          : "Allowed and excluded action lists are required.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(scope.rollbackOwner),
      detail: scope.rollbackOwner ? `${scope.rollbackOwner} owns rollback and stop conditions.` : "Rollback owner is required.",
    },
    {
      name: "Evidence references documented",
      passed: scope.evidenceReferences.length > 0,
      detail:
        scope.evidenceReferences.length > 0
          ? scope.evidenceReferences.join(", ")
          : "Evidence references are required; do not store access material in the scope record.",
    },
  ];
}
