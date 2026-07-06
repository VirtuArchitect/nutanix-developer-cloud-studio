import type {
  AuditExportRecord,
  LifecycleOperationKind,
  LifecycleOperationRecord,
} from "../src/data/cloudStudioDomain";
import type { ApiState } from "./types";

export class PrivateCloudOperationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const lifecycleRunbooks: Record<LifecycleOperationKind, string[]> = {
  Extend: [
    "Confirm owner, cost center, and requested extension window.",
    "Verify expiry policy exception is approved before extending lifecycle metadata.",
    "Record audit evidence and notify the environment owner.",
  ],
  Suspend: [
    "Confirm no active production dependency is mapped to this environment.",
    "Stop workload access through the approved platform mechanism.",
    "Record owner notification and recovery instructions.",
  ],
  Destroy: [
    "Confirm backup, rollback, and evidence export requirements are complete.",
    "Run provider-specific destroy preflight before any real mutation adapter is enabled.",
    "Record post-destroy inventory reconciliation evidence.",
  ],
  Rebuild: [
    "Confirm the published image/profile version and owner approval.",
    "Capture current configuration evidence before scheduling rebuild.",
    "Require rollback plan and controlled adapter approval before real execution.",
  ],
};

export function createLifecycleOperationRecord(
  state: ApiState,
  request: { environmentName?: string; operation?: LifecycleOperationKind },
  actor: string
): LifecycleOperationRecord {
  const environment = state.environments.find((item) => item.name === request.environmentName);
  if (!environment) {
    throw new PrivateCloudOperationError(
      "environment_not_found",
      `Environment not found: ${request.environmentName ?? "missing"}`
    );
  }

  const operation = request.operation ?? "Extend";
  const latestReadiness = state.productionReadinessReviews[0];
  const approvedGate = state.controlledProvisioningGates.some(
    (gate) => gate.environmentName === environment.name && gate.approval.status === "Approved"
  );
  const lifecycleProof = state.vmLifecycleProofs.some(
    (proof) => proof.environmentName === environment.name && proof.status === "Verified"
  );
  const auditExportReady = state.auditEvents.length > 0;
  const checks = [
    {
      name: "Environment exists",
      passed: true,
      detail: `${environment.name} is tracked in the developer platform inventory.`,
    },
    {
      name: "Production readiness reviewed",
      passed: latestReadiness?.status === "Ready for review",
      detail: latestReadiness
        ? `Latest readiness status is ${latestReadiness.status}.`
        : "Run a production readiness review before operational lifecycle changes.",
    },
    {
      name: "Controlled gate approved",
      passed: approvedGate,
      detail: approvedGate
        ? "A controlled provisioning gate is approved for this environment."
        : "No approved controlled gate is linked to this environment.",
    },
    {
      name: "Lifecycle proof verified",
      passed: lifecycleProof,
      detail: lifecycleProof
        ? "Rollback and destroy proof is verified."
        : "Lifecycle proof must be verified before private-cloud operations promote.",
    },
    {
      name: "Audit export available",
      passed: auditExportReady,
      detail: auditExportReady
        ? "Audit events exist for export and operator review."
        : "No audit events are available yet.",
    },
  ];

  return {
    id: `lifecycle-${environment.name}-${operation.toLowerCase()}-${Date.now()}`,
    environmentName: environment.name,
    operation,
    status: checks.every((check) => check.passed) ? "Queued for operator review" : "Blocked",
    requestedBy: actor,
    checks,
    runbook: lifecycleRunbooks[operation],
    auditEvidence: [
      `Environment status: ${environment.status}.`,
      `Latest production readiness: ${latestReadiness?.status ?? "Not recorded"}.`,
      "Real provider mutation remains disabled until an authorized adapter release.",
    ],
    approvalRequired: true,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createAuditExportRecord(state: ApiState, actor: string): AuditExportRecord {
  const retentionEvents = Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500);
  return {
    id: `audit-export-${Date.now()}`,
    status: "Prepared",
    requestedBy: actor,
    format: "JSONL",
    eventCount: state.auditEvents.length,
    retentionEvents,
    redactionBoundary: "Sensitive credential material is excluded from audit events.",
    storageBoundary: "Export record is metadata only; configure external object storage before production exports.",
    createdAt: new Date().toISOString(),
  };
}
