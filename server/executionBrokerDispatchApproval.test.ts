import { describe, expect, it } from "vitest";
import type { ExecutionBrokerQueueRecord } from "../src/data/cloudStudioDomain";
import {
  createExecutionBrokerDispatchApproval,
  ExecutionBrokerDispatchApprovalError,
} from "./executionBrokerDispatchApproval";
import { createDefaultState } from "./storage";

describe("execution broker dispatch approval", () => {
  it("requires a broker queue record", () => {
    const state = createDefaultState();

    expect(() => createExecutionBrokerDispatchApproval(state, {}, "platform.admin")).toThrow(
      ExecutionBrokerDispatchApprovalError
    );
  });

  it("blocks dispatch approval when broker record or evidence is incomplete", () => {
    const state = createDefaultState();
    state.executionBrokerQueueRecords = [sampleBrokerRecord("Blocked")];

    const approval = createExecutionBrokerDispatchApproval(
      state,
      {
        brokerRecordId: "execution-broker-ndb-1",
        operatorApprover: "",
        rollbackProofReference: "",
        pentestEvidenceReference: "",
        dispatchWindowReference: "",
      },
      "platform.admin"
    );

    expect(approval).toMatchObject({
      provider: "NDB",
      brokerRecordId: "execution-broker-ndb-1",
      status: "Blocked",
      provisioningEnabled: false,
    });
    expect(approval.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Broker record queued", passed: false }),
        expect.objectContaining({ name: "Operator approver assigned", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks dispatch approval ready when broker and evidence are complete", () => {
    const state = createDefaultState();
    state.executionBrokerQueueRecords = [sampleBrokerRecord("Queued for operator review")];

    const approval = createExecutionBrokerDispatchApproval(
      state,
      { brokerRecordId: "execution-broker-ndb-1" },
      "platform.admin"
    );

    expect(approval.status).toBe("Ready for authorized lab dispatch review");
    expect(approval.operatorApprover).toBe("cloud.operations.approver");
    expect(approval.rollbackProofReference).toBe("rollback-proof-ndb.md");
    expect(approval.pentestEvidenceReference).toBe("pentest-scope-ndb.md");
    expect(approval.killSwitch.enabled).toBe(false);
    expect(approval.provisioningEnabled).toBe(false);
  });
});

function sampleBrokerRecord(status: "Blocked" | "Queued for operator review"): ExecutionBrokerQueueRecord {
  return {
    id: "execution-broker-ndb-1",
    provider: "NDB",
    readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
    evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-1",
    idempotencyKey: "ndb-controlled-lab-001",
    operation: "Controlled Lab Adapter Execution",
    status,
    requestedBy: "platform.admin",
    approvalEvidenceLinks: ["attestation", "ledger", "checklist"],
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
