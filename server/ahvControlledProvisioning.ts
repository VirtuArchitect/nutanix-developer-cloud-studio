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
      const selectedScope = getApprovedInventoryScope(state, input);
      const adapterEnabled = process.env.NDC_AHV_REAL_ADAPTER_ENABLED === "true";
      const createSwitchEnabled = process.env.NDC_CONTROLLED_PROVISIONING_ENABLED === "true";
      const now = new Date().toISOString();
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
          name: "Approved Prism scope selected",
          passed: Boolean(selectedScope),
          detail: selectedScope
            ? `${selectedScope.cluster.name} / ${selectedScope.network.name} / ${selectedScope.image?.name ?? selectedScope.sourceVm?.name}`
            : "Select approved cluster, network, and either image or source VM inventory records before controlled create.",
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
        selectedScope,
        lifecycleEvents: [
          {
            at: now,
            action: "Notice",
            status: ready ? "Ready but disabled" : "Preflight blocked",
            detail: ready
              ? "Controlled create gates passed, but the real adapter remains disabled."
              : "Controlled create preflight recorded without Prism mutation.",
          },
        ],
        mutationOperationsBlocked: ["create_vm", "clone_vm", "power_on", "power_off", "delete_vm", "update_network", "update_category"],
        provisioningEnabled: false,
        createdAt: now,
      };
    },
  };
}

export function requireApprovedInventoryScope(
  state: ApiState,
  input: CreateAhvControlledProvisioningRunRequest
): NonNullable<AhvControlledProvisioningRun["selectedScope"]> {
  const selectedScope = getApprovedInventoryScope(state, input);
  if (!selectedScope) {
    throw new AhvControlledProvisioningError(
      "approved_prism_scope_required",
      "Approved Prism cluster, network, and image or source VM inventory records are required before controlled AHV create."
    );
  }
  return selectedScope;
}

function getApprovedInventoryScope(
  state: ApiState,
  input: CreateAhvControlledProvisioningRunRequest
): AhvControlledProvisioningRun["selectedScope"] | undefined {
  const cluster = findApprovedScopeRecord(state, input.clusterRecordId, "Cluster");
  const network = findApprovedScopeRecord(state, input.networkRecordId, "Network");
  const image = findApprovedScopeRecord(state, input.imageRecordId, "Image");
  const sourceVm = findApprovedScopeRecord(state, input.sourceVmRecordId, "VM");
  if (!cluster || !network || (!image && !sourceVm)) {
    return undefined;
  }

  return {
    cluster: scopeRecordSummary(cluster),
    network: scopeRecordSummary(network),
    ...(image ? { image: scopeRecordSummary(image) } : {}),
    ...(sourceVm ? { sourceVm: scopeRecordSummary(sourceVm) } : {}),
  };
}

function findApprovedScopeRecord(state: ApiState, id: string | undefined, kind: "Cluster" | "Network" | "Image" | "VM") {
  return state.prismInventory.find((record) => record.id === id && record.kind === kind && record.approvalStatus === "Approved");
}

function scopeRecordSummary(record: NonNullable<ReturnType<typeof findApprovedScopeRecord>>) {
  return {
    recordId: record.id,
    name: record.name,
    rawRef: record.rawRef,
    approvedBy: record.approvedBy,
    approvedAt: record.approvedAt,
  };
}
