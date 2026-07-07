import type { ProviderReleaseGateRecord, ProviderReleaseReadinessSummary } from "../src/data/cloudStudioDomain";
import { blockedProviderOperations } from "./adapterEnablement";
import { getActiveLabAuthorizationScope, isLabScopeReadyForProvider } from "./authorizationEvidence";
import { createCredentialReferenceDiagnostics } from "./credentialReferences";
import { createAuditRetentionDiagnostics } from "./privateCloudOperations";
import type { ApiState, CreateProviderReleaseGateRecordRequest } from "./types";

export class ProviderReleaseGateError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const releaseGateProviders: ProviderReleaseGateRecord["provider"][] = ["NCI", "NKP", "NDB", "NUS", "NAI"];

export function createProviderReleaseReadinessSummary(state: ApiState): ProviderReleaseReadinessSummary {
  const providers: ProviderReleaseReadinessSummary["providers"] = releaseGateProviders.map((provider) => {
    const latestGate = state.providerReleaseGateRecords.find((record) => record.provider === provider);
    const gaps = latestGate?.checks.filter((check) => !check.passed).map((check) => check.name) ?? [
      "Provider release gate not reviewed",
    ];
    const passedChecks = latestGate?.checks.filter((check) => check.passed).length ?? 0;
    const checkCount = latestGate?.checks.length ?? 0;

    return {
      provider,
      latestGateId: latestGate?.id,
      status: latestGate?.status ?? "No gate",
      checkCount,
      passedChecks,
      gapCount: gaps.length,
      gaps,
      blockedOperations: latestGate?.blockedOperations ?? blockedProviderOperations(provider),
      killSwitch: latestGate?.killSwitch ?? {
        name: `NDC_${provider}_REAL_ADAPTER_ENABLED`,
        enabled: process.env[`NDC_${provider}_REAL_ADAPTER_ENABLED`] === "true",
      },
    };
  });

  const reviewedProviders = providers.filter((provider) => provider.checkCount > 0);
  const nearestToReady = [...reviewedProviders].sort(
    (a, b) => b.passedChecks - a.passedChecks || a.gapCount - b.gapCount
  )[0]?.provider;
  const mostBlocked = [...providers].sort((a, b) => b.gapCount - a.gapCount || a.passedChecks - b.passedChecks)[0]
    ?.provider;

  return {
    generatedAt: new Date().toISOString(),
    providers,
    nearestToReady,
    mostBlocked,
    provisioningEnabled: false,
  };
}

export function createProviderReleaseGateRecord(
  state: ApiState,
  request: CreateProviderReleaseGateRecordRequest,
  actor: string
): ProviderReleaseGateRecord {
  const provider = request.provider ?? "NCI";
  if (!releaseGateProviders.includes(provider)) {
    throw new ProviderReleaseGateError("provider_release_gate_invalid", `Unsupported provider release gate: ${provider}`);
  }

  const adapter = state.provisioningAdapters.find((item) => item.name === provider);
  const activeScope = getActiveLabAuthorizationScope(state);
  const scopeReady = isLabScopeReadyForProvider(activeScope, provider);
  const credentialDiagnostic = createCredentialReferenceDiagnostics(state.integrationConfigs).find(
    (item) => item.provider === provider
  );
  const lifecycleProof = state.vmLifecycleProofs.find((proof) => proof.status === "Verified");
  const adapterEnablement = state.adapterEnablementRecords.find(
    (record) => record.provider === provider && record.status === "Ready for review"
  );
  const auditRetention = createAuditRetentionDiagnostics(state);
  const auditExportReady = state.auditExports.length > 0 && auditRetention.exportDestination.valid;
  const releaseApprover = request.releaseApprover?.trim() || "Cloud Platform Owner";
  const realAdapterEnabled = process.env[`NDC_${provider}_REAL_ADAPTER_ENABLED`] === "true";
  const providerEvidence = findProviderEvidence(state, provider);
  const checks = [
    {
      name: "Approved lab scope",
      passed: scopeReady,
      detail: activeScope ? `${activeScope.id} covers ${provider}.` : "Active lab scope is required.",
    },
    {
      name: "Credential reference approved",
      passed: credentialDiagnostic?.status === "Approved reference",
      detail: `${provider} credential diagnostic is ${credentialDiagnostic?.status ?? "Missing"}.`,
    },
    {
      name: "VM lifecycle proof verified",
      passed: Boolean(lifecycleProof),
      detail: lifecycleProof ? lifecycleProof.id : "Verified VM lifecycle proof is required.",
    },
    {
      name: "Adapter enablement ready",
      passed: Boolean(adapterEnablement),
      detail: adapterEnablement ? adapterEnablement.id : `${provider} adapter enablement review is required.`,
    },
    {
      name: "Provider contract evidence ready",
      passed: Boolean(providerEvidence.contractId),
      detail: providerEvidence.contractId ?? `${provider} contract review is required.`,
    },
    {
      name: "Provider preflight recorded",
      passed: Boolean(providerEvidence.preflightId),
      detail: providerEvidence.preflightId ?? `${provider} preflight evidence is required.`,
    },
    {
      name: "Audit export ready",
      passed: auditExportReady,
      detail: auditExportReady ? "Audit export manifest exists and destination reference is valid." : "Audit export evidence is required.",
    },
    {
      name: "Release approver assigned",
      passed: Boolean(releaseApprover),
      detail: releaseApprover || "Release approver is required.",
    },
    {
      name: "Real adapter disabled",
      passed: !realAdapterEnabled && adapter?.provisioningEnabled === false,
      detail: realAdapterEnabled ? `${provider} real adapter switch is enabled.` : `${provider} real adapter switch remains disabled.`,
    },
  ];

  return {
    id: `provider-release-${provider.toLowerCase()}-${Date.now()}`,
    provider,
    product: adapter?.product ?? provider,
    status: checks.every((check) => check.passed) ? "Ready for release review" : "Blocked",
    requestedBy: actor,
    releaseApprover,
    checks,
    evidence: [
      `Lab scope: ${activeScope?.id ?? "missing"}.`,
      `Credential diagnostic: ${credentialDiagnostic?.status ?? "missing"}.`,
      `Lifecycle proof: ${lifecycleProof?.id ?? "missing"}.`,
      `Adapter enablement: ${adapterEnablement?.id ?? "missing"}.`,
      `Provider contract: ${providerEvidence.contractId ?? "missing"}.`,
      `Provider preflight: ${providerEvidence.preflightId ?? "missing"}.`,
      `Audit exports prepared: ${state.auditExports.length}.`,
      `Release approver: ${releaseApprover}.`,
    ],
    blockedOperations: blockedProviderOperations(provider),
    killSwitch: {
      name: `NDC_${provider}_REAL_ADAPTER_ENABLED`,
      enabled: realAdapterEnabled,
    },
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findProviderEvidence(state: ApiState, provider: ProviderReleaseGateRecord["provider"]) {
  if (provider === "NCI") {
    const contract = state.ahvCreateAdapterContractReviews.find((review) => review.status === "Payload ready but execution disabled");
    const preflight = state.ahvControlledProvisioningRuns.find((run) => run.status === "Ready but disabled");
    return {
      contractId: contract?.id,
      preflightId: preflight?.id,
    };
  }

  const contract = state.platformServiceAdapterContractReviews.find(
    (review) => review.provider === provider && review.status === "Payload ready but execution disabled"
  );
  const preflight = state.platformServicePreflightRuns.find(
    (run) => run.provider === provider && run.status === "Ready but disabled"
  );
  return {
    contractId: contract?.id,
    preflightId: preflight?.id,
  };
}
