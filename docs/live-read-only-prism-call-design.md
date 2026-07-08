# Live Read-Only Prism Call Design

## Status

Design only. The implementation does not make live Prism Central calls.

## Allowed Future Operations

- `listClusters`
- `listProjects`
- `listImages`
- `listSubnets`
- `listCategories`
- `listVms`

All operations are read-only inventory calls. Mutation operations such as VM create, clone, power, resize, delete, project create, image delete, or network update remain excluded.

## Required Gates Before Any Live Call

- Approved read-only lab scope.
- Credential reference stored outside NDC Studio.
- Security review completed.
- Penetration test scope approved.
- Rollback and emergency stop runbook accepted.
- Real mutation operations explicitly excluded.

## Runtime Boundary

The API endpoint `/api/prism/live-read-only-design` returns this contract as metadata. It reports `provisioningEnabled=false` and `realPrismCallsEnabled=false`.

No Authorization header, credential value, Prism Central hostname secret, or response payload from a live environment is stored by this prototype.
