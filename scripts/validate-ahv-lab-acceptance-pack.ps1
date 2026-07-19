$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$requiredFiles = @(
  "docs/ahv-lab-lifecycle.md",
  "docs/ahv-lab-acceptance-pack.md",
  "docs/ahv-lab-acceptance-report-template.md",
  ".env.lab.example",
  "docker-compose.lab.yml",
  "scripts/validate-ahv-lab-config.ps1",
  "scripts/smoke-ahv-lab-readonly.ps1",
  "scripts/smoke-ahv-lab-lifecycle.ps1"
)

$missingFiles = @()
foreach ($relativePath in $requiredFiles) {
  $path = Join-Path $repoRoot $relativePath
  if (-not (Test-Path -LiteralPath $path)) {
    $missingFiles += $relativePath
  }
}

if ($missingFiles.Count -gt 0) {
  throw "AHV lab acceptance pack is missing required files: $($missingFiles -join ', ')"
}

$envExample = Get-Content -LiteralPath (Join-Path $repoRoot ".env.lab.example") -Raw
$requiredDisabledDefaults = @(
  "NDC_AHV_REAL_ADAPTER_ENABLED=false",
  "NDC_CONTROLLED_PROVISIONING_ENABLED=false",
  "NDC_AHV_LAB_LIFECYCLE_ENABLED=false"
)

$missingDisabledDefaults = @($requiredDisabledDefaults | Where-Object { $envExample -notmatch [regex]::Escape($_) })
if ($missingDisabledDefaults.Count -gt 0) {
  throw ".env.lab.example must keep AHV lifecycle switches disabled by default: $($missingDisabledDefaults -join ', ')"
}

$acceptancePack = Get-Content -LiteralPath (Join-Path $repoRoot "docs/ahv-lab-acceptance-pack.md") -Raw
$requiredAcceptanceText = @(
  'authorized Prism Central test environment',
  'ndc-lab-*',
  'Inventory reconciliation',
  'Do not commit `.env.lab`',
  'No-go'
)

$missingAcceptanceText = @($requiredAcceptanceText | Where-Object { $acceptancePack -notmatch [regex]::Escape($_) })
if ($missingAcceptanceText.Count -gt 0) {
  throw "Acceptance pack is missing required acceptance language: $($missingAcceptanceText -join ', ')"
}

$reportTemplate = Get-Content -LiteralPath (Join-Path $repoRoot "docs/ahv-lab-acceptance-report-template.md") -Raw
$requiredReportSections = @(
  "Authorization",
  "Configuration",
  "Lifecycle Evidence",
  "Audit And Redaction",
  "Decision"
)

$missingReportSections = @($requiredReportSections | Where-Object { $reportTemplate -notmatch [regex]::Escape($_) })
if ($missingReportSections.Count -gt 0) {
  throw "Acceptance report template is missing required sections: $($missingReportSections -join ', ')"
}

Write-Output "AHV lab acceptance pack validation passed. No Prism call was made."
