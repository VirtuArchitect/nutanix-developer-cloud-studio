import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import {
  AdapterEnablementError,
  createAdapterEnablementRecord,
} from "./adapterEnablement";
import {
  AhvControlledProvisioningError,
  createDisabledAhvControlledProvisioningAdapter,
} from "./ahvControlledProvisioning";
import {
  AhvCreateAdapterContractError,
  createDisabledAhvCreateAdapterContract,
} from "./ahvCreateAdapterContract";
import {
  AuthorizationEvidenceError,
  createLabScopeDiagnostics,
  createLabAuthorizationScope,
  createVmLifecycleProof,
} from "./authorizationEvidence";
import {
  advanceControlPlaneJob,
  ControlPlaneError,
  failControlPlaneJob,
  retryControlPlaneJob,
} from "./controlPlane";
import {
  assertCredentialReference,
  createCredentialReferenceDiagnostics,
  CredentialReferenceError,
} from "./credentialReferences";
import {
  ControlledProvisioningError,
  createControlledProvisioningGate,
  decideControlledProvisioningGate,
} from "./controlledProvisioning";
import {
  ControlledCreateAuthorizationError,
  createControlledCreateAuthorizationEnvelope,
} from "./controlledCreateAuthorization";
import {
  ControlledLabReleaseRunbookError,
  createControlledLabReleaseRunbookRecord,
} from "./controlledLabReleaseRunbook";
import {
  ControlledLabExecutionApprovalError,
  createControlledLabExecutionApprovalGate,
} from "./controlledLabExecutionApproval";
import {
  ControlledLabExecutionRehearsalPacketError,
  createControlledLabExecutionRehearsalPacket,
} from "./controlledLabExecutionRehearsalPacket";
import {
  ControlledLabDryRunWindowError,
  createControlledLabDryRunWindowRecord,
} from "./controlledLabDryRunWindow";
import {
  createLabWindowEvidenceExportRecord,
  LabWindowEvidenceExportError,
} from "./labWindowEvidenceExport";
import {
  createLabEvidenceReviewRecord,
  LabEvidenceReviewError,
} from "./labEvidenceReview";
import {
  createLabExecutionProposalEnvelope,
  LabExecutionProposalEnvelopeError,
} from "./labExecutionProposalEnvelope";
import {
  createLabExecutionProposalExportRecord,
  LabExecutionProposalExportError,
} from "./labExecutionProposalExport";
import {
  createEnvironmentRequest,
  decideApproval,
  requestEnvironmentDestroy,
  RequestValidationError,
} from "./mockPlatform";
import { createPlatformServiceRequest, PlatformServiceError } from "./platformServices";
import {
  createDisabledPlatformServiceAdapterContract,
  PlatformServiceAdapterContractError,
} from "./platformServiceAdapterContract";
import {
  createDisabledPlatformServicePreflightAdapter,
  PlatformServicePreflightError,
} from "./platformServicePreflight";
import {
  createAuditExportRecord,
  createAuditRetentionDiagnostics,
  createLifecycleOperationRecord,
  PrivateCloudOperationError,
} from "./privateCloudOperations";
import {
  createProviderReleaseGateRecord,
  createProviderReleaseReadinessSummary,
  ProviderReleaseGateError,
} from "./providerReleaseGate";
import {
  createReleaseEvidenceExportRecord,
  ReleaseEvidenceExportError,
} from "./releaseEvidenceExport";
import {
  createRollbackDestroyProofRecord,
  RollbackDestroyProofError,
} from "./rollbackDestroyProof";
import { createProductionReadinessReview } from "./productionReadiness";
import {
  createDisabledRealPrismInventoryAdapter,
  createMockPrismInventoryAdapter,
  createPrismReadOnlyScope,
} from "./prismInventoryAdapter";
import {
  AuthorizationError,
  createRequestContext,
  createSessionDiagnostics,
  logRequest,
  MemoryRateLimiter,
  RateLimitError,
  requireRole,
  securityHeaders,
  type RequestContext,
} from "./security";
import type { ApiStore } from "./storage";
import { createVmSandboxDryRunPlan } from "./vmSandboxDryRun";
import type {
  IntegrationConfig,
  LabAdapterSnapshot,
  PrismInventoryImportResult,
  PrismInventoryRecord,
  RegistryStatus,
  ResourceProfile,
  SystemStatus,
} from "../src/data/cloudStudioDomain";
import type {
  ApiError,
  ApiResponse,
  ApiState,
  CreateAhvControlledProvisioningRunRequest,
  CreateAdapterEnablementRecordRequest,
  ControlledProvisioningDecisionRequest,
  CreateLabAuthorizationScopeRequest,
  CreateLifecycleOperationRequest,
  CreateEnvironmentRequest,
  CreateControlledProvisioningGateRequest,
  CreateControlledLabExecutionApprovalGateRequest,
  CreateControlledLabExecutionRehearsalPacketRequest,
  CreateControlledLabReleaseRunbookRequest,
  CreateControlledLabDryRunWindowRequest,
  CreateLabWindowEvidenceExportRequest,
  CreateLabEvidenceReviewRequest,
  CreateLabExecutionProposalEnvelopeRequest,
  CreateLabExecutionProposalExportRequest,
  CreatePlatformServiceRequest,
  CreatePlatformServiceAdapterContractReviewRequest,
  CreatePlatformServicePreflightRunRequest,
  CreateProviderReleaseGateRecordRequest,
  CreateReleaseEvidenceExportRequest,
  CreateRollbackDestroyProofRequest,
  CreateVmLifecycleProofRequest,
  CreateVmSandboxDryRunRequest,
  RegistryAction,
  UpdateIntegrationConfigRequest,
} from "./types";

export type ApiServerOptions = {
  store: ApiStore;
  staticDir?: string;
  rateLimiter?: MemoryRateLimiter;
};

export function createApiServer({ store, staticDir, rateLimiter = new MemoryRateLimiter() }: ApiServerOptions) {
  return createServer(async (request, response) => {
    let context: RequestContext | undefined;
    try {
      context = createRequestContext(request);
      response.setHeader("X-Request-Id", context.requestId);
      rateLimiter.check(request, context);
      await routeRequest(request, response, store, staticDir, context);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        sendJson(response, error.code === "unauthenticated" ? 401 : 403, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof RateLimitError) {
        response.setHeader("Retry-After", String(error.retryAfterSeconds));
        sendJson(response, 429, {
          error: {
            code: "rate_limited",
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof RequestValidationError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof CredentialReferenceError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof AdapterEnablementError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof RollbackDestroyProofError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledCreateAuthorizationError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof AhvCreateAdapterContractError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof PlatformServiceAdapterContractError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProviderReleaseGateError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ReleaseEvidenceExportError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledLabReleaseRunbookError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledLabExecutionApprovalError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledLabExecutionRehearsalPacketError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledLabDryRunWindowError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof LabWindowEvidenceExportError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof LabEvidenceReviewError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof LabExecutionProposalEnvelopeError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof LabExecutionProposalExportError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      console.error(error);
      sendJson(response, 500, {
        error: {
          code: "internal_error",
          message: "Unexpected server error.",
        },
      });
    } finally {
      if (context) {
        logRequest(request, response, context);
      }
    }
  });
}

async function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  store: ApiStore,
  staticDir: string | undefined,
  context: RequestContext
) {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "GET" && url.pathname === "/healthz") {
    sendJson(response, 200, { data: { ok: true } });
    return;
  }

  if (request.method === "GET" && url.pathname === "/readyz") {
    await store.load();
    sendJson(response, 200, { data: { ready: true } });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    await routeApi(request, response, store, url, context);
    return;
  }

  if (request.method === "GET" && staticDir) {
    await serveStatic(response, staticDir, url.pathname);
    return;
  }

  sendJson(response, 404, {
    error: {
      code: "not_found",
      message: "Route not found.",
    },
  });
}

async function routeApi(
  request: IncomingMessage,
  response: ServerResponse,
  store: ApiStore,
  url: URL,
  context: RequestContext
) {
  const state = await store.load();
  state.session = context.session;

  if (request.method === "GET" && url.pathname === "/api/templates") {
    sendJson(response, 200, { data: state.templates });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/session") {
    sendJson(response, 200, { data: context.session });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/session/diagnostics") {
    sendJson(response, 200, { data: createSessionDiagnostics(context, request) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/system/status") {
    sendJson(response, 200, { data: createSystemStatus(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/environments") {
    sendJson(response, 200, { data: state.environments });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/integrations") {
    sendJson(response, 200, { data: state.integrations });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/integration-config") {
    sendJson(response, 200, { data: state.integrationConfigs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provider-credentials/diagnostics") {
    sendJson(response, 200, { data: createCredentialReferenceDiagnostics(state.integrationConfigs) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-adapters") {
    sendJson(response, 200, { data: state.labAdapters });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/inventory") {
    sendJson(response, 200, {
      data: {
        records: state.prismInventory,
        lastImport: state.prismInventoryImport,
      },
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/resource-profiles") {
    sendJson(response, 200, { data: state.resourceProfiles });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/policy-bundles") {
    sendJson(response, 200, { data: state.policyBundles });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/registry/templates") {
    sendJson(response, 200, { data: state.templateRegistry });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/platform/config") {
    sendJson(response, 200, { data: state.platformConfig });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provisioning/adapters") {
    sendJson(response, 200, { data: state.provisioningAdapters });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/adapter-enablement/records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.adapterEnablementRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provisioning-jobs") {
    sendJson(response, 200, { data: state.jobs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/control-plane/jobs") {
    sendJson(response, 200, { data: state.controlPlaneJobs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/vm-sandbox/dry-runs") {
    sendJson(response, 200, { data: state.vmSandboxDryRuns });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/vm-sandbox/controlled-provisioning") {
    sendJson(response, 200, { data: state.controlledProvisioningGates });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-authorization/scopes") {
    sendJson(response, 200, { data: state.labAuthorizationScopes });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-authorization/diagnostics") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createLabScopeDiagnostics(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/vm-lifecycle/proofs") {
    sendJson(response, 200, { data: state.vmLifecycleProofs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/vm-sandbox/rollback-destroy-proofs") {
    sendJson(response, 200, { data: state.rollbackDestroyProofs });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/vm-sandbox/controlled-create-authorization") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledCreateAuthorizationEnvelopes });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/ahv/create-adapter-contracts") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.ahvCreateAdapterContractReviews });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/ahv/controlled-provisioning/runs") {
    sendJson(response, 200, { data: state.ahvControlledProvisioningRuns });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/platform-services/requests") {
    sendJson(response, 200, { data: state.platformServiceRequests });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/platform-services/preflight-runs") {
    sendJson(response, 200, { data: state.platformServicePreflightRuns });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/platform-services/adapter-contracts") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.platformServiceAdapterContractReviews });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provider-release-gates") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.providerReleaseGateRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provider-release-readiness") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createProviderReleaseReadinessSummary(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/release-evidence-exports") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.releaseEvidenceExports });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/runbooks") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledLabReleaseRunbooks });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/windows") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledLabDryRunWindows });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/window-exports") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labWindowEvidenceExports });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/evidence-reviews") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labEvidenceReviews });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/proposal-envelopes") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labExecutionProposalEnvelopes });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/proposal-exports") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labExecutionProposalExports });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/execution-approvals") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledLabExecutionApprovals });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/rehearsal-packets") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledLabExecutionRehearsalPackets });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/production-readiness/reviews") {
    sendJson(response, 200, { data: state.productionReadinessReviews });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/private-cloud/lifecycle-operations") {
    sendJson(response, 200, { data: state.lifecycleOperations });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit-exports") {
    sendJson(response, 200, { data: state.auditExports });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit/retention") {
    sendJson(response, 200, { data: createAuditRetentionDiagnostics(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/approvals") {
    sendJson(response, 200, { data: state.approvals });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit-events") {
    sendJson(response, 200, { data: state.auditEvents });
    return;
  }

  const environmentMatch = url.pathname.match(/^\/api\/environments\/([^/]+)$/);
  if (request.method === "GET" && environmentMatch) {
    const environmentName = decodeURIComponent(environmentMatch[1]);
    const environment = state.environments.find((item) => item.name === environmentName);
    if (!environment) {
      sendJson(response, 404, {
        error: {
          code: "environment_not_found",
          message: `Environment not found: ${environmentName}`,
        },
      });
      return;
    }

    sendJson(response, 200, {
      data: {
        environment,
        jobs: state.jobs.filter((job) => job.environmentName === environmentName),
        controlPlaneJobs: state.controlPlaneJobs.filter((job) => job.environmentName === environmentName),
        approvals: state.approvals.filter((approval) => approval.environmentName === environmentName),
        auditEvents: state.auditEvents.filter((event) => event.target === environmentName),
      },
    });
    return;
  }

  const environmentDestroyMatch = url.pathname.match(/^\/api\/environments\/([^/]+)\/destroy$/);
  if (request.method === "POST" && environmentDestroyMatch) {
    requireRole(context, ["Platform Admin"]);
    try {
      const environment = requestEnvironmentDestroy(state, decodeURIComponent(environmentDestroyMatch[1]), context.session.user);
      await store.save(state);
      sendJson(response, 200, { data: environment });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  const templateRegistryActionMatch = url.pathname.match(/^\/api\/registry\/templates\/([^/]+)\/(submit|approve|deprecate|restore)$/);
  if (request.method === "POST" && templateRegistryActionMatch) {
    requireRole(context, ["Platform Admin"]);
    const templateId = decodeURIComponent(templateRegistryActionMatch[1]);
    const action = templateRegistryActionMatch[2] as RegistryAction;
    const entry = state.templateRegistry.find((item) => item.templateId === templateId);
    if (!entry) {
      sendJson(response, 404, {
        error: {
          code: "template_registry_entry_not_found",
          message: `Template registry entry not found: ${templateId}`,
        },
      });
      return;
    }

    const updated = {
      ...entry,
      status: nextRegistryStatus(action),
      lastChangedAt: new Date().toISOString().slice(0, 10),
      approvalEvidence: registryEvidence(action, state.session.user),
    };
    state.templateRegistry = state.templateRegistry.map((item) => (item.templateId === templateId ? updated : item));
    addAuditEvent(state, `registry.template.${action}`, state.session.user, templateId, {
      status: updated.status,
      version: updated.version,
    });
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  const resourceProfileActionMatch = url.pathname.match(/^\/api\/resource-profiles\/([^/]+)\/(submit|approve|deprecate|restore)$/);
  if (request.method === "POST" && resourceProfileActionMatch) {
    requireRole(context, ["Platform Admin"]);
    const profileId = decodeURIComponent(resourceProfileActionMatch[1]);
    const action = resourceProfileActionMatch[2] as RegistryAction;
    const profile = state.resourceProfiles.find((item) => item.id === profileId);
    if (!profile) {
      sendJson(response, 404, {
        error: {
          code: "resource_profile_not_found",
          message: `Resource profile not found: ${profileId}`,
        },
      });
      return;
    }

    const status = nextRegistryStatus(action);
    const updated = {
      ...profile,
      status,
      approvedBy: status === "Published" ? state.session.user : profile.approvedBy,
      approvedAt: status === "Published" ? new Date().toISOString() : profile.approvedAt,
      notes: `${profile.notes} Registry action ${action} recorded.`,
    };
    state.resourceProfiles = state.resourceProfiles.map((item) => (item.id === profileId ? updated : item));
    addAuditEvent(state, `registry.profile.${action}`, state.session.user, profileId, {
      status,
      provider: updated.provider,
    });
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/environments") {
    requireRole(context, ["Developer", "Platform Admin"]);
    try {
      const body = await readJson<CreateEnvironmentRequest>(request);
      const result = createEnvironmentRequest(state, body);
      await store.save(state);
      sendJson(response, 201, { data: result });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  const integrationConfigMatch = url.pathname.match(/^\/api\/integration-config\/([^/]+)$/);
  if (request.method === "PUT" && integrationConfigMatch) {
    requireRole(context, ["Platform Admin"]);
    const integrationName = decodeURIComponent(integrationConfigMatch[1]).toUpperCase();
    const integration = state.integrations.find((item) => item.name === integrationName);
    if (!integration) {
      sendJson(response, 404, {
        error: {
          code: "integration_not_found",
          message: `Integration not found: ${integrationName}`,
        },
      });
      return;
    }

    const body = await readJson<UpdateIntegrationConfigRequest>(request);
    if (body.credentialProfile !== undefined) {
      assertCredentialReference(body.credentialProfile);
    }
    const existing =
      state.integrationConfigs.find((item) => item.name === integrationName) ??
      {
        name: integrationName,
        endpoint: "",
        credentialProfile: "",
        status: "Not configured" as const,
        message: integration.nextStep,
      };
    const updated: IntegrationConfig = {
      ...existing,
      endpoint: body.endpoint ?? existing.endpoint,
      credentialProfile: body.credentialProfile ?? existing.credentialProfile,
      status: body.status ?? (body.endpoint || body.credentialProfile ? "Configured" : existing.status),
      message:
        body.endpoint || body.credentialProfile
          ? "Configuration saved. Run readiness check before enabling provisioning."
          : existing.message,
    };
    state.integrationConfigs = [
      updated,
      ...state.integrationConfigs.filter((item) => item.name !== integrationName),
    ].sort((a, b) => a.name.localeCompare(b.name));
    state.auditEvents = [
      {
        id: `audit-integration-config-${integrationName}-${Date.now()}`,
        action: "integration.config.updated",
        actor: state.session.user,
        target: integrationName,
        createdAt: new Date().toISOString(),
        metadata: {
          credentialReferenceOnly: true,
          credentialProfileConfigured: Boolean(updated.credentialProfile),
        },
      },
      ...state.auditEvents,
    ];
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  const integrationCheckMatch = url.pathname.match(/^\/api\/integrations\/([^/]+)\/check$/);
  if (request.method === "POST" && integrationCheckMatch) {
    requireRole(context, ["Platform Admin"]);
    const integrationName = decodeURIComponent(integrationCheckMatch[1]).toUpperCase();
    const integration = state.integrations.find((item) => item.name === integrationName);
    const existing = state.integrationConfigs.find((item) => item.name === integrationName);
    if (!integration || !existing) {
      sendJson(response, 404, {
        error: {
          code: "integration_not_found",
          message: `Integration not found: ${integrationName}`,
        },
      });
      return;
    }

    const reachable = Boolean(existing.endpoint && existing.credentialProfile && integration.state !== "Preview");
    const updated: IntegrationConfig = {
      ...existing,
      status: reachable ? "Reachable" : existing.endpoint || existing.credentialProfile ? "Failed" : "Not configured",
      lastCheckedAt: new Date().toISOString(),
      message: reachable
        ? `${integration.name} mock readiness check passed.`
        : existing.endpoint || existing.credentialProfile
          ? `${integration.name} needs a complete endpoint and credential profile before lab validation.`
          : `${integration.name} is not configured yet.`,
    };
    state.integrationConfigs = state.integrationConfigs.map((item) =>
      item.name === integrationName ? updated : item
    );
    state.auditEvents = [
      {
        id: `audit-integration-check-${integrationName}-${Date.now()}`,
        action: "integration.readiness.checked",
        actor: state.session.user,
        target: integrationName,
        createdAt: new Date().toISOString(),
      },
      ...state.auditEvents,
    ];
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  const labDiscoveryMatch = url.pathname.match(/^\/api\/lab-adapters\/([^/]+)\/discover$/);
  if (request.method === "POST" && labDiscoveryMatch) {
    requireRole(context, ["Platform Admin"]);
    const adapterName = decodeURIComponent(labDiscoveryMatch[1]).toUpperCase();
    const adapter = state.labAdapters.find((item) => item.name === adapterName);
    const config = state.integrationConfigs.find((item) => item.name === adapterName);
    if (!adapter || !config) {
      sendJson(response, 404, {
        error: {
          code: "lab_adapter_not_found",
          message: `Lab adapter not found: ${adapterName}`,
        },
      });
      return;
    }

    const readOnlyCandidate = adapterName === "NCI" && config.status === "Reachable";
    const updated: LabAdapterSnapshot = {
      ...adapter,
      mode: readOnlyCandidate ? "Read-only candidate" : config.status === "Failed" ? "Failed" : "Configured",
      inventoryCount: readOnlyCandidate ? 12 : 0,
      lastDiscoveryAt: new Date().toISOString(),
      message: readOnlyCandidate
        ? "Read-only Prism Central discovery simulated successfully. Provisioning remains disabled."
        : "Discovery requires a reachable integration config and documented lab scope.",
      nextStep: readOnlyCandidate
        ? "Review discovered inventory model and confirm adapter authorization before any real API call."
        : adapter.nextStep,
    };
    state.labAdapters = state.labAdapters.map((item) => (item.name === adapterName ? updated : item));
    state.auditEvents = [
      {
        id: `audit-lab-discovery-${adapterName}-${Date.now()}`,
        action: "lab.discovery.simulated",
        actor: state.session.user,
        target: adapterName,
        createdAt: new Date().toISOString(),
        metadata: {
          readOnly: true,
          provisioningEnabled: false,
        },
      },
      ...state.auditEvents,
    ];
    await store.save(state);
    sendJson(response, 200, { data: updated });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/inventory/import") {
    requireRole(context, ["Platform Admin"]);
    const integrationConfig = state.integrationConfigs.find((item) => item.name === "NCI");
    if (!integrationConfig || integrationConfig.status !== "Reachable") {
      sendJson(response, 409, {
        error: {
          code: "prism_inventory_not_ready",
          message: "Prism inventory import requires a reachable NCI integration configuration.",
        },
      });
      return;
    }

    const scope = createPrismReadOnlyScope(integrationConfig, state.platformConfig);
    const inventoryAdapter =
      process.env.NDC_PRISM_REAL_ADAPTER === "enabled"
        ? createDisabledRealPrismInventoryAdapter()
        : createMockPrismInventoryAdapter();
    const importResult = await inventoryAdapter.discover(scope);
    state.prismInventory = importResult.records;
    state.prismInventoryImport = stripInventoryRecords(importResult);
    state.resourceProfiles = mergePrismImageProfileCandidates(state.resourceProfiles, importResult.records);
    state.labAdapters = state.labAdapters.map((item) =>
      item.name === "NCI"
        ? {
            ...item,
            mode: importResult.mode === "Mock read-only" ? "Read-only candidate" : "Configured",
            inventoryCount: importResult.recordsImported,
            lastDiscoveryAt: importResult.importedAt,
            message: importResult.evidence,
            nextStep: "Review imported inventory candidates and approve registry mappings before dry-run planning.",
          }
        : item
    );
    addAuditEvent(state, "prism.inventory.imported", state.session.user, "NCI", {
      recordsImported: importResult.recordsImported,
      profileCandidates: importResult.profileCandidates,
      readOnly: true,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 200, { data: state.prismInventoryImport });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/vm-sandbox/dry-runs") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateVmSandboxDryRunRequest>(request);
    const plan = createVmSandboxDryRunPlan(state, body, context.session.user);
    state.vmSandboxDryRuns = [plan, ...state.vmSandboxDryRuns.filter((item) => item.environmentName !== plan.environmentName)];
    addAuditEvent(state, "vm-sandbox.dry-run.planned", context.session.user, plan.environmentName, {
      imageProfileId: plan.imageProfileId,
      project: plan.project,
      cluster: plan.cluster,
      network: plan.network,
      category: plan.category,
      quota: plan.quota,
      expiryDays: plan.expiryDays,
      estimatedMonthlyCost: plan.estimatedMonthlyCost,
      validationsPassed: plan.validations.every((validation) => validation.passed),
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: plan });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/vm-sandbox/controlled-provisioning") {
    requireRole(context, ["Platform Admin"]);
    try {
      const body = await readJson<CreateControlledProvisioningGateRequest>(request);
      const gate = createControlledProvisioningGate(state, body, context.session.user);
      state.controlledProvisioningGates = [
        gate,
        ...state.controlledProvisioningGates.filter((item) => item.id !== gate.id),
      ];
      addAuditEvent(state, "vm-sandbox.controlled.requested", context.session.user, gate.environmentName, {
        dryRunPlanId: gate.dryRunPlanId,
        status: gate.status,
        approvalStatus: gate.approval.status,
        scopePresent: gate.pentestScope.present,
        checksPassed: gate.checks.every((check) => check.passed),
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 201, { data: gate });
    } catch (error) {
      if (error instanceof ControlledProvisioningError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-authorization/scopes") {
    requireRole(context, ["Platform Admin"]);
    try {
      const body = await readJson<CreateLabAuthorizationScopeRequest>(request);
      const scope = createLabAuthorizationScope(state, body, context.session.user);
      state.labAuthorizationScopes = [scope, ...state.labAuthorizationScopes];
      addAuditEvent(state, "lab-authorization.scope.recorded", context.session.user, scope.name, {
        project: scope.project,
        cluster: scope.cluster,
        network: scope.network,
        version: scope.version,
        targetEnvironment: scope.targetEnvironment,
        providerCoverage: scope.providerCoverage,
        status: scope.status,
        pentestScopeStructurallyValid: scope.pentestScopeStructurallyValid,
        evidenceReferenceCount: scope.evidenceReferences.length,
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 201, { data: scope });
    } catch (error) {
      if (error instanceof AuthorizationEvidenceError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/vm-lifecycle/proofs") {
    requireRole(context, ["Platform Admin"]);
    try {
      const body = await readJson<CreateVmLifecycleProofRequest>(request);
      const proof = createVmLifecycleProof(state, body, context.session.user);
      state.vmLifecycleProofs = [proof, ...state.vmLifecycleProofs];
      addAuditEvent(state, "vm-lifecycle.proof.recorded", context.session.user, proof.environmentName, {
        gateId: proof.gateId,
        status: proof.status,
        rollbackVerified: proof.rollbackVerified,
        destroyVerified: proof.destroyVerified,
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 201, { data: proof });
    } catch (error) {
      if (error instanceof AuthorizationEvidenceError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/vm-sandbox/rollback-destroy-proofs") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateRollbackDestroyProofRequest>(request);
    const proof = createRollbackDestroyProofRecord(state, body, context.session.user);
    state.rollbackDestroyProofs = [
      proof,
      ...state.rollbackDestroyProofs.filter((item) => item.dryRunPlanId !== proof.dryRunPlanId),
    ];
    addAuditEvent(state, "vm-sandbox.rollback-destroy-proof.recorded", context.session.user, proof.environmentName, {
      status: proof.status,
      rollbackOwner: proof.rollbackOwner,
      checksPassed: proof.checks.every((check) => check.passed),
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: proof });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/vm-sandbox/controlled-create-authorization") {
    requireRole(context, ["Platform Admin"]);
    const envelope = createControlledCreateAuthorizationEnvelope(state, context.session.user);
    state.controlledCreateAuthorizationEnvelopes = [envelope, ...state.controlledCreateAuthorizationEnvelopes];
    addAuditEvent(state, "vm-sandbox.controlled-create-authorization.reviewed", context.session.user, envelope.environmentName, {
      status: envelope.status,
      checksPassed: envelope.checks.every((check) => check.passed),
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: envelope });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/ahv/create-adapter-contracts") {
    requireRole(context, ["Platform Admin"]);
    const adapter = createDisabledAhvCreateAdapterContract(state, context.session.user);
    const review = adapter.validate(state);
    state.ahvCreateAdapterContractReviews = [review, ...state.ahvCreateAdapterContractReviews];
    addAuditEvent(state, "ahv.create-adapter-contract.reviewed", context.session.user, review.environmentName, {
      status: review.status,
      checksPassed: review.checks.every((check) => check.passed),
      blockedOperations: review.blockedOperations,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: review });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/ahv/controlled-provisioning/runs") {
    requireRole(context, ["Platform Admin"]);
    try {
      const body = await readJson<CreateAhvControlledProvisioningRunRequest>(request);
      const adapter = createDisabledAhvControlledProvisioningAdapter();
      const run = adapter.preflight(state, body, context.session.user);
      state.ahvControlledProvisioningRuns = [run, ...state.ahvControlledProvisioningRuns];
      addAuditEvent(state, "ahv.controlled.preflight.recorded", context.session.user, run.environmentName, {
        gateId: run.gateId,
        status: run.status,
        adapterMode: run.adapterMode,
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 201, { data: run });
    } catch (error) {
      if (error instanceof AhvControlledProvisioningError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/platform-services/requests") {
    requireRole(context, ["Developer", "Platform Admin"]);
    try {
      const body = await readJson<CreatePlatformServiceRequest>(request);
      const serviceRequest = createPlatformServiceRequest(state, body, context.session.user);
      state.platformServiceRequests = [
        serviceRequest,
        ...state.platformServiceRequests.filter((item) => item.id !== serviceRequest.id),
      ];
      addAuditEvent(state, "platform-service.request.planned", context.session.user, serviceRequest.serviceName, {
        kind: serviceRequest.kind,
        provider: serviceRequest.provider,
        status: serviceRequest.status,
        vmLifecycleProven: serviceRequest.vmLifecycleProven,
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 201, { data: serviceRequest });
    } catch (error) {
      if (error instanceof PlatformServiceError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/platform-services/preflight-runs") {
    requireRole(context, ["Platform Admin"]);
    try {
      const body = await readJson<CreatePlatformServicePreflightRunRequest>(request);
      const adapter = createDisabledPlatformServicePreflightAdapter();
      const run = adapter.preflight(state, body, context.session.user);
      state.platformServicePreflightRuns = [run, ...state.platformServicePreflightRuns];
      addAuditEvent(state, "platform-service.preflight.recorded", context.session.user, run.serviceName, {
        requestId: run.requestId,
        kind: run.kind,
        provider: run.provider,
        status: run.status,
        adapterMode: run.adapterMode,
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 201, { data: run });
    } catch (error) {
      if (error instanceof PlatformServicePreflightError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/platform-services/adapter-contracts") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreatePlatformServiceAdapterContractReviewRequest>(request);
    const adapter = createDisabledPlatformServiceAdapterContract(context.session.user);
    const review = adapter.validate(state, body);
    state.platformServiceAdapterContractReviews = [review, ...state.platformServiceAdapterContractReviews];
    addAuditEvent(state, "platform-service.adapter-contract.reviewed", context.session.user, review.serviceName, {
      kind: review.kind,
      provider: review.provider,
      status: review.status,
      checksPassed: review.checks.every((check) => check.passed),
      blockedOperations: review.blockedOperations,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: review });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/provider-release-gates") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProviderReleaseGateRecordRequest>(request);
    const record = createProviderReleaseGateRecord(state, body, context.session.user);
    state.providerReleaseGateRecords = [record, ...state.providerReleaseGateRecords];
    addAuditEvent(state, "provider-release-gate.reviewed", context.session.user, record.provider, {
      status: record.status,
      checksPassed: record.checks.every((check) => check.passed),
      blockedOperations: record.blockedOperations,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/release-evidence-exports") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateReleaseEvidenceExportRequest>(request);
    const exportRecord = createReleaseEvidenceExportRecord(state, body, context.session.user);
    state.releaseEvidenceExports = [exportRecord, ...state.releaseEvidenceExports];
    addAuditEvent(state, "release-evidence.export.prepared", context.session.user, exportRecord.provider, {
      gateId: exportRecord.gateId,
      checksumAlgorithm: exportRecord.checksumAlgorithm,
      checksum: exportRecord.checksum,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: exportRecord });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/runbooks") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledLabReleaseRunbookRequest>(request);
    const runbook = createControlledLabReleaseRunbookRecord(state, body, context.session.user);
    state.controlledLabReleaseRunbooks = [runbook, ...state.controlledLabReleaseRunbooks];
    addAuditEvent(state, "controlled-lab-release.runbook.recorded", context.session.user, runbook.provider, {
      status: runbook.status,
      linkedReleaseGateId: runbook.linkedReleaseGateId,
      signOffsRecorded: runbook.signOffs.filter((signOff) => signOff.signed).length,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: runbook });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/windows") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledLabDryRunWindowRequest>(request);
    const window = createControlledLabDryRunWindowRecord(state, body, context.session.user);
    state.controlledLabDryRunWindows = [window, ...state.controlledLabDryRunWindows];
    addAuditEvent(state, "controlled-lab-release.window.recorded", context.session.user, window.provider, {
      status: window.status,
      linkedRunbookId: window.linkedRunbookId,
      linkedLabScopeId: window.linkedLabScopeId,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: window });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/window-exports") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabWindowEvidenceExportRequest>(request);
    const exportRecord = createLabWindowEvidenceExportRecord(state, body, context.session.user);
    state.labWindowEvidenceExports = [exportRecord, ...state.labWindowEvidenceExports];
    addAuditEvent(state, "controlled-lab-release.window-evidence.exported", context.session.user, exportRecord.provider, {
      windowId: exportRecord.windowId,
      checksumAlgorithm: exportRecord.checksumAlgorithm,
      checksum: exportRecord.checksum,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: exportRecord });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/evidence-reviews") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabEvidenceReviewRequest>(request);
    const review = createLabEvidenceReviewRecord(state, body, context.session.user);
    state.labEvidenceReviews = [review, ...state.labEvidenceReviews];
    addAuditEvent(state, "controlled-lab-release.evidence-review.recorded", context.session.user, review.provider, {
      exportId: review.exportId,
      windowId: review.windowId,
      status: review.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: review });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/proposal-envelopes") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabExecutionProposalEnvelopeRequest>(request);
    const envelope = createLabExecutionProposalEnvelope(state, body, context.session.user);
    state.labExecutionProposalEnvelopes = [envelope, ...state.labExecutionProposalEnvelopes];
    addAuditEvent(state, "controlled-lab-release.execution-proposal.reviewed", context.session.user, envelope.provider, {
      reviewId: envelope.reviewId,
      exportId: envelope.exportId,
      windowId: envelope.windowId,
      status: envelope.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: envelope });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/proposal-exports") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabExecutionProposalExportRequest>(request);
    const exportRecord = createLabExecutionProposalExportRecord(state, body, context.session.user);
    state.labExecutionProposalExports = [exportRecord, ...state.labExecutionProposalExports];
    addAuditEvent(state, "controlled-lab-release.execution-proposal.exported", context.session.user, exportRecord.provider, {
      envelopeId: exportRecord.envelopeId,
      checksumAlgorithm: exportRecord.checksumAlgorithm,
      checksum: exportRecord.checksum,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: exportRecord });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/execution-approvals") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledLabExecutionApprovalGateRequest>(request);
    const approval = createControlledLabExecutionApprovalGate(state, body, context.session.user);
    state.controlledLabExecutionApprovals = [approval, ...state.controlledLabExecutionApprovals];
    addAuditEvent(state, "controlled-lab-release.execution-approval.recorded", context.session.user, approval.provider, {
      proposalExportId: approval.proposalExportId,
      envelopeId: approval.envelopeId,
      status: approval.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: approval });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/rehearsal-packets") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledLabExecutionRehearsalPacketRequest>(request);
    const packet = createControlledLabExecutionRehearsalPacket(state, body, context.session.user);
    state.controlledLabExecutionRehearsalPackets = [packet, ...state.controlledLabExecutionRehearsalPackets];
    addAuditEvent(state, "controlled-lab-release.rehearsal-packet.recorded", context.session.user, packet.provider, {
      approvalGateId: packet.approvalGateId,
      proposalExportId: packet.proposalExportId,
      status: packet.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: packet });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/production-readiness/reviews") {
    requireRole(context, ["Platform Admin"]);
    const review = createProductionReadinessReview(state, context.session.user);
    state.productionReadinessReviews = [review, ...state.productionReadinessReviews];
    addAuditEvent(state, "production-readiness.review.recorded", context.session.user, review.id, {
      status: review.status,
      checksPassed: review.checks.every((check) => check.passed),
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: review });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/private-cloud/lifecycle-operations") {
    requireRole(context, ["Platform Admin"]);
    try {
      const body = await readJson<CreateLifecycleOperationRequest>(request);
      const operation = createLifecycleOperationRecord(state, body, context.session.user);
      state.lifecycleOperations = [operation, ...state.lifecycleOperations];
      addAuditEvent(state, "private-cloud.lifecycle.requested", context.session.user, operation.environmentName, {
        operation: operation.operation,
        status: operation.status,
        approvalRequired: operation.approvalRequired,
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 201, { data: operation });
    } catch (error) {
      if (error instanceof PrivateCloudOperationError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/audit-exports") {
    requireRole(context, ["Platform Admin"]);
    const auditExport = createAuditExportRecord(state, context.session.user);
    state.auditExports = [auditExport, ...state.auditExports];
    addAuditEvent(state, "audit.export.prepared", context.session.user, auditExport.id, {
      format: auditExport.format,
      eventCount: auditExport.eventCount,
      retentionEvents: auditExport.retentionEvents,
      checksumAlgorithm: auditExport.checksumAlgorithm,
      destinationRef: auditExport.manifest.destinationRef,
    });
    await store.save(state);
    sendJson(response, 201, { data: auditExport });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/adapter-enablement/records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateAdapterEnablementRecordRequest>(request);
    const record = createAdapterEnablementRecord(state, body, context.session.user);
    state.adapterEnablementRecords = [record, ...state.adapterEnablementRecords];
    addAuditEvent(state, "adapter.enablement.review.recorded", context.session.user, record.provider, {
      status: record.status,
      checksPassed: record.checks.every((check) => check.passed),
      rollbackOwner: record.rollbackOwner,
      blockedOperations: record.mutationOperationsBlocked,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  const controlledGateDecisionMatch = url.pathname.match(/^\/api\/vm-sandbox\/controlled-provisioning\/([^/]+)\/(approve|reject)$/);
  if (request.method === "POST" && controlledGateDecisionMatch) {
    requireRole(context, ["Platform Admin", "Approver"]);
    try {
      const gateId = decodeURIComponent(controlledGateDecisionMatch[1]);
      const pathDecision = controlledGateDecisionMatch[2] as "approve" | "reject";
      const body = await readJson<Partial<ControlledProvisioningDecisionRequest>>(request);
      const decision = body.decision ?? pathDecision;
      const gate = decideControlledProvisioningGate(state, gateId, decision, context.session.user, body.evidence);
      state.controlledProvisioningGates = state.controlledProvisioningGates.map((item) =>
        item.id === gate.id ? gate : item
      );
      addAuditEvent(state, `vm-sandbox.controlled.${decision === "approve" ? "approved" : "rejected"}`, context.session.user, gate.environmentName, {
        dryRunPlanId: gate.dryRunPlanId,
        status: gate.status,
        approvalStatus: gate.approval.status,
        provisioningEnabled: false,
      });
      await store.save(state);
      sendJson(response, 200, { data: gate });
    } catch (error) {
      if (error instanceof ControlledProvisioningError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      throw error;
    }
    return;
  }

  const controlPlaneJobMatch = url.pathname.match(/^\/api\/control-plane\/jobs\/([^/]+)\/(advance|retry|fail)$/);
  if (request.method === "POST" && controlPlaneJobMatch) {
    requireRole(context, ["Platform Admin"]);
    try {
      const jobId = decodeURIComponent(controlPlaneJobMatch[1]);
      const action = controlPlaneJobMatch[2];
      const body = await readJson<{ reason?: string }>(request);
      const job =
        action === "advance"
          ? advanceControlPlaneJob(state, jobId)
          : action === "retry"
            ? retryControlPlaneJob(state, jobId)
            : failControlPlaneJob(state, jobId, body.reason);
      await store.save(state);
      sendJson(response, 200, { data: job });
    } catch (error) {
      if (error instanceof ControlPlaneError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  const approvalMatch = url.pathname.match(/^\/api\/approvals\/([^/]+)\/(approve|reject)$/);
  if (request.method === "POST" && approvalMatch) {
    requireRole(context, ["Approver", "Platform Admin"]);
    try {
      const approval = decideApproval(
        state,
        decodeURIComponent(approvalMatch[1]),
        approvalMatch[2] === "approve" ? "Approved" : "Rejected",
        context.session.user
      );
      await store.save(state);
      sendJson(response, 200, { data: approval });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        sendJson(response, 404, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }
    return;
  }

  sendJson(response, 404, {
    error: {
      code: "api_route_not_found",
      message: "API route not found.",
    },
  });
}

function createSystemStatus(state: Awaited<ReturnType<ApiStore["load"]>>): SystemStatus {
  return {
    api: "Healthy",
    storage: "Ready",
    session: state.session,
    integrations: {
      total: state.integrationConfigs.length,
      configured: state.integrationConfigs.filter((item) => item.status === "Configured").length,
      reachable: state.integrationConfigs.filter((item) => item.status === "Reachable").length,
      readOnlyCandidates: state.labAdapters.filter((item) => item.mode === "Read-only candidate").length,
    },
    provisioningEnabled: false,
  };
}

function nextRegistryStatus(action: RegistryAction): RegistryStatus {
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

function registryEvidence(action: RegistryAction, actor: string) {
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

function addAuditEvent(
  state: ApiState,
  action: string,
  actor: string,
  target: string,
  metadata?: Record<string, unknown>
) {
  state.auditEvents = [
    {
      id: `audit-${action}-${Date.now()}`,
      action,
      actor,
      target,
      createdAt: new Date().toISOString(),
      metadata,
    },
    ...state.auditEvents,
  ];
}

function stripInventoryRecords(
  result: PrismInventoryImportResult & { records: PrismInventoryRecord[] }
): PrismInventoryImportResult {
  const { records: _records, ...summary } = result;
  return summary;
}

function mergePrismImageProfileCandidates(
  profiles: ResourceProfile[],
  records: PrismInventoryRecord[]
): ResourceProfile[] {
  const existingIds = new Set(profiles.map((profile) => profile.id));
  const importedProfiles = records
    .filter((record) => record.kind === "Image" && record.profileCandidate)
    .map((record) => {
      const id = `prism-${record.id}`;
      return {
        id,
        kind: "AHV Image",
        name: record.name,
        provider: "NCI",
        version: "imported",
        status: "Draft",
        owner: "Cloud Infrastructure",
        region: record.cluster ?? "Prism inventory",
        notes: `Imported from read-only Prism inventory ${record.rawRef}. Approve before any dry-run planning uses it.`,
      } satisfies ResourceProfile;
    });

  return [...profiles, ...importedProfiles.filter((profile) => !existingIds.has(profile.id))];
}

function sendJson<T>(response: ServerResponse, status: number, body: ApiResponse<T> | ApiError) {
  response.writeHead(status, securityHeaders({
    "Content-Type": "application/json; charset=utf-8",
  }));
  response.end(JSON.stringify(body));
}

async function readJson<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > 1_048_576) {
      throw new RequestValidationError("request_body_too_large", "Request body exceeds the 1 MB limit.");
    }
    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
}

async function serveStatic(response: ServerResponse, staticDir: string, pathname: string) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = normalize(requestedPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  const filePath = join(staticDir, safePath);
  const fallbackPath = join(staticDir, "index.html");
  if (relative(staticDir, filePath).startsWith("..")) {
    sendJson(response, 403, {
      error: {
        code: "forbidden",
        message: "Static path is outside the configured directory.",
      },
    });
    return;
  }
  const targetPath = (await fileExists(filePath)) ? filePath : fallbackPath;

  response.writeHead(200, {
    ...securityHeaders(),
    "Content-Type": contentType(targetPath),
  });
  createReadStream(targetPath).pipe(response);
}

async function fileExists(filePath: string) {
  try {
    const details = await stat(filePath);
    return details.isFile();
  } catch {
    return false;
  }
}

function contentType(filePath: string) {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
