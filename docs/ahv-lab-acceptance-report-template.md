# AHV Lab Acceptance Report Template

## Summary

- Test window:
- Operator:
- Platform reviewer:
- Rollback/destroy owner:
- Prism Central endpoint reference:
- AHV cluster reference:
- Environment name:

## Authorization

- Lab authorization reference:
- Approved scope:
- Excluded systems:
- Change window:
- Abort criteria:

## Configuration

- `APP_ENV=lab` confirmed:
- Real AHV adapter switch confirmed:
- Controlled provisioning switch confirmed:
- Lab lifecycle switch confirmed:
- Allowed cluster UUID reference:
- Allowed project UUID reference:
- Allowed subnet UUID reference:
- Allowed image UUID reference:
- VM name prefix:
- TLS trust mode:

## Command Evidence

```text
validate:ahv-lab-config output:

smoke:ahv-lab-readonly output:

smoke:ahv-lab-lifecycle output:
```

## Lifecycle Evidence

- Dry-run plan ID:
- Lab authorization scope ID:
- Rollback/destroy proof ID:
- Controlled provisioning gate ID:
- VM lifecycle proof ID:
- Controlled create authorization envelope ID:
- AHV run ID:
- Prism create task UUID:
- VM UUID:
- Power task UUID:
- Destroy task UUID:
- Inventory reconciliation result:

## Audit And Redaction

- Audit export reference:
- Redaction confirmed:
- Screenshots reviewed:
- No private hostnames/customer data exposed:

## Decision

- Result: Go / No-Go / Conditional Go
- Residual risks:
- Required follow-ups:
- Operator sign-off:
- Reviewer sign-off:
- Closure timestamp:
