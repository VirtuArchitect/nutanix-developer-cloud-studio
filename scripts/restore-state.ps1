param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,

  [string]$DataFile = ".data\ndc-studio.json"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
  throw "Backup file not found: $BackupFile"
}

$raw = Get-Content -Raw -LiteralPath $BackupFile
$parsed = $raw | ConvertFrom-Json
if (-not $parsed.templates -or -not $parsed.environments -or -not $parsed.auditEvents) {
  throw "Backup file does not look like an NDC Studio state file."
}

$dataDirectory = Split-Path -Parent $DataFile
if ($dataDirectory) {
  New-Item -ItemType Directory -Force -Path $dataDirectory | Out-Null
}

Copy-Item -LiteralPath $BackupFile -Destination $DataFile -Force
Write-Output "State restored to: $DataFile"
