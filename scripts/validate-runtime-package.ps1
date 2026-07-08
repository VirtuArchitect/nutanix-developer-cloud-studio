param(
  [string]$DockerfilePath = "Dockerfile",
  [string]$ComposeFile = "docker-compose.yml",
  [string]$EnvExample = ".env.example"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Assert-FileContains {
  param(
    [string]$Path,
    [string]$Pattern,
    [string]$Message
  )

  if (-not (Test-Path $Path)) {
    throw "Required file not found: $Path"
  }

  $content = Get-Content -Raw -LiteralPath $Path
  if ($content -notmatch $Pattern) {
    throw $Message
  }
}

$package = Get-Content -Raw -LiteralPath "package.json" | ConvertFrom-Json
if (-not $package.scripts.'api:start') {
  throw "package.json must define api:start for on-prem runtime startup."
}

if (-not $package.scripts.build) {
  throw "package.json must define build for static frontend packaging."
}

Assert-FileContains -Path $DockerfilePath -Pattern "npm run build:all" -Message "Dockerfile must build frontend, server, and tests through build:all."
Assert-FileContains -Path $DockerfilePath -Pattern "NDC_STATIC_DIR=/app/dist" -Message "Dockerfile must serve the built static frontend from /app/dist."
Assert-FileContains -Path $DockerfilePath -Pattern "npm.*api:start" -Message "Dockerfile must start the API runtime."

Assert-FileContains -Path $ComposeFile -Pattern "NDC_PRISM_REAL_ADAPTER:\s*disabled" -Message "Compose must keep NDC_PRISM_REAL_ADAPTER disabled."
Assert-FileContains -Path $ComposeFile -Pattern "NDC_REPOSITORY:\s*json" -Message "Compose must default to JSON repository mode."
Assert-FileContains -Path $ComposeFile -Pattern "healthcheck:" -Message "Compose must include a healthcheck."
Assert-FileContains -Path $ComposeFile -Pattern "/healthz" -Message "Compose healthcheck must call /healthz."

Assert-FileContains -Path $EnvExample -Pattern "NDC_PRISM_REAL_ADAPTER=disabled" -Message ".env.example must keep the real Prism adapter disabled."
Assert-FileContains -Path $EnvExample -Pattern "NDC_DATA_FILE=" -Message ".env.example must define NDC_DATA_FILE."
Assert-FileContains -Path $EnvExample -Pattern "NUTANIX_MOCK_PRISM_CENTRAL_URL=" -Message ".env.example must define the mock Prism URL."

if (-not (Test-Path "scripts\backup-state.ps1") -or -not (Test-Path "scripts\restore-state.ps1")) {
  throw "Backup and restore scripts must be present for on-prem state operations."
}

Write-Output "Runtime package validation passed."
Write-Output "Dockerfile: $DockerfilePath"
Write-Output "Compose file: $ComposeFile"
Write-Output "Environment template: $EnvExample"
