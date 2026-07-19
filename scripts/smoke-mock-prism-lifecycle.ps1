param(
  [string]$BaseUrl = "http://127.0.0.1:8080",
  [string]$PrismUrl = $env:NUTANIX_PRISM_CENTRAL_URL,
  [string]$EnvironmentName = "",
  [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"

if ($EnvFile) {
  Import-EnvFile $EnvFile
}

if (-not $PrismUrl) {
  $PrismUrl = $env:NUTANIX_PRISM_CENTRAL_URL
}
if (-not $PrismUrl) {
  $PrismUrl = "http://127.0.0.1:9440"
}
if (-not $EnvironmentName) {
  $EnvironmentName = "ndc-lab-mock-smoke-{0}" -f (Get-Date -Format "yyyyMMddHHmmss")
}
if ($EnvironmentName -notmatch "^ndc-lab-") {
  throw "EnvironmentName must start with ndc-lab-."
}

$ndcHeaders = @{
  "Content-Type" = "application/json"
  "x-ndc-user" = "platform.admin"
  "x-ndc-roles" = "Platform Admin"
}

function Invoke-NdcGet($Path) {
  Invoke-RestMethod -Method Get -Uri "$BaseUrl$Path" -Headers $ndcHeaders
}

function Invoke-NdcPost($Path, $Body = @{}) {
  try {
    Invoke-RestMethod -Method Post -Uri "$BaseUrl$Path" -Headers $ndcHeaders -Body ($Body | ConvertTo-Json -Depth 20)
  } catch {
    $detail = Read-ErrorBody $_
    throw "NDC POST $Path failed. $detail"
  }
}

function Read-ErrorBody($ErrorRecord) {
  $response = $ErrorRecord.Exception.Response
  if (-not $response) {
    return $ErrorRecord.Exception.Message
  }
  try {
    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    return $reader.ReadToEnd()
  } catch {
    return $ErrorRecord.Exception.Message
  }
}

function Invoke-PrismList($Path) {
  $base = $PrismUrl.TrimEnd("/")
  $username = $env:NUTANIX_PRISM_USERNAME
  if (-not $username) { $username = "mock-prism-user" }
  $password = $env:NUTANIX_PRISM_PASSWORD
  if (-not $password) { $password = "mock-prism-password" }
  $pair = "{0}:{1}" -f $username, $password
  $basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
  $headers = @{
    Authorization = "Basic $basic"
    Accept = "application/json"
    "Content-Type" = "application/json"
  }
  $body = @{ kind = "mock-prism-smoke"; length = 50; offset = 0 } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$base$Path" -Headers $headers -Body $body
}

$config = Invoke-NdcGet "/api/ahv/lab-runtime/config"
if (-not $config.data.provisioningEnabled) {
  throw "NDC AHV lab runtime is not enabled. Start NDC with .env.mock-prism values."
}

foreach ($path in @(
  "/api/nutanix/v3/clusters/list",
  "/api/nutanix/v3/projects/list",
  "/api/nutanix/v3/images/list",
  "/api/nutanix/v3/subnets/list",
  "/api/nutanix/v3/vms/list"
)) {
  Invoke-PrismList $path | Out-Null
}

$preflight = Invoke-NdcPost "/api/ahv/lab-runtime/preflight"
if ($preflight.data.status -ne "Ready") {
  throw "AHV lab runtime preflight was not Ready."
}

$plan = Invoke-NdcPost "/api/vm-sandbox/dry-runs" @{ environmentName = $EnvironmentName }
Invoke-NdcPost "/api/lab-authorization/scopes" @{
  name = "Mock Prism Central lifecycle smoke"
  pentestScopeReference = "mock-prism-local-scope"
  pentestScopeStructurallyValid = $true
  providerCoverage = @("NCI")
  targetEndpoints = @("mock-prism-central")
  evidenceReferences = @("fixtures/mock-prism/seed.json", "scripts/smoke-mock-prism-lifecycle.ps1")
  rollbackOwner = "Cloud Operations"
} | Out-Null
Invoke-NdcPost "/api/audit-exports" | Out-Null
Invoke-NdcPost "/api/vm-sandbox/rollback-destroy-proofs" @{
  dryRunPlanId = $plan.data.id
  backupEvidenceReference = "mock-prism-backup-reference"
  ownerNotificationReference = "mock-prism-owner-notification"
  inventoryReconciliationReference = "mock-prism-inventory-reconciliation"
  rollbackOwner = "Cloud Operations"
} | Out-Null
$gate = Invoke-NdcPost "/api/vm-sandbox/controlled-provisioning" @{ dryRunPlanId = $plan.data.id }
Invoke-NdcPost "/api/vm-sandbox/controlled-provisioning/$($gate.data.id)/approve" @{ evidence = "Mock Prism lifecycle smoke approval." } | Out-Null
Invoke-NdcPost "/api/vm-lifecycle/proofs" @{ gateId = $gate.data.id; rollbackVerified = $true; destroyVerified = $true } | Out-Null
$envelope = Invoke-NdcPost "/api/vm-sandbox/controlled-create-authorization"
if ($envelope.data.status -ne "Ready for authorization review") {
  $failed = @($envelope.data.checks | Where-Object { -not $_.passed } | ForEach-Object { "{0}: {1}" -f $_.name, $_.detail })
  throw "Controlled create authorization envelope was $($envelope.data.status). Failed checks: $($failed -join '; ')"
}

$run = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs" @{ gateId = $gate.data.id; action = "Create VM" }
if (-not $run.data.provisioningEnabled -or $run.data.adapterMode -ne "Lab AHV Prism adapter") {
  throw "Create run did not use the Lab AHV Prism adapter."
}

$polled = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/poll"
if ($polled.data.status -ne "Succeeded") {
  throw "Create task did not poll to Succeeded."
}

$powered = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/power" @{ powerState = "OFF" }
if ($powered.data.powerStatus -ne "Submitted") {
  throw "Power operation was not submitted."
}

$destroyed = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/destroy"
if ($destroyed.data.destroyStatus -ne "Submitted" -or $destroyed.data.inventoryReconciliation.status -ne "Reconciled") {
  throw "Destroy operation did not record reconciliation evidence."
}

$vms = Invoke-PrismList "/api/nutanix/v3/vms/list"
$remaining = @($vms.entities | Where-Object { $_.metadata.uuid -eq $run.data.vmUuid -or $_.spec.name -eq $EnvironmentName -or $_.status.name -eq $EnvironmentName })
if ($remaining.Count -gt 0) {
  throw "Mock Prism reconciliation failed: VM $EnvironmentName still exists."
}

Write-Output "Mock Prism lifecycle smoke passed for $EnvironmentName. Create task $($run.data.prismTaskUuid), poll $($polled.data.status), power task $($powered.data.prismTaskUuid), destroy task $($destroyed.data.prismTaskUuid), reconciliation confirmed."

function Import-EnvFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Env file not found: $Path"
  }
  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or $line -notmatch "=") {
      return
    }
    $parts = $line.Split("=", 2)
    [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
  }
}
