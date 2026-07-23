# AHV Lab Lifecycle Testing

This guide describes the first lab-only real AHV lifecycle path for NDC Studio.

The feature is disabled by default. Enable it only for an explicitly authorized AHV test cluster with disposable image, project, subnet, and rollback ownership.

If no AHV test cluster is available yet, use the local mock Prism Central harness first. It exercises the same NDC create, poll, power, destroy, and reconciliation workflow without contacting Nutanix infrastructure. See `docs/mock-prism-central-harness.md`.

Before any real AHV lifecycle smoke, complete the formal acceptance checklist in `docs/ahv-lab-acceptance-pack.md` and capture results in `docs/ahv-lab-acceptance-report-template.md`.

## Deployment

1. Copy `.env.lab.example` to `.env.lab` on the private lab host.
2. Fill in Prism Central endpoint, username, password, and allowed UUIDs.
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

## Lifecycle Path

The API keeps the existing gated workflow:

1. Create VM sandbox dry-run.
2. Record lab authorization scope.
3. Record rollback/destroy proof.
4. Request and approve controlled provisioning gate.
5. Record VM lifecycle proof.
6. Record controlled create authorization envelope.
7. Submit AHV create run.
8. Poll Prism task.
9. Optionally submit power transition.
10. Submit destroy and record inventory reconciliation.

## Guardrails

- Real AHV lifecycle routes require `Platform Admin`.
- VM names must use the `ndc-lab-` prefix.
- Production-like names are blocked.
- CPU, memory, and disk quotas are enforced.
- Only configured cluster, project, subnet, and image UUIDs are allowed.
- Secrets are accepted only through private deployment environment variables.
- Passwords, tokens, and Authorization headers must not appear in API responses, audit metadata, docs, or committed files.
