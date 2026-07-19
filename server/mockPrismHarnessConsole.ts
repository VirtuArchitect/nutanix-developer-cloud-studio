import type { MockPrismHarnessConsole } from "../src/data/cloudStudioDomain";
import { createAhvLabRuntimeConfig } from "./ahvLabRuntime";
import { loadMockPrismFixture } from "./mockPrismCentralHarness";
import type { ApiState } from "./types";

export function createMockPrismHarnessConsole(state: ApiState, env = process.env): MockPrismHarnessConsole {
  const fixturePath = env.NDC_MOCK_PRISM_FIXTURE ?? "fixtures/mock-prism/seed.json";
  const endpoint = env.NUTANIX_PRISM_CENTRAL_URL || "http://mock-prism:9440";
  const runtime = createAhvLabRuntimeConfig(env);
  const fixture = safeFixtureLoad(fixturePath);
  const latestRun = state.ahvControlledProvisioningRuns.find((run) => run.adapterMode === "Lab AHV Prism adapter");
  const configChecks = [
    check("Mock Prism endpoint", endpoint.includes("mock-prism") || endpoint.includes("127.0.0.1") || endpoint.includes("localhost"), endpoint),
    check("Fixture path configured", Boolean(fixture), fixture ? fixturePath : "Fixture could not be loaded."),
    check("Lab runtime switches", runtime.provisioningEnabled, runtime.provisioningEnabled ? "AHV lab switches are ready for mock-backed execution." : "Use .env.mock-prism to enable mock-backed lifecycle testing."),
    check("Real AHV defaults protected", env.APP_ENV !== "production", "Mock harness is a lab/developer runtime, not a production adapter."),
    check("Credential material boundary", true, "Console exposes configured markers and commands only; Prism password is never returned."),
  ];

  return {
    version: "v8.8.0-mock-prism-console-integration",
    generatedAt: new Date().toISOString(),
    mode: "Standalone mock harness",
    endpoint,
    fixturePath,
    dockerComposeFile: "docker-compose.mock-prism.yml",
    envTemplate: ".env.mock-prism.example",
    status: configChecks.every((item) => item.passed) ? "Ready" : "Needs configuration",
    inventory: {
      clusters: fixture?.clusters.length ?? 0,
      projects: fixture?.projects.length ?? 0,
      images: fixture?.images.length ?? 0,
      subnets: fixture?.subnets.length ?? 0,
      vms: fixture?.vms.length ?? 0,
      tasks: fixture?.tasks?.length ?? 0,
    },
    configChecks,
    lifecycleSteps: [
      step(1, "Validate mock Prism config", "/api/nutanix/v3/*/list", "Operator command"),
      step(2, "Run AHV lab preflight", "/api/ahv/lab-runtime/preflight", "Ready"),
      step(3, "Record dry-run, scope, rollback, gate, lifecycle proof, and authorization envelope", "/api/vm-sandbox/*", "Evidence"),
      step(4, "Create VM through mock Prism", "/api/nutanix/v3/vms", "Ready"),
      step(5, "Poll create task", "/api/nutanix/v3/tasks/:uuid", "Ready"),
      step(6, "Power transition", "/api/nutanix/v3/vms/:uuid/set_power_state", "Ready"),
      step(7, "Destroy VM", "/api/nutanix/v3/vms/:uuid", "Ready"),
      step(8, "Confirm reconciliation", "/api/nutanix/v3/vms/list", "Ready"),
    ],
    commands: [
      {
        label: "Start mock harness",
        command: "docker compose -f docker-compose.mock-prism.yml --env-file .env.mock-prism up --build",
      },
      {
        label: "Validate fixture inventory",
        command: "npm run validate:mock-prism-config -- -EnvFile .env.mock-prism -PrismUrl http://127.0.0.1:9440",
      },
      {
        label: "Run lifecycle smoke",
        command: "npm run smoke:mock-prism-lifecycle -- -BaseUrl http://127.0.0.1:8080 -PrismUrl http://127.0.0.1:9440",
      },
    ],
    latestRun: latestRun
      ? {
          id: latestRun.id,
          environmentName: latestRun.environmentName,
          status: latestRun.status,
          adapterMode: latestRun.adapterMode,
          vmUuid: latestRun.vmUuid,
          prismTaskUuid: latestRun.prismTaskUuid,
          destroyStatus: latestRun.destroyStatus,
          reconciliationStatus: latestRun.inventoryReconciliation?.status,
          updatedAt: latestRun.updatedAt,
        }
      : undefined,
    safetyBoundary: [
      "Mock Prism uses local fixture and in-memory state only.",
      "Public GitHub Pages demo remains browser mock mode.",
      "Real AHV lab mode remains disabled unless explicit lab switches and private env vars are supplied.",
      "No Prism password, token, Authorization header, or real endpoint secret is returned to the browser.",
    ],
    provisioningEnabled: runtime.provisioningEnabled,
    realPrismCallsEnabled: false,
  };
}

function safeFixtureLoad(path: string) {
  try {
    return loadMockPrismFixture(path);
  } catch {
    return undefined;
  }
}

function check(name: string, passed: boolean, detail: string) {
  return { name, passed, detail };
}

function step(order: number, name: string, endpoint: string, status: MockPrismHarnessConsole["lifecycleSteps"][number]["status"]) {
  return { order, name, endpoint, status };
}
