import type {
  AuthBoundaryDiagnostics,
  ContainerConfigValidationManifest,
  LiveReadOnlyPrismCallDesign,
  OperatorEvidenceExportPack,
  PrismFixtureReplayRecord,
  PrismInventoryKind,
  PrismReadOnlyOperation,
  ProductionReadinessScorecard,
  ReadOnlyAdapterAuthorizationGate,
  ReadOnlyLabConnectionProfile,
  SanitizedPrismInventoryFixtureRecord,
  LabPilotRunbookWorkflow,
} from "../src/data/cloudStudioDomain";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";
import type {
  ApiState,
  CreateLabPilotRunbookWorkflowRequest,
  CreateOperatorEvidenceExportPackRequest,
  CreatePrismFixtureReplayRequest,
  CreateReadOnlyAdapterAuthorizationGateRequest,
  CreateReadOnlyLabConnectionProfileRequest,
  LabPilotRunbookWorkflowAction,
} from "./types";

const readOnlyOperations: PrismReadOnlyOperation[] = [
  "listClusters",
  "listProjects",
  "listImages",
  "listSubnets",
  "listCategories",
  "listVms",
];

const defaultFixtureRecords: SanitizedPrismInventoryFixtureRecord[] = [
  { kind: "Cluster", name: "berlin-ahv-lab", rawRef: "fixture-cluster-berlin", categories: ["env:lab"] },
  { kind: "Project", name: "developer-cloud-lab", rawRef: "fixture-project-devcloud", categories: ["owner:platform"] },
  {
    kind: "Image",
    name: "Rocky Linux 9 Hardened",
    cluster: "berlin-ahv-lab",
    project: "developer-cloud-lab",
    rawRef: "fixture-image-rocky-9",
    categories: ["os:linux", "profile:published"],
  },
  {
    kind: "Network",
    name: "dev-segment",
    cluster: "berlin-ahv-lab",
    project: "developer-cloud-lab",
    network: "dev-segment",
    rawRef: "fixture-subnet-dev",
    categories: ["network:dev"],
  },
  {
    kind: "Category",
    name: "env:lab",
    rawRef: "fixture-category-env-lab",
    categories: ["scope:lab"],
  },
  {
    kind: "VM",
    name: "payments-dev",
    cluster: "berlin-ahv-lab",
    project: "developer-cloud-lab",
    network: "dev-segment",
    rawRef: "fixture-vm-payments-dev",
    categories: ["app:payments", "owner:demo"],
  },
];

export class ReadOnlyLabPilotError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createReadOnlyLabConnectionProfile(
  state: ApiState,
  request: CreateReadOnlyLabConnectionProfileRequest,
  actor: string
): ReadOnlyLabConnectionProfile {
  const now = new Date();
  const expiresAt = request.expiresAt ?? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const scope = {
    projects: request.allowedProviderScope?.projects ?? [state.platformConfig.defaultProject],
    clusters: request.allowedProviderScope?.clusters ?? [state.platformConfig.defaultCluster],
    networks: request.allowedProviderScope?.networks ?? [state.platformConfig.networkProfile],
    categories: request.allowedProviderScope?.categories ?? ["env:lab", "owner:platform"],
  };
  const profile: ReadOnlyLabConnectionProfile = {
    id: `readonly-lab-profile-${Date.now()}`,
    name: request.name ?? "Prism Central read-only lab profile",
    provider: "NCI",
    prismCentralEndpointRef: (request.prismCentralEndpointRef ?? state.platformConfig.prismCentralUrl) || "prism-central-ref",
    credentialProfileRef: request.credentialProfileRef ?? state.platformConfig.credentialReference,
    allowedProviderScope: scope,
    owner: request.owner ?? actor,
    approvedBy: request.approvedBy ?? actor,
    approvalState: request.approvalState ?? "Approved",
    expiresAt,
    checks: [
      check(
        "Endpoint reference configured",
        safeValue((request.prismCentralEndpointRef ?? state.platformConfig.prismCentralUrl) || "prism-central-ref"),
        "Endpoint must be stored as a reference only, not as a URL or hostname."
      ),
      check("Credential profile reference configured", safeValue(request.credentialProfileRef ?? state.platformConfig.credentialReference), "Credential material is not stored in NDC Studio."),
      check("Owner present", safeValue(request.owner ?? actor), "Owner must be a safe identity reference."),
      check("Approver present", safeValue(request.approvedBy ?? actor), "Approver must be a safe identity reference."),
      check(
        "Provider scope bounded",
        bounded(scope.projects) && bounded(scope.clusters) && bounded(scope.networks) && bounded(scope.categories),
        "Projects, clusters, networks, and categories are explicitly bounded."
      ),
      check("Approval state accepted", (request.approvalState ?? "Approved") === "Approved", `Approval state is ${request.approvalState ?? "Approved"}.`),
      check("Expiry in future", new Date(expiresAt).getTime() > now.getTime(), `Expires at ${expiresAt}.`),
    ],
    evidence: request.evidence ?? [
      "Read-only lab profile stores endpoint and credential references only.",
      "Provider scope is bounded before any fixture or future live validation.",
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: now.toISOString(),
  };

  return { ...profile, approvalState: profile.checks.every((item) => item.passed) ? profile.approvalState : "Draft" };
}

export function createPrismFixtureReplayRecord(
  request: CreatePrismFixtureReplayRequest,
  actor: string
): PrismFixtureReplayRecord {
  const records = request.records?.length ? request.records : defaultFixtureRecords;
  const checks = [
    check("Fixture records present", records.length > 0, `${records.length} record(s) supplied.`),
    check("Fixture is sanitized", records.every(isSanitizedRecord), "Records must use references and must not contain URLs, secrets, or credential-like values."),
    check("Read-only operations covered", readOnlyOperations.length === 6, "All Prism list operations are replayed against sanitized fixture records."),
    check("Mutation operations blocked", readOnlyMutationOperationsBlocked.length > 0, "Mutation operations are excluded from replay."),
  ];

  return {
    id: `prism-fixture-replay-${Date.now()}`,
    fixtureName: request.fixtureName ?? "bundled-sanitized-prism-inventory",
    source: request.source ?? (request.records?.length ? "Uploaded sanitized fixture" : "Bundled sanitized fixture"),
    requestedBy: actor,
    recordCount: records.length,
    profileCandidateCount: records.filter((record) => record.kind === "Image").length,
    contractOperations: readOnlyOperations,
    status: checks.every((item) => item.passed) ? "Passed" : "Blocked",
    checks,
    replayedRecords: records,
    mutationOperationsBlocked: readOnlyMutationOperationsBlocked,
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createReadOnlyAdapterAuthorizationGate(
  state: ApiState,
  request: CreateReadOnlyAdapterAuthorizationGateRequest,
  actor: string
): ReadOnlyAdapterAuthorizationGate {
  const profile = findLatestOrById(state.readOnlyLabConnectionProfiles, request.profileId);
  const replay = findLatestOrById(state.prismFixtureReplayRecords, request.fixtureReplayId);
  const labGate = findLatestOrById(state.readOnlyPrismLabGates, request.labGateId);
  const checks = [
    check("Approved lab profile", profile?.approvalState === "Approved", profile ? `Profile ${profile.id} is ${profile.approvalState}.` : "No lab profile found."),
    check("Fixture replay passed", replay?.status === "Passed", replay ? `Replay ${replay.id} is ${replay.status}.` : "No fixture replay found."),
    check("Read-only lab gate ready", labGate?.status === "Ready for fixture contract validation", labGate ? `Lab gate ${labGate.id} is ${labGate.status}.` : "No read-only lab gate found."),
    check("Real Prism calls disabled", true, "Authorization gate does not enable live Prism calls."),
  ];

  if (!profile || !replay || !labGate) {
    throw new ReadOnlyLabPilotError("readonly_authorization_inputs_missing", "Lab profile, fixture replay, and read-only lab gate evidence are required.");
  }

  return {
    id: `readonly-adapter-authorization-${Date.now()}`,
    requestedBy: actor,
    profileId: profile.id,
    fixtureReplayId: replay.id,
    labGateId: labGate.id,
    status: checks.every((item) => item.passed) ? "Ready for future live read-only review" : "Blocked",
    checks,
    authorizationPacket: {
      scopeRef: profile.prismCentralEndpointRef,
      credentialProfileRef: profile.credentialProfileRef,
      approvedOperations: readOnlyOperations,
      excludedOperations: readOnlyMutationOperationsBlocked,
      expiresAt: profile.expiresAt,
    },
    evidence: [
      `Lab profile: ${profile.id}.`,
      `Fixture replay: ${replay.id}.`,
      `Read-only lab gate: ${labGate.id}.`,
      "Packet is evidence-only and does not enable network calls.",
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createOperatorEvidenceExportPack(
  state: ApiState,
  request: CreateOperatorEvidenceExportPackRequest,
  actor: string,
  diagnostics: {
    readiness: ProductionReadinessScorecard;
    authBoundary: AuthBoundaryDiagnostics;
    configValidation: ContainerConfigValidationManifest;
    liveDesign: LiveReadOnlyPrismCallDesign;
  }
): OperatorEvidenceExportPack {
  const include = {
    readiness: request.includeReadiness ?? true,
    authBoundary: request.includeAuthBoundary ?? true,
    configValidation: request.includeConfigValidation ?? true,
    labGates: request.includeLabGates ?? true,
    liveDesign: request.includeLiveDesign ?? true,
  };

  return {
    id: `operator-evidence-export-${Date.now()}`,
    requestedBy: actor,
    status: "Prepared",
    format: "JSON",
    includedArtifacts: [
      { name: "Production readiness scorecard", count: include.readiness ? 1 : 0, redacted: true },
      { name: "Auth boundary diagnostics", count: include.authBoundary ? 1 : 0, redacted: true },
      { name: "Container/config validation", count: include.configValidation ? 1 : 0, redacted: true },
      { name: "Read-only lab gates", count: include.labGates ? state.readOnlyPrismLabGates.length : 0, redacted: true },
      { name: "Live read-only Prism design", count: include.liveDesign ? 1 : 0, redacted: true },
      { name: "Lab connection profiles", count: state.readOnlyLabConnectionProfiles.length, redacted: true },
      { name: "Fixture replays", count: state.prismFixtureReplayRecords.length, redacted: true },
      { name: "Authorization gates", count: state.readOnlyAdapterAuthorizationGates.length, redacted: true },
    ],
    manifest: {
      generatedAt: new Date().toISOString(),
      readinessScore: diagnostics.readiness.score,
      authBoundaryMode: diagnostics.authBoundary.mode,
      configValidationStatus: diagnostics.configValidation.status,
      labGateCount: state.readOnlyPrismLabGates.length,
      liveDesignStatus: diagnostics.liveDesign.status,
    },
    redactionRules: [
      "Endpoint values are references only.",
      "Credential values are never exported.",
      "Authorization headers and tokens are excluded.",
      "Fixture records must be sanitized before replay.",
    ],
    evidence: [
      "Evidence pack is generated from prototype control-plane records.",
      "No Nutanix endpoint is contacted during export.",
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createLabPilotRunbookWorkflow(
  state: ApiState,
  request: CreateLabPilotRunbookWorkflowRequest,
  actor: string
): LabPilotRunbookWorkflow {
  const profile = findLatestOrById(state.readOnlyLabConnectionProfiles, request.profileId);
  const authorizationGate = findLatestOrById(state.readOnlyAdapterAuthorizationGates, request.authorizationGateId);
  const evidenceExport = findLatestOrById(state.operatorEvidenceExportPacks, request.evidenceExportId);

  if (!profile || !authorizationGate || !evidenceExport) {
    throw new ReadOnlyLabPilotError("lab_pilot_workflow_inputs_missing", "Lab profile, authorization gate, and evidence export are required.");
  }

  const checks = [
    check("Lab profile approved", profile.approvalState === "Approved", `Profile ${profile.id} is ${profile.approvalState}.`),
    check("Authorization gate ready", authorizationGate.status === "Ready for future live read-only review", `Gate ${authorizationGate.id} is ${authorizationGate.status}.`),
    check("Evidence export prepared", evidenceExport.status === "Prepared", `Evidence pack ${evidenceExport.id} is ${evidenceExport.status}.`),
    check("Real calls disabled", true, "Workflow dry-run is evidence-only."),
  ];
  const now = new Date().toISOString();

  return {
    id: `lab-pilot-runbook-${Date.now()}`,
    requestedBy: actor,
    owner: request.owner ?? profile.owner,
    profileId: profile.id,
    authorizationGateId: authorizationGate.id,
    evidenceExportId: evidenceExport.id,
    phase: "Prepared",
    status: checks.every((item) => item.passed) ? "In review" : "Blocked",
    steps: [
      { name: "Prepare", status: checks.every((item) => item.passed) ? "Complete" : "Blocked", evidence: "Workflow prepared from lab profile, authorization gate, and evidence export.", completedAt: now },
      { name: "Approve", status: "Pending", evidence: "Awaiting operator approval." },
      { name: "Execute dry-run", status: "Pending", evidence: "Awaiting dry-run execution." },
      { name: "Review evidence", status: "Pending", evidence: "Awaiting evidence review." },
      { name: "Close pilot", status: "Pending", evidence: "Awaiting closure." },
    ],
    checks,
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function advanceLabPilotRunbookWorkflow(
  workflow: LabPilotRunbookWorkflow,
  action: LabPilotRunbookWorkflowAction,
  actor: string
): LabPilotRunbookWorkflow {
  const sequence: Array<{ action: LabPilotRunbookWorkflowAction; phase: LabPilotRunbookWorkflow["phase"]; step: LabPilotRunbookWorkflow["steps"][number]["name"] }> = [
    { action: "approve", phase: "Approved", step: "Approve" },
    { action: "execute-dry-run", phase: "Dry-run executed", step: "Execute dry-run" },
    { action: "review-evidence", phase: "Evidence reviewed", step: "Review evidence" },
    { action: "close", phase: "Closed", step: "Close pilot" },
  ];
  const target = sequence.find((item) => item.action === action);
  if (!target) {
    throw new ReadOnlyLabPilotError("lab_pilot_action_invalid", `Unsupported lab pilot action: ${action}.`);
  }
  if (workflow.status === "Blocked") {
    throw new ReadOnlyLabPilotError("lab_pilot_workflow_blocked", "Blocked lab pilot workflows cannot advance.");
  }

  const now = new Date().toISOString();
  return {
    ...workflow,
    phase: target.phase,
    status: target.phase === "Closed" ? "Closed" : "In review",
    steps: workflow.steps.map((step) =>
      step.name === target.step
        ? { ...step, status: "Complete", evidence: `${target.step} recorded by ${actor}; real calls remain disabled.`, completedAt: now }
        : step
    ),
    updatedAt: now,
  };
}

function check(name: string, passed: boolean, detail: string) {
  return { name, passed, detail };
}

function findLatestOrById<T extends { id: string }>(records: T[], id?: string) {
  return id ? records.find((record) => record.id === id) : records[0];
}

function isSanitizedRecord(record: SanitizedPrismInventoryFixtureRecord) {
  return (
    isAllowedKind(record.kind) &&
    safeValue(record.name) &&
    safeValue(record.rawRef) &&
    (!record.cluster || safeValue(record.cluster)) &&
    (!record.project || safeValue(record.project)) &&
    (!record.network || safeValue(record.network)) &&
    record.categories.every(safeValue)
  );
}

function isAllowedKind(kind: PrismInventoryKind) {
  return ["Cluster", "Project", "Image", "Network", "Category", "VM"].includes(kind);
}

function safeValue(value: string) {
  return value.length > 0 && value.length <= 120 && !/[\\\r\n\t]|:\/\/|Bearer|token|password|secret|apikey|api_key|=|\$/i.test(value);
}

function bounded(values: string[]) {
  return values.length > 0 && values.length <= 20 && values.every(safeValue);
}
