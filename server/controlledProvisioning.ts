import type { ControlledProvisioningDecision, ControlledProvisioningGate, VmSandboxDryRunPlan } from "../src/data/cloudStudioDomain";
import type { ApiState, CreateControlledProvisioningGateRequest } from "./types";
import { getActiveLabAuthorizationScope } from "./authorizationEvidence";
import { getReadyRollbackDestroyProof } from "./rollbackDestroyProof";

export class ControlledProvisioningError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledProvisioningGate(
  state: ApiState,
  input: CreateControlledProvisioningGateRequest,
  actor: string
): ControlledProvisioningGate {
  const dryRun = findDryRunPlan(state, input);
  const existing = state.controlledProvisioningGates.find((item) => item.dryRunPlanId === dryRun.id);
  const activeScope = getActiveLabAuthorizationScope(state);
  const now = new Date().toISOString();
  const base: ControlledProvisioningGate =
    existing ??
    {
      id: `vm-controlled-${dryRun.environmentName}-${Date.now()}`,
      dryRunPlanId: dryRun.id,
      environmentName: dryRun.environmentName,
      owner: dryRun.owner,
      requestedBy: actor,
      status: "Blocked",
      approval: {
        status: "Pending",
        evidence: "Manual platform approval required before any controlled create can be considered.",
      },
      pentestScope: {
        required: true,
        present: Boolean(input.pentestScopeReference ?? activeScope?.pentestScopeReference),
        reference: input.pentestScopeReference ?? activeScope?.pentestScopeReference ?? "No authorized lab scope file attached.",
        structurallyValid: Boolean(input.pentestScopeStructurallyValid ?? activeScope?.pentestScopeStructurallyValid),
      },
      checks: [],
      rollbackPlan: dryRun.rollbackPlan,
      destroyPlan: [
        "Confirm target VM name and categories before any future create call.",
        "Queue destroy workflow before power-on so rollback ownership is explicit.",
        "Verify Prism inventory no longer reports the VM before closing the job.",
      ],
      mutationKillSwitch: process.env.NDC_CONTROLLED_PROVISIONING_ENABLED === "true",
      provisioningEnabled: false,
      createdAt: now,
      updatedAt: now,
    };

  return evaluateGate(
    {
      ...base,
      pentestScope: {
        ...base.pentestScope,
        present: Boolean(input.pentestScopeReference ?? activeScope?.pentestScopeReference) || base.pentestScope.present,
        reference: input.pentestScopeReference ?? activeScope?.pentestScopeReference ?? base.pentestScope.reference,
        structurallyValid:
          Boolean(input.pentestScopeStructurallyValid ?? activeScope?.pentestScopeStructurallyValid) ||
          base.pentestScope.structurallyValid,
      },
      mutationKillSwitch: process.env.NDC_CONTROLLED_PROVISIONING_ENABLED === "true",
      updatedAt: now,
    },
    dryRun,
    state
  );
}

export function decideControlledProvisioningGate(
  state: ApiState,
  gateId: string,
  decision: ControlledProvisioningDecision,
  actor: string,
  evidence = "Manual platform decision recorded."
): ControlledProvisioningGate {
  const existing = state.controlledProvisioningGates.find((item) => item.id === gateId);
  if (!existing) {
    throw new ControlledProvisioningError("controlled_gate_not_found", "Controlled provisioning gate was not found.");
  }

  const dryRun = state.vmSandboxDryRuns.find((item) => item.id === existing.dryRunPlanId);
  if (!dryRun) {
    throw new ControlledProvisioningError("dry_run_not_found", "The gate dry-run plan was not found.");
  }

  const updated: ControlledProvisioningGate = {
    ...existing,
    approval: {
      status: decision === "approve" ? "Approved" : "Rejected",
      decidedBy: actor,
      decidedAt: new Date().toISOString(),
      evidence,
    },
    updatedAt: new Date().toISOString(),
  };

  return evaluateGate(updated, dryRun, state);
}

function findDryRunPlan(state: ApiState, input: CreateControlledProvisioningGateRequest) {
  const plan =
    (input.dryRunPlanId ? state.vmSandboxDryRuns.find((item) => item.id === input.dryRunPlanId) : undefined) ??
    (input.environmentName
      ? state.vmSandboxDryRuns.find((item) => item.environmentName === input.environmentName)
      : state.vmSandboxDryRuns[0]);

  if (!plan) {
    throw new ControlledProvisioningError("dry_run_required", "Create a VM sandbox dry-run before requesting controlled provisioning.");
  }

  return plan;
}

function evaluateGate(gate: ControlledProvisioningGate, dryRun: VmSandboxDryRunPlan, state?: ApiState): ControlledProvisioningGate {
  const dryRunPassed = dryRun.validations.every((validation) => validation.passed);
  const rollbackDestroyProof = state ? getReadyRollbackDestroyProof(state, dryRun.id) : undefined;
  const rollbackReady = dryRun.rollbackPlan.length > 0 && Boolean(rollbackDestroyProof);
  const destroyReady = gate.destroyPlan.length > 0 && Boolean(rollbackDestroyProof);
  const approvalReady = gate.approval.status === "Approved";
  const scopeReady = gate.pentestScope.present && gate.pentestScope.structurallyValid;

  const checks = [
    {
      name: "Dry-run validations passed",
      passed: dryRunPassed,
      detail: dryRunPassed ? "All VM sandbox dry-run validations passed." : "One or more dry-run validations failed.",
    },
    {
      name: "Rollback plan ready",
      passed: rollbackReady,
      detail: rollbackReady ? `Rollback/destroy proof ${rollbackDestroyProof?.id} is ready.` : "Rollback/destroy proof is required.",
    },
    {
      name: "Destroy plan ready",
      passed: destroyReady,
      detail: destroyReady ? `Destroy proof ${rollbackDestroyProof?.id} is ready.` : "Destroy proof is required.",
    },
    {
      name: "Manual approval recorded",
      passed: approvalReady,
      detail: approvalReady ? gate.approval.evidence : "A platform approver must approve this gate.",
    },
    {
      name: "Authorized scope attached",
      passed: scopeReady,
      detail: scopeReady ? gate.pentestScope.reference : "Authorized lab scope remains required.",
    },
    {
      name: "Mutation kill switch enabled",
      passed: gate.mutationKillSwitch,
      detail: gate.mutationKillSwitch
        ? "Kill switch is enabled, but this release still does not include a live AHV create adapter."
        : "Kill switch is disabled by default.",
    },
  ];

  const status = getStatus({ dryRunPassed, rollbackReady, destroyReady, approvalReady, scopeReady, gate });

  return {
    ...gate,
    status,
    checks,
    provisioningEnabled: false,
  };
}

function getStatus({
  dryRunPassed,
  rollbackReady,
  destroyReady,
  approvalReady,
  scopeReady,
  gate,
}: {
  dryRunPassed: boolean;
  rollbackReady: boolean;
  destroyReady: boolean;
  approvalReady: boolean;
  scopeReady: boolean;
  gate: ControlledProvisioningGate;
}): ControlledProvisioningGate["status"] {
  if (!dryRunPassed || !rollbackReady || !destroyReady || gate.approval.status === "Rejected") {
    return "Blocked";
  }

  if (!approvalReady) {
    return "Manual approval required";
  }

  if (!scopeReady || !gate.mutationKillSwitch) {
    return "Mutation disabled";
  }

  return "Approved for controlled create";
}
