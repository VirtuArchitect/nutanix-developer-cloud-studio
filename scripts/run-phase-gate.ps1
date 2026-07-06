param(
  [Parameter(Mandatory = $true)]
  [string]$TargetPhase,

  [string]$PentestScopePath = "",

  [switch]$IncludeAuthorizedPentest
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Command
  )

  Write-Output ""
  Write-Output "==> $Name"
  & $Command
}

function Invoke-Native {
  param(
    [string]$FilePath,
    [string[]]$Arguments = @()
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Native command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
  }
}

function Assert-PentestScope {
  param([string]$Path)

  if (-not $Path) {
    throw "Pentest scope is required when -IncludeAuthorizedPentest is set."
  }

  if (-not (Test-Path $Path)) {
    throw "Pentest scope file not found: $Path"
  }

  $content = Get-Content -Raw $Path
  $requiredFields = @(
    "Owner:",
    "Approver:",
    "Date approved:",
    "Contact during testing:",
    "Applications:",
    "APIs:",
    "Allowed Test Types",
    "Restrictions"
  )

  foreach ($field in $requiredFields) {
    if ($content -notmatch [regex]::Escape($field)) {
      throw "Pentest scope is missing required field: $field"
    }
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Output "Running phase gate for $TargetPhase"

Invoke-Step "Install check" {
  Invoke-Native "npm.cmd" @("install", "--package-lock-only")
}

Invoke-Step "Dependency audit" {
  Invoke-Native "npm.cmd" @("audit", "--audit-level=moderate")
}

Invoke-Step "Secret scan" {
  $matches = rg -n --hidden -S "(api[_-]?key|secret|token|password|BEGIN (RSA|OPENSSH|PRIVATE)|AKIA|NUTANIX_PASSWORD|NUTANIX_TOKEN)" -g "!node_modules" -g "!dist" -g "!.git"
  $unexpected = $matches | Where-Object {
    $_ -notmatch "\.env\.example" -and
    $_ -notmatch "\.gitignore" -and
    $_ -notmatch "SECURITY_REVIEW\.md" -and
    $_ -notmatch "PENTEST_SCOPE_TEMPLATE\.md" -and
    $_ -notmatch "CODE_REVIEW\.md" -and
    $_ -notmatch "PULL_REQUEST_TEMPLATE" -and
    $_ -notmatch "ISSUE_TEMPLATE" -and
    $_ -notmatch "CHANGELOG\.md" -and
    $_ -notmatch "docs\\" -and
    $_ -notmatch "AGENTS\.md" -and
    $_ -notmatch "package-lock\.json" -and
    $_ -notmatch "src\\App\.tsx" -and
    $_ -notmatch "\.github\\workflows\\pages\.yml" -and
    $_ -notmatch "\.github\\workflows\\phase-gate\.yml" -and
    $_ -notmatch "scripts\\run-phase-gate\.ps1" -and
    $_ -notmatch "scripts\\README\.md"
  }

  if ($unexpected) {
    $unexpected
    throw "Potential secret-like content found outside the allowlist."
  }

  Write-Output "Secret scan passed."
}

Invoke-Step "Automated tests, build, and browser smoke" {
  Invoke-Native "npm.cmd" @("run", "test:all")
}

Invoke-Step "Hosted starter smoke" {
  Invoke-Native "powershell.exe" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\scripts\validate-hosted-starter.ps1")
}

Invoke-Step "On-prem configuration validation" {
  Invoke-Native "powershell.exe" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\scripts\validate-onprem-config.ps1")
}

Invoke-Step "Postgres repository scaffold validation" {
  Invoke-Native "powershell.exe" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\scripts\validate-postgres-repository.ps1")
}

Invoke-Step "Audit export configuration validation" {
  Invoke-Native "powershell.exe" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\scripts\validate-audit-export-config.ps1")
}

Invoke-Step "Provider credential reference validation" {
  Invoke-Native "powershell.exe" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\scripts\validate-provider-credential-references.ps1")
}

Invoke-Step "State backup and restore smoke" {
  Invoke-Native "powershell.exe" @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\scripts\test-state-backup-restore.ps1")
}

if ($IncludeAuthorizedPentest) {
  Invoke-Step "Authorized pentest scope check" {
    Assert-PentestScope -Path $PentestScopePath
    Write-Output "Pentest scope file found and structurally valid."
  }
} else {
  Write-Output ""
  Write-Output "Skipping active pentest gate. Use -IncludeAuthorizedPentest with a completed scope file to enable it."
}

Write-Output ""
Write-Output "Phase gate passed for $TargetPhase"
