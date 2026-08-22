$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

$requiredFiles = @(
  "docs/pe-pc-validation-rings.md",
  "docs/ahv-lab-lifecycle.md",
  "docs/ahv-lab-acceptance-pack.md",
  "docs/prism-element-lab-adapter.md",
  "docs/real-infrastructure-testing.md",
  "scripts/smoke-ahv-pe-readonly.ps1",
  "scripts/smoke-ahv-lab-readonly.ps1",
  "scripts/smoke-ahv-lab-lifecycle.ps1",
  "scripts/smoke-mock-prism-lifecycle.ps1"
)

$missingFiles = @()
foreach ($relativePath in $requiredFiles) {
  if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $relativePath))) {
    $missingFiles += $relativePath
  }
}

if ($missingFiles.Count -gt 0) {
  throw "PE/PC validation pack is missing required files: $($missingFiles -join ', ')"
}

$guide = Get-Content -LiteralPath (Join-Path $repoRoot "docs/pe-pc-validation-rings.md") -Raw
$requiredGuideText = @(
  "Ring 0",
  "Ring 1",
  "Ring 2",
  "Ring 3",
  "Ring 4",
  "Prism Element",
  "Prism Central",
  "read-only",
  "ndc-lab-*",
  "Platform Admin",
  "Do not run lifecycle",
  "passwords, tokens, Authorization headers"
)

$missingGuideText = @($requiredGuideText | Where-Object { $guide -notmatch [regex]::Escape($_) })
if ($missingGuideText.Count -gt 0) {
  throw "PE/PC validation guide is missing required safety or coverage language: $($missingGuideText -join ', ')"
}

$packageJson = Get-Content -LiteralPath (Join-Path $repoRoot "package.json") -Raw
$requiredScripts = @(
  '"validate:ahv-lab-config"',
  '"smoke:ahv-pe-readonly"',
  '"smoke:ahv-lab-readonly"',
  '"smoke:mock-prism-lifecycle"',
  '"smoke:ahv-lab-lifecycle"'
)

$missingScripts = @($requiredScripts | Where-Object { $packageJson -notmatch [regex]::Escape($_) })
if ($missingScripts.Count -gt 0) {
  throw "package.json is missing required PE/PC validation scripts: $($missingScripts -join ', ')"
}

$peSmoke = Get-Content -LiteralPath (Join-Path $repoRoot "scripts/smoke-ahv-pe-readonly.ps1") -Raw
$blockedPeCommandPatterns = @(
  'Method\s+Delete',
  'Method\s+Post',
  'Method\s+Put',
  'Method\s+Patch',
  'PrismGateway/services/rest/v2\.0/vms/[^"`'']+',
  '/set_power_state',
  '/power'
)

foreach ($pattern in $blockedPeCommandPatterns) {
  if ($peSmoke -match $pattern) {
    throw "PE read-only smoke contains mutation-looking command pattern: $pattern"
  }
}

Write-Output "PE/PC validation pack passed. No Prism call was made."
