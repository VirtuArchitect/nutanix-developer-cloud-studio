import { describe, expect, it } from "vitest";
import {
  createProviderReleaseGateRecord,
  createProviderReleaseReadinessSummary,
  ProviderReleaseGateError,
} from "./providerReleaseGate";
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

  it("summarizes provider release readiness gaps", () => {
    const state = createDefaultState();
    state.providerReleaseGateRecords = [
      createProviderReleaseGateRecord(state, { provider: "NDB", releaseApprover: "platform.owner" }, "platform.admin"),
    ];

    const summary = createProviderReleaseReadinessSummary(state);

    expect(summary).toMatchObject({
      nearestToReady: "NDB",
      mostBlocked: "NDB",
      provisioningEnabled: false,
    });
    expect(summary.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider: "NDB",
          status: "Blocked",
          gapCount: expect.any(Number),
          gaps: expect.arrayContaining(["Approved lab scope"]),
        }),
        expect.objectContaining({
          provider: "NCI",
          status: "No gate",
          gaps: ["Provider release gate not reviewed"],
        }),
      ])
    );
  });
});
