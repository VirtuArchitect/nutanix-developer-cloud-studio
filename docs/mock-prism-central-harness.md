# Mock Prism Central Harness

The mock Prism Central harness lets operators test NDC Studio's AHV lifecycle path without a Nutanix test cluster.

It is a standalone local HTTP service that speaks the Prism Central v3 endpoint shapes used by the AHV lab adapter:

- cluster, project, image, subnet, and VM list endpoints
- VM create endpoint
- task poll endpoint
- VM power transition endpoint
- VM delete endpoint

The harness uses fixture data from `fixtures/mock-prism/seed.json` and stores runtime VM/task state in memory.

## Safety Boundary

- The mock harness does not contact Nutanix infrastructure.
- The public GitHub Pages demo remains static/browser mock mode.
- Real AHV lifecycle remains disabled by default in `.env.example` and `.env.lab.example`.
- The mock-backed path still requires `APP_ENV=lab`, AHV lifecycle switches, and Platform Admin API calls so it exercises the same NDC control flow as the real lab path.
- VM names must use the `ndc-lab-` prefix.

## Run With Docker Compose

Copy the mock environment template:

```powershell
Copy-Item .env.mock-prism.example .env.mock-prism
```

Start NDC Studio and mock Prism Central:

```powershell
docker compose -f docker-compose.mock-prism.yml --env-file .env.mock-prism up --build
```

Open NDC Studio:

```text
http://127.0.0.1:8080
```

Mock Prism Central listens locally on:

```text
http://127.0.0.1:9440
```

## Validate Mock Prism

Run the read-only config and fixture check:

```powershell
npm run validate:mock-prism-config -- -EnvFile .env.mock-prism -PrismUrl http://127.0.0.1:9440
```

This calls only list endpoints and verifies that configured UUIDs exist in fixture data.

## Run Lifecycle Smoke

Run the full mock-backed lifecycle smoke:

```powershell
npm run smoke:mock-prism-lifecycle -- -BaseUrl http://127.0.0.1:8080 -PrismUrl http://127.0.0.1:9440
```

The smoke performs:

1. NDC AHV lab runtime config check.
2. Mock Prism read-only inventory calls.
3. NDC AHV preflight.
4. VM dry-run creation.
5. Lab authorization scope recording.
6. Rollback/destroy proof recording.
7. Controlled provisioning gate approval.
8. VM lifecycle proof recording.
9. Controlled create authorization envelope recording.
10. Mock-backed AHV create run.
11. Prism task poll.
12. VM power transition.
13. VM destroy.
14. Mock Prism VM inventory reconciliation.

## Fixture UUIDs

The default mock environment uses:

```text
NDC_AHV_ALLOWED_CLUSTER_UUID=mock-cluster-uuid
NDC_AHV_ALLOWED_PROJECT_UUID=mock-project-uuid
NDC_AHV_ALLOWED_SUBNET_UUID=mock-subnet-uuid
NDC_AHV_ALLOWED_IMAGE_UUID=mock-image-uuid
```

These values must match `fixtures/mock-prism/seed.json`.

## Next Phase

After the mock harness is stable, `v9.0.0-ahv-lab-acceptance` should repeat the same lifecycle smoke against an explicitly authorized Prism Central test environment with disposable AHV resources.
