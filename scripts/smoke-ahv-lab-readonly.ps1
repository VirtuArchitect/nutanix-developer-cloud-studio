$ErrorActionPreference = "Stop"

if (-not $env:NUTANIX_PRISM_CENTRAL_URL -or -not $env:NUTANIX_PRISM_USERNAME -or -not $env:NUTANIX_PRISM_PASSWORD) {
  throw "NUTANIX_PRISM_CENTRAL_URL, NUTANIX_PRISM_USERNAME, and NUTANIX_PRISM_PASSWORD are required."
}

$base = $env:NUTANIX_PRISM_CENTRAL_URL.TrimEnd("/")
$pair = "{0}:{1}" -f $env:NUTANIX_PRISM_USERNAME, $env:NUTANIX_PRISM_PASSWORD
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{
  Authorization = "Basic $basic"
  Accept = "application/json"
  "Content-Type" = "application/json"
}

$body = @{ kind = "readonly-smoke"; length = 1; offset = 0 } | ConvertTo-Json
$paths = @(
  "/api/nutanix/v3/clusters/list",
  "/api/nutanix/v3/projects/list",
  "/api/nutanix/v3/images/list",
  "/api/nutanix/v3/subnets/list"
)

foreach ($path in $paths) {
  $uri = "$base$path"
  Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body | Out-Null
}

Write-Output "AHV lab read-only smoke passed. No create, power, or delete call was made."
