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
  Invoke-RestMethod -Method Post -Uri "$BaseUrl$Path" -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10)
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
$polled = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/poll"
Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/power" @{ powerState = "OFF" } | Out-Null
$destroyed = Invoke-NdcPost "/api/ahv/controlled-provisioning/runs/$($run.data.id)/destroy"

Write-Output "AHV lab lifecycle smoke submitted create task $($run.data.prismTaskUuid), polled status $($polled.data.status), and destroy status $($destroyed.data.status)."
