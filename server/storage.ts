import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  initialEnvironments,
  integrations,
  templates,
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

export function createDefaultState(): ApiState {
  return {
    templates,
    environments: initialEnvironments,
    integrations,
    governance: defaultGovernance(),
    jobs: [],
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
