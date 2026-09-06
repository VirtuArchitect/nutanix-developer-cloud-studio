param(
  [switch]$AllowPoweredOnSourceVm
)

$ErrorActionPreference = "Stop"

if ($env:APP_ENV -ne "lab") {
  throw "APP_ENV=lab is required for live AHV scope validation."
}

if (-not $env:NUTANIX_PRISM_CENTRAL_URL -or -not $env:NUTANIX_PRISM_USERNAME -or -not $env:NUTANIX_PRISM_PASSWORD) {
  throw "NUTANIX_PRISM_CENTRAL_URL, NUTANIX_PRISM_USERNAME, and NUTANIX_PRISM_PASSWORD are required."
}

if (-not $env:NDC_AHV_ALLOWED_CLUSTER_UUID -or -not $env:NDC_AHV_ALLOWED_SUBNET_UUID) {
  throw "NDC_AHV_ALLOWED_CLUSTER_UUID and NDC_AHV_ALLOWED_SUBNET_UUID are required."
}

if (-not $env:NDC_AHV_ALLOWED_IMAGE_UUID -and -not $env:NDC_AHV_ALLOWED_SOURCE_VM_UUID) {
  throw "Either NDC_AHV_ALLOWED_IMAGE_UUID or NDC_AHV_ALLOWED_SOURCE_VM_UUID is required."
}

if ($env:NDC_PRISM_TLS_INSECURE -eq "true" -and $env:APP_ENV -ne "lab") {
  throw "NDC_PRISM_TLS_INSECURE=true is allowed only when APP_ENV=lab."
}

if ($env:NDC_PRISM_TLS_INSECURE -eq "true") {
  [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$base = $env:NUTANIX_PRISM_CENTRAL_URL.TrimEnd("/")
$pair = "{0}:{1}" -f $env:NUTANIX_PRISM_USERNAME, $env:NUTANIX_PRISM_PASSWORD
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{
  Authorization = "Basic $basic"
  Accept = "application/json"
  "Content-Type" = "application/json"
}

function Invoke-PcList([string]$Path, [string]$Kind, [int]$Length = 100) {
  Invoke-RestMethod -Method Post -Uri "$base$Path" -Headers $headers -Body (@{ kind = $Kind; length = $Length; offset = 0 } | ConvertTo-Json)
}

function Find-EntityByUuid($Response, [string]$Uuid) {
  @($Response.entities) | Where-Object { $_.metadata.uuid -eq $Uuid } | Select-Object -First 1
}

function Read-EntityName($Entity) {
  if ($Entity.status.name) {
    return $Entity.status.name
  }
  if ($Entity.spec.name) {
    return $Entity.spec.name
  }
  if ($Entity.metadata.name) {
    return $Entity.metadata.name
  }
  return "unnamed"
}

$clusters = Invoke-PcList "/api/nutanix/v3/clusters/list" "cluster"
$subnets = Invoke-PcList "/api/nutanix/v3/subnets/list" "subnet"
$images = Invoke-PcList "/api/nutanix/v3/images/list" "image"
$vms = Invoke-PcList "/api/nutanix/v3/vms/list" "vm"
$projects = Invoke-PcList "/api/nutanix/v3/projects/list" "project"

$cluster = Find-EntityByUuid $clusters $env:NDC_AHV_ALLOWED_CLUSTER_UUID
$subnet = Find-EntityByUuid $subnets $env:NDC_AHV_ALLOWED_SUBNET_UUID
$image = if ($env:NDC_AHV_ALLOWED_IMAGE_UUID) { Find-EntityByUuid $images $env:NDC_AHV_ALLOWED_IMAGE_UUID } else { $null }
$sourceVm = if ($env:NDC_AHV_ALLOWED_SOURCE_VM_UUID) { Find-EntityByUuid $vms $env:NDC_AHV_ALLOWED_SOURCE_VM_UUID } else { $null }
$project = if ($env:NDC_AHV_ALLOWED_PROJECT_UUID) { Find-EntityByUuid $projects $env:NDC_AHV_ALLOWED_PROJECT_UUID } else { $null }

if (-not $cluster) {
  throw "Allowed cluster UUID was not found in Prism Central read-only inventory."
}
if (-not $subnet) {
  throw "Allowed subnet UUID was not found in Prism Central read-only inventory."
}
if ($env:NDC_AHV_ALLOWED_IMAGE_UUID -and -not $image) {
  throw "Allowed image UUID was not found in Prism Central read-only inventory."
}
if ($env:NDC_AHV_ALLOWED_SOURCE_VM_UUID -and -not $sourceVm) {
  throw "Allowed source VM UUID was not found in Prism Central read-only inventory."
}
if ($env:NDC_AHV_ALLOWED_PROJECT_UUID -and -not $project) {
  throw "Allowed project UUID was not found in Prism Central read-only inventory."
}

if ($sourceVm) {
  $powerState = $sourceVm.status.resources.power_state
  if ($powerState -ne "OFF" -and -not $AllowPoweredOnSourceVm) {
    throw "Allowed source VM '$((Read-EntityName $sourceVm))' is $powerState. Power it off or rerun with -AllowPoweredOnSourceVm after explicit lab approval."
  }
}

Write-Output "Live Prism Central scope validation passed. No create, clone, power, or delete call was made."
Write-Output "Cluster: $(Read-EntityName $cluster) | $($cluster.metadata.uuid)"
Write-Output "Subnet: $(Read-EntityName $subnet) | $($subnet.metadata.uuid)"
if ($project) {
  Write-Output "Project: $(Read-EntityName $project) | $($project.metadata.uuid)"
} elseif ($env:NDC_AHV_ALLOWED_SOURCE_VM_UUID) {
  Write-Output "Project: not configured; source VM clone labs may proceed without PC project scope."
}
if ($image) {
  Write-Output "Image: $(Read-EntityName $image) | $($image.metadata.uuid)"
}
if ($sourceVm) {
  Write-Output "Source VM: $(Read-EntityName $sourceVm) | $($sourceVm.metadata.uuid) | power=$($sourceVm.status.resources.power_state)"
}
