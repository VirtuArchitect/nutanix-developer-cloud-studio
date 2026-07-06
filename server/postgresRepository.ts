import type { ApiRepository } from "./storage";
import type { ApiState } from "./types";

export type PostgresRepositoryConfig = {
  connectionString: string;
  schema?: string;
};

export class PostgresRepository implements ApiRepository {
  constructor(private readonly config: PostgresRepositoryConfig) {}

  async load(): Promise<ApiState> {
    throw new Error(
      `PostgresRepository is configured for schema ${this.config.schema ?? "public"} but no approved PostgreSQL driver is installed yet.`
    );
  }

  async save(_state: ApiState): Promise<void> {
    throw new Error(
      "PostgresRepository is a production-foundation scaffold. Add an approved PostgreSQL driver before enabling database persistence."
    );
  }
}
