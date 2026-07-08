import type {
  AuthorizedReadOnlyLabPilotGateRecord,
  CredentialResolverAdapterStubRecord,
  DisabledPrismReadOnlyHttpClientRecord,
  HardenedLabConnectionProfileReview,
  LabConnectivityPreflightRecord,
  PrismReadOnlyOperation,
} from "../src/data/cloudStudioDomain";
import type {
  ApiState,
  CreateAuthorizedReadOnlyLabPilotGateRequest,
  CreateCredentialResolverAdapterStubRequest,
  CreateDisabledPrismReadOnlyHttpClientRequest,
  CreateHardenedLabConnectionProfileReviewRequest,
  CreateLabConnectivityPreflightRequest,
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

export class ControlledReadOnlyLabEnablementError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createHardenedLabConnectionProfileReview(
  state: ApiState,
  request: CreateHardenedLabConnectionProfileReviewRequest,
  actor: string
): HardenedLabConnectionProfileReview {
  const profile = findLatestOrById(state.readOnlyLabConnectionProfiles, request.profileId);
  if (!profile) {
    throw new ControlledReadOnlyLabEnablementError("lab_profile_required", "A read-only lab connection profile is required.");
  }

  const caCertificateRef = request.caCertificateRef ?? "platform-ca-bundle-ref";
  const scope = profile.allowedProviderScope;
  const checks = [
    check("Endpoint reference hardened", safeRef(profile.prismCentralEndpointRef), "Endpoint is a bounded reference, not a URL or hostname."),
    check("CA bundle reference hardened", safeRef(caCertificateRef), "CA validation uses a reference to a managed CA bundle."),
    check("Credential profile reference hardened", safeRef(profile.credentialProfileRef), "Credential material remains outside NDC Studio."),
    check("Profile approved", profile.approvalState === "Approved", profile.approvalState),
    check("Profile expiry valid", new Date(profile.expiresAt).getTime() > Date.now(), profile.expiresAt),
    check("Owner present", safeActor(profile.owner), profile.owner),
    check("Approver present", safeActor(profile.approvedBy ?? ""), profile.approvedBy ?? "Approver required."),
    check("Projects bounded", bounded(scope.projects), `${scope.projects.length} project reference(s).`),
    check("Clusters bounded", bounded(scope.clusters), `${scope.clusters.length} cluster reference(s).`),
    check("Networks bounded", bounded(scope.networks), `${scope.networks.length} network reference(s).`),
    check("Categories bounded", bounded(scope.categories), `${scope.categories.length} category reference(s).`),
  ];

  return {
    id: `hardened-lab-profile-${Date.now()}`,
    requestedBy: actor,
    profileId: profile.id,
    status: checks.every((item) => item.passed) ? "Hardened" : "Blocked",
    endpointRef: profile.prismCentralEndpointRef,
    caCertificateRef,
    expiresAt: profile.expiresAt,
    owner: profile.owner,
    approver: profile.approvedBy ?? "",
    boundedProviderScope: scope,
    checks,
    evidence: [
      "Lab connection profile was reviewed for reference-only endpoint, CA bundle, owner, approver, expiry, and bounded provider scope.",
      "Review does not open a Prism Central connection.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createCredentialResolverAdapterStubRecord(
  state: ApiState,
  request: CreateCredentialResolverAdapterStubRequest,
  actor: string
): CredentialResolverAdapterStubRecord {
  const contract = findLatestOrById(state.credentialProviderContractRecords, request.credentialContractId);
  if (!contract) {
    throw new ControlledReadOnlyLabEnablementError("credential_contract_required", "A credential provider contract is required.");
  }

  const checks = [
    check("Credential contract validated", contract.resolverStatus === "Validated reference", contract.resolverStatus),
    check("Reference scheme supported", supportedCredentialRef(contract.credentialProviderRef), contract.credentialProviderRef),
    check("Resolver disabled", true, "The adapter stub cannot return credential material."),
    check("Redaction rules inherited", contract.redactionRules.length >= 3, `${contract.redactionRules.length} rule(s).`),
    check("Fail-closed behavior declared", true, "Missing runtime authorization blocks all resolver calls."),
  ];

  return {
    id: `credential-resolver-stub-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Stub ready; resolver disabled" : "Blocked",
    provider: request.provider ?? "MockVault",
    credentialProviderRef: contract.credentialProviderRef,
    contractRecordId: contract.id,
    supportedReferenceSchemes: ["vault-ref", "cyberark-ref", "env-ref"],
    mockContractTests: checks,
    redactionRules: contract.redactionRules,
    failClosedReasons: [
      "Runtime resolver execution is disabled.",
      "Resolved secret values are unavailable by contract.",
      "Authorization headers are never emitted by this release.",
    ],
    resolvedSecretAvailable: false,
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createDisabledPrismReadOnlyHttpClientRecord(
  state: ApiState,
  request: CreateDisabledPrismReadOnlyHttpClientRequest,
  actor: string
): DisabledPrismReadOnlyHttpClientRecord {
  const adapter = findLatestOrById(state.disabledRealReadOnlyAdapterInterfaceRecords, request.adapterInterfaceId);
  const config = findLatestOrById(state.realReadOnlyAdapterConfigBoundaries, request.configBoundaryId);
  const resolver = findLatestOrById(state.credentialResolverAdapterStubRecords, request.credentialResolverStubId);
  if (!adapter || !config || !resolver) {
    throw new ControlledReadOnlyLabEnablementError("http_client_inputs_required", "Adapter interface, config boundary, and credential resolver stub are required.");
  }

  const requestShape = endpointPaths.map((path) => ({
    ...path,
    timeoutSeconds: config.timeoutSeconds,
    retryAttempts: config.retry.maxAttempts,
  }));
  const checks = [
    check("Adapter interface ready", adapter.status === "Interface ready; execution disabled", adapter.status),
    check("Config boundary ready", config.status === "Ready for credential contract", config.status),
    check("Credential resolver stub ready", resolver.status === "Stub ready; resolver disabled", resolver.status),
    check("Runtime flag absent", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "HTTP execution remains disabled unless a future explicit runtime flag is enabled."),
    check("Authorization gate required", true, "A future live pilot gate is required before any client execution."),
    check("Endpoint paths allowlisted", requestShape.length === readOnlyOperations.length, `${requestShape.length} read-only path(s).`),
  ];

  return {
    id: `disabled-prism-readonly-http-client-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Client shape ready; execution disabled" : "Blocked",
    adapterInterfaceId: adapter.id,
    configBoundaryId: config.id,
    credentialResolverStubId: resolver.id,
    requiredRuntimeFlag: "NDC_PRISM_READONLY_HTTP_ENABLED",
    authorizationGateRequired: true,
    requestShape,
    checks,
    blockedReasons: [
      "HTTP execution remains disabled.",
      "Credential resolver stub does not return secrets.",
      "A future operator pilot gate is required before live reads.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createLabConnectivityPreflightRecord(
  state: ApiState,
  request: CreateLabConnectivityPreflightRequest,
  actor: string
): LabConnectivityPreflightRecord {
  const profileReview = findLatestOrById(state.hardenedLabConnectionProfileReviews, request.hardenedProfileReviewId);
  const config = findLatestOrById(state.realReadOnlyAdapterConfigBoundaries, request.configBoundaryId);
  const resolver = findLatestOrById(state.credentialResolverAdapterStubRecords, request.credentialResolverStubId);
  const client = findLatestOrById(state.disabledPrismReadOnlyHttpClientRecords, request.httpClientRecordId);
  if (!profileReview || !config || !resolver || !client) {
    throw new ControlledReadOnlyLabEnablementError("preflight_inputs_required", "Hardened profile, config boundary, resolver stub, and HTTP client record are required.");
  }

  const validations = [
    check("Hardened profile ready", profileReview.status === "Hardened", profileReview.status),
    check("TLS mode safe", config.tlsValidationMode !== "insecure-disabled", config.tlsValidationMode),
    check("CA bundle reference present", safeRef(profileReview.caCertificateRef), profileReview.caCertificateRef),
    check("Timeout policy bounded", config.timeoutSeconds > 0 && config.timeoutSeconds <= 30, `${config.timeoutSeconds}s.`),
    check("Retry policy bounded", config.retry.maxAttempts <= 3 && config.retry.backoffMs <= 2000, `${config.retry.maxAttempts}/${config.retry.backoffMs}.`),
    check("Credential reference ready", resolver.status === "Stub ready; resolver disabled", resolver.status),
    check("HTTP client execution disabled", client.status === "Client shape ready; execution disabled", client.status),
    check("Read-only paths allowlisted", client.requestShape.length === readOnlyOperations.length, `${client.requestShape.length} path(s).`),
    check("No network call executed", true, "Connectivity preflight validates contracts only."),
  ];

  return {
    id: `lab-connectivity-preflight-${Date.now()}`,
    requestedBy: actor,
    status: validations.every((item) => item.passed) ? "Ready for operator pilot gate" : "Blocked",
    hardenedProfileReviewId: profileReview.id,
    configBoundaryId: config.id,
    credentialResolverStubId: resolver.id,
    httpClientRecordId: client.id,
    validations,
    allowedEndpointPaths: client.requestShape.map((item) => ({ operation: item.operation, path: item.path })),
    auditEvidence: [
      "Preflight validated profile hardening, TLS, timeout, retry, credential reference, and endpoint allowlist.",
      "No Prism Central request or inventory import was performed.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createAuthorizedReadOnlyLabPilotGateRecord(
  state: ApiState,
  request: CreateAuthorizedReadOnlyLabPilotGateRequest,
  actor: string
): AuthorizedReadOnlyLabPilotGateRecord {
  const preflight = findLatestOrById(state.labConnectivityPreflightRecords, request.preflightId);
  const dryRun = findLatestOrById(state.authorizedLabConnectionDryRunRecords, request.dryRunId);
  const decision = findLatestOrById(state.productionReadinessDecisionGates, request.productionDecisionGateId);
  if (!preflight || !dryRun || !decision) {
    throw new ControlledReadOnlyLabEnablementError("pilot_gate_inputs_required", "Preflight, dry run, and production decision gate are required.");
  }

  const requiredApprovers = request.requiredApprovers?.length ? request.requiredApprovers : ["platform.admin", "cloud.operations"];
  const acknowledgements = request.operatorAcknowledgements?.length
    ? request.operatorAcknowledgements
    : ["read-only-only", "no-inventory-import", "emergency-stop-ready"];
  const checks = [
    check("Connectivity preflight ready", preflight.status === "Ready for operator pilot gate", preflight.status),
    check("Authorized dry run ready", dryRun.status === "Ready for authorized lab connection review", dryRun.status),
    check("Production decision ready", decision.status === "Ready for CAB review", decision.status),
    check("Required approvers present", bounded(requiredApprovers), requiredApprovers.join(", ")),
    check(
      "Operator acknowledgements complete",
      ["read-only-only", "no-inventory-import", "emergency-stop-ready"].every((item) => acknowledgements.includes(item)),
      acknowledgements.join(", ")
    ),
    check("Provisioning disabled", true, "The pilot gate does not enable provisioning or inventory import."),
  ];

  return {
    id: `authorized-readonly-lab-pilot-gate-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Ready for future live read-only pilot" : "Blocked",
    preflightId: preflight.id,
    dryRunId: dryRun.id,
    productionDecisionGateId: decision.id,
    requiredApprovers,
    operatorAcknowledgements: acknowledgements,
    checks,
    stopConditions: [
      "Any endpoint, CA, credential, or scope reference changes.",
      "Any runtime flag attempts to enable HTTP execution without a new gate.",
      "Any mutation operation appears in an allowlist.",
      "Any credential value is resolved, logged, or exported.",
    ],
    evidence: [
      "Final operator pilot gate is ready for future live read-only pilot consideration.",
      "This gate remains non-executing and does not enable Prism Central calls.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function check(name: string, passed: boolean | undefined, detail: string) {
  return { name, passed: Boolean(passed), detail };
}

function findLatestOrById<T extends { id: string }>(records: T[], id?: string) {
  return id ? records.find((record) => record.id === id) : records[0];
}

function safeRef(value: string | undefined) {
  return Boolean(value && value.length <= 120 && !/[\\\r\n\t]|:\/\/|Bearer|token|password|secret|apikey|api_key|=|\$/i.test(value));
}

function safeActor(value: string) {
  return Boolean(value && value.length <= 120 && !/[\\\r\n\t]|:\/\/|Bearer|token|password|secret|apikey|api_key|\$/i.test(value));
}

function bounded(values: string[] | undefined) {
  return Boolean(values?.length && values.length <= 20 && values.every(safeRef));
}

function supportedCredentialRef(value: string) {
  return /^(vault-ref|cyberark-ref|env-ref)-[a-z0-9._:-]{3,80}$/i.test(value);
}
