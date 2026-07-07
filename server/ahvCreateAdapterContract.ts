import type {
  AhvCreateAdapterContractReview,
  VmSandboxDryRunPlan,
} from "../src/data/cloudStudioDomain";
import type { ApiState } from "./types";

export class AhvCreateAdapterContractError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export interface AhvCreateAdapterContract {
  validate(state: ApiState): AhvCreateAdapterContractReview;
  mapPayload(dryRun: VmSandboxDryRunPlan): AhvCreateAdapterContractReview["payload"];
  execute(): never;
  poll(): never;
  rollback(): never;
}

export function createDisabledAhvCreateAdapterContract(state: ApiState, actor: string): AhvCreateAdapterContract {
  return {
    validate() {
      const envelope = state.controlledCreateAuthorizationEnvelopes[0];
      if (!envelope) {
        throw new AhvCreateAdapterContractError("authorization_envelope_required", "Authorization envelope is required.");
      }

      const dryRun = state.vmSandboxDryRuns.find((item) => item.id === envelope.dryRunPlanId);
      if (!dryRun) {
        throw new AhvCreateAdapterContractError("dry_run_not_found", "Authorization envelope dry-run was not found.");
      }

      const payload = this.mapPayload(dryRun);
      const disallowedFields = Object.keys(payload).filter((key) => !envelope.allowedCreateFields.includes(key));
      const mutationSwitchEnabled = process.env.NDC_CONTROLLED_PROVISIONING_ENABLED === "true";
      const realAdapterEnabled = process.env.NDC_AHV_REAL_ADAPTER_ENABLED === "true";
      const checks = [
        {
          name: "Authorization envelope approved",
          passed: envelope.status === "Ready for authorization review",
          detail: `Envelope status is ${envelope.status}.`,
        },
        {
          name: "Payload fields approved",
          passed: disallowedFields.length === 0,
          detail:
            disallowedFields.length === 0
              ? "Mapped payload only uses approved create fields."
              : `Disallowed fields: ${disallowedFields.join(", ")}.`,
        },
        {
          name: "Dry-run validations passed",
          passed: dryRun.validations.every((validation) => validation.passed),
          detail: "VM sandbox dry-run validations must pass before payload mapping.",
        },
        {
          name: "Execute path disabled",
          passed: !mutationSwitchEnabled && !realAdapterEnabled,
          detail:
            !mutationSwitchEnabled && !realAdapterEnabled
              ? "Execute, poll, and rollback remain disabled."
              : "Live adapter switches must remain disabled in this phase.",
        },
      ];

      return {
        id: `ahv-create-contract-${dryRun.environmentName}-${Date.now()}`,
        environmentName: dryRun.environmentName,
        dryRunPlanId: dryRun.id,
        adapterMode: "Disabled real adapter",
        status: checks.every((check) => check.passed) ? "Payload ready but execution disabled" : "Blocked",
        requestedBy: actor,
        payload,
        checks,
        blockedOperations: ["create_vm", "clone_vm", "power_on_vm", "poll_task", "rollback_create", "delete_vm"],
        killSwitch: {
          name: "NDC_AHV_REAL_ADAPTER_ENABLED",
          enabled: realAdapterEnabled,
        },
        provisioningEnabled: false,
        createdAt: new Date().toISOString(),
      };
    },
    mapPayload(dryRun) {
      return {
        name: dryRun.environmentName,
        project: dryRun.project,
        cluster: dryRun.cluster,
        network: dryRun.network,
        imageProfileId: dryRun.imageProfileId,
        cpu: dryRun.quota.cpu,
        memoryGb: dryRun.quota.memoryGb,
        diskGb: dryRun.quota.diskGb,
        category: dryRun.category,
        owner: dryRun.owner,
      };
    },
    execute() {
      throw new AhvCreateAdapterContractError("ahv_execute_disabled", "AHV create execution is disabled.");
    },
    poll() {
      throw new AhvCreateAdapterContractError("ahv_poll_disabled", "AHV task polling is disabled.");
    },
    rollback() {
      throw new AhvCreateAdapterContractError("ahv_rollback_disabled", "AHV rollback execution is disabled.");
    },
  };
}
