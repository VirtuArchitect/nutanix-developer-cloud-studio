param(
  [string]$ProfileDirectory = "docs\on-prem-profiles"
)

$ErrorActionPreference = "Stop"

$requiredProfiles = @(
  "on-prem-json.env.example",
  "on-prem-postgres.env.example",
  "lab-prep.env.example"
)

if (-not (Test-Path $ProfileDirectory)) {
  throw "On-prem profile directory not found: $ProfileDirectory"
}

foreach ($profile in $requiredProfiles) {
  $path = Join-Path $ProfileDirectory $profile
  if (-not (Test-Path $path)) {
    throw "Missing on-prem profile template: $path"
  }

  $content = Get-Content -Raw -LiteralPath $path
  foreach ($required in @("NDC_PRISM_READONLY_HTTP_ENABLED=false", "NDC_PRISM_REAL_ADAPTER=disabled", "NDC_AUDIT_SIGNING_KEY_REF")) {
    if ($content -notmatch [regex]::Escape($required)) {
      throw "$profile is missing required setting: $required"
    }
  }

  if ($content -match "(password|token|secret)\s*=\s*[^#\r\n]+") {
    throw "$profile appears to contain inline secret material."
  }
}

Write-Output "On-prem profile pack validation passed."
Write-Output "Profile templates: $($requiredProfiles.Count)"
