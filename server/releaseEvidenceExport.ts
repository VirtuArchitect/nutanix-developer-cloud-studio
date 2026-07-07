import { createHash } from "node:crypto";
import type { ProviderReleaseGateRecord, ReleaseEvidenceExportRecord } from "../src/data/cloudStudioDomain";
import type { ApiState, CreateReleaseEvidenceExportRequest } from "./types";

export class ReleaseEvidenceExportError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createReleaseEvidenceExportRecord(
  state: ApiState,
  request: CreateReleaseEvidenceExportRequest,
  actor: string
): ReleaseEvidenceExportRecord {
  const gate = findReleaseGate(state, request);
  const createdAt = new Date().toISOString();
  const evidenceReferences = gate.evidence.map(redactEvidenceReference);
  const invalidReferences = evidenceReferences.filter((reference) => !isSafeEvidenceReference(reference));
  if (invalidReferences.length > 0) {
    throw new ReleaseEvidenceExportError(
      "release_evidence_reference_invalid",
      "Release evidence references must not contain embedded auth material."
    );
  }

  const manifest: ReleaseEvidenceExportRecord["manifest"] = {
    exportId: `release-evidence-export-${gate.provider.toLowerCase()}-${Date.now()}`,
    gateId: gate.id,
    provider: gate.provider,
    gateStatus: gate.status,
    generatedAt: createdAt,
    releaseApprover: gate.releaseApprover,
    checkCount: gate.checks.length,
    passedChecks: gate.checks.filter((check) => check.passed).length,
    blockedOperations: gate.blockedOperations,
    killSwitch: gate.killSwitch,
    evidenceReferences,
  };
  const checksum = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");

  return {
    id: manifest.exportId,
    provider: gate.provider,
    gateId: gate.id,
    status: "Prepared",
    requestedBy: actor,
    format: "JSON",
    checksumAlgorithm: "sha256",
    checksum,
    manifest,
    redactionBoundary: "Release evidence exports contain references and metadata only; no inline auth material.",
    storageBoundary: "Export record is metadata only; configure external evidence storage before production release reviews.",
    provisioningEnabled: false,
    createdAt,
  };
}

function findReleaseGate(state: ApiState, request: CreateReleaseEvidenceExportRequest): ProviderReleaseGateRecord {
  const gate =
    (request.gateId ? state.providerReleaseGateRecords.find((item) => item.id === request.gateId) : undefined) ??
    (request.provider
      ? state.providerReleaseGateRecords.find((item) => item.provider === request.provider)
      : state.providerReleaseGateRecords[0]);

  if (!gate) {
    throw new ReleaseEvidenceExportError("provider_release_gate_required", "A provider release gate is required.");
  }

  return gate;
}

function redactEvidenceReference(reference: string) {
  return reference
    .replace(/:\/\/[^/\s]*@/g, "://redacted@")
    .replace(/([?&](?:key|sig|cred)=)[^&\s]+/gi, "$1redacted");
}

function isSafeEvidenceReference(reference: string) {
  return !/:\/\/(?!redacted@)[^/\s]*@/.test(reference) && !/[?&](key|sig|cred)=((?!redacted)[^&\s]+)/i.test(reference);
}
