param(
  [string]$HostName = "127.0.0.1",
  [int]$Port = 18098
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$dataFile = Join-Path $repoRoot ".data\validate-hosted-starter.json"
$baseUrl = "http://${HostName}:${Port}"

if (Test-Path $dataFile) {
  Remove-Item -LiteralPath $dataFile -Force
}

$job = Start-Job -ScriptBlock {
  param($repoRoot, $dataFile, $HostName, $Port)
  Set-Location $repoRoot
  $env:HOST = $HostName
  $env:PORT = [string]$Port
  $env:NDC_STATIC_DIR = "dist"
  $env:NDC_DATA_FILE = $dataFile
  npm.cmd run api:start
} -ArgumentList $repoRoot, $dataFile, $HostName, $Port

try {
  Start-Sleep -Seconds 5

  $health = Invoke-RestMethod -Uri "$baseUrl/healthz"
  $ready = Invoke-RestMethod -Uri "$baseUrl/readyz"
  $session = Invoke-RestMethod -Uri "$baseUrl/api/session"
  $systemStatus = Invoke-RestMethod -Uri "$baseUrl/api/system/status"
  $configs = Invoke-RestMethod -Uri "$baseUrl/api/integration-config"
  $labAdapters = Invoke-RestMethod -Uri "$baseUrl/api/lab-adapters"
  $provisioningAdapters = Invoke-RestMethod -Uri "$baseUrl/api/provisioning/adapters"

  if (-not $health.data.ok) {
    throw "Health check failed."
  }

  if (-not $ready.data.ready) {
    throw "Readiness check failed."
  }

  if (-not $session.data.roles -or $session.data.roles -notcontains "Platform Admin") {
    throw "Session role check failed."
  }

  if (-not $configs.data -or $configs.data.Count -lt 1) {
    throw "Integration configuration check failed."
  }

  if ($systemStatus.data.provisioningEnabled -ne $true) {
    throw "Simulated provisioning feature check failed."
  }

  if (-not $labAdapters.data -or $labAdapters.data.Count -lt 1) {
    throw "Lab adapter check failed."
  }

  $realProvisioningAdapters = @($provisioningAdapters.data | Where-Object { $_.provisioningEnabled -ne $false })
  if ($realProvisioningAdapters.Count -gt 0) {
    throw "Real adapter provisioning guardrail check failed."
  }

  Write-Output "Hosted starter validation passed at $baseUrl"
}
finally {
  Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
  Receive-Job $job -ErrorAction SilentlyContinue | Out-String | Write-Output
  Remove-Job $job -Force -ErrorAction SilentlyContinue

  if (Test-Path $dataFile) {
    Remove-Item -LiteralPath $dataFile -Force
  }
}
