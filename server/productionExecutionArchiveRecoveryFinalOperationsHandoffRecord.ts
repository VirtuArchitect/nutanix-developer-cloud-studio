import type {
  ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord,
  ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord,
} from "../src/data/cloudStudioDomain";
import type {
  ApiState,
  CreateProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordRequest,
} from "./types";

export class ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordRequest,
  actor: string
): ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord {
  const monitoringOwnershipClosureRecord = findMonitoringOwnershipClosureRecord(state, request);
  const providerSlug = monitoringOwnershipClosureRecord.provider.toLowerCase();
  const finalOperationsOwner = request.finalOperationsOwner?.trim() ?? "Production Archive Recovery Final Operations Owner";
  const runbookPublicationReference =
    request.runbookPublicationReference?.trim() ??
    `production-archive-recovery-final-operations-runbook-publication-${providerSlug}.md`;
  const onCallScheduleHandoffReference =
    request.onCallScheduleHandoffReference?.trim() ??
    `production-archive-recovery-final-operations-on-call-handoff-${providerSlug}.md`;
  const monitoringClosureAcceptanceReference =
    request.monitoringClosureAcceptanceReference?.trim() ??
    `production-archive-recovery-final-operations-monitoring-closure-acceptance-${providerSlug}.md`;
  const operationsHandoffSignOffReference =
    request.operationsHandoffSignOffReference?.trim() ??
    `production-archive-recovery-final-operations-handoff-signoff-${providerSlug}.md`;

  const checks = [
    {
      name: "Monitoring ownership closure ready",
      passed:
        monitoringOwnershipClosureRecord.status ===
        "Ready for production execution archive recovery monitoring ownership closure review",
      detail: `${monitoringOwnershipClosureRecord.id} is ${monitoringOwnershipClosureRecord.status}.`,
    },
    {
      name: "Final operations owner assigned",
      passed: Boolean(finalOperationsOwner),
      detail: finalOperationsOwner || "Final operations owner is required.",
    },
    {
      name: "Runbook publication linked",
      passed: Boolean(runbookPublicationReference),
      detail: runbookPublicationReference || "Runbook publication reference is required.",
    },
    {
      name: "On-call schedule handoff linked",
      passed: Boolean(onCallScheduleHandoffReference),
      detail: onCallScheduleHandoffReference || "On-call schedule handoff reference is required.",
    },
    {
      name: "Monitoring closure acceptance linked",
      passed: Boolean(monitoringClosureAcceptanceReference),
      detail: monitoringClosureAcceptanceReference || "Monitoring closure acceptance reference is required.",
    },
    {
      name: "Operations handoff sign-off linked",
      passed: Boolean(operationsHandoffSignOffReference),
      detail: operationsHandoffSignOffReference || "Operations handoff sign-off reference is required.",
    },
    {
      name: "Prototype does not execute adapter",
      passed:
        monitoringOwnershipClosureRecord.provisioningEnabled === false &&
        monitoringOwnershipClosureRecord.killSwitch.enabled === false,
      detail: `${monitoringOwnershipClosureRecord.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    ...monitoringOwnershipClosureRecord,
    id: `production-execution-archive-recovery-final-operations-handoff-record-${providerSlug}-${Date.now()}`,
    monitoringOwnershipClosureRecordId: monitoringOwnershipClosureRecord.id,
    status: checks.every((check) => check.passed)
      ? "Ready for production execution archive recovery final operations handoff review"
      : "Blocked",
    requestedBy: actor,
    finalOperationsOwner,
    runbookPublicationReference,
    onCallScheduleHandoffReference,
    monitoringClosureAcceptanceReference,
    operationsHandoffSignOffReference,
    checks,
    evidence: [
      `Monitoring ownership closure record: ${monitoringOwnershipClosureRecord.id}.`,
      `Support ownership acceptance record: ${monitoringOwnershipClosureRecord.supportOwnershipAcceptanceRecordId}.`,
      `Final operations owner: ${finalOperationsOwner || "missing"}.`,
      `Runbook publication: ${runbookPublicationReference || "missing"}.`,
      `On-call schedule handoff: ${onCallScheduleHandoffReference || "missing"}.`,
      `Monitoring closure acceptance: ${monitoringClosureAcceptanceReference || "missing"}.`,
      `Operations handoff sign-off: ${operationsHandoffSignOffReference || "missing"}.`,
      `Kill switch: ${monitoringOwnershipClosureRecord.killSwitch.name}=${
        monitoringOwnershipClosureRecord.killSwitch.enabled ? "enabled" : "disabled"
      }.`,
    ],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findMonitoringOwnershipClosureRecord(
  state: ApiState,
  request: CreateProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordRequest
): ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord {
  const monitoringOwnershipClosureRecord =
    (request.monitoringOwnershipClosureRecordId
      ? state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords.find(
          (item) => item.id === request.monitoringOwnershipClosureRecordId
        )
      : undefined) ??
    (request.provider
      ? state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords.find(
          (item) => item.provider === request.provider
        )
      : state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords[0]);

  if (!monitoringOwnershipClosureRecord) {
    throw new ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordError(
      "production_execution_archive_recovery_monitoring_ownership_closure_record_required",
      "A production execution archive recovery monitoring ownership closure record is required."
    );
  }

  return monitoringOwnershipClosureRecord;
}
