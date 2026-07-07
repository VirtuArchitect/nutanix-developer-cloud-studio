import { afterEach, describe, expect, it, vi } from "vitest";
import {
  checkApiHealth,
  createAdapterEnablementRecordViaApi,
  createAhvControlledProvisioningRunViaApi,
  createAhvCreateAdapterContractReviewViaApi,
  createAuditExportViaApi,
  createControlledLabExecutionApprovalViaApi,
  createControlledLabDryRunExecutionChecklistViaApi,
  createControlledLabExecutionEvidenceLedgerViaApi,
  createControlledLabExecutionReadinessAttestationViaApi,
  createControlledLabExecutionRehearsalPacketViaApi,
  createControlledLabDryRunWindowViaApi,
  createControlledLabReleaseRunbookViaApi,
  createExecutionBrokerDispatchApprovalViaApi,
  createExecutionBrokerQueueRecordViaApi,
  createLabEvidenceReviewViaApi,
  createLabExecutionProposalEnvelopeViaApi,
  createLabExecutionProposalExportViaApi,
  createLabWindowEvidenceExportViaApi,
  createManualRealAdapterSwitchReviewViaApi,
  createControlledProvisioningGateViaApi,
  createControlledCreateAuthorizationEnvelopeViaApi,
  createEnvironmentViaApi,
  createLabAuthorizationScopeViaApi,
  createLifecycleOperationViaApi,
  createPlatformServiceRequestViaApi,
  createPlatformServiceAdapterContractReviewViaApi,
  createPlatformServicePreflightRunViaApi,
  createProviderReleaseGateRecordViaApi,
  createProductionReadinessReviewViaApi,
  createReleaseEvidenceExportViaApi,
  createRealAdapterLabScopeActivationViaApi,
  createRealAdapterSwitchStateAuditPackageViaApi,
  createRollbackDestroyProofViaApi,
  createVmLifecycleProofViaApi,
  createVmSandboxDryRunViaApi,
  decideControlledProvisioningGateViaApi,
  fetchAhvControlledProvisioningRunsFromApi,
  fetchAhvCreateAdapterContractReviewsFromApi,
  fetchAdapterEnablementRecordsFromApi,
  fetchAuditExportsFromApi,
  fetchAuditRetentionDiagnosticsFromApi,
  fetchCredentialReferenceDiagnosticsFromApi,
  fetchControlledLabExecutionApprovalsFromApi,
  fetchControlledLabDryRunExecutionChecklistsFromApi,
  fetchControlledLabExecutionEvidenceLedgersFromApi,
  fetchControlledLabExecutionReadinessAttestationsFromApi,
  fetchControlledLabExecutionRehearsalPacketsFromApi,
  fetchControlledProvisioningGatesFromApi,
  fetchControlledCreateAuthorizationEnvelopesFromApi,
  fetchControlledLabDryRunWindowsFromApi,
  fetchControlledLabReleaseRunbooksFromApi,
  fetchControlPlaneJobsFromApi,
  fetchEnvironmentsFromApi,
  fetchExecutionBrokerDispatchApprovalsFromApi,
  fetchExecutionBrokerQueueRecordsFromApi,
  fetchLabAdaptersFromApi,
  fetchLabAuthorizationScopesFromApi,
  fetchLabEvidenceReviewsFromApi,
  fetchLabExecutionProposalEnvelopesFromApi,
  fetchLabExecutionProposalExportsFromApi,
  fetchLabWindowEvidenceExportsFromApi,
  fetchLabScopeDiagnosticsFromApi,
  fetchManualRealAdapterSwitchReviewsFromApi,
  fetchPolicyBundlesFromApi,
  fetchLifecycleOperationsFromApi,
  fetchPlatformConfigFromApi,
  fetchPlatformServiceAdapterContractReviewsFromApi,
  fetchPlatformServiceRequestsFromApi,
  fetchPlatformServicePreflightRunsFromApi,
  fetchProviderReleaseGateRecordsFromApi,
  fetchProviderReleaseReadinessSummaryFromApi,
  fetchPrismInventoryFromApi,
  fetchProvisioningAdaptersFromApi,
  fetchProductionReadinessReviewsFromApi,
  fetchReleaseEvidenceExportsFromApi,
  fetchRealAdapterLabScopeActivationsFromApi,
  fetchRealAdapterSwitchStateAuditPackagesFromApi,
  fetchRollbackDestroyProofsFromApi,
  fetchResourceProfilesFromApi,
  fetchSessionFromApi,
  fetchSessionDiagnosticsFromApi,
  fetchSystemStatusFromApi,
  fetchTemplateRegistryFromApi,
  fetchVmSandboxDryRunsFromApi,
  fetchVmLifecycleProofsFromApi,
  requestEnvironmentDestroyViaApi,
  importPrismInventoryViaApi,
  runResourceProfileActionViaApi,
  runLabDiscoveryViaApi,
  runControlPlaneJobActionViaApi,
  runIntegrationCheckViaApi,
  runTemplateRegistryActionViaApi,
  saveIntegrationConfigViaApi,
} from "./cloudStudioApi";

describe("cloudStudioApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports API mode when health endpoint responds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: { ok: true } })));

    await expect(checkApiHealth()).resolves.toEqual({
      mode: "api",
      label: "On-prem API connected",
    });
  });

  it("falls back to mock mode when health endpoint is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(checkApiHealth()).resolves.toEqual({
      mode: "mock",
      label: "Browser mock mode",
    });
  });

  it("fetches environments from the API envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: [{ name: "api-dev" }] })));

    await expect(fetchEnvironmentsFromApi()).resolves.toEqual([{ name: "api-dev" }]);
  });

  it("posts environment requests to the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { environment: { name: "api-dev" }, jobs: [] } }));
    vi.stubGlobal("fetch", fetchMock);

    await createEnvironmentViaApi({
      name: "api-dev",
      templateId: "spring-postgres",
      owner: "demo.user",
      region: "Berlin Lab",
      targets: ["Kubernetes"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/environments",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("api-dev"),
      })
    );
  });

  it("fetches the API session envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ data: { user: "platform.admin" } })));

    await expect(fetchSessionFromApi()).resolves.toEqual({ user: "platform.admin" });
  });

  it("fetches session diagnostics", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okResponse({
          data: {
            trustedHeaderMode: "Required",
            authorizationMatrix: [{ action: "Manage providers", roles: ["Platform Admin"] }],
          },
        })
      )
    );

    await expect(fetchSessionDiagnosticsFromApi()).resolves.toMatchObject({
      trustedHeaderMode: "Required",
      authorizationMatrix: expect.arrayContaining([expect.objectContaining({ action: "Manage providers" })]),
    });
  });

  it("saves and checks integration configuration", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { name: "NCI", status: "Configured" } }));
    vi.stubGlobal("fetch", fetchMock);

    await saveIntegrationConfigViaApi("NCI", {
      endpoint: "https://prism.lab.example",
      credentialProfile: "nci-readonly",
    });
    await fetchCredentialReferenceDiagnosticsFromApi();
    await runIntegrationCheckViaApi("NCI");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/integration-config/NCI",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("prism.lab.example"),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/provider-credentials/diagnostics",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/integrations/NCI/check",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches system status and runs lab discovery", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { provisioningEnabled: false } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchSystemStatusFromApi();
    await fetchLabAdaptersFromApi();
    await runLabDiscoveryViaApi("NCI");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/system/status", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/lab-adapters", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/lab-adapters/NCI/discover",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and imports Prism read-only inventory", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: { records: [], recordsImported: 0 } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPrismInventoryFromApi();
    await importPrismInventoryViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/prism/inventory", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/prism/inventory/import",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and advances control-plane jobs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [{ id: "cp-api-dev" }] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlPlaneJobsFromApi();
    await runControlPlaneJobActionViaApi("cp-api-dev", "advance");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/control-plane/jobs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/control-plane/jobs/cp-api-dev/advance",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates VM sandbox dry-run plans", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchVmSandboxDryRunsFromApi();
    await createVmSandboxDryRunViaApi({ environmentName: "vm-plan-dev", imageProfileId: "ahv-rocky-9-hardened" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/dry-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/dry-runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-plan-dev") })
    );
  });

  it("fetches, creates, and decides controlled provisioning gates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlledProvisioningGatesFromApi();
    await createControlledProvisioningGateViaApi({ dryRunPlanId: "vm-dryrun-1" });
    await decideControlledProvisioningGateViaApi("vm-controlled-1", "approve", "Operator approval recorded.");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/controlled-provisioning", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/controlled-provisioning",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-dryrun-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/vm-sandbox/controlled-provisioning/vm-controlled-1/approve",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("Operator approval recorded.") })
    );
  });

  it("fetches and creates controlled create authorization envelopes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlledCreateAuthorizationEnvelopesFromApi();
    await createControlledCreateAuthorizationEnvelopeViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/vm-sandbox/controlled-create-authorization", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/vm-sandbox/controlled-create-authorization",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates AHV create adapter contract reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAhvCreateAdapterContractReviewsFromApi();
    await createAhvCreateAdapterContractReviewViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/ahv/create-adapter-contracts", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/ahv/create-adapter-contracts",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and records lab authorization and VM lifecycle proof", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchLabAuthorizationScopesFromApi();
    await fetchLabScopeDiagnosticsFromApi();
    await createLabAuthorizationScopeViaApi({ pentestScopeStructurallyValid: true });
    await fetchVmLifecycleProofsFromApi();
    await createVmLifecycleProofViaApi({ gateId: "vm-controlled-1", rollbackVerified: true, destroyVerified: true });
    await fetchRollbackDestroyProofsFromApi();
    await createRollbackDestroyProofViaApi({ dryRunPlanId: "vm-dryrun-1", backupEvidenceReference: "backup-ref" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/lab-authorization/scopes", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/lab-authorization/diagnostics", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/lab-authorization/scopes",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("pentestScopeStructurallyValid") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/vm-lifecycle/proofs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "/api/vm-lifecycle/proofs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-controlled-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(6, "/api/vm-sandbox/rollback-destroy-proofs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      7,
      "/api/vm-sandbox/rollback-destroy-proofs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("backup-ref") })
    );
  });

  it("fetches and creates AHV controlled provisioning preflight runs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAhvControlledProvisioningRunsFromApi();
    await createAhvControlledProvisioningRunViaApi({ gateId: "vm-controlled-1", action: "Create VM" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/ahv/controlled-provisioning/runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/ahv/controlled-provisioning/runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("vm-controlled-1") })
    );
  });

  it("fetches and creates platform service requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServiceRequestsFromApi();
    await createPlatformServiceRequestViaApi({ kind: "NDB PostgreSQL", environmentName: "payments-dev" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/requests", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/requests",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("NDB PostgreSQL") })
    );
  });

  it("fetches and creates platform service preflight runs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServicePreflightRunsFromApi();
    await createPlatformServicePreflightRunViaApi({ requestId: "platform-service-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/preflight-runs", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/preflight-runs",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("platform-service-1") })
    );
  });

  it("fetches and creates platform service adapter contract reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPlatformServiceAdapterContractReviewsFromApi();
    await createPlatformServiceAdapterContractReviewViaApi({ requestId: "platform-service-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/platform-services/adapter-contracts", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/platform-services/adapter-contracts",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("platform-service-1") })
    );
  });

  it("fetches and creates provider release gate reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchProviderReleaseGateRecordsFromApi();
    await fetchProviderReleaseReadinessSummaryFromApi();
    await createProviderReleaseGateRecordViaApi({ provider: "NDB", releaseApprover: "platform.owner" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/provider-release-gates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/provider-release-readiness",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/provider-release-gates",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("platform.owner") })
    );
  });

  it("fetches and creates release evidence exports", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchReleaseEvidenceExportsFromApi();
    await createReleaseEvidenceExportViaApi({ gateId: "provider-release-ndb-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/release-evidence-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/release-evidence-exports",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("provider-release-ndb-1") })
    );
  });

  it("fetches and creates controlled lab release runbooks", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchControlledLabReleaseRunbooksFromApi();
    await createControlledLabReleaseRunbookViaApi({ provider: "NDB" });
    await fetchControlledLabDryRunWindowsFromApi();
    await createControlledLabDryRunWindowViaApi({ provider: "NDB", runbookId: "controlled-lab-runbook-ndb-1" });
    await fetchLabWindowEvidenceExportsFromApi();
    await createLabWindowEvidenceExportViaApi({ windowId: "controlled-lab-window-ndb-1" });
    await fetchLabEvidenceReviewsFromApi();
    await createLabEvidenceReviewViaApi({ exportId: "lab-window-evidence-export-ndb-1" });
    await fetchLabExecutionProposalEnvelopesFromApi();
    await createLabExecutionProposalEnvelopeViaApi({ reviewId: "lab-evidence-review-ndb-1" });
    await fetchLabExecutionProposalExportsFromApi();
    await createLabExecutionProposalExportViaApi({ envelopeId: "lab-execution-proposal-ndb-1" });
    await fetchControlledLabExecutionApprovalsFromApi();
    await createControlledLabExecutionApprovalViaApi({ proposalExportId: "lab-execution-proposal-export-ndb-1" });
    await fetchControlledLabExecutionRehearsalPacketsFromApi();
    await createControlledLabExecutionRehearsalPacketViaApi({ approvalGateId: "controlled-lab-execution-approval-ndb-1" });
    await fetchControlledLabDryRunExecutionChecklistsFromApi();
    await createControlledLabDryRunExecutionChecklistViaApi({ rehearsalPacketId: "controlled-lab-rehearsal-packet-ndb-1" });
    await fetchControlledLabExecutionEvidenceLedgersFromApi();
    await createControlledLabExecutionEvidenceLedgerViaApi({ dryRunChecklistId: "controlled-lab-dry-run-checklist-ndb-1" });
    await fetchControlledLabExecutionReadinessAttestationsFromApi();
    await createControlledLabExecutionReadinessAttestationViaApi({ evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-1" });
    await fetchExecutionBrokerQueueRecordsFromApi();
    await createExecutionBrokerQueueRecordViaApi({
      readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
      idempotencyKey: "ndb-controlled-lab-001",
    });
    await fetchExecutionBrokerDispatchApprovalsFromApi();
    await createExecutionBrokerDispatchApprovalViaApi({ brokerRecordId: "execution-broker-ndb-1" });
    await fetchRealAdapterLabScopeActivationsFromApi();
    await createRealAdapterLabScopeActivationViaApi({ dispatchApprovalId: "execution-broker-dispatch-approval-ndb-1" });
    await fetchManualRealAdapterSwitchReviewsFromApi();
    await createManualRealAdapterSwitchReviewViaApi({ activationId: "real-adapter-lab-scope-activation-ndb-1" });
    await fetchRealAdapterSwitchStateAuditPackagesFromApi();
    await createRealAdapterSwitchStateAuditPackageViaApi({ switchReviewId: "manual-real-adapter-switch-review-ndb-1" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/controlled-lab-release/runbooks", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/controlled-lab-release/runbooks",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("NDB") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/controlled-lab-release/windows", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/controlled-lab-release/windows",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-runbook-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/api/controlled-lab-release/window-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      "/api/controlled-lab-release/window-exports",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-window-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(7, "/api/controlled-lab-release/evidence-reviews", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      8,
      "/api/controlled-lab-release/evidence-reviews",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-window-evidence-export-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(9, "/api/controlled-lab-release/proposal-envelopes", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      10,
      "/api/controlled-lab-release/proposal-envelopes",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-evidence-review-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(11, "/api/controlled-lab-release/proposal-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      12,
      "/api/controlled-lab-release/proposal-exports",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-execution-proposal-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(13, "/api/controlled-lab-release/execution-approvals", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      14,
      "/api/controlled-lab-release/execution-approvals",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("lab-execution-proposal-export-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(15, "/api/controlled-lab-release/rehearsal-packets", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      16,
      "/api/controlled-lab-release/rehearsal-packets",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-execution-approval-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(17, "/api/controlled-lab-release/dry-run-checklists", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      18,
      "/api/controlled-lab-release/dry-run-checklists",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-rehearsal-packet-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(19, "/api/controlled-lab-release/evidence-ledgers", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      20,
      "/api/controlled-lab-release/evidence-ledgers",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-dry-run-checklist-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(21, "/api/controlled-lab-release/readiness-attestations", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      22,
      "/api/controlled-lab-release/readiness-attestations",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("controlled-lab-evidence-ledger-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(23, "/api/execution-broker/queue", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      24,
      "/api/execution-broker/queue",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("ndb-controlled-lab-001") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(25, "/api/execution-broker/dispatch-approvals", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      26,
      "/api/execution-broker/dispatch-approvals",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("execution-broker-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(27, "/api/real-adapter/lab-scope-activations", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      28,
      "/api/real-adapter/lab-scope-activations",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("execution-broker-dispatch-approval-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(29, "/api/real-adapter/switch-reviews", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      30,
      "/api/real-adapter/switch-reviews",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("real-adapter-lab-scope-activation-ndb-1") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(31, "/api/real-adapter/switch-state-audit-packages", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      32,
      "/api/real-adapter/switch-state-audit-packages",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("manual-real-adapter-switch-review-ndb-1") })
    );
  });

  it("fetches and creates production readiness reviews", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchProductionReadinessReviewsFromApi();
    await createProductionReadinessReviewViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/production-readiness/reviews", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/production-readiness/reviews",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates private-cloud operations and audit exports", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchLifecycleOperationsFromApi();
    await createLifecycleOperationViaApi({ environmentName: "payments-dev", operation: "Extend" });
    await fetchAuditExportsFromApi();
    await fetchAuditRetentionDiagnosticsFromApi();
    await createAuditExportViaApi();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/private-cloud/lifecycle-operations", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/private-cloud/lifecycle-operations",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("payments-dev") })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/audit-exports", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(4, "/api/audit/retention", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "/api/audit-exports",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches provider inventory and requests environment destroy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchResourceProfilesFromApi();
    await fetchPlatformConfigFromApi();
    await fetchProvisioningAdaptersFromApi();
    await requestEnvironmentDestroyViaApi("api-dev");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/resource-profiles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/platform/config", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/provisioning/adapters", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/environments/api-dev/destroy",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("fetches and creates adapter enablement records", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchAdapterEnablementRecordsFromApi();
    await createAdapterEnablementRecordViaApi({ provider: "NCI", rollbackOwner: "Cloud Operations" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/adapter-enablement/records", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/adapter-enablement/records",
      expect.objectContaining({ method: "POST", body: expect.stringContaining("Cloud Operations") })
    );
  });

  it("fetches and updates registry governance records", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchPolicyBundlesFromApi();
    await fetchTemplateRegistryFromApi();
    await runTemplateRegistryActionViaApi("regulated-db", "submit");
    await runResourceProfileActionViaApi("nus-object-dev", "approve");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/policy-bundles", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/registry/templates", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/registry/templates/regulated-db/submit",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/resource-profiles/nus-object-dev/approve",
      expect.objectContaining({ method: "POST" })
    );
  });
});

function okResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  };
}
