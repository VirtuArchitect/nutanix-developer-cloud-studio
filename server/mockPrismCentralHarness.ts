import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type PrismEntity = {
  metadata: { uuid: string; kind?: string };
  spec?: Record<string, unknown>;
  status: Record<string, unknown>;
};

type PrismTaskState = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

type PrismTask = {
  metadata: { uuid: string };
  status: {
    state: PrismTaskState;
    percentage_complete: number;
    message: string;
    entity_reference?: { uuid: string; kind: string };
    entity_reference_list?: Array<{ uuid: string; kind: string }>;
  };
  pollCount: number;
};

export type MockPrismFixture = {
  clusters: PrismEntity[];
  projects: PrismEntity[];
  subnets: PrismEntity[];
  images: PrismEntity[];
  vms: PrismEntity[];
  tasks?: PrismTask[];
};

export type MockPrismState = MockPrismFixture & {
  tasks: PrismTask[];
  requestLog: Array<{ method: string; path: string; createdAt: string }>;
};

export type MockPrismRequest = {
  method: string;
  path: string;
  authorization?: string;
  body?: Record<string, unknown>;
};

export type MockPrismResponse = {
  statusCode: number;
  body: Record<string, unknown>;
};

const collectionByListPath: Record<string, keyof MockPrismFixture> = {
  "/api/nutanix/v3/clusters/list": "clusters",
  "/api/nutanix/v3/projects/list": "projects",
  "/api/nutanix/v3/images/list": "images",
  "/api/nutanix/v3/subnets/list": "subnets",
  "/api/nutanix/v3/vms/list": "vms",
};

export function loadMockPrismFixture(path = process.env.NDC_MOCK_PRISM_FIXTURE) {
  const fixturePath = path ? resolve(path) : resolve(process.cwd(), "fixtures/mock-prism/seed.json");
  return JSON.parse(readFileSync(fixturePath, "utf8")) as MockPrismFixture;
}

export function createMockPrismState(fixture: MockPrismFixture): MockPrismState {
  return {
    clusters: [...fixture.clusters],
    projects: [...fixture.projects],
    subnets: [...fixture.subnets],
    images: [...fixture.images],
    vms: [...fixture.vms],
    tasks: [...(fixture.tasks ?? [])],
    requestLog: [],
  };
}

export function handleMockPrismRequest(
  state: MockPrismState,
  request: MockPrismRequest,
  env = process.env
): MockPrismResponse {
  const method = request.method.toUpperCase();
  const path = stripQuery(request.path);
  state.requestLog.push({ method, path, createdAt: new Date().toISOString() });

  if (path === "/healthz") {
    return ok({
      status: "ok",
      service: "mock-prism-central",
      counts: entityCounts(state),
    });
  }

  if (path === "/_mock-prism/state") {
    return ok({
      counts: entityCounts(state),
      tasks: state.tasks.map((task) => ({
        uuid: task.metadata.uuid,
        state: task.status.state,
        entity: task.status.entity_reference,
      })),
      vms: state.vms.map((vm) => ({
        uuid: vm.metadata.uuid,
        name: vm.spec?.name ?? vm.status.name,
        powerState: getNested(vm, ["status", "resources", "power_state"]),
      })),
    });
  }

  if (!isAuthorized(request.authorization, env)) {
    return {
      statusCode: 401,
      body: {
        error: "Unauthorized",
        message: "Mock Prism Central requires matching Basic Auth credentials.",
      },
    };
  }

  if (method === "POST" && collectionByListPath[path]) {
    return listEntities(state[collectionByListPath[path]]);
  }

  if (method === "POST" && path === "/api/nutanix/v3/vms") {
    return createVm(state, request.body ?? {});
  }

  const taskMatch = path.match(/^\/api\/nutanix\/v3\/tasks\/([^/]+)$/);
  if (method === "GET" && taskMatch) {
    return pollTask(state, decodeURIComponent(taskMatch[1]));
  }

  const powerMatch = path.match(/^\/api\/nutanix\/v3\/vms\/([^/]+)\/set_power_state$/);
  if (method === "POST" && powerMatch) {
    return setPowerState(state, decodeURIComponent(powerMatch[1]), request.body ?? {});
  }

  const deleteMatch = path.match(/^\/api\/nutanix\/v3\/vms\/([^/]+)$/);
  if (method === "DELETE" && deleteMatch) {
    return deleteVm(state, decodeURIComponent(deleteMatch[1]));
  }

  return {
    statusCode: 404,
    body: {
      error: "Not Found",
      message: `Mock Prism Central does not implement ${method} ${path}.`,
    },
  };
}

function listEntities(entities: PrismEntity[]): MockPrismResponse {
  return ok({
    metadata: {
      total_matches: entities.length,
      length: entities.length,
      offset: 0,
    },
    entities,
  });
}

function createVm(state: MockPrismState, body: Record<string, unknown>): MockPrismResponse {
  const spec = (body.spec && typeof body.spec === "object" ? body.spec : {}) as Record<string, unknown>;
  const name = typeof spec.name === "string" ? spec.name : "ndc-lab-mock-vm";
  if (!name.startsWith("ndc-lab-") || /prod|production/i.test(name)) {
    return {
      statusCode: 400,
      body: {
        error: "Bad Request",
        message: "Mock Prism refuses VM names outside the ndc-lab-* safety prefix.",
      },
    };
  }

  const existing = state.vms.find((vm) => vm.spec?.name === name || vm.status.name === name);
  if (existing) {
    return {
      statusCode: 409,
      body: {
        error: "Conflict",
        message: `VM ${name} already exists in Mock Prism inventory.`,
      },
    };
  }

  const vmUuid = `mock-vm-${slug(name)}-${Date.now()}`;
  const vm: PrismEntity = {
    metadata: { uuid: vmUuid, kind: "vm" },
    spec,
    status: {
      name,
      state: "COMPLETE",
      resources: {
        power_state: "ON",
      },
    },
  };
  state.vms.push(vm);
  const task = createTask("create_vm", vmUuid, "Create VM accepted by Mock Prism Central.");
  state.tasks.push(task);
  return ok(task, 202);
}

function pollTask(state: MockPrismState, taskUuid: string): MockPrismResponse {
  const task = state.tasks.find((item) => item.metadata.uuid === taskUuid);
  if (!task) {
    return {
      statusCode: 404,
      body: {
        error: "Not Found",
        message: `Task ${taskUuid} was not found.`,
      },
    };
  }
  task.pollCount += 1;
  task.status.state = "SUCCEEDED";
  task.status.percentage_complete = 100;
  return ok(task);
}

function setPowerState(state: MockPrismState, vmUuid: string, body: Record<string, unknown>): MockPrismResponse {
  const vm = findVm(state, vmUuid);
  if (!vm) {
    return notFound("VM", vmUuid);
  }
  const transition = body.transition === "OFF" ? "OFF" : "ON";
  const resources = ensureResources(vm);
  resources.power_state = transition;
  const task = createTask("set_power_state", vmUuid, `Power state set to ${transition}.`);
  state.tasks.push(task);
  return ok(task, 202);
}

function deleteVm(state: MockPrismState, vmUuid: string): MockPrismResponse {
  const before = state.vms.length;
  state.vms = state.vms.filter((vm) => vm.metadata.uuid !== vmUuid);
  if (state.vms.length === before) {
    return notFound("VM", vmUuid);
  }
  const task = createTask("delete_vm", vmUuid, "VM removed from Mock Prism inventory.");
  state.tasks.push(task);
  return ok(task, 202);
}

function createTask(operation: string, vmUuid: string, message: string): PrismTask {
  return {
    metadata: { uuid: `mock-task-${operation}-${Date.now()}-${Math.floor(Math.random() * 10000)}` },
    status: {
      state: "RUNNING",
      percentage_complete: 50,
      message,
      entity_reference: { uuid: vmUuid, kind: "vm" },
      entity_reference_list: [{ uuid: vmUuid, kind: "vm" }],
    },
    pollCount: 0,
  };
}

function isAuthorized(authorization: string | undefined, env: NodeJS.ProcessEnv) {
  const username = env.NUTANIX_PRISM_USERNAME ?? "mock-prism-user";
  const password = env.NUTANIX_PRISM_PASSWORD ?? "mock-prism-password";
  const expected = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  return authorization === expected;
}

function entityCounts(state: MockPrismState) {
  return {
    clusters: state.clusters.length,
    projects: state.projects.length,
    subnets: state.subnets.length,
    images: state.images.length,
    vms: state.vms.length,
    tasks: state.tasks.length,
  };
}

function findVm(state: MockPrismState, vmUuid: string) {
  return state.vms.find((vm) => vm.metadata.uuid === vmUuid);
}

function ensureResources(vm: PrismEntity) {
  const status = vm.status as Record<string, unknown>;
  if (!status.resources || typeof status.resources !== "object") {
    status.resources = {};
  }
  return status.resources as Record<string, unknown>;
}

function notFound(kind: string, uuid: string): MockPrismResponse {
  return {
    statusCode: 404,
    body: {
      error: "Not Found",
      message: `${kind} ${uuid} was not found.`,
    },
  };
}

function ok(body: Record<string, unknown>, statusCode = 200): MockPrismResponse {
  return { statusCode, body };
}

function stripQuery(path: string) {
  return path.split("?")[0] ?? path;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getNested(value: unknown, path: string[]) {
  let current = value;
  for (const part of path) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
