import { describe, expect, it } from "vitest";
import { createPlatformServiceRequest } from "./platformServices";
import {
  createDisabledPlatformServiceAdapterContract,
  PlatformServiceAdapterContractError,
} from "./platformServiceAdapterContract";
import { createDefaultState } from "./storage";

describe("platform service adapter contract", () => {
  it("maps only approved service payload fields", () => {
    const state = createDefaultState();
    const request = createPlatformServiceRequest(
      state,
      { kind: "NDB PostgreSQL", environmentName: "payments-dev" },
      "platform.admin"
    );
    state.platformServiceRequests = [request];
    const contract = createDisabledPlatformServiceAdapterContract("platform.admin");

    const review = contract.validate(state, { requestId: request.id });

    expect(Object.keys(review.payload).sort()).toEqual(
      [
        "approvalRequired",
        "cleanupPlan",
        "environmentName",
        "estimatedMonthlyCost",
        "kind",
        "owner",
        "profileId",
        "profileName",
        "provider",
        "rollbackPlan",
        "serviceName",
      ].sort()
    );
    expect(review.checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Payload fields approved", passed: true })])
    );
    expect(review.blockedOperations).toEqual(expect.arrayContaining(["create_database", "delete_database"]));
    expect(review.provisioningEnabled).toBe(false);
  });

  it("keeps execute, poll, and rollback disabled", () => {
    const contract = createDisabledPlatformServiceAdapterContract("platform.admin");

    expect(() => contract.execute()).toThrowError(PlatformServiceAdapterContractError);
    expect(() => contract.poll()).toThrowError(PlatformServiceAdapterContractError);
    expect(() => contract.rollback()).toThrowError(PlatformServiceAdapterContractError);
  });
});
