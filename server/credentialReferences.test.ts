import { describe, expect, it } from "vitest";
import {
  assertCredentialReference,
  createCredentialReferenceDiagnostic,
  createCredentialReferenceDiagnostics,
  CredentialReferenceError,
} from "./credentialReferences";

describe("credential reference validation", () => {
  it("approves profile references and reports missing references", () => {
    expect(createCredentialReferenceDiagnostic("NCI", "nci-lab-readonly")).toMatchObject({
      status: "Approved reference",
      credentialProfile: "nci-lab-readonly",
    });
    expect(createCredentialReferenceDiagnostic("NDB", "")).toMatchObject({
      status: "Missing",
      credentialProfile: "not-configured",
    });
  });

  it("rejects inline-looking access material", () => {
    expect(() => assertCredentialReference("https://inline.example")).toThrow(CredentialReferenceError);
    expect(createCredentialReferenceDiagnostic("NKP", "user@example")).toMatchObject({
      status: "Invalid",
    });
  });

  it("creates diagnostics for all configured providers", () => {
    const diagnostics = createCredentialReferenceDiagnostics([
      {
        name: "NCI",
        endpoint: "https://prism.lab.example",
        credentialProfile: "nci-lab-readonly",
        status: "Configured",
        message: "Configured.",
      },
    ]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider: "NCI",
          status: "Approved reference",
        }),
      ])
    );
  });
});
