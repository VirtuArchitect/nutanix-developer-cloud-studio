export type View = "dashboard" | "catalog" | "template" | "create" | "environment" | "environmentDetail" | "admin";
export type Target = "VM" | "Kubernetes" | "Database" | "Storage" | "AI Endpoint";
export type TemplateTier = "Standard" | "Regulated" | "Accelerated";
export type EnvironmentStatus = "Ready" | "Provisioning" | "Needs approval" | "Failed" | "Destroying" | "Destroyed";
export type JobState = "Idle" | "Queued" | "Running" | "Approval" | "Complete" | "Failed";
export type ControlPlaneJobState =
  | "Queued"
  | "Validating"
  | "AwaitingApproval"
  | "Provisioning"
  | "Ready"
  | "Failed"
  | "Expired"
  | "Destroying"
  | "Destroyed";
export type TemplateGovernance = Record<string, { owner: string; tier: TemplateTier }>;
export type ResourceProfileKind = "AHV Image" | "Kubernetes Version" | "Database Engine" | "Storage Class" | "AI Profile";
export type RegistryStatus = "Draft" | "Pending approval" | "Published" | "Deprecated";
export type ResourceProfileStatus = RegistryStatus;
export type ProvisioningAdapterName = "NCI" | "NKP" | "NDB" | "NUS" | "NCM" | "NAI";
export type ProvisioningAdapterCapability = "validateRequest" | "plan" | "provision" | "pollStatus" | "destroy";
export type PrismInventoryKind = "Cluster" | "Project" | "Image" | "Network" | "Category" | "VM";

export type Template = {
  id: string;
  name: string;
  summary: string;
  owner: string;
  tier: TemplateTier;
  targets: Target[];
  runtime: string;
  monthlyCost: number;
  compliance: string[];
  description: string;
  outcomes: string[];
  readiness: string[];
};

export type Environment = {
  name: string;
  template: string;
  owner: string;
  region: string;
  status: EnvironmentStatus;
  cost: number;
  createdAt: string;
};

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";
export type PlatformRole = "Developer" | "Approver" | "Platform Admin";
export type IntegrationConfigStatus = "Not configured" | "Configured" | "Reachable" | "Failed";
export type LabAdapterMode = "Mock" | "Configured" | "Reachable" | "Read-only candidate" | "Failed";

export type AuthorizationMatrixEntry = {
  action: string;
  roles: PlatformRole[];
  boundary: string;
};

export type SessionDiagnostics = {
  authMode: PlatformSession["authMode"];
  identityProvider: string;
  user: string;
  roles: PlatformRole[];
  trustedHeaderMode: "Optional" | "Required";
  missingRequiredHeaders: string[];
  authorizationMatrix: AuthorizationMatrixEntry[];
};

export type AuthBoundaryDiagnostics = {
  mode: "Optional" | "Required";
  user: string;
  issuer: string;
  roles: PlatformRole[];
  headerChecks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  rejectedMalformedHeaders: boolean;
  auditEventRecorded: boolean;
};

export type ApprovalRequest = {
  id: string;
  environmentName: string;
  template: string;
  owner: string;
  reason: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
};

export type Integration = {
  name: string;
  label: string;
  state: "Healthy" | "Warning" | "Preview";
  score: number;
  product: string;
  readiness: string;
  nextStep: string;
};

export type PlatformSession = {
  user: string;
  displayName: string;
  roles: PlatformRole[];
  authMode: "Mock OIDC" | "OIDC";
  identityProvider: string;
};

export type IntegrationConfig = {
  name: string;
  endpoint: string;
  credentialProfile: string;
  status: IntegrationConfigStatus;
  lastCheckedAt?: string;
  message: string;
};

export type CredentialReferenceStatus = "Missing" | "Invalid" | "Approved reference";

export type CredentialReferenceDiagnostic = {
  provider: ProvisioningAdapterName;
  credentialProfile: string;
  status: CredentialReferenceStatus;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  redactionBoundary: string;
};

export type LabAdapterSnapshot = {
  name: string;
  product: string;
  mode: LabAdapterMode;
  readOnly: boolean;
  provisioningEnabled: false;
  inventoryCount: number;
  lastDiscoveryAt?: string;
  scope: string;
  message: string;
  nextStep: string;
};

export type SystemStatus = {
  api: "Healthy";
  storage: "Ready";
  session: PlatformSession;
  integrations: {
    total: number;
    configured: number;
    reachable: number;
    readOnlyCandidates: number;
  };
  provisioningEnabled: false;
};

export type ResourceProfile = {
  id: string;
  kind: ResourceProfileKind;
  name: string;
  provider: ProvisioningAdapterName;
  version: string;
  status: ResourceProfileStatus;
  owner: string;
  region: string;
  notes: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type PolicyBundle = {
  id: string;
  name: string;
  owner: string;
  controls: string[];
  evidence: string;
};

export type TemplateRegistryEntry = {
  templateId: string;
  templateName: string;
  version: string;
  owner: string;
  status: RegistryStatus;
  policyBundleIds: string[];
  lastChangedAt: string;
  approvalEvidence: string;
  notes: string;
};

export type PlatformConfig = {
  prismCentralUrl: string;
  defaultProject: string;
  defaultCluster: string;
  networkProfile: string;
  credentialReference: string;
  provisioningEnabled: false;
  message: string;
};

export type ProvisioningAdapterReadiness = {
  name: ProvisioningAdapterName;
  product: string;
  mode: "Mock";
  capabilities: ProvisioningAdapterCapability[];
  configured: boolean;
  provisioningEnabled: false;
  nextGate: string;
};

export type AdapterEnablementRecord = {
  id: string;
  provider: ProvisioningAdapterName;
  product: string;
  status: "Blocked" | "Ready for review";
  reviewer: string;
  rollbackOwner: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  mutationOperationsBlocked: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type PrismReadOnlyScope = {
  endpoint: string;
  credentialProfile: string;
  project: string;
  cluster: string;
  network: string;
  authorizedScopeRef: string;
  realAdapterEnabled: false;
};

export type PrismReadOnlyOperation = "listClusters" | "listProjects" | "listImages" | "listSubnets" | "listCategories" | "listVms";

export type PrismReadOnlyRequestPlan = {
  operation: PrismReadOnlyOperation;
  method: "POST";
  path: string;
  body: Record<string, unknown>;
  scope: PrismReadOnlyScope;
  networkCallEnabled: false;
  mutationOperationsBlocked: string[];
};

export type PrismReadOnlyAdapterDiagnostics = {
  adapter: "DisabledReadOnlyPrismAdapter";
  mode: "Fixture-only request scaffold";
  endpointConfigured: boolean;
  credentialReferenceConfigured: boolean;
  supportedOperations: PrismReadOnlyOperation[];
  networkCallEnabled: false;
  provisioningEnabled: false;
  mutationOperationsBlocked: string[];
  requestPlans: PrismReadOnlyRequestPlan[];
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
};

export type ReadOnlyPrismLabGate = {
  id: string;
  status: "Blocked" | "Ready for fixture contract validation";
  requestedBy: string;
  createdAt: string;
  scopeRef: string;
  endpointRef: string;
  credentialProfile: string;
  allowedOperations: PrismReadOnlyOperation[];
  excludedOperations: string[];
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
};

export type ReadOnlyLabConnectionProfile = {
  id: string;
  name: string;
  provider: "NCI";
  prismCentralEndpointRef: string;
  credentialProfileRef: string;
  allowedProviderScope: {
    projects: string[];
    clusters: string[];
    networks: string[];
    categories: string[];
  };
  owner: string;
  approvedBy?: string;
  approvalState: "Draft" | "Approved" | "Expired";
  expiresAt: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type SanitizedPrismInventoryFixtureRecord = {
  kind: PrismInventoryKind;
  name: string;
  cluster?: string;
  project?: string;
  network?: string;
  categories: string[];
  rawRef: string;
};

export type PrismFixtureReplayRecord = {
  id: string;
  fixtureName: string;
  source: "Bundled sanitized fixture" | "Uploaded sanitized fixture";
  requestedBy: string;
  recordCount: number;
  profileCandidateCount: number;
  contractOperations: PrismReadOnlyOperation[];
  status: "Passed" | "Blocked";
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  replayedRecords: SanitizedPrismInventoryFixtureRecord[];
  mutationOperationsBlocked: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type ReadOnlyAdapterAuthorizationGate = {
  id: string;
  requestedBy: string;
  profileId: string;
  fixtureReplayId: string;
  labGateId: string;
  status: "Blocked" | "Ready for future live read-only review";
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  authorizationPacket: {
    scopeRef: string;
    credentialProfileRef: string;
    approvedOperations: PrismReadOnlyOperation[];
    excludedOperations: string[];
    expiresAt: string;
  };
  evidence: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type OperatorEvidenceExportPack = {
  id: string;
  requestedBy: string;
  status: "Prepared";
  format: "JSON";
  includedArtifacts: Array<{
    name: string;
    count: number;
    redacted: boolean;
  }>;
  manifest: {
    generatedAt: string;
    readinessScore: number;
    authBoundaryMode: AuthBoundaryDiagnostics["mode"];
    configValidationStatus: ContainerConfigValidationManifest["status"];
    labGateCount: number;
    liveDesignStatus: LiveReadOnlyPrismCallDesign["status"];
  };
  redactionRules: string[];
  evidence: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type LabPilotRunbookWorkflow = {
  id: string;
  requestedBy: string;
  owner: string;
  profileId: string;
  authorizationGateId: string;
  evidenceExportId: string;
  phase: "Prepared" | "Approved" | "Dry-run executed" | "Evidence reviewed" | "Closed";
  status: "Blocked" | "In review" | "Closed";
  steps: Array<{
    name: "Prepare" | "Approve" | "Execute dry-run" | "Review evidence" | "Close pilot";
    status: "Pending" | "Complete" | "Blocked";
    evidence: string;
    completedAt?: string;
  }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
  updatedAt: string;
};

export type ReadOnlyAdapterRuntimeMode = "simulated" | "fixture-replay" | "authorized-read-only-lab";

export type ReadOnlyAdapterRuntimeModeRecord = {
  id: string;
  requestedBy: string;
  requestedMode: ReadOnlyAdapterRuntimeMode;
  activeMode: ReadOnlyAdapterRuntimeMode;
  status: "Active" | "Blocked";
  source: "Mock Prism Central" | "Sanitized fixture replay" | "Authorized lab pilot";
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  rollbackMode: "simulated";
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type LiveReadOnlyInventoryPilotRecord = {
  id: string;
  requestedBy: string;
  runtimeModeRecordId: string;
  authorizationGateId: string;
  runbookWorkflowId: string;
  status: "Blocked" | "Completed";
  adapter: "NCI";
  mode: "Authorized read-only lab pilot";
  operations: PrismReadOnlyOperation[];
  recordsImported: number;
  profileCandidates: number;
  inventorySummary: Array<{ kind: PrismInventoryKind; count: number }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  redactionRules: string[];
  evidence: string[];
  mutationOperationsBlocked: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type ReadOnlyAdapterObservabilityRecord = {
  id: string;
  requestedBy: string;
  runtimeModeRecordId?: string;
  inventoryPilotId?: string;
  status: "Prepared";
  traces: Array<{
    operation: PrismReadOnlyOperation;
    requestId: string;
    status: "Simulated" | "Blocked" | "Observed";
    latencyMs: number;
    redacted: boolean;
  }>;
  summary: {
    observedOperations: number;
    blockedMutations: number;
    redactedFields: string[];
    latestStatus: "Healthy" | "Blocked" | "Needs review";
  };
  auditEventCount: number;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type LabPilotOperatorConsole = {
  id: string;
  generatedAt: string;
  status: "Blocked" | "Ready for pilot review" | "Ready for production decision";
  activeRuntimeMode: ReadOnlyAdapterRuntimeMode;
  activeAuthorizationGate?: string;
  activeRunbookWorkflow?: string;
  latestInventoryPilot?: string;
  latestEvidenceExport?: string;
  readiness: Array<{ name: string; status: "Ready" | "Required" | "Blocked"; detail: string }>;
  counters: {
    profiles: number;
    fixtureReplays: number;
    authorizationGates: number;
    inventoryPilots: number;
    observabilityRecords: number;
  };
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
};

export type ProductionReadinessDecisionGate = {
  id: string;
  requestedBy: string;
  decision: "Go" | "No-go";
  status: "Ready for CAB review" | "Blocked";
  approvers: string[];
  rollbackOwner: string;
  supportContact: string;
  retentionPolicy: string;
  checklist: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  blockers: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type PrismReadOnlyTlsValidationMode = "system-ca" | "private-ca-ref" | "insecure-disabled";

export type RealReadOnlyAdapterConfigBoundary = {
  id: string;
  requestedBy: string;
  status: "Ready for credential contract" | "Blocked";
  endpointRef: string;
  credentialProviderRef: string;
  caCertificateRef?: string;
  tlsValidationMode: PrismReadOnlyTlsValidationMode;
  timeoutSeconds: number;
  retry: {
    maxAttempts: number;
    backoffMs: number;
  };
  allowedOperations: PrismReadOnlyOperation[];
  killSwitch: "Closed" | "Open";
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type CredentialProviderContractRecord = {
  id: string;
  requestedBy: string;
  provider: "MockVault" | "DisabledExternalVault";
  credentialProviderRef: string;
  resolverStatus: "Validated reference" | "Blocked";
  resolvedSecretAvailable: false;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  redactionRules: string[];
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type DisabledRealReadOnlyAdapterInterfaceRecord = {
  id: string;
  requestedBy: string;
  status: "Interface ready; execution disabled" | "Blocked";
  adapter: "PrismCentralReadOnlyAdapter";
  configBoundaryId: string;
  credentialContractId: string;
  supportedOperations: PrismReadOnlyOperation[];
  endpointPaths: Array<{ operation: PrismReadOnlyOperation; method: "POST"; path: string }>;
  normalizationTargets: PrismInventoryKind[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  blockedReasons: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type OfflineContractReplaySuiteRecord = {
  id: string;
  requestedBy: string;
  status: "Passed" | "Blocked";
  adapterInterfaceId: string;
  fixtureReplayId: string;
  coverage: Array<{
    kind: PrismInventoryKind;
    operation: PrismReadOnlyOperation;
    expectedCount: number;
    normalizedCount: number;
    passed: boolean;
  }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type AuthorizedLabConnectionDryRunRecord = {
  id: string;
  requestedBy: string;
  status: "Ready for authorized lab connection review" | "Blocked";
  configBoundaryId: string;
  credentialContractId: string;
  adapterInterfaceId: string;
  offlineReplaySuiteId: string;
  productionDecisionGateId: string;
  validations: Array<{ name: string; passed: boolean; detail: string }>;
  auditEvidence: string[];
  redactionSummary: string[];
  allowedEndpointPaths: Array<{ operation: PrismReadOnlyOperation; path: string }>;
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type HardenedLabConnectionProfileReview = {
  id: string;
  requestedBy: string;
  profileId: string;
  status: "Hardened" | "Blocked";
  endpointRef: string;
  caCertificateRef: string;
  expiresAt: string;
  owner: string;
  approver: string;
  boundedProviderScope: {
    projects: string[];
    clusters: string[];
    networks: string[];
    categories: string[];
  };
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type CredentialResolverAdapterStubRecord = {
  id: string;
  requestedBy: string;
  status: "Stub ready; resolver disabled" | "Blocked";
  provider: "MockVault" | "DisabledVault" | "DisabledCyberArk" | "DisabledEnvironment";
  credentialProviderRef: string;
  contractRecordId: string;
  supportedReferenceSchemes: Array<"vault-ref" | "cyberark-ref" | "env-ref">;
  mockContractTests: Array<{ name: string; passed: boolean; detail: string }>;
  redactionRules: string[];
  failClosedReasons: string[];
  resolvedSecretAvailable: false;
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type DisabledPrismReadOnlyHttpClientRecord = {
  id: string;
  requestedBy: string;
  status: "Client shape ready; execution disabled" | "Blocked";
  adapterInterfaceId: string;
  configBoundaryId: string;
  credentialResolverStubId: string;
  requiredRuntimeFlag: "NDC_PRISM_READONLY_HTTP_ENABLED";
  authorizationGateRequired: true;
  requestShape: Array<{
    operation: PrismReadOnlyOperation;
    method: "POST";
    path: string;
    timeoutSeconds: number;
    retryAttempts: number;
  }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  blockedReasons: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type LabConnectivityPreflightRecord = {
  id: string;
  requestedBy: string;
  status: "Ready for operator pilot gate" | "Blocked";
  hardenedProfileReviewId: string;
  configBoundaryId: string;
  credentialResolverStubId: string;
  httpClientRecordId: string;
  validations: Array<{ name: string; passed: boolean; detail: string }>;
  allowedEndpointPaths: Array<{ operation: PrismReadOnlyOperation; path: string }>;
  auditEvidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type AuthorizedReadOnlyLabPilotGateRecord = {
  id: string;
  requestedBy: string;
  status: "Ready for future live read-only pilot" | "Blocked";
  preflightId: string;
  dryRunId: string;
  productionDecisionGateId: string;
  requiredApprovers: string[];
  operatorAcknowledgements: string[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  stopConditions: string[];
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type ReadOnlyRuntimeEnablementPolicyRecord = {
  id: string;
  requestedBy: string;
  status: "Policy ready for pilot session" | "Blocked";
  pilotGateId: string;
  runtimeFlag: "NDC_PRISM_READONLY_HTTP_ENABLED";
  requiredApprovals: string[];
  allowedEnvironments: string[];
  expiresAt: string;
  rollbackMode: "simulated";
  emergencyStop: {
    owner: string;
    contact: string;
    procedureRef: string;
    tested: boolean;
  };
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type ReadOnlyPilotSessionRecord = {
  id: string;
  requestedBy: string;
  status: "Session window ready" | "Blocked";
  operator: string;
  startedAt: string;
  endsAt: string;
  approvedGateId: string;
  policyId: string;
  runtimeMode: "authorized-read-only-lab";
  evidenceLinks: string[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type LiveReadOnlyCallEnvelopeRecord = {
  id: string;
  requestedBy: string;
  status: "Envelope ready; execution disabled" | "Blocked";
  pilotSessionId: string;
  httpClientRecordId: string;
  operationEnvelopes: Array<{
    operation: PrismReadOnlyOperation;
    method: "POST";
    path: string;
    timeoutSeconds: number;
    retryAttempts: number;
    requestId: string;
    redactedFields: string[];
    expectedResponseShape: string;
    executionEnabled: false;
  }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type PilotEvidenceReviewRecord = {
  id: string;
  requestedBy: string;
  status: "Approved for rollback drill" | "Rejected" | "Blocked";
  callEnvelopeId: string;
  pilotSessionId: string;
  reviewer: string;
  decision: "Approve" | "Reject";
  findings: string[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type EmergencyStopRollbackDrillRecord = {
  id: string;
  requestedBy: string;
  status: "Drill passed" | "Blocked";
  pilotEvidenceReviewId: string;
  policyId: string;
  simulatedModeRestored: boolean;
  evidencePreserved: boolean;
  emergencyStopOwner: string;
  rollbackMode: "simulated";
  steps: Array<{ name: string; status: "Complete" | "Blocked"; evidence: string }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type LabReadinessWorkspaceRecord = {
  id: string;
  requestedBy: string;
  status: "Ready for mock-to-lab review" | "Blocked";
  mockPrismStatus: "Healthy" | "Blocked";
  readinessSummary: {
    mockPrismReady: boolean;
    readOnlyAdapterReady: boolean;
    runtimePolicyReady: boolean;
    pilotSessionReady: boolean;
    evidenceReviewApproved: boolean;
    emergencyStopDrillPassed: boolean;
  };
  blockerSummary: string[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type MockPrismEndpointExpansionRecord = {
  id: string;
  requestedBy: string;
  status: "Expanded simulator contract ready" | "Blocked";
  workspaceId: string;
  supportedEndpoints: Array<{
    method: "GET" | "POST";
    path: string;
    responseShape: string;
  }>;
  authHeaderMode: "mock-required";
  latencySimulationMs: number;
  rateLimitSimulation: {
    requestsPerMinute: number;
    mode: "simulated";
  };
  failureModes: string[];
  redactedRequestLogFields: string[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type AdapterContractTestHarnessRecord = {
  id: string;
  requestedBy: string;
  status: "Contract harness passed" | "Blocked";
  mockExpansionId: string;
  testSuites: Array<{
    name: string;
    status: "Passed" | "Blocked";
    assertions: string[];
  }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type LabConnectionDryRunConsoleRecord = {
  id: string;
  requestedBy: string;
  status: "Dry-run console ready" | "Blocked";
  contractHarnessId: string;
  selectedEndpointRef: string;
  credentialProviderRef: string;
  allowedOperations: PrismReadOnlyOperation[];
  expectedRequests: Array<{ operation: PrismReadOnlyOperation; method: "POST"; path: string }>;
  expectedResponses: string[];
  blockedMutations: string[];
  rollbackPath: string[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type EvidenceExportPackV2Record = {
  id: string;
  requestedBy: string;
  status: "Export pack ready" | "Blocked";
  dryRunConsoleId: string;
  manifest: Array<{ section: string; recordId: string; redacted: boolean }>;
  checksum: string;
  readinessSummary: string[];
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type RealLabAuthorizationPacketRecord = {
  id: string;
  requestedBy: string;
  status: "Ready to request real lab access" | "Blocked";
  evidenceExportPackId: string;
  requiredLabDetails: string[];
  prismCentralEndpointRequirements: string[];
  credentialVaultRequirements: string[];
  networkBoundary: string[];
  approvalOwners: string[];
  rollbackOwner: string;
  pentestScopeEvidence: string[];
  goNoGoChecklist: Array<{ name: string; passed: boolean; detail: string }>;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  provisioningEnabled: false;
  networkCallEnabled: false;
  realPrismCallsEnabled: false;
  createdAt: string;
};

export type ProductionHardeningCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type ApiContractOperation = {
  method: "GET" | "POST";
  path: string;
  requiredRoles: PlatformRole[];
  summary: string;
  responseShape: string;
  mutationBoundary: "Read-only snapshot" | "Evidence record only" | "Simulated state transition";
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type ApiContractBaseline = {
  id: string;
  version: string;
  generatedAt: string;
  status: "Contract baseline ready";
  title: string;
  openApiVersion: "3.1.0";
  operations: ApiContractOperation[];
  examples: Array<{
    name: string;
    method: ApiContractOperation["method"];
    path: string;
    requestExample?: Record<string, unknown>;
    responseExample: Record<string, unknown>;
  }>;
  checks: ProductionHardeningCheck[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type RbacEnforcementMatrix = {
  id: string;
  generatedAt: string;
  status: "RBAC matrix enforced";
  roles: PlatformRole[];
  routes: Array<{
    method: ApiContractOperation["method"];
    path: string;
    allowedRoles: PlatformRole[];
    deniedRoles: PlatformRole[];
    enforcement: "requireRole";
  }>;
  negativeTestCases: Array<{
    actorRole: PlatformRole;
    method: ApiContractOperation["method"];
    path: string;
    expectedStatus: 403;
  }>;
  checks: ProductionHardeningCheck[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type PersistenceBoundaryStatus = {
  id: string;
  generatedAt: string;
  status: "Repository boundary ready" | "Repository boundary needs durable mode";
  repositoryMode: "memory" | "json-file";
  durable: boolean;
  repositoryInterface: string[];
  migrationTargets: string[];
  checks: ProductionHardeningCheck[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type AuditIntegrityManifest = {
  id: string;
  generatedAt: string;
  status: "Integrity manifest ready";
  retainedEvents: number;
  digestAlgorithm: "sha256";
  eventDigests: Array<{
    eventId: string;
    action: string;
    digest: string;
  }>;
  manifestDigest: string;
  redactionBoundary: string;
  checks: ProductionHardeningCheck[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type DeploymentProfileValidation = {
  id: string;
  generatedAt: string;
  status: "Profiles validated";
  activeProfile: "local" | "hosted-demo" | "on-prem-starter" | "lab-prep";
  profiles: Array<{
    name: DeploymentProfileValidation["activeProfile"];
    purpose: string;
    ready: boolean;
    checks: ProductionHardeningCheck[];
  }>;
  failClosedControls: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type OperationsRunbookConsole = {
  id: string;
  generatedAt: string;
  status: "Ready for operator review" | "Blocked";
  readinessScore: number;
  blockedGates: string[];
  runbookSteps: Array<{
    name: string;
    state: "Ready" | "Blocked" | "Evidence pending";
    evidence: string;
  }>;
  evidenceSummary: Array<{
    name: string;
    count: number;
  }>;
  checks: ProductionHardeningCheck[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type PrismInventoryRecord = {
  id: string;
  kind: PrismInventoryKind;
  name: string;
  source: "Mock Prism Central" | "Prism Central";
  cluster?: string;
  project?: string;
  network?: string;
  powerState?: "On" | "Off" | "Unknown";
  categories: string[];
  importedAt: string;
  rawRef: string;
  profileCandidate?: boolean;
};

export type PrismInventoryImportResult = {
  adapter: "NCI";
  mode: "Mock read-only" | "Real adapter disabled";
  readOnly: true;
  provisioningEnabled: false;
  importedAt: string;
  recordsImported: number;
  profileCandidates: number;
  scope: PrismReadOnlyScope;
  evidence: string;
  mutationOperationsBlocked: string[];
};

export type MockPrismSimulatorStatus = {
  service: "Mock Prism Central";
  status: "Healthy";
  mode: "Simulated";
  endpoint: string;
  mutationBoundary: string;
  availableInventory: {
    clusters: number;
    projects: number;
    images: number;
    subnets: number;
    categories: number;
    vms: number;
  };
};

export type MockPrismExecution = {
  id: string;
  environmentName: string;
  provider: "NCI";
  adapterMode: "Mock Prism Central";
  endpoint: string;
  request: {
    project: string;
    cluster: string;
    image: string;
    subnet: string;
    categories: string[];
    targets: Target[];
  };
  task: {
    uuid: string;
    state: "SUCCEEDED" | "FAILED" | "TIMEOUT";
    percentageComplete: number;
    message: string;
  };
  evidence: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type PrismAdapterMode = "mock-prism" | "real-prism-disabled";

export type PrismAdapterBlockedReason = {
  code:
    | "lab_scope_required"
    | "credential_reference_required"
    | "authorization_packet_required"
    | "kill_switch_closed"
    | "real_adapter_disabled";
  message: string;
  evidenceRequired: string;
};

export type PrismAdapterDiagnostics = {
  activeMode: PrismAdapterMode;
  activeAdapter: "MockPrismAdapter" | "DisabledRealPrismAdapter";
  mockEndpoint: string;
  realEndpointConfigured: boolean;
  provisioningEnabled: false;
  supportedOperations: ReadonlyArray<"health" | "listInventory" | "createVmPlan" | "submitVmCreate" | "pollTask">;
  blockedReasons: PrismAdapterBlockedReason[];
  readinessChecks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  operatorActions: Array<{
    label: string;
    status: "Ready" | "Required" | "Blocked";
    detail: string;
  }>;
  realAdapterBoundary: string;
  lastMockTask?: {
    environmentName: string;
    taskUuid: string;
    state: MockPrismExecution["task"]["state"];
    createdAt: string;
  };
};

export type PrismSimulatorProfileKind = "Project" | "Cluster" | "Image" | "Subnet" | "Category";
export type PrismSimulatorProfileStatus = "Active" | "Draft" | "Deprecated";

export type PrismSimulatorProfile = {
  id: string;
  kind: PrismSimulatorProfileKind;
  name: string;
  status: PrismSimulatorProfileStatus;
  provider: "NCI";
  region: string;
  selected: boolean;
  attributes: Record<string, string | number | boolean>;
  updatedAt: string;
};

export type PrismSimulatorFailureScenarioId =
  | "none"
  | "image-not-found"
  | "quota-exceeded"
  | "subnet-unavailable"
  | "approval-missing"
  | "task-failed"
  | "task-timeout";

export type PrismSimulatorFailureScenario = {
  id: PrismSimulatorFailureScenarioId;
  label: string;
  active: boolean;
  effect: string;
  taskState: MockPrismExecution["task"]["state"];
  percentageComplete: number;
  updatedAt: string;
};

export type RealPrismPreflightRun = {
  id: string;
  status: "Blocked" | "Ready for read-only validation";
  requestedBy: string;
  createdAt: string;
  endpointConfigured: boolean;
  provisioningEnabled: false;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  blockedReasons: PrismAdapterBlockedReason[];
  mutationOperationsBlocked: string[];
  evidence: string[];
};

export type RuntimeObservabilitySnapshot = {
  version: string;
  generatedAt: string;
  requestId: string;
  actor: string;
  storageMode: "json" | "postgres" | "memory";
  staticServing: boolean;
  rateLimitPerMinute: number;
  auditEventsRetained: number;
  latestAuditEvents: Array<{
    id: string;
    action: string;
    actor: string;
    target: string;
    createdAt: string;
  }>;
  guardrails: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
};

export type ProductionReadinessScorecard = {
  version: string;
  generatedAt: string;
  score: number;
  status: "Blocked" | "Needs evidence" | "Ready for controlled read-only pilot";
  categories: Array<{
    name: string;
    passed: number;
    total: number;
    checks: Array<{
      name: string;
      passed: boolean;
      detail: string;
    }>;
  }>;
  blockers: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type ContainerConfigValidationManifest = {
  version: string;
  generatedAt: string;
  status: "Passed" | "Blocked";
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type LiveReadOnlyPrismCallDesign = {
  version: string;
  generatedAt: string;
  status: "Design only";
  allowedEndpoints: Array<{
    operation: PrismReadOnlyOperation;
    method: "POST";
    path: string;
  }>;
  timeoutMs: number;
  retryPolicy: {
    attempts: number;
    backoff: "fixed" | "exponential";
    retryableStatusCodes: number[];
  };
  redactionRules: string[];
  errorTaxonomy: Array<{
    code: string;
    meaning: string;
  }>;
  enablementGates: string[];
  provisioningEnabled: false;
  realPrismCallsEnabled: false;
};

export type VmSandboxDryRunRequest = {
  environmentName: string;
  owner: string;
  imageProfileId: string;
  project: string;
  cluster: string;
  network: string;
  category: string;
  cpu: number;
  memoryGb: number;
  diskGb: number;
  expiryDays: number;
};

export type VmSandboxDryRunPlan = {
  id: string;
  environmentName: string;
  owner: string;
  templateId: "vm-app";
  imageProfileId: string;
  imageName: string;
  project: string;
  cluster: string;
  network: string;
  category: string;
  quota: {
    cpu: number;
    memoryGb: number;
    diskGb: number;
    maxCpu: number;
    maxMemoryGb: number;
    maxDiskGb: number;
  };
  expiryDays: number;
  estimatedMonthlyCost: number;
  approvalEvidence: string[];
  validations: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  rollbackPlan: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledProvisioningGateStatus =
  | "Blocked"
  | "Manual approval required"
  | "Approved for controlled create"
  | "Mutation disabled";

export type ControlledProvisioningDecision = "approve" | "reject";

export type ControlledProvisioningGate = {
  id: string;
  dryRunPlanId: string;
  environmentName: string;
  owner: string;
  requestedBy: string;
  status: ControlledProvisioningGateStatus;
  approval: {
    status: "Pending" | "Approved" | "Rejected";
    decidedBy?: string;
    decidedAt?: string;
    evidence: string;
  };
  pentestScope: {
    required: true;
    present: boolean;
    reference: string;
    structurallyValid: boolean;
  };
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  rollbackPlan: string[];
  destroyPlan: string[];
  mutationKillSwitch: boolean;
  provisioningEnabled: false;
  createdAt: string;
  updatedAt: string;
};

export type LabAuthorizationScope = {
  id: string;
  version: string;
  name: string;
  targetEnvironment: string;
  owner: string;
  approver: string;
  approvedAt: string;
  expiresAt: string;
  project: string;
  cluster: string;
  network: string;
  providerCoverage: ProvisioningAdapterName[];
  targetEndpoints: string[];
  allowedActions: string[];
  excludedActions: string[];
  pentestScopeReference: string;
  pentestScopeStructurallyValid: boolean;
  evidenceReferences: string[];
  rollbackOwner: string;
  status: "Approved" | "Expired";
  createdAt: string;
};

export type LabScopeDiagnostics = {
  generatedAt: string;
  totalScopes: number;
  readyScopes: number;
  providerCoverage: Array<{
    provider: ProvisioningAdapterName;
    covered: boolean;
    scopeId?: string;
  }>;
  latest?: {
    scopeId: string;
    status: LabAuthorizationScope["status"];
    expiresAt: string;
    daysUntilExpiry: number;
    checks: Array<{
      name: string;
      passed: boolean;
      detail: string;
    }>;
    readyForAdapterReview: boolean;
  };
};

export type VmLifecycleProof = {
  id: string;
  gateId: string;
  environmentName: string;
  status: "Verified" | "Blocked";
  rollbackVerified: boolean;
  destroyVerified: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type RollbackDestroyProofRecord = {
  id: string;
  dryRunPlanId: string;
  environmentName: string;
  status: "Blocked" | "Ready for controlled create";
  requestedBy: string;
  rollbackOwner: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  teardownOrder: string[];
  stopConditions: string[];
  evidenceReferences: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledCreateAuthorizationEnvelope = {
  id: string;
  status: "Blocked" | "Ready for authorization review";
  requestedBy: string;
  environmentName: string;
  dryRunPlanId: string;
  gateId?: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  allowedCreateFields: string[];
  killSwitch: {
    name: string;
    enabled: boolean;
  };
  emergencyStopProcedure: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type AhvCreateAdapterContractReview = {
  id: string;
  environmentName: string;
  dryRunPlanId: string;
  adapterMode: "Disabled real adapter";
  status: "Blocked" | "Payload ready but execution disabled";
  requestedBy: string;
  payload: {
    name: string;
    project: string;
    cluster: string;
    network: string;
    imageProfileId: string;
    cpu: number;
    memoryGb: number;
    diskGb: number;
    category: string;
    owner: string;
  };
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  blockedOperations: string[];
  killSwitch: {
    name: string;
    enabled: boolean;
  };
  provisioningEnabled: false;
  createdAt: string;
};

export type AhvControlledProvisioningRun = {
  id: string;
  gateId: string;
  dryRunPlanId: string;
  environmentName: string;
  action: "Create VM" | "Destroy VM";
  adapterMode: "Disabled real adapter";
  status: "Preflight blocked" | "Ready but disabled";
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  requestedBy: string;
  labScopeId?: string;
  lifecycleProofId?: string;
  mutationOperationsBlocked: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type PlatformServiceKind = "NKP Namespace" | "NDB PostgreSQL" | "NUS Storage" | "NAI Endpoint";

export type PlatformServiceRequest = {
  id: string;
  kind: PlatformServiceKind;
  serviceName: string;
  environmentName: string;
  owner: string;
  profileId: string;
  profileName: string;
  provider: ProvisioningAdapterName;
  status: "Blocked" | "Ready for approval" | "Needs approval";
  dependsOnVmLifecycle: true;
  vmLifecycleProven: boolean;
  validations: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  estimatedMonthlyCost: number;
  approvalRequired: boolean;
  approvalEvidence: string[];
  rollbackPlan: string[];
  cleanupPlan: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type PlatformServicePreflightRun = {
  id: string;
  requestId: string;
  kind: PlatformServiceKind;
  serviceName: string;
  provider: ProvisioningAdapterName;
  adapterMode: "Disabled real adapter";
  status: "Preflight blocked" | "Ready but disabled";
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  requestedBy: string;
  mutationOperationsBlocked: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type PlatformServiceAdapterContractReview = {
  id: string;
  requestId: string;
  preflightRunId?: string;
  kind: PlatformServiceKind;
  serviceName: string;
  provider: ProvisioningAdapterName;
  adapterMode: "Disabled real adapter";
  status: "Blocked" | "Payload ready but execution disabled";
  requestedBy: string;
  payload: {
    kind: PlatformServiceKind;
    provider: ProvisioningAdapterName;
    serviceName: string;
    environmentName: string;
    owner: string;
    profileId: string;
    profileName: string;
    estimatedMonthlyCost: number;
    approvalRequired: boolean;
    rollbackPlan: string[];
    cleanupPlan: string[];
  };
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  blockedOperations: string[];
  killSwitch: {
    name: string;
    enabled: boolean;
  };
  provisioningEnabled: false;
  createdAt: string;
};

export type ProviderReleaseGateRecord = {
  id: string;
  provider: Exclude<ProvisioningAdapterName, "NCM">;
  product: string;
  status: "Blocked" | "Ready for release review";
  requestedBy: string;
  releaseApprover: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  blockedOperations: string[];
  killSwitch: {
    name: string;
    enabled: boolean;
  };
  provisioningEnabled: false;
  createdAt: string;
};

export type ReleaseEvidenceExportRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  gateId: string;
  status: "Prepared";
  requestedBy: string;
  format: "JSON";
  checksumAlgorithm: "sha256";
  checksum: string;
  manifest: {
    exportId: string;
    gateId: string;
    provider: ProviderReleaseGateRecord["provider"];
    gateStatus: ProviderReleaseGateRecord["status"];
    generatedAt: string;
    releaseApprover: string;
    checkCount: number;
    passedChecks: number;
    blockedOperations: string[];
    killSwitch: ProviderReleaseGateRecord["killSwitch"];
    evidenceReferences: string[];
  };
  redactionBoundary: string;
  storageBoundary: string;
  provisioningEnabled: false;
  createdAt: string;
};

export type ProviderReleaseReadinessSummary = {
  generatedAt: string;
  providers: Array<{
    provider: ProviderReleaseGateRecord["provider"];
    latestGateId?: string;
    status: "No gate" | ProviderReleaseGateRecord["status"];
    checkCount: number;
    passedChecks: number;
    gapCount: number;
    gaps: string[];
    blockedOperations: string[];
    killSwitch: ProviderReleaseGateRecord["killSwitch"];
  }>;
  nearestToReady?: ProviderReleaseGateRecord["provider"];
  mostBlocked?: ProviderReleaseGateRecord["provider"];
  provisioningEnabled: false;
};

export type ControlledLabReleaseRunbookRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  readinessGeneratedAt: string;
  status: "Blocked" | "Ready for controlled lab release review";
  requestedBy: string;
  signOffs: Array<{
    role: "Platform owner" | "Security reviewer" | "Rollback owner" | "Lab owner";
    owner: string;
    signed: boolean;
    evidence: string;
  }>;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  stopConditions: string[];
  escalationContacts: string[];
  linkedReleaseGateId?: string;
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledLabDryRunWindowRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  status: "Blocked" | "Ready for scheduling review";
  requestedBy: string;
  scheduledStart: string;
  scheduledEnd: string;
  linkedRunbookId?: string;
  linkedReleaseEvidenceExportId?: string;
  linkedLabScopeId?: string;
  rollbackOwner: string;
  emergencyStopContacts: string[];
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  readinessChecklist: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type LabWindowEvidenceExportRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  windowId: string;
  status: "Prepared";
  requestedBy: string;
  format: "JSON";
  checksumAlgorithm: "sha256";
  checksum: string;
  manifest: {
    exportId: string;
    windowId: string;
    provider: ProviderReleaseGateRecord["provider"];
    windowStatus: ControlledLabDryRunWindowRecord["status"];
    generatedAt: string;
    scheduledStart: string;
    scheduledEnd: string;
    linkedRunbookId?: string;
    linkedReleaseEvidenceExportId?: string;
    linkedLabScopeId?: string;
    rollbackOwner: string;
    emergencyStopContacts: string[];
    checkCount: number;
    passedChecks: number;
    readinessChecklist: string[];
    provisioningEnabled: false;
  };
  redactionBoundary: string;
  storageBoundary: string;
  provisioningEnabled: false;
  createdAt: string;
};

export type LabEvidenceReviewRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  exportId: string;
  windowId: string;
  status: "Blocked" | "Accepted" | "Rejected";
  requestedBy: string;
  decisions: Array<{
    role: "Platform owner" | "Security reviewer" | "Operations reviewer";
    reviewer: string;
    decision: "Pending" | "Accepted" | "Rejected";
    evidence: string;
  }>;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  provisioningEnabled: false;
  createdAt: string;
};

export type LabExecutionProposalEnvelope = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  reviewId: string;
  exportId: string;
  windowId: string;
  status: "Blocked" | "Ready for proposal review";
  requestedBy: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  rollbackOwner: string;
  emergencyStopContacts: string[];
  killSwitch: {
    name: string;
    enabled: boolean;
  };
  provisioningEnabled: false;
  createdAt: string;
};

export type LabExecutionProposalExportRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  envelopeId: string;
  status: "Prepared";
  requestedBy: string;
  format: "JSON";
  checksumAlgorithm: "sha256";
  checksum: string;
  manifest: {
    exportId: string;
    envelopeId: string;
    provider: ProviderReleaseGateRecord["provider"];
    envelopeStatus: LabExecutionProposalEnvelope["status"];
    generatedAt: string;
    reviewId: string;
    windowId: string;
    windowEvidenceExportId: string;
    checkCount: number;
    passedChecks: number;
    evidenceReferences: string[];
    rollbackOwner: string;
    emergencyStopContacts: string[];
    killSwitch: LabExecutionProposalEnvelope["killSwitch"];
    provisioningEnabled: false;
  };
  redactionBoundary: string;
  storageBoundary: string;
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledLabExecutionApprovalGate = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  proposalExportId: string;
  envelopeId: string;
  status: "Blocked" | "Approved for controlled lab execution review";
  requestedBy: string;
  decisions: Array<{
    role: "Platform owner" | "Security reviewer" | "Lab owner" | "Rollback owner" | "Executive sponsor";
    reviewer: string;
    decision: "Pending" | "Accepted" | "Rejected";
    evidence: string;
  }>;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: LabExecutionProposalExportRecord["manifest"]["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledLabExecutionRehearsalPacket = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  approvalGateId: string;
  proposalExportId: string;
  envelopeId: string;
  status: "Blocked" | "Ready for rehearsal review";
  requestedBy: string;
  frozenReferences: {
    runbookId?: string;
    rollbackOwner: string;
    emergencyStopContacts: string[];
    stopConditions: string[];
    proposalExportId: string;
    auditExportIds: string[];
    approvalEvidence: string[];
  };
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ControlledLabExecutionApprovalGate["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledLabDryRunExecutionChecklist = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  rehearsalPacketId: string;
  approvalGateId: string;
  status: "Blocked" | "Ready for dry-run review";
  requestedBy: string;
  operatorRoster: string[];
  observationWindow: {
    scheduledStart: string;
    scheduledEnd: string;
  };
  logCaptureReferences: string[];
  rollbackTimerMinutes: number;
  stopAuthority: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ControlledLabExecutionRehearsalPacket["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledLabExecutionEvidenceLedger = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  dryRunChecklistId: string;
  rehearsalPacketId: string;
  status: "Blocked" | "Ready for evidence review";
  requestedBy: string;
  immutableReferences: {
    operatorEvidence: string[];
    observerEvidence: string[];
    rollbackEvidence: string[];
    logEvidence: string[];
    auditEvidence: string[];
    stopAuthorityEvidence: string[];
  };
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ControlledLabDryRunExecutionChecklist["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledLabExecutionReadinessAttestation = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  evidenceLedgerId: string;
  dryRunChecklistId: string;
  status: "Blocked" | "Ready for execution review";
  requestedBy: string;
  attestations: {
    platformOwner: string;
    securityReviewer: string;
    operationsReviewer: string;
    rollbackOwner: string;
    executiveSponsor: string;
  };
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ControlledLabExecutionEvidenceLedger["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ExecutionBrokerQueueRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  readinessAttestationId: string;
  evidenceLedgerId: string;
  idempotencyKey: string;
  operation: "Controlled Lab Adapter Execution";
  status: "Blocked" | "Queued for operator review";
  requestedBy: string;
  approvalEvidenceLinks: string[];
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ControlledLabExecutionReadinessAttestation["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ExecutionBrokerDispatchApproval = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  brokerRecordId: string;
  readinessAttestationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for authorized lab dispatch review";
  requestedBy: string;
  operatorApprover: string;
  rollbackProofReference: string;
  pentestEvidenceReference: string;
  dispatchWindowReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ExecutionBrokerQueueRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type RealAdapterLabScopeActivation = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  dispatchApprovalId: string;
  brokerRecordId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for manual real-adapter switch review";
  requestedBy: string;
  authorizedScopeReference: string;
  pentestCompletionEvidence: string;
  rollbackOwner: string;
  boundedProviderTargets: string[];
  manualOperatorControls: string[];
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ExecutionBrokerDispatchApproval["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ManualRealAdapterSwitchReview = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  activationId: string;
  dispatchApprovalId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for manual switch change review";
  requestedBy: string;
  switchOperator: string;
  secondReviewer: string;
  maintenanceWindowReference: string;
  switchStateAuditReferences: string[];
  rollbackContact: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: RealAdapterLabScopeActivation["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type RealAdapterSwitchStateAuditPackage = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for switch-state audit review";
  requestedBy: string;
  preChangeSnapshotReference: string;
  postChangeSnapshotReference: string;
  reviewerEvidenceReference: string;
  rollbackTimerMinutes: number;
  retentionReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ManualRealAdapterSwitchReview["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ControlledSwitchConfigurationRequest = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for controlled switch request review";
  requestedBy: string;
  operatorConfirmation: string;
  secondReviewerAcceptance: string;
  finalDryRunProofReference: string;
  rollbackTimerMinutes: number;
  retentionReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: RealAdapterSwitchStateAuditPackage["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type SwitchExecutionHandoffPackage = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for switch execution handoff review";
  requestedBy: string;
  operatorRunSheetReference: string;
  communicationsPlanReference: string;
  observationWindowReference: string;
  rollbackOwnerAcceptance: string;
  executionFreezeProofReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ControlledSwitchConfigurationRequest["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type SwitchExecutionOutcomeRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for switch outcome review";
  requestedBy: string;
  operatorResultReference: string;
  postSwitchValidationReference: string;
  rollbackDecisionReference: string;
  incidentBridgeLogReference: string;
  auditSignOffReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: SwitchExecutionHandoffPackage["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type SwitchClosureRetentionPackage = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for switch closure review";
  requestedBy: string;
  closureOwner: string;
  retainedEvidenceManifestReference: string;
  lessonsLearnedReference: string;
  rollbackTimerClosureReference: string;
  finalAuditRetentionConfirmation: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: SwitchExecutionOutcomeRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type AdapterPromotionReadinessDossier = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for adapter promotion review";
  requestedBy: string;
  promotionOwner: string;
  retainedSwitchEvidenceReference: string;
  monitoringPlanReference: string;
  rollbackDrillConfirmation: string;
  securityAcceptanceReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: SwitchClosureRetentionPackage["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionAdapterAuthorizationPacket = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production adapter authorization review";
  requestedBy: string;
  productionApprover: string;
  changeTicketReference: string;
  releaseWindowReference: string;
  emergencyRollbackAuthorization: string;
  complianceAcceptanceReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: AdapterPromotionReadinessDossier["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionChangeFreezeRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production change freeze review";
  requestedBy: string;
  freezeOwner: string;
  freezeWindowReference: string;
  stakeholderNotificationReference: string;
  rollbackStandbyReference: string;
  noChangeExceptionPlanReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ProductionAdapterAuthorizationPacket["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionCabHandoffPacket = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production CAB handoff review";
  requestedBy: string;
  cabOwner: string;
  cabAgendaReference: string;
  riskAcceptanceReference: string;
  rollbackRepresentationReference: string;
  finalGoNoGoAgendaReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ProductionChangeFreezeRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionCabDecisionRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production CAB decision review";
  requestedBy: string;
  cabDecision: "Approved with conditions" | "Rejected" | "Deferred";
  decisionAuthority: string;
  conditionListReference: string;
  rollbackApprovalReference: string;
  decisionMinutesReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ProductionCabHandoffPacket["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionImplementationHoldRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production implementation hold review";
  requestedBy: string;
  implementationOwner: string;
  holdWindowReference: string;
  conditionAcceptanceReference: string;
  rollbackImplementationOwner: string;
  releaseFreezeAcknowledgmentReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ProductionCabDecisionRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionOperatorAssignmentRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production operator assignment review";
  requestedBy: string;
  primaryOperator: string;
  secondaryOperator: string;
  executionChannelReference: string;
  rollbackOperator: string;
  privilegedAccessConfirmationReference: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  killSwitch: ProductionImplementationHoldRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionReadinessRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution readiness review";
  requestedBy: string;
  executionOwner: string;
  preExecutionChecklistReference: string;
  rollbackBridgeReference: string;
  monitoringObserver: string;
  implementationTimerReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionOperatorAssignmentRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionAuthorizationRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution authorization review";
  requestedBy: string;
  authorizationAuthority: string;
  finalGoNoGoDecision: "Approved" | "Rejected" | "Pending";
  rollbackBridgeConfirmationReference: string;
  monitoringBridgeConfirmationReference: string;
  emergencyStopAuthority: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionReadinessRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionChangeTicketLockRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production change ticket lock review";
  requestedBy: string;
  changeTicketLockReference: string;
  releaseWindowLockReference: string;
  approverRosterLockReference: string;
  rollbackBridgeLockReference: string;
  monitoringBridgeLockReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionAuthorizationRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionFinalExecutionPacketRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production final execution packet review";
  requestedBy: string;
  finalPacketManifestReference: string;
  operatorRunSheetReference: string;
  communicationsProofReference: string;
  observationWindowReference: string;
  finalRollbackStandbyConfirmation: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionChangeTicketLockRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionHoldPointRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution hold-point review";
  requestedBy: string;
  holdPointOwner: string;
  finalStopGoCheckpointReference: string;
  rollbackTimerCheckpointReference: string;
  monitoringReadinessCheckpointReference: string;
  incidentBridgeCheckpointReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionFinalExecutionPacketRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionOutcomeAuthorizationRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution outcome authorization review";
  requestedBy: string;
  outcomeAuthority: string;
  expectedResultEnvelopeReference: string;
  rollbackDecisionRuleReference: string;
  incidentDeclarationRuleReference: string;
  evidenceCaptureRuleReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionHoldPointRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionClosureAuthorizationRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution closure authorization review";
  requestedBy: string;
  closureAuthority: string;
  successCriteriaReference: string;
  rollbackClosureCriteriaReference: string;
  incidentClosureCriteriaReference: string;
  auditCaptureConfirmationReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionOutcomeAuthorizationRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionClosurePacketRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution closure packet review";
  requestedBy: string;
  closurePacketManifestReference: string;
  evidenceBundleReference: string;
  auditExportReference: string;
  stakeholderNotificationProofReference: string;
  retentionHandoffConfirmationReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionClosureAuthorizationRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchivalHandoffRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archival handoff review";
  requestedBy: string;
  archiveOwner: string;
  retentionPolicyReference: string;
  immutableStorageProofReference: string;
  auditIndexReference: string;
  retrievalTestReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionClosurePacketRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionRetentionAttestationRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution retention attestation review";
  requestedBy: string;
  retentionOwner: string;
  retentionScheduleProofReference: string;
  legalHoldCheckReference: string;
  deletionExceptionRegisterReference: string;
  retrievalSlaProofReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchivalHandoffRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionFinalArchiveCertificationRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution final archive certification review";
  requestedBy: string;
  certificationOwner: string;
  finalArchiveManifestReference: string;
  retentionLockProofReference: string;
  complianceSignOffReference: string;
  retrievalWitnessProofReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionRetentionAttestationRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionCompletionDossierRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution completion dossier review";
  requestedBy: string;
  dossierOwner: string;
  finalEvidenceIndexReference: string;
  auditExportReference: string;
  operationsAcceptanceReference: string;
  complianceClosureProofReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionFinalArchiveCertificationRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionOperationsHandoverRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution operations handover review";
  requestedBy: string;
  operationsOwner: string;
  supportModelReference: string;
  monitoringHandoverProofReference: string;
  escalationRouteReference: string;
  serviceDeskAcceptanceReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionCompletionDossierRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionSupportReadinessRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution support readiness review";
  requestedBy: string;
  supportOwner: string;
  runbookAcceptanceReference: string;
  alertRoutingProofReference: string;
  incidentProcessReference: string;
  knowledgeBasePublicationReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionOperationsHandoverRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionServiceAcceptanceRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution service acceptance review";
  requestedBy: string;
  serviceOwner: string;
  acceptanceCriteriaReference: string;
  operationalSloReference: string;
  supportSignOffReference: string;
  finalCustomerNotificationReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionSupportReadinessRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionFinalTurnoverRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution final turnover review";
  requestedBy: string;
  turnoverOwner: string;
  finalServiceCatalogReference: string;
  ownershipTransferProofReference: string;
  executiveClosureNoteReference: string;
  postImplementationReviewScheduleReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionServiceAcceptanceRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionOperationalClosureRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution operational closure review";
  requestedBy: string;
  closureOwner: string;
  steadyStateOperatingModelReference: string;
  sloReviewProofReference: string;
  supportBacklogHandoffReference: string;
  residualRiskAcceptanceReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionFinalTurnoverRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionPostImplementationReviewRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution post-implementation review";
  requestedBy: string;
  reviewOwner: string;
  pirMinutesReference: string;
  incidentReviewProofReference: string;
  costVarianceReviewReference: string;
  improvementBacklogReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionOperationalClosureRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionImprovementClosureRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution improvement closure review";
  requestedBy: string;
  improvementOwner: string;
  actionRegisterReference: string;
  acceptedDeferralsReference: string;
  lessonsLearnedPublicationReference: string;
  nextCycleOwner: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionPostImplementationReviewRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionFinalAcceptanceArchiveRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution final acceptance archive review";
  requestedBy: string;
  archiveOwner: string;
  acceptanceArchiveIndexReference: string;
  finalEvidenceChecksumReference: string;
  stakeholderReceiptProofReference: string;
  retrievalOwner: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionImprovementClosureRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionReadinessArchiveHandoffRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution readiness archive handoff review";
  requestedBy: string;
  handoffOwner: string;
  archiveRepositoryReference: string;
  retrievalRunbookReference: string;
  archiveAccessReviewReference: string;
  archiveCustodyReceiptReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionFinalAcceptanceArchiveRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRetrievalValidationRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive retrieval validation review";
  requestedBy: string;
  retrievalOperator: string;
  sampleRetrievalProofReference: string;
  checksumVerificationReference: string;
  accessAuditReference: string;
  recoverySlaWitnessReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionReadinessArchiveHandoffRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryDrillRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery drill review";
  requestedBy: string;
  drillOwner: string;
  recoveryScenarioReference: string;
  elapsedRecoveryProofReference: string;
  restoredArtifactReviewReference: string;
  drillSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRetrievalValidationRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryAcceptanceRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery acceptance review";
  requestedBy: string;
  acceptanceOwner: string;
  recoveryEvidencePacketReference: string;
  rtoRpoVarianceReviewReference: string;
  residualRecoveryRiskRegisterReference: string;
  acceptanceSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryDrillRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryClosureRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  archiveRecoveryAcceptanceRecordId: string;
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery closure review";
  requestedBy: string;
  closureOwner: string;
  recoveryClosurePacketReference: string;
  followUpActionRegisterReference: string;
  stakeholderClosureNoticeReference: string;
  archiveRecoveryClosureSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryAcceptanceRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryAuditCertificationRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  archiveRecoveryClosureRecordId: string;
  archiveRecoveryAcceptanceRecordId: string;
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery audit certification review";
  requestedBy: string;
  certificationOwner: string;
  auditEvidenceManifestReference: string;
  controlMappingReviewReference: string;
  exceptionDispositionReference: string;
  auditCertificationSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryClosureRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  archiveRecoveryAuditCertificationRecordId: string;
  archiveRecoveryClosureRecordId: string;
  archiveRecoveryAcceptanceRecordId: string;
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery final compliance archive review";
  requestedBy: string;
  complianceArchiveOwner: string;
  finalComplianceArchiveIndexReference: string;
  evidenceRetentionProofReference: string;
  auditWitnessReceiptReference: string;
  finalComplianceArchiveSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryAuditCertificationRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  finalComplianceArchiveRecordId: string;
  archiveRecoveryAuditCertificationRecordId: string;
  archiveRecoveryClosureRecordId: string;
  archiveRecoveryAcceptanceRecordId: string;
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery evidence custody closure review";
  requestedBy: string;
  custodyOwner: string;
  finalCustodyLedgerReference: string;
  evidenceTransferReceiptReference: string;
  retentionLockConfirmationReference: string;
  custodyClosureSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryOperationalContinuityRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  evidenceCustodyClosureRecordId: string;
  finalComplianceArchiveRecordId: string;
  archiveRecoveryAuditCertificationRecordId: string;
  archiveRecoveryClosureRecordId: string;
  archiveRecoveryAcceptanceRecordId: string;
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery operational continuity review";
  requestedBy: string;
  continuityOwner: string;
  runbookUpdateReference: string;
  kpiBaselineReference: string;
  supportHandoffReference: string;
  continuitySignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  operationalContinuityRecordId: string;
  evidenceCustodyClosureRecordId: string;
  finalComplianceArchiveRecordId: string;
  archiveRecoveryAuditCertificationRecordId: string;
  archiveRecoveryClosureRecordId: string;
  archiveRecoveryAcceptanceRecordId: string;
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery service management handoff review";
  requestedBy: string;
  serviceOwner: string;
  supportQueueMappingReference: string;
  knowledgeArticleReference: string;
  escalationMatrixReference: string;
  serviceManagementHandoffSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryOperationalContinuityRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord = {
  id: string;
  provider: ProviderReleaseGateRecord["provider"];
  serviceManagementHandoffRecordId: string;
  operationalContinuityRecordId: string;
  evidenceCustodyClosureRecordId: string;
  finalComplianceArchiveRecordId: string;
  archiveRecoveryAuditCertificationRecordId: string;
  archiveRecoveryClosureRecordId: string;
  archiveRecoveryAcceptanceRecordId: string;
  archiveRecoveryDrillRecordId: string;
  archiveRetrievalValidationRecordId: string;
  readinessArchiveHandoffRecordId: string;
  finalAcceptanceArchiveRecordId: string;
  improvementClosureRecordId: string;
  postImplementationReviewRecordId: string;
  operationalClosureRecordId: string;
  finalTurnoverRecordId: string;
  serviceAcceptanceRecordId: string;
  supportReadinessRecordId: string;
  operationsHandoverRecordId: string;
  completionDossierRecordId: string;
  finalArchiveCertificationRecordId: string;
  retentionAttestationRecordId: string;
  archivalHandoffRecordId: string;
  closurePacketRecordId: string;
  closureAuthorizationRecordId: string;
  outcomeAuthorizationRecordId: string;
  executionHoldPointRecordId: string;
  finalExecutionPacketRecordId: string;
  changeTicketLockRecordId: string;
  executionAuthorizationRecordId: string;
  executionReadinessRecordId: string;
  operatorAssignmentRecordId: string;
  implementationHoldRecordId: string;
  cabDecisionRecordId: string;
  cabHandoffPacketId: string;
  freezeRecordId: string;
  authorizationPacketId: string;
  promotionDossierId: string;
  closurePackageId: string;
  outcomeRecordId: string;
  handoffPackageId: string;
  controlledSwitchRequestId: string;
  auditPackageId: string;
  switchReviewId: string;
  activationId: string;
  idempotencyKey: string;
  status: "Blocked" | "Ready for production execution archive recovery support ownership acceptance review";
  requestedBy: string;
  supportOwner: string;
  serviceDeskAcceptanceReference: string;
  escalationTestProofReference: string;
  monitoringOwnershipProofReference: string;
  supportOwnershipSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  killSwitch: ProductionExecutionArchiveRecoveryServiceManagementHandoffRecord["killSwitch"];
  provisioningEnabled: false;
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord = Omit<
  ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord,
  "id" | "status" | "requestedBy" | "checks" | "evidence" | "createdAt"
> & {
  id: string;
  supportOwnershipAcceptanceRecordId: string;
  status: "Blocked" | "Ready for production execution archive recovery monitoring ownership closure review";
  requestedBy: string;
  monitoringOwner: string;
  alertOwnershipTransferReference: string;
  dashboardAcceptanceReference: string;
  escalationMonitoringValidationReference: string;
  monitoringOwnershipClosureSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  createdAt: string;
};

export type ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord = Omit<
  ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord,
  "id" | "status" | "requestedBy" | "checks" | "evidence" | "createdAt"
> & {
  id: string;
  monitoringOwnershipClosureRecordId: string;
  status: "Blocked" | "Ready for production execution archive recovery final operations handoff review";
  requestedBy: string;
  finalOperationsOwner: string;
  runbookPublicationReference: string;
  onCallScheduleHandoffReference: string;
  monitoringClosureAcceptanceReference: string;
  operationsHandoffSignOffReference: string;
  checks: Array<{ name: string; passed: boolean; detail: string }>;
  evidence: string[];
  createdAt: string;
};

export type ProductionReadinessReview = {
  id: string;
  status: "Blocked" | "Ready for review";
  reviewer: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  evidence: string[];
  provisioningEnabled: false;
  createdAt: string;
};

export type LifecycleOperationKind = "Extend" | "Suspend" | "Destroy" | "Rebuild";

export type LifecycleOperationRecord = {
  id: string;
  environmentName: string;
  operation: LifecycleOperationKind;
  status: "Blocked" | "Queued for operator review";
  requestedBy: string;
  checks: Array<{
    name: string;
    passed: boolean;
    detail: string;
  }>;
  runbook: string[];
  auditEvidence: string[];
  approvalRequired: true;
  provisioningEnabled: false;
  createdAt: string;
};

export type AuditExportRecord = {
  id: string;
  status: "Prepared";
  requestedBy: string;
  format: "JSONL";
  eventCount: number;
  retentionEvents: number;
  checksumAlgorithm: "sha256";
  checksum: string;
  manifest: {
    exportId: string;
    eventCount: number;
    retentionWindowEvents: number;
    firstEventAt?: string;
    lastEventAt?: string;
    generatedAt: string;
    destinationRef: string;
  };
  redactionBoundary: string;
  storageBoundary: string;
  createdAt: string;
};

export type AuditRetentionDiagnostics = {
  retentionEvents: number;
  currentEvents: number;
  bounded: boolean;
  oldestEventAt?: string;
  newestEventAt?: string;
  exportDestination: {
    configured: boolean;
    valid: boolean;
    destinationRef: string;
    message: string;
  };
};

export type ControlPlaneJobTransition = {
  state: ControlPlaneJobState;
  actor: string;
  message: string;
  createdAt: string;
};

export type ControlPlaneJob = {
  id: string;
  environmentName: string;
  template: string;
  owner: string;
  targets: Target[];
  operation: "Provision" | "Destroy";
  state: ControlPlaneJobState;
  attempts: number;
  maxAttempts: number;
  worker: "MockOrchestrator";
  provisioningEnabled: false;
  queuedAt: string;
  updatedAt: string;
  lastError?: string;
  transitions: ControlPlaneJobTransition[];
};

export type JobEvent = {
  title: string;
  detail: string;
  durationMs: number;
};

export const templates: Template[] = [
  {
    id: "spring-postgres",
    name: "Spring API with NDB Postgres",
    summary: "Kubernetes service, managed Postgres, backup policy, and developer observability.",
    owner: "App Platform",
    tier: "Standard",
    targets: ["Kubernetes", "Database", "Storage"],
    runtime: "NKP + NDB + NUS",
    monthlyCost: 1840,
    compliance: ["SRE owned", "Backups enabled", "Cost guardrail"],
    description:
      "A production-shaped developer path for API teams that need a Kubernetes runtime, managed database lifecycle, and storage with sane defaults.",
    outcomes: [
      "NKP namespace with quota, ingress, and service account",
      "NDB PostgreSQL instance with backup policy",
      "NUS allocation for artifacts and operational exports",
    ],
    readiness: [
      "Map NKP namespace creation to target cluster APIs",
      "Confirm NDB profile IDs for PostgreSQL versions",
      "Define backup retention and restore test expectations",
    ],
  },
  {
    id: "vm-app",
    name: "Linux VM App Sandbox",
    summary: "Self-service VM with image hardening, Prism Central inventory, and lifecycle expiry.",
    owner: "Cloud Infrastructure",
    tier: "Standard",
    targets: ["VM", "Storage"],
    runtime: "NCI + NCM",
    monthlyCost: 920,
    compliance: ["Hardened image", "30 day expiry", "Patch baseline"],
    description:
      "A fast VM request path for application teams that need an isolated sandbox with lifecycle controls and baseline security posture.",
    outcomes: [
      "NCI VM cloned from a hardened image",
      "NCM policy attachment for expiry and patch posture",
      "Prism Central inventory metadata for ownership and cost",
    ],
    readiness: [
      "Identify Prism Central project and image IDs",
      "Define VM sizing menu and quota rules",
      "Validate lifecycle expiry automation path",
    ],
  },
  {
    id: "ai-endpoint",
    name: "AI Endpoint Lab",
    summary: "GPU-backed model endpoint, object storage mount, and prompt test workspace.",
    owner: "AI Platform",
    tier: "Accelerated",
    targets: ["AI Endpoint", "Storage", "Kubernetes"],
    runtime: "NAI + NKP + NUS",
    monthlyCost: 4200,
    compliance: ["PII scan", "GPU quota", "Approval required"],
    description:
      "A governed experimentation lane for teams testing model endpoints, GPU quota, object storage, and prompt workflows.",
    outcomes: [
      "NAI endpoint placeholder with approval gate",
      "NKP workload namespace for endpoint adapters",
      "NUS object storage mount for model and prompt artifacts",
    ],
    readiness: [
      "Confirm available GPU pools and quota approval model",
      "Define PII scanning handoff before endpoint activation",
      "Document model registry and artifact storage assumptions",
    ],
  },
  {
    id: "regulated-db",
    name: "Regulated Data Service",
    summary: "Database environment with encryption, audit export, retention, and approval routing.",
    owner: "Data Platform",
    tier: "Regulated",
    targets: ["Database", "Storage"],
    runtime: "NDB + NUS + NCM",
    monthlyCost: 3100,
    compliance: ["Encryption", "Audit export", "Change approval"],
    description:
      "A controlled database path for regulated workloads that need auditable provisioning, encryption, retention, and approval history.",
    outcomes: [
      "NDB managed database with encryption policy",
      "NUS storage target for audit exports",
      "NCM governance record for approvals and compliance evidence",
    ],
    readiness: [
      "Confirm database profiles approved for regulated use",
      "Define audit export destination and retention",
      "Connect approval routing to identity groups",
    ],
  },
];

export const initialEnvironments: Environment[] = [
  {
    name: "payments-dev",
    template: "Spring API with NDB Postgres",
    owner: "mira.chen",
    region: "Berlin Lab",
    status: "Ready",
    cost: 1840,
    createdAt: "2026-06-18",
  },
  {
    name: "ml-reco-lab",
    template: "AI Endpoint Lab",
    owner: "samir.patel",
    region: "London Edge",
    status: "Needs approval",
    cost: 4200,
    createdAt: "2026-06-22",
  },
  {
    name: "billing-sandbox",
    template: "Linux VM App Sandbox",
    owner: "jordan.lee",
    region: "Berlin Lab",
    status: "Provisioning",
    cost: 920,
    createdAt: "2026-06-25",
  },
];

export const integrations: Integration[] = [
  {
    name: "NCI",
    label: "Infrastructure",
    state: "Healthy",
    score: 99,
    product: "Prism Central / Nutanix Cloud Infrastructure",
    readiness: "Ready for discovery once Prism Central project, image, and subnet IDs are known.",
    nextStep: "Create a lab credential profile and inventory read-only endpoint.",
  },
  {
    name: "NKP",
    label: "Kubernetes",
    state: "Healthy",
    score: 98,
    product: "Nutanix Kubernetes Platform",
    readiness: "Ready for namespace and quota workflow mapping against a lab cluster.",
    nextStep: "Choose Kubernetes API versus NKP API ownership boundary.",
  },
  {
    name: "NDB",
    label: "Databases",
    state: "Healthy",
    score: 96,
    product: "Nutanix Database Service",
    readiness: "Ready after database profiles and backup SLAs are captured.",
    nextStep: "Document PostgreSQL profile IDs and restore expectations.",
  },
  {
    name: "NUS",
    label: "Storage",
    state: "Healthy",
    score: 97,
    product: "Nutanix Unified Storage",
    readiness: "Ready after file/object service targets and quota rules are selected.",
    nextStep: "Define default storage classes for each golden path.",
  },
  {
    name: "NCM",
    label: "Governance",
    state: "Warning",
    score: 88,
    product: "Nutanix Cloud Manager",
    readiness: "Needs blueprint, policy, and approval mapping before a real handoff.",
    nextStep: "Identify whether Calm/NCM Self-Service owns the first real provisioning path.",
  },
  {
    name: "NAI",
    label: "AI Services",
    state: "Preview",
    score: 74,
    product: "Nutanix AI",
    readiness: "Preview until GPU quota, model registry, and PII scanning assumptions are validated.",
    nextStep: "Confirm lab GPU availability and approval workflow.",
  },
];

export const allTargets: Target[] = ["VM", "Kubernetes", "Database", "Storage", "AI Endpoint"];

export const policyBundles: PolicyBundle[] = [
  {
    id: "sandbox-standard",
    name: "Sandbox Standard Guardrails",
    owner: "Platform Governance",
    controls: ["30 day expiry", "Cost attribution", "Owner metadata", "Basic audit trail"],
    evidence: "Default developer sandbox controls for non-regulated paths.",
  },
  {
    id: "data-protection",
    name: "Data Protection Baseline",
    owner: "Data Platform",
    controls: ["Backup policy", "Restore test evidence", "Encryption required", "Retention metadata"],
    evidence: "Required for database-backed golden paths.",
  },
  {
    id: "ai-safety",
    name: "AI Safety Review",
    owner: "AI Platform",
    controls: ["GPU quota", "PII scan", "Model registry reference", "Prompt artifact retention"],
    evidence: "Required before AI endpoint profiles can be published.",
  },
  {
    id: "regulated-audit",
    name: "Regulated Audit Export",
    owner: "Security Governance",
    controls: ["Approval evidence", "Audit export", "Change review", "Encryption"],
    evidence: "Required for regulated data service templates.",
  },
];

export const templateRegistry: TemplateRegistryEntry[] = [
  {
    templateId: "spring-postgres",
    templateName: "Spring API with NDB Postgres",
    version: "1.2.0",
    owner: "App Platform",
    status: "Published",
    policyBundleIds: ["sandbox-standard", "data-protection"],
    lastChangedAt: "2026-06-28",
    approvalEvidence: "Approved by Platform Governance for developer API paths.",
    notes: "Default API golden path for standard app teams.",
  },
  {
    templateId: "vm-app",
    templateName: "Linux VM App Sandbox",
    version: "1.1.0",
    owner: "Cloud Infrastructure",
    status: "Published",
    policyBundleIds: ["sandbox-standard"],
    lastChangedAt: "2026-06-28",
    approvalEvidence: "Approved for simulated VM sandbox flow.",
    notes: "Awaiting real Prism Central image and subnet mapping.",
  },
  {
    templateId: "ai-endpoint",
    templateName: "AI Endpoint Lab",
    version: "0.8.0",
    owner: "AI Platform",
    status: "Pending approval",
    policyBundleIds: ["sandbox-standard", "ai-safety"],
    lastChangedAt: "2026-07-02",
    approvalEvidence: "Pending GPU quota and PII policy sign-off.",
    notes: "Can be demonstrated, but should not be published for real use yet.",
  },
  {
    templateId: "regulated-db",
    templateName: "Regulated Data Service",
    version: "0.5.0",
    owner: "Data Platform",
    status: "Draft",
    policyBundleIds: ["data-protection", "regulated-audit"],
    lastChangedAt: "2026-07-02",
    approvalEvidence: "Draft requires data-owner and security approval.",
    notes: "Registry governance work item for the regulated service path.",
  },
];

export const resourceProfiles: ResourceProfile[] = [
  {
    id: "ahv-rocky-9-hardened",
    kind: "AHV Image",
    name: "Rocky Linux 9 Hardened",
    provider: "NCI",
    version: "9.4",
    status: "Published",
    owner: "Cloud Infrastructure",
    region: "Berlin Lab",
    notes: "Default VM sandbox image candidate. Image UUID must be mapped during lab onboarding.",
    approvedBy: "Cloud Infrastructure",
    approvedAt: "2026-06-28",
  },
  {
    id: "nkp-1-30-standard",
    kind: "Kubernetes Version",
    name: "NKP Kubernetes Standard",
    provider: "NKP",
    version: "1.30",
    status: "Published",
    owner: "App Platform",
    region: "Berlin Lab",
    notes: "Namespace and quota profile for standard app teams.",
    approvedBy: "App Platform",
    approvedAt: "2026-06-28",
  },
  {
    id: "ndb-postgres-16-dev",
    kind: "Database Engine",
    name: "PostgreSQL Developer",
    provider: "NDB",
    version: "16",
    status: "Published",
    owner: "Data Platform",
    region: "Berlin Lab",
    notes: "Developer database profile with backup policy placeholder.",
    approvedBy: "Data Platform",
    approvedAt: "2026-06-28",
  },
  {
    id: "nus-object-dev",
    kind: "Storage Class",
    name: "NUS Object Developer",
    provider: "NUS",
    version: "standard",
    status: "Draft",
    owner: "Storage Platform",
    region: "Berlin Lab",
    notes: "Object bucket profile awaiting quota and retention approval.",
  },
  {
    id: "nai-gpu-small",
    kind: "AI Profile",
    name: "NAI GPU Small Endpoint",
    provider: "NAI",
    version: "gpu-small",
    status: "Draft",
    owner: "AI Platform",
    region: "London Edge",
    notes: "Requires GPU quota, PII policy, and model registry mapping.",
  },
];

export const platformConfig: PlatformConfig = {
  prismCentralUrl: "",
  defaultProject: "developer-cloud-lab",
  defaultCluster: "berlin-ahv-lab",
  networkProfile: "dev-segment-placeholder",
  credentialReference: "nci-lab-readonly",
  provisioningEnabled: false,
  message: "Provider configuration stores references only. Sensitive credential values live outside this prototype.",
};

export const provisioningEvents: JobEvent[] = [
  {
    title: "Template validated",
    detail: "Golden path inputs match platform policy.",
    durationMs: 900,
  },
  {
    title: "Policy bundle attached",
    detail: "NCM guardrails, ownership metadata, and expiry rules are queued.",
    durationMs: 1100,
  },
  {
    title: "Cost estimate approved",
    detail: "Monthly estimate is inside the sandbox budget guardrail.",
    durationMs: 1200,
  },
  {
    title: "Provisioning job running",
    detail: "Mock adapters are preparing Nutanix resource requests.",
    durationMs: 1500,
  },
  {
    title: "Nutanix integration handoff",
    detail: "Prototype job finished and is ready for real API wiring.",
    durationMs: 900,
  },
];
