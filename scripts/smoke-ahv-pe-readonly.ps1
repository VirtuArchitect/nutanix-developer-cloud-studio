$ErrorActionPreference = "Stop"

$endpoint = [Environment]::GetEnvironmentVariable("NUTANIX_PRISM_ELEMENT_URL")
$username = [Environment]::GetEnvironmentVariable("NUTANIX_PRISM_ELEMENT_USERNAME")
$password = [Environment]::GetEnvironmentVariable("NUTANIX_PRISM_ELEMENT_PASSWORD")

if (-not $endpoint -or -not $username -or -not $password) {
  throw "NUTANIX_PRISM_ELEMENT_URL, NUTANIX_PRISM_ELEMENT_USERNAME, and NUTANIX_PRISM_ELEMENT_PASSWORD are required."
}

if ([Environment]::GetEnvironmentVariable("APP_ENV") -ne "lab") {
  throw "APP_ENV=lab is required for Prism Element read-only smoke."
}

if ([Environment]::GetEnvironmentVariable("NDC_AHV_LAB_PROVIDER") -ne "prism-element") {
  throw "NDC_AHV_LAB_PROVIDER=prism-element is required for Prism Element read-only smoke."
}

if ([Environment]::GetEnvironmentVariable("NDC_PRISM_TLS_INSECURE") -eq "true") {
  [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

$baseUri = $endpoint.TrimEnd("/")
$pair = "{0}:{1}" -f $username, $password
$encoded = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{
  Authorization = "Basic $encoded"
  Accept = "application/json"
}

$paths = @(
  "/PrismGateway/services/rest/v2.0/cluster",
  "/PrismGateway/services/rest/v2.0/images",
  "/PrismGateway/services/rest/v2.0/networks",
  "/PrismGateway/services/rest/v2.0/vms"
)

foreach ($path in $paths) {
  $uri = "$baseUri$path"
  Invoke-RestMethod -Method Get -Uri $uri -Headers $headers -TimeoutSec 30 | Out-Null
  Write-Output "Read-only Prism Element check passed: $path"
}

Write-Output "Prism Element read-only smoke passed. No create, power, or destroy call was made."
