import type { ProvisioningModeStatus } from "../src/data/cloudStudioDomain";
import { createAhvLabRuntimeConfig } from "./ahvLabRuntime";
import { currentVersion } from "./runtimeReadiness";

type RuntimeKind = ProvisioningModeStatus["runtime"];

export function createProvisioningModeStatus(runtime: RuntimeKind, env = process.env): ProvisioningModeStatus {
  if (runtime === "browser") {
    return browserMode();
  }

  const labConfig = createAhvLabRuntimeConfig(env);
  const endpoint = labConfig.prismCentralUrlHost ?? "not configured";
  const mockEndpoint = isMockEndpoint(endpoint);
  const activeMode = labConfig.provisioningEnabled
    ? mockEndpoint
      ? "Mock Prism"
      : "Real AHV Lab"
    : "Simulated API";
  const realInfrastructureMutation = activeMode === "Real AHV Lab" && labConfig.realPrismCallsEnabled;
  const status =
    activeMode === "Real AHV Lab"
      ? "Lab lifecycle armed"
      : activeMode === "Mock Prism"
        ? "Mock lifecycle ready"
        : labConfig.checks.some((check) => check.name === "Prism Central endpoint" && check.passed)
          ? "Needs configuration"
          : "Simulated";

  return {
    version: currentVersion(),
    generatedAt: new Date().toISOString(),
    activeMode,
    label: activeMode,
    summary: summaryFor(activeMode),
    status,
    runtime,
    endpointLabel: endpoint,
    mutationEnabled: labConfig.provisioningEnabled,
    realInfrastructureMutation,
    provisioningEnabled: labConfig.provisioningEnabled,
    checks: [
      ...labConfig.checks,
      {
        name: "Mock endpoint classification",
        passed: activeMode !== "Mock Prism" || mockEndpoint,
        detail: mockEndpoint ? `${endpoint} is treated as local/mock Prism.` : `${endpoint} is not a mock endpoint.`,
      },
      {
        name: "Real infrastructure mutation boundary",
        passed: realInfrastructureMutation ? labConfig.provisioningEnabled : true,
        detail: realInfrastructureMutation
          ? "Real AHV lab lifecycle can submit Prism tasks."
          : "No real infrastructure mutation is active in this mode.",
      },
    ],
    availableModes: availableModes(activeMode),
    nextActions: nextActionsFor(activeMode, labConfig.provisioningEnabled),
    commands: commandsFor(activeMode),
  };
}

function browserMode(): ProvisioningModeStatus {
  return {
    version: currentVersion(),
    generatedAt: new Date().toISOString(),
    activeMode: "Static Demo",
    label: "Static Demo",
    summary: "GitHub Pages or Vite-only mode uses browser fixtures and cannot call Prism Central.",
    status: "Demo only",
    runtime: "browser",
    endpointLabel: "browser fixture state",
    mutationEnabled: false,
    realInfrastructureMutation: false,
    provisioningEnabled: false,
    checks: [
      { name: "Browser runtime", passed: true, detail: "No server-side adapter is available." },
      { name: "External calls blocked", passed: true, detail: "The static demo cannot contact Prism Central." },
      { name: "Mutation disabled", passed: true, detail: "Environment lifecycle is simulated in the browser." },
    ],
    availableModes: availableModes("Static Demo"),
    nextActions: [
      "Use the hosted API or Docker Compose profile to test simulated provisioning.",
      "Use the mock Prism harness before attaching a real Prism Central lab.",
    ],
    commands: [
      { label: "Run local frontend", command: "npm run dev -- --host localhost --port 4180" },
      { label: "Run hosted starter API", command: "npm run api:dev" },
    ],
  };
}

function summaryFor(mode: ProvisioningModeStatus["activeMode"]) {
  switch (mode) {
    case "Static Demo":
      return "Browser-only demonstration with no API or Prism Central calls.";
    case "Simulated API":
      return "Hosted API can queue simulated jobs and evidence, but mutation switches are not fully armed.";
    case "Mock Prism":
      return "Hosted API is configured for local mock Prism lifecycle testing with no real Nutanix infrastructure.";
    case "Real AHV Lab":
      return "Hosted API is lab-scoped and armed for AHV VM lifecycle against an authorized Prism Central test endpoint.";
  }
}

function nextActionsFor(mode: ProvisioningModeStatus["activeMode"], provisioningEnabled: boolean) {
  if (mode === "Real AHV Lab") {
    return [
      "Run validate:ahv-lab-config before any lifecycle smoke.",
      "Confirm Platform Admin identity, lab authorization scope, rollback proof, gate approval, and lifecycle proof.",
      "Run smoke:ahv-lab-readonly before the opt-in lifecycle smoke.",
    ];
  }

  if (mode === "Mock Prism") {
    return [
      "Run smoke:mock-prism-lifecycle to prove validate, create, poll, power, destroy, and reconciliation.",
      "Review audit events for redacted mock lifecycle evidence.",
      "Promote to real AHV lab only after authorization and private Prism configuration are ready.",
    ];
  }

  if (mode === "Simulated API" && provisioningEnabled) {
    return ["Confirm whether the Prism endpoint is mock or real before submitting lifecycle operations."];
  }

  if (mode === "Simulated API") {
    return [
      "Use .env.mock-prism to enable mock lifecycle testing without a Nutanix lab.",
      "Use .env.lab only for an authorized Prism Central test environment.",
      "Keep GitHub Pages in static demo mode.",
    ];
  }

  return [
    "Start the API locally or with Docker Compose to move beyond browser-only simulation.",
    "Select Mock Prism before attempting real AHV lab validation.",
  ];
}

function commandsFor(mode: ProvisioningModeStatus["activeMode"]) {
  if (mode === "Real AHV Lab") {
    return [
      { label: "Validate lab config", command: "npm run validate:ahv-lab-config" },
      { label: "Read-only lab smoke", command: "npm run smoke:ahv-lab-readonly" },
      { label: "Opt-in lifecycle smoke", command: "npm run smoke:ahv-lab-lifecycle" },
    ];
  }

  if (mode === "Mock Prism") {
    return [
      { label: "Start mock harness", command: "docker compose -f docker-compose.mock-prism.yml --env-file .env.mock-prism up --build" },
      { label: "Validate mock config", command: "npm run validate:mock-prism-config" },
      { label: "Run mock lifecycle", command: "npm run smoke:mock-prism-lifecycle" },
    ];
  }

  return [
    { label: "Run API", command: "npm run api:dev" },
    { label: "Run frontend", command: "npm run dev -- --host localhost --port 4180" },
  ];
}

function availableModes(activeMode: ProvisioningModeStatus["activeMode"]) {
  const modes: Array<ProvisioningModeStatus["availableModes"][number]> = [
    {
      mode: "Static Demo",
      purpose: "Public clickable prototype and browser-only demonstrations.",
      enabled: activeMode === "Static Demo",
      mutationBoundary: "No API, no Prism calls, no infrastructure mutation.",
    },
    {
      mode: "Simulated API",
      purpose: "Hosted/on-prem API workflows, approvals, audit, and simulated jobs.",
      enabled: activeMode === "Simulated API",
      mutationBoundary: "API records only; no Prism task submission.",
    },
    {
      mode: "Mock Prism",
      purpose: "Local Prism v3-shaped lifecycle testing without Nutanix infrastructure.",
      enabled: activeMode === "Mock Prism",
      mutationBoundary: "Mutates only the local mock Prism fixture runtime.",
    },
    {
      mode: "Real AHV Lab",
      purpose: "Authorized AHV VM lifecycle validation against a test Prism Central endpoint.",
      enabled: activeMode === "Real AHV Lab",
      mutationBoundary: "Lab-scoped Prism tasks only; never enabled by default.",
    },
  ];

  return modes;
}

function isMockEndpoint(endpoint: string) {
  return /(^|[.:/-])(mock-prism|localhost|127\.0\.0\.1|host\.docker\.internal)([.:/-]|$)/i.test(endpoint);
}
