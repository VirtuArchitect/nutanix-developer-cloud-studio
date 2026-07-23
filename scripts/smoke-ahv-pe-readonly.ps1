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
$curl = Get-Command curl.exe -ErrorAction SilentlyContinue
if (-not $curl) {
  throw "curl.exe is required for Prism Element read-only smoke on Windows PowerShell."
}

$paths = @(
  "/PrismGateway/services/rest/v2.0/cluster",
  "/PrismGateway/services/rest/v2.0/images",
  "/PrismGateway/services/rest/v2.0/networks",
  "/PrismGateway/services/rest/v2.0/vms"
)

foreach ($path in $paths) {
  $uri = "$baseUri$path"
  $args = @("-sS", "--connect-timeout", "10", "--max-time", "30", "-u", "${username}:${password}", "-H", "Accept: application/json", "-o", "NUL", "-w", "%{http_code}")
  if ([Environment]::GetEnvironmentVariable("NDC_PRISM_TLS_INSECURE") -eq "true") {
    $args = @("-k") + $args
  }
  $statusCode = & $curl.Source @args $uri
  if ($LASTEXITCODE -ne 0) {
    throw "Read-only Prism Element check failed for $path. curl exit code $LASTEXITCODE."
  }
  if ($statusCode -ne "200") {
    throw "Read-only Prism Element check failed for $path. HTTP $statusCode."
  }
  Write-Output "Read-only Prism Element check passed: $path"
}

Write-Output "Prism Element read-only smoke passed. No create, power, or destroy call was made."
