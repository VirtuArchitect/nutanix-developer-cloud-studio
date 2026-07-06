import type { ApiRepository } from "./storage";
import type { ApiState } from "./types";

export type PostgresRepositoryConfig = {
  connectionString: string;
  schema?: string;
};

export type PostgresRepositoryReadiness = {
  mode: "postgres";
  configured: boolean;
  driverInstalled: false;
  schema: string;
  migrationDirectory: string;
  message: string;
};

export class PostgresRepositoryConfigurationError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const schemaPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

export class PostgresRepository implements ApiRepository {
  constructor(private readonly config: PostgresRepositoryConfig) {
    assertPostgresRepositoryConfig(config);
  }

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

export function assertPostgresRepositoryConfig(config: PostgresRepositoryConfig) {
  const errors = validatePostgresRepositoryConfig(config);
  if (errors.length > 0) {
    throw new PostgresRepositoryConfigurationError("postgres_config_invalid", errors.join(" "));
  }
}

export function validatePostgresRepositoryConfig(config: PostgresRepositoryConfig) {
  const errors: string[] = [];
  if (!config.connectionString) {
    errors.push("DATABASE_URL is required when NDC_REPOSITORY=postgres.");
  } else if (!/^postgres(ql)?:\/\//.test(config.connectionString)) {
    errors.push("DATABASE_URL must use a postgres:// or postgresql:// connection string.");
  }

  const schema = config.schema ?? "public";
  if (!schemaPattern.test(schema)) {
    errors.push("NDC_DATABASE_SCHEMA must contain only letters, numbers, and underscores, and must not start with a number.");
  }

  return errors;
}

export function createPostgresReadiness(
  config: PostgresRepositoryConfig,
  migrationDirectory = "server/migrations"
): PostgresRepositoryReadiness {
  const errors = validatePostgresRepositoryConfig(config);
  return {
    mode: "postgres",
    configured: errors.length === 0,
    driverInstalled: false,
    schema: config.schema ?? "public",
    migrationDirectory,
    message:
      errors.length === 0
        ? "Postgres configuration is structurally valid, but the runtime driver is intentionally not installed yet."
        : errors.join(" "),
  };
}
