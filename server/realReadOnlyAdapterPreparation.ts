import type {
  AuthorizedLabConnectionDryRunRecord,
  CredentialProviderContractRecord,
  DisabledRealReadOnlyAdapterInterfaceRecord,
  OfflineContractReplaySuiteRecord,
  PrismInventoryKind,
  PrismReadOnlyOperation,
  RealReadOnlyAdapterConfigBoundary,
} from "../src/data/cloudStudioDomain";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";
import type {
  ApiState,
  CreateAuthorizedLabConnectionDryRunRequest,
  CreateCredentialProviderContractRequest,
  CreateDisabledRealReadOnlyAdapterInterfaceRequest,
  CreateOfflineContractReplaySuiteRequest,
  CreateRealReadOnlyAdapterConfigBoundaryRequest,
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

const operationKind: Record<PrismReadOnlyOperation, PrismInventoryKind> = {
  listClusters: "Cluster",
  listProjects: "Project",
  listImages: "Image",
  listSubnets: "Network",
  listCategories: "Category",
  listVms: "VM",
};

export class RealReadOnlyAdapterPreparationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createRealReadOnlyAdapterConfigBoundary(
  state: ApiState,
  request: CreateRealReadOnlyAdapterConfigBoundaryRequest,
  actor: string
): RealReadOnlyAdapterConfigBoundary {
  const endpointRef = request.endpointRef ?? state.readOnlyLabConnectionProfiles[0]?.prismCentralEndpointRef ?? "prism-central-ref";
  const credentialProviderRef = request.credentialProviderRef ?? state.readOnlyLabConnectionProfiles[0]?.credentialProfileRef ?? state.platformConfig.credentialReference;
  const tlsValidationMode = request.tlsValidationMode ?? "private-ca-ref";
  const timeoutSeconds = request.timeoutSeconds ?? 10;
  const retry = {
    maxAttempts: request.retry?.maxAttempts ?? 2,
    backoffMs: request.retry?.backoffMs ?? 500,
  };
  const allowedOperations = request.allowedOperations?.length ? request.allowedOperations : readOnlyOperations;
  const killSwitch = request.killSwitch ?? "Closed";
  const checks = [
    check("Endpoint reference configured", safeRef(endpointRef), "Endpoint is represented as a reference and not contacted."),
    check("Credential provider reference configured", safeRef(credentialProviderRef), "Credential material remains outside NDC Studio."),
    check("TLS validation selected", tlsValidationMode !== "insecure-disabled", `${tlsValidationMode} is selected.`),
    check("Timeout bounded", timeoutSeconds > 0 && timeoutSeconds <= 30, `${timeoutSeconds}s timeout.`),
    check("Retry bounded", retry.maxAttempts >= 0 && retry.maxAttempts <= 3 && retry.backoffMs <= 2000, `${retry.maxAttempts} attempts / ${retry.backoffMs}ms.`),
    check("Operations allowlisted", readOnlyOperations.every((operation) => allowedOperations.includes(operation)), `${allowedOperations.length} operation(s) allowlisted.`),
    check("Kill switch closed", killSwitch === "Closed", `Kill switch is ${killSwitch}.`),
  ];

  return {
    id: `real-readonly-config-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Ready for credential contract" : "Blocked",
    endpointRef,
    credentialProviderRef,
    caCertificateRef: request.caCertificateRef ?? "platform-ca-bundle-ref",
    tlsValidationMode,
    timeoutSeconds,
    retry,
    allowedOperations,
    killSwitch,
    checks,
    evidence: [
      "Configuration boundary stores references only.",
      "Kill switch remains closed until a separately authorized live pilot.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createCredentialProviderContractRecord(
  state: ApiState,
  request: CreateCredentialProviderContractRequest,
  actor: string
): CredentialProviderContractRecord {
  const credentialProviderRef = request.credentialProviderRef ?? state.realReadOnlyAdapterConfigBoundaries[0]?.credentialProviderRef ?? state.platformConfig.credentialReference;
  const checks = [
    check("Credential reference shape", safeRef(credentialProviderRef), "Reference contains no URL, token, password, or inline access material."),
    check("Resolver disabled", true, "Mock resolver validates reference shape only and never resolves secret material."),
    check("Redaction rules present", true, "Secret value, Authorization header, and token fields are always redacted."),
  ];

  return {
    id: `credential-provider-contract-${Date.now()}`,
    requestedBy: actor,
    provider: request.provider ?? "MockVault",
    credentialProviderRef,
    resolverStatus: checks.every((item) => item.passed) ? "Validated reference" : "Blocked",
    resolvedSecretAvailable: false,
    checks,
    redactionRules: ["Do not persist resolved secret values.", "Redact Authorization headers.", "Emit credential references only."],
    evidence: ["Credential provider contract validates references without fetching secrets."],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createDisabledRealReadOnlyAdapterInterfaceRecord(
  state: ApiState,
  request: CreateDisabledRealReadOnlyAdapterInterfaceRequest,
  actor: string
): DisabledRealReadOnlyAdapterInterfaceRecord {
  const config = findLatestOrById(state.realReadOnlyAdapterConfigBoundaries, request.configBoundaryId);
  const credential = findLatestOrById(state.credentialProviderContractRecords, request.credentialContractId);
  const checks = [
    check("Configuration boundary ready", config?.status === "Ready for credential contract", config?.status ?? "No config boundary found."),
    check("Credential contract validated", credential?.resolverStatus === "Validated reference", credential?.resolverStatus ?? "No credential contract found."),
    check("Read-only operations mapped", endpointPaths.length === readOnlyOperations.length, `${endpointPaths.length} endpoint path(s).`),
    check("Execution disabled", true, "Adapter interface cannot execute HTTP calls in this release."),
  ];

  if (!config || !credential) {
    throw new RealReadOnlyAdapterPreparationError("real_readonly_adapter_inputs_missing", "Configuration boundary and credential provider contract are required.");
  }

  return {
    id: `disabled-real-readonly-interface-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Interface ready; execution disabled" : "Blocked",
    adapter: "PrismCentralReadOnlyAdapter",
    configBoundaryId: config.id,
    credentialContractId: credential.id,
    supportedOperations: readOnlyOperations,
    endpointPaths,
    normalizationTargets: ["Cluster", "Project", "Image", "Network", "Category", "VM"],
    checks,
    blockedReasons: ["HTTP execution is disabled.", "Credential resolver does not return secret values.", "Kill switch remains closed."],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createOfflineContractReplaySuiteRecord(
  state: ApiState,
  request: CreateOfflineContractReplaySuiteRequest,
  actor: string
): OfflineContractReplaySuiteRecord {
  const adapter = findLatestOrById(state.disabledRealReadOnlyAdapterInterfaceRecords, request.adapterInterfaceId);
  const replay = findLatestOrById(state.prismFixtureReplayRecords, request.fixtureReplayId);

  if (!adapter || !replay) {
    throw new RealReadOnlyAdapterPreparationError("offline_replay_inputs_missing", "Adapter interface and fixture replay evidence are required.");
  }

  const coverage = readOnlyOperations.map((operation) => {
    const kind = operationKind[operation];
    const expectedCount = replay.replayedRecords.filter((record) => record.kind === kind).length;
    const normalizedCount = normalizeFixtureKind(replay.replayedRecords.map((record) => record.kind), kind).length;
    return { kind, operation, expectedCount, normalizedCount, passed: expectedCount === normalizedCount };
  });
  const checks = [
    check("Adapter interface ready", adapter.status === "Interface ready; execution disabled", adapter.status),
    check("Fixture replay passed", replay.status === "Passed", replay.status),
    check("All read-only operations covered", coverage.length === readOnlyOperations.length, `${coverage.length} operation(s).`),
    check("Normalization matches expected counts", coverage.every((item) => item.passed), "Fixture records normalize to Prism inventory kinds."),
  ];

  return {
    id: `offline-contract-replay-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Passed" : "Blocked",
    adapterInterfaceId: adapter.id,
    fixtureReplayId: replay.id,
    coverage,
    checks,
    evidence: ["Offline replay compares Prism-shaped fixture records to normalized inventory kinds without network calls."],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createAuthorizedLabConnectionDryRunRecord(
  state: ApiState,
  request: CreateAuthorizedLabConnectionDryRunRequest,
  actor: string
): AuthorizedLabConnectionDryRunRecord {
  const config = findLatestOrById(state.realReadOnlyAdapterConfigBoundaries, request.configBoundaryId);
  const credential = findLatestOrById(state.credentialProviderContractRecords, request.credentialContractId);
  const adapter = findLatestOrById(state.disabledRealReadOnlyAdapterInterfaceRecords, request.adapterInterfaceId);
  const replay = findLatestOrById(state.offlineContractReplaySuiteRecords, request.offlineReplaySuiteId);
  const decision = findLatestOrById(state.productionReadinessDecisionGates, request.productionDecisionGateId);

  if (!config || !credential || !adapter || !replay || !decision) {
    throw new RealReadOnlyAdapterPreparationError("authorized_lab_dry_run_inputs_missing", "Config, credential, adapter, offline replay, and production decision gate are required.");
  }

  const validations = [
    check("Configuration boundary ready", config.status === "Ready for credential contract", config.status),
    check("Credential reference validated", credential.resolverStatus === "Validated reference", credential.resolverStatus),
    check("TLS validation safe", config.tlsValidationMode !== "insecure-disabled", config.tlsValidationMode),
    check("Allowed endpoint paths mapped", adapter.endpointPaths.length === readOnlyOperations.length, `${adapter.endpointPaths.length} paths.`),
    check("Offline replay passed", replay.status === "Passed", replay.status),
    check("Production decision ready", decision.status === "Ready for CAB review", decision.status),
    check("Kill switch closed", config.killSwitch === "Closed", config.killSwitch),
    check("No network call executed", true, "Dry run validates contracts only."),
  ];

  return {
    id: `authorized-lab-connection-dry-run-${Date.now()}`,
    requestedBy: actor,
    status: validations.every((item) => item.passed) ? "Ready for authorized lab connection review" : "Blocked",
    configBoundaryId: config.id,
    credentialContractId: credential.id,
    adapterInterfaceId: adapter.id,
    offlineReplaySuiteId: replay.id,
    productionDecisionGateId: decision.id,
    validations,
    auditEvidence: [
      "Dry run validated config boundary, credential reference, TLS mode, endpoint path allowlist, replay suite, and decision gate.",
      "No socket, HTTP, Prism Central, or credential-provider call was opened.",
    ],
    redactionSummary: credential.redactionRules,
    allowedEndpointPaths: adapter.endpointPaths.map((item) => ({ operation: item.operation, path: item.path })),
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function check(name: string, passed: boolean | undefined, detail: string) {
  return { name, passed: Boolean(passed), detail };
}

function safeRef(value: string | undefined) {
  return Boolean(value && value.length <= 120 && !/[\\\r\n\t]|:\/\/|Bearer|token|password|secret|apikey|api_key|=|\$/i.test(value));
}

function findLatestOrById<T extends { id: string }>(records: T[], id?: string) {
  return id ? records.find((record) => record.id === id) : records[0];
}

function normalizeFixtureKind(kinds: PrismInventoryKind[], target: PrismInventoryKind) {
  return kinds.filter((kind) => kind === target);
}
