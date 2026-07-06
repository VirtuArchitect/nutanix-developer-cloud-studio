import type { PlatformServicePreflightRun, PlatformServiceRequest } from "../src/data/cloudStudioDomain";
import type { ApiState, CreatePlatformServicePreflightRunRequest } from "./types";

export class PlatformServicePreflightError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export interface PlatformServicePreflightAdapter {
  readonly mode: PlatformServicePreflightRun["adapterMode"];
  preflight(state: ApiState, input: CreatePlatformServicePreflightRunRequest, actor: string): PlatformServicePreflightRun;
}

export function createDisabledPlatformServicePreflightAdapter(): PlatformServicePreflightAdapter {
  return {
    mode: "Disabled real adapter",
    preflight(state, input, actor) {
      const serviceRequest = findRequest(state, input);
      const providerReady = state.integrationConfigs.find((item) => item.name === serviceRequest.provider)?.status === "Reachable";
      const adapterReady = state.provisioningAdapters.find((item) => item.name === serviceRequest.provider)?.configured === true;
      const adapterSwitchEnabled = process.env[`NDC_${serviceRequest.provider}_REAL_ADAPTER_ENABLED`] === "true";
      const validationsPassed = serviceRequest.validations.every((validation) => validation.passed);
      const checks = [
        {
          name: "Request validations passed",
          passed: validationsPassed,
          detail: validationsPassed ? "Platform-service request validations passed." : "Request validations are still blocked.",
        },
        {
          name: "VM lifecycle proven",
          passed: serviceRequest.vmLifecycleProven,
          detail: serviceRequest.vmLifecycleProven ? "VM lifecycle proof is present." : "VM lifecycle proof is required.",
        },
        {
          name: "Provider readiness checked",
          passed: providerReady,
          detail: providerReady ? `${serviceRequest.provider} integration is reachable.` : `${serviceRequest.provider} integration is not reachable.`,
        },
        {
          name: "Adapter configured",
          passed: adapterReady,
          detail: adapterReady ? `${serviceRequest.provider} adapter is configured.` : `${serviceRequest.provider} adapter is not configured.`,
        },
        {
          name: "Real adapter switch enabled",
          passed: adapterSwitchEnabled,
          detail: adapterSwitchEnabled
            ? `${serviceRequest.provider} real adapter switch is enabled.`
            : `${serviceRequest.provider} real adapter switch is disabled.`,
        },
      ];
      const ready = checks.every((check) => check.passed);

      return {
        id: `platform-preflight-${serviceRequest.provider.toLowerCase()}-${serviceRequest.serviceName}-${Date.now()}`,
        requestId: serviceRequest.id,
        kind: serviceRequest.kind,
        serviceName: serviceRequest.serviceName,
        provider: serviceRequest.provider,
        adapterMode: "Disabled real adapter",
        status: ready ? "Ready but disabled" : "Preflight blocked",
        checks,
        requestedBy: actor,
        mutationOperationsBlocked: blockedOperationsFor(serviceRequest),
        provisioningEnabled: false,
        createdAt: new Date().toISOString(),
      };
    },
  };
}

function findRequest(state: ApiState, input: CreatePlatformServicePreflightRunRequest): PlatformServiceRequest {
  const serviceRequest =
    (input.requestId ? state.platformServiceRequests.find((item) => item.id === input.requestId) : undefined) ??
    (input.kind ? state.platformServiceRequests.find((item) => item.kind === input.kind) : state.platformServiceRequests[0]);

  if (!serviceRequest) {
    throw new PlatformServicePreflightError("platform_service_request_required", "A platform-service request is required.");
  }

  return serviceRequest;
}

function blockedOperationsFor(serviceRequest: PlatformServiceRequest) {
  switch (serviceRequest.kind) {
    case "NKP Namespace":
      return ["create_namespace", "apply_quota", "apply_network_policy", "delete_namespace"];
    case "NDB PostgreSQL":
      return ["create_database", "restore_database", "delete_database", "rotate_database_access"];
    case "NUS Storage":
      return ["create_bucket", "create_share", "update_lifecycle_rule", "delete_storage_target"];
    case "NAI Endpoint":
      return ["create_endpoint", "allocate_gpu", "publish_route", "delete_endpoint"];
  }
}
