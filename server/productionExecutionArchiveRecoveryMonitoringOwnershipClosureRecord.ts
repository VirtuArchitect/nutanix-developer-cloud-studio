import type {
  ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord,
  ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord,
} from "../src/data/cloudStudioDomain";
import type {
  ApiState,
  CreateProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordRequest,
} from "./types";

export class ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord {
  const supportOwnershipAcceptanceRecord = findSupportOwnershipAcceptanceRecord(state, request);
  const providerSlug = supportOwnershipAcceptanceRecord.provider.toLowerCase();
  const monitoringOwner = request.monitoringOwner?.trim() ?? "Production Archive Recovery Monitoring Owner";
  const alertOwnershipTransferReference =
    request.alertOwnershipTransferReference?.trim() ??
    `production-archive-recovery-monitoring-ownership-alert-transfer-${providerSlug}.md`;
  const dashboardAcceptanceReference =
    request.dashboardAcceptanceReference?.trim() ??
    `production-archive-recovery-monitoring-ownership-dashboard-acceptance-${providerSlug}.md`;
  const escalationMonitoringValidationReference =
    request.escalationMonitoringValidationReference?.trim() ??
    `production-archive-recovery-monitoring-ownership-escalation-validation-${providerSlug}.md`;
  const monitoringOwnershipClosureSignOffReference =
    request.monitoringOwnershipClosureSignOffReference?.trim() ??
    `production-archive-recovery-monitoring-ownership-closure-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Support ownership acceptance ready",
      passed:
        supportOwnershipAcceptanceRecord.status ===
        "Ready for production execution archive recovery support ownership acceptance review",
      detail: `${supportOwnershipAcceptanceRecord.id} is ${supportOwnershipAcceptanceRecord.status}.`,
    },
    {
      name: "Monitoring owner assigned",
      passed: Boolean(monitoringOwner),
      detail: monitoringOwner || "Monitoring owner is required.",
    },
    {
      name: "Alert ownership transfer linked",
      passed: Boolean(alertOwnershipTransferReference),
      detail: alertOwnershipTransferReference || "Alert ownership transfer reference is required.",
    },
    {
      name: "Dashboard acceptance linked",
      passed: Boolean(dashboardAcceptanceReference),
      detail: dashboardAcceptanceReference || "Dashboard acceptance reference is required.",
    },
    {
      name: "Escalation monitoring validation linked",
      passed: Boolean(escalationMonitoringValidationReference),
      detail: escalationMonitoringValidationReference || "Escalation monitoring validation reference is required.",
    },
    {
      name: "Monitoring ownership closure sign-off linked",
      passed: Boolean(monitoringOwnershipClosureSignOffReference),
      detail:
        monitoringOwnershipClosureSignOffReference ||
        "Monitoring ownership closure sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        supportOwnershipAcceptanceRecord.provisioningEnabled === false &&
        supportOwnershipAcceptanceRecord.killSwitch.enabled === false,
      detail: `${supportOwnershipAcceptanceRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    ...supportOwnershipAcceptanceRecord,
    id: `production-execution-archive-recovery-monitoring-ownership-closure-record-${providerSlug}-${Date.now()}`,
    supportOwnershipAcceptanceRecordId: supportOwnershipAcceptanceRecord.id,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery monitoring ownership closure review"
      : "Blocked",
    requestedBy: actor,
    monitoringOwner,
    alertOwnershipTransferReference,
    dashboardAcceptanceReference,
    escalationMonitoringValidationReference,
    monitoringOwnershipClosureSignOffReference,
    checks,
    evidence: [
      `Support ownership acceptance record: ${supportOwnershipAcceptanceRecord.id}.`,
      `Service management handoff record: ${supportOwnershipAcceptanceRecord.serviceManagementHandoffRecordId}.`,
      `Monitoring owner: ${monitoringOwner || "missing"}.`,
      `Alert ownership transfer: ${alertOwnershipTransferReference || "missing"}.`,
      `Dashboard acceptance: ${dashboardAcceptanceReference || "missing"}.`,
      `Escalation monitoring validation: ${escalationMonitoringValidationReference || "missing"}.`,
      `Monitoring ownership closure sign-off: ${monitoringOwnershipClosureSignOffReference || "missing"}.`,
      `Kill switch: ${supportOwnershipAcceptanceRecord.killSwitch.name}=${
        supportOwnershipAcceptanceRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findSupportOwnershipAcceptanceRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordRequest
): ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord {
  const supportOwnershipAcceptanceRecord =
    (request.supportOwnershipAcceptanceRecordId
      ? state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords.find(
          (item) => item.id === request.supportOwnershipAcceptanceRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords[0]);

  if (!supportOwnershipAcceptanceRecord) {
    throw new ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordError(
      "production_execution_archive_recovery_support_ownership_acceptance_record_required",
      "A production execution archive recovery support ownership acceptance record is required."
    );
  }

  return supportOwnershipAcceptanceRecord;
}
