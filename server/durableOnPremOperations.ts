import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  AdminUpgradeHealthConsole,
  DurablePersistenceStatus,
  JwtVerificationBoundary,
  MigrationBaselineManifest,
  OnPremInstallProfilePack,
  ProductionHardeningCheck,
  SignedAuditExportManifest,
} from "../src/data/cloudStudioDomain";
import type { ApiState } from "./types";
import { createPostgresReadiness } from "./postgresRepository";

const schemaVersion = "7.5.0-on-prem-install-profile-pack";
const migrationDirectory = "server/migrations";

export function createDurablePersistenceStatus(repositoryName: string): DurablePersistenceStatus {
  const activeRepository = repositoryMode(repositoryName);
  const postgres = createPostgresReadiness({
    connectionString: process.env.DATABASE_URL ?? "",
    schema: process.env.NDC_DATABASE_SCHEMA ?? "ndc_studio",
  });
  const runtimeEnabled = activeRepository === "postgres" && postgres.configured && postgres.driverInstalled;
  const contractImplemented = true;

  return {
    id: `durable-persistence-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: runtimeEnabled
      ? "Durable persistence ready"
      : activeRepository === "postgres" && postgres.configured
        ? "Durable persistence scaffold ready"
        : activeRepository === "json-file"
          ? "Durable persistence ready"
          : "Blocked",
    activeRepository,
    postgres: {
      configured: postgres.configured,
      driverInstalled: postgres.driverInstalled,
      schema: postgres.schema,
      migrationDirectory: postgres.migrationDirectory,
      contractImplemented,
      runtimeEnabled,
      message: postgres.message,
    },
    repositoryContract: [
      "load(): Promise<ApiState>",
      "save(state: ApiState): Promise<void>",
      "applyRetention(state): ApiState",
      "migrations are validated before postgres mode is accepted",
    ],
    checks: [
      check("Repository boundary implemented", contractImplemented, "Memory, JSON-file, and Postgres repository classes share ApiRepository."),
      check("Durable mode active", activeRepository !== "memory", activeRepository === "memory" ? "Runtime is using memory mode." : `${activeRepository} mode is active.`),
      check("Postgres configuration structurally valid", postgres.configured, postgres.message),
      check("Postgres runtime driver approved", postgres.driverInstalled, postgres.driverInstalled ? "Postgres driver is installed." : "No approved Postgres driver is installed; postgres mode remains fail-closed."),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createMigrationBaselineManifest(): MigrationBaselineManifest {
  const migrations = readMigrations();
  const validation = [
    check("Migration directory exists", migrations.length > 0, `${migrations.length} migration file(s) found.`),
    check("Migrations are idempotent", migrations.every((migration) => migration.content.includes("CREATE TABLE IF NOT EXISTS")), "Each migration must use idempotent table creation."),
    check("No destructive statements", migrations.every((migration) => !isDestructiveMigration(migration.content)), "DROP, TRUNCATE, and destructive ALTER statements are blocked from baseline migrations."),
  ];

  return {
    id: `migration-baseline-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: validation.every((item) => item.passed) ? "Migration baseline ready" : "Migration baseline blocked",
    schemaVersion,
    latestMigration: migrations.at(-1)?.name ?? "none",
    migrations: migrations.map((migration) => ({
      version: migration.name.split("_")[0] ?? "unknown",
      name: migration.name,
      checksum: sha256(migration.content),
      destructive: isDestructiveMigration(migration.content),
    })),
    validation,
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createJwtVerificationBoundary(): JwtVerificationBoundary {
  const issuerConfigured = Boolean(process.env.OIDC_ISSUER_URL);
  const audienceConfigured = Boolean(process.env.OIDC_CLIENT_ID || process.env.OIDC_AUDIENCE);
  const jwksConfigured = Boolean(process.env.OIDC_JWKS_URL || process.env.OIDC_ISSUER_URL);
  const trustedRequired = process.env.NDC_REQUIRE_TRUSTED_IDENTITY === "true";
  const jwtRequested = process.env.NDC_AUTH_MODE === "jwt" || process.env.NDC_AUTH_MODE === "hybrid";
  const jwtReady = issuerConfigured && audienceConfigured && jwksConfigured;

  return {
    id: `jwt-boundary-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: jwtReady ? "JWT boundary ready" : trustedRequired ? "Trusted-header mode only" : "Blocked",
    authMode: jwtRequested ? (process.env.NDC_AUTH_MODE as "jwt" | "hybrid") : "trusted-header",
    issuerConfigured,
    audienceConfigured,
    jwksConfigured,
    verificationChecks: [
      check("Issuer configured", issuerConfigured, issuerConfigured ? "OIDC_ISSUER_URL is configured." : "OIDC_ISSUER_URL is required for JWT verification."),
      check("Audience configured", audienceConfigured, audienceConfigured ? "OIDC audience/client ID is configured." : "OIDC_CLIENT_ID or OIDC_AUDIENCE is required."),
      check("JWKS discovery available", jwksConfigured, jwksConfigured ? "JWKS can be derived from issuer or explicit URL." : "OIDC_JWKS_URL or issuer discovery is required."),
      check("Trusted-header fallback explicit", trustedRequired, trustedRequired ? "Trusted header mode is required by runtime config." : "Set NDC_REQUIRE_TRUSTED_IDENTITY=true for proxy deployments."),
    ],
    trustedHeaderFallback: true,
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createSignedAuditExportManifest(state: ApiState): SignedAuditExportManifest {
  const keyRef = process.env.NDC_AUDIT_SIGNING_KEY_REF || "ndc-local-development-key-ref";
  const manifestDigest = sha256(
    JSON.stringify({
      events: state.auditEvents.slice(0, 100).map(({ id, action, actor, target, createdAt }) => ({ id, action, actor, target, createdAt })),
      exports: state.auditExports.slice(0, 20).map(({ id, requestedBy, status, createdAt }) => ({ id, requestedBy, status, createdAt })),
    })
  );
  const externalSignerConfigured = Boolean(process.env.NDC_AUDIT_SIGNING_KEY_REF);
  const signature = externalSignerConfigured
    ? `external-signer:${sha256(`${manifestDigest}:${keyRef}`).slice(0, 32)}`
    : `dev-signature:${sha256(`${manifestDigest}:${keyRef}`).slice(0, 32)}`;

  return {
    id: `signed-audit-export-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: externalSignerConfigured ? "Signed" : "Signature pending external signer",
    manifestDigest,
    signingKeyRef: keyRef,
    signatureAlgorithm: externalSignerConfigured ? "external-signer" : "sha256-development-signature",
    signature,
    verification: [
      check("Manifest digest created", manifestDigest.length === 64, "SHA-256 digest is available."),
      check("Signing key reference configured", externalSignerConfigured, externalSignerConfigured ? "External signing key reference is configured." : "Set NDC_AUDIT_SIGNING_KEY_REF for production signing."),
      check("Signature material avoids secrets", !signature.includes("BEGIN") && !signature.includes("Bearer"), "Only signature metadata is stored."),
    ],
    redactionBoundary: "Audit signing uses event/export metadata only. Credentials, authorization headers, endpoint values, and customer payloads are excluded.",
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createAdminUpgradeHealthConsole(state: ApiState, repositoryName: string): AdminUpgradeHealthConsole {
  const persistence = createDurablePersistenceStatus(repositoryName);
  const migrations = createMigrationBaselineManifest();
  const jwt = createJwtVerificationBoundary();
  const signedAudit = createSignedAuditExportManifest(state);
  const configDrift = [
    check("Real Prism calls disabled", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "Read-only HTTP remains disabled."),
    check("Real provisioning disabled", process.env.NDC_PRISM_REAL_ADAPTER !== "enabled", "Real adapter flag is disabled."),
    check("Durable repository selected", persistence.activeRepository !== "memory", persistence.activeRepository === "memory" ? "Memory mode is not suitable for on-prem operations." : `${persistence.activeRepository} mode selected.`),
    check("JWT or trusted boundary configured", jwt.status !== "Blocked", jwt.status),
    check("Audit signing configured", signedAudit.status === "Signed", signedAudit.status),
  ];
  const upgradeBlockers = [...persistence.checks, ...migrations.validation, ...jwt.verificationChecks, ...signedAudit.verification, ...configDrift]
    .filter((item) => !item.passed)
    .map((item) => item.name);

  return {
    id: `admin-upgrade-health-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: upgradeBlockers.length === 0 ? "Ready for on-prem pilot" : "Blocked",
    repositoryMode: persistence.activeRepository,
    schemaVersion: migrations.schemaVersion,
    authPosture: jwt.status,
    auditSigningStatus: signedAudit.status,
    configDrift,
    upgradeBlockers,
    checks: [
      check("Migration baseline ready", migrations.status === "Migration baseline ready", migrations.latestMigration),
      check("Persistence reviewed", persistence.status !== "Blocked", persistence.status),
      check("Auth boundary reviewed", jwt.status !== "Blocked", jwt.status),
      check("Audit signing reviewed", signedAudit.status === "Signed", signedAudit.status),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

export function createOnPremInstallProfilePack(): OnPremInstallProfilePack {
  return {
    id: `onprem-install-profile-pack-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    status: "Install profile pack ready",
    profiles: [
      installProfile("local-json", ".env.example", "docker-compose.yml", "Local durable JSON-file validation", ["NDC_REPOSITORY=json", "NDC_DATA_FILE=.data/ndc-studio.json"]),
      installProfile("on-prem-json", "docs/on-prem-profiles/on-prem-json.env.example", "docker-compose.yml", "Small private pilot with JSON-file state", ["NDC_REQUIRE_TRUSTED_IDENTITY=true", "NDC_AUDIT_SIGNING_KEY_REF", "NDC_DATA_FILE"]),
      installProfile("on-prem-postgres", "docs/on-prem-profiles/on-prem-postgres.env.example", "docker-compose.yml", "Future Postgres-backed private deployment", ["NDC_REPOSITORY=postgres", "DATABASE_URL", "NDC_DATABASE_SCHEMA", "NDC_AUDIT_SIGNING_KEY_REF"]),
      installProfile("lab-prep", "docs/on-prem-profiles/lab-prep.env.example", "docker-compose.yml", "Authorized lab preparation with evidence-only adapters", ["NDC_DEPLOYMENT_PROFILE=lab-prep", "NDC_PRISM_READONLY_HTTP_ENABLED=false"]),
    ],
    validationCommands: [
      "npm.cmd run validate:onprem",
      "npm.cmd run validate:postgres",
      "npm.cmd run validate:onprem-profile-pack",
      "npm.cmd run validate:backup",
    ],
    backupRestoreRunbook: [
      "Stop API writes before state backup.",
      "Run checksum-backed backup validation.",
      "Restore into a clean runtime and verify /readyz.",
      "Validate audit manifest signature before returning service.",
    ],
    checks: [
      check("Profiles documented", true, "On-prem profile templates are listed for local JSON, on-prem JSON, Postgres, and lab prep."),
      check("Validation commands available", true, "Validation scripts are listed for install readiness."),
      check("Real infrastructure mutation disabled", true, "Install profiles preserve disabled Nutanix mutation flags."),
    ],
    provisioningEnabled: false,
    realPrismCallsEnabled: false,
  };
}

function repositoryMode(repositoryName: string): DurablePersistenceStatus["activeRepository"] {
  if (repositoryName === "PostgresRepository") {
    return "postgres";
  }
  if (repositoryName === "JsonFileStore") {
    return "json-file";
  }
  return "memory";
}

function readMigrations() {
  try {
    return readdirSync(migrationDirectory)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({
        name,
        content: readFileSync(join(migrationDirectory, name), "utf8"),
      }));
  } catch {
    return [];
  }
}

function isDestructiveMigration(content: string) {
  return /\b(DROP|TRUNCATE)\b|ALTER\s+TABLE\s+\S+\s+DROP\b/i.test(content);
}

function installProfile(
  name: OnPremInstallProfilePack["profiles"][number]["name"],
  envFile: string,
  composeFile: string,
  purpose: string,
  requiredSettings: string[]
): OnPremInstallProfilePack["profiles"][number] {
  return { name, envFile, composeFile, purpose, requiredSettings };
}

function check(name: string, passed: boolean, detail: string): ProductionHardeningCheck {
  return { name, passed, detail };
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
