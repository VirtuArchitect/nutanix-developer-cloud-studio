import { createHash } from "node:crypto";
import type { ControlledLabDryRunWindowRecord, LabWindowEvidenceExportRecord } from "../src/data/cloudStudioDomain";
import type { ApiState, CreateLabWindowEvidenceExportRequest } from "./types";

export class LabWindowEvidenceExportError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createLabWindowEvidenceExportRecord(
  state: ApiState,
  request: CreateLabWindowEvidenceExportRequest,
  actor: string
): LabWindowEvidenceExportRecord {
  const window = findWindow(state, request);
  const createdAt = new Date().toISOString();
  const manifest: LabWindowEvidenceExportRecord["manifest"] = {
    exportId: `lab-window-evidence-export-${window.provider.toLowerCase()}-${Date.now()}`,
    windowId: window.id,
    provider: window.provider,
    windowStatus: window.status,
    generatedAt: createdAt,
    scheduledStart: window.scheduledStart,
    scheduledEnd: window.scheduledEnd,
    linkedRunbookId: window.linkedRunbookId,
    linkedReleaseEvidenceExportId: window.linkedReleaseEvidenceExportId,
    linkedLabScopeId: window.linkedLabScopeId,
    rollbackOwner: window.rollbackOwner,
    emergencyStopContacts: window.emergencyStopContacts.map(redactContact),
    checkCount: window.checks.length,
    passedChecks: window.checks.filter((check) => check.passed).length,
    readinessChecklist: window.readinessChecklist,
    provisioningEnabled: false,
  };
  const checksum = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");

  return {
    id: manifest.exportId,
    provider: window.provider,
    windowId: window.id,
    status: "Prepared",
    requestedBy: actor,
    format: "JSON",
    checksumAlgorithm: "sha256",
    checksum,
    manifest,
    redactionBoundary: "Lab window evidence exports contain references and metadata only; sensitive material is not persisted.",
    storageBoundary: "Export record is metadata only; configure external evidence storage before controlled lab operations.",
    provisioningEnabled: false,
    createdAt,
  };
}

function findWindow(state: ApiState, request: CreateLabWindowEvidenceExportRequest): ControlledLabDryRunWindowRecord {
  const window =
    (request.windowId ? state.controlledLabDryRunWindows.find((item) => item.id === request.windowId) : undefined) ??
    (request.provider
      ? state.controlledLabDryRunWindows.find((item) => item.provider === request.provider)
      : state.controlledLabDryRunWindows[0]);

  if (!window) {
    throw new LabWindowEvidenceExportError(
      "controlled_lab_dry_run_window_required",
      "A controlled lab dry-run window is required."
    );
  }

  return window;
}

function redactContact(contact: string) {
  return contact.replace(/:\/\/[^/\s]*@/g, "://redacted@").replace(/([?&](?:key|sig|cred)=)[^&\s]+/gi, "$1redacted");
}
