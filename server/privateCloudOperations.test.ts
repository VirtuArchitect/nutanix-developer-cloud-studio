import { afterEach, describe, expect, it } from "vitest";
import { createDefaultState } from "./storage";
import {
  createAuditExportRecord,
  createAuditRetentionDiagnostics,
  validateAuditExportDestination,
} from "./privateCloudOperations";

describe("audit export hardening", () => {
  afterEach(() => {
    delete process.env.NDC_AUDIT_EXPORT_DESTINATION_REF;
    delete process.env.NDC_AUDIT_RETENTION_EVENTS;
  });

  it("creates audit export manifests with checksum and retention window", () => {
    process.env.NDC_AUDIT_RETENTION_EVENTS = "2";
    process.env.NDC_AUDIT_EXPORT_DESTINATION_REF = "object://audit-exports/ndc-studio";
    const state = createDefaultState();
    state.auditEvents = [
      { id: "audit-3", action: "three", actor: "ops", target: "env", createdAt: "2026-07-06T03:00:00.000Z" },
      { id: "audit-2", action: "two", actor: "ops", target: "env", createdAt: "2026-07-06T02:00:00.000Z" },
      { id: "audit-1", action: "one", actor: "ops", target: "env", createdAt: "2026-07-06T01:00:00.000Z" },
    ];

    const auditExport = createAuditExportRecord(state, "platform.admin");

    expect(auditExport).toMatchObject({
      eventCount: 2,
      retentionEvents: 2,
      checksumAlgorithm: "sha256",
      manifest: expect.objectContaining({
        eventCount: 2,
        retentionWindowEvents: 2,
        firstEventAt: "2026-07-06T02:00:00.000Z",
        lastEventAt: "2026-07-06T03:00:00.000Z",
        destinationRef: "object://audit-exports/ndc-studio",
      }),
    });
    expect(auditExport.checksum).toMatch(/^[a-f0-9]{64}$/);
  });

  it("validates destination references without storing access material", () => {
    expect(validateAuditExportDestination("object://audit-exports/ndc-studio")).toMatchObject({
      configured: true,
      valid: true,
    });
    expect(validateAuditExportDestination("object://user@example.invalid/audit")).toMatchObject({
      configured: true,
      valid: false,
      destinationRef: "invalid-auth-material",
    });
  });

  it("reports retention diagnostics", () => {
    process.env.NDC_AUDIT_RETENTION_EVENTS = "2";
    const state = createDefaultState();
    state.auditEvents = [
      { id: "audit-2", action: "two", actor: "ops", target: "env", createdAt: "2026-07-06T02:00:00.000Z" },
      { id: "audit-1", action: "one", actor: "ops", target: "env", createdAt: "2026-07-06T01:00:00.000Z" },
    ];

    expect(createAuditRetentionDiagnostics(state)).toMatchObject({
      retentionEvents: 2,
      currentEvents: 2,
      bounded: true,
      oldestEventAt: "2026-07-06T01:00:00.000Z",
      newestEventAt: "2026-07-06T02:00:00.000Z",
    });
  });
});
