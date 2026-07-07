import type { ControlledCreateAuthorizationEnvelope } from "../src/data/cloudStudioDomain";
import { getActiveLabAuthorizationScope } from "./authorizationEvidence";
import { getReadyRollbackDestroyProof } from "./rollbackDestroyProof";
import type { ApiState } from "./types";

export class ControlledCreateAuthorizationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledCreateAuthorizationEnvelope(
  state: ApiState,
  actor: string
): ControlledCreateAuthorizationEnvelope {
  const gate = state.controlledProvisioningGates[0];
  if (!gate) {
    throw new ControlledCreateAuthorizationError(
      "controlled_gate_required",
      "Controlled gate is required before authorization envelope review."
    );
  }

  const dryRun = state.vmSandboxDryRuns.find((item) => item.id === gate.dryRunPlanId);
  if (!dryRun) {
    throw new ControlledCreateAuthorizationError("dry_run_not_found", "The gate dry-run plan was not found.");
  }

  const activeScope = getActiveLabAuthorizationScope(state);
  const rollbackProof = getReadyRollbackDestroyProof(state, dryRun.id);
  const lifecycleProof = state.vmLifecycleProofs.find((proof) => proof.gateId === gate.id && proof.status === "Verified");
  const adapterEnablement = state.adapterEnablementRecords.find((record) => record.provider === "NCI" && record.status === "Ready for review");
  const auditExport = state.auditExports[0];
  const pentestScopeRef = process.env.NDC_AUTHORIZED_PENTEST_SCOPE_REF ?? "";
  const pentestScopeActive = Boolean(pentestScopeRef && process.env.NDC_AUTHORIZED_PENTEST_SCOPE_ACTIVE === "true");
  const mutationSwitchEnabled = process.env.NDC_CONTROLLED_PROVISIONING_ENABLED === "true";
  const realAdapterEnabled = process.env.NDC_AHV_REAL_ADAPTER_ENABLED === "true";
  const checks = [
    {
      name: "Lab scope active",
      passed: Boolean(activeScope),
      detail: activeScope ? `${activeScope.id} / ${activeScope.providerCoverage.join(", ")}` : "Active lab scope is required.",
    },
    {
      name: "Rollback destroy proof ready",
      passed: Boolean(rollbackProof),
      detail: rollbackProof ? rollbackProof.id : "Rollback/destroy proof must be ready.",
    },
    {
      name: "Controlled gate approved",
      passed: gate.status === "Approved for controlled create",
      detail: `Gate status is ${gate.status}.`,
    },
    {
      name: "Lifecycle proof verified",
      passed: Boolean(lifecycleProof),
      detail: lifecycleProof ? lifecycleProof.id : "Verified lifecycle proof is required.",
    },
    {
      name: "Adapter enablement ready",
      passed: Boolean(adapterEnablement),
      detail: adapterEnablement ? adapterEnablement.id : "NCI adapter enablement review must be ready.",
    },
    {
      name: "Audit export ready",
      passed: Boolean(auditExport),
      detail: auditExport ? auditExport.id : "Audit export must be prepared.",
    },
    {
      name: "Active pentest scope",
      passed: pentestScopeActive,
      detail: pentestScopeActive
        ? pentestScopeRef
        : "Active authorized pentest scope is required before live adapter authorization.",
    },
    {
      name: "Real mutation remains disabled",
      passed: !mutationSwitchEnabled && !realAdapterEnabled,
      detail:
        !mutationSwitchEnabled && !realAdapterEnabled
          ? "Controlled create switch and AHV real adapter are disabled."
          : "This phase must not enable live mutation switches.",
    },
  ];

  return {
    id: `controlled-create-auth-${dryRun.environmentName}-${Date.now()}`,
    status: checks.every((check) => check.passed) ? "Ready for authorization review" : "Blocked",
    requestedBy: actor,
    environmentName: dryRun.environmentName,
    dryRunPlanId: dryRun.id,
    gateId: gate.id,
    checks,
    evidence: [
      `Lab scope: ${activeScope?.id ?? "missing"}.`,
      `Rollback/destroy proof: ${rollbackProof?.id ?? "missing"}.`,
      `Lifecycle proof: ${lifecycleProof?.id ?? "missing"}.`,
      `Adapter enablement: ${adapterEnablement?.id ?? "missing"}.`,
      `Audit export: ${auditExport?.id ?? "missing"}.`,
      `Pentest scope: ${pentestScopeActive ? pentestScopeRef : "missing"}.`,
    ],
    allowedCreateFields: ["name", "project", "cluster", "network", "imageProfileId", "cpu", "memoryGb", "diskGb", "category", "owner"],
    killSwitch: {
      name: "NDC_CONTROLLED_PROVISIONING_ENABLED",
      enabled: mutationSwitchEnabled,
    },
    emergencyStopProcedure: [
      "Disable NDC_CONTROLLED_PROVISIONING_ENABLED before any further review.",
      "Keep NDC_AHV_REAL_ADAPTER_ENABLED disabled until approved adapter implementation is present.",
      "Notify rollback owner and preserve audit export evidence.",
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}
