import { describe, expect, it } from "vitest";
import type { ProductionExecutionRetentionAttestationRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionFinalArchiveCertificationRecord,
  ProductionExecutionFinalArchiveCertificationRecordError,
} from "./productionExecutionFinalArchiveCertificationRecord";
import { createDefaultState } from "./storage";

describe("production execution final archive certification record", () => {
  it("requires a production execution retention attestation record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionFinalArchiveCertificationRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionFinalArchiveCertificationRecordError
    );
  });

  it("blocks final archive certification when retention attestation or certification evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionRetentionAttestationRecords = [sampleRetentionAttestationRecord("Blocked")];

    const record = createProductionExecutionFinalArchiveCertificationRecord(
      state,
      {
        retentionAttestationRecordId: "production-execution-retention-attestation-record-ndb-1",
        certificationOwner: "",
        finalArchiveManifestReference: "",
        retentionLockProofReference: "",
        complianceSignOffReference: "",
        retrievalWitnessProofReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      retentionAttestationRecordId: "production-execution-retention-attestation-record-ndb-1",
      archivalHandoffRecordId: "production-execution-archival-handoff-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Retention attestation ready", passed: false }),
        expect.objectContaining({ name: "Certification owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks final archive certification ready when retention attestation and evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionRetentionAttestationRecords = [
      sampleRetentionAttestationRecord("Ready for production execution retention attestation review"),
    ];

    const record = createProductionExecutionFinalArchiveCertificationRecord(
      state,
      { retentionAttestationRecordId: "production-execution-retention-attestation-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution final archive certification review");
    expect(record.certificationOwner).toBe("Production Archive Certifier");
    expect(record.finalArchiveManifestReference).toBe("production-final-archive-manifest-ndb.md");
    expect(record.retentionLockProofReference).toBe("production-retention-lock-proof-ndb.md");
    expect(record.complianceSignOffReference).toBe("production-compliance-signoff-ndb.md");
    expect(record.retrievalWitnessProofReference).toBe("production-retrieval-witness-proof-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleRetentionAttestationRecord(
  status: "Blocked" | "Ready for production execution retention attestation review"
): ProductionExecutionRetentionAttestationRecord {
  return {
    id: "production-execution-retention-attestation-record-ndb-1",
    provider: "NDB",
    archivalHandoffRecordId: "production-execution-archival-handoff-record-ndb-1",
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
    retentionOwner: "Production Retention Owner",
    retentionScheduleProofReference: "production-retention-schedule-ndb.md",
    legalHoldCheckReference: "production-legal-hold-check-ndb.md",
    deletionExceptionRegisterReference: "production-deletion-exception-register-ndb.md",
    retrievalSlaProofReference: "production-retrieval-sla-proof-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
