import type { LabAuthorizationScope, VmLifecycleProof } from "../src/data/cloudStudioDomain";
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
    name: (input.name ?? "Berlin AHV controlled provisioning lab").trim(),
    owner: (input.owner ?? actor).trim(),
    approver: (input.approver ?? actor).trim(),
    approvedAt,
    expiresAt,
    project: (input.project ?? state.platformConfig.defaultProject).trim(),
    cluster: (input.cluster ?? state.platformConfig.defaultCluster).trim(),
    network: (input.network ?? state.platformConfig.networkProfile).trim(),
    allowedActions: input.allowedActions ?? ["dry_run", "controlled_create_observation", "rollback_validation", "destroy_validation"],
    excludedActions: input.excludedActions ?? ["unscoped_create", "bulk_delete", "network_change", "image_delete", "production_workload_change"],
    pentestScopeReference: (input.pentestScopeReference ?? "PENTEST_SCOPE_TEMPLATE.md / approved lab scope pending").trim(),
    pentestScopeStructurallyValid: Boolean(input.pentestScopeStructurallyValid),
    status: new Date(expiresAt).getTime() > now.getTime() ? "Approved" : "Expired",
    createdAt: now.toISOString(),
  };

  if (!scope.project || !scope.cluster || !scope.network) {
    throw new AuthorizationEvidenceError("lab_scope_invalid", "Project, cluster, and network are required.");
  }

  return scope;
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
    (scope) => scope.status === "Approved" && scope.pentestScopeStructurallyValid && new Date(scope.expiresAt).getTime() > now
  );
}
