param(
  [string]$EnvFile = ".env.lab",
  [switch]$SkipReadOnlySmoke
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = if ([IO.Path]::IsPathRooted($EnvFile)) { $EnvFile } else { Join-Path $repoRoot $EnvFile }

if (-not (Test-Path $envPath)) {
  throw "Lab env file not found: $envPath. Create it from .env.lab.example or run scripts/new-ahv-lab-env.ps1."
}

Get-Content -LiteralPath $envPath | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) {
    return
  }
  $separator = $line.IndexOf("=")
  if ($separator -lt 1) {
    return
  }
  $name = $line.Substring(0, $separator).Trim()
  $value = $line.Substring($separator + 1)
  [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

Push-Location $repoRoot
try {
  npm.cmd run validate:ahv-lab-config

  if (-not $SkipReadOnlySmoke) {
    $provider = [Environment]::GetEnvironmentVariable("NDC_AHV_LAB_PROVIDER")
    if ($provider -eq "prism-element") {
      npm.cmd run smoke:ahv-pe-readonly
    } else {
      npm.cmd run smoke:ahv-lab-readonly
    }
  }

  Write-Output "AHV lab readiness validation completed. No lifecycle mutation was requested."
} finally {
  Pop-Location
}
