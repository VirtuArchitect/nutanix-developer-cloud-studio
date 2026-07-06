import type {
  CredentialReferenceDiagnostic,
  IntegrationConfig,
  ProvisioningAdapterName,
} from "../src/data/cloudStudioDomain";

export class CredentialReferenceError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

const referencePattern = /^[a-z][a-z0-9._:-]{2,63}$/;

export function createCredentialReferenceDiagnostics(
  configs: IntegrationConfig[]
): CredentialReferenceDiagnostic[] {
  return configs.map((config) => createCredentialReferenceDiagnostic(config.name as ProvisioningAdapterName, config.credentialProfile));
}

export function createCredentialReferenceDiagnostic(
  provider: ProvisioningAdapterName,
  credentialProfile: string
): CredentialReferenceDiagnostic {
  const checks = credentialReferenceChecks(credentialProfile);
  return {
    provider,
    credentialProfile: credentialProfile || "not-configured",
    status: !credentialProfile
      ? "Missing"
      : checks.every((check) => check.passed)
        ? "Approved reference"
        : "Invalid",
    checks,
    redactionBoundary: "Only credential profile references are stored. Access material must remain outside NDC Studio.",
  };
}

export function assertCredentialReference(credentialProfile: string) {
  const diagnostic = createCredentialReferenceDiagnostic("NCI", credentialProfile);
  if (credentialProfile && diagnostic.status === "Invalid") {
    throw new CredentialReferenceError(
      "credential_reference_invalid",
      "Credential profile must be a reference name, not inline access material."
    );
  }
}

function credentialReferenceChecks(credentialProfile: string) {
  const configured = Boolean(credentialProfile);
  const referenceShape = !configured || referencePattern.test(credentialProfile);
  const noInlineMaterial =
    !configured ||
    (!credentialProfile.includes("://") &&
      !credentialProfile.includes("@") &&
      !credentialProfile.includes("=") &&
      !credentialProfile.includes("$") &&
      credentialProfile.length <= 64);

  return [
    {
      name: "Reference configured",
      passed: configured,
      detail: configured ? "A credential profile reference is configured." : "No credential profile reference is configured.",
    },
    {
      name: "Reference shape",
      passed: referenceShape,
      detail: referenceShape
        ? "Reference name uses the approved profile-name shape."
        : "Use lowercase letters, numbers, dot, underscore, colon, or dash, starting with a letter.",
    },
    {
      name: "No inline access material",
      passed: noInlineMaterial,
      detail: noInlineMaterial
        ? "No inline access material was detected in the reference."
        : "Move access material to an external vault or platform credential store.",
    },
  ];
}
