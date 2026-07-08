import type { ReadOnlyPrismLabGate, PrismReadOnlyOperation } from "../src/data/cloudStudioDomain";
import { getActiveLabAuthorizationScope } from "./authorizationEvidence";
import { readOnlyMutationOperationsBlocked } from "./prismReadOnlyBoundary";
import type { ApiState } from "./types";

const allowedOperations: PrismReadOnlyOperation[] = [
  "listClusters",
  "listProjects",
  "listImages",
  "listSubnets",
  "listCategories",
  "listVms",
];

export function createReadOnlyPrismLabGate(state: ApiState, actor: string): ReadOnlyPrismLabGate {
  const scope = getActiveLabAuthorizationScope(state);
  const config = state.integrationConfigs.find((item) => item.name === "NCI");
  const allowedActions = scope?.allowedActions ?? [];
  const excludedActions = scope?.excludedActions ?? [];
  const readOnlyAllowed = allowedOperations.every((operation) => allowedActions.includes(operation));
  const mutationsExcluded = readOnlyMutationOperationsBlocked.every((operation) => excludedActions.includes(operation));
  const checks = [
    {
      name: "Active lab scope",
      passed: Boolean(scope),
      detail: scope ? `${scope.name} expires ${scope.expiresAt}.` : "An approved, unexpired lab scope is required.",
    },
    {
      name: "NCI integration reachable",
      passed: config?.status === "Reachable",
      detail: config?.status === "Reachable" ? "NCI config is marked reachable." : "NCI config must be reachable.",
    },
    {
      name: "Credential reference",
      passed: Boolean(config?.credentialProfile),
      detail: config?.credentialProfile
        ? "Credential profile reference is present; no secret value is stored."
        : "A credential profile reference is required.",
    },
    {
      name: "Read-only operations allowed",
      passed: readOnlyAllowed,
      detail: readOnlyAllowed
        ? allowedOperations.join(", ")
        : `Scope allowed actions must include ${allowedOperations.join(", ")}.`,
    },
    {
      name: "Mutation operations excluded",
      passed: mutationsExcluded,
      detail: mutationsExcluded
        ? `${readOnlyMutationOperationsBlocked.length} mutation operations are excluded.`
        : "Scope must explicitly exclude create, update, delete, power, image, network, and category mutation operations.",
    },
    {
      name: "Network execution boundary",
      passed: true,
      detail: "This gate records evidence only. Real Prism network calls remain disabled.",
    },
  ];

  const gate: ReadOnlyPrismLabGate = {
    id: `readonly-prism-lab-gate-${Date.now()}`,
    status: checks.every((check) => check.passed) ? "Ready for fixture contract validation" : "Blocked",
    requestedBy: actor,
    createdAt: new Date().toISOString(),
    scopeRef: scope?.id ?? "lab-scope-required",
    endpointRef: config?.endpoint ? "NCI endpoint reference configured" : "NCI endpoint reference required",
    credentialProfile: config?.credentialProfile ?? "",
    allowedOperations,
    excludedOperations: readOnlyMutationOperationsBlocked,
    checks,
    evidence: [
      "Read-only Prism lab gate recorded for future live-readiness review.",
      "Fixture contract validation is allowed; real Prism network calls remain disabled.",
      "Provisioning and mutation operations remain disabled by contract.",
    ],
    provisioningEnabled: false,
    networkCallEnabled: false,
  };

  state.readOnlyPrismLabGates = [gate, ...state.readOnlyPrismLabGates];
  return gate;
}
