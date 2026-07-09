import type { Server } from "node:http";
import { request as httpRequest } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApiServer } from "./apiServer";
import { MemoryRateLimiter } from "./security";
import { applyRetention, MemoryStore } from "./storage";
import { createDefaultState } from "./storage";

describe("api server", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    resetAhvLabEnv();
    process.env.NDC_RATE_LIMIT_PER_MINUTE = "1000";
    server = createApiServer({ store: new MemoryStore() });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address.");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    resetAhvLabEnv();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("reports health and readiness", async () => {
    await expectJson("/healthz", 200, { data: { ok: true } });
    await expectJson("/readyz", 200, { data: { ready: true } });
  });

  it("serves Mock Prism Central inventory and simulated VM task endpoints", async () => {
    const health = await requestJson("/mock-prism/health");
    const clusters = await requestJson("/mock-prism/api/nutanix/v3/clusters/list", { method: "POST" });
    const images = await requestJson("/mock-prism/api/nutanix/v3/images/list", { method: "POST" });
    const subnets = await requestJson("/mock-prism/api/nutanix/v3/subnets/list", { method: "POST" });
    const vms = await requestJson("/mock-prism/api/nutanix/v3/vms/list", { method: "POST" });
    const create = await requestJson("/mock-prism/api/nutanix/v3/vms", {
      method: "POST",
      body: JSON.stringify({ spec: { name: "ndc-simulated-dev" } }),
    });
    const taskUuid = create.task_reference.uuid;
    const task = await requestJson(`/mock-prism/api/nutanix/v3/tasks/${taskUuid}`);

    expect(health.data).toMatchObject({
      service: "Mock Prism Central",
      status: "Healthy",
      mutationBoundary: "No real Nutanix infrastructure is contacted.",
    });
    expect(clusters.entities).toEqual(
      expect.arrayContaining([expect.objectContaining({ metadata: expect.objectContaining({ kind: "cluster" }) })])
    );
    expect(images.entities).toEqual(
      expect.arrayContaining([expect.objectContaining({ metadata: expect.objectContaining({ name: "Rocky Linux 9 Hardened" }) })])
    );
    expect(subnets.entities).toEqual(
      expect.arrayContaining([expect.objectContaining({ metadata: expect.objectContaining({ name: "dev-segment" }) })])
    );
    expect(vms.entities).toEqual(
      expect.arrayContaining([expect.objectContaining({ metadata: expect.objectContaining({ name: "payments-dev" }) })])
    );
    expect(create.status).toMatchObject({
      execution_context: "mock-prism",
      state: "ACCEPTED",
    });
    expect(task.status).toMatchObject({
      state: "SUCCEEDED",
      percentage_complete: 100,
    });
  });

  it("rejects invalid Mock Prism Central VM create payloads", async () => {
    const response = await nodeRequest("/mock-prism/api/nutanix/v3/vms", {
      method: "POST",
      body: "{",
    });

    expect(response.status).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: {
        code: "mock_prism_invalid_json",
        message: "Mock Prism Central request body must be valid JSON.",
      },
    });
  });

  it("lists templates and integrations", async () => {
    const templates = await requestJson("/api/templates");
    const integrations = await requestJson("/api/integrations");
    const session = await requestJson("/api/session");

    expect(templates.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: "spring-postgres" })]));
    expect(integrations.data).toEqual(expect.arrayContaining([expect.objectContaining({ name: "NCI" })]));
    expect(session.data).toMatchObject({ authMode: "Mock OIDC", roles: expect.arrayContaining(["Platform Admin"]) });
  });

  it("derives OIDC-style session context from trusted headers", async () => {
    const session = await requestJson("/api/session", {
      headers: {
        "x-ndc-user": "mira.chen",
        "x-ndc-display-name": "Mira Chen",
        "x-ndc-roles": "Developer,Approver",
        "x-ndc-issuer": "https://idp.example",
      },
    });

    expect(session.data).toMatchObject({
      user: "mira.chen",
      displayName: "Mira Chen",
      authMode: "OIDC",
      identityProvider: "https://idp.example",
      roles: ["Developer", "Approver"],
    });
  });

  it("reports session diagnostics and authorization matrix", async () => {
    const diagnostics = await requestJson("/api/session/diagnostics", {
      headers: {
        "x-ndc-user": "ops.admin",
        "x-ndc-display-name": "Ops Admin",
        "x-ndc-roles": "Platform Admin",
        "x-ndc-issuer": "https://idp.example",
      },
    });

    expect(diagnostics.data).toMatchObject({
      authMode: "OIDC",
      trustedHeaderMode: "Optional",
      missingRequiredHeaders: [],
      roles: ["Platform Admin"],
    });
    expect(diagnostics.data.authorizationMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "Manage providers, registry, preflight, lifecycle, and audit export",
          roles: ["Platform Admin"],
        }),
      ])
    );
  });

  it("reports production hardening foundation snapshots and denies non-admin roles", async () => {
    const adminHeaders = {
      "x-ndc-user": "ops.admin",
      "x-ndc-display-name": "Ops Admin",
      "x-ndc-roles": "Platform Admin",
      "x-ndc-issuer": "https://idp.example",
    };
    const developerHeaders = {
      "x-ndc-user": "dev.user",
      "x-ndc-display-name": "Dev User",
      "x-ndc-roles": "Developer",
      "x-ndc-issuer": "https://idp.example",
    };

    const contract = await requestJson("/api/contracts/openapi", { headers: adminHeaders });
    const rbac = await requestJson("/api/security/rbac-matrix", { headers: adminHeaders });
    const persistence = await requestJson("/api/storage/persistence-boundary", { headers: adminHeaders });
    const audit = await requestJson("/api/audit/integrity-manifest", { headers: adminHeaders });
    const profiles = await requestJson("/api/deployment/profiles", { headers: adminHeaders });
    const runbook = await requestJson("/api/operations/runbook-console", { headers: adminHeaders });

    expect(contract.data).toMatchObject({
      status: "Contract baseline ready",
      openApiVersion: "3.1.0",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(contract.data.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "/api/operations/runbook-console", requiredRoles: ["Platform Admin"] }),
      ])
    );
    expect(rbac.data).toMatchObject({
      status: "RBAC matrix enforced",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(rbac.data.negativeTestCases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorRole: "Developer", path: "/api/contracts/openapi", expectedStatus: 403 }),
      ])
    );
    expect(persistence.data).toMatchObject({
      repositoryMode: "memory",
      durable: false,
      provisioningEnabled: false,
    });
    expect(audit.data).toMatchObject({
      status: "Integrity manifest ready",
      digestAlgorithm: "sha256",
      provisioningEnabled: false,
    });
    expect(audit.data.manifestDigest).toHaveLength(64);
    expect(profiles.data).toMatchObject({
      status: "Profiles validated",
      activeProfile: "local",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(runbook.data).toMatchObject({
      status: "Blocked",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(runbook.data.runbookSteps).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Real adapter execution", state: "Blocked" })])
    );

    await expectJson(
      "/api/contracts/openapi",
      403,
      {
        error: {
          code: "forbidden",
          message: "The current session does not have permission for this action.",
        },
      },
      { headers: developerHeaders }
    );
  });

  it("reports durable on-prem operations foundation snapshots and keeps mutation disabled", async () => {
    const adminHeaders = {
      "x-ndc-user": "ops.admin",
      "x-ndc-display-name": "Ops Admin",
      "x-ndc-roles": "Platform Admin",
      "x-ndc-issuer": "https://idp.example",
    };
    const developerHeaders = {
      "x-ndc-user": "dev.user",
      "x-ndc-display-name": "Dev User",
      "x-ndc-roles": "Developer",
      "x-ndc-issuer": "https://idp.example",
    };

    const persistence = await requestJson("/api/onprem/durable-persistence", { headers: adminHeaders });
    const migrations = await requestJson("/api/onprem/migration-baseline", { headers: adminHeaders });
    const jwt = await requestJson("/api/auth/jwt-boundary", { headers: adminHeaders });
    const signed = await requestJson("/api/audit/signed-export-manifest", { headers: adminHeaders });
    const upgrade = await requestJson("/api/admin/upgrade-health", { headers: adminHeaders });
    const profiles = await requestJson("/api/onprem/install-profile-pack", { headers: adminHeaders });

    expect(persistence.data).toMatchObject({
      activeRepository: "memory",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(persistence.data.postgres).toMatchObject({
      contractImplemented: true,
      runtimeEnabled: false,
      driverInstalled: false,
    });
    expect(migrations.data).toMatchObject({
      status: "Migration baseline ready",
      schemaVersion: "7.5.0-on-prem-install-profile-pack",
      provisioningEnabled: false,
    });
    expect(migrations.data.migrations).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "002_schema_version.sql", destructive: false })])
    );
    expect(jwt.data).toMatchObject({
      trustedHeaderFallback: true,
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(signed.data).toMatchObject({
      signingKeyRef: "ndc-local-development-key-ref",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(signed.data.manifestDigest).toHaveLength(64);
    expect(upgrade.data).toMatchObject({
      repositoryMode: "memory",
      schemaVersion: "7.5.0-on-prem-install-profile-pack",
      provisioningEnabled: false,
    });
    expect(profiles.data.profiles).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "on-prem-postgres" })])
    );

    await expectJson(
      "/api/admin/upgrade-health",
      403,
      {
        error: {
          code: "forbidden",
          message: "The current session does not have permission for this action.",
        },
      },
      { headers: developerHeaders }
    );
  });

  it("fails closed for API routes when trusted identity headers are required", async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    process.env.NDC_REQUIRE_TRUSTED_IDENTITY = "true";
    server = createApiServer({ store: new MemoryStore() });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address.");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;

    await expectJson("/healthz", 200, { data: { ok: true } });
    await expectJson(
      "/api/session",
      401,
      {
        error: {
          code: "unauthenticated",
          message: "Trusted identity headers are required: x-ndc-user, x-ndc-roles, x-ndc-issuer.",
        },
      }
    );

    const session = await requestJson("/api/session", {
      headers: {
        "x-ndc-user": "ops.admin",
        "x-ndc-roles": "Platform Admin",
        "x-ndc-issuer": "https://idp.example",
      },
    });
    expect(session.data).toMatchObject({ user: "ops.admin", authMode: "OIDC" });
  });

  it("rejects malformed trusted identity headers when required", async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    process.env.NDC_REQUIRE_TRUSTED_IDENTITY = "true";
    server = createApiServer({ store: new MemoryStore() });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address.");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;

    await expectJson(
      "/api/session",
      403,
      {
        error: {
          code: "invalid_identity_header",
          message: "Trusted role header contains unsupported roles: Super User.",
        },
      },
      {
        headers: {
          "x-ndc-user": "ops.admin",
          "x-ndc-roles": "Platform Admin,Super User",
          "x-ndc-issuer": "https://idp.example",
        },
      }
    );
  });

  it("reports auth, observability, readiness, config, and live Prism design diagnostics", async () => {
    const auth = await requestJson("/api/auth/boundary-diagnostics");
    const runtime = await requestJson("/api/observability/runtime");
    const scorecard = await requestJson("/api/production/readiness-scorecard");
    const config = await requestJson("/api/deployment/config-validation");
    const design = await requestJson("/api/prism/live-read-only-design");

    expect(auth.data).toMatchObject({
      mode: "Optional",
      auditEventRecorded: true,
      roles: expect.arrayContaining(["Platform Admin"]),
    });
    expect(runtime.data).toMatchObject({
      storageMode: "memory",
      staticServing: false,
      guardrails: expect.arrayContaining([
        expect.objectContaining({ name: "Simulated provisioning enabled", passed: true }),
        expect.objectContaining({ name: "Real Prism calls disabled", passed: true }),
      ]),
    });
    expect(scorecard.data).toMatchObject({
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
      categories: expect.arrayContaining([expect.objectContaining({ name: "Security boundary" })]),
    });
    expect(config.data).toMatchObject({
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
      checks: expect.arrayContaining([expect.objectContaining({ name: "Real Prism adapter disabled", passed: true })]),
    });
    expect(design.data).toMatchObject({
      status: "Design only",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
      allowedEndpoints: expect.arrayContaining([expect.objectContaining({ operation: "listVms" })]),
    });
  });

  it("records controlled read-only lab pilot foundation evidence", async () => {
    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        name: "Read-only lab scope",
        pentestScopeReference: "readonly-lab-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        allowedActions: ["listClusters", "listProjects", "listImages", "listSubnets", "listCategories", "listVms"],
        excludedActions: [
          "create_vm",
          "clone_vm",
          "delete_vm",
          "power_on",
          "power_off",
          "update_network",
          "resize_disk",
          "attach_category",
          "create_project",
          "delete_image",
        ],
        evidenceReferences: ["readonly-lab-scope.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });
    const labGate = await requestJson("/api/prism/read-only-lab-gates", { method: "POST" });
    const profile = await requestJson("/api/prism/read-only-lab-profiles", {
      method: "POST",
      body: JSON.stringify({
        name: "Berlin read-only Prism profile",
        prismCentralEndpointRef: "prism-central-ref",
        credentialProfileRef: "nci-readonly",
        owner: "Cloud Operations",
      }),
    });
    const replay = await requestJson("/api/prism/fixture-replays", { method: "POST" });
    const authorization = await requestJson("/api/prism/read-only-authorization-gates", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        fixtureReplayId: replay.data.id,
        labGateId: labGate.data.id,
      }),
    });
    const evidence = await requestJson("/api/operator/evidence-exports", { method: "POST" });
    const workflow = await requestJson("/api/lab-pilot/runbook-workflows", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        authorizationGateId: authorization.data.id,
        evidenceExportId: evidence.data.id,
      }),
    });
    const approved = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/approve`, {
      method: "POST",
    });
    const dryRun = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/execute-dry-run`, {
      method: "POST",
    });
    const reviewed = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/review-evidence`, {
      method: "POST",
    });
    const closed = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/close`, {
      method: "POST",
    });

    expect(profile.data).toMatchObject({
      approvalState: "Approved",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(replay.data).toMatchObject({
      status: "Passed",
      source: "Bundled sanitized fixture",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(authorization.data).toMatchObject({
      status: "Ready for future live read-only review",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(evidence.data).toMatchObject({
      status: "Prepared",
      manifest: expect.objectContaining({ liveDesignStatus: "Design only" }),
      realPrismCallsEnabled: false,
    });
    expect(approved.data).toMatchObject({ phase: "Approved" });
    expect(dryRun.data).toMatchObject({ phase: "Dry-run executed" });
    expect(reviewed.data).toMatchObject({ phase: "Evidence reviewed" });
    expect(closed.data).toMatchObject({
      phase: "Closed",
      status: "Closed",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });

    const profiles = await requestJson("/api/prism/read-only-lab-profiles");
    const replays = await requestJson("/api/prism/fixture-replays");
    const authorizations = await requestJson("/api/prism/read-only-authorization-gates");
    const evidenceExports = await requestJson("/api/operator/evidence-exports");
    const workflows = await requestJson("/api/lab-pilot/runbook-workflows");
    const auditEvents = await requestJson("/api/audit-events");

    expect(profiles.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: profile.data.id })]));
    expect(replays.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: replay.data.id })]));
    expect(authorizations.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: authorization.data.id })]));
    expect(evidenceExports.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: evidence.data.id })]));
    expect(workflows.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: workflow.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "prism.readonly.lab-profile.recorded" }),
        expect.objectContaining({ action: "prism.fixture.replay.recorded" }),
        expect.objectContaining({ action: "prism.readonly.authorization-gate.recorded" }),
        expect.objectContaining({ action: "operator.evidence-export.prepared" }),
        expect.objectContaining({ action: "lab-pilot.runbook.close" }),
      ])
    );
  });

  it("records controlled read-only adapter pilot evidence through production decision gate", async () => {
    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        name: "Read-only adapter pilot scope",
        pentestScopeReference: "readonly-adapter-pilot-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        allowedActions: ["listClusters", "listProjects", "listImages", "listSubnets", "listCategories", "listVms"],
        excludedActions: [
          "create_vm",
          "clone_vm",
          "delete_vm",
          "power_on",
          "power_off",
          "update_network",
          "resize_disk",
          "attach_category",
          "create_project",
          "delete_image",
        ],
        evidenceReferences: ["readonly-adapter-pilot-scope.md", "operator-runbook.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });
    const labGate = await requestJson("/api/prism/read-only-lab-gates", { method: "POST" });
    const profile = await requestJson("/api/prism/read-only-lab-profiles", { method: "POST" });
    const replay = await requestJson("/api/prism/fixture-replays", { method: "POST" });
    const authorization = await requestJson("/api/prism/read-only-authorization-gates", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        fixtureReplayId: replay.data.id,
        labGateId: labGate.data.id,
      }),
    });
    const evidence = await requestJson("/api/operator/evidence-exports", { method: "POST" });
    let workflow = await requestJson("/api/lab-pilot/runbook-workflows", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        authorizationGateId: authorization.data.id,
        evidenceExportId: evidence.data.id,
      }),
    });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/approve`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/execute-dry-run`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/review-evidence`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/close`, { method: "POST" });
    const runtimeMode = await requestJson("/api/prism/read-only-runtime-modes", {
      method: "POST",
      body: JSON.stringify({
        mode: "authorized-read-only-lab",
        authorizationGateId: authorization.data.id,
        runbookWorkflowId: workflow.data.id,
        evidenceExportId: evidence.data.id,
      }),
    });
    const inventoryPilot = await requestJson("/api/prism/live-read-only-inventory-pilots", {
      method: "POST",
      body: JSON.stringify({
        runtimeModeRecordId: runtimeMode.data.id,
        authorizationGateId: authorization.data.id,
        runbookWorkflowId: workflow.data.id,
      }),
    });
    const observability = await requestJson("/api/prism/read-only-observability", {
      method: "POST",
      body: JSON.stringify({
        runtimeModeRecordId: runtimeMode.data.id,
        inventoryPilotId: inventoryPilot.data.id,
      }),
    });
    const consoleSnapshot = await requestJson("/api/lab-pilot/operator-console");
    const decisionGate = await requestJson("/api/production/readiness-decision-gates", {
      method: "POST",
      body: JSON.stringify({
        decision: "Go",
        approvers: ["platform.admin", "cloud.operations"],
        rollbackOwner: "Cloud Operations",
        supportContact: "platform-support@example.invalid",
        retentionPolicy: "Retain pilot evidence for 180 days",
      }),
    });
    const runtimeModes = await requestJson("/api/prism/read-only-runtime-modes");
    const inventoryPilots = await requestJson("/api/prism/live-read-only-inventory-pilots");
    const observabilityRecords = await requestJson("/api/prism/read-only-observability");
    const decisionGates = await requestJson("/api/production/readiness-decision-gates");
    const auditEvents = await requestJson("/api/audit-events");

    expect(runtimeMode.data).toMatchObject({
      requestedMode: "authorized-read-only-lab",
      activeMode: "authorized-read-only-lab",
      status: "Active",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(inventoryPilot.data).toMatchObject({
      status: "Completed",
      mode: "Authorized read-only lab pilot",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(inventoryPilot.data.inventorySummary).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "Image", count: 1 })])
    );
    expect(observability.data).toMatchObject({
      status: "Prepared",
      summary: expect.objectContaining({ latestStatus: "Healthy", blockedMutations: expect.any(Number) }),
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(consoleSnapshot.data).toMatchObject({
      status: "Ready for production decision",
      activeRuntimeMode: "authorized-read-only-lab",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(decisionGate.data).toMatchObject({
      decision: "Go",
      status: "Ready for CAB review",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(runtimeModes.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: runtimeMode.data.id })]));
    expect(inventoryPilots.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: inventoryPilot.data.id })]));
    expect(observabilityRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: observability.data.id })]));
    expect(decisionGates.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: decisionGate.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "prism.readonly.runtime-mode.selected" }),
        expect.objectContaining({ action: "prism.readonly.inventory-pilot.recorded" }),
        expect.objectContaining({ action: "prism.readonly.observability.prepared" }),
        expect.objectContaining({ action: "production.readiness-decision-gate.recorded" }),
      ])
    );
  });

  it("records real read-only adapter preparation evidence without live calls", async () => {
    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        name: "Real read-only adapter prep scope",
        pentestScopeReference: "readonly-adapter-prep-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        allowedActions: ["listClusters", "listProjects", "listImages", "listSubnets", "listCategories", "listVms"],
        excludedActions: [
          "create_vm",
          "clone_vm",
          "delete_vm",
          "power_on",
          "power_off",
          "update_network",
          "resize_disk",
          "attach_category",
          "create_project",
          "delete_image",
        ],
        evidenceReferences: ["readonly-adapter-prep-scope.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });
    const labGate = await requestJson("/api/prism/read-only-lab-gates", { method: "POST" });
    const profile = await requestJson("/api/prism/read-only-lab-profiles", { method: "POST" });
    const replay = await requestJson("/api/prism/fixture-replays", { method: "POST" });
    const authorization = await requestJson("/api/prism/read-only-authorization-gates", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        fixtureReplayId: replay.data.id,
        labGateId: labGate.data.id,
      }),
    });
    const evidence = await requestJson("/api/operator/evidence-exports", { method: "POST" });
    let workflow = await requestJson("/api/lab-pilot/runbook-workflows", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        authorizationGateId: authorization.data.id,
        evidenceExportId: evidence.data.id,
      }),
    });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/approve`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/execute-dry-run`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/review-evidence`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/close`, { method: "POST" });
    const runtimeMode = await requestJson("/api/prism/read-only-runtime-modes", {
      method: "POST",
      body: JSON.stringify({
        mode: "authorized-read-only-lab",
        authorizationGateId: authorization.data.id,
        runbookWorkflowId: workflow.data.id,
        evidenceExportId: evidence.data.id,
      }),
    });
    const inventoryPilot = await requestJson("/api/prism/live-read-only-inventory-pilots", {
      method: "POST",
      body: JSON.stringify({
        runtimeModeRecordId: runtimeMode.data.id,
        authorizationGateId: authorization.data.id,
        runbookWorkflowId: workflow.data.id,
      }),
    });
    await requestJson("/api/prism/read-only-observability", {
      method: "POST",
      body: JSON.stringify({
        runtimeModeRecordId: runtimeMode.data.id,
        inventoryPilotId: inventoryPilot.data.id,
      }),
    });
    const decisionGate = await requestJson("/api/production/readiness-decision-gates", {
      method: "POST",
      body: JSON.stringify({
        decision: "Go",
        approvers: ["platform.admin", "cloud.operations"],
      }),
    });
    const configBoundary = await requestJson("/api/prism/real-read-only/config-boundaries", {
      method: "POST",
      body: JSON.stringify({
        endpointRef: "prism-central-ref",
        credentialProviderRef: "vault-ref-nci-readonly",
        tlsValidationMode: "private-ca-ref",
        timeoutSeconds: 10,
        retry: { maxAttempts: 2, backoffMs: 500 },
        killSwitch: "Closed",
      }),
    });
    const credentialContract = await requestJson("/api/credentials/provider-contracts", {
      method: "POST",
      body: JSON.stringify({
        credentialProviderRef: "vault-ref-nci-readonly",
        provider: "MockVault",
      }),
    });
    const adapterInterface = await requestJson("/api/prism/real-read-only/adapter-interfaces", {
      method: "POST",
      body: JSON.stringify({
        configBoundaryId: configBoundary.data.id,
        credentialContractId: credentialContract.data.id,
      }),
    });
    const replaySuite = await requestJson("/api/prism/offline-contract-replays", {
      method: "POST",
      body: JSON.stringify({
        adapterInterfaceId: adapterInterface.data.id,
        fixtureReplayId: replay.data.id,
      }),
    });
    const dryRun = await requestJson("/api/prism/authorized-lab-dry-runs", {
      method: "POST",
      body: JSON.stringify({
        configBoundaryId: configBoundary.data.id,
        credentialContractId: credentialContract.data.id,
        adapterInterfaceId: adapterInterface.data.id,
        offlineReplaySuiteId: replaySuite.data.id,
        productionDecisionGateId: decisionGate.data.id,
      }),
    });
    const configBoundaries = await requestJson("/api/prism/real-read-only/config-boundaries");
    const credentialContracts = await requestJson("/api/credentials/provider-contracts");
    const adapterInterfaces = await requestJson("/api/prism/real-read-only/adapter-interfaces");
    const replaySuites = await requestJson("/api/prism/offline-contract-replays");
    const dryRuns = await requestJson("/api/prism/authorized-lab-dry-runs");
    const auditEvents = await requestJson("/api/audit-events");

    expect(configBoundary.data).toMatchObject({
      status: "Ready for credential contract",
      tlsValidationMode: "private-ca-ref",
      killSwitch: "Closed",
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(credentialContract.data).toMatchObject({
      resolverStatus: "Validated reference",
      resolvedSecretAvailable: false,
      networkCallEnabled: false,
    });
    expect(adapterInterface.data).toMatchObject({
      status: "Interface ready; execution disabled",
      adapter: "PrismCentralReadOnlyAdapter",
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(replaySuite.data).toMatchObject({
      status: "Passed",
      provisioningEnabled: false,
      networkCallEnabled: false,
    });
    expect(replaySuite.data.coverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "Cluster", operation: "listClusters", expectedCount: 1, normalizedCount: 1, passed: true }),
        expect.objectContaining({ kind: "Project", operation: "listProjects", expectedCount: 1, normalizedCount: 1, passed: true }),
        expect.objectContaining({ kind: "Image", operation: "listImages", expectedCount: 1, normalizedCount: 1, passed: true }),
        expect.objectContaining({ kind: "Network", operation: "listSubnets", expectedCount: 1, normalizedCount: 1, passed: true }),
        expect.objectContaining({ kind: "Category", operation: "listCategories", expectedCount: 1, normalizedCount: 1, passed: true }),
        expect.objectContaining({ kind: "VM", operation: "listVms", expectedCount: 1, normalizedCount: 1, passed: true }),
      ])
    );
    expect(dryRun.data).toMatchObject({
      status: "Ready for authorized lab connection review",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(configBoundaries.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: configBoundary.data.id })]));
    expect(credentialContracts.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: credentialContract.data.id })]));
    expect(adapterInterfaces.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: adapterInterface.data.id })]));
    expect(replaySuites.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: replaySuite.data.id })]));
    expect(dryRuns.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: dryRun.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "prism.real-readonly.config-boundary.recorded" }),
        expect.objectContaining({ action: "credential.provider-contract.recorded" }),
        expect.objectContaining({ action: "prism.real-readonly.adapter-interface.recorded" }),
        expect.objectContaining({ action: "prism.offline-contract-replay.recorded" }),
        expect.objectContaining({ action: "prism.authorized-lab-dry-run.recorded" }),
      ])
    );
  });

  it("records controlled read-only lab enablement gates, production pilot controls, and mock-to-lab transition without live calls", async () => {
    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "prism-central-ref",
        credentialProfile: "nci-lab-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        name: "Controlled read-only enablement scope",
        pentestScopeReference: "readonly-enable-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        allowedActions: ["listClusters", "listProjects", "listImages", "listSubnets", "listCategories", "listVms"],
        excludedActions: [
          "create_vm",
          "clone_vm",
          "delete_vm",
          "power_on",
          "power_off",
          "update_network",
          "resize_disk",
          "attach_category",
          "create_project",
          "delete_image",
        ],
        evidenceReferences: ["readonly-enable-scope.md", "rollback-runbook.md"],
      }),
    });
    const labGate = await requestJson("/api/prism/read-only-lab-gates", { method: "POST" });
    const profile = await requestJson("/api/prism/read-only-lab-profiles", {
      method: "POST",
      body: JSON.stringify({
        name: "Prism Central read-only lab profile",
        prismCentralEndpointRef: "prism-central-ref",
        credentialProfileRef: "nci-lab-readonly",
        allowedProviderScope: {
          projects: ["developer-cloud-lab"],
          clusters: ["berlin-ahv-lab"],
          networks: ["dev-segment"],
          categories: ["env:lab", "owner:platform"],
        },
        approvalState: "Approved",
      }),
    });
    const fixture = await requestJson("/api/prism/fixture-replays", { method: "POST" });
    const authorization = await requestJson("/api/prism/read-only-authorization-gates", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        fixtureReplayId: fixture.data.id,
        labGateId: labGate.data.id,
      }),
    });
    const evidence = await requestJson("/api/operator/evidence-exports", { method: "POST" });
    let workflow = await requestJson("/api/lab-pilot/runbook-workflows", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        authorizationGateId: authorization.data.id,
        evidenceExportId: evidence.data.id,
      }),
    });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/approve`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/execute-dry-run`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/review-evidence`, { method: "POST" });
    workflow = await requestJson(`/api/lab-pilot/runbook-workflows/${workflow.data.id}/close`, { method: "POST" });
    const runtimeMode = await requestJson("/api/prism/read-only-runtime-modes", {
      method: "POST",
      body: JSON.stringify({
        mode: "authorized-read-only-lab",
        authorizationGateId: authorization.data.id,
        runbookWorkflowId: workflow.data.id,
        evidenceExportId: evidence.data.id,
      }),
    });
    const pilot = await requestJson("/api/prism/live-read-only-inventory-pilots", {
      method: "POST",
      body: JSON.stringify({
        runtimeModeRecordId: runtimeMode.data.id,
        authorizationGateId: authorization.data.id,
        runbookWorkflowId: workflow.data.id,
      }),
    });
    await requestJson("/api/prism/read-only-observability", {
      method: "POST",
      body: JSON.stringify({
        runtimeModeRecordId: runtimeMode.data.id,
        inventoryPilotId: pilot.data.id,
      }),
    });
    const decisionGate = await requestJson("/api/production/readiness-decision-gates", {
      method: "POST",
      body: JSON.stringify({ decision: "Go", approvers: ["platform.admin", "cloud.operations"] }),
    });
    const configBoundary = await requestJson("/api/prism/real-read-only/config-boundaries", {
      method: "POST",
      body: JSON.stringify({
        endpointRef: "prism-central-ref",
        credentialProviderRef: "vault-ref-nci-readonly",
        caCertificateRef: "platform-ca-bundle-ref",
        tlsValidationMode: "private-ca-ref",
        timeoutSeconds: 10,
        retry: { maxAttempts: 2, backoffMs: 500 },
        killSwitch: "Closed",
      }),
    });
    const credentialContract = await requestJson("/api/credentials/provider-contracts", {
      method: "POST",
      body: JSON.stringify({ credentialProviderRef: "vault-ref-nci-readonly", provider: "MockVault" }),
    });
    const adapterInterface = await requestJson("/api/prism/real-read-only/adapter-interfaces", {
      method: "POST",
      body: JSON.stringify({
        configBoundaryId: configBoundary.data.id,
        credentialContractId: credentialContract.data.id,
      }),
    });
    const replaySuite = await requestJson("/api/prism/offline-contract-replays", {
      method: "POST",
      body: JSON.stringify({
        adapterInterfaceId: adapterInterface.data.id,
        fixtureReplayId: fixture.data.id,
      }),
    });
    const dryRun = await requestJson("/api/prism/authorized-lab-dry-runs", {
      method: "POST",
      body: JSON.stringify({
        configBoundaryId: configBoundary.data.id,
        credentialContractId: credentialContract.data.id,
        adapterInterfaceId: adapterInterface.data.id,
        offlineReplaySuiteId: replaySuite.data.id,
        productionDecisionGateId: decisionGate.data.id,
      }),
    });
    const hardenedProfile = await requestJson("/api/prism/read-only-lab-profile-hardening", {
      method: "POST",
      body: JSON.stringify({
        profileId: profile.data.id,
        caCertificateRef: "platform-ca-bundle-ref",
      }),
    });
    const resolverStub = await requestJson("/api/credentials/resolver-stubs", {
      method: "POST",
      body: JSON.stringify({
        credentialContractId: credentialContract.data.id,
        provider: "MockVault",
      }),
    });
    const httpClient = await requestJson("/api/prism/read-only-http-clients", {
      method: "POST",
      body: JSON.stringify({
        adapterInterfaceId: adapterInterface.data.id,
        configBoundaryId: configBoundary.data.id,
        credentialResolverStubId: resolverStub.data.id,
      }),
    });
    const preflight = await requestJson("/api/prism/lab-connectivity-preflights", {
      method: "POST",
      body: JSON.stringify({
        hardenedProfileReviewId: hardenedProfile.data.id,
        configBoundaryId: configBoundary.data.id,
        credentialResolverStubId: resolverStub.data.id,
        httpClientRecordId: httpClient.data.id,
      }),
    });
    const pilotGate = await requestJson("/api/prism/authorized-read-only-pilot-gates", {
      method: "POST",
      body: JSON.stringify({
        preflightId: preflight.data.id,
        dryRunId: dryRun.data.id,
        productionDecisionGateId: decisionGate.data.id,
        requiredApprovers: ["platform.admin", "cloud.operations"],
        operatorAcknowledgements: ["read-only-only", "no-inventory-import", "emergency-stop-ready"],
      }),
    });
    const runtimePolicy = await requestJson("/api/prism/read-only-runtime-policies", {
      method: "POST",
      body: JSON.stringify({
        pilotGateId: pilotGate.data.id,
        requiredApprovals: ["platform-owner", "security-reviewer", "operations-owner"],
        allowedEnvironments: ["readonly-lab"],
        emergencyStopOwner: "Cloud Operations",
        emergencyStopContact: "cloud-operations-oncall",
        emergencyStopProcedureRef: "rollback-pack.md",
        emergencyStopTested: true,
      }),
    });
    const pilotSession = await requestJson("/api/prism/read-only-pilot-sessions", {
      method: "POST",
      body: JSON.stringify({
        policyId: runtimePolicy.data.id,
        approvedGateId: pilotGate.data.id,
        operator: "Cloud Operations Pilot Operator",
        evidenceLinks: ["pilot-session-approval.md", "operator-roster.md", "readonly-lab-window.md"],
      }),
    });
    const callEnvelope = await requestJson("/api/prism/live-read-only-call-envelopes", {
      method: "POST",
      body: JSON.stringify({
        pilotSessionId: pilotSession.data.id,
        httpClientRecordId: httpClient.data.id,
      }),
    });
    const evidenceReview = await requestJson("/api/prism/pilot-evidence-reviews", {
      method: "POST",
      body: JSON.stringify({
        callEnvelopeId: callEnvelope.data.id,
        pilotSessionId: pilotSession.data.id,
        reviewer: "Security Reviewer",
        decision: "Approve",
      }),
    });
    const rollbackDrill = await requestJson("/api/prism/emergency-stop-rollback-drills", {
      method: "POST",
      body: JSON.stringify({
        pilotEvidenceReviewId: evidenceReview.data.id,
        policyId: runtimePolicy.data.id,
        simulatedModeRestored: true,
        evidencePreserved: true,
        emergencyStopOwner: "Cloud Operations",
      }),
    });
    const labWorkspace = await requestJson("/api/lab-transition/readiness-workspaces", {
      method: "POST",
      body: JSON.stringify({
        emergencyStopRollbackDrillId: rollbackDrill.data.id,
        evidenceReviewId: evidenceReview.data.id,
        pilotSessionId: pilotSession.data.id,
        runtimePolicyId: runtimePolicy.data.id,
      }),
    });
    const mockExpansion = await requestJson("/api/lab-transition/mock-prism-endpoint-expansions", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: labWorkspace.data.id,
        latencySimulationMs: 150,
        requestsPerMinute: 120,
      }),
    });
    const contractHarness = await requestJson("/api/lab-transition/adapter-contract-harnesses", {
      method: "POST",
      body: JSON.stringify({ mockExpansionId: mockExpansion.data.id }),
    });
    const dryRunConsole = await requestJson("/api/lab-transition/dry-run-consoles", {
      method: "POST",
      body: JSON.stringify({
        contractHarnessId: contractHarness.data.id,
        selectedEndpointRef: "prism-central-ref",
        credentialProviderRef: "vault-ref-nci-readonly",
      }),
    });
    const exportPackV2 = await requestJson("/api/lab-transition/evidence-export-packs-v2", {
      method: "POST",
      body: JSON.stringify({ dryRunConsoleId: dryRunConsole.data.id }),
    });
    const realLabPacket = await requestJson("/api/lab-transition/real-lab-authorization-packets", {
      method: "POST",
      body: JSON.stringify({
        evidenceExportPackId: exportPackV2.data.id,
        approvalOwners: ["platform-owner", "security-reviewer", "lab-owner", "operations-owner"],
        rollbackOwner: "Cloud Operations",
        pentestScopeEvidence: ["readonly-lab-pentest-scope.md", "mock-to-lab-boundary-review.md"],
      }),
    });
    const hardeningRecords = await requestJson("/api/prism/read-only-lab-profile-hardening");
    const resolverRecords = await requestJson("/api/credentials/resolver-stubs");
    const clientRecords = await requestJson("/api/prism/read-only-http-clients");
    const preflightRecords = await requestJson("/api/prism/lab-connectivity-preflights");
    const pilotGateRecords = await requestJson("/api/prism/authorized-read-only-pilot-gates");
    const runtimePolicyRecords = await requestJson("/api/prism/read-only-runtime-policies");
    const pilotSessionRecords = await requestJson("/api/prism/read-only-pilot-sessions");
    const callEnvelopeRecords = await requestJson("/api/prism/live-read-only-call-envelopes");
    const evidenceReviewRecords = await requestJson("/api/prism/pilot-evidence-reviews");
    const rollbackDrillRecords = await requestJson("/api/prism/emergency-stop-rollback-drills");
    const labWorkspaceRecords = await requestJson("/api/lab-transition/readiness-workspaces");
    const mockExpansionRecords = await requestJson("/api/lab-transition/mock-prism-endpoint-expansions");
    const contractHarnessRecords = await requestJson("/api/lab-transition/adapter-contract-harnesses");
    const dryRunConsoleRecords = await requestJson("/api/lab-transition/dry-run-consoles");
    const exportPackV2Records = await requestJson("/api/lab-transition/evidence-export-packs-v2");
    const realLabPacketRecords = await requestJson("/api/lab-transition/real-lab-authorization-packets");
    const auditEvents = await requestJson("/api/audit-events");

    expect(hardenedProfile.data).toMatchObject({
      status: "Hardened",
      endpointRef: "prism-central-ref",
      caCertificateRef: "platform-ca-bundle-ref",
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(resolverStub.data).toMatchObject({
      status: "Stub ready; resolver disabled",
      resolvedSecretAvailable: false,
      networkCallEnabled: false,
    });
    expect(httpClient.data).toMatchObject({
      status: "Client shape ready; execution disabled",
      requiredRuntimeFlag: "NDC_PRISM_READONLY_HTTP_ENABLED",
      authorizationGateRequired: true,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(httpClient.data.requestShape).toEqual(
      expect.arrayContaining([expect.objectContaining({ operation: "listVms", path: "/api/nutanix/v3/vms/list" })])
    );
    expect(preflight.data).toMatchObject({
      status: "Ready for operator pilot gate",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(pilotGate.data).toMatchObject({
      status: "Ready for future live read-only pilot",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(runtimePolicy.data).toMatchObject({
      status: "Policy ready for pilot session",
      runtimeFlag: "NDC_PRISM_READONLY_HTTP_ENABLED",
      rollbackMode: "simulated",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(pilotSession.data).toMatchObject({
      status: "Session window ready",
      runtimeMode: "authorized-read-only-lab",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(callEnvelope.data).toMatchObject({
      status: "Envelope ready; execution disabled",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(callEnvelope.data.operationEnvelopes).toHaveLength(6);
    expect(callEnvelope.data.operationEnvelopes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operation: "listVms",
          method: "POST",
          path: "/api/nutanix/v3/vms/list",
          executionEnabled: false,
        }),
      ])
    );
    expect(callEnvelope.data.operationEnvelopes.every((item: { executionEnabled: boolean }) => item.executionEnabled === false)).toBe(true);
    expect(evidenceReview.data).toMatchObject({
      status: "Approved for rollback drill",
      decision: "Approve",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(rollbackDrill.data).toMatchObject({
      status: "Drill passed",
      rollbackMode: "simulated",
      simulatedModeRestored: true,
      evidencePreserved: true,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(labWorkspace.data).toMatchObject({
      status: "Ready for mock-to-lab review",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(mockExpansion.data).toMatchObject({
      status: "Expanded simulator contract ready",
      authHeaderMode: "mock-required",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(mockExpansion.data.supportedEndpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: "POST", path: "/mock-prism/api/nutanix/v3/vms/list" }),
      ])
    );
    expect(contractHarness.data).toMatchObject({
      status: "Contract harness passed",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(dryRunConsole.data).toMatchObject({
      status: "Dry-run console ready",
      selectedEndpointRef: "prism-central-ref",
      credentialProviderRef: "vault-ref-nci-readonly",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(dryRunConsole.data.allowedOperations).toHaveLength(6);
    expect(exportPackV2.data).toMatchObject({
      status: "Export pack ready",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(exportPackV2.data.manifest).toEqual(
      expect.arrayContaining([expect.objectContaining({ section: "contract-harness", redacted: true })])
    );
    expect(realLabPacket.data).toMatchObject({
      status: "Ready to request real lab access",
      rollbackOwner: "Cloud Operations",
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    expect(hardeningRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: hardenedProfile.data.id })]));
    expect(resolverRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: resolverStub.data.id })]));
    expect(clientRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: httpClient.data.id })]));
    expect(preflightRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: preflight.data.id })]));
    expect(pilotGateRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: pilotGate.data.id })]));
    expect(runtimePolicyRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: runtimePolicy.data.id })]));
    expect(pilotSessionRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: pilotSession.data.id })]));
    expect(callEnvelopeRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: callEnvelope.data.id })]));
    expect(evidenceReviewRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: evidenceReview.data.id })]));
    expect(rollbackDrillRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: rollbackDrill.data.id })]));
    expect(labWorkspaceRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: labWorkspace.data.id })]));
    expect(mockExpansionRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: mockExpansion.data.id })]));
    expect(contractHarnessRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: contractHarness.data.id })]));
    expect(dryRunConsoleRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: dryRunConsole.data.id })]));
    expect(exportPackV2Records.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: exportPackV2.data.id })]));
    expect(realLabPacketRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: realLabPacket.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "prism.readonly.lab-profile-hardening.recorded" }),
        expect.objectContaining({ action: "credential.resolver-stub.recorded" }),
        expect.objectContaining({ action: "prism.readonly.http-client.recorded" }),
        expect.objectContaining({ action: "prism.lab-connectivity-preflight.recorded" }),
        expect.objectContaining({ action: "prism.authorized-readonly-pilot-gate.recorded" }),
        expect.objectContaining({ action: "prism.readonly.runtime-policy.recorded" }),
        expect.objectContaining({ action: "prism.readonly.pilot-session.recorded" }),
        expect.objectContaining({ action: "prism.readonly.call-envelope.recorded" }),
        expect.objectContaining({ action: "prism.readonly.evidence-review.recorded" }),
        expect.objectContaining({ action: "prism.readonly.rollback-drill.recorded" }),
        expect.objectContaining({ action: "lab-transition.readiness-workspace.recorded" }),
        expect.objectContaining({ action: "lab-transition.mock-prism-expansion.recorded" }),
        expect.objectContaining({ action: "lab-transition.adapter-contract-harness.recorded" }),
        expect.objectContaining({ action: "lab-transition.dry-run-console.recorded" }),
        expect.objectContaining({ action: "lab-transition.evidence-export-pack-v2.recorded" }),
        expect.objectContaining({ action: "lab-transition.real-lab-authorization-packet.recorded" }),
      ])
    );
  });

  it("blocks fixture replay records that contain unsanitized endpoint data", async () => {
    const replay = await requestJson("/api/prism/fixture-replays", {
      method: "POST",
      body: JSON.stringify({
        fixtureName: "unsafe-upload",
        source: "Uploaded sanitized fixture",
        records: [
          {
            kind: "Cluster",
            name: "https://private-prism.example",
            rawRef: "cluster-secret",
            categories: ["env:lab"],
          },
        ],
      }),
    });

    expect(replay.data).toMatchObject({
      status: "Blocked",
      realPrismCallsEnabled: false,
    });
    expect(replay.data.checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Fixture is sanitized", passed: false })])
    );
  });

  it("applies security headers and rate limits requests", async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    server = createApiServer({ store: new MemoryStore(), rateLimiter: new MemoryRateLimiter(1, 60_000) });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address.");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;

    const first = await nodeRequest("/api/session");
    const second = await nodeRequest("/api/session");

    expect(first.headers["x-content-type-options"]).toBe("nosniff");
    expect(first.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(second.status).toBe(429);
    expect(JSON.parse(second.body)).toMatchObject({ error: { code: "rate_limited" } });
  });

  it("enforces RBAC on admin actions", async () => {
    await expectJson(
      "/api/integration-config/NCI",
      403,
      {
        error: {
          code: "forbidden",
          message: "The current session does not have permission for this action.",
        },
      },
      {
        method: "PUT",
        headers: { "x-ndc-user": "demo.dev", "x-ndc-roles": "Developer" },
        body: JSON.stringify({
          endpoint: "https://prism.lab.example",
          credentialProfile: "nci-readonly",
        }),
      }
    );
  });

  it("applies audit retention to persisted state", () => {
    const state = createDefaultState();
    state.auditEvents = Array.from({ length: 550 }, (_, index) => ({
      id: `audit-${index}`,
      action: "test",
      actor: "tester",
      target: "retention",
      createdAt: new Date().toISOString(),
    }));

    expect(applyRetention(state).auditEvents).toHaveLength(500);
  });

  it("updates integration config and runs readiness checks", async () => {
    const saved = await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    const checked = await requestJson("/api/integrations/NCI/check", { method: "POST" });
    const configs = await requestJson("/api/integration-config");
    const credentialDiagnostics = await requestJson("/api/provider-credentials/diagnostics");

    expect(saved.data).toMatchObject({
      name: "NCI",
      endpoint: "https://prism.lab.example",
      credentialProfile: "nci-readonly",
      status: "Configured",
    });
    expect(checked.data).toMatchObject({ name: "NCI", status: "Reachable" });
    expect(configs.data).toEqual(expect.arrayContaining([expect.objectContaining({ name: "NCI", status: "Reachable" })]));
    expect(credentialDiagnostics.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider: "NCI",
          credentialProfile: "nci-readonly",
          status: "Approved reference",
        }),
      ])
    );
  });

  it("rejects inline credential material in provider configuration", async () => {
    await expectJson(
      "/api/integration-config/NCI",
      400,
      {
        error: {
          code: "credential_reference_invalid",
          message: "Credential profile must be a reference name, not inline access material.",
        },
      },
      {
        method: "PUT",
        body: JSON.stringify({
          endpoint: "https://prism.lab.example",
          credentialProfile: "https://inline.example",
        }),
      }
    );
  });

  it("reports system status and simulates read-only lab discovery", async () => {
    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });

    const discovered = await requestJson("/api/lab-adapters/NCI/discover", { method: "POST" });
    const status = await requestJson("/api/system/status");

    expect(discovered.data).toMatchObject({
      name: "NCI",
      mode: "Read-only candidate",
      provisioningEnabled: false,
      inventoryCount: 12,
    });
    expect(status.data).toMatchObject({
      api: "Healthy",
      storage: "Ready",
      provisioningEnabled: true,
      integrations: expect.objectContaining({ readOnlyCandidates: 1 }),
    });
  });

  it("imports Prism read-only inventory and maps image profile candidates", async () => {
    await expectJson(
      "/api/prism/inventory/import",
      409,
      {
        error: {
          code: "prism_inventory_not_ready",
          message: "Prism inventory import requires a reachable NCI integration configuration.",
        },
      },
      { method: "POST" }
    );

    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });

    const imported = await requestJson("/api/prism/inventory/import", { method: "POST" });
    const inventory = await requestJson("/api/prism/inventory");
    const profiles = await requestJson("/api/resource-profiles");
    const auditEvents = await requestJson("/api/audit-events");

    expect(imported.data).toMatchObject({
      adapter: "NCI",
      mode: "Mock read-only",
      readOnly: true,
      provisioningEnabled: false,
      recordsImported: 8,
      profileCandidates: 2,
    });
    expect(imported.data.mutationOperationsBlocked).toEqual(expect.arrayContaining(["create_vm", "delete_vm"]));
    expect(inventory.data.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "Image", name: "Rocky Linux 9 Hardened", profileCandidate: true }),
      ])
    );
    expect(profiles.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "prism-pc-image-ubuntu-2404-lts",
          kind: "AHV Image",
          status: "Draft",
        }),
      ])
    );
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "prism.inventory.imported", target: "NCI" })])
    );
  });

  it("exposes a disabled read-only Prism adapter scaffold and lab gate", async () => {
    const blockedDiagnostics = await requestJson("/api/prism/read-only-adapter/diagnostics");
    const blockedGate = await requestJson("/api/prism/read-only-lab-gates", { method: "POST" });

    expect(blockedDiagnostics.data).toMatchObject({
      adapter: "DisabledReadOnlyPrismAdapter",
      mode: "Fixture-only request scaffold",
      networkCallEnabled: false,
      provisioningEnabled: false,
      supportedOperations: ["listClusters", "listProjects", "listImages", "listSubnets", "listCategories", "listVms"],
    });
    expect(blockedDiagnostics.data.requestPlans).toEqual(
      expect.arrayContaining([expect.objectContaining({ operation: "listClusters", networkCallEnabled: false })])
    );
    expect(blockedGate.data).toMatchObject({
      status: "Blocked",
      provisioningEnabled: false,
      networkCallEnabled: false,
    });

    await requestJson("/api/integration-config/NCI", {
      method: "PUT",
      body: JSON.stringify({
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-readonly",
      }),
    });
    await requestJson("/api/integrations/NCI/check", { method: "POST" });
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        name: "Prism read-only lab gate",
        pentestScopeReference: "readonly-prism-lab-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        allowedActions: ["listClusters", "listProjects", "listImages", "listSubnets", "listCategories", "listVms"],
        excludedActions: [
          "create_vm",
          "clone_vm",
          "delete_vm",
          "power_on",
          "power_off",
          "update_network",
          "resize_disk",
          "attach_category",
          "create_project",
          "delete_image",
        ],
        evidenceReferences: ["readonly-prism-lab-scope.md", "operator-runbook.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });

    const readyGate = await requestJson("/api/prism/read-only-lab-gates", { method: "POST" });
    const gates = await requestJson("/api/prism/read-only-lab-gates");
    const diagnostics = await requestJson("/api/prism/read-only-adapter/diagnostics");
    const auditEvents = await requestJson("/api/audit-events");

    expect(readyGate.data).toMatchObject({
      status: "Ready for fixture contract validation",
      allowedOperations: ["listClusters", "listProjects", "listImages", "listSubnets", "listCategories", "listVms"],
      provisioningEnabled: false,
      networkCallEnabled: false,
    });
    expect(readyGate.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Read-only operations allowed", passed: true }),
        expect.objectContaining({ name: "Mutation operations excluded", passed: true }),
      ])
    );
    expect(gates.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: readyGate.data.id })]));
    expect(diagnostics.data).toMatchObject({
      endpointConfigured: true,
      credentialReferenceConfigured: true,
      networkCallEnabled: false,
    });
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "prism.readonly.lab-gate.recorded", target: "NCI" })])
    );
  });

  it("lists provider inventory, platform config, and provisioning adapters", async () => {
    const profiles = await requestJson("/api/resource-profiles");
    const config = await requestJson("/api/platform/config");
    const adapters = await requestJson("/api/provisioning/adapters");

    expect(profiles.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "ahv-rocky-9-hardened", kind: "AHV Image", provider: "NCI" }),
      ])
    );
    expect(config.data).toMatchObject({
      defaultProject: "developer-cloud-lab",
      provisioningEnabled: true,
    });
    expect(adapters.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "NCI",
          capabilities: expect.arrayContaining(["validateRequest", "plan", "destroy"]),
          provisioningEnabled: false,
        }),
      ])
    );
  });

  it("governs template registry and resource profile lifecycle", async () => {
    const registry = await requestJson("/api/registry/templates");
    const bundles = await requestJson("/api/policy-bundles");
    const submittedTemplate = await requestJson("/api/registry/templates/regulated-db/submit", { method: "POST" });
    const approvedTemplate = await requestJson("/api/registry/templates/regulated-db/approve", { method: "POST" });
    const submittedProfile = await requestJson("/api/resource-profiles/nus-object-dev/submit", { method: "POST" });
    const approvedProfile = await requestJson("/api/resource-profiles/nus-object-dev/approve", { method: "POST" });
    const auditEvents = await requestJson("/api/audit-events");

    expect(registry.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ templateId: "regulated-db", status: "Draft" }),
      ])
    );
    expect(bundles.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "regulated-audit", controls: expect.arrayContaining(["Audit export"]) }),
      ])
    );
    expect(submittedTemplate.data).toMatchObject({ templateId: "regulated-db", status: "Pending approval" });
    expect(approvedTemplate.data).toMatchObject({ templateId: "regulated-db", status: "Published" });
    expect(submittedProfile.data).toMatchObject({ id: "nus-object-dev", status: "Pending approval" });
    expect(approvedProfile.data).toMatchObject({ id: "nus-object-dev", status: "Published" });
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "registry.profile.approve", target: "nus-object-dev" }),
        expect.objectContaining({ action: "registry.template.approve", target: "regulated-db" }),
      ])
    );
  });

  it("creates an environment request and records jobs and audit events", async () => {
    const created = await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "api-created-dev",
        templateId: "vm-app",
        owner: "demo.user",
        region: "Berlin Lab",
        targets: ["VM"],
      }),
    });

    expect(created.data.environment).toMatchObject({
      name: "api-created-dev",
      status: "Provisioning",
    });
    expect(created.data.jobs.length).toBeGreaterThan(0);
    expect(created.data.mockPrismExecution).toMatchObject({
      environmentName: "api-created-dev",
      provider: "NCI",
      adapterMode: "Mock Prism Central",
      provisioningEnabled: false,
      task: expect.objectContaining({
        state: "SUCCEEDED",
        percentageComplete: 100,
      }),
    });

    const environments = await requestJson("/api/environments");
    const auditEvents = await requestJson("/api/audit-events");
    const controlPlaneJobs = await requestJson("/api/control-plane/jobs");
    const mockPrismStatus = await requestJson("/api/mock-prism/status");
    const mockPrismExecutions = await requestJson("/api/mock-prism/executions");
    const adapterDiagnostics = await requestJson("/api/prism/adapter-diagnostics");
    const simulatorProfiles = await requestJson("/api/prism/simulator-profiles");
    const failureScenarios = await requestJson("/api/prism/failure-scenarios");
    const detail = await requestJson("/api/environments/api-created-dev");

    expect(environments.data[0]).toMatchObject({ name: "api-created-dev" });
    expect(auditEvents.data[0]).toMatchObject({
      action: "environment.requested",
      metadata: expect.objectContaining({
        mockPrismTaskUuid: created.data.mockPrismExecution.task.uuid,
        provisioningEnabled: false,
      }),
    });
    expect(controlPlaneJobs.data[0]).toMatchObject({
      environmentName: "api-created-dev",
      state: "Queued",
      provisioningEnabled: false,
    });
    expect(controlPlaneJobs.data[0].transitions).toEqual(
      expect.arrayContaining([expect.objectContaining({ actor: "mock-prism" })])
    );
    expect(mockPrismStatus.data).toMatchObject({
      service: "Mock Prism Central",
      status: "Healthy",
      mutationBoundary: "No real Nutanix infrastructure is contacted.",
    });
    expect(mockPrismExecutions.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ environmentName: "api-created-dev" })])
    );
    expect(adapterDiagnostics.data).toMatchObject({
      activeMode: "mock-prism",
      activeAdapter: "MockPrismAdapter",
      provisioningEnabled: false,
      readinessChecks: expect.arrayContaining([expect.objectContaining({ name: "Simulator profiles" })]),
      operatorActions: expect.arrayContaining([expect.objectContaining({ label: "Run real Prism preflight" })]),
      realAdapterBoundary: expect.stringContaining("DisabledRealPrismAdapter"),
      lastMockTask: expect.objectContaining({
        environmentName: "api-created-dev",
        taskUuid: created.data.mockPrismExecution.task.uuid,
      }),
    });
    expect(adapterDiagnostics.data.blockedReasons).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "real_adapter_disabled" })])
    );
    expect(detail.data.mockPrismExecutions).toEqual(
      expect.arrayContaining([expect.objectContaining({ environmentName: "api-created-dev" })])
    );
    expect(simulatorProfiles.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "Image", selected: true })])
    );
    expect(failureScenarios.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "none", active: true })])
    );
  });

  it("selects simulator profiles, records failure scenarios, and blocks real Prism preflight", async () => {
    const selectedImage = await requestJson("/api/prism/simulator-profiles/sim-image-ubuntu-2404/select", {
      method: "POST",
    });
    const activatedFailure = await requestJson("/api/prism/failure-scenarios/task-failed/activate", {
      method: "POST",
    });
    const failedCreate = await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "api-failure-scenario-dev",
        templateId: "vm-app",
        owner: "demo.user",
        region: "Berlin Lab",
        targets: ["VM"],
      }),
    });
    const preflight = await requestJson("/api/prism/real-preflight-runs", { method: "POST" });
    const preflightRuns = await requestJson("/api/prism/real-preflight-runs");
    const adapterDiagnostics = await requestJson("/api/prism/adapter-diagnostics");

    expect(selectedImage.data).toMatchObject({ id: "sim-image-ubuntu-2404", selected: true });
    expect(activatedFailure.data).toMatchObject({ id: "task-failed", active: true, taskState: "FAILED" });
    expect(failedCreate.data.mockPrismExecution).toMatchObject({
      request: expect.objectContaining({ image: "ubuntu-24.04-lts-golden" }),
      task: expect.objectContaining({
        state: "FAILED",
        percentageComplete: 70,
      }),
      provisioningEnabled: false,
    });
    expect(preflight.data).toMatchObject({
      status: "Blocked",
      provisioningEnabled: false,
      evidence: expect.arrayContaining([expect.stringContaining("without opening a network connection")]),
      mutationOperationsBlocked: expect.arrayContaining(["createVm", "deleteVm"]),
    });
    expect(preflightRuns.data[0]).toMatchObject({ id: preflight.data.id });
    expect(adapterDiagnostics.data.readinessChecks).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Failure scenario", passed: false })])
    );
  });

  it("creates AHV VM sandbox dry-run plans without provisioning", async () => {
    const plan = await requestJson("/api/vm-sandbox/dry-runs", {
      method: "POST",
      body: JSON.stringify({
        environmentName: "vm-plan-dev",
        owner: "demo.user",
        imageProfileId: "ahv-rocky-9-hardened",
        project: "developer-cloud-lab",
        cluster: "berlin-ahv-lab",
        network: "dev-segment-placeholder",
        category: "Lifecycle:30-day-expiry",
        cpu: 2,
        memoryGb: 8,
        diskGb: 80,
        expiryDays: 30,
      }),
    });
    const plans = await requestJson("/api/vm-sandbox/dry-runs");
    const auditEvents = await requestJson("/api/audit-events");

    expect(plan.data).toMatchObject({
      environmentName: "vm-plan-dev",
      templateId: "vm-app",
      imageProfileId: "ahv-rocky-9-hardened",
      provisioningEnabled: false,
      estimatedMonthlyCost: expect.any(Number),
    });
    expect(plan.data.validations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "AHV image approved", passed: true }),
        expect.objectContaining({ name: "Quota within sandbox limit", passed: true }),
        expect.objectContaining({ name: "Expiry within policy", passed: true }),
      ])
    );
    expect(plan.data.rollbackPlan[0]).toContain("No rollback actions required");
    expect(plans.data).toEqual(expect.arrayContaining([expect.objectContaining({ environmentName: "vm-plan-dev" })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "vm-sandbox.dry-run.planned", target: "vm-plan-dev" })])
    );
  });

  it("marks VM sandbox dry-run quota failures without provisioning", async () => {
    const plan = await requestJson("/api/vm-sandbox/dry-runs", {
      method: "POST",
      body: JSON.stringify({
        environmentName: "oversized-vm-plan",
        cpu: 8,
        memoryGb: 32,
        diskGb: 500,
      }),
    });

    expect(plan.data.provisioningEnabled).toBe(false);
    expect(plan.data.validations).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Quota within sandbox limit", passed: false })])
    );
  });

  it("creates and approves controlled provisioning gates without enabling provisioning", async () => {
    const plan = await requestJson("/api/vm-sandbox/dry-runs", {
      method: "POST",
      body: JSON.stringify({
        environmentName: "controlled-vm-plan",
        owner: "demo.user",
        imageProfileId: "ahv-rocky-9-hardened",
        project: "developer-cloud-lab",
        cluster: "berlin-ahv-lab",
        network: "dev-segment-placeholder",
        category: "Lifecycle:30-day-expiry",
        cpu: 2,
        memoryGb: 8,
        diskGb: 80,
        expiryDays: 30,
      }),
    });
    const gate = await requestJson("/api/vm-sandbox/controlled-provisioning", {
      method: "POST",
      body: JSON.stringify({ dryRunPlanId: plan.data.id }),
    });
    const approved = await requestJson(`/api/vm-sandbox/controlled-provisioning/${gate.data.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ evidence: "Operator approval recorded." }),
    });
    const gates = await requestJson("/api/vm-sandbox/controlled-provisioning");
    const auditEvents = await requestJson("/api/audit-events");

    expect(gate.data).toMatchObject({
      environmentName: "controlled-vm-plan",
      dryRunPlanId: plan.data.id,
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(gate.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dry-run validations passed", passed: true }),
        expect.objectContaining({ name: "Rollback plan ready", passed: false }),
        expect.objectContaining({ name: "Destroy plan ready", passed: false }),
        expect.objectContaining({ name: "Authorized scope attached", passed: false }),
        expect.objectContaining({ name: "Mutation kill switch enabled", passed: false }),
      ])
    );
    expect(approved.data).toMatchObject({
      status: "Blocked",
      approval: expect.objectContaining({ status: "Approved" }),
      provisioningEnabled: false,
    });
    expect(gates.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: gate.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "vm-sandbox.controlled.requested", target: "controlled-vm-plan" }),
        expect.objectContaining({ action: "vm-sandbox.controlled.approved", target: "controlled-vm-plan" }),
      ])
    );
  });

  it("records lab authorization scope and VM lifecycle proof evidence", async () => {
    const scope = await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        pentestScopeReference: "authorized-lab-scope.md",
        pentestScopeStructurallyValid: true,
        targetEnvironment: "scope-backed-vm-plan",
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        evidenceReferences: ["authorized-lab-scope.md", "rollback-runbook.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });
    const plan = await requestJson("/api/vm-sandbox/dry-runs", {
      method: "POST",
      body: JSON.stringify({ environmentName: "scope-backed-vm-plan" }),
    });
    await requestJson("/api/audit-exports", { method: "POST" });
    const rollbackProof = await requestJson("/api/vm-sandbox/rollback-destroy-proofs", {
      method: "POST",
      body: JSON.stringify({
        dryRunPlanId: plan.data.id,
        backupEvidenceReference: "backup-export-ref",
        ownerNotificationReference: "owner-notice-ref",
        inventoryReconciliationReference: "inventory-reconciliation-ref",
        rollbackOwner: "Cloud Operations",
      }),
    });
    const gate = await requestJson("/api/vm-sandbox/controlled-provisioning", {
      method: "POST",
      body: JSON.stringify({ dryRunPlanId: plan.data.id }),
    });
    const approved = await requestJson(`/api/vm-sandbox/controlled-provisioning/${gate.data.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ evidence: "Operator approval recorded." }),
    });
    const proof = await requestJson("/api/vm-lifecycle/proofs", {
      method: "POST",
      body: JSON.stringify({ gateId: gate.data.id, rollbackVerified: true, destroyVerified: true }),
    });
    const scopes = await requestJson("/api/lab-authorization/scopes");
    const diagnostics = await requestJson("/api/lab-authorization/diagnostics");
    const proofs = await requestJson("/api/vm-lifecycle/proofs");
    const rollbackProofs = await requestJson("/api/vm-sandbox/rollback-destroy-proofs");

    expect(scope.data).toMatchObject({
      version: "v1",
      targetEnvironment: "scope-backed-vm-plan",
      providerCoverage: ["NCI"],
      targetEndpoints: ["prism-central-ref"],
      pentestScopeReference: "authorized-lab-scope.md",
      pentestScopeStructurallyValid: true,
      rollbackOwner: "Cloud Operations",
    });
    expect(diagnostics.data).toMatchObject({
      totalScopes: 1,
      readyScopes: 1,
      latest: expect.objectContaining({ readyForAdapterReview: true }),
    });
    expect(diagnostics.data.providerCoverage).toEqual(
      expect.arrayContaining([expect.objectContaining({ provider: "NCI", covered: true })])
    );
    expect(gate.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Rollback plan ready", passed: true }),
        expect.objectContaining({ name: "Destroy plan ready", passed: true }),
        expect.objectContaining({ name: "Authorized scope attached", passed: true }),
      ])
    );
    expect(rollbackProof.data).toMatchObject({ status: "Ready for controlled create", provisioningEnabled: false });
    expect(approved.data).toMatchObject({ status: "Mutation disabled", provisioningEnabled: false });
    expect(proof.data).toMatchObject({
      environmentName: "scope-backed-vm-plan",
      status: "Blocked",
      rollbackVerified: true,
      destroyVerified: true,
      provisioningEnabled: false,
    });
    expect(scopes.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: scope.data.id })]));
    expect(rollbackProofs.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: rollbackProof.data.id })]));
    expect(proofs.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: proof.data.id })]));
  });

  it("blocks adapter enablement when lab scope evidence is expired or incomplete", async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        expiresAt: yesterday,
        pentestScopeReference: "expired-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        evidenceReferences: ["expired-scope.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });

    const diagnostics = await requestJson("/api/lab-authorization/diagnostics");
    const record = await requestJson("/api/adapter-enablement/records", {
      method: "POST",
      body: JSON.stringify({ provider: "NCI", rollbackOwner: "Cloud Operations" }),
    });

    expect(diagnostics.data).toMatchObject({
      totalScopes: 1,
      readyScopes: 0,
      latest: expect.objectContaining({ status: "Expired", readyForAdapterReview: false }),
    });
    expect(record.data.checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Approved lab scope", passed: false })])
    );
    expect(record.data).toMatchObject({ status: "Blocked", provisioningEnabled: false });
  });

  it("keeps controlled create authorization blocked without active pentest scope", async () => {
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      body: JSON.stringify({
        pentestScopeReference: "authorized-lab-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        evidenceReferences: ["authorized-lab-scope.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });
    const plan = await requestJson("/api/vm-sandbox/dry-runs", {
      method: "POST",
      body: JSON.stringify({ environmentName: "authorization-envelope-plan" }),
    });
    await requestJson("/api/audit-exports", { method: "POST" });
    await requestJson("/api/vm-sandbox/rollback-destroy-proofs", {
      method: "POST",
      body: JSON.stringify({
        dryRunPlanId: plan.data.id,
        backupEvidenceReference: "backup-export-ref",
        ownerNotificationReference: "owner-notice-ref",
        inventoryReconciliationReference: "inventory-reconciliation-ref",
        rollbackOwner: "Cloud Operations",
      }),
    });
    const gate = await requestJson("/api/vm-sandbox/controlled-provisioning", {
      method: "POST",
      body: JSON.stringify({ dryRunPlanId: plan.data.id }),
    });
    await requestJson(`/api/vm-sandbox/controlled-provisioning/${gate.data.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ evidence: "Operator approval recorded." }),
    });
    await requestJson("/api/vm-lifecycle/proofs", {
      method: "POST",
      body: JSON.stringify({ gateId: gate.data.id, rollbackVerified: true, destroyVerified: true }),
    });

    const envelope = await requestJson("/api/vm-sandbox/controlled-create-authorization", { method: "POST" });
    const envelopes = await requestJson("/api/vm-sandbox/controlled-create-authorization");
    const contract = await requestJson("/api/ahv/create-adapter-contracts", { method: "POST" });
    const contracts = await requestJson("/api/ahv/create-adapter-contracts");

    expect(envelope.data).toMatchObject({
      environmentName: "authorization-envelope-plan",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(envelope.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Active pentest scope", passed: false }),
        expect.objectContaining({ name: "Real mutation boundary authorized", passed: true }),
      ])
    );
    expect(envelopes.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: envelope.data.id })]));
    expect(contract.data).toMatchObject({
      environmentName: "authorization-envelope-plan",
      adapterMode: "Disabled real adapter",
      status: "Blocked",
      provisioningEnabled: false,
      payload: expect.objectContaining({
        name: "authorization-envelope-plan",
        project: "developer-cloud-lab",
      }),
      blockedOperations: expect.arrayContaining(["create_vm", "delete_vm"]),
    });
    expect(contract.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Authorization envelope approved", passed: false }),
        expect.objectContaining({ name: "Payload fields approved", passed: true }),
        expect.objectContaining({ name: "Execute path disabled", passed: true }),
      ])
    );
    expect(contracts.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: contract.data.id })]));
  });

  it("records fail-closed AHV controlled provisioning preflight runs", async () => {
    const plan = await requestJson("/api/vm-sandbox/dry-runs", {
      method: "POST",
      body: JSON.stringify({ environmentName: "ahv-preflight-plan" }),
    });
    const gate = await requestJson("/api/vm-sandbox/controlled-provisioning", {
      method: "POST",
      body: JSON.stringify({ dryRunPlanId: plan.data.id }),
    });
    const run = await requestJson("/api/ahv/controlled-provisioning/runs", {
      method: "POST",
      body: JSON.stringify({ gateId: gate.data.id, action: "Create VM" }),
    });
    const runs = await requestJson("/api/ahv/controlled-provisioning/runs");
    const auditEvents = await requestJson("/api/audit-events");

    expect(run.data).toMatchObject({
      gateId: gate.data.id,
      dryRunPlanId: plan.data.id,
      action: "Create VM",
      adapterMode: "Disabled real adapter",
      status: "Preflight blocked",
      provisioningEnabled: false,
    });
    expect(run.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Controlled gate approved", passed: false }),
        expect.objectContaining({ name: "AHV adapter enabled", passed: false }),
      ])
    );
    expect(run.data.mutationOperationsBlocked).toContain("create_vm");
    expect(runs.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: run.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "ahv.controlled.preflight.recorded", target: "ahv-preflight-plan" })])
    );
  });

  it("reports AHV lab runtime config as disabled by default and protects lab routes", async () => {
    const developerHeaders = {
      "x-ndc-user": "demo.dev",
      "x-ndc-roles": "Developer",
    };
    const config = await requestJson("/api/ahv/lab-runtime/config", {
      headers: { "x-ndc-user": "platform.admin", "x-ndc-roles": "Platform Admin" },
    });

    expect(config.data).toMatchObject({
      mode: "Disabled",
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
      passwordConfigured: false,
    });
    await expectJson(
      "/api/ahv/lab-runtime/config",
      403,
      {
        error: {
          code: "forbidden",
          message: "The current session does not have permission for this action.",
        },
      },
      { headers: developerHeaders }
    );
  });

  it("executes lab AHV create, poll, power, and destroy against the mock Prism endpoint", async () => {
    configureAhvLabEnv(`${baseUrl}/mock-prism`);

    const adminHeaders = { "x-ndc-user": "platform.admin", "x-ndc-roles": "Platform Admin" };
    const preflight = await requestJson("/api/ahv/lab-runtime/preflight", { method: "POST", headers: adminHeaders });
    const plan = await requestJson("/api/vm-sandbox/dry-runs", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ environmentName: "ndc-lab-api-01" }),
    });
    await requestJson("/api/lab-authorization/scopes", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        pentestScopeReference: "authorized-ahv-lab-scope.md",
        pentestScopeStructurallyValid: true,
        providerCoverage: ["NCI"],
        targetEndpoints: ["prism-central-ref"],
        evidenceReferences: ["authorized-ahv-lab-scope.md"],
        rollbackOwner: "Cloud Operations",
      }),
    });
    await requestJson("/api/audit-exports", { method: "POST", headers: adminHeaders });
    await requestJson("/api/vm-sandbox/rollback-destroy-proofs", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        dryRunPlanId: plan.data.id,
        backupEvidenceReference: "backup-export-ref",
        ownerNotificationReference: "owner-notice-ref",
        inventoryReconciliationReference: "inventory-reconciliation-ref",
        rollbackOwner: "Cloud Operations",
      }),
    });
    const gate = await requestJson("/api/vm-sandbox/controlled-provisioning", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ dryRunPlanId: plan.data.id }),
    });
    const approved = await requestJson(`/api/vm-sandbox/controlled-provisioning/${gate.data.id}/approve`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ evidence: "Authorized lab operator approved controlled create." }),
    });
    await requestJson("/api/vm-lifecycle/proofs", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ gateId: gate.data.id, rollbackVerified: true, destroyVerified: true }),
    });
    const envelope = await requestJson("/api/vm-sandbox/controlled-create-authorization", {
      method: "POST",
      headers: adminHeaders,
    });
    const created = await requestJson("/api/ahv/controlled-provisioning/runs", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ gateId: gate.data.id, action: "Create VM" }),
    });
    const polled = await requestJson(`/api/ahv/controlled-provisioning/runs/${created.data.id}/poll`, {
      method: "POST",
      headers: adminHeaders,
    });
    const powered = await requestJson(`/api/ahv/controlled-provisioning/runs/${created.data.id}/power`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ powerState: "OFF" }),
    });
    const destroyed = await requestJson(`/api/ahv/controlled-provisioning/runs/${created.data.id}/destroy`, {
      method: "POST",
      headers: adminHeaders,
    });
    const auditEvents = await requestJson("/api/audit-events", { headers: adminHeaders });

    expect(preflight.data).toMatchObject({ status: "Ready", realPrismCallsEnabled: true });
    expect(preflight.data.readOnlyChecks).toHaveLength(4);
    expect(approved.data).toMatchObject({ status: "Approved for controlled create" });
    expect(envelope.data).toMatchObject({ status: "Ready for authorization review" });
    expect(created.data).toMatchObject({
      adapterMode: "Lab AHV Prism adapter",
      status: "Submitted",
      provisioningEnabled: true,
      createStatus: "Submitted",
      prismTaskUuid: expect.any(String),
    });
    expect(polled.data).toMatchObject({ status: "Succeeded", createStatus: "Succeeded", vmUuid: expect.stringContaining("mock-vm") });
    expect(powered.data).toMatchObject({ action: "Power VM", powerStatus: "Submitted" });
    expect(destroyed.data).toMatchObject({
      action: "Destroy VM",
      status: "Destroyed",
      destroyStatus: "Submitted",
      inventoryReconciliation: expect.objectContaining({ status: "Reconciled", vmPresent: false }),
    });
    expect(JSON.stringify(auditEvents.data)).not.toContain("placeholder-not-a-secret");
    expect(JSON.stringify(auditEvents.data)).not.toContain("Authorization");
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "ahv.controlled.create.submitted", target: "ndc-lab-api-01" }),
        expect.objectContaining({ action: "ahv.controlled.destroy", target: "ndc-lab-api-01" }),
      ])
    );
  });

  it("plans platform service requests after checking VM lifecycle proof", async () => {
    const serviceRequest = await requestJson("/api/platform-services/requests", {
      method: "POST",
      body: JSON.stringify({
        kind: "NDB PostgreSQL",
        environmentName: "payments-dev",
      }),
    });
    const requests = await requestJson("/api/platform-services/requests");
    const auditEvents = await requestJson("/api/audit-events");

    expect(serviceRequest.data).toMatchObject({
      kind: "NDB PostgreSQL",
      provider: "NDB",
      status: "Blocked",
      vmLifecycleProven: false,
      provisioningEnabled: false,
    });
    expect(serviceRequest.data.validations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Profile published", passed: true }),
        expect.objectContaining({ name: "VM lifecycle proven", passed: false }),
      ])
    );
    expect(serviceRequest.data.cleanupPlan[0]).toContain("Confirm");
    expect(requests.data).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "NDB PostgreSQL" })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "platform-service.request.planned" })])
    );
  });

  it("records fail-closed platform service preflight runs", async () => {
    const serviceRequest = await requestJson("/api/platform-services/requests", {
      method: "POST",
      body: JSON.stringify({
        kind: "NDB PostgreSQL",
        environmentName: "payments-dev",
      }),
    });
    const run = await requestJson("/api/platform-services/preflight-runs", {
      method: "POST",
      body: JSON.stringify({ requestId: serviceRequest.data.id }),
    });
    const runs = await requestJson("/api/platform-services/preflight-runs");
    const contract = await requestJson("/api/platform-services/adapter-contracts", {
      method: "POST",
      body: JSON.stringify({ requestId: serviceRequest.data.id }),
    });
    const contracts = await requestJson("/api/platform-services/adapter-contracts");
    const releaseGate = await requestJson("/api/provider-release-gates", {
      method: "POST",
      body: JSON.stringify({ provider: "NDB", releaseApprover: "platform.owner" }),
    });
    const releaseGates = await requestJson("/api/provider-release-gates");
    const releaseReadiness = await requestJson("/api/provider-release-readiness");
    const releaseExport = await requestJson("/api/release-evidence-exports", {
      method: "POST",
      body: JSON.stringify({ gateId: releaseGate.data.id }),
    });
    const releaseExports = await requestJson("/api/release-evidence-exports");
    const runbook = await requestJson("/api/controlled-lab-release/runbooks", {
      method: "POST",
      body: JSON.stringify({ provider: "NDB" }),
    });
    const runbooks = await requestJson("/api/controlled-lab-release/runbooks");
    const dryRunWindow = await requestJson("/api/controlled-lab-release/windows", {
      method: "POST",
      body: JSON.stringify({ provider: "NDB", runbookId: runbook.data.id, releaseEvidenceExportId: releaseExport.data.id }),
    });
    const dryRunWindows = await requestJson("/api/controlled-lab-release/windows");
    const windowExport = await requestJson("/api/controlled-lab-release/window-exports", {
      method: "POST",
      body: JSON.stringify({ windowId: dryRunWindow.data.id }),
    });
    const windowExports = await requestJson("/api/controlled-lab-release/window-exports");
    const evidenceReview = await requestJson("/api/controlled-lab-release/evidence-reviews", {
      method: "POST",
      body: JSON.stringify({ exportId: windowExport.data.id }),
    });
    const evidenceReviews = await requestJson("/api/controlled-lab-release/evidence-reviews");
    const proposalEnvelope = await requestJson("/api/controlled-lab-release/proposal-envelopes", {
      method: "POST",
      body: JSON.stringify({ reviewId: evidenceReview.data.id }),
    });
    const proposalEnvelopes = await requestJson("/api/controlled-lab-release/proposal-envelopes");
    const proposalExport = await requestJson("/api/controlled-lab-release/proposal-exports", {
      method: "POST",
      body: JSON.stringify({ envelopeId: proposalEnvelope.data.id }),
    });
    const proposalExports = await requestJson("/api/controlled-lab-release/proposal-exports");
    const executionApproval = await requestJson("/api/controlled-lab-release/execution-approvals", {
      method: "POST",
      body: JSON.stringify({ proposalExportId: proposalExport.data.id }),
    });
    const executionApprovals = await requestJson("/api/controlled-lab-release/execution-approvals");
    const rehearsalPacket = await requestJson("/api/controlled-lab-release/rehearsal-packets", {
      method: "POST",
      body: JSON.stringify({ approvalGateId: executionApproval.data.id }),
    });
    const rehearsalPackets = await requestJson("/api/controlled-lab-release/rehearsal-packets");
    const dryRunChecklist = await requestJson("/api/controlled-lab-release/dry-run-checklists", {
      method: "POST",
      body: JSON.stringify({ rehearsalPacketId: rehearsalPacket.data.id }),
    });
    const dryRunChecklists = await requestJson("/api/controlled-lab-release/dry-run-checklists");
    const evidenceLedger = await requestJson("/api/controlled-lab-release/evidence-ledgers", {
      method: "POST",
      body: JSON.stringify({ dryRunChecklistId: dryRunChecklist.data.id }),
    });
    const evidenceLedgers = await requestJson("/api/controlled-lab-release/evidence-ledgers");
    const readinessAttestation = await requestJson("/api/controlled-lab-release/readiness-attestations", {
      method: "POST",
      body: JSON.stringify({ evidenceLedgerId: evidenceLedger.data.id }),
    });
    const readinessAttestations = await requestJson("/api/controlled-lab-release/readiness-attestations");
    const brokerRecord = await requestJson("/api/execution-broker/queue", {
      method: "POST",
      body: JSON.stringify({
        readinessAttestationId: readinessAttestation.data.id,
        idempotencyKey: "ndb-controlled-lab-001",
      }),
    });
    const brokerRecords = await requestJson("/api/execution-broker/queue");
    const dispatchApproval = await requestJson("/api/execution-broker/dispatch-approvals", {
      method: "POST",
      body: JSON.stringify({ brokerRecordId: brokerRecord.data.id }),
    });
    const dispatchApprovals = await requestJson("/api/execution-broker/dispatch-approvals");
    const labScopeActivation = await requestJson("/api/real-adapter/lab-scope-activations", {
      method: "POST",
      body: JSON.stringify({ dispatchApprovalId: dispatchApproval.data.id }),
    });
    const labScopeActivations = await requestJson("/api/real-adapter/lab-scope-activations");
    const switchReview = await requestJson("/api/real-adapter/switch-reviews", {
      method: "POST",
      body: JSON.stringify({ activationId: labScopeActivation.data.id }),
    });
    const switchReviews = await requestJson("/api/real-adapter/switch-reviews");
    const switchStateAuditPackage = await requestJson("/api/real-adapter/switch-state-audit-packages", {
      method: "POST",
      body: JSON.stringify({ switchReviewId: switchReview.data.id }),
    });
    const switchStateAuditPackages = await requestJson("/api/real-adapter/switch-state-audit-packages");
    const controlledSwitchRequest = await requestJson("/api/real-adapter/controlled-switch-requests", {
      method: "POST",
      body: JSON.stringify({ auditPackageId: switchStateAuditPackage.data.id }),
    });
    const controlledSwitchRequests = await requestJson("/api/real-adapter/controlled-switch-requests");
    const switchHandoffPackage = await requestJson("/api/real-adapter/switch-handoff-packages", {
      method: "POST",
      body: JSON.stringify({ controlledSwitchRequestId: controlledSwitchRequest.data.id }),
    });
    const switchHandoffPackages = await requestJson("/api/real-adapter/switch-handoff-packages");
    const switchOutcomeRecord = await requestJson("/api/real-adapter/switch-outcome-records", {
      method: "POST",
      body: JSON.stringify({ handoffPackageId: switchHandoffPackage.data.id }),
    });
    const switchOutcomeRecords = await requestJson("/api/real-adapter/switch-outcome-records");
    const switchClosurePackage = await requestJson("/api/real-adapter/switch-closure-packages", {
      method: "POST",
      body: JSON.stringify({ outcomeRecordId: switchOutcomeRecord.data.id }),
    });
    const switchClosurePackages = await requestJson("/api/real-adapter/switch-closure-packages");
    const adapterPromotionDossier = await requestJson("/api/real-adapter/adapter-promotion-dossiers", {
      method: "POST",
      body: JSON.stringify({ closurePackageId: switchClosurePackage.data.id }),
    });
    const adapterPromotionDossiers = await requestJson("/api/real-adapter/adapter-promotion-dossiers");
    const productionAuthorizationPacket = await requestJson("/api/real-adapter/production-authorization-packets", {
      method: "POST",
      body: JSON.stringify({ promotionDossierId: adapterPromotionDossier.data.id }),
    });
    const productionAuthorizationPackets = await requestJson("/api/real-adapter/production-authorization-packets");
    const productionChangeFreezeRecord = await requestJson("/api/real-adapter/production-change-freeze-records", {
      method: "POST",
      body: JSON.stringify({ authorizationPacketId: productionAuthorizationPacket.data.id }),
    });
    const productionChangeFreezeRecords = await requestJson("/api/real-adapter/production-change-freeze-records");
    const productionCabHandoffPacket = await requestJson("/api/real-adapter/production-cab-handoff-packets", {
      method: "POST",
      body: JSON.stringify({ freezeRecordId: productionChangeFreezeRecord.data.id }),
    });
    const productionCabHandoffPackets = await requestJson("/api/real-adapter/production-cab-handoff-packets");
    const productionCabDecisionRecord = await requestJson("/api/real-adapter/production-cab-decision-records", {
      method: "POST",
      body: JSON.stringify({ cabHandoffPacketId: productionCabHandoffPacket.data.id }),
    });
    const productionCabDecisionRecords = await requestJson("/api/real-adapter/production-cab-decision-records");
    const productionImplementationHoldRecord = await requestJson(
      "/api/real-adapter/production-implementation-hold-records",
      {
        method: "POST",
        body: JSON.stringify({ cabDecisionRecordId: productionCabDecisionRecord.data.id }),
      }
    );
    const productionImplementationHoldRecords = await requestJson(
      "/api/real-adapter/production-implementation-hold-records"
    );
    const productionOperatorAssignmentRecord = await requestJson(
      "/api/real-adapter/production-operator-assignment-records",
      {
        method: "POST",
        body: JSON.stringify({ implementationHoldRecordId: productionImplementationHoldRecord.data.id }),
      }
    );
    const productionOperatorAssignmentRecords = await requestJson(
      "/api/real-adapter/production-operator-assignment-records"
    );
    const productionExecutionReadinessRecord = await requestJson(
      "/api/real-adapter/production-execution-readiness-records",
      {
        method: "POST",
        body: JSON.stringify({ operatorAssignmentRecordId: productionOperatorAssignmentRecord.data.id }),
      }
    );
    const productionExecutionReadinessRecords = await requestJson(
      "/api/real-adapter/production-execution-readiness-records"
    );
    const productionExecutionAuthorizationRecord = await requestJson(
      "/api/real-adapter/production-execution-authorization-records",
      {
        method: "POST",
        body: JSON.stringify({ executionReadinessRecordId: productionExecutionReadinessRecord.data.id }),
      }
    );
    const productionExecutionAuthorizationRecords = await requestJson(
      "/api/real-adapter/production-execution-authorization-records"
    );
    const productionChangeTicketLockRecord = await requestJson(
      "/api/real-adapter/production-change-ticket-lock-records",
      {
        method: "POST",
        body: JSON.stringify({ executionAuthorizationRecordId: productionExecutionAuthorizationRecord.data.id }),
      }
    );
    const productionChangeTicketLockRecords = await requestJson(
      "/api/real-adapter/production-change-ticket-lock-records"
    );
    const productionFinalExecutionPacketRecord = await requestJson(
      "/api/real-adapter/production-final-execution-packet-records",
      {
        method: "POST",
        body: JSON.stringify({ changeTicketLockRecordId: productionChangeTicketLockRecord.data.id }),
      }
    );
    const productionFinalExecutionPacketRecords = await requestJson(
      "/api/real-adapter/production-final-execution-packet-records"
    );
    const productionExecutionHoldPointRecord = await requestJson(
      "/api/real-adapter/production-execution-hold-point-records",
      {
        method: "POST",
        body: JSON.stringify({ finalExecutionPacketRecordId: productionFinalExecutionPacketRecord.data.id }),
      }
    );
    const productionExecutionHoldPointRecords = await requestJson(
      "/api/real-adapter/production-execution-hold-point-records"
    );
    const productionExecutionOutcomeAuthorizationRecord = await requestJson(
      "/api/real-adapter/production-execution-outcome-authorization-records",
      {
        method: "POST",
        body: JSON.stringify({ executionHoldPointRecordId: productionExecutionHoldPointRecord.data.id }),
      }
    );
    const productionExecutionOutcomeAuthorizationRecords = await requestJson(
      "/api/real-adapter/production-execution-outcome-authorization-records"
    );
    const productionExecutionClosureAuthorizationRecord = await requestJson(
      "/api/real-adapter/production-execution-closure-authorization-records",
      {
        method: "POST",
        body: JSON.stringify({
          outcomeAuthorizationRecordId: productionExecutionOutcomeAuthorizationRecord.data.id,
        }),
      }
    );
    const productionExecutionClosureAuthorizationRecords = await requestJson(
      "/api/real-adapter/production-execution-closure-authorization-records"
    );
    const productionExecutionClosurePacketRecord = await requestJson(
      "/api/real-adapter/production-execution-closure-packet-records",
      {
        method: "POST",
        body: JSON.stringify({
          closureAuthorizationRecordId: productionExecutionClosureAuthorizationRecord.data.id,
        }),
      }
    );
    const productionExecutionClosurePacketRecords = await requestJson(
      "/api/real-adapter/production-execution-closure-packet-records"
    );
    const productionExecutionArchivalHandoffRecord = await requestJson(
      "/api/real-adapter/production-execution-archival-handoff-records",
      {
        method: "POST",
        body: JSON.stringify({
          closurePacketRecordId: productionExecutionClosurePacketRecord.data.id,
        }),
      }
    );
    const productionExecutionArchivalHandoffRecords = await requestJson(
      "/api/real-adapter/production-execution-archival-handoff-records"
    );
    const productionExecutionRetentionAttestationRecord = await requestJson(
      "/api/real-adapter/production-execution-retention-attestation-records",
      {
        method: "POST",
        body: JSON.stringify({
          archivalHandoffRecordId: productionExecutionArchivalHandoffRecord.data.id,
        }),
      }
    );
    const productionExecutionRetentionAttestationRecords = await requestJson(
      "/api/real-adapter/production-execution-retention-attestation-records"
    );
    const productionExecutionFinalArchiveCertificationRecord = await requestJson(
      "/api/real-adapter/production-execution-final-archive-certification-records",
      {
        method: "POST",
        body: JSON.stringify({
          retentionAttestationRecordId: productionExecutionRetentionAttestationRecord.data.id,
        }),
      }
    );
    const productionExecutionFinalArchiveCertificationRecords = await requestJson(
      "/api/real-adapter/production-execution-final-archive-certification-records"
    );
    const productionExecutionCompletionDossierRecord = await requestJson(
      "/api/real-adapter/production-execution-completion-dossier-records",
      {
        method: "POST",
        body: JSON.stringify({
          finalArchiveCertificationRecordId: productionExecutionFinalArchiveCertificationRecord.data.id,
        }),
      }
    );
    const productionExecutionCompletionDossierRecords = await requestJson(
      "/api/real-adapter/production-execution-completion-dossier-records"
    );
    const productionExecutionOperationsHandoverRecord = await requestJson(
      "/api/real-adapter/production-execution-operations-handover-records",
      {
        method: "POST",
        body: JSON.stringify({
          completionDossierRecordId: productionExecutionCompletionDossierRecord.data.id,
        }),
      }
    );
    const productionExecutionOperationsHandoverRecords = await requestJson(
      "/api/real-adapter/production-execution-operations-handover-records"
    );
    const productionExecutionSupportReadinessRecord = await requestJson(
      "/api/real-adapter/production-execution-support-readiness-records",
      {
        method: "POST",
        body: JSON.stringify({
          operationsHandoverRecordId: productionExecutionOperationsHandoverRecord.data.id,
        }),
      }
    );
    const productionExecutionSupportReadinessRecords = await requestJson(
      "/api/real-adapter/production-execution-support-readiness-records"
    );
    const productionExecutionServiceAcceptanceRecord = await requestJson(
      "/api/real-adapter/production-execution-service-acceptance-records",
      {
        method: "POST",
        body: JSON.stringify({
          supportReadinessRecordId: productionExecutionSupportReadinessRecord.data.id,
        }),
      }
    );
    const productionExecutionServiceAcceptanceRecords = await requestJson(
      "/api/real-adapter/production-execution-service-acceptance-records"
    );
    const productionExecutionFinalTurnoverRecord = await requestJson(
      "/api/real-adapter/production-execution-final-turnover-records",
      {
        method: "POST",
        body: JSON.stringify({
          serviceAcceptanceRecordId: productionExecutionServiceAcceptanceRecord.data.id,
        }),
      }
    );
    const productionExecutionFinalTurnoverRecords = await requestJson(
      "/api/real-adapter/production-execution-final-turnover-records"
    );
    const productionExecutionOperationalClosureRecord = await requestJson(
      "/api/real-adapter/production-execution-operational-closure-records",
      {
        method: "POST",
        body: JSON.stringify({
          finalTurnoverRecordId: productionExecutionFinalTurnoverRecord.data.id,
        }),
      }
    );
    const productionExecutionOperationalClosureRecords = await requestJson(
      "/api/real-adapter/production-execution-operational-closure-records"
    );
    const productionExecutionPostImplementationReviewRecord = await requestJson(
      "/api/real-adapter/production-execution-post-implementation-review-records",
      {
        method: "POST",
        body: JSON.stringify({
          operationalClosureRecordId: productionExecutionOperationalClosureRecord.data.id,
        }),
      }
    );
    const productionExecutionPostImplementationReviewRecords = await requestJson(
      "/api/real-adapter/production-execution-post-implementation-review-records"
    );
    const productionExecutionImprovementClosureRecord = await requestJson(
      "/api/real-adapter/production-execution-improvement-closure-records",
      {
        method: "POST",
        body: JSON.stringify({
          postImplementationReviewRecordId: productionExecutionPostImplementationReviewRecord.data.id,
        }),
      }
    );
    const productionExecutionImprovementClosureRecords = await requestJson(
      "/api/real-adapter/production-execution-improvement-closure-records"
    );
    const productionExecutionFinalAcceptanceArchiveRecord = await requestJson(
      "/api/real-adapter/production-execution-final-acceptance-archive-records",
      {
        method: "POST",
        body: JSON.stringify({
          improvementClosureRecordId: productionExecutionImprovementClosureRecord.data.id,
        }),
      }
    );
    const productionExecutionFinalAcceptanceArchiveRecords = await requestJson(
      "/api/real-adapter/production-execution-final-acceptance-archive-records"
    );
    const productionExecutionReadinessArchiveHandoffRecord = await requestJson(
      "/api/real-adapter/production-execution-readiness-archive-handoff-records",
      {
        method: "POST",
        body: JSON.stringify({
          finalAcceptanceArchiveRecordId: productionExecutionFinalAcceptanceArchiveRecord.data.id,
        }),
      }
    );
    const productionExecutionReadinessArchiveHandoffRecords = await requestJson(
      "/api/real-adapter/production-execution-readiness-archive-handoff-records"
    );
    const productionExecutionArchiveRetrievalValidationRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-retrieval-validation-records",
      {
        method: "POST",
        body: JSON.stringify({
          readinessArchiveHandoffRecordId: productionExecutionReadinessArchiveHandoffRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRetrievalValidationRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-retrieval-validation-records"
    );
    const productionExecutionArchiveRecoveryDrillRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-drill-records",
      {
        method: "POST",
        body: JSON.stringify({
          archiveRetrievalValidationRecordId: productionExecutionArchiveRetrievalValidationRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryDrillRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-drill-records"
    );
    const productionExecutionArchiveRecoveryAcceptanceRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-acceptance-records",
      {
        method: "POST",
        body: JSON.stringify({
          archiveRecoveryDrillRecordId: productionExecutionArchiveRecoveryDrillRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryAcceptanceRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-acceptance-records"
    );
    const productionExecutionArchiveRecoveryClosureRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-closure-records",
      {
        method: "POST",
        body: JSON.stringify({
          archiveRecoveryAcceptanceRecordId: productionExecutionArchiveRecoveryAcceptanceRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryClosureRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-closure-records"
    );
    const productionExecutionArchiveRecoveryAuditCertificationRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-audit-certification-records",
      {
        method: "POST",
        body: JSON.stringify({
          archiveRecoveryClosureRecordId: productionExecutionArchiveRecoveryClosureRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryAuditCertificationRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-audit-certification-records"
    );
    const productionExecutionArchiveRecoveryFinalComplianceArchiveRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records",
      {
        method: "POST",
        body: JSON.stringify({
          archiveRecoveryAuditCertificationRecordId:
            productionExecutionArchiveRecoveryAuditCertificationRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryFinalComplianceArchiveRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records"
    );
    const productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records",
      {
        method: "POST",
        body: JSON.stringify({
          finalComplianceArchiveRecordId:
            productionExecutionArchiveRecoveryFinalComplianceArchiveRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records"
    );
    const productionExecutionArchiveRecoveryOperationalContinuityRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records",
      {
        method: "POST",
        body: JSON.stringify({
          evidenceCustodyClosureRecordId:
            productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryOperationalContinuityRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records"
    );
    const productionExecutionArchiveRecoveryServiceManagementHandoffRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records",
      {
        method: "POST",
        body: JSON.stringify({
          operationalContinuityRecordId:
            productionExecutionArchiveRecoveryOperationalContinuityRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryServiceManagementHandoffRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records"
    );
    const productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records",
      {
        method: "POST",
        body: JSON.stringify({
          serviceManagementHandoffRecordId:
            productionExecutionArchiveRecoveryServiceManagementHandoffRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records"
    );
    const productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records",
      {
        method: "POST",
        body: JSON.stringify({
          supportOwnershipAcceptanceRecordId:
            productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records"
    );
    const productionExecutionArchiveRecoveryFinalOperationsHandoffRecord = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records",
      {
        method: "POST",
        body: JSON.stringify({
          monitoringOwnershipClosureRecordId:
            productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord.data.id,
        }),
      }
    );
    const productionExecutionArchiveRecoveryFinalOperationsHandoffRecords = await requestJson(
      "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records"
    );
    const auditEvents = await requestJson("/api/audit-events");

    expect(run.data).toMatchObject({
      requestId: serviceRequest.data.id,
      kind: "NDB PostgreSQL",
      provider: "NDB",
      adapterMode: "Disabled real adapter",
      status: "Preflight blocked",
      provisioningEnabled: false,
    });
    expect(run.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Request validations passed", passed: false }),
        expect.objectContaining({ name: "Real adapter switch enabled", passed: false }),
      ])
    );
    expect(run.data.mutationOperationsBlocked).toContain("create_database");
    expect(runs.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: run.data.id })]));
    expect(contract.data).toMatchObject({
      requestId: serviceRequest.data.id,
      preflightRunId: run.data.id,
      kind: "NDB PostgreSQL",
      provider: "NDB",
      adapterMode: "Disabled real adapter",
      status: "Blocked",
      provisioningEnabled: false,
      payload: expect.objectContaining({
        serviceName: "app-postgres-dev",
        provider: "NDB",
        profileId: "ndb-postgres-16-dev",
      }),
      blockedOperations: expect.arrayContaining(["create_database", "delete_database"]),
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(contract.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Preflight run recorded", passed: true }),
        expect.objectContaining({ name: "Payload fields approved", passed: true }),
        expect.objectContaining({ name: "Execute path disabled", passed: true }),
      ])
    );
    expect(contracts.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: contract.data.id })]));
    expect(releaseGate.data).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      releaseApprover: "platform.owner",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
      blockedOperations: expect.arrayContaining(["create_database", "delete_database"]),
    });
    expect(releaseGate.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Provider contract evidence ready", passed: false }),
        expect.objectContaining({ name: "Release approver assigned", passed: true }),
        expect.objectContaining({ name: "Real adapter disabled", passed: true }),
      ])
    );
    expect(releaseGates.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: releaseGate.data.id })]));
    expect(releaseReadiness.data).toMatchObject({
      nearestToReady: "NDB",
      mostBlocked: expect.any(String),
      provisioningEnabled: false,
      providers: expect.arrayContaining([
        expect.objectContaining({
          provider: "NDB",
          latestGateId: releaseGate.data.id,
          gapCount: expect.any(Number),
        }),
      ]),
    });
    expect(releaseExport.data).toMatchObject({
      provider: "NDB",
      gateId: releaseGate.data.id,
      status: "Prepared",
      format: "JSON",
      checksumAlgorithm: "sha256",
      provisioningEnabled: false,
      manifest: expect.objectContaining({
        provider: "NDB",
        gateId: releaseGate.data.id,
        blockedOperations: expect.arrayContaining(["create_database"]),
      }),
    });
    expect(releaseExport.data.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(releaseExport.data.redactionBoundary).toContain("metadata only");
    expect(releaseExports.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: releaseExport.data.id })]));
    expect(runbook.data).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(runbook.data.signOffs).toHaveLength(4);
    expect(runbook.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "All required sign-offs recorded", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(runbook.data.stopConditions.length).toBeGreaterThanOrEqual(3);
    expect(runbooks.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: runbook.data.id })]));
    expect(dryRunWindow.data).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      linkedRunbookId: runbook.data.id,
      linkedReleaseEvidenceExportId: releaseExport.data.id,
      provisioningEnabled: false,
    });
    expect(dryRunWindow.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Controlled runbook ready", passed: false }),
        expect.objectContaining({ name: "Release evidence export linked", passed: true }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(dryRunWindows.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: dryRunWindow.data.id })]));
    expect(windowExport.data).toMatchObject({
      provider: "NDB",
      windowId: dryRunWindow.data.id,
      status: "Prepared",
      checksumAlgorithm: "sha256",
      provisioningEnabled: false,
      manifest: expect.objectContaining({
        windowId: dryRunWindow.data.id,
        linkedRunbookId: runbook.data.id,
        linkedReleaseEvidenceExportId: releaseExport.data.id,
        provisioningEnabled: false,
      }),
    });
    expect(windowExport.data.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(windowExports.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: windowExport.data.id })]));
    expect(evidenceReview.data).toMatchObject({
      provider: "NDB",
      exportId: windowExport.data.id,
      windowId: dryRunWindow.data.id,
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(evidenceReview.data.decisions).toHaveLength(3);
    expect(evidenceReview.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Reviewer decisions complete", passed: false }),
        expect.objectContaining({ name: "Execution remains disabled", passed: true }),
      ])
    );
    expect(evidenceReviews.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: evidenceReview.data.id })]));
    expect(proposalEnvelope.data).toMatchObject({
      provider: "NDB",
      reviewId: evidenceReview.data.id,
      exportId: windowExport.data.id,
      windowId: dryRunWindow.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(proposalEnvelope.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Lab evidence review accepted", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(proposalEnvelopes.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposalEnvelope.data.id })]));
    expect(proposalExport.data).toMatchObject({
      provider: "NDB",
      envelopeId: proposalEnvelope.data.id,
      status: "Prepared",
      checksumAlgorithm: "sha256",
      provisioningEnabled: false,
      manifest: expect.objectContaining({
        envelopeId: proposalEnvelope.data.id,
        envelopeStatus: "Blocked",
        reviewId: evidenceReview.data.id,
        windowId: dryRunWindow.data.id,
        windowEvidenceExportId: windowExport.data.id,
        provisioningEnabled: false,
        killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
      }),
    });
    expect(proposalExport.data.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(proposalExport.data.redactionBoundary).toContain("metadata only");
    expect(proposalExports.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposalExport.data.id })]));
    expect(executionApproval.data).toMatchObject({
      provider: "NDB",
      proposalExportId: proposalExport.data.id,
      envelopeId: proposalEnvelope.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(executionApproval.data.decisions).toHaveLength(5);
    expect(executionApproval.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "All approvers accepted", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(executionApprovals.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: executionApproval.data.id })]));
    expect(rehearsalPacket.data).toMatchObject({
      provider: "NDB",
      approvalGateId: executionApproval.data.id,
      proposalExportId: proposalExport.data.id,
      envelopeId: proposalEnvelope.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(rehearsalPacket.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution approval gate approved", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(rehearsalPackets.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: rehearsalPacket.data.id })]));
    expect(dryRunChecklist.data).toMatchObject({
      provider: "NDB",
      rehearsalPacketId: rehearsalPacket.data.id,
      approvalGateId: executionApproval.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(dryRunChecklist.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Rehearsal packet ready", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(dryRunChecklists.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: dryRunChecklist.data.id })]));
    expect(evidenceLedger.data).toMatchObject({
      provider: "NDB",
      dryRunChecklistId: dryRunChecklist.data.id,
      rehearsalPacketId: rehearsalPacket.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(evidenceLedger.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dry-run checklist ready", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(evidenceLedgers.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: evidenceLedger.data.id })]));
    expect(readinessAttestation.data).toMatchObject({
      provider: "NDB",
      evidenceLedgerId: evidenceLedger.data.id,
      dryRunChecklistId: dryRunChecklist.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(readinessAttestation.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Evidence ledger ready", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(readinessAttestations.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: readinessAttestation.data.id })])
    );
    expect(brokerRecord.data).toMatchObject({
      provider: "NDB",
      readinessAttestationId: readinessAttestation.data.id,
      evidenceLedgerId: evidenceLedger.data.id,
      idempotencyKey: "ndb-controlled-lab-001",
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(brokerRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Readiness attestation complete", passed: false }),
        expect.objectContaining({ name: "Idempotency key unique", passed: true }),
        expect.objectContaining({ name: "Queued for operator review only", passed: true }),
      ])
    );
    expect(brokerRecords.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: brokerRecord.data.id })]));
    expect(dispatchApproval.data).toMatchObject({
      provider: "NDB",
      brokerRecordId: brokerRecord.data.id,
      readinessAttestationId: readinessAttestation.data.id,
      idempotencyKey: "ndb-controlled-lab-001",
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(dispatchApproval.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Broker record queued", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
    expect(dispatchApprovals.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: dispatchApproval.data.id })])
    );
    expect(labScopeActivation.data).toMatchObject({
      provider: "NDB",
      dispatchApprovalId: dispatchApproval.data.id,
      brokerRecordId: brokerRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(labScopeActivation.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Dispatch approval ready", passed: false }),
        expect.objectContaining({ name: "Real adapter switch remains disabled", passed: true }),
      ])
    );
    expect(labScopeActivations.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: labScopeActivation.data.id })])
    );
    expect(switchReview.data).toMatchObject({
      provider: "NDB",
      activationId: labScopeActivation.data.id,
      dispatchApprovalId: dispatchApproval.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(switchReview.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Lab scope activation ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not change switch state", passed: true }),
      ])
    );
    expect(switchReviews.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: switchReview.data.id })]));
    expect(switchStateAuditPackage.data).toMatchObject({
      provider: "NDB",
      switchReviewId: switchReview.data.id,
      activationId: labScopeActivation.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(switchStateAuditPackage.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Switch review ready", passed: false }),
        expect.objectContaining({ name: "Prototype leaves switch state unchanged", passed: true }),
      ])
    );
    expect(switchStateAuditPackages.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: switchStateAuditPackage.data.id })])
    );
    expect(controlledSwitchRequest.data).toMatchObject({
      provider: "NDB",
      auditPackageId: switchStateAuditPackage.data.id,
      switchReviewId: switchReview.data.id,
      activationId: labScopeActivation.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(controlledSwitchRequest.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Switch-state audit package ready", passed: false }),
        expect.objectContaining({ name: "Prototype remains non-mutating", passed: true }),
      ])
    );
    expect(controlledSwitchRequests.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: controlledSwitchRequest.data.id })])
    );
    expect(switchHandoffPackage.data).toMatchObject({
      provider: "NDB",
      controlledSwitchRequestId: controlledSwitchRequest.data.id,
      auditPackageId: switchStateAuditPackage.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(switchHandoffPackage.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Controlled switch request ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute switch", passed: true }),
      ])
    );
    expect(switchHandoffPackages.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: switchHandoffPackage.data.id })])
    );
    expect(switchOutcomeRecord.data).toMatchObject({
      provider: "NDB",
      handoffPackageId: switchHandoffPackage.data.id,
      controlledSwitchRequestId: controlledSwitchRequest.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(switchOutcomeRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Handoff package ready", passed: false }),
        expect.objectContaining({ name: "Prototype records outcome only", passed: true }),
      ])
    );
    expect(switchOutcomeRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: switchOutcomeRecord.data.id })])
    );
    expect(switchClosurePackage.data).toMatchObject({
      provider: "NDB",
      outcomeRecordId: switchOutcomeRecord.data.id,
      handoffPackageId: switchHandoffPackage.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(switchClosurePackage.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Outcome record ready", passed: false }),
        expect.objectContaining({ name: "Prototype closes evidence only", passed: true }),
      ])
    );
    expect(switchClosurePackages.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: switchClosurePackage.data.id })])
    );
    expect(adapterPromotionDossier.data).toMatchObject({
      provider: "NDB",
      closurePackageId: switchClosurePackage.data.id,
      outcomeRecordId: switchOutcomeRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(adapterPromotionDossier.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Closure package ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
    expect(adapterPromotionDossiers.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: adapterPromotionDossier.data.id })])
    );
    expect(productionAuthorizationPacket.data).toMatchObject({
      provider: "NDB",
      promotionDossierId: adapterPromotionDossier.data.id,
      closurePackageId: switchClosurePackage.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionAuthorizationPacket.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Promotion dossier ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not authorize promotion", passed: true }),
      ])
    );
    expect(productionAuthorizationPackets.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionAuthorizationPacket.data.id })])
    );
    expect(productionChangeFreezeRecord.data).toMatchObject({
      provider: "NDB",
      authorizationPacketId: productionAuthorizationPacket.data.id,
      promotionDossierId: adapterPromotionDossier.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionChangeFreezeRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Authorization packet ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
    expect(productionChangeFreezeRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionChangeFreezeRecord.data.id })])
    );
    expect(productionCabHandoffPacket.data).toMatchObject({
      provider: "NDB",
      freezeRecordId: productionChangeFreezeRecord.data.id,
      authorizationPacketId: productionAuthorizationPacket.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionCabHandoffPacket.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Change freeze ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
    expect(productionCabHandoffPackets.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionCabHandoffPacket.data.id })])
    );
    expect(productionCabDecisionRecord.data).toMatchObject({
      provider: "NDB",
      cabHandoffPacketId: productionCabHandoffPacket.data.id,
      freezeRecordId: productionChangeFreezeRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionCabDecisionRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "CAB handoff ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
    expect(productionCabDecisionRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionCabDecisionRecord.data.id })])
    );
    expect(productionImplementationHoldRecord.data).toMatchObject({
      provider: "NDB",
      cabDecisionRecordId: productionCabDecisionRecord.data.id,
      cabHandoffPacketId: productionCabHandoffPacket.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionImplementationHoldRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "CAB decision ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
    expect(productionImplementationHoldRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionImplementationHoldRecord.data.id })])
    );
    expect(productionOperatorAssignmentRecord.data).toMatchObject({
      provider: "NDB",
      implementationHoldRecordId: productionImplementationHoldRecord.data.id,
      cabDecisionRecordId: productionCabDecisionRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionOperatorAssignmentRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Implementation hold ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not promote adapter", passed: true }),
      ])
    );
    expect(productionOperatorAssignmentRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionOperatorAssignmentRecord.data.id })])
    );
    expect(productionExecutionReadinessRecord.data).toMatchObject({
      provider: "NDB",
      operatorAssignmentRecordId: productionOperatorAssignmentRecord.data.id,
      implementationHoldRecordId: productionImplementationHoldRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionReadinessRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Operator assignment ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionReadinessRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionReadinessRecord.data.id })])
    );
    expect(productionExecutionAuthorizationRecord.data).toMatchObject({
      provider: "NDB",
      executionReadinessRecordId: productionExecutionReadinessRecord.data.id,
      operatorAssignmentRecordId: productionOperatorAssignmentRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionAuthorizationRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution readiness ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionAuthorizationRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionAuthorizationRecord.data.id })])
    );
    expect(productionChangeTicketLockRecord.data).toMatchObject({
      provider: "NDB",
      executionAuthorizationRecordId: productionExecutionAuthorizationRecord.data.id,
      executionReadinessRecordId: productionExecutionReadinessRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionChangeTicketLockRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution authorization ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionChangeTicketLockRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionChangeTicketLockRecord.data.id })])
    );
    expect(productionFinalExecutionPacketRecord.data).toMatchObject({
      provider: "NDB",
      changeTicketLockRecordId: productionChangeTicketLockRecord.data.id,
      executionAuthorizationRecordId: productionExecutionAuthorizationRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionFinalExecutionPacketRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Change ticket lock ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionFinalExecutionPacketRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionFinalExecutionPacketRecord.data.id })])
    );
    expect(productionExecutionHoldPointRecord.data).toMatchObject({
      provider: "NDB",
      finalExecutionPacketRecordId: productionFinalExecutionPacketRecord.data.id,
      changeTicketLockRecordId: productionChangeTicketLockRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionHoldPointRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final execution packet ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionHoldPointRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionHoldPointRecord.data.id })])
    );
    expect(productionExecutionOutcomeAuthorizationRecord.data).toMatchObject({
      provider: "NDB",
      executionHoldPointRecordId: productionExecutionHoldPointRecord.data.id,
      finalExecutionPacketRecordId: productionFinalExecutionPacketRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionOutcomeAuthorizationRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Execution hold-point ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionOutcomeAuthorizationRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionOutcomeAuthorizationRecord.data.id })])
    );
    expect(productionExecutionClosureAuthorizationRecord.data).toMatchObject({
      provider: "NDB",
      outcomeAuthorizationRecordId: productionExecutionOutcomeAuthorizationRecord.data.id,
      executionHoldPointRecordId: productionExecutionHoldPointRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionClosureAuthorizationRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Outcome authorization ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionClosureAuthorizationRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionClosureAuthorizationRecord.data.id })])
    );
    expect(productionExecutionClosurePacketRecord.data).toMatchObject({
      provider: "NDB",
      closureAuthorizationRecordId: productionExecutionClosureAuthorizationRecord.data.id,
      outcomeAuthorizationRecordId: productionExecutionOutcomeAuthorizationRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionClosurePacketRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Closure authorization ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionClosurePacketRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionClosurePacketRecord.data.id })])
    );
    expect(productionExecutionArchivalHandoffRecord.data).toMatchObject({
      provider: "NDB",
      closurePacketRecordId: productionExecutionClosurePacketRecord.data.id,
      closureAuthorizationRecordId: productionExecutionClosureAuthorizationRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchivalHandoffRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Closure packet ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchivalHandoffRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionArchivalHandoffRecord.data.id })])
    );
    expect(productionExecutionRetentionAttestationRecord.data).toMatchObject({
      provider: "NDB",
      archivalHandoffRecordId: productionExecutionArchivalHandoffRecord.data.id,
      closurePacketRecordId: productionExecutionClosurePacketRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionRetentionAttestationRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archival handoff ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionRetentionAttestationRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionRetentionAttestationRecord.data.id })])
    );
    expect(productionExecutionFinalArchiveCertificationRecord.data).toMatchObject({
      provider: "NDB",
      retentionAttestationRecordId: productionExecutionRetentionAttestationRecord.data.id,
      archivalHandoffRecordId: productionExecutionArchivalHandoffRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionFinalArchiveCertificationRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Retention attestation ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionFinalArchiveCertificationRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionFinalArchiveCertificationRecord.data.id }),
      ])
    );
    expect(productionExecutionCompletionDossierRecord.data).toMatchObject({
      provider: "NDB",
      finalArchiveCertificationRecordId: productionExecutionFinalArchiveCertificationRecord.data.id,
      retentionAttestationRecordId: productionExecutionRetentionAttestationRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionCompletionDossierRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final archive certification ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionCompletionDossierRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionCompletionDossierRecord.data.id })])
    );
    expect(productionExecutionOperationsHandoverRecord.data).toMatchObject({
      provider: "NDB",
      completionDossierRecordId: productionExecutionCompletionDossierRecord.data.id,
      finalArchiveCertificationRecordId: productionExecutionFinalArchiveCertificationRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionOperationsHandoverRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Completion dossier ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionOperationsHandoverRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionOperationsHandoverRecord.data.id })])
    );
    expect(productionExecutionSupportReadinessRecord.data).toMatchObject({
      provider: "NDB",
      operationsHandoverRecordId: productionExecutionOperationsHandoverRecord.data.id,
      completionDossierRecordId: productionExecutionCompletionDossierRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionSupportReadinessRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Operations handover ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionSupportReadinessRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionSupportReadinessRecord.data.id })])
    );
    expect(productionExecutionServiceAcceptanceRecord.data).toMatchObject({
      provider: "NDB",
      supportReadinessRecordId: productionExecutionSupportReadinessRecord.data.id,
      operationsHandoverRecordId: productionExecutionOperationsHandoverRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionServiceAcceptanceRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Support readiness ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionServiceAcceptanceRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionServiceAcceptanceRecord.data.id })])
    );
    expect(productionExecutionFinalTurnoverRecord.data).toMatchObject({
      provider: "NDB",
      serviceAcceptanceRecordId: productionExecutionServiceAcceptanceRecord.data.id,
      supportReadinessRecordId: productionExecutionSupportReadinessRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionFinalTurnoverRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Service acceptance ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionFinalTurnoverRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionFinalTurnoverRecord.data.id })])
    );
    expect(productionExecutionOperationalClosureRecord.data).toMatchObject({
      provider: "NDB",
      finalTurnoverRecordId: productionExecutionFinalTurnoverRecord.data.id,
      serviceAcceptanceRecordId: productionExecutionServiceAcceptanceRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionOperationalClosureRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final turnover ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionOperationalClosureRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionOperationalClosureRecord.data.id })])
    );
    expect(productionExecutionPostImplementationReviewRecord.data).toMatchObject({
      provider: "NDB",
      operationalClosureRecordId: productionExecutionOperationalClosureRecord.data.id,
      finalTurnoverRecordId: productionExecutionFinalTurnoverRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionPostImplementationReviewRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Operational closure ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionPostImplementationReviewRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionPostImplementationReviewRecord.data.id })])
    );
    expect(productionExecutionImprovementClosureRecord.data).toMatchObject({
      provider: "NDB",
      postImplementationReviewRecordId: productionExecutionPostImplementationReviewRecord.data.id,
      operationalClosureRecordId: productionExecutionOperationalClosureRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionImprovementClosureRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Post-implementation review ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionImprovementClosureRecords.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: productionExecutionImprovementClosureRecord.data.id })])
    );
    expect(productionExecutionFinalAcceptanceArchiveRecord.data).toMatchObject({
      provider: "NDB",
      improvementClosureRecordId: productionExecutionImprovementClosureRecord.data.id,
      postImplementationReviewRecordId: productionExecutionPostImplementationReviewRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionFinalAcceptanceArchiveRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Improvement closure ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionFinalAcceptanceArchiveRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionFinalAcceptanceArchiveRecord.data.id }),
      ])
    );
    expect(productionExecutionReadinessArchiveHandoffRecord.data).toMatchObject({
      provider: "NDB",
      finalAcceptanceArchiveRecordId: productionExecutionFinalAcceptanceArchiveRecord.data.id,
      improvementClosureRecordId: productionExecutionImprovementClosureRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionReadinessArchiveHandoffRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final acceptance archive ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionReadinessArchiveHandoffRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionReadinessArchiveHandoffRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRetrievalValidationRecord.data).toMatchObject({
      provider: "NDB",
      readinessArchiveHandoffRecordId: productionExecutionReadinessArchiveHandoffRecord.data.id,
      finalAcceptanceArchiveRecordId: productionExecutionFinalAcceptanceArchiveRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRetrievalValidationRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Readiness archive handoff ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRetrievalValidationRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRetrievalValidationRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryDrillRecord.data).toMatchObject({
      provider: "NDB",
      archiveRetrievalValidationRecordId: productionExecutionArchiveRetrievalValidationRecord.data.id,
      readinessArchiveHandoffRecordId: productionExecutionReadinessArchiveHandoffRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryDrillRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archive retrieval validation ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryDrillRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryDrillRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryAcceptanceRecord.data).toMatchObject({
      provider: "NDB",
      archiveRecoveryDrillRecordId: productionExecutionArchiveRecoveryDrillRecord.data.id,
      archiveRetrievalValidationRecordId: productionExecutionArchiveRetrievalValidationRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryAcceptanceRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archive recovery drill ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryAcceptanceRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryAcceptanceRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryClosureRecord.data).toMatchObject({
      provider: "NDB",
      archiveRecoveryAcceptanceRecordId: productionExecutionArchiveRecoveryAcceptanceRecord.data.id,
      archiveRecoveryDrillRecordId: productionExecutionArchiveRecoveryDrillRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryClosureRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archive recovery acceptance ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryClosureRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryClosureRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryAuditCertificationRecord.data).toMatchObject({
      provider: "NDB",
      archiveRecoveryClosureRecordId: productionExecutionArchiveRecoveryClosureRecord.data.id,
      archiveRecoveryAcceptanceRecordId: productionExecutionArchiveRecoveryAcceptanceRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryAuditCertificationRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archive recovery closure ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryAuditCertificationRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryAuditCertificationRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryFinalComplianceArchiveRecord.data).toMatchObject({
      provider: "NDB",
      archiveRecoveryAuditCertificationRecordId:
        productionExecutionArchiveRecoveryAuditCertificationRecord.data.id,
      archiveRecoveryClosureRecordId: productionExecutionArchiveRecoveryClosureRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryFinalComplianceArchiveRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archive recovery audit certification ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryFinalComplianceArchiveRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryFinalComplianceArchiveRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord.data).toMatchObject({
      provider: "NDB",
      finalComplianceArchiveRecordId: productionExecutionArchiveRecoveryFinalComplianceArchiveRecord.data.id,
      archiveRecoveryAuditCertificationRecordId:
        productionExecutionArchiveRecoveryAuditCertificationRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final compliance archive ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryOperationalContinuityRecord.data).toMatchObject({
      provider: "NDB",
      evidenceCustodyClosureRecordId: productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord.data.id,
      finalComplianceArchiveRecordId: productionExecutionArchiveRecoveryFinalComplianceArchiveRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryOperationalContinuityRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Evidence custody closure ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryOperationalContinuityRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryOperationalContinuityRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryServiceManagementHandoffRecord.data).toMatchObject({
      provider: "NDB",
      operationalContinuityRecordId: productionExecutionArchiveRecoveryOperationalContinuityRecord.data.id,
      evidenceCustodyClosureRecordId: productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryServiceManagementHandoffRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Operational continuity ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryServiceManagementHandoffRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryServiceManagementHandoffRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord.data).toMatchObject({
      provider: "NDB",
      serviceManagementHandoffRecordId: productionExecutionArchiveRecoveryServiceManagementHandoffRecord.data.id,
      operationalContinuityRecordId: productionExecutionArchiveRecoveryOperationalContinuityRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Service management handoff ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord.data).toMatchObject({
      provider: "NDB",
      supportOwnershipAcceptanceRecordId:
        productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord.data.id,
      serviceManagementHandoffRecordId: productionExecutionArchiveRecoveryServiceManagementHandoffRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Support ownership acceptance ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord.data.id }),
      ])
    );
    expect(productionExecutionArchiveRecoveryFinalOperationsHandoffRecord.data).toMatchObject({
      provider: "NDB",
      monitoringOwnershipClosureRecordId:
        productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord.data.id,
      supportOwnershipAcceptanceRecordId:
        productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord.data.id,
      status: "Blocked",
      provisioningEnabled: false,
      killSwitch: expect.objectContaining({ name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false }),
    });
    expect(productionExecutionArchiveRecoveryFinalOperationsHandoffRecord.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Monitoring ownership closure ready", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
    expect(productionExecutionArchiveRecoveryFinalOperationsHandoffRecords.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productionExecutionArchiveRecoveryFinalOperationsHandoffRecord.data.id }),
      ])
    );
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "platform-service.preflight.recorded", target: "app-postgres-dev" }),
        expect.objectContaining({ action: "platform-service.adapter-contract.reviewed", target: "app-postgres-dev" }),
        expect.objectContaining({ action: "provider-release-gate.reviewed", target: "NDB" }),
        expect.objectContaining({ action: "release-evidence.export.prepared", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.runbook.recorded", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.window.recorded", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.window-evidence.exported", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.evidence-review.recorded", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.execution-proposal.reviewed", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.execution-proposal.exported", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.execution-approval.recorded", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.rehearsal-packet.recorded", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.dry-run-checklist.recorded", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.evidence-ledger.recorded", target: "NDB" }),
        expect.objectContaining({ action: "controlled-lab-release.readiness-attestation.recorded", target: "NDB" }),
        expect.objectContaining({ action: "execution-broker.queue.recorded", target: "NDB" }),
        expect.objectContaining({ action: "execution-broker.dispatch-approval.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.lab-scope-activation.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.switch-review.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.switch-state-audit.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.controlled-switch-request.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.switch-handoff-package.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.switch-outcome.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.switch-closure.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.adapter-promotion-dossier.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-authorization.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-change-freeze.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-cab-handoff.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-cab-decision.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-implementation-hold.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-operator-assignment.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-execution-readiness.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-execution-authorization.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-change-ticket-lock.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-final-execution-packet.recorded", target: "NDB" }),
        expect.objectContaining({ action: "real-adapter.production-execution-hold-point.recorded", target: "NDB" }),
        expect.objectContaining({
          action: "real-adapter.production-execution-outcome-authorization.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-closure-authorization.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-closure-packet.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archival-handoff.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-retention-attestation.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-final-archive-certification.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-completion-dossier.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-operations-handover.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-support-readiness.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-service-acceptance.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-final-turnover.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-operational-closure.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-post-implementation-review.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-improvement-closure.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-final-acceptance-archive.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-readiness-archive-handoff.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-retrieval-validation.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-drill.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-acceptance.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-closure.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-audit-certification.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-final-compliance-archive.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-evidence-custody-closure.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-operational-continuity.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-service-management-handoff.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-support-ownership-acceptance.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-monitoring-ownership-closure.recorded",
          target: "NDB",
        }),
        expect.objectContaining({
          action: "real-adapter.production-execution-archive-recovery-final-operations-handoff.recorded",
          target: "NDB",
        }),
      ])
    );
  });

  it("records production readiness reviews", async () => {
    const review = await requestJson("/api/production-readiness/reviews", { method: "POST" });
    const reviews = await requestJson("/api/production-readiness/reviews");
    const auditEvents = await requestJson("/api/audit-events");

    expect(review.data).toMatchObject({
      status: "Blocked",
      reviewer: "platform.admin",
      provisioningEnabled: false,
    });
    expect(review.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "OIDC boundary", passed: false }),
        expect.objectContaining({ name: "Provisioning guardrail", passed: true }),
      ])
    );
    expect(review.data.evidence).toEqual(expect.arrayContaining([expect.stringContaining("Real provisioning remains disabled by default")]));
    expect(reviews.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: review.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "production-readiness.review.recorded", target: review.data.id })])
    );
  });

  it("records private-cloud lifecycle operations and audit exports", async () => {
    await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "ops-dev",
        templateId: "vm-app",
        owner: "demo.user",
        region: "Berlin Lab",
      }),
    });
    const operation = await requestJson("/api/private-cloud/lifecycle-operations", {
      method: "POST",
      body: JSON.stringify({ environmentName: "ops-dev", operation: "Extend" }),
    });
    const auditExport = await requestJson("/api/audit-exports", { method: "POST" });
    const retention = await requestJson("/api/audit/retention");
    const operations = await requestJson("/api/private-cloud/lifecycle-operations");
    const auditExports = await requestJson("/api/audit-exports");
    const auditEvents = await requestJson("/api/audit-events");

    expect(operation.data).toMatchObject({
      environmentName: "ops-dev",
      operation: "Extend",
      status: "Blocked",
      approvalRequired: true,
      provisioningEnabled: false,
    });
    expect(operation.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Production readiness reviewed", passed: false }),
        expect.objectContaining({ name: "Lifecycle proof verified", passed: false }),
      ])
    );
    expect(auditExport.data).toMatchObject({
      status: "Prepared",
      format: "JSONL",
      retentionEvents: 500,
      checksumAlgorithm: "sha256",
    });
    expect(auditExport.data.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(auditExport.data.manifest).toMatchObject({
      eventCount: expect.any(Number),
      retentionWindowEvents: 500,
      destinationRef: "not-configured",
    });
    expect(retention.data).toMatchObject({
      retentionEvents: 500,
      bounded: true,
      exportDestination: expect.objectContaining({ valid: true }),
    });
    expect(operations.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: operation.data.id })]));
    expect(auditExports.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: auditExport.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "private-cloud.lifecycle.requested", target: "ops-dev" }),
        expect.objectContaining({ action: "audit.export.prepared", target: auditExport.data.id }),
      ])
    );
  });

  it("advances, fails, and retries control-plane jobs", async () => {
    await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "queue-dev",
        templateId: "spring-postgres",
        owner: "demo.user",
        region: "Berlin Lab",
      }),
    });
    const jobs = await requestJson("/api/control-plane/jobs");
    const jobId = jobs.data[0].id;

    const validating = await requestJson(`/api/control-plane/jobs/${jobId}/advance`, { method: "POST" });
    const provisioning = await requestJson(`/api/control-plane/jobs/${jobId}/advance`, { method: "POST" });
    const failed = await requestJson(`/api/control-plane/jobs/${jobId}/fail`, {
      method: "POST",
      body: JSON.stringify({ reason: "simulated failure" }),
    });
    const retried = await requestJson(`/api/control-plane/jobs/${jobId}/retry`, { method: "POST" });

    expect(validating.data).toMatchObject({ state: "Validating" });
    expect(provisioning.data).toMatchObject({ state: "Provisioning", attempts: 1 });
    expect(failed.data).toMatchObject({ state: "Failed", lastError: "simulated failure" });
    expect(retried.data).toMatchObject({ state: "Queued" });
  });

  it("queues simulated destroy lifecycle jobs", async () => {
    await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "destroy-dev",
        templateId: "vm-app",
        owner: "demo.user",
        region: "Berlin Lab",
      }),
    });

    const destroyed = await requestJson("/api/environments/destroy-dev/destroy", { method: "POST" });
    const jobs = await requestJson("/api/control-plane/jobs");
    const destroyJob = jobs.data.find((job: { id: string }) => job.id === "cp-destroy-destroy-dev");

    expect(destroyed.data).toMatchObject({ name: "destroy-dev", status: "Destroying" });
    expect(destroyJob).toMatchObject({
      operation: "Destroy",
      state: "Destroying",
      provisioningEnabled: false,
    });
  });

  it("creates and decides approval requests", async () => {
    const created = await requestJson("/api/environments", {
      method: "POST",
      body: JSON.stringify({
        name: "ai-api-dev",
        templateId: "ai-endpoint",
        owner: "demo.user",
        region: "Berlin Lab",
        targets: ["AI Endpoint", "Storage"],
      }),
    });

    expect(created.data.environment).toMatchObject({
      name: "ai-api-dev",
      status: "Needs approval",
    });
    expect(created.data.approval).toMatchObject({
      environmentName: "ai-api-dev",
      status: "Pending",
    });

    const approvals = await requestJson("/api/approvals");
    const approvalId = approvals.data[0].id;
    const approved = await requestJson(`/api/approvals/${approvalId}/approve`, { method: "POST" });
    const detail = await requestJson("/api/environments/ai-api-dev");

    expect(approved.data).toMatchObject({ status: "Approved" });
    expect(detail.data.environment).toMatchObject({ status: "Provisioning" });
    expect(detail.data.approvals[0]).toMatchObject({ status: "Approved" });
  });

  it("records adapter enablement contract evidence while real mutations remain disabled", async () => {
    const record = await requestJson("/api/adapter-enablement/records", {
      method: "POST",
      body: JSON.stringify({
        provider: "NCI",
        rollbackOwner: "Cloud Operations",
      }),
    });
    const records = await requestJson("/api/adapter-enablement/records");
    const auditEvents = await requestJson("/api/audit-events");

    expect(record.data).toMatchObject({
      provider: "NCI",
      status: "Blocked",
      rollbackOwner: "Cloud Operations",
      provisioningEnabled: false,
      mutationOperationsBlocked: expect.arrayContaining(["create_vm", "delete_vm"]),
    });
    expect(record.data.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Approved lab scope", passed: false }),
        expect.objectContaining({ name: "Credential reference approved", passed: false }),
        expect.objectContaining({ name: "Real adapter disabled", passed: true }),
      ])
    );
    expect(records.data).toEqual(expect.arrayContaining([expect.objectContaining({ id: record.data.id })]));
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "adapter.enablement.review.recorded",
          target: "NCI",
        }),
      ])
    );
  });

  it("rejects unknown templates", async () => {
    await expectJson(
      "/api/environments",
      400,
      {
        error: {
          code: "template_not_found",
          message: "Template not found: missing",
        },
      },
      {
        method: "POST",
        body: JSON.stringify({
          name: "bad-dev",
          templateId: "missing",
          owner: "demo.user",
          region: "Berlin Lab",
        }),
      }
    );
  });

  async function requestJson(path: string, init?: RequestInit) {
    const response = await nodeRequest(path, init);
    return JSON.parse(response.body);
  }

  async function expectJson(path: string, status: number, body: unknown, init?: RequestInit) {
    const response = await nodeRequest(path, init);
    expect(response.status).toBe(status);
    expect(JSON.parse(response.body)).toEqual(body);
  }

  function configureAhvLabEnv(prismUrl: string) {
    process.env.APP_ENV = "lab";
    process.env.NDC_AHV_REAL_ADAPTER_ENABLED = "true";
    process.env.NDC_CONTROLLED_PROVISIONING_ENABLED = "true";
    process.env.NDC_AHV_LAB_LIFECYCLE_ENABLED = "true";
    process.env.NUTANIX_PRISM_CENTRAL_URL = prismUrl;
    process.env.NUTANIX_PRISM_USERNAME = "lab-user";
    process.env.NUTANIX_PRISM_PASSWORD = "placeholder-not-a-secret";
    process.env.NDC_AHV_ALLOWED_CLUSTER_UUID = "mock-cluster-berlin-01";
    process.env.NDC_AHV_ALLOWED_PROJECT_UUID = "mock-project-devcloud";
    process.env.NDC_AHV_ALLOWED_SUBNET_UUID = "mock-subnet-dev-segment";
    process.env.NDC_AHV_ALLOWED_IMAGE_UUID = "mock-image-rocky-9-hardened";
    process.env.NDC_AHV_VM_NAME_PREFIX = "ndc-lab-";
    process.env.NDC_AUTHORIZED_PENTEST_SCOPE_REF = "authorized-ahv-lab-scope.md";
    process.env.NDC_AUTHORIZED_PENTEST_SCOPE_ACTIVE = "true";
  }

  function resetAhvLabEnv() {
    delete process.env.APP_ENV;
    delete process.env.NDC_REQUIRE_TRUSTED_IDENTITY;
    delete process.env.NDC_RATE_LIMIT_PER_MINUTE;
    delete process.env.NDC_AHV_REAL_ADAPTER_ENABLED;
    delete process.env.NDC_CONTROLLED_PROVISIONING_ENABLED;
    delete process.env.NDC_AHV_LAB_LIFECYCLE_ENABLED;
    delete process.env.NUTANIX_PRISM_CENTRAL_URL;
    delete process.env.NUTANIX_PRISM_USERNAME;
    delete process.env.NUTANIX_PRISM_PASSWORD;
    delete process.env.NDC_AHV_ALLOWED_CLUSTER_UUID;
    delete process.env.NDC_AHV_ALLOWED_PROJECT_UUID;
    delete process.env.NDC_AHV_ALLOWED_SUBNET_UUID;
    delete process.env.NDC_AHV_ALLOWED_IMAGE_UUID;
    delete process.env.NDC_AHV_VM_NAME_PREFIX;
    delete process.env.NDC_AUTHORIZED_PENTEST_SCOPE_REF;
    delete process.env.NDC_AUTHORIZED_PENTEST_SCOPE_ACTIVE;
    delete process.env.NDC_PRISM_TLS_INSECURE;
  }

  async function nodeRequest(path: string, init?: RequestInit): Promise<{ status: number; body: string; headers: Record<string, string> }> {
    const url = new URL(`${baseUrl}${path}`);
    const body = typeof init?.body === "string" ? init.body : undefined;

    return new Promise((resolve, reject) => {
      const request = httpRequest(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname,
          method: init?.method ?? "GET",
          headers: {
            "Content-Type": "application/json",
            ...((init?.headers as Record<string, string> | undefined) ?? {}),
            ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
          },
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          response.on("end", () =>
            resolve({
              status: response.statusCode ?? 0,
              body: Buffer.concat(chunks).toString("utf8"),
              headers: response.headers as Record<string, string>,
            })
          );
        }
      );

      request.on("error", reject);
      if (body) {
        request.write(body);
      }
      request.end();
    });
  }
});
