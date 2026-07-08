import type { Environment, MockPrismExecution, Target, Template } from "../src/data/cloudStudioDomain";
import { createActivePrismAdapter } from "./prismAdapterContract";
import type { ApiState } from "./types";

export function recordMockPrismVmExecution(
  state: ApiState,
  environment: Environment,
  template: Template,
  targets: Target[]
): MockPrismExecution | undefined {
  return createActivePrismAdapter().submitVmCreate(state, environment, template, targets);
}
