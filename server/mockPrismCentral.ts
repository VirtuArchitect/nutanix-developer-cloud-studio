import type { IncomingMessage, ServerResponse } from "node:http";
import type { MockPrismSimulatorStatus } from "../src/data/cloudStudioDomain";
import { securityHeaders } from "./security";

type PrismEntityKind = "clusters" | "projects" | "images" | "subnets" | "categories" | "vms";

type PrismEntity = {
  metadata: {
    kind: string;
    uuid: string;
    name?: string;
  };
  spec: Record<string, unknown>;
  status: Record<string, unknown>;
};

type PrismTask = {
  metadata: {
    kind: "task";
    uuid: string;
  };
  status: {
    state: "SUCCEEDED";
    percentage_complete: 100;
    message: string;
    created_time: string;
    entity_reference: {
      kind: string;
      uuid: string;
      name: string;
    };
  };
};

const mockPrismEntities: Record<PrismEntityKind, PrismEntity[]> = {
  clusters: [
    entity("cluster", "mock-cluster-berlin-01", "berlin-ahv-lab", {
      resources: { nodes: 4, hypervisor_type: "AHV", timezone: "Europe/Berlin" },
    }),
  ],
  projects: [
    entity("project", "mock-project-devcloud", "Developer Cloud Lab", {
      resources: { default_subnet_reference: reference("subnet", "mock-subnet-dev-segment", "dev-segment") },
    }),
  ],
  images: [
    entity("image", "mock-image-rocky-9-hardened", "Rocky Linux 9 Hardened", {
      resources: { image_type: "DISK_IMAGE", architecture: "X86_64", os: "linux" },
    }),
    entity("image", "mock-image-ubuntu-2404-lts", "Ubuntu 24.04 LTS Developer", {
      resources: { image_type: "DISK_IMAGE", architecture: "X86_64", os: "linux" },
    }),
  ],
  subnets: [
    entity("subnet", "mock-subnet-dev-segment", "dev-segment", {
      resources: { vlan_id: 120, subnet_type: "VLAN", ip_config: { default_gateway_ip: "10.42.120.1" } },
    }),
  ],
  categories: [
    entity("category", "mock-category-lifecycle-expiry", "Lifecycle:30-day-expiry", {
      resources: { key: "Lifecycle", value: "30-day-expiry" },
    }),
    entity("category", "mock-category-cost-sandbox", "CostCenter:Sandbox", {
      resources: { key: "CostCenter", value: "Sandbox" },
    }),
  ],
  vms: [
    entity("vm", "mock-vm-payments-dev", "payments-dev", {
      resources: {
        power_state: "ON",
        num_sockets: 2,
        memory_size_mib: 8192,
        nic_list: [{ subnet_reference: reference("subnet", "mock-subnet-dev-segment", "dev-segment") }],
      },
    }),
    entity("vm", "mock-vm-billing-sandbox", "billing-sandbox", {
      resources: {
        power_state: "OFF",
        num_sockets: 2,
        memory_size_mib: 8192,
        nic_list: [{ subnet_reference: reference("subnet", "mock-subnet-dev-segment", "dev-segment") }],
      },
    }),
  ],
};

export async function routeMockPrismCentral(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL
): Promise<boolean> {
  if (!url.pathname.startsWith("/mock-prism")) {
    return false;
  }

  if (request.method === "GET" && url.pathname === "/mock-prism/health") {
    sendMockPrismJson(response, 200, {
      data: createMockPrismSimulatorStatus(),
    });
    return true;
  }

  const listMatch = url.pathname.match(/^\/mock-prism\/api\/nutanix\/v3\/(clusters|projects|images|subnets|categories|vms)\/list$/);
  if (request.method === "POST" && listMatch) {
    const kind = listMatch[1] as PrismEntityKind;
    sendMockPrismJson(response, 200, createMockPrismListResponse(kind));
    return true;
  }

  if (request.method === "POST" && url.pathname === "/mock-prism/api/nutanix/v3/vms") {
    const body = await readMockPrismJson<Record<string, unknown>>(request);
    if (!body.ok) {
      sendMockPrismJson(response, 400, {
        error: {
          code: "mock_prism_invalid_json",
          message: "Mock Prism Central request body must be valid JSON.",
        },
      });
      return true;
    }

    const name = extractVmName(body);
    const task = createMockPrismTask(`Mock VM create accepted for ${name}. No real VM was created.`, `mock-vm-${name}`);
    sendMockPrismJson(response, 202, {
      metadata: { kind: "vm_create_response" },
      status: {
        execution_context: "mock-prism",
        state: "ACCEPTED",
        message: task.status.message,
      },
      task_reference: reference("task", task.metadata.uuid, `create-${name}`),
    });
    return true;
  }

  const powerMatch = url.pathname.match(/^\/mock-prism\/api\/nutanix\/v3\/vms\/([^/]+)\/set_power_state$/);
  if (request.method === "POST" && powerMatch) {
    const vmUuid = decodeURIComponent(powerMatch[1]);
    const task = createMockPrismTask(`Mock VM power transition accepted for ${vmUuid}.`, vmUuid);
    sendMockPrismJson(response, 202, {
      metadata: { kind: "vm_power_response" },
      status: { execution_context: "mock-prism", state: "ACCEPTED", message: task.status.message },
      task_reference: reference("task", task.metadata.uuid, `power-${vmUuid}`),
    });
    return true;
  }

  const deleteMatch = url.pathname.match(/^\/mock-prism\/api\/nutanix\/v3\/vms\/([^/]+)$/);
  if (request.method === "DELETE" && deleteMatch) {
    const vmUuid = decodeURIComponent(deleteMatch[1]);
    const task = createMockPrismTask(`Mock VM destroy accepted for ${vmUuid}.`, vmUuid);
    sendMockPrismJson(response, 202, {
      metadata: { kind: "vm_delete_response" },
      status: { execution_context: "mock-prism", state: "ACCEPTED", message: task.status.message },
      task_reference: reference("task", task.metadata.uuid, `delete-${vmUuid}`),
    });
    return true;
  }

  const taskMatch = url.pathname.match(/^\/mock-prism\/api\/nutanix\/v3\/tasks\/([^/]+)$/);
  if (request.method === "GET" && taskMatch) {
    sendMockPrismJson(response, 200, createMockPrismTask(`Mock task ${decodeURIComponent(taskMatch[1])} completed.`));
    return true;
  }

  sendMockPrismJson(response, 404, {
    error: {
      code: "mock_prism_route_not_found",
      message: "Mock Prism Central route not found.",
    },
  });
  return true;
}

export function createMockPrismSimulatorStatus(endpoint = process.env.NUTANIX_MOCK_PRISM_CENTRAL_URL ?? "http://localhost:8080/mock-prism"): MockPrismSimulatorStatus {
  return {
    service: "Mock Prism Central",
    status: "Healthy",
    mode: "Simulated",
    endpoint,
    mutationBoundary: "No real Nutanix infrastructure is contacted.",
    availableInventory: {
      clusters: mockPrismEntities.clusters.length,
      projects: mockPrismEntities.projects.length,
      images: mockPrismEntities.images.length,
      subnets: mockPrismEntities.subnets.length,
      categories: mockPrismEntities.categories.length,
      vms: mockPrismEntities.vms.length,
    },
  };
}

export function createMockPrismListResponse(kind: PrismEntityKind) {
  const entities = mockPrismEntities[kind];
  return {
    metadata: {
      kind,
      total_matches: entities.length,
      length: entities.length,
      offset: 0,
    },
    entities,
  };
}

export function getMockPrismEntity(kind: PrismEntityKind, index = 0) {
  return mockPrismEntities[kind][index];
}

function entity(kind: string, uuid: string, name: string, status: Record<string, unknown>): PrismEntity {
  return {
    metadata: {
      kind,
      uuid,
      name,
    },
    spec: {
      name,
      description: "Mock Prism Central entity for NDC Studio simulated adapter testing.",
    },
    status: {
      name,
      state: "COMPLETE",
      ...status,
    },
  };
}

function reference(kind: string, uuid: string, name: string) {
  return { kind, uuid, name };
}

export function createMockPrismTask(message: string, vmUuid = "mock-vm-task-target"): PrismTask {
  return {
    metadata: {
      kind: "task",
      uuid: `mock-task-${Date.now()}`,
    },
    status: {
      state: "SUCCEEDED",
      percentage_complete: 100,
      message,
      created_time: new Date().toISOString(),
      entity_reference: reference("vm", vmUuid, vmUuid),
    },
  };
}

function extractVmName(body: Record<string, unknown>) {
  const spec = typeof body.spec === "object" && body.spec ? (body.spec as Record<string, unknown>) : {};
  return typeof spec.name === "string" && spec.name.trim() ? spec.name.trim() : "ndc-studio-mock-vm";
}

function sendMockPrismJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, securityHeaders({ "Content-Type": "application/json; charset=utf-8" }));
  response.end(JSON.stringify(body));
}

async function readMockPrismJson<T>(request: IncomingMessage): Promise<{ ok: true } & T | { ok: false }> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return { ok: true } as { ok: true } & T;
  }

  try {
    return { ok: true, ...(JSON.parse(Buffer.concat(chunks).toString("utf8")) as T) };
  } catch {
    return { ok: false };
  }
}
