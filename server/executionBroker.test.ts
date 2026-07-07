import { describe, expect, it } from "vitest";
import type { ControlledLabExecutionReadinessAttestation, ExecutionBrokerQueueRecord } from "../src/data/cloudStudioDomain";
import { createDefaultState } from "./storage";
import { createExecutionBrokerQueueRecord, ExecutionBrokerError } from "./executionBroker";

describe("execution broker queue", () => {
  it("requires a readiness attestation", () => {
    const state = createDefaultState();

    expect(() => createExecutionBrokerQueueRecord(state, {}, "platform.admin")).toThrow(ExecutionBrokerError);
  });

  it("blocks broker readiness when attestation or evidence is incomplete", () => {
    const state = createDefaultState();
    state.controlledLabExecutionReadinessAttestations = [sampleAttestation("Blocked")];

    const record = createExecutionBrokerQueueRecord(
      state,
      {
        readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
        idempotencyKey: "ndb-controlled-lab-001",
        approvalEvidenceLinks: [],
      },
      "platform.admin"
    );

    expect(record).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
      idempotencyKey: "ndb-controlled-lab-001",
      provisioningEnabled: false,
    });
    expect(record.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Readiness attestation complete", passed: false }),
        expect.objectContaining({ name: "Approval evidence linked", passed: false }),
        expect.objectContaining({ name: "Queued for operator review only", passed: true }),
      ])
    );
  });

  it("blocks duplicate idempotency keys", () => {
    const state = createDefaultState();
    state.controlledLabExecutionReadinessAttestations = [sampleAttestation("Ready for execution review")];
    state.executionBrokerQueueRecords = [sampleBrokerRecord("ndb-controlled-lab-001")];

    const record = createExecutionBrokerQueueRecord(
      state,
      {
        readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
        idempotencyKey: "ndb-controlled-lab-001",
      },
      "platform.admin"
    );

    expect(record.status).toBe("Blocked");
    expect(record.checks).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Idempotency key unique", passed: false })])
    );
    expect(record.provisioningEnabled).toBe(false);
  });

  it("queues complete broker records for operator review only", () => {
    const state = createDefaultState();
    state.controlledLabExecutionReadinessAttestations = [sampleAttestation("Ready for execution review")];

    const record = createExecutionBrokerQueueRecord(
      state,
      {
        readinessAttestationId: "controlled-lab-readiness-attestation-ndb-1",
        idempotencyKey: "ndb-controlled-lab-001",
      },
      "platform.admin"
    );

    expect(record.status).toBe("Queued for operator review");
    expect(record.approvalEvidenceLinks).toHaveLength(3);
    expect(record.killSwitch.enabled).toBe(false);
    expect(record.provisioningEnabled).toBe(false);
  });
});

function sampleAttestation(status: "Blocked" | "Ready for execution review"): ControlledLabExecutionReadinessAttestation {
  return {
    id: "controlled-lab-readiness-attestation-ndb-1",
    provider: "NDB",
    evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-1",
    dryRunChecklistId: "controlled-lab-dry-run-checklist-ndb-1",
    status,
    requestedBy: "platform.admin",
    attestations: {
      platformOwner: "Platform owner reviewed.",
      securityReviewer: "Security reviewed.",
      operationsReviewer: "Operations reviewed.",
      rollbackOwner: "Rollback reviewed.",
      executiveSponsor: "Sponsor reviewed.",
    },
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}

function sampleBrokerRecord(idempotencyKey: string): ExecutionBrokerQueueRecord {
  return {
    id: "execution-broker-ndb-0",
    provider: "NDB",
    readinessAttestationId: "controlled-lab-readiness-attestation-ndb-0",
    evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-0",
    idempotencyKey,
    operation: "Controlled Lab Adapter Execution",
    status: "Queued for operator review",
    requestedBy: "platform.admin",
    approvalEvidenceLinks: ["a", "b", "c"],
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
