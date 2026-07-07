import type {
  PlatformServiceAdapterContractReview,
  PlatformServiceKind,
  PlatformServiceRequest,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreatePlatformServiceAdapterContractReviewRequest } from "./types";

export class PlatformServiceAdapterContractError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export interface PlatformServiceAdapterContract {
  validate(state: ApiState, input: CreatePlatformServiceAdapterContractReviewRequest): PlatformServiceAdapterContractReview;
  mapPayload(serviceRequest: PlatformServiceRequest): PlatformServiceAdapterContractReview["payload"];
  execute(): never;
  poll(): never;
  rollback(): never;
}

const approvedPayloadFields: Array<keyof PlatformServiceAdapterContractReview["payload"]> = [
  "kind",
  "provider",
  "serviceName",
  "environmentName",
  "owner",
  "profileId",
  "profileName",
  "estimatedMonthlyCost",
  "approvalRequired",
  "rollbackPlan",
  "cleanupPlan",
];

export function createDisabledPlatformServiceAdapterContract(actor: string): PlatformServiceAdapterContract {
  return {
    validate(state, input) {
      const serviceRequest = findServiceRequest(state, input);
      const preflightRun = state.platformServicePreflightRuns.find((run) => run.requestId === serviceRequest.id);
      const payload = this.mapPayload(serviceRequest);
      const disallowedFields = Object.keys(payload).filter(
        (field) => !approvedPayloadFields.includes(field as keyof PlatformServiceAdapterContractReview["payload"])
      );
      const realAdapterEnabled = process.env[`NDC_${serviceRequest.provider}_REAL_ADAPTER_ENABLED`] === "true";
      const checks = [
        {
          name: "Request validations passed",
          passed: serviceRequest.validations.every((validation) => validation.passed),
          detail: `Request status is ${serviceRequest.status}.`,
        },
        {
          name: "Preflight run recorded",
          passed: Boolean(preflightRun),
          detail: preflightRun ? `Preflight status is ${preflightRun.status}.` : "Service preflight must be recorded.",
        },
        {
          name: "Payload fields approved",
          passed: disallowedFields.length === 0,
          detail:
            disallowedFields.length === 0
              ? "Mapped payload only uses approved service fields."
              : `Disallowed fields: ${disallowedFields.join(", ")}.`,
        },
        {
          name: "Execute path disabled",
          passed: !realAdapterEnabled,
          detail: realAdapterEnabled
            ? `${serviceRequest.provider} real adapter switch must remain disabled in this phase.`
            : "Execute, poll, and rollback remain disabled.",
        },
      ];

      return {
        id: `service-contract-${serviceRequest.provider.toLowerCase()}-${serviceRequest.serviceName}-${Date.now()}`,
        requestId: serviceRequest.id,
        preflightRunId: preflightRun?.id,
        kind: serviceRequest.kind,
        serviceName: serviceRequest.serviceName,
        provider: serviceRequest.provider,
        adapterMode: "Disabled real adapter",
        status: checks.every((check) => check.passed) ? "Payload ready but execution disabled" : "Blocked",
        requestedBy: actor,
        payload,
        checks,
        blockedOperations: blockedOperationsFor(serviceRequest.kind),
        killSwitch: {
          name: `NDC_${serviceRequest.provider}_REAL_ADAPTER_ENABLED`,
          enabled: realAdapterEnabled,
        },
        provisioningEnabled: false,
        createdAt: new Date().toISOString(),
      };
    },
    mapPayload(serviceRequest) {
      return {
        kind: serviceRequest.kind,
        provider: serviceRequest.provider,
        serviceName: serviceRequest.serviceName,
        environmentName: serviceRequest.environmentName,
        owner: serviceRequest.owner,
        profileId: serviceRequest.profileId,
        profileName: serviceRequest.profileName,
        estimatedMonthlyCost: serviceRequest.estimatedMonthlyCost,
        approvalRequired: serviceRequest.approvalRequired,
        rollbackPlan: serviceRequest.rollbackPlan,
        cleanupPlan: serviceRequest.cleanupPlan,
      };
    },
    execute() {
      throw new PlatformServiceAdapterContractError(
        "platform_service_execute_disabled",
        "Platform service execution is disabled."
      );
    },
    poll() {
      throw new PlatformServiceAdapterContractError(
        "platform_service_poll_disabled",
        "Platform service polling is disabled."
      );
    },
    rollback() {
      throw new PlatformServiceAdapterContractError(
        "platform_service_rollback_disabled",
        "Platform service rollback is disabled."
      );
    },
  };
}

function findServiceRequest(
  state: ApiState,
  input: CreatePlatformServiceAdapterContractReviewRequest
): PlatformServiceRequest {
  const serviceRequest =
    (input.requestId ? state.platformServiceRequests.find((item) => item.id === input.requestId) : undefined) ??
    (input.kind ? state.platformServiceRequests.find((item) => item.kind === input.kind) : state.platformServiceRequests[0]);

  if (!serviceRequest) {
    throw new PlatformServiceAdapterContractError(
      "platform_service_request_required",
      "A platform-service request is required."
    );
  }

  return serviceRequest;
}

function blockedOperationsFor(kind: PlatformServiceKind) {
  switch (kind) {
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
