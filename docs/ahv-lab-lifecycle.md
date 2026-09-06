# AHV Lab Lifecycle Testing

This guide describes the lab-only real AHV lifecycle path for NDC Studio.

The feature is disabled by default. Enable it only for an explicitly authorized AHV test cluster with disposable image, project, subnet, and rollback ownership.

If no AHV test cluster is available yet, use the local mock Prism Central harness first. It exercises the same NDC create, poll, power, destroy, and reconciliation workflow without contacting Nutanix infrastructure. See `docs/mock-prism-central-harness.md`.

Before any real AHV lifecycle smoke, complete the formal acceptance checklist in `docs/ahv-lab-acceptance-pack.md` and capture results in `docs/ahv-lab-acceptance-report-template.md`.

## Deployment

1. Copy `.env.lab.example` to `.env.lab` on the private lab host.
2. Fill in Prism Central endpoint, username, password, and allowed UUIDs. Use either an allowed image UUID or an allowed source VM UUID.
3. Keep all three lifecycle switches disabled until config validation passes.
4. Start the lab deployment:

```powershell
docker compose -f docker-compose.lab.yml up --build
```

## Required Switches

The lab AHV adapter runs only when all of these are true:

```text
APP_ENV=lab
NDC_AHV_REAL_ADAPTER_ENABLED=true
NDC_CONTROLLED_PROVISIONING_ENABLED=true
NDC_AHV_LAB_LIFECYCLE_ENABLED=true
```

The default `.env.example` and `.env.lab.example` keep these disabled.

## Validation

Run a config-only validation first:

```powershell
npm run validate:ahv-lab-acceptance-pack
npm run validate:ahv-lab-config
```

Run read-only Prism list checks before any lifecycle test:

```powershell
npm run smoke:ahv-lab-readonly
```

Run the lifecycle smoke only after explicit lab approval:

```powershell
npm run smoke:ahv-lab-lifecycle -- -BaseUrl http://127.0.0.1:18080 -EnvironmentName ndc-lab-smoke-01
```

For labs that use an approved golden source VM instead of an Image Service image, run the dedicated clone smoke:

```powershell
npm run smoke:ahv-source-vm-clone -- -BaseUrl http://127.0.0.1:18080 -EnvironmentName ndc-lab-source-clone-01
```

## Lifecycle Path

The product now exposes the lab path through guided Admin console steps, so a tester can understand and operate the flow without relying on script output alone.

In the browser:

1. Open **Admin > Settings > Connect Infrastructure**.
2. Enter Prism Element or Prism Central details for the private lab.
3. Run the one-time read-only connection test.
4. Load the sanitized preview into the inventory browser.
5. Open **Admin > Infrastructure**.
6. Select the intended lab profile: **Local Mock**, **PE Lab**, **PC Lab**, or **PC + PE fallback**.
7. Approve the discovered cluster, network/subnet, and image or source VM candidates.
8. Run the lab setup validator and clear any blocked readiness item.
9. Use the controlled AHV lifecycle panel to create or clone a lab VM.
10. Poll the submitted Prism task until the create status succeeds.
11. Submit and poll the power check if lab policy permits it.
12. Submit destroy, poll the destroy task, and confirm inventory reconciliation.
13. Export the redacted lab evidence report for the completed run.

The API keeps the same gated workflow behind the UI:

1. Review and select an AHV lab profile.
2. Create VM sandbox dry-run.
3. Record lab authorization scope.
4. Record rollback/destroy proof.
5. Request and approve controlled provisioning gate.
6. Record VM lifecycle proof.
7. Record controlled create authorization envelope.
8. Submit AHV create run.
9. Poll the Prism create task.
10. Optionally submit and poll a power transition.
11. Submit destroy, poll the destroy task, and reconcile inventory absence.

## Lifecycle Evidence

Each controlled AHV run records:

- Adapter mode and provider path.
- Prism task UUIDs.
- Per-task provider metadata for Prism Central or Prism Element.
- VM UUID after create or clone.
- Create, power, destroy, and reconciliation status.
- Last poll time, failure reason, and lifecycle event ledger.
- Redacted lab evidence report metadata for acceptance records.

Destroy is intentionally two-phase. The destroy request submits the Prism task and records pending reconciliation. The run is marked destroyed only after polling confirms task success and the VM no longer appears in read-only inventory.

Use **Admin > Infrastructure > Lab evidence report** after destroy/reconciliation to export a JSON evidence pack. The report contains task IDs, selected scope references, lifecycle events, status, reconciliation result, and redaction assertions. It does not include Prism credentials, tokens, Authorization headers, or inline endpoint query strings.

## Guardrails

- Real AHV lifecycle routes require `Platform Admin`.
- VM names must use the `ndc-lab-` prefix.
- Production-like names are blocked.
- CPU, memory, and disk quotas are enforced.
- Only configured cluster, project, subnet, and image or source VM UUIDs are allowed.
- Source VM clone is permitted only when the source VM is approved in NDC inventory and its UUID matches the private allowed source VM UUID.
- Secrets are accepted only through private deployment environment variables.
- Passwords, tokens, and Authorization headers must not appear in API responses, audit metadata, docs, or committed files.
