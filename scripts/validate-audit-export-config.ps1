param(
  [string]$DestinationRef = "",
  [int]$RetentionEvents = 500
)

$ErrorActionPreference = "Stop"

if ($RetentionEvents -lt 500) {
  throw "NDC_AUDIT_RETENTION_EVENTS must be 500 or greater."
}

if ($DestinationRef) {
  if ($DestinationRef -match "://[^/]*@") {
    throw "Audit export destination references must not include embedded auth material."
  }

  if ($DestinationRef -match "[?&](key|sig|credential)=") {
    throw "Audit export destination references must not include signed query material."
  }
}

Write-Output "Audit export configuration validation passed."
Write-Output "Retention events: $RetentionEvents"
Write-Output "Destination configured: $([bool]$DestinationRef)"
