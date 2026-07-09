import type {
  AdapterContractTestHarnessRecord,
  EvidenceExportPackV2Record,
  LabConnectionDryRunConsoleRecord,
  LabReadinessWorkspaceRecord,
  MockPrismEndpointExpansionRecord,
  PrismReadOnlyOperation,
  RealLabAuthorizationPacketRecord,
} from "../src/data/cloudStudioDomain";
import type {
  ApiState,
  CreateAdapterContractTestHarnessRequest,
  CreateEvidenceExportPackV2Request,
  CreateLabConnectionDryRunConsoleRequest,
  CreateLabReadinessWorkspaceRequest,
  CreateMockPrismEndpointExpansionRequest,
  CreateRealLabAuthorizationPacketRequest,
} from "./types";

const readOnlyOperations: PrismReadOnlyOperation[] = [
  "listClusters",
  "listProjects",
  "listImages",
  "listSubnets",
  "listCategories",
  "listVms",
];

const endpointPaths: Array<{ operation: PrismReadOnlyOperation; method: "POST"; path: string }> = [
  { operation: "listClusters", method: "POST", path: "/api/nutanix/v3/clusters/list" },
  { operation: "listProjects", method: "POST", path: "/api/nutanix/v3/projects/list" },
  { operation: "listImages", method: "POST", path: "/api/nutanix/v3/images/list" },
  { operation: "listSubnets", method: "POST", path: "/api/nutanix/v3/subnets/list" },
  { operation: "listCategories", method: "POST", path: "/api/nutanix/v3/categories/list" },
  { operation: "listVms", method: "POST", path: "/api/nutanix/v3/vms/list" },
];

export class ControlledMockToLabTransitionError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createLabReadinessWorkspaceRecord(
  state: ApiState,
  request: CreateLabReadinessWorkspaceRequest,
  actor: string
): LabReadinessWorkspaceRecord {
  const policy = findLatestOrById(state.readOnlyRuntimeEnablementPolicies, request.runtimePolicyId);
  const session = findLatestOrById(state.readOnlyPilotSessions, request.pilotSessionId);
  const review = findLatestOrById(state.pilotEvidenceReviewRecords, request.evidenceReviewId);
  const drill = findLatestOrById(state.emergencyStopRollbackDrillRecords, request.emergencyStopRollbackDrillId);
  if (!policy || !session || !review || !drill) {
    throw new ControlledMockToLabTransitionError("lab_readiness_inputs_required", "Runtime policy, pilot session, evidence review, and rollback drill are required.");
  }

  const summary = {
    mockPrismReady: state.mockPrismStatus.status === "Healthy",
    readOnlyAdapterReady: state.disabledPrismReadOnlyHttpClientRecords.some((record) => record.status === "Client shape ready; execution disabled"),
    runtimePolicyReady: policy.status === "Policy ready for pilot session",
    pilotSessionReady: session.status === "Session window ready",
    evidenceReviewApproved: review.status === "Approved for rollback drill",
    emergencyStopDrillPassed: drill.status === "Drill passed",
  };
  const checks = [
    check("Mock Prism ready", summary.mockPrismReady, state.mockPrismStatus.status),
    check("Read-only adapter ready", summary.readOnlyAdapterReady, "Disabled HTTP client shape is available."),
    check("Runtime policy ready", summary.runtimePolicyReady, policy.status),
    check("Pilot session ready", summary.pilotSessionReady, session.status),
    check("Evidence review approved", summary.evidenceReviewApproved, review.status),
    check("Emergency stop drill passed", summary.emergencyStopDrillPassed, drill.status),
    check("Live calls still disabled", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "No live HTTP runtime flag is active."),
  ];

  return {
    id: `lab-readiness-workspace-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Ready for mock-to-lab review" : "Blocked",
    mockPrismStatus: state.mockPrismStatus.status,
    readinessSummary: summary,
    blockerSummary: checks.filter((item) => !item.passed).map((item) => item.name),
    checks,
    evidence: [
      "Lab readiness workspace rolls up the mock-to-lab controls required before a real lab access request.",
      "The workspace is informational and does not enable Prism Central connectivity.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createMockPrismEndpointExpansionRecord(
  state: ApiState,
  request: CreateMockPrismEndpointExpansionRequest,
  actor: string
): MockPrismEndpointExpansionRecord {
  const workspace = findLatestOrById(state.labReadinessWorkspaces, request.workspaceId);
  if (!workspace) {
    throw new ControlledMockToLabTransitionError("workspace_required", "A lab readiness workspace is required.");
  }

  const failureModes = request.failureModes?.length
    ? request.failureModes
    : ["normal-success", "failed-task", "timed-out-task", "rate-limited", "latency-injected"];
  const supportedEndpoints: MockPrismEndpointExpansionRecord["supportedEndpoints"] = [
    { method: "GET", path: "/mock-prism/health", responseShape: "service health envelope" },
    ...endpointPaths.map((item) => ({
      method: item.method,
      path: `/mock-prism${item.path}`,
      responseShape: `${item.operation} Prism v3 list response`,
    })),
  ];
  const latencySimulationMs = request.latencySimulationMs ?? 150;
  const requestsPerMinute = request.requestsPerMinute ?? 120;
  const checks = [
    check("Workspace ready", workspace.status === "Ready for mock-to-lab review", workspace.status),
    check("All read-only list endpoints represented", supportedEndpoints.length === 7, `${supportedEndpoints.length} endpoint(s).`),
    check("Auth header shape declared", true, "Mock x-ndc-simulator-token header is required by contract evidence."),
    check("Latency simulation bounded", latencySimulationMs >= 0 && latencySimulationMs <= 5000, `${latencySimulationMs}ms.`),
    check("Rate limit simulation bounded", requestsPerMinute > 0 && requestsPerMinute <= 1000, `${requestsPerMinute}/minute.`),
    check("Failure modes present", failureModes.length >= 3, `${failureModes.length} mode(s).`),
    check("Request log redaction present", true, "authorization, token, credential, and endpoint values are redacted."),
  ];

  return {
    id: `mock-prism-endpoint-expansion-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Expanded simulator contract ready" : "Blocked",
    workspaceId: workspace.id,
    supportedEndpoints,
    authHeaderMode: "mock-required",
    latencySimulationMs,
    rateLimitSimulation: {
      requestsPerMinute,
      mode: "simulated",
    },
    failureModes,
    redactedRequestLogFields: ["authorization", "token", "credential", "endpoint", "cookie"],
    checks,
    evidence: [
      "Mock Prism endpoint expansion records the simulator behavior needed for future lab rehearsals.",
      "The simulator remains local and does not contact Nutanix infrastructure.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createAdapterContractTestHarnessRecord(
  state: ApiState,
  request: CreateAdapterContractTestHarnessRequest,
  actor: string
): AdapterContractTestHarnessRecord {
  const expansion = findLatestOrById(state.mockPrismEndpointExpansionRecords, request.mockExpansionId);
  if (!expansion) {
    throw new ControlledMockToLabTransitionError("mock_expansion_required", "A mock Prism endpoint expansion record is required.");
  }

  const testSuites = [
    suite("Prism read-only contract", expansion.status === "Expanded simulator contract ready", [
      "clusters/projects/images/subnets/categories/vms list envelopes are represented",
      "response metadata contains entities and total_matches",
      "executionEnabled remains false",
    ]),
    suite("Credential resolver contract", true, [
      "credential references are labels only",
      "resolvedSecretAvailable=false",
      "authorization headers are redacted",
    ]),
    suite("Timeout and retry contract", expansion.latencySimulationMs <= 5000, [
      "timeout policy is bounded",
      "retry policy is bounded",
      "rate-limit behavior is simulated",
    ]),
    suite("Fail-closed contract", true, [
      "missing approval blocks readiness",
      "runtime flag remains disabled",
      "mutation operations remain excluded",
    ]),
  ];
  const checks = [
    check("Mock expansion ready", expansion.status === "Expanded simulator contract ready", expansion.status),
    check("Read-only contract suite passed", testSuites[0].status === "Passed", testSuites[0].name),
    check("Credential resolver suite passed", testSuites[1].status === "Passed", testSuites[1].name),
    check("Timeout/retry suite passed", testSuites[2].status === "Passed", testSuites[2].name),
    check("Fail-closed suite passed", testSuites[3].status === "Passed", testSuites[3].name),
  ];

  return {
    id: `adapter-contract-test-harness-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Contract harness passed" : "Blocked",
    mockExpansionId: expansion.id,
    testSuites,
    checks,
    evidence: [
      "Adapter contract harness records response-shape, redaction, timeout, retry, and fail-closed assertions.",
      "Contract tests are non-executing evidence records in this release.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createLabConnectionDryRunConsoleRecord(
  state: ApiState,
  request: CreateLabConnectionDryRunConsoleRequest,
  actor: string
): LabConnectionDryRunConsoleRecord {
  const harness = findLatestOrById(state.adapterContractTestHarnessRecords, request.contractHarnessId);
  if (!harness) {
    throw new ControlledMockToLabTransitionError("contract_harness_required", "A passed adapter contract harness is required.");
  }

  const config = state.realReadOnlyAdapterConfigBoundaries[0];
  const credential = state.credentialProviderContractRecords[0];
  const selectedEndpointRef = request.selectedEndpointRef ?? config?.endpointRef ?? "prism-central-ref";
  const credentialProviderRef = request.credentialProviderRef ?? credential?.credentialProviderRef ?? "vault-ref-nci-readonly";
  const expectedRequests = endpointPaths;
  const checks = [
    check("Contract harness passed", harness.status === "Contract harness passed", harness.status),
    check("Endpoint reference safe", safeRef(selectedEndpointRef), selectedEndpointRef),
    check("Credential provider reference safe", safeRef(credentialProviderRef), credentialProviderRef),
    check("All read-only operations listed", expectedRequests.length === readOnlyOperations.length, `${expectedRequests.length} request(s).`),
    check("Rollback path declared", true, "Return to simulated adapter mode, preserve evidence, keep runtime flag disabled."),
  ];

  return {
    id: `lab-connection-dry-run-console-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Dry-run console ready" : "Blocked",
    contractHarnessId: harness.id,
    selectedEndpointRef,
    credentialProviderRef,
    allowedOperations: readOnlyOperations,
    expectedRequests,
    expectedResponses: readOnlyOperations.map((operation) => `${operation} returns Prism v3 list metadata and entities.`),
    blockedMutations: ["create_vm", "clone_vm", "delete_vm", "power_on", "power_off", "update_network", "attach_category"],
    rollbackPath: [
      "Confirm NDC_PRISM_READONLY_HTTP_ENABLED remains disabled.",
      "Return operator view to simulated Mock Prism mode.",
      "Preserve runtime policy, session, call envelope, review, and rollback drill evidence.",
    ],
    checks,
    evidence: [
      "Dry-run console records the exact future lab request and response expectations.",
      "No sockets are opened and no live Prism inventory is imported.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createEvidenceExportPackV2Record(
  state: ApiState,
  request: CreateEvidenceExportPackV2Request,
  actor: string
): EvidenceExportPackV2Record {
  const dryRunConsole = findLatestOrById(state.labConnectionDryRunConsoleRecords, request.dryRunConsoleId);
  const policy = state.readOnlyRuntimeEnablementPolicies[0];
  const session = state.readOnlyPilotSessions[0];
  const envelope = state.liveReadOnlyCallEnvelopes[0];
  const review = state.pilotEvidenceReviewRecords[0];
  const drill = state.emergencyStopRollbackDrillRecords[0];
  const harness = state.adapterContractTestHarnessRecords[0];
  if (!dryRunConsole || !policy || !session || !envelope || !review || !drill || !harness) {
    throw new ControlledMockToLabTransitionError("export_inputs_required", "Dry-run console plus policy, session, envelope, review, drill, and contract harness records are required.");
  }

  const manifest = [
    manifestItem("runtime-policy", policy.id),
    manifestItem("pilot-session", session.id),
    manifestItem("call-envelope", envelope.id),
    manifestItem("evidence-review", review.id),
    manifestItem("rollback-drill", drill.id),
    manifestItem("contract-harness", harness.id),
    manifestItem("dry-run-console", dryRunConsole.id),
  ];
  const checks = [
    check("Dry-run console ready", dryRunConsole.status === "Dry-run console ready", dryRunConsole.status),
    check("Runtime policy included", Boolean(policy.id), policy.id),
    check("Pilot session included", Boolean(session.id), session.id),
    check("Call envelopes included", envelope.operationEnvelopes.length === 6, `${envelope.operationEnvelopes.length} envelope(s).`),
    check("Evidence review approved", review.status === "Approved for rollback drill", review.status),
    check("Rollback drill passed", drill.status === "Drill passed", drill.status),
    check("Contract harness passed", harness.status === "Contract harness passed", harness.status),
  ];

  return {
    id: `evidence-export-pack-v2-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Export pack ready" : "Blocked",
    dryRunConsoleId: dryRunConsole.id,
    manifest,
    checksum: `sha256-mock-${manifest.map((item) => item.recordId).join("-").length}`,
    readinessSummary: [
      "Runtime policy, session, call envelope, evidence review, rollback drill, contract harness, and dry-run console are linked.",
      "Export is redacted and suitable for platform/security review.",
    ],
    checks,
    evidence: [
      "Evidence export pack v2 consolidates mock-to-lab readiness evidence.",
      "The export contains metadata references only and no provider secrets.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createRealLabAuthorizationPacketRecord(
  state: ApiState,
  request: CreateRealLabAuthorizationPacketRequest,
  actor: string
): RealLabAuthorizationPacketRecord {
  const exportPack = findLatestOrById(state.evidenceExportPackV2Records, request.evidenceExportPackId);
  if (!exportPack) {
    throw new ControlledMockToLabTransitionError("evidence_export_required", "An evidence export pack v2 record is required.");
  }

  const approvalOwners = request.approvalOwners?.length
    ? request.approvalOwners
    : ["platform-owner", "security-reviewer", "lab-owner", "operations-owner"];
  const rollbackOwner = request.rollbackOwner ?? "Cloud Operations";
  const pentestScopeEvidence = request.pentestScopeEvidence?.length
    ? request.pentestScopeEvidence
    : ["readonly-lab-pentest-scope.md", "mock-to-lab-boundary-review.md"];
  const goNoGoChecklist = [
    check("Evidence export ready", exportPack.status === "Export pack ready", exportPack.status),
    check("Approval owners named", bounded(approvalOwners), approvalOwners.join(", ")),
    check("Rollback owner named", safeRef(rollbackOwner), rollbackOwner),
    check("Pentest scope evidence referenced", bounded(pentestScopeEvidence), pentestScopeEvidence.join(", ")),
    check("Live HTTP remains disabled", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "Authorization packet does not enable runtime calls."),
  ];
  const checks = [
    ...goNoGoChecklist,
    check("Provisioning disabled", true, "Packet is a request-to-access artifact only."),
    check("Real Prism calls disabled", true, "No real lab call is made by this packet."),
  ];

  return {
    id: `real-lab-authorization-packet-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Ready to request real lab access" : "Blocked",
    evidenceExportPackId: exportPack.id,
    requiredLabDetails: ["Prism Central version", "lab project", "lab cluster", "lab subnet", "allowed read-only inventory scope"],
    prismCentralEndpointRequirements: ["endpoint reference only", "private CA reference", "no inline hostname in evidence export"],
    credentialVaultRequirements: ["vault reference only", "read-only service account", "no resolved secret storage"],
    networkBoundary: ["operator-approved source", "read-only API paths only", "no mutation path allowlist"],
    approvalOwners,
    rollbackOwner,
    pentestScopeEvidence,
    goNoGoChecklist,
    checks,
    evidence: [
      "Real lab authorization packet is ready to request an authorized Nutanix lab connection.",
      "The packet does not enable live HTTP, credentials, provisioning, or Prism Central calls.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function suite(name: string, passed: boolean, assertions: string[]) {
  return { name, status: passed ? ("Passed" as const) : ("Blocked" as const), assertions };
}

function manifestItem(section: string, recordId: string) {
  return { section, recordId, redacted: true };
}

function check(name: string, passed: boolean | undefined, detail: string) {
  return { name, passed: Boolean(passed), detail };
}

function findLatestOrById<T extends { id: string }>(records: T[], id?: string) {
  return id ? records.find((record) => record.id === id) : records[0];
}

function safeRef(value: string | undefined) {
  return Boolean(value && value.length <= 160 && !/[\\\r\n\t]|:\/\/|Bearer|token|password|secret|apikey|api_key|=|\$/i.test(value));
}

function bounded(values: string[] | undefined) {
  return Boolean(values?.length && values.length <= 20 && values.every(safeRef));
}
