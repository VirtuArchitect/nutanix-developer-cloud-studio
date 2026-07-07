import type {
  ControlledLabDryRunExecutionChecklist,
  ControlledLabExecutionRehearsalPacket,
} from "../src/data/cloudStudioDomain";
import type { ApiState, CreateControlledLabDryRunExecutionChecklistRequest } from "./types";

export class ControlledLabDryRunExecutionChecklistError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export function createControlledLabDryRunExecutionChecklist(
  state: ApiState,
  request: CreateControlledLabDryRunExecutionChecklistRequest,
  actor: string
): ControlledLabDryRunExecutionChecklist {
  const packet = findRehearsalPacket(state, request);
  const scheduledStart = request.scheduledStart ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const scheduledEnd = request.scheduledEnd ?? new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();
  const operatorRoster = request.operatorRoster ?? ["Cloud Operator", "Security Observer", "Rollback Owner"];
  const logCaptureReferences = request.logCaptureReferences ?? ["audit-log-capture-plan.md", "provider-response-capture.md"];
  const rollbackTimerMinutes = request.rollbackTimerMinutes ?? 30;
  const stopAuthority = request.stopAuthority ?? packet.frozenReferences.rollbackOwner;
  const checks = [
    {
      name: "Rehearsal packet ready",
      passed: packet.status === "Ready for rehearsal review",
      detail: `${packet.id} is ${packet.status}.`,
    },
    {
      name: "Operator roster assigned",
      passed: operatorRoster.length >= 3,
      detail: `${operatorRoster.length} operator role(s) assigned.`,
    },
    {
      name: "Observation window scheduled",
      passed: Date.parse(scheduledEnd) > Date.parse(scheduledStart),
      detail: `${scheduledStart} to ${scheduledEnd}.`,
    },
    {
      name: "Log capture references recorded",
      passed: logCaptureReferences.length >= 2,
      detail: `${logCaptureReferences.length} log capture reference(s) recorded.`,
    },
    {
      name: "Rollback timer set",
      passed: rollbackTimerMinutes >= 15,
      detail: `${rollbackTimerMinutes} minute rollback timer.`,
    },
    {
      name: "Stop authority assigned",
      passed: Boolean(stopAuthority),
      detail: stopAuthority || "Stop authority is required.",
    },
    {
      name: "Real adapter execution disabled",
      passed: packet.provisioningEnabled === false && packet.killSwitch.enabled === false,
      detail: `${packet.killSwitch.name} remains disabled.`,
    },
  ];

  return {
    id: `controlled-lab-dry-run-checklist-${packet.provider.toLowerCase()}-${Date.now()}`,
    provider: packet.provider,
    rehearsalPacketId: packet.id,
    approvalGateId: packet.approvalGateId,
    status: checks.every((check) => check.passed) ? "Ready for dry-run review" : "Blocked",
    requestedBy: actor,
    operatorRoster,
    observationWindow: {
      scheduledStart,
      scheduledEnd,
    },
    logCaptureReferences,
    rollbackTimerMinutes,
    stopAuthority,
    checks,
    evidence: [
      `Rehearsal packet: ${packet.id}.`,
      `Approval gate: ${packet.approvalGateId}.`,
      `Operator roster: ${operatorRoster.join(", ")}.`,
      `Observation window: ${scheduledStart} to ${scheduledEnd}.`,
      `Rollback timer: ${rollbackTimerMinutes} minutes.`,
      `Stop authority: ${stopAuthority || "missing"}.`,
      `Kill switch: ${packet.killSwitch.name}=${packet.killSwitch.enabled ? "enabled" : "disabled"}.`,
    ],
    killSwitch: packet.killSwitch,
    provisioningEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

function findRehearsalPacket(
  state: ApiState,
  request: CreateControlledLabDryRunExecutionChecklistRequest
): ControlledLabExecutionRehearsalPacket {
  const packet =
    (request.rehearsalPacketId
      ? state.controlledLabExecutionRehearsalPackets.find((item) => item.id === request.rehearsalPacketId)
      : undefined) ??
    (request.provider
      ? state.controlledLabExecutionRehearsalPackets.find((item) => item.provider === request.provider)
      : state.controlledLabExecutionRehearsalPackets[0]);

  if (!packet) {
    throw new ControlledLabDryRunExecutionChecklistError(
      "controlled_lab_rehearsal_packet_required",
      "A controlled lab execution rehearsal packet is required."
    );
  }

  return packet;
}
