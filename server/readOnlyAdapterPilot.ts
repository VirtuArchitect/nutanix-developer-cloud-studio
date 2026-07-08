import type {
  LabPilotOperatorConsole,
  LiveReadOnlyInventoryPilotRecord,
  PrismInventoryKind,
  PrismReadOnlyOperation,
  ReadOnlyAdapterObservabilityRecord,
  ReadOnlyAdapterRuntimeModeRecord,
  ProductionReadinessDecisionGate,
} from "../src/data/cloudStudioDomain";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";
import type {
  ApiState,
  CreateLiveReadOnlyInventoryPilotRequest,
  CreateProductionReadinessDecisionGateRequest,
  CreateReadOnlyAdapterObservabilityRequest,
  SetReadOnlyAdapterRuntimeModeRequest,
} from "./types";

const readOnlyOperations: PrismReadOnlyOperation[] = [
  "listClusters",
  "listProjects",
  "listImages",
  "listSubnets",
  "listCategories",
  "listVms",
];

export class ReadOnlyAdapterPilotError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function setReadOnlyAdapterRuntimeMode(
  state: ApiState,
  request: SetReadOnlyAdapterRuntimeModeRequest,
  actor: string
): ReadOnlyAdapterRuntimeModeRecord {
  const requestedMode = request.mode ?? "fixture-replay";
  const latestAuthorization = findLatestOrById(state.readOnlyAdapterAuthorizationGates, request.authorizationGateId);
  const latestWorkflow = findLatestOrById(state.labPilotRunbookWorkflows, request.runbookWorkflowId);
  const latestEvidence = findLatestOrById(state.operatorEvidenceExportPacks, request.evidenceExportId);
  const latestReplay = state.prismFixtureReplayRecords[0];
  const checks = [
    check("Simulation mode available", true, "Browser/API mock mode remains available as the rollback target."),
    check("Fixture replay passed", requestedMode === "simulated" || latestReplay?.status === "Passed", latestReplay ? `Replay ${latestReplay.id} is ${latestReplay.status}.` : "No fixture replay found."),
    check(
      "Authorization gate ready",
      requestedMode !== "authorized-read-only-lab" || latestAuthorization?.status === "Ready for future live read-only review",
      latestAuthorization ? `Gate ${latestAuthorization.id} is ${latestAuthorization.status}.` : "No authorization gate found."
    ),
    check(
      "Lab pilot runbook closed",
      requestedMode !== "authorized-read-only-lab" || latestWorkflow?.status === "Closed",
      latestWorkflow ? `Workflow ${latestWorkflow.id} is ${latestWorkflow.status}.` : "No closed runbook workflow found."
    ),
    check(
      "Evidence pack prepared",
      requestedMode !== "authorized-read-only-lab" || latestEvidence?.status === "Prepared",
      latestEvidence ? `Evidence pack ${latestEvidence.id} is ${latestEvidence.status}.` : "No evidence export pack found."
    ),
    check("Network calls fail closed", true, "The pilot mode switch records authorization state only; live HTTP calls remain disabled in this prototype."),
  ];
  const allowed = checks.every((item) => item.passed);

  return {
    id: `readonly-runtime-mode-${Date.now()}`,
    requestedBy: actor,
    requestedMode,
    activeMode: allowed ? requestedMode : "simulated",
    status: allowed ? "Active" : "Blocked",
    source:
      requestedMode === "authorized-read-only-lab"
        ? "Authorized lab pilot"
        : requestedMode === "fixture-replay"
          ? "Sanitized fixture replay"
          : "Mock Prism Central",
    checks,
    evidence: [
      `Requested mode: ${requestedMode}.`,
      "Rollback target remains simulated mode.",
      "Real Prism network calls remain disabled until a separately authorized implementation is supplied.",
    ],
    rollbackMode: "simulated",
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createLiveReadOnlyInventoryPilotRecord(
  state: ApiState,
  request: CreateLiveReadOnlyInventoryPilotRequest,
  actor: string
): LiveReadOnlyInventoryPilotRecord {
  const runtimeMode = findLatestOrById(state.readOnlyAdapterRuntimeModeRecords, request.runtimeModeRecordId);
  const authorizationGate = findLatestOrById(state.readOnlyAdapterAuthorizationGates, request.authorizationGateId);
  const runbookWorkflow = findLatestOrById(state.labPilotRunbookWorkflows, request.runbookWorkflowId);
  const latestReplay = state.prismFixtureReplayRecords[0];
  const records = latestReplay?.replayedRecords ?? [];
  const summary = inventorySummary(records.map((record) => record.kind));
  const checks = [
    check("Runtime mode authorized", runtimeMode?.activeMode === "authorized-read-only-lab" && runtimeMode.status === "Active", runtimeMode ? `Mode ${runtimeMode.activeMode} is ${runtimeMode.status}.` : "No runtime mode record found."),
    check("Authorization gate ready", authorizationGate?.status === "Ready for future live read-only review", authorizationGate ? `Gate ${authorizationGate.id} is ${authorizationGate.status}.` : "No authorization gate found."),
    check("Runbook workflow closed", runbookWorkflow?.status === "Closed", runbookWorkflow ? `Workflow ${runbookWorkflow.id} is ${runbookWorkflow.status}.` : "No closed runbook workflow found."),
    check("Sanitized fixture available for comparison", records.length > 0 && latestReplay?.status === "Passed", latestReplay ? `${records.length} sanitized record(s) available.` : "No fixture replay found."),
    check("Mutation boundary enforced", readOnlyMutationOperationsBlocked.length > 0, `${readOnlyMutationOperationsBlocked.length} mutation operation(s) blocked.`),
  ];

  if (!runtimeMode || !authorizationGate || !runbookWorkflow) {
    throw new ReadOnlyAdapterPilotError("readonly_pilot_inputs_missing", "Runtime mode, authorization gate, and runbook workflow evidence are required.");
  }

  return {
    id: `live-readonly-inventory-pilot-${Date.now()}`,
    requestedBy: actor,
    runtimeModeRecordId: runtimeMode.id,
    authorizationGateId: authorizationGate.id,
    runbookWorkflowId: runbookWorkflow.id,
    status: checks.every((item) => item.passed) ? "Completed" : "Blocked",
    adapter: "NCI",
    mode: "Authorized read-only lab pilot",
    operations: readOnlyOperations,
    recordsImported: records.length,
    profileCandidates: records.filter((record) => record.kind === "Image").length,
    inventorySummary: summary,
    checks,
    redactionRules: [
      "Endpoint values remain references.",
      "Credential profile values remain references.",
      "Inventory payload is represented by sanitized records only.",
      "Authorization headers, tokens, and passwords are excluded.",
    ],
    evidence: [
      "Inventory pilot exercised the authorized read-only adapter path with sanitized replay evidence.",
      "This record does not mutate, create, power, clone, resize, or delete Nutanix resources.",
    ],
    mutationOperationsBlocked: readOnlyMutationOperationsBlocked,
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createReadOnlyAdapterObservabilityRecord(
  state: ApiState,
  request: CreateReadOnlyAdapterObservabilityRequest,
  actor: string
): ReadOnlyAdapterObservabilityRecord {
  const runtimeMode = findLatestOrById(state.readOnlyAdapterRuntimeModeRecords, request.runtimeModeRecordId);
  const inventoryPilot = findLatestOrById(state.liveReadOnlyInventoryPilots, request.inventoryPilotId);
  const traces = readOnlyOperations.map((operation, index) => ({
    operation,
    requestId: `readonly-trace-${Date.now()}-${index + 1}`,
    status: inventoryPilot?.status === "Completed" ? ("Observed" as const) : runtimeMode?.status === "Blocked" ? ("Blocked" as const) : ("Simulated" as const),
    latencyMs: 12 + index * 4,
    redacted: true,
  }));

  return {
    id: `readonly-observability-${Date.now()}`,
    requestedBy: actor,
    runtimeModeRecordId: runtimeMode?.id,
    inventoryPilotId: inventoryPilot?.id,
    status: "Prepared",
    traces,
    summary: {
      observedOperations: traces.length,
      blockedMutations: readOnlyMutationOperationsBlocked.length,
      redactedFields: ["endpoint", "credentialProfile", "authorizationHeader", "token"],
      latestStatus: inventoryPilot?.status === "Completed" ? "Healthy" : runtimeMode?.status === "Blocked" ? "Blocked" : "Needs review",
    },
    auditEventCount: state.auditEvents.filter((event) => event.action.includes("readonly") || event.action.includes("read-only")).length,
    evidence: [
      "Adapter traces are redacted before they are presented to operators.",
      "Mutation operations are counted as blocked guardrails, not executable actions.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createLabPilotOperatorConsole(state: ApiState): LabPilotOperatorConsole {
  const runtimeMode = state.readOnlyAdapterRuntimeModeRecords[0];
  const authorizationGate = state.readOnlyAdapterAuthorizationGates[0];
  const workflow = state.labPilotRunbookWorkflows[0];
  const inventoryPilot = state.liveReadOnlyInventoryPilots[0];
  const evidenceExport = state.operatorEvidenceExportPacks[0];
  const readiness = [
    statusLine("Runtime mode", runtimeMode?.status === "Active", runtimeMode ? `${runtimeMode.activeMode} is active.` : "Runtime mode has not been selected."),
    statusLine("Authorization gate", authorizationGate?.status === "Ready for future live read-only review", authorizationGate ? authorizationGate.status : "No authorization gate recorded."),
    statusLine("Runbook workflow", workflow?.status === "Closed", workflow ? workflow.status : "No runbook workflow recorded."),
    statusLine("Inventory pilot", inventoryPilot?.status === "Completed", inventoryPilot ? inventoryPilot.status : "No inventory pilot recorded."),
    statusLine("Observability", state.readOnlyAdapterObservabilityRecords.length > 0, `${state.readOnlyAdapterObservabilityRecords.length} observability record(s).`),
  ];
  const readyCount = readiness.filter((item) => item.status === "Ready").length;

  return {
    id: `lab-pilot-console-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: readyCount === readiness.length ? "Ready for production decision" : readyCount >= 3 ? "Ready for pilot review" : "Blocked",
    activeRuntimeMode: runtimeMode?.activeMode ?? "simulated",
    activeAuthorizationGate: authorizationGate?.id,
    activeRunbookWorkflow: workflow?.id,
    latestInventoryPilot: inventoryPilot?.id,
    latestEvidenceExport: evidenceExport?.id,
    readiness,
    counters: {
      profiles: state.readOnlyLabConnectionProfiles.length,
      fixtureReplays: state.prismFixtureReplayRecords.length,
      authorizationGates: state.readOnlyAdapterAuthorizationGates.length,
      inventoryPilots: state.liveReadOnlyInventoryPilots.length,
      observabilityRecords: state.readOnlyAdapterObservabilityRecords.length,
    },
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createProductionReadinessDecisionGate(
  state: ApiState,
  request: CreateProductionReadinessDecisionGateRequest,
  actor: string
): ProductionReadinessDecisionGate {
  const consoleSnapshot = createLabPilotOperatorConsole(state);
  const observability = state.readOnlyAdapterObservabilityRecords[0];
  const inventoryPilot = state.liveReadOnlyInventoryPilots[0];
  const checklist = [
    check("Operator console ready", consoleSnapshot.status === "Ready for production decision", consoleSnapshot.status),
    check("Inventory pilot completed", inventoryPilot?.status === "Completed", inventoryPilot ? inventoryPilot.status : "No inventory pilot recorded."),
    check("Observability prepared", observability?.status === "Prepared", observability ? observability.summary.latestStatus : "No observability record recorded."),
    check("Approvers named", (request.approvers ?? []).length > 0, `${request.approvers?.length ?? 0} approver(s).`),
    check("Rollback owner named", Boolean(request.rollbackOwner ?? "Cloud Operations"), request.rollbackOwner ?? "Cloud Operations"),
    check("Support contact named", Boolean(request.supportContact ?? "platform-support@example.invalid"), request.supportContact ?? "platform-support@example.invalid"),
    check("Retention policy named", Boolean(request.retentionPolicy ?? "Retain pilot evidence for 180 days"), request.retentionPolicy ?? "Retain pilot evidence for 180 days"),
    check("Real provisioning disabled", true, "Production decision gate does not enable create, update, delete, power, clone, or resize operations."),
  ];
  const blockers = checklist.filter((item) => !item.passed).map((item) => item.name);

  return {
    id: `production-readiness-decision-${Date.now()}`,
    requestedBy: actor,
    decision: blockers.length === 0 ? request.decision ?? "Go" : "No-go",
    status: blockers.length === 0 ? "Ready for CAB review" : "Blocked",
    approvers: request.approvers?.length ? request.approvers : ["platform.admin"],
    rollbackOwner: request.rollbackOwner ?? "Cloud Operations",
    supportContact: request.supportContact ?? "platform-support@example.invalid",
    retentionPolicy: request.retentionPolicy ?? "Retain pilot evidence for 180 days",
    checklist,
    evidence: [
      "Decision gate is a go/no-go record for production readiness review.",
      "No production adapter is enabled by this record.",
    ],
    blockers,
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function inventorySummary(kinds: PrismInventoryKind[]) {
  const order: PrismInventoryKind[] = ["Cluster", "Project", "Image", "Network", "Category", "VM"];
  return order.map((kind) => ({ kind, count: kinds.filter((item) => item === kind).length }));
}

function statusLine(name: string, passed: boolean, detail: string): LabPilotOperatorConsole["readiness"][number] {
  return {
    name,
    status: passed ? "Ready" : detail.startsWith("No ") || detail.includes("not") ? "Required" : "Blocked",
    detail,
  };
}

function check(name: string, passed: boolean | undefined, detail: string) {
  return { name, passed: Boolean(passed), detail };
}

function findLatestOrById<T extends { id: string }>(records: T[], id?: string) {
  return id ? records.find((record) => record.id === id) : records[0];
}
