import {
  Activity,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Code2,
  ExternalLink,
  Gauge,
  Layers3,
  LockKeyhole,
  Network,
  Pencil,
  Play,
  RefreshCw,
  Settings,
  ShieldCheck,
  TerminalSquare,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import cloudVisual from "./assets/developer-cloud-visual.png";
import primaryLogo from "./assets/logo-primary.svg";
import {
  allTargets,
  integrations,
  provisioningEvents,
  targetIcons,
  templates,
  type Environment,
  type ApprovalRequest,
  type ControlledProvisioningGate,
  type ControlPlaneJob,
  type Integration,
  type IntegrationConfig,
  type JobState,
  type LabAdapterSnapshot,
  type LabAuthorizationScope,
  platformConfig as defaultPlatformConfig,
  policyBundles as defaultPolicyBundles,
  templateRegistry as defaultTemplateRegistry,
  type PlatformSession,
  type PlatformConfig,
  type PlatformServiceKind,
  type PlatformServiceRequest,
  type PolicyBundle,
  type PrismInventoryImportResult,
  type PrismInventoryRecord,
  type ProvisioningAdapterReadiness,
  type RegistryStatus,
  resourceProfiles as defaultResourceProfiles,
  type ResourceProfile,
  type SystemStatus,
  type TemplateRegistryEntry,
  type Target,
  type Template,
  type TemplateGovernance,
  type TemplateTier,
  type VmSandboxDryRunPlan,
  type VmSandboxDryRunRequest,
  type VmLifecycleProof,
  type View,
} from "./data/cloudStudioData";
import {
  estimateMonthlyCost,
  getProvisioningSnapshot,
  loadEnvironments,
  loadTemplateGovernance,
  saveEnvironments,
  saveTemplateGovernance,
  updateEnvironmentStatus,
  upsertRequestedEnvironment,
} from "./services/provisioningService";
import {
  checkApiHealth,
  createLabAuthorizationScopeViaApi,
  createControlledProvisioningGateViaApi,
  createEnvironmentViaApi,
  createPlatformServiceRequestViaApi,
  createVmLifecycleProofViaApi,
  createVmSandboxDryRunViaApi,
  decideControlledProvisioningGateViaApi,
  decideApprovalViaApi,
  fetchControlPlaneJobsFromApi,
  fetchControlledProvisioningGatesFromApi,
  fetchEnvironmentsFromApi,
  fetchEnvironmentDetailFromApi,
  fetchApprovalsFromApi,
  fetchIntegrationConfigsFromApi,
  fetchIntegrationsFromApi,
  fetchLabAuthorizationScopesFromApi,
  fetchLabAdaptersFromApi,
  fetchPlatformConfigFromApi,
  fetchPlatformServiceRequestsFromApi,
  fetchPolicyBundlesFromApi,
  fetchPrismInventoryFromApi,
  fetchProvisioningAdaptersFromApi,
  fetchResourceProfilesFromApi,
  fetchSessionFromApi,
  fetchSystemStatusFromApi,
  fetchTemplateRegistryFromApi,
  fetchVmSandboxDryRunsFromApi,
  fetchVmLifecycleProofsFromApi,
  requestEnvironmentDestroyViaApi,
  importPrismInventoryViaApi,
  runResourceProfileActionViaApi,
  runIntegrationCheckViaApi,
  runControlPlaneJobActionViaApi,
  runLabDiscoveryViaApi,
  runTemplateRegistryActionViaApi,
  saveIntegrationConfigViaApi,
  type ApiHealth,
  type EnvironmentDetail,
} from "./services/cloudStudioApi";

type AdminTab = "overview" | "providers" | "control" | "governance" | "templates";

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [selectedTargets, setSelectedTargets] = useState<Target[]>(templates[0].targets);
  const [environmentName, setEnvironmentName] = useState("checkout-api-dev");
  const [region, setRegion] = useState("Berlin Lab");
  const [jobState, setJobState] = useState<JobState>("Idle");
  const [jobStep, setJobStep] = useState(0);
  const [environments, setEnvironments] = useState<Environment[]>(() => loadEnvironments());
  const [runtimeIntegrations, setRuntimeIntegrations] = useState<Integration[]>(integrations);
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig[]>(() =>
    deriveMockIntegrationConfigs(integrations)
  );
  const [session, setSession] = useState<PlatformSession>(mockSession);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(() =>
    createMockSystemStatus(mockSession, deriveMockIntegrationConfigs(integrations), deriveMockLabAdapters(integrations))
  );
  const [labAdapters, setLabAdapters] = useState<LabAdapterSnapshot[]>(() => deriveMockLabAdapters(integrations));
  const [labAuthorizationScopes, setLabAuthorizationScopes] = useState<LabAuthorizationScope[]>([]);
  const [prismInventory, setPrismInventory] = useState<PrismInventoryRecord[]>([]);
  const [prismInventoryImport, setPrismInventoryImport] = useState<PrismInventoryImportResult | undefined>();
  const [resourceProfiles, setResourceProfiles] = useState<ResourceProfile[]>(defaultResourceProfiles);
  const [policyBundles, setPolicyBundles] = useState<PolicyBundle[]>(defaultPolicyBundles);
  const [templateRegistry, setTemplateRegistry] = useState<TemplateRegistryEntry[]>(defaultTemplateRegistry);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(defaultPlatformConfig);
  const [provisioningAdapters, setProvisioningAdapters] = useState<ProvisioningAdapterReadiness[]>(() =>
    deriveMockProvisioningAdapters(integrations)
  );
  const [controlPlaneJobs, setControlPlaneJobs] = useState<ControlPlaneJob[]>([]);
  const [vmSandboxDryRuns, setVmSandboxDryRuns] = useState<VmSandboxDryRunPlan[]>([]);
  const [controlledProvisioningGates, setControlledProvisioningGates] = useState<ControlledProvisioningGate[]>([]);
  const [platformServiceRequests, setPlatformServiceRequests] = useState<PlatformServiceRequest[]>([]);
  const [vmLifecycleProofs, setVmLifecycleProofs] = useState<VmLifecycleProof[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => deriveMockApprovals(loadEnvironments()));
  const [selectedEnvironmentName, setSelectedEnvironmentName] = useState("payments-dev");
  const [environmentDetail, setEnvironmentDetail] = useState<EnvironmentDetail | null>(null);
  const [templateGovernance, setTemplateGovernance] = useState<TemplateGovernance>(() =>
    loadTemplateGovernance(templates)
  );
  const [apiHealth, setApiHealth] = useState<ApiHealth>({ mode: "mock", label: "Checking API" });
  const [requestError, setRequestError] = useState("");

  const selectedTemplate = enrichTemplate(templates.find((template) => template.id === selectedTemplateId) ?? templates[0], templateGovernance);
  const estimatedCost = useMemo(() => estimateMonthlyCost(selectedTemplate, selectedTargets), [selectedTargets, selectedTemplate]);

  useEffect(() => {
    if (apiHealth.mode === "mock") {
      saveEnvironments(environments);
      setApprovals(deriveMockApprovals(environments));
    }
  }, [apiHealth.mode, environments]);

  useEffect(() => {
    saveTemplateGovernance(templateGovernance);
  }, [templateGovernance]);

  useEffect(() => {
    if (apiHealth.mode === "mock") {
      setSystemStatus(createMockSystemStatus(session, integrationConfigs, labAdapters));
    }
  }, [apiHealth.mode, integrationConfigs, labAdapters, session]);

  useEffect(() => {
    let active = true;

    async function hydrateFromApi() {
      const health = await checkApiHealth();
      if (!active) {
        return;
      }

      setApiHealth(health);

      if (health.mode === "api") {
        try {
          const [
            apiEnvironments,
            apiIntegrations,
            apiApprovals,
            apiIntegrationConfigs,
            apiSession,
            apiSystemStatus,
            apiLabAdapters,
            apiLabAuthorizationScopes,
            apiPrismInventory,
            apiControlPlaneJobs,
            apiResourceProfiles,
            apiPolicyBundles,
            apiTemplateRegistry,
            apiPlatformConfig,
            apiProvisioningAdapters,
            apiVmSandboxDryRuns,
            apiControlledProvisioningGates,
            apiPlatformServiceRequests,
            apiVmLifecycleProofs,
          ] = await Promise.all([
            fetchEnvironmentsFromApi(),
            fetchIntegrationsFromApi(),
            fetchApprovalsFromApi(),
            fetchIntegrationConfigsFromApi(),
            fetchSessionFromApi(),
            fetchSystemStatusFromApi(),
            fetchLabAdaptersFromApi(),
            fetchLabAuthorizationScopesFromApi(),
            fetchPrismInventoryFromApi(),
            fetchControlPlaneJobsFromApi(),
            fetchResourceProfilesFromApi(),
            fetchPolicyBundlesFromApi(),
            fetchTemplateRegistryFromApi(),
            fetchPlatformConfigFromApi(),
            fetchProvisioningAdaptersFromApi(),
            fetchVmSandboxDryRunsFromApi(),
            fetchControlledProvisioningGatesFromApi(),
            fetchPlatformServiceRequestsFromApi(),
            fetchVmLifecycleProofsFromApi(),
          ]);
          if (active) {
            setEnvironments(apiEnvironments);
            setRuntimeIntegrations(apiIntegrations);
            setApprovals(apiApprovals);
            setIntegrationConfigs(apiIntegrationConfigs);
            setSession(apiSession);
            setSystemStatus(apiSystemStatus);
            setLabAdapters(apiLabAdapters);
            setLabAuthorizationScopes(apiLabAuthorizationScopes);
            setPrismInventory(apiPrismInventory.records);
            setPrismInventoryImport(apiPrismInventory.lastImport);
            setControlPlaneJobs(apiControlPlaneJobs);
            setResourceProfiles(apiResourceProfiles);
            setPolicyBundles(apiPolicyBundles);
            setTemplateRegistry(apiTemplateRegistry);
            setPlatformConfig(apiPlatformConfig);
            setProvisioningAdapters(apiProvisioningAdapters);
            setVmSandboxDryRuns(apiVmSandboxDryRuns);
            setControlledProvisioningGates(apiControlledProvisioningGates);
            setPlatformServiceRequests(apiPlatformServiceRequests);
            setVmLifecycleProofs(apiVmLifecycleProofs);
            setSelectedEnvironmentName(apiEnvironments[0]?.name ?? "");
          }
        } catch {
          if (active) {
            setApiHealth({ mode: "mock", label: "Browser mock mode" });
            setApprovals(deriveMockApprovals(environments));
          }
        }
      }
    }

    void hydrateFromApi();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (jobState !== "Queued" && jobState !== "Running") {
      return;
    }

    const snapshot = getProvisioningSnapshot(jobStep, selectedTargets);
    if (snapshot.complete) {
      setJobState(snapshot.jobState);
      const nextEnvironmentStatus = snapshot.environmentStatus;
      if (nextEnvironmentStatus) {
        setEnvironments((current) => updateEnvironmentStatus(current, environmentName, nextEnvironmentStatus));
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      setJobStep((current) => current + 1);
      setJobState("Running");
    }, provisioningEvents[jobStep].durationMs);

    return () => window.clearTimeout(timeout);
  }, [environmentName, jobState, jobStep, selectedTargets]);

  function selectTemplate(id: string) {
    const template = templates.find((item) => item.id === id) ?? templates[0];
    setSelectedTemplateId(template.id);
    setSelectedTargets(template.targets);
    setView("create");
  }

  function openTemplate(id: string) {
    setSelectedTemplateId(id);
    setView("template");
  }

  function toggleTarget(target: Target) {
    setSelectedTargets((current) =>
      current.includes(target) ? current.filter((item) => item !== target) : [...current, target]
    );
  }

  async function launchEnvironment() {
    setRequestError("");
    setJobState("Queued");
    setJobStep(0);

    if (apiHealth.mode === "api") {
      try {
        const result = await createEnvironmentViaApi({
          name: environmentName,
          templateId: selectedTemplate.id,
          owner: "demo.user",
          region,
          targets: selectedTargets,
        });
        setEnvironments((current) => [
          result.environment,
          ...current.filter((environment) => environment.name !== result.environment.name),
        ]);
        setSelectedEnvironmentName(result.environment.name);
        setControlPlaneJobs(await fetchControlPlaneJobsFromApi());
        if (result.approval) {
          setApprovals((current) => [result.approval as ApprovalRequest, ...current]);
        }
        if (result.environment.status === "Needs approval") {
          setJobState("Approval");
        }
      } catch {
        setRequestError("API request failed. Falling back to browser mock mode for this request.");
        setApiHealth({ mode: "mock", label: "Browser mock mode" });
        setEnvironments((current) => createMockEnvironment(current));
      }
    } else {
      setEnvironments((current) => {
        const next = createMockEnvironment(current);
        const created = next.find((environment) => environment.name === environmentName);
        if (created) {
          setControlPlaneJobs((jobs) => [
            createMockControlPlaneJob(created, selectedTemplate, selectedTargets),
            ...jobs.filter((job) => job.environmentName !== created.name),
          ]);
        }
        return next;
      });
    }

    setView("environment");
  }

  function createMockEnvironment(current: Environment[]) {
    return upsertRequestedEnvironment(current, {
      name: environmentName,
      template: selectedTemplate.name,
      owner: "demo.user",
      region,
      cost: estimatedCost,
    });
  }

  async function refreshApiState(environmentNameToRefresh = selectedEnvironmentName) {
    if (apiHealth.mode !== "api") {
      return;
    }

    const [
      apiEnvironments,
      apiIntegrations,
      apiApprovals,
      apiIntegrationConfigs,
      apiSession,
      apiSystemStatus,
      apiLabAdapters,
      apiLabAuthorizationScopes,
      apiPrismInventory,
      apiControlPlaneJobs,
      apiResourceProfiles,
      apiPolicyBundles,
      apiTemplateRegistry,
      apiPlatformConfig,
      apiProvisioningAdapters,
      apiVmSandboxDryRuns,
      apiControlledProvisioningGates,
      apiPlatformServiceRequests,
      apiVmLifecycleProofs,
    ] = await Promise.all([
      fetchEnvironmentsFromApi(),
      fetchIntegrationsFromApi(),
      fetchApprovalsFromApi(),
      fetchIntegrationConfigsFromApi(),
      fetchSessionFromApi(),
      fetchSystemStatusFromApi(),
      fetchLabAdaptersFromApi(),
      fetchLabAuthorizationScopesFromApi(),
      fetchPrismInventoryFromApi(),
      fetchControlPlaneJobsFromApi(),
      fetchResourceProfilesFromApi(),
      fetchPolicyBundlesFromApi(),
      fetchTemplateRegistryFromApi(),
      fetchPlatformConfigFromApi(),
      fetchProvisioningAdaptersFromApi(),
      fetchVmSandboxDryRunsFromApi(),
      fetchControlledProvisioningGatesFromApi(),
      fetchPlatformServiceRequestsFromApi(),
      fetchVmLifecycleProofsFromApi(),
    ]);
    setEnvironments(apiEnvironments);
    setRuntimeIntegrations(apiIntegrations);
    setApprovals(apiApprovals);
    setIntegrationConfigs(apiIntegrationConfigs);
    setSession(apiSession);
    setSystemStatus(apiSystemStatus);
    setLabAdapters(apiLabAdapters);
    setLabAuthorizationScopes(apiLabAuthorizationScopes);
    setPrismInventory(apiPrismInventory.records);
    setPrismInventoryImport(apiPrismInventory.lastImport);
    setControlPlaneJobs(apiControlPlaneJobs);
    setResourceProfiles(apiResourceProfiles);
    setPolicyBundles(apiPolicyBundles);
    setTemplateRegistry(apiTemplateRegistry);
    setPlatformConfig(apiPlatformConfig);
    setProvisioningAdapters(apiProvisioningAdapters);
    setVmSandboxDryRuns(apiVmSandboxDryRuns);
    setControlledProvisioningGates(apiControlledProvisioningGates);
    setPlatformServiceRequests(apiPlatformServiceRequests);
    setVmLifecycleProofs(apiVmLifecycleProofs);

    if (environmentNameToRefresh) {
      const detail = await fetchEnvironmentDetailFromApi(environmentNameToRefresh);
      setEnvironmentDetail(detail);
    }
  }

  async function openEnvironmentDetail(name: string) {
    setSelectedEnvironmentName(name);
    if (apiHealth.mode === "api") {
      try {
        setEnvironmentDetail(await fetchEnvironmentDetailFromApi(name));
      } catch {
        setEnvironmentDetail(createMockEnvironmentDetail(environments, approvals, name));
      }
    } else {
      setEnvironmentDetail(createMockEnvironmentDetail(environments, approvals, name));
    }
    setView("environmentDetail");
  }

  async function decideApproval(approvalId: string, decision: "approve" | "reject") {
    if (apiHealth.mode === "api") {
      const updated = await decideApprovalViaApi(approvalId, decision);
      await refreshApiState(updated.environmentName);
      return;
    }

    setApprovals((current) =>
      current.map((approval) =>
        approval.id === approvalId
          ? {
              ...approval,
              status: decision === "approve" ? "Approved" : "Rejected",
              decidedAt: new Date().toISOString(),
              decidedBy: "platform.admin",
            }
          : approval
      )
    );
    const approval = approvals.find((item) => item.id === approvalId);
    if (approval) {
      setEnvironments((current) =>
        updateEnvironmentStatus(current, approval.environmentName, decision === "approve" ? "Provisioning" : "Failed")
      );
      setEnvironmentDetail(
        createMockEnvironmentDetail(
          updateEnvironmentStatus(environments, approval.environmentName, decision === "approve" ? "Provisioning" : "Failed"),
          approvals,
          approval.environmentName
        )
      );
    }
  }

  async function saveIntegrationConfig(
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) {
    if (apiHealth.mode === "api") {
      const updated = await saveIntegrationConfigViaApi(integrationName, payload);
      setIntegrationConfigs((current) => replaceIntegrationConfig(current, updated));
      return;
    }

    setIntegrationConfigs((current) =>
      replaceIntegrationConfig(current, {
        ...(current.find((item) => item.name === integrationName) ?? createEmptyIntegrationConfig(integrationName)),
        ...payload,
        status: payload.endpoint || payload.credentialProfile ? "Configured" : "Not configured",
        message: "Configuration saved in browser mock mode.",
      })
    );
  }

  async function runIntegrationCheck(integrationName: string) {
    if (apiHealth.mode === "api") {
      const updated = await runIntegrationCheckViaApi(integrationName);
      setIntegrationConfigs((current) => replaceIntegrationConfig(current, updated));
      setSystemStatus(await fetchSystemStatusFromApi());
      return;
    }

    setIntegrationConfigs((current) => {
      const existing = current.find((item) => item.name === integrationName) ?? createEmptyIntegrationConfig(integrationName);
      const reachable = Boolean(existing.endpoint && existing.credentialProfile);
      return replaceIntegrationConfig(current, {
        ...existing,
        status: reachable ? "Reachable" : "Failed",
        lastCheckedAt: new Date().toISOString(),
        message: reachable
          ? `${integrationName} mock readiness check passed.`
          : `${integrationName} needs endpoint and credential profile values.`,
      });
    });
  }

  async function runLabDiscovery(adapterName: string) {
    if (apiHealth.mode === "api") {
      const updated = await runLabDiscoveryViaApi(adapterName);
      setLabAdapters((current) => replaceLabAdapter(current, updated));
      setSystemStatus(await fetchSystemStatusFromApi());
      return;
    }

    setLabAdapters((current) => {
      const adapter = current.find((item) => item.name === adapterName) ?? createEmptyLabAdapter(adapterName);
      const config = integrationConfigs.find((item) => item.name === adapterName);
      const readOnlyCandidate = adapterName === "NCI" && config?.status === "Reachable";
      const updated: LabAdapterSnapshot = {
        ...adapter,
        mode: readOnlyCandidate ? "Read-only candidate" : "Configured",
        inventoryCount: readOnlyCandidate ? 12 : 0,
        lastDiscoveryAt: new Date().toISOString(),
        message: readOnlyCandidate
          ? "Read-only Prism Central discovery simulated successfully. Provisioning remains disabled."
          : "Discovery requires a reachable integration config and documented lab scope.",
      };
      return replaceLabAdapter(current, updated);
    });
  }

  async function importPrismInventory() {
    if (apiHealth.mode === "api") {
      await importPrismInventoryViaApi();
      await refreshApiState();
      return;
    }

    const importedAt = new Date().toISOString();
    const records = createMockPrismInventoryRecords(platformConfig, importedAt);
    setPrismInventory(records);
    setPrismInventoryImport({
      adapter: "NCI",
      mode: "Mock read-only",
      readOnly: true,
      provisioningEnabled: false,
      importedAt,
      recordsImported: records.length,
      profileCandidates: records.filter((record) => record.profileCandidate).length,
      scope: {
        endpoint: platformConfig.prismCentralUrl || "mock://prism-central",
        credentialProfile: platformConfig.credentialReference,
        project: platformConfig.defaultProject,
        cluster: platformConfig.defaultCluster,
        network: platformConfig.networkProfile,
        authorizedScopeRef: "Browser mock mode / lab authorization pending",
        realAdapterEnabled: false,
      },
      evidence: "Browser mock Prism inventory import completed. No live endpoint was called.",
      mutationOperationsBlocked: ["create_vm", "clone_vm", "delete_vm", "power_on", "power_off", "update_network"],
    });
    setLabAdapters((current) =>
      replaceLabAdapter(current, {
        ...(current.find((item) => item.name === "NCI") ?? createEmptyLabAdapter("NCI")),
        mode: "Read-only candidate",
        inventoryCount: records.length,
        lastDiscoveryAt: importedAt,
        message: "Browser mock Prism inventory imported. Provisioning remains disabled.",
      })
    );
  }

  async function runControlPlaneJobAction(jobId: string, action: "advance" | "retry" | "fail") {
    if (apiHealth.mode === "api") {
      await runControlPlaneJobActionViaApi(jobId, action, "Manual failure simulation from admin console.");
      await refreshApiState();
      return;
    }

    setControlPlaneJobs((current) =>
      current.map((job) => (job.id === jobId ? transitionMockControlPlaneJob(job, action) : job))
    );
  }

  async function createVmSandboxDryRun() {
    const payload = {
      environmentName: "vm-sandbox-dry-run",
      owner: session.user,
      imageProfileId: "ahv-rocky-9-hardened",
      project: platformConfig.defaultProject,
      cluster: platformConfig.defaultCluster,
      network: platformConfig.networkProfile,
      category: "Lifecycle:30-day-expiry",
      cpu: 2,
      memoryGb: 8,
      diskGb: 80,
      expiryDays: 30,
    };

    if (apiHealth.mode === "api") {
      const plan = await createVmSandboxDryRunViaApi(payload);
      await refreshApiState();
      setVmSandboxDryRuns((current) => [plan, ...current.filter((item) => item.id !== plan.id)]);
      return;
    }

    setVmSandboxDryRuns((current) => [createMockVmSandboxDryRun(payload, resourceProfiles, platformConfig, templateRegistry, session.user), ...current]);
  }

  async function requestControlledProvisioningGate() {
    const latest = vmSandboxDryRuns[0];
    if (!latest) {
      await createVmSandboxDryRun();
      return;
    }

    if (apiHealth.mode === "api") {
      const gate = await createControlledProvisioningGateViaApi({ dryRunPlanId: latest.id });
      await refreshApiState();
      setControlledProvisioningGates((current) => [gate, ...current.filter((item) => item.id !== gate.id)]);
      return;
    }

    setControlledProvisioningGates((current) => [
      createMockControlledProvisioningGate(latest, session.user),
      ...current.filter((item) => item.dryRunPlanId !== latest.id),
    ]);
  }

  async function decideControlledProvisioningGate(gateId: string, decision: "approve" | "reject") {
    if (apiHealth.mode === "api") {
      const gate = await decideControlledProvisioningGateViaApi(
        gateId,
        decision,
        decision === "approve" ? "Operator approval recorded from Admin Control Plane." : "Operator rejected controlled create."
      );
      await refreshApiState();
      setControlledProvisioningGates((current) => current.map((item) => (item.id === gate.id ? gate : item)));
      return;
    }

    setControlledProvisioningGates((current) =>
      current.map((gate) =>
        gate.id === gateId
          ? evaluateMockControlledProvisioningGate({
              ...gate,
              approval: {
                status: decision === "approve" ? "Approved" : "Rejected",
                decidedBy: session.user,
                decidedAt: new Date().toISOString(),
                evidence:
                  decision === "approve"
                    ? "Operator approval recorded from Admin Control Plane."
                    : "Operator rejected controlled create.",
              },
              updatedAt: new Date().toISOString(),
            })
          : gate
      )
    );
  }

  async function recordLabAuthorizationScope() {
    const payload = {
      pentestScopeReference: "Authorized lab scope / controlled provisioning test window",
      pentestScopeStructurallyValid: true,
    };

    if (apiHealth.mode === "api") {
      const scope = await createLabAuthorizationScopeViaApi(payload);
      await refreshApiState();
      setLabAuthorizationScopes((current) => [scope, ...current.filter((item) => item.id !== scope.id)]);
      return;
    }

    setLabAuthorizationScopes((current) => [createMockLabAuthorizationScope(session.user, platformConfig), ...current]);
  }

  async function recordVmLifecycleProof() {
    const gate = controlledProvisioningGates[0];
    if (!gate) {
      return;
    }

    const payload = {
      gateId: gate.id,
      rollbackVerified: true,
      destroyVerified: true,
      evidence: ["Operator observed controlled create, rollback, and destroy workflow evidence."],
    };

    if (apiHealth.mode === "api") {
      const proof = await createVmLifecycleProofViaApi(payload);
      await refreshApiState();
      setVmLifecycleProofs((current) => [proof, ...current.filter((item) => item.id !== proof.id)]);
      return;
    }

    setVmLifecycleProofs((current) => [createMockVmLifecycleProof(gate, session.user), ...current]);
  }

  async function createPlatformServiceRequest(kind: PlatformServiceKind) {
    const payload = {
      kind,
      owner: session.user,
      environmentName: selectedEnvironmentName || environments[0]?.name || "platform-services-dev",
    };

    if (apiHealth.mode === "api") {
      const serviceRequest = await createPlatformServiceRequestViaApi(payload);
      await refreshApiState();
      setPlatformServiceRequests((current) => [serviceRequest, ...current.filter((item) => item.id !== serviceRequest.id)]);
      return;
    }

    setPlatformServiceRequests((current) => [
      createMockPlatformServiceRequest(payload, resourceProfiles, vmLifecycleProofs, session.user),
      ...current,
    ]);
  }

  async function requestEnvironmentDestroy(name: string) {
    if (apiHealth.mode === "api") {
      await requestEnvironmentDestroyViaApi(name);
      await refreshApiState(name);
      return;
    }

    setEnvironments((current) =>
      current.map((environment) =>
        environment.name === name ? { ...environment, status: "Destroying" as const } : environment
      )
    );
    const environment = environments.find((item) => item.name === name);
    if (environment) {
      setControlPlaneJobs((current) => [createMockDestroyControlPlaneJob(environment), ...current]);
    }
  }

  async function runTemplateRegistryAction(
    templateId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) {
    if (apiHealth.mode === "api") {
      const updated = await runTemplateRegistryActionViaApi(templateId, action);
      setTemplateRegistry((current) =>
        current.map((entry) => (entry.templateId === templateId ? updated : entry))
      );
      return;
    }

    setTemplateRegistry((current) =>
      current.map((entry) =>
        entry.templateId === templateId ? transitionTemplateRegistryEntry(entry, action, session.user) : entry
      )
    );
  }

  async function runResourceProfileAction(
    profileId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) {
    if (apiHealth.mode === "api") {
      const updated = await runResourceProfileActionViaApi(profileId, action);
      setResourceProfiles((current) => current.map((profile) => (profile.id === profileId ? updated : profile)));
      return;
    }

    setResourceProfiles((current) =>
      current.map((profile) =>
        profile.id === profileId ? transitionResourceProfile(profile, action, session.user) : profile
      )
    );
  }

  function updateTemplateGovernance(id: string, field: "owner" | "tier", value: string) {
    setTemplateGovernance((current) => {
      const currentTemplate = current[id] ?? { owner: "", tier: "Standard" };
      return {
        ...current,
        [id]: {
          ...currentTemplate,
          [field]: field === "tier" ? (value as TemplateTier) : value,
        },
      };
    });
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img className="brandLogo" src={primaryLogo} alt="Nutanix Developer Cloud Studio" />
        </div>
        <nav className="nav">
          <NavButton icon={Gauge} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavButton icon={Layers3} label="Catalog" active={view === "catalog"} onClick={() => setView("catalog")} />
          <NavButton icon={Play} label="Create" active={view === "create"} onClick={() => setView("create")} />
          <NavButton
            icon={Activity}
            label="Environment"
            active={view === "environment" || view === "environmentDetail"}
            onClick={() => openEnvironmentDetail(selectedEnvironmentName || environments[0]?.name || environmentName)}
          />
          <NavButton icon={ShieldCheck} label="Admin" active={view === "admin"} onClick={() => setView("admin")} />
        </nav>
        <div className="sidebarStatus">
          <span className="dot" />
          {apiHealth.label}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Nutanix Developer Cloud Studio</p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <button className="primaryAction" onClick={() => setView("create")}>
            <Play size={16} />
            New environment
          </button>
        </header>

        {view === "dashboard" && (
          <Dashboard
            environments={environments}
            approvals={approvals}
            integrations={runtimeIntegrations}
            integrationConfigs={integrationConfigs}
            session={session}
            systemStatus={systemStatus}
            controlPlaneJobs={controlPlaneJobs}
            apiHealth={apiHealth}
            openTemplate={openTemplate}
            openEnvironmentDetail={openEnvironmentDetail}
            setView={setView}
          />
        )}
        {view === "catalog" && (
          <Catalog selectedId={selectedTemplateId} selectTemplate={selectTemplate} openTemplate={openTemplate} />
        )}
        {view === "template" && <TemplateDetail template={selectedTemplate} selectTemplate={selectTemplate} />}
        {view === "create" && (
          <CreateEnvironment
            template={selectedTemplate}
            selectedTargets={selectedTargets}
            environmentName={environmentName}
            region={region}
            estimatedCost={estimatedCost}
            setEnvironmentName={setEnvironmentName}
            setRegion={setRegion}
            setSelectedTemplateId={setSelectedTemplateId}
            toggleTarget={toggleTarget}
            launchEnvironment={launchEnvironment}
            requestError={requestError}
            apiMode={apiHealth.mode}
          />
        )}
        {view === "environment" && (
          <EnvironmentStatus
            jobState={jobState}
            jobStep={jobStep}
            environmentName={environmentName}
            templateName={selectedTemplate.name}
            selectedTargets={selectedTargets}
            estimatedCost={estimatedCost}
            setView={setView}
          />
        )}
        {view === "environmentDetail" && (
          <EnvironmentDetailView
            detail={environmentDetail ?? createMockEnvironmentDetail(environments, approvals, selectedEnvironmentName)}
            openCreate={() => setView("create")}
          />
        )}
        {view === "admin" && (
          <AdminView
            environments={environments}
            integrations={runtimeIntegrations}
            integrationConfigs={integrationConfigs}
            session={session}
            systemStatus={systemStatus}
            labAdapters={labAdapters}
            labAuthorizationScopes={labAuthorizationScopes}
            prismInventory={prismInventory}
            prismInventoryImport={prismInventoryImport}
            resourceProfiles={resourceProfiles}
            policyBundles={policyBundles}
            templateRegistry={templateRegistry}
            platformConfig={platformConfig}
            provisioningAdapters={provisioningAdapters}
            controlPlaneJobs={controlPlaneJobs}
            vmSandboxDryRuns={vmSandboxDryRuns}
            controlledProvisioningGates={controlledProvisioningGates}
            platformServiceRequests={platformServiceRequests}
            vmLifecycleProofs={vmLifecycleProofs}
            approvals={approvals}
            templateGovernance={templateGovernance}
            updateTemplateGovernance={updateTemplateGovernance}
            decideApproval={decideApproval}
            saveIntegrationConfig={saveIntegrationConfig}
            runIntegrationCheck={runIntegrationCheck}
            runLabDiscovery={runLabDiscovery}
            importPrismInventory={importPrismInventory}
            runControlPlaneJobAction={runControlPlaneJobAction}
            createVmSandboxDryRun={createVmSandboxDryRun}
            recordLabAuthorizationScope={recordLabAuthorizationScope}
            requestControlledProvisioningGate={requestControlledProvisioningGate}
            decideControlledProvisioningGate={decideControlledProvisioningGate}
            recordVmLifecycleProof={recordVmLifecycleProof}
            createPlatformServiceRequest={createPlatformServiceRequest}
            requestEnvironmentDestroy={requestEnvironmentDestroy}
            runTemplateRegistryAction={runTemplateRegistryAction}
            runResourceProfileAction={runResourceProfileAction}
            openEnvironmentDetail={openEnvironmentDetail}
          />
        )}
      </main>
    </div>
  );
}

function Dashboard({
  environments,
  approvals,
  integrations,
  integrationConfigs,
  session,
  systemStatus,
  controlPlaneJobs,
  apiHealth,
  openTemplate,
  openEnvironmentDetail,
  setView,
}: {
  environments: Environment[];
  approvals: ApprovalRequest[];
  integrations: Integration[];
  integrationConfigs: IntegrationConfig[];
  session: PlatformSession;
  systemStatus: SystemStatus;
  controlPlaneJobs: ControlPlaneJob[];
  apiHealth: ApiHealth;
  openTemplate: (id: string) => void;
  openEnvironmentDetail: (name: string) => void;
  setView: (view: View) => void;
}) {
  const readyCount = environments.filter((environment) => environment.status === "Ready").length;
  const openApprovals = approvals.filter((approval) => approval.status === "Pending");
  const readinessAverage = Math.round(
    integrations.reduce((total, integration) => total + integration.score, 0) / Math.max(integrations.length, 1)
  );
  const reachableIntegrations = integrationConfigs.filter((config) => config.status === "Reachable").length;
  const activeControlPlaneJobs = controlPlaneJobs.filter((job) => !["Ready", "Failed", "Expired"].includes(job.state));

  return (
    <section className="screen">
      <div className="opsStatusStrip">
        <div className="statusTile strong">
          <span>Runtime</span>
          <strong>{apiHealth.mode === "api" ? "Hosted API" : "Static demo"}</strong>
          <small>{apiHealth.label}</small>
        </div>
        <div className="statusTile">
          <span>Environments</span>
          <strong>{environments.length}</strong>
          <small>{readyCount} ready across lab targets</small>
        </div>
        <div className="statusTile">
          <span>Approvals</span>
          <strong>{openApprovals.length}</strong>
          <small>Pending platform decisions</small>
        </div>
        <div className="statusTile">
          <span>Integration readiness</span>
          <strong>{readinessAverage}%</strong>
          <small>NCI, NKP, NDB, NUS, NCM, NAI</small>
        </div>
        <div className="statusTile">
          <span>Provisioning</span>
          <strong>{systemStatus.provisioningEnabled ? "Enabled" : "Disabled"}</strong>
          <small>{systemStatus.integrations.readOnlyCandidates} read-only candidates</small>
        </div>
        <div className="statusTile">
          <span>Control plane</span>
          <strong>{activeControlPlaneJobs.length}</strong>
          <small>Active queued or running jobs</small>
        </div>
      </div>

      <div className="opsDashboardGrid">
        <div className="opsMain">
          <Panel title="Environment operations" action="API-backed detail">
            <div className="opsTable">
              <div className="tableHeader">
                <span>Name</span>
                <span>Owner</span>
                <span>Target</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {environments.map((env) => (
                <div className="tableRow" key={env.name}>
                  <strong>{env.name}</strong>
                  <span>{env.owner}</span>
                  <span>{env.region}</span>
                  <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
                  <button className="iconTextButton" onClick={() => openEnvironmentDetail(env.name)}>
                    <ExternalLink size={15} />
                    Details
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="opsSide">
          <Panel title="Access context" action={session.authMode}>
            <div className="identityPanel">
              <div className="statusBadge compact">
                <UserRound size={20} />
              </div>
              <div>
                <strong>{session.displayName}</strong>
                <span>{session.roles.join(" / ")}</span>
                <small>{session.identityProvider}</small>
              </div>
            </div>
          </Panel>
          <Panel title="Approval queue" action={`${openApprovals.length} pending`}>
            <ApprovalQueue approvals={approvals} compact openEnvironmentDetail={openEnvironmentDetail} />
          </Panel>
          <Panel title="Control plane queue" action={`${activeControlPlaneJobs.length} active`}>
            <ControlPlaneQueue jobs={controlPlaneJobs.slice(0, 4)} compact />
          </Panel>
          <Panel title="Integration readiness" action={`${readinessAverage}%`}>
            <div className="miniIntegrationGrid">
              {integrations.map((integration) => (
                <div className="integrationTile" key={integration.name}>
                  <strong>{integration.name}</strong>
                  <span>{integration.state}</span>
                  <meter min="0" max="100" value={integration.score} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="opsCommandGrid">
        <Panel title="Private cloud command center" action="Prototype">
          <div className="commandPanel">
            <div>
              <p className="eyebrow">Private cloud developer operations</p>
              <h2>Operate governed developer environments from one private cloud console.</h2>
              <p>
                Request and govern VMs, Kubernetes namespaces, databases, storage, and AI endpoints
                with hosted API workflows, approval gates, and integration readiness surfaced together.
              </p>
              <div className="buttonRow">
                <button className="primaryAction" onClick={() => setView("create")}>
                  <Play size={16} />
                  Create environment
                </button>
                <button className="secondaryAction" onClick={() => setView("catalog")}>
                  <Layers3 size={16} />
                  Browse catalog
                </button>
              </div>
            </div>
            <img src={cloudVisual} alt="" />
          </div>
        </Panel>
        <div className="dashboardGrid compactMetrics">
          <MetricCard icon={Cloud} label="Active environments" value={String(environments.length)} detail="Across 3 labs" />
          <MetricCard icon={ShieldCheck} label="Pending approvals" value={String(openApprovals.length)} detail="AI and regulated paths" />
          <MetricCard
            icon={CircleDollarSign}
            label="Monthly estimate"
            value={`$${Math.round(environments.reduce((total, environment) => total + environment.cost, 0) / 100) / 10}k`}
            detail="Current prototype state"
          />
          <MetricCard
            icon={Settings}
            label="Reachable integrations"
            value={`${reachableIntegrations}/${integrationConfigs.length}`}
            detail="Mock readiness checks"
          />
        </div>
      </div>

      <div className="twoColumn">
        <Panel title="Recommended golden paths" action="Catalog">
          <div className="templateList">
            {templates.slice(0, 3).map((template) => (
              <button className="templateRow" key={template.id} onClick={() => openTemplate(template.id)}>
                <div>
                  <strong>{template.name}</strong>
                  <span>{template.runtime}</span>
                </div>
                <span className={`pill ${template.tier.toLowerCase()}`}>{template.tier}</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Environment activity" action="Live">
          <div className="envTable">
            {environments.map((env) => (
              <div className="envRow" key={env.name}>
                <div>
                  <strong>{env.name}</strong>
                  <span>{env.template}</span>
                </div>
                <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Catalog({
  selectedId,
  selectTemplate,
  openTemplate,
}: {
  selectedId: string;
  selectTemplate: (id: string) => void;
  openTemplate: (id: string) => void;
}) {
  return (
    <section className="screen">
      <div className="catalogGrid">
        {templates.map((template) => (
          <article className={`templateCard ${selectedId === template.id ? "selected" : ""}`} key={template.id}>
            <div className="cardTop">
              <div className="cardIcon">
                <Code2 size={20} />
              </div>
              <span className={`pill ${template.tier.toLowerCase()}`}>{template.tier}</span>
            </div>
            <h2>{template.name}</h2>
            <p>{template.summary}</p>
            <div className="targetStrip">
              {template.targets.map((target) => {
                const Icon = targetIcons[target];
                return (
                  <span key={target}>
                    <Icon size={14} />
                    {target}
                  </span>
                );
              })}
            </div>
            <div className="cardMeta">
              <span>{template.owner}</span>
              <strong>${template.monthlyCost.toLocaleString()}/mo</strong>
            </div>
            <button className="fullButton" onClick={() => selectTemplate(template.id)}>
              Use template
            </button>
            <button className="textButton" onClick={() => openTemplate(template.id)}>
              View details
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TemplateDetail({ template, selectTemplate }: { template: Template; selectTemplate: (id: string) => void }) {
  return (
    <section className="screen detailGrid">
      <Panel title={template.name} action={template.tier}>
        <p className="detailLead">{template.description}</p>
        <div className="targetStrip spacious">
          {template.targets.map((target) => {
            const Icon = targetIcons[target];
            return (
              <span key={target}>
                <Icon size={14} />
                {target}
              </span>
            );
          })}
        </div>
        <div className="cardMeta detailMeta">
          <span>{template.owner}</span>
          <strong>${template.monthlyCost.toLocaleString()}/mo baseline</strong>
        </div>
        <button className="fullButton launch" onClick={() => selectTemplate(template.id)}>
          Use this golden path
        </button>
      </Panel>
      <Panel title="What gets created" action={template.runtime}>
        <div className="bulletList">
          {template.outcomes.map((item) => (
            <CheckLine key={item} icon={CheckCircle2} label={item} value="Included in prototype workflow" passed />
          ))}
        </div>
      </Panel>
      <Panel title="Integration readiness" action="Next">
        <div className="bulletList">
          {template.readiness.map((item) => (
            <CheckLine key={item} icon={Network} label={item} value="Required before real provisioning" passed={false} />
          ))}
        </div>
      </Panel>
    </section>
  );
}

function CreateEnvironment({
  template,
  selectedTargets,
  environmentName,
  region,
  estimatedCost,
  setEnvironmentName,
  setRegion,
  setSelectedTemplateId,
  toggleTarget,
  launchEnvironment,
  requestError,
  apiMode,
}: {
  template: Template;
  selectedTargets: Target[];
  environmentName: string;
  region: string;
  estimatedCost: number;
  setEnvironmentName: (value: string) => void;
  setRegion: (value: string) => void;
  setSelectedTemplateId: (value: string) => void;
  toggleTarget: (target: Target) => void;
  launchEnvironment: () => void;
  requestError: string;
  apiMode: "api" | "mock";
}) {
  return (
    <section className="screen createGrid">
      <Panel title="Request details" action="Step 1">
        <label className="field">
          Environment name
          <input value={environmentName} onChange={(event) => setEnvironmentName(event.target.value)} />
        </label>
        <label className="field">
          Golden path
          <select value={template.id} onChange={(event) => setSelectedTemplateId(event.target.value)}>
            {templates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Target location
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option>Berlin Lab</option>
            <option>London Edge</option>
            <option>Paris DR</option>
          </select>
        </label>
      </Panel>

      <Panel title="Target services" action="Step 2">
        <div className="targetGrid">
          {allTargets.map((target) => {
            const Icon = targetIcons[target];
            const active = selectedTargets.includes(target);
            return (
              <button className={`targetButton ${active ? "active" : ""}`} key={target} onClick={() => toggleTarget(target)}>
                <Icon size={18} />
                {target}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Automated checks" action="Step 3">
        <CheckLine icon={ShieldCheck} label="Policy" value="Allowed by developer sandbox policy" passed />
        <CheckLine icon={CircleDollarSign} label="Cost" value={`Estimated $${estimatedCost.toLocaleString()} per month`} passed />
        <CheckLine
          icon={LockKeyhole}
          label="Compliance"
          value={selectedTargets.includes("AI Endpoint") ? "Requires AI platform approval" : "No approval required"}
          passed={!selectedTargets.includes("AI Endpoint")}
        />
        <CheckLine
          icon={Network}
          label="Integrations"
          value={apiMode === "api" ? `${template.runtime} via hosted API` : `${template.runtime} in browser mock mode`}
          passed
        />
        {requestError && <p className="formNotice">{requestError}</p>}
        <button className="fullButton launch" onClick={launchEnvironment}>
          Launch simulated provisioning
        </button>
      </Panel>
    </section>
  );
}

function EnvironmentStatus({
  jobState,
  jobStep,
  environmentName,
  templateName,
  selectedTargets,
  estimatedCost,
  setView,
}: {
  jobState: JobState;
  jobStep: number;
  environmentName: string;
  templateName: string;
  selectedTargets: Target[];
  estimatedCost: number;
  setView: (view: View) => void;
}) {
  const jobStarted = jobState !== "Idle";
  const actionLabel = jobStarted ? jobState : "Ready";

  return (
    <section className="screen statusGrid">
      <Panel title={jobStarted ? environmentName : "No active request"} action={actionLabel}>
        <div className="statusSummary">
          <div className="statusBadge">
            <TerminalSquare size={28} />
          </div>
          <div>
            <h2>{jobStarted ? jobHeadline(jobState) : "Create an environment to see status"}</h2>
            <p>{jobStarted ? templateName : "The status view will show checks, events, and Nutanix integration handoff."}</p>
          </div>
        </div>
        {jobStarted && (
          <div className="timeline">
            {provisioningEvents.map((item, index) => (
              <div className={`timelineItem ${timelineClass(index, jobStep, jobState)}`} key={item.title}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{timelineLabel(index, jobStep, jobState)} - {item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        )}
        {!jobStarted && (
          <button className="fullButton" onClick={() => setView("create")}>
            Create environment
          </button>
        )}
      </Panel>

      <Panel title="Provisioned resources" action={`$${estimatedCost.toLocaleString()}/mo`}>
        <div className="resourceList">
          {selectedTargets.map((target) => {
            const Icon = targetIcons[target];
            return (
              <div className="resourceRow" key={target}>
                <Icon size={18} />
                <div>
                  <strong>{target}</strong>
                  <span>{resourceDescription(target)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

function AdminView({
  environments,
  integrations,
  integrationConfigs,
  session,
  systemStatus,
  labAdapters,
  labAuthorizationScopes,
  prismInventory,
  prismInventoryImport,
  resourceProfiles,
  policyBundles,
  templateRegistry,
  platformConfig,
  provisioningAdapters,
  controlPlaneJobs,
  vmSandboxDryRuns,
  controlledProvisioningGates,
  platformServiceRequests,
  vmLifecycleProofs,
  approvals,
  templateGovernance,
  updateTemplateGovernance,
  decideApproval,
  saveIntegrationConfig,
  runIntegrationCheck,
  runLabDiscovery,
  importPrismInventory,
  runControlPlaneJobAction,
  createVmSandboxDryRun,
  recordLabAuthorizationScope,
  requestControlledProvisioningGate,
  decideControlledProvisioningGate,
  recordVmLifecycleProof,
  createPlatformServiceRequest,
  requestEnvironmentDestroy,
  runTemplateRegistryAction,
  runResourceProfileAction,
  openEnvironmentDetail,
}: {
  environments: Environment[];
  integrations: Integration[];
  integrationConfigs: IntegrationConfig[];
  session: PlatformSession;
  systemStatus: SystemStatus;
  labAdapters: LabAdapterSnapshot[];
  labAuthorizationScopes: LabAuthorizationScope[];
  prismInventory: PrismInventoryRecord[];
  prismInventoryImport?: PrismInventoryImportResult;
  resourceProfiles: ResourceProfile[];
  policyBundles: PolicyBundle[];
  templateRegistry: TemplateRegistryEntry[];
  platformConfig: PlatformConfig;
  provisioningAdapters: ProvisioningAdapterReadiness[];
  controlPlaneJobs: ControlPlaneJob[];
  vmSandboxDryRuns: VmSandboxDryRunPlan[];
  controlledProvisioningGates: ControlledProvisioningGate[];
  platformServiceRequests: PlatformServiceRequest[];
  vmLifecycleProofs: VmLifecycleProof[];
  approvals: ApprovalRequest[];
  templateGovernance: TemplateGovernance;
  updateTemplateGovernance: (id: string, field: "owner" | "tier", value: string) => void;
  decideApproval: (approvalId: string, decision: "approve" | "reject") => void;
  saveIntegrationConfig: (
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) => void;
  runIntegrationCheck: (integrationName: string) => void;
  runLabDiscovery: (adapterName: string) => void;
  importPrismInventory: () => void;
  runControlPlaneJobAction: (jobId: string, action: "advance" | "retry" | "fail") => void;
  createVmSandboxDryRun: () => void;
  recordLabAuthorizationScope: () => void;
  requestControlledProvisioningGate: () => void;
  decideControlledProvisioningGate: (gateId: string, decision: "approve" | "reject") => void;
  recordVmLifecycleProof: () => void;
  createPlatformServiceRequest: (kind: PlatformServiceKind) => void;
  requestEnvironmentDestroy: (name: string) => void;
  runTemplateRegistryAction: (
    templateId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
  runResourceProfileAction: (
    profileId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
  openEnvironmentDetail: (name: string) => void;
}) {
  const pendingApprovals = approvals.filter((approval) => approval.status === "Pending").length;
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const adminTabs: Array<{ id: AdminTab; label: string; detail: string }> = [
    { id: "overview", label: "Overview", detail: "Access and readiness" },
    { id: "providers", label: "Providers", detail: "Config and adapters" },
    { id: "control", label: "Control plane", detail: "Jobs and approvals" },
    { id: "governance", label: "Governance", detail: "Queues and controls" },
    { id: "templates", label: "Templates", detail: "Catalog and ownership" },
  ];

  return (
    <section className="screen">
      <div className="adminTabs" role="tablist" aria-label="Admin sections">
        {adminTabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={`adminTab ${activeTab === tab.id ? "active" : ""}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            <strong>{tab.label}</strong>
            <span>{tab.detail}</span>
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="adminTabPanel">
          <Panel title="Access model" action={session.authMode}>
            <div className="controlGrid">
              <CheckLine icon={UserRound} label="Current identity" value={`${session.displayName} (${session.user})`} passed />
              <CheckLine icon={ShieldCheck} label="Roles" value={session.roles.join(", ")} passed />
              <CheckLine icon={LockKeyhole} label="Authorization" value="Mock role boundaries, ready for OIDC mapping" passed={false} />
            </div>
          </Panel>
          <Panel title="Integration readiness" action="API connected">
            <div className="integrationList">
              {integrations.map(({ name, label, state, score }) => (
                <div className="integrationRow" key={name}>
                  <div className="integrationLogo">{name}</div>
                  <div>
                    <strong>{label}</strong>
                    <span>{state}</span>
                  </div>
                  <meter min="0" max="100" value={Number(score)} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Platform controls" action="Admin">
            <div className="controlGrid">
              <CheckLine icon={ShieldCheck} label="Policy packs" value="12 active, 3 draft" passed />
              <CheckLine icon={Layers3} label="Templates" value={`${templates.length} published golden paths`} passed />
              <CheckLine icon={CircleDollarSign} label="Budgets" value="$25k monthly sandbox limit" passed />
              <CheckLine icon={LockKeyhole} label="Approvals" value="AI and regulated data require review" passed={false} />
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "providers" && (
        <div className="adminTabPanel">
          <Panel title="Integration configuration" action="Lab readiness">
            <IntegrationConfigPanel
              integrations={integrations}
              configs={integrationConfigs}
              saveIntegrationConfig={saveIntegrationConfig}
              runIntegrationCheck={runIntegrationCheck}
            />
          </Panel>
          <Panel title="Lab adapter pilot" action="Read-only">
            <LabAdapterPanel
              adapters={labAdapters}
              systemStatus={systemStatus}
              runLabDiscovery={runLabDiscovery}
            />
          </Panel>
          <Panel title="Prism read-only inventory" action={`${prismInventory.length} records`}>
            <PrismInventoryPanel
              records={prismInventory}
              lastImport={prismInventoryImport}
              importPrismInventory={importPrismInventory}
            />
          </Panel>
          <Panel title="Provider readiness" action={`${provisioningAdapters.length} adapters`}>
            <ProvisioningAdapterPanel adapters={provisioningAdapters} platformConfig={platformConfig} />
          </Panel>
        </div>
      )}

      {activeTab === "control" && (
        <div className="adminTabPanel">
          <Panel title="Provisioning control plane" action={`${controlPlaneJobs.length} jobs`}>
            <ControlPlaneQueue jobs={controlPlaneJobs} runControlPlaneJobAction={runControlPlaneJobAction} />
          </Panel>
          <Panel title="VM sandbox dry-run" action={`${vmSandboxDryRuns.length} plans`}>
            <VmSandboxDryRunPanel plans={vmSandboxDryRuns} createVmSandboxDryRun={createVmSandboxDryRun} />
          </Panel>
          <Panel title="Lab authorization and lifecycle proof" action={`${labAuthorizationScopes.length + vmLifecycleProofs.length} records`}>
            <LifecycleEvidencePanel
              scopes={labAuthorizationScopes}
              proofs={vmLifecycleProofs}
              recordLabAuthorizationScope={recordLabAuthorizationScope}
              recordVmLifecycleProof={recordVmLifecycleProof}
            />
          </Panel>
          <Panel title="Controlled provisioning gate" action={`${controlledProvisioningGates.length} reviews`}>
            <ControlledProvisioningGatePanel
              gates={controlledProvisioningGates}
              requestControlledProvisioningGate={requestControlledProvisioningGate}
              decideControlledProvisioningGate={decideControlledProvisioningGate}
            />
          </Panel>
          <Panel title="Platform service flows" action={`${platformServiceRequests.length} planned`}>
            <PlatformServiceRequestPanel
              requests={platformServiceRequests}
              createPlatformServiceRequest={createPlatformServiceRequest}
            />
          </Panel>
          <Panel title="Approval queue" action={`${pendingApprovals} pending`}>
            <ApprovalQueue
              approvals={approvals}
              decideApproval={decideApproval}
              openEnvironmentDetail={openEnvironmentDetail}
            />
          </Panel>
        </div>
      )}

      {activeTab === "governance" && (
        <div className="adminTabPanel">
          <Panel title="Governance queue" action={`${environments.filter((env) => env.status !== "Ready").length} open`}>
            <div className="envTable">
              {environments.map((env) => (
                <div className="envRow governanceRow" key={env.name}>
                  <button className="buttonRowLike ghostRowButton" onClick={() => openEnvironmentDetail(env.name)}>
                    <div>
                      <strong>{env.name}</strong>
                      <span>
                        {env.owner} / {env.region}
                      </span>
                    </div>
                    <span className={`status ${statusClass(env.status)}`}>{env.status}</span>
                  </button>
                  <button className="smallButton dangerButton" onClick={() => requestEnvironmentDestroy(env.name)}>
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Hosted integration path" action="Real API path">
            <div className="readinessList">
              {integrations.map((integration) => (
                <div className="readinessRow" key={integration.name}>
                  <strong>{integration.product}</strong>
                  <span>{integration.readiness}</span>
                  <small>{integration.nextStep}</small>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="adminTabPanel">
          <Panel title="Image and template catalog" action={`${resourceProfiles.length} profiles`}>
            <ResourceProfileCatalog profiles={resourceProfiles} runResourceProfileAction={runResourceProfileAction} />
          </Panel>
          <Panel title="Template registry" action={`${templateRegistry.length} versions`}>
            <TemplateRegistryPanel
              entries={templateRegistry}
              policyBundles={policyBundles}
              runTemplateRegistryAction={runTemplateRegistryAction}
            />
          </Panel>
          <Panel title="Policy bundles" action={`${policyBundles.length} bundles`}>
            <PolicyBundlePanel bundles={policyBundles} />
          </Panel>
          <Panel title="Template governance" action="Editable">
            <div className="templateEditList">
              {templates.map((template) => (
                <div className="templateEditRow" key={template.id}>
                  <div className="editRowHeader">
                    <strong>{template.name}</strong>
                    <Pencil size={15} />
                  </div>
                  <label className="field compact">
                    Owner
                    <input
                      value={templateGovernance[template.id]?.owner ?? template.owner}
                      onChange={(event) => updateTemplateGovernance(template.id, "owner", event.target.value)}
                    />
                  </label>
                  <label className="field compact">
                    Tier
                    <select
                      value={templateGovernance[template.id]?.tier ?? template.tier}
                      onChange={(event) => updateTemplateGovernance(template.id, "tier", event.target.value)}
                    >
                      <option>Standard</option>
                      <option>Regulated</option>
                      <option>Accelerated</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </section>
  );
}

function ApprovalQueue({
  approvals,
  compact = false,
  decideApproval,
  openEnvironmentDetail,
}: {
  approvals: ApprovalRequest[];
  compact?: boolean;
  decideApproval?: (approvalId: string, decision: "approve" | "reject") => void;
  openEnvironmentDetail: (name: string) => void;
}) {
  if (approvals.length === 0) {
    return <p className="emptyState">No approval requests are queued.</p>;
  }

  return (
    <div className="approvalList">
      {approvals.map((approval) => (
        <div className="approvalRow" key={approval.id}>
          <div>
            <strong>{approval.environmentName}</strong>
            <span>{approval.reason}</span>
            {!compact && <small>{approval.owner} / {approval.template}</small>}
          </div>
          <span className={`status ${approval.status === "Pending" ? "approval" : approval.status === "Approved" ? "ready" : "failed"}`}>
            {approval.status}
          </span>
          <div className="inlineActions">
            <button className="iconTextButton" onClick={() => openEnvironmentDetail(approval.environmentName)}>
              <ExternalLink size={15} />
              Detail
            </button>
            {decideApproval && approval.status === "Pending" && (
              <>
                <button className="smallButton successButton" onClick={() => decideApproval(approval.id, "approve")}>
                  Approve
                </button>
                <button className="smallButton dangerButton" onClick={() => decideApproval(approval.id, "reject")}>
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ControlPlaneQueue({
  jobs,
  compact = false,
  runControlPlaneJobAction,
}: {
  jobs: ControlPlaneJob[];
  compact?: boolean;
  runControlPlaneJobAction?: (jobId: string, action: "advance" | "retry" | "fail") => void;
}) {
  if (jobs.length === 0) {
    return <p className="emptyState">No control-plane jobs are queued.</p>;
  }

  return (
    <div className="controlPlaneList">
      {jobs.map((job) => (
        <div className="controlPlaneRow" key={job.id}>
          <div className="integrationConfigHeader">
            <div>
              <strong>{job.environmentName}</strong>
              <span>
                {job.operation} / {job.template}
              </span>
            </div>
            <span className={`status ${controlPlaneClass(job.state)}`}>{job.state}</span>
          </div>
          {!compact && (
            <div className="labScope">
              <span>{job.transitions[0]?.message ?? "Waiting for worker."}</span>
              <small>
                {job.worker} / attempts {job.attempts}/{job.maxAttempts} / provisioning disabled
              </small>
            </div>
          )}
          {runControlPlaneJobAction && (
            <div className="inlineActions">
              <button className="iconTextButton" onClick={() => runControlPlaneJobAction(job.id, "advance")}>
                <Play size={15} />
                Advance
              </button>
              <button className="iconTextButton" onClick={() => runControlPlaneJobAction(job.id, "retry")}>
                <RefreshCw size={15} />
                Retry
              </button>
              <button className="smallButton dangerButton" onClick={() => runControlPlaneJobAction(job.id, "fail")}>
                Fail
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VmSandboxDryRunPanel({
  plans,
  createVmSandboxDryRun,
}: {
  plans: VmSandboxDryRunPlan[];
  createVmSandboxDryRun: () => void;
}) {
  const latest = plans[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Dry-run only</strong>
          <span>Validates VM sandbox inputs and rollback evidence without creating AHV resources.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={createVmSandboxDryRun}>
          <Play size={15} />
          Generate dry-run
        </button>
        {latest && <small>Last plan {formatDateTime(latest.createdAt)}</small>}
      </div>
      {!latest ? (
        <p className="emptyState">No VM sandbox dry-run plans have been generated.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>
                {latest.imageName} / {latest.project} / {latest.network}
              </span>
            </div>
            <span className="status ready">Dry-run</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Gauge} label="Quota" value={`${latest.quota.cpu} vCPU / ${latest.quota.memoryGb} GB / ${latest.quota.diskGb} GB`} passed />
            <CheckLine icon={CircleDollarSign} label="Cost" value={`$${latest.estimatedMonthlyCost}/mo estimate`} passed />
            <CheckLine icon={Activity} label="Expiry" value={`${latest.expiryDays} days`} passed={latest.expiryDays <= 30} />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.validations.map((validation) => (
              <div className="dryRunValidationRow" key={validation.name}>
                <span className={`status ${validation.passed ? "ready" : "failed"}`}>
                  {validation.passed ? "Pass" : "Fail"}
                </span>
                <div>
                  <strong>{validation.name}</strong>
                  <small>{validation.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Approval evidence</strong>
            {latest.approvalEvidence.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Rollback plan</strong>
            {latest.rollbackPlan.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationConfigPanel({
  integrations,
  configs,
  saveIntegrationConfig,
  runIntegrationCheck,
}: {
  integrations: Integration[];
  configs: IntegrationConfig[];
  saveIntegrationConfig: (
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) => void;
  runIntegrationCheck: (integrationName: string) => void;
}) {
  return (
    <div className="integrationConfigList">
      {integrations.map((integration) => (
        <IntegrationConfigRow
          key={integration.name}
          integration={integration}
          config={configs.find((item) => item.name === integration.name) ?? createEmptyIntegrationConfig(integration.name)}
          saveIntegrationConfig={saveIntegrationConfig}
          runIntegrationCheck={runIntegrationCheck}
        />
      ))}
    </div>
  );
}

function LabAdapterPanel({
  adapters,
  systemStatus,
  runLabDiscovery,
}: {
  adapters: LabAdapterSnapshot[];
  systemStatus: SystemStatus;
  runLabDiscovery: (adapterName: string) => void;
}) {
  return (
    <div className="labAdapterList">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Provisioning disabled</strong>
          <span>
            Read-only discovery only. {systemStatus.integrations.readOnlyCandidates} adapter candidate
            {systemStatus.integrations.readOnlyCandidates === 1 ? "" : "s"} ready for review.
          </span>
        </div>
      </div>
      {adapters.map((adapter) => (
        <div className="labAdapterRow" key={adapter.name}>
          <div className="integrationConfigHeader">
            <div className="integrationLogo">{adapter.name}</div>
            <div>
              <strong>{adapter.product}</strong>
              <span>{adapter.message}</span>
            </div>
            <span className={`status ${labAdapterClass(adapter.mode)}`}>{adapter.mode}</span>
          </div>
          <div className="labScope">
            <span>{adapter.scope}</span>
            <small>{adapter.inventoryCount} inventory records / provisioning disabled</small>
          </div>
          <div className="inlineActions">
            <button className="iconTextButton" onClick={() => runLabDiscovery(adapter.name)}>
              <RefreshCw size={15} />
              Discover
            </button>
            {adapter.lastDiscoveryAt && <small>Last discovery {formatDateTime(adapter.lastDiscoveryAt)}</small>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrismInventoryPanel({
  records,
  lastImport,
  importPrismInventory,
}: {
  records: PrismInventoryRecord[];
  lastImport?: PrismInventoryImportResult;
  importPrismInventory: () => void;
}) {
  const imageCandidates = records.filter((record) => record.kind === "Image" && record.profileCandidate).length;

  return (
    <div className="prismInventoryPanel">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Read-only Prism Central import</strong>
          <span>
            {lastImport
              ? `${lastImport.mode} imported ${lastImport.recordsImported} records with ${imageCandidates} image candidates.`
              : "Import requires reachable NCI config. Real adapter calls remain disabled."}
          </span>
        </div>
      </div>
      {lastImport && (
        <div className="inventoryEvidence">
          <strong>{lastImport.evidence}</strong>
          <span>
            {lastImport.scope.project} / {lastImport.scope.cluster} / {lastImport.scope.network}
          </span>
          <small>{lastImport.mutationOperationsBlocked.join(", ")} blocked</small>
        </div>
      )}
      <div className="inlineActions">
        <button className="iconTextButton" onClick={importPrismInventory}>
          <RefreshCw size={15} />
          Import inventory
        </button>
        {lastImport && <small>Last import {formatDateTime(lastImport.importedAt)}</small>}
      </div>
      {records.length === 0 ? (
        <p className="emptyState">No Prism inventory has been imported yet.</p>
      ) : (
        <div className="prismInventoryList">
          {records.map((record) => (
            <div className="prismInventoryRow" key={record.id}>
              <div>
                <strong>{record.name}</strong>
                <span>
                  {record.kind} / {record.cluster ?? "No cluster"} / {record.project ?? "No project"}
                </span>
                <small>{record.rawRef}</small>
              </div>
              <span className={`status ${record.profileCandidate ? "approval" : "ready"}`}>
                {record.profileCandidate ? "Profile candidate" : record.kind}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResourceProfileCatalog({
  profiles,
  runResourceProfileAction,
}: {
  profiles: ResourceProfile[];
  runResourceProfileAction?: (
    profileId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
}) {
  return (
    <div className="resourceProfileList">
      {profiles.map((profile) => (
        <div className="resourceProfileRow" key={profile.id}>
          <div className="integrationConfigHeader">
            <div className="integrationLogo">{profile.provider}</div>
            <div>
              <strong>{profile.name}</strong>
              <span>
                {profile.kind} / {profile.version} / {profile.region}
              </span>
            </div>
            <span className={`status ${resourceProfileClass(profile.status)}`}>{profile.status}</span>
          </div>
          <div className="labScope">
            <span>{profile.notes}</span>
            <small>
              {profile.owner}
              {profile.approvedBy ? ` / approved by ${profile.approvedBy}` : ""}
            </small>
          </div>
          {runResourceProfileAction && (
            <RegistryActions
              id={profile.id}
              status={profile.status}
              runAction={runResourceProfileAction}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TemplateRegistryPanel({
  entries,
  policyBundles,
  runTemplateRegistryAction,
}: {
  entries: TemplateRegistryEntry[];
  policyBundles: PolicyBundle[];
  runTemplateRegistryAction: (
    templateId: string,
    action: "submit" | "approve" | "deprecate" | "restore"
  ) => void;
}) {
  return (
    <div className="templateRegistryList">
      {entries.map((entry) => (
        <div className="templateRegistryRow" key={entry.templateId}>
          <div className="integrationConfigHeader">
            <div>
              <strong>{entry.templateName}</strong>
              <span>
                v{entry.version} / {entry.owner}
              </span>
            </div>
            <span className={`status ${registryStatusClass(entry.status)}`}>{entry.status}</span>
          </div>
          <div className="policyChipRow">
            {entry.policyBundleIds.map((bundleId) => {
              const bundle = policyBundles.find((item) => item.id === bundleId);
              return (
                <span className="policyChip" key={bundleId}>
                  {bundle?.name ?? bundleId}
                </span>
              );
            })}
          </div>
          <div className="labScope">
            <span>{entry.approvalEvidence}</span>
            <small>{entry.notes}</small>
          </div>
          <RegistryActions id={entry.templateId} status={entry.status} runAction={runTemplateRegistryAction} />
        </div>
      ))}
    </div>
  );
}

function PolicyBundlePanel({ bundles }: { bundles: PolicyBundle[] }) {
  return (
    <div className="policyBundleList">
      {bundles.map((bundle) => (
        <div className="policyBundleRow" key={bundle.id}>
          <div>
            <strong>{bundle.name}</strong>
            <span>{bundle.owner}</span>
          </div>
          <div className="policyChipRow">
            {bundle.controls.map((control) => (
              <span className="policyChip" key={control}>
                {control}
              </span>
            ))}
          </div>
          <small>{bundle.evidence}</small>
        </div>
      ))}
    </div>
  );
}

function RegistryActions({
  id,
  status,
  runAction,
}: {
  id: string;
  status: RegistryStatus;
  runAction: (id: string, action: "submit" | "approve" | "deprecate" | "restore") => void;
}) {
  return (
    <div className="inlineActions">
      {status === "Draft" && (
        <button className="iconTextButton" onClick={() => runAction(id, "submit")}>
          <Play size={15} />
          Submit review
        </button>
      )}
      {status === "Pending approval" && (
        <button className="smallButton successButton" onClick={() => runAction(id, "approve")}>
          Approve publish
        </button>
      )}
      {status === "Published" && (
        <button className="smallButton dangerButton" onClick={() => runAction(id, "deprecate")}>
          Deprecate
        </button>
      )}
      {status === "Deprecated" && (
        <button className="iconTextButton" onClick={() => runAction(id, "restore")}>
          <RefreshCw size={15} />
          Restore draft
        </button>
      )}
    </div>
  );
}

function LifecycleEvidencePanel({
  scopes,
  proofs,
  recordLabAuthorizationScope,
  recordVmLifecycleProof,
}: {
  scopes: LabAuthorizationScope[];
  proofs: VmLifecycleProof[];
  recordLabAuthorizationScope: () => void;
  recordVmLifecycleProof: () => void;
}) {
  const latestScope = scopes[0];
  const latestProof = proofs[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Evidence before promotion</strong>
          <span>Records authorized lab scope and VM lifecycle proof before platform-service gates can pass.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={recordLabAuthorizationScope}>
          <Play size={15} />
          Record lab scope
        </button>
        <button className="iconTextButton" onClick={recordVmLifecycleProof}>
          <Play size={15} />
          Record lifecycle proof
        </button>
      </div>
      <div className="platformConfigGrid">
        <CheckLine
          icon={ShieldCheck}
          label="Lab scope"
          value={latestScope ? latestScope.status : "Missing"}
          passed={latestScope?.status === "Approved" && latestScope.pentestScopeStructurallyValid}
        />
        <CheckLine
          icon={LockKeyhole}
          label="Pentest scope"
          value={latestScope?.pentestScopeStructurallyValid ? "Structured" : "Required"}
          passed={Boolean(latestScope?.pentestScopeStructurallyValid)}
        />
        <CheckLine
          icon={Activity}
          label="VM lifecycle"
          value={latestProof?.status ?? "Missing"}
          passed={latestProof?.status === "Verified"}
        />
        <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
      </div>
      {latestScope && (
        <div className="inventoryEvidence">
          <strong>{latestScope.name}</strong>
          <span>
            {latestScope.project} / {latestScope.cluster} / {latestScope.network}
          </span>
          <span>{latestScope.pentestScopeReference}</span>
        </div>
      )}
      {latestProof && (
        <div className="dryRunValidationList">
          {latestProof.checks.map((check) => (
            <div className="dryRunValidationRow" key={check.name}>
              <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
              <div>
                <strong>{check.name}</strong>
                <small>{check.detail}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ControlledProvisioningGatePanel({
  gates,
  requestControlledProvisioningGate,
  decideControlledProvisioningGate,
}: {
  gates: ControlledProvisioningGate[];
  requestControlledProvisioningGate: () => void;
  decideControlledProvisioningGate: (gateId: string, decision: "approve" | "reject") => void;
}) {
  const latest = gates[0];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <ShieldCheck size={18} />
        <div>
          <strong>Operator-controlled gate</strong>
          <span>Requires dry-run evidence, manual approval, lab scope, rollback, destroy readiness, and a disabled-by-default kill switch.</span>
        </div>
      </div>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={requestControlledProvisioningGate}>
          <Play size={15} />
          Request gate review
        </button>
        {latest && latest.approval.status === "Pending" && (
          <>
            <button className="smallButton successButton" onClick={() => decideControlledProvisioningGate(latest.id, "approve")}>
              Approve gate
            </button>
            <button className="smallButton dangerButton" onClick={() => decideControlledProvisioningGate(latest.id, "reject")}>
              Reject gate
            </button>
          </>
        )}
      </div>
      {!latest ? (
        <p className="emptyState">No controlled provisioning gate reviews have been requested.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.environmentName}</strong>
              <span>
                Manual approval {latest.approval.status} / {latest.pentestScope.reference}
              </span>
            </div>
            <span className={`status ${latest.status === "Approved for controlled create" ? "approval" : latest.status === "Blocked" ? "failed" : "approval"}`}>
              {latest.status}
            </span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={ShieldCheck} label="Manual approval" value={latest.approval.status} passed={latest.approval.status === "Approved"} />
            <CheckLine icon={LockKeyhole} label="Authorized scope" value={latest.pentestScope.present ? "Attached" : "Required"} passed={latest.pentestScope.present && latest.pentestScope.structurallyValid} />
            <CheckLine icon={Activity} label="Kill switch" value={latest.mutationKillSwitch ? "Enabled" : "Disabled"} passed={latest.mutationKillSwitch} />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.checks.map((check) => (
              <div className="dryRunValidationRow" key={check.name}>
                <span className={`status ${check.passed ? "ready" : "failed"}`}>{check.passed ? "Pass" : "Gate"}</span>
                <div>
                  <strong>{check.name}</strong>
                  <small>{check.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Destroy plan</strong>
            {latest.destroyPlan.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformServiceRequestPanel({
  requests,
  createPlatformServiceRequest,
}: {
  requests: PlatformServiceRequest[];
  createPlatformServiceRequest: (kind: PlatformServiceKind) => void;
}) {
  const latest = requests[0];
  const kinds: PlatformServiceKind[] = ["NKP Namespace", "NDB PostgreSQL", "NUS Storage", "NAI Endpoint"];

  return (
    <div className="dryRunPanel">
      <div className="guardrailBanner">
        <Layers3 size={18} />
        <div>
          <strong>Platform services gated by VM lifecycle</strong>
          <span>Plans Kubernetes, database, storage, and AI service requests after the controlled VM path is proven.</span>
        </div>
      </div>
      <div className="inlineActions">
        {kinds.map((kind) => (
          <button className="iconTextButton" key={kind} onClick={() => createPlatformServiceRequest(kind)}>
            <Play size={15} />
            Plan {kind}
          </button>
        ))}
      </div>
      {!latest ? (
        <p className="emptyState">No platform service flows have been planned.</p>
      ) : (
        <div className="dryRunSummary">
          <div className="integrationConfigHeader">
            <div>
              <strong>{latest.serviceName}</strong>
              <span>
                {latest.kind} / {latest.profileName} / {latest.environmentName}
              </span>
            </div>
            <span className={`status ${latest.status === "Blocked" ? "failed" : "approval"}`}>{latest.status}</span>
          </div>
          <div className="platformConfigGrid">
            <CheckLine icon={Layers3} label="Provider" value={latest.provider} passed />
            <CheckLine icon={ShieldCheck} label="VM lifecycle" value={latest.vmLifecycleProven ? "Proven" : "Required"} passed={latest.vmLifecycleProven} />
            <CheckLine icon={CircleDollarSign} label="Cost" value={`$${latest.estimatedMonthlyCost}/mo estimate`} passed />
            <CheckLine icon={LockKeyhole} label="Provisioning" value="Disabled" passed={false} />
          </div>
          <div className="dryRunValidationList">
            {latest.validations.map((validation) => (
              <div className="dryRunValidationRow" key={validation.name}>
                <span className={`status ${validation.passed ? "ready" : "failed"}`}>
                  {validation.passed ? "Pass" : "Gate"}
                </span>
                <div>
                  <strong>{validation.name}</strong>
                  <small>{validation.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="inventoryEvidence">
            <strong>Cleanup plan</strong>
            {latest.cleanupPlan.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProvisioningAdapterPanel({
  adapters,
  platformConfig,
}: {
  adapters: ProvisioningAdapterReadiness[];
  platformConfig: PlatformConfig;
}) {
  return (
    <div className="provisioningAdapterList">
      <div className="guardrailBanner">
        <LockKeyhole size={18} />
        <div>
          <strong>Adapter contract only</strong>
          <span>{platformConfig.message}</span>
        </div>
      </div>
      <div className="platformConfigGrid">
        <CheckLine icon={Network} label="Project" value={platformConfig.defaultProject} passed />
        <CheckLine icon={Layers3} label="Cluster" value={platformConfig.defaultCluster} passed />
        <CheckLine icon={Settings} label="Network profile" value={platformConfig.networkProfile} passed={false} />
        <CheckLine icon={LockKeyhole} label="Credential ref" value={platformConfig.credentialReference} passed={false} />
      </div>
      {adapters.map((adapter) => (
        <div className="provisioningAdapterRow" key={adapter.name}>
          <div className="integrationConfigHeader">
            <div className="integrationLogo">{adapter.name}</div>
            <div>
              <strong>{adapter.product}</strong>
              <span>{adapter.capabilities.join(" / ")}</span>
            </div>
            <span className={`status ${adapter.configured ? "running" : "approval"}`}>
              {adapter.configured ? "Configured" : "Needs config"}
            </span>
          </div>
          <div className="labScope">
            <span>{adapter.nextGate}</span>
            <small>Provisioning disabled until adapter-specific gates are approved.</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function IntegrationConfigRow({
  integration,
  config,
  saveIntegrationConfig,
  runIntegrationCheck,
}: {
  integration: Integration;
  config: IntegrationConfig;
  saveIntegrationConfig: (
    integrationName: string,
    payload: Pick<IntegrationConfig, "endpoint" | "credentialProfile">
  ) => void;
  runIntegrationCheck: (integrationName: string) => void;
}) {
  const [endpoint, setEndpoint] = useState(config.endpoint);
  const [credentialProfile, setCredentialProfile] = useState(config.credentialProfile);

  useEffect(() => {
    setEndpoint(config.endpoint);
    setCredentialProfile(config.credentialProfile);
  }, [config.credentialProfile, config.endpoint]);

  return (
    <div className="integrationConfigRow">
      <div className="integrationConfigHeader">
        <div className="integrationLogo">{integration.name}</div>
        <div>
          <strong>{integration.product}</strong>
          <span>{config.message}</span>
        </div>
        <span className={`status ${integrationConfigClass(config.status)}`}>{config.status}</span>
      </div>
      <label className="field compact">
        Endpoint
        <input
          value={endpoint}
          placeholder={`https://${integration.name.toLowerCase()}.lab.example`}
          onChange={(event) => setEndpoint(event.target.value)}
        />
      </label>
      <label className="field compact">
        Credential profile
        <input
          value={credentialProfile}
          placeholder={`${integration.name.toLowerCase()}-lab-readonly`}
          onChange={(event) => setCredentialProfile(event.target.value)}
        />
      </label>
      <div className="inlineActions">
        <button className="iconTextButton" onClick={() => saveIntegrationConfig(integration.name, { endpoint, credentialProfile })}>
          <Settings size={15} />
          Save
        </button>
        <button className="iconTextButton" onClick={() => runIntegrationCheck(integration.name)}>
          <RefreshCw size={15} />
          Check
        </button>
        {config.lastCheckedAt && <small>Last check {formatDateTime(config.lastCheckedAt)}</small>}
      </div>
    </div>
  );
}

function EnvironmentDetailView({ detail, openCreate }: { detail: EnvironmentDetail | null; openCreate: () => void }) {
  if (!detail) {
    return (
      <section className="screen">
        <Panel title="No environment selected" action="Detail">
          <p className="emptyState">Create or select an environment to inspect API-backed details.</p>
          <button className="fullButton" onClick={openCreate}>
            Create environment
          </button>
        </Panel>
      </section>
    );
  }

  const { environment } = detail;

  return (
    <section className="screen detailStack">
      <div className="opsStatusStrip">
        <div className="statusTile strong">
          <span>Environment</span>
          <strong>{environment.name}</strong>
          <small>{environment.template}</small>
        </div>
        <div className="statusTile">
          <span>Status</span>
          <strong>{environment.status}</strong>
          <small>{environment.region}</small>
        </div>
        <div className="statusTile">
          <span>Owner</span>
          <strong>{environment.owner}</strong>
          <small>Requested {environment.createdAt}</small>
        </div>
        <div className="statusTile">
          <span>Monthly estimate</span>
          <strong>${environment.cost.toLocaleString()}</strong>
          <small>Prototype estimate</small>
        </div>
      </div>

      <div className="twoColumn">
        <Panel title="Provisioning jobs" action={`${detail.jobs.length} recorded`}>
          <div className="eventList">
            {detail.jobs.map((job) => (
              <div className="eventRow" key={job.id}>
                <strong>{job.state}</strong>
                <span>{job.message}</span>
                <small>{formatDateTime(job.createdAt)}</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Approval history" action={`${detail.approvals.length} request`}>
          <ApprovalQueue approvals={detail.approvals} compact openEnvironmentDetail={() => undefined} />
        </Panel>
      </div>

      <Panel title="Control-plane lifecycle" action={`${detail.controlPlaneJobs?.length ?? 0} jobs`}>
        <ControlPlaneQueue jobs={detail.controlPlaneJobs ?? []} />
      </Panel>

      <Panel title="Audit trail" action={`${detail.auditEvents.length} events`}>
        <div className="eventList">
          {detail.auditEvents.map((event) => (
            <div className="eventRow" key={event.id}>
              <strong>{event.action}</strong>
              <span>{event.actor} / {event.target}</span>
              <small>{formatDateTime(event.createdAt)}</small>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`navButton ${active ? "active" : ""}`} onClick={onClick} title={label}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function Panel({ title, action, children }: { title: string; action: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{title}</h2>
        <span>{action}</span>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ElementType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function CheckLine({
  icon: Icon,
  label,
  value,
  passed,
}: {
  icon: ElementType;
  label: string;
  value: string;
  passed: boolean;
}) {
  return (
    <div className="checkLine">
      <Icon size={18} />
      <div>
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <CheckCircle2 className={passed ? "pass" : "warn"} size={18} />
    </div>
  );
}

function viewTitle(view: View) {
  switch (view) {
    case "dashboard":
      return "Developer portal";
    case "catalog":
      return "Golden path catalog";
    case "template":
      return "Template details";
    case "create":
      return "Create environment";
    case "environment":
      return "Environment status";
    case "environmentDetail":
      return "Environment details";
    case "admin":
      return "Platform admin";
  }
}

function statusClass(status: Environment["status"]) {
  return status === "Ready" || status === "Destroyed"
    ? "ready"
    : status === "Provisioning" || status === "Destroying"
      ? "running"
      : status === "Failed"
        ? "failed"
        : "approval";
}

function integrationConfigClass(status: IntegrationConfig["status"]) {
  return status === "Reachable"
    ? "ready"
    : status === "Configured"
      ? "running"
      : status === "Failed"
        ? "failed"
        : "approval";
}

function labAdapterClass(mode: LabAdapterSnapshot["mode"]) {
  return mode === "Read-only candidate"
    ? "ready"
    : mode === "Reachable" || mode === "Configured"
      ? "running"
      : mode === "Failed"
        ? "failed"
        : "approval";
}

function controlPlaneClass(state: ControlPlaneJob["state"]) {
  return state === "Ready" || state === "Destroyed"
    ? "ready"
    : state === "Failed" || state === "Expired"
      ? "failed"
      : state === "AwaitingApproval"
        ? "approval"
        : "running";
}

function resourceProfileClass(status: ResourceProfile["status"]) {
  return status === "Published" ? "ready" : status === "Deprecated" ? "failed" : "approval";
}

function registryStatusClass(status: RegistryStatus) {
  return status === "Published" ? "ready" : status === "Deprecated" ? "failed" : "approval";
}

function resourceDescription(target: Target) {
  switch (target) {
    case "VM":
      return "NCI VM with hardened image and lifecycle expiry";
    case "Kubernetes":
      return "NKP namespace, ingress, secrets, and quota";
    case "Database":
      return "NDB managed instance with backup policy";
    case "Storage":
      return "NUS file or object storage allocation";
    case "AI Endpoint":
      return "NAI model endpoint with GPU quota review";
  }
}

function enrichTemplate(template: Template, governance: TemplateGovernance) {
  return {
    ...template,
    owner: governance[template.id]?.owner ?? template.owner,
    tier: governance[template.id]?.tier ?? template.tier,
  };
}

const mockSession: PlatformSession = {
  user: "platform.admin",
  displayName: "Platform Admin",
  roles: ["Developer", "Approver", "Platform Admin"],
  authMode: "Mock OIDC",
  identityProvider: "Browser mock identity stub",
};

function createEmptyIntegrationConfig(name: string): IntegrationConfig {
  return {
    name,
    endpoint: "",
    credentialProfile: "",
    status: "Not configured",
    message: "Add endpoint and credential profile values before lab validation.",
  };
}

function createEmptyLabAdapter(name: string): LabAdapterSnapshot {
  return {
    name,
    product: name,
    mode: "Mock",
    readOnly: true,
    provisioningEnabled: false,
    inventoryCount: 0,
    scope: "Mock adapter scope only until lab endpoint and authorization are documented.",
    message: "Waiting for lab scope before read-only discovery.",
    nextStep: "Document lab scope and read-only credential profile.",
  };
}

function deriveMockIntegrationConfigs(sourceIntegrations: Integration[]): IntegrationConfig[] {
  return sourceIntegrations.map((integration) => ({
    ...createEmptyIntegrationConfig(integration.name),
    status: integration.state === "Healthy" ? "Configured" : "Not configured",
    message: integration.state === "Healthy" ? "Mock adapter is configured for prototype readiness." : integration.nextStep,
  }));
}

function deriveMockLabAdapters(sourceIntegrations: Integration[]): LabAdapterSnapshot[] {
  return sourceIntegrations.map((integration) => ({
    ...createEmptyLabAdapter(integration.name),
    product: integration.product,
    mode: integration.name === "NCI" ? "Configured" : "Mock",
    scope:
      integration.name === "NCI"
        ? "Prism Central inventory discovery only. No VM, network, image, project, or policy changes."
        : "Mock adapter scope only until lab endpoint and authorization are documented.",
    message:
      integration.name === "NCI"
        ? "Ready for a read-only Prism Central inventory pilot after lab authorization."
        : "Waiting for lab scope before read-only discovery.",
    nextStep:
      integration.name === "NCI"
        ? "Document Prism Central URL, project scope, and read-only credential profile."
        : integration.nextStep,
  }));
}

function deriveMockProvisioningAdapters(sourceIntegrations: Integration[]): ProvisioningAdapterReadiness[] {
  return sourceIntegrations.map((integration) => ({
    name: integration.name as ProvisioningAdapterReadiness["name"],
    product: integration.product,
    mode: "Mock",
    capabilities: ["validateRequest", "plan", "provision", "pollStatus", "destroy"],
    configured: integration.state === "Healthy",
    provisioningEnabled: false,
    nextGate:
      integration.name === "NCI"
        ? "Map Prism Central image, project, subnet, category, and credential references."
        : integration.nextStep,
  }));
}

function createMockPrismInventoryRecords(
  config: PlatformConfig,
  importedAt: string
): PrismInventoryRecord[] {
  const cluster = config.defaultCluster;
  const project = config.defaultProject;
  const network = config.networkProfile;
  return [
    {
      id: "pc-cluster-berlin-01",
      kind: "Cluster",
      name: cluster,
      source: "Mock Prism Central",
      cluster,
      categories: ["Environment:Lab", "Platform:NCI"],
      importedAt,
      rawRef: "mock://prism/clusters/berlin-01",
    },
    {
      id: "pc-project-devcloud",
      kind: "Project",
      name: project,
      source: "Mock Prism Central",
      cluster,
      project,
      categories: ["Owner:DeveloperCloud", "CostCenter:Sandbox"],
      importedAt,
      rawRef: "mock://prism/projects/developer-cloud-lab",
    },
    {
      id: "pc-image-rocky-9-hardened",
      kind: "Image",
      name: "Rocky Linux 9 Hardened",
      source: "Mock Prism Central",
      cluster,
      project,
      categories: ["OS:Linux", "Baseline:Hardened"],
      importedAt,
      rawRef: "mock://prism/images/rocky-9-hardened",
      profileCandidate: true,
    },
    {
      id: "pc-image-ubuntu-2404-lts",
      kind: "Image",
      name: "Ubuntu 24.04 LTS Developer",
      source: "Mock Prism Central",
      cluster,
      project,
      categories: ["OS:Linux", "Baseline:Developer"],
      importedAt,
      rawRef: "mock://prism/images/ubuntu-2404-lts",
      profileCandidate: true,
    },
    {
      id: "pc-network-dev-segment",
      kind: "Network",
      name: network,
      source: "Mock Prism Central",
      cluster,
      project,
      network,
      categories: ["Network:Developer", "Exposure:Internal"],
      importedAt,
      rawRef: "mock://prism/networks/dev-segment",
    },
    {
      id: "pc-vm-billing-sandbox",
      kind: "VM",
      name: "billing-sandbox",
      source: "Mock Prism Central",
      cluster,
      project,
      network,
      powerState: "Unknown",
      categories: ["Owner:jordan.lee", "Template:VMSandbox"],
      importedAt,
      rawRef: "mock://prism/vms/billing-sandbox",
    },
  ];
}

function createMockVmSandboxDryRun(
  request: VmSandboxDryRunRequest,
  profiles: ResourceProfile[],
  config: PlatformConfig,
  registry: TemplateRegistryEntry[],
  actor: string
): VmSandboxDryRunPlan {
  const image = profiles.find((profile) => profile.id === request.imageProfileId);
  const templateEntry = registry.find((entry) => entry.templateId === "vm-app");
  const createdAt = new Date().toISOString();
  const validations = [
    {
      name: "Template published",
      passed: templateEntry?.status === "Published",
      detail: templateEntry?.status === "Published" ? "Linux VM App Sandbox is published." : "Template must be published.",
    },
    {
      name: "AHV image approved",
      passed: image?.kind === "AHV Image" && image.status === "Published",
      detail: image ? `${image.name} is ${image.status}.` : "Image profile was not found.",
    },
    {
      name: "Project mapped",
      passed: request.project === config.defaultProject,
      detail: `Project ${request.project} mapped to platform config.`,
    },
    {
      name: "Network mapped",
      passed: request.network === config.networkProfile,
      detail: `Network ${request.network} mapped to platform config.`,
    },
    {
      name: "Quota within sandbox limit",
      passed: request.cpu <= 4 && request.memoryGb <= 16 && request.diskGb <= 160,
      detail: `${request.cpu} vCPU, ${request.memoryGb} GB RAM, ${request.diskGb} GB disk requested.`,
    },
    {
      name: "Expiry within policy",
      passed: request.expiryDays > 0 && request.expiryDays <= 30,
      detail: `${request.expiryDays} day expiry requested.`,
    },
    {
      name: "Approval evidence present",
      passed: Boolean(templateEntry?.approvalEvidence && image?.approvedBy),
      detail: "Template and image approval evidence are required before future provisioning.",
    },
  ];

  return {
    id: `vm-dryrun-${request.environmentName}-${Date.now()}`,
    environmentName: request.environmentName,
    owner: request.owner,
    templateId: "vm-app",
    imageProfileId: request.imageProfileId,
    imageName: image?.name ?? "Unknown image profile",
    project: request.project,
    cluster: request.cluster,
    network: request.network,
    category: request.category,
    quota: {
      cpu: request.cpu,
      memoryGb: request.memoryGb,
      diskGb: request.diskGb,
      maxCpu: 4,
      maxMemoryGb: 16,
      maxDiskGb: 160,
    },
    expiryDays: request.expiryDays,
    estimatedMonthlyCost: Math.round(request.cpu * 95 + request.memoryGb * 18 + request.diskGb * 2),
    approvalEvidence: [
      templateEntry?.approvalEvidence ?? "Template approval evidence is missing.",
      image?.approvedBy ? `Image approved by ${image.approvedBy} at ${image.approvedAt ?? "unknown time"}.` : "Image approval is missing.",
      `Dry-run requested by ${actor}; provisioning remains disabled.`,
    ],
    validations,
    rollbackPlan: [
      "No rollback actions required for dry-run because no infrastructure mutation is performed.",
      "Future create path must tag VM with owner, expiry, cost center, and template before power-on.",
      "Future destroy path must remove VM, detach categories, and verify Prism inventory cleanup before closure.",
    ],
    provisioningEnabled: false,
    createdAt,
  };
}

function createMockControlledProvisioningGate(
  dryRun: VmSandboxDryRunPlan,
  actor: string
): ControlledProvisioningGate {
  return evaluateMockControlledProvisioningGate({
    id: `vm-controlled-${dryRun.environmentName}-${Date.now()}`,
    dryRunPlanId: dryRun.id,
    environmentName: dryRun.environmentName,
    owner: dryRun.owner,
    requestedBy: actor,
    status: "Blocked",
    approval: {
      status: "Pending",
      evidence: "Manual platform approval required before any controlled create can be considered.",
    },
    pentestScope: {
      required: true,
      present: false,
      reference: "No authorized lab scope file attached.",
      structurallyValid: false,
    },
    checks: [],
    rollbackPlan: dryRun.rollbackPlan,
    destroyPlan: [
      "Confirm target VM name and categories before any future create call.",
      "Queue destroy workflow before power-on so rollback ownership is explicit.",
      "Verify Prism inventory no longer reports the VM before closing the job.",
    ],
    mutationKillSwitch: false,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function createMockLabAuthorizationScope(actor: string, config: PlatformConfig): LabAuthorizationScope {
  const now = new Date();
  return {
    id: `lab-scope-${Date.now()}`,
    name: "Berlin AHV controlled provisioning lab",
    owner: actor,
    approver: actor,
    approvedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    project: config.defaultProject,
    cluster: config.defaultCluster,
    network: config.networkProfile,
    allowedActions: ["dry_run", "controlled_create_observation", "rollback_validation", "destroy_validation"],
    excludedActions: ["unscoped_create", "bulk_delete", "network_change", "image_delete", "production_workload_change"],
    pentestScopeReference: "Authorized lab scope / controlled provisioning test window",
    pentestScopeStructurallyValid: true,
    status: "Approved",
    createdAt: now.toISOString(),
  };
}

function createMockVmLifecycleProof(gate: ControlledProvisioningGate, actor: string): VmLifecycleProof {
  const checks = [
    {
      name: "Controlled gate approved",
      passed: gate.status === "Approved for controlled create",
      detail:
        gate.status === "Approved for controlled create"
          ? "Controlled create gate is approved."
          : `Gate status is ${gate.status}.`,
    },
    {
      name: "Rollback verified",
      passed: true,
      detail: "Rollback evidence was recorded.",
    },
    {
      name: "Destroy verified",
      passed: true,
      detail: "Destroy evidence was recorded.",
    },
  ];

  return {
    id: `vm-lifecycle-proof-${gate.environmentName}-${Date.now()}`,
    gateId: gate.id,
    environmentName: gate.environmentName,
    status: checks.every((check) => check.passed) ? "Verified" : "Blocked",
    rollbackVerified: true,
    destroyVerified: true,
    checks,
    evidence: [`Lifecycle proof recorded by ${actor}; live provisioning remains disabled in this prototype.`],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function evaluateMockControlledProvisioningGate(gate: ControlledProvisioningGate): ControlledProvisioningGate {
  const rollbackReady = gate.rollbackPlan.length > 0;
  const destroyReady = gate.destroyPlan.length > 0;
  const approvalReady = gate.approval.status === "Approved";
  const scopeReady = gate.pentestScope.present && gate.pentestScope.structurallyValid;
  const checks = [
    {
      name: "Dry-run validations passed",
      passed: true,
      detail: "All VM sandbox dry-run validations passed.",
    },
    {
      name: "Rollback plan ready",
      passed: rollbackReady,
      detail: rollbackReady ? "Rollback evidence is attached to the dry-run." : "Rollback evidence is missing.",
    },
    {
      name: "Destroy plan ready",
      passed: destroyReady,
      detail: destroyReady ? "Destroy workflow expectations are documented." : "Destroy workflow expectations are missing.",
    },
    {
      name: "Manual approval recorded",
      passed: approvalReady,
      detail: approvalReady ? gate.approval.evidence : "A platform approver must approve this gate.",
    },
    {
      name: "Authorized scope attached",
      passed: scopeReady,
      detail: scopeReady ? gate.pentestScope.reference : "Authorized lab scope remains required.",
    },
    {
      name: "Mutation kill switch enabled",
      passed: gate.mutationKillSwitch,
      detail: gate.mutationKillSwitch ? "Kill switch enabled." : "Kill switch is disabled by default.",
    },
  ];

  return {
    ...gate,
    status:
      gate.approval.status === "Rejected"
        ? "Blocked"
        : approvalReady
          ? scopeReady && gate.mutationKillSwitch
            ? "Approved for controlled create"
            : "Mutation disabled"
          : "Manual approval required",
    checks,
    provisioningEnabled: false,
  };
}

function createMockPlatformServiceRequest(
  input: { kind: PlatformServiceKind; owner: string; environmentName: string },
  profiles: ResourceProfile[],
  proofs: VmLifecycleProof[],
  actor: string
): PlatformServiceRequest {
  const defaults: Record<PlatformServiceKind, { provider: ResourceProfile["provider"]; profileId: string; name: string; cost: number; approvalRequired: boolean }> = {
    "NKP Namespace": { provider: "NKP", profileId: "nkp-1-30-standard", name: "app-namespace-dev", cost: 480, approvalRequired: false },
    "NDB PostgreSQL": { provider: "NDB", profileId: "ndb-postgres-16-dev", name: "app-postgres-dev", cost: 720, approvalRequired: true },
    "NUS Storage": { provider: "NUS", profileId: "nus-object-dev", name: "app-object-dev", cost: 260, approvalRequired: false },
    "NAI Endpoint": { provider: "NAI", profileId: "nai-gpu-small", name: "app-ai-endpoint-dev", cost: 1380, approvalRequired: true },
  };
  const config = defaults[input.kind];
  const profile = profiles.find((item) => item.id === config.profileId);
  const vmLifecycleProven = proofs.some((proof) => proof.status === "Verified");
  const validations = [
    {
      name: "Profile published",
      passed: profile?.status === "Published",
      detail: profile ? `${profile.name} is ${profile.status}.` : "Required profile was not found.",
    },
    {
      name: "Provider matched",
      passed: profile?.provider === config.provider,
      detail: `Expected provider ${config.provider}.`,
    },
    {
      name: "Service name valid",
      passed: true,
      detail: `${config.name} will be used as the service identifier.`,
    },
    {
      name: "Environment mapped",
      passed: Boolean(input.environmentName),
      detail: `${input.environmentName} is the owning environment reference.`,
    },
    {
      name: "VM lifecycle proven",
      passed: vmLifecycleProven,
      detail: vmLifecycleProven
        ? "Controlled VM lifecycle proof is present."
        : "Complete controlled VM create, verify, rollback, and destroy proof before platform services are enabled.",
    },
  ];

  return {
    id: `platform-service-${config.provider.toLowerCase()}-${Date.now()}`,
    kind: input.kind,
    serviceName: config.name,
    environmentName: input.environmentName,
    owner: input.owner,
    profileId: config.profileId,
    profileName: profile?.name ?? "Profile not found",
    provider: config.provider,
    status: validations.every((validation) => validation.passed)
      ? config.approvalRequired
        ? "Needs approval"
        : "Ready for approval"
      : "Blocked",
    dependsOnVmLifecycle: true,
    vmLifecycleProven,
    validations,
    estimatedMonthlyCost: config.cost,
    approvalRequired: config.approvalRequired,
    approvalEvidence: [
      profile?.approvedBy ? `${profile.name} approved by ${profile.approvedBy}.` : "Profile approval is missing.",
      vmLifecycleProven ? "VM lifecycle proof is present." : "VM lifecycle proof is required before platform-service provisioning.",
      `Request planned by ${actor}; provisioning remains disabled.`,
    ],
    rollbackPlan: ["Reverse service-specific bindings before releasing the request."],
    cleanupPlan: ["Verify service allocation, access policy, and owner metadata are removed."],
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function nextRegistryStatus(action: "submit" | "approve" | "deprecate" | "restore"): RegistryStatus {
  switch (action) {
    case "submit":
      return "Pending approval";
    case "approve":
      return "Published";
    case "deprecate":
      return "Deprecated";
    case "restore":
      return "Draft";
  }
}

function transitionTemplateRegistryEntry(
  entry: TemplateRegistryEntry,
  action: "submit" | "approve" | "deprecate" | "restore",
  actor: string
): TemplateRegistryEntry {
  const status = nextRegistryStatus(action);
  return {
    ...entry,
    status,
    lastChangedAt: new Date().toISOString().slice(0, 10),
    approvalEvidence: registryActionEvidence(action, actor),
  };
}

function transitionResourceProfile(
  profile: ResourceProfile,
  action: "submit" | "approve" | "deprecate" | "restore",
  actor: string
): ResourceProfile {
  const status = nextRegistryStatus(action);
  return {
    ...profile,
    status,
    approvedBy: status === "Published" ? actor : profile.approvedBy,
    approvedAt: status === "Published" ? new Date().toISOString() : profile.approvedAt,
  };
}

function registryActionEvidence(action: "submit" | "approve" | "deprecate" | "restore", actor: string) {
  switch (action) {
    case "submit":
      return `Submitted for owner approval by ${actor}.`;
    case "approve":
      return `Published by ${actor} after simulated owner approval.`;
    case "deprecate":
      return `Deprecated by ${actor}; blocked for future real provisioning selection.`;
    case "restore":
      return `Restored to draft by ${actor} for revision.`;
  }
}

function replaceIntegrationConfig(configs: IntegrationConfig[], updated: IntegrationConfig) {
  return [updated, ...configs.filter((item) => item.name !== updated.name)].sort((a, b) => a.name.localeCompare(b.name));
}

function replaceLabAdapter(adapters: LabAdapterSnapshot[], updated: LabAdapterSnapshot) {
  return [updated, ...adapters.filter((item) => item.name !== updated.name)].sort((a, b) => a.name.localeCompare(b.name));
}

function createMockSystemStatus(
  session: PlatformSession,
  configs: IntegrationConfig[],
  adapters: LabAdapterSnapshot[]
): SystemStatus {
  return {
    api: "Healthy",
    storage: "Ready",
    session,
    integrations: {
      total: configs.length,
      configured: configs.filter((item) => item.status === "Configured").length,
      reachable: configs.filter((item) => item.status === "Reachable").length,
      readOnlyCandidates: adapters.filter((item) => item.mode === "Read-only candidate").length,
    },
    provisioningEnabled: false,
  };
}

function createMockControlPlaneJob(
  environment: Environment,
  template: Template,
  targets: Target[]
): ControlPlaneJob {
  const now = new Date().toISOString();
  const approvalRequired = environment.status === "Needs approval";
  return {
    id: `cp-${environment.name}`,
    environmentName: environment.name,
    template: template.name,
    owner: environment.owner,
    targets,
    operation: "Provision",
    state: approvalRequired ? "AwaitingApproval" : "Queued",
    attempts: 0,
    maxAttempts: 3,
    worker: "MockOrchestrator",
    provisioningEnabled: false,
    queuedAt: now,
    updatedAt: now,
    transitions: [
      {
        state: approvalRequired ? "AwaitingApproval" : "Queued",
        actor: "browser.mock",
        message: approvalRequired ? "Job paused for approval." : "Job queued for mock validation.",
        createdAt: now,
      },
    ],
  };
}

function createMockDestroyControlPlaneJob(environment: Environment): ControlPlaneJob {
  const now = new Date().toISOString();
  return {
    id: `cp-destroy-${environment.name}`,
    environmentName: environment.name,
    template: environment.template,
    owner: environment.owner,
    targets: ["VM", "Storage"],
    operation: "Destroy",
    state: "Destroying",
    attempts: 0,
    maxAttempts: 3,
    worker: "MockOrchestrator",
    provisioningEnabled: false,
    queuedAt: now,
    updatedAt: now,
    transitions: [
      {
        state: "Destroying",
        actor: "browser.mock",
        message: "Destroy job queued. Teardown is simulated and real infrastructure mutation is disabled.",
        createdAt: now,
      },
    ],
  };
}

function transitionMockControlPlaneJob(
  job: ControlPlaneJob,
  action: "advance" | "retry" | "fail"
): ControlPlaneJob {
  const now = new Date().toISOString();
  const nextState =
    action === "retry"
      ? "Queued"
      : action === "fail"
        ? "Failed"
        : job.state === "Queued"
          ? "Validating"
          : job.state === "Validating"
            ? "Provisioning"
            : job.state === "Provisioning"
              ? "Ready"
              : job.state === "Destroying"
                ? "Destroyed"
              : job.state;
  const message =
    action === "retry"
      ? "Retry requested. Job returned to queue."
      : action === "fail"
        ? "Manual failure simulation from admin console."
        : "Mock worker advanced the job state.";

  return {
    ...job,
    state: nextState,
    attempts: nextState === "Provisioning" ? job.attempts + 1 : job.attempts,
    updatedAt: now,
    lastError: action === "fail" ? message : undefined,
    transitions: [
      {
        state: nextState,
        actor: "browser.mock",
        message,
        createdAt: now,
      },
      ...job.transitions,
    ],
  };
}

function deriveMockApprovals(environments: Environment[]): ApprovalRequest[] {
  return environments
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

function createMockEnvironmentDetail(
  environments: Environment[],
  approvals: ApprovalRequest[],
  environmentName: string
): EnvironmentDetail | null {
  const environment = environments.find((item) => item.name === environmentName) ?? environments[0];
  if (!environment) {
    return null;
  }

  return {
    environment,
    jobs: provisioningEvents.map((event, index) => ({
      id: `${environment.name}-job-${index}`,
      environmentName: environment.name,
      state: index < 3 ? "completed" : environment.status.toLowerCase(),
      message: event.detail,
      createdAt: new Date(Date.now() - (provisioningEvents.length - index) * 60000).toISOString(),
    })),
    approvals: approvals.filter((approval) => approval.environmentName === environment.name),
    auditEvents: [
      {
        id: `${environment.name}-audit-requested`,
        action: "environment.requested",
        actor: environment.owner,
        target: environment.name,
        createdAt: environment.createdAt,
      },
      {
        id: `${environment.name}-audit-status`,
        action: "environment.status.updated",
        actor: "mock.platform",
        target: environment.name,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function jobHeadline(jobState: JobState) {
  switch (jobState) {
    case "Queued":
      return "Provisioning job queued";
    case "Running":
      return "Provisioning workflow running";
    case "Approval":
      return "Approval required before activation";
    case "Complete":
      return "Environment ready";
    case "Failed":
      return "Provisioning needs attention";
    case "Idle":
      return "Create an environment to see status";
  }
}

function timelineClass(index: number, jobStep: number, jobState: JobState) {
  if (jobState === "Approval" && index >= jobStep) {
    return "approvalStep";
  }
  if (index < jobStep || jobState === "Complete") {
    return "completeStep";
  }
  if (index === jobStep) {
    return "activeStep";
  }
  return "";
}

function timelineLabel(index: number, jobStep: number, jobState: JobState) {
  if (jobState === "Approval" && index >= jobStep) {
    return "Approval";
  }
  if (index < jobStep || jobState === "Complete") {
    return "Complete";
  }
  if (index === jobStep) {
    return jobState === "Queued" ? "Queued" : "Running";
  }
  return "Waiting";
}
