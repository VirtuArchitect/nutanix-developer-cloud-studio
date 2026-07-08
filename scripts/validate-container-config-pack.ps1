param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..").Path
)

$ErrorActionPreference = "Stop"

function Assert-FileContains {
  param(
    [string]$Path,
    [string]$Pattern,
    [string]$Message
  )

  $fullPath = Join-Path $Root $Path
  if (!(Test-Path -LiteralPath $fullPath)) {
    throw "Missing required file: $Path"
  }

  $content = Get-Content -LiteralPath $fullPath -Raw
  if ($content -notmatch $Pattern) {
    throw $Message
  }
}

Assert-FileContains -Path ".env.example" -Pattern "NDC_PRISM_REAL_ADAPTER=disabled" -Message ".env.example must keep the real Prism adapter disabled."
Assert-FileContains -Path ".env.example" -Pattern "NDC_REQUIRE_TRUSTED_IDENTITY" -Message ".env.example must document trusted identity mode."
Assert-FileContains -Path "Dockerfile" -Pattern "HEALTHCHECK|/healthz" -Message "Dockerfile must define a health check."
Assert-FileContains -Path "docker-compose.yml" -Pattern "NDC_PRISM_REAL_ADAPTER:\s*disabled" -Message "docker-compose.yml must keep real Prism adapter disabled."
Assert-FileContains -Path "docs\on-prem-deployment.md" -Pattern "NDC_PRISM_REAL_ADAPTER=disabled" -Message "On-prem deployment docs must preserve the disabled real adapter guardrail."
Assert-FileContains -Path "docs\operator-runbook.md" -Pattern "Emergency stop|Rollback" -Message "Operator runbook must include emergency stop or rollback guidance."
Assert-FileContains -Path "docs\rollback-pack.md" -Pattern "rollback|restore" -Message "Rollback pack must include rollback or restore guidance."

Write-Host "Container/config validation pack passed."
