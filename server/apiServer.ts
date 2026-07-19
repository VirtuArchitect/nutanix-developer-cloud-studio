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
  AhvLabRuntimeError,
  createAhvLabRuntimeConfig,
  LabAhvPrismAdapter,
  redactSensitive,
} from "./ahvLabRuntime";
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
  ControlledReadOnlyLabEnablementError,
  createAuthorizedReadOnlyLabPilotGateRecord,
  createCredentialResolverAdapterStubRecord,
  createDisabledPrismReadOnlyHttpClientRecord,
  createHardenedLabConnectionProfileReview,
  createLabConnectivityPreflightRecord,
} from "./controlledReadOnlyLabEnablement";
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
  ControlledLabDryRunExecutionChecklistError,
  createControlledLabDryRunExecutionChecklist,
} from "./controlledLabDryRunExecutionChecklist";
import {
  ControlledLabExecutionEvidenceLedgerError,
  createControlledLabExecutionEvidenceLedger,
} from "./controlledLabExecutionEvidenceLedger";
import {
  ControlledLabExecutionReadinessAttestationError,
  createControlledLabExecutionReadinessAttestation,
} from "./controlledLabExecutionReadinessAttestation";
import { createMockPrismHarnessConsole } from "./mockPrismHarnessConsole";
import { createProvisioningModeStatus } from "./provisioningModeStatus";
import {
  createExecutionBrokerQueueRecord,
  ExecutionBrokerError,
} from "./executionBroker";
import {
  createExecutionBrokerDispatchApproval,
  ExecutionBrokerDispatchApprovalError,
} from "./executionBrokerDispatchApproval";
import {
  createRealAdapterLabScopeActivation,
  RealAdapterLabScopeActivationError,
} from "./realAdapterLabScopeActivation";
import {
  createManualRealAdapterSwitchReview,
  ManualRealAdapterSwitchReviewError,
} from "./manualRealAdapterSwitchReview";
import {
  createRealAdapterSwitchStateAuditPackage,
  RealAdapterSwitchStateAuditPackageError,
} from "./realAdapterSwitchStateAuditPackage";
import {
  createControlledSwitchConfigurationRequest,
  ControlledSwitchConfigurationRequestError,
} from "./controlledSwitchConfigurationRequest";
import {
  createSwitchExecutionHandoffPackage,
  SwitchExecutionHandoffPackageError,
} from "./switchExecutionHandoffPackage";
import {
  createSwitchExecutionOutcomeRecord,
  SwitchExecutionOutcomeRecordError,
} from "./switchExecutionOutcomeRecord";
import {
  createSwitchClosureRetentionPackage,
  SwitchClosureRetentionPackageError,
} from "./switchClosureRetentionPackage";
import {
  createAdapterPromotionReadinessDossier,
  AdapterPromotionReadinessDossierError,
} from "./adapterPromotionReadinessDossier";
import {
  createProductionAdapterAuthorizationPacket,
  ProductionAdapterAuthorizationPacketError,
} from "./productionAdapterAuthorizationPacket";
import {
  createProductionChangeFreezeRecord,
  ProductionChangeFreezeRecordError,
} from "./productionChangeFreezeRecord";
import {
  createProductionCabHandoffPacket,
  ProductionCabHandoffPacketError,
} from "./productionCabHandoffPacket";
import {
  createProductionCabDecisionRecord,
  ProductionCabDecisionRecordError,
} from "./productionCabDecisionRecord";
import {
  createProductionImplementationHoldRecord,
  ProductionImplementationHoldRecordError,
} from "./productionImplementationHoldRecord";
import {
  createProductionOperatorAssignmentRecord,
  ProductionOperatorAssignmentRecordError,
} from "./productionOperatorAssignmentRecord";
import {
  createProductionExecutionReadinessRecord,
  ProductionExecutionReadinessRecordError,
} from "./productionExecutionReadinessRecord";
import {
  createProductionExecutionAuthorizationRecord,
  ProductionExecutionAuthorizationRecordError,
} from "./productionExecutionAuthorizationRecord";
import {
  createProductionChangeTicketLockRecord,
  ProductionChangeTicketLockRecordError,
} from "./productionChangeTicketLockRecord";
import {
  createProductionFinalExecutionPacketRecord,
  ProductionFinalExecutionPacketRecordError,
} from "./productionFinalExecutionPacketRecord";
import {
  createProductionExecutionHoldPointRecord,
  ProductionExecutionHoldPointRecordError,
} from "./productionExecutionHoldPointRecord";
import {
  createProductionExecutionOutcomeAuthorizationRecord,
  ProductionExecutionOutcomeAuthorizationRecordError,
} from "./productionExecutionOutcomeAuthorizationRecord";
import {
  createProductionExecutionClosureAuthorizationRecord,
  ProductionExecutionClosureAuthorizationRecordError,
} from "./productionExecutionClosureAuthorizationRecord";
import {
  createProductionExecutionClosurePacketRecord,
  ProductionExecutionClosurePacketRecordError,
} from "./productionExecutionClosurePacketRecord";
import {
  createProductionExecutionArchivalHandoffRecord,
  ProductionExecutionArchivalHandoffRecordError,
} from "./productionExecutionArchivalHandoffRecord";
import {
  createProductionExecutionRetentionAttestationRecord,
  ProductionExecutionRetentionAttestationRecordError,
} from "./productionExecutionRetentionAttestationRecord";
import {
  createProductionExecutionFinalArchiveCertificationRecord,
  ProductionExecutionFinalArchiveCertificationRecordError,
} from "./productionExecutionFinalArchiveCertificationRecord";
import {
  createProductionExecutionCompletionDossierRecord,
  ProductionExecutionCompletionDossierRecordError,
} from "./productionExecutionCompletionDossierRecord";
import {
  createProductionExecutionOperationsHandoverRecord,
  ProductionExecutionOperationsHandoverRecordError,
} from "./productionExecutionOperationsHandoverRecord";
import {
  createProductionExecutionSupportReadinessRecord,
  ProductionExecutionSupportReadinessRecordError,
} from "./productionExecutionSupportReadinessRecord";
import {
  createProductionExecutionServiceAcceptanceRecord,
  ProductionExecutionServiceAcceptanceRecordError,
} from "./productionExecutionServiceAcceptanceRecord";
import {
  createProductionExecutionFinalTurnoverRecord,
  ProductionExecutionFinalTurnoverRecordError,
} from "./productionExecutionFinalTurnoverRecord";
import {
  createProductionExecutionOperationalClosureRecord,
  ProductionExecutionOperationalClosureRecordError,
} from "./productionExecutionOperationalClosureRecord";
import {
  createProductionExecutionPostImplementationReviewRecord,
  ProductionExecutionPostImplementationReviewRecordError,
} from "./productionExecutionPostImplementationReviewRecord";
import {
  createProductionExecutionImprovementClosureRecord,
  ProductionExecutionImprovementClosureRecordError,
} from "./productionExecutionImprovementClosureRecord";
import {
  createProductionExecutionFinalAcceptanceArchiveRecord,
  ProductionExecutionFinalAcceptanceArchiveRecordError,
} from "./productionExecutionFinalAcceptanceArchiveRecord";
import {
  createProductionExecutionReadinessArchiveHandoffRecord,
  ProductionExecutionReadinessArchiveHandoffRecordError,
} from "./productionExecutionReadinessArchiveHandoffRecord";
import {
  createProductionExecutionArchiveRetrievalValidationRecord,
  ProductionExecutionArchiveRetrievalValidationRecordError,
} from "./productionExecutionArchiveRetrievalValidationRecord";
import {
  createProductionExecutionArchiveRecoveryDrillRecord,
  ProductionExecutionArchiveRecoveryDrillRecordError,
} from "./productionExecutionArchiveRecoveryDrillRecord";
import {
  createProductionExecutionArchiveRecoveryAcceptanceRecord,
  ProductionExecutionArchiveRecoveryAcceptanceRecordError,
} from "./productionExecutionArchiveRecoveryAcceptanceRecord";
import {
  createProductionExecutionArchiveRecoveryClosureRecord,
  ProductionExecutionArchiveRecoveryClosureRecordError,
} from "./productionExecutionArchiveRecoveryClosureRecord";
import {
  createProductionExecutionArchiveRecoveryAuditCertificationRecord,
  ProductionExecutionArchiveRecoveryAuditCertificationRecordError,
} from "./productionExecutionArchiveRecoveryAuditCertificationRecord";
import {
  createProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord,
  ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordError,
} from "./productionExecutionArchiveRecoveryFinalComplianceArchiveRecord";
import {
  createProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord,
  ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordError,
} from "./productionExecutionArchiveRecoveryEvidenceCustodyClosureRecord";
import {
  createProductionExecutionArchiveRecoveryOperationalContinuityRecord,
  ProductionExecutionArchiveRecoveryOperationalContinuityRecordError,
} from "./productionExecutionArchiveRecoveryOperationalContinuityRecord";
import {
  createProductionExecutionArchiveRecoveryServiceManagementHandoffRecord,
  ProductionExecutionArchiveRecoveryServiceManagementHandoffRecordError,
} from "./productionExecutionArchiveRecoveryServiceManagementHandoffRecord";
import {
  createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord,
  ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordError,
} from "./productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord";
import {
  createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord,
  ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordError,
} from "./productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord";
import {
  createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord,
  ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordError,
} from "./productionExecutionArchiveRecoveryFinalOperationsHandoffRecord";
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
import { routeMockPrismCentral } from "./mockPrismCentral";
import { createPlatformServiceRequest, PlatformServiceError } from "./platformServices";
import { createPrismAdapterDiagnostics, createRealPrismBlockedReasons } from "./prismAdapterContract";
import {
  activatePrismFailureScenario,
  createRealPrismPreflightRun,
  selectPrismSimulatorProfile,
} from "./prismSimulatorControls";
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
import { createDisabledReadOnlyPrismAdapter } from "./readOnlyPrismAdapter";
import { createReadOnlyPrismLabGate } from "./readOnlyPrismLabGate";
import {
  advanceLabPilotRunbookWorkflow,
  createLabPilotRunbookWorkflow,
  createOperatorEvidenceExportPack,
  createPrismFixtureReplayRecord,
  createReadOnlyAdapterAuthorizationGate,
  createReadOnlyLabConnectionProfile,
  ReadOnlyLabPilotError,
} from "./readOnlyLabPilot";
import {
  createLabPilotOperatorConsole,
  createLiveReadOnlyInventoryPilotRecord,
  createProductionReadinessDecisionGate,
  createReadOnlyAdapterObservabilityRecord,
  ReadOnlyAdapterPilotError,
  setReadOnlyAdapterRuntimeMode,
} from "./readOnlyAdapterPilot";
import {
  createAuthorizedLabConnectionDryRunRecord,
  createCredentialProviderContractRecord,
  createDisabledRealReadOnlyAdapterInterfaceRecord,
  createOfflineContractReplaySuiteRecord,
  createRealReadOnlyAdapterConfigBoundary,
  RealReadOnlyAdapterPreparationError,
} from "./realReadOnlyAdapterPreparation";
import {
  createEmergencyStopRollbackDrillRecord,
  createLiveReadOnlyCallEnvelopeRecord,
  createPilotEvidenceReviewRecord,
  createReadOnlyPilotSessionRecord,
  createReadOnlyRuntimeEnablementPolicyRecord,
  ProductionReadOnlyPilotControlsError,
} from "./productionReadOnlyPilotControls";
import {
  ControlledMockToLabTransitionError,
  createAdapterContractTestHarnessRecord,
  createEvidenceExportPackV2Record,
  createLabConnectionDryRunConsoleRecord,
  createLabReadinessWorkspaceRecord,
  createMockPrismEndpointExpansionRecord,
  createRealLabAuthorizationPacketRecord,
} from "./controlledMockToLabTransition";
import {
  AuthorizationError,
  createAuthBoundaryDiagnostics,
  createRequestContext,
  createSessionDiagnostics,
  logRequest,
  MemoryRateLimiter,
  RateLimitError,
  requireRole,
  securityHeaders,
  type RequestContext,
} from "./security";
import {
  createContainerConfigValidationManifest,
  createLiveReadOnlyPrismCallDesign,
  createProductionReadinessScorecard,
  createRuntimeObservabilitySnapshot,
} from "./runtimeReadiness";
import {
  createApiContractBaseline,
  createAuditIntegrityManifest,
  createDeploymentProfileValidation,
  createOperationsRunbookConsole,
  createPersistenceBoundaryStatus,
  createRbacEnforcementMatrix,
} from "./productionHardeningFoundation";
import {
  createAdminUpgradeHealthConsole,
  createDurablePersistenceStatus,
  createJwtVerificationBoundary,
  createMigrationBaselineManifest,
  createOnPremInstallProfilePack,
  createSignedAuditExportManifest,
} from "./durableOnPremOperations";
import type { ApiStore } from "./storage";
import { createVmSandboxDryRunPlan } from "./vmSandboxDryRun";
import type {
  IntegrationConfig,
  LabAdapterSnapshot,
  PlatformSettingsSummary,
  PlatformSettingsConfig,
  PlatformSettingsConnectionTest,
  PlatformSettingsExport,
  ProvisioningAdapterName,
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
  CreatePlatformSettingsConnectionTestRequest,
  CreateControlledProvisioningGateRequest,
  CreateControlledLabExecutionApprovalGateRequest,
  CreateControlledLabDryRunExecutionChecklistRequest,
  CreateControlledLabExecutionEvidenceLedgerRequest,
  CreateControlledLabExecutionReadinessAttestationRequest,
  CreateControlledLabExecutionRehearsalPacketRequest,
  CreateExecutionBrokerDispatchApprovalRequest,
  CreateExecutionBrokerQueueRecordRequest,
  CreateRealAdapterLabScopeActivationRequest,
  CreateManualRealAdapterSwitchReviewRequest,
  CreateRealAdapterSwitchStateAuditPackageRequest,
  CreateControlledSwitchConfigurationRequestRequest,
  CreateSwitchExecutionHandoffPackageRequest,
  CreateSwitchExecutionOutcomeRecordRequest,
  CreateSwitchClosureRetentionPackageRequest,
  CreateAdapterPromotionReadinessDossierRequest,
  CreateProductionAdapterAuthorizationPacketRequest,
  CreateProductionChangeFreezeRecordRequest,
  CreateProductionCabHandoffPacketRequest,
  CreateProductionCabDecisionRecordRequest,
  CreateProductionImplementationHoldRecordRequest,
  CreateProductionOperatorAssignmentRecordRequest,
  CreateProductionExecutionReadinessRecordRequest,
  CreateProductionExecutionAuthorizationRecordRequest,
  CreateProductionChangeTicketLockRecordRequest,
  CreateProductionFinalExecutionPacketRecordRequest,
  CreateProductionExecutionHoldPointRecordRequest,
  CreateProductionExecutionOutcomeAuthorizationRecordRequest,
  CreateProductionExecutionClosureAuthorizationRecordRequest,
  CreateProductionExecutionClosurePacketRecordRequest,
  CreateProductionExecutionArchivalHandoffRecordRequest,
  CreateProductionExecutionRetentionAttestationRecordRequest,
  CreateProductionExecutionFinalArchiveCertificationRecordRequest,
  CreateProductionExecutionCompletionDossierRecordRequest,
  CreateProductionExecutionOperationsHandoverRecordRequest,
  CreateProductionExecutionSupportReadinessRecordRequest,
  CreateProductionExecutionServiceAcceptanceRecordRequest,
  CreateProductionExecutionFinalTurnoverRecordRequest,
  CreateProductionExecutionOperationalClosureRecordRequest,
  CreateProductionExecutionPostImplementationReviewRecordRequest,
  CreateProductionExecutionImprovementClosureRecordRequest,
  CreateProductionExecutionFinalAcceptanceArchiveRecordRequest,
  CreateProductionExecutionReadinessArchiveHandoffRecordRequest,
  CreateProductionExecutionArchiveRetrievalValidationRecordRequest,
  CreateProductionExecutionArchiveRecoveryDrillRecordRequest,
  CreateProductionExecutionArchiveRecoveryAcceptanceRecordRequest,
  CreateProductionExecutionArchiveRecoveryClosureRecordRequest,
  CreateProductionExecutionArchiveRecoveryAuditCertificationRecordRequest,
  CreateProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordRequest,
  CreateProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordRequest,
  CreateProductionExecutionArchiveRecoveryOperationalContinuityRecordRequest,
  CreateProductionExecutionArchiveRecoveryServiceManagementHandoffRecordRequest,
  CreateProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordRequest,
  CreateProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordRequest,
  CreateProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordRequest,
  CreateControlledLabReleaseRunbookRequest,
  CreateLabPilotRunbookWorkflowRequest,
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
  CreateOperatorEvidenceExportPackRequest,
  CreateLiveReadOnlyInventoryPilotRequest,
  CreateProductionReadinessDecisionGateRequest,
  CreateEmergencyStopRollbackDrillRequest,
  CreateAdapterContractTestHarnessRequest,
  CreateEvidenceExportPackV2Request,
  CreateLabConnectionDryRunConsoleRequest,
  CreateLabReadinessWorkspaceRequest,
  CreateLiveReadOnlyCallEnvelopeRequest,
  CreateMockPrismEndpointExpansionRequest,
  CreatePilotEvidenceReviewRequest,
  CreateReadOnlyPilotSessionRequest,
  CreateReadOnlyRuntimeEnablementPolicyRequest,
  CreateRealLabAuthorizationPacketRequest,
  CreateAuthorizedLabConnectionDryRunRequest,
  CreateAuthorizedReadOnlyLabPilotGateRequest,
  CreateCredentialResolverAdapterStubRequest,
  CreateCredentialProviderContractRequest,
  CreateDisabledPrismReadOnlyHttpClientRequest,
  CreateDisabledRealReadOnlyAdapterInterfaceRequest,
  CreateHardenedLabConnectionProfileReviewRequest,
  CreateLabConnectivityPreflightRequest,
  CreateOfflineContractReplaySuiteRequest,
  CreatePrismFixtureReplayRequest,
  CreateRealReadOnlyAdapterConfigBoundaryRequest,
  CreateReadOnlyAdapterObservabilityRequest,
  CreateReadOnlyAdapterAuthorizationGateRequest,
  CreateReadOnlyLabConnectionProfileRequest,
  SetReadOnlyAdapterRuntimeModeRequest,
  LabPilotRunbookWorkflowAction,
  RegistryAction,
  UpdatePlatformSettingsRequest,
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

      if (error instanceof AhvLabRuntimeError) {
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

      if (error instanceof ReadOnlyLabPilotError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ReadOnlyAdapterPilotError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof RealReadOnlyAdapterPreparationError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      if (error instanceof ControlledReadOnlyLabEnablementError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionReadOnlyPilotControlsError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledMockToLabTransitionError) {
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

      if (error instanceof ControlledLabDryRunExecutionChecklistError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledLabExecutionEvidenceLedgerError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledLabExecutionReadinessAttestationError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ExecutionBrokerError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ExecutionBrokerDispatchApprovalError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof RealAdapterLabScopeActivationError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ManualRealAdapterSwitchReviewError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof RealAdapterSwitchStateAuditPackageError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ControlledSwitchConfigurationRequestError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof SwitchExecutionHandoffPackageError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof SwitchExecutionOutcomeRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof SwitchClosureRetentionPackageError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof AdapterPromotionReadinessDossierError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionAdapterAuthorizationPacketError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionChangeFreezeRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionCabHandoffPacketError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionCabDecisionRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionImplementationHoldRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionOperatorAssignmentRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionReadinessRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionAuthorizationRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionChangeTicketLockRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionFinalExecutionPacketRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionHoldPointRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionOutcomeAuthorizationRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionClosureAuthorizationRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionClosurePacketRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchivalHandoffRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionRetentionAttestationRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionFinalArchiveCertificationRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionCompletionDossierRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionOperationsHandoverRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionSupportReadinessRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionServiceAcceptanceRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionFinalTurnoverRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionOperationalClosureRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionPostImplementationReviewRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionImprovementClosureRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionFinalAcceptanceArchiveRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionReadinessArchiveHandoffRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRetrievalValidationRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryDrillRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryAcceptanceRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryClosureRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryAuditCertificationRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryOperationalContinuityRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryServiceManagementHandoffRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordError) {
        sendJson(response, 400, {
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof ProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordError) {
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

  if (await routeMockPrismCentral(request, response, url)) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    await routeApi(request, response, store, url, context, staticDir);
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
  context: RequestContext,
  staticDir?: string
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

  if (request.method === "GET" && url.pathname === "/api/admin/settings") {
    requireRole(context, ["Platform Admin"]);
    addAuditEvent(state, "admin.settings.viewed", context.session.user, "platform-settings", {
      provisioningEnabled: state.platformConfig.provisioningEnabled,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 200, { data: createPlatformSettingsSummary(state, context) });
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/admin/settings") {
    requireRole(context, ["Platform Admin"]);
    const payload = await readJson<UpdatePlatformSettingsRequest>(request);
    state.platformSettings = mergePlatformSettings(state.platformSettings, payload);
    addAuditEvent(state, "admin.settings.updated", context.session.user, "platform-settings", {
      sections: Object.keys(payload),
      provisioningEnabled: state.platformConfig.provisioningEnabled,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 200, { data: createPlatformSettingsSummary(state, context) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/admin/settings/test") {
    requireRole(context, ["Platform Admin"]);
    const payload = await readJson<CreatePlatformSettingsConnectionTestRequest>(request);
    const test = createPlatformSettingsConnectionTest(state, payload.target ?? "OIDC", context.session.user);
    state.platformSettingsConnectionTests = [test, ...(state.platformSettingsConnectionTests ?? [])].slice(0, 50);
    addAuditEvent(state, "admin.settings.connection-test.run", context.session.user, String(test.target), {
      status: test.status,
      failedChecks: test.checks.filter((check) => !check.passed).map((check) => check.name),
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: test });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/settings/export") {
    requireRole(context, ["Platform Admin"]);
    const exportRecord: PlatformSettingsExport = {
      exportedAt: new Date().toISOString(),
      exportedBy: context.session.user,
      format: "redacted-json",
      settings: state.platformSettings,
      redactionBoundary: "Export includes configuration and credential references only; inline secrets are never included.",
      secretFieldsIncluded: false,
    };
    addAuditEvent(state, "admin.settings.exported", context.session.user, "platform-settings", {
      format: exportRecord.format,
      secretFieldsIncluded: false,
    });
    await store.save(state);
    sendJson(response, 200, { data: exportRecord });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/boundary-diagnostics") {
    const diagnostics = createAuthBoundaryDiagnostics(context, request);
    addAuditEvent(state, "auth.boundary-diagnostics.viewed", context.session.user, context.session.user, {
      mode: diagnostics.mode,
      authMode: context.session.authMode,
      roles: diagnostics.roles,
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 200, { data: diagnostics });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/system/status") {
    sendJson(response, 200, { data: createSystemStatus(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/provisioning/mode") {
    sendJson(response, 200, { data: createProvisioningModeStatus("api") });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/observability/runtime") {
    sendJson(response, 200, { data: createRuntimeObservabilitySnapshot(state, context, Boolean(staticDir)) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/contracts/openapi") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createApiContractBaseline(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/security/rbac-matrix") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createRbacEnforcementMatrix() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/storage/persistence-boundary") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createPersistenceBoundaryStatus(store.constructor.name) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit/integrity-manifest") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createAuditIntegrityManifest(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit/events") {
    requireRole(context, ["Platform Admin"]);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
    sendJson(response, 200, { data: state.auditEvents.slice(0, limit).map(redactAuditEvent) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/deployment/profiles") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createDeploymentProfileValidation() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/operations/runbook-console") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createOperationsRunbookConsole(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/onprem/durable-persistence") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createDurablePersistenceStatus(store.constructor.name) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/onprem/migration-baseline") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createMigrationBaselineManifest() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/jwt-boundary") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createJwtVerificationBoundary() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/audit/signed-export-manifest") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createSignedAuditExportManifest(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/admin/upgrade-health") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createAdminUpgradeHealthConsole(state, store.constructor.name) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/onprem/install-profile-pack") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createOnPremInstallProfilePack() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/production/readiness-scorecard") {
    sendJson(response, 200, { data: createProductionReadinessScorecard(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/deployment/config-validation") {
    sendJson(response, 200, { data: createContainerConfigValidationManifest() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/live-read-only-design") {
    sendJson(response, 200, { data: createLiveReadOnlyPrismCallDesign() });
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

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-adapter/diagnostics") {
    const integrationConfig = state.integrationConfigs.find((item) => item.name === "NCI");
    sendJson(response, 200, {
      data: createDisabledReadOnlyPrismAdapter().diagnostics(integrationConfig, state.platformConfig),
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-lab-gates") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.readOnlyPrismLabGates });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-lab-profiles") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.readOnlyLabConnectionProfiles });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/fixture-replays") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.prismFixtureReplayRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-authorization-gates") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.readOnlyAdapterAuthorizationGates });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/operator/evidence-exports") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.operatorEvidenceExportPacks });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-pilot/runbook-workflows") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labPilotRunbookWorkflows });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-runtime-modes") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.readOnlyAdapterRuntimeModeRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/live-read-only-inventory-pilots") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.liveReadOnlyInventoryPilots });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-observability") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.readOnlyAdapterObservabilityRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-pilot/operator-console") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createLabPilotOperatorConsole(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/production/readiness-decision-gates") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionReadinessDecisionGates });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/real-read-only/config-boundaries") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.realReadOnlyAdapterConfigBoundaries });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/credentials/provider-contracts") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.credentialProviderContractRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/real-read-only/adapter-interfaces") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.disabledRealReadOnlyAdapterInterfaceRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/offline-contract-replays") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.offlineContractReplaySuiteRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/authorized-lab-dry-runs") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.authorizedLabConnectionDryRunRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-lab-profile-hardening") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.hardenedLabConnectionProfileReviews });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/credentials/resolver-stubs") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.credentialResolverAdapterStubRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-http-clients") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.disabledPrismReadOnlyHttpClientRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/lab-connectivity-preflights") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labConnectivityPreflightRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/authorized-read-only-pilot-gates") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.authorizedReadOnlyLabPilotGateRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-runtime-policies") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.readOnlyRuntimeEnablementPolicies });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/read-only-pilot-sessions") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.readOnlyPilotSessions });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/live-read-only-call-envelopes") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.liveReadOnlyCallEnvelopes });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/pilot-evidence-reviews") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.pilotEvidenceReviewRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/emergency-stop-rollback-drills") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.emergencyStopRollbackDrillRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-transition/readiness-workspaces") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labReadinessWorkspaces });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-transition/mock-prism-endpoint-expansions") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.mockPrismEndpointExpansionRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-transition/adapter-contract-harnesses") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.adapterContractTestHarnessRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-transition/dry-run-consoles") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.labConnectionDryRunConsoleRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-transition/evidence-export-packs-v2") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.evidenceExportPackV2Records });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/lab-transition/real-lab-authorization-packets") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.realLabAuthorizationPacketRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/mock-prism/status") {
    sendJson(response, 200, { data: state.mockPrismStatus });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/mock-prism/executions") {
    sendJson(response, 200, { data: state.mockPrismExecutions });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/mock-prism/harness-console") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createMockPrismHarnessConsole(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/adapter-diagnostics") {
    sendJson(response, 200, { data: createPrismAdapterDiagnostics(state) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/simulator-profiles") {
    sendJson(response, 200, { data: state.prismSimulatorProfiles });
    return;
  }

  const simulatorProfileSelectMatch = url.pathname.match(/^\/api\/prism\/simulator-profiles\/([^/]+)\/select$/);
  if (request.method === "POST" && simulatorProfileSelectMatch) {
    requireRole(context, ["Platform Admin"]);
    const profile = selectPrismSimulatorProfile(state, decodeURIComponent(simulatorProfileSelectMatch[1]));
    await store.save(state);
    sendJson(response, 200, { data: profile });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/failure-scenarios") {
    sendJson(response, 200, { data: state.prismFailureScenarios });
    return;
  }

  const failureScenarioActivateMatch = url.pathname.match(/^\/api\/prism\/failure-scenarios\/([^/]+)\/activate$/);
  if (request.method === "POST" && failureScenarioActivateMatch) {
    requireRole(context, ["Platform Admin"]);
    const scenario = activatePrismFailureScenario(
      state,
      decodeURIComponent(failureScenarioActivateMatch[1]) as Parameters<typeof activatePrismFailureScenario>[1]
    );
    await store.save(state);
    sendJson(response, 200, { data: scenario });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/prism/real-preflight-runs") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.realPrismPreflightRuns });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/real-preflight-runs") {
    requireRole(context, ["Platform Admin"]);
    const run = createRealPrismPreflightRun(state, context.session.user, createRealPrismBlockedReasons(state));
    await store.save(state);
    sendJson(response, 201, { data: run });
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

  if (request.method === "GET" && url.pathname === "/api/ahv/lab-runtime/config") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: createAhvLabRuntimeConfig() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/ahv/lab-runtime/preflights") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.ahvLabRuntimePreflights });
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

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/dry-run-checklists") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledLabDryRunExecutionChecklists });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/evidence-ledgers") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledLabExecutionEvidenceLedgers });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/controlled-lab-release/readiness-attestations") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledLabExecutionReadinessAttestations });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/execution-broker/queue") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.executionBrokerQueueRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/execution-broker/dispatch-approvals") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.executionBrokerDispatchApprovals });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/lab-scope-activations") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.realAdapterLabScopeActivations });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/switch-reviews") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.manualRealAdapterSwitchReviews });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/switch-state-audit-packages") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.realAdapterSwitchStateAuditPackages });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/controlled-switch-requests") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.controlledSwitchConfigurationRequests });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/switch-handoff-packages") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.switchExecutionHandoffPackages });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/switch-outcome-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.switchExecutionOutcomeRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/switch-closure-packages") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.switchClosureRetentionPackages });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/adapter-promotion-dossiers") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.adapterPromotionReadinessDossiers });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-authorization-packets") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionAdapterAuthorizationPackets });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-change-freeze-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionChangeFreezeRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-cab-handoff-packets") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionCabHandoffPackets });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-cab-decision-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionCabDecisionRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-implementation-hold-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionImplementationHoldRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-operator-assignment-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionOperatorAssignmentRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-execution-readiness-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionReadinessRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-execution-authorization-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionAuthorizationRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-change-ticket-lock-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionChangeTicketLockRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-final-execution-packet-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionFinalExecutionPacketRecords });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/real-adapter/production-execution-hold-point-records") {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionHoldPointRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-outcome-authorization-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionOutcomeAuthorizationRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-closure-authorization-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionClosureAuthorizationRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-closure-packet-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionClosurePacketRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archival-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchivalHandoffRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-retention-attestation-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionRetentionAttestationRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-final-archive-certification-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionFinalArchiveCertificationRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-completion-dossier-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionCompletionDossierRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-operations-handover-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionOperationsHandoverRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-support-readiness-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionSupportReadinessRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-service-acceptance-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionServiceAcceptanceRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-final-turnover-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionFinalTurnoverRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-operational-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionOperationalClosureRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-post-implementation-review-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionPostImplementationReviewRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-improvement-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionImprovementClosureRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-final-acceptance-archive-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionFinalAcceptanceArchiveRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-readiness-archive-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionReadinessArchiveHandoffRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-retrieval-validation-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRetrievalValidationRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-drill-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryDrillRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-acceptance-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryAcceptanceRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryClosureRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-audit-certification-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryAuditCertificationRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryFinalComplianceArchiveRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryOperationalContinuityRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryServiceManagementHandoffRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords });
    return;
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    sendJson(response, 200, { data: state.productionExecutionArchiveRecoveryFinalOperationsHandoffRecords });
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
        mockPrismExecutions: state.mockPrismExecutions.filter((execution) => execution.environmentName === environmentName),
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

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-lab-gates") {
    requireRole(context, ["Platform Admin"]);
    const gate = createReadOnlyPrismLabGate(state, context.session.user);
    addAuditEvent(state, "prism.readonly.lab-gate.recorded", context.session.user, "NCI", {
      status: gate.status,
      allowedOperations: gate.allowedOperations,
      excludedOperationCount: gate.excludedOperations.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: gate });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-lab-profiles") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateReadOnlyLabConnectionProfileRequest>(request);
    const profile = createReadOnlyLabConnectionProfile(state, body, context.session.user);
    state.readOnlyLabConnectionProfiles = [profile, ...state.readOnlyLabConnectionProfiles];
    addAuditEvent(state, "prism.readonly.lab-profile.recorded", context.session.user, profile.name, {
      status: profile.approvalState,
      provider: profile.provider,
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: profile });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/fixture-replays") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreatePrismFixtureReplayRequest>(request);
    const replay = createPrismFixtureReplayRecord(body, context.session.user);
    state.prismFixtureReplayRecords = [replay, ...state.prismFixtureReplayRecords];
    addAuditEvent(state, "prism.fixture.replay.recorded", context.session.user, replay.fixtureName, {
      status: replay.status,
      recordCount: replay.recordCount,
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: replay });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-authorization-gates") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateReadOnlyAdapterAuthorizationGateRequest>(request);
    const gate = createReadOnlyAdapterAuthorizationGate(state, body, context.session.user);
    state.readOnlyAdapterAuthorizationGates = [gate, ...state.readOnlyAdapterAuthorizationGates];
    addAuditEvent(state, "prism.readonly.authorization-gate.recorded", context.session.user, gate.id, {
      status: gate.status,
      approvedOperations: gate.authorizationPacket.approvedOperations,
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: gate });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/operator/evidence-exports") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateOperatorEvidenceExportPackRequest>(request);
    const pack = createOperatorEvidenceExportPack(state, body, context.session.user, {
      readiness: createProductionReadinessScorecard(state),
      authBoundary: createAuthBoundaryDiagnostics(context, request),
      configValidation: createContainerConfigValidationManifest(),
      liveDesign: createLiveReadOnlyPrismCallDesign(),
    });
    state.operatorEvidenceExportPacks = [pack, ...state.operatorEvidenceExportPacks];
    addAuditEvent(state, "operator.evidence-export.prepared", context.session.user, pack.id, {
      artifactCount: pack.includedArtifacts.reduce((sum, artifact) => sum + artifact.count, 0),
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: pack });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-pilot/runbook-workflows") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabPilotRunbookWorkflowRequest>(request);
    const workflow = createLabPilotRunbookWorkflow(state, body, context.session.user);
    state.labPilotRunbookWorkflows = [workflow, ...state.labPilotRunbookWorkflows];
    addAuditEvent(state, "lab-pilot.runbook.prepared", context.session.user, workflow.id, {
      phase: workflow.phase,
      status: workflow.status,
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: workflow });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-runtime-modes") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<SetReadOnlyAdapterRuntimeModeRequest>(request);
    const modeRecord = setReadOnlyAdapterRuntimeMode(state, body, context.session.user);
    state.readOnlyAdapterRuntimeModeRecords = [modeRecord, ...state.readOnlyAdapterRuntimeModeRecords];
    addAuditEvent(state, "prism.readonly.runtime-mode.selected", context.session.user, modeRecord.activeMode, {
      requestedMode: modeRecord.requestedMode,
      status: modeRecord.status,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: modeRecord });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/live-read-only-inventory-pilots") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLiveReadOnlyInventoryPilotRequest>(request);
    const pilot = createLiveReadOnlyInventoryPilotRecord(state, body, context.session.user);
    state.liveReadOnlyInventoryPilots = [pilot, ...state.liveReadOnlyInventoryPilots];
    addAuditEvent(state, "prism.readonly.inventory-pilot.recorded", context.session.user, pilot.id, {
      status: pilot.status,
      recordsImported: pilot.recordsImported,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: pilot });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-observability") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateReadOnlyAdapterObservabilityRequest>(request);
    const observability = createReadOnlyAdapterObservabilityRecord(state, body, context.session.user);
    state.readOnlyAdapterObservabilityRecords = [observability, ...state.readOnlyAdapterObservabilityRecords];
    addAuditEvent(state, "prism.readonly.observability.prepared", context.session.user, observability.id, {
      observedOperations: observability.summary.observedOperations,
      blockedMutations: observability.summary.blockedMutations,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: observability });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/production/readiness-decision-gates") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionReadinessDecisionGateRequest>(request);
    const gate = createProductionReadinessDecisionGate(state, body, context.session.user);
    state.productionReadinessDecisionGates = [gate, ...state.productionReadinessDecisionGates];
    addAuditEvent(state, "production.readiness-decision-gate.recorded", context.session.user, gate.id, {
      decision: gate.decision,
      status: gate.status,
      blockerCount: gate.blockers.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: gate });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/real-read-only/config-boundaries") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateRealReadOnlyAdapterConfigBoundaryRequest>(request);
    const record = createRealReadOnlyAdapterConfigBoundary(state, body, context.session.user);
    state.realReadOnlyAdapterConfigBoundaries = [record, ...state.realReadOnlyAdapterConfigBoundaries];
    addAuditEvent(state, "prism.real-readonly.config-boundary.recorded", context.session.user, record.id, {
      status: record.status,
      tlsValidationMode: record.tlsValidationMode,
      killSwitch: record.killSwitch,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/credentials/provider-contracts") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateCredentialProviderContractRequest>(request);
    const record = createCredentialProviderContractRecord(state, body, context.session.user);
    state.credentialProviderContractRecords = [record, ...state.credentialProviderContractRecords];
    addAuditEvent(state, "credential.provider-contract.recorded", context.session.user, record.id, {
      resolverStatus: record.resolverStatus,
      resolvedSecretAvailable: record.resolvedSecretAvailable,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/real-read-only/adapter-interfaces") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateDisabledRealReadOnlyAdapterInterfaceRequest>(request);
    const record = createDisabledRealReadOnlyAdapterInterfaceRecord(state, body, context.session.user);
    state.disabledRealReadOnlyAdapterInterfaceRecords = [record, ...state.disabledRealReadOnlyAdapterInterfaceRecords];
    addAuditEvent(state, "prism.real-readonly.adapter-interface.recorded", context.session.user, record.id, {
      status: record.status,
      supportedOperations: record.supportedOperations.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/offline-contract-replays") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateOfflineContractReplaySuiteRequest>(request);
    const record = createOfflineContractReplaySuiteRecord(state, body, context.session.user);
    state.offlineContractReplaySuiteRecords = [record, ...state.offlineContractReplaySuiteRecords];
    addAuditEvent(state, "prism.offline-contract-replay.recorded", context.session.user, record.id, {
      status: record.status,
      coverage: record.coverage.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/authorized-lab-dry-runs") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateAuthorizedLabConnectionDryRunRequest>(request);
    const record = createAuthorizedLabConnectionDryRunRecord(state, body, context.session.user);
    state.authorizedLabConnectionDryRunRecords = [record, ...state.authorizedLabConnectionDryRunRecords];
    addAuditEvent(state, "prism.authorized-lab-dry-run.recorded", context.session.user, record.id, {
      status: record.status,
      validationCount: record.validations.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-lab-profile-hardening") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateHardenedLabConnectionProfileReviewRequest>(request);
    const record = createHardenedLabConnectionProfileReview(state, body, context.session.user);
    state.hardenedLabConnectionProfileReviews = [record, ...state.hardenedLabConnectionProfileReviews];
    addAuditEvent(state, "prism.readonly.lab-profile-hardening.recorded", context.session.user, record.id, {
      status: record.status,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/credentials/resolver-stubs") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateCredentialResolverAdapterStubRequest>(request);
    const record = createCredentialResolverAdapterStubRecord(state, body, context.session.user);
    state.credentialResolverAdapterStubRecords = [record, ...state.credentialResolverAdapterStubRecords];
    addAuditEvent(state, "credential.resolver-stub.recorded", context.session.user, record.id, {
      status: record.status,
      resolvedSecretAvailable: record.resolvedSecretAvailable,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-http-clients") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateDisabledPrismReadOnlyHttpClientRequest>(request);
    const record = createDisabledPrismReadOnlyHttpClientRecord(state, body, context.session.user);
    state.disabledPrismReadOnlyHttpClientRecords = [record, ...state.disabledPrismReadOnlyHttpClientRecords];
    addAuditEvent(state, "prism.readonly.http-client.recorded", context.session.user, record.id, {
      status: record.status,
      requestShape: record.requestShape.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/lab-connectivity-preflights") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabConnectivityPreflightRequest>(request);
    const record = createLabConnectivityPreflightRecord(state, body, context.session.user);
    state.labConnectivityPreflightRecords = [record, ...state.labConnectivityPreflightRecords];
    addAuditEvent(state, "prism.lab-connectivity-preflight.recorded", context.session.user, record.id, {
      status: record.status,
      validationCount: record.validations.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/authorized-read-only-pilot-gates") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateAuthorizedReadOnlyLabPilotGateRequest>(request);
    const record = createAuthorizedReadOnlyLabPilotGateRecord(state, body, context.session.user);
    state.authorizedReadOnlyLabPilotGateRecords = [record, ...state.authorizedReadOnlyLabPilotGateRecords];
    addAuditEvent(state, "prism.authorized-readonly-pilot-gate.recorded", context.session.user, record.id, {
      status: record.status,
      checkCount: record.checks.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-runtime-policies") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateReadOnlyRuntimeEnablementPolicyRequest>(request);
    const record = createReadOnlyRuntimeEnablementPolicyRecord(state, body, context.session.user);
    state.readOnlyRuntimeEnablementPolicies = [record, ...state.readOnlyRuntimeEnablementPolicies];
    addAuditEvent(state, "prism.readonly.runtime-policy.recorded", context.session.user, record.id, {
      status: record.status,
      runtimeFlag: record.runtimeFlag,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/read-only-pilot-sessions") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateReadOnlyPilotSessionRequest>(request);
    const record = createReadOnlyPilotSessionRecord(state, body, context.session.user);
    state.readOnlyPilotSessions = [record, ...state.readOnlyPilotSessions];
    addAuditEvent(state, "prism.readonly.pilot-session.recorded", context.session.user, record.id, {
      status: record.status,
      runtimeMode: record.runtimeMode,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/live-read-only-call-envelopes") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLiveReadOnlyCallEnvelopeRequest>(request);
    const record = createLiveReadOnlyCallEnvelopeRecord(state, body, context.session.user);
    state.liveReadOnlyCallEnvelopes = [record, ...state.liveReadOnlyCallEnvelopes];
    addAuditEvent(state, "prism.readonly.call-envelope.recorded", context.session.user, record.id, {
      status: record.status,
      operationCount: record.operationEnvelopes.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/pilot-evidence-reviews") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreatePilotEvidenceReviewRequest>(request);
    const record = createPilotEvidenceReviewRecord(state, body, context.session.user);
    state.pilotEvidenceReviewRecords = [record, ...state.pilotEvidenceReviewRecords];
    addAuditEvent(state, "prism.readonly.evidence-review.recorded", context.session.user, record.id, {
      status: record.status,
      decision: record.decision,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/prism/emergency-stop-rollback-drills") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateEmergencyStopRollbackDrillRequest>(request);
    const record = createEmergencyStopRollbackDrillRecord(state, body, context.session.user);
    state.emergencyStopRollbackDrillRecords = [record, ...state.emergencyStopRollbackDrillRecords];
    addAuditEvent(state, "prism.readonly.rollback-drill.recorded", context.session.user, record.id, {
      status: record.status,
      rollbackMode: record.rollbackMode,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-transition/readiness-workspaces") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabReadinessWorkspaceRequest>(request);
    const record = createLabReadinessWorkspaceRecord(state, body, context.session.user);
    state.labReadinessWorkspaces = [record, ...state.labReadinessWorkspaces];
    addAuditEvent(state, "lab-transition.readiness-workspace.recorded", context.session.user, record.id, {
      status: record.status,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-transition/mock-prism-endpoint-expansions") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateMockPrismEndpointExpansionRequest>(request);
    const record = createMockPrismEndpointExpansionRecord(state, body, context.session.user);
    state.mockPrismEndpointExpansionRecords = [record, ...state.mockPrismEndpointExpansionRecords];
    addAuditEvent(state, "lab-transition.mock-prism-expansion.recorded", context.session.user, record.id, {
      status: record.status,
      endpointCount: record.supportedEndpoints.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-transition/adapter-contract-harnesses") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateAdapterContractTestHarnessRequest>(request);
    const record = createAdapterContractTestHarnessRecord(state, body, context.session.user);
    state.adapterContractTestHarnessRecords = [record, ...state.adapterContractTestHarnessRecords];
    addAuditEvent(state, "lab-transition.adapter-contract-harness.recorded", context.session.user, record.id, {
      status: record.status,
      suiteCount: record.testSuites.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-transition/dry-run-consoles") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateLabConnectionDryRunConsoleRequest>(request);
    const record = createLabConnectionDryRunConsoleRecord(state, body, context.session.user);
    state.labConnectionDryRunConsoleRecords = [record, ...state.labConnectionDryRunConsoleRecords];
    addAuditEvent(state, "lab-transition.dry-run-console.recorded", context.session.user, record.id, {
      status: record.status,
      operationCount: record.allowedOperations.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-transition/evidence-export-packs-v2") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateEvidenceExportPackV2Request>(request);
    const record = createEvidenceExportPackV2Record(state, body, context.session.user);
    state.evidenceExportPackV2Records = [record, ...state.evidenceExportPackV2Records];
    addAuditEvent(state, "lab-transition.evidence-export-pack-v2.recorded", context.session.user, record.id, {
      status: record.status,
      manifestCount: record.manifest.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/lab-transition/real-lab-authorization-packets") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateRealLabAuthorizationPacketRequest>(request);
    const record = createRealLabAuthorizationPacketRecord(state, body, context.session.user);
    state.realLabAuthorizationPacketRecords = [record, ...state.realLabAuthorizationPacketRecords];
    addAuditEvent(state, "lab-transition.real-lab-authorization-packet.recorded", context.session.user, record.id, {
      status: record.status,
      approvalOwners: record.approvalOwners.length,
      provisioningEnabled: false,
      networkCallEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  const labPilotActionMatch = url.pathname.match(/^\/api\/lab-pilot\/runbook-workflows\/([^/]+)\/(approve|execute-dry-run|review-evidence|close)$/);
  if (request.method === "POST" && labPilotActionMatch) {
    requireRole(context, ["Platform Admin"]);
    const workflowId = decodeURIComponent(labPilotActionMatch[1]);
    const action = labPilotActionMatch[2] as LabPilotRunbookWorkflowAction;
    const workflow = state.labPilotRunbookWorkflows.find((item) => item.id === workflowId);
    if (!workflow) {
      sendJson(response, 404, {
        error: {
          code: "lab_pilot_workflow_not_found",
          message: `Lab pilot workflow not found: ${workflowId}`,
        },
      });
      return;
    }
    const updated = advanceLabPilotRunbookWorkflow(workflow, action, context.session.user);
    state.labPilotRunbookWorkflows = state.labPilotRunbookWorkflows.map((item) =>
      item.id === updated.id ? updated : item
    );
    addAuditEvent(state, `lab-pilot.runbook.${action}`, context.session.user, updated.id, {
      phase: updated.phase,
      status: updated.status,
      provisioningEnabled: false,
      realPrismCallsEnabled: false,
    });
    await store.save(state);
    sendJson(response, 200, { data: updated });
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

  if (request.method === "POST" && url.pathname === "/api/ahv/lab-runtime/preflight") {
    requireRole(context, ["Platform Admin"]);
    const adapter = new LabAhvPrismAdapter();
    const preflight = await adapter.preflight(context.session.user);
    state.ahvLabRuntimePreflights = [preflight, ...state.ahvLabRuntimePreflights];
    addAuditEvent(state, "ahv.lab-runtime.preflight", context.session.user, preflight.id, {
      status: preflight.status,
      checksPassed: preflight.config.checks.every((check) => check.passed),
      readOnlyChecksPassed: preflight.readOnlyChecks.every((check) => check.passed),
      provisioningEnabled: preflight.provisioningEnabled,
      realPrismCallsEnabled: preflight.realPrismCallsEnabled,
    });
    await store.save(state);
    sendJson(response, 201, { data: preflight });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/ahv/controlled-provisioning/runs") {
    requireRole(context, ["Platform Admin"]);
    try {
      const body = await readJson<CreateAhvControlledProvisioningRunRequest>(request);
      const runtimeConfig = createAhvLabRuntimeConfig();
      const run = runtimeConfig.provisioningEnabled
        ? await new LabAhvPrismAdapter().create(state, body.gateId, context.session.user)
        : createDisabledAhvControlledProvisioningAdapter().preflight(state, body, context.session.user);
      state.ahvControlledProvisioningRuns = [run, ...state.ahvControlledProvisioningRuns];
      addAuditEvent(state, run.provisioningEnabled ? "ahv.controlled.create.submitted" : "ahv.controlled.preflight.recorded", context.session.user, run.environmentName, {
        gateId: run.gateId,
        status: run.status,
        adapterMode: run.adapterMode,
        prismTaskUuid: run.prismTaskUuid,
        vmUuid: run.vmUuid,
        provisioningEnabled: run.provisioningEnabled,
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

  const ahvRunActionMatch = url.pathname.match(/^\/api\/ahv\/controlled-provisioning\/runs\/([^/]+)\/(poll|power|destroy)$/);
  if (request.method === "POST" && ahvRunActionMatch) {
    requireRole(context, ["Platform Admin"]);
    const runId = decodeURIComponent(ahvRunActionMatch[1]);
    const action = ahvRunActionMatch[2] as "poll" | "power" | "destroy";
    const existing = state.ahvControlledProvisioningRuns.find((item) => item.id === runId);
    if (!existing) {
      sendJson(response, 404, {
        error: {
          code: "ahv_run_not_found",
          message: "AHV controlled provisioning run was not found.",
        },
      });
      return;
    }
    if (existing.adapterMode !== "Lab AHV Prism adapter") {
      sendJson(response, 409, {
        error: {
          code: "ahv_run_not_lab_adapter",
          message: "AHV lifecycle actions require a Lab AHV Prism adapter run.",
        },
      });
      return;
    }

    const adapter = new LabAhvPrismAdapter();
    const body = await readJson<{ powerState?: "ON" | "OFF" }>(request);
    const updated =
      action === "poll"
        ? await adapter.poll(existing)
        : action === "power"
          ? await adapter.power(existing, body.powerState === "OFF" ? "OFF" : "ON")
          : await adapter.destroy(existing);
    state.ahvControlledProvisioningRuns = state.ahvControlledProvisioningRuns.map((item) =>
      item.id === updated.id ? updated : item
    );
    addAuditEvent(state, `ahv.controlled.${action}`, context.session.user, updated.environmentName, {
      runId: updated.id,
      adapterMode: updated.adapterMode,
      status: updated.status,
      prismTaskUuid: updated.prismTaskUuid,
      prismTaskUuids: updated.prismTaskUuids,
      vmUuid: updated.vmUuid,
      inventoryReconciliation: redactSensitive(updated.inventoryReconciliation),
      provisioningEnabled: updated.provisioningEnabled,
    });
    await store.save(state);
    sendJson(response, 200, { data: updated });
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

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/dry-run-checklists") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledLabDryRunExecutionChecklistRequest>(request);
    const checklist = createControlledLabDryRunExecutionChecklist(state, body, context.session.user);
    state.controlledLabDryRunExecutionChecklists = [checklist, ...state.controlledLabDryRunExecutionChecklists];
    addAuditEvent(state, "controlled-lab-release.dry-run-checklist.recorded", context.session.user, checklist.provider, {
      rehearsalPacketId: checklist.rehearsalPacketId,
      approvalGateId: checklist.approvalGateId,
      status: checklist.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: checklist });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/evidence-ledgers") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledLabExecutionEvidenceLedgerRequest>(request);
    const ledger = createControlledLabExecutionEvidenceLedger(state, body, context.session.user);
    state.controlledLabExecutionEvidenceLedgers = [ledger, ...state.controlledLabExecutionEvidenceLedgers];
    addAuditEvent(state, "controlled-lab-release.evidence-ledger.recorded", context.session.user, ledger.provider, {
      dryRunChecklistId: ledger.dryRunChecklistId,
      rehearsalPacketId: ledger.rehearsalPacketId,
      status: ledger.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: ledger });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/controlled-lab-release/readiness-attestations") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledLabExecutionReadinessAttestationRequest>(request);
    const attestation = createControlledLabExecutionReadinessAttestation(state, body, context.session.user);
    state.controlledLabExecutionReadinessAttestations = [
      attestation,
      ...state.controlledLabExecutionReadinessAttestations,
    ];
    addAuditEvent(
      state,
      "controlled-lab-release.readiness-attestation.recorded",
      context.session.user,
      attestation.provider,
      {
        evidenceLedgerId: attestation.evidenceLedgerId,
        dryRunChecklistId: attestation.dryRunChecklistId,
        status: attestation.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: attestation });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/execution-broker/queue") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateExecutionBrokerQueueRecordRequest>(request);
    const brokerRecord = createExecutionBrokerQueueRecord(state, body, context.session.user);
    state.executionBrokerQueueRecords = [brokerRecord, ...state.executionBrokerQueueRecords];
    addAuditEvent(state, "execution-broker.queue.recorded", context.session.user, brokerRecord.provider, {
      readinessAttestationId: brokerRecord.readinessAttestationId,
      idempotencyKey: brokerRecord.idempotencyKey,
      status: brokerRecord.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: brokerRecord });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/execution-broker/dispatch-approvals") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateExecutionBrokerDispatchApprovalRequest>(request);
    const dispatchApproval = createExecutionBrokerDispatchApproval(state, body, context.session.user);
    state.executionBrokerDispatchApprovals = [dispatchApproval, ...state.executionBrokerDispatchApprovals];
    addAuditEvent(state, "execution-broker.dispatch-approval.recorded", context.session.user, dispatchApproval.provider, {
      brokerRecordId: dispatchApproval.brokerRecordId,
      idempotencyKey: dispatchApproval.idempotencyKey,
      status: dispatchApproval.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: dispatchApproval });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/lab-scope-activations") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateRealAdapterLabScopeActivationRequest>(request);
    const activation = createRealAdapterLabScopeActivation(state, body, context.session.user);
    state.realAdapterLabScopeActivations = [activation, ...state.realAdapterLabScopeActivations];
    addAuditEvent(state, "real-adapter.lab-scope-activation.recorded", context.session.user, activation.provider, {
      dispatchApprovalId: activation.dispatchApprovalId,
      idempotencyKey: activation.idempotencyKey,
      status: activation.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: activation });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/switch-reviews") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateManualRealAdapterSwitchReviewRequest>(request);
    const review = createManualRealAdapterSwitchReview(state, body, context.session.user);
    state.manualRealAdapterSwitchReviews = [review, ...state.manualRealAdapterSwitchReviews];
    addAuditEvent(state, "real-adapter.switch-review.recorded", context.session.user, review.provider, {
      activationId: review.activationId,
      idempotencyKey: review.idempotencyKey,
      status: review.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: review });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/switch-state-audit-packages") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateRealAdapterSwitchStateAuditPackageRequest>(request);
    const auditPackage = createRealAdapterSwitchStateAuditPackage(state, body, context.session.user);
    state.realAdapterSwitchStateAuditPackages = [auditPackage, ...state.realAdapterSwitchStateAuditPackages];
    addAuditEvent(state, "real-adapter.switch-state-audit.recorded", context.session.user, auditPackage.provider, {
      switchReviewId: auditPackage.switchReviewId,
      idempotencyKey: auditPackage.idempotencyKey,
      status: auditPackage.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: auditPackage });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/controlled-switch-requests") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateControlledSwitchConfigurationRequestRequest>(request);
    const switchRequest = createControlledSwitchConfigurationRequest(state, body, context.session.user);
    state.controlledSwitchConfigurationRequests = [
      switchRequest,
      ...state.controlledSwitchConfigurationRequests,
    ];
    addAuditEvent(state, "real-adapter.controlled-switch-request.recorded", context.session.user, switchRequest.provider, {
      auditPackageId: switchRequest.auditPackageId,
      idempotencyKey: switchRequest.idempotencyKey,
      status: switchRequest.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: switchRequest });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/switch-handoff-packages") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateSwitchExecutionHandoffPackageRequest>(request);
    const handoffPackage = createSwitchExecutionHandoffPackage(state, body, context.session.user);
    state.switchExecutionHandoffPackages = [
      handoffPackage,
      ...state.switchExecutionHandoffPackages,
    ];
    addAuditEvent(state, "real-adapter.switch-handoff-package.recorded", context.session.user, handoffPackage.provider, {
      controlledSwitchRequestId: handoffPackage.controlledSwitchRequestId,
      idempotencyKey: handoffPackage.idempotencyKey,
      status: handoffPackage.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: handoffPackage });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/switch-outcome-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateSwitchExecutionOutcomeRecordRequest>(request);
    const outcomeRecord = createSwitchExecutionOutcomeRecord(state, body, context.session.user);
    state.switchExecutionOutcomeRecords = [
      outcomeRecord,
      ...state.switchExecutionOutcomeRecords,
    ];
    addAuditEvent(state, "real-adapter.switch-outcome.recorded", context.session.user, outcomeRecord.provider, {
      handoffPackageId: outcomeRecord.handoffPackageId,
      idempotencyKey: outcomeRecord.idempotencyKey,
      status: outcomeRecord.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: outcomeRecord });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/switch-closure-packages") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateSwitchClosureRetentionPackageRequest>(request);
    const closurePackage = createSwitchClosureRetentionPackage(state, body, context.session.user);
    state.switchClosureRetentionPackages = [
      closurePackage,
      ...state.switchClosureRetentionPackages,
    ];
    addAuditEvent(state, "real-adapter.switch-closure.recorded", context.session.user, closurePackage.provider, {
      outcomeRecordId: closurePackage.outcomeRecordId,
      idempotencyKey: closurePackage.idempotencyKey,
      status: closurePackage.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: closurePackage });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/adapter-promotion-dossiers") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateAdapterPromotionReadinessDossierRequest>(request);
    const dossier = createAdapterPromotionReadinessDossier(state, body, context.session.user);
    state.adapterPromotionReadinessDossiers = [
      dossier,
      ...state.adapterPromotionReadinessDossiers,
    ];
    addAuditEvent(state, "real-adapter.adapter-promotion-dossier.recorded", context.session.user, dossier.provider, {
      closurePackageId: dossier.closurePackageId,
      idempotencyKey: dossier.idempotencyKey,
      status: dossier.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: dossier });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-authorization-packets") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionAdapterAuthorizationPacketRequest>(request);
    const packet = createProductionAdapterAuthorizationPacket(state, body, context.session.user);
    state.productionAdapterAuthorizationPackets = [packet, ...state.productionAdapterAuthorizationPackets];
    addAuditEvent(state, "real-adapter.production-authorization.recorded", context.session.user, packet.provider, {
      promotionDossierId: packet.promotionDossierId,
      idempotencyKey: packet.idempotencyKey,
      status: packet.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: packet });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-change-freeze-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionChangeFreezeRecordRequest>(request);
    const record = createProductionChangeFreezeRecord(state, body, context.session.user);
    state.productionChangeFreezeRecords = [record, ...state.productionChangeFreezeRecords];
    addAuditEvent(state, "real-adapter.production-change-freeze.recorded", context.session.user, record.provider, {
      authorizationPacketId: record.authorizationPacketId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-cab-handoff-packets") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionCabHandoffPacketRequest>(request);
    const packet = createProductionCabHandoffPacket(state, body, context.session.user);
    state.productionCabHandoffPackets = [packet, ...state.productionCabHandoffPackets];
    addAuditEvent(state, "real-adapter.production-cab-handoff.recorded", context.session.user, packet.provider, {
      freezeRecordId: packet.freezeRecordId,
      idempotencyKey: packet.idempotencyKey,
      status: packet.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: packet });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-cab-decision-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionCabDecisionRecordRequest>(request);
    const record = createProductionCabDecisionRecord(state, body, context.session.user);
    state.productionCabDecisionRecords = [record, ...state.productionCabDecisionRecords];
    addAuditEvent(state, "real-adapter.production-cab-decision.recorded", context.session.user, record.provider, {
      cabHandoffPacketId: record.cabHandoffPacketId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-implementation-hold-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionImplementationHoldRecordRequest>(request);
    const record = createProductionImplementationHoldRecord(state, body, context.session.user);
    state.productionImplementationHoldRecords = [record, ...state.productionImplementationHoldRecords];
    addAuditEvent(state, "real-adapter.production-implementation-hold.recorded", context.session.user, record.provider, {
      cabDecisionRecordId: record.cabDecisionRecordId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-operator-assignment-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionOperatorAssignmentRecordRequest>(request);
    const record = createProductionOperatorAssignmentRecord(state, body, context.session.user);
    state.productionOperatorAssignmentRecords = [record, ...state.productionOperatorAssignmentRecords];
    addAuditEvent(state, "real-adapter.production-operator-assignment.recorded", context.session.user, record.provider, {
      implementationHoldRecordId: record.implementationHoldRecordId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-execution-readiness-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionReadinessRecordRequest>(request);
    const record = createProductionExecutionReadinessRecord(state, body, context.session.user);
    state.productionExecutionReadinessRecords = [record, ...state.productionExecutionReadinessRecords];
    addAuditEvent(state, "real-adapter.production-execution-readiness.recorded", context.session.user, record.provider, {
      operatorAssignmentRecordId: record.operatorAssignmentRecordId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-execution-authorization-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionAuthorizationRecordRequest>(request);
    const record = createProductionExecutionAuthorizationRecord(state, body, context.session.user);
    state.productionExecutionAuthorizationRecords = [record, ...state.productionExecutionAuthorizationRecords];
    addAuditEvent(state, "real-adapter.production-execution-authorization.recorded", context.session.user, record.provider, {
      executionReadinessRecordId: record.executionReadinessRecordId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-change-ticket-lock-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionChangeTicketLockRecordRequest>(request);
    const record = createProductionChangeTicketLockRecord(state, body, context.session.user);
    state.productionChangeTicketLockRecords = [record, ...state.productionChangeTicketLockRecords];
    addAuditEvent(state, "real-adapter.production-change-ticket-lock.recorded", context.session.user, record.provider, {
      executionAuthorizationRecordId: record.executionAuthorizationRecordId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-final-execution-packet-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionFinalExecutionPacketRecordRequest>(request);
    const record = createProductionFinalExecutionPacketRecord(state, body, context.session.user);
    state.productionFinalExecutionPacketRecords = [record, ...state.productionFinalExecutionPacketRecords];
    addAuditEvent(state, "real-adapter.production-final-execution-packet.recorded", context.session.user, record.provider, {
      changeTicketLockRecordId: record.changeTicketLockRecordId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/real-adapter/production-execution-hold-point-records") {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionHoldPointRecordRequest>(request);
    const record = createProductionExecutionHoldPointRecord(state, body, context.session.user);
    state.productionExecutionHoldPointRecords = [record, ...state.productionExecutionHoldPointRecords];
    addAuditEvent(state, "real-adapter.production-execution-hold-point.recorded", context.session.user, record.provider, {
      finalExecutionPacketRecordId: record.finalExecutionPacketRecordId,
      idempotencyKey: record.idempotencyKey,
      status: record.status,
      provisioningEnabled: false,
    });
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-outcome-authorization-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionOutcomeAuthorizationRecordRequest>(request);
    const record = createProductionExecutionOutcomeAuthorizationRecord(state, body, context.session.user);
    state.productionExecutionOutcomeAuthorizationRecords = [
      record,
      ...state.productionExecutionOutcomeAuthorizationRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-outcome-authorization.recorded",
      context.session.user,
      record.provider,
      {
        executionHoldPointRecordId: record.executionHoldPointRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-closure-authorization-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionClosureAuthorizationRecordRequest>(request);
    const record = createProductionExecutionClosureAuthorizationRecord(state, body, context.session.user);
    state.productionExecutionClosureAuthorizationRecords = [
      record,
      ...state.productionExecutionClosureAuthorizationRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-closure-authorization.recorded",
      context.session.user,
      record.provider,
      {
        outcomeAuthorizationRecordId: record.outcomeAuthorizationRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-closure-packet-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionClosurePacketRecordRequest>(request);
    const record = createProductionExecutionClosurePacketRecord(state, body, context.session.user);
    state.productionExecutionClosurePacketRecords = [record, ...state.productionExecutionClosurePacketRecords];
    addAuditEvent(
      state,
      "real-adapter.production-execution-closure-packet.recorded",
      context.session.user,
      record.provider,
      {
        closureAuthorizationRecordId: record.closureAuthorizationRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archival-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchivalHandoffRecordRequest>(request);
    const record = createProductionExecutionArchivalHandoffRecord(state, body, context.session.user);
    state.productionExecutionArchivalHandoffRecords = [
      record,
      ...state.productionExecutionArchivalHandoffRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archival-handoff.recorded",
      context.session.user,
      record.provider,
      {
        closurePacketRecordId: record.closurePacketRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-retention-attestation-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionRetentionAttestationRecordRequest>(request);
    const record = createProductionExecutionRetentionAttestationRecord(state, body, context.session.user);
    state.productionExecutionRetentionAttestationRecords = [
      record,
      ...state.productionExecutionRetentionAttestationRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-retention-attestation.recorded",
      context.session.user,
      record.provider,
      {
        archivalHandoffRecordId: record.archivalHandoffRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-final-archive-certification-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionFinalArchiveCertificationRecordRequest>(request);
    const record = createProductionExecutionFinalArchiveCertificationRecord(state, body, context.session.user);
    state.productionExecutionFinalArchiveCertificationRecords = [
      record,
      ...state.productionExecutionFinalArchiveCertificationRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-final-archive-certification.recorded",
      context.session.user,
      record.provider,
      {
        retentionAttestationRecordId: record.retentionAttestationRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-completion-dossier-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionCompletionDossierRecordRequest>(request);
    const record = createProductionExecutionCompletionDossierRecord(state, body, context.session.user);
    state.productionExecutionCompletionDossierRecords = [
      record,
      ...state.productionExecutionCompletionDossierRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-completion-dossier.recorded",
      context.session.user,
      record.provider,
      {
        finalArchiveCertificationRecordId: record.finalArchiveCertificationRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-operations-handover-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionOperationsHandoverRecordRequest>(request);
    const record = createProductionExecutionOperationsHandoverRecord(state, body, context.session.user);
    state.productionExecutionOperationsHandoverRecords = [
      record,
      ...state.productionExecutionOperationsHandoverRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-operations-handover.recorded",
      context.session.user,
      record.provider,
      {
        completionDossierRecordId: record.completionDossierRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-support-readiness-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionSupportReadinessRecordRequest>(request);
    const record = createProductionExecutionSupportReadinessRecord(state, body, context.session.user);
    state.productionExecutionSupportReadinessRecords = [
      record,
      ...state.productionExecutionSupportReadinessRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-support-readiness.recorded",
      context.session.user,
      record.provider,
      {
        operationsHandoverRecordId: record.operationsHandoverRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-service-acceptance-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionServiceAcceptanceRecordRequest>(request);
    const record = createProductionExecutionServiceAcceptanceRecord(state, body, context.session.user);
    state.productionExecutionServiceAcceptanceRecords = [
      record,
      ...state.productionExecutionServiceAcceptanceRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-service-acceptance.recorded",
      context.session.user,
      record.provider,
      {
        supportReadinessRecordId: record.supportReadinessRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-final-turnover-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionFinalTurnoverRecordRequest>(request);
    const record = createProductionExecutionFinalTurnoverRecord(state, body, context.session.user);
    state.productionExecutionFinalTurnoverRecords = [
      record,
      ...state.productionExecutionFinalTurnoverRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-final-turnover.recorded",
      context.session.user,
      record.provider,
      {
        serviceAcceptanceRecordId: record.serviceAcceptanceRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-operational-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionOperationalClosureRecordRequest>(request);
    const record = createProductionExecutionOperationalClosureRecord(state, body, context.session.user);
    state.productionExecutionOperationalClosureRecords = [
      record,
      ...state.productionExecutionOperationalClosureRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-operational-closure.recorded",
      context.session.user,
      record.provider,
      {
        finalTurnoverRecordId: record.finalTurnoverRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-post-implementation-review-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionPostImplementationReviewRecordRequest>(request);
    const record = createProductionExecutionPostImplementationReviewRecord(state, body, context.session.user);
    state.productionExecutionPostImplementationReviewRecords = [
      record,
      ...state.productionExecutionPostImplementationReviewRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-post-implementation-review.recorded",
      context.session.user,
      record.provider,
      {
        operationalClosureRecordId: record.operationalClosureRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-improvement-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionImprovementClosureRecordRequest>(request);
    const record = createProductionExecutionImprovementClosureRecord(state, body, context.session.user);
    state.productionExecutionImprovementClosureRecords = [
      record,
      ...state.productionExecutionImprovementClosureRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-improvement-closure.recorded",
      context.session.user,
      record.provider,
      {
        postImplementationReviewRecordId: record.postImplementationReviewRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-final-acceptance-archive-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionFinalAcceptanceArchiveRecordRequest>(request);
    const record = createProductionExecutionFinalAcceptanceArchiveRecord(state, body, context.session.user);
    state.productionExecutionFinalAcceptanceArchiveRecords = [
      record,
      ...state.productionExecutionFinalAcceptanceArchiveRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-final-acceptance-archive.recorded",
      context.session.user,
      record.provider,
      {
        improvementClosureRecordId: record.improvementClosureRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-readiness-archive-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionReadinessArchiveHandoffRecordRequest>(request);
    const record = createProductionExecutionReadinessArchiveHandoffRecord(state, body, context.session.user);
    state.productionExecutionReadinessArchiveHandoffRecords = [
      record,
      ...state.productionExecutionReadinessArchiveHandoffRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-readiness-archive-handoff.recorded",
      context.session.user,
      record.provider,
      {
        finalAcceptanceArchiveRecordId: record.finalAcceptanceArchiveRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-retrieval-validation-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRetrievalValidationRecordRequest>(request);
    const record = createProductionExecutionArchiveRetrievalValidationRecord(state, body, context.session.user);
    state.productionExecutionArchiveRetrievalValidationRecords = [
      record,
      ...state.productionExecutionArchiveRetrievalValidationRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-retrieval-validation.recorded",
      context.session.user,
      record.provider,
      {
        readinessArchiveHandoffRecordId: record.readinessArchiveHandoffRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-drill-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryDrillRecordRequest>(request);
    const record = createProductionExecutionArchiveRecoveryDrillRecord(state, body, context.session.user);
    state.productionExecutionArchiveRecoveryDrillRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryDrillRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-drill.recorded",
      context.session.user,
      record.provider,
      {
        archiveRetrievalValidationRecordId: record.archiveRetrievalValidationRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-acceptance-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryAcceptanceRecordRequest>(request);
    const record = createProductionExecutionArchiveRecoveryAcceptanceRecord(state, body, context.session.user);
    state.productionExecutionArchiveRecoveryAcceptanceRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryAcceptanceRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-acceptance.recorded",
      context.session.user,
      record.provider,
      {
        archiveRecoveryDrillRecordId: record.archiveRecoveryDrillRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryClosureRecordRequest>(request);
    const record = createProductionExecutionArchiveRecoveryClosureRecord(state, body, context.session.user);
    state.productionExecutionArchiveRecoveryClosureRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryClosureRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-closure.recorded",
      context.session.user,
      record.provider,
      {
        archiveRecoveryAcceptanceRecordId: record.archiveRecoveryAcceptanceRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-audit-certification-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryAuditCertificationRecordRequest>(request);
    const record = createProductionExecutionArchiveRecoveryAuditCertificationRecord(state, body, context.session.user);
    state.productionExecutionArchiveRecoveryAuditCertificationRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryAuditCertificationRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-audit-certification.recorded",
      context.session.user,
      record.provider,
      {
        archiveRecoveryClosureRecordId: record.archiveRecoveryClosureRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-final-compliance-archive-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryFinalComplianceArchiveRecordRequest>(request);
    const record = createProductionExecutionArchiveRecoveryFinalComplianceArchiveRecord(
      state,
      body,
      context.session.user
    );
    state.productionExecutionArchiveRecoveryFinalComplianceArchiveRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryFinalComplianceArchiveRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-final-compliance-archive.recorded",
      context.session.user,
      record.provider,
      {
        archiveRecoveryAuditCertificationRecordId: record.archiveRecoveryAuditCertificationRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-evidence-custody-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecordRequest>(request);
    const record = createProductionExecutionArchiveRecoveryEvidenceCustodyClosureRecord(
      state,
      body,
      context.session.user
    );
    state.productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryEvidenceCustodyClosureRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-evidence-custody-closure.recorded",
      context.session.user,
      record.provider,
      {
        finalComplianceArchiveRecordId: record.finalComplianceArchiveRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-operational-continuity-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryOperationalContinuityRecordRequest>(request);
    const record = createProductionExecutionArchiveRecoveryOperationalContinuityRecord(
      state,
      body,
      context.session.user
    );
    state.productionExecutionArchiveRecoveryOperationalContinuityRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryOperationalContinuityRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-operational-continuity.recorded",
      context.session.user,
      record.provider,
      {
        evidenceCustodyClosureRecordId: record.evidenceCustodyClosureRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-service-management-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryServiceManagementHandoffRecordRequest>(
      request
    );
    const record = createProductionExecutionArchiveRecoveryServiceManagementHandoffRecord(
      state,
      body,
      context.session.user
    );
    state.productionExecutionArchiveRecoveryServiceManagementHandoffRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryServiceManagementHandoffRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-service-management-handoff.recorded",
      context.session.user,
      record.provider,
      {
        operationalContinuityRecordId: record.operationalContinuityRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-support-ownership-acceptance-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecordRequest>(
      request
    );
    const record = createProductionExecutionArchiveRecoverySupportOwnershipAcceptanceRecord(
      state,
      body,
      context.session.user
    );
    state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords = [
      record,
      ...state.productionExecutionArchiveRecoverySupportOwnershipAcceptanceRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-support-ownership-acceptance.recorded",
      context.session.user,
      record.provider,
      {
        serviceManagementHandoffRecordId: record.serviceManagementHandoffRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-monitoring-ownership-closure-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecordRequest>(
      request
    );
    const record = createProductionExecutionArchiveRecoveryMonitoringOwnershipClosureRecord(
      state,
      body,
      context.session.user
    );
    state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryMonitoringOwnershipClosureRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-monitoring-ownership-closure.recorded",
      context.session.user,
      record.provider,
      {
        supportOwnershipAcceptanceRecordId: record.supportOwnershipAcceptanceRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
    return;
  }

  if (
    request.method === "POST" &&
    url.pathname === "/api/real-adapter/production-execution-archive-recovery-final-operations-handoff-records"
  ) {
    requireRole(context, ["Platform Admin"]);
    const body = await readJson<CreateProductionExecutionArchiveRecoveryFinalOperationsHandoffRecordRequest>(
      request
    );
    const record = createProductionExecutionArchiveRecoveryFinalOperationsHandoffRecord(
      state,
      body,
      context.session.user
    );
    state.productionExecutionArchiveRecoveryFinalOperationsHandoffRecords = [
      record,
      ...state.productionExecutionArchiveRecoveryFinalOperationsHandoffRecords,
    ];
    addAuditEvent(
      state,
      "real-adapter.production-execution-archive-recovery-final-operations-handoff.recorded",
      context.session.user,
      record.provider,
      {
        monitoringOwnershipClosureRecordId: record.monitoringOwnershipClosureRecordId,
        idempotencyKey: record.idempotencyKey,
        status: record.status,
        provisioningEnabled: false,
      }
    );
    await store.save(state);
    sendJson(response, 201, { data: record });
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
    provisioningEnabled: state.platformConfig.provisioningEnabled,
  };
}

function createPlatformSettingsSummary(state: ApiState, context: RequestContext): PlatformSettingsSummary {
  const retentionLimit = positiveNumber(process.env.NDC_AUDIT_RETENTION_EVENTS, 500);
  const labConfig = createAhvLabRuntimeConfig();

  return {
    generatedAt: new Date().toISOString(),
    environment: process.env.APP_ENV ?? "development",
    identity: {
      mode: context.session.authMode,
      issuer: context.session.identityProvider,
      trustedIdentityRequired: process.env.NDC_REQUIRE_TRUSTED_IDENTITY === "true",
      trustedHeaders: ["x-ndc-user", "x-ndc-roles", "x-ndc-issuer"],
      defaultRoles: ["Developer", "Approver", "Platform Admin"],
    },
    accounts: [
      {
        id: context.session.user,
        displayName: context.session.displayName,
        source: context.session.authMode === "Mock OIDC" ? "Current session" : "Trusted identity header",
        roles: context.session.roles,
        status: "Active",
      },
      {
        id: "external-directory",
        displayName: "External IdP / directory groups",
        source: "Future directory",
        roles: ["Developer", "Approver", "Platform Admin"],
        status: "Planned",
      },
    ],
    providerConfiguration: state.integrationConfigs.map((config) => ({
      provider: config.name as ProvisioningAdapterName,
      endpointConfigured: Boolean(config.endpoint.trim()),
      credentialReferenceConfigured: Boolean(config.credentialProfile.trim()),
      status: config.status,
      message: config.message,
    })),
    ahvLab: {
      realAdapterEnabled: labConfig.switches.realAdapter,
      controlledProvisioningEnabled: labConfig.switches.controlledProvisioning,
      lifecycleEnabled: labConfig.switches.labLifecycle,
      labMode: labConfig.appEnv === "lab",
      prismCentralConfigured: labConfig.prismCentralUrlConfigured,
      usernameConfigured: labConfig.usernameConfigured,
      passwordConfigured: labConfig.passwordConfigured,
      allowedClusterConfigured: labConfig.allowedClusterUuidConfigured,
      allowedProjectConfigured: labConfig.allowedProjectUuidConfigured,
      allowedSubnetConfigured: labConfig.allowedSubnetUuidConfigured,
      allowedImageConfigured: labConfig.allowedImageUuidConfigured,
      vmNamePrefix: labConfig.vmNamePrefix,
      quotas: labConfig.quotas,
    },
    featureFlags: [
      {
        name: "Simulated provisioning",
        enabled: state.platformConfig.provisioningEnabled,
        source: "Platform config",
        safety: "Mock only",
      },
      {
        name: "Controlled provisioning gates",
        enabled: labConfig.switches.controlledProvisioning,
        source: "Environment",
        safety: "Default off",
      },
      {
        name: "Real AHV Prism adapter",
        enabled: labConfig.switches.realAdapter,
        source: "Environment",
        safety: "Lab only",
      },
      {
        name: "AHV lab lifecycle",
        enabled: labConfig.switches.labLifecycle,
        source: "Environment",
        safety: "Lab only",
      },
      {
        name: "Insecure Prism TLS",
        enabled: process.env.NDC_PRISM_TLS_INSECURE === "true" && process.env.APP_ENV === "lab",
        source: "Environment",
        safety: "Lab only",
      },
    ],
    audit: {
      retainedEvents: state.auditEvents.length,
      retentionLimit,
      latestEventAt: state.auditEvents[0]?.createdAt,
      exportRecords: state.auditExports.length,
      redactionBoundary: "Credential values, Authorization headers, tokens, passwords, and endpoint query strings are redacted before display or export.",
    },
    configurable: state.platformSettings,
    validation: createPlatformSettingsValidation(state),
    roleMappings: createPlatformRoleMappings(state.platformSettings),
    lastSaved: latestSettingsSave(state),
  };
}

function createPlatformSettingsValidation(state: ApiState): PlatformSettingsSummary["validation"] {
  const settings = state.platformSettings;
  const ad = settings.activeDirectory;
  const iam = settings.iam;
  const labConfig = createAhvLabRuntimeConfig();
  const providerConfigured = state.integrationConfigs.filter((config) => config.endpoint && config.credentialProfile).length;

  return [
    {
      name: "Trusted identity boundary",
      section: "IAM",
      passed: iam.primaryMode === "Mock OIDC" || iam.requireTrustedIdentity,
      detail: iam.requireTrustedIdentity ? "Trusted identity is required." : "Hosted/on-prem deployments should require trusted identity headers.",
    },
    {
      name: "OIDC issuer",
      section: "IAM",
      passed: iam.primaryMode !== "OIDC" || Boolean(iam.oidcIssuerUrl),
      detail: iam.oidcIssuerUrl || "OIDC mode requires an issuer URL.",
    },
    {
      name: "Local user safety",
      section: "Local users",
      passed: !settings.localUsers.enabled || settings.localUsers.requireMfa,
      detail: settings.localUsers.requireMfa ? "MFA required for local users." : "Local users should require MFA.",
    },
    {
      name: "AD LDAPS",
      section: "Active Directory",
      passed: !ad.enabled || ad.ldapUrl.startsWith("ldaps://") || ad.tlsMode === "StartTLS",
      detail: ad.enabled ? ad.ldapUrl || "LDAP URL missing." : "AD connector disabled.",
    },
    {
      name: "AD bind reference",
      section: "Active Directory",
      passed: !ad.enabled || Boolean(ad.bindCredentialRef),
      detail: ad.bindCredentialRef || "AD bind credential reference is required.",
    },
    {
      name: "Provider readiness",
      section: "Providers",
      passed: providerConfigured > 0,
      detail: `${providerConfigured}/${state.integrationConfigs.length} providers have endpoint and credential references.`,
    },
    {
      name: "AHV lab lifecycle",
      section: "AHV lab",
      passed: !labConfig.switches.labLifecycle || labConfig.provisioningEnabled,
      detail: labConfig.provisioningEnabled ? "AHV lab lifecycle switches and UUID scope are complete." : "AHV lab lifecycle is disabled or missing required scope.",
    },
    {
      name: "Audit retention",
      section: "Audit",
      passed: Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500) >= 500,
      detail: `${process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500} retained events configured.`,
    },
  ];
}

function createPlatformRoleMappings(settings: PlatformSettingsConfig): PlatformSettingsSummary["roleMappings"] {
  return [
    { source: "OIDC claim", match: `${settings.iam.roleClaim}:Developer`, role: "Developer", status: "Active" },
    { source: "OIDC claim", match: `${settings.iam.roleClaim}:Approver`, role: "Approver", status: "Active" },
    { source: "OIDC claim", match: `${settings.iam.roleClaim}:Platform Admin`, role: "Platform Admin", status: "Active" },
    {
      source: "AD group",
      match: settings.activeDirectory.groupSearchBaseDn || "CN=NDC-Platform-Admins,OU=Groups",
      role: "Platform Admin",
      status: settings.activeDirectory.enabled ? "Active" : "Needs review",
    },
    ...settings.localUsers.users.map((user) => ({
      source: "Local user" as const,
      match: user.username,
      role: user.roles[0] ?? settings.iam.defaultRole,
      status: user.status === "Active" ? "Active" as const : "Needs review" as const,
    })),
  ];
}

function latestSettingsSave(state: ApiState): PlatformSettingsSummary["lastSaved"] {
  const event = state.auditEvents.find((item) => item.action === "admin.settings.updated");
  if (!event) {
    return undefined;
  }
  return {
    actor: event.actor,
    at: event.createdAt,
    sections: Array.isArray(event.metadata?.sections) ? event.metadata.sections.map(String) : [],
  };
}

function createPlatformSettingsConnectionTest(
  state: ApiState,
  target: PlatformSettingsConnectionTest["target"],
  actor: string
): PlatformSettingsConnectionTest {
  const settings = state.platformSettings;
  const checks = connectionChecks(state, target);
  return {
    id: `settings-test-${String(target).toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    target,
    status: checks.every((check) => check.passed) ? "Passed" : "Blocked",
    requestedBy: actor,
    checks,
    redactionBoundary: "Connectivity tests validate configuration shape and readiness only; no bind password, token, or API secret is returned.",
    createdAt: new Date().toISOString(),
  };

  function connectionChecks(currentState: ApiState, currentTarget: PlatformSettingsConnectionTest["target"]) {
    if (currentTarget === "OIDC") {
      return [
        check("Issuer configured", Boolean(settings.iam.oidcIssuerUrl), settings.iam.oidcIssuerUrl || "OIDC issuer missing."),
        check("Client ID configured", Boolean(settings.iam.oidcClientId), settings.iam.oidcClientId || "OIDC client ID missing."),
      ];
    }
    if (currentTarget === "Active Directory") {
      return [
        check("AD enabled", settings.activeDirectory.enabled, String(settings.activeDirectory.enabled)),
        check("LDAPS or StartTLS", settings.activeDirectory.ldapUrl.startsWith("ldaps://") || settings.activeDirectory.tlsMode === "StartTLS", settings.activeDirectory.tlsMode),
        check("Bind credential reference", Boolean(settings.activeDirectory.bindCredentialRef), settings.activeDirectory.bindCredentialRef || "missing"),
        check("Base DN configured", Boolean(settings.activeDirectory.baseDn), settings.activeDirectory.baseDn || "missing"),
      ];
    }
    if (currentTarget === "Prism Central") {
      const nci = currentState.integrationConfigs.find((config) => config.name === "NCI");
      return [
        check("NCI endpoint configured", Boolean(nci?.endpoint), nci?.endpoint ? "Configured." : "Missing."),
        check("NCI credential reference", Boolean(nci?.credentialProfile), nci?.credentialProfile || "missing"),
        check("Real call disabled", true, "No real Prism request is sent by this console test."),
      ];
    }
    if (currentTarget === "Audit export") {
      return [
        check("Retention configured", Number(process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500) >= 500, `${process.env.NDC_AUDIT_RETENTION_EVENTS ?? 500} events.`),
        check("Export destination", Boolean(process.env.NDC_AUDIT_EXPORT_DESTINATION_REF), process.env.NDC_AUDIT_EXPORT_DESTINATION_REF || "Optional destination reference missing."),
      ];
    }
    const provider = currentState.integrationConfigs.find((config) => config.name === currentTarget);
    return [
      check("Endpoint configured", Boolean(provider?.endpoint), provider?.endpoint ? "Configured." : "Missing."),
      check("Credential reference configured", Boolean(provider?.credentialProfile), provider?.credentialProfile || "missing"),
      check("Provider mutation disabled", true, "Provider test does not mutate infrastructure."),
    ];
  }
}

function check(name: string, passed: boolean, detail: string) {
  return { name, passed, detail };
}

function mergePlatformSettings(
  current: PlatformSettingsConfig,
  patch: UpdatePlatformSettingsRequest
): PlatformSettingsConfig {
  assertNoInlineSecrets(patch);
  const merged: PlatformSettingsConfig = {
    ...current,
    iam: {
      ...current.iam,
      ...patch.iam,
    },
    localUsers: {
      ...current.localUsers,
      ...patch.localUsers,
      users: patch.localUsers?.users ?? current.localUsers.users,
    },
    activeDirectory: {
      ...current.activeDirectory,
      ...patch.activeDirectory,
    },
  };

  return {
    ...merged,
    iam: {
      ...merged.iam,
      oidcIssuerUrl: safeUrlOrEmpty(merged.iam.oidcIssuerUrl),
      roleClaim: safeConfigText(merged.iam.roleClaim, "roles"),
      groupClaim: safeConfigText(merged.iam.groupClaim, "groups"),
    },
    localUsers: {
      ...merged.localUsers,
      sessionTimeoutMinutes: Math.min(Math.max(positiveNumber(String(merged.localUsers.sessionTimeoutMinutes), 60), 15), 1440),
      users: merged.localUsers.users.map((user) => ({
        username: safeConfigText(user.username, "user"),
        displayName: safeConfigText(user.displayName, user.username),
        roles: user.roles.filter((role) => role === "Developer" || role === "Approver" || role === "Platform Admin"),
        status: user.status === "Disabled" ? "Disabled" : "Active",
      })),
    },
    activeDirectory: {
      ...merged.activeDirectory,
      ldapUrl: safeLdapUrlOrEmpty(merged.activeDirectory.ldapUrl),
      domain: safeConfigText(merged.activeDirectory.domain, ""),
      baseDn: safeConfigText(merged.activeDirectory.baseDn, ""),
      bindCredentialRef: safeConfigText(merged.activeDirectory.bindCredentialRef, ""),
      userSearchFilter: safeConfigText(merged.activeDirectory.userSearchFilter, "(sAMAccountName={username})"),
      groupSearchBaseDn: safeConfigText(merged.activeDirectory.groupSearchBaseDn, ""),
      status: deriveActiveDirectoryStatus(merged.activeDirectory),
    },
  };
}

function assertNoInlineSecrets(value: unknown) {
  const disallowed = findSecretLikeKey(value);
  if (disallowed) {
    throw new RequestValidationError(
      "inline_secret_not_allowed",
      `Settings may store credential references only; inline secret field ${disallowed} is not accepted.`
    );
  }
}

function findSecretLikeKey(value: unknown, parentKey = ""): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (
      normalized !== "passwordpolicy" &&
      normalized !== "allowpasswordlogin" &&
      /(password|secret|token|authorization|privatekey|bindpassword)/i.test(key)
    ) {
      return parentKey ? `${parentKey}.${key}` : key;
    }
    const nested = findSecretLikeKey(child, parentKey ? `${parentKey}.${key}` : key);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

function safeConfigText(value: string | undefined, fallback: string) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.replace(/[<>]/g, "").slice(0, 240);
}

function safeUrlOrEmpty(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return "";
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function safeLdapUrlOrEmpty(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return "";
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "ldaps:" || parsed.protocol === "ldap:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function deriveActiveDirectoryStatus(config: PlatformSettingsConfig["activeDirectory"]) {
  if (!config.enabled) {
    return "Not configured";
  }
  if (config.domain && config.ldapUrl && config.baseDn && config.bindCredentialRef) {
    return "Ready for test";
  }
  if (config.domain || config.ldapUrl || config.baseDn || config.bindCredentialRef) {
    return "Configured";
  }
  return "Not configured";
}

function redactAuditEvent(event: ApiState["auditEvents"][number]): ApiState["auditEvents"][number] {
  return {
    ...event,
    metadata: event.metadata ? (redactSensitive(event.metadata) as Record<string, unknown>) : undefined,
  };
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
