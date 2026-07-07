import { describe, expect, it } from "vitest";
import type { ProductionExecutionArchivalHandoffRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionRetentionAttestationRecord,
  ProductionExecutionRetentionAttestationRecordError,
} from "./productionExecutionRetentionAttestationRecord";
import { createDefaultState } from "./storage";

describe("production execution retention attestation record", () => {
  it("requires a production execution archival handoff record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionRetentionAttestationRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionRetentionAttestationRecordError
    );
  });

  it("blocks retention attestation readiness when archival handoff or retention evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionArchivalHandoffRecords = [sampleArchivalHandoffRecord("Blocked")];

    const record = createProductionExecutionRetentionAttestationRecord(
      state,
      {
        archivalHandoffRecordId: "production-execution-archival-handoff-record-ndb-1",
        retentionOwner: "",
        retentionScheduleProofReference: "",
        legalHoldCheckReference: "",
        deletionExceptionRegisterReference: "",
        retrievalSlaProofReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      archivalHandoffRecordId: "production-execution-archival-handoff-record-ndb-1",
      closurePacketRecordId: "production-execution-closure-packet-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archival handoff ready", passed: false }),
        expect.objectContaining({ name: "Retention owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks retention attestation ready when archival handoff and retention evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionArchivalHandoffRecords = [
      sampleArchivalHandoffRecord("Ready for production execution archival handoff review"),
    ];

    const record = createProductionExecutionRetentionAttestationRecord(
      state,
      { archivalHandoffRecordId: "production-execution-archival-handoff-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution retention attestation review");
    expect(record.retentionOwner).toBe("Production Retention Owner");
    expect(record.retentionScheduleProofReference).toBe("production-retention-schedule-ndb.md");
    expect(record.legalHoldCheckReference).toBe("production-legal-hold-check-ndb.md");
    expect(record.deletionExceptionRegisterReference).toBe(
      "production-deletion-exception-register-ndb.md"
    );
    expect(record.retrievalSlaProofReference).toBe("production-retrieval-sla-proof-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleArchivalHandoffRecord(
  status: "Blocked" | "Ready for production execution archival handoff review"
): ProductionExecutionArchivalHandoffRecord {
  return {
    id: "production-execution-archival-handoff-record-ndb-1",
    provider: "NDB",
    closurePacketRecordId: "production-execution-closure-packet-record-ndb-1",
    closureAuthorizationRecordId: "production-execution-closure-authorization-record-ndb-1",
    outcomeAuthorizationRecordId: "production-execution-outcome-authorization-record-ndb-1",
    executionHoldPointRecordId: "production-execution-hold-point-record-ndb-1",
    finalExecutionPacketRecordId: "production-final-execution-packet-record-ndb-1",
    changeTicketLockRecordId: "production-change-ticket-lock-record-ndb-1",
    executionAuthorizationRecordId: "production-execution-authorization-record-ndb-1",
    executionReadinessRecordId: "production-execution-readiness-record-ndb-1",
    operatorAssignmentRecordId: "production-operator-assignment-record-ndb-1",
    implementationHoldRecordId: "production-implementation-hold-record-ndb-1",
    cabDecisionRecordId: "production-cab-decision-record-ndb-1",
    cabHandoffPacketId: "production-cab-handoff-packet-ndb-1",
    freezeRecordId: "production-change-freeze-record-ndb-1",
    authorizationPacketId: "production-adapter-authorization-packet-ndb-1",
    promotionDossierId: "adapter-promotion-readiness-dossier-ndb-1",
    closurePackageId: "switch-closure-retention-package-ndb-1",
    outcomeRecordId: "switch-execution-outcome-record-ndb-1",
    handoffPackageId: "switch-execution-handoff-package-ndb-1",
    controlledSwitchRequestId: "controlled-switch-configuration-request-ndb-1",
    auditPackageId: "real-adapter-switch-state-audit-ndb-1",
    switchReviewId: "manual-real-adapter-switch-review-ndb-1",
    activationId: "real-adapter-lab-scope-activation-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    status,
    requestedBy: "platform.admin",
    archiveOwner: "Production Archive Owner",
    retentionPolicyReference: "production-retention-policy-ndb.md",
    immutableStorageProofReference: "production-immutable-storage-proof-ndb.md",
    auditIndexReference: "production-audit-index-ndb.json",
    retrievalTestReference: "production-retrieval-test-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
