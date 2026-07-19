import { describe, expect, it } from "vitest";
import {
  createMockPrismState,
  handleMockPrismRequest,
  type MockPrismFixture,
} from "./mockPrismCentralHarness";

const fixture: MockPrismFixture = {
  clusters: [entity("mock-cluster-uuid", "Mock AHV Cluster")],
  projects: [entity("mock-project-uuid", "Mock Project")],
  subnets: [entity("mock-subnet-uuid", "Mock Subnet")],
  images: [entity("mock-image-uuid", "Mock Image")],
  vms: [],
};

describe("standalone mock Prism Central harness", () => {
  it("serves Prism-shaped fixture inventory with Basic Auth", () => {
    const state = createMockPrismState(fixture);
    const response = handleMockPrismRequest(state, {
      method: "POST",
      path: "/api/nutanix/v3/clusters/list",
      authorization: auth(),
      body: { kind: "cluster" },
    }, env());

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      metadata: {
        total_matches: 1,
      },
      entities: [expect.objectContaining({ metadata: { uuid: "mock-cluster-uuid" } })],
    });
  });

  it("rejects Prism requests without matching mock credentials", () => {
    const state = createMockPrismState(fixture);
    const response = handleMockPrismRequest(state, {
      method: "POST",
      path: "/api/nutanix/v3/clusters/list",
      authorization: "Basic invalid",
    }, env());

    expect(response.statusCode).toBe(401);
  });

  it("runs create, poll, power, destroy, and inventory reconciliation without real infrastructure", () => {
    const state = createMockPrismState(fixture);
    const create = handleMockPrismRequest(state, {
      method: "POST",
      path: "/api/nutanix/v3/vms",
      authorization: auth(),
      body: { spec: { name: "ndc-lab-unit-smoke" } },
    }, env());
    const taskUuid = getTaskUuid(create.body);
    const vmUuid = getVmUuid(create.body);

    expect(create.statusCode).toBe(202);
    expect(state.vms).toHaveLength(1);

    const poll = handleMockPrismRequest(state, {
      method: "GET",
      path: `/api/nutanix/v3/tasks/${taskUuid}`,
      authorization: auth(),
    }, env());
    expect(poll.body).toMatchObject({
      status: {
        state: "SUCCEEDED",
        percentage_complete: 100,
      },
    });

    const power = handleMockPrismRequest(state, {
      method: "POST",
      path: `/api/nutanix/v3/vms/${vmUuid}/set_power_state`,
      authorization: auth(),
      body: { transition: "OFF" },
    }, env());
    expect(power.statusCode).toBe(202);
    expect(state.vms[0].status).toMatchObject({ resources: { power_state: "OFF" } });

    const destroy = handleMockPrismRequest(state, {
      method: "DELETE",
      path: `/api/nutanix/v3/vms/${vmUuid}`,
      authorization: auth(),
    }, env());
    expect(destroy.statusCode).toBe(202);

    const vms = handleMockPrismRequest(state, {
      method: "POST",
      path: "/api/nutanix/v3/vms/list",
      authorization: auth(),
    }, env());
    expect(vms.body).toMatchObject({ metadata: { total_matches: 0 }, entities: [] });
  });

  it("keeps safety prefix enforcement for mock VM creates", () => {
    const state = createMockPrismState(fixture);
    const response = handleMockPrismRequest(state, {
      method: "POST",
      path: "/api/nutanix/v3/vms",
      authorization: auth(),
      body: { spec: { name: "production-vm" } },
    }, env());

    expect(response.statusCode).toBe(400);
    expect(state.vms).toHaveLength(0);
  });
});

function entity(uuid: string, name: string) {
  return {
    metadata: { uuid },
    status: { name },
  };
}

function env(): NodeJS.ProcessEnv {
  return {
    NUTANIX_PRISM_USERNAME: "mock-prism-user",
    NUTANIX_PRISM_PASSWORD: "mock-prism-password",
  };
}

function auth() {
  return `Basic ${Buffer.from("mock-prism-user:mock-prism-password").toString("base64")}`;
}

function getTaskUuid(body: Record<string, unknown>) {
  const task = body.metadata as { uuid?: string };
  if (!task.uuid) {
    throw new Error("Missing task UUID");
  }
  return task.uuid;
}

function getVmUuid(body: Record<string, unknown>) {
  const status = body.status as { entity_reference?: { uuid?: string } };
  if (!status.entity_reference?.uuid) {
    throw new Error("Missing VM UUID");
  }
  return status.entity_reference.uuid;
}
