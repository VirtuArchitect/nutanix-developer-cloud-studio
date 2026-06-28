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
export type ResourceProfileStatus = "Published" | "Draft" | "Deprecated";
export type ProvisioningAdapterName = "NCI" | "NKP" | "NDB" | "NUS" | "NCM" | "NAI";
export type ProvisioningAdapterCapability = "validateRequest" | "plan" | "provision" | "pollStatus" | "destroy";

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
  authMode: "Mock OIDC";
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
