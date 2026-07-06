param(
  [string]$DataFile = ".data\ndc-studio.json",
  [int]$AuditRetentionEvents = 500,
  [int]$RateLimitPerMinute = 120,
  [string]$Repository = "json",
  [string]$PrismRealAdapter = "disabled",
  [string]$RequireTrustedIdentity = "false",
  [switch]$AllowPostgresScaffold
)

$ErrorActionPreference = "Stop"

function Assert-RelativeOrSafeAbsolutePath {
  param([string]$Path)

  if (-not $Path) {
    throw "DataFile is required."
  }

  $resolvedRoot = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
  $candidateParent = Split-Path -Parent $Path
  if (-not $candidateParent) {
    $candidateParent = "."
  }
  $resolvedParent = (Resolve-Path $candidateParent -ErrorAction SilentlyContinue)
  if ($resolvedParent) {
    $fullPath = Join-Path $resolvedParent.Path (Split-Path -Leaf $Path)
  } else {
    $fullPath = Join-Path $resolvedRoot $Path
  }

  $normalized = [System.IO.Path]::GetFullPath($fullPath)
  if ($normalized -notlike "$resolvedRoot*") {
    Write-Warning "Data file is outside the repository. Confirm backup and retention controls before production use: $normalized"
  }
}

Assert-RelativeOrSafeAbsolutePath -Path $DataFile

if ($AuditRetentionEvents -lt 500) {
  throw "NDC_AUDIT_RETENTION_EVENTS must be 500 or greater for the on-prem starter."
}

if ($RateLimitPerMinute -lt 1 -or $RateLimitPerMinute -gt 10000) {
  throw "NDC_RATE_LIMIT_PER_MINUTE must be between 1 and 10000."
}

if ($Repository -notin @("json", "postgres")) {
  throw "NDC_REPOSITORY must be json or postgres."
}

if ($Repository -eq "postgres" -and -not $AllowPostgresScaffold) {
  throw "Postgres is scaffolded only. Re-run with -AllowPostgresScaffold only for documentation validation."
}

if ($PrismRealAdapter -ne "disabled") {
  throw "NDC_PRISM_REAL_ADAPTER must remain disabled until an authorized adapter release."
}

if ($RequireTrustedIdentity -notin @("true", "false")) {
  throw "NDC_REQUIRE_TRUSTED_IDENTITY must be true or false."
}

Write-Output "On-prem configuration validation passed."
Write-Output "Repository: $Repository"
Write-Output "Data file: $DataFile"
Write-Output "Audit retention events: $AuditRetentionEvents"
Write-Output "Rate limit per minute: $RateLimitPerMinute"
Write-Output "Prism real adapter: $PrismRealAdapter"
Write-Output "Require trusted identity: $RequireTrustedIdentity"
