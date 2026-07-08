import type {
  EmergencyStopRollbackDrillRecord,
  LiveReadOnlyCallEnvelopeRecord,
  PilotEvidenceReviewRecord,
  PrismReadOnlyOperation,
  ReadOnlyPilotSessionRecord,
  ReadOnlyRuntimeEnablementPolicyRecord,
} from "../src/data/cloudStudioDomain";
import type {
  ApiState,
  CreateEmergencyStopRollbackDrillRequest,
  CreateLiveReadOnlyCallEnvelopeRequest,
  CreatePilotEvidenceReviewRequest,
  CreateReadOnlyPilotSessionRequest,
  CreateReadOnlyRuntimeEnablementPolicyRequest,
} from "./types";

export class ProductionReadOnlyPilotControlsError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createReadOnlyRuntimeEnablementPolicyRecord(
  state: ApiState,
  request: CreateReadOnlyRuntimeEnablementPolicyRequest,
  actor: string
): ReadOnlyRuntimeEnablementPolicyRecord {
  const pilotGate = findLatestOrById(state.authorizedReadOnlyLabPilotGateRecords, request.pilotGateId);
  if (!pilotGate) {
    throw new ProductionReadOnlyPilotControlsError("pilot_gate_required", "An authorized read-only pilot gate is required.");
  }

  const requiredApprovals = request.requiredApprovals?.length
    ? request.requiredApprovals
    : ["platform-owner", "security-reviewer", "operations-owner"];
  const allowedEnvironments = request.allowedEnvironments?.length ? request.allowedEnvironments : ["readonly-lab"];
  const expiresAt = request.expiresAt ?? futureIso(7);
  const emergencyStop = {
    owner: request.emergencyStopOwner ?? "Cloud Operations",
    contact: request.emergencyStopContact ?? "cloud-operations-oncall",
    procedureRef: request.emergencyStopProcedureRef ?? "docs/rollback-pack.md",
    tested: request.emergencyStopTested ?? true,
  };
  const checks = [
    check("Pilot gate ready", pilotGate.status === "Ready for future live read-only pilot", pilotGate.status),
    check("Required approvals named", bounded(requiredApprovals), requiredApprovals.join(", ")),
    check("Allowed environments bounded", bounded(allowedEnvironments), allowedEnvironments.join(", ")),
    check("Policy expiry is future dated", new Date(expiresAt).getTime() > Date.now(), expiresAt),
    check("Rollback mode simulated", true, "The only rollback target is the simulated adapter mode."),
    check("Emergency stop owner named", safeRef(emergencyStop.owner), emergencyStop.owner),
    check("Emergency stop contact named", safeRef(emergencyStop.contact), emergencyStop.contact),
    check("Emergency stop procedure referenced", safeRef(emergencyStop.procedureRef), emergencyStop.procedureRef),
    check("Emergency stop tested", emergencyStop.tested, String(emergencyStop.tested)),
    check("Runtime flag remains disabled", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "Future flag is documented but not enabled by this record."),
  ];

  return {
    id: `readonly-runtime-policy-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Policy ready for pilot session" : "Blocked",
    pilotGateId: pilotGate.id,
    runtimeFlag: "NDC_PRISM_READONLY_HTTP_ENABLED",
    requiredApprovals,
    allowedEnvironments,
    expiresAt,
    rollbackMode: "simulated",
    emergencyStop,
    checks,
    evidence: [
      "Runtime enablement policy documents the future read-only HTTP flag without enabling it.",
      "Emergency stop and rollback remain bound to simulated mode.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createReadOnlyPilotSessionRecord(
  state: ApiState,
  request: CreateReadOnlyPilotSessionRequest,
  actor: string
): ReadOnlyPilotSessionRecord {
  const policy = findLatestOrById(state.readOnlyRuntimeEnablementPolicies, request.policyId);
  const gate = findLatestOrById(state.authorizedReadOnlyLabPilotGateRecords, request.approvedGateId ?? policy?.pilotGateId);
  if (!policy || !gate) {
    throw new ProductionReadOnlyPilotControlsError("session_inputs_required", "A runtime policy and approved pilot gate are required.");
  }

  const startedAt = request.startedAt ?? new Date().toISOString();
  const endsAt = request.endsAt ?? futureIso(1);
  const evidenceLinks = request.evidenceLinks?.length
    ? request.evidenceLinks
    : ["pilot-session-approval.md", "operator-roster.md", "readonly-lab-window.md"];
  const runtimeMode = request.runtimeMode ?? "authorized-read-only-lab";
  const operator = request.operator ?? "Cloud Operations Pilot Operator";
  const checks = [
    check("Runtime policy ready", policy.status === "Policy ready for pilot session", policy.status),
    check("Approved gate ready", gate.status === "Ready for future live read-only pilot", gate.status),
    check("Policy links to approved gate", policy.pilotGateId === gate.id, `${policy.pilotGateId} -> ${gate.id}`),
    check("Operator named", safeActor(operator), operator),
    check("Session window starts before it ends", new Date(startedAt).getTime() < new Date(endsAt).getTime(), `${startedAt} to ${endsAt}`),
    check("Session ends before policy expires", new Date(endsAt).getTime() <= new Date(policy.expiresAt).getTime(), `${endsAt} <= ${policy.expiresAt}`),
    check("Runtime mode is read-only lab", runtimeMode === "authorized-read-only-lab", runtimeMode),
    check("Evidence links present", bounded(evidenceLinks), evidenceLinks.join(", ")),
    check("No live runtime flag", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "Session records do not enable HTTP."),
  ];

  return {
    id: `readonly-pilot-session-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Session window ready" : "Blocked",
    operator,
    startedAt,
    endsAt,
    approvedGateId: gate.id,
    policyId: policy.id,
    runtimeMode,
    evidenceLinks,
    checks,
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createLiveReadOnlyCallEnvelopeRecord(
  state: ApiState,
  request: CreateLiveReadOnlyCallEnvelopeRequest,
  actor: string
): LiveReadOnlyCallEnvelopeRecord {
  const session = findLatestOrById(state.readOnlyPilotSessions, request.pilotSessionId);
  const client = findLatestOrById(state.disabledPrismReadOnlyHttpClientRecords, request.httpClientRecordId);
  if (!session || !client) {
    throw new ProductionReadOnlyPilotControlsError("call_envelope_inputs_required", "A pilot session and disabled HTTP client record are required.");
  }

  const operationEnvelopes = client.requestShape.map((item) => ({
    operation: item.operation,
    method: item.method,
    path: item.path,
    timeoutSeconds: item.timeoutSeconds,
    retryAttempts: item.retryAttempts,
    requestId: `readonly-${item.operation}-${Date.now()}`,
    redactedFields: ["endpoint", "credential", "authorizationHeader", "token"],
    expectedResponseShape: expectedShape(item.operation),
    executionEnabled: false as const,
  }));
  const checks = [
    check("Pilot session ready", session.status === "Session window ready", session.status),
    check("Disabled HTTP client ready", client.status === "Client shape ready; execution disabled", client.status),
    check("Every read-only operation enveloped", operationEnvelopes.length === 6, `${operationEnvelopes.length} operation(s).`),
    check("Every envelope remains non-executing", operationEnvelopes.every((item) => item.executionEnabled === false), "executionEnabled=false"),
    check("Redaction boundary present", operationEnvelopes.every((item) => item.redactedFields.length >= 4), "endpoint, credential, auth header, token"),
    check("No HTTP runtime flag", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "Envelope is non-executing."),
  ];

  return {
    id: `live-readonly-call-envelope-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Envelope ready; execution disabled" : "Blocked",
    pilotSessionId: session.id,
    httpClientRecordId: client.id,
    operationEnvelopes,
    checks,
    evidence: [
      "Each Prism read-only list operation has a request envelope and expected response shape.",
      "No envelope can execute HTTP in this release.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createPilotEvidenceReviewRecord(
  state: ApiState,
  request: CreatePilotEvidenceReviewRequest,
  actor: string
): PilotEvidenceReviewRecord {
  const envelope = findLatestOrById(state.liveReadOnlyCallEnvelopes, request.callEnvelopeId);
  const session = findLatestOrById(state.readOnlyPilotSessions, request.pilotSessionId ?? envelope?.pilotSessionId);
  if (!envelope || !session) {
    throw new ProductionReadOnlyPilotControlsError("evidence_review_inputs_required", "A call envelope and pilot session are required.");
  }

  const decision = request.decision ?? "Approve";
  const reviewer = request.reviewer ?? "Security Reviewer";
  const findings = request.findings?.length
    ? request.findings
    : ["No execution occurred.", "All call envelopes remain redacted.", "Runtime flag remains disabled."];
  const checks = [
    check("Call envelope ready", envelope.status === "Envelope ready; execution disabled", envelope.status),
    check("Pilot session ready", session.status === "Session window ready", session.status),
    check("Envelope belongs to session", envelope.pilotSessionId === session.id, `${envelope.pilotSessionId} -> ${session.id}`),
    check("Reviewer named", safeActor(reviewer), reviewer),
    check("Findings recorded", findings.length > 0 && findings.every(safeFinding), `${findings.length} finding(s).`),
    check("Execution stayed disabled", envelope.operationEnvelopes.every((item) => item.executionEnabled === false), "No operation can execute."),
  ];
  const ready = checks.every((item) => item.passed);

  return {
    id: `pilot-evidence-review-${Date.now()}`,
    requestedBy: actor,
    status: ready ? (decision === "Approve" ? "Approved for rollback drill" : "Rejected") : "Blocked",
    callEnvelopeId: envelope.id,
    pilotSessionId: session.id,
    reviewer,
    decision,
    findings,
    checks,
    evidence: [
      "Reviewer workflow captured findings before any future live HTTP enablement.",
      "Review remains evidence-only and cannot enable a Prism Central connection.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function createEmergencyStopRollbackDrillRecord(
  state: ApiState,
  request: CreateEmergencyStopRollbackDrillRequest,
  actor: string
): EmergencyStopRollbackDrillRecord {
  const review = findLatestOrById(state.pilotEvidenceReviewRecords, request.pilotEvidenceReviewId);
  const policy = findLatestOrById(state.readOnlyRuntimeEnablementPolicies, request.policyId);
  if (!review || !policy) {
    throw new ProductionReadOnlyPilotControlsError("rollback_drill_inputs_required", "An approved evidence review and runtime policy are required.");
  }

  const simulatedModeRestored = request.simulatedModeRestored ?? true;
  const evidencePreserved = request.evidencePreserved ?? true;
  const emergencyStopOwner = request.emergencyStopOwner ?? policy.emergencyStop.owner;
  const steps = [
    step("Emergency stop owner acknowledged", safeActor(emergencyStopOwner), `Owner: ${emergencyStopOwner}`),
    step("Runtime flag confirmed disabled", process.env.NDC_PRISM_READONLY_HTTP_ENABLED !== "true", "NDC_PRISM_READONLY_HTTP_ENABLED is not active."),
    step("Simulated mode restored", simulatedModeRestored, "Adapter returns to simulated mode."),
    step("Evidence preserved", evidencePreserved, "Policy, session, envelope, review, and drill records retained."),
  ];
  const checks = [
    check("Evidence review approved", review.status === "Approved for rollback drill", review.status),
    check("Runtime policy ready", policy.status === "Policy ready for pilot session", policy.status),
    check("Emergency stop owner named", safeActor(emergencyStopOwner), emergencyStopOwner),
    check("Simulated mode restored", simulatedModeRestored, String(simulatedModeRestored)),
    check("Evidence preserved", evidencePreserved, String(evidencePreserved)),
    check("All drill steps complete", steps.every((item) => item.status === "Complete"), `${steps.length} step(s).`),
  ];

  return {
    id: `emergency-stop-rollback-drill-${Date.now()}`,
    requestedBy: actor,
    status: checks.every((item) => item.passed) ? "Drill passed" : "Blocked",
    pilotEvidenceReviewId: review.id,
    policyId: policy.id,
    simulatedModeRestored,
    evidencePreserved,
    emergencyStopOwner,
    rollbackMode: "simulated",
    steps,
    checks,
    evidence: [
      "Emergency stop drill proves the adapter can return to simulated mode.",
      "Rollback drill preserves evidence and does not enable HTTP, provisioning, or real Prism calls.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
    realPrismCallsEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function expectedShape(operation: PrismReadOnlyOperation) {
  const shapeByOperation: Record<PrismReadOnlyOperation, string> = {
    listClusters: "Prism v3 cluster list response with entities and metadata.",
    listProjects: "Prism v3 project list response with entities and metadata.",
    listImages: "Prism v3 image list response with entities and metadata.",
    listSubnets: "Prism v3 subnet list response with entities and metadata.",
    listCategories: "Prism v3 category list response with entities and metadata.",
    listVms: "Prism v3 VM list response with entities and metadata.",
  };
  return shapeByOperation[operation];
}

function check(name: string, passed: boolean | undefined, detail: string) {
  return { name, passed: Boolean(passed), detail };
}

function step(name: string, passed: boolean, evidence: string) {
  return { name, status: passed ? ("Complete" as const) : ("Blocked" as const), evidence };
}

function futureIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function findLatestOrById<T extends { id: string }>(records: T[], id?: string) {
  return id ? records.find((record) => record.id === id) : records[0];
}

function bounded(values: string[] | undefined) {
  return Boolean(values?.length && values.length <= 20 && values.every(safeRef));
}

function safeActor(value: string) {
  return Boolean(value && value.length <= 120 && !/[\\\r\n\t]|:\/\/|Bearer|token|password|secret|apikey|api_key|\$/i.test(value));
}

function safeRef(value: string | undefined) {
  return Boolean(value && value.length <= 160 && !/[\\\r\n\t]|:\/\/|Bearer|token|password|secret|apikey|api_key|=|\$/i.test(value));
}

function safeFinding(value: string) {
  return Boolean(value && value.length <= 240 && !/Bearer|token|password|secret|apikey|api_key/i.test(value));
}
