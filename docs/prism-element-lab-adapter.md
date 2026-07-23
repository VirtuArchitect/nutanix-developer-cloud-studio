# Prism Element Lab Adapter

`v9.1.0-prism-element-lab-adapter` adds a lab-only Prism Element provider path for a one-node AHV cluster / Prism Element test environment.

This path is useful when Prism Central is not available yet but a disposable AHV/PE lab can validate core VM lifecycle behavior.

## Scope

The PE lab adapter can support:

- Cluster information discovery.
- Image discovery.
- Network/subnet discovery.
- VM inventory discovery.
- Controlled create of one `ndc-lab-*` VM.
- Task polling.
- Power state transition.
- Destroy/delete.
- Inventory reconciliation evidence.

The PE lab adapter does not replace Prism Central governance:

- Project scoping may be unavailable or reduced.
- Multi-cluster governance is not in scope.
- NKP, NDB, NUS, NAI, NCM, quota, category, and policy behavior may remain simulated until those services are available.

## Required Private Configuration

Use private environment variables only. Do not commit `.env.lab` or real values.

```text
APP_ENV=lab
NDC_AHV_LAB_PROVIDER=prism-element
NDC_AHV_REAL_ADAPTER_ENABLED=true
NDC_AHV_PE_LAB_ADAPTER_ENABLED=true
NDC_CONTROLLED_PROVISIONING_ENABLED=true
NDC_AHV_LAB_LIFECYCLE_ENABLED=true
NUTANIX_PRISM_ELEMENT_URL=<private-prism-element-url>
NUTANIX_PRISM_ELEMENT_USERNAME=<private-user>
NUTANIX_PRISM_ELEMENT_PASSWORD=<private-password>
NDC_AHV_PE_ALLOWED_CLUSTER_UUID=<authorized-pe-cluster-uuid>
NDC_AHV_PE_ALLOWED_SUBNET_UUID=<authorized-pe-network-uuid>
NDC_AHV_PE_ALLOWED_IMAGE_UUID=<authorized-pe-image-uuid>
NDC_AHV_VM_NAME_PREFIX=ndc-lab-
```

Optional:

```text
NDC_PRISM_TLS_INSECURE=true
NODE_EXTRA_CA_CERTS=<path-to-prism-ca.pem>
NDC_AHV_MAX_CPU=4
NDC_AHV_MAX_MEMORY_GB=16
NDC_AHV_MAX_DISK_GB=160
NDC_AHV_DEFAULT_EXPIRY_HOURS=24
```

Prefer a trusted CA. Use insecure TLS only for lab mode when the certificate path is understood and accepted.

## Read-Only Validation

Run configuration validation first:

```powershell
npm run validate:ahv-lab-config
```

Run PE read-only smoke:

```powershell
npm run smoke:ahv-pe-readonly
```

The read-only smoke calls only:

```text
/PrismGateway/services/rest/v2.0/cluster
/PrismGateway/services/rest/v2.0/images
/PrismGateway/services/rest/v2.0/networks
/PrismGateway/services/rest/v2.0/vms
```

It does not create, power, or destroy VMs.

## Controlled Lifecycle

Use the existing NDC gated lifecycle:

1. Create VM sandbox dry-run.
2. Record lab authorization scope.
3. Record rollback/destroy proof.
4. Approve controlled provisioning gate.
5. Record VM lifecycle proof.
6. Record controlled create authorization envelope.
7. Submit AHV controlled provisioning run.
8. Poll task.
9. Power action if approved.
10. Destroy and reconcile inventory.

The API chooses the PE adapter only when `NDC_AHV_LAB_PROVIDER=prism-element` and all PE/lifecycle switches are enabled.

## Secret Handling

- PE endpoint and credentials are supplied by private environment variables only.
- Credentials are never returned to the frontend.
- Audit evidence stores adapter mode, task UUIDs, VM UUID, and status only.
- Do not commit screenshots showing private hostnames, private IP addresses, credentials, or customer data.
