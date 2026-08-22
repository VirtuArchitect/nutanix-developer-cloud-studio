# PE / PC Validation Rings

This guide gives testers a staged validation path for Prism Element and Prism Central labs. It separates safe discovery from governed lifecycle testing so real infrastructure mutation happens only after the lab scope is known, approved, and reversible.

Use this guide only against authorized lab infrastructure. The public GitHub Pages demo and default local configuration remain simulated.

## Ring 0 - Local Pack And Safety Validation

Purpose: prove the NDC validation assets and local configuration are present before any Prism endpoint is contacted.

Run:

```powershell
npm run validate:pe-pc-test-pack
npm run validate:ahv-lab-acceptance-pack
npm run validate:ahv-lab-config
```

Expected result:

- Required docs, scripts, Docker Compose files, and disabled defaults are present.
- Private environment variables are configured on the lab host.
- Lifecycle switches remain understood and explicit.
- No Prism call is made by the pack validators.

Stop if:

- Required scope UUIDs are missing.
- The lab operator cannot identify the rollback/destroy owner.
- Secrets appear in docs, command history, screenshots, or logs.

## Ring 1 - Connection Validation

Purpose: prove the endpoint and credentials can authenticate without changing infrastructure.

Validate:

- Prism Element or Prism Central endpoint is reachable on `9440`.
- TLS is trusted, or `NDC_PRISM_TLS_INSECURE=true` is explicitly accepted for `APP_ENV=lab`.
- Credentials authenticate successfully.
- Provider type is selected correctly: `prism-element` or `prism-central`.
- Timeout and invalid credential failures return controlled errors.

UI path:

1. Open `Admin`.
2. Open `Settings`.
3. Use `Connect infrastructure`.
4. Select Prism Element or Prism Central.
5. Run the one-time read-only connection test.

Do not save browser-entered passwords. NDC uses them for the one-time test only and must not persist them.

## Ring 2 - Read-Only Inventory Discovery

Purpose: prove NDC can discover safe inventory evidence before any create request is available.

Prism Element read-only smoke:

```powershell
npm run smoke:ahv-pe-readonly
```

Prism Central read-only smoke:

```powershell
npm run smoke:ahv-lab-readonly
```

Validate:

- Clusters are listed.
- Networks or subnets are listed.
- Images are listed.
- Existing VMs are listed, including any VM matching `ndc-lab-*`.
- Prism Central projects/categories are listed where available.
- Unsupported Prism Central-only endpoints fail gracefully when the target is Prism Element.

Stop if:

- The endpoint returns production/customer inventory outside the approved lab scope.
- Read-only output would expose private hostnames or customer data in screenshots.
- Any smoke path attempts create, power, update, or delete.

## Ring 3 - Scope Import And Approval

Purpose: turn discovered read-only inventory into governed NDC scope evidence.

UI path:

1. Run `Connect infrastructure`.
2. Review the sanitized preview.
3. Load the preview into the inventory browser.
4. Approve exactly one lab cluster, one lab network/subnet, and one disposable image or source VM.
5. Reject anything outside the test boundary.

Validate:

- Imported preview records are reset to `Discovered`.
- Browser-entered credentials are absent from inventory records, audit metadata, and API responses.
- Controlled AHV create refuses missing or unapproved cluster, network/subnet, and image/source VM records.
- Scope decisions require `Platform Admin`.

## Ring 4 - Preflight And Guardrail Validation

Purpose: prove the create path remains fail-closed until every lifecycle guardrail is satisfied.

Validate:

- VM name must start with `ndc-lab-*`.
- Production-like names are blocked.
- CPU, memory, and disk quotas are enforced.
- Only approved cluster, subnet, project when Prism Central is used, and image or source VM UUIDs are accepted.
- Only one active VM is allowed per environment name.
- Destroy/rollback evidence exists before create can be submitted.
- Developer role receives `403` for real lifecycle routes.
- `APP_ENV=lab` and all lifecycle switches are required.

Recommended safe negative checks:

- Wrong password.
- Missing endpoint.
- Missing approved image or source VM.
- Missing approved subnet.
- Developer-only session.
- Real adapter switch disabled.

## Ring 5 - Controlled Lifecycle Testing

Purpose: create, operate, and destroy one disposable lab VM after Rings 0-4 pass.

Do not run lifecycle until the lab authorization, rollback owner, approved scope, and change window are recorded.

Run mock lifecycle first:

```powershell
npm run smoke:mock-prism-lifecycle
```

Run real lifecycle only after explicit approval:

```powershell
npm run smoke:ahv-lab-lifecycle -- -BaseUrl http://127.0.0.1:18080 -EnvironmentName ndc-lab-smoke-01
```

Validate:

- Create submits one Prism task.
- Poll maps Prism task state into NDC run state.
- VM UUID is recorded.
- Power action is submitted only if lab policy allows it.
- Destroy submits one Prism task.
- Inventory reconciliation confirms the VM is absent.
- Audit events exist for preflight, create, poll, power, destroy, and reconciliation.

Stop immediately if:

- The VM name is not prefixed with `ndc-lab-`.
- More than one VM would be created.
- Destroy is unavailable.
- Reconciliation cannot confirm the destroy result.

## Ring 6 - Audit, Redaction, And Resilience

Purpose: prove the operational evidence is useful without leaking sensitive data.

Validate:

- Audit and exported evidence contain no passwords, tokens, Authorization headers, or private endpoint query strings.
- Multiple failed connection attempts do not reveal secrets.
- Prism unavailable during poll/create/destroy returns recoverable status.
- Long-running task polling does not hang the API.
- Manual reconciliation detects drift if the VM is removed directly in Prism.
- API restart preserves expected state when persistence is configured.

## PE-Specific Notes

Prism Element is useful for one-node AHV testing where Prism Central is not available.

Validate:

- PE login/connectivity.
- Cluster, image, network, and VM read-only discovery.
- Approved powered-off source VM clone selection when no Image Service disk image exists.
- Whether lifecycle endpoints needed by NDC are supported by the PE version.
- PE limitations are visible to the tester, especially reduced project/category and multi-cluster governance.
- One disposable `ndc-lab-*` VM lifecycle only after approved scope.

## PC-Specific Notes

Prism Central is the preferred governance target when available.

Validate:

- Multi-cluster inventory discovery.
- Project and category discovery.
- Approved project, subnet, image/source VM, and cluster scoping.
- Cluster targeting.
- Prism Central v3 task polling.
- Cross-cluster reconciliation for NDC-created `ndc-lab-*` VMs.

## Evidence Checklist

Capture:

- Ring 0 command output.
- Ring 1 connection-test result with endpoint labels redacted if needed.
- Ring 2 read-only smoke output.
- Ring 3 approval decisions.
- Ring 4 failed guardrail examples.
- Ring 5 lifecycle task UUIDs and VM UUID.
- Ring 6 audit/redaction review.
- Final go/no-go decision.

Never capture or commit passwords, tokens, Authorization headers, private CA keys, private infrastructure screenshots, hostnames, customer names, or customer data.
