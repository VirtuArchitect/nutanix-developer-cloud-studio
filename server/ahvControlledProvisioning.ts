import type { AhvControlledProvisioningRun } from "../src/data/cloudStudioDomain";
import type { ApiState, CreateAhvControlledProvisioningRunRequest } from "./types";
import { getActiveLabAuthorizationScope } from "./authorizationEvidence";

export class AhvControlledProvisioningError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export interface AhvControlledProvisioningAdapter {
  readonly mode: AhvControlledProvisioningRun["adapterMode"];
  preflight(state: ApiState, input: CreateAhvControlledProvisioningRunRequest, actor: string): AhvControlledProvisioningRun;
}

export function createDisabledAhvControlledProvisioningAdapter(): AhvControlledProvisioningAdapter {
  return {
    mode: "Disabled real adapter",
    preflight(state, input, actor) {
      const gate = input.gateId
        ? state.controlledProvisioningGates.find((item) => item.id === input.gateId)
        : state.controlledProvisioningGates[0];
      if (!gate) {
        throw new AhvControlledProvisioningError("controlled_gate_required", "A controlled provisioning gate is required.");
      }

      const dryRun = state.vmSandboxDryRuns.find((item) => item.id === gate.dryRunPlanId);
      if (!dryRun) {
        throw new AhvControlledProvisioningError("dry_run_not_found", "The gate dry-run plan was not found.");
      }

      const scope = getActiveLabAuthorizationScope(state);
      const lifecycleProof = state.vmLifecycleProofs.find((proof) => proof.gateId === gate.id && proof.status === "Verified");
      const adapterEnabled = process.env.NDC_AHV_REAL_ADAPTER_ENABLED === "true";
      const createSwitchEnabled = process.env.NDC_CONTROLLED_PROVISIONING_ENABLED === "true";
      const checks = [
        {
          name: "Controlled gate approved",
          passed: gate.status === "Approved for controlled create",
          detail:
            gate.status === "Approved for controlled create"
              ? "Controlled gate is approved."
              : `Gate status is ${gate.status}.`,
        },
        {
          name: "Lab scope active",
          passed: Boolean(scope),
          detail: scope ? `${scope.project} / ${scope.cluster} / ${scope.network}` : "Active lab authorization scope is required.",
        },
        {
          name: "Lifecycle proof verified",
          passed: Boolean(lifecycleProof),
          detail: lifecycleProof ? "Rollback and destroy proof is verified." : "Verified lifecycle proof is required.",
        },
        {
          name: "Create switch enabled",
          passed: createSwitchEnabled,
          detail: createSwitchEnabled ? "Controlled create switch is enabled." : "Controlled create switch is disabled.",
        },
        {
          name: "AHV adapter enabled",
          passed: adapterEnabled,
          detail: adapterEnabled ? "AHV adapter is enabled." : "AHV real adapter remains disabled.",
        },
      ];
      const ready = checks.every((check) => check.passed);

      return {
        id: `ahv-run-${gate.environmentName}-${Date.now()}`,
        gateId: gate.id,
        dryRunPlanId: dryRun.id,
        environmentName: gate.environmentName,
        action: input.action ?? "Create VM",
        adapterMode: "Disabled real adapter",
        status: ready ? "Ready but disabled" : "Preflight blocked",
        checks,
        requestedBy: actor,
        labScopeId: scope?.id,
        lifecycleProofId: lifecycleProof?.id,
        mutationOperationsBlocked: ["create_vm", "clone_vm", "power_on", "power_off", "delete_vm", "update_network", "update_category"],
        provisioningEnabled: false,
        createdAt: new Date().toISOString(),
      };
    },
  };
}
