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
    delete process.env.NDC_REQUIRE_TRUSTED_IDENTITY;
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
    delete process.env.NDC_REQUIRE_TRUSTED_IDENTITY;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("reports health and readiness", async () => {
    await expectJson("/healthz", 200, { data: { ok: true } });
    await expectJson("/readyz", 200, { data: { ready: true } });
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
      provisioningEnabled: false,
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
      provisioningEnabled: false,
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
        templateId: "spring-postgres",
        owner: "demo.user",
        region: "Berlin Lab",
      }),
    });

    expect(created.data.environment).toMatchObject({
      name: "api-created-dev",
      status: "Provisioning",
    });
    expect(created.data.jobs.length).toBeGreaterThan(0);

    const environments = await requestJson("/api/environments");
    const auditEvents = await requestJson("/api/audit-events");
    const controlPlaneJobs = await requestJson("/api/control-plane/jobs");

    expect(environments.data[0]).toMatchObject({ name: "api-created-dev" });
    expect(auditEvents.data[0]).toMatchObject({ action: "environment.requested" });
    expect(controlPlaneJobs.data[0]).toMatchObject({
      environmentName: "api-created-dev",
      state: "Queued",
      provisioningEnabled: false,
    });
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
        expect.objectContaining({ name: "Real mutation remains disabled", passed: true }),
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
    expect(review.data.evidence).toEqual(expect.arrayContaining([expect.stringContaining("Real provisioning remains disabled")]));
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
