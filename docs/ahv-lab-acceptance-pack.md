# AHV Lab Acceptance Pack

This pack prepares NDC Studio for an authorized AHV test infrastructure validation. It is not a production rollout approval and does not enable real infrastructure mutation by itself.

## Acceptance Objective

Prove one complete, reversible AHV VM lifecycle through NDC Studio against an explicitly authorized Prism Central test environment:

1. Validate private lab configuration.
2. Confirm read-only Prism Central connectivity.
3. Create one `ndc-lab-*` VM from an approved image, project, subnet, and cluster.
4. Poll Prism task state to completion.
5. Perform an approved power-state action when lab policy allows it.
6. Destroy the VM.
7. Reconcile Prism inventory and prove the VM is removed.
8. Export redacted audit evidence.

## Required Authorization

- Written authorization for the Prism Central endpoint and AHV cluster.
- Confirmed disposable image UUID.
- Confirmed subnet/project/cluster UUIDs.
- Approved VM name prefix, default `ndc-lab-`.
- Platform Admin test operator.
- Rollback/destroy owner.
- Change window with start, stop, and abort criteria.
- Confirmation that no production workload, customer data, or regulated data is in scope.

## Configuration Evidence

Required private environment variables:

```text
APP_ENV=lab
NDC_AHV_REAL_ADAPTER_ENABLED=true
NDC_CONTROLLED_PROVISIONING_ENABLED=true
NDC_AHV_LAB_LIFECYCLE_ENABLED=true
NUTANIX_PRISM_CENTRAL_URL=<private-prism-central-url>
NUTANIX_PRISM_USERNAME=<private-user>
NUTANIX_PRISM_PASSWORD=<private-password>
NDC_AHV_ALLOWED_CLUSTER_UUID=<authorized-cluster-uuid>
NDC_AHV_ALLOWED_PROJECT_UUID=<authorized-project-uuid>
NDC_AHV_ALLOWED_SUBNET_UUID=<authorized-subnet-uuid>
NDC_AHV_ALLOWED_IMAGE_UUID=<authorized-image-uuid>
NDC_AHV_VM_NAME_PREFIX=ndc-lab-
```

Optional private environment variables:

```text
NDC_AHV_MAX_CPU=4
NDC_AHV_MAX_MEMORY_GB=16
NDC_AHV_MAX_DISK_GB=160
NDC_AHV_DEFAULT_EXPIRY_HOURS=24
NODE_EXTRA_CA_CERTS=<path-to-prism-ca.pem>
```

Do not commit `.env.lab`, passwords, endpoint credentials, CA private keys, screenshots with hostnames, or Prism inventory containing private/customer data.

## Acceptance Sequence

Run these from the management/test VM.

```powershell
npm install
npm run validate:ahv-lab-config
npm run smoke:ahv-lab-readonly
npm run smoke:ahv-lab-lifecycle -- -BaseUrl http://127.0.0.1:18080 -EnvironmentName ndc-lab-acceptance-01
```

The lifecycle smoke is opt-in. Do not run it until the lab authorization, rollback owner, and operator window are approved.

## Evidence To Capture

- Validation command output.
- Read-only smoke output.
- Lifecycle smoke output.
- Prism task UUIDs.
- VM UUID.
- Create, poll, power, and destroy statuses.
- Inventory reconciliation result.
- Redacted audit export manifest.
- Screenshots that show only lab-safe names and no private hostnames or customer data.
- Final go/no-go decision and residual risks.

## Go / No-Go Criteria

Go only when:

- All required private configuration is present.
- Trusted identity or approved local lab bypass is documented.
- Read-only Prism checks pass.
- Rollback/destroy path is available and assigned.
- Audit redaction is confirmed.
- Only one `ndc-lab-*` VM will be created.

No-go when:

- Prism Central scope is unclear.
- The image, subnet, project, or cluster UUID is not disposable/test scoped.
- TLS trust is not understood.
- A destroy path is unavailable.
- Screenshots or audit evidence would expose private infrastructure or customer data.
- Any lifecycle command would target a production-like name.

## Closure

Acceptance is complete only after:

- The VM is destroyed.
- Inventory reconciliation confirms the VM is absent.
- Audit evidence is exported and redacted.
- The operator, rollback owner, and platform reviewer sign off in the acceptance report.
