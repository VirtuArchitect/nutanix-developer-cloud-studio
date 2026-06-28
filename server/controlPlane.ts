import type {
  ControlPlaneJob,
  ControlPlaneJobState,
  Environment,
  Target,
  Template,
} from "../src/data/cloudStudioDomain";
import type { ApiState, AuditEvent } from "./types";

export type EnqueueControlPlaneJobRequest = {
  environment: Environment;
  template: Template;
  targets: Target[];
  approvalRequired: boolean;
};

export type EnqueueDestroyJobRequest = {
  environment: Environment;
};

export function enqueueControlPlaneJob(
  state: ApiState,
  { environment, template, targets, approvalRequired }: EnqueueControlPlaneJobRequest
): ControlPlaneJob {
  const now = new Date().toISOString();
  const job = {
    id: `cp-${environment.name}`,
    environmentName: environment.name,
    template: template.name,
    owner: environment.owner,
    targets,
    operation: "Provision",
    state: approvalRequired ? "AwaitingApproval" : "Queued",
    attempts: 0,
    maxAttempts: 3,
    worker: "MockOrchestrator",
    provisioningEnabled: false,
    queuedAt: now,
    updatedAt: now,
    transitions: [
      {
        state: approvalRequired ? "AwaitingApproval" : "Queued",
        actor: "control-plane",
        message: approvalRequired
          ? "Job queued and paused for approval."
          : "Job queued for validation by the mock orchestrator.",
        createdAt: now,
      },
    ],
  } satisfies ControlPlaneJob;

  state.controlPlaneJobs = [job, ...state.controlPlaneJobs.filter((item) => item.id !== job.id)];
  state.auditEvents = [
    createAuditEvent("control-plane.job.queued", "control-plane", environment.name, {
      jobId: job.id,
      state: job.state,
      provisioningEnabled: false,
    }),
    ...state.auditEvents,
  ];

  return job;
}

export function enqueueDestroyControlPlaneJob(
  state: ApiState,
  { environment }: EnqueueDestroyJobRequest
): ControlPlaneJob {
  const now = new Date().toISOString();
  const job = {
    id: `cp-destroy-${environment.name}`,
    environmentName: environment.name,
    template: environment.template,
    owner: environment.owner,
    targets: ["VM", "Kubernetes", "Database", "Storage", "AI Endpoint"].filter((target) =>
      environment.template.includes("AI")
        ? true
        : environment.template.includes("Postgres")
          ? target !== "AI Endpoint"
          : target === "VM" || target === "Storage"
    ) as Target[],
    operation: "Destroy",
    state: "Destroying",
    attempts: 0,
    maxAttempts: 3,
    worker: "MockOrchestrator",
    provisioningEnabled: false,
    queuedAt: now,
    updatedAt: now,
    transitions: [
      {
        state: "Destroying",
        actor: "control-plane",
        message: "Destroy job queued. Teardown is simulated and real infrastructure mutation is disabled.",
        createdAt: now,
      },
    ],
  } satisfies ControlPlaneJob;

  state.controlPlaneJobs = [job, ...state.controlPlaneJobs.filter((item) => item.id !== job.id)];
  state.auditEvents = [
    createAuditEvent("control-plane.destroy.queued", "control-plane", environment.name, {
      jobId: job.id,
      provisioningEnabled: false,
    }),
    ...state.auditEvents,
  ];

  return job;
}

export function advanceControlPlaneJob(
  state: ApiState,
  jobId: string,
  actor = "mock.worker"
): ControlPlaneJob {
  const job = findControlPlaneJob(state, jobId);
  const nextState = nextControlPlaneState(job.state);
  const message = transitionMessage(nextState);
  const updated = transitionJob(job, nextState, actor, message, nextState === "Provisioning");

  state.controlPlaneJobs = replaceJob(state.controlPlaneJobs, updated);
  state.environments = state.environments.map((environment) => {
    if (environment.name !== updated.environmentName) {
      return environment;
    }

    if (updated.state === "Ready") {
      return { ...environment, status: "Ready" };
    }

    if (updated.state === "Destroyed") {
      return { ...environment, status: "Destroyed" };
    }

    if (updated.state === "Failed" || updated.state === "Expired") {
      return { ...environment, status: "Failed" };
    }

    return environment;
  });
  state.auditEvents = [
    createAuditEvent("control-plane.job.transitioned", actor, updated.environmentName, {
      jobId,
      state: updated.state,
      provisioningEnabled: false,
    }),
    ...state.auditEvents,
  ];

  return updated;
}

export function retryControlPlaneJob(state: ApiState, jobId: string, actor = "platform.admin"): ControlPlaneJob {
  const job = findControlPlaneJob(state, jobId);
  const updated = transitionJob(
    {
      ...job,
      lastError: undefined,
    },
    "Queued",
    actor,
    "Retry requested. Job returned to the queue.",
    false
  );

  state.controlPlaneJobs = replaceJob(state.controlPlaneJobs, updated);
  state.auditEvents = [
    createAuditEvent("control-plane.job.retry_requested", actor, updated.environmentName, {
      jobId,
      attempts: updated.attempts,
    }),
    ...state.auditEvents,
  ];

  return updated;
}

export function failControlPlaneJob(
  state: ApiState,
  jobId: string,
  reason = "Mock orchestrator failure.",
  actor = "mock.worker"
): ControlPlaneJob {
  const job = findControlPlaneJob(state, jobId);
  const updated = transitionJob(
    {
      ...job,
      lastError: reason,
    },
    "Failed",
    actor,
    reason,
    false
  );

  state.controlPlaneJobs = replaceJob(state.controlPlaneJobs, updated);
  state.environments = state.environments.map((environment) =>
    environment.name === updated.environmentName ? { ...environment, status: "Failed" } : environment
  );
  state.auditEvents = [
    createAuditEvent("control-plane.job.failed", actor, updated.environmentName, {
      jobId,
      reason,
    }),
    ...state.auditEvents,
  ];

  return updated;
}

export function releaseApprovalPausedJobs(state: ApiState, environmentName: string, actor: string) {
  state.controlPlaneJobs = state.controlPlaneJobs.map((job) => {
    if (job.environmentName !== environmentName || job.state !== "AwaitingApproval") {
      return job;
    }

    const updated = transitionJob(job, "Queued", actor, "Approval granted. Job returned to queue.", false);
    state.auditEvents = [
      createAuditEvent("control-plane.job.approval_released", actor, environmentName, {
        jobId: job.id,
      }),
      ...state.auditEvents,
    ];
    return updated;
  });
}

export class ControlPlaneError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

function findControlPlaneJob(state: ApiState, jobId: string) {
  const job = state.controlPlaneJobs.find((item) => item.id === jobId);
  if (!job) {
    throw new ControlPlaneError("control_plane_job_not_found", `Control plane job not found: ${jobId}`);
  }

  return job;
}

function nextControlPlaneState(state: ControlPlaneJobState): ControlPlaneJobState {
  switch (state) {
    case "Queued":
      return "Validating";
    case "Validating":
      return "Provisioning";
    case "Provisioning":
      return "Ready";
    case "Destroying":
      return "Destroyed";
    case "AwaitingApproval":
      return "AwaitingApproval";
    case "Ready":
    case "Failed":
    case "Expired":
    case "Destroyed":
      return state;
  }
}

function transitionJob(
  job: ControlPlaneJob,
  state: ControlPlaneJobState,
  actor: string,
  message: string,
  countAttempt: boolean
): ControlPlaneJob {
  const now = new Date().toISOString();
  return {
    ...job,
    state,
    attempts: countAttempt ? job.attempts + 1 : job.attempts,
    updatedAt: now,
    transitions: [
      {
        state,
        actor,
        message,
        createdAt: now,
      },
      ...job.transitions,
    ],
  };
}

function replaceJob(jobs: ControlPlaneJob[], updated: ControlPlaneJob) {
  return jobs.map((job) => (job.id === updated.id ? updated : job));
}

function transitionMessage(state: ControlPlaneJobState) {
  switch (state) {
    case "Validating":
      return "Inputs, policy, quota, and registry references validated.";
    case "Provisioning":
      return "Mock orchestrator entered provisioning. Real infrastructure mutation remains disabled.";
    case "Ready":
      return "Mock orchestration completed and environment is marked ready.";
    case "Destroying":
      return "Mock teardown entered destroy workflow. Real infrastructure mutation remains disabled.";
    case "Destroyed":
      return "Mock teardown completed and environment is marked destroyed.";
    case "AwaitingApproval":
      return "Job is waiting for approval.";
    case "Failed":
      return "Job failed.";
    case "Expired":
      return "Job expired.";
    case "Queued":
      return "Job queued.";
  }
}

function createAuditEvent(
  action: string,
  actor: string,
  target: string,
  metadata?: Record<string, unknown>
): AuditEvent {
  return {
    id: `audit-${action}-${Date.now()}`,
    action,
    actor,
    target,
    createdAt: new Date().toISOString(),
    metadata,
  };
}
