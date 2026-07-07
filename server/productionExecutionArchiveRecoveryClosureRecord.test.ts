import { describe, expect, it } from "vitest";
import type { ProductionExecutionArchiveRecoveryAcceptanceRecord } from "../src/data/cloudStudioDomain";
import {
  createProductionExecutionArchiveRecoveryClosureRecord,
  ProductionExecutionArchiveRecoveryClosureRecordError,
} from "./productionExecutionArchiveRecoveryClosureRecord";
import { createDefaultState } from "./storage";

describe("production execution archive recovery closure record", () => {
  it("requires a production execution archive recovery acceptance record", () => {
    const state = createDefaultState();

    expect(() =>
      createProductionExecutionArchiveRecoveryClosureRecord(state, {}, "platform.admin")
    ).toThrow(ProductionExecutionArchiveRecoveryClosureRecordError);
  });

  it("blocks archive recovery closure when acceptance or closure evidence is incomplete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRecoveryAcceptanceRecords = [sampleArchiveRecoveryAcceptanceRecord("Blocked")];

    const record = createProductionExecutionArchiveRecoveryClosureRecord(
      state,
      {
        archiveRecoveryAcceptanceRecordId: "production-execution-archive-recovery-acceptance-record-ndb-1",
        closureOwner: "",
        recoveryClosurePacketReference: "",
        followUpActionRegisterReference: "",
        stakeholderClosureNoticeReference: "",
        archiveRecoveryClosureSignOffReference: "",
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      archiveRecoveryAcceptanceRecordId: "production-execution-archive-recovery-acceptance-record-ndb-1",
      archiveRecoveryDrillRecordId: "production-execution-archive-recovery-drill-record-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Archive recovery acceptance ready", passed: false }),
        expect.objectContaining({ name: "Closure owner assigned", passed: false }),
        expect.objectContaining({ name: "Prototype does not execute adapter", passed: true }),
      ])
    );
  });

  it("marks archive recovery closure ready when acceptance and closure evidence are complete", () => {
    const state = createDefaultState();
    state.productionExecutionArchiveRecoveryAcceptanceRecords = [
      sampleArchiveRecoveryAcceptanceRecord("Ready for production execution archive recovery acceptance review"),
    ];

    const record = createProductionExecutionArchiveRecoveryClosureRecord(
      state,
      { archiveRecoveryAcceptanceRecordId: "production-execution-archive-recovery-acceptance-record-ndb-1" },
      "platform.admin"
    );

    expect(record.status).toBe("Ready for production execution archive recovery closure review");
    expect(record.closureOwner).toBe("Production Archive Recovery Closure Owner");
    expect(record.recoveryClosurePacketReference).toBe("production-archive-recovery-closure-packet-ndb.md");
    expect(record.followUpActionRegisterReference).toBe("production-archive-recovery-follow-up-actions-ndb.md");
    expect(record.stakeholderClosureNoticeReference).toBe("production-archive-recovery-stakeholder-closure-notice-ndb.md");
    expect(record.archiveRecoveryClosureSignOffReference).toBe("production-archive-recovery-closure-signoff-ndb.md");
    expect(record.provisioningEnabled).toBe(false);
    expect(record.killSwitch.enabled).toBe(false);
  });
});

function sampleArchiveRecoveryAcceptanceRecord(
  status: "Blocked" | "Ready for production execution archive recovery acceptance review"
): ProductionExecutionArchiveRecoveryAcceptanceRecord {
  return {
    id: "production-execution-archive-recovery-acceptance-record-ndb-1",
    provider: "NDB",
    archiveRecoveryDrillRecordId: "production-execution-archive-recovery-drill-record-ndb-1",
    archiveRetrievalValidationRecordId: "production-execution-archive-retrieval-validation-record-ndb-1",
    readinessArchiveHandoffRecordId: "production-execution-readiness-archive-handoff-record-ndb-1",
    finalAcceptanceArchiveRecordId: "production-execution-final-acceptance-archive-record-ndb-1",
    improvementClosureRecordId: "production-execution-improvement-closure-record-ndb-1",
    postImplementationReviewRecordId: "production-execution-post-implementation-review-record-ndb-1",
    operationalClosureRecordId: "production-execution-operational-closure-record-ndb-1",
    finalTurnoverRecordId: "production-execution-final-turnover-record-ndb-1",
    serviceAcceptanceRecordId: "production-execution-service-acceptance-record-ndb-1",
    supportReadinessRecordId: "production-execution-support-readiness-record-ndb-1",
    operationsHandoverRecordId: "production-execution-operations-handover-record-ndb-1",
    completionDossierRecordId: "production-execution-completion-dossier-record-ndb-1",
    finalArchiveCertificationRecordId:
      "production-execution-final-archive-certification-record-ndb-1",
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
    acceptanceOwner: "Production Archive Recovery Acceptance Owner",
    recoveryEvidencePacketReference: "production-archive-recovery-evidence-packet-ndb.md",
    rtoRpoVarianceReviewReference: "production-archive-rto-rpo-variance-review-ndb.md",
    residualRecoveryRiskRegisterReference: "production-archive-residual-recovery-risk-register-ndb.md",
    acceptanceSignOffReference: "production-archive-recovery-acceptance-signoff-ndb.md",
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
