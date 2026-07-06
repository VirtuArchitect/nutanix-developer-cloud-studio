import type {
  AdapterEnablementRecord,
  ProvisioningAdapterName,
} from "../src/data/cloudStudioDomain";
import { createCredentialReferenceDiagnostics } from "./credentialReferences";
import { createAuditRetentionDiagnostics } from "./privateCloudOperations";
import type { ApiState, CreateAdapterEnablementRecordRequest } from "./types";

export class AdapterEnablementError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const providers: ProvisioningAdapterName[] = ["NCI", "NKP", "NDB", "NUS", "NCM", "NAI"];

export function createAdapterEnablementRecord(
  state: ApiState,
  request: CreateAdapterEnablementRecordRequest,
  actor: string
): AdapterEnablementRecord {
  const provider = request.provider ?? "NCI";
  if (!providers.includes(provider)) {
    throw new AdapterEnablementError("adapter_provider_invalid", `Unsupported adapter provider: ${provider}`);
  }

  const adapter = state.provisioningAdapters.find((item) => item.name === provider);
  const config = state.integrationConfigs.find((item) => item.name === provider);
  const credentialDiagnostic = createCredentialReferenceDiagnostics(state.integrationConfigs).find(
    (item) => item.provider === provider
  );
  const activeScope = state.labAuthorizationScopes.find(
    (scope) => scope.status === "Approved" && scope.pentestScopeStructurallyValid
  );
  const auditRetention = createAuditRetentionDiagnostics(state);
  const auditExportReady = state.auditExports.length > 0 && auditRetention.exportDestination.valid;
  const rollbackOwner = request.rollbackOwner?.trim() || "Cloud Operations";
  const realAdapterSwitchEnabled = process.env[`NDC_${provider}_REAL_ADAPTER_ENABLED`] === "true";
  const checks = [
    {
      name: "Approved lab scope",
      passed: Boolean(activeScope),
      detail: activeScope
        ? `${activeScope.project} / ${activeScope.cluster} / ${activeScope.network}`
        : "Approved lab scope with structurally valid pentest reference is required.",
    },
    {
      name: "Credential reference approved",
      passed: credentialDiagnostic?.status === "Approved reference",
      detail:
        credentialDiagnostic?.status === "Approved reference"
          ? `${provider} stores credential profile reference ${credentialDiagnostic.credentialProfile}.`
          : `${provider} credential profile reference is ${credentialDiagnostic?.status ?? "Missing"}.`,
    },
    {
      name: "Provider readiness reachable",
      passed: config?.status === "Reachable",
      detail: config?.status === "Reachable" ? `${provider} integration is reachable.` : `${provider} integration is not reachable.`,
    },
    {
      name: "Adapter readiness configured",
      passed: adapter?.configured === true,
      detail: adapter?.configured ? `${provider} adapter planning record is configured.` : `${provider} adapter readiness is incomplete.`,
    },
    {
      name: "Audit export ready",
      passed: auditExportReady,
      detail: auditExportReady
        ? "Audit export manifest exists and destination reference is valid."
        : "Prepare audit export evidence before adapter enablement review.",
    },
    {
      name: "Rollback owner assigned",
      passed: Boolean(rollbackOwner),
      detail: rollbackOwner ? `${rollbackOwner} owns rollback and disablement.` : "Rollback owner is required.",
    },
    {
      name: "Real adapter disabled",
      passed: !realAdapterSwitchEnabled && adapter?.provisioningEnabled === false,
      detail: realAdapterSwitchEnabled
        ? `${provider} real adapter switch is enabled; this contract phase must remain disabled.`
        : `${provider} real adapter switch remains disabled.`,
    },
  ];
  const readyForReview =
    checks.every((check) => check.passed) &&
    adapter?.provisioningEnabled === false &&
    !realAdapterSwitchEnabled;

  return {
    id: `adapter-enable-${provider.toLowerCase()}-${Date.now()}`,
    provider,
    product: adapter?.product ?? provider,
    status: readyForReview ? "Ready for review" : "Blocked",
    reviewer: actor,
    rollbackOwner,
    checks,
    evidence: [
      `Lab scope: ${activeScope?.id ?? "missing"}.`,
      `Credential diagnostic: ${credentialDiagnostic?.status ?? "missing"}.`,
      `Provider readiness: ${config?.status ?? "missing"}.`,
      `Audit exports prepared: ${state.auditExports.length}.`,
      "Real adapter mutation remains disabled pending separate authorization and pentest scope.",
    ],
    mutationOperationsBlocked: blockedProviderOperations(provider),
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function blockedProviderOperations(provider: ProvisioningAdapterName) {
  switch (provider) {
    case "NCI":
      return ["create_vm", "clone_vm", "power_on_vm", "power_off_vm", "delete_vm", "update_vm_category"];
    case "NKP":
      return ["create_namespace", "apply_quota", "apply_network_policy", "delete_namespace"];
    case "NDB":
      return ["create_database", "restore_database", "rotate_database_access", "delete_database"];
    case "NUS":
      return ["create_share", "create_bucket", "update_lifecycle_rule", "delete_storage_target"];
    case "NCM":
      return ["launch_blueprint", "update_policy", "attach_runbook", "delete_blueprint_instance"];
    case "NAI":
      return ["create_endpoint", "allocate_gpu", "publish_route", "delete_endpoint"];
  }
}
