param(
  [string]$BaseUrl = "http://127.0.0.1:18080",
  [string]$EnvironmentName = "ndc-lab-smoke-01"
)

$ErrorActionPreference = "Stop"

if ($env:NDC_AHV_LAB_LIFECYCLE_ENABLED -ne "true") {
  throw "Refusing to run lifecycle smoke unless NDC_AHV_LAB_LIFECYCLE_ENABLED=true."
}

$headers = @{
  "Content-Type" = "application/json"
  "x-ndc-user" = "platform.admin"
  "x-ndc-roles" = "Platform Admin"
}

function Invoke-NdcPost($Path, $Body = @{}) {
  try {
    Invoke-RestMethod -Method Post -Uri "$BaseUrl$Path" -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10)
  } catch {
    $response = $_.Exception.Response
    if ($response) {
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      throw "NDC POST $Path failed. $($reader.ReadToEnd())"
    }
    throw
  }
}

Invoke-NdcPost "/api/ahv/lab-runtime/preflight" | Out-Null
$plan = Invoke-NdcPost "/api/vm-sandbox/dry-runs" @{ environmentName = $EnvironmentName }
Invoke-NdcPost "/api/lab-authorization/scopes" @{
  pentestScopeReference = $env:NDC_AUTHORIZED_PENTEST_SCOPE_REF
  pentestScopeStructurallyValid = $true
  providerCoverage = @("NCI")
  targetEndpoints = @("prism-central-ref")
  evidenceReferences = @($env:NDC_AUTHORIZED_PENTEST_SCOPE_REF)
  rollbackOwner = "Cloud Operations"
} | Out-Null
Invoke-NdcPost "/api/audit-exports" | Out-Null
Invoke-NdcPost "/api/vm-sandbox/rollback-destroy-proofs" @{
  dryRunPlanId = $plan.data.id
  backupEvidenceReference = "lab-backup-reference"
  ownerNotificationReference = "lab-owner-notification"
  inventoryReconciliationReference = "lab-inventory-reconciliation"
  rollbackOwner = "Cloud Operations"
} | Out-Null
$gate = Invoke-NdcPost "/api/vm-sandbox/controlled-provisioning" @{ dryRunPlanId = $plan.data.id }
Invoke-NdcPost "/api/vm-sandbox/controlled-provisioning/$($gate.data.id)/approve" @{ evidence = "Lifecycle smoke approval." } | Out-Null
Invoke-NdcPost "/api/vm-lifecycle/proofs" @{ gateId = $gate.data.id; rollbackVerified = $true; destroyVerified = $true } | Out-Null
Invoke-NdcPost "/api/vm-sandbox/controlled-create-authorization" | Out-Null
$run = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs" @{ gateId = $gate.data.id; action = "Create VM" }
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
for ($attempt = 1; $attempt -le 30; $attempt++) {
  $powered = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/poll"
  if ($powered.data.powerStatus -eq "Succeeded") {
    break
  }
  if ($powered.data.powerStatus -eq "Failed" -or $powered.data.status -eq "Failed") {
    throw "Power task failed before destroy. $($powered.data.failureReason)"
  }
  Start-Sleep -Seconds 2
}
if ($powered.data.powerStatus -ne "Succeeded") {
  throw "Power task did not reach Succeeded before the smoke timeout."
}

$destroyed = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/destroy"
for ($attempt = 1; $attempt -le 30; $attempt++) {
  $destroyed = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/poll"
  if ($destroyed.data.status -eq "Destroyed" -and $destroyed.data.inventoryReconciliation.status -eq "Reconciled") {
    break
  }
  if ($destroyed.data.status -eq "Failed" -or $destroyed.data.destroyStatus -eq "Failed") {
    throw "Destroy task failed or reconciliation did not pass. $($destroyed.data.failureReason)"
  }
  Start-Sleep -Seconds 2
}
if ($destroyed.data.status -ne "Destroyed" -or $destroyed.data.inventoryReconciliation.status -ne "Reconciled") {
  throw "Destroy task did not reach Destroyed/Reconciled before the smoke timeout."
}

Write-Output "AHV lab lifecycle smoke submitted create task $($run.data.prismTaskUuid), create status $($polled.data.status), power status $($powered.data.powerStatus), destroy status $($destroyed.data.status), reconciliation $($destroyed.data.inventoryReconciliation.status)."
