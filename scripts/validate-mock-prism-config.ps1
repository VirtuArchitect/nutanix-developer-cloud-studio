param(
  [string]$PrismUrl = $env:NUTANIX_PRISM_CENTRAL_URL,
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

$username = $env:NUTANIX_PRISM_USERNAME
if (-not $username) {
  $username = "mock-prism-user"
}
$password = $env:NUTANIX_PRISM_PASSWORD
if (-not $password) {
  $password = "mock-prism-password"
}

$base = $PrismUrl.TrimEnd("/")
$pair = "{0}:{1}" -f $username, $password
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{
  Authorization = "Basic $basic"
  Accept = "application/json"
  "Content-Type" = "application/json"
}

$health = Invoke-RestMethod -Method Get -Uri "$base/healthz"
if ($health.service -ne "mock-prism-central") {
  throw "Endpoint $base did not identify as mock-prism-central."
}

$body = @{ kind = "mock-prism-validation"; length = 10; offset = 0 } | ConvertTo-Json
$paths = @(
  @{ Name = "clusters"; Path = "/api/nutanix/v3/clusters/list"; Env = "NDC_AHV_ALLOWED_CLUSTER_UUID" },
  @{ Name = "projects"; Path = "/api/nutanix/v3/projects/list"; Env = "NDC_AHV_ALLOWED_PROJECT_UUID" },
  @{ Name = "images"; Path = "/api/nutanix/v3/images/list"; Env = "NDC_AHV_ALLOWED_IMAGE_UUID" },
  @{ Name = "subnets"; Path = "/api/nutanix/v3/subnets/list"; Env = "NDC_AHV_ALLOWED_SUBNET_UUID" },
  @{ Name = "vms"; Path = "/api/nutanix/v3/vms/list"; Env = "" }
)

foreach ($item in $paths) {
  $result = Invoke-RestMethod -Method Post -Uri "$base$($item.Path)" -Headers $headers -Body $body
  if ($null -eq $result.metadata -or $result.metadata.total_matches -lt 0) {
    throw "Mock Prism $($item.Name) list returned an invalid Prism-shaped response."
  }
  if ($item.Env) {
    $expectedUuid = [Environment]::GetEnvironmentVariable($item.Env)
    if ($expectedUuid) {
      $match = @($result.entities | Where-Object { $_.metadata.uuid -eq $expectedUuid })
      if ($match.Count -eq 0) {
        throw "$($item.Env)=$expectedUuid was not present in mock Prism $($item.Name) fixture data."
      }
    }
  }
}

Write-Output "Mock Prism config validation passed for $base. No mutation call was made."

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
