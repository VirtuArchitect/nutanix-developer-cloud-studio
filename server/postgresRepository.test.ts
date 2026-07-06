import { describe, expect, it } from "vitest";
import {
  createPostgresReadiness,
  PostgresRepository,
  PostgresRepositoryConfigurationError,
  validatePostgresRepositoryConfig,
} from "./postgresRepository";

describe("PostgresRepository hardening", () => {
  it("requires a Postgres connection string when selected", () => {
    expect(validatePostgresRepositoryConfig({ connectionString: "" })).toEqual([
      "DATABASE_URL is required when NDC_REPOSITORY=postgres.",
    ]);
    expect(() => new PostgresRepository({ connectionString: "" })).toThrow(PostgresRepositoryConfigurationError);
  });

  it("validates connection string scheme and schema names", () => {
    expect(
      validatePostgresRepositoryConfig({
        connectionString: "mysql://db.example/ndc",
        schema: "1-invalid",
      })
    ).toEqual([
      "DATABASE_URL must use a postgres:// or postgresql:// connection string.",
      "NDC_DATABASE_SCHEMA must contain only letters, numbers, and underscores, and must not start with a number.",
    ]);
  });

  it("reports readiness without installing or invoking a runtime driver", async () => {
    const repository = new PostgresRepository({
      connectionString: "postgresql://ndc.example/ndc_studio",
      schema: "ndc_studio",
    });
    const readiness = createPostgresReadiness({
      connectionString: "postgresql://ndc.example/ndc_studio",
      schema: "ndc_studio",
    });

    expect(readiness).toMatchObject({
      configured: true,
      driverInstalled: false,
      schema: "ndc_studio",
    });
    await expect(repository.load()).rejects.toThrow("no approved PostgreSQL driver is installed yet");
  });
});
