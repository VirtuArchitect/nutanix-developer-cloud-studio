param(
  [string]$BaseUrl = "http://127.0.0.1:18080",
  [string]$EnvironmentName = "",
  [string]$ClusterName = "Authorized AHV Lab Cluster",
  [string]$NetworkName = "Authorized AHV Lab Network",
  [string]$SourceVmName = "Authorized Source VM"
)

$ErrorActionPreference = "Stop"

if ($env:NDC_AHV_LAB_LIFECYCLE_ENABLED -ne "true") {
  throw "Refusing to run source VM clone smoke unless NDC_AHV_LAB_LIFECYCLE_ENABLED=true."
}

if (-not $EnvironmentName) {
  $EnvironmentName = "ndc-lab-source-clone-{0}" -f (Get-Date -Format "yyyyMMddHHmmss")
}
if ($EnvironmentName -notmatch "^ndc-lab-") {
  throw "EnvironmentName must start with ndc-lab-."
}

$provider = if ($env:NDC_AHV_LAB_PROVIDER -eq "prism-element") { "prism-element" } else { "prism-central" }
$providerLabel = if ($provider -eq "prism-element") { "Prism Element" } else { "Prism Central" }
$endpoint = if ($provider -eq "prism-element") { $env:NUTANIX_PRISM_ELEMENT_URL } else { $env:NUTANIX_PRISM_CENTRAL_URL }
$clusterUuid = if ($provider -eq "prism-element") { $env:NDC_AHV_PE_ALLOWED_CLUSTER_UUID } else { $env:NDC_AHV_ALLOWED_CLUSTER_UUID }
$subnetUuid = if ($provider -eq "prism-element") { $env:NDC_AHV_PE_ALLOWED_SUBNET_UUID } else { $env:NDC_AHV_ALLOWED_SUBNET_UUID }
$sourceVmUuid = if ($provider -eq "prism-element") { $env:NDC_AHV_PE_ALLOWED_SOURCE_VM_UUID } else { $env:NDC_AHV_ALLOWED_SOURCE_VM_UUID }

if (-not $endpoint -or -not $clusterUuid -or -not $subnetUuid -or -not $sourceVmUuid) {
  throw "Endpoint, allowed cluster UUID, allowed subnet/network UUID, and allowed source VM UUID must be configured in private environment variables."
}

$endpointHost = "configured-lab-endpoint"
try {
  $endpointHost = ([Uri]$endpoint).Host
} catch {
  $endpointHost = "configured-lab-endpoint"
}

$headers = @{
  "Content-Type" = "application/json"
  "x-ndc-user" = "platform.admin"
  "x-ndc-roles" = "Platform Admin"
}

function Invoke-NdcGet($Path) {
  Invoke-RestMethod -Method Get -Uri "$BaseUrl$Path" -Headers $headers
}

function Invoke-NdcPost($Path, $Body = @{}) {
  try {
    Invoke-RestMethod -Method Post -Uri "$BaseUrl$Path" -Headers $headers -Body ($Body | ConvertTo-Json -Depth 20)
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

$runtime = Invoke-NdcGet "/api/ahv/lab-runtime/config"
if (-not $runtime.data.provisioningEnabled) {
  throw "NDC AHV lab runtime is not enabled. Check APP_ENV, adapter switches, credentials, and allowed UUIDs."
}
if ($runtime.data.provider -ne $provider) {
  throw "NDC AHV lab runtime provider mismatch. Expected $provider but API returned $($runtime.data.provider)."
}

$importedAt = (Get-Date).ToUniversalTime().ToString("o")
$clusterRecordId = "lab-source-clone-cluster"
$networkRecordId = "lab-source-clone-network"
$sourceVmRecordId = "lab-source-clone-vm"
$records = @(
  @{
    id = $clusterRecordId
    kind = "Cluster"
    name = $ClusterName
    source = $providerLabel
    cluster = $ClusterName
    categories = @("Lab:Authorized", "Provider:AHV")
    importedAt = $importedAt
    rawRef = "prism://cluster/$clusterUuid"
    approvalStatus = "Discovered"
  },
  @{
    id = $networkRecordId
    kind = "Network"
    name = $NetworkName
    source = $providerLabel
    cluster = $ClusterName
    network = $NetworkName
    categories = @("Lab:Authorized", "Network:Controlled")
    importedAt = $importedAt
    rawRef = "prism://subnet/$subnetUuid"
    approvalStatus = "Discovered"
  },
  @{
    id = $sourceVmRecordId
    kind = "VM"
    name = $SourceVmName
    source = $providerLabel
    cluster = $ClusterName
    network = $NetworkName
    powerState = "Off"
    categories = @("Lab:Authorized", "CloneSource:Approved")
    importedAt = $importedAt
    rawRef = "prism://vm/$sourceVmUuid"
    approvalStatus = "Discovered"
  }
)

Invoke-NdcPost "/api/prism/inventory/preview-import" @{
  provider = $provider
  endpointHost = $endpointHost
  records = $records
} | Out-Null
Invoke-NdcPost "/api/prism/inventory/$clusterRecordId/approve" | Out-Null
Invoke-NdcPost "/api/prism/inventory/$networkRecordId/approve" | Out-Null
Invoke-NdcPost "/api/prism/inventory/$sourceVmRecordId/approve" | Out-Null
Invoke-NdcPost "/api/ahv/lab-runtime/preflight" | Out-Null

$plan = Invoke-NdcPost "/api/vm-sandbox/dry-runs" @{ environmentName = $EnvironmentName }
Invoke-NdcPost "/api/lab-authorization/scopes" @{
  name = "Source VM clone lifecycle smoke"
  pentestScopeReference = $(if ($env:NDC_AUTHORIZED_PENTEST_SCOPE_REF) { $env:NDC_AUTHORIZED_PENTEST_SCOPE_REF } else { "authorized-source-vm-clone-lab-scope" })
  pentestScopeStructurallyValid = $true
  providerCoverage = @("NCI")
  targetEndpoints = @($endpointHost)
  evidenceReferences = @("scripts/smoke-ahv-source-vm-clone.ps1")
  rollbackOwner = "Cloud Operations"
} | Out-Null
Invoke-NdcPost "/api/audit-exports" | Out-Null
Invoke-NdcPost "/api/vm-sandbox/rollback-destroy-proofs" @{
  dryRunPlanId = $plan.data.id
  backupEvidenceReference = "source-vm-clone-backup-reference"
  ownerNotificationReference = "source-vm-clone-owner-notification"
  inventoryReconciliationReference = "source-vm-clone-inventory-reconciliation"
  rollbackOwner = "Cloud Operations"
} | Out-Null

$gate = Invoke-NdcPost "/api/vm-sandbox/controlled-provisioning" @{ dryRunPlanId = $plan.data.id }
Invoke-NdcPost "/api/vm-sandbox/controlled-provisioning/$($gate.data.id)/approve" @{ evidence = "Authorized source VM clone smoke approval." } | Out-Null
Invoke-NdcPost "/api/vm-lifecycle/proofs" @{ gateId = $gate.data.id; rollbackVerified = $true; destroyVerified = $true } | Out-Null
$envelope = Invoke-NdcPost "/api/vm-sandbox/controlled-create-authorization"
if ($envelope.data.status -ne "Ready for authorization review") {
  $failed = @($envelope.data.checks | Where-Object { -not $_.passed } | ForEach-Object { "{0}: {1}" -f $_.name, $_.detail })
  throw "Controlled create authorization envelope was $($envelope.data.status). Failed checks: $($failed -join '; ')"
}

$run = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs" @{
  gateId = $gate.data.id
  action = "Clone VM"
  clusterRecordId = $clusterRecordId
  networkRecordId = $networkRecordId
  sourceVmRecordId = $sourceVmRecordId
}
if (-not $run.data.provisioningEnabled -or -not $run.data.selectedScope.sourceVm) {
  throw "Create run did not use the approved source VM clone path."
}

$polled = $null
for ($attempt = 1; $attempt -le 30; $attempt++) {
  $polled = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/poll"
  if ($polled.data.status -eq "Succeeded") {
    break
  }
  if ($polled.data.status -eq "Failed") {
    throw "Create task failed before power/destroy. $($polled.data.failureReason)"
  }
  Start-Sleep -Seconds 2
}

if (-not $polled -or $polled.data.status -ne "Succeeded") {
  throw "Create task did not reach Succeeded before the smoke timeout."
}

$powered = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/power" @{ powerState = "OFF" }
$destroyed = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/destroy"

Write-Output "AHV source VM clone smoke submitted $($run.data.adapterMode) create task $($run.data.prismTaskUuid), poll status $($polled.data.status), power status $($powered.data.powerStatus), destroy status $($destroyed.data.destroyStatus), reconciliation $($destroyed.data.inventoryReconciliation.status)."
