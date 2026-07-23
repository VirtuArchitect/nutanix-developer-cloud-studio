$ErrorActionPreference = "Stop"

$provider = [Environment]::GetEnvironmentVariable("NDC_AHV_LAB_PROVIDER")
if (-not $provider) {
  $provider = "prism-central"
}

if ($provider -notin @("prism-central", "prism-element")) {
  throw "NDC_AHV_LAB_PROVIDER must be prism-central or prism-element."
}

if ($provider -eq "prism-element") {
  $required = @(
    "NUTANIX_PRISM_ELEMENT_URL",
    "NUTANIX_PRISM_ELEMENT_USERNAME",
    "NUTANIX_PRISM_ELEMENT_PASSWORD",
    "NDC_AHV_PE_ALLOWED_CLUSTER_UUID",
    "NDC_AHV_PE_ALLOWED_SUBNET_UUID",
    "NDC_AHV_PE_ALLOWED_IMAGE_UUID"
  )
} else {
  $required = @(
    "NUTANIX_PRISM_CENTRAL_URL",
    "NUTANIX_PRISM_USERNAME",
    "NUTANIX_PRISM_PASSWORD",
    "NDC_AHV_ALLOWED_CLUSTER_UUID",
    "NDC_AHV_ALLOWED_PROJECT_UUID",
    "NDC_AHV_ALLOWED_SUBNET_UUID",
    "NDC_AHV_ALLOWED_IMAGE_UUID"
  )
}

$missing = @($required | Where-Object { -not [Environment]::GetEnvironmentVariable($_) })
if ($missing.Count -gt 0) {
  throw "Missing AHV lab configuration: $($missing -join ', ')"
}

$prefix = [Environment]::GetEnvironmentVariable("NDC_AHV_VM_NAME_PREFIX")
if (-not $prefix) {
  $prefix = "ndc-lab-"
}

if ($prefix -notmatch "^ndc-lab-") {
  throw "NDC_AHV_VM_NAME_PREFIX must start with ndc-lab-."
}

if ($prefix -match "prod|production") {
  throw "NDC_AHV_VM_NAME_PREFIX must not contain production-like text."
}

if ([Environment]::GetEnvironmentVariable("NDC_PRISM_TLS_INSECURE") -eq "true" -and [Environment]::GetEnvironmentVariable("APP_ENV") -ne "lab") {
  throw "NDC_PRISM_TLS_INSECURE=true is allowed only with APP_ENV=lab."
}

if ([Environment]::GetEnvironmentVariable("NDC_AHV_LAB_LIFECYCLE_ENABLED") -eq "true") {
  if ([Environment]::GetEnvironmentVariable("APP_ENV") -ne "lab" -or
      [Environment]::GetEnvironmentVariable("NDC_AHV_REAL_ADAPTER_ENABLED") -ne "true" -or
      [Environment]::GetEnvironmentVariable("NDC_CONTROLLED_PROVISIONING_ENABLED") -ne "true") {
    throw "AHV lab lifecycle requires APP_ENV=lab, NDC_AHV_REAL_ADAPTER_ENABLED=true, and NDC_CONTROLLED_PROVISIONING_ENABLED=true."
  }

  if ($provider -eq "prism-element" -and [Environment]::GetEnvironmentVariable("NDC_AHV_PE_LAB_ADAPTER_ENABLED") -ne "true") {
    throw "Prism Element lab lifecycle requires NDC_AHV_PE_LAB_ADAPTER_ENABLED=true."
  }
}

Write-Output "AHV lab configuration validation passed for $provider. No Prism mutation call was made."
