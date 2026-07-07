import { describe, expect, it } from "vitest";
import type { ControlledLabExecutionEvidenceLedger } from "../src/data/cloudStudioDomain";
import {
  ControlledLabExecutionReadinessAttestationError,
  createControlledLabExecutionReadinessAttestation,
} from "./controlledLabExecutionReadinessAttestation";
import { createDefaultState } from "./storage";

describe("controlled lab execution readiness attestation", () => {
  it("requires an evidence ledger", () => {
    const state = createDefaultState();

    expect(() => createControlledLabExecutionReadinessAttestation(state, {}, "platform.admin")).toThrow(
      ControlledLabExecutionReadinessAttestationError
    );
  });

  it("blocks readiness when ledger or attestation evidence is incomplete", () => {
    const state = createDefaultState();
    state.controlledLabExecutionEvidenceLedgers = [sampleLedger("Blocked")];

    const attestation = createControlledLabExecutionReadinessAttestation(
      state,
      {
        evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-1",
        platformOwnerAttestation: "",
        securityReviewerAttestation: "",
        operationsReviewerAttestation: "",
        rollbackOwnerAttestation: "",
        executiveSponsorAttestation: "",
      },
      "platform.admin"
    );

    expect(attestation).toMatchObject({
      provider: "NDB",
      status: "Blocked",
      evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-1",
      provisioningEnabled: false,
    });
    expect(attestation.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Evidence ledger ready", passed: false }),
        expect.objectContaining({ name: "Platform owner attested", passed: false }),
        expect.objectContaining({ name: "Real adapter execution disabled", passed: true }),
      ])
    );
  });

  it("marks attestation ready when ledger and all attestations are complete", () => {
    const state = createDefaultState();
    state.controlledLabExecutionEvidenceLedgers = [sampleLedger("Ready for evidence review")];

    const attestation = createControlledLabExecutionReadinessAttestation(
      state,
      { evidenceLedgerId: "controlled-lab-evidence-ledger-ndb-1" },
      "platform.admin"
    );

    expect(attestation.status).toBe("Ready for execution review");
    expect(attestation.attestations.platformOwner).toContain("controlled-lab-evidence-ledger-ndb-1");
    expect(attestation.attestations.securityReviewer).toContain("NDB");
    expect(attestation.killSwitch.enabled).toBe(false);
    expect(attestation.provisioningEnabled).toBe(false);
  });
});

function sampleLedger(status: "Blocked" | "Ready for evidence review"): ControlledLabExecutionEvidenceLedger {
  return {
    id: "controlled-lab-evidence-ledger-ndb-1",
    provider: "NDB",
    dryRunChecklistId: "controlled-lab-dry-run-checklist-ndb-1",
    rehearsalPacketId: "controlled-lab-rehearsal-packet-ndb-1",
    status,
    requestedBy: "platform.admin",
    immutableReferences: {
      operatorEvidence: ["operator-cloud-operator-ack.md", "operator-security-observer-ack.md", "operator-rollback-owner-ack.md"],
      observerEvidence: ["security-observer-notes.md"],
      rollbackEvidence: ["rollback-timer-30-minutes.md"],
      logEvidence: ["audit-log-capture-plan.md", "provider-response-capture.md"],
      auditEvidence: ["audit-boundary-controlled-lab-rehearsal-packet-ndb-1.md"],
      stopAuthorityEvidence: ["stop-authority-cloud-ops.md"],
    },
    checks: [],
    evidence: [],
    killSwitch: { name: "NDC_NDB_REAL_ADAPTER_ENABLED", enabled: false },
    provisioningEnabled: false,
    createdAt: "2026-07-07T00:00:00.000Z",
  };
}
