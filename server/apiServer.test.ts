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
    expect(auditEvents.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ action: "platform-service.preflight.recorded", target: "app-postgres-dev" })])
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
