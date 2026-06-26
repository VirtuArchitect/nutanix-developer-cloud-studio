import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  initialEnvironments,
  integrations,
  templates,
  type ApprovalRequest,
  type TemplateGovernance,
} from "../src/data/cloudStudioDomain";
import type { ApiState } from "./types";

export type ApiStore = {
  load(): Promise<ApiState>;
  save(state: ApiState): Promise<void>;
};

function defaultGovernance(): TemplateGovernance {
  return Object.fromEntries(
    templates.map((template) => [template.id, { owner: template.owner, tier: template.tier }])
  );
}

function defaultApprovals(): ApprovalRequest[] {
  return initialEnvironments
    .filter((environment) => environment.status === "Needs approval")
    .map((environment) => ({
      id: `approval-${environment.name}`,
      environmentName: environment.name,
      template: environment.template,
      owner: environment.owner,
      reason: environment.template.includes("AI")
        ? "AI endpoint requests require platform approval."
        : "Regulated templates require platform approval.",
      status: "Pending",
      requestedAt: environment.createdAt,
    }));
}

export function createDefaultState(): ApiState {
  return {
    templates,
    environments: initialEnvironments,
    integrations,
    governance: defaultGovernance(),
    jobs: [],
    approvals: defaultApprovals(),
    auditEvents: [],
  };
}

export class MemoryStore implements ApiStore {
  private state: ApiState;

  constructor(initialState: ApiState = createDefaultState()) {
    this.state = structuredClone(initialState);
  }

  async load() {
    return structuredClone(this.state);
  }

  async save(state: ApiState) {
    this.state = structuredClone(state);
  }
}

export class JsonFileStore implements ApiStore {
  constructor(private readonly filePath: string) {}

  async load() {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return {
        ...createDefaultState(),
        ...(JSON.parse(raw) as Partial<ApiState>),
      };
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        const state = createDefaultState();
        await this.save(state);
        return state;
      }

      throw error;
    }
  }

  async save(state: ApiState) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  }
}
