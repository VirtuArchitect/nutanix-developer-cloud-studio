import { createHash } from "node:crypto";
import type { LabExecutionProposalEnvelope, LabExecutionProposalExportRecord } from "../src/data/cloudStudioDomain";
import type { ApiState, CreateLabExecutionProposalExportRequest } from "./types";

export class LabExecutionProposalExportError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createLabExecutionProposalExportRecord(
  state: ApiState,
  request: CreateLabExecutionProposalExportRequest,
  actor: string
): LabExecutionProposalExportRecord {
  const envelope = findEnvelope(state, request);
  const createdAt = new Date().toISOString();
  const evidenceReferences = envelope.evidence.map(redactEvidenceReference);
  const emergencyStopContacts = envelope.emergencyStopContacts.map(redactEvidenceReference);
  const unsafeValues = [...evidenceReferences, ...emergencyStopContacts].filter((value) => !isSafeReference(value));

  if (unsafeValues.length > 0) {
    throw new LabExecutionProposalExportError(
      "lab_execution_proposal_export_reference_invalid",
      "Proposal export references must not contain embedded auth material."
    );
  }

  const manifest: LabExecutionProposalExportRecord["manifest"] = {
    exportId: `lab-execution-proposal-export-${envelope.provider.toLowerCase()}-${Date.now()}`,
    envelopeId: envelope.id,
    provider: envelope.provider,
    envelopeStatus: envelope.status,
    generatedAt: createdAt,
    reviewId: envelope.reviewId,
    windowId: envelope.windowId,
    windowEvidenceExportId: envelope.exportId,
    checkCount: envelope.checks.length,
    passedChecks: envelope.checks.filter((check) => check.passed).length,
    evidenceReferences,
    rollbackOwner: redactEvidenceReference(envelope.rollbackOwner),
    emergencyStopContacts,
    killSwitch: envelope.killSwitch,
    provisioningEnabled: false,
  };
  const checksum = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");

  return {
    id: manifest.exportId,
    provider: envelope.provider,
    envelopeId: envelope.id,
    status: "Prepared",
    requestedBy: actor,
    format: "JSON",
    checksumAlgorithm: "sha256",
    checksum,
    manifest,
    redactionBoundary: "Proposal exports contain references and metadata only; no inline auth material is persisted.",
    storageBoundary: "Export record is metadata only; configure external evidence storage before controlled lab execution proposals.",
    provisioningEnabled: false,
    createdAt,
  };
}

function findEnvelope(state: ApiState, request: CreateLabExecutionProposalExportRequest): LabExecutionProposalEnvelope {
  const envelope =
    (request.envelopeId ? state.labExecutionProposalEnvelopes.find((item) => item.id === request.envelopeId) : undefined) ??
    (request.provider
      ? state.labExecutionProposalEnvelopes.find((item) => item.provider === request.provider)
      : state.labExecutionProposalEnvelopes[0]);

  if (!envelope) {
    throw new LabExecutionProposalExportError(
      "lab_execution_proposal_envelope_required",
      "A lab execution proposal envelope is required."
    );
  }

  return envelope;
}

function redactEvidenceReference(reference: string) {
  return reference
    .replace(/:\/\/[^/\s]*@/g, "://redacted@")
    .replace(/([?&](?:key|sig|cred)=)[^&\s]+/gi, "$1redacted");
}

function isSafeReference(reference: string) {
  return !/:\/\/(?!redacted@)[^/\s]*@/.test(reference) && !/[?&](key|sig|cred)=((?!redacted)[^&\s]+)/i.test(reference);
}
