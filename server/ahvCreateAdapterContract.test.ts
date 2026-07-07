import { describe, expect, it } from "vitest";
import {
  AhvCreateAdapterContractError,
  createDisabledAhvCreateAdapterContract,
} from "./ahvCreateAdapterContract";
import { createDefaultState } from "./storage";

describe("ahv create adapter contract", () => {
  it("keeps execute, poll, and rollback disabled", () => {
    const adapter = createDisabledAhvCreateAdapterContract(createDefaultState(), "platform.admin");

    expect(() => adapter.execute()).toThrowError(AhvCreateAdapterContractError);
    expect(() => adapter.poll()).toThrowError(AhvCreateAdapterContractError);
    expect(() => adapter.rollback()).toThrowError(AhvCreateAdapterContractError);
  });
});
