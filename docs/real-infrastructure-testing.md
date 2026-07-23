# Real Infrastructure Testing

NDC Studio can connect to authorized Nutanix lab infrastructure in development mode. This is intended for testers with a disposable AHV / Prism lab, not for production use.

The public GitHub Pages demo remains browser-only and never calls Prism. Real infrastructure access requires a private Docker or API deployment on a network path that can reach Prism.

Most testers should start in the console:

```text
Admin > Settings > Connect infrastructure
```

The browser wizard sends Prism endpoint and credentials to the private NDC API for a one-time read-only test. The password is not saved, returned, or written to audit records.

## Supported Lab Targets

| Target | Status | Use Case |
| --- | --- | --- |
| Mock Prism Central | Supported | Full safe lifecycle rehearsal without Nutanix infrastructure |
| Prism Element v2 | Supported for one-node AHV lab testing | PE read-only discovery and controlled VM lifecycle validation |
| Prism Central v3 | Supported for lab testing | PC read-only discovery and controlled VM lifecycle validation |
| NKP, NDB, NUS, NCM, NAI | Simulated | Planned future real adapters |

## Safety Model

Real lab connectivity is fail-closed. The app only selects a real AHV lab adapter when all required switches and private configuration values are present.

Required controls:

- `APP_ENV=lab`
- `NDC_AHV_REAL_ADAPTER_ENABLED=true`
- `NDC_CONTROLLED_PROVISIONING_ENABLED=true`
- Provider-specific endpoint, username, password, and allowed UUIDs
- Platform Admin identity for real lifecycle API routes
- Read-only smoke before any lifecycle test

Lifecycle mutation is a second gate:

- Keep `NDC_AHV_LAB_LIFECYCLE_ENABLED=false` for connectivity and read-only inventory testing.
- Set `NDC_AHV_LAB_LIFECYCLE_ENABLED=true` only when the lab owner has authorized create, power, and destroy testing.

## Browser Connection Wizard

Use the wizard to:

1. Select Prism Element or Prism Central.
2. Enter the Prism URL, username, and password.
3. Enter allowed cluster, subnet/network, image, and project UUIDs where required.
4. Select insecure TLS only for an accepted lab certificate scenario.
5. Run **Test read-only connection**.
6. Copy the generated redacted `.env.lab` block for the lab deployment after the test passes.

The wizard runs read-only discovery only. It does not create, power, or destroy VMs.

## Create Private Lab Configuration

Generate a private `.env.lab` interactively:

```powershell
npm run lab:env -- -Provider prism-element
```

For Prism Central:

```powershell
npm run lab:env -- -Provider prism-central
```

The script writes `.env.lab`, which is ignored by Git. It prompts for credentials without echoing the password.

## Validate Connectivity

Run the combined readiness check:

```powershell
npm run validate:ahv-lab-readiness
```

This loads `.env.lab`, validates the configuration, and runs the provider-specific read-only smoke:

- Prism Element: `npm run smoke:ahv-pe-readonly`
- Prism Central: `npm run smoke:ahv-lab-readonly`

No create, power, or destroy call is made by this readiness check.

## Run The Lab API

Start the lab Compose profile:

```powershell
docker compose -f docker-compose.lab.yml up --build -d
```

Open:

```text
http://localhost:18080
```

The container listens on internal port `8080`; Compose publishes it to host port `18080` by default to avoid common Windows excluded-port reservations. Override it with `NDC_STUDIO_HOST_PORT` when required.

## Controlled Lifecycle Test

Only after read-only validation succeeds and the lab owner authorizes mutation:

1. Set `NDC_AHV_LAB_LIFECYCLE_ENABLED=true` in `.env.lab`.
2. Restart the lab API.
3. Create a dry-run VM sandbox plan.
4. Record lab authorization scope and rollback/destroy proof.
5. Approve the controlled provisioning gate.
6. Submit one `ndc-lab-*` VM create.
7. Poll the Prism task.
8. Power test only if allowed.
9. Destroy the VM.
10. Confirm inventory reconciliation and audit evidence.

## Tester Evidence To Capture

Ask testers to capture:

- NDC version and commit SHA.
- Provider: Prism Element or Prism Central.
- Read-only smoke output with private endpoint redacted.
- Whether lifecycle mutation was enabled.
- VM name, task UUIDs, and final destroy/reconciliation status for lifecycle tests.
- Any Prism API error code and endpoint path, with credentials redacted.

Do not publish private IPs, hostnames, usernames, screenshots containing customer data, or credentials.
