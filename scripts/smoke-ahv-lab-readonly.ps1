$ErrorActionPreference = "Stop"

if (-not $env:NUTANIX_PRISM_CENTRAL_URL -or -not $env:NUTANIX_PRISM_USERNAME -or -not $env:NUTANIX_PRISM_PASSWORD) {
  throw "NUTANIX_PRISM_CENTRAL_URL, NUTANIX_PRISM_USERNAME, and NUTANIX_PRISM_PASSWORD are required."
}

if ($env:NDC_PRISM_TLS_INSECURE -eq "true") {
  if ($env:APP_ENV -ne "lab") {
    throw "NDC_PRISM_TLS_INSECURE=true is allowed only when APP_ENV=lab."
  }

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

$checks = @(
  @{ Path = "/api/nutanix/v3/clusters/list"; Kind = "cluster"; Label = "clusters"; Required = $true },
  @{ Path = "/api/nutanix/v3/projects/list"; Kind = "project"; Label = "projects"; Required = $true },
  @{ Path = "/api/nutanix/v3/images/list"; Kind = "image"; Label = "images"; Required = $true },
  @{ Path = "/api/nutanix/v3/subnets/list"; Kind = "subnet"; Label = "subnets"; Required = $true },
  @{ Path = "/api/nutanix/v3/vms/list"; Kind = "vm"; Label = "VMs"; Required = $true },
  @{ Path = "/api/nutanix/v3/categories/list"; Kind = "category"; Label = "categories"; Required = $false }
)

foreach ($check in $checks) {
  $uri = "$base$($check.Path)"
  $body = @{ kind = $check.Kind; length = 1; offset = 0 } | ConvertTo-Json

  try {
    $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ErrorAction Stop
    $count = if ($null -ne $response.metadata -and $null -ne $response.metadata.total_matches) { $response.metadata.total_matches } else { "unknown" }
    Write-Output "Read-only Prism Central check passed: $($check.Label) ($count total matches)."
  } catch {
    if ($check.Required) {
      throw
    }

    Write-Output "Optional read-only Prism Central check skipped or unsupported: $($check.Label)."
  }
}

Write-Output "AHV lab read-only smoke passed. No create, power, or delete call was made."
