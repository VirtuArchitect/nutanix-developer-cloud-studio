import type { RollbackDestroyProofRecord } from "../src/data/cloudStudioDomain";
import { getActiveLabAuthorizationScope } from "./authorizationEvidence";
import type { ApiState, CreateRollbackDestroyProofRequest } from "./types";

export class RollbackDestroyProofError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createRollbackDestroyProofRecord(
  state: ApiState,
  input: CreateRollbackDestroyProofRequest,
  actor: string
): RollbackDestroyProofRecord {
  const dryRun = input.dryRunPlanId
    ? state.vmSandboxDryRuns.find((item) => item.id === input.dryRunPlanId)
    : state.vmSandboxDryRuns[0];
  if (!dryRun) {
    throw new RollbackDestroyProofError("dry_run_required", "Create a VM sandbox dry-run before rollback/destroy proof.");
  }

  const activeScope = getActiveLabAuthorizationScope(state);
  const rollbackOwner = (input.rollbackOwner ?? activeScope?.rollbackOwner ?? "").trim();
  const teardownOrder = input.teardownOrder ?? [
    "Disable owner access and routes before power state changes.",
    "Power off the VM before deletion.",
    "Delete VM and verify inventory reconciliation.",
  ];
  const stopConditions = input.stopConditions ?? [
    "Stop if owner notification is missing.",
    "Stop if inventory reconciliation fails.",
    "Stop if audit export evidence is unavailable.",
  ];
  const evidenceReferences = input.evidenceReferences ?? [
    input.backupEvidenceReference ?? "",
    input.ownerNotificationReference ?? "",
    input.inventoryReconciliationReference ?? "",
  ].filter(Boolean);
  const auditExportReady = state.auditExports.length > 0;
  const checks = [
    {
      name: "Backup/export evidence referenced",
      passed: Boolean(input.backupEvidenceReference),
      detail: input.backupEvidenceReference ?? "Backup or export evidence reference is required.",
    },
    {
      name: "Owner notification referenced",
      passed: Boolean(input.ownerNotificationReference),
      detail: input.ownerNotificationReference ?? "Owner notification evidence reference is required.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner || "Rollback owner is required.",
    },
    {
      name: "Teardown order documented",
      passed: teardownOrder.length >= 3,
      detail: `${teardownOrder.length} teardown steps documented.`,
    },
    {
      name: "Inventory reconciliation referenced",
      passed: Boolean(input.inventoryReconciliationReference),
      detail: input.inventoryReconciliationReference ?? "Inventory reconciliation evidence reference is required.",
    },
    {
      name: "Audit export ready",
      passed: auditExportReady,
      detail: auditExportReady ? `${state.auditExports.length} audit export record exists.` : "Audit export must be prepared.",
    },
  ];

  return {
    id: `rollback-destroy-${dryRun.environmentName}-${Date.now()}`,
    dryRunPlanId: dryRun.id,
    environmentName: dryRun.environmentName,
    status: checks.every((check) => check.passed) ? "Ready for controlled create" : "Blocked",
    requestedBy: actor,
    rollbackOwner,
    checks,
    teardownOrder,
    stopConditions,
    evidenceReferences,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function getReadyRollbackDestroyProof(state: ApiState, dryRunPlanId: string) {
  return state.rollbackDestroyProofs.find(
    (proof) => proof.dryRunPlanId === dryRunPlanId && proof.status === "Ready for controlled create"
  );
}
