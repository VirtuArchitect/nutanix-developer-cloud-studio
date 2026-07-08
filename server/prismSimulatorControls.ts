import type {
  PrismAdapterBlockedReason,
  PrismSimulatorFailureScenario,
  PrismSimulatorFailureScenarioId,
  PrismSimulatorProfile,
  PrismSimulatorProfileKind,
  RealPrismPreflightRun,
} from "../src/data/cloudStudioDomain";
import type { ApiState } from "./types";

const now = "2026-07-08T00:00:00.000Z";

export function createDefaultPrismSimulatorProfiles(): PrismSimulatorProfile[] {
  return [
    profile("sim-project-sandbox", "Project", "NDC-Sandbox", true, { uuid: "mock-project-sandbox", quotaTier: "sandbox" }),
    profile("sim-cluster-berlin-a", "Cluster", "PHX-Berlin-A", true, { uuid: "mock-cluster-berlin-a", ahvVersion: "10.0" }),
    profile("sim-image-rhel-9", "Image", "rhel-9-golden-2026.07", true, { uuid: "mock-image-rhel-9", os: "RHEL 9" }),
    profile("sim-image-ubuntu-2404", "Image", "ubuntu-24.04-lts-golden", false, { uuid: "mock-image-ubuntu-2404", os: "Ubuntu 24.04" }),
    profile("sim-subnet-dev", "Subnet", "dev-overlay-10.42.0.0", true, { uuid: "mock-subnet-dev", vlan: 142 }),
    profile("sim-category-sandbox", "Category", "Lifecycle:30-day-expiry", true, { uuid: "mock-category-lifecycle" }),
    profile("sim-category-costcenter", "Category", "CostCenter:Sandbox", true, { uuid: "mock-category-costcenter" }),
  ];
}

export function createDefaultPrismFailureScenarios(): PrismSimulatorFailureScenario[] {
  return [
    scenario("none", "Normal success path", true, "Mock Prism task succeeds and records simulator evidence.", "SUCCEEDED", 100),
    scenario("image-not-found", "Image not found", false, "Selected image profile is rejected by the simulator.", "FAILED", 18),
    scenario("quota-exceeded", "Quota exceeded", false, "Project quota check fails before simulated VM completion.", "FAILED", 35),
    scenario("subnet-unavailable", "Subnet unavailable", false, "Network placement fails because the selected subnet is unavailable.", "FAILED", 42),
    scenario("approval-missing", "Approval missing", false, "Regulated request reaches a simulator approval boundary.", "FAILED", 55),
    scenario("task-failed", "Task failed", false, "Mock Prism accepts the request but reports task failure.", "FAILED", 70),
    scenario("task-timeout", "Task timeout", false, "Mock Prism task remains incomplete and is recorded as timed out.", "TIMEOUT", 80),
  ];
}

export function selectPrismSimulatorProfile(state: ApiState, profileId: string): PrismSimulatorProfile {
  const profile = state.prismSimulatorProfiles.find((item) => item.id === profileId);
  if (!profile) {
    throw new Error(`Prism simulator profile ${profileId} was not found.`);
  }

  state.prismSimulatorProfiles = state.prismSimulatorProfiles.map((item) =>
    item.kind === profile.kind
      ? { ...item, selected: item.id === profileId, updatedAt: new Date().toISOString() }
      : item
  );
  return state.prismSimulatorProfiles.find((item) => item.id === profileId)!;
}

export function activatePrismFailureScenario(
  state: ApiState,
  scenarioId: PrismSimulatorFailureScenarioId
): PrismSimulatorFailureScenario {
  const scenario = state.prismFailureScenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    throw new Error(`Prism failure scenario ${scenarioId} was not found.`);
  }

  state.prismFailureScenarios = state.prismFailureScenarios.map((item) => ({
    ...item,
    active: item.id === scenarioId,
    updatedAt: new Date().toISOString(),
  }));
  return state.prismFailureScenarios.find((item) => item.id === scenarioId)!;
}

export function getActivePrismFailureScenario(state: ApiState): PrismSimulatorFailureScenario {
  return state.prismFailureScenarios.find((item) => item.active) ?? createDefaultPrismFailureScenarios()[0];
}

export function getSelectedPrismSimulatorProfile(state: ApiState, kind: PrismSimulatorProfileKind) {
  return state.prismSimulatorProfiles.find((item) => item.kind === kind && item.selected && item.status === "Active");
}

export function createRealPrismPreflightRun(
  state: ApiState,
  actor: string,
  blockedReasons: PrismAdapterBlockedReason[]
): RealPrismPreflightRun {
  const endpointConfigured = Boolean(process.env.NUTANIX_PRISM_CENTRAL_URL);
  const checks = [
    {
      name: "Endpoint reference",
      passed: endpointConfigured,
      detail: endpointConfigured
        ? "A Prism Central endpoint reference is configured."
        : "No Prism Central endpoint reference is configured.",
    },
    {
      name: "Credential reference",
      passed: Boolean(state.integrationConfigs.find((config) => config.name === "NCI")?.credentialProfile),
      detail: "Credential references are labels only; secret values must stay outside NDC Studio.",
    },
    {
      name: "Lab authorization scope",
      passed: Boolean(state.labAuthorizationScopes[0]),
      detail: "A bounded lab scope must exist before read-only validation.",
    },
    {
      name: "Mutation boundary",
      passed: true,
      detail: "Create, update, delete, power, network, and image mutation calls remain disabled.",
    },
  ];
  const status = checks.every((check) => check.passed) && blockedReasons.every((reason) => reason.code === "real_adapter_disabled" || reason.code === "kill_switch_closed")
    ? "Ready for read-only validation"
    : "Blocked";

  const run: RealPrismPreflightRun = {
    id: `real-prism-preflight-${Date.now()}`,
    status,
    requestedBy: actor,
    createdAt: new Date().toISOString(),
    endpointConfigured,
    provisioningEnabled: false,
    checks,
    blockedReasons,
    mutationOperationsBlocked: ["createVm", "deleteVm", "powerVm", "attachNic", "cloneImage", "updateCategory"],
    evidence: [
      "Preflight created without opening a network connection to Prism Central.",
      "Real adapter remains disabled; this record only validates readiness evidence.",
      "Mutation operations remain blocked by contract.",
    ],
  };

  state.realPrismPreflightRuns = [run, ...state.realPrismPreflightRuns];
  return run;
}

function profile(
  id: string,
  kind: PrismSimulatorProfileKind,
  name: string,
  selected: boolean,
  attributes: PrismSimulatorProfile["attributes"]
): PrismSimulatorProfile {
  return {
    id,
    kind,
    name,
    status: "Active",
    provider: "NCI",
    region: "Berlin Lab",
    selected,
    attributes,
    updatedAt: now,
  };
}

function scenario(
  id: PrismSimulatorFailureScenarioId,
  label: string,
  active: boolean,
  effect: string,
  taskState: PrismSimulatorFailureScenario["taskState"],
  percentageComplete: number
): PrismSimulatorFailureScenario {
  return { id, label, active, effect, taskState, percentageComplete, updatedAt: now };
}
