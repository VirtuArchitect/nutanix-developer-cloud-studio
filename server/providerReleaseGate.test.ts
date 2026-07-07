import { describe, expect, it } from "vitest";
import { createProviderReleaseGateRecord, ProviderReleaseGateError } from "./providerReleaseGate";
import { createDefaultState } from "./storage";

describe("provider release gate", () => {
  it("keeps provider release blocked without required evidence", () => {
    const state = createDefaultState();

    const record = createProviderReleaseGateRecord(state, { provider: "NDB", releaseApprover: "platform.owner" }, "platform.admin");

    expect(record).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      releaseApprover: "platform.owner",
      provisioningEnabled: false,
      killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Approved lab scope", passed: false }),
        expect.objectContaining({ name: "Provider contract evidence ready", passed: false }),
        expect.objectContaining({ name: "Real adapter disabled", passed: true }),
      ])
    );
    expect(record.blockedOperations).toEqual(expect.arrayContaining(["create_database", "delete_database"]));
  });

  it("rejects unsupported provider release gates", () => {
    const state = createDefaultState();

    expect(() =>
      createProviderReleaseGateRecord(
        state,
        { provider: "NCM" as unknown as "NCI", releaseApprover: "platform.owner" },
        "platform.admin"
      )
    ).toThrowError(ProviderReleaseGateError);
  });
});
