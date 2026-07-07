import { describe, expect, it } from "vitest";
import type { ProductionExecutionFinalArchiveCertificationRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionCompletionDossierRecord,
  ProductionExecutionCompletionDossierRecordError,
} from "./productionExecutionCompletionDossierRecord";
import { createDefaultState } from "./storage";

describe("production execution completion dossier record", () => {
  it("requires a production execution final archive certification record", () => {
    const state = createDefaultState();

    expect(() => createProductionExecutionCompletionDossierRecord(state, {}, "platform.admin")).toThrow(
      ProductionExecutionCompletionDossierRecordError
    );
  });

  it("blocks completion dossier readiness when final archive certification or dossier evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionFinalArchiveCertificationRecords = [sampleFinalArchiveCertificationRecord("Blocked")];

    const record = createProductionExecutionCompletionDossierRecord(
      state,
      {
        finalArchiveCertificationRecordId:
          "production-execution-final-archive-certification-record-ndb-1",
        dossierOwner: "",
        finalEvidenceIndexReference: "",
        auditExportReference: "",
        operationsAcceptanceReference: "",
        complianceClosureProofReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      finalArchiveCertificationRecordId:
        "production-execution-final-archive-certification-record-ndb-1",
      retentionAttestationRecordId: "production-execution-retention-attestation-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Final archive certification ready", passed: false }),
        expect.objectContaining({ name: "Dossier owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks completion dossier ready when final archive certification and evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionFinalArchiveCertificationRecords = [
      sampleFinalArchiveCertificationRecord("Ready for production execution final archive certification review"),
    ];

    const record = createProductionExecutionCompletionDossierRecord(
      state,
      {
        finalArchiveCertificationRecordId:
          "production-execution-final-archive-certification-record-ndb-1",
      },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution completion dossier review");
    expect(record.dossierOwner).toBe("Production Completion Dossier Owner");
    expect(record.finalEvidenceIndexReference).toBe("production-final-evidence-index-ndb.md");
    expect(record.auditExportReference).toBe("production-completion-audit-export-ndb.jsonl");
    expect(record.operationsAcceptanceReference).toBe("production-operations-acceptance-ndb.md");
    expect(record.complianceClosureProofReference).toBe("production-compliance-closure-proof-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleFinalArchiveCertificationRecord(
  status: "Blocked" | "Ready for production execution final archive certification review"
): ProductionExecutionFinalArchiveCertificationRecord {
  return {
    id: "production-execution-final-archive-certification-record-ndb-1",
    provider: "NDB",
    retentionAttestationRecordId: "production-execution-retention-attestation-record-ndb-1",
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
    certificationOwner: "Production Archive Certifier",
    finalArchiveManifestReference: "production-final-archive-manifest-ndb.md",
    retentionLockProofReference: "production-retention-lock-proof-ndb.md",
    complianceSignOffReference: "production-compliance-signoff-ndb.md",
    retrievalWitnessProofReference: "production-retrieval-witness-proof-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
